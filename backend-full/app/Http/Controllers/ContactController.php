<?php
namespace App\Http\Controllers;

use App\Models\ContactMessage;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class ContactController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name'=>'required|string|max:255',
            'email'=>'required|email',
            'message'=>'required|string|max:2000',
        ]);
        $msg = ContactMessage::create($validated);
        return response()->json(['message'=>'Сообщение отправлено','data'=>$msg], 201);
    }
}
