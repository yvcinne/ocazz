<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class PredictionController extends Controller
{
    public function predict(Request $request)
    {
        $request->validate([
            'etat'              => 'required|string',
            'boite-de-vitesses' => 'required|string',
            'type-de-carburant' => 'required|string',
            'marque'            => 'required|string',
            'modele'            => 'required|string',
            'origine'           => 'required|string',
            'kilometrage'       => 'required|integer|min:0',
            'annee'             => 'required|integer|min:1900|max:' . date('Y'),
            'puissance-fiscale' => 'required|integer|min:1',
        ]);

        $response = Http::post(
            env('PREDICTION_SERVICE_URL', 'http://127.0.0.1:5000') . '/predict',
            $request->only([
                'etat', 'boite-de-vitesses', 'type-de-carburant',
                'marque', 'modele', 'origine',
                'kilometrage', 'annee', 'puissance-fiscale',
            ])
        );

        if ($response->failed()) {
            return response()->json([
                'success' => false,
                'error'   => $response->json('error') ?? 'Le service de prédiction est indisponible.',
            ], 503);
        }

        return response()->json($response->json());
    }
}