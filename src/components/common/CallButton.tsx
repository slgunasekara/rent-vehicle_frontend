import {useState} from 'react';
import {Phone} from 'lucide-react';

const isPhone = (): boolean =>
    typeof navigator !== 'undefined' && (/Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent) || (typeof window !== 'undefined' && !!window.matchMedia?.('(pointer: coarse)').matches));


export default function CallButton({phone, label = 'Call owner', className = 'btn-ghost'}: {
    phone: string;
    label?: string;
    className?: string
}) {
    const [shown, setShown] = useState(false);
    if (isPhone()) {
        return <a className={className} href={`tel:${phone.replace(/\s+/g, '')}`}><Phone className="h-4 w-4"/> {label}
        </a>;
    }
    return (
        <button type="button" className={className} onClick={() => setShown((s) => !s)} aria-expanded={shown}>
            <Phone className="h-4 w-4"/> {shown ?
            <span className="select-all font-bold tracking-wide">{phone}</span> : label}
        </button>
    );
}
