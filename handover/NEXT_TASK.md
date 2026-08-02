# Immediate Next Task: Deploy and Test Payment Idempotency

Phase 2 Batch 2 is implemented locally. It adds an atomic compare-and-set
payment transition, durable `OrderEmailDelivery` records with stable Resend
idempotency keys, cron retries, and ownership validation before authenticated
checkout-success reconciliation. Prisma validation/generation, TypeScript,
targeted lint, and the Next.js 16.2.11 production build pass. Whole-project
ESLint remains at the pre-existing 42 errors and one warning.

## Deployment Checkpoint

The additive migration `20260802000000_add_order_email_deliveries` was applied
successfully to Neon on 2026-08-02, and the post-check reports the database
schema up to date. Commit and deploy the matching application code next. The
migration added only two enums and the `OrderEmailDelivery` table and did not
rewrite existing orders.

## User-Present Verification

After deployment, exercise HitPay sandbox completed, failed, and expired paths.
Include duplicate/concurrent webhook and reconciliation delivery, then verify
exactly one terminal status, stock restoration or promotional expense, and
confirmation/failure email delivery record per order.

Do not wipe data during Phase 2. Do not start or stop the development server
unless the admin explicitly asks.
