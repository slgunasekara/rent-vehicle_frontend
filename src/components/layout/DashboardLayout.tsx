import {useCallback, useEffect, useState} from 'react';
import {NavLink, Outlet, useLocation, useNavigate} from 'react-router-dom';
import type {LucideIcon} from 'lucide-react';
import {LayoutDashboard, CarFront, Users, Inbox, Flag, Wallet, ShieldCheck, LogOut, Menu, X, Globe} from 'lucide-react';
import LanguageMenu from './LanguageMenu';
import {ThemeToggle} from '../../context/ThemeContext';
import Logo from './Logo';
import {useAppDispatch, useAppSelector} from '../../store';
import {logoutUser} from '../../store/authSlice';
import {api} from '../../service/api';

interface NavItem {
    to: string;
    label: string;
    icon: LucideIcon;
    end?: boolean;
    badge?: 'messages' | 'reports'
}

const ADMIN: NavItem[] = [
    {to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true},
    {to: '/admin/ads', label: 'All Ads', icon: CarFront},
    {to: '/admin/users', label: 'Users', icon: Users},
    {to: '/admin/admins', label: 'Admins', icon: ShieldCheck},
    {to: '/admin/messages', label: 'Contact Messages', icon: Inbox, badge: 'messages'},
    {to: '/admin/reports', label: 'Reported Ads', icon: Flag, badge: 'reports'},
    {to: '/admin/payments', label: 'Top ad payments', icon: Wallet},
];

export default function DashboardLayout() {
    const user = useAppSelector((s) => s.auth.user)!;
    const d = useAppDispatch();
    const nav = useNavigate();
    const loc = useLocation();
    const [open, setOpen] = useState(false);
    const [counts, setCounts] = useState({messages: 0, reports: 0});
    const refresh = useCallback(() => {
        api.get('/admin/contact/unread-count').then((r) => setCounts((c) => ({
            ...c,
            messages: r.data.data.unread
        }))).catch(() => undefined);
        api.get('/admin/reports/open-count').then((r) => setCounts((c) => ({
            ...c,
            reports: r.data.data.open
        }))).catch(() => undefined);
    }, []);
    useEffect(() => {
        refresh();
    }, [refresh, loc.pathname]);
    useEffect(() => {
        const t = window.setInterval(refresh, 60_000);
        window.addEventListener('fv:messages-changed', refresh);
        window.addEventListener('fv:reports-changed', refresh);
        return () => {
            window.clearInterval(t);
            window.removeEventListener('fv:messages-changed', refresh);
            window.removeEventListener('fv:reports-changed', refresh);
        };
    }, [refresh]);

    const sidebar = (
        <aside
            className="flex h-full w-64 max-w-[85vw] flex-col bg-gradient-to-b from-navy-900 via-navy-800 to-navy-700 text-white">
            <div className="border-b border-white/10 px-5 py-5">
                <Logo light size={36} to="/admin"/>
                <p className="mt-1 pl-1 text-[11px] font-medium uppercase tracking-widest text-aqua-300/80">Company
                    Console</p>
            </div>
            <nav className="side-scroll flex-1 space-y-1 overflow-y-auto px-3 py-4" onClick={() => setOpen(false)}>
                {ADMIN.map(({to, label, icon: Icon, end, badge}) => (
                    <NavLink key={to} to={to} end={end}
                             className={({isActive}) => `flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition ${isActive ? 'bg-white/15 shadow-inner' : 'text-white/75 hover:bg-white/10 hover:text-white'}`}>
                        <Icon className="h-[18px] w-[18px]"/> {label}
                        {badge && counts[badge] > 0 && <span
                            className="ml-auto rounded-full bg-red-500 px-2 py-0.5 text-[11px] font-bold leading-none text-white">{counts[badge] > 99 ? '99+' : counts[badge]}</span>}
                    </NavLink>
                ))}
                <NavLink to="/"
                         className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-white/75 hover:bg-white/10"><Globe
                    className="h-[18px] w-[18px]"/> View website</NavLink>
            </nav>
            <div className="border-t border-white/10 p-4">
                <div className="mb-3 flex items-center gap-3 rounded-xl bg-white/10 p-3">
                    {user.avatar ?
                        <img src={user.avatar} alt="" className="h-9 w-9 rounded-full" referrerPolicy="no-referrer"/> :
                        <div
                            className="grid h-9 w-9 place-items-center rounded-full bg-brand-500 font-bold">{user.name[0]}</div>}
                    <div className="min-w-0"><p className="truncate text-sm font-bold">{user.name}</p><p
                        className="text-xs text-white/60">{user.position || 'Admin'}</p></div>
                </div>
                <button className="btn w-full border border-white/25 text-white hover:bg-white/10"
                        onClick={async () => {
                            await d(logoutUser());
                            nav('/');
                        }}><LogOut className="h-4 w-4"/> Logout
                </button>
            </div>
        </aside>
    );

    return (
        <div className="flex min-h-screen bg-surface">
            <div className="sticky top-0 hidden h-screen lg:block">{sidebar}</div>
            {open && (
                <div className="fixed inset-0 z-40 lg:hidden">
                    <div className="absolute inset-0 bg-navy-950/60" onClick={() => setOpen(false)}/>
                    <div className="relative h-full w-64 max-w-[85vw]">{sidebar}</div>
                </div>
            )}
            <div className="min-w-0 flex-1">
                <div
                    className="sticky top-0 z-30 flex items-center justify-between gap-2 border-b border-brand-100 bg-white/85 px-3 py-2.5 backdrop-blur sm:gap-3 sm:px-6 lg:px-8">
                    <div className="flex min-w-0 items-center gap-1.5 sm:gap-2 lg:hidden">
                        <button onClick={() => setOpen((o) => !o)} aria-label="Menu" aria-expanded={open}
                                className="grid h-10 w-10 shrink-0 place-items-center rounded-xl hover:bg-brand-50">{open ?
                            <X/> : <Menu/>}</button>
                        <div className="min-w-0"><Logo size={34} to="/admin" textClass="hidden sm:inline"/></div>
                    </div>
                    <div className="hidden lg:block"/>
                    <div className="flex shrink-0 items-center gap-1.5 sm:gap-3"><LanguageMenu/><ThemeToggle/></div>
                </div>
                <main className="mx-auto max-w-6xl p-4 sm:p-6 lg:p-8"><Outlet/></main>
            </div>
        </div>
    );
}
