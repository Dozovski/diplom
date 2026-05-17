# Pail Rental — API Documentation

Base URL: `http://localhost:8000/api`

## Автомобили

### GET /cars
Список автомобилей. Параметры фильтрации:
- `category` — Эконом | Комфорт | Бизнес | Премиум
- `available` — true | false
- `min_price` / `max_price` — диапазон цен

### GET /cars/{id}
Детали автомобиля по ID.

### POST /cars
Создание автомобиля (admin). Body: name, category, year, seats, transmission, fuel, engine, hp, price, lat, lng, address, description, photos.

### PUT /cars/{id}
Обновление автомобиля.

### DELETE /cars/{id}
Удаление автомобиля.

---

## Бронирования

### GET /bookings
Список заявок. Фильтр: `?status=pending`

### POST /bookings
Создание заявки. Body:
```json
{
  "car_id": 1,
  "name": "Иван Иванов",
  "phone": "+375291234567",
  "email": "ivan@example.com",
  "date_from": "2026-04-15",
  "date_to": "2026-04-20",
  "comment": "Нужно детское кресло"
}
```

### PATCH /bookings/{id}
Обновление статуса: `{"status": "approved"}` или `{"status": "rejected"}`

---

## Отзывы

### GET /reviews
Список отзывов.

---

## Контакты

### POST /contact
Отправка сообщения. Body: name, email, message.

---

## Коды статусов
- 200 — Успех
- 201 — Создано
- 404 — Не найдено
- 422 — Ошибка валидации
