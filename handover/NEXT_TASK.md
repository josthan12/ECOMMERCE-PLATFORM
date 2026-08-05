# Immediate Next Task: Storefront Professionalism and Payment Direction

The final non-destructive technical launch re-audit completed on 2026-08-04.
The engineering decision is GO with recorded Medium/Low risks; no
High-severity engineering launch blocker remains open.

## Reset Completion Status (2026-08-05)

The separately authorized reset completed through the signed-in Neon Console
after a fresh guarded inventory. Exactly 273 disposable rows were deleted in a
locked transaction; the confirmed admin and 17 existing completed migrations
were preserved. The variant-description migration was applied as migration 18,
then one archived `Pokemon English` / `Mega Evolution—Pitch Black` product and
five described variants were imported with official images. The owner supplied
temporary price/stock pairs on 2026-08-05: Pokémon Center ETB S$300/3, ETB
S$150/2, Booster Bundle S$60/10, Booster Display S$300/2, and Build & Battle
Box S$40/3. Keep the set archived until the code/images are deployed; unarchive
only for the explicit storefront review. All order/customer-history tables
remain empty.

## Final Re-Audit Evidence

- The removed `/api/admin/monitoring-test` route returns `404` in production.
- `/api/health` returns `200 {"status":"ok"}` with no-store caching.
- Public storefront, robots, sitemap, category, product, search, HTTPS
  redirect, and signed-out route-protection checks passed.
- CSP, the four companion browser-security headers, and HSTS remain deployed;
  the homepage remains cacheable through Vercel.
- ESLint, TypeScript, Prisma schema validation, Prisma client generation, and
  the Next.js 16.2.11 production build passed. All 44 static pages generated.
- No data, payment, email, dependency, code, secret, deployment setting,
  external-service setting, or development-server process changed.

## Next Controlled Sequence

With the owner present:

1. Treat the recently issued Clerk production credentials and Sentry upload
   token as current; their values were never shared.
2. Resend rotation is functionally verified: the Production key was replaced,
   the site was redeployed, and controlled newsletter
   `cmsefshpp000004l831obsax9` sent to the sole subscriber (`1/1`) with
   owner-confirmed receipt. Confirm that the previous Resend key is revoked.
3. Cron rotation is functionally verified: `CRON_SECRET` and the cron-job.org
   target were updated, the target now uses the custom domain, and the
   owner-run test returned `200`. Confirm the five-minute job is enabled if it
   was paused. Query-string authentication remains an accepted Medium risk for
   this rotation and is still a separate hardening task.
4. Neon cutover is verified. The owner created a separate Console role, updated
   Vercel Production `DATABASE_URL` with `sslmode=verify-full`, and redeployed
   while retaining the original owner credential as rollback. Health, public
   catalogue reads, authenticated account orders, authenticated admin
   analytics, ten consecutive Sentry `200` checks, and the Vercel Ready/zero-
   error-log state passed. Do not delete or transfer the database owner role.
5. Inventory every remaining consumer of the original Neon credential. After
   migrating Vercel Preview/Development, local tools, and any other consumer,
   reset the original owner role password to invalidate the old connection
   string, preserve database ownership, and recheck production health.
6. **Completed 2026-08-05:** guarded reset, admin/migration preservation,
   variant-description migration, archived Pitch Black showcase import, and
   post-reset count verification.
7. Separately define and complete the owner-requested storefront
   professionalism pass. Do not infer its visual or functional scope before
   the owner supplies the requirements.
8. After the reset and professionalism pass, review
   `handover/PAYMENT_DIRECTION_OPTIONS.md` and choose either:
   - sole-proprietorship/provider onboarding for automatic PayNow
     verification, potentially retaining HitPay; or
   - the documented manual OCBC personal-PayNow QR and admin-verification
     workflow.
9. Only after that explicit decision, implement/configure the selected payment
   direction and perform one minimal live payment to verify exactly-once order
   status, stock, expense, and transactional-email behavior.
10. Complete the human keyboard and screen-reader pass and approve the real
    catalogue content and imagery before final launch approval.

## Separately Scoped Engineering Follow-Ups

- Remove cron query-string secret authentication after confirming Bearer-header
  scheduler support.
- Add narrowly scoped authenticated-checkout abuse control.
- Make Clerk `user.created` duplicate delivery a successful no-op.
- Revisit dependency remediation when supported stable Next.js/Prisma releases
  resolve the recorded Sharp/PostCSS/tooling paths.
- Implement the separately planned append-only admin audit log only after its
  schema batch is approved.
- Keep the potential manual PayNow replacement documentation-only until the
  owner explicitly selects it after the reset and professionalism pass.

Do not combine these hardening items with secret rotation or the data reset.
Do not wipe data, start or stop the development server, or change external
service configuration without the owner's explicit approval for that gate.
