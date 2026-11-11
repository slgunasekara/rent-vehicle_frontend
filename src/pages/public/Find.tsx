import {useEffect, useState} from 'react';
import {useSearchParams} from 'react-router-dom';
import {SlidersHorizontal} from 'lucide-react';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import CategoryTiles from '../../components/vehicle/CategoryTiles';
import FilterPanel from '../../components/vehicle/FilterPanel';
import AdGrid from '../../components/vehicle/AdGrid';
import AdSkeleton from '../../components/vehicle/AdSkeleton';
import ViewMenu from '../../components/vehicle/ViewMenu';
import {Empty, Pagination} from '../../components/common/ui';
import {api, errMsg} from '../../service/api';
import {EMPTY_FILTERS, Filters, fromParams, toParams} from '../../utils/filters';
import {placeText} from '../../components/common/CityPicker';
import {categoryPlural} from '../../utils/format';
import type {Paged, VehicleCardT} from '../../types';
import {useT} from '../../i18n';

export default function Find() {
    const t = useT();
    const [sp, setSp] = useSearchParams();
    const [f, setF] = useState<Filters>(() => fromParams(sp));
    const [res, setRes] = useState<Paged<VehicleCardT> | null>(null);
    const [err, setErr] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const page = Math.max(1, Number(sp.get('page')) || 1);
    const key = sp.toString();

    useEffect(() => {
        setF(fromParams(sp));
    }, [key]);
    useEffect(() => {
        let alive = true;
        setErr('');
        setRes(null);
        api.get('/vehicles', {params: Object.fromEntries(sp.entries())})
            .then((r) => {
                if (alive) setRes({data: r.data.data, meta: r.data.meta});
            })
            .catch((e) => {
                if (alive) {
                    setErr(errMsg(e, 'Could not load the vehicles'));
                    setRes({data: [], meta: {total: 0, page: 1, pages: 1, pageSize: 12}});
                }
            });
        return () => {
            alive = false;
        };
    }, [key]);

    const apply = (next: Filters, p = 1) => {
        setSp(toParams(next, p));
        setShowFilters(false);
        window.scrollTo({top: 0, behavior: 'smooth'});
    };
    const sort = (s: string) => apply({...fromParams(sp), sort: s});
    const applied = fromParams(sp);
    const title = applied.category ? t(`Rent ${categoryPlural(applied.category)}`) : t('All vehicles for hire');

    return (
        <div className="flex min-h-screen flex-col bg-surface">
            <Navbar/>
            <main className="w-full flex-1 mx-auto max-w-7xl px-4 py-6 sm:py-8">
                <CategoryTiles active={applied.category}/>
                <div className="mt-5 lg:hidden">
                    <button className="btn-ghost w-full" onClick={() => setShowFilters((s) => !s)}
                            aria-expanded={showFilters}><SlidersHorizontal
                        className="h-4 w-4"/> {showFilters ? t('Hide filters') : t('Show filters')}</button>
                </div>
                <div className={`mt-4 ${showFilters ? '' : 'hidden'} lg:mt-5 lg:block`}>
                    <FilterPanel value={f} onChange={setF} onSubmit={() => apply(f)}
                                 onReset={() => apply(EMPTY_FILTERS)} compact={false} busy={res === null}/>
                </div>

                <div className="mb-4 mt-8 flex flex-wrap items-end justify-between gap-3">
                    <div>
                        <h1 className="text-xl font-extrabold text-navy-800 sm:text-2xl">{title}</h1>
                        <p className="text-sm text-slate-500">
                            {res ? t('{n} ads found', {n: res.meta.total}) : t('Searching...')}
                            {(applied.place.city || applied.place.district) && <> · {placeText(applied.place)}</>}
                        </p>
                    </div>
                    <div className="flex items-center gap-2"><ViewMenu/><label
                        className="flex items-center gap-2 text-sm"><span
                        className="hidden font-semibold text-slate-500 sm:inline">{t('Sort by')}</span>
                        <select className="input !w-auto" value={applied.sort} onChange={(e) => sort(e.target.value)}>
                            <option value="newest">{t('Newest first')}</option>
                            <option value="price_asc">{t('Price: low to high')}</option>
                            <option value="price_desc">{t('Price: high to low')}</option>
                            <option value="rating">{t('Top rated')}</option>
                        </select>
                    </label></div>
                </div>

                {err && <p className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{err}</p>}
                {res === null ? <AdSkeleton/> : res.data.length === 0 ? (
                    <div className="card"><Empty title={t('No vehicles match these filters')}
                                                 hint={t('Try another city, remove a filter, or widen the price range.')}
                                                 action={<button className="btn-primary mt-2"
                                                                 onClick={() => apply(EMPTY_FILTERS)}>{t('Clear all filters')}</button>}/>
                    </div>
                ) : (
                    <>
                        <AdGrid ads={res.data}/>
                        <Pagination page={res.meta.page} pages={res.meta.pages} onPage={(p) => {
                            setSp(toParams(applied, p));
                            window.scrollTo({top: 0, behavior: 'smooth'});
                        }}/>
                    </>
                )}
            </main>
            <Footer/>
        </div>
    );
}
