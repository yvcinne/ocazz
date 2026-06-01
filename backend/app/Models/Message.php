<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Message extends Model
{
    // La table n'a pas de colonne updated_at (optimisation : messages immutables)
    const UPDATED_AT = null;

    protected $fillable = [
        'conversation_id',
        'sender_id',
        'content',
        'image_path',
        'read_at',
    ];

    protected $casts = [
        'read_at'    => 'datetime',
        'created_at' => 'datetime',
    ];

    // -------------------------------------------------------------------------
    // Relations
    // -------------------------------------------------------------------------

    public function conversation()
    {
        return $this->belongsTo(Conversation::class);
    }

    public function sender()
    {
        return $this->belongsTo(User::class, 'sender_id');
    }

    // -------------------------------------------------------------------------
    // Helpers
    // -------------------------------------------------------------------------

    public function isRead(): bool
    {
        return $this->read_at !== null;
    }

    public function isOwnedBy(int $userId): bool
    {
        return $this->sender_id === $userId;
    }
}
