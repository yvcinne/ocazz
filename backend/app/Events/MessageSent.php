<?php

namespace App\Events;

use App\Http\Resources\MessageResource;
use App\Models\Message;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class MessageSent implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(public readonly Message $message)
    {
        //
    }

    /**
     * Canal privé = seuls les participants autorisés reçoivent l'event.
     * L'autorisation est vérifiée dans routes/channels.php.
     *
     * @return array<Channel>
     */
    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('conversation.' . $this->message->conversation_id),
        ];
    }

    /**
     * Nom de l'event côté client Echo : .message.sent
     * Permet de binder proprement dans React sans le namespace complet.
     */
    public function broadcastAs(): string
    {
        return 'message.sent';
    }

    /**
     * Payload envoyé au client — on réutilise MessageResource pour cohérence.
     * `resolve()` retourne le tableau sans l'enveloppe JsonResponse.
     */
    public function broadcastWith(): array
    {
        return (new MessageResource($this->message))
            ->resolve(request());
    }
}
