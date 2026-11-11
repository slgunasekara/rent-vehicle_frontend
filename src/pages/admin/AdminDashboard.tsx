import { useEffect, useState } from 'react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Link } from 'react-router-dom';
import { CarFront, EyeOff, Flag, Inbox, TrendingUp, Users, UserPlus } from 'lucide-react';
import { PageHeader, Spinner, StatCard } from '../../components/common/ui';
import { api } from '../../service/api';
import { categoryPlural } from '../../utils/format';

interface Stats { users: number; newUsers: number; ads: number; live: number; hidden: number; newAds: number; unread: number; openReports: number; byCategory: { key: string; n: number }[]; byDistrict: { district: string; n: number }[]; perDay: { day: string; n: number }[] }

export function AdminDashboard() {
  const [s, setS] = useState<Stats | null>(null);
  useEffect(() => { api.get('/admin/stats').then((r) => setS(r.data.data)).catch(() => undefined); }, []);
  if (!s) return <Spinner />;
  return (
    <div>
      <PageHeader title="Company Console" subtitle="What is happening on Vehicle Buddy." />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-7">
        <StatCard icon={<CarFront className="h-5 w-5" />} label="Live ads" value={s.live} />
        <StatCard icon={<EyeOff className="h-5 w-5" />} label="Hidden ads" value={s.hidden} tone="navy" />
        <StatCard icon={<TrendingUp className="h-5 w-5" />} label="New ads (7 days)" value={s.newAds} tone="aqua" />
        <StatCard icon={<Users className="h-5 w-5" />} label="Members" value={s.users} tone="green" />
        <StatCard icon={<UserPlus className="h-5 w-5" />} label="New members (7 days)" value={s.newUsers} tone="aqua" />
        <StatCard icon={<Inbox className="h-5 w-5" />} label="Unread messages" value={s.unread} tone="navy" />
        <Link to="/admin/reports" className="contents"><StatCard icon={<Flag className="h-5 w-5" />} label="Open reports" value={s.openReports} tone={s.openReports ? 'aqua' : 'green'} /></Link>
      </div>
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <div className="card">
          <h2 className="mb-3 font-extrabold text-navy-800">Ads posted - last 14 days</h2>
          <div className="h-64"><ResponsiveContainer><BarChart data={s.perDay.map((d) => ({ ...d, day: d.day.slice(5) }))}><CartesianGrid strokeDasharray="3 3" vertical={false} /><XAxis dataKey="day" fontSize={11} /><YAxis allowDecimals={false} fontSize={11} width={28} /><Tooltip /><Bar dataKey="n" name="Ads" fill="#2f7fd6" radius={[6, 6, 0, 0]} /></BarChart></ResponsiveContainer></div>
        </div>
        <div className="card">
          <h2 className="mb-3 font-extrabold text-navy-800">Ads by type</h2>
          <div className="h-64"><ResponsiveContainer><BarChart data={s.byCategory.map((c) => ({ name: categoryPlural(c.key), n: c.n }))} layout="vertical"><CartesianGrid strokeDasharray="3 3" horizontal={false} /><XAxis type="number" allowDecimals={false} fontSize={11} /><YAxis type="category" dataKey="name" fontSize={11} width={92} /><Tooltip /><Bar dataKey="n" name="Ads" fill="#22b8d8" radius={[0, 6, 6, 0]} /></BarChart></ResponsiveContainer></div>
        </div>
        <div className="card lg:col-span-2">
          <h2 className="mb-3 font-extrabold text-navy-800">Busiest districts</h2>
          {s.byDistrict.length === 0 ? <p className="text-sm text-slate-500">No ads yet.</p> : <div className="flex flex-wrap gap-2">{s.byDistrict.map((d) => <span key={d.district} className="badge bg-brand-50 !px-3 !py-1.5 text-brand-700">{d.district} · {d.n}</span>)}</div>}
        </div>
      </div>
    </div>
  );
}
