import {useCallback, useEffect, useState} from 'react';
import toast from 'react-hot-toast';
import {CheckCheck, Mail, MailOpen, Phone, Reply, Search as SearchIcon, Send, Trash2, Undo2} from 'lucide-react';
import {api, errMsg} from '../../service/api';
import {ContactMsg} from '../../types';
import {Empty, Modal, PageHeader, Spinner} from '../../components/common/ui';
import {niceDateTime} from '../../utils/format';

type Filter = 'all' | 'unread' | 'unreplied' | 'replied';

interface Counts {
    total: number;
    unread: number;
    unreplied: number
}

const tellSidebar = (): void => {
    window.dispatchEvent(new Event('fv:messages-changed'));
};

export default function AdminMessages() {
    const [filter, setFilter] = useState<Filter>('all');
    const [q, setQ] = useState('');
    const [list, setList] = useState<ContactMsg[] | null>(null);
    const [counts, setCounts] = useState<Counts>({total: 0, unread: 0, unreplied: 0});
    const [openId, setOpenId] = useState<string | null>(null);
    const [reply, setReply] = useState<ContactMsg | null>(null);
    const [text, setText] = useState('');
    const [del, setDel] = useState<ContactMsg | null>(null);
    const [busy, setBusy] = useState(false);

    const load = useCallback(() => {
        api.get('/admin/contact', {params: {filter, q: q.trim() || undefined}})
            .then((r) => {
                setList(r.data.data);
                setCounts(r.data.counts);
            })
            .catch((e) => toast.error(errMsg(e)));
    }, [filter, q]);
    useEffect(() => {
        const t = setTimeout(load, q ? 350 : 0);
        return () => clearTimeout(t);
    }, [load, q]);

    const patch = async (m: ContactMsg, body: { read?: boolean; replied?: boolean }, quiet = false) => {
        try {
            await api.patch(`/admin/contact/${m.id}`, body);
            if (!quiet) toast.success(body.replied !== undefined ? (body.replied ? 'Marked as replied' : 'Marked as not replied') : body.read ? 'Marked as read' : 'Marked as unread');
            load();
            tellSidebar();
        } catch (e) {
            toast.error(errMsg(e));
        }
    };

    const toggle = (m: ContactMsg) => {
        const opening = openId !== m.id;
        setOpenId(opening ? m.id : null);
        if (opening && !m.read) void patch(m, {read: true}, true);
    };

    const send = async () => {
        if (!reply) return;
        setBusy(true);
        try {
            const r = await api.post(`/admin/contact/${reply.id}/reply`, {message: text});
            toast.success(r.data.message || 'Reply sent');
            setReply(null);
            setText('');
            load();
            tellSidebar();
        } catch (e) {
            toast.error(errMsg(e));
        } finally {
            setBusy(false);
        }
    };

    const remove = async () => {
        if (!del) return;
        setBusy(true);
        try {
            await api.delete(`/admin/contact/${del.id}`);
            toast.success('Message deleted');
            setDel(null);
            load();
            tellSidebar();
        } catch (e) {
            toast.error(errMsg(e));
        } finally {
            setBusy(false);
        }
    };

    const tabs: { k: Filter; label: string; n?: number }[] = [
        {k: 'all', label: 'All', n: counts.total},
        {k: 'unread', label: 'Unread', n: counts.unread},
        {k: 'unreplied', label: 'Not replied', n: counts.unreplied},
        {k: 'replied', label: 'Replied'},
    ];

    return (
        <div>
            <PageHeader title="Contact messages"
                        subtitle="Messages sent from the Contact page. Open one to read it, reply by email, or mark it as read / replied."/>
            <div className="mb-5 flex flex-wrap items-center gap-3">
                <div className="inline-flex flex-wrap rounded-xl bg-white p-1 shadow-soft" role="tablist">
                    {tabs.map((t) => (
                        <button key={t.k} role="tab" aria-selected={filter === t.k} onClick={() => setFilter(t.k)}
                                className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-bold transition ${filter === t.k ? 'bg-gradient-to-r from-navy-600 to-brand-500 text-white' : 'text-slate-500 hover:text-navy-800'}`}>
                            {t.label}{t.n !== undefined && <span
                            className={`rounded-full px-1.5 text-xs ${filter === t.k ? 'bg-white/25' : t.k === 'unread' && t.n > 0 ? 'bg-red-500 text-white' : 'bg-brand-50 text-brand-700'}`}>{t.n}</span>}
                        </button>
                    ))}
                </div>
                <label className="relative min-w-[12rem] flex-1 sm:max-w-xs"><SearchIcon
                    className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"/><input
                    className="input !pl-9" placeholder="Search name, email, phone or message" value={q}
                    onChange={(e) => setQ(e.target.value)}/></label>
            </div>

            {!list ? <Spinner/> : list.length === 0 ?
                <div className="card"><Empty title={filter === 'all' && !q ? 'No messages yet' : 'No messages here'}
                                             hint={filter === 'all' && !q ? 'Messages from the Contact form are saved here.' : 'Try another tab or search.'}/>
                </div> : (
                    <ul className="space-y-3">
                        {list.map((m) => {
                            const open = openId === m.id;
                            return (
                                <li key={m.id}
                                    className={`card !p-0 overflow-hidden ${!m.read ? 'border-l-4 !border-l-brand-500' : ''}`}>
                                    <button type="button" onClick={() => toggle(m)}
                                            className="flex w-full items-start gap-3 p-4 text-left hover:bg-brand-50/40"
                                            aria-expanded={open}>
                                        <span
                                            className={`mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-full ${m.read ? 'bg-slate-100 text-slate-400' : 'bg-brand-500 text-white'}`}>{m.read ?
                                            <MailOpen className="h-4 w-4"/> : <Mail className="h-4 w-4"/>}</span>
                                        <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-2">
                      <span
                          className={`${m.read ? 'font-semibold' : 'font-extrabold'} text-navy-800`}>{m.firstName} {m.lastName}</span>
                        {!m.read && <span className="badge bg-brand-500 text-white">New</span>}
                        {m.replied ?
                            <span className="badge bg-emerald-100 text-emerald-700"><CheckCheck className="h-3 w-3"/> Replied</span> :
                            <span className="badge bg-amber-100 text-amber-800">Not replied</span>}
                        <span className="ml-auto text-xs text-slate-400">{niceDateTime(m.createdAt)}</span>
                    </span>
                    <span
                        className={`mt-0.5 block text-sm text-slate-600 ${open ? '' : 'line-clamp-1'}`}>{open ? '' : m.message}</span>
                  </span>
                                    </button>
                                    {open && (
                                        <div className="space-y-3 border-t border-brand-100 p-4">
                                            <div className="flex flex-wrap gap-x-5 gap-y-1 text-sm text-slate-600">
                                                <a className="flex items-center gap-1.5 font-semibold text-brand-600 hover:underline"
                                                   href={`mailto:${m.email}`}><Mail className="h-4 w-4"/> {m.email}</a>
                                                <a className="flex items-center gap-1.5 font-semibold text-brand-600 hover:underline"
                                                   href={`tel:${m.phone}`}><Phone className="h-4 w-4"/> {m.phone}</a>
                                            </div>
                                            <p className="whitespace-pre-wrap rounded-xl bg-brand-50/70 p-3 text-sm text-slate-700">{m.message}</p>
                                            {m.replied && (
                                                <div
                                                    className="rounded-xl border-l-4 border-emerald-400 bg-emerald-50/60 p-3 text-sm">
                                                    <p className="text-xs font-bold text-emerald-700">Replied {m.repliedAt ? niceDateTime(m.repliedAt) : ''}{m.replyText ? '' : ' (marked manually)'}</p>
                                                    {m.replyText &&
                                                        <p className="mt-1 whitespace-pre-wrap text-slate-600">{m.replyText}</p>}
                                                </div>
                                            )}
                                            <div className="flex flex-wrap gap-2">
                                                <button className="btn-primary" onClick={() => {
                                                    setReply(m);
                                                    setText('');
                                                }}><Reply
                                                    className="h-4 w-4"/> {m.replied ? 'Reply again' : 'Reply by email'}
                                                </button>
                                                {m.replied
                                                    ? <button className="btn-ghost"
                                                              onClick={() => patch(m, {replied: false})}><Undo2
                                                        className="h-4 w-4"/> Mark not replied</button>
                                                    : <button className="btn-ghost"
                                                              onClick={() => patch(m, {replied: true})}><CheckCheck
                                                        className="h-4 w-4"/> Mark as replied</button>}
                                                <button className="btn-ghost" onClick={() => {
                                                    void patch(m, {read: false});
                                                    setOpenId(null);
                                                }}><Mail className="h-4 w-4"/> Mark unread
                                                </button>
                                                <button className="btn-danger ml-auto" onClick={() => setDel(m)}><Trash2
                                                    className="h-4 w-4"/> Delete
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </li>
                            );
                        })}
                    </ul>
                )}

            <Modal open={!!reply} onClose={() => !busy && setReply(null)}
                   title={reply ? `Reply to ${reply.firstName} ${reply.lastName}` : ''} wide>
                {reply && (
                    <div className="space-y-3">
                        <p className="text-sm text-slate-500">This is emailed to <b
                            className="text-navy-800">{reply.email}</b> from Vehicle Buddy, and the message is marked as
                            replied.</p>
                        <p className="line-clamp-3 whitespace-pre-wrap rounded-xl bg-brand-50/70 p-3 text-xs text-slate-600">{reply.message}</p>
                        <textarea className="input min-h-[10rem]" autoFocus placeholder="Write your reply..."
                                  value={text} onChange={(e) => setText(e.target.value)} maxLength={4000}/>
                        <button className="btn-primary w-full" disabled={busy || text.trim().length < 2} onClick={send}>
                            <Send className="h-4 w-4"/> {busy ? 'Sending...' : 'Send reply'}</button>
                    </div>
                )}
            </Modal>

            <Modal open={!!del} onClose={() => !busy && setDel(null)} title="Delete this message?">
                <p className="text-sm text-slate-600">The message from <b>{del?.firstName} {del?.lastName}</b> is
                    removed for good.</p>
                <button className="btn-danger mt-4 w-full" disabled={busy} onClick={remove}><Trash2
                    className="h-4 w-4"/> {busy ? 'Deleting...' : 'Delete message'}</button>
            </Modal>
        </div>
    );
}
