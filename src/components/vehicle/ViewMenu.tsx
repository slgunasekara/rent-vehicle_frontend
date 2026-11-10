import { useEffect, useRef, useState } from 'react';
import { Check, ChevronDown, Grid2x2, Grid3x3, LayoutGrid, List, Square } from 'lucide-react';
import { AD_VIEWS, AdView, useAdView, useEffectiveView, useMinWidth } from '../../utils/adView';
import { useT } from '../../i18n';

const ICON: Record<AdView, typeof List> = { list: List, large: Square, grid2: Grid2x2, grid3: Grid3x3, grid4: LayoutGrid };

/** the "View" button: like the View menu of Windows Explorer - pick how the ads are shown (list, large cards, 2 / 3 / 4 per row) */
export default function ViewMenu() {
  const t = useT();
  const [, setView] = useAdView();
  const view = useEffectiveView();
  const w768 = useMinWidth(768), w1024 = useMinWidth(1024);
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  const Current = ICON[view];
  const offered = AD_VIEWS.filter((v) => v.minWidth === 0 || (v.minWidth === 768 && w768) || (v.minWidth === 1024 && w1024));

  useEffect(() => {
    if (!open) return;
    const away = (e: PointerEvent) => { if (!box.current?.contains(e.target as Node)) setOpen(false); };
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('pointerdown', away); document.addEventListener('keydown', esc);
    return () => { document.removeEventListener('pointerdown', away); document.removeEventListener('keydown', esc); };
  }, [open]);

  return (
    <div ref={box} className="relative">
      <button type="button" onClick={() => setOpen((o) => !o)} aria-haspopup="menu" aria-expanded={open}
        className="inline-flex h-11 items-center gap-2 rounded-xl border border-brand-200 bg-white px-3 text-sm font-semibold text-navy-800 transition hover:bg-brand-50">
        <Current className="h-4 w-4 text-brand-600" /> <span className="hidden min-[400px]:inline">{t('View')}</span> <ChevronDown className={`h-4 w-4 text-slate-400 transition ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div role="menu" className="absolute right-0 z-30 mt-2 w-64 overflow-hidden rounded-xl border border-brand-200 bg-white p-1 shadow-soft animate-rise">
          {offered.map((v) => {
            const I = ICON[v.key]; const on = v.key === view;
            return (
              <button key={v.key} type="button" role="menuitemradio" aria-checked={on} onClick={() => { setView(v.key); setOpen(false); }}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition hover:bg-brand-50 ${on ? 'bg-brand-50' : ''}`}>
                <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg ${on ? 'bg-brand-500 text-white' : 'bg-slate-100 text-slate-600'}`}><I className="h-[18px] w-[18px]" /></span>
                <span className="min-w-0 flex-1"><span className="block text-sm font-bold text-navy-800">{t(v.label)}</span><span className="block text-xs text-slate-500">{t(v.hint)}</span></span>
                {on && <Check className="h-4 w-4 text-brand-600" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
