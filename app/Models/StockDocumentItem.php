<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StockDocumentItem extends Model
{
    protected $fillable = [
        'stock_document_id',
        'product_id',
        'product_variant_id',
        'qty',
        'unit_cost',
        'qty_before',
        'qty_after',
    ];

    protected $casts = [
        'qty' => 'integer',
        'unit_cost' => 'decimal:2',
        'qty_before' => 'integer',
        'qty_after' => 'integer',
    ];

    public function document(): BelongsTo
    {
        return $this->belongsTo(StockDocument::class, 'stock_document_id');
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

        return $cleanPath !== '' ? asset('storage/' . $cleanPath) : null;
    }
}
