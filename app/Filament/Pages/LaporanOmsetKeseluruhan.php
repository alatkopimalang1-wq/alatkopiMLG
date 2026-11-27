<?php

namespace App\Filament\Pages;

use App\Models\Order;
use BackedEnum;
use Carbon\Carbon;
use Filament\Pages\Page;
use Filament\Support\Icons\Heroicon;
use Illuminate\Support\Collection;
use Symfony\Component\HttpFoundation\StreamedResponse;

class LaporanOmsetKeseluruhan extends Page
{
    protected static string|BackedEnum|null $navigationIcon = Heroicon::CurrencyDollar;

    protected static string|\UnitEnum|null $navigationGroup = 'Laporan';

    protected static ?string $navigationLabel = 'Laporan Omset Keseluruhan';

    protected static ?string $title = 'Laporan Omset Keseluruhan (Website, Marketplace & POS)';

    protected static ?string $slug = 'laporan-omset-keseluruhan';

    protected static ?int $navigationSort = 1;

    public string $period = 'this_month'; // daily, custom_range, this_month, custom_month

    public string $selectedDate = '';

    public string $selectedMonth = '';

    public string $startDate = '';

    public string $endDate = '';

    protected string $view = 'filament.pages.laporan-omset-keseluruhan';

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

    public function mount(): void
    {
        $this->selectedDate = now()->toDateString();
        $this->selectedMonth = now()->format('Y-m');
        $this->startDate = now()->startOfMonth()->toDateString();
        $this->endDate = now()->toDateString();
    }

    public function setPeriod(string $period): void
    {
        $this->period = $period;
    }

    /**
     * @return array{0: Carbon, 1: Carbon}
     */
    protected function resolveDateRange(): array
    {
        return match ($this->period) {
            'daily' => [
                $this->selectedDate ? Carbon::parse($this->selectedDate)->startOfDay() : now()->startOfDay(),
                $this->selectedDate ? Carbon::parse($this->selectedDate)->endOfDay() : now()->endOfDay(),
            ],
            'custom_month' => [
                $this->selectedMonth ? Carbon::createFromFormat('Y-m', $this->selectedMonth)->startOfMonth() : now()->startOfMonth(),
                $this->selectedMonth ? Carbon::createFromFormat('Y-m', $this->selectedMonth)->endOfMonth() : now()->endOfMonth(),
            ],
            'custom_range' => [
                $this->startDate ? Carbon::parse($this->startDate)->startOfDay() : now()->startOfMonth(),
                $this->endDate ? Carbon::parse($this->endDate)->endOfDay() : now()->endOfDay(),
            ],
            default => [now()->startOfMonth(), now()->endOfMonth()],
        };
    }

    public function getReportDataProperty(): array
    {
        [$start, $end] = $this->resolveDateRange();

        /** @var Collection<int, Order> $orders */
        $orders = Order::query()
            ->where('payment_status', 'paid')
            ->whereBetween('created_at', [$start, $end])
            ->latest('created_at')
            ->get(['id', 'order_number', 'total_amount', 'payment_details', 'created_at']);

        $websiteTotal = 0.0;
        $websiteCount = 0;
        $marketplaceTotal = 0.0;
        $marketplaceCount = 0;
        $posTotal = 0.0;
        $posCount = 0;

        $dailyMap = [];

        foreach ($orders as $order) {
            $amount = max(0.0, (float) ($order->total_amount ?? 0));
            $dateKey = $order->created_at?->format('Y-m-d') ?? now()->format('Y-m-d');

            if (! isset($dailyMap[$dateKey])) {
                $dailyMap[$dateKey] = [
                    'date_key' => $dateKey,
                    'date_label' => Carbon::parse($dateKey)->translatedFormat('d M Y'),
                    'website' => 0.0,
                    'marketplace' => 0.0,
                    'pos' => 0.0,
                    'transactions' => 0,
                    'total' => 0.0,
                ];
            }

            if ($order->is_pos) {
                $posTotal += $amount;
                $posCount++;
                $dailyMap[$dateKey]['pos'] += $amount;
            } elseif ($order->is_ecommerce) {
                $marketplaceTotal += $amount;
                $marketplaceCount++;
                $dailyMap[$dateKey]['marketplace'] += $amount;
            } else {
                $websiteTotal += $amount;
                $websiteCount++;
                $dailyMap[$dateKey]['website'] += $amount;
            }

            $dailyMap[$dateKey]['transactions']++;
            $dailyMap[$dateKey]['total'] += $amount;
        }

        krsort($dailyMap);
        $grandTotal = $websiteTotal + $marketplaceTotal + $posTotal;
        $totalCount = $websiteCount + $marketplaceCount + $posCount;

        return [
            'period_label' => $start->format('d M Y').' - '.$end->format('d M Y'),
            'grand_total' => $grandTotal,
            'total_count' => $totalCount,
            'website_total' => $websiteTotal,
            'website_count' => $websiteCount,
            'marketplace_total' => $marketplaceTotal,
            'marketplace_count' => $marketplaceCount,
            'pos_total' => $posTotal,
            'pos_count' => $posCount,
            'daily_rows' => array_values($dailyMap),
        ];
    }

    public function exportCsv(): StreamedResponse
    {
        $report = $this->reportData;
        $filename = 'laporan-omset-keseluruhan-'.now()->format('Y-m-d_His').'.csv';

        return response()->streamDownload(function () use ($report) {
            $out = fopen('php://output', 'w');
            fwrite($out, "\xEF\xBB\xBF");

            fputcsv($out, [
                'Tanggal',
                'Omset Website (Rp)',
                'Omset Marketplace (Rp)',
                'Omset POS (Rp)',
                'Total Transaksi',
                'Total Omset (Rp)',
            ]);

            foreach ($report['daily_rows'] as $row) {
                fputcsv($out, [
                    $row['date_label'],
                    (int) round($row['website']),
                    (int) round($row['marketplace']),
                    (int) round($row['pos']),
                    $row['transactions'],
                    (int) round($row['total']),
                ]);
            }

            fputcsv($out, [
                'TOTAL KESELURUHAN',
                (int) round($report['website_total']),
                (int) round($report['marketplace_total']),
                (int) round($report['pos_total']),
                $report['total_count'],
                (int) round($report['grand_total']),
            ]);

            fclose($out);
        }, $filename, [
            'Content-Type' => 'text/csv; charset=UTF-8',
        ]);
    }
}
