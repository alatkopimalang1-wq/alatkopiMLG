<?php

namespace App\Services;

use App\Models\MarketplaceAccount;
use App\Models\MarketplaceProductMapping;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\ProductVariant;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class ShopeeService
{
    protected string $liveBaseUrl = 'https://partner.shopeemobile.com';
    protected string $testBaseUrl = 'https://partner.test-stable.shopeemobile.com';
    protected ?MarketplaceAccount $account = null;

    public function __construct(?MarketplaceAccount $account = null)
    {
        $this->account = $account ?? self::getOrCreateAccount();
    }

    public function getAccount(): ?MarketplaceAccount
    {
        return $this->account;
    }

    public static function getOrCreateAccount(): MarketplaceAccount
    {
        return MarketplaceAccount::firstOrCreate(
            ['platform' => 'shopee'],
            [
                'name' => 'Alat Kopi Malang Shopee',
                'app_key' => '',
                'seller_base_region' => 'ID',
                'is_active' => true,
                'auto_sync_stock' => true,
                'auto_sync_orders' => true,
            ]
        );
    }

    public function getBaseUrl(): string
    {
        $env = $this->account?->seller_base_region === 'TEST' ? 'testing' : 'production';
        if ($env === 'testing') {
            return $this->testBaseUrl;
        }

        return $this->liveBaseUrl;
    }

    /**
     * Generate HMAC-SHA256 signature for Shopee Open API v2.
     */
    public function generateSignature(string $path, int $timestamp, ?string $accessToken = null, ?string $shopId = null): string
    {
        $partnerId = (string) $this->account->app_key;
        $partnerKey = (string) $this->account->app_secret;

        if ($accessToken && $shopId) {
            $baseStr = sprintf('%s%s%s%s%s', $partnerId, $path, $timestamp, $accessToken, $shopId);
        } else {
            $baseStr = sprintf('%s%s%s', $partnerId, $path, $timestamp);
        }

        return hash_hmac('sha256', $baseStr, $partnerKey);
    }

    /**
     * Generate OAuth shop authorization URL.
     */
    public function getAuthorizationUrl(): string
    {
        $partnerId = (string) $this->account->app_key;
        $partnerKey = (string) $this->account->app_secret;

        if (empty($partnerId) || empty($partnerKey)) {
            return '#';
        }

        $path = '/api/v2/shop/auth_partner';
        $timestamp = time();
        $sign = $this->generateSignature($path, $timestamp);
        $redirectUrl = url('/api/marketplace/shopee/callback');

        $baseUrl = $this->getBaseUrl();

        return "{$baseUrl}{$path}?partner_id={$partnerId}&timestamp={$timestamp}&sign={$sign}&redirect=" . urlencode($redirectUrl);
    }

    /**
     * Exchange auth code to access token and refresh token.
     */
    public function requestAccessToken(string $code, int|string $shopId, bool $isMainAccount = false): array
    {
        $path = '/api/v2/auth/token/get';
        $timestamp = time();
        $partnerId = (int) $this->account->app_key;
        $sign = $this->generateSignature($path, $timestamp);

        $baseUrl = $this->getBaseUrl();
        $url = "{$baseUrl}{$path}?partner_id={$partnerId}&timestamp={$timestamp}&sign={$sign}";

        $payload = [
            'code' => $code,
            'partner_id' => $partnerId,
        ];

        if ($isMainAccount) {
            $payload['main_account_id'] = (int) $shopId;
        } else {
            $payload['shop_id'] = (int) $shopId;
        }

        $response = Http::withHeaders([
            'Content-Type' => 'application/json',
        ])->post($url, $payload);

        $data = $response->json();

        if (! empty($data['error'])) {
            throw new \Exception('Gagal mendapatkan token Shopee: ' . ($data['message'] ?? $data['error']));
        }

        $accessToken = $data['access_token'];
        $refreshToken = $data['refresh_token'];
        $expiresIn = (int) ($data['expire_in'] ?? 14400);

        $this->account->update([
            'shop_id' => (string) $shopId,
            'access_token' => $accessToken,
            'refresh_token' => $refreshToken,
            'access_token_expires_at' => now()->addSeconds($expiresIn - 300),
            'refresh_token_expires_at' => now()->addDays(29),
            'is_active' => true,
        ]);

        // Attempt fetching shop info
        try {
            $this->syncShopInfo();
        } catch (\Throwable $e) {
            Log::warning('Shopee syncShopInfo error: ' . $e->getMessage());
        }

        return $data;
    }

    /**
     * Refresh access token using refresh token.
     */
    public function refreshAccessToken(): array
    {
        if (empty($this->account->refresh_token)) {
            throw new \Exception('Refresh token Shopee tidak tersedia. Silakan otorisasi ulang toko.');
        }

        $path = '/api/v2/auth/access_token/get';
        $timestamp = time();
        $partnerId = (int) $this->account->app_key;
        $sign = $this->generateSignature($path, $timestamp);

        $baseUrl = $this->getBaseUrl();
        $url = "{$baseUrl}{$path}?partner_id={$partnerId}&timestamp={$timestamp}&sign={$sign}";

        $payload = [
            'refresh_token' => $this->account->refresh_token,
            'partner_id' => $partnerId,
            'shop_id' => (int) $this->account->shop_id,
        ];

        $response = Http::withHeaders([
            'Content-Type' => 'application/json',
        ])->post($url, $payload);

        $data = $response->json();

        if (! empty($data['error'])) {
            throw new \Exception('Gagal memperbarui token Shopee: ' . ($data['message'] ?? $data['error']));
        }

        $accessToken = $data['access_token'];
        $refreshToken = $data['refresh_token'];
        $expiresIn = (int) ($data['expire_in'] ?? 14400);

        $this->account->update([
            'access_token' => $accessToken,
            'refresh_token' => $refreshToken,
            'access_token_expires_at' => now()->addSeconds($expiresIn - 300),
            'refresh_token_expires_at' => now()->addDays(29),
        ]);

        return $data;
    }

    /**
     * Ensure access token is valid before making API calls.
     */
    public function ensureValidToken(): void
    {
        if (! $this->account || empty($this->account->access_token)) {
            throw new \Exception('Toko Shopee belum diotorisasi. Silakan klik tombol Hubungkan Toko Shopee terlebih dahulu.');
        }

        if ($this->account->isTokenExpired()) {
            $this->refreshAccessToken();
        }
    }

    /**
     * Fetch shop info and update shop_name.
     */
    public function syncShopInfo(): array
    {
        $this->ensureValidToken();

        $path = '/api/v2/shop/get_shop_info';
        $timestamp = time();
        $partnerId = (int) $this->account->app_key;
        $shopId = (string) $this->account->shop_id;
        $accessToken = (string) $this->account->access_token;
        $sign = $this->generateSignature($path, $timestamp, $accessToken, $shopId);

        $baseUrl = $this->getBaseUrl();
        $url = "{$baseUrl}{$path}?partner_id={$partnerId}&timestamp={$timestamp}&access_token={$accessToken}&shop_id={$shopId}&sign={$sign}";

        $response = Http::get($url);
        $data = $response->json();

        if (! empty($data['error'])) {
            throw new \Exception('Gagal mengambil info toko Shopee: ' . ($data['message'] ?? $data['error']));
        }

        $shopName = $data['shop_name'] ?? $data['response']['shop_name'] ?? 'Alat Kopi Malang Shopee';
        $region = $data['region'] ?? $data['response']['region'] ?? 'ID';

        $this->account->update([
            'shop_name' => $shopName,
            'seller_base_region' => $region,
        ]);

        return $data;
    }

    /**
     * Synchronize products from Shopee to MarketplaceProductMapping.
     * Only pulls products that are LIVE (item_status = NORMAL) and fetches all size variants/models.
     */
    public function syncProducts(): array
    {
        $this->ensureValidToken();

        $path = '/api/v2/product/get_item_list';
        $partnerId = (int) $this->account->app_key;
        $shopId = (string) $this->account->shop_id;
        $accessToken = (string) $this->account->access_token;
        $baseUrl = $this->getBaseUrl();

        $offset = 0;
        $pageSize = 50;
        $allItemIds = [];
        $activeSkuIds = [];
        $syncedCount = 0;

        // 1. Fetch only LIVE items (item_status = NORMAL) with pagination
        do {
            $timestamp = time();
            $sign = $this->generateSignature($path, $timestamp, $accessToken, $shopId);
            $queryParams = [
                'partner_id' => $partnerId,
                'timestamp' => $timestamp,
                'access_token' => $accessToken,
                'shop_id' => $shopId,
                'sign' => $sign,
                'offset' => $offset,
                'page_size' => $pageSize,
                'item_status' => 'NORMAL', // ONLY LIVE PRODUCTS
            ];

            $response = Http::get("{$baseUrl}{$path}?" . http_build_query($queryParams));
            $data = $response->json();

            if (! empty($data['error'])) {
                throw new \Exception('Gagal mengambil daftar produk Shopee: ' . ($data['message'] ?? $data['error']));
            }

            $items = $data['response']['item'] ?? [];
            foreach ($items as $item) {
                if (($item['item_status'] ?? '') === 'NORMAL') {
                    $allItemIds[] = (string) $item['item_id'];
                }
            }

            $hasNextPage = (bool) ($data['response']['has_next_page'] ?? false);
            $offset = (int) ($data['response']['next_offset'] ?? ($offset + $pageSize));
        } while ($hasNextPage && count($allItemIds) < 500);

        // Preload all local products with variants for matching
        $allLocalProducts = Product::with('variants')->get();

        // 2. Fetch details for each item (in batches of 50) and variants
        foreach (array_chunk($allItemIds, 50) as $chunkIds) {
            $timestamp = time();
            $detailPath = '/api/v2/product/get_item_base_info';
            $dSign = $this->generateSignature($detailPath, $timestamp, $accessToken, $shopId);
            $itemIdListStr = implode(',', $chunkIds);

            $dRes = Http::get("{$baseUrl}{$detailPath}?partner_id={$partnerId}&timestamp={$timestamp}&access_token={$accessToken}&shop_id={$shopId}&sign={$dSign}&item_id_list={$itemIdListStr}");
            $dData = $dRes->json();
            $itemInfoList = $dData['response']['item_list'] ?? [];

            foreach ($itemInfoList as $itemInfo) {
                $itemId = (string) $itemInfo['item_id'];
                $itemName = $itemInfo['item_name'] ?? 'Produk Shopee';
                $hasModel = (bool) ($itemInfo['has_model'] ?? false);
                $imageUrl = $itemInfo['image']['image_url_list'][0] ?? null;
                $itemSku = $itemInfo['item_sku'] ?? null;
                $itemStock = $itemInfo['stock_info_v2']['summary_info']['total_available_stock'] 
                    ?? $itemInfo['stock_info_v2']['seller_stock'][0]['stock'] 
                    ?? $itemInfo['normal_stock'] 
                    ?? 0;
                $itemPrice = $itemInfo['price_info'][0]['current_price'] 
                    ?? $itemInfo['price_info'][0]['original_price'] 
                    ?? 0;

                // Match local product by shared keywords
                $localProduct = self::findBestMatchingProduct($itemName, $allLocalProducts);

                if ($hasModel) {
                    // Fetch models/variants from /api/v2/product/get_model_list
                    $modelPath = '/api/v2/product/get_model_list';
                    $mTimestamp = time();
                    $mSign = $this->generateSignature($modelPath, $mTimestamp, $accessToken, $shopId);
                    $mRes = Http::get("{$baseUrl}{$modelPath}?partner_id={$partnerId}&timestamp={$mTimestamp}&access_token={$accessToken}&shop_id={$shopId}&sign={$mSign}&item_id={$itemId}");
                    $mData = $mRes->json();
                    $models = $mData['response']['model'] ?? [];

                    if (! empty($models)) {
                        // Clean up any legacy dummy item-level row for this item
                        MarketplaceProductMapping::where('platform', 'shopee')
                            ->where('marketplace_product_id', $itemId)
                            ->where('marketplace_sku_id', $itemId)
                            ->delete();

                        foreach ($models as $model) {
                            $modelId = (string) $model['model_id'];
                            $modelName = $model['model_name'] ?? 'Varian';
                            $modelSku = $model['model_sku'] ?? null;
                            $modelStock = $model['stock_info_v2']['summary_info']['total_available_stock'] 
                                ?? $model['stock_info_v2']['seller_stock'][0]['stock'] 
                                ?? $model['normal_stock'] 
                                ?? 0;
                            $modelPrice = $model['price_info'][0]['current_price'] 
                                ?? $model['price_info'][0]['original_price'] 
                                ?? $itemPrice;

                            $activeSkuIds[] = $modelId;

                            // Match local variant (30gr Shopee -> 15gr Website, others match number)
                            $localVariant = $localProduct ? self::findBestMatchingVariant($localProduct, $modelName) : null;

                            $existing = MarketplaceProductMapping::where('platform', 'shopee')
                                ->where('marketplace_product_id', $itemId)
                                ->where('marketplace_sku_id', $modelId)
                                ->first();

                            // Retain manual connection if already mapped by user, otherwise keep unconnected
                            $finalProductId = $existing?->product_id;
                            $finalVariantId = $existing?->product_variant_id;
                            $syncStatus = $finalProductId ? 'synced' : 'pending';

                            MarketplaceProductMapping::updateOrCreate(
                                [
                                    'platform' => 'shopee',
                                    'marketplace_product_id' => $itemId,
                                    'marketplace_sku_id' => $modelId,
                                ],
                                [
                                    'marketplace_product_name' => $itemName,
                                    'marketplace_sku_name' => $modelName,
                                    'seller_sku' => $modelSku ?: $itemSku,
                                    'marketplace_image_url' => $imageUrl,
                                    'marketplace_stock' => $modelStock,
                                    'marketplace_price' => $modelPrice,
                                    'marketplace_status' => 'ACTIVATE',
                                    'product_id' => $finalProductId,
                                    'product_variant_id' => $finalVariantId,
                                    'last_synced_stock' => $modelStock,
                                    'last_synced_at' => now(),
                                    'sync_status' => $syncStatus,
                                    'sync_message' => $finalProductId ? "Produk Shopee terhubung: {$itemName} ({$modelName})" : 'Belum dipetakan ke produk website',
                                ]
                            );
                            $syncedCount++;
                        }
                        continue;
                    }
                }

                // If no models or hasModel is false:
                $activeSkuIds[] = $itemId;

                $localVariant = $localProduct ? self::findBestMatchingVariant($localProduct, 'Default') : null;
                $existing = MarketplaceProductMapping::where('platform', 'shopee')
                    ->where('marketplace_product_id', $itemId)
                    ->where('marketplace_sku_id', $itemId)
                    ->first();

                // Retain manual connection if already mapped by user, otherwise keep unconnected
                $finalProductId = $existing?->product_id;
                $finalVariantId = $existing?->product_variant_id;
                $syncStatus = $finalProductId ? 'synced' : 'pending';

                MarketplaceProductMapping::updateOrCreate(
                    [
                        'platform' => 'shopee',
                        'marketplace_product_id' => $itemId,
                        'marketplace_sku_id' => $itemId,
                    ],
                    [
                        'marketplace_product_name' => $itemName,
                        'marketplace_sku_name' => 'Default',
                        'seller_sku' => $itemSku,
                        'marketplace_image_url' => $imageUrl,
                        'marketplace_stock' => $itemStock,
                        'marketplace_price' => $itemPrice,
                        'marketplace_status' => 'ACTIVATE',
                        'product_id' => $finalProductId,
                        'product_variant_id' => $finalVariantId,
                        'last_synced_stock' => $itemStock,
                        'last_synced_at' => now(),
                        'sync_status' => $syncStatus,
                        'sync_message' => $finalProductId ? "Produk Shopee terhubung: {$itemName}" : 'Belum dipetakan ke produk website',
                    ]
                );
                $syncedCount++;
            }
        }

        // 3. Set any previously mapped Shopee SKU no longer live on Shopee to INACTIVE
        if (! empty($activeSkuIds)) {
            MarketplaceProductMapping::where('platform', 'shopee')
                ->whereNotIn('marketplace_sku_id', $activeSkuIds)
                ->update(['marketplace_status' => 'INACTIVE']);
        }

        return [
            'total_products' => count($allItemIds),
            'synced_count' => $syncedCount,
        ];
    }

    /**
     * Update stock on Shopee for single SKU or product.
     */
    public function updateSingleSkuInventory(string $productId, string $skuId, int $stock): array
    {
        $this->ensureValidToken();

        $path = '/api/v2/product/update_stock';
        $timestamp = time();
        $partnerId = (int) $this->account->app_key;
        $shopId = (string) $this->account->shop_id;
        $accessToken = (string) $this->account->access_token;
        $sign = $this->generateSignature($path, $timestamp, $accessToken, $shopId);

        $baseUrl = $this->getBaseUrl();
        $url = "{$baseUrl}{$path}?partner_id={$partnerId}&timestamp={$timestamp}&access_token={$accessToken}&shop_id={$shopId}&sign={$sign}";

        $modelId = 0;
        if ($skuId !== $productId && is_numeric($skuId)) {
            $modelId = (int) $skuId;
        }

        $stockItem = [
            'model_id' => $modelId,
            'seller_stock' => [
                [
                    'stock' => (int) $stock,
                ],
            ],
        ];

        $payload = [
            'item_id' => (int) $productId,
            'stock_list' => [$stockItem],
        ];

        $response = Http::withHeaders([
            'Content-Type' => 'application/json',
        ])->post($url, $payload);

        $data = $response->json();

        if (! empty($data['error'])) {
            throw new \Exception('Gagal mengubah stok Shopee: ' . ($data['message'] ?? $data['error']));
        }

        if (! empty($data['response']['failure_list'])) {
            $firstFail = $data['response']['failure_list'][0];
            $failMsg = $firstFail['failed_reason'] ?? json_encode($firstFail);
            throw new \Exception('Gagal mengubah stok Shopee: ' . $failMsg);
        }

        return $data;
    }

    /**
     * Sync real website stock to all Shopee items where stock differs.
     */
    public function syncAllRealStockToShopee(): array
    {
        $this->ensureValidToken();

        $mappings = MarketplaceProductMapping::where('platform', 'shopee')
            ->where('marketplace_status', 'ACTIVATE')
            ->whereNotNull('product_id')
            ->with(['product', 'variant'])
            ->get();

        $updated = 0;
        $errors = [];

        foreach ($mappings as $mapping) {
            $targetStock = (int) ($mapping->website_stock ?? 0);
            if ((int) $mapping->marketplace_stock !== $targetStock) {
                try {
                    $this->updateSingleSkuInventory(
                        $mapping->marketplace_product_id,
                        $mapping->marketplace_sku_id,
                        $targetStock
                    );

                    $mapping->update([
                        'marketplace_stock' => $targetStock,
                        'last_synced_stock' => $targetStock,
                        'last_synced_at' => now(),
                        'sync_status' => 'synced',
                        'sync_message' => "Stok Shopee disamakan dengan stok real website ({$targetStock} pcs).",
                    ]);

                    $updated++;
                } catch (\Throwable $e) {
                    $errors[] = "Shopee SKU {$mapping->marketplace_sku_id}: " . $e->getMessage();
                }
            }
        }

        return [
            'updated' => $updated,
            'errors' => $errors,
        ];
    }

    /**
     * Sync all product stocks on Shopee where website product is out of stock.
     */
    public function syncAllProductStock(): array
    {
        $this->ensureValidToken();

        $mappings = MarketplaceProductMapping::where('platform', 'shopee')
            ->where('marketplace_status', 'ACTIVATE')
            ->whereNotNull('product_id')
            ->with(['product', 'variant'])
            ->get();

        $updated = 0;
        $errors = [];

        foreach ($mappings as $mapping) {
            if ($mapping->is_website_out_of_stock && $mapping->marketplace_stock > 0) {
                try {
                    $this->updateSingleSkuInventory(
                        $mapping->marketplace_product_id,
                        $mapping->marketplace_sku_id,
                        0
                    );

                    $mapping->update([
                        'marketplace_stock' => 0,
                        'last_synced_stock' => 0,
                        'last_synced_at' => now(),
                        'sync_status' => 'synced',
                        'sync_message' => 'Stok di Shopee otomatis dinolkan karena produk habis di website.',
                    ]);

                    $updated++;
                } catch (\Throwable $e) {
                    $errors[] = "Shopee SKU {$mapping->marketplace_sku_id}: " . $e->getMessage();
                }
            }
        }

        return [
            'updated' => $updated,
            'errors' => $errors,
        ];
    }

    /**
     * Find best matching website product based on shared keywords.
     */
    public static function findBestMatchingProduct(string $shopeeTitle, ?\Illuminate\Support\Collection $products = null): ?Product
    {
        $products = $products ?? Product::with('variants')->get();

        $cleanShopee = strtolower(preg_replace('/[^a-zA-Z0-9\s]/', ' ', $shopeeTitle));

        // Phonetic / spelling replacements to match website naming
        $spellingMap = [
            'lychee' => 'litci',
            'rhapsody' => 'rapshody',
            'smothie' => 'smoothie',
            'fungky' => 'funky',
            'insfused' => 'infused',
            'experimntal' => 'experimental',
            'raostery' => 'roastery',
        ];
        foreach ($spellingMap as $orig => $repl) {
            $cleanShopee = str_replace($orig, $repl, $cleanShopee);
        }

        $stopWords = [
            'sanubari', 'roastery', 'roaster', 'beans', 'bean', 'roast', 'roasted',
            'arabica', 'arabika', 'coffee', 'kopi', 'speciality', 'specialty', 'special',
            'process', 'series', 'single', 'origin', 'filter', 'espresso', 'kemasan', 'pocket',
            'fresh', 'premium', 'exotic', 'experimental', 'infusion', 'infused',
            'wethulled', 'natural', 'fullwash', 'wash', 'honey', 'anaerob', 'anaerobic',
            'fermentation', 'co', 'ferment', 'yeast', 'tank', 'the', 'and', 'with', 'for'
        ];

        $bestProduct = null;
        $highestScore = 0;

        foreach ($products as $p) {
            $cleanWeb = strtolower(preg_replace('/[^a-zA-Z0-9\s]/', ' ', $p->name));
            foreach ($spellingMap as $orig => $repl) {
                $cleanWeb = str_replace($orig, $repl, $cleanWeb);
            }

            $webWords = array_filter(explode(' ', $cleanWeb));
            $distinctive = array_diff($webWords, $stopWords);
            if (empty($distinctive)) {
                $distinctive = $webWords;
            }

            $matched = 0;
            foreach ($distinctive as $dw) {
                if (strlen($dw) >= 3 && (str_contains($cleanShopee, $dw) || str_contains($cleanShopee, rtrim($dw, 's')))) {
                    $matched++;
                }
            }

            $score = $matched * 10;
            if ($matched === count($distinctive) && $matched >= 1) {
                $score += 50;
            }

            // Roast / Process matching bonus
            foreach (['espresso', 'filter', 'wine', 'honey', 'natural', 'fullwash', 'anaerob', 'yeast', 'infused', 'sweet'] as $pw) {
                if (str_contains($cleanWeb, $pw) && str_contains($cleanShopee, $pw)) {
                    $score += 5;
                }
            }

            if ($score > $highestScore && $matched >= 1) {
                $highestScore = $score;
                $bestProduct = $p;
            }
        }

        return $highestScore >= 20 ? $bestProduct : null;
    }

    /**
     * Match website variant for Shopee variant (30gr -> 15gr, other numbers match exactly).
     */
    public static function findBestMatchingVariant(Product $product, ?string $shopeeSkuName): ?ProductVariant
    {
        if ($product->variants->isEmpty()) {
            return null;
        }

        if (empty($shopeeSkuName) || strtolower($shopeeSkuName) === 'default') {
            return $product->variants->first();
        }

        $skuLower = strtolower($shopeeSkuName);

        // 1. User rule: 30gr in Shopee maps to 15gr in website
        $targetWeight = null;
        if (str_contains($skuLower, '30gr') || str_contains($skuLower, '30 gr') || preg_match('/\b30\s*(gr|g|gram)?\b/i', $skuLower)) {
            $targetWeight = 15;
        } elseif (preg_match('/(\d+)\s*(kg|kilo)\b/i', $skuLower, $m)) {
            $targetWeight = (int) $m[1] * 1000;
        } elseif (preg_match('/(\d+)\s*(gr|g|gram)\b/i', $skuLower, $m)) {
            $targetWeight = (int) $m[1];
        } elseif (preg_match('/\b(\d{2,4})\b/', $skuLower, $m)) {
            $targetWeight = (int) $m[1];
        }

        if ($targetWeight === 30) {
            $targetWeight = 15;
        }

        if ($targetWeight) {
            $candidates = $product->variants->filter(function ($v) use ($targetWeight) {
                $l = strtolower($v->label);
                if ($targetWeight === 15 && (str_contains($l, '15') || (int) $v->weight_grams === 15)) {
                    return true;
                }
                if ($targetWeight === 1000 && (str_contains($l, '1 kg') || str_contains($l, '1kg') || str_contains($l, '1000') || (int) $v->weight_grams === 1000)) {
                    return true;
                }
                if ($targetWeight === 100 && (str_contains($l, '100') && ! str_contains($l, '1000') && ! str_contains($l, '1 kg'))) {
                    return true;
                }
                if ($targetWeight === 200 && str_contains($l, '200')) {
                    return true;
                }
                if ($targetWeight === 250 && str_contains($l, '250')) {
                    return true;
                }
                if ($targetWeight === 500 && str_contains($l, '500')) {
                    return true;
                }

                return str_contains($l, (string) $targetWeight) || (int) $v->weight_grams === $targetWeight;
            });

            if ($candidates->count() === 1) {
                return $candidates->first();
            }

            if ($candidates->count() > 1) {
                $isBiji = str_contains($skuLower, 'biji') || str_contains($skuLower, 'whole') || str_contains($skuLower, 'bean');
                $isBubuk = str_contains($skuLower, 'giling') || str_contains($skuLower, 'halus') || str_contains($skuLower, 'bubuk') || str_contains($skuLower, 'ground');

                foreach ($candidates as $cand) {
                    $cl = strtolower($cand->label);
                    if ($isBiji && (str_contains($cl, 'biji') || str_contains($cl, 'whole') || str_contains($cl, 'bean'))) {
                        return $cand;
                    }
                    if ($isBubuk && (str_contains($cl, 'giling') || str_contains($cl, 'bubuk') || str_contains($cl, 'halus') || str_contains($cl, 'ground'))) {
                        return $cand;
                    }
                }

                return $candidates->first();
            }
        }

        return $product->variants->first();
    }

    /**
     * Auto-pair all unmapped or existing Shopee mappings with website products.
     */
    public static function autoPairAllProducts(bool $forceAll = false): array
    {
        $products = Product::with('variants')->get();
        $query = MarketplaceProductMapping::where('platform', 'shopee');
        if (! $forceAll) {
            $query->whereNull('product_id');
        }

        $mappings = $query->get();
        $pairedCount = 0;

        foreach ($mappings as $mapping) {
            $matchedProduct = self::findBestMatchingProduct($mapping->marketplace_product_name, $products);
            if ($matchedProduct) {
                $matchedVariant = self::findBestMatchingVariant($matchedProduct, $mapping->marketplace_sku_name);

                $mapping->update([
                    'product_id' => $matchedProduct->id,
                    'product_variant_id' => $matchedVariant?->id,
                    'sync_status' => 'synced',
                    'sync_message' => "Otomatis terhubung: {$matchedProduct->name}" . ($matchedVariant ? " ({$matchedVariant->label})" : ''),
                ]);
                $pairedCount++;
            }
        }

        return [
            'total_processed' => $mappings->count(),
            'paired_count' => $pairedCount,
        ];
    }

    /**
     * Fetch raw orders from Shopee Open Platform API v2.
     */
    public function getRawShopeeOrders(int $days = 0, bool $forceRefresh = false): array
    {
        $cacheKey = 'shopee_inbox_orders_list';
        $minTimestamp = now()->subDays($days)->startOfDay()->timestamp;

        if (! $forceRefresh && Cache::has($cacheKey)) {
            $cached = Cache::get($cacheKey, []);
            $filtered = array_values(array_filter($cached, function ($o) use ($minTimestamp) {
                return ! empty($o['create_time']) && $o['create_time'] >= $minTimestamp;
            }));
            return $this->refreshLocalStatusForOrders($filtered);
        }

        $this->ensureValidToken();

        $path = '/api/v2/order/get_order_list';
        $partnerId = (int) $this->account->app_key;
        $shopId = (string) $this->account->shop_id;
        $accessToken = (string) $this->account->access_token;
        $baseUrl = $this->getBaseUrl();
        $timeFrom = $minTimestamp;
        $timeTo = now()->addDays(1)->timestamp;

        $cursor = '';
        $allOrderSns = [];
        $pageSize = 50;

        do {
            $timestamp = time();
            $sign = $this->generateSignature($path, $timestamp, $accessToken, $shopId);
            $queryParams = [
                'partner_id' => $partnerId,
                'timestamp' => $timestamp,
                'access_token' => $accessToken,
                'shop_id' => $shopId,
                'sign' => $sign,
                'time_range_field' => 'create_time',
                'time_from' => $timeFrom,
                'time_to' => $timeTo,
                'page_size' => $pageSize,
                'response_optional_fields' => 'order_status',
            ];
            if (! empty($cursor)) {
                $queryParams['cursor'] = $cursor;
            }

            $response = Http::get("{$baseUrl}{$path}?" . http_build_query($queryParams));
            $data = $response->json();

            if (! empty($data['error'])) {
                throw new \Exception('Gagal mengambil pesanan Shopee: ' . ($data['message'] ?? $data['error']));
            }

            $orderList = $data['response']['order_list'] ?? [];
            foreach ($orderList as $orderItem) {
                if (! empty($orderItem['order_sn'])) {
                    $allOrderSns[] = (string) $orderItem['order_sn'];
                }
            }

            $hasMore = (bool) ($data['response']['more'] ?? false);
            $cursor = (string) ($data['response']['next_cursor'] ?? '');
        } while ($hasMore && count($allOrderSns) < 200 && ! empty($cursor));

        if (empty($allOrderSns)) {
            Cache::put($cacheKey, [], now()->addMinutes(15));
            return [];
        }

        // Fetch detail for order_sns in batches of 50
        $detailPath = '/api/v2/order/get_order_detail';
        $allOrderDetails = [];

        foreach (array_chunk($allOrderSns, 50) as $chunkSns) {
            $timestamp = time();
            $dSign = $this->generateSignature($detailPath, $timestamp, $accessToken, $shopId);
            $queryParams = [
                'partner_id' => $partnerId,
                'timestamp' => $timestamp,
                'access_token' => $accessToken,
                'shop_id' => $shopId,
                'sign' => $dSign,
                'order_sn_list' => implode(',', $chunkSns),
                'response_optional_fields' => 'buyer_user_id,buyer_username,recipient_address,item_list,shipping_carrier,payment_method,total_amount,actual_shipping_fee,estimated_shipping_fee,order_status,create_time,update_time,note,buyer_cancel_reason',
            ];

            $dRes = Http::get("{$baseUrl}{$detailPath}?" . http_build_query($queryParams));
            $dData = $dRes->json();
            $dList = $dData['response']['order_list'] ?? [];
            $allOrderDetails = array_merge($allOrderDetails, $dList);
        }

        // Preload active product mappings
        $activeMappings = MarketplaceProductMapping::where('platform', 'shopee')
            ->where('marketplace_status', 'ACTIVATE')
            ->with(['product', 'variant'])
            ->get();

        $processed = [];

        foreach ($allOrderDetails as $shopeeOrder) {
            $orderSn = (string) ($shopeeOrder['order_sn'] ?? '');
            if (! $orderSn) {
                continue;
            }

            $itemList = $shopeeOrder['item_list'] ?? [];
            $activeItems = [];

            foreach ($itemList as $item) {
                $itemId = (string) ($item['item_id'] ?? '');
                $modelId = (string) ($item['model_id'] ?? '');
                $itemSku = $item['model_sku'] ?? $item['item_sku'] ?? '';

                $mapping = $activeMappings->first(function ($m) use ($itemId, $modelId, $itemSku) {
                    if ($modelId && (string) $m->marketplace_sku_id === $modelId) {
                        return true;
                    }
                    if ($itemId && (string) $m->marketplace_product_id === $itemId) {
                        return true;
                    }
                    if ($itemSku && $m->seller_sku === $itemSku) {
                        return true;
                    }
                    return false;
                });

                $itemQty = (int) ($item['model_quantity_purchased'] ?? 1);
                $itemPrice = (float) ($item['model_discounted_price'] ?? $item['model_original_price'] ?? 0);

                $activeItems[] = [
                    'item' => $item,
                    'mapping_id' => $mapping?->id,
                    'product_id' => $mapping?->product_id,
                    'product_variant_id' => $mapping?->product_variant_id,
                    'is_connected' => ! empty($mapping?->product_id),
                    'product_name' => $item['item_name'] ?? $mapping?->marketplace_product_name ?? 'Produk Shopee',
                    'sku_name' => $item['model_name'] ?? ($mapping?->marketplace_sku_name ?: 'Default'),
                    'seller_sku' => $itemSku,
                    'sku_image' => $item['image_info']['image_url'] ?? $mapping?->image_url ?? $mapping?->product?->image_url,
                    'price' => $itemPrice,
                    'quantity' => $itemQty,
                    'subtotal' => $itemPrice * $itemQty,
                ];
            }

            $recipient = $shopeeOrder['recipient_address'] ?? [];
            $address = $recipient['full_address'] ?? implode(', ', array_filter([
                $recipient['district'] ?? '',
                $recipient['city'] ?? '',
                $recipient['state'] ?? '',
                $recipient['zipcode'] ?? '',
            ])) ?: 'Pesanan Shopee';

            $shopeeStatus = $shopeeOrder['order_status'] ?? 'UNPAID';
            $createdAt = ! empty($shopeeOrder['create_time'])
                ? \Carbon\Carbon::createFromTimestamp($shopeeOrder['create_time'])
                : now();

            $processed[] = [
                'id' => $orderSn,
                'platform' => 'shopee',
                'platform_label' => 'Shopee',
                'platform_color' => 'warning',
                'status' => $shopeeStatus,
                'status_label' => match ($shopeeStatus) {
                    'UNPAID' => 'Belum Bayar',
                    'READY_TO_SHIP', 'PROCESSED' => 'Siap dikirim',
                    'SHIPPED' => 'Dikirim',
                    'COMPLETED' => 'Selesai',
                    'IN_CANCEL', 'CANCELLED' => 'Dibatalkan',
                    default => ucfirst(strtolower(str_replace('_', ' ', $shopeeStatus))),
                },
                'status_color' => match ($shopeeStatus) {
                    'READY_TO_SHIP', 'PROCESSED' => 'warning',
                    'SHIPPED' => 'info',
                    'COMPLETED' => 'success',
                    'IN_CANCEL', 'CANCELLED' => 'danger',
                    default => 'gray',
                },
                'create_time' => $shopeeOrder['create_time'] ?? null,
                'created_at_formatted' => $createdAt->format('d M Y, H:i'),
                'buyer_name' => $recipient['name'] ?? $shopeeOrder['buyer_username'] ?? 'Pelanggan Shopee',
                'buyer_phone' => $recipient['phone'] ?? '-',
                'buyer_address' => $address,
                'buyer_message' => $shopeeOrder['note'] ?? null,
                'shipping_courier' => $shopeeOrder['shipping_carrier'] ?? 'Shopee Standard Express',
                'tracking_number' => $shopeeOrder['tracking_number'] ?? null,
                'payment_method' => $shopeeOrder['payment_method'] ?? 'ShopeePay',
                'subtotal' => (float) ($shopeeOrder['total_amount'] ?? 0),
                'shipping_fee' => (float) ($shopeeOrder['actual_shipping_fee'] ?? $shopeeOrder['estimated_shipping_fee'] ?? 0),
                'seller_discount' => 0,
                'total_amount' => (float) ($shopeeOrder['total_amount'] ?? 0),
                'items' => $activeItems,
                'raw' => $shopeeOrder,
            ];
        }

        Cache::put($cacheKey, $processed, now()->addMinutes(15));

        return $this->refreshLocalStatusForOrders($processed);
    }

    /**
     * Cross-reference raw Shopee orders list with local database `orders` table.
     */
    public function refreshLocalStatusForOrders(array $orders): array
    {
        if (empty($orders)) {
            return [];
        }

        $orderNumbers = array_map(fn ($o) => "SP-{$o['id']}", $orders);
        $localOrders = Order::whereIn('order_number', $orderNumbers)->get()->keyBy('order_number');

        return array_map(function ($order) use ($localOrders) {
            $orderNumber = "SP-{$order['id']}";
            $local = $localOrders->get($orderNumber);

            $order['is_saved'] = (bool) $local;
            $order['local_order_id'] = $local?->id;
            $order['local_order_number'] = $local?->order_number;
            $order['local_status'] = $local?->status;
            $order['local_status_label'] = match ($local?->status) {
                'pending' => 'Menunggu Konfirmasi',
                'processing' => 'Sedang Diproses',
                'shipped' => 'Sedang Dikirim',
                'completed' => 'Selesai',
                'cancelled' => 'Dibatalkan',
                default => '-'
            };
            $order['local_status_color'] = match ($local?->status) {
                'processing' => 'warning',
                'shipped' => 'info',
                'completed' => 'success',
                'cancelled' => 'danger',
                default => 'gray'
            };

            return $order;
        }, $orders);
    }

    /**
     * Save a single Shopee order into local `orders` and `order_items` tables.
     */
    public function saveSingleShopeeOrder(string|array $shopeeOrderOrSn): Order
    {
        $shopeeOrder = null;

        if (is_array($shopeeOrderOrSn)) {
            $shopeeOrder = $shopeeOrderOrSn['raw'] ?? $shopeeOrderOrSn;
        } else {
            $cachedOrders = Cache::get('shopee_inbox_orders_list', []);
            foreach ($cachedOrders as $item) {
                if ((string) $item['id'] === (string) $shopeeOrderOrSn) {
                    $shopeeOrder = $item['raw'] ?? null;
                    break;
                }
            }

            if (! $shopeeOrder) {
                $this->ensureValidToken();
                $path = '/api/v2/order/get_order_detail';
                $timestamp = time();
                $partnerId = (int) $this->account->app_key;
                $shopId = (string) $this->account->shop_id;
                $accessToken = (string) $this->account->access_token;
                $sign = $this->generateSignature($path, $timestamp, $accessToken, $shopId);

                $baseUrl = $this->getBaseUrl();
                $queryParams = [
                    'partner_id' => $partnerId,
                    'timestamp' => $timestamp,
                    'access_token' => $accessToken,
                    'shop_id' => $shopId,
                    'sign' => $sign,
                    'order_sn_list' => (string) $shopeeOrderOrSn,
                    'response_optional_fields' => 'buyer_user_id,buyer_username,recipient_address,item_list,shipping_carrier,payment_method,total_amount,actual_shipping_fee,estimated_shipping_fee,order_status,create_time,update_time,note,buyer_cancel_reason',
                ];

                $response = Http::get("{$baseUrl}{$path}?" . http_build_query($queryParams));
                $data = $response->json();
                $shopeeOrder = $data['response']['order_list'][0] ?? null;
            }
        }

        if (! $shopeeOrder) {
            throw new \Exception("Data pesanan Shopee #" . (is_string($shopeeOrderOrSn) ? $shopeeOrderOrSn : '') . " tidak ditemukan.");
        }

        $orderSn = (string) ($shopeeOrder['order_sn'] ?? '');
        $orderNumber = "SP-{$orderSn}";

        // Preload active mappings and check if at least one product is connected BEFORE creating order
        $activeMappings = MarketplaceProductMapping::where('platform', 'shopee')
            ->where('marketplace_status', 'ACTIVATE')
            ->get();

        $itemList = $shopeeOrder['item_list'] ?? [];
        $hasAnyConnected = false;
        foreach ($itemList as $item) {
            $itemId = (string) ($item['item_id'] ?? '');
            $modelId = (string) ($item['model_id'] ?? '');
            $itemSku = $item['model_sku'] ?? $item['item_sku'] ?? '';
            $m = $activeMappings->first(function ($m) use ($itemId, $modelId, $itemSku) {
                if ($modelId && (string) $m->marketplace_sku_id === $modelId) return true;
                if ($itemId && (string) $m->marketplace_product_id === $itemId) return true;
                if ($itemSku && $m->seller_sku === $itemSku) return true;
                return false;
            });
            if ($m && ! empty($m->product_id)) {
                $hasAnyConnected = true;
                break;
            }
        }

        if (! $hasAnyConnected) {
            throw new \Exception("Aksi simpan tidak dapat dijalankan karena pesanan Shopee #{$orderSn} belum memiliki produk yang terhubung ke katalog website.");
        }

        $shopeeStatus = $shopeeOrder['order_status'] ?? 'UNPAID';
        $mappedStatus = match ($shopeeStatus) {
            'UNPAID' => 'pending',
            'READY_TO_SHIP', 'PROCESSED' => 'processing',
            'SHIPPED' => 'shipped',
            'COMPLETED' => 'completed',
            'IN_CANCEL', 'CANCELLED' => 'cancelled',
            default => 'processing',
        };

        $paymentStatus = in_array($shopeeStatus, ['UNPAID', 'CANCELLED']) ? 'unpaid' : 'paid';

        $recipient = $shopeeOrder['recipient_address'] ?? [];
        $customerName = $recipient['name'] ?? $shopeeOrder['buyer_username'] ?? 'Pelanggan Shopee';
        $customerPhone = $recipient['phone'] ?? '-';
        $address = $recipient['full_address'] ?? implode(', ', array_filter([
            $recipient['district'] ?? '',
            $recipient['city'] ?? '',
            $recipient['state'] ?? '',
            $recipient['zipcode'] ?? '',
        ])) ?: 'Pesanan Shopee';

        $totalAmount = (float) ($shopeeOrder['total_amount'] ?? 0);
        $shippingCost = (float) ($shopeeOrder['actual_shipping_fee'] ?? $shopeeOrder['estimated_shipping_fee'] ?? 0);
        $subtotal = max(0, $totalAmount - $shippingCost);

        $createdAt = ! empty($shopeeOrder['create_time'])
            ? \Carbon\Carbon::createFromTimestamp($shopeeOrder['create_time'])
            : now();

        $order = Order::updateOrCreate(
            ['order_number' => $orderNumber],
            [
                'customer_name' => $customerName,
                'customer_phone' => $customerPhone,
                'customer_email' => null,
                'customer_address' => $address,
                'customer_notes' => $shopeeOrder['note'] ?? null,
                'payment_method' => 'shopee_pay',
                'payment_channel' => 'Shopee (' . ($shopeeOrder['payment_method'] ?? 'ShopeePay') . ')',
                'payment_status' => $paymentStatus,
                'status' => $mappedStatus,
                'subtotal' => $subtotal,
                'shipping_cost' => $shippingCost,
                'total_amount' => $totalAmount,
                'shipping_courier' => $shopeeOrder['shipping_carrier'] ?? 'Shopee Express',
                'tracking_number' => $shopeeOrder['tracking_number'] ?? null,
                'created_at' => $createdAt,
                'payment_details' => [
                    'source' => 'shopee',
                    'platform' => 'Shopee Open Platform',
                    'order_sn' => $orderSn,
                    'shopee_status' => $shopeeStatus,
                ],
            ]
        );

        foreach ($itemList as $item) {
            $itemId = (string) ($item['item_id'] ?? '');
            $modelId = (string) ($item['model_id'] ?? '');
            $itemSku = $item['model_sku'] ?? $item['item_sku'] ?? '';

            $mapping = $activeMappings->first(function ($m) use ($itemId, $modelId, $itemSku) {
                if ($modelId && (string) $m->marketplace_sku_id === $modelId) {
                    return true;
                }
                if ($itemId && (string) $m->marketplace_product_id === $itemId) {
                    return true;
                }
                if ($itemSku && $m->seller_sku === $itemSku) {
                    return true;
                }
                return false;
            });

            $prodName = $item['item_name'] ?? ($mapping?->marketplace_product_name ?: 'Kopi Sanubari');
            $skuName = $item['model_name'] ?? ($mapping?->marketplace_sku_name ?: 'Default');
            $price = (float) ($item['model_discounted_price'] ?? $item['model_original_price'] ?? 0);
            $qty = (int) ($item['model_quantity_purchased'] ?? 1);

            $finalProductId = $mapping?->product_id;
            $finalVariantId = $mapping?->product_variant_id;

            if (! $finalProductId || ! $finalVariantId) {
                $matchedProduct = self::findBestMatchingProduct($prodName);
                if ($matchedProduct) {
                    $finalProductId = $matchedProduct->id;
                    $matchedVariant = self::findBestMatchingVariant($matchedProduct, $skuName);
                    $finalVariantId = $matchedVariant?->id;
                }
            }

            $costPrice = null;
            if ($finalVariantId) {
                $costPrice = ProductVariant::find($finalVariantId)?->cost_price;
            }

            OrderItem::updateOrCreate(
                [
                    'order_id' => $order->id,
                    'product_name' => $prodName,
                    'variant_label' => $skuName,
                ],
                [
                    'product_id' => $finalProductId,
                    'product_variant_id' => $finalVariantId,
                    'cost_price' => $costPrice,
                    'price' => $price,
                    'quantity' => $qty,
                    'subtotal' => $price * $qty,
                ]
            );
        }

        // Update cached order status if present
        $cached = Cache::get('shopee_inbox_orders_list');
        if (is_array($cached)) {
            foreach ($cached as &$cOrder) {
                if ((string) $cOrder['id'] === $orderSn) {
                    $cOrder['is_saved'] = true;
                    $cOrder['local_order_id'] = $order->id;
                    $cOrder['local_order_number'] = $order->order_number;
                    $cOrder['local_status'] = $order->status;
                    $cOrder['local_status_label'] = match ($order->status) {
                        'pending' => 'Menunggu Konfirmasi',
                        'processing' => 'Sedang Diproses',
                        'shipped' => 'Sedang Dikirim',
                        'completed' => 'Selesai',
                        'cancelled' => 'Dibatalkan',
                        default => '-'
                    };
                    $cOrder['local_status_color'] = match ($order->status) {
                        'processing' => 'warning',
                        'shipped' => 'info',
                        'completed' => 'success',
                        'cancelled' => 'danger',
                        default => 'gray'
                    };
                    break;
                }
            }
            Cache::put('shopee_inbox_orders_list', $cached, now()->addMinutes(15));
        }

        return $order;
    }
}
