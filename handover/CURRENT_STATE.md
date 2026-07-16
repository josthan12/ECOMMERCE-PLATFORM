# CURRENT_STATE.md

## Current Phase
Phase 5 — Order Fulfillment (Complete for MVP purposes). First production
deployment completed 2026-07-15 (Vercel, default `*.vercel.app` URL,
dev-equivalent credentials — see Known Bugs/Gaps).

## Current Feature
None in progress. Admin order visibility, fulfillment-status lifecycle,
manual refunds, tracking numbers, customer notification emails,
customer-facing order history, and a scheduled background payment
reconciliation job are all built. Deployment verification is partially
complete — see Known Bugs/Gaps for what's still unconfirmed.

## Current Objective
Finish verifying the Vercel deployment (see checklist below), then decide
between Phase 6 (Search & AI Shopping Assistant) or revisiting deferred
Bulk Actions — see NEXT_TASK.md.

---

## Completed Features

* [x] Phase 0 — Project setup
* [x] Phase 1 — Data model & auth
* [x] Phase 2 — Admin panel
* [x] Phase 3 — Public storefront
* [x] Phase 4 — Cart, Checkout & HitPay (Complete for MVP)
* [x] Phase 5 — Admin orders list (`/admin/orders`) — status/customer/total/date, filter by status, sort (newest/oldest/total asc/desc)
* [x] Phase 5 — Admin order detail page (`/admin/orders/[id]`) — customer, shipping/self-collection info, payment reference, itemized breakdown, totals including shipping fee, tracking number field
* [x] Phase 5 — Fulfillment status lifecycle, branched by `fulfillmentMethod` (delivery vs self-collection have different valid transition chains)
* [x] Phase 5 — Manual refund tracking — record-keeping only, no HitPay API call, no stock auto-restore, no order cancellation feature
* [x] Phase 5 — Manual tracking number — replaces courier API integration entirely (deliberately rejected)
* [x] Phase 5 — Customer notification emails — Shipped (delivery) and Ready-for-Collection (self-collection)
* [x] Phase 5 — Customer-facing order history — `/account/orders` + `/account/orders/[id]`
* [x] Phase 5 — Filter/sort on admin orders list
* [x] Phase 4/5 boundary — Checkout extended with fulfillment method selection, flat shipping fee, GST applied to shipping+subtotal combined
* [x] Header auth UI — `<Show when="signed-in/signed-out">` + `<UserButton>` + `<SignInButton>`, `afterSignOutUrl="/"` on `<ClerkProvider>`
* [x] **Automatic background payment reconciliation (2026-07-15)** — `app/api/cron/reconcile-orders/route.ts`, triggered every 5 minutes by an external cron-ping service (cron-job.org), reconciles any `PENDING_PAYMENT` order older than 6 minutes against HitPay's real status. Fixes the specific gap where a customer abandoning payment via the browser Back button (not HitPay's "Back to Merchant") never triggers `redirect_url`, and therefore never reaches the page-load-based lazy reconciliation on `/checkout/success`. Reverses the 2026-07-13 deferral decision — see DECISIONS.md (2026-07-15).
* [x] **First production deployment (2026-07-15)** — live on Vercel's default URL: `https://ecommerce-platform-ashy-one.vercel.app`

---

## In Progress

None — awaiting deployment verification completion, then next feature choice.

---

## Known Bugs / Gaps

* **Production deployment is on Vercel's default `*.vercel.app` URL, not the custom domain.** `biggyballs69.gay` (already live on Cloudflare for Resend email) is not yet connected in Vercel. Deliberately deferred — not a blocker, just not done yet.
* **Vercel deployment currently uses dev-equivalent credentials** — the same Clerk dev instance and the same Neon dev database branch as local development. This was a deliberate choice to get a stable public URL quickly for the reconciliation fix, not an oversight. It means local dev and the live Vercel deployment currently share the same underlying data. Genuine production credentials (separate Clerk prod instance, separate Neon prod branch, live HitPay keys) remain explicitly Phase 9 (Launch) scope.
* **Two parallel webhook setups now exist per service** (Clerk: ngrok + Vercel; HitPay: ngrok + Vercel), each with its own signing secret, kept separately in local `.env` vs Vercel's environment variables respectively. These are NOT meant to match — local dev keeps using its ngrok-registered secrets, Vercel uses its own. Confirmed intentional, not config drift.
* **Deployment verification checklist — not yet fully confirmed:**
  - [ ] Full successful payment path (checkout → PAID → confirmation email) re-tested on the Vercel URL specifically (only the failed/expired reconciliation path has been explicitly verified there so far)
  - [ ] All env vars present in Vercel — `GST_RATE_PERCENT`, `SHIPPING_FEE_SGD`, `SELF_COLLECTION_FEE_SGD`, `NEXT_PUBLIC_CLERK_SIGN_IN_URL`, `NEXT_PUBLIC_CLERK_SIGN_UP_URL` were not explicitly confirmed (only the ones directly involved in webhook debugging were)
  - [ ] Both Clerk webhook endpoints (ngrok + Vercel) confirmed simultaneously active in Clerk's dashboard, not one replacing the other
  - [ ] Both HitPay webhook endpoints (ngrok + Vercel) confirmed simultaneously active in HitPay's dashboard
  - [ ] `/admin/orders` confirmed loading correctly on the Vercel URL
* **Cron route timeout risk (low, flagged for awareness only).** `/api/cron/reconcile-orders` processes all matched stale orders in one invocation via `Promise.allSettled`. Vercel Hobby tier's serverless function timeout is 10 seconds. Ran fine at 11 orders in testing; could theoretically become a problem if the stale-order count grows large (e.g. after an extended period without the schedule running). Not an issue at current volume.
* **Self-collection pickup address is a hardcoded TypeScript constant** (`SELF_COLLECTION_ADDRESS` in `lib/constants.ts`), not database-backed or admin-editable via UI — deliberate, see DECISIONS.md (2026-07-14).
* **Returns: admin approval flow — dropped from roadmap entirely.** Covered by the same manual Telegram/email refund process.
* **Courier integration, shipping labels, courier status sync — dropped from roadmap entirely.** Admin self-fulfills shipping.
* **Bulk actions (mark packed, bulk export) — deliberately deferred, not built.** Not currently needed at current order volume; revisit if that changes.
* `expires_after` on HitPay Payment Request creation is **`'5 mins'`** (re-confirmed 2026-07-14, superseding the earlier `'5 min'` finding from 2026-07-06). This value has now flipped once already based on empirical testing — worth an inline code comment at the call site if it needs correcting again.
* Everything carried over unresolved from Phase 4 remains open except reconciliation (now fixed): card payment testing still blocked (HitPay sandbox bank account requirement); `failed` webhook status still never directly observed in sandbox; SSL deprecation warning on `pg` driver still cosmetic/unfixed.
* `metadata.title`/`metadata.description` in `app/layout.tsx` are still the unedited `create-next-app` scaffolded defaults — noticed, not fixed.

---

## Immediate Next Task

See NEXT_TASK.md.

---

## Important Notes

- This project uses **Prisma 7** (adapter pattern, no `url` in datasource, generated client committed to repo).
- **Order fulfillment is branched by `fulfillmentMethod`** — any code touching `OrderStatus` transitions must check `DELIVERY` vs `SELF_COLLECTION` first; the two have different valid transition chains, enforced in both `app/api/admin/orders/[id]/status/route.ts` and `app/admin/orders/[id]/OrderStatusActions.tsx` — both must stay in sync.
- **Shipping address fields on `Order` are nullable** — `null` for self-collection orders. `lib/validateAddress.ts`'s `validateShippingAddress()` requires a `fulfillmentMethod` param and short-circuits to valid when `SELF_COLLECTION`.
- **GST is calculated on `subtotal + shippingFee` combined**, not subtotal alone.
- **Refunds are manual and record-only.** `markOrderFailedAndRestoreStock` is NOT reused for refunds — that's specifically for pre-payment-confirmation failure/expiry and restores stock automatically. Refunds never touch stock and never call HitPay.
- **Automatic reconciliation is now live**, not deferred. `lib/reconcileOrder.ts` (`reconcileOrderIfStale`) is the single shared implementation used by both `/checkout/success` (page-load-triggered) and `/api/cron/reconcile-orders` (schedule-triggered, every 5 minutes via cron-job.org). Any future change to reconciliation logic should go in `lib/reconcileOrder.ts` so both callers stay in sync.
- **The cron route is protected by `CRON_SECRET`, not Clerk auth** — it's called by an external, non-browser service with no Clerk session. Accepts the secret via `Authorization: Bearer <secret>` header or `?secret=` query param.
- **Local `.env` and Vercel's environment variables are intentionally different** on webhook secrets and `NEXT_PUBLIC_APP_URL` — do not "sync" these between environments; each points at its own registered webhook endpoint with its own secret.
- **`expires_after` must be `'5 mins'`** (re-confirmed 2026-07-14; supersedes the earlier `'5 min'` finding from 2026-07-06).
- Storefront/checkout pages remain intentionally minimal/unstyled Tailwind — real theming is still Phase 7 scope.