import { FormEvent, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Info, Sparkles } from 'lucide-react';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import PhotoPicker from '../../components/common/PhotoPicker';
import MakePicker from '../../components/common/MakePicker';
import CityPicker, { Place } from '../../components/common/CityPicker';
import { Field, Spinner } from '../../components/common/ui';
import { api, errMsg } from '../../service/api';
import { useAppSelector } from '../../store';
import { AD_DAYS, CATEGORIES, CONDITIONS, DRIVERS, FUELS, MAKES, PRICE_TYPES } from '../../data/vehicleOptions';
import { toDateInput, todayStr } from '../../utils/format';
import { useT, useLang } from '../../i18n';
import { describeAd } from '../../service/extras';

const BLANK = {
  category: 'car', make: '', vehicleModel: '', year: '', fuel: 'petrol', driver: 'both', condition: 'registered', seats: '', kmPerLitre: '',
  priceType: 'per_day', pricePerKm: '', pricePerDay: '', pricePerMonth: '', contactNumber: '', description: '', insuranceExpiry: '',
};

/** Post an Ad (and edit one): free, live at once, no approval. Everything the filters use is asked here. */
export default function PostAd() {
  const t = useT();
  const nav = useNavigate();
  const { id } = useParams();
  const user = useAppSelector((s) => s.auth.user);
  const [f, setF] = useState({ ...BLANK, contactNumber: user?.phone ?? '' });
  const [place, setPlace] = useState<Place>({ district: '', city: '' });
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(!!id);
  const [busy, setBusy] = useState(false);
  const { lang } = useLang();
  const [writing, setWriting] = useState(false);
  /** "Write with AI": the description is written from the facts already typed in the form (Gemini; a plain template if the AI is not available) */
  const canWrite = !!(f.make && f.vehicleModel.trim() && place.city);
  const writeWithAI = async () => {
    setWriting(true);
    try {
      const r = await describeAd({ category: f.category, make: f.make, vehicleModel: f.vehicleModel.trim(), year: f.year, fuel: f.fuel, kmPerLitre: f.fuel === 'electric' ? '' : f.kmPerLitre, driver: f.driver, condition: f.condition, seats: f.seats, district: place.district, city: place.city, lang });
      setF((p) => ({ ...p, description: r.text }));
      toast.success(r.ai ? t('Description written. Read it and change anything you like.') : t('The AI is busy, so a simple description was written. You can change it.'));
    } catch (e) { toast.error(errMsg(e)); } finally { setWriting(false); }
  };
  const set = (k: keyof typeof BLANK) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setF((p) => ({ ...p, [k]: e.target.value }));

  useEffect(() => {
    if (!id) return;
    api.get(`/vehicles/mine/${id}`).then((r) => {
      const v = r.data.data;
      setF({ category: v.category, make: v.make, vehicleModel: v.vehicleModel, year: v.year ? String(v.year) : '', fuel: v.fuel, driver: v.driver, condition: v.condition, seats: v.seats ? String(v.seats) : '', kmPerLitre: v.kmPerLitre ? String(v.kmPerLitre) : '', priceType: v.priceType, pricePerKm: v.pricePerKm ? String(v.pricePerKm) : '', pricePerDay: v.pricePerDay ? String(v.pricePerDay) : '', pricePerMonth: v.pricePerMonth ? String(v.pricePerMonth) : '', contactNumber: v.contactNumber, description: v.description ?? '', insuranceExpiry: toDateInput(v.insuranceExpiry) });
      setPlace({ district: v.district, city: v.city });
      setImages(v.images);
    }).catch((e) => { toast.error(errMsg(e)); nav('/my-ads', { replace: true }); }).finally(() => setLoading(false));
  }, [id, nav]);

  const needKm = f.priceType === 'per_km' || f.priceType === 'km_and_day';
  const needDay = f.priceType === 'per_day' || f.priceType === 'km_and_day';
  const needMonth = f.priceType === 'per_month';

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!place.city) { toast.error(t('Choose your city from the list')); return; }
    if (!images.length) { toast.error(t('Add at least 1 photo')); return; }
    setBusy(true);
    try {
      const body = { ...f, ...place, images, year: f.year || undefined, seats: f.seats || undefined, kmPerLitre: f.fuel === 'electric' ? undefined : f.kmPerLitre || undefined, pricePerKm: needKm ? f.pricePerKm : undefined, pricePerDay: needDay ? f.pricePerDay : undefined, pricePerMonth: needMonth ? f.pricePerMonth : undefined, description: f.description || undefined };
      const r = id ? await api.put(`/vehicles/${id}`, body) : await api.post('/vehicles', body);
      toast.success(r.data.message || 'Saved');
      nav('/my-ads');
    } catch (err) { toast.error(errMsg(err)); } finally { setBusy(false); }
  };

  return (
    <div className="flex min-h-screen flex-col bg-surface">
      <Navbar />
      <main className="w-full flex-1 mx-auto max-w-3xl px-4 py-6 sm:py-8">
        <h1 className="text-2xl font-extrabold text-navy-800">{id ? t('Edit your ad') : t('Post a free ad')}</h1>
        <p className="mb-5 mt-1 flex items-start gap-2 text-sm text-slate-500"><Info className="mt-0.5 h-4 w-4 shrink-0 text-brand-500" /> {t('Your ad goes live at once and stays online for {n} days. Then it is removed automatically (you can renew it). You can delete it any time.', { n: AD_DAYS })}</p>
        {loading ? <Spinner /> : (
          <form onSubmit={submit} className="space-y-5">
            <div className="card space-y-4">
              <h2 className="font-extrabold text-navy-800">{t('The vehicle')}</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label={t('Type')} required><select className="input" value={f.category} onChange={set('category')}>{CATEGORIES.map((c) => <option key={c.key} value={c.key}>{t(c.one)}</option>)}</select></Field>
                <Field label={t('Make')} required><MakePicker any={false} required value={f.make} onChange={(m) => setF((p) => ({ ...p, make: m }))} /></Field>
                <Field label={t('Model')} required><input required className="input" maxLength={60} placeholder="e.g. Corolla, Hiace, Civic" value={f.vehicleModel} onChange={set('vehicleModel')} /></Field>
                <Field label={t('Year')}><input type="number" className="input" min={1900} max={new Date().getFullYear() + 1} placeholder="e.g. 2018" value={f.year} onChange={set('year')} /></Field>
                <Field label={t('Fuel type')} required><select className="input" value={f.fuel} onChange={set('fuel')}>{FUELS.map((x) => <option key={x.key} value={x.key}>{t(x.label)}</option>)}</select></Field>
                <Field label={t('Condition')} required><select className="input" value={f.condition} onChange={set('condition')}>{CONDITIONS.map((x) => <option key={x.key} value={x.key}>{t(x.label)}</option>)}</select></Field>
                <Field label={t('Driver')} required><select className="input" value={f.driver} onChange={set('driver')}>{DRIVERS.map((x) => <option key={x.key} value={x.key}>{t(x.label)}</option>)}</select></Field>
                <Field label={t('Seats')} hint={t('Optional')}><input type="number" min={1} max={100} className="input" value={f.seats} onChange={set('seats')} /></Field>
                {f.fuel !== 'electric' && (
                  <Field label={t('Fuel economy (km per litre)')} hint={t('Optional. How many km does it run on 1 litre of fuel?')}>
                    <input type="number" inputMode="decimal" step="0.1" min={0.5} max={200} className="input" placeholder="e.g. 12" value={f.kmPerLitre} onChange={set('kmPerLitre')} />
                  </Field>
                )}
              </div>
            </div>

            <div className="card space-y-4">
              <h2 className="font-extrabold text-navy-800">{t('Where is it?')}</h2>
              <Field label={t('City')} required hint={t('Start typing, or open the list and pick your city.')}><CityPicker requireCity value={place} onChange={setPlace} /></Field>
            </div>

            <div className="card space-y-4">
              <h2 className="font-extrabold text-navy-800">{t('Price')}</h2>
              <Field label={t('How do you want to show the price?')} required><select className="input" value={f.priceType} onChange={set('priceType')}>{PRICE_TYPES.map((x) => <option key={x.key} value={x.key}>{t(x.label)}</option>)}</select></Field>
              {f.priceType === 'call' ? <p className="rounded-xl bg-brand-50 p-3 text-sm text-slate-600">{t('No price is shown. People see "Call now for the price".')}</p> : (
                <div className="grid gap-4 sm:grid-cols-2">
                  {needKm && <Field label={t('Price per km (Rs.)')} required><input required type="number" min={1} className="input" value={f.pricePerKm} onChange={set('pricePerKm')} /></Field>}
                  {needDay && <Field label={t('Price per day (Rs.)')} required><input required type="number" min={1} className="input" value={f.pricePerDay} onChange={set('pricePerDay')} /></Field>}
                  {needMonth && <Field label={t('Price per month (Rs.)')} required><input required type="number" min={1} className="input" value={f.pricePerMonth} onChange={set('pricePerMonth')} /></Field>}
                </div>
              )}
            </div>

            <div className="card space-y-4">
              <h2 className="font-extrabold text-navy-800">{t('Photos and details')}</h2>
              <PhotoPicker images={images} onChange={setImages} />
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label={t('Contact number')} required hint={t('People will call this number.')}><input required type="tel" minLength={7} className="input" value={f.contactNumber} onChange={set('contactNumber')} placeholder="07X XXX XXXX" /></Field>
                <Field label={t('Insurance expiry date')} required hint={t('The ad is hidden automatically after this date.')}><input required type="date" min={todayStr()} className="input" value={f.insuranceExpiry} onChange={set('insuranceExpiry')} /></Field>
              </div>
              <Field label={t('Description')} hint={t('Optional: mileage, extra features, rules, pick-up place...')}>
                <textarea className="input min-h-[7rem]" maxLength={1000} value={f.description} onChange={set('description')} />
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <button type="button" onClick={writeWithAI} disabled={!canWrite || writing} className="btn border border-brand-300 bg-brand-50 !py-2 text-sm text-brand-700 hover:bg-brand-100 disabled:opacity-50">
                    <Sparkles className={`h-4 w-4 ${writing ? 'animate-pulse' : ''}`} /> {writing ? t('Writing...') : t('Write with AI')}
                  </button>
                  <span className="text-xs text-slate-500">{canWrite ? t('Uses the details you filled in above.') : t('Choose the make, model and city first.')}</span>
                </div>
              </Field>
            </div>

            <div className="flex flex-wrap justify-end gap-2">
              <button type="button" className="btn-ghost" onClick={() => nav(-1)} disabled={busy}>{t('Cancel')}</button>
              <button className="btn-primary min-w-[10rem]" disabled={busy}>{busy ? t('Saving...') : id ? t('Save changes') : t('Publish ad')}</button>
            </div>
          </form>
        )}
      </main>
      <Footer />
    </div>
  );
}
