export type City = {
  id: string;
  slug: 'almaty' | 'astana' | 'shymkent' | 'karaganda' | 'aktobe';
  name_ru: string;
  name_kz: string;
  name_en: string;
  /**
   * Municipal approval rule (для согласования). Null = "rules pending" for MVP.
   * If non-null, returns whether approval is required given a signage spec.
   */
  approval: null | {
    requiresIfIlluminated: boolean;
    requiresIfAreaSqmAbove: number;
    requiresIfChannelLetters: boolean;
  };
};

export type SignageTypeSlug =
  | 'lightbox'
  | 'channel_letters'
  | 'flat_panel'
  | 'illuminated'
  | 'neon'
  | 'banner';

export type SignageType = {
  id: string;
  slug: SignageTypeSlug;
  base_price_per_sqm: number; // KZT
  complexity_multiplier: number;
};

export type BusinessType =
  | 'cafe'
  | 'shop'
  | 'salon'
  | 'pharmacy'
  | 'office'
  | 'other';

export type Agency = {
  id: string;
  company_name: string;
  city_slug: City['slug'];
  rating: number; // 0..5
  completed_orders: number;
  subscription_tier: 'basic' | 'pro' | 'premium';
  portfolio_blurb: string;
};

export type OrderStatus =
  | 'draft'
  | 'open_for_bids'
  | 'assigned'
  | 'in_production'
  | 'completed';

export type Order = {
  id: string;
  business_name: string;
  business_type: BusinessType;
  city_slug: City['slug'];
  signage_slug: SignageTypeSlug;
  width_m: number;
  height_m: number;
  illuminated: boolean;
  style_prefs?: string;
  facade_photo_data_url?: string; // base64 — only stored client-side
  mockup_data_url?: string; // base64 — only stored client-side
  estimate_kzt: number;
  requires_approval: boolean | null;
  status: OrderStatus;
  created_at: number; // ms
  /** id of bid the customer accepted (winner) */
  winning_bid_id?: string;
  /** True for server-seeded demo orders so the marketplace isn't empty */
  seeded?: boolean;
};

export type Bid = {
  id: string;
  order_id: string;
  agency_id: string;
  amount_kzt: number;
  eta_days: number;
  message: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: number;
};
