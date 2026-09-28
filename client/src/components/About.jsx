const ICONS = { rocket: '🚀', code: '💻', server: '🖥️', bot: '🤖', shield: '🛡️', heart: '💚', info: '📢', instagram: '📸', facebook: '👤', youtube: '▶️', github: '⌨️', light: '⚡' };

export default function About({ profile, about }) {
    const skills = (profile.skills || []).slice(0, 6);
    return (
        <section className="section" id="tentang">
            <div className="section-head reveal">
                <span className="section-eyebrow">Tentang</span>
                <h2>Kenalan Lebih Dekat</h2>
            </div>
            <div className="about-grid">
                <div className="reveal">
                    <p className="about-bio lead">{profile.name}</p>
                    <p className="about-bio">{about.bio}</p>
                    <div className="skills">
                        {skills.map((s) => (
                            <div className="skill-row" key={s.name}>
                                <b>{s.name}</b>
                                <div className="skill-bar"><i style={{ width: s.level + '%' }} /></div>
                            </div>
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