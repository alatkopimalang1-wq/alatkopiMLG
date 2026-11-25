<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\ShopeeService;
use Filament\Notifications\Notification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class ShopeeController extends Controller
{
    /**
     * Handle OAuth callback from Shopee seller authorization.
     */
    public function callback(Request $request): RedirectResponse
    {
        Log::info('Shopee OAuth callback received:', [
            'query' => $request->query(),
            'url' => $request->fullUrl(),
        ]);

        if ($request->has('error')) {
            $error = (string) $request->query('error');
            $msg = (string) $request->query('message', $error);
            Log::warning("Shopee OAuth callback returned error: {$error} - {$msg}");

            Notification::make()
                ->title('Otorisasi Shopee Ditolak / Gagal')
                ->body("Shopee: {$msg}")
                ->danger()
                ->send();

            return redirect('/admin/manage-shopee-settings');
        }

        $code = $request->query('code');
        $shopId = $request->query('shop_id');
        $mainAccountId = $request->query('main_account_id');
        $targetId = $shopId ?: $mainAccountId;

        if (! $code || ! $targetId) {
            Log::warning('Shopee callback missing code or id:', $request->query());

            Notification::make()
                ->title('Kode Otorisasi Tidak Ditemukan')
                ->body('Shopee tidak mengirimkan code atau shop_id otorisasi. Pastikan proses login dan klik tombol "Konfirmasi Otorisasi" di halaman Shopee diselesaikan hingga selesai.')
                ->danger()
                ->send();

            return redirect('/admin/manage-shopee-settings');
        }

        try {
            $isMainAccount = empty($shopId) && ! empty($mainAccountId);
            $service = new ShopeeService();
            $service->requestAccessToken($code, $targetId, $isMainAccount);

            Notification::make()
                ->title('Toko Shopee Berhasil Terhubung!')
                ->body("Otorisasi toko Shopee (ID: {$targetId}) berhasil disimpan. Sinkronisasi aktif.")
                ->success()
                ->send();

            return redirect('/admin/manage-shopee-settings');
        } catch (\Throwable $e) {
            Log::error('Shopee OAuth callback error: ' . $e->getMessage());

            Notification::make()
                ->title('Gagal Otorisasi Shopee')
                ->body($e->getMessage())
                ->danger()
                ->send();

            return redirect('/admin/manage-shopee-settings');
        }
    }

    /**
     * Handle Webhook from Shopee Open Platform.
     */
    public function webhook(Request $request): JsonResponse
    {
        Log::info('Shopee webhook received:', $request->all());

        try {
            \App\Services\MarketplaceStockSyncService::handleShopeeWebhook($request->all());
        } catch (\Throwable $e) {
            Log::warning('Shopee webhook error: ' . $e->getMessage());
        }

        return response()->json([
            'code' => 0,
            'message' => 'success',
        ]);
    }
}
