<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ConversationResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $userId = $request->user()->id;
        $other  = $this->getOtherParticipant($userId);

        return [
            'id'             => $this->id,
            'annonce'        => [
                'id'    => $this->annonce->id,
                'title' => $this->annonce->title,
            ],
            // Le "with" de l'interlocuteur (pas "buyer"/"seller" — abstraction métier)
            'participant'    => [
                'id'   => $other->id,
                'name' => $other->name,
            ],
            'unread_count'   => $this->getUnreadCountFor($userId),
            'last_message'   => $this->whenLoaded('latestMessage', function () {
                return $this->latestMessage ? [
                    'content'    => $this->latestMessage->content,
                    'created_at' => $this->latestMessage->created_at->toISOString(),
                ] : null;
            }),
            'last_message_at' => $this->last_message_at?->toISOString(),
            'created_at'      => $this->created_at->toISOString(),
        ];
    }
}
