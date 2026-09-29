import { useState } from 'react';
import { api } from '../api';

export default function Contact({ profile, config }) {
    const EMPTY = { name: '', email: '', message: '', kebutuhan: '', preferensi: 'WhatsApp' };
    const [form, setForm] = useState(EMPTY);
    const [sending, setSending] = useState(false);
    const [msg, setMsg] = useState('');
    const [err, setErr] = useState('');

    const submit = async (e) => {
        e.preventDefault();
        setSending(true); setMsg(''); setErr('');
        try {
            const r = await api.post('/contact', form);
            setMsg(r.thank || 'Terima kasih sudah menghubungi!');
            setForm(EMPTY);
        } catch (ex) {
            setErr(ex.message);
        } finally { setSending(false); }
    };

    const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

    return (
        <section className="section" id="kontak">
            <div className="section-head reveal">
                <span className="section-eyebrow">Kontak</span>
                <h2>Mari Bicara Kebutuhan Anda</h2>
                <p>Butuh website, bot, atau setup server sendiri? Ceritakan kebutuhan Anda, nanti saya bantu pilihkan yang paling pas.</p>
            </div>
            <div className="contact-wrap">
                <div className="contact-info reveal">
                    <p className="big">Ayo mulai dari <span style={{ color: 'var(--accent)' }}>{profile.brand}</span></p>
                    <p>Butuh jawaban lebih cepat? Hubungi langsung:</p>
                    {profile.whatsapp ? (
                        <a className="btn btn-wa" href={`https://wa.me/${profile.whatsapp}`} target="_blank" rel="noopener noreferrer" style={{ marginBottom: 12 }}>
                            💬 WhatsApp, {profile.whatsappDisplay || profile.whatsapp}
                        </a>
                    ) : null}
                    <a className="mail" href={`mailto:${profile.email}`} style={{ display: 'inline-flex' }}>✉️ {profile.email}</a>
                    {config.active ? (
                        <p style={{ marginTop: 18, fontSize: '.88rem', color: 'var(--text-mute)' }}>
                            {config.processNote || 'Isi form di samping atau hubungi langsung. Balasan biasanya di hari kerja.'}
                        </p>
                    ) : null}
                </div>
                <form className="reveal" onSubmit={submit} noValidate>
                    <div className="field">
                        <label htmlFor="c-name">Nama *</label>
                        <input id="c-name" value={form.name} onChange={set('name')} placeholder="Nama kamu" required />
                    </div>
                    <div className="field">
                        <label htmlFor="c-email">Email *</label>
                        <input id="c-email" type="email" value={form.email} onChange={set('email')} placeholder="email@kamu.com" required />
                    </div>
                    <div className="field">
                        <label htmlFor="c-kebutuhan">Kebutuhan Anda</label>
                        <select id="c-kebutuhan" value={form.kebutuhan} onChange={set('kebutuhan')}>
                            <option value="">Pilih jenis layanan</option>
                            <option>Website landing page / company profile</option>
                            <option>Dashboard atau aplikasi internal</option>
                            <option>Bot WhatsApp otomatis</option>
                            <option>Setup dan perawatan mini server</option>
                            <option>Belum yakin, butuh konsultasi</option>
                        </select>
                    </div>
                    <div className="field">
                        <label>Preferensi Kontak *</label>
                        <div className="radio-row">
                            {['Email', 'WhatsApp'].map((o) => (
                                <label key={o} className={`radio-chip${form.preferensi === o ? ' on' : ''}`}>
                                    <input type="radio" name="preferensi" value={o} checked={form.preferensi === o} onChange={set('preferensi')} />
                                    {o}
                                </label>
                            ))}
                        </div>
                    </div>
                    <div className="field">
                        <label htmlFor="c-message">Pesan *</label>
                        <textarea id="c-message" rows="5" value={form.message} onChange={set('message')} placeholder="Ceritakan kebutuhan Anda..." required />
                    </div>
                    <button className="btn btn-primary" type="submit" disabled={sending} style={{ width: '100%' }}>
                        {sending ? 'Mengirim…' : 'Kirim Pesan'}
                    </button>
                    <div className={`form-notice${msg ? ' on' : ''}`} role="status">{msg}</div>
                    <div className={`form-err${err ? ' on' : ''}`} role="alert">{err}</div>
                </form>
            </div>
        </section>
    );
}