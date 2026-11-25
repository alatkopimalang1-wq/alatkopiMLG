<?php

use App\Models\MarketplaceProductMapping;
use App\Models\Product;
use App\Models\ProductVariant;

test('product variant stock defaults and strictly uses real stock quantity', function () {
    $product = Product::create([
        'name' => 'Test Stock Product',
        'slug' => 'test-stock-product-real',
        'series' => 'kawi',
        'min_price' => 65000,
        'max_price' => 120000,
        'stock' => 300,
        'status' => 'active',
        'channel' => 'all',
    ]);

    $variant = ProductVariant::create([
        'product_id' => $product->id,
        'label' => '200 gr',
        'weight_grams' => 200,
        'price' => 65000,
        'stock' => 300,
    ]);

    expect($variant->stock)->toBe(300);
    expect($variant->stock_status)->toBe('in_stock');
    expect($product->is_out_of_stock)->toBeFalse();

    // Setting real stock to 0 automatically sets stock_status to out_of_stock
    $variant->stock = 0;
    $variant->save();
    $variant->refresh();

    expect($variant->stock)->toBe(0);
    expect($variant->stock_status)->toBe('out_of_stock');

    // Setting real stock back to 150 automatically sets stock_status to in_stock
    $variant->stock = 150;
    $variant->save();
    $variant->refresh();

    expect($variant->stock)->toBe(150);
    expect($variant->stock_status)->toBe('in_stock');

    // Product total stock is synced
    $product->refresh();
    expect($product->stock)->toBe(150);
    expect($product->stock_status)->toBe('in_stock');
    expect($product->is_out_of_stock)->toBeFalse();

    // When variant stock is 0, product is out of stock
    $variant->stock = 0;
    $variant->save();

    $product->refresh();
    expect($product->stock)->toBe(0);
    expect($product->stock_status)->toBe('out_of_stock');
    expect($product->is_out_of_stock)->toBeTrue();
});

test('product stock automatically sums up all variant stocks', function () {
    $product = Product::create([
        'name' => 'Auto Sum Product',
        'slug' => 'auto-sum-product',
        'series' => 'kawi',
        'min_price' => 50000,
        'max_price' => 150000,
        'stock' => 0,
        'status' => 'active',
        'channel' => 'all',
    ]);

    ProductVariant::create([
        'product_id' => $product->id,
        'label' => '100 gr',
        'weight_grams' => 100,
        'price' => 50000,
        'stock' => 300,
    ]);

    ProductVariant::create([
        'product_id' => $product->id,
        'label' => '200 gr',
        'weight_grams' => 200,
        'price' => 90000,
        'stock' => 300,
    ]);

    ProductVariant::create([
        'product_id' => $product->id,
        'label' => '500 gr',
        'weight_grams' => 500,
        'price' => 150000,
        'stock' => 300,
    ]);

    $product->refresh();
    expect($product->stock)->toBe(900); // 300 + 300 + 300 = 900
    expect($product->stock_status)->toBe('in_stock');
});

test('marketplace product mapping uses real website stock and detects difference', function () {
    $product = Product::create([
        'name' => 'Kawi Natural Anaerob Filter',
        'slug' => 'kawi-natural-anaerob-filter',
        'series' => 'kawi',
        'min_price' => 65000,
        'max_price' => 120000,
        'stock' => 300,
        'status' => 'active',
        'channel' => 'all',
    ]);

    $variant = ProductVariant::create([
        'product_id' => $product->id,
        'label' => '100 gr',
        'weight_grams' => 100,
        'price' => 65000,
        'stock' => 300,
    ]);

    $mapping = MarketplaceProductMapping::create([
        'platform' => 'shopee',
        'marketplace_product_id' => '12345678',
        'marketplace_sku_id' => '87654321',
        'marketplace_product_name' => 'Alat Kopi Malang - Roast Bean Arabica KAWI',
        'marketplace_sku_name' => '100 gr',
        'marketplace_stock' => 100,
        'product_id' => $product->id,
        'product_variant_id' => $variant->id,
        'sync_status' => 'synced',
        'marketplace_status' => 'ACTIVATE',
    ]);

    expect($mapping->website_stock)->toBe(300);
    expect($mapping->website_stock_label)->toBe('300');
    expect($mapping->is_stock_conflict)->toBeTrue(); // MP: 100 vs Web: 300

    // Test syncAllMarketplaceStockToWebsite
    MarketplaceProductMapping::syncAllMarketplaceStockToWebsite('shopee');

    $variant->refresh();
    expect($variant->stock)->toBe(100);

    $mapping->refresh();
    expect($mapping->website_stock)->toBe(100);
    expect($mapping->is_stock_conflict)->toBeFalse(); // Now in sync!
});
