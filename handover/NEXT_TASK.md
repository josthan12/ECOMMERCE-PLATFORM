# Immediate Next Task: Deploy Batch 1, Then Plan Payment Idempotency

Phase 2 Batch 1 is implemented locally. Next.js, `eslint-config-next`, all
Next.js platform packages, and the Windows SWC binary are locked at `16.2.11`.
Prisma generation, TypeScript, and the production build pass. ESLint remains at
the pre-existing 42 errors and one warning. The npm advisory count fell from 20
to 9; no Critical advisory remains and the prior Next.js-specific advisories
are gone.

## User-Present Step

The admin should review, commit, and deploy Batch 1. Verify the Vercel build and
the production storefront before marking the framework blocker PASS. Do not use
`npm audit fix --force`; its current suggestion would make an unsafe breaking
downgrade to Next.js 9.3.3.

## Next Approval Required

Before changing payment code or schema, present a focused implementation plan
for the next batch:

1. Make completed, failed, and expired order transitions atomic and
   idempotent.
2. Route HitPay webhook and reconciliation through the same transition service.
3. Guarantee exactly-once stock restoration, promotional expense recording,
   and confirmation/failure emails under duplicate or concurrent delivery.
4. Validate order ownership before checkout-success reconciliation.
5. Propose any schema migration separately and wait for approval.

Do not wipe data during Phase 2. Do not start or stop the development server
unless the admin explicitly asks.
