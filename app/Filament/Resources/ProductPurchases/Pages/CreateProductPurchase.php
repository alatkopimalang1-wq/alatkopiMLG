<?php

namespace App\Filament\Resources\ProductPurchases\Pages;

use App\Filament\Resources\ProductPurchases\ProductPurchaseResource;
use App\Models\ProductPurchase;
use Filament\Notifications\Notification;
use Filament\Resources\Pages\CreateRecord;

class CreateProductPurchase extends CreateRecord
{
    protected static string $resource = ProductPurchaseResource::class;

    protected function mutateFormDataBeforeCreate(array $data): array
    {
        $items = $data['items'] ?? [];
        $totalQty = 0;
        $subtotal = 0;

        if (is_array($items)) {
            foreach ($items as $key => $item) {
                $qty = max(1, (int) ($item['quantity'] ?? 1));
                $cost = max(0, (float) ($item['unit_cost'] ?? 0));
                $disc = max(0, (float) ($item['discount_amount'] ?? 0));
                $sub = max(0, ($qty * $cost) - $disc);

                $data['items'][$key]['quantity'] = $qty;
                $data['items'][$key]['unit_cost'] = $cost;
                $data['items'][$key]['discount_amount'] = $disc;
                $data['items'][$key]['subtotal'] = $sub;
                $totalQty += $qty;
                $subtotal += $sub;
            }
        }

        $orderDiscount = max(0, (float) ($data['discount_amount'] ?? 0));
        $data['total_qty'] = $totalQty;
        $data['subtotal'] = $subtotal;
        $data['discount_amount'] = $orderDiscount;
        $data['total_amount'] = max(0, $subtotal - $orderDiscount);
        $data['user_id'] = auth()->id();

        if (($data['status'] ?? null) === ProductPurchase::STATUS_DITERIMA) {
            $data['status'] = ProductPurchase::STATUS_DIPESAN;
        }

        if (empty($data['is_paid']) && ! in_array($data['status'] ?? ProductPurchase::STATUS_DIPESAN, [ProductPurchase::STATUS_DIPESAN, ProductPurchase::STATUS_DIBATALKAN], true)) {
            $data['status'] = ProductPurchase::STATUS_DIPESAN;
        }

        if (! empty($data['is_paid']) && empty($data['paid_at'])) {
            $data['paid_at'] = now()->toDateString();
        }

        return $data;
    }

    protected function afterCreate(): void
    {
        $purchase = $this->getRecord();
        if (! $purchase instanceof ProductPurchase) {
            return;
        }

        $purchase->recalculateTotals();
        $purchase->syncStockWithStatus();

        $stockMsg = $purchase->hasStockApplied()
            ? "Stok produk berhasil ditambahkan (+{$purchase->total_qty} pcs)."
            : 'PO disimpan dalam status Butuh Diproses (stok akan bertambah saat status diubah ke Diterima/Selesai).';

        Notification::make()
            ->title('Purchase Order Berhasil Dibuat')
            ->body($stockMsg)
            ->success()
            ->send();
    }

    protected function getRedirectUrl(): string
    {
        return static::getResource()::getUrl('view', ['record' => $this->getRecord()]);
    }
}
