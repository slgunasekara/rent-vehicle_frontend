import {useEffect, useMemo, useRef, useState} from 'react';
import {Check, ChevronDown, MapPin, X} from 'lucide-react';
import {DISTRICTS} from '../../data/locations';
import {useT} from '../../i18n';

export interface Place {
    district: string;
    city: string
}

export const ANY_PLACE: Place = {district: '', city: ''};
export const placeText = (p: Place): string => (p.city ? p.city : p.district ? `${p.district} District` : '');

interface Opt {
    district: string;
    city: string;
    label: string;
    whole?: boolean
}


export default function CityPicker({value, onChange, requireCity = false, placeholder, glass = false, className = ''}: {
    value: Place;
    onChange: (p: Place) => void;
    requireCity?: boolean;
    placeholder?: string;
    glass?: boolean;
    className?: string
}) {
    const t = useT();
    const [open, setOpen] = useState(false);
    const [text, setText] = useState('');
    const [active, setActive] = useState(0);
    const box = useRef<HTMLDivElement>(null);
    const listRef = useRef<HTMLDivElement>(null);

    const shown = open ? text : placeText(value);
    const q = text.trim().toLowerCase();

    const groups = useMemo(() => {
        const out: { district: string; province: string; opts: Opt[] }[] = [];
        for (const d of DISTRICTS) {
            const districtHit = !!q && `${d.district} district`.toLowerCase().includes(q);
            const opts: Opt[] = [];
            if (!requireCity && (!q || districtHit)) opts.push({
                district: d.district,
                city: '',
                label: `${d.district} District`,
                whole: true
            });
            for (const c of d.cities) if (!q || districtHit || c.toLowerCase().includes(q)) opts.push({
                district: d.district,
                city: c,
                label: c
            });
            if (opts.length) out.push({district: d.district, province: d.province, opts});
        }
        if (q) {
            const rank = (o: Opt): number => {
                const l = o.label.toLowerCase();
                return l.startsWith(q) ? 0 : l.split(/[\s-]+/).some((w) => w.startsWith(q)) ? 1 : 2;
            };
            for (const g of out) g.opts.sort((a, b) => rank(a) - rank(b));
            out.sort((a, b) => Math.min(...a.opts.map(rank)) - Math.min(...b.opts.map(rank)));
        }
        return out;
    }, [q, requireCity]);
    const flat = useMemo(() => groups.flatMap((g) => g.opts), [groups]);

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

    const choose = (o: Opt) => {
        onChange({district: o.district, city: o.city});
        setOpen(false);
        setText('');
    };
    const clear = () => {
        onChange(ANY_PLACE);
        setText('');
        setOpen(false);
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
            if (flat[active]) choose(flat[active]);
        } else if (e.key === 'Escape') {
            setOpen(false);
            setText('');
        }
    };

    const hasValue = !!(value.district || value.city);
    let idx = -1;
    return (
        <div ref={box} className={`relative ${className}`}>
            <div className="relative">
                <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-500"
                        aria-hidden/>
                <input
                    className="input !pl-9 !pr-9"
                    value={shown}
                    placeholder={placeholder ?? (requireCity ? t('Type or choose your city') : t('Any City'))}
                    onFocus={() => {
                        setOpen(true);
                        setText('');
                    }}
                    onChange={(e) => {
                        setText(e.target.value);
                        setOpen(true);
                    }}
                    onKeyDown={onKey}
                    role="combobox"
                    aria-expanded={open}
                    aria-autocomplete="list"
                    autoComplete="off"
                />
                <div className="absolute right-2 top-1/2 flex -translate-y-1/2 items-center gap-1">
                    {hasValue && !requireCity && <button type="button" onClick={clear}
                                                         className="rounded-md p-1 text-slate-400 hover:bg-brand-50 hover:text-slate-600"
                                                         aria-label={t('Clear')}><X className="h-4 w-4"/></button>}
                    <button type="button" tabIndex={-1} onClick={() => setOpen((o) => !o)}
                            className="rounded-md p-1 text-slate-400" aria-label={t('Show all cities')}><ChevronDown
                        className={`h-4 w-4 transition ${open ? 'rotate-180' : ''}`}/></button>
                </div>
            </div>
            {open && (
                <div ref={listRef} role="listbox"
                     className={`suggest-list absolute left-0 right-0 z-40 mt-1 max-h-72 overflow-y-auto rounded-xl border bg-white p-1 shadow-soft animate-rise ${glass ? 'border-white/30' : 'border-brand-200'}`}>
                    {!requireCity && !q && (
                        <button type="button" onClick={clear}
                                className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm font-semibold hover:bg-brand-50 ${!hasValue ? 'bg-brand-50 text-brand-600' : 'text-navy-800'}`}>{t('Any City')}{!hasValue &&
                            <Check className="h-4 w-4"/>}</button>
                    )}
                    {groups.length === 0 &&
                        <p className="px-3 py-3 text-sm text-slate-500">{t('No city found for')} "{text}"</p>}
                    {groups.map((g) => (
                        <div key={g.district}>
                            <p className="sticky top-0 z-10 bg-white px-3 pb-1 pt-2 text-[13px] font-extrabold text-navy-900">{g.district} District <span
                                className="font-medium text-slate-400">· {g.province}</span></p>
                            {g.opts.map((o) => {
                                idx += 1;
                                const me = idx;
                                const on = value.district === o.district && value.city === o.city;
                                return (
                                    <button type="button" key={o.district + o.city} role="option" aria-selected={on}
                                            data-active={me === active} onMouseEnter={() => setActive(me)}
                                            onClick={() => choose(o)}
                                            className={`flex w-full items-center justify-between rounded-lg py-1.5 pl-6 pr-3 text-left text-sm transition ${me === active ? 'bg-brand-50' : ''} ${on ? 'font-bold text-brand-600' : o.whole ? 'font-semibold text-navy-800' : 'text-slate-700'}`}>
                                        {o.label}{on && <Check className="h-4 w-4"/>}
                                    </button>
                                );
                            })}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
