<?php

namespace App\Filament\Resources\StockDocuments\Pages;

use App\Filament\Resources\StockDocuments\StokMasukResource;
use App\Models\StockDocument;
use Filament\Resources\Pages\CreateRecord;

class CreateStokMasuk extends CreateRecord
{
    protected static string $resource = StokMasukResource::class;

    protected function mutateFormDataBeforeCreate(array $data): array
    {
        $data['type'] = StockDocument::TYPE_IN;
        $data['user_id'] = auth()->id();

        return $data;
    }

    protected function afterCreate(): void
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
