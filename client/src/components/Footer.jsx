import { Link } from 'react-router-dom';

const SERVICES = [
    { slug: 'website-internal', label: 'Jasa Website Internal' },
    { slug: 'dashboard-custom', label: 'Jasa Dashboard Custom' },
    { slug: 'bot-whatsapp-otomatis', label: 'Jasa Bot WhatsApp Otomatis' },
    { slug: 'mini-server-lokal', label: 'Jasa Mini Server Lokal' },
    { slug: 'maintenance-server', label: 'Jasa Maintenance Server' }
];

const PROJECTS = [
    { id: 'sipandai', label: 'SiPandai' },
    { id: 'sijaga', label: 'SiJaga' },
    { id: 'pondok-sehat-indonesia', label: 'Pondok Sehat Indonesia' },
    { id: 'arteria-medika-profesional', label: 'Arteria Medika Profesional' }
];

export default function Footer({ profile, about }) {
    const year = new Date().getFullYear();
    return (
        <footer className="footer">
            <div className="footer-grid">
                <div className="footer-brand">
                    <p>
                        <b>{profile.brand}</b> © {year}, {profile.name}. Dikoding dengan ☕ & semangat.
                    </p>
                    <p style={{ marginTop: 6, fontSize: '.8rem' }}>
                        {profile.domain} · <a href={`mailto:${profile.email}`} style={{ color: 'var(--accent)' }}>{profile.email}</a>
                    </p>
                </div>
                <div className="footer-col">
                    <h4>Layanan</h4>
                    {SERVICES.map((s) => <Link key={s.slug} to={`/jasa/${s.slug}`}>{s.label}</Link>)}
                </div>
                <div className="footer-col">
                    <h4>Project</h4>
                    {PROJECTS.map((p) => <Link key={p.id} to={`/portfolio/${p.id}`}>{p.label}</Link>)}
                </div>
            </div>
        </footer>
    );
}