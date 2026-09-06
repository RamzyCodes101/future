/**
 * The catalogue the site runs on before Sanity is connected.
 *
 * This exists so the site is reviewable on day one — a designer can judge the
 * grid, the choreography and the price typography without anyone having set up
 * a CMS account. The moment NEXT_PUBLIC_SANITY_PROJECT_ID is present, every
 * read in lib/catalogue.ts switches to live Sanity content and this file stops
 * being used.
 */
import type {
  Category,
  Collection,
  JournalPost,
  LookbookEntry,
  Product,
  SiteSettings,
  Variant,
} from './types'

const img = (file: string, alt: string) => ({ url: `/img/${file}.svg`, alt })

const sizes = (stock: number, colour: string): Variant[] =>
  ['XS', 'S', 'M', 'L', 'XL'].map((size, i) => ({
    _key: `${colour}-${size}`,
    size,
    colour,
    stock: i === 0 || i === 4 ? Math.max(0, stock - 2) : stock,
  }))

export const categories: Category[] = [
  { _id: 'cat-kaftans', title: 'Kaftans & Tunics', slug: 'kaftans-tunics' },
  { _id: 'cat-sets', title: 'Two-Piece Sets', slug: 'two-piece-sets' },
  { _id: 'cat-ceremonial', title: 'Boubou & Agbada', slug: 'boubou-agbada' },
  { _id: 'cat-wrappers', title: 'Wrappers & Skirts', slug: 'wrappers-skirts' },
  { _id: 'cat-headwear', title: 'Headwear', slug: 'headwear' },
  { _id: 'cat-outerwear', title: 'Outerwear', slug: 'outerwear' },
]

const cat = (slug: string) => categories.find((c) => c.slug === slug)!

export const products: Product[] = [
  {
    _id: 'p-01',
    name: 'Sankofa Appliqué Kaftan',
    slug: 'sankofa-applique-kaftan',
    images: [
      img('product-sankofa-1', 'Sankofa kaftan in raw cotton with terracotta appliqué panel'),
      img('product-sankofa-2', 'Sankofa kaftan, back view showing the side vents'),
    ],
    price: 1450,
    category: cat('kaftans-tunics'),
    variants: sizes(6, 'Raw Cotton'),
    fabric: '100% Ghanaian-milled cotton poplin, hand-appliquéd panel',
    careInstructions: 'Cold hand wash separately. Line dry in shade. Warm iron on reverse.',
    description:
      'A mandarin-collar kaftan cut long and lean, with a single hand-drawn line portrait running across the chest and a terracotta patch pocket set slightly off-centre. Deep side vents let it move. Cut in our Osu atelier, three days per piece.',
    status: 'active',
    featured: true,
    madeToOrder: false,
  },
  {
    _id: 'p-02',
    name: 'Adinkra Fan Two-Piece',
    slug: 'adinkra-fan-two-piece',
    images: [
      img('product-adinkra-1', 'Jade wax-print two-piece with fan motif'),
      img('product-adinkra-2', 'Adinkra fan set, detail of the bell sleeve'),
    ],
    price: 2100,
    compareAtPrice: 2600,
    category: cat('two-piece-sets'),
    variants: sizes(4, 'Jade'),
    fabric: 'Dutch wax cotton, crocheted trim',
    careInstructions: 'Dry clean recommended. Do not tumble dry.',
    description:
      'A peplum top with dramatic bell sleeves over a column skirt, in a peacock-fan wax print. The crocheted navy trim is worked by hand along every edge — the detail that takes the piece from printed to made.',
    status: 'active',
    featured: true,
    madeToOrder: false,
  },
  {
    _id: 'p-03',
    name: 'Akoma Wave Co-Ord',
    slug: 'akoma-wave-co-ord',
    images: [
      img('product-akoma-1', 'Red and white wave-print co-ord, robe and trouser'),
      img('product-akoma-2', 'Akoma co-ord, trouser detail'),
    ],
    price: 1850,
    category: cat('two-piece-sets'),
    variants: sizes(5, 'Oxblood / Bone'),
    fabric: 'Cotton voile, block-printed',
    careInstructions: 'Cold machine wash, gentle cycle. Line dry.',
    description:
      'An unstructured robe and a high-waisted wide-leg trouser in the same diagonal wave print. Worn together it reads as a suit; split it and each half works alone. Unisex sizing.',
    status: 'active',
    featured: true,
    madeToOrder: false,
  },
  {
    _id: 'p-04',
    name: 'Kente Lattice Agbada',
    slug: 'kente-lattice-agbada',
    images: [
      img('product-agbada-1', 'Ivory agbada with jade lattice weave'),
      img('product-agbada-2', 'Agbada with champagne embroidery at the neckline'),
    ],
    price: 4200,
    category: cat('boubou-agbada'),
    variants: sizes(3, 'Ivory'),
    fabric: 'Hand-woven kente strip cloth, silk-cotton blend',
    careInstructions: 'Dry clean only. Store flat, wrapped in the cotton bag provided.',
    description:
      'A three-piece ceremonial agbada — flowing outer robe, inner tunic and trouser — with hand-woven kente strips set into the lattice at the yoke. Twelve days on the loom before a single stitch is sewn.',
    status: 'active',
    featured: true,
    madeToOrder: true,
  },
  {
    _id: 'p-05',
    name: 'Damask Ceremonial Boubou',
    slug: 'damask-ceremonial-boubou',
    images: [
      img('product-boubou-1', 'Oxblood damask boubou with gold diamond lattice'),
      img('product-boubou-2', 'Boubou shown with matching gele'),
    ],
    price: 3800,
    category: cat('boubou-agbada'),
    variants: sizes(3, 'Oxblood'),
    fabric: 'Brocade damask with hand-set bead detailing',
    careInstructions: 'Dry clean only. Do not iron the beadwork.',
    description:
      'A full-sweep boubou in bronze-toned damask, the diamond lattice picked out in gold thread and finished with hand-set beads along the border. Cut for occasion — weddings, naming ceremonies, the outdooring.',
    status: 'active',
    featured: false,
    madeToOrder: true,
  },
  {
    _id: 'p-06',
    name: 'Adire Indigo Shirt',
    slug: 'adire-indigo-shirt',
    images: [
      img('product-shirt-1', 'Jade adire shirt with line motif'),
      img('product-shirt-2', 'Adire shirt, cuff detail'),
    ],
    price: 890,
    category: cat('kaftans-tunics'),
    variants: sizes(8, 'Indigo'),
    fabric: 'Resist-dyed cotton, naturally dyed indigo',
    careInstructions: 'Cold wash separately for the first three washes — indigo bleeds.',
    description:
      'A boxy camp-collar shirt in resist-dyed indigo. No two are the same; the dye decides. Wears in rather than out.',
    status: 'active',
    featured: false,
    madeToOrder: false,
  },
  {
    _id: 'p-07',
    name: 'Osu Wrapper Skirt',
    slug: 'osu-wrapper-skirt',
    images: [
      img('product-wrapper-1', 'Charcoal wrapper skirt with lattice print'),
      img('product-wrapper-2', 'Wrapper skirt tied at the hip'),
    ],
    price: 720,
    category: cat('wrappers-skirts'),
    variants: sizes(9, 'Charcoal'),
    fabric: 'Wax cotton, unlined',
    careInstructions: 'Cold hand wash. Line dry in shade.',
    description:
      'Two metres of wax cotton with a concealed waist tape, so it holds a clean line without pins. Wraps three ways — hip, waist, or full-length with the fold at the front.',
    status: 'active',
    featured: false,
    madeToOrder: false,
  },
  {
    _id: 'p-08',
    name: 'Fan Motif Gele',
    slug: 'fan-motif-gele',
    images: [
      img('product-gele-1', 'Jade and champagne gele head wrap'),
      img('product-gele-2', 'Gele tied, three-quarter view'),
    ],
    price: 380,
    category: cat('headwear'),
    variants: [{ _key: 'os-jade', size: 'One size', colour: 'Jade', stock: 14 }],
    fabric: 'Aso-oke, hand-woven',
    careInstructions: 'Spot clean only. Roll to store — never fold.',
    description:
      'Two and a half metres of hand-woven aso-oke with enough body to hold a sculptural tie. Sold with a short film showing three ways to tie it.',
    status: 'active',
    featured: false,
    madeToOrder: false,
  },
  {
    _id: 'p-09',
    name: 'Accra Line Tunic',
    slug: 'accra-line-tunic',
    images: [
      img('product-tunic-1', 'Bone tunic with taupe lattice'),
      img('product-tunic-2', 'Line tunic, hem detail'),
    ],
    price: 980,
    category: cat('kaftans-tunics'),
    variants: sizes(7, 'Bone'),
    fabric: 'Washed linen',
    careInstructions: 'Machine wash cold. Tumble dry low to keep the crumple.',
    description:
      'A washed-linen tunic that creases on purpose. Dropped shoulder, half-placket, split hem. The everyday piece in the collection.',
    status: 'active',
    featured: false,
    madeToOrder: false,
  },
  {
    _id: 'p-10',
    name: 'Kente Strip Bomber',
    slug: 'kente-strip-bomber',
    images: [
      img('product-kente-1', 'Black bomber with champagne kente strips'),
      img('product-kente-2', 'Bomber, sleeve and rib detail'),
    ],
    price: 2450,
    category: cat('outerwear'),
    variants: sizes(4, 'Noir'),
    fabric: 'Japanese cotton twill shell, hand-woven kente panels, satin lining',
    careInstructions: 'Dry clean only.',
    description:
      'A bomber in heavy black twill with hand-woven kente strips running down each sleeve. Ribbed collar, cuffs and hem in matching black so the weave is the only thing that speaks.',
    status: 'active',
    featured: true,
    madeToOrder: false,
  },
  {
    _id: 'p-11',
    name: 'Fan Print Wrap Dress',
    slug: 'fan-print-wrap-dress',
    images: [
      img('product-adire-1', 'Charcoal wrap dress with taupe fan print'),
      img('product-adire-2', 'Wrap dress, tie detail'),
    ],
    price: 1650,
    category: cat('two-piece-sets'),
    variants: sizes(5, 'Charcoal'),
    fabric: 'Viscose crepe, digitally printed',
    careInstructions: 'Cold hand wash or dry clean. Cool iron.',
    description:
      'A true wrap dress in fluid crepe — no hidden zip, no false wrap. Ties at the waist and again inside so it stays honest through a whole evening.',
    status: 'active',
    featured: false,
    madeToOrder: false,
  },
  {
    _id: 'p-12',
    name: 'Ceremonial Kaftan, Noir',
    slug: 'ceremonial-kaftan-noir',
    images: [
      img('product-kaftan-1', 'Mist kaftan with oxblood line motif'),
      img('product-kaftan-2', 'Kaftan, embroidery detail at the placket'),
    ],
    price: 2900,
    category: cat('boubou-agbada'),
    variants: sizes(3, 'Noir'),
    fabric: 'Silk-cotton, hand-embroidered placket',
    careInstructions: 'Dry clean only.',
    description:
      'The dress kaftan — floor length, hand-embroidered down the placket in matching thread so it catches light rather than colour. Made to order in your measurements.',
    status: 'active',
    featured: false,
    madeToOrder: true,
  },
]

export const collections: Collection[] = [
  {
    _id: 'col-1',
    title: 'Harmattan',
    slug: 'harmattan',
    season: 'SS26',
    standfirst:
      'Named for the dry wind that carries Sahara dust down over Accra every December, turning the light the colour of raw cotton. Twelve pieces built for that light.',
    heroImage: img('editorial-fabric', 'Harmattan campaign image'),
    productSlugs: [
      'sankofa-applique-kaftan',
      'adinkra-fan-two-piece',
      'akoma-wave-co-ord',
      'kente-strip-bomber',
      'kente-lattice-agbada',
      'adire-indigo-shirt',
    ],
  },
]

export const lookbook: LookbookEntry[] = [
  { _id: 'l1', title: 'Jamestown, 06:40', image: img('look-1', 'Model on the lighthouse steps at dawn') },
  { _id: 'l2', title: 'Osu Atelier', image: img('look-2', 'Fitting room, bone kaftan on the stand') },
  { _id: 'l3', title: 'Labadi', image: img('look-3', 'Jade two-piece against the sea wall') },
  { _id: 'l4', title: 'Independence Arch', image: img('look-4', 'Oxblood boubou, full sweep') },
  { _id: 'l5', title: 'Makola', image: img('look-5', 'Charcoal set in the fabric market') },
  { _id: 'l6', title: 'Aburi, 17:20', image: img('look-6', 'Wrapper skirt in the gardens') },
]

export const journal: JournalPost[] = [
  {
    _id: 'j1',
    title: 'Twelve Days on the Loom',
    slug: 'twelve-days-on-the-loom',
    excerpt:
      'Why a single agbada takes longer to weave than to design, and what we learned trying to shorten it.',
    publishedAt: '2026-07-14',
    image: img('journal-1', 'Kente strips on the loom'),
    body: [
      'Kwame has been weaving since he was nine. He works a four-heddle loom in a compound in Bonwire, and the strips he sends us are four inches wide — the width has not changed in three hundred years, because the loom has not changed.',
      'We tried, once, to have the strips woven wider on a mechanised loom in Tema. They came back flat. The tension was even in a way hand-woven cloth never is, and the light died on the surface. We went back to Bonwire.',
      'Twelve days per garment is the real cost of the thing. We build it into the lead time instead of hiding it.',
    ],
  },
  {
    _id: 'j2',
    title: 'On Indigo, and Letting the Dye Decide',
    slug: 'on-indigo',
    excerpt: 'Every adire shirt we make is different. That is the point, and it is also a production problem.',
    publishedAt: '2026-06-02',
    image: img('journal-2', 'Indigo vat'),
    body: [
      'Natural indigo is a living vat. It shifts with temperature, with how long since it was last fed, with the weather. Two shirts dipped an hour apart are not the same shirt.',
      'For a fashion business this is inconvenient. Customers see one photograph and receive something adjacent to it. So we photograph three of every indigo piece and show all three.',
    ],
  },
  {
    _id: 'j3',
    title: 'Making Clothes in Accra',
    slug: 'making-clothes-in-accra',
    excerpt: 'The case for keeping the whole chain — mill, dye house, atelier — inside Ghana.',
    publishedAt: '2026-04-28',
    image: img('journal-3', 'The Osu atelier'),
    body: [
      'It would be cheaper to cut in Asia. It would also mean the money leaves, the skills leave, and in ten years there is nobody in Osu who can set a sleeve.',
      'So we pay more per unit and we say so on the price tag. This is what the number is for.',
    ],
  },
]

export const siteSettings: SiteSettings = {
  announcement: 'Complimentary delivery within Greater Accra on orders over GHS 1,500',
  freeShippingThreshold: 1500,
  shippingZones: [
    { _key: 'z1', label: 'Greater Accra', rate: 40 },
    { _key: 'z2', label: 'Other regions (Ghana)', rate: 90 },
    { _key: 'z3', label: 'West Africa', rate: 350 },
    { _key: 'z4', label: 'Rest of world', rate: 750 },
  ],
  whatsappNumber: '233200000000',
  studioAddress: '18 Oxford Street, Osu, Accra',
  email: 'atelier@fashionova.com',
  instagram: 'fashionova',
}
