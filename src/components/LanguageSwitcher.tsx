'use client';

import { useTransition } from 'react';
import { useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { locales, localeLabels, type Locale } from '@/i18n/config';

export function LanguageSwitcher() {
  const locale = useLocale() as Locale;
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function setLocale(next: Locale) {
    if (next === locale) return;
    document.cookie = `NEXT_LOCALE=${next};path=/;max-age=${60 * 60 * 24 * 365}`;
    startTransition(() => router.refresh());
  }

  return (
    <div
      className="inline-flex rounded-xl border border-slate-200 bg-white p-0.5"
      role="group"
      aria-label="Language"
    >
      {locales.map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => setLocale(l)}
          disabled={pending}
          aria-pressed={l === locale}
          className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors ${
            l === locale
              ? 'bg-brand-600 text-white'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          {localeLabels[l]}
        </button>
      ))}
    </div>
  );
}
