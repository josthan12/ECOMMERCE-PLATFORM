# CURRENT_STATE.md

## Current Phase
Phase 4 — Cart, Checkout & HitPay (In Progress)

## Current Feature
None in progress. Core cart → checkout → HitPay payment → confirmation loop is
complete and verified end-to-end, including abandoned/expired payment recovery.
One known gap remains before Phase 4's payment flow is fully robust — see
"Immediate Next Task" below.

## Current Objective
Phase 4's core commerce loop is functionally complete:
- Cart state (Zustand, localStorage-persisted, guest carts allowed)
- Stock-aware quantity guards on product and cart pages
- GST calculation (9%, applied only at checkout)
- Login-gated checkout (no guest checkout — account required)
- Shipping address form with Singapore-specific validation
- Order creation with atomic stock decrement (race-condition safe) and live price
  re-verification (cart price never trusted)
- Full HitPay Payment Request integration (PayNow only), hosted checkout redirect
- HitPay webhook with HMAC signature verification, idempotent status updates
- Stock compensation (restore on failure) shared across all failure scenarios
- Order confirmation page with access control and lazy reconciliation for
  abandoned/expired payments
- **Verified working:** successful payment → `PAID`; abandoned payment → expires
  after 5 min on HitPay's side → reload confirmation page → `PAYMENT_FAILED` +
  stock restored

---

## Completed Features

* [x] Phase 0 — Project setup
* [x] Phase 1 — Data model & auth
* [x] Phase 2 — Admin panel
* [x] Phase 3 — Public storefront
* [x] Phase 4 — Cart state with Zustand (localStorage, guest carts allowed)
* [x] Phase 4 — Minimal site header with cart icon/count (`app/components/Header.tsx`), hydration-safe (`hasMounted` guard needed since Zustand persist only hydrates client-side)
* [x] Phase 4 — Cart page (`/cart`) — quantity edit/remove, stock-capped quantity input (clamp + inline warning), GST-exclusive subtotal
* [x] Phase 4 — Stock-aware quantity guards on product page (accounts for quantity already in cart) and cart page
* [x] Phase 4 — GST calculation module (`lib/gst.ts`) — 9% rate via `GST_RATE_PERCENT` env var, applied only at checkout
* [x] Phase 4 — `Order`, `OrderItem` models + `OrderStatus` enum (full lifecycle defined upfront, including unused Phase 5 states, to avoid a second migration later)
* [x] Phase 4 — `Order.hitpayPaymentRequestId` — stores HitPay's own payment request ID for status polling
* [x] Phase 4 — Login-gated checkout (`/checkout`) — server-side `auth()`, redirects guests to `/sign-in?redirect_url=/checkout`; **guest checkout is disallowed by decision**, account required
* [x] Phase 4 — Shipping address validation (`lib/validateAddress.ts`) — SG postal code (6 digits), block number (alphanumeric, max 4 chars), unit number (must start with `#` if provided), shared between client and server
* [x] Phase 4 — Order creation API (`/api/checkout`) — atomic stock check-and-decrement (`updateMany` with `stock: { gte: quantity }` guard, prevents overselling under concurrent checkouts), live price/stock re-verification (never trusts cart), GST calc, shipping address snapshot (not a live FK)
* [x] Phase 4 — HitPay Payment Request integration — form-urlencoded body + `X-Requested-With` header (NOT JSON), PayNow only (`payment_methods[]: 'paynow_online'`), `expires_after: '5 min'` (note: HitPay's own docs example of `'5 minutes'` is WRONG and returns a 422 — confirmed via testing)
* [x] Phase 4 — HitPay webhook (`/api/webhooks/hitpay`) — HMAC-SHA256 verification over raw body against `Hitpay-Signature` header, idempotent status updates, registered via HitPay Dashboard (the `webhook` creation param is deprecated)
* [x] Phase 4 — Shared stock-compensation helper (`lib/orders.ts` → `markOrderFailedAndRestoreStock`) — used by webhook's `failed` handler, checkout's HitPay-call-failure compensating action, and lazy reconciliation
* [x] Phase 4 — Lazy reconciliation (`reconcileIfStale` in `app/checkout/success/page.tsx`) — polls HitPay's Get Payment Status endpoint when the confirmation page loads, to recover orders whose webhook never arrived (abandoned/expired PayNow requests don't fire a webhook)
* [x] Phase 4 — Order confirmation page (`/checkout/success`) — full item/address/total breakdown when `PAID`, access-controlled (only the order's owning user can view it, else 404), cosmetic (non-DB-mutating) "Payment Cancelled" messaging on `status=canceled` redirect
* [x] Phase 4 — HitPay's built-in `send_email` receipt tested and confirmed working (interim solution; custom branded email still planned)

---

## In Progress

None — awaiting next task (see below).

---

## Known Bugs / Gaps

* **Stock held hostage by silently-abandoned checkouts (the one real remaining gap).** Lazy reconciliation only runs when someone loads `/checkout/success?orderId=...` for a specific order. If a customer closes the tab and never revisits that page, the order stays `PENDING_PAYMENT` and its stock stays decremented forever — nothing currently resolves this automatically in the background. **This is the immediate next task** — a Vercel Cron job to periodically reconcile all stale orders without requiring a page visit. See "Immediate Next Task" below.
* PayNow/QR payments cannot be cancelled via HitPay's API (no cancel endpoint exists for QR-based methods — confirmed via their docs; only card payments support cancellation). This is why the gap above can't be solved by an explicit "cancel" call — we can only wait for genuine expiry or a webhook.
* Card payment testing is blocked — HitPay sandbox requires bank account setup on the business account to enable card payments. Deprioritized since webhook/signature/status-update logic is payment-method-agnostic and already proven via PayNow.
* The `failed` webhook status (`payment_request.failed`) has never been directly observed in sandbox (neither PayNow nor card reached a terminal `failed` state easily in testing). It shares identical code with the proven `expired` path (`markOrderFailedAndRestoreStock`), so risk is considered low but technically unverified.
* No admin order visibility yet (`/admin/orders` doesn't exist) — only Prisma Studio. Good candidate for a small, minimal, read-only addition later; full Order queue/filtering is Phase 5 scope.
* SSL deprecation warning from the `pg` driver (Neon connection string `sslmode`) — cosmetic, unrelated to this feature, not fixed. Optional future cleanup: add `&sslmode=verify-full` to `DATABASE_URL`.
* Old/pre-fix `Order` rows created before `hitpayPaymentRequestId` existed, or before `expires_after` was added to the HitPay call, cannot be reconciled — expected for stale test data, not a bug.
* Temporary diagnostic logging (`console.log('[hitpay reconcile]', ...)`) is still present in `reconcileIfStale` — should be removed once the cron job work is done and the whole reconciliation path is considered final.

---

## Immediate Next Task

**Build a Vercel Cron job to automatically reconcile abandoned/expired orders**, closing the "stock held hostage" gap described above.

Rough plan (not yet finalized — plan properly at session start):
- New route: `app/api/cron/reconcile-orders/route.ts` — queries all `PENDING_PAYMENT` orders older than a threshold with a `hitpayPaymentRequestId` set, checks each against HitPay's Get Payment Status endpoint, resolves via existing logic
- Extract the "check one order against HitPay and resolve it" logic out of `reconcileIfStale` into a shared function (e.g. in `lib/orders.ts`) so both the page-load path and the cron path reuse identical logic — avoid duplicating this a second time
- New/updated `vercel.json` for the cron schedule
- Needs a decision on: Vercel plan tier (Hobby vs Pro — affects minimum allowed cron interval), and what staleness threshold the cron itself should use
- Must verify Vercel's cron request is authentic (secret/header check) so the endpoint can't be triggered by arbitrary public requests

**After that:** custom branded order confirmation email (provider TBD — likely Resend; HitPay's built-in receipt already works as an interim solution and was explicitly tested/confirmed).

---

## Important Notes

- This project uses **Prisma 7** (adapter pattern, no `url` in datasource, generated client committed to repo).
- `Order.userId` is required — **no guest checkout**. Guests are redirected to `/sign-in?redirect_url=/checkout`; cart (localStorage) survives the redirect automatically since it's not tied to auth state.
- **Never trust cart price/stock at checkout** — `/api/checkout` always re-fetches live `ProductVariant` data and snapshots verified values onto `OrderItem`.
- **Shipping address is snapshotted onto `Order`** as plain strings, not a live FK to `Address` — protects order history from later address-book edits.
- Stock is decremented **atomically** at Order creation (`updateMany` with `stock: { gte: quantity }` guard) to prevent overselling under concurrent checkouts.
- **HitPay integration specifics (hard-won, don't rediscover):**
  - Payment Request creation requires `Content-Type: application/x-www-form-urlencoded` + `X-Requested-With: XMLHttpRequest` — NOT JSON.
  - The `webhook` parameter on request creation is deprecated — register the webhook URL once via HitPay Dashboard (Developers → Webhook Endpoints), subscribed to `payment_request.completed` and `payment_request.failed`.
  - Sandbox and live API keys/base URLs must match (`api.sandbox.hit-pay.com` for sandbox key, `api.hit-pay.com` for live key) — mismatched pairing causes a 401.
  - **`expires_after` must be `'5 min'`, NOT `'5 minutes'`** — HitPay's own documentation example (`"5 minutes"`) is wrong and returns a 422 validation error. This was the root cause of a long debugging session where reconciliation appeared broken but was actually correct — there was simply no expiry configured for HitPay to ever report.
  - PayNow/QR payments have **no cancel endpoint** — only card payments can be cancelled via API. "Back to Merchant" is purely a cosmetic browser redirect; it does not affect the real payment request state.
  - HitPay does **not** fire a webhook for expired or cancelled requests — only `completed` and `failed` are real webhook events. Expiry must be detected via polling (Get Payment Status), which is why lazy reconciliation (and soon, the cron job) exists.
- Stock-compensation logic lives in ONE shared place: `lib/orders.ts` → `markOrderFailedAndRestoreStock(orderId)`. Do not duplicate this logic elsewhere — reuse it (and extend this file further for the upcoming cron job).
- Storefront/checkout pages remain intentionally minimal/unstyled Tailwind — real theming is Phase 7 scope.