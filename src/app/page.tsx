import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { agencies } from '@/lib/seed';
import { siteImages } from '@/lib/site-images';
import { Container } from '@/components/Container';
import { Reveal } from '@/components/Reveal';
import { Marquee } from '@/components/Marquee';
import { Counter } from '@/components/Counter';
import { SafeImage } from '@/components/SafeImage';
import { BeforeAfter } from '@/components/BeforeAfter';

export default async function Home() {
  const t = await getTranslations('landing');

  return (
    <>
      <Hero t={t} />
      <AgenciesStrip label={t('agenciesStripLabel')} />
      <HowItWorks t={t} />
      <Stats t={t} />
      <Gallery t={t} />
      <Testimonials t={t} />
      <FAQ t={t} />
      <FinalCTA t={t} />
    </>
  );
}

type T = Awaited<ReturnType<typeof getTranslations<'landing'>>>;

function Hero({ t }: { t: T }) {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-grid opacity-70" />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 -right-24 h-[520px] w-[520px] rounded-full bg-brand-200/60 blur-3xl animate-blob"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-40 -left-20 h-[460px] w-[460px] rounded-full bg-amber-200/50 blur-3xl animate-blob"
        style={{ animationDelay: '3s' }}
      />
      <Container className="relative grid items-center gap-12 py-16 md:grid-cols-[1.05fr_1fr] md:py-24">
        <div>
          <Reveal>
            <p className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-3 py-1 text-xs font-medium text-slate-600 backdrop-blur">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              {t('kicker')}
            </p>
          </Reveal>
          <Reveal delay={0.05}>
            <h1 className="h-display mt-5 text-4xl font-semibold text-ink md:text-6xl">
              {t('heroTitle')}
            </h1>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-slate-600">
              {t('heroSubtitle')}
            </p>
          </Reveal>
          <Reveal delay={0.15}>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/order/new" className="btn-primary">
                {t('ctaCustomer')}
                <svg className="ml-2 h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M13 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
              <Link href="/marketplace" className="btn-secondary">
                {t('ctaAgency')}
              </Link>
            </div>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="mt-5 text-xs text-amber-700/90">{t('trustNote')}</p>
          </Reveal>
        </div>

        <Reveal delay={0.2}>
          <div className="relative">
            <div className="card relative aspect-[4/5] overflow-hidden md:aspect-[4/3]">
              <SafeImage
                src={siteImages.hero}
                alt="Фасад с установленной вывеской"
                className="h-full w-full object-cover"
                tone="warm"
                fallback={<HeroFallbackArt />}
              />
            </div>
            {/* Floating preview chip */}
            <div className="absolute -bottom-5 -left-5 hidden w-56 rotate-[-3deg] rounded-2xl bg-white p-3 shadow-xl ring-1 ring-slate-200 md:block">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                Расчёт за 2 сек
              </p>
              <p className="mt-1 text-2xl font-bold text-ink">392 000 ₸</p>
              <p className="mt-1 text-xs text-slate-500">Объёмные буквы, 3.5×0.6 м</p>
            </div>
            <div className="absolute -top-4 -right-4 hidden rotate-[3deg] rounded-xl bg-emerald-500/95 px-3 py-1.5 text-xs font-semibold text-white shadow-lg md:block">
              ★ 4.9 рейтинг
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}

function HeroFallbackArt() {
  return (
    <svg viewBox="0 0 400 300" className="h-full w-full">
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fde68a" />
          <stop offset="1" stopColor="#fca5a5" />
        </linearGradient>
        <linearGradient id="wall" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#cbd5e1" />
          <stop offset="1" stopColor="#94a3b8" />
        </linearGradient>
      </defs>
      <rect width="400" height="300" fill="url(#sky)" />
      <rect x="0" y="60" width="400" height="240" fill="url(#wall)" />
      <rect x="0" y="270" width="400" height="30" fill="#475569" />
      <rect x="60" y="130" width="80" height="100" fill="#1e293b" opacity="0.5" />
      <rect x="260" y="130" width="80" height="100" fill="#1e293b" opacity="0.5" />
      <rect x="170" y="160" width="60" height="110" fill="#0f172a" />
      <rect x="60" y="68" width="280" height="46" rx="8" fill="#0b2447" />
      <text
        x="200"
        y="100"
        textAnchor="middle"
        fontFamily="system-ui"
        fontSize="26"
        fontWeight="800"
        fill="#fde68a"
        style={{ filter: 'drop-shadow(0 0 6px rgba(253,224,71,0.7))' }}
      >
        AROMA
      </text>
    </svg>
  );
}

function AgenciesStrip({ label }: { label: string }) {
  return (
    <section className="border-y border-slate-200/60 bg-white/70 py-8">
      <Container>
        <p className="mb-5 text-center text-xs font-semibold uppercase tracking-widest text-slate-500">
          {label}
        </p>
        <Marquee>
          {siteImages.agencies.map((src, i) => (
            <div key={i} className="flex h-14 w-36 items-center justify-center opacity-80 transition hover:opacity-100">
              <SafeImage
                src={src}
                alt=""
                className="max-h-14 w-auto object-contain"
                tone="mono"
                fallback={
                  <span className="text-sm font-bold tracking-tight text-slate-400">
                    {src.split('/').pop()?.replace(/\.(webp|png|jpg)$/, '').toUpperCase()}
                  </span>
                }
              />
            </div>
          ))}
        </Marquee>
      </Container>
    </section>
  );
}

function HowItWorks({ t }: { t: T }) {
  const steps = [
    { num: 1, title: t('step1Title'), body: t('step1Body'), img: siteImages.steps.step1, tone: 'warm' as const },
    { num: 2, title: t('step2Title'), body: t('step2Body'), img: siteImages.steps.step2, tone: 'brand' as const },
    { num: 3, title: t('step3Title'), body: t('step3Body'), img: siteImages.steps.step3, tone: 'cool' as const },
  ];
  return (
    <section className="py-20">
      <Container>
        <Reveal>
          <h2 className="h-display text-3xl font-semibold text-ink md:text-4xl">{t('howItWorksTitle')}</h2>
          <p className="mt-3 max-w-xl text-slate-600">{t('howItWorksSubtitle')}</p>
        </Reveal>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {steps.map((s, i) => (
            <Reveal key={s.num} delay={i * 0.08}>
              <article className="card group h-full overflow-hidden transition hover:-translate-y-1 hover:shadow-xl">
                <div className="relative aspect-[4/3] overflow-hidden">
                  <SafeImage src={s.img} alt={s.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" tone={s.tone} />
                  <div className="absolute left-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-white/95 text-sm font-bold shadow ring-1 ring-slate-200">
                    {s.num}
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="text-lg font-semibold text-ink">{s.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{s.body}</p>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}

function Stats({ t }: { t: T }) {
  const items = [
    { value: 500, suffix: '+', label: t('stat1') },
    { value: 5, suffix: '', label: t('stat2') },
    { value: 18, suffix: '%', label: t('stat3') },
    { value: 6, suffix: '', label: t('stat4') },
  ];
  return (
    <section className="py-16">
      <Container>
        <Reveal>
          <div className="rounded-3xl bg-ink p-8 text-white md:p-14">
            <h2 className="h-display text-2xl font-semibold md:text-3xl">{t('statsTitle')}</h2>
            <ul className="mt-8 grid gap-6 sm:grid-cols-2 md:grid-cols-4">
              {items.map((s, i) => (
                <li key={i}>
                  <p className="text-4xl font-semibold md:text-5xl">
                    <Counter to={s.value} suffix={s.suffix} />
                  </p>
                  <p className="mt-2 text-sm text-white/60">{s.label}</p>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}

function Gallery({ t }: { t: T }) {
  return (
    <section className="py-20">
      <Container>
        <Reveal>
          <h2 className="h-display text-3xl font-semibold text-ink md:text-4xl">{t('galleryTitle')}</h2>
          <p className="mt-3 max-w-xl text-slate-600">{t('gallerySubtitle')}</p>
        </Reveal>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {siteImages.mockups.map((m, i) => (
            <Reveal key={i} delay={i * 0.08}>
              <BeforeAfter before={m.before} after={m.after} label={m.label} />
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}

function Testimonials({ t }: { t: T }) {
  const items = [
    { name: t('t1Name'), role: t('t1Role'), body: t('t1Body'), avatar: siteImages.avatars[0] },
    { name: t('t2Name'), role: t('t2Role'), body: t('t2Body'), avatar: siteImages.avatars[1] },
    { name: t('t3Name'), role: t('t3Role'), body: t('t3Body'), avatar: siteImages.avatars[2] },
  ];
  return (
    <section className="py-20">
      <Container>
        <Reveal>
          <h2 className="h-display text-3xl font-semibold text-ink md:text-4xl">{t('testimonialsTitle')}</h2>
        </Reveal>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {items.map((q, i) => (
            <Reveal key={i} delay={i * 0.08}>
              <figure className="card flex h-full flex-col p-6">
                <svg className="h-6 w-6 text-brand-500" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M7.17 6A5.17 5.17 0 0 0 2 11.17V18h6.17v-6.83H5.5C5.5 9.46 6.46 8.5 7.5 8.5h.67V6h-1Zm10 0a5.17 5.17 0 0 0-5.17 5.17V18H18.17v-6.83H15.5C15.5 9.46 16.46 8.5 17.5 8.5h.67V6h-1Z" />
                </svg>
                <blockquote className="mt-3 flex-1 text-sm leading-relaxed text-slate-700">«{q.body}»</blockquote>
                <figcaption className="mt-5 flex items-center gap-3">
                  <SafeImage
                    src={q.avatar}
                    alt={q.name}
                    className="h-10 w-10 rounded-full object-cover"
                    tone="warm"
                    fallback={
                      <span className="grid h-10 w-10 place-items-center rounded-full bg-slate-200 text-sm font-bold text-slate-600">
                        {q.name.slice(0, 1)}
                      </span>
                    }
                  />
                  <div>
                    <p className="text-sm font-semibold text-ink">{q.name}</p>
                    <p className="text-xs text-slate-500">{q.role}</p>
                  </div>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}

function FAQ({ t }: { t: T }) {
  const items = [
    { q: t('faq1Q'), a: t('faq1A') },
    { q: t('faq2Q'), a: t('faq2A') },
    { q: t('faq3Q'), a: t('faq3A') },
    { q: t('faq4Q'), a: t('faq4A') },
  ];
  return (
    <section className="py-20">
      <Container size="narrow">
        <Reveal>
          <h2 className="h-display text-3xl font-semibold text-ink md:text-4xl">{t('faqTitle')}</h2>
        </Reveal>
        <div className="mt-8 divide-y divide-slate-200 rounded-2xl border border-slate-200 bg-white">
          {items.map((f, i) => (
            <details key={i} className="group p-5 open:bg-slate-50/50">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-base font-medium text-ink">
                {f.q}
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-slate-200 text-slate-500 transition-transform group-open:rotate-45">
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 5v14M5 12h14" strokeLinecap="round" />
                  </svg>
                </span>
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-slate-600">{f.a}</p>
            </details>
          ))}
        </div>
      </Container>
    </section>
  );
}

function FinalCTA({ t }: { t: T }) {
  return (
    <section className="py-20">
      <Container>
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-600 via-brand-700 to-ink p-10 text-white md:p-16">
            <div aria-hidden className="pointer-events-none absolute -top-20 right-0 h-60 w-60 rounded-full bg-white/10 blur-3xl" />
            <div aria-hidden className="pointer-events-none absolute -bottom-20 left-10 h-60 w-60 rounded-full bg-amber-300/20 blur-3xl" />
            <h2 className="h-display relative text-3xl font-semibold md:text-5xl">{t('finalCtaTitle')}</h2>
            <p className="relative mt-3 max-w-xl text-white/80">{t('finalCtaBody')}</p>
            <div className="relative mt-7 flex flex-wrap gap-3">
              <Link href="/order/new" className="btn bg-white text-ink hover:bg-white/90 px-6 py-3">
                {t('ctaCustomer')}
                <svg className="ml-2 h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M13 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
              <Link href="/marketplace" className="btn border border-white/30 text-white hover:bg-white/10 px-6 py-3">
                {t('ctaAgency')}
              </Link>
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
