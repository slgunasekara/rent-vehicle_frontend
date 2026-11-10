import { useState } from 'react';
import { Star } from 'lucide-react';

/** read-only stars, e.g. on the cards: 4.5 (12) */
export function RatingBadge({ avg, count, className = '' }: { avg?: number; count?: number; className?: string }) {
  if (!count) return null;
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-bold text-amber-600 ${className}`} title={`${avg} / 5`}>
      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" /> {avg?.toFixed(1)} <span className="font-medium text-slate-500">({count})</span>
    </span>
  );
}

/** five stars the user can click (hover shows what a click would give) */
export function StarInput({ value, onChange, disabled = false, size = 'h-8 w-8' }: { value: number; onChange: (stars: number) => void; disabled?: boolean; size?: string }) {
  const [hover, setHover] = useState(0);
  const shown = hover || value;
  return (
    <div className="inline-flex gap-1" onMouseLeave={() => setHover(0)} role="radiogroup" aria-label="Rating">
      {[1, 2, 3, 4, 5].map((n) => (
        <button key={n} type="button" disabled={disabled} role="radio" aria-checked={value === n} aria-label={`${n} star${n > 1 ? 's' : ''}`} onMouseEnter={() => setHover(n)} onFocus={() => setHover(n)} onBlur={() => setHover(0)} onClick={() => onChange(n)}
          className="rounded-md p-0.5 transition hover:scale-110 disabled:cursor-not-allowed disabled:opacity-60">
          <Star className={`${size} ${n <= shown ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} />
        </button>
      ))}
    </div>
  );
}
