<?php

namespace App\Filament\Resources\Products\Pages;

use App\Filament\Concerns\RedirectsToPreviousUrl;
use App\Filament\Resources\Products\ProductResource;
use App\Models\Product;
use Filament\Resources\Pages\CreateRecord;

class CreateProduct extends CreateRecord
{
    use RedirectsToPreviousUrl;

    protected static string $resource = ProductResource::class;

    protected function mutateFormDataBeforeCreate(array $data): array
    {
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
