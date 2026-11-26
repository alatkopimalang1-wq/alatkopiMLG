<?php

namespace App\Filament\Resources\EquipmentBundles\Pages;

use App\Filament\Resources\EquipmentBundles\EquipmentBundleResource;
use Filament\Actions\CreateAction;
use Filament\Resources\Pages\ListRecords;

class ListEquipmentBundles extends ListRecords
{
    protected static string $resource = EquipmentBundleResource::class;

    protected function getHeaderActions(): array
    {
        return [
            CreateAction::make()
                ->label('Tambah Paket Bundling'),
        ];
    }
}
