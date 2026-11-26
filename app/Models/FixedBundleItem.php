<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FixedBundleItem extends Model
{
    protected $fillable = [
        'fixed_bundle_id',
        'product_id',
        'product_variant_id',
        'quantity',
        'sort_order',
    ];

    protected $casts = [
        'fixed_bundle_id' => 'integer',
        'product_id' => 'integer',
        'product_variant_id' => 'integer',
        'quantity' => 'integer',
        'sort_order' => 'integer',
    ];

    public function bundle(): BelongsTo
    {
        return $this->belongsTo(FixedBundle::class, 'fixed_bundle_id');
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function variant(): BelongsTo
    {
        return $this->belongsTo(ProductVariant::class, 'product_variant_id');
    }
}
