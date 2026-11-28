<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ConsignmentSettlement extends Model
{
    use HasFactory;

    protected $guarded = ['id'];

    protected $casts = [
        'period_start' => 'date',
        'period_end' => 'date',
        'total_items_sold' => 'integer',
        'total_gross_sales' => 'float',
        'total_vendor_payout' => 'float',
        'total_store_commission' => 'float',
        'paid_at' => 'datetime',
    ];

    public function consignor(): BelongsTo
    {
        return $this->belongsTo(Consignor::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(ConsignmentSettlementItem::class);
    }

    public static function generateSettlementNumber(): string
    {
        $prefix = 'SET-KNS-'.now()->format('Ym');
        $last = static::where('settlement_number', 'like', "{$prefix}-%")
            ->orderByDesc('id')
            ->first();

        $seq = 1;
        if ($last && preg_match('/-(\d+)$/', $last->settlement_number, $matches)) {
            $seq = ((int) $matches[1]) + 1;
        }

        return sprintf('%s-%04d', $prefix, $seq);
    }
}
