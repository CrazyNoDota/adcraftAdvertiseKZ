'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { getRole, setRole, type Role } from '@/lib/role';

export function RoleSwitcher() {
  const t = useTranslations('nav');
  const [role, setLocalRole] = useState<Role>('customer');

  useEffect(() => {
    setLocalRole(getRole());
  }, []);

  function toggle(next: Role) {
    setRole(next);
    setLocalRole(next);
  }

  return (
    <div
      className="hidden md:inline-flex rounded-xl border border-slate-200 bg-white p-0.5"
      role="group"
      aria-label="Role"
    >
      <button
        type="button"
        onClick={() => toggle('customer')}
        aria-pressed={role === 'customer'}
        className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors ${
          role === 'customer'
            ? 'bg-slate-900 text-white'
            : 'text-slate-600 hover:bg-slate-100'
        }`}
      >
        {t('roleCustomer')}
      </button>
      <button
        type="button"
        onClick={() => toggle('agency')}
        aria-pressed={role === 'agency'}
        className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors ${
          role === 'agency'
            ? 'bg-slate-900 text-white'
            : 'text-slate-600 hover:bg-slate-100'
        }`}
      >
        {t('roleAgency')}
      </button>
    </div>
  );
}
