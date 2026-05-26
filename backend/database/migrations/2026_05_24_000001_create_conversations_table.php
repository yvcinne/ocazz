<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('conversations', function (Blueprint $table) {
            $table->id();

            $table->foreignId('annonce_id')
                ->constrained()
                ->onDelete('cascade');

            // buyer = celui qui a initié le contact
            $table->foreignId('buyer_id')
                ->constrained('users')
                ->onDelete('cascade');

            // seller = propriétaire de l'annonce
            $table->foreignId('seller_id')
                ->constrained('users')
                ->onDelete('cascade');

            // Dénormalisé pour éviter les COUNT(*) sur toute la table messages à chaque inbox
            $table->unsignedInteger('buyer_unread_count')->default(0);
            $table->unsignedInteger('seller_unread_count')->default(0);

            // Permet de trier l'inbox par activité récente sans toucher aux messages
            $table->timestamp('last_message_at')->nullable();

            $table->timestamps();

            // Une seule conversation par (acheteur, annonce)
            $table->unique(['annonce_id', 'buyer_id']);

            // Accélère les requêtes inbox (WHERE buyer_id = ? OR seller_id = ?)
            $table->index(['buyer_id', 'last_message_at']);
            $table->index(['seller_id', 'last_message_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('conversations');
    }
};
