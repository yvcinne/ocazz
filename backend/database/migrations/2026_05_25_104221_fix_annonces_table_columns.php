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
            // Rename legacy column names to match the model
            $table->renameColumn('year', 'model_year');
            $table->renameColumn('fuel', 'fuel_type');
            // Add columns that were in the original migration but missing from the live DB
            $table->string('fiscal_power', 50)->nullable()->after('transmission');
            $table->string('car_condition', 100)->nullable()->after('fiscal_power');
        });
    }

    public function down(): void
    {
        Schema::table('annonces', function (Blueprint $table) {
            $table->renameColumn('model_year', 'year');
            $table->renameColumn('fuel_type', 'fuel');
            $table->dropColumn(['fiscal_power', 'car_condition']);
        });
    }
};
