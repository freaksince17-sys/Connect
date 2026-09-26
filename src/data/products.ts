import { Product, DeliveryZone, Testimonial, TikTokReel, CraftStoryData, InstagramJournalItem } from '../types';
import { PRODUCT_REVIEWS_MAP } from '../utils/productStats';

export const DEFAULT_INSTAGRAM_HANDLE = '@artified_np';
export const DEFAULT_INSTAGRAM_PROFILE_URL = 'https://www.instagram.com/artified_np/';

export const DEFAULT_INSTAGRAM_ITEMS: InstagramJournalItem[] = [];

export const DEFAULT_CRAFT_STORY: CraftStoryData = {
  badge: 'Our Handmade Craft',
  title: 'Wearable Art Reborn in the Heart of the Valley',
  paragraph1: 'Founded on the belief that accessories should carry soulful human devotion, Artified_np merges contemporary high-fashion aesthetics with slow, heritage-rooted Newari and Nepali craftsmanship.',
  paragraph2: 'Each pearl bag is built without shortcuts. Unlike factory-pressed bags, our makers calculate tension by hand using commercial-grade monofilament fishing cores. If one bead encounters friction, the entire structure stays secure. We celebrate natural irregularities in our freshwater baroque pearls and use unbleached Nepali cotton cords for our macrame collections.',
  stat1Number: '9+',
  stat1Label: 'Hours Per Bag',
  stat2Number: '100%',
  stat2Label: 'Nepal Crafted',
  image1: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=600&q=80',
  image2: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=600&q=80',
  videoUrl: '',
  videoButtonLabel: "Watch How It's Handcrafted",
  pillar1Title: 'Fair Living Wages',
  pillar1Desc: 'Fair compensation empowering local women makers in Lalitpur and Bhaktapur.',
  pillar2Title: 'Zero Fast Fashion',
  pillar2Desc: 'Made in limited small batches to eliminate excess waste and celebrate longevity.',
  pillar3Title: 'Heirloom Durability',
  pillar3Desc: 'Reinforced 15kg+ tensile core with easy exchange within 24 hrs for peace of mind.'
};

export const DELIVERY_ZONES: DeliveryZone[] = [
  {
    id: 'inside_ring_road',
    name: 'Inside Ring Road (Kathmandu / Lalitpur)',
    area: 'Kathmandu Central, Thamel, Jhamsikhel, Baluwatar, New Road, Lazimpat, Baneshwor',
    fee: 100,
    estimatedDays: '1–2 business days',
    description: 'Fast doorstep bike courier within Kathmandu Valley Ring Road'
  },
  {
    id: 'outside_ring_road',
    name: 'Outside Ring Road (Lalitpur / Bhaktapur / Kapan / Budhanilkantha)',
    area: 'Bhaktapur Durbar area, Kapan, Budhanilkantha, Dhapakhel, Imadol, Kirtipur, Thimi',
    fee: 150,
    estimatedDays: '2–3 business days',
    description: 'Extended valley doorstep delivery via express parcel service'
  },
  {
    id: 'outside_valley',
    name: 'Outside Kathmandu Valley (Major Cities in Nepal)',
    area: 'Pokhara, Chitwan, Butwal, Biratnagar, Dharan, Nepalgunj, Itahari, Birtamode, Hetauda',
    fee: 220,
    estimatedDays: '3–5 business days',
    description: 'Reliable nationwide courier delivery with SMS tracking updates'
  }
];

export const PRODUCTS: Product[] = [
  {
    id: 'maya-aurelia-pearl-bag',
    title: 'Pearl Beaded Handbag',
    subtitle: 'An elegant, secure pearl beaded handbag perfect for special occasions.',
    category: 'pearl-bags',
    price: 2499,
    originalPrice: 3000,
    rating: 4.9,
    reviewsCount: 38,
    isHandmade: true,
    isBestSeller: true,
    isNewArrival: false,
    inStock: true,
    stockCount: 6,
    leadTime: 'Handmade to order: 2–4 business days',
    materials: [
      'High-grade textured berry pearl beads with lustrous finish',
      'Dual-reinforced nylon monofilament core (tensile strength > 15kg)',
      'Secure magnetic snap lock for effortless access',
      'Compact structured envelope silhouette'
    ],
    dimensions: '18cm (L) × 14cm (H) × 6cm (W) • Handle drop: 12cm',
    weight: '380g',
    description: 'Introducing the elegant Pearl Beaded Handbag, a stylish accessory for any special occasion. This handbag features a secure lockable design with magnetic snaps for easy access. The exquisite pearl beading adds a touch of sophistication, making it a perfect choice for formal events or evening gatherings. Its compact size and versatile style make it an ideal companion for women who appreciate both fashion and functionality. Elevate your ensemble with this charming Pearl Beaded Handbag and make a statement wherever you go.',
    stylingTip: 'Pair with an evening gown, a classic saree, or a tailored chic blazer for weddings, galas, and festive celebrations.',
    careNotes: [
      'Avoid direct spray of perfumes, alcohol sprays, and body lotions onto pearls.',
      'Gently wipe with the provided microfiber polishing cloth after wear.',
      'Store in the custom breathable cotton dust pouch away from direct midday sun.'
    ],
    images: [
      'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=900&q=80'
    ],
    tags: ['Best Seller', 'Pearl Beaded', 'Red Evening Bag', 'Festive Special', 'Nepal Handmade'],
    customReviews: PRODUCT_REVIEWS_MAP['maya-aurelia-pearl-bag']
  },
  {
    id: 'lalitpur-bloom-pearl-tote',
    title: 'Lalitpur Bloom Rosette Pearl Handbag',
    subtitle: 'Architectural floral lattice beadwork with solid pearl arched handle',
    category: 'pearl-bags',
    price: 4850,
    originalPrice: 5400,
    rating: 5.0,
    reviewsCount: 24,
    isHandmade: true,
    isBestSeller: true,
    isNewArrival: true,
    inStock: true,
    stockCount: 4,
    leadTime: 'Handmade to order: 3–5 business days',
    materials: [
      '8mm & 12mm Graduated pearl rosettes',
      'Heavy-duty bonded fishing-grade transparent wire',
      'Reinforced arched pearl top-handle',
      'Champagne velvet internal pouch'
    ],
    dimensions: '21cm (L) × 16cm (H) × 7cm (W) • Top handle: 10cm',
    weight: '440g',
    description: 'Inspired by traditional Newari wood-carved floral lattices found across Kathmandu Durbar Square, the Lalitpur Bloom combines geometric discipline with romantic fluidity. Each bag requires over 650 hand-threaded pearls positioned in interlocking rosette clusters.',
    stylingTip: 'Complements festive lehengas, pastel kurta sets, and minimalist summer sundresses alike.',
    careNotes: [
      'Keep away from rough abrasive sequins or sharp metal jewelry.',
      'Do not machine wash or soak in water. Spot clean with damp soft towel.'
    ],
    images: [
      'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=900&q=80'
    ],
    tags: ['Handmade', 'Exclusive', 'New Arrival'],
    customReviews: PRODUCT_REVIEWS_MAP['lalitpur-bloom-pearl-tote']
  },
  {
    id: 'chandra-baroque-pearl-choker',
    title: 'Chandra Asymmetric Baroque Pearl Choker',
    subtitle: 'Genuine freshwater organic baroque pearls with 18k gold vermeil lock',
    category: 'pearl-necklaces',
    price: 2450,
    originalPrice: 2800,
    rating: 4.85,
    reviewsCount: 42,
    isHandmade: true,
    isBestSeller: true,
    isNewArrival: false,
    inStock: true,
    stockCount: 11,
    leadTime: 'Crafted & dispatched in 1–2 business days',
    materials: [
      'Natural cultured freshwater baroque pearls (9–11mm organic shape)',
      '18k Gold-plated hypoallergenic brass toggle clasp',
      'Hand-knotted silk thread between individual pearls for security'
    ],
    dimensions: 'Length: 38cm + 5cm adjustable extension chain',
    weight: '32g',
    description: 'Named after the celestial moon, the Chandra choker celebrates natural irregularity. No two baroque pearls are identical, creating a tactile, organic piece that sits flatteringly on the collarbone. Hand-knotted with Nepali silk thread to prevent pearls from rubbing against one another.',
    stylingTip: 'Layer with a delicate gold coin pendant or wear solo against an open-collar linen shirt or sweetheart neckline blouse.',
    careNotes: [
      'Put your pearls on last when getting dressed (after perfume, hairspray, makeup).',
      'Store flat in a jewelry pouch to prevent thread stretching.'
    ],
    images: [
      'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1611591475877-22a00c6d7a5b?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=900&q=80'
    ],
    tags: ['Freshwater Pearl', 'Everyday Luxury', 'Trending'],
    customReviews: PRODUCT_REVIEWS_MAP['chandra-baroque-pearl-choker']
  },
  {
    id: 'apsara-layered-pearl-collar',
    title: 'Three-Layered Pearl Necklace',
    subtitle: 'Exquisite triple-tier graduated pearl strands with luminous finish',
    category: 'pearl-necklaces',
    price: 3100,
    originalPrice: 3600,
    rating: 4.95,
    reviewsCount: 28,
    isHandmade: true,
    isBestSeller: true,
    isNewArrival: true,
    inStock: true,
    stockCount: 7,
    leadTime: 'Handmade to order: 2 business days',
    materials: [
      'Graduated 6mm to 10mm high-sheen glass pearls',
      'Triple layered harmonic cascading strands',
      'Hypoallergenic secure vintage filigree box clasp'
    ],
    dimensions: 'Tier 1: 38cm, Tier 2: 42cm, Tier 3: 46cm with 5cm extension chain',
    weight: '56g',
    description: 'A classic three-layered handcrafted pearl necklace designed to make a timeless statement. Features three gracefully cascading tiers of lustrous pearls that contour naturally along the collarbone, fastened with a secure hypoallergenic clasp. Perfect for weddings, cultural festivities, and formal evening gatherings.',
    stylingTip: 'The ultimate wedding guest or festive statement piece. Elevates sarees, lehengas, high-neck velvet blouses, and modern evening gowns.',
    careNotes: [
      'Wipe clean with a damp lint-free cloth after celebratory evenings.',
      'Keep clasped when stored to prevent tangling.'
    ],
    images: [
      'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1611591475877-22a00c6d7a5b?auto=format&fit=crop&w=900&q=80'
    ],
    tags: ['Three Layered', 'Bridal', 'Statement Necklace', 'Trending'],
    customReviews: PRODUCT_REVIEWS_MAP['apsara-layered-pearl-collar']
  },
  {
    id: 'himalayan-breeze-macrame-tote',
    title: 'Himalayan Breeze Knotted Macrame Bag',
    subtitle: '100% Organic unbleached cotton cord with hand-turned wooden ring handles',
    category: 'macrame',
    price: 3600,
    originalPrice: 4100,
    rating: 4.88,
    reviewsCount: 31,
    isHandmade: true,
    isBestSeller: true,
    isNewArrival: false,
    inStock: true,
    stockCount: 8,
    leadTime: 'Crafted in 2–3 business days',
    materials: [
      '4mm 3-ply twisted organic cotton cord from local Nepali spinning mills',
      'Hand-turned natural sheesham wood circular hoop handles',
      'Removable organic cotton drawstring interior pouch'
    ],
    dimensions: '28cm (L) × 24cm (H) × 9cm (W) • Handle diameter: 14cm',
    weight: '380g',
    description: 'Handmade bohemian warmth crafted knot by knot. The Himalayan Breeze macrame tote uses intricate square and spiral knots to form an airy yet remarkably sturdy bag. Includes a fitted cotton canvas liner pouch so delicate valuables remain hidden and safe.',
    stylingTip: 'Ideal for brunch dates in Jhamsikhel, farmers markets at Le Sherpa, or lakeside strolls in Pokhara.',
    careNotes: [
      'Hand spot wash using mild organic detergent and lukewarm water.',
      'Reshape cord while damp and lay flat on a clean dry towel to dry naturally.'
    ],
    images: [
      'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=900&q=80'
    ],
    tags: ['Eco-friendly', 'Bohemian', 'Daily Carry'],
    customReviews: PRODUCT_REVIEWS_MAP['himalayan-breeze-macrame-tote']
  },
  {
    id: 'soma-petite-pearl-bucket',
    title: 'Soma Petite Pearl Bucket Pouch',
    subtitle: 'Cylindrical lattice pearl bucket with champagne satin drawstring insert',
    category: 'pearl-bags',
    price: 3850,
    originalPrice: 4400,
    rating: 4.95,
    reviewsCount: 17,
    isHandmade: true,
    isBestSeller: false,
    isNewArrival: true,
    inStock: true,
    stockCount: 5,
    leadTime: 'Handmade to order: 2–4 business days',
    materials: [
      'Solid 10mm glass pearls in champagne ivory',
      'Heavy tensile monofilament cage structure',
      'Custom champagne duchess satin drawstring inner pouch',
      'Braided pearl wristlet loop'
    ],
    dimensions: '14cm (Diameter) × 18cm (H) • Wristlet drop: 15cm',
    weight: '360g',
    description: 'Playful yet profoundly elegant, the Soma Bucket bag reinterprets the classic evening potli with architectural pearl construction. The structured cage keeps its cylindrical poise while the plush satin pouch cradles your mobile phone and cosmetics.',
    stylingTip: 'Swing it effortlessly from your wrist for festive celebrations, Dashain/Tihar parties, and graduation ceremonies.',
    careNotes: [
      'The interior satin pouch is detachable and can be gentle hand-washed separately.',
      'Store resting upright on a flat shelf.'
    ],
    images: [
      'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=900&q=80'
    ],
    tags: ['Potli Bag', 'Festive', 'TikTok Favorite'],
    customReviews: PRODUCT_REVIEWS_MAP['soma-petite-pearl-bucket']
  },
  {
    id: 'rani-triple-strand-necklace',
    title: 'Rani Royal Triple-Strand Pearl Choker',
    subtitle: 'Tri-layer graduated pearl necklace with gold bar separators',
    category: 'pearl-necklaces',
    price: 2900,
    originalPrice: 3300,
    rating: 4.89,
    reviewsCount: 28,
    isHandmade: true,
    isBestSeller: false,
    isNewArrival: false,
    inStock: true,
    stockCount: 9,
    leadTime: 'Dispatched within 1–2 business days',
    materials: [
      'High-gloss 7mm ivory glass pearls',
      '18k Gold-dipped structural vertical spacer bars',
      'Hypoallergenic lobster clasp with 6cm extender'
    ],
    dimensions: 'Three graduated layers (36cm, 39cm, 42cm)',
    weight: '56g',
    description: 'Commanding regal poise. The Rani necklace positions three impeccably calibrated strands across the neckline, kept in perfect symmetry by custom spacer bars. Crafted for momentous occasions where understated jewelry simply will not suffice.',
    stylingTip: 'Exquisite paired with deep boatneck necklines, sweetheart cuts, or traditional Nepali gunyu cholo and banarasi silk.',
    careNotes: [
      'Fasten clasp before storing to prevent overlapping strands from entangling.',
      'Keep separated from rough chains in your jewelry organizer.'
    ],
    images: [
      'https://images.unsplash.com/photo-1611591475877-22a00c6d7a5b?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=900&q=80'
    ],
    tags: ['Regal', 'Triple Layer', 'Bridal Jewelry'],
    customReviews: PRODUCT_REVIEWS_MAP['rani-triple-strand-necklace']
  },
  {
    id: 'indra-macrame-fringe-crossbody',
    title: 'Indra Macrame & Beaded Fringe Crossbody',
    subtitle: 'Intricate diamond knotted pattern with cascading pearl fringe tassels',
    category: 'macrame',
    price: 3250,
    originalPrice: 3750,
    rating: 4.82,
    reviewsCount: 15,
    isHandmade: true,
    isBestSeller: false,
    isNewArrival: true,
    inStock: true,
    stockCount: 6,
    leadTime: 'Handmade to order: 2–3 business days',
    materials: [
      'Premium ecru mercerized cotton cord',
      'Iridescent teardrop pearl beads along fringe hem',
      'Magnetic brass closure button inside flap',
      'Braided comfortable crossbody shoulder strap'
    ],
    dimensions: '22cm (L) × 18cm (H) + 10cm fringe • Strap drop: 52cm',
    weight: '310g',
    description: 'Dynamic movement with every step. The Indra blends tactile macrame knots with cascading fringe weighted by delicate teardrop pearls. Lightweight and versatile, it transitions seamlessly from daytime cafe lounging to evening concerts.',
    stylingTip: 'Drapes effortlessly across wide-leg trousers, maxi dresses, and denim jackets.',
    careNotes: [
      'Gently comb the fringe tassels with a wide-tooth comb to keep them straight.',
      'Hang to store rather than folding to preserve the tassel alignment.'
    ],
    images: [
      'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=900&q=80'
    ],
    tags: ['Crossbody', 'Boho Chic', 'Fringe Detail'],
    customReviews: PRODUCT_REVIEWS_MAP['indra-macrame-fringe-crossbody']
  },
  {
    id: 'tara-micro-pearl-clutch',
    title: 'Tara Micro Pearl Box Clutch',
    subtitle: 'Rigid structured evening clutch with detachable pearl crossbody sling',
    category: 'custom-beaded',
    price: 5200,
    originalPrice: 5900,
    rating: 4.97,
    reviewsCount: 22,
    isHandmade: true,
    isBestSeller: true,
    isNewArrival: false,
    inStock: true,
    stockCount: 3,
    leadTime: 'Handcrafted over 12 hours: 3–5 business days',
    materials: [
      'Multi-size 4mm to 14mm faux ivory pearls in high-density weave',
      'Reinforced internal acrylic chassis for permanent structural rigidity',
      'Twin-snap magnetic top flap lock',
      'Detachable 105cm pearl shoulder strap'
    ],
    dimensions: '18cm (L) × 11cm (H) × 5.5cm (W)',
    weight: '490g',
    description: 'The pinnacle of bespoke beading. The Tara Box Clutch is constructed around an invisible rigid frame, guaranteeing it will never lose its immaculate geometric shape over years of use. Each pearl is hand-troweled and knotted in a three-dimensional mosaic pattern.',
    stylingTip: 'Carry as a modern handheld minaudire or attach the long pearl strap for hands-free evening cocktails.',
    careNotes: [
      'Avoid dropping onto hard granite or concrete surfaces.',
      'Buff exterior regularly with soft dry microfiber.'
    ],
    images: [
      'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=900&q=80'
    ],
    tags: ['Collector Item', 'Luxury Gift', 'Evening Clutch'],
    customReviews: PRODUCT_REVIEWS_MAP['tara-micro-pearl-clutch']
  },
  {
    id: 'artified-pearl-charm-wristlet',
    title: 'Ayla Baroque Pearl Wristlet & Charm',
    subtitle: 'Handcrafted freshwater baroque pearl wristlet lanyard with 18k gold clasp',
    category: 'accessories',
    price: 950,
    originalPrice: 1200,
    rating: 4.95,
    reviewsCount: 16,
    soldCount: 38,
    isHandmade: true,
    isBestSeller: true,
    isNewArrival: true,
    inStock: true,
    stockCount: 12,
    leadTime: 'Handcrafted in Kathmandu: 1–2 business days',
    materials: [
      'Genuine freshwater baroque pearls (7–9mm)',
      '18k Gold-plated stainless steel swivel lobster clasp',
      'High-tensile braided silk-steel core'
    ],
    dimensions: 'Total length: 22cm • Wrist loop: 16cm',
    weight: '28g',
    description: 'An exquisite multipurpose accessory handcrafted in our Chikamugal store workshop. Functions as a luxury phone wristlet, keys lanyard, or an opulent hanging charm for your favorite pearl or leather bag.',
    stylingTip: 'Clip onto your Maya Aurelia Pearl Bag or use as a sophisticated phone strap for quick hands-free photo taking.',
    careNotes: [
      'Wipe pearls gently with a soft microfiber cloth.',
      'Keep away from harsh chemicals and perfumed lotions.'
    ],
    images: [
      'https://images.unsplash.com/photo-1611085583191-a3b181a88401?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=900&q=80'
    ],
    tags: ['Accessory', 'Bag Charm', 'Phone Lanyard', 'Freshwater Pearl'],
    customReviews: PRODUCT_REVIEWS_MAP['artified-pearl-charm-wristlet']
  },
  {
    id: 'kathmandu-macrame-strap-accessory',
    title: 'Himalayan Knotted Macrame Strap & Belt',
    subtitle: 'Intricate boho hand-knotted cotton utility strap with brass hardware',
    category: 'accessories',
    price: 1350,
    originalPrice: 1650,
    rating: 4.88,
    reviewsCount: 11,
    soldCount: 24,
    isHandmade: true,
    isBestSeller: false,
    isNewArrival: true,
    inStock: true,
    stockCount: 8,
    leadTime: 'Handmade to order: 2 business days',
    materials: [
      '100% Organic unbleached Nepali cotton cord',
      'Solid antique brass swivel trigger hooks',
      'Reinforced diamond knotting pattern'
    ],
    dimensions: 'Length: 110cm • Width: 3.8cm',
    weight: '110g',
    description: 'Versatile bohemian artistry knot by knot. Can be attached as a comfortable wide shoulder strap for your macrame or pearl bags, or worn as a chic statement belt around dresses and kurtas.',
    stylingTip: 'Swap onto any crossbody tote or wrap around linen shirts for an effortless Kathmandu artisan vibe.',
    careNotes: [
      'Spot clean with mild soap and cold water.',
      'Lay flat to dry naturally in shade.'
    ],
    images: [
      'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=900&q=80'
    ],
    tags: ['Macrame Accessory', 'Bag Strap', 'Boho Belt', 'Nepal Handmade'],
    customReviews: PRODUCT_REVIEWS_MAP['kathmandu-macrame-strap-accessory']
  }
];

export const TESTIMONIALS: Testimonial[] = [
  {
    id: 't1',
    author: 'Aayushi Khadgi',
    location: 'Baluwatar, Kathmandu',
    rating: 5,
    comment: 'The Maya Aurelia bag arrived in the most gorgeous packaging! You can instantly feel the weight and tight handmade weave. Received so many compliments at my cousin’s wedding reception at Soaltee.',
    productName: 'The Maya Aurelia Structured Pearl Bag',
    date: '2 weeks ago',
    verifiedPurchase: true
  },
  {
    id: 't2',
    author: 'Prerana Shahi',
    location: 'Jhamsikhel, Lalitpur',
    rating: 5,
    comment: 'Ordered custom initials for my Chandra baroque choker. The seller communicated on WhatsApp so politely and delivery inside Ring Road took just 1 day after finishing. 10/10 craftsmanship for Nepal!',
    productName: 'Chandra Asymmetric Baroque Pearl Choker',
    date: '1 month ago',
    verifiedPurchase: true
  },
  {
    id: 't3',
    author: 'Bhawana Gurung',
    location: 'Lakeside, Pokhara',
    rating: 5,
    comment: 'I was hesitant about shipping all the way to Pokhara, but Artified delivered via courier in 3 days with SMS updates. The macrame tote is even prettier in real life than on their TikTok reels!',
    productName: 'Himalayan Breeze Knotted Macrame Bag',
    date: '3 weeks ago',
    verifiedPurchase: true
  }
];

export const TIKTOK_REELS: TikTokReel[] = [
  {
    id: 'reel-1',
    title: 'POV: Hand-weaving 600 pearls into the Maya Aurelia bag 🤍',
    handle: '@artified_np',
    views: '142.5K',
    likes: '18.4K',
    thumbnail: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=600&q=80',
    videoUrl: '/tiktok_videos/7363984155060817160.mp4',
    videoCaption: 'Every single bag is knotted by hand right here in Chikamugal, Kathmandu, Nepal. Which style should we make next?',
    featuredProductName: 'The Maya Aurelia Structured Pearl Bag',
    featuredProductId: 'maya-aurelia-pearl-bag'
  },
  {
    id: 'reel-2',
    title: 'Styling our Chandra Baroque choker with 3 Nepali wedding fits ✨',
    handle: '@artified_np',
    views: '89.2K',
    likes: '11.8K',
    thumbnail: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=600&q=80',
    videoUrl: '/tiktok_videos/7495598629625842952.mp4',
    videoCaption: 'Natural baroque pearls hit differently when paired with rich silk sarees & pastel lehengas!',
    featuredProductName: 'Chandra Asymmetric Baroque Pearl Choker',
    featuredProductId: 'chandra-baroque-pearl-choker'
  },
  {
    id: 'reel-3',
    title: 'Unboxing a custom bridal gift set for a bride in Bhaktapur 🎀',
    handle: '@artified_np',
    views: '215.8K',
    likes: '29.1K',
    thumbnail: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=600&q=80',
    videoUrl: '/tiktok_videos/7625655459537603860.mp4',
    videoCaption: 'Comes with our signature luxury satin dust bag, handwritten note, and pearl care kit.',
    featuredProductName: 'Lalitpur Bloom Rosette Pearl Handbag',
    featuredProductId: 'lalitpur-bloom-pearl-tote'
  },
  {
    id: 'reel-4',
    title: 'What fits inside the Tara Box Clutch? (iPhone Pro Max test!) 📱✨',
    handle: '@artified_np',
    views: '96.4K',
    likes: '14.2K',
    thumbnail: 'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?auto=format&fit=crop&w=600&q=80',
    videoUrl: '/tiktok_videos/7363984155060817160.mp4',
    videoCaption: 'Yes, your phone, lipstick, compact powder, and car keys fit perfectly without stretching!',
    featuredProductName: 'Tara Micro Pearl Box Clutch',
    featuredProductId: 'tara-micro-pearl-clutch'
  }
];

export const FAQS = [
  {
    q: 'How long does delivery take inside and outside Kathmandu Valley?',
    a: 'Inside Ring Road (Kathmandu/Lalitpur): 1–2 business days. Outside Ring Road: 2–3 business days. Major cities across Nepal (Pokhara, Chitwan, Butwal, Biratnagar, etc.): 3–5 business days via trusted courier.'
  },
  {
    q: 'How do I pay with eSewa, Khalti, or Cash on Delivery (COD)?',
    a: 'We offer Cash on Delivery (COD) within Kathmandu Valley and major cities. For eSewa and Khalti, you can scan our official QR code during checkout or transfer directly, and paste your transaction ID or send screenshot via WhatsApp.'
  },
  {
    q: 'Where is your store located and can I pick up in person?',
    a: 'Our physical store is located in Chikamugal, Kathmandu, Nepal. You can visit us in Chikamugal to pick up your handcrafted pieces or order online for fast home delivery with Cash on Delivery (COD).'
  },
  {
    q: 'How durable are the pearl bags? Will the beads break?',
    a: 'Our bags are crafted using commercial-grade reinforced transparent nylon monofilament with a tensile strength exceeding 15kg. The beads will not shatter under everyday use, and each anchor point is cross-tied four times for long-lasting structural durability.'
  },
  {
    q: 'What is your exchange and inspection policy?',
    a: 'We offer easy exchange within 24 hrs of delivery if there is any issue or if you need an adjustment. Simply contact our Chikamugal, Kathmandu store on WhatsApp with your Order ID for immediate support.'
  }
];
