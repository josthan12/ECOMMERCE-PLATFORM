# Immediate Next Task: Configure Error and Uptime Monitoring

Payment Batch 2, Browser Security Batch 3, Contrast Batch 4, Independent
Cleanup Batch 5, and the owner-present Clerk production migration are deployed
and verified. The Clerk launch blocker is closed. The technical launch decision
remains NO-GO only because verified error tracking and uptime alerting are not
configured.

## Completed Clerk Production Migration

- Production uses the owner-created Clerk production instance on the custom
  domain; local and preview development credentials remain separate.
- Cloudflare DNS-only records and Clerk certificates are verified.
- The owner entered production Vercel keys and the production webhook signing
  secret without sharing their values.
- The existing database admin row is linked to the production Clerk owner while
  preserving its local identity, role, and relations.
- Google OAuth uses custom production credentials and is published to an
  external production audience with Clerk's default identity scopes only.
- Owner sign-in and `/admin`, fresh customer signup/account access, customer
  denial from `/admin`, webhook synchronization, and final CSP/browser checks
  passed.

## Next Owner-Present Batch

Before changing source, deployment settings, or external services, select an
approved error-tracking service and uptime monitor and agree on a focused
implementation and rollback plan. Then connect both services, generate a
harmless application test event and uptime alert, and confirm delivery to the
owner.

Secret rotation, the human screen-reader check, the minimal live payment, and
the final database reset remain separately controlled Phase 3 actions. The
admin audit log and dependency updates each require their own approved batch.

Do not wipe data during Phase 2. Do not start or stop the development server
unless the owner explicitly asks.
