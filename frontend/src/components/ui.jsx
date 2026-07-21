import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';

const ACCENTS = {
  violet: 'from-violet-500 to-fuchsia-500',
  cyan: 'from-cyan-400 to-blue-500',
  pink: 'from-pink-500 to-rose-500',
  green: 'from-emerald-400 to-teal-500',
  amber: 'from-amber-400 to-orange-500',
};

export function AccentIcon({ icon: Icon, accent = 'violet', size = 'md' }) {
  const dims = size === 'sm' ? 'h-8 w-8' : 'h-11 w-11';
  const iconDims = size === 'sm' ? 14 : 18;
  return (
    <div
      className={`flex ${dims} shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${ACCENTS[accent]} shadow-lg`}
    >
      <Icon size={iconDims} strokeWidth={2} className="text-white" />
    </div>
  );
}

export function GlassCard({ children, className = '', onClick, as: Tag = 'div', ...props }) {
  const interactive = typeof onClick === 'function';
  return (
    <Tag
      onClick={onClick}
      className={`glass focus-ring rounded-2xl ${
        interactive ? 'cursor-pointer transition-transform duration-200 hover:-translate-y-0.5 hover:border-white/20' : ''
      } ${className}`}
      {...(interactive ? { role: 'button', tabIndex: 0, onKeyDown: (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(e); } } } : {})}
      {...props}
    >
      {children}
    </Tag>
  );
}

export function Button({ children, variant = 'primary', size = 'md', icon: Icon, className = '', loading = false, ...props }) {
  const base =
    'focus-ring inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer whitespace-nowrap';
  const sizes = size === 'sm' ? 'px-3 py-1.5 text-sm' : 'px-4 py-2.5 text-sm';
  const variants = {
    primary:
      'bg-gradient-to-r from-violet-500 to-cyan-400 text-white shadow-[0_0_24px_-6px_rgba(139,92,246,0.6)] hover:shadow-[0_0_30px_-4px_rgba(139,92,246,0.8)] hover:brightness-110 active:scale-[0.98]',
    secondary: 'bg-white/5 text-slate-100 border border-white/10 hover:bg-white/10 active:scale-[0.98]',
    ghost: 'text-slate-300 hover:bg-white/5 active:scale-[0.98]',
    danger: 'bg-rose-500/15 text-rose-300 border border-rose-500/30 hover:bg-rose-500/25 active:scale-[0.98]',
  };
  return (
    <button className={`${base} ${sizes} ${variants[variant]} ${className}`} disabled={loading || props.disabled} {...props}>
      {loading ? (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
      ) : (
        Icon && <Icon size={16} strokeWidth={2.25} />
      )}
      {children}
    </button>
  );
}

export function IconButton({ icon: Icon, label, className = '', active = false, ...props }) {
  return (
    <button
      aria-label={label}
      title={label}
      className={`focus-ring flex h-9 w-9 items-center justify-center rounded-lg cursor-pointer transition-colors duration-150 ${
        active ? 'bg-white/10 text-white' : 'text-slate-400 hover:bg-white/5 hover:text-slate-100'
      } ${className}`}
      {...props}
    >
      <Icon size={17} strokeWidth={2} />
    </button>
  );
}

export function Input({ label, id, className = '', ...props }) {
  return (
    <label htmlFor={id} className="block text-left">
      {label && <span className="mb-1.5 block text-xs font-medium text-slate-400">{label}</span>}
      <input
        id={id}
        className={`focus-ring w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 transition-colors duration-150 focus:border-cyan-400/50 focus:bg-white/[0.07] ${className}`}
        {...props}
      />
    </label>
  );
}

export function Select({ label, id, className = '', children, ...props }) {
  return (
    <label htmlFor={id} className="block text-left">
      {label && <span className="mb-1.5 block text-xs font-medium text-slate-400">{label}</span>}
      <select
        id={id}
        className={`focus-ring w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-slate-100 transition-colors duration-150 focus:border-cyan-400/50 ${className}`}
        {...props}
      >
        {children}
      </select>
    </label>
  );
}

export function Toggle({ checked, onChange, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`focus-ring relative h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors duration-200 ${
        checked ? 'bg-gradient-to-r from-violet-500 to-cyan-400' : 'bg-white/10'
      }`}
    >
      <span
        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform duration-200 ${
          checked ? 'translate-x-[22px]' : 'translate-x-0.5'
        }`}
      />
    </button>
  );
}

export function Badge({ children, tone = 'default' }) {
  const tones = {
    default: 'bg-white/8 text-slate-300',
    violet: 'bg-violet-500/15 text-violet-300',
    cyan: 'bg-cyan-500/15 text-cyan-300',
    green: 'bg-emerald-500/15 text-emerald-300',
    red: 'bg-rose-500/15 text-rose-300',
    amber: 'bg-amber-500/15 text-amber-300',
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${tones[tone]}`}>
      {children}
    </span>
  );
}

export function SlideOver({ open, onClose, title, icon, accent = 'violet', children, footer }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="backdrop"
            className="fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />
          <motion.div
            key="panel"
            role="dialog"
            aria-modal="true"
            aria-label={title}
            className="glass fixed right-0 top-0 z-50 flex h-full w-full flex-col border-l border-white/10 sm:w-[460px]"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 32, stiffness: 320 }}
          >
            <div className="flex items-center gap-3 border-b border-white/10 px-5 py-4">
              {icon && <AccentIcon icon={icon} accent={accent} size="sm" />}
              <h2 className="flex-1 font-[var(--font-display)] text-base font-semibold text-slate-100">{title}</h2>
              <IconButton icon={X} label="Close panel" onClick={onClose} />
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-5">{children}</div>
            {footer && <div className="border-t border-white/10 px-5 py-4">{footer}</div>}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export function EmptyState({ icon: Icon, title, hint }) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-white/10 px-4 py-8 text-center">
      {Icon && <Icon size={22} className="text-slate-500" />}
      <p className="text-sm font-medium text-slate-300">{title}</p>
      {hint && <p className="text-xs text-slate-500">{hint}</p>}
    </div>
  );
}
