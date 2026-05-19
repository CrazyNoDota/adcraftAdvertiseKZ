import type { City, SignageType } from './types';
import { cities, signageTypes } from './seed';

export type PricingInput = {
  signage_slug: SignageType['slug'];
  city_slug: City['slug'];
  width_m: number;
  height_m: number;
  illuminated: boolean;
};

export type PricingResult = {
  area_sqm: number;
  base_kzt: number;
  illumination_kzt: number;
  city_multiplier: number;
  estimate_kzt: number;
  requires_approval: boolean | null;
};

// Capital cities are pricier — labor, permits, premium materials.
const CITY_MULTIPLIERS: Record<City['slug'], number> = {
  almaty: 1.15,
  astana: 1.2,
  shymkent: 1.0,
  karaganda: 0.95,
  aktobe: 0.95,
};

export function calculate(input: PricingInput): PricingResult {
  const type = signageTypes.find((s) => s.slug === input.signage_slug);
  const city = cities.find((c) => c.slug === input.city_slug);
  if (!type || !city) {
    throw new Error('Unknown signage type or city');
  }
  const area_sqm = Math.max(0.1, input.width_m * input.height_m);
  const base = type.base_price_per_sqm * area_sqm * type.complexity_multiplier;
  // Illumination: +20% for already-illuminated types, +35% for cold types.
  const isIlluminatedType =
    type.slug === 'lightbox' || type.slug === 'neon' || type.slug === 'illuminated';
  const illumination = input.illuminated && !isIlluminatedType ? base * 0.35 : 0;
  const cityMul = CITY_MULTIPLIERS[city.slug] ?? 1;
  const raw = (base + illumination) * cityMul;
  // Round to nearest 1,000 KZT for nice price display.
  const estimate = Math.round(raw / 1000) * 1000;

  let requires: boolean | null = null;
  if (city.approval) {
    const rule = city.approval;
    requires =
      (rule.requiresIfIlluminated && (input.illuminated || isIlluminatedType)) ||
      area_sqm >= rule.requiresIfAreaSqmAbove ||
      (rule.requiresIfChannelLetters && type.slug === 'channel_letters');
  }

  return {
    area_sqm,
    base_kzt: Math.round(base),
    illumination_kzt: Math.round(illumination),
    city_multiplier: cityMul,
    estimate_kzt: estimate,
    requires_approval: requires,
  };
}

export function formatKZT(amount: number, locale: 'ru' | 'kk' | 'en' = 'ru'): string {
  const bcp = locale === 'kk' ? 'kk-KZ' : locale === 'en' ? 'en-US' : 'ru-KZ';
  const formatted = new Intl.NumberFormat(bcp, {
    maximumFractionDigits: 0,
  }).format(amount);
  return `${formatted} ₸`;
}
