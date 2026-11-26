<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class StockAdjustment extends Model
{
    protected $fillable = [
        'adjustment_number',
        'product_id',
        'product_variant_id',
        'type',
        'qty_before',
        'qty_change',
        'qty_after',
        'reason',
        'notes',
        'user_id',
    ];

    protected $casts = [
        'qty_before' => 'integer',
        'qty_change' => 'integer',
        'qty_after' => 'integer',
    ];

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function variant(): BelongsTo
    {
        return $this->belongsTo(ProductVariant::class, 'product_variant_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public static function generateNumber(): string
    {
        $date = now()->format('ymd');
        $random = strtoupper(Str::random(4));
        $number = "ADJ-{$date}-{$random}";

        while (static::where('adjustment_number', $number)->exists()) {
            $random = strtoupper(Str::random(4));
            $number = "ADJ-{$date}-{$random}";
        }

        return $number;
    }
}
