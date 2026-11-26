<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class FixedBundle extends Model
{
    protected $fillable = [
        'name',
        'slug',
        'description',
        'banner_image',
        'discount_percent',
        'is_active',
        'sort_order',
    ];

    protected $casts = [
        'discount_percent' => 'float',
        'is_active' => 'boolean',
        'sort_order' => 'integer',
    ];

    public function items(): HasMany
    {
        return $this->hasMany(FixedBundleItem::class)->orderBy('sort_order')->orderBy('id');
    }

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }

    public static function generateUniqueSlug(string $name, ?int $ignoreId = null): string
    {
        $base = Str::slug($name) ?: 'produk-bundling';
        $slug = $base;
        $i = 1;

        while (static::where('slug', $slug)
            ->when($ignoreId, fn ($q) => $q->where('id', '!=', $ignoreId))
            ->exists()) {
            $slug = "{$base}-{$i}";
            $i++;
        }

        return $slug;
    }

    /**
     * Serialize this fixed bundle into a ProductCard-compatible payload.
     */
    public function toProductCardArray(): array
    {
        $this->loadMissing(['items.product.primaryImage', 'items.variant']);

        $discountPct = max(0.0, min(100.0, (float) ($this->discount_percent ?? 0)));
        $totalNormal = 0.0;
        $totalDiscounted = 0.0;
        $isOutOfStock = false;

        foreach ($this->items as $item) {
            $prod = $item->product;
            $variant = $item->variant;
            if (! $prod || ! $variant) {
                continue;
            }
            $qty = max(1, (int) ($item->quantity ?? 1));
            $base = (float) $variant->price;
            $normal = (float) ($variant->original_price ?: $base);
            $discounted = (float) round($base * (1 - ($discountPct / 100)));

            $totalNormal += $normal * $qty;
            $totalDiscounted += $discounted * $qty;

            $isPreorder = (bool) ($prod->is_preorder ?? false)
                || $prod->stock_status === 'pre_order'
                || $variant->stock_status === 'pre_order';

            if ($isPreorder) {
                if ($prod->stock_status === 'out_of_stock' || $variant->stock_status === 'out_of_stock') {
                    $isOutOfStock = true;
                }
            } else {
                if ($prod->stock_status === 'out_of_stock'
                    || $variant->stock_status === 'out_of_stock'
                    || (int) ($variant->stock ?? 0) < $qty) {
                    $isOutOfStock = true;
                }
            }
        }

        $itemsCount = $this->items->count();
        $firstImage = $this->banner_image
            ?: $this->items->first()?->variant?->image
            ?: $this->items->first()?->product?->primaryImage?->path;

        return [
            'id' => 2000000 + $this->id,
            'name' => $this->name,
            'slug' => $this->slug,
            'series' => 'paket-bundling',
            'series_label' => 'Produk Bundling',
            'origin' => 'Produk Bundling',
            'tasting_notes' => $this->description ?: "Paket hemat {$itemsCount} produk pilihan",
            'freshness_days' => 0,
            'min_price' => $totalDiscounted,
            'max_price' => $totalDiscounted,
            'is_featured' => true,
            'is_new' => false,
            'is_preorder' => false,
            'is_flash_sale' => false,
            'status' => 'active',
            'stock_status' => $isOutOfStock ? 'out_of_stock' : 'in_stock',
            'is_out_of_stock' => $isOutOfStock,
            'is_bundle' => true,
            'bundle_url' => "/produk-bundling/{$this->slug}",
            'slots_count' => $itemsCount,
            'max_discount_percent' => $discountPct,
            'images' => $firstImage ? [[
                'id' => 0,
                'product_id' => 0,
                'path' => $firstImage,
                'alt' => $this->name,
                'sort_order' => 0,
                'is_primary' => true,
            ]] : [],
            'variants' => [[
                'id' => 2000000 + $this->id,
                'product_id' => 2000000 + $this->id,
                'label' => "{$itemsCount} Produk",
                'weight_grams' => 0,
                'price' => $totalDiscounted,
                'original_price' => $totalNormal > $totalDiscounted ? $totalNormal : null,
                'stock_status' => $isOutOfStock ? 'out_of_stock' : 'in_stock',
            ]],
        ];
    }
}
