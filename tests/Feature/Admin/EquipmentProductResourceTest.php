<?php

use App\Filament\Resources\EquipmentProducts\EquipmentProductResource;
use App\Filament\Resources\EquipmentProducts\Pages\CreateEquipmentProduct;
use App\Filament\Resources\Products\ProductResource;
use App\Models\Category;
use App\Models\Product;
use App\Models\User;
use Database\Seeders\EquipmentProductsSeeder;
use Livewire\Livewire;

test('equipment products seeder creates alat-kopi category and 4 example products', function () {
    $this->seed(EquipmentProductsSeeder::class);

    expect(Category::where('slug', 'alat-kopi')->exists())->toBeTrue();
    expect(Product::where('series', 'alat-kopi')->count())->toBe(4);

    $this->get('/shop?series=alat-kopi')->assertSuccessful();
    $this->get('/shop/hario-v60-ceramic-dripper-02')->assertSuccessful();
});

test('admin can access equipment product pages and create a new equipment product', function () {
    $this->seed(EquipmentProductsSeeder::class);

    $admin = User::factory()->create(['role' => 'admin']);
    $this->actingAs($admin);

    $this->get('/admin/equipment-products')->assertSuccessful();
    $this->get('/admin/equipment-products/create')->assertSuccessful();

    Livewire::test(CreateEquipmentProduct::class)
        ->set('data.name', 'Fellow Stagg EKG Electric Kettle')
        ->set('data.slug', 'fellow-stagg-ekg-electric-kettle')
        ->set('data.origin', 'Fellow')
        ->set('data.process', 'Electric Kettle')
        ->set('data.varietal', 'Stainless Steel 304')
        ->set('data.altitude', '900ml')
        ->set('data.variants', [
            [
                'label' => 'Matte Black 900ml',
                'weight_grams' => 1250,
                'price' => 2650000,
                'cost_price' => 2100000,
                'stock' => 8,
                'sku' => 'AKM-FELLOW-EKG-BLK',
            ],
        ])
        ->call('create')
        ->assertHasNoErrors();

    $created = Product::where('slug', 'fellow-stagg-ekg-electric-kettle')->first();
    expect($created)->not->toBeNull();
    expect($created->series)->toBe('alat-kopi');
    expect($created->stock)->toBe(8);
    expect((int) $created->min_price)->toBe(2650000);

    // Ensure separation between Produk Alat Kopi and Produk Kopi
    expect(EquipmentProductResource::getEloquentQuery()->where('slug', 'fellow-stagg-ekg-electric-kettle')->exists())->toBeTrue();
    expect(ProductResource::getEloquentQuery()->where('slug', 'fellow-stagg-ekg-electric-kettle')->exists())->toBeFalse();
});
