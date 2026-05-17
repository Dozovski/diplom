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
            $query->where('price', '>=', $request->min_price);
        }
        if ($request->has('max_price')) {
            $query->where('price', '<=', $request->max_price);
        }
        return response()->json($query->orderBy('price')->get());
    }

    public function show(int $id): JsonResponse
    {
        return response()->json(Car::findOrFail($id));
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name'=>'required|string|max:255',
            'category'=>'required|in:Эконом,Комфорт,Бизнес,Премиум',
            'year'=>'required|integer|min:2015|max:2026',
            'seats'=>'required|integer|min:2|max:9',
            'transmission'=>'required|in:Автомат,Механика',
            'fuel'=>'required|in:Бензин,Дизель,Электро,Гибрид',
            'engine'=>'required|string',
            'hp'=>'required|integer',
            'price'=>'required|integer|min:1',
            'lat'=>'required|numeric',
            'lng'=>'required|numeric',
            'address'=>'required|string',
            'description'=>'nullable|string',
            'photos'=>'nullable|array',
        ]);
        return response()->json(Car::create($validated), 201);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $car = Car::findOrFail($id);
        $car->update($request->all());
        return response()->json($car);
    }

    public function destroy(int $id): JsonResponse
    {
        Car::findOrFail($id)->delete();
        return response()->json(['message' => 'Автомобиль удалён']);
    }
}
