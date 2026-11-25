<?php

use App\Filament\Pages\ManageShopeeSettings;
use App\Filament\Resources\MarketplaceProductMappings\Pages\ListMarketplaceProductMappings;
use App\Models\MarketplaceAccount;
use App\Models\MarketplaceProductMapping;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\User;
use App\Services\ShopeeService;
use Illuminate\Support\Facades\Http;
use Livewire\Livewire;

test('shopee settings page can mount and save live credentials', function () {
    $user = User::factory()->create(['role' => 'admin']);
    $this->actingAs($user);

    $component = Livewire::test(ManageShopeeSettings::class)
        ->assertSuccessful()
        ->set('data.partner_id', '2055519')
        ->set('data.partner_key', 'testlivepartnerkey1234567890abcdef')
        ->set('data.environment', 'production')
        ->call('save')
        ->assertHasNoErrors();

    $account = MarketplaceAccount::where('platform', 'shopee')->first();
    expect($account)->not->toBeNull();
    expect($account->app_key)->toBe('2055519');
    expect($account->app_secret)->toBe('testlivepartnerkey1234567890abcdef');
    expect($account->seller_base_region)->toBe('ID');

    // Test ShopeeService generates correct live authorization URL
    $service = new ShopeeService($account);
    $authUrl = $service->getAuthorizationUrl();

    expect($authUrl)->toContain('https://partner.shopeemobile.com/api/v2/shop/auth_partner');
    expect($authUrl)->toContain('partner_id=2055519');
    expect($authUrl)->toContain('redirect=' . urlencode(url('/api/marketplace/shopee/callback')));
    expect($authUrl)->not->toContain('partner.test-stable.shopeemobile.com');
    expect($authUrl)->not->toContain('partner_id=1255048');
});

test('shopee sync products pulls only live products and maps size variations', function () {
    $account = MarketplaceAccount::create([
        'platform' => 'shopee',
        'name' => 'Alat Kopi Malang Shopee',
        'app_key' => '2055519',
        'app_secret' => 'testsecret',
        'access_token' => 'testtoken',
        'shop_id' => '998877',
        'access_token_expires_at' => now()->addHours(3),
        'is_active' => true,
    ]);

    // Create local product and variants
    $product = Product::create([
        'name' => 'Kawi Honey',
        'slug' => 'kawi-honey',
        'description' => 'Kopi Kawi Honey',
        'stock_status' => 'in_stock',
    ]);
    $var200 = ProductVariant::create([
        'product_id' => $product->id,
        'label' => '200gr Biji Utuh',
        'price' => 65000,
        'stock' => 10,
        'stock_status' => 'in_stock',
    ]);
    $var1kg = ProductVariant::create([
        'product_id' => $product->id,
        'label' => '1000gr Bubuk',
        'price' => 250000,
        'stock' => 5,
        'stock_status' => 'in_stock',
    ]);

    Http::fake([
        '*/api/v2/product/get_item_list*' => Http::response([
            'error' => '',
            'response' => [
                'item' => [
                    ['item_id' => 1001, 'item_status' => 'NORMAL'],
                    ['item_id' => 1002, 'item_status' => 'UNLIST'], // Should be ignored (not NORMAL)
                ],
                'has_next_page' => false,
            ],
        ]),
        '*/api/v2/product/get_item_base_info*' => Http::response([
            'error' => '',
            'response' => [
                'item_list' => [
                    [
                        'item_id' => 1001,
                        'item_name' => 'Kawi Honey',
                        'item_status' => 'NORMAL',
                        'has_model' => true,
                        'image' => [
                            'image_url_list' => ['https://img.shopee.co.id/kawi.jpg'],
                        ],
                        'item_sku' => 'KAWI-HONEY-ROOT',
                        'price_info' => [['current_price' => 65000]],
                    ],
                ],
            ],
        ]),
        '*/api/v2/product/get_model_list*' => Http::response([
            'error' => '',
            'response' => [
                'model' => [
                    [
                        'model_id' => 5001,
                        'model_name' => '200gr Biji Utuh',
                        'model_sku' => 'KW-200G',
                        'price_info' => [['current_price' => 65000]],
                        'stock_info_v2' => ['summary_info' => ['total_available_stock' => 15]],
                    ],
                    [
                        'model_id' => 5002,
                        'model_name' => '1000gr Bubuk',
                        'model_sku' => 'KW-1KG',
                        'price_info' => [['current_price' => 250000]],
                        'stock_info_v2' => ['summary_info' => ['total_available_stock' => 8]],
                    ],
                ],
            ],
        ]),
    ]);

    $service = new ShopeeService($account);
    $result = $service->syncProducts();

    expect($result['total_products'])->toBe(1);
    expect($result['synced_count'])->toBe(2);

    $mappings = MarketplaceProductMapping::where('platform', 'shopee')->get();
    expect($mappings)->toHaveCount(2);

    $m200 = $mappings->firstWhere('marketplace_sku_id', '5001');
    expect($m200)->not->toBeNull();
    expect($m200->marketplace_sku_name)->toBe('200gr Biji Utuh');
    expect($m200->marketplace_stock)->toBe(15);
    expect((float) $m200->marketplace_price)->toBe(65000.0);
    expect($m200->product_id)->toBe($product->id);
    expect($m200->product_variant_id)->toBe($var200->id);
    expect($m200->sync_status)->toBe('synced');

    $m1kg = $mappings->firstWhere('marketplace_sku_id', '5002');
    expect($m1kg)->not->toBeNull();
    expect($m1kg->marketplace_sku_name)->toBe('1000gr Bubuk');
    expect($m1kg->marketplace_stock)->toBe(8);
    expect((float) $m1kg->marketplace_price)->toBe(250000.0);
    expect($m1kg->product_id)->toBe($product->id);
    expect($m1kg->product_variant_id)->toBe($var1kg->id);
    expect($m1kg->sync_status)->toBe('synced');
});

test('marketplace product mappings page filters by platform', function () {
    $user = User::factory()->create(['role' => 'admin']);
    $this->actingAs($user);

    // Create Shopee and TikTok mappings
    MarketplaceProductMapping::create([
        'platform' => 'shopee',
        'marketplace_product_id' => '101',
        'marketplace_sku_id' => '201',
        'marketplace_product_name' => 'Shopee Kopi Test',
        'marketplace_sku_name' => '250gr',
        'marketplace_stock' => 10,
        'marketplace_status' => 'ACTIVATE',
    ]);
    MarketplaceProductMapping::create([
        'platform' => 'tiktok',
        'marketplace_product_id' => '102',
        'marketplace_sku_id' => '202',
        'marketplace_product_name' => 'TikTok Kopi Test',
        'marketplace_sku_name' => '500gr',
        'marketplace_stock' => 20,
        'marketplace_status' => 'ACTIVATE',
    ]);

    Livewire::test(ListMarketplaceProductMappings::class)
        ->assertSuccessful()
        ->filterTable('platform', 'shopee')
        ->assertCanSeeTableRecords(MarketplaceProductMapping::where('platform', 'shopee')->get())
        ->assertCanNotSeeTableRecords(MarketplaceProductMapping::where('platform', 'tiktok')->get())
        ->filterTable('platform', 'tiktok')
        ->assertCanSeeTableRecords(MarketplaceProductMapping::where('platform', 'tiktok')->get())
        ->assertCanNotSeeTableRecords(MarketplaceProductMapping::where('platform', 'shopee')->get());
});

test('shopee auto pair matches keywords and maps 30gr to 15gr and other weights correctly', function () {
    $product = Product::create([
        'name' => 'Sindoro Sweet Plum Honey Brew Yeast',
        'slug' => 'sindoro-sweet-plum',
        'description' => 'Sindoro Sweet Plum',
        'stock_status' => 'in_stock',
    ]);
    $var15 = ProductVariant::create([
        'product_id' => $product->id,
        'label' => '15 gr',
        'price' => 25000,
        'stock' => 50,
        'stock_status' => 'in_stock',
    ]);
    $var100 = ProductVariant::create([
        'product_id' => $product->id,
        'label' => '100 gr',
        'price' => 55000,
        'stock' => 30,
        'stock_status' => 'in_stock',
    ]);
    $var200 = ProductVariant::create([
        'product_id' => $product->id,
        'label' => '200 gr',
        'price' => 95000,
        'stock' => 20,
        'stock_status' => 'in_stock',
    ]);

    // Test product matching
    $shopeeTitle = 'Alat Kopi Malang – Experimntal Process Exotic Roast Beans Arabica Coffee SINDORO SWEET PLUM Honey Fermentation';
    $matched = ShopeeService::findBestMatchingProduct($shopeeTitle);
    expect($matched)->not->toBeNull();
    expect($matched->id)->toBe($product->id);

    // Test variant matching for 30gr -> 15gr
    $v30 = ShopeeService::findBestMatchingVariant($product, '30 gr kemasan pocket');
    expect($v30)->not->toBeNull();
    expect($v30->id)->toBe($var15->id);

    // Test variant matching for 100gr -> 100gr
    $v100 = ShopeeService::findBestMatchingVariant($product, '100 gr');
    expect($v100)->not->toBeNull();
    expect($v100->id)->toBe($var100->id);

    // Test variant matching for 200gr -> 200gr
    $v200 = ShopeeService::findBestMatchingVariant($product, '200 gr');
    expect($v200)->not->toBeNull();
    expect($v200->id)->toBe($var200->id);

    // Create unmapped mapping and run autoPairAllProducts
    MarketplaceProductMapping::create([
        'platform' => 'shopee',
        'marketplace_product_id' => '999',
        'marketplace_sku_id' => '888',
        'marketplace_product_name' => $shopeeTitle,
        'marketplace_sku_name' => '30 gr kemasan pocket',
        'marketplace_stock' => 10,
        'marketplace_status' => 'ACTIVATE',
    ]);

    $res = ShopeeService::autoPairAllProducts();
    expect($res['paired_count'])->toBeGreaterThanOrEqual(1);

    $mapped = MarketplaceProductMapping::where('marketplace_sku_id', '888')->first();
    expect($mapped->product_id)->toBe($product->id);
    expect($mapped->product_variant_id)->toBe($var15->id);
    expect($mapped->sync_status)->toBe('synced');
});
