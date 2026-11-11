import {useEffect, useRef, useState} from 'react';
import {Check, Copy, Facebook, MessageCircle, Share2} from 'lucide-react';
import toast from 'react-hot-toast';
import {shareUrl} from '../../service/extras';
import {useT} from '../../i18n';

export default function ShareMenu({id, title, price}: { id: string; title: string; price?: string }) {
    const t = useT();
    const [open, setOpen] = useState(false);
    const [copied, setCopied] = useState(false);
    const box = useRef<HTMLDivElement>(null);
    const url = shareUrl(id);
    const text = `${title}${price ? ` - ${price}` : ''} on Vehicle Buddy`;

    useEffect(() => {
        if (!open) return;
        const away = (e: PointerEvent) => {
            if (!box.current?.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener('pointerdown', away);
        return () => document.removeEventListener('pointerdown', away);
    }, [open]);

    const copy = async () => {
        try {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            toast.success(t('Link copied'));
            setTimeout(() => setCopied(false), 2000);
        } catch {
            window.prompt(t('Copy this link'), url);
        }
    };
    const native = typeof navigator !== 'undefined' && 'share' in navigator;
    const item = 'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-semibold text-navy-800 transition hover:bg-brand-50';

    return (
        <div ref={box} className="relative">
            <button type="button" onClick={() => setOpen((o) => !o)} aria-haspopup="menu" aria-expanded={open}
                    className="btn border border-brand-200 bg-white text-navy-800 hover:bg-brand-50">
                <Share2 className="h-4 w-4 text-brand-600"/> {t('Share')}
            </button>
            {open && (
                <div role="menu"
                     className="absolute left-0 z-30 mt-2 w-60 rounded-xl border border-brand-200 bg-white p-1 shadow-soft animate-rise sm:left-auto sm:right-0">
                    <a role="menuitem" className={item} target="_blank" rel="noopener noreferrer"
                       href={`https://wa.me/?text=${encodeURIComponent(`${text}\n${url}`)}`}
                       onClick={() => setOpen(false)}><MessageCircle className="h-5 w-5 text-emerald-500"/> WhatsApp</a>
                    <a role="menuitem" className={item} target="_blank" rel="noopener noreferrer"
                       href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`}
                       onClick={() => setOpen(false)}><Facebook className="h-5 w-5 text-blue-600"/> Facebook</a>
                    <button role="menuitem" className={item} onClick={copy}>{copied ?
                        <Check className="h-5 w-5 text-emerald-500"/> :
                        <Copy className="h-5 w-5 text-slate-500"/>} {t('Copy link')}</button>
                    {native && <button role="menuitem" className={item} onClick={() => {
                        void navigator.share({title: text, url}).catch(() => undefined);
                        setOpen(false);
                    }}><Share2 className="h-5 w-5 text-slate-500"/> {t('More options')}</button>}
                </div>
            )}
        </div>
    );
}
