import {useEffect, useRef, useState} from 'react';

export default function CountUp({to, duration = 1600, plusFrom = 10}: {
    to: number;
    duration?: number;
    plusFrom?: number
}) {
    const ref = useRef<HTMLSpanElement>(null);
    const [n, setN] = useState(0);
    const started = useRef(false);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
        const run = () => {
            if (started.current) return;
            started.current = true;
            if (reduce || to === 0) {
                setN(to);
                return;
            }
            const t0 = performance.now();
            const tick = (now: number) => {
                const p = Math.min(1, (now - t0) / duration);
                setN(Math.round((1 - Math.pow(1 - p, 3)) * to)); // ease-out
                if (p < 1) requestAnimationFrame(tick);
            };
            requestAnimationFrame(tick);
        };
        const io = new IntersectionObserver((e) => e.forEach((x) => {
            if (x.isIntersecting) {
                run();
                io.disconnect();
            }
        }), {threshold: 0.4});
        io.observe(el);
        return () => io.disconnect();
    }, [to, duration]);

    useEffect(() => {
        if (started.current) setN(to);
    }, [to]);

    return <span ref={ref}>{n.toLocaleString('en-LK')}{to >= plusFrom ? '+' : ''}</span>;
}
