<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    // Регистрация пользователя
    public function register(Request $request)
    {
        $request->validate([
            'name'     => 'required|string|max:255',
            'phone'    => 'required|string|unique:users',
            'password' => 'required|string|min:6',
        ]);

        $user = User::create([
            'name'     => $request->name,
            'phone'    => $request->phone,
            'password' => $request->password,
            'role'     => 'user',
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'user'  => $user,
            'token' => $token,
        ]);
    }

    // Вход
    public function login(Request $request)
    {
        // Проверка админа (захардкожено)
        if ($request->phone === 'admin' && $request->password === 'admin') {
    $admin = \App\Models\User::firstOrCreate(
        ['phone' => 'admin'],
        [
            'name' => 'Администратор',
            'password' => bcrypt('admin'),
            'role' => 'admin',
        ]
    );
    $token = $admin->createToken('auth_token')->plainTextToken;
    return response()->json([
        'user'  => $admin,
        'token' => $token,
    ]);
}

        $user = User::where('phone', $request->phone)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json(['message' => 'Неверный номер или пароль'], 401);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'user'  => $user,
            'token' => $token,
        ]);
    }

    // Выход
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Вышли успешно']);
    }

    // Текущий пользователь
    public function me(Request $request)
    {
        return response()->json($request->user());
    }
}