# Security Fixes & QA Report — Pail Rental

Дата: 2026-05-20  
Ветка: main

---

## Результаты тестирования

| До исправлений | После исправлений |
|---|---|
| 80 / 103 тестов прошли (77.7%) | **103 / 103 тестов прошли (100%)** |
| 4 критических бага | 0 критических багов |
| 5 высоких багов | 0 высоких багов |

---

## Исправленные баги

### 🔴 Критические (P0) — Broken Access Control

#### BUG-001: Любой пользователь мог удалить автомобиль
- **Файлы:** `routes/api.php`, `app/Http/Middleware/AdminMiddleware.php`
- **Причина:** Admin-маршруты были защищены только `auth:sanctum`, без проверки роли
- **Исправление:** Создан `AdminMiddleware`, все admin-маршруты (`DELETE /cars`, `POST /cars`, `PUT /cars`, `PATCH /bookings`, `GET /bookings`, `PATCH /cars/{id}/availability`) перенесены в группу `['auth:sanctum', 'admin']`

#### BUG-002: Любой пользователь мог изменить статус бронирования
- **Файл:** `routes/api.php`
- **Исправление:** `PATCH /bookings/{id}` теперь в admin-группе

#### BUG-003: Любой пользователь мог создать автомобиль
- **Файл:** `routes/api.php`
- **Исправление:** `POST /cars`, `PUT /cars/{id}` теперь в admin-группе

#### BUG-004: Все бронирования видны любому авторизованному пользователю (утечка персональных данных)
- **Файл:** `routes/api.php`
- **Исправление:** `GET /bookings` теперь в admin-группе; обычный пользователь видит только свои брони через `/my-bookings`

---

### 🟠 Высокие (P1)

#### BUG-005: API возвращал 500 вместо 401/422 без заголовка `Accept: application/json`
- **Файлы:** `app/Http/Middleware/ForceJsonResponse.php`, `bootstrap/app.php`
- **Причина:** Без Accept-заголовка Laravel перенаправлял на login-страницу вместо JSON-ответа
- **Исправление:** Новый middleware `ForceJsonResponse` принудительно добавляет `Accept: application/json` для всех API-запросов

#### BUG-006: Хардкоженные учётные данные admin/admin в исходном коде
- **Файлы:** `app/Http/Controllers/AuthController.php`, `.env`, `.env.example`
- **Исправление:** Credentials вынесены в переменные окружения `ADMIN_PHONE` и `ADMIN_PASSWORD`

#### BUG-007: Отсутствие проверки пересечения дат бронирования
- **Файл:** `app/Http/Controllers/BookingController.php`
- **Исправление:** Перед созданием бронирования выполняется проверка на перекрытие дат для того же автомобиля (исключая отклонённые брони)

#### BUG-008: `CarController::update()` использовал `$request->all()` без валидации (Mass Assignment)
- **Файл:** `app/Http/Controllers/CarController.php`
- **Исправление:** Заменено на `$request->validate()` со строгими правилами для каждого поля

#### BUG-009: Роль пользователя читалась из localStorage (уязвимость к спуфингу)
- **Файл:** `frontend/src/App.jsx`
- **Исправление:** При старте приложения вызывается `/api/me` — роль всегда берётся с сервера, не из localStorage. Испорченный JSON в localStorage больше не крашит приложение

---

### 🟡 Средние (P2)

#### BUG-010: Кнопка "Выйти" не имела атрибутов для тестирования и accessibility
- **Файл:** `frontend/src/components/Navbar.jsx`
- **Исправление:** Добавлены `data-testid="logout-btn"` и `aria-label="Выйти из аккаунта"`

#### BUG-011: Поле телефона не имело `type="tel"`
- **Файл:** `frontend/src/pages/AuthPage.jsx`
- **Исправление:** Добавлены `type="tel"`, `name="phone"`, `id="phone"`, `autoComplete="tel"`

#### BUG-012: `myBookings` фильтровал по `phone` вместо `user_id`
- **Файлы:** `app/Http/Controllers/BookingController.php`, `app/Models/Booking.php`, миграция `2026_05_20_194111_add_user_id_to_bookings_table.php`
- **Причина:** При смене телефона пользователь терял доступ к своим бронированиям
- **Исправление:** В таблицу `bookings` добавлен `user_id` (FK на `users`), фильтрация переведена на `user_id`

#### BUG-014: Неограниченное накопление токенов Sanctum
- **Файл:** `app/Http/Controllers/AuthController.php`
- **Исправление:** При логине старые токены обрезаются до максимума 10 на пользователя

#### BUG-016: Отсутствие тестовых данных в SQL-дампе
- **Файл:** `database/seeders/DatabaseSeeder.php`
- **Исправление:** Сидер создаёт admin-пользователя, demo-пользователя, 4 автомобиля разных категорий и 3 отзыва

---

### 🔧 Прочее

#### Route constraints для числовых ID
- **Файл:** `routes/api.php`
- **Исправление:** Добавлен `.whereNumber('id')` на все маршруты с числовым параметром — нечисловые значения возвращают 404 вместо 500

#### ProfileController — строгая валидация
- **Файл:** `app/Http/Controllers/ProfileController.php`
- **Исправление:** Добавлена проверка `sometimes|required|string|min:2` для имени и `before:today` для даты рождения; возвращается `fresh()` для получения актуальных данных

#### CarController — расширенная валидация
- **Файл:** `app/Http/Controllers/CarController.php`
- **Исправление:** Добавлены диапазонные ограничения (`between:-90,90` для lat/lng, `min:2000` для года, `max:2000` для hp)

---

## Новые файлы

| Файл | Назначение |
|---|---|
| `app/Http/Middleware/AdminMiddleware.php` | Проверяет `user.role === 'admin'`, иначе 403 |
| `app/Http/Middleware/ForceJsonResponse.php` | Принудительно ставит `Accept: application/json` для API |
| `database/migrations/2026_05_20_..._add_user_id_to_bookings_table.php` | Добавляет FK `user_id` в таблицу `bookings` |
| `tests/` | Полный Playwright E2E тест-сьют (103 теста) |
| `playwright.config.js` | Конфигурация Playwright |
| `CLAUDE.md` | Документация для Claude Code |

---

## Архитектура защиты (после исправлений)

```
Public routes:
  GET  /api/cars
  GET  /api/cars/{id}      ← whereNumber constraint
  GET  /api/reviews
  POST /api/register
  POST /api/login

Authenticated (auth:sanctum):
  POST /api/logout
  GET  /api/me
  POST /api/bookings        ← overlap validation
  GET  /api/my-bookings     ← filtered by user_id
  POST /api/contact
  POST /api/reviews
  GET  /api/profile
  PUT  /api/profile

Admin only (auth:sanctum + AdminMiddleware):
  GET    /api/bookings
  PATCH  /api/bookings/{id}
  POST   /api/cars
  PUT    /api/cars/{id}
  PATCH  /api/cars/{id}/availability
  DELETE /api/cars/{id}
```

---

## Как запустить тесты

```bash
# 1. Запустить backend (нужен Docker для MySQL)
docker run -d --name pail_mysql \
  -e MYSQL_DATABASE=pail_rental \
  -e MYSQL_USER=pail \
  -e MYSQL_PASSWORD=secret \
  -p 3307:3306 mysql:8.0

cd backend-full
composer install
cp .env.example .env
# Отредактировать .env: DB_PORT=3307, DB_USERNAME=pail, DB_PASSWORD=secret
php artisan key:generate
php artisan migrate
php artisan db:seed
php artisan serve

# 2. Запустить frontend
cd frontend
npm install
npm start

# 3. Запустить тесты
npm install
npx playwright install chromium
npx playwright test --config=playwright.config.js
```
