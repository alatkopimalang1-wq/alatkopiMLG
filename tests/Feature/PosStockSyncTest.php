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

    $res = $this->actingAs($user)->postJson('/pos/checkout', $payload);
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

    $res = $this->actingAs($user)->postJson('/pos/checkout', $payload);
    $res->assertOk();

    $variant->refresh();
    expect($variant->stock)->toBe(9);

    $product->refresh();
    expect($product->stock)->toBe(9);
});
