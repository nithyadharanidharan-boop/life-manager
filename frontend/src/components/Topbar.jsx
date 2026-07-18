import { useEffect, useMemo, useState } from 'react';
import { Menu, Search, Bell, LogOut, ListChecks, StickyNote } from 'lucide-react';
import { IconButton } from './ui.jsx';

function useClock() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000 * 30);
    return () => clearInterval(t);
  }, []);
  return now;
}

export default function Topbar({ user, tasks, notes, onOpenMobileNav, onOpenPanel, onLogout }) {
  const now = useClock();
  const [query, setQuery] = useState('');
  const [profileOpen, setProfileOpen] = useState(false);

  const greeting = useMemo(() => {
    const h = now.getHours();
    if (h < 5) return 'Burning the midnight oil';
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    if (h < 21) return 'Good evening';
    return 'Good night';
  }, [now]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return null;
    const taskHits = tasks
      .filter((t) => t.title.toLowerCase().includes(q))
      .slice(0, 4)
      .map((t) => ({ kind: 'task', id: `t-${t.id}`, label: t.title }));
    const noteHits = (notes || [])
      .filter((n) => (n.title + ' ' + n.body).toLowerCase().includes(q))
      .slice(0, 4)
      .map((n) => ({ kind: 'note', id: `n-${n.id}`, label: n.title || n.body.slice(0, 40) }));
    return [...taskHits, ...noteHits];
  }, [query, tasks, notes]);

  const initials = (user?.username || user?.email || '?').slice(0, 1).toUpperCase();

  return (
    <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-white/10 bg-slate-950/50 px-4 py-3.5 backdrop-blur-xl sm:px-6 lg:px-8">
      <button
        aria-label="Open navigation"
        onClick={onOpenMobileNav}
        className="focus-ring flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-lg text-slate-300 hover:bg-white/5 lg:hidden"
      >
        <Menu size={19} />
      </button>

      <div className="hidden shrink-0 sm:block">
        <p className="font-[var(--font-display)] text-sm font-semibold text-slate-100">
          {greeting}
          {user?.username ? `, ${user.username}` : ''}
        </p>
        <p className="tabular text-xs text-slate-500">
          {now.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })} ·{' '}
          {now.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>

      <div className="relative ml-auto w-full max-w-xs">
        <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search tasks, notes…"
          aria-label="Search"
          className="focus-ring w-full rounded-lg border border-white/10 bg-white/5 py-2 pl-9 pr-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-cyan-400/50"
        />
        {results && (
          <div className="glass absolute left-0 right-0 top-11 z-30 max-h-64 overflow-y-auto rounded-xl p-1.5 shadow-2xl">
            {results.length === 0 ? (
              <p className="px-3 py-2 text-xs text-slate-500">No matches</p>
            ) : (
              results.map((r) => (
                <button
                  key={r.id}
                  onClick={() => {
                    onOpenPanel(r.kind === 'task' ? 'tasks' : 'notes');
                    setQuery('');
                  }}
                  className="focus-ring flex w-full cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-slate-200 hover:bg-white/5"
                >
                  {r.kind === 'task' ? (
                    <ListChecks size={14} className="shrink-0 text-violet-300" />
                  ) : (
                    <StickyNote size={14} className="shrink-0 text-amber-300" />
                  )}
                  <span className="truncate">{r.label}</span>
                </button>
              ))
            )}
          </div>
        )}
      </div>

      <IconButton icon={Bell} label="Notifications" />

      <div className="relative">
        <button
          onClick={() => setProfileOpen((v) => !v)}
          className="focus-ring flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-cyan-400 text-sm font-semibold text-white shadow-[var(--shadow-glow-violet)]"
          aria-label="Profile menu"
        >
          {initials}
        </button>
        {profileOpen && (
          <>
            <div className="fixed inset-0 z-30" onClick={() => setProfileOpen(false)} />
            <div className="glass absolute right-0 top-11 z-40 w-48 rounded-xl p-1.5 shadow-2xl">
              <div className="px-3 py-2">
                <p className="truncate text-sm font-medium text-slate-100">{user?.username || 'You'}</p>
                <p className="truncate text-xs text-slate-500">{user?.email}</p>
              </div>
              <button
                onClick={onLogout}
                className="focus-ring flex w-full cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-rose-300 hover:bg-rose-500/10"
              >
                <LogOut size={15} />
                Log out
              </button>
            </div>
          </>
        )}
      </div>
    </header>
  );
}
