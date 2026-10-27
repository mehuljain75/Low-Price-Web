#!/bin/bash
set -e
export HYPERFRAMES_PYTHON=/Users/admin/.hyperframes-venv/bin/python
HF_BIN="/Users/admin/.npm/_npx/702923228c2ce1e6/node_modules/.bin/hyperframes"
DIR="demo-video/composition/assets/vo"
mkdir -p "$DIR"

echo "Act 0 (Hook)..."
$HF_BIN tts "Every Indian online shopper knows the festive season frustration. You jump between Amazon, Flipkart, Myntra, and AJIO, comparing tabs, squinting at fake discounts, and wondering if you are getting ripped off. Between inflated MRPs and hidden bank card offers, the average shopper overpays by thousands of Rupees every year. What if you could see the undisputed lowest price across every store in one place?" --voice am_adam --speed 1.08 --output "$DIR/vo0.wav"

echo "Act 1 (Product Intro)..."
$HF_BIN tts "Welcome to DealFinder India. The smart price comparison engine built specifically for Indian e-commerce. DealFinder tracks, verifies, and compares real prices and active bank discounts across Amazon India, Flipkart, Myntra, AJIO, and Meesho in real time. No marketing gimmicks, no inflated list prices, just pure, verified savings." --voice am_adam --speed 1.08 --output "$DIR/vo1.wav"

echo "Act 2 (Feature 1: Universal Instant Search)..."
$HF_BIN tts "It starts with our lightning fast search engine. Forget opening five different apps. Start typing any smartphone, laptop, or fashion item, and our dual-source search instantly suggests verified models with live price ranges across all platforms. In two seconds, you find the exact variant you want with zero guesswork." --voice am_adam --speed 1.08 --output "$DIR/vo2.wav"

echo "Act 3 (Feature 2: Cross-Store Comparison Matrix)..."
$HF_BIN tts "Once you pick a product, DealFinder reveals the complete multi-store comparison matrix. See live prices from Amazon, Flipkart, Myntra, AJIO, and Meesho side by side, complete with delivery thresholds and stock availability. DealFinder instantly certifies the lowest price among tracked stores, saving you up to four thousand Rupees on a single purchase." --voice am_adam --speed 1.08 --output "$DIR/vo3.wav"

echo "Act 4 (Feature 3: Bank Discount Calculator)..."
$HF_BIN tts "Here is the secret seasoned Indian shoppers know: advertised prices are rarely the final price. DealFinder features a built-in Bank Offer Calculator. Select your credit or debit card, like HDFC, SBI, ICICI, or Axis, and watch the calculator instantly apply active festive discounts, revealing your true checkout price and estimated monthly EMI." --voice am_adam --speed 1.08 --output "$DIR/vo4.wav"

echo "Act 5 (Feature 4: 90-Day Price History & Trend Tracker)..."
$HF_BIN tts "Ever wonder if that festive sale discount is genuine, or if the seller quietly jacked up the price yesterday? DealFinder's ninety-day price history tracker charts the real market trajectory. Our deal verdict engine automatically detects all-time lows and warns you if a discount is fake, giving you total buying confidence." --voice am_adam --speed 1.08 --output "$DIR/vo5.wav"

echo "Act 6 (Feature 5: Dynamic Multi-Filter & Brand Engine)..."
$HF_BIN tts "Shopping on a specific budget? Our responsive multi-filter engine lets you slice thousands of products by category, retailer, brand, and exact Rupee range. Whether you are hunting for Apple MacBooks or Sony headphones under thirty thousand Rupees, find the highest discount offers in seconds." --voice am_adam --speed 1.08 --output "$DIR/vo6.wav"

echo "Act 7 (Feature 6: Today's Deals & Price Drops)..."
$HF_BIN tts "Never miss a flash price drop again. On our Today's Deals dashboard, browse freshly verified price drops filtered by steep discount tiers: twenty, forty, or sixty percent off. From flagship smartphones to home appliances, discover lightning deals the moment they happen." --voice am_adam --speed 1.08 --output "$DIR/vo7.wav"

echo "Act 8 (Feature 7: Festive Sales Calendar & Shopper Playbook)..."
$HF_BIN tts "Preparation wins the festive shopping wars. DealFinder's sales calendar tracks major shopping festivals, like Flipkart Big Billion Days and Amazon Great Indian Festival. Get target discounts, VIP early access dates, and insider checklists so you are always first in line for the biggest price drops." --voice am_adam --speed 1.08 --output "$DIR/vo8.wav"

echo "Act 9 (Grand Outro & Call to Action)..."
$HF_BIN tts "Found an unbeatable deal? Share it directly with family and friends on WhatsApp in one click. Stop overpaying. Stop wasting time across endless tabs. Compare smarter and keep more money in your pocket. Visit dealfinder dot in and start saving today." --voice am_adam --speed 1.08 --output "$DIR/vo9.wav"

echo "VO generation finished successfully!"
ls -lh "$DIR"/*.wav
