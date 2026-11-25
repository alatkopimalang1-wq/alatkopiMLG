<?php

namespace App\Filament\Resources\EcommerceOrders\Pages;

use App\Filament\Pages\ManageTikTokShopSettings;
use App\Filament\Pages\PenerimaanPesananTikTok;
use App\Filament\Resources\EcommerceOrders\EcommerceOrderResource;
use App\Services\TikTokShopService;
use Filament\Actions\Action;
use Filament\Notifications\Notification;
use Filament\Resources\Pages\ListRecords;
use Filament\Support\Icons\Heroicon;

class ListEcommerceOrders extends ListRecords
{
    protected static string $resource = EcommerceOrderResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Action::make('penerimaanPesanan')
                ->label('Penerimaan Pesanan TikTok')
                ->icon(Heroicon::InboxArrowDown)
                ->color('warning')
                ->url(PenerimaanPesananTikTok::getUrl())
                ->tooltip('Buka inbox pesanan TikTok untuk memilih dan menyimpan pesanan secara manual'),

            Action::make('settings')
                ->label('Pengaturan Integrasi')
                ->icon(Heroicon::Cog6Tooth)
                ->color('gray')
                ->url(ManageTikTokShopSettings::getUrl()),
        ];
    }

    public function getMaxContentWidth(): ?string
    {
        return 'full';
    }
}
