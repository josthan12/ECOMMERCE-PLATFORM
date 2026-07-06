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
