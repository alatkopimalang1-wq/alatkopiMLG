<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasColumn('products', 'stock')) {
            Schema::table('products', function (Blueprint $table) {
                $table->integer('stock')->default(300)->after('stock_status');
            });
        }

        if (! Schema::hasColumn('product_variants', 'stock')) {
            Schema::table('product_variants', function (Blueprint $table) {
                $table->integer('stock')->default(300)->after('stock_status');
            });
        }

        // Set default quantity: 300 per variant for available, 0 for out of stock
        DB::table('product_variants')
            ->where('stock_status', 'out_of_stock')
            ->update(['stock' => 0]);

        DB::table('product_variants')
            ->where('stock_status', '!=', 'out_of_stock')
            ->update(['stock' => 300]);

        DB::table('products')
            ->where('stock_status', 'out_of_stock')
            ->update(['stock' => 0]);

        DB::table('products')
            ->where('stock_status', '!=', 'out_of_stock')
            ->update(['stock' => 300]);
    }

    public function down(): void
    {
        if (Schema::hasColumn('products', 'stock')) {
            Schema::table('products', function (Blueprint $table) {
                $table->dropColumn('stock');
            });
        }

        if (! Schema::hasColumn('product_variants', 'stock')) {
            Schema::table('product_variants', function (Blueprint $table) {
                $table->dropColumn('stock');
            });
        }
    }
};
