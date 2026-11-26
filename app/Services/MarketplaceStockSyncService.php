<?php

namespace App\Services;

use App\Models\MarketplaceProductMapping;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\Setting;
use Illuminate\Support\Facades\Log;

class MarketplaceStockSyncService
{
    /**
     * Prevents recursive synchronization loops between website and marketplaces.
     */
    public static bool $isSyncing = false;

    public static function isAutoSyncEnabled(): bool
    {
        return (bool) Setting::get('marketplace_auto_sync_stock', false);
    }

    public static function isWebsiteToMpEnabled(): bool
    {
        return (bool) Setting::get('auto_sync_website_to_mp', true);
    }

    public static function isMpToWebsiteEnabled(): bool
    {
        return static::isAutoSyncEnabled() && (bool) Setting::get('auto_sync_mp_to_website', true);
    }

    /**
     * Handle local order item deduction when order is placed on Website or POS.
     * Decrements stock in database and pushes new stock to Shopee & TikTok Shop.
     */
    public static function handleLocalOrderItemDeduction(OrderItem $item): void
    {
        $qty = (int) $item->quantity;
        if ($qty <= 0) {
            return;
        }

        // 1. If item has product_variant_id
        if ($item->product_variant_id) {
            $variant = ProductVariant::with('product')->find($item->product_variant_id);
            if ($variant) {
                if ($variant->product && ($variant->product->is_preorder || $variant->product->stock_status === 'pre_order')) {
                    return;
                }
                $newStock = max(0, (int) ($variant->stock ?? 0) - $qty);
                $variant->stock = $newStock;
                $variant->stock_status = $newStock > 0 ? 'in_stock' : 'out_of_stock';
                $variant->save();

                // Recalculate parent product total stock
                $variant->product?->syncStockFromVariants();

                // 2. If automatic marketplace sync is enabled, sync to Shopee & TikTok
                if (static::isAutoSyncEnabled() && static::isWebsiteToMpEnabled()) {
                    static::pushStockToMarketplacesForVariant($variant);
                }
            }
        } elseif ($item->product_id) {
            // If item only has product_id
            $product = Product::find($item->product_id);
            if ($product) {
                if ($product->is_preorder || $product->stock_status === 'pre_order') {
                    return;
                }
                $newStock = max(0, (int) ($product->stock ?? 0) - $qty);
                $product->stock = $newStock;
                $product->stock_status = $newStock > 0 ? 'in_stock' : 'out_of_stock';
                $product->save();

                if (static::isAutoSyncEnabled() && static::isWebsiteToMpEnabled()) {
                    static::pushStockToMarketplacesForProduct($product);
                }
            }
        }
    }

    /**
     * Push current variant stock to all connected marketplace listings (Shopee & TikTok).
     */
    public static function pushStockToMarketplacesForVariant(ProductVariant $variant): array
    {
        $mappings = MarketplaceProductMapping::where('product_variant_id', $variant->id)
            ->where('marketplace_status', 'ACTIVATE')
            ->get();

        $updated = 0;
        $stock = (int) ($variant->stock ?? 0);

        foreach ($mappings as $mapping) {
            try {
                if ($mapping->platform === 'shopee') {
                    $service = new ShopeeService();
                    $service->updateSingleSkuInventory(
                        $mapping->marketplace_product_id,
                        $mapping->marketplace_sku_id,
                        $stock
                    );
                } elseif ($mapping->platform === 'tiktok') {
                    $service = new TikTokShopService();
                    $service->updateSingleSkuInventory(
                        $mapping->marketplace_product_id,
                        $mapping->marketplace_sku_id,
                        $stock
                    );
                }

                $mapping->update([
                    'marketplace_stock' => $stock,
                    'last_synced_stock' => $stock,
                    'last_synced_at' => now(),
                    'sync_status' => 'synced',
                    'sync_message' => "Stok otomatis disinkronkan ({$stock} pcs) dari Website.",
                ]);

                $updated++;
            } catch (\Throwable $e) {
                Log::warning("Auto-sync stock to {$mapping->platform} failed for SKU {$mapping->marketplace_sku_id}: " . $e->getMessage());
            }
        }

        return ['updated' => $updated];
    }

    /**
     * Push current product stock to all connected marketplace listings (Shopee & TikTok).
     */
    public static function pushStockToMarketplacesForProduct(Product $product): array
    {
        $mappings = MarketplaceProductMapping::where('product_id', $product->id)
            ->whereNull('product_variant_id')
            ->where('marketplace_status', 'ACTIVATE')
            ->get();

        $updated = 0;
        $stock = (int) ($product->stock ?? 0);

        foreach ($mappings as $mapping) {
            try {
                if ($mapping->platform === 'shopee') {
                    $service = new ShopeeService();
                    $service->updateSingleSkuInventory(
                        $mapping->marketplace_product_id,
                        $mapping->marketplace_sku_id,
                        $stock
                    );
                } elseif ($mapping->platform === 'tiktok') {
                    $service = new TikTokShopService();
                    $service->updateSingleSkuInventory(
                        $mapping->marketplace_product_id,
                        $mapping->marketplace_sku_id,
                        $stock
                    );
                }

                $mapping->update([
                    'marketplace_stock' => $stock,
                    'last_synced_stock' => $stock,
                    'last_synced_at' => now(),
                    'sync_status' => 'synced',
                    'sync_message' => "Stok otomatis disinkronkan ({$stock} pcs) dari Website.",
                ]);

                $updated++;
            } catch (\Throwable $e) {
                Log::warning("Auto-sync stock to {$mapping->platform} failed for Product {$mapping->marketplace_product_id}: " . $e->getMessage());
            }
        }

        return ['updated' => $updated];
    }

    /**
     * Synchronize marketplace stocks back to Website & POS.
     * Called by webhook or scheduled cron to detect marketplace sales.
     */
    public static function syncMarketplaceStockToWebsite(?string $platform = null): array
    {
        if (! static::isAutoSyncEnabled() || ! static::isMpToWebsiteEnabled()) {
            return ['updated' => 0, 'skipped' => 'Auto-sync is disabled'];
        }

        // Pull latest catalog & stock from marketplaces
        if ($platform === null || $platform === 'shopee') {
            try {
                $shopee = new ShopeeService();
                $shopee->syncProducts();
            } catch (\Throwable $e) {
                Log::warning('Shopee auto-sync pull failed: ' . $e->getMessage());
            }
        }

        if ($platform === null || $platform === 'tiktok') {
            try {
                $tiktok = new TikTokShopService();
                $tiktok->syncProducts();
            } catch (\Throwable $e) {
                Log::warning('TikTok auto-sync pull failed: ' . $e->getMessage());
            }
        }

        static::$isSyncing = true;
        try {
            // Check mappings where marketplace_stock decreased compared to last_synced_stock
            $query = MarketplaceProductMapping::where('marketplace_status', 'ACTIVATE')
                ->whereNotNull('product_id')
                ->with(['variant', 'product']);

            if ($platform) {
                $query->where('platform', $platform);
            }

            $mappings = $query->get();
            $updated = 0;

            foreach ($mappings as $mapping) {
                $currentMpStock = (int) $mapping->marketplace_stock;
                $lastStock = (int) ($mapping->last_synced_stock ?? $currentMpStock);

                // If marketplace stock decreased (sale / order placed on marketplace):
                if ($currentMpStock < $lastStock) {
                    $soldQty = $lastStock - $currentMpStock;

                    if ($mapping->variant) {
                        if ($mapping->variant->product && ($mapping->variant->product->is_preorder || $mapping->variant->product->stock_status === 'pre_order')) {
                            continue;
                        }
                        $newStock = max(0, (int) ($mapping->variant->stock ?? 0) - $soldQty);
                        $mapping->variant->stock = $newStock;
                        $mapping->variant->stock_status = $newStock > 0 ? 'in_stock' : 'out_of_stock';
                        $mapping->variant->save();
                        $mapping->variant->product?->syncStockFromVariants();

                        // Push the new stock to the OTHER marketplace if connected
                        static::pushStockToOtherMarketplace($mapping, $newStock);
                        $updated++;
                    } elseif ($mapping->product) {
                        if ($mapping->product->is_preorder || $mapping->product->stock_status === 'pre_order') {
                            continue;
                        }
                        $newStock = max(0, (int) ($mapping->product->stock ?? 0) - $soldQty);
                        $mapping->product->stock = $newStock;
                        $mapping->product->stock_status = $newStock > 0 ? 'in_stock' : 'out_of_stock';
                        $mapping->product->save();

                        static::pushStockToOtherMarketplace($mapping, $newStock);
                        $updated++;
                    }

                    $mapping->update([
                        'last_synced_stock' => $currentMpStock,
                        'last_synced_at' => now(),
                        'sync_status' => 'synced',
                        'sync_message' => "Stok website otomatis berkurang ({$soldQty} pcs) setelah ada pesanan di {$mapping->platform_label}.",
                    ]);
                } elseif ($currentMpStock > $lastStock) {
                    // Update last_synced_stock if marketplace stock increased
                    $mapping->update([
                        'last_synced_stock' => $currentMpStock,
                    ]);
                }
            }

            return ['updated' => $updated];
        } finally {
            static::$isSyncing = false;
        }
    }

    /**
     * Push stock to the other marketplace (e.g. if sale was on Shopee, also update TikTok Shop).
     */
    protected static function pushStockToOtherMarketplace(MarketplaceProductMapping $sourceMapping, int $stock): void
    {
        $otherPlatform = $sourceMapping->platform === 'shopee' ? 'tiktok' : 'shopee';

        $otherQuery = MarketplaceProductMapping::where('platform', $otherPlatform)
            ->where('marketplace_status', 'ACTIVATE');

        if ($sourceMapping->product_variant_id) {
            $otherQuery->where('product_variant_id', $sourceMapping->product_variant_id);
        } else {
            $otherQuery->where('product_id', $sourceMapping->product_id)->whereNull('product_variant_id');
        }

        $otherMappings = $otherQuery->get();

        foreach ($otherMappings as $other) {
            try {
                if ($other->platform === 'shopee') {
                    $service = new ShopeeService();
                    $service->updateSingleSkuInventory($other->marketplace_product_id, $other->marketplace_sku_id, $stock);
                } else {
                    $service = new TikTokShopService();
                    $service->updateSingleSkuInventory($other->marketplace_product_id, $other->marketplace_sku_id, $stock);
                }

                $other->update([
                    'marketplace_stock' => $stock,
                    'last_synced_stock' => $stock,
                    'last_synced_at' => now(),
                    'sync_status' => 'synced',
                ]);
            } catch (\Throwable $e) {
                Log::warning("Cross-sync to {$other->platform} failed: " . $e->getMessage());
            }
        }
    }

    /**
     * Handle incoming Shopee Webhook.
     */
    public static function handleShopeeWebhook(array $payload): void
    {
        if (! static::isAutoSyncEnabled() || ! static::isMpToWebsiteEnabled()) {
            return;
        }

        // Trigger synchronization for Shopee
        static::syncMarketplaceStockToWebsite('shopee');
    }

    /**
     * Handle incoming TikTok Webhook.
     */
    public static function handleTikTokWebhook(array $payload): void
    {
        if (! static::isAutoSyncEnabled() || ! static::isMpToWebsiteEnabled()) {
            return;
        }

        // Trigger synchronization for TikTok
        static::syncMarketplaceStockToWebsite('tiktok');
    }
}
