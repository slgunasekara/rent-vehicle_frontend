import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Calendar, CarFront, Fuel, MapPin, MessageCircle, Phone, ShieldCheck, Tag, UserRound, Users, Gauge, Flag, Star, Eye, CornerDownRight } from 'lucide-react';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import Gallery from '../../components/common/Gallery';
import { PriceBlock } from '../../components/vehicle/VehicleCard';
import { Spinner } from '../../components/common/ui';
import { api, errMsg } from '../../service/api';
import { categoryLabel, conditionLabel, driverLabel, fmtDate, fuelLabel, photo, priceLines, telHref, vehicleTitle, waLink } from '../../utils/format';
import type { VehicleDetailT } from '../../types';
import { useT } from '../../i18n';
import HeartButton from '../../components/vehicle/HeartButton';
import ReportModal from '../../components/vehicle/ReportModal';
import { RatingBadge, StarInput } from '../../components/common/Stars';
import { useAppSelector } from '../../store';
import { MyEngagement, ReviewPage, adReviews, myEngagement, rateAd, unrateAd } from '../../service/engage';
import { recordCall, recordView, similarAds, adsByIds, replyToReview, deleteReply } from '../../service/extras';
import { recentIds, rememberAd } from '../../utils/recent';
import ShareMenu from '../../components/vehicle/ShareMenu';
import TripCalculator from '../../components/vehicle/TripCalculator';
import AdRow from '../../components/vehicle/AdRow';
import type { VehicleCardT } from '../../types';

export default function VehicleDetails() {
  const t = useT();
  const { id } = useParams();
  const [v, setV] = useState<VehicleDetailT | null>(null);
  const [err, setErr] = useState('');
  const user = useAppSelector((s) => s.auth.user);
  const nav = useNavigate();
  const loc = useLocation();
  const [me, setMe] = useState<MyEngagement | null>(null); // what the signed-in user already did with this ad
  const [reportOpen, setReportOpen] = useState(false);

  useEffect(() => {
    setV(null); setErr('');
    api.get(`/vehicles/${id}`).then((r) => setV(r.data.data)).catch((e) => setErr(errMsg(e, 'Ad not found')));
  }, [id]);
  useEffect(() => {
    setMe(null);
    if (user && id) myEngagement(id).then(setMe).catch(() => undefined);
  }, [id, user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // the visit is counted once (the server also counts each visitor only once), remembered for "Recently viewed", and the ads below are loaded
  const [similar, setSimilar] = useState<VehicleCardT[]>([]);
  const [recent, setRecent] = useState<VehicleCardT[]>([]);
  const [liveViews, setLiveViews] = useState(0); // the count the server answered with (it can arrive before the ad itself has loaded)
  useEffect(() => {
    if (!id) return;
    setSimilar([]); setRecent([]); setLiveViews(0);
    const before = recentIds().filter((x) => x !== id);
    void recordView(id).then((r) => { const d = (r as { data?: { data?: { views?: number } } } | undefined)?.data?.data; if (d?.views !== undefined) setLiveViews(d.views); });
    rememberAd(id);
    similarAds(id).then(setSimilar).catch(() => undefined);
    adsByIds(before).then(setRecent).catch(() => undefined);
  }, [id]);

  const [replyFor, setReplyFor] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const saveReply = async (reviewId: string) => {
    try { await replyToReview(id!, reviewId, replyText.trim()); toast.success(t('Reply saved')); setReplyFor(null); void loadReviews(1); } catch (e) { toast.error(errMsg(e)); }
  };
  const removeReply = async (reviewId: string) => {
    try { await deleteReply(id!, reviewId); toast.success(t('Reply removed')); void loadReviews(1); } catch (e) { toast.error(errMsg(e)); }
  };

  const toLogin = () => nav('/login', { state: { from: loc.pathname } });
  // the rating form: stars + an optional message; the reviews list shows who rated what
  const [draft, setDraft] = useState({ stars: 0, comment: '' });
  const [saving, setSaving] = useState(false);
  const [reviews, setReviews] = useState<ReviewPage | null>(null);
  const loadReviews = (page = 1) => adReviews(id!, page).then((r) => setReviews((p) => (page > 1 && p ? { ...r, items: [...p.items, ...r.items] } : r))).catch(() => undefined);
  useEffect(() => { setReviews(null); if (id) void loadReviews(1); }, [id, user?.id]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (me) setDraft({ stars: me.myRating, comment: me.myComment }); }, [me?.myRating, me?.myComment]); // eslint-disable-line react-hooks/exhaustive-deps

  const submitRating = async () => {
    if (!user) return toLogin();
    if (!draft.stars) { toast.error(t('Tap a star first')); return; }
    setSaving(true);
    try {
      const s = await rateAd(id!, draft.stars, draft.comment.trim());
      setV((p) => (p ? { ...p, ratingAvg: s.ratingAvg, ratingCount: s.ratingCount } : p));
      setMe((p) => (p ? { ...p, myRating: s.myRating, myComment: s.myComment } : p));
      toast.success(t('Thanks for your rating'));
      void loadReviews(1);
    } catch (e) { toast.error(errMsg(e)); } finally { setSaving(false); }
  };
  const removeRating = async () => {
    setSaving(true);
    try {
      const s = await unrateAd(id!);
      setV((p) => (p ? { ...p, ratingAvg: s.ratingAvg, ratingCount: s.ratingCount } : p));
      setMe((p) => (p ? { ...p, myRating: 0, myComment: '' } : p));
      setDraft({ stars: 0, comment: '' });
      toast.success(t('Your rating was removed'));
      void loadReviews(1);
    } catch (e) { toast.error(errMsg(e)); } finally { setSaving(false); }
  };
  const report = () => (user ? setReportOpen(true) : toLogin());

  const row = (icon: JSX.Element, label: string, value?: string | number) => value ? (
    <div className="flex items-center gap-3 rounded-xl bg-brand-50/60 p-3">
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-white text-brand-600 shadow-soft">{icon}</span>
      <div className="min-w-0"><p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{t(label)}</p><p className="truncate text-sm font-bold text-navy-800">{value}</p></div>
    </div>
  ) : null;

  return (
    <div className="flex min-h-screen flex-col bg-surface">
      <Navbar />
      <main className="w-full flex-1 mx-auto max-w-6xl px-4 py-6 sm:py-8">
        {err ? (
          <div className="card text-center"><p className="font-semibold text-navy-800">{err}</p><Link to="/find" className="btn-primary mt-3">{t('Find other vehicles')}</Link></div>
        ) : !v ? <Spinner /> : (
          <div className="grid gap-6 lg:grid-cols-[1.35fr_1fr]">
            <div className="min-w-0"><Gallery images={v.photos.map((p) => photo(p)!)} alt={vehicleTitle(v)} /></div>
            <div className="min-w-0 space-y-4">
              <div className="card">
                <span className="badge bg-brand-50 text-brand-700"><CarFront className="h-3.5 w-3.5" /> {t(categoryLabel(v.category))}</span>
                <h1 className="mt-2 text-2xl font-extrabold text-navy-800">{vehicleTitle(v)}</h1>
                <p className="mt-1 flex items-center gap-1 text-sm text-slate-500"><MapPin className="h-4 w-4" /> {v.city}, {v.district} {t('District')}</p>
                <p className="mt-1 flex items-center gap-1 text-xs font-semibold text-slate-400"><Eye className="h-3.5 w-3.5" /> {Math.max(v.views ?? 0, liveViews).toLocaleString('en-US')} {t('views')}</p>
                <div className="mt-4 rounded-xl bg-gradient-to-r from-brand-50 to-white p-4"><PriceBlock v={v} big /></div>
                <div className="mt-4 grid gap-2 sm:grid-cols-2">
                  <a href={telHref(v.contactNumber)} onClick={() => void recordCall(v._id)} className="btn-primary !py-3 text-base"><Phone className="h-5 w-5" /> {t('Call')} {v.contactNumber}</a>
                  <a href={waLink(v.contactNumber, `Hi, I saw your ${vehicleTitle(v)} on Vehicle Buddy. Is it available?`)} target="_blank" rel="noopener noreferrer" onClick={() => void recordCall(v._id)} className="btn !py-3 bg-emerald-500 text-base text-white hover:bg-emerald-600"><MessageCircle className="h-5 w-5" /> WhatsApp</a>
                </div>
                <p className="mt-3 text-xs text-slate-500">{t('Agree the price and dates directly with the owner. Vehicle Buddy takes no commission and does not handle any payment.')}</p>
                <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-brand-100 pt-3">
                  <HeartButton id={v._id} label />
                  <ShareMenu id={v._id} title={vehicleTitle(v)} price={priceLines(v)[0]} />
                  {!me?.isOwner && (
                    <button type="button" onClick={report} disabled={me?.reported} className="btn border border-brand-200 bg-white text-navy-800 hover:bg-red-50 disabled:opacity-60">
                      <Flag className="h-4 w-4 text-red-500" /> {me?.reported ? t('Reported') : t('Report this ad')}
                    </button>
                  )}
                  <RatingBadge avg={v.ratingAvg} count={v.ratingCount} className="ml-auto !text-sm" />
                </div>
              </div>
              <div className="card">
                <h2 className="mb-3 font-extrabold text-navy-800">{t('Details')}</h2>
                <div className="grid gap-2 sm:grid-cols-2">
                  {row(<Tag className="h-4 w-4" />, 'Make', v.make)}
                  {row(<CarFront className="h-4 w-4" />, 'Model', v.vehicleModel)}
                  {row(<Calendar className="h-4 w-4" />, 'Year', v.year)}
                  {row(<Fuel className="h-4 w-4" />, 'Fuel type', t(fuelLabel(v.fuel)))}
                  {v.kmPerLitre ? row(<Gauge className="h-4 w-4" />, 'Fuel economy', `${v.kmPerLitre} ${t('km per litre')}`) : null}
                  {row(<UserRound className="h-4 w-4" />, 'Driver', t(driverLabel(v.driver)))}
                  {row(<Gauge className="h-4 w-4" />, 'Condition', t(conditionLabel(v.condition)))}
                  {row(<Users className="h-4 w-4" />, 'Seats', v.seats)}
                  {row(<ShieldCheck className="h-4 w-4" />, 'Insurance valid until', fmtDate(v.insuranceExpiry))}
                </div>
              </div>
                          </div>
            {v.description && (
              <div className="card lg:col-span-2"><h2 className="mb-2 font-extrabold text-navy-800">{t('Description')}</h2><p className="whitespace-pre-wrap text-sm text-slate-700">{v.description}</p></div>
            )}
            <TripCalculator v={v} />
            <div className="card lg:col-span-2">
              <h2 className="mb-1 flex items-center gap-2 font-extrabold text-navy-800"><Star className="h-5 w-5 fill-amber-400 text-amber-400" /> {t('Ratings and reviews')}</h2>
              <p className="mb-3 text-sm text-slate-600">
                {v.ratingCount ? t('{avg} out of 5 from {n} rating(s)', { avg: (v.ratingAvg ?? 0).toFixed(1), n: v.ratingCount }) : t('No ratings yet. Be the first to rate this vehicle.')}
              </p>
              {me?.isOwner ? <p className="rounded-xl bg-brand-50 p-3 text-xs text-slate-600">{t('This is your own ad, so you cannot rate it.')}</p> : user ? (
                <div className="rounded-xl border border-brand-100 bg-brand-50/50 p-3 sm:p-4">
                  <p className="mb-1 text-sm font-bold text-navy-800">{me?.myRating ? t('Your rating') : t('Rate this vehicle')} <span className="font-normal text-slate-500">· {t('as {name}', { name: user.name })}</span></p>
                  <StarInput value={draft.stars} onChange={(n) => setDraft((d) => ({ ...d, stars: n }))} />
                  <textarea className="input mt-3 min-h-[84px]" maxLength={500} value={draft.comment} onChange={(e) => setDraft((d) => ({ ...d, comment: e.target.value }))} placeholder={t('Write a short message about this vehicle or the owner (optional)')} />
                  <div className="mt-1 text-right text-[11px] text-slate-400">{draft.comment.length}/500</div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <button type="button" className="btn-primary !py-2" disabled={saving || !draft.stars} onClick={submitRating}>{me?.myRating ? t('Update my rating') : t('Submit rating')}</button>
                    {!!me?.myRating && <button type="button" className="btn border border-brand-200 bg-white !py-2 text-navy-800 hover:bg-red-50" disabled={saving} onClick={removeRating}>{t('Remove my rating')}</button>}
                  </div>
                </div>
              ) : <p className="rounded-xl bg-brand-50 p-3 text-sm text-slate-600">{t('Log in to rate this vehicle.')} <Link to="/login" state={{ from: loc.pathname }} className="font-bold text-brand-600 hover:underline">{t('Login')}</Link></p>}

              {!!reviews?.items.length && (
                <ul className="mt-4 divide-y divide-brand-100" aria-label={t('Reviews')}>
                  {reviews.items.map((r) => (
                    <li key={r.id} className="flex gap-3 py-3">
                      {r.userAvatar ? <img src={r.userAvatar} alt="" referrerPolicy="no-referrer" className="h-9 w-9 shrink-0 rounded-full object-cover" /> : <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand-500 text-sm font-bold text-white">{r.userName[0]?.toUpperCase()}</div>}
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                          <b className="text-sm text-navy-800">{r.userName}</b>
                          {r.mine && <span className="badge bg-brand-100 text-brand-700">{t('You')}</span>}
                          <span className="inline-flex" aria-label={`${r.stars} / 5`}>{[1, 2, 3, 4, 5].map((n) => <Star key={n} className={`h-3.5 w-3.5 ${n <= r.stars ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} />)}</span>
                          <span className="text-xs text-slate-400">{fmtDate(r.createdAt)}</span>
                        </div>
                        {r.comment && <p className="mt-1 whitespace-pre-wrap break-words text-sm text-slate-700">{r.comment}</p>}
                          {r.reply && replyFor !== r.id && (
                            <div className="mt-2 rounded-xl border-l-4 border-brand-300 bg-brand-50/60 p-2.5 text-sm">
                              <p className="flex items-center gap-1 text-xs font-bold text-brand-700"><CornerDownRight className="h-3.5 w-3.5" /> {t('Reply from the owner')} <span className="font-normal text-slate-400">· {fmtDate(r.reply.at)}</span></p>
                              <p className="mt-0.5 whitespace-pre-wrap break-words text-slate-700">{r.reply.text}</p>
                            </div>
                          )}
                          {me?.isOwner && replyFor !== r.id && (
                            <div className="mt-1.5 flex gap-3 text-xs font-bold">
                              <button type="button" className="text-brand-600 hover:underline" onClick={() => { setReplyFor(r.id); setReplyText(r.reply?.text ?? ''); }}>{r.reply ? t('Edit reply') : t('Reply')}</button>
                              {r.reply && <button type="button" className="text-red-500 hover:underline" onClick={() => removeReply(r.id)}>{t('Remove reply')}</button>}
                            </div>
                          )}
                          {me?.isOwner && replyFor === r.id && (
                            <div className="mt-2 space-y-2">
                              <textarea className="input min-h-[72px]" maxLength={500} autoFocus value={replyText} onChange={(e) => setReplyText(e.target.value)} placeholder={t('Write your reply to this review')} />
                              <div className="flex gap-2"><button type="button" className="btn-primary !py-1.5 text-sm" disabled={replyText.trim().length < 2} onClick={() => saveReply(r.id)}>{t('Post reply')}</button><button type="button" className="btn border border-brand-200 bg-white !py-1.5 text-sm text-navy-800" onClick={() => setReplyFor(null)}>{t('Cancel')}</button></div>
                            </div>
                          )}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
              {reviews && reviews.page < reviews.pages && <button type="button" className="btn border border-brand-200 bg-white !py-2 text-navy-800 hover:bg-brand-50" onClick={() => void loadReviews(reviews.page + 1)}>{t('Show more reviews')}</button>}
            </div>
            <AdRow title={t('Similar vehicles')} ads={similar} />
            <AdRow title={t('Recently viewed')} ads={recent} />
            <div className="card lg:col-span-2 flex flex-wrap items-center justify-between gap-2 text-sm text-slate-500">
              <span>{t('Posted by')} <b className="text-navy-800">{v.owner.name}</b> · {fmtDate(v.createdAt)}</span>
              <span>{t('This ad is online for another {n} days.', { n: v.daysLeft })}</span>
            </div>
          </div>
        )}
      </main>
      {v && <ReportModal open={reportOpen} adId={v._id} adTitle={vehicleTitle(v)} onClose={() => setReportOpen(false)} onDone={() => setMe((p) => (p ? { ...p, reported: true } : p))} />}
      <Footer />
    </div>
  );
}
