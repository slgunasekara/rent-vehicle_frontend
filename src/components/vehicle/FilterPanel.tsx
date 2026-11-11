import {Search} from 'lucide-react';
import CityPicker from '../common/CityPicker';
import MakePicker from '../common/MakePicker';
import {CATEGORIES, CONDITIONS, DRIVERS, FUELS} from '../../data/vehicleOptions';
import type {Filters} from '../../utils/filters';
import {EMPTY_FILTERS} from '../../utils/filters';
import {useT} from '../../i18n';
import {useMinWidth} from '../../utils/adView';


export default function FilterPanel({value, onChange, onSubmit, onReset, compact = false, busy = false}: {
    value: Filters;
    onChange: (f: Filters) => void;
    onSubmit: () => void;
    onReset?: () => void;
    compact?: boolean;
    busy?: boolean
}) {
    const t = useT();
    const wide = useMinWidth(640);
    const set = <K extends keyof Filters>(k: K, v: Filters[K]) => onChange({...value, [k]: v});
    const lbl = 'label';
    return (
        <form onSubmit={(e) => {
            e.preventDefault();
            onSubmit();
        }} className="card !p-4 sm:!p-5">
            <h2 className="mb-4 text-center text-lg font-extrabold text-navy-800 sm:text-xl">{t('Find The Best Vehicle For You')}</h2>
            {/* phones: two fields per row (city and price take the full row) */}
            <div className={`grid grid-cols-2 gap-x-2.5 gap-y-3 sm:gap-3 ${compact ? '' : 'lg:grid-cols-4'}`}>
                <label><span className={lbl}>{t('Type')}</span>
                    <select className="input" value={value.category} onChange={(e) => set('category', e.target.value)}>
                        <option value="">{t('Any Type')}</option>
                        {CATEGORIES.map((c) => <option key={c.key} value={c.key}>{t(`Rent ${c.label}`)}</option>)}
                    </select></label>
                <div><span className={lbl}>{t('Make')}</span><MakePicker value={value.make}
                                                                         onChange={(m) => set('make', m)}/></div>
                <label><span className={lbl}>{t('Model')}</span><input className="input"
                                                                       placeholder={wide ? t('Model (e.g. Corolla, Civic)') : t('Model')}
                                                                       value={value.model}
                                                                       onChange={(e) => set('model', e.target.value)}/></label>
                <label><span className={lbl}>{t('Fuel type')}</span>
                    <select className="input" value={value.fuel} onChange={(e) => set('fuel', e.target.value)}>
                        <option value="">{t('Any Fuel')}</option>
                        {FUELS.map((f) => <option key={f.key} value={f.key}>{t(f.label)}</option>)}
                    </select></label>
                <label><span className={lbl}>{t('Driver')}</span>
                    <select className="input" value={value.driver} onChange={(e) => set('driver', e.target.value)}>
                        <option value="">{t('Any driver')}</option>
                        <option value="with">{t('With driver')}</option>
                        <option value="without">{t('Without driver (self drive)')}</option>
                    </select></label>
                <label><span className={lbl}>{t('Condition')}</span>
                    <select className="input" value={value.condition}
                            onChange={(e) => set('condition', e.target.value)}>
                        <option value="">{t('Any Condition')}</option>
                        {CONDITIONS.map((c) => <option key={c.key} value={c.key}>{t(c.label)}</option>)}
                    </select></label>
                <div className={compact ? 'col-span-2 sm:col-span-1' : 'col-span-2'}><span
                    className={lbl}>{t('City')}</span><CityPicker value={value.place}
                                                                  onChange={(p) => set('place', p)}/></div>
                <div className={compact ? 'col-span-2' : 'col-span-2 lg:col-span-4'}>
                    <span className={lbl}>{t('Price range')}</span>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-[11rem_1fr_1fr]">
                        <select className="input col-span-2 sm:col-span-1" value={value.payment}
                                onChange={(e) => set('payment', e.target.value as Filters['payment'])}
                                aria-label={t('Payment type')}>
                            <option value="daily">{t('Daily payment')}</option>
                            <option value="monthly">{t('Monthly payment')}</option>
                        </select>
                        <input type="number" min={0} inputMode="numeric" className="input"
                               placeholder={t('Min price (Rs.)')} value={value.minPrice}
                               onChange={(e) => set('minPrice', e.target.value)}/>
                        <input type="number" min={0} inputMode="numeric" className="input"
                               placeholder={t('Max price (Rs.)')} value={value.maxPrice}
                               onChange={(e) => set('maxPrice', e.target.value)}/>
                    </div>
                </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:justify-end">
                {onReset && <button type="button" className="btn-ghost" onClick={() => {
                    onChange({...EMPTY_FILTERS});
                    onReset();
                }}>{t('Reset')}</button>}
                <button className="btn-primary col-start-2 sm:min-w-[10rem]" disabled={busy}><Search
                    className="h-4 w-4"/> {t('Search')}</button>
            </div>
        </form>
    );
}
