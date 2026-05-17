<?php
namespace App\Http\Controllers;

use App\Models\Booking;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class BookingController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Booking::with('car')->orderBy('created_at', 'desc');
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }
        return response()->json($query->get());
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'car_id'=>'required|exists:cars,id',
            'name'=>'required|string|max:255',
            'phone'=>'required|string|max:20',
            'email'=>'nullable|email|sometimes',
            'date_from'=>'required|date|after_or_equal:today',
            'date_to'=>'required|date|after:date_from',
            'comment'=>'nullable|string|max:500',
        ]);
        $validated['status'] = 'pending';
        $booking = Booking::create($validated);
        $booking->load('car');
        return response()->json($booking, 201);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $validated = $request->validate([
            'status'=>'required|in:pending,approved,rejected',
        ]);
        $booking = Booking::findOrFail($id);
        $booking->update($validated);
        if ($validated['status'] === 'approved') {
            $booking->car()->update(['available' => false]);
        }
        if ($validated['status'] === 'rejected') {
            $booking->car()->update(['available' => true]);
        }
        return response()->json($booking->load('car'));
    }
    public function myBookings(Request $request): JsonResponse
{
    $bookings = Booking::with('car')
        ->where('phone', $request->user()->phone)
        ->orderBy('created_at', 'desc')
        ->get();
    return response()->json($bookings);
}
}
