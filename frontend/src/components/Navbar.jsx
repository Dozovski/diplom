import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function Navbar({ pendingCount = 0, user, onLogout }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', h);
    return () => window.removeEventListener('scroll', h);
  }, []);

  useEffect(() => setMobileOpen(false), [location]);

  const links = [
    { to: '/', label: 'Главная' },
    { to: '/cars', label: 'Автомобили' },
    { to: '/map', label: 'Карта' },
    { to: '/contact', label: 'Контакты' },
    { to: '/profile', label: 'Профиль' },
    ...(user?.role !== 'admin' ? [{ to: '/bookings', label: 'Мои заявки' }] : []),
    ...(user?.role === 'admin' ? [{ to: '/admin', label: 'Заявки', badge: pendingCount }] : []),
  ];

  return (
    <nav className={`nav ${scrolled ? 'scrolled' : ''}`}>
      <Link to="/" className="nav-logo">
        <div className="nav-logo-icon">PR</div>
        <span>Pail<span style={{ color: 'var(--accent)' }}>Rental</span></span>
      </Link>

      <button className="mobile-toggle" onClick={() => setMobileOpen(!mobileOpen)}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d={mobileOpen ? 'M18 6L6 18M6 6l12 12' : 'M3 12h18M3 6h18M3 18h18'} />
        </svg>
      </button>

      <div className={`nav-links ${mobileOpen ? 'open' : ''}`}>
        {links.map(l => (
          <Link
            key={l.to}
            to={l.to}
            className={`nav-link ${location.pathname === l.to ? 'active' : ''}`}
          >
            {l.label}
            {l.badge > 0 && <span className="nav-badge">{l.badge}</span>}
          </Link>
        ))}
        <Link to="/cars" className="nav-cta">Арендовать</Link>

        {/* Имя пользователя и кнопка выхода */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginLeft: 8 }}>
          <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            {user?.name}
          </span>
          <button
            onClick={onLogout}
            style={{
              padding: '8px 16px', borderRadius: 10, border: '1px solid var(--border)',
              background: 'transparent', color: 'var(--text-secondary)',
              fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
            }}
          >
            Выйти
          </button>
        </div>
      </div>
    </nav>
  );
}