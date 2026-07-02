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

## Phase 2 — Admin Panel 🔄 IN PROGRESS

- [x] Admin layout with role-based access protection
- [x] Admin dashboard shell with sidebar navigation
- [x] Product Type Builder (create types + custom fields)
- [x] Product Builder (dynamic form from type field definitions)
- [x] Products list page
- [x] API routes: /api/admin/product-types, /api/admin/products
- [x] ProductVariant schema added
- [x] Product Variant UI
- [ ] **Category Builder (create/edit categories with SEO + banner)** ← CURRENT TASK
- [ ] Category list page and API routes

---

## Phase 3 — Public Storefront

- [ ] Modular homepage section renderer
- [ ] Section types: Hero Banner, Featured Products, Category Grid, Newsletter
- [ ] Category page route (/category/[slug]) with filters + product grid
- [ ] Product page route (/product/[slug]) with gallery + variant selector
- [ ] Spec table rendered from product type field schema
- [ ] Variant selector (drives image swap, price update)
- [ ] Basic filtering and sorting on category pages

---

## Phase 4 — Cart, Checkout & HitPay

- [ ] Cart state with Zustand (persisted to DB on checkout start)
- [ ] GST calculation module (9% Singapore GST)
- [ ] HitPay Payment Request creation via REST API
- [ ] HitPay.JS / hosted checkout integration
- [ ] Webhook endpoint: /api/webhooks/hitpay
- [ ] HMAC signature verification on HitPay webhook
- [ ] Order status: Pending Payment → Paid / Payment Failed
- [ ] Order confirmation page + email notification
- [ ] Test: PayNow QR flow (sandbox)
- [ ] Test: Card flow (sandbox)
- [ ] Test: Failed payment flow (sandbox)
- [ ] Test: Webhook retry behavior

---

## Phase 5 — Order Fulfillment

- [ ] Orders queue: list/filter/sort by status
- [ ] Bulk actions (mark packed, bulk export)
- [ ] Order detail page: customer info, items, payment status, status timeline
- [ ] Status lifecycle: Pending → Paid → Processing → Packed → Shipped → Delivered → Completed
- [ ] First courier API integration (Ninja Van or Qxpress)
- [ ] Generate shipping label action
- [ ] Manual tracking number fallback
- [ ] Courier status sync (webhook/polling)
- [ ] Customer notifications on status change (email/SMS)
- [ ] Returns: admin approval flow
- [ ] Refunds: HitPay refund API tied to original transaction
- [ ] Customer-facing order tracking in My Account

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
- [ ] Live courier API credentials
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
