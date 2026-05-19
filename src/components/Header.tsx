import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { LanguageSwitcher } from './LanguageSwitcher';
import { RoleSwitcher } from './RoleSwitcher';

export async function Header() {
  const t = await getTranslations('nav');
  const brand = await getTranslations('brand');
  return (
    <header className="border-b border-slate-200/70 bg-white/70 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3">
        <Link href="/" className="flex items-center gap-2">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-white font-bold">
            A
          </span>
          <span className="font-semibold text-slate-900">{brand('name')}</span>
        </Link>
        <nav className="ml-6 hidden gap-1 md:flex">
          <Link className="btn-ghost" href="/marketplace">
            {t('marketplace')}
          </Link>
          <Link className="btn-ghost" href="/order/new">
            {t('newOrder')}
          </Link>
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <RoleSwitcher />
          <LanguageSwitcher />
        </div>
      </div>
    </header>
  );
}
