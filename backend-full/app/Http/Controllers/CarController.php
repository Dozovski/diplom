<?php

namespace App\Http\Controllers;

use App\Models\Car;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class CarController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Car::query();

        if ($request->has('category') && $request->category !== 'Все') {
            $query->where('category', $request->category);
        }
        if ($request->has('available')) {
            $query->where('available', $request->boolean('available'));
        }
        if ($request->has('min_price')) {
            $query->where('price', '>=', (int) $request->min_price);
        }
        if ($request->has('max_price')) {
            $query->where('price', '<=', (int) $request->max_price);
        }

        return response()->json($query->orderBy('price')->get());
    }

    public function show(int $id): JsonResponse
    {
        return response()->json(Car::findOrFail($id));
    }

    // Admin only (enforced by middleware in routes)
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name'        => 'required|string|max:255',
            'category'    => 'required|in:Эконом,Комфорт,Бизнес,Премиум',
            'year'        => 'required|integer|min:2000|max:2030',
            'seats'       => 'required|integer|min:2|max:9',
            'transmission'=> 'required|in:Автомат,Механика',
            'fuel'        => 'required|in:Бензин,Дизель,Электро,Гибрид',
            'engine'      => 'required|string|max:100',
            'hp'          => 'required|integer|min:50|max:2000',
            'price'       => 'required|integer|min:1',
            'lat'         => 'required|numeric|between:-90,90',
            'lng'         => 'required|numeric|between:-180,180',
            'address'     => 'required|string|max:255',
            'description' => 'nullable|string|max:2000',
            'photos'      => 'nullable|array',
            'photos.*'    => 'nullable|string|max:500',
        ]);

        return response()->json(Car::create($validated), 201);
    }

    // Admin only (enforced by middleware in routes)
    public function update(Request $request, int $id): JsonResponse
    {
        $car = Car::findOrFail($id);

        // Use validated() instead of all() (BUG-008)
        $validated = $request->validate([
            'name'        => 'sometimes|string|max:255',
            'category'    => 'sometimes|in:Эконом,Комфорт,Бизнес,Премиум',
            'year'        => 'sometimes|integer|min:2000|max:2030',
            'seats'       => 'sometimes|integer|min:2|max:9',
            'transmission'=> 'sometimes|in:Автомат,Механика',
            'fuel'        => 'sometimes|in:Бензин,Дизель,Электро,Гибрид',
            'engine'      => 'sometimes|string|max:100',
            'hp'          => 'sometimes|integer|min:50|max:2000',
            'price'       => 'sometimes|integer|min:1',
            'lat'         => 'sometimes|numeric|between:-90,90',
            'lng'         => 'sometimes|numeric|between:-180,180',
            'address'     => 'sometimes|string|max:255',
            'description' => 'nullable|string|max:2000',
            'photos'      => 'nullable|array',
            'photos.*'    => 'nullable|string|max:500',
            'available'   => 'sometimes|boolean',
        ]);

        $car->update($validated);
        return response()->json($car);
    }

    // Admin only (enforced by middleware in routes)
    public function updateAvailability(Request $request, int $id): JsonResponse
    {
        $car = Car::findOrFail($id);
        $car->update(['available' => $request->boolean('available')]);
        return response()->json($car);
    }

    // Admin only (enforced by middleware in routes)
    public function destroy(int $id): JsonResponse
    {
        Car::findOrFail($id)->delete();
        return response()->json(['message' => 'Автомобиль удалён']);
    }
}
