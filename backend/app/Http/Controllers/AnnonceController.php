<?php

namespace App\Http\Controllers;

use App\Models\Annonce;
use App\Models\Image;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class AnnonceController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $allowed = ['price', 'model_year', 'created_at'];
        $sortCol = in_array($request->input('sort'), $allowed) ? $request->input('sort') : 'created_at';
        $sortDir = $request->input('dir') === 'asc' ? 'asc' : 'desc';

        $query = Annonce::with(['images', 'user'])->orderBy($sortCol, $sortDir);

        $query->where('status', $request->input('status', 'approved'));

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('brand', 'like', "%{$search}%")
                  ->orWhere('model', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        if ($request->filled('brand')) {
            $query->where('brand', 'like', "%{$request->brand}%");
        }

        if ($request->filled('fuel_type')) {
            $query->where('fuel_type', $request->fuel_type);
        }

        if ($request->filled('transmission')) {
            $query->where('transmission', $request->transmission);
        }

        if ($request->filled('car_condition')) {
            $query->where('car_condition', $request->car_condition);
        }

        if ($request->filled('city')) {
            $query->where('city', $request->city);
        }

        if ($request->filled('min_price')) {
            $query->where('price', '>=', $request->min_price);
        }

        if ($request->filled('max_price')) {
            $query->where('price', '<=', $request->max_price);
        }

        if ($request->filled('min_year')) {
            $query->where('model_year', '>=', $request->min_year);
        }

        if ($request->filled('max_year')) {
            $query->where('model_year', '<=', $request->max_year);
        }

        $perPage = min((int) $request->input('per_page', 12), 50);
        return response()->json($query->paginate($perPage));
    }

    public function myAnnonces(Request $request)
    {
        $query = Annonce::with(['images'])
            ->where('user_id', auth()->id())
            ->latest();

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        return response()->json($query->paginate(10));
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'title'        => 'required',
            'description'  => 'required',
            'price'        => 'required|numeric',
            'brand'        => 'required',
            'model'        => 'required',
            'model_year'   => 'required|integer',
            'mileage'      => 'required|integer',
            'fuel_type'    => 'required',
            'transmission' => 'required',
            'car_condition'=> 'required',
            'city'         => 'nullable|string',
            'images'       => 'nullable|array|max:8',
            'images.*'     => 'image|max:10240',
        ]);

        $annonce = Annonce::create([
            'user_id'      => auth()->id(),
            'title'        => $request->title,
            'description'  => $request->description,
            'price'        => $request->price,
            'brand'        => $request->brand,
            'model'        => $request->model,
            'model_year'   => $request->model_year,
            'mileage'      => $request->mileage,
            'fuel_type'    => $request->fuel_type,
            'transmission' => $request->transmission,
            'fiscal_power' => $request->fiscal_power,
            'car_condition'=> $request->car_condition,
            'city'         => $request->city,
            'status'       => 'pending',
        ]);

        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $file) {
                $path = $file->store("annonces/{$annonce->id}", 'public');
                Image::create([
                    'annonce_id' => $annonce->id,
                    'url'        => Storage::disk('public')->url($path),
                ]);
            }
        }

        return response()->json([
            'message' => 'Annonce created successfully',
            'data'    => $annonce->load('images'),
        ]);
    }

    /**
     * Display the specified resource.
     */
    public function show(Annonce $annonce)
    {
        $annonce->load(['images', 'user', 'reviews']);

        return response()->json($annonce);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Annonce $annonce)
    {
        if ((int) $annonce->user_id !== (int) auth()->id()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'title'        => 'sometimes|string',
            'description'  => 'sometimes|string',
            'price'        => 'sometimes|numeric',
            'brand'        => 'sometimes|string',
            'model'        => 'sometimes|string',
            'model_year'   => 'sometimes|integer',
            'mileage'      => 'sometimes|integer',
            'fuel_type'    => 'sometimes|string',
            'transmission' => 'sometimes|string',
            'fiscal_power' => 'sometimes|string',
            'car_condition'=> 'sometimes|string',
        ]);

        $annonce->update($validated);

        return response()->json([
            'message' => 'Annonce updated',
            'data' => $annonce
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Annonce $annonce)
    {
        if ((int) $annonce->user_id !== (int) auth()->id()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $annonce->delete();

        return response()->json([
            'message' => 'Annonce deleted'
        ]);
    }

    public function markSold(Annonce $annonce)
    {
        if ((int) $annonce->user_id !== (int) auth()->id()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        if ($annonce->status !== 'approved') {
            return response()->json(['error' => 'Only approved annonces can be marked as sold'], 422);
        }

        $annonce->update(['status' => 'sold']);

        return response()->json(['message' => 'Annonce marked as sold', 'data' => $annonce]);
    }
}
