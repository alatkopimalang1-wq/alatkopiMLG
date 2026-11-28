<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MarketplaceProductMapping extends Model
{
    use HasFactory;

    protected $fillable = [
        'platform',
        'product_id',
        'product_variant_id',
        'marketplace_product_id',
        'marketplace_product_name',
        'marketplace_image_url',
        'marketplace_sku_id',
        'marketplace_sku_name',
        'seller_sku',
        'last_synced_stock',
        'marketplace_stock',
        'marketplace_price',
        'last_synced_at',
        'sync_status',
        'sync_message',
        'marketplace_status',
    ];

    public function scopeActiveMarketplace($query)
    {
        return $query->where('marketplace_status', 'ACTIVATE');
    }

    protected $casts = [
        'last_synced_stock' => 'integer',
        'marketplace_stock' => 'integer',
        'marketplace_price' => 'decimal:2',
        'last_synced_at' => 'datetime',
    ];

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function variant(): BelongsTo
    {
        return $this->belongsTo(ProductVariant::class, 'product_variant_id');
    }

    public function getIsConnectedAttribute(): bool
    {
        return ! empty($this->product_id);
    }

    public function getPlatformLabelAttribute(): string
    {
        return match ($this->platform) {
            'shopee' => 'Shopee',
            'tiktok' => 'TikTok Shop',
            default => ucfirst((string) $this->platform),
        };
    }

    public function getRealWebsiteStockAttribute(): ?int
    {
        if (! $this->is_connected) {
            return null;
        }

        if ($this->variant) {
            return (int) ($this->variant->stock ?? 0);
        }

        if ($this->product) {
            return (int) ($this->product->stock ?? 0);
        }

        return null;
    }

    public function getWebsiteStockAttribute(): ?int
    {
        return $this->real_website_stock;
    }

    public function getWebsiteImageUrlAttribute(): ?string
    {
        if (! $this->is_connected) {
            return null;
        }

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

    public function getIsWebsiteOutOfStockAttribute(): bool
    {
        if (! $this->is_connected) {
            return false;
        }

        $stock = $this->real_website_stock;

        return $stock === null || $stock <= 0;
    }

    public function getWebsiteStockLabelAttribute(): string
    {
        if (! $this->is_connected) {
            return '-';
        }

        $stock = $this->real_website_stock;

        return (string) ($stock ?? 0);
    }

    public function getIsStockConflictAttribute(): bool
    {
        if (! $this->is_connected) {
            return false;
        }

        return (int) $this->marketplace_stock !== (int) ($this->real_website_stock ?? 0);
    }

    public static function syncAllMarketplaceStockToWebsite(?string $platform = null): array
    {
        $query = static::where('marketplace_status', 'ACTIVATE')
            ->whereNotNull('product_id')
            ->with(['product', 'variant']);

        if ($platform) {
            $query->where('platform', $platform);
        }

        $mappings = $query->get();
        $updated = 0;

        foreach ($mappings as $mapping) {
            $mpStock = (int) $mapping->marketplace_stock;
            $changed = false;

            if ($mapping->variant) {
                if ((int) $mapping->variant->stock !== $mpStock) {
                    $mapping->variant->stock = $mpStock;
                    $mapping->variant->save();
                    $changed = true;
                }
            } elseif ($mapping->product) {
                if ((int) $mapping->product->stock !== $mpStock) {
                    $mapping->product->stock = $mpStock;
                    $mapping->product->save();
                    $changed = true;
                }
            }

            if ($changed) {
                $updated++;
                $mapping->update([
                    'last_synced_stock' => $mpStock,
                    'last_synced_at' => now(),
                    'sync_status' => 'synced',
                    'sync_message' => "Stok website diselaraskan menjadi {$mpStock} dari {$mapping->platform_label}.",
                ]);
            }
        }

        return ['updated' => $updated];
    }
}
