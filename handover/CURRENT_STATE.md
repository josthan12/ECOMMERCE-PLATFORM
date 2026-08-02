# CURRENT_STATE.md

## Current Phase
The premium storefront redesign is active as a gated milestone track.
Milestones 1 through 4 are implemented, and the catalogue model remains:
Category -> Product/Set -> Variant/Format. The proposed hierarchical catalogue
migration was cancelled in favour of this simpler existing model. Phase 8 now
has canonical metadata, social metadata, a dynamic sitemap, structured-data
alignment, and a focused accessibility/performance pass. A non-destructive
technical launch audit is complete; its High-severity remediation and formal
assistive-technology/operational verification remain open.

## Current Feature
Milestone 4 aligned cart, checkout, checkout status, search, and customer order
pages with the premium storefront and dark theme. It added canonical URLs,
OpenGraph/Twitter metadata, a database-backed sitemap, flat-catalogue
Product/BreadcrumbList data, skip/focus/search/navigation accessibility
improvements, above-the-fold image loading, self-hosted Geist, and the Next 16
Proxy convention.

## Current Objective
Continue the approved launch-audit remediation sequence. Payment Batch 2 is
complete with the owner-accepted HitPay limitation: declined online attempts
remain retryable/unpaid, so the customer is shown failure and starts checkout
again. The deployed payment-idempotency batch passed completed, real HitPay
expiry, and a two-call
concurrent reconciliation race on 2026-08-02. Each tested order reached one
terminal state, stock moved exactly once, and exactly one durable payment-email
row was created. The corrected production order sender delivered the new paid
order confirmation and both payment-failed emails; the newsletter sender also
completed a one-recipient test broadcast with a Resend provider ID. The old
$5 confirmation row remains failed at its five-attempt cap as intentional test
history. The additive `OrderEmailDelivery` migration is applied to Neon and
matching application commit `3f810bc` is Ready in Vercel production.
The current technical decision remains NO-GO: production uses a Clerk
development instance; monitoring is missing; and live color contrast has WCAG
AA failures. The browser-security-header batch is implemented locally and
passes lint, TypeScript, production build, and generated-manifest verification,
but still requires deployment plus authenticated production smoke testing.
Checkout-success owner/non-owner isolation passed in production on 2026-08-02.
The Next.js 16.2.11
production deployment, catalogue refresh, cart, sitemap, route protection,
canonical/structured data, build, and TypeScript checks passed. The database
reset remains paused until a later, separate explicit confirmation.

---

## Completed Features

* [x] Phase 0 — Project setup
* [x] Phase 1 — Data model & auth
* [x] Phase 2 — Admin panel (create/list/edit/delete/archive for Categories, Products, Product Types)
* [x] Phase 3 — Public storefront
* [x] Phase 4 — Cart, Checkout & HitPay (Complete for MVP)
* [x] Phase 5 — Order Fulfillment (Complete for MVP)
* [x] Phase 6 (partial) — Search (Prisma-based, no Meilisearch)
* [ ] Phase 6 (remaining) — AI Shopping Assistant. Still fully deferred,
      untouched since Session 10.
* [x] **Premium storefront redesign Milestone 1 (Session 23).** Reworked the
      customer shell and homepage into a restrained "collector archive"
      direction while retaining the existing cream/navy/gold palette and
      Collector Midnight theme. The global header now has a store-assurance
      strip, primary shopping navigation, compact responsive actions, search,
      and a mobile menu. The homepage now uses a catalogue-driven editorial
      hero, trust strip, asymmetric collection cards with live product counts,
      a featured-arrival spotlight plus supporting product cards, collector
      promise, account newsletter callout, and a multi-column footer. Added
      stable ink/on-ink tokens for premium dark surfaces in both themes. No
      database, API, admin, route, or dependency change was made.
* [x] **PokeSunshine landing and newsletter broadcasting (Session 24).**
      Replaced the generic collection-led hero with a responsive,
      reduced-motion-safe PokeSunshineTCG landing using the admin-supplied
      logo and “You are my sunshine.” tagline. Removed the trust-strip and
      badge/number-heavy homepage copy, added the approved headings and
      three promises, and reused the real logo in the header/footer. Added
      `/admin/newsletters` with draft create/edit/preview, optional lead
      image path/URL, subscriber count, explicit confirmed broadcast, and
      retryable per-recipient delivery records. Successful recipients are
      not resent on retry and customers who unsubscribe before delivery are
      skipped. Migration `20260728133000_add_newsletter_posts` was applied
      to Neon. No real broadcast was sent during implementation.
* [x] **Storefront refinement milestones (Session 25).** Added `/categories`
      and filterable/paginated `/products` index routes with metadata and
      BreadcrumbList data; routed Shop TCG and homepage calls to action to
      their real destinations; replaced the category mosaic with an accessible
      responsive three/two/one-card carousel; standardized New arrivals to at
      most eight equal product cards; split order and newsletter Resend sender
      configuration; and added restrained, viewport-aware mascot frame motion
      with complete reduced-motion fallbacks. Targeted lint, TypeScript, live
      route response checks, and repeated production builds passed. Browser
      visual QA was blocked by the in-app browser's localhost URL policy and
      remains an admin review item. The follow-up review added Back controls
      to both index routes and removed the three-promise homepage strip, its
      header/footer links, dead component, and associated styling.
* [x] **Premium merchandising Milestone 3 (Session 26).** Kept the approved
      flat Category -> Product/Set -> Variant/Format model. Category detail
      pages now use image-led collection heroes with set/format/availability
      totals, name search, sorting, stock filtering, and live result counts.
      Product detail pages now choose an in-stock format by default, expose a
      variant-aware image gallery, show format price and sold-out state inside
      the selector, provide accessible stepper quantity controls and clearer
      cart feedback, organize product details, and recommend up to four related
      sets from the same category. Targeted ESLint, TypeScript, and the
      production build passed. Browser review passed on desktop/mobile in both
      themes, including filtering, sold-out selection, quantity changes,
      add-to-cart, related sets, and zero console errors; the test cart item was
      removed afterward.
* [x] **Launch-readiness Milestone 4 (Session 27).** Reworked the cart,
      checkout, checkout-status, search, and customer order-history/receipt
      surfaces with the shared light/Collector Midnight design tokens and
      accessible controls. Added canonical URLs to public index/content/detail
      routes, default and per-route OpenGraph/Twitter metadata, noindex
      metadata for transactional/account/search routes, and an hourly
      database-backed sitemap containing public categories and non-archived
      products. Product/BreadcrumbList JSON-LD was revalidated against the
      approved flat catalogue and now includes the real Categories level (or
      All products fallback). Added a skip link, global focus-visible outline,
      labelled/live search feedback, Escape-close mobile navigation, and an
      accessible responsive order table. Main catalogue hero images load
      eagerly, the homepage LCP logo uses Next 16 `preload`, Geist is
      self-hosted for network-independent builds, and deprecated
      `middleware.ts` is now `proxy.ts`.
      Targeted ESLint, generated route types, TypeScript, and the production
      build passed for 43 routes. Whole-project ESLint still reports 42
      pre-existing errors and one warning in unrelated admin/API/email files.
* [x] **Review Gate 4 sitemap XML repair (Session 28).** Database-backed image
      URLs containing query parameters were emitted with raw ampersands, so
      browsers stopped parsing `/sitemap.xml` at the first affected
      `<image:loc>`. Sitemap URLs are now converted to XML-safe text before
      Next.js serializes them. The live endpoint returned 17 URL entries,
      parsed successfully as XML, and contained zero unescaped ampersands.
      Targeted ESLint and TypeScript passed.
* [x] **Disposable TCG catalogue preview import (Session 29).** Added one
      `TCG Set` product type, the `Pokemon English` category, eight set
      products, and 12 positive-stock variants from the admin's sample
      workbook. `NA` and zero-stock entries were omitted, `Ascended Heros`
      was corrected to `Ascended Heroes`, and existing placeholder images
      were reused. The import added 54 units of stock and was verified on the
      live category and Prismatic Evolution product pages. No application
      source, schema, migration, or dependency changed. The records remain
      disposable and are included in the later explicitly approved reset.
* [x] **Storefront catalogue cache refresh (Session 30).** Added a shared
      storefront revalidation helper and invoked it after successful product,
      category, and product-type mutations. The root route now uses a
      60-second ISR fallback, so imports or direct database changes that bypass
      the admin APIs still appear automatically. Admin mutations invalidate
      the cached route tree for refresh on its next visit. No database,
      migration, dependency, environment, or API-contract change was made.
      Targeted lint with the documented legacy `no-explicit-any` rule
      suppressed, TypeScript, Prisma generation, and the production build
      passed. The build reports a one-minute revalidation interval for the
      homepage and `/categories`.
* [x] **Phase 8 structured data (Session 20).** Product detail pages emit
      schema.org `Product` JSON-LD with absolute product/image URLs and
      per-variant SGD offers, SKUs when present, and stock-derived
      availability. Product and category pages emit `BreadcrumbList`
      JSON-LD; product breadcrumbs use the first category in deterministic
      name order when one is assigned. A shared serializer escapes `<` to
      prevent stored catalog text from becoming executable markup. No new
      dependency was added.
* [x] **Dark-mode cart indicator polish (Session 21).** Replaced the
      absolutely positioned item-count overlay with an inline count badge
      inside a compact cart pill. The badge now uses the dedicated
      `accent-foreground` contrast token, stays clear of the cart icon and
      label at every count width, and gives screen readers a complete
      singular/plural cart label.
* [x] **Dark-mode product variant contrast (Session 22).** Selected product
      option chips now use the solid accent surface with the contrasting
      `accent-foreground` text token instead of placing gold primary text on
      a light-gold background. Selected options also expose `aria-pressed`
      state.
* [x] **Production deployment verification, custom domain, checkout-success
      unauthenticated-visitor fix** — all closed as of Session 10.
* [x] **Full site-wide design system implemented (Session 11)** — built
      against three custom docs the admin supplied (VISION.md,
      DESIGN_SYSTEM.md, UI_PATTERNS.md) for a brand called "PokeSunshineTCG."
      Tailwind v4 CSS-first tokens (`@theme inline` in `globals.css`) for
      color/radius/shadow; **Geist** as the sole typeface (headline + body),
      switched from an initial Cormorant Garamond/Inter serif pairing after
      the admin explicitly wanted an "Apple-style" look — compared visually
      via the Visualizer tool before committing. `lucide-react` adopted
      as the icon library (admin-approved new dependency). Shared primitives:
      `app/components/ui/Button.tsx`, `Badge.tsx`, `Card.tsx`,
      `MetricCard.tsx`; `app/components/ScrollReveal.tsx` (IntersectionObserver
      fade-in, respects `prefers-reduced-motion`, no new dependency);
      `lib/cn.ts` (className helper, in place of installing `clsx`).
      Applied end-to-end: Header/Nav (sticky, blur, active-link nav),
      Homepage (Hero, FeaturedProducts, CategoryGrid, Newsletter,
      ProductCard), SearchBar, Product & Category pages (ProductGallery,
      BackButton), Cart & Checkout, and the **entire admin panel** — shell/nav,
      Dashboard, all five list pages (Products, Categories, Product Types,
      Orders, Expenses), all four form pairs (new/edit for each), and the
      Order detail page + its action components.
* [x] **Hero section — content-safety boundary established (Session 11).**
      Multiple explicit requests for sexualized/adult-themed hero imagery
      (a "luxury casino" concept with sexualized women, then several
      uploaded anime character images with sexualizing elements) were
      declined outright, including when reframed as "just erotica" or "tell
      me how to do it myself." Final shipped direction: an abstract
      "foil card" placeholder with a one-time shine sweep and Apple-style
      restrained scroll-reveal animation; a user-supplied, fully-clothed
      fairy sprite asset was accepted and integrated (chroma-key
      transparency guidance given, sprite-sheet frame math debugged) once
      confirmed non-sexualized. This boundary held consistently across
      several follow-up attempts in the same session — worth carrying
      forward as precedent, not re-litigating if raised again.
* [x] **Dark mode toggle (Session 12).** The admin selected the Collector
      Midnight palette after comparing three interactive mockups. A 44px
      sun/moon control now lives in the global header. First visits follow
      `prefers-color-scheme`; a manual choice is stored under
      `pokesunshine-theme` in `localStorage`, and subsequent OS changes are
      followed only while no override exists. A synchronous initialization
      script in the root layout applies `data-theme` before first paint to
      avoid a theme flash or hydration mismatch. The complete dark token set
      lives in `globals.css`; no dependency was added.
* [x] **Customer order breakdown consistency (Session 13).** Corrected the
      customer order detail, authenticated checkout-success page, and order
      confirmation email so every breakdown shows subtotal, an optional
      `Discount (CODE)` row, shipping/self-collection, conditional GST, and
      the stored final total in the same order. GST is now hidden when
      `GST_ENABLED` is false, and the email no longer hardcodes `GST (9%)`.
      Checkout and admin order detail were audited and already followed the
      correct discount-before-GST rules, so they required no change.
* [x] **Authenticated newsletter preference (Session 14).** Newsletter signup
      is now restricted to Clerk-backed accounts. Signed-out visitors are sent
      to sign-in and returned to `/#newsletter`; signed-in users can subscribe
      or unsubscribe with one click. `User` stores the current preference and
      opt-in/opt-out timestamps, managed only by authenticated
      `GET`/`POST`/`DELETE /api/newsletter` calls. Migration
      `20260722175234_add_newsletter_subscription` was applied to Neon and the
      Prisma client regenerated. Admin-authored manual broadcasting was added
      later in Session 24.
* [x] **Admin Dashboard Summary — new feature, not on the original roadmap
      (Session 11).** Real revenue/expense/profit tracking:
      `app/admin/page.tsx` queries Prisma directly (Server Component,
      matching the project's existing convention); `recharts` adopted
      (admin-approved new dependency) for Revenue Trend, New Customers,
      Delivery-vs-Self-Collection split, and Top 5 Products charts, rendered
      via a separate `app/admin/DashboardCharts.tsx` Client Component (chart
      colors hardcoded to mirror `globals.css` tokens — SVG fill/stroke
      attributes don't reliably resolve CSS custom properties). Metric cards:
      Total Revenue, Total Expenses, Profit, Avg Order Value, Paid Orders,
      Active Products, Out of Stock, Repeat Customer Rate, and (added when
      Promotions landed) Total Discounts Given / Discount Codes Used.
* [x] **Expense tracking — new feature, not on the original roadmap
      (Session 11).** Flat `Expense` model (title/category/amount/
      incurredAt/notes/isSystemGenerated) — deliberately *not* linked via
      foreign key to `Order`/`Product`, per the admin's explicit request for
      something simple he creates and edits by hand. Full CRUD
      (`/admin/expenses`), category field is free text with `<datalist>`
      suggestions rather than a fixed enum, so new categories never require
      a migration. `isSystemGenerated` added later specifically so
      auto-created discount-expense rows can be reliably distinguished from
      manual entries in dashboard aggregates.
* [x] **Self-collection "ready for pickup" email timing — bug found and
      fixed (Session 11).** Previously fired on `PACKED → COMPLETED` (i.e.
      *after* the admin already recorded the customer as having picked up
      the order — backwards). The admin found and fixed the actual
      transition-map entry in `status/route.ts` himself; confirmed
      end-to-end that the email now fires correctly at `PROCESSING →
      PACKED`. `COMPLETED` for self-collection orders now triggers no
      customer email at all, matching how `COMPLETED` already behaved for
      delivery orders (deliberate, not a regression).
* [x] **CMS pages — partial (Session 11).** `Footer.tsx` (global, in
      `app/layout.tsx`), `/faq` (real content, all of it grounded in facts
      actually true of this site — HitPay/PayNow, GST conditionality,
      Delivery vs. Self-Collection with real pickup address, the
      random-art/condition/all-sales-final policies from
      `PurchaseNotice.tsx`), `/about` and `/contact` (real content, written
      by the admin). **Deliberately not built, by explicit admin choice**:
      Terms & Conditions, Shipping, Returns, Help Center pages — all
      removed/skipped rather than left as placeholders. `ComingSoonPage.tsx`
      component still exists but may now be fully unused; worth confirming
      and deleting if so, next time that file is touched.
      **A reference FAQ/T&C document the admin uploaded was deliberately
      not used as source content** — it was identified as another real
      business's actual customer-service copy (named "Newtro," referenced
      their own Telegram handle and supplier relationships), not something
      written for this project; copying it would have been both an IP
      concern and factually wrong for this store's actual (online-only, no
      physical shop, no international shipping, no bulk/streamer program)
      operations.
* [x] **Promotion codes — new feature, full Phase 7 "coupon codes" item
      complete (Session 11).** Scoped explicitly narrower than a public
      marketing-coupon system: whole-order-only (no product/category
      scoping), percentage or fixed-amount discount, optional minimum order
      value and maximum discount cap, **single-use until an admin manually
      reactivates it** (not permanently deleted, not schema-free — codes
      persist as rows with `active`/`usedAt`/`usedByOrderId`). Burned
      (`usedAt` set) at order-creation time regardless of whether the
      payment that follows later succeeds or fails — a deliberate admin
      decision, not the default the project would have chosen on its own.
      Discount is applied to `subtotal` **before** GST is calculated
      (`discountedSubtotal` feeds `calculateTotalWithGST`), consistent with
      how GST is meant to apply to a net sale price. A discount is logged
      as an auto-generated `Expense` (`isSystemGenerated: true`, category
      `"Promotion"`) **only once the order actually reaches `PAID`** — inside
      the winning compare-and-set transaction in
      `lib/payments/transitionOrderPayment.ts`, so duplicate webhook or
      reconciliation calls cannot double-fire it and it never fires for an
      order that ends up failing. Full admin CRUD at `/admin/promo-codes`, including a
      dedicated Reactivate action (distinct from the independent
      Active/Inactive toggle — a code can be inactive-and-unused,
      active-and-used, etc., independently).
* [x] **GST made conditional (Session 11).** The admin is not currently
      GST-registered. `lib/gst.ts` now exports `GST_ENABLED` (true only if
      `GST_RATE_PERCENT` env var is a positive number) and
      `GST_RATE_DISPLAY`; every surface that shows a GST line (checkout
      form, order confirmation totals, admin order detail, the FAQ's GST
      answer) now conditionally hides it rather than showing "$0.00 GST."
      Setting `GST_RATE_PERCENT=0` is the only step needed to fully disable
      GST display and calculation; no further code change required if/when
      the admin becomes GST-registered later — just set the real rate.

---

## In Progress

* **Milestone 4 review gate.** Cart, checkout, checkout status, search,
  customer order pages, canonical/social metadata, the sitemap, structured
  data, and focused accessibility/performance work are implemented and have
  passed automated verification. Interactive desktop/mobile and both-theme
  review remains on the admin-run local server.
* **Disposable catalogue review.** The admin is reviewing the eight imported
  Pokemon English sets and 12 variants in production. The cache-refresh change
  must be deployed and the homepage plus `/categories` rechecked before the
  admin decides whether to proceed with the separately gated database reset.

---

## Known Bugs / Gaps

* **`ComingSoonPage.tsx` may now be dead code** — every page that used to
  render it (Terms, Shipping, Returns, Help Center) was removed by the
  admin. Worth confirming zero remaining usages and deleting next time
  that area is touched.
* **AI Shopping Assistant — still fully deferred, untouched since Session
  10.**
* **Whole-project lint baseline:** 42 errors and one warning remain in
  unrelated admin forms/actions, product-type/product APIs, the Clerk webhook,
  the payment-failed email template, and theme initializer. Milestone 4 files
  pass targeted lint.
* **Homepage is still a hardcoded composition** in `app/page.tsx` — no
  Homepage Builder and no admin-configurable sections. Its visual composition
  was substantially upgraded in Milestone 1, but configurability remains
  Phase 7 scope.
* **Newsletter lead images are references, not uploads.** The admin editor
  accepts a repository-owned `/images/...` path or secure hosted URL.
  Drag-and-drop uploads require a future persistent media-storage decision.
* **Catalogue taxonomy is intentionally flat.** The admin confirmed that
  categories are TCG lines, products are sets, and variants are purchasable
  formats. Do not reintroduce Product Line -> Era -> Set hierarchy work unless
  the admin explicitly changes this decision.
* **Current database content is disposable test data.** It now includes the
  temporary Pokemon English workbook preview alongside older demonstration
  records. Recalculate the exact deletion set immediately before any reset,
  preserve only the confirmed admin account, and require explicit approval
  before executing the destructive operation.
* **Theme is still hardcoded in `globals.css`, not admin-editable.** What
  was built this session is a real, complete *design system* — it is not
  the admin-facing "Theme Builder" ROADMAP.md's Phase 7 originally
  described (colors/typography editable via an admin UI). Worth being
  precise about this distinction in any future planning: the visual result
  is done; the "builder" is not.
* **Flash sale scheduling and bundle pricing** — the other two ROADMAP.md
  Phase 7 Promotions sub-items, beyond coupon codes. Not started, not
  scoped.
* **Product Type deletion/reassignment, bulk order actions, Meilisearch** —
  unchanged, still deliberately deferred per Session 10's DECISIONS.md
  entries.
* Remaining launch work is tracked in `handover/LAUNCH_AUDIT.md`. It includes
  production Clerk credentials, deploying and smoke-testing the browser
  security headers, contrast fixes, error tracking, uptime monitoring, formal
  assistive-technology checks, and admin audit logging. Local product and
  category paths render through
  `next/image`; the remote compatibility branch remains only for disposable
  test database records.

---

## Immediate Next Task

Commit and deploy the local browser-security-header batch. Then verify the live
headers and perform authenticated sign-in, account, admin, cart, and checkout
smoke tests to catch any Clerk/CSP incompatibility before considering the batch
complete. Do not wipe data during Phase 2. The final reset still requires a
later, separate explicit confirmation and must preserve only the confirmed
admin account.

---

## Important Notes

- **This project now has a real, documented design system** — three
  admin-supplied docs (VISION.md, DESIGN_SYSTEM.md, UI_PATTERNS.md) govern
  all visual/UX decisions. These are **not currently part of the
  `/mnt/project` doc set** Claude reads at session start — the admin was
  advised to save them into the real project (e.g. `docs/design/`) for
  continuity; confirm whether that's been done before assuming Claude has
  access to them next session.
- **Tailwind v4, not v3** — there is no `tailwind.config.ts`. All tokens
  live in `app/globals.css`'s `@theme inline` block, generated from CSS
  custom properties in `:root`. Gradient utilities are `bg-linear-to-*`,
  not `bg-gradient-to-*` (Tailwind v4 rename).
- **Dark mode uses `data-theme="dark"` on `<html>`**, initialized before
  first paint from `pokesunshine-theme` or the OS preference. New visual
  tokens must define appropriate values for both the light `:root` palette
  and the Collector Midnight override.
- **Stable premium dark surfaces use the `ink` token family.**
  `--color-ink`, `--color-ink-muted`, `--color-on-ink`, and
  `--color-on-ink-muted` do not swap semantic roles between themes. Use these
  for hero/footer/editorial panels instead of assuming `primary` is always a
  dark background.
- **Font is Geist**, self-hosted from `app/fonts/geist-latin.woff2` through
  `next/font/local`, and used for both `font-display` and `font-sans` tokens
  (no separate serif). This keeps the deliberate visual choice while removing
  the Google Fonts build-time network dependency.
- **New npm dependencies added this session, with explicit admin
  confirmation each time**: `lucide-react`, `recharts`. No others.
- **GST is now conditional** — see Completed Features above. Any new
  surface that displays order totals must check `GST_ENABLED` before
  rendering a GST line, the same way archived-product filtering must be
  added by hand to any new product-listing query (an established pattern
  in this project, not a new one).
- **Promo codes are single-use-until-reactivated, not permanently
  consumed** — `PromoCode` rows are never deleted by the checkout flow
  itself, only by explicit admin action. Any future code touching promo
  logic should not assume a used code's row is gone.
- **Discount timing relative to GST**: discount is subtracted from
  subtotal *before* GST calculation. Any future promotion feature (flash
  sales, bundles) should follow the same convention for consistency.
- **The admin dashboard's "system-generated" expense pattern is the
  template for any future auto-logged financial event** — `isSystemGenerated:
  true`, a descriptive title, and a real `category` string, so it stays
  distinguishable from manual entries in aggregate queries.
- All Important Notes from Session 10's CURRENT_STATE.md (Prisma 7 adapter
  pattern, archive-vs-delete distinction, locked slugs/productTypeId/
  ProductField key-type, `NEXT_PUBLIC_*` build-time baking, etc.) remain
  accurate and unchanged.
- **Final pre-live reminder requested by the admin:** rotate/regenerate every
  API key and deployment secret, then request separate explicit confirmation
  before wiping all disposable Prisma data. Neither action is authorized by
  ordinary milestone approval; both belong to the last launch gate.
- **Legal and PDPA scope boundary:** all legal wording, policies, and PDPA
  coverage are handled solely by the admin and their lawyer. Engineering may
  assess technical feasibility, authorization, data security, and data flows,
  but must not present work as legal or PDPA compliance certification.
