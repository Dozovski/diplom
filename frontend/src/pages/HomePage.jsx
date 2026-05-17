import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import CarCard from '../components/CarCard';
import { getReviews, createReview } from '../api';

export default function HomePage({ cars, onBook, user }) {
  const [reviews, setReviews] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ text: '', rating: 5 });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getReviews().then(res => setReviews(res.data)).catch(console.error);
  }, []);

  const handleSubmitReview = async () => {
    if (!form.text) return;
    setLoading(true);
    try {
      await createReview(form);
      const res = await getReviews();
      setReviews(res.data);
      setForm({ text: '', rating: 5 });
      setShowForm(false);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-enter">
      {/* Hero */}
      <section className="hero">
        <div className="hero-content">
          <div className="hero-badge"><span className="pulse-dot" /> Аренда авто в Минске</div>
          <h1>Твой путь<br/>начинается <span className="gradient">здесь</span></h1>
          <p>Премиальная аренда автомобилей в Минске. Широкий выбор от эконом до бизнес-класса.</p>
          <div className="hero-actions">
            <Link to="/cars" className="btn-primary">Выбрать авто →</Link>
            <Link to="/map" className="btn-secondary">Показать на карте</Link>
          </div>
          <div className="hero-stats">
            <div><div className="hero-stat-num">50+</div><div className="hero-stat-label">Автомобилей</div></div>
            <div><div className="hero-stat-num">1200+</div><div className="hero-stat-label">Клиентов</div></div>
            <div><div className="hero-stat-num">{reviews.length > 0 ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1) : '5.0'}</div><div className="hero-stat-label">Рейтинг</div></div>
          </div>
        </div>
      </section>

      {/* Steps */}
      <section className="section">
        <div className="section-header">
          <div className="section-label">Как это работает</div>
          <div className="section-title">Три простых шага</div>
        </div>
        <div className="steps-grid">
          {[
            { n: '1', t: 'Выберите авто', d: 'Просмотрите каталог и выберите автомобиль' },
            { n: '2', t: 'Оставьте заявку', d: 'Заполните форму с датами аренды' },
            { n: '3', t: 'Получите авто', d: 'Заберите автомобиль в точке выдачи' },
          ].map((s, i) => (
            <div key={i} className="step-card">
              <div className="step-num">{s.n}</div>
              <h3>{s.t}</h3><p>{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured */}
      <section className="section" style={{ background: 'var(--bg-secondary)' }}>
        <div className="section-header">
          <div className="section-label">Популярные</div>
          <div className="section-title">Рекомендуемые автомобили</div>
        </div>
        <div className="cars-grid">
          {cars.slice(0, 3).map(car => (
            <CarCard key={car.id} car={car} onBook={onBook}
              onDetail={() => window.location.href = `/cars/${car.id}`} />
          ))}
        </div>
        <div style={{ textAlign: 'center', marginTop: 40 }}>
          <Link to="/cars" className="btn-secondary">Смотреть все →</Link>
        </div>
      </section>

      {/* Reviews */}
      <section className="section">
        <div className="section-header">
          <div className="section-label">Отзывы</div>
          <div className="section-title">Что говорят клиенты</div>
        </div>
        <div className="reviews-track">
          {reviews.map((r, i) => (
            <div key={i} className="review-card">
              <div className="review-stars">{'⭐'.repeat(r.rating)}</div>
              <div className="review-text">«{r.text}»</div>
              <div className="review-author">{r.name}</div>
            </div>
          ))}
        </div>

        {/* Форма отзыва */}
        <div style={{ maxWidth: 600, margin: '40px auto 0' }}>
          {!showForm ? (
            <div style={{ textAlign: 'center' }}>
              <button className="btn-secondary" onClick={() => setShowForm(true)}>
                Оставить отзыв
              </button>
            </div>
          ) : (
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 20, padding: 28 }}>
              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>Ваш отзыв</h3>

              {/* Рейтинг */}
              <div style={{ marginBottom: 16 }}>
                <label className="form-label">Оценка</label>
                <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
                  {[1,2,3,4,5].map(n => (
                    <button key={n} onClick={() => setForm({...form, rating: n})}
                      style={{
                        width: 40, height: 40, borderRadius: 10, border: '1px solid var(--border)',
                        background: form.rating >= n ? 'var(--accent-soft)' : 'var(--bg-card)',
                        color: form.rating >= n ? 'var(--accent)' : 'var(--text-muted)',
                        fontWeight: 700, cursor: 'pointer', fontSize: 16,
                      }}>
                      {n}
                    </button>
                  ))}
                </div>
              </div>

              {/* Текст */}
              <div style={{ marginBottom: 20 }}>
                <label className="form-label">Комментарий</label>
                <textarea className="form-input" rows={3} placeholder="Расскажите о вашем опыте..."
                  value={form.text} onChange={e => setForm({...form, text: e.target.value})}
                  style={{ resize: 'vertical', marginTop: 6 }} />
              </div>

              <div style={{ display: 'flex', gap: 12 }}>
                <button className="form-submit" style={{ flex: 1 }}
                  disabled={!form.text || loading} onClick={handleSubmitReview}>
                  {loading ? 'Отправка...' : 'Отправить'}
                </button>
                <button onClick={() => setShowForm(false)}
                  style={{ padding: '14px 20px', borderRadius: 12, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer', fontFamily: 'inherit' }}>
                  Отмена
                </button>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}