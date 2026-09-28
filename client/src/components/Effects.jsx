import { useEffect, useMemo, useState } from 'react';
import { useScrollProgress, useMouseGlow } from '../hooks';

export function ScrollProgress() {
    const pct = useScrollProgress();
    return (
        <div className="scroll-progress" style={{ transform: `scaleX(${pct / 100})` }} aria-hidden />
    );
}

export function CursorGlow() {
    const { x, y } = useMouseGlow();
    const [enabled, setEnabled] = useState(false);
    useEffect(() => {
        const mq = window.matchMedia('(pointer: fine)');
        setEnabled(mq.matches);
    }, []);
    if (!enabled) return null;
    return (
        <div className="cursor-glow" style={{ left: x, top: y }} aria-hidden />
    );
}

export function Dust() {
    const dots = useMemo(() =>
        Array.from({ length: 14 }, () => ({
            left: Math.random() * 100,
            top: Math.random() * 100,
            size: 2 + Math.random() * 3,
            dur: 14 + Math.random() * 18,
            delay: -Math.random() * 30
        })), []);
    return (
        <div className="dust" aria-hidden>
            {dots.map((d, i) => (
                <span key={i} className="dust-dot" style={{
                    left: `${d.left}%`,
                    top: `${d.top}%`,
                    width: d.size,
                    height: d.size,
                    animationDuration: `${d.dur}s`,
                    animationDelay: `${d.delay}s`
                }} />
            ))}
        </div>
    );
}

export function AmbientOrbs() {
    return (
        <div className="orbs" aria-hidden>
            <span className="orb orb-a" />
            <span className="orb orb-b" />
            <span className="orb orb-c" />
        </div>
    );
}

export function BackToTop() {
    const [show, setShow] = useState(false);
    useEffect(() => {
        const onScroll = () => setShow(window.scrollY > 600);
        window.addEventListener('scroll', onScroll, { passive: true });
        onScroll();
        return () => window.removeEventListener('scroll', onScroll);
    }, []);
    return (
        <button className={`to-top ${show ? 'show' : ''}`} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} aria-label="Kembali ke atas" title="Kembali ke atas">
            ↑
        </button>
    );
}