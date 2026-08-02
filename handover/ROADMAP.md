# ROADMAP.md

## MVP Cutline
Phases 0–5 = shippable store (real products, real payments, real order fulfillment). Phases 6–7 are differentiators to layer on after the core commerce loop is validated.

---

## Phase 0 — Project Setup ✅ COMPLETE
## Phase 1 — Data Model & Auth ✅ COMPLETE
## Phase 2 — Admin Panel ✅ COMPLETE
## Phase 3 — Public Storefront ✅ COMPLETE
## Phase 4 — Cart, Checkout & HitPay ✅ COMPLETE FOR MVP
## Phase 5 — Order Fulfillment ✅ COMPLETE FOR MVP

(Unchanged from prior sessions — see previous ROADMAP.md revisions and
SESSION_LOG.md Sessions 1–9 for full history of these phases.)

---

## Phase 6 — Search & AI Shopping Assistant (IN PROGRESS — search complete, AI still fully deferred)

- [x] Full-text search on storefront (Prisma-based, no Meilisearch)
- [ ] AI natural language search — unstarted, untouched since Session 10
- [ ] AI Shopping Assistant chat UI — unstarted
- [ ] Function/tool calling against real product API — unstarted
- [ ] AI Memory / preferences settings page — unstarted

No change this session. Still explicitly deferred, not abandoned.
Any legal/privacy requirements for a future AI feature are owner/lawyer-managed;
engineering scope is limited to technical access controls and data security.

---

## Phase 7 — Homepage Builder, Theme & CMS (IN PROGRESS — theming and coupon codes complete, rest unstarted)

- [ ] Homepage Builder: drag-and-drop section reordering — **unstarted**. Homepage remains a hardcoded composition in `app/page.tsx`.
- [ ] Per-section config (data source, layout, padding, animation) — **unstarted**
- [x] **Theme Builder — the visual result is complete, the "builder" is not (2026-07-22).** A full, real design system was implemented site-wide (storefront + entire admin panel) against three admin-supplied brand documents (VISION.md, DESIGN_SYSTEM.md, UI_PATTERNS.md): Tailwind v4 CSS-first tokens for color/typography/spacing/shadow/radius, Geist as the site's sole typeface, `lucide-react` icons, shared UI primitives (`Button`/`Badge`/`Card`/`MetricCard`), and consistent motion (`ScrollReveal.tsx`, hover states) throughout. **This is not yet admin-editable** — colors/fonts/spacing live as hardcoded CSS custom properties in `globals.css`, not a database-backed settings UI. If "Theme Builder" is meant literally (an admin can change the palette without a code deploy), that remains unbuilt.
- [x] **Dark mode / light mode toggle — COMPLETE (2026-07-22).** Collector Midnight palette selected via Visualizer; header sun/moon button; OS preference on first visit; manual override persisted in `localStorage`; pre-paint `data-theme` initialization avoids flashing and hydration mismatch. No new dependency.
- [x] **CMS pages — partial (2026-07-22).** Built: global `Footer.tsx`, `/faq` (real content), `/about`, `/contact` (both finalized by the admin directly). **Deliberately not built, by explicit admin decision, not deferral:** Terms & Conditions, Shipping, Returns, Help Center. No `CMSPage` database model exists — all pages built are hand-written, hardcoded Next.js pages, not a CMS-backed system.
- [x] **Promotions: coupon codes — COMPLETE (2026-07-22).** `PromoCode` model, full admin CRUD (`/admin/promo-codes`), checkout integration (live preview + real application), whole-order-only scope (no product/category targeting), percentage or fixed-amount discount with optional minimum-order and maximum-discount-cap fields, single-use-until-admin-reactivates lifecycle. Deliberately scoped narrower than a general marketing-coupon system — see DECISIONS.md 2026-07-22 for full reasoning. Discount is applied before GST calculation; GST itself was made fully conditional in the same pass (`GST_ENABLED`, since the store is not currently GST-registered) — see `lib/gst.ts` and DECISIONS.md.
- [ ] Promotions: flash sale scheduling — **unstarted, unscoped**
- [ ] Promotions: bundle pricing — **unstarted, unscoped**

**Also added this session, not originally part of Phase 7's scope:**
- Admin Dashboard Summary (`/admin`) — real revenue/expense/profit tracking, `recharts`-powered charts (Revenue Trend, New Customers, Delivery vs. Self-Collection split, Top 5 Products), and — once Promotions landed — Total Discounts Given / Discount Codes Used metrics.
- Expense tracking (`/admin/expenses`) — a flat, deliberately relation-free cost log the admin manages by hand, feeding the dashboard's Profit calculation.

**Completed (2026-07-28):** Newsletter preference wiring is account-only
single opt-in. Signed-out visitors authenticate through Clerk; authenticated
users can subscribe/unsubscribe through `/api/newsletter`, with current state
and consent timestamps stored on `User`. The admin can create/edit/preview
drafts at `/admin/newsletters`, include an image path or hosted image URL, and
manually broadcast only after confirming. Per-recipient delivery records
support safe retry without intentionally resending successful deliveries.

---

## Premium Storefront Redesign (ACTIVE — GATED MILESTONES)

- [x] **Milestone 1 — Storefront identity and homepage (2026-07-28).**
      Premium customer header/navigation, PokeSunshineTCG animated landing
      with the admin-supplied logo and tagline, asymmetric collection
      presentation, featured-arrival spotlight, richer product cards,
      simplified store promises, newsletter treatment, multi-column footer,
      stable ink surface tokens, and responsive mobile navigation.
- [x] **Review Gate 1 — final visual direction.** The 2026-07-29 refinement
      pass added real `/categories` and `/products` destinations, an accessible
      standardized category carousel, eight-card New arrivals grid, separate
      email senders, enhanced reduced-motion-safe logo animation, Back controls
      on both catalogue indexes, and a simpler homepage without the promise
      strip. Admin
      approved light mode, Collector Midnight, desktop/mobile density,
      carousel interaction, filters, and motion.
- [x] **Milestone 2 — catalogue model confirmation (2026-07-29).** The admin
      deliberately retained the existing flat model: categories are TCG lines
      such as Pokemon English, Pokemon Japanese, and Riftbound English; each
      product is a set; purchasable formats are variants. No hierarchy,
      migration, admin-field, or nested-route work is required.
- [x] **Review Gate 2 — navigation and content model.** The admin confirmed
      Category -> Product/Set -> Variant/Format and confirmed that adding a
      format through the existing combination editor is sufficiently simple.
- [x] **Milestone 3 — collection and product merchandising (2026-07-29).** Premium set
      landing pages, filters, result counts, product gallery/purchase-panel
      improvements, related products, and responsive/dark-mode polish are
      implemented and have passed automated and browser self-review.
- [x] **Review Gate 3 — commerce experience.** Admin approved the
      representative category, set, product, and cart journey.
- [x] **Milestone 4 — cart/checkout consistency, SEO alignment, and QA
      implementation (2026-07-29).** Cart, checkout, checkout status, search,
      and customer order surfaces are aligned with both themes. Canonical and
      social metadata, a database-backed sitemap, flat-catalogue
      Product/BreadcrumbList data, focused accessibility improvements,
      self-hosted fonts, image loading, and Next 16 build cleanup are complete.
      Targeted lint, route types, TypeScript, and the 43-route production build
      pass.
- [ ] **Review Gate 4 — launch-readiness visual/interaction review.** Admin
      checks cart, checkout, search, order history/receipt, responsive layout,
      both themes, `/sitemap.xml`, and representative page metadata using the
      user-run local server.

---

## Phase 8 — Performance, SEO, Accessibility, Technical Security

- [x] ISR/SSR strategy confirmed per page type — **verified 2026-08-01.**
      Public catalogue pages inherit a 60-second route revalidation fallback;
      authenticated and mutation routes remain dynamic. Production cache and
      prerender headers were observed during the launch audit.
- [ ] Image optimization via Next.js Image — **in progress (2026-07-23).**
      Product cards, product detail, search suggestions, and cart thumbnails
      share `CatalogImage`: repository-local paths use Next.js `Image`, with
      a temporary native fallback for remote URLs in the disposable test
      database. Product presentation is standardized to a square source/display
      canvas with `object-contain`; homepage category icons use square artwork
      in uniform 3:2 `object-cover` tiles. Product create/edit both verify the
      required main image and optional variant filenames before submission.
      Category create/edit now verify required local icon filenames; the
      incompatible wide category-detail banner was removed. The local hero
      poster now uses Next.js Image and correctly replaces the video for
      reduced-motion users. Only post-database-reset removal of the legacy
      remote branch remains.
- [ ] CDN caching headers
- [x] Structured data (Product, BreadcrumbList schema.org) — **complete
      (2026-07-23).** Product detail pages expose absolute URLs, images, and
      per-variant SGD offers with optional SKUs and stock-derived
      availability. Product and category detail routes expose breadcrumb
      trails. JSON-LD serialization escapes `<` so admin-managed catalog text
      cannot break out of the script payload.
- [x] OpenGraph + Twitter Card meta tags — root defaults plus category/product
      overrides added in Milestone 4
- [x] XML sitemap generation — hourly database-backed `/sitemap.xml` containing
      public content, non-empty categories, and non-archived products
- [x] Canonical URLs — public content/catalogue routes complete; product-list
      filters and pagination canonicalize to the base catalogue route
- [ ] WCAG AA audit (axe / Lighthouse) — focused code review and remediation
      completed for skip navigation, focus visibility, search announcements,
      mobile-menu Escape behaviour, checkout labels, quantity controls, and
      order tables; formal automated/assistive-technology audit remains
- [ ] Keyboard navigation test through checkout — code-level control audit
      passed; interactive test remains at Review Gate 4
- [ ] Screen reader test through checkout
- [ ] Audit logging on all admin actions
- [x] Confirmed: no raw card data touches own servers — **verified by the
      2026-08-01 technical audit.** The current integration creates a hosted
      HitPay PayNow request and contains no card-number/CVV/expiry fields.
- [x] Non-destructive technical launch audit — **complete 2026-08-01.** See
      `handover/LAUNCH_AUDIT.md`; current decision is NO-GO pending the listed
      High-severity remediations and Phase 2 interactive checks.
- [ ] Remediate and retest the approved technical launch-audit batches.
      - [x] Batch 1: Next.js and `eslint-config-next` patched from 16.2.9 to
        16.2.11; Prisma generation, TypeScript, unchanged lint baseline,
        production build, advisory delta, Vercel deployment, and production
        storefront verification completed on 2026-08-02.
      - [x] Batch 2: atomic/idempotent terminal payment transitions, durable
        confirmation/failure email delivery, cron retry, and
        pre-reconciliation ownership validation are deployed. Prisma validation,
        TypeScript, targeted lint, and production build pass. The additive Neon
        migration was applied successfully and production commit `3f810bc` is
        Ready. Completed payment, real HitPay expiry, order confirmation/failure
        email delivery, newsletter delivery, and a two-request production
        reconciliation race passed on 2026-08-02 with exactly-once stock and
        email side effects. Checkout-success isolation also passed with a
        non-owner not-found response, normal owner rendering, and no order or
        email-delivery mutation. The owner confirmed inbox receipt of both
        failure emails and the newsletter test. HitPay's official declined
        sandbox card left its online payment request `Unpaid` and emitted no
        webhook, and the dashboard exposes no replay control. The owner accepted
        this PayNow-only limitation: show payment failure and require a fresh
        checkout. PayNow expiry already exercises the shared failure branch.
      - [x] Batch 3: static browser security headers are deployed and verified.
        Targeted lint, TypeScript, Prisma generation, the 43-page production
        build, generated route-manifest inspection, all five live response
        headers, retained ISR caching, customer/admin authorization, product
        images, themes, populated cart, checkout rates/totals, and browser CSP
        monitoring passed on 2026-08-02. Repeat the auth/CSP check when the owner
        replaces the Clerk development instance with production credentials.
      - [x] Batch 4: the approved WCAG AA contrast remediation is deployed and
        verified. The final computed production scan passed on homepage,
        catalogue, product detail, cart, checkout, account/orders, and admin in
        both themes. Ink-section labels pass at `10.62:1`/`12.03:1`, the two
        automated out-of-stock badge flags were confirmed as `oklab()` parsing
        false positives with `12.01:1` worst-case composited contrast, and the
        theme-aware admin chart axes, series, and legends pass.
      - [ ] Batch 5: independent technical cleanup is implemented locally.
        Added the metadata `/robots.txt`, corrected the empty-cart `h1`,
        redacted raw HitPay failure logging, set the explicit Turbopack root,
        and resolved all 43 ESLint findings without suppressions. ESLint,
        TypeScript, Prisma generation, and the 44-route build pass. Dependency
        remediation and admin audit-log designs are documented without package
        or schema changes. Deployment and live verification remain.

Legal wording, legal policies, and PDPA coverage are permanently outside the
engineering roadmap unless the owner explicitly changes direction. They are
handled solely by the owner and their lawyer; technical findings are not legal
or PDPA compliance certification.

---

## Phase 9 — Launch

(Unchanged from Session 10's ROADMAP.md — custom domain connected ahead of
schedule, genuine production credentials and the rest of this phase remain
outstanding. No work done on this phase this session.)

### Final pre-live gate — explicit admin requirement

- [ ] Remind the admin to rotate/regenerate every deployment API key and
      secret before the final production deployment. Review Clerk, HitPay,
      Resend, Neon/PostgreSQL, cron/webhook secrets, and every other populated
      deployment secret; update local and hosting environments without
      recording secret values in source control.
- [ ] After a separate explicit confirmation, wipe the disposable Prisma
      catalogue, account/order, newsletter, promotion, and operational test
      data immediately before the real catalogue and live store are opened.
      This is destructive and must never be inferred from milestone approval.
- [ ] Regenerate/reseed only the production data the admin explicitly approves,
      then run one final production smoke test before announcing the site live.

---

## Future Features (Post-Launch)

(Unchanged from Session 10's ROADMAP.md — AR Preview, Virtual Try-On,
Subscriptions, Marketplace, Live Shopping, Loyalty/Referral, Gift
Registry/Cards, POS, regional expansion, Headless API, multi-language,
A/B testing, paid self-collection, admin-editable pickup address, bulk
order actions, Meilisearch, Product Type reassignment — all still
explicitly available to revisit later, none rejected forever.)
