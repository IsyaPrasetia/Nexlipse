const express = require('express');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

const PORT = process.env.PORT || 5580;
const ROOT = __dirname;
const DATA = path.join(ROOT, '..', 'data');
const DIST = path.join(ROOT, '..', 'client', 'dist');
const ADMIN_FILE = path.join(DATA, 'admin-user.json');
const MSG_FILE = path.join(DATA, 'messages.json');

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

function hashPassword(pw, salt) {
    return crypto.scryptSync(String(pw), salt, 64).toString('hex');
}
function getAdminUser() {
    let u = readJson(ADMIN_FILE, null);
    if (!u || !u.salt) {
        u = { salt: crypto.randomBytes(16).toString('hex'), passHash: null, token: null };
        writeJson(ADMIN_FILE, u);
    }
    return u;
}

const AUTH_TOKENS = new Map();

(() => {
    const u = readJson(ADMIN_FILE, null);
    if (u && u.token) AUTH_TOKENS.set(u.token, u.token);
})();

function requireAdmin(req, res, next) {
    const token = (req.headers.authorization || '').replace(/^Bearer\s+/i, '');
    const u = getAdminUser();
    if (u.token && AUTH_TOKENS.get(token) === u.token) return next();
    return res.status(401).json({ error: 'Unowned' });
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
    const { name, email, message, kebutuhan, budget, deadline, preferensi } = req.body || {};
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
        budget: String(budget || '').slice(0, 60),
        deadline: String(deadline || '').slice(0, 120),
        preferensi: String(preferensi || '').slice(0, 40),
        message: String(message).slice(0, 4000)
    };
    const list = readJson(MSG_FILE, []);
    list.push(entry);
    writeJson(MSG_FILE, list);

    const cfg = readJson(path.join(DATA, 'contacts.json'), {});
    res.json({ ok: true, thank: cfg.autoReplyNote || 'Terima kasih sudah menghubungi!' });
});

// ================= ADMIN API =================
app.post('/api/admin/login', rateLimit(5, 10 * 60 * 1000, 'Terlalu banyak percobaan login. Coba lagi 10 menit lagi.'), (req, res) => {
    const { password } = req.body || {};
    const u = getAdminUser();
    if (!u.passHash) return res.status(400).json({ error: 'Password admin belum diatur. Set env ADMIN_PASSWORD lalu restart server.' });
    const tried = hashPassword(password || '', u.salt);
    if (tried === u.passHash) {
        u.token = crypto.randomBytes(24).toString('hex');
        writeJson(ADMIN_FILE, u);
        AUTH_TOKENS.set(u.token, u.token);
        return res.json({ ok: true, token: u.token });
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