import {useEffect, useState} from 'react';
import {Link} from 'react-router-dom';
import {Heart} from 'lucide-react';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import AdGrid from '../../components/vehicle/AdGrid';
import ViewMenu from '../../components/vehicle/ViewMenu';
import {Empty, Spinner} from '../../components/common/ui';
import {savedAds} from '../../service/engage';
import {errMsg} from '../../service/api';
import {useAppSelector} from '../../store';
import {useT} from '../../i18n';
import type {VehicleCardT} from '../../types';

export default function Saved() {
    const t = useT();
    const [list, setList] = useState<VehicleCardT[] | null>(null);
    const [err, setErr] = useState('');
    const ids = useAppSelector((s) => s.favorites.ids);
    useEffect(() => {
        savedAds().then(setList).catch((e) => {
            setErr(errMsg(e));
            setList([]);
        });
    }, []);
    const shown = list?.filter((v) => ids.includes(v._id));

    return (
        <div className="flex min-h-screen flex-col bg-surface">
            <Navbar/>
            <main className="w-full flex-1 mx-auto max-w-6xl px-4 py-6 sm:py-8">
                <div className="flex items-start justify-between gap-3"><h1
                    className="flex items-center gap-2 text-2xl font-extrabold text-navy-800 sm:text-3xl"><Heart
                    className="h-6 w-6 fill-rose-500 text-rose-500"/> {t('Saved Ads')}</h1>{!!shown?.length &&
                    <ViewMenu/>}</div>
                <p className="mb-6 mt-1 text-sm text-slate-500">{t('The vehicles you saved with the heart. Ads that ran out of time are removed from this list.')}</p>
                {err && <p className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{err}</p>}
                {!shown ? <Spinner/> : shown.length === 0 ? (
                    <Empty title={t('You have not saved any ads yet')}
                           hint={t('Tap the heart on an ad to keep it here.')}
                           action={<Link to="/find" className="btn-primary">{t('Find Vehicles')}</Link>}/>
                ) : (
                    <AdGrid ads={shown}/>
                )}
            </main>
            <Footer/>
        </div>
    );
}
