const express = require('express');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

const PORT = process.env.PORT || 5580;
const ROOT = __dirname;
const DATA = path.join(ROOT, '..', 'data');
const DIST = path.join(ROOT, '..', 'client', 'dist');
const ADMIN_FILE = path.join(DATA, 'admin-user.json');
const MSG_FILE = path.join(DATA, 'messages.json');
const SITE_URL = process.env.SITE_URL || 'https://nexlipse.my.id';
const NOTIFY_EMAIL = process.env.NOTIFY_EMAIL || 'nexlipse.id@gmail.com';

const app = express();
app.disable('x-powered-by');
app.use(express.json({ limit: '2mb' }));
app.use('/api/admin/login', express.json({ limit: '16kb' }));

// ================= SECURITY HEADERS =================
app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    res.setHeader('X-XSS-Protection', '0');
    res.setHeader('Content-Security-Policy',
        "default-src 'self'; img-src 'self' data: https:; style-src 'self' 'unsafe-inline'; " +
        "font-src 'self' data:; script-src 'self'; connect-src 'self' https:; frame-ancestors 'none'; " +
        "base-uri 'self'; form-action 'self'"
    );
    if (req.secure || req.headers['x-forwarded-proto'] === 'https') {
        res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    }
    next();
});

// ================= RATE LIMIT (per IP) =================
const rateBuckets = new Map();
function rateLimit(max, windowMs, message) {
    return (req, res, next) => {
        const ip = req.headers['x-forwarded-for'] ? String(req.headers['x-forwarded-for']).split(',')[0].trim() : req.ip;
        const now = Date.now();
        const b = rateBuckets.get(ip) || { t: now, n: 0 };
        if (now - b.t > windowMs) { b.t = now; b.n = 0; }
        b.n++;
        rateBuckets.set(ip, b);
        if (b.n > max) return res.status(429).json({ error: message || 'Terlalu banyak permintaan. Coba lagi nanti.' });
        next();
    };
}

function readJson(file, fallback) {
    try {
        return JSON.parse(fs.readFileSync(file, 'utf8'));
    } catch (e) {
        // Jangan ditelan diam-diam. JSON rusak (mis. koma berlebih) bikin situs
        // diam-diam pakai nilai default. Log saja supaya mudah ketahuan.
        if (e.code !== 'ENOENT') console.error(`[data] GAGAL parse ${path.basename(file)}: ${e.message} | pakai fallback`);
        return fallback;
    }
}
function writeJson(file, data) {
    fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf8');
}

// ================= NOTIFIKASI EMAIL =================
// SMTP dikonfigurasi lewat env. Kalau belum diisi, notifikasi email dilewati
// (pesan tetap tersimpan di messages.json) dan hanya dicatat di log.
let mailer = null;
if (process.env.SMTP_USER && process.env.SMTP_PASS) {
    mailer = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: Number(process.env.SMTP_PORT || 587),
        secure: false,
        auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
    });
    console.log('[mail] SMTP aktif, notifikasi ke', NOTIFY_EMAIL);
} else {
    console.log('[mail] SMTP belum di-set (SMTP_USER/SMTP_PASS). Notifikasi email nonaktif.');
}

function escHtml(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, (c) => (
        { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
    ));
}

async function notifyNewMessage(entry) {
    if (!mailer) return false;
    const stamp = new Date(entry.ts).toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' });
    const fields = [
        ['Nama', entry.name],
        ['Email', entry.email],
        ['Kebutuhan', entry.kebutuhan || '-'],
        ['Preferensi kontak', entry.preferensi || '-'],
        ['Waktu', stamp]
    ];
    const rows = fields.map(([k, v]) => `<tr><td style="padding:6px 12px;border-bottom:1px solid #eee;color:#666;width:150px">${escHtml(k)}</td><td style="padding:6px 12px;border-bottom:1px solid #eee">${escHtml(v)}</td></tr>`).join('');

    try {
        await mailer.sendMail({
            from: process.env.SMTP_USER,
            to: NOTIFY_EMAIL,
            subject: `Pesan baru dari ${SITE_URL}: ${entry.name}`,
            text: [
                'Ada pesan baru di formulir kontak Nexlipse.',
                '',
                ...fields.map(([k, v]) => `${k}: ${v}`),
                '',
                `Pesan:\n${entry.message}`,
                '',
                `Buka dashboard: ${SITE_URL}/admin`
            ].join('\n'),
            html: `
<div style="font-family:Segoe UI,Roboto,sans-serif;background:#f7f5f1;padding:24px">
  <div style="max-width:560px;margin:0 auto;background:#fff;border-radius:14px;overflow:hidden;border:1px solid #e8e2d8">
    <div style="background:#0d0d0f;padding:20px 24px">
      <div style="color:#d3ab67;font-size:13px;letter-spacing:1px;text-transform:uppercase">Notifikasi</div>
      <div style="color:#fff;font-size:19px;font-weight:600;margin-top:4px">Ada pesan baru di nexlipse.my.id</div>
    </div>
    <div style="padding:24px">
      <table style="width:100%;border-collapse:collapse;font-size:14px">${rows}</table>
      <div style="margin-top:20px;padding:16px;background:#f7f5f1;border-radius:10px">
        <div style="font-size:12px;color:#666;margin-bottom:6px">PESAN</div>
        <div style="font-size:14px;line-height:1.6;white-space:pre-wrap">${escHtml(entry.message)}</div>
      </div>
      <a href="${SITE_URL}/admin" style="display:inline-block;margin-top:22px;background:#9b7a3f;color:#fff;text-decoration:none;padding:12px 22px;border-radius:10px;font-weight:600;font-size:14px">Buka Dashboard Admin</a>
    </div>
  </div>
</div>`
        });
        console.log('[mail] notifikasi terkirim ke', NOTIFY_EMAIL);
        return true;
    } catch (e) {
        console.error('[mail] GAGAL kirim notifikasi:', e.message);
        return false;
    }
}

function hashPassword(pw, salt) {
    return crypto.scryptSync(String(pw), salt, 64).toString('hex');
}
function getAdminUser() {
    let u = readJson(ADMIN_FILE, null);
    if (!u || !u.salt) {
        u = { salt: crypto.randomBytes(16).toString('hex'), passHash: null, tokens: [] };
        writeJson(ADMIN_FILE, u);
    }
    // Migrasi model lama (satu token) ke daftar token.
    if (!Array.isArray(u.tokens)) u.tokens = u.token ? [u.token] : [];
    return u;
}

const AUTH_TOKENS = new Map();

(() => {
    const u = readJson(ADMIN_FILE, null);
    if (u) {
        const list = Array.isArray(u.tokens) ? u.tokens : (u.token ? [u.token] : []);
        for (const t of list) AUTH_TOKENS.set(t, t);
    }
})();

// Daftar token yang boleh dipakai bersamaan. Login di tab/perangkat lain tidak
// lagi menonaktifkan sesi yang sudah aktif, jadi "Unowned" tidak muncul lagi.
function requireAdmin(req, res, next) {
    const token = (req.headers.authorization || '').replace(/^Bearer\s+/i, '');
    if (token && AUTH_TOKENS.has(token)) return next();
    return res.status(401).json({ error: 'Sesi berakhir. Silakan masuk lagi.' });
}

// ================= PUBLIC API =================
app.get('/api/profile', (req, res) => res.json(readJson(path.join(DATA, 'profile.json'), { brand: 'Nexlipse' })));
app.get('/api/about', (req, res) => res.json(readJson(path.join(DATA, 'about.json'), {})));
app.get('/api/projects', (req, res) => res.json(readJson(path.join(DATA, 'projects.json'), [])));
app.get('/api/experience', (req, res) => res.json(readJson(path.join(DATA, 'experience.json'), [])));
app.get('/api/contacts-config', (req, res) => {
    const c = readJson(path.join(DATA, 'contacts.json'), { active: true, autoReplyNote: '', processNote: '' });
    res.json({ active: !!c.active, autoReplyNote: c.autoReplyNote || '', processNote: c.processNote || '' });
});

// ================= CONTACT FORM =================
app.post('/api/contact', rateLimit(10, 60 * 1000, 'Terlalu banyak pesan. Coba lagi beberapa saat.'), async (req, res) => {
    const { name, email, message, kebutuhan, preferensi } = req.body || {};
    if (!name || !message) return res.status(400).json({ error: 'Nama dan pesan wajib diisi.' });
    if (String(message).length > 4000) return res.status(400).json({ error: 'Pesan terlalu panjang.' });
    const emailStr = String(email || '').trim();
    if (!emailStr) return res.status(400).json({ error: 'Email wajib diisi agar kami bisa membalas.' });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(emailStr)) return res.status(400).json({ error: 'Format email tidak valid.' });
    const entry = {
        ts: Date.now(),
        name: String(name).slice(0, 120),
        email: emailStr.slice(0, 200),
        kebutuhan: String(kebutuhan || '').slice(0, 120),
        preferensi: String(preferensi || '').slice(0, 40),
        message: String(message).slice(0, 4000)
    };
    const list = readJson(MSG_FILE, []);
    list.push(entry);
    writeJson(MSG_FILE, list);

    // Notifikasi email best-effort. Kalau SMTP gagal, pesan tetap aman di file
    // dan pengunjung tetap dapat balasan (tidak bergantung pada email).
    notifyNewMessage(entry).catch(() => {});

    const cfg = readJson(path.join(DATA, 'contacts.json'), {});
    res.json({ ok: true, thank: cfg.autoReplyNote || 'Terima kasih sudah menghubungi!' });
});

// ================= ADMIN: PESAN MASUK =================
app.get('/api/admin/messages', requireAdmin, (req, res) => {
    const list = readJson(MSG_FILE, []);
    const items = list.slice().reverse().map((m) => ({ ...m, read: !!m.read }));
    res.json({ items, unread: items.filter((m) => !m.read).length, total: items.length });
});

app.post('/api/admin/messages/read', requireAdmin, (req, res) => {
    const { ids, all } = req.body || {};
    const list = readJson(MSG_FILE, []);
    const set = Array.isArray(ids) ? new Set(ids.map(Number)) : null;
    let n = 0;
    for (const m of list) {
        const should = all ? true : (set && set.has(Number(m.ts)) && !m.read);
        if (should) { m.read = true; m.readAt = Date.now(); n++; }
    }
    writeJson(MSG_FILE, list);
    res.json({ ok: true, updated: n });
});

app.delete('/api/admin/messages/:ts', requireAdmin, (req, res) => {
    const ts = Number(req.params.ts);
    const list = readJson(MSG_FILE, []);
    const next = list.filter((m) => Number(m.ts) !== ts);
    if (next.length === list.length) return res.status(404).json({ error: 'Pesan tidak ditemukan.' });
    writeJson(MSG_FILE, next);
    res.json({ ok: true });
});

// ================= ADMIN API =================
app.post('/api/admin/login', rateLimit(5, 10 * 60 * 1000, 'Terlalu banyak percobaan login. Coba lagi 10 menit lagi.'), (req, res) => {
    const { password } = req.body || {};
    const u = getAdminUser();
    if (!u.passHash) return res.status(400).json({ error: 'Password admin belum diatur. Set env ADMIN_PASSWORD lalu restart server.' });
    const tried = hashPassword(password || '', u.salt);
    if (tried === u.passHash) {
        const tok = crypto.randomBytes(24).toString('hex');
        u.tokens = (u.tokens || []).concat(tok).slice(-20);
        writeJson(ADMIN_FILE, u);
        AUTH_TOKENS.set(tok, tok);
        return res.json({ ok: true, token: tok });
    }
    return res.status(401).json({ error: 'Password salah.' });
});

app.get('/api/admin/verify', requireAdmin, (req, res) => res.json({ ok: true }));

const EDITABLE = ['profile', 'about', 'projects', 'experience', 'contacts'];
app.get('/api/admin/:section', requireAdmin, (req, res) => {
    const s = req.params.section;
    if (!EDITABLE.includes(s)) return res.status(404).json({ error: 'Section tidak dikenal.' });
    res.json(readJson(path.join(DATA, `${s}.json`), null));
});

app.put('/api/admin/:section', requireAdmin, (req, res) => {
    const s = req.params.section;
    if (!EDITABLE.includes(s)) return res.status(400).json({ error: 'Section tidak dikenal.' });
    if (s === 'contacts') {
        const cur = readJson(path.join(DATA, 'contacts.json'), {});
        const next = req.body || {};
        cur.active = !!next.active;
        cur.waNotify = !!next.waNotify;
        cur.notifyTarget = String(next.notifyTarget || '').trim();
        if (next.autoReplyNote !== undefined) cur.autoReplyNote = String(next.autoReplyNote).slice(0, 500);
        if (next.processNote !== undefined) cur.processNote = String(next.processNote).slice(0, 500);
        writeJson(path.join(DATA, 'contacts.json'), cur);
        return res.json({ ok: true });
    }
    writeJson(path.join(DATA, `${s}.json`), req.body);
    res.json({ ok: true });
});

// ================= STATIC (BUILD) =================
if (fs.existsSync(DIST)) {
    app.use(express.static(DIST));
    app.get(/^(?!\/api\/).*/, (req, res) => res.sendFile(path.join(DIST, 'index.html')));
}

app.listen(PORT, '0.0.0.0', () => {
    console.log(`\n✨ Nexlipse server jalan di http://localhost:${PORT}`);
    const u = getAdminUser();
    if (process.env.ADMIN_PASSWORD) {
        const updated = hashPassword(process.env.ADMIN_PASSWORD, u.salt);
        if (u.passHash !== updated) {
            u.passHash = updated;
            writeJson(ADMIN_FILE, u);
            console.log('🔑 ADMIN_PASSWORD berhasil disimpan.');
        }
    }
    if (!u.passHash) console.log('⚠️  ADMIN_PASSWORD belum diatur. Set via env: ADMIN_PASSWORD=xxx'); else console.log('🔑 Admin terkonfigurasi.');
});