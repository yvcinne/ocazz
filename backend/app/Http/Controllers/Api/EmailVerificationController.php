<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Auth\Events\Verified;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;

class EmailVerificationController extends Controller
{
    /**
     * GET /api/email/verify/{id}/{hash}
     * Accessed directly from the email link — no auth required, just a valid signed URL.
     * Marks the email as verified then redirects to the frontend login page.
     */
    public function verify(Request $request, string $id, string $hash)
    {
        $user = User::findOrFail($id);

        if (!hash_equals($hash, sha1($user->getEmailForVerification()))) {
            return redirect(env('FRONTEND_URL', 'http://localhost:3000') . '/Login?verified=invalid');
        }

        if ($user->hasVerifiedEmail()) {
            return redirect(env('FRONTEND_URL', 'http://localhost:3000') . '/Login?verified=already');
        }

        $user->markEmailAsVerified();
        event(new Verified($user));

        $token = $user->createToken('auth-token')->plainTextToken;
        return redirect(env('FRONTEND_URL', 'http://localhost:3000') . '/auth/callback?token=' . $token);
    }

    /**
     * POST /api/email/verification-notification
     * Resend the verification email. Requires the user to be authenticated.
     */
    public function resend(Request $request)
    {
        if ($request->user()->hasVerifiedEmail()) {
            return response()->json(['message' => 'Email déjà vérifié.'], 422);
        }

        $request->user()->sendEmailVerificationNotification();

        return response()->json(['message' => 'Email de vérification renvoyé.']);
    }

    /**
     * POST /api/email/resend
     * Public endpoint — resend verification by email address (for unverified users at login).
     */
    public function resendPublic(Request $request)
    {
        $request->validate(['email' => 'required|email']);

        $key = 'resend_verification:' . Str::lower($request->email);
        if (RateLimiter::tooManyAttempts($key, 3)) {
            return response()->json(['message' => 'Trop de tentatives. Réessayez dans une minute.'], 429);
        }
        RateLimiter::hit($key, 60);

        $user = User::where('email', $request->email)->first();
        if ($user && ! $user->hasVerifiedEmail()) {
            try { $user->sendEmailVerificationNotification(); } catch (\Exception) {}
        }

        return response()->json(['message' => 'Si ce compte existe, un email a été envoyé.']);
    }
}
