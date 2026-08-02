# Technical Launch Audit

**Audit date:** 2026-08-01  
**Decision:** **NO-GO until the High-severity failures below are remediated and retested.**

## Scope and Constraints

This is a non-destructive technical launch-readiness audit. No application,
database, deployment, or external-service settings were changed. No orders or
payments were created, no development server was started or stopped, and no
secret values were displayed or recorded.

Legal wording, legal policies, and PDPA coverage are excluded from engineering
scope and remain solely with the owner and their lawyer. Results in this report
are technical findings only and are not legal or PDPA compliance certification.

## Launch Blockers

| Status | Severity | Finding | Evidence | Recommended remediation |
| --- | --- | --- | --- | --- |
| FAIL | High | Production uses a Clerk development instance. | The live browser loads `*.clerk.accounts.dev`, displays `Development mode`, and emits Clerk's production warning. | Owner creates/activates the production Clerk instance and enters production keys in Vercel without sharing them. Retest sign-in, sign-up, customer routes, admin authorization, and Clerk webhooks. |
| PASS | High | The Next.js advisory blocker is remediated and deployed. | `next`, `eslint-config-next`, `@next/env`, the ESLint plugin, and the Windows SWC binary are `16.2.11`. TypeScript and the 43-page production build pass, the lint baseline is unchanged, the prior Next.js advisories are absent, Vercel deployed commit `0f4d7f3`, and production storefront/sitemap smoke checks passed. | Continue tracking the nine residual non-Next advisories as their own dependency batch. |
| USER REQUIRED | High | Atomic/idempotent payment terminal transitions are implemented locally; the additive Neon migration is applied, while deployment and sandbox concurrency verification remain. | `lib/payments/transitionOrderPayment.ts` uses a conditional `PENDING_PAYMENT` update and performs the winning stock restoration or promotional expense plus unique email-outbox creation in one transaction. Webhook, checkout compensation, and reconciliation now share it. `OrderEmailDelivery` records retry state and stable Resend idempotency keys. Prisma validation, TypeScript, targeted lint, production build, `migrate deploy`, and the post-migration status check pass. | Deploy the matching code, then test duplicate/concurrent completed, failed, canceled, and expired outcomes in HitPay sandbox and verify exactly-once state/side effects. |
| USER REQUIRED | High | Paid reconciliation now creates the same durable confirmation-email delivery as the webhook path. | `lib/reconcileOrder.ts` delegates completed status to the shared transition service. That service creates `CONFIRMATION` delivery inside the winning transaction; the cron also retries pending/failed payment-email rows. | After deployment, suppress a webhook or use a stale sandbox order and verify reconciliation produces exactly one accepted confirmation email and a `SENT` delivery record. |
| FAIL | High | Required production browser security policies are absent. | Live responses have HSTS, but no Content-Security-Policy/frame restriction, `X-Content-Type-Options`, `Referrer-Policy`, or `Permissions-Policy`. `next.config.ts` defines no production headers. | Add a reviewed Next.js headers policy compatible with Clerk, HitPay, Resend-hosted assets, and the site's media. Verify checkout/auth in production before tightening sources. |
| FAIL | High | Live storefront text fails automated WCAG AA contrast checks. | Computed-style checks found, among other examples, light-theme product status text at about `3.77:1`, format text at about `2.54:1`, and gold brand/action text below required thresholds. Both theme palettes were exercised. | Adjust semantic color tokens and rerun automated contrast checks across homepage, catalogue, product, cart, checkout, account, and admin surfaces in both themes. Then perform the owner-run screen-reader pass in Phase 3. |
| USER REQUIRED | High | Error tracking and uptime alerting are not configured or verified. | No application error-tracking integration or health/uptime monitor was found. The Vercel log page was accessible, but its virtualized entries could not be reliably extracted during the audit. | Select and connect approved error tracking and uptime monitoring in Phase 2; generate a harmless test event/outage alert and confirm owner delivery. |

## Other Findings

| Status | Severity | Finding | Evidence | Recommended remediation |
| --- | --- | --- | --- | --- |
| FAIL | Medium | Cron secret can be supplied in a URL query parameter. | `app/api/cron/reconcile-orders/route.ts:13-14` accepts either Bearer authorization or `?secret=`. Query strings are commonly retained in request logs. The unauthenticated production route correctly returned `401`. | After verifying the scheduler supports headers, remove query-string authentication and accept an exact Bearer token only. |
| USER REQUIRED | Medium | Checkout-success now validates ownership before reconciliation; deployment verification remains. | `app/checkout/success/page.tsx` first queries `{ id, userId }` ownership and calls `notFound()` before `reconcileOrderIfStale`. TypeScript, targeted lint, and build pass. | After deployment, use disposable customer accounts to verify owners reconcile normally and non-owners receive not-found without triggering a HitPay lookup. |
| FAIL | Medium | `/robots.txt` is missing. | Production returns `404` and the Next.js HTML not-found page; only `app/sitemap.ts` exists. | Add a Next.js metadata robots route pointing to the production sitemap and excluding authenticated/admin/checkout/API paths as technically appropriate. |
| FAIL | Medium | Runtime and transitive dependencies have unresolved advisories. | After the Next.js 16.2.11 patch upgrade, npm audit dropped from 20 to 9 advisories: 5 High and 4 Moderate, with no Critical. The residual findings involve `sharp`, `postcss`, Prisma/tooling dependencies through `@hono/node-server` and `valibot`, plus `brace-expansion` and `fast-uri`. npm's forced suggestion would downgrade Next.js to 9.3.3 and is not safe. | Handle residual direct/runtime and tooling advisories in a separately approved dependency batch; do not run `npm audit fix --force`. |
| FAIL | Medium | Empty cart has no page-level heading. | Automated semantic scan reported `h1Count: 0`; `app/cart/page.tsx` renders “Your binder is empty.” as a paragraph. | Render the empty-state title as an `h1` while preserving its styling. |
| FAIL | Medium | Admin mutations have no audit trail. | Admin APIs have role checks, but the Prisma schema has no audit-log model and mutation routes do not record actor/action/target. | Plan a minimal append-only technical audit log before launch. Treat the schema change as a separately approved batch. |
| FAIL | Medium | Whole-project lint does not pass. | ESLint reports 43 findings: 42 errors and 1 warning. Most errors are `no-explicit-any`; there is one React state-in-effect error and five unescaped-entity errors. | Resolve in a dedicated cleanup batch or classify and suppress narrowly with justification. Keep build/type checks green. |
| FAIL | Low | Some catalogue pages have no meta description. | Live Pokemon English category and Prismatic Evolution product pages have canonical URLs and JSON-LD, but no description meta because the underlying records have no description/SEO description. | Owner supplies approved catalogue descriptions; verify metadata after the real-catalogue import. |
| FAIL | Low | Checkout provider error logging may retain excessive detail. | Checkout still logs the raw HitPay error response body. Payment-email delivery now stores/logs only a capped message with delivery/order/type identifiers rather than complete provider objects. | Replace the checkout log with structured, redacted operational fields and a correlation/order ID. Do not log request bodies, customer addresses, provider authorization material, or raw gateway responses. |
| FAIL | Low | Build configuration emits deployment-maintenance warnings. | Build warns about multiple lockfiles/inferred workspace root and PostgreSQL SSL aliases whose future behavior changes. | Set the intended Turbopack root/clean up workspace lockfile ambiguity, and explicitly confirm the desired PostgreSQL `sslmode` during secret rotation. |

## Verified Passes

| Status | Area | Evidence |
| --- | --- | --- |
| PASS | Production build | `prisma generate && next build` completed successfully and generated 43 routes. No development server was used. |
| PASS | TypeScript | `tsc --noEmit` completed with exit code 0. |
| PASS | Next.js security patch | Next.js and `eslint-config-next` 16.2.11 are installed, locked, deployed, and production-smoke-tested; Prisma generation, TypeScript, and the production build pass. The prior Next.js-specific advisories are absent from the follow-up audit. |
| PASS | Storefront catalogue refresh | Production homepage shows Pokemon English and the new products in New arrivals; `/categories` and `/category/pokemon-english` contain the expected eight preview products. |
| PASS | Cart | Added one Prismatic Evolution variant, verified quantity/price/checkout CTA, removed it, and confirmed the browser-local cart was empty again. No checkout request or order was created. |
| PASS | Public responsive/theme behavior | Desktop navigation, compact/mobile navigation, absence of horizontal overflow on tested pages, and switching between light and Collector Midnight were observed on production. |
| PASS | Search rendering | The header search returned the correct Prismatic Evolution suggestion and an accessible live-region count. Full keyboard selection remains a Phase 2 interactive check because the browser automation focus driver did not move focus reliably. |
| PASS | Route protection | Signed-out `/account/orders` redirects to sign-in with a return URL; signed-out `/admin` redirects to sign-in. Static review found Clerk auth plus database `ADMIN` checks on admin layout and mutating admin APIs. |
| PASS | Customer order isolation in rendered pages | Account order list queries by the signed-in user and order detail checks ownership before rendering. The separate checkout-success ordering issue is recorded above. |
| PASS | Webhook authenticity checks | HitPay verifies the gateway signature using the raw request body; Clerk verifies required Svix headers and signature. Live webhook behavior still requires Phase 2 sandbox tests. |
| PASS | Hosted payment/raw-card boundary | Checkout sends customers to a hosted HitPay request and currently requests `paynow_online`. No raw card number, CVV/CVC, expiry, or PAN fields were found in app requests, logs, schema, or tracked source. |
| PASS | Sitemap | `/sitemap.xml` returns valid XML, renders without the prior entity error, and includes public/category/product entries. It intentionally still contains disposable test records until the separately approved wipe. |
| PASS | Canonical and structured data | Home/category/product canonical URLs are absolute and correct. Product and BreadcrumbList JSON-LD parse successfully and the serializer escapes script-breaking `<`. |
| PASS | ISR/cache behavior | Root layout declares 60-second revalidation; the production build marks public pages accordingly. Vercel serves prerender/cache headers and returned a sitemap cache hit. |
| PASS | Baseline semantics | Automated checks on home, categories, category detail, product, cart, and sign-in found a language attribute, main landmark, skip target, no duplicate IDs, no positive tabindex, no missing image alt attributes, and no unnamed visible buttons/links on the loaded states. |
| PASS | Secret source-control hygiene | No environment files, private keys, or secret files are tracked. Environment values were never printed. |
| PASS | Transport protection | Production sends `Strict-Transport-Security: max-age=63072000`. |

## Phase 2 — User Presence or Approval Required

These checks were intentionally not performed or could not be completed
without authenticated interaction or external side effects:

- Approve specific remediation batches from this report.
- Replace the production Clerk development instance and verify disposable
  customer/admin accounts.
- Exercise HitPay sandbox completed, failed, and expired paths, including
  duplicate webhook/reconciliation delivery and exactly-once stock/email
  behavior.
- Verify cron execution records, Resend delivery/events, and Vercel production
  errors using the service dashboards.
- Connect and test approved error tracking and uptime monitoring.
- Complete checkout and search keyboard journeys using a real browser focus
  sequence after contrast and payment fixes.
- Re-run the full technical audit and issue the launch-blocker go/no-go report.

No data wipe belongs to Phase 2.

## Phase 3 — Owner-Controlled Actions

- Enter rotated Clerk, HitPay, Resend, Neon, webhook, cron, and Vercel secrets
  without sharing their values.
- Perform one minimal live payment after sandbox coverage passes.
- Perform the human screen-reader test.
- Approve real catalogue content and imagery.
- Handle all legal wording, policies, and PDPA matters with the owner's lawyer.
- Give a separate explicit database-wipe confirmation only after all testing.
- Give final go-live approval after the final non-payment production smoke test.
