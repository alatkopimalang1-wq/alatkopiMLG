<?php

namespace App\Filament\Resources\EquipmentProducts\Pages;

use App\Filament\Resources\EquipmentProducts\EquipmentProductResource;
use App\Models\Product;
use Filament\Actions\CreateAction;
use Filament\Notifications\Notification;
use Filament\Resources\Pages\ListRecords;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class ListEquipmentProducts extends ListRecords
{
    protected static string $resource = EquipmentProductResource::class;

    protected string $view = 'filament.resources.equipment-products.pages.list-equipment-products';

    protected function getHeaderActions(): array
    {
        return [
            CreateAction::make()
                ->label('Tambah Alat Kopi'),
        ];
    }

    public function duplicateProduct(int $productId)
    {
        $record = Product::with(['variants', 'categories', 'images'])->findOrFail($productId);

        $copy = DB::transaction(function () use ($record) {
            $baseName = $record->name.' (Salinan)';
            $baseSlug = Str::slug($baseName);
            $slug = $baseSlug;
            $i = 1;
            while (Product::where('slug', $slug)->exists()) {
                $slug = "{$baseSlug}-{$i}";
                $i++;
            }

            $copy = $record->replicate(['slug']);
            $copy->name = $baseName;
            $copy->slug = $slug;
            $copy->stock = 0;
            $copy->stock_status = $copy->is_preorder ? 'pre_order' : 'out_of_stock';
            $copy->save();

            $copy->categories()->sync($record->categories->pluck('id')->all());

            foreach ($record->variants as $v) {
                $vCopy = $v->replicate();
                $vCopy->product_id = $copy->id;
                $vCopy->stock = 0;
                $vCopy->stock_status = $copy->is_preorder ? $v->stock_status : 'out_of_stock';
                if (! empty($v->sku)) {
                    $vCopy->sku = $v->sku.'-COPY';
                }
                $vCopy->save();
            }

            foreach ($record->images as $img) {
                $imgCopy = $img->replicate();
                $imgCopy->product_id = $copy->id;
                $imgCopy->save();
            }

            return $copy;
        });

        Notification::make()
            ->title('Produk Berhasil Disalin')
            ->success()
            ->send();

        return redirect(EquipmentProductResource::getUrl('edit', ['record' => $copy]));
    }

    public function deleteProduct(int $productId): void
    {
        $record = Product::find($productId);
        if (! $record) {
            return;
        }

        $record->delete();

        Notification::make()
            ->title('Produk Dihapus')
            ->success()
            ->send();
    }
}
