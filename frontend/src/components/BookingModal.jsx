import React, { useState } from 'react';
import { getCarPhotos } from '../data';

export default function BookingModal({ car, onClose, onSubmit }) {
  const [form, setForm] = useState({
    name: '', phone: '', email: '', dateFrom: '', dateTo: '', comment: ''
  });

  const handleSubmit = () => {
  if (!form.name || !form.phone || !form.dateFrom || !form.dateTo) return;
  onSubmit({
    car_id: car.id,
    name: form.name,
    phone: form.phone,
    email: form.email,
    date_from: form.dateFrom,
    date_to: form.dateTo,
    comment: form.comment,
  });
};
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h2>Бронирование</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <div className="modal-car">
            <img src={getCarPhotos(car)?.[0]} alt="" />
            <div className="modal-car-info">
              <h3>{car.name}</h3>
              <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 4 }}>
                {car.year} · {car.transmission}
              </div>
              <div className="modal-car-price">
                {car.price} BYN <span>/ сутки</span>
              </div>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Имя *</label>
            <input className="form-input" placeholder="Иван Иванов"
              value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
          </div>
          <div className="form-group">
            <label className="form-label">Телефон *</label>
            <input className="form-input" placeholder="+375 (29) XXX-XX-XX"
              value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input className="form-input" type="email" placeholder="ivan@example.com"
              value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Дата начала *</label>
              <input className="form-input" type="date"
                value={form.dateFrom} onChange={e => setForm({...form, dateFrom: e.target.value})} />
            </div>
            <div className="form-group">
              <label className="form-label">Дата окончания *</label>
              <input className="form-input" type="date"
                value={form.dateTo} onChange={e => setForm({...form, dateTo: e.target.value})} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Комментарий</label>
            <textarea className="form-input" rows={3} placeholder="Пожелания..."
              value={form.comment} onChange={e => setForm({...form, comment: e.target.value})}
              style={{ resize: 'vertical' }} />
          </div>
          <button className="form-submit"
            disabled={!form.name || !form.phone || !form.dateFrom || !form.dateTo}
            onClick={handleSubmit}>
            Отправить заявку
          </button>
        </div>
      </div>
    </div>
  );
}
