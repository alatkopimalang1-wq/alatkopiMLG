<?php

use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\User;

test('admin can quickly update variant stock via quick-stock endpoint', function () {
    $admin = User::factory()->create([
        'role' => 'admin',
    ]);

    $product = Product::create([
        'name' => 'Kopi Arabika Test Quick Stock',
        'slug' => 'kopi-arabika-test-quick-stock',
        'series' => 'espresso-beans',
        'min_price' => 28000,
        'max_price' => 275000,
        'stock' => 100,
        'status' => 'active',
        'channel' => 'all',
    ]);

    $variant1 = ProductVariant::create([
        'product_id' => $product->id,
        'label' => '100 gr',
        'weight_grams' => 100,
        'price' => 28000,
        'stock' => 50,
    ]);

    $variant2 = ProductVariant::create([
        'product_id' => $product->id,
        'label' => '250 gr',
        'weight_grams' => 250,
        'price' => 70000,
        'stock' => 50,
    ]);

    $response = $this->actingAs($admin)
        ->postJson(route('admin.products.variants.quick-stock', ['variant' => $variant1->id]), [
            'stock' => 120,
        ]);

    $response->assertOk()
        ->assertJson([
            'success' => true,
            'variant_id' => $variant1->id,
            'variant_stock' => 120,
            'product_id' => $product->id,
            'product_total_stock' => 170, // 120 + 50
            'product_stock_status' => 'in_stock',
        ]);

    $variant1->refresh();
    expect($variant1->stock)->toBe(120);
    expect($variant1->stock_status)->toBe('in_stock');

    $product->refresh();
    expect($product->stock)->toBe(170);
});

test('unauthenticated user cannot edit variant stock', function () {
    $product = Product::create([
        'name' => 'Kopi Test Guest',
        'slug' => 'kopi-test-guest',
        'series' => 'espresso-beans',
        'min_price' => 28000,
        'max_price' => 28000,
        'stock' => 50,
        'status' => 'active',
        'channel' => 'all',
    ]);

    $variant = ProductVariant::create([
        'product_id' => $product->id,
        'label' => '100 gr',
        'weight_grams' => 100,
        'price' => 28000,
        'stock' => 50,
    ]);

    $response = $this->postJson(route('admin.products.variants.quick-stock', ['variant' => $variant->id]), [
        'stock' => 80,
    ]);

    $response->assertUnauthorized();
});

test('quick-stock endpoint validates stock must be non-negative integer', function () {
    $admin = User::factory()->create([
        'role' => 'admin',
    ]);

    $product = Product::create([
        'name' => 'Kopi Test Negative',
        'slug' => 'kopi-test-negative',
        'series' => 'espresso-beans',
        'min_price' => 28000,
        'max_price' => 28000,
        'stock' => 50,
        'status' => 'active',
        'channel' => 'all',
    ]);

    $variant = ProductVariant::create([
        'product_id' => $product->id,
        'label' => '100 gr',
        'weight_grams' => 100,
        'price' => 28000,
        'stock' => 50,
    ]);

    $response = $this->actingAs($admin)
        ->postJson(route('admin.products.variants.quick-stock', ['variant' => $variant->id]), [
            'stock' => -5,
        ]);

    $response->assertUnprocessable()
        ->assertJsonValidationErrors(['stock']);
});
