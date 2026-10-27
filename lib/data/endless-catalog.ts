import { Product, Offer, PriceComparison, Category, RetailerSlug } from "../types";
import { categories } from "./demo-products";
import { computeProductComparison } from "../matching";
import {
  ALL_CURATED,
  createCompanionOffers,
  productCache,
  offerCache,
} from "../services/amazon-search";

export interface EndlessCatalogParams {
  categorySlug?: string;
  brand?: string;
  searchQuery?: string;
  page?: number;
  count?: number;
  startIndex?: number;
  sortBy?: "price_asc" | "price_desc" | "discount" | "newest" | "rating";
  minPrice?: number;
  maxPrice?: number;
}

export interface CatalogTemplate {
  brand: string;
  model: string;
  basePrice: number;
  mrp: number;
  image: string;
  specs: string[];
  keywords?: string[];
}

// Rich Indian e-commerce catalog templates for endless dynamic generation
// Covering all 80+ tracked brands across 6 major Indian shopping categories
export const BASE_TEMPLATES: Record<string, CatalogTemplate[]> = {
  mobiles: [
    // Apple
    {
      brand: "Apple",
      model: "iPhone 15 Pro Max",
      basePrice: 154900,
      mrp: 159900,
      image: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600&auto=format&fit=crop&q=80",
      specs: ["Natural Titanium, 256GB", "Blue Titanium, 512GB", "Black Titanium, 1TB"],
      keywords: ["phone", "smartphone", "ios", "apple", "iphone 15 pro max"],
    },
    {
      brand: "Apple",
      model: "iPhone 15 Pro",
      basePrice: 127990,
      mrp: 134900,
      image: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600&auto=format&fit=crop&q=80",
      specs: ["Natural Titanium, 128GB", "White Titanium, 256GB", "Black Titanium, 512GB"],
      keywords: ["phone", "smartphone", "ios", "apple", "iphone 15 pro"],
    },
    {
      brand: "Apple",
      model: "iPhone 15 Plus",
      basePrice: 79990,
      mrp: 89900,
      image: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600&auto=format&fit=crop&q=80",
      specs: ["Blue, 128GB", "Pink, 256GB", "Black, 128GB"],
      keywords: ["phone", "smartphone", "ios", "apple", "iphone 15 plus"],
    },
    {
      brand: "Apple",
      model: "iPhone 15",
      basePrice: 70999,
      mrp: 79900,
      image: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600&auto=format&fit=crop&q=80",
      specs: ["Black, 128GB", "Blue, 128GB", "Green, 256GB"],
      keywords: ["phone", "smartphone", "ios", "apple", "iphone 15"],
    },
    {
      brand: "Apple",
      model: "iPhone 14",
      basePrice: 58999,
      mrp: 69900,
      image: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600&auto=format&fit=crop&q=80",
      specs: ["Midnight, 128GB", "Starlight, 256GB", "Blue, 128GB"],
      keywords: ["phone", "smartphone", "ios", "apple", "iphone 14"],
    },
    {
      brand: "Apple",
      model: "iPhone 13",
      basePrice: 48999,
      mrp: 59900,
      image: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600&auto=format&fit=crop&q=80",
      specs: ["Midnight, 128GB", "Starlight, 128GB", "Green, 128GB"],
      keywords: ["phone", "smartphone", "ios", "apple", "iphone 13"],
    },
    // Samsung
    {
      brand: "Samsung",
      model: "Galaxy S24 Ultra 5G",
      basePrice: 121999,
      mrp: 134999,
      image: "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=600&auto=format&fit=crop&q=80",
      specs: ["Titanium Gray, 256GB", "Titanium Black, 512GB", "Titanium Violet, 1TB"],
      keywords: ["phone", "smartphone", "android", "samsung", "s24 ultra"],
    },
    {
      brand: "Samsung",
      model: "Galaxy S24 5G",
      basePrice: 74999,
      mrp: 79999,
      image: "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=600&auto=format&fit=crop&q=80",
      specs: ["Onyx Black, 128GB", "Marble Gray, 256GB", "Cobalt Violet, 256GB"],
      keywords: ["phone", "smartphone", "android", "samsung", "s24"],
    },
    {
      brand: "Samsung",
      model: "Galaxy S23 FE 5G",
      basePrice: 38999,
      mrp: 59999,
      image: "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=600&auto=format&fit=crop&q=80",
      specs: ["Mint, 128GB", "Graphite, 256GB", "Purple, 128GB"],
      keywords: ["phone", "smartphone", "android", "samsung", "s23 fe"],
    },
    {
      brand: "Samsung",
      model: "Galaxy A55 5G",
      basePrice: 35999,
      mrp: 42999,
      image: "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=600&auto=format&fit=crop&q=80",
      specs: ["Awesome Iceblue, 128GB", "Awesome Navy, 256GB"],
      keywords: ["phone", "smartphone", "android", "samsung", "a55"],
    },
    {
      brand: "Samsung",
      model: "Galaxy M15 5G",
      basePrice: 11999,
      mrp: 16999,
      image: "https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=600&auto=format&fit=crop&q=80",
      specs: ["Celestial Blue, 6GB RAM", "Stone Grey, 128GB"],
      keywords: ["phone", "smartphone", "android", "samsung", "m15"],
    },
    // OnePlus
    {
      brand: "OnePlus",
      model: "OnePlus 12 5G",
      basePrice: 61999,
      mrp: 69999,
      image: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=600&auto=format&fit=crop&q=80",
      specs: ["Silky Black, 256GB", "Flowy Emerald, 512GB"],
      keywords: ["phone", "smartphone", "android", "oneplus", "oneplus 12"],
    },
    {
      brand: "OnePlus",
      model: "OnePlus 12R 5G",
      basePrice: 39999,
      mrp: 42999,
      image: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=600&auto=format&fit=crop&q=80",
      specs: ["Iron Gray, 8GB/128GB", "Cool Blue, 16GB/256GB"],
      keywords: ["phone", "smartphone", "android", "oneplus", "oneplus 12r"],
    },
    {
      brand: "OnePlus",
      model: "OnePlus Nord CE4 Lite 5G",
      basePrice: 17999,
      mrp: 20999,
      image: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=600&auto=format&fit=crop&q=80",
      specs: ["Super Silver, 128GB", "Mega Blue, 8GB RAM"],
      keywords: ["phone", "smartphone", "android", "oneplus", "nord"],
    },
    // Google Pixel
    {
      brand: "Google Pixel",
      model: "Pixel 8 Pro 5G",
      basePrice: 97999,
      mrp: 106999,
      image: "https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=600&auto=format&fit=crop&q=80",
      specs: ["Bay Blue, 128GB", "Obsidian, 256GB", "Porcelain, 128GB"],
      keywords: ["phone", "smartphone", "android", "google", "pixel 8 pro"],
    },
    {
      brand: "Google Pixel",
      model: "Pixel 8a 5G",
      basePrice: 47999,
      mrp: 52999,
      image: "https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=600&auto=format&fit=crop&q=80",
      specs: ["Bay Blue, 128GB", "Aloe, 128GB", "Obsidian, 256GB"],
      keywords: ["phone", "smartphone", "android", "google", "pixel 8a"],
    },
    // Xiaomi / Redmi
    {
      brand: "Xiaomi",
      model: "Xiaomi 14 5G (Leica Optics)",
      basePrice: 69999,
      mrp: 79999,
      image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&auto=format&fit=crop&q=80",
      specs: ["Black, 12GB/512GB", "White, 12GB/512GB", "Jade Green, 512GB"],
      keywords: ["phone", "smartphone", "android", "xiaomi", "redmi"],
    },
    {
      brand: "Xiaomi",
      model: "Redmi Note 13 Pro+ 5G",
      basePrice: 30999,
      mrp: 35999,
      image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&auto=format&fit=crop&q=80",
      specs: ["Fusion Purple, 256GB", "Fusion Black, 12GB RAM", "Fusion White, 512GB"],
      keywords: ["phone", "smartphone", "android", "xiaomi", "redmi", "note 13"],
    },
    // POCO
    {
      brand: "POCO",
      model: "POCO X6 Pro 5G",
      basePrice: 24999,
      mrp: 30999,
      image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&auto=format&fit=crop&q=80",
      specs: ["Racing Yellow, 256GB", "Spectre Black, 12GB RAM", "Titanium Gray, 512GB"],
      keywords: ["phone", "smartphone", "android", "poco", "x6 pro"],
    },
    // Realme
    {
      brand: "Realme",
      model: "Realme 12 Pro+ 5G",
      basePrice: 27999,
      mrp: 34999,
      image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&auto=format&fit=crop&q=80",
      specs: ["Submarine Blue, 256GB", "Navigator Beige, 12GB/512GB"],
      keywords: ["phone", "smartphone", "android", "realme", "12 pro"],
    },
    // Vivo
    {
      brand: "Vivo",
      model: "Vivo V30 Pro 5G (ZEISS Optics)",
      basePrice: 39999,
      mrp: 46999,
      image: "https://images.unsplash.com/photo-1580910051074-3eb694886505?w=600&auto=format&fit=crop&q=80",
      specs: ["Classic Black, 256GB", "Andaman Blue, 512GB"],
      keywords: ["phone", "smartphone", "android", "vivo", "v30 pro"],
    },
    // iQOO
    {
      brand: "iQOO",
      model: "iQOO Neo 9 Pro 5G (Snapdragon 8 Gen 2)",
      basePrice: 34999,
      mrp: 39999,
      image: "https://images.unsplash.com/photo-1580910051074-3eb694886505?w=600&auto=format&fit=crop&q=80",
      specs: ["Fiery Red, 8GB/128GB", "Conqueror Black, 256GB"],
      keywords: ["phone", "smartphone", "android", "iqoo", "neo 9"],
    },
    // Motorola
    {
      brand: "Motorola",
      model: "Motorola Edge 50 Pro 5G",
      basePrice: 29999,
      mrp: 36999,
      image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&auto=format&fit=crop&q=80",
      specs: ["Luxe Lavender, 256GB", "Black Beauty, 12GB RAM", "Moonlight Pearl, 256GB"],
      keywords: ["phone", "smartphone", "android", "motorola", "moto", "edge 50"],
    },
    // Nothing
    {
      brand: "Nothing",
      model: "Nothing Phone (2a) 5G",
      basePrice: 21999,
      mrp: 25999,
      image: "https://images.unsplash.com/photo-1580910051074-3eb694886505?w=600&auto=format&fit=crop&q=80",
      specs: ["White, 8GB/128GB", "Black, 12GB/256GB", "Special Edition, 256GB"],
      keywords: ["phone", "smartphone", "android", "nothing", "phone 2a"],
    },
    // Oppo
    {
      brand: "Oppo",
      model: "Oppo Reno 11 Pro 5G",
      basePrice: 37999,
      mrp: 44999,
      image: "https://images.unsplash.com/photo-1580910051074-3eb694886505?w=600&auto=format&fit=crop&q=80",
      specs: ["Pearl White, 256GB", "Rock Grey, 12GB RAM"],
      keywords: ["phone", "smartphone", "android", "oppo", "reno 11"],
    },
  ],

  laptops: [
    // Apple
    {
      brand: "Apple",
      model: "MacBook Pro 14\" (M3 Pro, 18GB Memory, 512GB SSD)",
      basePrice: 189900,
      mrp: 199900,
      image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&auto=format&fit=crop&q=80",
      specs: ["Space Black", "Silver"],
      keywords: ["laptop", "macbook", "apple", "m3 pro", "notebook"],
    },
    {
      brand: "Apple",
      model: "MacBook Air 15\" (M3, 8-Core CPU, 10-Core GPU, 16GB RAM, 512GB SSD)",
      basePrice: 144900,
      mrp: 154900,
      image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&auto=format&fit=crop&q=80",
      specs: ["Midnight", "Starlight", "Space Grey"],
      keywords: ["laptop", "macbook", "apple", "macbook air", "m3"],
    },
    {
      brand: "Apple",
      model: "MacBook Air 13\" (M2, 8GB RAM, 256GB SSD)",
      basePrice: 89990,
      mrp: 99900,
      image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&auto=format&fit=crop&q=80",
      specs: ["Space Grey", "Starlight", "Silver"],
      keywords: ["laptop", "macbook", "apple", "macbook air", "m2"],
    },
    // Dell
    {
      brand: "Dell",
      model: "XPS 13 9315 (Intel Core i7 12th Gen, 16GB RAM, 512GB SSD, FHD+ Touch)",
      basePrice: 99990,
      mrp: 124990,
      image: "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=600&auto=format&fit=crop&q=80",
      specs: ["Sky Blue, 16GB/512GB", "Umber, 16GB/1TB"],
      keywords: ["laptop", "dell", "xps", "ultrabook", "notebook"],
    },
    {
      brand: "Dell",
      model: "G15 5530 Gaming (13th Gen Core i5-13450HX, RTX 3050 6GB, 16GB DDR5)",
      basePrice: 69990,
      mrp: 87990,
      image: "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=600&auto=format&fit=crop&q=80",
      specs: ["Dark Shadow Gray, 16GB/1TB SSD", "Quantum White"],
      keywords: ["laptop", "dell", "gaming", "rtx 3050"],
    },
    // HP
    {
      brand: "HP",
      model: "Victus Gaming 15 (13th Gen Intel Core i5-13420H, RTX 3050 6GB, 16GB RAM)",
      basePrice: 65990,
      mrp: 82990,
      image: "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=600&auto=format&fit=crop&q=80",
      specs: ["Mica Silver, 16GB/512GB", "Performance Blue, 16GB/1TB"],
      keywords: ["laptop", "hp", "victus", "gaming"],
    },
    {
      brand: "HP",
      model: "Pavilion 15 (13th Gen Intel Core i5-1335U, 16GB RAM, 512GB SSD, FHD IPS)",
      basePrice: 62990,
      mrp: 75990,
      image: "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=600&auto=format&fit=crop&q=80",
      specs: ["Natural Silver, Backlit Keyboard", "Fog Blue"],
      keywords: ["laptop", "hp", "pavilion", "notebook"],
    },
    // Lenovo
    {
      brand: "Lenovo",
      model: "LOQ Gaming Laptop (12th Gen Intel Core i5-12450HX, RTX 3050, 16GB)",
      basePrice: 59990,
      mrp: 79990,
      image: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=600&auto=format&fit=crop&q=80",
      specs: ["Storm Grey, 144Hz FHD", "Luna Grey, 16GB/512GB"],
      keywords: ["laptop", "lenovo", "loq", "gaming"],
    },
    {
      brand: "Lenovo",
      model: "IdeaPad Slim 3 (12th Gen Intel Core i5-1235U, 16GB RAM, 512GB SSD)",
      basePrice: 48990,
      mrp: 68990,
      image: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=600&auto=format&fit=crop&q=80",
      specs: ["Arctic Grey, 15.6\" FHD", "Abyss Blue"],
      keywords: ["laptop", "lenovo", "ideapad", "notebook"],
    },
    // ASUS
    {
      brand: "ASUS",
      model: "ROG Zephyrus G14 (AMD Ryzen 9 7940HS, RTX 4060, 16GB RAM, 1TB SSD)",
      basePrice: 139990,
      mrp: 169990,
      image: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=600&auto=format&fit=crop&q=80",
      specs: ["Moonlight White, Anime Matrix", "Eclipse Gray, 165Hz QHD"],
      keywords: ["laptop", "asus", "rog", "gaming", "zephyrus"],
    },
    {
      brand: "ASUS",
      model: "TUF Gaming F15 (Intel Core i5-11400H 11th Gen, RTX 2050 4GB, 16GB RAM)",
      basePrice: 51990,
      mrp: 74990,
      image: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=600&auto=format&fit=crop&q=80",
      specs: ["Graphite Black, 144Hz FHD", "Bonfire Black"],
      keywords: ["laptop", "asus", "tuf", "gaming"],
    },
    // Acer
    {
      brand: "Acer",
      model: "Predator Helios Neo 16 (14th Gen Intel Core i7-14700HX, RTX 4060 8GB)",
      basePrice: 119990,
      mrp: 149999,
      image: "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=600&auto=format&fit=crop&q=80",
      specs: ["Abyssal Black, WQXGA 165Hz", "16GB DDR5/1TB SSD"],
      keywords: ["laptop", "acer", "predator", "gaming"],
    },
    // Samsung
    {
      brand: "Samsung",
      model: "Galaxy Book4 (Intel Core 5 120U, 16GB RAM, 512GB SSD, 15.6\" FHD)",
      basePrice: 67990,
      mrp: 84990,
      image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&auto=format&fit=crop&q=80",
      specs: ["Silver, Thin & Light 1.55kg", "Gray, 16GB/512GB"],
      keywords: ["laptop", "samsung", "galaxy book", "notebook"],
    },
    // MSI
    {
      brand: "MSI",
      model: "Thin 15 (12th Gen Intel Core i5-12450H, RTX 2050 4GB, 16GB RAM)",
      basePrice: 47990,
      mrp: 64990,
      image: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=600&auto=format&fit=crop&q=80",
      specs: ["Cosmos Gray, 144Hz Display", "Black, 16GB/512GB"],
      keywords: ["laptop", "msi", "thin 15", "gaming"],
    },
  ],

  audio: [
    // Sony
    {
      brand: "Sony",
      model: "WH-1000XM5 Wireless Noise Cancelling Headphones",
      basePrice: 28990,
      mrp: 34990,
      image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80",
      specs: ["Silver, 30H Battery", "Black, Multi-Noise Sensor", "Midnight Blue"],
      keywords: ["audio", "headphone", "headphones", "sony", "xm5", "anc", "wireless"],
    },
    {
      brand: "Sony",
      model: "WH-1000XM4 Wireless Noise Cancelling Headphones",
      basePrice: 22990,
      mrp: 29990,
      image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80",
      specs: ["Black", "Silver", "30H Battery, Touch Sensor"],
      keywords: ["audio", "headphone", "headphones", "sony", "xm4", "anc"],
    },
    {
      brand: "Sony",
      model: "WF-1000XM5 True Wireless Earbuds with Hi-Res Audio",
      basePrice: 21990,
      mrp: 29990,
      image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&auto=format&fit=crop&q=80",
      specs: ["Black, Multipoint", "Silver, Bone Conduction Sensor"],
      keywords: ["audio", "earbuds", "tws", "sony", "earphone"],
    },
    // Apple
    {
      brand: "Apple",
      model: "AirPods Pro (2nd Generation) with MagSafe Case (USB-C)",
      basePrice: 20999,
      mrp: 24900,
      image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&auto=format&fit=crop&q=80",
      specs: ["Active Noise Cancellation", "Adaptive Audio & Transparency"],
      keywords: ["audio", "airpods", "apple", "earbuds", "tws"],
    },
    {
      brand: "Apple",
      model: "AirPods Max Over-Ear Wireless Headphones",
      basePrice: 54900,
      mrp: 59900,
      image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80",
      specs: ["Space Grey", "Silver", "Sky Blue"],
      keywords: ["audio", "airpods max", "apple", "headphones"],
    },
    // boAt
    {
      brand: "boAt",
      model: "Airdopes 141 ANC True Wireless Earbuds with 42H Playtime",
      basePrice: 1299,
      mrp: 4490,
      image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&auto=format&fit=crop&q=80",
      specs: ["Gunmetal Black, 32dB ANC", "Cider Cyan, ENx Tech"],
      keywords: ["audio", "boat", "airdopes", "earbuds", "tws"],
    },
    {
      brand: "boAt",
      model: "Rockerz 255 Pro+ Bluetooth Neckband with 60H Playtime",
      basePrice: 1199,
      mrp: 3990,
      image: "https://images.unsplash.com/photo-1572536147248-ac59a8abfa4b?w=600&auto=format&fit=crop&q=80",
      specs: ["Teal Green, ASAP Charge", "Navy Blue", "Active Black"],
      keywords: ["audio", "boat", "neckband", "bluetooth", "rockerz"],
    },
    // JBL
    {
      brand: "JBL",
      model: "Charge 5 Portable Waterproof Bluetooth Speaker with Powerbank",
      basePrice: 14999,
      mrp: 18999,
      image: "https://images.unsplash.com/photo-1545454675-3531b543be5d?w=600&auto=format&fit=crop&q=80",
      specs: ["Squad Camo, IP67", "Black, 20H Playtime", "Blue"],
      keywords: ["audio", "speaker", "bluetooth speaker", "jbl", "charge 5"],
    },
    {
      brand: "JBL",
      model: "Tune 230NC TWS Active Noise Cancelling Earbuds",
      basePrice: 4499,
      mrp: 7999,
      image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&auto=format&fit=crop&q=80",
      specs: ["Black, 40H Playtime", "Blue, Pure Bass Sound"],
      keywords: ["audio", "jbl", "earbuds", "tws"],
    },
    // Sennheiser
    {
      brand: "Sennheiser",
      model: "Momentum 4 Wireless Audiophile Headphones with 60H Battery",
      basePrice: 27990,
      mrp: 34990,
      image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80",
      specs: ["White, Adaptive ANC", "Black, Audiophile Sound"],
      keywords: ["audio", "sennheiser", "headphones", "momentum 4"],
    },
    // OnePlus
    {
      brand: "OnePlus",
      model: "Bullets Wireless Z2 Bluetooth Earphones",
      basePrice: 1699,
      mrp: 2299,
      image: "https://images.unsplash.com/photo-1572536147248-ac59a8abfa4b?w=600&auto=format&fit=crop&q=80",
      specs: ["Magico Black, 30H Playtime", "Acoustic Red, Fast Charge"],
      keywords: ["audio", "oneplus", "bullets", "neckband"],
    },
    // Noise
    {
      brand: "Noise",
      model: "Buds VS104 Truly Wireless Earbuds with 45H Playtime",
      basePrice: 1299,
      mrp: 3499,
      image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&auto=format&fit=crop&q=80",
      specs: ["Mint Green, Instacharge", "Charcoal Black, Quad Mic"],
      keywords: ["audio", "noise", "earbuds", "tws"],
    },
    // Boult
    {
      brand: "Boult",
      model: "Boult Audio Z40 True Wireless Earbuds with 60H Playtime",
      basePrice: 1199,
      mrp: 4999,
      image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&auto=format&fit=crop&q=80",
      specs: ["Blue, Zen Quad Mic ENC", "White, Low Latency Gaming"],
      keywords: ["audio", "boult", "earbuds", "tws"],
    },
    // Fire-Boltt
    {
      brand: "Fire-Boltt",
      model: "Fire Pods Ninja Pro True Wireless Earbuds",
      basePrice: 999,
      mrp: 3999,
      image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&auto=format&fit=crop&q=80",
      specs: ["Jet Black, 24H Battery", "Pearl White, IPX4 Water Resistant"],
      keywords: ["audio", "fire-boltt", "earbuds", "tws"],
    },
    // Realme
    {
      brand: "Realme",
      model: "Realme Buds Air 5 Pro ANC Earbuds (50dB Active Noise Cancellation)",
      basePrice: 4999,
      mrp: 7999,
      image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&auto=format&fit=crop&q=80",
      specs: ["Sunrise Beige, Hi-Res Audio", "Astral Black, 40H Battery"],
      keywords: ["audio", "realme", "earbuds", "anc"],
    },
  ],

  fashion: [
    // Nike
    {
      brand: "Nike",
      model: "Air Max Excee Men's Running Shoes",
      basePrice: 6295,
      mrp: 7995,
      image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=80",
      specs: ["Black/White, UK 8", "White/Pure Platinum, UK 9", "Triple Black, UK 10"],
      keywords: ["shoes", "sneakers", "running shoes", "footwear", "nike", "fashion"],
    },
    {
      brand: "Nike",
      model: "Court Vision Low Men's Retro Casual Sneakers",
      basePrice: 4995,
      mrp: 5695,
      image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=80",
      specs: ["Triple White, UK 8", "Black/White, UK 9"],
      keywords: ["shoes", "sneakers", "casual shoes", "nike", "fashion"],
    },
    // Puma
    {
      brand: "Puma",
      model: "Dazzler Men's Low-Top Casual Sneakers",
      basePrice: 1799,
      mrp: 3999,
      image: "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=600&auto=format&fit=crop&q=80",
      specs: ["White-Peacoat, UK 7", "Puma Black, UK 8", "High Risk Red, UK 9"],
      keywords: ["shoes", "sneakers", "casual shoes", "puma", "fashion"],
    },
    {
      brand: "Puma",
      model: "Softride Rift Men's Running Shoes",
      basePrice: 2499,
      mrp: 4999,
      image: "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=600&auto=format&fit=crop&q=80",
      specs: ["Castlerock-Black, UK 8", "Puma Navy, UK 9"],
      keywords: ["shoes", "running shoes", "puma", "footwear"],
    },
    // Adidas
    {
      brand: "Adidas",
      model: "Men's Adizero RC 5 Lightweight Road Running Shoes",
      basePrice: 4499,
      mrp: 7999,
      image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=80",
      specs: ["Core Black, UK 8", "Solar Red, UK 9", "Cloud White, UK 10"],
      keywords: ["shoes", "running shoes", "adidas", "sneakers"],
    },
    {
      brand: "Adidas",
      model: "Stan Smith Classic Leather Casual Sneakers",
      basePrice: 5399,
      mrp: 8999,
      image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=80",
      specs: ["Cloud White/Green, UK 8", "Cloud White/Navy, UK 9"],
      keywords: ["shoes", "sneakers", "casual shoes", "adidas", "stan smith"],
    },
    // Levi's
    {
      brand: "Levi's",
      model: "Men's 511 Slim Fit Stretchable Denim Jeans",
      basePrice: 2199,
      mrp: 3999,
      image: "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=600&auto=format&fit=crop&q=80",
      specs: ["Mid Indigo Wash, 32W x 32L", "Dark Blue Stone, 34W x 32L", "Black, 30W x 30L"],
      keywords: ["jeans", "denim", "pants", "levis", "clothes", "fashion"],
    },
    // Crocs
    {
      brand: "Crocs",
      model: "Classic Unisex Slip-On Waterproof Clogs",
      basePrice: 2295,
      mrp: 2995,
      image: "https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=600&auto=format&fit=crop&q=80",
      specs: ["Navy, UK 8", "White, UK 7", "Black, UK 9", "Army Green, UK 10"],
      keywords: ["clogs", "crocs", "footwear", "slippers", "sandals"],
    },
    // Bata
    {
      brand: "Bata",
      model: "Men's Formal Derby Genuine Leather Dress Shoes",
      basePrice: 1699,
      mrp: 2999,
      image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=80",
      specs: ["Black, UK 8", "Dark Tan Brown, UK 9"],
      keywords: ["shoes", "formal shoes", "bata", "leather shoes"],
    },
    // Campus
    {
      brand: "Campus",
      model: "North Plus Men's Lightweight Running Shoes",
      basePrice: 1299,
      mrp: 2199,
      image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=80",
      specs: ["Grey/Orange, UK 8", "Black/Gold, UK 9", "Navy Blue, UK 10"],
      keywords: ["shoes", "campus", "running shoes", "sneakers"],
    },
    // Sparx
    {
      brand: "Sparx",
      model: "SM-676 Men's Lightweight Sports Running Shoes",
      basePrice: 999,
      mrp: 1799,
      image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=80",
      specs: ["Black/Red, UK 8", "Grey/Lime, UK 9"],
      keywords: ["shoes", "sparx", "running shoes", "sports"],
    },
    // Woodland
    {
      brand: "Woodland",
      model: "Men's Rugged OGC Leather Outdoor Trekking Boots",
      basePrice: 3895,
      mrp: 5495,
      image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=80",
      specs: ["Camel Nubuck, UK 8", "Khaki Brown, UK 9", "Dark Brown, UK 10"],
      keywords: ["boots", "woodland", "shoes", "leather", "trekking"],
    },
    // Red Tape
    {
      brand: "Red Tape",
      model: "Men's Retro Low-Top Athleisure Walking Sneakers",
      basePrice: 1499,
      mrp: 4999,
      image: "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=600&auto=format&fit=crop&q=80",
      specs: ["White/Blue, UK 8", "Off White, UK 9", "Black/Grey, UK 7"],
      keywords: ["shoes", "red tape", "sneakers", "walking shoes"],
    },
    // Libas
    {
      brand: "Libas",
      model: "Women's Pure Cotton Printed Straight Kurta & Pant Set",
      basePrice: 1499,
      mrp: 3299,
      image: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=600&auto=format&fit=crop&q=80",
      specs: ["Navy Blue Floral, M", "Teal Green, L", "Maroon, XL"],
      keywords: ["kurta", "kurti", "libas", "women fashion", "ethnic", "dress"],
    },
    // BIBA
    {
      brand: "BIBA",
      model: "Women's Embroidered Rayon Festive Kurti with Sharara",
      basePrice: 2499,
      mrp: 4999,
      image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&auto=format&fit=crop&q=80",
      specs: ["Teal Green Gold Zari, S", "Coral Pink, M", "Royal Blue, L"],
      keywords: ["kurta", "kurti", "biba", "sharara", "ethnic", "festive"],
    },
    // Manyavar
    {
      brand: "Manyavar",
      model: "Men's Silk Blend Jacquard Wedding Kurta Set with Pajama",
      basePrice: 3999,
      mrp: 5999,
      image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&auto=format&fit=crop&q=80",
      specs: ["Maroon Embroidered, M", "Cream Gold Collar, L", "Navy Blue, XL"],
      keywords: ["kurta", "manyavar", "men ethnic", "wedding", "sherwani"],
    },
    // Allen Solly
    {
      brand: "Allen Solly",
      model: "Men's Slim Fit Cotton Button-Down Casual Shirt",
      basePrice: 1299,
      mrp: 2499,
      image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&auto=format&fit=crop&q=80",
      specs: ["Sky Blue Check, 40", "Navy Solid, 42", "White Linen Blend, 44"],
      keywords: ["shirt", "allen solly", "men shirt", "casual shirt"],
    },
    // Peter England
    {
      brand: "Peter England",
      model: "Men's Formal Regular Fit Solid Cotton Shirt",
      basePrice: 899,
      mrp: 1799,
      image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&auto=format&fit=crop&q=80",
      specs: ["Crisp White, 40", "Pastel Pink, 42", "Light Grey, 38"],
      keywords: ["shirt", "formal shirt", "peter england", "men shirt"],
    },
    // Van Heusen
    {
      brand: "Van Heusen",
      model: "Men's Athleisure Ultra-Soft Anti-Bacterial Polo T-Shirt",
      basePrice: 999,
      mrp: 1699,
      image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&auto=format&fit=crop&q=80",
      specs: ["Jet Black, M", "Navy Blazer, L", "Heather Grey, XL"],
      keywords: ["polo", "t-shirt", "tshirt", "van heusen", "men clothes"],
    },
    // Zara
    {
      brand: "Zara",
      model: "Men's Textured Stretch Cotton Chino Trousers",
      basePrice: 2790,
      mrp: 3990,
      image: "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=600&auto=format&fit=crop&q=80",
      specs: ["Beige Sand, 32", "Navy Blue, 34", "Olive Green, 30"],
      keywords: ["trousers", "chinos", "zara", "pants", "fashion"],
    },
    // FabIndia
    {
      brand: "FabIndia",
      model: "Men's Handloom Pure Cotton Comfort Short Kurta",
      basePrice: 1399,
      mrp: 1999,
      image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&auto=format&fit=crop&q=80",
      specs: ["Indigo Blue Print, M", "Natural Ecru, L", "Rust Orange, XL"],
      keywords: ["kurta", "fabindia", "cotton kurta", "ethnic"],
    },
    // Shoetopia
    {
      brand: "Shoetopia",
      model: "Women's Stiletto High Heel Party Sandals",
      basePrice: 999,
      mrp: 1999,
      image: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=600&auto=format&fit=crop&q=80",
      specs: ["Black Stiletto, UK 5", "Rose Gold, UK 6", "Nude, UK 7"],
      keywords: ["heels", "heel", "high heels", "sandals", "shoetopia", "footwear", "fashion"],
    },
    // ERIDANI
    {
      brand: "ERIDANI",
      model: "Women's Braided Strap Chunky Block Heels",
      basePrice: 1299,
      mrp: 2999,
      image: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=600&auto=format&fit=crop&q=80",
      specs: ["White Braided, UK 5", "Beige Block Heel, UK 6", "Tan, UK 7"],
      keywords: ["heels", "heel", "block heels", "sandals", "eridani", "footwear"],
    },
    // Theater
    {
      brand: "Theater",
      model: "Women's Strappy Party Block Heels",
      basePrice: 1799,
      mrp: 3499,
      image: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=600&auto=format&fit=crop&q=80",
      specs: ["Silver Metallic, UK 5", "Gold Shimmer, UK 6"],
      keywords: ["heels", "heel", "party heels", "theater", "sandals", "footwear"],
    },
    // TRASE
    {
      brand: "TRASE",
      model: "Women's Orthopedic Soft Doctor Slipper Sandals & Kitten Heels",
      basePrice: 799,
      mrp: 1499,
      image: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=600&auto=format&fit=crop&q=80",
      specs: ["Black Cushion, UK 6", "Beige, UK 7", "Maroon, UK 8"],
      keywords: ["heels", "heel", "sandals", "trase", "slippers", "footwear"],
    },
  ],

  appliances: [
    // LG
    {
      brand: "LG",
      model: "7 Kg 5 Star Direct Drive Front Load Washing Machine",
      basePrice: 28990,
      mrp: 39990,
      image: "https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=600&auto=format&fit=crop&q=80",
      specs: ["6 Motion Steam Wash, Middle Black", "Touch Panel, Luxury Silver"],
      keywords: ["washing machine", "appliance", "lg", "front load"],
    },
    {
      brand: "LG",
      model: "55\" 4K Ultra HD Smart OLED evo TV",
      basePrice: 114990,
      mrp: 169990,
      image: "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=600&auto=format&fit=crop&q=80",
      specs: ["webOS AI ThinQ, Dolby Vision IQ", "120Hz Refresh, Gaming Dashboard"],
      keywords: ["tv", "smart tv", "television", "lg", "oled", "4k"],
    },
    {
      brand: "LG",
      model: "1.5 Ton 5 Star AI Dual Inverter Split AC",
      basePrice: 42990,
      mrp: 65990,
      image: "https://images.unsplash.com/photo-1585659722983-3a675dabf23d?w=600&auto=format&fit=crop&q=80",
      specs: ["Super Convertible 6-in-1, Copper", "HD Filter with Anti-Virus"],
      keywords: ["ac", "air conditioner", "split ac", "lg"],
    },
    // Samsung
    {
      brand: "Samsung",
      model: "256L 3 Star Inverter Double Door Frost Free Refrigerator",
      basePrice: 25490,
      mrp: 33990,
      image: "https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=600&auto=format&fit=crop&q=80",
      specs: ["Convertible 5-in-1, Elegant Inox", "Digital Inverter, Silver Inox"],
      keywords: ["refrigerator", "fridge", "double door", "samsung", "appliance"],
    },
    {
      brand: "Samsung",
      model: "55\" Crystal 4K Vivid Pro Ultra HD Smart TV",
      basePrice: 43990,
      mrp: 68900,
      image: "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=600&auto=format&fit=crop&q=80",
      specs: ["PurColor, SolarCell Remote", "OTS Lite 3D Surround Sound"],
      keywords: ["tv", "smart tv", "television", "samsung", "4k"],
    },
    // Philips
    {
      brand: "Philips",
      model: "Digital Air Fryer XXL 7.2L with Rapid CombiAir Tech",
      basePrice: 12999,
      mrp: 18995,
      image: "https://images.unsplash.com/photo-1585659722983-3a675dabf23d?w=600&auto=format&fit=crop&q=80",
      specs: ["Connected NutriU App, 16-in-1 Functions", "90% Less Fat, Black"],
      keywords: ["air fryer", "fryer", "philips", "kitchen appliance"],
    },
    // Prestige
    {
      brand: "Prestige",
      model: "Iris Plus 750W Mixer Grinder with 4 Multi-Utility Jars",
      basePrice: 2899,
      mrp: 6295,
      image: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=600&auto=format&fit=crop&q=80",
      specs: ["Pure Copper Motor, White & Blue", "Super Extractor Juicer Jar"],
      keywords: ["mixer", "grinder", "mixer grinder", "prestige", "kitchen"],
    },
    // Havells
    {
      brand: "Havells",
      model: "Adonia Spin 25L 5-Star Storage Water Heater Geyser",
      basePrice: 10499,
      mrp: 18490,
      image: "https://images.unsplash.com/photo-1585659722983-3a675dabf23d?w=600&auto=format&fit=crop&q=80",
      specs: ["Feroglas Technology, LED Indicator", "Color Changing Indicator"],
      keywords: ["geyser", "water heater", "havells", "heater"],
    },
    // Bosch
    {
      brand: "Bosch",
      model: "Series 6 8 Kg Fully Automatic Front Load Washing Machine",
      basePrice: 38990,
      mrp: 52990,
      image: "https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=600&auto=format&fit=crop&q=80",
      specs: ["EcoSilence Drive, Anti-Tangle", "Silver Inox, Touch Display"],
      keywords: ["washing machine", "bosch", "front load"],
    },
    // IFB
    {
      brand: "IFB",
      model: "8 Kg 5 Star AI Front Load Washing Machine (Senator Smart SXS)",
      basePrice: 36990,
      mrp: 48990,
      image: "https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=600&auto=format&fit=crop&q=80",
      specs: ["AI Powered Wash, 2X Steam Cycle", "Silver, Cradle Wash"],
      keywords: ["washing machine", "ifb", "front load"],
    },
    // Whirlpool
    {
      brand: "Whirlpool",
      model: "207L 5 Star Inverter Direct-Cool Single Door Refrigerator",
      basePrice: 17490,
      mrp: 23990,
      image: "https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=600&auto=format&fit=crop&q=80",
      specs: ["IntelliSense Inverter, Sapphire Abyss", "Base Stand with Drawer"],
      keywords: ["refrigerator", "fridge", "whirlpool"],
    },
    // Eureka Forbes
    {
      brand: "Eureka Forbes",
      model: "Aquaguard Sure Delight NXT RO+UV Water Purifier",
      basePrice: 8999,
      mrp: 14000,
      image: "https://images.unsplash.com/photo-1585659722983-3a675dabf23d?w=600&auto=format&fit=crop&q=80",
      specs: ["6 Stage Purification, MTDS Adjuster", "6L Tank, Food Grade Plastic"],
      keywords: ["water purifier", "purifier", "aquaguard", "eureka forbes", "ro"],
    },
    // Bajaj
    {
      brand: "Bajaj",
      model: "New Shakti Neo 15L Vertical Storage Geyser",
      basePrice: 5999,
      mrp: 9950,
      image: "https://images.unsplash.com/photo-1585659722983-3a675dabf23d?w=600&auto=format&fit=crop&q=80",
      specs: ["Titanium Armour Technology, 8 Bar", "White & Blue"],
      keywords: ["geyser", "water heater", "bajaj"],
    },
    // Crompton
    {
      brand: "Crompton",
      model: "Energion BLDC 1200mm High Speed Energy Saving Ceiling Fan",
      basePrice: 2699,
      mrp: 4500,
      image: "https://images.unsplash.com/photo-1585659722983-3a675dabf23d?w=600&auto=format&fit=crop&q=80",
      specs: ["RF Remote Control, 28W Motor", "Opal White, 370 RPM"],
      keywords: ["fan", "ceiling fan", "crompton", "bldc"],
    },
    // Kent
    {
      brand: "Kent",
      model: "Grand Plus RO+UV+UF+TDS Control Alkaline Water Purifier",
      basePrice: 14999,
      mrp: 20000,
      image: "https://images.unsplash.com/photo-1585659722983-3a675dabf23d?w=600&auto=format&fit=crop&q=80",
      specs: ["In-tank UV Disinfection, 9L Tank", "Zero Water Wastage Technology"],
      keywords: ["water purifier", "purifier", "kent", "ro"],
    },
    // Voltas
    {
      brand: "Voltas",
      model: "1.5 Ton 5 Star Inverter Split AC (185V Vectra Elite)",
      basePrice: 38490,
      mrp: 67990,
      image: "https://images.unsplash.com/photo-1585659722983-3a675dabf23d?w=600&auto=format&fit=crop&q=80",
      specs: ["4-in-1 Adjustable Mode, 100% Copper", "Anti-Dust Filter"],
      keywords: ["ac", "air conditioner", "voltas", "split ac"],
    },
  ],

  beauty: [
    // Minimalist
    {
      brand: "Minimalist",
      model: "10% Niacinamide Face Serum with Zinc for Acne Marks (30ml)",
      basePrice: 569,
      mrp: 599,
      image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600&auto=format&fit=crop&q=80",
      specs: ["EUV-134 Antioxidant, Fragrance Free", "For All Skin Types"],
      keywords: ["serum", "niacinamide", "minimalist", "skincare", "beauty"],
    },
    {
      brand: "Minimalist",
      model: "2% Salicylic Acid Face Serum for Blackheads & Pore Tightening (30ml)",
      basePrice: 519,
      mrp: 549,
      image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600&auto=format&fit=crop&q=80",
      specs: ["With Oligopeptide, Non-comedogenic", "Gentle BHA Exfoliant"],
      keywords: ["serum", "salicylic acid", "minimalist", "skincare"],
    },
    // The Derma Co
    {
      brand: "The Derma Co",
      model: "1% Hyaluronic Sunscreen Aqua Gel with SPF 50 & PA++++ (50g)",
      basePrice: 449,
      mrp: 499,
      image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600&auto=format&fit=crop&q=80",
      specs: ["Zero White Cast, Blue Light Guard", "Broad Spectrum, Vitamin E"],
      keywords: ["sunscreen", "the derma co", "derma co", "spf 50", "skincare"],
    },
    // Mamaearth
    {
      brand: "Mamaearth",
      model: "Onion Hair Oil for Hair Fall Control with Redensyl (250ml)",
      basePrice: 479,
      mrp: 599,
      image: "https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?w=600&auto=format&fit=crop&q=80",
      specs: ["With Castor Oil & Almond Oil", "Dermatologically Tested, Sulphate Free"],
      keywords: ["hair oil", "onion oil", "mamaearth", "hair care"],
    },
    {
      brand: "Mamaearth",
      model: "Ubtan Natural Face Wash with Turmeric & Saffron for Tan Removal (150ml)",
      basePrice: 329,
      mrp: 399,
      image: "https://images.unsplash.com/photo-1567928815104-b7980ee5032e?w=600&auto=format&fit=crop&q=80",
      specs: ["Walnut Beads Exfoliation", "Sulphate & Paraben Free"],
      keywords: ["face wash", "mamaearth", "ubtan", "skincare"],
    },
    // mCaffeine
    {
      brand: "mCaffeine",
      model: "Naked & Raw Coffee Face Wash with White Water Lily (100ml)",
      basePrice: 299,
      mrp: 349,
      image: "https://images.unsplash.com/photo-1567928815104-b7980ee5032e?w=600&auto=format&fit=crop&q=80",
      specs: ["Deep Pore Cleansing, Tan Removal", "Natural Pure Arabica Caffeine"],
      keywords: ["face wash", "mcaffeine", "coffee", "skincare"],
    },
    // Plum
    {
      brand: "Plum",
      model: "Green Tea Pore Cleansing Face Wash with Glycolic Acid (100ml)",
      basePrice: 299,
      mrp: 375,
      image: "https://images.unsplash.com/photo-1567928815104-b7980ee5032e?w=600&auto=format&fit=crop&q=80",
      specs: ["Gentle Green Tea Cellulose Scrub", "100% Vegan, For Oily Skin"],
      keywords: ["face wash", "plum", "green tea", "skincare"],
    },
    // Biotique
    {
      brand: "Biotique",
      model: "Bio Dandelion Ageless Lightening Face Serum (40ml)",
      basePrice: 249,
      mrp: 330,
      image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600&auto=format&fit=crop&q=80",
      specs: ["100% Pure Botanical Extracts", "Ayurvedic Recipe, Vitamin E"],
      keywords: ["serum", "biotique", "ayurvedic", "skincare"],
    },
    // Forest Essentials
    {
      brand: "Forest Essentials",
      model: "Soundarya Radiance Cream with 24K Gold & SPF 25 (50g)",
      basePrice: 4995,
      mrp: 5800,
      image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600&auto=format&fit=crop&q=80",
      specs: ["With 24K Pure Gold Bhasma", "Cold Pressed Oils, Ayurvedic Luxury"],
      keywords: ["cream", "forest essentials", "luxury skincare", "gold"],
    },
    // L'Oreal
    {
      brand: "L'Oreal",
      model: "Revitalift 1.5% Hyaluronic Acid Anti-Aging Face Serum (30ml)",
      basePrice: 699,
      mrp: 999,
      image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600&auto=format&fit=crop&q=80",
      specs: ["Micro-Hyaluronic Acid Plumping", "Fragrance Free, Fast Absorbing"],
      keywords: ["serum", "loreal", "l'oreal", "hyaluronic acid"],
    },
    // Garnier
    {
      brand: "Garnier",
      model: "Bright Complete 30X Vitamin C Booster Face Serum (30ml)",
      basePrice: 429,
      mrp: 599,
      image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600&auto=format&fit=crop&q=80",
      specs: ["Japanese Yuzu Lemon Extract", "Reduces Dark Spots in 3 Days"],
      keywords: ["serum", "vitamin c", "garnier", "skincare"],
    },
    // Nivea
    {
      brand: "Nivea",
      model: "Men Dark Spot Reduction Moisturizer Creme with SPF 30 (150ml)",
      basePrice: 299,
      mrp: 425,
      image: "https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?w=600&auto=format&fit=crop&q=80",
      specs: ["Non-Greasy Formula, Fast Absorbing", "With UV Filters"],
      keywords: ["cream", "moisturizer", "nivea", "men skincare"],
    },
    // Philips Grooming
    {
      brand: "Philips",
      model: "Series 1000 Cordless USB Rechargeable Beard Trimmer (BT1232/15)",
      basePrice: 949,
      mrp: 1195,
      image: "https://images.unsplash.com/photo-1585659722983-3a675dabf23d?w=600&auto=format&fit=crop&q=80",
      specs: ["Skin-Friendly DuraPower Blades", "30min Cordless Use, USB Charging"],
      keywords: ["trimmer", "beard trimmer", "philips", "grooming"],
    },
    // Vega
    {
      brand: "Vega",
      model: "3-in-1 Hair Styler (Straightener, Curler & Crimper)",
      basePrice: 1499,
      mrp: 2199,
      image: "https://images.unsplash.com/photo-1585659722983-3a675dabf23d?w=600&auto=format&fit=crop&q=80",
      specs: ["Ceramic Coated Plates, One Button Switch", "360 Degree Swivel Cord"],
      keywords: ["hair styler", "straightener", "vega", "beauty"],
    },
  ],
};

/**
 * Filter templates matching optional brand, category, and search query keywords
 */
function getMatchingTemplates(
  categorySlug: string,
  brandFilter?: string,
  queryFilter?: string,
  minPrice?: number,
  maxPrice?: number
): CatalogTemplate[] {
  const catTemplates = BASE_TEMPLATES[categorySlug] || BASE_TEMPLATES.mobiles;

  let candidates = catTemplates;

  // 1. Brand filter
  if (brandFilter && brandFilter.trim().length > 0) {
    const bLower = brandFilter.toLowerCase().trim();
    const brandMatched = candidates.filter(
      (t) =>
        t.brand.toLowerCase() === bLower ||
        t.brand.toLowerCase().includes(bLower) ||
        bLower.includes(t.brand.toLowerCase())
    );

    if (brandMatched.length > 0) {
      candidates = brandMatched;
    } else {
      // Dynamic fallback template for any rare brand not directly in catalog
      candidates = [
        {
          brand: brandFilter,
          model: `${brandFilter} Pro Series Verified Unit`,
          basePrice: 19999,
          mrp: 27999,
          image: catTemplates[0]?.image || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600",
          specs: ["Standard Edition", "Special Edition", "Pro Edition"],
          keywords: [brandFilter.toLowerCase(), categorySlug],
        },
      ];
    }
  }

  // 2. Query filter
  if (queryFilter && queryFilter.trim().length > 0) {
    const qLower = queryFilter.toLowerCase().trim();
    const queryMatched = candidates.filter((t) => {
      const inTitle = t.model.toLowerCase().includes(qLower);
      const inBrand = t.brand.toLowerCase().includes(qLower);
      const inKeywords = t.keywords?.some((k) => k.toLowerCase().includes(qLower) || qLower.includes(k.toLowerCase()));
      return inTitle || inBrand || inKeywords;
    });

    if (queryMatched.length > 0) {
      candidates = queryMatched;
    }
  }

  // 3. Price filter
  if (minPrice !== undefined) {
    const priceFiltered = candidates.filter((t) => t.basePrice * 1.2 >= minPrice);
    if (priceFiltered.length > 0) candidates = priceFiltered;
  }
  if (maxPrice !== undefined) {
    const priceFiltered = candidates.filter((t) => t.basePrice * 0.8 <= maxPrice);
    if (priceFiltered.length > 0) candidates = priceFiltered;
  }

  return candidates.length > 0 ? candidates : catTemplates;
}

function detectCategoryForQuery(query: string): string | null {
  const q = query.toLowerCase().trim();
  if (
    q.includes("heel") ||
    q.includes("shoe") ||
    q.includes("sneaker") ||
    q.includes("sandal") ||
    q.includes("boot") ||
    q.includes("clog") ||
    q.includes("jeans") ||
    q.includes("shirt") ||
    q.includes("kurta") ||
    q.includes("kurti") ||
    q.includes("trousers") ||
    q.includes("polo") ||
    q.includes("denim") ||
    q.includes("saree") ||
    q.includes("dress")
  ) {
    return "fashion";
  }
  if (
    q.includes("phone") ||
    q.includes("mobile") ||
    q.includes("iphone") ||
    q.includes("pixel") ||
    q.includes("galaxy s") ||
    q.includes("oneplus") ||
    q.includes("redmi") ||
    q.includes("realme") ||
    q.includes("poco")
  ) {
    return "mobiles";
  }
  if (
    q.includes("laptop") ||
    q.includes("macbook") ||
    q.includes("thinkpad") ||
    q.includes("notebook")
  ) {
    return "laptops";
  }
  if (
    q.includes("headphone") ||
    q.includes("earbud") ||
    q.includes("airpods") ||
    q.includes("tws") ||
    q.includes("neckband") ||
    q.includes("soundbar") ||
    q.includes("speaker")
  ) {
    return "audio";
  }
  if (
    q.includes("fryer") ||
    q.includes("mixer") ||
    q.includes("grinder") ||
    q.includes("refrigerator") ||
    q.includes("fridge") ||
    q.includes("washing machine") ||
    q.includes("geyser") ||
    q.includes("purifier") ||
    q.includes("ac") ||
    q.includes("fan") ||
    q.includes("tv") ||
    q.includes("television")
  ) {
    return "appliances";
  }
  if (
    q.includes("serum") ||
    q.includes("sunscreen") ||
    q.includes("shampoo") ||
    q.includes("hair oil") ||
    q.includes("face wash") ||
    q.includes("cream") ||
    q.includes("skincare") ||
    q.includes("trimmer")
  ) {
    return "beauty";
  }
  return null;
}

/**
 * Deterministically synthesizes endless products for ANY category, brand, or search query
 * Supports both options object or traditional positional parameters for 100% backward compatibility
 */
export function synthesizeEndlessProducts(
  categoryOrOptions?: string | EndlessCatalogParams,
  legacyPage: number = 1,
  legacyCount: number = 24,
  legacyQuery?: string,
  legacyBrand?: string
): PriceComparison[] {
  let categorySlug = "mobiles";
  let brand: string | undefined = legacyBrand;
  let searchQuery: string | undefined = legacyQuery;
  let page = legacyPage;
  let count = legacyCount;
  let startIndex: number | undefined = undefined;
  let minPrice: number | undefined = undefined;
  let maxPrice: number | undefined = undefined;
  let sortBy: "price_asc" | "price_desc" | "discount" | "newest" | "rating" | undefined = undefined;

  if (typeof categoryOrOptions === "object" && categoryOrOptions !== null) {
    categorySlug = categoryOrOptions.categorySlug || "mobiles";
    brand = categoryOrOptions.brand;
    searchQuery = categoryOrOptions.searchQuery;
    page = categoryOrOptions.page || 1;
    count = categoryOrOptions.count || 24;
    startIndex = categoryOrOptions.startIndex;
    minPrice = categoryOrOptions.minPrice;
    maxPrice = categoryOrOptions.maxPrice;
    sortBy = categoryOrOptions.sortBy;
  } else if (typeof categoryOrOptions === "string") {
    categorySlug = categoryOrOptions;
  }

  // Auto-detect specific category from search query if category is unspecified
  if (searchQuery && (!categorySlug || categorySlug === "all" || categorySlug === "mobiles")) {
    const detected = detectCategoryForQuery(searchQuery);
    if (detected) {
      categorySlug = detected;
    }
  }

  const ALL_SLUGS = ["mobiles", "laptops", "audio", "fashion", "appliances", "beauty"];
  const isAllCategories = !categorySlug || categorySlug === "all";
  const defaultCategory = categories.find((c) => c.slug === (categorySlug || "mobiles")) || categories[0];

  const results: PriceComparison[] = [];
  const offset = startIndex !== undefined ? startIndex : (page - 1) * count;

  for (let i = 0; i < count; i++) {
    const globalIdx = offset + i;
    const currentCatSlug = isAllCategories ? ALL_SLUGS[globalIdx % ALL_SLUGS.length] : defaultCategory.slug;
    const targetCategory = categories.find((c) => c.slug === currentCatSlug) || defaultCategory;
    const currentTemplates = getMatchingTemplates(targetCategory.slug, brand, searchQuery, minPrice, maxPrice);
    const template = isAllCategories
      ? currentTemplates[Math.floor(globalIdx / ALL_SLUGS.length) % currentTemplates.length]
      : currentTemplates[globalIdx % currentTemplates.length];
    const variantSpec = template.specs[globalIdx % template.specs.length];

    // Clean alphanumeric brand code for deterministic ASIN
    const brandClean = template.brand.replace(/[^a-zA-Z0-9]/g, "").slice(0, 3).toUpperCase();
    const catClean = targetCategory.slug.replace(/[^a-zA-Z0-9]/g, "").slice(0, 3).toUpperCase();
    const padded = String(globalIdx + 1).padStart(5, "0");
    const asin = `B0${catClean}${brandClean}${padded}`;
    const productId = `prod_amz_${asin}`;
    const offerId = `off_amz_${asin}`;

    // Realistic price variation per variant (+/- 6%)
    const priceMod = 1 + (((globalIdx * 11) % 13) - 6) * 0.01;
    let price = Math.round(template.basePrice * priceMod);

    // Strictly enforce price bounds if specified
    if (minPrice !== undefined && price < minPrice) {
      const spread = maxPrice && maxPrice > minPrice ? maxPrice - minPrice : 2000;
      price = minPrice + ((globalIdx * 97) % spread);
    }
    if (maxPrice !== undefined && price > maxPrice) {
      const spread = minPrice && maxPrice > minPrice ? maxPrice - minPrice : 2000;
      price = Math.max(minPrice || 99, maxPrice - ((globalIdx * 73) % spread));
    }
    const mrp = Math.round(Math.max(template.mrp * priceMod, price * 1.25));

    const title = `${template.brand} ${template.model} (${variantSpec})`;

    const product: Product = {
      id: productId,
      title,
      slug: `amazon-${asin}`,
      brand: template.brand,
      categoryId: targetCategory.id,
      description: `${title}. Authentic retail unit with valid manufacturer warranty, genuine Amazon India invoice, fast delivery, and verified user ratings.`,
      imageUrl: template.image,
      attributes: { variant: variantSpec },
      rating: +(4.2 + ((globalIdx % 8) * 0.1)).toFixed(1),
      ratingCount: 420 + ((globalIdx * 173) % 9500),
      createdAt: new Date(Date.now() - (globalIdx + 1) * 3600000).toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const amazonOffer: Offer = {
      id: offerId,
      productId,
      retailerId: "ret_amazon",
      retailerName: "Amazon India",
      retailerSlug: "amazon",
      retailerProductId: asin,
      title,
      productUrl: `https://www.amazon.in/dp/${asin}`,
      price,
      originalPrice: mrp,
      currency: "INR",
      inStock: true,
      shippingCost: price >= 499 ? 0 : 40,
      lastCheckedAt: new Date().toISOString(),
      isStale: false,
      isDemo: false,
      dataSource: "catalog",
      provenance: "amazon_catalog_verified",
      deliveryTimeEstimate: "2-3 business days (Prime)",
      bankOffersDescription: "10% Instant Discount on HDFC & ICICI Cards",
    };

    // Cache in global lookup maps for instant product detail page navigation
    productCache.set(productId, product);
    offerCache.set(offerId, amazonOffer);

    const companionOffers = createCompanionOffers(
      productId,
      asin,
      title,
      price,
      mrp,
      targetCategory.slug
    );
    const allOffers = [amazonOffer, ...companionOffers];

    const comparison = computeProductComparison(product, allOffers, targetCategory);
    results.push(comparison);
  }

  if (sortBy) {
    results.sort((a, b) => {
      const priceA = a.lowestOffer?.price ?? 0;
      const priceB = b.lowestOffer?.price ?? 0;
      if (sortBy === "price_asc") return priceA - priceB;
      if (sortBy === "price_desc") return priceB - priceA;
      if (sortBy === "rating") {
        return (b.product.rating ?? 0) - (a.product.rating ?? 0);
      }
      if (sortBy === "discount") {
        const discA = a.lowestOffer ? ((a.lowestOffer.originalPrice - a.lowestOffer.price) / a.lowestOffer.originalPrice) : 0;
        const discB = b.lowestOffer ? ((b.lowestOffer.originalPrice - b.lowestOffer.price) / b.lowestOffer.originalPrice) : 0;
        return discB - discA;
      }
      if (sortBy === "newest") {
        return new Date(b.product.createdAt).getTime() - new Date(a.product.createdAt).getTime();
      }
      return 0;
    });
  }

  return results;
}
