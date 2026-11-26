<?php

namespace App\Filament\Resources\ProductPurchases\Tables;

use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;

class ProductPurchasesTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->defaultSort('id', 'desc')
            ->columns([
                TextColumn::make('purchase_number')
                    ->label('No. Pembelian')
                    ->searchable()
                    ->sortable()
                    ->weight('bold'),

                TextColumn::make('purchase_date')
                    ->label('Tanggal')
                    ->date('d M Y')
                    ->sortable(),

                TextColumn::make('supplier_name')
                    ->label('Supplier')
                    ->placeholder('—')
                    ->searchable(),

                TextColumn::make('items_count')
                    ->counts('items')
                    ->label('Item'),

                TextColumn::make('total_qty')
                    ->label('Total Qty')
                    ->badge()
                    ->color('success')
                    ->formatStateUsing(fn ($state) => '+'.((int) $state).' pcs'),

                TextColumn::make('total_amount')
                    ->label('Total Pembelian')
                    ->money('IDR', locale: 'id')
                    ->sortable(),

                TextColumn::make('user.name')
                    ->label('Dicatat Oleh')
                    ->placeholder('Admin'),

                TextColumn::make('created_at')
                    ->label('Waktu Input')
                    ->dateTime('d M Y, H:i')
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            ->filters([])
            ->recordActions([]);
    }
}
