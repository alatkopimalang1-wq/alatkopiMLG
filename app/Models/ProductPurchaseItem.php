<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProductPurchaseItem extends Model
{
    protected $fillable = [
        'product_purchase_id',
        'product_id',
        'product_variant_id',
        'quantity',
        'unit_cost',
        'discount_amount',
        'subtotal',
    ];

    protected $casts = [
        'quantity' => 'integer',
        'unit_cost' => 'float',
        'discount_amount' => 'float',
        'subtotal' => 'float',
    ];

    public function purchase(): BelongsTo
    {
        return $this->belongsTo(ProductPurchase::class, 'product_purchase_id');
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function variant(): BelongsTo
    {
        return $this->belongsTo(ProductVariant::class, 'product_variant_id');
    }

    public function getImageUrlAttribute(): ?string
    {
        $raw = $this->variant?->image
            ?: ($this->product?->primaryImage?->path
                ?? $this->product?->images?->first(fn ($img) => ! empty($img->path))?->path
                ?? $this->product?->variants?->first(fn ($v) => ! empty($v->image))?->image);

        if (empty($raw)) {
            return null;
        }

        if (str_starts_with($raw, 'http://') || str_starts_with($raw, 'https://')) {
            return $raw;
        }

        $cleanPath = ltrim(preg_replace('#^/?(?:(?:storage|public)/)+#', '', trim($raw)), '/');

        return asset('storage/' . $cleanPath);
    }
}
