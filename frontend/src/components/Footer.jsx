import React from 'react';

export default function Footer({ onShowTerms }) {
  return (
    <footer className="footer">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 16 }}>
        <div className="footer-logo">PR</div>
        <span style={{ fontWeight: 700, fontSize: 16, color: 'var(--text-primary)' }}>
          Pail<span style={{ color: 'var(--accent)' }}>Rental</span>
        </span>
      </div>
      <p>© 2026 Pail Rental. Все права защищены. Аренда автомобилей в Минске.</p>
      <p style={{ marginTop: 8, fontSize: 12 }}>
        Дипломный проект · <a href="#" onClick={e => { e.preventDefault(); onShowTerms(); }}>Условия аренды</a>
      </p>
    </footer>
  );
}