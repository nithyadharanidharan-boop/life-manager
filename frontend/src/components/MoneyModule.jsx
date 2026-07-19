import { useMemo, useState } from 'react';
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Wallet, Plus, ArrowUpRight, ArrowDownRight, ChevronRight, TrendingUp, TrendingDown } from 'lucide-react';
import { AccentIcon, Badge, Button, EmptyState, GlassCard, Input, Select, SlideOver } from './ui.jsx';

function computeSeries(entries) {
  const sorted = [...entries].sort((a, b) => new Date(a.date) - new Date(b.date));
  let running = 0;
  return sorted.map((e) => {
    running += e.type === 'income' ? Number(e.amount) : -Number(e.amount);
    return { date: e.date, balance: Math.round(running * 100) / 100 };
  });
}

function useTotals(entries) {
  return useMemo(() => {
    const income = entries.filter((e) => e.type === 'income').reduce((s, e) => s + Number(e.amount), 0);
    const expense = entries.filter((e) => e.type === 'expense').reduce((s, e) => s + Number(e.amount), 0);
    return { income, expense, net: income - expense };
  }, [entries]);
}

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass rounded-lg px-3 py-2 text-xs">
      <p className="text-slate-400">{new Date(label).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</p>
      <p className="tabular font-semibold text-slate-100">${payload[0].value.toLocaleString()}</p>
    </div>
  );
}

function BalanceChart({ entries, compact }) {
  const data = computeSeries(entries);
  if (data.length < 2) {
    return (
      <div className="flex h-full items-center justify-center text-xs text-slate-500">
        Add entries to see your trend
      </div>
    );
  }
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={compact ? { top: 4, right: 0, left: 0, bottom: 0 } : { top: 8, right: 8, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="balanceFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#22d3ee" stopOpacity={0.45} />
            <stop offset="100%" stopColor="#22d3ee" stopOpacity={0} />
          </linearGradient>
        </defs>
        {!compact && (
          <>
            <XAxis
              dataKey="date"
              tickFormatter={(v) => new Date(v).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
              tick={{ fill: '#64748b', fontSize: 11 }}
              axisLine={{ stroke: 'rgba(148,163,184,0.15)' }}
              tickLine={false}
              minTickGap={24}
            />
            <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} width={44} />
            <Tooltip content={<ChartTooltip />} />
          </>
        )}
        <Area type="monotone" dataKey="balance" stroke="#22d3ee" strokeWidth={2} fill="url(#balanceFill)" />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function MoneyWidget({ entries, onOpen }) {
  const { net } = useTotals(entries);
  return (
    <GlassCard className="col-span-full flex flex-col p-5 sm:col-span-1" onClick={onOpen}>
      <div className="mb-4 flex items-center gap-3">
        <AccentIcon icon={Wallet} accent="green" />
        <div className="min-w-0 flex-1">
          <h3 className="font-[var(--font-display)] text-sm font-semibold text-slate-100">Money</h3>
          <p className="tabular text-xs text-slate-500">${net.toLocaleString()} net</p>
        </div>
        <ChevronRight size={16} className="text-slate-500" />
      </div>
      <div className="h-24 flex-1">
        <BalanceChart entries={entries} compact />
      </div>
    </GlassCard>
  );
}

export function MoneyPanel({ open, onClose, entries, onCreate }) {
  const { income, expense, net } = useTotals(entries);
  const [form, setForm] = useState({ amount: '', type: 'expense', description: '', date: new Date().toISOString().slice(0, 10) });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    if (!form.amount || Number(form.amount) <= 0) {
      setError('Enter a valid amount');
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      await onCreate({ ...form, amount: Number(form.amount) });
      setForm((f) => ({ ...f, amount: '', description: '' }));
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const sorted = [...entries].sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <SlideOver open={open} onClose={onClose} title="Money Manager" icon={Wallet} accent="green">
      <div className="mb-5 grid grid-cols-3 gap-2">
        <div className="rounded-xl border border-white/8 bg-white/[0.03] p-3 text-center">
          <TrendingUp size={14} className="mx-auto mb-1 text-emerald-400" />
          <p className="tabular text-sm font-semibold text-slate-100">${income.toLocaleString()}</p>
          <p className="text-[11px] text-slate-500">Income</p>
        </div>
        <div className="rounded-xl border border-white/8 bg-white/[0.03] p-3 text-center">
          <TrendingDown size={14} className="mx-auto mb-1 text-rose-400" />
          <p className="tabular text-sm font-semibold text-slate-100">${expense.toLocaleString()}</p>
          <p className="text-[11px] text-slate-500">Expense</p>
        </div>
        <div className="rounded-xl border border-white/8 bg-white/[0.03] p-3 text-center">
          <Wallet size={14} className="mx-auto mb-1 text-cyan-400" />
          <p className="tabular text-sm font-semibold text-slate-100">${net.toLocaleString()}</p>
          <p className="text-[11px] text-slate-500">Net</p>
        </div>
      </div>

      <div className="mb-5 h-40 rounded-xl border border-white/8 bg-white/[0.03] p-3">
        <BalanceChart entries={entries} />
      </div>

      <form onSubmit={submit} className="mb-6 flex flex-col gap-3 rounded-xl border border-white/8 bg-white/[0.03] p-4">
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Amount"
            type="number"
            min="0"
            step="0.01"
            placeholder="0.00"
            value={form.amount}
            onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
          />
          <Select label="Type" value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </Select>
        </div>
        <Input
          label="Category / note"
          placeholder="Groceries, salary, rent…"
          value={form.description}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
        />
        <Input label="Date" type="date" value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} />
        {error && <p className="text-xs text-rose-300">{error}</p>}
        <Button type="submit" icon={Plus} loading={submitting} className="justify-center">
          Add entry
        </Button>
      </form>

      <div className="flex flex-col gap-2">
        {sorted.length === 0 ? (
          <EmptyState icon={Wallet} title="No entries yet" hint="Log your first income or expense above" />
        ) : (
          sorted.map((e) => (
            <div key={e.id} className="flex items-center gap-3 rounded-xl border border-white/8 bg-white/[0.03] px-3 py-2.5">
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                  e.type === 'income' ? 'bg-emerald-500/15 text-emerald-300' : 'bg-rose-500/15 text-rose-300'
                }`}
              >
                {e.type === 'income' ? <ArrowUpRight size={15} /> : <ArrowDownRight size={15} />}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-slate-100">{e.description || (e.type === 'income' ? 'Income' : 'Expense')}</p>
                <p className="text-[11px] text-slate-500">{new Date(e.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</p>
              </div>
              <Badge tone={e.type === 'income' ? 'green' : 'red'}>
                {e.type === 'income' ? '+' : '-'}${Number(e.amount).toLocaleString()}
              </Badge>
            </div>
          ))
        )}
      </div>
    </SlideOver>
  );
}
