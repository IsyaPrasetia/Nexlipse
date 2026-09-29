import { useEffect, useState } from 'react';

const input = {
    width: '100%', padding: '11px 14px', borderRadius: 12,
    border: '1px solid var(--card-border)', background: 'var(--bg-soft)', color: 'var(--text)',
    fontFamily: 'inherit', fontSize: '.9rem', transition: 'border-color .2s'
};
const lbl = { display: 'block', fontSize: '.82rem', fontWeight: 600, marginBottom: 5, color: 'var(--text-soft)' };

const ICOMAP = {
    code: '💻', server: '🖥️', bot: '🤖', rocket: '🚀', shield: '🛡️', heart: '💚',
    info: '📢', instagram: '📸', facebook: '👤', youtube: '▶️', github: '⌨️',
    tiktok: '🎵', linkedin: '🔗', light: '⚡'
};

export function TField({ label, value, onChange, type = 'text', textarea, rows = 3, placeholder, hint }) {
    const common = { ...input, ...(textarea ? { minHeight: rows * 22 } : {}) };
    return (
        <div style={{ marginBottom: 14 }}>
            {label && <label style={lbl}>{label}</label>}
            {textarea
                ? <textarea rows={rows} style={common} value={value ?? ''} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
                : <input type={type} style={common} value={value ?? ''} placeholder={placeholder} onChange={(e) => onChange(type === 'number' ? (e.target.value === '' ? '' : Number(e.target.value)) : e.target.value)} />}
            {hint && <small style={{ color: 'var(--text-mute)', fontSize: '.75rem' }}>{hint}</small>}
        </div>
    );
}

export function TSelect({ label, value, onChange, options }) {
    return (
        <div style={{ marginBottom: 14 }}>
            {label && <label style={lbl}>{label}</label>}
            <select style={input} value={value ?? ''} onChange={(e) => onChange(e.target.value)}>
                {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
        </div>
    );
}

export function Toggle({ label, checked, onChange }) {
    return (
        <label style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14, fontSize: '.88rem', color: 'var(--text-soft)', cursor: 'pointer' }}>
            <input type="checkbox" checked={!!checked} onChange={(e) => onChange(e.target.checked)} style={{ width: 18, height: 18, accentColor: 'var(--accent)' }} />
            {label}
        </label>
    );
}

function IconBtn({ onClick, label, title, danger, disabled }) {
    return (
        <button onClick={onClick} title={title} disabled={disabled}
            style={{
                width: 28, height: 28, borderRadius: 8, border: '1px solid var(--card-border)',
                background: 'var(--bg-soft)', color: danger ? 'var(--danger)' : 'var(--text-soft)',
                fontSize: '.8rem', lineHeight: 1, display: 'grid', placeItems: 'center'
            }}>{label}</button>
    );
}

export function ItemCard({ title, onRemove, onUp, onDown, upDisabled, downDisabled, children }) {
    return (
        <div style={{ background: 'var(--card)', border: '1px solid var(--card-border)', borderRadius: 14, padding: 16, marginBottom: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <b style={{ fontSize: '.9rem', color: 'var(--accent)' }}>{title}</b>
                <div style={{ display: 'flex', gap: 6 }}>
                    <IconBtn onClick={onUp} label="↑" title="Naik" disabled={upDisabled} />
                    <IconBtn onClick={onDown} label="↓" title="Turun" disabled={downDisabled} />
                    <IconBtn onClick={onRemove} label="✕" title="Hapus" danger />
                </div>
            </div>
            {children}
        </div>
    );
}

export function SectionForm({ title, hint, admin, section, children }) {
    const [doc, setDoc] = useState(null);
    const [err, setErr] = useState('');
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState('');

    useEffect(() => { load(); }, []);

    async function load() {
        try { const d = await admin.get(`/admin/${section}`); setDoc(d); setErr(''); }
        catch (e) { setErr(e.message); }
    }

    const save = async () => {
        setSaving(true); setSaved(''); setErr('');
        try {
            await admin.put(`/admin/${section}`, doc);
            setSaved('Tersimpan ✓');
        } catch (e) { setErr(e.message); } finally { setSaving(false); }
    };

    if (!doc) return <p style={{ color: 'var(--text-mute)', padding: '30px 0' }}>{err || 'Memuat…'}</p>;

    return (
        <div>
            <p style={{ fontSize: '.82rem', color: 'var(--text-mute)', marginBottom: 16 }}>{hint}</p>
            {children(doc, setDoc)}
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 16 }}>
                <button className="btn btn-primary" onClick={save} disabled={saving}>{saving ? 'Menyimpan…' : 'Simpan'}</button>
                {saved && <span style={{ color: 'var(--success)', fontWeight: 600 }}>{saved}</span>}
                {err && <span style={{ color: 'var(--danger)', fontSize: '.85rem' }}>{err}</span>}
            </div>
        </div>
    );
}

const slug = (s) => (s || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'item-' + Date.now();

const setAt = (setDoc, key, idx, patch) => setDoc((d) => {
    const arr = (d[key] || []).map((it, i) => (i === idx ? { ...it, ...patch } : it));
    return { ...d, [key]: arr };
});
const removeAt = (setDoc, key, idx) => setDoc((d) => ({ ...d, [key]: (d[key] || []).filter((_, i) => i !== idx) }));
const move = (setDoc, key, idx, dir) => setDoc((d) => {
    const arr = [...(d[key] || [])];
    const j = idx + dir;
    if (j < 0 || j >= arr.length) return d;
    [arr[idx], arr[j]] = [arr[j], arr[idx]];
    return { ...d, [key]: arr };
});

const ICON_CHOICES = Object.entries(ICOMAP).map(([value, label]) => ({ value, label: `${label} ${value}` }));

export function ProfileForm({ admin }) {
    return (
        <SectionForm admin={admin} section="profile"
            title="Profil" hint="Data identitas perusahaan dan pemilik. Simpan untuk langsung aktif.">
            {(d, setDoc) => (
                <>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                        <TField label="Nama brand" value={d.brand} onChange={(v) => setDoc({ ...d, brand: v })} />
                        <TField label="Tagline" value={d.tagline} onChange={(v) => setDoc({ ...d, tagline: v })} />
                        <TField label="Nama pemilik" value={d.name} onChange={(v) => setDoc({ ...d, name: v })} />
                        <TField label="Role" value={d.role} onChange={(v) => setDoc({ ...d, role: v })} />
                    </div>
                    <TField label="Quote (tulisan besar di hero)" value={d.quote} onChange={(v) => setDoc({ ...d, quote: v })} />
                    <TField label="Bio singkat (hero)" textarea rows={2} value={d.shortBio} onChange={(v) => setDoc({ ...d, shortBio: v })} />
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                        <TField label="Email" value={d.email} onChange={(v) => setDoc({ ...d, email: v })} />
                        <TField label="WhatsApp (628xx)" value={d.whatsapp} onChange={(v) => setDoc({ ...d, whatsapp: v })} />
                        <TField label="WhatsApp tampilan (+62 …)" value={d.whatsappDisplay} onChange={(v) => setDoc({ ...d, whatsappDisplay: v })} />
                        <TField label="Lokasi" value={d.location} onChange={(v) => setDoc({ ...d, location: v })} />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                        <TField label="URL foto/avatar" value={d.avatar} onChange={(v) => setDoc({ ...d, avatar: v })} hint="Kosongkan untuk pakai inisial." />
                    </div>

                    <SmallHead>Skill (persentase)</SmallHead>
                    {(d.skills || []).map((s, i) => (
                        <ItemCard key={i} title={s.name || `Skill ${i + 1}`}
                            onRemove={() => removeAt(setDoc, 'skills', i)}
                            onUp={() => move(setDoc, 'skills', i, -1)} upDisabled={i === 0}
                            onDown={() => move(setDoc, 'skills', i, 1)} downDisabled={i === (d.skills || []).length - 1}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 120px', gap: 10 }}>
                                <TField label="Nama" value={s.name} onChange={(v) => setAt(setDoc, 'skills', i, { name: v })} />
                                <TField label="Level %" type="number" value={s.level} onChange={(v) => setAt(setDoc, 'skills', i, { level: v })} />
                            </div>
                        </ItemCard>
                    ))}
                    <AddBtn label="+ Tambah skill" onClick={() => setDoc({ ...d, skills: [...(d.skills || []), { name: '', level: 50 }] })} />

                    <SmallHead>Layanan</SmallHead>
                    {(d.services || []).map((s, i) => (
                        <ItemCard key={i} title={s.title || `Layanan ${i + 1}`}
                            onRemove={() => removeAt(setDoc, 'services', i)}
                            onUp={() => move(setDoc, 'services', i, -1)} upDisabled={i === 0}
                            onDown={() => move(setDoc, 'services', i, 1)} downDisabled={i === (d.services || []).length - 1}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                                <TSelect label="Ikon" value={s.icon} onChange={(v) => setAt(setDoc, 'services', i, { icon: v })}
                                    options={[{ value: '', label: '(pilih)' }, ...ICON_CHOICES]} />
                                <TField label="Judul" value={s.title} onChange={(v) => setAt(setDoc, 'services', i, { title: v })} />
                            </div>
                            <TField label="Deskripsi" textarea rows={2} value={s.text} onChange={(v) => setAt(setDoc, 'services', i, { text: v })} />
                        </ItemCard>
                    ))}
                    <AddBtn label="+ Tambah layanan" onClick={() => setDoc({ ...d, services: [...(d.services || []), { icon: 'code', title: '', text: '' }] })} />

                    {d.roles && (
                        <>
                            <SmallHead>Role typewriter</SmallHead>
                            <TField label="Daftar role (dipisah koma)" value={(d.roles || []).join(', ')} onChange={(v) => setDoc({ ...d, roles: v.split(',').map((x) => x.trim()).filter(Boolean) })} />
                        </>
                    )}
                </>
            )}
        </SectionForm>
    );
}

export function AboutForm({ admin }) {
    return (
        <SectionForm admin={admin} section="about"
            title="Tentang" hint="Konten section 'Tentang': bio, keunggulan, dan sosial media.">
            {(d, setDoc) => (
                <>
                    <TField label="Bio panjang" textarea rows={4} value={d.bio} onChange={(v) => setDoc({ ...d, bio: v })} />

                    <SmallHead>Keunggulan / Highlights</SmallHead>
                    {(d.highlights || []).map((h, i) => (
                        <ItemCard key={i} title={h.title || `Highlight ${i + 1}`}
                            onRemove={() => removeAt(setDoc, 'highlights', i)}
                            onUp={() => move(setDoc, 'highlights', i, -1)} upDisabled={i === 0}
                            onDown={() => move(setDoc, 'highlights', i, 1)} downDisabled={i === (d.highlights || []).length - 1}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                                <TSelect label="Ikon" value={h.icon} onChange={(v) => setAt(setDoc, 'highlights', i, { icon: v })}
                                    options={[{ value: '', label: '(pilih)' }, ...ICON_CHOICES]} />
                                <TField label="Judul" value={h.title} onChange={(v) => setAt(setDoc, 'highlights', i, { title: v })} />
                            </div>
                            <TField label="Deskripsi" value={h.text} onChange={(v) => setAt(setDoc, 'highlights', i, { text: v })} />
                        </ItemCard>
                    ))}
                    <AddBtn label="+ Tambah highlight" onClick={() => setDoc({ ...d, highlights: [...(d.highlights || []), { icon: 'rocket', title: '', text: '' }] })} />

                    <SmallHead>Sosial Media</SmallHead>
                    {(d.socials || []).map((s, i) => (
                        <ItemCard key={i} title={s.platform || `Sosmed ${i + 1}`}
                            onRemove={() => removeAt(setDoc, 'socials', i)}
                            onUp={() => move(setDoc, 'socials', i, -1)} upDisabled={i === 0}
                            onDown={() => move(setDoc, 'socials', i, 1)} downDisabled={i === (d.socials || []).length - 1}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                                <TField label="Platform (mis. Instagram)" value={s.platform} onChange={(v) => setAt(setDoc, 'socials', i, { platform: v })} />
                                <TField label="Handle (mis. @isya)" value={s.handle} onChange={(v) => setAt(setDoc, 'socials', i, { handle: v })} />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                                <TField label="URL" value={s.url} onChange={(v) => setAt(setDoc, 'socials', i, { url: v })} />
                                <TSelect label="Ikon" value={s.icon} onChange={(v) => setAt(setDoc, 'socials', i, { icon: v })}
                                    options={[{ value: '', label: '(pilih)' }, ...ICON_CHOICES]} />
                            </div>
                        </ItemCard>
                    ))}
                    <AddBtn label="+ Tambah sosmed" onClick={() => setDoc({ ...d, socials: [...(d.socials || []), { platform: '', handle: '', url: '', icon: 'instagram' }] })} />
                </>
            )}
        </SectionForm>
    );
}

const CAT_OPTIONS = [
    { value: 'web', label: 'Web' }, { value: 'backend', label: 'Backend' },
    { value: 'fullstack', label: 'Fullstack' }, { value: 'coursework', label: 'Belajar' }
];
const STATUS_OPTIONS = [
    { value: 'done', label: 'Selesai' }, { value: 'latest', label: 'Terbaru' }, { value: 'progress', label: 'Berjalan' }
];

export function ProjectsForm({ admin }) {
    return (
        <SectionForm admin={admin} section="projects"
            title="Project" hint="Semua project portofolio. Urutkan: posisi atas tampil lebih dulu di frontend.">
            {(d, setDoc) => (
                <>
                    {(d || []).map((p, i) => (
                        <ItemCard key={p.id || i} title={p.title || `Project ${i + 1}`}
                            onRemove={() => setDoc(d.filter((_, x) => x !== i))}
                            onUp={() => setDoc((prev) => { const arr = [...prev]; const j = i - 1; if (j < 0) return prev; [arr[i], arr[j]] = [arr[j], arr[i]]; return arr; })} upDisabled={i === 0}
                            onDown={() => setDoc((prev) => { const arr = [...prev]; const j = i + 1; if (j >= arr.length) return prev; [arr[i], arr[j]] = [arr[j], arr[i]]; return arr; })} downDisabled={i === d.length - 1}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                                <TField label="Judul" value={p.title} onChange={(v) => setDoc(d.map((x, xi) => xi === i ? { ...x, title: v, id: x.id || slug(v) } : x))} />
                                <TField label="Tahun" type="number" value={p.year} onChange={(v) => setDoc(d.map((x, xi) => xi === i ? { ...x, year: v } : x))} />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                                <TSelect label="Kategori" value={p.category} onChange={(v) => setDoc(d.map((x, xi) => xi === i ? { ...x, category: v } : x))} options={CAT_OPTIONS} />
                                <TSelect label="Status" value={p.status} onChange={(v) => setDoc(d.map((x, xi) => xi === i ? { ...x, status: v } : x))} options={STATUS_OPTIONS} />
                            </div>
                            <TField label="Deskripsi singkat" value={p.short} onChange={(v) => setDoc(d.map((x, xi) => xi === i ? { ...x, short: v } : x))} />
                            <TField label="Deskripsi panjang" textarea rows={3} value={p.long} onChange={(v) => setDoc(d.map((x, xi) => xi === i ? { ...x, long: v } : x))} />
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                                <TField label="Tags (dipisah koma)" value={(p.tags || []).join(', ')} onChange={(v) => setDoc(d.map((x, xi) => xi === i ? { ...x, tags: v.split(',').map((t) => t.trim()).filter(Boolean) } : x))} />
                                <TField label="URL website (opsional)" value={p.link} onChange={(v) => setDoc(d.map((x, xi) => xi === i ? { ...x, link: v } : x))} hint="Kosongkan kalau belum ada situs publik." />
                            </div>
                            <TField label="Teks link (opsional)" value={p.linkLabel} onChange={(v) => setDoc(d.map((x, xi) => xi === i ? { ...x, linkLabel: v } : x))} hint="Kosongkan untuk otomatis pakai domain, contoh: sipandai.org" />
                            <Toggle label="Unggulan (featured)" checked={p.featured} onChange={(v) => setDoc(d.map((x, xi) => xi === i ? { ...x, featured: v } : x))} />
                        </ItemCard>
                    ))}
                    <AddBtn label="+ Tambah project" onClick={() => setDoc([...d, { id: slug('project'), title: '', category: 'web', status: 'done', year: new Date().getFullYear(), short: '', long: '', tags: [], link: '', linkLabel: '', featured: false }])} />
                </>
            )}
        </SectionForm>
    );
}

const TYPE_OPTIONS = [
    { value: 'project', label: 'Project' }, { value: 'education', label: 'Pendidikan' }
];

export function ExperienceForm({ admin }) {
    return (
        <SectionForm admin={admin} section="experience"
            title="Experience" hint="Timeline di section 'Experience'. Urutkan dari paling relevan di atas.">
            {(d, setDoc) => (
                <>
                    {(d || []).map((x, i) => (
                        <ItemCard key={x.id || i} title={x.role || x.org || `Item ${i + 1}`}
                            onRemove={() => setDoc(d.filter((_, xi) => xi !== i))}
                            onUp={() => setDoc((prev) => { const arr = [...prev]; const j = i - 1; if (j < 0) return prev; [arr[i], arr[j]] = [arr[j], arr[i]]; return arr; })} upDisabled={i === 0}
                            onDown={() => setDoc((prev) => { const arr = [...prev]; const j = i + 1; if (j >= arr.length) return prev; [arr[i], arr[j]] = [arr[j], arr[i]]; return arr; })} downDisabled={i === d.length - 1}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                                <TField label="Role / posisi" value={x.role} onChange={(v) => setDoc(d.map((y, yi) => yi === i ? { ...y, role: v, id: y.id || slug(v) } : y))} />
                                <TField label="Organisasi" value={x.org} onChange={(v) => setDoc(d.map((y, yi) => yi === i ? { ...y, org: v } : y))} />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                                <TSelect label="Tipe" value={x.type} onChange={(v) => setDoc(d.map((y, yi) => yi === i ? { ...y, type: v } : y))} options={TYPE_OPTIONS} />
                                <TField label="Periode (mis. 2026, sekarang)" value={x.period} onChange={(v) => setDoc(d.map((y, yi) => yi === i ? { ...y, period: v } : y))} />
                            </div>
                            <TField label="Deskripsi" textarea rows={2} value={x.text} onChange={(v) => setDoc(d.map((y, yi) => yi === i ? { ...y, text: v } : y))} />
                        </ItemCard>
                    ))}
                    <AddBtn label="+ Tambah item" onClick={() => setDoc([...d, { id: slug('item'), role: '', org: '', type: 'project', period: '2026', text: '' }])} />
                </>
            )}
        </SectionForm>
    );
}

export function ContactsForm({ admin }) {
    return (
        <SectionForm admin={admin} section="contacts"
            title="Kontak" hint="Pengaturan form kontak di frontend.">
            {(d, setDoc) => (
                <>
                    <Toggle label="Aktifkan form kontak" checked={d.active} onChange={(v) => setDoc({ ...d, active: v })} />
                    <TField label="Teks balasan otomatis" textarea rows={3} value={d.autoReplyNote || ''} onChange={(v) => setDoc({ ...d, autoReplyNote: v })} hint="Ditampilkan pada pengunjung setelah mengirim pesan." />
                </>
            )}
        </SectionForm>
    );
}

function SmallHead({ children }) {
    return <h4 style={{ fontSize: '.95rem', margin: '18px 0 10px', color: 'var(--text)' }}>{children}</h4>;
}

function AddBtn({ label, onClick }) {
    return (
        <button onClick={onClick} style={{
            padding: '10px 18px', borderRadius: 12, border: '1px dashed var(--accent)',
            background: 'transparent', color: 'var(--accent)', fontWeight: 600, fontSize: '.88rem', marginBottom: 18
        }}>{label}</button>
    );
}