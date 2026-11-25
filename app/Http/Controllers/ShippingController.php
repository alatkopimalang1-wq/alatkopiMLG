<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Services\BiteshipService;
use App\Services\ShippingService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class ShippingController extends Controller
{
    /**
     * Get list of provinces.
     */
    public function provinces(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => ShippingService::getProvinces(),
        ]);
    }

    /**
     * Get list of cities optionally filtered by province ID.
     */
    public function cities(Request $request): JsonResponse
    {
        $provinceId = $request->query('province_id');
        $cities = ShippingService::getCities($provinceId !== null ? (int) $provinceId : null);

        return response()->json([
            'success' => true,
            'data' => $cities,
        ]);
    }

    /**
     * Get list of subdistricts / kecamatan filtered by city ID.
     */
    public function subdistricts(Request $request): JsonResponse
    {
        $cityId = (int) $request->query('city_id', 256);
        $subdistricts = ShippingService::getSubdistricts($cityId);

        return response()->json([
            'success' => true,
            'data' => $subdistricts,
        ]);
    }

    /**
     * Calculate automatic courier shipping rates.
     */
    public function calculate(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'destination_city_id' => 'required|integer',
            'destination_subdistrict_id' => 'nullable|integer',
            'destination_postal_code' => 'nullable|string|max:10',
            'destination_area_id' => 'nullable|string|max:50',
            'destination_latitude' => 'nullable|numeric|between:-90,90',
            'destination_longitude' => 'nullable|numeric|between:-180,180',
            'province_id' => 'nullable|integer',
            'weight_grams' => 'required|integer|min:1',
            'subtotal' => 'nullable|numeric|min:0',
        ]);

        $config = ShippingService::getConfig();
        $rates = ShippingService::calculateRates($validated);
        $isBiteshipActive = BiteshipService::isEnabled() && ! empty(BiteshipService::getApiKey());

        return response()->json([
            'success' => true,
            'gateway' => [
                'provider' => $isBiteshipActive ? 'Biteship Multi-Courier Gateway' : 'Sanubari Shipping Matrix',
                'type' => $isBiteshipActive ? 'Live API Rates' : 'Direct Express',
            ],
            'origin' => [
                'city' => $config['origin_city_name'],
                'province' => $config['origin_province_name'],
                'postal_code' => $config['origin_postal_code'],
                'latitude' => $config['origin_latitude'],
                'longitude' => $config['origin_longitude'],
            ],
            'rates' => $rates,
        ]);
    }

    /**
     * Search areas / locations via Biteship Locations API.
     */
    public function areas(Request $request): JsonResponse
    {
        $query = (string) $request->query('query', $request->query('input', ''));
        $areas = BiteshipService::searchAreas($query);

        return response()->json([
            'success' => true,
            'data' => $areas,
        ]);
    }

    /**
     * Search places / addresses / landmarks for interactive map picker.
     */
    public function searchPlaces(Request $request): JsonResponse
    {
        $query = trim((string) $request->query('q', ''));
        if (strlen($query) < 2) {
            return response()->json(['success' => true, 'data' => []]);
        }

        $city = trim((string) $request->query('city', ''));
        $district = trim((string) $request->query('district', ''));
        $province = trim((string) $request->query('province', ''));

        $cacheKey = 'place_search_' . md5(strtolower("{$query}|{$city}|{$province}"));
        $results = \Illuminate\Support\Facades\Cache::remember($cacheKey, 3600, function () use ($query, $city, $district, $province) {
            $places = [];

            // 1. Try Photon Geocoding API (Fast OSM search with typo tolerance)
            try {
                $searchTerms = $query;
                if (! empty($city) && ! str_contains(strtolower($query), strtolower($city))) {
                    $searchTerms .= ' ' . $city;
                }

                $url = 'https://photon.komoot.io/api/?' . http_build_query([
                    'q' => $searchTerms,
                    'limit' => 8,
                    'lang' => 'id',
                ]);

                $response = \Illuminate\Support\Facades\Http::timeout(4)
                    ->withHeaders(['User-Agent' => 'SanubariRoastery/1.0 (info@sanubariroastery.co.id)'])
                    ->get($url);

                if ($response->successful()) {
                    $features = $response->json('features') ?? [];
                    foreach ($features as $f) {
                        $props = $f['properties'] ?? [];
                        $coords = $f['geometry']['coordinates'] ?? [];
                        if (count($coords) < 2) continue;

                        $title = $props['name'] ?? $props['street'] ?? '';
                        if (empty($title)) continue;

                        $subParts = array_filter([
                            $props['street'] ?? null,
                            $props['district'] ?? $props['suburb'] ?? null,
                            $props['city'] ?? $props['county'] ?? null,
                            $props['state'] ?? null,
                        ], fn ($v) => ! empty($v) && $v !== $title);

                        $places[] = [
                            'title' => $title,
                            'subtitle' => implode(', ', array_unique($subParts)),
                            'latitude' => round((float) $coords[1], 6),
                            'longitude' => round((float) $coords[0], 6),
                        ];
                    }
                }
            } catch (\Throwable $e) {
                Log::warning('Photon geocode error: ' . $e->getMessage());
            }

            // 2. If Photon returned few or no results, fallback to Nominatim via backend
            if (count($places) < 2) {
                try {
                    $queryArea = $query;
                    if (! empty($district)) $queryArea .= ', ' . $district;
                    if (! empty($city)) $queryArea .= ', ' . $city;

                    $nomUrl = 'https://nominatim.openstreetmap.org/search?' . http_build_query([
                        'format' => 'json',
                        'q' => $queryArea,
                        'limit' => 5,
                        'countrycodes' => 'id',
                    ]);

                    $nomRes = \Illuminate\Support\Facades\Http::timeout(4)
                        ->withHeaders([
                            'User-Agent' => 'SanubariRoastery/1.0 (info@sanubariroastery.co.id)',
                            'Accept-Language' => 'id,en',
                        ])
                        ->get($nomUrl);

                    if ($nomRes->successful()) {
                        $items = $nomRes->json() ?? [];
                        foreach ($items as $item) {
                            $parts = explode(',', $item['display_name']);
                            $title = trim($parts[0] ?? $query);
                            $subtitle = trim(implode(',', array_slice($parts, 1, 3)));

                            $places[] = [
                                'title' => $title,
                                'subtitle' => $subtitle,
                                'latitude' => round((float) $item['lat'], 6),
                                'longitude' => round((float) $item['lon'], 6),
                            ];
                        }
                    }
                } catch (\Throwable $e) {
                    Log::warning('Nominatim geocode error: ' . $e->getMessage());
                }
            }

            return array_slice($places, 0, 6);
        });

        return response()->json([
            'success' => true,
            'data' => $results,
        ]);
    }

    /**
     * Reverse geocode coordinates to street / address name.
     */
    public function reverseGeocode(Request $request): JsonResponse
    {
        $lat = (float) $request->query('lat');
        $lng = (float) $request->query('lng');

        if (empty($lat) || empty($lng)) {
            return response()->json(['success' => false, 'message' => 'Latitude & Longitude required'], 422);
        }

        $cacheKey = 'rev_geo_' . round($lat, 4) . '_' . round($lng, 4);
        $data = \Illuminate\Support\Facades\Cache::remember($cacheKey, 86400, function () use ($lat, $lng) {
            try {
                $url = 'https://nominatim.openstreetmap.org/reverse?' . http_build_query([
                    'format' => 'json',
                    'lat' => $lat,
                    'lon' => $lng,
                    'zoom' => 18,
                    'addressdetails' => 1,
                ]);

                $res = \Illuminate\Support\Facades\Http::timeout(5)
                    ->withHeaders([
                        'User-Agent' => 'SanubariRoastery/1.0 (info@sanubariroastery.co.id)',
                        'Accept-Language' => 'id,en',
                    ])
                    ->get($url);

                if ($res->successful()) {
                    $json = $res->json();
                    $addr = $json['address'] ?? [];
                    $road = $addr['road'] ?? $addr['pedestrian'] ?? $addr['street'] ?? '';
                    $suburb = $addr['suburb'] ?? $addr['neighbourhood'] ?? $addr['village'] ?? '';
                    $city = $addr['city'] ?? $addr['town'] ?? $addr['county'] ?? '';

                    $short = implode(', ', array_filter([$road, $suburb, $city]));
                    if (empty($short)) {
                        $short = $json['display_name'] ?? '';
                    }

                    return [
                        'display_name' => $json['display_name'] ?? '',
                        'short_address' => $short,
                        'road' => $road,
                        'suburb' => $suburb,
                        'city' => $city,
                    ];
                }
            } catch (\Throwable $e) {
                Log::warning('Reverse geocode error: ' . $e->getMessage());
            }

            return null;
        });

        return response()->json([
            'success' => true,
            'data' => $data,
        ]);
    }

    /**
     * Handle incoming webhook notifications from Biteship.
     */
    public function webhook(Request $request): JsonResponse
    {
        $secret = BiteshipService::getWebhookSecret();
        if (! empty($secret)) {
            $signature = $request->header('X-Biteship-Signature')
                ?? $request->header('Biteship-Signature')
                ?? $request->header('Signature')
                ?? $request->header('X-Signature');

            if ($signature) {
                $computed = hash_hmac('sha256', $request->getContent(), $secret);
                if (! hash_equals($computed, $signature) && ! hash_equals($secret, $signature)) {
                    Log::warning('Biteship webhook signature mismatch', [
                        'received' => $signature,
                    ]);

                    return response()->json([
                        'success' => false,
                        'message' => 'Invalid signature.',
                    ], 401);
                }
            }
        }

        $payload = $request->all();
        $result = BiteshipService::handleWebhook($payload);

        return response()->json($result);
    }

    /**
     * Live Tracking / Cek Resi.
     */
    public function track(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'waybill' => 'required|string|max:100',
            'courier' => 'required|string|max:50',
            'last_phone' => 'nullable|string|max:30',
        ]);

        $result = ShippingService::trackWaybill(
            $validated['waybill'],
            $validated['courier'],
            $validated['last_phone'] ?? null
        );

        return response()->json($result);
    }

    /**
     * Request Courier Pickup for an order.
     */
    public function requestPickup(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'order_id' => 'required|integer|exists:orders,id',
            'pickup_date' => 'nullable|date',
            'pickup_time' => 'nullable|string|max:50',
            'vehicle' => 'nullable|string|in:Motor,Mobil,Truk',
            'notes' => 'nullable|string|max:300',
        ]);

        $order = Order::findOrFail($validated['order_id']);
        $result = ShippingService::requestCourierPickup($order, $validated);

        return response()->json($result);
    }
}
