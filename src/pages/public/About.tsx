import {Link} from 'react-router-dom';
import {CarFront, Handshake, PhoneCall, PlusCircle, Search, ShieldCheck, Timer, Wallet} from 'lucide-react';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import {CATEGORIES} from '../../data/vehicleOptions';
import {useT} from '../../i18n';

export default function About() {
    const t = useT();
    const points = [
        {
            i: Search,
            h: 'Search the way you think',
            d: 'Filter by vehicle type, make, model, fuel, with or without driver, condition, city and daily or monthly price.'
        },
        {
            i: PhoneCall,
            h: 'Call the owner',
            d: 'Every ad shows the owner\'s own phone number. You talk, agree the price and the dates, and that is it.'
        },
        {
            i: Wallet,
            h: 'No commission',
            d: 'Vehicle Buddy does not handle payments and takes no cut. The price you agree with the owner is the price you pay.'
        },
        {
            i: ShieldCheck,
            h: 'Insurance checked',
            d: 'Every ad must have the vehicle\'s insurance expiry date. The moment the insurance runs out, the ad is hidden.'
        },
        {
            i: Timer,
            h: 'Always fresh',
            d: 'Ads stay online for 60 days and are then removed automatically, so you do not call about vehicles that are long gone.'
        },
        {
            i: Handshake,
            h: 'Free for owners',
            d: 'Anyone can post an ad for free, it goes live at once, and the owner can edit or delete it at any time.'
        },
    ];
    return (
        <div className="flex min-h-screen flex-col">
            <Navbar/>
            <main className="w-full flex-1">
                <div className="bg-gradient-to-r from-navy-900 to-navy-600 py-8 sm:py-12">
                    <div className="mx-auto max-w-6xl px-4">
                        <p className="text-sm font-bold uppercase tracking-widest text-aqua-300">Vehicle Buddy</p>
                        <h1 className="mt-1 text-2xl font-extrabold text-white sm:text-4xl">{t('About us')}</h1>
                        <p className="mt-2 max-w-2xl text-white/75">{t('Vehicle Buddy connects people who need a vehicle with the people who own one - all over Sri Lanka, directly, with nobody in between.')}</p>
                    </div>
                </div>
                <div className="mx-auto max-w-6xl space-y-8 px-4 py-8 sm:py-12">
                    <div className="card">
                        <h2 className="text-xl font-extrabold text-navy-800">{t('What is Vehicle Buddy?')}</h2>
                        <p className="mt-2 text-slate-600">{t('It is a vehicle hire website. Owners of cars, SUVs, vans, buses, lorries, motorbikes, three wheelers, pickups and heavy-duty vehicles post a free ad. People looking to rent search, compare and call the owner. We only show the ads - the deal is between you and the owner.')}</p>
                        <div className="mt-4 flex flex-wrap gap-2">{CATEGORIES.map((c) => <Link key={c.key}
                                                                                                to={`/find?category=${c.key}`}
                                                                                                className="badge bg-brand-50 !px-3 !py-1.5 text-brand-700 hover:bg-brand-100"><CarFront
                            className="h-3.5 w-3.5"/> {t(c.label)}</Link>)}</div>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {points.map(({i: I, h, d}) => (
                            <div key={h} className="card lift"><span
                                className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-brand-500 to-navy-600 text-white shadow-soft"><I
                                className="h-5 w-5"/></span><p className="mt-3 font-extrabold text-navy-800">{t(h)}</p>
                                <p className="mt-1 text-sm text-slate-600">{t(d)}</p></div>
                        ))}
                    </div>
                    <div className="card">
                        <h2 className="text-xl font-extrabold text-navy-800">{t('Frequently asked questions')}</h2>
                        <dl className="mt-3 divide-y divide-brand-100 text-sm">
                            {[
                                ['How do I rent a vehicle?', 'Search, open an ad and call the owner (or message on WhatsApp). Agree the price, the dates and the pick-up with the owner.'],
                                ['Do I pay Vehicle Buddy anything?', 'No. There is no booking fee and no commission. You pay the owner only, the way you agree with the owner.'],
                                ['How do I post an ad?', 'Create a free account, press Post an Ad, fill in the form and add photos. It is online immediately.'],
                                ['Why did my ad disappear?', 'Ads stay online for 60 days, and are hidden when the insurance expires. Open My Ads to renew it or enter the new insurance date.'],
                                ['Can I delete my ad?', 'Yes, at any time, from My Ads. You can also delete your whole account.'],
                            ].map(([q, a]) => <div key={q} className="py-3">
                                <dt className="font-bold text-navy-800">{t(q)}</dt>
                                <dd className="mt-1 text-slate-600">{t(a)}</dd>
                            </div>)}
                        </dl>
                    </div>
                    <div className="text-center"><Link to="/post" className="btn-primary"><PlusCircle
                        className="h-4 w-4"/> {t('Post a free ad')}</Link></div>
                </div>
            </main>
            <Footer/>
        </div>
    );
}
