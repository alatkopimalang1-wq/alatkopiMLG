<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class Order extends Model
{
    use HasFactory;

    protected $guarded = ['id'];

    protected $casts = [
        'subtotal' => 'decimal:2',
        'shipping_cost' => 'decimal:2',
        'total_amount' => 'decimal:2',
        'unique_code' => 'integer',
        'payment_details' => 'array',
        'paid_at' => 'datetime',
    ];

    protected static function booted(): void
    {
        static::saving(function (Order $order) {
            if ($order->payment_status === 'paid' && ! $order->paid_at) {
                $order->paid_at = now();
            }
        });

        static::saved(function (Order $order) {
            if ($order->is_ecommerce) {
                return;
            }

            $details = is_array($order->payment_details) ? $order->payment_details : [];

            if ($order->payment_status === 'paid' && empty($details['stock_deducted_at'])) {
                $order->deductStockIfNeeded();
            } elseif ((in_array($order->payment_status, ['refunded', 'cancelled'], true) || $order->status === 'cancelled') && ! empty($details['stock_deducted_at'])) {
                $order->restoreStockIfDeducted();
            }
        });

        static::deleting(function (Order $order) {
            $order->restoreStockIfDeducted();
        });
    }

    /**
     * Deduct variant & product stock once when an order's payment is confirmed.
     */
    public function deductStockIfNeeded(): void
    {
        \Illuminate\Support\Facades\DB::transaction(function () {
            $lockedOrder = static::lockForUpdate()->with('items')->find($this->id);
            $items = ($lockedOrder && $lockedOrder->items->isNotEmpty())
                ? $lockedOrder->items
                : ($this->relationLoaded('items') ? $this->items : $this->items()->get());

            if ($items->isEmpty()) {
                return;
            }

            $details = is_array($lockedOrder?->payment_details ?? $this->payment_details)
                ? ($lockedOrder?->payment_details ?? $this->payment_details)
                : [];

            if (! empty($details['stock_deducted_at'])) {
                return;
            }

            foreach ($items as $item) {
                if ($item->is_preorder) {
                    continue;
                }

                $qty = max(1, (int) $item->quantity);

                if (! empty($item->product_variant_id)) {
                    $variant = ProductVariant::with('product')->lockForUpdate()->find($item->product_variant_id);
                    if (! $variant || ($variant->product && ($variant->product->is_preorder || $variant->product->stock_status === 'pre_order'))) {
                        continue;
                    }

                    $variant->stock = max(0, (int) ($variant->stock ?? 0) - $qty);
                    $variant->stock_status = $variant->stock > 0 ? 'in_stock' : 'out_of_stock';
                    $variant->save();

                    $variant->product?->syncStockFromVariants();
                } elseif (! empty($item->product_id)) {
                    $product = Product::lockForUpdate()->find($item->product_id);
                    if (! $product || $product->is_preorder || $product->stock_status === 'pre_order') {
                        continue;
                    }

                    $product->stock = max(0, (int) ($product->stock ?? 0) - $qty);
                    $product->stock_status = $product->stock > 0 ? 'in_stock' : 'out_of_stock';
                    $product->save();
                }
            }

            $details['stock_deducted_at'] = now()->toIso8601String();
            if ($lockedOrder) {
                $lockedOrder->updateQuietly(['payment_details' => $details]);
            }
            $this->payment_details = $details;
        });
    }

    /**
     * Restore variant & product stock if a paid order is later refunded, cancelled, or deleted.
     */
    public function restoreStockIfDeducted(): void
    {
        \Illuminate\Support\Facades\DB::transaction(function () {
            $lockedOrder = static::lockForUpdate()->with('items')->find($this->id);
            $items = ($lockedOrder && $lockedOrder->items->isNotEmpty())
                ? $lockedOrder->items
                : ($this->relationLoaded('items') ? $this->items : $this->items()->get());

            if ($items->isEmpty()) {
                return;
            }

            $details = is_array($lockedOrder?->payment_details ?? $this->payment_details)
                ? ($lockedOrder?->payment_details ?? $this->payment_details)
                : [];

            $wasDeducted = ! empty($details['stock_deducted_at'])
                || (($lockedOrder?->payment_status ?? $this->payment_status) === 'paid' && ! ($lockedOrder?->is_ecommerce ?? $this->is_ecommerce));

            if (! $wasDeducted) {
                return;
            }

            foreach ($items as $item) {
                if ($item->is_preorder) {
                    continue;
                }

                $qty = max(1, (int) $item->quantity);

                if (! empty($item->product_variant_id)) {
                    $variant = ProductVariant::with('product')->lockForUpdate()->find($item->product_variant_id);
                    if (! $variant || ($variant->product && ($variant->product->is_preorder || $variant->product->stock_status === 'pre_order'))) {
                        continue;
                    }

                    $variant->stock = max(0, (int) ($variant->stock ?? 0) + $qty);
                    $variant->stock_status = $variant->stock > 0 ? 'in_stock' : 'out_of_stock';
                    $variant->save();

                    $variant->product?->syncStockFromVariants();
                } elseif (! empty($item->product_id)) {
                    $product = Product::lockForUpdate()->find($item->product_id);
                    if (! $product || $product->is_preorder || $product->stock_status === 'pre_order') {
                        continue;
                    }

                    $product->stock = max(0, (int) ($product->stock ?? 0) + $qty);
                    $product->stock_status = $product->stock > 0 ? 'in_stock' : 'out_of_stock';
                    $product->save();
                }
            }

            unset($details['stock_deducted_at']);
            if ($lockedOrder) {
                $lockedOrder->updateQuietly(['payment_details' => $details]);
            }
            $this->payment_details = $details;
        });
    }

    /**
     * Get pending/verifying non-preorder variant quantities reserved by a specific customer account.
     *
     * @return array<int, int>
     */
    public static function getUserPendingReservedStock(?int $userId): array
    {
        if (! $userId) {
            return [];
        }

        $orders = static::query()
            ->webOnly()
            ->where('user_id', $userId)
            ->whereIn('payment_status', ['pending', 'verifying'])
            ->where('status', '!=', 'cancelled')
            ->with('items')
            ->get(['id', 'payment_details']);

        $reserved = [];
        foreach ($orders as $order) {
            $details = is_array($order->payment_details) ? $order->payment_details : [];
            if (! empty($details['stock_deducted_at'])) {
                continue;
            }
            foreach ($order->items as $item) {
                if ($item->is_preorder || empty($item->product_variant_id)) {
                    continue;
                }
                $vid = (int) $item->product_variant_id;
                $reserved[$vid] = ($reserved[$vid] ?? 0) + max(0, (int) $item->quantity);
            }
        }

        return $reserved;
    }

    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public static function generateOrderNumber(): string
    {
        $date = now()->format('ymd');
        $random = strtoupper(Str::random(4));
        $number = "AKM-{$date}-{$random}";

        while (static::where('order_number', $number)->exists()) {
            $random = strtoupper(Str::random(4));
            $number = "AKM-{$date}-{$random}";
        }

        return $number;
    }

    public static function generatePosOrderNumber(): string
    {
        $date = now()->format('ymd');
        $random = strtoupper(Str::random(4));
        $number = "POS-{$date}-{$random}";

        while (static::where('order_number', $number)->exists()) {
            $random = strtoupper(Str::random(4));
            $number = "POS-{$date}-{$random}";
        }

        return $number;
    }

    public function getPaymentMethodLabelAttribute(): string
    {
        return match ($this->payment_method) {
            'qris' => 'QRIS Toko Resmi (Instan)',
            'bank_transfer' => 'Transfer Bank ('.strtoupper((string) ($this->payment_channel ?? 'BCA')).')',
            'whatsapp' => 'WhatsApp Order',
            'cash', 'tunai' => 'Tunai / Cash (POS)',
            'debit' => 'Kartu Debit / EDC',
            default => ucfirst((string) $this->payment_method),
        };
    }

    public function getPaymentStatusLabelAttribute(): string
    {
        return match ($this->payment_status) {
            'pending' => 'Menunggu Pembayaran',
            'verifying' => 'Menunggu Verifikasi Pembayaran',
            'paid' => 'Pembayaran Berhasil / Lunas',
            'refunded' => 'Dana Dikembalikan (Refund)',
            'cancelled' => 'Dibatalkan',
            default => ucfirst((string) $this->payment_status),
        };
    }

    public function getIsPickupAttribute(): bool
    {
        return $this->shipping_courier === 'Ambil di Toko'
            || str_contains(strtolower((string) $this->shipping_courier), 'pickup')
            || str_contains(strtolower((string) $this->shipping_courier), 'ambil');
    }

    public function canBeCancelledByCustomer(): bool
    {
        return $this->status === 'pending'
            && $this->payment_status === 'pending'
            && empty($this->payment_proof);
    }

    public function getIsPosAttribute(): bool
    {
        return str_starts_with((string) $this->order_number, 'POS-')
            || (($this->payment_details['source'] ?? null) === 'pos');
    }

    public function getIsEcommerceAttribute(): bool
    {
        return str_starts_with((string) $this->order_number, 'TTS-')
            || str_starts_with((string) $this->order_number, 'ECOM-')
            || in_array(($this->payment_details['source'] ?? null), ['tiktok', 'ecommerce', 'tokopedia', 'shopee'], true);
    }

    public function scopeWebOnly(Builder $query): Builder
    {
        return $query->where('order_number', 'not like', 'POS-%')
            ->where('order_number', 'not like', 'TTS-%')
            ->where('order_number', 'not like', 'ECOM-%')
            ->where(function ($sub) {
                $sub->whereNull('payment_details->source')
                    ->orWhereNotIn('payment_details->source', ['pos', 'tiktok', 'ecommerce', 'tokopedia', 'shopee']);
            });
    }

    public function scopePosOnly(Builder $query): Builder
    {
        return $query->where(function ($sub) {
            $sub->where('order_number', 'like', 'POS-%')
                ->orWhere('payment_details->source', 'pos');
        });
    }

    public function scopeEcommerceOnly(Builder $query): Builder
    {
        return $query->where(function ($sub) {
            $sub->where('order_number', 'like', 'TTS-%')
                ->orWhere('order_number', 'like', 'ECOM-%')
                ->orWhere('payment_details->source', 'tiktok')
                ->orWhere('payment_details->source', 'ecommerce')
                ->orWhere('payment_details->source', 'tokopedia')
                ->orWhere('payment_details->source', 'shopee');
        });
    }

    public function getStatusLabelAttribute(): string
    {
        $isPickup = $this->is_pickup;

        return match ($this->status) {
            'pending' => 'Menunggu Konfirmasi',
            'processing' => 'Sedang Diproses & Disangrai',
            'ready_for_pickup' => 'Siap Diambil di Roastery',
            'shipped' => $isPickup ? 'Siap Diambil di Roastery' : 'Dalam Pengiriman Kurir',
            'completed' => $isPickup ? 'Pesanan Selesai (Sudah Diambil)' : 'Pesanan Selesai',
            'refunded' => 'Transaksi Di-refund',
            'cancelled' => 'Pesanan Dibatalkan',
            default => ucfirst((string) $this->status),
        };
    }
}
