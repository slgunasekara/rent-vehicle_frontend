import {useState} from 'react';
import {Check, Loader2, ShieldCheck} from 'lucide-react';
import {api} from '../../service/api';
import {useT} from '../../i18n';

type State = 'idle' | 'checking' | 'done' | 'error';


export default function RobotCheck({onChange, resetKey = 0}: { onChange: (token: string) => void; resetKey?: number }) {
    const t = useT();
    const [state, setState] = useState<State>('idle');
    const [seen, setSeen] = useState(resetKey);
    if (seen !== resetKey) {
        setSeen(resetKey);
        setState('idle');
    }

    const click = async () => {
        if (state === 'checking') return;
        if (state === 'done') {
            setState('idle');
            onChange('');
            return;
        }
        setState('checking');
        try {
            const [r] = await Promise.all([api.get('/contact/challenge'), new Promise((res) => setTimeout(res, 900))]);
            onChange(r.data.data.token as string);
            setState('done');
        } catch {
            setState('error');
            onChange('');
        }
    };

    return (
        <div>
            <button type="button" onClick={click} role="checkbox" aria-checked={state === 'done'}
                    className={`flex w-full items-center justify-between gap-3 rounded-xl border bg-white px-4 py-3 text-left transition hover:border-brand-400 focus:outline-none focus-visible:shadow-glow sm:w-80 ${state === 'done' ? 'border-emerald-300' : 'border-brand-200'}`}>
        <span className="flex items-center gap-3">
          <span
              className={`grid h-7 w-7 place-items-center rounded-md border-2 transition ${state === 'done' ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-slate-300 bg-white'}`}>
            {state === 'checking' ? <Loader2 className="h-4 w-4 animate-spin text-brand-500"/> : state === 'done' ?
                <Check className="h-4 w-4" strokeWidth={3}/> : null}
          </span>
          <span className="text-sm font-semibold text-navy-800">{t("I'm not a robot")}</span>
        </span>
                <ShieldCheck className="h-6 w-6 text-brand-400" aria-hidden/>
            </button>
            {state === 'error' &&
                <p className="mt-1 text-xs text-red-600">{t('Could not verify. Please try again.')}</p>}
        </div>
    );
}
