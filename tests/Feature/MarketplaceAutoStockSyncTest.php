<?php

use App\Models\MarketplaceProductMapping;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\Setting;
use App\Services\MarketplaceStockSyncService;

test('order item creation automatically deducts variant and product stock', function () {
    Setting::set('marketplace_auto_sync_stock', true);
    Setting::set('auto_sync_website_to_mp', true);

    $product = Product::create([
        'name' => 'Auto Sync Product Test',
        'slug' => 'auto-sync-product-test',
        'series' => 'kawi',
        'min_price' => 50000,
        'max_price' => 100000,
        'stock' => 300,
        'status' => 'active',
        'channel' => 'all',
    ]);

    $variant = ProductVariant::create([
        'product_id' => $product->id,
        'label' => '200 gr',
        'weight_grams' => 200,
        'price' => 60000,
        'stock' => 300,
    ]);

    $product->refresh();
    expect($variant->stock)->toBe(300);

    $order = Order::create([
        'order_number' => Order::generateOrderNumber(),
        'customer_name' => 'John Doe',
        'customer_phone' => '08123456789',
        'customer_address' => 'Jl. Kawi No. 1, Malang',
        'subtotal' => 120000,
        'total_amount' => 120000,
        'status' => 'pending',
        'payment_status' => 'pending',
        'payment_method' => 'qris',
    ]);

    // Create order item with quantity = 2
    OrderItem::create([
        'order_id' => $order->id,
        'product_id' => $product->id,
        'product_variant_id' => $variant->id,
        'product_name' => $product->name,
        'variant_label' => $variant->label,
        'quantity' => 2,
        'price' => 60000,
        'subtotal' => 120000,
    ]);

    $variant->refresh();
    $product->refresh();

    // Variant stock should be decremented from 300 to 298
    expect($variant->stock)->toBe(298);
    // Product total stock should be 298
    expect($product->stock)->toBe(298);
});

test('marketplace stock sync service settings toggles correctly', function () {
    Setting::set('marketplace_auto_sync_stock', true);
    Setting::set('auto_sync_website_to_mp', true);
    Setting::set('auto_sync_mp_to_website', false);

    expect(MarketplaceStockSyncService::isAutoSyncEnabled())->toBeTrue();
    expect(MarketplaceStockSyncService::isWebsiteToMpEnabled())->toBeTrue();
    expect(MarketplaceStockSyncService::isMpToWebsiteEnabled())->toBeFalse();
});

test('marketplace sync page header actions load properly without errors', function () {
    $page = new \App\Filament\Resources\MarketplaceProductMappings\Pages\ListMarketplaceProductMappings();
    $reflection = new \ReflectionMethod($page, 'getHeaderActions');
    $reflection->setAccessible(true);
    $actions = $reflection->invoke($page);

    expect($actions)->toBeArray();
    expect(count($actions))->toBeGreaterThan(0);
});

test('updating variant stock on website triggers auto sync to marketplace', function () {
    \Illuminate\Support\Facades\Http::fake([
        '*shopeemobile.com*' => \Illuminate\Support\Facades\Http::response([
            'error' => '',
            'message' => 'success',
            'response' => [
                'failure_list' => [],
                'success_list' => [['model_id' => 87654321]],
            ],
        ], 200),
    ]);

    \App\Models\MarketplaceAccount::create([
        'platform' => 'shopee',
        'name' => 'Alat Kopi Malang Shopee',
        'app_key' => '2055519',
        'app_secret' => 'testsecret',
        'access_token' => 'testtoken',
        'shop_id' => '998877',
        'access_token_expires_at' => now()->addHours(3),
        'is_active' => true,
    ]);

    Setting::set('marketplace_auto_sync_stock', true);

    $product = Product::create([
        'name' => 'Auto Update Test Product',
        'slug' => 'auto-update-test-product',
        'min_price' => 50000,
        'max_price' => 100000,
        'stock' => 100,
        'status' => 'active',
        'channel' => 'all',
    ]);

    $variant = ProductVariant::create([
        'product_id' => $product->id,
        'label' => '100 gr',
        'weight_grams' => 100,
        'price' => 50000,
        'stock' => 100,
    ]);

    $mapping = MarketplaceProductMapping::create([
        'platform' => 'shopee',
        'product_id' => $product->id,
        'product_variant_id' => $variant->id,
        'marketplace_product_id' => '12345678',
        'marketplace_sku_id' => '87654321',
        'marketplace_product_name' => 'Shopee Live Product',
        'marketplace_sku_name' => '100 gr',
        'marketplace_stock' => 100,
        'is_active' => true,
        'marketplace_status' => 'ACTIVATE',
    ]);

    // Admin increases stock from 100 to 250
    $variant->stock = 250;
    $variant->save();

    $mapping->refresh();
    expect($mapping->marketplace_stock)->toBe(250);
    expect($mapping->last_synced_stock)->toBe(250);

    // Admin decreases stock from 250 to 50
    $variant->stock = 50;
    $variant->save();

    $mapping->refresh();
    expect($mapping->marketplace_stock)->toBe(50);
    expect($mapping->last_synced_stock)->toBe(50);
});

test('marketplace order automatically deducts website stock', function () {
    Setting::set('marketplace_auto_sync_stock', true);
    Setting::set('auto_sync_mp_to_website', true);

    $product = Product::create([
        'name' => 'Marketplace Order Product',
        'slug' => 'marketplace-order-product',
        'min_price' => 50000,
        'max_price' => 100000,
        'stock' => 300,
        'status' => 'active',
        'channel' => 'all',
    ]);

    $variant = ProductVariant::create([
        'product_id' => $product->id,
        'label' => '200 gr',
        'weight_grams' => 200,
        'price' => 50000,
        'stock' => 300,
    ]);

    $mapping = MarketplaceProductMapping::create([
        'platform' => 'shopee',
        'product_id' => $product->id,
        'product_variant_id' => $variant->id,
        'marketplace_product_id' => '111222',
        'marketplace_sku_id' => '333444',
        'marketplace_product_name' => 'Shopee Master Item',
        'marketplace_sku_name' => '200 gr',
        'marketplace_stock' => 297, // 3 sold on Shopee
        'last_synced_stock' => 300,
        'is_active' => true,
        'marketplace_status' => 'ACTIVATE',
    ]);

    // Call syncMarketplaceStockToWebsite
    $res = MarketplaceStockSyncService::syncMarketplaceStockToWebsite('shopee');

    // Website variant stock must be reduced by 3 (from 300 to 297)
    $variant->refresh();
    expect($variant->stock)->toBe(297);
    expect($res['updated'])->toBe(1);

    $mapping->refresh();
    expect($mapping->last_synced_stock)->toBe(297);
});
