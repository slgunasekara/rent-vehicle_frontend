import {useMemo, useState} from 'react';
import {Calculator} from 'lucide-react';
import type {VehicleDetailT} from '../../types';
import {FUEL_PRICE} from '../../data/fuelPrices';
import {useT} from '../../i18n';

const rs = (n: number): string => `Rs. ${Math.round(n).toLocaleString('en-US')}`;

export default function TripCalculator({v}: { v: VehicleDetailT }) {
    const t = useT();
    const [days, setDays] = useState('1');
    const [km, setKm] = useState('');
    const [fuelPrice, setFuelPrice] = useState(String(FUEL_PRICE[v.fuel] ?? 300));
    const [withFuel, setWithFuel] = useState(true);
    const d = Math.max(0, Number(days) || 0), k = Math.max(0, Number(km) || 0),
        fp = Math.max(0, Number(fuelPrice) || 0);
    const canFuel = !!v.kmPerLitre && v.fuel !== 'electric';

    const calc = useMemo(() => {
        const lines: { label: string; value: number }[] = [];
        if (v.priceType === 'call') return {lines, rental: null as number | null};
        if (v.pricePerDay && (v.priceType === 'per_day' || v.priceType === 'km_and_day')) lines.push({
            label: `${d} ${t('day(s)')} × ${rs(v.pricePerDay)}`,
            value: d * v.pricePerDay
        });
        if (v.pricePerKm && (v.priceType === 'per_km' || v.priceType === 'km_and_day')) lines.push({
            label: `${k} km × ${rs(v.pricePerKm)}`,
            value: k * v.pricePerKm
        });
        if (v.pricePerMonth && v.priceType === 'per_month') lines.push({
            label: `${d} ${t('day(s)')} × ${rs(v.pricePerMonth / 30)} (${t('monthly price')} ÷ 30)`,
            value: (d * v.pricePerMonth) / 30
        });
        return {lines, rental: lines.reduce((s, l) => s + l.value, 0)};
    }, [v, d, k, t]);

    const litres = canFuel && k > 0 ? k / (v.kmPerLitre as number) : 0;
    const fuel = litres * fp;
    const total = (calc.rental ?? 0) + (withFuel && canFuel ? fuel : 0);
    const field = 'input !py-2';

    return (
        <div className="card lg:col-span-2">
            <h2 className="mb-1 flex items-center gap-2 font-extrabold text-navy-800"><Calculator
                className="h-5 w-5 text-brand-600"/> {t('Trip cost calculator')}</h2>
            <p className="mb-3 text-sm text-slate-500">{t('Enter your trip to see an estimate. The final price is agreed with the owner.')}</p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <label><span className="label">{t('Days')}</span><input className={field} type="number"
                                                                        inputMode="numeric" min={1} max={365}
                                                                        value={days}
                                                                        onChange={(e) => setDays(e.target.value)}/></label>
                <label><span className="label">{t('Distance (km)')}</span><input className={field} type="number"
                                                                                 inputMode="numeric" min={0}
                                                                                 placeholder="e.g. 250" value={km}
                                                                                 onChange={(e) => setKm(e.target.value)}/></label>
                {canFuel &&
                    <label><span className="label">{t('Fuel price (Rs. / litre)')}</span><input className={field}
                                                                                                type="number"
                                                                                                inputMode="decimal"
                                                                                                min={0}
                                                                                                value={fuelPrice}
                                                                                                onChange={(e) => setFuelPrice(e.target.value)}/></label>}
                {canFuel && <label className="flex items-end gap-2 pb-2.5 text-sm font-semibold text-navy-800"><input
                    type="checkbox" className="h-4 w-4 accent-brand-500" checked={withFuel}
                    onChange={(e) => setWithFuel(e.target.checked)}/> {t('I pay for the fuel')}</label>}
            </div>

            <div className="mt-4 space-y-1.5 rounded-xl bg-brand-50/60 p-3 text-sm sm:p-4">
                {calc.rental === null ?
                    <p className="font-semibold text-navy-800">{t('This ad has no fixed price. Call the owner to ask the price.')}</p> : calc.lines.map((l) => (
                        <div key={l.label} className="flex justify-between gap-3"><span
                            className="text-slate-600">{l.label}</span><b
                            className="shrink-0 text-navy-800">{rs(l.value)}</b></div>
                    ))}
                {canFuel && k > 0 && (
                    <div className={`flex justify-between gap-3 ${withFuel ? '' : 'opacity-50'}`}><span
                        className="text-slate-600">{t('Fuel')}: {litres.toFixed(1)} {t('litres')} ({k} km ÷ {v.kmPerLitre} km/L) × {rs(fp)}</span><b
                        className="shrink-0 text-navy-800">{rs(fuel)}</b></div>
                )}
                {!canFuel && v.fuel !== 'electric' &&
                    <p className="text-xs text-slate-500">{t('The owner did not enter the fuel economy, so the fuel cost is not estimated.')}</p>}
                {calc.rental !== null && (
                    <div className="mt-2 flex items-center justify-between border-t border-brand-100 pt-2 text-base">
                        <span className="font-bold text-navy-800">{t('Estimated total')}</span><b
                        className="text-lg text-brand-600">{rs(total)}</b></div>
                )}
            </div>
            <p className="mt-2 text-xs text-slate-400">{t('This is only an estimate. Extra charges, driver fees and deposits are agreed with the owner.')}</p>
        </div>
    );
}
