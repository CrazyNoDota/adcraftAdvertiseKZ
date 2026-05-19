export const locales = ['ru', 'kk', 'en'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'ru';

export const localeLabels: Record<Locale, string> = {
  ru: 'РУС',
  kk: 'ҚАЗ',
  en: 'ENG',
};
