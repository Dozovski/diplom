import React, { useEffect, useState } from 'react';
import { getCarPhotos, CAR_CATALOG } from '../data';
import { getCars, createCar, deleteCar, updateCarAvailability } from '../api';

export default function AdminPage({ bookings, onUpdateStatus, onRefresh, onCarsUpdate }) {
  const [tab, setTab] = useState('bookings');
  const [cars, setCars] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedCatalog, setSelectedCatalog] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [form, setForm] = useState({
    name: '', category: 'Эконом', year: '', seats: 5,
    transmission: 'Автомат', fuel: 'Бензин', engine: '',
    hp: '', price: '', lat: '', lng: '', address: '', description: ''
  });

  useEffect(() => { onRefresh(); }, []);

  useEffect(() => {
    if (tab === 'cars') {
      getCars().then(res => setCars(res.data));
    }
  }, [tab]);

  const handleAddCar = async () => {
    if (!form.name || !form.price || !form.address) return;
    try {
      await createCar(form);
      const res = await getCars();
      setCars(res.data);
      if (onCarsUpdate) onCarsUpdate(res.data);
      setShowAddForm(false);
      setForm({ name: '', category: 'Эконом', year: '', seats: 5, transmission: 'Автомат', fuel: 'Бензин', engine: '', hp: '', price: '', lat: '', lng: '', address: '', description: '' });
    } catch (e) { console.error(e); }
  };

  const handleDeleteCar = async (id) => {
  try {
    await deleteCar(id);
    const res = await getCars();
    setCars(res.data);
    if (onCarsUpdate) onCarsUpdate(res.data);
    setConfirmDeleteId(null);
  } catch (e) { console.error(e); }
};

  const handleToggleAvailability = async (id, current) => {
  try {
    await updateCarAvailability(id, !current);
    const res = await getCars();
    setCars(res.data);
    if (onCarsUpdate) onCarsUpdate(res.data);
  } catch (e) { console.error(e); }
};

  const tabStyle = (t) => ({
    padding: '10px 24px', borderRadius: 12, border: 'none', cursor: 'pointer',
    fontFamily: 'inherit', fontSize: 14, fontWeight: 600,
    background: tab === t ? 'var(--gradient-main)' : 'var(--bg-card)',
    color: tab === t ? 'white' : 'var(--text-secondary)',
  });

  return (
    <>
      <div className="page-enter" style={{ paddingTop: 100 }}>
        <section className="section admin-section">
          <div className="section-header">
            <div className="section-label">Панель управления</div>
            <div className="section-title">Администратор</div>
          </div>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginBottom: 40 }}>
            <button style={tabStyle('bookings')} onClick={() => setTab('bookings')}>Заявки на аренду</button>
            <button style={tabStyle('cars')} onClick={() => setTab('cars')}>Управление автомобилями</button>
          </div>

          {tab === 'bookings' && (
            <div className="admin-grid">
              {bookings.length === 0 && (
                <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>
                  <p>Пока нет заявок.</p>
                </div>
              )}
              {bookings.map(b => (
                <div key={b.id} className="admin-card">
                  <div className="admin-num">#{String(b.id).slice(-3)}</div>
                  <div className="admin-info">
                    <h4>{b.car?.name || 'Авто'} — {b.name}</h4>
                    <p>{b.date_from?.slice(0,10)} → {b.date_to?.slice(0,10)} · {b.phone}</p>
                    <div className="admin-meta">Создано: {b.created_at?.slice(0,10)}</div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
                    <span className={`admin-status ${b.status}`}>
                      {b.status === 'pending' ? 'Ожидает' : b.status === 'approved' ? 'Одобрено' : 'Отклонено'}
                    </span>
                    {b.status === 'pending' && (
                      <div className="admin-actions">
                        <button className="admin-btn approve" onClick={() => onUpdateStatus(b.id, 'approved')}>Одобрить</button>
                        <button className="admin-btn reject" onClick={() => onUpdateStatus(b.id, 'rejected')}>Отклонить</button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {tab === 'cars' && (
            <div style={{ maxWidth: 1000, margin: '0 auto' }}>
              <div style={{ textAlign: 'right', marginBottom: 24 }}>
                <button onClick={() => setShowAddForm(!showAddForm)}
                  style={{ padding: '12px 28px', borderRadius: 12, background: 'var(--gradient-main)', color: 'white', fontWeight: 700, border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
                  {showAddForm ? 'Отмена' : '+ Добавить автомобиль'}
                </button>
              </div>

              {showAddForm && (
                <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 20, padding: 28, marginBottom: 32 }}>
                  <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>Новый автомобиль</h3>

<div className="form-group">
  <label className="form-label">Выбрать из справочника</label>
  <select className="form-input" value={selectedCatalog}
    onChange={e => {
      const idx = e.target.value;
      setSelectedCatalog(idx);
      if (idx !== '') {
        const car = CAR_CATALOG[idx];
        setForm({ ...car, seats: car.seats || 5 });
      }
    }}>
    <option value=''>— или заполните вручную —</option>
    {CAR_CATALOG.map((car, i) => (
      <option key={i} value={i}>{car.name} ({car.category})</option>
    ))}
  </select>
</div>
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Название *</label>
                      <input className="form-input" placeholder="BMW 520d" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Категория</label>
                      <select className="form-input" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                        {['Эконом', 'Комфорт', 'Бизнес', 'Премиум'].map(c => <option key={c}>{c}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Год</label>
                      <input className="form-input" type="number" placeholder="2023" value={form.year} onChange={e => setForm({ ...form, year: e.target.value })} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Цена (BYN/сутки) *</label>
                      <input className="form-input" type="number" placeholder="120" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Трансмиссия</label>
                      <select className="form-input" value={form.transmission} onChange={e => setForm({ ...form, transmission: e.target.value })}>
                        <option>Автомат</option>
                        <option>Механика</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Топливо</label>
                      <select className="form-input" value={form.fuel} onChange={e => setForm({ ...form, fuel: e.target.value })}>
                        {['Бензин', 'Дизель', 'Электро', 'Гибрид'].map(f => <option key={f}>{f}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Двигатель</label>
                      <input className="form-input" placeholder="2.0L Turbo" value={form.engine} onChange={e => setForm({ ...form, engine: e.target.value })} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Мощность (л.с.)</label>
                      <input className="form-input" type="number" placeholder="190" value={form.hp} onChange={e => setForm({ ...form, hp: e.target.value })} />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Адрес *</label>
                    <input className="form-input" placeholder="пр. Независимости, 31" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} />
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Широта</label>
                      <input className="form-input" placeholder="53.9045" value={form.lat} onChange={e => setForm({ ...form, lat: e.target.value })} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Долгота</label>
                      <input className="form-input" placeholder="27.5615" value={form.lng} onChange={e => setForm({ ...form, lng: e.target.value })} />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Описание</label>
                    <textarea className="form-input" rows={3} placeholder="Описание автомобиля..." value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} style={{ resize: 'vertical' }} />
                  </div>
                  <button className="form-submit" onClick={handleAddCar}>Добавить автомобиль</button>
                </div>
              )}

              {cars.map(car => (
                <div key={car.id} className="admin-card">
                  <img src={getCarPhotos(car)?.[0]} alt={car.name}
                    style={{ width: 80, height: 56, borderRadius: 10, objectFit: 'cover' }} />
                  <div className="admin-info">
                    <h4>{car.name}</h4>
                    <p>{car.category} · {car.year} · {car.price} BYN/сутки</p>
                    <div className="admin-meta">{car.address}</div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: car.available ? 'var(--success)' : 'var(--danger)' }}>
                      {car.available ? 'Доступен' : 'Забронирован'}
                    </span>
                    <button
                      onClick={() => handleToggleAvailability(car.id, car.available)}
                      style={{
                        padding: '6px 14px', borderRadius: 10, fontSize: 12, fontWeight: 600,
                        border: 'none', cursor: 'pointer', fontFamily: 'inherit', marginBottom: 4,
                        background: car.available ? 'rgba(239,68,68,.15)' : 'rgba(16,185,129,.15)',
                        color: car.available ? 'var(--danger)' : 'var(--success)',
                      }}>
                      {car.available ? 'Сделать недоступным' : 'Сделать доступным'}
                    </button>
                    <button className="admin-btn reject" onClick={() => setConfirmDeleteId(car.id)}>
                      Удалить
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {confirmDeleteId && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 1000,
          background: 'rgba(0,0,0,.7)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
        }}>
          <div style={{
            background: 'var(--bg-secondary)', border: '1px solid rgba(239,68,68,.3)',
            borderRadius: 24, padding: 36, maxWidth: 400, width: '100%', textAlign: 'center',
          }}>
            <div style={{ fontSize: 36, marginBottom: 16 }}>🗑️</div>
            <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 12 }}>Удалить автомобиль?</div>
            <div style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 28 }}>
              Это действие нельзя отменить. Все связанные заявки останутся в базе данных.
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={() => setConfirmDeleteId(null)}
                style={{ flex: 1, padding: 14, borderRadius: 12, background: 'var(--bg-card)', color: 'var(--text-secondary)', fontWeight: 600, border: '1px solid var(--border)', cursor: 'pointer', fontFamily: 'inherit', fontSize: 15 }}>
                Отмена
              </button>
              <button onClick={() => handleDeleteCar(confirmDeleteId)}
                style={{ flex: 1, padding: 14, borderRadius: 12, background: 'rgba(239,68,68,.15)', color: 'var(--danger)', fontWeight: 700, border: '1px solid rgba(239,68,68,.3)', cursor: 'pointer', fontFamily: 'inherit', fontSize: 15 }}>
                Удалить
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}