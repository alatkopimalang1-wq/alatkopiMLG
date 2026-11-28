<?php

namespace App\Filament\Resources\StockDocuments\Pages;

use App\Filament\Resources\StockDocuments\StokMasukResource;
use App\Models\StockDocument;
use Filament\Actions\CreateAction;
use Filament\Resources\Pages\ListRecords;

class ListStokMasuks extends ListRecords
{
    protected static string $resource = StokMasukResource::class;

    protected function getHeaderActions(): array
    {
        return [
            CreateAction::make()->label('+ Catat Stok Masuk Baru'),
        ];
    }
}
