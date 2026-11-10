import { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Expand, X, CarFront as BusIcon } from 'lucide-react';
import { useT } from '../../i18n';

/**
 * Photo gallery: one big image (shown whole, never cropped), arrows, a counter, a full-screen button
 * and a strip of thumbnails. Works with the keyboard (arrows / Esc) and with swipes on a phone.
 */
export default function Gallery({ images, alt }: { images: string[]; alt: string }) {
  const t = useT();
  const [i, setI] = useState(0);
  const [full, setFull] = useState(false);
  const touch = useRef<number | null>(null);
  const strip = useRef<HTMLDivElement>(null);
  const n = images.length;

  const go = useCallback((d: number) => setI((x) => (n ? (x + d + n) % n : 0)), [n]);
  useEffect(() => { if (i >= n) setI(0); }, [n, i]);
  useEffect(() => {
    // keep the picked thumbnail in view
    const el = strip.current?.children[i] as HTMLElement | undefined;
    el?.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' });
  }, [i]);
  useEffect(() => {
    if (!full) return;
    const key = (e: KeyboardEvent) => { if (e.key === 'Escape') setFull(false); if (e.key === 'ArrowLeft') go(-1); if (e.key === 'ArrowRight') go(1); };
    window.addEventListener('keydown', key);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', key); document.body.style.overflow = prev; };
  }, [full, go]);

  if (n === 0) {
    return <div className="grid aspect-[4/3] w-full place-items-center rounded-2xl bg-gradient-to-br from-navy-700 to-brand-500 text-white/80"><BusIcon className="h-14 w-14" /></div>;
  }

  const onTouchEnd = (e: React.TouchEvent) => {
    if (touch.current === null) return;
    const dx = e.changedTouches[0].clientX - touch.current;
    touch.current = null;
    if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1);
  };

  const arrow = 'absolute top-1/2 z-10 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-black/45 text-white backdrop-blur transition hover:bg-black/65 active:scale-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-white';

  return (
    <div>
      <div className="relative overflow-hidden rounded-2xl bg-[#14172b]" onTouchStart={(e) => { touch.current = e.touches[0].clientX; }} onTouchEnd={onTouchEnd}>
        <div className="aspect-[4/3] w-full">
          <img key={i} src={images[i]} alt={`${alt} - ${i + 1}`} className="h-full w-full animate-rise object-contain" decoding="async" />
        </div>
        <button type="button" onClick={() => setFull(true)} className="absolute right-3 top-3 z-10 grid h-10 w-10 place-items-center rounded-full bg-black/55 text-white backdrop-blur transition hover:bg-black/75 active:scale-90" aria-label={t('Full screen')}><Expand className="h-5 w-5" /></button>
        {n > 1 && (
          <>
            <button type="button" className={`${arrow} left-3`} onClick={() => go(-1)} aria-label={t('Previous')}><ChevronLeft className="h-5 w-5" /></button>
            <button type="button" className={`${arrow} right-3`} onClick={() => go(1)} aria-label={t('Next')}><ChevronRight className="h-5 w-5" /></button>
          </>
        )}
        <span className="absolute bottom-3 right-3 rounded-full bg-black/60 px-3 py-1 text-xs font-bold text-white">{i + 1} / {n}</span>
      </div>

      {n > 1 && (
        <div ref={strip} className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {images.map((src, k) => (
            <button key={k} type="button" onClick={() => setI(k)} aria-label={`${k + 1}`} className={`h-14 w-[4.5rem] shrink-0 overflow-hidden rounded-lg bg-[#14172b] ring-2 transition ${k === i ? 'ring-brand-500' : 'opacity-70 ring-transparent hover:opacity-100'}`}>
              <img src={src} alt="" className="h-full w-full object-cover" loading="lazy" decoding="async" />
            </button>
          ))}
        </div>
      )}

      {full && (
        <div className="fixed inset-0 z-[70] flex flex-col bg-black/95" role="dialog" aria-modal="true" aria-label={alt} onClick={() => setFull(false)}>
          <div className="flex items-center justify-between p-4 text-white" onClick={(e) => e.stopPropagation()}>
            <span className="text-sm font-bold">{i + 1} / {n}</span>
            <button type="button" className="grid h-10 w-10 place-items-center rounded-full bg-white/10 hover:bg-white/20" onClick={() => setFull(false)} aria-label={t('Close')}><X className="h-5 w-5" /></button>
          </div>
          <div className="relative flex min-h-0 flex-1 items-center justify-center px-4 pb-6">
            <img src={images[i]} alt={`${alt} - ${i + 1}`} className="max-h-full max-w-full object-contain" onClick={(e) => e.stopPropagation()} />
            {n > 1 && (
              <>
                <button type="button" className={`${arrow} left-4`} onClick={(e) => { e.stopPropagation(); go(-1); }} aria-label={t('Previous')}><ChevronLeft className="h-5 w-5" /></button>
                <button type="button" className={`${arrow} right-4`} onClick={(e) => { e.stopPropagation(); go(1); }} aria-label={t('Next')}><ChevronRight className="h-5 w-5" /></button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
