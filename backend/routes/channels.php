<?php

use App\Models\Conversation;
use Illuminate\Support\Facades\Broadcast;

/*
|--------------------------------------------------------------------------
| Broadcast Channels
|--------------------------------------------------------------------------
|
| Chaque canal privé doit avoir un callback d'autorisation.
| Retourner true = accès autorisé, false/null = accès refusé (403).
|
*/

// Canal de notification utilisateur (présence optionnelle)
Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});

// Canal privé par conversation — seuls buyer et seller y ont accès.
// Reverb vérifie ce callback lors du handshake WS depuis le client React.
Broadcast::channel('conversation.{conversationId}', function ($user, $conversationId) {
    $conversation = Conversation::find($conversationId);

    return $conversation && $conversation->isParticipant($user->id);
});
