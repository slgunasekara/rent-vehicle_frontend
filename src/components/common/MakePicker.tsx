import {useEffect, useMemo, useRef, useState} from 'react';
import {Check, ChevronDown, Tag, X} from 'lucide-react';
import {MAKES, POPULAR_MAKES} from '../../data/vehicleOptions';
import {useT} from '../../i18n';


export default function MakePicker({value, onChange, any = true, required = false, placeholder, className = ''}: {
    value: string;
    onChange: (make: string) => void;
    any?: boolean;
    required?: boolean;
    placeholder?: string;
    className?: string
}) {
    const t = useT();
    const [open, setOpen] = useState(false);
    const [text, setText] = useState('');
    const [active, setActive] = useState(0);
    const box = useRef<HTMLDivElement>(null);
    const listRef = useRef<HTMLDivElement>(null);
    const q = text.trim().toLowerCase();
    const shown = open ? text : value;

    const groups = useMemo(() => {
        if (!q) return [{title: 'Most Popular Makes', items: POPULAR_MAKES}, {title: 'All Makes', items: MAKES}];
        const rank = (m: string): number => {
            const l = m.toLowerCase();
            return l.startsWith(q) ? 0 : l.split(/[\s-]+/).some((w) => w.startsWith(q)) ? 1 : 2;
        };
        const hits = MAKES.filter((m) => m.toLowerCase().includes(q)).sort((a, b) => rank(a) - rank(b) || a.localeCompare(b));
        return hits.length ? [{title: '', items: hits}] : [];
    }, [q]);
    const flat = useMemo(() => [...(any && !q ? [''] : []), ...groups.flatMap((g) => g.items)], [groups, any, q]);

    useEffect(() => {
        setActive(0);
    }, [q]);
    useEffect(() => {
        if (!open) return;
        const away = (e: MouseEvent) => {
            if (!box.current?.contains(e.target as Node)) {
                setOpen(false);
                setText('');
            }
        };
        document.addEventListener('mousedown', away);
        return () => document.removeEventListener('mousedown', away);
    }, [open]);
    useEffect(() => {
        if (open) listRef.current?.querySelector<HTMLElement>('[data-active="true"]')?.scrollIntoView({block: 'nearest'});
    }, [active, open]);

    const choose = (m: string) => {
        onChange(m);
        setOpen(false);
        setText('');
    };
    const onKey = (e: React.KeyboardEvent) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setOpen(true);
            setActive((a) => Math.min(flat.length - 1, a + 1));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setActive((a) => Math.max(0, a - 1));
        } else if (e.key === 'Enter' && open) {
            e.preventDefault();
            if (flat.length) choose(flat[active] ?? '');
        } else if (e.key === 'Escape') {
            setOpen(false);
            setText('');
        }
    };

    let idx = any && !q ? 0 : -1;
    const row = (m: string, key: string) => {
        idx += 1;
        const me = idx;
        const on = value === m;
        return (
            <button type="button" key={key} role="option" aria-selected={on} data-active={me === active}
                    onMouseEnter={() => setActive(me)} onClick={() => choose(m)}
                    className={`flex w-full items-center justify-between rounded-lg py-1.5 pl-6 pr-3 text-left text-sm transition ${me === active ? 'bg-brand-50' : ''} ${on ? 'font-bold text-brand-600' : 'text-slate-700'}`}>
                {m}{on && <Check className="h-4 w-4"/>}
            </button>
        );
    };

    return (
        <div ref={box} className={`relative ${className}`}>
            <div className="relative">
                <Tag className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-500"
                     aria-hidden/>
                <input
                    className={`input !pl-9 ${value && any ? '!pr-14' : '!pr-8'}`}
                    value={shown}
                    placeholder={placeholder ?? (any ? t('Any Make') : t('Type or choose the make'))}
                    onFocus={() => {
                        setOpen(true);
                        setText('');
                    }}
                    onChange={(e) => {
                        setText(e.target.value);
                        setOpen(true);
                    }}
                    onKeyDown={onKey}
                    role="combobox" aria-expanded={open} aria-autocomplete="list" autoComplete="off"
                />
                <div className="absolute right-2 top-1/2 flex -translate-y-1/2 items-center gap-1">
                    {value && any && <button type="button" onClick={() => choose('')}
                                             className="rounded-md p-1 text-slate-400 hover:bg-brand-50 hover:text-slate-600"
                                             aria-label={t('Clear')}><X className="h-4 w-4"/></button>}
                    <button type="button" tabIndex={-1} onClick={() => setOpen((o) => !o)}
                            className="rounded-md p-1 text-slate-400" aria-label={t('Show all makes')}><ChevronDown
                        className={`h-4 w-4 transition ${open ? 'rotate-180' : ''}`}/></button>
                </div>
                {required && <input tabIndex={-1} aria-hidden required value={value} onChange={() => undefined}
                                    className="pointer-events-none absolute inset-x-0 bottom-0 h-px opacity-0"/>}
            </div>
            {open && (
                <div ref={listRef} role="listbox"
                     className="suggest-list absolute left-0 right-0 z-40 mt-1 max-h-72 overflow-y-auto rounded-xl border border-brand-200 bg-white p-1 shadow-soft animate-rise">
                    {any && !q && (
                        <button type="button" data-active={active === 0} onMouseEnter={() => setActive(0)}
                                onClick={() => choose('')}
                                className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm font-semibold hover:bg-brand-50 ${!value ? 'bg-brand-50 text-brand-600' : 'text-navy-800'}`}>{t('Any Make')}{!value &&
                            <Check className="h-4 w-4"/>}</button>
                    )}
                    {groups.length === 0 &&
                        <p className="px-3 py-3 text-sm text-slate-500">{t('No make found for')} "{text}"</p>}
                    {groups.map((g) => (
                        <div key={g.title || 'hits'}>
                            {g.title &&
                                <p className="sticky top-0 z-10 bg-white px-3 pb-1 pt-2 text-[13px] font-extrabold text-navy-900">{t(g.title)}</p>}
                            {g.items.map((m) => row(m, `${g.title}-${m}`))}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
