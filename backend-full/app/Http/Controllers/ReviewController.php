<?php
namespace App\Http\Controllers;

use App\Models\Review;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class ReviewController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(Review::orderBy('created_at', 'desc')->get());
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'text'   => 'required|string|max:500',
            'rating' => 'required|integer|min:1|max:5',
        ]);

        $review = Review::create([
            'name'   => $request->user()->name,
            'text'   => $request->text,
            'rating' => $request->rating,
        ]);

        return response()->json($review, 201);
    }
}