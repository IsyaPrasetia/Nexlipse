import { Link } from 'react-router-dom';

const ICONS = { code: '💻', server: '🖥️', bot: '🤖', shield: '🛡️', rocket: '🚀', light: '⚡', heart: '💚' };

export default function Services({ profile, pages }) {
    const byTitle = {};
    (pages || []).forEach((p) => { if (p.profileTitle) byTitle[p.profileTitle] = `/jasa/${p.slug}`; });
    return (
        <section className="section" id="layanan">
            <div className="section-head reveal">
                <span className="section-eyebrow">Layanan</span>
                <h2>Apa yang {profile.brand} Kerjakan?</h2>
                <p>Dari kebutuhan web hingga infrastruktur server sendiri, dikerjakan end-to-end.</p>
            </div>
            <div className="services-grid">
                {(profile.services || []).map((s, i) => {
                    const to = byTitle[s.title];
                    const card = (
                        <div className="service-card reveal" key={s.title} style={{ transitionDelay: `${i * 80}ms` }}>
                            <div className="service-icon">{ICONS[s.icon] || '💡'}</div>
                            <h3>{s.title}</h3>
                            <p>{s.text}</p>
                            {to && <span className="service-more">Selengkapnya →</span>}
                        </div>
                    );
                    return to ? <Link className="service-card-link" to={to} key={s.title}>{card}</Link> : card;
                })}
            </div>
        </section>
    );
}