<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MessageResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'              => $this->id,
            'conversation_id' => $this->conversation_id,
            'sender'          => [
                'id'   => $this->sender->id,
                'name' => $this->sender->name,
            ],
            'content'         => $this->content,
            'image_url'       => $this->image_path ? asset('storage/' . $this->image_path) : null,
            'read_at'         => $this->read_at?->toISOString(),
            'is_read'         => $this->isRead(),
            'is_mine'         => $this->sender_id === $request->user()->id,
            'created_at'      => $this->created_at->toISOString(),
        ];
    }
}
