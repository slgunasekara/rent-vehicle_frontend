import { Link } from 'react-router-dom';
import { Mail, Phone } from 'lucide-react';
import Logo from './Logo';
import { useT } from '../../i18n';
import { COMPANY } from '../../utils/format';

export default function Footer() {
  const t = useT();
  const li = 'hover:text-aqua-400';
  return (
    <footer className="no-print bg-navy-950 text-white/80">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 md:grid-cols-4">
        <div className="md:col-span-2">
          <Logo light />
          <p className="mt-3 max-w-sm text-sm text-white/60">{t('Rent cars, SUVs, vans, buses, lorries and more from owners all over Sri Lanka. Call the owner directly - no middleman, no commission.')}</p>
        </div>
        <div>
          <p className="mb-3 text-sm font-bold text-white">{t('Explore')}</p>
          <ul className="space-y-2 text-sm">
            <li><Link className={li} to="/find">{t('Find Vehicles')}</Link></li>
            <li><Link className={li} to="/post">{t('Post an Ad')}</Link></li>
            <li><Link className={li} to="/my-ads">{t('My Ads')}</Link></li>
            <li><Link className={li} to="/about">{t('About Us')}</Link></li>
            <li><Link className={li} to="/policies">{t('Rules & Policies')}</Link></li>
          </ul>
        </div>
        <div>
          <p className="mb-3 text-sm font-bold text-white">{t('Contact')}</p>
          <ul className="space-y-2 text-sm">
            <li><Link className={li} to="/contact">{t('Send us a message')}</Link></li>
            <li><a className={`${li} flex items-center gap-2`} href={`tel:${COMPANY.phone}`}><Phone className="h-4 w-4" /> {COMPANY.phone}</a></li>
            <li><a className={`${li} flex items-center gap-2 break-all`} href={`mailto:${COMPANY.email}`}><Mail className="h-4 w-4 shrink-0" /> {COMPANY.email}</a></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 px-4 py-4 text-center text-xs text-white/50">© {new Date().getFullYear()} Vehicle Buddy · {t('Owners and hirers agree the price directly. Vehicle Buddy takes no commission.')}</div>
    </footer>
  );
}
