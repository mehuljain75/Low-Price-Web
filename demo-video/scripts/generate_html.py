# Generator for DealFinder India 3m 30s Master Showcase
import sys

html_parts = []
def w(s):
    html_parts.append(s)

w("""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>DealFinder India — Smart Price Comparison Engine</title>
  <meta name="viewport" content="width=1920, height=1080">
  <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>
  <style>
    @font-face {
      font-family: 'Plus Jakarta Sans';
      src: url('assets/fonts/plus-jakarta-sans-latin.woff2') format('woff2');
      font-weight: 400 800;
      font-display: swap;
    }
    @font-face {
      font-family: 'JetBrains Mono';
      src: url('assets/fonts/jetbrains-mono-latin.woff2') format('woff2');
      font-weight: 400 700;
      font-display: swap;
    }

    :root {
      --bg-dark: #07090e;
      --panel-dark: #0e131f;
      --saffron: #f97316;
      --saffron-deep: #ea580c;
      --saffron-glow: rgba(249, 115, 22, 0.35);
      --blue: #2563eb;
      --blue-glow: rgba(37, 99, 235, 0.35);
      --emerald: #10b981;
      --emerald-glow: rgba(16, 185, 129, 0.35);
      --rose: #f43f5e;
      --rose-glow: rgba(244, 63, 94, 0.35);
      --amber: #f59e0b;
      --text-main: #f8fafc;
      --text-muted: #94a3b8;
      --border-glass: rgba(255, 255, 255, 0.12);
      --border-glow: rgba(249, 115, 22, 0.3);
      --font-sans: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
      --font-mono: 'JetBrains Mono', monospace;
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      user-select: none;
    }

    body {
      width: 1920px;
      height: 1080px;
      background: var(--bg-dark);
      color: var(--text-main);
      font-family: var(--font-sans);
      overflow: hidden;
      position: relative;
    }

    /* Ambient Tech Gradient Background with Depth */
    #ambient-canvas {
      position: absolute;
      inset: 0;
      pointer-events: none;
      z-index: 1;
      background: 
        radial-gradient(circle at 50% 12%, rgba(234, 88, 12, 0.14), transparent 50%),
        radial-gradient(circle at 85% 85%, rgba(37, 99, 235, 0.12), transparent 45%),
        radial-gradient(circle at 15% 85%, rgba(16, 185, 129, 0.10), transparent 45%),
        linear-gradient(180deg, #05070b 0%, #0a0e17 100%);
    }

    .grid-lines {
      position: absolute;
      inset: 0;
      background-image: 
        linear-gradient(rgba(255, 255, 255, 0.025) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255, 255, 255, 0.025) 1px, transparent 1px);
      background-size: 60px 60px;
      opacity: 0.6;
      pointer-events: none;
      z-index: 2;
    }

    /* Top Executive HUD */
    #top-nav {
      position: absolute;
      top: 24px;
      left: 48px;
      right: 48px;
      height: 52px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      z-index: 100;
      pointer-events: none;
    }

    .brand-cluster {
      display: flex;
      align-items: center;
      gap: 12px;
      background: rgba(14, 19, 31, 0.85);
      border: 1px solid var(--border-glass);
      backdrop-filter: blur(12px);
      padding: 6px 18px 6px 12px;
      border-radius: 9999px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
    }

    .brand-icon {
      width: 32px;
      height: 32px;
      border-radius: 8px;
      background: linear-gradient(135deg, #f97316, #ea580c);
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 0 15px var(--saffron-glow);
    }

    .chapter-indicator {
      display: flex;
      align-items: center;
      gap: 10px;
      background: rgba(14, 19, 31, 0.85);
      border: 1px solid var(--border-glass);
      backdrop-filter: blur(12px);
      padding: 6px 18px;
      border-radius: 9999px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
    }

    .chapter-badge {
      font-family: var(--font-mono);
      font-size: 11px;
      font-weight: 700;
      color: var(--saffron);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .chapter-title {
      font-size: 13px;
      font-weight: 600;
      color: #cbd5e1;
    }

    /* Subtitle Ticker */
    #subtitle-bar {
      position: absolute;
      bottom: 24px;
      left: 0;
      right: 0;
      display: flex;
      justify-content: center;
      z-index: 110;
      pointer-events: none;
    }

    .subtitle-pill {
      background: rgba(10, 14, 23, 0.94);
      border: 1px solid rgba(255, 255, 255, 0.16);
      padding: 10px 28px;
      border-radius: 9999px;
      font-size: 15px;
      font-weight: 600;
      color: #f1f5f9;
      box-shadow: 0 12px 35px rgba(0, 0, 0, 0.7);
      max-width: 1400px;
      text-align: center;
      /* no css transition */
    }

    /* Scene Container */
    .scene-view {
      position: absolute;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      pointer-events: none;
      z-index: 10;
    }

    /* SaaS Browser Window */
    .saas-window {
      background: var(--panel-dark);
      border: 1px solid var(--border-glass);
      border-radius: 16px;
      box-shadow: 0 35px 80px rgba(0, 0, 0, 0.85), 0 0 45px rgba(249, 115, 22, 0.12);
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }

    .window-header {
      height: 42px;
      background: #090d15;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      display: flex;
      align-items: center;
      padding: 0 16px;
      gap: 12px;
    }

    .window-dots {
      display: flex;
      gap: 6px;
    }
    .window-dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
    }
    .dot-close { background: #ef4444; }
    .dot-min { background: #f59e0b; }
    .dot-max { background: #10b981; }

    .window-url-pill {
      flex: 1;
      max-width: 580px;
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 6px;
      padding: 3px 12px;
      font-family: var(--font-mono);
      font-size: 11px;
      color: #94a3b8;
      text-align: center;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
    }

    .window-viewport {
      flex: 1;
      position: relative;
      overflow: hidden;
    }

    /* Dual Feature Pitch Badges (WHAT IT DOES / WHY IT MATTERS) */
    .feature-pitch-bar {
      position: absolute;
      bottom: 84px;
      left: 60px;
      right: 60px;
      display: flex;
      gap: 24px;
      z-index: 60;
    }

    .pitch-card {
      flex: 1;
      background: rgba(14, 19, 31, 0.94);
      border-radius: 16px;
      padding: 16px 22px;
      box-shadow: 0 20px 45px rgba(0, 0, 0, 0.85);
      display: flex;
      align-items: flex-start;
      gap: 14px;
    }

    .pitch-card-what {
      border: 1px solid rgba(56, 189, 248, 0.3);
      border-left: 4px solid #38bdf8;
    }

    .pitch-card-why {
      border: 1px solid rgba(249, 115, 22, 0.35);
      border-left: 4px solid #ea580c;
    }

    .pitch-icon {
      width: 32px;
      height: 32px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      font-weight: 800;
      font-size: 14px;
    }

    .pitch-icon-what {
      background: rgba(56, 189, 248, 0.15);
      color: #38bdf8;
    }

    .pitch-icon-why {
      background: rgba(249, 115, 22, 0.15);
      color: #ea580c;
    }

    .pitch-label {
      font-family: var(--font-mono);
      font-size: 11px;
      font-weight: 800;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      margin-bottom: 2px;
    }

    .pitch-label-what { color: #38bdf8; }
    .pitch-label-why { color: #ea580c; }

    .pitch-text {
      font-size: 13px;
      color: #cbd5e1;
      line-height: 1.4;
    }
    .pitch-text strong {
      color: #ffffff;
      font-weight: 700;
    }

    /* Spline Interactive Mouse Pointer */
    #interactive-cursor {
      position: absolute;
      top: 0;
      left: 0;
      width: 28px;
      height: 28px;
      z-index: 150;
      pointer-events: none;
      opacity: 0;
      
      filter: drop-shadow(0 4px 10px rgba(0, 0, 0, 0.8));
    }

    .cursor-ripple {
      position: absolute;
      top: 50%;
      left: 50%;
      width: 44px;
      height: 44px;
      border-radius: 50%;
      border: 2px solid var(--saffron);
      transform: translate(-50%, -50%) scale(0);
      opacity: 0;
      pointer-events: none;
    }

    /* Transition Bumpers */
    .act-bumper {
      position: absolute;
      inset: 0;
      background: radial-gradient(circle, rgba(234, 88, 12, 0.3) 0%, rgba(5, 7, 11, 0.95) 75%);
      z-index: 95;
      opacity: 0;
      pointer-events: none;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .bumper-text {
      font-size: 36px;
      font-weight: 800;
      letter-spacing: -0.02em;
      color: #ffffff;
      text-shadow: 0 0 30px var(--saffron-glow);
    }
  </style>
</head>
<body data-composition-id="dealfinder-showcase" data-width="1920" data-height="1080" data-duration="210.0" data-fps="30">
  <div id="ambient-canvas"></div>
  <div class="grid-lines"></div>

  <!-- Top Executive HUD -->
  <div id="top-nav">
    <div class="brand-cluster">
      <div class="brand-icon">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z"></path>
          <path d="M7 7h.01"></path>
        </svg>
      </div>
      <span style="font-weight:800; font-size:16px; letter-spacing:-0.01em;">DealFinder <span style="color:#f97316;">IN</span> 🇮🇳</span>
      <span style="font-size:11px; background:rgba(234,88,12,0.2); border:1px solid rgba(234,88,12,0.4); color:#ea580c; padding:2px 8px; border-radius:12px; font-weight:700;">LIVE ENGINE</span>
    </div>

    <div class="chapter-indicator">
      <span id="chapter-badge" class="chapter-badge">THE HOOK</span>
      <span style="color:rgba(255,255,255,0.2)">/</span>
      <span id="chapter-title" class="chapter-title">The ₹15,000 Festive Blind Spot</span>
    </div>
  </div>

  <!-- Subtitle Bar -->
  <div id="subtitle-bar">
    <div id="subtitle-text" class="subtitle-pill">
      Every Indian online shopper knows the festive season frustration.
    </div>
  </div>

  <!-- Interactive Pointer -->
  <div id="interactive-cursor">
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M4 3L11.5 21L14.5 13.5L22 10.5L4 3Z" fill="#ffffff" stroke="#000000" stroke-width="1.8" stroke-linejoin="round"/>
    </svg>
    <div id="cursor-click-ring" class="cursor-ripple"></div>
  </div>
""")

# ==========================================
# ACT 0: THE HOOK (0.5s - 23.5s)
# ==========================================
w("""
  <!-- ACT 0: THE HOOK -->
  <div id="scene-0" class="scene-view" style="opacity: 1; flex-direction:column; gap:28px;">
    <div style="display:flex; align-items:center; gap:8px; background:rgba(239,68,68,0.15); border:1px solid rgba(239,68,68,0.3); padding:6px 16px; border-radius:9999px;">
      <span style="width:8px; height:8px; border-radius:50%; background:#ef4444; box-shadow:0 0 10px #ef4444;"></span>
      <span style="font-size:12px; font-weight:800; color:#f87171; letter-spacing:0.05em; text-transform:uppercase;">The Hidden Shopper Tax</span>
    </div>

    <h1 style="font-size:56px; font-weight:900; letter-spacing:-0.03em; text-align:center; max-width:1100px; line-height:1.15;">
      Overpaying by <span style="color:#ef4444; text-shadow:0 0 25px rgba(239,68,68,0.5);">Thousands of Rupees</span> Across Confusing Store Tabs?
    </h1>

    <!-- Floating Confusion Cards -->
    <div style="position:relative; width:1100px; height:320px; display:flex; align-items:center; justify-content:center;">
      <!-- Loss Ticker -->
      <div id="hook-loss-ticker" style="background:rgba(14,19,31,0.9); border:2px solid rgba(239,68,68,0.5); padding:28px 48px; border-radius:24px; box-shadow:0 25px 60px rgba(0,0,0,0.8), 0 0 40px rgba(239,68,68,0.25); text-align:center; z-index:10;">
        <div style="font-family:var(--font-mono); font-size:13px; color:#94a3b8; font-weight:700; text-transform:uppercase; letter-spacing:0.1em; margin-bottom:6px;">Average Festive Season Loss</div>
        <div id="hook-loss-val" style="font-size:68px; font-weight:900; color:#ef4444; font-family:var(--font-mono); letter-spacing:-0.02em;">-₹14,850</div>
        <div style="font-size:14px; color:#cbd5e1; font-weight:600; margin-top:4px;">Lost in fake discounts, inflated MRPs & missed bank offers</div>
      </div>

      <!-- Pill 1: Amazon -->
      <div class="hook-pill" style="position:absolute; top:20px; left:40px; background:rgba(255,153,0,0.12); border:1px solid rgba(255,153,0,0.4); padding:10px 20px; border-radius:12px; font-size:14px; font-weight:700; color:#ff9900; box-shadow:0 10px 25px rgba(0,0,0,0.4);">
        Amazon: ₹69,999 (MRP ₹79,900)
      </div>

      <!-- Pill 2: Flipkart -->
      <div class="hook-pill" style="position:absolute; bottom:20px; left:60px; background:rgba(40,116,240,0.12); border:1px solid rgba(40,116,240,0.4); padding:10px 20px; border-radius:12px; font-size:14px; font-weight:700; color:#60a5fa; box-shadow:0 10px 25px rgba(0,0,0,0.4);">
        Flipkart: ₹65,999 (Sale Price)
      </div>

      <!-- Pill 3: Myntra -->
      <div class="hook-pill" style="position:absolute; top:30px; right:40px; background:rgba(255,63,108,0.12); border:1px solid rgba(255,63,108,0.4); padding:10px 20px; border-radius:12px; font-size:14px; font-weight:700; color:#f472b6; box-shadow:0 10px 25px rgba(0,0,0,0.4);">
        Myntra: ₹67,490 (Discount Applied)
      </div>

      <!-- Pill 4: Frustration Pill -->
      <div class="hook-pill" style="position:absolute; bottom:25px; right:70px; background:rgba(244,63,94,0.15); border:1px solid rgba(244,63,94,0.4); padding:10px 20px; border-radius:12px; font-size:14px; font-weight:700; color:#fb7185; box-shadow:0 10px 25px rgba(0,0,0,0.4);">
        ⚠️ Fake Inflated MRP Trick!
      </div>
    </div>
  </div>
""")

# ==========================================
# ACT 1: PRODUCT INTRO — DEALFINDER INDIA (24.0s - 44.5s)
# ==========================================
w("""
  <!-- ACT 1: PRODUCT REVEAL -->
  <div id="scene-1" class="scene-view">
    <div class="saas-window" style="width:1380px; height:740px;">
      <div class="window-header">
        <div class="window-dots">
          <div class="window-dot dot-close"></div>
          <div class="window-dot dot-min"></div>
          <div class="window-dot dot-max"></div>
        </div>
        <div class="window-url-pill">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          <span>https://dealfinder.in</span>
        </div>
        <div style="font-size:11px; font-weight:700; color:#10b981; background:rgba(16,185,129,0.15); padding:2px 8px; border-radius:10px;">SECURE 256-BIT</div>
      </div>

      <div class="window-viewport" style="background:#090e17; padding:32px 48px; display:flex; flex-direction:column; justify-content:space-between;">
        <!-- Top Banner in App -->
        <div style="background:rgba(234,88,12,0.12); border:1px solid rgba(234,88,12,0.3); padding:8px 20px; border-radius:9999px; display:flex; align-items:center; justify-content:space-between;">
          <span style="font-size:12px; font-weight:700; color:#ea580c; display:flex; align-items:center; gap:8px;">
            <span style="background:#ea580c; color:#fff; font-size:9px; font-weight:800; padding:2px 6px; border-radius:4px;">FESTIVE 2026</span>
            Tracking live price drops across Amazon, Flipkart, Myntra, AJIO & Meesho in Real-time.
          </span>
          <span style="font-size:11px; color:#ea580c; font-weight:700;">Live Feed Active ●</span>
        </div>

        <!-- Main Title & Intro Copy -->
        <div style="text-align:center; margin-top:20px;">
          <div style="display:inline-flex; align-items:center; gap:6px; background:rgba(249,115,22,0.15); border:1px solid rgba(249,115,22,0.3); padding:4px 14px; border-radius:9999px; font-size:12px; font-weight:700; color:#f97316; margin-bottom:12px;">
            <span>✨ Smart Indian Price Comparison Engine</span>
          </div>
          <h2 style="font-size:46px; font-weight:900; letter-spacing:-0.03em; max-width:980px; margin:0 auto; line-height:1.2;">
            Stop Overpaying. Compare Real Prices Across <span style="background:linear-gradient(90deg, #f97316, #ea580c, #38bdf8); -webkit-background-clip:text; -webkit-text-fill-color:transparent;">India's Top Stores.</span>
          </h2>
          <p style="font-size:16px; color:#94a3b8; max-width:720px; margin:12px auto 0; line-height:1.5;">
            Instantly compare live and verified offers across Amazon India, Flipkart, Myntra, AJIO, and Meesho. Never miss genuine price drops or bank card discounts.
          </p>
        </div>

        <!-- 5 Tracked Store Cards Floating in Grid -->
        <div style="display:grid; grid-template-columns:repeat(5, 1fr); gap:16px; margin:24px 0;">
          <div class="store-badge-card" style="background:#111726; border:1px solid rgba(255,153,0,0.3); border-radius:14px; padding:16px; text-align:center; box-shadow:0 10px 25px rgba(0,0,0,0.5);">
            <div style="width:40px; height:40px; border-radius:10px; background:rgba(255,153,0,0.2); margin:0 auto 10px; display:flex; align-items:center; justify-content:center; color:#ff9900; font-weight:800; font-size:18px;">amz</div>
            <div style="font-weight:700; font-size:14px;">Amazon India</div>
            <div style="font-size:11px; color:#10b981; font-weight:600; margin-top:2px;">Live PA-API ●</div>
          </div>

          <div class="store-badge-card" style="background:#111726; border:1px solid rgba(40,116,240,0.3); border-radius:14px; padding:16px; text-align:center; box-shadow:0 10px 25px rgba(0,0,0,0.5);">
            <div style="width:40px; height:40px; border-radius:10px; background:rgba(40,116,240,0.2); margin:0 auto 10px; display:flex; align-items:center; justify-content:center; color:#60a5fa; font-weight:800; font-size:18px;">fk</div>
            <div style="font-weight:700; font-size:14px;">Flipkart</div>
            <div style="font-size:11px; color:#10b981; font-weight:600; margin-top:2px;">Live Verified ●</div>
          </div>

          <div class="store-badge-card" style="background:#111726; border:1px solid rgba(255,63,108,0.3); border-radius:14px; padding:16px; text-align:center; box-shadow:0 10px 25px rgba(0,0,0,0.5);">
            <div style="width:40px; height:40px; border-radius:10px; background:rgba(255,63,108,0.2); margin:0 auto 10px; display:flex; align-items:center; justify-content:center; color:#f472b6; font-weight:800; font-size:18px;">my</div>
            <div style="font-weight:700; font-size:14px;">Myntra</div>
            <div style="font-size:11px; color:#10b981; font-weight:600; margin-top:2px;">Fashion Aggregator ●</div>
          </div>

          <div class="store-badge-card" style="background:#111726; border:1px solid rgba(148,163,184,0.3); border-radius:14px; padding:16px; text-align:center; box-shadow:0 10px 25px rgba(0,0,0,0.5);">
            <div style="width:40px; height:40px; border-radius:10px; background:rgba(148,163,184,0.2); margin:0 auto 10px; display:flex; align-items:center; justify-content:center; color:#cbd5e1; font-weight:800; font-size:18px;">aj</div>
            <div style="font-weight:700; font-size:14px;">AJIO</div>
            <div style="font-size:11px; color:#10b981; font-weight:600; margin-top:2px;">Trends Partner ●</div>
          </div>

          <div class="store-badge-card" style="background:#111726; border:1px solid rgba(244,51,151,0.3); border-radius:14px; padding:16px; text-align:center; box-shadow:0 10px 25px rgba(0,0,0,0.5);">
            <div style="width:40px; height:40px; border-radius:10px; background:rgba(244,51,151,0.2); margin:0 auto 10px; display:flex; align-items:center; justify-content:center; color:#f472b6; font-weight:800; font-size:18px;">ms</div>
            <div style="font-weight:700; font-size:14px;">Meesho</div>
            <div style="font-size:11px; color:#10b981; font-weight:600; margin-top:2px;">Budget Direct ●</div>
          </div>
        </div>

        <div style="background:#111726; border-radius:12px; padding:12px 20px; display:flex; align-items:center; justify-content:space-around; font-size:13px; color:#94a3b8;">
          <span>⚡ <strong>32,000+</strong> Tracked Electronics</span>
          <span>•</span>
          <span>🛡️ <strong>100%</strong> Zero Inflated MRP Guarantee</span>
          <span>•</span>
          <span>💳 <strong>6 Major</strong> Indian Bank Cards Integrated</span>
        </div>
      </div>
    </div>

    <!-- Pitch Bar for Act 1 -->
    <div id="pitch-bar-scene1" class="feature-pitch-bar">
      <div class="pitch-card pitch-card-what">
        <div class="pitch-icon pitch-icon-what">01</div>
        <div>
          <div class="pitch-label pitch-label-what">WHAT IT DOES</div>
          <div class="pitch-text"><strong>Multi-Store Unified Catalog</strong> — Continuously ingests, verifies, and indexes real prices across Amazon, Flipkart, Myntra, AJIO, and Meesho.</div>
        </div>
      </div>
      <div class="pitch-card pitch-card-why">
        <div class="pitch-icon pitch-icon-why">★</div>
        <div>
          <div class="pitch-label pitch-label-why">WHY IT MATTERS</div>
          <div class="pitch-text"><strong>Total Market Transparency</strong> — Eliminates fake sale claims, reveals true merchant stock, and guarantees you never overpay a single Rupee.</div>
        </div>
      </div>
    </div>
  </div>
""")

# ==========================================
# ACT 2: FEATURE 1 — UNIVERSAL INSTANT SEARCH (45.0s - 64.0s)
# ==========================================
w("""
  <!-- ACT 2: FEATURE 1 SEARCH -->
  <div id="scene-2" class="scene-view">
    <div class="saas-window" style="width:1380px; height:740px;">
      <div class="window-header">
        <div class="window-dots">
          <div class="window-dot dot-close"></div>
          <div class="window-dot dot-min"></div>
          <div class="window-dot dot-max"></div>
        </div>
        <div class="window-url-pill">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          <span>https://dealfinder.in/search</span>
        </div>
      </div>

      <div class="window-viewport" style="background:#090e17; padding:48px 60px; display:flex; flex-direction:column; align-items:center;">
        <div style="font-size:12px; font-weight:800; color:#f97316; letter-spacing:0.1em; text-transform:uppercase; margin-bottom:8px;">Dual-Engine Typeahead</div>
        <h3 style="font-size:36px; font-weight:900; letter-spacing:-0.02em; margin-bottom:24px; text-align:center;">Instant Multi-Store Search</h3>

        <!-- Search Input Box -->
        <div style="position:relative; width:860px;">
          <div id="search-input-box" style="width:100%; height:64px; background:#111726; border:2px solid rgba(249,115,22,0.3); border-radius:18px; display:flex; align-items:center; padding:0 24px; gap:16px; box-shadow:0 15px 35px rgba(0,0,0,0.6);">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f97316" stroke-width="2.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            <span id="search-typing-text" style="font-size:20px; font-weight:600; color:#f8fafc; font-family:var(--font-sans);"></span>
            <span id="search-blinking-cursor" style="width:2px; height:24px; background:#f97316; display:inline-block;"></span>
          </div>

          <!-- Autocomplete Dropdown Menu -->
          <div id="search-dropdown-menu" style="position:absolute; top:74px; left:0; right:0; background:#111726; border:1px solid rgba(255,255,255,0.12); border-radius:18px; padding:12px; box-shadow:0 25px 60px rgba(0,0,0,0.85); opacity:0;  z-index:30;">
            <!-- Option 1: Selected -->
            <div id="search-opt-1" style="display:flex; align-items:center; justify-content:space-between; padding:14px 20px; border-radius:12px; background:rgba(249,115,22,0.15); border:1px solid rgba(249,115,22,0.4);">
              <div style="display:flex; align-items:center; gap:16px;">
                <div style="width:44px; height:44px; border-radius:10px; background:#1e293b; display:flex; align-items:center; justify-content:center; color:#f97316;">📱</div>
                <div>
                  <div style="font-weight:800; font-size:16px; color:#ffffff;">Apple iPhone 15 (128GB, Black)</div>
                  <div style="font-size:12px; color:#94a3b8;">5 Tracked Stores · Mobiles Category</div>
                </div>
              </div>
              <div style="text-align:right;">
                <div style="font-family:var(--font-mono); font-size:16px; font-weight:800; color:#10b981;">₹65,999 - ₹69,999</div>
                <div style="font-size:11px; color:#f97316; font-weight:700;">Save up to ₹13,901 (17%)</div>
              </div>
            </div>

            <!-- Option 2 -->
            <div style="display:flex; align-items:center; justify-content:space-between; padding:12px 20px; border-radius:12px; margin-top:4px;">
              <div style="display:flex; align-items:center; gap:16px;">
                <div style="width:44px; height:44px; border-radius:10px; background:#1e293b; display:flex; align-items:center; justify-content:center; color:#94a3b8;">📱</div>
                <div>
                  <div style="font-weight:700; font-size:15px; color:#cbd5e1;">Apple iPhone 15 Pro (128GB, Natural Titanium)</div>
                  <div style="font-size:12px; color:#64748b;">4 Tracked Stores · High Demand</div>
                </div>
              </div>
              <div style="text-align:right;">
                <div style="font-family:var(--font-mono); font-size:15px; font-weight:700; color:#cbd5e1;">₹1,27,990</div>
                <div style="font-size:11px; color:#94a3b8;">MRP ₹1,34,900</div>
              </div>
            </div>

            <!-- Option 3 -->
            <div style="display:flex; align-items:center; justify-content:space-between; padding:12px 20px; border-radius:12px; margin-top:4px;">
              <div style="display:flex; align-items:center; gap:16px;">
                <div style="width:44px; height:44px; border-radius:10px; background:#1e293b; display:flex; align-items:center; justify-content:center; color:#94a3b8;">📱</div>
                <div>
                  <div style="font-weight:700; font-size:15px; color:#cbd5e1;">Apple iPhone 15 Plus (128GB, Blue)</div>
                  <div style="font-size:12px; color:#64748b;">5 Tracked Stores</div>
                </div>
              </div>
              <div style="text-align:right;">
                <div style="font-family:var(--font-mono); font-size:15px; font-weight:700; color:#cbd5e1;">₹79,990</div>
                <div style="font-size:11px; color:#94a3b8;">MRP ₹89,900</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Pitch Bar for Act 2 -->
    <div id="pitch-bar-scene2" class="feature-pitch-bar">
      <div class="pitch-card pitch-card-what">
        <div class="pitch-icon pitch-icon-what">02</div>
        <div>
          <div class="pitch-label pitch-label-what">WHAT IT DOES</div>
          <div class="pitch-text"><strong>Instant Autocomplete Typeahead</strong> — Blends local catalog caching with live store search to show real variant prices as you type.</div>
        </div>
      </div>
      <div class="pitch-card pitch-card-why">
        <div class="pitch-icon pitch-icon-why">★</div>
        <div>
          <div class="pitch-label pitch-label-why">WHY IT MATTERS</div>
          <div class="pitch-text"><strong>Saves 20 Minutes per Search</strong> — Find the exact variant and its full cross-store price spectrum in under two seconds with zero tab-switching.</div>
        </div>
      </div>
    </div>
  </div>
""")

# ==========================================
# ACT 3: FEATURE 2 — CROSS-STORE COMPARISON MATRIX (64.5s - 85.5s)
# ==========================================
w("""
  <!-- ACT 3: FEATURE 2 COMPARISON MATRIX -->
  <div id="scene-3" class="scene-view">
    <div class="saas-window" style="width:1380px; height:740px;">
      <div class="window-header">
        <div class="window-dots">
          <div class="window-dot dot-close"></div>
          <div class="window-dot dot-min"></div>
          <div class="window-dot dot-max"></div>
        </div>
        <div class="window-url-pill">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          <span>https://dealfinder.in/products/p_iphone15_128</span>
        </div>
      </div>

      <div class="window-viewport" style="background:#090e17; padding:28px 48px; display:flex; flex-direction:column; gap:20px;">
        <!-- Product Header Bar -->
        <div style="display:flex; align-items:center; justify-content:space-between; background:#111726; border:1px solid var(--border-glass); border-radius:16px; padding:18px 24px;">
          <div style="display:flex; align-items:center; gap:20px;">
            <div style="width:52px; height:52px; border-radius:12px; background:linear-gradient(135deg, #1e293b, #0f172a); border:1px solid rgba(255,255,255,0.1); display:flex; align-items:center; justify-content:center; font-size:24px;">📱</div>
            <div>
              <div style="display:flex; align-items:center; gap:10px;">
                <h3 style="font-size:22px; font-weight:800; color:#ffffff;">Apple iPhone 15 (128GB, Black)</h3>
                <span style="font-size:11px; font-weight:700; background:rgba(37,99,235,0.2); color:#60a5fa; border:1px solid rgba(37,99,235,0.4); padding:2px 8px; border-radius:8px;">VERIFIED SPECS</span>
              </div>
              <div style="font-size:13px; color:#94a3b8; margin-top:2px;">128GB Storage · A16 Bionic · 48MP Main Camera · USB-C · Official MRP ₹79,900</div>
            </div>
          </div>

          <div style="text-align:right;">
            <div style="font-size:11px; font-weight:700; color:#94a3b8; text-transform:uppercase;">Lowest Available Price</div>
            <div style="font-family:var(--font-mono); font-size:28px; font-weight:900; color:#10b981;">₹65,999</div>
          </div>
        </div>

        <!-- Multi-Store Comparison Rows -->
        <div style="display:flex; flex-direction:column; gap:10px;">
          <!-- Store 1: Flipkart (Lowest) -->
          <div id="row-flipkart" style="display:flex; align-items:center; justify-content:space-between; background:rgba(16,185,129,0.08); border:2px solid #10b981; border-radius:14px; padding:14px 24px; box-shadow:0 0 30px var(--emerald-glow);">
            <div style="display:flex; align-items:center; gap:18px;">
              <div style="width:42px; height:42px; border-radius:10px; background:#2874f0; display:flex; align-items:center; justify-content:center; font-weight:800; font-size:15px; color:#ffffff;">FK</div>
              <div>
                <div style="display:flex; align-items:center; gap:10px;">
                  <span style="font-weight:800; font-size:16px; color:#ffffff;">Flipkart</span>
                  <span style="background:#10b981; color:#06281f; font-size:10px; font-weight:900; padding:3px 8px; border-radius:20px; letter-spacing:0.05em; text-transform:uppercase;">LOWEST AMONG TRACKED STORES ✓</span>
                  <span style="color:#10b981; font-size:12px; font-weight:700;">In Stock</span>
                </div>
                <div style="font-size:12px; color:#94a3b8; margin-top:2px;">Free Delivery · Fast Dispatch · Bank Offers Available</div>
              </div>
            </div>
            <div style="display:flex; align-items:center; gap:24px;">
              <div style="text-align:right;">
                <div style="font-family:var(--font-mono); font-size:22px; font-weight:900; color:#10b981;">₹65,999</div>
                <div style="font-size:11px; color:#94a3b8; text-decoration:line-through;">MRP ₹79,900</div>
              </div>
              <button style="background:#10b981; color:#06281f; font-weight:800; font-size:13px; border:none; padding:10px 18px; border-radius:10px; cursor:pointer;">Go to Deal &rarr;</button>
            </div>
          </div>

          <!-- Store 2: Amazon -->
          <div id="row-amazon" style="display:flex; align-items:center; justify-content:space-between; background:#111726; border:1px solid var(--border-glass); border-radius:14px; padding:14px 24px;">
            <div style="display:flex; align-items:center; gap:18px;">
              <div style="width:42px; height:42px; border-radius:10px; background:#ff9900; display:flex; align-items:center; justify-content:center; font-weight:800; font-size:14px; color:#000000;">AMZ</div>
              <div>
                <div style="display:flex; align-items:center; gap:10px;">
                  <span style="font-weight:700; font-size:16px; color:#ffffff;">Amazon India</span>
                  <span style="color:#10b981; font-size:12px; font-weight:700;">In Stock</span>
                  <span style="font-size:11px; color:#ef4444; font-weight:700;">+₹4,000 More</span>
                </div>
                <div style="font-size:12px; color:#94a3b8; margin-top:2px;">Prime One-Day Free Delivery</div>
              </div>
            </div>
            <div style="display:flex; align-items:center; gap:24px;">
              <div style="text-align:right;">
                <div style="font-family:var(--font-mono); font-size:20px; font-weight:800; color:#cbd5e1;">₹69,999</div>
                <div style="font-size:11px; color:#94a3b8; text-decoration:line-through;">MRP ₹79,900</div>
              </div>
              <button style="background:rgba(255,255,255,0.08); color:#cbd5e1; font-weight:700; font-size:13px; border:1px solid rgba(255,255,255,0.15); padding:10px 18px; border-radius:10px;">View Store &rarr;</button>
            </div>
          </div>

          <!-- Store 3: Myntra -->
          <div style="display:flex; align-items:center; justify-content:space-between; background:#111726; border:1px solid var(--border-glass); border-radius:14px; padding:14px 24px;">
            <div style="display:flex; align-items:center; gap:18px;">
              <div style="width:42px; height:42px; border-radius:10px; background:#ff3f6c; display:flex; align-items:center; justify-content:center; font-weight:800; font-size:14px; color:#ffffff;">MYN</div>
              <div>
                <div style="display:flex; align-items:center; gap:10px;">
                  <span style="font-weight:700; font-size:16px; color:#ffffff;">Myntra</span>
                  <span style="color:#10b981; font-size:12px; font-weight:700;">In Stock</span>
                  <span style="font-size:11px; color:#ef4444; font-weight:700;">+₹1,491 More</span>
                </div>
                <div style="font-size:12px; color:#94a3b8; margin-top:2px;">Festive Fashion Special</div>
              </div>
            </div>
            <div style="display:flex; align-items:center; gap:24px;">
              <div style="text-align:right;">
                <div style="font-family:var(--font-mono); font-size:20px; font-weight:800; color:#cbd5e1;">₹67,490</div>
                <div style="font-size:11px; color:#94a3b8; text-decoration:line-through;">MRP ₹79,900</div>
              </div>
              <button style="background:rgba(255,255,255,0.08); color:#cbd5e1; font-weight:700; font-size:13px; border:1px solid rgba(255,255,255,0.15); padding:10px 18px; border-radius:10px;">View Store &rarr;</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Pitch Bar for Act 3 -->
    <div id="pitch-bar-scene3" class="feature-pitch-bar">
      <div class="pitch-card pitch-card-what">
        <div class="pitch-icon pitch-icon-what">03</div>
        <div>
          <div class="pitch-label pitch-label-what">WHAT IT DOES</div>
          <div class="pitch-text"><strong>Side-by-Side Comparison Matrix</strong> — Compares live merchant listings, estimated delivery fees, and stock status side by side.</div>
        </div>
      </div>
      <div class="pitch-card pitch-card-why">
        <div class="pitch-icon pitch-icon-why">★</div>
        <div>
          <div class="pitch-label pitch-label-why">WHY IT MATTERS</div>
          <div class="pitch-text"><strong>Certifies Genuine Low Price</strong> — Saves ₹4,000 on this phone alone by revealing that Flipkart is currently cheaper than Amazon.</div>
        </div>
      </div>
    </div>
  </div>
""")

# ==========================================
# ACT 4: FEATURE 3 — BANK DISCOUNT CALCULATOR (86.0s - 107.5s)
# ==========================================
w("""
  <!-- ACT 4: FEATURE 3 BANK CALCULATOR -->
  <div id="scene-4" class="scene-view">
    <div class="saas-window" style="width:1380px; height:740px;">
      <div class="window-header">
        <div class="window-dots">
          <div class="window-dot dot-close"></div>
          <div class="window-dot dot-min"></div>
          <div class="window-dot dot-max"></div>
        </div>
        <div class="window-url-pill">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          <span>https://dealfinder.in/products/p_iphone15_128#bank-calculator</span>
        </div>
      </div>

      <div class="window-viewport" style="background:#090e17; padding:32px 56px; display:flex; flex-direction:column; gap:24px;">
        <div style="display:flex; align-items:center; justify-content:space-between;">
          <div>
            <div style="display:flex; align-items:center; gap:8px;">
              <span style="font-size:24px;">💳</span>
              <h3 style="font-size:28px; font-weight:900; letter-spacing:-0.02em;">Bank & Payment Discount Calculator</h3>
            </div>
            <p style="font-size:14px; color:#94a3b8; margin-top:2px;">Select your credit or debit card to reveal your true checkout price</p>
          </div>
          <span style="font-size:12px; font-weight:700; background:rgba(37,99,235,0.15); border:1px solid rgba(37,99,235,0.4); color:#60a5fa; padding:4px 14px; border-radius:9999px;">ACTIVE FESTIVE OFFERS ✨</span>
        </div>

        <!-- Bank Card Selection Pills -->
        <div style="display:grid; grid-template-columns:repeat(6, 1fr); gap:12px;">
          <!-- Card 1: HDFC (Active) -->
          <div id="card-btn-hdfc" style="background:#2563eb; border:2px solid #3b82f6; border-radius:14px; padding:14px; text-align:left; box-shadow:0 10px 25px rgba(37,99,235,0.4); cursor:pointer;">
            <div style="font-size:10px; font-weight:800; background:rgba(255,255,255,0.2); padding:2px 6px; border-radius:4px; display:inline-block; margin-bottom:8px;">10% INSTANT</div>
            <div style="font-weight:800; font-size:15px; color:#ffffff;">HDFC Bank</div>
            <div style="font-size:11px; color:#dbeafe; margin-top:2px;">Max ₹1,500 Off</div>
          </div>

          <!-- Card 2: SBI -->
          <div id="card-btn-sbi" style="background:#111726; border:1px solid var(--border-glass); border-radius:14px; padding:14px; text-align:left; cursor:pointer;">
            <div style="font-size:10px; font-weight:800; background:rgba(255,255,255,0.06); color:#94a3b8; padding:2px 6px; border-radius:4px; display:inline-block; margin-bottom:8px;">10% INSTANT</div>
            <div style="font-weight:700; font-size:15px; color:#ffffff;">SBI Card</div>
            <div style="font-size:11px; color:#94a3b8; margin-top:2px;">Max ₹1,750 Off</div>
          </div>

          <!-- Card 3: ICICI -->
          <div id="card-btn-icici" style="background:#111726; border:1px solid var(--border-glass); border-radius:14px; padding:14px; text-align:left;">
            <div style="font-size:10px; font-weight:800; background:rgba(255,255,255,0.06); color:#94a3b8; padding:2px 6px; border-radius:4px; display:inline-block; margin-bottom:8px;">10% INSTANT</div>
            <div style="font-weight:700; font-size:15px; color:#ffffff;">ICICI Bank</div>
            <div style="font-size:11px; color:#94a3b8; margin-top:2px;">Max ₹1,250 Off</div>
          </div>

          <!-- Card 4: Amazon Pay ICICI -->
          <div style="background:#111726; border:1px solid var(--border-glass); border-radius:14px; padding:14px; text-align:left;">
            <div style="font-size:10px; font-weight:800; background:rgba(255,255,255,0.06); color:#94a3b8; padding:2px 6px; border-radius:4px; display:inline-block; margin-bottom:8px;">5% UNLIMITED</div>
            <div style="font-weight:700; font-size:15px; color:#ffffff;">Amazon ICICI</div>
            <div style="font-size:11px; color:#94a3b8; margin-top:2px;">Unlimited 5%</div>
          </div>

          <!-- Card 5: Axis -->
          <div style="background:#111726; border:1px solid var(--border-glass); border-radius:14px; padding:14px; text-align:left;">
            <div style="font-size:10px; font-weight:800; background:rgba(255,255,255,0.06); color:#94a3b8; padding:2px 6px; border-radius:4px; display:inline-block; margin-bottom:8px;">10% INSTANT</div>
            <div style="font-weight:700; font-size:15px; color:#ffffff;">Axis Bank</div>
            <div style="font-size:11px; color:#94a3b8; margin-top:2px;">Max ₹1,000 Off</div>
          </div>

          <!-- Card 6: OneCard -->
          <div style="background:#111726; border:1px solid var(--border-glass); border-radius:14px; padding:14px; text-align:left;">
            <div style="font-size:10px; font-weight:800; background:rgba(255,255,255,0.06); color:#94a3b8; padding:2px 6px; border-radius:4px; display:inline-block; margin-bottom:8px;">FLAT ₹1,000</div>
            <div style="font-weight:700; font-size:15px; color:#ffffff;">OneCard</div>
            <div style="font-size:11px; color:#94a3b8; margin-top:2px;">Min ₹8,000</div>
          </div>
        </div>

        <!-- Calculated Outcome Panel -->
        <div id="bank-result-panel" style="background:linear-gradient(135deg, rgba(37,99,235,0.1), rgba(16,185,129,0.1)); border:2px solid #3b82f6; border-radius:18px; padding:24px 32px; display:flex; align-items:center; justify-content:space-between;">
          <div>
            <div style="font-size:12px; font-weight:800; color:#60a5fa; text-transform:uppercase; letter-spacing:0.05em;">Selected: HDFC Bank Credit Card (Flipkart)</div>
            <div style="font-size:18px; font-weight:700; color:#ffffff; margin-top:4px;">10% Instant Discount Applied (-₹1,500)</div>
            <div style="font-size:13px; color:#94a3b8; margin-top:4px;">Eligible for No-Cost EMI: <strong>₹10,750 / month</strong> (6 Months)</div>
          </div>

          <div style="display:flex; align-items:center; gap:32px;">
            <div style="text-align:right;">
              <div style="font-size:12px; color:#94a3b8;">Base Price: <span style="text-decoration:line-through;">₹65,999</span></div>
              <div id="bank-effective-price" style="font-family:var(--font-mono); font-size:38px; font-weight:900; color:#10b981;">₹64,499</div>
              <div style="font-size:11px; font-weight:700; color:#10b981;">Total Savings: ₹15,401 (19% off MRP)</div>
            </div>
            <button style="background:#2563eb; color:#ffffff; font-weight:800; font-size:14px; border:none; padding:14px 24px; border-radius:12px; box-shadow:0 10px 25px rgba(37,99,235,0.4); cursor:pointer;">
              Claim Deal at ₹64,499 &rarr;
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Pitch Bar for Act 4 -->
    <div id="pitch-bar-scene4" class="feature-pitch-bar">
      <div class="pitch-card pitch-card-what">
        <div class="pitch-icon pitch-icon-what">04</div>
        <div>
          <div class="pitch-label pitch-label-what">WHAT IT DOES</div>
          <div class="pitch-text"><strong>Automated Card Discount Logic</strong> — Calculates card-specific percentage discounts, maximum caps, and minimum purchase rules in real time.</div>
        </div>
      </div>
      <div class="pitch-card pitch-card-why">
        <div class="pitch-icon pitch-icon-why">★</div>
        <div>
          <div class="pitch-label pitch-label-why">WHY IT MATTERS</div>
          <div class="pitch-text"><strong>Unlocks Hidden ₹1,500 Savings</strong> — Shows your true checkout total before you enter payment details, saving you another ₹1,500 instantly.</div>
        </div>
      </div>
    </div>
  </div>
""")

# ==========================================
# ACT 5: FEATURE 4 — 90-DAY PRICE HISTORY (108.5s - 127.2s)
# ==========================================
w("""
  <!-- ACT 5: FEATURE 4 PRICE HISTORY -->
  <div id="scene-5" class="scene-view">
    <div class="saas-window" style="width:1380px; height:740px;">
      <div class="window-header">
        <div class="window-dots">
          <div class="window-dot dot-close"></div>
          <div class="window-dot dot-min"></div>
          <div class="window-dot dot-max"></div>
        </div>
        <div class="window-url-pill">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          <span>https://dealfinder.in/products/p_iphone15_128#price-history</span>
        </div>
      </div>

      <div class="window-viewport" style="background:#090e17; padding:28px 48px; display:flex; flex-direction:column; justify-content:space-between;">
        <div style="display:flex; align-items:center; justify-content:space-between;">
          <div>
            <h3 style="font-size:26px; font-weight:900; letter-spacing:-0.02em;">90-Day Verified Price History & Trajectory</h3>
            <p style="font-size:13px; color:#94a3b8; margin-top:2px;">Exposing fake discount tricks with true historical merchant pricing</p>
          </div>
          <div style="display:flex; gap:8px;">
            <button style="background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.1); color:#94a3b8; font-size:12px; font-weight:700; padding:6px 14px; border-radius:8px;">30 Days</button>
            <button style="background:#f97316; border:1px solid #f97316; color:#ffffff; font-size:12px; font-weight:700; padding:6px 14px; border-radius:8px;">90 Days</button>
          </div>
        </div>

        <!-- SVG Line Chart Simulation -->
        <div style="position:relative; width:100%; height:260px; background:#111726; border:1px solid var(--border-glass); border-radius:16px; padding:20px; overflow:hidden;">
          <svg width="100%" height="100%" viewBox="0 0 1000 220" preserveAspectRatio="none">
            <!-- Grid Lines -->
            <line x1="0" y1="50" x2="1000" y2="50" stroke="rgba(255,255,255,0.05)" stroke-width="1"/>
            <line x1="0" y1="110" x2="1000" y2="110" stroke="rgba(255,255,255,0.05)" stroke-width="1"/>
            <line x1="0" y1="170" x2="1000" y2="170" stroke="rgba(255,255,255,0.05)" stroke-width="1"/>

            <!-- Area Fill -->
            <path d="M 50 70 L 200 80 L 350 95 L 500 90 L 650 110 L 800 120 L 950 180 L 950 220 L 50 220 Z" fill="url(#chart-grad)" opacity="0.3"/>

            <!-- Line Path -->
            <path id="chart-line-path" d="M 50 70 L 200 80 L 350 95 L 500 90 L 650 110 L 800 120 L 950 180" fill="none" stroke="#10b981" stroke-width="4" stroke-linecap="round"/>

            <!-- Data Point Circles -->
            <circle cx="50" cy="70" r="5" fill="#f8fafc"/>
            <circle cx="200" cy="80" r="5" fill="#f8fafc"/>
            <circle cx="350" cy="95" r="5" fill="#f8fafc"/>
            <circle cx="500" cy="90" r="5" fill="#f8fafc"/>
            <circle cx="650" cy="110" r="5" fill="#f8fafc"/>
            <circle cx="800" cy="120" r="5" fill="#f8fafc"/>
            <circle id="chart-point-today" cx="950" cy="180" r="8" fill="#10b981" stroke="#ffffff" stroke-width="3"/>

            <defs>
              <linearGradient id="chart-grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="#10b981"/>
                <stop offset="100%" stop-color="#10b981" stop-opacity="0"/>
              </linearGradient>
            </defs>
          </svg>

          <!-- Floating Tooltip on Today's Low -->
          <div id="chart-tooltip" style="position:absolute; right:60px; top:120px; background:rgba(14,19,31,0.95); border:1px solid #10b981; border-radius:10px; padding:8px 14px; box-shadow:0 10px 25px rgba(0,0,0,0.8);">
            <div style="font-size:10px; font-weight:700; color:#10b981; text-transform:uppercase;">Today: All-Time Low</div>
            <div style="font-family:var(--font-mono); font-size:16px; font-weight:900; color:#ffffff;">₹65,999</div>
          </div>
        </div>

        <!-- Deal Verdict Banner -->
        <div id="deal-verdict-banner" style="background:linear-gradient(135deg, rgba(239,68,68,0.15), rgba(249,115,22,0.15)); border:2px solid #ea580c; border-radius:16px; padding:18px 24px; display:flex; align-items:center; justify-content:space-between; box-shadow:0 10px 30px rgba(234,88,12,0.25);">
          <div style="display:flex; align-items:center; gap:16px;">
            <div style="font-size:32px;">🔥</div>
            <div>
              <div style="display:flex; align-items:center; gap:10px;">
                <span style="font-size:18px; font-weight:900; color:#ffffff;">ALL-TIME LOW DETECTED!</span>
                <span style="background:#ea580c; color:#ffffff; font-size:10px; font-weight:800; padding:2px 8px; border-radius:10px;">AUTHENTIC DROP</span>
              </div>
              <div style="font-size:13px; color:#cbd5e1; margin-top:2px;">
                Today's price of <strong>₹65,999</strong> is the lowest recorded in 90 days. You are saving <strong>₹4,200</strong> below the 90-day baseline.
              </div>
            </div>
          </div>
          <div style="font-size:12px; font-weight:800; color:#ea580c; background:rgba(234,88,12,0.15); border:1px solid rgba(234,88,12,0.4); padding:8px 16px; border-radius:10px;">
            VERIFIED GENUINE DEAL ✓
          </div>
        </div>
      </div>
    </div>

    <!-- Pitch Bar for Act 5 -->
    <div id="pitch-bar-scene5" class="feature-pitch-bar">
      <div class="pitch-card pitch-card-what">
        <div class="pitch-icon pitch-icon-what">05</div>
        <div>
          <div class="pitch-label pitch-label-what">WHAT IT DOES</div>
          <div class="pitch-text"><strong>90-Day Real Price Trajectory</strong> — Plots day-by-day historical sale prices across all sellers to evaluate deal authenticity.</div>
        </div>
      </div>
      <div class="pitch-card pitch-card-why">
        <div class="pitch-icon pitch-icon-why">★</div>
        <div>
          <div class="pitch-label pitch-label-why">WHY IT MATTERS</div>
          <div class="pitch-text"><strong>Exposes Inflated MRP Tricks</strong> — Never fall for fake 50% discounts. Know instantly if a deal is an authentic all-time low.</div>
        </div>
      </div>
    </div>
  </div>
""")

# ==========================================
# ACT 6: FEATURE 5 — DYNAMIC MULTI-FILTER & BRAND ENGINE (127.8s - 144.68s)
# ==========================================
w("""
  <!-- ACT 6: FEATURE 5 DYNAMIC FILTERS -->
  <div id="scene-6" class="scene-view">
    <div class="saas-window" style="width:1380px; height:740px;">
      <div class="window-header">
        <div class="window-dots">
          <div class="window-dot dot-close"></div>
          <div class="window-dot dot-min"></div>
          <div class="window-dot dot-max"></div>
        </div>
        <div class="window-url-pill">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          <span>https://dealfinder.in/products?category=laptops&brand=Apple</span>
        </div>
      </div>

      <div class="window-viewport" style="background:#090e17; display:flex;">
        <!-- Left Filter Sidebar -->
        <div style="width:340px; background:#0b101b; border-right:1px solid var(--border-glass); padding:24px; display:flex; flex-direction:column; gap:20px;">
          <div style="display:flex; align-items:center; justify-content:space-between;">
            <span style="font-weight:800; font-size:16px;">Filter Products</span>
            <span style="font-size:12px; color:#f97316; font-weight:700;">Reset All</span>
          </div>

          <!-- Category Filter -->
          <div>
            <div style="font-size:12px; font-weight:800; color:#94a3b8; text-transform:uppercase; margin-bottom:8px;">Category</div>
            <div style="display:flex; flex-direction:column; gap:6px;">
              <div style="display:flex; align-items:center; justify-content:space-between; padding:8px 12px; border-radius:8px; background:rgba(255,255,255,0.03); color:#94a3b8; font-size:13px;">
                <span>📱 Mobiles & Tablets</span>
                <span>(142)</span>
              </div>
              <div id="filter-cat-laptops" style="display:flex; align-items:center; justify-content:space-between; padding:8px 12px; border-radius:8px; background:rgba(249,115,22,0.2); border:1px solid #f97316; color:#ffffff; font-size:13px; font-weight:700;">
                <span>💻 Laptops</span>
                <span style="color:#f97316;">(86) ✓</span>
              </div>
              <div style="display:flex; align-items:center; justify-content:space-between; padding:8px 12px; border-radius:8px; background:rgba(255,255,255,0.03); color:#94a3b8; font-size:13px;">
                <span>🎧 Audio & Headphones</span>
                <span>(64)</span>
              </div>
            </div>
          </div>

          <!-- Brand Filter -->
          <div>
            <div style="font-size:12px; font-weight:800; color:#94a3b8; text-transform:uppercase; margin-bottom:8px;">Brand Selection</div>
            <div style="display:flex; flex-direction:column; gap:6px;">
              <div id="filter-brand-apple" style="display:flex; align-items:center; gap:10px; padding:8px 12px; border-radius:8px; background:rgba(249,115,22,0.15); border:1px solid #f97316; color:#ffffff; font-size:13px; font-weight:700;">
                <span style="width:16px; height:16px; border-radius:4px; background:#f97316; display:flex; align-items:center; justify-content:center; font-size:10px;">✓</span>
                <span>Apple</span>
              </div>
              <div style="display:flex; align-items:center; gap:10px; padding:8px 12px; border-radius:8px; background:rgba(255,255,255,0.03); color:#94a3b8; font-size:13px;">
                <span style="width:16px; height:16px; border-radius:4px; border:1px solid rgba(255,255,255,0.2);"></span>
                <span>Dell</span>
              </div>
              <div style="display:flex; align-items:center; gap:10px; padding:8px 12px; border-radius:8px; background:rgba(255,255,255,0.03); color:#94a3b8; font-size:13px;">
                <span style="width:16px; height:16px; border-radius:4px; border:1px solid rgba(255,255,255,0.2);"></span>
                <span>HP</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Product Catalog Grid -->
        <div style="flex:1; padding:28px 36px; display:flex; flex-direction:column; gap:20px;">
          <div style="display:flex; align-items:center; justify-content:space-between;">
            <div>
              <span style="font-size:18px; font-weight:800;">Showing 12 Laptops for "Apple"</span>
              <div style="font-size:12px; color:#94a3b8;">Sorted by Highest Discount %</div>
            </div>
            <div style="background:#111726; border:1px solid var(--border-glass); border-radius:8px; padding:6px 14px; font-size:12px; font-weight:700;">
              Sort: Highest Discount % ▾
            </div>
          </div>

          <!-- Product Card 1 -->
          <div style="background:#111726; border:1px solid var(--border-glass); border-radius:16px; padding:20px; display:flex; align-items:center; justify-content:space-between;">
            <div style="display:flex; align-items:center; gap:20px;">
              <div style="width:64px; height:64px; border-radius:12px; background:#1e293b; display:flex; align-items:center; justify-content:center; font-size:32px;">💻</div>
              <div>
                <span style="font-size:10px; font-weight:800; background:rgba(234,88,12,0.15); color:#ea580c; padding:2px 8px; border-radius:6px;">26% OFF</span>
                <h4 style="font-size:18px; font-weight:800; color:#ffffff; margin-top:4px;">Apple MacBook Air M2 (8GB RAM, 256GB SSD)</h4>
                <div style="font-size:12px; color:#94a3b8; margin-top:2px;">Tracked across Amazon, Flipkart · Space Gray</div>
              </div>
            </div>
            <div style="text-align:right;">
              <div style="font-family:var(--font-mono); font-size:24px; font-weight:900; color:#10b981;">₹84,990</div>
              <div style="font-size:12px; color:#94a3b8; text-decoration:line-through;">MRP ₹1,14,900</div>
              <div style="font-size:11px; font-weight:700; color:#ea580c; margin-top:2px;">Save ₹29,910 Today</div>
            </div>
          </div>

          <!-- Product Card 2 -->
          <div style="background:#111726; border:1px solid var(--border-glass); border-radius:16px; padding:20px; display:flex; align-items:center; justify-content:space-between;">
            <div style="display:flex; align-items:center; gap:20px;">
              <div style="width:64px; height:64px; border-radius:12px; background:#1e293b; display:flex; align-items:center; justify-content:center; font-size:32px;">💻</div>
              <div>
                <span style="font-size:10px; font-weight:800; background:rgba(234,88,12,0.15); color:#ea580c; padding:2px 8px; border-radius:6px;">15% OFF</span>
                <h4 style="font-size:18px; font-weight:800; color:#ffffff; margin-top:4px;">Apple MacBook Pro M3 (18GB RAM, 512GB SSD)</h4>
                <div style="font-size:12px; color:#94a3b8; margin-top:2px;">Tracked across Amazon, Flipkart · Space Black</div>
              </div>
            </div>
            <div style="text-align:right;">
              <div style="font-family:var(--font-mono); font-size:24px; font-weight:900; color:#10b981;">₹1,54,900</div>
              <div style="font-size:12px; color:#94a3b8; text-decoration:line-through;">MRP ₹1,89,900</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Pitch Bar for Act 6 -->
    <div id="pitch-bar-scene6" class="feature-pitch-bar">
      <div class="pitch-card pitch-card-what">
        <div class="pitch-icon pitch-icon-what">06</div>
        <div>
          <div class="pitch-label pitch-label-what">WHAT IT DOES</div>
          <div class="pitch-text"><strong>Dynamic Multi-Store Filtering</strong> — Filter catalog inventory by store, category, brand, and exact price slider simultaneously.</div>
        </div>
      </div>
      <div class="pitch-card pitch-card-why">
        <div class="pitch-icon pitch-icon-why">★</div>
        <div>
          <div class="pitch-label pitch-label-why">WHY IT MATTERS</div>
          <div class="pitch-text"><strong>Zero Clutter Discovery</strong> — Find top-rated tech and fashion deals matched to your exact wallet budget in three fast clicks.</div>
        </div>
      </div>
    </div>
  </div>
""")

# ==========================================
# ACT 7: FEATURE 6 — TODAY'S DEALS & PRICE DROPS (146.0s - 161.72s)
# ==========================================
w("""
  <!-- ACT 7: FEATURE 6 TODAY'S DEALS -->
  <div id="scene-7" class="scene-view">
    <div class="saas-window" style="width:1380px; height:740px;">
      <div class="window-header">
        <div class="window-dots">
          <div class="window-dot dot-close"></div>
          <div class="window-dot dot-min"></div>
          <div class="window-dot dot-max"></div>
        </div>
        <div class="window-url-pill">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          <span>https://dealfinder.in/deals?minDiscount=40</span>
        </div>
      </div>

      <div class="window-viewport" style="background:#090e17; padding:28px 48px; display:flex; flex-direction:column; gap:20px;">
        <!-- Deals Header Banner -->
        <div style="background:linear-gradient(90deg, #e11d48, #ea580c); border-radius:18px; padding:20px 32px; display:flex; align-items:center; justify-content:space-between; box-shadow:0 15px 40px rgba(225,29,72,0.3);">
          <div>
            <div style="display:flex; align-items:center; gap:8px;">
              <span style="font-size:20px;">🔥</span>
              <span style="font-size:12px; font-weight:800; background:rgba(255,255,255,0.2); padding:2px 8px; border-radius:6px; text-transform:uppercase;">VERIFIED PRICE DROPS</span>
            </div>
            <h3 style="font-size:28px; font-weight:900; margin-top:4px;">Today's Hottest Deals Across Indian Stores</h3>
          </div>
          <div style="font-size:13px; font-weight:700; color:#ffe4e6; text-align:right;">
            <div>Monitored in Real-Time ●</div>
            <div style="font-size:11px; opacity:0.8;">Refreshed Every 15 Minutes</div>
          </div>
        </div>

        <!-- Discount Tier Tabs -->
        <div style="display:flex; align-items:center; gap:12px;">
          <div style="background:#111726; border:1px solid var(--border-glass); border-radius:10px; padding:8px 18px; font-size:13px; font-weight:700; color:#94a3b8;">All Deals</div>
          <div style="background:#111726; border:1px solid var(--border-glass); border-radius:10px; padding:8px 18px; font-size:13px; font-weight:700; color:#94a3b8;">≥ 20% OFF</div>
          <div id="deal-tab-40" style="background:#ea580c; border:1px solid #ea580c; border-radius:10px; padding:8px 18px; font-size:13px; font-weight:800; color:#ffffff; box-shadow:0 0 20px rgba(234,88,12,0.4);">≥ 40% OFF 🔥</div>
          <div style="background:#111726; border:1px solid var(--border-glass); border-radius:10px; padding:8px 18px; font-size:13px; font-weight:700; color:#94a3b8;">≥ 60% MEGA DEALS</div>
        </div>

        <!-- 3 Steep Deal Cards -->
        <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:16px;">
          <div style="background:#111726; border:1px solid var(--border-glass); border-radius:16px; padding:20px; display:flex; flex-direction:column; justify-content:space-between;">
            <div>
              <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                <span style="font-size:11px; font-weight:800; background:#e11d48; color:#fff; padding:3px 8px; border-radius:6px;">43% OFF</span>
                <span style="font-size:11px; color:#10b981; font-weight:700;">Verified Drop</span>
              </div>
              <h4 style="font-size:16px; font-weight:800; margin-top:10px;">Sony WH-1000XM5 ANC</h4>
              <div style="font-size:12px; color:#94a3b8; margin-top:2px;">Amazon India · Midnight Black</div>
            </div>
            <div style="margin-top:16px;">
              <div style="font-family:var(--font-mono); font-size:24px; font-weight:900; color:#10b981;">₹24,990</div>
              <div style="font-size:11px; color:#94a3b8; text-decoration:line-through;">MRP ₹34,990 (Save ₹10,000)</div>
            </div>
          </div>

          <div style="background:#111726; border:1px solid var(--border-glass); border-radius:16px; padding:20px; display:flex; flex-direction:column; justify-content:space-between;">
            <div>
              <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                <span style="font-size:11px; font-weight:800; background:#e11d48; color:#fff; padding:3px 8px; border-radius:6px;">67% OFF</span>
                <span style="font-size:11px; color:#10b981; font-weight:700;">Verified Drop</span>
              </div>
              <h4 style="font-size:16px; font-weight:800; margin-top:10px;">boAt Airdopes 141 ANC</h4>
              <div style="font-size:12px; color:#94a3b8; margin-top:2px;">Flipkart · Active Noise Cancellation</div>
            </div>
            <div style="margin-top:16px;">
              <div style="font-family:var(--font-mono); font-size:24px; font-weight:900; color:#10b981;">₹1,499</div>
              <div style="font-size:11px; color:#94a3b8; text-decoration:line-through;">MRP ₹4,490 (Save ₹2,991)</div>
            </div>
          </div>

          <div style="background:#111726; border:1px solid var(--border-glass); border-radius:16px; padding:20px; display:flex; flex-direction:column; justify-content:space-between;">
            <div>
              <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                <span style="font-size:11px; font-weight:800; background:#e11d48; color:#fff; padding:3px 8px; border-radius:6px;">48% OFF</span>
                <span style="font-size:11px; color:#10b981; font-weight:700;">Verified Drop</span>
              </div>
              <h4 style="font-size:16px; font-weight:800; margin-top:10px;">Philips Digital Air Fryer</h4>
              <div style="font-size:12px; color:#94a3b8; margin-top:2px;">Amazon India · Rapid Air Tech 4.1L</div>
            </div>
            <div style="margin-top:16px;">
              <div style="font-family:var(--font-mono); font-size:24px; font-weight:900; color:#10b981;">₹5,699</div>
              <div style="font-size:11px; color:#94a3b8; text-decoration:line-through;">MRP ₹10,995 (Save ₹5,296)</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Pitch Bar for Act 7 -->
    <div id="pitch-bar-scene7" class="feature-pitch-bar">
      <div class="pitch-card pitch-card-what">
        <div class="pitch-icon pitch-icon-what">07</div>
        <div>
          <div class="pitch-label pitch-label-what">WHAT IT DOES</div>
          <div class="pitch-text"><strong>Curated Verified Drops Feed</strong> — Filters thousands of live products by steep discount tiers (≥20%, ≥40%, ≥60%) in real time.</div>
        </div>
      </div>
      <div class="pitch-card pitch-card-why">
        <div class="pitch-icon pitch-icon-why">★</div>
        <div>
          <div class="pitch-label pitch-label-why">WHY IT MATTERS</div>
          <div class="pitch-text"><strong>First to Flash Sales</strong> — Grab lightning price cuts the moment they happen before stock runs out across all stores.</div>
        </div>
      </div>
    </div>
  </div>
""")

# ==========================================
# ACT 8: FEATURE 7 — FESTIVE SALES CALENDAR (163.0s - 180.79s)
# ==========================================
w("""
  <!-- ACT 8: FEATURE 7 SALES CALENDAR -->
  <div id="scene-8" class="scene-view">
    <div class="saas-window" style="width:1380px; height:740px;">
      <div class="window-header">
        <div class="window-dots">
          <div class="window-dot dot-close"></div>
          <div class="window-dot dot-min"></div>
          <div class="window-dot dot-max"></div>
        </div>
        <div class="window-url-pill">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          <span>https://dealfinder.in/sales</span>
        </div>
      </div>

      <div class="window-viewport" style="background:#090e17; padding:28px 48px; display:flex; flex-direction:column; gap:20px;">
        <div style="background:linear-gradient(135deg, #1e1b4b, #312e81); border-radius:18px; padding:20px 32px; display:flex; align-items:center; justify-content:space-between;">
          <div>
            <span style="font-size:11px; font-weight:800; background:rgba(255,255,255,0.15); padding:2px 8px; border-radius:6px;">FESTIVE PLAYBOOK 2026</span>
            <h3 style="font-size:26px; font-weight:900; margin-top:4px;">Upcoming Indian E-Commerce Mega Sales</h3>
          </div>
          <div style="font-size:13px; color:#cbd5e1;">Target Discounts & Early-Access Prep</div>
        </div>

        <!-- 3 Festival Cards -->
        <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:16px;">
          <!-- Card 1 -->
          <div style="background:#111726; border:2px solid #2874f0; border-radius:16px; padding:22px; display:flex; flex-direction:column; justify-content:space-between; box-shadow:0 10px 30px rgba(40,116,240,0.25);">
            <div>
              <div style="display:flex; justify-content:space-between; align-items:center;">
                <span style="font-size:12px; font-weight:800; background:#2874f0; color:#fff; padding:3px 8px; border-radius:6px;">FLIPKART</span>
                <span style="font-size:11px; color:#60a5fa; font-weight:700;">October 2026</span>
              </div>
              <h4 style="font-size:18px; font-weight:900; margin-top:12px;">Big Billion Days</h4>
              <p style="font-size:12px; color:#94a3b8; margin-top:4px;">Up to 80% off on flagship smartphones, laptops & electronics.</p>
            </div>
            <div style="margin-top:20px; padding-top:14px; border-top:1px solid rgba(255,255,255,0.1); font-size:12px; color:#cbd5e1;">
              <div>💳 <strong>Axis & ICICI</strong> 10% Instant</div>
              <div>⚡ <strong>Flipkart Plus:</strong> 24h Early Access</div>
            </div>
          </div>

          <!-- Card 2 -->
          <div style="background:#111726; border:2px solid #ff9900; border-radius:16px; padding:22px; display:flex; flex-direction:column; justify-content:space-between; box-shadow:0 10px 30px rgba(255,153,0,0.25);">
            <div>
              <div style="display:flex; justify-content:space-between; align-items:center;">
                <span style="font-size:12px; font-weight:800; background:#ff9900; color:#000; padding:3px 8px; border-radius:6px;">AMAZON</span>
                <span style="font-size:11px; color:#fbbf24; font-weight:700;">October 2026</span>
              </div>
              <h4 style="font-size:18px; font-weight:900; margin-top:12px;">Great Indian Festival</h4>
              <p style="font-size:12px; color:#94a3b8; margin-top:4px;">Mega blockbuster deals on electronics, audio & smart TVs.</p>
            </div>
            <div style="margin-top:20px; padding-top:14px; border-top:1px solid rgba(255,255,255,0.1); font-size:12px; color:#cbd5e1;">
              <div>💳 <strong>SBI & Amazon ICICI</strong> 10% Off</div>
              <div>⚡ <strong>Prime:</strong> 24h Early Bird Window</div>
            </div>
          </div>

          <!-- Card 3 -->
          <div style="background:#111726; border:1px solid var(--border-glass); border-radius:16px; padding:22px; display:flex; flex-direction:column; justify-content:space-between;">
            <div>
              <div style="display:flex; justify-content:space-between; align-items:center;">
                <span style="font-size:12px; font-weight:800; background:#ff3f6c; color:#fff; padding:3px 8px; border-radius:6px;">MYNTRA</span>
                <span style="font-size:11px; color:#f472b6; font-weight:700;">October 2026</span>
              </div>
              <h4 style="font-size:18px; font-weight:900; margin-top:12px;">Big Fashion Festival</h4>
              <p style="font-size:12px; color:#94a3b8; margin-top:4px;">50% to 90% off premium apparel, footwear & festive luxury.</p>
            </div>
            <div style="margin-top:20px; padding-top:14px; border-top:1px solid rgba(255,255,255,0.1); font-size:12px; color:#cbd5e1;">
              <div>💳 <strong>Kotak & HDFC</strong> Extra 10% Off</div>
              <div>⚡ <strong>Insider VIP:</strong> 12h Early Passes</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Pitch Bar for Act 8 -->
    <div id="pitch-bar-scene8" class="feature-pitch-bar">
      <div class="pitch-card pitch-card-what">
        <div class="pitch-icon pitch-icon-what">08</div>
        <div>
          <div class="pitch-label pitch-label-what">WHAT IT DOES</div>
          <div class="pitch-text"><strong>Mega-Sale Intelligence Calendar</strong> — Tracks confirmed dates, partner bank cards, and VIP early access windows for major sales.</div>
        </div>
      </div>
      <div class="pitch-card pitch-card-why">
        <div class="pitch-icon pitch-icon-why">★</div>
        <div>
          <div class="pitch-label pitch-label-why">WHY IT MATTERS</div>
          <div class="pitch-text"><strong>Strategic Festive Planning</strong> — Prepare cards and alerts ahead of time so you secure VIP access before high-demand items sell out.</div>
        </div>
      </div>
    </div>
  </div>
""")

# ==========================================
# ACT 9: GRAND PAYOFF & CALL TO ACTION (182.0s - 210.0s)
# ==========================================
w("""
  <!-- ACT 9: GRAND OUTRO & CTA -->
  <div id="scene-9" class="scene-view" style="flex-direction:column; gap:28px;">
    <!-- WhatsApp Share Card Demo -->
    <div id="outro-share-card" style="background:#111b21; border:2px solid #25d366; border-radius:20px; padding:20px 28px; width:720px; box-shadow:0 25px 60px rgba(0,0,0,0.9), 0 0 35px rgba(37,211,102,0.3); display:flex; align-items:center; justify-content:space-between;">
      <div style="display:flex; align-items:center; gap:16px;">
        <div style="width:48px; height:48px; border-radius:50%; background:#25d366; display:flex; align-items:center; justify-content:center; color:#ffffff; font-size:24px;">💬</div>
        <div>
          <div style="font-size:12px; font-weight:800; color:#25d366; text-transform:uppercase;">One-Click WhatsApp Deal Share</div>
          <div style="font-size:15px; color:#ffffff; font-weight:700; margin-top:2px;">"Bhai, check this: iPhone 15 at ₹64,499 on Flipkart with HDFC offer! Save ₹4,000 vs Amazon"</div>
        </div>
      </div>
      <span style="font-size:12px; font-weight:800; color:#25d366; background:rgba(37,211,102,0.15); padding:6px 14px; border-radius:8px;">SHARED ✓</span>
    </div>

    <!-- Final Brand Resolve -->
    <div id="outro-brand-block" style="text-align:center; display:flex; flex-direction:column; align-items:center; gap:16px;">
      <div style="width:96px; height:96px; border-radius:24px; background:linear-gradient(135deg, #f97316, #ea580c); display:flex; align-items:center; justify-content:center; box-shadow:0 0 50px var(--saffron-glow);">
        <svg width="54" height="54" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z"></path>
          <path d="M7 7h.01"></path>
        </svg>
      </div>

      <h1 style="font-size:64px; font-weight:900; letter-spacing:-0.03em;">
        DealFinder <span style="color:#f97316;">IN</span> 🇮🇳
      </h1>
      <p style="font-size:22px; color:#cbd5e1; font-weight:600; max-width:800px;">
        Stop Overpaying. Stop Wasting Time Across Endless Tabs. Compare Smarter.
      </p>

      <div style="background:rgba(249,115,22,0.15); border:2px solid #f97316; border-radius:9999px; padding:16px 44px; font-family:var(--font-mono); font-size:28px; font-weight:900; color:#ffffff; box-shadow:0 15px 45px var(--saffron-glow); margin-top:8px;">
        dealfinder.in
      </div>
    </div>
  </div>
""")

# ==========================================
# GSAP MASTER TIMELINE & HYPERFRAMES LOGIC
# ==========================================
w("""
  <script>
    window.__timelines = window.__timelines || {};
    const tl = gsap.timeline({ paused: true });
    window.__timelines["dealfinder-showcase"] = tl;

    // Stable baselines
    tl.set("#cursor-click-ring", { xPercent: -50, yPercent: -50, scale: 0, opacity: 0 }, 0);
    tl.set("#interactive-cursor", { x: 960, y: 540, autoAlpha: 0 }, 0);
    tl.set("#search-dropdown-menu", { y: -10, autoAlpha: 0 }, 0);

    function setSubtitle(text) {
      document.getElementById("subtitle-text").textContent = text;
    }

    function setChapter(badge, title) {
      document.getElementById("chapter-badge").textContent = badge;
      document.getElementById("chapter-title").textContent = title;
    }

    function animateClick(targetX, targetY, atTime) {
      tl.to("#interactive-cursor", { autoAlpha: 1, x: targetX, y: targetY, duration: 0.6, ease: "power2.out" }, atTime);
      tl.to("#interactive-cursor svg", { scale: 0.85, duration: 0.08, yoyo: true, repeat: 1 }, atTime + 0.6);
      tl.fromTo("#cursor-click-ring", { scale: 0.2, opacity: 1, xPercent: -50, yPercent: -50 }, { scale: 2.2, opacity: 0, xPercent: -50, yPercent: -50, duration: 0.45, ease: "power2.out", immediateRender: false }, atTime + 0.6);
    }

    // ==========================================
    // ACT 0: THE HOOK (0.5s - 23.5s)
    // ==========================================
    tl.to("#scene-0", { autoAlpha: 1, duration: 0.5 }, 0.5);
    tl.from(".hook-pill", { scale: 0.8, opacity: 0, stagger: 0.3, duration: 0.6, ease: "back.out(1.5)" }, 1.5);

    // Number ticker on loss
    const lossObj = { val: 0 };
    tl.to(lossObj, {
      val: 14850,
      duration: 3.5,
      ease: "power2.out",
      onUpdate: () => {
        document.getElementById("hook-loss-val").textContent = `-₹${Math.round(lossObj.val).toLocaleString('en-IN')}`;
      }
    }, 2.0);

    tl.call(() => {
      setSubtitle("Between inflated MRPs and hidden bank card offers, the average shopper overpays by thousands of Rupees every year.");
    }, null, 10.0);

    tl.call(() => {
      setSubtitle("What if you could see the undisputed lowest price across every store in one place?");
    }, null, 16.0);

    tl.to("#scene-0", { autoAlpha: 0, duration: 0.5 }, 23.0);

    // ==========================================
    // ACT 1: PRODUCT REVEAL — DEALFINDER INDIA (24.0s - 44.5s)
    // ==========================================
    tl.call(() => {
      setChapter("PRODUCT REVEAL", "Meet DealFinder India");
      setSubtitle("Welcome to DealFinder India. The smart price comparison engine built specifically for Indian e-commerce.");
    }, null, 24.0);

    tl.to("#scene-1", { autoAlpha: 1, duration: 0.6 }, 24.0);
    tl.fromTo("#scene-1 .saas-window", { scale: 0.92, y: 30 }, { scale: 1, y: 0, duration: 0.8, ease: "back.out(1.2)", immediateRender: false }, 24.0);
    tl.from(".store-badge-card", { opacity: 0, y: 20, stagger: 0.15, duration: 0.5 }, 26.5);

    tl.call(() => {
      setSubtitle("DealFinder tracks, verifies, and compares real prices and active bank discounts across Amazon India, Flipkart, Myntra, AJIO, and Meesho in real time.");
    }, null, 28.5);

    tl.fromTo("#pitch-bar-scene1", { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, duration: 0.6, ease: "back.out(1.2)", immediateRender: false }, 34.0);

    tl.call(() => {
      setSubtitle("No marketing gimmicks, no inflated list prices, just pure, verified savings.");
    }, null, 38.0);

    tl.to("#scene-1", { autoAlpha: 0, duration: 0.5 }, 44.0);

    // ==========================================
    // ACT 2: FEATURE 1 — UNIVERSAL INSTANT SEARCH (45.0s - 64.0s)
    // ==========================================
    tl.call(() => {
      setChapter("FEATURE 01", "Universal Instant Search");
      setSubtitle("It starts with our lightning fast search engine. Forget opening five different apps.");
    }, null, 45.0);

    tl.to("#scene-2", { autoAlpha: 1, duration: 0.5 }, 45.0);

    // Cursor tracks to search box and clicks at 48.0s
    animateClick(960, 240, 47.0);

    // Simulated typing at 48.5s
    const query = "iPhone 15";
    for (let i = 1; i <= query.length; i++) {
      tl.call(() => {
        document.getElementById("search-typing-text").textContent = query.slice(0, i);
      }, null, 48.4 + (i * 0.12));
    }

    // Autocomplete dropdown pops down at 50.0s
    tl.to("#search-dropdown-menu", { autoAlpha: 1, y: 0, duration: 0.4, ease: "back.out(1.4)" }, 50.0);

    tl.call(() => {
      setSubtitle("Start typing any smartphone, laptop, or fashion item, and our dual-source search instantly suggests verified models with live price ranges.");
    }, null, 50.5);

    // Cursor clicks Option 1 at 52.5s
    animateClick(960, 340, 51.5);
    tl.to("#search-opt-1", { background: "rgba(249,115,22,0.35)", duration: 0.2 }, 52.5);

    tl.fromTo("#pitch-bar-scene2", { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, duration: 0.6, ease: "back.out(1.2)", immediateRender: false }, 55.0);

    tl.call(() => {
      setSubtitle("In two seconds, you find the exact variant you want with zero guesswork.");
    }, null, 57.5);

    tl.to("#interactive-cursor", { autoAlpha: 0, duration: 0.2 }, 63.0);
    tl.to("#scene-2", { autoAlpha: 0, duration: 0.5 }, 63.8);

    // ==========================================
    // ACT 3: FEATURE 2 — CROSS-STORE COMPARISON MATRIX (64.5s - 85.5s)
    // ==========================================
    tl.call(() => {
      setChapter("FEATURE 02", "Comparison Matrix");
      setSubtitle("Once you pick a product, DealFinder reveals the complete multi-store comparison matrix.");
    }, null, 64.5);

    tl.to("#scene-3", { autoAlpha: 1, duration: 0.5 }, 64.5);

    // Cursor hovers Flipkart row
    animateClick(960, 260, 68.0);

    tl.call(() => {
      setSubtitle("See live prices from Amazon, Flipkart, Myntra, AJIO, and Meesho side by side, complete with delivery thresholds and stock availability.");
    }, null, 68.5);

    tl.fromTo("#pitch-bar-scene3", { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, duration: 0.6, ease: "back.out(1.2)", immediateRender: false }, 74.0);

    tl.call(() => {
      setSubtitle("DealFinder instantly certifies the lowest price among tracked stores, saving you up to four thousand Rupees on a single purchase.");
    }, null, 77.0);

    tl.to("#interactive-cursor", { autoAlpha: 0, duration: 0.2 }, 84.5);
    tl.to("#scene-3", { autoAlpha: 0, duration: 0.5 }, 85.0);

    // ==========================================
    // ACT 4: FEATURE 3 — BANK DISCOUNT CALCULATOR (86.0s - 107.5s)
    // ==========================================
    tl.call(() => {
      setChapter("FEATURE 03", "Smart Bank Discount Calculator");
      setSubtitle("Here is the secret seasoned Indian shoppers know: advertised prices are rarely the final price.");
    }, null, 86.0);

    tl.to("#scene-4", { autoAlpha: 1, duration: 0.5 }, 86.0);

    // Cursor clicks HDFC card at 91.0s
    animateClick(440, 260, 90.0);
    tl.to("#card-btn-hdfc", { background: "#2563eb", borderColor: "#60a5fa", scale: 1.04, duration: 0.2 }, 91.0);

    tl.call(() => {
      setSubtitle("Select your credit or debit card, like HDFC, SBI, ICICI, or Axis, and watch the calculator instantly apply active festive discounts.");
    }, null, 91.5);

    // Dynamic price drop rollup
    const bankPriceObj = { p: 65999 };
    tl.to(bankPriceObj, {
      p: 64499,
      duration: 1.5,
      ease: "power2.out",
      onUpdate: () => {
        document.getElementById("bank-effective-price").textContent = `₹${Math.round(bankPriceObj.p).toLocaleString('en-IN')}`;
      }
    }, 92.0);

    tl.fromTo("#pitch-bar-scene4", { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, duration: 0.6, ease: "back.out(1.2)", immediateRender: false }, 96.0);

    tl.call(() => {
      setSubtitle("Revealing your true checkout price and estimated monthly EMI.");
    }, null, 98.0);

    tl.to("#interactive-cursor", { autoAlpha: 0, duration: 0.2 }, 106.5);
    tl.to("#scene-4", { autoAlpha: 0, duration: 0.5 }, 107.0);

    // ==========================================
    // ACT 5: FEATURE 4 — 90-DAY PRICE HISTORY (108.5s - 127.2s)
    // ==========================================
    tl.call(() => {
      setChapter("FEATURE 04", "90-Day Price History Tracker");
      setSubtitle("Ever wonder if that festive sale discount is genuine, or if the seller quietly jacked up the price yesterday?");
    }, null, 108.5);

    tl.to("#scene-5", { autoAlpha: 1, duration: 0.5 }, 108.5);

    // Sweep cursor across the line chart at 113.0s
    animateClick(880, 360, 112.5);

    tl.call(() => {
      setSubtitle("DealFinder's ninety-day price history tracker charts the real market trajectory.");
    }, null, 114.0);

    // Pop Deal Verdict at 118.0s
    tl.fromTo("#deal-verdict-banner", { scale: 0.9, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.5, ease: "back.out(1.4)", immediateRender: false }, 118.0);

    tl.fromTo("#pitch-bar-scene5", { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, duration: 0.6, ease: "back.out(1.2)", immediateRender: false }, 120.0);

    tl.call(() => {
      setSubtitle("Our deal verdict engine automatically detects all-time lows and warns you if a discount is fake, giving you total buying confidence.");
    }, null, 120.5);

    tl.to("#interactive-cursor", { autoAlpha: 0, duration: 0.2 }, 126.0);
    tl.to("#scene-5", { autoAlpha: 0, duration: 0.5 }, 126.8);

    // ==========================================
    // ACT 6: FEATURE 5 — DYNAMIC MULTI-FILTER (127.8s - 144.68s)
    // ==========================================
    tl.call(() => {
      setChapter("FEATURE 05", "Dynamic Multi-Filter Engine");
      setSubtitle("Shopping on a specific budget? Our responsive multi-filter engine lets you slice thousands of products by category, retailer, brand, and exact Rupee range.");
    }, null, 127.8);

    tl.to("#scene-6", { autoAlpha: 1, duration: 0.5 }, 127.8);

    // Cursor clicks "Laptops" category at 132.0s
    animateClick(380, 240, 131.0);
    tl.to("#filter-cat-laptops", { scale: 1.03, duration: 0.2 }, 132.0);

    // Cursor clicks "Apple" brand at 135.0s
    animateClick(380, 380, 134.0);

    tl.fromTo("#pitch-bar-scene6", { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, duration: 0.6, ease: "back.out(1.2)", immediateRender: false }, 137.0);

    tl.call(() => {
      setSubtitle("Whether you are hunting for Apple MacBooks or Sony headphones under thirty thousand Rupees, find the highest discount offers in seconds.");
    }, null, 137.5);

    tl.to("#interactive-cursor", { autoAlpha: 0, duration: 0.2 }, 143.5);
    tl.to("#scene-6", { autoAlpha: 0, duration: 0.5 }, 144.2);

    // ==========================================
    // ACT 7: FEATURE 6 — TODAY'S DEALS (146.0s - 161.72s)
    // ==========================================
    tl.call(() => {
      setChapter("FEATURE 06", "Today's Verified Deals");
      setSubtitle("Never miss a flash price drop again. On our Today's Deals dashboard, browse freshly verified price drops filtered by steep discount tiers.");
    }, null, 146.0);

    tl.to("#scene-7", { autoAlpha: 1, duration: 0.5 }, 146.0);

    // Cursor clicks ≥40% OFF at 150.0s
    animateClick(760, 260, 149.0);
    tl.to("#deal-tab-40", { scale: 1.08, duration: 0.2 }, 150.0);

    tl.fromTo("#pitch-bar-scene7", { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, duration: 0.6, ease: "back.out(1.2)", immediateRender: false }, 154.0);

    tl.call(() => {
      setSubtitle("From flagship smartphones to home appliances, discover lightning deals the moment they happen.");
    }, null, 155.5);

    tl.to("#interactive-cursor", { autoAlpha: 0, duration: 0.2 }, 160.5);
    tl.to("#scene-7", { autoAlpha: 0, duration: 0.5 }, 161.2);

    // ==========================================
    // ACT 8: FEATURE 7 — FESTIVE SALES CALENDAR (163.0s - 180.79s)
    // ==========================================
    tl.call(() => {
      setChapter("FEATURE 07", "Festive Sales Calendar");
      setSubtitle("Preparation wins the festive shopping wars. DealFinder's sales calendar tracks major shopping festivals, like Flipkart Big Billion Days and Amazon Great Indian Festival.");
    }, null, 163.0);

    tl.to("#scene-8", { autoAlpha: 1, duration: 0.5 }, 163.0);

    animateClick(640, 360, 167.0);

    tl.fromTo("#pitch-bar-scene8", { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, duration: 0.6, ease: "back.out(1.2)", immediateRender: false }, 172.0);

    tl.call(() => {
      setSubtitle("Get target discounts, VIP early access dates, and insider checklists so you are always first in line for the biggest price drops.");
    }, null, 173.0);

    tl.to("#interactive-cursor", { autoAlpha: 0, duration: 0.2 }, 179.5);
    tl.to("#scene-8", { autoAlpha: 0, duration: 0.5 }, 180.5);

    // ==========================================
    // ACT 9: GRAND PAYOFF & CALL TO ACTION (182.0s - 210.0s)
    // ==========================================
    tl.to("#top-nav", { autoAlpha: 0, duration: 0.4 }, 182.0);

    tl.call(() => {
      setSubtitle("Found an unbeatable deal? Share it directly with family and friends on WhatsApp in one click.");
    }, null, 182.0);

    tl.to("#scene-9", { autoAlpha: 1, duration: 0.6 }, 182.0);

    // Animate WhatsApp share click
    animateClick(960, 280, 184.0);

    tl.call(() => {
      setSubtitle("Stop overpaying. Stop wasting time across endless tabs. Compare smarter and keep more money in your pocket.");
    }, null, 187.0);

    tl.fromTo("#outro-brand-block", { scale: 0.88, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.8, ease: "back.out(1.4)", immediateRender: false }, 188.0);

    tl.call(() => {
      setSubtitle("Visit dealfinder dot in and start saving today.");
    }, null, 192.5);

    // Fade to pure black at 207s to 210s
    tl.to("body", { backgroundColor: "#000000", duration: 3.0 }, 207.0);
  </script>
</body>
</html>
""")

with open("demo-video/composition/index.html", "w") as out:
    out.write("".join(html_parts))

print("Composition HTML generated successfully: demo-video/composition/index.html")
