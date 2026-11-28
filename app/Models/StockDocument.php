<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\DB;

class StockDocument extends Model
{
    use HasFactory;

    public const TYPE_IN = 'in';
    public const TYPE_OUT = 'out';

    public const STATUS_DRAFT = 'draft';
    public const STATUS_POSTED = 'posted';
    public const STATUS_CANCELLED = 'cancelled';

    protected $fillable = [
        'document_number',
        'type',
        'status',
        'transaction_date',
        'partner_name',
        'partner_phone',
        'reference_number',
        'notes',
        'user_id',
        'total_qty',
        'total_cost',
        'posted_at',
    ];

    protected $casts = [
        'transaction_date' => 'date',
        'posted_at' => 'datetime',
        'total_qty' => 'integer',
        'total_cost' => 'decimal:2',
    ];

    public function items(): HasMany
    {
        return $this->hasMany(StockDocumentItem::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public static function generateNumber(string $type): string
    {
        $prefix = $type === self::TYPE_IN ? 'IN' : 'OUT';
        $dateStr = Carbon::now()->format('ymd');
        $prefixFull = $prefix . $dateStr;

        $last = self::where('document_number', 'like', "{$prefixFull}%")
            ->orderByDesc('id')
            ->value('document_number');

        $seq = 1;
        if ($last && preg_match('/^'.preg_quote($prefixFull, '/').'(\d+)$/', $last, $m)) {
            $seq = ((int) $m[1]) + 1;
        }

        return $prefixFull . str_pad((string) $seq, 4, '0', STR_PAD_LEFT);
    }

    public function recalculateTotals(): void
    {
        $this->total_qty = (int) $this->items()->sum('quantity');
        $this->total_cost = (float) $this->items()->sum('subtotal_cost');
        $this->saveQuietly();
    }

    public function postStock(): void
    {
        if ($this->status === self::STATUS_POSTED) {
            return;
        }

        DB::transaction(function () {
            $this->load(['items.product', 'items.variant']);

            foreach ($this->items as $item) {
                $variant = $item->variant;
                if (! $variant) {
                    $variant = ProductVariant::where('product_id', $item->product_id)->first();
                }

                if (! $variant) {
                    continue;
                }

                $lockedVariant = ProductVariant::lockForUpdate()->find($variant->id);
                if (! $lockedVariant) {
                    continue;
                }

                $before = max(0, (int) ($lockedVariant->stock ?? 0));
                $qty = (int) $item->quantity;

                if ($this->type === self::TYPE_IN) {
                    $change = $qty;
                    $after = $before + $change;
                } else {
                    $deduct = min($before, $qty);
                    $change = -$deduct;
                    $after = max(0, $before - $deduct);
                }

                $lockedVariant->stock = $after;
                $lockedVariant->stock_status = $after > 0 ? 'in_stock' : 'out_of_stock';
                $lockedVariant->save();

                $product = Product::lockForUpdate()->find($item->product_id);
                if ($product) {
                    $product->syncStockFromVariants();
                }

                // Catat di StockAdjustment sebagai riwayat pergerakan stok
                $reasonLabel = $this->type === self::TYPE_IN
                    ? 'Stok Masuk / Konsinyasi Masuk'
                    : 'Stok Keluar / Konsinyasi Keluar';

                if ($this->partner_name) {
                    $reasonLabel .= " ({$this->partner_name})";
                }

                StockAdjustment::create([
                    'adjustment_number' => StockAdjustment::generateNumber(),
                    'product_id' => $item->product_id,
                    'product_variant_id' => $lockedVariant->id,
                    'type' => $this->type === self::TYPE_IN ? 'in' : 'out',
                    'qty_before' => $before,
                    'qty_change' => $change,
                    'qty_after' => $after,
                    'reason' => $reasonLabel,
                    'notes' => "Dokumen: {$this->document_number}. " . ($this->notes ? "Catatan: {$this->notes}" : ''),
                    'user_id' => $this->user_id ?? auth()->id(),
                ]);
            }

            $this->status = self::STATUS_POSTED;
            $this->posted_at = now();
            $this->save();
        });
    }
}
