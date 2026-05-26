<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('annonces', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('title');
            $table->text('description');
            $table->decimal('price', 10, 2);
            $table->string('brand');
            $table->string('model');
            $table->year('model_year');
            $table->integer('mileage');
            $table->string('fuel_type', 50);
            $table->string('transmission', 50);
            $table->string('fiscal_power', 50);
            $table->string('car_condition', 100);
            $table->enum('status', ['pending', 'approved', 'rejected', 'sold'])->default('pending');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('annonces');
    }
};