<?php

namespace App\Filament\Pages;

use App\Services\ShopeeService;
use App\Services\TikTokShopService;
use BackedEnum;
use Carbon\Carbon;
use Filament\Notifications\Notification;
use Filament\Pages\Page;
use Filament\Support\Icons\Heroicon;
use Illuminate\Support\Facades\Cache;

class PenerimaanPesananTikTok extends Page
{
    public const INBOX_START_DATE = '2026-11-25 00:00:00';

    public static function getInboxStartTimestamp(): int
    {
        return Carbon::parse(self::INBOX_START_DATE)->timestamp;
    }

    public static function getInboxDays(): int
    {
        $days = (int) Carbon::parse(self::INBOX_START_DATE)->startOfDay()->diffInDays(now()->startOfDay());

        return max(0, min($days, 14));
    }
    protected static string|BackedEnum|null $navigationIcon = Heroicon::InboxArrowDown;

    protected static string|\UnitEnum|null $navigationGroup = 'Katalog & Toko';

    protected static ?string $navigationLabel = 'Penerimaan Order MP';

    protected static ?string $title = 'Penerimaan Order MP';

    protected static ?string $slug = 'penerimaan-pesanan-tiktok';

    protected static ?int $navigationSort = 5;

    public function getHeading(): string
    {
        return '';
    }

    public function getBreadcrumbs(): array
    {
        return [];
    }

    protected string $view = 'filament.pages.penerimaan-pesanan-tiktok';

    public string $activeTab = 'all'; // all, unsaved, awaiting_shipment, in_transit, completed, unpaid, cancelled

    public string $platformFilter = 'all'; // all, shopee, tiktok

    public string $search = '';

    public ?string $selectedOrderId = null;

    public bool $isDrawerOpen = false;

    public ?string $errorMessage = null;

    public ?string $lastSyncTime = null;

    public function mount(): void
    {
        $this->lastSyncTime = now()->format('d M Y, H:i');
    }

    public function getOrdersProperty(): array
    {
        $orders = [];
        $errors = [];
        $minTimestamp = self::getInboxStartTimestamp();
        $days = self::getInboxDays();

        // 1. TikTok Shop
        try {
            $service = new TikTokShopService();
            $ttsOrders = $service->getRawTikTokOrders($days, false);
            $orders = array_merge($orders, $ttsOrders);
        } catch (\Throwable $e) {
            $errors[] = 'TikTok Shop: ' . $e->getMessage();
        }

        // 2. Shopee
        try {
            $shopeeService = new ShopeeService();
            $shopeeOrders = $shopeeService->getRawShopeeOrders($days, false);
            $orders = array_merge($orders, $shopeeOrders);
        } catch (\Throwable $e) {
            $errors[] = 'Shopee: ' . $e->getMessage();
        }

        if (! empty($errors) && empty($orders)) {
            $this->errorMessage = implode(' | ', $errors);
        } else {
            $this->errorMessage = null;
        }

        // Filter: Hanya pesanan masuk mulai 25 Nov 2026 (00:00:00) dan seterusnya
        $orders = array_values(array_filter($orders, fn ($o) => ! empty($o['create_time']) && $o['create_time'] >= $minTimestamp));

        // Sort by create_time DESC
        usort($orders, fn ($a, $b) => ($b['create_time'] ?? 0) <=> ($a['create_time'] ?? 0));

        return $orders;
    }

    public function getStatsProperty(): array
    {
        $orders = $this->orders;

        // If platform filter is active, calculate stats for that platform
        if ($this->platformFilter !== 'all') {
            $orders = array_filter($orders, fn ($o) => ($o['platform'] ?? 'tiktok') === $this->platformFilter);
        }

        $stats = [
            'all' => count($orders),
            'unsaved' => 0,
            'awaiting_shipment' => 0,
            'in_transit' => 0,
            'completed' => 0,
            'unpaid' => 0,
            'cancelled' => 0,
            'count_all_platform' => count($this->orders),
            'count_tiktok' => count(array_filter($this->orders, fn ($o) => ($o['platform'] ?? 'tiktok') === 'tiktok')),
            'count_shopee' => count(array_filter($this->orders, fn ($o) => ($o['platform'] ?? 'tiktok') === 'shopee')),
        ];

        foreach ($orders as $o) {
            if (empty($o['is_saved'])) {
                $stats['unsaved']++;
            }
            $st = $o['status'] ?? '';
            if (in_array($st, ['AWAITING_SHIPMENT', 'AWAITING_COLLECTION', 'READY_TO_SHIP', 'PROCESSED'])) {
                $stats['awaiting_shipment']++;
            } elseif (in_array($st, ['IN_TRANSIT', 'DELIVERING', 'SHIPPED'])) {
                $stats['in_transit']++;
            } elseif (in_array($st, ['DELIVERED', 'COMPLETED'])) {
                $stats['completed']++;
            } elseif ($st === 'UNPAID') {
                $stats['unpaid']++;
            } elseif (in_array($st, ['CANCELLED', 'IN_CANCEL'])) {
                $stats['cancelled']++;
            }
        }

        return $stats;
    }

    public function getFilteredOrdersProperty(): array
    {
        $orders = $this->orders;

        return array_filter($orders, function ($o) {
            // Platform filter
            if ($this->platformFilter !== 'all' && ($o['platform'] ?? 'tiktok') !== $this->platformFilter) {
                return false;
            }

            // Tab filter
            if ($this->activeTab === 'unsaved' && ! empty($o['is_saved'])) {
                return false;
            }
            if ($this->activeTab === 'awaiting_shipment' && ! in_array($o['status'], ['AWAITING_SHIPMENT', 'AWAITING_COLLECTION', 'READY_TO_SHIP', 'PROCESSED'])) {
                return false;
            }
            if ($this->activeTab === 'in_transit' && ! in_array($o['status'], ['IN_TRANSIT', 'DELIVERING', 'SHIPPED'])) {
                return false;
            }
            if ($this->activeTab === 'completed' && ! in_array($o['status'], ['DELIVERED', 'COMPLETED'])) {
                return false;
            }
            if ($this->activeTab === 'unpaid' && $o['status'] !== 'UNPAID') {
                return false;
            }
            if ($this->activeTab === 'cancelled' && ! in_array($o['status'], ['CANCELLED', 'IN_CANCEL'])) {
                return false;
            }

            // Search filter
            if (! empty($this->search)) {
                $q = strtolower(trim($this->search));
                $matchId = str_contains(strtolower($o['id'] ?? ''), $q);
                $matchBuyer = str_contains(strtolower($o['buyer_name'] ?? ''), $q);
                $matchTracking = str_contains(strtolower($o['tracking_number'] ?? ''), $q);
                $matchItem = false;
                foreach ($o['items'] ?? [] as $it) {
                    if (str_contains(strtolower($it['product_name'] ?? ''), $q) || str_contains(strtolower($it['sku_name'] ?? ''), $q) || str_contains(strtolower($it['seller_sku'] ?? ''), $q)) {
                        $matchItem = true;
                        break;
                    }
                }
                return $matchId || $matchBuyer || $matchTracking || $matchItem;
            }

            return true;
        });
    }

    public function getSelectedOrderProperty(): ?array
    {
        if (! $this->selectedOrderId) {
            return null;
        }

        foreach ($this->orders as $o) {
            if ((string) $o['id'] === (string) $this->selectedOrderId) {
                return $o;
            }
        }

        return null;
    }

    public function refreshOrders(): void
    {
        $messages = [];
        $errors = [];
        $minTimestamp = self::getInboxStartTimestamp();
        $days = self::getInboxDays();

        // 1. TikTok Shop
        try {
            $service = new TikTokShopService();
            $ttsOrders = $service->getRawTikTokOrders($days, true);
            $ttsFiltered = array_values(array_filter($ttsOrders, fn ($o) => ! empty($o['create_time']) && $o['create_time'] >= $minTimestamp));
            $messages[] = 'TikTok: ' . count($ttsFiltered) . ' pesanan.';
        } catch (\Throwable $e) {
            $errors[] = 'TikTok Shop: ' . $e->getMessage();
        }

        // 2. Shopee
        try {
            $shopeeService = new ShopeeService();
            $shopeeOrders = $shopeeService->getRawShopeeOrders($days, true);
            $shopeeFiltered = array_values(array_filter($shopeeOrders, fn ($o) => ! empty($o['create_time']) && $o['create_time'] >= $minTimestamp));
            $messages[] = 'Shopee: ' . count($shopeeFiltered) . ' pesanan.';
        } catch (\Throwable $e) {
            $errors[] = 'Shopee: ' . $e->getMessage();
        }

        $this->lastSyncTime = now()->format('d M Y, H:i');

        if (! empty($errors) && empty($messages)) {
            $this->errorMessage = implode(' | ', $errors);
            Notification::make()
                ->title('Gagal Menarik Pesanan Marketplace')
                ->body($this->errorMessage)
                ->danger()
                ->send();
        } else {
            $this->errorMessage = ! empty($errors) ? implode(' | ', $errors) : null;
            Notification::make()
                ->title('Pesanan Marketplace Diperbarui')
                ->body('Berhasil menarik data pesanan mulai 25 Nov 2026: ' . implode(', ', $messages) . (! empty($errors) ? ' (Catatan: ' . implode('; ', $errors) . ')' : ''))
                ->success()
                ->send();
        }
    }

    public function setTab(string $tab): void
    {
        $this->activeTab = $tab;
    }

    public function setPlatformFilter(string $platform): void
    {
        $this->platformFilter = $platform;
    }

    public function openDrawer(string $orderId): void
    {
        $this->selectedOrderId = $orderId;
        $this->isDrawerOpen = true;
    }

    public function closeDrawer(): void
    {
        $this->isDrawerOpen = false;
        $this->selectedOrderId = null;
    }

    public function saveOrder(string $orderId): void
    {
        try {
            $order = collect($this->orders)->firstWhere('id', $orderId);
            $platform = $order['platform'] ?? 'tiktok';

            if ($platform === 'shopee') {
                $service = new ShopeeService();
                $service->saveSingleShopeeOrder($orderId);
                $label = "Pesanan Shopee #SP-{$orderId}";
            } else {
                $service = new TikTokShopService();
                $service->saveSingleTikTokOrder($orderId);
                $label = "Pesanan TikTok #TTS-{$orderId}";
            }

            Notification::make()
                ->title('Pesanan Berhasil Disimpan')
                ->body("{$label} berhasil disimpan ke pesanan website.")
                ->success()
                ->send();
        } catch (\Throwable $e) {
            Notification::make()
                ->title('Gagal Menyimpan Pesanan')
                ->body($e->getMessage())
                ->danger()
                ->send();
        }
    }

    public function saveAllUnsaved(): void
    {
        $unsavedList = array_filter($this->orders, fn ($o) => empty($o['is_saved']));
        if (empty($unsavedList)) {
            Notification::make()
                ->title('Tidak Ada Pesanan Baru')
                ->body('Semua pesanan marketplace sudah tersimpan di website.')
                ->info()
                ->send();
            return;
        }

        $ttsService = new TikTokShopService();
        $shopeeService = new ShopeeService();
        $savedCount = 0;

        foreach ($unsavedList as $item) {
            try {
                if (($item['platform'] ?? 'tiktok') === 'shopee') {
                    $shopeeService->saveSingleShopeeOrder($item['id']);
                } else {
                    $ttsService->saveSingleTikTokOrder($item['id']);
                }
                $savedCount++;
            } catch (\Throwable $e) {
                // Continue saving others
            }
        }

        Notification::make()
            ->title('Sinkronisasi Selesai')
            ->body("Berhasil menyimpan {$savedCount} pesanan marketplace ke database website.")
            ->success()
            ->send();
    }

    public static function getNavigationBadge(): ?string
    {
        try {
            $minTimestamp = self::getInboxStartTimestamp();
            $unsavedTotal = 0;

            $ttsCached = Cache::get('tts_inbox_orders_list');
            if (is_array($ttsCached)) {
                $unsavedTotal += count(array_filter($ttsCached, fn ($o) => empty($o['is_saved']) && (! empty($o['create_time']) && $o['create_time'] >= $minTimestamp)));
            }

            $shopeeCached = Cache::get('shopee_inbox_orders_list');
            if (is_array($shopeeCached)) {
                $unsavedTotal += count(array_filter($shopeeCached, fn ($o) => empty($o['is_saved']) && (! empty($o['create_time']) && $o['create_time'] >= $minTimestamp)));
            }

            return $unsavedTotal > 0 ? (string) $unsavedTotal : null;
        } catch (\Throwable $e) {}

        return null;
    }

    public static function getNavigationBadgeColor(): ?string
    {
        return 'warning';
    }
}
