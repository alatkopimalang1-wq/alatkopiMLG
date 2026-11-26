<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('product_purchases', function (Blueprint $table) {
            $table->string('status', 30)->default('dipesan')->after('purchase_date');
            $table->boolean('is_paid')->default(false)->after('status');
            $table->date('paid_at')->nullable()->after('is_paid');
            $table->date('due_date')->nullable()->after('paid_at');

            $table->string('supplier_phone', 50)->nullable()->after('supplier_name');
            $table->string('supplier_contact', 100)->nullable()->after('supplier_phone');
            $table->string('supplier_email', 150)->nullable()->after('supplier_contact');
            $table->text('supplier_address')->nullable()->after('supplier_email');
            $table->text('supplier_notes')->nullable()->after('supplier_address');

            $table->date('received_date')->nullable()->after('notes');
            $table->string('receipt_number', 100)->nullable()->after('received_date');
            $table->string('receiver_name', 150)->nullable()->after('receipt_number');

            $table->decimal('subtotal', 14, 2)->default(0)->after('total_qty');
            $table->decimal('discount_amount', 14, 2)->default(0)->after('subtotal');
            $table->timestamp('stock_applied_at')->nullable()->after('user_id');
        });

        Schema::table('product_purchase_items', function (Blueprint $table) {
            $table->decimal('discount_amount', 12, 2)->default(0)->after('unit_cost');
        });

        // Mark any pre-existing purchases as already received & stock applied
        DB::table('product_purchases')->update([
            'status' => 'diterima',
            'subtotal' => DB::raw('total_amount'),
            'stock_applied_at' => DB::raw('COALESCE(created_at, CURRENT_TIMESTAMP)'),
        ]);
    }

    public function down(): void
    {
        Schema::table('product_purchase_items', function (Blueprint $table) {
            $table->dropColumn('discount_amount');
        });

        Schema::table('product_purchases', function (Blueprint $table) {
            $table->dropColumn([
                'status',
                'is_paid',
                'paid_at',
                'due_date',
                'supplier_phone',
                'supplier_contact',
                'supplier_email',
                'supplier_address',
                'supplier_notes',
                'received_date',
                'receipt_number',
                'receiver_name',
                'subtotal',
                'discount_amount',
                'stock_applied_at',
            ]);
        });
    }
};
