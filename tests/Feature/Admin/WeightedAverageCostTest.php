<?php

use App\Models\Product;
use App\Models\ProductPurchase;
use App\Models\ProductVariant;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('weighted average cost is applied when purchase order adds stock to existing inventory', function () {
    $product = Product::create([
        'name' => 'Grinder Timemore C3',
        'slug' => 'grinder-timemore-c3',
        'series' => 'alat-kopi',
        'price' => 700000,
        'stock' => 10,
        'is_active' => true,
    ]);

    $variant = ProductVariant::create([
        'product_id' => $product->id,
        'label' => 'Standard',
        'price' => 700000,
        'stock' => 10,
        'cost_price' => 50000.00,
    ]);

    $po = ProductPurchase::create([
        'purchase_number' => ProductPurchase::generatePurchaseNumber(),
        'status' => ProductPurchase::STATUS_DIPESAN,
        'purchase_date' => now()->toDateString(),
        'is_paid' => true,
        'paid_at' => now()->toDateString(),
    ]);

    $po->adjustVariantStock($product->id, $variant->id, 5, 65000.00);

    $variant->refresh();
    $product->refresh();

    // Old: 10 pcs @ 50.000 = 500.000
    // In:   5 pcs @ 65.000 = 325.000
    // Total: 15 pcs, Value: 825.000
    // Average: 825.000 / 15 = 55.000
    expect($variant->stock)->toBe(15)
        ->and((float) $variant->cost_price)->toBe(55000.00)
        ->and($product->stock)->toBe(15);
});

test('weighted average cost uses incoming cost directly when old stock is zero', function () {
    $product = Product::create([
        'name' => 'Kettle Brewista 700ml',
        'slug' => 'kettle-brewista-700ml',
        'series' => 'alat-kopi',
        'price' => 1200000,
        'stock' => 0,
        'is_active' => true,
    ]);

    $variant = ProductVariant::create([
        'product_id' => $product->id,
        'label' => 'Matte Black',
        'price' => 1200000,
        'stock' => 0,
        'cost_price' => 50000.00,
    ]);

    $po = ProductPurchase::create([
        'purchase_number' => ProductPurchase::generatePurchaseNumber(),
        'status' => ProductPurchase::STATUS_DIPESAN,
        'purchase_date' => now()->toDateString(),
        'is_paid' => true,
        'paid_at' => now()->toDateString(),
    ]);

    $po->adjustVariantStock($product->id, $variant->id, 10, 60000.00);

    $variant->refresh();

    expect($variant->stock)->toBe(10)
        ->and((float) $variant->cost_price)->toBe(60000.00);
});

test('weighted average cost uses incoming cost directly when old cost is zero or null', function () {
    $product = Product::create([
        'name' => 'Digital Scale KC200',
        'slug' => 'digital-scale-kc200',
        'series' => 'alat-kopi',
        'price' => 150000,
        'stock' => 5,
        'is_active' => true,
    ]);

    $variant = ProductVariant::create([
        'product_id' => $product->id,
        'label' => 'Standard',
        'price' => 150000,
        'stock' => 5,
        'cost_price' => null,
    ]);

    $po = ProductPurchase::create([
        'purchase_number' => ProductPurchase::generatePurchaseNumber(),
        'status' => ProductPurchase::STATUS_DIPESAN,
        'purchase_date' => now()->toDateString(),
        'is_paid' => true,
        'paid_at' => now()->toDateString(),
    ]);

    $po->adjustVariantStock($product->id, $variant->id, 5, 40000.00);

    $variant->refresh();

    expect($variant->stock)->toBe(10)
        ->and((float) $variant->cost_price)->toBe(40000.00);
});

test('syncStockWithStatus applies weighted average cost with discount considered', function () {
    $product = Product::create([
        'name' => 'Server V60 Glass',
        'slug' => 'server-v60-glass',
        'series' => 'alat-kopi',
        'price' => 180000,
        'stock' => 10,
        'is_active' => true,
    ]);

    $variant = ProductVariant::create([
        'product_id' => $product->id,
        'label' => '600ml',
        'price' => 180000,
        'stock' => 10,
        'cost_price' => 100000.00,
    ]);

    $po = ProductPurchase::create([
        'purchase_number' => ProductPurchase::generatePurchaseNumber(),
        'status' => ProductPurchase::STATUS_SELESAI,
        'purchase_date' => now()->toDateString(),
        'is_paid' => true,
        'paid_at' => now()->toDateString(),
    ]);

    // Incoming: 10 pcs @ 120.000, with discount 200.000 (net unit cost = 100.000)
    $po->items()->create([
        'product_id' => $product->id,
        'product_variant_id' => $variant->id,
        'quantity' => 10,
        'unit_cost' => 120000.00,
        'discount_amount' => 200000.00,
        'subtotal' => 1000000.00,
    ]);

    $po->syncStockWithStatus();

    $variant->refresh();

    // Old: 10 pcs @ 100.000 = 1.000.000
    // New: 10 pcs @ (120.000 - 20.000) = 1.000.000
    // Total: 20 pcs, Value: 2.000.000
    // Average: 100.000
    expect($variant->stock)->toBe(20)
        ->and((float) $variant->cost_price)->toBe(100000.00);
});
