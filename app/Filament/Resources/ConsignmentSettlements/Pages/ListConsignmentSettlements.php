<?php

namespace App\Filament\Resources\ConsignmentSettlements\Pages;

use App\Filament\Resources\ConsignmentSettlements\ConsignmentSettlementResource;
use Filament\Actions\CreateAction;
use Filament\Resources\Pages\ListRecords;

class ListConsignmentSettlements extends ListRecords
{
    protected static string $resource = ConsignmentSettlementResource::class;

    protected function getHeaderActions(): array
    {
        return [
            CreateAction::make()
                ->label('Buat Rekap & Settlement Baru')
                ->icon('heroicon-o-plus'),
        ];
    }
}
