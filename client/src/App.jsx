import { useEffect, useState } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { api } from './api';
import { useReveal } from './hooks';
import Navbar from './components/Navbar.jsx';
import Hero from './components/Hero.jsx';
import Services from './components/Services.jsx';
import Projects from './components/Projects.jsx';
import Experience from './components/Experience.jsx';
import About from './components/About.jsx';
import Faq from './components/Faq.jsx';
import Contact from './components/Contact.jsx';
import Footer from './components/Footer.jsx';
import ServicePage from './components/ServicePage.jsx';
import PortfolioPage from './components/PortfolioPage.jsx';
import { ScrollProgress, CursorGlow, AmbientOrbs, Dust, BackToTop } from './components/Effects.jsx';
import Admin from './pages/Admin.jsx';

export default function App() {
    const [data, setData] = useState(null);
    const [err, setErr] = useState('');
    const loc = useLocation();
    useReveal();

    useEffect(() => {
        api.getData().then(setData).catch((e) => setErr(e.message));
    }, [loc.pathname]);

    useEffect(() => {
        if (!data) return;
        if (loc.hash) {
            const id = loc.hash.replace('#', '');
            setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }), 150);
        } else {
            window.scrollTo({ top: 0 });
        }
    }, [loc.pathname, loc.hash, data]);

    useEffect(() => {
                const obs = new IntersectionObserver((entries) => {
                    entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add('show'); obs.unobserve(en.target); } });
                }, { threshold: 0.12 });
                document.querySelectorAll('.reveal').forEach((el) => obs.observe(el));
                return () => obs.disconnect();
            }, [data, loc.pathname]);

    if (!data) {
        return (
            <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center' }}>
                <div style={{ textAlign: 'center', color: 'var(--text-soft)' }}>
                    <div style={{ fontSize: '2rem', marginBottom: 8, animation: 'pulse 1.5s infinite' }}>⬢</div>
                    <p>{err ? err : 'Memuat...'}</p>
                </div>
            </div>
        );
    }

    return (
        <>
            <AmbientOrbs />
            <Dust />
            <ScrollProgress />
            <CursorGlow />
            <Navbar profile={data.profile} />
            <main>
                <Routes>
                    <Route path="/" element={
                        <>
                            <Hero profile={data.profile} about={data.about} projects={data.projects} />
                            <Services profile={data.profile} pages={data.servicePages?.pages || []} />
                            <Projects projects={data.projects} />
                            <Experience experience={data.experience} />
                            <About profile={data.profile} about={data.about} />
                            <Faq items={data.faq?.faq} />
                            <Contact profile={data.profile} config={data.contactsConfig} />
                        </>
                    } />
                    <Route path="/jasa/:slug" element={<ServicePage pages={data.servicePages?.pages || []} profile={data.profile} />} />
                    <Route path="/portfolio/:id" element={<PortfolioPage projects={data.projects} experience={data.experience} />} />
                    <Route path="/admin" element={<Admin />} />
                    <Route path="*" element={<div style={{ minHeight: '60vh', display: 'grid', placeItems: 'center' }}>
                        <div style={{ textAlign: 'center' }}>
                            <h1 style={{ fontSize: '3rem' }}>404</h1>
                            <p style={{ color: 'var(--text-soft)' }}>Halaman tidak ditemukan.</p>
                            <Link to="/" className="btn btn-primary" style={{ marginTop: 20 }}>← Kembali</Link>
                        </div>
                    </div>} />
                </Routes>
            </main>
            <Footer profile={data.profile} about={data.about} />
            <BackToTop />
        </>
    );
}