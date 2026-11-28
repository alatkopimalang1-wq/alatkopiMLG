<?php

namespace App\Services;

use App\Models\Setting;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class WhatsAppService
{
    /**
     * Send OTP verification message to customer's WhatsApp number.
     */
    public static function sendOtp(string $phone, string $otp): bool
    {
        $message = "☕ *Alat Kopi Malang*\n\nKode OTP Verifikasi Masuk Anda:\n*{$otp}*\n\nGunakan kode ini untuk masuk ke akun Anda. Kode berlaku selama 10 menit.\n\n_Demi keamanan akun Anda, jangan bagikan kode ini kepada siapa pun._";

        return self::sendMessage($phone, $message);
    }

    /**
     * Send new order alert to admin / owner WhatsApp.
     */
    public static function sendNewOrderAlert(string $phone, \App\Models\Order $order): bool
    {
        if (! $order->relationLoaded('items')) {
            $order->load('items');
        }

        $isPickup = $order->shipping_service === 'PICKUP' || str_contains(strtoupper((string) $order->shipping_courier), 'AMBIL');
        $storeName = Setting::get('pickup_store_name', 'Alat Kopi Malang (Tlogomas, Malang)');
        $totalFormatted = number_format($order->total_amount, 0, ',', '.');
        $subtotalFormatted = number_format($order->subtotal, 0, ',', '.');
        $shippingFormatted = number_format($order->shipping_cost, 0, ',', '.');
        $createdAt = $order->created_at ? $order->created_at->setTimezone('Asia/Jakarta')->format('d M Y, H:i') : now()->format('d M Y, H:i');

        $msg = "🚨 *PESANAN BARU MASUK DARI WEBSITE!*\n";
        $msg .= "☕ *Alat Kopi Malang*\n";
        $msg .= "────────────────────────\n";
        $msg .= "🔖 *No. Pesanan:* #{$order->order_number}\n";
        $msg .= "📅 *Waktu:* {$createdAt} WIB\n";
        $msg .= "👤 *Pemesan:* {$order->customer_name}\n";
        $msg .= "📞 *No. WhatsApp:* {$order->customer_phone}\n";
        if (! empty($order->customer_email)) {
            $msg .= "📧 *Email:* {$order->customer_email}\n";
        }

        $msg .= "\n📦 *PENGIRIMAN & PENERIMAAN:*\n";
        if ($isPickup) {
            $msg .= "🏪 *Metode:* Ambil di Toko (Self Pick Up)\n";
            $msg .= "📍 *Lokasi Ambil:* {$storeName}\n";
            if (! empty($order->customer_notes)) {
                $msg .= "📝 *Catatan:* {$order->customer_notes}\n";
            }
        } else {
            $msg .= "📍 *Alamat:* {$order->customer_address}\n";
            $msg .= "🚚 *Kurir:* " . strtoupper((string) $order->shipping_courier) . " ({$order->shipping_service})\n";
            $msg .= "⚖️ *Berat:* " . number_format($order->total_weight_grams, 0, ',', '.') . " gr\n";
            if (! empty($order->customer_notes)) {
                $msg .= "📝 *Catatan:* {$order->customer_notes}\n";
            }
        }

        $msg .= "\n🛒 *DETAIL PRODUK:*\n";
        foreach ($order->items as $idx => $item) {
            $n = $idx + 1;
            $vLabel = \App\Support\VariantHelper::formatLabel($item->variant_label);
            $variantInfo = array_filter([$vLabel, $item->grind_option]);
            $variantStr = ! empty($variantInfo) ? ' (' . implode(' · ', $variantInfo) . ')' : '';
            $itemSubtotal = number_format($item->subtotal, 0, ',', '.');
            $msg .= "{$n}. *{$item->product_name}*{$variantStr}\n";
            $msg .= "   ↳ {$item->quantity}x @ Rp " . number_format($item->price, 0, ',', '.') . " = Rp {$itemSubtotal}\n";
            if (! empty($item->custom_notes)) {
                $msg .= "   ↳ Catatan: _{$item->custom_notes}_\n";
            }
        }

        $msg .= "\n💰 *RINGKASAN PEMBAYARAN:*\n";
        $msg .= "• Subtotal: Rp {$subtotalFormatted}\n";
        if ($order->shipping_cost > 0) {
            $msg .= "• Ongkir: Rp {$shippingFormatted}\n";
        }
        if ($order->unique_code > 0) {
            $msg .= "• Kode Unik: Rp {$order->unique_code}\n";
        }
        $msg .= "• *TOTAL: Rp {$totalFormatted}*\n";
        $msg .= "• Metode: " . strtoupper((string) $order->payment_method) . ($order->payment_channel ? " ({$order->payment_channel})" : '') . "\n";
        $msg .= "• Status Bayar: " . strtoupper((string) $order->payment_status) . "\n";

        $msg .= "────────────────────────\n";
        $msg .= "🔗 *Kelola di Dashboard Admin:*\n";
        $msg .= url('/admin/orders') . "\n";

        return self::sendMessage($phone, $msg);
    }

    /**
     * Send WhatsApp message via configured gateway (Fonnte, Wablas, or fallback log).
     */
    public static function sendMessage(string $phone, string $message): bool
    {
        $cleanPhone = preg_replace('/[^0-9]/', '', $phone);

        if (str_starts_with($cleanPhone, '0')) {
            $cleanPhone = '62'.substr($cleanPhone, 1);
        } elseif (! str_starts_with($cleanPhone, '62') && ! empty($cleanPhone)) {
            $cleanPhone = '62'.$cleanPhone;
        }

        $provider = Setting::get('whatsapp_gateway_provider', env('WHATSAPP_GATEWAY_PROVIDER', 'auto'));
        $token = Setting::get('whatsapp_gateway_token', env('WHATSAPP_GATEWAY_TOKEN', env('FONNTE_TOKEN')));

        // 1. Fonnte Provider (Standard Indonesian WhatsApp Gateway)
        if (! empty($token) && ($provider === 'fonnte' || $provider === 'auto')) {
            try {
                $response = Http::withHeaders([
                    'Authorization' => $token,
                ])->timeout(8)->post('https://api.fonnte.com/send', [
                    'target' => $cleanPhone,
                    'message' => $message,
                    'countryCode' => '62',
                ]);

                if ($response->successful()) {
                    Log::info("WhatsApp OTP sent successfully via Fonnte to +{$cleanPhone}");

                    return true;
                }

                Log::warning("Fonnte WhatsApp API error (status {$response->status()}): ".$response->body());
            } catch (\Throwable $e) {
                Log::error('Fonnte WhatsApp dispatch exception: '.$e->getMessage());
            }
        }

        // 2. Wablas Provider
        $wablasToken = Setting::get('wablas_token', env('WABLAS_TOKEN'));
        $wablasServer = Setting::get('wablas_server', env('WABLAS_SERVER', 'https://bdg.wablas.com'));
        if (! empty($wablasToken) && ($provider === 'wablas' || $provider === 'auto')) {
            try {
                $response = Http::withHeaders([
                    'Authorization' => $wablasToken,
                ])->timeout(8)->post(rtrim($wablasServer, '/').'/api/send-message', [
                    'phone' => $cleanPhone,
                    'message' => $message,
                ]);

                if ($response->successful()) {
                    Log::info("WhatsApp OTP sent successfully via Wablas to +{$cleanPhone}");

                    return true;
                }

                Log::warning("Wablas WhatsApp API error (status {$response->status()}): ".$response->body());
            } catch (\Throwable $e) {
                Log::error('Wablas WhatsApp dispatch exception: '.$e->getMessage());
            }
        }

        // 3. System Log (for local development or when gateway token is not yet configured)
        Log::info("[WhatsApp Gateway] OTP message sent to +{$cleanPhone}:\n".$message);

        return true;
    }

    /**
     * Check quota and connection status of WhatsApp gateway (Fonnte).
     *
     * @return array{success: bool, message?: string, provider?: string, device?: string, name?: string, status?: string, quota?: mixed, package?: string, expired?: string}
     */
    public static function checkQuota(?string $token = null): array
    {
        $token = $token ?: Setting::get('whatsapp_gateway_token', env('WHATSAPP_GATEWAY_TOKEN', env('FONNTE_TOKEN')));

        if (empty($token)) {
            return [
                'success' => false,
                'message' => 'API Token WhatsApp Gateway belum diisi. Masukkan token Anda terlebih dahulu lalu klik tombol ini lagi.',
            ];
        }

        try {
            // 1. Check Fonnte API: get-devices
            $response = Http::withHeaders([
                'Authorization' => $token,
            ])->timeout(10)->post('https://api.fonnte.com/get-devices');

            if ($response->successful()) {
                $body = $response->json();
                if (isset($body['status']) && $body['status'] === true && ! empty($body['data'])) {
                    $device = $body['data'][0] ?? [];

                    return [
                        'success' => true,
                        'provider' => 'Fonnte',
                        'device' => $device['device'] ?? '-',
                        'name' => $device['name'] ?? 'Sanubari',
                        'status' => $device['status'] ?? 'unknown',
                        'quota' => $device['quota'] ?? 0,
                        'package' => $device['package'] ?? 'Free',
                        'expired' => $device['expired'] ?? '-',
                    ];
                }
            }

            // 2. Fallback to /device endpoint
            $resAlt = Http::withHeaders([
                'Authorization' => $token,
            ])->timeout(10)->post('https://api.fonnte.com/device');

            if ($resAlt->successful()) {
                $body = $resAlt->json();
                if (isset($body['status']) && $body['status'] === true) {
                    return [
                        'success' => true,
                        'provider' => 'Fonnte',
                        'device' => $body['device'] ?? ($body['phone'] ?? '-'),
                        'name' => $body['name'] ?? 'Sanubari',
                        'status' => $body['device_status'] ?? ($body['status_device'] ?? ($body['status'] ?? 'connect')),
                        'quota' => $body['quota'] ?? ($body['messages'] ?? 'Tersedia'),
                        'package' => $body['package'] ?? 'Aktif',
                        'expired' => $body['expired'] ?? '-',
                    ];
                }
            }

            $errorMsg = $response->json('reason') ?? ($response->json('message') ?? 'Token tidak valid atau belum terhubung ke Fonnte.');

            return [
                'success' => false,
                'message' => 'Gagal menghubungi Fonnte: '.$errorMsg,
            ];
        } catch (\Throwable $e) {
            return [
                'success' => false,
                'message' => 'Terjadi kesalahan saat memeriksa kuota: '.$e->getMessage(),
            ];
        }
    }
}
