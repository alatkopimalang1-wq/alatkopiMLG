<?php

namespace App\Filament\Resources\EquipmentProducts\Pages;

use App\Filament\Concerns\RedirectsToPreviousUrl;
use App\Filament\Resources\EquipmentProducts\EquipmentProductResource;
use App\Models\Product;
use Filament\Actions\DeleteAction;
use Filament\Resources\Pages\EditRecord;

class EditEquipmentProduct extends EditRecord
{
    use RedirectsToPreviousUrl;

    protected static string $resource = EquipmentProductResource::class;

    protected function getHeaderActions(): array
    {
        return [
            DeleteAction::make(),
        ];
    }

    protected function mutateFormDataBeforeFill(array $data): array
    {
        $record = $this->getRecord();
        if (! $record instanceof Product) {
            return $data;
        }

        $variants = $record->variants()->get();
        $isSingleStandard = $variants->isEmpty() || ($variants->count() === 1 && $variants->first()->label === 'Standard');

        $data['has_variants'] = ! $isSingleStandard;

        if ($isSingleStandard) {
            $v = $variants->first();
            $data['single_weight_grams'] = $v?->weight_grams ?? 500;
            $data['single_cost_price'] = $v?->cost_price;
            $data['single_original_price'] = $v?->original_price;
            $data['single_sku'] = $v?->sku;
            $data['min_price'] = $v?->price ?? $record->min_price;
            $data['stock'] = $v?->stock ?? $record->stock;
        }

        return $data;
    }

    protected function mutateFormDataBeforeSave(array $data): array
    {
        $record = $this->getRecord();
        $existingStock = $record instanceof Product ? (int) ($record->stock ?? 0) : 0;

        $data['series'] = 'alat-kopi';
        $isPreorder = (bool) ($data['is_preorder'] ?? false);
        if (! $isPreorder) {
            $data['preorder_dp_percent'] = 100;
            $data['stock_status'] = $existingStock > 0 ? 'in_stock' : 'out_of_stock';
        } else {
            $data['stock_status'] = ($data['stock_status'] ?? 'pre_order') === 'out_of_stock' ? 'out_of_stock' : 'pre_order';
        }
        $data['stock'] = $existingStock;

        $raw = $this->form->getRawState();
        $hasVariants = (bool) ($raw['has_variants'] ?? false);

        if ($hasVariants && ! empty($data['variants']) && is_array($data['variants'])) {
            $prices = [];
            foreach ($data['variants'] as $key => $v) {
                // Prevent direct stock modification during product edit; preserve DB stock
                unset($data['variants'][$key]['stock']);
                if (isset($v['price']) && (float) $v['price'] > 0) {
                    $prices[] = (float) $v['price'];
                }
            }
            if (! empty($prices)) {
                $data['min_price'] = min($prices);
                $data['max_price'] = max($prices);
            }
        } else {
            $data['min_price'] = (float) ($data['min_price'] ?? 0);
            $data['max_price'] = $data['min_price'];
        }

        if ($isPreorder) {
            $data['preorder_dp_percent'] = Product::resolveMinPreorderDpPercent((float) ($data['min_price'] ?? 0));
        }

        return $data;
    }

    protected function afterSave(): void
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
            $record->variants()->where('label', 'Standard')->delete();
            $record->syncPricesFromVariants();
            $record->syncStockFromVariants();
        }

        $record->ensurePrimaryImage();
    }
}
