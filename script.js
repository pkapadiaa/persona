/* =========================================================
   Parth Kapadia — Portfolio interactions
   GSAP + ScrollTrigger + Lenis
   ========================================================= */

const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------- Lenis smooth scroll ---------- */
let lenis;
function initLenis() {
  if (prefersReduced || typeof Lenis === "undefined") return;
  lenis = new Lenis({ lerp: 0.09, wheelMultiplier: 1, smoothWheel: true });
  lenis.on("scroll", () => ScrollTrigger && ScrollTrigger.update());
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);

  // anchor links -> lenis
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      const id = a.getAttribute("href");
      if (id.length > 1) {
        e.preventDefault();
        lenis.scrollTo(id, { offset: 0, duration: 1.4 });
      }
    });
  });
}

/* ---------- Custom cursor ---------- */
function initCursor() {
  const ring = document.querySelector(".cursor");
  const dot = document.querySelector(".cursor-dot");
  if (!ring || window.matchMedia("(hover: none)").matches) return;

  let mx = window.innerWidth / 2, my = window.innerHeight / 2;
  let rx = mx, ry = my;

  window.addEventListener("mousemove", (e) => {
    mx = e.clientX; my = e.clientY;
    gsap.set(dot, { x: mx, y: my });
  });

  gsap.ticker.add(() => {
    rx += (mx - rx) * 0.15;
    ry += (my - ry) * 0.15;
    gsap.set(ring, { x: rx, y: ry });
  });

  document.querySelectorAll('[data-cursor="hover"]').forEach((el) => {
    el.addEventListener("mouseenter", () => ring.classList.add("is-hover"));
    el.addEventListener("mouseleave", () => ring.classList.remove("is-hover"));
  });
}

/* ---------- Preloader ---------- */
function initPreloader(done) {
  const pre = document.getElementById("preloader");
  const countEl = document.getElementById("count");
  const barEl = document.getElementById("bar");
  const labels = document.querySelectorAll(".preloader__label span");

  if (!pre) { done(); return; }

  gsap.set(labels, { yPercent: 110 });
  gsap.to(labels, { yPercent: 0, duration: 0.8, stagger: 0.1, ease: "power3.out", delay: 0.1 });

  const state = { v: 0 };
  gsap.to(state, {
    v: 100,
    duration: 1.8,
    ease: "power2.inOut",
    delay: 0.3,
    onUpdate: () => {
      const val = Math.round(state.v);
      countEl.textContent = val;
      barEl.style.width = val + "%";
    },
    onComplete: () => {
      gsap.to(pre, {
        yPercent: -100,
        duration: 1,
        ease: "power4.inOut",
        delay: 0.25,
        onComplete: () => { pre.style.display = "none"; done(); }
      });
    }
  });
}

/* ---------- Split text into lines/words ---------- */
function splitWords(el) {
  const text = el.textContent;
  el.textContent = "";
  const frag = document.createDocumentFragment();
  text.split(/(\s+)/).forEach((chunk) => {
    if (chunk.trim() === "") { frag.appendChild(document.createTextNode(chunk)); return; }
    const outer = document.createElement("span");
    outer.style.display = "inline-block";
    outer.style.overflow = "hidden";
    outer.style.verticalAlign = "top";
    const inner = document.createElement("span");
    inner.style.display = "inline-block";
    inner.className = "word-inner";
    inner.textContent = chunk;
    outer.appendChild(inner);
    frag.appendChild(outer);
  });
  el.appendChild(frag);
  return el.querySelectorAll(".word-inner");
}

/* ---------- Scroll reveals ---------- */
function initReveals() {
  // Hero title words
  document.querySelectorAll(".hero__title .word").forEach((w) => {
    gsap.from(w, { yPercent: 120, duration: 1.1, ease: "power4.out", delay: 0.1 });
  });

  // Hero desc + meta + cue
  gsap.from(".hero__desc", { y: 30, opacity: 0, duration: 1, ease: "power3.out", delay: 0.4 });
  gsap.from(".hero__meta .tag", { y: 20, opacity: 0, duration: 0.7, stagger: 0.08, ease: "power3.out", delay: 0.3 });
  gsap.from(".scroll-cue", { opacity: 0, duration: 1, delay: 0.8 });

  if (prefersReduced) return;

  // Line-based reveals (About, section titles, contact)
  document.querySelectorAll("[data-reveal-lines]").forEach((el) => {
    const words = splitWords(el);
    gsap.set(words, { yPercent: 110 });
    gsap.to(words, {
      yPercent: 0,
      duration: 0.9,
      stagger: 0.03,
      ease: "power4.out",
      scrollTrigger: { trigger: el, start: "top 88%" }
    });
  });

  // Generic fade-up reveals
  document.querySelectorAll("[data-reveal]").forEach((el) => {
    gsap.fromTo(el,
      { y: 40, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.9, ease: "power3.out",
        scrollTrigger: { trigger: el, start: "top 90%" } }
    );
  });

  // Job role words slide in
  document.querySelectorAll(".job").forEach((job) => {
    const role = job.querySelector(".job__role span");
    gsap.from(role, {
      yPercent: 110, duration: 0.9, ease: "power4.out",
      scrollTrigger: { trigger: job, start: "top 85%" }
    });
    gsap.from(job.querySelectorAll(".job__meta, .job__co, .job__desc, .job__tags"), {
      y: 24, opacity: 0, duration: 0.8, stagger: 0.06, ease: "power3.out",
      scrollTrigger: { trigger: job, start: "top 82%" }
    });
  });

  // Project cards stagger
  gsap.from(".pcard", {
    y: 60, opacity: 0, duration: 0.9, stagger: 0.12, ease: "power3.out",
    scrollTrigger: { trigger: ".pgrid", start: "top 80%" }
  });

  // Section index numbers
  gsap.utils.toArray(".section__idx").forEach((idx) => {
    gsap.from(idx, { opacity: 0, x: -20, duration: 0.8, ease: "power2.out",
      scrollTrigger: { trigger: idx, start: "top 92%" } });
  });
}

/* ---------- Marquee ---------- */
function initMarquee() {
  const tracks = document.querySelectorAll("[data-marquee]");
  if (!tracks.length || prefersReduced) return;

  const tweens = [];
  tracks.forEach((track) => {
    const dir = parseInt(track.dataset.dir || "1", 10);
    const half = track.scrollWidth / 2;
    const from = dir < 0 ? -half : 0;
    const to = dir < 0 ? 0 : -half;
    gsap.set(track, { x: from });
    tweens.push(gsap.to(track, { x: to, duration: 20, ease: "none", repeat: -1 }));
  });

  // Nudge speed with scroll velocity
  ScrollTrigger.create({
    onUpdate: (self) => {
      const v = Math.min(Math.abs(self.getVelocity()) / 400, 6);
      tweens.forEach((tw) => gsap.to(tw, { timeScale: 1 + v, duration: 0.4, overwrite: true }));
    }
  });
}

/* ---------- Card tilt ---------- */
function initTilt() {
  if (window.matchMedia("(hover: none)").matches || prefersReduced) return;
  document.querySelectorAll("[data-tilt]").forEach((card) => {
    card.addEventListener("mousemove", (e) => {
      const r = card.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      gsap.to(card, { rotateY: px * 10, rotateX: -py * 10, duration: 0.5, ease: "power2.out", transformPerspective: 800 });
    });
    card.addEventListener("mouseleave", () => {
      gsap.to(card, { rotateY: 0, rotateX: 0, duration: 0.7, ease: "elastic.out(1, 0.5)" });
    });
  });
}

/* ---------- Constellation drift background ---------- */
function initConstellation() {
  const canvas = document.getElementById("neural");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  const NAVY = "15, 26, 74";
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const running = !prefersReduced;
  const mouse = { x: -9999, y: -9999 };
  const LINK_DIST = 140;   // max distance to draw a link
  const REPEL = 110;       // cursor repel radius

  let W = 0, H = 0, nodes = [];

  function build() {
    // sparse + calm: fewer nodes than a dense neural net
    const count = Math.min(48, Math.max(16, Math.floor((W * H) / 32000)));
    nodes = [];
    for (let i = 0; i < count; i++) {
      nodes.push({
        x: Math.random() * W,
        y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.18,   // slow drift
        vy: (Math.random() - 0.5) * 0.18,
        r: Math.random() * 1.4 + 1.2
      });
    }
  }

  function resize() {
    W = window.innerWidth; H = window.innerHeight;
    canvas.width = W * dpr; canvas.height = H * dpr;
    canvas.style.width = W + "px"; canvas.style.height = H + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    build();
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);

    // update + draw nodes
    for (const n of nodes) {
      n.x += n.vx; n.y += n.vy;
      if (n.x < 0 || n.x > W) n.vx *= -1;
      if (n.y < 0 || n.y > H) n.vy *= -1;

      // gentle cursor repel
      const dx = n.x - mouse.x, dy = n.y - mouse.y;
      const dm = Math.hypot(dx, dy);
      if (dm < REPEL) {
        n.x += (dx / dm) * (REPEL - dm) * 0.02;
        n.y += (dy / dm) * (REPEL - dm) * 0.02;
      }

      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${NAVY}, 0.4)`;
      ctx.fill();
    }

    // draw sparse links
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i], b = nodes[j];
        const d = Math.hypot(a.x - b.x, a.y - b.y);
        if (d < LINK_DIST) {
          const alpha = (1 - d / LINK_DIST) * 0.14;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = `rgba(${NAVY}, ${alpha})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }
    }

    if (running) requestAnimationFrame(draw);
  }

  window.addEventListener("resize", resize);
  window.addEventListener("mousemove", (e) => { mouse.x = e.clientX; mouse.y = e.clientY; });
  window.addEventListener("mouseleave", () => { mouse.x = -9999; mouse.y = -9999; });

  resize();
  requestAnimationFrame(draw); // reduced motion -> single static frame
}

/* ---------- Nav hide on scroll down ---------- */
function initNav() {
  const nav = document.getElementById("nav");
  if (!nav) return;
  let last = 0;
  ScrollTrigger.create({
    onUpdate: (self) => {
      const y = self.scroll();
      if (y > last && y > 200) gsap.to(nav, { yPercent: -120, duration: 0.4 });
      else gsap.to(nav, { yPercent: 0, duration: 0.4 });
      last = y;
    }
  });
}

/* ---------- Boot ---------- */
function boot() {
  if (typeof gsap === "undefined") return;
  if (typeof ScrollTrigger !== "undefined") gsap.registerPlugin(ScrollTrigger);

  initCursor();
  initPreloader(() => {
    initLenis();
    initConstellation();
    initReveals();
    initMarquee();
    initTilt();
    initNav();
    ScrollTrigger && ScrollTrigger.refresh();
  });
}

document.addEventListener("DOMContentLoaded", boot);
window.addEventListener("load", () => ScrollTrigger && ScrollTrigger.refresh());
