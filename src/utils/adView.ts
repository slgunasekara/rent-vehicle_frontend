import {useCallback, useSyncExternalStore} from 'react';


export type AdView = 'list' | 'large' | 'grid2' | 'grid3' | 'grid4';
export const AD_VIEWS: { key: AdView; label: string; hint: string; minWidth: number }[] = [
    {key: 'list', label: 'List', hint: 'Small photo, details beside it', minWidth: 0},
    {key: 'large', label: 'Large cards', hint: 'Big photos', minWidth: 0},
    {key: 'grid2', label: '2 per row', hint: 'Compact cards', minWidth: 0},
    {key: 'grid3', label: '3 per row', hint: 'Compact cards', minWidth: 768},
    {key: 'grid4', label: '4 per row', hint: 'Compact cards', minWidth: 1024},
];
const KEY = 'vb:view';
const EVENT = 'vb:view-changed';
const DEFAULT: AdView = 'list';

const read = (): AdView => {
    try {
        const v = localStorage.getItem(KEY) as AdView | null;
        return v && AD_VIEWS.some((x) => x.key === v) ? v : DEFAULT;
    } catch {
        return DEFAULT;
    }
};
const subscribe = (cb: () => void) => {
    window.addEventListener(EVENT, cb);
    window.addEventListener('storage', cb);
    return () => {
        window.removeEventListener(EVENT, cb);
        window.removeEventListener('storage', cb);
    };
};

export function useAdView(): [AdView, (v: AdView) => void] {
    const view = useSyncExternalStore(subscribe, read, () => DEFAULT);
    const set = useCallback((v: AdView) => {
        try {
            localStorage.setItem(KEY, v);
        } catch { /* private mode: the choice just is not remembered */
        }
        window.dispatchEvent(new Event(EVENT));
    }, []);
    return [view, set];
}

export function useMinWidth(px: number): boolean {
    const sub = useCallback((cb: () => void) => {
        const m = window.matchMedia(`(min-width: ${px}px)`);
        m.addEventListener('change', cb);
        return () => m.removeEventListener('change', cb);
    }, [px]);
    return useSyncExternalStore(sub, () => window.matchMedia(`(min-width: ${px}px)`).matches, () => true);
}

export function useEffectiveView(): AdView {
    const [view] = useAdView();
    const w768 = useMinWidth(768), w1024 = useMinWidth(1024);
    const need = AD_VIEWS.find((v) => v.key === view)?.minWidth ?? 0;
    return need > 1023 && !w1024 ? 'list' : need > 767 && !w768 ? 'list' : view;
}
