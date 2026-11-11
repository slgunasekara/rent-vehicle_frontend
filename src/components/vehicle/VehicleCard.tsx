import {Link} from 'react-router-dom';
import {Fuel, Eye, MapPin, UserRound, Users, ShieldCheck, Phone} from 'lucide-react';
import type {VehicleCardT} from '../../types';
import {
    categoryLabel,
    conditionLabel,
    driverLabel,
    fuelLabel,
    photo,
    priceLines,
    telHref,
    vehicleTitle
} from '../../utils/format';
import {CATEGORY_ICON} from './icons';
import {useT} from '../../i18n';
import HeartButton from './HeartButton';
import {RatingBadge} from '../common/Stars';

export function PriceBlock({v, big = false}: {
    v: Pick<VehicleCardT, 'priceType' | 'pricePerKm' | 'pricePerDay' | 'pricePerMonth'>;
    big?: boolean
}) {
    const t = useT();
    const lines = priceLines(v);
    if (!lines.length) return <p
        className={`font-extrabold text-brand-600 ${big ? 'text-2xl' : 'text-base'}`}>{t('Call now for the price')}</p>;
    return (
        <div>
            {lines.map((l, i) => <p key={l}
                                    className={`font-extrabold leading-tight ${i === 0 ? `text-brand-600 ${big ? 'text-2xl' : 'text-lg'}` : `text-navy-700 ${big ? 'text-lg' : 'text-sm'}`}`}>{l}</p>)}
        </div>
    );
}


export default function VehicleCard({v, variant = 'large'}: { v: VehicleCardT; variant?: 'large' | 'list' | 'grid' }) {
    const t = useT();
    const I = CATEGORY_ICON[v.category];
    const cover = photo(v.cover);
    const href = `/vehicle/${v._id}`;
    const call = <a href={telHref(v.contactNumber)} className="btn-primary !gap-1.5 !px-3 !py-2 text-sm"
                    aria-label={`${t('Call')} ${v.contactNumber}`}><Phone className="h-4 w-4"/><span
        className={variant === 'grid' ? 'hidden' : 'hidden min-[420px]:inline'}>{t('Call')}</span></a>;
    const photoBox = (cls: string) => (
        <Link to={href}
              className={`relative block overflow-hidden bg-gradient-to-br from-navy-700 to-brand-500 ${cls}`}>
            {cover ? <img src={cover} alt={vehicleTitle(v)} loading="lazy" decoding="async"
                          className="h-full w-full object-cover transition duration-500 hover:scale-105"/> :
                <div className="grid h-full place-items-center text-white/80"><I className="h-10 w-10"/></div>}
            <span
                className="badge absolute left-1.5 top-1.5 bg-white/90 text-navy-800 shadow-soft sm:left-2.5 sm:top-2.5"><I
                className="h-3.5 w-3.5"/><span
                className={variant === 'large' ? '' : 'hidden sm:inline'}>{t(categoryLabel(v.category))}</span></span>
            {v.condition === 'brand_new' && <span
                className="badge absolute bottom-1.5 left-1.5 bg-emerald-500 text-white sm:bottom-2.5 sm:left-2.5">{t('Brand New')}</span>}
            {v.featured && <span
                className="badge absolute bottom-1.5 right-1.5 bg-amber-400 font-extrabold uppercase tracking-wide text-navy-900 shadow-soft sm:bottom-2.5 sm:right-2.5">{t('Top ad')}</span>}
        </Link>
    );
    const views = <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-400"
                        title={t('Views')}><Eye
        className="h-3.5 w-3.5"/> {(v.views ?? 0).toLocaleString('en-US')} {t('views')}</span>;
    const top = v.featured ? ' ring-2 ring-amber-300 bg-amber-50/40' : '';

    if (variant === 'list') {
        return (
            <article className={`card lift relative flex overflow-hidden !p-0${top}`}>
                {photoBox('w-[8.25rem] shrink-0 self-stretch min-h-[7.5rem] sm:w-48')}
                <HeartButton id={v._id} className="absolute left-[5.4rem] top-1.5 z-10 !h-8 !w-8 sm:left-[9.7rem]"/>
                <div className="flex min-w-0 flex-1 flex-col gap-1 p-2.5 sm:p-3.5">
                    <Link to={href}
                          className="line-clamp-2 text-[15px] font-extrabold leading-snug text-navy-800 hover:text-brand-600">{vehicleTitle(v)}</Link>
                    <p className="flex items-center gap-1 truncate text-xs text-slate-500"><MapPin
                        className="h-3 w-3 shrink-0"/> <span className="truncate">{v.city}, {v.district}</span></p>
                    <RatingBadge avg={v.ratingAvg} count={v.ratingCount}/>
                    <div className="flex flex-wrap gap-1 text-[11px] font-semibold">
                        <span className="badge bg-brand-50 text-brand-700"><Fuel
                            className="h-3 w-3"/> {t(fuelLabel(v.fuel))}{v.kmPerLitre ? ` · ${v.kmPerLitre} km/L` : ''}</span>
                        <span className="badge bg-brand-50 text-brand-700"><UserRound
                            className="h-3 w-3"/> {t(driverLabel(v.driver))}</span>
                        {v.seats ?
                            <span className="badge hidden bg-brand-50 text-brand-700 min-[400px]:inline-flex"><Users
                                className="h-3 w-3"/> {v.seats}</span> : null}
                    </div>
                    <div className="mt-auto flex items-end justify-between gap-2 pt-1">
                        <div className="min-w-0 [&_p]:!text-[15px]"><PriceBlock v={v}/></div>
                        {call}
                    </div>
                    <div className="-mt-0.5">{views}</div>
                </div>
            </article>
        );
    }

    if (variant === 'grid') {
        return (
            <article className={`card lift relative flex flex-col overflow-hidden !p-0${top}`}>
                {photoBox('aspect-[4/3]')}
                <HeartButton id={v._id} className="absolute right-1.5 top-1.5 z-10 !h-8 !w-8"/>
                <div className="flex flex-1 flex-col gap-1 p-2.5">
                    <Link to={href}
                          className="line-clamp-2 text-sm font-extrabold leading-snug text-navy-800 hover:text-brand-600">{vehicleTitle(v)}</Link>
                    <p className="flex items-center gap-1 truncate text-[11px] text-slate-500"><MapPin
                        className="h-3 w-3 shrink-0"/> <span className="truncate">{v.city}</span></p>
                    <RatingBadge avg={v.ratingAvg} count={v.ratingCount}/>
                    <div className="mt-auto flex items-end justify-between gap-1.5 pt-1">
                        <div className="min-w-0 [&_p]:!text-sm"><PriceBlock v={v}/></div>
                        {call}
                    </div>
                    {views}
                </div>
            </article>
        );
    }

    return (
        <article className={`card lift relative flex flex-col overflow-hidden !p-0${top}`}>
            {photoBox('aspect-[4/3]')}
            <HeartButton id={v._id} className="absolute right-2.5 top-2.5 z-10"/>
            <div className="flex flex-1 flex-col gap-2.5 p-4">
                <div>
                    <Link to={href}
                          className="line-clamp-2 text-base font-extrabold text-navy-800 hover:text-brand-600">{vehicleTitle(v)}</Link>
                    <p className="mt-0.5 flex items-center gap-1 text-sm text-slate-500"><MapPin
                        className="h-3.5 w-3.5 shrink-0"/> {v.city}, {v.district}</p>
                    <RatingBadge avg={v.ratingAvg} count={v.ratingCount} className="mt-1"/>
                </div>
                <div className="flex flex-wrap gap-1.5 text-xs font-semibold">
                    <span className="badge bg-brand-50 text-brand-700"><Fuel
                        className="h-3 w-3"/> {t(fuelLabel(v.fuel))}{v.kmPerLitre ? ` · ${v.kmPerLitre} km/L` : ''}</span>
                    <span className="badge bg-brand-50 text-brand-700"><UserRound
                        className="h-3 w-3"/> {t(driverLabel(v.driver))}</span>
                    {v.seats ? <span className="badge bg-brand-50 text-brand-700"><Users className="h-3 w-3"/> {v.seats}</span> : null}
                    <span className="badge bg-slate-100 text-slate-700">{t(conditionLabel(v.condition))}</span>
                </div>
                <div className="mt-auto flex items-end justify-between gap-2 pt-1">
                    <PriceBlock v={v}/>
                    {call}
                </div>
                <div className="flex items-center justify-between gap-2"><p
                    className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600"><ShieldCheck
                    className="h-3.5 w-3.5"/> {t('Insurance valid')}</p>{views}</div>
            </div>
        </article>
    );
}
