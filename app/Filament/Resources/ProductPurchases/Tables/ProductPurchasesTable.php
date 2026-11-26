<?php

namespace App\Filament\Resources\ProductPurchases\Tables;

use App\Filament\Resources\ProductPurchases\ProductPurchaseResource;
use App\Models\ProductPurchase;
use Filament\Actions\Action;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;

class ProductPurchasesTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->defaultSort('id', 'desc')
            ->recordUrl(fn (ProductPurchase $record): string => ProductPurchaseResource::getUrl('view', ['record' => $record]))
            ->columns([
                TextColumn::make('purchase_number')
                    ->label('No. PO')
                    ->searchable()
                    ->sortable()
                    ->weight('bold')
                    ->color('primary'),

                TextColumn::make('purchase_date')
                    ->label('Tanggal')
                    ->date('d M Y')
                    ->sortable(),

                TextColumn::make('supplier_name')
                    ->label('Supplier')
                    ->placeholder('—')
                    ->searchable(),

                TextColumn::make('status')
                    ->label('Status')
                    ->badge()
                    ->formatStateUsing(fn (string $state): string => ProductPurchase::STATUS_LABELS[$state] ?? ucfirst($state))
                    ->color(fn (string $state): string => match ($state) {
                        ProductPurchase::STATUS_DIPESAN => 'warning',
                        ProductPurchase::STATUS_DIKIRIM => 'info',
                        ProductPurchase::STATUS_DITERIMA, ProductPurchase::STATUS_SELESAI => 'success',
                        ProductPurchase::STATUS_RETUR => 'gray',
                        ProductPurchase::STATUS_DIBATALKAN => 'danger',
                        default => 'gray',
                    }),

                TextColumn::make('is_paid')
                    ->label('Pembayaran')
                    ->badge()
                    ->formatStateUsing(fn (bool $state): string => $state ? 'Sudah bayar' : 'Belum bayar')
                    ->color(fn (bool $state): string => $state ? 'success' : 'warning'),

                TextColumn::make('total_qty')
                    ->label('Qty')
                    ->formatStateUsing(fn ($state) => ((int) $state).' pcs'),

                TextColumn::make('total_amount')
                    ->label('Total Tagihan')
                    ->money('IDR', locale: 'id')
                    ->sortable()
                    ->weight('semibold'),

                TextColumn::make('user.name')
                    ->label('Pembelian Oleh')
                    ->placeholder('Admin')
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            ->filters([])
            ->recordActions([
                Action::make('lihat')
                    ->label('Buka PO')
                    ->icon(Heroicon::Eye)
                    ->url(fn (ProductPurchase $record): string => ProductPurchaseResource::getUrl('view', ['record' => $record])),
                Action::make('cetak')
                    ->label('Cetak')
                    ->icon(Heroicon::Printer)
                    ->color('gray')
                    ->url(fn (ProductPurchase $record): string => route('admin.product-purchases.print', $record), shouldOpenInNewTab: true),
            ]);
    }
}
