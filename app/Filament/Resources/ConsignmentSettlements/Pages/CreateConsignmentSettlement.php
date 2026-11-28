<?php

namespace App\Filament\Resources\ConsignmentSettlements\Pages;

use App\Filament\Resources\ConsignmentSettlements\ConsignmentSettlementResource;
use App\Models\ConsignmentSettlement;
use App\Models\ConsignmentSettlementItem;
use App\Models\OrderItem;
use Filament\Notifications\Notification;
use Filament\Resources\Pages\CreateRecord;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class CreateConsignmentSettlement extends CreateRecord
{
    protected static string $resource = ConsignmentSettlementResource::class;

    protected function handleRecordCreation(array $data): Model
    {
        $consignorId = (int) $data['consignor_id'];
        $start = Carbon::parse($data['period_start'])->startOfDay();
        $end = Carbon::parse($data['period_end'])->endOfDay();

        // Cari semua order_items konsinyasi mitra ini yang belum di-settle
        $itemsQuery = OrderItem::query()
            ->where('is_consignment', true)
            ->where('consignor_id', $consignorId)
            ->whereNull('consignment_settled_at')
            ->whereBetween('created_at', [$start, $end])
            ->whereHas('order', function ($oq) {
                $oq->whereIn('payment_status', ['paid', 'completed'])
                    ->orWhereIn('status', ['paid', 'completed', 'shipped']);
            })
            ->with(['order', 'product', 'variant']);

        $unsettledItems = $itemsQuery->get();

        if ($unsettledItems->isEmpty()) {
            Notification::make()
                ->title('Tidak Ada Transaksi Penjualan')
                ->body('Tidak ditemukan penjualan produk konsinyasi untuk mitra ini pada periode yang dipilih yang belum di-settle.')
                ->warning()
                ->send();

            $this->halt();
        }

        return DB::transaction(function () use ($data, $unsettledItems) {
            $totalQty = 0;
            $grossSales = 0.0;
            $vendorPayout = 0.0;
            $storeCommission = 0.0;

            foreach ($unsettledItems as $item) {
                $qty = (int) $item->quantity;
                $subtotal = (float) $item->subtotal;
                $unitPrice = (float) $item->price;

                // Hitung hak vendor & komisi
                $itemPayout = (float) ($item->consignment_vendor_payout ?? 0);
                $itemCommission = (float) ($item->consignment_store_commission ?? 0);

                if ($itemPayout <= 0 && $itemCommission <= 0 && $item->product) {
                    $split = $item->product->calculateConsignmentSplit($unitPrice, $item->variant);
                    $itemPayout = $split['vendor_payout'] * $qty;
                    $itemCommission = $split['store_commission'] * $qty;
                } elseif ($itemPayout > 0 && ($itemPayout * $qty) > 0) {
                    $itemPayout = $itemPayout * $qty;
                    $itemCommission = $itemCommission * $qty;
                }

                $totalQty += $qty;
                $grossSales += $subtotal;
                $vendorPayout += $itemPayout;
                $storeCommission += $itemCommission;
            }

            $settlement = ConsignmentSettlement::create([
                'settlement_number' => ConsignmentSettlement::generateSettlementNumber(),
                'consignor_id' => $data['consignor_id'],
                'period_start' => $data['period_start'],
                'period_end' => $data['period_end'],
                'total_items_sold' => $totalQty,
                'total_gross_sales' => $grossSales,
                'total_vendor_payout' => $vendorPayout,
                'total_store_commission' => $storeCommission,
                'status' => $data['status'] ?? 'draft',
                'payment_method' => $data['payment_method'] ?? 'bank_transfer',
                'payment_reference' => $data['payment_reference'] ?? null,
                'payment_proof' => $data['payment_proof'] ?? null,
                'notes' => $data['notes'] ?? null,
                'user_id' => auth()->id(),
                'paid_at' => ($data['status'] ?? '') === 'paid' ? now() : null,
            ]);

            foreach ($unsettledItems as $item) {
                $qty = (int) $item->quantity;
                $unitPrice = (float) $item->price;
                $subtotal = (float) $item->subtotal;

                $itemPayout = (float) ($item->consignment_vendor_payout ?? 0);
                $itemCommission = (float) ($item->consignment_store_commission ?? 0);

                if ($itemPayout <= 0 && $itemCommission <= 0 && $item->product) {
                    $split = $item->product->calculateConsignmentSplit($unitPrice, $item->variant);
                    $itemPayout = $split['vendor_payout'] * $qty;
                    $itemCommission = $split['store_commission'] * $qty;
                } else {
                    $itemPayout = $itemPayout * $qty;
                    $itemCommission = $itemCommission * $qty;
                }

                ConsignmentSettlementItem::create([
                    'consignment_settlement_id' => $settlement->id,
                    'order_id' => $item->order_id,
                    'order_item_id' => $item->id,
                    'product_id' => $item->product_id,
                    'product_variant_id' => $item->product_variant_id,
                    'product_name' => $item->product_name,
                    'variant_label' => $item->variant_label,
                    'quantity' => $qty,
                    'unit_price' => $unitPrice,
                    'subtotal' => $subtotal,
                    'vendor_payout' => $itemPayout,
                    'store_commission' => $itemCommission,
                    'sold_at' => $item->created_at,
                ]);

                // Tandai item pesanan sudah di-settle
                $item->update([
                    'consignment_settled_at' => now(),
                    'consignment_settlement_id' => $settlement->id,
                ]);
            }

            return $settlement;
        });
    }

    protected function getRedirectUrl(): string
    {
        return $this->getResource()::getUrl('view', ['record' => $this->getRecord()]);
    }
}
