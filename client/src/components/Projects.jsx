import { useMemo, useState } from 'react';

const STATUS = { done: ['Selesai', 'status-done'], latest: ['Terbaru', 'status-latest'], progress: ['Berjalan', 'status-progress'] };
const FILTERS = [
    { key: 'all', label: 'Semua' },
    { key: 'featured', label: 'Unggulan' },
    { key: 'latest', label: 'Terbaru' },
    { key: 'web', label: 'Web' },
    { key: 'backend', label: 'Backend' },
    { key: 'fullstack', label: 'Fullstack' },
    { key: 'coursework', label: 'Belajar' }
];

export default function Projects({ projects }) {
    const [filter, setFilter] = useState('all');
    const list = useMemo(() => {
        if (filter === 'all') return projects;
        if (filter === 'featured') return projects.filter((p) => p.featured);
        return projects.filter((p) => p.category === filter || (filter === 'latest' && p.status === 'latest'));
    }, [filter, projects]);

    return (
        <section className="section" id="project">
            <div className="section-head reveal">
                <span className="section-eyebrow">Portofolio</span>
                <h2>Project Terpilih</h2>
                <p>Produk yang bukan hanya demo — dipakai beneran oleh pengguna setiap hari.</p>
            </div>
            <div className="projects-filter reveal">
                {FILTERS.map((f) => (
                    <button key={f.key} className={`filter-btn ${filter === f.key ? 'active' : ''}`} onClick={() => setFilter(f.key)}>
                        {f.label}
                    </button>
                ))}
            </div>
            <div className="projects-grid">
                {list.map((p, i) => {
                    const st = STATUS[p.status] || STATUS.done;
                    return (
                        <article className="project-card reveal" style={{ transitionDelay: `${(i % 3) * 60}ms` }} key={p.id}>
                            <div className="project-top">
                                <span className={`status-badge ${st[1]}`}>{st[0]}</span>
                                <span style={{ color: 'var(--text-mute)', fontSize: '.8rem' }}>{p.year}</span>
                            </div>
                            <div className="project-body">
                                <h3>{p.title}</h3>
                                <p>{p.short}</p>
                                <div className="project-tags">{(p.tags || []).map((t) => <span className="tag" key={t}>{t}</span>)}</div>
                                <div className="project-links">
                                    {p.repo ? <a href={p.repo} target="_blank" rel="noopener noreferrer">GitHub ↗</a> : null}
                                    {p.status === 'progress' ? <span style={{ fontSize: '.82rem', color: '#f59e0b' }}>Sedang dikerjakan…</span> : p.status === 'latest' ? <span style={{ fontSize: '.82rem', color: 'var(--accent)' }}>Proyek saat ini</span> : null}
                                </div>
                            </div>
                        </article>
                    );
                })}
            </div>
            <p className="yearly">Lainnya bisa dilihat di <a href="https://github.com/IsyaPrasetia" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)', fontWeight: 600 }}>github.com/IsyaPrasetia</a></p>
        </section>
    );
}