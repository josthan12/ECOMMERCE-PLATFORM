# CURRENT_STATE.md

## Current Phase
Phase 6 — Search & AI Shopping Assistant (IN PROGRESS). Search is complete;
the AI Shopping Assistant has not been started — deliberately deferred, see
below. Deployment verification (carried over from the Phase 5 session) is
now fully closed, and the custom domain is live. An unplanned but
significant detour — full edit capability across all three core admin
entities (Categories, Products, Product Types), plus delete (Categories)
and archive (Products) — was also completed this session; none of this was
on the original roadmap.

## Current Feature
None in progress. Search (Prisma-based, no Meilisearch), the
checkout-success unauthenticated-visitor fix, the custom domain connection,
and admin edit/delete/archive capability for Categories, Products, and
Product Types are all built and live.

## Current Objective
Decide, at the start of the next session: resume Phase 6 by scoping the AI
Shopping Assistant (deferred this session, not abandoned), or shift to
Phase 7 (theming) given repeated notes this session that the storefront/
admin UI is still bare and unstyled. See NEXT_TASK.md.

---

## Completed Features

* [x] Phase 0 — Project setup
* [x] Phase 1 — Data model & auth
* [x] Phase 2 — Admin panel (Product Type Builder, Product Builder, Category Builder — create/list)
* [x] **Phase 2 addendum (2026-07-17, outside original scope)** — Full edit capability for Categories, Products, and Product Types (previously create/list only); delete for Categories; archive (not hard delete) for Products, modeled on Shopify's approach. Product Types deliberately remain edit-only — no delete, no type-reassignment feature. See ROADMAP.md Phase 2 addendum and DECISIONS.md for full reasoning.
* [x] Phase 3 — Public storefront
* [x] Phase 4 — Cart, Checkout & HitPay (Complete for MVP)
* [x] Phase 5 — Order Fulfillment (Complete for MVP)
* [x] **Production deployment verification — CLOSED (2026-07-17).** Full successful payment path re-tested and confirmed on the Vercel deployment (order reached `PAID`, confirmation email received); env vars, dual webhook registrations (Clerk + HitPay, ngrok + Vercel), and the admin panel were all confirmed working on the live deployment, per the admin's direct testing.
* [x] **Custom domain connected (2026-07-17)** — `biggyballs69.gay` is now the live production URL on Vercel (apex domain, DNS-only `A` record on Cloudflare, SSL auto-issued by Vercel). `NEXT_PUBLIC_APP_URL` updated to `https://biggyballs69.gay` and redeployed. Motivated in part by a real deliverability finding during this session: transactional email links pointing at the `.vercel.app` URL while sending from `orders@biggyballs69.gay` is a known spam-filter mismatch signal — this closes that gap in addition to giving the store a real, permanent production URL. The `.vercel.app` URL remains live as a Vercel-managed alias; no webhook re-registration was needed.
* [x] **Checkout-success fix for unauthenticated visitors (2026-07-17)** — real production bug found via live testing: a customer who scans the PayNow QR code with a different device than the one they checked out on (e.g. phone scans a laptop-displayed QR, banking app's "back to merchant" opens a browser session on the phone that was never signed in to Clerk) landed on a bare 404 on `/checkout/success`, since that page previously required a Clerk session with no fallback. Fixed with a verified, read-only cosmetic view: if the visitor holds the correct HitPay `reference` value (empirically confirmed to match `Order.hitpayPaymentRequestId`), they see a genuine "Payment received!" confirmation with no order data exposed; otherwise a generic "still processing" message, indistinguishable whether the order exists, is unpaid, or belongs to someone else. Does not touch the real order-processing path (webhook → DB → email), which was already correct — this only changes what an unauthenticated visitor on this one page sees.
* [x] **Phase 6 (partial) — Search (2026-07-17)** — Prisma-based, case-insensitive `contains` search across `Product.name`/`description`. No typo tolerance (deliberate — Meilisearch was evaluated and explicitly rejected as unnecessary once typo tolerance was ruled out as a requirement; see DECISIONS.md). Includes: `/search` results page, a shared `ProductCard` component (extracted from the category page and `FeaturedProducts` to avoid a third duplicate of the same card markup), and a debounced (300ms) live-suggestion dropdown in the header (image, name, category, price, top 6 matches) via `/api/search/suggestions`.
* [ ] **Phase 6 (remaining) — AI Shopping Assistant — deliberately deferred, not started.** Natural-language search, chat UI, tool-calling against a real product API, PDPA consent flow, AI memory, and the preferences settings page are all still open. Architecture direction already decided (tool-calling against Prisma directly, not Meilisearch — see DECISIONS.md), but nothing built yet.

---

## In Progress

None — awaiting next-session decision between resuming Phase 6 (AI
Assistant) or moving to Phase 7 (theming). See NEXT_TASK.md.

---

## Known Bugs / Gaps

* **Vercel deployment still uses dev-equivalent credentials** — same dev Clerk instance and dev Neon database branch as local development. Unchanged this session; still explicitly Phase 9 (Launch) scope.
* **Two parallel webhook setups per service** (Clerk: ngrok + Vercel; HitPay: ngrok + Vercel), each with its own signing secret — confirmed intentional, not config drift; unchanged this session; both confirmed simultaneously active during this session's verification pass.
* **AI Shopping Assistant not started** — deliberately deferred this session in favor of shipping the plain search bar first and closing the admin CRUD gap. Not abandoned — see ROADMAP.md Phase 6 and NEXT_TASK.md.
* **Product Type deletion and type-reassignment are not supported, by design** — `Product.productTypeId` is required (non-nullable) and `Product` does not cascade from `ProductType`, so a type genuinely cannot be safely deleted while any product still depends on it, and there is no built-in way to move an existing product to a different type (would require re-mapping `attributes` to a new field schema with no defined logic for how). Workaround if this is ever needed: recreate the product under the new type, or hand-edit `productTypeId` + `attributes` directly in Prisma Studio (bypasses all app-level validation — only advisable for rare one-off fixes, not routine use). Deliberately not building this — see DECISIONS.md (2026-07-17).
* **Mobile Gmail app disables link taps on emails sitting in Spam** — not a code bug; confirmed root cause via direct testing this session. If a transactional email is misclassified as spam, its buttons become dead taps on the Gmail mobile app specifically (desktop Gmail, and Gmail-in-spam-viewed-via-a-browser, both still work). The custom domain connection above should improve inbox placement going forward; there's no code-level fix for this since it's Gmail-app behavior, not something in our control.
* **Self-collection pickup address is a hardcoded TypeScript constant** — unchanged, deliberate, see DECISIONS.md (2026-07-14).
* **Returns admin approval flow, courier integration — dropped from roadmap entirely.** Unchanged.
* **Bulk actions (mark packed, bulk export) — deliberately deferred, still not built.** Unchanged; still worth revisiting if order volume grows.
* `expires_after` on HitPay Payment Request creation is **`'5 mins'`** — unchanged, still confirmed correct.
* Card payment testing still blocked (HitPay sandbox bank account requirement); `failed` webhook status still never directly observed in sandbox; SSL deprecation warning on `pg` driver still cosmetic/unfixed. Unchanged.
* `metadata.title`/`metadata.description` in `app/layout.tsx` are still the unedited `create-next-app` scaffolded defaults — unchanged, still not fixed.
* **Storefront/checkout/admin styling is still intentionally minimal/unstyled Tailwind** — real theming remains Phase 7 scope. Raised again this session (the admin specifically called the current UI "ugly") — worth prioritizing sooner rather than later given how much surface area has accumulated since the last time this was noted (search UI, product cards, several new admin edit forms) that will all need a real design pass at once.

---

## Immediate Next Task

See NEXT_TASK.md.

---

## Important Notes

- This project uses **Prisma 7** (adapter pattern, no `url` in datasource, generated client committed to repo).
- **Order fulfillment is branched by `fulfillmentMethod`** — unchanged, see prior notes.
- **Shipping address fields on `Order` are nullable** — unchanged.
- **GST is calculated on `subtotal + shippingFee` combined** — unchanged.
- **Refunds are manual and record-only.** — unchanged.
- **Automatic reconciliation is live** — unchanged, `lib/reconcileOrder.ts` remains the shared implementation, used by both `/checkout/success` and the cron route.
- **The cron route is protected by `CRON_SECRET`** — unchanged.
- **`NEXT_PUBLIC_APP_URL` is now `https://biggyballs69.gay`** (updated 2026-07-17; was the Vercel default URL before). This is a build-time-baked value — any future change requires a redeploy, not just a dashboard edit. This has now caused confusion twice in this project (Session 7's `localhost` email-link bug, and this session's domain switch) — worth treating as a standing gotcha whenever this var is touched, not a one-off.
- **`expires_after` must be `'5 mins'`** — unchanged.
- **Slugs are locked after creation** — both `Category.slug` and `Product.slug` are intentionally never regenerated on edit, even if the name changes, since either URL may already be linked or bookmarked externally. This is a deliberate divergence from the "always server-generate slugs" coding standard, scoped specifically to edits (creation still auto-generates as normal).
- **`Product.productTypeId` is locked after creation** — cannot be changed via the edit page; the type defines the shape of `attributes`, and there's no defined mapping if it changed. To use a different type, create a new product.
- **`ProductField.key` and `ProductField.type` are locked after creation** — same reasoning one level down: changing either on a field already in use would silently orphan or corrupt existing products' `attributes` data. The edit UI disables these inputs for existing fields; the API also re-derives them server-side rather than trusting the client, even though the UI already prevents editing them.
- **Removing a `ProductField` is blocked if any product of that type still has a non-empty value for it** — checked server-side in `PUT /api/admin/product-types/[id]` before any deletion is committed; returns a `400` naming the affected field(s) and how many products are affected.
- **Products use archive, not hard delete** (`Product.archived Boolean`, default `false`, added 2026-07-17) — modeled deliberately on how Shopify handles this (researched and confirmed, not guessed). An archived product is hidden from every customer-facing surface (category pages, `FeaturedProducts`, `/search`, `/api/search/suggestions`) and rejected at checkout if still sitting in a stale client-side cart, but stays fully visible and editable in the admin panel, and can be unarchived at any time. Order history is completely unaffected either way (already snapshotted, not live-linked). Every storefront-facing Prisma query that lists products must filter `archived: false` — this is not automatic/global, so any *new* product-listing surface added in the future needs this filter added explicitly, same as today's four surfaces did.
- **Categories use real hard delete** — safe, since nothing else depends on a `Category` the way products depend on a `ProductType`; `CategoryProduct` cascades cleanly and only unassigns products, never deletes them.
- **Product Types have no delete and no reassignment feature, by deliberate design decision** — see Known Bugs/Gaps above and DECISIONS.md (2026-07-17).
- Storefront/checkout/admin pages remain intentionally minimal/unstyled Tailwind — real theming is still Phase 7 scope.