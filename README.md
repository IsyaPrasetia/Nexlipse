# Nexlipse — Portfolio & Company Site

Online portfolio milik **Nexlipse** (Fullstack & Mini Server Studio) — karya **Mohammad Isya Prasetia**.

## Stack
- **Frontend**: React 18 + Vite (tema terang/gelap, hash-router)
- **Backend**: Express (API publik + admin tersembunyi)
- **Data**: file JSON di `data/`, bisa diedit lewat admin
- **Deploy**: PM2, satu proses / satu port (default `5580`)

## Struktur
```
client/       # React + Vite (build → client/dist)
server/       # Express API + notifikasi WA (wa-notify.js)
data/         # JSON yang bisa diedit: profile, about, projects, experience, contacts
```

## Menjalankan
```bash
npm install          # deps server (di root)
cd client && npm install && npm run build   # build frontend
# jalankan server:
ADMIN_PASSWORD=xxx PORT=5580 node server/index.js
# atau via PM2 (ecosystem.config.js)
```

## Admin (tersembunyi)
Login di `#/admin` (tidak ada tombol di halaman publik):
- Modal `profile / about / projects / experience / contacts`
- Edit JSON langsung lalu Simpan — langsung aktif tanpa restart
- `contacts`: set tujuan notifikasi WA + on/off

Password admin disimpan sebagai hash scrypt di `data/admin-user.json` (gitignored).
Atur pertama kali via env `ADMIN_PASSWORD` saat start.

## Kontak
- Form kontak → tersimpan ke `data/messages.json`
- Tombol WhatsApp langsung ke `wa.me/<profile.whatsapp>` (format internasional, mis. `6285959667602`)

## Lisensi
MIT © Nexlipse