'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';
import { getRole, setRole, type Role } from '@/lib/role';

/**
 * Two-way toggle in the header:
 *   - "Я заказчик"  → /order/new (start a new order)
 *   - "Я агентство" → /marketplace (browse open orders to bid on)
 * The choice is also persisted in localStorage so future visits land the
 * user back where they were.
 */
export function RoleSwitcher() {
  const t = useTranslations('nav');
  const router = useRouter();
  const pathname = usePathname();
  const [role, setLocalRole] = useState<Role>('customer');

  useEffect(() => {
    setLocalRole(getRole());
  }, []);

  // Keep the visual highlight in sync with where the user currently is.
  useEffect(() => {
    if (!pathname) return;
    if (pathname.startsWith('/marketplace') || pathname.includes('/bid')) {
      setLocalRole('agency');
    } else if (pathname.startsWith('/order')) {
      setLocalRole('customer');
    }
  }, [pathname]);

  function go(next: Role) {
    setRole(next);
    setLocalRole(next);
    router.push(next === 'customer' ? '/order/new' : '/marketplace');
  }

  const base = 'px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer';

  return (
    <div
      className="hidden md:inline-flex rounded-xl border border-slate-200 bg-white p-0.5"
      role="group"
      aria-label="Role"
    >
      <button
        type="button"
        onClick={() => go('customer')}
        aria-pressed={role === 'customer'}
        title="Перейти к созданию заказа"
        className={`${base} ${
          role === 'customer' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
        }`}
      >
        {t('roleCustomer')}
      </button>
      <button
        type="button"
        onClick={() => go('agency')}
        aria-pressed={role === 'agency'}
        title="Перейти к маркетплейсу заявок"
        className={`${base} ${
          role === 'agency' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
        }`}
      >
        {t('roleAgency')}
      </button>
    </div>
  );
}
