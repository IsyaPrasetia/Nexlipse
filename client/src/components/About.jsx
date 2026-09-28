const ICONS = { rocket: '🚀', code: '💻', server: '🖥️', bot: '🤖', shield: '🛡️', heart: '💚', info: '📢', instagram: '📸', facebook: '👤', youtube: '▶️', github: '⌨️', light: '⚡' };

export default function About({ profile, about }) {
    const skills = (profile.skills || []);
    return (
        <section className="section" id="tentang">
            <div className="section-head reveal">
                <span className="section-eyebrow">Tentang</span>
                <h2>Kenalan Lebih Dekat</h2>
            </div>
            <div className="about-grid">
                <div className="reveal">
                    <div className="about-person reveal-card">
                        <div className="about-avatar">
                            {profile.avatar ? <img src={profile.avatar} alt={profile.name} /> : (profile.name || 'M').charAt(0)}
                        </div>
                        <div>
                            <p className="about-bio lead">{profile.name}</p>
                            <span className="role-chip">{profile.role}</span>
                        </div>
                    </div>
                    <p className="about-bio">{about.bio}</p>
                    <p className="skills-label">Tech stack yang sering dipakai:</p>
                    <div className="skills-chips">
                        {skills.map((s) => (
                            <span className="skill-chip" key={s.name}>{s.name}</span>
                        ))}
                    </div>
                </div>
                <div>
                    <div className="highlights">
                        {(about.highlights || []).map((h, i) => (
                            <div className="hl-card reveal" style={{ transitionDelay: `${i * 70}ms` }} key={h.title}>
                                <div className="icon">{ICONS[h.icon] || '💡'}</div>
                                <h4>{h.title}</h4>
                                <p>{h.text}</p>
                            </div>
                        ))}
                    </div>
                    <div className="socials" style={{ marginTop: 22 }}>
                        {(about.socials || []).filter((s) => s.url).map((s) => (
                            <a className="social-row" href={s.url} target="_blank" rel="noopener noreferrer" key={s.platform}>
                                <span className="s-icon">{ICONS[s.icon] || '🔗'}</span>
                                <span>
                                    <b>{s.platform}</b>
                                    <span style={{ display: 'block' }}>{s.handle}</span>
                                </span>
                                <span className="arrow">↗</span>
                            </a>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}