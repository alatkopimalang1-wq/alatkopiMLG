<?php

namespace App\Filament\Resources\PosOrders\Pages;

use App\Filament\Resources\PosOrders\PosOrderResource;
use Filament\Actions\Action;
use Filament\Resources\Pages\ListRecords;
use Filament\Support\Icons\Heroicon;

class ListPosOrders extends ListRecords
{
    protected static string $resource = PosOrderResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Action::make('openPos')
                ->label('Buka Aplikasi Kasir (POS)')
                ->icon(Heroicon::ComputerDesktop)
                ->color('primary')
                ->url(route('pos.index'))
                ->openUrlInNewTab(),
        ];
    }
}
