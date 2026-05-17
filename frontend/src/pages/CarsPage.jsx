import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CarCard from '../components/CarCard';
import { CATEGORIES } from '../data';

export default function CarsPage({ cars, onBook }) {
  const [filter, setFilter] = useState('Все');
  const navigate = useNavigate();
  const filtered = filter === 'Все' ? cars : cars.filter(c => c.category === filter);

  return (
    <div className="page-enter" style={{ paddingTop: 100 }}>
      <section className="section">
        <div className="section-header">
          <div className="section-label">Каталог</div>
          <div className="section-title">Наши автомобили</div>
        </div>
        <div className="cars-filters">
          {CATEGORIES.map(c => (
            <button key={c} className={`filter-btn ${filter === c ? 'active' : ''}`}
              onClick={() => setFilter(c)}>{c}</button>
          ))}
        </div>
        <div className="cars-grid">
          {filtered.map(car => (
            <CarCard key={car.id} car={car} onBook={onBook}
              onDetail={(c) => navigate(`/cars/${c.id}`)} />
          ))}
        </div>
      </section>
    </div>
  );
}
