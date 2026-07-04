# CURRENT_STATE.md

## Current Phase
Phase 3 — Public Storefront (Complete)

## Current Feature
None in progress. Phase 3 finished. Phase 4 (Cart, Checkout & HitPay) is next.

## Current Objective
Phase 3 fully implemented and tested end-to-end:
- Category page (`/category/[slug]`) — banner, description, product grid, sort (newest/price/name), in-stock-only filter, differentiated empty states, 404 on unknown slug
- Product page (`/product/[slug]`) — image gallery with per-variant image swap (falls back to product-level image), generic N-option variant selector (price/stock/SKU update on selection), spec table from `attributes`, 404 on unknown slug
- Homepage (`/`) — four hardcoded sections: Hero Banner (static content), Featured Products (latest 4), Category Grid (all categories), Newsletter (non-functional UI)
- Back button (browser history-based) on both category and product pages
- `Product.imageUrl` and `ProductVariant.imageUrl` fields added; variant image swap falls back to product image when a variant has none

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
* [x] Phase 2 — Product Variant UI (option definition, combination generation, price/stock/SKU/image per row)
* [x] Phase 2 — Products API updated to save variants via nested create
* [x] Phase 2 — Products list page updated to show derived price range + total stock
* [x] Phase 2 — Category model + CategoryProduct junction table, migration run
* [x] Phase 2 — Category Builder UI (create form with SEO fields + product assignment)
* [x] Phase 2 — Category list page
* [x] Phase 2 — API routes for categories (GET/POST)
* [x] Phase 3 — Category page route (`/category/[slug]`) with product grid
* [x] Phase 3 — Product page route (`/product/[slug]`) with gallery + variant selector
* [x] Phase 3 — Spec table rendered from product type field schema
* [x] Phase 3 — Variant selector drives price/stock update
* [x] Phase 3 — Variant image swap (per-variant image, falls back to product image)
* [x] Phase 3 — Basic filtering (in-stock only) and sorting (newest/price/name) on category pages
* [x] Phase 3 — Modular homepage section renderer (Hero Banner, Featured Products, Category Grid, Newsletter)
* [x] Phase 3 — Back button on category and product pages (browser history)
* [x] Phase 3 — `Product.imageUrl` and `ProductVariant.imageUrl` schema fields + admin form inputs

---

## In Progress

None — Phase 3 is complete.

---

## Known Bugs

* None currently. Note: products created before the `Product.imageUrl` admin input bug was fixed (e.g. early test products) will have `imageUrl: null` and show no image on the homepage/category grid — not a code bug, just missing data. Can be backfilled manually in Prisma Studio if needed.

---

## Recently Modified Files

* `prisma/schema.prisma` — added `Product.imageUrl`, `ProductVariant.imageUrl`
* `app/category/[slug]/page.tsx` — created, then updated with sort/filter, back button, product image rendering
* `app/product/[slug]/page.tsx` — created, then updated to use `ProductGallery` and back button
* `app/product/[slug]/ProductGallery.tsx` — created (renamed from `VariantSelector.tsx`), owns image + option selector + price/stock display
* `app/components/BackButton.tsx` — created, shared client component
* `app/components/homepage/HeroBanner.tsx` — created
* `app/components/homepage/FeaturedProducts.tsx` — created
* `app/components/homepage/CategoryGrid.tsx` — created
* `app/components/homepage/Newsletter.tsx` — created
* `app/page.tsx` — rewritten to compose the four homepage sections
* `app/admin/products/new/page.tsx` — added product-level Image URL input, per-variant Image URL input
* `app/api/admin/products/route.ts` — accepts and saves `imageUrl` on both product and each variant
* `app/generated/prisma/` — regenerated after each migration (confirm committed)

---

## Immediate Next Task

Begin Phase 4 — Cart, Checkout & HitPay (see ROADMAP.md and NEXT_TASK.md)

---

## Important Notes

- This project uses **Prisma 7** (not 6). Prisma 7 does NOT use `url = env("DATABASE_URL")` in the datasource block. The DB connection is handled via `PrismaPg` adapter in `lib/prisma.ts` and `prisma.config.ts`.
- The generated Prisma client (`app/generated/prisma/`) is committed to the repo — do NOT add it back to `.gitignore`. Vercel needs it.
- Every schema change requires BOTH `npx prisma migrate dev` AND `npx prisma generate`, then commit the updated `app/generated/` folder. If a saved field doesn't show up at runtime ("Unknown argument"), it usually means one of these two steps was skipped or the dev server is using a stale `.next` cache — clear `.next` and restart.
- ngrok URL changes every restart. When restarting ngrok, update the webhook URL in Clerk dashboard AND `allowedDevOrigins` in `next.config.ts`.
- The project root does NOT use a `src/` directory despite `create-next-app` offering it — all app code is directly under `app/`, `lib/`, etc. at the project root.
- `Product` has no `price`/`stock` of its own — any page/query touching products must include `variants` and derive display values from them.
- `Product.imageUrl` is the fallback/default image; `ProductVariant.imageUrl` is optional and overrides it when set and selected. Both must be explicitly set via the admin form — neither is auto-populated.
- Storefront pages (`/`, `/category/[slug]`, `/product/[slug]`) currently use minimal, unstyled Tailwind — intentional. Real theming/styling is deferred to Phase 7 (Theme Builder).
- Homepage sections are hardcoded (no `HomepageSection` DB model yet) — that's intentionally deferred to Phase 7's drag-and-drop builder. `HeroBanner.tsx` content is a hardcoded constant.
