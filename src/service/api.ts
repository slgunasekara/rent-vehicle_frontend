import axios, {AxiosError, InternalAxiosRequestConfig} from 'axios';

const RAW_API = (import.meta.env.VITE_API_URL as string | undefined) || 'http://localhost:5000/api';

function fixLocalhost(u: string): string {
    try {
        const here = window.location.hostname;
        const a = new URL(u);
        if ((a.hostname === 'localhost' || a.hostname === '127.0.0.1') && here !== 'localhost' && here !== '127.0.0.1') {
            a.hostname = here;
            return a.toString().replace(/\/$/, '');
        }
    } catch { /* keep as it is */
    }
    return u;
}

export const API_URL = fixLocalhost(RAW_API);

const ACCESS = 'fv_access';
const REFRESH = 'fv_refresh';

export const tokens = {
    get access() {
        return localStorage.getItem(ACCESS);
    },
    get refresh() {
        return localStorage.getItem(REFRESH);
    },
    set(a: string, r: string) {
        localStorage.setItem(ACCESS, a);
        localStorage.setItem(REFRESH, r);
    },
    clear() {
        localStorage.removeItem(ACCESS);
        localStorage.removeItem(REFRESH);
    },
};

export const api = axios.create({baseURL: API_URL});

let refreshing: Promise<string> | null = null;

const expiresIn = (jwt: string | null): number => {
    try {
        return JSON.parse(atob((jwt as string).split('.')[1].replace(/-/g, '+').replace(/_/g, '/'))).exp * 1000 - Date.now();
    } catch {
        return Infinity;
    }
};
const AUTH_URL = /\/auth\/(login|register|google|refresh)/;

function refreshRefused(e: unknown): void {
    const st = (e as AxiosError).response?.status;
    if (st === 400 || st === 401 || (e as Error).message === 'no refresh token') {
        tokens.clear();
        window.dispatchEvent(new Event('fv:logout'));
    }
}

api.interceptors.request.use(async (cfg: InternalAxiosRequestConfig) => {
    if (!AUTH_URL.test(cfg.url ?? '') && tokens.access && expiresIn(tokens.access) < 10_000) {
        if (tokens.refresh && expiresIn(tokens.refresh) > 10_000) {
            try {
                refreshing = refreshing ?? doRefresh().finally(() => {
                    refreshing = null;
                });
                await refreshing;
            } catch (e) {
                refreshRefused(e);
            }
        } else if (tokens.refresh) {
            tokens.clear();
            window.dispatchEvent(new Event('fv:logout'));
        }
    }
    const t = tokens.access;
    if (t) cfg.headers.Authorization = `Bearer ${t}`;
    return cfg;
});

async function doRefresh(): Promise<string> {
    const rt = tokens.refresh;
    if (!rt) throw new Error('no refresh token');
    const {data} = await axios.post(`${API_URL}/auth/refresh`, {refreshToken: rt});
    tokens.set(data.data.accessToken, data.data.refreshToken);
    return data.data.accessToken as string;
}

api.interceptors.response.use(
    (r) => r,
    async (error: AxiosError<{ code?: string }>) => {
        const cfg = error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined;
        if (error.response?.status === 401 && cfg && !cfg._retry && tokens.refresh && !/\/auth\/(login|register|google|refresh)/.test(cfg.url ?? '')) {
            cfg._retry = true;
            try {
                refreshing = refreshing ?? doRefresh().finally(() => {
                    refreshing = null;
                });
                const newToken = await refreshing;
                cfg.headers.Authorization = `Bearer ${newToken}`;
                return api(cfg);
            } catch (e) {
                refreshRefused(e);
            }
        }
        return Promise.reject(error);
    }
);

export const errMsg = (e: unknown, fallback = 'Something went wrong'): string => {
    const ae = e as AxiosError<{ message?: string }>;
    return ae.response?.data?.message || ae.message || fallback;
};
