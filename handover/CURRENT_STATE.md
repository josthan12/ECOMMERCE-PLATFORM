# CURRENT_STATE.md

## Current Phase
Phase 2 — Admin Panel (In Progress)

## Current Feature
Product Variants — COMPLETE. Category Builder is next.

## Current Objective
Product Variant system is fully implemented and tested end-to-end: Product Builder UI supports defining variant options, generating cartesian-product combinations, and setting price/stock/SKU per combination. API saves products with nested variants. Products list page derives price range and total stock from variants. Next session starts Category Builder.

---

## Completed Features

* [x] Phase 0 — Project setup (Next.js, TypeScript, Tailwind, GitHub, Vercel, Neon DB, Prisma, ngrok)
* [x] Phase 1 — Prisma schema (User, Address models)
* [x] Phase 1 — Clerk authentication (sign-in, sign-up pages)
* [x] Phase 1 — Clerk webhook syncing new users to database
* [x] Phase 1 — Role system (CUSTOMER, STAFF, ADMIN)
* [x] Phase 1 — Admin account promoted to ADMIN in database
* [x] Phase 2 — Admin layout with role-based access protection
* [x] Phase 2 — Admin dashboard shell with sidebar navigation
* [x] Phase 2 — Product Type Builder (create types with custom fields)
* [x] Phase 2 — Product Builder (dynamic form rendering from product type fields)
* [x] Phase 2 — Products list page
* [x] Phase 2 — API routes for product types and products
* [x] Phase 2 — ProductVariant schema, migration run
* [x] Phase 2 — Product Variant UI (option definition, combination generation, price/stock/SKU per row)
* [x] Phase 2 — Products API updated to save variants via nested create
* [x] Phase 2 — Products list page updated to show derived price range + total stock

---

## In Progress

None — Product Variants feature is done. Category Builder not yet started.

---

## Known Bugs

* None currently

---

## Recently Modified Files

* `prisma/schema.prisma` — ProductVariant model, price/stock removed from Product (from last session, migration run this session)
* `app/admin/products/new/page.tsx` — added variant option UI, combination generator, variant table; removed top-level price/stock inputs
* `app/api/admin/products/route.ts` — POST now creates variants via nested create; validates at least one variant with price/stock; GET now includes variants
* `app/admin/products/page.tsx` — updated to derive price range and total stock from `product.variants` (previously read removed `product.price`/`product.stock` fields directly, causing a runtime error)
* `app/generated/prisma/` — regenerated and committed

---

## Immediate Next Task

1. Build Category Builder — create/edit categories with SEO fields + banner image
2. Category list page
3. API routes: GET/POST `/api/admin/categories`

---

## Recommended Next Feature

Category Builder (final Phase 2 item), then move to Phase 3 — public storefront (homepage, category pages, product pages).

---

## Important Notes

- This project uses **Prisma 7** (not 6). Prisma 7 does NOT use `url = env("DATABASE_URL")` in the datasource block. The DB connection is handled via `PrismaPg` adapter in `lib/prisma.ts` and `prisma.config.ts`.
- The generated Prisma client (`app/generated/prisma/`) is committed to the repo — do NOT add it back to `.gitignore`. Vercel needs it.
- Every schema change requires BOTH `npx prisma migrate dev` AND `npx prisma generate`, then commit the updated `app/generated/` folder.
- ngrok URL changes every restart. When restarting ngrok, update the webhook URL in Clerk dashboard AND `allowedDevOrigins` in `next.config.ts`.
- The project root does NOT use a `src/` directory despite `create-next-app` offering it — all app code is directly under `app/`, `lib/`, etc. at the project root.
- `Product` has no `price`/`stock` of its own — any page/query touching products must include `variants` and derive display values from them.