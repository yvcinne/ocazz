<?php

namespace App\Http\Controllers;

use App\Models\Favorite;
use Illuminate\Http\Request;

class FavoriteController extends Controller
{

    public function toggle($annonceId)
    {
        $favorite = Favorite::where('user_id', auth()->id())
            ->where('annonce_id', $annonceId)
            ->first();

        if ($favorite) {
            $favorite->delete();

            return response()->json([
                'message' => 'Removed from favorites'
            ]);
        }

        $favorite = Favorite::create([
            'user_id' => auth()->id(),
            'annonce_id' => $annonceId
        ]);

        return response()->json([
            'message' => 'Added to favorites',
            'data' => $favorite
        ]);
    }

    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $favorites = Favorite::with('annonce.images')
            ->where('user_id', auth()->id())
            ->get();

        return response()->json($favorites);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(Favorite $favorite)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Favorite $favorite)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Favorite $favorite)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Favorite $favorite)
    {
        $favorite = Favorite::where('user_id', auth()->id())
            ->where('annonce_id', $favorite->id)
            ->first();

        if (!$favorite) {
            return response()->json([
                'message' => 'Favorite not found'
            ], 404);
        }

        $favorite->delete();

        return response()->json([
            'message' => 'Favorite removed'
        ]);
    }
}
