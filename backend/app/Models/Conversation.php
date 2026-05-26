<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Conversation extends Model
{
    protected $fillable = [
        'annonce_id',
        'buyer_id',
        'seller_id',
        'last_message_at',
        'buyer_unread_count',
        'seller_unread_count',
    ];

    protected $casts = [
        'last_message_at'     => 'datetime',
        'buyer_unread_count'  => 'integer',
        'seller_unread_count' => 'integer',
    ];

    // -------------------------------------------------------------------------
    // Relations
    // -------------------------------------------------------------------------

    public function annonce()
    {
        return $this->belongsTo(Annonce::class);
    }

    public function buyer()
    {
        return $this->belongsTo(User::class, 'buyer_id');
    }

    public function seller()
    {
        return $this->belongsTo(User::class, 'seller_id');
    }

    public function messages()
    {
        return $this->hasMany(Message::class)->orderBy('created_at');
    }

    // Dernier message pour la preview inbox (1 query via hasOne + latestOfMany)
    public function latestMessage()
    {
        return $this->hasOne(Message::class)->latestOfMany('created_at');
    }

    // -------------------------------------------------------------------------
    // Helpers
    // -------------------------------------------------------------------------

    public function isParticipant(int $userId): bool
    {
        return $userId === $this->buyer_id || $userId === $this->seller_id;
    }

    public function getOtherParticipant(int $userId): User
    {
        return $userId === $this->buyer_id ? $this->seller : $this->buyer;
    }

    public function getUnreadCountFor(int $userId): int
    {
        return (int) ($userId === $this->buyer_id
            ? $this->buyer_unread_count
            : $this->seller_unread_count);
    }

    public function getUnreadFieldFor(int $userId): string
    {
        return $userId === $this->buyer_id ? 'buyer_unread_count' : 'seller_unread_count';
    }
}
