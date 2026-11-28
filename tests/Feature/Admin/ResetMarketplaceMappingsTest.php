<?php

use App\Models\MarketplaceProductMapping;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\User;
use App\Filament\Resources\MarketplaceProductMappings\Pages\ListMarketplaceProductMappings;
use Livewire\Livewire;

test('artisan command marketplace:reset-mappings resets connected mappings', function () {
    $product = Product::create([
        'name' => 'Kopi Robusta Dampit',
        'slug' => 'kopi-robusta-dampit',
        'price' => 50000,
        'stock' => 10,
        'is_active' => true,
    ]);

    $variant = ProductVariant::create([
        'product_id' => $product->id,
        'label' => '250 gr',
        'price' => 50000,
        'stock' => 10,
    ]);

    MarketplaceProductMapping::create([
        'platform' => 'shopee',
        'product_id' => $product->id,
        'product_variant_id' => $variant->id,
        'marketplace_product_id' => 'SP-TEST-01',
        'marketplace_sku_id' => 'SKU-01',
        'marketplace_product_name' => 'Kopi Dampit Shopee',
        'marketplace_stock' => 10,
        'marketplace_status' => 'ACTIVATE',
    ]);

    MarketplaceProductMapping::create([
        'platform' => 'tiktok',
        'product_id' => $product->id,
        'product_variant_id' => $variant->id,
        'marketplace_product_id' => 'TTS-TEST-01',
        'marketplace_sku_id' => 'SKU-02',
        'marketplace_product_name' => 'Kopi Dampit TikTok',
        'marketplace_stock' => 10,
        'marketplace_status' => 'ACTIVATE',
    ]);

    expect(MarketplaceProductMapping::whereNotNull('product_id')->count())->toBe(2);

    $this->artisan('marketplace:reset-mappings')
        ->expectsOutputToContain('Ditemukan 2 produk marketplace terhubung.')
        ->expectsOutputToContain('Berhasil mereset 2 produk marketplace menjadi Belum Terhubung.')
        ->assertExitCode(0);

    expect(MarketplaceProductMapping::whereNotNull('product_id')->count())->toBe(0);
    expect(MarketplaceProductMapping::whereNull('product_id')->count())->toBe(2);
});

test('filament page resetAllConnected action resets mappings', function () {
    $user = User::factory()->create(['role' => 'admin']);
    $this->actingAs($user);

    $product = Product::create([
        'name' => 'V60 Paper Filter',
        'slug' => 'v60-paper-filter',
        'price' => 35000,
        'stock' => 5,
        'is_active' => true,
    ]);

    MarketplaceProductMapping::create([
        'platform' => 'shopee',
        'product_id' => $product->id,
        'marketplace_product_id' => 'SP-TEST-02',
        'marketplace_product_name' => 'Filter Paper',
        'marketplace_stock' => 5,
        'marketplace_status' => 'ACTIVATE',
    ]);

    expect(MarketplaceProductMapping::whereNotNull('product_id')->count())->toBe(1);

    Livewire::test(ListMarketplaceProductMappings::class)
        ->assertSuccessful()
        ->callAction('resetAllConnected')
        ->assertNotified('Semua Hubungan Produk Berhasil Direset');

    expect(MarketplaceProductMapping::whereNotNull('product_id')->count())->toBe(0);
});
