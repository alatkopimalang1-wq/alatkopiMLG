<?php

use App\Filament\Pages\ManageEquipmentBrands;
use App\Filament\Resources\EquipmentProducts\EquipmentProductResource;
use App\Filament\Resources\EquipmentProducts\Pages\CreateEquipmentProduct;
use App\Models\Category;
use App\Models\Product;
use App\Models\User;
use Database\Seeders\EquipmentProductsSeeder;
use Livewire\Livewire;

test('equipment products seeder creates alat-kopi category and 8 example products', function () {
    $this->seed(EquipmentProductsSeeder::class);

    expect(Category::where('slug', 'alat-kopi')->exists())->toBeTrue();
    expect(Product::where('series', 'alat-kopi')->count())->toBe(8);
    expect(Product::where('series', '!=', 'alat-kopi')->count())->toBe(0);

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
        ->set('data.has_variants', true)
        ->set('data.name', 'Fellow Stagg EKG Electric Kettle')
        ->set('data.slug', 'fellow-stagg-ekg-electric-kettle')
        ->set('data.origin', 'Fellow')
        ->set('data.warranty', '1 Tahun')
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
    expect($created->warranty)->toBe('1 Tahun');
    expect($created->stock)->toBe(8);
    expect((int) $created->min_price)->toBe(2650000);

    // Ensure it appears in Produk Alat Kopi
    expect(EquipmentProductResource::getEloquentQuery()->where('slug', 'fellow-stagg-ekg-electric-kettle')->exists())->toBeTrue();
});

test('admin can create equipment product without variants using direct price and stock', function () {
    $this->seed(EquipmentProductsSeeder::class);

    $admin = User::factory()->create(['role' => 'admin']);
    $this->actingAs($admin);

    Livewire::test(CreateEquipmentProduct::class)
        ->set('data.has_variants', false)
        ->set('data.name', 'Hario Paper Filter V60 02 (100 Sheets)')
        ->set('data.slug', 'hario-paper-filter-v60-02')
        ->set('data.origin', 'Hario')
        ->set('data.single_weight_grams', 250)
        ->set('data.single_cost_price', 55000)
        ->set('data.min_price', 75000)
        ->set('data.single_original_price', 85000)
        ->set('data.stock', 50)
        ->set('data.single_sku', 'AKM-FILTER-V60-02')
        ->call('create')
        ->assertHasNoErrors();

    $created = Product::where('slug', 'hario-paper-filter-v60-02')->first();
    expect($created)->not->toBeNull();
    expect((int) $created->min_price)->toBe(75000);
    expect((int) $created->max_price)->toBe(75000);
    expect($created->stock)->toBe(50);
    expect($created->variants()->count())->toBe(1);
    $variant = $created->variants()->first();
    expect($variant->label)->toBe('Standard');
    expect($variant->weight_grams)->toBe(250);
    expect((int) $variant->cost_price)->toBe(55000);
    expect((int) $variant->original_price)->toBe(85000);
    expect($variant->sku)->toBe('AKM-FILTER-V60-02');

    $this->get('/shop/hario-paper-filter-v60-02')->assertSuccessful();
});

test('admin can manage equipment brands and select them in equipment product form', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    $this->actingAs($admin);

    $this->get('/admin/manage-equipment-brands')->assertSuccessful();

    Livewire::test(ManageEquipmentBrands::class)
        ->set('data.brands_list', [
            ['name' => 'Comandante', 'slug' => 'comandante', 'description' => 'Grinder Jerman', 'is_active' => true],
            ['name' => 'Hario', 'slug' => 'hario', 'description' => 'Dripper Jepang', 'is_active' => true],
        ])
        ->call('save')
        ->assertHasNoErrors();

    $options = ManageEquipmentBrands::getBrandOptions();
    expect($options)->toHaveKey('Comandante');
    expect($options)->toHaveKey('Hario');

    Livewire::test(CreateEquipmentProduct::class)
        ->set('data.name', 'Comandante C40 Nitro Blade')
        ->set('data.slug', 'comandante-c40-nitro-blade')
        ->set('data.origin', 'Comandante')
        ->set('data.min_price', 4200000)
        ->set('data.stock', 5)
        ->call('create')
        ->assertHasNoErrors();

    $created = Product::where('slug', 'comandante-c40-nitro-blade')->first();
    expect($created)->not->toBeNull();
    expect($created->origin)->toBe('Comandante');
});

test('admin can generate template and bulk import equipment products with variants from csv', function () {
    $this->seed(EquipmentProductsSeeder::class);

    $service = new \App\Services\EquipmentProductImportService();
    $csv = $service->generateTemplateCsv();
    expect($csv)->toContain('nama_produk');
    expect($csv)->toContain('Timemore Chestnut C3 Grinder');

    $tmpPath = sys_get_temp_dir().'/test_import_'.uniqid().'.csv';
    file_put_contents($tmpPath, $csv);

    $result = $service->importFromFile($tmpPath, true);
    @unlink($tmpPath);

    expect($result['created'])->toBe(2);
    expect($result['variants'])->toBe(3);

    $grinder = Product::where('slug', 'timemore-chestnut-c3-grinder')->first();
    expect($grinder)->not->toBeNull();
    expect($grinder->origin)->toBe('Timemore');
    expect($grinder->stock)->toBe(25);
    expect((int) $grinder->min_price)->toBe(890000);
    expect($grinder->variants()->count())->toBe(2);

    $filter = Product::where('slug', 'hario-paper-filter-v60-02-100-lembar')->first();
    expect($filter)->not->toBeNull();
    expect($filter->stock)->toBe(40);
    expect((int) $filter->min_price)->toBe(68000);
});
