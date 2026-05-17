import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PhotoGallery from '../components/PhotoGallery';

export default function CarDetailPage({ cars, onBook }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const car = cars.find(c => c.id === parseInt(id));

  if (!car) return <div style={{ padding: '150px 40px', textAlign: 'center' }}>Автомобиль не найден</div>;

  return (
    <div className="page-enter" style={{ paddingTop: 90 }}>
      <section className="section">
        <button className="back-btn" onClick={() => navigate('/cars')}>← Назад к каталогу</button>
        <div className="detail-layout">
          <div><PhotoGallery car={car} large /></div>
          <div className="detail-info">
            <div className="detail-category">{car.category}</div>
            <h1 className="detail-name">{car.name}</h1>
            <div className="detail-rating">⭐ {car.rating} <span className="detail-trips">{car.trips} поездок</span></div>
            <p className="detail-desc">{car.desc}</p>
            <div className="detail-specs">
              {[
                { l: 'Год', v: car.year }, { l: 'Мест', v: car.seats },
                { l: 'КПП', v: car.transmission }, { l: 'Топливо', v: car.fuel },
                { l: 'Двигатель', v: car.engine }, { l: 'Мощность', v: `${car.hp} л.с.` },
              ].map((s, i) => (
                <div key={i} className="detail-spec">
                  <div><div className="detail-spec-label">{s.l}</div><div className="detail-spec-value">{s.v}</div></div>
                </div>
              ))}
            </div>
            <div className="detail-location" onClick={() => navigate('/map')}>
              📍 {car.address}
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Нажмите для просмотра на карте</div>
            </div>
            <div className="detail-price-row">
              <div className="detail-price">{car.price} BYN <span>/ сутки</span></div>
              {car.available
                ? <button className="btn-primary" onClick={() => onBook(car)}>Забронировать</button>
                : <span className="detail-unavailable">Забронирован</span>
              }
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
