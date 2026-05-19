# Site imagery

Drop generated/photographed images here, then reference them by filename
in `src/lib/site-images.ts`.

Required slots are listed in `/IMAGE_PROMPTS.md` at the repo root. Each prompt
specifies the target filename — keep the names as written so nothing has to
be re-wired in code.

## Quick guidelines

- **Format**: WebP preferred (smaller), JPEG ok. PNG only when you need transparency.
- **Dimensions**: hero shots 1920×1080, cards 1200×800, agency logos 320×120.
- **Style**: keep it consistent — same light direction, same mild grain. Avoid
  AI-flagrant artifacts (mangled text, six fingers, melted signage). If a render
  has unreadable lettering, ask the model to leave the sign blank — we overlay
  the brand name in code.

## Folders

- `hero/` — full-bleed shots used in the hero and section headers
- `cards/` — feature card photos
- `cities/` — city skyline / streetscape photos (Almaty, Astana, Shymkent…)
- `agencies/` — agency logos for the social-proof strip
- `mockups/` — example before/after signage mockups for the gallery
- `avatars/` — testimonial author photos
