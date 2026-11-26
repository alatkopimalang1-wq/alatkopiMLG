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
        $isPreorder = (bool) ($data['is_preorder'] ?? false);
        if (! $isPreorder) {
            $data['preorder_dp_percent'] = 100;
            $data['stock_status'] = (int) ($data['stock'] ?? 0) > 0 ? 'in_stock' : 'out_of_stock';
        } else {
            $data['stock_status'] = ($data['stock_status'] ?? 'pre_order') === 'out_of_stock' ? 'out_of_stock' : 'pre_order';
        }

        $raw = $this->form->getRawState();
        $hasVariants = (bool) ($raw['has_variants'] ?? false);

        if ($hasVariants && ! empty($data['variants']) && is_array($data['variants'])) {
            $totalStock = 0;
            $prices = [];
            foreach ($data['variants'] as $v) {
                $totalStock += (int) ($v['stock'] ?? 0);
                if (isset($v['price']) && (float) $v['price'] > 0) {
                    $prices[] = (float) $v['price'];
                }
            }
            $data['stock'] = $totalStock;
            if (! empty($prices)) {
                $data['min_price'] = min($prices);
                $data['max_price'] = max($prices);
            }
        } else {
            $data['min_price'] = (float) ($data['min_price'] ?? 0);
            $data['max_price'] = $data['min_price'];
            $data['stock'] = (int) ($data['stock'] ?? 0);
        }

        return $data;
    }

    protected function afterCreate(): void
    {
        $record = $this->getRecord();
        if (! $record instanceof Product) {
            return;
        }

        $raw = $this->form->getRawState();
        $hasVariants = (bool) ($raw['has_variants'] ?? false);

        if (! $hasVariants || $record->variants()->count() === 0) {
            $stock = (int) ($record->stock ?? 0);
            $price = (float) ($record->min_price ?? 0);
            $record->variants()->where('label', '!=', 'Standard')->delete();
            $record->variants()->updateOrCreate(
                ['label' => 'Standard'],
                [
                    'weight_grams' => (int) ($raw['single_weight_grams'] ?? 500),
                    'cost_price' => filled($raw['single_cost_price'] ?? null) ? (float) $raw['single_cost_price'] : null,
                    'price' => $price,
                    'original_price' => filled($raw['single_original_price'] ?? null) ? (float) $raw['single_original_price'] : null,
                    'stock' => $stock,
                    'stock_status' => $record->is_preorder
                        ? ($record->stock_status === 'out_of_stock' ? 'out_of_stock' : 'pre_order')
                        : ($stock > 0 ? 'in_stock' : 'out_of_stock'),
                    'sku' => filled($raw['single_sku'] ?? null) ? (string) $raw['single_sku'] : null,
                ]
            );
        } else {
            $record->syncPricesFromVariants();
            $record->syncStockFromVariants();
        }

        $record->ensurePrimaryImage();
    }
}
