import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import {AD_DAYS} from '../../data/vehicleOptions';
import {useT} from '../../i18n';

export default function Policies() {
    const t = useT();
    const sections: [string, string[]][] = [
        ['Using Vehicle Buddy', [
            'Vehicle Buddy is a place where owners advertise vehicles and people find them. We do not own, rent out, insure or inspect any vehicle.',
            'The rental itself - the price, the dates, the deposit, the condition and the paperwork - is an agreement only between the owner and the hirer. Please check the vehicle, the revenue licence and the insurance before you pay anything.',
            'Vehicle Buddy takes no commission and does not collect or handle any payment.',
        ]],
        ['Rules for ads', [
            'Only post vehicles you own or are allowed to advertise. Photos must show the real vehicle.',
            'Every ad needs the insurance expiry date, and the insurance must be valid. The ad is hidden automatically after that date.',
            `An ad stays online for ${AD_DAYS} days and is then removed automatically. The owner can renew it from My Ads, and can edit or delete it at any time.`,
            'Misleading, duplicate or illegal ads can be removed by the company without notice.',
        ]],
        ['Your data', [
            'We keep your name, email and phone number so you can sign in and so that people can call you about your ads. The phone number of an ad is public.',
            'Photos are stored on Cloudinary. When an ad is deleted or expires, its photos are deleted too.',
            'You can delete your account at any time from Account - your ads and photos are deleted with it. We never sell your data.',
        ]],
    ];
    return (
        <div className="flex min-h-screen flex-col">
            <Navbar/>
            <main className="w-full flex-1">
                <div className="bg-gradient-to-r from-navy-900 to-navy-600 py-8 sm:py-12">
                    <div className="mx-auto max-w-4xl px-4"><h1
                        className="text-2xl font-extrabold text-white sm:text-4xl">{t('Rules & Policies')}</h1></div>
                </div>
                <div className="mx-auto max-w-4xl space-y-5 px-4 py-8 sm:py-12">
                    {sections.map(([h, ps]) => (
                        <section key={h} className="card"><h2
                            className="text-lg font-extrabold text-navy-800">{t(h)}</h2>
                            <ul className="mt-2 list-disc space-y-2 pl-5 text-sm text-slate-600">{ps.map((p) => <li
                                key={p}>{t(p)}</li>)}</ul>
                        </section>
                    ))}
                </div>
            </main>
            <Footer/>
        </div>
    );
}
