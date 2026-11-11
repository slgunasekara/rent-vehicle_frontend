import toast from 'react-hot-toast';
import {Star, Upload, X} from 'lucide-react';
import {fileToDataUrl, photo} from '../../utils/format';
import {MAX_PHOTOS} from '../../data/vehicleOptions';
import {useT} from '../../i18n';


export default function PhotoPicker({images, onChange}: { images: string[]; onChange: (next: string[]) => void }) {
    const t = useT();

    const pick = async (files: FileList | null) => {
        if (!files || files.length === 0) return;
        const room = MAX_PHOTOS - images.length;
        if (room <= 0) {
            toast.error(t('You can add up to {n} photos', {n: MAX_PHOTOS}));
            return;
        }
        const chosen = Array.from(files).filter((x) => x.type.startsWith('image/'));
        if (chosen.length > room) toast(t('Only the first {n} photos were added (limit is {max})', {
            n: room,
            max: MAX_PHOTOS
        }));
        try {
            const added = await Promise.all(chosen.slice(0, room).map((x) => fileToDataUrl(x, 1200, 0.78)));
            onChange([...images, ...added].slice(0, MAX_PHOTOS));
        } catch {
            toast.error(t('Could not read that image'));
        }
    };

    return (
        <div>
            <span className="label">{t('Photos')} <span className="text-red-500"
                                                        aria-hidden>*</span> ({images.length}/{MAX_PHOTOS})</span>
            {images.length > 0 && (
                <div className="mb-2 grid grid-cols-3 gap-2 sm:grid-cols-4">
                    {images.map((src, i) => (
                        <div key={i} className="group relative aspect-[4/3] overflow-hidden rounded-lg bg-[#14172b]">
                            <img src={photo(src)} alt="" className="h-full w-full object-cover"/>
                            {i === 0 && <span
                                className="absolute left-1 top-1 rounded bg-brand-500 px-1.5 py-0.5 text-[10px] font-bold text-white">{t('Cover')}</span>}
                            <button type="button" onClick={() => onChange(images.filter((_, k) => k !== i))}
                                    className="absolute right-1 top-1 grid h-6 w-6 place-items-center rounded-full bg-black/65 text-white hover:bg-red-600"
                                    aria-label={t('Remove photo')}><X className="h-3.5 w-3.5"/></button>
                            {i > 0 && <button type="button"
                                              onClick={() => onChange([images[i], ...images.filter((_, k) => k !== i)])}
                                              className="absolute inset-x-1 bottom-1 flex items-center justify-center gap-1 rounded bg-black/65 py-0.5 text-[10px] font-bold text-white opacity-100 transition hover:bg-brand-600 sm:opacity-0 sm:group-hover:opacity-100">
                                <Star className="h-3 w-3"/> {t('Make cover')}</button>}
                        </div>
                    ))}
                </div>
            )}
            {images.length < MAX_PHOTOS && (
                <label
                    className="flex cursor-pointer items-center gap-3 rounded-xl border-2 border-dashed border-brand-200 bg-brand-50/50 p-3 hover:border-brand-400">
                    <Upload className="h-6 w-6 text-brand-500"/>
                    <span
                        className="text-sm text-slate-600">{images.length ? t('Add more photos') : t('Upload photos of your vehicle (at least 1)')}</span>
                    <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => {
                        void pick(e.target.files);
                        e.target.value = '';
                    }}/>
                </label>
            )}
            <p className="mt-1 text-xs text-slate-500">{t('The first photo is the cover on the card. Clear photos get more calls.')}</p>
        </div>
    );
}
