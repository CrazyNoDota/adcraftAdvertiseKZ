'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { agencies, cityName } from '@/lib/seed';
import { formatKZT } from '@/lib/pricing';
import { acceptBid, getOrder, listBids } from '@/lib/store';
import type { Bid, Order } from '@/lib/types';
import type { Locale } from '@/i18n/config';

export function BidsView({ orderId }: { orderId: string }) {
  const t = useTranslations('bidsView');
  const tOrder = useTranslations('order');
  const tMkt = useTranslations('marketplace');
  const tSig = useTranslations('signageTypes');
  const locale = useLocale() as Locale;
  const sp = useSearchParams();
  const fresh = sp.get('fresh') === '1';

  const [order, setOrder] = useState<Order | undefined>();
  const [bids, setBids] = useState<Bid[]>([]);

  function refresh() {
    setOrder(getOrder(orderId));
    setBids(listBids(orderId).sort((a, b) => a.amount_kzt - b.amount_kzt));
  }

  useEffect(() => {
    refresh();
    const on = () => refresh();
    window.addEventListener('store-change', on);
    // Light polling while fresh, so bids appearing via setTimeout show up.
    const i = fresh ? window.setInterval(refresh, 1500) : undefined;
    return () => {
      window.removeEventListener('store-change', on);
      if (i) window.clearInterval(i);
    };
  }, [orderId, fresh]);

  if (!order) return <p className="text-sm text-slate-500">Заказ не найден.</p>;

  const winner = order.winning_bid_id ? bids.find((b) => b.id === order.winning_bid_id) : undefined;
  const winnerAgency = winner ? agencies.find((a) => a.id === winner.agency_id) : undefined;

  function onAccept(bidId: string) {
    acceptBid(orderId, bidId);
    refresh();
  }

  return (
    <div className="mx-auto max-w-4xl">
      {fresh && (
        <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
          <strong>{tOrder('publishedTitle')}</strong> — {tOrder('publishedBody', { city: cityName(order.city_slug, locale) })}
        </div>
      )}

      <div className="card overflow-hidden">
        {(order.mockup_data_url || order.facade_photo_data_url) && (
          <img
            src={order.mockup_data_url || order.facade_photo_data_url}
            alt=""
            className="max-h-72 w-full object-cover"
          />
        )}
        <div className="p-5">
          <h1 className="text-xl font-bold">{order.business_name}</h1>
          <p className="text-sm text-slate-500">
            {cityName(order.city_slug, locale)} · {tSig(order.signage_slug)} · {order.width_m}×{order.height_m} м
          </p>
          <div className="mt-3 flex gap-6">
            <div>
              <p className="text-xs text-slate-500">{tMkt('estimate')}</p>
              <p className="text-lg font-bold">{formatKZT(order.estimate_kzt, locale)}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">{tMkt('bidCount', { count: bids.length })}</p>
              <p className="text-lg font-bold">{bids.length}</p>
            </div>
          </div>
        </div>
      </div>

      <h2 className="mt-8 text-lg font-semibold">{t('title')}</h2>

      {winner && winnerAgency && (
        <div className="mt-3 rounded-xl bg-brand-50 border border-brand-100 p-4 text-sm">
          <p className="font-semibold text-brand-700">
            🏆 {t('winnerBanner', { agency: winnerAgency.company_name })}
          </p>
          <p className="mt-1 text-xs text-slate-500">{t('demoStub')}</p>
        </div>
      )}

      {bids.length === 0 ? (
        <div className="card mt-4 p-10 text-center text-sm text-slate-500">
          <div className="mx-auto mb-3 h-8 w-8 animate-pulse rounded-full bg-slate-200" />
          {t('noBids')}
        </div>
      ) : (
        <ul className="mt-4 grid gap-3">
          {bids.map((b) => {
            const agency = agencies.find((a) => a.id === b.agency_id);
            const isWinner = b.status === 'accepted';
            const delta = (b.amount_kzt - order.estimate_kzt) / order.estimate_kzt;
            return (
              <li
                key={b.id}
                className={`card p-5 ${isWinner ? 'ring-2 ring-brand-500' : ''}`}
              >
                <div className="flex flex-wrap items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{agency?.company_name ?? 'Agency'}</h3>
                      {agency && (
                        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">
                          ★ {agency.rating}
                        </span>
                      )}
                      {agency && (
                        <span className="text-xs text-slate-500">
                          · {t('completed')}: {agency.completed_orders}
                        </span>
                      )}
                    </div>
                    <p className="mt-2 text-sm text-slate-700">{b.message}</p>
                    {agency && (
                      <p className="mt-2 text-xs text-slate-500">{agency.portfolio_blurb}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold">{formatKZT(b.amount_kzt, locale)}</p>
                    <p className={`text-xs ${delta < 0 ? 'text-emerald-600' : delta > 0 ? 'text-amber-600' : 'text-slate-500'}`}>
                      {delta === 0 ? '—' : `${delta > 0 ? '+' : ''}${(delta * 100).toFixed(1)}%`}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">{t('etaDays', { days: b.eta_days })}</p>
                    <button
                      className={`mt-3 ${isWinner ? 'btn-secondary' : 'btn-primary'} text-sm`}
                      onClick={() => onAccept(b.id)}
                      disabled={!!order.winning_bid_id}
                    >
                      {isWinner ? t('accepted') : t('accept')}
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <div className="mt-6">
        <Link href="/marketplace" className="btn-ghost">
          ← {tMkt('title')}
        </Link>
      </div>
    </div>
  );
}
