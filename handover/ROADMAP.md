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
- [x] Order confirmation page (real breakdown + access control), cancellation messaging updated to instruct customers to refresh after completing payment via QR
- [~] Automatic background reconciliation for abandoned/expired orders (Vercel Cron) — **deliberately deferred**, not planned for MVP; current lazy/page-load reconciliation only resolves an order if someone revisits its confirmation page. See DECISIONS.md (2026-07-13). Mitigated via clearer cancellation-page messaging instead. Revisit via GitHub Actions scheduled workflow if this becomes a real problem post-launch.
- [x] Custom branded order confirmation + payment-failed emails (Resend + React Email) — HitPay's built-in receipt retained as a secondary receipt
- [x] Test: PayNow QR flow (sandbox) — including abandonment/expiry path, fully verified
- [ ] Test: Card flow (sandbox) — blocked, requires bank account setup on HitPay account
- [~] Test: Failed payment flow (sandbox) — `expired` path fully verified; `failed` status specifically not directly observed but shares identical code
- [ ] Test: Webhook retry behavior — not explicitly tested; idempotency guard in place by design
- [x] **(Added in Phase 5 session)** Fulfillment method selection at checkout (Delivery / Self Collection), flat shipping fee, GST applied to shipping — see Phase 5 below and DECISIONS.md (2026-07-14)

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

## Phase 6 — Search & AI Shopping Assistant

- [ ] Meilisearch provisioned and product indexing wired
- [ ] Typo-tolerant full-text search on storefront
- [ ] AI natural language search (LLM extracts filters → queries search index)
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
- [ ] DNS + SSL + domain cutover on Vercel
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