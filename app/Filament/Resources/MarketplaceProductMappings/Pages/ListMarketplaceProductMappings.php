<?php

namespace App\Filament\Resources\MarketplaceProductMappings\Pages;

use App\Filament\Pages\ManageShopeeSettings;
use App\Filament\Pages\ManageTikTokShopSettings;
use App\Filament\Resources\MarketplaceProductMappings\MarketplaceProductMappingResource;
use App\Models\MarketplaceProductMapping;
use App\Services\ShopeeService;
use App\Services\TikTokShopService;
use Filament\Actions\Action;
use Filament\Actions\ActionGroup;
use Filament\Notifications\Notification;
use Filament\Resources\Pages\ListRecords;
use Filament\Schemas\Components\Tabs\Tab;
use Filament\Support\Icons\Heroicon;
use Illuminate\Database\Eloquent\Builder;

class ListMarketplaceProductMappings extends ListRecords
{
    protected static string $resource = MarketplaceProductMappingResource::class;

    protected string $view = 'filament.resources.marketplace-product-mappings.pages.list-marketplace-product-mappings';

    public function getStoreSummary(): array
    {
        $mpCount = MarketplaceProductMapping::where('marketplace_status', 'ACTIVATE')->count();
        $webCount = \App\Models\Product::where('series', 'alat-kopi')->count();
        $latestSync = MarketplaceProductMapping::where('marketplace_status', 'ACTIVATE')
            ->max('last_synced_at');

        return [
            'store_name' => 'ALAT KOPI MALANG',
            'mp_count' => $mpCount,
            'mp_status_text' => $latestSync ? 'Diperbarui' : 'Belum ditarik',
            'web_count' => $webCount,
            'auto_sync' => (bool) \App\Models\Setting::get('marketplace_auto_sync_stock', false),
            'last_synced_at' => $latestSync
                ? \Illuminate\Support\Carbon::parse($latestSync)->timezone('Asia/Jakarta')->format('d M Y H:i')
                : 'Belum pernah',
        ];
    }

    public function getHeading(): string
    {
        return '';
    }

    public function updatedTableRecordsPerPage(): void
    {
        $this->flushCachedTableRecords();
        parent::updatedTableRecordsPerPage();
    }

    public function getBreadcrumbs(): array
    {
        return [];
    }

    public function getTabs(): array
    {
        return [
            'all' => Tab::make('Semua')
                ->badge(fn () => MarketplaceProductMapping::where('marketplace_status', 'ACTIVATE')->count()),

            'shopee' => Tab::make('Shopee')
                ->icon(Heroicon::ShoppingBag)
                ->badge(fn () => MarketplaceProductMapping::where('marketplace_status', 'ACTIVATE')->where('platform', 'shopee')->count())
                ->badgeColor('warning')
                ->modifyQueryUsing(fn (Builder $query) => $query->where('marketplace_status', 'ACTIVATE')->where('platform', 'shopee')),

            'tiktok' => Tab::make('TikTok Shop')
                ->icon(Heroicon::MusicalNote)
                ->badge(fn () => MarketplaceProductMapping::where('marketplace_status', 'ACTIVATE')->where('platform', 'tiktok')->count())
                ->badgeColor('info')
                ->modifyQueryUsing(fn (Builder $query) => $query->where('marketplace_status', 'ACTIVATE')->where('platform', 'tiktok')),

            'conflict' => Tab::make('Stok Konflik')
                ->icon(Heroicon::ExclamationTriangle)
                ->badge(function () {
                    return MarketplaceProductMapping::where('marketplace_status', 'ACTIVATE')
                        ->whereNotNull('product_id')
                        ->with(['variant'])
                        ->get()
                        ->filter(fn ($m) => $m->is_stock_conflict)
                        ->count();
                })
                ->badgeColor('danger')
                ->modifyQueryUsing(function (Builder $query) {
                    $ids = MarketplaceProductMapping::where('marketplace_status', 'ACTIVATE')
                        ->whereNotNull('product_id')
                        ->with(['variant'])
                        ->get()
                        ->filter(fn ($m) => $m->is_stock_conflict)
                        ->pluck('id');
                    return $query->whereIn('id', $ids);
                }),

            'unconnected' => Tab::make('Belum Terhubung')
                ->icon(Heroicon::LinkSlash)
                ->badge(fn () => MarketplaceProductMapping::where('marketplace_status', 'ACTIVATE')->whereNull('product_id')->count())
                ->badgeColor('gray')
                ->modifyQueryUsing(fn (Builder $query) => $query->where('marketplace_status', 'ACTIVATE')->whereNull('product_id')),

            'connected' => Tab::make('Terhubung')
                ->icon(Heroicon::CheckCircle)
                ->badge(fn () => MarketplaceProductMapping::where('marketplace_status', 'ACTIVATE')->whereNotNull('product_id')->count())
                ->badgeColor('success')
                ->modifyQueryUsing(fn (Builder $query) => $query->where('marketplace_status', 'ACTIVATE')->whereNotNull('product_id')),
        ];
    }

    protected function getHeaderActions(): array
    {
        return [
            Action::make('autoSyncSettings')
                ->label(fn () => \App\Models\Setting::get('marketplace_auto_sync_stock', false) ? '⚡ Sinkron Otomatis: AKTIF' : '⚡ Sinkron Otomatis: NONAKTIF')
                ->icon(fn () => \App\Models\Setting::get('marketplace_auto_sync_stock', false) ? Heroicon::Bolt : Heroicon::Power)
                ->color(fn () => \App\Models\Setting::get('marketplace_auto_sync_stock', false) ? 'success' : 'gray')
                ->badge(fn () => \App\Models\Setting::get('marketplace_auto_sync_stock', false) ? 'Otomatis' : 'Mati')
                ->badgeColor(fn () => \App\Models\Setting::get('marketplace_auto_sync_stock', false) ? 'success' : 'gray')
                ->button()
                ->modalHeading('Pengaturan Sinkronisasi Stok Otomatis')
                ->modalDescription('Ketika diaktifkan: setiap pesanan di Marketplace otomatis memotong stok di Website & POS. Begitu pula sebaliknya, setiap pesanan di Website/POS atau perubahan stok di Website otomatis memotong dan memperbarui stok di Marketplace (Shopee & TikTok Shop).')
                ->modalSubmitActionLabel('Simpan Pengaturan')
                ->form([
                    \Filament\Forms\Components\Toggle::make('marketplace_auto_sync_stock')
                        ->label('Aktifkan Sinkronisasi Stok Otomatis Pesanan & Stok')
                        ->helperText('Ketika ada orderan masuk di Shopee/TikTok, stok di Website dan kasir POS otomatis ikut berkurang. Dan ketika ada orderan atau perubahan stok di Website/POS, stok di marketplace otomatis ikut terupdate.')
                        ->default(fn () => (bool) \App\Models\Setting::get('marketplace_auto_sync_stock', false)),
                ])
                ->action(function (array $data) {
                    $enabled = (bool) ($data['marketplace_auto_sync_stock'] ?? false);
                    \App\Models\Setting::set('marketplace_auto_sync_stock', $enabled);
                    \App\Models\Setting::set('auto_sync_website_to_mp', $enabled);
                    \App\Models\Setting::set('auto_sync_mp_to_website', $enabled);

                    $status = $enabled ? 'AKTIF' : 'NONAKTIF';
                    Notification::make()
                        ->title("Sinkronisasi Stok Otomatis: {$status}")
                        ->body($enabled
                            ? 'Sinkronisasi otomatis aktif! Orderan di marketplace otomatis mengurangi stok website/POS, dan orderan/edit stok website otomatis mengupdate stok marketplace.'
                            : 'Sinkronisasi stok otomatis telah dinonaktifkan.')
                        ->success()
                        ->send();
                }),

            ActionGroup::make([
                Action::make('syncWebToMpAll')
                    ->label('Samakan Semua Stok Web ➔ Marketplace')
                    ->icon(Heroicon::ArrowUpTray)
                    ->color('success')
                    ->requiresConfirmation()
                    ->modalHeading('Samakan Seluruh Stok Website ke Marketplace?')
                    ->modalDescription('Sistem akan mengirimkan stok real yang ada di website (misal: 300 pcs) ke Shopee dan TikTok Shop untuk seluruh produk/varian yang sudah terhubung.')
                    ->action(function () {
                        $messages = [];

                        // 1. Shopee
                        try {
                            $shopee = new ShopeeService();
                            $resShopee = $shopee->syncAllRealStockToShopee();
                            if ($resShopee['updated'] > 0) {
                                $messages[] = "Shopee: {$resShopee['updated']} varian disesuaikan.";
                            }
                        } catch (\Throwable $e) {
                            $messages[] = "Shopee: " . $e->getMessage();
                        }

                        // 2. TikTok
                        try {
                            $tts = new TikTokShopService();
                            $resTts = $tts->syncAllRealStockToTikTok();
                            if ($resTts['updated'] > 0) {
                                $messages[] = "TikTok Shop: {$resTts['updated']} varian disesuaikan.";
                            }
                        } catch (\Throwable $e) {
                            $messages[] = "TikTok Shop: " . $e->getMessage();
                        }

                        $body = ! empty($messages) ? implode(' ', $messages) : 'Seluruh stok marketplace sudah sama dengan stok website.';
                        Notification::make()
                            ->title('Sinkronisasi Stok ke Marketplace Selesai!')
                            ->body($body)
                            ->success()
                            ->send();
                    }),

                Action::make('syncAllStock')
                    ->label('Nolkan Stok Habis di MP')
                    ->icon(Heroicon::NoSymbol)
                    ->color('danger')
                    ->requiresConfirmation()
                    ->modalHeading('Nolkan Stok Produk Habis di Semua Marketplace?')
                    ->modalDescription('Sistem akan memeriksa semua produk terhubung. Jika statusnya Habis (Out of Stock / 0) di website, maka stok di Shopee dan TikTok Shop akan otomatis diubah menjadi 0.')
                    ->action(function () {
                        $messages = [];
                        // Sync TikTok
                        try {
                            $tts = new TikTokShopService();
                            $resTts = $tts->syncAllProductStock();
                            if ($resTts['updated'] > 0) {
                                $messages[] = "TikTok Shop: {$resTts['updated']} varian dinolkan.";
                            }
                        } catch (\Throwable $e) {
                            $messages[] = "TikTok Shop: " . $e->getMessage();
                        }

                        // Sync Shopee
                        try {
                            $shopee = new ShopeeService();
                            $resShopee = $shopee->syncAllProductStock();
                            if ($resShopee['updated'] > 0) {
                                $messages[] = "Shopee: {$resShopee['updated']} varian dinolkan.";
                            }
                        } catch (\Throwable $e) {
                            $messages[] = "Shopee: " . $e->getMessage();
                        }

                        $body = ! empty($messages) ? implode(' ', $messages) : 'Semua stok marketplace sudah sinkron dengan website.';
                        Notification::make()
                            ->title('Penyelarasan Stok Selesai!')
                            ->body($body)
                            ->success()
                            ->send();
                    }),
            ])
            ->label('Sinkronisasi Stok')
            ->icon(Heroicon::ArrowPath)
            ->color('success')
            ->button(),

            Action::make('syncFromShopee')
                ->label('Tarik Produk Shopee')
                ->icon(Heroicon::ShoppingBag)
                ->color('warning')
                ->action(function () {
                    try {
                        $service = new ShopeeService();
                        $result = $service->syncProducts();

                        Notification::make()
                            ->title('Katalog Shopee Diperbarui!')
                            ->body("Berhasil menarik {$result['total_products']} produk aktif dan {$result['synced_count']} varian ukuran/kemasan dari Shopee.")
                            ->success()
                            ->send();
                    } catch (\Throwable $e) {
                        Notification::make()
                            ->title('Gagal Tarik Produk Shopee')
                            ->body($e->getMessage())
                            ->danger()
                            ->send();
                    }
                }),

            Action::make('syncFromTikTok')
                ->label('Tarik Produk TikTok')
                ->icon(Heroicon::ArrowDownTray)
                ->color('primary')
                ->action(function () {
                    try {
                        $service = new TikTokShopService();
                        $result = $service->syncProductsFromTikTok();

                        Notification::make()
                            ->title('Katalog TikTok Diperbarui!')
                            ->body("Berhasil menarik {$result['total_products']} produk dan {$result['total_mapped']} varian kemasan dari TikTok.")
                            ->success()
                            ->send();
                    } catch (\Throwable $e) {
                        Notification::make()
                            ->title('Gagal Tarik Produk TikTok')
                            ->body($e->getMessage())
                            ->danger()
                            ->send();
                    }
                }),

            Action::make('resetAllConnected')
                ->label('Reset Hubungan Produk')
                ->icon(Heroicon::ArrowPath)
                ->color('danger')
                ->requiresConfirmation()
                ->modalHeading('Reset Semua Produk Terhubung?')
                ->modalDescription('Semua produk marketplace yang saat ini terhubung akan diputus dari katalog website dan statusnya berubah menjadi "Belum Terhubung", sehingga Anda dapat memetakan atau menghubungkannya kembali secara manual.')
                ->modalSubmitActionLabel('Ya, Putus Semua Hubungan')
                ->action(function () {
                    $count = MarketplaceProductMapping::whereNotNull('product_id')->count();
                    MarketplaceProductMapping::whereNotNull('product_id')->update([
                        'product_id' => null,
                        'product_variant_id' => null,
                        'sync_status' => 'pending',
                        'sync_message' => 'Hubungan produk telah direset ke Belum Terhubung.',
                    ]);

                    Notification::make()
                        ->title('Semua Hubungan Produk Berhasil Direset')
                        ->body("Sebanyak {$count} produk marketplace kini berstatus Belum Terhubung dan siap dipasangkan kembali secara manual.")
                        ->success()
                        ->send();
                }),

            ActionGroup::make([
                Action::make('shopeeSettings')
                    ->label('Pengaturan Shopee')
                    ->icon(Heroicon::ShoppingBag)
                    ->color('warning')
                    ->url(ManageShopeeSettings::getUrl()),

                Action::make('tiktokSettings')
                    ->label('Pengaturan TikTok Shop')
                    ->icon(Heroicon::MusicalNote)
                    ->color('info')
                    ->url(ManageTikTokShopSettings::getUrl()),
            ])
            ->label('Pengaturan Integrasi')
            ->icon(Heroicon::Cog6Tooth)
            ->color('gray'),
        ];
    }
}
