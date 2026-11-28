<?php

use App\Filament\Resources\MarketplaceProductMappings\Pages\ListMarketplaceProductMappings;
use App\Models\MarketplaceProductMapping;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Livewire\Livewire;

uses(RefreshDatabase::class);

test('changing tableRecordsPerPage reloads and displays the requested number of records', function () {
    $user = User::factory()->create([
        'role' => 'admin',
    ]);

    // Create 30 records
    for ($i = 1; $i <= 30; $i++) {
        MarketplaceProductMapping::create([
            'platform' => 'tiktok',
            'marketplace_product_id' => "PROD-{$i}",
            'marketplace_sku_id' => "SKU-{$i}",
            'marketplace_product_name' => "Product {$i}",
            'marketplace_status' => 'ACTIVATE',
            'sync_status' => 'pending',
        ]);
    }

    $component = Livewire::actingAs($user)
        ->test(ListMarketplaceProductMappings::class);

    // Initial records per page should be 10 or default
    expect($component->instance()->getTableRecords()->count())->toBe(10);

    // Change to 25
    $component->set('tableRecordsPerPage', 25);

    // Check if records count updated to 25!
    expect($component->instance()->getTableRecords()->count())->toBe(25);
});
