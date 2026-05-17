<?php
namespace App\Http\Controllers;

use App\Models\Review;
use Illuminate\Http\JsonResponse;

class ReviewController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(Review::orderBy('created_at','desc')->get());
    }
}
