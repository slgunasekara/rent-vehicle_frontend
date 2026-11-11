import {createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState} from 'react';
import si from './si';
import ta from './ta';

export type Lang = 'en' | 'si' | 'ta';
export const LANGS: { code: Lang; label: string; short: string }[] = [
    {code: 'en', label: 'English', short: 'EN'},
    {code: 'si', label: 'සිංහල', short: 'සිං'},
    {code: 'ta', label: 'தமிழ்', short: 'த'},
];

const KEY = 'fv_lang';
const DICT: Record<Lang, Record<string, string>> = {en: {}, si, ta};

const initial = (): Lang => {
    try {
        const saved = localStorage.getItem(KEY);
        if (saved === 'en' || saved === 'si' || saved === 'ta') return saved;
    } catch { /* storage blocked */
    }
    return 'en';
};

export type TFn = (text: string, vars?: Record<string, string | number>) => string;

const fill = (s: string, vars?: Record<string, string | number>): string =>
    vars ? s.replace(/\{(\w+)\}/g, (m, k: string) => (k in vars ? String(vars[k]) : m)) : s;

interface Ctx {
    lang: Lang;
    setLang: (l: Lang) => void;
    t: TFn
}

const I18nCtx = createContext<Ctx>({lang: 'en', setLang: () => undefined, t: (s, v) => fill(s, v)});


export function I18nProvider({children}: { children: ReactNode }) {
    const [lang, setLangState] = useState<Lang>(initial);

    useEffect(() => {
        document.documentElement.lang = lang;
        try {
            localStorage.setItem(KEY, lang);
        } catch { /* ignore */
        }
    }, [lang]);

    const t = useCallback<TFn>((text, vars) => fill(DICT[lang][text] ?? text, vars), [lang]);
    const value = useMemo(() => ({lang, setLang: setLangState, t}), [lang, t]);
    return <I18nCtx.Provider value={value}>{children}</I18nCtx.Provider>;
}

export const useT = (): TFn => useContext(I18nCtx).t;
export const useLang = () => {
    const {lang, setLang} = useContext(I18nCtx);
    return {lang, setLang};
};
