<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;
use Laravel\Socialite\Facades\Socialite;

class SocialAuthController extends Controller
{
    public function redirectToGoogle(Request $request)
    {
        $intentKey = Str::random(16);
        Cache::put("google_intent_{$intentKey}", $request->get('intent', 'login'), now()->addMinutes(5));

        return Socialite::driver('google')->stateless()->with(['state' => $intentKey])->redirect();
    }

    public function handleGoogleCallback(Request $request)
    {
        $googleUser  = Socialite::driver('google')->stateless()->user();
        $frontendUrl = rtrim(env('FRONTEND_URL', 'http://localhost:3000'), '/');

        $intentKey = $request->get('state');
        $intent    = Cache::pull("google_intent_{$intentKey}") ?? 'login';

        $existingByGoogleId = User::where('google_id', $googleUser->getId())->first();
        $existingByEmail    = User::where('email', $googleUser->getEmail())->first();

        // Register intent — block if any account already exists with this Google account
        if ($intent === 'register') {
            if ($existingByGoogleId || $existingByEmail) {
                return redirect("{$frontendUrl}/Register?error=account_exists");
            }
        }

        // Already has a Google account — log in directly
        if ($existingByGoogleId) {
            $token = $existingByGoogleId->createToken('auth-token')->plainTextToken;
            return redirect("{$frontendUrl}/auth/callback?token={$token}");
        }

        // Email exists but registered with a password — block
        if ($existingByEmail) {
            return redirect("{$frontendUrl}/Login?error=email_exists");
        }

        // New user — store Google data in cache for 10 minutes, redirect to profile-completion form
        $regToken = Str::uuid()->toString();
        $nameParts = explode(' ', $googleUser->getName(), 2);

        Cache::put("google_reg_{$regToken}", [
            'google_id' => $googleUser->getId(),
            'email'     => $googleUser->getEmail(),
            'name'      => $nameParts[0],
            'last_name' => $nameParts[1] ?? '',
        ], now()->addMinutes(10));

        $query = http_build_query([
            'reg'       => $regToken,
            'name'      => $nameParts[0],
            'last_name' => $nameParts[1] ?? '',
            'email'     => $googleUser->getEmail(),
        ]);

        return redirect("{$frontendUrl}/auth/complete?{$query}");
    }

    public function completeRegistration(Request $request)
    {
        $data = $request->validate([
            'reg_token' => 'required|string',
            'name'      => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'phone'     => 'nullable|string|max:20',
        ]);

        $cached = Cache::pull("google_reg_{$data['reg_token']}");

        if (!$cached) {
            return response()->json(['message' => 'Lien expiré ou invalide. Veuillez recommencer la connexion Google.'], 422);
        }

        if (User::where('email', $cached['email'])->exists()) {
            return response()->json(['message' => 'Un compte avec cet email existe déjà.'], 422);
        }

        $user = User::create([
            'name'              => $data['name'],
            'last_name'         => $data['last_name'] ?? null,
            'phone'             => $data['phone'] ?? null,
            'email'             => $cached['email'],
            'google_id'         => $cached['google_id'],
            'email_verified_at' => now(),
        ]);

        $token = $user->createToken('auth-token')->plainTextToken;

        return response()->json(['token' => $token, 'user' => $user], 201);
    }
}
