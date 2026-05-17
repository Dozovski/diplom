import React, { useState } from 'react';
import GoogleMap from '../components/GoogleMap';
import { getCarPhotos } from '../data';

export default function MapPage({ cars, onCarClick }) {
  const [selected, setSelected] = useState(null);

  return (
    <div className="page-enter" style={{ paddingTop: 100 }}>
      <section className="section">
        <div className="section-header">
          <div className="section-label">Карта Минска</div>
          <div className="section-title">Где находятся наши авто</div>
        </div>
        <div className="leaflet-wrap">
          <GoogleMap cars={cars} onCarClick={onCarClick} selectedCarId={selected} />
        </div>
        <div className="map-car-list">
          {cars.map(car => (
            <div key={car.id} className="map-car-item"
              onClick={() => { setSelected(car.id); setTimeout(() => setSelected(null), 100); }}>
              <img src={getCarPhotos(car)?.[0]} alt={car.name} />
              <div className="map-car-item-info">
                <div style={{ fontWeight: 700, fontSize: 14 }}>{car.name}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{car.address}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: 800, color: 'var(--accent)', fontSize: 15 }}>{car.price} BYN</div>
                <div style={{ fontSize: 11, color: car.available ? 'var(--success)' : 'var(--danger)', fontWeight: 600 }}>
                  {car.available ? 'Доступен' : 'Занят'}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
