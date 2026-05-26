<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Auth\Events\Verified;
use Illuminate\Http\Request;

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

        return redirect(env('FRONTEND_URL', 'http://localhost:3000') . '/Login?verified=1');
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
}
