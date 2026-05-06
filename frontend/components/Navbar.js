'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { FiSun, FiMoon, FiMenu, FiX, FiZap } from 'react-icons/fi';

export default function Navbar({ theme, toggleTheme }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const links = [
    { href: '/', label: 'Home' },
    { href: '/analyzer', label: 'Analyzer' },
    { href: '/builder', label: 'Resume Builder' },
  ];

  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 100,
      background: 'rgba(7,9,15,0.85)',
      borderBottom: '1px solid rgba(255,255,255,0.06)',
      backdropFilter: 'blur(16px)',
    }}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', height: 70, gap: 24 }}>
        {/* Logo */}
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none', fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: 20 }}>
          <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 34, height: 34, borderRadius: 10, background: 'linear-gradient(135deg, #4f8ef7, #8b5cf6)' }}>
            <FiZap size={18} color="white" />
          </span>
          <span className="gradient-text">ResumeAI</span>
        </Link>

        {/* Desktop nav */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, flex: 1, justifyContent: 'center' }} className="desktop-nav">
          {links.map(l => (
            <Link key={l.href} href={l.href} style={{
              padding: '8px 18px', borderRadius: 8, fontSize: 14, fontWeight: 500,
              textDecoration: 'none',
              color: pathname === l.href ? '#4f8ef7' : 'var(--text-secondary)',
              background: pathname === l.href ? 'rgba(79,142,247,0.1)' : 'transparent',
              transition: 'all 0.2s',
            }}>
              {l.label}
            </Link>
          ))}
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginLeft: 'auto' }}>
          <button onClick={toggleTheme} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-secondary)' }}>
            {theme === 'dark' ? <FiSun size={16} /> : <FiMoon size={16} />}
          </button>
          <Link href="/auth/login" className="btn btn-outline btn-sm">Login</Link>
          <Link href="/analyzer" className="btn btn-primary btn-sm">Analyze Resume</Link>
          <button onClick={() => setOpen(!open)} style={{ display: 'none', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, width: 36, height: 36, alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-secondary)' }} className="mobile-menu-btn">
            {open ? <FiX size={18} /> : <FiMenu size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div style={{ borderTop: '1px solid var(--border)', padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {links.map(l => (
            <Link key={l.href} href={l.href} onClick={() => setOpen(false)} style={{ padding: '10px 16px', borderRadius: 8, textDecoration: 'none', color: 'var(--text-primary)', fontWeight: 500 }}>
              {l.label}
            </Link>
          ))}
          <Link href="/auth/login" onClick={() => setOpen(false)} style={{ padding: '10px 16px', borderRadius: 8, textDecoration: 'none', color: 'var(--accent-blue)', fontWeight: 600 }}>
            Login / Register
          </Link>
        </div>
      )}
      <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-menu-btn { display: flex !important; }
        }
      `}</style>
    </nav>
  );
}
