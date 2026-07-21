import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { ListChecks, Plus, Trash2, AlarmClock, ChevronRight, Check } from 'lucide-react';
import { AccentIcon, Badge, Button, EmptyState, GlassCard, Input, Select, SlideOver, Toggle } from './ui.jsx';

const PRIORITY_TONE = { high: 'red', normal: 'cyan', low: 'default' };

function sortTasks(tasks) {
  return [...tasks].sort((a, b) => {
    if (a.status !== b.status) return a.status === 'done' ? 1 : -1;
    return new Date(a.dueAt) - new Date(b.dueAt);
  });
}

function formatDue(dueAt) {
  const d = new Date(dueAt);
  if (Number.isNaN(d.getTime())) return dueAt;
  const now = new Date();
  const sameDay = d.toDateString() === now.toDateString();
  return sameDay
    ? d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
    : d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function TaskRow({ task, onToggle, onDelete, compact }) {
  const done = task.status === 'done';
  return (
    <div className={`group flex items-center gap-3 rounded-xl border border-white/8 bg-white/[0.03] px-3 ${compact ? 'py-2.5' : 'py-3'}`}>
      <button
        aria-label={done ? 'Mark as not done' : 'Mark as done'}
        onClick={() => onToggle(task)}
        className={`focus-ring flex h-5 w-5 shrink-0 cursor-pointer items-center justify-center rounded-md border transition-colors duration-150 ${
          done ? 'border-emerald-400 bg-emerald-400/90' : 'border-slate-500 hover:border-cyan-400'
        }`}
      >
        {done && <Check size={12} strokeWidth={3} className="text-slate-950" />}
      </button>
      <div className="min-w-0 flex-1">
        <p className={`truncate text-sm font-medium ${done ? 'text-slate-500 line-through' : 'text-slate-100'}`}>{task.title}</p>
        {!compact && task.description && <p className="truncate text-xs text-slate-500">{task.description}</p>}
      </div>
      {task.alarmEnabled && <AlarmClock size={13} className="shrink-0 text-amber-300" />}
      <Badge tone={PRIORITY_TONE[task.priority] || 'default'}>{task.priority}</Badge>
      <span className="tabular w-14 shrink-0 text-right text-[11px] text-slate-500">{formatDue(task.dueAt)}</span>
      {!compact && (
        <button
          aria-label="Delete task"
          onClick={() => onDelete(task)}
          className="focus-ring ml-1 flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-lg text-slate-500 opacity-0 transition-opacity duration-150 hover:bg-rose-500/10 hover:text-rose-300 group-hover:opacity-100"
        >
          <Trash2 size={14} />
        </button>
      )}
    </div>
  );
}

export function TasksWidget({ tasks, onToggle, onOpen }) {
  const upcoming = useMemo(() => sortTasks(tasks).slice(0, 4), [tasks]);
  const openCount = tasks.filter((t) => t.status !== 'done').length;

  return (
    <GlassCard className="col-span-full flex flex-col p-5 sm:col-span-1" onClick={onOpen}>
      <div className="mb-4 flex items-center gap-3">
        <AccentIcon icon={ListChecks} accent="violet" />
        <div className="min-w-0 flex-1">
          <h3 className="font-[var(--font-display)] text-sm font-semibold text-slate-100">Tasks</h3>
          <p className="text-xs text-slate-500">{openCount} open</p>
        </div>
        <ChevronRight size={16} className="text-slate-500" />
      </div>
      <div className="flex flex-1 flex-col gap-2">
        {upcoming.length === 0 ? (
          <EmptyState icon={ListChecks} title="No tasks yet" hint="Click to add your first one" />
        ) : (
          upcoming.map((t) => (
            <TaskRow key={t.id} task={t} compact onToggle={(task) => { onToggle(task); }} />
          ))
        )}
      </div>
    </GlassCard>
  );
}

export function TasksPanel({ open, onClose, tasks, onCreate, onToggle, onDelete }) {
  const [form, setForm] = useState({ title: '', description: '', dueAt: '', priority: 'normal', alarmEnabled: false });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.dueAt) {
      setError('Title and due date are required');
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      await onCreate(form);
      setForm({ title: '', description: '', dueAt: '', priority: 'normal', alarmEnabled: false });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SlideOver open={open} onClose={onClose} title="Tasks" icon={ListChecks} accent="violet">
      <form onSubmit={submit} className="mb-6 flex flex-col gap-3 rounded-xl border border-white/8 bg-white/[0.03] p-4">
        <Input
          label="Title"
          placeholder="Finish quarterly report"
          value={form.title}
          onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
        />
        <Input
          label="Description (optional)"
          placeholder="Add details…"
          value={form.description}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
        />
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Due"
            type="datetime-local"
            value={form.dueAt}
            onChange={(e) => setForm((f) => ({ ...f, dueAt: e.target.value }))}
          />
          <Select label="Priority" value={form.priority} onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value }))}>
            <option value="low">Low</option>
            <option value="normal">Normal</option>
            <option value="high">High</option>
          </Select>
        </div>
        <div className="flex items-center justify-between rounded-lg border border-white/8 px-3 py-2.5">
          <span className="flex items-center gap-2 text-sm text-slate-300">
            <AlarmClock size={14} /> Enable alarm
          </span>
          <Toggle checked={form.alarmEnabled} onChange={(v) => setForm((f) => ({ ...f, alarmEnabled: v }))} label="Enable alarm" />
        </div>
        {error && <p className="text-xs text-rose-300">{error}</p>}
        <Button type="submit" icon={Plus} loading={submitting} className="justify-center">
          Add task
        </Button>
      </form>

      <div className="flex flex-col gap-2">
        {sortTasks(tasks).length === 0 ? (
          <EmptyState icon={ListChecks} title="No tasks yet" hint="Add one above to get started" />
        ) : (
          sortTasks(tasks).map((t) => (
            <motion.div key={t.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <TaskRow task={t} onToggle={onToggle} onDelete={onDelete} />
            </motion.div>
          ))
        )}
      </div>
    </SlideOver>
  );
}
