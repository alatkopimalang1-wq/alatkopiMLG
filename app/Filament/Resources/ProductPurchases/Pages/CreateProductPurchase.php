<?php

namespace App\Filament\Resources\ProductPurchases\Pages;

use App\Filament\Resources\ProductPurchases\ProductPurchaseResource;
use App\Models\Product;
use App\Models\ProductPurchase;
use App\Models\ProductVariant;
use Filament\Notifications\Notification;
use Filament\Resources\Pages\CreateRecord;
use Illuminate\Support\Facades\DB;

class CreateProductPurchase extends CreateRecord
{
    protected static string $resource = ProductPurchaseResource::class;

    protected function mutateFormDataBeforeCreate(array $data): array
    {
        $items = $data['items'] ?? [];
        $totalQty = 0;
        $totalAmount = 0;

        if (is_array($items)) {
            foreach ($items as $key => $item) {
                $qty = max(1, (int) ($item['quantity'] ?? 1));
                $cost = max(0, (float) ($item['unit_cost'] ?? 0));
                $sub = $qty * $cost;
                $data['items'][$key]['quantity'] = $qty;
                $data['items'][$key]['unit_cost'] = $cost;
                $data['items'][$key]['subtotal'] = $sub;
                $totalQty += $qty;
                $totalAmount += $sub;
            }
        }

        $data['total_qty'] = $totalQty;
        $data['total_amount'] = $totalAmount;
        $data['user_id'] = auth()->id();

        return $data;
    }

    protected function afterCreate(): void
    {
        $purchase = $this->getRecord();
        if (! $purchase instanceof ProductPurchase) {
            return;
        }

        DB::transaction(function () use ($purchase) {
            $purchase->load('items');
            $totalQty = 0;
            $totalAmount = 0;

            foreach ($purchase->items as $item) {
                $qty = max(1, (int) $item->quantity);
                $cost = max(0, (float) $item->unit_cost);
                $item->subtotal = $qty * $cost;
                $item->save();

                $totalQty += $qty;
                $totalAmount += $item->subtotal;

                $variant = ProductVariant::lockForUpdate()->find($item->product_variant_id);
                if ($variant) {
                    $variant->stock = max(0, (int) ($variant->stock ?? 0)) + $qty;
                    if ($cost > 0) {
                        $variant->cost_price = $cost;
                    }
                    $variant->stock_status = $variant->stock > 0 ? 'in_stock' : 'out_of_stock';
                    $variant->save();
                }

                $product = Product::lockForUpdate()->find($item->product_id);
                if ($product) {
                    $product->syncStockFromVariants();
                    if (! $product->is_preorder && (int) $product->stock > 0) {
                        $product->stock_status = 'in_stock';
                        $product->save();
                    }
                }
            }

            $purchase->total_qty = $totalQty;
            $purchase->total_amount = $totalAmount;
            $purchase->save();
        });

        Notification::make()
            ->title('Pembelian Berhasil Dicatat')
            ->body("Stok produk berhasil ditambahkan (+{$purchase->total_qty} pcs).")
            ->success()
            ->send();
    }

    protected function getRedirectUrl(): string
    {
        return static::getResource()::getUrl('index');
    }
}
