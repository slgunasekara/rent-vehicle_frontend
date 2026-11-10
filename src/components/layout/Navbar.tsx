import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, LogOut, LayoutDashboard, Home, Search, Mail, Info, UserRound, LogIn, UserPlus, PlusCircle, ListChecks, Heart } from 'lucide-react';
import Logo from './Logo';
import LanguageMenu from './LanguageMenu';
import { ThemeToggle } from '../../context/ThemeContext';
import { useT } from '../../i18n';
import { useAppDispatch, useAppSelector } from '../../store';
import { logoutUser } from '../../store/authSlice';

export default function Navbar({ overlay = false }: { overlay?: boolean }) {
  const t = useT();
  const [open, setOpen] = useState(false);
  const user = useAppSelector((s) => s.auth.user);
  // the full top bar (with the icon-only buttons on laptops) fits from 1280px; narrower = the compact menu
  const BP = { flex: 'min-[1280px]:flex', hidden: 'min-[1280px]:hidden' };
  const d = useAppDispatch();
  const nav = useNavigate();
  const loc = useLocation();
  const box = useRef<HTMLElement>(null);

  const links = [
    { to: '/', label: t('Home'), end: true, icon: Home },
    { to: '/find', label: t('Find Vehicles'), icon: Search },
    { to: '/contact', label: t('Contact'), icon: Mail },
    { to: '/about', label: t('About Us'), icon: Info },
  ];
  const base = overlay ? 'glass !border-x-0 !border-t-0 text-white' : 'bg-white/90 text-navy-800 shadow-soft backdrop-blur border-b border-brand-100';
  const linkCls = ({ isActive }: { isActive: boolean }) =>
    `whitespace-nowrap rounded-lg px-3 py-2 text-sm font-semibold transition ${isActive ? (overlay ? 'bg-white/20' : 'bg-brand-50 text-brand-600') : overlay ? 'text-white/85 hover:bg-white/10' : 'text-slate-600 hover:bg-brand-50'}`;
  const logout = async () => { setOpen(false); await d(logoutUser()); nav('/'); };

  useEffect(() => { setOpen(false); }, [loc.pathname, loc.search]);
  useEffect(() => {
    if (!open) return;
    const away = (e: PointerEvent) => { if (!box.current?.contains(e.target as Node)) setOpen(false); };
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    const wide = () => { if (window.innerWidth >= 1024) setOpen(false); };
    document.addEventListener('pointerdown', away);
    document.addEventListener('keydown', esc);
    window.addEventListener('resize', wide);
    return () => { document.removeEventListener('pointerdown', away); document.removeEventListener('keydown', esc); window.removeEventListener('resize', wide); };
  }, [open]);

  const tile = 'flex min-w-0 items-center gap-2 rounded-xl bg-white/10 px-3 py-2.5 text-left text-[13.5px] font-semibold leading-tight text-white/95 transition hover:bg-white/15 active:bg-white/20';
  const tileOn = '!bg-white/25 ring-1 ring-white/30';
  const ghost = overlay ? 'btn-glass' : 'btn-ghost';

  return (
    <header ref={box} className={`no-print ${overlay ? 'absolute inset-x-0 top-0' : 'sticky top-0'} z-30 w-full`}>
      <div className={`flex w-full items-center justify-between gap-2 px-3 py-2.5 sm:gap-3 sm:px-6 sm:py-3 lg:px-8 ${base}`}>
        <div className="min-w-0 shrink"><Logo light={overlay} size={42} responsive /></div>
        <nav className={`hidden items-center gap-1 ${BP.flex}`} aria-label="Main">
          {links.map((l) => <NavLink key={l.to} to={l.to} end={l.end} className={linkCls}>{l.label}</NavLink>)}
        </nav>
        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          <LanguageMenu glass={overlay} />
          <ThemeToggle glass={overlay} className="!h-9 !w-9 sm:!h-10 sm:!w-10" />
          <div className={`hidden items-center gap-2 ${BP.flex}`}>
            <Link to="/post" className="btn-primary"><PlusCircle className="h-4 w-4" /> {t('Post an Ad')}</Link>
            {user ? (
              <>
                {user.role === 'admin' && <Link to="/admin" className={`${ghost} max-[1439px]:!px-2.5`} title={t('Company Console')} aria-label={t('Company Console')}><LayoutDashboard className="h-4 w-4" /> <span className="max-[1439px]:hidden">{t('Company Console')}</span></Link>}
                <Link to="/my-ads" className={`${ghost} max-[1439px]:!px-2.5`} title={t('My Ads')} aria-label={t('My Ads')}><ListChecks className="h-4 w-4" /> <span className="max-[1439px]:hidden">{t('My Ads')}</span></Link>
                <Link to="/saved" className={`${ghost} !px-2.5`} aria-label={t('Saved Ads')} title={t('Saved Ads')}><Heart className="h-4 w-4" /></Link>
                <Link to="/account" className={`${ghost} !px-2.5`} aria-label={t('Account')} title={t('Account')}><UserRound className="h-4 w-4" /></Link>
                <button className={`${ghost} max-[1439px]:!px-2.5`} onClick={logout} title={t('Logout')} aria-label={t('Logout')}><LogOut className="h-4 w-4" /> <span className="max-[1439px]:hidden">{t('Logout')}</span></button>
              </>
            ) : (
              <>
                <Link to="/login" className={ghost}>{t('Login')}</Link>
                <Link to="/register" className={ghost}>{t('Register')}</Link>
              </>
            )}
          </div>
          <button type="button" className={`grid h-9 w-9 place-items-center rounded-xl border transition active:scale-90 sm:h-10 sm:w-10 ${BP.hidden} ${overlay ? 'border-white/30 bg-white/10 text-white hover:bg-white/20' : 'border-brand-200 bg-white text-navy-700 hover:bg-brand-50'}`} onClick={() => setOpen((o) => !o)} aria-label={t('Toggle menu')} aria-expanded={open}>{open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}</button>
        </div>
      </div>
      {open && (
        <div className={`absolute inset-x-0 top-full px-3 pt-2 ${BP.hidden}`}>
          <div className="max-h-[calc(100dvh-5rem)] overflow-y-auto overscroll-contain rounded-2xl border border-white/10 bg-navy-900 p-2.5 text-white shadow-[0_24px_50px_-16px_rgba(3,21,46,.7)] backdrop-blur animate-rise">
            {user && (
              <div className="mb-2 flex items-center gap-3 rounded-xl bg-white/10 px-3 py-2">
                {user.avatar ? <img src={user.avatar} alt="" className="h-8 w-8 rounded-full" referrerPolicy="no-referrer" /> : <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-brand-500 text-sm font-bold">{user.name[0]}</div>}
                <div className="min-w-0"><p className="truncate text-sm font-bold">{user.name}</p><p className="truncate text-xs text-white/60">{user.email}</p></div>
              </div>
            )}
            {/* two buttons per row, so the menu stays short */}
            <div className="grid grid-cols-2 gap-2">
              {links.map(({ to, label, end, icon: I }) => (
                <NavLink key={to} to={to} end={end} className={({ isActive }) => `${tile} ${isActive ? tileOn : ''}`}><I className="h-4 w-4 shrink-0 text-aqua-300" /><span>{label}</span></NavLink>
              ))}
              <Link to="/post" className="btn-primary col-span-2 !py-2.5 text-[13.5px]"><PlusCircle className="h-4 w-4" />{t('Post an Ad')}</Link>
              {user ? (
                <>
                  <Link to="/my-ads" className={tile}><ListChecks className="h-4 w-4 shrink-0 text-aqua-300" /><span>{t('My Ads')}</span></Link>
                  <Link to="/saved" className={tile}><Heart className="h-4 w-4 shrink-0 text-aqua-300" /><span>{t('Saved Ads')}</span></Link>
                  <Link to="/account" className={tile}><UserRound className="h-4 w-4 shrink-0 text-aqua-300" /><span>{t('Account')}</span></Link>
                  <button className={`${tile} text-red-200`} onClick={logout}><LogOut className="h-4 w-4 shrink-0 text-red-300" /><span>{t('Logout')}</span></button>
                  {user.role === 'admin' && <Link to="/admin" className={`${tile} col-span-2 justify-center`}><LayoutDashboard className="h-4 w-4 shrink-0 text-aqua-300" /><span>{t('Company Console')}</span></Link>}
                </>
              ) : (
                <>
                  <Link to="/login" className={`${tile} justify-center`}><LogIn className="h-4 w-4 shrink-0 text-aqua-300" /><span>{t('Login')}</span></Link>
                  <Link to="/register" className={`${tile} justify-center`}><UserPlus className="h-4 w-4 shrink-0 text-aqua-300" /><span>{t('Register')}</span></Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
