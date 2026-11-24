/* Tidescape — GSAP + ScrollTrigger + SplitText + Lenis */
gsap.registerPlugin(ScrollTrigger, SplitText);

/* ---------- smooth scroll (Lenis driven by GSAP ticker) ---------- */
const lenis = new Lenis({ lerp: 0.09, smoothWheel: true });
lenis.on("scroll", ScrollTrigger.update);
gsap.ticker.add((t) => lenis.raf(t * 1000));
gsap.ticker.lagSmoothing(0);

document.querySelectorAll('a[href^="#"]').forEach((a) =>
  a.addEventListener("click", (e) => {
    const id = a.getAttribute("href");
    if (id.length > 1 && document.querySelector(id)) {
      e.preventDefault();
      lenis.scrollTo(id, { offset: 0, duration: 1.6 });
    }
  })
);

/* ---------- footer curtain reveal ---------- */
const page = document.getElementById("page");
const footer = document.getElementById("footer");
const setFooterSpace = () => (page.style.marginBottom = footer.offsetHeight + "px");
setFooterSpace();
window.addEventListener("resize", setFooterSpace);
gsap.from(".footer__inner", {
  yPercent: -30, opacity: 0.4, ease: "none",
  scrollTrigger: { trigger: page, start: "bottom bottom", end: () => "+=" + footer.offsetHeight, scrub: true },
});

/* ---------- nav hide / show ---------- */
const nav = document.getElementById("nav");
let lastY = 0;
lenis.on("scroll", ({ scroll }) => {
  nav.classList.toggle("is-hidden", scroll > lastY && scroll > 120);
  nav.classList.toggle("is-solid", scroll > window.innerHeight * 0.6);
  lastY = scroll;
});

/* ---------- reusable: split heading line reveal ---------- */
document.fonts.ready.then(() => {
  document.querySelectorAll(".split").forEach((el) => {
    const split = SplitText.create(el, { type: "lines", mask: "lines", linesClass: "line" });
    gsap.from(split.lines, {
      yPercent: 110, duration: 1.1, ease: "expo.out", stagger: 0.09,
      scrollTrigger: { trigger: el, start: "top 85%" },
    });
  });
  ScrollTrigger.refresh();
});

gsap.utils.toArray(".fade-up").forEach((el) =>
  gsap.from(el, { y: 30, opacity: 0, duration: 1, ease: "power3.out", scrollTrigger: { trigger: el, start: "top 90%" } })
);

/* ---------- HERO: intro ---------- */
const heroLetters = gsap.utils.toArray(".hero__title span");
const heroImgs = gsap.utils.toArray(".hero__img");
gsap.set(heroImgs, { rotate: (i) => [-8, 13, -15, 9][i] });

/* Intro and scroll-scatter must never animate the SAME element, otherwise the
   scroll timeline records the intro's hidden state and scrolling back to the top
   shows an empty hero. So: intro → inner wrappers, scroll → outer elements. */
heroLetters.forEach((l) => (l.innerHTML = `<i class="hero__ch">${l.textContent}</i>`));
heroImgs.forEach((f) => {
  const w = document.createElement("div");
  w.className = "hero__img-in";
  w.append(...f.childNodes);
  f.append(w);
});
const heroSub = document.querySelector(".hero__sub");
heroSub.innerHTML = `<span class="hero__sub-in">${heroSub.innerHTML}</span>`;

const intro = gsap.timeline({ defaults: { ease: "expo.out" } });
intro
  .from(".nav > *", { y: -30, opacity: 0, duration: 1, stagger: 0.08 })
  .from(".hero__ch", { yPercent: 120, opacity: 0, duration: 1.4, stagger: 0.06 }, 0.1)
  .from(".hero__img-in", { scale: 0, rotate: -14, opacity: 0, duration: 1.2, stagger: 0.12, ease: "back.out(1.6)" }, 0.7)
  .from([".hero__sub-in", ".hero__lotus use"], { y: 20, opacity: 0, duration: 1, stagger: 0.1 }, 1.1);

/* hero image hover drift with mouse */
const hero = document.querySelector(".hero__pin");
hero.addEventListener("mousemove", (e) => {
  const rx = e.clientX / innerWidth - 0.5, ry = e.clientY / innerHeight - 0.5;
  heroImgs.forEach((img, i) => {
    const d = (i + 1) * 6;
    gsap.to(img.querySelector("img"), { x: rx * d, y: ry * d, scale: 1.08, duration: 1.2, ease: "power3.out", overwrite: "auto" });
  });
});

/* ---------- helper: scroll-scrubbed <video data-src> ----------
   Loads the file into memory as a blob (instant seeks, works without HTTP range support),
   then returns setProgress(0..1); an eased ticker follows the target for buttery scrubbing. */
function scrubVideo(video) {
  if (video._scrub) return video._scrub; // matchMedia may re-run: reuse, don't reload
  let target = 0, current = 0, ready = false;
  fetch(video.dataset.src)
    .then((r) => { if (!r.ok) throw 0; return r.blob(); })
    .then((b) => (video.src = URL.createObjectURL(b)))
    .catch(() => (video.src = video.dataset.src));
  video.addEventListener("loadedmetadata", () => { video.pause(); video.currentTime = 0.001; ready = true; });
  gsap.ticker.add(() => {
    if (!ready || video.seeking) return;
    current += (target - current) * 0.15;
    const t = current * (video.duration - 0.02);
    if (Math.abs(video.currentTime - t) > 1 / 60) video.currentTime = t;
  });
  return (video._scrub = (p) => (target = p));
}

const mm = gsap.matchMedia();

mm.add({ desktop: "(min-width: 901px)", mobile: "(max-width: 900px)", reduce: "(prefers-reduced-motion: reduce)" }, (ctx) => {
  const { desktop, reduce } = ctx.conditions;
  if (reduce) return;

  /* ---------- HERO: scroll scatter ---------- */
  const scatter = [
    { x: "-18vw", y: "-60vh", rotate: -35 },
    { x: "22vw", y: "-65vh", rotate: 40 },
    { x: "-30vw", y: "40vh", rotate: -45 },
    { x: "30vw", y: "50vh", rotate: 30 },
  ];
  const heroTl = gsap.timeline({
    scrollTrigger: { trigger: ".hero", start: "top top", end: "+=90%", scrub: 1, pin: ".hero__pin" },
  });
  heroImgs.forEach((img, i) => heroTl.to(img, { ...scatter[i], opacity: 0, ease: "power2.in" }, 0));
  heroTl
    .to(heroLetters, { yPercent: -30, opacity: 0, stagger: { each: 0.03, from: "center" }, ease: "power2.in" }, 0.15)
    .to(".hero__sub", { opacity: 0, y: -40 }, 0)
    .to(".hero__lotus", { y: 80, scale: 1.4 }, 0);

  /* ---------- WELCOME lotus spin-in ---------- */
  gsap.from(".welcome__lotus", {
    scale: 0, rotate: -90, duration: 1.4, ease: "back.out(2)",
    scrollTrigger: { trigger: ".welcome", start: "top 80%" },
  });

  /* ---------- WIDE image: inset expands + parallax ---------- */
  gsap.to(".wide__frame", {
    clipPath: "inset(0 0% 0 0%)", ease: "none",
    scrollTrigger: { trigger: ".wide", start: "top bottom", end: "top top", scrub: true },
  });
  gsap.to(".wide__frame video", {
    yPercent: 10, ease: "none",
    scrollTrigger: { trigger: ".wide", start: "top bottom", end: "bottom top", scrub: true },
  });
  // cave fly-through plays forward/backward with scroll while the section crosses the screen
  const wideScrub = scrubVideo(document.getElementById("wideVideo"));
  ScrollTrigger.create({
    trigger: ".wide", start: "top bottom", end: "bottom top",
    onUpdate: (self) => wideScrub(self.progress),
  });

  /* ---------- SUITES: pinned crossfade ---------- */
  if (desktop) {
    const suites = gsap.utils.toArray(".suite");
    const bigs = gsap.utils.toArray(".suite__big");
    const sTl = gsap.timeline({
      scrollTrigger: { trigger: ".suites__pin", start: "top top", end: "+=" + suites.length * 90 + "%", scrub: 1, pin: true },
    });
    sTl.to(".suites__rule i", { scaleY: 1, ease: "none", duration: suites.length }, 0);
    suites.forEach((s, i) => {
      if (i === 0) return;
      const at = i - 0.35;
      sTl
        .to(suites[i - 1], { autoAlpha: 0, y: -40, duration: 0.3, ease: "power2.in" }, at)
        .fromTo(s, { autoAlpha: 0, y: 40 }, { autoAlpha: 1, y: 0, duration: 0.35, ease: "power2.out" }, at + 0.25)
        .fromTo(bigs[i], { clipPath: "inset(100% 0 0 0)" }, { clipPath: "inset(0% 0 0 0)", duration: 0.6, ease: "power3.inOut" }, at)
        .fromTo(bigs[i].querySelector("img"), { scale: 1.3 }, { scale: 1, duration: 0.6, ease: "power3.out" }, at)
        .to(bigs[i - 1].querySelector("img"), { scale: 1.1, yPercent: -8, duration: 0.6 }, at);
    });
  }

  /* ---------- EXPERIENCES: staggered rise + speed parallax ---------- */
  gsap.from(".exp__card", {
    y: 120, opacity: 0, duration: 1.2, stagger: 0.12, ease: "expo.out",
    scrollTrigger: { trigger: ".exp__row", start: "top 85%" },
  });
  gsap.utils.toArray(".exp__card").forEach((card) => {
    const sp = parseFloat(card.dataset.speed || 1);
    gsap.to(card, {
      y: (1 - sp) * 260, ease: "none",
      scrollTrigger: { trigger: ".exp", start: "top bottom", end: "bottom top", scrub: true },
    });
    gsap.fromTo(card.querySelector("img"), { scale: 1.25 }, {
      scale: 1, ease: "none",
      scrollTrigger: { trigger: card, start: "top bottom", end: "bottom top", scrub: true },
    });
  });

  /* ---------- STAY BLISS: small frame grows to fullscreen ---------- */
  const blissVideo = document.getElementById("blissVideo");
  const blissScrub = { t: 0 };
  const seekBliss = () => {
    const d = blissVideo.duration;
    if (!d || blissVideo.seeking) return;
    const target = blissScrub.t * (d - 0.02);
    if (Math.abs(blissVideo.currentTime - target) > 1 / 120) blissVideo.currentTime = target;
  };
  // load into memory as a blob: instant seeking, and works even on servers without HTTP range support
  if (!blissVideo.src) fetch(blissVideo.dataset.src)
    .then((r) => { if (!r.ok) throw 0; return r.blob(); })
    .then((b) => (blissVideo.src = URL.createObjectURL(b)))
    .catch(() => (blissVideo.src = blissVideo.dataset.src));
  blissVideo.addEventListener("loadedmetadata", () => { blissVideo.pause(); blissVideo.currentTime = 0.001; seekBliss(); });
  blissVideo.addEventListener("seeked", seekBliss); // catch up if scroll moved during a seek
  const bTl = gsap.timeline({
    scrollTrigger: { trigger: ".bliss", start: "top top", end: "+=160%", scrub: 1, pin: ".bliss__pin" },
  });
  bTl
    .from(".bliss__media", { scale: 0, duration: 0.3, ease: "power2.out" }, 0)
    .to(".bliss__text h2:first-child", { yPercent: -120, opacity: 0, duration: 0.4 }, 0.25)
    .to(".bliss__text h2:last-child", { yPercent: 120, opacity: 0, duration: 0.4 }, 0.25)
    .to(".bliss__media", { width: "100%", height: "100%", duration: 0.8, ease: "power2.inOut" }, 0.3)
    .to(".bliss__media video", { scale: 1, duration: 0.8, ease: "power2.inOut" }, 0.3)
    // swimmer video scrubs with the pin: camera rises as the frame grows to fullscreen
    .to(blissScrub, { t: 1, duration: 1.4, ease: "none", onUpdate: seekBliss }, 0)
    .to({}, { duration: 0.3 });

  /* ---------- COMFORT rows ---------- */
  gsap.utils.toArray(".comfort__row").forEach((row, i) => {
    const dir = i % 2 ? 1 : -1;
    gsap.fromTo(row.querySelector("figure"),
      { rotate: 8 * dir, scale: 0.8, clipPath: "inset(15% 15% 15% 15%)" },
      { rotate: 0, scale: 1, clipPath: "inset(0% 0% 0% 0%)", ease: "none",
        scrollTrigger: { trigger: row, start: "top 95%", end: "center 55%", scrub: true } });
    gsap.from([row.querySelector("h3"), row.querySelector("p")], {
      y: 40, opacity: 0, duration: 1, stagger: 0.1, ease: "power3.out",
      scrollTrigger: { trigger: row, start: "top 75%" },
    });
  });

  /* ---------- TESTIMONIAL entrance ---------- */
  gsap.from(".testi__photo", {
    clipPath: "inset(100% 0 0 0)", duration: 1.4, ease: "expo.inOut",
    scrollTrigger: { trigger: ".testi__grid", start: "top 80%" },
  });
  gsap.from(".testi__thumbs button", {
    y: 40, opacity: 0, stagger: 0.08, duration: 0.9, ease: "power3.out",
    scrollTrigger: { trigger: ".testi__thumbs", start: "top 95%" },
  });

  /* ---------- GALLERY entrance ---------- */
  gsap.fromTo(".gallery__track-wrap", { scale: 0.78, y: 80 }, {
    scale: 1, y: 0, ease: "none",
    scrollTrigger: { trigger: ".gallery", start: "top 80%", end: "center center", scrub: true },
  });

  /* ---------- CTA: collage spreads to corners ---------- */
  const v = (n) => (innerWidth * n) / 100;
  const h = (n) => (innerHeight * n) / 100;
  const collage = {
    tl: [-7.5, -8.5], tr: [6.5, -7], bl: [-6.5, 7], br: [7.5, 8],
  };
  const corners = desktop
    ? { tl: [-36, -28], tr: [36, -30], bl: [-34, 27], br: [36, 26] }
    : { tl: [-30, -32], tr: [30, -30], bl: [-30, 30], br: [30, 32] };
  const cTl = gsap.timeline({
    scrollTrigger: { trigger: ".cta", start: "top top", end: "+=120%", scrub: 1, pin: ".cta__pin" },
  });
  ["tl", "tr", "bl", "br"].forEach((k, i) => {
    const el = `.cta__img--${k}`;
    gsap.set(el, { xPercent: -50, yPercent: -50, x: () => v(collage[k][0]), y: () => v(collage[k][1]), rotate: (i % 2 ? 4 : -4) });
    cTl.to(el, {
      x: () => v(corners[k][0]), y: () => h(corners[k][1]), rotate: 0, ease: "power3.inOut", duration: 1,
    }, 0);
  });
  cTl
    .from(".cta__text > *", { y: 40, opacity: 0, stagger: 0.12, duration: 0.5, ease: "power2.out" }, 0.55)
    .to({}, { duration: 0.3 });

  return () => {};
});

/* ---------- TESTIMONIAL switcher ---------- */
const testimonials = [
  { img: "guest-1-carter", name: "Carter", meta: "Dec 2025 | Oceanview suite",
    quote: "“Tidescape is truly magical. We watched waves from the infinity pool. The seamless blend of luxury and natural beauty is perfect. Special thanks to the team for their exceptional service. We are already planning our next visit.”" },
  { img: "guest-2-sophia", name: "Sophia", meta: "Oct 2025 | Sunset retreat",
    quote: "“Every evening felt like a painting. The sunset terrace, the quiet service and the scent of the sea made this the most romantic trip we have ever taken.”" },
  { img: "guest-3-daniel", name: "Daniel", meta: "Aug 2025 | Beachfront villa",
    quote: "“Waking up with the sea at our door was unreal. The plunge pool, the breakfast on the deck and the snorkeling trips — perfect from start to finish.”" },
  { img: "guest-4-elena", name: "Elena", meta: "Jun 2025 | Oceanview suite",
    quote: "“The spa rituals and the oceanfront dining were a highlight. Calm, elegant and genuinely warm — Tidescape set a new standard for us.”" },
];
const tImg = document.getElementById("testiImg");
const tFields = ["#testiQuote", "#testiName", "#testiMeta"];
document.querySelectorAll(".testi__thumbs button").forEach((btn) =>
  btn.addEventListener("click", () => {
    if (btn.classList.contains("is-active")) return;
    document.querySelector(".testi__thumbs .is-active").classList.remove("is-active");
    btn.classList.add("is-active");
    const d = testimonials[+btn.dataset.i];
    gsap.timeline()
      .to([tImg, ...tFields], { opacity: 0, y: -14, duration: 0.35, stagger: 0.04, ease: "power2.in" })
      .add(() => {
        tImg.src = `images/${d.img}.jpg`;
        document.querySelector("#testiQuote").textContent = d.quote;
        document.querySelector("#testiName").textContent = d.name;
        document.querySelector("#testiMeta").textContent = d.meta;
      })
      .fromTo([tImg, ...tFields], { y: 14 }, { opacity: 1, y: 0, duration: 0.6, stagger: 0.05, ease: "power3.out" });
  })
);

/* ---------- GALLERY carousel ---------- */
const track = document.getElementById("galleryTrack");
const slides = [...track.children];
let gIndex = 1;
const gMove = (instant) => {
  const w = slides[0].offsetWidth;
  const gap = parseFloat(getComputedStyle(track).gap) || 0;
  const x = -(gIndex * (w + gap)) + (innerWidth - w) / 2;
  gsap.to(track, { x, duration: instant ? 0 : 1.1, ease: "expo.inOut" });
  slides.forEach((s, i) =>
    gsap.to(s, { scale: i === gIndex ? 1 : 0.88, opacity: i === gIndex ? 1 : 0.7, duration: instant ? 0 : 1.1, ease: "expo.inOut" })
  );
};
document.querySelector(".gallery__btn--next").addEventListener("click", () => { gIndex = (gIndex + 1) % slides.length; gMove(); });
document.querySelector(".gallery__btn--prev").addEventListener("click", () => { gIndex = (gIndex - 1 + slides.length) % slides.length; gMove(); });
window.addEventListener("resize", () => gMove(true));
gMove(true);

/* ---------- BACKGROUND VIDEO: scrubbed by whole-page scroll ---------- */
const bgWrap = document.getElementById("bgvid");
const bgVideo = document.getElementById("bgVideo");
const bgVeil = document.getElementById("bgVeil");
const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
const bgSrc = matchMedia("(max-width: 900px)").matches ? "videos/bg-mobile.mp4" : "videos/bg.mp4";
let bgReady = false, bgTarget = 0, bgCurrent = 0;

// load fully into memory as a blob so every seek is instant
fetch(bgSrc)
  .then((r) => { if (!r.ok) throw 0; return r.blob(); })
  .then((b) => (bgVideo.src = URL.createObjectURL(b)))
  .catch(() => (bgVideo.src = bgSrc));
bgVideo.addEventListener("loadedmetadata", () => {
  bgVideo.pause();
  bgVideo.currentTime = 0.001; // force Chrome to paint a real frame instead of the poster
  bgReady = true;
});

// 0 → 1 over the page; ends exactly when the footer starts to reveal
ScrollTrigger.create({
  trigger: page, start: "top top", end: "bottom bottom",
  onUpdate: (self) => (bgTarget = self.progress),
});

gsap.ticker.add(() => {
  // clip the fixed video so the footer curtain-reveal shows underneath
  const b = page.getBoundingClientRect().bottom;
  bgWrap.style.clipPath = b < innerHeight ? `inset(0 0 ${Math.max(0, innerHeight - b)}px 0)` : "";

  if (!bgReady || reduceMotion) return;
  bgCurrent += (bgTarget - bgCurrent) * 0.1; // eased follow = buttery scrub
  const t = bgCurrent * (bgVideo.duration - 0.05);
  if (!bgVideo.seeking && Math.abs(bgVideo.currentTime - t) > 1 / 48) bgVideo.currentTime = t;
});

// veil: light over the hero, cream behind content, opens for "Stay bliss" & CTA
const veil = (trigger, start, end, from, to) =>
  gsap.fromTo(bgVeil, { opacity: from }, {
    opacity: to, ease: "none", immediateRender: false,
    scrollTrigger: { trigger, start, end, scrub: true },
  });
veil(".hero", "top top", "bottom top", 0.35, 0.84);
veil(".bliss", "top bottom", "top top", 0.84, 0.45);
veil(".comfort", "top bottom", "top 40%", 0.45, 0.84);
veil(".cta", "top bottom", "top top", 0.84, 0.5);

window.addEventListener("load", () => ScrollTrigger.refresh());
