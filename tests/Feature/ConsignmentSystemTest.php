<?php

use App\Models\ConsignmentSettlement;
use App\Models\Consignor;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('consignor can be created with default commission', function () {
    $consignor = Consignor::create([
        'name' => 'Artisan Pottery Malang',
        'code' => 'KNS-001',
        'phone' => '081234567890',
        'bank_name' => 'BCA',
        'bank_account_number' => '1234567890',
        'bank_account_holder' => 'Budi Santoso',
        'default_commission_type' => 'percentage',
        'default_commission_rate' => 25.00,
        'is_active' => true,
    ]);

    expect($consignor->exists)->toBeTrue()
        ->and($consignor->name)->toBe('Artisan Pottery Malang')
        ->and($consignor->bank_formatted)->toContain('BCA - 1234567890')
        ->and($consignor->default_commission_rate)->toBe(25.0);
});

test('product consignment split calculates percentage and fixed price correctly', function () {
    $consignor = Consignor::create([
        'name' => 'Roastery Partner',
        'default_commission_rate' => 20.00,
    ]);

    // Product with 20% percentage commission
    $prodPercentage = Product::create([
        'name' => 'Cangkir Keramik Artisanal',
        'slug' => 'cangkir-keramik-artisanal',
        'series' => 'alat-kopi',
        'min_price' => 100000,
        'is_consignment' => true,
        'consignor_id' => $consignor->id,
        'consignment_commission_type' => 'percentage',
        'consignment_commission_rate' => 20.00,
        'stock' => 10,
    ]);

    $splitPercent = $prodPercentage->calculateConsignmentSplit(100000);
    expect($splitPercent['store_commission'])->toBe(20000.0)
        ->and($splitPercent['vendor_payout'])->toBe(80000.0);

    // Product with fixed vendor payout (Rp 75.000 net to vendor)
    $prodFixed = Product::create([
        'name' => 'Kopi Titipan Premium 200g',
        'slug' => 'kopi-titipan-premium-200g',
        'series' => 'beans',
        'min_price' => 110000,
        'is_consignment' => true,
        'consignor_id' => $consignor->id,
        'consignment_commission_type' => 'fixed_cost',
        'consignment_payout_price' => 75000,
        'stock' => 5,
    ]);

    $splitFixed = $prodFixed->calculateConsignmentSplit(110000);
    expect($splitFixed['vendor_payout'])->toBe(75000.0)
        ->and($splitFixed['store_commission'])->toBe(35000.0);
});

test('order item stores consignment payout snapshot and can be settled', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    $consignor = Consignor::create([
        'name' => 'Mitra Roaster X',
        'default_commission_rate' => 15.00,
    ]);

    $product = Product::create([
        'name' => 'Manual Dripper Keramik',
        'slug' => 'manual-dripper-keramik',
        'series' => 'alat-kopi',
        'min_price' => 200000,
        'is_consignment' => true,
        'consignor_id' => $consignor->id,
        'consignment_commission_type' => 'percentage',
        'consignment_commission_rate' => 15.00,
        'stock' => 10,
    ]);

    $variant = ProductVariant::create([
        'product_id' => $product->id,
        'label' => 'Standard',
        'price' => 200000,
        'stock' => 10,
    ]);

    $order = Order::create([
        'order_number' => 'POS-20261128-001',
        'customer_name' => 'Pembeli di Toko',
        'customer_phone' => '08123456789',
        'customer_address' => 'Toko Fisik',
        'payment_method' => 'cash',
        'payment_status' => 'paid',
        'status' => 'completed',
        'total_amount' => 400000,
        'subtotal' => 400000,
    ]);

    $split = $product->calculateConsignmentSplit(200000, $variant);

    $orderItem = OrderItem::create([
        'order_id' => $order->id,
        'product_id' => $product->id,
        'product_variant_id' => $variant->id,
        'product_name' => $product->name,
        'variant_label' => $variant->label,
        'price' => 200000,
        'quantity' => 2,
        'subtotal' => 400000,
        'is_consignment' => true,
        'consignor_id' => $consignor->id,
        'consignment_vendor_payout' => $split['vendor_payout'],
        'consignment_store_commission' => $split['store_commission'],
    ]);

    expect($orderItem->is_consignment)->toBeTrue()
        ->and($orderItem->consignor_id)->toBe($consignor->id)
        ->and((float) $orderItem->consignment_vendor_payout)->toBe(170000.0)
        ->and((float) $orderItem->consignment_store_commission)->toBe(30000.0);

    // Create settlement for this consignor
    $settlement = ConsignmentSettlement::create([
        'settlement_number' => ConsignmentSettlement::generateSettlementNumber(),
        'consignor_id' => $consignor->id,
        'period_start' => now()->startOfMonth()->toDateString(),
        'period_end' => now()->toDateString(),
        'total_items_sold' => 2,
        'total_gross_sales' => 400000,
        'total_vendor_payout' => 340000,
        'total_store_commission' => 60000,
        'status' => 'paid',
        'user_id' => $admin->id,
        'paid_at' => now(),
    ]);

    expect($settlement->settlement_number)->toStartWith('SET-KNS-')
        ->and($settlement->total_vendor_payout)->toBe(340000.0)
        ->and($settlement->total_store_commission)->toBe(60000.0);

    // Test print route
    $response = $this->actingAs($admin)->get(route('admin.consignment-settlements.print', $settlement));
    $response->assertOk();
    $response->assertSee('Nota Rekap Konsinyasi');
    $response->assertSee('Mitra Roaster X');
});
