import type {VehicleCardT} from '../../types';
import VehicleCard from './VehicleCard';

export default function AdRow({title, ads}: { title: string; ads: VehicleCardT[] }) {
    if (!ads.length) return null;
    return (
        <section className="lg:col-span-2" aria-label={title}>
            <h2 className="mb-3 text-lg font-extrabold text-navy-800">{title}</h2>
            <div className="-mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-2 [scrollbar-width:thin] sm:mx-0 sm:px-0">
                {ads.map((v) => <div key={v._id} className="w-[11.5rem] shrink-0 snap-start sm:w-56"><VehicleCard v={v}
                                                                                                                  variant="grid"/>
                </div>)}
            </div>
        </section>
    );
}
