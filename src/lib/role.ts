export type Role = 'customer' | 'agency';

const KEY = 'reklama_kz_role';

export function getRole(): Role {
  if (typeof window === 'undefined') return 'customer';
  const v = window.localStorage.getItem(KEY);
  return v === 'agency' ? 'agency' : 'customer';
}

export function setRole(role: Role) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(KEY, role);
  window.dispatchEvent(new Event('role-change'));
}
