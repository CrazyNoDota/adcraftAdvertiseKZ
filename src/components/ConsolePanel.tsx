'use client';

import { useEffect, useState } from 'react';

type Status = {
  admin: boolean;
  quota: { used: number; limit: number; resetAt: number | null };
};

export function ConsolePanel() {
  const [status, setStatus] = useState<Status | null>(null);
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function load() {
    const r = await fetch('/api/admin/status', { cache: 'no-store' });
    setStatus(await r.json());
  }

  useEffect(() => {
    load();
  }, []);

  async function login(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    try {
      const r = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      if (!r.ok) {
        const j = await r.json().catch(() => ({}));
        throw new Error(j.error || 'Login failed');
      }
      setPassword('');
      await load();
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Login failed');
    } finally {
      setBusy(false);
    }
  }

  async function logout() {
    setBusy(true);
    await fetch('/api/admin/logout', { method: 'POST' });
    await load();
    setBusy(false);
  }

  if (!status) {
    return <div className="text-sm text-slate-500">Загрузка…</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="h-display text-2xl font-semibold text-ink">Console</h1>
        <p className="mt-1 text-xs text-slate-500">
          {status.admin ? 'Сессия администратора активна.' : 'Закрытая страница. Не индексируется, не упоминается в навигации.'}
        </p>
      </div>

      {status.admin ? (
        <>
          <div className="card p-5">
            <p className="text-sm font-semibold text-emerald-700">✓ Admin mode</p>
            <p className="mt-1 text-xs text-slate-500">
              Этот браузер обходит лимит 2 генерации / 3 часа на /api/mockup.
            </p>
            <button onClick={logout} disabled={busy} className="btn-secondary mt-4 text-sm">
              Выйти
            </button>
          </div>

          <div className="card p-5">
            <p className="text-sm font-semibold">Лимит этого браузера (как у обычного посетителя)</p>
            <p className="mt-2 text-xs text-slate-500">
              Использовано: <span className="font-mono">{status.quota.used} / {status.quota.limit}</span>
              {status.quota.resetAt && (
                <> · сброс: <span className="font-mono">{new Date(status.quota.resetAt).toLocaleString('ru-KZ')}</span></>
              )}
            </p>
          </div>
        </>
      ) : (
        <form onSubmit={login} className="card space-y-3 p-5">
          <label className="label">Пароль</label>
          <input
            type="password"
            className="input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoFocus
            autoComplete="current-password"
          />
          {err && <p className="text-xs text-red-600">{err}</p>}
          <button type="submit" disabled={busy || !password} className="btn-primary w-full">
            {busy ? '…' : 'Войти'}
          </button>
        </form>
      )}
    </div>
  );
}
