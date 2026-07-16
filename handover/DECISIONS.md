# DECISIONS.md

Record important technical decisions.
DO NOT ERASE THE EXAMPLE.
START LOGGING DECISIONS AFTER THE EXAMPLE.

---

Example:

Decision:
Use Supabase.

Reason:
Built-in authentication.

Date:
2026-07-01

---

Decision:
Use Clerk over Auth.js for authentication.

Reason:
Solo developer with a lot of ground to cover. Clerk provides pre-built sign-in/sign-up UI components, session handling, and role storage out of the box. Auth.js gives more control but requires writing and debugging auth flows manually. The tradeoff of vendor dependency is acceptable for v1 — can migrate off Clerk later if needed.

Date:
2026-07-01

---

Decision:
Use Next.js API routes over NestJS for the backend.

Reason:
Simpler v1 architecture — keeps everything in one codebase. NestJS adds complexity and a separate deployment concern that isn't justified until the backend genuinely outgrows API routes. The PRD noted NestJS as "preferred" but recommended starting simple.

Date:
2026-07-01

---

Decision:
Use Prisma 7 (not Prisma 6).

Reason:
Already installed when the project was scaffolded. Despite being newer and having breaking changes from Prisma 6 (adapter pattern, no url in datasource, different generated client structure), it was decided to continue with Prisma 7 rather than downgrade, to avoid fighting version pinning and to stay on the forward-compatible path.

Date:
2026-07-01

---

Decision:
Commit the generated Prisma client (`app/generated/prisma/`) to the repository instead of gitignoring it.

Reason:
Vercel builds were failing because `prisma generate` during the build step was not producing the client correctly in the Prisma 7 + custom output path setup. Committing the generated files ensures Vercel always has them regardless of build step issues. The tradeoff is slightly larger repo size and the need to commit updated generated files after every schema change.

Date:
2026-07-01

---

Decision:
Store product type-specific fields in a `attributes Json` column on `Product` instead of creating a separate table per product type.

Reason:
The core PRD requirement is that admins can create new product types without code changes. Creating a new database table per product type would require a migration and code change for every new type. The JSON column approach means any product type's fields can be stored in the same column, with the `ProductType` and `ProductField` tables defining the schema/validation at the application layer.

Date:
2026-07-01

---

Decision:
Move `price` and `stock` off the `Product` model and onto `ProductVariant`.

Reason:
Almost all real products (shoes, clothing, electronics) have variants (size, color, storage) where each combination needs its own price and stock tracking. Building with a single price/stock on `Product` would have required significant rework when variants were added later. Since the database had no real customer data yet, it was the right time to make this structural change.

Date:
2026-07-01

---

Decision:
Use HitPay as the sole payment gateway (no Stripe).

Reason:
Singapore-specific context. HitPay is MAS-licensed, built for Southeast Asia, natively supports PayNow, GrabPay, ShopeePay, Atome, and cross-border tourist wallets (WeChat Pay, Alipay+, UPI etc.) that Stripe doesn't cover locally without workarounds. No monthly fees — pay per transaction, suitable for SME cost structure.

Date:
2026-07-01

---

Decision:
Use Neon (serverless PostgreSQL) over Railway for the database.

Reason:
Neon's free tier is generous, it supports branching (dev/staging/production branches from one account), and it's serverless so there's no "always-on" cost. The connection pooling via PrismaPg adapter handles the serverless connection model correctly.

Date:
2026-07-01

---

Decision:
Homepage sections (Hero Banner, Featured Products, Category Grid, Newsletter) are hardcoded in `app/components/homepage/`, with no `HomepageSection` database model.

Reason:
ROADMAP.md splits homepage work across Phase 3 (renderer + fixed section types) and Phase 7 (drag-and-drop reordering, per-section admin config). Building a DB-backed, admin-configurable homepage now would mean doing Phase 7's work early, ahead of the MVP cutline. A hardcoded array in `app/page.tsx` satisfies Phase 3's "modular... section renderer" requirement (separate, swappable components) without the schema/admin UI work that config-driven sections would require.

Date:
2026-07-03

---

Decision:
New shared/reusable UI components live under `app/components/` (nested inside the App Router's `app/` directory), not a top-level `components/` directory.

Reason:
The project's existing folder structure keeps all app code under `app/`, `lib/`, and `prisma/` at the root, with no precedent for a top-level `components/` folder. Next.js's router only treats `page.tsx`, `layout.tsx`, and `route.ts` files as routable — a nested `app/components/` folder is invisible to routing, so there's no functional difference between the two locations. Nesting avoids introducing a new top-level convention with no other use case driving it (single-project scope, not building for reuse across projects).

Date:
2026-07-03

---

Decision:
`ProductVariant.imageUrl` is optional and falls back to `Product.imageUrl` when unset, rather than requiring every variant to have its own image.

Reason:
Most SMEs won't have per-variant product photography for every SKU on day one. Making the field required would block product creation on missing assets. The fallback chain (variant image → product image → blank) lets admins add variant-specific photos incrementally without it being an all-or-nothing requirement.

Date:
2026-07-03

---

Decision:
`ProductGallery.tsx` types `Variant.combination` as `unknown` and normalizes it to `Record<string, string>` at runtime, rather than trying to type it as `Prisma.JsonValue` or a hand-rolled equivalent.

Reason:
`combination` is stored as a Prisma `Json` column, typed as `Prisma.JsonValue` — a recursive union including `null`, arrays, and primitives. The component's original `Record<string, string>` typing didn't satisfy this, causing a Vercel build failure not caught locally. A hand-rolled type matching `Prisma.JsonValue`'s shape still failed due to TypeScript's structural matching behavior on recursive unions with named vs. inline interfaces. Typing the prop as `unknown` sidesteps the structural comparison entirely (every type is assignable to `unknown`), and normalizing at runtime keeps the client component decoupled from Prisma-specific types while also making it defensive against malformed or null `combination` data in the database.

Date:
2026-07-03

Decision:
Guest checkout is disallowed — checkout requires a signed-in Clerk account.

Reason:
Simplifies order ownership and account-linked order history without needing separate guest-order data models. Guests are redirected to `/sign-in?redirect_url=/checkout`; the cart (localStorage-based) survives this redirect automatically since it isn't tied to auth state.

Date:
2026-07-06

---

Decision:
Cart data (price, stock) is never trusted at checkout — `/api/checkout` always re-fetches live `ProductVariant` data and snapshots verified values onto `OrderItem`.

Reason:
The cart is optimistic client-side state that can go stale. Checkout must be the authoritative source of truth for what's actually charged and recorded.

Date:
2026-07-06

---

Decision:
Shipping address is snapshotted onto `Order` as plain string columns, not a live FK to `Address`.

Reason:
Same reasoning as OrderItem price snapshotting — an Order is a historical record and must not silently change if a saved address is later edited or deleted.

Date:
2026-07-06

---

Decision:
Stock is decremented atomically at Order creation via `updateMany({ where: { stock: { gte: quantity } }, data: { stock: { decrement: quantity } } })` inside a Prisma transaction.

Reason:
Prevents the classic race condition where two concurrent checkouts for the last unit of stock could both succeed.

Date:
2026-07-06

---

Decision:
HitPay Payment Request creation uses `application/x-www-form-urlencoded` with `X-Requested-With: XMLHttpRequest`, not JSON.

Reason:
Confirmed via HitPay's documentation and live testing (an initial JSON attempt returned a 422).

Date:
2026-07-06

---

Decision:
HitPay webhook URL is registered via their Dashboard (Developers → Webhook Endpoints), not via the `webhook` parameter on Payment Request creation.

Reason:
HitPay has deprecated the per-request `webhook` parameter in favor of Dashboard-managed webhooks.

Date:
2026-07-06

---

Decision:
Stock-restoration-on-payment-failure logic is centralized in one shared helper, `lib/orders.ts` → `markOrderFailedAndRestoreStock(orderId)`.

Reason:
Needed identically in three places (checkout's compensating action, webhook's `failed` handler, lazy reconciliation) — a single shared function avoids drift between duplicated copies.

Date:
2026-07-06

---

Decision:
`expires_after` must be set to `'5 min'` when creating a HitPay Payment Request.

Reason:
Without this parameter, HitPay never expires a payment request — it stays `pending` indefinitely regardless of elapsed time, which silently broke our abandoned-payment reconciliation for an entire debugging session. HitPay's own documentation shows `"5 minutes"` as an example value, but this is incorrect and returns a 422 validation error; `'5 min'` is the confirmed-working format.

Date:
2026-07-06

---

Decision:
The order confirmation page shows a cosmetic-only "Payment Cancelled" message when redirected with `status=canceled`, without mutating the Order/stock state at that moment.

Reason:
PayNow-based payment requests cannot be cancelled via HitPay's API (no cancel endpoint exists for QR-based methods — only cards support cancellation). A customer may have already scanned the QR code before clicking "Back to Merchant," so immediately marking the order failed and restoring stock risks incorrectly releasing inventory for a payment that completes moments later.

Date:
2026-07-06

---

Decision:
Lazy, page-load-triggered reconciliation alone is insufficient — a Vercel Cron job is needed as a complementary mechanism.

Reason:
Confirmed via testing: if a customer abandons checkout and never revisits `/checkout/success` for that order, nothing currently reconciles it — the order stays `PENDING_PAYMENT` and its stock stays held indefinitely. A scheduled job that runs independently of any page visit is required to close this gap. This does not replace lazy reconciliation (which still gives faster resolution when the customer does return); it supplements it for the case where they don't.

Date:
2026-07-06

---

Decision:
Vercel Cron job (or any automated background reconciliation) is deferred, not built, despite being scoped as the immediate next task after Session 6.

Reason:
Two implementation paths were fully scoped: Vercel Cron (limited to once-daily on the project's current Hobby tier — a meaningful weakening of the original "minutes/hours" goal) and a GitHub Actions scheduled workflow (free, tier-independent, can run every few minutes, identified as the better option if this is revisited). Neither was built. Significant time had already gone into this specific gap across sessions, the existing lazy (page-load-triggered) reconciliation already resolves the common case, and the remaining risk — a customer abandoning checkout and never revisiting the confirmation page — was judged acceptable to mitigate with clearer on-page messaging (explicitly telling customers to refresh after completing payment, and not to reuse an old QR code) rather than new infrastructure. This keeps Phase 4 shippable without further delay. Explicitly rejected as an alternative: immediately restoring stock on the cosmetic `status=canceled` redirect — PayNow QR codes remain payable for up to 5 minutes after that redirect fires (no cancel endpoint exists for QR payments), so restoring stock at that point risks overselling if the customer completes payment moments later.

Date:
2026-07-13

---

Decision:
Use Resend + React Email for branded transactional emails (order confirmation, payment failed), triggered as a non-blocking side effect after the relevant DB operation resolves, never nested inside a Prisma transaction.

Reason:
Resend was the provider assumed in prior planning (NEXT_TASK.md) and required no code-level alternative evaluation once the user confirmed they wanted to proceed with it. React Email was chosen over hand-written HTML strings because it's the standard pairing with Resend and easier to iterate on styling. Email sends are deliberately kept outside of DB transactions and wrapped in try/catch that only logs on failure — an external email provider's availability must never affect order-processing correctness (a failed send should never roll back or block a status change). `markOrderFailedAndRestoreStock` in `lib/orders.ts` was chosen as the single trigger point for the payment-failed email specifically because it is already the single centralized place stock restoration happens, covering both the webhook's `failed` path and lazy reconciliation's `expired`/`canceled` path without duplicating the trigger.

Date:
2026-07-13

---

Decision:
Reject HitPay's Refund API and reject any order-cancellation feature entirely. Refunds are handled manually — the admin liaises with the customer directly (Telegram/email) and processes the actual refund via HitPay's dashboard or bank transfer, outside the app.

Reason:
HitPay does have a documented `Create Refund` API endpoint (Payment Request API, PayNow/Card only, confirmed via HitPay's public docs), so automated refunds were technically possible. The admin explicitly chose not to integrate it — refund requests are low-volume enough to handle personally, and doing so avoids building error handling for a real-money external API call (insufficient HitPay balance, refund window expiry, unconfirmed charge, etc.) for a feature that isn't a priority. Order cancellation was rejected outright for the same reason: once an order is confirmed/paid, it stays confirmed in the system; a refund is a separate, manual, out-of-band process, not a status the app itself triggers.

Date:
2026-07-14

---

Decision:
"Mark as Refunded" is a manual, admin-triggered, record-keeping-only action. It does not call any HitPay API and does not automatically restore stock.

Reason:
Given the above, once an admin has manually refunded a customer outside the app, the system still needs *some* way to reflect that — otherwise stock stays permanently locked as "sold" for an order that no longer represents a real sale, `/admin/orders` becomes unreliable as a source of truth, GST/revenue reporting drifts, and there's no audit trail distinguishing a completed sale from a refunded one. A simple status flag solves this without requiring a real payment-API integration. Stock is deliberately NOT auto-restored on refund, because a refund doesn't always mean the item comes back — a faulty-item refund where the customer keeps/discards the item is different from a genuine return, and there's no "Returns" flow (see below) to distinguish the two. Restoring stock automatically risked re-selling inventory that doesn't actually exist. The admin will adjust stock manually, case by case, via Prisma Studio if a refund is genuinely tied to a returned item.

Date:
2026-07-14

---

Decision:
Drop "Returns: admin approval flow" from the roadmap entirely, rather than build it as a separate feature.

Reason:
Given refunds are already handled manually via direct customer contact, a formal in-app Returns approval flow would duplicate that same manual process without adding real value at current scale. If return volume grows enough to need structured tracking later, this can be revisited — but it isn't blocking anything today.

Date:
2026-07-14

---

Decision:
Drop courier API integration, shipping label generation, and courier status sync from the roadmap entirely. Replace with a manual, freely-editable tracking number field on `Order`.

Reason:
The admin self-fulfills all shipping and prints their own shipping labels outside the app — there is no courier account/API to integrate against. Building courier integration would have been speculative work against a system that isn't actually being used. The tracking number field still gives customers *something* to reference (via the order-lifecycle email and their account order page) without requiring any external API.

Date:
2026-07-14

---

Decision:
Order fulfillment status transitions are branched by `Order.fulfillmentMethod`. Self-collection orders skip `SHIPPED`/`DELIVERED` and go directly from `PACKED` to `COMPLETED`; delivery orders keep the full original chain.

Reason:
`SHIPPED`/`DELIVERED` describe a carrier-based delivery event that doesn't apply to a customer physically walking in to collect their order — for self-collection, the meaningful next event after `PACKED` is the customer actually picking it up, which is recorded directly as `COMPLETED`. This was identified only after self-collection existed as a real, buildable option (originally scoped for "later"), requiring both the server-side transition map (`status/route.ts`) and the client-side button logic (`OrderStatusActions.tsx`) to be updated together to stay in sync.

Date:
2026-07-14

---

Decision:
Self-collection is built now (checkout toggle, live), not deferred to a future phase as originally scoped.

Reason:
Mid-session reprioritization — the admin decided self-collection was worth having immediately alongside the shipping-fee/courier-rejection changes, rather than waiting for a dedicated future feature pass. This meant reworking checkout validation, GST calculation, and the `Order` schema (nullable address fields) in the same session rather than as isolated future work.

Date:
2026-07-14

---

Decision:
Shipping address fields (`shippingBlock`, `shippingStreet`, `shippingPostalCode`) on `Order` are nullable. `lib/validateAddress.ts`'s `validateShippingAddress()` now requires a `fulfillmentMethod` parameter and short-circuits to valid (no address required) when `SELF_COLLECTION`.

Reason:
A customer picking up their own order in person has no need to provide a home delivery address. Making these fields required would force meaningless data entry for self-collection orders. This is a breaking signature change to a shared validation function used both client-side (`CheckoutForm.tsx`) and server-side (`app/api/checkout/route.ts`) — both callers were updated together in the same pass to avoid the two drifting out of sync.

Date:
2026-07-14

---

Decision:
GST (9%) applies to the flat shipping fee, not just the item subtotal. `lib/gst.ts`'s `calculateTotalWithGST()` now taxes `subtotal + shippingFee` combined.

Reason:
Explicit confirmation from the admin that shipping is not GST-exempt in this context. The function's signature change (optional second `shippingFee` param, defaulting to `0`) preserves backward compatibility for any caller that doesn't pass it — existing behavior is unchanged unless a fee is explicitly supplied.

Date:
2026-07-14

---

Decision:
Self-collection fee defaults to $0 but is read from a dedicated environment variable (`SELF_COLLECTION_FEE_SGD`), not hardcoded to zero in application logic.

Reason:
The admin wants the option to charge for self-collection in the future without a code change — same reasoning as `SHIPPING_FEE_SGD`. Both fees are exposed via a public `GET /api/checkout/fulfillment-fees` route (env-var-backed, read live per-request) so the checkout UI never shows a stale price after a `.env` change + server restart.

Date:
2026-07-14

---

Decision:
The self-collection pickup address is a hardcoded TypeScript constant (`SELF_COLLECTION_ADDRESS` in `lib/constants.ts`), not a database-backed, admin-editable setting.

Reason:
A `StoreSettings` Prisma model + admin settings page + API route was scoped in detail as the "properly editable" option, but explicitly rejected by the admin as overkill for a single value that changes rarely, if ever. The admin is comfortable editing the constant directly and redeploying when needed. If more store-wide settings accumulate in the future (contact info, business hours, etc.), a proper `StoreSettings` model should be revisited at that point rather than continuing to add one-off constants.

Date:
2026-07-14

---

Decision:
`expires_after` on HitPay Payment Request creation is `'5 mins'`, not `'5 min'`.

Reason:
Supersedes the 2026-07-06 decision above. Re-confirmed by the admin as the correct, working value — the earlier `'5 min'` finding from 2026-07-06 is superseded. The original decision entry is left in place rather than edited, per this file's convention of preserving decision history, but is no longer accurate. Note: this value has now changed once already based on empirical testing; if it needs correcting again in the future, an inline code comment at the call site in `checkout/route.ts` (not just a note in this file) is worth adding so the discrepancy is visible without cross-referencing session history.

Date:
2026-07-14

---

Decision:
Bulk order actions (mark packed in bulk, CSV export) are deferred, not built, despite being in the original Phase 5 scope.

Reason:
Not currently needed at present order volume. Unlike the items dropped outright above (courier integration, Returns flow, HitPay Refund API), this one is explicitly left open to build later if order volume grows enough that one-at-a-time admin actions become a real bottleneck.

Date:
2026-07-14

---

Decision:
Reverse the 2026-07-13 decision to defer automatic background reconciliation. It is now built and live, using an external cron-ping service (cron-job.org) hitting a new `/api/cron/reconcile-orders` route every 5 minutes.

Reason:
The 2026-07-13 deferral accepted a specific, named risk: a customer who abandons checkout and never revisits `/checkout/success` would leave their order stuck at `PENDING_PAYMENT` indefinitely, with stock held. That risk was assessed as low-probability enough to mitigate with clearer on-page messaging instead of new infrastructure. Real usage proved otherwise: the browser's native Back button (as opposed to HitPay's "Back to Merchant" button) bypasses `redirect_url` entirely, meaning `/checkout/success`'s lazy reconciliation never fires for that path at all — this isn't a rare edge case, it's a completely normal way for someone to abandon a payment, and it left orders permanently stuck until manually corrected in Prisma Studio. The original entry is left in place per this file's history-preservation convention, but its conclusion — that lazy reconciliation was sufficient — is superseded by this entry.

Date:
2026-07-15

---

Decision:
Use an external cron-ping service (cron-job.org) as the trigger for scheduled reconciliation, rather than GitHub Actions or Vercel Cron — both of which were previously identified (2026-07-13) as the two "real" options.

Reason:
Both previously-scoped options required either editing CI configuration (GitHub Actions, a `.yml` workflow file + secrets management) or a paid plan upgrade (Vercel Cron on Hobby tier is limited to once-daily, far too infrequent for a 5-minute payment expiry window). A free external cron-ping service achieves the same result — an HTTP call to one protected route on a fixed schedule — with meaningfully less setup: no repo changes, no new paid plan, and the schedule can be changed at any time without a deploy. The underlying reconciliation logic (`lib/reconcileOrder.ts`) is trigger-agnostic, so switching to GitHub Actions or Vercel Cron later remains possible without touching this logic, only the scheduler configuration.

Date:
2026-07-15

---

Decision:
The reconciliation cron route (`/api/cron/reconcile-orders`) only reconciles orders older than 6 minutes since creation, and reconciliation is a fixed-interval sweep (every 5 minutes) over all currently-matching orders, not a per-order scheduled check.

Reason:
HitPay's PayNow requests expire after exactly 5 minutes (`expires_after: '5 mins'`); checking orders younger than that would waste API calls on payments that are still legitimately in progress. A single sweep-based model (query for everything currently stale, reconcile all matches) was chosen over a per-order timer because it requires no additional scheduling infrastructure beyond the one recurring cron call — the tradeoff is that an order which goes stale immediately after a sweep completes won't be caught until the next sweep (~5 minutes later), which was judged an acceptable worst case for this store's order volume.

Date:
2026-07-15

---

Decision:
Deploy to Vercel using the default `*.vercel.app` URL, with environment variables matching local `.env` values (same dev Clerk instance, same dev Neon database branch), rather than fully provisioning a distinct production environment or connecting the custom domain in the same pass.

Reason:
The immediate goal was unblocking the reconciliation cron job with a stable, non-ngrok public URL — ngrok tunnels change on every restart and actively block non-browser automated callers (cron pingers) with a bot-protection interstitial page, making them unsuitable for this specific feature regardless of any other production-readiness work. Fully provisioning a genuine production environment (separate Clerk prod instance, separate Neon prod branch, live HitPay keys, custom domain DNS) is explicitly Phase 9 (Launch) scope per ROADMAP.md and was deliberately not pulled forward in the same session as debugging a specific reconciliation bug, to keep the session's scope contained. This means local dev and the current Vercel deployment share the same underlying database and Clerk instance — acceptable for now, but should be revisited with genuinely separate prod credentials before real customer traffic is expected.

Date:
2026-07-15