import {createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState} from 'react';
import {Moon, Sun} from 'lucide-react';
import {useT} from '../i18n';

export type Theme = 'light' | 'dark';
const KEY = 'fv_theme';

const initial = (): Theme => {
    try {
        const saved = localStorage.getItem(KEY);
        if (saved === 'light' || saved === 'dark') return saved;
    } catch { /* storage blocked */
    }
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

const Ctx = createContext<{ theme: Theme; toggle: () => void }>({theme: 'light', toggle: () => undefined});

export function ThemeProvider({children}: { children: ReactNode }) {
    const [theme, setTheme] = useState<Theme>(initial);

    useEffect(() => {
        document.documentElement.classList.toggle('dark', theme === 'dark');
        document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#07142a' : '#eef2f8');
        try {
            localStorage.setItem(KEY, theme);
        } catch { /* ignore */
        }
    }, [theme]);

    const toggle = useCallback(() => setTheme((t) => (t === 'dark' ? 'light' : 'dark')), []);
    const value = useMemo(() => ({theme, toggle}), [theme, toggle]);
    return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useTheme = () => useContext(Ctx);

export function ThemeToggle({glass = false, className = ''}: { glass?: boolean; className?: string }) {
    const {theme, toggle} = useTheme();
    const t = useT();
    const dark = theme === 'dark';
    return (
        <button
            type="button"
            onClick={toggle}
            aria-label={dark ? t('Switch to light mode') : t('Switch to dark mode')}
            title={dark ? t('Light mode') : t('Dark mode')}
            className={`group relative grid h-10 w-10 place-items-center rounded-xl border transition duration-200 active:scale-90 ${glass ? 'border-white/30 bg-white/10 text-white hover:bg-white/20' : 'border-brand-200 bg-white text-navy-700 hover:border-brand-400 hover:bg-brand-50'} ${className}`}
        >
            <Sun
                className={`absolute h-[18px] w-[18px] transition duration-300 ${dark ? 'rotate-0 scale-100 opacity-100' : 'rotate-90 scale-0 opacity-0'}`}/>
            <Moon
                className={`absolute h-[18px] w-[18px] transition duration-300 ${dark ? '-rotate-90 scale-0 opacity-0' : 'rotate-0 scale-100 opacity-100'}`}/>
        </button>
    );
}
