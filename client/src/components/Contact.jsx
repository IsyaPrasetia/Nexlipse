import { useState } from 'react';
import { api } from '../api';

export default function Contact({ profile, config }) {
    const [form, setForm] = useState({ name: '', email: '', message: '' });
    const [sending, setSending] = useState(false);
    const [msg, setMsg] = useState('');
    const [err, setErr] = useState('');

    const submit = async (e) => {
        e.preventDefault();
        setSending(true); setMsg(''); setErr('');
        try {
            const r = await api.post('/contact', form);
            setMsg(r.thank || 'Terima kasih sudah menghubungi!');
            setForm({ name: '', email: '', message: '' });
        } catch (ex) {
            setErr(ex.message);
        } finally { setSending(false); }
    };

    const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

    return (
        <section className="section" id="kontak">
            <div className="section-head reveal">
                <span className="section-eyebrow">Kontak</span>
                <h2>Mari Bicara Ide Kamu</h2>
                <p>Butuh website, bot, atau setup server sendiri? Ceritakan kebutuhanmu.</p>
            </div>
            <div className="contact-wrap">
                <div className="contact-info reveal">
                    <p className="big">Ayo mulai dari <span style={{ color: 'var(--accent)' }}>{profile.brand}</span></p>
                    <p>Kirim pesan lewat formulir, atau hubungi langsung:</p>
                    <a className="mail" href={`mailto:${profile.email}`}>✉️ {profile.email}</a>
                    <p style={{ marginTop: 18 }}>{config.active ? config.autoReplyNote || '' : ''}</p>
                </div>
                <form className="reveal" onSubmit={submit}>
                    <div className="field">
                        <label>Nama *</label>
                        <input value={form.name} onChange={set('name')} placeholder="Nama kamu" required />
                    </div>
                    <div className="field">
                        <label>Email</label>
                        <input type="email" value={form.email} onChange={set('email')} placeholder="email@kamu.com" />
                    </div>
                    <div className="field">
                        <label>Pesan *</label>
                        <textarea rows="5" value={form.message} onChange={set('message')} placeholder="Ceritakan kebutuhanmu..." required />
                    </div>
                    <button className="btn btn-primary" type="submit" disabled={sending} style={{ width: '100%' }}>
                        {sending ? 'Mengirim…' : 'Kirim Pesan 🚀'}
                    </button>
                    <div className="form-notice">{msg}</div>
                    <div className="form-err">{err}</div>
                </form>
            </div>
        </section>
    );
}