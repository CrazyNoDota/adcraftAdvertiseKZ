# AdvertMarket KZ — MVP Prompt & Implementation Plan

## Suggested GitHub Repository Names

Pick one of these (ordered from most to least recommended):

1. **`reklama-kz`** — short, memorable, instantly clear to the target market
2. **`vyveska-market`** — emphasizes the core "signage" use case
3. **`adagency-aggregator-kz`** — descriptive, good for international/investor audiences
4. **`reklamabid`** — emphasizes the bidding/auction mechanic
5. **`signage-bid-kz`** — English-first alternative

> **Recommended: `reklama-kz`** (with display name "AdvertMarket KZ" in README)

---

## Master Prompt for AI Coding Agent

Paste everything between the `===` lines into your AI coding agent (Claude Code, Cursor, etc.).

```
===
You are building the MVP of "AdvertMarket KZ" (internal codename: reklama-kz) — a B2B marketplace that connects business owners in Kazakhstan with advertising agencies to manufacture signage, lightboxes, and outdoor advertising.

# PRODUCT CONTEXT

The Kazakhstan market has ~500 officially registered advertising agencies and tens of thousands of small business owners (IP / ТОО) who open cafes, shops, salons, and need outdoor signage ("вывеска"). Today, finding a reklama agency is a chaotic word-of-mouth process. We are building the aggregator that fixes this — like Uber/YouDo, but specifically for advertising production.

# CORE USER FLOW (the "happy path")

1. A business owner ("Customer") downloads the app or opens the site.
2. They tap "Заказать вывеску" (Order signage).
3. They upload a photo of their building facade.
4. They enter: business name, business type (dukken / cafe / salon / pharmacy / other), city, and optional preferences (style, colors).
5. AI generates a signage mockup overlaid on their facade photo.
6. Customer iterates ("regenerate", "change color", "make bigger") until satisfied.
7. Customer taps "Рассчитать стоимость" — system shows an estimated price based on size, materials (lightbox / illuminated / flat / 3D letters), and city design code requirements (согласование / без согласования).
8. Customer taps "Подать заявку" — the order goes into a marketplace feed visible to verified advertising agencies in the same city.
9. Agencies bid on the order. They can quote BELOW or ABOVE the calculator estimate. Example: calculator estimated 400,000 KZT, an agency bids 370,000 KZT to win the job.
10. Customer reviews bids (price, agency rating, portfolio, ETA) and selects a winner.
11. Both parties sign a contract digitally via Trust Me integration (https://trustme.kz or equivalent escrow/e-signature provider).
12. Customer pays into escrow. Funds are released to the agency after the customer confirms delivery and installation.
13. Both parties leave reviews.

# MONETIZATION

- **Agencies pay a monthly subscription** (3 tiers: Basic / Pro / Premium) to access leads and bid.
- **Platform commission** (5–10%) on each completed transaction held in escrow.
- **Featured listings** for top agencies (paid promotion).

# SECONDARY FEATURES

- **City Design Code module**: Each major city in Kazakhstan (Almaty, Astana, Shymkent, Karaganda, Aktobe, Kokshetau, etc.) has different rules for what kind of signage requires municipal approval ("согласование"). The platform must show: "Your design REQUIRES / DOES NOT REQUIRE municipal approval in [city]". For MVP, hardcode Almaty + Astana rules; mark others as "rules pending".
- **Signage type catalog**: lightbox, channel letters (объемные буквы), flat composite panel, illuminated, neon, banner, billboard. Each type has its own price calculator inputs.
- **Multi-language UI**: Default Russian. Toggle buttons in header for KZ (Kazakh) and EN (English). All user-facing strings must come from an i18n dictionary, NEVER hardcoded.
- **AI signage generator**: Use an image-to-image model (Stable Diffusion XL with ControlNet, or Replicate API, or Anthropic + Gemini image gen, or Nano Banana) to overlay generated signage on the uploaded facade photo. For MVP, if real image gen is too heavy, use a placeholder that composites text + simple shapes onto the photo with realistic shadow.

# TECH STACK (use exactly this unless you have a strong reason)

- **Frontend**: Next.js 15 (App Router) + TypeScript + Tailwind CSS + shadcn/ui
- **Backend**: Next.js API routes / Server Actions; or separate FastAPI service if logic gets heavy
- **Database**: PostgreSQL (via Supabase for MVP speed — gives us auth, storage, and DB in one)
- **Auth**: Supabase Auth with phone OTP (KZ phone numbers +7) + email fallback
- **File storage**: Supabase Storage for facade photos and generated mockups
- **AI image gen**: Replicate API (SDXL + ControlNet) OR fal.ai — pick whichever is cheaper. Wrap behind an interface so we can swap.
- **Price calculator**: Pure TypeScript module — formula based on (signage_type, dimensions, materials, city, illumination, complexity_multiplier). Easy to tune.
- **Escrow & e-signature**: Trust Me API integration (https://trustme.kz). If their API is not publicly available, build an adapter pattern and stub the integration behind a feature flag `ESCROW_PROVIDER=trustme|stub`.
- **Payments**: Kaspi Pay + Halyk Bank epay (these dominate KZ). Stripe as fallback for international agencies.
- **i18n**: next-intl
- **Mobile**: Web-first PWA for MVP. React Native (Expo) in a later phase.
- **Hosting**: Vercel for the Next.js app, Supabase for DB/storage.
- **Analytics**: PostHog (self-hostable, GDPR-friendly).

# DATA MODEL (Postgres schemas)

- `users` — id, phone, email, role ('customer' | 'agency' | 'admin'), preferred_language, city, created_at
- `agencies` — id, user_id, company_name, bin (KZ tax ID), city, rating, verified_at, subscription_tier, subscription_expires_at
- `customers` — id, user_id, business_name, business_type
- `orders` — id, customer_id, city, signage_type, facade_photo_url, generated_mockup_url, ai_prompt, calculator_estimate, requires_municipal_approval, status ('draft' | 'open_for_bids' | 'assigned' | 'in_production' | 'delivered' | 'completed' | 'cancelled'), created_at
- `bids` — id, order_id, agency_id, amount, eta_days, message, status ('pending' | 'accepted' | 'rejected'), created_at
- `contracts` — id, order_id, customer_id, agency_id, trustme_contract_id, status, signed_at
- `payments` — id, order_id, amount, currency, provider, escrow_status ('held' | 'released' | 'refunded'), created_at
- `reviews` — id, order_id, reviewer_id, reviewee_id, rating, comment
- `cities` — id, name_ru, name_kz, name_en, design_code_rules (jsonb)
- `signage_types` — id, slug, name_ru, name_kz, name_en, base_price_per_sqm, complexity_multiplier
- `subscription_plans` — id, tier, name, price_kzt, lead_quota, features (jsonb)

# IMPLEMENTATION PHASES (build in this order)

## Phase 0 — Project setup (Day 1)
- Init Next.js 15 + TS + Tailwind + shadcn/ui
- Set up Supabase project, run initial schema migration
- Configure next-intl with three locales: `ru` (default), `kk`, `en`
- Create base layout with language switcher (RU / KZ / EN buttons in header)
- Create `/messages/ru.json`, `/messages/kk.json`, `/messages/en.json` — start with empty objects and fill as you build

## Phase 1 — Auth & onboarding (Days 2–3)
- Phone OTP signup/login (Supabase Auth)
- Two onboarding flows: "I am a business owner" vs "I am an advertising agency"
- Agency onboarding collects BIN, company name, city, portfolio uploads — `verified_at = null` until admin approves

## Phase 2 — Customer order flow (Days 4–7)
- `/order/new` — wizard with 4 steps:
  1. Upload facade photo + business info
  2. AI generates mockup (show loading state, allow regenerate)
  3. Show price estimate + municipal approval status
  4. Confirm and publish to marketplace
- Use Supabase Storage for photo uploads
- Implement the price calculator as `lib/pricing.ts` — unit-testable, pure function

## Phase 3 — Agency marketplace (Days 8–10)
- `/marketplace` — feed of open orders, filtered by city and agency subscription tier
- `/order/[id]/bid` — submit a bid (amount, ETA, message, sample portfolio)
- Customer view: `/order/[id]/bids` — list of bids with agency cards
- Accept bid → notify both parties

## Phase 4 — Contract & escrow (Days 11–13)
- Integrate Trust Me adapter (real or stub behind feature flag)
- Trigger contract creation on bid acceptance
- Both parties sign → status moves to `in_production`
- Payment flow: customer pays into escrow, funds held until customer confirms delivery

## Phase 5 — Reviews, dashboard, admin (Days 14–16)
- Both parties leave reviews after `completed`
- Agency dashboard: active bids, won orders, revenue, subscription status
- Customer dashboard: my orders, my contracts, payment history
- Admin panel: verify agencies, moderate disputes, manage cities and signage types

## Phase 6 — Polish (Days 17–20)
- Mobile responsive pass (test on iPhone SE and Android mid-tier)
- PWA manifest + offline shell
- Email/SMS notifications for: new bid, bid accepted, contract ready, payment held, delivery confirmed
- Onboarding tour for first-time users
- SEO landing pages for each city: `/almaty`, `/astana`, etc.

# LANGUAGE & COPY REQUIREMENTS

- **Primary UI language is RUSSIAN.** All default copy must be natural, professional Russian — not machine-translated.
- **Kazakh (kk) and English (en) toggles must be visible in the header at all times** (three buttons or a dropdown: РУС / ҚАЗ / ENG).
- The language preference must persist in user profile (logged-in users) and localStorage (anonymous users).
- Use Kazakhstan-specific terms naturally: "вывеска", "согласование", "ИП", "ТОО", "БИН", "тенге / ₸ / KZT".
- Currency: KZT only for MVP. Display as "₸" or "тг" (e.g., "400 000 ₸").
- Phone numbers: +7 (7XX) XXX-XX-XX format.

# QUALITY BAR

- All user-facing strings via `useTranslations()` — NEVER hardcoded in JSX.
- Server-side input validation with Zod on every API route.
- Error states must be friendly and in the user's language.
- Loading states everywhere (skeletons, not spinners where possible).
- Mobile-first responsive design; design for 380px width first.
- Type-safe end-to-end (Supabase generated types + tRPC or typed Server Actions).
- Write integration tests for: order creation flow, bid acceptance flow, price calculator.

# WHAT TO BUILD FIRST

Build a clickable demo of the customer order flow end-to-end, even if AI image gen is stubbed with a placeholder composite. Get a customer from "I want a sign" to "I have 3 bids in front of me" within the first week. Everything else flows from this core loop.

# WHAT NOT TO DO

- Do NOT build a native mobile app for MVP — PWA only.
- Do NOT integrate every payment provider — Kaspi + Halyk is enough.
- Do NOT support every Kazakh city's design code — Almaty + Astana hardcoded, others marked "rules pending".
- Do NOT over-engineer the AI generator — a workable placeholder is better than a perfect model that takes 60 seconds per render.
- Do NOT use English as the default language. Russian is default. Kazakh and English are toggles.

# DELIVERABLES

1. A working Next.js app deployed to Vercel
2. Supabase project with seeded data: 2 cities, 6 signage types, 3 subscription plans, 5 dummy agencies, 3 dummy customers
3. README.md in Russian (primary), with English section below — covers setup, env vars, deployment, architecture overview
4. /docs folder with: architecture.md, data-model.md, api.md, i18n-guide.md
5. .env.example with all required keys documented

Start by creating the repo structure, then ask me before making any major architectural choice not specified above (e.g., which image gen provider, whether to use tRPC).
===
```

---

## Implementation Plan Summary

### Timeline at a Glance

| Phase | Duration | Outcome |
|-------|----------|---------|
| 0. Setup | 1 day | Repo, Supabase, i18n scaffolding |
| 1. Auth | 2 days | Phone OTP, dual onboarding |
| 2. Customer order flow | 4 days | The "magic moment" — upload photo, see AI sign, get estimate |
| 3. Agency marketplace | 3 days | Bids feed, bid submission, bid acceptance |
| 4. Contract & escrow | 3 days | Trust Me integration, payment hold/release |
| 5. Reviews & dashboards | 3 days | Closing the loop |
| 6. Polish | 4 days | Mobile, PWA, SEO, notifications |
| **Total MVP** | **~20 days** | Production-ready beta |

### Critical Risks & Mitigations

1. **Trust Me API availability** — their public API may be limited. Build the adapter pattern from day one so you can swap to alternatives (Documenta, eGov.kz e-signature, or a manual flow) without rewriting.

2. **AI image quality** — SDXL + ControlNet on a facade photo can produce strange results. Set realistic user expectations ("draft mockup, final design refined by agency") and let the chosen agency redraw before production.

3. **Agency cold start (chicken-and-egg)** — no orders means no agencies join, no agencies means customers leave. Mitigation: manually onboard 20–30 agencies in Almaty before launch with free first month. Subsidize the first 50 orders.

4. **City design code legal accuracy** — wrong info could cause customers to install illegal signage. Add a clear disclaimer: "Information is indicative. Final approval is the agency's responsibility."

5. **Escrow regulatory compliance in KZ** — holding customer money requires either a payment-institution license or partnering with a licensed escrow provider. Trust Me handles this if they're available; otherwise consult a KZ fintech lawyer before launch.

### Launch Checklist

- [ ] 20+ verified agencies onboarded in Almaty
- [ ] 10+ verified agencies in Astana
- [ ] Trust Me integration tested with real contracts
- [ ] Kaspi Pay integration tested with real payments
- [ ] Russian copy reviewed by a native KZ Russian speaker (Russia-Russian and KZ-Russian have subtle differences)
- [ ] Kazakh translation reviewed by a native Kazakh speaker
- [ ] Legal review of Terms of Service and escrow flow
- [ ] PostHog analytics live, key funnels tracked
- [ ] Support channel ready (Telegram bot + WhatsApp Business)

### Post-MVP Roadmap

- Native mobile apps (React Native / Expo)
- Expansion to other categories: interior design, printing, exhibition stands, vehicle wraps
- AI design refinement chat ("make it more modern", "use my brand colors")
- Agency-to-agency subcontracting marketplace
- Cross-border expansion: Uzbekistan, Kyrgyzstan (similar markets, similar gap)
