import {useEffect, useRef, useState} from 'react';
import {Link, useNavigate} from 'react-router-dom';
import {
    ArrowRight,
    CarFront,
    MapPin,
    PhoneCall,
    PlusCircle,
    Search,
    ShieldCheck,
    Timer,
    Volume2,
    VolumeX,
    Users,
    Wallet
} from 'lucide-react';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import HeroVideo from '../../components/common/HeroVideo';
import CountUp from '../../components/common/CountUp';
import CategoryTiles from '../../components/vehicle/CategoryTiles';
import FilterPanel from '../../components/vehicle/FilterPanel';
import AdGrid from '../../components/vehicle/AdGrid';
import {Spinner} from '../../components/common/ui';
import {api} from '../../service/api';
import {EMPTY_FILTERS, Filters, toParams} from '../../utils/filters';
import type {VehicleCardT} from '../../types';
import {useReveal} from '../../hooks/useReveal';
import {useT} from '../../i18n';
import {AD_DAYS} from '../../data/vehicleOptions';

interface Stats {
    vehicles: number;
    users: number;
    cities: number;
    byCategory: Record<string, number>
}

export default function Home() {
    const t = useT();
    const nav = useNavigate();
    const [f, setF] = useState<Filters>(EMPTY_FILTERS);
    const [muted, setMuted] = useState(true);
    const [stats, setStats] = useState<Stats | null>(null);
    const [latest, setLatest] = useState<VehicleCardT[] | null>(null);
    const loaded = useRef(false);

    useEffect(() => {
        if (loaded.current) return;
        loaded.current = true;
        api.get('/stats/public').then((r) => setStats(r.data.data)).catch(() => undefined);
        api.get('/vehicles').then((r) => setLatest((r.data.data as VehicleCardT[]).slice(0, 8))).catch(() => setLatest([]));
    }, []);
    useReveal([latest?.length, stats?.vehicles]);

    const go = () => nav(`/find?${toParams(f).toString()}`);

    return (
        <div>
            <section
                className="relative flex min-h-[100svh] items-center overflow-hidden bg-gradient-to-br from-navy-950 via-navy-800 to-brand-600">
                <HeroVideo muted={muted}/>
                <div className="absolute inset-0 bg-gradient-to-b from-navy-950/75 via-navy-900/45 to-navy-950/85"/>
                <Navbar overlay/>
                <div className="hero-wrap relative z-10 mx-auto w-full max-w-5xl px-4 pb-16 pt-28 sm:pt-32">
                    <div className="animate-rise text-center text-white">
                        <span className="badge bg-white/15 text-aqua-300 backdrop-blur"><MapPin
                            className="h-3.5 w-3.5"/> {t('Vehicle hire across Sri Lanka')}</span>
                        <h1 className="hero-title mt-4 text-[2rem] font-extrabold leading-[1.12] sm:text-6xl sm:leading-[1.1]">{t('Rent any vehicle,')}
                            <span
                                className="bg-gradient-to-r from-aqua-300 to-brand-400 bg-clip-text text-transparent">{t('straight from the owner')}</span>
                        </h1>
                        <p className="hero-sub mx-auto mt-3 max-w-2xl text-base text-white/80 sm:mt-5 sm:text-lg">{t('Cars, SUVs, vans, buses, lorries and more. Pick a city, compare prices and call the owner. No middleman, no commission.')}</p>
                    </div>
                    <div className="hero-filter mt-7 animate-rise text-left sm:mt-10" style={{animationDelay: '.15s'}}>
                        <FilterPanel value={f} onChange={setF} onSubmit={go}/>
                    </div>
                </div>
                <button onClick={() => setMuted((m) => !m)}
                        className="absolute bottom-4 right-20 z-10 rounded-full bg-white/15 p-2.5 text-white backdrop-blur hover:bg-white/25 sm:bottom-5 sm:right-24"
                        aria-label={muted ? t('Unmute video') : t('Mute video')}>
                    {muted ? <VolumeX className="h-5 w-5"/> : <Volume2 className="h-5 w-5"/>}
                </button>
            </section>

            <section className="mx-auto max-w-7xl px-4 py-10 sm:py-14">
                <div className="reveal">
                    <h2 className="mb-1 text-xl font-extrabold text-navy-800 sm:text-3xl">{t('What do you want to rent?')}</h2>
                    <p className="mb-5 text-sm text-slate-500">{t('Choose a type to see every ad of it.')}</p>
                    <CategoryTiles counts={stats?.byCategory}/>
                </div>
            </section>

            {stats && (
                <section
                    className="border-y border-white/10 bg-gradient-to-r from-navy-950 via-navy-800 to-navy-950 text-white"
                    aria-label="Vehicle Buddy in numbers">
                    <div
                        className="mx-auto grid max-w-5xl grid-cols-3 divide-x divide-white/10 px-2 py-6 text-center sm:px-4 sm:py-8">
                        {[{icon: CarFront, value: stats.vehicles, label: t('Vehicles')}, {
                            icon: MapPin,
                            value: stats.cities,
                            label: t('Cities')
                        }, {icon: Users, value: stats.users, label: t('Members')}].map(({icon: I, value, label}) => (
                            <div key={label} className="min-w-0 px-1.5 sm:px-2">
                                <I className="mx-auto h-5 w-5 text-aqua-400 sm:h-6 sm:w-6"/>
                                <p className="mt-1.5 text-[1.45rem] font-extrabold tabular-nums leading-tight sm:mt-2 sm:text-5xl">
                                    <CountUp to={value}/></p>
                                <p className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-white/60 sm:text-sm sm:tracking-widest">{label}</p>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            <section className="mx-auto max-w-7xl px-4 py-10 sm:py-14">
                <div className="mb-5 flex flex-wrap items-end justify-between gap-2">
                    <div><h2 className="text-xl font-extrabold text-navy-800 sm:text-3xl">{t('Latest ads')}</h2><p
                        className="text-sm text-slate-500">{t('Freshly posted by owners near you.')}</p></div>
                    <Link to="/find" className="btn-ghost">{t('See all vehicles')} <ArrowRight
                        className="h-4 w-4"/></Link>
                </div>
                {latest === null ? <Spinner/> : latest.length === 0 ? (
                    <div className="card text-center"><p
                        className="font-semibold text-navy-800">{t('No ads yet - be the first to post one!')}</p><Link
                        to="/post" className="btn-primary mt-3"><PlusCircle className="h-4 w-4"/> {t('Post an Ad')}
                    </Link></div>
                ) : (
                    <AdGrid ads={latest} className="reveal"/>
                )}
            </section>

            <section className="bg-gradient-to-b from-navy-950 to-navy-800 py-12 text-white sm:py-20">
                <div className="mx-auto max-w-7xl px-4">
                    <div className="reveal text-center">
                        <p className="text-sm font-bold uppercase tracking-widest text-aqua-400">{t('How it works')}</p>
                        <h2 className="mt-3 text-2xl font-extrabold sm:text-4xl">{t('Three steps. No fees.')}</h2>
                    </div>
                    <div className="reveal mt-8 grid gap-4 sm:grid-cols-3">
                        {[
                            {
                                i: Search,
                                h: 'Search',
                                d: 'Filter by type, make, fuel, driver, condition, city and price.'
                            },
                            {
                                i: PhoneCall,
                                h: 'Call the owner',
                                d: 'Every ad shows the owner\'s phone number. Agree the price and the dates directly.'
                            },
                            {
                                i: Wallet,
                                h: 'Pay the owner only',
                                d: 'Vehicle Buddy takes no commission. What you agree with the owner is all you pay.'
                            },
                        ].map(({i: I, h, d}, n) => (
                            <div key={h}
                                 className="tilt rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur">
                                <div className="flex items-center gap-3"><span
                                    className="grid h-10 w-10 place-items-center rounded-xl bg-aqua-400/20 text-aqua-300"><I
                                    className="h-5 w-5"/></span><span
                                    className="text-3xl font-extrabold text-white/20">0{n + 1}</span></div>
                                <p className="mt-3 text-lg font-bold">{t(h)}</p><p
                                className="mt-1 text-sm text-white/65">{t(d)}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="mx-auto max-w-7xl px-4 py-12 sm:py-16">
                <div
                    className="reveal grid items-center gap-6 overflow-hidden rounded-3xl bg-gradient-to-r from-navy-800 to-brand-600 p-6 text-white shadow-soft sm:p-10 lg:grid-cols-[1.4fr_1fr]">
                    <div>
                        <h2 className="text-2xl font-extrabold sm:text-3xl">{t('Own a vehicle? Put it to work.')}</h2>
                        <p className="mt-2 max-w-xl text-white/80">{t('Post a free ad in two minutes. It stays online for {n} days, people call you directly, and you can delete it any time.', {n: AD_DAYS})}</p>
                        <Link to="/post" className="btn mt-5 bg-white text-navy-800 hover:bg-brand-50"><PlusCircle
                            className="h-4 w-4"/> {t('Post a free ad')}</Link>
                    </div>
                    <ul className="space-y-2.5 text-sm">
                        {[{i: ShieldCheck, t: 'Free to publish, no approval wait'}, {
                            i: Timer,
                            t: 'Auto-removed after 60 days, renew in one tap'
                        }, {i: PhoneCall, t: 'Customers call your own number'}].map(({i: I, t: text}) => (
                            <li key={text} className="flex items-center gap-3"><span
                                className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white/15"><I
                                className="h-4 w-4 text-aqua-300"/></span>{t(text)}</li>
                        ))}
                    </ul>
                </div>
            </section>
            <Footer/>
        </div>
    );
}
