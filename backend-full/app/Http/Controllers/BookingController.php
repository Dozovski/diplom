<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class BookingController extends Controller
{
    // Admin only (enforced by middleware in routes)
    public function index(Request $request): JsonResponse
    {
        $query = Booking::with('car', 'user')->orderBy('created_at', 'desc');
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }
        return response()->json($query->get());
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'car_id'    => 'required|exists:cars,id',
            'name'      => 'required|string|max:255',
            'phone'     => 'required|string|max:20',
            'email'     => 'nullable|email|sometimes',
            'date_from' => 'required|date|after_or_equal:today',
            'date_to'   => 'required|date|after:date_from',
            'comment'   => 'nullable|string|max:500',
        ]);

        // Check for overlapping bookings (BUG-007)
        $overlap = Booking::where('car_id', $validated['car_id'])
            ->where('status', '!=', 'rejected')
            ->where(function ($q) use ($validated) {
                $q->whereBetween('date_from', [$validated['date_from'], $validated['date_to']])
                  ->orWhereBetween('date_to', [$validated['date_from'], $validated['date_to']])
                  ->orWhere(function ($q2) use ($validated) {
                      $q2->where('date_from', '<=', $validated['date_from'])
                         ->where('date_to', '>=', $validated['date_to']);
                  });
            })->exists();

        if ($overlap) {
            return response()->json(
                ['message' => 'Автомобиль уже забронирован на эти даты'],
                422
            );
        }

        $validated['status'] = 'pending';
        $validated['user_id'] = $request->user()->id;

        $booking = Booking::create($validated);
        $booking->load('car');

        return response()->json($booking, 201);
    }

    // Admin only (enforced by middleware in routes)
    public function update(Request $request, int $id): JsonResponse
    {
        $validated = $request->validate([
            'status' => 'required|in:pending,approved,rejected',
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

    // Filter by user_id, not phone (BUG-012)
    public function myBookings(Request $request): JsonResponse
    {
        $bookings = Booking::with('car')
            ->where('user_id', $request->user()->id)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($bookings);
    }
}
