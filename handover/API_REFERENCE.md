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

## Admin — Products

### GET /api/admin/products
Returns all products with their product type.

**Auth:** Admin only.

**Response:**
```json
[
  {
    "id": "cuid",
    "name": "MacBook Pro 14",
    "slug": "macbook-pro-14",
    "imageUrl": "https://...",
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

**Response:** The created `Product` with nested `variants`.

**File:** `app/api/admin/products/route.ts`

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
- Validates shipping address format (`lib/validateAddress.ts`) — **now branches on `fulfillmentMethod`**: short-circuits to valid (no error) when `SELF_COLLECTION`, otherwise validates as before
- Atomically checks and decrements stock per variant — rejects `409` if insufficient
- Snapshots live price/product name/combination onto each `OrderItem`
- Computes `shippingFee` from `SHIPPING_FEE_SGD` or `SELF_COLLECTION_FEE_SGD` depending on `fulfillmentMethod`
- Calculates GST via `lib/gst.ts` on `subtotal + shippingFee` combined (changed Phase 5)
- Creates `Order` (status `PENDING_PAYMENT`, `fulfillmentMethod`, `shippingFee`, nulled address fields for self-collection) + nested `OrderItem[]` in one transaction
- Calls HitPay to create a Payment Request (form-urlencoded, PayNow only, `expires_after: '5 mins'`) — amount is `order.total`, which already includes `shippingFee`
- If the HitPay call fails after Order creation, runs a compensating transaction (`lib/orders.ts` → `markOrderFailedAndRestoreStock`)

**Response:** `201` — `{ "orderId": "cuid", "checkoutUrl": "https://checkout.sandbox.hit-pay.com/..." }`

**Errors:** `400` (empty cart / invalid fulfillment method / invalid address / invalid item), `409` (out of stock), `502` (HitPay request creation failed)

**File:** `app/api/checkout/route.ts`

---

## Webhooks (continued)

### POST /api/webhooks/hitpay
Receives HitPay's payment status webhook, verifies its signature, and updates the corresponding Order.

**Auth:** HMAC-SHA256 signature over the raw request body using `HITPAY_WEBHOOK_SALT`, compared against the `Hitpay-Signature` header (timing-safe comparison).

**Registered via:** HitPay Dashboard (Developers → Webhook Endpoints), subscribed to `payment_request.completed` and `payment_request.failed`. NOT via the `webhook` parameter on Payment Request creation (deprecated).

**Behavior:**
- Looks up `Order` by `reference_number` (our `Order.id`)
- Idempotent — no-ops if the order is no longer `PENDING_PAYMENT`
- `status: "completed"` → `Order.status = PAID`, triggers `sendOrderConfirmationEmail`
- `status: "failed"` → `markOrderFailedAndRestoreStock(orderId)`

**Note:** HitPay does not fire this webhook for expired or cancelled requests — only genuine `completed`/`failed` transitions. Expiry is instead handled by lazy reconciliation on the order confirmation page (see `app/checkout/success/page.tsx`).

**Response:** `200` on success/no-op, `401` (missing/invalid signature), `404` (no matching order)

**File:** `app/api/webhooks/hitpay/route.ts`

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

Note: `GET /api/products` and `GET /api/products/[slug]` (listed in earlier planning) were not built as separate API routes. Public category and product browsing (`/category/[slug]`, `/product/[slug]`) are Server Components that query Prisma directly, consistent with the "Server Components can use Prisma directly" convention — no API route needed since nothing is mutated. Sort/filter on the category page is handled via `searchParams`, not a query API. The same pattern now extends to `/admin/orders`, `/admin/orders/[id]`, `/account/orders`, and `/account/orders/[id]`.