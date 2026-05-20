import React, { useState } from 'react';
import { login, register } from '../api';

export default function AuthPage({ onLogin }) {
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({ name: '', phone: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError('');
    if (!form.phone || !form.password) {
      setError('Заполните все поля');
      return;
    }
    if (!isLogin && !form.name) {
      setError('Введите имя');
      return;
    }

    setLoading(true);
    try {
      const res = isLogin
        ? await login({ phone: form.phone, password: form.password })
        : await register({ name: form.name, phone: form.phone, password: form.password });

      onLogin(res.data.user, res.data.token);
    } catch (e) {
      setError(e.response?.data?.message || 'Ошибка. Попробуйте снова.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0a0b0f',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: "'Outfit', sans-serif",
    }}>
      <div style={{
        background: '#12131a',
        border: '1px solid #2a2b38',
        borderRadius: 24,
        padding: 40,
        width: '100%',
        maxWidth: 420,
      }}>
        {/* Логотип */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 52, height: 52, borderRadius: 14,
            background: 'linear-gradient(135deg,#3b82f6,#06b6d4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'monospace', fontSize: 18, fontWeight: 700,
            color: 'white', margin: '0 auto 12px',
          }}>PR</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: '#e8e9f0' }}>
            Pail<span style={{ color: '#3b82f6' }}>Rental</span>
          </div>
        </div>

        {/* Переключатель */}
        <div style={{
          display: 'flex', background: '#181920',
          borderRadius: 12, padding: 4, marginBottom: 24,
        }}>
          {['Вход', 'Регистрация'].map((label, i) => (
            <button key={i} onClick={() => { setIsLogin(i === 0); setError(''); }}
              style={{
                flex: 1, padding: '10px', borderRadius: 10, border: 'none',
                cursor: 'pointer', fontFamily: 'inherit', fontSize: 14, fontWeight: 600,
                background: isLogin === (i === 0) ? 'linear-gradient(135deg,#3b82f6,#06b6d4)' : 'transparent',
                color: isLogin === (i === 0) ? 'white' : '#8b8da0',
                transition: 'all .2s',
              }}>{label}</button>
          ))}
        </div>

        {/* Форма */}
        {!isLogin && (
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#8b8da0', marginBottom: 6, textTransform: 'uppercase' }}>Имя</label>
            <input
              style={{ width: '100%', padding: '12px 14px', borderRadius: 10, background: '#181920', border: '1px solid #2a2b38', color: '#e8e9f0', fontSize: 15, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' }}
              placeholder="Иван Иванов"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
            />
          </div>
        )}

        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#8b8da0', marginBottom: 6, textTransform: 'uppercase' }}>Номер телефона</label>
          <input
            type="tel"
            name="phone"
            id="phone"
            autoComplete="tel"
            style={{ width: '100%', padding: '12px 14px', borderRadius: 10, background: '#181920', border: '1px solid #2a2b38', color: '#e8e9f0', fontSize: 15, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' }}
            placeholder="+375 (29) XXX-XX-XX"
            value={form.phone}
            onChange={e => setForm({ ...form, phone: e.target.value })}
          />
        </div>

        <div style={{ marginBottom: 24 }}>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#8b8da0', marginBottom: 6, textTransform: 'uppercase' }}>Пароль</label>
          <input
            type="password"
            style={{ width: '100%', padding: '12px 14px', borderRadius: 10, background: '#181920', border: '1px solid #2a2b38', color: '#e8e9f0', fontSize: 15, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' }}
            placeholder="••••••"
            value={form.password}
            onChange={e => setForm({ ...form, password: e.target.value })}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
          />
        </div>

        {error && (
          <div style={{ marginBottom: 16, padding: '10px 14px', borderRadius: 10, background: 'rgba(239,68,68,.15)', color: '#ef4444', fontSize: 14 }}>
            {error}
          </div>
        )}

        <button
          type="submit"
          onClick={handleSubmit}
          disabled={loading}
          data-testid="auth-submit"
          style={{
            width: '100%', padding: 14, borderRadius: 12,
            background: 'linear-gradient(135deg,#3b82f6,#06b6d4)',
            color: 'white', fontSize: 16, fontWeight: 700,
            border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.6 : 1, fontFamily: 'inherit',
          }}
        >
          {loading ? 'Загрузка...' : isLogin ? 'Войти' : 'Зарегистрироваться'}
        </button>

    
      </div>
    </div>
  );
}