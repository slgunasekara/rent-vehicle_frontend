import { Link } from 'react-router-dom';
import { CATEGORIES } from '../../data/vehicleOptions';
import { CATEGORY_ICON } from './icons';
import { useT } from '../../i18n';

/** the row of "Rent Cars / Rent SUVs / Rent Vans ..." tiles - each one opens Find Vehicles for that kind of vehicle */
export default function CategoryTiles({ counts, active }: { counts?: Record<string, number>; active?: string }) {
  const t = useT();
  return (
    <div className="-mx-4 flex snap-x gap-2 overflow-x-auto px-4 pb-1.5 [scrollbar-width:none] sm:mx-0 sm:grid sm:grid-cols-5 sm:gap-2.5 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-9 [&::-webkit-scrollbar]:hidden">
      {CATEGORIES.map((c) => {
        const I = CATEGORY_ICON[c.key];
        const on = active === c.key;
        return (
          <Link key={c.key} to={`/find?category=${c.key}`} className={`group flex w-[5.4rem] shrink-0 snap-start flex-col items-center gap-1 rounded-2xl border p-2.5 text-center sm:w-auto sm:gap-1.5 sm:p-3 transition hover:-translate-y-0.5 hover:shadow-soft ${on ? 'border-brand-500 bg-brand-500 text-white' : 'border-brand-100 bg-brand-100/70 text-navy-800 hover:border-brand-400'}`}>
            <I className={`h-7 w-7 ${on ? 'text-white' : 'text-navy-700 group-hover:text-brand-600'}`} aria-hidden />
            <span className="text-xs font-bold leading-tight">{t('Rent')}<br />{t(c.label)}</span>
            {counts && <span className={`text-[10px] font-semibold ${on ? 'text-white/80' : 'text-slate-500'}`}>{counts[c.key] ?? 0} {t('ads')}</span>}
          </Link>
        );
      })}
    </div>
  );
}
