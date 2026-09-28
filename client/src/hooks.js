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

export function useScrollProgress() {
    const [pct, setPct] = useState(0);
    useEffect(() => {
        let raf;
        const onScroll = () => {
            cancelAnimationFrame(raf);
            raf = requestAnimationFrame(() => {
                const h = document.documentElement;
                const max = h.scrollHeight - h.clientHeight;
                setPct(max > 0 ? (h.scrollTop / max) * 100 : 0);
            });
        };
        window.addEventListener('scroll', onScroll, { passive: true });
        onScroll();
        return () => { window.removeEventListener('scroll', onScroll); cancelAnimationFrame(raf); };
    }, []);
    return pct;
}

export function useTypewriter(words, typeSpeed = 70, deleteSpeed = 35, pause = 1600) {
    const [idx, setIdx] = useState(0);
    const [text, setText] = useState('');
    const [deleting, setDeleting] = useState(false);
    useEffect(() => {
        const word = words[idx % words.length];
        let t;
        if (!deleting && text === word) {
            t = setTimeout(() => setDeleting(true), pause);
        } else if (deleting && text === '') {
            setDeleting(false);
            setIdx((i) => (i + 1) % words.length);
        } else {
            t = setTimeout(() => {
                setText(word.slice(0, text.length + (deleting ? -1 : 1)));
            }, deleting ? deleteSpeed : typeSpeed);
        }
        return () => clearTimeout(t);
    }, [text, deleting, idx, words, typeSpeed, deleteSpeed, pause]);
    return text;
}

export function useMouseGlow() {
    const [pos, setPos] = useState({ x: -100, y: -100 });
    useEffect(() => {
        let raf;
        const onMove = (e) => {
            cancelAnimationFrame(raf);
            raf = requestAnimationFrame(() => setPos({ x: e.clientX, y: e.clientY }));
        };
        window.addEventListener('mousemove', onMove, { passive: true });
        return () => { window.removeEventListener('mousemove', onMove); cancelAnimationFrame(raf); };
    }, []);
    return pos;
}

export function useTilt(ref, max = 8) {
    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        let raf;
        const onMove = (e) => {
            const r = el.getBoundingClientRect();
            const px = (e.clientX - r.left) / r.width - 0.5;
            const py = (e.clientY - r.top) / r.height - 0.5;
            cancelAnimationFrame(raf);
            raf = requestAnimationFrame(() => {
                el.style.transform = `perspective(900px) rotateY(${px * max}deg) rotateX(${py * -max}deg)`;
            });
        };
        const onLeave = () => {
            cancelAnimationFrame(raf);
            el.style.transform = 'perspective(900px) rotateY(0) rotateX(0)';
        };
        el.addEventListener('mousemove', onMove);
        el.addEventListener('mouseleave', onLeave);
        return () => {
            el.removeEventListener('mousemove', onMove);
            el.removeEventListener('mouseleave', onLeave);
            cancelAnimationFrame(raf);
        };
    }, [ref, max]);
}

export function useParallax(ref, strength = 0.18) {
    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        let raf;
        const update = () => {
            cancelAnimationFrame(raf);
            raf = requestAnimationFrame(() => {
                const r = el.getBoundingClientRect();
                const mid = (r.top + r.height / 2) - window.innerHeight / 2;
                const y = -mid * (strength / 100);
                el.style.transform = `translate3d(0, ${y.toFixed(1)}px, 0)`;
            });
        };
        window.addEventListener('scroll', update, { passive: true });
        window.addEventListener('resize', update);
        update();
        return () => {
            window.removeEventListener('scroll', update);
            window.removeEventListener('resize', update);
            cancelAnimationFrame(raf);
        };
    }, [ref, strength]);
}

export function useMagnet(ref, radius = 40) {
    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        let raf;
        const onMove = (e) => {
            if (window.matchMedia('(pointer: coarse)').matches) return;
            const r = el.getBoundingClientRect();
            const dx = e.clientX - (r.left + r.width / 2);
            const dy = e.clientY - (r.top + r.height / 2);
            const d = Math.hypot(dx, dy);
            if (d > radius) return;
            const pull = 1 - d / radius;
            cancelAnimationFrame(raf);
            raf = requestAnimationFrame(() => {
                el.style.transform = `translate(${dx * 0.25 * pull}px, ${dy * 0.25 * pull}px)`;
            });
        };
        const onLeave = () => {
            cancelAnimationFrame(raf);
            el.style.transform = 'translate(0,0)';
        };
        el.addEventListener('mousemove', onMove);
        el.addEventListener('mouseleave', onLeave);
        return () => {
            el.removeEventListener('mousemove', onMove);
            el.removeEventListener('mouseleave', onLeave);
            cancelAnimationFrame(raf);
        };
    }, [ref, radius]);
}