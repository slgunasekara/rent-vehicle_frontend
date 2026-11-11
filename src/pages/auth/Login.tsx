import { FormEvent, useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import GoogleSignIn, { GOOGLE_ID } from '../../components/auth/GoogleSignIn';
import { Field } from '../../components/common/ui';
import { useAppDispatch, useAppSelector } from '../../store';
import { googleAuth, login } from '../../store/authSlice';
import { homeFor } from '../../router/Guards';
import { Shell, Or } from './Shell';
import { useT } from '../../i18n';

/** ONE sign-in for everybody: email + password (or Google). Nobody has to say who they are. */
export function Login() {
  const t = useT();
  const d = useAppDispatch();
  const nav = useNavigate();
  const loc = useLocation();
  const { user, loading, error } = useAppSelector((s) => s.auth);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const from = (loc.state as { from?: string } | null)?.from;

  useEffect(() => { if (user) nav(from && user.role === 'user' ? from : homeFor(user.role), { replace: true }); }, [user, nav, from]);
  useEffect(() => { if (error) toast.error(error); }, [error]);

  const submit = (e: FormEvent) => { e.preventDefault(); d(login({ email: email.trim(), password })); };

  return (
    <Shell title={t('Welcome back')} subtitle={t('Sign in to post ads and manage them.')}>
      {GOOGLE_ID && <><GoogleSignIn onCredential={(c) => d(googleAuth(c))} text="signin_with" /><Or /></>}
      <form onSubmit={submit} className="space-y-4">
        <Field label={t('Email')}><input type="email" required className="input" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" /></Field>
        <Field label={t('Password')}><input type="password" required className="input" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" /></Field>
        <div className="-mt-1 text-right"><Link to="/forgot-password" state={{ email }} className="text-sm font-semibold text-brand-600 hover:underline">{t('Forgot password?')}</Link></div>
        <button className="btn-primary w-full" disabled={loading}>{loading ? t('Signing in...') : t('Sign in')}</button>
      </form>
      <p className="mt-5 text-center text-sm text-slate-600">{t('New here?')} <Link to="/register" className="font-semibold text-brand-600 hover:underline">{t('Create an account')}</Link></p>
    </Shell>
  );
}
