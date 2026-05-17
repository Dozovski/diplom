import React, { useState, useEffect } from 'react';
import { getProfile, updateProfile } from '../api';

export default function ProfilePage({ user, onUpdate }) {
  const [form, setForm] = useState({
    name: '', email: '', birth_date: '', passport: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    getProfile().then(res => {
      setForm({
        name: res.data.name || '',
        email: res.data.email || '',
        birth_date: res.data.birth_date || '',
        passport: res.data.passport || '',
      });
    });
  }, []);

  const isIncomplete = !isAdmin && (!form.birth_date || !form.passport);

  const handleSubmit = async () => {
    if (!form.name) { setError('Имя обязательно'); return; }
    setLoading(true);
    setError('');
    try {
      const res = await updateProfile(form);
      onUpdate(res.data);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (e) {
      setError('Ошибка при сохранении');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-enter" style={{ paddingTop: 100 }}>
      <section className="section">

        {isIncomplete && (
          <div style={{
            maxWidth: 560, margin: '0 auto 24px',
            padding: '16px 20px', borderRadius: 16,
            background: 'rgba(245,158,11,.12)',
            border: '1px solid rgba(245,158,11,.3)',
            display: 'flex', alignItems: 'center', gap: 14,
          }}>
            <div style={{ fontSize: 24 }}>⚠️</div>
            <div>
              <div style={{ fontWeight: 700, color: 'var(--accent-warm)', marginBottom: 4 }}>
                Профиль заполнен не полностью
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                Для оформления аренды необходимо указать
                {!form.birth_date && <span style={{ color: 'var(--accent-warm)' }}> дату рождения</span>}
                {!form.birth_date && !form.passport && ' и '}
                {!form.passport && <span style={{ color: 'var(--accent-warm)' }}> номер водительского удостоверения</span>}
              </div>
            </div>
          </div>
        )}

        <div className="section-header">
          <div className="section-label">Личный кабинет</div>
          <div className="section-title">{isAdmin ? 'Профиль администратора' : 'Профиль'}</div>
        </div>

        <div style={{ maxWidth: 560, margin: '0 auto', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 24, padding: 36 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32, padding: 20, background: 'var(--bg-elevated)', borderRadius: 16 }}>
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--gradient-main)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 800, color: 'white' }}>
              {form.name?.[0]?.toUpperCase() || '?'}
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 18 }}>{form.name || 'Администратор'}</div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{user?.phone}</div>
              {isAdmin && (
                <div style={{ fontSize: 12, color: 'var(--accent)', fontWeight: 600, marginTop: 4 }}>
                  Администратор
                </div>
              )}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Имя *</label>
            <input className="form-input" placeholder="Иван Иванов"
              value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
          </div>

          <div className="form-group">
            <label className="form-label">Email</label>
            <input className="form-input" type="email" placeholder="ivan@example.com"
              value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
          </div>

          {!isAdmin && (
            <>
              <div className="form-group">
                <label className="form-label">Дата рождения</label>
                <input className="form-input" type="date"
                  value={form.birth_date} onChange={e => setForm({ ...form, birth_date: e.target.value })} />
              </div>

              <div className="form-group">
                <label className="form-label">Номер водительского удостоверения</label>
                <input className="form-input" placeholder="БЦ1234567"
                  value={form.passport} onChange={e => setForm({ ...form, passport: e.target.value })} />
              </div>
            </>
          )}

          {error && (
            <div style={{ padding: '10px 14px', borderRadius: 10, background: 'rgba(239,68,68,.15)', color: 'var(--danger)', fontSize: 14, marginBottom: 16 }}>
              {error}
            </div>
          )}

          {success && (
            <div style={{ padding: '10px 14px', borderRadius: 10, background: 'rgba(16,185,129,.15)', color: 'var(--success)', fontSize: 14, marginBottom: 16 }}>
              Профиль успешно сохранён
            </div>
          )}

          <button className="form-submit" onClick={handleSubmit} disabled={loading}>
            {loading ? 'Сохранение...' : 'Сохранить'}
          </button>
        </div>
      </section>
    </div>
  );
}