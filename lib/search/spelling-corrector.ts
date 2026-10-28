/**
 * Typo-Tolerant Engine & Natural Language E-Commerce Intent Parser
 * Provides fast spelling correction, Damerau-Levenshtein fuzzy matching,
 * and budget/intent extraction compatible with Cloudflare Workers.
 */

export interface ParsedSearchIntent {
  rawQuery: string;
  normalizedQuery: string;
  cleanKeywords: string;
  minPrice?: number;
  maxPrice?: number;
  categoryHint?: string;
  brandHint?: string;
}

export interface SpellingCorrectionResult {
  originalQuery: string;
  correctedQuery: string;
  hasCorrection: boolean;
  confidence: "high" | "medium" | "none";
  didYouMean?: string;
  correctedTokens: Array<{ original: string; corrected: string }>;
}

// Curated comprehensive vocabulary of Indian e-commerce terms, brands, and categories
const ECOMMERCE_DICTIONARY = new Set<string>([
  // Food, Confectionery & Grocery
  "chocolate", "chocolates", "cake", "cakes", "cadbury", "ferrero", "rocher",
  "hershey", "hersheys", "amul", "lindt", "kitkat", "biscuit", "biscuits",
  "cookie", "cookies", "snack", "snacks", "tea", "coffee", "dairy", "milk",
  "dark", "hazelnut", "cocoa", "sweet", "sweets", "confectionery", "grocery",

  // Fitness, Health & Nutrition
  "protein", "powder", "whey", "isolate", "creatine", "supplements", "nutrition",
  "muscleblaze", "optimum", "multivitamin", "peanut", "butter", "bars",

  // Electronics & Mobile
  "iphone", "samsung", "apple", "oneplus", "xiaomi", "redmi", "realme", "vivo",
  "oppo", "motorola", "google", "pixel", "phone", "phones", "mobile", "mobiles",
  "smartphone", "smartphones", "tablet", "tablets", "ipad", "charger", "cover",
  "case", "cable", "screen", "protector", "powerbank", "5g",

  // Laptops & Computing
  "macbook", "laptop", "laptops", "notebook", "gaming", "asus", "dell", "hp",
  "lenovo", "acer", "intel", "ryzen", "core", "mouse", "keyboard", "monitor",
  "ssd", "ram", "ultrabook",

  // Audio & Television
  "audio", "headphones", "headphone", "earbuds", "earbud", "earphones", "earphone",
  "bluetooth", "wireless", "airpods", "airdopes", "soundbar", "speaker", "speakers",
  "tws", "anc", "mic", "sony", "boat", "jbl", "bose", "sennheiser", "noise",
  "boult", "tv", "tvs", "television", "televisions", "smart", "led", "oled", "4k",

  // Home Appliances
  "appliance", "appliances", "air", "fryer", "fryers", "microwave", "oven",
  "refrigerator", "refrigerators", "fridge", "washing", "machine", "geyser",
  "geysers", "heater", "heaters", "purifier", "purifiers", "water", "ro", "uv",
  "vacuum", "cleaner", "cooler", "coolers", "induction", "cooktop", "mixer",
  "grinder", "juicer", "blender", "iron", "philips", "prestige", "bajaj",
  "havells", "crompton", "bosch", "voltas", "lg",

  // Fashion & Footwear
  "shoes", "shoe", "sneakers", "sneaker", "running", "casual", "sports", "heels",
  "heel", "stiletto", "stilettos", "block", "sandals", "sandal", "boots", "boot",
  "slippers", "slipper", "flip", "flops", "clogs", "crocs", "footwear", "nike",
  "puma", "adidas", "red", "tape", "campus", "bata", "woodland", "eridani",
  "shoetopia", "trase", "theater", "catwalk", "carlton", "london", "metro",
  "mochi", "lavie", "liberty", "sparks", "sparx", "kurta", "kurtas", "kurti",
  "kurtis", "saree", "sarees", "jeans", "shirt", "shirts", "tshirt", "tshirts",
  "dress", "dresses", "jacket", "jackets", "pants", "trousers", "top", "tops",
  "libas", "biba", "manyavar", "fabindia", "levis", "allen", "solly", "peter",
  "england",

  // Beauty & Personal Care
  "serum", "serums", "face", "wash", "sunscreen", "moisturizer", "shampoo",
  "conditioner", "oil", "cream", "lotion", "perfume", "trimmer", "trimmers",
  "beard", "shaving", "minimalist", "mamaearth", "mcaffeine", "derma", "biotique",
  "garnier", "loreal", "plum",
]);

// Explicit popular typo mapping for instant O(1) resolution
const HIGH_PRIORITY_CORRECTIONS: Record<string, string> = {
  choclate: "chocolate",
  choclates: "chocolates",
  choclat: "chocolate",
  choclatee: "chocolate",
  iphne: "iphone",
  iphn: "iphone",
  iphone15: "iphone 15",
  iphone16: "iphone 16",
  nik: "nike",
  nikee: "nike",
  bluetooh: "bluetooth",
  blutooth: "bluetooth",
  blutoth: "bluetooth",
  hedphone: "headphone",
  hedphones: "headphones",
  headphon: "headphone",
  headfone: "headphone",
  headfones: "headphones",
  earbud: "earbuds",
  erbuds: "earbuds",
  airpod: "airpods",
  airpds: "airpods",
  samsng: "samsung",
  samsumg: "samsung",
  sumsung: "samsung",
  samung: "samsung",
  protien: "protein",
  proten: "protein",
  proteen: "protein",
  whay: "whey",
  laptoop: "laptop",
  leptop: "laptop",
  labtop: "laptop",
  lapotp: "laptop",
  smrt: "smart",
  televison: "television",
  telivision: "television",
  televisn: "television",
  refrigrator: "refrigerator",
  refrizirator: "refrigerator",
  sneker: "sneaker",
  snekers: "sneakers",
  stileto: "stiletto",
  stiletos: "stilettos",
  snadals: "sandals",
  sunscrin: "sunscreen",
  sanscreen: "sunscreen",
  serom: "serum",
};

/**
 * Calculates Damerau-Levenshtein distance between two strings
 * Handles insertions, deletions, substitutions, and adjacent transpositions
 */
export function damerauLevenshteinDistance(source: string, target: string): number {
  const src = source.toLowerCase();
  const tgt = target.toLowerCase();
  const srcLen = src.length;
  const tgtLen = tgt.length;

  if (srcLen === 0) return tgtLen;
  if (tgtLen === 0) return srcLen;
  if (src === tgt) return 0;

  // Matrix allocation
  const d: number[][] = Array.from({ length: srcLen + 1 }, () =>
    new Array(tgtLen + 1).fill(0)
  );

  for (let i = 0; i <= srcLen; i++) d[i][0] = i;
  for (let j = 0; j <= tgtLen; j++) d[0][j] = j;

  for (let i = 1; i <= srcLen; i++) {
    for (let j = 1; j <= tgtLen; j++) {
      const cost = src[i - 1] === tgt[j - 1] ? 0 : 1;
      d[i][j] = Math.min(
        d[i - 1][j] + 1, // deletion
        d[i][j - 1] + 1, // insertion
        d[i - 1][j - 1] + cost // substitution
      );

      // Transposition
      if (
        i > 1 &&
        j > 1 &&
        src[i - 1] === tgt[j - 2] &&
        src[i - 2] === tgt[j - 1]
      ) {
        d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1);
      }
    }
  }

  return d[srcLen][tgtLen];
}

/**
 * Parses natural language search intent, budget constraints, and clean query terms
 * e.g., "laptop under 50000" => clean: "laptop", maxPrice: 50000
 */
export function parseSearchIntent(rawQuery: string): ParsedSearchIntent {
  const normalized = (rawQuery || "").trim().toLowerCase();
  let clean = normalized;
  let minPrice: number | undefined;
  let maxPrice: number | undefined;

  // 1. Between X and Y (e.g. "shoes between 1000 and 3000")
  const betweenMatch = clean.match(
    /\b(?:between|from)\s*(?:₹|rs\.?|inr)?\s*([0-9,]+)\s*(k)?\s*(?:and|to|-)\s*(?:₹|rs\.?|inr)?\s*([0-9,]+)\s*(k)?\b/i
  );
  if (betweenMatch) {
    let p1 = parseInt(betweenMatch[1].replace(/,/g, ""), 10);
    if (betweenMatch[2]) p1 *= 1000;
    let p2 = parseInt(betweenMatch[3].replace(/,/g, ""), 10);
    if (betweenMatch[4]) p2 *= 1000;

    minPrice = Math.min(p1, p2);
    maxPrice = Math.max(p1, p2);
    clean = clean.replace(betweenMatch[0], "").trim();
  }

  // 2. Under / Below / Less than X (e.g. "laptop under 50000", "earbuds below 2k")
  if (maxPrice === undefined) {
    const underMatch = clean.match(
      /\b(?:under|below|less\s+than)\s*(?:₹|rs\.?|inr)?\s*([0-9,]+)\s*(k)?\b/i
    );
    if (underMatch) {
      let p = parseInt(underMatch[1].replace(/,/g, ""), 10);
      if (underMatch[2]) p *= 1000;
      maxPrice = p;
      clean = clean.replace(underMatch[0], "").trim();
    }
  }

  // 3. Above / More than X (e.g. "phone above 20000")
  if (minPrice === undefined) {
    const aboveMatch = clean.match(
      /\b(?:above|more\s+than|over)\s*(?:₹|rs\.?|inr)?\s*([0-9,]+)\s*(k)?\b/i
    );
    if (aboveMatch) {
      let p = parseInt(aboveMatch[1].replace(/,/g, ""), 10);
      if (aboveMatch[2]) p *= 1000;
      minPrice = p;
      clean = clean.replace(aboveMatch[0], "").trim();
    }
  }

  // Clean trailing punctuation or extra whitespace
  clean = clean.replace(/[^\w\s-]/g, " ").replace(/\s+/g, " ").trim();

  return {
    rawQuery,
    normalizedQuery: normalized,
    cleanKeywords: clean || normalized,
    minPrice,
    maxPrice,
  };
}

/**
 * Checks if a token should be preserved without spelling changes
 * (model numbers, storage specs, numbers, exact abbreviations)
 */
function isPreservedToken(token: string): boolean {
  if (token.length <= 1) return true;
  // Numbers or alphanumeric model codes (e.g., s24, m2, m3, 15, 128gb, 256gb, 4k, 5g)
  if (/^[0-9]+$/i.test(token)) return true;
  if (/^[a-z0-9]+(?:gb|tb|mb|k|mp|w|mah)$/i.test(token)) return true;
  if (/^[a-z]+[0-9]+[a-z0-9]*$/i.test(token)) return true; // s24, m2, g14, f15, xr, se
  if (/^b0[a-z0-9]{8}$/i.test(token)) return true; // ASIN
  return false;
}

/**
 * Finds the closest matching dictionary word for a misspelled token
 */
function findClosestWord(token: string): { match: string; distance: number } | null {
  const t = token.toLowerCase();

  // 1. Check exact dictionary
  if (ECOMMERCE_DICTIONARY.has(t)) {
    return { match: t, distance: 0 };
  }

  // 2. Check high-priority instant map
  if (HIGH_PRIORITY_CORRECTIONS[t]) {
    return { match: HIGH_PRIORITY_CORRECTIONS[t], distance: 1 };
  }

  // Do not modify model codes or preserved specs
  if (isPreservedToken(t)) {
    return null;
  }

  const maxAllowedDistance = t.length <= 4 ? 1 : t.length <= 8 ? 2 : 3;
  let bestMatch: string | null = null;
  let bestDistance = maxAllowedDistance + 1;

  for (const dictWord of ECOMMERCE_DICTIONARY) {
    // Length filter optimization
    if (Math.abs(dictWord.length - t.length) > maxAllowedDistance) {
      continue;
    }

    const dist = damerauLevenshteinDistance(t, dictWord);
    if (dist < bestDistance) {
      bestDistance = dist;
      bestMatch = dictWord;
      if (dist === 1) break; // Good enough for early exit
    }
  }

  if (bestMatch && bestDistance <= maxAllowedDistance) {
    return { match: bestMatch, distance: bestDistance };
  }

  return null;
}

/**
 * Performs typo-tolerant spelling correction on search queries
 */
export function correctQuerySpelling(query: string): SpellingCorrectionResult {
  const original = (query || "").trim();
  if (!original) {
    return {
      originalQuery: "",
      correctedQuery: "",
      hasCorrection: false,
      confidence: "none",
      correctedTokens: [],
    };
  }

  const tokens = original.split(/\s+/).filter(Boolean);
  const correctedTokens: Array<{ original: string; corrected: string }> = [];
  const outputWords: string[] = [];
  let totalDistance = 0;
  let hasAnyChange = false;

  for (const token of tokens) {
    const cleanToken = token.replace(/^[^\w]+|[^\w]+$/g, "");
    if (!cleanToken) {
      outputWords.push(token);
      continue;
    }

    // Direct high priority check
    const lowerClean = cleanToken.toLowerCase();
    if (HIGH_PRIORITY_CORRECTIONS[lowerClean]) {
      const fixed = HIGH_PRIORITY_CORRECTIONS[lowerClean];
      outputWords.push(fixed);
      correctedTokens.push({ original: cleanToken, corrected: fixed });
      hasAnyChange = true;
      totalDistance += 1;
      continue;
    }

    const closest = findClosestWord(cleanToken);
    if (closest && closest.distance > 0 && closest.match !== lowerClean) {
      outputWords.push(closest.match);
      correctedTokens.push({ original: cleanToken, corrected: closest.match });
      hasAnyChange = true;
      totalDistance += closest.distance;
    } else {
      outputWords.push(token);
    }
  }

  const correctedQuery = outputWords.join(" ");

  if (!hasAnyChange) {
    return {
      originalQuery: original,
      correctedQuery: original,
      hasCorrection: false,
      confidence: "none",
      correctedTokens: [],
    };
  }

  // Calculate confidence level
  const confidence: "high" | "medium" =
    totalDistance <= 2 || correctedTokens.every((c) => HIGH_PRIORITY_CORRECTIONS[c.original.toLowerCase()])
      ? "high"
      : "medium";

  return {
    originalQuery: original,
    correctedQuery,
    hasCorrection: true,
    confidence,
    didYouMean: confidence === "medium" ? correctedQuery : undefined,
    correctedTokens,
  };
}
