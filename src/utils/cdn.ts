/**
 * Photos and the home video live on Cloudinary (free CDN) - the ad photos are uploaded by the server.
 * The home / sign-in video: set VITE_HERO_VIDEO_URL to any video address, or upload yours once with
 * `npm run upload:assets` (in backend) and it plays from Cloudinary; if neither is there, the site's own /videos/hero.mp4 plays.
 */
export const CLOUD_NAME = (import.meta.env.VITE_CLOUDINARY_CLOUD_NAME as string | undefined) || '';
const CUSTOM = (import.meta.env.VITE_HERO_VIDEO_URL as string | undefined) || '';

export const HERO_VIDEO_CLOUD = CUSTOM || (CLOUD_NAME ? `https://res.cloudinary.com/${CLOUD_NAME}/video/upload/f_auto,q_auto/findvehicle/hero.mp4` : '');
export const HERO_VIDEO_LOCAL = '/videos/hero.mp4';
