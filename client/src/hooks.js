import { useEffect, useRef, useState } from 'react';

export function useReveal() {
    useEffect(() => {
        const els = document.querySelectorAll('.reveal');
        const obs = new IntersectionObserver((entries) => {
            entries.forEach((e) => {
                if (e.isIntersecting) {
                    e.target.classList.add('show');
                    obs.unobserve(e.target);
                }
            });
        }, { threshold: 0.12 });
        els.forEach((el) => obs.observe(el));
        return () => obs.disconnect();
    }, []);
}

export function useCountUp(target, duration = 1400) {
    const [val, setVal] = useState(0);
    const started = useRef(false);
    useEffect(() => {
        if (started.current) return;
        started.current = true;
        const start = performance.now();
        const tick = (now) => {
            const p = Math.min(1, (now - start) / duration);
            setVal(Math.round(target * (1 - Math.pow(1 - p, 3))));
            if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
    }, [target, duration]);
    return val;
}