# Tidescape: Background Scroll Video (4 chained clips)

One continuous camera journey sits fixed behind the whole website. Scrolling down plays it forward, and scrolling up plays it backward.

It is made from **4 clips of 6 seconds each** in Veo, Kling, Runway, Luma or a similar tool. Each clip starts from the **last frame of the previous clip**, so the joins don't show.

**Final video:** 24 s · 16:9 · 1920×1080 · 30 fps · no audio → `videos/bg.mp4`

| Clip | Time | Scroll | Site section | Camera journey |
|---|---|---|---|---|
| 1 | 0–6 s | 0–25 % | Hero → Welcome | Aerial over the Santorini caldera, descending to the cave hotel arch |
| 2 | 6–12 s | 25–50 % | Wide image → Suites | Through the arch, over the cave plunge pool, past the canopy bed |
| 3 | 12–18 s | 50–75 % | Experiences → Stay bliss | Out onto the terrace, over the infinity edge, tilting down to the sea |
| 4 | 18–24 s | 75–100 % | Comfort → Gallery → CTA → Footer | Overhead view of the swimmer, rising and tilting up to the sunset |

---

## Workflow

1. Generate **Clip 1**.
2. Extract its last frame (command below), or use the tool's **"Extend"** button.
3. Generate **Clip 2** with that last frame as the **start image**.
4. Repeat for Clips 3 and 4.
5. Join all 4 clips and encode them for scrubbing (commands at the bottom).

**Keep these the same in every clip:** speed words ("constant slow speed"), lighting ("golden-hour, bright airy"), style suffix, aspect ratio, and model/settings. This is what makes the joins invisible.

---

## Style suffix (append to EVERY clip prompt)

> bright airy pale exposure, warm cream and sand beige palette, soft turquoise accents, Santorini Mediterranean luxury, smooth stabilized gimbal, constant slow camera speed, single continuous take, photorealistic travel film, subtle film grain, no text, no logos

## Negative prompt (use for every clip)

> cuts, scene change, transition, shaky camera, speed ramp, fast motion, motion blur, flicker, splashing water, people looking at camera, text, watermark, logo, morphing walls, distorted architecture, extra limbs, cartoon, CGI look

---

## Clip 1 (0–6 s): Caldera descent

**Start image:** none, or optionally `images/hero-3.jpg`
**End on:** the arched opening of the cave hotel, centered and close

> Single continuous drone shot high above the Santorini caldera at golden hour, white cave hotels stacked along the cliffs, calm deep-blue Aegean sea below with soft haze on the horizon. The camera slowly descends and moves forward toward one cliffside cave hotel with a large whitewashed arched opening, and ends close in front of the arch, perfectly centered, with a warm glowing interior visible inside. Constant slow speed, no cuts.

---

## Clip 2 (6–12 s): Through the cave suite

**Start image:** the last frame of Clip 1
**End on:** open doors filled with bright sunlight

> Continuing the same smooth forward movement, the camera flies through the whitewashed arch into a white cave suite with organic curved plaster walls, glowing candle niches and a perfectly still turquoise indoor plunge pool. It glides low over the calm pool and past a linen canopy bed with sheer white curtains, and ends facing a pair of open doors filled with bright warm sunlight. Constant slow speed, no cuts.

---

## Clip 3 (12–18 s): Terrace to sea

**Start image:** the last frame of Clip 2
**End on:** looking straight down at clear turquoise water

> Continuing the same smooth forward movement, the camera passes through the open doors onto a sunlit whitewashed terrace with cream loungers, potted palms and an infinity pool. It drifts over the infinity edge and slowly tilts down until it looks straight down at clear turquoise sea water with soft gentle ripples and sunlight caustics. Constant slow speed, no cuts.

---

## Clip 4 (18–24 s): Swimmer to sunset

**Start image:** the last frame of Clip 3 (or `images/bliss-aerial.jpg` if the join drifts)
**End on:** a calm, wide golden sunset over the sea (the footer moment)

> Top-down overhead view of a lone swimmer in a coral swimsuit floating peacefully on her back in calm turquoise water, gentle ripples around her. The camera slowly rises straight up, then gently tilts up toward the horizon, and ends on a calm, wide golden sunset over the Aegean sea with soft haze and a still, peaceful final frame. Constant slow speed, no cuts, no splashing.

---

## Commands

### Extract the last frame of a clip (to use as the next start image)

```bash
ffmpeg -sseof -0.1 -i clip1.mp4 -frames:v 1 -q:v 2 clip1-last.jpg
ffmpeg -sseof -0.1 -i clip2.mp4 -frames:v 1 -q:v 2 clip2-last.jpg
ffmpeg -sseof -0.1 -i clip3.mp4 -frames:v 1 -q:v 2 clip3-last.jpg
```

### Join the 4 clips

```bash
printf "file 'clip1.mp4'\nfile 'clip2.mp4'\nfile 'clip3.mp4'\nfile 'clip4.mp4'\n" > list.txt
ffmpeg -f concat -safe 0 -i list.txt -c copy joined.mp4
```

If the clips have different sizes or frame rates and `-c copy` fails, re-encode while joining:

```bash
ffmpeg -f concat -safe 0 -i list.txt -vf "scale=1920:1080,fps=30" -c:v libx264 -crf 18 -an joined.mp4
```

If you see a small jump at a join, drop the duplicated first frame of clips 2–4 by trimming 1 frame (`-ss 0.04`) from each before joining.

### Encode for smooth scroll-scrubbing (required)

Every frame must be a keyframe, or scrubbing will stutter.

```bash
mkdir -p videos

# Desktop
ffmpeg -i joined.mp4 -vf "scale=1920:-2,fps=30" -c:v libx264 -preset slow -crf 24 \
  -g 1 -keyint_min 1 -pix_fmt yuv420p -movflags +faststart -an videos/bg.mp4

# Mobile (smaller)
ffmpeg -i joined.mp4 -vf "scale=960:-2,fps=24" -c:v libx264 -preset slow -crf 28 \
  -g 1 -keyint_min 1 -pix_fmt yuv420p -movflags +faststart -an videos/bg-mobile.mp4
```

**Target size:** `bg.mp4` under ~15 MB and `bg-mobile.mp4` under ~6 MB. If a file is bigger, raise `-crf` by 2.

---

## Checklist before handing over

- [ ] 4 clips, 6 s each, same aspect ratio (16:9)
- [ ] No visible cut or jump at 6 s, 12 s or 18 s
- [ ] Footage is bright and pale, so text over it stays readable
- [ ] Final files: `videos/bg.mp4` and `videos/bg-mobile.mp4`
