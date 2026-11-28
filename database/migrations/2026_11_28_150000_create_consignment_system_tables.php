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
        // 1. Table Mitra Konsinyor (Penitip)
        Schema::create('consignors', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('code')->nullable()->unique();
            $table->string('phone')->nullable();
            $table->string('email')->nullable();
            $table->text('address')->nullable();
            $table->string('bank_name')->nullable();
            $table->string('bank_account_number')->nullable();
            $table->string('bank_account_holder')->nullable();
            $table->string('default_commission_type')->default('percentage'); // percentage, fixed_cost
            $table->decimal('default_commission_rate', 8, 2)->default(20.00); // 20% komisi toko
            $table->text('notes')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // 2. Tambah kolom konsinyasi ke tabel products
        Schema::table('products', function (Blueprint $table) {
            $table->boolean('is_consignment')->default(false)->after('channel');
            $table->foreignId('consignor_id')->nullable()->after('is_consignment')->constrained('consignors')->nullOnDelete();
            $table->string('consignment_commission_type')->nullable()->default('percentage')->after('consignor_id');
            $table->decimal('consignment_commission_rate', 8, 2)->nullable()->default(20.00)->after('consignment_commission_type');
            $table->decimal('consignment_payout_price', 12, 2)->nullable()->after('consignment_commission_rate');
        });

        // 3. Tambah kolom konsinyasi ke tabel product_variants
        Schema::table('product_variants', function (Blueprint $table) {
            $table->decimal('consignment_payout_price', 12, 2)->nullable()->after('cost_price');
        });

        // 4. Tambah kolom snapshot konsinyasi ke tabel order_items
        Schema::table('order_items', function (Blueprint $table) {
            $table->boolean('is_consignment')->default(false)->after('subtotal');
            $table->foreignId('consignor_id')->nullable()->after('is_consignment')->constrained('consignors')->nullOnDelete();
            $table->decimal('consignment_vendor_payout', 12, 2)->nullable()->after('consignor_id');
            $table->decimal('consignment_store_commission', 12, 2)->nullable()->after('consignment_vendor_payout');
            $table->timestamp('consignment_settled_at')->nullable()->after('consignment_store_commission');
            $table->unsignedBigInteger('consignment_settlement_id')->nullable()->after('consignment_settled_at');
        });

        // 5. Table Rekapitulasi & Settlement Pembayaran Konsinyasi
        Schema::create('consignment_settlements', function (Blueprint $table) {
            $table->id();
            $table->string('settlement_number')->unique();
            $table->foreignId('consignor_id')->constrained('consignors')->cascadeOnDelete();
            $table->date('period_start');
            $table->date('period_end');
            $table->integer('total_items_sold')->default(0);
            $table->decimal('total_gross_sales', 14, 2)->default(0);
            $table->decimal('total_vendor_payout', 14, 2)->default(0);
            $table->decimal('total_store_commission', 14, 2)->default(0);
            $table->string('status')->default('draft'); // draft, confirmed, paid, cancelled
            $table->timestamp('paid_at')->nullable();
            $table->string('payment_method')->nullable();
            $table->string('payment_reference')->nullable();
            $table->string('payment_proof')->nullable();
            $table->text('notes')->nullable();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });

        // 6. Table Rincian Item Settlement Konsinyasi
        Schema::create('consignment_settlement_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('consignment_settlement_id')->constrained('consignment_settlements')->cascadeOnDelete();
            $table->foreignId('order_id')->nullable()->constrained('orders')->nullOnDelete();
            $table->foreignId('order_item_id')->nullable()->constrained('order_items')->nullOnDelete();
            $table->foreignId('product_id')->nullable()->constrained('products')->nullOnDelete();
            $table->foreignId('product_variant_id')->nullable()->constrained('product_variants')->nullOnDelete();
            $table->string('product_name');
            $table->string('variant_label')->nullable();
            $table->integer('quantity')->default(1);
            $table->decimal('unit_price', 12, 2)->default(0);
            $table->decimal('subtotal', 12, 2)->default(0);
            $table->decimal('vendor_payout', 12, 2)->default(0);
            $table->decimal('store_commission', 12, 2)->default(0);
            $table->timestamp('sold_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('consignment_settlement_items');
        Schema::dropIfExists('consignment_settlements');

        Schema::table('order_items', function (Blueprint $table) {
            $table->dropForeign(['consignor_id']);
            $table->dropColumn([
                'is_consignment',
                'consignor_id',
                'consignment_vendor_payout',
                'consignment_store_commission',
                'consignment_settled_at',
                'consignment_settlement_id',
            ]);
        });

        Schema::table('product_variants', function (Blueprint $table) {
            $table->dropColumn('consignment_payout_price');
        });

        Schema::table('products', function (Blueprint $table) {
            $table->dropForeign(['consignor_id']);
            $table->dropColumn([
                'is_consignment',
                'consignor_id',
                'consignment_commission_type',
                'consignment_commission_rate',
                'consignment_payout_price',
            ]);
        });

        Schema::dropIfExists('consignors');
    }
};
