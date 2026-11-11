import { FormEvent, useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Shell } from './Shell';
import { Field } from '../../components/common/ui';
import { api, errMsg } from '../../service/api';

/** Forgot password: email -> 6-digit code by email -> new password (twice). */
export default function ForgotPassword() {
  const nav = useNavigate();
  const loc = useLocation();
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [email, setEmail] = useState((loc.state as { email?: string } | null)?.email ?? '');
  const [otp, setOtp] = useState('');
  const [pw, setPw] = useState('');
  const [pw2, setPw2] = useState('');
  const [busy, setBusy] = useState(false);
  const [wait, setWait] = useState(0);

  useEffect(() => {
    if (wait <= 0) return;
    const t = setTimeout(() => setWait((w) => w - 1), 1000);
    return () => clearTimeout(t);
  }, [wait]);

  const send = async (e?: FormEvent) => {
    e?.preventDefault();
    setBusy(true);
    try {
      const r = await api.post('/auth/forgot-password', { email: email.trim() });
      toast.success(r.data.message || 'Code sent');
      setWait(r.data.resendIn ?? 60);
      setStep('otp');
    } catch (err) { toast.error(errMsg(err)); } finally { setBusy(false); }
  };

  const reset = async (e: FormEvent) => {
    e.preventDefault();
    if (pw !== pw2) { toast.error('The two passwords do not match'); return; }
    setBusy(true);
    try {
      const r = await api.post('/auth/reset-password', { email: email.trim(), otp, newPassword: pw, confirmPassword: pw2 });
      toast.success(r.data.message || 'Password changed');
      nav('/login', { replace: true });
    } catch (err) { toast.error(errMsg(err)); } finally { setBusy(false); }
  };

  return (
    <Shell title="Forgot your password?" subtitle={step === 'email' ? 'Enter your account email and we will send you a 6-digit code.' : `We sent a 6-digit code to ${email}. It is valid for 10 minutes.`}>
      {step === 'email' ? (
        <form onSubmit={send} className="space-y-4">
          <Field label="Email"><input type="email" required autoFocus className="input" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" /></Field>
          <button className="btn-primary w-full" disabled={busy}>{busy ? 'Sending...' : 'Send code'}</button>
        </form>
      ) : (
        <form onSubmit={reset} className="space-y-4">
          <Field label="6-digit code"><input required autoFocus inputMode="numeric" pattern="\d{6}" maxLength={6} className="input text-center font-mono text-2xl tracking-[.5em]" value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))} autoComplete="one-time-code" placeholder="------" /></Field>
          <Field label="New password" hint="At least 8 characters"><input type="password" required minLength={8} className="input" value={pw} onChange={(e) => setPw(e.target.value)} autoComplete="new-password" /></Field>
          <Field label="New password again"><input type="password" required minLength={8} className="input" value={pw2} onChange={(e) => setPw2(e.target.value)} autoComplete="new-password" /></Field>
          {pw2 && pw !== pw2 && <p className="-mt-2 text-xs text-red-600">The two passwords do not match</p>}
          <button className="btn-primary w-full" disabled={busy || otp.length !== 6 || pw.length < 8 || pw !== pw2}>{busy ? 'Saving...' : 'Change password'}</button>
          <div className="flex items-center justify-between text-sm">
            <button type="button" className="font-semibold text-brand-600 hover:underline disabled:cursor-not-allowed disabled:text-slate-400 disabled:no-underline" disabled={wait > 0 || busy} onClick={() => send()}>{wait > 0 ? `Send again in ${wait}s` : 'Send a new code'}</button>
            <button type="button" className="text-slate-500 hover:underline" onClick={() => { setStep('email'); setOtp(''); }}>Change email</button>
          </div>
        </form>
      )}
      <p className="mt-5 text-center text-sm text-slate-600">Remembered it? <Link to="/login" className="font-semibold text-brand-600 hover:underline">Back to sign in</Link></p>
    </Shell>
  );
}
