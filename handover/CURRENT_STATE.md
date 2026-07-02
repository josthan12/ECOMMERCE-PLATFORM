# CURRENT_STATE.md

## Current Phase
Phase 2 — Admin Panel (Complete)

## Current Feature
Category Builder — COMPLETE. Phase 2 finished. Phase 3 (public storefront) is next.

## Current Objective
Category Builder fully implemented and tested end-to-end: admins can create categories with name, slug, description, banner image URL, and SEO fields, and assign existing products to categories via checkbox list on the create form. API creates Category + CategoryProduct rows in one nested transaction. Category list page shows all categories with product count. Confirmed in Prisma Studio: Category and CategoryProduct rows created correctly, many-to-many assignment works (a product can belong to multiple categories).

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
* [x] Phase 2 — Category model + CategoryProduct junction table, migration run
* [x] Phase 2 — Category Builder UI (create form with SEO fields + product assignment)
* [x] Phase 2 — Category list page
* [x] Phase 2 — API routes for categories (GET/POST)

---

## In Progress

None — Phase 2 is complete.

---

## Known Bugs

* None currently

---

## Recently Modified Files

* `prisma/schema.prisma` — added Category, CategoryProduct models; added categoryProducts relation to Product
* `app/api/admin/categories/route.ts` — created, GET + POST with nested CategoryProduct create
* `app/admin/categories/page.tsx` — created, category list with product count
* `app/admin/categories/new/page.tsx` — created, category form with product checkbox assignment
* `app/api/admin/products/route.ts` — fixed: was accidentally overwritten with categories logic during this session, restored to correct product GET/POST logic
* `app/generated/prisma/` — regenerated and committed

---

## Immediate Next Task

Begin Phase 3 — Public Storefront: modular homepage section renderer, category page route, product page route (see ROADMAP.md)

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