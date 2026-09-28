import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import { ProfileForm, AboutForm, ProjectsForm, ExperienceForm, ContactsForm } from './AdminForms.jsx';

const TOKEN_KEY = 'nexlipse-admin-token';
const TABS = [
    { key: 'profile', label: 'Profil' },
    { key: 'about', label: 'Tentang' },
    { key: 'projects', label: 'Project' },
    { key: 'experience', label: 'Experience' },
    { key: 'contacts', label: 'Kontak' },
    { key: 'json', label: 'Lanjutan (JSON)' }
];

export default function Admin() {
    const [token, setToken] = useState(() => { try { return localStorage.getItem(TOKEN_KEY) || ''; } catch { return ''; } });
    const nav = useNavigate();
    const [pw, setPw] = useState('');
    const [err, setErr] = useState('');
    const [busy, setBusy] = useState(false);
    const [tab, setTab] = useState('profile');

    const admin = useMemo(() => api.admin(token), [token]);

    useEffect(() => {
        if (!token) return;
        admin.get('/admin/verify').catch(() => { setToken(''); try { localStorage.removeItem(TOKEN_KEY); } catch {} });
    }, [token]);

    const login = async (e) => {
        e.preventDefault(); setBusy(true); setErr('');
        try {
            const r = await api.post('/admin/login', { password: pw });
            try { localStorage.setItem(TOKEN_KEY, r.token); } catch {}
            setToken(r.token);
        } catch (ex) { setErr(ex.message); } finally { setBusy(false); }
    };

    const logout = () => { try { localStorage.removeItem(TOKEN_KEY); } catch {} setToken(''); nav('/'); };

    const styles = {
        wrap: { minHeight: '100vh', padding: '84px 20px 60px', maxWidth: 1080, margin: '0 auto' },
        tabs: { display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 22 },
        tab: { padding: '9px 18px', borderRadius: 999, border: '1px solid var(--card-border)', background: 'var(--card)', color: 'var(--text-soft)', fontSize: '.9rem', fontFamily: 'inherit' },
        tabOn: { padding: '9px 18px', borderRadius: 999, border: 'none', background: 'var(--grad)', color: '#fff', fontSize: '.9rem', fontWeight: 600, fontFamily: 'inherit' },
        editor: { width: '100%', minHeight: 440, borderRadius: 14, border: '1px solid var(--card-border)', background: 'var(--bg-soft)', color: 'var(--text)', fontFamily: 'Consolas, monospace', fontSize: '.86rem', padding: 16, resize: 'vertical' }
    };

    if (!token) {
        return (
            <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: '80px 20px 0' }}>
                <form onSubmit={login} style={{ width: '100%', maxWidth: 380, background: 'var(--card)', border: '1px solid var(--card-border)', borderRadius: 18, padding: 30 }}>
                    <h2 style={{ marginBottom: 4 }}>Admin <span style={{ color: 'var(--accent)' }}>Nexlipse</span></h2>
                    <p style={{ color: 'var(--text-mute)', fontSize: '.85rem', marginBottom: 20 }}>Akses terbatas. Halaman ini tidak ditautkan dari situs publik.</p>
                    <div className="field">
                        <label>Password</label>
                        <input type="password" value={pw} onChange={(e) => setPw(e.target.value)} autoFocus />
                    </div>
                    <button className="btn btn-primary" type="submit" disabled={busy} style={{ width: '100%' }}>{busy ? 'Memeriksa…' : 'Masuk'}</button>
                    {err && <div className="form-err">{err}</div>}
                </form>
            </div>
        );
    }

    return (
        <div style={styles.wrap}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
                <h2>Admin <span style={{ color: 'var(--accent)' }}>Nexlipse</span></h2>
                <button className="btn btn-ghost" onClick={logout}>Keluar</button>
            </div>
            <div style={styles.tabs}>
                {TABS.map((t) => (
                    <button key={t.key} style={tab === t.key ? styles.tabOn : styles.tab} onClick={() => setTab(t.key)}>{t.label}</button>
                ))}
            </div>

            {tab === 'profile' && <ProfileForm admin={admin} />}
            {tab === 'about' && <AboutForm admin={admin} />}
            {tab === 'projects' && <ProjectsForm admin={admin} />}
            {tab === 'experience' && <ExperienceForm admin={admin} />}
            {tab === 'contacts' && <ContactsForm admin={admin} />}
            {tab === 'json' && <JsonEditor admin={admin} />}
        </div>
    );
}

function JsonEditor({ admin }) {
    const [section, setSection] = useState('profile');
    const [doc, setDoc] = useState(null);
    const [draft, setDraft] = useState('');
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState('');
    const [err, setErr] = useState('');

    useEffect(() => { load(section); }, [section]);

    function load(s) {
        admin.get(`/admin/${s}`).then((d) => { setDoc(d); setDraft(JSON.stringify(d, null, 2)); }).catch((e) => setErr(e.message));
    }

    const save = async () => {
        setSaving(true); setSaved(''); setErr('');
        try {
            const parsed = JSON.parse(draft);
            await admin.put(`/admin/${section}`, parsed);
            setDoc(parsed); setSaved('Tersimpan ✓');
        } catch (ex) { setErr(ex instanceof SyntaxError ? 'JSON tidak valid: ' + ex.message : ex.message); }
        finally { setSaving(false); }
    };

    const styles = {
        jsonTabs: { display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 },
        jsonTab: { padding: '6px 14px', borderRadius: 999, border: '1px solid var(--card-border)', background: 'var(--card)', color: 'var(--text-soft)', fontSize: '.82rem', fontFamily: 'inherit' },
        jsonTabOn: { padding: '6px 14px', borderRadius: 999, border: 'none', background: 'var(--grad)', color: '#fff', fontSize: '.82rem', fontFamily: 'inherit' },
        editor: { width: '100%', minHeight: 440, borderRadius: 14, border: '1px solid var(--card-border)', background: 'var(--bg-soft)', color: 'var(--text)', fontFamily: 'Consolas, monospace', fontSize: '.86rem', padding: 16, resize: 'vertical' }
    };

    return (
        <div>
            <p style={{ fontSize: '.82rem', color: 'var(--text-mute)', marginBottom: 12 }}>
                Mode lanjutan untuk pengeditan presisi. Kebanyakan kebutuhan sudah cukup via tab form di atas.
            </p>
            <div style={styles.jsonTabs}>
                {['profile', 'about', 'projects', 'experience', 'contacts'].map((s) => (
                    <button key={s} style={section === s ? styles.jsonTabOn : styles.jsonTab} onClick={() => { setSection(s); }}>{s}</button>
                ))}
            </div>
            <textarea spellCheck={false} style={styles.editor} value={draft} onChange={(e) => setDraft(e.target.value)} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 16 }}>
                <button className="btn btn-primary" onClick={save} disabled={saving}>{saving ? 'Menyimpan…' : 'Simpan'}</button>
                {saved && <span style={{ color: 'var(--success)', fontWeight: 600 }}>{saved}</span>}
                {err && <span style={{ color: 'var(--danger)', fontSize: '.85rem' }}>{err}</span>}
            </div>
            {!doc && !err && <p style={{ color: 'var(--text-mute)', marginTop: 18 }}>Memuat…</p>}
        </div>
    );
}