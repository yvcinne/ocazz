<?php

namespace App\Http\Controllers;

use App\Http\Requests\InitiateConversationRequest;
use App\Http\Resources\ConversationResource;
use App\Http\Resources\MessageResource;
use App\Models\Annonce;
use App\Models\Conversation;

class ConversationController extends Controller
{
    /**
     * GET /conversations
     * Inbox : toutes les conversations de l'utilisateur, triées par activité récente.
     */
    public function index()
    {
        $userId = auth()->id();

        $conversations = Conversation::with(['annonce', 'buyer', 'seller', 'latestMessage'])
            ->where('buyer_id', $userId)
            ->orWhere('seller_id', $userId)
            ->orderByDesc('last_message_at')
            ->paginate(20);

        return ConversationResource::collection($conversations);
    }

    /**
     * POST /conversations
     * Initie une conversation ou retourne l'existante (idempotent).
     * La contrainte UNIQUE(annonce_id, buyer_id) garantit l'unicité en DB.
     */
    public function store(InitiateConversationRequest $request)
    {
        $annonce = Annonce::findOrFail($request->annonce_id);

        $conversation = Conversation::firstOrCreate(
            [
                'annonce_id' => $annonce->id,
                'buyer_id'   => auth()->id(),
            ],
            [
                'seller_id' => $annonce->user_id,
            ]
        );

        return new ConversationResource(
            $conversation->load(['annonce', 'buyer', 'seller', 'latestMessage'])
        );
    }

    /**
     * GET /conversations/{conversation}
     * Charge la conversation + l'historique des messages paginé.
     * Marque automatiquement les messages reçus comme lus à l'ouverture.
     */
    public function show(Conversation $conversation)
    {
        $this->authorize('view', $conversation);

        $userId = auth()->id();

        // Auto-mark as read à l'ouverture (UX standard : ouvrir = lire)
        $updated = $conversation->messages()
            ->where('sender_id', '!=', $userId)
            ->whereNull('read_at')
            ->update(['read_at' => now()]);

        if ($updated > 0) {
            $conversation->update([$conversation->getUnreadFieldFor($userId) => 0]);
        }

        $messages = $conversation->messages()
            ->with('sender')
            ->orderBy('created_at')
            ->paginate(50);

        return response()->json([
            'conversation' => new ConversationResource(
                $conversation->load(['annonce', 'buyer', 'seller'])
            ),
            'messages' => MessageResource::collection($messages),
        ]);
    }

    /**
     * DELETE /conversations/{conversation}
     * Supprime la conversation et tous ses messages.
     * Réservé aux deux participants.
     */
    public function destroy(Conversation $conversation)
    {
        $this->authorize('view', $conversation);
        $conversation->delete();
        return response()->json(['message' => 'Conversation supprimée']);
    }

    /**
     * GET /unread-count
     * Compteur global de messages non lus (badge navbar).
     * Lecture directe des compteurs dénormalisés : O(1).
     */
    public function unreadCount()
    {
        $userId = auth()->id();

        $count = Conversation::where('buyer_id', $userId)->sum('buyer_unread_count')
            + Conversation::where('seller_id', $userId)->sum('seller_unread_count');

        return response()->json(['unread_count' => (int) $count]);
    }
}
