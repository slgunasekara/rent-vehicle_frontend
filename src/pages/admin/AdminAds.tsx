import {useCallback, useEffect, useState} from 'react';
import {Link} from 'react-router-dom';
import toast from 'react-hot-toast';
import {Flag, Search, Star, Trash2} from 'lucide-react';
import {Modal} from '../../components/common/ui';
import {ConfirmModal, Empty, PageHeader, Spinner} from '../../components/common/ui';
import {api, errMsg} from '../../service/api';
import {CATEGORIES} from '../../data/vehicleOptions';
import {categoryLabel, fmtDate, photo, vehicleTitle} from '../../utils/format';
import type {VehicleCardT} from '../../types';

type Row = VehicleCardT & {
    suspended?: boolean;
    openReports?: number;
    owner?: { name: string; email: string; phone?: string }
};

export default function AdminAds() {
    const [list, setList] = useState<Row[] | null>(null);
    const [q, setQ] = useState('');
    const [category, setCategory] = useState('');
    const [state, setState] = useState('all');
    const [del, setDel] = useState<Row | null>(null);
    const [feat, setFeat] = useState<Row | null>(null);
    const [busy, setBusy] = useState(false);

    const load = useCallback(() => {
        api.get('/admin/vehicles', {
            params: {
                q: q.trim() || undefined,
                category: category || undefined,
                state
            }
        }).then((r) => setList(r.data.data)).catch((e) => {
            toast.error(errMsg(e));
            setList([]);
        });
    }, [q, category, state]);
    useEffect(() => {
        const t = setTimeout(load, q ? 350 : 0);
        return () => clearTimeout(t);
    }, [load, q]);

    const remove = async () => {
        if (!del) return;
        setBusy(true);
        try {
            const r = await api.delete(`/admin/vehicles/${del._id}`);
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
        <div>
            <PageHeader title="All Ads" subtitle="Every ad on the site, including hidden ones."/>
            <div className="card mb-4 grid gap-3 sm:grid-cols-[1fr_11rem_11rem]">
                <div className="relative"><Search
                    className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"/><input
                    className="input !pl-9" placeholder="Search make, model, city, owner, phone..." value={q}
                    onChange={(e) => setQ(e.target.value)}/></div>
                <select className="input" value={category} onChange={(e) => setCategory(e.target.value)}>
                    <option value="">All types</option>
                    {CATEGORIES.map((c) => <option key={c.key} value={c.key}>{c.label}</option>)}</select>
                <select className="input" value={state} onChange={(e) => setState(e.target.value)}>
                    <option value="all">Live + hidden</option>
                    <option value="live">Live only</option>
                    <option value="hidden">Hidden only</option>
                    <option value="reported">Reported only</option>
                </select>
            </div>
            {list === null ? <Spinner/> : list.length === 0 ?
                <div className="card"><Empty title="No ads found"/></div> : (
                    <div className="card !p-0">
                        <div className="table-scroll">
                            <table className="w-full min-w-[720px]">
                                <thead>
                                <tr className="border-b border-brand-100">
                                    <th className="th">Vehicle</th>
                                    <th className="th">City</th>
                                    <th className="th">Owner</th>
                                    <th className="th">Insurance</th>
                                    <th className="th">State</th>
                                    <th className="th"/>
                                </tr>
                                </thead>
                                <tbody className="divide-y divide-brand-100">
                                {list.map((v) => {
                                    const hidden = v.expired || v.insuranceExpired;
                                    return (
                                        <tr key={v._id} className={v.openReports ? 'bg-red-50/60' : ''}>
                                            <td className="td">
                                                <div className="flex items-center gap-3">
                                                    <div
                                                        className="h-12 w-16 shrink-0 overflow-hidden rounded-lg bg-navy-800">{v.cover &&
                                                        <img src={photo(v.cover)} alt=""
                                                             className="h-full w-full object-cover"/>}</div>
                                                    <div className="min-w-0"><Link to={`/vehicle/${v._id}`}
                                                                                   className="font-bold text-navy-800 hover:text-brand-600">{vehicleTitle(v)}</Link>
                                                        <p className="text-xs text-slate-500">{categoryLabel(v.category)}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="td">{v.city}<p
                                                className="text-xs text-slate-500">{v.district}</p></td>
                                            <td className="td">{v.owner?.name}<p
                                                className="text-xs text-slate-500">{v.contactNumber}</p></td>
                                            <td className="td">{fmtDate(v.insuranceExpiry)}</td>
                                            <td className="td">{hidden ? <span
                                                    className="badge bg-red-100 text-red-700">{v.expired ? 'Expired' : 'Insurance'}</span> :
                                                <span
                                                    className="badge bg-emerald-100 text-emerald-700">Live · {v.daysLeft}d</span>}{v.featured &&
                                                <span className="badge ml-1.5 bg-amber-400 text-navy-900"><Star
                                                    className="h-3 w-3"/> Top</span>}{v.suspended && <span
                                                className="badge ml-1.5 bg-slate-700 text-white">Owner banned</span>}{!!v.openReports &&
                                                <Link to="/admin/reports"
                                                      className="badge ml-1.5 bg-red-500 text-white hover:bg-red-600"
                                                      title="Open the reports"><Flag className="h-3 w-3"/> Reported
                                                    ({v.openReports})</Link>}</td>
                                            <td className="td text-right">
                                                <div className="flex justify-end gap-2">
                                                    <button className="btn-ghost !px-3 !py-1.5"
                                                            onClick={() => setFeat(v)} aria-label="Top ad"
                                                            title="Give or remove a Top ad"><Star
                                                        className={`h-4 w-4 ${v.featured ? 'fill-amber-400 text-amber-500' : ''}`}/>
                                                    </button>
                                                    <button className="btn-danger !px-3 !py-1.5"
                                                            onClick={() => setDel(v)} aria-label="Delete ad"><Trash2
                                                        className="h-4 w-4"/></button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            <Modal open={!!feat} onClose={() => setFeat(null)} title="Top ad">
                {feat && (
                    <div className="space-y-3">
                        <p className="text-sm text-slate-600"><b
                            className="text-navy-800">{vehicleTitle(feat)}</b>{feat.featured ? ' is a Top ad now.' : ' is a normal ad.'} Give
                            a free Top ad (the owner gets an e-mail):</p>
                        <div className="grid grid-cols-3 gap-2">{[3, 7, 30].map((d) => <button key={d}
                                                                                               className="btn bg-amber-400 !py-2.5 text-navy-900 hover:bg-amber-300"
                                                                                               onClick={async () => {
                                                                                                   try {
                                                                                                       const r = await api.put(`/admin/vehicles/${feat._id}/featured`, {days: d});
                                                                                                       toast.success(r.data.message);
                                                                                                       setFeat(null);
                                                                                                       load();
                                                                                                   } catch (e) {
                                                                                                       toast.error(errMsg(e));
                                                                                                   }
                                                                                               }}>{d} days</button>)}</div>
                        {feat.featured &&
                            <button className="btn w-full border border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
                                    onClick={async () => {
                                        try {
                                            const r = await api.put(`/admin/vehicles/${feat._id}/featured`, {days: 0});
                                            toast.success(r.data.message);
                                            setFeat(null);
                                            load();
                                        } catch (e) {
                                            toast.error(errMsg(e));
                                        }
                                    }}>Remove the Top ad</button>}
                    </div>
                )}
            </Modal>
            <ConfirmModal open={!!del} title="Delete this ad?"
                          text={del ? `${vehicleTitle(del)} (${del.city}) will be removed with its photos.` : ''}
                          busy={busy} onConfirm={remove} onClose={() => setDel(null)}/>
        </div>
    );
}
