'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { listBids, listOrders } from '@/lib/store';
import { cityName, cities, signageTypes } from '@/lib/seed';
import { formatKZT } from '@/lib/pricing';
import type { Order, City } from '@/lib/types';
import type { Locale } from '@/i18n/config';

export function Marketplace() {
  const t = useTranslations('marketplace');
  const tSig = useTranslations('signageTypes');
  const locale = useLocale() as Locale;
  const [orders, setOrders] = useState<Order[]>([]);
  const [bidsCount, setBidsCount] = useState<Record<string, number>>({});
  const [cityFilter, setCityFilter] = useState<'all' | City['slug']>('all');

  function refresh() {
    const list = listOrders().filter((o) => o.status === 'open_for_bids' || o.status === 'assigned');
    setOrders(list);
    const allBids = listBids();
    const map: Record<string, number> = {};
    for (const b of allBids) map[b.order_id] = (map[b.order_id] ?? 0) + 1;
    setBidsCount(map);
  }

  useEffect(() => {
    refresh();
    const onChange = () => refresh();
    window.addEventListener('store-change', onChange);
    return () => window.removeEventListener('store-change', onChange);
  }, []);

  const filtered = cityFilter === 'all' ? orders : orders.filter((o) => o.city_slug === cityFilter);

  return (
    <div>
      <h1 className="text-2xl font-bold">{t('title')}</h1>
      <p className="mt-1 text-sm text-slate-500">{t('subtitle')}</p>

      <div className="mt-5 flex flex-wrap items-center gap-2">
        <span className="text-sm text-slate-600">{t('filterCity')}:</span>
        <button
          onClick={() => setCityFilter('all')}
          className={`rounded-full px-3 py-1 text-xs font-semibold ${
            cityFilter === 'all' ? 'bg-slate-900 text-white' : 'bg-white border border-slate-200 text-slate-700'
          }`}
        >
          {t('filterAll')}
        </button>
        {cities.map((c) => (
          <button
            key={c.slug}
            onClick={() => setCityFilter(c.slug)}
            className={`rounded-full px-3 py-1 text-xs font-semibold ${
              cityFilter === c.slug ? 'bg-slate-900 text-white' : 'bg-white border border-slate-200 text-slate-700'
            }`}
          >
            {cityName(c.slug, locale)}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="card mt-6 p-10 text-center text-sm text-slate-500">{t('empty')}</div>
      ) : (
        <ul className="mt-6 grid gap-4 md:grid-cols-2">
          {filtered.map((o) => (
            <li key={o.id} className="card overflow-hidden">
              {o.mockup_data_url || o.facade_photo_data_url ? (
                <img
                  src={o.mockup_data_url || o.facade_photo_data_url}
                  alt=""
                  className="h-40 w-full object-cover"
                />
              ) : (
                <div className="flex h-40 w-full items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 text-3xl font-bold text-slate-400">
                  {o.business_name.slice(0, 1)}
                </div>
              )}
              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-semibold text-slate-900">{o.business_name}</h3>
                    <p className="text-xs text-slate-500">
                      {cityName(o.city_slug, locale)} · {tSig(o.signage_slug)} · {o.width_m}×{o.height_m} м
                    </p>
                  </div>
                  <span className="rounded-full bg-brand-100 px-2 py-0.5 text-xs font-semibold text-brand-700">
                    {t('bidCount', { count: bidsCount[o.id] ?? 0 })}
                  </span>
                </div>
                <p className="mt-3 text-xs text-slate-500">{t('estimate')}</p>
                <p className="text-lg font-bold text-slate-900">{formatKZT(o.estimate_kzt, locale)}</p>
                <p className="mt-1 text-xs text-slate-400">{t('publishedAgo', { time: timeAgo(o.created_at, locale) })}</p>
                <div className="mt-4 flex gap-2">
                  <Link href={`/order/${o.id}/bid`} className="btn-primary flex-1 text-sm">
                    {t('openOrder')}
                  </Link>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function timeAgo(ts: number, locale: Locale): string {
  const diffMin = Math.max(1, Math.round((Date.now() - ts) / 60000));
  if (locale === 'en') {
    if (diffMin < 60) return `${diffMin} min ago`;
    const h = Math.round(diffMin / 60);
    if (h < 24) return `${h}h ago`;
    return `${Math.round(h / 24)}d ago`;
  }
  if (locale === 'kk') {
    if (diffMin < 60) return `${diffMin} мин бұрын`;
    const h = Math.round(diffMin / 60);
    if (h < 24) return `${h} сағат бұрын`;
    return `${Math.round(h / 24)} күн бұрын`;
  }
  if (diffMin < 60) return `${diffMin} мин назад`;
  const h = Math.round(diffMin / 60);
  if (h < 24) return `${h} ч. назад`;
  return `${Math.round(h / 24)} дн. назад`;
}
