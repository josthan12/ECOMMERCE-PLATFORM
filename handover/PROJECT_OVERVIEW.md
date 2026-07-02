# PROJECT_OVERVIEW.md

## Project Name
AI-Powered Modular E-Commerce Platform (Singapore Edition)

## Vision
A modern, scalable, highly customizable e-commerce platform built for the Singapore market. The entire application is driven by configuration and data — administrators can create new product categories, custom product types, define custom fields, build landing pages, configure AI chatbot behavior, and change themes without any code changes. The platform is designed to start as a single-store e-commerce site and evolve into a marketplace, subscription platform, or enterprise commerce solution with minimal architectural changes.

---

## Target Users

**Primary — Store Admins (the merchant):**
A Singapore-based business owner who wants to sell products online without needing a developer for day-to-day operations. They should be able to manage products, categories, orders, promotions, and the storefront entirely through the admin UI.

**Secondary — Customers (shoppers):**
Singapore-based shoppers who expect PayNow, GrabPay, ShopeePay, and other local payment methods at checkout. The experience should be fast, mobile-friendly, and familiar.

**Tertiary — Future developers:**
Engineers who will extend the platform later. The codebase should expose clean extension points so new features can be added without refactoring the core.

---

## Core Features

* Authentication (Clerk — sign up, sign in, role-based access)
* Dynamic Product Type Builder (admin creates product types with custom fields, zero code changes)
* Product Builder (dynamic form driven by product type field definitions)
* Product Variants (size, color, storage etc. — each combination tracks own price and stock)
* Category Builder (group products into categories with landing pages)
* Admin Dashboard (orders, products, categories, inventory)
* Cart and Checkout (HitPay — PayNow, cards, GrabPay, ShopeePay, Atome, BNPL)
* GST calculation (Singapore 9% GST, GST-inclusive/exclusive display)
* Order Fulfillment (status lifecycle, courier integration, tracking)
* Modular Homepage Builder (drag-and-drop sections)
* AI Shopping Assistant (personalized recommendations, gift suggestions)
* Search (Meilisearch — typo-tolerant, natural language)
* CMS Pages (About, FAQ, Terms, Privacy/PDPA, Returns, Shipping)
* Theme System (colors, typography, dark/light mode)
* Promotions (coupons, flash sales, bundle pricing)
* PDPA Compliance (consent management, data export, data deletion)

---

## Tech Stack

**Frontend:** Next.js 15 (App Router), React, TypeScript, TailwindCSS

**Backend:** Next.js API Routes (same codebase, no separate backend service)

**Database:** PostgreSQL via Neon (serverless, branched dev/prod)

**ORM:** Prisma 7 (with PrismaPg adapter — NOT the standard url-in-schema approach)

**Authentication:** Clerk (external identity provider, synced to local DB via webhook)

**Payments:** HitPay (sole payment gateway — PayNow, GrabPay, ShopeePay, Atome, cards, cross-border wallets)

**Search:** Meilisearch (Phase 6)

**AI:** OpenAI API (Phase 6)

**Hosting:** Vercel (auto-deploy from GitHub main branch)

**State Management:** Zustand (cart state, Phase 4)

**Styling:** TailwindCSS

---

## Coding Standards

- **TypeScript everywhere** — no plain `.js` files
- **Server Components by default** — only use `'use client'` when React state or browser APIs are needed
- **API routes for all mutations** — client components call API routes via `fetch()`, never import Prisma directly in client components
- **Server Components can use Prisma directly** — admin list pages fetch data with Prisma in the component, no API call needed
- **Shared Prisma singleton** — always import `prisma` from `@/lib/prisma`, never instantiate `new PrismaClient()` in individual files
- **Role check in every admin API route** — check `userId` via Clerk AND `role === 'ADMIN'` in DB before any data operation
- **Auto-generated slugs** — always generate slugs from names on the server, never trust client-supplied slugs
- **Git Bash for all commands** — PowerShell only for `npx prisma studio` (Git Bash has stream issues with it)
- **Commit generated Prisma client** — after every `npx prisma generate`, commit the updated `app/generated/` folder

---

## High-Level Folder Structure

```
ecommerce-platform/
├── app/                    ← Next.js App Router (pages + API routes)
│   ├── admin/              ← Admin panel (role-protected)
│   ├── api/                ← API routes (webhooks + admin endpoints)
│   ├── generated/prisma/   ← Prisma generated client (committed to repo)
│   ├── sign-in/            ← Clerk sign-in page
│   └── sign-up/            ← Clerk sign-up page
├── lib/
│   └── prisma.ts           ← Prisma singleton (single import point)
├── prisma/
│   ├── schema.prisma       ← Database schema
│   └── migrations/         ← Migration history
├── prisma.config.ts        ← Prisma 7 CLI config (schema path, DB URL)
├── next.config.ts          ← Next.js config
└── .env                    ← Local secrets (never committed)
```

---

## Success Criteria

- Non-developers can manage the entire storefront through config/admin UI
- Unlimited product types and custom fields without code changes
- Fast, accessible, SEO-friendly shopping experience on desktop and mobile
- Payments processed exclusively through HitPay with PayNow and local wallets
- GST correctly calculated and displayed at checkout
- AI shopping assistant with PDPA-compliant personalization
- Full order lifecycle from payment to delivery trackable in admin dashboard
- Clean APIs so future developers can extend without refactoring core
