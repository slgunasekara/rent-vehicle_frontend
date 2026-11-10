import { FormEvent, useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowRight, MapPin, Send, X } from 'lucide-react';
import type { AxiosError } from 'axios';
import { askBuddy, BuddyReply } from '../../service/chat';
import { useT } from '../../i18n';
import { photo, priceLines, vehicleTitle } from '../../utils/format';

interface Msg extends Partial<Omit<BuddyReply, 'reply'>> { role: 'user' | 'assistant'; text: string }

const HIDDEN_ON = ['/admin', '/login', '/register', '/forgot-password'];
const GREETING = "Hi! I'm Buddy. Tell me what vehicle you need and where, or ask me anything about the site.";
const SUGGESTIONS = ['Find a van in Kandy', 'Cheapest car per day', 'How do I post an ad?', 'Do you take a commission?'];

/** Buddy: the floating chat helper. Answers questions about the site and shows real ads for what the visitor asks for. */
export default function BuddyChat() {
  const t = useT();
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([{ role: 'assistant', text: GREETING }]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const bottom = useRef<HTMLDivElement>(null);
  const panel = useRef<HTMLElement>(null);
  const box = useRef<HTMLInputElement>(null);

  useEffect(() => { bottom.current?.scrollIntoView({ behavior: 'smooth', block: 'end' }); }, [msgs, busy, open]);
  useEffect(() => { if (open) box.current?.focus(); }, [open]);
  useEffect(() => {
    if (!open) return;
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    // a tap / click anywhere outside the chat minimises it (the conversation is kept)
    const outside = (e: PointerEvent) => { if (panel.current && !panel.current.contains(e.target as Node)) setOpen(false); };
    window.addEventListener('keydown', esc);
    document.addEventListener('pointerdown', outside);
    return () => { window.removeEventListener('keydown', esc); document.removeEventListener('pointerdown', outside); };
  }, [open]);

  if (HIDDEN_ON.some((p) => pathname === p || pathname.startsWith(p + '/'))) return null;

  const send = async (raw: string) => {
    const message = raw.trim();
    if (!message || busy) return;
    // the earlier conversation without the greeting (the server only needs real turns)
    const history = msgs.slice(1).map((m) => ({ role: m.role, text: m.text }));
    setMsgs((m) => [...m, { role: 'user', text: message }]);
    setInput('');
    setBusy(true);
    try {
      const r = await askBuddy(message, history);
      setMsgs((m) => [...m, { role: 'assistant', text: r.reply, vehicles: r.vehicles, total: r.total, findPath: r.findPath, noResults: r.noResults }]);
    } catch (e) {
      const status = (e as AxiosError).response?.status;
      const text = status === 429 ? 'You are sending messages very fast. Please wait a moment.' : 'Sorry, I could not answer right now. Please try again in a moment.';
      setMsgs((m) => [...m, { role: 'assistant', text }]);
    } finally {
      setBusy(false);
    }
  };
  const submit = (e: FormEvent) => { e.preventDefault(); void send(input); };

  return (
    <>
      {!open && (
        <button onClick={() => setOpen(true)} aria-label={t('Ask Buddy')} title={t('Ask Buddy')}
          className="no-print fixed bottom-3 right-3 z-40 transition duration-200 hover:-translate-y-1 hover:scale-110 active:scale-95 sm:bottom-5 sm:right-5">
          <img src="/buddy.png" alt="" draggable={false} className="h-14 w-auto select-none drop-shadow-[0_6px_14px_rgba(4,31,65,.5)] sm:h-16" />
        </button>
      )}

      {open && (
        <section ref={panel} role="dialog" aria-label="Buddy"
          className="no-print fixed bottom-3 right-3 z-40 flex h-[min(34rem,calc(100dvh-1.5rem))] w-[calc(100vw-1.5rem)] flex-col overflow-hidden rounded-2xl border border-brand-200 bg-white shadow-soft sm:bottom-5 sm:right-5 sm:w-[24rem]">
          <header className="flex items-center gap-3 bg-gradient-to-r from-navy-800 to-brand-600 px-4 py-3 text-white">
            <img src="/buddy.png" alt="" draggable={false} className="h-10 w-auto flex-none select-none drop-shadow-[0_2px_6px_rgba(0,0,0,.35)]" />
            <div className="min-w-0 flex-1">
              <p className="font-extrabold leading-tight" data-no-translate>Buddy</p>
              <p className="text-xs text-white/75">{t('Your Vehicle Buddy helper')}</p>
            </div>
            <button onClick={() => setOpen(false)} aria-label={t('Close')} className="rounded-full p-1.5 hover:bg-white/15"><X className="h-5 w-5" /></button>
          </header>

          <div className="flex-1 space-y-3 overflow-y-auto bg-surface px-3 py-4" data-no-translate>
            {msgs.map((m, i) => (
              <div key={i} className={m.role === 'user' ? 'flex justify-end' : 'flex justify-start'}>
                <div className={`max-w-[88%] space-y-2 ${m.role === 'user' ? '' : 'w-full'}`}>
                  <p className={`whitespace-pre-line break-words rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${m.role === 'user' ? 'ml-auto w-fit rounded-br-md bg-brand-500 text-white' : 'w-fit rounded-bl-md bg-brand-50 text-navy-800'}`}>
                    {i === 0 ? t(m.text) : m.text}
                  </p>

                  {m.vehicles?.map((v) => (
                    <Link key={v._id} to={`/vehicle/${v._id}`} onClick={() => setOpen(false)}
                      className="flex gap-3 rounded-xl border border-brand-100 bg-white p-2 transition hover:border-brand-300">
                      {photo(v.cover) ? <img src={photo(v.cover)} alt="" loading="lazy" className="h-16 w-20 flex-none rounded-lg object-cover" /> : <div className="h-16 w-20 flex-none rounded-lg bg-brand-100" />}
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold text-navy-800">{vehicleTitle(v)}</p>
                        <p className="flex items-center gap-1 truncate text-xs text-navy-700/80"><MapPin className="h-3 w-3 flex-none" />{v.city}, {v.district}</p>
                        <p className="truncate text-xs font-bold text-brand-600">{priceLines(v)[0] ?? t('Call now for the price')}</p>
                      </div>
                    </Link>
                  ))}

                  {m.noResults && <p className="rounded-xl bg-white px-3 py-2 text-xs text-navy-700/80">{t('No ads match that right now. Try another city or budget, or check again later.')}</p>}
                  {!!m.total && m.findPath && (
                    <Link to={m.findPath} onClick={() => setOpen(false)} className="inline-flex items-center gap-1 text-xs font-bold text-brand-600 hover:underline">
                      {t('See all {n} results', { n: m.total })} <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  )}
                </div>
              </div>
            ))}

            {busy && (
              <div className="flex justify-start" aria-live="polite">
                <span className="flex gap-1 rounded-2xl rounded-bl-md bg-brand-50 px-4 py-3">
                  {[0, 1, 2].map((d) => <span key={d} className="h-2 w-2 animate-bounce rounded-full bg-brand-400" style={{ animationDelay: `${d * 0.15}s` }} />)}
                </span>
              </div>
            )}

            {msgs.length === 1 && !busy && (
              <div className="flex flex-wrap gap-2 pt-1">
                {SUGGESTIONS.map((s) => (
                  <button key={s} onClick={() => void send(t(s))} className="rounded-full border border-brand-200 bg-white px-3 py-1.5 text-xs font-semibold text-navy-800 hover:bg-brand-50">{t(s)}</button>
                ))}
              </div>
            )}
            <div ref={bottom} />
          </div>

          <form onSubmit={submit} className="flex items-center gap-2 border-t border-brand-100 bg-white p-3">
            <input ref={box} value={input} onChange={(e) => setInput(e.target.value)} maxLength={500} placeholder={t('Type your message...')} className="input flex-1" aria-label={t('Type your message...')} />
            <button type="submit" disabled={busy || !input.trim()} aria-label={t('Send')} className="grid h-11 w-11 flex-none place-items-center rounded-xl bg-brand-500 text-white transition hover:bg-brand-600 disabled:opacity-50">
              <Send className="h-5 w-5" />
            </button>
          </form>
        </section>
      )}
    </>
  );
}
