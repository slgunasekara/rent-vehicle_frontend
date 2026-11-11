import {useEffect, useState} from 'react';
import {GoogleLogin} from '@react-oauth/google';

export const GOOGLE_ID = (import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined) || '';

export default function GoogleSignIn({onCredential, text = 'continue_with'}: {
    onCredential: (c: string) => void;
    text?: 'signin_with' | 'signup_with' | 'continue_with'
}) {
    const [w, setW] = useState(() => Math.max(200, Math.min(320, (typeof window === 'undefined' ? 360 : window.innerWidth) - 88)));
    useEffect(() => {
        const f = () => setW(Math.max(200, Math.min(320, window.innerWidth - 88)));
        window.addEventListener('resize', f);
        return () => window.removeEventListener('resize', f);
    }, []);
    if (!GOOGLE_ID) {
        return <p
            className="rounded-xl border border-dashed border-brand-200 bg-brand-50 p-3 text-center text-xs text-slate-500">Google
            sign-in is not configured. Add VITE_GOOGLE_CLIENT_ID to the frontend .env file.</p>;
    }
    return (
        <div className="flex max-w-full justify-center overflow-hidden">
            <GoogleLogin onSuccess={(r) => r.credential && onCredential(r.credential)} onError={() => undefined}
                         text={text} shape="pill" theme="outline" size="large" width={String(w)}/>
        </div>
    );
}
