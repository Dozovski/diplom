import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import BookingModal from './components/BookingModal';
import HomePage from './pages/HomePage';
import CarsPage from './pages/CarsPage';
import CarDetailPage from './pages/CarDetailPage';
import MapPage from './pages/MapPage';
import AdminPage from './pages/AdminPage';
import ContactPage from './pages/ContactPage';
import AuthPage from './pages/AuthPage';
import TermsPage from './pages/TermsPage';
import ProfilePage from './pages/ProfilePage';
import { getCars, getBookings, createBooking, updateBookingStatus, getMe } from './api';
import BookingsPage from './pages/BookingsPage';

export default function App() {
  const [cars, setCars] = useState([]);
  const [modalCar, setModalCar] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [showProfileWarning, setShowProfileWarning] = useState(false);
  const [pendingCar, setPendingCar] = useState(null);
  // BUG-009: initialise from localStorage but always verify via /api/me
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      // BUG-013: corrupted JSON in localStorage must not crash the app
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      return null;
    }
  });
  const [authVerified, setAuthVerified] = useState(false);

  // BUG-009: verify token + role from server on every app start
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setAuthVerified(true);
      return;
    }
    getMe()
      .then(res => {
        // Always trust the server-side role, not localStorage
        const serverUser = res.data;
        localStorage.setItem('user', JSON.stringify(serverUser));
        setUser(serverUser);
      })
      .catch(() => {
        // Invalid / expired token — clear everything
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
      })
      .finally(() => setAuthVerified(true));
  }, []);

  // Load cars
  useEffect(() => {
    if (!authVerified) return;
    getCars().then(res => setCars(res.data)).catch(console.error);
  }, [authVerified]);

  // Load bookings (admin only)
  useEffect(() => {
    if (user?.role === 'admin') {
      getBookings().then(res => setBookings(res.data)).catch(console.error);
    }
  }, [user]);

  const handleLogin = (userData, token) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const handleBook = (car) => {
    if (!user) return;
    if (user.role === 'admin') {
      setModalCar(car);
      return;
    }
    // BUG-010 gate: re-read fresh user from localStorage after profile update
    let currentUser;
    try {
      currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    } catch {
      currentUser = user;
    }
    if (!currentUser.birth_date || !currentUser.passport) {
      setPendingCar(car);
      setShowProfileWarning(true);
      return;
    }
    setModalCar(car);
  };

  const handleSubmitBooking = async (formData) => {
    try {
      await createBooking({ car_id: modalCar.id, ...formData });
      if (user?.role === 'admin') {
        const res = await getBookings();
        setBookings(res.data);
      }
      setModalCar(null);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 4000);
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      await updateBookingStatus(id, status);
      const res = await getBookings();
      setBookings(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  // Show nothing while verifying token to prevent flash of auth page
  if (!authVerified) {
    return (
      <div style={{
        minHeight: '100vh', background: '#0a0b0f',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <div style={{ color: '#8b8da0', fontSize: 14 }}>Загрузка...</div>
      </div>
    );
  }

  if (!user) {
    return <AuthPage onLogin={handleLogin} />;
  }

  const pendingCount = bookings.filter(b => b.status === 'pending').length;

  return (
    <div className="pr-app">
      <Navbar pendingCount={pendingCount} user={user} onLogout={handleLogout} />

      <Routes>
        <Route path="/" element={<HomePage cars={cars} onBook={handleBook} />} />
        <Route path="/cars" element={<CarsPage cars={cars} onBook={handleBook} />} />
        <Route path="/cars/:id" element={<CarDetailPage cars={cars} onBook={handleBook} />} />
        <Route path="/map" element={<MapPage cars={cars} onCarClick={handleBook} />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route
          path="/profile"
          element={
            <ProfilePage
              user={user}
              onUpdate={(updated) => {
                localStorage.setItem('user', JSON.stringify(updated));
                setUser(updated);
              }}
            />
          }
        />
        <Route path="/bookings" element={<BookingsPage />} />
        {user.role === 'admin' && (
          <Route
            path="/admin"
            element={
              <AdminPage
                bookings={bookings}
                onUpdateStatus={handleUpdateStatus}
                onRefresh={() => getBookings().then(res => setBookings(res.data))}
                onCarsUpdate={(updated) => setCars(updated)}
              />
            }
          />
        )}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>

      <Footer onShowTerms={() => setShowTerms(true)} />

      {modalCar && (
        <BookingModal car={modalCar} onClose={() => setModalCar(null)} onSubmit={handleSubmitBooking} />
      )}

      {showTerms && <TermsPage onClose={() => setShowTerms(false)} />}

      {showProfileWarning && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 1000,
            background: 'rgba(0,0,0,.7)', backdropFilter: 'blur(8px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
          }}
          onClick={() => setShowProfileWarning(false)}
        >
          <div
            style={{
              background: 'var(--bg-secondary)', border: '1px solid rgba(245,158,11,.4)',
              borderRadius: 24, padding: 36, maxWidth: 460, width: '100%',
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ fontSize: 40, textAlign: 'center', marginBottom: 16 }}>⚠️</div>
            <div style={{ fontSize: 20, fontWeight: 800, textAlign: 'center', marginBottom: 12 }}>
              Профиль не заполнен
            </div>
            <div style={{ fontSize: 14, color: 'var(--text-secondary)', textAlign: 'center', marginBottom: 28, lineHeight: 1.7 }}>
              Для оформления бронирования необходимо указать
              {!user.birth_date && <span style={{ color: 'var(--accent-warm)' }}> дату рождения</span>}
              {!user.birth_date && !user.passport && ' и '}
              {!user.passport && <span style={{ color: 'var(--accent-warm)' }}> номер водительского удостоверения</span>}
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <button
                onClick={() => { setShowProfileWarning(false); window.location.href = '/profile'; }}
                style={{
                  flex: 1, padding: 14, borderRadius: 12,
                  background: 'var(--gradient-main)', color: 'white',
                  fontWeight: 700, border: 'none', cursor: 'pointer',
                  fontFamily: 'inherit', fontSize: 15,
                }}
              >
                Заполнить профиль
              </button>
            </div>
          </div>
        </div>
      )}

      {showSuccess && (
        <div className="success-popup">
          <div className="success-icon">✓</div>
          <div><h4>Заявка отправлена!</h4><p>Мы свяжемся с вами</p></div>
        </div>
      )}
    </div>
  );
}
