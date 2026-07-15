# CURRENT_STATE.md

## Current Phase
Phase 5 — Order Fulfillment (Complete for MVP purposes)

## Current Feature
None in progress. Admin order visibility, fulfillment-status lifecycle, manual
refunds, tracking numbers, customer notification emails, and customer-facing
order history are all built and verified end-to-end. Bulk actions (mark
packed, bulk export) were deliberately deferred, not built — see ROADMAP.md.

## Current Objective
None — Phase 5 is closed. Ready to begin Phase 6 (Search & AI Shopping
Assistant) or revisit deferred items (bulk actions) — see NEXT_TASK.md.

---

## Completed Features

* [x] Phase 0 — Project setup
* [x] Phase 1 — Data model & auth
* [x] Phase 2 — Admin panel
* [x] Phase 3 — Public storefront
* [x] Phase 4 — Cart, Checkout & HitPay (Complete for MVP)
* [x] Phase 5 — Admin orders list (`/admin/orders`) — status/customer/total/date, filter by status, sort (newest/oldest/total asc/desc), all via `searchParams` + `<form method="GET">` (no client JS, matches category page convention)
* [x] Phase 5 — Admin order detail page (`/admin/orders/[id]`) — customer, shipping/self-collection info, payment reference, itemized breakdown, totals including shipping fee
* [x] Phase 5 — Fulfillment status lifecycle, branched by `fulfillmentMethod`:
  - `DELIVERY`: `PAID → PROCESSING → PACKED → SHIPPED → DELIVERED → COMPLETED`
  - `SELF_COLLECTION`: `PAID → PROCESSING → PACKED → COMPLETED` (skips Shipped/Delivered — "shipped" doesn't apply to in-person pickup)
  - Server-validated in `PUT /api/admin/orders/[id]/status`, only ever advances exactly one stage, no skipping/reversing
* [x] Phase 5 — Manual refund tracking — `PUT /api/admin/orders/[id]/refund`, admin-only "Mark as Refunded" action, record-keeping only: **no HitPay Refund API call, no stock auto-restoration, no order cancellation feature**. Admin liaises with customer directly (Telegram/email) and processes the real refund via HitPay's dashboard or bank transfer outside the app
* [x] Phase 5 — Manual tracking number — `PUT /api/admin/orders/[id]/tracking`, freely editable at any order status, **replaces courier API integration entirely** (deliberately rejected — admin self-fulfills shipping and prints own labels)
* [x] Phase 5 — Customer notification emails — `sendShippingNotificationEmail` (fires on `PACKED → SHIPPED` for delivery orders, includes tracking number if set) and `sendReadyForCollectionEmail` (fires on `PACKED → COMPLETED` for self-collection orders, includes pickup address), both added to `lib/email/sendOrderEmail.ts` following the existing try/catch-log-only, non-blocking pattern
* [x] Phase 5 — Customer-facing order history — `/account/orders` (list, own orders only) and `/account/orders/[id]` (detail, access-controlled — 404 if the order isn't the requesting user's, same non-leaking pattern as admin's refund/tracking routes)
* [x] Phase 5 — Shared status display helpers extracted to `lib/orderStatus.ts` (`STATUS_STYLES`, `formatStatus`) — deduplicated from four separate copies across admin/customer pages
* [x] Phase 4/5 boundary — **Checkout flow extended** with fulfillment method selection (`DELIVERY` / `SELF_COLLECTION`), flat shipping fee (`SHIPPING_FEE_SGD`, default $5.50), free self-collection (`SELF_COLLECTION_FEE_SGD`, default $0, configurable for future use), GST now correctly applied to `subtotal + shippingFee` combined (not subtotal alone)
* [x] Header auth UI — `<Show when="signed-in/signed-out">` + `<UserButton>` + `<SignInButton>` added to `app/components/Header.tsx` (previously had zero auth UI at all — gap identified and fixed this session); `afterSignOutUrl="/"` moved to `<ClerkProvider>` in `app/layout.tsx` per Clerk's current API (deprecated on `<UserButton>` directly)
* [x] "My Orders" link added to header, pointing to `/account/orders`

---

## In Progress

None — awaiting next task (Phase 6, or deferred Bulk Actions).

---

## Known Bugs / Gaps

* **Bulk actions (mark packed, bulk export) — deliberately deferred, not built.** Not currently needed; scope (checkbox selection + action bar, or CSV export) discussed but explicitly set aside as low priority. Revisit if/when order volume makes one-at-a-time admin actions genuinely slow.
* **Self-collection pickup address is a hardcoded TypeScript constant** (`SELF_COLLECTION_ADDRESS` in `lib/constants.ts`), not stored in the database or admin-editable via UI. Deliberate choice — a DB-backed `StoreSettings` model + admin form was scoped and explicitly rejected as overkill for a single rarely-changing value. Changing the address requires editing the constant directly and redeploying.
* **Returns: admin approval flow — dropped from roadmap entirely**, not deferred. Covered instead by the same manual Telegram/email process as refunds.
* **Courier integration, shipping label generation, courier status sync — dropped from roadmap entirely.** Admin self-fulfills all shipping and prints their own labels; tracking numbers (if any) are entered manually.
* All four transactional email templates' "View Order" button now link to `/account/orders/[id]` (permanent, status-aware) instead of `/checkout/success` (one-time, `PAID`-only confirmation page) — **except** `paymentFailed.tsx`, which correctly still links to `/cart` (the order never completed, so there's nothing to view). This was a real bug caught mid-session: the four order-lifecycle emails were initially all pointing at `/checkout/success`, which wasn't designed to display non-`PAID` statuses.
* `expires_after` on HitPay Payment Request creation is **`'5 mins'`** (re-confirmed this session) — supersedes the 2026-07-06 finding of `'5 min'`. See DECISIONS.md for the correction entry. The prior entry is left in place per this file's history-preservation convention but is no longer accurate.
* Everything carried over unresolved from Phase 4 remains open: automatic background reconciliation (Vercel Cron/GitHub Actions) still deliberately deferred; card payment testing still blocked (HitPay sandbox bank account requirement); `failed` webhook status still never directly observed in sandbox; SSL deprecation warning on `pg` driver still cosmetic/unfixed.
* `metadata.title`/`metadata.description` in `app/layout.tsx` are still the unedited `create-next-app` scaffolded defaults ("Create Next App" / "Generated by create next app") — noticed this session while editing that file for `afterSignOutUrl`, not yet fixed.

---

## Immediate Next Task

See NEXT_TASK.md.

---

## Important Notes

- This project uses **Prisma 7** (adapter pattern, no `url` in datasource, generated client committed to repo).
- **Order fulfillment is now branched by `fulfillmentMethod`** — any code touching `OrderStatus` transitions must check `DELIVERY` vs `SELF_COLLECTION` first; the two have different valid transition chains (see Completed Features above). This lives in two places that must stay in sync: `app/api/admin/orders/[id]/status/route.ts` (server-enforced) and `app/admin/orders/[id]/OrderStatusActions.tsx` (client-side button logic) — both were updated together this session, but any future change to the transition rules needs to touch both.
- **Shipping address fields (`shippingBlock`, `shippingStreet`, `shippingPostalCode`) are now nullable** on `Order` — `null` for self-collection orders, required (validated by `lib/validateAddress.ts`) for delivery orders. `lib/validateAddress.ts`'s `validateShippingAddress()` signature changed to require a `fulfillmentMethod` param and short-circuits to valid (`null`, no error) when `SELF_COLLECTION` — this is a breaking signature change; both callers (`CheckoutForm.tsx`, `app/api/checkout/route.ts`) were updated together.
- **GST is calculated on `subtotal + shippingFee` combined**, not subtotal alone — `lib/gst.ts`'s `calculateTotalWithGST()` now takes an optional second `shippingFee` parameter (defaults to `0`, so any future caller that omits it behaves exactly as before this change).
- **Refunds are manual and record-only.** `markOrderFailedAndRestoreStock` (Phase 4, unchanged) is NOT reused for refunds — that function is specifically for pre-payment-confirmation failure/expiry and restores stock automatically. The new refund flow (`PUT /api/admin/orders/[id]/refund`) is a separate, simpler function: it never touches stock, never calls HitPay, and is purely a status flag the admin sets after having already refunded the customer through an entirely external process.
- **`expires_after` must be `'5 mins'`** (space, no hyphen — re-confirmed 2026-07-14; supersedes the earlier `'5 min'` finding from 2026-07-06). If this value needs re-verifying again in the future, it's worth adding an inline code comment next to the line in `checkout/route.ts` referencing this file, since it's now flipped once already based on empirical testing rather than trusting either HitPay's docs or a prior session's conclusion blindly.
- Storefront/checkout pages remain intentionally minimal/unstyled Tailwind — real theming is still Phase 7 scope. This has not changed.