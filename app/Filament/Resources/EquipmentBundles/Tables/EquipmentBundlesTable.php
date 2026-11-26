<?php

namespace App\Filament\Resources\EquipmentBundles\Tables;

use App\Filament\Resources\EquipmentBundles\EquipmentBundleResource;
use App\Models\EquipmentBundle;
use Filament\Actions\Action;
use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteAction;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Columns\IconColumn;
use Filament\Tables\Columns\ImageColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;

class EquipmentBundlesTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->defaultSort('sort_order', 'asc')
            ->columns([
                ImageColumn::make('banner_image')
                    ->label('Banner')
                    ->disk('public')
                    ->checkFileExistence(false)
                    ->defaultImageUrl(fn () => asset('brand/logo-circle.png')),

                TextColumn::make('name')
                    ->label('Nama Paket Bundling')
                    ->searchable()
                    ->sortable()
                    ->weight('bold')
                    ->url(fn (EquipmentBundle $record): string => EquipmentBundleResource::getUrl('edit', ['record' => $record])),

                TextColumn::make('slots_count')
                    ->counts('slots')
                    ->label('Jumlah Slot')
                    ->badge()
                    ->color('info'),

                IconColumn::make('is_active')
                    ->label('Aktif')
                    ->boolean(),

                TextColumn::make('updated_at')
                    ->label('Diperbarui')
                    ->dateTime('d M Y, H:i')
                    ->sortable(),
            ])
            ->filters([])
            ->recordActions([
                Action::make('lihat_web')
                    ->label('Lihat di Web')
                    ->icon(Heroicon::ArrowTopRightOnSquare)
                    ->url(fn (EquipmentBundle $record): string => route('bundles.show', $record->slug), shouldOpenInNewTab: true),
                EditAction::make(),
                DeleteAction::make(),
            ])
            ->toolbarActions([
                BulkActionGroup::make([
                    DeleteBulkAction::make(),
                ]),
            ]);
    }
}
