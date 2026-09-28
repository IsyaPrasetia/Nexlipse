// Nexlipse -> WA notifier: kirim pesan via bridge AI-CS (admin1)
// Dipanggil dari server/index.js dengan args: target text
const http = require('http');

const BRIDGE_PORT = 5591;
const [, , target, ...textParts] = process.argv;
const text = textParts.join(' ');

if (!target || !text) {
    console.error('usage: node wa-notify.js <target> <text>');
    process.exit(1);
}

const body = JSON.stringify({ slot: 'admin1', target, text });
const req = http.request({
    hostname: '127.0.0.1',
    port: BRIDGE_PORT,
    path: '/send',
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) }
}, (res) => {
    let data = '';
    res.on('data', (c) => (data += c));
    res.on('end', () => {
        try { process.stdout.write(data); } catch {}
        process.exit(res.statusCode === 200 ? 0 : 1);
    });
});
req.on('error', () => process.exit(1));
req.write(body);
req.end();