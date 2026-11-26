<?php

namespace App\Filament\Resources\FixedBundles\Tables;

use Filament\Actions\DeleteAction;
use Filament\Actions\EditAction;
use Filament\Tables\Columns\IconColumn;
use Filament\Tables\Columns\ImageColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;

class FixedBundlesTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->columns([
                ImageColumn::make('banner_image')
                    ->label('Foto')
                    ->disk('public')
                    ->circular(),

                TextColumn::make('name')
                    ->label('Nama Produk Bundling')
                    ->searchable()
                    ->sortable()
                    ->weight('bold'),

                TextColumn::make('items_count')
                    ->label('Jumlah Produk')
                    ->counts('items')
                    ->badge(),

                TextColumn::make('discount_percent')
                    ->label('Diskon')
                    ->formatStateUsing(fn ($state): string => rtrim(rtrim(number_format((float) $state, 2, '.', ''), '0'), '.').'%')
                    ->badge()
                    ->color('success'),

                IconColumn::make('is_active')
                    ->label('Aktif')
                    ->boolean(),

                IconColumn::make('show_in_pos')
                    ->label('Tampil di POS')
                    ->boolean(),

                TextColumn::make('sort_order')
                    ->label('Urutan')
                    ->sortable(),
            ])
            ->defaultSort('sort_order')
            ->actions([
                EditAction::make(),
                DeleteAction::make(),
            ]);
    }
}
