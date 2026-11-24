# Tidescape: Video Prompts (scroll-controlled playback)

## ⭐ SINGLE BACKGROUND VIDEO (whole page, scrubbed by scroll)

One continuous camera journey sits fixed behind the whole page. Scrolling from top to bottom plays it from 0 s to the end, and scrolling up plays it backwards. The journey follows the order of the site's sections:

| Scroll | Site section | What the camera does |
|---|---|---|
| 0–25 % | Hero → Welcome | High aerial over the Santorini caldera, descending to a cliffside cave hotel |
| 25–50 % | Wide image → Suites | Flies in through an arch, glides over the cave-suite plunge pool, past the bed |
| 50–75 % | Experiences → Stay bliss | Out onto the terrace, over the infinity-pool edge, tilts down to the sea |
| 75–100 % | Comfort → Gallery → CTA → Footer | Rises overhead above the turquoise water and the swimmer, then tilts up to the sunset horizon |

**Total length:** 20–24 s · 16:9 · 1920×1080 · 30 fps · no audio

### Option A: one prompt (for tools that generate 20 s or more in one take)

> One single continuous cinematic drone take, no cuts. It begins high above the Santorini caldera at golden hour, with white cave hotels stacked on the cliffs and the calm deep-blue Aegean below. The camera slowly descends toward one cliffside cave hotel and flies smoothly through a large whitewashed arched opening into a white cave suite with organic curved plaster walls, glowing candle niches and a perfectly still turquoise indoor plunge pool. It glides low over the pool, past a linen canopy bed with sheer white curtains, and continues out through open doors onto a sunlit terrace with cream loungers and an infinity pool. It drifts over the infinity edge and tilts down to clear turquoise sea, rises straight up into a top-down overhead view of a lone swimmer in a coral swimsuit floating in turquoise water with gentle ripples, then slowly tilts up to end on a calm, wide golden sunset over the sea horizon. Constant slow speed throughout, smooth stabilized gimbal, bright airy pale exposure, warm cream and sand beige palette, soft turquoise accents, photorealistic luxury travel film, subtle film grain, no text.

### Option B: 4 chained clips (for Veo, Kling, Runway, Luma and similar tools)

Generate clip 1. For each next clip, use **"extend"**, or upload the **last frame** of the previous clip as the start frame. Keep the same speed and lighting words so the joins are invisible. Join them with the concat command below.

**Clip 1 (0–6 s), Caldera descent** · start frame `images/hero-3.jpg` (optional)
> Single continuous drone shot high above the Santorini caldera at golden hour, white cave hotels stacked on the cliffs, calm deep-blue Aegean below. The camera slowly descends and moves forward toward one cliffside cave hotel with a large whitewashed arched opening, ending close in front of the arch, centered. Constant slow speed, no cuts.

**Clip 2 (6–12 s), Through the cave suite** · start = last frame of clip 1 (or `images/wide-cave-pool.jpg`)
> Continuing the same smooth forward movement, the camera flies through the whitewashed arch into a white cave suite with organic curved plaster walls, glowing candle niches and a perfectly still turquoise indoor plunge pool. It glides low over the pool and past a linen canopy bed with sheer white curtains, ending facing open doors filled with bright sunlight. Constant slow speed, no cuts.

**Clip 3 (12–18 s), Terrace to sea** · start = last frame of clip 2
> Continuing the same movement, the camera passes through the open doors onto a sunlit terrace with cream loungers, potted palms and an infinity pool. It drifts over the infinity edge and slowly tilts down until it looks straight down at clear turquoise sea water with soft ripples. Constant slow speed, no cuts.

**Clip 4 (18–24 s), Swimmer to sunset** · start = last frame of clip 3 (or `images/bliss-aerial.jpg`)
> Top-down overhead view of a lone swimmer in a coral swimsuit floating on her back in calm turquoise water. The camera slowly rises straight up, then gently tilts up toward the horizon, ending on a calm, wide golden sunset over the Aegean sea with soft haze. Constant slow speed, no cuts, peaceful final frame.

**Style suffix for every clip:**
> bright airy pale exposure, warm cream and sand beige palette, soft turquoise accents, Santorini Mediterranean luxury, smooth stabilized gimbal, photorealistic travel film, subtle film grain, no text, no logos

**Negative prompt:** cuts, scene change, shaky camera, speed ramp, fast motion, flicker, splashing, people looking at camera, text, watermark, morphing walls, distorted architecture

### Join and encode for smooth scrubbing

```bash
# 1) join the 4 clips
printf "file 'clip1.mp4'\nfile 'clip2.mp4'\nfile 'clip3.mp4'\nfile 'clip4.mp4'\n" > list.txt
ffmpeg -f concat -safe 0 -i list.txt -c copy joined.mp4

# 2) every frame a keyframe, no audio, web-ready (this is what makes scrubbing smooth)
mkdir -p videos
ffmpeg -i joined.mp4 -vf "scale=1920:-2,fps=30" -c:v libx264 -preset slow -crf 24 \
  -g 1 -keyint_min 1 -pix_fmt yuv420p -movflags +faststart -an videos/bg.mp4

# 3) mobile version (smaller)
ffmpeg -i joined.mp4 -vf "scale=960:-2,fps=24" -c:v libx264 -crf 28 \
  -g 1 -pix_fmt yuv420p -movflags +faststart -an videos/bg-mobile.mp4
```

Aim for `videos/bg.mp4` to be **under ~15 MB**. If it's bigger, raise `-crf` to 26–28.

**Readability:** the page text sits on top of the video, so the site will add a cream veil over it (about 75 % opacity), with the video showing fully only in the "Stay bliss" and hero moments. Bright, pale footage (as prompted) works best.

---

# Per-section videos (alternative to the single background video)

These videos are meant to be **scrubbed by scroll**. GSAP ScrollTrigger maps scroll position to `video.currentTime`, so the video moves forward as you scroll down and backward as you scroll up.

## Rules for scroll-scrub videos

Every prompt below already follows these rules. Follow them too if you write your own.

- **One continuous shot.** No cuts, no transitions, no fades.
- **Slow, constant camera speed.** Use a smooth dolly, push-in or crane move, with no sudden speed changes.
- **A clear start and end frame.** Both should be clean, still compositions, because users pause on them.
- **Little random motion.** Avoid flickering water sparkle, fast-moving people and wind-whipped curtains. These look jittery when scrubbed backwards.
- **Length 5–8 s** at 24–30 fps, 16:9, 1080p or higher.
- **Use image-to-video where possible.** Upload the matching image from `images/` as the first frame so the video matches the site exactly.

**Style suffix (append to every prompt):**
> cinematic, photorealistic, Santorini Mediterranean luxury hotel, warm cream and sand beige palette, soft turquoise sea, whitewashed curved plaster architecture, soft natural golden light, calm and serene mood, smooth stabilized gimbal movement, constant slow speed, single continuous take, no cuts, no text, no people looking at camera, high-end travel film look, subtle film grain

**Negative prompt:** cuts, scene change, shaky camera, fast motion, motion blur streaks, flicker, text, logo, watermark, distorted architecture, morphing objects, extra limbs, cartoon, CGI look

---

## 1. Hero background: "Arrival"
**Section:** behind the giant TIDESCAPE wordmark (pinned hero). It plays as the photos scatter away.
**Start frame:** `images/hero-3.jpg` (optional)
**Length:** 6 s · 16:9 · keep the center calm and low-contrast so the dark title stays readable

> Slow aerial drone shot gliding forward along the Santorini caldera cliffs at golden hour, whitewashed cave hotels with small turquoise infinity pools stepping down the cliff, calm deep-blue Aegean sea below, the camera moves steadily forward and slightly descends, ending on a wide calm view of the sea horizon with soft haze, bright airy exposure, pale washed-out tones

---

## 2. Wide reveal: "Into the cave suite"
**Section:** the wide image under "Welcome to Tidescape" (expands from inset to full width)
**Start frame:** `images/wide-cave-pool.jpg`
**Length:** 7 s

> Slow dolly push-in through the interior of a white Santorini cave suite with organic curved plaster walls, a still turquoise indoor plunge pool in the center, glowing wall niches with candles, cream cushioned built-in seating, the camera glides forward over the pool toward a large arched opening, ending framed on the sunset sea and distant cliffs through the arch, water perfectly calm, warm golden light

---

## 3. Suites (one clip per suite, crossfaded while pinned)
**Section:** right-hand large image of the pinned suites block. Each clip scrubs during its own part of the scroll.
**Length:** 5 s each · aspect ~10:9 (generate 16:9, it is center-cropped)

**3a. Oceanview suite** (start frame `images/suite-1-big.jpg`)
> Slow lateral dolly from left to right across a minimal white suite, a low linen daybed with cream pillows, dried pampas grass in a ceramic vase, sheer white curtains gently still, floor-to-ceiling window revealing a calm blue sea, soft morning light, ending centered on the window and the sea

**3b. Sunset retreat** (start frame `images/suite-2-big.jpg`)
> Slow push-in toward a king-size canopy bed with white linen drapes in a warm wooden-beamed suite, open balcony doors behind the bed revealing an orange sunset over the sea, the sun slowly lowering, warm lamp glow, ending close on the balcony doors and sunset

**3c. Beachfront villa** (start frame `images/suite-3-big.jpg`)
> Slow crane move rising from a cushioned white terrace sofa beside potted palms up to reveal the full open terrace and the turquoise sea beyond, bright midday light, ending on a wide balanced composition of terrace and horizon

---

## 4. "Stay bliss / Enjoy more": the hero scroll video ⭐
**Section:** the pinned section where a small frame grows to fullscreen. **This is the most important clip.** The video scrubs while the frame expands.
**Start frame:** `images/bliss-aerial.jpg`
**Length:** 8 s · 16:9 · subject must stay centered

> Top-down overhead drone shot looking straight down at a lone swimmer in a coral swimsuit floating on her back in clear turquoise water, the camera very slowly rises straight up and rotates gently clockwise, revealing more and more turquoise sea with soft ripples and gentle white foam patterns, ending on a minimal abstract composition with the swimmer small in the center, calm water, no splashing

**Alternative (simpler for AI generators):**
> Overhead drone shot slowly descending straight down toward calm turquoise sea water with gentle ripple patterns and sunlight caustics, a swimmer in a coral swimsuit gradually comes into view in the center, smooth constant descent, ending close above the swimmer

---

## 5. Comfort section ambience (optional, small)
**Section:** the centered image in each comfort row. Each one plays as its row scrolls through.
**Length:** 4 s each · portrait 4:5

| Row | Start frame | Prompt |
|---|---|---|
| Dining | `images/comfort-dining.jpg` | Slow push-in on a white-linen terrace table with a seafood platter and glasses of rosé, the sea and parasol softly blurred behind, gentle golden light |
| Bar | `images/comfort-bar.jpg` | Slow lateral glide through an arched whitewashed lounge with cream floor cushions toward a palm tree and the sea framed by an arch |
| Spa | `images/comfort-spa.jpg` | Slow push-in over a linen massage bed toward a calm small turquoise pool, candles softly flickering, plaster arches, serene |
| Fitness | `images/comfort-fitness.jpg` | Slow dolly along a beige yoga floor with rolled mats and wooden dumbbells toward an arch opening onto the sea, soft dappled shadows |

---

## 6. CTA background: "Golden hour farewell" (optional)
**Section:** behind "Ready to experience Tidescape?". Very subtle, plays at low opacity.
**Start frame:** `images/cta-br.jpg`
**Length:** 6 s

> Slow pull-back from a stone arched balcony with bougainvillea and a small bistro table, revealing the Aegean sea and white Santorini village at golden hour, the sun slowly setting, ending on a wide peaceful composition

---

## Export for smooth scrubbing (important)

AI generators export with sparse keyframes, which makes scroll-scrubbing stutter. Re-encode every clip so **every frame is a keyframe**:

```bash
# MP4 (H.264), scrub-friendly
ffmpeg -i input.mp4 -vf "scale=1920:-2,fps=30" -c:v libx264 -preset slow -crf 22 \
  -g 1 -keyint_min 1 -pix_fmt yuv420p -movflags +faststart -an videos/bliss.mp4

# WebM (VP9), smaller, also scrub-friendly
ffmpeg -i input.mp4 -vf "scale=1920:-2,fps=30" -c:v libvpx-vp9 -crf 34 -b:v 0 \
  -g 1 -an videos/bliss.webm
```

- Remove audio (`-an`). Muted video is required for autoplay and scrubbing.
- Aim for **< 8 MB per clip**. Use 1280px wide for small clips (suites, comfort).
- Save into `videos/` with these names:

| File | Section |
|---|---|
| `videos/hero.mp4` | Hero background |
| `videos/wide.mp4` | Cave suite wide reveal |
| `videos/suite-1.mp4`, `suite-2.mp4`, `suite-3.mp4` | Suites |
| `videos/bliss.mp4` | Stay bliss fullscreen ⭐ |
| `videos/comfort-dining.mp4` … `comfort-fitness.mp4` | Comfort rows (optional) |
| `videos/cta.mp4` | CTA background (optional) |

Once the files are in `videos/`, the site can be wired so each `<video muted playsinline preload="auto">` is scrubbed with:

```js
gsap.to(video, { currentTime: video.duration, ease: "none",
  scrollTrigger: { trigger: section, start: "top top", end: "+=150%", scrub: true } });
```
