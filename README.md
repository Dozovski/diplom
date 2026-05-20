# Pail Rental — Аренда автомобилей в Минске

Дипломный проект — веб-сайт для аренды автомобилей с системой бронирования, личным кабинетом и панелью администратора.

---

## Технологический стек

| Компонент | Технология |
|-----------|-----------|
| ОС | Windows 11 |
| Браузер | Google Chrome |
| IDE | Visual Studio Code |
| Frontend | React 18, HTML5, CSS3, JavaScript |
| Backend | PHP 8.2, Laravel 11 |
| База данных | MySQL 8.0 (XAMPP) |
| Карты | Google Maps API |

---

## Структура проекта

```
pail-rental/
├── frontend/               # React-приложение
│   ├── public/
│   │   └── img/            # Фотографии автомобилей
│   ├── src/
│   │   ├── components/     # Компоненты (Navbar, Footer, CarCard и др.)
│   │   ├── pages/          # Страницы (Home, Cars, Map, Admin и др.)
│   │   ├── assets/css/     # Глобальные стили
│   │   ├── App.jsx
│   │   ├── api.js
│   │   └── data.js
│   └── package.json
├── backend-full/           # Laravel API
│   ├── app/Http/Controllers/
│   ├── app/Models/
│   ├── database/migrations/
│   ├── routes/api.php
│   ├── composer.json
│   └── .env.example
└── db/                     # SQL скрипты для SSMS
```

---

## Требования

Перед запуском установи:

- [Node.js LTS](https://nodejs.org)
- [XAMPP](https://www.apachefriends.org) (PHP 8.2 + MySQL)
- [Composer](https://getcomposer.org)
- [Git](https://git-scm.com)

---

## Установка и запуск

### Шаг 1 — Клонировать репозиторий

```bash
git clone https://github.com/твой_ник/pail-rental.git
cd pail-rental
```

### Шаг 2 — Запустить XAMPP

Открой XAMPP Control Panel → нажми **Start** у **Apache** и **MySQL**

### Шаг 3 — Создать базу данных

Открой браузер → `http://localhost/phpmyadmin`
- Создай базу данных с именем `pail_rental`
- Вкладка **Импорт** → выбери файл `backend-full/database/pail_rental.sql` → **Вперёд**

### Шаг 4 — Настроить Backend

```bash
cd backend-full
composer install
cp .env.example .env
php artisan key:generate
```

Открой файл `.env` и укажи данные БД:

```
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=pail_rental
DB_USERNAME=root
DB_PASSWORD=
```

Запусти сервер:

```bash
php artisan migrate
php artisan serve
```

Backend доступен на `http://localhost:8000`

### Шаг 5 — Запустить Frontend

Открой новый терминал:

```bash
cd frontend
npm install
npm start
```

Frontend доступен на `http://localhost:3000`

---

## Доступ к системе

| Роль | Логин | Пароль |
|------|-------|--------|
| Администратор | `admin` | `admin` |
| Пользователь | регистрация на сайте | — |

---

## Функциональность

### Для пользователя
- Регистрация и авторизация
- Каталог автомобилей с фильтрацией по категориям (Эконом, Комфорт, Бизнес, Премиум)
- Детальная страница автомобиля с фотогалереей и характеристиками
- Интерактивная карта Минска с расположением автомобилей (Google Maps API)
- Онлайн-бронирование автомобиля
- Личный кабинет (профиль, история бронирований)
- Написание отзывов с оценкой
- Контактная форма

### Для администратора
- Панель управления заявками (одобрение / отклонение)
- Управление каталогом автомобилей (добавление / удаление)
- Изменение статуса доступности автомобиля
- Просмотр всех бронирований

---

## Возможные проблемы

**`npm start` не запускается:**
Проверь файл `frontend/.env` — там должна быть строка:
```
BROWSER=none
DANGEROUSLY_DISABLE_HOST_CHECK=true
```

**`php artisan serve` не работает:**
Убедись что XAMPP запущен и PHP добавлен в PATH. Путь к PHP: `C:\xampp\php\php.exe`

**Карта не отображается:**
Google Maps API ключ уже вшит в код. Если карта не работает — проверь подключение к интернету.

---

© 2026 Pail Rental. Дипломный проект.
