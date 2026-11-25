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

    protected function mutateFormDataBeforeSave(array $data): array
    {
        $data['series'] = 'alat-kopi';

        if (! empty($data['variants']) && is_array($data['variants'])) {
            $totalStock = 0;
            foreach ($data['variants'] as $v) {
                $totalStock += (int) ($v['stock'] ?? 0);
            }
            $data['stock'] = $totalStock;
        }

        return $data;
    }

    protected function afterSave(): void
    {
        $record = $this->getRecord();
        if ($record instanceof Product) {
            $record->syncPricesFromVariants();
            $record->syncStockFromVariants();
            $record->ensurePrimaryImage();
        }
    }
}
