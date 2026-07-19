# API_REFERENCE.md

All API routes live under `app/api/`. All admin routes require the caller to be authenticated via Clerk AND have `role === 'ADMIN'` in the database. Unauthenticated requests return 401. Non-admin requests return 403.

---

## Webhooks

### POST /api/webhooks/clerk
Receives Clerk webhook events and syncs users to the database.

**Auth:** Verified via HMAC signature using `CLERK_WEBHOOK_SECRET` (svix library). Not a user-auth protected route.

**Handled events:**
- `user.created` → creates a new `User` row with `role: CUSTOMER`

**Request:** Raw body (Clerk webhook payload) with svix signature headers.

**Response:**
- `200 OK` — event processed
- `400` — missing headers or invalid signature

**File:** `app/api/webhooks/clerk/route.ts`

---

## Admin — Product Types

### GET /api/admin/product-types
Returns all product types with their fields.

**Auth:** Admin only.

**Response:**
```json
[
  {
    "id": "cuid",
    "name": "Laptop",
    "slug": "laptop",
    "description": "...",
    "fields": [
      {
        "id": "cuid",
        "label": "Brand",
        "key": "brand",
        "type": "TEXT",
        "required": true,
        "options": null,
        "order": 0
      },
      {
        "id": "cuid",
        "label": "RAM",
        "key": "ram",
        "type": "DROPDOWN",
        "required": true,
        "options": ["8GB", "16GB", "32GB"],
        "order": 1
      }
    ]
  }
]
```

**File:** `app/api/admin/product-types/route.ts`

---

### POST /api/admin/product-types
Creates a new product type with its fields in a single nested Prisma create.

**Auth:** Admin only.

**Request body:**
```json
{
  "name": "Laptop",
  "description": "Optional description",
  "fields": [
    {
      "label": "Brand",
      "key": "brand",
      "type": "TEXT",
      "required": true,
      "options": ""
    },
    {
      "label": "RAM",
      "key": "ram",
      "type": "DROPDOWN",
      "required": true,
      "options": "8GB, 16GB, 32GB"
    }
  ]
}
```

**Notes:**
- `slug` is auto-generated from `name`
- `options` arrives as a comma-separated string and is split into an array before saving
- Fields are saved in the `ProductField` table linked by `productTypeId`

**Response:** The created `ProductType` with nested `fields`.

**File:** `app/api/admin/product-types/route.ts`

---

### GET /api/admin/product-types/[id]
Returns one product type with its fields, ordered.

**Auth:** Admin only.

**Response:** Same shape as a single item from the list endpoint above.

**Errors:** `401`, `403`, `404`

**File:** `app/api/admin/product-types/[id]/route.ts`

---

### PUT /api/admin/product-types/[id]
Updates a product type's name/description and its field set (add, edit, remove, reorder). Added 2026-07-17.

**Auth:** Admin only.

**Request body:**
```json
{
  "name": "Laptop",
  "description": "Optional description",
  "fields": [
    { "id": "existing-field-cuid", "label": "Brand (updated label)", "key": "brand", "type": "TEXT", "required": true, "options": "" },
    { "label": "New Field", "key": "warranty_months", "type": "NUMBER", "required": false, "options": "" }
  ]
}
```
Fields with an `id` are treated as existing fields to update; fields without one are created new. Any existing field whose `id` is missing from the submitted array is deleted (subject to the guard below).

**Behavior:**
- `key` and `type` on an existing field (has an `id`) are **never taken from the request body** — always re-derived from the field's current stored values, even though the edit UI already disables those inputs client-side. Only `label`, `required`, `options`, and `order` (array position) are actually updated on existing fields.
- Before deleting any field, checks whether any `Product` of this type has a non-empty value for that field's `key` in `attributes`. If so, the entire request is rejected — no fields are deleted or updated — with a `400` naming the affected field(s) and how many products use each.
- Checks for duplicate keys across the final field set (existing fields being kept + any newly added ones) — rejects with `400` if found, since two fields sharing a key would silently collide in `attributes`.
- `name`/`description` update, and all field create/update/delete, happen in one `$transaction`.

**Response:** `200` — the updated `ProductType` with nested `fields`.

**Errors:** `401`, `403`, `404` (type not found), `400` (missing name, non-array fields, in-use field removal blocked, duplicate keys)

**File:** `app/api/admin/product-types/[id]/route.ts`

---

## Admin — Products

### GET /api/admin/products
Returns all products with their product type. Includes archived products — this endpoint is admin-only and archived filtering is deliberately NOT applied here, since admins need full visibility.

**Auth:** Admin only.

**Response:**
```json
[
  {
    "id": "cuid",
    "name": "MacBook Pro 14",
    "slug": "macbook-pro-14",
    "imageUrl": "https://...",
    "archived": false,
    "attributes": { "brand": "Apple", "ram": "16GB" },
    "variantOptions": { "Color": ["Silver", "Black"], "Storage": ["512GB", "1TB"] },
    "productType": { "id": "cuid", "name": "Laptop" },
    "variants": [
      {
        "id": "cuid",
        "combination": { "Color": "Silver", "Storage": "512GB" },
        "price": 1999.00,
        "stock": 5,
        "sku": "MBP14-SLV-512",
        "imageUrl": "https://..."
      }
    ]
  }
]
```

**File:** `app/api/admin/products/route.ts`

---

### POST /api/admin/products
Creates a new product with its variants in a single nested Prisma create. Requires at least one variant.

**Auth:** Admin only.

**Request body:**
```json
{
  "name": "Nike Air Force 1",
  "description": "Optional",
  "imageUrl": "https://... (optional, fallback/default product image)",
  "productTypeId": "cuid",
  "attributes": { "brand": "Nike", "material": "Leather" },
  "variantOptions": { "Size": ["7", "8", "9"], "Color": ["Red", "Blue"] },
  "variants": [
    { "combination": { "Size": "7", "Color": "Red" }, "price": "120.00", "stock": "5", "sku": "AF1-7-RED", "imageUrl": "https://... (optional)" },
    { "combination": { "Size": "7", "Color": "Blue" }, "price": "120.00", "stock": "3", "sku": "AF1-7-BLU", "imageUrl": "" }
  ]
}
```

**Notes:**
- `slug` is auto-generated from `name`
- `price` and `stock` do not exist on `Product` — each `ProductVariant` has its own
- `attributes` stores type-specific describing fields as JSON
- `variantOptions` stores the option definitions (what options exist and their possible values)
- `imageUrl` on the product is optional and acts as the fallback/default image shown on the storefront (category grid, featured products, and the product page before/without a variant-specific image)
- `imageUrl` on each variant is optional; when set, the storefront product page shows it in place of the product's `imageUrl` once that variant is selected
- `variants` array must contain at least one entry — request is rejected with `400` if empty, or if any variant is missing `price`/`stock`
- Variants are created via nested Prisma `create` in the same transaction as the `Product`
- `archived` defaults to `false` and is not settable at creation — a product is always created visible; use the archive endpoint below to hide it afterward

**Response:** The created `Product` with nested `variants`.

**File:** `app/api/admin/products/route.ts`

---

### GET /api/admin/products/[id]
Returns one product with its product type (including field definitions, ordered) and variants. Added 2026-07-17.

**Auth:** Admin only.

**Response:** Product shape as above, plus `productType.fields[]`.

**Errors:** `401`, `403`, `404`

**File:** `app/api/admin/products/[id]/route.ts`

---

### PUT /api/admin/products/[id]
Updates a product's name/description/image/attributes/variantOptions and its variant set (add, edit, remove). Added 2026-07-17. Does **not** accept `productTypeId` or `slug` — both are locked after creation (see DECISIONS.md) and silently ignored if present in the request body.

**Auth:** Admin only.

**Request body:**
```json
{
  "name": "Nike Air Force 1",
  "description": "Updated description",
  "imageUrl": "https://...",
  "attributes": { "brand": "Nike", "material": "Leather" },
  "variantOptions": { "Size": ["7", "8", "9"], "Color": ["Red", "Blue"] },
  "variants": [
    { "id": "existing-variant-cuid", "combination": { "Size": "7", "Color": "Red" }, "price": "125.00", "stock": "4", "sku": "AF1-7-RED", "imageUrl": "" },
    { "combination": { "Size": "9", "Color": "Blue" }, "price": "120.00", "stock": "6", "sku": "", "imageUrl": "" }
  ]
}
```

**Behavior:**
- Variants with an `id` are updated in place; variants without one are created new; any existing variant whose `id` is missing from the submitted array is deleted.
- Safe to delete a variant even if historical orders reference it — `OrderItem.productVariantId` is a snapshot, not a live FK (see DATABASE_SCHEMA.md).
- At least one variant required overall; every variant needs `price` and `stock`, same validation as creation.
- All variant create/update/delete plus the product's own field update happen in one Prisma nested `update` call.

**Response:** `200` — the updated `Product` with nested `variants`.

**Errors:** `401`, `403`, `404` (product not found), `400` (missing name, no variants, missing price/stock on a variant)

**File:** `app/api/admin/products/[id]/route.ts`

---

### PATCH /api/admin/products/[id]/archive
Toggles a product's `archived` flag only — no other fields are touched. Added 2026-07-17.

**Auth:** Admin only.

**Request body:**
```json
{ "archived": true }
```

**Behavior:**
- Hides the product from every customer-facing surface (category pages, `FeaturedProducts`, `/search`, `/api/search/suggestions`) and causes `/api/checkout` to reject it if still present in a stale client-side cart.
- Does NOT affect: historical orders (already snapshotted), admin panel visibility/editability, or the product's variants/data in any way. Fully reversible by calling again with `archived: false`.

**Response:** `200` — `{ "id": "cuid", ...otherProductFields, "archived": true }`

**Errors:** `401`, `403`, `404`, `400` (`archived` missing or not a boolean)

**File:** `app/api/admin/products/[id]/archive/route.ts`

---

## Admin — Categories

### GET /api/admin/categories
Returns all categories with product count.

**Auth:** Admin only.

**Response:**
```json
[
  {
    "id": "cuid",
    "name": "Sneakers",
    "slug": "sneakers",
    "description": "...",
    "bannerImageUrl": "https://...",
    "seoTitle": "Sneakers",
    "seoDescription": "...",
    "_count": { "products": 3 }
  }
]
```

**File:** `app/api/admin/categories/route.ts`

---

### POST /api/admin/categories
Creates a new category with optional product assignments in a single nested Prisma create.

**Auth:** Admin only.

**Request body:**
```json
{
  "name": "Sneakers",
  "description": "Optional description",
  "bannerImageUrl": "https://...",
  "seoTitle": "Optional, defaults to name",
  "seoDescription": "Optional",
  "productIds": ["cuid1", "cuid2"]
}
```

**Notes:**
- `slug` is auto-generated from `name`
- `seoTitle` defaults to `name` if not provided
- `productIds` is optional — a category can be created with zero products assigned
- `CategoryProduct` rows are created via nested Prisma `create` in the same transaction as the `Category`
- No duplicate-name/slug error handling yet (same as products/product-types routes) — a duplicate `name` will throw an unhandled 500 from the DB unique constraint

**Response:** The created `Category` with nested `products` (each wrapping the related `product`).

**File:** `app/api/admin/categories/route.ts`

---

### GET /api/admin/categories/[id]
Returns one category, plus `productIds` (flattened from its `CategoryProduct` rows) for pre-filling the edit form's product checklist. Added 2026-07-17.

**Auth:** Admin only.

**Errors:** `401`, `403`, `404`

**File:** `app/api/admin/categories/[id]/route.ts`

---

### PUT /api/admin/categories/[id]
Updates a category's fields and product assignments. Added 2026-07-17. Does **not** accept or regenerate `slug` — locked after creation (see DECISIONS.md).

**Auth:** Admin only.

**Request body:** Same shape as `POST /api/admin/categories`, minus `slug` (ignored if present).

**Behavior:**
- Replaces the category's `CategoryProduct` assignments entirely (delete-all-then-recreate from the submitted `productIds`) rather than diffing — simpler and safe, since `CategoryProduct` carries no data beyond the relationship itself.
- Runs in one `$transaction`.

**Response:** `200` — the updated `Category` with nested `products`.

**Errors:** `401`, `403`, `404`, `400` (missing name)

**File:** `app/api/admin/categories/[id]/route.ts`

---

### DELETE /api/admin/categories/[id]
Permanently deletes a category. Added 2026-07-17. Real hard delete — no archive system for Categories (see DECISIONS.md).

**Auth:** Admin only.

**Behavior:**
- `CategoryProduct` rows cascade automatically — this only unassigns products from the deleted category. The `Product` rows themselves are never touched or deleted.
- No confirmation/guard needed server-side (unlike Product Type field removal) — nothing else structurally depends on a Category. Client-side confirmation dialog (`window.confirm`) is handled in `CategoryActions.tsx`.

**Response:** `200` — `{ "success": true }`

**Errors:** `401`, `403`, `404`

**File:** `app/api/admin/categories/[id]/route.ts`

---

## Admin — Orders

### GET /admin/orders (page, not an API route)
Server Component. Fetches all orders directly via Prisma — no API route, consistent with the "Server Components can use Prisma directly" convention. Supports `?status=` (any `OrderStatus`, or omitted for all) and `?sort=` (`newest` default, `oldest`, `total_desc`, `total_asc`) via `searchParams`, applied directly in the Prisma query (`where`/`orderBy`), not in-memory.

**File:** `app/admin/orders/page.tsx`

---

### GET /admin/orders/[id] (page, not an API route)
Server Component. Fetches one order by `id` with `items` and `user` included. Calls `notFound()` if the ID doesn't match any order.

**File:** `app/admin/orders/[id]/page.tsx`

---

### PUT /api/admin/orders/[id]/status
Advances an order exactly one fulfillment stage forward. Never skips stages, never reverses.

**Auth:** Admin only.

**Behavior:**
- Looks up the order's current `status` and `fulfillmentMethod`
- Applies one of two transition maps depending on `fulfillmentMethod`:
  - `DELIVERY`: `PAID→PROCESSING→PACKED→SHIPPED→DELIVERED→COMPLETED`
  - `SELF_COLLECTION`: `PAID→PROCESSING→PACKED→COMPLETED` (skips `SHIPPED`/`DELIVERED`)
- `PENDING_PAYMENT`, `PAYMENT_FAILED`, `CANCELLED`, `REFUNDED` have no valid next stage — request rejected with `400`
- On success, if the new status is `SHIPPED` (delivery) or `COMPLETED` (self-collection, coming from `PACKED`), triggers the corresponding notification email (`sendShippingNotificationEmail` / `sendReadyForCollectionEmail`) as a separate statement after the DB write resolves — never nested inside the Prisma call

**Response:** `200` — `{ "id": "cuid", "status": "PROCESSING" }`

**Errors:** `401` (unauthenticated), `403` (non-admin), `404` (order not found), `400` (no valid transition from current status)

**File:** `app/api/admin/orders/[id]/status/route.ts`

---

### PUT /api/admin/orders/[id]/refund
Manually marks an order as `Refunded`. **Record-keeping only** — does not call any HitPay API, does not process any payment, does not restore stock.

**Auth:** Admin only.

**Behavior:**
- Valid only from `PAID`, `PROCESSING`, `PACKED`, `SHIPPED`, `DELIVERED`, or `COMPLETED` (i.e. any order that was actually paid for, at any fulfillment stage)
- Sets `Order.status = REFUNDED`, nothing else
- The actual refund is expected to have already happened outside the app (admin liaises with the customer directly via Telegram/email, processes the refund via HitPay's dashboard or bank transfer)

**Response:** `200` — `{ "id": "cuid", "status": "REFUNDED" }`

**Errors:** `401`, `403`, `404`, `400` (order status isn't refundable)

**File:** `app/api/admin/orders/[id]/refund/route.ts`

---

### PUT /api/admin/orders/[id]/tracking
Sets or updates an order's tracking number. Freely editable at any order status — not gated to a specific fulfillment stage.

**Auth:** Admin only.

**Request body:**
```json
{ "trackingNumber": "SF1234567890SG" }
```

**Notes:**
- No format validation — carrier-agnostic, since no courier API is integrated
- Empty string is treated as clearing the field (`null`)

**Response:** `200` — `{ "id": "cuid", "trackingNumber": "SF1234567890SG" }`

**Errors:** `401`, `403`, `404`

**File:** `app/api/admin/orders/[id]/tracking/route.ts`

---

## Storefront — Search

### GET /search (page, not an API route)
Server Component. Added 2026-07-17. Reads `?q=` from `searchParams`. Case-insensitive Prisma `contains` match against `Product.name` and `Product.description` (`OR`'d together), filtered to `archived: false`. No typo tolerance by deliberate choice — see DECISIONS.md. Renders results via the shared `ProductCard` component. Empty/missing `q` shows a prompt state rather than querying.

**File:** `app/search/page.tsx`

---

### GET /api/search/suggestions
Live-typing autocomplete dropdown backing `SearchBar.tsx` in the header. Added 2026-07-17. Public — no auth required, same trust level as any other storefront browsing.

**Query params:** `?q=<search text>`

**Behavior:**
- Same match logic as `/search` (case-insensitive `contains` on name/description, `archived: false`), capped to the 6 most recent matches (`take: 6`, `orderBy: createdAt desc`)
- Returns a lighter-weight shape than the full search page: `id`, `name`, `slug`, `imageUrl`, a formatted `price` string (via the shared `formatPrice` helper from `ProductCard.tsx`), and `category` (the first assigned category's name, or `null` — a product can belong to multiple categories, but only one is shown here to keep the row compact)
- Empty/missing `q` returns `{ "results": [] }` immediately, no DB query

**Response:**
```json
{
  "results": [
    { "id": "cuid", "name": "Nike Air Force 1", "slug": "nike-air-force-1", "imageUrl": "https://...", "price": "$120.00", "category": "Sneakers" }
  ]
}
```

**File:** `app/api/search/suggestions/route.ts`

---

## Checkout

### GET /api/checkout/fulfillment-fees
Returns the current flat fees for each fulfillment method, read live from environment variables. Public — no auth required (same trust level as prices shown on product pages).

**Response:**
```json
{ "delivery": 5.50, "selfCollection": 0 }
```

**Why this exists:** lets the checkout form always show the real, current fee without baking it into the client bundle at build time (`NEXT_PUBLIC_*` vars are frozen at build time; this route reads `process.env` per-request, so changing `.env` + restarting the server is enough — no rebuild needed).

**File:** `app/api/checkout/fulfillment-fees/route.ts`

---

### POST /api/checkout
Creates an Order from the customer's cart, verifying price/stock live against the DB (never trusts client-supplied values), then creates a HitPay Payment Request and returns its hosted checkout URL.

**Auth:** Required (any authenticated user). No guest checkout.

**Request body:**
```json
{
  "items": [{ "variantId": "cuid", "quantity": 2 }],
  "fulfillmentMethod": "DELIVERY",
  "shippingBlock": "123",
  "shippingUnitNumber": "#03-12",
  "shippingStreet": "Example Street",
  "shippingPostalCode": "123456"
}
```
For `fulfillmentMethod: "SELF_COLLECTION"`, all `shipping*` fields are ignored (can be omitted or `null`) — address is not required.

**Behavior:**
- Validates `fulfillmentMethod` is one of `DELIVERY`/`SELF_COLLECTION`
- Validates shipping address format (`lib/validateAddress.ts`) — branches on `fulfillmentMethod`: short-circuits to valid when `SELF_COLLECTION`, otherwise validates as before
- Atomically checks and decrements stock per variant — rejects `409` if insufficient. **As of 2026-07-17, this same atomic check also excludes archived products** (`product: { archived: false }` added to the `updateMany` where-clause) — an archived item still sitting in a stale client-side cart is rejected with the same `409 OUT_OF_STOCK`-style response as a genuinely out-of-stock item, rather than a new error type
- Snapshots live price/product name/combination onto each `OrderItem`
- Computes `shippingFee` from `SHIPPING_FEE_SGD` or `SELF_COLLECTION_FEE_SGD` depending on `fulfillmentMethod`
- Calculates GST via `lib/gst.ts` on `subtotal + shippingFee` combined (changed Phase 5)
- Creates `Order` (status `PENDING_PAYMENT`, `fulfillmentMethod`, `shippingFee`, nulled address fields for self-collection) + nested `OrderItem[]` in one transaction
- Calls HitPay to create a Payment Request (form-urlencoded, PayNow only, `expires_after: '5 mins'`) — amount is `order.total`, which already includes `shippingFee`
- If the HitPay call fails after Order creation, runs a compensating transaction (`lib/orders.ts` → `markOrderFailedAndRestoreStock`)

**Response:** `201` — `{ "orderId": "cuid", "checkoutUrl": "https://checkout.sandbox.hit-pay.com/..." }`

**Errors:** `400` (empty cart / invalid fulfillment method / invalid address / invalid item), `409` (out of stock, or an archived product still in cart), `502` (HitPay request creation failed)

**File:** `app/api/checkout/route.ts`

---

### GET /checkout/success (page, not an API route)
Order confirmation page. `?orderId=`, `?status=`, and `?reference=` are all read from `searchParams` (`reference` added 2026-07-17 — appended by HitPay itself to the `redirect_url` on a real redirect, not something this app generates).

**Behavior:**
- **Authenticated visitor, order belongs to them:** full behavior unchanged from Phase 4/5 — reconciles if stale, shows the cosmetic `status=canceled` message, a pending/failed status message, or the full paid order breakdown, depending on the order's real status.
- **Authenticated visitor, order does NOT belong to them, or order doesn't exist:** `notFound()` (404) — unchanged, a real security boundary.
- **Unauthenticated visitor (added 2026-07-17):** no `notFound()` fallback anymore. Instead:
  - If `reference` is present AND matches that order's `Order.hitpayPaymentRequestId` AND the order's real status is `PAID` → shows a genuine "Payment received!" message. No order details (items, address, total) are shown or fetched beyond the one comparison needed.
  - Otherwise (no `reference`, wrong `reference`, order not actually `PAID` yet, or order doesn't exist at all) → shows an identical generic "still processing" message. Deliberately indistinguishable from the outside whether the order exists, is unpaid, or belongs to someone else — this can't be used to probe order IDs or leak payment status.
  - Either way, a "Sign in to view your order details" link is shown, preserving `orderId`/`status`/`reference` via `redirect_url` so the visitor lands back on this same page (now with a real session) after signing in.
  - Deliberately does NOT call `reconcileOrderIfStale` in this branch — this is a read-only, best-effort display path; the real reconciliation already runs via the webhook and via the authenticated flow.

**File:** `app/checkout/success/page.tsx`

---

## Webhooks (continued)

### POST /api/webhooks/hitpay
Receives HitPay's payment status webhook, verifies its signature, and updates the corresponding Order.

**Auth:** HMAC-SHA256 signature over the raw request body using `HITPAY_WEBHOOK_SALT`, compared against the `Hitpay-Signature` header (timing-safe comparison).

**Registered via:** HitPay Dashboard (Developers → Webhook Endpoints), subscribed to `payment_request.completed` and `payment_request.failed`. NOT via the `webhook` parameter on Payment Request creation (deprecated). As of 2026-07-17, two endpoints are registered — the ngrok-tunneled local dev URL and the live `biggyballs69.gay` URL — confirmed simultaneously active in HitPay's dashboard.

**Behavior:**
- Looks up `Order` by `reference_number` (our `Order.id`)
- Idempotent — no-ops if the order is no longer `PENDING_PAYMENT`
- `status: "completed"` → `Order.status = PAID`, triggers `sendOrderConfirmationEmail`
- `status: "failed"` → `markOrderFailedAndRestoreStock(orderId)`

**Note:** HitPay does not fire this webhook for expired or cancelled requests — only genuine `completed`/`failed` transitions. Expiry is instead handled by lazy reconciliation on the order confirmation page (see `app/checkout/success/page.tsx`) and by the scheduled cron sweep (`app/api/cron/reconcile-orders/route.ts`).

**Response:** `200` on success/no-op, `401` (missing/invalid signature), `404` (no matching order)

**File:** `app/api/webhooks/hitpay/route.ts`

---

## Background Jobs

### GET or POST /api/cron/reconcile-orders
Scheduled sweep that reconciles any `PENDING_PAYMENT` order older than 6 minutes against HitPay's real status, restoring stock and marking the order `PAYMENT_FAILED` where appropriate. Triggered every 5 minutes by cron-job.org (external, non-browser caller).

**Auth:** `CRON_SECRET` shared-secret check, via `Authorization: Bearer <secret>` header or `?secret=` query param — not Clerk auth, since the caller has no browser session.

**Behavior:** Uses the shared `reconcileOrderIfStale` implementation from `lib/reconcileOrder.ts` (the same function `/checkout/success` calls), processed via `Promise.allSettled` across all matching orders in one invocation.

**Response:** `200` — `{ "checked": number, "succeeded": number, "failed": number }`

**File:** `app/api/cron/reconcile-orders/route.ts`

---

## Customer — Account

### GET /account/orders (page, not an API route)
Server Component, auth-gated (any signed-in user, redirects to `/sign-in?redirect_url=/account/orders` if not). Fetches only `where: { userId: <requesting user's id> }`, sorted `createdAt desc`.

**File:** `app/account/orders/page.tsx`

---

### GET /account/orders/[id] (page, not an API route)
Server Component, auth-gated. Fetches the order and its items, then checks `order.userId === requesting user's id` — calls `notFound()` (not a redirect or a 403 page) if the order doesn't exist OR belongs to someone else, so a customer can't distinguish "not found" from "not yours" by probing IDs.

**File:** `app/account/orders/[id]/page.tsx`

---

## Planned API Routes (Not Yet Built)
GET/PUT    /api/admin/orders             Bulk order actions — deferred, see ROADMAP.md Phase 5

Note: `GET /api/products` and `GET /api/products/[slug]` (listed in earlier planning) were not built as separate API routes. Public category and product browsing (`/category/[slug]`, `/product/[slug]`, `/search`) are Server Components that query Prisma directly, consistent with the "Server Components can use Prisma directly" convention — no API route needed since nothing is mutated. Sort/filter on the category page, and the query on the search page, are both handled via `searchParams`, not a query API. `/api/search/suggestions` is the one storefront exception, since it's called from a Client Component (`SearchBar.tsx`) that can't call Prisma directly. The same overall pattern extends to `/admin/orders`, `/admin/orders/[id]`, `/account/orders`, and `/account/orders/[id]`.