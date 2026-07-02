# DATABASE_SCHEMA.md

Database: PostgreSQL (Neon)
ORM: Prisma 7
Generated client output: `app/generated/prisma/`

---

## Enums

### Role
Used on `User.role` to control access.
```
CUSTOMER   ← default for all signups
STAFF      ← future: order fulfillment access
ADMIN      ← full admin panel access
```

### FieldType
Used on `ProductField.type` to define what kind of input to render.
```
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
```

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

Relations: `addresses Address[]`

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

## Relationships Diagram

```
User ──────────────── Address (one to many)

ProductType ─────────── ProductField (one to many, cascade delete)
     │
     └─────────────── Product (one to many)
                          │
                          └──── ProductVariant (one to many, cascade delete)
```
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

---

## Planned Models (Not Yet Built)

```
Category          ← product categories with landing page config
CategoryProduct   ← junction table linking products to categories
Order             ← customer orders (status lifecycle)
OrderItem         ← line items per order
Shipment          ← courier tracking per order
Payment           ← HitPay transaction references
Promotion         ← coupons and flash sales
CMSPage           ← editable static pages (About, FAQ, etc.)
HomepageSection   ← modular homepage blocks with JSON config
```
