import { Link, useParams } from 'react-router-dom';
import { usePageMeta, JsonLd } from '../seo';

const STATUS = { done: ['Selesai', 'status-done'], latest: ['Terbaru', 'status-latest'], progress: ['Berjalan', 'status-progress'] };

const RELATED = {
    web: [
        { slug: 'website-internal', label: 'Jasa Website Internal' },
        { slug: 'dashboard-custom', label: 'Jasa Dashboard Custom' }
    ],
    backend: [
        { slug: 'bot-whatsapp-otomatis', label: 'Jasa Bot WhatsApp Otomatis' },
        { slug: 'mini-server-lokal', label: 'Jasa Mini Server Lokal' }
    ],
    fullstack: [
        { slug: 'website-internal', label: 'Jasa Website Internal' },
        { slug: 'bot-whatsapp-otomatis', label: 'Jasa Bot WhatsApp Otomatis' }
    ]
};

export default function PortfolioPage({ projects, experience }) {
    const { id } = useParams();
    const proj = (projects || []).find((p) => p.id === id);
    const exp = (experience || []).find((e) => e.id === id);
    const label = (proj && (proj.linkLabel || '').trim()) || (proj && proj.link ? proj.link.replace(/^https?:\/\//, '').replace(/\/+$/, '') : '');

    usePageMeta({
        title: proj ? `${proj.title}: ${proj.short} | Nexlipse` : 'Project tidak ditemukan | Nexlipse',
        description: proj ? proj.short : '',
        path: proj ? `/portfolio/${proj.id}` : null
    });

    if (!proj) {
        return (
            <div className="page-wrap" style={{ minHeight: '60vh', display: 'grid', placeItems: 'center' }}>
                <div style={{ textAlign: 'center' }}>
                    <h1 style={{ fontSize: '2.4rem' }}>404</h1>
                    <p style={{ color: 'var(--text-soft)' }}>Project tidak ditemukan.</p>
                    <Link to="/" className="btn btn-primary" style={{ marginTop: 20 }}>← Kembali ke Beranda</Link>
                </div>
            </div>
        );
    }

    const desc = proj.long || (exp ? exp.text : '') || proj.short;
    const st = STATUS[proj.status] || STATUS.done;
    const related = RELATED[proj.category] || [];

    const schema = {
        '@context': 'https://schema.org',
        '@type': 'Service',
        name: proj.title,
        category: proj.category,
        description: proj.short,
        provider: {
            '@type': 'ProfessionalService',
            name: 'Nexlipse',
            url: 'https://nexlipse.my.id/',
            areaServed: 'Indonesia'
        },
        audience: exp ? exp.org : undefined,
        url: `https://nexlipse.my.id/portfolio/${proj.id}`
    };
    if (proj.link) schema.offers = { '@type': 'Offer', url: proj.link };

    return (
        <div className="page-wrap">
            <JsonLd data={schema} />
            <div className="breadcrumb">
                <Link to="/">Beranda</Link> <span>/</span> <Link to="/#project">Project</Link> <span>/</span> {proj.title}
            </div>

            <header className="page-hero">
                <span className="section-eyebrow">Studi Kasus</span>
                <h1>{proj.title}</h1>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 14 }}>
                    <span className={`status-badge ${st[1]}`}>{st[0]}</span>
                    {proj.year ? <span className="status-badge status-done">{proj.year}</span> : null}
                </div>
                <p className="page-lead">{proj.short}</p>
                {proj.link ? (
                    <a className="btn btn-primary" href={proj.link} target="_blank" rel="noopener noreferrer">Lihat Website Live ↗</a>
                ) : null}
            </header>

            <section className="section">
                <div className="section-head reveal">
                    <span className="section-eyebrow">Tentang Project</span>
                    <h2>Yang dikerjakan</h2>
                </div>
                <div className="target-box reveal">
                    <p>{desc}</p>
                    {exp ? (
                        <>
                            {exp.org ? <p style={{ marginTop: 12 }}><b>Dikerjakan untuk:</b> {exp.org}</p> : null}
                            {exp.role ? <p style={{ marginTop: 6 }}><b>Peran:</b> {exp.role}</p> : null}
                        </>
                    ) : null}
                </div>
            </section>

            <section className="section">
                <div className="section-head reveal">
                    <span className="section-eyebrow">Teknologi</span>
                    <h2>Yang dipakai</h2>
                </div>
                <div className="project-tags" style={{ justifyContent: 'center' }}>
                    {(proj.tags || []).map((t) => <span className="tag" key={t}>{t}</span>)}
                </div>
            </section>

            {related.length ? (
                <section className="section">
                    <div className="section-head reveal">
                        <span className="section-eyebrow">Layanan Terkait</span>
                        <h2>Butuh project serupa?</h2>
                    </div>
                    <div className="services-grid">
                        {related.map((r, i) => (
                            <Link className="service-card reveal service-link-card" to={`/jasa/${r.slug}`} key={r.slug} style={{ transitionDelay: `${i * 80}ms` }}>
                                <div className="service-icon">💡</div>
                                <h3>{r.label}</h3>
                                <p>Lihat detail layanan dan tahapan pengerjaannya.</p>
                            </Link>
                        ))}
                    </div>
                </section>
            ) : null}

            <section className="section cta-box reveal">
                <h2>Punya project serupa yang ingin dikerjakan?</h2>
                <p>Ceritakan kebutuhannya, diskusikan dulu tanpa biaya.</p>
                <Link className="btn btn-primary" to="/#kontak">Konsultasikan Proyek Anda</Link>
            </section>
        </div>
    );
}