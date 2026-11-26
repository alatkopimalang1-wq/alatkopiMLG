<?php

namespace App\Filament\Resources\EquipmentBundles\Pages;

use App\Filament\Resources\EquipmentBundles\EquipmentBundleResource;
use Filament\Actions\DeleteAction;
use Filament\Resources\Pages\EditRecord;

class EditEquipmentBundle extends EditRecord
{
    protected static string $resource = EquipmentBundleResource::class;

    protected function getHeaderActions(): array
    {
        return [
            DeleteAction::make(),
        ];
    }
}
