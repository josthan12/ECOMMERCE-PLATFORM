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
## Checkout

### POST /api/checkout
Creates an Order from the customer's cart, verifying price/stock live against the DB (never trusts client-supplied values), then creates a HitPay Payment Request and returns its hosted checkout URL.

**Auth:** Required (any authenticated user). No guest checkout.

**Request body:**
```json
{
  "items": [{ "variantId": "cuid", "quantity": 2 }],
  "shippingBlock": "123",
  "shippingUnitNumber": "#03-12",
  "shippingStreet": "Example Street",
  "shippingPostalCode": "123456"
}
```

**Behavior:**
- Validates shipping address format (`lib/validateAddress.ts`)
- Atomically checks and decrements stock per variant — rejects `409` if insufficient
- Snapshots live price/product name/combination onto each `OrderItem`
- Calculates GST via `lib/gst.ts`
- Creates `Order` (status `PENDING_PAYMENT`) + nested `OrderItem[]` in one transaction
- Calls HitPay to create a Payment Request (form-urlencoded, PayNow only, `expires_after: '5 min'`)
- If the HitPay call fails after Order creation, runs a compensating transaction (`lib/orders.ts` → `markOrderFailedAndRestoreStock`)

**Response:** `201` — `{ "orderId": "cuid", "checkoutUrl": "https://checkout.sandbox.hit-pay.com/..." }`

**Errors:** `400` (empty cart / invalid address / invalid item), `409` (out of stock), `502` (HitPay request creation failed)

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
- `status: "completed"` → `Order.status = PAID`
- `status: "failed"` → `markOrderFailedAndRestoreStock(orderId)`

**Note:** HitPay does not fire this webhook for expired or cancelled requests — only genuine `completed`/`failed` transitions. Expiry is instead handled by lazy reconciliation on the order confirmation page (see `app/checkout/success/page.tsx`), soon to be supplemented by a scheduled cron job.

**Response:** `200` on success/no-op, `401` (missing/invalid signature), `404` (no matching order)

**File:** `app/api/webhooks/hitpay/route.ts`

---

## Planned API Routes (Not Yet Built)

These routes need to be created in upcoming phases:

```
GET/PUT    /api/admin/orders             Order management  
POST       /api/admin/orders/[id]/ship   Mark order as shipped
POST       /api/admin/orders/[id]/refund Issue refund via HitPay

POST       /api/cart                     Add to cart
GET        /api/cart                     Get cart

POST       /api/checkout                 Create HitPay payment request
POST       /api/webhooks/hitpay          HitPay payment webhook

GET        /api/account/orders           Customer order history
```

Note: `GET /api/products` and `GET /api/products/[slug]` (listed in earlier planning) were not built as separate API routes. Public category and product browsing (`/category/[slug]`, `/product/[slug]`) are Server Components that query Prisma directly, consistent with the "Server Components can use Prisma directly" convention in PROJECT_OVERVIEW.md — no API route needed since nothing is mutated. Sort/filter on the category page is handled via `searchParams`, not a query API.
