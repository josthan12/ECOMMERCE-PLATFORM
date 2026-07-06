# NEXT_TASK.md

## Next Feature (proposed — confirm at start of next session)
Phase 4 — Vercel Cron job for automatic order reconciliation

## Goal
Automatically detect and resolve abandoned/expired HitPay payment requests in the
background, without requiring a customer (or anyone) to manually reload the order's
confirmation page. This closes the last known gap in Phase 4's payment flow.

## Why this is needed
The current reconciliation mechanism (`reconcileIfStale` in `app/checkout/success/page.tsx`)
only runs when someone loads that specific order's confirmation page. Verified via testing:
if a customer abandons checkout and never returns to that page, the order stays
`PENDING_PAYMENT` forever and its stock stays decremented — held hostage with no
automatic recovery. HitPay does not send a webhook for expired or cancelled payment
requests (only genuine `completed`/`failed` transitions), so polling is the only way
to detect this, and it needs to happen proactively, not just reactively on page load.

## Rough Scope (not yet finalized — plan properly at session start)
- New route: `app/api/cron/reconcile-orders/route.ts` — queries all `PENDING_PAYMENT`
  orders with a `hitpayPaymentRequestId` set, older than some staleness threshold,
  and reconciles each against HitPay's Get Payment Status endpoint
- Extract the "check one order against HitPay and resolve it" logic currently inline
  in `reconcileIfStale` into a shared function (likely in `lib/orders.ts`), so both
  the page-load path and the new cron path reuse identical logic rather than
  duplicating it a second time
- New/updated `vercel.json` with a cron schedule pointing at the new route
- Authenticate the cron request (Vercel sends a specific header/secret) so the
  endpoint can't be triggered by arbitrary public requests

## Open Questions (resolve before coding)
1. Which Vercel plan tier is this project on (Hobby vs Pro)? Affects the minimum
   allowed cron interval — historically Hobby only allows once-per-day, Pro allows
   more frequent schedules. This determines whether we can realistically reconcile
   orders within minutes/hours vs. only once daily.
2. What staleness threshold should the cron's own query use? (Doesn't need to match
   the 2-minute buffer used by lazy reconciliation — could be longer, e.g. only
   check orders older than 10 minutes, since the cron itself runs on its own schedule.)
3. Should the cron job also clean up/log orders it can't resolve (e.g. HitPay API
   errors, missing payment request), or just skip and retry next run?

## Known Gotchas (already solved this project — don't rediscover)
- `expires_after` on HitPay Payment Request creation must be `'5 min'`, NOT
  `'5 minutes'` — HitPay's own docs example is wrong and returns a 422.
- HitPay Payment Request creation requires `application/x-www-form-urlencoded` +
  `X-Requested-With: XMLHttpRequest` headers, not JSON.
- The `webhook` parameter on Payment Request creation is deprecated — webhooks are
  registered via HitPay's Dashboard instead.
- PayNow/QR payments have no cancel endpoint (only cards do) — HitPay's redirect
  with `status=canceled` is purely cosmetic and does not reflect real payment state.
- Stock-restoration logic already exists and must be reused: `lib/orders.ts` →
  `markOrderFailedAndRestoreStock(orderId)`.

## Dependencies
- `Order.hitpayPaymentRequestId` already exists in the schema
- `markOrderFailedAndRestoreStock` already exists in `lib/orders.ts`
- The exact reconciliation logic to reuse already exists in `reconcileIfStale`
  (`app/checkout/success/page.tsx`) — just needs extracting into a shared location
- No new npm packages expected (Vercel Cron is configured via `vercel.json`, not a library)

## After This Task
Custom branded order confirmation email (provider TBD, likely Resend — HitPay's
built-in `send_email` receipt already works as a tested interim solution).