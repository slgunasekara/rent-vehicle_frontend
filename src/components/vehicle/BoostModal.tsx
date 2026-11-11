import {useEffect, useState} from 'react';
import {CheckCircle2, Rocket, Star, TrendingUp} from 'lucide-react';
import toast from 'react-hot-toast';
import {Modal} from '../common/ui';
import {Plan, confirmDemoPayment, goToPayHere, startTopAd, topAdPlans} from '../../service/extras';
import {errMsg} from '../../service/api';
import {vehicleTitle} from '../../utils/format';
import type {VehicleCardT} from '../../types';
import {useT} from '../../i18n';

const rs = (n: number): string => `Rs. ${n.toLocaleString('en-US')}`;

export default function BoostModal({ad, onClose, onDone}: {
    ad: VehicleCardT | null;
    onClose: () => void;
    onDone: () => void
}) {
    const t = useT();
    const [plans, setPlans] = useState<Plan[] | null>(null);
    const [mode, setMode] = useState<'payhere' | 'demo' | 'off'>('off');
    const [days, setDays] = useState(7);
    const [busy, setBusy] = useState(false);

    useEffect(() => {
        if (!ad) return;
        setPlans(null);
        topAdPlans().then((r) => {
            setPlans(r.plans);
            setMode(r.mode);
            if (r.plans.length) setDays((d) => (r.plans.some((p) => p.days === d) ? d : r.plans[Math.floor(r.plans.length / 2)].days));
        }).catch((e) => {
            toast.error(errMsg(e));
            setPlans([]);
        });
    }, [ad]);

    const pay = async () => {
        if (!ad) return;
        setBusy(true);
        try {
            const r = await startTopAd(ad._id, days);
            if (r.mode === 'payhere') {
                goToPayHere(r.action, r.fields);
                return;
            } // leaves the site for PayHere
            await confirmDemoPayment(r.orderId);
            toast.success(t('Your ad is a Top ad now (test mode, no money was charged).'));
            onDone();
            onClose();
        } catch (e) {
            toast.error(errMsg(e));
        } finally {
            setBusy(false);
        }
    };

    const best = plans && plans.length ? plans.reduce((a, b) => (b.price / b.days < a.price / a.days ? b : a)) : null;
    return (
        <Modal open={!!ad} onClose={onClose} title={t('Make it a Top ad')}>
            {ad && (
                <div className="space-y-4">
                    <p className="text-sm font-semibold text-navy-800">{vehicleTitle(ad)}</p>
                    <ul className="space-y-1.5 text-sm text-slate-600">
                        <li className="flex items-start gap-2"><TrendingUp
                            className="mt-0.5 h-4 w-4 shrink-0 text-brand-600"/> {t('Shown first in the search results')}
                        </li>
                        <li className="flex items-start gap-2"><Star
                            className="mt-0.5 h-4 w-4 shrink-0 fill-amber-400 text-amber-400"/> {t('A gold "Top ad" badge and a highlighted card')}
                        </li>
                        <li className="flex items-start gap-2"><Rocket
                            className="mt-0.5 h-4 w-4 shrink-0 text-brand-600"/> {t('More views and more calls')}</li>
                    </ul>

                    {plans === null ?
                        <p className="py-4 text-center text-sm text-slate-500">{t('Loading')}...</p> : mode === 'off' || !plans.length ? (
                            <p className="rounded-xl bg-amber-50 p-3 text-sm text-amber-800">{t('Online payment is not set up yet. Please contact us to make your ad a Top ad.')}</p>
                        ) : (
                            <>
                                <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label={t('How long?')}>
                                    {plans.map((p) => (
                                        <button key={p.days} type="button" role="radio" aria-checked={days === p.days}
                                                onClick={() => setDays(p.days)}
                                                className={`relative rounded-xl border-2 p-3 text-center transition ${days === p.days ? 'border-brand-500 bg-brand-50' : 'border-brand-100 bg-white hover:border-brand-300'}`}>
                                            {best?.days === p.days && plans.length > 1 && <span
                                                className="absolute -top-2 left-1/2 -translate-x-1/2 rounded-full bg-amber-400 px-2 py-0.5 text-[10px] font-extrabold uppercase text-navy-900">{t('Best value')}</span>}
                                            <span className="block text-lg font-extrabold text-navy-800">{p.days}</span>
                                            <span className="block text-xs text-slate-500">{t('days')}</span>
                                            <span
                                                className="mt-1 block text-sm font-bold text-brand-600">{rs(p.price)}</span>
                                        </button>
                                    ))}
                                </div>
                                {mode === 'demo' &&
                                    <p className="flex items-start gap-2 rounded-xl bg-brand-50 p-3 text-xs text-slate-600">
                                        <CheckCircle2
                                            className="mt-0.5 h-4 w-4 shrink-0 text-brand-600"/> {t('Test mode: PayHere is not connected yet, so no money is charged.')}
                                    </p>}
                                <button type="button" className="btn-primary w-full !py-3" disabled={busy}
                                        onClick={pay}>{busy ? t('Please wait...') : mode === 'payhere' ? t('Pay {amount} with PayHere', {amount: rs(plans.find((p) => p.days === days)?.price ?? 0)}) : t('Make it a Top ad (test)')}</button>
                            </>
                        )}
                </div>
            )}
        </Modal>
    );
}
