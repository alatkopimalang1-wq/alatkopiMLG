<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('cash_transfers', function (Blueprint $table) {
            $table->id();
            $table->string('from_account', 20); // 'tunai' | 'rekening'
            $table->string('to_account', 20);   // 'rekening' | 'tunai'
            $table->decimal('amount', 15, 2);
            $table->string('notes')->nullable();
            $table->timestamp('transferred_at');
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cash_transfers');
    }
};
