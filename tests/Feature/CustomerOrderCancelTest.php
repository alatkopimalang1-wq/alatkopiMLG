<?php

use App\Models\Order;

test('customer can cancel pending unpaid order without payment proof', function () {
    $order = Order::create([
        'order_number' => 'SNB-TEST-CANCEL-1',
        'customer_name' => 'Budi',
        'customer_phone' => '081234567890',
        'customer_address' => 'Malang',
        'shipping_courier' => 'J&T',
        'shipping_cost' => 10000,
        'payment_method' => 'qris',
        'payment_status' => 'pending',
        'status' => 'pending',
        'subtotal' => 50000,
        'total_amount' => 60000,
    ]);

    expect($order->canBeCancelledByCustomer())->toBeTrue();

    $response = $this->post(route('orders.cancel', ['orderNumber' => $order->order_number]), [
        'reason' => 'Salah pilih varian',
    ]);

    $response->assertRedirect();
    $response->assertSessionHas('success');

    $order->refresh();
    expect($order->status)->toBe('cancelled')
        ->and($order->payment_status)->toBe('cancelled')
        ->and($order->payment_details['cancel_reason'])->toBe('Salah pilih varian')
        ->and($order->canBeCancelledByCustomer())->toBeFalse();
});

test('customer cannot cancel order after uploading payment proof or verifying payment', function () {
    $order = Order::create([
        'order_number' => 'SNB-TEST-CANCEL-2',
        'customer_name' => 'Budi',
        'customer_phone' => '081234567890',
        'customer_address' => 'Malang',
        'shipping_courier' => 'J&T',
        'shipping_cost' => 10000,
        'payment_method' => 'qris',
        'payment_status' => 'verifying',
        'payment_proof' => 'payment-proofs/sample.jpg',
        'status' => 'pending',
        'subtotal' => 50000,
        'total_amount' => 60000,
    ]);

    expect($order->canBeCancelledByCustomer())->toBeFalse();

    $response = $this->post(route('orders.cancel', ['orderNumber' => $order->order_number]));

    $response->assertRedirect();
    $response->assertSessionHas('error');

    $order->refresh();
    expect($order->status)->toBe('pending')
        ->and($order->payment_status)->toBe('verifying');
});

test('customer cannot cancel order when payment is paid or status is processing by roaster', function () {
    $paidOrder = Order::create([
        'order_number' => 'SNB-TEST-CANCEL-3',
        'customer_name' => 'Budi',
        'customer_phone' => '081234567890',
        'customer_address' => 'Malang',
        'shipping_courier' => 'J&T',
        'shipping_cost' => 10000,
        'payment_method' => 'qris',
        'payment_status' => 'paid',
        'status' => 'pending',
        'subtotal' => 50000,
        'total_amount' => 60000,
    ]);

    $processingOrder = Order::create([
        'order_number' => 'SNB-TEST-CANCEL-4',
        'customer_name' => 'Budi',
        'customer_phone' => '081234567890',
        'customer_address' => 'Malang',
        'shipping_courier' => 'J&T',
        'shipping_cost' => 10000,
        'payment_method' => 'qris',
        'payment_status' => 'pending',
        'status' => 'processing',
        'subtotal' => 50000,
        'total_amount' => 60000,
    ]);

    expect($paidOrder->canBeCancelledByCustomer())->toBeFalse()
        ->and($processingOrder->canBeCancelledByCustomer())->toBeFalse();

    $this->post(route('orders.cancel', ['orderNumber' => $paidOrder->order_number]))->assertSessionHas('error');
    $this->post(route('orders.cancel', ['orderNumber' => $processingOrder->order_number]))->assertSessionHas('error');

    expect($paidOrder->fresh()->status)->toBe('pending')
        ->and($processingOrder->fresh()->status)->toBe('processing');
});
