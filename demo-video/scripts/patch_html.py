with open("demo-video/scripts/generate_html.py", "r") as f:
    code = f.read()

# 1. Update body tag
code = code.replace("<body>", '<body data-composition-id="dealfinder-showcase" data-width="1920" data-height="1080" data-duration="210.0" data-fps="30">')

# 2. Remove transition from subtitle pill
code = code.replace("transition: opacity 0.3s ease;", "/* no css transition */")

# 3. Remove transform from search-dropdown-menu
code = code.replace("transform:translateY(-10px);", "")

# 4. Interactive cursor initial position
code = code.replace("transform: translate(-2px, -2px);", "")

# 5. Replace timeline init and animateClick
old_timeline_init = """    const tl = gsap.timeline();

    function setSubtitle(text) {
      const el = document.getElementById("subtitle-text");
      gsap.to(el, { opacity: 0, duration: 0.2, onComplete: () => {
        el.textContent = text;
        gsap.to(el, { opacity: 1, duration: 0.2 });
      }});
    }

    function setChapter(badge, title) {
      document.getElementById("chapter-badge").textContent = badge;
      document.getElementById("chapter-title").textContent = title;
    }

    function animateClick(x, y, startTime) {
      const cursor = document.getElementById("interactive-cursor");
      const ring = document.getElementById("cursor-click-ring");

      tl.to(cursor, { autoAlpha: 1, duration: 0.3 }, startTime);
      tl.to(cursor, { left: x, top: y, duration: 0.7, ease: "power2.out" }, startTime + 0.1);
      tl.to(cursor, { scale: 0.88, duration: 0.1 }, startTime + 0.8);
      tl.fromTo(ring, { scale: 0, opacity: 1 }, { scale: 1.8, opacity: 0, duration: 0.4 }, startTime + 0.8);
      tl.to(cursor, { scale: 1, duration: 0.15 }, startTime + 0.9);
    }"""

new_timeline_init = """    window.__timelines = window.__timelines || {};
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
    }"""

code = code.replace(old_timeline_init, new_timeline_init)

# 6. Add immediateRender: false to fromTo calls
code = code.replace("ease: \"back.out(1.2)\" }, 34.0);", "ease: \"back.out(1.2)\", immediateRender: false }, 34.0);")
code = code.replace("ease: \"back.out(1.2)\" }, 55.0);", "ease: \"back.out(1.2)\", immediateRender: false }, 55.0);")
code = code.replace("ease: \"back.out(1.2)\" }, 74.0);", "ease: \"back.out(1.2)\", immediateRender: false }, 74.0);")
code = code.replace("ease: \"back.out(1.2)\" }, 96.0);", "ease: \"back.out(1.2)\", immediateRender: false }, 96.0);")
code = code.replace("ease: \"back.out(1.2)\" }, 120.0);", "ease: \"back.out(1.2)\", immediateRender: false }, 120.0);")
code = code.replace("ease: \"back.out(1.2)\" }, 137.0);", "ease: \"back.out(1.2)\", immediateRender: false }, 137.0);")
code = code.replace("ease: \"back.out(1.2)\" }, 154.0);", "ease: \"back.out(1.2)\", immediateRender: false }, 154.0);")
code = code.replace("ease: \"back.out(1.2)\" }, 172.0);", "ease: \"back.out(1.2)\", immediateRender: false }, 172.0);")
code = code.replace("ease: \"back.out(1.4)\" }, 188.0);", "ease: \"back.out(1.4)\", immediateRender: false }, 188.0);")
code = code.replace("ease: \"back.out(1.4)\" }, 118.0);", "ease: \"back.out(1.4)\", immediateRender: false }, 118.0);")
code = code.replace("ease: \"back.out(1.2)\" }, 24.0);", "ease: \"back.out(1.2)\", immediateRender: false }, 24.0);")

with open("demo-video/scripts/generate_html.py", "w") as f:
    f.write(code)

print("Updated generate_html.py successfully!")
