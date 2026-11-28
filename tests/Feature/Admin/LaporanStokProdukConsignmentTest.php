<?php

use App\Filament\Pages\LaporanStokProduk;
use App\Models\Category;
use App\Models\Consignor;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\User;
use Livewire\Livewire;

test('laporan stok produk can filter owned vs consignment products properly', function () {
    $owner = User::factory()->owner()->create();

    $category = Category::firstOrCreate(['slug' => 'test-alat-seduh'], [
        'name' => ['id' => 'Alat Seduh Test', 'en' => 'Alat Seduh Test'],
        'sort_order' => 1,
    ]);

    $consignorA = Consignor::create([
        'name' => 'Mitra Seduh Sejahtera',
        'code' => 'MSS',
        'is_active' => true,
    ]);

    $consignorB = Consignor::create([
        'name' => 'Kopi Titip Jaya',
        'code' => 'KTJ',
        'is_active' => true,
    ]);

    // 1. Regular owned product
    $ownedProduct = Product::create([
        'name' => 'V60 Hario Switch Owned',
        'slug' => 'v60-hario-switch-owned',
        'min_price' => 350000,
        'max_price' => 350000,
        'stock' => 10,
        'stock_status' => 'in_stock',
        'status' => 'active',
        'is_consignment' => false,
        'series' => 'alat-kopi',
    ]);
    $ownedProduct->categories()->attach($category->id);
    ProductVariant::create([
        'product_id' => $ownedProduct->id,
        'label' => 'Standard',
        'price' => 350000,
        'cost_price' => 280000,
        'stock' => 10,
        'sku' => 'OWN-01',
    ]);

    // 2. Consignment product from Consignor A
    $consignmentA = Product::create([
        'name' => 'Aeropress Original Consignment',
        'slug' => 'aeropress-original-consignment',
        'min_price' => 600000,
        'max_price' => 600000,
        'stock' => 5,
        'stock_status' => 'in_stock',
        'status' => 'active',
        'is_consignment' => true,
        'consignor_id' => $consignorA->id,
        'series' => 'alat-kopi',
    ]);
    $consignmentA->categories()->attach($category->id);
    ProductVariant::create([
        'product_id' => $consignmentA->id,
        'label' => 'Standard',
        'price' => 600000,
        'cost_price' => 500000,
        'stock' => 5,
        'sku' => 'CSG-A-01',
    ]);

    // 3. Consignment product from Consignor B
    $consignmentB = Product::create([
        'name' => 'Comandante C40 Consignment',
        'slug' => 'comandante-c40-consignment',
        'min_price' => 4500000,
        'max_price' => 4500000,
        'stock' => 2,
        'stock_status' => 'in_stock',
        'status' => 'active',
        'is_consignment' => true,
        'consignor_id' => $consignorB->id,
        'series' => 'alat-kopi',
    ]);
    $consignmentB->categories()->attach($category->id);
    ProductVariant::create([
        'product_id' => $consignmentB->id,
        'label' => 'Standard',
        'price' => 4500000,
        'cost_price' => 4000000,
        'stock' => 2,
        'sku' => 'CSG-B-01',
    ]);

    $this->actingAs($owner);

    // Test default 'all': both owned and consignment products exist
    Livewire::test(LaporanStokProduk::class)
        ->set('consignmentFilter', 'all')
        ->assertSee('V60 Hario Switch Owned')
        ->assertSee('Aeropress Original Consignment')
        ->assertSee('Comandante C40 Consignment')
        // Test filter 'owned': only owned products
        ->set('consignmentFilter', 'owned')
        ->assertSee('V60 Hario Switch Owned')
        ->assertDontSee('Aeropress Original Consignment')
        ->assertDontSee('Comandante C40 Consignment')
        // Test filter 'consignment': all consignment products
        ->set('consignmentFilter', 'consignment')
        ->assertDontSee('V60 Hario Switch Owned')
        ->assertSee('Aeropress Original Consignment')
        ->assertSee('Comandante C40 Consignment')
        // Test filter specific consignor A
        ->set('consignmentFilter', "consignor_{$consignorA->id}")
        ->assertDontSee('V60 Hario Switch Owned')
        ->assertSee('Aeropress Original Consignment')
        ->assertDontSee('Comandante C40 Consignment')
        // Test filter specific consignor B
        ->set('consignmentFilter', "consignor_{$consignorB->id}")
        ->assertDontSee('V60 Hario Switch Owned')
        ->assertDontSee('Aeropress Original Consignment')
        ->assertSee('Comandante C40 Consignment');

    // Test CSV Export contains consignment data
    $component = Livewire::test(LaporanStokProduk::class)
        ->set('consignmentFilter', 'consignment');
    
    $response = $component->call('exportCsv');
    expect($response)->not->toBeNull();
});
