<?php

namespace App\Filament\Resources\EquipmentProducts\Pages;

use App\Filament\Concerns\RedirectsToPreviousUrl;
use App\Filament\Resources\EquipmentProducts\EquipmentProductResource;
use App\Models\Product;
use Filament\Resources\Pages\CreateRecord;

class CreateEquipmentProduct extends CreateRecord
{
    use RedirectsToPreviousUrl;

    protected static string $resource = EquipmentProductResource::class;

    protected function mutateFormDataBeforeCreate(array $data): array
    {
        $data['series'] = 'alat-kopi';
        $data['freshness_days'] = (int) ($data['freshness_days'] ?? 365);

        if (! empty($data['variants']) && is_array($data['variants'])) {
            $totalStock = 0;
            foreach ($data['variants'] as $v) {
                $totalStock += (int) ($v['stock'] ?? 0);
            }
            $data['stock'] = $totalStock;
        }

        return $data;
    }

    protected function afterCreate(): void
    {
        $record = $this->getRecord();
        if ($record instanceof Product) {
            $record->syncPricesFromVariants();
            $record->syncStockFromVariants();
            $record->ensurePrimaryImage();
        }
    }
}
