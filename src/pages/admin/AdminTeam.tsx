import { FormEvent, useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Ban, CheckCircle2, Copy, Eye, EyeOff, KeyRound, Pencil, RefreshCw, ShieldCheck, Trash2, UserPlus } from 'lucide-react';
import { ConfirmModal, Empty, Field, Modal, PageHeader, Spinner } from '../../components/common/ui';
import { api, errMsg } from '../../service/api';
import { fmtDate } from '../../utils/format';
import { useAppSelector } from '../../store';

interface Admin { id: string; name: string; position: string; email: string; phone: string; isActive: boolean; isDefault: boolean; createdAt: string; addedBy: string }
const POSITIONS = ['Manager', 'Support Officer', 'Moderator', 'Accountant', 'Marketing Officer'];

/** a strong password the admin can be given (no look-alike characters like 0/O or 1/l) */
function generatePassword(): string {
  const sets = ['ABCDEFGHJKLMNPQRSTUVWXYZ', 'abcdefghijkmnpqrstuvwxyz', '23456789', '!@#$%&*?'];
  const all = sets.join('');
  const pick = (s: string): string => s[crypto.getRandomValues(new Uint32Array(1))[0] % s.length];
  const chars = [...sets.map(pick), ...Array.from({ length: 8 }, () => pick(all))];
  for (let i = chars.length - 1; i > 0; i--) { const j = crypto.getRandomValues(new Uint32Array(1))[0] % (i + 1); [chars[i], chars[j]] = [chars[j], chars[i]]; }
  return chars.join('');
}

/** a password box with show / hide, "generate" and "copy" */
function PasswordField({ value, onChange, label = 'Password' }: { value: string; onChange: (v: string) => void; label?: string }) {
  const [show, setShow] = useState(false);
  return (
    <Field label={label} required hint="At least 8 characters. Give this password to the person - it is never sent by e-mail.">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <input className="input !pr-11" type={show ? 'text' : 'password'} autoComplete="new-password" minLength={8} maxLength={100} value={value} onChange={(e) => onChange(e.target.value)} />
          <button type="button" onClick={() => setShow((s) => !s)} className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-slate-400 hover:bg-brand-50" aria-label={show ? 'Hide password' : 'Show password'}>{show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
        </div>
        <button type="button" className="btn border border-brand-200 bg-white !px-3 text-navy-800 hover:bg-brand-50" title="Make a strong password" onClick={() => { onChange(generatePassword()); setShow(true); }}><RefreshCw className="h-4 w-4" /> <span className="hidden sm:inline">Generate</span></button>
        <button type="button" className="btn border border-brand-200 bg-white !px-3 text-navy-800 hover:bg-brand-50 disabled:opacity-40" disabled={!value} title="Copy the password" onClick={() => { void navigator.clipboard.writeText(value).then(() => toast.success('Password copied')); }}><Copy className="h-4 w-4" /></button>
      </div>
    </Field>
  );
}

/** the company's admin team: add admins (they sign in on the normal login page), edit, reset a password, suspend, delete */
export default function AdminTeam() {
  const me = useAppSelector((s) => s.auth.user);
  const meDefault = !!me?.isDefaultAdmin;
  const [list, setList] = useState<Admin[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [add, setAdd] = useState(false);
  const [form, setForm] = useState({ name: '', position: '', email: '', phone: '', password: '' });
  const [edit, setEdit] = useState<Admin | null>(null);
  const [editForm, setEditForm] = useState({ name: '', position: '' });
  const [reset, setReset] = useState<Admin | null>(null);
  const [newPw, setNewPw] = useState('');
  const [del, setDel] = useState<Admin | null>(null);
  const [suspend, setSuspend] = useState<Admin | null>(null);

  const load = useCallback(() => { api.get('/admin/admins').then((r) => setList(r.data.data)).catch((e) => { toast.error(errMsg(e)); setList([]); }); }, []);
  useEffect(load, [load]);
  const run = async (fn: () => Promise<{ data: { message?: string } }>, done: () => void) => {
    setBusy(true);
    try { const r = await fn(); toast.success(r.data.message ?? 'Done'); done(); load(); } catch (e) { toast.error(errMsg(e)); } finally { setBusy(false); }
  };

  const submitAdd = (e: FormEvent) => { e.preventDefault(); void run(() => api.post('/admin/admins', { ...form, phone: form.phone || undefined }), () => { setAdd(false); setForm({ name: '', position: '', email: '', phone: '', password: '' }); }); };
  const act = 'btn-ghost !px-2.5 !py-2 disabled:opacity-40';

  return (
    <div>
      <PageHeader title="Admin Team" subtitle="People who can use the Company console. An admin you add signs in on the normal login page with the e-mail and password you set here." action={<button className="btn-primary" onClick={() => setAdd(true)}><UserPlus className="h-4 w-4" /> Add admin</button>} />
      {!meDefault && <p className="mb-4 rounded-xl bg-brand-50 p-3 text-sm text-slate-600">You can add admins and edit your own name and position. Only the default admin can delete, suspend or reset the password of other admins.</p>}

      {list === null ? <Spinner /> : list.length === 0 ? <div className="card"><Empty title="No admins" /></div> : (
        <ul className="space-y-3">
          {list.map((a) => {
            const self = a.id === me?.id;
            return (
              <li key={a.id} className="card !p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-gradient-to-br from-brand-500 to-navy-700 text-lg font-extrabold text-white">{a.name[0]?.toUpperCase()}</div>
                    <div className="min-w-0">
                      <p className="flex flex-wrap items-center gap-1.5 font-extrabold text-navy-800"><span className="truncate">{a.name}</span>
                        {a.isDefault && <span className="badge bg-amber-100 text-amber-800"><ShieldCheck className="h-3 w-3" /> Default admin</span>}
                        {self && <span className="badge bg-brand-100 text-brand-700">You</span>}
                        {!a.isActive && <span className="badge bg-red-100 text-red-700">Suspended</span>}
                      </p>
                      <p className="text-sm font-semibold text-brand-700">{a.position || 'Admin'}</p>
                      <p className="truncate text-xs text-slate-500">{a.email}{a.phone ? ` · ${a.phone}` : ''}</p>
                      <p className="text-[11px] text-slate-400">{a.isDefault ? 'Created when the site was set up' : `Added by ${a.addedBy || 'the company'} · ${fmtDate(a.createdAt)}`}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {(meDefault || self) && <button className={act} title="Edit name and position" aria-label="Edit" onClick={() => { setEdit(a); setEditForm({ name: a.name, position: a.position }); }}><Pencil className="h-4 w-4" /></button>}
                    {meDefault && !a.isDefault && <button className={act} title="Reset the password" aria-label="Reset password" onClick={() => { setReset(a); setNewPw(''); }}><KeyRound className="h-4 w-4" /></button>}
                    {meDefault && !a.isDefault && (a.isActive
                      ? <button className={act} title="Suspend (cannot sign in)" aria-label="Suspend" onClick={() => setSuspend(a)}><Ban className="h-4 w-4" /></button>
                      : <button className={act} title="Activate again" aria-label="Activate" onClick={() => void run(() => api.patch(`/admin/admins/${a.id}`, { isActive: true }), () => undefined)}><CheckCircle2 className="h-4 w-4" /></button>)}
                    {meDefault && !a.isDefault && <button className="btn-danger !px-2.5 !py-2" title="Delete this admin" aria-label="Delete" onClick={() => setDel(a)}><Trash2 className="h-4 w-4" /></button>}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <Modal open={add} onClose={() => setAdd(false)} title="Add an admin">
        <form onSubmit={submitAdd} className="space-y-3">
          <Field label="Full name" required><input className="input" required minLength={2} maxLength={60} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
          <Field label="Company position" required>
            <input className="input" required minLength={2} maxLength={60} list="positions" placeholder="e.g. Manager" value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })} />
            <datalist id="positions">{POSITIONS.map((p) => <option key={p} value={p} />)}</datalist>
          </Field>
          <Field label="E-mail address" required hint="This is the login e-mail."><input className="input" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></Field>
          <Field label="Phone number" hint="Optional"><input className="input" type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></Field>
          <PasswordField value={form.password} onChange={(v) => setForm({ ...form, password: v })} />
          <div className="flex justify-end gap-2 pt-1"><button type="button" className="btn border border-brand-200 bg-white text-navy-800" onClick={() => setAdd(false)}>Cancel</button><button className="btn-primary" disabled={busy || form.password.length < 8}>Add admin</button></div>
        </form>
      </Modal>

      <Modal open={!!edit} onClose={() => setEdit(null)} title="Edit admin">
        {edit && (
          <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); void run(() => api.patch(`/admin/admins/${edit.id}`, editForm), () => setEdit(null)); }}>
            <Field label="Full name" required><input className="input" required minLength={2} maxLength={60} value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} /></Field>
            <Field label="Company position" required><input className="input" required minLength={2} maxLength={60} list="positions" value={editForm.position} onChange={(e) => setEditForm({ ...editForm, position: e.target.value })} /></Field>
            <div className="flex justify-end gap-2"><button type="button" className="btn border border-brand-200 bg-white text-navy-800" onClick={() => setEdit(null)}>Cancel</button><button className="btn-primary" disabled={busy}>Save</button></div>
          </form>
        )}
      </Modal>

      <Modal open={!!reset} onClose={() => setReset(null)} title="Reset the password">
        {reset && (
          <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); void run(() => api.patch(`/admin/admins/${reset.id}`, { password: newPw }), () => setReset(null)); }}>
            <p className="text-sm text-slate-600">New password for <b className="text-navy-800">{reset.name}</b>. Their current sessions end, and they sign in with the new one.</p>
            <PasswordField label="New password" value={newPw} onChange={setNewPw} />
            <div className="flex justify-end gap-2"><button type="button" className="btn border border-brand-200 bg-white text-navy-800" onClick={() => setReset(null)}>Cancel</button><button className="btn-primary" disabled={busy || newPw.length < 8}>Reset password</button></div>
          </form>
        )}
      </Modal>

      <ConfirmModal open={!!suspend} title="Suspend this admin?" text={suspend ? `${suspend.name} will not be able to sign in until you activate them again. Nothing is deleted.` : ''} confirmLabel="Suspend" busy={busy} onClose={() => setSuspend(null)}
        onConfirm={() => suspend && void run(() => api.patch(`/admin/admins/${suspend.id}`, { isActive: false }), () => setSuspend(null))} />
      <ConfirmModal open={!!del} title="Delete this admin?" text={del ? `${del.name} (${del.email}) is removed for good, with any ads, hearts and ratings of this account. This cannot be undone.` : ''} busy={busy} onClose={() => setDel(null)}
        onConfirm={() => del && void run(() => api.delete(`/admin/admins/${del.id}`), () => setDel(null))} />
    </div>
  );
}
