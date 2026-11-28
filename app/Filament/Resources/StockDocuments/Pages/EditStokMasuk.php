<?php

namespace App\Filament\Resources\StockDocuments\Pages;

use App\Filament\Resources\StockDocuments\StokMasukResource;
use App\Models\StockDocument;
use Filament\Resources\Pages\EditRecord;

class EditStokMasuk extends EditRecord
{
    protected static string $resource = StokMasukResource::class;

    protected function afterSave(): void
    {
        /** @var StockDocument $record */
        $record = $this->getRecord();

        foreach ($record->items as $item) {
            $item->subtotal_cost = (float) $item->quantity * (float) $item->unit_cost;
            $item->saveQuietly();
        }

        $record->recalculateTotals();

        if ($record->status === StockDocument::STATUS_POSTED) {
            $record->postStock();
        }
    }

    protected function getRedirectUrl(): string
    {
        return $this->getResource()::getUrl('view', ['record' => $this->getRecord()]);
    }
}
