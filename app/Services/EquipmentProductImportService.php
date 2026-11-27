<?php

namespace App\Services;

use App\Models\Category;
use App\Models\Product;
use App\Models\ProductImage;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use ZipArchive;

class EquipmentProductImportService
{
    public const HEADERS = [
        'nama_produk',
        'slug',
        'brand',
        'kategori',
        'deskripsi',
        'garansi',
        'status',
        'channel',
        'varian',
        'sku',
        'berat_gram',
        'harga_modal_hpp',
        'harga_jual',
        'harga_coret',
        'stok',
        'preorder',
        'url_gambar',
    ];

    /**
     * Generate UTF-8 BOM CSV template content with example rows.
     */
    public function generateTemplateCsv(): string
    {
        $stream = fopen('php://temp', 'r+');
        // UTF-8 BOM so Microsoft Excel opens columns & encoding properly
        fwrite($stream, "\xEF\xBB\xBF");
        fputcsv($stream, self::HEADERS);

        fputcsv($stream, [
            'Timemore Chestnut C3 Grinder',
            '',
            'Timemore',
            'Grinder Manual',
            'Grinder kopi manual presisi dengan burr stainless steel S2C.',
            '1 Tahun',
            'active',
            'all',
            'Matte Black',
            'AKM-TM-C3-BLK',
            '750',
            '650000',
            '890000',
            '950000',
            '15',
            'tidak',
            '',
        ]);

        fputcsv($stream, [
            'Timemore Chestnut C3 Grinder',
            '',
            'Timemore',
            'Grinder Manual',
            'Grinder kopi manual presisi dengan burr stainless steel S2C.',
            '1 Tahun',
            'active',
            'all',
            'Silver',
            'AKM-TM-C3-SLV',
            '750',
            '650000',
            '890000',
            '',
            '10',
            'tidak',
            '',
        ]);

        fputcsv($stream, [
            'Hario Paper Filter V60 02 (100 Lembar)',
            '',
            'Hario',
            'Filter & Paper',
            'Kertas saring V60 ukuran 02 isi 100 lembar.',
            'Tidak ada',
            'active',
            'all',
            'Standard',
            'AKM-HARIO-PF02',
            '250',
            '45000',
            '68000',
            '',
            '40',
            'tidak',
            '',
        ]);

        rewind($stream);
        $csv = (string) stream_get_contents($stream);
        fclose($stream);

        return $csv;
    }

    /**
     * Generate UTF-8 BOM CSV template specifically structured for multi-variant products.
     */
    public function generateVariantTemplateCsv(): string
    {
        $stream = fopen('php://temp', 'r+');
        fwrite($stream, "\xEF\xBB\xBF");
        fputcsv($stream, self::HEADERS);

        // Contoh Produk 1: 3 Varian Warna
        foreach ([
            ['Matte Black', 'AKM-FELLOW-STAGG-BLK', '1250', '2100000', '2650000', '2850000', '5'],
            ['Warm White', 'AKM-FELLOW-STAGG-WHT', '1250', '2100000', '2650000', '2850000', '3'],
            ['Brushed Steel', 'AKM-FELLOW-STAGG-STL', '1250', '2050000', '2550000', '', '4'],
        ] as [$varian, $sku, $berat, $hpp, $jual, $coret, $stok]) {
            fputcsv($stream, [
                'Fellow Stagg EKG Electric Kettle',
                '',
                'Fellow',
                'Kettle & Scale',
                'Teko leher angsa elektrik dengan kontrol suhu presisi PID.',
                '1 Tahun',
                'active',
                'all',
                $varian,
                $sku,
                $berat,
                $hpp,
                $jual,
                $coret,
                $stok,
                'tidak',
                '',
            ]);
        }

        // Contoh Produk 2: 2 Varian Kapasitas / Ukuran
        foreach ([
            ['360 ml', 'AKM-OTC-SERVER-360', '350', '45000', '75000', '', '12'],
            ['600 ml', 'AKM-OTC-SERVER-600', '450', '58000', '95000', '110000', '8'],
        ] as [$varian, $sku, $berat, $hpp, $jual, $coret, $stok]) {
            fputcsv($stream, [
                'One Two Cups Coffee Server Glass',
                '',
                'One Two Cups',
                'Manual Brew',
                'Server kopi kaca borosilikat tahan panas untuk seduh V60.',
                '1 minggu',
                'active',
                'all',
                $varian,
                $sku,
                $berat,
                $hpp,
                $jual,
                $coret,
                $stok,
                'tidak',
                '',
            ]);
        }

        rewind($stream);
        $csv = (string) stream_get_contents($stream);
        fclose($stream);

        return $csv;
    }

    /**
     * Import products and variants from a CSV or XLSX file path.
     *
     * @return array{created: int, updated: int, variants: int, skipped: int}
     */
    public function importFromFile(string $filePath, bool $updateExisting = true): array
    {
        $ext = strtolower(pathinfo($filePath, PATHINFO_EXTENSION));
        $rawRows = $ext === 'xlsx'
            ? $this->parseXlsx($filePath)
            : $this->parseCsv($filePath);

        if (count($rawRows) < 2) {
            return ['created' => 0, 'updated' => 0, 'variants' => 0, 'skipped' => 0];
        }

        $headerMap = $this->buildHeaderMap(array_shift($rawRows));
        $grouped = [];
        $skipped = 0;

        foreach ($rawRows as $row) {
            $assoc = $this->mapRow($row, $headerMap);
            $name = trim((string) ($assoc['nama_produk'] ?? ''));
            if ($name === '') {
                $skipped++;

                continue;
            }

            $slugInput = trim((string) ($assoc['slug'] ?? ''));
            $groupKey = $slugInput !== '' ? Str::slug($slugInput) : Str::slug($name);
            if ($groupKey === '') {
                $skipped++;

                continue;
            }

            $grouped[$groupKey][] = $assoc;
        }

        $categories = Category::all();
        $defaultCategory = Category::where('slug', 'alat-kopi')->first();

        $createdCount = 0;
        $updatedCount = 0;
        $variantsCount = 0;

        DB::transaction(function () use (
            $grouped,
            $updateExisting,
            $categories,
            $defaultCategory,
            &$createdCount,
            &$updatedCount,
            &$variantsCount
        ) {
            foreach ($grouped as $groupKey => $rows) {
                $first = $rows[0];
                $name = trim((string) $first['nama_produk']);
                $slug = trim((string) ($first['slug'] ?? '')) !== ''
                    ? Str::slug((string) $first['slug'])
                    : $groupKey;

                $existing = Product::where('slug', $slug)->first()
                    ?? Product::whereRaw('LOWER(name) = ?', [mb_strtolower($name)])->first();

                if ($existing && ! $updateExisting) {
                    continue;
                }

                $isPreorder = $this->parseBool($first['preorder'] ?? 'tidak');
                $status = in_array(strtolower(trim((string) ($first['status'] ?? 'active'))), ['active', 'archived'], true)
                    ? strtolower(trim((string) $first['status']))
                    : 'active';
                $channel = in_array(strtolower(trim((string) ($first['channel'] ?? 'all'))), ['all', 'web', 'pos'], true)
                    ? strtolower(trim((string) $first['channel']))
                    : 'all';
                $warranty = trim((string) ($first['garansi'] ?? '')) ?: 'Tidak ada';
                $description = trim((string) ($first['deskripsi'] ?? ''));
                $brand = trim((string) ($first['brand'] ?? ''));

                $productData = [
                    'name' => $name,
                    'series' => 'alat-kopi',
                    'origin' => $brand !== '' ? $brand : null,
                    'description' => $description !== '' ? $description : ($existing?->description ?? null),
                    'short_description' => $description !== '' ? Str::limit($description, 160) : ($existing?->short_description ?? null),
                    'warranty' => $warranty,
                    'status' => $status,
                    'channel' => $channel,
                    'is_preorder' => $isPreorder,
                    'preorder_dp_percent' => $isPreorder ? 50 : 100,
                    'freshness_days' => 365,
                ];

                if ($existing) {
                    $existing->update($productData);
                    $product = $existing;
                    $updatedCount++;
                } else {
                    $uniqueSlug = $slug;
                    $suffix = 1;
                    while (Product::where('slug', $uniqueSlug)->exists()) {
                        $uniqueSlug = "{$slug}-{$suffix}";
                        $suffix++;
                    }
                    $product = Product::create(array_merge($productData, [
                        'slug' => $uniqueSlug,
                        'min_price' => 0,
                        'max_price' => 0,
                        'stock' => 0,
                        'stock_status' => $isPreorder ? 'pre_order' : 'out_of_stock',
                        'released_at' => now(),
                    ]));
                    $createdCount++;
                }

                // Sync categories
                $catIds = $this->resolveCategoryIds((string) ($first['kategori'] ?? ''), $categories, $defaultCategory);
                if (! empty($catIds)) {
                    $product->categories()->sync($catIds);
                }

                // Upsert variants
                foreach ($rows as $row) {
                    $label = trim((string) ($row['varian'] ?? ''));
                    if ($label === '') {
                        $label = 'Standard';
                    }

                    $price = $this->parseNumber($row['harga_jual'] ?? 0);
                    $costPrice = filled($row['harga_modal_hpp'] ?? null)
                        ? $this->parseNumber($row['harga_modal_hpp'])
                        : null;
                    $originalPrice = filled($row['harga_coret'] ?? null)
                        ? $this->parseNumber($row['harga_coret'])
                        : null;
                    $weightGrams = max(1, (int) ($this->parseNumber($row['berat_gram'] ?? 500) ?: 500));
                    $stock = max(0, (int) $this->parseNumber($row['stok'] ?? 0));
                    $sku = trim((string) ($row['sku'] ?? ''));

                    $stockStatus = $isPreorder
                        ? 'pre_order'
                        : ($stock > 0 ? 'in_stock' : 'out_of_stock');

                    $product->variants()->updateOrCreate(
                        ['label' => $label],
                        [
                            'weight_grams' => $weightGrams,
                            'price' => $price,
                            'cost_price' => $costPrice,
                            'original_price' => $originalPrice,
                            'stock' => $stock,
                            'stock_status' => $stockStatus,
                            'sku' => $sku !== '' ? $sku : null,
                        ]
                    );
                    $variantsCount++;
                }

                $product->syncPricesFromVariants();
                $product->syncStockFromVariants();

                $imageUrl = trim((string) ($first['url_gambar'] ?? ''));
                if ($imageUrl !== '' && filter_var($imageUrl, FILTER_VALIDATE_URL)) {
                    $this->attachImageFromUrl($product, $imageUrl);
                }

                $product->ensurePrimaryImage();
            }
        });

        return [
            'created' => $createdCount,
            'updated' => $updatedCount,
            'variants' => $variantsCount,
            'skipped' => $skipped,
        ];
    }

    protected function parseCsv(string $filePath): array
    {
        $content = file_get_contents($filePath);
        if ($content === false) {
            return [];
        }

        // Strip UTF-8 BOM if present
        $content = preg_replace('/^\xEF\xBB\xBF/', '', $content);
        $lines = preg_split('/\r\n|\r|\n/', $content);
        $firstLine = $lines[0] ?? '';
        $delimiter = substr_count($firstLine, ';') > substr_count($firstLine, ',') ? ';' : ',';

        $rows = [];
        $handle = fopen('php://temp', 'r+');
        fwrite($handle, $content);
        rewind($handle);

        while (($data = fgetcsv($handle, 0, $delimiter)) !== false) {
            if (count($data) === 1 && trim((string) $data[0]) === '') {
                continue;
            }
            $rows[] = $data;
        }
        fclose($handle);

        return $rows;
    }

    protected function parseXlsx(string $filePath): array
    {
        $zip = new ZipArchive();
        if ($zip->open($filePath) !== true) {
            return [];
        }

        $sharedStrings = [];
        $ssXml = $zip->getFromName('xl/sharedStrings.xml');
        if ($ssXml !== false) {
            $xml = @simplexml_load_string($ssXml);
            if ($xml && isset($xml->si)) {
                foreach ($xml->si as $si) {
                    if (isset($si->t)) {
                        $sharedStrings[] = (string) $si->t;
                    } elseif (isset($si->r)) {
                        $text = '';
                        foreach ($si->r as $r) {
                            $text .= (string) ($r->t ?? '');
                        }
                        $sharedStrings[] = $text;
                    } else {
                        $sharedStrings[] = '';
                    }
                }
            }
        }

        $sheetXml = $zip->getFromName('xl/worksheets/sheet1.xml');
        $zip->close();
        if ($sheetXml === false) {
            return [];
        }

        $xml = @simplexml_load_string($sheetXml);
        if (! $xml || ! isset($xml->sheetData->row)) {
            return [];
        }

        $rows = [];
        foreach ($xml->sheetData->row as $row) {
            $rowData = [];
            foreach ($row->c as $c) {
                $ref = (string) $c['r'];
                $colLetters = preg_replace('/\d+/', '', $ref);
                $colIdx = $this->colLettersToIndex($colLetters);
                $type = (string) $c['t'];

                if ($type === 's') {
                    $idx = (int) $c->v;
                    $val = $sharedStrings[$idx] ?? '';
                } elseif ($type === 'inlineStr') {
                    $val = (string) ($c->is->t ?? '');
                } else {
                    $val = (string) ($c->v ?? '');
                }

                while (count($rowData) < $colIdx) {
                    $rowData[] = '';
                }
                $rowData[$colIdx] = $val;
            }
            if (! empty(array_filter($rowData, fn ($v) => trim((string) $v) !== ''))) {
                $rows[] = $rowData;
            }
        }

        return $rows;
    }

    protected function colLettersToIndex(string $letters): int
    {
        $letters = strtoupper($letters);
        $index = 0;
        for ($i = 0; $i < strlen($letters); $i++) {
            $index = $index * 26 + (ord($letters[$i]) - ord('A') + 1);
        }

        return max(0, $index - 1);
    }

    protected function buildHeaderMap(array $headerRow): array
    {
        $map = [];
        foreach ($headerRow as $idx => $col) {
            $norm = Str::slug(trim((string) $col), '_');
            if ($norm !== '') {
                $map[$norm] = $idx;
            }
        }

        return $map;
    }

    protected function mapRow(array $row, array $headerMap): array
    {
        $assoc = [];
        foreach (self::HEADERS as $key) {
            $idx = $headerMap[$key] ?? null;
            $assoc[$key] = $idx !== null ? ($row[$idx] ?? '') : '';
        }

        return $assoc;
    }

    protected function parseNumber(mixed $val): float
    {
        if (is_int($val) || is_float($val)) {
            return (float) $val;
        }
        $clean = preg_replace('/[^\d.]/', '', str_replace(',', '', (string) $val));

        return (float) ($clean ?: 0);
    }

    protected function parseBool(mixed $val): bool
    {
        $v = strtolower(trim((string) $val));

        return in_array($v, ['1', 'true', 'ya', 'yes', 'y'], true);
    }

    protected function resolveCategoryIds(string $raw, $categories, ?Category $defaultCategory): array
    {
        $ids = [];
        $parts = array_filter(array_map('trim', explode(',', $raw)));

        foreach ($parts as $part) {
            $needle = mb_strtolower($part);
            $needleSlug = Str::slug($part);

            $found = $categories->first(function (Category $cat) use ($needle, $needleSlug) {
                if (mb_strtolower((string) $cat->slug) === $needleSlug) {
                    return true;
                }
                if (is_array($cat->name)) {
                    foreach ($cat->name as $n) {
                        if (mb_strtolower((string) $n) === $needle) {
                            return true;
                        }
                    }
                } elseif (mb_strtolower((string) $cat->name) === $needle) {
                    return true;
                }

                return false;
            });

            if ($found) {
                $ids[] = $found->id;
            }
        }

        if (empty($ids) && $defaultCategory) {
            $ids[] = $defaultCategory->id;
        }

        return array_values(array_unique($ids));
    }

    protected function attachImageFromUrl(Product $product, string $url): void
    {
        try {
            $resp = Http::timeout(8)->get($url);
            if (! $resp->successful()) {
                return;
            }
            $ext = pathinfo(parse_url($url, PHP_URL_PATH) ?: '', PATHINFO_EXTENSION) ?: 'jpg';
            if (! in_array(strtolower($ext), ['jpg', 'jpeg', 'png', 'webp'], true)) {
                $ext = 'jpg';
            }
            $filename = 'products/'.Str::slug($product->name).'-'.Str::random(6).'.'.$ext;
            Storage::disk('public')->put($filename, $resp->body());

            ProductImage::create([
                'product_id' => $product->id,
                'path' => $filename,
                'is_primary' => $product->images()->count() === 0,
                'sort_order' => $product->images()->count(),
            ]);
        } catch (\Throwable) {
            // Ignore image download failures so row import still succeeds
        }
    }
}
