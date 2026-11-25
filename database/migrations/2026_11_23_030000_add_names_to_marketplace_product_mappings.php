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
        Schema::table('marketplace_product_mappings', function (Blueprint $table) {
            $table->string('marketplace_product_name')->nullable()->after('marketplace_product_id');
            $table->string('marketplace_sku_name')->nullable()->after('marketplace_sku_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('marketplace_product_mappings', function (Blueprint $table) {
            $table->dropColumn(['marketplace_product_name', 'marketplace_sku_name']);
        });
    }
};
