<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class ProductPurchase extends Model
{
    public const STATUS_DIPESAN = 'dipesan';
    public const STATUS_DIKIRIM = 'dikirim';
    public const STATUS_DITERIMA = 'diterima';
    public const STATUS_SELESAI = 'selesai';
    public const STATUS_RETUR = 'retur';
    public const STATUS_DIBATALKAN = 'dibatalkan';

    public const STATUS_LABELS = [
        self::STATUS_DIPESAN => 'Dipesan',
        self::STATUS_DIKIRIM => 'Dikirim',
        self::STATUS_DITERIMA => 'Diterima',
        self::STATUS_SELESAI => 'Selesai',
        self::STATUS_RETUR => 'Retur',
        self::STATUS_DIBATALKAN => 'Dibatalkan',
    ];

    public const STOCK_IN_STATUSES = [
        self::STATUS_DITERIMA,
        self::STATUS_SELESAI,
    ];

    public const PAYMENT_REKENING = 'rekening';
    public const PAYMENT_TUNAI = 'tunai';

    public const PAYMENT_LABELS = [
        self::PAYMENT_REKENING => 'Rekening',
        self::PAYMENT_TUNAI => 'Tunai',
    ];

    protected $fillable = [
        'purchase_number',
        'purchase_date',
        'status',
        'is_paid',
        'payment_method',
        'paid_at',
        'due_date',
        'supplier_name',
        'supplier_phone',
        'supplier_contact',
        'supplier_email',
        'supplier_address',
        'supplier_notes',
        'notes',
        'received_date',
        'receipt_number',
        'receiver_name',
        'total_qty',
        'subtotal',
        'discount_amount',
        'total_amount',
        'user_id',
        'stock_applied_at',
    ];

    protected $casts = [
        'purchase_date' => 'date',
        'is_paid' => 'boolean',
        'paid_at' => 'date',
        'due_date' => 'date',
        'received_date' => 'date',
        'total_qty' => 'integer',
        'subtotal' => 'float',
        'discount_amount' => 'float',
        'total_amount' => 'float',
        'stock_applied_at' => 'datetime',
    ];

    public function items(): HasMany
    {
        return $this->hasMany(ProductPurchaseItem::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function getStatusLabelAttribute(): string
    {
        return self::STATUS_LABELS[$this->status] ?? ucfirst((string) $this->status);
    }

    public function hasStockApplied(): bool
    {
        return $this->stock_applied_at !== null;
    }

    public function isStockInStatus(): bool
    {
        return in_array($this->status, self::STOCK_IN_STATUSES, true);
    }

    public static function generatePurchaseNumber(): string
    {
        $date = now()->format('ymd');
        $random = strtoupper(Str::random(4));
        $number = "PO-{$date}-{$random}";

        while (static::where('purchase_number', $number)->exists()) {
            $random = strtoupper(Str::random(4));
            $number = "PO-{$date}-{$random}";
        }

        return $number;
    }

    /**
     * Recalculate total_qty, subtotal, and total_amount from items.
     */
    public function recalculateTotals(): void
    {
        $this->load('items');
        $totalQty = 0;
        $subtotal = 0;

        foreach ($this->items as $item) {
            $qty = max(1, (int) $item->quantity);
            $cost = max(0, (float) $item->unit_cost);
            $itemDiscount = max(0, (float) ($item->discount_amount ?? 0));
            $itemSubtotal = max(0, ($qty * $cost) - $itemDiscount);

            if ((float) $item->subtotal !== $itemSubtotal || (int) $item->quantity !== $qty) {
                $item->quantity = $qty;
                $item->unit_cost = $cost;
                $item->discount_amount = $itemDiscount;
                $item->subtotal = $itemSubtotal;
                $item->save();
            }

            $totalQty += $qty;
            $subtotal += $itemSubtotal;
        }

        $orderDiscount = max(0, (float) ($this->discount_amount ?? 0));
        $this->total_qty = $totalQty;
        $this->subtotal = $subtotal;
        $this->total_amount = max(0, $subtotal - $orderDiscount);
        $this->save();
    }

    /**
     * Apply or reverse product/variant stock based on the current PO status.
     */
    public function syncStockWithStatus(): void
    {
        DB::transaction(function () {
            $purchase = static::lockForUpdate()->with('items')->find($this->id);
            if (! $purchase) {
                return;
            }

            $shouldHaveStock = $purchase->isStockInStatus();
            $alreadyApplied = $purchase->hasStockApplied();

            if ($shouldHaveStock && ! $alreadyApplied) {
                foreach ($purchase->items as $item) {
                    $qty = max(1, (int) $item->quantity);
                    $cost = max(0, (float) $item->unit_cost);
                    $disc = max(0, (float) ($item->discount_amount ?? 0));
                    $effectiveUnitCost = $disc > 0 ? max(0, ($qty * $cost - $disc) / $qty) : $cost;

                    $purchase->adjustVariantStock(
                        (int) $item->product_id,
                        (int) $item->product_variant_id,
                        $qty,
                        $effectiveUnitCost
                    );
                }
                if (! $purchase->received_date) {
                    $purchase->received_date = now()->toDateString();
                }
                $purchase->stock_applied_at = now();
                $purchase->save();
            } elseif (! $shouldHaveStock && $alreadyApplied) {
                foreach ($purchase->items as $item) {
                    $purchase->adjustVariantStock(
                        (int) $item->product_id,
                        (int) $item->product_variant_id,
                        -(int) $item->quantity,
                        0
                    );
                }
                $purchase->stock_applied_at = null;
                $purchase->save();
            }

            $this->refresh();
        });
    }

    /**
     * Adjust a single variant's stock by delta and sync parent product stock.
     * Uses Moving Weighted Average Cost (Biaya Rata-Rata Tertimbang) when new stock is added.
     */
    public function adjustVariantStock(int $productId, int $variantId, int $delta, float $unitCost = 0): void
    {
        $variant = ProductVariant::lockForUpdate()->find($variantId);
        if ($variant) {
            $oldStock = max(0, (int) ($variant->stock ?? 0));
            $newStock = max(0, $oldStock + $delta);

            if ($delta > 0 && $unitCost > 0) {
                $oldCost = (float) ($variant->cost_price ?? 0);
                if ($oldStock > 0 && $oldCost > 0) {
                    // Akumulasi: (stok lama * harga lama + stok baru * harga baru) / total stok baru
                    $totalValue = ($oldStock * $oldCost) + ($delta * $unitCost);
                    $totalQuantity = $oldStock + $delta;
                    $variant->cost_price = round($totalValue / $totalQuantity, 2);
                } else {
                    $variant->cost_price = round($unitCost, 2);
                }
            }

            $variant->stock = $newStock;
            $variant->stock_status = $variant->stock > 0 ? 'in_stock' : 'out_of_stock';
            $variant->save();
        }

        $product = Product::lockForUpdate()->find($productId);
        if ($product) {
            $product->syncStockFromVariants();
            if (! $product->is_preorder && (int) $product->stock > 0) {
                $product->stock_status = 'in_stock';
                $product->save();
            }
        }
    }
}
