const ICONS = { code: '💻', server: '🖥️', bot: '🤖', shield: '🛡️', rocket: '🚀', light: '⚡', heart: '💚' };

export default function Services({ profile }) {
    return (
        <section className="section" id="layanan">
            <div className="section-head reveal">
                <span className="section-eyebrow">Layanan</span>
                <h2>Apa yang {profile.brand} Kerjakan?</h2>
                <p>Dari kebutuhan web hingga infrastruktur server sendiri, dikerjakan end-to-end.</p>
            </div>
            <div className="services-grid">
                {(profile.services || []).map((s, i) => (
                    <div className="service-card reveal" key={s.title} style={{ transitionDelay: `${i * 80}ms` }}>
                        <div className="service-icon">{ICONS[s.icon] || '💡'}</div>
                        <h3>{s.title}</h3>
                        <p>{s.text}</p>
                    </div>
                ))}
            </div>
        </section>
    );
}