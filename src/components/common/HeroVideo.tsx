import {useState} from 'react';
import {HERO_VIDEO_CLOUD, HERO_VIDEO_LOCAL} from '../../utils/cdn';


export default function HeroVideo({muted = true, className = ''}: { muted?: boolean; className?: string }) {
    const [src, setSrc] = useState(HERO_VIDEO_CLOUD || HERO_VIDEO_LOCAL);
    const [dead, setDead] = useState(false);
    if (dead) return null;
    return (
        <video
            className={`absolute inset-0 h-full w-full object-cover ${className}`}
            src={src}
            onError={() => {
                if (src !== HERO_VIDEO_LOCAL) setSrc(HERO_VIDEO_LOCAL); else setDead(true);
            }}
            autoPlay muted={muted} loop playsInline preload="auto" aria-hidden
        />
    );
}
