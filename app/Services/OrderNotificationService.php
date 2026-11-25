<?php

namespace App\Services;

use App\Mail\NewOrderAdminAlert;
use App\Models\Order;
use App\Models\Setting;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class OrderNotificationService
{
    /**
     * Send instant WhatsApp and Email notifications to admin/owner when a new order is placed.
     * Wrapped securely in try-catch so the customer checkout process is never interrupted.
     */
    public static function notifyAdminNewOrder(Order $order): void
    {
        // Ensure order items are loaded
        if (! $order->relationLoaded('items')) {
            $order->load(['items.product', 'items.variant']);
        }

        // 1. WhatsApp Alert
        try {
            $isWaEnabled = (bool) Setting::get('admin_notification_wa_enabled', true);
            if ($isWaEnabled) {
                $targetPhone = Setting::get('admin_notification_whatsapp');
                if (empty($targetPhone)) {
                    $targetPhone = Setting::get('whatsapp', '6285121930454');
                }

                if (! empty($targetPhone)) {
                    WhatsAppService::sendNewOrderAlert($targetPhone, $order);
                    Log::info("WhatsApp alert pesanan #{$order->order_number} dikirim ke {$targetPhone}");
                }
            }
        } catch (\Throwable $e) {
            Log::error("Gagal mengirim WhatsApp alert untuk pesanan #{$order->order_number}: " . $e->getMessage());
        }

        // 2. Email Alert
        try {
            $isEmailEnabled = (bool) Setting::get('admin_notification_email_enabled', true);
            if ($isEmailEnabled) {
                $targetEmail = Setting::get('admin_notification_email');
                if (empty($targetEmail)) {
                    $targetEmail = Setting::get('email', 'halo@sanubariroastery.id');
                }

                if (! empty($targetEmail)) {
                    Mail::to($targetEmail)->send(new NewOrderAdminAlert($order));
                    Log::info("Email alert pesanan #{$order->order_number} dikirim ke {$targetEmail}");
                }
            }
        } catch (\Throwable $e) {
            Log::error("Gagal mengirim Email alert untuk pesanan #{$order->order_number}: " . $e->getMessage());
        }
    }
}
