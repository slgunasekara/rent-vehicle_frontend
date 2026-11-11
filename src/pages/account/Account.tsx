import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import { ConfirmModal, Field } from '../../components/common/ui';
import { api, errMsg, tokens } from '../../service/api';
import { useAppDispatch, useAppSelector } from '../../store';
import { forceLogout, setUser } from '../../store/authSlice';
import { useT } from '../../i18n';

/** Account: name + phone, change password, and deleting the account (with all its ads) */
export default function Account() {
  const t = useT();
  const user = useAppSelector((s) => s.auth.user)!;
  const d = useAppDispatch();
  const nav = useNavigate();
  const [p, setP] = useState({ name: user.name, phone: user.phone ?? '' });
  const [pw, setPw] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [busy, setBusy] = useState('');
  const [askDelete, setAskDelete] = useState(false);
  const [delPw, setDelPw] = useState('');

  const saveProfile = async (e: FormEvent) => {
    e.preventDefault(); setBusy('profile');
    try { const r = await api.put('/auth/me', { name: p.name.trim(), phone: p.phone.trim() || undefined }); d(setUser(r.data.data)); toast.success(t('Saved')); } catch (err) { toast.error(errMsg(err)); } finally { setBusy(''); }
  };
  const savePw = async (e: FormEvent) => {
    e.preventDefault(); setBusy('pw');
    try {
      const r = await api.put('/auth/password', pw);
      tokens.set(r.data.data.accessToken, r.data.data.refreshToken);
      toast.success(r.data.message); setPw({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) { toast.error(errMsg(err)); } finally { setBusy(''); }
  };
  const removeAccount = async () => {
    setBusy('del');
    try { await api.delete('/auth/me', { data: { password: delPw || undefined } }); tokens.clear(); d(forceLogout()); toast.success(t('Your account was deleted')); nav('/'); } catch (err) { toast.error(errMsg(err)); } finally { setBusy(''); }
  };

  return (
    <div className="flex min-h-screen flex-col bg-surface">
      <Navbar />
      <main className="w-full flex-1 mx-auto max-w-2xl space-y-5 px-4 py-6 sm:py-8">
        <h1 className="text-2xl font-extrabold text-navy-800">{t('Account')}</h1>
        <form onSubmit={saveProfile} className="card space-y-4">
          <h2 className="font-extrabold text-navy-800">{t('Your details')}</h2>
          <Field label={t('Email')}><input className="input" value={user.email} disabled /></Field>
          <Field label={t('Full name')}><input required minLength={2} className="input" value={p.name} onChange={(e) => setP({ ...p, name: e.target.value })} /></Field>
          <Field label={t('Phone number')} hint={t('Used as the contact number when you post an ad.')}><input type="tel" className="input" value={p.phone} onChange={(e) => setP({ ...p, phone: e.target.value })} /></Field>
          <button className="btn-primary" disabled={busy === 'profile'}>{t('Save')}</button>
        </form>
        <form onSubmit={savePw} className="card space-y-4">
          <h2 className="font-extrabold text-navy-800">{t('Change password')}</h2>
          <Field label={t('Current password')}><input required type="password" className="input" value={pw.currentPassword} onChange={(e) => setPw({ ...pw, currentPassword: e.target.value })} autoComplete="current-password" /></Field>
          <Field label={t('New password')} hint={t('At least 8 characters.')}><input required minLength={8} type="password" className="input" value={pw.newPassword} onChange={(e) => setPw({ ...pw, newPassword: e.target.value })} autoComplete="new-password" /></Field>
          <Field label={t('New password again')}><input required minLength={8} type="password" className="input" value={pw.confirmPassword} onChange={(e) => setPw({ ...pw, confirmPassword: e.target.value })} autoComplete="new-password" /></Field>
          <button className="btn-primary" disabled={busy === 'pw'}>{t('Change password')}</button>
        </form>
        {user.role === 'user' && (
          <div className="card space-y-3 border-red-200">
            <h2 className="font-extrabold text-red-600">{t('Delete my account')}</h2>
            <p className="text-sm text-slate-600">{t('Your account and all your ads and photos are deleted for good.')}</p>
            <button className="btn-danger" onClick={() => setAskDelete(true)}>{t('Delete my account')}</button>
          </div>
        )}
      </main>
      <ConfirmModal open={askDelete} title={t('Delete your account?')} text={t('This cannot be undone. Type your password to confirm (leave empty if you signed up with Google).')} confirmLabel={t('Delete everything')} busy={busy === 'del'} onConfirm={removeAccount} onClose={() => setAskDelete(false)}>
        <input type="password" className="input mt-3" placeholder={t('Password')} value={delPw} onChange={(e) => setDelPw(e.target.value)} autoComplete="current-password" />
      </ConfirmModal>
      <Footer />
    </div>
  );
}
