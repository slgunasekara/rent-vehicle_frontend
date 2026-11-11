import {FormEvent, useCallback, useEffect, useState} from 'react';
import toast from 'react-hot-toast';
import {Eye, EyeOff, ShieldCheck, Trash2, UserPlus} from 'lucide-react';
import {ConfirmModal, Empty, Modal, PageHeader, Spinner} from '../../components/common/ui';
import {api, errMsg} from '../../service/api';
import {fmtDate} from '../../utils/format';

interface AdminRow {
    id: string;
    name: string;
    email: string;
    position: string;
    isDefault: boolean;
    createdAt?: string
}

const blank = {name: '', position: '', email: '', password: ''};

export default function AdminTeam() {
    const [rows, setRows] = useState<AdminRow[] | null>(null);
    const [canManage, setCanManage] = useState(false);
    const [open, setOpen] = useState(false);
    const [f, setF] = useState(blank);
    const [show, setShow] = useState(false);
    const [busy, setBusy] = useState(false);
    const [del, setDel] = useState<AdminRow | null>(null);

    const load = useCallback(() => {
        api.get('/admin/admins').then((r) => {
            setRows(r.data.data.items);
            setCanManage(r.data.data.canManage);
        }).catch((e) => {
            toast.error(errMsg(e));
            setRows([]);
        });
    }, []);
    useEffect(load, [load]);

    const set = (k: keyof typeof blank) => (e: { target: { value: string } }) => setF((p) => ({
        ...p,
        [k]: e.target.value
    }));
    const valid = f.name.trim().length >= 2 && f.position.trim().length >= 2 && /^\S+@\S+\.\S+$/.test(f.email.trim()) && f.password.length >= 8;

    const add = async (e: FormEvent) => {
        e.preventDefault();
        if (!valid) return;
        setBusy(true);
        try {
            const r = await api.post('/admin/admins', {
                ...f,
                name: f.name.trim(),
                position: f.position.trim(),
                email: f.email.trim()
            });
            toast.success(r.data.message);
            setOpen(false);
            setF(blank);
            load();
        } catch (er) {
            toast.error(errMsg(er));
        } finally {
            setBusy(false);
        }
    };
    const remove = async () => {
        if (!del) return;
        setBusy(true);
        try {
            const r = await api.delete(`/admin/admins/${del.id}`);
            toast.success(r.data.message);
            setDel(null);
            load();
        } catch (er) {
            toast.error(errMsg(er));
        } finally {
            setBusy(false);
        }
    };

    return (
        <div>
            <PageHeader
                title="Admins"
                subtitle="Company admins who can sign in to this console. Only the default admin can add or remove admins, and the default admin can never be removed."
                action={canManage ? <button className="btn-primary" onClick={() => {
                    setF(blank);
                    setShow(false);
                    setOpen(true);
                }}><UserPlus className="h-4 w-4"/> Add admin</button> : undefined}
            />
            {rows === null ? <Spinner/> : rows.length === 0 ?
                <div className="card"><Empty title="No admins found"/></div> : (
                    <div className="card !p-0">
                        <div className="table-scroll">
                            <table className="w-full min-w-[620px]">
                                <thead>
                                <tr className="border-b border-brand-100">
                                    <th className="th">Name</th>
                                    <th className="th">Company position</th>
                                    <th className="th">Email</th>
                                    <th className="th">Added</th>
                                    <th className="th"/>
                                </tr>
                                </thead>
                                <tbody className="divide-y divide-brand-100">
                                {rows.map((a) => (
                                    <tr key={a.id}>
                                        <td className="td"><p
                                            className="font-bold text-navy-800">{a.name} {a.isDefault &&
                                            <span className="badge bg-violet-100 text-violet-700"><ShieldCheck
                                                className="mr-1 inline h-3 w-3"/>Default admin</span>}</p></td>
                                        <td className="td">{a.position || '-'}</td>
                                        <td className="td">{a.email}</td>
                                        <td className="td">{a.createdAt ? fmtDate(a.createdAt) : '-'}</td>
                                        <td className="td">
                                            <div className="flex justify-end">{canManage && !a.isDefault &&
                                                <button className="btn-danger !px-3 !py-1.5" onClick={() => setDel(a)}
                                                        aria-label="Delete admin" title="Delete this admin"><Trash2
                                                    className="h-4 w-4"/></button>}</div>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            {!canManage && rows !== null &&
                <p className="mt-3 text-xs text-slate-500">You can view the admins. Ask the default admin to add or
                    remove one.</p>}

            <Modal open={open} onClose={() => setOpen(false)} title="Add admin">
                <form onSubmit={add} className="space-y-3">
                    <div><label className="label">Name</label><input className="input" value={f.name}
                                                                     onChange={set('name')} maxLength={60} autoFocus
                                                                     required/></div>
                    <div><label className="label">Company position</label><input className="input" value={f.position}
                                                                                 onChange={set('position')}
                                                                                 maxLength={60}
                                                                                 placeholder="e.g. Manager" required/>
                    </div>
                    <div><label className="label">Email address (used to sign in)</label><input className="input"
                                                                                                type="email"
                                                                                                value={f.email}
                                                                                                onChange={set('email')}
                                                                                                autoComplete="off"
                                                                                                required/></div>
                    <div><label className="label">Password (min 8 characters)</label>
                        <div className="relative"><input className="input !pr-10" type={show ? 'text' : 'password'}
                                                         value={f.password} onChange={set('password')}
                                                         autoComplete="new-password" minLength={8} required/>
                            <button type="button" onClick={() => setShow((s) => !s)}
                                    aria-label={show ? 'Hide password' : 'Show password'}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-500">{show ?
                                <EyeOff className="h-4 w-4"/> : <Eye className="h-4 w-4"/>}</button>
                        </div>
                    </div>
                    <p className="text-xs text-slate-500">The new admin signs in on the normal sign-in page with this
                        email and password and lands in the Company console.</p>
                    <div className="flex justify-end gap-2">
                        <button type="button" className="btn border border-brand-200 bg-white text-navy-800"
                                onClick={() => setOpen(false)}>Cancel
                        </button>
                        <button className="btn-primary disabled:opacity-50" disabled={busy || !valid}>Add admin</button>
                    </div>
                </form>
            </Modal>
            <ConfirmModal open={!!del} title="Delete this admin?"
                          text={del ? `${del.name} (${del.email}) will not be able to sign in any more.` : ''}
                          busy={busy} onConfirm={remove} onClose={() => setDel(null)}/>
        </div>
    );
}
