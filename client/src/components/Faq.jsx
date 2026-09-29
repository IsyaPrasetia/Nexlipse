import { Link } from 'react-router-dom';
import { JsonLd } from '../seo';

export default function Faq({ items }) {
    const list = Array.isArray(items) ? items : [];
    if (!list.length) return null;

    return (
        <section className="section" id="faq">
            <JsonLd data={{
                '@context': 'https://schema.org',
                '@type': 'FAQPage',
                mainEntity: list.map((f) => ({
                    '@type': 'Question',
                    name: f.q,
                    acceptedAnswer: { '@type': 'Answer', text: f.a }
                }))
            }} />
            <div className="section-head reveal">
                <span className="section-eyebrow">FAQ</span>
                <h2>Pertanyaan yang Sering Diajukan</h2>
                <p>Jawaban yang biasa dicari sebelum mulai konsultasi.</p>
            </div>
            <div className="faq-list">
                {list.map((f, i) => (
                    <details className="faq-item reveal" key={i} style={{ transitionDelay: `${i * 60}ms` }}>
                        <summary>{f.q}</summary>
                        <p>{f.a}</p>
                    </details>
                ))}
            </div>
            <p style={{ textAlign: 'center', marginTop: 22, color: 'var(--text-mute)', fontSize: '.9rem' }}>
                Masih ada pertanyaan lain? <Link to="/#kontak" style={{ color: 'var(--accent)' }}>Tanyakan langsung di sini</Link>.
            </p>
        </section>
    );
}