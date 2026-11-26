<?php

namespace App\Filament\Resources\FixedBundles\Pages;

use App\Filament\Resources\FixedBundles\FixedBundleResource;
use Filament\Actions\DeleteAction;
use Filament\Resources\Pages\EditRecord;

class EditFixedBundle extends EditRecord
{
    protected static string $resource = FixedBundleResource::class;

    protected function getHeaderActions(): array
    {
        return [
            DeleteAction::make(),
        ];
    }
}
