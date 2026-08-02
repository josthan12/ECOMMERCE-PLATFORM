# Immediate Next Task: Deploy the Independent Technical Cleanup

Payment Batch 2, Browser Security Batch 3, and Contrast Batch 4 are complete.
The independent cleanup batch now passes locally and needs deployment/live
verification before the owner-present Clerk migration.

## Completed Security-Header Verification

Production returns these headers on all routes:

- Enforcing `Content-Security-Policy`
- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- Restrictive `Permissions-Policy`

The live response remained a Vercel ISR cache hit. Homepage, product images,
theme switching, signed-in account/orders, non-admin denial, admin dashboard,
populated cart, checkout rates/totals, and cleanup passed. No CSP console error
was observed; the only warning was the separately tracked Clerk development-key
warning. The temporary cart item was removed and no order was created.

## Deployment Status

The additive migration `20260802000000_add_order_email_deliveries` was applied
successfully to Neon on 2026-08-02, and the post-check reports the database
schema up to date. Matching application commit `3f810bc` is Ready in Vercel
Production. The custom-domain homepage and sitemap return 200, the sitemap
parses as XML with 26 URLs, the unauthenticated cron route returns the expected
401, and the 33 visible recent Vercel log rows contain no 5xx response.

## Completed Verification

- Paid order `cmsb97nri000004l8gs3ji9qq` has one `CONFIRMATION` row in `SENT`
  state with a Resend ID. It succeeded on attempt 2 after the owner corrected
  the production sender value and redeployed.
- Real-expiry order `cmsb9j9ur000304l83998i5wz` moved from
  `PENDING_PAYMENT` to `PAYMENT_FAILED`, restored Silver Tempest stock from 2
  to 3 exactly once, and sent one payment-failed email on attempt 1.
- Concurrent-race order `cmsba022h000604l8t2coj5ys` was seen by two production
  reconciliation requests simultaneously. Both requests returned 200, while
  the database recorded one terminal transition, one stock restoration from 2
  to 3, and one `SENT` payment-failed delivery on attempt 1.
- Newsletter post `cmsbajgb1000004l810gl3dgn` sent to the one subscribed
  customer: one delivery, one success, zero failures, and a Resend ID.
- The old order `cmsb73cf1000004juqzit9kz8` retains its failed confirmation
  row at attempt 5. It is disposable evidence from before the sender fix; no
  retry counter or production record was altered.
- The recent Vercel log sweep showed 200 responses for reconciliation and
  newsletter broadcast and no 5xx. Its eight error-level entries were six
  known PostgreSQL SSL-mode warnings plus the two intentionally rejected
  invalid-signature webhook probes.
- Checkout-success ownership isolation passed in production. The admin account
  received the not-found page for paid order `cmsb97nri000004l8gs3ji9qq`, and
  its disposable customer owner saw the full confirmed order. Read-only Neon
  checks before and after both requests showed no status, timestamp, reference,
  or email-delivery change.
- The owner confirmed inbox receipt of both payment-failed messages and the
  clearly labelled newsletter test, completing human delivery verification for
  the tested production email paths.
- HitPay's official declined sandbox card produced the expected card-declined
  UI, but the payment link remained `Unpaid` and no webhook request reached
  Vercel. The dashboard exposes no event replay control. Disposable store order
  `cmsbgvg6a000004jv73e8unk9` subsequently followed the existing expiry path,
  reached `PAYMENT_FAILED`, restored Silver Tempest stock from 2 to 3, and sent
  exactly one failure email on attempt 1.

## Completed Contrast Verification

The deployed follow-up resolves the announcement divider, footer accent copy
and link hover, and category-card product count to the existing light-gold
token. The final computed production scan passed on homepage, catalogue,
product detail, cart, checkout, account/orders, and admin in both themes.
Recharts axes, series, and inner legend labels resolve correctly. Two
out-of-stock badge flags were scanner `oklab()` parsing false positives; direct
inspection gives `12.01:1` worst-case composited contrast. The only console
messages were the separately tracked Clerk development-key warnings.

## Independent Cleanup Ready

- `app/robots.ts` generates a static crawl policy and production sitemap link.
- The empty-cart title is an `h1`.
- HitPay payment-request failure logs contain only order ID and HTTP status.
- `next.config.ts` sets the documented Turbopack root; its warning is gone.
- Whole-project ESLint is clean: 42 errors and one warning were resolved without
  suppressions.
- `handover/DEPENDENCY_REMEDIATION.md` records supported versus unsafe upgrade
  paths; no package changed.
- `handover/ADMIN_AUDIT_LOG_PLAN.md` records the proposed append-only schema and
  route coverage; no schema or database changed.

Full ESLint, TypeScript, Prisma generation, and the Next.js 16.2.11 production
build pass. The build generates 44 routes including static `/robots.txt`.

## Deployment Verification

Commit and deploy this batch. Then confirm `/robots.txt` returns 200 with the
custom-domain sitemap, the empty cart exposes one page `h1`, public and admin
pages still render, and production has no new application/CSP errors. Do not
create an order solely to exercise the redacted error log.

## Next Owner-Present Batch

The owner creates or activates the Clerk production instance and enters its
publishable key, secret key, and webhook signing secret in Vercel without
sharing their values. Before any environment or external-service change, agree
on a focused migration and rollback plan.

After redeployment, verify production sign-up and sign-in, customer account
access, customer denial from admin routes, admin authorization, database user
synchronization through the Clerk webhook, and CSP compatibility with the final
Clerk origins. Error tracking and uptime monitoring remain a separate
owner-present batch.

Do not wipe data during Phase 2. Do not start or stop the development server
unless the admin explicitly asks.
