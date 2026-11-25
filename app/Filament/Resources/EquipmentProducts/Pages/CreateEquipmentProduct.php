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

        if (empty($data['max_price']) || (float) $data['max_price'] <= 0) {
            $data['max_price'] = $data['min_price'] ?? 0;
        }

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
            if ($record->variants()->count() === 0) {
                $stock = (int) ($record->stock ?? 0);
                $price = (float) ($record->min_price ?? 0);
                $record->variants()->create([
                    'label' => 'Standard',
                    'weight_grams' => 500,
                    'price' => $price,
                    'stock' => $stock,
                    'stock_status' => $stock > 0 ? 'in_stock' : 'out_of_stock',
                ]);
            } else {
                $record->syncPricesFromVariants();
                $record->syncStockFromVariants();
            }
            $record->ensurePrimaryImage();
        }
    }
}
