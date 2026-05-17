import React, { useState } from 'react';
import { getCarPhotos, PHOTO_LABELS } from '../data';

export default function PhotoGallery({ car, carId, large = false }) {
  const photos = car ? getCarPhotos(car) : [];
  const [active, setActive] = useState(0);
  const [lightbox, setLightbox] = useState(false);

  const prev = () => setActive(a => (a - 1 + photos.length) % photos.length);
  const next = () => setActive(a => (a + 1) % photos.length);

  return (
    <>
      <div className={`gallery ${large ? 'gallery-lg' : ''}`}>
        <div className="gallery-main" onClick={() => large && setLightbox(true)}>
          <img src={photos[active]} alt={PHOTO_LABELS[active]} loading="lazy" />
          <button className="gallery-arrow gallery-arrow-l" onClick={e => { e.stopPropagation(); prev(); }}>‹</button>
          <button className="gallery-arrow gallery-arrow-r" onClick={e => { e.stopPropagation(); next(); }}>›</button>
          <div className="gallery-counter">{active + 1} / {photos.length}</div>
          <div className="gallery-label">{PHOTO_LABELS[active]}</div>
        </div>
        <div className="gallery-thumbs">
          {photos.map((p, i) => (
            <button key={i} className={`gallery-thumb ${i === active ? 'active' : ''}`} onClick={() => setActive(i)}>
              <img src={p} alt="" loading="lazy" />
              <span className="gallery-thumb-label">{PHOTO_LABELS[i]}</span>
            </button>
          ))}
        </div>
      </div>

      {lightbox && (
        <div className="lightbox-overlay" onClick={() => setLightbox(false)}>
          <div className="lightbox-inner" onClick={e => e.stopPropagation()}>
            <button className="lightbox-close" onClick={() => setLightbox(false)}>✕</button>
            <img src={photos[active]} alt="" />
            <button className="lightbox-arrow lightbox-arrow-l" onClick={prev}>‹</button>
            <button className="lightbox-arrow lightbox-arrow-r" onClick={next}>›</button>
            <div className="lightbox-dots">
              {photos.map((_, i) => (
                <button key={i} className={`lightbox-dot ${i === active ? 'active' : ''}`} onClick={() => setActive(i)} />
              ))}
            </div>
            <div className="lightbox-label-text">{PHOTO_LABELS[active]} — {active + 1}/{photos.length}</div>
          </div>
        </div>
      )}
    </>
  );
}