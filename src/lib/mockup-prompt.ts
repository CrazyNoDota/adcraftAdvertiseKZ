import type { BusinessType, City, SignageTypeSlug } from './types';

/**
 * Build a Flux-friendly prompt that asks for a realistic storefront with a
 * BLANK signage area. The customer's actual business name is overlaid onto
 * the returned image client-side — Flux can't reliably render text
 * (especially Cyrillic), so we never let it try.
 */

const BUSINESS_SCENE: Record<BusinessType, string> = {
  cafe: 'a small neighborhood cafe storefront, ground floor, large windows, simple plastered facade',
  shop: 'a small neighborhood retail shop storefront, ground floor, plain plastered facade, a single front door and a window',
  salon: 'a small beauty salon storefront, ground floor, glass facade, simple modern entrance',
  pharmacy: 'a small corner pharmacy storefront, ground floor, simple white-painted facade, large glass door',
  office: 'a small ground-floor office entrance in a low-rise commercial building, plain facade',
  other: 'a small ground-floor commercial storefront with a simple plastered facade and a front entrance',
};

const SIGNAGE_DESC: Record<SignageTypeSlug, string> = {
  lightbox: 'a clean rectangular white acrylic lightbox sign panel',
  channel_letters: 'a flat dark backing plate for channel-letter signage, mounted above the entrance',
  flat_panel: 'a flat aluminum composite signboard panel',
  illuminated: 'a clean illuminated signboard panel with a soft internal glow',
  neon: 'a neon-style signboard area with a soft warm glow halo',
  banner: 'a tightly stretched fabric banner mounted flush above the entrance',
};

const CITY_HINT: Partial<Record<City['slug'], string>> = {
  almaty: 'Almaty, Kazakhstan, post-Soviet city street',
  astana: 'Astana, Kazakhstan, modern post-Soviet city',
  shymkent: 'Shymkent, Kazakhstan, warm afternoon light',
  karaganda: 'Karaganda, Kazakhstan',
  aktobe: 'Aktobe, Kazakhstan',
};

export type MockupPromptInput = {
  business_name: string;
  business_type: BusinessType;
  signage_slug: SignageTypeSlug;
  city_slug: City['slug'];
  illuminated: boolean;
  style_prefs?: string;
};

export function buildPrompt(input: MockupPromptInput): string {
  const scene = BUSINESS_SCENE[input.business_type] ?? BUSINESS_SCENE.other;
  const sign = SIGNAGE_DESC[input.signage_slug];
  const isInherentlyLit =
    input.signage_slug === 'lightbox' ||
    input.signage_slug === 'neon' ||
    input.signage_slug === 'illuminated';
  const lit = input.illuminated || isInherentlyLit;
  const lighting = lit
    ? 'early evening, the sign panel softly glowing'
    : 'natural daylight, overcast soft light';
  const city = CITY_HINT[input.city_slug] ?? '';
  const style = input.style_prefs?.trim()
    ? `Style note: ${input.style_prefs.trim()}.`
    : '';

  // The strong anti-text language repeats deliberately — Flux is very prone
  // to hallucinating gibberish letters on any sign-shaped surface.
  return [
    `Realistic documentary photograph of ${scene}.`,
    `Mounted above the entrance: ${sign}.`,
    'The sign panel is completely BLANK — no text, no letters, no writing, no logos, no symbols, no characters, just a clean empty unmarked surface ready for branding.',
    `${lighting}, ${city}.`,
    'Plain real-world setting, ordinary sidewalk, natural imperfections in the wall surface, mid-day or evening street photography.',
    style,
  ]
    .filter(Boolean)
    .join(' ');
}
