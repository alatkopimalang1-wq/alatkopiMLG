<?php

namespace App\Filament\Resources\FixedBundles\Pages;

use App\Filament\Resources\FixedBundles\FixedBundleResource;
use Filament\Actions\CreateAction;
use Filament\Resources\Pages\ListRecords;

class ListFixedBundles extends ListRecords
{
    protected static string $resource = FixedBundleResource::class;

    protected function getHeaderActions(): array
    {
        return [
            CreateAction::make()->label('Tambah Produk Bundling'),
        ];
    }
}
