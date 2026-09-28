import { NavLink } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext.jsx';

export default function Navbar({ profile }) {
    const { theme, toggle } = useTheme();
    return (
        <nav className="nav">
            <div className="nav-wrap">
                <NavLink to="/" className="nav-brand">
                    <img src="/nexlipse.svg" alt="Nexlipse" />
                    <span>{profile.brand || 'Nexlipse'}</span>
                </NavLink>
                <div className="nav-links">
                    <a href="#beranda">Beranda</a>
                    <a href="#project">Project</a>
                    <a href="#experience">Experience</a>
                    <a href="#tentang">Tentang</a>
                    <a href="#kontak">Kontak</a>
                </div>
                <div className="nav-right">
                    <button className="theme-btn" onClick={toggle} title="Ganti tema" aria-label="Ganti tema">
                        {theme === 'dark' ? '☀️' : '🌙'}
                    </button>
                </div>
            </div>
        </nav>
    );
}