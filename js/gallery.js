// =========================================================
// 3D SKETCH GALLERY
// ---------------------------------------------------------
// Artworks float as paper sheets in a sketchbook space.
// Scroll (or drag) to fly the camera through them, hover to
// tilt a piece, click to open it full screen.
//
// Falls back to a 2D grid when WebGL is missing, when the
// visitor prefers reduced motion, or if anything goes wrong.
// The art list comes from js/content.js (artworks).
// =========================================================
(function () {
  "use strict";

  var THREE_URL = "https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.min.js";

  var C = window.SITE_CONTENT || {};
  var ART = (C.artworks || []).filter(function (a) { return a && a.file; });
  var root = document.documentElement;
  var section = document.getElementById("gallery");
  var stage = document.getElementById("gallery-stage");
  var mount = document.getElementById("gallery-canvas");
  var grid = document.getElementById("gallery-grid");
  var indexList = document.getElementById("gallery-index");
  var countEl = document.getElementById("gallery-count");
  var nowEl = document.getElementById("gallery-now");
  var hintEl = document.getElementById("gallery-hint");

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var mobile = window.matchMedia("(max-width: 767px), (pointer: coarse)").matches;

  var api = { mode: "none", ready: false, init: init };
  window.SketchGallery = api;

  function pad(n) { return String(n).padStart(2, "0"); }
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function cssVar(name) { return getComputedStyle(root).getPropertyValue(name).trim(); }

  // ---------------------------------------------------------
  // Full-screen viewer (used by both 3D and 2D modes)
  // ---------------------------------------------------------
  var viewer = document.getElementById("viewer");
  var vImg = document.getElementById("viewer-img");
  var vTitle = document.getElementById("viewer-title");
  var vCaption = document.getElementById("viewer-caption");
  var vCount = document.getElementById("viewer-count");
  var viewIndex = 0;

  function fillViewer(i) {
    viewIndex = (i + ART.length) % ART.length;
    var a = ART[viewIndex];
    vImg.src = a.file;
    vImg.alt = a.title + ". " + (a.caption || "");
    vTitle.textContent = a.title;
    vCaption.textContent = a.caption || "";
    vCount.textContent = pad(viewIndex + 1) + " / " + pad(ART.length);
  }

  function openViewer(i) {
    fillViewer(i);
    if (!viewer.open) {
      if (typeof viewer.showModal === "function") viewer.showModal();
      else viewer.setAttribute("open", "");
      if (window.__lenis) window.__lenis.stop();
    }
  }
  api.open = openViewer;

  function closeViewer() {
    if (typeof viewer.close === "function") viewer.close();
    else viewer.removeAttribute("open");
  }

  if (viewer) {
    document.getElementById("viewer-close").addEventListener("click", closeViewer);
    document.getElementById("viewer-prev").addEventListener("click", function () { fillViewer(viewIndex - 1); });
    document.getElementById("viewer-next").addEventListener("click", function () { fillViewer(viewIndex + 1); });
    viewer.addEventListener("click", function (e) { if (e.target === viewer) closeViewer(); });
    viewer.addEventListener("keydown", function (e) {
      if (e.key === "ArrowLeft") fillViewer(viewIndex - 1);
      if (e.key === "ArrowRight") fillViewer(viewIndex + 1);
    });
    viewer.addEventListener("close", function () { if (window.__lenis) window.__lenis.start(); });
  }

  // ---------------------------------------------------------
  // 2D fallback: an animated sketch grid
  // ---------------------------------------------------------
  function buildGrid() {
    api.mode = "2d";
    root.classList.remove("has-3d");
    section.classList.add("gallery--flat");
    if (hintEl) hintEl.textContent = "CLICK A PIECE TO OPEN IT";
    grid.innerHTML = "";
    ART.forEach(function (a, i) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "art-card";
      b.setAttribute("aria-label", "Open " + a.title);
      var img = document.createElement("img");
      img.src = a.file;
      img.alt = a.title;
      img.loading = "lazy";
      img.decoding = "async";
      img.width = 400;
      img.height = 500;
      var t = document.createElement("strong");
      t.textContent = a.title;
      var s = document.createElement("span");
      s.textContent = pad(i + 1) + " / " + pad(ART.length);
      b.append(img, t, s);
      b.addEventListener("click", function () { openViewer(i); });
      grid.appendChild(b);
    });
    grid.hidden = false;

    if (window.gsap && window.ScrollTrigger && !reduce) {
      window.gsap.from(grid.children, {
        y: 70,
        opacity: 0,
        rotate: function (i) { return i % 2 ? 7 : -7; },
        duration: 0.9,
        ease: "back.out(1.6)",
        stagger: 0.08,
        scrollTrigger: { trigger: grid, start: "top 82%" },
      });
    }
  }

  function preloadImages(onProgress) {
    var done = 0;
    var first = ART.slice(0, 4);
    if (!first.length) { onProgress(1); return Promise.resolve(); }
    return Promise.all(first.map(function (a) {
      return new Promise(function (res) {
        var img = new Image();
        img.onload = img.onerror = function () { done++; onProgress(done / first.length); res(); };
        img.src = a.file;
      });
    }));
  }

  // ---------------------------------------------------------
  // Artwork index buttons (keyboard + touch friendly)
  // ---------------------------------------------------------
  var indexButtons = [];
  function buildIndex(onPick) {
    indexList.innerHTML = "";
    ART.forEach(function (a, i) {
      var li = document.createElement("li");
      var b = document.createElement("button");
      b.type = "button";
      b.textContent = pad(i + 1);
      b.setAttribute("aria-label", "Fly to " + a.title + " (press again to open)");
      b.addEventListener("click", function () { onPick(i); });
      li.appendChild(b);
      indexList.appendChild(li);
      indexButtons.push(b);
    });
  }

  function webglOK() {
    try {
      var c = document.createElement("canvas");
      return !!(window.WebGLRenderingContext && (c.getContext("webgl2") || c.getContext("webgl")));
    } catch (e) {
      return false;
    }
  }

  // ---------------------------------------------------------
  // Image -> canvas (so we can control resolution and detect
  // blocked images, e.g. when opened straight from file://)
  // ---------------------------------------------------------
  function loadImage(src) {
    return new Promise(function (res, rej) {
      var img = new Image();
      img.decoding = "async";
      img.onload = function () { res(img); };
      img.onerror = function () { rej(new Error("Could not load " + src)); };
      img.src = src;
    });
  }

  function imageToCanvas(img, maxSide) {
    var w0 = img.naturalWidth || 800;
    var h0 = img.naturalHeight || 1000;
    var s = maxSide / Math.max(w0, h0);
    var c = document.createElement("canvas");
    c.width = Math.round(w0 * s);
    c.height = Math.round(h0 * s);
    var ctx = c.getContext("2d");
    ctx.drawImage(img, 0, 0, c.width, c.height);
    ctx.getImageData(0, 0, 1, 1); // throws if the browser blocked this image for WebGL
    return c;
  }

  function missingArtCanvas(title) {
    var c = document.createElement("canvas");
    c.width = 640; c.height = 800;
    var ctx = c.getContext("2d");
    ctx.fillStyle = "#f6f0e3"; ctx.fillRect(0, 0, 640, 800);
    ctx.strokeStyle = "#262320"; ctx.lineWidth = 3; ctx.setLineDash([14, 10]);
    ctx.strokeRect(30, 30, 580, 740);
    ctx.fillStyle = "#262320"; ctx.font = "bold 40px sans-serif"; ctx.textAlign = "center";
    ctx.fillText(title || "Missing art", 320, 390);
    ctx.font = "26px monospace"; ctx.fillText("check the file path in content.js", 320, 440);
    return c;
  }

  // ---------------------------------------------------------
  // The 3D scene
  // ---------------------------------------------------------
  var three = null; // holds renderer etc. for teardown

  function init3D(onProgress) {
    return import(THREE_URL).then(function (THREE) {
      onProgress(0.35);
      var maxSide = mobile ? 768 : 1024;
      var loaded = 0;
      var jobs = ART.map(function (a) {
        return loadImage(a.file)
          .then(function (img) { return imageToCanvas(img, maxSide); }, function () { return missingArtCanvas(a.title); })
          .then(function (canvas) {
            loaded++;
            onProgress(0.35 + 0.6 * (loaded / ART.length));
            return canvas;
          });
      });
      return Promise.all(jobs).then(function (canvases) {
        buildScene(THREE, canvases);
        onProgress(1);
      });
    });
  }

  function buildScene(THREE, canvases) {
    var renderer = new THREE.WebGLRenderer({ antialias: !mobile, powerPreference: "high-performance" });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, mobile ? 1.5 : 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.domElement.setAttribute("aria-hidden", "true");
    mount.appendChild(renderer.domElement);

    var colors = readColors();
    var scene = new THREE.Scene();
    scene.background = new THREE.Color(colors.paper);
    scene.fog = new THREE.Fog(colors.paper, 4.5, mobile ? 17 : 22);

    var camera = new THREE.PerspectiveCamera(mobile ? 58 : 46, 1, 0.1, 80);
    scene.add(new THREE.AmbientLight(0xffffff, 1.7));
    var sun = new THREE.DirectionalLight(0xffffff, 1.3);
    sun.position.set(3, 6, 6);
    scene.add(sun);

    var SPACING = mobile ? 5 : 5.6;
    var SIDE = mobile ? 0.5 : 1.7;
    var DIST = mobile ? 5.2 : 5.3;
    var n = ART.length;
    var lastZ = -(n - 1) * SPACING;
    var rand = mulberry32(7);

    var inkMats = [];
    var boardMats = [];
    var shadowMats = [];
    var pickables = [];
    var frames = [];

    canvases.forEach(function (canvas, i) {
      var tex = new THREE.CanvasTexture(canvas);
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.anisotropy = Math.min(4, renderer.capabilities.getMaxAnisotropy());
      var aspect = canvas.width / canvas.height;
      var H = mobile ? 2.25 : 2.6;
      var W = H * aspect;
      if (W > 3.5) { W = 3.5; H = W / aspect; }

      var g = new THREE.Group();
      var shadowMat = new THREE.MeshBasicMaterial({ color: colors.shadow, transparent: true, opacity: 0.9 });
      var shadow = new THREE.Mesh(new THREE.PlaneGeometry(W + 0.18, H + 0.18), shadowMat);
      shadow.position.set(0.13, -0.13, -0.04);
      var boardMat = new THREE.MeshStandardMaterial({ color: colors.paper2, roughness: 1, metalness: 0 });
      var board = new THREE.Mesh(new THREE.PlaneGeometry(W + 0.18, H + 0.18), boardMat);
      board.position.z = -0.02;
      var artMat = new THREE.MeshBasicMaterial({ map: tex, toneMapped: false });
      var art = new THREE.Mesh(new THREE.PlaneGeometry(W, H), artMat);
      art.userData.index = i;

      var inkMat = new THREE.LineBasicMaterial({ color: colors.ink, transparent: true, opacity: 0.95 });
      var outline = new THREE.LineSegments(sketchRectGeometry(THREE, W + 0.18, H + 0.18, rand), inkMat);
      outline.position.z = 0.004;

      var tapeMat = new THREE.MeshBasicMaterial({ color: 0xe6d6b0, transparent: true, opacity: 0.8 });
      [-1, 1].forEach(function (sx) {
        var tape = new THREE.Mesh(new THREE.PlaneGeometry(0.62, 0.18), tapeMat);
        tape.position.set(sx * (W / 2 - 0.05), H / 2 + 0.02, 0.01);
        tape.rotation.z = sx * -0.62 + (rand() - 0.5) * 0.2;
        g.add(tape);
      });

      g.add(shadow, board, art, outline);
      var side = i % 2 === 0 ? -1 : 1;
      var baseY = -0.3 + ((i % 3) - 1) * 0.2;
      g.position.set(side * SIDE, baseY, -i * SPACING);
      var baseRotY = -side * (mobile ? 0.1 : 0.3);
      var baseRotZ = (rand() - 0.5) * 0.07;
      g.rotation.set(0, baseRotY, baseRotZ);
      g.userData = { baseY: baseY, baseRotY: baseRotY, baseRotZ: baseRotZ, hover: 0, tx: 0, ty: 0, phase: rand() * 6 };
      scene.add(g);

      frames.push(g);
      pickables.push(art);
      inkMats.push(inkMat);
      boardMats.push(boardMat);
      shadowMats.push(shadowMat);
    });

    // Ruled notebook floor
    var floorPts = [];
    for (var z = DIST + 6; z > lastZ - 14; z -= 0.9) floorPts.push(-14, -2.2, z, 14, -2.2, z);
    var floorGeo = new THREE.BufferGeometry();
    floorGeo.setAttribute("position", new THREE.Float32BufferAttribute(floorPts, 3));
    var floorMat = new THREE.LineBasicMaterial({ color: colors.ink, transparent: true, opacity: 0.14 });
    scene.add(new THREE.LineSegments(floorGeo, floorMat));
    var marginGeo = new THREE.BufferGeometry();
    marginGeo.setAttribute("position", new THREE.Float32BufferAttribute([-4.6, -2.19, DIST + 6, -4.6, -2.19, lastZ - 14], 3));
    scene.add(new THREE.Line(marginGeo, new THREE.LineBasicMaterial({ color: 0xde5c50, transparent: true, opacity: 0.45 })));

    // Floating doodles (stars, spirals, scribbles) drawn in ink
    var doodles = [];
    var doodleMat = new THREE.LineBasicMaterial({ color: colors.ink, transparent: true, opacity: 0.5 });
    var accentMat = new THREE.LineBasicMaterial({ color: colors.accent, transparent: true, opacity: 0.85 });
    var doodleCount = mobile ? 8 : 16;
    for (var d = 0; d < doodleCount; d++) {
      var kind = d % 3;
      var geo = new THREE.BufferGeometry().setFromPoints(doodlePoints(THREE, kind, rand));
      var line = new THREE.Line(geo, d % 4 === 0 ? accentMat : doodleMat);
      var sx = rand() < 0.5 ? -1 : 1;
      line.position.set(sx * (3.4 + rand() * 3), -1 + rand() * 3.6, DIST - rand() * (DIST - lastZ + 6));
      line.scale.setScalar(0.25 + rand() * 0.35);
      line.userData.spin = (rand() - 0.5) * 0.6;
      scene.add(line);
      doodles.push(line);
    }

    // Graphite dust
    var dustCount = mobile ? 380 : 1100;
    var dustPos = new Float32Array(dustCount * 3);
    for (var p = 0; p < dustCount; p++) {
      dustPos[p * 3] = (rand() - 0.5) * 14;
      dustPos[p * 3 + 1] = -2 + rand() * 6;
      dustPos[p * 3 + 2] = DIST + 4 - rand() * (DIST - lastZ + 10);
    }
    var dustGeo = new THREE.BufferGeometry();
    dustGeo.setAttribute("position", new THREE.BufferAttribute(dustPos, 3));
    var dustMat = new THREE.PointsMaterial({
      color: colors.ink,
      size: mobile ? 0.05 : 0.04,
      map: dotTexture(THREE),
      transparent: true,
      opacity: 0.55,
      depthWrite: false,
    });
    var dust = new THREE.Points(dustGeo, dustMat);
    scene.add(dust);

    // ---------- interaction state ----------
    var target = 0;      // camera position along the path (in frames)
    var current = 0;
    var pointer = new THREE.Vector2(0, 0);
    var pointerNdc = new THREE.Vector2(9, 9);
    var raycaster = new THREE.Raycaster();
    var hovered = -1;
    var shown = -1;
    var drag = null;
    var clock = new THREE.Clock();

    function scrollProgress() {
      var rect = section.getBoundingClientRect();
      var total = section.offsetHeight - window.innerHeight;
      return total > 0 ? clamp(-rect.top / total, 0, 1) : 0;
    }
    function scrollYForIndex(i) {
      var rect = section.getBoundingClientRect();
      var total = section.offsetHeight - window.innerHeight;
      var frac = n > 1 ? i / (n - 1) : 0;
      return window.scrollY + rect.top + frac * total + 2;
    }
    function goTo(i) {
      var y = scrollYForIndex(i);
      if (window.__scrollTo) window.__scrollTo(y); else window.scrollTo(0, y);
    }

    buildIndex(function (i) {
      if (Math.round(current) === i && Math.abs(current - i) < 0.08) openViewer(i);
      else goTo(i);
    });
    if (hintEl && mobile) hintEl.textContent = "SCROLL OR SWIPE SIDEWAYS · TAP A PIECE";

    function setShown(i) {
      if (i === shown) return;
      shown = i;
      countEl.textContent = pad(i + 1) + " / " + pad(n);
      nowEl.textContent = ART[i].title;
      indexButtons.forEach(function (b, k) { b.setAttribute("aria-current", k === i ? "true" : "false"); });
    }

    function pick(clientX, clientY) {
      var r = renderer.domElement.getBoundingClientRect();
      pointerNdc.set(((clientX - r.left) / r.width) * 2 - 1, -((clientY - r.top) / r.height) * 2 + 1);
      raycaster.setFromCamera(pointerNdc, camera);
      var hit = raycaster.intersectObjects(pickables, false)[0];
      return hit || null;
    }

    var el = renderer.domElement;
    el.addEventListener("pointermove", function (e) {
      var r = el.getBoundingClientRect();
      pointer.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
      if (drag) {
        var dx = e.clientX - drag.x;
        var dy = e.clientY - drag.y;
        drag.moved += Math.abs(dx) + Math.abs(dy);
        drag.x = e.clientX;
        drag.y = e.clientY;
        var delta = -dx * 2.4 + (e.pointerType === "mouse" ? -dy * 1.6 : 0);
        if (window.__scrollBy) window.__scrollBy(delta); else window.scrollBy(0, delta);
      }
      if (e.pointerType === "mouse") {
        var hit = pick(e.clientX, e.clientY);
        var idx = hit ? hit.object.userData.index : -1;
        if (hit) {
          frames[idx].userData.tx = -(hit.uv.y - 0.5) * 0.35;
          frames[idx].userData.ty = (hit.uv.x - 0.5) * 0.5;
        }
        if (idx !== hovered) {
          hovered = idx;
          window.dispatchEvent(new CustomEvent("cursorhover", { detail: hovered >= 0 }));
        }
      }
    });
    el.addEventListener("pointerdown", function (e) {
      drag = { x: e.clientX, y: e.clientY, moved: 0 };
      if (e.pointerType === "mouse") el.setPointerCapture(e.pointerId);
    });
    function endDrag(e) {
      if (!drag) return;
      var wasClick = drag.moved < 8;
      drag = null;
      if (wasClick && e.type === "pointerup") {
        var hit = pick(e.clientX, e.clientY);
        if (hit) openViewer(hit.object.userData.index);
      }
    }
    el.addEventListener("pointerup", endDrag);
    el.addEventListener("pointercancel", endDrag);
    el.addEventListener("pointerleave", function () {
      pointer.set(0, 0);
      if (hovered !== -1) {
        hovered = -1;
        window.dispatchEvent(new CustomEvent("cursorhover", { detail: false }));
      }
    });

    // ---------- render loop ----------
    function frameX(t) {
      var i0 = Math.floor(t), i1 = Math.min(n - 1, i0 + 1);
      var f = t - i0;
      var s = (1 - Math.cos(f * Math.PI)) / 2;
      var x0 = frames[clamp(i0, 0, n - 1)].position.x, x1 = frames[i1].position.x;
      return x0 + (x1 - x0) * s;
    }

    var lookTarget = new THREE.Vector3();
    function tick() {
      var dt = Math.min(clock.getDelta(), 0.05);
      var time = clock.elapsedTime;
      target = scrollProgress() * (n - 1);
      current += (target - current) * (1 - Math.exp(-dt * 5));

      var fx = frameX(current);
      camera.position.set(fx * 0.42 + pointer.x * 0.3, 0.15 + pointer.y * 0.18, -current * SPACING + DIST);
      lookTarget.set(fx * 0.75, -0.1, -current * SPACING - 1.2);
      camera.lookAt(lookTarget);

      for (var k = 0; k < n; k++) {
        var g = frames[k];
        var u = g.userData;
        var h = k === hovered ? 1 : 0;
        u.hover += (h - u.hover) * (1 - Math.exp(-dt * 10));
        if (!h) { u.tx *= 0.9; u.ty *= 0.9; }
        g.rotation.x += ((u.tx * u.hover) - g.rotation.x) * 0.15;
        g.rotation.y += ((u.baseRotY + u.ty * u.hover) - g.rotation.y) * 0.15;
        g.rotation.z = u.baseRotZ + Math.sin(time * 0.6 + u.phase) * 0.012;
        g.position.y = u.baseY + Math.sin(time * 0.8 + u.phase) * 0.05;
        g.scale.setScalar(1 + u.hover * 0.05);
      }
      for (var q = 0; q < doodles.length; q++) {
        doodles[q].rotation.z += doodles[q].userData.spin * dt;
        doodles[q].rotation.y += doodles[q].userData.spin * dt * 0.5;
      }
      dust.position.y = Math.sin(time * 0.25) * 0.18;
      dust.rotation.y = Math.sin(time * 0.05) * 0.04;

      setShown(clamp(Math.round(current), 0, n - 1));
      renderer.render(scene, camera);
    }

    function resize() {
      var w = stage.clientWidth || window.innerWidth;
      var h = stage.clientHeight || window.innerHeight;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    }
    resize();
    if ("ResizeObserver" in window) new ResizeObserver(resize).observe(stage);
    else window.addEventListener("resize", resize);

    var running = false;
    var visible = true;
    function setRunning(on) {
      if (on === running) return;
      running = on;
      if (on) clock.getDelta();
      renderer.setAnimationLoop(on ? tick : null);
    }
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (entries) {
        visible = entries[0].isIntersecting;
        setRunning(visible && !document.hidden);
      }, { rootMargin: "100px 0px" }).observe(section);
    }
    document.addEventListener("visibilitychange", function () { setRunning(visible && !document.hidden); });

    window.addEventListener("themechange", function () {
      var c = readColors();
      scene.background.set(c.paper);
      scene.fog.color.set(c.paper);
      inkMats.forEach(function (m) { m.color.set(c.ink); });
      boardMats.forEach(function (m) { m.color.set(c.paper2); });
      shadowMats.forEach(function (m) { m.color.set(c.shadow); });
      floorMat.color.set(c.ink);
      doodleMat.color.set(c.ink);
      accentMat.color.set(c.accent);
      dustMat.color.set(c.ink);
      if (!running) tick();
    });

    tick();
    setRunning(true);
    three = { renderer: renderer };
    api.mode = "3d";
  }

  function readColors() {
    return {
      paper: cssVar("--paper") || "#f4eee1",
      paper2: cssVar("--paper-2") || "#fbf7ee",
      ink: cssVar("--ink") || "#1c1a17",
      shadow: cssVar("--shadow") || "#1c1a17",
      accent: cssVar("--accent") || "#ff5a1f",
    };
  }

  // Hand-drawn rectangle: each edge drawn twice with a little wobble
  function sketchRectGeometry(THREE, w, h, rand) {
    var hw = w / 2, hh = h / 2;
    var corners = [[-hw, -hh], [hw, -hh], [hw, hh], [-hw, hh]];
    var pts = [];
    for (var pass = 0; pass < 2; pass++) {
      for (var i = 0; i < 4; i++) {
        var a = corners[i], b = corners[(i + 1) % 4];
        var steps = 6;
        var j = 0.018;
        var prev = null;
        for (var s = 0; s <= steps; s++) {
          var t = s / steps;
          var x = a[0] + (b[0] - a[0]) * t + (rand() - 0.5) * j;
          var y = a[1] + (b[1] - a[1]) * t + (rand() - 0.5) * j;
          if (s === 0) { x += (rand() - 0.5) * 0.08; y += (rand() - 0.5) * 0.08; }
          if (s === steps) { x += (rand() - 0.5) * 0.1; y += (rand() - 0.5) * 0.1; }
          if (prev) pts.push(prev[0], prev[1], 0, x, y, 0);
          prev = [x, y];
        }
      }
    }
    var geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute(pts, 3));
    return geo;
  }

  function doodlePoints(THREE, kind, rand) {
    var pts = [];
    var i;
    if (kind === 0) { // star
      for (i = 0; i <= 10; i++) {
        var r = i % 2 === 0 ? 1 : 0.45;
        var a = (i / 10) * Math.PI * 2 - Math.PI / 2;
        pts.push(new THREE.Vector3(Math.cos(a) * r + (rand() - 0.5) * 0.06, Math.sin(a) * r + (rand() - 0.5) * 0.06, 0));
      }
    } else if (kind === 1) { // spiral
      for (i = 0; i < 60; i++) {
        var t = i / 60;
        var ang = t * Math.PI * 6;
        pts.push(new THREE.Vector3(Math.cos(ang) * t * 1.1, Math.sin(ang) * t * 1.1, 0));
      }
    } else { // scribble loop
      for (i = 0; i < 50; i++) {
        var u = i / 49;
        pts.push(new THREE.Vector3(u * 2.4 - 1.2 + Math.cos(u * 30) * 0.18, Math.sin(u * 30) * 0.3 + Math.sin(u * 5) * 0.2, 0));
      }
    }
    return pts;
  }

  function dotTexture(THREE) {
    var c = document.createElement("canvas");
    c.width = c.height = 64;
    var ctx = c.getContext("2d");
    var g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    g.addColorStop(0, "rgba(255,255,255,1)");
    g.addColorStop(0.5, "rgba(255,255,255,0.6)");
    g.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 64, 64);
    var t = new THREE.CanvasTexture(c);
    return t;
  }

  function mulberry32(a) {
    return function () {
      a |= 0; a = (a + 0x6d2b79f5) | 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function teardown3D() {
    root.classList.remove("has-3d");
    if (three && three.renderer) {
      three.renderer.setAnimationLoop(null);
      three.renderer.dispose();
    }
    mount.innerHTML = "";
    indexList.innerHTML = "";
    indexButtons = [];
  }

  // ---------------------------------------------------------
  // Public: called by main.js during the loading screen
  // ---------------------------------------------------------
  function init(opts) {
    var onProgress = (opts && opts.onProgress) || function () {};
    if (!section) return Promise.resolve();
    if (!ART.length) { section.hidden = true; onProgress(1); return Promise.resolve(); }
    if (reduce || !webglOK()) {
      buildGrid();
      return preloadImages(onProgress).then(function () { api.ready = true; });
    }
    root.classList.add("has-3d");
    return init3D(onProgress).then(
      function () { api.ready = true; },
      function (err) {
        console.warn("[gallery] 3D gallery unavailable, showing the 2D grid instead.", err && err.message);
        teardown3D();
        buildGrid();
        onProgress(1);
        api.ready = true;
      }
    );
  }
})();
