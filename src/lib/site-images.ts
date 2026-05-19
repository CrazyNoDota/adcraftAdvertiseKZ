/**
 * Image slot map for the marketing pages.
 *
 * Each entry below points at a file that *may* exist in `/public/images/...`.
 * The corresponding React components render an `<img>` if the file exists at
 * request time, otherwise they fall back to a tasteful gradient placeholder
 * so the page never has broken images while you fill the folder.
 *
 * The fallback detection happens client-side via `onError`, so the build never
 * cares whether the files exist yet — drop them in and they appear.
 */

export const siteImages = {
  hero: '/images/hero/hero.jpg',
  heroMobile: '/images/hero/hero-mobile.jpg',
  steps: {
    step1: '/images/cards/step1.jpg',
    step2: '/images/cards/step2.jpg',
    step3: '/images/cards/step3.jpg',
  },
  mockups: [
    { before: '/images/mockups/before-1.jpg', after: '/images/mockups/after-1.jpg', label: 'Кафе AROMA' },
    { before: '/images/mockups/before-2.jpg', after: '/images/mockups/after-2.jpg', label: 'Аптека Береке' },
    { before: '/images/mockups/before-3.jpg', after: '/images/mockups/after-3.jpg', label: 'Студия красоты' },
  ],
  cities: {
    almaty: '/images/cities/almaty.jpg',
    astana: '/images/cities/astana.jpg',
    shymkent: '/images/cities/shymkent.jpg',
  },
  agencies: [
    '/images/agencies/reklama-pro.png',
    '/images/agencies/svetznak.png',
    '/images/agencies/astana-signs.png',
    '/images/agencies/neon-kz.png',
    '/images/agencies/bannerline.png',
    '/images/agencies/shymkent-vivesky.png',
  ],
  avatars: [
    '/images/avatars/avatar-1.jpg',
    '/images/avatars/avatar-2.jpg',
    '/images/avatars/avatar-3.jpg',
  ],
} as const;
