import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Banknote, Receipt } from 'lucide-react';
import { Empty, PageHeader, Spinner, StatCard } from '../../components/common/ui';
import { api, errMsg } from '../../service/api';
import { fmtDate } from '../../utils/format';

interface PaymentRow { id: string; orderId: string; status: 'pending' | 'paid' | 'failed' | 'cancelled'; method: 'payhere' | 'demo' | 'admin'; days: number; amount: number; adTitle: string; adId: string; userName: string; userEmail: string; createdAt: string; paidAt?: string }
type Tab = 'all' | 'paid' | 'pending' | 'failed' | 'cancelled';
const rs = (n: number): string => `Rs. ${n.toLocaleString('en-US')}`;
const STATUS: Record<string, string> = { paid: 'bg-emerald-100 text-emerald-700', pending: 'bg-amber-100 text-amber-700', failed: 'bg-red-100 text-red-700', cancelled: 'bg-slate-100 text-slate-600' };
const METHOD: Record<string, string> = { payhere: 'PayHere', demo: 'Test (no money)', admin: 'Free (company)' };

/** the Top ad purchases: who paid for what, and how much came in through PayHere */
export default function AdminPayments() {
  const [tab, setTab] = useState<Tab>('all');
  const [items, setItems] = useState<PaymentRow[] | null>(null);
  const [totals, setTotals] = useState({ revenue: 0, paidCount: 0 });
  useEffect(() => {
    setItems(null);
    api.get('/admin/payments', { params: { status: tab } }).then((r) => { setItems(r.data.data.items); setTotals(r.data.data.totals); }).catch((e) => { toast.error(errMsg(e)); setItems([]); });
  }, [tab]);

  return (
    <div>
      <PageHeader title="Top ad payments" subtitle="Every Top ad order. Revenue counts only real PayHere payments that went through." />
      <div className="mb-4 grid grid-cols-2 gap-3 sm:max-w-md">
        <StatCard icon={<Banknote className="h-5 w-5" />} label="Revenue (PayHere)" value={rs(totals.revenue) as unknown as number} tone="green" />
        <StatCard icon={<Receipt className="h-5 w-5" />} label="Paid orders" value={totals.paidCount} tone="navy" />
      </div>
      <div className="mb-4 flex flex-wrap gap-2">
        {(['all', 'paid', 'pending', 'failed', 'cancelled'] as Tab[]).map((t) => <button key={t} onClick={() => setTab(t)} className={`btn !py-2 capitalize ${tab === t ? 'bg-navy-800 text-white' : 'border border-brand-200 bg-white text-navy-800 hover:bg-brand-50'}`}>{t}</button>)}
      </div>
      {items === null ? <Spinner /> : items.length === 0 ? <div className="card"><Empty title="No payments here" /></div> : (
        <div className="card !p-0"><div className="table-scroll"><table className="w-full min-w-[760px]">
          <thead><tr className="border-b border-brand-100"><th className="th">Date</th><th className="th">Ad</th><th className="th">User</th><th className="th">Plan</th><th className="th">Amount</th><th className="th">Method</th><th className="th">Status</th></tr></thead>
          <tbody className="divide-y divide-brand-100">
            {items.map((p) => (
              <tr key={p.id}>
                <td className="td whitespace-nowrap">{fmtDate(p.paidAt ?? p.createdAt)}<p className="text-[11px] text-slate-400">{p.orderId}</p></td>
                <td className="td"><Link to={`/vehicle/${p.adId}`} target="_blank" className="font-semibold text-navy-800 hover:text-brand-600">{p.adTitle || 'Ad'}</Link></td>
                <td className="td">{p.userName}<p className="text-xs text-slate-500">{p.userEmail}</p></td>
                <td className="td">{p.days} days</td>
                <td className="td font-bold">{p.amount ? rs(p.amount) : '-'}</td>
                <td className="td">{METHOD[p.method]}</td>
                <td className="td"><span className={`badge ${STATUS[p.status]}`}>{p.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table></div></div>
      )}
    </div>
  );
}
