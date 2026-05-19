# Image generation prompts

Generate each image with the prompt below, save it with the exact filename, and
drop it into the matching subfolder of `/public/images/`. If a filename already
exists, just overwrite it — the site picks the file up automatically.

> Tip: use **Flux 1.1 Pro**, **Midjourney v6.1**, **Ideogram 3**, **GPT-image-1**,
> or **Nano Banana** for these. For anything with readable text on a sign, prefer
> Ideogram / GPT-image-1 / Nano Banana — they handle typography better.

---

## 1. Hero — `public/images/hero/hero.jpg`

**Aspect:** 16:9 · **Target size:** 1920×1080

```
Realistic photograph, early evening, soft golden hour light, Almaty
Kazakhstan street view. A small modern cafe storefront with a freshly
installed illuminated channel-letter sign mounted above large glass windows.
The sign panel is intentionally blank — no text, just a clean black
backing plate with neutral surface so a logo can be overlaid later. People
walking past, slight bokeh, shallow depth of field, cinematic color grade,
no people in the foreground, sharp focus on the storefront. Shot on a 35mm
prime, f/2.8, ISO 200.
```

Negative / avoid: blurry text, mangled letters, AI hands, oversaturated neon,
generic Western pharmacy storefront.

---

## 2. Hero alt (mobile portrait) — `public/images/hero/hero-mobile.jpg`

**Aspect:** 4:5 · **Target size:** 1080×1350

```
Same scene as hero.jpg but framed vertically. Tight crop on the cafe
entrance with the empty signage panel filling the upper third, glass door
at the bottom. Warm string lights inside, condensation on glass, blurred
silhouette of a barista inside. Same cinematic grade.
```

---

## 3. "How it works" step photos — `public/images/cards/step1.jpg`, `step2.jpg`, `step3.jpg`

**Aspect:** 4:3 each · **Target size:** 1200×900

### `step1.jpg` — upload a photo
```
Top-down photograph of a hand holding a phone, photographing a small shop
facade in Kazakhstan. The phone screen shows the camera viewfinder with
the storefront framed inside. Bright daylight, clean concrete sidewalk,
natural shadows. Editorial product photography aesthetic.
```

### `step2.jpg` — AI mockup
```
Macro photograph of a laptop screen showing the same storefront from
step1.jpg but now with a polished illuminated sign added in software.
Soft window light, slight reflections, no people. The signboard area is
left blank — no fake text. Editorial product photography aesthetic.
```

### `step3.jpg` — bids
```
Over-the-shoulder photograph of a business owner reviewing three printed
proposals on a wooden cafe table. Coffee cup, notebook, phone. Warm light,
shallow focus, no readable text on the papers. Editorial product photography
aesthetic.
```

---

## 4. Mockup gallery (before / after pairs) — `public/images/mockups/`

Generate a pair for each. Save as `before-1.jpg` + `after-1.jpg`, `before-2.jpg`
+ `after-2.jpg`, `before-3.jpg` + `after-3.jpg`.

**Aspect:** 1:1 · **Target size:** 1024×1024

### Pair 1 — cafe
```
before-1.jpg: realistic photograph of a small Kazakhstani cafe storefront,
plain plastered facade, no signage at all, daylight, eye-level view.

after-1.jpg: same exact storefront and camera angle as before-1, now with
a tasteful channel-letter sign mounted above the entrance reading "AROMA"
in a warm modern serif typeface, with subtle LED halo backlight.
```

### Pair 2 — pharmacy
```
before-2.jpg: realistic photograph of a corner pharmacy in Astana, beige
brick, generic empty wall above the door. Overcast sky, soft light.

after-2.jpg: same storefront, now with a clean white lightbox sign and a
green cross icon, professional pharmacy chain aesthetic, clean sans-serif
"АПТЕКА" lettering.
```

### Pair 3 — beauty salon
```
before-3.jpg: realistic photograph of a beauty salon facade in Almaty,
glass facade, no signage, late afternoon.

after-3.jpg: same storefront, now with elegant black sans-serif lettering
"STUDIO" mounted as polished metal channel letters, subtle uplighting,
upscale boutique feel.
```

---

## 5. City photos — `public/images/cities/`

**Aspect:** 3:2 · **Target size:** 1500×1000

### `almaty.jpg`
```
Almaty, Kazakhstan — wide shot of a modern shopping street with the Zailiyskiy
Alatau mountains in the soft-focus background. Golden hour, leafy trees,
mixed traditional and contemporary architecture, no recognizable brand
signage. Photojournalism style.
```

### `astana.jpg`
```
Astana (Nur-Sultan), Kazakhstan — clean modern boulevard with contemporary
mid-rise commercial buildings, wide sidewalks, futuristic skyline silhouette
in the background, late afternoon, photojournalism style, no people close to
camera.
```

### `shymkent.jpg`
```
Shymkent, Kazakhstan — lively street with small businesses, mix of older
2-story commercial buildings, warm daylight, photojournalism style.
```

---

## 6. Agency logos (placeholder strip) — `public/images/agencies/`

**Aspect:** 8:3 each (wide horizontal logo) · **Target size:** 480×180, transparent PNG

For each filename below, generate a clean, minimal monochrome logo lockup —
agency name + a simple geometric mark. Black on transparent background.

- `reklama-pro.png` — wordmark "REKLAMA PRO" + bold geometric mark
- `svetznak.png` — wordmark "СВЕТЗНАК" with stylized lamp icon
- `astana-signs.png` — wordmark "ASTANA SIGNS" with skyline accent
- `neon-kz.png` — wordmark "NEON KZ" with neon arc accent
- `bannerline.png` — wordmark "BANNERLINE" with horizontal underline accent
- `shymkent-vivesky.png` — wordmark "SHYMKENT" + secondary "VIVESKY"

```
Vector-style flat monochrome logo lockup, professional B2B branding
aesthetic, transparent background, single color black, generous padding,
no gradients, no shadows, no rasterization artifacts.
```

---

## 7. Testimonial author photos — `public/images/avatars/`

**Aspect:** 1:1 · **Target size:** 400×400, round-crop in CSS

Generate 3 portraits, neutral background, professional but warm. Save as
`avatar-1.jpg`, `avatar-2.jpg`, `avatar-3.jpg`.

```
avatar-1.jpg: Kazakhstani woman in her early 30s, cafe owner aesthetic,
soft window light, casual blazer, friendly smile, neutral grey background,
photorealistic editorial portrait.

avatar-2.jpg: Kazakhstani man in his mid 40s, agency owner aesthetic,
warm overhead light, dark shirt, confident look, neutral warm background,
photorealistic editorial portrait.

avatar-3.jpg: Kazakhstani woman in her late 20s, pharmacy manager
aesthetic, daylight, white shirt, soft smile, neutral cool grey
background, photorealistic editorial portrait.
```

---

## Once images are in place

The site will pick them up automatically. If an image is missing, the
component gracefully falls back to a tasteful gradient + initials, so you
can drop files in incrementally — no code changes required.
