import { motion } from 'framer-motion';
import { ListChecks, Wallet, AlarmClock, CalendarDays } from 'lucide-react';
import { GlassCard } from './ui.jsx';

function isToday(dateStr) {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  const now = new Date();
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate();
}

export default function HeroStats({ tasks, netSavings, nextAlarm, nextEvent }) {
  const dueToday = tasks.filter((t) => t.status !== 'done' && isToday(t.dueAt)).length;
  const openTasks = tasks.filter((t) => t.status !== 'done').length;

  const stats = [
    {
      icon: ListChecks,
      accent: 'from-violet-500 to-fuchsia-500',
      label: 'Due today',
      value: dueToday,
      sub: `${openTasks} open total`,
    },
    {
      icon: Wallet,
      accent: 'from-emerald-400 to-teal-500',
      label: 'Net savings',
      value: `$${netSavings.toLocaleString(undefined, { maximumFractionDigits: 0 })}`,
      sub: netSavings >= 0 ? 'You are in the green' : 'Spending more than saving',
    },
    {
      icon: AlarmClock,
      accent: 'from-amber-400 to-orange-500',
      label: 'Next alarm',
      value: nextAlarm ? nextAlarm.time : '—',
      sub: nextAlarm ? nextAlarm.label : 'Nothing scheduled',
    },
    {
      icon: CalendarDays,
      accent: 'from-cyan-400 to-blue-500',
      label: 'Next event',
      value: nextEvent ? nextEvent.title : '—',
      sub: nextEvent ? new Date(nextEvent.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'Calendar is clear',
    },
  ];

  return (
    <GlassCard className="col-span-full overflow-hidden p-6 sm:p-7">
      <div className="mb-6 flex flex-col gap-1">
        <h1 className="font-[var(--font-display)] text-xl font-bold tracking-tight text-slate-50 sm:text-2xl">
          Your day at a glance
        </h1>
        <p className="text-sm text-slate-400">Everything that matters, pulled into one view.</p>
      </div>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05, duration: 0.35 }}
            className="rounded-xl border border-white/8 bg-white/[0.03] p-4"
          >
            <div className={`mb-3 flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br ${s.accent}`}>
              <s.icon size={15} className="text-white" />
            </div>
            <p className="tabular truncate text-lg font-semibold text-slate-50">{s.value}</p>
            <p className="text-xs font-medium text-slate-400">{s.label}</p>
            <p className="mt-0.5 truncate text-[11px] text-slate-500">{s.sub}</p>
          </motion.div>
        ))}
      </div>
    </GlassCard>
  );
}
