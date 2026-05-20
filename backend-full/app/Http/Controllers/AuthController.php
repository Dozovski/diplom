<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function register(Request $request): JsonResponse
    {
        $request->validate([
            'name'     => 'required|string|max:255',
            'phone'    => 'required|string|max:20|unique:users',
            'password' => 'required|string|min:6',
        ]);

        $user = User::create([
            'name'     => $request->name,
            'phone'    => $request->phone,
            'password' => $request->password,
            'role'     => 'user',
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json(['user' => $user, 'token' => $token]);
    }

    public function login(Request $request): JsonResponse
    {
        $adminPhone = env('ADMIN_PHONE', 'admin');
        $adminPassword = env('ADMIN_PASSWORD', 'admin');

        // Admin shortcut — credentials from .env (BUG-006)
        if ($request->phone === $adminPhone && $request->password === $adminPassword) {
            $admin = User::firstOrCreate(
                ['phone' => $adminPhone],
                [
                    'name'     => 'Администратор',
                    'password' => bcrypt($adminPassword),
                    'role'     => 'admin',
                ]
            );
            $token = $admin->createToken('auth_token')->plainTextToken;
            return response()->json(['user' => $admin, 'token' => $token]);
        }

        $user = User::where('phone', $request->phone)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json(['message' => 'Неверный номер или пароль'], 401);
        }

        // BUG-014: cap active tokens per user at 10 to prevent accumulation
        $tokenCount = $user->tokens()->count();
        if ($tokenCount >= 10) {
            $user->tokens()->oldest()->limit($tokenCount - 9)->delete();
        }
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json(['user' => $user, 'token' => $token]);
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Вышли успешно']);
    }

    public function me(Request $request): JsonResponse
    {
        return response()->json($request->user());
    }
}
