import 'dotenv/config'

import { randomUUID } from 'node:crypto'
import pg from 'pg'

const { Client } = pg

const bullets = (...items) => items.join('\n')

function standardSet({
  name,
  slug,
  description,
  imageUrl,
  promo,
  prices,
  stocks,
  images,
}) {
  return {
    name,
    slug,
    description,
    imageUrl,
    variants: [
      {
        name: 'Pokémon Center Elite Trainer Box',
        price: prices[0],
        stock: stocks[0],
        imageUrl: images[0],
        description: bullets(
          `11 Pokémon TCG: ${name} booster packs`,
          `1 full-art foil promo card featuring ${promo} with a Pokémon Center logo`,
          `1 full-art foil promo card featuring ${promo}`,
          '65 card sleeves',
          '40 Pokémon TCG Energy cards',
          `A player’s guide to the ${name} expansion`,
          '6 damage-counter dice',
          '1 competition-legal coin-flip die',
          '1 plastic coin',
          'A collector’s box with 6 dividers',
          'A code card for Pokémon Trading Card Game Live'
        ),
      },
      {
        name: 'Elite Trainer Box',
        price: prices[1],
        stock: stocks[1],
        imageUrl: images[1],
        description: bullets(
          `9 Pokémon TCG: ${name} booster packs`,
          `1 full-art foil promo card featuring ${promo}`,
          '65 card sleeves',
          '40 Pokémon TCG Energy cards',
          `A player’s guide to the ${name} expansion`,
          '6 damage-counter dice',
          '1 competition-legal coin-flip die',
          '1 plastic coin',
          'A collector’s box with 6 dividers',
          'A code card for Pokémon Trading Card Game Live'
        ),
      },
      {
        name: 'Booster Bundle',
        price: prices[2],
        stock: stocks[2],
        imageUrl: images[2],
        description: `6 Pokémon TCG: ${name} booster packs`,
      },
      {
        name: 'Booster Display',
        price: prices[3],
        stock: stocks[3],
        imageUrl: images[3],
        description: bullets(
          `36 Pokémon TCG: ${name} booster packs`,
          'Each booster pack contains 10 cards, 1 Basic Energy, and 1 Pokémon TCG Live code card. Cards vary by pack.'
        ),
      },
      {
        name: 'Build & Battle Box',
        price: prices[4],
        stock: stocks[4],
        imageUrl: images[4],
        description: bullets(
          'A 40-card ready-to-play deck, including 1 of 4 unique foil promo cards',
          `4 Pokémon TCG: ${name} booster packs`,
          'A code card for Pokémon TCG Live'
        ),
      },
    ],
  }
}

const pitchBlackUpdate = {
  slug: 'mega-evolution-pitch-black',
  variants: [
    { name: 'Pokémon Center Elite Trainer Box', price: 200, stock: 6 },
    { name: 'Elite Trainer Box', price: 100, stock: 4 },
    { name: 'Booster Bundle', price: 46, stock: 9 },
    { name: 'Booster Display', price: 250, stock: 3 },
    { name: 'Build & Battle Box', price: 42, stock: 7 },
  ],
}

const newSets = [
  {
    name: '30th Celebration',
    slug: '30th-celebration',
    description:
      'Celebrate 30 years of the Pokémon Trading Card Game with foil-packed boosters, special Pikachu illustrations, returning classics, and commemorative sealed products.',
    imageUrl: '/images/products/30th-celebration.png',
    variants: [
      {
        name: 'Tech Sticker Collection',
        price: 70,
        stock: 5,
        imageUrl: '/images/variants/30th-celebration-tech-sticker.webp',
        description: bullets(
          '1 foil promo card featuring Alolan Exeggutor or Lucario',
          '1 matching tech sticker sheet',
          '3 Pokémon TCG: 30th Celebration booster packs'
        ),
      },
      {
        name: '2-Pack Blister',
        price: 50,
        stock: 8,
        imageUrl: '/images/variants/30th-celebration-2-pack-blister.webp',
        description: bullets(
          '1 foil Pokémon TCG card featuring Eevee',
          '1 plastic coin',
          '2 Pokémon TCG: 30th Celebration booster packs'
        ),
      },
      {
        name: 'Knock Out Collection',
        price: 50,
        stock: 4,
        imageUrl: '/images/variants/30th-celebration-knock-out.webp',
        description: bullets(
          '1 foil Pokémon TCG card featuring Eevee',
          '1 plastic coin',
          '2 Pokémon TCG: 30th Celebration booster packs'
        ),
      },
      {
        name: 'Poster Collection',
        price: 70,
        stock: 6,
        imageUrl: '/images/variants/30th-celebration-poster.webp',
        description: bullets(
          '1 poster featuring more than 160 cards from the expansion',
          '3 foil promo cards featuring Articuno, Zapdos, and Moltres',
          '3 Pokémon TCG: 30th Celebration booster packs'
        ),
      },
      {
        name: 'Pokémon ex Box—Sylveon ex & Greninja ex',
        price: 105,
        stock: 2,
        imageUrl: '/images/variants/30th-celebration-pokemon-ex-box.webp',
        description: bullets(
          '1 foil promo card featuring Sylveon ex or Greninja ex',
          '1 oversize foil card featuring the same Pokémon ex',
          '4 Pokémon TCG: 30th Celebration booster packs'
        ),
      },
      {
        name: 'Elite Trainer Box',
        price: 250,
        stock: 7,
        imageUrl: '/images/variants/30th-celebration-etb.webp',
        description: bullets(
          '9 Pokémon TCG: 30th Celebration booster packs',
          '1 full-art promo card featuring Nidorina',
          '65 card sleeves',
          '16 foil Basic Energy cards',
          'Damage-counter dice',
          '1 competition-legal coin-flip die',
          '1 plastic coin',
          'A collector’s box with 6 dividers',
          'A player’s guide to the 30th Celebration expansion'
        ),
      },
      {
        name: 'Pokémon Center Elite Trainer Box',
        price: 520,
        stock: 3,
        imageUrl: '/images/variants/30th-celebration-pokemon-center-etb.webp',
        description: bullets(
          '11 Pokémon TCG: 30th Celebration booster packs',
          '2 full-art promo cards featuring Nidorina, including 1 with a Pokémon Center logo',
          '65 card sleeves',
          '16 foil Basic Energy cards',
          'Damage-counter dice',
          '1 competition-legal coin-flip die',
          '1 plastic coin',
          'A collector’s box with 6 dividers',
          'A player’s guide to the 30th Celebration expansion'
        ),
      },
      {
        name: 'Binder Collection',
        price: 175,
        stock: 9,
        imageUrl: '/images/variants/30th-celebration-binder.webp',
        description: bullets(
          '1 commemorative 9-pocket binder',
          '5 Pokémon TCG: 30th Celebration booster packs'
        ),
      },
      {
        name: 'Booster Bundle',
        price: 125,
        stock: 5,
        imageUrl: '/images/variants/30th-celebration-booster-bundle.webp',
        description: '6 Pokémon TCG: 30th Celebration booster packs',
      },
      {
        name: 'Mini Tin Sealed Display (10 tins)',
        price: 430,
        stock: 4,
        imageUrl: '/images/variants/30th-celebration-mini-tin-display.webp',
        description: bullets(
          '10 Pokémon TCG: 30th Celebration Mini Tins',
          'Each Mini Tin contains 2 booster packs, 1 sticker sheet, and 1 matching art card'
        ),
      },
      {
        name: 'Battle Deck—Espeon ex & Umbreon ex',
        price: 450,
        stock: 6,
        imageUrl: '/images/variants/30th-celebration-battle-deck.webp',
        description: bullets(
          '1 all-foil 60-card deck led by Espeon ex or Umbreon ex',
          '1 deck box',
          '1 coin',
          '1 playmat',
          '1 illustration rare-style Victini or Zeraora card, depending on the deck'
        ),
      },
      {
        name: 'Ditto Premium Collection',
        price: 200,
        stock: 8,
        imageUrl: '/images/variants/30th-celebration-ditto-premium.webp',
        description: bullets(
          '1 colorful acrylic display',
          '1 Ditto promo card',
          '8 Pokémon TCG: 30th Celebration booster packs'
        ),
      },
      {
        name: 'Ultra-Premium Collection—Day & Night',
        price: 1680,
        stock: 2,
        imageUrl: '/images/variants/30th-celebration-ultra-premium.webp',
        description: bullets(
          'Pikachu ex with Espeon ex or Umbreon ex cards',
          '1 playmat',
          'Card sleeves, a deck box, and additional accessories',
          '29 Pokémon TCG: 30th Celebration booster packs',
          '1 Classic Collection booster pack containing 3 cards'
        ),
      },
      {
        name: 'Figure Collection—Mew & Mewtwo',
        price: 170,
        stock: 7,
        imageUrl: '/images/variants/30th-celebration-figure-collection.webp',
        description: bullets(
          '1 foil promo card featuring Mew or Mewtwo',
          '1 oversize card featuring the same Pokémon',
          '1 sculpted figure featuring the same Pokémon',
          '5 Pokémon TCG: 30th Celebration booster packs'
        ),
      },
    ],
  },
  standardSet({
    name: 'Mega Evolution',
    slug: 'mega-evolution',
    description:
      'Mega Evolution Pokémon ex return with enormous HP and devastating attacks, led by Mega Lucario ex and Mega Gardevoir ex. Their additional power carries additional risk in every battle.',
    imageUrl: '/images/products/mega-evolution.png',
    promo: 'Alakazam or Riolu',
    prices: [380, 380, 80, 270, 25],
    stocks: [4, 7, 6, 3, 8],
    images: [
      '/images/variants/mega-evolution-pokemon-center-etb.png',
      '/images/variants/mega-evolution-etb.png',
      '/images/variants/mega-evolution-booster-bundle.png',
      '/images/variants/mega-evolution-booster-display.png',
      '/images/variants/mega-evolution-build-battle.png',
    ],
  }),
  standardSet({
    name: 'Mega Evolution—Phantasmal Flames',
    slug: 'mega-evolution-phantasmal-flames',
    description:
      'Mega Charizard X ex and Mega Gengar ex bring searing flames and deep shadows to battle alongside Mega Heracross ex, Mega Lopunny ex, and more powerful Pokémon.',
    imageUrl: '/images/products/mega-evolution-phantasmal-flames.png',
    promo: 'Charcadet',
    prices: [440, 200, 85, 510, 90],
    stocks: [5, 2, 9, 4, 6],
    images: [
      '/images/variants/phantasmal-flames-pokemon-center-etb.png',
      '/images/variants/phantasmal-flames-etb.png',
      '/images/variants/phantasmal-flames-booster-bundle.png',
      '/images/variants/phantasmal-flames-booster-display.png',
      '/images/variants/phantasmal-flames-build-battle.png',
    ],
  }),
  {
    name: 'Mega Evolution—Ascended Heroes',
    slug: 'mega-evolution-ascended-heroes',
    description:
      'Mega Dragonite ex leads an all-star gathering of Trainer’s Pokémon, Stellar Tera Pokémon ex, and returning and newly discovered Mega Evolution Pokémon ex.',
    imageUrl: '/images/products/mega-evolution-ascended-heroes.png',
    variants: [
      {
        name: 'Pokémon Center Elite Trainer Box',
        price: 530,
        stock: 3,
        imageUrl: '/images/variants/ascended-heroes-pokemon-center-etb.png',
        description: bullets(
          '11 Pokémon TCG: Mega Evolution—Ascended Heroes booster packs',
          '1 full-art foil promo card featuring N’s Zekrom with a Pokémon Center logo',
          '1 full-art foil promo card featuring N’s Zekrom',
          '65 card sleeves',
          '40 Pokémon TCG Energy cards',
          'A player’s guide to the Mega Evolution—Ascended Heroes expansion',
          '6 damage-counter dice',
          '1 competition-legal coin-flip die',
          '1 plastic coin',
          'A collector’s box with 6 dividers',
          'A code card for Pokémon Trading Card Game Live'
        ),
      },
      {
        name: 'Elite Trainer Box',
        price: 210,
        stock: 7,
        imageUrl: '/images/variants/ascended-heroes-etb.png',
        description: bullets(
          '9 Pokémon TCG: Mega Evolution—Ascended Heroes booster packs',
          '1 full-art foil promo card featuring N’s Zekrom',
          '65 card sleeves',
          '40 Pokémon TCG Energy cards',
          'A player’s guide to the Mega Evolution—Ascended Heroes expansion',
          '6 damage-counter dice',
          '1 competition-legal coin-flip die',
          '1 plastic coin',
          'A collector’s box with 6 dividers',
          'A code card for Pokémon Trading Card Game Live'
        ),
      },
      {
        name: 'Tech Sticker Collection',
        price: 58,
        stock: 5,
        imageUrl: '/images/variants/ascended-heroes-tech-sticker.png',
        description: bullets(
          '1 foil promo card featuring Charmander or Gastly',
          '1 tech sticker sheet',
          '3 Pokémon TCG: Mega Evolution—Ascended Heroes booster packs'
        ),
      },
      {
        name: 'Premium Poster Collection',
        price: 210,
        stock: 8,
        imageUrl: '/images/variants/ascended-heroes-premium-poster.png',
        description: bullets(
          '1 foil promo card featuring Mega Gardevoir ex or Mega Lucario ex',
          '1 double-sided poster measuring 26.875 × 39 inches',
          '10 Pokémon TCG: Mega Evolution—Ascended Heroes booster packs',
          'A code card for Pokémon TCG Live'
        ),
      },
      {
        name: 'Erika Collection',
        price: 40,
        stock: 4,
        imageUrl: '/images/variants/ascended-heroes-erika-collection.png',
        description: bullets(
          '1 foil promo card featuring Erika’s Tangela',
          '1 Pokémon coin featuring Erika',
          '2 Pokémon TCG: Mega Evolution—Ascended Heroes booster packs'
        ),
      },
      {
        name: 'Larry Collection',
        price: 40,
        stock: 6,
        imageUrl: '/images/variants/ascended-heroes-larry-collection.png',
        description: bullets(
          '1 foil promo card featuring Larry’s Komala',
          '1 Pokémon coin featuring Larry',
          '2 Pokémon TCG: Mega Evolution—Ascended Heroes booster packs'
        ),
      },
    ],
  },
  standardSet({
    name: 'Mega Evolution—Perfect Order',
    slug: 'mega-evolution-perfect-order',
    description:
      'Mega Zygarde ex protects the rhythm and order of Lumiose City while Mega Clefable ex, Mega Starmie ex, Meowth ex, and other Pokémon enjoy more peaceful days.',
    imageUrl: '/images/products/mega-evolution-perfect-order.png',
    promo: 'Tyrunt',
    prices: [190, 100, 50, 240, 50],
    stocks: [9, 5, 7, 2, 8],
    images: [
      '/images/variants/perfect-order-pokemon-center-etb.png',
      '/images/variants/perfect-order-etb.png',
      '/images/variants/perfect-order-booster-bundle.png',
      '/images/variants/perfect-order-booster-display.png',
      '/images/variants/perfect-order-build-battle.png',
    ],
  }),
  standardSet({
    name: 'Mega Evolution—Chaos Rising',
    slug: 'mega-evolution-chaos-rising',
    description:
      'Mega Floette ex brings turmoil to the city, while Mega Greninja ex rallies Mega Pyroar ex, Mega Dragalge ex, and other Mega Evolution Pokémon ex against the growing threat.',
    imageUrl: '/images/products/mega-evolution-chaos-rising.png',
    promo: 'Fennekin',
    prices: [245, 100, 55, 250, 42],
    stocks: [4, 6, 10, 3, 7],
    images: [
      '/images/variants/chaos-rising-pokemon-center-etb.png',
      '/images/variants/chaos-rising-etb.png',
      '/images/variants/chaos-rising-booster-bundle.png',
      '/images/variants/chaos-rising-booster-display.png',
      '/images/variants/chaos-rising-build-battle.png',
    ],
  }),
]

function assert(condition, message) {
  if (!condition) throw new Error(message)
}

async function main() {
  assert(process.env.DATABASE_URL, 'DATABASE_URL is required')

  const client = new Client({ connectionString: process.env.DATABASE_URL })
  await client.connect()

  try {
    await client.query('BEGIN')
    await client.query('SET TRANSACTION ISOLATION LEVEL SERIALIZABLE')
    await client.query("SELECT pg_advisory_xact_lock(hashtext('mock-pokemon-catalogue-import'))")

    const database = await client.query('SELECT current_database() AS database, current_schema() AS schema')
    assert(database.rows[0]?.database === 'neondb', 'Expected database neondb')
    assert(database.rows[0]?.schema === 'public', 'Expected schema public')

    const adminCount = await client.query('SELECT COUNT(*)::int AS count FROM "User" WHERE role = \'ADMIN\'')
    assert(adminCount.rows[0].count === 1, 'Expected exactly one admin account')

    const migrationState = await client.query(
      'SELECT COUNT(*) FILTER (WHERE finished_at IS NOT NULL AND rolled_back_at IS NULL)::int AS complete, COUNT(*) FILTER (WHERE finished_at IS NULL OR rolled_back_at IS NOT NULL)::int AS incomplete FROM "_prisma_migrations"'
    )
    assert(migrationState.rows[0].complete === 18, 'Expected 18 completed migrations')
    assert(migrationState.rows[0].incomplete === 0, 'Expected no incomplete migrations')

    const templateResult = await client.query(
      'SELECT p.*, cp."categoryId" FROM "Product" p JOIN "CategoryProduct" cp ON cp."productId" = p.id JOIN "Category" c ON c.id = cp."categoryId" WHERE p.slug = $1 AND c.slug = $2 FOR UPDATE',
      [pitchBlackUpdate.slug, 'pokemon-english']
    )
    assert(templateResult.rowCount === 1, 'Expected the existing Pitch Black product in Pokemon English')
    const template = templateResult.rows[0]

    const existingNewSets = await client.query(
      'SELECT slug FROM "Product" WHERE slug = ANY($1::text[])',
      [newSets.map((set) => set.slug)]
    )
    assert(existingNewSets.rowCount === 0, `New-set slugs already exist: ${existingNewSets.rows.map((row) => row.slug).join(', ')}`)

    const pitchVariants = await client.query(
      'SELECT id, combination FROM "ProductVariant" WHERE "productId" = $1 FOR UPDATE',
      [template.id]
    )
    assert(pitchVariants.rowCount === pitchBlackUpdate.variants.length, 'Expected five Pitch Black variants')

    for (const update of pitchBlackUpdate.variants) {
      const match = pitchVariants.rows.find((variant) => variant.combination?.Format === update.name)
      assert(match, `Missing Pitch Black variant: ${update.name}`)
      await client.query(
        'UPDATE "ProductVariant" SET price = $1, stock = $2, "updatedAt" = NOW() WHERE id = $3',
        [update.price, update.stock, match.id]
      )
    }

    await client.query('UPDATE "Product" SET archived = FALSE, "updatedAt" = NOW() WHERE id = $1', [template.id])

    for (const set of newSets) {
      const productId = randomUUID()
      await client.query(
        'INSERT INTO "Product" (id, "productTypeId", name, slug, description, attributes, "variantOptions", "imageUrl", archived, "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, $5, $6::jsonb, $7::jsonb, $8, TRUE, NOW(), NOW())',
        [
          productId,
          template.productTypeId,
          set.name,
          set.slug,
          set.description,
          JSON.stringify(template.attributes ?? {}),
          JSON.stringify({ Format: set.variants.map((variant) => variant.name) }),
          set.imageUrl,
        ]
      )

      await client.query(
        'INSERT INTO "CategoryProduct" (id, "categoryId", "productId") VALUES ($1, $2, $3)',
        [randomUUID(), template.categoryId, productId]
      )

      for (const variant of set.variants) {
        await client.query(
          'INSERT INTO "ProductVariant" (id, "productId", combination, description, price, stock, sku, "imageUrl", "createdAt", "updatedAt") VALUES ($1, $2, $3::jsonb, $4, $5, $6, NULL, $7, NOW(), NOW())',
          [
            randomUUID(),
            productId,
            JSON.stringify({ Format: variant.name }),
            variant.description,
            variant.price,
            variant.stock,
            variant.imageUrl,
          ]
        )
      }

      await client.query('UPDATE "Product" SET archived = FALSE, "updatedAt" = NOW() WHERE id = $1', [productId])
    }

    const verification = await client.query(
      'SELECT p.slug, p.archived, jsonb_array_length(p."variantOptions"->\'Format\')::int AS options, COUNT(v.id)::int AS variants, MIN(v.price) AS min_price, MAX(v.price) AS max_price, MIN(v.stock)::int AS min_stock, MAX(v.stock)::int AS max_stock, COUNT(*) FILTER (WHERE v.description IS NULL OR btrim(v.description) = \'\')::int AS missing_descriptions, COUNT(*) FILTER (WHERE v."imageUrl" IS NULL OR btrim(v."imageUrl") = \'\')::int AS missing_images FROM "Product" p JOIN "CategoryProduct" cp ON cp."productId" = p.id JOIN "Category" c ON c.id = cp."categoryId" JOIN "ProductVariant" v ON v."productId" = p.id WHERE c.slug = $1 GROUP BY p.id, p.slug, p.archived ORDER BY p.slug',
      ['pokemon-english']
    )

    assert(verification.rowCount === 7, 'Expected seven Pokemon English sets after import')
    assert(verification.rows.every((row) => row.archived === false), 'Expected every imported set to be unarchived')
    assert(verification.rows.every((row) => row.options === row.variants), 'Every product option must map to a variant')
    assert(verification.rows.every((row) => row.min_stock >= 1 && row.max_stock <= 10), 'Expected stock values from 1 through 10')
    assert(verification.rows.every((row) => row.missing_descriptions === 0), 'Every variant must have product contents')
    assert(verification.rows.every((row) => row.missing_images === 0), 'Every variant must have an image')

    await client.query('COMMIT')
    console.log(JSON.stringify({ importedSets: newSets.length, repricedSet: pitchBlackUpdate.slug, verification: verification.rows }, null, 2))
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
