import React from 'react';

export default function ContactPage() {
  return (
    <div className="page-enter" style={{ paddingTop: 100 }}>
      <section className="section">
        <div className="section-header">
          <div className="section-label">Контакты</div>
          <div className="section-title">Свяжитесь с нами</div>
        </div>
        <div className="contact-grid">
          <div>
            {[
              { l: 'Телефон', v: '+375 (29) 123-45-67' },
              { l: 'Email', v: 'info@pailrental.by' },
              { l: 'Адрес', v: 'г. Минск, пр. Независимости, 31' },
              { l: 'Режим работы', v: 'Пн-Вс: 08:00 – 22:00' },
            ].map((c, i) => (
              <div key={i} className="contact-info-card">
                <div><div className="contact-label">{c.l}</div><div className="contact-value">{c.v}</div></div>
              </div>
            ))}
          </div>
          <div>
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 20, padding: 28 }}>
              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>Напишите нам</h3>
              <div className="form-group"><label className="form-label">Имя</label><input className="form-input" placeholder="Иван Иванов" /></div>
              <div className="form-group"><label className="form-label">Email</label><input className="form-input" type="email" placeholder="ivan@example.com" /></div>
              <div className="form-group"><label className="form-label">Сообщение</label><textarea className="form-input" rows={4} placeholder="Ваш вопрос..." style={{ resize: 'vertical' }} /></div>
              <button className="form-submit">Отправить</button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
