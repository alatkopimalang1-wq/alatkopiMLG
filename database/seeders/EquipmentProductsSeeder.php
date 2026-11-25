<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Product;
use App\Models\ProductImage;
use App\Models\ProductVariant;
use App\Models\Setting;
use Illuminate\Database\Seeder;

class EquipmentProductsSeeder extends Seeder
{
    public function run(): void
    {
        $category = Category::firstOrCreate(
            ['slug' => 'alat-kopi'],
            [
                'name' => ['id' => 'Alat Kopi', 'en' => 'Coffee Equipment'],
                'type' => 'equipment',
                'description' => [
                    'id' => 'Peralatan seduh manual, grinder, timbangan digital, dan perlengkapan barista.',
                    'en' => 'Manual brewers, grinders, digital scales, and barista equipment.',
                ],
                'icon' => 'wrench',
                'sort_order' => 20,
            ]
        );

        // Ensure 'alat-kopi' is present in custom product_series setting if configured
        $seriesList = Setting::get('product_series', null);
        if (is_array($seriesList) && ! empty($seriesList)) {
            $hasEquipmentSeries = collect($seriesList)->contains(fn ($item) => ($item['slug'] ?? '') === 'alat-kopi');
            if (! $hasEquipmentSeries) {
                $seriesList[] = [
                    'name' => 'Alat Kopi & Seduh',
                    'slug' => 'alat-kopi',
                    'description' => 'Peralatan seduh manual, grinder, timbangan digital, dan aksesori barista.',
                    'badge_color' => 'info',
                    'is_active' => true,
                ];
                Setting::set('product_series', $seriesList);
            }
        }

        $items = [
            [
                'name' => 'Hario V60 Ceramic Dripper 02',
                'slug' => 'hario-v60-ceramic-dripper-02',
                'tagline' => [
                    'id' => 'Dripper keramik V60 klasik dengan alur spiral untuk ekstraksi optimal',
                    'en' => 'Classic V60 ceramic dripper with spiral ribs for clean extraction',
                ],
                'short_description' => 'Dripper pour over berbahan porselen Arita-yaki yang menjaga stabilitas suhu seduh.',
                'description' => [
                    'id' => 'Hario V60 Ceramic Dripper adalah standar emas untuk seduh manual pour over. Material keramik porselen menjaga suhu air tetap stabil selama proses ekstraksi, sementara alur spiral di bagian dalam memaksimalkan aliran udara agar kopi menghasilkan rasa yang bersih dan manis.',
                    'en' => 'The Hario V60 Ceramic Dripper is the gold standard for manual pour-over brewing. Porcelain construction retains heat stability while spiral ribs ensure smooth airflow and balanced extraction.',
                ],
                'origin' => 'Hario',
                'varietal' => 'Keramik Porselen',
                'process' => 'Pour Over Dripper',
                'altitude' => 'Size 02 (1-4 Cup)',
                'brew_methods' => ['V60', 'Pour Over'],
                'image' => 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=900&q=80',
                'is_featured' => true,
                'is_new' => false,
                'variants' => [
                    ['label' => 'Putih (Size 02)', 'weight_grams' => 400, 'price' => 245000, 'cost_price' => 185000, 'stock' => 24, 'sku' => 'AKM-HARIO-V60-WHT'],
                    ['label' => 'Hitam Matte (Size 02)', 'weight_grams' => 400, 'price' => 265000, 'cost_price' => 195000, 'stock' => 16, 'sku' => 'AKM-HARIO-V60-BLK'],
                ],
            ],
            [
                'name' => 'Timemore Chestnut C3 Manual Grinder',
                'slug' => 'timemore-chestnut-c3-manual-grinder',
                'tagline' => [
                    'id' => 'Grinder manual presisi dengan S2C stainless steel burr 38mm',
                    'en' => 'Precision manual coffee grinder with 38mm S2C stainless steel burrs',
                ],
                'short_description' => 'Grinder tangan berbahan aluminium alloy CNC dengan hasil gilingan konsisten dari espresso hingga french press.',
                'description' => [
                    'id' => 'Timemore Chestnut C3 dilengkapi S2C (Spike to Cut) burr 38mm yang memotong biji kopi lebih cepat dan seragam dengan minim fine particles. Bodi bertekstur anti-slip berbahan aluminium alloy membuatnya nyaman digenggam dan kokoh untuk pemakaian harian maupun traveling.',
                    'en' => 'Timemore Chestnut C3 features 38mm S2C stainless steel burrs for fast, uniform grinding with minimal fines. CNC-machined aluminum body delivers durability and effortless portability.',
                ],
                'origin' => 'Timemore',
                'varietal' => 'Aluminium Alloy & Stainless Steel 420',
                'process' => 'Manual Grinder',
                'altitude' => 'Kapasitas 25g',
                'brew_methods' => ['Espresso', 'V60', 'Aeropress', 'French Press'],
                'image' => 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=900&q=80',
                'is_featured' => true,
                'is_new' => true,
                'variants' => [
                    ['label' => 'Matte Black', 'weight_grams' => 530, 'price' => 790000, 'cost_price' => 610000, 'stock' => 15, 'sku' => 'AKM-TM-C3-BLK'],
                    ['label' => 'Space Gray', 'weight_grams' => 530, 'price' => 810000, 'cost_price' => 625000, 'stock' => 10, 'sku' => 'AKM-TM-C3-GRY'],
                ],
            ],
            [
                'name' => 'Timemore Black Mirror Basic 2.0 Scale',
                'slug' => 'timemore-black-mirror-basic-2-scale',
                'tagline' => [
                    'id' => 'Timbangan kopi digital responsif 0.1g dengan auto-timer & flow rate',
                    'en' => 'Responsive 0.1g digital coffee scale with auto-timer and flow rate',
                ],
                'short_description' => 'Timbangan digital USB-C rechargeable dengan sensor presisi 0.1 gram dan indikator flow rate.',
                'description' => [
                    'id' => 'Timbangan digital Timemore Black Mirror Basic 2.0 hadir dengan respons cepat, akurasi 0.1 gram, fitur auto-timer saat air mulai dituang, serta tampilan LED tersembunyi yang elegan. Dilengkapi bantalan silikon tahan panas dan baterai rechargeable via USB-C.',
                    'en' => 'Timemore Black Mirror Basic 2.0 provides 0.1g precision, auto-timer, flow-rate display, heat-resistant silicone pad, and USB-C rechargeable battery.',
                ],
                'origin' => 'Timemore',
                'varietal' => 'Akrilik Matte & Silikon Tahan Panas',
                'process' => 'Digital Coffee Scale',
                'altitude' => 'Maks 2000g (0.1g)',
                'brew_methods' => ['V60', 'Espresso', 'Pour Over'],
                'image' => 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=900&q=80',
                'is_featured' => true,
                'is_new' => true,
                'variants' => [
                    ['label' => 'Black Edition', 'weight_grams' => 380, 'price' => 650000, 'cost_price' => 495000, 'stock' => 18, 'sku' => 'AKM-TM-SCALE-BLK'],
                ],
            ],
            [
                'name' => 'Gooseneck Pour Over Kettle 600ml',
                'slug' => 'gooseneck-pour-over-kettle-600ml',
                'tagline' => [
                    'id' => 'Teko leher angsa 600ml dengan termometer tutup untuk tuangan presisi',
                    'en' => '600ml gooseneck pour-over kettle with lid thermometer for precise pouring',
                ],
                'short_description' => 'Ketel leher angsa stainless steel 304 dengan aliran air stabil dan termometer analog terintegrasi.',
                'description' => [
                    'id' => 'Dirancang khusus untuk penyeduhan manual brew seperti V60 dan Kalita Wave. Leher angsa ramping memberikan kontrol penuh atas kecepatan dan arah aliran air, dilengkapi termometer pada tutup agar suhu seduh selalu tepat di kisaran 88°C–94°C.',
                    'en' => 'Designed for manual pour-over brewing. Slender gooseneck spout offers steady flow control, paired with an integrated lid thermometer for accurate brewing temperature.',
                ],
                'origin' => 'Alat Kopi Malang',
                'varietal' => 'Stainless Steel 304 Food Grade',
                'process' => 'Gooseneck Kettle',
                'altitude' => 'Kapasitas 600ml',
                'brew_methods' => ['V60', 'Kalita Wave', 'Chemex'],
                'image' => 'https://images.unsplash.com/photo-1442512595331-e89e73853f31?auto=format&fit=crop&w=900&q=80',
                'is_featured' => false,
                'is_new' => false,
                'variants' => [
                    ['label' => 'Matte Black 600ml', 'weight_grams' => 600, 'price' => 285000, 'cost_price' => 205000, 'stock' => 20, 'sku' => 'AKM-KETTLE-600-BLK'],
                    ['label' => 'Brushed Silver 600ml', 'weight_grams' => 600, 'price' => 275000, 'cost_price' => 195000, 'stock' => 12, 'sku' => 'AKM-KETTLE-600-SLV'],
                ],
            ],
        ];

        foreach ($items as $item) {
            $variants = $item['variants'];
            $image = $item['image'];
            unset($item['variants'], $item['image']);

            $totalStock = array_sum(array_column($variants, 'stock'));
            $prices = array_column($variants, 'price');

            $product = Product::updateOrCreate(
                ['slug' => $item['slug']],
                array_merge($item, [
                    'series' => 'alat-kopi',
                    'status' => 'active',
                    'channel' => 'all',
                    'stock' => $totalStock,
                    'stock_status' => $totalStock > 0 ? 'in_stock' : 'out_of_stock',
                    'min_price' => min($prices),
                    'max_price' => max($prices),
                    'freshness_days' => 365,
                    'released_at' => now(),
                ])
            );

            $product->categories()->syncWithoutDetaching([$category->id]);

            foreach ($variants as $v) {
                ProductVariant::updateOrCreate(
                    ['product_id' => $product->id, 'label' => $v['label']],
                    [
                        'weight_grams' => $v['weight_grams'],
                        'price' => $v['price'],
                        'cost_price' => $v['cost_price'],
                        'stock' => $v['stock'],
                        'stock_status' => $v['stock'] > 0 ? 'in_stock' : 'out_of_stock',
                        'sku' => $v['sku'],
                    ]
                );
            }

            if ($product->images()->count() === 0) {
                ProductImage::create([
                    'product_id' => $product->id,
                    'path' => $image,
                    'alt' => $product->name,
                    'sort_order' => 0,
                    'is_primary' => true,
                ]);
            }
        }
    }
}
