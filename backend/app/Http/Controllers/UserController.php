<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class UserController extends Controller
{
    public function show(Request $request)
    {
        return response()->json($request->user());
    }

    public function update(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'name'             => 'sometimes|string|max:255',
            'last_name'        => 'sometimes|nullable|string|max:255',
            'phone'            => 'sometimes|nullable|string|max:20',
            'email'            => ['sometimes', 'email', Rule::unique('users')->ignore($user->id)],
            'password'         => 'sometimes|string|min:8|confirmed',
            'current_password' => 'required_with:password|current_password',
        ]);

        if (isset($validated['password'])) {
            unset($validated['current_password']);
        } else {
            unset($validated['current_password']);
        }

        $user->update($validated);

        return response()->json(['message' => 'Profile updated', 'data' => $user]);
    }

    public function destroy(Request $request)
    {
        $request->validate([
            'password' => 'required|current_password',
        ]);

        $user = $request->user();
        $user->tokens()->delete();
        $user->delete();

        return response()->json(['message' => 'Account deleted']);
    }
}
