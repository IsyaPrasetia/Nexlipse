import { useEffect } from 'react';

// Set meta dinamis (title, description, OG) per rute. Dipakai halaman layanan
// dan portfolio supaya tiap URL punya title dan description yang relevan.
export function usePageMeta({ title, description, path }) {
    useEffect(() => {
        const prevTitle = document.title;
        const setMeta = (sel, attr) => {
            const el = document.querySelector(sel);
            if (el) el.setAttribute(attr, description);
        };
        if (title) document.title = title;
        if (description) {
            setMeta('meta[name="description"]', 'content');
            setMeta('meta[property="og:description"]', 'content');
            setMeta('meta[name="twitter:description"]', 'content');
        }
        if (path) {
            const canonical = document.querySelector('link[rel="canonical"]');
            if (canonical) canonical.setAttribute('href', `https://nexlipse.my.id${path}`);
        }
        return () => { document.title = prevTitle; };
    }, [title, description, path]);
}

// Suntik JSON-LD per halaman, dihapus otomatis saat komponen dilepas.
export function JsonLd({ data }) {
    useEffect(() => {
        const s = document.createElement('script');
        s.type = 'application/ld+json';
        s.setAttribute('data-seo', '1');
        s.textContent = JSON.stringify(data);
        document.head.appendChild(s);
        return () => { s.remove(); };
    }, []);
    return null;
}