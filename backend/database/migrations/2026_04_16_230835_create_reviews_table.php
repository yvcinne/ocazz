<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('reviews', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('annonce_id')->constrained()->onDelete('cascade');
            $table->integer('rating');
            $table->text('comment')->nullable();
            $table->timestamps();
            
            // Contrainte unique pour qu'un utilisateur ne puisse laisser qu'un seul avis par annonce
            $table->unique(['user_id', 'annonce_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('reviews');
    }
};