import { useCallback, useEffect, useState } from 'react';

const fmtWaktu = (ts) => new Date(ts).toLocaleString('id-ID', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
});

function Item({ m, onRead, onDelete, profile }) {
    const wa = (profile?.whatsapp || '').replace(/\D/g, '');
    return (
        <div className="msg-card" style={m.read ? { opacity: .72 } : undefined}>
            <div className="msg-head">
                <div style={{ minWidth: 0 }}>
                    <b>{m.name || '(tanpa nama)'}</b>
                    {!m.read && <span className="msg-dot" aria-label="belum dibaca" />}
                    <div className="msg-sub">
                        <a href={`mailto:${m.email}`}>{m.email}</a>
                        {m.kebutuhan ? ` · ${m.kebutuhan}` : ''}
                        {m.preferensi ? ` · balas via ${m.preferensi}` : ''}
                    </div>
                </div>
                <span className="msg-time">{fmtWaktu(m.ts)}</span>
            </div>
            <p className="msg-body">{m.message}</p>
            <div className="msg-actions">
                {!m.read && <button className="btn btn-ghost btn-sm" onClick={() => onRead(m.ts)}>Tandai dibaca</button>}
                {wa && <a className="btn btn-wa btn-sm" href={`https://wa.me/${wa}?text=${encodeURIComponent(`Halo ${m.name}, terima kasih sudah menghubungi Nexlipse lewat website.`)}`} target="_blank" rel="noopener noreferrer">Balas via WhatsApp</a>}
                <a className="btn btn-ghost btn-sm" href={`mailto:${m.email}?subject=${encodeURIComponent('Terima kasih telah menghubungi Nexlipse')}&body=${encodeURIComponent(`Halo ${m.name},\n\nTerima kasih sudah menghubungi Nexlipse lewat website. Saya akan segera membalas.\n\nPesan Anda:\n${m.message}`)}`}>Balas via email</a>
                <button className="btn btn-danger btn-sm" onClick={() => onDelete(m.ts)}>Hapus</button>
            </div>
        </div>
    );
}

export default function MessagesTab({ admin, profile }) {
    const [data, setData] = useState({ items: [], unread: 0, total: 0 });
    const [err, setErr] = useState('');

    const load = useCallback(() => {
        admin.get('/admin/messages').then(setData).catch((e) => setErr(e.message));
    }, [admin]);

    useEffect(() => { load(); }, [load]);

    // Polling ringan supaya pesan baru muncul tanpa perlu refresh manual.
    useEffect(() => {
        const t = setInterval(load, 20000);
        return () => clearInterval(t);
    }, [load]);

    const markRead = (ts) => admin.post('/admin/messages/read', { ids: [ts] }).then(load).catch((e) => setErr(e.message));
    const markAll = () => admin.post('/admin/messages/read', { all: true }).then(load).catch((e) => setErr(e.message));
    const del = (ts) => {
        if (!confirm('Hapus pesan ini? Tindakan ini tidak bisa dibatalkan.')) return;
        admin.del(`/admin/messages/${ts}`).then(load).catch((e) => setErr(e.message));
    };

    return (
        <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
                <p style={{ color: 'var(--text-mute)', fontSize: '.86rem', margin: 0 }}>
                    {data.unread > 0
                        ? `${data.unread} pesan belum dibaca dari total ${data.total}.`
                        : `Semua ${data.total} pesan sudah dibaca.`}
                </p>
                {data.unread > 0 && <button className="btn btn-ghost btn-sm" onClick={markAll}>Tandai semua dibaca</button>}
            </div>
            {err && <div className="form-err on">{err}</div>}
            {!data.items.length && !err && (
                <p style={{ color: 'var(--text-mute)' }}>Belum ada pesan masuk. Formulir kontak akan muncul di sini begitu ada yang mengirim.</p>
            )}
            <div className="msg-list">
                {data.items.map((m) => <Item key={m.ts} m={m} profile={profile} onRead={markRead} onDelete={del} />)}
            </div>
        </div>
    );
}
