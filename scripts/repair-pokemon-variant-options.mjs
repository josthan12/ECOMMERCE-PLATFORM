import 'dotenv/config'

import pg from 'pg'

const { Client } = pg

const catalogue = [
  {
    slug: '30th-celebration',
    formats: [
      'Tech Sticker Collection',
      '2-Pack Blister',
      'Knock Out Collection',
      'Poster Collection',
      'Pokémon ex Box—Sylveon ex & Greninja ex',
      'Elite Trainer Box',
      'Pokémon Center Elite Trainer Box',
      'Binder Collection',
      'Booster Bundle',
      'Mini Tin Sealed Display (10 tins)',
      'Battle Deck—Espeon ex & Umbreon ex',
      'Ditto Premium Collection',
      'Ultra-Premium Collection—Day & Night',
      'Figure Collection—Mew & Mewtwo',
    ],
  },
  {
    slug: 'mega-evolution',
    formats: [
      'Pokémon Center Elite Trainer Box',
      'Elite Trainer Box',
      'Booster Bundle',
      'Booster Display',
      'Build & Battle Box',
    ],
  },
  {
    slug: 'mega-evolution-phantasmal-flames',
    formats: [
      'Pokémon Center Elite Trainer Box',
      'Elite Trainer Box',
      'Booster Bundle',
      'Booster Display',
      'Build & Battle Box',
    ],
  },
  {
    slug: 'mega-evolution-ascended-heroes',
    formats: [
      'Pokémon Center Elite Trainer Box',
      'Elite Trainer Box',
      'Tech Sticker Collection',
      'Premium Poster Collection',
      'Erika Collection',
      'Larry Collection',
    ],
  },
  {
    slug: 'mega-evolution-perfect-order',
    formats: [
      'Pokémon Center Elite Trainer Box',
      'Elite Trainer Box',
      'Booster Bundle',
      'Booster Display',
      'Build & Battle Box',
    ],
  },
  {
    slug: 'mega-evolution-chaos-rising',
    formats: [
      'Pokémon Center Elite Trainer Box',
      'Elite Trainer Box',
      'Booster Bundle',
      'Booster Display',
      'Build & Battle Box',
    ],
  },
  {
    slug: 'mega-evolution-pitch-black',
    formats: [
      'Pokémon Center Elite Trainer Box',
      'Elite Trainer Box',
      'Booster Bundle',
      'Booster Display',
      'Build & Battle Box',
    ],
  },
]

function assert(condition, message) {
  if (!condition) throw new Error(message)
}

function sameMembers(actual, expected) {
  return actual.length === expected.length && expected.every((value) => actual.includes(value))
}

async function main() {
  assert(process.env.DATABASE_URL, 'DATABASE_URL is required')

  const client = new Client({ connectionString: process.env.DATABASE_URL })
  await client.connect()

  try {
    await client.query('BEGIN')
    await client.query('SET TRANSACTION ISOLATION LEVEL SERIALIZABLE')
    await client.query("SELECT pg_advisory_xact_lock(hashtext('pokemon-variant-options-repair'))")

    const database = await client.query(
      'SELECT current_database() AS database, current_schema() AS schema'
    )
    assert(database.rows[0]?.database === 'neondb', 'Expected database neondb')
    assert(database.rows[0]?.schema === 'public', 'Expected schema public')

    const migrationState = await client.query(
      'SELECT COUNT(*) FILTER (WHERE finished_at IS NOT NULL AND rolled_back_at IS NULL)::int AS complete, COUNT(*) FILTER (WHERE finished_at IS NULL OR rolled_back_at IS NOT NULL)::int AS incomplete FROM "_prisma_migrations"'
    )
    assert(migrationState.rows[0].complete === 18, 'Expected 18 completed migrations')
    assert(migrationState.rows[0].incomplete === 0, 'Expected no incomplete migrations')

    const products = await client.query(
      'SELECT p.id, p.slug, p."variantOptions" FROM "Product" p JOIN "CategoryProduct" cp ON cp."productId" = p.id JOIN "Category" c ON c.id = cp."categoryId" WHERE c.slug = $1 AND p.slug = ANY($2::text[]) FOR UPDATE OF p',
      ['pokemon-english', catalogue.map((product) => product.slug)]
    )
    assert(products.rowCount === catalogue.length, 'Expected exactly seven Pokemon English products')

    const rollbackBoundary = []

    for (const expectedProduct of catalogue) {
      const product = products.rows.find((row) => row.slug === expectedProduct.slug)
      assert(product, `Missing product: ${expectedProduct.slug}`)

      const variants = await client.query(
        'SELECT combination FROM "ProductVariant" WHERE "productId" = $1 FOR UPDATE',
        [product.id]
      )
      const actualFormats = variants.rows.map((row) => row.combination?.Format)

      assert(
        actualFormats.every((format) => typeof format === 'string' && format.length > 0),
        `Invalid variant format for ${expectedProduct.slug}`
      )
      assert(
        new Set(actualFormats).size === actualFormats.length,
        `Duplicate variant format for ${expectedProduct.slug}`
      )
      assert(
        sameMembers(actualFormats, expectedProduct.formats),
        `Variant formats do not match the expected catalogue for ${expectedProduct.slug}`
      )

      rollbackBoundary.push({
        slug: product.slug,
        variantOptions: product.variantOptions,
      })

      await client.query(
        'UPDATE "Product" SET "variantOptions" = $1::jsonb, "updatedAt" = NOW() WHERE id = $2',
        [JSON.stringify({ Format: expectedProduct.formats }), product.id]
      )
    }

    const verification = await client.query(
      'SELECT p.slug, p."variantOptions"->\'Format\' AS options, COUNT(v.id)::int AS variants FROM "Product" p JOIN "CategoryProduct" cp ON cp."productId" = p.id JOIN "Category" c ON c.id = cp."categoryId" JOIN "ProductVariant" v ON v."productId" = p.id WHERE c.slug = $1 AND p.slug = ANY($2::text[]) GROUP BY p.id, p.slug ORDER BY p.slug',
      ['pokemon-english', catalogue.map((product) => product.slug)]
    )

    for (const row of verification.rows) {
      const expected = catalogue.find((product) => product.slug === row.slug)
      assert(expected, `Unexpected product in verification: ${row.slug}`)
      assert(
        JSON.stringify(row.options) === JSON.stringify(expected.formats),
        `Incorrect option order for ${row.slug}`
      )
      assert(row.options.length === row.variants, `Option/variant count mismatch for ${row.slug}`)
    }

    await client.query('COMMIT')
    console.log(JSON.stringify({ repaired: verification.rows, rollbackBoundary }, null, 2))
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    await client.end()
  }
}

main().catch((error) => {
  console.error(error.message)
  process.exitCode = 1
})
