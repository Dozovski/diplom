<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\CarController;
use App\Http\Controllers\BookingController;
use App\Http\Controllers\ReviewController;
use App\Http\Controllers\ContactController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ProfileController;

// Публичные маршруты (throttle управляется глобально через throttle:api)
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::get('/cars', [CarController::class, 'index']);
Route::get('/cars/{id}', [CarController::class, 'show'])->whereNumber('id');
Route::get('/reviews', [ReviewController::class, 'index']);

// Только для авторизованных пользователей
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);

    Route::post('/bookings', [BookingController::class, 'store']);
    Route::get('/my-bookings', [BookingController::class, 'myBookings']);

    Route::post('/contact', [ContactController::class, 'store']);
    Route::post('/reviews', [ReviewController::class, 'store']);

    Route::get('/profile', [ProfileController::class, 'show']);
    Route::put('/profile', [ProfileController::class, 'update']);
});

// Только для администратора (BUG-001..004)
Route::middleware(['auth:sanctum', 'admin'])->group(function () {
    Route::get('/bookings', [BookingController::class, 'index']);
    Route::patch('/bookings/{id}', [BookingController::class, 'update'])->whereNumber('id');

    Route::post('/cars', [CarController::class, 'store']);
    Route::put('/cars/{id}', [CarController::class, 'update'])->whereNumber('id');
    Route::patch('/cars/{id}/availability', [CarController::class, 'updateAvailability'])->whereNumber('id');
    Route::delete('/cars/{id}', [CarController::class, 'destroy'])->whereNumber('id');
});
