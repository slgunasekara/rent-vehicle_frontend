import { FormEvent, useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { Modal, Field } from '../common/ui';
import { REPORT_REASONS } from '../../data/vehicleOptions';
import { reportAd } from '../../service/engage';
import { errMsg } from '../../service/api';
import { useT } from '../../i18n';

/** "Report this ad": the reason + a short message go to the company team (shown in the Company console, and e-mailed) */
export default function ReportModal({ open, adId, adTitle, onClose, onDone }: { open: boolean; adId: string; adTitle: string; onClose: () => void; onDone: () => void }) {
  const t = useT();
  const [reason, setReason] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState('');
  const [err, setErr] = useState('');

  const close = () => { onClose(); setTimeout(() => { setSent(''); setErr(''); setReason(''); setMessage(''); }, 200); };
  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!reason) { setErr(t('Choose why you are reporting this ad')); return; }
    if (message.trim().length < 10) { setErr(t('Please tell us a little more (at least 10 characters)')); return; }
    setBusy(true); setErr('');
    try { const m = await reportAd(adId, reason, message.trim()); setSent(m); onDone(); toast.success(t('Report sent')); }
    catch (er) { setErr(errMsg(er)); }
    finally { setBusy(false); }
  };

  return (
    <Modal open={open} onClose={close} title={t('Report this ad')}>
      {sent ? (
        <div className="space-y-4 text-center">
          <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-500" />
          <p className="text-sm text-slate-700">{t(sent)}</p>
          <button className="btn-primary" onClick={close}>{t('Close')}</button>
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-4">
          <p className="text-sm text-slate-600">{adTitle}</p>
          <Field label={t('Why are you reporting it?')} required>
            <div className="space-y-1.5">
              {REPORT_REASONS.map((r) => (
                <label key={r.key} className={`flex cursor-pointer items-center gap-2.5 rounded-xl border px-3 py-2.5 text-sm transition ${reason === r.key ? 'border-brand-500 bg-brand-50 font-semibold text-navy-800' : 'border-brand-100 hover:bg-brand-50/60'}`}>
                  <input type="radio" name="reason" className="accent-brand-500" checked={reason === r.key} onChange={() => setReason(r.key)} /> {t(r.label)}
                </label>
              ))}
            </div>
          </Field>
          <Field label={t('Tell us what is wrong')} required hint={`${message.trim().length}/1000`}>
            <textarea className="input min-h-[96px]" maxLength={1000} value={message} onChange={(e) => setMessage(e.target.value)} placeholder={t('Write a few words so our team can check it quickly')} />
          </Field>
          {err && <p className="rounded-xl bg-red-50 px-3 py-2 text-sm font-semibold text-red-700" role="alert">{err}</p>}
          <div className="flex justify-end gap-2">
            <button type="button" className="btn border border-brand-200 text-navy-800 hover:bg-brand-50" onClick={close}>{t('Cancel')}</button>
            <button type="submit" disabled={busy} className="btn bg-red-500 text-white hover:bg-red-600 disabled:opacity-60">{busy ? t('Sending...') : t('Send report')}</button>
          </div>
        </form>
      )}
    </Modal>
  );
}
