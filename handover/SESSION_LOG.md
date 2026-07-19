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