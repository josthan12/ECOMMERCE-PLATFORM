# NEXT_TASK.md

## Next Feature
Product Variants — complete the variant system so each product can have combinations of options (Size, Color, Storage etc.) each with their own price and stock.

## Goal
After this task is complete, an admin should be able to:
1. Create a product (e.g. Nike Air Force 1)
2. Define variant options (Size: 7, 8, 9 / Color: Red, Blue)
3. Have the system auto-generate all combinations (7+Red, 7+Blue, 8+Red, 8+Blue, 9+Red, 9+Blue)
4. Fill in price and stock per combination
5. Save the product with all its variants to the database

---

## Files Expected to Change

| File | What changes |
|---|---|
| `app/admin/products/new/page.tsx` | Add variant option definition UI + auto-generated combinations table |
| `app/api/admin/products/route.ts` | Update POST to save variants via nested Prisma create |
| `app/generated/prisma/` | Must be recommitted after `npx prisma generate` |

---

## Step by Step

**Step 1 — Run the migration (schema was already updated last session)**
```bash
npx prisma migrate dev --name add_product_variants
```
If it asks to reset the database, type `y` — no real data exists yet.

**Step 2 — Regenerate the client**
```bash
npx prisma generate
```

**Step 3 — Verify in Prisma Studio**
```bash
npx prisma studio   # run in PowerShell
```
Confirm `ProductVariant` appears in the left sidebar.

**Step 4 — Update the Product Builder UI**

In `app/admin/products/new/page.tsx`, add a "Variants" section below the custom fields section that:
- Lets admin add option groups (e.g. "Size") with values (e.g. "7, 8, 9")
- Has an "Generate Combinations" button that computes the cartesian product of all options
- Shows a table of all generated combinations where admin fills in price and stock per row
- Optionally fills in a SKU per row

State to add:
```tsx
const [variantOptions, setVariantOptions] = useState<{name: string, values: string}[]>([])
const [variants, setVariants] = useState<{combination: Record<string,string>, price: string, stock: string, sku: string}[]>([])
```

Combination generation logic (cartesian product):
```tsx
function generateCombinations(options: {name: string, values: string}[]) {
  const parsed = options
    .filter(o => o.name && o.values)
    .map(o => ({
      name: o.name,
      values: o.values.split(',').map(v => v.trim()).filter(Boolean)
    }))

  if (parsed.length === 0) return []

  const combos = parsed.reduce<Record<string,string>[]>((acc, option) => {
    if (acc.length === 0) return option.values.map(v => ({ [option.name]: v }))
    return acc.flatMap(combo =>
      option.values.map(v => ({ ...combo, [option.name]: v }))
    )
  }, [])

  return combos.map(combination => ({
    combination,
    price: '',
    stock: '',
    sku: ''
  }))
}
```

**Step 5 — Update the Products API**

In `app/api/admin/products/route.ts`, update POST to handle variants:
```tsx
const product = await prisma.product.create({
  data: {
    name,
    slug,
    description,
    productTypeId,
    attributes: attributes || {},
    variantOptions: variantOptions || {},
    variants: {
      create: variants.map((v: any) => ({
        combination: v.combination,
        price: parseFloat(v.price),
        stock: parseInt(v.stock),
        sku: v.sku || null,
      }))
    }
  },
  include: { variants: true }
})
```

**Step 6 — Test**
- Create a "Shoe" product type with fields: Brand (TEXT), Material (TEXT)
- Create a Nike shoe with Size options [7,8,9] and Color options [Red, Blue]
- Generate combinations — should produce 6 rows
- Fill in price and stock per row
- Submit and check Prisma Studio — confirm Product row exists with variantOptions JSON and 6 ProductVariant rows

**Step 7 — Commit**
```bash
git add .
git commit -m "Phase 2: Product variants with combination generation"
git push
```

---

## Dependencies

- `prisma/schema.prisma` already updated with `ProductVariant` model last session
- Migration must be run before anything else works
- No new npm packages needed

---

## Potential Risks

- If migration fails due to existing product data with price/stock columns: drop the `Product` table data manually via Prisma Studio and retry, or use `--force-reset` flag (acceptable since no real data exists)
- Cartesian product generation can produce many rows if too many options/values are added — no limit needed for now but worth noting
- SKU uniqueness is optional in schema — no unique constraint set, so duplicates are possible; validation can be added later

---

## Acceptance Criteria

- [ ] `ProductVariant` table exists in Neon database
- [ ] Admin can define variant options in the Product Builder
- [ ] "Generate Combinations" auto-creates all option combinations
- [ ] Admin can set price and stock per combination
- [ ] Submitting the form saves the product AND all variants
- [ ] Prisma Studio shows correct ProductVariant rows linked to the product
- [ ] Vercel build still passes after committing updated generated client
