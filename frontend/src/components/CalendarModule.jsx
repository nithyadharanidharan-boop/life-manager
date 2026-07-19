import { useMemo, useState } from 'react';
import { CalendarDays, Plus, ChevronRight, ChevronLeft, Trash2 } from 'lucide-react';
import { AccentIcon, Button, EmptyState, GlassCard, Input, SlideOver } from './ui.jsx';

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

function toKey(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function buildMonth(cursor) {
  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const first = new Date(year, month, 1);
  const startOffset = first.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < startOffset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));
  return cells;
}

function MonthGrid({ cursor, setCursor, eventDates, selected, onSelect, compact }) {
  const cells = useMemo(() => buildMonth(cursor), [cursor]);
  const todayKey = toKey(new Date());

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <p className="font-[var(--font-display)] text-sm font-semibold text-slate-100">
          {cursor.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
        </p>
        <div className="flex gap-1">
          <button
            aria-label="Previous month"
            onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))}
            className="focus-ring flex h-6 w-6 cursor-pointer items-center justify-center rounded-md text-slate-400 hover:bg-white/5"
          >
            <ChevronLeft size={14} />
          </button>
          <button
            aria-label="Next month"
            onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))}
            className="focus-ring flex h-6 w-6 cursor-pointer items-center justify-center rounded-md text-slate-400 hover:bg-white/5"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>
      <div className={`grid grid-cols-7 gap-1 text-center ${compact ? 'text-[10px]' : 'text-xs'}`}>
        {WEEKDAYS.map((w, i) => (
          <div key={i} className="py-1 font-medium text-slate-500">
            {w}
          </div>
        ))}
        {cells.map((d, i) => {
          if (!d) return <div key={i} />;
          const key = toKey(d);
          const isToday = key === todayKey;
          const hasEvent = eventDates.has(key);
          const isSelected = selected === key;
          return (
            <button
              key={i}
              onClick={() => onSelect(key)}
              className={`focus-ring relative cursor-pointer rounded-lg py-1.5 transition-colors duration-150 ${
                isSelected
                  ? 'bg-gradient-to-br from-violet-500 to-cyan-400 font-semibold text-white'
                  : isToday
                    ? 'bg-white/10 font-semibold text-slate-100'
                    : 'text-slate-300 hover:bg-white/5'
              }`}
            >
              {d.getDate()}
              {hasEvent && !isSelected && (
                <span className="absolute bottom-0.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-cyan-400" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function CalendarWidget({ events, onOpen }) {
  const upcoming = useMemo(
    () =>
      [...events]
        .filter((e) => new Date(`${e.date}T${e.time || '00:00'}`) >= new Date(new Date().toDateString()))
        .sort((a, b) => new Date(`${a.date}T${a.time || '00:00'}`) - new Date(`${b.date}T${b.time || '00:00'}`))
        .slice(0, 2),
    [events]
  );

  return (
    <GlassCard className="col-span-full flex flex-col p-5 sm:col-span-1" onClick={onOpen}>
      <div className="mb-4 flex items-center gap-3">
        <AccentIcon icon={CalendarDays} accent="cyan" />
        <div className="min-w-0 flex-1">
          <h3 className="font-[var(--font-display)] text-sm font-semibold text-slate-100">Calendar</h3>
          <p className="text-xs text-slate-500">{events.length} upcoming</p>
        </div>
        <ChevronRight size={16} className="text-slate-500" />
      </div>
      <div className="flex flex-1 flex-col gap-2">
        {upcoming.length === 0 ? (
          <EmptyState icon={CalendarDays} title="No events" hint="Click to schedule something" />
        ) : (
          upcoming.map((e) => (
            <div key={e.id} className="flex items-center gap-3 rounded-xl border border-white/8 bg-white/[0.03] px-3 py-2.5">
              <div className="flex h-9 w-10 shrink-0 flex-col items-center justify-center rounded-lg bg-cyan-500/10">
                <span className="text-[9px] font-medium uppercase text-cyan-300">
                  {new Date(e.date).toLocaleDateString(undefined, { month: 'short' })}
                </span>
                <span className="text-xs font-bold text-cyan-200">{new Date(e.date).getDate()}</span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-slate-100">{e.title}</p>
                {e.time && <p className="text-[11px] text-slate-500">{e.time}</p>}
              </div>
            </div>
          ))
        )}
      </div>
    </GlassCard>
  );
}

export function CalendarPanel({ open, onClose, events, onCreate, onDelete }) {
  const [cursor, setCursor] = useState(new Date());
  const [selected, setSelected] = useState(toKey(new Date()));
  const [form, setForm] = useState({ title: '', time: '' });
  const [error, setError] = useState('');

  const eventDates = useMemo(() => new Set(events.map((e) => e.date)), [events]);
  const dayEvents = useMemo(
    () => events.filter((e) => e.date === selected).sort((a, b) => (a.time || '').localeCompare(b.time || '')),
    [events, selected]
  );

  const submit = (e) => {
    e.preventDefault();
    if (!form.title) {
      setError('Give your event a title');
      return;
    }
    setError('');
    onCreate({ title: form.title, date: selected, time: form.time });
    setForm({ title: '', time: '' });
  };

  return (
    <SlideOver open={open} onClose={onClose} title="Calendar" icon={CalendarDays} accent="cyan">
      <div className="mb-5 rounded-xl border border-white/8 bg-white/[0.03] p-4">
        <MonthGrid cursor={cursor} setCursor={setCursor} eventDates={eventDates} selected={selected} onSelect={setSelected} />
      </div>

      <form onSubmit={submit} className="mb-5 flex flex-col gap-3 rounded-xl border border-white/8 bg-white/[0.03] p-4">
        <p className="text-xs font-medium text-slate-400">
          New event on {new Date(`${selected}T00:00`).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
        </p>
        <div className="grid grid-cols-[1fr_auto] gap-3">
          <Input
            label="Title"
            placeholder="Team sync"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          />
          <Input label="Time" type="time" value={form.time} onChange={(e) => setForm((f) => ({ ...f, time: e.target.value }))} />
        </div>
        {error && <p className="text-xs text-rose-300">{error}</p>}
        <Button type="submit" icon={Plus} className="justify-center">
          Add event
        </Button>
      </form>

      <div className="flex flex-col gap-2">
        {dayEvents.length === 0 ? (
          <EmptyState icon={CalendarDays} title="No events this day" />
        ) : (
          dayEvents.map((e) => (
            <div key={e.id} className="group flex items-center gap-3 rounded-xl border border-white/8 bg-white/[0.03] px-3 py-2.5">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-slate-100">{e.title}</p>
                {e.time && <p className="text-[11px] text-slate-500">{e.time}</p>}
              </div>
              <button
                aria-label="Delete event"
                onClick={() => onDelete(e)}
                className="focus-ring flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-lg text-slate-500 opacity-0 transition-opacity duration-150 hover:bg-rose-500/10 hover:text-rose-300 group-hover:opacity-100"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))
        )}
      </div>
    </SlideOver>
  );
}
