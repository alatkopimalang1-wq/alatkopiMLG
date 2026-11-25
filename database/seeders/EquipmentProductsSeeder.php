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
        // 1. Hapus semua produk biji kopi (non-alat-kopi) beserta varian & gambarnya
        $coffeeBeanIds = Product::where(function ($q) {
            $q->whereNull('series')->orWhere('series', '!=', 'alat-kopi');
        })->pluck('id');

        if ($coffeeBeanIds->isNotEmpty()) {
            ProductVariant::whereIn('product_id', $coffeeBeanIds)->delete();
            ProductImage::whereIn('product_id', $coffeeBeanIds)->delete();
            Product::whereIn('id', $coffeeBeanIds)->each(function (Product $p) {
                $p->categories()->detach();
                $p->delete();
            });
        }

        // 2. Siapkan kategori khusus Alat Kopi & hapus semua kategori biji kopi
        $equipmentCategoriesData = [
            [
                'slug' => 'alat-kopi',
                'name' => ['id' => 'Semua Alat Kopi', 'en' => 'All Coffee Equipment'],
                'type' => 'equipment',
                'description' => [
                    'id' => 'Peralatan seduh manual, grinder, timbangan digital, dan perlengkapan barista.',
                    'en' => 'Manual brewers, grinders, digital scales, and barista equipment.',
                ],
                'icon' => 'wrench',
                'sort_order' => 1,
            ],
            [
                'slug' => 'manual-brew',
                'name' => ['id' => 'Manual Brew & Dripper', 'en' => 'Manual Brew & Dripper'],
                'type' => 'equipment',
                'description' => [
                    'id' => 'V60 dripper, AeroPress, Moka Pot, Kalita Wave, dan server kaca.',
                    'en' => 'V60 drippers, AeroPress, Moka Pots, Kalita Wave, and glass servers.',
                ],
                'icon' => 'coffee',
                'sort_order' => 2,
            ],
            [
                'slug' => 'grinder',
                'name' => ['id' => 'Coffee Grinder', 'en' => 'Coffee Grinder'],
                'type' => 'equipment',
                'description' => [
                    'id' => 'Grinder manual dan elektrik presisi untuk seduh manual maupun espresso.',
                    'en' => 'Precision manual and electric coffee grinders.',
                ],
                'icon' => 'cog',
                'sort_order' => 3,
            ],
            [
                'slug' => 'kettle-scale',
                'name' => ['id' => 'Kettle & Timbangan', 'en' => 'Kettle & Scale'],
                'type' => 'equipment',
                'description' => [
                    'id' => 'Ketel leher angsa dan timbangan kopi digital presisi 0.1g.',
                    'en' => 'Gooseneck kettles and 0.1g digital coffee scales.',
                ],
                'icon' => 'scale',
                'sort_order' => 4,
            ],
            [
                'slug' => 'espresso-tools',
                'name' => ['id' => 'Aksesori Espresso', 'en' => 'Espresso Accessories'],
                'type' => 'equipment',
                'description' => [
                    'id' => 'Tamper, distributor, portafilter, knock box, dan perlengkapan bar.',
                    'en' => 'Tampers, distributors, portafilters, knock boxes, and bar tools.',
                ],
                'icon' => 'sparkles',
                'sort_order' => 5,
            ],
        ];

        $categoriesBySlug = [];
        foreach ($equipmentCategoriesData as $catData) {
            $slug = $catData['slug'];
            unset($catData['slug']);
            $categoriesBySlug[$slug] = Category::updateOrCreate(['slug' => $slug], $catData);
        }

        // Hapus kategori biji kopi lama
        $coffeeCategories = Category::whereNotIn('slug', array_keys($categoriesBySlug))->get();
        foreach ($coffeeCategories as $oldCat) {
            $oldCat->products()->detach();
            $oldCat->delete();
        }

        // 3. Perbarui pengaturan seri & menu ke Alat Kopi saja
        Setting::set('product_series', [
            [
                'name' => 'Alat Kopi & Seduh',
                'slug' => 'alat-kopi',
                'description' => 'Peralatan seduh manual, grinder, timbangan digital, dan aksesori barista.',
                'badge_color' => 'info',
                'is_active' => true,
            ],
        ]);

        // Bersihkan item flash sale / new release / back in stock yang masih merujuk biji kopi
        Setting::set('home_flash_sale_items', []);
        Setting::set('home_new_release_items', []);
        Setting::set('home_back_in_stock_items', []);

        // 4. Seed 8 produk sample alat kopi
        $items = [
            [
                'name' => 'Hario V60 Ceramic Dripper 02',
                'slug' => 'hario-v60-ceramic-dripper-02',
                'category_slugs' => ['alat-kopi', 'manual-brew'],
                'tagline' => [
                    'id' => 'Dripper keramik V60 klasik dengan alur spiral untuk ekstraksi optimal',
                    'en' => 'Classic V60 ceramic dripper with spiral ribs for clean extraction',
                ],
                'short_description' => 'Dripper pour over berbahan porselen Arita-yaki yang menjaga stabilitas suhu seduh.',
                'description' => [
                    'id' => 'Hario V60 Ceramic Dripper adalah standar emas untuk seduh manual pour over. Material keramik porselen menjaga suhu air tetap stabil selama proses ekstraksi, sementara alur spiral di bagian dalam memaksimalkan aliran udara agar kopi menghasilkan rasa yang bersih dan manis.',
                    'en' => 'The Hario V60 Ceramic Dripper is the gold standard for manual pour-over brewing.',
                ],
                'origin' => 'Hario',
                'warranty' => 'Tidak ada',
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
                'category_slugs' => ['alat-kopi', 'grinder'],
                'tagline' => [
                    'id' => 'Grinder manual presisi dengan S2C stainless steel burr 38mm',
                    'en' => 'Precision manual coffee grinder with 38mm S2C stainless steel burrs',
                ],
                'short_description' => 'Grinder tangan berbahan aluminium alloy CNC dengan hasil gilingan konsisten dari espresso hingga french press.',
                'description' => [
                    'id' => 'Timemore Chestnut C3 dilengkapi S2C (Spike to Cut) burr 38mm yang memotong biji kopi lebih cepat dan seragam dengan minim fine particles. Bodi bertekstur anti-slip berbahan aluminium alloy membuatnya nyaman digenggam dan kokoh untuk pemakaian harian.',
                    'en' => 'Timemore Chestnut C3 features 38mm S2C stainless steel burrs for fast, uniform grinding.',
                ],
                'origin' => 'Timemore',
                'warranty' => '1 Tahun',
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
                'category_slugs' => ['alat-kopi', 'kettle-scale'],
                'tagline' => [
                    'id' => 'Timbangan kopi digital responsif 0.1g dengan auto-timer & flow rate',
                    'en' => 'Responsive 0.1g digital coffee scale with auto-timer and flow rate',
                ],
                'short_description' => 'Timbangan digital USB-C rechargeable dengan sensor presisi 0.1 gram dan indikator flow rate.',
                'description' => [
                    'id' => 'Timbangan digital Timemore Black Mirror Basic 2.0 hadir dengan respons cepat, akurasi 0.1 gram, fitur auto-timer saat air mulai dituang, serta tampilan LED tersembunyi yang elegan. Dilengkapi bantalan silikon tahan panas dan baterai rechargeable via USB-C.',
                    'en' => 'Timemore Black Mirror Basic 2.0 provides 0.1g precision, auto-timer, and flow-rate display.',
                ],
                'origin' => 'Timemore',
                'warranty' => '1 Tahun',
                'image' => 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=900&q=80',
                'is_featured' => true,
                'is_new' => true,
                'variants' => [
                    ['label' => 'Standard', 'weight_grams' => 380, 'price' => 650000, 'cost_price' => 495000, 'stock' => 18, 'sku' => 'AKM-TM-SCALE-BLK'],
                ],
            ],
            [
                'name' => 'Gooseneck Pour Over Kettle 600ml',
                'slug' => 'gooseneck-pour-over-kettle-600ml',
                'category_slugs' => ['alat-kopi', 'kettle-scale'],
                'tagline' => [
                    'id' => 'Teko leher angsa 600ml dengan termometer tutup untuk tuangan presisi',
                    'en' => '600ml gooseneck pour-over kettle with lid thermometer',
                ],
                'short_description' => 'Ketel leher angsa stainless steel 304 dengan aliran air stabil dan termometer analog terintegrasi.',
                'description' => [
                    'id' => 'Dirancang khusus untuk penyeduhan manual brew seperti V60 dan Kalita Wave. Leher angsa ramping memberikan kontrol penuh atas kecepatan dan arah aliran air, dilengkapi termometer pada tutup agar suhu seduh selalu tepat di kisaran 88°C–94°C.',
                    'en' => 'Designed for manual pour-over brewing with steady flow control.',
                ],
                'origin' => 'Alat Kopi Malang',
                'warranty' => '6 Bulan',
                'image' => 'https://images.unsplash.com/photo-1442512595331-e89e73853f31?auto=format&fit=crop&w=900&q=80',
                'is_featured' => false,
                'is_new' => false,
                'variants' => [
                    ['label' => 'Matte Black 600ml', 'weight_grams' => 600, 'price' => 285000, 'cost_price' => 205000, 'stock' => 20, 'sku' => 'AKM-KETTLE-600-BLK'],
                    ['label' => 'Brushed Silver 600ml', 'weight_grams' => 600, 'price' => 275000, 'cost_price' => 195000, 'stock' => 12, 'sku' => 'AKM-KETTLE-600-SLV'],
                ],
            ],
            [
                'name' => 'AeroPress Coffee Maker Original',
                'slug' => 'aeropress-coffee-maker-original',
                'category_slugs' => ['alat-kopi', 'manual-brew'],
                'tagline' => [
                    'id' => 'Alat seduh kopi portabel cepat, bersih, dan bebas ampas',
                    'en' => 'Portable rapid immersion coffee brewer',
                ],
                'short_description' => 'Pembuat kopi berbasis tekanan udara yang ringkas, tahan banting, dan cocok untuk rumah maupun traveling.',
                'description' => [
                    'id' => 'AeroPress memadukan teknik immersion dan tekanan udara untuk menghasilkan secangkir kopi yang kaya rasa namun tetap bersih tanpa ampas dalam waktu kurang dari 2 menit. Paket sudah termasuk 100 lembar paper filter, scoop, dan stirrer.',
                    'en' => 'AeroPress combines immersion and gentle air pressure for smooth, grit-free coffee.',
                ],
                'origin' => 'AeroPress',
                'warranty' => '1 Tahun',
                'image' => 'https://images.unsplash.com/photo-1511920170033-f8396924c348?auto=format&fit=crop&w=900&q=80',
                'is_featured' => true,
                'is_new' => true,
                'variants' => [
                    ['label' => 'Standard', 'weight_grams' => 450, 'price' => 590000, 'cost_price' => 450000, 'stock' => 14, 'sku' => 'AKM-AEROPRESS-ORG'],
                ],
            ],
            [
                'name' => 'Bialetti Moka Express 3 Cup',
                'slug' => 'bialetti-moka-express-3-cup',
                'category_slugs' => ['alat-kopi', 'manual-brew'],
                'tagline' => [
                    'id' => 'Moka pot klasik Italia berbahan aluminium food grade',
                    'en' => 'Classic Italian aluminum stovetop espresso maker',
                ],
                'short_description' => 'Moka pot ikonik buatan Italia untuk menyeduh kopi pekat ala espresso langsung di atas kompor.',
                'description' => [
                    'id' => 'Bialetti Moka Express adalah ikon kopi rumahan sejak 1933. Terbuat dari aluminium berkualitas tinggi dengan katup pengaman paten Bialetti, mampu menghasilkan 3 cangkir kopi pekat beraroma khas untuk dinikmati langsung atau dicampur susu.',
                    'en' => 'Iconic Italian stovetop coffee maker crafted from durable cast aluminum.',
                ],
                'origin' => 'Bialetti',
                'warranty' => '6 Bulan',
                'image' => 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=900&q=80',
                'is_featured' => false,
                'is_new' => false,
                'variants' => [
                    ['label' => 'Standard', 'weight_grams' => 550, 'price' => 540000, 'cost_price' => 410000, 'stock' => 12, 'sku' => 'AKM-BIALETTI-3C'],
                ],
            ],
            [
                'name' => 'Kalita Wave 185 Stainless Dripper',
                'slug' => 'kalita-wave-185-stainless-dripper',
                'category_slugs' => ['alat-kopi', 'manual-brew'],
                'tagline' => [
                    'id' => 'Dripper flat-bottom stainless steel untuk ekstraksi manis dan seimbang',
                    'en' => 'Flat-bottom stainless steel pour-over dripper',
                ],
                'short_description' => 'Dripper berdesain dasar rata dengan tiga lubang ekstraksi yang konsisten dan mudah dikendalikan.',
                'description' => [
                    'id' => 'Kalita Wave 185 berbahan stainless steel tahan pecah dan sangat ideal untuk pemula maupun barista profesional. Desain flat-bottom dengan 3 lubang kecil memastikan aliran air merata sehingga menghasilkan karakter body yang lebih bulat dan manis.',
                    'en' => 'Shatterproof stainless steel flat-bottom dripper for balanced extraction.',
                ],
                'origin' => 'Kalita',
                'warranty' => 'Tidak ada',
                'image' => 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=900&q=80',
                'is_featured' => false,
                'is_new' => true,
                'variants' => [
                    ['label' => 'Standard', 'weight_grams' => 320, 'price' => 380000, 'cost_price' => 290000, 'stock' => 16, 'sku' => 'AKM-KALITA-185-SS'],
                ],
            ],
            [
                'name' => 'Tamper Espresso Calibrated 58mm',
                'slug' => 'tamper-espresso-calibrated-58mm',
                'category_slugs' => ['alat-kopi', 'espresso-tools'],
                'tagline' => [
                    'id' => 'Tamper pegas kalibrasi 30 lbs berbahan stainless steel 304',
                    'en' => 'Calibrated spring-loaded 58mm espresso tamper',
                ],
                'short_description' => 'Tamper espresso dengan mekanisme pegas terkalibrasi agar tekanan tamping selalu rata dan konsisten.',
                'description' => [
                    'id' => 'Dilengkapi pegas internal yang memberikan tekanan konsisten 30 lbs serta bibir penahan agar posisi tamper selalu lurus di dalam portafilter 58mm. Dasar flat stainless steel 304 mudah dibersihkan dan tahan karat.',
                    'en' => 'Spring-loaded calibrated tamper for consistent 30 lb espresso tamping.',
                ],
                'origin' => 'One Two Cups',
                'warranty' => '1 minggu',
                'image' => 'https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?auto=format&fit=crop&w=900&q=80',
                'is_featured' => true,
                'is_new' => false,
                'variants' => [
                    ['label' => 'Standard', 'weight_grams' => 420, 'price' => 225000, 'cost_price' => 155000, 'stock' => 25, 'sku' => 'AKM-TAMPER-58-BLK'],
                ],
            ],
        ];

        $createdIds = [];
        foreach ($items as $item) {
            $variants = $item['variants'];
            $image = $item['image'];
            $catSlugs = $item['category_slugs'];
            unset($item['variants'], $item['image'], $item['category_slugs']);

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

            $createdIds[] = $product->id;

            $catIds = collect($catSlugs)->map(fn ($s) => $categoriesBySlug[$s]->id)->all();
            $product->categories()->sync($catIds);

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

        // Set produk rekomendasi halaman awal ke produk alat kopi
        Setting::set('home_rec_product_ids', array_slice($createdIds, 0, 6));
    }
}
