<?php

namespace Database\Seeders;

use App\Models\Car;
use App\Models\User;
use App\Models\Review;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Admin user (credentials from .env — BUG-006)
        User::firstOrCreate(
            ['phone' => env('ADMIN_PHONE', 'admin')],
            [
                'name'     => 'Администратор',
                'password' => Hash::make(env('ADMIN_PASSWORD', 'admin')),
                'role'     => 'admin',
            ]
        );

        // Demo regular user
        User::firstOrCreate(
            ['phone' => '+375291234567'],
            [
                'name'       => 'Иван Иванов',
                'password'   => Hash::make('password123'),
                'role'       => 'user',
                'birth_date' => '1990-05-15',
                'passport'   => 'AB1234567',
            ]
        );

        // Sample cars
        $cars = [
            [
                'name' => 'Toyota Camry',
                'category' => 'Комфорт',
                'year' => 2023,
                'seats' => 5,
                'transmission' => 'Автомат',
                'fuel' => 'Бензин',
                'engine' => '2.5L',
                'hp' => 181,
                'price' => 120,
                'lat' => 53.9045,
                'lng' => 27.5615,
                'address' => 'Минск, пр. Победителей 1',
                'available' => true,
                'description' => 'Комфортный седан для городских поездок',
                'photos' => [],
            ],
            [
                'name' => 'Volkswagen Polo',
                'category' => 'Эконом',
                'year' => 2022,
                'seats' => 5,
                'transmission' => 'Механика',
                'fuel' => 'Бензин',
                'engine' => '1.6L',
                'hp' => 110,
                'price' => 60,
                'lat' => 53.8940,
                'lng' => 27.5490,
                'address' => 'Минск, ул. Немига 3',
                'available' => true,
                'description' => 'Экономичный автомобиль для города',
                'photos' => [],
            ],
            [
                'name' => 'BMW 5 Series',
                'category' => 'Бизнес',
                'year' => 2023,
                'seats' => 5,
                'transmission' => 'Автомат',
                'fuel' => 'Бензин',
                'engine' => '3.0L',
                'hp' => 286,
                'price' => 250,
                'lat' => 53.9120,
                'lng' => 27.5800,
                'address' => 'Минск, пр. Независимости 58',
                'available' => true,
                'description' => 'Представительский автомобиль бизнес-класса',
                'photos' => [],
            ],
            [
                'name' => 'Mercedes-Benz S-Class',
                'category' => 'Премиум',
                'year' => 2024,
                'seats' => 5,
                'transmission' => 'Автомат',
                'fuel' => 'Гибрид',
                'engine' => '3.0L',
                'hp' => 362,
                'price' => 450,
                'lat' => 53.9200,
                'lng' => 27.5700,
                'address' => 'Минск, ул. Ленина 1',
                'available' => true,
                'description' => 'Флагманский автомобиль премиум-класса',
                'photos' => [],
            ],
        ];

        foreach ($cars as $car) {
            Car::firstOrCreate(['name' => $car['name']], $car);
        }

        // Sample reviews
        $reviews = [
            ['name' => 'Алексей К.', 'text' => 'Отличный сервис! Машина была в идеальном состоянии.', 'rating' => 5],
            ['name' => 'Мария П.', 'text' => 'Удобное бронирование, быстрое оформление. Рекомендую!', 'rating' => 5],
            ['name' => 'Дмитрий С.', 'text' => 'Хорошее соотношение цена/качество.', 'rating' => 4],
        ];

        foreach ($reviews as $review) {
            Review::firstOrCreate(['name' => $review['name']], $review);
        }
    }
}
