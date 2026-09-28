export default function Footer({ profile, about }) {
    const year = new Date().getFullYear();
    return (
        <footer className="footer">
            <p>
                <b>{profile.brand}</b> © {year}, {profile.name}. Dikoding dengan ☕ & semangat.
            </p>
            <p style={{ marginTop: 6, fontSize: '.8rem' }}>
                {profile.domain} · <a href={`mailto:${profile.email}`} style={{ color: 'var(--accent)' }}>{profile.email}</a>
            </p>
        </footer>
    );
}