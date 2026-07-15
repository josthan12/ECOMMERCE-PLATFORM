# NEXT_TASK.md

## Status of the previous plan (superseded)
This file previously scoped Phase 5 (Order Fulfillment) starting with admin
order visibility. That phase is now **complete for MVP purposes** — see
CURRENT_STATE.md and SESSION_LOG.md (Session 8) for the full build-out:
admin orders list/detail/filter/sort, branched fulfillment status lifecycle,
manual refund tracking, manual tracking numbers, two new customer
notification emails, customer-facing order history, and a mid-session
checkout scope change (shipping fee, self-collection, GST-on-shipping).
Several originally-planned Phase 5 items were deliberately dropped (courier
integration, shipping labels, courier sync, Returns admin flow — see
DECISIONS.md 2026-07-14) rather than built. Bulk actions were deferred, not
dropped, and remain available to pick up later if order volume warrants it.

---

## Next Feature (tentative — confirm at session start)
Two real options exist. Neither has been discussed in enough depth this
session to commit firmly — flagging both rather than assuming.

### Option A: Begin Phase 6 — Search & AI Shopping Assistant
Per ROADMAP.md, the natural starting point within Phase 6 is Meilisearch
provisioning + product indexing, since typo-tolerant search is the
foundation the later AI natural-language search and shopping assistant
build on top of. This is a genuinely new piece of infrastructure (a new
external service, not just new pages/routes on existing tables) and should
be scoped carefully at session start — provisioning, indexing strategy
(what fields get indexed, how re-indexing on product/variant changes is
triggered), and how search results map back to `/product/[slug]` and
`/category/[slug]`.

### Option B: Revisit deferred Bulk Actions (Phase 5)
If order volume has grown since Phase 5 closed, or the admin finds
one-at-a-time status updates genuinely slow, bulk actions (checkbox
selection on `/admin/orders` + an action bar, and/or CSV export) could be
picked up as a small, self-contained feature before moving into Phase 6.
Lower risk and smaller scope than Option A.

**Decide at session start which of these to pursue** — don't default to
Option A without checking whether Option B is actually more useful right
now.

---

## Rough Scope — Option A (Meilisearch, if chosen)
- Provision a Meilisearch instance (hosted, e.g. Meilisearch Cloud, or
  self-hosted — needs a decision, not yet made)
- Decide indexing strategy: index `Product` + `ProductVariant` combined? Index
  triggered on every admin product create/update, or via a scheduled
  re-sync? (Given this project's existing "everything else is
  Prisma-direct" convention, a webhook/trigger-on-write approach probably
  fits better than a cron re-sync, but this needs to be discussed, not
  assumed)
- New env vars needed: Meilisearch host URL + API key (public search key vs
  private admin key — Meilisearch distinguishes these)
- Storefront: new search input/page, typo-tolerant query against the index,
  results linking to `/product/[slug]`

## Rough Scope — Option B (Bulk Actions, if chosen)
- Checkbox selection UI on `/admin/orders` (per-row + "select all" on
  current filtered view)
- Action bar appears once ≥1 row selected — likely just "Mark selected as
  Packed" to start, matching the single most common bulk operation, rather
  than building every possible bulk action at once
- New API route: `PUT /api/admin/orders/bulk-status` or similar — needs the
  same fulfillment-method-branching logic as the existing single-order
  status route, applied per-order (a bulk request could contain a mix of
  delivery and self-collection orders at different valid next-stages)
- CSV export: likely a simple `GET /api/admin/orders/export` returning
  `text/csv`, respecting the current filter/sort from `searchParams`

---

## Open Questions (resolve at session start)
1. Option A or Option B first? (See above — not yet decided)
2. If Option A: hosted Meilisearch or self-hosted? Budget/ops implications
   differ.
3. If Option B: is "Mark selected as Packed" the only bulk status action
   needed, or should the bulk action be dynamic (whatever the *next* valid
   stage is for each selected order, mirroring the single-order button)?

## Known Gotchas (already solved this project — don't rediscover)
- `expires_after` on HitPay Payment Request creation must be `'5 mins'` (not
  `'5 min'`, not `'5 minutes'`) — see DECISIONS.md, corrected twice now.
- Order fulfillment status transitions are branched by `fulfillmentMethod` —
  any new code touching `OrderStatus` must account for both the delivery
  chain and the shorter self-collection chain (see DATABASE_SCHEMA.md).
- Shipping address fields on `Order` are nullable — don't assume
  `shippingBlock`/`shippingStreet`/`shippingPostalCode` are always present;
  self-collection orders have them as `null`.
- Refunds are manual/record-only — there is no HitPay Refund API
  integration anywhere in this codebase, and none should be added without
  a fresh explicit decision (see DECISIONS.md 2026-07-14).
- New API routes must actually exist as files at the exact expected nested
  path — a scoped-and-written route can still fail to land in the actual
  project during hand-off (happened this session with the tracking route),
  producing a generic client-side error that doesn't obviously point at
  "the file is missing."
- Stale Prisma client / `.next` cache after any schema migration is a
  recurring, well-documented failure mode in this project (Sessions 2, 5,
  8) — `rm -rf .next` + `npx prisma generate` + restart dev server, in that
  order, before assuming a new bug.
- Email sends must never be nested as a statement inside another call's
  argument object, and must never be awaited inside a Prisma `$transaction`
  block — both caused real bugs in Session 7.

## Dependencies
- All Phase 5 infrastructure (Order status lifecycle, email sending
  pattern, admin route auth-guard pattern) is stable and can be extended
  without re-deriving.
- No new npm packages currently installed for either Option A or Option B —
  Meilisearch (Option A) would need a client SDK (`meilisearch` npm
  package) added when that work begins.

## After This Task
Whichever option is chosen, the other remains queued. Beyond that, Phase 6
continues into AI natural-language search and the AI Shopping Assistant
chat UI (PDPA consent flow required before any personal-data-aware AI
memory work, per ROADMAP.md) — or Phase 7 (Homepage Builder, Theme, CMS) if
priorities shift again.