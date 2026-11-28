<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\DB;

class StockDocument extends Model
{
    protected $fillable = [
        'document_number',
        'type',
        'status',
        'document_date',
        'supplier_name',
        'transfer_to',
        'reason',
        'notes',
        'user_id',
        'posted_at',
        'cancelled_at',
    ];

    protected $casts = [
        'document_date' => 'date',
        'posted_at' => 'datetime',
        'cancelled_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(StockDocumentItem::class);
    }

    public function isDraft(): bool
    {
        return $this->status === 'draft';
    }

    public function isPosted(): bool
    {
        return $this->status === 'posted';
    }

    public function isCancelled(): bool
    {
        return $this->status === 'cancelled';
    }

    /**
     * Generate sequential document number: IN{YYMMDD}{00000001} or OG{YYMMDD}{00000001}.
     */
    public static function generateNumber(string $type): string
    {
        $prefix = $type === 'out' ? 'OG' : 'IN';
        $datePart = now()->format('ymd');
        $base = "{$prefix}{$datePart}";

        $last = static::where('document_number', 'like', "{$base}%")
            ->orderByDesc('id')
            ->value('document_number');

        $seq = 1;
        if ($last && strlen($last) >= strlen($base) + 1) {
            $tail = substr($last, strlen($base));
            if (is_numeric($tail)) {
                $seq = (int) $tail + 1;
            }
        }

        $number = $base . str_pad((string) $seq, 8, '0', STR_PAD_LEFT);
        while (static::where('document_number', $number)->exists()) {
            $seq++;
            $number = $base . str_pad((string) $seq, 8, '0', STR_PAD_LEFT);
        }

        return $number;
    }

    /**
     * Post this draft document, applying stock & weighted-average cost changes atomically.
     *
     * @throws \RuntimeException When document cannot be posted or stock is insufficient.
     */
    public function postDocument(?int $userId = null): void
    {
        DB::transaction(function () use ($userId) {
            $doc = static::with('items')->lockForUpdate()->findOrFail($this->id);

            if ($doc->status !== 'draft') {
                throw new \RuntimeException('Hanya dokumen berstatus Draft yang dapat diposting.');
            }

            if ($doc->items->isEmpty()) {
                throw new \RuntimeException('Belum ada produk di dalam dokumen ini.');
            }

            foreach ($doc->items as $item) {
                $variant = ProductVariant::with('product')->lockForUpdate()->find($item->product_variant_id);
                if (! $variant || ! $variant->product) {
                    continue;
                }

                $before = max(0, (int) ($variant->stock ?? 0));
                $qty = max(1, (int) $item->qty);

                if ($doc->type === 'out') {
                    if ($before < $qty) {
                        $label = $variant->product->name . ($variant->label && strcasecmp($variant->label, 'Standard') !== 0 ? " ({$variant->label})" : '');
                        throw new \RuntimeException("Stok tidak mencukupi untuk {$label}. Stok saat ini: {$before} pcs, diminta keluar: {$qty} pcs.");
                    }
                    $after = $before - $qty;
                    $delta = -$qty;
                } else {
                    $after = $before + $qty;
                    $delta = $qty;

                    // Update moving weighted average cost if unit_cost > 0
                    $unitCost = (float) ($item->unit_cost ?? 0);
                    if ($unitCost > 0) {
                        $oldCost = (float) ($variant->cost_price ?? 0);
                        $newAvg = ($before > 0 && $oldCost > 0)
                            ? (($before * $oldCost) + ($qty * $unitCost)) / $after
                            : $unitCost;
                        $variant->cost_price = round($newAvg, 2);
                    }
                }

                $variant->stock = $after;
                $variant->stock_status = $after > 0 ? 'in_stock' : 'out_of_stock';
                $variant->save();

                $product = Product::lockForUpdate()->find($variant->product_id);
                if ($product) {
                    $product->syncStockFromVariants();
                }

                $item->update([
                    'qty_before' => $before,
                    'qty_after' => $after,
                ]);

                StockAdjustment::create([
                    'adjustment_number' => $doc->document_number,
                    'product_id' => $variant->product_id,
                    'product_variant_id' => $variant->id,
                    'type' => $doc->type,
                    'qty_before' => $before,
                    'qty_change' => $delta,
                    'qty_after' => $after,
                    'reason' => $doc->reason ?: ($doc->type === 'in' ? 'Stok Masuk' : 'Stok Keluar'),
                    'notes' => trim(($doc->supplier_name ? "Supplier: {$doc->supplier_name}. " : '') . ($doc->transfer_to ? "Transfer ke: {$doc->transfer_to}. " : '') . ($doc->notes ?? '')),
                    'user_id' => $userId ?? $doc->user_id ?? auth()->id(),
                ]);
            }

            $doc->update([
                'status' => 'posted',
                'posted_at' => now(),
            ]);
        });

        $this->refresh();
    }

    /**
     * Cancel document. If already posted, reverses the stock changes atomically.
     */
    public function cancelDocument(?int $userId = null): void
    {
        DB::transaction(function () use ($userId) {
            $doc = static::with('items')->lockForUpdate()->findOrFail($this->id);

            if ($doc->status === 'cancelled') {
                return;
            }

            if ($doc->status === 'posted') {
                foreach ($doc->items as $item) {
                    $variant = ProductVariant::with('product')->lockForUpdate()->find($item->product_variant_id);
                    if (! $variant || ! $variant->product) {
                        continue;
                    }

                    $before = max(0, (int) ($variant->stock ?? 0));
                    $qty = max(1, (int) $item->qty);

                    if ($doc->type === 'out') {
                        $after = $before + $qty;
                        $delta = $qty;
                    } else {
                        $after = max(0, $before - $qty);
                        $delta = -min($before, $qty);
                    }

                    $variant->stock = $after;
                    $variant->stock_status = $after > 0 ? 'in_stock' : 'out_of_stock';
                    $variant->save();

                    $product = Product::lockForUpdate()->find($variant->product_id);
                    if ($product) {
                        $product->syncStockFromVariants();
                    }

                    StockAdjustment::create([
                        'adjustment_number' => $doc->document_number . '-BATAL',
                        'product_id' => $variant->product_id,
                        'product_variant_id' => $variant->id,
                        'type' => $doc->type === 'out' ? 'in' : 'out',
                        'qty_before' => $before,
                        'qty_change' => $delta,
                        'qty_after' => $after,
                        'reason' => "Pembatalan {$doc->document_number}",
                        'notes' => $doc->notes,
                        'user_id' => $userId ?? auth()->id(),
                    ]);
                }
            }

            $doc->update([
                'status' => 'cancelled',
                'cancelled_at' => now(),
            ]);
        });

        $this->refresh();
    }
}
