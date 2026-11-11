import { CarFront, ShieldCheck, PhoneCall } from 'lucide-react';
import Logo from '../../components/layout/Logo';
import LanguageMenu from '../../components/layout/LanguageMenu';
import HeroVideo from '../../components/common/HeroVideo';
import { ThemeToggle } from '../../context/ThemeContext';
import { useT } from '../../i18n';

/** sign-in / register frame: the home-page video on the left (phones: just the form), the form card on the right */
export function Shell({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  const t = useT();
  return (
    <div className="grid min-h-screen grid-cols-[minmax(0,1fr)] lg:grid-cols-[1.05fr_1fr]">
      <div className="relative hidden overflow-hidden bg-gradient-to-br from-navy-950 via-navy-800 to-brand-600 p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <HeroVideo />
        <div className="absolute inset-0 bg-gradient-to-b from-navy-950/70 via-navy-900/35 to-navy-950/85" />
        <div className="relative"><Logo light size={44} /></div>
        <div className="relative">
          <h2 className="text-4xl font-extrabold leading-tight drop-shadow">{t('Your next ride is one call away.')}</h2>
          <p className="mt-3 max-w-md text-white/80">{t('Find a vehicle to rent, or list your own and let people call you directly.')}</p>
          <ul className="mt-6 space-y-3">
            {[{ i: CarFront, t: 'Cars, SUVs, vans, buses, lorries and more' }, { i: PhoneCall, t: 'Call the owner - no booking fees, no commission' }, { i: ShieldCheck, t: 'Only vehicles with valid insurance are shown' }].map(({ i: I, t: text }) => (
              <li key={text} className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-white/15 backdrop-blur"><I className="h-5 w-5 text-aqua-300" /></span>{t(text)}</li>
            ))}
          </ul>
        </div>
      </div>
      <div className="relative flex min-w-0 items-start justify-center bg-surface px-4 pb-10 pt-4 sm:p-6 lg:items-center">
        <div className="w-full min-w-0 max-w-md">
          <div className="mb-5 flex items-center justify-between gap-2 lg:mb-0 lg:block"><div className="min-w-0 lg:hidden"><Logo /></div><div className="flex shrink-0 items-center gap-2 lg:absolute lg:right-4 lg:top-4"><LanguageMenu /><ThemeToggle /></div></div>
          <h1 className="text-2xl font-extrabold text-navy-800 sm:text-3xl">{title}</h1>
          <p className="mb-5 mt-1 text-sm text-slate-500 sm:mb-6 sm:text-base">{subtitle}</p>
          <div className="card !p-4 sm:!p-6">{children}</div>
        </div>
      </div>
    </div>
  );
}

export const Or = () => <div className="my-5 flex items-center gap-3 text-xs font-semibold uppercase text-slate-400"><span className="h-px flex-1 bg-brand-100" />or<span className="h-px flex-1 bg-brand-100" /></div>;
