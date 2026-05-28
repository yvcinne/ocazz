<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ChatbotSession extends Model
{
    protected $fillable = [
        'session_id',
        'user_id',
        'name',
        'phone',
        'lead_captured',
        'messages',
    ];

    protected $casts = [
        'messages'      => 'array',
        'lead_captured' => 'boolean',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function appendMessage(string $role, string $text): void
    {
        $msgs = $this->messages ?? [];
        $msgs[] = ['role' => $role, 'text' => $text, 'ts' => now()->toISOString()];
        $this->messages = $msgs;
        $this->save();
    }
}
