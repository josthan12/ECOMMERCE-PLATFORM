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
- **Admin form pages** (new product, new product type) → Client Components (`'use client'`) — need React state for dynamic form behavior
- **API routes** → handle all mutations (POST, PUT, DELETE) and are called by client components via `fetch()`

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

### Authentication
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
│   ├── page.tsx                          ← Homepage (storefront, Phase 3)
│   ├── sign-in/[[...sign-in]]/page.tsx   ← Clerk sign-in page
│   ├── sign-up/[[...sign-up]]/page.tsx   ← Clerk sign-up page
│   │
│   ├── admin/                            ← Admin panel (role-protected)
│   │   ├── layout.tsx                    ← Admin layout + auth guard
│   │   ├── page.tsx                      ← Admin dashboard home
│   │   ├── product-types/
│   │   │   ├── page.tsx                  ← List all product types
│   │   │   └── new/page.tsx              ← Create product type form
│   │   ├── products/
│   │   │   ├── page.tsx                  ← List all products
│   │   │   └── new/page.tsx              ← Create product form (dynamic)
│   │   ├── categories/                   ← (To be built)
│   │   └── orders/                       ← (To be built)
│   │
│   ├── api/
│   │   ├── webhooks/
│   │   │   ├── clerk/route.ts            ← Clerk user.created webhook
│   │   │   └── hitpay/route.ts           ← HitPay payment webhook (Phase 4)
│   │   └── admin/
│   │       ├── product-types/route.ts    ← GET + POST product types
│   │       └── products/route.ts         ← GET + POST products
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
```

---

## External Services

| Service | Purpose | Environment |
|---|---|---|
| Neon | PostgreSQL database | Dev branch + Prod branch |
| Clerk | Authentication | Dev instance + Prod instance |
| Vercel | Hosting + CI/CD | Auto-deploy from GitHub main |
| ngrok | Local webhook tunnel for Clerk/HitPay testing | Local dev only |
| HitPay | Payment processing (Phase 4) | Sandbox + Live |
