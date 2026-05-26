<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Http;
use GuzzleHttp\Client;

class ChatController extends Controller
{
    private const SYSTEM = "Tu es l'assistant virtuel d'ocazz.ma, la plateforme marocaine de référence pour l'achat et la vente de voitures d'occasion. Tu réponds en français (ou en darija si l'utilisateur écrit en darija) et tu aides les utilisateurs à :
- Trouver des voitures selon leur budget, besoins ou préférences
- Comprendre les étapes d'achat et de vente sur ocazz.ma
- Obtenir des conseils sur l'évaluation d'un véhicule d'occasion
- Connaître les démarches administratives (carte grise, assurance, contrôle technique) au Maroc
- Naviguer sur le site (publier une annonce, contacter un vendeur, utiliser l'estimation de prix IA)

Sois concis, utile et amical. Si une question sort de ce périmètre, réponds poliment que tu es spécialisé dans l'automobile et la plateforme ocazz.ma.";

    private function validated(Request $request): array
    {
        $request->validate([
            'message'        => 'required|string|max:1000',
            'history'        => 'array|max:20',
            'history.*.role' => 'required|string|in:user,model',
            'history.*.text' => 'required|string|max:2000',
        ]);

        $contents = [];
        foreach ($request->input('history', []) as $entry) {
            $contents[] = ['role' => $entry['role'], 'parts' => [['text' => $entry['text']]]];
        }
        $contents[] = ['role' => 'user', 'parts' => [['text' => $request->message]]];

        return $contents;
    }

    public function chat(Request $request)
    {
        $contents = $this->validated($request);
        $apiKey   = config('services.gemini.key');
        if (!$apiKey) return response()->json(['error' => 'Chatbot non configuré.'], 503);

        $res = Http::timeout(20)->post(
            "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent?key={$apiKey}",
            [
                'systemInstruction' => ['parts' => [['text' => self::SYSTEM]]],
                'contents'          => $contents,
                'generationConfig'  => ['temperature' => 0.7, 'maxOutputTokens' => 600],
            ]
        );

        if (!$res->successful()) return response()->json(['error' => 'Erreur du service IA.'], 502);

        return response()->json([
            'reply' => trim($res->json('candidates.0.content.parts.0.text') ?? "Désolé, réessayez dans un instant."),
        ]);
    }

    public function stream(Request $request)
    {
        $contents = $this->validated($request);
        $apiKey   = config('services.gemini.key');
        if (!$apiKey) {
            return response()->json(['error' => 'Chatbot non configuré.'], 503);
        }

        $payload = [
            'systemInstruction' => ['parts' => [['text' => self::SYSTEM]]],
            'contents'          => $contents,
            'generationConfig'  => ['temperature' => 0.7, 'maxOutputTokens' => 600],
        ];

        $url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:streamGenerateContent?alt=sse&key={$apiKey}";

        return response()->stream(function () use ($url, $payload) {
            $client = new Client();
            $res    = $client->post($url, [
                'json'    => $payload,
                'stream'  => true,
                'timeout' => 30,
            ]);

            $body = $res->getBody();
            while (!$body->eof()) {
                $chunk = $body->read(4096);
                if ($chunk !== '') {
                    echo $chunk;
                    ob_flush();
                    flush();
                }
            }
        }, 200, [
            'Content-Type'      => 'text/event-stream',
            'Cache-Control'     => 'no-cache',
            'X-Accel-Buffering' => 'no',
            'Connection'        => 'keep-alive',
        ]);
    }
}
