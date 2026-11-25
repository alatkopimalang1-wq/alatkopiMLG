<?php

namespace App\Services;

use App\Models\Order;
use App\Models\Setting;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class BiteshipService
{
    public const DEFAULT_BASE_URL = 'https://api.biteship.com/v1';

    /**
     * Supported Biteship couriers.
     */
    public const SUPPORTED_COURIERS = [
        'jntcargo' => 'J&T Cargo (Kargo & Grosir)',
        'jnt' => 'J&T Express',
        'jne' => 'JNE Express',
        'sicepat' => 'SiCepat Ekspres',
        'anteraja' => 'AnterAja',
        'pos' => 'POS Indonesia',
        'tiki' => 'TIKI',
        'lion' => 'Lion Parcel',
        'ninja' => 'Ninja Xpress',
        'idexpress' => 'ID Express',
        'wahana' => 'Wahana Express',
        'gosend' => 'GoSend (Instant / Same Day)',
        'grab' => 'GrabExpress',
    ];

    /**
     * Check if Biteship integration is enabled.
     */
    public static function isEnabled(): bool
    {
        return (bool) Setting::get('biteship_enabled', false);
    }

    /**
     * Get environment mode (production or testing).
     */
    public static function getEnvironment(): string
    {
        return (string) Setting::get('biteship_environment', config('services.biteship.environment', 'production'));
    }

    /**
     * Check if running in production mode.
     */
    public static function isProduction(): bool
    {
        return self::getEnvironment() === 'production';
    }

    /**
     * Get configured API key.
     */
    public static function getApiKey(): ?string
    {
        $settingKey = Setting::get('biteship_api_key');
        if (! empty($settingKey)) {
            return trim((string) $settingKey);
        }

        $configKey = config('services.biteship.api_key');

        return ! empty($configKey) ? trim((string) $configKey) : null;
    }

    /**
     * Get configured webhook secret / signature key.
     */
    public static function getWebhookSecret(): ?string
    {
        $settingSecret = Setting::get('biteship_webhook_secret');
        if (! empty($settingSecret)) {
            return trim((string) $settingSecret);
        }

        $configSecret = config('services.biteship.webhook_secret');

        return ! empty($configSecret) ? trim((string) $configSecret) : null;
    }

    /**
     * Get API base URL.
     */
    public static function getBaseUrl(): string
    {
        return rtrim((string) (config('services.biteship.base_url') ?: self::DEFAULT_BASE_URL), '/');
    }

    /**
     * Test connection to Biteship API.
     */
    public static function testConnection(?string $apiKey = null): array
    {
        $key = $apiKey ?: self::getApiKey();
        if (empty($key)) {
            return [
                'success' => false,
                'message' => 'API Key Biteship belum diisi. Masukkan API Key Anda terlebih dahulu.',
            ];
        }

        try {
            $response = Http::withHeaders([
                'Authorization' => 'Bearer '.$key,
                'Accept' => 'application/json',
            ])->timeout(10)->get(self::getBaseUrl().'/couriers');

            if ($response->successful()) {
                $data = $response->json();
                $couriers = $data['couriers'] ?? [];

                return [
                    'success' => true,
                    'message' => 'Koneksi ke API Biteship berhasil! '.count($couriers).' kurir/layanan terhubung.',
                    'couriers_count' => count($couriers),
                    'couriers' => $couriers,
                ];
            }

            $errorData = $response->json();
            $errorMessage = $errorData['error'] ?? $errorData['message'] ?? 'Status HTTP: '.$response->status();

            return [
                'success' => false,
                'message' => 'Gagal terhubung ke Biteship: '.$errorMessage,
            ];
        } catch (\Throwable $e) {
            Log::warning('Biteship test connection exception: '.$e->getMessage());

            return [
                'success' => false,
                'message' => 'Koneksi timeout atau gagal menghubungi server Biteship: '.$e->getMessage(),
            ];
        }
    }

    /**
     * Search areas/locations via Biteship Locations API.
     */
    public static function searchAreas(string $query): array
    {
        $query = trim($query);
        if (strlen($query) < 3) {
            return [];
        }

        $cacheKey = 'biteship_areas_'.md5(strtolower($query));

        return Cache::remember($cacheKey, 86400, function () use ($query) {
            $key = self::getApiKey();
            if (empty($key)) {
                return [];
            }

            try {
                $response = Http::withHeaders([
                    'Authorization' => 'Bearer '.$key,
                    'Accept' => 'application/json',
                ])->timeout(8)->get(self::getBaseUrl().'/locations/areas', [
                    'countries' => 'ID',
                    'input' => $query,
                    'type' => 'single',
                ]);

                if ($response->successful()) {
                    $json = $response->json();
                    $areas = $json['areas'] ?? [];

                    return array_map(function ($area) {
                        return [
                            'id' => $area['id'] ?? '',
                            'name' => $area['name'] ?? '',
                            'country_name' => $area['country_name'] ?? 'Indonesia',
                            'province' => $area['administrative_division_level_1_name'] ?? '',
                            'city' => $area['administrative_division_level_2_name'] ?? '',
                            'district' => $area['administrative_division_level_3_name'] ?? '',
                            'subdistrict' => $area['administrative_division_level_4_name'] ?? '',
                            'postal_code' => $area['postal_code'] ?? null,
                        ];
                    }, $areas);
                }
            } catch (\Throwable $e) {
                Log::warning('Biteship searchAreas exception: '.$e->getMessage());
            }

            return [];
        });
    }

    /**
     * Get live shipping rates from Biteship Couriers Pricing API.
     */
    public static function getRates(array $params): array
    {
        $key = self::getApiKey();
        if (empty($key)) {
            return [];
        }

        $originPostal = (int) ($params['origin_postal_code'] ?? Setting::get('shipping_origin_postal_code', 65144));
        $destPostal = ! empty($params['destination_postal_code']) ? (int) $params['destination_postal_code'] : null;
        $originAreaId = $params['origin_area_id'] ?? Setting::get('biteship_origin_area_id');
        $destAreaId = $params['destination_area_id'] ?? null;

        $couriers = $params['couriers'] ?? Setting::get('biteship_couriers', ['grab', 'gojek', 'jnt', 'jntcargo', 'jne', 'sicepat', 'anteraja', 'pos', 'tiki']);
        if (is_array($couriers)) {
            $couriers = implode(',', array_filter($couriers));
        }

        $items = $params['items'] ?? [
            [
                'name' => 'Kopi Spesialti Sanubari',
                'description' => 'Paket kopi bubuk & biji sangrai',
                'value' => (int) ($params['subtotal'] ?? 100000),
                'weight' => max(200, (int) ($params['weight_grams'] ?? 200)),
                'quantity' => 1,
            ],
        ];

        $payload = [
            'couriers' => $couriers ?: 'grab,gojek,jnt,jntcargo,jne,sicepat,anteraja,pos,tiki',
            'items' => $items,
        ];

        if (! empty($originAreaId)) {
            $payload['origin_area_id'] = $originAreaId;
        } else {
            $payload['origin_postal_code'] = $originPostal;
        }

        if (! empty($destAreaId)) {
            $payload['destination_area_id'] = $destAreaId;
        } elseif (! empty($destPostal)) {
            $payload['destination_postal_code'] = $destPostal;
        } else {
            // Cannot calculate Biteship rates without destination postal code or area ID
            return [];
        }

        $originLat = $params['origin_latitude'] ?? -7.9327;
        $originLng = $params['origin_longitude'] ?? 112.6037;
        if (! empty($originLat) && ! empty($originLng)) {
            $payload['origin_latitude'] = (float) $originLat;
            $payload['origin_longitude'] = (float) $originLng;
        }
        if (! empty($params['destination_latitude']) && ! empty($params['destination_longitude'])) {
            $payload['destination_latitude'] = (float) $params['destination_latitude'];
            $payload['destination_longitude'] = (float) $params['destination_longitude'];
        }

        $cacheKey = 'biteship_rates_'.md5(json_encode($payload));

        return Cache::remember($cacheKey, 600, function () use ($payload, $key) {
            try {
                $response = Http::withHeaders([
                    'Authorization' => 'Bearer '.$key,
                    'Accept' => 'application/json',
                    'Content-Type' => 'application/json',
                ])->timeout(12)->post(self::getBaseUrl().'/rates/couriers', $payload);

                if (! $response->successful()) {
                    Log::warning('Biteship rates request returned error', [
                        'status' => $response->status(),
                        'response' => $response->body(),
                    ]);

                    return [];
                }

                $json = $response->json();
                $pricing = $json['pricing'] ?? [];

                return array_map(function ($rate) {
                    $courierCode = strtolower((string) ($rate['courier_code'] ?? $rate['company'] ?? 'courier'));
                    $serviceCode = strtolower((string) ($rate['courier_service_code'] ?? $rate['type'] ?? 'reg'));
                    $serviceName = (string) ($rate['courier_service_name'] ?? strtoupper($serviceCode));
                    $courierName = (string) ($rate['courier_name'] ?? strtoupper($courierCode));
                    $price = (float) ($rate['price'] ?? 0);
                    $duration = (string) ($rate['duration'] ?? $rate['etd'] ?? '');

                    return [
                        'courier_code' => $courierCode,
                        'courier_name' => $courierName,
                        'service_code' => $serviceCode,
                        'service_name' => $serviceName,
                        'description' => $rate['description'] ?? ($courierName.' '.$serviceName),
                        'cost' => $price,
                        'etd' => $duration ?: '1-3 hari',
                        'tier' => $rate['service_type'] ?? 'standard',
                        'raw_biteship' => [
                            'shipment_duration_range' => $rate['duration'] ?? null,
                            'available_for_cash_on_delivery' => $rate['available_for_cash_on_delivery'] ?? false,
                        ],
                    ];
                }, $pricing);
            } catch (\Throwable $e) {
                Log::error('Biteship getRates exception: '.$e->getMessage());

                return [];
            }
        });
    }

    /**
     * Create shipment order and obtain waybill / tracking ID via Biteship Orders API.
     */
    public static function createOrder(Order $order, array $options = []): array
    {
        $key = self::getApiKey();
        if (empty($key)) {
            return [
                'success' => false,
                'message' => 'API Key Biteship belum terpasang.',
            ];
        }

        $courierRaw = strtolower((string) ($order->shipping_courier ?: 'jne'));
        $courierCompany = 'jne';
        if (str_contains($courierRaw, 'j&t') || str_contains($courierRaw, 'jnt')) {
            $courierCompany = 'jnt';
        } elseif (str_contains($courierRaw, 'sicepat')) {
            $courierCompany = 'sicepat';
        } elseif (str_contains($courierRaw, 'anteraja')) {
            $courierCompany = 'anteraja';
        } elseif (str_contains($courierRaw, 'pos')) {
            $courierCompany = 'pos';
        } elseif (str_contains($courierRaw, 'tiki')) {
            $courierCompany = 'tiki';
        } elseif (str_contains($courierRaw, 'lion')) {
            $courierCompany = 'lion';
        } elseif (str_contains($courierRaw, 'ninja')) {
            $courierCompany = 'ninja';
        } elseif (str_contains($courierRaw, 'wahana')) {
            $courierCompany = 'wahana';
        } elseif (str_contains($courierRaw, 'gosend')) {
            $courierCompany = 'gosend';
        } elseif (str_contains($courierRaw, 'grab')) {
            $courierCompany = 'grab';
        }

        $serviceRaw = strtolower((string) ($order->shipping_service ?: 'reg'));
        $serviceType = 'reg';
        if (str_contains($serviceRaw, 'instant')) {
            $serviceType = 'instant';
        } elseif (str_contains($serviceRaw, 'same') || str_contains($serviceRaw, 'sameday')) {
            $serviceType = 'same_day';
        } elseif (str_contains($serviceRaw, 'ez')) {
            $serviceType = 'ez';
        } elseif (str_contains($serviceRaw, 'cargo') || str_contains($serviceRaw, 'gokil') || str_contains($serviceRaw, 'jtr')) {
            $serviceType = 'cargo';
        } elseif (str_contains($serviceRaw, 'yes')) {
            $serviceType = 'yes';
        } elseif (str_contains($serviceRaw, 'oke')) {
            $serviceType = 'oke';
        } else {
            $serviceType = trim(explode('(', $serviceRaw)[0]);
            $serviceType = preg_replace('/[^a-z0-9_]/', '', $serviceType) ?: 'reg';
        }

        $items = $order->items->map(function ($item) {
            return [
                'name' => $item->product_name ?? $item->product_title ?? 'Kopi Sanubari',
                'description' => $item->variant_label ?? 'Biji Kopi Spesialti',
                'value' => (int) ($item->price ?: $item->unit_price ?: 50000),
                'quantity' => (int) ($item->quantity ?: 1),
                'weight' => max(100, (int) ($item->weight_grams ?: 200)),
            ];
        })->toArray();

        if (empty($items)) {
            $items = [
                [
                    'name' => 'Pesanan '.$order->order_number,
                    'value' => (int) $order->total_amount,
                    'quantity' => 1,
                    'weight' => (int) ($order->total_weight_grams ?: 250),
                ],
            ];
        }

        $senderName = Setting::get('shipping_sender_name', 'ALAT KOPI MALANG TLOGOMAS');
        $senderPhone = Setting::get('shipping_sender_phone', '085121930454');
        $senderAddress = Setting::get('shipping_sender_address', 'Ruko Tlogomas Square Kav. 34, Jl. Raya Tlogomas, Lowokwaru, Kota Malang');
        $originPostal = (int) Setting::get('shipping_origin_postal_code', 65144);
        $destPostal = (int) ($order->shipping_postal_code ?: 65144);

        $originLat = (float) (Setting::get('shipping_origin_latitude') ?: -7.9327);
        $originLng = (float) (Setting::get('shipping_origin_longitude') ?: 112.6037);

        // Ambil alamat tujuan pelanggan nyata dari customer_address
        $destinationAddress = (string) ($order->customer_address ?: 'Alamat Pengiriman');
        $cleanDestAddress = trim(preg_replace('/\(📍 Titik GPS: [^\)]+\)/', '', $destinationAddress));
        if (empty($cleanDestAddress)) {
            $cleanDestAddress = $destinationAddress;
        }

        // Cari koordinat tujuan pelanggan
        $destLat = null;
        $destLng = null;
        if (! empty($options['destination_latitude']) && ! empty($options['destination_longitude'])) {
            $destLat = (float) $options['destination_latitude'];
            $destLng = (float) $options['destination_longitude'];
        } elseif (! empty($order->payment_details['customer_latitude']) && ! empty($order->payment_details['customer_longitude'])) {
            $destLat = (float) $order->payment_details['customer_latitude'];
            $destLng = (float) $order->payment_details['customer_longitude'];
        } elseif (preg_match('/maps\.google\.com\/\?q=([-0-9.]+),([-0-9.]+)/', $destinationAddress, $matches)) {
            $destLat = (float) $matches[1];
            $destLng = (float) $matches[2];
        }

        $isInstantCourier = in_array($courierCompany, ['gosend', 'grab', 'lalamove', 'paxel'])
            || str_contains($serviceType, 'instant')
            || str_contains($serviceType, 'sameday');

        if ($isInstantCourier && ($destLat === null || $destLng === null)) {
            // Fallback koordinat pusat Malang untuk kurir instan jika pelanggan tidak menandai peta
            $destLat = -7.9826;
            $destLng = 112.6308;
        }

        $payload = [
            'shipper_contact_name' => $senderName,
            'shipper_contact_phone' => preg_replace('/[^0-9]/', '', $senderPhone),
            'origin_contact_name' => $senderName,
            'origin_contact_phone' => preg_replace('/[^0-9]/', '', $senderPhone),
            'origin_address' => $senderAddress,
            'origin_postal_code' => $originPostal,
            'origin_coordinate' => [
                'latitude' => $originLat,
                'longitude' => $originLng,
            ],
            'destination_contact_name' => $order->customer_name ?: 'Pelanggan Sanubari',
            'destination_contact_phone' => preg_replace('/[^0-9]/', '', (string) ($order->customer_phone ?: '08123456789')),
            'destination_address' => $cleanDestAddress,
            'destination_postal_code' => $destPostal,
            'courier_company' => $courierCompany,
            'courier_type' => $serviceType,
            'delivery_type' => $options['delivery_type'] ?? ($isInstantCourier ? 'now' : 'later'),
            'origin_note' => $options['origin_note'] ?? $options['notes'] ?? 'Ambil di kasir bar Alat Kopi Malang',
            'order_note' => $order->order_number.' - Biji Kopi Sangrai',
            'items' => $items,
        ];

        if (($options['delivery_type'] ?? '') === 'scheduled') {
            if (! empty($options['delivery_date'])) {
                $payload['delivery_date'] = $options['delivery_date'];
            }
            if (! empty($options['delivery_time'])) {
                $payload['delivery_time'] = $options['delivery_time'];
            }
        }

        if ($destLat !== null && $destLng !== null) {
            $payload['destination_coordinate'] = [
                'latitude' => $destLat,
                'longitude' => $destLng,
            ];
        }

        try {
            $response = Http::withHeaders([
                'Authorization' => 'Bearer '.$key,
                'Accept' => 'application/json',
                'Content-Type' => 'application/json',
            ])->timeout(15)->post(self::getBaseUrl().'/orders', $payload);

            $data = $response->json();
            if ($response->successful() && ! empty($data['success'])) {
                $biteshipId = $data['id'] ?? null;
                $waybill = $data['courier']['waybill_id'] ?? $data['waybill_id'] ?? $biteshipId;

                $paymentDetails = $order->payment_details ?? [];
                $paymentDetails['biteship'] = [
                    'order_id' => $biteshipId,
                    'waybill_id' => $waybill,
                    'courier_company' => $courierCompany,
                    'courier_type' => $serviceType,
                    'tracking_id' => $data['courier']['tracking_id'] ?? null,
                    'price' => $data['price'] ?? null,
                    'status' => $data['status'] ?? 'allocated',
                    'created_at' => now()->toDateTimeString(),
                ];

                if (! empty($waybill)) {
                    $order->tracking_number = $waybill;
                }
                $order->payment_details = $paymentDetails;
                if ($order->status === 'pending') {
                    $order->status = 'processing';
                }
                $order->save();

                return [
                    'success' => true,
                    'message' => 'Pesanan pengiriman Biteship berhasil dibuat! No. Resi: '.$waybill,
                    'waybill' => $waybill,
                    'biteship_id' => $biteshipId,
                    'raw' => $data,
                ];
            }

            $errorMessage = $data['error'] ?? $data['message'] ?? 'Gagal membuat pesanan pengiriman ke Biteship.';
            Log::warning('Biteship createOrder returned error', [
                'status' => $response->status(),
                'response' => $data,
                'payload' => $payload,
            ]);

            return [
                'success' => false,
                'message' => $errorMessage,
                'raw' => $data,
            ];
        } catch (\Throwable $e) {
            Log::error('Biteship createOrder exception: '.$e->getMessage());

            return [
                'success' => false,
                'message' => 'Exception Biteship: '.$e->getMessage(),
            ];
        }
    }

    /**
     * Retrieve Order details from Biteship API.
     */
    public static function getOrder(string $orderId): array
    {
        $key = self::getApiKey();
        if (empty($key)) {
            return ['success' => false, 'message' => 'API Key Biteship belum terpasang.'];
        }

        try {
            $response = Http::withHeaders([
                'Authorization' => 'Bearer '.$key,
                'Accept' => 'application/json',
            ])->timeout(10)->get(self::getBaseUrl().'/orders/'.urlencode($orderId));

            if ($response->successful()) {
                return [
                    'success' => true,
                    'data' => $response->json(),
                ];
            }

            return [
                'success' => false,
                'message' => $response->json('error') ?? $response->json('message') ?? 'Gagal mengambil status order Biteship.',
            ];
        } catch (\Throwable $e) {
            return [
                'success' => false,
                'message' => 'Exception Biteship: '.$e->getMessage(),
            ];
        }
    }

    /**
     * Request live courier pickup via Biteship API.
     */
    public static function requestPickup(Order $order, array $pickupDetails = []): array
    {
        $key = self::getApiKey();
        if (empty($key)) {
            return [
                'success' => false,
                'message' => 'API Key Biteship belum dikonfigurasi di Pengaturan Pengiriman.',
            ];
        }

        $existingBiteshipId = $order->payment_details['biteship']['order_id'] ?? null;

        $pickupType = $pickupDetails['pickup_type'] ?? 'now';
        $pickupDate = $pickupDetails['pickup_date'] ?? now()->format('Y-m-d');
        $pickupTimeRaw = $pickupDetails['pickup_time'] ?? '13:00';
        $pickupTime = explode(' ', $pickupTimeRaw)[0];
        $notes = $pickupDetails['notes'] ?? 'Paket Alat Kopi Malang. Ambil di kasir bar.';

        $options = [
            'delivery_type' => $pickupType === 'now' ? 'now' : 'scheduled',
            'delivery_date' => $pickupDate,
            'delivery_time' => $pickupTime,
            'origin_note' => $notes,
            'notes' => $notes,
        ];

        // 1. Jika belum pernah dibuat di Biteship, buat pesanan ke Biteship yang otomatis memicu pickup
        if (empty($existingBiteshipId)) {
            $createRes = self::createOrder($order, $options);
            if (! empty($createRes['success'])) {
                $order->refresh();
                $bData = $createRes['raw'] ?? [];
                $courierName = $bData['courier']['name'] ?? $order->shipping_courier;
                $driverName = $bData['driver']['name'] ?? null;
                $driverPhone = $bData['driver']['phone'] ?? null;
                $status = $bData['status'] ?? 'allocated';

                $paymentDetails = $order->payment_details ?? [];
                $paymentDetails['pickup'] = [
                    'pickup_reference' => $createRes['waybill'] ?? $createRes['biteship_id'],
                    'biteship_order_id' => $createRes['biteship_id'],
                    'status' => $status,
                    'courier_name' => $courierName,
                    'driver_name' => $driverName,
                    'driver_phone' => $driverPhone,
                    'delivery_type' => $options['delivery_type'],
                    'pickup_date' => $pickupDate,
                    'pickup_time' => $pickupTime,
                    'notes' => $notes,
                    'requested_at' => now()->toDateTimeString(),
                    'api_provider' => 'Biteship Live API',
                ];
                $order->payment_details = $paymentDetails;
                $order->status = 'ready_for_pickup';
                $order->save();

                $driverInfo = $driverName ? " Driver: {$driverName} ({$driverPhone})." : ' Driver sedang dialokasikan oleh ekspedisi.';

                return [
                    'success' => true,
                    'message' => "Request Pick Up ke Biteship Berhasil! Kurir: {$courierName}. No. Resi (AWB): {$createRes['waybill']}. Status: {$status}.{$driverInfo}",
                    'data' => $bData,
                ];
            }

            return $createRes;
        }

        // 2. Jika sudah ada di Biteship, ambil update status pickup live dari Biteship
        $checkRes = self::getOrder($existingBiteshipId);
        if (! empty($checkRes['success'])) {
            $bData = $checkRes['data'] ?? [];
            $status = $bData['status'] ?? 'allocated';
            $courierName = $bData['courier']['name'] ?? $order->shipping_courier;
            $driverName = $bData['driver']['name'] ?? null;
            $driverPhone = $bData['driver']['phone'] ?? null;

            $paymentDetails = $order->payment_details ?? [];
            $paymentDetails['pickup'] = [
                'pickup_reference' => $order->tracking_number,
                'biteship_order_id' => $existingBiteshipId,
                'status' => $status,
                'courier_name' => $courierName,
                'driver_name' => $driverName,
                'driver_phone' => $driverPhone,
                'delivery_type' => $options['delivery_type'],
                'pickup_date' => $pickupDate,
                'pickup_time' => $pickupTime,
                'notes' => $notes,
                'requested_at' => now()->toDateTimeString(),
                'api_provider' => 'Biteship Live API',
            ];
            $order->payment_details = $paymentDetails;
            $order->status = 'ready_for_pickup';
            $order->save();

            $driverInfo = $driverName ? " Driver dialokasikan: {$driverName} ({$driverPhone})." : ' Driver sedang ditugaskan kurir.';

            return [
                'success' => true,
                'message' => "Order Biteship Aktif! Status Penjemputan: {$status} ({$courierName}). No. Resi: {$order->tracking_number}.{$driverInfo}",
                'data' => $bData,
            ];
        }

        return [
            'success' => false,
            'message' => $checkRes['message'] ?? 'Gagal memeriksa status pickup di Biteship.',
        ];
    }

    /**
     * Track Waybill Airway Bill via Biteship Tracking API.
     */
    public static function trackWaybill(string $waybill, string $courier): array
    {
        $key = self::getApiKey();
        if (empty($key)) {
            return [
                'success' => false,
                'message' => 'API Key Biteship tidak terkonfigurasi.',
            ];
        }

        try {
            $endpoint = self::getBaseUrl().'/trackings/'.urlencode($waybill);
            $response = Http::withHeaders([
                'Authorization' => 'Bearer '.$key,
                'Accept' => 'application/json',
            ])->timeout(10)->get($endpoint);

            if (! $response->successful()) {
                // Alternative format: /trackings/airway_bill/{waybill}/courier/{courier}
                $altEndpoint = self::getBaseUrl().'/trackings/airway_bill/'.urlencode($waybill).'/courier/'.urlencode($courier);
                $response = Http::withHeaders([
                    'Authorization' => 'Bearer '.$key,
                    'Accept' => 'application/json',
                ])->timeout(10)->get($altEndpoint);
            }

            if ($response->successful()) {
                $data = $response->json();
                $history = array_map(function ($h) {
                    return [
                        'date' => isset($h['updated_at']) ? date('d M Y, H:i', strtotime($h['updated_at'])) : ($h['time'] ?? '-'),
                        'desc' => $h['note'] ?? $h['status'] ?? '',
                        'location' => $h['service_type'] ?? 'Hub Ekspedisi',
                    ];
                }, $data['history'] ?? []);

                return [
                    'success' => true,
                    'provider' => 'Biteship Live Tracking',
                    'courier_name' => strtoupper($data['courier']['company'] ?? $courier),
                    'waybill' => $data['waybill_id'] ?? $waybill,
                    'status' => strtoupper((string) ($data['status'] ?? 'ON PROCESS')),
                    'status_label' => ucfirst(str_replace('_', ' ', (string) ($data['status'] ?? 'Sedang dikirim'))),
                    'shipper' => $data['origin']['contact_name'] ?? 'Alat Kopi Malang',
                    'receiver' => $data['destination']['contact_name'] ?? 'Pelanggan',
                    'origin' => $data['origin']['address'] ?? 'Kota Malang',
                    'destination' => $data['destination']['address'] ?? 'Tujuan Pengiriman',
                    'delivered' => ($data['status'] ?? '') === 'delivered',
                    'history' => $history,
                ];
            }
        } catch (\Throwable $e) {
            Log::warning('Biteship tracking exception: '.$e->getMessage());
        }

        return [
            'success' => false,
            'message' => 'Data pelacakan Biteship tidak ditemukan atau belum diperbarui.',
        ];
    }

    /**
     * Handle incoming webhook notification from Biteship.
     */
    public static function handleWebhook(array $payload): array
    {
        Log::info('Biteship webhook received', $payload);

        $orderId = $payload['order_id'] ?? null;
        $waybill = $payload['courier_tracking_id'] ?? $payload['waybill_id'] ?? null;
        $status = strtolower((string) ($payload['status'] ?? ''));

        if (! $orderId && ! $waybill) {
            return [
                'success' => false,
                'message' => 'Payload webhook tidak memiliki order_id atau waybill_id.',
            ];
        }

        // Find Order by tracking number or payment_details->biteship->order_id
        $order = null;
        if (! empty($waybill)) {
            $order = Order::where('tracking_number', $waybill)->first();
        }
        if (! $order && ! empty($orderId)) {
            $order = Order::where('payment_details->biteship->order_id', $orderId)->first();
        }

        if ($order) {
            $paymentDetails = $order->payment_details ?? [];
            if (! isset($paymentDetails['biteship'])) {
                $paymentDetails['biteship'] = [];
            }
            $paymentDetails['biteship']['last_webhook_status'] = $status;
            $paymentDetails['biteship']['last_webhook_at'] = now()->toDateTimeString();
            $order->payment_details = $paymentDetails;

            if ($status === 'delivered') {
                $order->status = 'completed';
            } elseif ($status === 'cancelled' || $status === 'rejected') {
                $order->status = 'cancelled';
            } elseif (in_array($status, ['picked', 'picking_up', 'allocated', 'dropping_off'], true)) {
                if ($order->status === 'pending') {
                    $order->status = 'processing';
                }
            }
            $order->save();

            return [
                'success' => true,
                'message' => 'Status pesanan '.$order->order_number.' diperbarui ke: '.$status,
                'order_id' => $order->id,
            ];
        }

        return [
            'success' => true,
            'message' => 'Webhook diterima, order tidak ditemukan di database.',
        ];
    }
}
