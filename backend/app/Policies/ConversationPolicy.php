<?php

namespace App\Policies;

use App\Models\Conversation;
use App\Models\User;

class ConversationPolicy
{
    /**
     * Voir une conversation et son historique de messages.
     * Réservé aux deux participants uniquement.
     */
    public function view(User $user, Conversation $conversation): bool
    {
        return $conversation->isParticipant($user->id);
    }

    /**
     * Envoyer un message dans une conversation.
     * Même règle : seuls buyer et seller peuvent écrire.
     */
    public function participate(User $user, Conversation $conversation): bool
    {
        return $conversation->isParticipant($user->id);
    }

    /**
     * Marquer les messages comme lus dans une conversation.
     * Seul le destinataire peut marquer "lu" (pas l'expéditeur).
     */
    public function markRead(User $user, Conversation $conversation): bool
    {
        return $conversation->isParticipant($user->id);
    }
}
