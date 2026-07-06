# SESSION_LOG.md

Append a new section after each completed feature.
Do not remove previous entries.

---

## Session 1

Date: 2026-07-01

### Objective
Set up the project from scratch — Phase 0 and Phase 1.

### Completed
- Next.js 15 (App Router) + TypeScript + TailwindCSS project created
- GitHub repo created and connected (private)
- Vercel deployment configured (auto-deploy from main)
- Neon PostgreSQL database provisioned
- Prisma 7 initialized with custom output path (`app/generated/prisma/`)
- ngrok installed and authenticated for local webhook tunneling
- HitPay sandbox account created
- Prisma schema: User, Address models with Role enum (CUSTOMER, STAFF, ADMIN)
- Clerk authentication integrated (ClerkProvider in layout, middleware/proxy)
- Sign-in (`/sign-in`) and sign-up (`/sign-up`) pages using Clerk pre-built components
- Clerk webhook (`/api/webhooks/clerk`) implemented — syncs new users to database
- lib/prisma.ts singleton created (Prisma 7 PrismaPg adapter pattern)
- Own account promoted to ADMIN via Prisma Studio

### Files Modified
- `prisma/schema.prisma` — User, Address, Role enum
- `prisma.config.ts` — Prisma 7 CLI config
- `app/layout.tsx` — ClerkProvider added
- `app/sign-in/[[...sign-in]]/page.tsx` — created
- `app/sign-up/[[...sign-up]]/page.tsx` — created
- `app/api/webhooks/clerk/route.ts` — created
- `lib/prisma.ts` — created
- `next.config.ts` — allowedDevOrigins for ngrok
- `package.json` — build script updated to `prisma generate && next build`
- `.gitignore` — removed app/generated from ignore (needed for Vercel)
- `.gitattributes` — LF line endings enforced

### Bugs Found
- Prisma 7 uses `provider = "prisma-client"` not `"prisma-client-js"` — different client generation
- Prisma 7 does NOT support `url = env("DATABASE_URL")` in datasource block — breaks with error
- Generated client output path was `app/generated/prisma` (root level) not `src/app/generated/prisma` — project has no `src/` directory despite create-next-app offering it
- `@/app/generated/prisma/client` not `@/app/generated/prisma` is the correct import path (entry file is `client.ts` not `index.ts`)
- Home directory (`C:\Users\crate`) had a rogue `.git` folder from a past accidental `git init` — was tracking entire user profile
- Stray `telebot/` folder inside project from old git history
- `package-lock.json` and `package.json` at home directory root confused Next.js workspace detection

### Bugs Fixed
- All above resolved before end of session
- Vercel build failing: fixed by committing generated Prisma client and adding `prisma generate &&` to build script
- Duplicate `RootLayout` in `layout.tsx`: fixed by merging into single function
- Missing `<a` tags stripped by copy-paste: fixed by using `cat > file << 'EOF'` in Git Bash instead of clipboard

### Technical Decisions
- Chose Clerk over Auth.js (simpler for solo dev)
- Kept Prisma 7 (not downgraded to 6)
- Committed generated Prisma client to repo for Vercel build reliability
- Used Next.js API routes (not NestJS) for simpler v1 architecture

### Lessons Learned
- Never run `git init` in home directory — always `cd` into project folder first
- Always verify `git status` scope before `git add .` — check that paths shown are only project files
- On Windows, use `cat > file << 'EOF'` in Git Bash to write files instead of copy-pasting code (angle brackets get stripped from clipboard)
- Prisma 7 is significantly different from Prisma 6 in datasource, generator, and client import patterns
- `npx prisma studio` must run in PowerShell not Git Bash (ERR_STREAM_PREMATURE_CLOSE in Git Bash)
- ngrok URL changes on every restart — must update Clerk webhook URL AND next.config.ts allowedDevOrigins each time

### Outstanding Issues
- None

### Recommended Next Task
Phase 2 — Admin Panel: Product Type Builder, Product Builder, Category Builder

### Notes
- Project root is `C:\Users\crate\Documents\POKE\ecommerce-platform`
- No `src/` directory — all app code at root level (`app/`, `lib/`, etc.)
- GitHub repo: `github.com/josthan12/ECOMMERCE-PLATFORM` (private)
- Vercel deploys from `main` branch only

---

## Session 2

Date: 2026-07-01

### Objective
Build Phase 2 admin panel — Product Type Builder, Product Builder, and begin Product Variants.

### Completed
- Admin layout with role-based access guard (`app/admin/layout.tsx`)
- Admin dashboard home page (`app/admin/page.tsx`)
- Product Type Builder: list page + create form with dynamic field adding
- Product Builder: list page + dynamic create form (renders fields based on selected product type)
- API routes: GET/POST `/api/admin/product-types`, GET/POST `/api/admin/products`
- Prisma schema updated: ProductType, ProductField, Product, ProductVariant models added
- FieldType enum added (TEXT, RICH_TEXT, NUMBER, CURRENCY, BOOLEAN, DATE, DROPDOWN, CHECKBOX, RADIO, IMAGE, VIDEO, JSON, TAG, COLOR)
- Migration run: `add_product_types_and_products`
- Schema rewritten to add ProductVariant, remove price/stock from Product, add variantOptions JSON column
- Migration `add_product_variants` schema ready (not yet run — next session task)

### Files Modified
- `prisma/schema.prisma` — ProductType, ProductField, Product, ProductVariant, FieldType enum
- `app/admin/layout.tsx` — created
- `app/admin/page.tsx` — created
- `app/admin/product-types/page.tsx` — created
- `app/admin/product-types/new/page.tsx` — created
- `app/admin/products/page.tsx` — created
- `app/admin/products/new/page.tsx` — created
- `app/api/admin/product-types/route.ts` — created
- `app/api/admin/products/route.ts` — created
- `app/generated/prisma/` — regenerated and committed

### Bugs Found
- `prisma.productType` undefined at runtime — caused by stale Next.js `.next` cache holding old Prisma client
- `app/generated/prisma` generated at wrong path (root `app/` not intended) — confirmed project has no `src/`
- Grammarly browser extension caused React hydration mismatch warning (data attributes injected into body tag)

### Bugs Fixed
- Cleared `.next` cache and re-ran `npx prisma generate` to fix stale client
- Added `suppressHydrationWarning` to `<body>` tag in layout.tsx for Grammarly issue
- All Vercel build errors resolved (import paths, prisma generate in build script)

### Technical Decisions
- Moved price/stock from Product to ProductVariant — almost all real products have variants, better to do now with empty DB than retrofit later
- Used JSON column for product attributes and variantOptions — enables zero-code new product types

### Lessons Learned
- When Prisma model properties show as undefined at runtime, clear `.next` cache and regenerate client
- Always commit `app/generated/` after schema changes or Vercel build will fail
- Understand code before copy-pasting — took time mid-session to explain architecture which helped developer understand the dynamic product system

### Outstanding Issues
- Product Variant migration not yet run — must be first task next session
- Product Builder UI not yet updated for variant definition and generation
- Category Builder not yet built

### Recommended Next Task
1. Run `npx prisma migrate dev --name add_product_variants`
2. Update Product Builder UI to support defining variant options and auto-generating combinations
3. Update products API to save variants
4. Build Category Builder


## Session 3

Date: 2026-07-02

### Objective
Complete Product Variants feature — migration, Product Builder UI, API, and fix downstream breakage.

### Completed
- Ran `add_product_variants` migration, regenerated Prisma client
- Product Builder UI (`app/admin/products/new/page.tsx`): added variant option definition inputs, "Generate Combinations" cartesian-product button, editable variant table (price/stock/SKU per row); removed obsolete top-level Price/Stock inputs
- Products API (`app/api/admin/products/route.ts`): POST now creates `Product` with nested `variants.create`; validates at least one variant with price and stock present; GET now includes `variants`
- Fixed runtime error on products list page (`app/admin/products/page.tsx`) — page still read removed `product.price`/`product.stock` fields; updated to derive price range and total stock from `product.variants`
- End-to-end tested: created Shoe product type, created Nike shoe with Size [7,8,9] and Color [Red,Blue], generated 6 combinations, filled price/stock, submitted, confirmed 1 Product + 6 ProductVariant rows in Prisma Studio

### Files Modified
- `prisma/schema.prisma` — no change this session (already updated last session)
- `app/admin/products/new/page.tsx` — variant UI added, price/stock inputs removed
- `app/api/admin/products/route.ts` — nested variant create, validation
- `app/admin/products/page.tsx` — derived price/stock display from variants
- `app/generated/prisma/` — regenerated (commit pending confirmation)

### Bugs Found
- `app/admin/products/page.tsx` threw `Cannot read properties of undefined (reading 'toFixed')` on `product.price.toFixed(2)` — page wasn't in the original expected-changes list but broke as a direct consequence of removing `price`/`stock` from `Product`
- Pre-existing bug in old POST handler: `!price === undefined` (operator precedence) — moot now since `price` isn't a top-level field anymore, but noted for awareness

### Bugs Fixed
- Products list page updated to include `variants` in the Prisma query and derive a price range (`$X` or `$X – $Y`) and summed stock instead of reading removed fields

### Technical Decisions
- Product creation now requires at least one variant (both client and server validate `variants.length > 0`) — a `Product` with zero variants has no price, making it unsellable. No "draft without variants" path was added.
- Products list shows price as a range (min–max across variants) rather than a single value, since variants can have different prices

### Lessons Learned
- Removing fields from a Prisma model requires auditing every page/query that reads those fields directly, not just the ones explicitly listed in the task's expected file changes — the products list page was missed in planning and only caught at runtime

### Outstanding Issues
- Confirm `app/generated/prisma/` was committed after this session's `prisma generate`
- Confirm `git push` completed (Step 7 of NEXT_TASK.md)

### Recommended Next Task
Category Builder — create/edit categories with SEO fields + banner image, category list page, GET/POST `/api/admin/categories`


## Session 4

Date: 2026-07-02

### Objective
Build Category Builder — final Phase 2 feature.

### Completed
- Category + CategoryProduct models added to schema, migration run (`add_categories`)
- Product model updated with inverse `categoryProducts` relation
- API routes: GET/POST `/api/admin/categories` (nested CategoryProduct create, auto-slug, seoTitle defaults to name)
- Category list page (`app/admin/categories/page.tsx`) — table with product count
- Category create form (`app/admin/categories/new/page.tsx`) — name/description/banner/SEO fields + product checkbox assignment list
- End-to-end tested: created categories, assigned Nike shoe product, confirmed Category and CategoryProduct rows in Prisma Studio; confirmed many-to-many works (same product assignable to multiple categories)

### Files Modified
- `prisma/schema.prisma` — Category, CategoryProduct models added
- `app/api/admin/categories/route.ts` — created
- `app/admin/categories/page.tsx` — created
- `app/admin/categories/new/page.tsx` — created
- `app/api/admin/products/route.ts` — accidentally overwritten with categories logic mid-session, fixed
- `app/generated/prisma/` — regenerated and committed

### Bugs Found
- `app/api/admin/products/route.ts` was overwritten with the categories route's GET/POST logic (identical to `categories/route.ts`), causing `/api/admin/products` to return Category-shaped JSON instead of Product data — likely caused by editing one file as a copy-paste template for the other and saving to the wrong file/tab
- This caused a silent frontend bug: the categories create form's "Assign Products" checkbox list rendered category names instead of product names (both shapes have `id`/`name`, so no runtime error occurred)
- Attempting to submit a category ID as a productId caused a 500 (Prisma foreign key constraint violation on `CategoryProduct.productId`), and since Category + CategoryProduct are created in one transaction, the Category row was also rolled back and never persisted

### Bugs Fixed
- Restored `app/api/admin/products/route.ts` to correct product GET/POST logic (productType + variants include, variant validation, nested variant create)

### Technical Decisions
- Category assignment happens on the create form itself (checkbox list), not as a separate step — consistent with Product Builder's pattern of nested creates in one request
- Category nesting (parent/child) deferred — not in current scope, no cost to adding later via nullable `parentId` self-relation
- Banner image is a plain URL string, no upload — consistent with no file-upload infra existing yet

### Lessons Learned
- When using an existing route file as a copy-paste starting point for a new one, create the new file via `cat > path << 'EOF'` in Git Bash rather than duplicating an editor tab — reduces risk of saving changes back to the wrong file (same root cause category as the Session 1 clipboard-stripping issue: manual copy/duplicate workflows are error-prone on this setup)
- When a fetch's data looks wrong on a page but the shape has overlapping fields (`id`/`name` in this case), check the actual route file content directly rather than assuming the frontend fetch call is at fault — the bug can be entirely server-side with no error surfaced

### Outstanding Issues
- Confirm `git push` completed for this session

### Recommended Next Task
Begin Phase 3 — Public Storefront: homepage section renderer, category page route (`/category/[slug]`), product page route (`/product/[slug]`)


---

## Session 5

Date: 2026-07-03

### Objective
Complete Phase 3 — Public Storefront: category page, product page, variant image swap, category filtering/sorting, and homepage.

### Completed
- Category page route (`app/category/[slug]/page.tsx`): Server Component, fetch by slug, banner/name/description, product grid, `notFound()` on unknown slug, empty state
- Product page route (`app/product/[slug]/page.tsx`): Server Component, fetch by slug, spec table from `attributes`, `notFound()` on unknown slug
- Variant selector (`VariantSelector.tsx`, later renamed): Client Component, generic N-option selector, updates price/stock/SKU on selection
- Category page product cards linked to `/product/[slug]`
- Schema: `Product.imageUrl` added (migration `add_product_image_url`)
- Schema: `ProductVariant.imageUrl` added (migration `add_variant_image_url`)
- Admin form (`app/admin/products/new/page.tsx`): added per-variant Image URL input, then product-level Image URL input
- API route (`app/api/admin/products/route.ts`): accepts and saves `imageUrl` on both product and each variant
- `VariantSelector.tsx` renamed to `ProductGallery.tsx` — now owns image display + swap logic in addition to option selector, falling back to `product.imageUrl` when the selected variant has none
- Category page: added sort (`newest` default/price-asc/price-desc/name) and in-stock-only filter via `<form method="GET">` + `searchParams`, with differentiated empty-state messaging (empty category vs. filtered to zero)
- Homepage (`app/page.tsx` rewritten): composes four new section components under `app/components/homepage/` — `HeroBanner.tsx` (static content), `FeaturedProducts.tsx` (latest 4 products), `CategoryGrid.tsx` (all categories), `Newsletter.tsx` (non-functional form, Client Component)
- `app/components/BackButton.tsx` created — shared Client Component using `router.back()`, added to both category and product pages
- Category page product cards updated to render `product.imageUrl` (was a static gray placeholder with no `<img>` at all since the page was first built)

### Files Modified
- `prisma/schema.prisma` — `Product.imageUrl`, `ProductVariant.imageUrl` added
- `app/category/[slug]/page.tsx` — created, then updated (product links, sort/filter, back button, product images)
- `app/product/[slug]/page.tsx` — created, then updated (ProductGallery integration, back button)
- `app/product/[slug]/ProductGallery.tsx` — created (renamed from `VariantSelector.tsx`)
- `app/components/BackButton.tsx` — created
- `app/components/homepage/HeroBanner.tsx` — created
- `app/components/homepage/FeaturedProducts.tsx` — created
- `app/components/homepage/CategoryGrid.tsx` — created
- `app/components/homepage/Newsletter.tsx` — created
- `app/page.tsx` — rewritten
- `app/admin/products/new/page.tsx` — variant image input added, then product image input added
- `app/api/admin/products/route.ts` — variant `imageUrl` save added, then product `imageUrl` save added
- `app/generated/prisma/` — regenerated twice (both migrations)

### Bugs Found
- `Unknown argument imageUrl` Prisma error on product creation — caused by stale generated Prisma client / `.next` cache after the `ProductVariant.imageUrl` migration; not a code bug
- `GET /products/nike-waterbottle 404` — user visited `/products/...` (plural) instead of the actual route `/product/[slug]` (singular); not a routing bug, a URL typo
- Product-level image not showing on Featured Products (homepage): `app/admin/products/new/page.tsx` had a product-level `imageUrl` state and input added, but the `useState` call was accidentally placed at module scope (outside the component function) instead of inside `NewProductPage`, and the value was never included in the submit `fetch` body — `app/api/admin/products/route.ts` also never destructured or saved it. `Product.imageUrl` was `null` for every product as a result.
- Product image not showing on category page grid: the category page's product card had always rendered a static empty `<div className="h-40 bg-gray-100" />` with no `<img>` tag at all — a gap from the original page build, unrelated to the imageUrl bug above.
- Vercel build failure (TypeScript): `ProductGallery.tsx` typed `Variant.combination` as `Record<string, string>`, but Prisma's `Json` column type is `Prisma.JsonValue` (a recursive union including `null`/arrays/primitives), which doesn't satisfy that shape — caught by `next build`'s type check on Vercel, not locally. A first fix attempt hand-rolled a local type matching `Prisma.JsonValue`'s shape, which still failed due to TypeScript's structural matching on recursive unions with named vs. inline interfaces.

### Bugs Fixed
- Cleared `.next` cache and re-ran `npx prisma generate` to resolve the stale client error
- Moved `const [imageUrl, setImageUrl] = useState('')` inside `NewProductPage`; added `imageUrl` to the submit body; added `imageUrl` destructuring and save to the API route's `product.create` call
- Added conditional `<img>` rendering to the category page's product card, matching the pattern already used on `FeaturedProducts.tsx` and `CategoryGrid.tsx`
- Retyped `ProductGallery.tsx`'s `Variant.combination` as `unknown`, added `normalizeCombination()` to convert it to `Record<string, string>` at runtime via `useMemo`; resolves the Vercel build failure and makes the component defensive against malformed/null combination data

### Technical Decisions
- Homepage sections are hardcoded in `app/components/homepage/` for now — no `HomepageSection` DB model. Admin-configurable homepage content (drag-and-drop, per-section config) is explicitly Phase 7 scope; building it now would duplicate that work later.
- New components live under `app/components/` (nested inside `app/`), not a top-level `components/` directory — matches the project's existing "everything under `app/`" convention, and Next.js's router only recognizes `page.tsx`/`layout.tsx`/`route.ts` as routable files, so nesting has no functional downside.
- `ProductVariant.imageUrl` is optional and falls back to `Product.imageUrl` when unset — avoids forcing per-variant photography for every SKU while still supporting it where available. `ProductGallery.tsx` (the renamed `VariantSelector.tsx`) owns both the image and the option selector as one unit, rather than splitting image/selector across a server/client boundary — kept as one Client Component for simplicity, accepting a known layout tradeoff (see below) over introducing a second wrapper component.
- Category/product page sort and filter state is read from `searchParams` and applied via a plain `<form method="GET">` — no client-side state, no auto-apply on change, matches "manual Apply button" requirement and avoids introducing client JS for something a page reload handles fine.
- Back button implemented via `router.back()` (browser-native history), not a custom navigation stack — the browser already tracks history; building a custom stack would have been unnecessary complexity for what native `back()` already provides.

### Lessons Learned
- When adding a new field end-to-end (schema → admin form → API route), test the full round trip immediately — the product-level `imageUrl` bug went undetected for a while because the variant-level version of the same field was tested and working, creating false confidence that the pattern was fully wired everywhere it needed to be.
- A `useState` call outside a component is a silent trap when pasted from a diff instruction without checking placement — worth double-checking hook placement specifically when applying multi-part instructions to an existing file.
- UI feature gaps (e.g. a card with no `<img>` tag at all) don't always throw errors — they fail silently as "looks empty," so cross-checking every page that displays the same entity (product) after adding a new field is worth doing explicitly, not just the page that was the direct target of the change.

### Outstanding Issues
- Products created before the image-url bug fix (e.g. early test products) have `imageUrl: null` and will show no image on the homepage/category grid unless manually backfilled in Prisma Studio — not a bug, just stale test data
- Homepage/category/product page styling is intentionally minimal (bare Tailwind) — real theming deferred to Phase 7
- Confirm `git push` completed and `app/generated/prisma/` committed for both migrations this session

## Session 6

Date: 2026-07-06

### Objective
Phase 4 — Cart state, Checkout, and HitPay Payment integration (full flow: cart → checkout → payment → confirmation).

### Completed
- Zustand cart store (`lib/store/cart.ts`) — localStorage-persisted, guest carts allowed
- Site header (`app/components/Header.tsx`) with cart icon/count — fixed a hydration mismatch via a `hasMounted` guard (Zustand persist only hydrates client-side)
- Cart page (`/cart`) — quantity edit/remove, GST-exclusive subtotal
- Stock-aware quantity guards on product page (accounts for quantity already in cart) and cart page — clamp value + inline warning
- GST module (`lib/gst.ts`) — 9% rate, applied only at checkout
- `Order`/`OrderItem` schema + `OrderStatus` enum (full lifecycle defined upfront)
- Login-gated checkout (`/checkout`) — decision made: no guest checkout, account required
- Shipping address form + validation (`lib/validateAddress.ts`)
- Order creation API (`/api/checkout`) — atomic stock check-and-decrement, live price re-verification, GST calc, address snapshot
- Full HitPay Payment Request integration, with several corrections found via live testing: form-urlencoded body (not JSON), removal of deprecated `webhook` param (replaced by Dashboard registration), sandbox/live key pairing fix, and critically — `expires_after: '5 min'` (not `'5 minutes'`, which HitPay's own docs incorrectly show as an example and which returns a 422)
- HitPay webhook (`/api/webhooks/hitpay`) — HMAC-SHA256 verification, idempotent status updates
- Shared stock-restoration helper (`lib/orders.ts`), consolidated from 3 duplicated call sites
- Lazy reconciliation on the order confirmation page — polls HitPay as a fallback for abandoned/expired payments that never fire a webhook
- Real order confirmation page (`/checkout/success`) — full breakdown when paid, access-controlled, cosmetic cancel messaging
- HitPay's built-in `send_email` receipt tested and confirmed working
- **Full end-to-end verification completed:** successful PayNow payment → webhook → `PAID`; abandoned PayNow payment → expires after 5 min on HitPay's side → reload confirmation page → `reconcileIfStale` detects `expired` → `PAYMENT_FAILED` + stock restored — all confirmed via live sandbox testing

### Files Modified
- `prisma/schema.prisma` — `Order`, `OrderItem`, `OrderStatus` enum, `Order.hitpayPaymentRequestId`
- `lib/store/cart.ts` — created
- `app/components/Header.tsx` — created, fixed for hydration
- `app/layout.tsx` — added `<Header />`
- `app/cart/page.tsx` — created, updated with stock-cap guard
- `app/product/[slug]/ProductGallery.tsx` — cart wiring, stock-cap guard
- `app/product/[slug]/page.tsx` — passes product identity props
- `lib/gst.ts` — created
- `lib/validateAddress.ts` — created
- `app/checkout/page.tsx` — created (auth gate)
- `app/checkout/CheckoutForm.tsx` — created
- `app/api/checkout/route.ts` — created, corrected multiple times (form-encoding, type fixes, compensating action, `hitpayPaymentRequestId` storage, `expires_after`)
- `app/api/webhooks/hitpay/route.ts` — created
- `lib/orders.ts` — created (`markOrderFailedAndRestoreStock`)
- `app/checkout/success/page.tsx` — created, rebuilt multiple times (real display, access control, lazy reconciliation, cosmetic cancel messaging)
- `.env` / `.env.example` — `HITPAY_API_KEY`, `HITPAY_API_BASE_URL`, `HITPAY_WEBHOOK_SALT`, `NEXT_PUBLIC_APP_URL`, `GST_RATE_PERCENT`

### Bugs Found
- Hydration mismatch on cart badge — fixed with `hasMounted` guard
- TypeScript `any[]` inference on `orderItemsData` — fixed with explicit type annotation
- `Prisma.JsonValue` vs `Prisma.InputJsonValue` mismatch on `tx.order.create` — fixed by narrowing the annotation
- HitPay 401 (sandbox/live key mismatch), 422 (malformed `redirect_url` from missing `NEXT_PUBLIC_APP_URL`), 422 (wrong Content-Type — JSON instead of form-urlencoded)
- Webhook crash — `HITPAY_WEBHOOK_SALT` was never actually set (only scaffolded empty)
- **Stock held hostage if HitPay call failed after Order creation** — fixed via compensating transaction
- Discovered "Back to Merchant" does not cancel the underlying HitPay payment request — confirmed by successfully paying a request that had already redirected back with `status=canceled`
- **Root cause of "stuck in PENDING_PAYMENT forever":** `expires_after` was never sent at all in the original implementation — HitPay had nothing to expire the request into
- `expires_after: '15 minutes'` and `'5 minutes'` both rejected (422) — correct value is `'5 min'`. HitPay's own docs literally show `"5 minutes"` as an example, which is incorrect.
- **New gap discovered after the above was fixed:** stock only restores when the confirmation page is manually reloaded post-expiry — there is no automatic background recovery. Root cause: HitPay never fires a webhook for `expired`/`canceled` requests, and our reconciliation is page-load-triggered only. This is the next task (Vercel Cron).

### Bugs Fixed
All of the above except the final gap (silently-abandoned checkouts never getting reconciled without a manual page visit) — that's the next task, not a bug in what was built.

### Technical Decisions
- Guest checkout disallowed — account required, cart survives the sign-in redirect via localStorage
- Cart is always re-verified live at checkout — cart's cached price/stock is never trusted
- Shipping address snapshotted onto `Order`, not a live FK — protects historical records
- Full `OrderStatus` lifecycle enum defined upfront to avoid a future migration
- HitPay: PayNow only for now
- Stock-restoration logic centralized in `lib/orders.ts`, reused across 3 call sites
- Lazy reconciliation (poll-on-page-load) chosen over a cron job initially, since it required no new infrastructure and covers the common case — **now confirmed insufficient on its own**, a cron job is needed as a complement (not a replacement) for the case where nobody ever revisits the page
- Cosmetic-only "Payment Cancelled" messaging on `status=canceled` redirect, without mutating DB state — since PayNow requests can't be safely cancelled server-side and an early customer might have already scanned the QR

### Lessons Learned
- Documentation examples aren't always correct — HitPay's own docs show `"5 minutes"` for `expires_after`, but the API actually requires `"5 min"`. Always verify example values empirically against the live API, even when copied directly from official docs.
- A redirect URL's query params are never a trustworthy signal for anything beyond immediate cosmetic UI — true state must come from a verified webhook or an authenticated status check.
- "Customer navigated away" ≠ "payment attempt is over," especially for QR-based payment methods that remain completable after the browser moves on.
- Page-load-triggered reconciliation alone is insufficient for any flow where the user might never return to the triggering page — needed a proactive background mechanism (cron) as well, not instead of, the reactive one.

### Outstanding Issues
- Vercel Cron job not yet built — orders whose confirmation page is never revisited stay `PENDING_PAYMENT` with stock held indefinitely
- Temporary diagnostic logging (`console.log('[hitpay reconcile]', ...)`) still present in `reconcileIfStale`, to be removed once the cron work is finalized
- Custom branded confirmation email not started (HitPay's built-in receipt confirmed working as an interim solution)
- `failed` webhook status never directly observed in sandbox (low risk — shares code with proven `expired` path)
- Card payment testing blocked (HitPay sandbox requires bank account setup)

### Recommended Next Task
Build a Vercel Cron job (`app/api/cron/reconcile-orders/route.ts` + `vercel.json`) to automatically reconcile stale `PENDING_PAYMENT` orders in the background, closing the last gap in Phase 4's payment flow. Then move to the custom order confirmation email.
