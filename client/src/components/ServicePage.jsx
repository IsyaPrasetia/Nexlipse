import { Link, useParams } from 'react-router-dom';
import { usePageMeta, JsonLd } from '../seo';

const ICONS = { code: '💻', server: '🖥️', bot: '🤖', shield: '🛡️', rocket: '🚀', light: '⚡', heart: '💚' };

function FaqList({ items }) {
    return (
        <div className="faq-list">
            {items.map((f, i) => (
                <details className="faq-item" key={i}>
                    <summary>{f.q}</summary>
                    <p>{f.a}</p>
                </details>
            ))}
        </div>
    );
}

export default function ServicePage({ pages, profile }) {
    const { slug } = useParams();
    const page = (pages || []).find((p) => p.slug === slug);
    usePageMeta({
        title: page ? page.pageTitle : 'Halaman tidak ditemukan | Nexlipse',
        description: page ? page.metaDescription : '',
        path: page ? `/jasa/${page.slug}` : null
    });

    if (!page) {
        return (
            <div className="page-wrap" style={{ minHeight: '60vh', display: 'grid', placeItems: 'center' }}>
                <div style={{ textAlign: 'center' }}>
                    <h1 style={{ fontSize: '2.4rem' }}>404</h1>
                    <p style={{ color: 'var(--text-soft)' }}>Layanan tidak ditemukan.</p>
                    <Link to="/" className="btn btn-primary" style={{ marginTop: 20 }}>← Kembali ke Beranda</Link>
                </div>
            </div>
        );
    }

    const schema = {
        '@context': 'https://schema.org',
        '@type': 'Service',
        name: page.title,
        serviceType: page.title,
        description: page.metaDescription,
        provider: {
            '@type': 'ProfessionalService',
            name: profile.brand || 'Nexlipse',
            url: 'https://nexlipse.my.id/',
            areaServed: 'Indonesia'
        },
        areaServed: 'Indonesia',
        url: `https://nexlipse.my.id/jasa/${page.slug}`
    };

    return (
        <div className="page-wrap">
            <JsonLd data={schema} />
            <div className="breadcrumb">
                <Link to="/">Beranda</Link> <span>/</span> Layanan <span>/</span> {page.title}
            </div>

            <header className="page-hero">
                <span className="section-eyebrow">Layanan Nexlipse</span>
                <h1>{page.h1}</h1>
                <p className="page-lead">{page.lead}</p>
                <Link className="btn btn-primary" to="/#kontak">Konsultasikan Proyek Anda</Link>
            </header>

            <section className="section">
                <div className="section-head reveal">
                    <span className="section-eyebrow">Isi Layanan</span>
                    <h2>Apa yang termasuk</h2>
                </div>
                <div className="services-grid">
                    {page.features.map((f, i) => (
                        <div className="service-card reveal" key={f.title} style={{ transitionDelay: `${i * 80}ms` }}>
                            <div className="service-icon">{ICONS[page.icon] || '💡'}</div>
                            <h3>{f.title}</h3>
                            <p>{f.text}</p>
                        </div>
                    ))}
                </div>
            </section>

            <section className="section">
                <div className="section-head reveal">
                    <span className="section-eyebrow">Cara Kerja</span>
                    <h2>Tahapan pengerjaan</h2>
                </div>
                <div className="process-grid">
                    {page.process.map((st, i) => (
                        <div className="process-step reveal" key={st.k} style={{ transitionDelay: `${i * 80}ms` }}>
                            <span className="process-num">{String(i + 1).padStart(2, '0')}</span>
                            <h3>{st.k}</h3>
                            <p>{st.v}</p>
                        </div>
                    ))}
                </div>
            </section>

            <section className="section">
                <div className="target-box reveal">
                    <span className="section-eyebrow">Untuk Siapa</span>
                    <p>{page.target}</p>
                </div>
            </section>

            <section className="section">
                <div className="section-head reveal">
                    <span className="section-eyebrow">FAQ</span>
                    <h2>Pertanyaan yang sering diajukan</h2>
                </div>
                <FaqList items={page.faq} />
            </section>

            <section className="section cta-box reveal">
                <h2>{page.cta}</h2>
                <p>Balasan biasanya lewat WhatsApp dalam 1x24 jam setelah pesan diterima.</p>
                <div className="hero-actions" style={{ justifyContent: 'center' }}>
                    <Link className="btn btn-primary" to="/#kontak">Konsultasikan Proyek Anda</Link>
                    <button className="btn btn-ghost" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>Kembali ke atas ↑</button>
                </div>
            </section>
        </div>
    );
}