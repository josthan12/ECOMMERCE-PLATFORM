# NEXT_TASK.md

## Status of the previous plan (superseded)
This file previously offered two options for the next feature (Phase 6
search/AI, or deferred Bulk Actions) after Phase 5 closed. Neither was
started — an unplanned but important detour intervened first: a real
production bug was found (orders permanently stuck at `PENDING_PAYMENT`,
holding stock hostage, when a customer abandons a PayNow payment via the
browser Back button rather than HitPay's own "Back to Merchant" flow). This
reversed a previously-deferred decision (automatic background
reconciliation, DECISIONS.md 2026-07-13 → reversed 2026-07-15) and required
the project's **first real production deployment to Vercel**. See
CURRENT_STATE.md and SESSION_LOG.md (Session 9) for full detail.

The original Phase 6 vs. Bulk Actions decision is still unresolved and
remains the choice for whenever deployment verification is done — see
below.

---

## Immediate Next Task: finish verifying the Vercel deployment

Before picking a new feature, close out the checklist below — it's small,
mostly manual clicking/testing, not new code, but leaving it unconfirmed
risks discovering a broken production path later at a worse time (e.g.
during an actual customer's checkout).

- [ ] **Full successful payment path on Vercel** — go through checkout on
  `https://ecommerce-platform-ashy-one.vercel.app` for real, pay via
  sandbox PayNow to completion, confirm the order reaches `PAID` and the
  confirmation email arrives. (Only the failed/expired reconciliation path
  has been explicitly tested on this deployment so far — the success path
  uses a different webhook handler and hasn't been separately confirmed.)
- [ ] **Env var completeness** — check Vercel's Environment Variables
  against local `.env` line by line. Specifically confirm these made it in
  (they weren't part of the webhook-debugging back-and-forth so may have
  been missed): `GST_RATE_PERCENT`, `SHIPPING_FEE_SGD`,
  `SELF_COLLECTION_FEE_SGD`, `NEXT_PUBLIC_CLERK_SIGN_IN_URL`,
  `NEXT_PUBLIC_CLERK_SIGN_UP_URL`.
- [ ] **Dual webhook confirmation** — Clerk dashboard should show 2 active
  webhook endpoints (ngrok + Vercel), both enabled, not one disabled/
  replaced. Same check in HitPay's dashboard.
- [ ] **Admin panel smoke test** — log in as admin on the Vercel URL,
  confirm `/admin/orders` and `/admin/orders/[id]` both load correctly.

None of these are expected to fail, but none have been explicitly
confirmed either — this is a "verify, don't assume" pass on a deployment
that was built somewhat reactively while chasing a different bug.

---

## Next Feature (after verification) — still undecided, confirm at session start

### Option A: Begin Phase 6 — Search & AI Shopping Assistant
Per ROADMAP.md, start with Meilisearch provisioning + product indexing.
Genuinely new infrastructure (a new external service), needs careful
scoping: hosted vs self-hosted Meilisearch, indexing strategy (what fields,
triggered how — on-write vs scheduled re-sync), new env vars.

### Option B: Revisit deferred Bulk Actions (Phase 5)
Checkbox selection on `/admin/orders` + an action bar, likely starting with
just "Mark selected as Packed" (the single most common bulk op) rather than
every possible bulk action at once. Smaller, lower-risk than Option A.
Worth doing first if order volume has grown enough to make one-at-a-time
admin actions genuinely slow.

**Decide which at session start** — don't default to Option A without
checking whether B is more useful right now.

---

## Open Questions (resolve at session start)
1. Deployment verification checklist above — any items already failing
   silently that need fixing before either Option A or B?
2. Option A or Option B first?
3. Custom domain (`biggyballs69.gay`) connection — still deliberately
   deferred, or worth doing in this next session while already touching
   deployment-adjacent config?
4. If Option A: hosted Meilisearch or self-hosted?
5. If Option B: is "Mark selected as Packed" the only bulk action needed
   initially, or should it be dynamic per the same next-valid-stage logic
   as the single-order status button?

## Known Gotchas (already solved this project — don't rediscover)
- `expires_after` on HitPay Payment Request creation must be `'5 mins'`.
- Order fulfillment status transitions are branched by `fulfillmentMethod`
  — delivery and self-collection have different valid chains.
- Shipping address fields on `Order` are nullable — don't assume they're
  always present.
- Refunds are manual/record-only — no HitPay Refund API integration exists
  or should be added without a fresh explicit decision.
- New API routes must actually exist as files at the exact expected nested
  path — a scoped-and-written route can still fail to land during hand-off.
- Stale Prisma client / `.next` cache after any schema migration is a
  recurring failure mode — `rm -rf .next` + `npx prisma generate` + restart,
  in that order.
- Email sends must never be nested inside another call's argument object,
  and never awaited inside a Prisma `$transaction` block.
- **New (2026-07-15): ngrok tunnels block non-browser automated callers**
  (cron pingers, and likely other webhook-style callers) with a
  bot-protection interstitial page (`ERR_NGROK_6024`) — fine for manual
  browser-driven testing, unsuitable for anything that needs to call your
  app on a schedule or from another service without a browser involved.
- **New (2026-07-15): local `.env` and Vercel's environment variables are
  intentionally different** on webhook secrets and `NEXT_PUBLIC_APP_URL` —
  each environment has its own registered webhook endpoints; don't "sync"
  these or you'll break whichever environment's secret you overwrite.
- **New (2026-07-15): automatic background reconciliation is live**, not
  deferred — `lib/reconcileOrder.ts` is the shared logic, called by both
  `/checkout/success` and the scheduled `/api/cron/reconcile-orders` route.
  Any future reconciliation changes belong in that shared file.

## Dependencies
- All Phase 5 infrastructure is stable and extendable.
- Production deployment exists (Vercel, default URL) — pending full
  verification per the checklist above.
- No new npm packages currently installed for either Option A or Option B.

## After This Task
Whichever option is chosen, the other remains queued, along with the
custom domain connection and eventually genuine production credentials
(Phase 9 scope). Beyond that, Phase 6 continues into AI natural-language
search and the AI Shopping Assistant chat UI, or Phase 7 (Homepage
Builder, Theme, CMS) if priorities shift again.