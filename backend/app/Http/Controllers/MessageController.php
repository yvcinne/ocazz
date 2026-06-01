<?php

namespace App\Http\Controllers;

use App\Events\MessageSent;
use App\Http\Requests\SendMessageRequest;
use App\Http\Resources\MessageResource;
use App\Models\Conversation;

class MessageController extends Controller
{
    /**
     * POST /conversations/{conversation}/messages
     * Envoie un message et met à jour les métadonnées de la conversation.
     * Le broadcast Reverb sera ajouté à l'étape Events (étape 9).
     */
    public function store(SendMessageRequest $request, Conversation $conversation)
    {
        $this->authorize('participate', $conversation);

        $senderId = auth()->id();

        $imagePath = null;
        if ($request->hasFile('image')) {
            $imagePath = $request->file('image')->store('message-images', 'public');
        }

        $message = $conversation->messages()->create([
            'sender_id'  => $senderId,
            'content'    => $request->content ?? '',
            'image_path' => $imagePath,
        ]);

        // Incrémenter le compteur non-lus du destinataire
        $recipientField = $conversation->getUnreadFieldFor(
            $senderId === $conversation->buyer_id
                ? $conversation->seller_id
                : $conversation->buyer_id
        );
        $conversation->increment($recipientField);
        $conversation->update(['last_message_at' => now()]);

        $message->load('sender');

        // Diffuse l'event sur private-conversation.{id} — l'expéditeur est exclu (.toOthers())
        broadcast(new MessageSent($message))->toOthers();

        return new MessageResource($message);
    }

    /**
     * POST /conversations/{conversation}/messages/read
     * Marque tous les messages non lus reçus dans cette conversation comme lus.
     * Remet à zéro le compteur dénormalisé de l'appelant.
     */
    public function markAllRead(Conversation $conversation)
    {
        $this->authorize('markRead', $conversation);

        $userId = auth()->id();

        $updated = $conversation->messages()
            ->where('sender_id', '!=', $userId)
            ->whereNull('read_at')
            ->update(['read_at' => now()]);

        if ($updated > 0) {
            $conversation->update([$conversation->getUnreadFieldFor($userId) => 0]);
        }

        return response()->json(['message' => 'Messages marked as read', 'count' => $updated]);
    }
}
