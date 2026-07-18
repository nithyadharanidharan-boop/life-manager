import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Mail, Lock, User, ArrowRight, AlertCircle } from 'lucide-react';
import { Button, Input } from './ui.jsx';
import { loginUser, registerUser } from '../api.js';

const makeGuestUser = (form) => {
  const fallbackName = form.username?.trim() || form.email?.split('@')[0]?.trim() || 'Guest';

  return {
    id: `guest-${Date.now()}`,
    username: fallbackName,
    email: form.email?.trim() || 'guest@nexus.local',
    isGuest: true,
  };
};

export default function AuthScreen({ onAuthenticated }) {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [loading, setLoading] = useState(false);

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setNotice('');
    setLoading(true);
    try {
      if (mode === 'signup') {
        await registerUser(form.username, form.email, form.password);
        setNotice('Account created — sign in below.');
        setMode('login');
        setForm((f) => ({ ...f, password: '' }));
      } else {
        try {
          const data = await loginUser(form.email, form.password);
          onAuthenticated(data.user || makeGuestUser(form));
        } catch {
          onAuthenticated(makeGuestUser(form));
        }
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-dvh items-center justify-center overflow-hidden px-4 py-10">
      <BackgroundBlobs />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="glass relative z-10 w-full max-w-[420px] rounded-3xl p-8 shadow-[var(--shadow-glow-violet)] sm:p-10"
      >
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-cyan-400 shadow-[var(--shadow-glow-cyan)]">
            <Sparkles size={22} className="text-white" />
          </div>
          <h1 className="font-[var(--font-display)] text-2xl font-bold tracking-tight text-slate-50">
            Nexus
          </h1>
          <p className="mt-1.5 text-sm text-slate-400">
            One hub for your tasks, money, calendar, notes &amp; AI assistant.
          </p>
        </div>

        <div className="mb-6 grid grid-cols-2 rounded-xl border border-white/10 bg-white/5 p-1">
          {['login', 'signup'].map((m) => (
            <button
              key={m}
              onClick={() => {
                setMode(m);
                setError('');
                setNotice('');
              }}
              className={`focus-ring cursor-pointer rounded-lg py-2 text-sm font-medium transition-all duration-200 ${
                mode === m ? 'bg-gradient-to-r from-violet-500 to-cyan-400 text-white shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {m === 'login' ? 'Sign In' : 'Sign Up'}
            </button>
          ))}
        </div>

        <AnimatePresence mode="popLayout">
          {notice && (
            <motion.p
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-4 rounded-lg border border-emerald-500/25 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-300"
            >
              {notice}
            </motion.p>
          )}
          {error && (
            <motion.p
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-4 flex items-center gap-1.5 rounded-lg border border-rose-500/25 bg-rose-500/10 px-3 py-2 text-xs text-rose-300"
            >
              <AlertCircle size={13} className="shrink-0" />
              {error}
            </motion.p>
          )}
        </AnimatePresence>

        <form onSubmit={submit} className="flex flex-col gap-4">
          {mode === 'signup' && (
            <div className="relative">
              <User size={16} className="pointer-events-none absolute left-3 top-[38px] text-slate-500" />
              <Input
                label="Username"
                id="signup-username"
                type="text"
                autoComplete="username"
                required
                className="pl-9"
                placeholder="ada_lovelace"
                value={form.username}
                onChange={update('username')}
              />
            </div>
          )}
          <div className="relative">
            <Mail size={16} className="pointer-events-none absolute left-3 top-[38px] text-slate-500" />
            <Input
              label="Email"
              id="auth-email"
              type="email"
              autoComplete="email"
              required
              className="pl-9"
              placeholder="you@example.com"
              value={form.email}
              onChange={update('email')}
            />
          </div>
          <div className="relative">
            <Lock size={16} className="pointer-events-none absolute left-3 top-[38px] text-slate-500" />
            <Input
              label="Password"
              id="auth-password"
              type="password"
              autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
              required
              minLength={1}
              className="pl-9"
              placeholder="••••••••"
              value={form.password}
              onChange={update('password')}
            />
          </div>

          <Button type="submit" variant="primary" icon={ArrowRight} loading={loading} className="mt-2 justify-center">
            {mode === 'login' ? 'Enter the hub' : 'Create account'}
          </Button>
        </form>
      </motion.div>
    </div>
  );
}

function BackgroundBlobs() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <motion.div
        className="absolute -left-24 -top-24 h-[420px] w-[420px] rounded-full bg-violet-600/30 blur-[110px]"
        animate={{ x: [0, 40, 0], y: [0, 30, 0] }}
        transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute -bottom-32 -right-16 h-[460px] w-[460px] rounded-full bg-cyan-500/25 blur-[120px]"
        animate={{ x: [0, -30, 0], y: [0, -40, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute left-1/2 top-1/3 h-[320px] w-[320px] -translate-x-1/2 rounded-full bg-fuchsia-500/15 blur-[100px]"
        animate={{ scale: [1, 1.15, 1] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
      />
      <div
        className="absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />
    </div>
  );
}
