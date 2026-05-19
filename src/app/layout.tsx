import type { Metadata } from 'next';
import { Inter, Manrope } from 'next/font/google';
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages } from 'next-intl/server';
import { Analytics } from '@vercel/analytics/react';
import { Header } from '@/components/Header';
import { SmoothScroll } from '@/components/SmoothScroll';
import './globals.css';

const inter = Inter({
  subsets: ['latin', 'cyrillic', 'cyrillic-ext'],
  variable: '--font-sans',
  display: 'swap',
});
const manrope = Manrope({
  subsets: ['latin', 'cyrillic', 'cyrillic-ext'],
  variable: '--font-display',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'AdvertMarket KZ — закажите вывеску за 5 минут',
  description:
    'Маркетплейс наружной рекламы Казахстана. Загрузите фото фасада, получите AI-макет и предложения от проверенных агентств.',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale} className={`${inter.variable} ${manrope.variable}`}>
      <body>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <SmoothScroll />
          <Header />
          <main>{children}</main>
          <footer className="mt-20 border-t border-slate-200/60 bg-white/60">
            <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-10 text-xs text-slate-500 md:flex-row md:items-center md:justify-between">
              <p>© {new Date().getFullYear()} AdvertMarket KZ · demo build</p>
              <p className="text-slate-400">
                Сделано с заботой о казахстанском бизнесе · Алматы / Астана / Шымкент
              </p>
            </div>
          </footer>
          <Analytics />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
