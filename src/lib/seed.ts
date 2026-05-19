import type {
  Agency,
  Bid,
  City,
  Order,
  SignageType,
} from './types';

export const cities: City[] = [
  {
    id: 'c-alm',
    slug: 'almaty',
    name_ru: 'Алматы',
    name_kz: 'Алматы',
    name_en: 'Almaty',
    approval: {
      requiresIfIlluminated: true,
      requiresIfAreaSqmAbove: 3,
      requiresIfChannelLetters: true,
    },
  },
  {
    id: 'c-ast',
    slug: 'astana',
    name_ru: 'Астана',
    name_kz: 'Астана',
    name_en: 'Astana',
    approval: {
      requiresIfIlluminated: true,
      requiresIfAreaSqmAbove: 2.5,
      requiresIfChannelLetters: true,
    },
  },
  { id: 'c-shy', slug: 'shymkent', name_ru: 'Шымкент', name_kz: 'Шымкент', name_en: 'Shymkent', approval: null },
  { id: 'c-kar', slug: 'karaganda', name_ru: 'Караганда', name_kz: 'Қарағанды', name_en: 'Karaganda', approval: null },
  { id: 'c-akt', slug: 'aktobe', name_ru: 'Актобе', name_kz: 'Ақтөбе', name_en: 'Aktobe', approval: null },
];

export const signageTypes: SignageType[] = [
  { id: 's-lb', slug: 'lightbox', base_price_per_sqm: 75_000, complexity_multiplier: 1.0 },
  { id: 's-cl', slug: 'channel_letters', base_price_per_sqm: 120_000, complexity_multiplier: 1.3 },
  { id: 's-fp', slug: 'flat_panel', base_price_per_sqm: 45_000, complexity_multiplier: 0.9 },
  { id: 's-il', slug: 'illuminated', base_price_per_sqm: 95_000, complexity_multiplier: 1.15 },
  { id: 's-nn', slug: 'neon', base_price_per_sqm: 140_000, complexity_multiplier: 1.4 },
  { id: 's-bn', slug: 'banner', base_price_per_sqm: 8_000, complexity_multiplier: 0.7 },
];

export const agencies: Agency[] = [
  { id: 'a-1', company_name: 'Reklama Pro Almaty', city_slug: 'almaty', rating: 4.8, completed_orders: 142, subscription_tier: 'premium', portfolio_blurb: 'Премиальные вывески и лайтбоксы. Согласование под ключ.' },
  { id: 'a-2', company_name: 'СветЗнак', city_slug: 'almaty', rating: 4.6, completed_orders: 87, subscription_tier: 'pro', portfolio_blurb: 'Объёмные буквы с подсветкой, монтаж под ключ.' },
  { id: 'a-3', company_name: 'Astana Signs Studio', city_slug: 'astana', rating: 4.9, completed_orders: 201, subscription_tier: 'premium', portfolio_blurb: 'Крупные форматы, опыт работы с сетями.' },
  { id: 'a-4', company_name: 'Neon-KZ', city_slug: 'astana', rating: 4.5, completed_orders: 63, subscription_tier: 'pro', portfolio_blurb: 'Неон, RGB-подсветка, нестандарт.' },
  { id: 'a-5', company_name: 'BannerLine', city_slug: 'almaty', rating: 4.3, completed_orders: 38, subscription_tier: 'basic', portfolio_blurb: 'Бюджетные баннеры и композитные панели.' },
  { id: 'a-6', company_name: 'Shymkent Vivesky', city_slug: 'shymkent', rating: 4.2, completed_orders: 19, subscription_tier: 'basic', portfolio_blurb: 'Местная команда, опыт 6 лет.' },
];

/** Seeded "open" orders shown in the marketplace before the user creates any. */
export const seedOrders: Order[] = [
  {
    id: 'o-seed-1',
    business_name: 'Кофейня «Уютная»',
    business_type: 'cafe',
    city_slug: 'almaty',
    signage_slug: 'channel_letters',
    width_m: 3.5,
    height_m: 0.6,
    illuminated: true,
    style_prefs: 'Тёплые тона, ретро шрифт',
    estimate_kzt: 392_000,
    requires_approval: true,
    status: 'open_for_bids',
    created_at: Date.now() - 1000 * 60 * 60 * 4,
    seeded: true,
  },
  {
    id: 'o-seed-2',
    business_name: 'Аптека «Береке»',
    business_type: 'pharmacy',
    city_slug: 'astana',
    signage_slug: 'lightbox',
    width_m: 2.0,
    height_m: 0.7,
    illuminated: true,
    estimate_kzt: 168_000,
    requires_approval: true,
    status: 'open_for_bids',
    created_at: Date.now() - 1000 * 60 * 60 * 26,
    seeded: true,
  },
  {
    id: 'o-seed-3',
    business_name: 'Магазин «Дөңгелек»',
    business_type: 'shop',
    city_slug: 'shymkent',
    signage_slug: 'flat_panel',
    width_m: 4.0,
    height_m: 0.8,
    illuminated: false,
    estimate_kzt: 129_600,
    requires_approval: null,
    status: 'open_for_bids',
    created_at: Date.now() - 1000 * 60 * 60 * 8,
    seeded: true,
  },
];

/** Seeded bids on the demo orders so the marketplace feels alive. */
export const seedBids: Bid[] = [
  { id: 'b-seed-1', order_id: 'o-seed-1', agency_id: 'a-1', amount_kzt: 365_000, eta_days: 12, message: 'Возьмём согласование на себя. Подсветка LED Premium.', status: 'pending', created_at: Date.now() - 1000 * 60 * 60 * 2 },
  { id: 'b-seed-2', order_id: 'o-seed-1', agency_id: 'a-2', amount_kzt: 410_000, eta_days: 10, message: 'Объёмные буквы из акрила, гарантия 3 года.', status: 'pending', created_at: Date.now() - 1000 * 60 * 60 * 1.2 },
  { id: 'b-seed-3', order_id: 'o-seed-2', agency_id: 'a-3', amount_kzt: 159_000, eta_days: 7, message: 'Стандарт для аптек, согласование оформим.', status: 'pending', created_at: Date.now() - 1000 * 60 * 60 * 18 },
];

export function cityName(slug: City['slug'], locale: 'ru' | 'kk' | 'en'): string {
  const c = cities.find((x) => x.slug === slug);
  if (!c) return slug;
  return locale === 'kk' ? c.name_kz : locale === 'en' ? c.name_en : c.name_ru;
}
