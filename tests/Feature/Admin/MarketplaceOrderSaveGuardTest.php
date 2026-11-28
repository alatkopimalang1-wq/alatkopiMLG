<?php

use App\Filament\Pages\PenerimaanPesananTikTok;
use App\Models\MarketplaceAccount;
use App\Models\MarketplaceProductMapping;
use App\Models\Order;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\User;
use App\Services\ShopeeService;
use App\Services\TikTokShopService;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Livewire\Livewire;

beforeEach(function () {
    Cache::flush();
});

test('service throws exception if marketplace order has no connected product', function () {
    MarketplaceAccount::create([
        'platform' => 'tiktok',
        'name' => 'TikTok Shop Test',
        'app_key' => 'testkey',
        'app_secret' => 'testsecret',
        'access_token' => 'testtoken',
        'shop_id' => 'tts_123',
        'shop_cipher' => 'cipher_123',
        'is_active' => true,
    ]);

    $orderData = [
        'id' => 'TTS-UNCONNECTED-99',
        'status' => 'AWAITING_SHIPMENT',
        'create_time' => now()->timestamp,
        'buyer_email' => 'buyer@test.com',
        'recipient_address' => [
            'name' => 'Pembeli Tanpa Hubungan',
            'phone' => '08123456789',
            'full_address' => 'Jl. Uji Coba 123',
        ],
        'line_items' => [
            [
                'product_id' => 'tts_prod_999',
                'sku_id' => 'tts_sku_999',
                'product_name' => 'Produk TikTok Belum Dimapping',
                'quantity' => 1,
                'sale_price' => 50000,
            ],
        ],
        'payment' => [
            'total_amount' => 50000,
            'original_shipping_fee' => 0,
        ],
    ];

    $service = new TikTokShopService();

    expect(fn () => $service->saveSingleTikTokOrder($orderData))
        ->toThrow(\Exception::class, 'belum memiliki produk yang terhubung ke katalog website');
});

test('penerimaan order mp blocks saveOrder when order has no connected product', function () {
    $user = User::factory()->create(['role' => 'admin']);
    $this->actingAs($user);

    $unconnectedOrderId = '587419441588110643';

    // Fake order in cache with current timestamp
    $fakeOrders = [
        [
            'id' => $unconnectedOrderId,
            'platform' => 'tiktok',
            'platform_label' => 'TikTok Shop',
            'platform_color' => 'gray',
            'status' => 'AWAITING_SHIPMENT',
            'status_label' => 'Siap dikirim',
            'status_color' => 'warning',
            'buyer_name' => 'Pembeli Uji',
            'buyer_phone' => '08123456789',
            'buyer_address' => 'Malang',
            'created_at_formatted' => now()->format('d M Y, H:i'),
            'create_time' => now()->timestamp,
            'items' => [
                [
                    'mapping_id' => null,
                    'product_id' => null,
                    'product_variant_id' => null,
                    'product_name' => 'Tatakan Moka Pot di Kompor',
                    'sku_name' => 'Default',
                    'seller_sku' => 'TTK-001',
                    'sku_image' => null,
                    'price' => 40602,
                    'quantity' => 1,
                    'subtotal' => 40602,
                    'item' => [
                        'product_id' => 'tts_p1',
                        'sku_id' => 'tts_s1',
                        'seller_sku' => 'TTK-001',
                    ],
                ],
            ],
            'total_amount' => 40602,
            'shipping_fee' => 0,
            'shipping_provider' => 'Standard shipping',
            'tracking_number' => 'JY2435283538',
            'payment_method' => 'COD',
            'is_saved' => false,
            'local_order_id' => null,
            'local_order_number' => null,
            'raw' => [],
        ],
    ];

    Cache::put('tts_inbox_orders_list', $fakeOrders, now()->addMinutes(10));

    Http::fake([
        '*shopeemobile.com*' => Http::response(['error' => '', 'response' => ['order_list' => []]], 200),
        '*tiktokshop.com*' => Http::response(['code' => 0, 'data' => ['orders' => []]], 200),
    ]);

    Livewire::test(PenerimaanPesananTikTok::class)
        ->assertSuccessful()
        ->assertSee('Belum Terhubung')
        ->assertDontSeeHtml('wire:click="saveOrder(\'' . $unconnectedOrderId . '\')')
        ->call('saveOrder', $unconnectedOrderId)
        ->assertNotified('Produk Belum Terhubung');

    // Make sure no order was created in DB
    expect(Order::where('marketplace_order_id', $unconnectedOrderId)->count())->toBe(0);
});

test('penerimaan order mp allows saveOrder when product is connected', function () {
    $user = User::factory()->create(['role' => 'admin']);
    $this->actingAs($user);

    $product = Product::create([
        'name' => 'Tatakan Moka Pot Asli',
        'slug' => 'tatakan-moka-pot-asli',
        'price' => 40602,
        'stock' => 20,
        'is_active' => true,
    ]);
    $variant = ProductVariant::create([
        'product_id' => $product->id,
        'label' => 'Hitam',
        'price' => 40602,
        'stock' => 20,
    ]);

    MarketplaceAccount::create([
        'platform' => 'tiktok',
        'name' => 'TikTok Shop Test',
        'app_key' => 'testkey',
        'app_secret' => 'testsecret',
        'access_token' => 'testtoken',
        'shop_id' => 'tts_123',
        'shop_cipher' => 'cipher_123',
        'is_active' => true,
    ]);

    MarketplaceProductMapping::create([
        'platform' => 'tiktok',
        'product_id' => $product->id,
        'product_variant_id' => $variant->id,
        'marketplace_product_id' => 'tts_p1',
        'marketplace_sku_id' => 'tts_s1',
        'marketplace_product_name' => 'Tatakan Moka Pot di Kompor',
        'marketplace_sku_name' => 'Default',
        'seller_sku' => 'TTK-001',
        'marketplace_stock' => 20,
        'marketplace_status' => 'ACTIVATE',
    ]);

    $connectedOrderId = '587419441588110999';

    $fakeOrders = [
        [
            'id' => $connectedOrderId,
            'platform' => 'tiktok',
            'platform_label' => 'TikTok Shop',
            'platform_color' => 'gray',
            'status' => 'AWAITING_SHIPMENT',
            'status_label' => 'Siap dikirim',
            'status_color' => 'warning',
            'buyer_name' => 'Pembeli Terhubung',
            'buyer_phone' => '08123456789',
            'buyer_address' => 'Malang',
            'created_at_formatted' => now()->format('d M Y, H:i'),
            'create_time' => now()->timestamp,
            'items' => [
                [
                    'mapping_id' => null,
                    'product_id' => $product->id,
                    'product_variant_id' => $variant->id,
                    'product_name' => 'Tatakan Moka Pot di Kompor',
                    'sku_name' => 'Default',
                    'seller_sku' => 'TTK-001',
                    'sku_image' => null,
                    'price' => 40602,
                    'quantity' => 1,
                    'subtotal' => 40602,
                    'item' => [
                        'product_id' => 'tts_p1',
                        'sku_id' => 'tts_s1',
                        'seller_sku' => 'TTK-001',
                    ],
                ],
            ],
            'total_amount' => 40602,
            'shipping_fee' => 0,
            'shipping_provider' => 'Standard shipping',
            'tracking_number' => 'JY2435283538',
            'payment_method' => 'COD',
            'is_saved' => false,
            'local_order_id' => null,
            'local_order_number' => null,
            'raw' => [
                'id' => $connectedOrderId,
                'status' => 'AWAITING_SHIPMENT',
                'create_time' => now()->timestamp,
                'recipient_address' => [
                    'name' => 'Pembeli Terhubung',
                    'phone' => '08123456789',
                    'full_address' => 'Malang',
                ],
                'line_items' => [
                    [
                        'product_id' => 'tts_p1',
                        'sku_id' => 'tts_s1',
                        'seller_sku' => 'TTK-001',
                        'product_name' => 'Tatakan Moka Pot di Kompor',
                        'quantity' => 1,
                        'sale_price' => 40602,
                    ],
                ],
                'payment' => [
                    'total_amount' => 40602,
                    'original_shipping_fee' => 0,
                ],
            ],
        ],
    ];

    Cache::put('tts_inbox_orders_list', $fakeOrders, now()->addMinutes(10));

    Http::fake([
        '*shopeemobile.com*' => Http::response(['error' => '', 'response' => ['order_list' => []]], 200),
        '*tiktokshop.com*' => Http::response(['code' => 0, 'data' => ['orders' => []]], 200),
    ]);

    Livewire::test(PenerimaanPesananTikTok::class)
        ->assertSuccessful()
        ->assertSeeHtml('wire:click="saveOrder(\'' . $connectedOrderId . '\')')
        ->call('saveOrder', $connectedOrderId)
        ->assertNotified('Pesanan Berhasil Disimpan');

    expect(Order::where('order_number', "TTS-{$connectedOrderId}")->count())->toBe(1);
});

test('saveAllUnsaved skips orders without connected products', function () {
    $user = User::factory()->create(['role' => 'admin']);
    $this->actingAs($user);

    $unconnectedOrderId = 'TTS-UNCONNECTED-01';

    $fakeOrders = [
        [
            'id' => $unconnectedOrderId,
            'platform' => 'tiktok',
            'platform_label' => 'TikTok Shop',
            'platform_color' => 'gray',
            'status' => 'AWAITING_SHIPMENT',
            'status_label' => 'Siap dikirim',
            'status_color' => 'warning',
            'buyer_name' => 'Pembeli Uji',
            'buyer_phone' => '08123456789',
            'buyer_address' => 'Malang',
            'created_at_formatted' => now()->format('d M Y, H:i'),
            'create_time' => now()->timestamp,
            'items' => [
                [
                    'mapping_id' => null,
                    'product_id' => null,
                    'product_variant_id' => null,
                    'product_name' => 'Produk Belum Dimapping',
                    'sku_name' => 'Default',
                    'seller_sku' => 'UNKNOWN-01',
                    'sku_image' => null,
                    'price' => 50000,
                    'quantity' => 1,
                    'subtotal' => 50000,
                    'item' => [
                        'product_id' => 'tts_unknown_p',
                        'sku_id' => 'tts_unknown_s',
                        'seller_sku' => 'UNKNOWN-01',
                    ],
                ],
            ],
            'total_amount' => 50000,
            'shipping_fee' => 0,
            'shipping_provider' => 'Standard shipping',
            'tracking_number' => 'JY9999999',
            'payment_method' => 'COD',
            'is_saved' => false,
            'local_order_id' => null,
            'local_order_number' => null,
            'raw' => [],
        ],
    ];

    Cache::put('tts_inbox_orders_list', $fakeOrders, now()->addMinutes(10));

    Http::fake([
        '*shopeemobile.com*' => Http::response(['error' => '', 'response' => ['order_list' => []]], 200),
        '*tiktokshop.com*' => Http::response(['code' => 0, 'data' => ['orders' => []]], 200),
    ]);

    Livewire::test(PenerimaanPesananTikTok::class)
        ->assertSuccessful()
        ->call('saveAllUnsaved')
        ->assertNotified('Tidak Ada Pesanan yang Dapat Disimpan');

    expect(Order::where('order_number', "TTS-{$unconnectedOrderId}")->count())->toBe(0);
});
