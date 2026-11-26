<?php

namespace App\Filament\Pages;

use App\Models\ProductVariant;
use BackedEnum;
use Filament\Pages\Page;
use Filament\Support\Icons\Heroicon;
use Illuminate\Support\Collection;
use Symfony\Component\HttpFoundation\StreamedResponse;

class LaporanStokProduk extends Page
{
    protected static string|BackedEnum|null $navigationIcon = Heroicon::Cube;

    protected static string|\UnitEnum|null $navigationGroup = 'Laporan';

    protected static ?string $navigationLabel = 'Laporan Stok Produk';

    protected static ?string $title = 'Laporan Stok & Nilai Persediaan Produk';

    protected static ?string $slug = 'laporan-stok-produk';

    protected static ?int $navigationSort = 4;

    public string $search = '';

    public string $stockFilter = 'all'; // all, in_stock, low_stock, out_of_stock

    protected string $view = 'filament.pages.laporan-stok-produk';

    public static function canAccess(): bool
    {
        /** @var \App\Models\User|null $user */
        $user = auth()->user();

        return (bool) ($user?->canViewReports());
    }

    public static function shouldRegisterNavigation(): bool
    {
        return static::canAccess();
    }

    public function getMaxContentWidth(): ?string
    {
        return 'full';
    }

    /**
     * All non-preorder product variants with product & stock valuation.
     */
    public function getRowsProperty(): Collection
    {
        $search = trim(mb_strtolower($this->search));

        return ProductVariant::query()
            ->with(['product' => fn ($q) => $q->select(['id', 'name', 'origin', 'series', 'is_preorder', 'stock_status', 'status'])])
            ->whereHas('product', function ($q) {
                $q->where(fn ($pq) => $pq->where('is_preorder', false)->orWhereNull('is_preorder'))
                    ->where(fn ($pq) => $pq->where('stock_status', '!=', 'pre_order')->orWhereNull('stock_status'));
            })
            ->get()
            ->filter(function (ProductVariant $variant) use ($search) {
                $stock = max(0, (int) ($variant->stock ?? 0));

                if ($this->stockFilter === 'in_stock' && $stock <= 0) {
                    return false;
                }
                if ($this->stockFilter === 'low_stock' && ($stock <= 0 || $stock > 5)) {
                    return false;
                }
                if ($this->stockFilter === 'out_of_stock' && $stock > 0) {
                    return false;
                }

                if ($search !== '') {
                    $haystack = mb_strtolower(implode(' ', array_filter([
                        $variant->product?->name,
                        $variant->product?->origin,
                        $variant->label,
                        $variant->sku,
                    ])));

                    if (! str_contains($haystack, $search)) {
                        return false;
                    }
                }

                return true;
            })
            ->sortBy([
                fn (ProductVariant $a, ProductVariant $b) => strcmp((string) $a->product?->name, (string) $b->product?->name),
                fn (ProductVariant $a, ProductVariant $b) => $a->id <=> $b->id,
            ])
            ->map(function (ProductVariant $variant) {
                $stock = max(0, (int) ($variant->stock ?? 0));
                $buyPrice = max(0.0, (float) ($variant->cost_price ?? 0));
                $sellPrice = max(0.0, (float) ($variant->price ?? 0));

                return [
                    'id' => $variant->id,
                    'product_id' => $variant->product_id,
                    'product_name' => $variant->product?->name ?? '-',
                    'brand' => $variant->product?->origin ?: '-',
                    'variant_label' => $variant->label ?: 'Standard',
                    'sku' => $variant->sku ?: '-',
                    'stock' => $stock,
                    'buy_price' => $buyPrice,
                    'sell_price' => $sellPrice,
                    'total_buy_value' => $stock * $buyPrice,
                    'total_sell_value' => $stock * $sellPrice,
                ];
            })
            ->values();
    }

    public function getSummaryProperty(): array
    {
        $rows = $this->rows;

        $totalVariants = $rows->count();
        $totalStock = (int) $rows->sum('stock');
        $totalBuyValue = (float) $rows->sum('total_buy_value');
        $totalSellValue = (float) $rows->sum('total_sell_value');

        return [
            'total_variants' => $totalVariants,
            'total_stock' => $totalStock,
            'total_buy_value' => $totalBuyValue,
            'total_sell_value' => $totalSellValue,
            'potential_profit' => max(0.0, $totalSellValue - $totalBuyValue),
        ];
    }

    public function exportCsv(): StreamedResponse
    {
        $rows = $this->rows;
        $summary = $this->summary;
        $filename = 'laporan-stok-produk-' . now()->format('Y-m-d_His') . '.csv';

        return response()->streamDownload(function () use ($rows, $summary) {
            $out = fopen('php://output', 'w');
            // UTF-8 BOM for Excel
            fwrite($out, "\xEF\xBB\xBF");

            fputcsv($out, [
                'No',
                'Produk',
                'Brand',
                'Variasi',
                'SKU',
                'Stok',
                'Harga Beli (Rp)',
                'Harga Jual (Rp)',
                'Total Harga Beli (Rp)',
                'Total Harga Jual (Rp)',
            ]);

            foreach ($rows as $idx => $row) {
                fputcsv($out, [
                    $idx + 1,
                    $row['product_name'],
                    $row['brand'],
                    $row['variant_label'],
                    $row['sku'],
                    $row['stock'],
                    (int) round($row['buy_price']),
                    (int) round($row['sell_price']),
                    (int) round($row['total_buy_value']),
                    (int) round($row['total_sell_value']),
                ]);
            }

            fputcsv($out, [
                '',
                'TOTAL',
                '',
                '',
                '',
                $summary['total_stock'],
                '',
                '',
                (int) round($summary['total_buy_value']),
                (int) round($summary['total_sell_value']),
            ]);

            fclose($out);
        }, $filename, [
            'Content-Type' => 'text/csv; charset=UTF-8',
        ]);
    }
}
