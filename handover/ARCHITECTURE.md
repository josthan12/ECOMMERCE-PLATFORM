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

## Design System (added 2026-07-22)

The entire storefront and admin panel were re-skinned this session against
three custom documents supplied by the admin — **VISION.md**,
**DESIGN_SYSTEM.md**, and **UI_PATTERNS.md** — defining a brand called
"PokeSunshineTCG": premium, restrained, collector-focused, explicitly
**not** gaming-themed, gimmicky, or over-decorated. These three docs are
**not currently part of the `/mnt/project` doc set** — confirm whether
they've been saved into the real project (recommended location:
`docs/design/`) before assuming they're available in a future session.

### Tokens
Tailwind v4 (CSS-first config — there is **no** `tailwind.config.ts`).
All design tokens are CSS custom properties in `app/globals.css`'s
`:root`, re-exposed to Tailwind via an `@theme inline` block:
- Colors: `--color-primary` (navy), `--color-secondary` (burgundy),
  `--color-accent`/`--color-accent-light` (gold), `--color-background`
  (warm cream), `--color-surface`/`--color-surface-muted`/
  `--color-surface-hover`, `--color-text`/`--color-text-muted`/
  `--color-text-light`/`--color-text-inverse`, `--color-border`/
  `--color-border-light`/`--color-border-strong`, semantic
  `--color-success`/`--color-warning`/`--color-error`/`--color-info`, and
  stable premium panel tokens `--color-ink`/`--color-ink-muted`/
  `--color-on-ink`/`--color-on-ink-muted`
- Radius: `sm`/`md`/`lg`/`xl`/`pill`
- Shadows: `input`/`card`/`dropdown`/`modal` (four-tier elevation scale)
- Fonts: `--font-display` and `--font-sans` both resolve to **Geist**
  (self-hosted from `app/fonts/geist-latin.woff2` via `next/font/local` in
  `app/layout.tsx`) — a deliberate,
  admin-confirmed switch from an initial Cormorant Garamond (serif
  display) + Inter (body) pairing, chosen after comparing both directions
  visually via the Visualizer tool. Collector Midnight is the implemented
  dark palette, selected through `data-theme="dark"` and persisted by the
  global theme toggle. The ink token family remains dark in both themes so
  hero/footer/editorial panels never rely on `primary` retaining the same
  semantic background role.

Gradient utilities use Tailwind v4's renamed `bg-linear-to-*` (not the v3
`bg-gradient-to-*`).

### Shared UI primitives (`app/components/ui/`)
- `Button.tsx` — variants: `primary`/`secondary`/`ghost`/`danger`/`accent`; sizes `sm`/`md`/`lg`
- `Badge.tsx` — variants: `success`/`warning`/`error`/`info`/`neutral`/`accent`
- `Card.tsx` — unopinionated shell (surface + border + shadow), no default padding
- `MetricCard.tsx` — label/value/icon, used across the admin dashboard

### Other new shared components
- `app/components/ScrollReveal.tsx` — IntersectionObserver-based fade-up-on-scroll wrapper, fires once, respects `prefers-reduced-motion`. No new dependency (deliberately not Framer Motion — see DECISIONS.md).
- `app/components/Footer.tsx` — global multi-column customer footer with
  brand positioning plus Shop, Help, and Company navigation.
- `app/components/ComingSoonPage.tsx` — shared stub-page shell. **Possibly now unused** — every page that used it (Terms, Shipping, Returns, Help Center) was removed by the admin this session. Worth confirming and deleting if genuinely orphaned.
- `lib/cn.ts` — small className-joining helper, written in place of installing `clsx`.

### New npm dependencies this session (each explicitly admin-confirmed before adding)
- `lucide-react` — icon library, used throughout storefront and admin
- `recharts` — admin dashboard charts

---

## Key Architectural Decisions

### Server vs Client Components
- **Admin list pages** → Server Components — fetch data directly with Prisma
- **Admin form pages** → Client Components (`'use client'`)
- **Admin row-level actions** (archive/unarchive, delete, activate/deactivate/reactivate, with a confirm dialog) → small standalone Client Components (`ProductActions.tsx`, `CategoryActions.tsx`, `ExpenseActions.tsx`, `PromoCodeActions.tsx`) rather than making the whole list page a Client Component
- **Admin nav** (`app/admin/AdminNav.tsx`, added 2026-07-22) → Client Component, since active-link highlighting needs `usePathname()`; kept separate from `app/admin/layout.tsx` specifically so the layout's server-side auth/role check never has to move client-side
- **Admin dashboard charts** (`app/admin/DashboardCharts.tsx`, added 2026-07-22) → Client Component, since `recharts` requires the browser; the page itself (`app/admin/page.tsx`) stays a Server Component doing all data-fetching/aggregation, passing pre-computed arrays down as props
- **API routes** → handle all mutations and are called by client components via `fetch()`

### Database Connection (Prisma 7)
```
prisma.config.ts          → tells Prisma CLI where schema + migrations live, provides DB URL for migrations
lib/prisma.ts             → runtime singleton using PrismaPg adapter, reads DATABASE_URL at runtime
app/generated/prisma/     → generated client, committed to repo (needed for Vercel builds)
```
The `datasource db` block in `schema.prisma` has NO `url` field — intentional for Prisma 7.

### Dynamic Product System
```
ProductType    → defines the template (what fields a product type has)
ProductField   → individual field definitions per type (label, key, type, options)
Product        → a specific product, stores type-specific data in `attributes` JSON column
ProductVariant → each sellable combination (Size+Color etc.) with its own price/stock
```

### Admin Edit / Delete / Archive Pattern
- **Category** — fully editable; supports real hard delete.
- **Product** — fully editable except `productTypeId` and `slug`, both locked after creation. Uses **archive, not hard delete**.
- **ProductType** — editable, but `ProductField` `key`/`type` locked once created; no delete or type-reassignment feature exists, by deliberate decision.
- **Expense** — fully editable, real hard delete. No archive concept (nothing depends on an Expense row).
- **PromoCode** — fully editable. No hard delete restriction, but the meaningful lifecycle state is `active`/`usedAt`, not deletion. Deleting a `PromoCode` row does **not** retroactively affect any `Order` that already used it, since the order's discount is snapshotted onto `Order.promoCode`/`discountAmount`.

- **NewsletterPost** — editable and deletable only while `DRAFT`.
  Broadcasting is a separate confirmed admin action. `SENT` content and
  delivery history are immutable; `FAILED` broadcasts retry only unsent
  recipients.

**General principle applied throughout:** where an incorrect edit could
silently corrupt or orphan real data, the field is locked outright. Where
the risk is about losing a whole record with real history behind it, the
safer action (archive) is offered instead of the destructive one. Where
there's no real risk, the simpler action (hard delete) is used without
extra ceremony.

### Financial / Promotions Data Flow (added 2026-07-22)
- **GST is conditional**, not assumed-on. `lib/gst.ts` exports `GST_ENABLED`
  (derived from `GST_RATE_PERCENT` env var being a positive number) and
  `GST_RATE_DISPLAY`. Every surface showing order totals (checkout form,
  order confirmation, admin order detail, the FAQ) must check `GST_ENABLED`
  before rendering a GST line — this is not automatic, same convention as
  `archived: false` needing to be added by hand to new product queries.
- **Promo code validation is duplicated by design, computation is not.**
  `/api/checkout/apply-promo` is a preview-only endpoint the checkout UI
  calls live as the customer types a code — it validates and computes but
  never mutates anything. The real, authoritative application happens
  inside `/api/checkout`'s own transaction, which re-validates the code
  from scratch (never trusts the earlier preview call) and is the only
  place `PromoCode.usedAt` actually gets set. Both call the same
  `lib/promoCode.ts` → `computeDiscountAmount()` function, so the number
  shown to the customer before checkout can never drift from what they're
  actually charged.
- **Discount timing relative to GST:** subtracted from `subtotal` before
  `calculateTotalWithGST()` runs — GST is calculated on the net
  (post-discount) amount, not the gross.
- **Promo burn timing:** a code is marked used at order-**creation** time,
  not at payment-success time — a deliberate admin decision accepting the
  tradeoff that a failed/expired payment still permanently burns a
  single-use code (mitigated by the admin's own "Reactivate" action being
  available at any time).
- **Discount-as-Expense timing is the inverse:** the auto-generated
  `Expense` row (`isSystemGenerated: true`) is only created once an order
  actually reaches `PAID` — inside the same winning compare-and-set
  transaction in `lib/payments/transitionOrderPayment.ts`. Webhook,
  reconciliation, and checkout compensation all call that service, so
  concurrent or duplicate delivery cannot repeat the expense or failed-order
  stock restoration. This asymmetry (burn-on-create vs. expense-on-paid) is
  intentional: "the code is spent" and "money was actually given away on a
  real sale" are treated as genuinely separate facts.

### Public Storefront Pages
`/`, `/categories`, `/products`, `/category/[slug]`, `/product/[slug]`,
`/search`, `/faq`, `/about`,
`/contact` are unauthenticated Server Components. `/checkout/success` has a
verified-but-unauthenticated view (see below). `/api/search/suggestions`
`/api/checkout/apply-promo`, and authenticated `/api/newsletter` are the
storefront's API-route exceptions, needed because Client Components call
them and can't reach Prisma directly.

- **Dynamic route params** and **query strings** are both async (`Promise`) in Next.js 15 App Router.
- **404 handling**: unknown slugs, and archived products, both call `notFound()`.
- **Category page sort/filter** and **`/search`**: plain-GET forms, `searchParams`-driven, no client-side state.
- **Homepage sections** are hardcoded (no `HomepageSection` DB model). The
  current order is animated PokeSunshine landing, CategoryGrid,
  FeaturedProducts, simplified promises, Newsletter, then the global Footer.
  Admin reordering remains Phase 7 scope.
- **Image fallback chain**: `ProductVariant.imageUrl` → `Product.imageUrl` → blank.
- **Catalog image storage (Phase 8)**: production catalog images are
  repository-owned static files under `public/images/products`,
  `public/images/variants`, and `public/images/categories`; database image
  fields store root-relative paths such as `/images/products/card-name.webp`.
  This deliberately avoids a separately billed managed-storage service.
- **Shared `CatalogImage`** (`app/components/CatalogImage.tsx`) renders local
  paths with Next.js `Image`. Its native `<img>` branch is temporary
  compatibility for arbitrary remote URLs in the disposable test database
  and must be removed after the database is reset with real local paths. It
  supports deliberate `contain` (products) and `cover` (category icons) modes,
  plus explicit eager loading for the above-the-fold category/product hero
  while cards and thumbnails remain lazy.
- **Product image verification**: the new/edit admin forms accept filenames
  rather than URLs. The browser issues a `HEAD` request to the corresponding
  static product/variant path, confirms a successful image response, and
  resets verification whenever the filename changes. A verified main image is
  required; variant images remain optional, but every entered filename must be
  verified. Edit converts valid stored paths back to filenames and requires
  legacy remote variant images to be replaced or explicitly removed. POST and
  PUT independently reject paths outside the expected local folders.
- **Shared `ProductCard`** (`app/components/ProductCard.tsx`) — used by
  category, homepage, and search surfaces. Product imagery uses a consistent
  square `object-contain` canvas; the card now exposes live availability,
  format count, price, and a clearer detail affordance.
- **Homepage categories** use responsive asymmetric editorial cards with
  `object-cover`, live product counts, optional descriptions, and a stable
  dark image overlay. The first two cards establish visual hierarchy while
  remaining cards rebalance across the 12-column grid.
- **Category image verification** mirrors products: Create/Edit accept a
  required filename under `public/images/categories`, verify it with a real
  image `HEAD` response, and POST/PUT reject paths outside that folder. The
  legacy field remains named `bannerImageUrl`, but it now supplies the
  homepage category icon only. The category-detail page's wide banner was
  removed because one square source cannot safely serve both compositions.
- **Live homepage hero** is a static Server Component using the
  admin-supplied PokeSunshine logo. CSS provides a one-time logo, ray,
  wordmark, and CTA reveal with a no-animation reduced-motion fallback.
  Its buttons scroll to new arrivals and Shop by TCG.
- **Newsletter broadcasting** uses database-backed drafts and recipient
  delivery snapshots. The broadcast endpoint captures the current opted-in
  audience, re-checks opt-in before each delivery, sends through the existing
  Resend client with a per-delivery idempotency key, and records success or
  failure. Saving a post never sends it. Lead images are references only;
  persistent upload storage remains a separate decision.
- **Terminal payment processing** uses one atomic compare-and-set service.
  The winning `PENDING_PAYMENT` → `PAID`/`PAYMENT_FAILED` transaction performs
  the database side effects and creates one `OrderEmailDelivery` outbox row.
  Resend runs only after commit with a stable per-delivery idempotency key;
  delivery failures are recorded and retried by the reconciliation cron without
  rolling back order, stock, or expense state.
- **`Footer.tsx`** — global multi-column brand and navigation footer.
- **`/faq`** (added 2026-07-22) — real content grounded only in facts already true of the site (payment method, GST conditionality, fulfillment options, sales policy pulled from `PurchaseNotice.tsx`). Deliberately did **not** reuse a reference FAQ document the admin uploaded, since it was identified as another real business's actual customer-service copy, not written for this project.
- **`/about`, `/contact`** (added 2026-07-22) — real, admin-written content.
- **Terms & Conditions, Shipping, Returns, Help Center** — deliberately **not built**, by explicit admin decision (not deferred, actively decided against for now).
- **SEO metadata (Milestone 4)**: the root layout defines the production
  metadata base, branded title template, default OpenGraph/Twitter cards, and
  logo. Public routes define canonicals; category/product routes add dynamic
  metadata and social images; transactional, search, and account routes are
  `noindex`.
- **`app/sitemap.ts`** builds an hourly sitemap from public static routes,
  categories containing at least one non-archived product, and all
  non-archived products. URLs and images use `NEXT_PUBLIC_APP_URL` through
  `lib/structuredData.ts`.
- **`proxy.ts`** is the Next 16 Clerk request-boundary convention that replaced
  deprecated `middleware.ts`; its matcher behaviour is unchanged.

Clerk handles identity; `User` row (via `clerkId`) stores app-specific data. Role check pattern in every admin API route:
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
│   ├── layout.tsx                        ← Root layout; Geist font, ClerkProvider, Header, <main>, Footer
│   ├── page.tsx                          ← Homepage
│   ├── sitemap.ts                        ← Hourly public category/product sitemap
│   ├── globals.css                       ← All design tokens (Tailwind v4 @theme inline), keyframes
│   ├── fonts/                            ← Self-hosted variable Geist font + OFL license
│   ├── sign-in/, sign-up/                ← Clerk pages
│   │
│   ├── faq/page.tsx                      ← (added 2026-07-22) Real FAQ content, native <details> accordion
│   ├── about/page.tsx                    ← (added 2026-07-22)
│   ├── contact/page.tsx                  ← (added 2026-07-22)
│   │
│   ├── search/page.tsx
│   ├── categories/page.tsx
│   ├── products/page.tsx
│   ├── category/[slug]/page.tsx
│   ├── product/[slug]/
│   │   ├── page.tsx
│   │   └── ProductGallery.tsx            ← Re-themed 2026-07-22; owns image + variant selector + spec table + purchase notice
│   │
│   ├── cart/page.tsx
│   ├── checkout/
│   │   ├── page.tsx
│   │   ├── CheckoutForm.tsx              ← Extended 2026-07-22: promo code entry/apply/remove, conditional GST line
│   │   └── success/page.tsx
│   │
│   ├── components/
│   │   ├── ui/
│   │   │   ├── Button.tsx                ← (added 2026-07-22)
│   │   │   ├── Badge.tsx                 ← (added 2026-07-22)
│   │   │   ├── Card.tsx                  ← (added 2026-07-22)
│   │   │   └── MetricCard.tsx            ← (added 2026-07-22)
│   │   ├── ScrollReveal.tsx              ← (added 2026-07-22)
│   │   ├── Footer.tsx                    ← Multi-column customer footer
│   │   ├── ComingSoonPage.tsx            ← (added 2026-07-22, possibly now unused)
│   │   ├── BackButton.tsx
│   │   ├── Header.tsx                    ← Store assurance bar, shopping nav, responsive search/actions/mobile menu
│   │   ├── SearchBar.tsx                 ← Live suggestions; responsive header placement
│   │   ├── ProductCard.tsx               ← Availability, format count, price, detail affordance
│   │   └── homepage/
│   │       ├── HeroBanner.tsx            ← Animated PokeSunshineTCG landing
│   │       ├── HeroAnimatedBackground.tsx← Unused legacy video experiment
│   │       ├── HeroCardAccent.tsx        ← (added 2026-07-22) reusable "foil card" placeholder, currently unused on the live Hero
│   │       ├── FeaturedProducts.tsx      ← At most eight standardized arrival cards
│   │       ├── CategoryGrid.tsx          ← Three/two/one-card category carousel
│   │       ├── TrustStrip.tsx            ← Unused legacy store-assurance component
│   │       └── Newsletter.tsx            ← Account-only subscribe/unsubscribe UI backed by /api/newsletter
│   │
│   ├── admin/
│   │   ├── layout.tsx                    ← Auth guard; sidebar now bg-primary, renders AdminNav
│   │   ├── AdminNav.tsx                  ← (added 2026-07-22) Client Component, active-link highlighting
│   │   ├── page.tsx                      ← (rebuilt 2026-07-22) Real dashboard: revenue/expense/profit/discount metrics + recharts
│   │   ├── DashboardCharts.tsx           ← (added 2026-07-22) recharts Client Component
│   │   ├── product-types/                ← List/new/edit, all re-themed 2026-07-22
│   │   ├── products/                     ← List/new/edit + ProductActions, all re-themed 2026-07-22
│   │   ├── categories/                   ← List/new/edit + CategoryActions, all re-themed 2026-07-22
│   │   ├── orders/                       ← List/detail + OrderStatusActions + TrackingNumberForm, all re-themed 2026-07-22
│   │   ├── expenses/                     ← (added 2026-07-22) Full CRUD: list, new, [id]/edit, ExpenseActions
│   │   └── promo-codes/                  ← (added 2026-07-22) Full CRUD: list, new, [id]/edit, PromoCodeActions (incl. Reactivate)
│   │
│   ├── api/
│   │   ├── webhooks/
│   │   │   ├── clerk/route.ts
│   │   │   └── hitpay/route.ts           ← Verifies signature, then delegates terminal status to the shared payment service
│   │   ├── search/suggestions/route.ts
│   │   ├── checkout/
│   │   │   └── apply-promo/route.ts      ← (added 2026-07-22) Preview/validation only, never mutates
│   │   └── admin/
│   │       ├── product-types/
│   │       ├── products/
│   │       ├── categories/
│   │       ├── orders/
│   │       ├── expenses/                 ← (added 2026-07-22) GET/POST, [id] GET/PUT/DELETE
│   │       └── promo-codes/              ← (added 2026-07-22) GET/POST, [id] GET/PUT/DELETE, [id]/toggle-active, [id]/reactivate
│   │
│   └── generated/prisma/
│
├── lib/
│   ├── prisma.ts
│   ├── gst.ts                            ← Extended 2026-07-22: GST_ENABLED, GST_RATE_DISPLAY exports
│   ├── promoCode.ts                      ← (added 2026-07-22) computeDiscountAmount() — shared by preview and real checkout
│   ├── cn.ts                             ← (added 2026-07-22) className helper
│   ├── validateAddress.ts
│   ├── orderStatus.ts                    ← STATUS_STYLES/formatStatus — now consistently imported everywhere (deduplicated 2026-07-22; admin order detail page and OrderStatusActions previously had their own copies)
│   ├── reconcileOrder.ts                 ← Reads HitPay state, then delegates terminal changes to the shared service
│   ├── constants.ts                      ← SELF_COLLECTION_ADDRESS, TELEGRAM_URL (added 2026-07-22)
│   ├── payments/
│   │   └── transitionOrderPayment.ts     ← Atomic terminal status, stock/expense, and email-outbox transaction
│   └── email/
│       └── deliverOrderEmail.ts          ← Durable Resend delivery/retry with stable idempotency keys
│
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts
│
├── prisma.config.ts
├── next.config.ts
├── proxy.ts                              ← Clerk boundary using Next 16 convention
├── .env / .env.example
└── .gitattributes
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

# HitPay
HITPAY_API_KEY=
HITPAY_WEBHOOK_SALT=
HITPAY_API_BASE_URL=

# GST — now conditionally consumed; set to 0 to fully disable GST display/calculation
GST_RATE_PERCENT=9
GST_REGISTRATION_NUMBER=

# App URL — build-time-baked, requires a redeploy after any change
NEXT_PUBLIC_APP_URL=https://biggyballs69.gay

# Fulfillment fees
SHIPPING_FEE_SGD=
SELF_COLLECTION_FEE_SGD=

# Email (Resend + React Email)
RESEND_API_KEY=
RESEND_ORDER_FROM_EMAIL="PokeSunshineTCG Orders <orders@biggyballs69.gay>"
RESEND_NEWSLETTER_FROM_EMAIL="PokeSunshineTCG <newsletters@biggyballs69.gay>"
# Legacy fallback retained for deployments that have not migrated yet
RESEND_FROM_EMAIL=

# Background reconciliation cron
CRON_SECRET=
```

---

## External Services

| Service | Purpose | Environment |
|---|---|---|
| Neon | PostgreSQL database | Dev branch + Prod branch |
| Clerk | Authentication | Dev instance + Prod instance |
| Vercel | Hosting + CI/CD | Auto-deploy from GitHub main branch; custom domain live |
| Cloudflare | DNS host | Unchanged |
| ngrok | Local webhook tunnel | Local dev only |
| HitPay | Payment processing | Sandbox + Live |
| Resend | Transactional email | Verified sending domain |
| cron-job.org | Triggers `/api/cron/reconcile-orders` every 5 minutes | Production only |

**Note (2026-07-22):** No new external services added this session — only
two new npm dependencies (`lucide-react`, `recharts`), both bundled into
the existing Vercel deployment, no new infrastructure.
