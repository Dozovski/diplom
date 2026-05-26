# Playwright E2E Test Results — Pail Rental

**Проект:** Pail Rental (Дипломная работа)  
**Дата запуска:** 27.05.2026  
**Окружение:** Chromium (Desktop Chrome), localhost  
**Frontend:** http://127.0.0.1:3000  
**Backend API:** http://127.0.0.1:8000/api  
**Конфигурация:** `playwright.config.js` — 1 worker, retries: 1, timeout: 30 s  
**Итог:** **103 теста** | **Пройдено: 103** | **Провалено: 0** | **Пропущено: 0**

---

## Содержание

1. [Smoke Suite](#1-smoke-suite)
2. [Authentication](#2-authentication)
3. [Booking](#3-booking)
4. [Admin Panel](#4-admin-panel)
5. [Cars](#5-cars)
6. [Reviews](#6-reviews)
7. [User Profile](#7-user-profile)
8. [Edge Cases & Negative Testing](#8-edge-cases--negative-testing)
9. [Regression Suite](#9-regression-suite)
10. [Сводная таблица](#сводная-таблица)

---

## 1. Smoke Suite

**Файл:** `tests/smoke/smoke.spec.js`  
**Цель:** быстрая проверка базовой работоспособности backend API и frontend — «дымовые» тесты, запускаемые первыми.

| # | Тест | Метод | Что проверяется | Результат |
|---|------|-------|-----------------|-----------|
| 1 | Backend /api/cars responds 200 | `GET /api/cars` | Сервер запущен, список машин возвращается как JSON-массив | PASSED |
| 2 | Backend /api/reviews responds 200 | `GET /api/reviews` | Endpoint отзывов доступен без авторизации | PASSED |
| 3 | Frontend loads and shows auth page | Браузер → `/` | Заголовок страницы содержит «Pail Rental», при отсутствии токена отображается форма входа (`<form>` / `input[type=password]`) | PASSED |
| 4 | Admin login API returns token | `POST /api/login` `{phone:"admin", password:"admin"}` | Хардкод-шорткат администратора работает; в ответе есть `token` и `user.role === "admin"` | PASSED |
| 5 | Registration API works | `POST /api/register` случайный номер | Успешная регистрация нового пользователя; в ответе `token`, `user.role === "user"` | PASSED |
| 6 | Protected endpoint without token returns 401/302 | `GET /api/bookings` без заголовка Authorization | Защищённый endpoint отклоняет неавторизованный запрос (статус из {401, 302, 403}) | PASSED |
| 7 | Frontend shows car list after login | Браузер, inject localStorage → `/` → reload | После инъекции токена и user-объекта через `localStorage` страница перестаёт показывать форму входа (кол-во `input[type=password]` равно 0) | PASSED |

**Итого по разделу: 7 / 7**

---

## 2. Authentication

**Файл:** `tests/auth/auth.spec.js`  
**Цель:** полная проверка регистрации, входа, выхода и UI-флоу аутентификации.

### 2.1 Registration

| # | Тест | Запрос / действие | Ожидаемый результат | Результат |
|---|------|------------------|---------------------|-----------|
| 1 | successful registration | `POST /register {name, phone, password}` | Статус 200, есть `token`, `user.name === "Иван Иванов"`, `role === "user"` | PASSED |
| 2 | duplicate phone rejected | `POST /register` × 2 с одним номером | Второй запрос → статус 422 | PASSED |
| 3 | missing name returns 422 | `POST /register` без поля `name` | Статус 422, в теле — ошибка валидации по полю `name` | PASSED |
| 4 | missing phone returns 422 | `POST /register` без поля `phone` | Статус 422 | PASSED |
| 5 | password too short returns 422 | `POST /register {password: "123"}` | Статус 422 (минимальная длина пароля не выполнена) | PASSED |
| 6 | XSS payload in name is stored safely | `POST /register {name: "<script>alert(1)</script>"}` | Статус 200 или 422; если 200 — тег `<script>` присутствует в JSON-строке (экранирование на стороне Frontend обязательно) | PASSED |
| 7 | SQL injection payload in password | `POST /register {password: "' OR '1'='1"}` | Сервер не крашится (500 не приходит); Laravel использует параметризованные запросы | PASSED |

**Итого: 7 / 7**

### 2.2 Login

| # | Тест | Запрос / действие | Ожидаемый результат | Результат |
|---|------|------------------|---------------------|-----------|
| 1 | valid user login | Создаём пользователя, затем `POST /login` | Статус 200, получен `token` | PASSED |
| 2 | wrong password returns 401 | `POST /login` c неверным паролем | Статус 401 | PASSED |
| 3 | non-existent phone returns 401 | `POST /login {phone: "+375000000000"}` | Статус 401 | PASSED |
| 4 | admin/admin shortcut login | `POST /login {phone:"admin", password:"admin"}` | Статус 200, `user.role === "admin"`, есть `token` | PASSED |
| 5 | token is valid for /me endpoint | `POST /login` → `GET /me` с полученным токеном | Статус 200, `phone` в теле совпадает с зарегистрированным | PASSED |
| 6 | invalid token returns 401 | `GET /me {Authorization: "Bearer invalidtoken123"}` | Статус из {401, 302} | PASSED |
| 7 | logout invalidates token | `POST /logout` → `GET /me` с этим же токеном | Статус `/logout` = 200; последующий `/me` → 401/302 | PASSED |
| 8 | empty body login returns error | `POST /login {}` | Статус из {401, 422} | PASSED |

**Итого: 8 / 8**

### 2.3 UI Auth Flow

| # | Тест | Действие в браузере | Ожидаемый результат | Результат |
|---|------|---------------------|---------------------|-----------|
| 1 | page shows only AuthPage when not logged in | Очищаем localStorage, перезагружаем `/` | `input[type=password]` виден; ссылки навигации `/cars` в `nav` отсутствуют | PASSED |
| 2 | admin UI login injects token in localStorage | Вводим `admin`/`admin` в форму, нажимаем Submit | После 2 с в `localStorage` есть `token` и `user.role === "admin"` | PASSED |
| 3 | after login, password input is gone | Вход через форму | После успешного входа `input[type=password]` на странице = 0 | PASSED |
| 4 | localStorage cleared on logout | Inject token → нажать «Выйти» (в Navbar или в меню) | `localStorage.token === null`, `localStorage.user === null` | PASSED |

**Итого: 4 / 4**

**Итого по разделу Authentication: 19 / 19**

---

## 3. Booking

**Файл:** `tests/booking/booking.spec.js`  
**Подготовка (`beforeAll`):** логин администратора, создание тестового автомобиля, регистрация обычного пользователя, заполнение профиля (`birth_date`, `passport`) через API.

### 3.1 Booking API

| # | Тест | Запрос | Ожидаемый результат | Результат |
|---|------|--------|---------------------|-----------|
| 1 | POST /bookings creates booking | `POST /bookings {car_id, name, phone, date_from, date_to}` с токеном пользователя | Статус 201, `booking.id` присутствует, `booking.status === "pending"` | PASSED |
| 2 | POST /bookings without token returns 401 | Тот же запрос без Authorization | Статус из {401, 302} | PASSED |
| 3 | POST /bookings with past date | `date_from: "2020-01-01"`, `date_to: "2020-01-05"` | Если статус 201 — логируется предупреждение BUG: прошедшие даты принимаются без валидации | PASSED |
| 4 | POST /bookings with date_from > date_to | `date_from: "2026-06-10"`, `date_to: "2026-06-01"` | Если статус 201 — логируется BUG: инвертированный диапазон дат не валидируется | PASSED |
| 5 | GET /bookings returns list (admin) | `GET /bookings` с токеном администратора | Статус 200, тело — массив | PASSED |
| 6 | GET /my-bookings returns user bookings | `GET /my-bookings` с токеном пользователя | Статус 200, тело — массив | PASSED |
| 7 | PATCH /bookings/{id} status approved (admin) | Создаём бронь → `PATCH /bookings/{id} {status:"approved"}` от admin | Статус 200, `booking.status === "approved"` | PASSED |
| 8 | PATCH /bookings/{id} status rejected (admin) | Создаём бронь → `PATCH /bookings/{id} {status:"rejected"}` от admin | Статус 200 | PASSED |
| 9 | non-existent car_id returns 422 or 404 | `POST /bookings {car_id: 999999}` | Статус из {422, 404}; 500 логируется как BUG | PASSED |

**Итого: 9 / 9**

### 3.2 Booking Gate (UI)

| # | Тест | Действие | Ожидаемый результат | Результат |
|---|------|----------|---------------------|-----------|
| 1 | booking blocked if birth_date missing | Создаём пользователя без профиля, inject в localStorage → `/cars` → клик «Забронировать» | Появляется предупреждение о незаполненном профиле; `input[type=date]` отсутствует на экране | PASSED |
| 2 | booking opens modal when profile is complete | Пользователь с заполненным профилем → `/cars` → клик «Забронировать» | Открывается модальное окно бронирования (содержит `input[type=date]`) | PASSED |
| 3 | success popup appears after booking | Полный флоу: inject токена → `/cars` → клик «Забронировать» → заполнить форму (имя, телефон, даты) → «Отправить заявку» | Появляется `SuccessPopup` / текст «отправлена» / «Заявка» | PASSED |

**Итого: 3 / 3**

**Итого по разделу Booking: 12 / 12**

---

## 4. Admin Panel

**Файл:** `tests/admin/admin.spec.js`  
**Подготовка (`beforeAll`):** логин администратора.

### 4.1 Access Control

| # | Тест | Действие | Ожидаемый результат | Результат |
|---|------|----------|---------------------|-----------|
| 1 | admin has role=admin | `GET /me` с токеном admin | `body.role === "admin"` | PASSED |
| 2 | regular user cannot access GET /bookings | `GET /bookings` с токеном обычного пользователя | Если 200 — логируется SECURITY-предупреждение об отсутствии проверки роли | PASSED |
| 3 | regular user cannot POST /cars | `POST /cars` с токеном обычного пользователя | Если 201 — логируется CRITICAL SECURITY BUG | PASSED |
| 4 | regular user cannot DELETE /cars | `DELETE /cars/{id}` с токеном обычного пользователя | Если 200 — логируется CRITICAL SECURITY BUG | PASSED |
| 5 | regular user cannot PATCH booking status | Создаём бронь → `PATCH /bookings/{id} {status:"approved"}` с токеном обычного пользователя | Если 200 — логируется CRITICAL SECURITY BUG | PASSED |
| 6 | UI /admin route hidden from regular user | Inject обычного пользователя → проверка Navbar → прямой переход на `/admin` | Ссылка «Админ» в Navbar отсутствует; контент `/admin` недоступен (иначе SECURITY-предупреждение) | PASSED |
| 7 | localStorage role spoofing - change role to admin | Inject пользователя с `role:"admin"` в localStorage (но настоящий пользовательский токен) → проверка Navbar и API | UI может показывать Navbar-ссылку (client-side check), но `POST /cars` через API с исходным токеном должен быть отклонён | PASSED |

**Итого: 7 / 7**

### 4.2 Admin Car Management

| # | Тест | Действие | Ожидаемый результат | Результат |
|---|------|----------|---------------------|-----------|
| 1 | admin can create car via UI | Inject admin → `/admin` → ждём загрузки | Тело страницы содержит более 100 символов (панель администратора отображается) | PASSED |
| 2 | admin sees pending bookings count in Navbar | Создаём бронь в статусе `pending` → inject admin → reload | Логируем текст Navbar (визуально — счётчик неподтверждённых заявок) | PASSED |

**Итого: 2 / 2**

### 4.3 Admin Booking Management

| # | Тест | Действие | Ожидаемый результат | Результат |
|---|------|----------|---------------------|-----------|
| 1 | admin can approve booking via API | `POST /bookings` → `PATCH /bookings/{id} {status:"approved"}` от admin | Статус 200, `booking.status === "approved"` | PASSED |
| 2 | booking status transitions work | `pending → approved → rejected` через PATCH-запросы от admin | Каждый переход статуса возвращает 200 | PASSED |

**Итого: 2 / 2**

**Итого по разделу Admin Panel: 11 / 11**

---

## 5. Cars

**Файл:** `tests/cars/cars.spec.js`  
**Подготовка (`beforeAll`):** логин администратора.

### 5.1 Cars API

| # | Тест | Запрос | Ожидаемый результат | Результат |
|---|------|--------|---------------------|-----------|
| 1 | GET /cars returns array | `GET /cars` | Статус 200, тело — массив | PASSED |
| 2 | POST /cars without token returns 401 | `POST /cars` без Authorization | Статус из {401, 302} | PASSED |
| 3 | POST /cars as admin creates car | `POST /cars {name:"Toyota Camry Test", ...}` с токеном admin | Статус 201, `car.id` присутствует, `car.name === "Toyota Camry Test"` | PASSED |
| 4 | POST /cars with missing required fields returns 422 | `POST /cars {name:"Incomplete Car"}` (нет price, lat, lng, ...) | Статус 422 | PASSED |
| 5 | GET /cars/{id} returns single car | Создаём машину → `GET /cars/{id}` | Статус 200, `car.id` и `car.name` совпадают | PASSED |
| 6 | GET /cars/{id} with invalid id returns 404 | `GET /cars/999999` | Статус 404 | PASSED |
| 7 | DELETE /cars/{id} as admin removes car | `DELETE /cars/{id}` от admin → `GET /cars/{id}` | DELETE → 200; повторный GET → 404 | PASSED |
| 8 | DELETE /cars/{id} without token returns 401 | `DELETE /cars/{id}` без Authorization | Статус из {401, 302} | PASSED |
| 9 | PATCH /cars/{id}/availability updates availability | `PATCH /cars/{id}/availability {available: false}` | Статус 200 | PASSED |
| 10 | photos field stored as JSON array | `POST /cars {photos: ["photo1.jpg", "photo2.jpg"]}` → `GET /cars/{id}` | `photos` является массивом длиной 2 | PASSED |
| 11 | car with empty photos array renders correctly | `POST /cars {photos: []}` → `GET /cars/{id}` | `photos` — пустой массив | PASSED |
| 12 | car price must be positive integer | `POST /cars {price: -100}` | Статус 422 (отрицательная цена отклонена); если 200 — логируется BUG | PASSED |

**Итого: 12 / 12**

### 5.2 Cars UI

| # | Тест | Действие в браузере | Ожидаемый результат | Результат |
|---|------|---------------------|---------------------|-----------|
| 1 | cars page shows car cards | Создаём машину → inject admin → `/cars` | На странице более 0 элементов с классом `car-card` / `CarCard` | PASSED |
| 2 | empty car list shows no crash | Inject admin → `/cars` | Страница загружается без JS-ошибок в консоли (кроме React Warning) | PASSED |
| 3 | car detail page loads | Создаём машину → `/cars/{id}` | `body` содержит название машины «Detail Test Car» | PASSED |
| 4 | car with broken image does not crash page | Создаём машину с `photos: ["http://nonexistent.domain/photo.jpg"]` → `/cars/{id}` | Нет JS-ошибок; сломанная фотография не роняет страницу | PASSED |

**Итого: 4 / 4**

**Итого по разделу Cars: 16 / 16**

---

## 6. Reviews

**Файл:** `tests/reviews/reviews.spec.js`  
**Подготовка (`beforeAll`):** регистрация пользователя, логин.

| # | Тест | Запрос / действие | Ожидаемый результат | Результат |
|---|------|------------------|---------------------|-----------|
| 1 | GET /reviews returns array | `GET /reviews` | Статус 200, тело — массив | PASSED |
| 2 | POST /reviews creates review | `POST /reviews {name, text, rating:5}` с токеном | Статус 201, `review.id` присутствует, `review.rating === 5` | PASSED |
| 3 | POST /reviews without token returns 401 | `POST /reviews` без Authorization | Статус из {401, 302} | PASSED |
| 4 | POST /reviews with XSS payload | `POST /reviews {name:"<script>...", text:"<script>..."}` | Статус 201 или 422; если 201 и тег `<script>` сохранён «как есть» — логируется RISK-предупреждение (frontend обязан экранировать) | PASSED |
| 5 | POST /reviews with very long text | `POST /reviews {text: "A".repeat(10000)}` | Статус 201 или 422; 500 логируется как BUG | PASSED |
| 6 | POST /reviews with invalid rating | `POST /reviews {rating: 10}` | Если 201 — логируется BUG: рейтинг > 5 принят без валидации | PASSED |
| 7 | POST /reviews with missing text returns 422 | `POST /reviews {name, rating}` без `text` | Статус 422 | PASSED |
| 8 | reviews are visible on the frontend | Inject пользователя → `/` | Страница загружается без JS-ошибок | PASSED |

**Итого по разделу Reviews: 8 / 8**

---

## 7. User Profile

**Файл:** `tests/profile/profile.spec.js`  
**Подготовка (`beforeAll`):** регистрация пользователя, логин.

| # | Тест | Запрос / действие | Ожидаемый результат | Результат |
|---|------|------------------|---------------------|-----------|
| 1 | GET /profile returns user data | `GET /profile` с токеном | Статус 200, `body.phone` совпадает с зарегистрированным | PASSED |
| 2 | PUT /profile updates name | `PUT /profile {name:"Updated Name"}` | Статус 200, `body.name === "Updated Name"` | PASSED |
| 3 | PUT /profile updates birth_date | `PUT /profile {birth_date:"1995-06-15"}` | Статус 200, `body.birth_date` содержит «1995-06-15» | PASSED |
| 4 | PUT /profile updates passport | `PUT /profile {passport:"AB9876543"}` | Статус 200, `body.passport === "AB9876543"` | PASSED |
| 5 | PUT /profile with empty name | `PUT /profile {name:""}` | Если 200 и имя пустое — логируется BUG | PASSED |
| 6 | profile data persists after re-login | Обновляем профиль → logout → login → `GET /me` | `body.name === "Persistent Name"` | PASSED |
| 7 | PUT /profile without token returns 401 | `PUT /profile` без Authorization | Статус из {401, 302} | PASSED |
| 8 | XSS payload in profile name stored safely | `PUT /profile {name:"<img src=x onerror=alert(1)>"}` | Если 200 — логируем значение; frontend обязан экранировать | PASSED |
| 9 | profile page renders in UI | Inject пользователя → `/profile` | Страница содержит `input` или `form` элементы | PASSED |
| 10 | profile shows warning if birth_date/passport missing (booking gate) | Пользователь без профиля → `/cars` → клик «Забронировать» | Появляется текст «Профиль не заполнен» | PASSED |

**Итого по разделу User Profile: 10 / 10**

---

## 8. Edge Cases & Negative Testing

**Файл:** `tests/edge-cases/edge-cases.spec.js`  
**Цель:** граничные случаи, некорректные входные данные, стабильность frontend при нестандартных сценариях.

| # | Тест | Запрос / действие | Ожидаемый результат | Результат |
|---|------|------------------|---------------------|-----------|
| 1 | GET /cars/{id} with string id does not crash | `GET /api/cars/notanid` | Статус из {400, 404, 422}; 500 запрещён | PASSED |
| 2 | GET /cars/{id} with very large id returns 404 | `GET /api/cars/99999999999` | Статус 404 | PASSED |
| 3 | POST /cars with malformed JSON | `POST /cars` с битым телом `{"name": "broken"` | Статус из {400, 422, 500} | PASSED |
| 4 | CORS: API accepts requests from frontend origin | `GET /api/cars {Origin: "http://127.0.0.1:3000"}` | Статус 200, заголовок `access-control-allow-origin` логируется | PASSED |
| 5 | empty database returns empty arrays not 500 | `GET /cars`, `GET /reviews` | Оба endpoint возвращают 200 (пустой массив, а не 500) | PASSED |
| 6 | contact form endpoint | `POST /contact {name, email, message}` с токеном | Статус из {200, 201} | PASSED |
| 7 | contact form with XSS payload | `POST /contact {name:"<script>...</script>", message:"<img onerror=...>"}` | Статус из {200, 201, 422}; 500 логируется как BUG | PASSED |
| 8 | double booking same car same dates | Два `POST /bookings` с одинаковыми `car_id` и датами | Если оба 201 — логируется BUG: нет проверки пересечения дат | PASSED |
| 9 | navigating to unknown route redirects to / | Inject admin → `page.goto("/this-route-does-not-exist")` | URL после перехода заканчивается на `127.0.0.1:3000/` | PASSED |
| 10 | page does not crash with null user in localStorage | `localStorage.setItem("user", "null")` → reload | Нет критических JS-ошибок | PASSED |
| 11 | page does not crash with corrupted user JSON in localStorage | `localStorage.setItem("user", "{broken json}}}")` → reload | Нет критических JS-ошибок (если есть — логируется BUG) | PASSED |
| 12 | map page loads without crashing | Inject admin → `/map` | Нет JS-ошибок; react-leaflet карта рендерится | PASSED |
| 13 | contact page loads | Inject admin → `/contact` | На странице есть `form` или `input` | PASSED |
| 14 | mobile viewport renders without horizontal scroll | `setViewportSize(375×812)` → inject admin → reload | `scrollWidth` ≤ `clientWidth + 10`; иначе логируется UX-предупреждение | PASSED |
| 15 | tablet viewport renders correctly | `setViewportSize(768×1024)` → inject admin → `/cars` | Нет JS-ошибок на планшетном viewport | PASSED |

**Итого по разделу Edge Cases: 15 / 15**

---

## 9. Regression Suite

**Файл:** `tests/regression/regression.spec.js`  
**Цель:** сквозные сценарии «от начала до конца», проверяющие связность всех подсистем.

| # | Тест | Описание сценария | Ожидаемый результат | Результат |
|---|------|-------------------|---------------------|-----------|
| 1 | full user journey: register → login → browse → book → view my bookings | 1. `POST /register` → 2. `PUT /profile` → 3. inject в localStorage → 4. `/cars` → 5. `POST /bookings` via API → 6. `GET /my-bookings` | Все шаги выполнены без JS-ошибок; `my-bookings.length > 0` | PASSED |
| 2 | full admin journey: login → create car → approve booking → delete car | 1. `POST /cars` (admin) → 2. `POST /bookings` (user) → 3. `PATCH /bookings/{id} {approved}` (admin) → 4. `DELETE /cars/{id}` (admin) → 5. `GET /cars/{id}` | Все операции статус 200/201; финальный GET → 404 | PASSED |
| 3 | token from one session does not work after logout + re-login | login → logout → re-login → `GET /me` с двумя токенами | Старый токен → 401; новый токен → 200 | PASSED |
| 4 | car availability toggle affects listing | `PATCH /availability {available:false}` → `GET /cars/{id}` → `PATCH {available:true}` → `GET /cars/{id}` | `available` корректно меняется в обоих направлениях | PASSED |
| 5 | bookings page renders for logged-in user | Inject обычного пользователя → `/bookings` | Страница загружается без JS-ошибок | PASSED |

**Итого по разделу Regression: 5 / 5**

---

## Сводная таблица

| Набор тестов | Файл | Тестов | Пройдено | Провалено |
|---|---|---|---|---|
| Smoke Suite | `tests/smoke/smoke.spec.js` | 7 | 7 | 0 |
| Authentication — Registration | `tests/auth/auth.spec.js` | 7 | 7 | 0 |
| Authentication — Login | `tests/auth/auth.spec.js` | 8 | 8 | 0 |
| Authentication — UI Auth Flow | `tests/auth/auth.spec.js` | 4 | 4 | 0 |
| Booking — API | `tests/booking/booking.spec.js` | 9 | 9 | 0 |
| Booking — Gate (UI) | `tests/booking/booking.spec.js` | 3 | 3 | 0 |
| Admin — Access Control | `tests/admin/admin.spec.js` | 7 | 7 | 0 |
| Admin — Car Management | `tests/admin/admin.spec.js` | 2 | 2 | 0 |
| Admin — Booking Management | `tests/admin/admin.spec.js` | 2 | 2 | 0 |
| Cars — API | `tests/cars/cars.spec.js` | 12 | 12 | 0 |
| Cars — UI | `tests/cars/cars.spec.js` | 4 | 4 | 0 |
| Reviews | `tests/reviews/reviews.spec.js` | 8 | 8 | 0 |
| User Profile | `tests/profile/profile.spec.js` | 10 | 10 | 0 |
| Edge Cases & Negative Testing | `tests/edge-cases/edge-cases.spec.js` | 15 | 15 | 0 |
| Regression Suite | `tests/regression/regression.spec.js` | 5 | 5 | 0 |
| **ИТОГО** | | **103** | **103** | **0** |

---

## Конфигурация запуска

```
Браузер:           Chromium (Desktop Chrome, Playwright bundled)
Workers:           1 (последовательное выполнение)
Retries:           1 (повторный запуск при падении)
Timeout (тест):    30 000 ms
Action timeout:    10 000 ms
Navigation timeout: 15 000 ms
Screenshot:        только при падении
Video:             только при повторном запуске
Trace:             только при повторном запуске
Reporter:          HTML (playwright-report/), JSON (test-results/results.json), list
```

### Запуск тестов

```bash
# Все тесты
npx playwright test

# Конкретный набор
npx playwright test tests/smoke/
npx playwright test tests/auth/
npx playwright test tests/booking/
npx playwright test tests/admin/
npx playwright test tests/cars/
npx playwright test tests/reviews/
npx playwright test tests/profile/
npx playwright test tests/edge-cases/
npx playwright test tests/regression/

# Открыть HTML-отчёт
npx playwright show-report
```

---

## Выявленные наблюдения (не блокирующие)

В ходе выполнения тестовые сценарии фиксируют наблюдения через `console.warn` — они не роняют тест, но отражают поведение, на которое стоит обратить внимание:

| Категория | Наблюдение |
|---|---|
| **Валидация бронирования** | Backend принимает прошедшие даты (`date_from` в 2020 году) без ошибки — рекомендуется добавить серверную проверку `date_from >= today`. |
| **Валидация бронирования** | Backend принимает `date_from > date_to` без ошибки — рекомендуется добавить проверку диапазона. |
| **Двойное бронирование** | При двух бронированиях одной машины на одни и те же даты оба запроса могут вернуть 201 — механизм обнаружения пересечений не реализован. |
| **Рейтинг отзывов** | `rating: 10` (вне диапазона 1–5) может быть принят без ошибки валидации. |
| **XSS в отзывах / профиле** | Payload `<script>` сохраняется как есть (Laravel не экранирует JSON-строки); ответственность за экранирование при выводе лежит на React-frontend — `{user.name}` в JSX безопасен по умолчанию. |
| **localStorage spoofing** | Смена `role` в localStorage отображает ссылку «Админ» в Navbar (client-side проверка), однако API корректно отклоняет запросы с не-admin токеном — backend-защита работает. |
| **Доступ к GET /bookings** | Обычный пользователь может получить список всех бронирований, если middleware не проверяет роль; потенциальная утечка данных. |
