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
            $table->foreignId('product_id')->nullable()->change();
            $table->string('marketplace_image_url')->nullable()->after('marketplace_product_name');
            $table->integer('marketplace_stock')->default(0)->after('last_synced_stock');
            $table->decimal('marketplace_price', 12, 2)->default(0)->after('marketplace_stock');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('marketplace_product_mappings', function (Blueprint $table) {
            $table->dropColumn(['marketplace_image_url', 'marketplace_stock', 'marketplace_price']);
        });
    }
};
