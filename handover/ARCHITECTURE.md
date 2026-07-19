# ARCHITECTURE.md

## Overview

A modular, config-driven e-commerce platform for the Singapore market. Built with Next.js App Router — pages and API routes live in the same codebase. No separate backend service.

---

## Request Flow

```
Browser
  ↓
Vercel (hosting)
  ↓
Next.js App Router
  ↓  
  ├── Page (app/**/page.tsx)        ← Server Component, fetches data via Prisma directly
  │     ↓
  │   Prisma Client (lib/prisma.ts)
  │     ↓
  │   Neon PostgreSQL (database)
  │
  └── API Route (app/api/**/route.ts) ← Called by client components via fetch()
        ↓
      Auth check via Clerk
        ↓
      Prisma Client (lib/prisma.ts)
        ↓
      Neon PostgreSQL (database)
```

---

## Key Architectural Decisions

### Server vs Client Components
- **Admin list pages** (product list, product type list) → Server Components — fetch data directly with Prisma, no API call needed
- **Admin form pages** (new/edit product, new/edit product type, new/edit category) → Client Components (`'use client'`) — need React state for dynamic form behavior
- **Admin row-level actions** (archive/unarchive, delete, with a confirm dialog) → small standalone Client Components (e.g. `ProductActions.tsx`, `CategoryActions.tsx`) rather than making the whole list page a Client Component — same pattern established by `OrderStatusActions.tsx` in Phase 5
- **API routes** → handle all mutations (POST, PUT, PATCH, DELETE) and are called by client components via `fetch()`

### Database Connection (Prisma 7)
Prisma 7 uses an adapter pattern instead of a URL in the schema:

```
prisma.config.ts          → tells Prisma CLI where schema + migrations live, provides DB URL for migrations
lib/prisma.ts             → runtime singleton using PrismaPg adapter, reads DATABASE_URL at runtime
app/generated/prisma/     → generated client, committed to repo (needed for Vercel builds)
```

The `datasource db` block in `schema.prisma` has NO `url` field — this is intentional for Prisma 7.

### Dynamic Product System
Products are schema-flexible using JSON columns:

```
ProductType    → defines the template (what fields a product type has)
ProductField   → individual field definitions per type (label, key, type, options)
Product        → a specific product, stores type-specific data in `attributes` JSON column
ProductVariant → each sellable combination (Size+Color etc.) with its own price/stock
```

This means new product types (Coffee Beans, Artwork, 3D Printers) can be created by admins with zero code changes.

### Admin Edit / Delete / Archive Pattern (added 2026-07-17)
Full edit capability was added this session for all three core admin entities, with different levels of restriction depending on how much other data structurally depends on each one:

- **Category** — fully editable; supports real hard delete. Nothing else has a required dependency on a Category, so deletion is unrestricted (`CategoryProduct` cascades cleanly, only unassigning products).
- **Product** — fully editable except `productTypeId` and `slug`, both locked after creation (see below). Uses **archive, not hard delete** (`Product.archived`) — modeled on Shopify's own product-deletion behavior, confirmed via research rather than assumed. Every customer-facing product query must explicitly filter `archived: false`; this is not a global default.
- **ProductType** — editable, but its `ProductField` children have `key` and `type` locked once created, and a field cannot be removed while any product still holds real data in it. No delete or type-reassignment feature exists for `ProductType` itself, by deliberate decision — see DATABASE_SCHEMA.md and DECISIONS.md.

**General principle applied across all three:** where an incorrect edit could silently corrupt or orphan real data (a slug used in a bookmarked URL, an `attributes` key a field no longer matches, a product's entire type shape), the field is locked outright rather than validated after the fact. Where the risk is about losing a whole record (deleting a Product with real order history behind it), the safer action (archive) is offered instead of the destructive one. Where there's no real risk (Category), the simpler action (hard delete) is used without extra ceremony.

### Public Storefront Pages
`/`, `/category/[slug]`, `/product/[slug]`, and `/search` are unauthenticated Server Components — no Clerk auth guard, consistent with the "Server Components fetch via Prisma directly" convention. No API routes back these pages for rendering; nothing is mutated, only read. `/api/search/suggestions` is the one exception on this surface — a small API route exists there because a live-typing dropdown needs to be triggered from a Client Component (`SearchBar.tsx`), which can't call Prisma directly.

- **Dynamic route params** (`params`) and **query strings** (`searchParams`) are both async (`Promise`) in Next.js 15 App Router — both must be `await`ed before use, in both the page component and `generateMetadata`.
- **404 handling**: unknown slugs call `notFound()` from `next/navigation` rather than manually rendering an error state. An archived product's slug is treated identically to an unknown one — `notFound()` either way (added 2026-07-17).
- **Category page sort/filter**: read from `searchParams`, applied in-memory after the Prisma fetch (dataset per category is small), submitted via a plain `<form method="GET">` — no client-side state, page reload on Apply. `/search`'s results page follows the same plain-GET-form convention (submitted from the header's `SearchBar`).
- **Homepage sections** are hardcoded (no `HomepageSection` DB model) — see DECISIONS.md.
- **Image fallback chain**: `ProductVariant.imageUrl` (if the selected variant has one) → `Product.imageUrl` → blank. Handled client-side in `ProductGallery.tsx`, since it depends on which variant is selected.
- **Shared `ProductCard`** (`app/components/ProductCard.tsx`, added 2026-07-17): extracted from the category page and `FeaturedProducts` once `/search` needed the same card a third time. Accepts a `headingLevel` prop (`h2`/`h3`) so each page keeps correct heading hierarchy relative to its own page title, and a `showOutOfStockBadge` prop (on for category/search, off for the homepage) to preserve each page's existing behavior exactly.
- **Search** (`app/search/page.tsx`, added 2026-07-17): Prisma `contains`/`mode: insensitive` match against `Product.name`/`description`. No typo tolerance — Meilisearch was evaluated and deliberately not adopted; see DECISIONS.md. `SearchBar.tsx` (Client Component, in the Header) adds a debounced (300ms) live-suggestion dropdown on top of the plain-GET-form full search, calling `/api/search/suggestions` for a capped top-6 list with image/name/category/price.

Clerk handles identity (email, password, sessions). Your database stores a `User` row linked by `clerkId` for app-specific data (role, addresses). The Clerk webhook creates this row on signup.

Role check pattern used in every admin API route:
```ts
const { userId } = await auth()
const user = await prisma.user.findUnique({ where: { clerkId: userId } })
if (!user || user.role !== 'ADMIN') return 403
```

---

## Folder Structure

```
ecommerce-platform/
├── app/
│   ├── layout.tsx                        ← Root layout, ClerkProvider wrapper
│   ├── page.tsx                          ← Homepage — composes 4 sections (Phase 3)
│   ├── sign-in/[[...sign-in]]/page.tsx   ← Clerk sign-in page
│   ├── sign-up/[[...sign-up]]/page.tsx   ← Clerk sign-up page
│   │
│   ├── search/
│   │   └── page.tsx                      ← Public search results page (Server Component, plain GET ?q=)
│   │
│   ├── category/
│   │   └── [slug]/page.tsx               ← Public category page — grid, sort, filter, back button (archived products excluded)
│   │
│   ├── product/
│   │   └── [slug]/
│   │       ├── page.tsx                  ← Public product page — spec table, back button (404s if archived)
│   │       └── ProductGallery.tsx        ← Client Component — image swap + variant selector + price/stock
│   │
│   ├── checkout/
│   │   └── success/page.tsx              ← Order confirmation page; authenticated full detail view, plus a verified read-only cosmetic view for unauthenticated visitors (added 2026-07-17, see DECISIONS.md)
│   │
│   ├── components/                       ← Shared UI, nested under app/ (no top-level components/ folder)
│   │   ├── BackButton.tsx                ← Shared Client Component (router.back())
│   │   ├── Header.tsx                    ← Site header — cart, auth UI, and (added 2026-07-17) SearchBar
│   │   ├── SearchBar.tsx                 ← Client Component (added 2026-07-17) — debounced live-suggestion search dropdown
│   │   ├── ProductCard.tsx               ← Shared product-card component (added 2026-07-17), used by category page, FeaturedProducts, and /search
│   │   └── homepage/
│   │       ├── HeroBanner.tsx            ← Static content (hardcoded, no DB yet)
│   │       ├── FeaturedProducts.tsx      ← Server Component, latest 4 products (archived excluded)
│   │       ├── CategoryGrid.tsx          ← Server Component, all categories
│   │       └── Newsletter.tsx            ← Client Component (non-functional form)
│   │
│   ├── admin/                            ← Admin panel (role-protected)
│   │   ├── layout.tsx                    ← Admin layout + auth guard
│   │   ├── page.tsx                      ← Admin dashboard home
│   │   ├── product-types/
│   │   │   ├── page.tsx                  ← List all product types
│   │   │   ├── new/page.tsx              ← Create product type form
│   │   │   └── [id]/edit/page.tsx        ← Edit product type form (added 2026-07-17) — key/type locked on existing fields
│   │   ├── products/
│   │   │   ├── page.tsx                  ← List all products (archive badge + action, added 2026-07-17)
│   │   │   ├── new/page.tsx              ← Create product form (dynamic, incl. per-product and per-variant image URL)
│   │   │   ├── ProductActions.tsx        ← Client Component (added 2026-07-17) — archive/unarchive button with confirm
│   │   │   └── [id]/edit/page.tsx        ← Edit product form (added 2026-07-17) — productTypeId/slug locked, non-destructive variant merge
│   │   ├── categories/
│   │   │   ├── page.tsx                  ← List all categories (delete action, added 2026-07-17)
│   │   │   ├── new/page.tsx              ← Create category form
│   │   │   ├── CategoryActions.tsx       ← Client Component (added 2026-07-17) — delete button with confirm
│   │   │   └── [id]/edit/page.tsx        ← Edit category form (added 2026-07-17) — slug locked
│   │   └── orders/                       ← Order list/detail, fulfillment status, refund, tracking (Phase 5)
│   │
│   ├── api/
│   │   ├── webhooks/
│   │   │   ├── clerk/route.ts            ← Clerk user.created webhook
│   │   │   └── hitpay/route.ts           ← HitPay payment webhook (Phase 4)
│   │   ├── search/
│   │   │   └── suggestions/route.ts      ← Live search-dropdown API (added 2026-07-17) — top 6, archived excluded
│   │   └── admin/
│   │       ├── product-types/
│   │       │   ├── route.ts              ← GET + POST product types
│   │       │   └── [id]/route.ts         ← GET + PUT (added 2026-07-17) — key/type immutable, in-use field-removal guard
│   │       ├── products/
│   │       │   ├── route.ts              ← GET + POST products (incl. imageUrl on product + variants)
│   │       │   └── [id]/
│   │       │       ├── route.ts          ← GET + PUT (added 2026-07-17) — productTypeId/slug locked, variant create/update/delete diffing
│   │       │       └── archive/route.ts  ← PATCH (added 2026-07-17) — toggles Product.archived only
│   │       └── categories/
│   │           ├── route.ts              ← GET + POST categories
│   │           └── [id]/route.ts         ← GET + PUT + DELETE (added 2026-07-17)
│   │
│   └── generated/
│       └── prisma/                       ← Prisma 7 generated client (committed to repo)
│
├── lib/
│   └── prisma.ts                         ← Prisma singleton (PrismaPg adapter)
│
├── prisma/
│   ├── schema.prisma                     ← Database schema
│   ├── migrations/                       ← Migration history
│   └── seed.ts                           ← (To be built) Seed script
│
├── prisma.config.ts                      ← Prisma 7 config (schema path, DB URL for CLI)
├── next.config.ts                        ← Next.js config (allowedDevOrigins for ngrok)
├── .env                                  ← Local secrets (never committed)
├── .env.example                          ← Template for required env vars
└── .gitattributes                        ← LF line endings enforced
```

---

## Environment Variables Required

```
# Database
DATABASE_URL=

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
CLERK_WEBHOOK_SECRET=
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up

# HitPay (Phase 4)
HITPAY_API_KEY=
HITPAY_WEBHOOK_SALT=
HITPAY_API_BASE_URL=

# GST (Phase 4)
GST_RATE_PERCENT=9
GST_REGISTRATION_NUMBER=

# App URL (Phase 4+) — build-time-baked, requires a redeploy after any change
NEXT_PUBLIC_APP_URL=https://biggyballs69.gay

# Fulfillment fees (Phase 5)
SHIPPING_FEE_SGD=
SELF_COLLECTION_FEE_SGD=

# Email (Phase 4/5, Resend + React Email)
RESEND_API_KEY=
RESEND_FROM_EMAIL=

# Background reconciliation cron (Phase 4/5)
CRON_SECRET=
```
*(List expanded 2026-07-17 to include several vars that were added in earlier sessions — Sessions 6–9 — but had never been synced into this document. `NEXT_PUBLIC_APP_URL` is called out specifically since it's now load-bearing for the custom domain and is easy to update in the wrong place — see DECISIONS.md and CURRENT_STATE.md.)*

---

## External Services

| Service | Purpose | Environment |
|---|---|---|
| Neon | PostgreSQL database | Dev branch + Prod branch |
| Clerk | Authentication | Dev instance + Prod instance |
| Vercel | Hosting + CI/CD | Auto-deploy from GitHub main branch; custom domain `biggyballs69.gay` live as of 2026-07-17 |
| Cloudflare | DNS host for `biggyballs69.gay` | Nameservers unchanged; one DNS-only `A` record added for Vercel, existing Resend email DNS records untouched |
| ngrok | Local webhook tunnel for Clerk/HitPay testing | Local dev only |
| HitPay | Payment processing (Phase 4) | Sandbox + Live |
| Resend | Transactional email (Phase 4/5) | Sending domain `biggyballs69.gay`, verified |
| cron-job.org | Triggers `/api/cron/reconcile-orders` every 5 minutes | Production only |

**Note (2026-07-17):** Meilisearch was evaluated for Phase 6 search (both Cloud/hosted and self-hosted options) but deliberately not adopted — typo tolerance was confirmed not required, so plain Prisma/Postgres search was judged sufficient with no added infrastructure. Not listed as an external service since none is in use. See DECISIONS.md and ROADMAP.md.