import { useState } from 'react';
import { StickyNote, Plus, Trash2, ChevronRight } from 'lucide-react';
import { AccentIcon, Button, EmptyState, GlassCard, Input, SlideOver } from './ui.jsx';

const COLORS = {
  violet: 'bg-violet-500/10 border-violet-400/25 text-violet-100',
  cyan: 'bg-cyan-500/10 border-cyan-400/25 text-cyan-100',
  amber: 'bg-amber-500/10 border-amber-400/25 text-amber-100',
  rose: 'bg-rose-500/10 border-rose-400/25 text-rose-100',
  emerald: 'bg-emerald-500/10 border-emerald-400/25 text-emerald-100',
};
const COLOR_KEYS = Object.keys(COLORS);

export function NotesWidget({ notes, onOpen }) {
  const preview = notes.slice(0, 3);
  return (
    <GlassCard className="col-span-full flex flex-col p-5 sm:col-span-1" onClick={onOpen}>
      <div className="mb-4 flex items-center gap-3">
        <AccentIcon icon={StickyNote} accent="amber" />
        <div className="min-w-0 flex-1">
          <h3 className="font-[var(--font-display)] text-sm font-semibold text-slate-100">Notes</h3>
          <p className="text-xs text-slate-500">{notes.length} saved</p>
        </div>
        <ChevronRight size={16} className="text-slate-500" />
      </div>
      <div className="flex flex-1 flex-col gap-2">
        {preview.length === 0 ? (
          <EmptyState icon={StickyNote} title="No notes yet" hint="Click to jot something down" />
        ) : (
          preview.map((n) => (
            <div key={n.id} className={`rounded-lg border px-3 py-2 ${COLORS[n.color] || COLORS.violet}`}>
              {n.title && <p className="truncate text-xs font-semibold">{n.title}</p>}
              <p className="line-clamp-2 text-xs opacity-90">{n.body}</p>
            </div>
          ))
        )}
      </div>
    </GlassCard>
  );
}

export function NotesPanel({ open, onClose, notes, onCreate, onDelete }) {
  const [form, setForm] = useState({ title: '', body: '', color: 'violet' });

  const submit = (e) => {
    e.preventDefault();
    if (!form.body.trim()) return;
    onCreate(form);
    setForm({ title: '', body: '', color: 'violet' });
  };

  return (
    <SlideOver open={open} onClose={onClose} title="Notes" icon={StickyNote} accent="amber">
      <form onSubmit={submit} className="mb-6 flex flex-col gap-3 rounded-xl border border-white/8 bg-white/[0.03] p-4">
        <Input
          label="Title (optional)"
          placeholder="Idea, reminder…"
          value={form.title}
          onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
        />
        <label className="block text-left">
          <span className="mb-1.5 block text-xs font-medium text-slate-400">Note</span>
          <textarea
            rows={3}
            className="focus-ring w-full resize-none rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:border-cyan-400/50"
            placeholder="Write it down…"
            value={form.body}
            onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
          />
        </label>
        <div className="flex items-center gap-2">
          {COLOR_KEYS.map((c) => (
            <button
              key={c}
              type="button"
              aria-label={`Color ${c}`}
              onClick={() => setForm((f) => ({ ...f, color: c }))}
              className={`h-6 w-6 cursor-pointer rounded-full border-2 ${COLORS[c]} ${form.color === c ? 'ring-2 ring-white/60' : ''}`}
            />
          ))}
        </div>
        <Button type="submit" icon={Plus} className="justify-center">
          Add note
        </Button>
      </form>

      <div className="grid grid-cols-2 gap-3">
        {notes.length === 0 ? (
          <EmptyState icon={StickyNote} title="No notes yet" />
        ) : (
          notes.map((n) => (
            <div key={n.id} className={`group relative rounded-xl border p-3 ${COLORS[n.color] || COLORS.violet}`}>
              <button
                aria-label="Delete note"
                onClick={() => onDelete(n)}
                className="focus-ring absolute right-1.5 top-1.5 flex h-6 w-6 cursor-pointer items-center justify-center rounded-md opacity-0 transition-opacity duration-150 hover:bg-black/20 group-hover:opacity-100"
              >
                <Trash2 size={12} />
              </button>
              {n.title && <p className="mb-1 pr-5 text-xs font-semibold">{n.title}</p>}
              <p className="whitespace-pre-wrap text-xs opacity-90">{n.body}</p>
            </div>
          ))
        )}
      </div>
    </SlideOver>
  );
}
