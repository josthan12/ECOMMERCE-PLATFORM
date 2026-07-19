# ROADMAP.md

## MVP Cutline
Phases 0–5 = shippable store (real products, real payments, real order fulfillment). Phases 6–7 are differentiators to layer on after the core commerce loop is validated.

---

## Phase 0 — Project Setup ✅ COMPLETE

- [x] Next.js (App Router) + TypeScript + TailwindCSS
- [x] GitHub repo connected
- [x] Vercel deployment (auto-deploy from main)
- [x] Neon PostgreSQL database provisioned
- [x] Prisma 7 initialized
- [x] ngrok set up for local webhook testing
- [x] HitPay sandbox account created
- [x] Environment variables documented

---

## Phase 1 — Data Model & Auth ✅ COMPLETE

- [x] Prisma schema: User, Address models
- [x] Role enum: CUSTOMER, STAFF, ADMIN
- [x] Clerk authentication integrated
- [x] Sign-in and sign-up pages
- [x] Clerk webhook → creates User row on signup
- [x] lib/prisma.ts singleton (Prisma 7 PrismaPg adapter)
- [x] Own account promoted to ADMIN

---

## Phase 2 — Admin Panel ✅ COMPLETE

- [x] Admin layout with role-based access protection
- [x] Admin dashboard shell with sidebar navigation
- [x] Product Type Builder (create types + custom fields)
- [x] Product Builder (dynamic form from type field definitions)
- [x] Products list page
- [x] API routes: /api/admin/product-types, /api/admin/products
- [x] ProductVariant schema added
- [x] Product Variant UI
- [x] Category Builder (create/edit categories with SEO + banner)
- [x] Category list page and API routes

**Phase 2 addendum (2026-07-17, well after this phase, outside original scope):** none of Categories, Products, or Product Types had any edit capability at all until this addendum — every one of them was create-and-list only, with Prisma Studio as the only way to fix a mistake. Closed as a genuine gap, not a deferred nice-to-have, once noticed mid-session:
- [x] Category — full edit (`PUT /api/admin/categories/[id]`) and real hard delete (`DELETE`). Slug locked after creation.
- [x] Product — full edit (`PUT /api/admin/products/[id]`), including non-destructive variant add/edit/remove. Archive, not hard delete (`PATCH /api/admin/products/[id]/archive`, `Product.archived`), modeled on Shopify's own archive-vs-delete distinction (researched, not guessed). `productTypeId` and `slug` both locked after creation.
- [x] Product Type — full edit (`PUT /api/admin/product-types/[id]`), including field add/edit/reorder. `ProductField.key` and `.type` locked once a field exists; removing a field blocked server-side if any product still holds data in it. **No delete, no type-reassignment feature — deliberate, permanent decision**, not deferred: `Product.productTypeId` is required with no cascade from `ProductType`, so safe deletion isn't structurally possible without a real reassignment feature, which was judged not worth building for an expected rare, low-volume need. See DECISIONS.md.

---

## Phase 3 — Public Storefront ✅ COMPLETE

- [x] Modular homepage section renderer
- [x] Section types: Hero Banner, Featured Products, Category Grid, Newsletter
- [x] Category page route (/category/[slug]) with filters + product grid
- [x] Product page route (/product/[slug]) with gallery + variant selector
- [x] Spec table rendered from product type field schema
- [x] Variant selector (drives image swap, price update)
- [x] Basic filtering and sorting on category pages

---

## Phase 4 — Cart, Checkout & HitPay ✅ COMPLETE FOR MVP
(One item deliberately deferred, one blocked externally — see checklist below and DECISIONS.md)

- [x] Cart state with Zustand (localStorage-persisted — deliberate choice over DB-backed for this stage)
- [x] GST calculation module (9% Singapore GST) — later extended in Phase 5 to also tax the shipping fee
- [x] HitPay Payment Request creation via REST API
- [x] HitPay hosted checkout integration (redirect-based)
- [x] Webhook endpoint: /api/webhooks/hitpay
- [x] HMAC signature verification on HitPay webhook
- [x] Order status: Pending Payment → Paid / Payment Failed
- [x] Order confirmation page (real breakdown + access control), cancellation messaging updated to instruct customers to refresh after completing payment via QR. **Extended 2026-07-17** with a verified, read-only confirmation view for unauthenticated visitors (common with QR payments completed on a different device than the one used to check out) — see DECISIONS.md.
- [x] Automatic background reconciliation for abandoned/expired orders — **RESOLVED 2026-07-15**. Originally deferred (2026-07-13), reversed after real usage confirmed the browser-Back-button gap was a genuine recurring problem, not a theoretical one. Implemented as a scheduled sweep (`/api/cron/reconcile-orders`, every 5 minutes via cron-job.org) rather than GitHub Actions/Vercel Cron — see DECISIONS.md (2026-07-15).
- [x] Custom branded order confirmation + payment-failed emails (Resend + React Email) — HitPay's built-in receipt retained as a secondary receipt
- [x] Test: PayNow QR flow (sandbox) — including abandonment/expiry path, fully verified
- [ ] Test: Card flow (sandbox) — blocked, requires bank account setup on HitPay account
- [~] Test: Failed payment flow (sandbox) — `expired` path fully verified; `failed` status specifically not directly observed but shares identical code
- [ ] Test: Webhook retry behavior — not explicitly tested; idempotency guard in place by design
- [x] **(Added in Phase 5 session)** Fulfillment method selection at checkout (Delivery / Self Collection), flat shipping fee, GST applied to shipping — see Phase 5 below and DECISIONS.md (2026-07-14)
- [x] **Full production deployment to Vercel (2026-07-15), verified end-to-end (2026-07-17)** — custom domain (`biggyballs69.gay`) connected, `NEXT_PUBLIC_APP_URL` updated, full successful payment path re-tested on the live domain, all env vars and both webhook registrations (Clerk + HitPay, ngrok + Vercel) confirmed.

---

## Phase 5 — Order Fulfillment ✅ COMPLETE FOR MVP
(Several items dropped by deliberate decision, one deferred — see DECISIONS.md 2026-07-14)

- [x] Orders queue: list/filter/sort by status
- [~] Bulk actions (mark packed, bulk export) — **deliberately deferred**, not built. Genuinely not needed at current order volume; revisit if that changes.
- [x] Order detail page: customer info, items, payment status, status timeline
- [x] Status lifecycle: branched by fulfillment method —
      Delivery: Pending → Paid → Processing → Packed → Shipped → Delivered → Completed
      Self Collection: Pending → Paid → Processing → Packed → Completed (skips Shipped/Delivered)
- [ ] ~~First courier API integration (Ninja Van or Qxpress)~~ — **dropped**. Admin self-fulfills shipping and prints own labels.
- [ ] ~~Generate shipping label action~~ — **dropped**, same reasoning as above.
- [x] Manual tracking number — now the *only* tracking mechanism (not a "fallback" as originally scoped, since no courier API exists to fall back from)
- [ ] ~~Courier status sync (webhook/polling)~~ — **dropped**, no courier API exists to sync with.
- [x] Customer notifications on status change (email) — Shipped notification (delivery) and Ready-for-Collection notification (self-collection), both via Resend/React Email, following the Phase 4 email pattern
- [ ] ~~Returns: admin approval flow~~ — **dropped entirely**. Folded into the same manual refund process below; not a separate feature.
- [x] Refunds — **manual record-keeping only**. No HitPay Refund API integration (deliberately rejected — see DECISIONS.md), no automatic stock restoration (deliberately rejected). Admin marks an order "Refunded" after handling the actual refund entirely outside the app.
- [x] Customer-facing order tracking in My Account — `/account/orders` + `/account/orders/[id]`

**Also added this phase, outside original scope:** self-collection as a checkout-time fulfillment option (with its own flat fee, defaulting to free), and a pickup-location display (hardcoded constant, not DB-managed).

---

## Phase 6 — Search & AI Shopping Assistant (IN PROGRESS — search complete, AI deliberately deferred)

- [ ] ~~Meilisearch provisioned and product indexing wired~~ — **skipped by deliberate decision (2026-07-17).** Typo tolerance was confirmed not required for this store; Meilisearch's core value over plain Postgres search is exactly that (plus relevance ranking/faceting at scale), so it was judged pure infrastructure overhead — a new external service, plus either a recurring hosted cost or a new persistent server to self-host and maintain — with no corresponding benefit at this store's size. Revisit if catalog size grows significantly or a typo-tolerance requirement emerges. See DECISIONS.md.
- [x] Full-text search on storefront — **built without typo tolerance**, by deliberate choice (re-worded from the original "Typo-tolerant" framing to match what was actually decided and built — see DECISIONS.md, 2026-07-17). Prisma-based case-insensitive `contains` match on `Product.name`/`description`, filtered to exclude archived products. Includes: `/search` results page, a shared `ProductCard` component (extracted from the category page and `FeaturedProducts`), and a debounced (300ms) live-suggestion dropdown in the header (`SearchBar.tsx` + `/api/search/suggestions`, showing image/name/category/price, capped at 6 results).
- [ ] AI natural language search (LLM extracts filters → queries — architecture direction already decided as tool-calling against Prisma directly, not Meilisearch, consistent with the decision above; nothing built yet)
- [ ] AI Shopping Assistant chat UI
- [ ] Function/tool calling against real product API (no hallucinated products)
- [ ] PDPA consent flow before AI accesses personal data
- [ ] AI Memory: long-term preferences stored post-consent
- [ ] Settings page: view/edit/delete AI preferences

---

## Phase 7 — Homepage Builder, Theme & CMS

- [ ] Homepage Builder: drag-and-drop section reordering
- [ ] Per-section config (data source, layout, padding, animation)
- [ ] Theme Builder: color/typography/spacing via CSS variables
- [ ] Dark mode / light mode toggle
- [ ] CMS pages: About, FAQ, Terms, Privacy (PDPA), Returns, Shipping
- [ ] Promotions: coupon codes
- [ ] Promotions: flash sale scheduling
- [ ] Promotions: bundle pricing

**Note (2026-07-17):** storefront and admin styling was called out again this session as genuinely "ugly," with meaningfully more surface area now built on the bare-Tailwind baseline (search UI, product cards, several new admin edit forms) since this was last raised. Worth deciding at the start of the next session whether to do all of Phase 7 as originally scoped, or split out a smaller, faster "real theme pass" (just the Theme Builder / visual polish, without the drag-and-drop builder or CMS/promotions) ahead of finishing Phase 6's AI assistant. See NEXT_TASK.md.

---

## Phase 8 — Performance, SEO, Accessibility, Compliance

- [ ] ISR/SSR strategy confirmed per page type
- [ ] Image optimization via Next.js Image
- [ ] CDN caching headers
- [ ] Structured data (Product, BreadcrumbList schema.org)
- [ ] OpenGraph + Twitter Card meta tags
- [ ] XML sitemap generation
- [ ] Canonical URLs
- [ ] WCAG AA audit (axe / Lighthouse)
- [ ] Keyboard navigation test through checkout
- [ ] Screen reader test through checkout
- [ ] PDPA: consent, export, deletion verified end-to-end
- [ ] Audit logging on all admin actions
- [ ] Confirmed: no raw card data touches own servers

---

## Phase 9 — Launch

- [ ] HitPay switched to live keys (production only)
- [ ] Live courier API credentials — **note: no longer applicable per Phase 5 decision to self-fulfill shipping; remove or replace with "own shipping process finalized" if this item is revisited**
- [ ] DNS + SSL + domain cutover on Vercel — **partially done ahead of schedule (2026-07-17):** custom domain (`biggyballs69.gay`) is connected and SSL is live, motivated by an email-deliverability fix found mid-session rather than by reaching this phase in order. Genuine production credentials (separate Clerk prod instance, separate Neon prod branch, live HitPay keys) remain outstanding, still explicitly this phase's scope.
- [ ] Error tracking (Sentry)
- [ ] Uptime monitoring
- [ ] Alert on HitPay webhook failures specifically
- [ ] Soft launch: handful of real orders end-to-end
- [ ] Full loop verified: payment → fulfillment → delivery → customer tracking

---

## Future Features (Post-Launch)

- AR Product Preview
- Virtual Try-On
- Subscription Products (HitPay recurring billing)
- Marketplace / Multi-vendor support
- Live Shopping Streams
- Loyalty Program + Referral System
- Gift Registry + Gift Cards
- In-person POS (HitPay POS terminal)
- Regional expansion (Malaysia, Philippines — HitPay already supports)
- Headless API (REST + GraphQL)
- Webhooks + plugin system
- Multi-language (Simplified Chinese, Malay, Tamil)
- A/B testing for layouts and promotions
- Self-collection: paid fee (currently free but config-driven, ready to flip)
- Self-collection pickup address: move from hardcoded constant to admin-editable DB setting, if it ever needs to change more than rarely
- Bulk order actions (mark packed in bulk, CSV export) — deferred from Phase 5
- Meilisearch — revisit if catalog size or a typo-tolerance requirement makes plain Postgres search insufficient (deferred 2026-07-17, see DECISIONS.md)
- Product Type reassignment — a real feature for moving an existing product to a different type with proper attribute field-mapping, if this is ever needed more than rarely (deferred 2026-07-17, see DECISIONS.md)