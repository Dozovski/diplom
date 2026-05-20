const API = 'http://127.0.0.1:8000/api';

async function apiRequest(method, path, body, token) {
  const res = await fetch(`${API}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => null);
  return { status: res.status, data };
}

async function createUser(request, suffix = '') {
  const rand = Math.floor(Math.random() * 9000000) + 1000000;
  const phone = `+375${rand}${suffix}`.slice(0, 20);
  const res = await request.post(`${API}/register`, {
    data: { name: 'Test User', phone, password: 'password123' },
  });
  return { status: res.status(), data: await res.json(), phone, password: 'password123' };
}

async function loginAs(request, phone, password) {
  const res = await request.post(`${API}/login`, {
    data: { phone, password },
  });
  const data = await res.json();
  return { token: data.token, user: data.user, status: res.status() };
}

async function loginAdmin(request) {
  return loginAs(request, 'admin', 'admin');
}

async function createCar(request, token, overrides = {}) {
  const car = {
    name: 'Toyota Camry Test',
    category: 'Комфорт',
    year: 2023,
    seats: 5,
    transmission: 'Автомат',
    fuel: 'Бензин',
    engine: '2.5L',
    hp: 181,
    price: 100,
    lat: 53.9045,
    lng: 27.5615,
    address: 'Минск, пр. Победителей 1',
    description: 'Тестовый автомобиль',
    photos: [],
    ...overrides,
  };
  const res = await request.post(`${API}/cars`, {
    data: car,
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
  });
  return { status: res.status(), data: await res.json() };
}

module.exports = { apiRequest, createUser, loginAs, loginAdmin, createCar, API };
