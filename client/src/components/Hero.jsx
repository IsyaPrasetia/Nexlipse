import { useCountUp } from '../hooks';

const ICONS = { rocket: '🚀', code: '💻', server: '🖥️', bot: '🤖', shield: '🛡️', heart: '💚', info: '📢', instagram: '📸', facebook: '👤', youtube: '▶️', github: '⌨️', light: '⚡' };

export default function Hero({ profile, about }) {
    const proyek = useCountUp(11);
    const runtime = useCountUp(24);
    const motivasi = useCountUp(365);
    return (
        <section className="hero" id="beranda">
            <div className="hero-grid">
                <div>
                    <span className="hero-tag"><span className="dot" /> Tersedia untuk kolaborasi</span>
                    <h1>
                        Membangun <span className="grad-text">{profile.brand}</span>,
                        <br />
                        dari Koding sampai Server.
                    </h1>
                    <p className="lead">{profile.quote || ''}</p>
                    <p className="sub">
                        {profile.role} — {profile.shortBio}
                    </p>
                    <div className="hero-actions">
                        <a href="#project" className="btn btn-primary">Lihat Project →</a>
                        <a href="#kontak" className="btn btn-ghost">Hubungi Saya</a>
                    </div>
                    <div className="hero-stats">
                        <div className="stat"><b>{proyek}+</b><span>Proyek di-Live</span></div>
                        <div className="stat"><b>{runtime}/7</b><span>Jam Server Aktif</span></div>
                        <div className="stat"><b>{motivasi}°</b><span>Semangat Ngoding</span></div>
                    </div>
                </div>
                <div className="hero-card">
                    <div className="avatar">
                        {profile.avatar ? <img src={profile.avatar} alt={profile.name} /> : (profile.name || 'N').charAt(0)}
                    </div>
                    <h3>{profile.name}</h3>
                    <span className="role-chip">{profile.role}</span>
                    <div>
                        {(profile.skills || []).slice(0, 4).map((s) => (
                            <div key={s.name}>
                                <div className="skill-row" style={{ gridTemplateColumns: '1fr auto', gap: 8, marginBottom: 2 }}>
                                    <b style={{ fontSize: '.82rem' }}>{s.name}</b>
                                    <span style={{ fontSize: '.75rem', color: 'var(--text-mute)' }}>{s.level}%</span>
                                </div>
                                <div className="bar"><i style={{ width: s.level + '%' }} /></div>
                            </div>
                        ))}
                    </div>
                    {(about?.socials || []).filter((s) => s.url).slice(0, 3).map((s) => (
                        <a key={s.platform} href={s.url} target="_blank" rel="noopener noreferrer"
                            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, margin: '14px 10px 0 0', fontSize: '.8rem', color: 'var(--text-soft)' }}>
                            {ICONS[s.icon] || '🔗'} {s.handle}
                        </a>
                    ))}
                </div>
            </div>
        </section>
    );
}