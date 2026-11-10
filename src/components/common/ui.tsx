import { ReactNode, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Loader2, Inbox, ChevronLeft, ChevronRight } from 'lucide-react';
import { useMinWidth } from '../../utils/adView';
import { useT } from '../../i18n';

export function Spinner({ label = 'Loading' }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-2 py-16 text-brand-600" role="status">
      <Loader2 className="h-5 w-5 animate-spin" /> <span className="text-sm font-medium">{label}...</span>
    </div>
  );
}

export function Empty({ title, hint, action }: { title: string; hint?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-2 py-14 text-center">
      <div className="rounded-2xl bg-brand-50 p-4 text-brand-500"><Inbox className="h-7 w-7" /></div>
      <p className="font-semibold text-navy-800">{title}</p>
      {hint && <p className="max-w-sm text-sm text-slate-500">{hint}</p>}
      {action}
    </div>
  );
}

export function PageHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div className="mb-4 flex flex-wrap items-end justify-between gap-3 sm:mb-6">
      <div className="min-w-0">
        <h1 className="text-xl font-extrabold text-navy-800 sm:text-2xl">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function StatCard({ icon, label, value, tone = 'brand' }: { icon: ReactNode; label: string; value: string | number; tone?: 'brand' | 'aqua' | 'navy' | 'green' }) {
  const tones = { brand: 'from-brand-500 to-navy-600', aqua: 'from-aqua-400 to-brand-500', navy: 'from-navy-700 to-navy-900', green: 'from-emerald-400 to-emerald-600' };
  return (
    <div className="card tilt flex min-w-0 flex-col items-start gap-2 !p-3 sm:flex-row sm:items-center sm:gap-4 sm:!p-5">
      <div className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br text-white shadow-soft sm:h-12 sm:w-12 ${tones[tone]}`}>{icon}</div>
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase leading-tight tracking-wide text-slate-500 sm:text-xs">{label}</p>
        <p className="break-words text-lg font-extrabold text-navy-800 sm:text-2xl">{value}</p>
      </div>
    </div>
  );
}

export function Modal({ open, onClose, title, children, wide = false }: { open: boolean; onClose: () => void; title: string; children: ReactNode; wide?: boolean }) {
  useEffect(() => {
    if (!open) return;
    const h = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [open, onClose]);
  if (!open) return null;
  // rendered on <body>: a card that lifts / tilts on hover would otherwise trap a fixed modal inside itself
  return createPortal(
    <div className="fixed inset-0 z-50 grid place-items-center bg-navy-950/60 p-2.5 backdrop-blur-sm sm:p-4" onMouseDown={onClose} role="dialog" aria-modal="true" aria-label={title}>
      <div className={`card max-h-[92vh] max-h-[92dvh] w-full animate-rise overflow-y-auto ${wide ? 'max-w-3xl' : 'max-w-lg'}`} onMouseDown={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="min-w-0 text-base font-bold text-navy-800 sm:text-lg">{title}</h3>
          <button className="rounded-lg p-1.5 text-slate-500 hover:bg-brand-50" onClick={onClose} aria-label="Close"><X className="h-5 w-5" /></button>
        </div>
        {children}
      </div>
    </div>,
    document.body
  );
}

/** "Are you sure?" box for deleting an ad, an account ... */
export function ConfirmModal({ open, title, text, confirmLabel = 'Delete', busy = false, onConfirm, onClose, children }: { open: boolean; title: string; text: string; confirmLabel?: string; busy?: boolean; onConfirm: () => void; onClose: () => void; children?: ReactNode }) {
  return (
    <Modal open={open} onClose={onClose} title={title}>
      <p className="text-sm text-slate-600">{text}</p>
      {children}
      <div className="mt-5 flex justify-end gap-2">
        <button className="btn-ghost" onClick={onClose} disabled={busy}>Cancel</button>
        <button className="btn bg-red-600 text-white hover:bg-red-700" onClick={onConfirm} disabled={busy}>{busy ? 'Please wait...' : confirmLabel}</button>
      </div>
    </Modal>
  );
}

export function Field({ label, children, hint, required }: { label: string; children: ReactNode; hint?: string; required?: boolean }) {
  return (
    <label className="block">
      <span className="label">{label}{required && <span className="ml-0.5 text-red-500" aria-hidden> *</span>}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-slate-500">{hint}</span>}
    </label>
  );
}

/**
 * Page buttons like the big sites: 1 2 3 ... 99 with the current page's neighbours, never all of them, and "Previous" / "Next" with text.
 * On a phone fewer numbers are shown; Previous / Next sit on their own row under the numbers.
 */
export function Pagination({ page, pages, onPage }: { page: number; pages: number; onPage: (p: number) => void }) {
  const t = useT();
  const wide = useMinWidth(640);
  if (pages <= 1) return null;
  const span = wide ? 2 : 1;
  const nums: (number | '...')[] = [];
  for (let p = 1; p <= pages; p++) {
    if (p === 1 || p === pages || Math.abs(p - page) <= span) nums.push(p);
    else if (nums[nums.length - 1] !== '...') nums.push('...');
  }
  const num = 'h-10 min-w-[2.5rem] rounded-xl border px-2.5 text-sm font-bold transition';
  return (
    <nav className="mt-8 flex flex-col items-center gap-3" aria-label="Pages">
      <div className="flex flex-wrap items-center justify-center gap-1.5">
        {nums.map((n, i) => n === '...' ? <span key={`d${i}`} className="px-1 text-slate-400">...</span> : (
          <button key={n} onClick={() => onPage(n)} aria-current={n === page ? 'page' : undefined} aria-label={`${t('Page')} ${n}`}
            className={`${num} ${n === page ? 'border-brand-500 bg-brand-500 text-white shadow-soft' : 'border-brand-200 bg-white text-navy-800 hover:bg-brand-50'}`}>{n}</button>
        ))}
      </div>
      <div className="flex w-full max-w-sm items-center justify-between gap-3">
        <button className="btn border border-brand-200 bg-white !py-2 text-navy-800 hover:bg-brand-50 disabled:opacity-40" disabled={page <= 1} onClick={() => onPage(page - 1)}><ChevronLeft className="h-4 w-4" /> {t('Previous')}</button>
        <span className="text-xs font-semibold text-slate-500">{t('Page {p} of {n}', { p: page, n: pages })}</span>
        <button className="btn-primary !py-2 disabled:opacity-40" disabled={page >= pages} onClick={() => onPage(page + 1)}>{t('Next')} <ChevronRight className="h-4 w-4" /></button>
      </div>
    </nav>
  );
}
