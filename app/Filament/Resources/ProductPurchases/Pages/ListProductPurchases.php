<?php

namespace App\Filament\Resources\ProductPurchases\Pages;

use App\Filament\Resources\ProductPurchases\ProductPurchaseResource;
use App\Models\ProductPurchase;
use Filament\Actions\CreateAction;
use Filament\Resources\Pages\ListRecords;
use Filament\Schemas\Components\Tabs\Tab;
use Illuminate\Database\Eloquent\Builder;

class ListProductPurchases extends ListRecords
{
    protected static string $resource = ProductPurchaseResource::class;

    protected function getHeaderActions(): array
    {
        return [
            CreateAction::make()
                ->label('+ Tambah Pembelian (PO)'),
        ];
    }

    public function getTabs(): array
    {
        return [
            'butuh_diproses' => Tab::make('Butuh Diproses')
                ->badge(fn (): int => ProductPurchase::whereIn('status', [
                    ProductPurchase::STATUS_DIPESAN,
                    ProductPurchase::STATUS_DIKIRIM,
                ])->count())
                ->badgeColor('warning')
                ->modifyQueryUsing(fn (Builder $query): Builder => $query->whereIn('status', [
                    ProductPurchase::STATUS_DIPESAN,
                    ProductPurchase::STATUS_DIKIRIM,
                ])),

            'telah_diproses' => Tab::make('Telah Diproses')
                ->badge(fn (): int => ProductPurchase::where('status', ProductPurchase::STATUS_DITERIMA)->count())
                ->badgeColor('info')
                ->modifyQueryUsing(fn (Builder $query): Builder => $query->where('status', ProductPurchase::STATUS_DITERIMA)),

            'selesai' => Tab::make('Selesai')
                ->badge(fn (): int => ProductPurchase::where('status', ProductPurchase::STATUS_SELESAI)->count())
                ->badgeColor('success')
                ->modifyQueryUsing(fn (Builder $query): Builder => $query->where('status', ProductPurchase::STATUS_SELESAI)),

            'retur' => Tab::make('Retur')
                ->badge(fn (): int => ProductPurchase::where('status', ProductPurchase::STATUS_RETUR)->count())
                ->badgeColor('info')
                ->modifyQueryUsing(fn (Builder $query): Builder => $query->where('status', ProductPurchase::STATUS_RETUR)),

            'dibatalkan' => Tab::make('Dibatalkan')
                ->badge(fn (): int => ProductPurchase::where('status', ProductPurchase::STATUS_DIBATALKAN)->count())
                ->badgeColor('danger')
                ->modifyQueryUsing(fn (Builder $query): Builder => $query->where('status', ProductPurchase::STATUS_DIBATALKAN)),

            'semua' => Tab::make('Semua')
                ->badge(fn (): int => ProductPurchase::count()),
        ];
    }

    public function getDefaultActiveTab(): string|int|null
    {
        return 'semua';
    }
}
