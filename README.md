# Pail Rental — Аренда автомобилей в Минске

## Дипломный проект

Веб-приложение для аренды автомобилей в городе Минск, Республика Беларусь.

### Технологический стек

| Компонент       | Технология                          |
|-----------------|-------------------------------------|
| ОС              | Windows 11                          |
| Браузер         | Google Chrome                       |
| IDE             | Visual Studio Code                  |
| Frontend        | React 18, HTML5, CSS3, JavaScript   |
| Backend         | PHP 8.2, Laravel 11                 |
| База данных     | MySQL 8.0                           |
| Карты           | Leaflet + OpenStreetMap             |

---

## Структура проекта

```
pail-rental/
├── frontend/               # React-приложение
│   ├── public/index.html
│   ├── src/
│   │   ├── components/     # Компоненты
│   │   ├── pages/          # Страницы
│   │   ├── assets/css/     # Стили
│   │   ├── App.jsx
│   │   ├── index.js
│   │   └── api.js
│   └── package.json
├── backend/                # Laravel
│   ├── app/Http/Controllers/
│   ├── app/Http/Models/
│   ├── app/Routes/
│   ├── database/migrations/
│   ├── database/seeders/
│   ├── composer.json
│   └── .env.example
└── docs/API.md
```

---

## Установка

### 1. Backend (Laravel)

```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
# Настроить DB_DATABASE, DB_USERNAME, DB_PASSWORD в .env
php artisan migrate
php artisan db:seed
php artisan serve
```

### 2. Frontend (React)

```bash
cd frontend
npm install
npm start
```

Backend: http://localhost:8000  
Frontend: http://localhost:3000

---

## Функциональность

- Каталог автомобилей с фильтрацией
- Галерея фотографий (экстерьер / интерьер)
- Карта Минска с маркерами авто (Leaflet + OSM)
- Бронирование автомобилей
- Панель управления заявками
- Контактная форма + FAQ

---

© 2026 Pail Rental. Дипломный проект.
