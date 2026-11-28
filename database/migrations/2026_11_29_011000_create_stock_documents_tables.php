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
            $table->string('document_number', 50)->unique();
            $table->string('type', 10); // in, out
            $table->string('status', 20)->default('draft'); // draft, posted, cancelled
            $table->date('transaction_date');
            $table->string('partner_name', 150)->nullable(); // Supplier / Penitip Konsinyasi / Penerima
            $table->string('partner_phone', 50)->nullable();
            $table->string('reference_number', 100)->nullable();
            $table->text('notes')->nullable();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->integer('total_qty')->default(0);
            $table->decimal('total_cost', 15, 2)->default(0);
            $table->timestamp('posted_at')->nullable();
            $table->timestamps();
        });

        Schema::create('stock_document_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('stock_document_id')->constrained('stock_documents')->cascadeOnDelete();
            $table->foreignId('product_id')->constrained('products')->cascadeOnDelete();
            $table->foreignId('product_variant_id')->nullable()->constrained('product_variants')->nullOnDelete();
            $table->integer('quantity')->default(1);
            $table->decimal('unit_cost', 15, 2)->default(0);
            $table->decimal('subtotal_cost', 15, 2)->default(0);
            $table->string('notes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('stock_document_items');
        Schema::dropIfExists('stock_documents');
    }
};
