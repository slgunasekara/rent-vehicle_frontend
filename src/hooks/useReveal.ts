import {useEffect} from 'react';

export function useReveal(deps: unknown[] = []): void {
    useEffect(() => {
        const els = document.querySelectorAll('.reveal:not(.in)');
        const io = new IntersectionObserver(
            (entries) => entries.forEach((e) => {
                if (e.isIntersecting) {
                    e.target.classList.add('in');
                    io.unobserve(e.target);
                }
            }),
            {threshold: 0.12}
        );
        els.forEach((el) => io.observe(el));
        return () => io.disconnect();
    }, deps);
}
