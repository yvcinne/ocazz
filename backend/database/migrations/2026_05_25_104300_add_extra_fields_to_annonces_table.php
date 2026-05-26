<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('annonces', function (Blueprint $table) {
            $table->string('city')->nullable();
            $table->tinyInteger('doors')->nullable();
            $table->string('origin')->nullable();
            $table->boolean('first_hand')->nullable();
            $table->json('options')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('annonces', function (Blueprint $table) {
            $table->dropColumn(['city', 'doors', 'origin', 'first_hand', 'options']);
        });
    }
};
