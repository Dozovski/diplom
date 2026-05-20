# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Pail Rental** — a car rental web application (diploma project) for Minsk. Users can browse cars, book them, leave reviews, and manage their profile. Admins can manage bookings and the car catalog.

## Architecture

Monorepo with two independently running services:

- `frontend/` — React 18 SPA (port 3000)
- `backend-full/` — Laravel 11 REST API (port 8000)
- `db/` — auxiliary SQL scripts
- `docs/API.md` — API endpoint reference

### Frontend (`frontend/`)

- `src/App.jsx` — root component; owns all global state: `user`, `cars`, `bookings`, `modalCar`. If `user` is null, only `AuthPage` is rendered (no public routes).
- `src/api.js` — single axios instance with base URL `REACT_APP_API_URL` (defaults to `http://localhost:8000/api`). Bearer token is injected from `localStorage` via a request interceptor.
- `src/pages/` — one file per page/route. Admin-only route (`/admin`) is conditionally registered in `App.jsx` based on `user.role === 'admin'`.
- `src/components/` — shared UI: `Navbar`, `Footer`, `CarCard`, `BookingModal`, `PhotoGallery`, `GoogleMap` (actually uses react-leaflet, not Google Maps SDK), `SuccessPopup`.
- Map uses **react-leaflet** (not Google Maps JS API) despite the README mentioning Google Maps.

### Backend (`backend-full/`)

- Standard Laravel 11 structure. All API routes are in `routes/api.php`.
- Auth: **Laravel Sanctum** (bearer tokens). Registration and car/review listing are public. All write operations and admin routes require `auth:sanctum` middleware.
- Admin check: the login endpoint has a hardcoded shortcut — phone `admin` / password `admin` creates/fetches an admin user via `firstOrCreate`.
- `Car.photos` is stored as a JSON array (cast to `array` in the model).
- User roles: `user` (default) or `admin` (stored in `users.role` column).

## Development Commands

### Backend

```bash
cd backend-full
composer install
cp .env.example .env
php artisan key:generate
# Edit .env: set DB_CONNECTION=mysql, DB_HOST, DB_DATABASE=pail_rental, DB_USERNAME, DB_PASSWORD
php artisan migrate          # or import database/pail_rental.sql via phpMyAdmin
php artisan serve            # starts on http://localhost:8000
```

Run tests:
```bash
cd backend-full
php artisan test             # runs PHPUnit
```

Lint (Laravel Pint):
```bash
cd backend-full
vendor/bin/pint
```

### Frontend

```bash
cd frontend
npm install
npm start    # starts on http://localhost:3000
npm run build
```

## Key Conventions

- **Authentication** uses phone number + password (not email). Token and user object are stored in `localStorage` under keys `token` and `user`.
- **Booking gate**: before opening the booking modal, `App.jsx` checks that `user.birth_date` and `user.passport` are set; if not, it shows a profile-completion warning instead.
- **Admin credentials**: phone `admin`, password `admin` (hardcoded in `AuthController::login`).
- The frontend `package.json` has `"proxy": "http://localhost:8000"` so relative API paths also work in development.
- CORS must be enabled in Laravel for cross-origin requests from port 3000.
