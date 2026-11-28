<?php

namespace App\Models;

use App\Models\Concerns\HasTranslations;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class Product extends Model
{
    use HasFactory, HasTranslations;

    protected $fillable = [
        'name',
        'slug',
        'series',
        'tagline',
        'description',
        'short_description',
        'tasting_notes',
        'origin',
        'warranty',
        'region',
        'farm',
        'producer',
        'varietal',
        'process',
        'altitude',
        'roast_level',
        'brew_methods',
        'freshness_days',
        'min_price',
        'max_price',
        'price_per_10g',
        'cost_price_per_10g',
        'tokopedia_url',
        'shopee_url',
        'tiktok_shop_url',
        'show_marketplace_links',
        'is_featured',
        'is_new',
        'is_preorder',
        'preorder_dp_percent',
        'status',
        'channel',
        'is_consignment',
        'consignor_id',
        'consignment_commission_type',
        'consignment_commission_rate',
        'consignment_payout_price',
        'stock',
        'stock_status',
        'released_at',
    ];

    protected $casts = [
        'tagline' => 'array',
        'description' => 'array',
        'brew_methods' => 'array',
        'is_featured' => 'boolean',
        'is_new' => 'boolean',
        'is_preorder' => 'boolean',
        'preorder_dp_percent' => 'integer',
        'min_price' => 'float',
        'max_price' => 'float',
        'price_per_10g' => 'float',
        'cost_price_per_10g' => 'float',
        'stock' => 'integer',
        'freshness_days' => 'integer',
        'released_at' => 'datetime',
        'is_flash_sale' => 'boolean',
        'show_marketplace_links' => 'boolean',
        'is_consignment' => 'boolean',
        'consignment_commission_rate' => 'float',
        'consignment_payout_price' => 'float',
    ];

    protected $appends = [
        'all_images',
        'price_per_10g',
        'is_flash_sale',
        'series_label',
        'is_out_of_stock',
    ];

    public function getIsOutOfStockAttribute(): bool
    {
        if (! empty($this->attributes['is_preorder']) || ($this->attributes['stock_status'] ?? 'in_stock') === 'pre_order') {
            return ($this->attributes['stock_status'] ?? 'pre_order') === 'out_of_stock';
        }

        if (isset($this->attributes['stock']) && (int) $this->attributes['stock'] <= 0) {
            return true;
        }

        if (($this->attributes['stock_status'] ?? 'in_stock') === 'out_of_stock') {
            return true;
        }

        if ($this->relationLoaded('variants') && $this->variants->isNotEmpty()) {
            return $this->variants->every(fn ($v) => (int) ($v->stock ?? 0) <= 0);
        }

        return false;
    }

    public function getSeriesLabelAttribute(): string
    {
        return static::getSeriesLabel($this->series);
    }

    protected static ?array $activeFlashSaleIdentifiers = null;

    public static function clearActiveFlashSaleCache(): void
    {
        static::$activeFlashSaleIdentifiers = null;
    }

    public function getIsFlashSaleAttribute(): bool
    {
        if (static::$activeFlashSaleIdentifiers === null) {
            $isActive = Setting::get('home_flash_sale_is_active', true);
            if (! $isActive) {
                static::$activeFlashSaleIdentifiers = [];
            } else {
                $items = Setting::get('home_flash_sale_items', []);
                $identifiers = [];
                if (is_array($items)) {
                    foreach ($items as $item) {
                        if (! empty($item['slug'])) {
                            $identifiers[(string) $item['slug']] = true;
                        }
                        if (! empty($item['product_id'])) {
                            $identifiers['id_'.$item['product_id']] = true;
                        }
                    }
                }
                static::$activeFlashSaleIdentifiers = $identifiers;
            }
        }

        if (empty(static::$activeFlashSaleIdentifiers)) {
            return false;
        }

        if (! empty($this->slug) && isset(static::$activeFlashSaleIdentifiers[(string) $this->slug])) {
            return true;
        }

        if (! empty($this->id) && isset(static::$activeFlashSaleIdentifiers['id_'.$this->id])) {
            return true;
        }

        return false;
    }

    public function getPricePer10gAttribute(): float
    {
        if (isset($this->attributes['price_per_10g']) && (float) $this->attributes['price_per_10g'] > 0) {
            return (float) $this->attributes['price_per_10g'];
        }

        // Fallback calculation: estimate per 10g from lowest/first variant or min_price
        if ($this->relationLoaded('variants') && $this->variants->isNotEmpty()) {
            // Find 100g, 200g, or 250g variant for standard retail estimation
            $variant = $this->variants->first(fn ($v) => $v->weight_grams >= 100 && $v->weight_grams <= 250)
                ?: $this->variants->first();

            if ($variant && $variant->weight_grams > 0 && $variant->price > 0) {
                return (float) round(($variant->price / $variant->weight_grams) * 10, -1);
            }
        }

        if ($this->min_price > 0) {
            return (float) round(($this->min_price / 200) * 10, -1);
        }

        return 3500.0;
    }

    public function getCostPricePer10gAttribute(): ?float
    {
        if (isset($this->attributes['cost_price_per_10g']) && (float) $this->attributes['cost_price_per_10g'] > 0) {
            return (float) $this->attributes['cost_price_per_10g'];
        }

        if ($this->relationLoaded('variants') && $this->variants->isNotEmpty()) {
            $variant = $this->variants->first(fn ($v) => $v->weight_grams >= 100 && $v->weight_grams <= 250 && ! empty($v->cost_price))
                ?: $this->variants->first(fn ($v) => ! empty($v->cost_price));

            if ($variant && $variant->weight_grams > 0 && (float) $variant->cost_price > 0) {
                return (float) round(((float) $variant->cost_price / $variant->weight_grams) * 10, -1);
            }
        }

        return null;
    }

    /**
     * Combine product gallery images and all variant packaging images into one unified gallery.
     *
     * @return array<int, array<string, mixed>>
     */
    public function getAllImagesAttribute(): array
    {
        $gallery = [];
        $seen = [];

        // 1. Add product gallery images first
        if ($this->relationLoaded('images')) {
            foreach ($this->images as $img) {
                if (! empty($img->path) && ! isset($seen[$img->path])) {
                    $seen[$img->path] = true;
                    $gallery[] = [
                        'path' => $img->path,
                        'alt' => $img->alt ?: $this->name,
                        'is_primary' => (bool) $img->is_primary,
                        'is_variant' => false,
                        'variant_id' => null,
                        'variant_label' => null,
                    ];
                }
            }
        }

        // 2. Combine all variant packaging photos
        if ($this->relationLoaded('variants')) {
            foreach ($this->variants as $variant) {
                $vPath = $variant->image_url ?? $variant->image;
                if (! empty($vPath) && ! isset($seen[$vPath])) {
                    $seen[$vPath] = true;
                    $gallery[] = [
                        'path' => $vPath,
                        'alt' => "Kemasan {$variant->label} - {$this->name}",
                        'is_primary' => false,
                        'is_variant' => true,
                        'variant_id' => $variant->id,
                        'variant_label' => $variant->label,
                    ];
                }
            }
        }

        return $gallery;
    }

    public function categories(): BelongsToMany
    {
        return $this->belongsToMany(Category::class);
    }

    public function variants(): HasMany
    {
        return $this->hasMany(ProductVariant::class)->orderBy('price');
    }

    public function images(): HasMany
    {
        return $this->hasMany(ProductImage::class)->orderBy('sort_order');
    }

    public function primaryImage(): HasOne
    {
        return $this->hasOne(ProductImage::class)->where('is_primary', true);
    }

    public function consignor(): BelongsTo
    {
        return $this->belongsTo(Consignor::class);
    }

    /**
     * Calculate vendor payout & store commission for a given selling price.
     *
     * @return array{vendor_payout: float, store_commission: float}
     */
    public function calculateConsignmentSplit(float $sellingPrice, ?ProductVariant $variant = null): array
    {
        if (! $this->is_consignment) {
            return [
                'vendor_payout' => 0.0,
                'store_commission' => $sellingPrice,
            ];
        }

        $type = $this->consignment_commission_type ?: 'percentage';

        if ($type === 'fixed_cost') {
            $payout = (float) ($variant?->consignment_payout_price ?? $this->consignment_payout_price ?? 0);
            if ($payout <= 0 && $variant && (float) $variant->cost_price > 0) {
                $payout = (float) $variant->cost_price;
            }
            $payout = min($sellingPrice, max(0.0, $payout));
            $commission = max(0.0, $sellingPrice - $payout);

            return [
                'vendor_payout' => $payout,
                'store_commission' => $commission,
            ];
        }

        // Percentage-based commission
        $rate = (float) ($this->consignment_commission_rate ?? 20.00);
        $commission = round($sellingPrice * ($rate / 100), 2);
        $payout = max(0.0, $sellingPrice - $commission);

        return [
            'vendor_payout' => $payout,
            'store_commission' => $commission,
        ];
    }

    public function syncPricesFromVariants(): void
    {
        if ($this->variants()->exists()) {
            $this->updateQuietly([
                'min_price' => (float) ($this->variants()->min('price') ?? 0),
                'max_price' => (float) ($this->variants()->max('price') ?? 0),
            ]);
        }
    }

    public function syncStockFromVariants(): void
    {
        if (! \Illuminate\Support\Facades\Schema::hasColumn('products', 'stock')) {
            return;
        }

        if ($this->variants()->exists()) {
            $totalStock = (int) $this->variants()->sum('stock');

        if ($this->is_preorder) {
            $this->updateQuietly([
                'stock' => $totalStock,
                'stock_status' => $this->stock_status === 'out_of_stock' ? 'out_of_stock' : 'pre_order',
            ]);
        } else {
            $this->updateQuietly([
                'stock' => $totalStock,
                'stock_status' => $totalStock > 0 ? 'in_stock' : 'out_of_stock',
            ]);
        }
        }
    }

    protected static function booted(): void
    {
        static::saving(function (Product $product) {
            if (! \Illuminate\Support\Facades\Schema::hasColumn('products', 'stock')) {
                return;
            }

            if ($product->relationLoaded('variants') && $product->variants->isNotEmpty()) {
                $product->stock = (int) $product->variants->sum('stock');
            }

            $stock = (int) ($product->stock ?? 0);
            if ($product->is_preorder) {
                $product->stock_status = $product->stock_status === 'out_of_stock' ? 'out_of_stock' : 'pre_order';
                $price = (float) ($product->min_price ?? 0);
                if ($price <= 0 && $product->exists) {
                    $price = (float) ($product->variants()->min('price') ?? 0);
                }
                if ($price > 0) {
                    $product->preorder_dp_percent = static::resolveMinPreorderDpPercent($price);
                }
            } else {
                $product->stock_status = $stock > 0 ? 'in_stock' : 'out_of_stock';
                $product->preorder_dp_percent = 100;
            }
        });

        static::saved(function (Product $product) {
            if ($product->is_preorder && $product->stock_status !== 'out_of_stock' && ($product->wasChanged('is_preorder') || $product->wasChanged('stock_status'))) {
                $product->variants()->where('stock_status', 'out_of_stock')->update(['stock_status' => 'pre_order']);
            }
            if (! \App\Services\MarketplaceStockSyncService::$isSyncing && \App\Services\MarketplaceStockSyncService::isAutoSyncEnabled()) {
                if (! $product->variants()->exists() && ($product->wasChanged('stock') || $product->wasRecentlyCreated)) {
                    \App\Services\MarketplaceStockSyncService::pushStockToMarketplacesForProduct($product);
                }
            }
        });
    }

    public function ensurePrimaryImage(): void
    {
        if ($this->images()->exists() && ! $this->images()->where('is_primary', true)->exists()) {
            $this->images()->orderBy('sort_order')->orderBy('id')->first()?->update(['is_primary' => true]);
        }
    }

    /**
     * Duplicate this product along with its categories, variants, and gallery images.
     */
    public function duplicate(string $newName, ?string $newSlug = null): self
    {
        return DB::transaction(function () use ($newName, $newSlug) {
            $newProduct = $this->replicate([
                'id',
                'created_at',
                'updated_at',
            ]);

            $slug = Str::slug($newSlug ?: $newName);
            if ($slug === $this->slug) {
                $slug .= '-salinan';
            }
            $originalSlug = $slug;
            $counter = 1;
            while (static::where('slug', $slug)->exists()) {
                $slug = "{$originalSlug}-{$counter}";
                $counter++;
            }

            $newProduct->name = $newName;
            $newProduct->slug = $slug;
            $newProduct->is_featured = false;
            $newProduct->is_new = true;
            $newProduct->stock_status = 'in_stock';
            $newProduct->status = 'active';
            $newProduct->created_at = now();
            $newProduct->updated_at = now();
            $newProduct->save();

            // 1. Duplicate categories
            if ($this->categories()->exists()) {
                $newProduct->categories()->sync($this->categories->pluck('id'));
            }

            // 2. Duplicate variants
            foreach ($this->variants as $variant) {
                $newVariant = $variant->replicate(['id', 'product_id', 'created_at', 'updated_at']);
                $newVariant->product_id = $newProduct->id;
                if (! empty($newVariant->sku)) {
                    $newVariant->sku = $newVariant->sku.'-COPY-'.strtoupper(Str::random(3));
                }
                $newVariant->save();
            }

            // 3. Duplicate gallery images
            foreach ($this->images as $img) {
                $newImg = $img->replicate(['id', 'product_id', 'created_at', 'updated_at']);
                $newImg->product_id = $newProduct->id;
                $newImg->save();
            }

            // 4. Ensure prices and primary image
            $newProduct->syncPricesFromVariants();
            $newProduct->ensurePrimaryImage();

            return $newProduct;
        });
    }

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('status', 'active');
    }

    public function scopeForWebsite(Builder $query): Builder
    {
        return $query->where(function (Builder $q) {
            $q->whereIn('channel', ['all', 'web'])
                ->orWhereNull('channel');
        });
    }

    public function scopeForPos(Builder $query): Builder
    {
        return $query->where(function (Builder $q) {
            $q->whereIn('channel', ['all', 'pos'])
                ->orWhereNull('channel');
        });
    }

    public function scopeFeatured(Builder $query): Builder
    {
        return $query->where('is_featured', true);
    }

    public function scopeBySeries(Builder $query, string $series): Builder
    {
        return $query->where('series', $series);
    }

    /**
     * Default list of product series/lini.
     *
     * @return array<int, array{name: string, slug: string, description: string, badge_color: string, is_active: bool}>
     */
    public static function defaultSeriesList(): array
    {
        return [
            [
                'name' => 'Gunung Kawi Terroir',
                'slug' => 'kawi',
                'description' => 'Kopi khas lereng Gunung Kawi dengan karakter terroir vulkanik Malang.',
                'badge_color' => 'amber',
                'is_active' => true,
            ],
            [
                'name' => 'Classic Series',
                'slug' => 'classic',
                'description' => 'Koleksi kopi profil klasik seimbang untuk seduhan harian.',
                'badge_color' => 'emerald',
                'is_active' => true,
            ],
            [
                'name' => 'CO-Ferment Experimental',
                'slug' => 'co-ferment',
                'description' => 'Fermentasi inovatif beraroma buah intens dan rasa unik modern.',
                'badge_color' => 'purple',
                'is_active' => true,
            ],
            [
                'name' => 'Espresso & Blend',
                'slug' => 'espresso',
                'description' => 'Sangrai khusus espresso mesin maupun manual brew dengan body tebal.',
                'badge_color' => 'rose',
                'is_active' => true,
            ],
            [
                'name' => 'Experimental Series',
                'slug' => 'experimental',
                'description' => 'Eksperimen proses pascapanen terkini untuk eksplorasi cita rasa.',
                'badge_color' => 'indigo',
                'is_active' => true,
            ],
            [
                'name' => 'Houseblend Collection',
                'slug' => 'houseblend',
                'description' => 'Racikan khas Sanubari untuk kafe dan kebutuhan komersial.',
                'badge_color' => 'sky',
                'is_active' => true,
            ],
            [
                'name' => 'Specialty Arabica',
                'slug' => 'arabica',
                'description' => 'Biji kopi arabika pilihan dari berbagai perkebunan Nusantara.',
                'badge_color' => 'teal',
                'is_active' => true,
            ],
            [
                'name' => 'Fine Robusta',
                'slug' => 'robusta',
                'description' => 'Robusta petik merah kualitas fine dengan karakter nutty dan dark chocolate.',
                'badge_color' => 'orange',
                'is_active' => true,
            ],
            [
                'name' => 'Alat Kopi & Seduh',
                'slug' => 'alat-kopi',
                'description' => 'Peralatan seduh manual, grinder, timbangan digital, dan aksesori barista.',
                'badge_color' => 'info',
                'is_active' => true,
            ],
        ];
    }

    /**
     * Get configured series list from settings or defaults.
     *
     * @return array<int, array{name: string, slug: string, description?: string, badge_color?: string, is_active?: bool}>
     */
    public static function getSeriesList(bool $onlyActive = false): array
    {
        $list = Setting::get('product_series', null);
        if (! is_array($list) || empty($list)) {
            $list = static::defaultSeriesList();
        }

        if ($onlyActive) {
            $list = array_values(array_filter($list, fn ($item) => ($item['is_active'] ?? true) === true));
        }

        return $list;
    }

    /**
     * Get slug => name options for dropdowns and filters.
     *
     * @return array<string, string>
     */
    public static function getSeriesOptions(bool $onlyActive = true, bool $includeExistingValues = false): array
    {
        $list = static::getSeriesList($onlyActive);
        $options = [];

        foreach ($list as $item) {
            $slug = trim($item['slug'] ?? '');
            $name = trim($item['name'] ?? '');
            if ($slug !== '' && $name !== '') {
                if (! isset($options[$slug])) {
                    $options[$slug] = $name;
                }
            }
        }

        if ($includeExistingValues) {
            try {
                $existing = static::distinct()->whereNotNull('series')->where('series', '!=', '')->pluck('series')->toArray();
                foreach ($existing as $slug) {
                    if (! isset($options[$slug])) {
                        $options[$slug] = ucwords(str_replace(['-', '_'], ' ', $slug));
                    }
                }
            } catch (\Throwable $e) {
                // Ignore fallback error if database not ready
            }
        }

        return $options;
    }

    /**
     * Get human-readable label for a given series slug.
     */
    public static function getSeriesLabel(?string $slug): string
    {
        if (empty($slug)) {
            return '';
        }

        $allList = static::getSeriesList(false);
        foreach ($allList as $item) {
            if (($item['slug'] ?? '') === $slug && ! empty($item['name'])) {
                return $item['name'];
            }
        }

        $legacy = [
            'kawi' => 'Gunung Kawi Terroir',
            'classic' => 'Classic Series',
            'co-ferment' => 'CO-Ferment Experimental',
            'espresso' => 'Espresso Beans',
            'filter' => 'Filter Beans',
            'robusta' => 'Robusta',
            'houseblend' => 'Houseblend',
            'arabica' => 'Arabica',
            'alat-kopi' => 'Alat Kopi & Seduh',
            'custom-blend' => 'Custom Blend (BYOB)',
            'byob' => 'Custom Blend (BYOB)',
        ];

        return $legacy[$slug] ?? ucwords(str_replace(['-', '_'], ' ', $slug));
    }

    /**
     * Get badge color for a given series slug.
     */
    public static function getSeriesBadgeColor(?string $slug): string
    {
        if (empty($slug)) {
            return 'gray';
        }

        $list = static::getSeriesList(false);
        foreach ($list as $item) {
            if (($item['slug'] ?? '') === $slug && ! empty($item['badge_color'])) {
                return $item['badge_color'];
            }
        }

        return match ($slug) {
            'filter' => 'amber',
            'espresso' => 'emerald',
            'robusta' => 'orange',
            'co-ferment' => 'purple',
            'kawi' => 'amber',
            'alat-kopi' => 'info',
            default => 'gray',
        };
    }

    /**
     * Resolve minimum pre-order DP percentage based on product price.
     */
    public static function resolveMinPreorderDpPercent(float $price): int
    {
        if ($price < 30_000_000) {
            return 30;
        }

        if ($price <= 50_000_000) {
            return 50;
        }

        return 70;
    }
}
