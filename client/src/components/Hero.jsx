import { useRef } from 'react';
import { useCountUp, useTypewriter, useTilt, useParallax, useMagnet } from '../hooks';

const ICONS = { instagram: '📸', facebook: '👤', youtube: '▶️', github: '⌨️', tiktok: '🎵', linkedin: '🔗' };

function Magnetic({ children, className }) {
    const ref = useRef(null);
    useMagnet(ref);
    return <span ref={ref} className={`magnet ${className || ''}`}>{children}</span>;
}

function ShimmerLine({ children }) {
    return <span className="word-shimmer">{children}</span>;
}

export default function Hero({ profile, about }) {
    const proyek = useCountUp(11);
    const runtime = useCountUp(24);
    const motivasi = useCountUp(365);
    const cardRef = useRef(null);
    const copyRef = useRef(null);
    useTilt(cardRef, 7);
    useParallax(copyRef, 0.12);
    const roles = profile.roles && profile.roles.length ? profile.roles : ['Fullstack Developer Enthusiast', 'WA Bot Maker'];
    const typed = useTypewriter(roles);

    return (
        <section className="hero" id="beranda">
            <div className="hero-grid">
                <div className="hero-copy" ref={copyRef}>
                    <span className="hero-tag reveal-up"><span className="dot" /> Tersedia untuk kolaborasi</span>
                    <h1 className="reveal-up" style={{ transitionDelay: '90ms' }}>
                        Bangun <ShimmerLine>{profile.brand}</ShimmerLine>,
                        <br />
                        dari <ShimmerLine>Koding</ShimmerLine> sampai <ShimmerLine>Server</ShimmerLine>.
                    </h1>
                    <p className="type-wrap reveal-up" style={{ transitionDelay: '180ms' }}>
                        <span className="type-badge">{typed}<span className="caret" /></span>
                    </p>
                    <p className="lead reveal-up" style={{ transitionDelay: '240ms' }}>{profile.quote || ''}</p>
                    <p className="sub reveal-up" style={{ transitionDelay: '300ms' }}>
                        {profile.shortBio}
                    </p>
                    <div className="hero-actions reveal-up" style={{ transitionDelay: '360ms' }}>
                        <Magnetic><a href="#project" className="btn btn-primary">Lihat Project →</a></Magnetic>
                        <Magnetic><a href="#kontak" className="btn btn-ghost">Mulai Bisnis Anda</a></Magnetic>
                    </div>
                    <div className="hero-stats reveal-up" style={{ transitionDelay: '420ms' }}>
                        <div className="stat"><b>{proyek}+</b><span>Proyek di-Live</span></div>
                        <div className="stat"><b>{runtime}/7</b><span>Ready in 24 Jam</span></div>
                        <div className="stat"><b>100%</b><span>Garansi Server Aktif</span></div>
                    </div>
                </div>
                <div className="hero-card reveal-card" ref={cardRef}>
                    <span className="card-shine" aria-hidden />
                    <div className="avatar">
                        {profile.avatar ? <img src={profile.avatar} alt={profile.name} /> : (profile.name || 'N').charAt(0)}
                        <span className="online-pip" />
                    </div>
                    <h3>{profile.name}</h3>
                    <span className="role-chip">{profile.role}</span>
                    <div style={{ width: '100%', marginTop: 8 }}>
                        <div className="hero-chips">
                            {(profile.skills || []).slice(0, 5).map((s) => (
                                <span className="skill-chip" key={s.name}>{s.name}</span>
                            ))}
                        </div>
                    </div>
                    <div className="hero-socials">
                        {(about?.socials || []).filter((s) => s.url).slice(0, 3).map((s) => (
                            <a key={s.platform} className="social-chip" href={s.url} target="_blank" rel="noopener noreferrer">
                                {ICONS[s.icon] || '🔗'} {s.handle}
                            </a>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}