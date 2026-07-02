# NEXT_TASK.md

## Next Feature (proposed — confirm at start of next session)
Phase 3 — Public Storefront: Category Page Route (`/category/[slug]`)

## Goal
A public, unauthenticated page where a shopper can visit a category's URL and see its banner, description, and a grid of assigned products (name, price range, placeholder image).

## Why this first
Builds directly on Category Builder (just completed) and ProductVariant price-range logic (already written for the admin products list) — lowest-new-surface-area way to start Phase 3. Alternative starting points per ROADMAP.md: homepage section renderer, or product detail page (`/product/[slug]`) — worth confirming preference before coding.

## Rough Scope (not yet finalized — plan properly at session start)
- `app/category/[slug]/page.tsx` — Server Component, fetch by slug via Prisma directly (no API route needed, consistent with admin list page conventions)
- Show: banner image, name, description, product grid
- Product grid: name, derived price range (reuse logic pattern from `app/admin/products/page.tsx`), link to product detail (not yet built — may need placeholder or defer linking)
- SEO: use `seoTitle`/`seoDescription` fields for page `<title>` / meta description via Next.js `generateMetadata`

## Open Questions (resolve before coding)
1. Product detail page (`/product/[slug]`) doesn't exist yet — should category page product cards link anywhere, or be non-clickable for now?
2. Should out-of-stock products (all variants stock: 0) be shown, hidden, or shown with a badge?
3. 404 behavior for unknown slugs — Next.js `notFound()` helper?

## Dependencies
- Category and Product data already exist and are testable (from this session's work)
- No new npm packages expected