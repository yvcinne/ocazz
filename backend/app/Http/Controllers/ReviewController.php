<?php

namespace App\Http\Controllers;

use App\Models\Review;
use Illuminate\Http\Request;

class ReviewController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index($annonceId)
    {
    $reviews = Review::with('user')
            ->where('annonce_id', $annonceId)
            ->latest()
            ->get();

        return response()->json($reviews);
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
        $request->validate([
            'annonce_id' => 'required|exists:annonces,id',
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'nullable|string',
        ]);

        // éviter doublon review
        $existing = Review::where('user_id', auth()->id())
            ->where('annonce_id', $request->annonce_id)
            ->first();

        if ($existing) {
            return response()->json([
                'message' => 'You already reviewed this annonce'
            ], 400);
        }

        $review = Review::create([
            'user_id' => auth()->id(),
            'annonce_id' => $request->annonce_id,
            'rating' => $request->rating,
            'comment' => $request->comment,
        ]);

        return response()->json([
            'message' => 'Review added successfully',
            'data' => $review
        ]);
    }

    /**
     * Display the specified resource.
     */
    public function show(Review $review)
    {
        $review = Review::with(['user', 'annonce'])
            ->findOrFail($review);

        return response()->json($review);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Review $review)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Review $review)
    {
        $review = Review::findOrFail($review);

        if ($review->user_id !== auth()->id()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $request->validate([
            'rating' => 'integer|min:1|max:5',
            'comment' => 'nullable|string',
        ]);

        $review->update($request->all());

        return response()->json([
            'message' => 'Review updated',
            'data' => $review
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Review $review)
    {
        $review = Review::findOrFail($review);

        if ($review->user_id !== auth()->id()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $review->delete();

        return response()->json([
            'message' => 'Review deleted'
        ]);
    }
}
