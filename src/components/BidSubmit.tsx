'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { agencies, cityName } from '@/lib/seed';
import { formatKZT } from '@/lib/pricing';
import { createBid, getOrder, listBids } from '@/lib/store';
import type { Order } from '@/lib/types';
import type { Locale } from '@/i18n/config';

export function BidSubmit({ orderId }: { orderId: string }) {
  const t = useTranslations('bid');
  const tMkt = useTranslations('marketplace');
  const tSig = useTranslations('signageTypes');
  const locale = useLocale() as Locale;

  const [order, setOrder] = useState<Order | undefined>();
  const [submitted, setSubmitted] = useState(false);
  const [bidsCount, setBidsCount] = useState(0);

  // Pick an "agency" identity for the demo — first agency in this city.
  const myAgency = useMemo(() => {
    if (!order) return undefined;
    return agencies.find((a) => a.city_slug === order.city_slug) ?? agencies[0];
  }, [order]);

  const [amount, setAmount] = useState<number>(0);
  const [eta, setEta] = useState<number>(10);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const found = getOrder(orderId);
    setOrder(found);
    if (found) {
      setAmount(Math.round((found.estimate_kzt * 0.95) / 1000) * 1000);
      setBidsCount(listBids(found.id).length);
    }
  }, [orderId]);

  if (!order) {
    return <p className="text-sm text-slate-500">Заказ не найден.</p>;
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!myAgency || !order) return;
    createBid({
      order_id: order.id,
      agency_id: myAgency.id,
      amount_kzt: amount,
      eta_days: eta,
      message: message.trim() || '—',
    });
    setSubmitted(true);
  }

  const delta = order.estimate_kzt > 0 ? (amount - order.estimate_kzt) / order.estimate_kzt : 0;
  const deltaPct = (delta * 100).toFixed(1);

  return (
    <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-[1fr_360px]">
      <div className="card overflow-hidden">
        {(order.mockup_data_url || order.facade_photo_data_url) && (
          <img
            src={order.mockup_data_url || order.facade_photo_data_url}
            alt=""
            className="max-h-[420px] w-full object-cover"
          />
        )}
        <div className="p-6">
          <h1 className="text-xl font-bold">{order.business_name}</h1>
          <p className="mt-1 text-sm text-slate-500">
            {cityName(order.city_slug, locale)} · {tSig(order.signage_slug)} · {order.width_m}×{order.height_m} м
            {order.illuminated ? ' · с подсветкой' : ''}
          </p>
          {order.style_prefs && (
            <p className="mt-3 rounded-lg bg-slate-50 p-3 text-sm text-slate-700">
              «{order.style_prefs}»
            </p>
          )}
          <div className="mt-5 grid grid-cols-2 gap-4 rounded-xl bg-slate-50 p-4">
            <div>
              <p className="text-xs text-slate-500">{tMkt('estimate')}</p>
              <p className="text-lg font-bold">{formatKZT(order.estimate_kzt, locale)}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">{tMkt('bidCount', { count: bidsCount })}</p>
              <p className="text-lg font-bold">{bidsCount}</p>
            </div>
          </div>
          <Link href={`/order/${order.id}/bids`} className="btn-secondary mt-4 inline-flex">
            ← К заявкам заказчика
          </Link>
        </div>
      </div>

      <div className="card p-6">
        {submitted ? (
          <div className="text-center">
            <div className="mx-auto mb-3 h-12 w-12 rounded-full bg-emerald-100 text-2xl leading-[3rem] text-emerald-700">
              ✓
            </div>
            <h2 className="text-lg font-semibold">{t('submitted')}</h2>
            <p className="mt-2 text-sm text-slate-500">
              {myAgency?.company_name}
            </p>
            <Link href="/marketplace" className="btn-secondary mt-5 inline-flex">
              ← Маркетплейс
            </Link>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-4">
            <h2 className="text-lg font-semibold">{t('submitTitle')}</h2>
            {myAgency && (
              <p className="text-xs text-slate-500">от имени: {myAgency.company_name}</p>
            )}
            <div>
              <label className="label">{t('amount')}</label>
              <input
                type="number"
                step="1000"
                min="0"
                className="input"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                required
              />
              <p className={`mt-1 text-xs ${delta < 0 ? 'text-emerald-600' : delta > 0 ? 'text-amber-600' : 'text-slate-500'}`}>
                {delta === 0 ? '—' : `${delta > 0 ? '+' : ''}${deltaPct}% ${t('vsEstimate')}`}
              </p>
            </div>
            <div>
              <label className="label">{t('etaDays')}</label>
              <input
                type="number"
                min="1"
                className="input"
                value={eta}
                onChange={(e) => setEta(Number(e.target.value))}
                required
              />
            </div>
            <div>
              <label className="label">{t('message')}</label>
              <textarea
                className="input min-h-[100px]"
                placeholder={t('messagePlaceholder')}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </div>
            <button type="submit" className="btn-primary w-full">
              {t('submit')}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
