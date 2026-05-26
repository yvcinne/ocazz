<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Laravel\Socialite\Facades\Socialite;

class SocialAuthController extends Controller
{
    public function redirectToGoogle()
    {
        return Socialite::driver('google')->stateless()->redirect();
    }

    public function handleGoogleCallback()
    {
        $googleUser = Socialite::driver('google')->stateless()->user();

        $user = User::where('google_id', $googleUser->getId())
            ->orWhere('email', $googleUser->getEmail())
            ->first();

        if ($user) {
            if (!$user->google_id) {
                $user->update(['google_id' => $googleUser->getId()]);
            }
        } else {
            $nameParts = explode(' ', $googleUser->getName(), 2);
            $user = User::create([
                'name'              => $nameParts[0],
                'last_name'         => $nameParts[1] ?? null,
                'email'             => $googleUser->getEmail(),
                'google_id'         => $googleUser->getId(),
                'email_verified_at' => now(),
            ]);
        }

        $token = $user->createToken('auth-token')->plainTextToken;
        $frontendUrl = rtrim(env('FRONTEND_URL', 'http://localhost:3000'), '/');

        return redirect("{$frontendUrl}/auth/callback?token={$token}");
    }
}
