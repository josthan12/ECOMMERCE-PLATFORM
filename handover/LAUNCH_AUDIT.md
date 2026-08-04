# Technical Launch Audit

**Audit date:** 2026-08-01  
**Decision:** **READY FOR FINAL TECHNICAL RE-AUDIT. No recorded High-severity engineering blocker remains open.**

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
| PASS | High | Production uses a verified Clerk production instance. | On 2026-08-03 the owner configured the custom Clerk domain and DNS/certificates, production-scoped Vercel keys, a production `user.created` webhook, and custom Google OAuth credentials with the Google app published to production. The existing local admin was guardedly rebound to the owner's production Clerk ID. Production sign-in, owner `/admin`, fresh customer signup/account access, customer denial from `/admin`, webhook-backed `CUSTOMER` creation, and the final browser/CSP check passed without a Clerk development warning. | Retain production-only hosting keys, keep local/preview development credentials separate, and preserve the recorded rollback mapping until the production instance is considered stable. |
| PASS | High | The Next.js advisory blocker is remediated and deployed. | `next`, `eslint-config-next`, `@next/env`, the ESLint plugin, and the Windows SWC binary are `16.2.11`. TypeScript and the 43-page production build pass, the lint baseline is unchanged, the prior Next.js advisories are absent, Vercel deployed commit `0f4d7f3`, and production storefront/sitemap smoke checks passed. | Continue tracking the separately recorded residual advisories as their own dependency batch. |
| PASS | High | Atomic/idempotent payment terminal transitions passed a real concurrent race. | Real-expiry order `cmsb9j9ur000304l83998i5wz` restored stock once and produced one `SENT` failure email. For fresh expired order `cmsba022h000604l8t2coj5ys`, two authenticated reconciliation requests both selected the order and returned 200 concurrently, but the conditional transition produced one `PAYMENT_FAILED` state, one stock restoration from 2 to 3, and one `SENT` delivery row with one attempt and a Resend ID. | Retain the database constraints and stable provider idempotency keys. Expiry exercises the shared failure transition; the provider-specific online `failed` limitation is recorded below. |
| PASS | High | Completed payment and durable confirmation email passed after sender correction. | Paid order `cmsb97nri000004l8gs3ji9qq` has exactly one `CONFIRMATION` row in `SENT` state with a Resend ID. The owner confirmed receipt. The row succeeded on attempt 2 after correcting the Vercel sender configuration. | No payment-code remediation required. Keep monitoring delivery failures and do not reset the old capped test row before the later wipe. |
| PASS | High | Production transactional order and newsletter sender configurations work. | The paid-order confirmation above sent successfully. Newsletter post `cmsbajgb1000004l810gl3dgn` sent to one subscribed customer with one delivery, one success, zero failures, and a Resend ID. The owner confirmed inbox receipt of the paid confirmation, both payment-failed messages, and the newsletter test. The older `$5` confirmation remains failed at its five-attempt cap as pre-fix test evidence. | Preserve valid unquoted sender syntax during future secret rotation and continue monitoring delivery failures. |
| PASS | High | Browser security policies are deployed and compatible with the current storefront. | The custom domain returns the enforcing CSP, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, and the restrictive `Permissions-Policy`. The response remained a Vercel ISR cache hit. Homepage, product images, theme switching, signed-in account/orders, customer denial at `/admin`, admin dashboard access, populated cart, checkout shipping/totals, and cart cleanup passed with no CSP console violations. The post-migration production Clerk storefront check also produced no console warning or CSP error. | Retain the policy and repeat auth/CSP checks after future Clerk-domain or authentication changes. |
| PASS | High | WCAG AA contrast remediation is deployed and verified. | The final computed production scan passed on the homepage, catalogue, product detail, cart, checkout, account/orders, and admin routes in both light and dark themes. The ink-section labels resolve to the light-gold token at `10.62:1`/`12.03:1`; Recharts axes, series, and inner legend labels use their accessible theme palettes. Two automated out-of-stock badge reports were `oklab()` parsing false positives; direct inspection gives a worst-case composited contrast of `12.01:1`. No application or CSP console error appeared, and the later production Clerk migration removed the last development-instance warning. | Retain the semantic surface/accent split and rerun computed checks after future palette or theme changes. The owner-run screen-reader pass remains a separate Phase 3 task. |
| PASS | High | Production error tracking and uptime alerting are configured and verified. | On 2026-08-04 commit `6afb773` deployed production-only Sentry browser/Node/Edge/request/global-error capture, privacy filtering, release source maps, and a no-store `/api/health` database probe. The harmless admin-authenticated event mapped to `app/api/admin/monitoring-test/route.ts:17` with release/environment tags and without user identity, cookies, headers, body, or query data. Sentry Uptime monitor `7983784` recorded healthy `200` checks, a controlled 404 downtime issue, one email-alert trigger confirmed in the dashboard and received by the owner, then a restored `200` recovery with no ongoing issue. | Retain the production-only Sentry variables, privacy hooks, exact CSP ingest origin, one-minute health monitor, three-failure/one-success thresholds, and connected email alert. Rotate the upload token during normal secret rotation. |

## Other Findings

| Status | Severity | Finding | Evidence | Recommended remediation |
| --- | --- | --- | --- | --- |
| FAIL | Medium | Cron secret can be supplied in a URL query parameter. | `app/api/cron/reconcile-orders/route.ts:13-14` accepts either Bearer authorization or `?secret=`. Query strings are commonly retained in request logs. The unauthenticated production route correctly returned `401`. | After verifying the scheduler supports headers, remove query-string authentication and accept an exact Bearer token only. |
| PASS | Medium | The owner accepted HitPay's retryable online-decline limitation for the PayNow-only launch flow. | The dashboard exposes no webhook replay control. An official declined sandbox card displayed “Your card was declined,” but the payment link remained `Unpaid` and emitted no webhook; the intended customer behavior is to show failure and start a fresh checkout. The linked store order's real PayNow request later expired, producing one `PAYMENT_FAILED` transition, one stock restoration, and one sent failure email. | Keep the retry-checkout customer behavior. Do not describe a declined attempt as terminal webhook coverage; reopen this test if the configured payment methods or HitPay simulator capabilities change. |
| PASS | Medium | Checkout-success ownership is enforced before reconciliation. | In production, the admin/non-owner received the not-found page for paid order `cmsb97nri000004l8gs3ji9qq`, while its disposable customer owner saw the complete confirmed order. Read-only Neon checks before and after both requests showed the same `PAID` status, `updatedAt`, reference, and single email-delivery row. | No remediation required; retain this owner/non-owner regression check for future payment-flow changes. |
| PASS | Medium | `/robots.txt` is deployed and verified. | The production metadata route returns `200`, `text/plain`, the intended public allow/private-route exclusions, and `Sitemap: https://biggyballs69.gay/sitemap.xml`. The linked sitemap returns `200` as `application/xml` with correctly escaped entities and production-domain URLs. | Retain the route and recheck it after any public-domain change. |
| FAIL | Medium | Runtime and transitive dependencies still require supported upstream remediation. | The review in `handover/DEPENDENCY_REMEDIATION.md` records the supported-upstream constraints for Next, Sharp/PostCSS, tooling, and Prisma dependencies. After the Sentry install, `npm audit` reports 11 advisories (5 moderate, 6 high, no critical); review found an additional path to an already-present `fast-uri` advisory rather than a uniquely Sentry-only vulnerable package. No forced downgrade, prerelease framework, unsupported override, manual lockfile edit, or audit fix was made. | Recheck stable Next.js and Prisma releases, then perform a separately approved clean dependency update. Never run `npm audit fix --force`. |
| PASS | Medium | Empty-cart page has a page-level heading. | Production `/cart` renders “Your binder is empty.” as its single `h1`, retains its browse-categories action, and shows no Next.js error overlay. | Retain this semantic heading in future cart redesigns. |
| USER REQUIRED | Medium | Admin mutations still need an implemented audit trail, but the design is complete. | `handover/ADMIN_AUDIT_LOG_PLAN.md` defines an append-only, data-minimized model, atomic write semantics, covered actions, files, and acceptance tests. No schema or database change was made. | Review and approve the dedicated schema batch before implementation. |
| PASS | Medium | Whole-project ESLint passes. | All 42 errors and one warning were resolved without rule suppression. Explicit `any`, the product-form state-in-effect pattern, email literal findings, and the unused theme initializer catch binding were corrected. Full ESLint and TypeScript pass. | Keep whole-project ESLint as a required pre-deployment check. |
| FAIL | Low | Some catalogue pages have no meta description. | Live Pokemon English category and Prismatic Evolution product pages have canonical URLs and JSON-LD, but no description meta because the underlying records have no description/SEO description. | Owner supplies approved catalogue descriptions; verify metadata after the real-catalogue import. |
| PASS | Low | Checkout provider error logging is deployed with a strict allowlist. | A failed HitPay payment-request response logs only the event label, internal order ID, and HTTP status; the raw provider body is never read or logged. The deployed route was source- and build-verified without creating a probe order. | Retain the structured allowlist and inspect the next organic provider failure if one occurs. |
| USER REQUIRED | Low | The Turbopack workspace warning is resolved; the owner-controlled PostgreSQL SSL warning remains. | The deployed `next.config.ts` sets the documented absolute Turbopack root, and the 44-route build no longer emits the multiple-lockfile/root warning. The build still warns that `sslmode=require` changes semantics in future `pg`; the secret value was not displayed or changed. | During secret rotation, the owner explicitly chooses `sslmode=verify-full` to retain current strict verification, then reruns the build/database smoke test. |

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
| PASS | Customer order isolation in rendered pages | Account order list queries by the signed-in user and order detail checks ownership before rendering. Production checkout-success testing also returned not-found to a non-owner and the complete confirmed order to its owner without changing the order or email-delivery state. |
| PASS | Webhook authenticity checks | HitPay verifies the gateway signature using the raw request body; Clerk verifies required Svix headers and signature. Sandbox completion, expiry, and concurrent reconciliation passed; the accepted provider-specific online-decline limitation is recorded above. |
| PASS | Hosted payment/raw-card boundary | Checkout sends customers to a hosted HitPay request and currently requests `paynow_online`. No raw card number, CVV/CVC, expiry, or PAN fields were found in app requests, logs, schema, or tracked source. |
| PASS | HitPay sandbox completed path | Order `cmsb73cf1000004juqzit9kz8` reached `PAID`; its one Silver Tempest item reduced stock exactly once from 4 to 3, and its zero discount correctly produced no system promotion expense. Its pre-fix email row remains capped and failed; newer paid order `cmsb97nri000004l8gs3ji9qq` confirms the corrected sender delivers exactly one confirmation successfully. |
| PASS | HitPay sandbox expiry path | HitPay returned real `expired` status for order `cmsb9j9ur000304l83998i5wz`; authenticated reconciliation returned 200, transitioned it to `PAYMENT_FAILED`, restored stock once, and sent exactly one failure email. |
| PASS | Newsletter sender | The clearly labelled production test broadcast sent to the sole subscribed customer with one durable delivery, one success, zero failures, and a Resend provider ID. |
| PASS | Sitemap | `/sitemap.xml` returns valid XML, renders without the prior entity error, and includes public/category/product entries. It intentionally still contains disposable test records until the separately approved wipe. |
| PASS | Canonical and structured data | Home/category/product canonical URLs are absolute and correct. Product and BreadcrumbList JSON-LD parse successfully and the serializer escapes script-breaking `<`. |
| PASS | ISR/cache behavior | Root layout declares 60-second revalidation; the production build marks public pages accordingly. Vercel serves prerender/cache headers and returned a sitemap cache hit. |
| PASS | Baseline semantics | Automated checks on home, categories, category detail, product, cart, and sign-in found a language attribute, main landmark, skip target, no duplicate IDs, no positive tabindex, no missing image alt attributes, and no unnamed visible buttons/links on the loaded states. |
| PASS | Secret source-control hygiene | No environment files, private keys, or secret files are tracked. Environment values were never printed. |
| PASS | Transport protection | Production sends `Strict-Transport-Security: max-age=63072000`. |

## Phase 2 — User Presence or Approval Required

These checks require authenticated interaction or external side effects.
Completed items are marked below; the remaining items still require a focused
owner-present pass:

- Approve specific remediation batches from this report.
- Exercise HitPay sandbox completed, failed, and expired paths, including
  duplicate webhook/reconciliation delivery and exactly-once stock/email
  behavior.
- Verify cron execution records, Resend delivery/events, and Vercel production
  errors using the service dashboards.
- [x] Connected and tested production Sentry error tracking and uptime
  monitoring on 2026-08-04, including owner-confirmed email delivery and
  recovery.
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
