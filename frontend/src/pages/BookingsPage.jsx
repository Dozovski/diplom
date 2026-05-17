import React, { useState, useEffect } from 'react';
import { getMyBookings } from '../api';
import { getCarPhotos } from '../data';

export default function BookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyBookings().then(res => {
      setBookings(res.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const statusLabel = (s) => s === 'pending' ? 'Ожидает' : s === 'approved' ? 'Одобрено' : 'Отклонено';
  const statusColor = (s) => s === 'pending' ? 'var(--accent-warm)' : s === 'approved' ? 'var(--success)' : 'var(--danger)';
  const statusBg = (s) => s === 'pending' ? 'rgba(245,158,11,.15)' : s === 'approved' ? 'rgba(16,185,129,.15)' : 'rgba(239,68,68,.15)';

  return (
    <div className="page-enter" style={{ paddingTop: 100 }}>
      <section className="section">
        <div className="section-header">
          <div className="section-label">Личный кабинет</div>
          <div className="section-title">История бронирований</div>
        </div>

        {loading && (
          <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>Загрузка...</div>
        )}

        {!loading && bookings.length === 0 && (
          <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>🚗</div>
            <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Нет бронирований</div>
            <div style={{ fontSize: 14 }}>Забронируйте автомобиль чтобы увидеть историю</div>
          </div>
        )}

        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          {bookings.map(b => (
            <div key={b.id} style={{
              background: 'var(--bg-card)', border: '1px solid var(--border)',
              borderRadius: 20, padding: 24, marginBottom: 16,
              display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: 20, alignItems: 'center'
            }}>
              <img
                src={getCarPhotos(b.car)?.[0]}
                alt={b.car?.name}
                style={{ width: 100, height: 70, borderRadius: 12, objectFit: 'cover' }}
              />
              <div>
                <div style={{ fontWeight: 700, fontSize: 17, marginBottom: 6 }}>{b.car?.name || 'Автомобиль'}</div>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 4 }}>
                  📅 {b.date_from?.slice(0,10)} → {b.date_to?.slice(0,10)}
                </div>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 4 }}>
                  📞 {b.phone}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  Создано: {b.created_at?.slice(0,10)}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{
                  padding: '6px 14px', borderRadius: 8, fontSize: 12, fontWeight: 700,
                  background: statusBg(b.status), color: statusColor(b.status)
                }}>
                  {statusLabel(b.status)}
                </span>
                {b.car?.price && (
                  <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--accent)', marginTop: 8 }}>
                    {b.car.price} BYN/сутки
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}