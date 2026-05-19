/**
 * Image slot map for the marketing pages. Files live in `/public/images/...`
 * as WebP (converted from the original PNG/JPG uploads via
 * `scripts/convert-images.mjs`). If a file is missing, `SafeImage` renders a
 * tasteful gradient fallback so the page never breaks.
 */

export const siteImages = {
  hero: '/images/hero/hero.webp',
  heroMobile: '/images/hero/hero-mobile.webp',
  steps: {
    step1: '/images/cards/step1.webp',
    step2: '/images/cards/step2.webp',
    step3: '/images/cards/step3.webp',
  },
  mockups: [
    { before: '/images/mockups/before-1.webp', after: '/images/mockups/after-1.webp', label: 'Кафе AROMA' },
    { before: '/images/mockups/before-2.webp', after: '/images/mockups/after-2.webp', label: 'Аптека Береке' },
    { before: '/images/mockups/before-3.webp', after: '/images/mockups/after-3.webp', label: 'Студия красоты' },
  ],
  cities: {
    almaty: '/images/cities/almaty.webp',
    astana: '/images/cities/astana.webp',
    shymkent: '/images/cities/shymkent.webp',
  },
  agencies: [
    '/images/agencies/reklama-pro.webp',
    '/images/agencies/svetznak.webp',
    '/images/agencies/astana-signs.webp',
    '/images/agencies/neon-kz.webp',
    '/images/agencies/bannerline.webp',
    '/images/agencies/shymkent-vivesky.webp',
  ],
  avatars: [
    '/images/avatars/avatar-1.webp',
    '/images/avatars/avatar-2.webp',
    '/images/avatars/avatar-3.webp',
  ],
} as const;
