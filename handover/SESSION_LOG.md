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

---

## Session 7

Date: 2026-07-13

### Objective
Close out Phase 4: decide on the automatic-reconciliation gap (Vercel Cron job), and build the custom branded order confirmation / payment-failed emails.

### Completed
- **Reconciliation automation deferred** (see Technical Decisions) — instead, `app/checkout/success/page.tsx`'s cosmetic `status=canceled` messaging was updated to explicitly instruct customers to refresh the page after completing payment via QR, and not to reuse the old QR code
- Resend account created, custom domain `biggyballs69.gay` verified (DNS/SPF/DKIM), sending address set to `orders@biggyballs69.gay`
- `resend`, `react-email`, `@react-email/components` installed
- `lib/email/resend.ts` — Resend client singleton, reads `RESEND_API_KEY`/`RESEND_FROM_EMAIL`
- `lib/email/templates/brand.ts` — shared brand constants (store name "PokeSunshineTCG", palette: navy `#14213D`, burgundy `#6E2439`, gold `#C6A15B`, background `#FAF6EE`, text `#1F2126`, button text `#FFFFFF`)
- `lib/email/templates/orderConfirmation.tsx` — React Email template, itemized order breakdown, shipping address, "View Order" CTA
- `lib/email/templates/paymentFailed.tsx` — React Email template, failure messaging, "Return to Cart" CTA
- `lib/email/sendOrderEmail.ts` — `sendOrderConfirmationEmail(orderId)` and `sendPaymentFailedEmail(orderId)`, both fetch order data via Prisma, render the React Email template, call Resend; both wrapped in try/catch that only logs on failure (never throws into the caller)
- Wired `sendOrderConfirmationEmail` into `app/api/webhooks/hitpay/route.ts`'s `completed` branch (called after the `Order` status update resolves)
- Wired `sendPaymentFailedEmail` into `lib/orders.ts` → `markOrderFailedAndRestoreStock`, called after the `$transaction` block resolves (single call site — automatically covers both the webhook's `failed` path and lazy reconciliation's `expired`/`canceled` path)
- Built a temporary debug route `app/api/test-email/route.ts` to isolate email-layer testing from the HitPay webhook — used to confirm the email stack worked independently of a webhook 404 that was being investigated in parallel
- **End-to-end verified:** both order-confirmation and payment-failed emails received in a real inbox, for real orders, styled with the correct brand palette

### Files Modified
- `app/checkout/success/page.tsx` — cosmetic cancel-messaging copy updated (no logic change)
- `lib/orders.ts` — `sendPaymentFailedEmail` call added to `markOrderFailedAndRestoreStock`, positioned **after** the `$transaction` block (not inside it — avoids holding a DB transaction open during a Resend network call)
- `app/api/webhooks/hitpay/route.ts` — `sendOrderConfirmationEmail` call added to the `completed` branch, positioned after the `Order` update resolves
- `lib/email/resend.ts` — created
- `lib/email/templates/brand.ts` — created
- `lib/email/templates/orderConfirmation.tsx` — created
- `lib/email/templates/paymentFailed.tsx` — created
- `lib/email/sendOrderEmail.ts` — created
- `app/api/test-email/route.ts` — created (debug-only, **must be deleted**, see Outstanding Issues)
- `.env` / `.env.example` — `RESEND_API_KEY`, `RESEND_FROM_EMAIL` added; `NEXT_PUBLIC_APP_URL` usage clarified (must be a publicly reachable URL, not `localhost`, for email CTA links to work off the dev machine)

### Bugs Found
- First draft of `markOrderFailedAndRestoreStock` placed `await sendPaymentFailedEmail(orderId)` **inside** the `prisma.$transaction(...)` callback — held the transaction open during an external network call to Resend, risking lock contention under concurrent checkouts
- First draft of the webhook route attempted `await sendOrderConfirmationEmail(order.id)` **as a statement inside the `data: {...}` object literal** passed to `prisma.order.update(...)` — syntactically invalid, would not compile
- A `POST /api/webhooks/hitpay 404` in dev logs was initially suspected to be a routing/compile problem; turned out to be the handler correctly running and returning its own `404` (`{"error": "Order not found"}`) because the `reference_number` HitPay sent didn't match any `Order.id` — a data/testing issue, not a broken route. (Root cause of the mismatch itself not fully diagnosed this session — flagged as an outstanding item below.)
- Email "View Order" button worked from the same laptop running the dev server but not from other devices — `NEXT_PUBLIC_APP_URL` was set to `localhost:3000`, which only resolves locally; needs to be the current ngrok URL (or, in production, the real domain) for the link to work off-device
- A long run of ~48 identical `GET /checkout/success?...&status=completed` requests appeared in dev logs, each taking 8–11s of application-code time — suspected to be either manual repeated refreshing during testing or `reconcileIfStale` re-running its full HitPay-status-check-and-possibly-restore-stock-and-possibly-send-email logic on every load because the order was stuck in `PENDING_PAYMENT`. **Not fully root-caused this session** — user confirmed only one email of each type was received overall, suggesting either the order resolved to a terminal status early in that sequence (so later reconciliation calls short-circuited) or the repeated requests were manual reloads rather than an automated loop, but this was not conclusively verified. Flagged as an outstanding item.

### Bugs Fixed
- Moved the payment-failed email call to after the `$transaction` block resolves in `lib/orders.ts`
- Fixed the webhook route to call `sendOrderConfirmationEmail` as a separate statement after `prisma.order.update(...)` resolves, not nested inside its arguments
- Clarified `NEXT_PUBLIC_APP_URL` must track the current ngrok tunnel URL in dev (documented as a known dev-only friction point, not fixed at the code level — resolves permanently on deployment to a fixed domain)

### Technical Decisions
- **Deferred: automatic background reconciliation (Vercel Cron / GitHub Actions).** Two implementation paths were scoped in detail (Vercel Cron — limited to once-daily on the project's current Hobby tier; GitHub Actions scheduled workflow — free, tier-independent, can run every few minutes) but neither was built this session. Reasoning: significant time had already been invested in this specific gap across sessions, the existing lazy (page-load-triggered) reconciliation already resolves the common case, and the remaining risk (a customer who abandons checkout and never revisits the confirmation page) was judged acceptable to mitigate via clearer on-page messaging rather than new infrastructure, in order to keep the project moving. This can be revisited later; the GitHub Actions approach was identified as the preferred path if/when it is revisited, since it avoids the Vercel Hobby-tier once-daily limitation without requiring a plan upgrade.
- **Rejected: immediately restoring stock on the `status=canceled` cosmetic redirect.** Considered and explicitly rejected — PayNow QR codes remain payable for up to 5 minutes after a customer clicks "Back to Merchant" (no cancel endpoint exists for QR-based payments), so immediately restoring stock on that redirect risks overselling if the customer completes payment moments later. The existing HitPay-status-verified reconciliation approach (only restoring stock after confirming a real `expired`/`failed`/`canceled` status from HitPay's API) was kept instead.
- Used React Email (`@react-email/components`) over hand-written HTML strings for the email templates — standard pairing with Resend, easier to maintain/iterate on styling.
- Brand palette and store name ("PokeSunshineTCG") established this session for transactional emails — first fully-branded surface in the app (storefront/checkout remain intentionally unstyled per the Phase 7 theming deferral).
- Email sending is treated strictly as a non-blocking side effect: both send functions catch their own errors internally and log-only, and both are called *after* their related DB operation resolves rather than being woven into the transaction — consistent with not letting an external service's availability affect core order-processing correctness.

### Lessons Learned
- A `404` response in dev server logs doesn't necessarily mean a broken route — it can be the correct, intentional response your own handler returned (e.g. `NextResponse.json({...}, { status: 404 })`). Check whether the log line matches your own error-response shape before assuming a routing/compile problem.
- Statements cannot be placed inside object literals being passed as function arguments (e.g. `await x()` inside a Prisma `data: {...}` block) — this is a fundamental JS/TS syntax rule, not a Prisma-specific gotcha, but easy to introduce when quickly appending a new side-effect call near existing code.
- External network calls (email sends, third-party API calls) should never be nested inside a DB transaction — do the DB work, let the transaction close, then perform the external call. Applies generally, not just to this feature.
- `NEXT_PUBLIC_*` env vars used in links/redirects need to be genuinely public-reachable URLs, not `localhost` — obvious in hindsight but easy to miss when the primary testing device is also the host machine, since `localhost` "just works" there and masks the issue.
- When multiple things are being debugged in parallel (webhook 404 + email delivery), isolating one variable at a time (e.g. a throwaway direct-call test route, bypassing the webhook entirely) is faster than trying to diagnose both through the same end-to-end flow.

### Outstanding Issues
- **`app/api/test-email/route.ts` must be deleted** — unauthenticated debug route capable of triggering real customer emails; not yet confirmed removed as of end of session
- **Diagnostic `console.log('[hitpay reconcile]', orderId, hitpayData.status, hitpayData)` in `app/checkout/success/page.tsx` still present** — logs full HitPay response payloads on every reconciliation check; flagged as cleanup since Session 6, still not removed
- The root cause of the `reference_number` → `Order.id` mismatch that produced the earlier `404` was not conclusively identified (stale ngrok/webhook registration was the leading theory, not confirmed)
- The ~48-request repeated-load pattern on `/checkout/success` was not conclusively root-caused (see Bugs Found above) — worth a closer look if it recurs, since at scale it could mean repeated external calls (HitPay status checks, and potentially emails) per customer session
- Automatic background reconciliation remains an open gap by deliberate choice — see Technical Decisions
- Card payment testing still blocked (HitPay sandbox requires bank account setup)
- `failed` webhook status still never directly observed in sandbox (low risk — shares code with proven `expired`/`canceled` path)

### Recommended Next Task
Begin **Phase 5 — Order Fulfillment**. Suggested starting point: a minimal, read-only `/admin/orders` list page (status/customer/total/date), since there is currently zero order visibility outside Prisma Studio. Before starting, delete `app/api/test-email/route.ts` and remove the diagnostic reconcile log as routine cleanup.


## Session 8

Date: 2026-07-14

### Objective
Close out Phase 5 — Order Fulfillment. Housekeeping cleanup, admin order
visibility (list/detail/filter/sort), fulfillment status lifecycle, manual
refund tracking, manual tracking numbers, customer notification emails,
customer-facing order history, and a checkout scope change (shipping fee +
self-collection) that emerged mid-session.

### Completed
- Housekeeping: confirmed `app/api/test-email/route.ts` deleted and the
  diagnostic `console.log('[hitpay reconcile]', ...)` removed from
  `app/checkout/success/page.tsx` (both carried over from Session 7)
- `/admin/orders` — read-only list, status badge, links to detail page; later
  extended with `searchParams`-driven status filter + sort (newest/oldest/
  total asc/desc), matching the existing category-page GET-form convention
- `/admin/orders/[id]` — customer, shipping/self-collection info, payment
  reference, itemized breakdown, totals; later extended with tracking number
  display and a shipping-fee line
- `PUT /api/admin/orders/[id]/status` — admin-guarded, advances an order
  exactly one fulfillment stage, transition rules **branched by
  `fulfillmentMethod`** (delivery vs self-collection have different valid
  chains — see below)
- `OrderStatusActions.tsx` — Client Component, renders the next-stage button
  (label derived from the transition map) and a separate "Mark as Refunded"
  button with a `window.confirm()` guard
- **Scope decision, mid-build:** rejected HitPay's Refund API and rejected
  any order-cancellation feature entirely. Admin handles refunds manually via
  Telegram/email + HitPay's dashboard or bank transfer, outside the app.
  `PUT /api/admin/orders/[id]/refund` built instead — pure status flag, no
  HitPay call, no stock change (also explicitly decided: no auto-restore)
- **Scope decision, mid-build:** rejected courier API integration, shipping
  label generation, and courier status sync entirely — admin self-fulfills
  shipping and prints own labels. Replaced with a manual tracking number
  field: `PUT /api/admin/orders/[id]/tracking` + `TrackingNumberForm.tsx`
  (freely editable at any status, not gated to a specific stage)
- **Scope decision, mid-build:** self-collection introduced as a first-class
  fulfillment option at checkout, need it "now" not "later" as originally
  discussed. This meant:
  - Schema: `FulfillmentMethod` enum (`DELIVERY`, `SELF_COLLECTION`) added to
    `Order`, plus `shippingFee Float @default(0)` and `trackingNumber
    String?`
  - Schema (second migration): `shippingBlock`, `shippingStreet`,
    `shippingPostalCode` changed from required to nullable — self-collection
    orders don't need a shipping address at all
  - `lib/gst.ts` — `calculateTotalWithGST()` extended to accept an optional
    `shippingFee` param, taxes `subtotal + shippingFee` combined (confirmed:
    GST does apply to the shipping fee)
  - `lib/validateAddress.ts` — `validateShippingAddress()` signature changed
    to require `fulfillmentMethod`, short-circuits to valid when
    `SELF_COLLECTION`
  - `app/api/checkout/route.ts` — reads `fulfillmentMethod` from the request
    body, branches fee (`SHIPPING_FEE_SGD` vs `SELF_COLLECTION_FEE_SGD`),
    nulls out address fields when self-collection, saves `shippingFee` +
    `fulfillmentMethod` onto the `Order`
  - `CheckoutForm.tsx` — added a Delivery/Self-Collection radio toggle,
    fetches live fee amounts from a new public `GET
    /api/checkout/fulfillment-fees` route (env-var-backed, not
    `NEXT_PUBLIC_*`, so fees can change without a rebuild), conditionally
    hides the address form for self-collection, shows the pickup address
    (hardcoded constant, see below) when self-collection is selected
  - `lib/constants.ts` (new) — `SELF_COLLECTION_ADDRESS`, a plain string
    constant. A DB-backed `StoreSettings` model + admin-editable form was
    scoped and explicitly rejected as overkill; admin will hand-edit this
    constant if the pickup location ever changes
- **Status lifecycle branching, once self-collection existed:** admin
  pointed out self-collection orders should skip `SHIPPED`/`DELIVERED`
  entirely — `PAID → PROCESSING → PACKED → COMPLETED` directly (the
  "shipped" concept doesn't apply to in-person pickup). Updated both
  `status/route.ts` and `OrderStatusActions.tsx` to hold two separate
  transition maps, selected by `order.fulfillmentMethod`
- Two new email templates: `shippingNotification.tsx` (delivery orders,
  fires on `PACKED → SHIPPED`, includes tracking number if set) and
  `readyForCollection.tsx` (self-collection orders, fires on `PACKED →
  COMPLETED`, includes pickup address) — both follow the exact structure of
  the existing `orderConfirmation.tsx`/`paymentFailed.tsx` templates
  (matched against pasted source rather than guessed)
- `sendOrderEmail.ts` — added `sendShippingNotificationEmail()` and
  `sendReadyForCollectionEmail()`, both following the established
  try/catch-log-only, non-transaction-blocking pattern; both wired into
  `status/route.ts` as separate statements *after* the `Order.update` call
  resolves, learning directly from the Session 7 "statement inside an object
  literal" bug rather than repeating it
- `/account/orders` and `/account/orders/[id]` — customer-facing order
  history, auth-gated to any signed-in user (not admin-only), scoped to
  `where: { userId: user.id }`; detail page 404s (not just redirects) if the
  order belongs to someone else, matching the existing `/checkout/success`
  ownership-check pattern
- `lib/orderStatus.ts` (new) — `STATUS_STYLES` + `formatStatus()` extracted
  from four separate duplicated copies (admin list, admin detail,
  `OrderStatusActions`, and now the new customer pages) into one shared
  module
- Bug caught and fixed: all four order-lifecycle email templates initially
  linked their "View Order" button to `/checkout/success?orderId=...` — a
  page designed for one-time, `PAID`-only display. Updated
  `orderConfirmation.tsx`, `shippingNotification.tsx`, and
  `readyForCollection.tsx` to link to `/account/orders/[id]` instead.
  `paymentFailed.tsx` was checked and correctly left unchanged — it already
  linked to `/cart`, which is the right destination for a payment that never
  completed
- `expires_after` re-confirmed as `'5 mins'` (not `'5 min'`) — supersedes the
  2026-07-06 DECISIONS.md finding; logged as a new dated entry rather than
  editing the old one
- Header (`app/components/Header.tsx`) — added a "My Orders" link and full
  Clerk auth UI (`<Show when="signed-in/signed-out">`, `<SignInButton>`,
  `<UserButton>`) — previously had zero sign-in/sign-out UI anywhere in the
  storefront, a gap first noticed by the admin mid-session and fixed here.
  `afterSignOutUrl` moved to `<ClerkProvider>` in `app/layout.tsx` per
  Clerk's current (verified via live docs search) deprecation of that prop
  directly on `<UserButton>`

### Files Modified
- `app/api/test-email/route.ts` — deleted (housekeeping)
- `app/checkout/success/page.tsx` — diagnostic log removed (housekeeping)
- `app/admin/orders/page.tsx` — created, then extended with filter/sort
- `app/admin/orders/[id]/page.tsx` — created, then extended (tracking
  number block, shipping-fee line, self-collection-aware address display)
- `app/admin/orders/[id]/OrderStatusActions.tsx` — created, then extended
  twice (refund button, then fulfillment-method-aware transition maps)
- `app/admin/orders/[id]/TrackingNumberForm.tsx` — created
- `app/api/admin/orders/[id]/status/route.ts` — created, then rewritten for
  branched transition maps + email trigger calls
- `app/api/admin/orders/[id]/refund/route.ts` — created
- `app/api/admin/orders/[id]/tracking/route.ts` — created (initially missed
  in hand-off, caused a "Failed to save tracking number" bug until
  identified and created)
- `app/api/checkout/fulfillment-fees/route.ts` — created
- `app/api/checkout/route.ts` — extended for `fulfillmentMethod`, shipping
  fee, nulled address fields on self-collection
- `app/checkout/CheckoutForm.tsx` — extended: fulfillment toggle, live fee
  fetch, conditional address form, pickup address display
- `lib/validateAddress.ts` — signature change (`fulfillmentMethod` param,
  self-collection bypass)
- `lib/gst.ts` — `calculateTotalWithGST()` extended for optional
  `shippingFee` param
- `lib/constants.ts` — created (`SELF_COLLECTION_ADDRESS`)
- `lib/orderStatus.ts` — created (extracted `STATUS_STYLES`/`formatStatus`)
- `lib/email/templates/shippingNotification.tsx` — created
- `lib/email/templates/readyForCollection.tsx` — created
- `lib/email/sendOrderEmail.ts` — extended with two new send functions
- `lib/email/templates/orderConfirmation.tsx` — "View Order" link updated
- `app/account/orders/page.tsx` — created
- `app/account/orders/[id]/page.tsx` — created
- `app/components/Header.tsx` — "My Orders" link + Clerk auth UI added
- `app/layout.tsx` — `afterSignOutUrl="/"` added to `<ClerkProvider>`
- `prisma/schema.prisma` — `FulfillmentMethod` enum; `Order.fulfillmentMethod`,
  `shippingFee`, `trackingNumber` added; `shippingBlock`/`shippingStreet`/
  `shippingPostalCode` changed to nullable (two separate migrations)
- `.env` / `.env.example` — `SHIPPING_FEE_SGD`, `SELF_COLLECTION_FEE_SGD`
  added
- `app/generated/prisma/` — regenerated twice (both migrations)

### Bugs Found
- `Cannot read properties of undefined (reading 'toFixed')` on
  `order.shippingFee.toFixed(2)` in the admin detail page — same
  stale-Prisma-client/`.next`-cache root cause documented twice before in
  this project (Sessions 2 and 5), not a new class of bug
- `PUT /api/admin/orders/[id]/tracking` returned a generic "Failed to save
  tracking number" — root cause was the route file simply not having been
  created in the admin's project despite being scoped and written; the file
  path (`app/api/admin/orders/[id]/tracking/route.ts`) was re-confirmed and
  the file created directly
- All four order-lifecycle email templates linked to `/checkout/success`
  instead of a permanent order page — not caught until manually clicking
  through a real received email; `/checkout/success` was never designed to
  handle non-`PAID` statuses gracefully, so this was a real dead-end for
  customers on Shipped/Ready-for-Collection emails until fixed
- `expires_after: '5 mins'` vs `'5 min'` — an inconsistency surfaced across
  this conversation (DECISIONS.md said `'5 min'`; the actual pasted code had
  `'5 mins'`; the admin then asserted `'5 mins'` was correct). Not verified
  independently by re-running against HitPay's sandbox this session — taken
  on the admin's explicit confirmation as the new source of truth and logged
  accordingly. Worth flagging: this value has now flipped once already based
  on empirical testing; if it needs correcting again, an inline code comment
  at the call site (not just a DECISIONS.md entry) is probably warranted.

### Bugs Fixed
- All of the above resolved within-session except the `expires_after`
  question, which was resolved by admin confirmation rather than a fresh
  sandbox test (flagged as a residual epistemic gap, not left as an open
  bug)

### Technical Decisions
- **Refunds are manual, record-only, no auto stock-restore.** See
  DECISIONS.md for full reasoning — summary: HitPay Refund API exists
  (`Create Refund` endpoint, PayNow/Card only, verified via HitPay's public
  docs) but was deliberately not integrated; the admin prefers handling
  refunds entirely outside the app via direct customer contact.
- **Order cancellation is not a feature.** Once confirmed (`PAID`), an
  order's only "reversal" path is the manual Refund flag — no `CANCELLED`
  transition is exposed anywhere in the admin UI.
- **Courier integration is not a feature.** Self-fulfilled shipping, manual
  tracking numbers only, no label generation, no courier status sync.
- **Self-collection pickup address lives as a hardcoded constant**, not a DB
  setting — explicitly scoped down from a proposed `StoreSettings`
  model + admin UI, judged as unnecessary complexity for a single
  rarely-changing value.
- **GST applies to the shipping fee.** `subtotal + shippingFee` is the
  taxable base, not `subtotal` alone.
- **Self-collection fee is $0 by default but config-driven**
  (`SELF_COLLECTION_FEE_SGD`), not hardcoded to zero — future-proofs a
  planned but not-yet-needed change (charging for self-collection later).
- **Order fulfillment status transitions are branched by fulfillment
  method** — self-collection orders skip `SHIPPED`/`DELIVERED` and go
  directly from `PACKED` to `COMPLETED`, since those two statuses describe a
  carrier-based delivery event that doesn't apply to in-person pickup.
- **Returns: admin approval flow dropped entirely** from ROADMAP.md — folded
  into the same manual refund process, not built as a separate feature.
- **Bulk actions deferred, not built** — genuinely not needed at current
  order volume; explicitly left open to revisit later rather than dropped
  outright (unlike Returns/courier, which were rejected on principle).

### Lessons Learned
- When a multi-stage feature evolves mid-build (self-collection went from
  "future, schema-only" to "build it now" within the same conversation), the
  status-machine and email-trigger logic needs to be revisited holistically,
  not just patched incrementally — the self-collection status-skip
  requirement wasn't obvious until self-collection actually existed as a
  real option, and required touching two files that must stay in sync
  (`status/route.ts` and `OrderStatusActions.tsx`).
- Hardened, multi-session-debugged files (email sending, checkout, address
  validation) are worth asking to see the actual current source before
  editing, even mid-session, rather than reconstructing them from
  documentation summaries — DATABASE_SCHEMA.md and API_REFERENCE.md
  describe *shape*, not exact working logic, and this project has hit real
  regressions before from editing such files blind.
- A claimed library/API "fact" pasted into chat (e.g. a `Show` component
  replacing `SignedIn`/`SignedOut` in Clerk) is worth verifying against live
  docs before accepting, even when it's phrased confidently as a diff
  summary — it turned out accurate here, but treating it as unverified until
  checked is the correct default regardless of outcome.
- Every new API route needs to actually exist as a file before it can work —
  sounds obvious, but a scoped-and-written route can still fail to make it
  into the admin's actual project during a copy-paste handoff, and the
  resulting error (generic "Failed to..." messages) doesn't obviously point
  at "the file is missing" as the cause.

### Outstanding Issues
- Bulk actions (mark packed, bulk export) — deferred, not scheduled
- Self-collection address requires a manual code edit + redeploy to change
- `expires_after: '5 mins'` accepted on assertion, not independently
  re-verified against HitPay's sandbox this session
- `app/layout.tsx` metadata still has unedited `create-next-app` scaffold
  defaults (title/description)
- All Phase 4 outstanding issues (Cron reconciliation, card payment testing,
  unverified `failed` webhook path, SSL warning) remain open, unchanged

### Recommended Next Task
See NEXT_TASK.md — Phase 6 (Search & AI Shopping Assistant) starting point,
or revisit deferred Bulk Actions if order volume has grown enough to warrant
it.

## Session 9

Date: 2026-07-15

### Objective
Fix a real production gap discovered in the field: orders stuck permanently
at `PENDING_PAYMENT` (holding stock hostage) when a customer abandons a
PayNow QR payment via the browser Back button, since that path never
triggers HitPay's `redirect_url` and therefore never reaches the lazy
reconciliation on `/checkout/success`. This required reversing a previously
deferred decision (automatic background reconciliation) and, as a
consequence, deploying the project to Vercel for the first time.

### Completed
- Root-caused the stuck-order issue: browser Back bypasses `redirect_url`
  entirely (it's a raw browser-history navigation, not a HitPay-initiated
  redirect), so `/checkout/success`'s lazy, page-load-triggered
  reconciliation never runs for that path. This was the exact risk accepted
  in the 2026-07-13 deferral decision, now confirmed as a real operational
  problem rather than a theoretical one.
- Extracted the reconciliation check from `app/checkout/success/page.tsx`
  into a shared `lib/reconcileOrder.ts` (`reconcileOrderIfStale`), so both
  the page-load path and the new scheduled path use identical logic
- New route: `app/api/cron/reconcile-orders/route.ts` — queries all
  `PENDING_PAYMENT` orders older than 6 minutes (5-minute HitPay expiry +
  buffer) with a `hitpayPaymentRequestId`, reconciles each via
  `reconcileOrderIfStale`, protected by a `CRON_SECRET` shared-secret check
  (header or query param) rather than Clerk auth, since the caller is an
  external scheduler with no Clerk session
- **Trigger mechanism decision:** chose a free external cron-ping service
  (cron-job.org) over GitHub Actions or Vercel Cron — least setup (no repo
  YAML, no paid tier), same underlying reconciliation logic regardless of
  which service calls the URL. Schedule set to every 5 minutes.
- **Reversed the 2026-07-13 deferral decision** — automatic background
  reconciliation is now live, not deferred. See DECISIONS.md.
- **Full production deployment to Vercel**, first time this project has had
  a working production deploy despite Vercel being connected since Session
  1. Root domain (`biggyballs69.gay`, already live on Cloudflare for
  Resend email) was considered but **deliberately not connected yet** —
  running on Vercel's default `*.vercel.app` URL for now, to unblock the
  cron fix without the added complexity of DNS propagation and Cloudflare
  proxy configuration in the same session
- **Environment strategy decided:** Vercel deployment currently uses the
  *same* values as local `.env` (same dev Clerk instance, same dev Neon
  database) — a deliberate "get it working" choice, not a mistake. Two
  separate Clerk webhook endpoints and two separate HitPay webhook
  endpoints now exist (one pointed at the local ngrok tunnel, one pointed
  at the Vercel URL), each with its own signing secret, kept in the
  respective environment's variables only — **local `.env` and Vercel's
  env vars are not meant to match on webhook secrets or `NEXT_PUBLIC_APP_URL`**,
  this was explicitly confirmed and is intentional, not a config drift bug
- End-to-end tested on the live Vercel URL: manually triggered the cron
  route via direct browser visit, confirmed `{"checked": 11, "succeeded":
  11, "failed": 0}` on the first real run against 11 pre-existing stuck
  orders — all flipped to `PAYMENT_FAILED` with stock restored
- Deliberately tested the abandon-and-expire path end-to-end on production:
  started a real checkout, abandoned it via Back button (not "Back to
  Merchant"), waited past the 6-minute threshold, manually triggered the
  cron route, confirmed the specific order reconciled correctly and the
  payment-failed email arrived

### Files Modified
- `lib/reconcileOrder.ts` — created (extracted from `checkout/success/page.tsx`)
- `app/checkout/success/page.tsx` — local `reconcileIfStale` function
  replaced with an import from `lib/reconcileOrder.ts`; now-unused
  `markOrderFailedAndRestoreStock` import removed
- `app/api/cron/reconcile-orders/route.ts` — created
- `.env` / `.env.example` (local) — `CRON_SECRET` added
- Vercel environment variables (production) — full set added, including
  separate `CLERK_WEBHOOK_SECRET`, `HITPAY_WEBHOOK_SALT`, and
  `NEXT_PUBLIC_APP_URL` values distinct from local `.env`

### Bugs Found
- N/A this session in the sense of new code bugs — the core issue was a
  pre-existing, previously-documented, deliberately-accepted gap
  (2026-07-13 deferral), not a regression introduced this session
- Deployment friction (not a code bug): initial cron-job.org test URL had a
  duplicated `https://https://` protocol typo, and a separate attempt to
  test against the ngrok tunnel directly hit `ERR_NGROK_6024` (ngrok's
  free-tier bot-warning interstitial page, which intercepts requests from
  non-browser clients like cron pingers before they reach the actual app)

### Bugs Fixed
- Both deployment-friction issues above resolved by correcting the URL typo
  and by moving off ngrok entirely in favor of the real Vercel URL, rather
  than working around the ngrok interstitial

### Technical Decisions
- **Automatic background reconciliation is no longer deferred — it's live.**
  See DECISIONS.md for the formal reversal of the 2026-07-13 entry.
- **Reconciliation trigger: external cron-ping service (cron-job.org),
  not GitHub Actions or Vercel Cron** — chosen for lowest setup overhead;
  the underlying route logic is trigger-agnostic, so switching services
  later requires no code change, only re-pointing the scheduler.
- **Sweep model, not per-order timers.** The cron route doesn't schedule
  anything per individual order — it's a single fixed-interval sweep that
  queries for *any* order matching the staleness criteria at the moment it
  runs, and reconciles all matches found in that pass.
- **Vercel deployment uses local-equivalent (dev) credentials for now.**
  Not a mistake — a deliberate choice to get a stable public URL working
  quickly for the cron fix, deferring the "real" production
  environment (prod Clerk instance, prod Neon branch, live HitPay keys) to
  Phase 9 (Launch) as originally scoped in ROADMAP.md. This means the
  Vercel deployment and local dev currently share the same underlying
  database — acceptable for now, worth revisiting before genuine customer
  traffic is expected.
- **Custom domain connection deliberately deferred**, not because of any
  blocker, but to keep this session focused on the reconciliation fix
  without also debugging DNS propagation and Cloudflare-proxy-vs-Vercel
  interactions in the same sitting.

### Lessons Learned
- A deferred-risk decision logged in `DECISIONS.md` is worth periodically
  re-checking against real usage, not just left as permanently accepted —
  the 2026-07-13 entry correctly identified the exact failure mode (browser
  back button bypassing `redirect_url`) as a *theoretical* risk at the time;
  it took real customer-like testing to confirm it as an *actual* recurring
  problem worth reversing the deferral for.
- Free tunneling services (ngrok) are fine for browser-driven manual testing
  but actively hostile to non-browser automated callers (cron pingers,
  webhooks from third parties) due to bot-protection interstitials — this
  is a structural reason production-facing automation needs a real
  deployment, not just "good enough for now" tunnel testing.
- When a project has two parallel environments (local + deployed) sharing
  some config but not other config (webhook secrets, app URL), it's worth
  being explicit and deliberate about exactly which variables are meant to
  diverge — otherwise it's easy to either break one environment by
  "syncing" secrets that shouldn't be synced, or to leave a variable
  un-updated by assuming it should match when it shouldn't.

### Outstanding Issues
- Custom domain (`biggyballs69.gay`) not yet connected to Vercel — running
  on the default `*.vercel.app` URL
- Vercel deployment shares the same dev Clerk instance and dev Neon
  database as local development — fine for now, needs revisiting before
  real customer traffic
- Successful payment path (checkout → PAID → confirmation email) not yet
  explicitly re-verified on the Vercel deployment specifically — only the
  failed/expired reconciliation path was tested end-to-end this session
- Not yet confirmed that every env var (`GST_RATE_PERCENT`,
  `SHIPPING_FEE_SGD`, `SELF_COLLECTION_FEE_SGD`,
  `NEXT_PUBLIC_CLERK_SIGN_IN_URL`, `NEXT_PUBLIC_CLERK_SIGN_UP_URL`) made it
  into Vercel's environment variables — only the ones directly involved in
  debugging (Clerk/HitPay webhook secrets, `NEXT_PUBLIC_APP_URL`) were
  explicitly confirmed
- Not yet confirmed both Clerk and both HitPay webhook endpoints
  (ngrok + Vercel) show as simultaneously active in their respective
  dashboards, rather than one having silently replaced the other
- Admin panel (`/admin/orders`) not yet explicitly re-tested on the Vercel
  URL
- Cron route's use of `Promise.allSettled` over all matched stale orders in
  one invocation could theoretically approach Vercel Hobby tier's 10-second
  serverless function timeout if the stale-order count grows large (e.g.
  after an extended period without reconciliation running) — not a problem
  at current volume (11 orders processed without issue), flagged for
  awareness only

### Recommended Next Task
Run through the outstanding-issues checklist above (successful payment path
on Vercel, env var completeness, dual webhook confirmation, admin panel
check) before considering this deployment fully verified. Then either
connect the custom domain, or proceed to the still-undecided Phase 6 vs.
Bulk Actions choice from NEXT_TASK.md.

---

## Session 10

Date: 2026-07-17

### Objective
Close out deployment verification from Session 9, then begin Phase 6.
Along the way: connect the custom domain (prompted by a real email
deliverability finding), fix a real production bug on the checkout-success
page, scope and build Phase 6's search bar (deliberately without Meilisearch
or the AI assistant), and — as a significant unplanned detour — build full
edit/delete/archive capability for all three core admin entities, none of
which had ever had it.

### Completed
- **Deployment verification checklist — closed.** Full successful payment
  path re-tested on the live Vercel URL through to `PAID` + confirmation
  email; env var completeness, dual webhook registration (Clerk + HitPay,
  ngrok + Vercel), and the admin panel were all confirmed working, per the
  admin's own direct testing.
- **Root-caused a mobile Gmail issue**, initially reported as "email buttons
  don't work on mobile" — confirmed via the admin viewing the email's raw
  source that the link itself was well-formed; further investigation
  revealed the real cause was Gmail's mobile app disabling link
  interactivity specifically for messages sitting in Spam (confirmed by the
  admin: works normally once moved to Inbox). Not a code bug.
- **Diagnosed a related, genuine deliverability issue** while investigating
  the above: transactional emails link to the `.vercel.app` deployment URL
  while sending from `orders@biggyballs69.gay` — a sending-domain/linked-
  domain mismatch that spam filters (Gmail included) treat as a real
  signal. This, plus general production hygiene, motivated connecting the
  custom domain this session rather than continuing to defer it.
- **Custom domain connected:** `biggyballs69.gay` added to Vercel (apex
  domain), one DNS-only `A` record added directly in Cloudflare (existing
  Resend email DNS records for the same domain left untouched), SSL
  auto-issued by Vercel. `NEXT_PUBLIC_APP_URL` updated to
  `https://biggyballs69.gay` and redeployed (build-time-baked var — a
  dashboard edit alone doesn't take effect without a rebuild, same lesson
  as Session 7's `localhost` bug).
- **Found and fixed a real production bug** on `/checkout/success`: a
  customer who scans the PayNow QR with a different device than the one
  used to check out (e.g. phone scans a laptop-displayed code) lands on
  this page with no Clerk session, since the page previously had no
  fallback for that case — result was a bare 404 immediately after a
  genuinely successful payment. Fixed by empirically confirming (the admin
  compared values directly in Prisma Studio) that the `reference` query
  param HitPay appends to its redirect matches `Order.hitpayPaymentRequestId`,
  then using that match as a lightweight, unguessable verification token:
  an unauthenticated visitor with a valid, matching `reference` now sees a
  genuine "Payment received!" message; anyone without one sees an
  identical generic "still processing" message, indistinguishable whether
  the order exists, is unpaid, or belongs to someone else. No order details
  are ever shown without full Clerk auth + ownership check, which remains
  completely unchanged. Deployed via `git push origin main`; a mid-deploy
  branch/merge situation (terminal closed during a `git pull`) was resolved
  safely — `git status` showed "All conflicts fixed but you are still
  merging," so only `git commit --no-edit` was needed to finish, no work
  lost.
- **Phase 6 scoped down deliberately, then built partially:** the AI
  Shopping Assistant was discussed at length — initially considered
  stuffing the full catalog into an LLM's context per-request, rejected
  (hallucination risk, cost/latency scaling, doesn't cover a plain search
  bar at all); the real alternative (tool-calling against a real product
  API, whether Meilisearch- or Prisma-backed) was identified but the whole
  AI assistant was deliberately deferred as its own increment, in favor of
  shipping the plain search bar alone first.
- **Meilisearch evaluated for the search bar and explicitly rejected**:
  after confirming typo tolerance is not a requirement for this store,
  Meilisearch's core value over plain Postgres search disappears, leaving
  only pure infrastructure overhead (a new external service — either a
  recurring hosted cost or, self-hosted, this project's first persistent
  server to run and maintain, a real departure from its otherwise fully
  managed/serverless stack). Decided to use Prisma's `contains`/
  `mode: insensitive` directly against Postgres instead.
- **Search built:** `/search` results page (plain GET `?q=`, same
  convention as category-page sort/filter); a shared `ProductCard`
  component extracted from the category page and `FeaturedProducts` once
  `/search` needed the same card a third time (accepts `headingLevel` and
  `showOutOfStockBadge` props to preserve each page's exact prior
  behavior); a debounced (300ms) live-suggestion dropdown
  (`SearchBar.tsx` in the Header + `/api/search/suggestions`, top 6
  results, later extended to show category + formatted price alongside
  image/name).
- **Bug found and fixed during search build:** `/api/search/suggestions`
  initially 404'd when called from the debounced fetch — root cause was
  the admin having placed the route file at the wrong path (not nested
  correctly under `search/suggestions/`), the same class of bug as the
  Session 8 tracking-route miss. Confirmed via a direct address-bar test
  bypassing the debounce/fetch logic entirely, which isolated the problem
  to routing rather than `SearchBar.tsx`'s logic.
- **Admin CRUD gap discovered and closed, in full — the majority of this
  session's work.** Prompted by a direct question about admin edit pages;
  checking ROADMAP.md and API_REFERENCE.md confirmed none of Categories,
  Products, or Product Types had ever had edit capability at any phase —
  all three were create-and-list only, with Prisma Studio as the only
  existing way to fix a mistake. Built in order of increasing risk:
  - **Categories:** `PUT`/`GET /api/admin/categories/[id]` + edit page,
    slug locked after creation (URL-stability reasoning, same class as the
    Product decision below). Found and fixed a pre-existing dead "Edit"
    link on the categories list page (pointed at a path with no matching
    route) while wiring the new edit page in — a bug that predated this
    session, just never previously exercised.
  - **Products:** `PUT`/`GET /api/admin/products/[id]` + edit page,
    including full variant editing (add/edit/remove price/stock/SKU/image
    per combination). `productTypeId` and `slug` both locked after
    creation. The create form's "Generate Combinations" button was
    changed from replace-the-whole-table to merge-only-new-rows for the
    edit context specifically, to avoid silently wiping out price/stock
    edits already made to existing variants.
  - **Product Types:** `PUT`/`GET /api/admin/product-types/[id]` + edit
    page. Explicitly scoped as the riskiest of the three before building,
    since editing field definitions can silently corrupt data on products
    already using them. `ProductField.key` and `.type` locked once a
    field exists (both disabled client-side AND re-derived server-side
    from the DB, never trusted from the client); removing a field is
    blocked server-side with a clear error if any product of that type
    still holds a non-empty value for it; a duplicate-key guard was also
    added across the final field set.
  - The admin independently found and fixed the same class of dead
    "Edit"-link bug on both the Products and Product Types list pages
    while wiring their respective edit pages in, without needing it
    pointed out this time.
- **Deletion discussion, which reframed the whole remaining scope:** the
  admin's actual initial need turned out to be one-time pre-launch test-
  data cleanup, not necessarily a permanent admin feature — redirected to
  Prisma Studio for that specific need (confirmed safe: `OrderItem` isn't a
  live FK, so no constraint blocks deleting test Products/Orders; the one
  real caution flagged was not deleting the admin's own `User` row). When
  the admin then confirmed they *do* want a permanent delete feature for
  ongoing use, the recommendation was revised: researched how Shopify
  actually handles this (rather than guessing) and confirmed they draw
  exactly the archive-vs-delete distinction this session ended up building
  — archiving hides a product from the storefront/inventory while fully
  preserving order history and staying reversible; hard deletion is a
  separate, much more restricted action Shopify itself guards heavily
  (blocking deletion of orders with processed payments entirely).
- **Products: archive system built** (not hard delete). Migration
  `add_product_archived` (`Product.archived Boolean @default(false)`);
  `PATCH /api/admin/products/[id]/archive` (single-purpose, toggles only
  the flag); `ProductActions.tsx` (archive/unarchive button with a
  `window.confirm` guard, following the `OrderStatusActions.tsx`
  precedent); the products list page shows an "Archived" badge. Every
  customer-facing product query updated to filter `archived: false`:
  `FeaturedProducts.tsx`, `category/[slug]/page.tsx`, `search/page.tsx`,
  `api/search/suggestions/route.ts`; `product/[slug]/page.tsx` now 404s an
  archived product's direct URL, same as an unknown slug. A gap was also
  found and closed in the same pass: `/api/checkout`'s atomic stock
  check-and-decrement didn't previously exclude archived products at all —
  an archived item sitting in a stale client-side cart would have still
  been purchasable; now correctly rejected via the same `409` path used
  for genuine out-of-stock items.
- **Categories: real hard delete built** (`DELETE
  /api/admin/categories/[id]` + `CategoryActions.tsx`) — no archive system
  needed, since nothing else structurally depends on a Category the way
  Products depend on ProductType, or the way order history depends on
  product identity.
- **Product Types: deliberately given no delete and no reassignment
  feature at all**, discussed at length and confirmed as a permanent
  decision, not a deferral. `Product.productTypeId` is required
  (non-nullable) with no cascade from `ProductType`, so safe deletion
  isn't structurally possible without first building a real product-type-
  reassignment feature (remapping `attributes` to a new field schema),
  which was judged not worth building for an expected rare, low-volume
  need. Documented workaround if ever needed: recreate the product under
  the correct type, or a careful manual Prisma Studio edit.
- **Debugged a stale-Prisma-client/runtime error during the archive
  migration** — a `PrismaClientValidationError` on `archived` persisted
  even after the standard `.next` cache clear + regenerate + restart
  sequence that has resolved this exact class of issue three times before
  in this project (Sessions 2, 5, 8); walked through verifying each link in
  the chain (schema file content, `prisma migrate status`, a fresh
  `prisma generate` run) rather than blindly repeating the same fix — root
  cause not fully narrated back, but confirmed resolved by the admin.
- Full end-of-session documentation pass: CURRENT_STATE.md, SESSION_LOG.md
  (this entry), DATABASE_SCHEMA.md, API_REFERENCE.md, ARCHITECTURE.md,
  DECISIONS.md, ROADMAP.md, and NEXT_TASK.md all updated to reflect
  everything above.

### Files Modified
- `app/checkout/success/page.tsx` — unauthenticated-visitor verification
  view added (`reference` param + `hitpayPaymentRequestId` match)
- `app/components/ProductCard.tsx` — created (shared card, extracted)
- `app/search/page.tsx` — created
- `app/components/homepage/FeaturedProducts.tsx` — refactored to use
  `ProductCard`; later filtered `archived: false`
- `app/category/[slug]/page.tsx` — refactored to use `ProductCard`; later
  filtered `archived: false` on its nested product include
- `app/components/Header.tsx` — `SearchBar` added
- `app/components/SearchBar.tsx` — created
- `app/api/search/suggestions/route.ts` — created (initially at a wrong
  path, corrected); later extended with category + formatted price
- `app/admin/categories/[id]/edit/page.tsx` — created
- `app/api/admin/categories/[id]/route.ts` — created (GET, PUT; DELETE
  added later in the same session)
- `app/admin/categories/page.tsx` — dead Edit link fixed; delete action +
  `CategoryActions.tsx` added later
- `app/admin/categories/CategoryActions.tsx` — created
- `app/admin/products/[id]/edit/page.tsx` — created
- `app/api/admin/products/[id]/route.ts` — created (GET, PUT)
- `app/admin/products/page.tsx` — dead Edit link fixed (by the admin);
  archive badge + `ProductActions` added later
- `app/admin/products/ProductActions.tsx` — created
- `app/api/admin/products/[id]/archive/route.ts` — created
- `app/admin/product-types/[id]/edit/page.tsx` — created
- `app/api/admin/product-types/[id]/route.ts` — created (GET, PUT)
- `app/admin/product-types/page.tsx` — dead Edit link fixed (by the admin)
- `app/product/[slug]/page.tsx` — 404s on `archived` products
- `app/api/checkout/route.ts` — atomic stock check now excludes archived
  products
- `prisma/schema.prisma` — `Product.archived Boolean @default(false)`
  added
- `app/generated/prisma/` — regenerated after the archive migration
- Vercel — custom domain added; `NEXT_PUBLIC_APP_URL` updated; redeployed
- Cloudflare — one DNS-only `A` record added for the apex domain

### Bugs Found
- Mobile Gmail app showing dead (non-interactive) buttons — root cause:
  Gmail's mobile app disables link taps specifically for messages in Spam;
  not a code bug, confirmed via direct device testing
- Transactional email links pointing at `.vercel.app` while sending from
  `orders@biggyballs69.gay` — a genuine sending/linked-domain mismatch,
  a real (if partial) contributor to spam-folder placement
- `/checkout/success` 404s for any unauthenticated visitor — real
  production bug, most commonly triggered by QR-scan-on-a-different-device
  payments; see Completed above for the fix
- `/api/search/suggestions` 404 — route file placed at the wrong path;
  admin's own mistake, caught via a direct address-bar test
- Pre-existing dead "Edit" links on the Categories, Products, and Product
  Types admin list pages — all three pointed at paths with no matching
  route, latent since whenever those list pages were first built (Session
  2/4), only surfaced now that edit pages actually exist to link to
- `PrismaClientValidationError: Unknown argument 'archived'` at runtime,
  persisting after the standard cache-clear/regenerate/restart sequence —
  required verifying schema file content, migration status, and a fresh
  `prisma generate` run individually rather than assuming the standard fix
  would work blindly a fourth time

### Bugs Fixed
- All of the above resolved within-session, confirmed via the admin's own
  direct testing in each case (checkout-success fix tested live in
  production on a real device split; search suggestions confirmed working
  after the path correction; dead Edit links confirmed fixed; archive
  migration confirmed working after the deeper verification pass)

### Technical Decisions
See DECISIONS.md (2026-07-17 entries) for full reasoning on each — summary
list: connect the custom domain now rather than continue deferring it;
verified-but-unauthenticated cosmetic confirmation view on
`/checkout/success`; defer the AI Shopping Assistant, ship search alone
first; skip Meilisearch entirely for search, use Prisma directly; add full
admin edit capability across all three core entities, outside the original
roadmap; lock `Category.slug`/`Product.slug` on edit; lock
`Product.productTypeId` on edit; lock `ProductField.key`/`.type` on edit
plus guard in-use field removal; Products use archive not hard delete
(Shopify-modeled); Categories use real hard delete; Product Types get no
delete or reassignment feature at all, by deliberate permanent decision.

### Lessons Learned
- A user-reported symptom ("buttons don't work on mobile") can have a
  completely different root cause than the first hypothesis (malformed
  link vs. spam-folder platform behavior vs. a genuine deliverability
  issue) — this session moved through all three before landing on the
  real, combined picture; asking "what exactly happens" and "can you check
  the raw source" early narrowed it faster than guessing at fixes.
  Prompted-but-unconfirmed information (raw email source unavailable on
  the mobile Gmail app specifically) needed a different verification path
  (long-press test, then direct confirmation) rather than stalling on the
  original ask.
- Real-world testing continues to surface gaps that pure code review
  wouldn't — the checkout-success 404 only appeared because a real
  multi-device QR payment was actually tested live, not simulated.
- When a person's stated request ("can I delete products") turns out to be
  motivated by a narrower, different underlying need ("I want to clear
  test data before launch"), it's worth surfacing the actual simplest tool
  for that specific need (Prisma Studio) rather than immediately building
  the more general feature implied by the literal request — but also worth
  explicitly checking whether the general feature is still wanted
  separately, rather than assuming the narrower need was the whole story.
- Researching how an established, high-scale platform (Shopify) actually
  handles an analogous problem (archive vs. delete) produced a
  meaningfully better-justified design than reasoning from first
  principles alone would have — worth doing before committing to a schema
  change, not just as a nice-to-have confirmation afterward.
- The same class of bug (a dead link pointing at a path with no matching
  route, first seen in Session 8's tracking-number route) recurred three
  times in a row across Categories/Products/Product Types this session —
  worth treating "does the Edit link on the list page actually match the
  new edit page's real path" as a standard checklist item any time a new
  admin edit page is added, rather than rediscovering it fresh each time.
- Locking a field outright (slug, productTypeId, ProductField key/type)
  is a more robust pattern than validating-after-the-fact whenever an
  incorrect edit's failure mode is silent data corruption rather than a
  loud, immediately-visible error — worth reaching for as a default in
  this category of situation, not just for the specific fields locked this
  session.

### Outstanding Issues
- AI Shopping Assistant — deliberately deferred, not started. Architecture
  direction decided (tool-calling against Prisma directly), nothing built.
- Storefront/admin styling still bare Tailwind — raised again this session
  as a real complaint ("ugly"), with meaningfully more surface area now
  accumulated since it was last noted. Worth weighing against continuing
  Phase 6 at the start of the next session — see NEXT_TASK.md.
- Product Type deletion/reassignment — permanently out of scope for now,
  by deliberate decision, not a bug or gap to revisit unless a real need
  for it emerges.
- Vercel deployment still on dev-equivalent credentials (Clerk dev
  instance, Neon dev branch) — unchanged, still explicitly Phase 9 scope.
- All Phase 4/5 outstanding issues not touched this session (card payment
  testing, unverified `failed` webhook path, SSL driver warning, unedited
  `layout.tsx` metadata, self-collection address as a hardcoded constant,
  deferred bulk actions) remain open, unchanged.

### Recommended Next Task
See NEXT_TASK.md. Decide at session start: resume Phase 6 by scoping the
AI Shopping Assistant, or shift to Phase 7 (theming) given the repeated UI
complaints this session and the amount of new unstyled surface area that's
accumulated since Phase 7 was last deferred.

## APPEND THIS TO THE END OF THE REAL SESSION_LOG.md — DO NOT REPLACE EXISTING ENTRIES

---

## Session 11

Date: 2026-07-22

### Objective
Complete the theming rollout begun at the end of Session 10 (Foundation
through the entire admin panel), then continue with whatever the admin
wanted next. Ended up covering: full site-wide re-theming against three
admin-supplied brand docs, a hero-animation direction that required
declining several sexualized-content requests, a font change to Geist, a
new Admin Dashboard Summary feature, Expense tracking, a bug fix to
self-collection email timing, CMS pages (Footer/FAQ/About/Contact), and a
full Promotion Codes system with conditional GST support.

### Completed

**Theming rollout (continued from Session 10):**
- Foundation: Tailwind v4 CSS-first token system in `globals.css`
  (`@theme inline`), initial Cormorant Garamond + Inter font pairing,
  `lib/cn.ts`, base primitives (`Button`, `Badge`, `Card`)
- Header/Nav: sticky, background blur, shrink-on-scroll, animated
  underline on nav links; `lucide-react` adopted (admin-confirmed new
  dependency) for icons, replacing a hand-rolled inline SVG
- `SearchBar.tsx` re-themed with tokens; clear button, loading spinner
  added
- Homepage: `HeroBanner`, `FeaturedProducts`, `CategoryGrid`, `Newsletter`,
  `ProductCard` all re-themed; `ScrollReveal.tsx` built (IntersectionObserver
  fade-up, respects `prefers-reduced-motion`, no new dependency) and applied
  across product/category grids
- Product & category pages: `ProductGallery.tsx`, `category/[slug]/page.tsx`,
  `BackButton.tsx` re-themed
- Cart & Checkout: `cart/page.tsx`, `checkout/page.tsx`,
  `checkout/CheckoutForm.tsx` re-themed; added visible (screen-reader)
  labels to previously placeholder-only address inputs — a real
  accessibility gap in the original, not just a style choice; added a
  "Secure checkout" trust line per DESIGN_SYSTEM.md's own Trust Builders
  section
- Full admin panel re-themed: `AdminLayout`/new `AdminNav.tsx` (Client
  Component, active-link highlighting via `usePathname()`), Dashboard,
  all five list pages (Products, Categories, Product Types, Orders,
  Expenses), all four form pairs (new/edit for each), Order detail page +
  `OrderStatusActions.tsx` + `TrackingNumberForm.tsx`

**Hero animation — extended back-and-forth, ending in a firm content
boundary:**
- Declined a "casino/VIP-nightlife, sexualized women" hero concept
  outright, including on reframing as "just erotica" and "tell me how to
  do it myself"
- Declined multiple uploaded anime-character image assets for the hero —
  two were sexualized (exposed/revealing outfits), a third (mecha-armed
  character) was off-brand but not itself declined for content reasons;
  flagged the pattern directly to the admin after the third unrelated
  character upload in a row
- Built and shipped: an abstract "foil card" placeholder
  (`HeroCardAccent.tsx`, currently unused on the live Hero but kept as a
  reusable component for future real artwork), an ambient drift-blob
  background, then — once the admin supplied his own fully-clothed fairy
  sprite asset — a CSS `steps()`-based sprite-sheet animation
  (`HeroAnimatedBackground.tsx`). Debugged: sprite frame-count math
  (confirmed correct via exact pixel measurement — 500×4642px, 11 frames ×
  422px each), a visible loop seam (root-caused as a content/authoring
  issue via direct frame-1-vs-frame-11 comparison, not a CSS bug; fixed
  with `animation-direction: alternate`), and a background-removal
  (chroma-key) test on the boxed source image before the admin confirmed
  he could re-export with real transparency instead
- Final hero direction (per admin's last instruction): text-only, no
  character asset live on the page currently — `HeroAnimatedBackground.tsx`
  and `HeroCardAccent.tsx` remain in the codebase as built components,
  unused

**Font change:**
- Compared two directions via the Visualizer (Option A: Geist for both
  headline+body, "true Apple style"; Option B: keep Cormorant Garamond
  headline + modernized sans body) — admin picked Option A. Switched
  `app/layout.tsx` and `globals.css`'s `@theme inline` block so both
  `font-display` and `font-sans` resolve to Geist; no per-component edits
  needed since every component already referenced the semantic tokens

**Admin Dashboard Summary (new feature, not on original roadmap):**
- Scoped via a three-question elicitation (cost-tracking depth, charts
  yes/no + dependency choice, which extra metrics)
- `app/admin/page.tsx` (Server Component, Prisma-direct) + new
  `app/admin/DashboardCharts.tsx` (Client Component)
- `recharts` adopted (admin-confirmed new dependency)
- Metrics: Total Revenue, Total Expenses, Profit, Avg Order Value, Paid
  Orders, Active Products, Out of Stock, Repeat Customer Rate; charts:
  Revenue Trend (12mo), New Customers (12mo), Delivery vs Self-Collection
  split, Top 5 Products by Revenue
- Popular Categories was scoped but deliberately **not built** — flagged
  that `OrderItem`'s deliberate snapshot-not-FK design (a correct,
  pre-existing decision, protecting historical order accuracy) means there
  is no reliable way to map historical line items back to *current*
  category assignments without silently misattributing past sales

**Expense tracking (new feature, not on original roadmap):**
- Scoped down from an initial "link costs to specific orders/products"
  idea to a deliberately flat, FK-free model per the admin's explicit
  request ("no need to add it into the DB" → clarified to mean no
  relational linkage, not literally no new table)
- `Expense` model: title/category(free text)/amount/incurredAt/notes
- Full CRUD at `/admin/expenses`; category field uses `<datalist>`
  suggestions rather than a fixed enum

**Bug found and fixed: self-collection "ready for pickup" email timing.**
Was firing on `PACKED → COMPLETED` (after the admin already recorded
pickup as done — backwards). Admin found and fixed the transition-map
entry in `status/route.ts` himself; confirmed end-to-end that the email
now correctly fires at `PROCESSING → PACKED`. Confirmed `OrderStatusActions.tsx`
had no stale copy referencing the old trigger point.

**CMS pages (Phase 7, partial):**
- Scoped via elicitation: T&C framing (draft-with-disclaimer vs.
  coming-soon placeholder — admin chose placeholder, then later removed
  the page entirely), footer scope (minimal vs. full UI_PATTERNS.md
  structure — admin initially wanted full, later simplified to minimal
  after building his own version)
- Admin uploaded a reference FAQ/T&C document; identified as another real
  business's actual customer-service copy (named "Newtro," referenced
  their own Telegram handle) — declined to reuse verbatim, both as an IP
  concern and because much of it (physical walk-in shop, grading service,
  international shipping, bulk/streamer pricing) doesn't reflect this
  store's actual operations. Confirmed via a follow-up elicitation which
  of those actually apply (answer: none, except an informal pre-order
  labeling convention)
- Built: `Footer.tsx`, `/faq` (real content grounded in facts already true
  of the site), `/about`, `/contact` — the latter two ultimately written
  and finalized directly by the admin, not drafted by Claude
- Admin explicitly removed Terms & Conditions, Shipping, Returns, and Help
  Center pages/links entirely rather than leaving them as placeholders —
  a deliberate scope-down, confirmed explicitly
- Found and fixed: a leftover `console.log(TELEGRAM_URL)` debug line in
  `app/faq/page.tsx`; a stale FAQ answer claiming the Telegram link was
  "in the site footer" after the admin's simplified footer removed that
  link — updated to point at the Contact page instead, where the real
  link now lives
- Recommended (and admin applied) swapping `<Link>` for plain `<a
  target="_blank" rel="noopener noreferrer">` on the Contact page's
  external Telegram/email links, per Next.js's own guidance for
  non-internal URLs

**Promotion Codes (new feature, full ROADMAP.md Phase 7 "coupon codes"
item):**
- Scoped via two rounds of elicitation covering discount type
  (percentage/fixed/both), usage limits, minimum order value, and — after
  the admin asked mid-scoping — whether GST could be conditionally
  disabled (admin is not currently GST-registered)
- Went through several rounds of schema-design back-and-forth on the
  used-code lifecycle: permanent deletion → `usedAt`/`usedByOrderId`
  marking → briefly back to permanent deletion → **settled on the
  original marking approach plus a new admin "Reactivate" action**, since
  the admin wanted the ability to reuse a code later
- Final design: `PromoCode` model (code/discountType/discountValue/
  minOrderValue/maxDiscountAmount/active/usedAt/usedByOrderId), burned at
  order-creation time regardless of payment outcome (deliberate admin
  choice, not the project's default instinct), whole-order-only scope, no
  redemption caps
- `Order.promoCode`/`Order.discountAmount` added as a historical snapshot,
  specifically because a reactivated-and-reused `PromoCode.usedByOrderId`
  is not a reliable pointer back to *every* order that ever used a given
  code — only the most recent one
- Discount computed via shared `lib/promoCode.ts` → `computeDiscountAmount()`,
  used identically by a new preview-only endpoint
  (`/api/checkout/apply-promo`) and the real order-creation transaction in
  `/api/checkout`, so the two can never show the customer a different
  number than what they're actually charged
- Discount applied to `subtotal` before GST calculation (admin's own
  minimal-change request for the GST toggle was honored — `GST_ENABLED`/
  `GST_RATE_DISPLAY` added to `lib/gst.ts`, every GST-displaying surface
  made conditional)
- Discount logged as an auto-generated `Expense` (`isSystemGenerated: true`,
  new field added specifically for this) only once an order reaches
  `PAID` — via new `lib/recordDiscountExpense.ts`, called from both the
  HitPay webhook's `completed` handler and `lib/reconcileOrder.ts`'s stale
  sweep, matching the existing dual-call-site pattern already used for
  `sendOrderConfirmationEmail`/`markOrderFailedAndRestoreStock`
- Full admin CRUD at `/admin/promo-codes`, including the new Reactivate
  action (independent of the pre-existing Active/Inactive toggle)
- Two new dashboard metrics added: Total Discounts Given, Discount Codes
  Used, both driven by the `isSystemGenerated` Expense flag rather than a
  fragile category-string match
- Admin tested the full flow end-to-end and confirmed it works

### Files Modified
Extremely broad — effectively every storefront and admin-facing
`.tsx`/`.ts` file in the project touched at least once for theming, plus
all new files listed under Completed above. See CURRENT_STATE.md and
ARCHITECTURE.md for the current full file map; not reproduced exhaustively
here given the volume.

### Bugs Found
- Tailwind width-utility collision on the Products new/edit forms' shared
  `inputClass` constant (baked-in `w-full` fighting `w-1/3`/`flex-1` on
  specific fields) — root-caused via CSS-order reasoning, not guessed at
- Products new/create page missing a per-row variant-delete control that
  the edit page already had — parity gap, caught by the admin directly
- Self-collection ready-for-collection email firing on the wrong status
  transition (see above) — caught and fixed by the admin
- Stale `console.log(TELEGRAM_URL)` debug line left in `app/faq/page.tsx`
- Stale FAQ copy referencing a footer Telegram link that no longer existed
  after the footer was simplified
- Debug `console.log`s of raw webhook payload/signature data in the
  invalid-signature branch of `app/api/webhooks/hitpay/route.ts`, removed
  while extending that file for the discount-expense trigger

### Bugs Fixed
All of the above resolved within-session, confirmed via the admin's own
direct testing in each case.

### Technical Decisions
See DECISIONS.md (2026-07-22 entries) for full reasoning — summary list:
adopt Tailwind v4 CSS-first tokens against admin-supplied brand docs;
switch fonts to Geist site-wide; adopt `lucide-react` and `recharts` as
the only two new dependencies this session; decline all sexualized
hero-content requests as a firm, non-negotiable boundary regardless of
reframing; build Expense as a deliberately flat, FK-free model; fix the
self-collection email transition point; decline to reuse an uploaded
reference FAQ document verbatim (different real business's content, and
factually inapplicable to this store's actual operations); scope
Promotion Codes narrowly (whole-order, no redemption caps, admin
discretion) rather than as a general marketing-coupon system; burn promo
codes at order-creation regardless of payment outcome, with reactivation
as the mitigation; apply discount before GST; make GST fully conditional
via `GST_ENABLED`; log discount-as-expense only at `PAID`, via a new
`isSystemGenerated` flag rather than a string-category match.

### Lessons Learned
- A brand/design document set handed over mid-project (VISION.md,
  DESIGN_SYSTEM.md, UI_PATTERNS.md) is worth treating as an authoritative
  spec, not a vibe — repeatedly citing specific lines from these docs (the
  anti-patterns list, the Trust Builders section, the empty-state copy
  example) produced better-grounded decisions than guessing at "what feels
  premium," and caught real conflicts (the casino hero concept, the
  Cinzel-vs-Cormorant font choice) that would have been easy to miss
  without the doc to check against.
- When an admin uploads a reference asset or document "for context,"
  verify it's actually theirs / actually applicable before treating it as
  ground truth — this session hit that exact trap twice (the Newtro FAQ
  document, several character-art uploads) and in both cases a direct,
  concrete check (naming what didn't match, or declining outright)
  produced a better outcome than silently adapting the material.
- A content-safety boundary, once established and explained clearly, is
  worth holding firm on repeat attempts rather than re-litigating the
  reasoning each time — reframing ("just erotica," "tell me how to do it
  myself," a new uploaded character) doesn't change the underlying
  request, and repeating the same firm, brief decline each time was more
  effective than re-explaining at length.
- Scoping conversations (Expenses, Promotions, Dashboard metrics) that use
  short, concrete elicitation questions before writing code caught several
  decisions that would have been expensive to redo later (the
  used-code-lifecycle back-and-forth on Promotions is the clearest
  example — better to have that conversation three times before code than
  once after).
- A shared CSS class constant that bakes in a layout property (width) is
  a real footgun the moment it's reused in a variable-width context — this
  is a generalizable lesson for any future shared style constant in this
  project, not just the one instance that surfaced this session.

### Outstanding Issues
- Dark mode toggle — not started, next up per the admin's own list
- Newsletter wiring — not started, next up per the admin's own list
- `ComingSoonPage.tsx` may now be dead code — not confirmed/cleaned up
- The Lemon Law question on "all sales final" wording — flagged, not
  resolved, not legal advice
- Phase 6 (AI Assistant) vs. deeper Phase 7 (Homepage Builder, real
  admin-editable Theme Builder, flash sales, bundle pricing) — still an
  open standing decision, unchanged in kind since Session 10
- Every image on the site is still a plain `<img>` tag, not `next/image` —
  flagged as newly-relevant Phase 8 scope given how many image-rendering
  components this session touched without converting them
- All Phase 4/5/8/9 outstanding issues from prior sessions remain open,
  unchanged

### Recommended Next Task
See NEXT_TASK.md — dark mode toggle, then newsletter wiring, both
explicitly named by the admin as wanted before this session's list is
considered closed. Decide the Phase 6 vs. deeper-Phase-7 question only
after those two are done.

---

## Session 12

Date: 2026-07-22

### Objective
Design and implement dark mode after choosing a direction visually.

### Completed
- Compared Collector Midnight, Gallery Charcoal, and auto-invert approaches
  in an interactive mockup, including toggle placement and persistence.
- Admin selected Collector Midnight, the header icon, and OS-default plus a
  remembered manual override.
- Added a complete dark token set for brand, surfaces, text, borders,
  semantic colors, and shadows in `app/globals.css`.
- Added `ThemeToggle.tsx` using the existing Lucide icon dependency and a
  44px accessible header control.
- Added synchronous root-layout initialization based on `localStorage` or
  `prefers-color-scheme`, applying `data-theme` before first paint.
- Added live OS-theme tracking while the shopper has not set an override.
- No new dependency or schema/API change.

### Verification
- Targeted lint passed for the new root-layout and theme-toggle code.
- Production build passed: compilation, TypeScript, page data, and all 36
  static pages completed successfully.
- Full lint remains blocked by a pre-existing
  `react-hooks/set-state-in-effect` error at `app/components/Header.tsx:18`
  (`setHasMounted(true)`), unrelated to dark mode.

### Recommended Next Task
Decide and implement newsletter signup wiring as scoped in `NEXT_TASK.md`.

## Session 13

Date: 2026-07-23

### Objective
Correct customer-facing order price breakdowns after promotion and
conditional-GST support were added.

### Completed
- Added the stored promotion code and discount amount to the customer order
  detail breakdown.
- Made the customer order detail GST row conditional on `GST_ENABLED`.
- Corrected checkout success to include discount and shipping/self-collection
  rows and to hide GST when disabled.
- Corrected the order confirmation email to include discount and
  shipping/self-collection, use the configured GST rate, and hide GST when
  disabled instead of hardcoding 9%.
- Audited checkout and admin order detail; both were already correct.
- No schema, API, or order-calculation changes were required.

### Verification
- Targeted ESLint passed for all four changed code files.
- Production build passed, including TypeScript and all 36 static pages.

### Recommended Next Task
Decide and implement newsletter signup wiring as scoped in `NEXT_TASK.md`.

---

## Session 14

Date: 2026-07-23

### Objective
Connect the homepage newsletter feature using single opt-in.

### Completed
- Verified Resend's current Contacts/Topics capabilities; the configured API
  key reached Resend but was confirmed to be send-only.
- Considered public Resend Contacts and a separate subscriber table, then
  implemented the admin-approved account-only alternative.
- Added `newsletterSubscribed`, `newsletterSubscribedAt`, and
  `newsletterUnsubscribedAt` to `User`.
- Created and applied Neon migration
  `20260722175234_add_newsletter_subscription` and regenerated the committed
  Prisma client.
- Added authenticated `GET`, `POST`, and `DELETE /api/newsletter` operations.
- Rebuilt the homepage newsletter component with loading, error,
  subscribe/unsubscribe, and signed-out redirect states. The API derives the
  account from Clerk and never accepts a client-supplied email address.
- Added an `accent-foreground` design token and updated the shared accent
  button variant for correct text contrast. Added an `inverse` button variant
  for the newsletter CTA so its surface also contrasts with the section in
  both light and dark modes.
- No new dependency was added. Newsletter broadcast composition and sending
  remain separate future work.

### Verification
- Prisma schema validation passed.
- Targeted ESLint passed.
- Standalone TypeScript checking passed.
- Production build passed, including all 37 static pages and the new
  `/api/newsletter` route.

### Recommended Next Task
Explicitly choose between Phase 6's AI Assistant and deeper Phase 7 work
(Homepage Builder, admin-editable Theme Builder, flash sales, bundle pricing).

---

## Session 15

Date: 2026-07-23

### Objective
Start Phase 8 with a storefront image audit, choose a zero-separate-cost
storage strategy, and migrate the first product-image slice.

### Completed
- Audited all eight plain `<img>` elements across seven active storefront
  components plus the unused `HeroCardAccent` component.
- Chose repository-owned static catalog images under `public/images` instead
  of managed storage because the current database is disposable and the admin
  does not want a separate storage bill.
- Established product, variant, category, hero, and placeholder directories.
- Added shared `ProductImage.tsx`: local root-relative paths use Next.js
  `Image`; current remote test URLs use one isolated temporary fallback.
- Migrated product cards, product detail, search suggestions, and cart
  thumbnails to the shared renderer.
- Standardized product imagery around a 1000x1400 source and 5:7 display ratio
  with `object-contain`, consistent padding, and responsive `sizes`, avoiding
  cropped trading-card edges.
- Replaced the new-product form's free-form image URLs with filenames. The
  required main image and every entered optional variant image now have a
  Verify control that checks the real static path and response content type;
  changing a filename invalidates its previous verification.
- Disabled Create Product until all required image checks pass, transformed
  verified filenames into their root-relative catalog paths at submission,
  and added POST validation that rejects paths outside the product/variant
  static folders.

### Verification
- Targeted ESLint passed for `ProductImage`, `ProductCard`, `ProductGallery`,
  and cart.
- Standalone TypeScript checking passed.
- Production build passed with Next.js 16.2.9's webpack builder, including
  compilation, TypeScript, and generation of all 37 static pages. The default
  Turbopack build could not run inside the workspace sandbox because Next
  inferred a parent-directory lockfile as its workspace root.
- Full targeted lint including `SearchBar` remains blocked by its pre-existing
  `react-hooks/set-state-in-effect` error at line 31; the image change did not
  introduce that code.

### Recommended Next Task
Update product/variant admin inputs and API validation to accept only local
catalog paths, then migrate category and hero image surfaces. Remove the
temporary remote fallback after the planned database reset.

---

## Session 16

Date: 2026-07-23

### Objective
Correct the first image slice's awkward 5:7 scaling using the admin-selected
Newtro TCG storefront as a structural reference.

### Completed
- Inspected the live reference storefront and measured its rendered image
  geometry rather than approximating from screenshots.
- Confirmed category icons use 1024x1024 source art inside fixed 3:2 tiles
  with `object-cover`.
- Confirmed a live product uses a square 700x700 source inside a square
  592x592 product-detail canvas.
- Replaced the project's 5:7 product-card and product-detail containers with
  square containers using `object-contain`.
- Renamed shared `ProductImage` to `CatalogImage`, added explicit
  contain/cover modes, and migrated the homepage CategoryGrid through it.
- Standardized the production guidance at 1000x1000 for product/variant
  canvases and 1024x1024 for category icon artwork.

### Verification
- Targeted ESLint passed for `CatalogImage`, `ProductCard`, `CategoryGrid`,
  cart, and `ProductGallery`; standalone TypeScript checking passed.
- Production build passed with all 37 static pages.
- Local browser measurement confirmed product media renders at an exact 1:1
  ratio and homepage category media at an exact 3:2 ratio with real database
  content.

### Recommended Next Task
Apply filename verification to Product Edit, then add filename verification
and local-path enforcement to category create/edit before the real catalog is
loaded.

---

## Session 17

Date: 2026-07-23

### Objective
Bring Product Edit to parity with the verified local-image workflow already
used by Product Create.

### Completed
- Added filename extraction for valid stored product/variant paths.
- Added main and per-variant Verify controls with the same filename and real
  static-response checks as Product Create.
- Required a freshly verified main image and every entered optional variant
  image before Save Changes is enabled.
- Flagged legacy remote main images for replacement. Legacy remote variant
  images must be replaced or explicitly removed, avoiding silent data loss.
- Updated the product PUT route to reject non-local main/variant image paths.
- Moved shared path-to-filename and file-verification behavior into
  `lib/catalogImages.ts` so Create and Edit cannot drift.

### Verification
- Targeted ESLint passed with only the files' established explicit-any and
  effect-state rules excluded; standalone TypeScript checking passed.
- Production build passed with all 37 static pages.

### Recommended Next Task
Add the same filename verification and local-path enforcement to Category
Create/Edit, then resolve the category-detail banner separately.

---

## Session 18

Date: 2026-07-23

### Objective
Complete the admin-managed catalog image workflow for categories.

### Completed
- Replaced free-form category banner URLs in Create/Edit with required image
  filenames under `public/images/categories`.
- Added real-file Verify controls using the shared filename/path/HEAD-response
  checks; changing a filename invalidates verification.
- Converted valid stored category paths back to filenames on Edit and flagged
  legacy remote images for replacement.
- Disabled Create/Save until the category image verifies.
- Added category POST/PUT validation rejecting remote or incorrectly located
  paths.
- Removed the full-width category-detail banner. The legacy
  `bannerImageUrl` field now supplies only the square-source homepage category
  icon shown inside the standardized 3:2 tile.

### Verification
- Targeted ESLint and standalone TypeScript checking passed.
- Production build passed with all 37 static pages.

### Recommended Next Task
Convert the local reduced-motion hero fallback to Next.js Image. After the
database reset, remove `CatalogImage`'s temporary remote compatibility branch.

---

## Session 19

Date: 2026-07-23

### Objective
Finish the active hero image migration without changing the normal animated
experience.

### Completed
- Kept the current `test7.webm` and `test7.mp4` video sources unchanged.
- Converted the static hero poster from a plain `<img>` to Next.js `Image`
  with `fill`, responsive sizing, and `object-cover`.
- Restored the missing `.hero-video-clip` class on the video.
- Corrected CSS ordering so `prefers-reduced-motion: reduce` actually hides
  the autoplaying video and shows only the static poster.
- Layered video and poster in the same absolute frame.
- Removed obsolete commented markup, abandoned video-source snippets, unused
  hero sizing variables, and dead CSS.

### Verification
- Targeted ESLint, standalone TypeScript checking, and whitespace validation
  passed.
- Production build passed with all 37 static pages.

### Recommended Next Task
Move to Product/BreadcrumbList structured data. Remove the remote catalog-image
compatibility branch only after the planned database reset.

---

## Session 20

Date: 2026-07-23

### Objective
Add schema.org Product and BreadcrumbList structured data to the storefront.

### Completed
- Added a shared structured-data helper that normalizes
  `NEXT_PUBLIC_APP_URL`, resolves relative catalog paths into absolute URLs,
  and safely serializes JSON-LD by escaping `<`.
- Added `Product` JSON-LD to product detail pages with name, description,
  canonical product URL, deduplicated product/variant images, and one SGD
  `Offer` per variant.
- Included variant SKUs when present and derived `InStock`/`OutOfStock`
  availability from each variant's live stock.
- Added `BreadcrumbList` JSON-LD to product and category detail pages.
  Product breadcrumbs use the first assigned category in deterministic
  alphabetical order and fall back cleanly when a product has no category.
- Followed the bundled Next.js 16 JSON-LD guidance: native script tags,
  server-rendered payloads, and escaped admin-managed content.
- No database change or new dependency was required.

### Verification
- Targeted ESLint passed for both route pages and the shared helper.
- The production build passed compilation, TypeScript checking, page-data
  collection, and generation of all 37 static pages.
- Repository-wide ESLint still reports 48 pre-existing errors in unrelated
  admin, component, webhook, contact, and email-template files; this slice
  introduced none of them.

### Recommended Next Task
Generate the XML sitemap and add canonical metadata using the same public URL
normalization, then add OpenGraph and Twitter Card metadata.

---

## Session 21

Date: 2026-07-23

### Objective
Fix the populated-cart indicator's dark-mode contrast and overlapping layout.

### Completed
- Replaced the absolutely positioned count bubble and negative offsets with
  an inline badge inside a compact, 44px-minimum cart pill.
- Added a subtle accent border and tinted surface only while the cart contains
  items, keeping the populated state distinct without obscuring the icon or
  label.
- Changed the count to `text-accent-foreground` on `bg-accent`, providing
  deliberate contrast in both the light and Collector Midnight palettes.
- Added a singular/plural accessible label such as "Cart, 1 item" while
  hiding the decorative visible count from duplicate screen-reader output.
- No global token, dependency, API, or data change was required.

### Verification
- Targeted ESLint passed for `Header.tsx` with its pre-existing
  `react-hooks/set-state-in-effect` rule excluded.
- Production build passed compilation, TypeScript checking, page-data
  collection, and generation of all 37 static pages.
- Visually verified populated cart layout and contrast in light and dark mode.

### Recommended Next Task
Continue Phase 8 with XML sitemap and canonical metadata.

---

## Session 22

Date: 2026-07-23

### Objective
Fix selected product-variant contrast in Collector Midnight dark mode.

### Completed
- Replaced the selected chip's light-accent background and primary text with
  a solid accent background and the dedicated `accent-foreground` text token.
- Added the existing input shadow to reinforce the selected state without
  changing the unselected variants.
- Added `aria-pressed` so assistive technology can identify the selected
  option.
- No global token, dependency, API, or data change was required.

### Verification
- Targeted ESLint passed for `ProductGallery.tsx`.
- Production build passed compilation, TypeScript checking, page-data
  collection, and generation of all 37 static pages.
- Visually verified selected and unselected variant states in light and dark
  mode, including state changes between options.

### Recommended Next Task
Continue Phase 8 with XML sitemap and canonical metadata.

---

## Session 23

Date: 2026-07-28

### Objective
Begin the premium TCG storefront redesign with reviewable milestone gates,
starting with the customer shell and homepage without changing the catalogue
schema or admin workflow.

### Completed
- Established a four-milestone redesign roadmap with an explicit admin review
  gate after storefront identity, catalogue hierarchy, and commerce
  merchandising.
- Rebuilt the customer header with a store-assurance bar, stronger brand mark,
  primary shopping navigation, responsive search placement, compact account
  and cart actions, preserved cart-count contrast, and a mobile menu.
- Replaced the full-viewport video-led homepage hero with a shorter
  catalogue-driven editorial hero. The newest three categories supply its
  imagery and links; the section provides clear featured/all-collection calls
  to action and a visible Product Line / Era / Set browsing direction.
- Added a trust strip, asymmetric collection cards with live product counts,
  a large featured-arrival spotlight, supporting product cards with
  availability/format metadata, and a collector-promise section.
- Upgraded the authenticated newsletter callout and replaced the minimal footer
  with a multi-column brand, shop, help, and company footer.
- Added stable `ink`, `ink-muted`, `on-ink`, and `on-ink-muted` tokens so
  premium dark panels keep the same semantic role in light and Collector
  Midnight themes.
- Refactored `Header` hydration detection and the `SearchBar`/`ScrollReveal`
  effects to satisfy the current React lint rules without changing behaviour.
- No database schema, migration, API contract, admin form, customer route, or
  dependency changed.

### Verification
- Targeted ESLint passed for every changed customer component.
- `tsc --noEmit` passed.
- Prisma Client generation passed.
- Production build passed compilation, TypeScript, page-data collection, and
  generation of all 37 static pages.
- Browser checks passed for the desktop light storefront and responsive mobile
  light/dark hero/header presentation. The existing disposable test database
  still supplies unrelated names/images (cups, laptops, bottles), so content
  quality is intentionally deferred to the hierarchy/content milestone.
- Repository-wide ESLint still reports pre-existing errors in unrelated admin,
  webhook, contact, and email-template files; this milestone introduced none.
- Build warnings remain for the pre-existing multiple-lockfile workspace-root
  inference, deprecated `middleware` convention, and PostgreSQL SSL-mode
  compatibility notice.

### Review Checkpoint
Admin should review:
- opening-viewport scale, hero copy, and calls to action;
- header density and mobile navigation;
- collection-card hierarchy and product density;
- the featured product spotlight versus supporting cards;
- light/Collector Midnight colour balance and trust messaging.

### Recommended Next Task
Apply Milestone 1 visual feedback. Once approved, implement Milestone 2:
typed/ordered parent-child categories, Product Line -> Era -> Set routes,
supporting admin controls, and the real TCG content reset/import plan.

---

## Session 24

Date: 2026-07-28

### Objective
Apply the first Milestone 1 visual feedback with a brand-specific animated
landing, replace generic homepage copy, and add admin-controlled newsletter
composition with deliberate manual broadcasting.

### Completed
- Added the admin-supplied PokeSunshine artwork as a repository-owned brand
  asset and reused it in the homepage landing, header, and footer.
- Replaced the category-led hero with a responsive PokeSunshineTCG wordmark
  landing using “You are my sunshine.”, a one-time sun/logo reveal, and
  reduced-motion fallback.
- Wired “Shop featured products” to New arrivals and “Explore TCGs” to Shop
  by TCG.
- Removed the homepage trust strip, uppercase eyebrow labels, numbered promise
  cards, and generic supporting paragraphs. The homepage now uses the
  admin-approved headings, newsletter wording, and three factual promises.
- Left the admin-written About page completely unchanged.
- Added `NewsletterPost` and `NewsletterDelivery` with explicit draft/send
  lifecycle and per-recipient delivery history.
- Added `/admin/newsletters` list, create/edit forms, live email preview,
  optional image path/URL, current subscriber count, deletion for drafts, and
  an explicit confirmed Broadcast/Retry action.
- Reused Resend and React Email. Broadcasts re-check current opt-in, assign a
  stable idempotency key per recipient, skip unsubscribed customers, and do
  not intentionally resend successful recipients during retry.
- Moved the theme initialization into a static before-interactive script to
  comply with the current Next.js script handling.
- Applied migration `20260728133000_add_newsletter_posts` to Neon and
  regenerated the committed Prisma client.
- No real newsletter was broadcast during implementation or testing.

### Verification
- Prisma schema validation passed.
- Targeted ESLint passed for all changed customer, admin, API, and email files.
- `tsc --noEmit` passed.
- Production build passed compilation, TypeScript, page-data collection, and
  generation of all 40 static pages.
- Browser checks passed for the animated landing on desktop/mobile and
  light/Collector Midnight themes.
- Browser checks passed for the empty newsletter admin state and the live
  editor preview. Draft persistence was not exercised against production data,
  and the external Broadcast action was intentionally not triggered.
- Existing warnings remain for multiple-lockfile workspace-root inference,
  deprecated `middleware`, and PostgreSQL SSL-mode compatibility.

### Review Checkpoint
Admin should review the new landing scale/motion and the newsletter editor.
If approved, proceed to Milestone 2 catalogue hierarchy. A drag-and-drop
newsletter image upload remains gated on a persistent storage decision.

---

## Session 25

Date: 2026-07-29

### Objective
Implement the five admin-approved storefront refinement milestones with a
verification gate after each milestone.

### Milestone 1 — Catalogue Index Routes and Navigation
- Added `/categories` as the complete category index with standardized cards,
  live non-archived product counts, route metadata, and BreadcrumbList JSON-LD.
- Added `/products` as the complete product catalogue with category,
  availability, and sort controls; URL-persisted filters; result counts; and
  24-product pagination.
- Extracted shared catalogue sort parsing and shared filter UI, then reused it
  on the existing category detail page.
- Updated Shop TCG and Explore TCGs to `/categories`; updated Browse all
  collections to Browse all products at `/products`.

### Milestone 1 Verification
- Targeted ESLint passed.
- `tsc --noEmit` passed.
- Production build passed and generated both new routes.
- Live HTTP checks returned 200 for `/categories` and filtered `/products`,
  including expected headings, filter controls, and BreadcrumbList JSON-LD.
- In-app visual QA could not run because the browser refused localhost
  navigation after an earlier connection-error page. This remains a manual
  review item; no attempt was made to bypass the browser restriction.

### Milestone 2 — Standardized Categories Carousel
- Renamed the homepage section to Categories.
- Replaced the asymmetric category mosaic with equal 4:3 cards in a
  dependency-free scroll-snap carousel.
- The viewport shows at most three cards on desktop, two on tablet, and one on
  mobile, with previous/next controls, touch scrolling, keyboard arrow
  navigation, responsive control state, and reduced-motion-safe scrolling.
- Added View all categories links to the new `/categories` route.

### Milestone 2 Verification
- Targeted ESLint and `tsc --noEmit` passed.
- Production build passed and generated all 42 static pages.
- Browser visual review remains part of the same localhost-policy limitation
  recorded under Milestone 1.

### Milestone 3 — Standardized New Arrivals
- Removed the oversized spotlight composition and now query at most eight
  newest non-archived products.
- Every arrival uses the same shared ProductCard in a responsive two-, three-,
  or four-column grid; desktop presents up to four columns by two rows.
- Reserved a consistent two-line title area so short and long product names do
  not create uneven card bottoms.

### Milestone 3 Verification
- Targeted ESLint and `tsc --noEmit` passed.
- Production build passed and generated all 42 static pages.

### Milestone 4 — Separate Email Senders
- Added `RESEND_ORDER_FROM_EMAIL` and `RESEND_NEWSLETTER_FROM_EMAIL`.
- Order lifecycle messages now use the order sender and manual newsletter
  broadcasts use the newsletter sender.
- Retained `RESEND_FROM_EMAIL` as a backward-compatible deployment fallback.
- Updated local configuration and architecture documentation. Production must
  receive both new variables and be redeployed before the sender split is live
  there.
- No real email was sent during verification.

### Milestone 4 Verification
- Targeted ESLint and `tsc --noEmit` passed.
- Production build passed and generated all 42 static pages.

### Milestone 5 — Brand Motion
- Added a slow local ray rotation, breathing orbit, three restrained sparkles,
  periodic sheen, and slight floating motion around the existing raster logo
  without modifying or distorting the artwork.
- The animation pauses when the hero artwork leaves the viewport.
- Added a small user-triggered scale/tilt/gleam response to the header logo.
- Every new animation has a static `prefers-reduced-motion` presentation.

### Milestone 5 and Final Verification
- Targeted ESLint passed for every file changed by these five milestones.
- `tsc --noEmit` passed.
- Final production build passed compilation, TypeScript, page-data collection,
  and generation of all 42 static pages.
- Whole-repository ESLint was also run. It still reports 44 errors and one
  warning in pre-existing admin forms/actions, product-type/product API
  handlers, the Clerk webhook, Contact copy, the payment-failed email template,
  and the theme initializer. None are in files introduced or materially
  changed by these milestones; they remain separate cleanup work.
- Existing build warnings remain for multiple-lockfile root inference,
  deprecated `middleware`, and PostgreSQL SSL-mode compatibility.
- No real email was sent and no production environment was changed.

### Review Checkpoint
Admin should now review `/`, `/categories`, `/products`, carousel interaction,
the equal New arrivals grid, and logo motion across desktop/mobile and
light/Collector Midnight. After approval, begin the documented Product Line ->
Era -> Set hierarchy milestone.

### Follow-up Review Adjustments
- Added the shared Back control to `/categories` and `/products`.
- Removed Why us from the header and Collector promise from the footer.
- Removed the three-promise section from the homepage, deleted its now-unused
  component, and removed its orphaned styling.
- Targeted ESLint and `tsc --noEmit` passed.
- Production build passed compilation, TypeScript, and generation of all 42
  static pages. Existing build warnings are unchanged.

---

## Session 26

Date: 2026-07-29

### Objective
Implement and self-review premium category and product merchandising while
preserving the admin-approved Category -> Product/Set -> Variant/Format model.

### Catalogue Model Decision
- Cancelled the proposed Product Line -> Era -> Set hierarchy and associated
  migration, nested routes, and admin fields.
- Categories remain top-level TCG lines; each product remains one set; its
  purchasable formats remain variants.
- Confirmed that the existing variant combination editor preserves existing
  priced rows and only adds missing combinations when a format is added.

### Milestone 3 Implementation
- Added an image-led category hero with set, format, and availability totals.
- Added name search to category detail and all-products filters while retaining
  URL-based sorting and stock filtering.
- Added category result counts and explicit set/format catalogue guidance.
- Rebuilt the product gallery around the main image plus unique variant images;
  selecting a variant thumbnail also selects its matching format.
- Default product selection now prefers an in-stock variant.
- Consolidated price, SKU, format choices, sold-out state, availability,
  quantity controls, and add-to-cart feedback into one purchase panel.
- Added structured product details and up to four related products from the
  product's deterministic primary category.
- No schema, migration, API, admin, dependency, or About-page change was made.

### Verification
- Targeted ESLint passed for all five changed application files.
- `tsc --noEmit` passed.
- The Next.js production build passed compilation, TypeScript checking, page
  data collection, and generation of all 42 pages.
- Browser review passed on desktop and mobile in light and Collector Midnight.
- Verified category filtering/no-results state, available and sold-out variant
  selection, variant thumbnails, quantity increments, add-to-cart feedback,
  cart count, related sets, responsive layout, and zero browser console errors.
- Removed the temporary cart item after the interaction test.
- Existing build warnings remain for multiple-lockfile workspace-root
  inference, deprecated `middleware`, and PostgreSQL SSL-mode compatibility.

---

## Session 27

Date: 2026-07-29

### Objective
Complete Milestone 4 launch-readiness work while leaving the admin-deferred
legal-policy review out of scope.

### Commerce and Customer Experience
- Reworked cart, checkout, and checkout-status layouts with the premium
  light/Collector Midnight tokens without changing payment, promotion, GST,
  stock, or reconciliation rules.
- Checkout now blocks payment until real fulfilment fees load successfully and
  offers an explicit retry instead of falling back to hardcoded prices.
- Corrected the paid self-collection receipt to display the configured pickup
  address rather than an empty shipping block.
- Reworked search results, My orders, and the customer order receipt for both
  themes. The receipt table now has a caption, scoped headers, and responsive
  horizontal overflow.

### SEO and Structured Data
- Added a root metadata base, title template, application metadata, and default
  OpenGraph/Twitter card values using the PokeSunshineTCG logo and tagline.
- Added canonical URLs to public content and catalogue routes, with dynamic
  category/product metadata and social images.
- Added noindex metadata to cart, checkout, checkout status, search, and account
  routes.
- Added an hourly database-backed `/sitemap.xml` containing public static
  routes, categories with live products, and all non-archived products.
- Revalidated Product JSON-LD against current Google requirements: name plus
  per-variant SGD offers with price and availability remain present.
- Updated breadcrumbs to reflect the approved customer path:
  Home -> Categories -> Category -> Product, with an All products fallback.

### Accessibility and Performance
- Added a skip-to-content link and global focus-visible outline.
- Labelled header search forms, added live suggestion feedback, and made Escape
  close the mobile navigation.
- Preserved accessible quantity controls, selected-option state, fulfilment
  radios, checkout labels, and live error/status feedback.
- Updated the homepage LCP image to the Next 16 `preload` API and eagerly loads
  the above-the-fold product/category hero image while retaining lazy loading
  elsewhere.
- Self-hosted Geist through `next/font/local`, removing the build-time Google
  Fonts network dependency.
- Migrated deprecated `middleware.ts` to the Next 16 `proxy.ts` convention.
- Updated the footer TCG link to the real `/categories` route.

### Verification
- Targeted ESLint passed for all Milestone 4 application/configuration files.
- Next route type generation passed.
- `tsc --noEmit` passed.
- The production build passed compilation, TypeScript, page-data collection,
  and generation of all 43 routes, including the hourly sitemap.
- The sitemap artifact was inspected and contains static, category, product,
  change-frequency, last-modified, and image entries as expected.
- Whole-project ESLint was run separately and still reports 42 pre-existing
  errors and one warning in unrelated admin/API/email files. This remains a
  dedicated cleanup task, not a Milestone 4 regression.
- PostgreSQL SSL-mode forward compatibility remains a build warning.
- The admin requested that no preview server be started; browser review is
  therefore Review Gate 4 on the admin-run server.

### Final Pre-Live Gate
- At final deployment readiness, remind the admin to regenerate/rotate every
  API key and secret and update the deployment environment.
- Wiping disposable Prisma data is a separate destructive action and requires
  explicit confirmation at that time. After the wipe, reseed only approved
  production content and run one final smoke test.

### Follow-Up — Turbopack Root Override Reverted
- Explicit `turbopack.root` attempts using `process.cwd()` and `__dirname`
  resolved outside the repository during development, which caused dependency
  resolution failures and repeated access-denied HMR errors.
- Removed the entire root override and restored Next.js automatic root
  detection. Config ESLint passed.
- The admin will restart and verify the development server. The
  multiple-lockfile inference warning may return; it is non-fatal and should
  only be revisited with a separately tested configuration.

---

## Session 28

Date: 2026-07-29

### Objective
Repair the invalid `/sitemap.xml` discovered during Review Gate 4 without
starting or stopping the admin-run development server.

### Sitemap XML Repair
- Confirmed that three database-backed image URLs contained query parameters
  with raw ampersands.
- Next.js emitted those values directly inside `<image:loc>`, causing XML
  parsing to stop at the first `&`.
- Added sitemap-specific URL serialization that converts ampersands to
  `&amp;` for static, category, product, and image locations.
- No database, schema, dependency, catalogue, or route-scope change was made.

### Verification
- The already-running `/sitemap.xml` endpoint returned HTTP 200.
- The complete response parsed successfully as XML with 17 URL entries.
- Confirmed zero unescaped ampersands remain in the response.
- Targeted ESLint passed for `app/sitemap.ts`.
- `tsc --noEmit` passed.
- The development server was not started or stopped.

## Session 29

Date: 2026-07-29

### Objective
Create a disposable production catalogue sample from the admin's inventory
workbook so its presentation can be reviewed before the separately approved
database reset.

### Catalogue Preview Import
- Created the `TCG Set` product type and `Pokemon English` category.
- Added eight products: Ascended Heroes, Phantasmal Flames, Destined Rivals,
  Prismatic Evolution, Surging Sparks, Paradox Rift, Fusion Strike, and Silver
  Tempest.
- Added 12 variants and 54 total stock units using the workbook's positive
  quantities and prices.
- Omitted every `NA` and zero-stock workbook entry at the admin's direction.
- Corrected the workbook typo `Ascended Heros` to `Ascended Heroes`.
- Reused the existing category and product placeholder images. No descriptions,
  custom attributes, variant images, or SKUs were introduced.
- Ran the import in a transaction and removed the temporary import script after
  completion.
- No application source, database schema, migration, or dependency changed.

### Verification
- Queried the database after the transaction and confirmed eight products,
  12 variants, and 54 total stock units.
- Verified the live Pokemon English category page reports eight sets, 12
  formats, and eight available products.
- Verified the live Prismatic Evolution product page exposes the four expected
  format selectors, prices, and stock state.
- The database wipe was not performed and remains gated on separate explicit
  admin approval after catalogue review.
- The development server was not started or stopped.

---

## Session 30

Date: 2026-07-29

### Objective
Make database-backed storefront catalogue pages refresh automatically while
retaining cached production performance.

### Storefront Revalidation
- Added a 60-second route revalidation fallback at the root layout. This
  covers direct database changes and import scripts that bypass application
  mutation endpoints.
- Added one shared storefront revalidation helper that invalidates the root
  layout route tree for refresh on its next visit.
- Called the helper only after successful product creation/edit/archive,
  category creation/edit/deletion, and product-type creation/edit operations.
- Kept the broad invalidation deliberately simple. Catalogue mutations are
  infrequent, and the fallback prevents missed external changes from remaining
  stale indefinitely.
- No database, migration, dependency, environment variable, or API contract
  changed.

### Verification
- `git diff --check` passed.
- Targeted ESLint reported 15 existing `no-explicit-any` errors on untouched
  product and product-type API lines. The same target passed with only that
  documented legacy rule suppressed; the new code introduced no lint finding.
- `tsc --noEmit` passed.
- Prisma Client generation passed.
- The production build passed compilation, TypeScript checking, page-data
  collection, and generation of all 43 pages.
- The build output reports a one-minute revalidation interval for `/`,
  `/categories`, and other static routes beneath the root layout.
- Existing multiple-lockfile workspace-root and PostgreSQL SSL-mode warnings
  remain unchanged.
- The development server was not started or stopped.
- Production verification remains pending deployment of this code.

---

## Session 31

Date: 2026-08-01

### Objective
Perform Phase 1 of the approved launch-readiness sequence as a non-destructive
technical audit, excluding all legal and PDPA coverage.

### Audit Work
- Added `handover/LAUNCH_AUDIT.md` with PASS, FAIL, and USER REQUIRED results,
  severity, evidence, and recommended remediation.
- Confirmed the production catalogue refresh, cart behavior, valid sitemap,
  canonical/structured data, route protection, both themes, and responsive
  navigation.
- Confirmed HSTS and cache behavior; found missing production browser security
  policies and a missing `/robots.txt` route.
- Verified the production deployment is using a Clerk development instance.
- Completed a static authorization, secret-handling, raw-card-data, HitPay,
  webhook, reconciliation, stock-restoration, email, and cron review.
- Identified concurrency/idempotency risks in terminal payment transitions,
  duplicate discount/email side effects, missing confirmation email on paid
  reconciliation, and reconciliation before ownership validation.
- Ran automated semantic and computed-color accessibility checks; found live
  WCAG AA contrast failures and a missing empty-cart `h1`.
- Confirmed no environment/secret files are tracked and no raw card fields are
  present. No secret values were displayed.
- Recorded that legal wording, legal policies, and PDPA coverage are solely
  owner/lawyer-managed and outside engineering scope.

### Verification
- `tsc --noEmit` passed.
- Production build passed and generated 43 routes without starting a server.
- Whole-project ESLint reported the existing 42 errors and one warning.
- Read-only dependency audit checked 677 packages and reported 20 advisories:
  11 High, 9 Moderate, and no Critical. Next.js 16.2.9 is affected; the audit
  identifies 16.2.11 as the current patched minimum.
- Production unauthenticated cron access returned `401`; signed-out customer
  and admin pages redirected to Clerk sign-in.
- Browser-local cart test data was removed after verification. No order,
  payment, database row, deployment setting, or external-service setting was
  created or changed.
- The development server was not started or stopped.

### Decision
Technical launch status is NO-GO pending the High-severity audit remediations
and Phase 2 authenticated/sandbox/monitoring verification. No database wipe is
authorized during Phase 2.

---

## Session 32

Date: 2026-08-02

### Objective
Implement approved Phase 2 Batch 1: patch the Next.js security baseline and
verify that the application still builds without starting the development
server.

### Changes
- Updated `next` and `eslint-config-next` from 16.2.9 to 16.2.11.
- Regenerated the npm lockfile and installed the locked graph. Next.js,
  `@next/env`, `@next/eslint-plugin-next`, and the Windows SWC binary all resolve
  to 16.2.11. No pnpm lockfile was introduced.
- Left React/React DOM and all application code, database schema, environment
  variables, deployment settings, and external services unchanged.
- Updated the launch audit and handover plan to record Batch 1 as locally
  remediated with production deployment verification still required.

### Verification
- Read the bundled Next.js 16 upgrade/install guidance before changing package
  versions.
- Prisma Client generation passed.
- `tsc --noEmit` passed.
- Whole-project ESLint remains exactly at the documented baseline: 42 errors
  and one warning; the package upgrade introduced no new lint finding.
- Next.js 16.2.11 production build passed compilation, TypeScript, page-data
  collection, and generation of all 43 static pages/routes.
- Follow-up npm audit fell from 20 advisories to 9: 5 High, 4 Moderate, and no
  Critical. The prior Next.js proxy/Server Action/SSRF/cache advisories are
  gone. Residual `sharp`, `postcss`, Prisma/tooling, `brace-expansion`,
  `fast-uri`, and `valibot` findings remain a separate batch; the unsafe forced
  Next.js 9.3.3 downgrade was not applied.
- The existing workspace-root and PostgreSQL SSL-mode warnings remain.
- The first sandboxed build failed only because Turbopack was denied read access
  to the inferred `C:\Users\crate` workspace root; the approved unrestricted
  rerun completed successfully.
- The development server was not started or stopped.

---

## Session 33

Date: 2026-08-02

### Objective
Implement approved Phase 2 Batch 2: atomic/idempotent terminal payment
transitions, durable payment-email retries, and ownership validation before
checkout-success reconciliation.

### Changes
- Added one shared `transitionOrderPayment` compare-and-set service used by
  checkout compensation, the HitPay webhook, and stale-order reconciliation.
- Moved failed-order stock restoration and paid-order promotional expense
  creation into the winning terminal-status transaction. Duplicate or
  concurrent callers that lose the `PENDING_PAYMENT` update cannot repeat
  either side effect.
- Added the additive migration
  `20260802000000_add_order_email_deliveries`. It defines confirmation/failure
  delivery types, recipient snapshots, status, attempts, Resend ID, sanitized
  error, and timestamps with a unique `(orderId, type)` constraint.
- Added durable post-commit email delivery with stable Resend idempotency keys,
  a five-attempt cap, and conditional updates that cannot overwrite an already
  successful concurrent send with a later failure.
- Extended the reconciliation cron to retry up to 25 pending/failed payment
  emails per invocation while retaining its existing stale-payment sweep.
- Changed authenticated checkout-success handling to verify ownership before
  any HitPay reconciliation request or terminal-state side effect.
- Removed the superseded `lib/orders.ts` and
  `lib/recordDiscountExpense.ts` helpers and regenerated the tracked Prisma
  client.
- No environment variable, payment-provider configuration, dependency, or
  customer-facing checkout design changed.

### Verification
- Read the bundled Next.js 16 route-handler and page guidance before editing.
- Prisma format, schema validation, and client generation passed.
- `tsc --noEmit` passed.
- Targeted ESLint passed for every affected application file. Whole-project
  ESLint remains exactly at the documented 42 errors and one warning.
- The Next.js 16.2.11 production build passed compilation, TypeScript,
  page-data collection, and generation of all 43 pages/routes.
- The sandboxed build first hit the known Turbopack workspace-root access
  restriction; the approved unrestricted rerun passed. Existing workspace-root
  and PostgreSQL SSL-mode warnings remain.
- Preflight found exactly one pending migration, then `prisma migrate deploy`
  applied `20260802000000_add_order_email_deliveries` to Neon successfully; the
  post-check reports the database schema up to date.
- No orders, payments, or catalogue rows were created or deleted, no database
  wipe occurred, and the development server was not started or stopped.
- Verified Vercel Production commit `3f810bc` (`feat: make payment atomic`) is
  Ready after a 1m 2s build.
- Production smoke checks passed: homepage `200`, sitemap `200 application/xml`
  and parsed successfully with 26 URLs, and the unauthenticated reconciliation
  cron returned the expected `401 application/json`.
- The 33 currently visible recent Vercel log rows contained no 5xx response;
  the observed cron 401 was the intentional unauthenticated smoke request.
- HitPay sandbox duplicate/concurrent verification remains the next checkpoint.

---

## Session 34

Date: 2026-08-02

### Objective
Verify deployed Batch 2 payments and corrected production order/newsletter
email senders end to end, including a real concurrent reconciliation race.

### Verification
- The authenticated account page showed sandbox order
  `cmsb73cf1000004juqzit9kz8` as Paid after the owner completed payment.
- A read-only Neon check confirmed status `PAID`, one Silver Tempest item at
  quantity 1, and current variant stock 3 after starting at 4. The order had no
  discount, so zero system promotion expenses is the expected result.
- Exactly one durable `CONFIRMATION` delivery row exists, confirming the unique
  payment-email outbox behavior for this completed transition.
- Actual email delivery failed after four attempts because Resend rejected the
  production sender value as invalid `from` syntax. No Resend email ID or
  `sentAt` timestamp was recorded.
- Vercel production logs showed the same sanitized sender error during cron
  retries and no different payment-processing failure for the tested order.
- The owner corrected both Vercel Resend sender variables and redeployed.
  New paid order `cmsb97nri000004l8gs3ji9qq` created exactly one confirmation
  row; it reached `SENT` on attempt 2 with a Resend ID, and the owner confirmed
  inbox receipt.
- Real-expiry order `cmsb9j9ur000304l83998i5wz` stayed pending while HitPay was
  pending, then changed to `PAYMENT_FAILED` only after HitPay reported
  `expired`. Stock restored once from 2 to 3 and one payment-failed email sent
  on attempt 1.
- A second fresh expired order, `cmsba022h000604l8t2coj5ys`, was deliberately
  selected by two concurrent authenticated production reconciliation calls.
  Both returned 200, but the atomic transition produced one terminal state,
  one stock restoration from 2 to 3, and one `SENT` failure-email delivery on
  attempt 1 with a Resend ID.
- Two attempted locally signed `failed` webhook probes were correctly rejected
  with 401 because the local and production webhook salts differ. No secret was
  requested or exposed and the order remained unchanged before the real expiry
  race.
- Created and broadcast clearly labelled newsletter test
  `cmsbajgb1000004l810gl3dgn` to the sole subscribed customer. The database and
  admin UI report one recipient, one `SENT` delivery, zero failures, and a
  Resend ID.
- The recent Vercel log sweep showed 200s for reconciliation and newsletter
  broadcast and no 5xx. The eight error-level entries were six known PostgreSQL
  SSL-mode warnings and the two intentional invalid-signature probes.
- Checkout-success ownership isolation passed against production paid order
  `cmsb97nri000004l8gs3ji9qq`. The admin/non-owner account received the
  not-found page; after switching accounts, the disposable customer owner saw
  the complete confirmed order. Read-only Neon checks before and after both
  requests showed identical `PAID` status, `updatedAt`, reference, and one
  email-delivery row, so neither request introduced a reconciliation or email
  side effect. The owner request appeared as 200 in Vercel and the surrounding
  production log review showed no 5xx response.
- The owner confirmed inbox receipt of both payment-failed messages and the
  newsletter test, completing the human delivery check for all email paths
  exercised in this session.
- Disposable test orders and the test newsletter were created as authorized.
  No application code was changed, the database was not wiped, and the
  development server was not started or stopped.

### Next Step
If HitPay supports authentic webhook replay, capture the exact provider-emitted
`failed` event variant. The real expiry and concurrent shared failure
transition are already verified.

---

## Session 35

Date: 2026-08-02

### Objective
Attempt to capture an authentic HitPay `payment_request.failed` event without
changing the application's PayNow-only checkout configuration.

### Verification
- The sandbox dashboard confirmed that the deployed webhook endpoint subscribes
  to both `payment_request.completed` and `payment_request.failed`, but it has no
  event replay control.
- Created disposable self-collection order `cmsbgvg6a000004jv73e8unk9` for one
  $5 Silver Tempest item. Its normal application payment request offered only
  PayNow, matching `app/api/checkout/route.ts`.
- Created a clearly labelled $5 sandbox payment link with the disposable order
  reference and selected the dashboard's available card method. HitPay's
  official declined test card displayed “Your card was declined.”
- The declined request remained `Unpaid`, Vercel recorded zero requests to
  `/api/webhooks/hitpay` for the attempt, and the store order remained
  `PENDING_PAYMENT`. It therefore did not provide authentic failed-webhook
  coverage and is not recorded as a pass.
- The original PayNow request then reported expired. Authenticated owner
  reconciliation changed the disposable order to `PAYMENT_FAILED`; a read-only
  Neon query confirmed Silver Tempest stock restored from 2 to 3 and exactly
  one `PAYMENT_FAILED` email delivery reached `SENT` on attempt 1 with a Resend
  ID.
- No application code, environment value, webhook endpoint, or credential was
  changed. No database wipe occurred and the development server was not started
  or stopped. The disposable HitPay payment link remains as test evidence.

### Next Step
The owner chooses whether to accept the missing terminal online `failed` event
as a documented HitPay limitation for the PayNow-only launch configuration or
contacts HitPay support for a supported simulator/replay path. The real expiry
and concurrent shared failure transition are already verified.

---

## Session 36

Date: 2026-08-02

### Objective
Close Payment Batch 2 with the owner-accepted HitPay limitation and implement
the approved production browser-security-header remediation.

### Implementation
- Recorded the owner's accepted PayNow-only behavior: an online declined
  attempt remains retryable/unpaid, the storefront displays failure, and the
  customer starts a fresh checkout. Payment Batch 2 is complete with this
  provider limitation documented accurately.
- Added a static all-route header policy in `next.config.ts`: enforcing CSP,
  `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`,
  `Referrer-Policy: strict-origin-when-cross-origin`, and a restrictive
  `Permissions-Policy`.
- Chose static Next config headers instead of nonce CSP because the installed
  Next.js 16 guidance states that per-request nonces force dynamic rendering
  and disable ISR/CDN caching. The current 60-second storefront ISR is retained.
- The CSP permits the App Router/JSON-LD/theme initializer and the documented
  Clerk/Cloudflare script, connection, image, worker, and frame requirements;
  current secure remote catalogue images remain supported. It blocks plugins,
  framing, non-self form targets, and development-only `unsafe-eval` in the
  production build.

### Verification
- Targeted ESLint for `next.config.ts`: PASS.
- `tsc --noEmit`: PASS.
- Prisma client generation: PASS.
- Next.js 16.2.11 production build: PASS, 43 pages generated. The existing
  multiple-lockfile/Turbopack-root and PostgreSQL SSL warnings remain unchanged.
- Generated `.next/routes-manifest.json` contains the expected CSP and four
  companion headers on `/(.*)`; the production CSP includes
  `upgrade-insecure-requests` and excludes `unsafe-eval`.
- The initial verification command selected the wrong package-manager wrapper
  and began moving direct dependencies. It was stopped; every moved dependency
  was restored to its original `node_modules` location, the temporary package
  store was removed, and Git status confirms no lockfile or dependency-source
  change.
- No dependency, environment, database, API, server, or external-service change
  was made.

### Next Step
Commit and deploy the security-header batch. Verify all headers on the custom
domain and perform authenticated Clerk/account/admin/cart/checkout smoke tests
with browser-console CSP monitoring. Repeat auth/CSP verification when the
owner later switches to production Clerk credentials and its final domain.

---

## Session 37

Date: 2026-08-02

### Objective
Verify Browser Security Batch 3 after the owner deployed it to production.

### Verification
- The custom-domain homepage returned `200` with the enforcing CSP,
  `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`,
  `Referrer-Policy: strict-origin-when-cross-origin`, and the restrictive
  `Permissions-Policy`.
- Vercel reported an ISR cache hit and the response retained the Next.js
  prerender header, confirming the static CSP did not disable ISR.
- Homepage rendering, secure remote product images, Silver Tempest product
  detail, and switching from light to dark and back to light passed.
- The signed-in customer account/orders page rendered normally. The same
  non-admin session was redirected away from `/admin`, confirming the denial
  path still worked under the CSP.
- A temporary Silver Tempest item was added to the browser cart. The populated
  cart rendered, checkout loaded delivery at $5.50 and self collection as free,
  and calculated the $10.50 total. No checkout submission or order creation
  occurred, and the item was removed so the cart returned to empty.
- After the owner switched to the admin account, `/admin` rendered the full
  dashboard and navigation with no broken images.
- Browser monitoring across the tested routes found no CSP or application
  error. The only warning was the existing Clerk development-key warning,
  which remains a separate High-severity launch blocker.
- No application code, database record, environment value, server, payment, or
  external-service setting was changed. The development server was not started
  or stopped.

### Next Step
Prepare the focused semantic-token/file plan for the audited WCAG AA
color-contrast remediation and obtain owner approval before editing code.

---

## Session 38

Date: 2026-08-02

### Objective
Implement the owner-approved WCAG AA color-contrast remediation without
starting or stopping the development server.

### Implementation
- Darkened the light-theme accent and changed its foreground to white so brand
  text, focus indicators, selected controls, badges, and accent hover states
  retain accessible foreground/background pairs.
- Darkened light-theme muted, subtle, success, and warning semantic tokens.
- Corrected shared primary/accent button hover pairs and removed the reduced
  opacity from secondary text inside selected product-format buttons.
- Changed the admin wordmark to inherit the foreground appropriate to the
  theme's primary sidebar instead of using the same gold in dark mode.
- Replaced DashboardCharts' light-only hardcoded palette with CSS custom
  properties for both themes. Axes, data series, tooltip text, and legend labels
  now resolve against the current `data-theme` without extra React state or a
  new dependency.

### Verification
- Exact light and dark token-pair checks: PASS. Tested ratios range from
  `4.58:1` to `9.14:1`, including accent, muted/subtle text, success, warning,
  admin wordmark, and chart data/tick colors.
- Targeted ESLint for the four changed TypeScript/TSX files: PASS.
- `tsc --noEmit`: PASS.
- Prisma client generation: PASS.
- Next.js 16.2.11 production build: PASS, 43 pages generated. The existing
  multiple-lockfile/Turbopack-root and PostgreSQL SSL warnings remain unchanged.
- No dependency, environment, database, API, server, or external-service change
  was made. The development server was not started or stopped.

### Next Step
Commit and deploy Contrast Batch 4, then rerun production computed contrast and
visual/interaction checks across public, customer, checkout, and admin surfaces
in both themes before marking it complete.

---

## Session 39

Date: 2026-08-02

### Objective
Verify the deployed Contrast Batch 4 and implement the owner-approved focused
follow-up for any remaining failures.

### Production Verification
- Confirmed the deployed light semantic and chart token values match the local
  implementation.
- The complete settled dark-theme computed scan passed on homepage, products,
  Silver Tempest detail, empty cart, checkout, account/orders, and admin.
- Admin Recharts SVG axes, data series, and inner legend labels resolved to the
  intended accessible light/dark palette. The only console messages were the
  existing Clerk development-key warnings.
- The original light-surface failures were fixed. The scan exposed four accent
  usages on navy/ink sections at `3.38:1`: the header announcement divider,
  footer brand/location/link hover, and category-card product count.

### Follow-up Implementation
- Changed only those ink-section accents in `Header.tsx`, `Footer.tsx`, and
  `CategoryCard.tsx` to the existing `accent-light` token. Surface accent usage
  and the global palette remain unchanged.

### Verification
- Light-gold on light ink: `10.62:1`; on dark ink: `12.03:1`.
- Targeted ESLint for the three changed components: PASS.
- `tsc --noEmit`: PASS.
- Next.js 16.2.11 production build: PASS, 43 pages generated. Existing
  multiple-lockfile/Turbopack-root and PostgreSQL SSL warnings are unchanged.
- No dependency, environment, database, API, server, payment, or
  external-service setting changed. The development server was not started or
  stopped.

### Next Step
Deploy the three-file follow-up and rerun the final production light-theme scan
plus a dark-theme spot check before marking Contrast Batch 4 complete.

---

## Session 40

Date: 2026-08-02

### Objective
Complete final production verification after deployment of the approved
gold-on-ink contrast follow-up.

### Production Verification
- Confirmed the deployed header announcement divider, footer accent content,
  and category-card product count now resolve to `accent-light`.
- Ran the computed contrast scan on homepage, catalogue, Silver Tempest product
  detail, cart, checkout, account/orders, and admin in both light and dark
  themes. All audited combinations pass.
- Directly inspected the two out-of-stock badge results that the scanner could
  not parse because their background uses modern `oklab()` alpha syntax. Their
  worst-case 90%-opaque ink composite over white contrasts with the badge text
  at `12.01:1`, so both reports were false positives.
- Confirmed the theme-aware admin chart axes, data series, and inner legend
  labels remain accessible in both themes.
- No application or CSP console errors appeared. The only console messages were
  the known Clerk development-key warnings.
- Restored the storefront to light theme and closed the audit tab. No order,
  payment, database row, environment value, deployment setting, server, or
  external-service setting was created or changed.

### Result
Contrast Batch 4 is complete. The technical launch decision remains NO-GO only
while the production Clerk development instance and missing error/uptime
monitoring remain High-severity blockers.

### Next Step
Prepare an owner-present migration plan for a Clerk production instance. The
owner enters all keys and webhook secrets without sharing them; after deployment,
verify sign-up/sign-in, customer/admin authorization, webhook synchronization,
and CSP compatibility. Do not wipe data during Phase 2.

---

## Session 41

Date: 2026-08-02

### Objective
Complete every remaining launch-readiness task that can be handled without
owner access, secret changes, external-service configuration, or a schema
change.

### Implementation
- Added `app/robots.ts` using the Next.js 16 metadata route. Public crawling is
  allowed; account, admin, API, cart, checkout, search, and authentication paths
  are excluded; the sitemap URL uses the existing environment-derived site URL.
- Changed the empty-cart title from a paragraph to the page `h1` without visual
  styling changes.
- Removed raw HitPay response-body logging from checkout. Failure logs now
  contain only an event label, internal order ID, and HTTP status.
- Set the documented absolute Turbopack root in `next.config.ts`, removing the
  workspace-root/multiple-lockfile build warning.
- Resolved the complete ESLint baseline without suppressions: 42 errors and one
  warning. Replaced explicit `any` with typed inputs/responses or `unknown`,
  derived the selected product type instead of setting it synchronously in an
  effect, typed the Clerk webhook event, corrected email literals, and removed
  the unused theme-initializer catch binding.
- Added request typing and the missing product-type fields-array validation
  while preserving the existing API contracts and behavior.

### Independent Reviews
- Reviewed the current dependency tree against primary advisories. Recorded
  supported patch candidates and the unsupported Next.js internal dependency
  overrides in `handover/DEPENDENCY_REMEDIATION.md`. No dependency or lockfile
  changed, and no forced audit fix was run.
- Designed the append-only, data-minimized admin audit log in
  `handover/ADMIN_AUDIT_LOG_PLAN.md`. No Prisma schema, migration, generated
  client, or database change was made.
- Production browser checks confirmed the search result's natural focus order,
  Escape dismissal, accessible names/live status, and named native checkout
  controls. The automation driver still cannot reliably synthesize native
  Tab/Space default actions, so the later human keyboard/screen-reader check
  remains required. A temporary Silver Tempest cart item was removed; no order
  was created.

### Verification
- Whole-project ESLint: PASS with zero findings.
- `tsc --noEmit`: PASS.
- Prisma client generation: PASS.
- Next.js 16.2.11 production build: PASS, 44 routes including static
  `/robots.txt`.
- Generated robots body contains the intended allow/disallow rules and sitemap
  directive. Production custom-domain output remains to be checked after
  deployment.
- The Turbopack root warning is gone. The PostgreSQL future-`sslmode` warning
  remains owner-controlled and is deferred to secret rotation.
- The first sandboxed build attempt could not spawn a Turbopack worker; the
  approved unsandboxed rerun passed. No development server was started or
  stopped.

### Next Step
Commit and deploy the independent cleanup batch, then verify live robots,
empty-cart semantics, public/admin smoke paths, and logs. After it passes,
proceed to the owner-present Clerk production-instance migration. Do not wipe
data during Phase 2.

---

## Session 42

Date: 2026-08-02

### Objective
Verify the production deployment of Independent Cleanup Batch 5 and advance the
launch sequence to the first owner-present blocker.

### Production Verification
- Confirmed `/robots.txt` returns `200` as `text/plain` with the intended public
  allow rule, private-route exclusions, and
  `Sitemap: https://biggyballs69.gay/sitemap.xml`.
- Confirmed `/sitemap.xml` returns `200` as `application/xml`, uses the
  production domain, and renders escaped `&amp;` entities rather than the prior
  XML entity error.
- Confirmed the homepage, all-products catalogue, Silver Tempest product page,
  empty cart, and signed-in admin dashboard render without a Next.js error
  overlay.
- Confirmed the empty cart now exposes “Your binder is empty.” as its single
  page `h1`.
- Did not create a checkout failure solely to exercise the redacted HitPay log;
  deployment, source, TypeScript, lint, and production-build verification cover
  that change until the next organic provider failure.
- No order, payment, database row, environment value, deployment setting,
  server, or external-service setting changed.

### Result
Independent Cleanup Batch 5 is complete. The technical launch decision remains
NO-GO because production still uses a Clerk development instance and verified
error/uptime monitoring remains missing.

### Next Step
With the owner present, agree on the Clerk production-instance migration and
rollback plan before changing Clerk or Vercel settings. The owner enters all
secret values without sharing them. Do not wipe data during Phase 2.

---

## Session 43

Date: 2026-08-03

### Objective
Move the production storefront from Clerk's development instance to an
owner-created production instance while preserving the confirmed local admin
and retaining a focused rollback.

### Owner-Present Migration
- Agreed on a minimal cutover and rollback before any external change. The
  existing local `.env` and development instance remained unchanged.
- Created the Clerk production instance on `biggyballs69.gay`, disabled paid
  SMS MFA to retain the free plan, added all five required Cloudflare CNAMEs as
  DNS-only records, and verified Clerk DNS and TLS certificates.
- Created the production owner before enabling the webhook, then configured
  `user.created` at the production webhook URL. The owner entered the
  production publishable key, secret key, and webhook signing secret directly
  into Vercel Production without sharing their values and redeployed the
  existing application commit.
- Configured custom Google OAuth credentials with the exact Clerk redirect URI
  and only Clerk's default identity scopes. Google linked successfully to the
  existing owner and the OAuth audience was published to production.
- Guardedly changed exactly one existing local `ADMIN` row from its development
  Clerk ID to the owner's production Clerk ID. Its local user ID, role, and
  relations were preserved. The old mapping remains available for rollback.

### Verification
- Production Clerk sign-in and Google social sign-in passed.
- The owner loaded `/admin`; a fresh separately authenticated customer loaded
  account/orders and was denied from `/admin`.
- A read-only Neon check confirmed one mapped `ADMIN` and that the fresh webhook
  signup created a new `CUSTOMER` record.
- The final production storefront rendered normally with no CSP error, Clerk
  development warning, or browser error.
- No application code, schema, migration, package, local secret, order,
  payment, newsletter broadcast, or data wipe changed. No development server
  was started or stopped.

### Result
The Clerk development-instance launch blocker is closed. The technical launch
decision remains NO-GO only because error tracking and uptime alerting are not
configured and verified.

### Next Step
Plan the separate owner-present error-tracking and uptime-monitoring batch,
including rollback and harmless alert-delivery verification, before changing
application or external-service settings.

---

## Session 44

Date: 2026-08-04

### Objective
Implement and production-verify the owner-approved error-tracking and uptime
monitoring batch without exposing secrets or starting/stopping the development
server.

### Plan and Rollback
- Agreed before changes to use Sentry for both production error tracking and
  uptime, with logs, tracing, Session Replay, automatic PII, and broad CSP
  sources disabled.
- Defined rollback as reverting the application commit or restoring the prior
  Vercel deployment, removing the four persistent Sentry variables plus the
  temporary test flag, disabling the Sentry monitor, and revoking the upload
  token. No database rollback is required.
- The owner created the Sentry project and entered the replacement upload token
  directly into Vercel without sharing it. All monitoring variables were scoped
  to Production only.

### Implementation
- Added `@sentry/nextjs@10.69.0` and wired browser, Node.js, Edge, request-error,
  and global-error capture using the Next.js 16 instrumentation conventions.
- Added shared privacy options that disable logs/user identity/cookies/headers/
  bodies/query parameters/GraphQL variables/GenAI data/database query data/
  stack variables and strip request query strings and breadcrumb data.
- Added release/source-map upload with post-upload deletion, debug/tracing
  treeshaking, and the exact Sentry ingest origin in the production CSP.
- Added public `GET /api/health` with a no-store read-only `SELECT 1`, returning
  only `ok` or `unavailable`.
- Added a temporary environment-gated, admin-authenticated monitoring event
  route for one production verification event, then removed it from source and
  deleted `MONITORING_TEST_ENABLED` from Vercel after the test.

### Verification
- Whole-project ESLint, `tsc --noEmit`, Prisma generation, and the Next.js
  16.2.11 production build passed. The first sandboxed build was unable to spawn
  a Turbopack worker; the approved elevated rerun passed. No development server
  was started or stopped.
- Vercel deployed commit `6afb773` from `main` as Ready. The custom-domain
  health probe returned `200`, `{"status":"ok"}`, `no-store`, and the expected
  security headers with only the exact Sentry ingest origin added to CSP.
- Sentry created release `6afb773010a5...`. The synthetic High-priority issue
  `POKESUNSHINETCG-PRODUCTION-2` mapped to
  `app/api/admin/monitoring-test/route.ts:17` with readable source context,
  release/environment/test tags, and no user identity, cookies, headers, body,
  or query data. The project email alert recorded the trigger.
- Sentry Uptime monitor `7983784` recorded healthy `200` checks. For the
  controlled test its URL was temporarily changed to a guaranteed 404 path and
  its failure threshold to one. It created issue
  `POKESUNSHINETCG-PRODUCTION-1` and triggered the email rule; the owner confirmed
  delivery. The monitor was restored to `/api/health`, three failures, and one
  recovery success. A later `200` check automatically cleared the ongoing issue.
- `npm audit` reported 11 advisories (5 moderate, 6 high, no critical). Review
  found no new uniquely Sentry-owned vulnerable package; supported dependency
  remediation remains a separate approved batch and no audit fix was run.

### Next Step
The owner deploys the cleanup commit and verifies the removed temporary route
returns `404`. Then run the final non-destructive technical launch re-audit and
issue the updated engineering go/no-go report. Secret rotation, the human
assistive-technology pass, minimal live payment, catalogue approval, and the
database reset remain separately controlled owner actions.

---

## Session 45

Date: 2026-08-04

### Objective and Boundaries
Complete the final technical launch re-audit and issue the engineering go/no-go
without changing application/data/external state, starting or stopping the
development server, or pushing changes. Rollback was limited to removing only
this session's handover-document edits; pre-existing worktree changes would
have been preserved. The initial worktree was clean.

### Source and Framework Re-Audit
- Reviewed the bundled Next.js 16.2.11 production, Route Handler, header,
  authentication/authorization, data-security, and Proxy guidance relevant to
  the audit.
- Reconfirmed Clerk authentication plus database `ADMIN` checks across all 19
  admin API route files and the admin layout.
- Reconfirmed checkout-success ownership before reconciliation, raw-body
  HitPay HMAC verification, Svix verification for Clerk, compare-and-set
  payment transitions, unique durable payment-email rows, redacted provider
  failure logging, health no-store behavior, and Sentry data minimization.
- Confirmed the monitoring cleanup commit removed the temporary test route and
  that no secret/environment/private-key file is tracked or matched the
  focused source scan.

### Verification
- Whole-project ESLint: PASS with zero findings.
- `tsc --noEmit`: PASS.
- Prisma schema validation and client generation: PASS; generation left the
  tracked worktree unchanged.
- Next.js 16.2.11 production build: PASS, including all 44 static pages. The
  restricted first attempt could not spawn a Turbopack worker; the approved
  identical rerun passed. The only build warning is the already
  owner-controlled PostgreSQL future-`sslmode` warning.
- Production: monitoring test route `404`; health `200 {"status":"ok"}` and
  no-store; homepage/categories/cart/robots/sitemap/category/product/search
  passed; HTTP redirects to HTTPS; signed-out account/admin/checkout redirect
  to sign-in; sitemap parses as 26 valid URLs; canonical/JSON-LD remain present.
- All five configured browser-security headers plus HSTS remain deployed, and
  the homepage returned a Vercel cache hit.
- The package lock is unchanged since the 11-advisory Sentry audit. Primary
  upstream review reconfirmed the open Next.js 16.2.11 Sharp constraint and
  Prisma 7.8.0 as current stable. The exact npm count was not refreshed because
  the available runtime has no npm CLI; no alternate CLI was installed.

### Findings and Decision
- No new High-severity blocker was found. The formal result is **ENGINEERING GO
  WITH RECORDED MEDIUM/LOW RISKS**.
- Existing Medium findings remain: cron query-string authentication,
  supported-upstream dependency remediation, and owner-approved admin audit-log
  implementation.
- Added a Medium checkout-abuse finding: authenticated checkout has no rate or
  per-user pending-order control, allowing repeatable temporary inventory and
  provider/database pressure.
- Added a Low Clerk webhook retry finding: duplicate legitimate `user.created`
  delivery can hit `prisma.user.create` uniqueness and return a retriable error.
- The existing Low catalogue-description gap and owner-controlled PostgreSQL
  `sslmode` change remain open.

### Documentation Updated
- `handover/LAUNCH_AUDIT.md`
- `handover/CURRENT_STATE.md`
- `handover/NEXT_TASK.md`
- `handover/SESSION_LOG.md`

### Next Step
Proceed through owner-controlled secret rotation/`sslmode=verify-full`, focused
post-rotation smoke checks, one minimal live payment, human keyboard/screen-
reader verification, and real-catalogue approval. Any database reset still
requires a separate explicit confirmation and must preserve only the confirmed
admin account. Keep the Medium/Low engineering follow-ups separately scoped.

---

## Session 46

Date: 2026-08-04

### Objective and Boundaries
Begin the owner-controlled production secret rotation without exposing secret
values. No development server was started or stopped, no code or database
schema was changed, and nothing was staged, committed, or pushed. External
writes were limited to the owner-approved credential changes and the single
controlled production newsletter; the agent did not invoke the mutating cron
route.

### Rotation Progress
- The owner confirmed that the Clerk production credentials and Sentry upload
  token were newly issued and never shared, so they were treated as current.
- HitPay rotation was deferred until the owner can register and obtain a live
  merchant account.
- The owner replaced the Resend key in Vercel Production and redeployed.
  Read-only production root, health, route-protection, and monitoring-route
  checks passed. With explicit approval, newsletter
  `cmsefshpp000004l831obsax9` was sent to exactly one subscriber; the admin UI
  reported `Sent` and `1/1`, and the owner confirmed receipt. Revocation of the
  previous Resend key remains unconfirmed.
- Tracked documentation and Git history confirmed that cron-job.org was
  configured to call the reconciliation endpoint every five minutes from
  2026-07-15, but did not record the generator used for the original secret.
  The owner privately
  generated a replacement, updated Vercel Production and cron-job.org, moved
  the target to the custom domain, retained `?secret=` authentication, and ran
  the controlled scheduler test. The owner reported `200`; separate read-only
  root and `/api/health` checks also returned `200` with health remaining
  no-store. The Medium query-string finding therefore remains open. Confirm the
  five-minute job is enabled if it was paused for rotation.
- The owner created a separate Neon Console role, replaced Vercel Production
  `DATABASE_URL` with the new role's URL using `sslmode=verify-full`, and
  redeployed without exposing either credential. The original database-owner
  role remained active as the agreed rollback boundary.
- Read-only post-cutover verification passed: `/api/health` returned
  `200 {"status":"ok"}` with no-store; the homepage and categories returned
  `200`; signed-out account/admin protection returned the expected redirects;
  and authenticated account orders plus the admin analytics dashboard loaded
  their database-backed content. The browser recorded no console errors.
- Vercel showed the production redeployment as Ready and its last-30-minute log
  counters at zero warnings, zero errors, and zero fatals. Sentry Uptime monitor
  `7983784` showed no ongoing issue and ten consecutive one-minute `200` checks
  across three regions. The cron-job.org dashboard could not be inspected
  because that browser session was signed out; no credentials were requested
  and the cron endpoint was not invoked.

### Documentation Updated
- `handover/CURRENT_STATE.md`
- `handover/NEXT_TASK.md`
- `handover/LAUNCH_AUDIT.md`
- `handover/SESSION_LOG.md`

### Next Step
Confirm that the previous Resend key is revoked and that cron-job.org is
enabled. Inventory every consumer of the original Neon owner credential,
including Vercel Preview/Development, local environment files, administrative
tools, and other applications. After migrating each consumer, reset—but do not
delete—the owner role password, preserve database ownership, and recheck
production health. HitPay remains deferred until the live merchant account
exists.

---

## Session 47

Date: 2026-08-04

### Objective and Boundaries
Document a potential manual PayNow replacement without implementing or
selecting it. No application code, database schema/data, dependency,
environment variable, deployment, external-service setting, development-server
process, staging state, commit, or push changed.

### Payment Direction Research
- Live HitPay payment-request attempts had returned provider `403` responses.
  The owner confirmed that completing live onboarding would require business
  verification and sole-proprietorship documentation they have not decided to
  obtain.
- A PayNow QR can be generated with a fixed amount, transaction reference, and
  expiry without using a payment gateway. QR generation alone cannot provide
  authoritative settlement confirmation.
- No documented OCBC personal-account payment-verification API was found.
  Automatic confirmation remains a provider/corporate-banking capability with
  the associated onboarding.
- The alternative design uses the current `Order.id` as both order and PayNow
  reference, subject to a controlled OCBC test proving the full value appears
  in incoming transaction details.
- The proposed five-minute flow has **I have paid** and **I did not pay**
  actions. Customer-declared payment enters manual review; explicit nonpayment
  or timeout becomes `PAYMENT_FAILED`, restores stock, and uses the normal
  failure path.
- The owner accepted the paid-but-failed timeout risk. A verified late payment
  could be recovered through an admin action only if every required quantity
  can be re-reserved; otherwise recovery is blocked and the owner must refund
  or resolve inventory.

### Direction and Sequencing
- No payment option was selected. Both sole-proprietorship/provider onboarding
  and manual personal PayNow remain available.
- The owner will first separately authorize and complete the disposable-data
  reset, then define and complete a storefront professionalism pass, and only
  afterward make the payment decision.
- The full comparison, manual workflow, risks, validation gates, and rollback
  boundaries are recorded in `handover/PAYMENT_DIRECTION_OPTIONS.md`.

### Documentation Updated
- `handover/PAYMENT_DIRECTION_OPTIONS.md` (new)
- `handover/CURRENT_STATE.md`
- `handover/NEXT_TASK.md`
- `handover/ROADMAP.md`
- `handover/SESSION_LOG.md`

### Next Step
Do not implement manual PayNow or continue HitPay onboarding yet. Await the
owner's separate database-reset authorization, then scope the requested
storefront professionalism pass. Revisit the payment options only after those
steps.

---

## Session 48

Date: 2026-08-05

### Objective and Boundaries
Execute the separately authorized disposable-data reset while preserving only
the confirmed admin account and required schema/migrations, then prepare a
Pokemon English / Mega Evolution—Pitch Black showcase from official Pokémon
TCG source content. The development server was not started or stopped. Nothing
was deployed, staged, committed, or pushed.

### Reset Result
- The owner confirmed that all disposable application data was fake and
  explicitly authorized deletion.
- The guarded scope remained 270 application rows from the last successful
  inventory: all categories, category links, expenses, newsletters/deliveries,
  orders/items/email deliveries, products/types/fields/variants, promo codes,
  and four customer users. The confirmed admin ID and all 17 completed Prisma
  migrations remained the only preserved data target.
- Four new read-only preflight attempts timed out before connecting on all
  resolved Neon port-5432 endpoints. No transaction began and no database row
  changed. The HTTPS Neon Console fallback loaded only the sign-in screen, so
  no console query was attempted.
- The reset, migration deployment, and showcase import therefore remain
  pending a fresh successful read-only inventory. The planned rollback boundary
  remains transaction rollback before commit and Neon restore/PITR after
  commit.

### Local Showcase Preparation
- Added optional `ProductVariant.description` support to Prisma, the generated
  client, both admin product APIs, create/edit forms, and the selected-format
  contents section on the product page.
- Added pending migration
  `20260805000000_add_product_variant_description`.
- Downloaded the original official Pokémon TCG category logo, Pitch Black set
  logo, and five 2x product packshots directly from the official expansion
  page. No AI-generated image is used.
- Extracted the official contents for the Pokémon Center Elite Trainer Box,
  Elite Trainer Box, Booster Bundle, Booster Display, and Build & Battle Box.
  The shared set narrative remains Product-level copy; each format's contents
  is Variant-level copy.
- The intended import is one `Pokemon English` category, one archived
  `Mega Evolution—Pitch Black` product, and five zero-price/zero-stock variants.
  It stays non-sellable until the owner supplies Singapore prices and stock.

### Verification
- Prisma schema formatting and validation passed.
- Prisma Client 7.8.0 generation passed.
- TypeScript `--noEmit` passed.
- Targeted ESLint passed for the modified admin product forms, admin product
  APIs, and product gallery.
- All seven downloaded PNGs were opened and visually verified.
- A production build was not attempted because static generation can require
  the configured database, which was unreachable, and no development server
  process was touched.

### Next Step
Restore working Neon access (or sign in to the Neon Console), run a fresh
read-only guarded inventory, then execute the authorized reset, deploy the
pending additive migration, import the archived showcase, and verify exact
post-reset counts before making any product sellable.

---

## Session 49

Date: 2026-08-05

### Objective and Boundaries
Resume the authorized reset through the owner's signed-in Neon Console, apply
the pending additive migration, and create the official Pitch Black showcase.
The development server was not started or stopped. Nothing was deployed,
staged, committed, or pushed.

### Guarded Reset
- A fresh read-only Console inventory confirmed `neondb`, schema `public`, role
  `neondb_owner`, the confirmed admin ID with `ADMIN` role and newsletter opt-in,
  and 17 complete migrations.
- The live deletion scope was recalculated to 273 disposable rows: 79 orders,
  80 order items, 9 order-email deliveries, 4 customer users, 16 products, 39
  variants, 6 product types, 9 product fields, 4 categories, 15 category links,
  4 newsletter posts, 4 newsletter deliveries, 2 expenses, and 2 promo codes.
  Addresses were already empty.
- The exact revised scope, dependency order, rollback boundaries, and
  post-reset plan were shown before execution.
- One locked transaction guarded the target, admin, counts, and migration
  state; explicitly deleted child rows before parents; verified every
  disposable table was empty; reverified the sole admin and all migrations;
  and committed. Neon reported every expected delete count and successful
  guard/commit statements.

### Migration and Showcase Import
- Applied `20260805000000_add_product_variant_description` in a guarded
  transaction and recorded its exact SHA-256 checksum in Prisma's migration
  ledger. Neon now has 18 complete migrations and zero incomplete/rolled-back
  entries.
- Imported one `Pokémon TCG Set` product type, one `Pokemon English` category,
  one archived `Mega Evolution—Pitch Black` product, one category link, and
  five variants: Pokémon Center Elite Trainer Box, Elite Trainer Box, Booster
  Bundle, Booster Display, and Build & Battle Box.
- The product uses the approved shared set description. Each variant uses only
  its official contents as the variant description. Category, set, and variant
  image paths point to the official repository-owned PNGs downloaded from the
  Pokémon TCG expansion page.
- Every variant intentionally has price `0`, stock `0`, and no SKU. The product
  remains archived so the placeholder commercial data cannot reach customer
  storefront, checkout, or sitemap surfaces.

### Post-Reset Verification
- Users: 1 admin, 0 customers.
- Orders, order items, and order-email deliveries: 0 each.
- Migrations: 18 complete, 0 incomplete.
- Product types: 1; product fields: 0; categories: 1; category links: 1;
  products: 1 archived; variants: 5 described, 5 zero-stock.
- A joined record check confirmed the category/set slugs, archived flag, all
  five format names, zero prices/stocks, and every local category/product/
  variant image path.

### Next Step
The owner supplies Singapore price, stock, and optional SKU for each format.
Update those five variants, review the set in both themes/responsive layouts,
then unarchive only after explicit owner approval. The separately requested
storefront professionalism pass remains the next broader scope before choosing
the production payment direction.

---

## Session 50

Date: 2026-08-05

### Objective and Boundaries
Add owner-supplied temporary review prices and stock to the five Pitch Black
formats without deploying or making the not-yet-deployed image paths public.
No source code, schema, migration, development-server process, deployment,
staging state, commit, or push changed.

### Database Update
- A guarded transaction confirmed `neondb`/`public`, `neondb_owner`, the sole
  confirmed admin, 18 complete migrations, the archived Pitch Black product,
  exactly five expected formats, and the prior `0/0` placeholder values.
- Updated Pokémon Center Elite Trainer Box to S$300 with stock 3.
- Updated Elite Trainer Box to S$150 with stock 2.
- Updated Booster Bundle to S$60 with stock 10.
- Updated Booster Display to S$300 with stock 2.
- Updated Build & Battle Box to S$40 with stock 3.
- Post-update assertions matched every format and committed. The product
  remains archived, so these positive-stock review values cannot reach the
  storefront before the local code and official images are deployed.

### Next Step
The owner pushes the prepared code/migration/assets and waits for the Vercel
deployment. Verify the deployed admin record and static image URLs, then
unarchive the set only when the owner explicitly requests the public storefront
review.

---

## Session 51

Date: 2026-08-05

### Objective and Boundaries
Correct the cramped, blurred `Pokemon English` category presentation after the
owner manually unarchived and reviewed the Pitch Black showcase. No database,
schema, migration, dependency, development-server process, deployment, staging
state, commit, or push was changed.

### Storefront Fix
- Measured the deployed category card and confirmed that the small official
  Pokémon TCG logo was being stretched with `object-cover` across an
  approximately 386-by-289-pixel card, cropping and blurring its lettering.
- Replaced the full-bleed category image treatment with a restrained contained
  logo on a crisp CSS gradient in the shared category card.
- Reworked the category-detail hero so the logo occupies its own contained
  artwork area instead of being enlarged behind the heading and description.
- Removed upward category-card hover translation because the horizontal
  homepage carousel can clip content that crosses its top edge. The gold border
  and elevated shadow remain as the hover affordance.
- Standardized the category logo's responsive image hint to its actual
  165-pixel rendered width. Recommended future category artwork is a 1200-by-630
  PNG or WebP with the logo centred and generous transparent/quiet padding.
- The owner then supplied a 1024-by-1024 full category artwork. Replaced
  `pokemon-english.png` with that image and changed both category surfaces from
  a small contained-logo layout to a larger, responsive `object-cover` artwork
  treatment. The high-resolution square source keeps the centred wordmark clear
  across the 4:3 card and the dedicated category-hero image panel.
- Product/set and variant imagery, catalogue data, prices, and stock were not
  changed.

### Verification
- Targeted ESLint passed for the category card and category page.
- TypeScript `--noEmit` passed.
- The existing production presentation and rendered image dimensions were
  inspected before the fix. Post-fix deployed visual verification remains for
  the owner after the local changes are pushed and Vercel finishes deploying.

---

## Session 52

Date: 2026-08-05

### Objective and Boundaries
Build a temporary customer-facing `Pokemon English` mock catalogue through the
Mega Evolution series, using owner-supplied prices, random stock from 1 through
10, official product imagery, and product contents as each format description.
The development server was not started or stopped. Nothing was deployed,
staged, committed, or pushed, and no schema or migration changed.

### Catalogue Scope
- Repriced all five existing Pitch Black formats: Pokémon Center ETB S$200/6,
  ETB S$100/4, Booster Bundle S$46/9, Booster Display S$250/3, and Build &
  Battle Box S$42/7.
- Added six set products and 40 formats: 30th Celebration (14), Mega Evolution
  (5), Phantasmal Flames (5), Ascended Heroes (6), Perfect Order (5), and
  Chaos Rising (5).
- All 45 formats have owner-approved prices, stock from 1 through 10, factual
  contents, and a local image path. The seven sets are unarchived.
- Stopped at Mega Evolution as requested; no Scarlet & Violet set was imported.

### Official Assets and Import
- Read the official Pokémon expansion pages and the official 30th Celebration
  product showcase. No AI-generated product image was used.
- Added 6 official set logos and 40 official sealed-product images. The 14
  2000-by-1125 30th Celebration packshots were losslessly sourced, then encoded
  as 1600-by-900 quality-90 WebP files to reduce their combined repository size
  from roughly 32 MB to 3.5 MB without changing their artwork.
- Added `scripts/import-mock-pokemon-catalogue.mjs`, a repeatable guarded import
  that records the approved data and validates its database boundary.

### Database Transaction and Verification
- The serializable transaction took an advisory lock and guarded `neondb`,
  schema `public`, the sole admin, 18 completed migrations with none incomplete,
  the existing category/template product, exact Pitch Black variants, and the
  absence of all six new slugs.
- Updated only five Pitch Black variant price/stock pairs; inserted exactly six
  products, six category links, and 40 variants; and deleted nothing.
- Post-commit verification confirmed 1 admin, 0 customers, 0 orders, 0 order
  items, 0 order-email deliveries, 18 complete migrations, 0 incomplete
  migrations, 7 unarchived sets, and 45 variants. Every variant has a positive
  price, stock from 1 through 10, contents, and an image path.
- All 46 newly downloaded images passed file/dimension validation, and samples
  covering set logos, PNG packshots, and optimized WebP packshots passed visual
  inspection.

### Next Step
The new database rows are already unarchived, while their repository-owned
images and category presentation changes remain local. The owner must push and
wait for deployment before conducting final desktop/mobile storefront review;
until then the newly referenced production image URLs are not deployed.

---

## Session 53

Date: 2026-08-06

### Objective
Fix several storefront bugs related to product display, search results, and dark mode theme contrast that were undermining the premium user experience.

### Completed
- **Variant-Centric Catalogue:** Reworked the main product listings (`/products`) and search results (`/search`) to display each individual product format as a distinct, purchasable item. This provides a clearer, more direct shopping experience than the previous model, which grouped all formats under a single product card.
- **New Component:** Created `app/components/VariantCard.tsx` to support the new variant-centric display. This card shows a single format with its specific image, name, and price, and links directly to the product page with that format pre-selected.
- **Product Page Variant Fix:** Corrected a critical bug on the product detail page (`/product/[slug]`) where every product incorrectly displayed the "Pitch Black" set's variants. The data fetching logic was fixed to use the `slug` from the URL, ensuring the correct product and its unique variants are shown.
- **Expanded Search Scope:** Improved the main search bar and the "All Products" filter to include variant format names (e.g., "Booster Bundle", "Elite Trainer Box") in the search. The Prisma queries were updated to search the `combination` JSON field on `ProductVariant`, making search results much more accurate.
- **Dark Mode Contrast:** Adjusted the "Collector Midnight" dark theme tokens in `app/globals.css`. The main background color (`--color-background`) was made slightly lighter to create a clear, subtle visual distinction from the header and footer, which use the deeper `--color-ink` token.
- **UI Text Clarification:** Updated the eyebrow heading on the search results page from "Catalogue search" to "Product search" to more accurately reflect its function.

### Files Modified
- `app/products/page.tsx` — Rewired to query and display `ProductVariant`s using the new `VariantCard`.
- `app/search/page.tsx` — Rewired to query and display `ProductVariant`s using `VariantCard`; updated heading text.
- `app/api/search/suggestions/route.ts` — Updated to search and return individual variants with variant-specific names and prices.
- `app/globals.css` — Adjusted dark theme color tokens for better contrast.
- `app/components/VariantCard.tsx` — New component created for the variant-centric display.

### Bugs Found
- Product pages were not using the URL slug to fetch data, causing all pages to show the same variants.
- Search queries did not include variant format names, leading to incomplete or missing results.
- The "All Products" page and search results were displaying grouped products instead of individual, purchasable variants.
- Dark mode header and footer were visually indistinguishable from the main page background.

### Bugs Fixed
- All of the above were resolved within the session.

### Technical Decisions
- **Shift to Variant-Centric Display:** The storefront now presents a flattened list of individual product variants instead of grouping them under a parent product. This is a more intuitive e-commerce pattern that lets customers see and select specific formats directly from catalogue pages.
- **Expanded Search to JSON Field:** Search functionality now directly queries the `combination` JSON field on `ProductVariant` for format names. This is more robust than relying on string matching in the description and provides more accurate results for users searching for specific product formats.

### Lessons Learned
- When a core data model assumption changes (from product-grouped to variant-centric), it's crucial to audit every customer-facing surface that displays that data (product lists, search results, search suggestions) to ensure a consistent experience.
- UI text, even if small, sets user expectations. "Catalogue search" vs. "Product search" created confusion that a simple text change could resolve.

### Outstanding Issues
- The product detail page (`/product/[slug]`) should be updated to automatically select the variant specified in the URL's `?format=` query parameter, completing the user flow from the new `VariantCard`.

### Recommended Next Task
Update the product detail page to read the `format` query parameter and pre-select the corresponding variant on page load.
