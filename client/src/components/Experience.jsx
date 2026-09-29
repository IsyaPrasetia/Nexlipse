export default function Experience({ experience }) {
    return (
        <section className="section" id="experience">
            <div className="section-head reveal">
                <span className="section-eyebrow">Perjalanan</span>
                <h2>Pengalaman</h2>
                <p>Dari ruang kelas sampai server produksi, setiap langkah membentuk siapa sekarang.</p>
            </div>
            <div className="timeline">
                {experience.map((e) => (
                    <div className="tl-item reveal" key={e.id}>
                        <span className="tl-dot" />
                        <h3>{e.role}</h3>
                        <span className="org">{e.org}</span>
                        <span className="period">{e.period}</span>
                        <p>{e.text}</p>
                    </div>
                ))}
            </div>
        </section>
    );
}