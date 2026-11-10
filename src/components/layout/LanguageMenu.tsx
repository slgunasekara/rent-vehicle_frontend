import { useEffect, useRef, useState } from 'react';
import { Check, ChevronDown, Globe } from 'lucide-react';
import { LANGS, useLang, useT } from '../../i18n';

/** "Language" button: opens a small list (English / සිංහල / தமிழ்) and the whole site switches */
export default function LanguageMenu({ glass = false, up = false, align = 'right', full = false }: { glass?: boolean; up?: boolean; align?: 'left' | 'right'; full?: boolean }) {
  const { lang, setLang } = useLang();
  const t = useT();
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  const current = LANGS.find((l) => l.code === lang)!;

  useEffect(() => {
    if (!open) return;
    const click = (e: MouseEvent) => { if (!box.current?.contains(e.target as Node)) setOpen(false); };
    const key = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', click);
    window.addEventListener('keydown', key);
    return () => { document.removeEventListener('mousedown', click); window.removeEventListener('keydown', key); };
  }, [open]);

  return (
    <div ref={box} className={`relative ${full ? 'w-full' : ''}`}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={t('Language')}
        className={`flex h-9 items-center gap-1 rounded-xl border px-2.5 text-sm sm:h-10 sm:gap-1.5 sm:px-3 font-semibold transition active:scale-95 ${full ? 'w-full justify-between' : ''} ${glass ? 'border-white/30 bg-white/10 text-white hover:bg-white/20' : 'border-brand-200 bg-white text-navy-700 hover:border-brand-400 hover:bg-brand-50'}`}
      >
        <span className="flex items-center gap-1.5"><Globe className="h-4 w-4" /><span className="hidden sm:inline">{full ? current.label : t('Language')}</span><span className="sm:hidden">{current.short}</span></span>
        <ChevronDown className={`hidden h-3.5 w-3.5 transition sm:block ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <ul role="listbox" aria-label={t('Language')} className={`absolute z-50 min-w-[10.5rem] overflow-hidden rounded-xl border border-brand-100 bg-white p-1 text-navy-800 shadow-soft animate-rise ${up ? 'bottom-12' : 'top-12'} ${align === 'right' ? 'right-0' : 'left-0'}`}>
          {LANGS.map((l) => (
            <li key={l.code} role="option" aria-selected={l.code === lang}>
              <button type="button" onClick={() => { setLang(l.code); setOpen(false); }} className={`flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-left text-sm font-semibold transition hover:bg-brand-50 ${l.code === lang ? 'bg-brand-50 text-brand-600' : ''}`}>
                {l.label}{l.code === lang && <Check className="h-4 w-4" />}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
