# Immediate Next Task: Deploy and Verify Browser Security Headers

Payment Batch 2 is complete with the owner-accepted HitPay limitation: an
online declined attempt remains retryable/unpaid, and the customer starts a
fresh checkout. The next approved remediation adds static browser security
headers without disabling the storefront's 60-second ISR/CDN behavior.

## Local Security-Header Status

`next.config.ts` now applies these headers to all routes:

- Enforcing `Content-Security-Policy`
- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- Restrictive `Permissions-Policy`

The CSP retains the App Router and Clerk requirements for inline scripts/styles,
allows only the documented Clerk/Cloudflare executable, connection, and frame
origins, supports current secure remote catalogue images, blocks plugins and
framing, and excludes development-only `unsafe-eval` in production. Targeted
lint, TypeScript, Prisma generation, the Next.js 16.2.11 43-page production
build, and generated route-manifest inspection pass. Whole-project ESLint
remains at the documented pre-existing baseline.

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

## Deployment and User-Present Verification

Commit and deploy the local changes. Confirm all five headers on the custom
domain, then smoke-test sign-in/sign-up, the account and admin areas, product
images, theme switching, cart, and checkout while checking for browser CSP
violations. Production Clerk key/domain rotation remains a separate owner-led
step and requires repeating the auth/CSP smoke test.

Do not wipe data during Phase 2. Do not start or stop the development server
unless the admin explicitly asks.
