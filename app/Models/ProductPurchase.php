<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class ProductPurchase extends Model
{
    protected $fillable = [
        'purchase_number',
        'purchase_date',
        'supplier_name',
        'notes',
        'total_qty',
        'total_amount',
        'user_id',
    ];

    protected $casts = [
        'purchase_date' => 'date',
        'total_qty' => 'integer',
        'total_amount' => 'float',
    ];

    public function items(): HasMany
    {
        return $this->hasMany(ProductPurchaseItem::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
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
}
