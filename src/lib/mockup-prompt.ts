import type { BusinessType, City, SignageTypeSlug } from './types';

/**
 * Turn a structured order spec into a Flux-friendly photographic prompt.
 *
 * Flux-1-schnell is text-to-image only — it can't paint onto the customer's
 * actual photo. Instead we generate a beautiful storefront *scene* that
 * matches their spec, and show their original photo separately as reference.
 */

const BUSINESS_SCENE: Record<BusinessType, string> = {
  cafe: 'a small modern cafe storefront with warm interior light spilling through large glass windows',
  shop: 'a tidy small retail shop storefront with a clean entrance and front display window',
  salon: 'an upscale beauty salon storefront with minimalist glass facade',
  pharmacy: 'a corner pharmacy storefront with a clean white facade and large glass door',
  office: 'a small ground-floor office storefront in a modern commercial building',
  other: 'a small modern commercial storefront with a tidy facade and front entrance',
};

const SIGNAGE_DESC: Record<SignageTypeSlug, string> = {
  lightbox: 'a clean white acrylic lightbox sign with crisp dark lettering',
  channel_letters: 'polished metal channel-letter signage with subtle LED halo backlight',
  flat_panel: 'a flat aluminum composite signboard with clean modern typography',
  illuminated: 'an illuminated signboard with a soft warm internal glow',
  neon: 'an elegant single-stroke neon sign with a soft pink-violet glow',
  banner: 'a tight, well-printed fabric banner mounted flush above the entrance',
};

const CITY_HINT: Partial<Record<City['slug'], string>> = {
  almaty: 'Almaty Kazakhstan, soft golden hour mountain light',
  astana: 'Astana Kazakhstan, clean overcast daylight, contemporary district',
  shymkent: 'Shymkent Kazakhstan, warm afternoon light',
  karaganda: 'Karaganda Kazakhstan, soft daylight',
  aktobe: 'Aktobe Kazakhstan, soft daylight',
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
  const lighting = input.illuminated || isInherentlyLit
    ? 'early evening blue hour, the sign clearly glowing, warm reflections on the pavement,'
    : 'soft daylight,';
  const city = CITY_HINT[input.city_slug] ?? '';
  const name = (input.business_name || 'BRAND').trim();
  const style = input.style_prefs?.trim()
    ? `Style direction: ${input.style_prefs.trim()}.`
    : '';

  return [
    `Realistic editorial photograph of ${scene}.`,
    `${sign} mounted above the entrance reading "${name}" in clean professional typography.`,
    `${lighting} ${city}.`,
    'Cinematic color grade, shot on a 35mm prime at f/2.8, shallow depth of field, no people in frame, sharp focus on the signage, tasteful commercial photography aesthetic.',
    style,
  ]
    .filter(Boolean)
    .join(' ');
}
