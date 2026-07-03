# NEXT_TASK.md

## Next Feature (proposed — confirm at start of next session)
Phase 4 — Cart, Checkout & HitPay: Cart state with Zustand

## Goal
A shopper can add products (specific variants, not just products) to a cart, see it persist across page navigation, adjust quantities, and remove items — all before touching checkout or payment.

## Why this first
Phase 4 depends on having a cart before checkout can exist. Zustand is already the chosen state library per `PROJECT_OVERVIEW.md`. This is the first client-side global state in the project — everything so far has been server-fetched or local component state (e.g. `ProductGallery`'s variant selection).

## Rough Scope (not yet finalized — plan properly at session start)
- Zustand store (e.g. `lib/store/cart.ts`) — cart items keyed by `variantId`, with quantity
- "Add to Cart" action wired into `ProductGallery.tsx` (uses the already-selected variant)
- Cart persistence — needs a decision: in-memory only (lost on refresh) vs. persisted (localStorage via Zustand's `persist` middleware, or DB-backed against `User`/session)
- Basic cart UI — icon/count in a header (no header/nav component exists yet — may need one), and a cart page or slide-out panel to view/edit contents

## Open Questions (resolve before coding)
1. There's no site header/nav at all yet — cart needs to be reachable from every page. Build a minimal header now, or is there a preference for where the cart icon/link lives?
2. Cart persistence: in-memory (simplest, but lost on refresh — bad UX), localStorage (simple, survives refresh, but not synced across devices or for logged-in users), or DB-backed (needs a `Cart`/`CartItem` model — bigger scope)?
3. Guest carts — since Clerk auth exists but customers aren't required to sign in to browse, should unauthenticated shoppers be able to add to cart, or is sign-in required first?

## Dependencies
- Product and ProductVariant data already exist and are testable
- Zustand not yet installed — will need `npm install zustand`
- No cart-related models exist in the schema yet (see DATABASE_SCHEMA.md "Planned Models")