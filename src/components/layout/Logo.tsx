import { Link } from 'react-router-dom';


export default function Logo({ light = false, size = 40, to = '/', responsive = false, textClass = '' }: { light?: boolean; size?: number; to?: string; responsive?: boolean; textClass?: string }) {
  return (
    <Link to={to} className="flex items-center gap-2 sm:gap-2.5" aria-label="Vehicle Buddy home">
      {/* white tile: the logo has a dark navy outline, which would disappear on the dark navbar */}
      <span className="grid shrink-0 place-items-center rounded-xl bg-white p-[3px] shadow-[0_2px_10px_rgba(4,31,65,.3)]">
        {responsive
          ? <img src="/logo.png" alt="" className="h-[26px] w-auto sm:h-[34px]" style={{ maxHeight: size - 6 }} />
          : <img src="/logo.png" alt="" style={{ height: size - 6, width: 'auto' }} />}
      </span>
      <span data-no-translate className={`whitespace-nowrap font-extrabold tracking-tight ${responsive ? 'text-[1.02rem] sm:text-xl' : 'text-xl'} ${light ? 'text-white' : 'text-navy-800'} ${textClass}`}>
        Vehicle<span className="text-aqua-400">Buddy</span>
      </span>
    </Link>
  );
}
