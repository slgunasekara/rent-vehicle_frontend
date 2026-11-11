import {useCallback, useEffect, useState} from 'react';
import toast from 'react-hot-toast';
import {Ban, CheckCircle2, Search, Trash2} from 'lucide-react';
import {Modal} from '../../components/common/ui';
import {ConfirmModal, Empty, PageHeader, Spinner} from '../../components/common/ui';
import {api, errMsg} from '../../service/api';
import {fmtDate} from '../../utils/format';

interface Row {
    _id: string;
    name: string;
    email: string;
    phone?: string;
    role: 'user' | 'admin';
    isActive: boolean;
    banReason?: string;
    ads: number;
    createdAt: string
}

export function AdminUsers() {
    const [list, setList] = useState<Row[] | null>(null);
    const [q, setQ] = useState('');
    const [del, setDel] = useState<Row | null>(null);
    const [busy, setBusy] = useState(false);
    const [ban, setBan] = useState<Row | null>(null);
    const [reason, setReason] = useState('');

    const load = useCallback(() => {
        api.get('/admin/users', {params: {q: q.trim() || undefined}}).then((r) => setList(r.data.data)).catch((e) => {
            toast.error(errMsg(e));
            setList([]);
        });
    }, [q]);
    useEffect(() => {
        const t = setTimeout(load, q ? 350 : 0);
        return () => clearTimeout(t);
    }, [load, q]);

    const unban = async (u: Row) => {
        try {
            const r = await api.patch(`/admin/users/${u._id}/unban`);
            toast.success(r.data.message);
            load();
        } catch (e) {
            toast.error(errMsg(e));
        }
    };
    const doBan = async () => {
        if (!ban) return;
        setBusy(true);
        try {
            const r = await api.patch(`/admin/users/${ban._id}/ban`, {reason: reason.trim()});
            toast.success(r.data.message);
            setBan(null);
            setReason('');
            load();
        } catch (e) {
            toast.error(errMsg(e));
        } finally {
            setBusy(false);
        }
    };
    const remove = async () => {
        if (!del) return;
        setBusy(true);
        try {
            const r = await api.delete(`/admin/users/${del._id}`);
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
            <PageHeader title="Users"
                        subtitle="Everybody who registered. Ban an account (with a reason) to stop it signing in and hide its ads, or delete it with all its ads."/>
            <div className="card mb-4">
                <div className="relative"><Search
                    className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"/><input
                    className="input !pl-9" placeholder="Search name, email, phone..." value={q}
                    onChange={(e) => setQ(e.target.value)}/></div>
            </div>
            {list === null ? <Spinner/> : list.length === 0 ?
                <div className="card"><Empty title="No users found"/></div> : (
                    <div className="card !p-0">
                        <div className="table-scroll">
                            <table className="w-full min-w-[640px]">
                                <thead>
                                <tr className="border-b border-brand-100">
                                    <th className="th">Name</th>
                                    <th className="th">Phone</th>
                                    <th className="th">Ads</th>
                                    <th className="th">Joined</th>
                                    <th className="th">Status</th>
                                    <th className="th"/>
                                </tr>
                                </thead>
                                <tbody className="divide-y divide-brand-100">
                                {list.map((u) => (
                                    <tr key={u._id}>
                                        <td className="td"><p
                                            className="font-bold text-navy-800">{u.name} {u.role === 'admin' &&
                                            <span className="badge bg-violet-100 text-violet-700">Admin</span>}</p><p
                                            className="text-xs text-slate-500">{u.email}</p></td>
                                        <td className="td">{u.phone || '-'}</td>
                                        <td className="td">{u.ads}</td>
                                        <td className="td">{fmtDate(u.createdAt)}</td>
                                        <td className="td">{u.isActive ?
                                            <span className="badge bg-emerald-100 text-emerald-700">Active</span> : <>
                                                <span
                                                    className="badge bg-red-100 text-red-700">Banned</span>{u.banReason &&
                                                <p className="mt-1 max-w-[14rem] text-xs text-slate-500">{u.banReason}</p>}</>}</td>
                                        <td className="td">
                                            <div className="flex justify-end gap-2">{u.role !== 'admin' && <>
                                                {u.isActive
                                                    ? <button className="btn-ghost !px-3 !py-1.5" onClick={() => {
                                                        setBan(u);
                                                        setReason('');
                                                    }} aria-label="Ban user" title="Ban this user"><Ban
                                                        className="h-4 w-4"/></button>
                                                    :
                                                    <button className="btn-ghost !px-3 !py-1.5" onClick={() => unban(u)}
                                                            aria-label="Unban user"
                                                            title="Unban (let the user sign in again)"><CheckCircle2
                                                        className="h-4 w-4"/></button>}
                                                <button className="btn-danger !px-3 !py-1.5" onClick={() => setDel(u)}
                                                        aria-label="Delete user"><Trash2 className="h-4 w-4"/></button>
                                            </>}</div>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            <Modal open={!!ban} onClose={() => setBan(null)} title="Ban this user">
                {ban && (
                    <div className="space-y-3">
                        <p className="text-sm text-slate-600"><b className="text-navy-800">{ban.name}</b> will not be
                            able to sign in, and their {ban.ads} ad(s) are hidden. They get an e-mail with the reason
                            below.</p>
                        <div
                            className="flex flex-wrap gap-1.5">{['Posting fake or scam ads', 'Spam or bad language', 'Many reports from other users', 'Breaking the site rules'].map((r) =>
                            <button key={r} type="button" onClick={() => setReason(r)}
                                    className="rounded-full border border-brand-200 bg-white px-3 py-1 text-xs font-semibold text-navy-800 hover:bg-brand-50">{r}</button>)}</div>
                        <textarea className="input min-h-[84px]" maxLength={300}
                                  placeholder="Reason (the user will see it)" value={reason}
                                  onChange={(e) => setReason(e.target.value)}/>
                        <div className="flex justify-end gap-2">
                            <button className="btn border border-brand-200 bg-white text-navy-800"
                                    onClick={() => setBan(null)}>Cancel
                            </button>
                            <button className="btn bg-red-500 text-white hover:bg-red-600 disabled:opacity-50"
                                    disabled={busy || reason.trim().length < 3} onClick={doBan}>Ban user
                            </button>
                        </div>
                    </div>
                )}
            </Modal>
            <ConfirmModal open={!!del} title="Delete this user?"
                          text={del ? `${del.name} and ${del.ads} ad(s) with their photos will be deleted for good.` : ''}
                          busy={busy} onConfirm={remove} onClose={() => setDel(null)}/>
        </div>
    );
}
