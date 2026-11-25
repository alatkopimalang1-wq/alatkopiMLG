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
        Schema::table('marketplace_accounts', function (Blueprint $table) {
            $table->dateTime('access_token_expires_at')->nullable()->change();
            $table->dateTime('refresh_token_expires_at')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('marketplace_accounts', function (Blueprint $table) {
            $table->timestamp('access_token_expires_at')->nullable()->change();
            $table->timestamp('refresh_token_expires_at')->nullable()->change();
        });
    }
};
