<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;

class ProductVariant extends Model
{
    use HasFactory;

    protected $fillable = [
        'product_id',
        'label',
        'weight_grams',
        'price',
        'cost_price',
        'original_price',
        'stock',
        'stock_status',
        'sku',
        'image',
    ];

    protected $casts = [
        'weight_grams' => 'integer',
        'price' => 'float',
        'cost_price' => 'float',
        'original_price' => 'float',
        'stock' => 'integer',
    ];

    protected $appends = [
        'image_url',
        'hpp',
        'quantity',
    ];

    public function getQuantityAttribute(): int
    {
        return (int) ($this->attributes['stock'] ?? 0);
    }

    public function setQuantityAttribute($value): void
    {
        $this->attributes['stock'] = (int) $value;
    }

    public function getHppAttribute(): ?float
    {
        return $this->cost_price ? (float) $this->cost_price : null;
    }

    public function setHppAttribute($value): void
    {
        $this->attributes['cost_price'] = $value !== null && $value !== '' ? (float) $value : null;
    }

    public function getBasePriceAttribute(): ?float
    {
        return $this->cost_price ? (float) $this->cost_price : null;
    }

    public function setBasePriceAttribute($value): void
    {
        $this->attributes['cost_price'] = $value !== null && $value !== '' ? (float) $value : null;
    }

    public function getImageUrlAttribute(): ?string
    {
        if (empty($this->image)) {
            return null;
        }

        if (str_starts_with($this->image, 'http://') || str_starts_with($this->image, 'https://')) {
            return $this->image;
        }

        $webp = preg_replace('/\.(jpe?g|png)$/i', '.webp', $this->image);
        if ($webp !== $this->image && file_exists(public_path('storage/'.$webp))) {
            return Storage::url($webp);
        }

        return Storage::url($this->image);
    }

    public static function parseWeightFromLabel(?string $label): ?int
    {
        if (empty($label)) {
            return null;
        }

        if (preg_match('/(\d+(?:[.,]\d+)?)\s*kg\b/i', $label, $matches)) {
            $val = (float) str_replace(',', '.', $matches[1]);

            return (int) round($val * 1000);
        }

        if (preg_match('/(\d+)\s*(?:gr|gram|g)\b/i', $label, $matches)) {
            return (int) $matches[1];
        }

        if (preg_match('/^(\d+)$/', trim($label), $matches)) {
            return (int) $matches[1];
        }

        return null;
    }

    public static function syncLabelWithWeight(?string $currentLabel, int $weightGrams): string
    {
        if ($weightGrams <= 0) {
            return (string) $currentLabel;
        }

        $trimmed = trim((string) $currentLabel);
        if ($trimmed === '' || preg_match('/^\d+$/', $trimmed)) {
            return $weightGrams.' gr';
        }

        if (preg_match('/^(\d+(?:[.,]\d+)?)(\s*)(gr|gram|g|kg)(\b.*)$/i', $trimmed, $matches)) {
            $space = $matches[2] !== '' ? $matches[2] : ' ';
            $unit = $matches[3];
            $suffix = $matches[4];

            if (strtolower($unit) === 'kg') {
                if ($weightGrams >= 1000 && $weightGrams % 1000 === 0) {
                    return ($weightGrams / 1000).$space.$unit.$suffix;
                }

                return $weightGrams.' gr'.$suffix;
            }

            return $weightGrams.$space.$unit.$suffix;
        }

        return (string) $currentLabel;
    }

    protected static function booted(): void
    {
        static::saving(function (ProductVariant $variant) {
            $weight = (int) $variant->weight_grams;
            $label = (string) $variant->label;

            if ($variant->isDirty('weight_grams') && ! $variant->isDirty('label') && $weight > 0) {
                $variant->label = static::syncLabelWithWeight($label, $weight);
            } elseif ($variant->isDirty('label') && ! $variant->isDirty('weight_grams')) {
                $parsed = static::parseWeightFromLabel($label);
                if ($parsed !== null && $parsed > 0) {
                    $variant->weight_grams = $parsed;
                }
            } elseif ($weight <= 0 && ! empty($label)) {
                $parsed = static::parseWeightFromLabel($label);
                if ($parsed !== null && $parsed > 0) {
                    $variant->weight_grams = $parsed;
                }
            }

            if (\Illuminate\Support\Facades\Schema::hasColumn('product_variants', 'stock')) {
                $isPreorderProduct = (bool) ($variant->product?->is_preorder ?? false);
                if ($isPreorderProduct) {
                    if ($variant->product?->stock_status === 'out_of_stock') {
                        $variant->stock_status = 'out_of_stock';
                    } else {
                        $variant->stock_status = ($variant->isDirty('stock_status') && $variant->stock_status === 'out_of_stock')
                            ? 'out_of_stock'
                            : 'pre_order';
                    }
                } else {
                    $stock = (int) ($variant->stock ?? 0);
                    $variant->stock_status = $stock > 0 ? 'in_stock' : 'out_of_stock';
                }
            }
        });

        static::saved(function (ProductVariant $variant) {
            $variant->product?->syncPricesFromVariants();
            $variant->product?->syncStockFromVariants();

            if (! \App\Services\MarketplaceStockSyncService::$isSyncing && \App\Services\MarketplaceStockSyncService::isAutoSyncEnabled()) {
                if ($variant->wasChanged('stock') || $variant->wasRecentlyCreated) {
                    \App\Services\MarketplaceStockSyncService::pushStockToMarketplacesForVariant($variant);
                }
            }
        });

        static::deleted(function (ProductVariant $variant) {
            $variant->product?->syncPricesFromVariants();
            $variant->product?->syncStockFromVariants();
        });
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }
}
