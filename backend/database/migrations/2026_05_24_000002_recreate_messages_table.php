<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::dropIfExists('messages');

        Schema::create('messages', function (Blueprint $table) {
            $table->id();

            $table->foreignId('conversation_id')
                ->constrained()
                ->onDelete('cascade');

            $table->foreignId('sender_id')
                ->constrained('users')
                ->onDelete('cascade');

            $table->text('content');

            // NULL = non lu, timestamp = moment de lecture
            $table->timestamp('read_at')->nullable();

            $table->timestamp('created_at')->useCurrent();

            // Accélère GET /conversations/{id}/messages (ordre chronologique)
            $table->index(['conversation_id', 'created_at']);

            // Accélère le comptage des non lus (utilisé dans markAsRead + sync compteurs)
            $table->index(['conversation_id', 'sender_id', 'read_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('messages');

        Schema::create('messages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('sender_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('receiver_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('annonce_id')->constrained()->onDelete('cascade');
            $table->text('content');
            $table->timestamp('read_at')->nullable();
            $table->timestamps();
        });
    }
};
