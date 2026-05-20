<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class ProfileController extends Controller
{
    public function show(Request $request): JsonResponse
    {
        return response()->json($request->user());
    }

    public function update(Request $request): JsonResponse
    {
        $request->validate([
            'name'       => 'sometimes|required|string|min:2|max:255',
            'email'      => 'nullable|email|max:255',
            'birth_date' => 'nullable|date|before:today',
            'passport'   => 'nullable|string|max:50',
        ]);

        $request->user()->update($request->only([
            'name', 'email', 'birth_date', 'passport',
        ]));

        return response()->json($request->user()->fresh());
    }
}
