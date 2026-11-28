<?php

use App\Models\Category;
use App\Models\Order;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\User;

test('pos catalog returns real product and variant stock from website database', function () {
    $user = User::factory()->kasir()->create();

    $category = Category::firstOrCreate(['slug' => 'filter-beans'], [
        'name' => ['id' => 'Filter Beans', 'en' => 'Filter Beans'],
        'sort_order' => 1,
    ]);

    $product = Product::create([
        'name' => 'Kawi Honey Specialty Filter',
        'slug' => 'kawi-honey-specialty-filter',
        'min_price' => 75000,
        'max_price' => 140000,
        'stock' => 500,
        'stock_status' => 'in_stock',
        'status' => 'active',
        'channel' => 'all',
    ]);
    $product->categories()->attach($category->id);

    $v1 = ProductVariant::create([
        'product_id' => $product->id,
        'label' => '100 gr',
        'weight_grams' => 100,
        'price' => 75000,
        'stock' => 200,
        'sku' => 'SNB-KWI-100',
    ]);

    $v2 = ProductVariant::create([
        'product_id' => $product->id,
        'label' => '200 gr',
        'weight_grams' => 200,
        'price' => 140000,
        'stock' => 300,
        'sku' => 'SNB-KWI-200',
    ]);

    $res = $this->actingAs($user)->getJson('/pos/catalog');
    $res->assertOk();

    $catalog = $res->json();
    $p = collect($catalog['products'])->firstWhere('id', $product->id);

    expect($p)->not->toBeNull();
    expect($p['stock'])->toBe(500);
    expect($p['is_out_of_stock'])->toBeFalse();
    expect(count($p['variants']))->toBe(2);

    $v1Data = collect($p['variants'])->firstWhere('id', $v1->id);
    expect($v1Data['stock'])->toBe(200);

    $v2Data = collect($p['variants'])->firstWhere('id', $v2->id);
    expect($v2Data['stock'])->toBe(300);
});

test('pos checkout decrements website stock and syncs inventory', function () {
    $user = User::factory()->kasir()->create();

    $category = Category::firstOrCreate(['slug' => 'filter-beans'], [
        'name' => ['id' => 'Filter Beans', 'en' => 'Filter Beans'],
        'sort_order' => 1,
    ]);

    $product = Product::create([
        'name' => 'Toraja Sapan Natural',
        'slug' => 'toraja-sapan-natural',
        'min_price' => 85000,
        'max_price' => 85000,
        'stock' => 50,
        'stock_status' => 'in_stock',
        'status' => 'active',
        'channel' => 'all',
    ]);
    $product->categories()->attach($category->id);

    $variant = ProductVariant::create([
        'product_id' => $product->id,
        'label' => '200 gr',
        'weight_grams' => 200,
        'price' => 85000,
        'stock' => 50,
        'sku' => 'SNB-TRJ-200',
    ]);

    // Perform checkout of 3 items
    $payload = [
        'items' => [
            [
                'product_id' => $product->id,
                'variant_id' => $variant->id,
                'quantity' => 3,
                'price' => 85000,
                'product_name' => $product->name,
                'variant_label' => $variant->label,
            ],
        ],
        'payment_method' => 'cash',
        'cash_tendered' => 300000,
        'customer_name' => 'Pak Budi POS',
    ];

    $res = $this->withoutMiddleware()->actingAs($user)->postJson('/pos/checkout', $payload);
    $res->assertOk();

    // Check that variant and product stock have decremented by 3
    $variant->refresh();
    expect($variant->stock)->toBe(47);

    $product->refresh();
    expect($product->stock)->toBe(47);
});

test('pos checkout of 1 pcs decrements variant and product stock by exactly 1 without double deduction', function () {
    $user = User::factory()->kasir()->create();

    $category = Category::firstOrCreate(['slug' => 'alat-seduh'], [
        'name' => ['id' => 'Alat Seduh', 'en' => 'Alat Seduh'],
        'sort_order' => 1,
    ]);

    $product = Product::create([
        'name' => 'V60 Dripper Ceramic 01',
        'slug' => 'v60-dripper-ceramic-01',
        'min_price' => 150000,
        'max_price' => 150000,
        'stock' => 10,
        'stock_status' => 'in_stock',
        'status' => 'active',
        'channel' => 'all',
    ]);
    $product->categories()->attach($category->id);

    $variant = ProductVariant::create([
        'product_id' => $product->id,
        'label' => 'White Ceramic',
        'weight_grams' => 300,
        'price' => 150000,
        'stock' => 10,
        'sku' => 'V60-WHT-01',
    ]);

    $payload = [
        'items' => [
            [
                'product_id' => $product->id,
                'variant_id' => $variant->id,
                'quantity' => 1,
                'price' => 150000,
                'product_name' => $product->name,
                'variant_label' => $variant->label,
            ],
        ],
        'payment_method' => 'cash',
        'cash_tendered' => 150000,
        'customer_name' => 'Pelanggan Uji POS',
    ];

    $res = $this->withoutMiddleware()->actingAs($user)->postJson('/pos/checkout', $payload);
    $res->assertOk();

    $variant->refresh();
    expect($variant->stock)->toBe(9);

    $product->refresh();
    expect($product->stock)->toBe(9);
});

test('when pos transaction is deleted in dashboard admin stock is restored to original quantity', function () {
    $user = User::factory()->kasir()->create();

    $category = Category::firstOrCreate(['slug' => 'manual-brew'], [
        'name' => ['id' => 'Manual Brew', 'en' => 'Manual Brew'],
        'sort_order' => 1,
    ]);

    $product = Product::create([
        'name' => 'Server Kaca 600ml',
        'slug' => 'server-kaca-600ml',
        'min_price' => 90000,
        'max_price' => 90000,
        'stock' => 15,
        'stock_status' => 'in_stock',
        'status' => 'active',
        'channel' => 'all',
    ]);
    $product->categories()->attach($category->id);

    $variant = ProductVariant::create([
        'product_id' => $product->id,
        'label' => 'Standard',
        'weight_grams' => 400,
        'price' => 90000,
        'stock' => 15,
        'sku' => 'SRV-600',
    ]);

    // 1. Checkout 2 pcs via POS
    $payload = [
        'items' => [
            [
                'product_id' => $product->id,
                'variant_id' => $variant->id,
                'quantity' => 2,
                'price' => 90000,
                'product_name' => $product->name,
                'variant_label' => $variant->label,
            ],
        ],
        'payment_method' => 'cash',
        'cash_tendered' => 200000,
        'customer_name' => 'Pelanggan Hapus POS',
    ];

    $res = $this->withoutMiddleware()->actingAs($user)->postJson('/pos/checkout', $payload);
    $res->assertOk();

    $orderId = $res->json('order.id');
    $order = Order::with('items')->find($orderId);
    expect($order)->not->toBeNull();

    // Verify stock is decremented by 2
    $variant->refresh();
    expect($variant->stock)->toBe(13);

    $product->refresh();
    expect($product->stock)->toBe(13);

    // 2. Admin deletes the transaction in admin dashboard
    $order->delete();

    // 3. Stock must be restored back to 15 pcs
    $variant->refresh();
    expect($variant->stock)->toBe(15);
    expect($variant->stock_status)->toBe('in_stock');

    $product->refresh();
    expect($product->stock)->toBe(15);
    expect($product->stock_status)->toBe('in_stock');
});

test('when paid website order is deleted in dashboard admin stock is restored to original quantity', function () {
    $category = Category::firstOrCreate(['slug' => 'grinder-manual'], [
        'name' => ['id' => 'Grinder Manual', 'en' => 'Grinder Manual'],
        'sort_order' => 1,
    ]);

    $product = Product::create([
        'name' => 'Hand Grinder Stainless Steel',
        'slug' => 'hand-grinder-stainless-steel',
        'min_price' => 250000,
        'max_price' => 250000,
        'stock' => 8,
        'stock_status' => 'in_stock',
        'status' => 'active',
        'channel' => 'all',
    ]);
    $product->categories()->attach($category->id);

    $variant = ProductVariant::create([
        'product_id' => $product->id,
        'label' => 'Standard',
        'weight_grams' => 500,
        'price' => 250000,
        'stock' => 8,
        'sku' => 'GRN-SS-01',
    ]);

    // Create a paid website order of 3 pcs
    $order = Order::create([
        'order_number' => 'AKM-WEB-DEL-TEST',
        'customer_name' => 'Pelanggan Web',
        'customer_phone' => '08123456789',
        'customer_address' => 'Jl. Ijen No. 1 Malang',
        'shipping_courier' => 'JNE',
        'shipping_cost' => 15000,
        'payment_method' => 'bank_transfer',
        'payment_status' => 'pending',
        'status' => 'pending',
        'subtotal' => 750000,
        'total_amount' => 765000,
    ]);

    $order->items()->create([
        'product_id' => $product->id,
        'product_variant_id' => $variant->id,
        'product_name' => $product->name,
        'variant_label' => $variant->label,
        'price' => 250000,
        'quantity' => 3,
        'subtotal' => 750000,
    ]);

    // Mark as paid -> triggers deductStockIfNeeded
    $order->update(['payment_status' => 'paid']);

    $variant->refresh();
    expect($variant->stock)->toBe(5);

    $product->refresh();
    expect($product->stock)->toBe(5);

    // Admin deletes order in dashboard
    $order->delete();

    // Stock must be restored back to 8
    $variant->refresh();
    expect($variant->stock)->toBe(8);

    $product->refresh();
    expect($product->stock)->toBe(8);
});
