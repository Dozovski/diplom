import React, { useState } from 'react';
import { getCarPhotos } from '../data';

export default function CarCard({ car, onBook, onDetail }) {
  const [hovered, setHovered] = useState(false);
  const photos = getCarPhotos(car) || [];
  const [pi, setPi] = useState(0);

  return (
    <div className="car-card" onMouseEnter={() => setHovered(true)} onMouseLeave={() => { setHovered(false); setPi(0); }}>
      <div className="car-img-wrap" onClick={() => onDetail && onDetail(car)}>
        <img src={photos[pi] || photos[0]} alt={car.name} loading="lazy" />
        {hovered && photos.length > 1 && (
          <div className="car-img-dots">
            {photos.map((_, i) => (
              <button key={i} className={`car-img-dot ${i === pi ? 'active' : ''}`}
                onMouseEnter={() => setPi(i)} onClick={e => { e.stopPropagation(); setPi(i); }} />
            ))}
          </div>
        )}
        <span className={`car-badge ${car.available ? 'available' : 'unavailable'}`}>
          {car.available ? 'Доступен' : 'Забронирован'}
        </span>
        <span className="car-cat-badge">{car.category}</span>
      </div>
      <div className="car-info" onClick={() => onDetail && onDetail(car)}>
        <div className="car-name">{car.name}</div>
        <div className="car-meta">
          <span className="car-meta-item">📅 {car.year}</span>
          <span className="car-meta-item">👥 {car.seats} мест</span>
          <span className="car-meta-item">⚙️ {car.transmission}</span>
          <span className="car-meta-item">⛽ {car.fuel}</span>
        </div>
        <div className="car-bottom">
          <div className="car-price">{car.price} BYN <span>/ сутки</span></div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div className="car-rating">⭐ {car.rating}</div>
            {car.available && (
              <button className="car-book-btn" onClick={e => { e.stopPropagation(); onBook(car); }}>
                Забронировать
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
