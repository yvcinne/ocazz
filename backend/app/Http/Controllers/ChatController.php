<?php

namespace App\Http\Controllers;

use App\Models\Annonce;
use App\Models\ChatbotSession;
use GuzzleHttp\Client;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class ChatController extends Controller
{
    private const BASE_SYSTEM = "Tu es l'assistant virtuel d'ocazz.ma, la plateforme marocaine de référence pour l'achat et la vente de voitures d'occasion. Tu réponds en français (ou en darija si l'utilisateur écrit en darija) et tu aides les utilisateurs à :
- Trouver des voitures selon leur budget, besoins ou préférences
- Comprendre les étapes d'achat et de vente sur ocazz.ma
- Obtenir des conseils sur l'évaluation d'un véhicule d'occasion
- Connaître les démarches administratives (carte grise, assurance, contrôle technique) au Maroc
- Naviguer sur le site (publier une annonce, contacter un vendeur, utiliser l'estimation de prix IA)

Sois concis, utile et amical. Si une question sort de ce périmètre, réponds poliment que tu es spécialisé dans l'automobile et la plateforme ocazz.ma.";

    private function getOrCreateSession(string $sessionId, ?int $userId): ChatbotSession
    {
        $session = ChatbotSession::firstOrCreate(
            ['session_id' => $sessionId],
            ['user_id' => $userId, 'messages' => []]
        );

        // Attach user_id if user just logged in and session was anonymous
        if (!$session->user_id && $userId) {
            $session->user_id = $userId;
            $session->save();
        }

        return $session;
    }

    private function buildDbContext(): string
    {
        $annonces = Annonce::where('status', 'approved')
            ->orderByDesc('created_at')
            ->limit(30)
            ->get(['brand', 'model', 'model_year', 'price', 'city', 'fuel_type', 'transmission', 'mileage', 'car_condition']);

        if ($annonces->isEmpty()) return '';

        $lines = $annonces->map(fn($a) =>
            "- {$a->brand} {$a->model} {$a->model_year} | {$a->fuel_type} | {$a->transmission} | {$a->mileage} km | " . number_format($a->price, 0, '.', ' ') . " DH | {$a->city} | {$a->car_condition}"
        )->join("\n");

        return "\n\nVoici les annonces disponibles sur ocazz.ma en ce moment :\n{$lines}";
    }

    private function buildSystemPrompt(ChatbotSession $session): string
    {
        $system = self::BASE_SYSTEM . $this->buildDbContext();

        if (!$session->lead_captured) {
            $system .= "\n\nImportant : si l'utilisateur montre un intérêt concret pour acheter une voiture (demande d'infos sur un modèle précis, envie de contacter un vendeur, question sur une visite ou un essai), propose-lui poliment de laisser son prénom et son numéro de téléphone pour qu'un conseiller le rappelle. Dans ce cas uniquement, termine ton message par exactement le marqueur : [FORM:contact]";
        }

        return $system;
    }

    private function buildContents(ChatbotSession $session, string $newMessage): array
    {
        $contents = [];
        foreach ($session->messages ?? [] as $msg) {
            $contents[] = ['role' => $msg['role'], 'parts' => [['text' => $msg['text']]]];
        }
        $contents[] = ['role' => 'user', 'parts' => [['text' => $newMessage]]];
        return $contents;
    }

    private function extractFullReply(string $sseBuffer): string
    {
        $reply = '';
        foreach (explode("\n", $sseBuffer) as $line) {
            if (!str_starts_with($line, 'data: ')) continue;
            $raw = trim(substr($line, 6));
            if (!$raw || $raw === '[DONE]') continue;
            try {
                $data = json_decode($raw, true);
                $text = $data['candidates'][0]['content']['parts'][0]['text'] ?? '';
                if ($text) $reply .= $text;
            } catch (\Throwable $e) {
            }
        }
        return $reply;
    }

    public function chat(Request $request)
    {
        $request->validate([
            'message'    => 'required|string|max:1000',
            'session_id' => 'required|string|max:64',
        ]);

        $userId  = auth('sanctum')->id();
        $session = $this->getOrCreateSession($request->session_id, $userId);
        $system  = $this->buildSystemPrompt($session);
        $contents = $this->buildContents($session, $request->message);

        $apiKey = config('services.gemini.key');
        if (!$apiKey) return response()->json(['error' => 'Chatbot non configuré.'], 503);

        $res = Http::timeout(20)->post(
            "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent?key={$apiKey}",
            [
                'systemInstruction' => ['parts' => [['text' => $system]]],
                'contents'          => $contents,
                'generationConfig'  => ['temperature' => 0.7, 'maxOutputTokens' => 600],
            ]
        );

        if (!$res->successful()) return response()->json(['error' => 'Erreur du service IA.'], 502);

        $reply   = trim($res->json('candidates.0.content.parts.0.text') ?? "Désolé, réessayez dans un instant.");
        $askLead = str_contains($reply, '[FORM:contact]');
        $reply   = trim(str_replace('[FORM:contact]', '', $reply));

        $session->appendMessage('user', $request->message);
        $session->appendMessage('model', $reply);

        return response()->json(['reply' => $reply, 'ask_lead' => $askLead]);
    }

    public function stream(Request $request)
    {
        $request->validate([
            'message'    => 'required|string|max:1000',
            'session_id' => 'required|string|max:64',
        ]);

        $userId  = auth('sanctum')->id();
        $session = $this->getOrCreateSession($request->session_id, $userId);
        $system  = $this->buildSystemPrompt($session);
        $contents = $this->buildContents($session, $request->message);

        $apiKey = config('services.gemini.key');
        if (!$apiKey) return response()->json(['error' => 'Chatbot non configuré.'], 503);

        // Save user message before streaming starts
        $session->appendMessage('user', $request->message);
        $sessionId = $session->id;

        $payload = [
            'systemInstruction' => ['parts' => [['text' => $system]]],
            'contents'          => $contents,
            'generationConfig'  => ['temperature' => 0.7, 'maxOutputTokens' => 600],
        ];

        $url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:streamGenerateContent?alt=sse&key={$apiKey}";

        return response()->stream(function () use ($url, $payload, $sessionId) {
            $client = new Client();
            $res    = $client->post($url, [
                'json'    => $payload,
                'stream'  => true,
                'timeout' => 30,
            ]);

            $body      = $res->getBody();
            $sseBuffer = '';

            while (!$body->eof()) {
                $chunk = $body->read(4096);
                if ($chunk !== '') {
                    echo $chunk;
                    ob_flush();
                    flush();
                    $sseBuffer .= $chunk;
                }
            }

            $fullReply = $this->extractFullReply($sseBuffer);
            $askLead   = str_contains($fullReply, '[FORM:contact]');
            $cleanReply = trim(str_replace('[FORM:contact]', '', $fullReply));

            if ($askLead) {
                echo "data: {\"type\":\"ask_lead\"}\n\n";
                ob_flush();
                flush();
            }

            // Save bot reply after stream completes
            $dbSession = ChatbotSession::find($sessionId);
            if ($dbSession) {
                $dbSession->appendMessage('model', $cleanReply ?: 'Désolé, réessayez dans un instant.');
            }
        }, 200, [
            'Content-Type'      => 'text/event-stream',
            'Cache-Control'     => 'no-cache',
            'X-Accel-Buffering' => 'no',
            'Connection'        => 'keep-alive',
        ]);
    }

    public function saveLead(Request $request)
    {
        $request->validate([
            'session_id' => 'required|string|max:64',
            'name'       => 'required|string|max:100',
            'phone'      => 'required|string|max:20',
        ]);

        $session = ChatbotSession::where('session_id', $request->session_id)->first();
        if (!$session) return response()->json(['error' => 'Session introuvable.'], 404);

        $session->name           = $request->name;
        $session->phone          = $request->phone;
        $session->lead_captured  = true;
        $session->save();

        return response()->json(['ok' => true]);
    }
}
