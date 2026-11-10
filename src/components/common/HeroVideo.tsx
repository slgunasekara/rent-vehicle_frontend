import { useState } from 'react';
import { HERO_VIDEO_CLOUD, HERO_VIDEO_LOCAL } from '../../utils/cdn';

/**
 * The background video of the home page AND the sign-in pages (the same file, so changing the video changes both).
 * It plays from Cloudinary / VITE_HERO_VIDEO_URL when that exists; if it fails to load, the site's own /videos/hero.mp4 plays;
 * if that is missing too, the soft gradient behind it stays.
 */
export default function HeroVideo({ muted = true, className = '' }: { muted?: boolean; className?: string }) {
  const [src, setSrc] = useState(HERO_VIDEO_CLOUD || HERO_VIDEO_LOCAL);
  const [dead, setDead] = useState(false);
  if (dead) return null;
  return (
    <video
      className={`absolute inset-0 h-full w-full object-cover ${className}`}
      src={src}
      onError={() => { if (src !== HERO_VIDEO_LOCAL) setSrc(HERO_VIDEO_LOCAL); else setDead(true); }}
      autoPlay muted={muted} loop playsInline preload="auto" aria-hidden
    />
  );
}
