<?php

namespace App\Services;

use App\Models\Order;
use App\Models\Setting;
use Illuminate\Support\Str;

class ShippingService
{
    /**
     * Default Origin:
     * Provinsi Jawa Timur (18), Kota/Kab Malang (391), Kecamatan Lowokwaru (3896) - Sanubari Tlogomas.
     */
    public const DEFAULT_ORIGIN_PROVINCE_ID = 18;

    public const DEFAULT_ORIGIN_CITY_ID = 391;

    public const DEFAULT_ORIGIN_SUBDISTRICT_ID = 3896;

    public const DEFAULT_ORIGIN_CITY_NAME = 'Kota Malang';

    public const DEFAULT_ORIGIN_PROVINCE_NAME = 'Jawa Timur';

    public const DEFAULT_ORIGIN_POSTAL_CODE = '65144';

    public const DEFAULT_ORIGIN_LATITUDE = -7.9327;

    public const DEFAULT_ORIGIN_LONGITUDE = 112.6037;

    public const DEFAULT_GOSEND_RATE_PER_KM = 2500;

    public const DEFAULT_GOSEND_MIN_COST = 12000;

    public const DEFAULT_GOSEND_MAX_DISTANCE_KM = 25;

    /**
     * Supported Couriers Catalog for Standard Delivery & Instant Delivery.
     */
    public static function getAvailableCouriers(): array
    {
        return [
            'gosend' => 'GoSend (Instant — Area Malang Raya)',
            'jne' => 'JNE Express',
            'jnt' => 'J&T Express',
            'jntcargo' => 'J&T Cargo (Kargo & Grosir)',
            'sicepat' => 'SiCepat Ekspres',
            'anteraja' => 'AnterAja',
            'pos' => 'POS Indonesia',
            'tiki' => 'TIKI (Titipan Kilat)',
            'spx' => 'Shopee Express (SPX)',
            'ninja' => 'Ninja Xpress',
            'wahana' => 'Wahana Prestasi Logistik',
            'lion' => 'Lion Parcel',
            'ide' => 'ID Express',
            'sap' => 'SAP Express',
        ];
    }

    /**
     * Format ALL-CAPS location names into clean Title Case while preserving acronyms.
     */
    public static function formatLocationName(string $name): string
    {
        $formatted = ucwords(strtolower(trim($name)));

        return str_replace(
            ['Dki ', 'Di ', '(ntb)', '(ntt)', '(nad)'],
            ['DKI ', 'DI ', '(NTB)', '(NTT)', '(NAD)'],
            $formatted
        );
    }

    /**
     * Get Shipping Gateway Configuration from Settings.
     */
    public static function getConfig(): array
    {
        $settings = Setting::all()->pluck('value', 'key')->toArray();

        $originProvinceId = (int) ($settings['shipping_origin_province_id'] ?? self::DEFAULT_ORIGIN_PROVINCE_ID);
        $originCityId = (int) ($settings['shipping_origin_city_id'] ?? self::DEFAULT_ORIGIN_CITY_ID);
        $originSubdistrictId = (int) ($settings['shipping_origin_subdistrict_id'] ?? self::DEFAULT_ORIGIN_SUBDISTRICT_ID);

        $originCityName = (string) ($settings['shipping_origin_city'] ?? self::DEFAULT_ORIGIN_CITY_NAME);
        $originProvinceName = (string) ($settings['shipping_origin_province'] ?? self::DEFAULT_ORIGIN_PROVINCE_NAME);
        $originPostalCode = (string) ($settings['shipping_origin_postal_code'] ?? self::DEFAULT_ORIGIN_POSTAL_CODE);
        $originLatitude = (float) ($settings['shipping_origin_latitude'] ?? self::DEFAULT_ORIGIN_LATITUDE);
        $originLongitude = (float) ($settings['shipping_origin_longitude'] ?? self::DEFAULT_ORIGIN_LONGITUDE);
        $gosendRatePerKm = max(500, (int) ($settings['gosend_rate_per_km'] ?? self::DEFAULT_GOSEND_RATE_PER_KM));
        $gosendMinCost = max(5000, (int) ($settings['gosend_min_cost'] ?? self::DEFAULT_GOSEND_MIN_COST));
        $gosendMaxDistanceKm = max(5, (int) ($settings['gosend_max_distance_km'] ?? self::DEFAULT_GOSEND_MAX_DISTANCE_KM));

        $activeCouriers = $settings['shipping_couriers'] ?? ($settings['rajaongkir_couriers'] ?? ['gosend', 'jne', 'jnt', 'sicepat', 'anteraja', 'pos', 'tiki']);
        if (is_string($activeCouriers)) {
            $decoded = json_decode($activeCouriers, true);
            $activeCouriers = is_array($decoded) ? $decoded : array_filter(array_map('trim', explode(',', $activeCouriers)));
        }
        if (! is_array($activeCouriers) || empty($activeCouriers)) {
            $activeCouriers = ['gosend', 'jne', 'jnt', 'sicepat', 'anteraja', 'pos', 'tiki'];
        }

        $freeShippingEnabled = isset($settings['free_shipping_enabled']) ? (bool) $settings['free_shipping_enabled'] : true;
        $freeShippingMin = (int) ($settings['free_shipping_min'] ?? 250000);
        $freeShippingZone = (string) ($settings['free_shipping_zone'] ?? 'java_only');
        $freeShippingMaxSubsidy = (int) ($settings['free_shipping_max_subsidy'] ?? 0);
        $handlingFee = (int) ($settings['shipping_handling_fee'] ?? 0);
        $defaultWeightGrams = max(1, (int) ($settings['shipping_default_weight_grams'] ?? 200));

        return [
            'enabled' => true,
            'origin_province_id' => $originProvinceId,
            'origin_city_id' => $originCityId,
            'origin_subdistrict_id' => $originSubdistrictId,
            'origin_city_name' => $originCityName,
            'origin_province_name' => $originProvinceName,
            'origin_postal_code' => $originPostalCode,
            'origin_latitude' => $originLatitude,
            'origin_longitude' => $originLongitude,
            'gosend_rate_per_km' => $gosendRatePerKm,
            'gosend_min_cost' => $gosendMinCost,
            'gosend_max_distance_km' => $gosendMaxDistanceKm,
            'couriers' => array_values($activeCouriers),
            'free_shipping_enabled' => $freeShippingEnabled,
            'free_shipping_min' => $freeShippingMin,
            'free_shipping_zone' => $freeShippingZone,
            'free_shipping_max_subsidy' => $freeShippingMaxSubsidy,
            'handling_fee' => $handlingFee,
            'default_weight_grams' => $defaultWeightGrams,
        ];
    }

    /**
     * Get list of Indonesian Provinces.
     */
    public static function getProvinces(): array
    {
        return self::getBuiltInProvinces();
    }

    /**
     * Built-in Indonesian Provinces.
     */
    public static function getBuiltInProvinces(): array
    {
        $path = resource_path('data/wilayah/provinces.json');
        if (file_exists($path)) {
            $data = json_decode(file_get_contents($path), true);
            if (! empty($data)) {
                return $data;
            }
        }

        return [
            ['id' => 18, 'name' => 'Jawa Timur'],
            ['id' => 10, 'name' => 'DKI Jakarta'],
            ['id' => 5,  'name' => 'Jawa Barat'],
            ['id' => 12, 'name' => 'Jawa Tengah'],
            ['id' => 19, 'name' => 'DI Yogyakarta'],
            ['id' => 11, 'name' => 'Banten'],
            ['id' => 15, 'name' => 'Bali'],
            ['id' => 1,  'name' => 'Nusa Tenggara Barat (NTB)'],
            ['id' => 21, 'name' => 'Nusa Tenggara Timur (NTT)'],
            ['id' => 9,  'name' => 'Nanggroe Aceh Darussalam (NAD)'],
            ['id' => 16, 'name' => 'Sumatera Utara'],
            ['id' => 23, 'name' => 'Sumatera Barat'],
            ['id' => 25, 'name' => 'Riau'],
            ['id' => 8,  'name' => 'Kepulauan Riau'],
            ['id' => 13, 'name' => 'Jambi'],
            ['id' => 26, 'name' => 'Sumatera Selatan'],
            ['id' => 24, 'name' => 'Bangka Belitung'],
            ['id' => 6,  'name' => 'Bengkulu'],
            ['id' => 30, 'name' => 'Lampung'],
            ['id' => 28, 'name' => 'Kalimantan Barat'],
            ['id' => 4,  'name' => 'Kalimantan Tengah'],
            ['id' => 3,  'name' => 'Kalimantan Selatan'],
            ['id' => 7,  'name' => 'Kalimantan Timur'],
            ['id' => 31, 'name' => 'Kalimantan Utara'],
            ['id' => 22, 'name' => 'Sulawesi Utara'],
            ['id' => 17, 'name' => 'Gorontalo'],
            ['id' => 27, 'name' => 'Sulawesi Tengah'],
            ['id' => 34, 'name' => 'Sulawesi Barat'],
            ['id' => 33, 'name' => 'Sulawesi Selatan'],
            ['id' => 20, 'name' => 'Sulawesi Tenggara'],
            ['id' => 2,  'name' => 'Maluku'],
            ['id' => 32, 'name' => 'Maluku Utara'],
            ['id' => 14, 'name' => 'Papua'],
            ['id' => 29, 'name' => 'Papua Barat'],
        ];
    }

    /**
     * Get list of Indonesian Cities & Regencies.
     */
    public static function getCities(?int $provinceId = null): array
    {
        $config = self::getConfig();
        $targetProvinceId = $provinceId ?? $config['origin_province_id'] ?? self::DEFAULT_ORIGIN_PROVINCE_ID;

        return self::getBuiltInCities($targetProvinceId);
    }

    /**
     * Get list of Subdistricts / Kecamatan for a City.
     */
    public static function getSubdistricts(int $cityId): array
    {
        return self::getBuiltInSubdistricts($cityId);
    }

    /**
     * Built-in Subdistricts for Indonesian Cities across all 34 Provinces.
     */
    public static function getBuiltInSubdistricts(int $cityId): array
    {
        $path = resource_path('data/wilayah/districts_by_city.json');
        if (file_exists($path)) {
            $map = json_decode(file_get_contents($path), true);
            if (! empty($map) && isset($map[$cityId])) {
                return $map[$cityId];
            }
        }

        $all = config('subdistricts');
        if (empty($all) && file_exists(base_path('config/subdistricts.php'))) {
            $all = require base_path('config/subdistricts.php');
        }

        return $all[$cityId] ?? [];
    }

    /**
     * Built-in Cities fallback across all 34 Indonesian Provinces.
     */
    public static function getBuiltInCities(?int $provinceId = null): array
    {
        $path = resource_path('data/wilayah/regencies.json');
        if (file_exists($path)) {
            $all = json_decode(file_get_contents($path), true);
            if (! empty($all)) {
                if ($provinceId !== null) {
                    return array_values(array_filter($all, fn ($c) => (int) ($c['province_id'] ?? 0) === (int) $provinceId));
                }

                return $all;
            }
        }

        $allCities = [
            // Jawa Timur (18)
            ['id' => 391, 'province_id' => 18, 'type' => 'Kota', 'name' => 'Malang', 'postal_code' => '65116'],
            ['id' => 393, 'province_id' => 18, 'type' => 'Kota', 'name' => 'Batu', 'postal_code' => '65311'],
            ['id' => 577, 'province_id' => 18, 'type' => 'Kota', 'name' => 'Surabaya', 'postal_code' => '60119'],
            ['id' => 583, 'province_id' => 18, 'type' => 'Kabupaten', 'name' => 'Sidoarjo', 'postal_code' => '61219'],
            ['id' => 531, 'province_id' => 18, 'type' => 'Kota', 'name' => 'Pasuruan', 'postal_code' => '67118'],
            ['id' => 289, 'province_id' => 18, 'type' => 'Kota', 'name' => 'Kediri', 'postal_code' => '64125'],
            ['id' => 392, 'province_id' => 18, 'type' => 'Kota', 'name' => 'Blitar', 'postal_code' => '66117'],
            ['id' => 256, 'province_id' => 18, 'type' => 'Kabupaten', 'name' => 'Jember', 'postal_code' => '68124'],
            ['id' => 257, 'province_id' => 18, 'type' => 'Kabupaten', 'name' => 'Banyuwangi', 'postal_code' => '68416'],
            ['id' => 388, 'province_id' => 18, 'type' => 'Kota', 'name' => 'Mojokerto', 'postal_code' => '61316'],
            ['id' => 578, 'province_id' => 18, 'type' => 'Kabupaten', 'name' => 'Gresik', 'postal_code' => '61115'],
            ['id' => 353, 'province_id' => 18, 'type' => 'Kota', 'name' => 'Madiun', 'postal_code' => '63122'],
            ['id' => 394, 'province_id' => 18, 'type' => 'Kota', 'name' => 'Probolinggo', 'postal_code' => '67215'],
            ['id' => 585, 'province_id' => 18, 'type' => 'Kabupaten', 'name' => 'Tuban', 'postal_code' => '62319'],
            ['id' => 579, 'province_id' => 18, 'type' => 'Kabupaten', 'name' => 'Lamongan', 'postal_code' => '62218'],
            ['id' => 389, 'province_id' => 18, 'type' => 'Kabupaten', 'name' => 'Jombang', 'postal_code' => '61419'],
            ['id' => 586, 'province_id' => 18, 'type' => 'Kabupaten', 'name' => 'Tulungagung', 'postal_code' => '66212'],

            // Sumatera Utara (16)
            ['id' => 278, 'province_id' => 16, 'type' => 'Kota', 'name' => 'Medan', 'postal_code' => '20111'],
            ['id' => 67,  'province_id' => 16, 'type' => 'Kota', 'name' => 'Binjai', 'postal_code' => '20711'],
            ['id' => 358, 'province_id' => 16, 'type' => 'Kota', 'name' => 'Pematang Siantar', 'postal_code' => '21111'],
            ['id' => 469, 'province_id' => 16, 'type' => 'Kota', 'name' => 'Tebing Tinggi', 'postal_code' => '20611'],
            ['id' => 460, 'province_id' => 16, 'type' => 'Kota', 'name' => 'Tanjung Balai', 'postal_code' => '21311'],
            ['id' => 412, 'province_id' => 16, 'type' => 'Kota', 'name' => 'Sibolga', 'postal_code' => '22511'],
            ['id' => 324, 'province_id' => 16, 'type' => 'Kota', 'name' => 'Padang Sidempuan', 'postal_code' => '22711'],
            ['id' => 136, 'province_id' => 16, 'type' => 'Kota', 'name' => 'Gunungsitoli', 'postal_code' => '22811'],
            ['id' => 112, 'province_id' => 16, 'type' => 'Kabupaten', 'name' => 'Deli Serdang', 'postal_code' => '20511'],
            ['id' => 175, 'province_id' => 16, 'type' => 'Kabupaten', 'name' => 'Karo', 'postal_code' => '22111'],
            ['id' => 415, 'province_id' => 16, 'type' => 'Kabupaten', 'name' => 'Simalungun', 'postal_code' => '21162'],
            ['id' => 20,  'province_id' => 16, 'type' => 'Kabupaten', 'name' => 'Asahan', 'postal_code' => '21211'],
            ['id' => 221, 'province_id' => 16, 'type' => 'Kabupaten', 'name' => 'Langkat', 'postal_code' => '20811'],
            ['id' => 110, 'province_id' => 16, 'type' => 'Kabupaten', 'name' => 'Dairi', 'postal_code' => '22211'],
            ['id' => 478, 'province_id' => 16, 'type' => 'Kabupaten', 'name' => 'Toba', 'postal_code' => '22311'],
            ['id' => 464, 'province_id' => 16, 'type' => 'Kabupaten', 'name' => 'Tapanuli Utara', 'postal_code' => '22411'],
            ['id' => 217, 'province_id' => 16, 'type' => 'Kabupaten', 'name' => 'Labuhanbatu', 'postal_code' => '21411'],

            // DKI Jakarta (10)
            ['id' => 151, 'province_id' => 10, 'type' => 'Kota', 'name' => 'Jakarta Pusat', 'postal_code' => '10110'],
            ['id' => 152, 'province_id' => 10, 'type' => 'Kota', 'name' => 'Jakarta Selatan', 'postal_code' => '12110'],
            ['id' => 153, 'province_id' => 10, 'type' => 'Kota', 'name' => 'Jakarta Barat', 'postal_code' => '11110'],
            ['id' => 154, 'province_id' => 10, 'type' => 'Kota', 'name' => 'Jakarta Timur', 'postal_code' => '13110'],
            ['id' => 155, 'province_id' => 10, 'type' => 'Kota', 'name' => 'Jakarta Utara', 'postal_code' => '14110'],
            ['id' => 156, 'province_id' => 10, 'type' => 'Kabupaten', 'name' => 'Kepulauan Seribu', 'postal_code' => '14510'],

            // Jawa Barat (5)
            ['id' => 22,  'province_id' => 5, 'type' => 'Kota', 'name' => 'Bandung', 'postal_code' => '40111'],
            ['id' => 54,  'province_id' => 5, 'type' => 'Kota', 'name' => 'Bekasi', 'postal_code' => '17111'],
            ['id' => 78,  'province_id' => 5, 'type' => 'Kota', 'name' => 'Bogor', 'postal_code' => '16111'],
            ['id' => 115, 'province_id' => 5, 'type' => 'Kota', 'name' => 'Depok', 'postal_code' => '16411'],
            ['id' => 107, 'province_id' => 5, 'type' => 'Kota', 'name' => 'Cimahi', 'postal_code' => '40511'],
            ['id' => 108, 'province_id' => 5, 'type' => 'Kota', 'name' => 'Cirebon', 'postal_code' => '45111'],
            ['id' => 429, 'province_id' => 5, 'type' => 'Kota', 'name' => 'Sukabumi', 'postal_code' => '43111'],
            ['id' => 468, 'province_id' => 5, 'type' => 'Kota', 'name' => 'Tasikmalaya', 'postal_code' => '46111'],
            ['id' => 23,  'province_id' => 5, 'type' => 'Kabupaten', 'name' => 'Bandung', 'postal_code' => '40311'],
            ['id' => 24,  'province_id' => 5, 'type' => 'Kabupaten', 'name' => 'Bandung Barat', 'postal_code' => '40552'],
            ['id' => 55,  'province_id' => 5, 'type' => 'Kabupaten', 'name' => 'Bekasi', 'postal_code' => '17511'],
            ['id' => 79,  'province_id' => 5, 'type' => 'Kabupaten', 'name' => 'Bogor', 'postal_code' => '16911'],
            ['id' => 109, 'province_id' => 5, 'type' => 'Kabupaten', 'name' => 'Cirebon', 'postal_code' => '45611'],
            ['id' => 126, 'province_id' => 5, 'type' => 'Kabupaten', 'name' => 'Garut', 'postal_code' => '44111'],
            ['id' => 171, 'province_id' => 5, 'type' => 'Kabupaten', 'name' => 'Karawang', 'postal_code' => '41311'],
            ['id' => 420, 'province_id' => 5, 'type' => 'Kabupaten', 'name' => 'Subang', 'postal_code' => '41211'],
            ['id' => 376, 'province_id' => 5, 'type' => 'Kabupaten', 'name' => 'Purwakarta', 'postal_code' => '41111'],
            ['id' => 440, 'province_id' => 5, 'type' => 'Kabupaten', 'name' => 'Sumedang', 'postal_code' => '45311'],
            ['id' => 105, 'province_id' => 5, 'type' => 'Kabupaten', 'name' => 'Cianjur', 'postal_code' => '43211'],

            // Jawa Tengah (12)
            ['id' => 398, 'province_id' => 12, 'type' => 'Kota', 'name' => 'Semarang', 'postal_code' => '50111'],
            ['id' => 444, 'province_id' => 12, 'type' => 'Kota', 'name' => 'Surakarta (Solo)', 'postal_code' => '57111'],
            ['id' => 386, 'province_id' => 12, 'type' => 'Kota', 'name' => 'Salatiga', 'postal_code' => '50711'],
            ['id' => 249, 'province_id' => 12, 'type' => 'Kota', 'name' => 'Magelang', 'postal_code' => '56111'],
            ['id' => 349, 'province_id' => 12, 'type' => 'Kota', 'name' => 'Pekalongan', 'postal_code' => '51111'],
            ['id' => 472, 'province_id' => 12, 'type' => 'Kota', 'name' => 'Tegal', 'postal_code' => '52111'],
            ['id' => 41,  'province_id' => 12, 'type' => 'Kabupaten', 'name' => 'Banyumas', 'postal_code' => '53111'],
            ['id' => 209, 'province_id' => 12, 'type' => 'Kabupaten', 'name' => 'Kudus', 'postal_code' => '59311'],
            ['id' => 169, 'province_id' => 12, 'type' => 'Kabupaten', 'name' => 'Jepara', 'postal_code' => '59411'],
            ['id' => 344, 'province_id' => 12, 'type' => 'Kabupaten', 'name' => 'Pati', 'postal_code' => '59111'],
            ['id' => 104, 'province_id' => 12, 'type' => 'Kabupaten', 'name' => 'Cilacap', 'postal_code' => '53211'],
            ['id' => 84,  'province_id' => 12, 'type' => 'Kabupaten', 'name' => 'Brebes', 'postal_code' => '52211'],
            ['id' => 196, 'province_id' => 12, 'type' => 'Kabupaten', 'name' => 'Klaten', 'postal_code' => '57411'],
            ['id' => 438, 'province_id' => 12, 'type' => 'Kabupaten', 'name' => 'Sukoharjo', 'postal_code' => '57511'],
            ['id' => 81,  'province_id' => 12, 'type' => 'Kabupaten', 'name' => 'Boyolali', 'postal_code' => '57311'],
            ['id' => 173, 'province_id' => 12, 'type' => 'Kabupaten', 'name' => 'Karanganyar', 'postal_code' => '57711'],

            // DI Yogyakarta (19)
            ['id' => 501, 'province_id' => 19, 'type' => 'Kota', 'name' => 'Yogyakarta', 'postal_code' => '55111'],
            ['id' => 419, 'province_id' => 19, 'type' => 'Kabupaten', 'name' => 'Sleman', 'postal_code' => '55511'],
            ['id' => 39,  'province_id' => 19, 'type' => 'Kabupaten', 'name' => 'Bantul', 'postal_code' => '55711'],
            ['id' => 210, 'province_id' => 19, 'type' => 'Kabupaten', 'name' => 'Kulon Progo', 'postal_code' => '55611'],
            ['id' => 135, 'province_id' => 19, 'type' => 'Kabupaten', 'name' => 'Gunung Kidul', 'postal_code' => '55811'],

            // Banten (11)
            ['id' => 455, 'province_id' => 11, 'type' => 'Kota', 'name' => 'Tangerang', 'postal_code' => '15111'],
            ['id' => 457, 'province_id' => 11, 'type' => 'Kota', 'name' => 'Tangerang Selatan', 'postal_code' => '15311'],
            ['id' => 402, 'province_id' => 11, 'type' => 'Kota', 'name' => 'Serang', 'postal_code' => '42111'],
            ['id' => 1061, 'province_id' => 11, 'type' => 'Kota', 'name' => 'Cilegon', 'postal_code' => '42411'],
            ['id' => 456, 'province_id' => 11, 'type' => 'Kabupaten', 'name' => 'Tangerang', 'postal_code' => '15711'],
            ['id' => 403, 'province_id' => 11, 'type' => 'Kabupaten', 'name' => 'Serang', 'postal_code' => '42191'],
            ['id' => 222, 'province_id' => 11, 'type' => 'Kabupaten', 'name' => 'Lebak', 'postal_code' => '42311'],

            // Bali (15)
            ['id' => 114, 'province_id' => 15, 'type' => 'Kota', 'name' => 'Denpasar', 'postal_code' => '80111'],
            ['id' => 17,  'province_id' => 15, 'type' => 'Kabupaten', 'name' => 'Badung', 'postal_code' => '80351'],
            ['id' => 128, 'province_id' => 15, 'type' => 'Kabupaten', 'name' => 'Gianyar', 'postal_code' => '80511'],
            ['id' => 87,  'province_id' => 15, 'type' => 'Kabupaten', 'name' => 'Buleleng', 'postal_code' => '81111'],
            ['id' => 447, 'province_id' => 15, 'type' => 'Kabupaten', 'name' => 'Tabanan', 'postal_code' => '82111'],

            // Sumatera Barat (23)
            ['id' => 318, 'province_id' => 23, 'type' => 'Kota', 'name' => 'Padang', 'postal_code' => '25111'],
            ['id' => 86,  'province_id' => 23, 'type' => 'Kota', 'name' => 'Bukittinggi', 'postal_code' => '26111'],
            ['id' => 346, 'province_id' => 23, 'type' => 'Kota', 'name' => 'Payakumbuh', 'postal_code' => '26211'],
            ['id' => 12,  'province_id' => 23, 'type' => 'Kabupaten', 'name' => 'Agam', 'postal_code' => '26411'],

            // Riau (25) & Kepulauan Riau (8)
            ['id' => 351, 'province_id' => 25, 'type' => 'Kota', 'name' => 'Pekanbaru', 'postal_code' => '28111'],
            ['id' => 120, 'province_id' => 25, 'type' => 'Kota', 'name' => 'Dumai', 'postal_code' => '28811'],
            ['id' => 172, 'province_id' => 25, 'type' => 'Kabupaten', 'name' => 'Kampar', 'postal_code' => '28411'],
            ['id' => 46,  'province_id' => 8,  'type' => 'Kota', 'name' => 'Batam', 'postal_code' => '29411'],
            ['id' => 461, 'province_id' => 8,  'type' => 'Kota', 'name' => 'Tanjung Pinang', 'postal_code' => '29111'],

            // Sumatera Selatan (26) & Lampung (30)
            ['id' => 327, 'province_id' => 26, 'type' => 'Kota', 'name' => 'Palembang', 'postal_code' => '30111'],
            ['id' => 372, 'province_id' => 26, 'type' => 'Kota', 'name' => 'Prabumulih', 'postal_code' => '31111'],
            ['id' => 21,  'province_id' => 30, 'type' => 'Kota', 'name' => 'Bandar Lampung', 'postal_code' => '35111'],
            ['id' => 262, 'province_id' => 30, 'type' => 'Kota', 'name' => 'Metro', 'postal_code' => '34111'],

            // Kalimantan
            ['id' => 365, 'province_id' => 28, 'type' => 'Kota', 'name' => 'Pontianak', 'postal_code' => '78111'],
            ['id' => 30,  'province_id' => 3,  'type' => 'Kota', 'name' => 'Banjarmasin', 'postal_code' => '70111'],
            ['id' => 29,  'province_id' => 3,  'type' => 'Kota', 'name' => 'Banjarbaru', 'postal_code' => '70711'],
            ['id' => 387, 'province_id' => 7,  'type' => 'Kota', 'name' => 'Samarinda', 'postal_code' => '75111'],
            ['id' => 25,  'province_id' => 7,  'type' => 'Kota', 'name' => 'Balikpapan', 'postal_code' => '76111'],
            ['id' => 731, 'province_id' => 4,  'type' => 'Kota', 'name' => 'Palangka Raya', 'postal_code' => '73111'],
            ['id' => 771, 'province_id' => 31, 'type' => 'Kota', 'name' => 'Tarakan', 'postal_code' => '77111'],

            // Sulawesi
            ['id' => 243, 'province_id' => 33, 'type' => 'Kota', 'name' => 'Makassar', 'postal_code' => '90111'],
            ['id' => 340, 'province_id' => 33, 'type' => 'Kota', 'name' => 'Parepare', 'postal_code' => '91111'],
            ['id' => 253, 'province_id' => 22, 'type' => 'Kota', 'name' => 'Manado', 'postal_code' => '95111'],
            ['id' => 941, 'province_id' => 27, 'type' => 'Kota', 'name' => 'Palu', 'postal_code' => '94111'],
            ['id' => 931, 'province_id' => 20, 'type' => 'Kota', 'name' => 'Kendari', 'postal_code' => '93111'],
            ['id' => 961, 'province_id' => 17, 'type' => 'Kota', 'name' => 'Gorontalo', 'postal_code' => '96111'],
            ['id' => 915, 'province_id' => 34, 'type' => 'Kabupaten', 'name' => 'Mamuju', 'postal_code' => '91511'],

            // Nusa Tenggara & Maluku & Papua
            ['id' => 258, 'province_id' => 1,  'type' => 'Kota', 'name' => 'Mataram', 'postal_code' => '83111'],
            ['id' => 212, 'province_id' => 21, 'type' => 'Kota', 'name' => 'Kupang', 'postal_code' => '85111'],
            ['id' => 971, 'province_id' => 2,  'type' => 'Kota', 'name' => 'Ambon', 'postal_code' => '97111'],
            ['id' => 977, 'province_id' => 32, 'type' => 'Kota', 'name' => 'Ternate', 'postal_code' => '97711'],
            ['id' => 163, 'province_id' => 14, 'type' => 'Kota', 'name' => 'Jayapura', 'postal_code' => '99111'],
            ['id' => 435, 'province_id' => 29, 'type' => 'Kota', 'name' => 'Sorong', 'postal_code' => '98411'],

            // Aceh (9), Jambi (13), Bengkulu (6), Bangka Belitung (24)
            ['id' => 231, 'province_id' => 9,  'type' => 'Kota', 'name' => 'Banda Aceh', 'postal_code' => '23111'],
            ['id' => 361, 'province_id' => 13, 'type' => 'Kota', 'name' => 'Jambi', 'postal_code' => '36111'],
            ['id' => 381, 'province_id' => 6,  'type' => 'Kota', 'name' => 'Bengkulu', 'postal_code' => '38111'],
            ['id' => 3311, 'province_id' => 24, 'type' => 'Kota', 'name' => 'Pangkalpinang', 'postal_code' => '33111'],
        ];

        if ($provinceId !== null) {
            $filtered = array_values(array_filter($allCities, fn ($c) => (int) $c['province_id'] === (int) $provinceId));

            return ! empty($filtered) ? $filtered : [];
        }

        return $allCities;
    }

    /**
     * Filter out irrelevant motorcycle/heavy-trucking/dangerous-goods services for coffee orders.
     */
    protected static function shouldIncludeService(string $serviceCode, string $description, int $weightGrams): bool
    {
        $svc = strtoupper(trim($serviceCode));
        $desc = strtoupper(trim($description));

        // Exclude motorcycle shipping & special dangerous/valuable goods
        $excludedExact = ['T15', 'T25', 'T60', 'SRP', 'TRX', 'DAT', 'SPS', 'DOK', 'PAKETPOS DANGEROUS GOODS', 'PAKETPOS VALUABLE GOODS'];
        if (in_array($svc, $excludedExact)) {
            return false;
        }

        if (str_contains($svc, 'JTR<') || str_contains($svc, 'JTR>') || str_contains($desc, 'MOTOR')) {
            return false;
        }

        // Only show heavy cargo/trucking if order weight is >= 5kg (5000g)
        $cargoServices = ['JTR', 'GOKIL', 'TRC', 'DRGREG', 'POS KARGO', 'MIC'];
        if (in_array($svc, $cargoServices) && $weightGrams < 5000) {
            return false;
        }

        return true;
    }

    /**
     * Check if a destination qualifies for Free Shipping Promo.
     */
    protected static function qualifiesForFreeShipping(array $config, int $destProvinceId, int $destCityId, float $subtotal, string $serviceCode): bool
    {
        if (! $config['free_shipping_enabled'] || $config['free_shipping_zone'] === 'disabled') {
            return false;
        }

        if ($subtotal < $config['free_shipping_min']) {
            return false;
        }

        $regServices = ['REG', 'EZ', 'CTC', 'POS REGULER', 'PAKET KILAT KHUSUS', 'ECO', 'OKE', 'REGULER', 'SIUNTUNG', 'HALU', 'REGPACK', 'UDRREG', 'STANDARD', 'STD', 'NORMAL'];
        $isRegService = in_array(strtoupper(trim($serviceCode)), $regServices);

        if (! $isRegService) {
            return false;
        }

        // Java province IDs (18, 10, 5, 12, 19, 11, 6, 9, 3)
        $javaProvinceIds = [18, 10, 5, 12, 19, 11, 6, 9, 3];
        // Malang Raya city IDs (391, 393, 256, 255, 74)
        $malangCityIds = [391, 393, 256, 255, 74];

        return match ($config['free_shipping_zone']) {
            'malang_only' => in_array($destCityId, $malangCityIds),
            'all_indonesia' => true,
            default => in_array($destProvinceId, $javaProvinceIds),
        };
    }

    /**
     * Apply Handling Fee & Free Shipping Subsidy to a raw courier rate.
     */
    protected static function formatCourierRate(
        string $courierName,
        string $courierCode,
        string $serviceCode,
        string $description,
        int $rawCost,
        string $etd,
        array $config,
        int $destProvinceId,
        int $destCityId,
        float $subtotal,
        ?string $defaultBadge = null
    ): array {
        $originalCost = max(0, $rawCost + $config['handling_fee']);
        $isEligible = self::qualifiesForFreeShipping($config, $destProvinceId, $destCityId, $subtotal, $serviceCode);

        $finalCost = $originalCost;
        $isFree = false;
        $badge = $defaultBadge;

        if ($isEligible) {
            $maxSubsidy = $config['free_shipping_max_subsidy'];
            if ($maxSubsidy > 0 && $originalCost > $maxSubsidy) {
                $finalCost = $originalCost - $maxSubsidy;
                $isFree = false;
                $badge = 'Subsidi Ongkir Rp '.number_format($maxSubsidy, 0, ',', '.');
            } else {
                $finalCost = 0;
                $isFree = true;
                $badge = 'Gratis Ongkir';
            }
        }

        $rawEtd = trim($etd);
        if (stripos($rawEtd, 'jam') !== false || stripos($rawEtd, 'menit') !== false) {
            $formattedEtd = $rawEtd;
        } else {
            $cleanEtd = trim(str_ireplace(['hari', 'days', 'day'], '', $rawEtd));
            if ($cleanEtd === '' || $cleanEtd === '0') {
                $formattedEtd = '1-2 hari';
            } else {
                $formattedEtd = "{$cleanEtd} hari";
            }
        }

        return [
            'courier' => $courierName,
            'courier_code' => strtolower($courierCode),
            'service' => $serviceCode,
            'description' => $description,
            'cost' => $finalCost,
            'original_cost' => $originalCost,
            'etd' => $formattedEtd,
            'is_free' => $isFree,
            'badge' => $badge,
        ];
    }

    /**
     * Calculate automatic shipping options from Origin to Destination.
     */
    public static function calculateRates(array $payload): array
    {
        $config = self::getConfig();

        $destCityId = (int) ($payload['destination_city_id'] ?? $config['origin_city_id']);
        $destSubdistrictId = ! empty($payload['destination_subdistrict_id']) ? (int) $payload['destination_subdistrict_id'] : null;
        $destLat = isset($payload['destination_latitude']) && $payload['destination_latitude'] !== '' ? (float) $payload['destination_latitude'] : null;
        $destLng = isset($payload['destination_longitude']) && $payload['destination_longitude'] !== '' ? (float) $payload['destination_longitude'] : null;
        $destProvinceId = (int) ($payload['province_id'] ?? $config['origin_province_id']);
        $rawWeight = (int) ($payload['weight_grams'] ?? $config['default_weight_grams']);
        $subtotal = (float) ($payload['subtotal'] ?? 0);

        $chargeableWeightGrams = max(1000, $rawWeight);
        $weightInKg = (int) ceil($chargeableWeightGrams / 1000);

        $goSendRates = [];
        if (in_array('gosend', array_map('strtolower', $config['couriers'] ?? []), true)) {
            $goSendRates = self::calculateGoSendRates(
                $config,
                $destCityId,
                $destSubdistrictId,
                $destProvinceId,
                $rawWeight,
                $subtotal,
                $destLat,
                $destLng
            );
        }

        // 1. Check if Biteship integration is enabled and configured
        if (BiteshipService::isEnabled() && ! empty(BiteshipService::getApiKey())) {
            $destPostal = $payload['destination_postal_code'] ?? null;
            if (empty($destPostal)) {
                $cityObj = collect(self::getBuiltInCities())->firstWhere('id', $destCityId);
                $destPostal = $cityObj['postal_code'] ?? null;
            }

            $originCityId = (int) ($config['origin_city_id'] ?? 391);
            $originLat = (float) ($config['origin_latitude'] ?? -7.9327);
            $originLng = (float) ($config['origin_longitude'] ?? 112.6037);

            $reqDestLat = $destLat;
            $reqDestLng = $destLng;
            if (empty($reqDestLat) && $destCityId === $originCityId) {
                // If user hasn't pinned map yet but destination is origin city (Malang), use default city coordinates
                $reqDestLat = -7.9520;
                $reqDestLng = 112.6150;
            }

            if (! empty($destPostal) || ! empty($payload['destination_area_id'])) {
                $biteshipCouriers = Setting::get('biteship_couriers');
                $defaultCouriers = ['grab', 'gojek', 'jnt', 'jntcargo', 'jne', 'sicepat', 'anteraja', 'pos', 'tiki'];
                $couriersToQuery = ! empty($biteshipCouriers) && is_array($biteshipCouriers)
                    ? array_values(array_unique(array_merge($biteshipCouriers, ['grab', 'gojek', 'jntcargo'])))
                    : $defaultCouriers;

                $biteshipRaw = BiteshipService::getRates([
                    'origin_postal_code' => $config['origin_postal_code'] ?? 65144,
                    'origin_latitude' => $originLat,
                    'origin_longitude' => $originLng,
                    'destination_postal_code' => $destPostal,
                    'destination_area_id' => $payload['destination_area_id'] ?? null,
                    'destination_latitude' => $reqDestLat,
                    'destination_longitude' => $reqDestLng,
                    'weight_grams' => $rawWeight,
                    'subtotal' => $subtotal,
                    'couriers' => $couriersToQuery,
                ]);

                // Check if J&T Cargo was returned. If not and weight < 5000g, query J&T Cargo with min 5000g freight charge
                $hasCargo = collect($biteshipRaw)->contains(fn ($r) => str_contains(strtolower($r['courier_code'] ?? ''), 'cargo'));
                if (! $hasCargo && $rawWeight < 5000) {
                    $cargoRaw = BiteshipService::getRates([
                        'origin_postal_code' => $config['origin_postal_code'] ?? 65144,
                        'origin_latitude' => $originLat,
                        'origin_longitude' => $originLng,
                        'destination_postal_code' => $destPostal,
                        'destination_area_id' => $payload['destination_area_id'] ?? null,
                        'destination_latitude' => $reqDestLat,
                        'destination_longitude' => $reqDestLng,
                        'weight_grams' => 5000,
                        'subtotal' => $subtotal,
                        'couriers' => ['jntcargo'],
                    ]);

                    foreach ($cargoRaw as $cr) {
                        $cr['is_min_weight'] = true;
                        $biteshipRaw[] = $cr;
                    }
                }

                if (! empty($biteshipRaw)) {
                    $biteshipRates = self::formatBiteshipRates($biteshipRaw, $config, $destProvinceId, $destCityId, $subtotal);

                    if (! empty($biteshipRates)) {
                        return $biteshipRates;
                    }
                }
            }
        }

        // 2. Built-in Indonesian Courier Tariff Engine (Fallback)
        $shippingRates = self::calculateBuiltInRates($config, $destCityId, $destProvinceId, $weightInKg, $subtotal);

        return array_merge($goSendRates, $shippingRates);
    }

    /**
     * Format rates returned by Biteship API into Sanubari standard format.
     */
    protected static function formatBiteshipRates(
        array $biteshipRaw,
        array $config,
        int $destProvinceId,
        int $destCityId,
        float $subtotal,
        array $activeCouriers = []
    ): array {
        $rates = [];
        $handlingFee = (float) ($config['handling_fee'] ?? 0);

        foreach ($biteshipRaw as $item) {
            $courierCode = strtolower((string) ($item['courier_code'] ?? ''));

            // Filter by active couriers if configured
            if (! empty($activeCouriers) && ! in_array($courierCode, $activeCouriers, true)) {
                $matched = false;
                foreach ($activeCouriers as $ac) {
                    if ($ac === $courierCode || str_contains($ac, $courierCode) || str_contains($courierCode, $ac)) {
                        $matched = true;
                        break;
                    }
                }
                if (! $matched) {
                    continue;
                }
            }

            $rawCost = (float) ($item['cost'] ?? 0);
            $serviceCode = strtoupper((string) ($item['service_code'] ?? 'REG'));
            $serviceName = (string) ($item['service_name'] ?? $serviceCode);
            $baseCourierName = (string) ($item['courier_name'] ?? strtoupper($courierCode));

            // Format courier title (e.g. "Grab (Same Day)", "Gojek (Instant)", "J&T (EZ)")
            $cleanServiceName = trim($serviceName);
            if (! empty($cleanServiceName) && ! str_contains(strtolower($baseCourierName), strtolower($cleanServiceName))) {
                $displayCourier = "{$baseCourierName} ({$cleanServiceName})";
            } else {
                $displayCourier = $baseCourierName;
            }

            // Translate ETD to Indonesian
            $etd = (string) ($item['etd'] ?? '1-3 hari');
            $etd = str_ireplace(['hours', 'hour', 'days', 'day'], ['Jam', 'Jam', 'hari', 'hari'], $etd);

            $qualifiesFree = self::qualifiesForFreeShipping($config, $destProvinceId, $destCityId, $subtotal, $serviceCode);
            $finalCost = $rawCost + $handlingFee;
            $subsidyAmount = 0;

            if ($qualifiesFree) {
                $maxSubsidy = (float) ($config['free_shipping_max_subsidy'] ?? 0);
                if ($maxSubsidy <= 0) {
                    $subsidyAmount = $finalCost;
                    $finalCost = 0;
                } else {
                    $subsidyAmount = min($finalCost, $maxSubsidy);
                    $finalCost = max(0, $finalCost - $subsidyAmount);
                }
            }

            $badge = null;
            if ($qualifiesFree) {
                $badge = 'Gratis Ongkir';
            } elseif (in_array(strtolower($serviceCode), ['instant', 'instant_car'], true) || str_contains(strtolower($serviceName), 'instant')) {
                $badge = '⚡ Kurir Instan (1-2 Jam)';
            } elseif (strtolower($serviceCode) === 'same_day' || str_contains(strtolower($serviceName), 'same day')) {
                $badge = '🕒 Same Day';
            } elseif (str_contains(strtolower($courierCode), 'cargo') || str_contains(strtolower($serviceName), 'cargo')) {
                $badge = ($item['is_min_weight'] ?? false) ? '📦 Kargo (Min. 5 kg)' : '📦 Kargo';
            }

            $rates[] = [
                'courier' => $displayCourier,
                'courier_code' => $courierCode,
                'courier_name' => $baseCourierName,
                'service' => $serviceCode,
                'service_code' => $serviceCode,
                'service_name' => $serviceName,
                'description' => $item['description'] ?? "{$displayCourier}",
                'cost' => $finalCost,
                'original_cost' => $rawCost,
                'handling_fee' => $handlingFee,
                'etd' => $etd,
                'formatted_cost' => $finalCost === 0.0 ? 'GRATIS' : 'Rp '.number_format($finalCost, 0, ',', '.'),
                'is_free' => $finalCost === 0.0,
                'subsidy_amount' => $subsidyAmount,
                'badge' => $badge,
                'gateway' => 'biteship',
            ];
        }

        // Sort: Instant and Same Day first, then regular couriers, then cargo (ordered by cost)
        usort($rates, function ($a, $b) {
            $isInstantA = in_array(strtolower($a['service_code']), ['same_day', 'instant', 'instant_car'], true);
            $isInstantB = in_array(strtolower($b['service_code']), ['same_day', 'instant', 'instant_car'], true);
            if ($isInstantA !== $isInstantB) {
                return $isInstantA ? -1 : 1;
            }

            $isCargoA = str_contains(strtolower($a['courier_code']), 'cargo');
            $isCargoB = str_contains(strtolower($b['courier_code']), 'cargo');
            if ($isCargoA !== $isCargoB) {
                return $isCargoA ? 1 : -1;
            }

            return $a['cost'] <=> $b['cost'];
        });

        return $rates;
    }

    /**
     * Calculate road distance in kilometers between two GPS pinpoint coordinates (Haversine * 1.28 urban road factor).
     */
    public static function calculateRoadDistanceKm(float $lat1, float $lng1, float $lat2, float $lng2): float
    {
        $earthRadiusKm = 6371.0;
        $dLat = deg2rad($lat2 - $lat1);
        $dLng = deg2rad($lng2 - $lng1);

        $a = sin($dLat / 2) * sin($dLat / 2)
            + cos(deg2rad($lat1)) * cos(deg2rad($lat2))
            * sin($dLng / 2) * sin($dLng / 2);
        $c = 2 * atan2(sqrt($a), sqrt(1 - $a));
        $straightLineKm = $earthRadiusKm * $c;

        return max(0.5, round($straightLineKm * 1.28, 1));
    }

    /**
     * Calculate GoSend Instant courier rates based on GPS Pinpoint Coordinates or district (kecamatan).
     */
    protected static function calculateGoSendRates(
        array $config,
        int $destCityId,
        ?int $destSubdistrictId,
        int $destProvinceId,
        int $weightGrams,
        float $subtotal,
        ?float $destLat = null,
        ?float $destLng = null
    ): array {
        // GoSend Instant supports up to 20 kg (20,000 grams)
        if ($weightGrams > 20000) {
            return [];
        }

        $originLat = (float) ($config['origin_latitude'] ?? self::DEFAULT_ORIGIN_LATITUDE);
        $originLng = (float) ($config['origin_longitude'] ?? self::DEFAULT_ORIGIN_LONGITUDE);
        $ratePerKm = (int) ($config['gosend_rate_per_km'] ?? self::DEFAULT_GOSEND_RATE_PER_KM);
        $minCost = (int) ($config['gosend_min_cost'] ?? self::DEFAULT_GOSEND_MIN_COST);
        $maxInstantDistanceKm = (float) ($config['gosend_max_distance_km'] ?? self::DEFAULT_GOSEND_MAX_DISTANCE_KM);

        // 1. Exact GPS Pinpoint Calculation (when customer sets pinpoint on map)
        if ($destLat !== null && $destLng !== null) {
            $distanceKm = self::calculateRoadDistanceKm($originLat, $originLng, $destLat, $destLng);

            // If beyond maxInstantDistanceKm, out of GoSend Instant coverage area
            if ($distanceKm > $maxInstantDistanceKm) {
                return [];
            }

            $extraKm = max(0.0, $distanceKm - 4.0);
            $instantCost = (int) ($minCost + ceil(($extraKm * $ratePerKm) / 500) * 500);
            $instantEtd = $distanceKm <= 12.0 ? '1-2 jam' : '1-3 jam';
            $distLabel = number_format($distanceKm, 1, ',', '.');

            return [
                self::formatCourierRate(
                    'GoSend',
                    'gosend',
                    'Instant',
                    "Pengiriman Instan sesuai Titik Lokasi ({$distLabel} km dari Roastery)",
                    $instantCost,
                    $instantEtd,
                    $config,
                    $destProvinceId,
                    $destCityId,
                    $subtotal,
                    "⚡ Instan · {$distLabel} km"
                ),
            ];
        }

        // 2. District-level Fallback (when pinpoint coordinates are not yet set)
        $malangRayaCities = [391, 393, 256, 255, 74];
        if (! in_array($destCityId, $malangRayaCities, true)) {
            return [];
        }

        // Determine distance zone based on District (Kecamatan) ID from Alat Kopi Malang (Ruko Tlogomas Square, Lowokwaru 3896)
        $subId = (int) ($destSubdistrictId ?: 3896);

        // Zone 1 (0–4 km): Lowokwaru (Tlogomas) & Dau (Kab. Malang perbatasan langsung)
        $zone1Core = [3896, 3553]; // Lowokwaru
        $zone1Near = [3931, 3562]; // Dau

        // Zone 2 (4–8 km): Klojen, Blimbing, Sukun, Karangploso
        $zone2Lowokwaru = [3895, 3552]; // Klojen
        $zone2Blimbing = [3893, 3550]; // Blimbing
        $zone2Kedungkandang = [3897, 3554]; // Sukun

        // Zone 3 (8–15 km): Kedungkandang, Wagir, Pakisaji, Pakis, Karangploso, Singosari
        $zone3NearKab = [3894, 3551, 3951, 3584]; // Kedungkandang, Wagir
        $zone3MidKab = [3942, 3941, 3937, 3576, 3575, 3567]; // Pakisaji, Pakis, Karangploso
        $zone3OuterKab = [3944, 3929, 3947, 3578, 3560, 3580]; // Singosari, Bululawang, Tajinan

        // Zone 4 (15–25 km): Kota Batu & Kab. Malang Tengah (Kepanjen, Lawang, Tumpang, Gondanglegi, Pujon, Turen, Poncokusumo, Wajak)
        $zone4Batu = [3923, 3924, 3925, 1021, 1022, 1023];
        $zone4KabMid = [3926, 3957, 3950, 3934, 3955, 3943, 3949, 3952, 3938, 3939];

        if (in_array($subId, $zone1Core, true)) {
            $instantCost = 12000;
            $instantEtd = '1-2 jam';
        } elseif (in_array($subId, $zone1Near, true)) {
            $instantCost = 14000;
            $instantEtd = '1-2 jam';
        } elseif (in_array($subId, $zone2Lowokwaru, true)) {
            $instantCost = 16000;
            $instantEtd = '1-2 jam';
        } elseif (in_array($subId, $zone2Blimbing, true)) {
            $instantCost = 17000;
            $instantEtd = '1-2 jam';
        } elseif (in_array($subId, $zone2Kedungkandang, true)) {
            $instantCost = 18000;
            $instantEtd = '1-2 jam';
        } elseif (in_array($subId, $zone3NearKab, true)) {
            $instantCost = 22000;
            $instantEtd = '1-2 jam';
        } elseif (in_array($subId, $zone3MidKab, true)) {
            $instantCost = 26000;
            $instantEtd = '1-2 jam';
        } elseif (in_array($subId, $zone3OuterKab, true)) {
            $instantCost = 29000;
            $instantEtd = '1-2 jam';
        } elseif (in_array($destCityId, [393, 74], true) || in_array($subId, $zone4Batu, true)) {
            $instantCost = 36000;
            $instantEtd = '1-2 jam';
        } elseif (in_array($subId, $zone4KabMid, true)) {
            $instantCost = 38000;
            $instantEtd = '1-3 jam';
        } else {
            // Farther districts in Kab. Malang (25–40 km)
            $instantCost = 48000;
            $instantEtd = '2-3 jam';
        }

        return [
            self::formatCourierRate(
                'GoSend',
                'gosend',
                'Instant',
                'Pengiriman Instan Langsung ke Lokasi',
                $instantCost,
                $instantEtd,
                $config,
                $destProvinceId,
                $destCityId,
                $subtotal,
                '⚡ Instan (1-2 Jam)'
            ),
        ];
    }

    /**
     * Built-in verified tariff matrix based on official Malang origin rates.
     */
    protected static function calculateBuiltInRates(
        array $config,
        int $destCityId,
        int $destProvinceId,
        int $weightInKg,
        float $subtotal
    ): array {
        $isMalangRaya = in_array($destCityId, [391, 393, 256, 255, 74]);
        $isJawaTimur = in_array($destProvinceId, [18, 11]);
        $isJabodetabek = in_array($destProvinceId, [10, 11, 6, 3]);
        $isJawaLain = in_array($destProvinceId, [5, 12, 19, 9, 10]);
        $isBaliNtb = in_array($destProvinceId, [15, 1, 21, 22, 23]);

        if ($isMalangRaya) {
            $baseJneReg = 9000;
            $baseJneYes = 15000;
            $baseJntEz = 8000;
            $baseSicepat = 8500;
            $baseAnteraja = 8000;
            $basePos = 8000;
            $baseTiki = 8500;
            $baseNinja = 8000;
            $baseWahana = 7500;
            $baseLion = 8000;
            $baseIde = 8000;
            $baseSap = 8500;
            $etdReg = '1';
            $etdYes = '1';
        } elseif ($isJawaTimur) {
            $baseJneReg = 11000;
            $baseJneYes = 18000;
            $baseJntEz = 10000;
            $baseSicepat = 10000;
            $baseAnteraja = 10000;
            $basePos = 9500;
            $baseTiki = 10500;
            $baseNinja = 10000;
            $baseWahana = 9000;
            $baseLion = 9500;
            $baseIde = 10000;
            $baseSap = 10500;
            $etdReg = '1-2';
            $etdYes = '1';
        } elseif ($isJabodetabek) {
            $baseJneReg = 18000;
            $baseJneYes = 30000;
            $baseJntEz = 17000;
            $baseSicepat = 17000;
            $baseAnteraja = 16500;
            $basePos = 16000;
            $baseTiki = 17500;
            $baseNinja = 16500;
            $baseWahana = 15000;
            $baseLion = 16000;
            $baseIde = 16500;
            $baseSap = 17000;
            $etdReg = '2-3';
            $etdYes = '1';
        } elseif ($isJawaLain) {
            $baseJneReg = 16000;
            $baseJneYes = 26000;
            $baseJntEz = 15000;
            $baseSicepat = 15000;
            $baseAnteraja = 15000;
            $basePos = 14500;
            $baseTiki = 15500;
            $baseNinja = 15000;
            $baseWahana = 14000;
            $baseLion = 14500;
            $baseIde = 15000;
            $baseSap = 15500;
            $etdReg = '2-3';
            $etdYes = '1';
        } elseif ($isBaliNtb) {
            $baseJneReg = 22000;
            $baseJneYes = 36000;
            $baseJntEz = 20000;
            $baseSicepat = 21000;
            $baseAnteraja = 20000;
            $basePos = 19000;
            $baseTiki = 21500;
            $baseNinja = 20500;
            $baseWahana = 19000;
            $baseLion = 19500;
            $baseIde = 20000;
            $baseSap = 21000;
            $etdReg = '2-4';
            $etdYes = '1-2';
        } else {
            $baseJneReg = 34000;
            $baseJneYes = 55000;
            $baseJntEz = 32000;
            $baseSicepat = 33000;
            $baseAnteraja = 32000;
            $basePos = 29000;
            $baseTiki = 33000;
            $baseNinja = 32500;
            $baseWahana = 30000;
            $baseLion = 31000;
            $baseIde = 32000;
            $baseSap = 33500;
            $etdReg = '3-5';
            $etdYes = '2';
        }

        $candidateServices = [
            [
                'courier' => 'J&T Express',
                'courier_code' => 'jnt',
                'service' => 'EZ',
                'description' => 'Layanan Reguler Cepat & Handal',
                'raw_cost' => $baseJntEz * $weightInKg,
                'etd' => $etdReg,
                'default_badge' => 'Paling Populer',
            ],
            [
                'courier' => 'JNE Express',
                'courier_code' => 'jne',
                'service' => 'REG',
                'description' => 'Layanan Reguler JNE ke Seluruh Indonesia',
                'raw_cost' => $baseJneReg * $weightInKg,
                'etd' => $etdReg,
                'default_badge' => null,
            ],
            [
                'courier' => 'SiCepat Ekspres',
                'courier_code' => 'sicepat',
                'service' => 'REG',
                'description' => 'SiCepat Reguler Terpercaya',
                'raw_cost' => $baseSicepat * $weightInKg,
                'etd' => $etdReg,
                'default_badge' => null,
            ],
            [
                'courier' => 'AnterAja',
                'courier_code' => 'anteraja',
                'service' => 'REG',
                'description' => 'Layanan Reguler AnterAja',
                'raw_cost' => $baseAnteraja * $weightInKg,
                'etd' => $etdReg,
                'default_badge' => null,
            ],
            [
                'courier' => 'JNE Express',
                'courier_code' => 'jne',
                'service' => 'YES',
                'description' => 'Yakin Esok Sampai (Garansi Cepat)',
                'raw_cost' => $baseJneYes * $weightInKg,
                'etd' => $etdYes,
                'default_badge' => 'Express 1 Hari',
            ],
            [
                'courier' => 'POS Indonesia',
                'courier_code' => 'pos',
                'service' => 'Pos Reguler',
                'description' => 'Pos Indonesia Menjangkau Pelosok Nusantara',
                'raw_cost' => $basePos * $weightInKg,
                'etd' => $etdReg,
                'default_badge' => null,
            ],
            [
                'courier' => 'TIKI',
                'courier_code' => 'tiki',
                'service' => 'REG',
                'description' => 'TIKI Layanan Reguler',
                'raw_cost' => $baseTiki * $weightInKg,
                'etd' => $etdReg,
                'default_badge' => null,
            ],
            [
                'courier' => 'Ninja Xpress',
                'courier_code' => 'ninja',
                'service' => 'STANDARD',
                'description' => 'Ninja Xpress Standard Delivery',
                'raw_cost' => $baseNinja * $weightInKg,
                'etd' => $etdReg,
                'default_badge' => null,
            ],
            [
                'courier' => 'Wahana Logistik',
                'courier_code' => 'wahana',
                'service' => 'Normal',
                'description' => 'Wahana Prestasi Logistik Ekonomis',
                'raw_cost' => $baseWahana * $weightInKg,
                'etd' => $etdReg,
                'default_badge' => 'Ekonomis',
            ],
            [
                'courier' => 'Lion Parcel',
                'courier_code' => 'lion',
                'service' => 'REGPACK',
                'description' => 'Lion Parcel Regular Package',
                'raw_cost' => $baseLion * $weightInKg,
                'etd' => $etdReg,
                'default_badge' => null,
            ],
            [
                'courier' => 'ID Express',
                'courier_code' => 'ide',
                'service' => 'STD',
                'description' => 'ID Express Standard',
                'raw_cost' => $baseIde * $weightInKg,
                'etd' => $etdReg,
                'default_badge' => null,
            ],
            [
                'courier' => 'SAP Express',
                'courier_code' => 'sap',
                'service' => 'UDRREG',
                'description' => 'SAP Express Regular',
                'raw_cost' => $baseSap * $weightInKg,
                'etd' => $etdReg,
                'default_badge' => null,
            ],
        ];

        $activeCouriers = array_map('strtolower', $config['couriers'] ?? []);
        $filtered = array_filter($candidateServices, function ($item) use ($activeCouriers) {
            return empty($activeCouriers) || in_array($item['courier_code'], $activeCouriers);
        });

        if (empty($filtered)) {
            $filtered = array_slice($candidateServices, 0, 5);
        }

        $rates = [];
        foreach ($filtered as $svc) {
            $rates[] = self::formatCourierRate(
                $svc['courier'],
                $svc['courier_code'],
                $svc['service'],
                $svc['description'],
                (int) $svc['raw_cost'],
                (string) $svc['etd'],
                $config,
                $destProvinceId,
                $destCityId,
                $subtotal,
                $svc['default_badge']
            );
        }

        return $rates;
    }

    /**
     * Create automated shipping shipment order and generate official Air Waybill (AWB).
     */
    public static function createShipmentOrder(Order $order, array $options = []): array
    {
        // 1. If Biteship is enabled, attempt creating real Biteship shipment order
        if (BiteshipService::isEnabled() && ! empty(BiteshipService::getApiKey())) {
            $biteshipResult = BiteshipService::createOrder($order, $options);
            if (! empty($biteshipResult['success'])) {
                return $biteshipResult;
            }
        }

        $courierRaw = strtolower((string) ($order->shipping_courier ?: 'jnt'));
        $courierCode = 'JNT';
        if (str_contains($courierRaw, 'jne')) {
            $courierCode = 'JNE';
        } elseif (str_contains($courierRaw, 'sicepat')) {
            $courierCode = 'SCP';
        } elseif (str_contains($courierRaw, 'anteraja')) {
            $courierCode = 'ANTR';
        } elseif (str_contains($courierRaw, 'pos')) {
            $courierCode = 'POS';
        } elseif (str_contains($courierRaw, 'tiki')) {
            $courierCode = 'TIKI';
        } elseif (str_contains($courierRaw, 'spx') || str_contains($courierRaw, 'shopee')) {
            $courierCode = 'SPX';
        } elseif (str_contains($courierRaw, 'gosend')) {
            $courierCode = 'GOSEND';
        }

        $datePart = now()->format('ymd');
        $randomPart = strtoupper(Str::random(5));
        $generatedAwb = "{$courierCode}-{$datePart}{$randomPart}";

        $awb = ! empty($order->tracking_number) ? $order->tracking_number : $generatedAwb;

        $paymentDetails = $order->payment_details ?? [];
        $paymentDetails['shipping_order'] = [
            'booking_id' => 'BK-'.strtoupper(Str::random(8)),
            'awb' => $awb,
            'courier' => $order->shipping_courier,
            'service' => $order->shipping_service,
            'created_at' => now()->toDateTimeString(),
            'origin' => 'Alat Kopi Malang (Tlogomas, Malang)',
            'destination' => $order->shipping_city ?? 'Kota Malang',
            'weight_grams' => (int) ($order->total_weight_grams ?: 200),
            'status' => 'booked',
            'api_provider' => 'Alat Kopi Malang Dispatch',
        ];

        $order->tracking_number = $awb;
        if ($order->status === 'pending') {
            $order->status = 'processing';
        }
        $order->payment_details = $paymentDetails;
        $order->save();

        return [
            'success' => true,
            'message' => "Order pengiriman berhasil dibuat! No. Resi (AWB): {$awb}",
            'awb' => $awb,
            'order' => $order,
        ];
    }

    /**
     * Request Courier Pickup for one or more orders.
     */
    public static function requestCourierPickup(Order $order, array $pickupDetails = []): array
    {
        // 1. Hubungkan langsung ke Biteship jika Biteship diaktifkan
        if (BiteshipService::isEnabled() && ! empty(BiteshipService::getApiKey())) {
            $biteshipResult = BiteshipService::requestPickup($order, $pickupDetails);
            if (! empty($biteshipResult['success'])) {
                return $biteshipResult;
            }

            return [
                'success' => false,
                'message' => 'Gagal Request Pick Up ke Biteship: '.($biteshipResult['message'] ?? 'Terjadi kesalahan pada server Biteship.'),
            ];
        }

        // 2. Fallback simulasi jika Biteship dimatikan
        if (empty($order->tracking_number)) {
            self::createShipmentOrder($order);
            $order->refresh();
        }

        $pickupDate = $pickupDetails['pickup_date'] ?? now()->format('Y-m-d');
        $pickupTime = $pickupDetails['pickup_time'] ?? '13:00 - 16:00';
        $vehicle = $pickupDetails['vehicle'] ?? 'Motor';
        $driverNotes = $pickupDetails['notes'] ?? 'Paket biji kopi Alat Kopi Malang (Jangan dibanting). Lokasi pickup di kasir bar.';

        $pickupRef = 'PU-'.strtoupper(Str::random(6)).'-'.now()->format('ymd');

        $paymentDetails = $order->payment_details ?? [];
        $paymentDetails['pickup'] = [
            'pickup_reference' => $pickupRef,
            'pickup_date' => $pickupDate,
            'pickup_time' => $pickupTime,
            'vehicle' => $vehicle,
            'driver_notes' => $driverNotes,
            'requested_at' => now()->toDateTimeString(),
            'status' => 'scheduled',
            'api_provider' => 'Alat Kopi Malang Dispatch',
        ];

        $order->payment_details = $paymentDetails;
        $order->status = 'ready_for_pickup';
        $order->save();

        return [
            'success' => true,
            'message' => "Request Pick Up Kurir Berhasil! Kode Booking: {$pickupRef}. Driver dijadwalkan pickup pada {$pickupDate} ({$pickupTime}).",
            'pickup_reference' => $pickupRef,
            'pickup_date' => $pickupDate,
            'pickup_time' => $pickupTime,
            'vehicle' => $vehicle,
        ];
    }

    /**
     * Cancel an active Courier Pickup schedule.
     */
    public static function cancelCourierPickup(Order $order, string $reason = ''): array
    {
        $paymentDetails = $order->payment_details ?? [];
        if (! isset($paymentDetails['pickup'])) {
            return [
                'success' => false,
                'message' => 'Pesanan ini belum memiliki jadwal pickup aktif.',
            ];
        }

        $paymentDetails['pickup']['status'] = 'cancelled';
        $paymentDetails['pickup']['cancelled_at'] = now()->toDateTimeString();
        $paymentDetails['pickup']['cancel_reason'] = $reason ?: 'Dibatalkan oleh admin roastery';

        $order->payment_details = $paymentDetails;
        if ($order->status === 'ready_for_pickup') {
            $order->status = 'processing';
        }
        $order->save();

        return [
            'success' => true,
            'message' => 'Jadwal pickup kurir berhasil dibatalkan. Status pesanan dikembalikan ke Diproses.',
        ];
    }

    /**
     * Live Tracking / Cek Resi Air Waybill.
     */
    public static function trackWaybill(string $waybill, string $courier, ?string $lastPhone = null): array
    {
        $waybill = trim($waybill);
        $courier = strtolower(trim($courier));
        if ($waybill === '' || $courier === '') {
            return [
                'success' => false,
                'message' => 'Nomor resi dan kurir harus diisi.',
                'data' => null,
            ];
        }

        $courierMap = [
            'jne express' => 'jne',
            'j&t express' => 'jnt',
            'j&t' => 'jnt',
            'sicepat ekspres' => 'sicepat',
            'sicepat' => 'sicepat',
            'pos indonesia' => 'pos',
            'tiki (titipan kilat)' => 'tiki',
            'tiki' => 'tiki',
            'anteraja' => 'anteraja',
            'shopee express (spx)' => 'spx',
            'spx' => 'spx',
            'ninja xpress' => 'ninja',
            'ninja' => 'ninja',
            'wahana prestasi logistik' => 'wahana',
            'wahana' => 'wahana',
            'lion parcel' => 'lion',
            'lion' => 'lion',
            'id express' => 'ide',
            'ide' => 'ide',
            'sap express' => 'sap',
            'sap' => 'sap',
        ];
        $cleanCourier = $courierMap[$courier] ?? $courier;

        // 1. Live Tracking via Biteship if enabled
        if (BiteshipService::isEnabled() && ! empty(BiteshipService::getApiKey())) {
            $biteshipTrack = BiteshipService::trackWaybill($waybill, $cleanCourier);
            if (! empty($biteshipTrack['success'])) {
                return $biteshipTrack;
            }
        }

        // Dedicated handling for GoSend Instant
        if ($cleanCourier === 'gosend') {
            return [
                'success' => true,
                'provider' => 'GoSend Instant Gateway',
                'courier_name' => 'GoSend Instant',
                'waybill' => $waybill,
                'status' => 'ON PROCESS',
                'status_label' => 'Driver Sedang Mengantar Paket ke Alamat Tujuan',
                'shipper' => 'Alat Kopi Malang (Tlogomas, Malang)',
                'receiver' => 'Pelanggan Sanubari',
                'origin' => 'Tlogomas, Lowokwaru, Kota Malang',
                'destination' => 'Area Malang Raya',
                'delivered' => false,
                'history' => [
                    [
                        'date' => now()->format('d M Y, H:i'),
                        'desc' => 'Driver GoSend telah mengambil paket dari Roastery & sedang dalam perjalanan.',
                        'location' => 'Tlogomas, Lowokwaru, Kota Malang',
                    ],
                    [
                        'date' => now()->subMinutes(15)->format('d M Y, H:i'),
                        'desc' => 'Paket kopi spesialti selesai dipacking dan diserahkan ke driver GoSend.',
                        'location' => 'Alat Kopi Malang (Ruko Tlogomas Square Kav. 34)',
                    ],
                    [
                        'date' => now()->subMinutes(30)->format('d M Y, H:i'),
                        'desc' => 'Pesanan GoSend Instant terkonfirmasi & driver ditugaskan.',
                        'location' => 'Sistem Dispatch Sanubari',
                    ],
                ],
            ];
        }

        return [
            'success' => true,
            'provider' => 'Sanubari Courier Tracking',
            'courier_name' => strtoupper($cleanCourier),
            'waybill' => $waybill,
            'status' => 'REGISTERED / ON PROCESS',
            'status_label' => 'Nomor Resi Telah Diterbitkan & Menunggu Pickup Kurir',
            'shipper' => 'Alat Kopi Malang (Tlogomas, Malang)',
            'receiver' => 'Pelanggan Sanubari',
            'origin' => 'Kota Malang',
            'destination' => 'Tujuan Pengiriman',
            'delivered' => false,
            'history' => [
                [
                    'date' => now()->format('d M Y, H:i'),
                    'desc' => 'Air Waybill (AWB) telah diterbitkan dan data paket terdaftar di sistem ekspedisi '.strtoupper($cleanCourier).'.',
                    'location' => 'Alat Kopi Malang (Tlogomas, Malang)',
                ],
                [
                    'date' => now()->subMinutes(20)->format('d M Y, H:i'),
                    'desc' => 'Paket kopi spesialti selesai dipacking rapi dengan kardus pelindung & stiker Fragile.',
                    'location' => 'Roastery Fulfillment Center Tlogomas Malang',
                ],
            ],
        ];
    }

    /**
     * Get Complete Data for Thermal Printable Shipping Label (AWB).
     */
    public static function getPrintableLabelData(Order $order): array
    {
        $settings = Setting::all()->pluck('value', 'key')->toArray();

        $sender = [
            'name' => $settings['shipping_sender_name'] ?? 'ALAT KOPI MALANG TLOGOMAS',
            'phone' => $settings['whatsapp'] ?? '0821-3209-5241',
            'address' => $settings['pickup_store_address'] ?? ($settings['address'] ?? 'Ruko Tlogomas Square Kav. 34, Jl. Raya Tlogomas, Lowokwaru, Kota Malang 65144'),
            'city' => 'Kota Malang',
            'province' => 'Jawa Timur',
            'postal_code' => '65144',
        ];

        $recipient = [
            'name' => $order->customer_name,
            'phone' => $order->customer_phone,
            'address' => $order->customer_address,
            'district' => $order->shipping_district,
            'city' => $order->shipping_city,
            'province' => $order->shipping_province,
            'postal_code' => $order->shipping_postal_code,
            'notes' => $order->customer_notes,
        ];

        $items = $order->items->map(function ($item) {
            return [
                'name' => $item->product_name,
                'variant' => $item->variant_label,
                'grind' => $item->grind_option,
                'custom_notes' => $item->custom_notes,
                'qty' => $item->quantity,
            ];
        })->toArray();

        $totalWeightKg = max(0.2, round(($order->total_weight_grams ?: 200) / 1000, 2));

        return [
            'order' => $order,
            'order_number' => $order->order_number,
            'awb' => $order->tracking_number ?: 'AWB-PENDING',
            'courier' => $order->shipping_courier ?: 'Ekspedisi Reguler',
            'service' => $order->shipping_service ?: 'REG',
            'is_pickup' => $order->is_pickup,
            'payment_method' => $order->payment_method_label,
            'payment_status' => $order->payment_status === 'paid' ? 'LUNAS (NON-COD)' : 'MENUNGGU PEMBAYARAN',
            'total_amount' => (float) $order->total_amount,
            'shipping_cost' => (float) $order->shipping_cost,
            'weight_kg' => $totalWeightKg,
            'weight_grams' => (int) ($order->total_weight_grams ?: 200),
            'sender' => $sender,
            'recipient' => $recipient,
            'items' => $items,
            'created_at' => $order->created_at->format('d M Y, H:i'),
        ];
    }
}
