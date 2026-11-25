<?php

use App\Mail\NewOrderAdminAlert;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\Setting;
use App\Services\OrderNotificationService;
use App\Services\WhatsAppService;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Mail;

beforeEach(function () {
    Mail::fake();
    Http::fake();
});

test('order notification service sends email and whatsapp alert to admin', function () {
    Setting::set('admin_notification_wa_enabled', true);
    Setting::set('admin_notification_whatsapp', '6282132095241');
    Setting::set('admin_notification_email_enabled', true);
    Setting::set('admin_notification_email', 'admin@sanubariroastery.id');

    $order = Order::create([
        'order_number' => Order::generateOrderNumber(),
        'customer_name' => 'Budi Santoso',
        'customer_phone' => '081234567890',
        'customer_email' => 'budi@example.com',
        'customer_address' => 'Jl. Ijen No. 10, Malang',
        'shipping_courier' => 'jne',
        'shipping_service' => 'REG',
        'shipping_cost' => 12000,
        'total_weight_grams' => 500,
        'payment_method' => 'bank_transfer',
        'payment_channel' => 'BCA',
        'subtotal' => 150000,
        'total_amount' => 162000,
        'status' => 'pending',
        'payment_status' => 'pending',
    ]);

    OrderItem::create([
        'order_id' => $order->id,
        'product_name' => 'Arabika Flores Bajawa',
        'variant_label' => '250 gr',
        'grind_option' => 'Biji Utuh',
        'price' => 75000,
        'quantity' => 2,
        'subtotal' => 150000,
    ]);

    OrderNotificationService::notifyAdminNewOrder($order);

    // Verify email sent
    Mail::assertSent(NewOrderAdminAlert::class, function ($mail) use ($order) {
        return $mail->hasTo('admin@sanubariroastery.id')
            && $mail->order->id === $order->id;
    });
});
