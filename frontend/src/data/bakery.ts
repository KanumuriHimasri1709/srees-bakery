export const storage = "/assets/gallery/";

export type GalleryPhoto = {
  src: string;
  label: string;
  category: string;
  aiContext: string;
};

export function getFallbackImage(label: string, category: string = "Bakery"): string {
  const bgColors = ["#4A2818", "#5D3422", "#3E2314", "#722F37", "#54212C", "#6B3A28", "#2E1A11"];
  const hash = label.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const color = bgColors[hash % bgColors.length];
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400"><rect width="600" height="400" fill="${color}"/><circle cx="300" cy="170" r="70" fill="#ffffff" opacity="0.10"/><text x="300" y="175" font-family="Georgia, serif" font-size="22" font-weight="600" fill="#ffffff" text-anchor="middle">${label}</text><text x="300" y="215" font-family="sans-serif" font-size="13" letter-spacing="3" fill="#E6C280" text-anchor="middle">SREE’S HOME BAKERY</text></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export const photos: GalleryPhoto[] = [
  { src: `${storage}original-001.jpg`, label: "Grand Celebration Cake", category: "Cakes", aiContext: "grand tiered celebration cake" },
  { src: `${storage}original-002.jpg`, label: "Floral Celebration Cake", category: "Cakes", aiContext: "floral cake with cream rosettes" },
  { src: `${storage}original-003.jpg`, label: "Festive Dessert Bake", category: "Special Treats", aiContext: "festive artisan bake" },
  { src: `${storage}original-004.jpg`, label: "Square Custom Cake", category: "Custom Cakes", aiContext: "square custom theme cake" },
  { src: `${storage}original-005.jpg`, label: "Artisan Pastry Slice", category: "Special Treats", aiContext: "fresh pastry slice" },
  { src: `${storage}original-006.jpg`, label: "Personalized Photo Cake", category: "Theme Cakes", aiContext: "custom photo printed cake" },
  { src: `${storage}original-007.jpg`, label: "Fresh Cookie Assortment", category: "Cookies", aiContext: "variety of freshly baked cookies" },
  { src: `${storage}original-008.jpg`, label: "Elegant Wedding Cake", category: "Cakes", aiContext: "tiered wedding celebration cake" },
  { src: `${storage}original-009.jpg`, label: "Packaged Dessert Treats", category: "Special Treats", aiContext: "artisan sweet dessert jars" },
  { src: `${storage}original-010.jpg`, label: "Purple Floral Theme Cake", category: "Theme Cakes", aiContext: "purple floral birthday cake" },
  { src: `${storage}original-011.jpg`, label: "Festive Sweet Confection", category: "Special Treats", aiContext: "sweet bakery delight" },
  { src: `${storage}original-012.jpg`, label: "Royal Blue Theme Cake", category: "Theme Cakes", aiContext: "blue celebration cake" },
  { src: `${storage}original-013.jpg`, label: "Celebration Cake Creation", category: "Birthday Cakes", aiContext: "festive birthday design" },
  { src: `${storage}original-014.jpg`, label: "Custom Message Cake", category: "Custom Cakes", aiContext: "cake with customized pipe message" },
  { src: `${storage}original-015.jpg`, label: "Artisan Cream Cake", category: "Cakes", aiContext: "smooth whipped cream cake" },
  { src: `${storage}original-016.jpg`, label: "Celebration Theme Bake", category: "Theme Cakes", aiContext: "custom themed celebration bake" },
  { src: `${storage}original-017.jpg`, label: "Tiered Event Cake", category: "Cakes", aiContext: "multi-tier event cake" },
  { src: `${storage}original-018.jpg`, label: "Signature Birthday Cake", category: "Birthday Cakes", aiContext: "colourful birthday party cake" },
  { src: `${storage}original-019.jpg`, label: "Pastel Celebration Cake", category: "Birthday Cakes", aiContext: "pastel frosted birthday cake" },
  { src: `${storage}original-020.jpg`, label: "Character Celebration Cake", category: "Theme Cakes", aiContext: "custom kid cartoon character cake" },
  { src: `${storage}original-021.jpg`, label: "Festive Occasion Cake", category: "Cakes", aiContext: "elaborate festive celebration cake" },
  { src: `${storage}original-022.jpg`, label: "Designer Floral Cake", category: "Custom Cakes", aiContext: "handcrafted sugar flower cake" },
  { src: `${storage}original-023.jpg`, label: "Chocolate Ganache Drip Cake", category: "Cakes", aiContext: "decadent chocolate drip with toppings" },
  { src: `${storage}original-024.jpg`, label: "Celebration Dessert Creation", category: "Special Treats", aiContext: "specialty dessert bake" },
  { src: `${storage}original-025.jpg`, label: "Party Theme Cake", category: "Theme Cakes", aiContext: "special occasion themed cake" },
  { src: `${storage}original-026.jpg`, label: "Custom Anniversary Cake", category: "Custom Cakes", aiContext: "heart warming anniversary cake" },
  { src: `${storage}original-027.jpg`, label: "Tiered Signature Celebration Cake", category: "Birthday Cakes", aiContext: "stunning multi-tier celebration cake" },
  { src: `${storage}original-028.jpg`, label: "Artisan Special Bake", category: "Special Treats", aiContext: "specialty home bakery creation" },
  { src: `${storage}original-029.jpg`, label: "Gourmet Cupcake Assortment", category: "Cupcakes", aiContext: "fluffy cupcakes with buttercream swirls" },
  { src: `${storage}original-030.jpg`, label: "Delicate Dessert Cup", category: "Special Treats", aiContext: "artisan individual dessert cup" },
  { src: `${storage}original-031.jpg`, label: "Vehicle Theme Birthday Cake", category: "Theme Cakes", aiContext: "custom vehicle theme cake for boys" },
  { src: `${storage}original-032.jpg`, label: "Blush Pink Celebration Cake", category: "Birthday Cakes", aiContext: "pink birthday cake with macarons" },
  { src: `${storage}original-033.jpg`, label: "Handcrafted Theme Creation", category: "Theme Cakes", aiContext: "artisan themed celebration cake" },
  { src: `${storage}original-034.jpg`, label: "Celebration Masterpiece", category: "Cakes", aiContext: "masterpiece home bakery cake" },
  { src: `${storage}original-035.jpg`, label: "Purple Lavender Custom Cake", category: "Custom Cakes", aiContext: "custom purple cake with accents" },
  { src: `${storage}original-036.jpg`, label: "Modern Celebration Cake", category: "Custom Cakes", aiContext: "clean modern minimalist celebration cake" },
  { src: `${storage}original-037.jpg`, label: "Fudgy Chocolate Brownie Batch", category: "Special Treats", aiContext: "freshly baked chocolate brownies" },
  { src: `${storage}original-038.jpg`, label: "Handcrafted Artisan Chocolates", category: "Chocolates", aiContext: "handcrafted assorted chocolates" },
  { src: `${storage}original-039.jpg`, label: "Rainbow Celebration Cake", category: "Birthday Cakes", aiContext: "vibrant rainbow layered celebration cake" },
  { src: `${storage}original-040.jpg`, label: "Pink Rosette Buttercream Cake", category: "Cakes", aiContext: "rosette textured buttercream cake" },
  { src: `${storage}original-041.jpg`, label: "Special Event Cake", category: "Birthday Cakes", aiContext: "grand celebration birthday cake" },
  { src: `${storage}original-042.jpg`, label: "Artisan Chocolate Treats", category: "Chocolates", aiContext: "custom chocolates and bites" },
  { src: `${storage}original-043.jpg`, label: "Birthday Chocolate Truffle Cake", category: "Cakes", aiContext: "rich chocolate truffle birthday cake" },
  { src: `${storage}original-044.jpg`, label: "Sweet Celebration Confection", category: "Special Treats", aiContext: "mini bento dessert creation" },
  { src: `${storage}original-045.jpg`, label: "Specialty Dessert Treat", category: "Special Treats", aiContext: "freshly made artisanal treat" },
];

export const cakes = [
  { name: "Vanilla", price: "½ kg ₹300 · 1 kg ₹550", image: `${storage}original-002.jpg` },
  { name: "Pineapple", price: "½ kg ₹350 · 1 kg ₹600", image: `${storage}original-040.jpg` },
  { name: "Strawberry", price: "½ kg ₹350 · 1 kg ₹600", image: `${storage}original-032.jpg` },
  { name: "Butterscotch", price: "½ kg ₹400 · 1 kg ₹700", image: `${storage}original-036.jpg` },
  { name: "Blueberry", price: "½ kg ₹400 · 1 kg ₹700", image: `${storage}original-012.jpg` },
  { name: "Chocolate", price: "½ kg ₹400 · 1 kg ₹750", image: `${storage}original-023.jpg` },
  { name: "Rasmalai", price: "½ kg ₹350 · 1 kg ₹600", image: `${storage}original-010.jpg` },
  { name: "Black Forest", price: "½ kg ₹400 · 1 kg ₹800", image: `${storage}original-043.jpg` },
  { name: "Red Velvet", price: "½ kg ₹400 · 1 kg ₹800", image: `${storage}original-039.jpg` },
  { name: "Tender Coconut", price: "½ kg ₹700 · 1 kg ₹1300", image: `${storage}original-018.jpg` },
];

export const cookies = [
  { name: "Ragi Chocolate Cookies", price: "250 g · ₹210", image: `${storage}original-007.jpg` },
  { name: "Jowar Cookies", price: "250 g · ₹205", image: `${storage}original-007.jpg` },
  { name: "Multigrain Cookies", price: "250 g · ₹249", image: `${storage}original-007.jpg` },
  { name: "Oats Ragi Cookies", price: "250 g · ₹245", image: `${storage}original-007.jpg` },
  { name: "Kesar Pista Cookies", price: "250 g · ₹275", image: `${storage}original-007.jpg` },
  { name: "Oats Almond Cookies", price: "250 g · ₹270", image: `${storage}original-007.jpg` },
  { name: "Fruit Cookies", price: "250 g · ₹199", image: `${storage}original-007.jpg` },
  { name: "Red Velvet Cookies", price: "250 g · ₹220", image: `${storage}original-007.jpg` },
  { name: "Double Choco Chips Cookies", price: "250 g · ₹280", image: `${storage}original-007.jpg` },
  { name: "Oats Stuffed Chocolate Cookies", price: "250 g · ₹299", image: `${storage}original-007.jpg` },
  { name: "Oats Stuffed Peanut Cookies", price: "250 g · ₹280", image: `${storage}original-007.jpg` },
  { name: "Choco Chip Cookies", price: "250 g · ₹249", image: `${storage}original-007.jpg` },
  { name: "Millet Cookies", price: "Price on request", image: `${storage}original-007.jpg` },
];

export const brownies = [
  { name: "Brownie (Pack of 6)", price: "₹350", image: `${storage}original-037.jpg` },
  { name: "Chocolate Walnut Brownie (6 pcs)", price: "₹380", image: `${storage}original-037.jpg` },
  { name: "Nutella Brownie (6 pcs)", price: "₹380", image: `${storage}original-037.jpg` },
  { name: "Double Chocolate Brownie (6 pcs)", price: "₹380", image: `${storage}original-037.jpg` },
];

export const chocolates = [
  { name: "Dark / plain chocolates", price: "10 pcs ₹130 · 20 pcs ₹260", image: `${storage}original-038.jpg` },
  { name: "White chocolates", price: "10 pcs ₹160 · 20 pcs ₹290", image: `${storage}original-038.jpg` },
  { name: "Chocolates with dry fruits", price: "10 pcs ₹200 · 20 pcs ₹380", image: `${storage}original-038.jpg` },
  { name: "White chocolates with dry fruits", price: "10 pcs ₹200 · 20 pcs ₹380", image: `${storage}original-038.jpg` },
  { name: "Double shaded chocolates", price: "10 pcs ₹180 · 20 pcs ₹350", image: `${storage}original-038.jpg` },
  { name: "Kunafa chocolate (50 g)", price: "10 pcs ₹150 · 20 pcs Price on request", image: `${storage}original-038.jpg` },
];

export const specialTreats = [
  { name: "Apricot Delight", price: "Mini ₹70 · Big ₹180", image: `${storage}original-009.jpg` },
  { name: "Muffins", price: "₹35 / piece", image: `${storage}original-029.jpg` },
  { name: "Bento Cake", price: "₹280", image: `${storage}original-004.jpg` },
  { name: "Birthday / Name Chocolate", price: "₹280", image: `${storage}original-038.jpg` },
  { name: "Millet Cookies", price: "Price on request", image: `${storage}original-007.jpg` },
];

export const menuGroups = {
  Cakes: cakes,
  Cookies: cookies,
  Brownies: brownies,
  Chocolates: chocolates,
  "Special Treats": specialTreats,
};

export const contact = {
  phones: ["7981468535", "8801121818"],
  hours: "9:00 AM – 9:00 PM",
  address: "Mega Residency 64-1h-5e/ff4, Janaki Ram Nagar, Treasury Colony, Pratap Nagar, Kakinada – 533004",
  delivery: "Rapido (Delivery charges paid by customer)",
  payment: "PhonePe",
};

export const galleryFilters = [
  "All",
  "Cakes",
  "Theme Cakes",
  "Birthday Cakes",
  "Custom Cakes",
  "Cookies",
  "Cupcakes",
  "Chocolates",
  "Special Treats"
];
