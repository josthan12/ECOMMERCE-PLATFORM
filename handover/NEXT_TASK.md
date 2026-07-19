# NEXT_TASK.md

## Status of the previous plan (superseded)
Deployment verification (the checklist that was the immediate next task as
of Session 9) is now CLOSED — full successful payment path re-tested on the
live Vercel URL through to `PAID` + confirmation email, env vars, and both
webhook registrations (Clerk + HitPay, ngrok + Vercel) all confirmed by the
admin's own direct testing in Session 10. The custom domain
(`biggyballs69.gay`) is also now connected and live, ahead of its original
Phase 9 slot — motivated by a real email-deliverability finding, not just
general housekeeping. See CURRENT_STATE.md and SESSION_LOG.md (Session 10)
for full detail.

Session 10 also went well beyond deployment verification: a real production
bug on `/checkout/success` was found and fixed, Phase 6's search bar was
scoped and fully built (deliberately without Meilisearch, and deliberately
without the AI assistant), and — as the largest unplanned piece of work —
full edit/delete/archive capability was added to the admin panel for
Categories, Products, and Product Types, none of which had ever had it.
None of that admin-CRUD work was on the original roadmap; it was discovered
as a genuine gap and closed in the same session. See ROADMAP.md's Phase 2
addendum and DECISIONS.md (2026-07-17 entries) for full reasoning.

---

## Immediate Next Task: decide Phase 6 (AI Assistant) vs. Phase 7 (theming)

Two genuinely open threads, both flagged explicitly during Session 10 —
decide at the start of the next session, don't default to one silently:

### Option A: Continue Phase 6 — AI Shopping Assistant
Search (the other half of Phase 6) is done. The AI assistant was
deliberately deferred as its own increment rather than built in the same
pass — see DECISIONS.md (2026-07-17). Architecture direction is already
decided: tool-calling against Prisma directly (not Meilisearch — that was
evaluated and rejected for search already, and the same reasoning carries
over here), an LLM parses natural-language queries into structured filters,
calls a real product-lookup function, and only ever answers from what that
function actually returns (no hallucinated products). Still needs proper
scoping before any code: which LLM/API, the tool-calling request/response
shape, the chat UI's placement, and — a genuinely separate, real
requirement, not an afterthought — the PDPA consent flow that must exist
before the assistant can access any personal data, plus the memory/
preferences piece that depends on that consent flow.

### Option B: Shift to Phase 7 — Theming
Raised twice now as a real complaint, not idle observation — the admin
called the current UI "ugly" this session, and meaningfully more unstyled
surface area has accumulated since Phase 7 was last discussed (the new
search UI, `ProductCard`, several new admin edit forms). Doing a real
design pass sooner rather than later avoids styling an ever-growing pile of
components later in one big pass. Phase 7 as scoped in ROADMAP.md is fairly
large (drag-and-drop homepage builder, full theme system, CMS pages,
promotions) — worth deciding whether to do all of it, or split out a
smaller "just make it not ugly" pass (Theme Builder / visual polish only)
ahead of the rest.

**Decide which at session start** — this file deliberately doesn't
pre-select one; both are legitimate priorities and the tradeoff (finish the
differentiator feature vs. address a real, repeated usability complaint)
is a product decision, not a technical one.

---

## Open Questions (resolve at session start)
1. Phase 6 (AI Assistant) or Phase 7 (theming) first?
2. If Phase 7: full scope as originally planned, or a smaller "theme pass
   only" slice first (colors/typography/spacing) ahead of the
   homepage-builder/CMS/promotions pieces?
3. If Phase 6: which LLM/API for the assistant, and what should the chat
   UI's placement/trigger be (a persistent widget, a dedicated page, both)?
4. Product Type deletion/reassignment was deliberately closed off this
   session as a permanent "not building this" decision — worth confirming
   that's still the right call once there's been more real usage of the
   Product Type edit page, rather than treating it as fully settled forever.

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
  **Recurred three more times this session** (search suggestions route,
  plus dead Edit links on all three admin list pages pointing at
  non-existent paths) — when adding any new admin edit page, explicitly
  verify the corresponding list page's link actually points at the new
  page's real path; don't assume it was wired correctly.
- Stale Prisma client / `.next` cache after any schema migration is a
  recurring failure mode — `rm -rf .next` + `npx prisma generate` + restart,
  in that order. **If that sequence doesn't resolve a runtime (not just
  editor-level) Prisma validation error**, don't just repeat it — verify
  each link in the chain instead: confirm the schema file change actually
  saved, run `npx prisma migrate status` to confirm the migration applied,
  then re-run `prisma generate` and read its actual output rather than
  assuming success.
- Email sends must never be nested inside another call's argument object,
  and never awaited inside a Prisma `$transaction` block.
- ngrok tunnels block non-browser automated callers (cron pingers, and
  likely other webhook-style callers) with a bot-protection interstitial
  page (`ERR_NGROK_6024`) — fine for manual browser-driven testing,
  unsuitable for anything that needs to call your app on a schedule or
  from another service without a browser involved.
- Local `.env` and Vercel's environment variables are intentionally
  different on webhook secrets and `NEXT_PUBLIC_APP_URL` — each
  environment has its own registered webhook endpoints; don't "sync" these
  or you'll break whichever environment's secret you overwrite.
- Automatic background reconciliation is live, not deferred —
  `lib/reconcileOrder.ts` is the shared logic, called by both
  `/checkout/success` and the scheduled `/api/cron/reconcile-orders` route.
  Any future reconciliation changes belong in that shared file.
- **New (2026-07-17): `NEXT_PUBLIC_*` env vars are baked in at BUILD time,
  not read live** — this has now caused confusion twice (Session 7's
  `localhost` email-link bug, this session's domain switch). Editing the
  value in Vercel's dashboard alone does nothing until the next deploy;
  always pair a `NEXT_PUBLIC_*` change with an explicit redeploy.
- **New (2026-07-17): any Prisma query that lists products for
  customer-facing display must explicitly filter `archived: false`** — this
  is not a global/automatic filter. If a new product-listing surface is
  ever added (a new homepage section, a promotions page, anything), this
  filter needs to be added by hand, the same way it had to be added to four
  separate existing files this session.
- **New (2026-07-17): `Category.slug`, `Product.slug`,
  `Product.productTypeId`, and `ProductField.key`/`.type` are all
  intentionally locked/immutable after creation**, enforced at the
  application layer (not the database) — don't "fix" this by making them
  editable without re-reading the specific reasoning for each in
  DECISIONS.md first, since each protects against a different kind of
  silent data corruption or broken public URL.

## Dependencies
- All Phase 4/5 infrastructure remains stable.
- Production deployment on `biggyballs69.gay`, fully verified, custom
  domain live.
- Phase 6 search is complete and live; the AI assistant half is unstarted.
- Full admin CRUD (edit for all three core entities, delete for Categories,
  archive for Products) is complete and live.
- No new npm packages currently installed for either Phase 6 (AI) or
  Phase 7 (theming) — both would need dependency decisions made fresh at
  session start (LLM SDK choice for Phase 6; whether Phase 7's theme system
  needs any new packages beyond what Tailwind already provides).

## After This Task
Whichever option is chosen, the other remains queued. Beyond that: Phase 8
(performance/SEO/accessibility/PDPA-compliance-verification) and Phase 9
(launch — genuine production credentials, remaining DNS/SSL work beyond the
custom domain already connected) are both still fully ahead. Bulk order
actions and Meilisearch both remain explicitly available to revisit later
if order volume or catalog size ever make the current simpler choices
insufficient — neither was rejected forever, both were judged unnecessary
for now.