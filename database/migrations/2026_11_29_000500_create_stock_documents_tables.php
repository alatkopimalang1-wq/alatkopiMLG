<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('stock_documents', function (Blueprint $table) {
            $table->id();
            $table->string('document_number')->unique();
            $table->string('type', 10)->index(); // 'in' or 'out'
            $table->string('status', 20)->default('draft')->index(); // 'draft', 'posted', 'cancelled'
            $table->date('document_date');
            $table->string('supplier_name')->nullable();
            $table->string('transfer_to')->nullable();
            $table->string('reason')->nullable();
            $table->text('notes')->nullable();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('posted_at')->nullable();
            $table->timestamp('cancelled_at')->nullable();
            $table->timestamps();
        });

        Schema::create('stock_document_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('stock_document_id')->constrained('stock_documents')->cascadeOnDelete();
            $table->foreignId('product_id')->constrained('products')->cascadeOnDelete();
            $table->foreignId('product_variant_id')->constrained('product_variants')->cascadeOnDelete();
            $table->integer('qty');
            $table->decimal('unit_cost', 15, 2)->default(0);
            $table->integer('qty_before')->nullable();
            $table->integer('qty_after')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('stock_document_items');
        Schema::dropIfExists('stock_documents');
    }
};
