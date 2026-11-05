// =========================================================
// THE SKETCHBOOK WORLD · main script
// ---------------------------------------------------------
// 1. Fills the page from js/content.js
// 2. Loading + start screen
// 3. Smooth scrolling (Lenis) + scroll animations (GSAP)
// 4. Little game bits: XP bars, achievements, save point,
//    pencil cursor, magnetic buttons, a Konami-code secret
// Everything still works (minus the motion) if a library
// fails to load or the visitor prefers reduced motion.
// =========================================================
(function () {
  "use strict";

  var C = window.SITE_CONTENT || {};
  var root = document.documentElement;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  var gsap = window.gsap;
  var ST = window.ScrollTrigger;
  var anim = !!(gsap && ST && !reduce);
  if (anim) gsap.registerPlugin(ST);

  function $(s, el) { return (el || document).querySelector(s); }
  function $$(s, el) { return Array.prototype.slice.call((el || document).querySelectorAll(s)); }
  function get(obj, path) {
    return path.split(".").reduce(function (o, k) { return o == null ? undefined : o[k]; }, obj);
  }
  function icon(id, cls) { return '<svg class="' + (cls || "") + '" aria-hidden="true"><use href="#' + id + '"/></svg>'; }
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function pad(n) { return String(n).padStart(2, "0"); }

  // =======================================================
  // 1. CONTENT
  // =======================================================
  $$("[data-text]").forEach(function (n) {
    var v = get(C, n.getAttribute("data-text"));
    if (v != null && v !== "") n.textContent = v;
  });
  $$("img[data-src]").forEach(function (img) {
    var v = get(C, img.getAttribute("data-src"));
    if (v) img.src = v;
    var a = img.getAttribute("data-alt");
    if (a && get(C, a)) img.alt = get(C, a);
  });
  var yearEl = $("#year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Hero name on two lines: "Ng Jia" / "Rhui"
  if (C.name) {
    var words = C.name.trim().split(/\s+/);
    var last = words.length > 1 ? words.pop() : "";
    $("#hero-name").innerHTML =
      '<span class="hero__line">' + esc(words.join(" ")) + "</span> " +
      (last ? '<span class="hero__line">' + esc(last) + "</span>" : "");
  }

  function fillList(sel, items, render) {
    var el = $(sel);
    if (!el) return;
    el.innerHTML = (items || []).map(render).join("");
  }
  var P = C.profile || {};
  fillList("#traits", P.traits, function (t) { return "<li>" + esc(t) + "</li>"; });

  function xpItem(s, i) {
    var v = Math.max(0, Math.min(100, Number(s.value) || 0));
    return '<li class="xp" style="--v:' + v / 100 + '">' +
      '<span class="xp__label">' + esc(s.label) + "</span>" +
      '<span class="xp__value"><span class="xp__num" data-to="' + v + '">0</span>/100</span>' +
      '<span class="xp__bar" role="meter" aria-label="' + esc(s.label) + '" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + v + '">' +
      '<span class="xp__fill" style="transition-delay:' + i * 90 + 'ms"></span></span></li>';
  }
  fillList("#stats-play", P.stats, xpItem);
  fillList("#stats-tech", P.techStats, xpItem);

  var D = C.drawing || {};
  fillList("#tools", D.tools, function (t) { return "<li>" + esc(t) + "</li>"; });
  fillList("#inspirations", D.inspirations, function (t) { return "<li>" + esc(t) + "</li>"; });
  fillList("#likes", C.likes, function (t) { return "<li>" + esc(t) + "</li>"; });

  var genres = $("#genres");
  if (genres && C.gameMeta) genres.textContent = (C.gameMeta.genres || []).join(", ");

  fillList("#games-list", C.games, function (g) {
    return '<li><button class="cart" type="button" aria-pressed="false" style="--game:' + esc(g.color || "") + '">' +
      '<span class="cart__inner">' +
      '<span class="cart__face cart__face--front">' +
      '<span class="cart__grip" aria-hidden="true"></span>' +
      '<span class="cart__label"><span class="cart__genre">' + esc(g.genre) + '</span><span class="cart__title">' + esc(g.title) + "</span></span>" +
      '<span class="cart__pins" aria-hidden="true"></span>' +
      "</span>" +
      '<span class="cart__face cart__face--back">' +
      '<span class="hud">WHY I PLAY</span>' +
      '<span class="cart__why">' + esc(g.why) + "</span>" +
      '<span class="cart__flip hud" aria-hidden="true">' + esc(g.title).toUpperCase() + "</span>" +
      "</span></span></button></li>";
  });
  $$(".cart").forEach(function (b) {
    b.addEventListener("click", function () {
      b.setAttribute("aria-pressed", b.getAttribute("aria-pressed") === "true" ? "false" : "true");
    });
  });

  var ACH = C.achievements || [];
  fillList("#ach-list", ACH, function (a) {
    return '<li class="badge is-locked">' +
      '<span class="badge__icon">' + icon("i-" + (a.icon || "trophy"), "i-main") + icon("i-lock", "i-lock") + "</span>" +
      "<div><h3>" + esc(a.title) + "</h3><p>" + esc(a.text) + "</p></div>" +
      '<span class="badge__stamp" aria-hidden="true">UNLOCKED</span></li>';
  });

  var Q = C.completedQuest;
  if (Q && $("#quest-main")) {
    $("#quest-main").innerHTML =
      '<p class="hud quest-main__tag">' + icon("i-check") + " MAIN QUEST · COMPLETED</p>" +
      "<h3>" + esc(Q.title) + "</h3><p>" + esc(Q.summary) + "</p>" +
      '<ul class="quest-steps">' + (Q.steps || []).map(function (s) { return "<li>" + icon("i-check") + "<span>" + esc(s) + "</span></li>"; }).join("") + "</ul>" +
      '<div class="quest-loot"><span class="hud">LOOT · BIGGEST LESSON</span><q>' + esc(Q.lesson) + "</q></div>";
  }
  fillList("#quest-list", C.sideQuests, function (q, i) {
    var locked = q.status === "locked";
    var v = Math.max(0, Math.min(100, Number(q.progress) || 0));
    return '<li class="quest' + (locked ? " quest--locked" : "") + '" style="--v:' + v / 100 + '">' +
      '<div class="quest__top"><span class="quest__num">SIDE QUEST ' + pad(i + 1) + "</span>" +
      '<span class="quest__status">' + (locked ? icon("i-lock") + "LOCKED" : "ACTIVE") + "</span></div>" +
      "<h3>" + esc(q.title) + "</h3><p>" + esc(q.detail) + "</p>" +
      '<div class="quest__bar" role="meter" aria-label="Progress" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + v + '"><span></span></div>' +
      '<p class="quest__pct">' + v + "% COMPLETE</p></li>";
  });

  fillList("#links", (C.links || []).filter(function (l) { return l && l.url; }), function (l) {
    return '<li><a class="btn btn--ghost magnetic" href="' + esc(l.url) + '" target="_blank" rel="noopener noreferrer">' +
      icon("i-" + (l.icon || "arrow")) + esc(l.label) + "</a></li>";
  });

  // =======================================================
  // THEME (day / night sketch)
  // =======================================================
  var toggle = $("#theme-toggle");
  function setTheme(t, silent) {
    root.setAttribute("data-theme", t);
    toggle.setAttribute("aria-label", t === "dark" ? "Switch to day mode" : "Switch to night mode");
    if (silent) return; // only remember a theme the visitor picked themselves
    try { localStorage.setItem("theme", t); } catch (e) {}
    window.dispatchEvent(new CustomEvent("themechange", { detail: t }));
  }
  setTheme(root.getAttribute("data-theme") || "light", true);
  toggle.addEventListener("click", function () {
    setTheme(root.getAttribute("data-theme") === "dark" ? "light" : "dark");
  });

  // =======================================================
  // NAV
  // =======================================================
  var menuBtn = $("#nav-menu");
  var links = $("#nav-links");
  function setMenu(open) {
    links.classList.toggle("is-open", open);
    menuBtn.setAttribute("aria-expanded", open ? "true" : "false");
    menuBtn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    menuBtn.innerHTML = icon(open ? "i-close" : "i-menu");
  }
  menuBtn.addEventListener("click", function () { setMenu(!links.classList.contains("is-open")); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && links.classList.contains("is-open")) { setMenu(false); menuBtn.focus(); } });

  // =======================================================
  // SMOOTH SCROLL (Lenis)
  // =======================================================
  var lenis = null;
  if (window.Lenis && !reduce) {
    lenis = new window.Lenis({ lerp: 0.1, smoothWheel: true, wheelMultiplier: 1 });
    root.classList.add("lenis");
    if (gsap) {
      if (ST) lenis.on("scroll", ST.update);
      gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
      gsap.ticker.lagSmoothing(0);
    } else {
      var rafLoop = function (t) { lenis.raf(t); requestAnimationFrame(rafLoop); };
      requestAnimationFrame(rafLoop);
    }
    window.__lenis = lenis;
  }
  window.__scrollTo = function (y) {
    if (lenis) lenis.scrollTo(y, { duration: 1.4 });
    else window.scrollTo({ top: y, behavior: reduce ? "auto" : "smooth" });
  };
  window.__scrollBy = function (dy) {
    if (lenis) lenis.scrollTo(lenis.targetScroll + dy, { lerp: 0.12 });
    else window.scrollBy(0, dy);
  };

  $$('a[href^="#"]').forEach(function (a) {
    a.addEventListener("click", function (e) {
      var id = a.getAttribute("href");
      var target = id.length > 1 ? document.getElementById(id.slice(1)) : null;
      if (!target) return;
      e.preventDefault();
      setMenu(false);
      var y = target.getBoundingClientRect().top + window.scrollY - (id === "#gallery" ? 0 : 10);
      window.__scrollTo(Math.max(0, y));
      if (!target.hasAttribute("tabindex")) target.setAttribute("tabindex", "-1");
      target.focus({ preventScroll: true });
      if (history.replaceState) history.replaceState(null, "", id);
    });
  });

  // Scroll progress XP bar + hide the HUD while scrolling down
  var hud = $("#hud-bar");
  var xpFill = $("#xp-progress");
  var lastY = window.scrollY;
  function onScroll() {
    var y = window.scrollY;
    var max = document.documentElement.scrollHeight - window.innerHeight;
    xpFill.style.transform = "scaleX(" + (max > 0 ? y / max : 0) + ")";
    if (!links.classList.contains("is-open")) hud.classList.toggle("is-hidden", y > lastY && y > 400);
    lastY = y;
  }
  if (lenis) lenis.on("scroll", onScroll);
  else window.addEventListener("scroll", onScroll, { passive: true });
  hud.addEventListener("focusin", function () { hud.classList.remove("is-hidden"); });

  // Highlight the nav link for the section on screen
  if ("IntersectionObserver" in window) {
    var navMap = {};
    $$(".nav__links a").forEach(function (a) { navMap[a.getAttribute("href").slice(1)] = a; });
    var navObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        Object.keys(navMap).forEach(function (k) { navMap[k].setAttribute("aria-current", k === en.target.id ? "true" : "false"); });
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    $$("main > section[id]").forEach(function (s) { navObs.observe(s); });
  }

  // =======================================================
  // TOASTS + CONFETTI DOODLES
  // =======================================================
  var toastBox = $("#toasts");
  function toast(small, title, iconId) {
    var t = document.createElement("div");
    t.className = "toast";
    t.innerHTML = '<span class="toast__icon">' + icon("i-" + (iconId || "trophy")) + "</span><div><small>" + esc(small) + "</small><strong>" + esc(title) + "</strong></div>";
    toastBox.appendChild(t);
    while (toastBox.children.length > 3) toastBox.removeChild(toastBox.firstChild);
    setTimeout(function () {
      t.classList.add("is-out");
      setTimeout(function () { t.remove(); }, 400);
    }, 3200);
  }

  function confetti(count, originEl) {
    if (reduce) return;
    var box = document.createElement("div");
    box.className = "confetti";
    box.setAttribute("aria-hidden", "true");
    document.body.appendChild(box);
    var shapes = ["d-star", "d-spiral", "d-heart", "d-bolt", "d-pad"];
    var r = originEl ? originEl.getBoundingClientRect() : null;
    var ox = r ? r.left + r.width / 2 : window.innerWidth / 2;
    var oy = r ? r.top + r.height / 2 : -40;
    for (var i = 0; i < count; i++) {
      var s = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      s.innerHTML = '<use href="#' + shapes[i % shapes.length] + '"/>';
      s.style.color = i % 3 === 0 ? "var(--accent)" : "var(--ink)";
      s.style.left = ox + "px";
      s.style.top = oy + "px";
      box.appendChild(s);
      var angle = Math.random() * Math.PI * 2;
      var dist = 120 + Math.random() * 260;
      var dx = Math.cos(angle) * dist;
      var dy = r ? Math.sin(angle) * dist - 120 : window.innerHeight * (0.6 + Math.random() * 0.6);
      if (!r) { s.style.left = Math.random() * window.innerWidth + "px"; dx = (Math.random() - 0.5) * 200; }
      if (gsap) {
        gsap.fromTo(s, { scale: 0.2, rotate: 0, opacity: 1 },
          { x: dx, y: dy + (r ? 260 : 0), scale: 0.6 + Math.random() * 0.8, rotate: (Math.random() - 0.5) * 540, opacity: 0, duration: 1.4 + Math.random() * 0.9, ease: "power2.out", delay: Math.random() * (r ? 0.1 : 0.5) });
      }
    }
    setTimeout(function () { box.remove(); }, 3000);
  }

  // =======================================================
  // XP BARS, QUEST BARS, ACHIEVEMENTS (IntersectionObserver)
  // =======================================================
  function countUp(el) {
    var to = Number(el.getAttribute("data-to")) || 0;
    if (reduce) { el.textContent = to; return; }
    var t0 = performance.now();
    var dur = 1200;
    (function step(now) {
      var p = Math.min(1, (now - t0) / dur);
      el.textContent = Math.round(to * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(step);
    })(t0);
  }
  function onVisible(els, cb, threshold) {
    if (!("IntersectionObserver" in window)) { els.forEach(function (e, i) { cb(e, i); }); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { io.unobserve(en.target); cb(en.target, els.indexOf(en.target)); }
      });
    }, { threshold: threshold || 0.35 });
    els.forEach(function (e) { io.observe(e); });
  }

  onVisible($$(".xp-list"), function (list) {
    $$(".xp", list).forEach(function (x) { x.classList.add("is-filled"); countUp($(".xp__num", x)); });
  });
  onVisible($$(".quest"), function (q) { q.classList.add("is-filled"); });

  var badges = $$(".badge");
  var unlocked = 0;
  var achCount = $("#ach-count");
  function updateAchCount() { if (achCount) achCount.textContent = unlocked + " / " + badges.length + " UNLOCKED"; }
  updateAchCount();
  function unlock(b, i, quiet) {
    if (!b.classList.contains("is-locked")) return;
    b.classList.remove("is-locked");
    if (!reduce) b.classList.add("just-unlocked");
    unlocked++;
    updateAchCount();
    if (!quiet && ACH[i]) toast("ACHIEVEMENT UNLOCKED", ACH[i].title, ACH[i].icon);
  }
  var unlockQueue = 0;
  onVisible(badges, function (b, i) {
    if (reduce || !window.__started) { unlock(b, i, true); return; }
    var delay = unlockQueue++ * 380;
    setTimeout(function () { unlock(b, i); unlockQueue = Math.max(0, unlockQueue - 1); }, delay);
  }, 0.6);

  // =======================================================
  // SAVE POINT
  // =======================================================
  var saveBtn = $("#save-btn");
  var saveStatus = $("#save-status");
  var saved = false;
  function saveGame(auto) {
    if (saveBtn.classList.contains("is-saving")) return;
    saveBtn.classList.add("is-saving");
    var label = $("span", saveBtn);
    var dots = 0;
    label.textContent = "Saving";
    var timer = setInterval(function () { dots = (dots + 1) % 4; label.textContent = "Saving" + ".".repeat(dots); }, 220);
    setTimeout(function () {
      clearInterval(timer);
      saveBtn.classList.remove("is-saving");
      saveBtn.classList.add("is-saved");
      label.textContent = "Game saved";
      saveStatus.textContent = auto ? "AUTOSAVE COMPLETE · THANKS FOR VISITING!" : "GAME SAVED · THANKS FOR VISITING!";
      if (!auto) { confetti(26, saveBtn); toast("PROGRESS SAVED", "Thanks for visiting!", "save"); }
      saved = true;
    }, auto ? 900 : 1300);
  }
  saveBtn.addEventListener("click", function () { saveGame(false); });
  onVisible([$("#save")], function () { if (!saved) setTimeout(function () { if (!saved) saveGame(true); }, 700); }, 0.5);

  // =======================================================
  // HERO PHOTO: move the ink-in spotlight with the pointer
  // =======================================================
  var photo = $("#photo");
  if (photo) {
    photo.addEventListener("pointermove", function (e) {
      var r = photo.getBoundingClientRect();
      photo.style.setProperty("--mx", ((e.clientX - r.left) / r.width) * 100 + "%");
      photo.style.setProperty("--my", ((e.clientY - r.top) / r.height) * 100 + "%");
    });
    photo.addEventListener("click", function () {
      var on = photo.getAttribute("aria-pressed") !== "true";
      photo.setAttribute("aria-pressed", on ? "true" : "false");
      photo.setAttribute("aria-label", on ? "Show the photo as a pencil sketch" : "Show the photo in colour");
    });
  }

  // =======================================================
  // PENCIL CURSOR + GRAPHITE TRAIL (mouse only)
  // =======================================================
  if (finePointer && !reduce) {
    root.classList.add("has-cursor");
    var cur = $("#cursor");
    var trail = $("#trail");
    var tctx = trail.getContext("2d");
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var pts = [];
    var trailOn = false;
    var inkColor = getComputedStyle(root).getPropertyValue("--ink").trim();
    window.addEventListener("themechange", function () { inkColor = getComputedStyle(root).getPropertyValue("--ink").trim(); });
    function sizeTrail() {
      trail.width = window.innerWidth * dpr;
      trail.height = window.innerHeight * dpr;
      tctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    sizeTrail();
    window.addEventListener("resize", sizeTrail);
    function drawTrail() {
      var now = performance.now();
      while (pts.length && now - pts[0].t > 450) pts.shift();
      tctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      tctx.lineCap = "round";
      tctx.strokeStyle = inkColor;
      for (var i = 1; i < pts.length; i++) {
        var a = 1 - (now - pts[i].t) / 450;
        tctx.globalAlpha = Math.max(0, a) * 0.5;
        tctx.lineWidth = 0.6 + a * 1.6;
        tctx.beginPath();
        tctx.moveTo(pts[i - 1].x, pts[i - 1].y);
        tctx.lineTo(pts[i].x, pts[i].y);
        tctx.stroke();
      }
      tctx.globalAlpha = 1;
      if (pts.length > 1) requestAnimationFrame(drawTrail);
      else { tctx.clearRect(0, 0, window.innerWidth, window.innerHeight); trailOn = false; }
    }
    window.addEventListener("pointermove", function (e) {
      if (e.pointerType !== "mouse") return;
      cur.style.transform = "translate3d(" + (e.clientX - 2) + "px," + (e.clientY - 32) + "px,0)";
      cur.style.opacity = "1";
      pts.push({ x: e.clientX, y: e.clientY, t: performance.now() });
      if (!trailOn) { trailOn = true; requestAnimationFrame(drawTrail); }
    }, { passive: true });
    document.addEventListener("mouseleave", function () { cur.style.opacity = "0"; });
    var hoverSel = "a, button, [role='button'], summary, label, input, select, textarea";
    document.addEventListener("pointerover", function (e) { if (e.target.closest && e.target.closest(hoverSel)) cur.classList.add("is-hover"); });
    document.addEventListener("pointerout", function (e) { if (e.target.closest && e.target.closest(hoverSel)) cur.classList.remove("is-hover"); });
    window.addEventListener("cursorhover", function (e) { cur.classList.toggle("is-hover", !!e.detail); });
    window.addEventListener("pointerdown", function () { cur.classList.add("is-down"); });
    window.addEventListener("pointerup", function () { cur.classList.remove("is-down"); });
  }

  // =======================================================
  // MAGNETIC BUTTONS
  // =======================================================
  if (finePointer && !reduce && gsap) {
    $$(".magnetic").forEach(function (m) {
      var xTo = gsap.quickTo(m, "x", { duration: 0.45, ease: "power3.out" });
      var yTo = gsap.quickTo(m, "y", { duration: 0.45, ease: "power3.out" });
      m.addEventListener("pointermove", function (e) {
        var r = m.getBoundingClientRect();
        xTo((e.clientX - (r.left + r.width / 2)) * 0.28);
        yTo((e.clientY - (r.top + r.height / 2)) * 0.38);
      });
      m.addEventListener("pointerleave", function () {
        gsap.to(m, { x: 0, y: 0, duration: 0.8, ease: "elastic.out(1, 0.35)" });
      });
    });
  }

  // =======================================================
  // KONAMI CODE → INK MODE
  // =======================================================
  var code = ["arrowup", "arrowup", "arrowdown", "arrowdown", "arrowleft", "arrowright", "arrowleft", "arrowright", "b", "a"];
  var pos = 0;
  document.addEventListener("keydown", function (e) {
    var k = (e.key || "").toLowerCase();
    pos = k === code[pos] ? pos + 1 : (k === code[0] ? 1 : 0);
    if (pos === code.length) {
      pos = 0;
      var on = root.classList.toggle("ink-mode");
      toast("SECRET FOUND", on ? "Ink mode unlocked" : "Ink mode off", "pencil");
      if (on) confetti(40);
    }
  });

  // =======================================================
  // SCROLL ANIMATIONS (GSAP + ScrollTrigger)
  // =======================================================
  function setupScrollAnimations() {
    $$(".ink-divider path, .draw-line path").forEach(function (p) { p.setAttribute("pathLength", "1"); });
    if (!anim) return;

    // Ink lines draw themselves between sections
    $$(".ink-divider").forEach(function (d) {
      gsap.fromTo($("path", d), { strokeDashoffset: 1 }, {
        strokeDashoffset: 0,
        ease: "none",
        scrollTrigger: { trigger: d, start: "top 95%", end: "bottom 45%", scrub: 0.6 },
      });
    });

    // Page-turn entrance for each chapter
    $$(".section .page, .save__inner").forEach(function (pg) {
      gsap.from(pg, {
        y: 90,
        rotateX: -9,
        opacity: 0,
        transformOrigin: "50% 0%",
        transformPerspective: 1400,
        duration: 1.2,
        ease: "expo.out",
        scrollTrigger: { trigger: pg, start: "top 82%" },
      });
    });

    // Staggered pieces
    [".chips li", ".inventory__slot", ".games > li", ".achievements > li", ".quest", ".quest-steps li", ".links li"].forEach(function (sel) {
      var items = $$(sel);
      if (!items.length) return;
      gsap.from(items, {
        y: 46,
        opacity: 0,
        rotate: function (i) { return i % 2 ? 3 : -3; },
        duration: 0.8,
        ease: "back.out(1.7)",
        stagger: 0.07,
        scrollTrigger: { trigger: items[0].parentElement, start: "top 80%" },
      });
    });

    // Giant chapter numbers drift
    $$(".chapter-num").forEach(function (n) {
      gsap.to(n, { yPercent: 40, ease: "none", scrollTrigger: { trigger: n.parentElement, start: "top bottom", end: "bottom top", scrub: true } });
    });

    // Hero doodles: scroll parallax
    $$(".doodle").forEach(function (d) {
      var depth = parseFloat(d.getAttribute("data-depth")) || 0.5;
      gsap.to(d, { y: depth * -160, rotate: depth * 40, ease: "none", scrollTrigger: { trigger: "#hero", start: "top top", end: "bottom top", scrub: true } });
    });

    // Gallery heading fades as you fly in
    if (root.classList.contains("has-3d")) {
      gsap.to(".gallery__head", { opacity: 0.15, y: -30, ease: "none", scrollTrigger: { trigger: "#gallery", start: "top top", end: "+=60%", scrub: true } });
    }
  }

  // Hero doodles follow the mouse a little
  if (finePointer && !reduce && gsap) {
    var doodles = $$(".doodle").map(function (d) {
      return { depth: parseFloat(d.getAttribute("data-depth")) || 0.5, x: gsap.quickTo(d, "x", { duration: 1, ease: "power3.out" }), yo: gsap.quickTo(d, "xPercent", { duration: 1, ease: "power3.out" }) };
    });
    $("#hero").addEventListener("pointermove", function (e) {
      var nx = e.clientX / window.innerWidth - 0.5;
      var ny = e.clientY / window.innerHeight - 0.5;
      doodles.forEach(function (d) { d.x(nx * 60 * d.depth); d.yo(ny * 50 * d.depth); });
    });
  }

  function heroIntro() {
    if (!anim) return;
    var tl = gsap.timeline({ defaults: { ease: "expo.out" } });
    tl.from(".hero__line", { yPercent: 110, rotate: 5, opacity: 0, duration: 1.1, stagger: 0.12 })
      .fromTo(".hero__scribble path", { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.9, ease: "power2.inOut" }, "-=0.6")
      .from(".hero__kicker, .hero__tagline, .hero__intro, .hero__actions", { y: 26, opacity: 0, duration: 0.9, stagger: 0.08 }, "-=0.8")
      .from(".photo", { scale: 0.8, rotate: -10, opacity: 0, duration: 1.2, ease: "back.out(1.5)" }, 0.15)
      .from(".doodle", { scale: 0, opacity: 0, duration: 0.6, stagger: 0.06, ease: "back.out(2.5)" }, 0.5)
      .from(".scroll-cue", { opacity: 0, y: -10, duration: 0.6 }, 1);
  }

  // =======================================================
  // 2. LOADING + START SCREEN
  // =======================================================
  var startEl = $("#start");
  var pressBtn = $("#press-start");
  var skipBtn = $("#start-skip");
  var loadFill = $(".loadbar__fill");
  var loadBar = $(".loadbar");
  var loadPct = $("#load-pct");
  var loadLabel = $("#load-label");
  var tipEl = $("#start-tip");
  var shownPct = 0;
  var isReady = false;
  var tips = [
    "TIP: Drag the 3D gallery to fly through it.",
    "TIP: Hover the portrait to ink it in.",
    "TIP: Game cartridges flip over.",
    "TIP: Some old cheat codes still work here.",
  ];
  var visited = false;
  try { visited = sessionStorage.getItem("njr-started") === "1"; } catch (e) {}

  var outside = [$("main"), $(".site-footer"), $("#hud-bar")];
  function setInert(on) { outside.forEach(function (n) { if (n) n.inert = on; }); }

  function setProgress(p) {
    var pct = Math.round(Math.max(shownPct, Math.min(1, p)) * 100);
    shownPct = pct / 100;
    loadFill.style.setProperty("--p", shownPct);
    loadPct.textContent = pct + "%";
    loadBar.setAttribute("aria-valuenow", pct);
  }

  function ready() {
    if (isReady) return;
    isReady = true;
    setProgress(1);
    loadLabel.textContent = "READY";
    pressBtn.disabled = false;
    try { pressBtn.focus({ preventScroll: true }); } catch (e) {}
    setTimeout(startGame, visited || reduce ? 500 : 4500);
  }

  function startGame() {
    if (window.__started) return;
    window.__started = true;
    try { sessionStorage.setItem("njr-started", "1"); } catch (e) {}
    setInert(false);
    root.classList.remove("is-locked");
    if (lenis) lenis.start();
    var done = function () {
      startEl.classList.add("is-gone");
      if (ST) ST.refresh();
    };
    if (anim) {
      gsap.to(startEl, { yPercent: -104, rotate: -3, transformOrigin: "0% 100%", duration: 1.05, ease: "expo.inOut", onComplete: done });
      gsap.delayedCall(0.35, heroIntro);
    } else {
      done();
    }
    var h = $("#hero-name");
    if (h) { h.setAttribute("tabindex", "-1"); h.focus({ preventScroll: true }); }
  }

  window.__booted = true; // tells the safety net in index.html that the script is running
  if (startEl && !root.classList.contains("start-failsafe")) {
    root.classList.add("is-locked");
    setInert(true);
    if (lenis) lenis.stop();
    window.scrollTo(0, 0);

    var tipI = 0;
    var tipTimer = setInterval(function () {
      if (window.__started) { clearInterval(tipTimer); return; }
      tipI = (tipI + 1) % tips.length;
      tipEl.textContent = tips[tipI];
    }, 2200);

    pressBtn.addEventListener("click", startGame);
    skipBtn.addEventListener("click", startGame);
    startEl.addEventListener("click", function (e) { if (isReady && e.target === startEl.querySelector(".start__paper")) startGame(); });
    document.addEventListener("keydown", function (e) {
      if (window.__started) return;
      if (e.key === "Escape") startGame();
      else if (isReady && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); startGame(); }
    });

    // Draw the title once the hand-drawn font is in
    var fontsReady = document.fonts && document.fonts.load
      ? Promise.race([
          Promise.all([document.fonts.load('700 100px "Kalam"'), document.fonts.load('20px "VT323"')]),
          new Promise(function (r) { setTimeout(r, 1500); }),
        ])
      : Promise.resolve();
    fontsReady.then(function () {
      startEl.classList.add("is-drawing");
      setProgress(0.12);
    });

    var galleryLoad = window.SketchGallery
      ? window.SketchGallery.init({ onProgress: function (p) { setProgress(0.12 + 0.88 * p); } })
      : Promise.resolve();
    var minShow = new Promise(function (r) { setTimeout(r, visited || reduce ? 300 : 2600); });
    var cap = new Promise(function (r) { setTimeout(r, 9000); });

    Promise.race([Promise.all([fontsReady, galleryLoad, minShow]), cap]).then(function () {
      setupScrollAnimations();
      ready();
    });
  } else {
    // Start screen disabled (safety net) — still boot the gallery
    window.__started = true;
    if (window.SketchGallery) window.SketchGallery.init({}).then(setupScrollAnimations);
    else setupScrollAnimations();
  }
})();
