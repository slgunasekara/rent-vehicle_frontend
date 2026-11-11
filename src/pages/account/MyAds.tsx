import {useCallback, useEffect, useState} from 'react';
import {Link, useSearchParams} from 'react-router-dom';
import toast from 'react-hot-toast';
import {
    AlertTriangle,
    Eye,
    Heart,
    Pencil,
    Phone,
    PlusCircle,
    RefreshCw,
    Rocket,
    Star,
    Trash2,
    Timer
} from 'lucide-react';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import {ConfirmModal, Empty, Spinner} from '../../components/common/ui';
import {PriceBlock} from '../../components/vehicle/VehicleCard';
import {api, errMsg} from '../../service/api';
import {categoryLabel, fmtDate, photo, vehicleTitle} from '../../utils/format';
import type {VehicleCardT} from '../../types';
import {useT} from '../../i18n';
import BoostModal from '../../components/vehicle/BoostModal';
import {paymentStatus} from '../../service/extras';

export default function MyAds() {
    const t = useT();
    const [list, setList] = useState<VehicleCardT[] | null>(null);
    const [del, setDel] = useState<VehicleCardT | null>(null);
    const [busy, setBusy] = useState(false);
    const [boost, setBoost] = useState<VehicleCardT | null>(null);
    const [params, setParams] = useSearchParams();

    const load = useCallback(() => {
        api.get('/vehicles/mine').then((r) => setList(r.data.data)).catch((e) => {
            toast.error(errMsg(e));
            setList([]);
        });
    }, []);
    useEffect(load, [load]);

    useEffect(() => {
        const b = params.get('boost'), order = params.get('order');
        if (!b) return;
        setParams({}, {replace: true});
        if (b === 'cancelled') {
            toast(t('The payment was cancelled. Nothing was charged.'));
            return;
        }
        if (!order) return;
        let tries = 0;
        const poll = async (): Promise<void> => {
            try {
                const s = await paymentStatus(order);
                if (s.status === 'paid') {
                    toast.success(t('Payment received. Your ad is a Top ad now!'));
                    load();
                    return;
                }
                if (s.status === 'failed' || s.status === 'cancelled') {
                    toast.error(t('The payment did not go through.'));
                    return;
                }
            } catch { /* try again */
            }
            if (++tries < 8) setTimeout(poll, 2500); else toast(t('We are waiting for PayHere to confirm the payment. It will show here in a moment.'));
        };
        void poll();
    }, []);

    const renew = async (v: VehicleCardT) => {
        try {
            const r = await api.post(`/vehicles/${v._id}/renew`);
            toast.success(r.data.message);
            load();
        } catch (e) {
            toast.error(errMsg(e));
        }
    };
    const remove = async () => {
        if (!del) return;
        setBusy(true);
        try {
            const r = await api.delete(`/vehicles/${del._id}`);
            toast.success(r.data.message);
            setDel(null);
            load();
        } catch (e) {
            toast.error(errMsg(e));
        } finally {
            setBusy(false);
        }
    };

    return (
        <div className="flex min-h-screen flex-col bg-surface">
            <Navbar/>
            <main className="w-full flex-1 mx-auto max-w-5xl px-4 py-6 sm:py-8">
                <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
                    <div><h1 className="text-2xl font-extrabold text-navy-800">{t('My Ads')}</h1><p
                        className="text-sm text-slate-500">{t('Edit, renew or delete your ads any time.')}</p></div>
                    <Link to="/post" className="btn-primary"><PlusCircle className="h-4 w-4"/> {t('Post an Ad')}</Link>
                </div>
                {!!list?.length && (
                    <div className="mb-4 grid grid-cols-2 gap-2.5 sm:grid-cols-4" aria-label={t('Your numbers')}>
                        {[{i: <PlusCircle className="h-4 w-4"/>, n: list.length, l: t('Ads')}, {
                            i: <Eye className="h-4 w-4"/>,
                            n: list.reduce((s, v) => s + (v.views ?? 0), 0),
                            l: t('Views')
                        }, {
                            i: <Phone className="h-4 w-4"/>,
                            n: list.reduce((s, v) => s + (v.callClicks ?? 0), 0),
                            l: t('Calls')
                        }, {
                            i: <Heart className="h-4 w-4"/>,
                            n: list.reduce((s, v) => s + (v.saves ?? 0), 0),
                            l: t('Saved by')
                        }].map((x) => (
                            <div key={x.l} className="card !p-3"><p
                                className="flex items-center gap-1.5 text-xs font-semibold text-slate-500"><span
                                className="text-brand-600">{x.i}</span>{x.l}</p><p
                                className="text-2xl font-extrabold text-navy-800">{x.n.toLocaleString('en-US')}</p>
                            </div>
                        ))}
                    </div>
                )}
                {list === null ? <Spinner/> : list.length === 0 ? (
                    <div className="card"><Empty title={t('You have no ads yet')}
                                                 hint={t('Post your first ad - it is free and goes live at once.')}
                                                 action={<Link to="/post"
                                                               className="btn-primary mt-2">{t('Post an Ad')}</Link>}/>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {list.map((v) => {
                            const hidden = v.expired || v.insuranceExpired;
                            return (
                                <div key={v._id} className="card !p-3 sm:!p-4">
                                    {/* phones: small photo on the left, details on the right; the four buttons sit under both */}
                                    <div className="flex gap-3 sm:gap-4">
                                        <div
                                            className="h-24 w-28 shrink-0 overflow-hidden rounded-xl bg-navy-800 sm:h-auto sm:w-52 sm:aspect-[4/3]">{v.cover ?
                                            <img src={photo(v.cover)} alt="" loading="lazy"
                                                 className="h-full w-full object-cover"/> : null}</div>
                                        <div className="min-w-0 flex-1 space-y-1.5 sm:space-y-2">
                                            <h2 className="line-clamp-2 text-[15px] font-extrabold leading-snug text-navy-800 sm:text-lg">{vehicleTitle(v)}</h2>
                                            <div className="flex flex-wrap items-center gap-1.5">
                                                <span
                                                    className="badge bg-brand-50 text-brand-700">{t(categoryLabel(v.category))}</span>
                                                {hidden ? <span
                                                        className="badge bg-red-100 text-red-700">{t('Hidden')}</span> :
                                                    <span
                                                        className="badge bg-emerald-100 text-emerald-700">{t('Live')}</span>}
                                            </div>
                                            <p className="truncate text-xs text-slate-500 sm:text-sm">{v.city}, {v.district}</p>
                                            <div className="[&_p]:!text-[15px] sm:[&_p]:!text-base"><PriceBlock v={v}/>
                                            </div>
                                            <div
                                                className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-semibold text-slate-500">
                                                <span className="inline-flex items-center gap-1" title={t('Views')}><Eye
                                                    className="h-3.5 w-3.5"/> {(v.views ?? 0).toLocaleString('en-US')}</span>
                                                <span className="inline-flex items-center gap-1"
                                                      title={t('Calls')}><Phone
                                                    className="h-3.5 w-3.5"/> {(v.callClicks ?? 0).toLocaleString('en-US')}</span>
                                                <span className="inline-flex items-center gap-1"
                                                      title={t('Saved by')}><Heart
                                                    className="h-3.5 w-3.5"/> {(v.saves ?? 0).toLocaleString('en-US')}</span>
                                                {v.featured && <span className="badge bg-amber-100 text-amber-800"><Star
                                                    className="h-3 w-3 fill-amber-400 text-amber-400"/> {t('Top ad until')} {fmtDate(v.featuredUntil as string)}</span>}
                                            </div>
                                            <div className="hidden space-y-2 sm:block">
                                                {v.expired &&
                                                    <p className="flex items-center gap-1.5 rounded-lg bg-red-50 p-2 text-sm text-red-700">
                                                        <AlertTriangle
                                                            className="h-4 w-4 shrink-0"/> {t('This ad ran out of its 60 days and will be removed soon. Renew it to keep it.')}
                                                    </p>}
                                                {!v.expired && v.insuranceExpired &&
                                                    <p className="flex items-center gap-1.5 rounded-lg bg-red-50 p-2 text-sm text-red-700">
                                                        <AlertTriangle
                                                            className="h-4 w-4 shrink-0"/> {t('The insurance expired on {d}. The ad is hidden - edit it and enter the new insurance date.', {d: fmtDate(v.insuranceExpiry)})}
                                                    </p>}
                                                {!v.expired &&
                                                    <p className={`flex items-center gap-1.5 text-sm font-semibold ${v.daysLeft <= 7 ? 'text-amber-600' : 'text-slate-500'}`}>
                                                        <Timer
                                                            className="h-4 w-4"/> {t('Expires in {n} days', {n: v.daysLeft})} · {t('Insurance until {d}', {d: fmtDate(v.insuranceExpiry)})}
                                                    </p>}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mt-2.5 space-y-2 sm:hidden">
                                        {v.expired &&
                                            <p className="flex items-center gap-1.5 rounded-lg bg-red-50 p-2 text-sm text-red-700">
                                                <AlertTriangle
                                                    className="h-4 w-4 shrink-0"/> {t('This ad ran out of its 60 days and will be removed soon. Renew it to keep it.')}
                                            </p>}
                                        {!v.expired && v.insuranceExpired &&
                                            <p className="flex items-center gap-1.5 rounded-lg bg-red-50 p-2 text-sm text-red-700">
                                                <AlertTriangle
                                                    className="h-4 w-4 shrink-0"/> {t('The insurance expired on {d}. The ad is hidden - edit it and enter the new insurance date.', {d: fmtDate(v.insuranceExpiry)})}
                                            </p>}
                                        {!v.expired &&
                                            <p className={`flex items-center gap-1.5 text-sm font-semibold ${v.daysLeft <= 7 ? 'text-amber-600' : 'text-slate-500'}`}>
                                                <Timer
                                                    className="h-4 w-4"/> {t('Expires in {n} days', {n: v.daysLeft})} · {t('Insurance until {d}', {d: fmtDate(v.insuranceExpiry)})}
                                            </p>}
                                    </div>
                                    <div className="mt-3 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:pt-1">
                                        <Link to={`/vehicle/${v._id}`} className="btn-ghost !py-2"><Eye
                                            className="h-4 w-4"/> {t('View')}</Link>
                                        <Link to={`/post/${v._id}`} className="btn-ghost !py-2"><Pencil
                                            className="h-4 w-4"/> {t('Edit')}</Link>
                                        <button className="btn-ghost !py-2" onClick={() => renew(v)}><RefreshCw
                                            className="h-4 w-4"/> {t('Renew 60 days')}</button>
                                        <button className="btn-danger !py-2" onClick={() => setDel(v)}><Trash2
                                            className="h-4 w-4"/> {t('Delete')}</button>
                                        {!hidden && <button
                                            className="btn col-span-2 !py-2 bg-amber-400 text-navy-900 hover:bg-amber-300 sm:col-span-1"
                                            onClick={() => setBoost(v)}><Rocket
                                            className="h-4 w-4"/> {v.featured ? t('Extend Top ad') : t('Make it a Top ad')}
                                        </button>}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </main>
            <ConfirmModal open={!!del} title={t('Delete this ad?')}
                          text={t('The ad and its photos are removed for good. You can post it again later.')}
                          busy={busy} onConfirm={remove} onClose={() => setDel(null)}/>
            <BoostModal ad={boost} onClose={() => setBoost(null)} onDone={load}/>
            <Footer/>
        </div>
    );
}
