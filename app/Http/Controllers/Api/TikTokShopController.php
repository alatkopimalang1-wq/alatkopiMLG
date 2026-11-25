<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\MarketplaceAccount;
use App\Services\TikTokShopService;
use Filament\Notifications\Notification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class TikTokShopController extends Controller
{
    /**
     * Handle OAuth callback from TikTok Shop seller authorization.
     */
    public function callback(Request $request): RedirectResponse
    {
        $code = $request->query('code');
        if (! $code) {
            Notification::make()
                ->title('Kode Otorisasi Tidak Ditemukan')
                ->body('TikTok Shop tidak mengirimkan kode otorisasi.')
                ->danger()
                ->send();

            return redirect('/admin/manage-tik-tok-shop-settings');
        }

        try {
            $service = new TikTokShopService();
            $service->requestAccessToken($code);

            Notification::make()
                ->title('Toko TikTok Shop Berhasil Terhubung!')
                ->body('Otorisasi toko TikTok Shop berhasil disimpan. Sinkronisasi aktif.')
                ->success()
                ->send();

            return redirect('/admin/manage-tik-tok-shop-settings');
        } catch (\Throwable $e) {
            Log::error('TikTok Shop OAuth callback error: ' . $e->getMessage());

            Notification::make()
                ->title('Gagal Otorisasi TikTok Shop')
                ->body($e->getMessage())
                ->danger()
                ->send();

            return redirect('/admin/manage-tik-tok-shop-settings');
        }
    }

    /**
     * Handle Webhook from TikTok Shop (Order status changes, inventory, etc.).
     */
    public function webhook(Request $request): JsonResponse
    {
        $event = $request->input('type') ?? $request->input('event');
        $data = $request->input('data') ?? [];

        Log::info('TikTok Shop Webhook received', [
            'type' => $event,
            'payload' => $request->all(),
        ]);

        try {
            \App\Services\MarketplaceStockSyncService::handleTikTokWebhook($request->all());
        } catch (\Throwable $e) {
            Log::warning('TikTok webhook stock sync error: ' . $e->getMessage());
        }

        // When order events arrive from TikTok, invalidate inbox cache so newest data is available
        if (in_array($event, [1, 2, 3, 'ORDER_STATUS_CHANGE', 'ORDER_PAID', 'PACKAGE_UPDATE'], true)) {
            \Illuminate\Support\Facades\Cache::forget('tts_inbox_orders_list');

            // Hanya perbarui status jika pesanan tersebut SEBELUMNYA SUDAH DISIMPAN MANUAL oleh admin
            $orderId = $data['order_id'] ?? null;
            if ($orderId && \App\Models\Order::where('order_number', "TTS-{$orderId}")->exists()) {
                try {
                    $service = new TikTokShopService();
                    $service->saveSingleTikTokOrder($orderId);
                } catch (\Throwable $e) {
                    Log::warning('TikTok Webhook order update error: ' . $e->getMessage());
                }
            }
        }

        return response()->json([
            'code' => 0,
            'message' => 'success',
        ]);
    }
}
