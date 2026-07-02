# NEXT_TASK.md

## Next Feature
Category Builder — admins can create/edit product categories with SEO fields and a banner image, and assign products to categories.

## Goal
After this task is complete, an admin should be able to:
1. Create a category (e.g. "Sneakers") with a slug, description, banner image URL, and SEO title/description
2. See a list of all categories in the admin panel
3. Assign one or more existing products to a category
4. View which products belong to a category

---

## Schema Changes Needed (not yet in DATABASE_SCHEMA.md — confirm before coding)

Proposed models:

**Category**
| Column | Type | Notes |
|---|---|---|
| id | String (cuid) | Primary key |
| name | String | Unique, e.g. "Sneakers" |
| slug | String | Unique, auto-generated |
| description | String? | Optional |
| bannerImageUrl | String? | Optional banner image URL |
| seoTitle | String? | Optional, defaults to name if empty |
| seoDescription | String? | Optional |
| createdAt | DateTime | Auto |
| updatedAt | DateTime | Auto |

**CategoryProduct** (junction table, many-to-many)
| Column | Type | Notes |
|---|---|---|
| id | String (cuid) | Primary key |
| categoryId | String | FK → Category.id (cascade delete) |
| productId | String | FK → Product.id (cascade delete) |

A product can belong to multiple categories; a category can have multiple products.

---

## Files Expected to Change

| File | What changes |
|---|---|
| `prisma/schema.prisma` | Add `Category`, `CategoryProduct` models |
| `app/admin/categories/page.tsx` | New — category list page (Server Component) |
| `app/admin/categories/new/page.tsx` | New — create category form (Client Component) |
| `app/api/admin/categories/route.ts` | New — GET (list) + POST (create) |
| `app/generated/prisma/` | Must be recommitted after `npx prisma generate` |

---

## Step by Step

**Step 1 — Confirm schema with Claude before writing it** (open questions below)

**Step 2 — Add models to `prisma/schema.prisma`**

**Step 3 — Run migration**
```bash
npx prisma migrate dev --name add_categories
```

**Step 4 — Regenerate client**
```bash
npx prisma generate
```

**Step 5 — Build category list page** (`app/admin/categories/page.tsx`)
- Server Component, fetch categories directly via Prisma
- Table: name, slug, product count, actions (edit link)

**Step 6 — Build category create form** (`app/admin/categories/new/page.tsx`)
- Client Component
- Fields: name, description, banner image URL, SEO title, SEO description
- Multi-select or checkbox list to assign existing products to the category

**Step 7 — Build API routes** (`app/api/admin/categories/route.ts`)
- GET: return all categories with product count (or nested products)
- POST: create category with auto-generated slug; optionally create `CategoryProduct` rows for assigned products in the same request

**Step 8 — Test**
- Create 2-3 categories
- Assign the Nike shoe product (from variants testing) to one category
- Confirm in Prisma Studio: `Category` row exists, `CategoryProduct` rows link correctly

**Step 9 — Commit**
```bash
git add .
git commit -m "Phase 2: Category Builder"
git push
```

---

## Open Questions (resolve before coding)

1. Should product assignment happen on the category creation form, or as a separate step (e.g. assign products from the product edit page instead)?
2. Should categories support nesting (parent/child, e.g. "Shoes" > "Sneakers")? Not in original scope — confirm if needed now or deferred.
3. Banner image — plain URL string for now (no upload), consistent with no file-upload infra yet. Confirm this is fine for v1.

---

## Dependencies

- No new npm packages needed
- Products and their variants must already exist for meaningful testing (already true — Nike shoe created last session)

---

## Acceptance Criteria

- [ ] `Category` and `CategoryProduct` tables exist in Neon database
- [ ] Admin can create a category with name, slug, description, banner image URL, SEO fields
- [ ] Admin can assign existing products to a category
- [ ] Category list page shows all categories with product count
- [ ] Vercel build still passes after committing updated generated client