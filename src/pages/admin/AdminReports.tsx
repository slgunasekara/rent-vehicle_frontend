import {useCallback, useEffect, useState} from 'react';
import {Link} from 'react-router-dom';
import toast from 'react-hot-toast';
import {CheckCircle2, ExternalLink, Flag, RotateCcw, Trash2, XCircle} from 'lucide-react';
import {ConfirmModal, Empty, PageHeader, Spinner} from '../../components/common/ui';
import {api, errMsg} from '../../service/api';
import {photo, timeAgo} from '../../utils/format';

interface ReportRow {
    id: string;
    status: 'open' | 'resolved' | 'dismissed';
    reason: string;
    reasonLabel: string;
    message: string;
    adminNote?: string;
    createdAt: string;
    resolvedAt?: string;
    adTitle: string;
    adCity: string;
    reporterName: string;
    reporterEmail: string;
    ad: {
        id: string;
        title: string;
        category: string;
        city: string;
        district: string;
        contactNumber: string;
        cover?: string
    } | null;
}

type Tab = 'open' | 'resolved' | 'dismissed' | 'all';
const TONE: Record<string, string> = {
    scam: 'bg-red-100 text-red-700',
    wrong_info: 'bg-amber-100 text-amber-700',
    unavailable: 'bg-slate-100 text-slate-700',
    inappropriate: 'bg-red-100 text-red-700',
    duplicate: 'bg-slate-100 text-slate-700',
    other: 'bg-brand-50 text-brand-700'
};

export default function AdminReports() {
    const [tab, setTab] = useState<Tab>('open');
    const [items, setItems] = useState<ReportRow[] | null>(null);
    const [counts, setCounts] = useState({open: 0, resolved: 0, dismissed: 0});
    const [note, setNote] = useState<Record<string, string>>({});
    const [delAd, setDelAd] = useState<ReportRow | null>(null);
    const [busy, setBusy] = useState(false);

    const load = useCallback(() => {
        api.get('/admin/reports', {params: {status: tab}})
            .then((r) => {
                setItems(r.data.data.items);
                setCounts(r.data.data.counts);
            })
            .catch((e) => {
                toast.error(errMsg(e));
                setItems([]);
            });
    }, [tab]);
    useEffect(() => {
        setItems(null);
        load();
    }, [load]);

    const changed = () => {
        load();
        window.dispatchEvent(new Event('fv:reports-changed'));
    };
    const setStatus = async (r: ReportRow, status: ReportRow['status']) => {
        try {
            const res = await api.patch(`/admin/reports/${r.id}`, {status, adminNote: note[r.id]?.trim() || undefined});
            toast.success(res.data.message);
            changed();
        } catch (e) {
            toast.error(errMsg(e));
        }
    };
    const removeReport = async (r: ReportRow) => {
        try {
            await api.delete(`/admin/reports/${r.id}`);
            toast.success('Report deleted');
            changed();
        } catch (e) {
            toast.error(errMsg(e));
        }
    };
    const removeAd = async () => {
        if (!delAd?.ad) return;
        setBusy(true);
        try {
            await api.delete(`/admin/vehicles/${delAd.ad.id}`);
            toast.success('Ad deleted. Its reports were closed.');
            setDelAd(null);
            changed();
        } catch (e) {
            toast.error(errMsg(e));
        } finally {
            setBusy(false);
        }
    };

    const tabs: { key: Tab; label: string; n?: number }[] = [
        {key: 'open', label: 'Open', n: counts.open}, {
            key: 'resolved',
            label: 'Resolved',
            n: counts.resolved
        }, {key: 'dismissed', label: 'Dismissed', n: counts.dismissed}, {key: 'all', label: 'All'},
    ];

    return (
        <div>
            <PageHeader title="Reported Ads"
                        subtitle="Reports sent by members about ads. Open the ad, check it, then resolve the report or remove the ad."/>
            <div className="mb-4 flex flex-wrap gap-2">
                {tabs.map((t) => (
                    <button key={t.key} onClick={() => setTab(t.key)}
                            className={`btn !py-2 ${tab === t.key ? 'bg-navy-800 text-white' : 'border border-brand-200 bg-white text-navy-800 hover:bg-brand-50'}`}>
                        {t.label}{t.n !== undefined && <span
                        className={`ml-1.5 rounded-full px-2 py-0.5 text-[11px] font-bold leading-none ${t.key === 'open' && t.n > 0 ? 'bg-red-500 text-white' : 'bg-brand-100 text-navy-800'}`}>{t.n}</span>}
                    </button>
                ))}
            </div>

            {items === null ? <Spinner/> : items.length === 0 ? <div className="card"><Empty
                title={tab === 'open' ? 'No open reports. All clear.' : 'No reports here'}/></div> : (
                <div className="space-y-3">
                    {items.map((r) => (
                        <article key={r.id}
                                 className={`card !p-4 ${r.status === 'open' ? 'border-l-4 border-l-red-400' : ''}`}>
                            <div className="flex flex-col gap-4 sm:flex-row">
                                <div className="flex shrink-0 gap-3 sm:w-64 sm:flex-col">
                                    <div
                                        className="h-20 w-28 shrink-0 overflow-hidden rounded-xl bg-navy-800 sm:h-28 sm:w-full">{r.ad?.cover &&
                                        <img src={photo(r.ad.cover)} alt=""
                                             className="h-full w-full object-cover"/>}</div>
                                    <div className="min-w-0">
                                        {r.ad ? <Link to={`/vehicle/${r.ad.id}`} target="_blank"
                                                      className="inline-flex items-center gap-1 font-bold text-navy-800 hover:text-brand-600">{r.ad.title}
                                                <ExternalLink className="h-3.5 w-3.5"/></Link> :
                                            <p className="font-bold text-navy-800">{r.adTitle}</p>}
                                        <p className="text-xs text-slate-500">{r.ad ? `${r.ad.city}, ${r.ad.district} · ${r.ad.contactNumber}` : `${r.adCity} · ad removed`}</p>
                                    </div>
                                </div>
                                <div className="min-w-0 flex-1 space-y-2">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className={`badge ${TONE[r.reason] ?? TONE.other}`}><Flag
                                            className="h-3 w-3"/> {r.reasonLabel}</span>
                                        <span
                                            className={`badge ${r.status === 'open' ? 'bg-red-500 text-white' : r.status === 'resolved' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>{r.status}</span>
                                        <span className="text-xs text-slate-500">{timeAgo(r.createdAt)}</span>
                                    </div>
                                    <p className="whitespace-pre-wrap rounded-xl bg-brand-50/60 p-3 text-sm text-slate-700">{r.message}</p>
                                    <p className="text-xs text-slate-500">Reported by <b
                                        className="text-navy-800">{r.reporterName || 'a member'}</b>{r.reporterEmail && <> · <a
                                        href={`mailto:${r.reporterEmail}`}
                                        className="text-brand-600 hover:underline">{r.reporterEmail}</a></>}</p>
                                    {r.adminNote && r.status !== 'open' &&
                                        <p className="text-xs text-slate-600">Note: {r.adminNote}</p>}

                                    <div className="flex flex-wrap items-center gap-2 pt-1">
                                        {r.status === 'open' ? (
                                            <>
                                                <input className="input !w-full sm:!w-56 !py-2 text-sm" maxLength={500}
                                                       placeholder="Note (optional)" value={note[r.id] ?? ''}
                                                       onChange={(e) => setNote((n) => ({
                                                           ...n,
                                                           [r.id]: e.target.value
                                                       }))}/>
                                                <button
                                                    className="btn bg-emerald-500 !py-2 text-white hover:bg-emerald-600"
                                                    onClick={() => setStatus(r, 'resolved')}><CheckCircle2
                                                    className="h-4 w-4"/> Resolve
                                                </button>
                                                <button
                                                    className="btn border border-brand-200 bg-white !py-2 text-navy-800 hover:bg-brand-50"
                                                    onClick={() => setStatus(r, 'dismissed')}><XCircle
                                                    className="h-4 w-4"/> Dismiss
                                                </button>
                                                {r.ad &&
                                                    <button className="btn-danger !py-2" onClick={() => setDelAd(r)}>
                                                        <Trash2 className="h-4 w-4"/> Delete ad</button>}
                                            </>
                                        ) : (
                                            <>
                                                <button
                                                    className="btn border border-brand-200 bg-white !py-2 text-navy-800 hover:bg-brand-50"
                                                    onClick={() => setStatus(r, 'open')}><RotateCcw
                                                    className="h-4 w-4"/> Re-open
                                                </button>
                                                <button className="btn-danger !py-2" onClick={() => removeReport(r)}>
                                                    <Trash2 className="h-4 w-4"/> Delete report
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </article>
                    ))}
                </div>
            )}
            <ConfirmModal open={!!delAd} title="Delete the reported ad?"
                          text={delAd?.ad ? `${delAd.ad.title} (${delAd.ad.city}) will be removed with its photos, and every open report about it is closed.` : ''}
                          busy={busy} onConfirm={removeAd} onClose={() => setDelAd(null)}/>
        </div>
    );
}
