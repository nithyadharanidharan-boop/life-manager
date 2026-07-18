import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Bot, Send, Sparkles, User } from 'lucide-react';
import { SlideOver } from './ui.jsx';
import { getNextAlarm } from './AlarmsModule.jsx';

function generateReply(message, ctx) {
  const q = message.toLowerCase();
  const openTasks = ctx.tasks.filter((t) => t.status !== 'done');
  const dueToday = openTasks.filter((t) => new Date(t.dueAt).toDateString() === new Date().toDateString());

  if (/\btask/.test(q) || /to-?do/.test(q)) {
    if (openTasks.length === 0) return "You're all caught up — no open tasks right now. Enjoy the breathing room.";
    return `You have ${openTasks.length} open task${openTasks.length === 1 ? '' : 's'}, ${dueToday.length} due today. Top one: "${openTasks[0].title}". Want me to open your Tasks panel?`;
  }

  if (/money|sav(e|ed|ing|ings)?\b|spend|expense|budget|balance/.test(q)) {
    const income = ctx.entries.filter((e) => e.type === 'income').reduce((s, e) => s + Number(e.amount), 0);
    const expense = ctx.entries.filter((e) => e.type === 'expense').reduce((s, e) => s + Number(e.amount), 0);
    const net = income - expense;
    return `You've logged $${income.toLocaleString()} in income and $${expense.toLocaleString()} in expenses — net balance is $${net.toLocaleString()}. Check the Money module for the full trend.`;
  }

  if (/alarm|wake|remind/.test(q)) {
    const next = getNextAlarm(ctx.alarms);
    if (!next) return "You don't have any alarms set. Head to the Alarms module to add one.";
    return `Your next alarm is "${next.label || 'Alarm'}" at ${next.time}, on ${next.date.toLocaleDateString(undefined, { weekday: 'long' })}.`;
  }

  if (/event|calendar|meeting|schedule/.test(q)) {
    if (ctx.events.length === 0) return 'Your calendar is clear. Want to add an event? Open the Calendar module.';
    return `You have ${ctx.events.length} upcoming event${ctx.events.length === 1 ? '' : 's'} on your calendar.`;
  }

  if (/note/.test(q)) {
    if (ctx.notes.length === 0) return "You haven't saved any notes yet — jot something down in the Notes module.";
    return `You've saved ${ctx.notes.length} note${ctx.notes.length === 1 ? '' : 's'}. The latest: "${(ctx.notes[0].title || ctx.notes[0].body).slice(0, 40)}".`;
  }

  if (/^(hi|hey|hello)\b/.test(q)) {
    return `Hey${ctx.user?.username ? ' ' + ctx.user.username : ''}! I can summarize your tasks, spending, alarms, events or notes — just ask.`;
  }

  if (/help|what can you do/.test(q)) {
    return 'Try asking things like "what are my tasks", "how much have I saved", "when is my next alarm", or "what\'s on my calendar".';
  }

  return "I'm a lightweight demo assistant for now — I can summarize your tasks, money, alarms, calendar and notes. Try asking about one of those.";
}

export default function AssistantDrawer({ open, onClose, tasks, entries, alarms, events, notes, user }) {
  const [messages, setMessages] = useState([
    { id: 'welcome', role: 'assistant', text: "Hi! I'm your Nexus assistant. Ask me about your tasks, savings, alarms, calendar, or notes." },
  ]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const listRef = useRef(null);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, typing]);

  const send = (e) => {
    e.preventDefault();
    const text = input.trim();
    if (!text) return;
    const userMsg = { id: `u-${Date.now()}`, role: 'user', text };
    setMessages((m) => [...m, userMsg]);
    setInput('');
    setTyping(true);
    setTimeout(() => {
      const reply = generateReply(text, { tasks, entries, alarms, events, notes, user });
      setMessages((m) => [...m, { id: `a-${Date.now()}`, role: 'assistant', text: reply }]);
      setTyping(false);
    }, 550 + Math.random() * 400);
  };

  return (
    <SlideOver
      open={open}
      onClose={onClose}
      title="Nexus Assistant"
      icon={Bot}
      accent="pink"
      footer={
        <form onSubmit={send} className="flex items-center gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about your day…"
            aria-label="Message Nexus assistant"
            className="focus-ring w-full rounded-full border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:border-pink-400/50"
          />
          <button
            type="submit"
            aria-label="Send message"
            className="focus-ring flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full bg-gradient-to-br from-pink-500 to-violet-500 text-white shadow-lg transition-transform duration-150 active:scale-95"
          >
            <Send size={16} />
          </button>
        </form>
      }
    >
      <div ref={listRef} className="flex flex-col gap-3">
        {messages.map((m) => (
          <motion.div
            key={m.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex items-start gap-2.5 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}
          >
            <div
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
                m.role === 'user' ? 'bg-white/10 text-slate-300' : 'bg-gradient-to-br from-pink-500 to-violet-500 text-white'
              }`}
            >
              {m.role === 'user' ? <User size={13} /> : <Sparkles size={13} />}
            </div>
            <div
              className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                m.role === 'user' ? 'bg-violet-500/20 text-slate-100' : 'border border-white/8 bg-white/[0.04] text-slate-200'
              }`}
            >
              {m.text}
            </div>
          </motion.div>
        ))}
        {typing && (
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-pink-500 to-violet-500 text-white">
              <Sparkles size={13} />
            </div>
            <div className="flex gap-1 rounded-2xl border border-white/8 bg-white/[0.04] px-3.5 py-3">
              {[0, 1, 2].map((i) => (
                <motion.span
                  key={i}
                  className="h-1.5 w-1.5 rounded-full bg-slate-400"
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1, repeat: Infinity, delay: i * 0.15 }}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </SlideOver>
  );
}

export function AssistantFab({ onClick }) {
  return (
    <motion.button
      onClick={onClick}
      aria-label="Open AI assistant"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 0.4, type: 'spring', stiffness: 260, damping: 20 }}
      whileHover={{ scale: 1.06 }}
      whileTap={{ scale: 0.94 }}
      className="fixed bottom-6 right-6 z-30 flex h-14 w-14 cursor-pointer items-center justify-center rounded-full bg-gradient-to-br from-pink-500 via-violet-500 to-cyan-400 text-white shadow-[0_0_30px_-4px_rgba(236,72,153,0.6)]"
    >
      <span className="absolute inset-0 animate-ping rounded-full bg-pink-500/40" style={{ animationDuration: '2.4s' }} />
      <Bot size={24} className="relative" />
    </motion.button>
  );
}
