<?php

use App\Models\MarketplaceAccount;
use App\Models\MarketplaceProductMapping;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Services\ShopeeService;
use App\Services\TikTokShopService;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;

beforeEach(function () {
    Cache::flush();
});

test('syncing shopee products does not auto-match or auto-connect products to website', function () {
    // Create local website product with exact name
    $product = Product::create([
        'name' => 'Kawi Honey Filter Beans',
        'slug' => 'kawi-honey-filter-beans',
        'price' => 65000,
        'stock' => 10,
        'is_active' => true,
    ]);

    $variant = ProductVariant::create([
        'product_id' => $product->id,
        'label' => '200 gr',
        'price' => 65000,
        'stock' => 10,
    ]);

    $account = MarketplaceAccount::create([
        'platform' => 'shopee',
        'name' => 'Shopee Test',
        'app_key' => '2055519',
        'app_secret' => 'testsecret',
        'access_token' => 'testtoken',
        'shop_id' => '998877',
        'access_token_expires_at' => now()->addHours(3),
        'is_active' => true,
    ]);

    Http::fake([
        '*product/get_item_list*' => Http::response([
            'error' => '',
            'response' => [
                'item' => [
                    ['item_id' => 991122, 'item_status' => 'NORMAL'],
                ],
                'has_next_page' => false,
            ],
        ], 200),
        '*product/get_item_base_info*' => Http::response([
            'error' => '',
            'response' => [
                'item_list' => [
                    [
                        'item_id' => 991122,
                        'item_name' => 'Kawi Honey Filter Beans',
                        'item_status' => 'NORMAL',
                        'has_model' => false,
                        'image' => ['image_url_list' => ['https://example.com/img.jpg']],
                        'price_info' => [['current_price' => 65000]],
                        'stock_info_v2' => ['summary_info' => ['total_available_stock' => 10]],
                    ],
                ],
            ],
        ], 200),
    ]);

    $service = new ShopeeService($account);
    $service->syncProducts();

    $mapping = MarketplaceProductMapping::where('platform', 'shopee')
        ->where('marketplace_product_id', '991122')
        ->first();

    expect($mapping)->not->toBeNull();
    // Must remain UNCONNECTED!
    expect($mapping->product_id)->toBeNull();
    expect($mapping->product_variant_id)->toBeNull();
    expect($mapping->is_connected)->toBeFalse();
    expect($mapping->sync_status)->toBe('pending');
});
