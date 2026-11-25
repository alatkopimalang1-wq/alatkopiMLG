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
        Schema::create('marketplace_accounts', function (Blueprint $table) {
            $table->id();
            $table->string('platform')->default('tiktok'); // tiktok, tokopedia, shopee
            $table->string('name')->default('Alat Kopi Malang Omnichannel');
            $table->string('app_key')->nullable();
            $table->text('app_secret')->nullable();
            $table->string('service_id')->nullable();
            $table->text('access_token')->nullable();
            $table->text('refresh_token')->nullable();
            $table->timestamp('access_token_expires_at')->nullable();
            $table->timestamp('refresh_token_expires_at')->nullable();
            $table->string('seller_id')->nullable();
            $table->string('shop_cipher')->nullable();
            $table->string('shop_id')->nullable();
            $table->string('shop_name')->nullable();
            $table->string('seller_base_region')->default('ID');
            $table->boolean('is_active')->default(true);
            $table->boolean('auto_sync_stock')->default(true);
            $table->boolean('auto_sync_orders')->default(true);
            $table->timestamp('last_stock_sync_at')->nullable();
            $table->timestamp('last_order_sync_at')->nullable();
            $table->json('sync_logs')->nullable();
            $table->timestamps();
        });

        Schema::create('marketplace_product_mappings', function (Blueprint $table) {
            $table->id();
            $table->string('platform')->default('tiktok');
            $table->foreignId('product_id')->constrained('products')->cascadeOnDelete();
            $table->foreignId('product_variant_id')->nullable()->constrained('product_variants')->cascadeOnDelete();
            $table->string('marketplace_product_id')->index();
            $table->string('marketplace_sku_id')->nullable()->index();
            $table->string('seller_sku')->nullable()->index();
            $table->integer('last_synced_stock')->default(0);
            $table->timestamp('last_synced_at')->nullable();
            $table->string('sync_status')->default('synced'); // synced, pending, error
            $table->text('sync_message')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('marketplace_product_mappings');
        Schema::dropIfExists('marketplace_accounts');
    }
};
