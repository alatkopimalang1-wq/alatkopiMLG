<?php

use App\Models\MarketplaceAccount;
use App\Models\MarketplaceProductMapping;
use App\Services\TikTokShopService;
use Illuminate\Support\Facades\Http;

beforeEach(function () {
    MarketplaceAccount::query()->delete();
    MarketplaceProductMapping::query()->delete();

    $this->account = MarketplaceAccount::create([
        'platform' => 'tiktok',
        'name' => 'TikTok Shop Sanubari',
        'app_key' => 'test_app_key',
        'app_secret' => 'test_app_secret',
        'access_token' => 'test_access_token',
        'refresh_token' => 'test_refresh_token',
        'shop_cipher' => 'test_shop_cipher',
        'access_token_expires_at' => now()->addDays(7),
        'is_active' => true,
    ]);
});

test('syncProductsFromTikTok correctly retrieves images and variant labels via batch detail', function () {
    Http::fake([
        'https://open-api.tiktokglobalshop.com/product/202309/products/search*' => Http::response([
            'code' => 0,
            'message' => 'Success',
            'data' => [
                'products' => [
                    [
                        'id' => '1001',
                        'title' => 'Denali Powder Drink',
                        'status' => 'ACTIVATE',
                        'skus' => [
                            [
                                'id' => '2001',
                                'seller_sku' => 'SKU-CHOCO',
                                'inventory' => [['quantity' => 15]],
                                'price' => ['sale_price' => '85000'],
                            ],
                            [
                                'id' => '2002',
                                'seller_sku' => 'SKU-TARO',
                                'inventory' => [['quantity' => 8]],
                                'price' => ['sale_price' => '90000'],
                            ],
                        ],
                    ],
                ],
                'next_page_token' => null,
            ],
        ]),
        'https://open-api.tiktokglobalshop.com/product/202309/products/1001*' => Http::response([
            'code' => 0,
            'message' => 'Success',
            'data' => [
                'id' => '1001',
                'title' => 'Denali Powder Drink',
                'main_images' => [
                    [
                        'urls' => ['https://img.tiktok.com/main_denali.jpg'],
                    ],
                ],
                'skus' => [
                    [
                        'id' => '2001',
                        'seller_sku' => 'SKU-CHOCO',
                        'sales_attributes' => [
                            [
                                'name' => 'Rasa',
                                'value_name' => 'Dark Cocoa',
                                'sku_img' => [
                                    'urls' => ['https://img.tiktok.com/sku_choco.jpg'],
                                ],
                            ],
                        ],
                    ],
                    [
                        'id' => '2002',
                        'seller_sku' => 'SKU-TARO',
                        'sales_attributes' => [
                            [
                                'name' => 'Rasa',
                                'value_name' => 'Sunny Taro',
                                'sku_img' => [
                                    'urls' => ['https://img.tiktok.com/sku_taro.jpg'],
                                ],
                            ],
                        ],
                    ],
                ],
            ],
        ]),
    ]);

    $service = new TikTokShopService($this->account);
    $result = $service->syncProductsFromTikTok();

    expect($result['total_products'])->toBe(1);
    expect($result['total_mapped'])->toBe(2);

    $mapping1 = MarketplaceProductMapping::where('marketplace_sku_id', '2001')->first();
    expect($mapping1)->not->toBeNull();
    expect($mapping1->marketplace_image_url)->toBe('https://img.tiktok.com/sku_choco.jpg');
    expect($mapping1->marketplace_sku_name)->toBe('Dark Cocoa');
    expect($mapping1->seller_sku)->toBe('SKU-CHOCO');
    expect($mapping1->product_id)->toBeNull(); // Keep unconnected until manually mapped

    $mapping2 = MarketplaceProductMapping::where('marketplace_sku_id', '2002')->first();
    expect($mapping2)->not->toBeNull();
    expect($mapping2->marketplace_image_url)->toBe('https://img.tiktok.com/sku_taro.jpg');
    expect($mapping2->marketplace_sku_name)->toBe('Sunny Taro');
    expect($mapping2->seller_sku)->toBe('SKU-TARO');
    expect($mapping2->product_id)->toBeNull();
});

test('subsequent sync preserves cached image and variant without calling detail endpoint', function () {
    MarketplaceProductMapping::create([
        'platform' => 'tiktok',
        'marketplace_product_id' => '1001',
        'marketplace_sku_id' => '2001',
        'marketplace_product_name' => 'Denali Powder Drink',
        'marketplace_image_url' => 'https://img.tiktok.com/sku_choco.jpg',
        'marketplace_sku_name' => 'Dark Cocoa',
        'marketplace_stock' => 10,
        'marketplace_price' => 85000,
        'marketplace_status' => 'ACTIVATE',
        'seller_sku' => 'SKU-CHOCO',
        'sync_status' => 'pending',
    ]);

    $detailEndpointCalled = false;

    Http::fake([
        'https://open-api.tiktokglobalshop.com/product/202309/products/search*' => Http::response([
            'code' => 0,
            'message' => 'Success',
            'data' => [
                'products' => [
                    [
                        'id' => '1001',
                        'title' => 'Denali Powder Drink Updated',
                        'status' => 'ACTIVATE',
                        'skus' => [
                            [
                                'id' => '2001',
                                'seller_sku' => 'SKU-CHOCO',
                                'inventory' => [['quantity' => 25]], // Updated stock
                                'price' => ['sale_price' => '88000'], // Updated price
                            ],
                        ],
                    ],
                ],
                'next_page_token' => null,
            ],
        ]),
        'https://open-api.tiktokglobalshop.com/product/202309/products/1001*' => function () use (&$detailEndpointCalled) {
            $detailEndpointCalled = true;
            return Http::response(['code' => 0, 'data' => []]);
        },
    ]);

    $service = new TikTokShopService($this->account);
    $result = $service->syncProductsFromTikTok();

    expect($result['total_products'])->toBe(1);
    expect($result['total_mapped'])->toBe(1);
    expect($detailEndpointCalled)->toBeFalse(); // Skipped because image and variant already cached

    $mapping = MarketplaceProductMapping::where('marketplace_sku_id', '2001')->first();
    expect($mapping->marketplace_stock)->toBe(25);
    expect((float) $mapping->marketplace_price)->toBe(88000.0);
    expect($mapping->marketplace_image_url)->toBe('https://img.tiktok.com/sku_choco.jpg');
    expect($mapping->marketplace_sku_name)->toBe('Dark Cocoa');
});

