# Immediate Next Task: Milestone 4 Review Gate

Milestone 4 is implemented and has passed targeted ESLint, generated Next.js
route types, TypeScript, and a production build covering all 43 routes.

The admin should run the local server and verify:

1. Cart empty/populated states, quantity controls, removal, totals, and the
   checkout call to action.
2. Delivery and self-collection checkout, fulfilment-fee loading/retry,
   address labels, promotion-code feedback, order totals, and payment handoff.
3. Checkout success/pending/failure states.
4. Search suggestions, search result/no-result states, and keyboard focus.
5. My orders and a representative order receipt, including mobile table
   scrolling.
6. All of the above in light and Collector Midnight themes on desktop/mobile.
7. `/sitemap.xml`, a public canonical URL, and representative product/category
   social metadata.

Do not restart the server on the admin's behalf; they explicitly chose to run
it themselves.

---

## After Approval

Choose one focused launch-readiness task:

1. HitPay sandbox coverage, including the currently unverified failed-webhook
   path.
2. Formal axe/Lighthouse and screen-reader checkout testing.
3. PDPA consent, export, and deletion workflow verification.
4. Error tracking and uptime monitoring.
5. Resolve the existing whole-project lint baseline in a dedicated admin/API
   cleanup (42 errors and one warning as of Session 27).

The flat catalogue model remains approved:
Category -> Product/Set -> Variant/Format.

The final go-live gate must remind the admin to rotate every API key/secret and,
only after separate explicit confirmation, wipe all disposable Prisma data,
reseed approved production content, and run a final production smoke test.
