import { Heart } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store';
import { toggleFavorite } from '../../store/favoritesSlice';
import { useT } from '../../i18n';

/** the heart that saves an ad. Visitors who are not signed in are sent to Login first, and come back here after. */
export default function HeartButton({ id, className = '', label = false }: { id: string; className?: string; label?: boolean }) {
  const t = useT();
  const d = useAppDispatch();
  const nav = useNavigate();
  const loc = useLocation();
  const user = useAppSelector((s) => s.auth.user);
  const saved = useAppSelector((s) => s.favorites.ids.includes(id));
  const click = (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation(); // the heart sits on top of a link (the ad card)
    if (!user) { nav('/login', { state: { from: loc.pathname + loc.search } }); return; }
    void d(toggleFavorite(id));
  };
  return (
    <button type="button" onClick={click} aria-pressed={saved} aria-label={saved ? t('Remove from saved ads') : t('Save this ad')} title={saved ? t('Remove from saved ads') : t('Save this ad')}
      className={`transition active:scale-90 ${label ? 'btn border border-brand-200 bg-white text-navy-800 hover:bg-brand-50' : 'grid h-9 w-9 place-items-center rounded-full bg-white/90 shadow-soft hover:scale-110'} ${className}`}>
      <Heart className={`h-[18px] w-[18px] ${saved ? 'fill-rose-500 text-rose-500' : label ? 'text-rose-500' : 'text-slate-600'}`} />
      {label && <span className="ml-1.5">{saved ? t('Saved') : t('Save')}</span>}
    </button>
  );
}
