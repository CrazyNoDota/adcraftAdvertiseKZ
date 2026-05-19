import type { BusinessType, City, SignageTypeSlug } from './types';

/**
 * Build a natural-language instruction for an image-edit model (OpenAI
 * gpt-image-1, Gemini 2.5 Flash Image, Flux Kontext, etc.) that takes the
 * customer's actual facade photo and asks for a believable signage edit.
 *
 * The instruction:
 *   1. Tells the model to keep the building intact
 *   2. Describes the sign type, placement, lighting integration
 *   3. Spells out the exact lettering (with Cyrillic when applicable)
 *   4. Forbids invented logos or extra text
 */

const SIGNAGE_DESC: Record<SignageTypeSlug, string> = {
  lightbox: 'a clean rectangular white acrylic lightbox sign with crisp dark lettering, mounted flush above the entrance',
  channel_letters: 'polished metal channel letters with subtle LED halo backlight, mounted directly on the wall above the entrance',
  flat_panel: 'a flat aluminum composite signboard with clean modern typography, mounted flush above the entrance',
  illuminated: 'an illuminated signboard panel with a soft warm internal glow, mounted above the entrance',
  neon: 'an elegant single-stroke neon sign with a soft glow, mounted above the entrance',
  banner: 'a tightly stretched fabric banner mounted flush above the entrance',
};

const BUSINESS_CONTEXT: Partial<Record<BusinessType, string>> = {
  cafe: 'cafe / coffee shop',
  shop: 'retail shop',
  salon: 'beauty salon',
  pharmacy: 'pharmacy',
  office: 'small office',
};

const CITY_HINT: Partial<Record<City['slug'], string>> = {
  almaty: 'Almaty, Kazakhstan',
  astana: 'Astana, Kazakhstan',
  shymkent: 'Shymkent, Kazakhstan',
  karaganda: 'Karaganda, Kazakhstan',
  aktobe: 'Aktobe, Kazakhstan',
};

export type PromptInput = {
  business_name: string;
  business_type: BusinessType;
  signage_slug: SignageTypeSlug;
  city_slug: City['slug'];
  illuminated: boolean;
  style_prefs?: string;
};

export function buildEditInstruction(input: PromptInput): string {
  const sign = SIGNAGE_DESC[input.signage_slug];
  const biz = BUSINESS_CONTEXT[input.business_type] ?? 'small business';
  const city = CITY_HINT[input.city_slug] ?? '';
  const isInherentlyLit =
    input.signage_slug === 'lightbox' ||
    input.signage_slug === 'neon' ||
    input.signage_slug === 'illuminated';
  const lit = input.illuminated || isInherentlyLit
    ? 'The sign is illuminated and clearly glowing.'
    : 'The sign is not illuminated.';
  const style = input.style_prefs?.trim()
    ? `Style direction: ${input.style_prefs.trim()}.`
    : '';
  const name = (input.business_name || 'Brand').trim();

  return [
    `Edit this photograph of a storefront facade in ${city || 'Kazakhstan'} for a ${biz} business.`,
    `Add ${sign}.`,
    `The sign must display exactly this text and nothing else: «${name}». Render the text precisely, character by character, including any Cyrillic letters. Do not invent additional words, taglines, logos, or symbols.`,
    lit,
    'Integrate the sign naturally: follow the perspective of the wall, match the existing lighting direction and color temperature, cast a subtle realistic shadow onto the facade.',
    'Keep the rest of the building, the surroundings, the windows, the doors, the sidewalk, the sky, and any existing people or objects completely unchanged — pixel-for-pixel identical wherever possible.',
    'The result must look like a real photograph of the same building with the new sign professionally installed, not a digital collage.',
    style,
  ]
    .filter(Boolean)
    .join(' ');
}
