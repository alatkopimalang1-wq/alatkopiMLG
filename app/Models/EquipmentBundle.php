<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class EquipmentBundle extends Model
{
    protected $fillable = [
        'name',
        'slug',
        'description',
        'banner_image',
        'is_active',
        'sort_order',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'sort_order' => 'integer',
    ];

    public function slots(): HasMany
    {
        return $this->hasMany(EquipmentBundleSlot::class)->orderBy('sort_order')->orderBy('id');
    }

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }

    public static function generateUniqueSlug(string $name, ?int $ignoreId = null): string
    {
        $base = Str::slug($name) ?: 'paket-bundling';
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
     * Serialize this bundle into a ProductCard-compatible payload so it can
     * be displayed alongside regular products in /shop, search, and /paket-bundling.
     */
    public function toProductCardArray(): array
    {
        $this->loadMissing([
            'slots.category',
            'slots.items.product.primaryImage',
            'slots.items.variant',
        ]);

        $minNormalPrice = 0.0;
        $minBundlePrice = 0.0;
        $maxDiscountPercent = 0.0;
        $hasOptionalOnly = true;

        foreach ($this->slots as $slot) {
            $discountPct = max(0.0, min(100.0, (float) ($slot->discount_percent ?? 0)));
            if ($discountPct > $maxDiscountPercent) {
                $maxDiscountPercent = $discountPct;
            }

            if ($slot->slot_type === 'free') {
                $hasOptionalOnly = false;
                $first = $slot->items->first();
                if ($first && $first->variant) {
                    $minNormalPrice += (float) ($first->variant->original_price ?: $first->variant->price);
                }

                continue;
            }

            if (! $slot->is_optional) {
                $hasOptionalOnly = false;
            }

            $cheapestNormal = null;
            $cheapestBundle = null;

            $catIds = $slot->resolvedCategoryIds();
            if ($slot->slot_type === 'selectable' && ! empty($catIds)) {
                $catProducts = Product::active()
                    ->whereHas('categories', fn ($q) => $q->whereIn('categories.id', $catIds))
                    ->with('variants')
                    ->get();

                foreach ($catProducts as $prod) {
                    foreach ($prod->variants as $variant) {
                        $base = (float) $variant->price;
                        $normal = (float) ($variant->original_price ?: $base);
                        $bundled = (float) round($base * (1 - ($discountPct / 100)));
                        if ($cheapestBundle === null || $bundled < $cheapestBundle) {
                            $cheapestBundle = $bundled;
                            $cheapestNormal = $normal;
                        }
                    }
                }
            } else {
                foreach ($slot->items as $item) {
                    if (! $item->variant) {
                        continue;
                    }
                    $normal = (float) ($item->variant->original_price ?: $item->variant->price);
                    $bundled = $item->bundle_price !== null
                        ? (float) $item->bundle_price
                        : (float) $item->variant->price;
                    if ($cheapestBundle === null || $bundled < $cheapestBundle) {
                        $cheapestBundle = $bundled;
                        $cheapestNormal = $normal;
                    }
                }
            }

            if (! $slot->is_optional && $cheapestBundle !== null) {
                $minBundlePrice += $cheapestBundle;
                $minNormalPrice += $cheapestNormal ?? $cheapestBundle;
            }
        }

        // If all slots are optional, use the cheapest single slot as starting price
        if ($hasOptionalOnly && $minBundlePrice <= 0 && $this->slots->isNotEmpty()) {
            foreach ($this->slots as $slot) {
                $discountPct = max(0.0, min(100.0, (float) ($slot->discount_percent ?? 0)));
                $slotCatIds = $slot->resolvedCategoryIds();
                if ($slot->slot_type === 'selectable' && ! empty($slotCatIds)) {
                    $catProducts = Product::active()
                        ->whereHas('categories', fn ($q) => $q->whereIn('categories.id', $slotCatIds))
                        ->with('variants')
                        ->get();
                    foreach ($catProducts as $prod) {
                        foreach ($prod->variants as $variant) {
                            $bundled = (float) round((float) $variant->price * (1 - ($discountPct / 100)));
                            $normal = (float) ($variant->original_price ?: $variant->price);
                            if ($minBundlePrice <= 0 || $bundled < $minBundlePrice) {
                                $minBundlePrice = $bundled;
                                $minNormalPrice = $normal;
                            }
                        }
                    }
                }
            }
        }

        $slotsCount = $this->slots->count();

        return [
            'id' => 1000000 + $this->id,
            'name' => $this->name,
            'slug' => $this->slug,
            'series' => 'paket-bundling',
            'series_label' => 'Paket Bundling Custom',
            'origin' => 'Paket Bundling',
            'tasting_notes' => $this->description ?: "Custom {$slotsCount} item sesuai kebutuhan + diskon khusus",
            'freshness_days' => 0,
            'min_price' => $minBundlePrice,
            'max_price' => $minBundlePrice,
            'is_featured' => true,
            'is_new' => false,
            'is_preorder' => false,
            'is_flash_sale' => false,
            'status' => 'active',
            'stock_status' => 'in_stock',
            'is_out_of_stock' => false,
            'is_bundle' => true,
            'bundle_url' => "/paket-bundling/{$this->slug}",
            'slots_count' => $slotsCount,
            'max_discount_percent' => $maxDiscountPercent,
            'images' => $this->banner_image ? [[
                'id' => 0,
                'product_id' => 0,
                'path' => $this->banner_image,
                'alt' => $this->name,
                'sort_order' => 0,
                'is_primary' => true,
            ]] : [],
            'variants' => [[
                'id' => 1000000 + $this->id,
                'product_id' => 1000000 + $this->id,
                'label' => "{$slotsCount} Item Custom",
                'weight_grams' => 0,
                'price' => $minBundlePrice,
                'original_price' => $minNormalPrice > $minBundlePrice ? $minNormalPrice : null,
                'stock_status' => 'in_stock',
            ]],
        ];
    }
}
