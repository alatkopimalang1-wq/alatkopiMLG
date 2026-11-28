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

class TikTokShopService
{
    protected string $authBaseUrl = 'https://auth.tiktok-shops.com';
    protected string $apiBaseUrl = 'https://open-api.tiktokglobalshop.com';
    protected ?MarketplaceAccount $account = null;

    public function __construct(?MarketplaceAccount $account = null)
    {
        $this->account = $account ?? MarketplaceAccount::where('platform', 'tiktok')->where('is_active', true)->first();
    }

    public function getAccount(): ?MarketplaceAccount
    {
        return $this->account;
    }

    /**
     * Get or create default TikTok Shop marketplace account record.
     */
    public static function getOrCreateAccount(): MarketplaceAccount
    {
        return MarketplaceAccount::firstOrCreate(
            ['platform' => 'tiktok'],
            [
                'name' => 'Alat Kopi Malang Omnichannel',
                'app_key' => '6m01in2nrp7u2',
                'service_id' => '7710278786013234951',
                'seller_base_region' => 'ID',
                'is_active' => true,
                'auto_sync_stock' => true,
                'auto_sync_orders' => true,
            ]
        );
    }

    /**
     * Generate TikTok Shop seller authorization URL.
     */
    public function getAuthorizationUrl(?string $serviceId = null): string
    {
        $serviceId = $serviceId ?: ($this->account?->service_id ?: '7710278786013234951');
        return "https://services.tiktokshop.com/open/authorize?service_id={$serviceId}";
    }

    /**
     * Calculate HMAC-SHA256 signature according to TikTok Shop API V202309 specification.
     */
    public function generateSignature(string $path, array $queryParams, string $body = '', ?string $appSecret = null): string
    {
        $secret = $appSecret ?: ($this->account?->app_secret ?? '');

        // 1. Remove sign and access_token from signature parameters
        unset($queryParams['sign'], $queryParams['access_token']);

        // 2. Sort parameters alphabetically by key
        ksort($queryParams);

        // 3. Concatenate key and value without delimiters
        $paramString = '';
        foreach ($queryParams as $key => $value) {
            $paramString .= $key . (string) $value;
        }

        // 4. Wrap format according to TikTok Shop Open API specification:
        // AppSecret + path + paramString + body + AppSecret
        $stringToSign = $secret . $path . $paramString . $body . $secret;

        // 5. Generate HMAC-SHA256 signature
        return hash_hmac('sha256', $stringToSign, $secret);
    }

    /**
     * Exchange authorization code for access and refresh tokens.
     */
    public function requestAccessToken(string $authCode, ?string $appKey = null, ?string $appSecret = null): array
    {
        $key = $appKey ?: $this->account?->app_key;
        $secret = $appSecret ?: $this->account?->app_secret;

        if (! $key || ! $secret) {
            throw new \Exception('App Key dan App Secret wajib diisi.');
        }

        $response = Http::timeout(15)->get("{$this->authBaseUrl}/api/v2/token/get", [
            'app_key' => $key,
            'app_secret' => $secret,
            'auth_code' => $authCode,
            'grant_type' => 'authorized_code',
        ]);

        $data = $response->json();

        if (($data['code'] ?? -1) !== 0) {
            $msg = $data['message'] ?? 'Gagal menukarkan kode otorisasi TikTok Shop.';
            Log::error("TikTok Shop token error: {$msg}", $data);
            throw new \Exception("TikTok Shop API Error: {$msg}");
        }

        $tokenData = $data['data'] ?? [];

        if ($this->account) {
            $accessExpiry = $this->calculateSafeExpiration($tokenData['access_token_expire_in'] ?? null, 86400, 5);
            $refreshExpiry = $this->calculateSafeExpiration($tokenData['refresh_token_expire_in'] ?? null, 2592000, 10);

            $this->account->update([
                'access_token' => $tokenData['access_token'] ?? null,
                'refresh_token' => $tokenData['refresh_token'] ?? null,
                'access_token_expires_at' => $accessExpiry,
                'refresh_token_expires_at' => $refreshExpiry,
                'seller_id' => $tokenData['open_id'] ?? null,
                'shop_name' => $tokenData['seller_name'] ?? 'Toko TikTok Sanubari',
                'seller_base_region' => $tokenData['seller_base_region'] ?? 'ID',
            ]);

            // Attempt to fetch and save shop cipher
            try {
                $this->syncAuthorizedShops();
            } catch (\Throwable $e) {
                Log::warning('Auto sync authorized shops failed: ' . $e->getMessage());
            }
        }

        return $tokenData;
    }

    /**
     * Refresh access token using refresh token.
     */
    public function refreshAccessToken(): array
    {
        if (! $this->account || ! $this->account->refresh_token) {
            throw new \Exception('Refresh token tidak ditemukan.');
        }

        $response = Http::timeout(15)->get("{$this->authBaseUrl}/api/v2/token/refresh", [
            'app_key' => $this->account->app_key,
            'app_secret' => $this->account->app_secret,
            'refresh_token' => $this->account->refresh_token,
            'grant_type' => 'refresh_token',
        ]);

        $data = $response->json();

        if (($data['code'] ?? -1) !== 0) {
            $msg = $data['message'] ?? 'Gagal memperbarui access token.';
            throw new \Exception("TikTok Refresh Token Error: {$msg}");
        }

        $tokenData = $data['data'] ?? [];

        $accessExpiry = $this->calculateSafeExpiration($tokenData['access_token_expire_in'] ?? null, 86400, 5);
        $refreshExpiry = $this->calculateSafeExpiration($tokenData['refresh_token_expire_in'] ?? null, 2592000, 10);

        $this->account->update([
            'access_token' => $tokenData['access_token'] ?? $this->account->access_token,
            'refresh_token' => $tokenData['refresh_token'] ?? $this->account->refresh_token,
            'access_token_expires_at' => $accessExpiry,
            'refresh_token_expires_at' => $refreshExpiry,
        ]);

        return $tokenData;
    }

    /**
     * Calculate safe token expiration timestamp preventing MariaDB/MySQL 2038 overflow.
     */
    protected function calculateSafeExpiration(mixed $rawExpireIn, int $defaultSeconds, int $maxYears = 10): \Carbon\Carbon
    {
        $raw = (int) ($rawExpireIn ?: $defaultSeconds);

        if ($raw > 1_500_000_000) {
            $date = \Carbon\Carbon::createFromTimestamp($raw);
        } else {
            $cappedSeconds = min($raw, $maxYears * 365 * 86400);
            $date = now()->addSeconds($cappedSeconds);
        }

        if ($date->year > 2037) {
            $date = \Carbon\Carbon::create(2037, 12, 31, 23, 59, 59);
        }

        return $date;
    }

    /**
     * Ensure access token is valid and fresh.
     */
    protected function ensureValidToken(): void
    {
        if (! $this->account || ! $this->account->access_token) {
            throw new \Exception('Aplikasi TikTok Shop belum diotorisasi. Silakan klik tombol "Otorisasi Toko".');
        }

        if ($this->account->isTokenExpired()) {
            $this->refreshAccessToken();
        }
    }

    /**
     * Query authorized shops list and save shop_cipher.
     */
    public function syncAuthorizedShops(): array
    {
        $this->ensureValidToken();

        $path = '/authorization/202309/shops';
        $timestamp = time();

        $queryParams = [
            'app_key' => $this->account->app_key,
            'timestamp' => $timestamp,
        ];

        $sign = $this->generateSignature($path, $queryParams, '');
        $queryParams['sign'] = $sign;

        $response = Http::withHeaders([
            'x-tts-access-token' => $this->account->access_token,
        ])->get("{$this->apiBaseUrl}{$path}", $queryParams);

        $data = $response->json();

        if (($data['code'] ?? -1) !== 0) {
            throw new \Exception('Gagal mengambil data toko TikTok: ' . ($data['message'] ?? 'Unknown error'));
        }

        $shops = $data['data']['shops'] ?? [];
        if (! empty($shops[0])) {
            $shop = $shops[0];
            $this->account->update([
                'shop_id' => $shop['id'] ?? $this->account->shop_id,
                'shop_cipher' => $shop['cipher'] ?? $this->account->shop_cipher,
                'shop_name' => $shop['name'] ?? $this->account->shop_name,
                'seller_base_region' => $shop['region'] ?? $this->account->seller_base_region,
            ]);
        }

        return $shops;
    }

    /**
     * Ambil raw orders dari TikTok Shop (1 hari terakhir dan hari-hari berikutnya) yang produknya aktif.
     * Tidak mengubah atau meng-insert ke orders lokal secara otomatis.
     */
    public function getRawTikTokOrders(int $days = 0, bool $forceRefresh = false): array
    {
        $cacheKey = 'tts_inbox_orders_list';
        $minTimestamp = now()->subDays($days)->startOfDay()->timestamp;

        if (! $forceRefresh && Cache::has($cacheKey)) {
            $cached = Cache::get($cacheKey, []);
            $filtered = array_values(array_filter($cached, function ($o) use ($minTimestamp) {
                return ! empty($o['create_time']) && $o['create_time'] >= $minTimestamp;
            }));
            return $this->refreshLocalStatusForOrders($filtered);
        }

        $this->ensureValidToken();

        if (! $this->account->shop_cipher) {
            $this->syncAuthorizedShops();
        }

        $path = '/order/202309/orders/search';
        $timeFrom = $minTimestamp;
        $now = now()->addDays(1)->timestamp;

        $pageToken = null;
        $allOrders = [];
        $pageSize = 50;

        do {
            $queryParams = [
                'app_key' => $this->account->app_key,
                'timestamp' => time(),
                'shop_cipher' => $this->account->shop_cipher,
                'page_size' => $pageSize,
            ];

            if ($pageToken) {
                $queryParams['page_token'] = $pageToken;
            }

            $bodyPayload = [
                'create_time_ge' => $timeFrom,
                'create_time_lt' => $now,
                'sort_order' => 'DESC',
                'sort_field' => 'CREATE_TIME',
            ];
            $bodyJson = json_encode($bodyPayload, JSON_UNESCAPED_SLASHES);

            $sign = $this->generateSignature($path, $queryParams, $bodyJson);
            $queryParams['sign'] = $sign;

            $response = Http::withHeaders([
                'x-tts-access-token' => $this->account->access_token,
            ])->withBody($bodyJson, 'application/json')->post("{$this->apiBaseUrl}{$path}?" . http_build_query($queryParams));

            $data = $response->json();

            if (($data['code'] ?? -1) !== 0) {
                throw new \Exception('Gagal mengambil pesanan TikTok Shop: ' . ($data['message'] ?? 'Unknown error'));
            }

            $pageOrders = $data['data']['orders'] ?? [];
            $allOrders = array_merge($allOrders, $pageOrders);

            $pageToken = $data['data']['next_page_token'] ?? null;
        } while (! empty($pageToken) && count($allOrders) < 200);

        // Preload active product mappings
        $activeMappings = MarketplaceProductMapping::where('platform', 'tiktok')
            ->where('marketplace_status', 'ACTIVATE')
            ->with(['product', 'variant'])
            ->get();

        $processed = [];

        foreach ($allOrders as $ttsOrder) {
            $ttsOrderId = (string) ($ttsOrder['id'] ?? '');
            if (! $ttsOrderId) {
                continue;
            }

            $lineItems = $ttsOrder['line_items'] ?? [];

            // Filter: pastikan pesanan memiliki produk yang berstatus aktif di TikTok Shop
            $activeItems = [];
            foreach ($lineItems as $item) {
                $ttsProdId = (string) ($item['product_id'] ?? '');
                $ttsSkuId = (string) ($item['sku_id'] ?? '');
                $sellerSku = $item['seller_sku'] ?? '';

                $mapping = $activeMappings->first(function ($m) use ($ttsProdId, $ttsSkuId, $sellerSku) {
                    if ($ttsSkuId && (string) $m->marketplace_sku_id === $ttsSkuId) {
                        return true;
                    }
                    if ($ttsProdId && (string) $m->marketplace_product_id === $ttsProdId) {
                        return true;
                    }
                    if ($sellerSku && $m->seller_sku === $sellerSku) {
                        return true;
                    }
                    return false;
                });

                $itemQty = (int) ($item['quantity'] ?? 1);
                $itemPrice = (float) ($item['sale_price'] ?? 0);
                $activeItems[] = [
                    'item' => $item,
                    'mapping_id' => $mapping?->id,
                    'product_id' => $mapping?->product_id,
                    'product_variant_id' => $mapping?->product_variant_id,
                    'is_connected' => ! empty($mapping?->product_id),
                    'product_name' => $item['product_name'] ?? ($mapping?->marketplace_product_name ?: 'Produk TikTok'),
                    'sku_name' => $item['sku_name'] ?? ($mapping?->marketplace_sku_name ?: 'Default'),
                    'seller_sku' => $item['seller_sku'] ?? $mapping?->seller_sku,
                    'sku_image' => $item['sku_image'] ?? $mapping?->image_url ?? $mapping?->product?->image_url,
                    'price' => $itemPrice,
                    'quantity' => $itemQty,
                    'subtotal' => $itemPrice * $itemQty,
                ];
            }

            if (empty($activeItems)) {
                continue;
            }

            $recipient = $ttsOrder['recipient_address'] ?? [];
            $address = implode(', ', array_filter([
                $recipient['address_line1'] ?? '',
                $recipient['district_info']['district_name'] ?? '',
                $recipient['city'] ?? '',
                $recipient['postal_code'] ?? '',
            ])) ?: 'Pesanan TikTok Shop';

            $payment = $ttsOrder['payment'] ?? [];
            $ttsStatus = $ttsOrder['status'] ?? 'UNPAID';

            $createdAt = ! empty($ttsOrder['create_time'])
                ? \Carbon\Carbon::createFromTimestamp($ttsOrder['create_time'])
                : now();

            $processed[] = [
                'id' => $ttsOrderId,
                'platform' => 'tiktok',
                'platform_label' => 'TikTok Shop',
                'platform_color' => 'gray',
                'status' => $ttsStatus,
                'status_label' => match ($ttsStatus) {
                    'UNPAID' => 'Belum Bayar',
                    'AWAITING_SHIPMENT', 'AWAITING_COLLECTION' => 'Siap dikirim',
                    'IN_TRANSIT', 'DELIVERING' => 'Dikirim',
                    'DELIVERED', 'COMPLETED' => 'Selesai',
                    'CANCELLED' => 'Dibatalkan',
                    default => ucfirst(strtolower(str_replace('_', ' ', $ttsStatus))),
                },
                'status_color' => match ($ttsStatus) {
                    'AWAITING_SHIPMENT', 'AWAITING_COLLECTION' => 'warning',
                    'IN_TRANSIT', 'DELIVERING' => 'info',
                    'DELIVERED', 'COMPLETED' => 'success',
                    'CANCELLED' => 'danger',
                    default => 'gray',
                },
                'create_time' => $ttsOrder['create_time'] ?? null,
                'created_at_formatted' => $createdAt->format('d M Y, H:i'),
                'buyer_name' => $recipient['name'] ?? 'Pelanggan TikTok',
                'buyer_phone' => $recipient['phone_number'] ?? '-',
                'buyer_address' => $address,
                'buyer_message' => $ttsOrder['buyer_message'] ?? null,
                'shipping_courier' => $ttsOrder['shipping_provider_name'] ?? $ttsOrder['delivery_option_name'] ?? 'TikTok Shipping',
                'tracking_number' => $ttsOrder['tracking_number'] ?? null,
                'payment_method' => $ttsOrder['payment_method_name'] ?? 'TikTok Shop',
                'subtotal' => (float) ($payment['sub_total'] ?? $payment['total_amount'] ?? 0),
                'shipping_fee' => (float) ($payment['shipping_fee'] ?? 0),
                'seller_discount' => (float) ($payment['seller_discount'] ?? 0),
                'total_amount' => (float) ($payment['total_amount'] ?? 0),
                'items' => $activeItems,
                'raw' => $ttsOrder,
            ];
        }

        Cache::put($cacheKey, $processed, now()->addMinutes(15));

        return $this->refreshLocalStatusForOrders($processed);
    }

    /**
     * Cross-reference raw orders list with local database `orders` table.
     */
    public function refreshLocalStatusForOrders(array $orders): array
    {
        if (empty($orders)) {
            return [];
        }

        $orderNumbers = array_map(fn ($o) => "TTS-{$o['id']}", $orders);
        $localOrders = Order::whereIn('order_number', $orderNumbers)->get()->keyBy('order_number');

        return array_map(function ($order) use ($localOrders) {
            $orderNumber = "TTS-{$order['id']}";
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
     * Simpan satu pesanan TikTok ke database pesanan website.
     * PENTING: Metode ini HANYA menyimpan data ke database website lokal (`orders` & `order_items`),
     * TIDAK merubah dan TIDAK memanggil API status penerimaan / pengiriman di TikTok Shop.
     */
    public function saveSingleTikTokOrder(string|array $ttsOrderOrId): Order
    {
        $ttsOrder = null;

        if (is_array($ttsOrderOrId)) {
            $ttsOrder = $ttsOrderOrId['raw'] ?? $ttsOrderOrId;
        } else {
            $cachedOrders = Cache::get('tts_inbox_orders_list', []);
            foreach ($cachedOrders as $item) {
                if ((string) $item['id'] === (string) $ttsOrderOrId) {
                    $ttsOrder = $item['raw'] ?? null;
                    break;
                }
            }

            if (! $ttsOrder) {
                $this->ensureValidToken();
                if (! $this->account->shop_cipher) {
                    $this->syncAuthorizedShops();
                }

                $path = '/order/202309/orders';
                $queryParams = [
                    'app_key' => $this->account->app_key,
                    'timestamp' => time(),
                    'shop_cipher' => $this->account->shop_cipher,
                    'order_id_list' => (string) $ttsOrderOrId,
                ];
                $sign = $this->generateSignature($path, $queryParams, '');
                $queryParams['sign'] = $sign;

                $response = Http::withHeaders([
                    'x-tts-access-token' => $this->account->access_token,
                ])->get("{$this->apiBaseUrl}{$path}?" . http_build_query($queryParams));

                $data = $response->json();
                $ttsOrder = $data['data']['orders'][0] ?? null;
            }
        }

        if (! $ttsOrder) {
            throw new \Exception("Data pesanan TikTok #" . (is_string($ttsOrderOrId) ? $ttsOrderOrId : '') . " tidak ditemukan.");
        }

        $ttsOrderId = (string) $ttsOrder['id'];
        $orderNumber = "TTS-{$ttsOrderId}";

        // Preload active mappings and check if at least one product is connected BEFORE creating order
        $activeMappings = MarketplaceProductMapping::where('platform', 'tiktok')
            ->where('marketplace_status', 'ACTIVATE')
            ->get();

        $lineItems = $ttsOrder['line_items'] ?? [];
        $hasAnyConnected = false;
        foreach ($lineItems as $item) {
            $ttsProdId = (string) ($item['product_id'] ?? '');
            $ttsSkuId = (string) ($item['sku_id'] ?? '');
            $sellerSku = $item['seller_sku'] ?? '';
            $m = $activeMappings->first(function ($m) use ($ttsProdId, $ttsSkuId, $sellerSku) {
                if ($ttsSkuId && (string) $m->marketplace_sku_id === $ttsSkuId) return true;
                if ($ttsProdId && (string) $m->marketplace_product_id === $ttsProdId) return true;
                if ($sellerSku && $m->seller_sku === $sellerSku) return true;
                return false;
            });
            if ($m && ! empty($m->product_id)) {
                $hasAnyConnected = true;
                break;
            }
        }

        if (! $hasAnyConnected) {
            throw new \Exception("Aksi simpan tidak dapat dijalankan karena pesanan TikTok #{$ttsOrderId} belum memiliki produk yang terhubung ke katalog website.");
        }

        $ttsStatus = $ttsOrder['status'] ?? 'UNPAID';
        $mappedStatus = match ($ttsStatus) {
            'UNPAID' => 'pending',
            'AWAITING_SHIPMENT', 'AWAITING_COLLECTION' => 'processing',
            'IN_TRANSIT', 'DELIVERING' => 'shipped',
            'DELIVERED', 'COMPLETED' => 'completed',
            'CANCELLED' => 'cancelled',
            default => 'processing',
        };

        $paymentStatus = in_array($ttsStatus, ['UNPAID', 'CANCELLED']) ? 'unpaid' : 'paid';

        $recipient = $ttsOrder['recipient_address'] ?? [];
        $customerName = $recipient['name'] ?? 'Pelanggan TikTok Shop';
        $customerPhone = $recipient['phone_number'] ?? '-';
        $address = implode(', ', array_filter([
            $recipient['address_line1'] ?? '',
            $recipient['district_info']['district_name'] ?? '',
            $recipient['city'] ?? '',
            $recipient['postal_code'] ?? '',
        ])) ?: 'Pesanan TikTok Shop';

        $payment = $ttsOrder['payment'] ?? [];
        $totalAmount = (float) ($payment['total_amount'] ?? 0);
        $subtotal = (float) ($payment['sub_total'] ?? $totalAmount);
        $shippingCost = (float) ($payment['shipping_fee'] ?? 0);

        $createdAt = ! empty($ttsOrder['create_time'])
            ? \Carbon\Carbon::createFromTimestamp($ttsOrder['create_time'])
            : now();

        $order = Order::updateOrCreate(
            ['order_number' => $orderNumber],
            [
                'customer_name' => $customerName,
                'customer_phone' => $customerPhone,
                'customer_email' => null,
                'customer_address' => $address,
                'customer_notes' => $ttsOrder['buyer_message'] ?? null,
                'payment_method' => 'tiktok_shop',
                'payment_channel' => 'TikTok Shop',
                'payment_status' => $paymentStatus,
                'status' => $mappedStatus,
                'subtotal' => $subtotal,
                'shipping_cost' => $shippingCost,
                'total_amount' => $totalAmount,
                'shipping_courier' => $ttsOrder['shipping_provider_name'] ?? $ttsOrder['delivery_option_name'] ?? 'TikTok Shipping',
                'tracking_number' => $ttsOrder['tracking_number'] ?? null,
                'created_at' => $createdAt,
                'payment_details' => [
                    'source' => 'tiktok',
                    'platform' => 'TikTok Shop / Tokopedia',
                    'tts_order_id' => $ttsOrderId,
                    'tts_status' => $ttsStatus,
                    'package_id' => $ttsOrder['package_list'][0]['id'] ?? null,
                ],
            ]
        );

        foreach ($lineItems as $item) {
            $ttsProdId = (string) ($item['product_id'] ?? '');
            $ttsSkuId = (string) ($item['sku_id'] ?? '');
            $sellerSku = $item['seller_sku'] ?? '';

            $mapping = $activeMappings->first(function ($m) use ($ttsProdId, $ttsSkuId, $sellerSku) {
                if ($ttsSkuId && (string) $m->marketplace_sku_id === $ttsSkuId) {
                    return true;
                }
                if ($ttsProdId && (string) $m->marketplace_product_id === $ttsProdId) {
                    return true;
                }
                if ($sellerSku && $m->seller_sku === $sellerSku) {
                    return true;
                }
                return false;
            });

            $prodName = $item['product_name'] ?? ($mapping?->marketplace_product_name ?: 'Kopi Sanubari');
            $skuName = $item['sku_name'] ?? ($mapping?->marketplace_sku_name ?: 'Default');
            $price = (float) ($item['sale_price'] ?? 0);
            $qty = (int) ($item['quantity'] ?? 1);

            $finalProductId = $mapping?->product_id;
            $finalVariantId = $mapping?->product_variant_id;

            if (! $finalProductId || ! $finalVariantId) {
                $rawName = strtolower($prodName);
                $cleanName = preg_replace('/^sanubari\s+roastery\s*-\s*/i', '', $rawName);
                $normClean = str_replace(
                    ['fungky', 'co ferment', 'wash', 'full wash', 'smothie', 'straberry', 'rapshody', 'abisynnia', 'fermetation'],
                    ['funky', 'co-ferment', 'fullwash', 'fullwash', 'smoothies', 'strawberry', 'rhapsody', 'abyssinia', 'fermentation'],
                    $cleanName
                );
                
                $weight = null;
                if (preg_match('/(\d+)\s*(g|gr|gram)/i', strtolower($skuName), $matches)) {
                    $weight = (int) $matches[1];
                }

                $products = Product::with('variants')->get();
                $bestProduct = null;
                $highestScore = 0;

                foreach ($products as $p) {
                    $normP = str_replace(
                        ['fungky', 'co ferment', 'wash', 'full wash', 'smothie', 'straberry', 'rapshody', 'abisynnia', 'fermetation'],
                        ['funky', 'co-ferment', 'fullwash', 'fullwash', 'smoothies', 'strawberry', 'rhapsody', 'abyssinia', 'fermentation'],
                        strtolower($p->name)
                    );
                    $wordsM = array_filter(explode(' ', preg_replace('/[^a-z0-9]/', ' ', $normClean)));
                    $wordsP = array_filter(explode(' ', preg_replace('/[^a-z0-9]/', ' ', $normP)));
                    $score = count(array_intersect($wordsM, $wordsP));
                    if ($score > $highestScore && $score >= 2) {
                        $highestScore = $score;
                        $bestProduct = $p;
                    }
                }

                if ($bestProduct) {
                    $finalProductId = $bestProduct->id;
                    $matchedVar = $weight ? $bestProduct->variants->firstWhere('weight_grams', $weight) : $bestProduct->variants->first();
                    $finalVariantId = $matchedVar?->id;
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
        $cached = Cache::get('tts_inbox_orders_list');
        if (is_array($cached)) {
            foreach ($cached as &$cOrder) {
                if ((string) $cOrder['id'] === $ttsOrderId) {
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
            Cache::put('tts_inbox_orders_list', $cached, now()->addMinutes(15));
        }

        return $order;
    }

    /**
     * Fetch orders from TikTok Shop for the last 30 days and sync them to local database.
     */
    public function syncOrders(int $pageSize = 50, int $days = 30): array
    {
        $rawOrders = $this->getRawTikTokOrders($days, true);
        $syncedCount = 0;

        foreach ($rawOrders as $orderData) {
            // Jangan tarik pesanan secara otomatis sebelum disimpan manual dari menu penerimaan pesanan.
            // Hanya perbarui status pesanan yang SEBELUMNYA SUDAH DISIMPAN MANUAL oleh admin.
            $orderId = (string) ($orderData['id'] ?? '');
            if (! Order::where('order_number', "TTS-{$orderId}")->exists()) {
                continue;
            }

            try {
                $this->saveSingleTikTokOrder($orderData);
                $syncedCount++;
            } catch (\Throwable $e) {
                Log::warning("Failed to update TikTok order {$orderData['id']}: " . $e->getMessage());
            }
        }

        $this->account->update([
            'last_order_sync_at' => now(),
        ]);

        return [
            'synced_count' => $syncedCount,
            'total_found' => count($rawOrders),
        ];
    }

    /**
     * Push current stock of all mapped products to TikTok Shop.
     * Hanya menolkan stok produk yang statusnya Habis (out_of_stock) di website.
     */
    /**
     * Sync real website stock to all TikTok Shop items where stock differs.
     */
    public function syncAllRealStockToTikTok(): array
    {
        $this->ensureValidToken();

        if (! $this->account->shop_cipher) {
            $this->syncAuthorizedShops();
        }

        $mappings = MarketplaceProductMapping::where('platform', 'tiktok')
            ->where('marketplace_status', 'ACTIVATE')
            ->whereNotNull('product_id')
            ->with(['product', 'variant'])
            ->get();

        $updatedCount = 0;
        $failedCount = 0;

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
                        'sync_message' => "Stok TikTok disamakan dengan stok real website ({$targetStock} pcs).",
                    ]);

                    $updatedCount++;
                } catch (\Throwable $e) {
                    $failedCount++;
                }
            }
        }

        return ['updated' => $updatedCount, 'failed' => $failedCount];
    }

    public function syncAllProductStock(): array
    {
        $this->ensureValidToken();

        if (! $this->account->shop_cipher) {
            $this->syncAuthorizedShops();
        }

        $mappings = MarketplaceProductMapping::where('platform', 'tiktok')
            ->where('marketplace_status', 'ACTIVATE')
            ->whereNotNull('product_id')
            ->with(['product', 'variant'])
            ->get();

        $updatedCount = 0;
        $failedCount = 0;

        foreach ($mappings as $mapping) {
            // Hanya sesuaikan stok ketika produk di website habis (out_of_stock)
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
                        'sync_message' => 'Stok di TikTok otomatis dinolkan karena status di website Habis.',
                    ]);

                    $updatedCount++;
                } catch (\Throwable $e) {
                    $failedCount++;
                    $mapping->update([
                        'sync_status' => 'error',
                        'sync_message' => $e->getMessage(),
                    ]);
                }
            }
        }

        $this->account->update([
            'last_stock_sync_at' => now(),
        ]);

        return [
            'updated' => $updatedCount,
            'failed' => $failedCount,
            'total' => $mappings->count(),
        ];
    }

    /**
     * Set stock to 0 on TikTok Shop for all mappings tied to a specific Product when out of stock.
     */
    public static function syncOutOfStockForProduct(Product $product): int
    {
        $updated = 0;
        try {
            $service = new self();
            $mappings = MarketplaceProductMapping::where('platform', 'tiktok')
                ->where('marketplace_status', 'ACTIVATE')
                ->where('product_id', $product->id)
                ->with(['variant'])
                ->get();

            foreach ($mappings as $mapping) {
                $isVariantOutOfStock = $mapping->product_variant_id
                    ? ($mapping->variant?->stock_status === 'out_of_stock')
                    : false;

                if ($product->stock_status === 'out_of_stock' || $isVariantOutOfStock) {
                    try {
                        $service->updateSingleSkuInventory(
                            $mapping->marketplace_product_id,
                            $mapping->marketplace_sku_id,
                            0
                        );

                        $mapping->update([
                            'marketplace_stock' => 0,
                            'last_synced_stock' => 0,
                            'last_synced_at' => now(),
                            'sync_status' => 'synced',
                            'sync_message' => 'Stok otomatis diubah ke 0 karena status di website Habis.',
                        ]);

                        $updated++;
                    } catch (\Throwable $e) {
                        \Log::warning("TikTok out_of_stock sync error for mapping {$mapping->id}: {$e->getMessage()}");
                    }
                }
            }
        } catch (\Throwable $e) {
            \Log::warning("TikTokShopService::syncOutOfStockForProduct error: {$e->getMessage()}");
        }

        return $updated;
    }

    /**
     * Set stock to 0 on TikTok Shop for all mappings tied to a specific ProductVariant when out of stock.
     */
    public static function syncOutOfStockForVariant(ProductVariant $variant): int
    {
        $updated = 0;
        try {
            $service = new self();
            $mappings = MarketplaceProductMapping::where('platform', 'tiktok')
                ->where('marketplace_status', 'ACTIVATE')
                ->where('product_variant_id', $variant->id)
                ->get();

            foreach ($mappings as $mapping) {
                if ($variant->stock_status === 'out_of_stock') {
                    try {
                        $service->updateSingleSkuInventory(
                            $mapping->marketplace_product_id,
                            $mapping->marketplace_sku_id,
                            0
                        );

                        $mapping->update([
                            'marketplace_stock' => 0,
                            'last_synced_stock' => 0,
                            'last_synced_at' => now(),
                            'sync_status' => 'synced',
                            'sync_message' => 'Stok varian otomatis diubah ke 0 karena status di website Habis.',
                        ]);

                        $updated++;
                    } catch (\Throwable $e) {
                        \Log::warning("TikTok out_of_stock sync error for variant mapping {$mapping->id}: {$e->getMessage()}");
                    }
                }
            }
        } catch (\Throwable $e) {
            \Log::warning("TikTokShopService::syncOutOfStockForVariant error: {$e->getMessage()}");
        }

        return $updated;
    }

    /**
     * Update inventory for a specific SKU on TikTok Shop.
     */
    public function updateSingleSkuInventory(string $productId, string $skuId, int $quantity): array
    {
        $this->ensureValidToken();

        $path = "/product/202309/products/{$productId}/inventory/update";
        $timestamp = time();

        $queryParams = [
            'app_key' => $this->account->app_key,
            'timestamp' => $timestamp,
            'shop_cipher' => $this->account->shop_cipher,
        ];

        $bodyPayload = [
            'skus' => [
                [
                    'id' => $skuId,
                    'inventory' => [
                        [
                            'quantity' => max(0, $quantity),
                        ],
                    ],
                ],
            ],
        ];
        $bodyJson = json_encode($bodyPayload, JSON_UNESCAPED_SLASHES);

        $sign = $this->generateSignature($path, $queryParams, $bodyJson);
        $queryParams['sign'] = $sign;

        $response = Http::withHeaders([
            'x-tts-access-token' => $this->account->access_token,
        ])->withBody($bodyJson, 'application/json')->post("{$this->apiBaseUrl}{$path}?" . http_build_query($queryParams));

        $data = $response->json();

        if (($data['code'] ?? -1) !== 0) {
            throw new \Exception('Gagal update stok TikTok Shop: ' . ($data['message'] ?? 'Unknown error'));
        }

        return $data;
    }

    /**
     * Get detailed product information including SKUs with sales_attributes (variants).
     */
    public function getProduct(string $productId): ?array
    {
        $this->ensureValidToken();

        $path = "/product/202309/products/{$productId}";
        $queryParams = [
            'app_key' => $this->account->app_key,
            'timestamp' => time(),
            'shop_cipher' => $this->account->shop_cipher,
        ];

        $sign = $this->generateSignature($path, $queryParams, '');
        $queryParams['sign'] = $sign;

        try {
            $response = Http::withHeaders([
                'x-tts-access-token' => $this->account->access_token,
            ])->get("{$this->apiBaseUrl}{$path}?" . http_build_query($queryParams));

            $data = $response->json();
            return $data['data'] ?? null;
        } catch (\Throwable $e) {
            \Log::warning("TikTok Shop getProduct({$productId}) error: {$e->getMessage()}");
            return null;
        }
    }

    /**
     * Fetch products from TikTok Shop and register/update product mappings.
     */
    public function syncProductsFromTikTok(int $pageSize = 100): array
    {
        $this->ensureValidToken();

        if (! $this->account->shop_cipher) {
            $this->syncAuthorizedShops();
        }

        $path = '/product/202309/products/search';
        $pageToken = null;
        $allProducts = [];

        do {
            $queryParams = [
                'app_key' => $this->account->app_key,
                'timestamp' => time(),
                'shop_cipher' => $this->account->shop_cipher,
                'page_size' => $pageSize,
            ];

            if ($pageToken) {
                $queryParams['page_token'] = $pageToken;
            }

            // Only retrieve ACTIVATE products from TikTok Shop
            $bodyPayload = [
                'status' => 'ACTIVATE',
            ];
            $bodyJson = json_encode($bodyPayload, JSON_UNESCAPED_SLASHES);

            $sign = $this->generateSignature($path, $queryParams, $bodyJson);
            $queryParams['sign'] = $sign;

            $response = Http::withHeaders([
                'x-tts-access-token' => $this->account->access_token,
            ])->withBody($bodyJson, 'application/json')->post("{$this->apiBaseUrl}{$path}?" . http_build_query($queryParams));

            $data = $response->json();

            if (($data['code'] ?? -1) !== 0) {
                throw new \Exception('Gagal mengambil produk TikTok Shop: ' . ($data['message'] ?? 'Unknown error'));
            }

            $pageProducts = $data['data']['products'] ?? [];
            $allProducts = array_merge($allProducts, $pageProducts);

            $pageToken = $data['data']['next_page_token'] ?? null;
        } while (! empty($pageToken) && count($allProducts) < 500);

        $mappedCount = 0;
        $activeSkuIds = [];

        foreach ($allProducts as $ttsProd) {
            $prodStatus = strtoupper($ttsProd['status'] ?? 'ACTIVATE');
            if ($prodStatus !== 'ACTIVATE') {
                continue;
            }

            $ttsProdId = $ttsProd['id'] ?? null;
            $title = $ttsProd['title'] ?? '';
            $imageUrl = $ttsProd['main_images'][0]['urls'][0] ?? ($ttsProd['images'][0]['url'] ?? null);

            // Fetch product detail to get sales_attributes (variant packaging names) and SKU images
            $detail = $ttsProdId ? $this->getProduct((string) $ttsProdId) : null;
            $skus = ! empty($detail['skus']) ? $detail['skus'] : ($ttsProd['skus'] ?? []);
            if (! $imageUrl && ! empty($detail)) {
                $imageUrl = $detail['main_images'][0]['urls'][0] ?? ($detail['images'][0]['url'] ?? null);
            }

            // Find best matching local product
            $localProduct = Product::where('name', 'like', "%{$title}%")->first();
            if (! $localProduct) {
                foreach (['kawi', 'ijen', 'toraja', 'gayo', 'flores', 'kerinci', 'mandheling', 'bali', 'robusta', 'espresso'] as $kw) {
                    if (stripos($title, $kw) !== false) {
                        $localProduct = Product::where('name', 'like', "%{$kw}%")->first();
                        if ($localProduct) {
                            break;
                        }
                    }
                }
            }

            foreach ($skus as $sku) {
                $skuId = $sku['id'] ?? null;
                $sellerSku = $sku['seller_sku'] ?? null;
                $stock = (int) ($sku['inventory'][0]['quantity'] ?? 0);
                $price = (float) ($sku['price']['sale_price'] ?? ($sku['price']['tax_exclusive_price'] ?? ($sku['price']['amount'] ?? 0)));

                // Check SKU status
                $skuStatus = strtoupper($sku['status_info']['status'] ?? ($sku['status'] ?? 'NORMAL'));
                if (in_array($skuStatus, ['DELETED', 'INACTIVE', 'FROZEN'])) {
                    continue;
                }

                $activeSkuIds[] = (string) $skuId;

                // Extract SKU-specific image if available
                $skuImg = $sku['sales_attributes'][0]['sku_img']['urls'][0]
                    ?? ($sku['sales_attributes'][0]['sku_img']['thumb_urls'][0] ?? null);
                $finalImageUrl = $skuImg ?: $imageUrl;

                // Extract variant label from sales_attributes
                $variantParts = [];
                $attrs = $sku['sales_attributes'] ?? ($sku['sales_attribute'] ?? []);
                if (! empty($attrs) && is_array($attrs)) {
                    foreach ($attrs as $attr) {
                        $val = $attr['value_name']
                            ?? $attr['custom_value']
                            ?? $attr['value']
                            ?? $attr['attribute_value']
                            ?? null;

                        // Filter out raw long numeric IDs
                        if ($val && ! (is_numeric($val) && strlen((string) $val) > 10)) {
                            $variantParts[] = $val;
                        }
                    }
                }

                if (empty($variantParts)) {
                    $candidate = $sku['sku_name'] ?? ($sku['name'] ?? null);
                    if ($candidate && ! (is_numeric($candidate) && strlen((string) $candidate) > 10)) {
                        $variantParts[] = $candidate;
                    }
                }

                $skuVariantLabel = ! empty($variantParts)
                    ? implode(' / ', $variantParts)
                    : null;

                // Match variant by SKU or matching variant label
                $localVariant = null;
                if ($localProduct) {
                    if ($sellerSku) {
                        $localVariant = ProductVariant::where('product_id', $localProduct->id)
                            ->where('sku', $sellerSku)
                            ->first();
                    }

                    if (! $localVariant && $skuVariantLabel) {
                        $cleanTerm = trim(str_ireplace(['(tester)', 'gr', 'gram'], '', $skuVariantLabel));
                        $localVariant = ProductVariant::where('product_id', $localProduct->id)
                            ->where(function ($q) use ($skuVariantLabel, $cleanTerm) {
                                $q->where('label', 'like', "%{$skuVariantLabel}%");
                                if (! empty($cleanTerm)) {
                                    $q->orWhere('label', 'like', "%{$cleanTerm}%");
                                }
                            })
                            ->first();
                    }

                    if (! $localVariant) {
                        $localVariant = ProductVariant::where('product_id', $localProduct->id)->first();
                    }
                }

                $existing = MarketplaceProductMapping::where('platform', 'tiktok')
                    ->where('marketplace_product_id', (string) $ttsProdId)
                    ->where('marketplace_sku_id', (string) $skuId)
                    ->first();

                // Retain manual connection if already mapped by user, otherwise keep unconnected
                $finalProductId = $existing?->product_id;
                $finalVariantId = $existing?->product_variant_id;
                $syncStatus = $finalProductId ? 'synced' : 'pending';

                MarketplaceProductMapping::updateOrCreate(
                    [
                        'platform' => 'tiktok',
                        'marketplace_product_id' => (string) $ttsProdId,
                        'marketplace_sku_id' => (string) $skuId,
                    ],
                    [
                        'marketplace_product_name' => $title,
                        'marketplace_image_url' => $finalImageUrl,
                        'marketplace_sku_name' => $skuVariantLabel,
                        'marketplace_stock' => $stock,
                        'marketplace_price' => $price,
                        'marketplace_status' => 'ACTIVATE',
                        'product_id' => $finalProductId,
                        'product_variant_id' => $finalVariantId,
                        'seller_sku' => $sellerSku,
                        'last_synced_stock' => $stock,
                        'last_synced_at' => now(),
                        'sync_status' => $syncStatus,
                        'sync_message' => $finalProductId ? "Produk terhubung: {$title}" . ($skuVariantLabel ? " ({$skuVariantLabel})" : '') : 'Belum dipetakan ke produk website',
                    ]
                );

                $mappedCount++;
            }
        }

        // Set any previously mapped SKU no longer active on TikTok Shop to INACTIVE
        if (! empty($activeSkuIds)) {
            MarketplaceProductMapping::where('platform', 'tiktok')
                ->whereNotIn('marketplace_sku_id', $activeSkuIds)
                ->update(['marketplace_status' => 'INACTIVE']);
        }

        return [
            'total_products' => count($allProducts),
            'total_mapped' => $mappedCount,
        ];
    }
}
