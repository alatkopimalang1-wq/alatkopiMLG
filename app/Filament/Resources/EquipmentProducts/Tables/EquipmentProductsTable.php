<?php

namespace App\Filament\Resources\EquipmentProducts\Tables;

use App\Filament\Resources\EquipmentProducts\EquipmentProductResource;
use App\Models\Product;
use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Tables\Columns\IconColumn;
use Filament\Tables\Columns\ImageColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Table;

class EquipmentProductsTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->columns([
                ImageColumn::make('primaryImage.path')
                    ->label('Foto')
                    ->disk('public')
                    ->circular()
                    ->checkFileExistence(false)
                    ->state(function (Product $record): ?string {
                        $raw = $record->primaryImage?->path
                            ?? $record->images->first(fn ($img) => ! empty($img->path))?->path
                            ?? $record->variants->first(fn ($v) => ! empty($v->image))?->image;

                        if (empty($raw)) {
                            return null;
                        }

                        if (str_starts_with($raw, 'http://') || str_starts_with($raw, 'https://')) {
                            return $raw;
                        }

                        return ltrim(preg_replace('#^/?(?:(?:storage|public)/)+#', '', trim($raw)), '/');
                    })
                    ->defaultImageUrl(fn () => asset('brand/logo-circle.png')),

                TextColumn::make('name')
                    ->label('Nama Alat Kopi')
                    ->searchable()
                    ->sortable()
                    ->weight('bold'),

                TextColumn::make('origin')
                    ->label('Merek')
                    ->searchable()
                    ->sortable()
                    ->visibleFrom('md'),

                TextColumn::make('process')
                    ->label('Tipe Alat')
                    ->badge()
                    ->color('info')
                    ->searchable()
                    ->visibleFrom('md'),

                TextColumn::make('min_price')
                    ->label('Harga Mulai')
                    ->money('IDR', locale: 'id')
                    ->sortable()
                    ->weight('semibold'),

                TextColumn::make('stock')
                    ->label('Stok (Pcs)')
                    ->badge()
                    ->color(function ($state, Product $record): string {
                        if ($record->is_preorder) {
                            return $record->is_out_of_stock ? 'danger' : 'success';
                        }

                        return (int) $state > 0 ? 'success' : 'danger';
                    })
                    ->formatStateUsing(function ($state, Product $record): string {
                        if ($record->is_preorder) {
                            return $record->is_out_of_stock ? 'Kosong (Pre-Order)' : 'Tersedia (Pre-Order)';
                        }

                        return (int) $state > 0 ? number_format((int) $state, 0, ',', '.').' pcs' : 'Habis (0 pcs)';
                    })
                    ->description(fn (Product $record) => $record->variants->count() > 1 ? $record->variants->count().' varian' : null)
                    ->sortable(),

                IconColumn::make('is_featured')
                    ->label('Unggulan')
                    ->boolean()
                    ->toggleable(isToggledHiddenByDefault: true),

                TextColumn::make('status')
                    ->badge()
                    ->color(fn (string $state): string => match ($state) {
                        'active' => 'success',
                        'archived' => 'gray',
                        default => 'warning',
                    })
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            ->filters([
                SelectFilter::make('status')
                    ->options([
                        'active' => 'Aktif',
                        'archived' => 'Arsip',
                    ]),
            ])
            ->recordUrl(fn (Product $record): string => EquipmentProductResource::getUrl('edit', ['record' => $record]))
            ->recordActions([
                EditAction::make(),
            ])
            ->toolbarActions([
                BulkActionGroup::make([
                    DeleteBulkAction::make(),
                ]),
            ]);
    }
}
