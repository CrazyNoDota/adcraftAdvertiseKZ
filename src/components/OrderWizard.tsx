'use client';

import { useEffect, useMemo, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  cities,
  signageTypes,
  agencies,
  cityName,
} from '@/lib/seed';
import { calculate, formatKZT } from '@/lib/pricing';
import { compressToDataUrl, generateMockup } from '@/lib/mockup';
import { SignPlacer } from '@/components/SignPlacer';
import { createOrder, simulateIncomingBids } from '@/lib/store';
import type {
  BusinessType,
  City,
  SignageTypeSlug,
} from '@/lib/types';
import type { Locale } from '@/i18n/config';

type FormState = {
  facadeDataUrl?: string;
  business_name: string;
  business_type: BusinessType;
  city_slug: City['slug'];
  signage_slug: SignageTypeSlug;
  width_m: number;
  height_m: number;
  illuminated: boolean;
  style_prefs?: string;
  mockup_data_url?: string;
};

const BUSINESS_TYPES: BusinessType[] = ['cafe', 'shop', 'salon', 'pharmacy', 'office', 'other'];

export function OrderWizard() {
  const t = useTranslations('order');
  const tCommon = useTranslations('common');
  const tBiz = useTranslations('businessTypes');
  const tSig = useTranslations('signageTypes');
  const locale = useLocale() as Locale;
  const router = useRouter();

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [generating, setGenerating] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [mockupSource, setMockupSource] = useState<'ai' | 'canvas' | null>(null);
  const [previewMode, setPreviewMode] = useState<'ai' | 'manual'>('ai');
  const [rateLimited, setRateLimited] = useState<null | { message: string; resetAt: number }>(null);

  const [form, setForm] = useState<FormState>({
    business_name: '',
    business_type: 'cafe',
    city_slug: 'almaty',
    signage_slug: 'channel_letters',
    width_m: 3,
    height_m: 0.6,
    illuminated: true,
  });

  const pricing = useMemo(
    () =>
      calculate({
        signage_slug: form.signage_slug,
        city_slug: form.city_slug,
        width_m: form.width_m,
        height_m: form.height_m,
        illuminated: form.illuminated,
      }),
    [form.signage_slug, form.city_slug, form.width_m, form.height_m, form.illuminated],
  );

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    const dataUrl = await compressToDataUrl(f);
    update('facadeDataUrl', dataUrl);
  }

  const [facadeComposite, setFacadeComposite] = useState<string | null>(null);

  async function doGenerate() {
    if (!form.facadeDataUrl) return;
    setGenerating(true);
    try {
      const result = await generateMockup(form.facadeDataUrl, {
        business_name: form.business_name || 'Brand',
        business_type: form.business_type,
        signage_slug: form.signage_slug,
        city_slug: form.city_slug,
        illuminated: form.illuminated,
        style_prefs: form.style_prefs,
      });
      update('mockup_data_url', result.primaryDataUrl);
      setFacadeComposite(result.facadeCompositeDataUrl);
      setMockupSource(result.source);
      if (result.fallbackReason?.kind === 'rate_limited') {
        setRateLimited({
          message: result.fallbackReason.message,
          resetAt: result.fallbackReason.resetAt,
        });
      } else {
        setRateLimited(null);
      }
      // If AI didn't work, take the user straight to the manual placer so
      // they can do something meaningful right away.
      setPreviewMode(result.source === 'ai' ? 'ai' : 'manual');
    } finally {
      setGenerating(false);
    }
  }

  // Auto-generate when arriving at step 3 the first time
  useEffect(() => {
    if (step === 3 && !form.mockup_data_url && form.facadeDataUrl) {
      doGenerate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  function doPublish() {
    setPublishing(true);
    const order = createOrder({
      business_name: form.business_name,
      business_type: form.business_type,
      city_slug: form.city_slug,
      signage_slug: form.signage_slug,
      width_m: form.width_m,
      height_m: form.height_m,
      illuminated: form.illuminated,
      style_prefs: form.style_prefs,
      facade_photo_data_url: form.facadeDataUrl,
      mockup_data_url: form.mockup_data_url,
      estimate_kzt: pricing.estimate_kzt,
      requires_approval: pricing.requires_approval,
    });
    simulateIncomingBids(order, agencies);
    router.push(`/order/${order.id}/bids?fresh=1`);
  }

  const canNext =
    (step === 1 && !!form.facadeDataUrl) ||
    (step === 2 && form.business_name.trim().length > 1) ||
    (step === 3 && !!form.mockup_data_url) ||
    step === 4;

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-2xl font-bold">{t('newTitle')}</h1>
      <p className="mt-1 text-sm text-slate-500">
        {t('step', { current: step, total: 4 })}
      </p>

      <Stepper step={step} labels={[t('step1'), t('step2'), t('step3'), t('step4')]} />

      <div className="card mt-6 p-6">
        {step === 1 && (
          <div>
            <label className="label">{t('step1')}</label>
            <label className="block cursor-pointer rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 hover:bg-slate-100 transition-colors">
              <input
                type="file"
                accept="image/*"
                onChange={onFileChange}
                className="sr-only"
              />
              {form.facadeDataUrl ? (
                <div className="p-3">
                  <img
                    src={form.facadeDataUrl}
                    alt=""
                    className="mx-auto max-h-80 rounded-lg"
                  />
                  <p className="mt-2 text-center text-xs text-slate-500">
                    {t('uploadSelected')}
                  </p>
                </div>
              ) : (
                <div className="px-6 py-16 text-center text-sm text-slate-500">
                  {t('uploadHint')}
                </div>
              )}
            </label>
          </div>
        )}

        {step === 2 && (
          <div className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="label">{t('businessName')}</label>
              <input
                className="input"
                placeholder={t('businessNamePlaceholder')}
                value={form.business_name}
                onChange={(e) => update('business_name', e.target.value)}
              />
            </div>
            <div>
              <label className="label">{t('businessType')}</label>
              <select
                className="input"
                value={form.business_type}
                onChange={(e) => update('business_type', e.target.value as BusinessType)}
              >
                {BUSINESS_TYPES.map((b) => (
                  <option key={b} value={b}>
                    {tBiz(b)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">{t('city')}</label>
              <select
                className="input"
                value={form.city_slug}
                onChange={(e) => update('city_slug', e.target.value as City['slug'])}
              >
                {cities.map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {cityName(c.slug, locale)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">{t('signageType')}</label>
              <select
                className="input"
                value={form.signage_slug}
                onChange={(e) => update('signage_slug', e.target.value as SignageTypeSlug)}
              >
                {signageTypes.map((s) => (
                  <option key={s.slug} value={s.slug}>
                    {tSig(s.slug)}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">{t('widthM')}</label>
                <input
                  type="number"
                  step="0.1"
                  min="0.3"
                  className="input"
                  value={form.width_m}
                  onChange={(e) => update('width_m', Number(e.target.value))}
                />
              </div>
              <div>
                <label className="label">{t('heightM')}</label>
                <input
                  type="number"
                  step="0.1"
                  min="0.2"
                  className="input"
                  value={form.height_m}
                  onChange={(e) => update('height_m', Number(e.target.value))}
                />
              </div>
            </div>
            <label className="inline-flex items-center gap-2 pt-7 text-sm">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-slate-300 text-brand-600"
                checked={form.illuminated}
                onChange={(e) => update('illuminated', e.target.checked)}
              />
              {t('illuminated')}
            </label>
            <div className="md:col-span-2">
              <label className="label">{t('stylePrefs')}</label>
              <textarea
                className="input min-h-[80px]"
                placeholder={t('stylePrefsPlaceholder')}
                value={form.style_prefs ?? ''}
                onChange={(e) => update('style_prefs', e.target.value)}
              />
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            {generating ? (
              <div className="rounded-xl bg-slate-100 p-12 text-center">
                <div className="mx-auto mb-3 h-10 w-10 animate-spin rounded-full border-4 border-brand-600 border-t-transparent" />
                <p className="text-sm text-slate-600">{t('generating')}</p>
              </div>
            ) : form.mockup_data_url ? (
              <div>
                {rateLimited && (
                  <div className="mb-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
                    <p className="font-semibold">⏳ {rateLimited.message}</p>
                    <p className="mt-1">
                      Лимит сбросится: <span className="font-mono">{new Date(rateLimited.resetAt).toLocaleString('ru-KZ')}</span>.
                      Пока вы можете настроить вывеску вручную ниже.
                    </p>
                  </div>
                )}
                <div className="mb-3 flex flex-wrap items-center justify-center gap-2 text-xs">
                  {mockupSource === 'ai' ? (
                    <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 font-semibold text-emerald-700">
                      ✨ AI-рендер на вашем фасаде
                    </span>
                  ) : (
                    <span className="rounded-full bg-amber-100 px-2.5 py-0.5 font-semibold text-amber-700">
                      Ручной композит
                    </span>
                  )}
                  {form.facadeDataUrl && (
                    <div className="ml-2 inline-flex overflow-hidden rounded-full border border-slate-200 bg-white text-[11px]">
                      <button
                        onClick={() => setPreviewMode('ai')}
                        className={`px-2.5 py-0.5 ${previewMode === 'ai' ? 'bg-slate-900 text-white' : 'text-slate-600'}`}
                      >
                        AI-рендер
                      </button>
                      <button
                        onClick={() => setPreviewMode('manual')}
                        className={`px-2.5 py-0.5 ${previewMode === 'manual' ? 'bg-slate-900 text-white' : 'text-slate-600'}`}
                      >
                        Подвинуть вручную
                      </button>
                    </div>
                  )}
                </div>

                {previewMode === 'manual' && form.facadeDataUrl ? (
                  <>
                    <SignPlacer
                      facadeDataUrl={form.facadeDataUrl}
                      spec={{
                        business_name: form.business_name || 'Brand',
                        business_type: form.business_type,
                        city_slug: form.city_slug,
                        signage_slug: form.signage_slug,
                        illuminated: form.illuminated,
                        style_prefs: form.style_prefs,
                      }}
                      onChange={(dataUrl) => {
                        setFacadeComposite(dataUrl);
                        update('mockup_data_url', dataUrl);
                      }}
                    />
                    <p className="mt-2 text-center text-[11px] text-slate-500">
                      Перетащите вывеску и потяните за уголок ⤡ — изменения сохраняются автоматически.
                    </p>
                  </>
                ) : (
                  <img
                    src={form.mockup_data_url}
                    alt=""
                    className="mx-auto max-h-[520px] rounded-xl shadow"
                  />
                )}

                <div className="mt-4 flex justify-center gap-2">
                  <button className="btn-secondary" onClick={doGenerate} disabled={generating}>
                    {t('regenerate')}
                  </button>
                </div>
              </div>
            ) : (
              <button className="btn-primary" onClick={doGenerate}>
                {t('generate')}
              </button>
            )}
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4">
            {form.mockup_data_url && (
              <img
                src={form.mockup_data_url}
                alt=""
                className="mx-auto max-h-72 rounded-xl shadow"
              />
            )}
            <div className="rounded-xl bg-slate-50 p-5">
              <p className="text-sm text-slate-500">{t('estimateTitle')}</p>
              <p className="mt-1 text-3xl font-bold text-slate-900">
                {formatKZT(pricing.estimate_kzt, locale)}
              </p>
              <p
                className={`mt-2 text-sm font-medium ${
                  pricing.requires_approval
                    ? 'text-amber-700'
                    : pricing.requires_approval === false
                      ? 'text-emerald-700'
                      : 'text-slate-500'
                }`}
              >
                {pricing.requires_approval
                  ? '⚠ ' + t('approvalRequired')
                  : pricing.requires_approval === false
                    ? '✓ ' + t('approvalNotRequired')
                    : '• ' + t('approvalUnknown')}
              </p>
            </div>
            <button
              className="btn-primary w-full"
              onClick={doPublish}
              disabled={publishing}
            >
              {publishing ? tCommon('loading') : t('publish')}
            </button>
          </div>
        )}
      </div>

      <div className="mt-6 flex justify-between">
        <button
          className="btn-secondary"
          onClick={() => setStep((s) => (s > 1 ? ((s - 1) as 1 | 2 | 3) : s))}
          disabled={step === 1}
        >
          {t('back')}
        </button>
        {step < 4 && (
          <button
            className="btn-primary"
            onClick={() => setStep((s) => ((s + 1) as 2 | 3 | 4))}
            disabled={!canNext}
          >
            {t('next')}
          </button>
        )}
      </div>
    </div>
  );
}

function Stepper({ step, labels }: { step: number; labels: string[] }) {
  return (
    <ol className="mt-5 grid grid-cols-4 gap-2">
      {labels.map((label, i) => {
        const n = i + 1;
        const state = n < step ? 'done' : n === step ? 'active' : 'pending';
        return (
          <li key={label} className="text-xs">
            <div
              className={`h-1.5 w-full rounded-full ${
                state === 'pending' ? 'bg-slate-200' : 'bg-brand-600'
              }`}
            />
            <p
              className={`mt-2 ${
                state === 'active'
                  ? 'font-semibold text-slate-900'
                  : 'text-slate-500'
              }`}
            >
              {label}
            </p>
          </li>
        );
      })}
    </ol>
  );
}
