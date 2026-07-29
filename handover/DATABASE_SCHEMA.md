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

**Note:** once a `ProductField` exists, `type` is treated as immutable at
the application layer (not enforced by the DB) — the admin Product Type
edit page disables this input for existing fields, and the API re-derives
it server-side rather than trusting the client. See DECISIONS.md.

### OrderStatus
Used on `Order.status`.
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
**Note:** valid transitions between these are branched by
`Order.fulfillmentMethod` at the application layer — see `Order` model
below and API_REFERENCE.md. `CANCELLED` has no code path that sets it;
only `REFUNDED` is reachable, and only via manual admin action.

### FulfillmentMethod
Used on `Order.fulfillmentMethod`.
DELIVERY          ← shipped by the store, flat fee applies (SHIPPING_FEE_SGD)
SELF_COLLECTION   ← customer picks up in person, free by default but fee is config-driven (SELF_COLLECTION_FEE_SGD)

### PromoDiscountType
**(Added 2026-07-22)** Used on `PromoCode.discountType`.
PERCENTAGE     → discountValue is a percent (0–100) off the order subtotal
FIXED_AMOUNT   → discountValue is a flat dollar amount off the order subtotal

---

### NewsletterPostStatus
DRAFT: editable and not sent
SENDING: delivery is currently in progress
SENT: every eligible delivery completed or was skipped after unsubscribe
FAILED: one or more deliveries failed and can be retried

### NewsletterDeliveryStatus
PENDING: captured in the broadcast audience but not yet attempted
SENT: accepted by Resend
FAILED: attempt failed and can be retried
SKIPPED: customer unsubscribed before the delivery attempt

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
| newsletterSubscribed | Boolean | Default: false; authenticated account's current newsletter preference |
| newsletterSubscribedAt | DateTime? | Timestamp of the most recent opt-in |
| newsletterUnsubscribedAt | DateTime? | Timestamp of the most recent opt-out; cleared on resubscribe |
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
Admin-defined templates that determine what fields a product has.

| Column | Type | Notes |
|---|---|---|
| id | String (cuid) | Primary key |
| name | String | Unique, e.g. "Laptop" |
| slug | String | Unique, auto-generated e.g. "laptop" |
| description | String? | Optional |
| createdAt | DateTime | Auto |
| updatedAt | DateTime | Auto |

Relations: `fields ProductField[]`, `products Product[]`

**Note:** `ProductType` has no delete or type-reassignment feature, by
deliberate design decision. See DECISIONS.md.

---

### ProductField
Individual field definitions belonging to a ProductType.

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

**Note:** `key` and `type` are immutable once a field exists. Removing a
field is blocked server-side if any `Product` of that type still has a
non-empty value for it in `attributes`. See DECISIONS.md.

---

### Product
A specific product created using a ProductType template.

| Column | Type | Notes |
|---|---|---|
| id | String (cuid) | Primary key |
| productTypeId | String | FK → ProductType.id. **Locked after creation.** |
| name | String | e.g. "MacBook Pro 14" |
| slug | String | Unique, auto-generated. **Locked after creation.** |
| description | String? | Optional |
| attributes | Json | Type-specific fields e.g. `{"brand":"Apple","ram":"16GB"}` |
| variantOptions | Json? | Option definitions e.g. `{"Color":["Red","Blue"],"Size":["7","8","9"]}` |
| imageUrl | String? | Optional product image URL (fallback/default) |
| archived | Boolean | Default: `false`. Hides the product from every customer-facing surface without deleting it. See DECISIONS.md. |
| createdAt | DateTime | Auto |
| updatedAt | DateTime | Auto |

Relations: `variants ProductVariant[]`

**Important:** `price` and `stock` do NOT exist on Product — they live on each `ProductVariant`.

**Note:** any *new* Prisma query anywhere in the app that lists products for
customer-facing display must explicitly add `where: { archived: false }` —
this filter is not global/automatic.

---

### ProductVariant
A specific sellable combination of a product's options.

| Column | Type | Notes |
|---|---|---|
| id | String (cuid) | Primary key |
| productId | String | FK → Product.id (cascade delete) |
| combination | Json | Specific option values e.g. `{"Size":"8","Color":"Red"}` |
| price | Float | Price in SGD for this combination |
| stock | Int | Stock count, default: 0 |
| sku | String? | Optional unique identifier |
| imageUrl | String? | Optional per-variant image URL |
| createdAt | DateTime | Auto |
| updatedAt | DateTime | Auto |

**Note:** safe to remove a variant even with historical orders referencing
it — `OrderItem.productVariantId` is a snapshot, not a live FK.

### Category
Admin-defined product groupings with SEO and landing page fields.

| Column | Type | Notes |
|---|---|---|
| id | String (cuid) | Primary key |
| name | String | Unique, e.g. "Sneakers" |
| slug | String | Unique, auto-generated. **Locked after creation.** |
| description | String? | Optional |
| bannerImageUrl | String? | Optional banner image URL |
| seoTitle | String? | Optional, defaults to name if empty |
| seoDescription | String? | Optional |
| createdAt | DateTime | Auto |
| updatedAt | DateTime | Auto |

Relations: `products CategoryProduct[]`

**Note:** `Category` supports real hard delete — safe, since
`CategoryProduct` cascades cleanly and only unassigns products.

---

### CategoryProduct
Junction table — many-to-many between Category and Product.

| Column | Type | Notes |
|---|---|---|
| id | String (cuid) | Primary key |
| categoryId | String | FK → Category.id (cascade delete) |
| productId | String | FK → Product.id (cascade delete) |

Constraint: `@@unique([categoryId, productId])`

---

### Order
A customer order. Created at checkout with live-verified price/stock; shipping address is snapshotted (not a live FK).

| Column | Type | Notes |
|---|---|---|
| id | String (cuid) | Primary key |
| userId | String | FK → User.id. Required — no guest orders. |
| status | OrderStatus | Default: PENDING_PAYMENT |
| fulfillmentMethod | FulfillmentMethod | Default: DELIVERY. Determines both the valid status-transition chain and whether a shipping address is required. |
| hitpayPaymentRequestId | String? | HitPay's own payment request ID; also used as an unauthenticated-visitor verification token on `/checkout/success`. |
| shippingBlock | String? | Snapshotted at order time. Nullable — null for self-collection orders |
| shippingUnitNumber | String? | Snapshotted at order time; optional |
| shippingStreet | String? | Snapshotted at order time. Nullable — null for self-collection orders |
| shippingPostalCode | String? | Snapshotted at order time. Nullable — null for self-collection orders |
| trackingNumber | String? | Freely editable by admin at any order status |
| subtotal | Float | GST-exclusive, items only, **before any promo discount is subtracted** |
| **promoCode** | **String?** | **(Added 2026-07-22)** Snapshot of the code applied to this order, if any. Independent of `PromoCode.usedByOrderId` — the `PromoCode` row can later be reactivated and reused by a *different* order, so this field is the only reliable historical record of what discount this specific order actually received. Never a live FK. |
| **discountAmount** | **Float** | **(Added 2026-07-22)** Default: `0`. The dollar amount discounted from `subtotal` by the applied promo code, snapshotted at order-creation time. Computed via `lib/promoCode.ts`'s `computeDiscountAmount()`. |
| shippingFee | Float | Default: 0. Flat delivery fee or self-collection fee, GST-exclusive |
| gstAmount | Float | Calculated via `lib/gst.ts` on `(subtotal - discountAmount) + shippingFee`. Will be `0` if `GST_ENABLED` is false (see `lib/gst.ts` notes below). |
| total | Float | `(subtotal - discountAmount) + shippingFee + gstAmount` |
| createdAt | DateTime | Auto |
| updatedAt | DateTime | Auto |

Relations: `items OrderItem[]`

---

### OrderItem
Line item snapshot — price/name/combination captured live at checkout time.

| Column | Type | Notes |
|---|---|---|
| id | String (cuid) | Primary key |
| orderId | String | FK → Order.id (cascade delete) |
| productVariantId | String | Plain string reference, NOT a live FK |
| productName | String | Snapshotted |
| combination | Json | Snapshotted |
| price | Float | Snapshotted, verified live at checkout |
| quantity | Int | |
| sku | String? | Snapshotted |

---

### Expense
**(Added 2026-07-22)** Flat, admin-managed cost log. Deliberately *not*
linked via foreign key to `Order`, `Product`, or anything else — the admin
explicitly wanted something simple he creates and edits by hand (shipping
costs, packaging materials, product cost, marketing, etc.), not a
relationally-tied accounting system. Feeds the admin dashboard's Total
Expenses and Profit (`Revenue − Expenses`) metrics.

| Column | Type | Notes |
|---|---|---|
| id | String (cuid) | Primary key |
| title | String | Free text, e.g. "Shipping - Order #1234" |
| category | String | Free text, not an enum — `<datalist>` suggests Shipping/Packaging/Product Cost/Marketing/Other in the admin UI, but any string is accepted so a new category never requires a migration |
| amount | Float | |
| incurredAt | DateTime | Default: now(). Editable — admin may log a cost after the fact |
| notes | String? | Optional |
| **isSystemGenerated** | **Boolean** | **(Added 2026-07-22)** Default: `false`. `true` only for rows auto-created by `lib/recordDiscountExpense.ts` when a promo-discounted order reaches `PAID`. Lets dashboard aggregates (Total Discounts Given, Discount Codes Used) reliably isolate auto-generated rows from manual entries — see API_REFERENCE.md and DECISIONS.md for why a string-category match alone was judged too fragile. |
| createdAt | DateTime | Auto |
| updatedAt | DateTime | Auto |

---

### PromoCode
**(Added 2026-07-22)** Admin-created, single-use-until-reactivated discount
codes. Scoped deliberately narrow: whole-order only (no product/category
targeting), no total-redemption-cap or per-customer-limit fields, since the
admin's stated use case is low-volume, discretionary codes rather than a
public marketing coupon system.

| Column | Type | Notes |
|---|---|---|
| id | String (cuid) | Primary key |
| code | String | Unique. Always stored and matched in uppercase (normalized server-side on create/update/checkout) |
| discountType | PromoDiscountType | PERCENTAGE or FIXED_AMOUNT |
| discountValue | Float | Percent (0–100) or dollar amount, depending on `discountType` |
| minOrderValue | Float? | Optional. Order subtotal must meet or exceed this for the code to be accepted |
| maxDiscountAmount | Float? | Optional. Caps the computed discount — primarily useful for PERCENTAGE codes on large orders |
| active | Boolean | Default: `true`. Independent of `usedAt` — a code can be inactive-and-unused, active-and-used, etc. Admin-togglable at any time via `/admin/promo-codes`. |
| usedAt | DateTime? | Set the moment an order is *created* using this code (not when payment succeeds) — burned regardless of that order's eventual payment outcome, a deliberate admin decision. Cleared back to `null` (along with `usedByOrderId`) by the admin's explicit "Reactivate" action, at which point the code becomes usable again. |
| usedByOrderId | String? | The order that most recently used this code. **Not a reliable historical record** — since a reactivated code can later be used by a different order, this field only ever reflects the *most recent* use. See `Order.promoCode`/`Order.discountAmount` for the actual per-order historical snapshot. |
| createdAt | DateTime | Auto |
| updatedAt | DateTime | Auto |

**Note:** discount is computed via `lib/promoCode.ts`'s
`computeDiscountAmount()` — shared by both the checkout-time preview
endpoint (`/api/checkout/apply-promo`, validation-only, never mutates) and
the real order-creation transaction in `/api/checkout`, specifically so the
two can never drift apart and show the customer a different number than
what actually gets charged.

**Note:** the discount is subtracted from `subtotal` *before* GST is
calculated — see `Order.gstAmount` above and `lib/gst.ts`.

---

### NewsletterPost
**(Added 2026-07-28)** Admin-authored newsletter content and broadcast state.

| Column | Type | Notes |
|---|---|---|
| id | String (cuid) | Primary key |
| topic | String | Main email heading and admin-facing topic |
| subject | String | Recipient-facing email subject |
| previewText | String? | Optional inbox preview text |
| body | String | Admin-controlled plain text; blank lines create paragraphs |
| imageUrl | String? | Optional `/images/...` path or secure hosted image URL |
| status | NewsletterPostStatus | Default: DRAFT |
| sentAt | DateTime? | Set when all eligible deliveries complete |
| recipientCount | Int | Initial opt-in audience size |
| successCount | Int | Successful delivery count |
| failureCount | Int | Failed delivery count |
| createdAt | DateTime | Auto |
| updatedAt | DateTime | Auto |

### NewsletterDelivery
Per-recipient delivery snapshot used for retries and delivery history.

| Column | Type | Notes |
|---|---|---|
| id | String (cuid) | Primary key |
| newsletterPostId | String | FK to NewsletterPost; cascade delete |
| userId | String | Subscriber ID snapshot; deliberately not an FK |
| email | String | Recipient email snapshot |
| status | NewsletterDeliveryStatus | Default: PENDING |
| resendEmailId | String? | Provider email ID after acceptance |
| error | String? | Most recent delivery error |
| sentAt | DateTime? | Successful send timestamp |
| createdAt | DateTime | Auto |
| updatedAt | DateTime | Auto |

Unique constraint: `(newsletterPostId, userId)`.

---

## Relationships Diagram
```
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

Expense    ← standalone, no relations
PromoCode  ← standalone, no relations (Order.promoCode is a plain string snapshot, not an FK)
```

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
| add_fulfillment_method_and_shipping | Added `FulfillmentMethod` enum, `Order.fulfillmentMethod`, `shippingFee`, `trackingNumber` |
| make_shipping_address_optional | Changed shipping address fields to nullable |
| add_product_archived | Added `Product.archived` |
| add_expenses | **(2026-07-22)** Added `Expense` model |
| add_promo_and_discount_tracking | **(2026-07-22)** Added `PromoCode` model, `PromoDiscountType` enum, `Order.promoCode`, `Order.discountAmount`, `Expense.isSystemGenerated` |
| 20260722175234_add_newsletter_subscription | Added account newsletter preference and consent timestamps to `User` |
| 20260728133000_add_newsletter_posts | Added `NewsletterPost`, `NewsletterDelivery`, and their status enums |

---

## Planned Models (Not Yet Built)
Payment           ← HitPay transaction references
CMSPage           ← editable static pages — **note: the admin has since
                     decided against building most CMS pages (Terms,
                     Shipping, Returns, Help Center) at all, per Session
                     11; only About/Contact/FAQ exist, as hand-written
                     hardcoded pages, not a CMS-backed model**
HomepageSection   ← modular homepage blocks with JSON config — still
                     unbuilt, homepage remains hardcoded
StoreSettings     ← considered and explicitly rejected for the
                     self-collection address; address is a hardcoded TS
                     constant instead
