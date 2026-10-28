import { categories, demoProducts, demoOffers } from "./demo-products";
import { CATEGORY_BRANDS } from "./repository";
import { correctQuerySpelling } from "../search/spelling-corrector";

export interface QuerySuggestion {
  text: string;
  categoryName?: string;
  categorySlug?: string;
  isScoped?: boolean;
}

export interface SearchProductSuggestion {
  id: string;
  title: string;
  brand: string;
  price: number;
  originalPrice: number;
  imageUrl: string;
  categorySlug: string;
  storeCount: number;
}

export interface SearchApiResponse {
  querySuggestions: QuerySuggestion[];
  products: SearchProductSuggestion[];
  categories: Array<{ name: string; slug: string }>;
  trending: string[];
}

// Curated high-intent Indian e-commerce search terms
export const CURATED_SEARCH_TERMS: Array<{ text: string; categorySlug: string }> = [
  // Mobiles & Tablets
  { text: "iPhone 15", categorySlug: "mobiles" },
  { text: "iPhone 15 Pro Max", categorySlug: "mobiles" },
  { text: "iPhone 15 Plus", categorySlug: "mobiles" },
  { text: "iPhone 14", categorySlug: "mobiles" },
  { text: "iPhone 13 128GB", categorySlug: "mobiles" },
  { text: "iPhone charger 20W Type C", categorySlug: "mobiles" },
  { text: "iPhone 15 back cover", categorySlug: "mobiles" },
  { text: "Samsung Galaxy S24 5G", categorySlug: "mobiles" },
  { text: "Samsung Galaxy S24 Ultra", categorySlug: "mobiles" },
  { text: "Samsung Galaxy S23 FE", categorySlug: "mobiles" },
  { text: "Samsung Galaxy M34 5G", categorySlug: "mobiles" },
  { text: "Samsung Galaxy A55 5G", categorySlug: "mobiles" },
  { text: "OnePlus 12R 5G", categorySlug: "mobiles" },
  { text: "OnePlus Nord CE4 5G", categorySlug: "mobiles" },
  { text: "OnePlus Nord CE4 Lite", categorySlug: "mobiles" },
  { text: "Google Pixel 8 5G", categorySlug: "mobiles" },
  { text: "Google Pixel 8a", categorySlug: "mobiles" },
  { text: "Nothing Phone 2a", categorySlug: "mobiles" },
  { text: "Motorola Edge 50 Pro", categorySlug: "mobiles" },
  { text: "Realme 12 Pro 5G", categorySlug: "mobiles" },
  { text: "Redmi Note 13 Pro 5G", categorySlug: "mobiles" },
  { text: "Vivo V30 Pro 5G", categorySlug: "mobiles" },
  { text: "iQOO Neo 9 Pro 5G", categorySlug: "mobiles" },
  { text: "POCO X6 Pro 5G", categorySlug: "mobiles" },
  { text: "iPad 10th Gen 64GB", categorySlug: "mobiles" },
  { text: "iPad Air M2", categorySlug: "mobiles" },

  // Laptops & Computing
  { text: "MacBook Air M2", categorySlug: "laptops" },
  { text: "MacBook Air M3", categorySlug: "laptops" },
  { text: "MacBook Pro M3 Pro", categorySlug: "laptops" },
  { text: "Apple MacBook Air 13-inch", categorySlug: "laptops" },
  { text: "ASUS TUF Gaming F15", categorySlug: "laptops" },
  { text: "ASUS ROG Zephyrus G14", categorySlug: "laptops" },
  { text: "HP Pavilion 15 Intel Core i5", categorySlug: "laptops" },
  { text: "HP Victus Gaming Laptop", categorySlug: "laptops" },
  { text: "Dell XPS 13 OLED", categorySlug: "laptops" },
  { text: "Dell Inspiron 15", categorySlug: "laptops" },
  { text: "Lenovo IdeaPad Gaming 3", categorySlug: "laptops" },
  { text: "Lenovo Yoga Slim 7i", categorySlug: "laptops" },
  { text: "Acer Predator Helios 16", categorySlug: "laptops" },
  { text: "Acer Aspire 7 Gaming", categorySlug: "laptops" },
  { text: "Samsung Galaxy Book4", categorySlug: "laptops" },

  // Audio & Headphones
  { text: "boAt Airdopes 141", categorySlug: "audio" },
  { text: "boAt Airdopes 131 Pro", categorySlug: "audio" },
  { text: "boAt Rockerz 255 Pro+", categorySlug: "audio" },
  { text: "Sony WH-1000XM5 Wireless Headphones", categorySlug: "audio" },
  { text: "Sony WH-1000XM4 Noise Cancelling", categorySlug: "audio" },
  { text: "Sony WF-1000XM5 TWS", categorySlug: "audio" },
  { text: "Apple AirPods Pro 2 USB-C", categorySlug: "audio" },
  { text: "Apple AirPods 3rd Gen", categorySlug: "audio" },
  { text: "JBL Flip 6 Bluetooth Speaker", categorySlug: "audio" },
  { text: "JBL Charge 5 Portable Speaker", categorySlug: "audio" },
  { text: "OnePlus Buds Pro 2", categorySlug: "audio" },
  { text: "OnePlus Bullets Wireless Z2", categorySlug: "audio" },
  { text: "Realme Buds Air 5 Pro", categorySlug: "audio" },
  { text: "Noise Buds VS104", categorySlug: "audio" },
  { text: "Boult Audio Z40", categorySlug: "audio" },
  { text: "Sennheiser Momentum 4 Wireless", categorySlug: "audio" },

  // Fashion & Apparel
  { text: "Libas Women Anarkali Kurta Set", categorySlug: "fashion" },
  { text: "Kurta set for women pure cotton", categorySlug: "fashion" },
  { text: "Floral Printed Pure Cotton Kurta", categorySlug: "fashion" },
  { text: "BIBA Women Kurta and Palazzo Set", categorySlug: "fashion" },
  { text: "Manyavar Men Kurta Pajama for Wedding", categorySlug: "fashion" },
  { text: "FabIndia Men Cotton Short Kurta", categorySlug: "fashion" },
  { text: "Levi's Men Checked Cotton Casual Shirt", categorySlug: "fashion" },
  { text: "Levi's 511 Slim Fit Jeans", categorySlug: "fashion" },
  { text: "Peter England Men Formal Shirt", categorySlug: "fashion" },
  { text: "Allen Solly Men Polo T-Shirt", categorySlug: "fashion" },
  { text: "Nike Air Max Running Shoes", categorySlug: "fashion" },
  { text: "Nike Revolution 6 Shoes", categorySlug: "fashion" },
  { text: "Puma Men Dazzler Sneakers", categorySlug: "fashion" },
  { text: "Puma Smashic Casual Shoes", categorySlug: "fashion" },
  { text: "Adidas Men Adizero Running Shoes", categorySlug: "fashion" },
  { text: "Red Tape Men Casual Sneaker Shoes", categorySlug: "fashion" },
  { text: "Campus Men Running Shoes", categorySlug: "fashion" },
  { text: "TRASE Transparent Block Heels for Women", categorySlug: "fashion" },
  { text: "Bata Women High Stiletto Heels", categorySlug: "fashion" },
  { text: "Shoetopia Block Heel Sandals", categorySlug: "fashion" },
  { text: "Crocs Classic Clog", categorySlug: "fashion" },

  // Home Appliances
  { text: "Philips Digital Air Fryer HD9252", categorySlug: "appliances" },
  { text: "Philips Air Fryer 4.1L Rapid Air", categorySlug: "appliances" },
  { text: "Prestige Induction Cooktop PIC 20", categorySlug: "appliances" },
  { text: "Prestige Iris 750W Mixer Grinder", categorySlug: "appliances" },
  { text: "Bajaj Rex 500W Mixer Grinder", categorySlug: "appliances" },
  { text: "LG 7 Kg 5 Star Front Load Washing Machine", categorySlug: "appliances" },
  { text: "LG 242L Double Door Smart Refrigerator", categorySlug: "appliances" },
  { text: "Samsung 653L Side by Side Refrigerator", categorySlug: "appliances" },
  { text: "Samsung 28L Convection Microwave Oven", categorySlug: "appliances" },
  { text: "Havells Adonia 25L Storage Water Heater Geyser", categorySlug: "appliances" },
  { text: "Crompton Solarium Qube 15L Geyser", categorySlug: "appliances" },
  { text: "Eureka Forbes Aquaguard Water Purifier", categorySlug: "appliances" },
  { text: "Kent Grand RO Water Purifier", categorySlug: "appliances" },
  { text: "Bosch 13 Place Settings Dishwasher", categorySlug: "appliances" },
  { text: "Voltas 1.5 Ton 3 Star Inverter Split AC", categorySlug: "appliances" },

  // Beauty & Personal Care
  { text: "Minimalist 10% Niacinamide Face Serum", categorySlug: "beauty" },
  { text: "Minimalist 2% Salicylic Acid Face Serum", categorySlug: "beauty" },
  { text: "Mamaearth Onion Hair Oil for Hair Fall", categorySlug: "beauty" },
  { text: "Mamaearth Vitamin C Face Wash", categorySlug: "beauty" },
  { text: "mCaffeine Naked & Raw Coffee Face Wash", categorySlug: "beauty" },
  { text: "The Derma Co 1% Hyaluronic Sunscreen Aqua Gel", categorySlug: "beauty" },
  { text: "Biotique Bio Sandalwood Sunscreen SPF 50", categorySlug: "beauty" },
  { text: "Garnier Skin Naturals Vitamin C Serum", categorySlug: "beauty" },
  { text: "L'Oreal Paris Extraordinary Hair Serum", categorySlug: "beauty" },
  { text: "Plum Green Tea Pore Cleansing Face Wash", categorySlug: "beauty" },
  { text: "Bombay Shaving Company Beard Trimmer", categorySlug: "beauty" },
  { text: "Philips BT1232 Cordless Beard Trimmer", categorySlug: "beauty" },

  // Gourmet, Chocolates & Wellness
  { text: "Cadbury Dairy Milk Silk Chocolate", categorySlug: "beauty" },
  { text: "Ferrero Rocher Hazelnut Chocolates", categorySlug: "beauty" },
  { text: "Hershey's Kisses Milk Chocolate", categorySlug: "beauty" },
  { text: "Amul Dark Chocolate Bar", categorySlug: "beauty" },
  { text: "Lindt Excellence Dark Chocolate", categorySlug: "beauty" },
  { text: "Optimum Nutrition Whey Protein Powder", categorySlug: "beauty" },
  { text: "MuscleBlaze Biozyme Whey Protein", categorySlug: "beauty" },

  // Smart TVs
  { text: "Samsung 43 Inch Crystal 4K TV", categorySlug: "appliances" },
  { text: "Samsung 32 Inch Smart LED TV", categorySlug: "appliances" },
];

export const TRENDING_SEARCHES = [
  "iPhone 15",
  "Samsung Galaxy S24",
  "MacBook Air M2",
  "Sony WH-1000XM5",
  "boAt Airdopes 141",
  "Philips Air Fryer",
  "Libas Kurta Set",
  "Nike Running Shoes",
  "LG Washing Machine",
];

/**
 * Normalizes string for case-insensitive and accent-insensitive matching
 */
function normalize(str: string): string {
  return str.toLowerCase().trim();
}

/**
 * Extracts searchable key phrases from demo products
 */
function getProductDerivedTerms(): Array<{ text: string; categorySlug: string }> {
  const terms: Array<{ text: string; categorySlug: string }> = [];
  const seen = new Set<string>();

  for (const product of demoProducts) {
    const cat = categories.find((c) => c.id === product.categoryId);
    const categorySlug = cat?.slug || "general";

    // 1. Cleaned title
    const cleanTitle = product.title
      .replace(/\s*\([^)]*\)/g, "") // remove parenthetical specs
      .replace(/\s*-\s*[^-]+$/g, "") // remove trailing color/variant
      .trim();

    if (cleanTitle && !seen.has(normalize(cleanTitle))) {
      seen.add(normalize(cleanTitle));
      terms.push({ text: cleanTitle, categorySlug });
    }

    // 2. Brand + Category query
    if (product.brand && cat?.name) {
      const brandCat = `${product.brand} ${cat.name.split("&")[0].trim()}`;
      if (!seen.has(normalize(brandCat))) {
        seen.add(normalize(brandCat));
        terms.push({ text: brandCat, categorySlug });
      }
    }
  }

  // Add popular brands
  for (const [slug, brandList] of Object.entries(CATEGORY_BRANDS)) {
    for (const brand of brandList) {
      if (!seen.has(normalize(brand))) {
        seen.add(normalize(brand));
        terms.push({ text: brand, categorySlug: slug });
      }
    }
  }

  return terms;
}

const ALL_SEARCH_TERMS = [...CURATED_SEARCH_TERMS, ...getProductDerivedTerms()];

/**
 * Generates Google & Amazon style typing suggestions given a query and optional category
 */
export function getSuggestions(
  query: string,
  categoryFilter?: string,
  limit: number = 8
): {
  querySuggestions: QuerySuggestion[];
  products: SearchProductSuggestion[];
  categories: Array<{ name: string; slug: string }>;
  trending: string[];
} {
  const q = normalize(query);

  if (!q) {
    return {
      querySuggestions: [],
      products: [],
      categories: [],
      trending: TRENDING_SEARCHES,
    };
  }

  const effectiveCategory = categoryFilter && categoryFilter !== "all" ? categoryFilter : undefined;

  // 1. Matched Categories
  const matchedCategories = categories
    .filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.slug.toLowerCase().includes(q) ||
        (effectiveCategory && c.slug === effectiveCategory)
    )
    .slice(0, 3)
    .map((c) => ({ name: c.name, slug: c.slug }));

  // 2. Rank and deduplicate Query Suggestions
  const suggestionMap = new Map<string, QuerySuggestion>();

  // Filter terms by category if scoped
  const candidateTerms = effectiveCategory
    ? ALL_SEARCH_TERMS.filter((t) => t.categorySlug === effectiveCategory)
    : ALL_SEARCH_TERMS;

  // Tier 1: Exact prefix match on query (e.g. typing "iph" -> "iPhone 15")
  for (const item of candidateTerms) {
    const itemNorm = normalize(item.text);
    if (itemNorm.startsWith(q)) {
      if (!suggestionMap.has(itemNorm)) {
        const cat = categories.find((c) => c.slug === item.categorySlug);
        suggestionMap.set(itemNorm, {
          text: item.text,
          categoryName: cat?.name,
          categorySlug: cat?.slug,
        });
      }
    }
    if (suggestionMap.size >= limit + 2) break;
  }

  // Tier 2: Word boundary match (e.g. typing "air" -> "MacBook Air M2", "Philips Digital Air Fryer")
  if (suggestionMap.size < limit) {
    const wordsRegex = new RegExp(`\\b${q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`, "i");
    for (const item of candidateTerms) {
      const itemNorm = normalize(item.text);
      if (!suggestionMap.has(itemNorm) && wordsRegex.test(itemNorm)) {
        const cat = categories.find((c) => c.slug === item.categorySlug);
        suggestionMap.set(itemNorm, {
          text: item.text,
          categoryName: cat?.name,
          categorySlug: cat?.slug,
        });
      }
      if (suggestionMap.size >= limit + 2) break;
    }
  }

  // Tier 3: Substring match anywhere
  if (suggestionMap.size < limit) {
    for (const item of candidateTerms) {
      const itemNorm = normalize(item.text);
      if (!suggestionMap.has(itemNorm) && itemNorm.includes(q)) {
        const cat = categories.find((c) => c.slug === item.categorySlug);
        suggestionMap.set(itemNorm, {
          text: item.text,
          categoryName: cat?.name,
          categorySlug: cat?.slug,
        });
      }
      if (suggestionMap.size >= limit + 2) break;
    }
  }

  // Convert map to array
  const rawSuggestions = Array.from(suggestionMap.values());

  // Add Amazon-style scoped suggestion ("query in Category")
  const enrichedSuggestions: QuerySuggestion[] = [];
  let addedScoped = false;

  for (let i = 0; i < rawSuggestions.length && enrichedSuggestions.length < limit; i++) {
    const current = rawSuggestions[i];
    enrichedSuggestions.push(current);

    // After the first suggestion, if it belongs to a category and we haven't added a scoped item yet
    if (!addedScoped && current.categoryName && current.categorySlug && !effectiveCategory) {
      enrichedSuggestions.push({
        text: current.text,
        categoryName: current.categoryName,
        categorySlug: current.categorySlug,
        isScoped: true,
      });
      addedScoped = true;
    }
  }

  // If user typed a search term without an exact match yet, check for typo corrections
  if (enrichedSuggestions.length === 0 && q.length > 0) {
    const correction = correctQuerySpelling(query.trim());
    if (correction.hasCorrection) {
      enrichedSuggestions.push({
        text: correction.correctedQuery,
        categoryName: "Did you mean",
        isScoped: false,
      });
    }
    enrichedSuggestions.push({ text: query.trim() });
  }

  // 3. Find matching Products (Amazon rich autocomplete preview cards)
  const productMatches = demoProducts
    .filter((p) => {
      if (effectiveCategory) {
        const cat = categories.find((c) => c.slug === effectiveCategory);
        if (cat && p.categoryId !== cat.id) return false;
      }
      return (
        p.title.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        (p.modelNumber && p.modelNumber.toLowerCase().includes(q))
      );
    })
    .slice(0, 4)
    .map((p) => {
      const pOffers = demoOffers.filter((o) => o.productId === p.id && o.retailerSlug === "amazon");
      const lowest = pOffers.reduce(
        (min, curr) => (curr.price < min ? curr.price : min),
        pOffers[0]?.price || 0
      );
      const mrp = pOffers[0]?.originalPrice || lowest;
      const cat = categories.find((c) => c.id === p.categoryId);

      return {
        id: p.id,
        title: p.title,
        brand: p.brand,
        price: lowest,
        originalPrice: mrp,
        imageUrl: p.imageUrl,
        categorySlug: cat?.slug || "general",
        storeCount: pOffers.length || 1,
      };
    });

  return {
    querySuggestions: enrichedSuggestions.slice(0, limit),
    products: productMatches,
    categories: matchedCategories,
    trending: TRENDING_SEARCHES,
  };
}
