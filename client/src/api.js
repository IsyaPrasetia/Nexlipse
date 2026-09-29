const BASE = '/api';

async function j(url, opts = {}) {
    const res = await fetch(BASE + url, {
        headers: { 'Content-Type': 'application/json' },
        ...opts
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || 'Terjadi kesalahan');
    return data;
}

export const api = {
    get: (url) => j(url),
    post: (url, body) => j(url, { method: 'POST', body: JSON.stringify(body) }),
    put: (url, body) => j(url, { method: 'PUT', body: JSON.stringify(body) }),
    admin: (token) => ({
        get: (url) => aj(token, url, 'GET'),
        post: (url, body) => aj(token, url, 'POST', body),
        put: (url, body) => aj(token, url, 'PUT', body),
        del: (url) => aj(token, url, 'DELETE')
    }),
    getData: () => Promise.all([
        api.get('/profile'),
        api.get('/about'),
        api.get('/projects'),
        api.get('/experience'),
        api.get('/contacts-config'),
        api.get('/service-pages'),
        api.get('/faq')
    ]).then(([profile, about, projects, experience, contactsConfig, servicePages, faq]) => ({ profile, about, projects, experience, contactsConfig, servicePages, faq }))
};

async function aj(token, url, method, body) {
    const res = await fetch(BASE + url, {
        method,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
        },
        body: body ? JSON.stringify(body) : undefined
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || 'Gagal menyimpan');
    return data;
}