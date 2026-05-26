<?php

namespace App\Http\Controllers;

use App\Models\Annonce;
use App\Models\User;
use Illuminate\Http\Request;
use Storage;

class AdminController extends Controller
{
    public function dashboard()
    {
        return response()->json([
            'users' => User::count(),
            'annonces' => Annonce::count(),
            'pending_annonces' => Annonce::where('status', 'pending')->count(),
            'approved_annonces' => Annonce::where('status', 'approved')->count(),
        ]);
    }

    public function users()
    {
        return response()->json(User::latest()->paginate(10));
    }

    public function deleteUser($id)
    {
        $user = User::findOrFail($id);
        $user->delete();

        return response()->json([
            'message' => 'User deleted'
        ]);
    }


    public function annonce($id)
    {
        $annonce = Annonce::with([
            'user',
            'images',
            'reviews',
            'reviews.user'
        ])->findOrFail($id);

        return response()->json($annonce);
    }

    public function deleteAnnonce($id)
    {
        $annonce = Annonce::findOrFail($id);

        if ($annonce->image) {
            Storage::delete('public/' . $annonce->image);
        }

        $annonce->delete();

        return response()->json([
            'message' => 'Annonce deleted'
        ]);
    }
    public function annonces()
    {
        return response()->json(
            Annonce::with('user')->latest()->paginate(10)
        );
    }

    public function approveAnnonce($id)
    {
        $annonce = Annonce::findOrFail($id);

        $annonce->update([
            'status' => 'approved'
        ]);

        return response()->json([
            'message' => 'Annonce approved'
        ]);
    }

    public function rejectAnnonce($id)
    {
        $annonce = Annonce::findOrFail($id);

        $annonce->update([
            'status' => 'rejected'
        ]);

        return response()->json([
            'message' => 'Annonce rejected'
        ]);
    }
}
