import { FormEvent, useState } from 'react';
import toast from 'react-hot-toast';
import { Phone, MessageCircle, Mail, MapPin, ExternalLink, Send, CheckCircle2 } from 'lucide-react';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import RobotCheck from '../../components/common/RobotCheck';
import { api, errMsg } from '../../service/api';
import { useT } from '../../i18n';
import { COMPANY, waLink } from '../../utils/format';

const blank = { firstName: '', lastName: '', email: '', phone: '', message: '', website: '' };

function ContactForm() {
  const t = useT();
  const [f, setF] = useState(blank);
  const [captcha, setCaptcha] = useState('');
  const [reset, setReset] = useState(0);
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const set = (k: keyof typeof blank) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setF({ ...f, [k]: e.target.value });

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!captcha) { toast.error(t('Please tick "I\'m not a robot" first')); return; }
    setBusy(true);
    try {
      await api.post('/contact', { ...f, captcha });
      setSent(true); setF(blank); setCaptcha(''); setReset((n) => n + 1);
    } catch (err) {
      toast.error(errMsg(err));
      setCaptcha(''); setReset((n) => n + 1); // the check is single-use: tick it again
    } finally { setBusy(false); }
  };

  if (sent) {
    return (
      <div className="card flex flex-col items-center gap-3 py-12 text-center">
        <span className="grid h-16 w-16 place-items-center rounded-full bg-emerald-100 text-emerald-600"><CheckCircle2 className="h-9 w-9" /></span>
        <h2 className="text-xl font-extrabold text-navy-800">{t('Message sent!')}</h2>
        <p className="max-w-xs text-sm text-slate-600">{t('Thank you for contacting us. We will reply to your email or phone soon.')}</p>
        <button className="btn-ghost mt-2" onClick={() => setSent(false)}>{t('Send another message')}</button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="card space-y-4">
      <div>
        <h2 className="text-xl font-extrabold text-navy-800">{t('Send us a message')}</h2>
        <p className="mt-1 text-sm text-slate-500">{t('Fill in the form and we will get back to you.')}</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
        <label className="block min-w-0"><span className="label">{t('First name')}</span><input required maxLength={50} autoComplete="given-name" className="input" value={f.firstName} onChange={set('firstName')} /></label>
        <label className="block"><span className="label">{t('Last name')}</span><input required maxLength={50} autoComplete="family-name" className="input" value={f.lastName} onChange={set('lastName')} /></label>
        <label className="block"><span className="label">{t('Email')}</span><input required type="email" maxLength={120} autoComplete="email" className="input" value={f.email} onChange={set('email')} placeholder="name@example.com" /></label>
        <label className="block"><span className="label">{t('Phone number')}</span><input required type="tel" minLength={7} maxLength={25} autoComplete="tel" className="input" value={f.phone} onChange={set('phone')} placeholder="07X XXX XXXX" /></label>
      </div>
      <label className="block"><span className="label">{t('Leave a message')}</span><textarea required minLength={5} maxLength={2000} rows={5} className="input" value={f.message} onChange={set('message')} placeholder={t('How can we help you?')} /></label>
      {/* trap for bots: people never see or fill this */}
      <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden"><label>Website<input tabIndex={-1} autoComplete="off" value={f.website} onChange={set('website')} /></label></div>
      <RobotCheck onChange={setCaptcha} resetKey={reset} />
      <button className="btn-primary w-full" disabled={busy || !captcha}><Send className="h-4 w-4" /> {busy ? t('Sending...') : t('Send us a message')}</button>
    </form>
  );
}

export default function Contact() {
  const t = useT();
  const embed = `https://maps.google.com/maps?q=${COMPANY.lat},${COMPANY.lng}&z=16&output=embed`;
  const external = `https://www.google.com/maps/search/?api=1&query=${COMPANY.lat},${COMPANY.lng}`;

  const items = [
    { icon: Phone, title: t('Call us / WhatsApp'), value: COMPANY.phone, href: `tel:${COMPANY.phone}`, note: t('Call or message us any time'), extra: (
      <a className="btn-ghost mt-3 !py-1.5" href={waLink(COMPANY.phone)} target="_blank" rel="noreferrer"><MessageCircle className="h-4 w-4" /> WhatsApp</a>
    ) },
    { icon: Mail, title: t('Email'), value: COMPANY.email, href: `mailto:${COMPANY.email}`, note: t('We reply as soon as we can'), extra: null },
  ];

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="w-full flex-1">
      <div className="bg-gradient-to-r from-navy-900 to-navy-600 pb-7 pt-7 sm:pb-10 sm:pt-10">
        <div className="mx-auto max-w-6xl px-4">
          <p className="text-sm font-bold uppercase tracking-widest text-aqua-300">Vehicle Buddy</p>
          <h1 className="mt-1 text-2xl font-extrabold text-white sm:text-4xl">{t('Contact us')}</h1>
          <p className="mt-2 max-w-2xl text-white/75">{t('A question, a problem with an ad, or feedback about the site? Reach us directly.')}</p>
        </div>
      </div>

      <div className="mx-auto mt-5 max-w-6xl space-y-4 px-3 pb-14 sm:mt-8 sm:space-y-6 sm:px-4 sm:pb-20">
        <div className="grid gap-4 sm:gap-6 lg:grid-cols-[1fr_1.15fr]">
          <div className="min-w-0 space-y-3 sm:space-y-5">
            {items.map(({ icon: I, title, value, href, note, extra }) => (
              <div key={title} className="card lift flex gap-3 sm:gap-4">
                <span className="grid h-10 w-10 shrink-0 sm:h-12 sm:w-12 place-items-center rounded-2xl bg-gradient-to-br from-brand-500 to-navy-600 text-white shadow-soft"><I className="h-6 w-6" /></span>
                <div className="min-w-0">
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-500">{title}</p>
                  {href ? <a href={href} className="block break-words text-base font-extrabold text-navy-800 hover:text-brand-600 sm:text-lg">{value}</a> : <p className="block break-words text-base font-extrabold text-navy-800 sm:text-lg">{value}</p>}
                  <p className="text-sm text-slate-500">{note}</p>
                  {extra}
                </div>
              </div>
            ))}

          </div>

          <ContactForm />
        </div>


        <div className="card flex flex-col overflow-hidden !p-0">
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 pb-3 sm:p-5">
            <div className="flex gap-3">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-brand-500 to-navy-600 text-white shadow-soft"><MapPin className="h-6 w-6" /></span>
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">{t('Find us')}</p>
                <p className="font-extrabold text-navy-800" data-no-translate>Vehicle Buddy</p>
              </div>
            </div>
            <a className="btn-ghost !py-1.5" href={external} target="_blank" rel="noreferrer"><ExternalLink className="h-4 w-4" /> {t('Open in Google Maps')}</a>
          </div>
          <iframe title={t('Our location on the map')} src={embed} className="h-72 w-full border-0 sm:h-96" loading="lazy" referrerPolicy="no-referrer-when-downgrade" allowFullScreen />
        </div>
      </div>
      </main>
      <Footer />
    </div>
  );
}
