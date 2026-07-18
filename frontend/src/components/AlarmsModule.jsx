import { useState } from 'react';
import { AlarmClock, Plus, Trash2, ChevronRight } from 'lucide-react';
import { AccentIcon, Button, EmptyState, GlassCard, Input, SlideOver, Toggle } from './ui.jsx';

const DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export function getNextAlarm(alarms) {
  const enabled = alarms.filter((a) => a.enabled);
  if (enabled.length === 0) return null;

  const now = new Date();
  let best = null;

  for (const alarm of enabled) {
    const [h, m] = alarm.time.split(':').map(Number);
    const days = alarm.days?.length ? alarm.days : [0, 1, 2, 3, 4, 5, 6];
    for (let offset = 0; offset < 8; offset++) {
      const candidate = new Date(now);
      candidate.setDate(now.getDate() + offset);
      candidate.setHours(h, m, 0, 0);
      if (candidate <= now) continue;
      if (!days.includes(candidate.getDay())) continue;
      if (!best || candidate < best.date) best = { date: candidate, label: alarm.label, time: alarm.time };
      break;
    }
  }
  return best;
}

function AlarmRow({ alarm, onToggle, onDelete, showDelete }) {
  return (
    <div className="group flex items-center gap-3 rounded-xl border border-white/8 bg-white/[0.03] px-3 py-2.5">
      <div className="min-w-0 flex-1">
        <p className="tabular text-sm font-semibold text-slate-100">{alarm.time}</p>
        <p className="truncate text-xs text-slate-500">
          {alarm.label || 'Alarm'} · {alarm.days?.length ? alarm.days.map((d) => DAY_LABELS[d]).join(' ') : 'Every day'}
        </p>
      </div>
      <Toggle checked={alarm.enabled} onChange={() => onToggle(alarm)} label={`Toggle ${alarm.label}`} />
      {showDelete && (
        <button
          aria-label="Delete alarm"
          onClick={() => onDelete(alarm)}
          className="focus-ring flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-lg text-slate-500 opacity-0 transition-opacity duration-150 hover:bg-rose-500/10 hover:text-rose-300 group-hover:opacity-100"
        >
          <Trash2 size={14} />
        </button>
      )}
    </div>
  );
}

export function AlarmsWidget({ alarms, onToggle, onOpen }) {
  const top = [...alarms].sort((a, b) => a.time.localeCompare(b.time)).slice(0, 3);
  return (
    <GlassCard className="col-span-full flex flex-col p-5 sm:col-span-1" onClick={onOpen}>
      <div className="mb-4 flex items-center gap-3">
        <AccentIcon icon={AlarmClock} accent="amber" />
        <div className="min-w-0 flex-1">
          <h3 className="font-[var(--font-display)] text-sm font-semibold text-slate-100">Alarms</h3>
          <p className="text-xs text-slate-500">{alarms.filter((a) => a.enabled).length} active</p>
        </div>
        <ChevronRight size={16} className="text-slate-500" />
      </div>
      <div className="flex flex-1 flex-col gap-2">
        {top.length === 0 ? (
          <EmptyState icon={AlarmClock} title="No alarms" hint="Click to set one" />
        ) : (
          top.map((a) => <AlarmRow key={a.id} alarm={a} onToggle={onToggle} />)
        )}
      </div>
    </GlassCard>
  );
}

export function AlarmsPanel({ open, onClose, alarms, onCreate, onToggle, onDelete }) {
  const [form, setForm] = useState({ label: '', time: '07:00', days: [] });

  const toggleDay = (i) =>
    setForm((f) => ({ ...f, days: f.days.includes(i) ? f.days.filter((d) => d !== i) : [...f.days, i].sort() }));

  const submit = (e) => {
    e.preventDefault();
    onCreate({ ...form, enabled: true });
    setForm({ label: '', time: '07:00', days: [] });
  };

  return (
    <SlideOver open={open} onClose={onClose} title="Alarms" icon={AlarmClock} accent="amber">
      <form onSubmit={submit} className="mb-6 flex flex-col gap-3 rounded-xl border border-white/8 bg-white/[0.03] p-4">
        <div className="grid grid-cols-2 gap-3">
          <Input label="Time" type="time" value={form.time} onChange={(e) => setForm((f) => ({ ...f, time: e.target.value }))} />
          <Input
            label="Label"
            placeholder="Wake up"
            value={form.label}
            onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))}
          />
        </div>
        <div>
          <span className="mb-1.5 block text-xs font-medium text-slate-400">Repeat (optional)</span>
          <div className="flex gap-1.5">
            {DAY_LABELS.map((d, i) => (
              <button
                key={i}
                type="button"
                onClick={() => toggleDay(i)}
                className={`focus-ring h-8 w-8 cursor-pointer rounded-lg text-xs font-medium transition-colors duration-150 ${
                  form.days.includes(i) ? 'bg-gradient-to-br from-amber-400 to-orange-500 text-white' : 'bg-white/5 text-slate-400 hover:bg-white/10'
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>
        <Button type="submit" icon={Plus} className="justify-center">
          Add alarm
        </Button>
      </form>

      <div className="flex flex-col gap-2">
        {alarms.length === 0 ? (
          <EmptyState icon={AlarmClock} title="No alarms yet" />
        ) : (
          [...alarms]
            .sort((a, b) => a.time.localeCompare(b.time))
            .map((a) => <AlarmRow key={a.id} alarm={a} onToggle={onToggle} onDelete={onDelete} showDelete />)
        )}
      </div>
    </SlideOver>
  );
}
