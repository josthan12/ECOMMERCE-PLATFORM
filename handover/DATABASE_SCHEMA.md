# DATABASE_SCHEMA.md

Database: PostgreSQL (Neon)
ORM: Prisma 7
Generated client output: `app/generated/prisma/`

---

## Enums

### Role
Used on `User.role` to control access.
CUSTOMER   ← default for all signups
STAFF      ← future: order fulfillment access
ADMIN      ← full admin panel access

### FieldType
Used on `ProductField.type` to define what kind of input to render.
TEXT        → standard text input
RICH_TEXT   → multiline / formatted text
NUMBER      → numeric input
CURRENCY    → numeric input (SGD)
BOOLEAN     → checkbox (true/false)
DATE        → date picker
DROPDOWN    → select with predefined options
CHECKBOX    → multi-select checkboxes
RADIO       → single select radio buttons
IMAGE       → image upload
VIDEO       → video upload
JSON        → raw JSON input
TAG         → comma-separated tags
COLOR       → color picker (hex)

### OrderStatus
Used on `Order.status`. Full lifecycle defined upfront (Phase 4 only used the first three) to avoid a second migration when Phase 5 fulfillment work began.
PENDING_PAYMENT
PAID
PAYMENT_FAILED
PROCESSING
PACKED
SHIPPED
DELIVERED
COMPLETED
CANCELLED
REFUNDED
**Note (Phase 5):** valid transitions between these are branched by `Order.fulfillmentMethod` at the application layer (not enforced by the enum itself) — see `Order` model below and API_REFERENCE.md. `CANCELLED` is defined in the enum but has no code path that sets it — order cancellation was deliberately not built as a feature; only `REFUNDED` is reachable, and only via manual admin action.

### FulfillmentMethod
Used on `Order.fulfillmentMethod`. Added Phase 5.
DELIVERY          ← shipped by the store, flat fee applies (SHIPPING_FEE_SGD)
SELF_COLLECTION   ← customer picks up in person, free by default but fee is config-driven (SELF_COLLECTION_FEE_SGD)

---

## Models

### User
Synced from Clerk via webhook on `user.created`. Stores app-specific data only — Clerk owns identity.

| Column | Type | Notes |
|---|---|---|
| id | String (cuid) | Primary key |
| clerkId | String | Unique, from Clerk |
| email | String | Unique |
| name | String? | Optional |
| role | Role | Default: CUSTOMER |
| createdAt | DateTime | Auto |
| updatedAt | DateTime | Auto |

Relations: `addresses Address[]`, `orders Order[]`

---

### Address
Singapore-specific address format.

| Column | Type | Notes |
|---|---|---|
| id | String (cuid) | Primary key |
| userId | String | FK → User.id |
| label | String? | e.g. "Home", "Office" |
| block | String | Block/building number |
| unitNumber | String? | e.g. "#03-12" |
| street | String | Street name |
| postalCode | String | 6-digit SG postal code |
| isDefault | Boolean | Default: false |

---

### ProductType
Admin-defined templates that determine what fields a product has. Created with zero code changes via admin UI.

| Column | Type | Notes |
|---|---|---|
| id | String (cuid) | Primary key |
| name | String | Unique, e.g. "Laptop" |
| slug | String | Unique, auto-generated e.g. "laptop" |
| description | String? | Optional |
| createdAt | DateTime | Auto |
| updatedAt | DateTime | Auto |

Relations: `fields ProductField[]`, `products Product[]`

---

### ProductField
Individual field definitions belonging to a ProductType. Drives the dynamic form in the Product Builder.

| Column | Type | Notes |
|---|---|---|
| id | String (cuid) | Primary key |
| productTypeId | String | FK → ProductType.id (cascade delete) |
| label | String | Display label e.g. "RAM" |
| key | String | Programmatic key e.g. "ram" |
| type | FieldType | Determines which input to render |
| required | Boolean | Default: false |
| options | Json? | Array of strings for DROPDOWN/RADIO/CHECKBOX |
| order | Int | Display order, default: 0 |
| createdAt | DateTime | Auto |

---

### Product
A specific product created using a ProductType template. Type-specific fields stored in `attributes` JSON column.

| Column | Type | Notes |
|---|---|---|
| id | String (cuid) | Primary key |
| productTypeId | String | FK → ProductType.id |
| name | String | e.g. "MacBook Pro 14" |
| slug | String | Unique, auto-generated |
| description | String? | Optional |
| attributes | Json | Type-specific fields e.g. `{"brand":"Apple","ram":"16GB"}` |
| variantOptions | Json? | Option definitions e.g. `{"Color":["Red","Blue"],"Size":["7","8","9"]}` |
| imageUrl | String? | Optional product image URL (fallback/default; set via admin form) |
| createdAt | DateTime | Auto |
| updatedAt | DateTime | Auto |

Relations: `variants ProductVariant[]`

**Important:** `price` and `stock` do NOT exist on Product — they live on each `ProductVariant`.

---

### ProductVariant
A specific sellable combination of a product's options. Each variant tracks its own price and stock.

| Column | Type | Notes |
|---|---|---|
| id | String (cuid) | Primary key |
| productId | String | FK → Product.id (cascade delete) |
| combination | Json | Specific option values e.g. `{"Size":"8","Color":"Red"}` |
| price | Float | Price in SGD for this combination |
| stock | Int | Stock count, default: 0 |
| sku | String? | Optional unique identifier |
| imageUrl | String? | Optional per-variant image URL; falls back to `Product.imageUrl` on the storefront when unset |
| createdAt | DateTime | Auto |
| updatedAt | DateTime | Auto |

### Category
Admin-defined product groupings with SEO and landing page fields.

| Column | Type | Notes |
|---|---|---|
| id | String (cuid) | Primary key |
| name | String | Unique, e.g. "Sneakers" |
| slug | String | Unique, auto-generated |
| description | String? | Optional |
| bannerImageUrl | String? | Optional banner image URL |
| seoTitle | String? | Optional, defaults to name if empty |
| seoDescription | String? | Optional |
| createdAt | DateTime | Auto |
| updatedAt | DateTime | Auto |

Relations: `products CategoryProduct[]`

---

### CategoryProduct
Junction table — many-to-many between Category and Product. A product can belong to multiple categories.

| Column | Type | Notes |
|---|---|---|
| id | String (cuid) | Primary key |
| categoryId | String | FK → Category.id (cascade delete) |
| productId | String | FK → Product.id (cascade delete) |

Constraint: `@@unique([categoryId, productId])` — prevents the same product being added twice to the same category (does not limit a product to one category).

---

### Order
A customer order. Created at checkout with live-verified price/stock; shipping address is snapshotted (not a live FK) so later address-book edits never alter historical orders.

| Column | Type | Notes |
|---|---|---|
| id | String (cuid) | Primary key |
| userId | String | FK → User.id. Required — no guest orders. |
| status | OrderStatus | Default: PENDING_PAYMENT |
| fulfillmentMethod | FulfillmentMethod | Default: DELIVERY. Added Phase 5. Determines both the valid status-transition chain and whether a shipping address is required. |
| hitpayPaymentRequestId | String? | HitPay's own payment request ID; used to poll their Get Payment Status endpoint for reconciliation |
| shippingBlock | String? | Snapshotted at order time. **Nullable as of Phase 5** — null for self-collection orders |
| shippingUnitNumber | String? | Snapshotted at order time; optional (landed properties have no unit) |
| shippingStreet | String? | Snapshotted at order time. **Nullable as of Phase 5** — null for self-collection orders |
| shippingPostalCode | String? | Snapshotted at order time. **Nullable as of Phase 5** — null for self-collection orders |
| trackingNumber | String? | Added Phase 5. Freely editable by admin at any order status; no format validation (carrier-agnostic, since no courier API is integrated) |
| subtotal | Float | GST-exclusive, items only |
| shippingFee | Float | Added Phase 5. Default: 0. Flat delivery fee or self-collection fee, GST-exclusive |
| gstAmount | Float | Calculated via `lib/gst.ts` on `subtotal + shippingFee` combined (changed Phase 5 — previously subtotal only) |
| total | Float | subtotal + shippingFee + gstAmount |
| createdAt | DateTime | Auto |
| updatedAt | DateTime | Auto |

Relations: `items OrderItem[]`

---

### OrderItem
Line item snapshot — price/name/combination captured live at checkout time, not joined from the current catalog, so historical orders remain accurate even if products are later renamed/repriced/deleted.

| Column | Type | Notes |
|---|---|---|
| id | String (cuid) | Primary key |
| orderId | String | FK → Order.id (cascade delete) |
| productVariantId | String | Plain string reference, NOT a live FK — avoids cascade-delete risk if a variant is later removed |
| productName | String | Snapshotted |
| combination | Json | Snapshotted |
| price | Float | Snapshotted, verified live at checkout (never trusts cart's cached price) |
| quantity | Int | |
| sku | String? | Snapshotted |

---

## Relationships Diagram
User ──────────────── Address (one to many)
│
└─────────────── Order (one to many)
│
└──── OrderItem (one to many, cascade delete)
ProductType ─────────── ProductField (one to many, cascade delete)
│
└─────────────── Product (one to many)
│
└──── ProductVariant (one to many, cascade delete)
Category ────────────── CategoryProduct ──────────────── Product
(one to many,              (many to one,           (one to many,
cascade delete)            cascade delete)          via Product.categoryProducts)

---

## Migrations History

| Migration | Description |
|---|---|
| 20260630143914_add_user_and_address | Initial User and Address models |
| add_product_types_and_products | ProductType, ProductField, Product models |
| add_product_variants | Added ProductVariant, removed price/stock from Product, added variantOptions |
| add_categories | Category, CategoryProduct models added |
| add_product_image_url | Added `Product.imageUrl` |
| add_variant_image_url | Added `ProductVariant.imageUrl` |
| add_orders | Order, OrderItem models + OrderStatus enum |
| add_hitpay_payment_request_id | Added `Order.hitpayPaymentRequestId` |
| add_fulfillment_method_and_shipping | Added `FulfillmentMethod` enum, `Order.fulfillmentMethod`, `Order.shippingFee`, `Order.trackingNumber` |
| make_shipping_address_optional | Changed `Order.shippingBlock`, `shippingStreet`, `shippingPostalCode` from required to nullable |

---

## Planned Models (Not Yet Built)
Shipment          ← courier tracking per order — DROPPED, see ROADMAP.md Phase 5 (no courier integration planned)
Payment           ← HitPay transaction references
Promotion         ← coupons and flash sales
CMSPage           ← editable static pages (About, FAQ, etc.)
HomepageSection   ← modular homepage blocks with JSON config
StoreSettings     ← considered for self-collection address in Phase 5, explicitly rejected as overkill; address is a hardcoded TS constant instead (lib/constants.ts). Revisit only if more store-wide settings accumulate.