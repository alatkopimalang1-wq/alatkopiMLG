<?php

namespace App\Filament\Resources\EquipmentProducts\Pages;

use App\Filament\Resources\EquipmentProducts\EquipmentProductResource;
use Filament\Actions\CreateAction;
use Filament\Resources\Pages\ListRecords;

class ListEquipmentProducts extends ListRecords
{
    protected static string $resource = EquipmentProductResource::class;

    protected function getHeaderActions(): array
    {
        return [
            CreateAction::make()
                ->label('Tambah Alat Kopi'),
        ];
    }
}
