import React, { useEffect, useRef } from 'react';
import { getCarPhotos } from '../data';

const GOOGLE_API_KEY = 'AIzaSyAfpMv628jog3lE0LU765hl6_LapEMUt3o';

export default function GoogleMap({ cars, onCarClick, selectedCarId }) {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markers = useRef([]);
  const activeInfoWindow = useRef(null);

  useEffect(() => {
    if (mapInstance.current) return;

    const loadGoogleMaps = () => new Promise((resolve) => {
      if (window.google) return resolve(window.google);
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_API_KEY}`;
      script.onload = () => resolve(window.google);
      document.head.appendChild(script);
    });

    loadGoogleMaps().then((google) => {
      const map = new google.maps.Map(mapRef.current, {
        center: { lat: 53.9006, lng: 27.559 },
        zoom: 12,
        // Отключаем масштабирование скроллом
        scrollwheel: false,
        gestureHandling: 'cooperative',
        styles: [
          { elementType: 'geometry', stylers: [{ color: '#0a0b0f' }] },
          { elementType: 'labels.text.fill', stylers: [{ color: '#8b8da0' }] },
          { elementType: 'labels.text.stroke', stylers: [{ color: '#0a0b0f' }] },
          { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#181920' }] },
          { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#2a2b38' }] },
          { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#12131a' }] },
          { featureType: 'poi', stylers: [{ visibility: 'off' }] },
        ],
      });

      mapInstance.current = map;

      cars.forEach(car => {
        const color = car.available ? '#3b82f6' : '#ef4444';

        const marker = new google.maps.Marker({
          position: { lat: car.lat, lng: car.lng },
          map,
          label: {
            text: `${car.price}`,
            color: 'white',
            fontSize: '11px',
            fontWeight: '700',
          },
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 20,
            fillColor: color,
            fillOpacity: 1,
            strokeColor: 'white',
            strokeWeight: 2,
          },
        });

        const infoWindow = new google.maps.InfoWindow({
          content: `
  <div style="font-family:'Outfit',sans-serif;width:180px;padding:3px;background:#22232e;color:#e8e9f0;">
    <img src="${getCarPhotos(car)?.[0]}" style="width:100%;height:90px;object-fit:cover;border-radius:6px;margin-bottom:8px;" />
    <div style="font-size:13px;font-weight:700;margin-bottom:3px;">${car.name}</div>
    <div style="font-size:11px;color:#8b8da0;margin-bottom:8px;">${car.year} · ${car.transmission}</div>
    <div style="display:flex;justify-content:space-between;align-items:center;">
      <span style="font-size:14px;font-weight:800;color:#3b82f6;">${car.price} BYN</span>
      <span style="font-size:11px;color:${car.available ? '#10b981' : '#ef4444'};font-weight:700;">${car.available ? '✓' : '✗'}</span>
    </div>
  </div>
`,
          // Фиксированный размер — не меняется при зуме
          pixelOffset: new google.maps.Size(0, -10),
          disableAutoPan: true,
        });

        // Показывать при наведении
        marker.addListener('mouseover', () => {
          if (activeInfoWindow.current) activeInfoWindow.current.close();
          infoWindow.open(map, marker);
          activeInfoWindow.current = infoWindow;
        });

        // Закрывать при уходе мыши
        marker.addListener('mouseout', () => {
          infoWindow.close();
          activeInfoWindow.current = null;
        });

        // При клике открывать модал бронирования
        marker.addListener('click', () => {
          if (onCarClick) onCarClick(car);
        });

        markers.current.push({ carId: car.id, marker, infoWindow });
      });
    });

    return () => {
      markers.current = [];
      mapInstance.current = null;
    };
  }, [cars]);

  useEffect(() => {
    if (!selectedCarId || !mapInstance.current) return;
    const found = markers.current.find(m => m.carId === selectedCarId);
    const car = cars.find(c => c.id === selectedCarId);
    if (found && car) {
      mapInstance.current.panTo({ lat: car.lat, lng: car.lng });
      mapInstance.current.setZoom(15);
      if (activeInfoWindow.current) activeInfoWindow.current.close();
      found.infoWindow.open(mapInstance.current, found.marker);
      activeInfoWindow.current = found.infoWindow;
    }
  }, [selectedCarId, cars]);

  return <div ref={mapRef} style={{ width: '100%', height: '100%', borderRadius: 20 }} />;
}