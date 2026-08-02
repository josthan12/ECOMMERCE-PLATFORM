# Admin Audit Log Implementation Plan

## Status

Design complete; implementation requires a separate owner-approved schema
batch. No schema, migration, generated client, database, or admin UI change has
been made.

## Objective

Create a minimal append-only technical trail for successful admin mutations so
the owner can determine who changed which record, what action occurred, and
when it happened. The log is operational evidence, not legal or PDPA
certification.

## Proposed Model

```prisma
model AdminAuditLog {
  id          String   @id @default(cuid())
  actorUserId String
  action      String
  targetType  String
  targetId    String?
  metadata    Json?
  createdAt   DateTime @default(now())

  @@index([createdAt])
  @@index([actorUserId, createdAt])
  @@index([targetType, targetId, createdAt])
}
```

`actorUserId` is intentionally a plain local user-ID snapshot rather than a
foreign key, so deleting or resetting unrelated records cannot erase who
performed an earlier action. `action` and `targetType` remain strings so a new
admin operation does not require an enum migration.

## Data-Minimization Rules

`metadata` must use an explicit per-action allowlist. It may contain status
transitions, changed field names, safe record labels, and aggregate counts. It
must never contain:

- Secrets, authorization headers, cookies, or webhook signatures.
- Raw request or response bodies.
- Customer email, shipping address, payment-provider payload, or card data.
- IP address or user-agent fingerprint.
- Complete before/after database records.

## Write Semantics

- Return the authenticated local admin user from the shared authorization
  helper.
- Add a small `recordAdminAudit` helper that accepts either Prisma or a
  transaction client.
- Write the business mutation and audit row in the same database transaction
  whenever possible. A failed mutation must not create a success log.
- For hard deletes, capture only the safe target label needed for a meaningful
  log before deletion.
- Newsletter broadcast logging records the accepted admin request and post ID;
  existing delivery rows remain the source of per-recipient operational state.
- Payment/order logs describe the application action precisely. For example,
  the existing refund route records that the admin marked an externally handled
  refund; it must not claim that this application moved money.

## Initial Action Coverage

- Category: create, update, delete.
- Product: create, update, archive, unarchive.
- Product type: create, update.
- Expense: create, update, delete.
- Promo code: create, update, activate, deactivate, reactivate, delete.
- Order: advance status, update tracking, record refund.
- Newsletter: create, update, delete, request broadcast.

## Expected Implementation Files

- `prisma/schema.prisma`
- One new migration under `prisma/migrations/`
- Generated Prisma client under `app/generated/prisma/`
- `lib/adminApiAuth.ts`
- One new audit helper under `lib/`
- Admin mutation route handlers under `app/api/admin/`
- `handover/DATABASE_SCHEMA.md`, `handover/API_REFERENCE.md`,
  `handover/CURRENT_STATE.md`, and `handover/SESSION_LOG.md`

An admin log viewer is not required for the first batch. Read-only inspection
can initially use Prisma Studio; a protected paginated admin page can be planned
separately if operational use justifies it.

## Acceptance Tests

- Every successful covered mutation creates exactly one matching audit row.
- Rejected, unauthorized, validation-failed, and rolled-back mutations create
  no success row.
- Business mutation and audit creation roll back together on database failure.
- Logs identify the local admin, action, target, and timestamp without storing
  prohibited sensitive fields.
- Admin authorization, TypeScript, ESLint, Prisma validation/generation, and the
  production build pass.

