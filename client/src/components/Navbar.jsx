import { useEffect, useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext.jsx';

const SECTIONS = [
    { id: 'beranda', label: 'Beranda' },
    { id: 'layanan', label: 'Layanan' },
    { id: 'project', label: 'Project' },
    { id: 'experience', label: 'Experience' },
    { id: 'tentang', label: 'Tentang' },
    { id: 'kontak', label: 'Kontak' }
];

export default function Navbar({ profile }) {
    const { theme, toggle } = useTheme();
    const [open, setOpen] = useState(false);
    const [active, setActive] = useState('beranda');
    const loc = useLocation();
    const nav = useNavigate();

    useEffect(() => {
        const obs = new IntersectionObserver((entries) => {
            entries.forEach((e) => { if (e.isIntersecting) setActive(e.target.id); });
        }, { rootMargin: '-40% 0px -55% 0px' });
        SECTIONS.forEach((s) => { const el = document.getElementById(s.id); if (el) obs.observe(el); });
        return () => obs.disconnect();
    }, [profile]);

    const go = (e, id) => {
        e.preventDefault();
        setOpen(false);
        if (loc.pathname !== '/') {
            nav(`/#${id}`);
            return;
        }
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <nav className="nav">
            <div className="nav-wrap">
                <NavLink to="/" className="nav-brand" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                    <img src="/nexlipse.svg" alt="Nexlipse" />
                    <span>{profile.brand || 'Nexlipse'}</span>
                </NavLink>
                <div className={`nav-links ${open ? 'open' : ''}`}>
                    {SECTIONS.map((s) => (
                        <a key={s.id} href={`#${s.id}`} className={active === s.id ? 'active' : ''}
                            onClick={(e) => go(e, s.id)}>{s.label}</a>
                    ))}
                </div>
                <div className="nav-right">
                    <button className="theme-btn" onClick={toggle} title="Ganti tema" aria-label="Ganti tema">
                        {theme === 'dark' ? '☀️' : '🌙'}
                    </button>
                    <button className="nav-burger" onClick={() => setOpen((o) => !o)} aria-label="Menu">
                        <span /><span /><span />
                    </button>
                </div>
            </div>
        </nav>
    );
}