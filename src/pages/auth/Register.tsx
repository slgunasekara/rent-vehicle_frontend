import { FormEvent, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import GoogleSignIn, { GOOGLE_ID } from '../../components/auth/GoogleSignIn';
import { Field } from '../../components/common/ui';
import { useAppDispatch, useAppSelector } from '../../store';
import { googleAuth, registerUser } from '../../store/authSlice';
import { homeFor } from '../../router/Guards';
import { Shell, Or } from './Shell';
import { useT } from '../../i18n';

export function Register() {
  const t = useT();
  const d = useAppDispatch();
  const nav = useNavigate();
  const { user, loading, error } = useAppSelector((s) => s.auth);
  const [f, setF] = useState({ name: '', email: '', phone: '', password: '' });
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement>) => setF({ ...f, [k]: e.target.value });

  useEffect(() => { if (user) nav(homeFor(user.role), { replace: true }); }, [user, nav]);
  useEffect(() => { if (error) toast.error(error); }, [error]);

  const submit = (e: FormEvent) => { e.preventDefault(); d(registerUser({ ...f, name: f.name.trim(), email: f.email.trim(), phone: f.phone.trim() })); };

  return (
    <Shell title={t('Create your account')} subtitle={t('One free account to find vehicles and post your own ads.')}>
      {GOOGLE_ID && <><GoogleSignIn onCredential={(c) => d(googleAuth(c))} text="signup_with" /><Or /></>}
      <form onSubmit={submit} className="space-y-4">
        <Field label={t('Full name')}><input required className="input" value={f.name} onChange={set('name')} autoComplete="name" /></Field>
        <Field label={t('Email')}><input type="email" required className="input" value={f.email} onChange={set('email')} autoComplete="email" /></Field>
        <Field label={t('Phone number')} hint={t('People who want your vehicle will call this number.')}><input required type="tel" minLength={7} className="input" value={f.phone} onChange={set('phone')} placeholder="07X XXX XXXX" autoComplete="tel" /></Field>
        <Field label={t('Password')} hint={t('At least 8 characters.')}><input type="password" required minLength={8} className="input" value={f.password} onChange={set('password')} autoComplete="new-password" /></Field>
        <button className="btn-primary w-full" disabled={loading}>{loading ? t('Creating account...') : t('Create account')}</button>
      </form>
      <p className="mt-5 text-center text-sm text-slate-600">{t('Already registered?')} <Link to="/login" className="font-semibold text-brand-600 hover:underline">{t('Sign in')}</Link></p>
    </Shell>
  );
}
