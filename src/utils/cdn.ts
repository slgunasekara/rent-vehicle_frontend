export const CLOUD_NAME = (import.meta.env.VITE_CLOUDINARY_CLOUD_NAME as string | undefined) || '';
const CUSTOM = (import.meta.env.VITE_HERO_VIDEO_URL as string | undefined) || '';

export const HERO_VIDEO_CLOUD = CUSTOM || (CLOUD_NAME ? `https://res.cloudinary.com/${CLOUD_NAME}/video/upload/f_auto,q_auto/findvehicle/hero.mp4` : '');
export const HERO_VIDEO_LOCAL = '/videos/hero.mp4';
