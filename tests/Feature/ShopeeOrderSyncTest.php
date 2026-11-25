<?php

use App\Filament\Pages\PenerimaanPesananTikTok;
use App\Models\MarketplaceAccount;
use App\Models\MarketplaceProductMapping;
use App\Models\Order;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\User;
use App\Services\ShopeeService;
use Illuminate\Support\Facades\Http;
use Livewire\Livewire;

test('shopee service can fetch raw shopee orders and format them correctly', function () {
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

    Http::fake([
        '*order/get_order_list*' => Http::response([
            'error' => '',
            'message' => '',
            'response' => [
                'more' => false,
                'next_cursor' => '',
                'order_list' => [
                    [
                        'order_sn' => '241125TEST01',
                        'order_status' => 'READY_TO_SHIP',
                    ],
                ],
            ],
        ], 200),
        '*order/get_order_detail*' => Http::response([
            'error' => '',
            'message' => '',
            'response' => [
                'order_list' => [
                    [
                        'order_sn' => '241125TEST01',
                        'order_status' => 'READY_TO_SHIP',
                        'create_time' => now()->timestamp,
                        'buyer_username' => 'buyer_test_shopee',
                        'recipient_address' => [
                            'name' => 'Budi Santoso',
                            'phone' => '08123456789',
                            'full_address' => 'Jl. Kawi No. 1, Kota Malang',
                        ],
                        'item_list' => [
                            [
                                'item_id' => 12345,
                                'item_name' => 'Kawi Honey Filter Beans',
                                'model_id' => 67890,
                                'model_name' => '200 gr',
                                'model_sku' => 'SNB-54-200',
                                'model_quantity_purchased' => 2,
                                'model_discounted_price' => 65000,
                            ],
                        ],
                        'shipping_carrier' => 'J&T Express',
                        'tracking_number' => 'JT99887766',
                        'payment_method' => 'ShopeePay',
                        'total_amount' => 145000,
                        'actual_shipping_fee' => 15000,
                        'note' => 'Tolong kirim fresh roast ya',
                    ],
                ],
            ],
        ], 200),
    ]);

    $service = new ShopeeService($account);
    $orders = $service->getRawShopeeOrders(0, true);

    expect($orders)->toBeArray();
    expect(count($orders))->toBe(1);
    expect($orders[0]['id'])->toBe('241125TEST01');
    expect($orders[0]['platform'])->toBe('shopee');
    expect($orders[0]['platform_label'])->toBe('Shopee');
    expect($orders[0]['buyer_name'])->toBe('Budi Santoso');
    expect($orders[0]['status_label'])->toBe('Siap dikirim');
    expect($orders[0]['total_amount'])->toBe(145000.0);
    expect(count($orders[0]['items']))->toBe(1);
});

test('shopee service can save single shopee order into local orders and items', function () {
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

    $product = Product::create([
        'name' => 'Kawi Honey Filter Beans',
        'slug' => 'kawi-honey-filter-beans',
        'min_price' => 50000,
        'max_price' => 100000,
        'stock' => 300,
        'status' => 'active',
        'channel' => 'all',
    ]);

    $variant = ProductVariant::create([
        'product_id' => $product->id,
        'label' => '200 gr',
        'weight_grams' => 200,
        'price' => 65000,
        'stock' => 300,
    ]);

    MarketplaceProductMapping::create([
        'platform' => 'shopee',
        'product_id' => $product->id,
        'product_variant_id' => $variant->id,
        'marketplace_product_id' => '12345',
        'marketplace_sku_id' => '67890',
        'marketplace_product_name' => 'Kawi Honey Filter Beans',
        'marketplace_sku_name' => '200 gr',
        'marketplace_stock' => 300,
        'is_active' => true,
        'marketplace_status' => 'ACTIVATE',
    ]);

    $orderData = [
        'order_sn' => '241125TEST02',
        'order_status' => 'READY_TO_SHIP',
        'create_time' => 1732500000,
        'buyer_username' => 'buyer_test_shopee',
        'recipient_address' => [
            'name' => 'Siti Rahma',
            'phone' => '08987654321',
            'full_address' => 'Jl. Ijen No. 10, Malang',
        ],
        'item_list' => [
            [
                'item_id' => 12345,
                'item_name' => 'Kawi Honey Filter Beans',
                'model_id' => 67890,
                'model_name' => '200 gr',
                'model_sku' => 'SNB-54-200',
                'model_quantity_purchased' => 1,
                'model_discounted_price' => 65000,
            ],
        ],
        'shipping_carrier' => 'SiCepat',
        'tracking_number' => 'SC123456789',
        'payment_method' => 'ShopeePay',
        'total_amount' => 75000,
        'actual_shipping_fee' => 10000,
        'note' => 'Biji utuh ya',
    ];

    $service = new ShopeeService($account);
    $savedOrder = $service->saveSingleShopeeOrder($orderData);

    expect($savedOrder)->toBeInstanceOf(Order::class);
    expect($savedOrder->order_number)->toBe('SP-241125TEST02');
    expect($savedOrder->customer_name)->toBe('Siti Rahma');
    expect($savedOrder->status)->toBe('processing');
    expect((float) $savedOrder->total_amount)->toBe(75000.0);
    expect($savedOrder->items()->count())->toBe(1);
    expect($savedOrder->items()->first()->product_id)->toBe($product->id);
    expect($savedOrder->items()->first()->product_variant_id)->toBe($variant->id);
});

test('penerimaan order mp page mounts and renders shopee filter', function () {
    $user = User::factory()->create(['role' => 'admin']);
    $this->actingAs($user);

    Http::fake([
        '*shopeemobile.com*' => Http::response(['error' => '', 'response' => ['order_list' => []]], 200),
        '*tiktokshop.com*' => Http::response(['code' => 0, 'data' => ['orders' => []]], 200),
    ]);

    Livewire::test(PenerimaanPesananTikTok::class)
        ->assertSuccessful()
        ->assertSee('Penerimaan Order MP')
        ->assertSee('Shopee')
        ->assertSee('TikTok Shop')
        ->set('platformFilter', 'shopee')
        ->assertSet('platformFilter', 'shopee')
        ->set('platformFilter', 'tiktok')
        ->assertSet('platformFilter', 'tiktok');
});
