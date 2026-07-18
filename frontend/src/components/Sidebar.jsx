import { AnimatePresence, motion } from 'framer-motion';
import {
  LayoutGrid,
  ListChecks,
  Wallet,
  CalendarDays,
  StickyNote,
  AlarmClock,
  Bot,
  Sparkles,
  X,
} from 'lucide-react';

const NAV_ITEMS = [
  { id: null, label: 'Home', icon: LayoutGrid },
  { id: 'tasks', label: 'Tasks', icon: ListChecks },
  { id: 'money', label: 'Money', icon: Wallet },
  { id: 'calendar', label: 'Calendar', icon: CalendarDays },
  { id: 'notes', label: 'Notes', icon: StickyNote },
  { id: 'alarms', label: 'Alarms', icon: AlarmClock },
];

function NavList({ active, onSelect, onAssistant }) {
  return (
    <nav className="flex flex-1 flex-col items-center gap-1.5 lg:items-stretch">
      {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
        const isActive = active === id;
        return (
          <button
            key={label}
            onClick={() => onSelect(id)}
            className={`focus-ring group relative flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors duration-150 lg:w-full ${
              isActive ? 'bg-white/10 text-white' : 'text-slate-400 hover:bg-white/5 hover:text-slate-100'
            }`}
            title={label}
          >
            {isActive && (
              <motion.span
                layoutId="nav-active-pill"
                className="absolute inset-0 rounded-xl bg-gradient-to-r from-violet-500/20 to-cyan-400/20 ring-1 ring-white/10"
                transition={{ type: 'spring', stiffness: 350, damping: 30 }}
              />
            )}
            <Icon size={19} strokeWidth={2} className="relative z-10 shrink-0" />
            <span className="relative z-10 hidden lg:inline">{label}</span>
          </button>
        );
      })}

      <button
        onClick={onAssistant}
        className="focus-ring mt-2 flex cursor-pointer items-center gap-3 rounded-xl bg-gradient-to-r from-violet-500/15 to-cyan-400/15 px-3 py-2.5 text-sm font-medium text-violet-200 ring-1 ring-violet-400/20 transition-colors duration-150 hover:from-violet-500/25 hover:to-cyan-400/25 lg:w-full"
        title="AI Assistant"
      >
        <Bot size={19} strokeWidth={2} className="shrink-0" />
        <span className="hidden lg:inline">Assistant</span>
      </button>
    </nav>
  );
}

export default function Sidebar({ active, onSelect, onAssistant, mobileOpen, onCloseMobile }) {
  return (
    <>
      {/* Desktop rail */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[84px] flex-col items-center gap-6 border-r border-white/10 bg-slate-950/60 py-6 backdrop-blur-xl lg:flex xl:w-[220px] xl:items-stretch xl:px-4">
        <div className="flex items-center gap-2 xl:px-2">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-cyan-400 shadow-[var(--shadow-glow-violet)]">
            <Sparkles size={18} className="text-white" />
          </div>
          <span className="hidden font-[var(--font-display)] text-lg font-bold text-slate-50 xl:inline">Nexus</span>
        </div>
        <NavList active={active} onSelect={onSelect} onAssistant={onAssistant} />
      </aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              key="backdrop"
              className="fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-sm lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onCloseMobile}
            />
            <motion.aside
              key="drawer"
              className="glass fixed inset-y-0 left-0 z-50 flex w-[260px] flex-col gap-6 border-r border-white/10 px-4 py-6 lg:hidden"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 32, stiffness: 320 }}
            >
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-cyan-400">
                    <Sparkles size={18} className="text-white" />
                  </div>
                  <span className="font-[var(--font-display)] text-lg font-bold text-slate-50">Nexus</span>
                </div>
                <button
                  aria-label="Close menu"
                  onClick={onCloseMobile}
                  className="focus-ring flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-slate-400 hover:bg-white/5"
                >
                  <X size={18} />
                </button>
              </div>
              <NavList
                active={active}
                onSelect={(id) => {
                  onSelect(id);
                  onCloseMobile();
                }}
                onAssistant={() => {
                  onAssistant();
                  onCloseMobile();
                }}
              />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
