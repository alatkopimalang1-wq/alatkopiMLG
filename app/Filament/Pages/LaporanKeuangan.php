<?php

namespace App\Filament\Pages;

use App\Models\Order;
use BackedEnum;
use Carbon\Carbon;
use Filament\Pages\Page;
use Filament\Support\Icons\Heroicon;
use Illuminate\Support\Collection;
use Symfony\Component\HttpFoundation\StreamedResponse;

class LaporanKeuangan extends Page
{
    protected static string|BackedEnum|null $navigationIcon = Heroicon::Banknotes;

    protected static string|\UnitEnum|null $navigationGroup = 'Laporan';

    protected static ?string $navigationLabel = 'Laporan Keuangan';

    protected static ?string $title = 'Laporan Keuangan (Kas Rekening & Tunai)';

    protected static ?string $slug = 'laporan-keuangan';

    protected static ?int $navigationSort = 5;

    public string $period = 'all'; // all, today, yesterday, this_month, last_month, custom_range

    public string $startDate = '';

    public string $endDate = '';

    public string $cashTypeFilter = 'all'; // all, rekening, tunai

    public string $channelFilter = 'all'; // all, pos, web, marketplace

    public string $search = '';

    protected string $view = 'filament.pages.laporan-keuangan';

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
        $this->startDate = now()->startOfMonth()->toDateString();
        $this->endDate = now()->toDateString();
    }

    public function setPeriod(string $period): void
    {
        $this->period = $period;
    }

    /**
     * Resolve period date range, or null for all-time.
     *
     * @return array{0: Carbon, 1: Carbon}|null
     */
    protected function resolveDateRange(): ?array
    {
        return match ($this->period) {
            'today' => [now()->startOfDay(), now()->endOfDay()],
            'yesterday' => [now()->subDay()->startOfDay(), now()->subDay()->endOfDay()],
            'this_month' => [now()->startOfMonth(), now()->endOfDay()],
            'last_month' => [now()->subMonthNoOverflow()->startOfMonth(), now()->subMonthNoOverflow()->endOfMonth()],
            'custom_range' => [
                $this->startDate ? Carbon::parse($this->startDate)->startOfDay() : now()->startOfMonth(),
                $this->endDate ? Carbon::parse($this->endDate)->endOfDay() : now()->endOfDay(),
            ],
            default => null,
        };
    }

    public function getReportDataProperty(): array
    {
        $query = Order::query()->where('payment_status', 'paid');

        $range = $this->resolveDateRange();
        if ($range !== null) {
            $query->whereBetween('created_at', $range);
        }

        /** @var Collection<int, Order> $orders */
        $orders = $query->latest('created_at')->get();

        $rekeningTotal = 0.0;
        $rekeningCount = 0;
        $rekeningByChannel = [
            'pos' => 0.0,
            'web' => 0.0,
            'marketplace' => 0.0,
        ];

        $tunaiTotal = 0.0;
        $tunaiCount = 0;
        $tunaiByChannel = [
            'pos' => 0.0,
            'web' => 0.0,
            'marketplace' => 0.0,
        ];

        $rows = [];
        $search = trim(mb_strtolower($this->search));

        foreach ($orders as $order) {
            $method = strtolower(trim((string) ($order->payment_method ?? '')));
            $isCash = in_array($method, ['cash', 'tunai'], true);
            $cashType = $isCash ? 'tunai' : 'rekening';
            $amount = max(0.0, (float) ($order->total_amount ?? 0));

            if ($order->is_pos) {
                $channelKey = 'pos';
                $channelLabel = 'POS Kasir';
            } elseif ($order->is_ecommerce) {
                $channelKey = 'marketplace';
                $src = strtolower((string) ($order->payment_details['source'] ?? ''));
                $channelLabel = match (true) {
                    $src === 'shopee' => 'Marketplace (Shopee)',
                    $src === 'tokopedia' => 'Marketplace (Tokopedia)',
                    $src === 'tiktok' || str_starts_with((string) $order->order_number, 'TTS-') => 'Marketplace (TikTok)',
                    default => 'Marketplace',
                };
            } else {
                $channelKey = 'web';
                $channelLabel = 'Website';
            }

            if ($isCash) {
                $tunaiTotal += $amount;
                $tunaiCount++;
                $tunaiByChannel[$channelKey] += $amount;
            } else {
                $rekeningTotal += $amount;
                $rekeningCount++;
                $rekeningByChannel[$channelKey] += $amount;
            }

            if ($this->cashTypeFilter !== 'all' && $this->cashTypeFilter !== $cashType) {
                continue;
            }
            if ($this->channelFilter !== 'all' && $this->channelFilter !== $channelKey) {
                continue;
            }
            if ($search !== '') {
                $haystack = mb_strtolower(implode(' ', array_filter([
                    $order->order_number,
                    $order->customer_name,
                    $channelLabel,
                    $order->payment_method_label,
                ])));
                if (! str_contains($haystack, $search)) {
                    continue;
                }
            }

            $rows[] = [
                'id' => $order->id,
                'order_number' => $order->order_number,
                'date_time' => $order->created_at?->format('d/m/Y H:i') ?? '-',
                'channel_key' => $channelKey,
                'channel_label' => $channelLabel,
                'customer_name' => $order->customer_name ?: 'Pelanggan',
                'payment_method_label' => $order->payment_method_label,
                'cash_type' => $cashType,
                'cash_type_label' => $isCash ? 'Tunai' : 'Rekening',
                'amount' => $amount,
            ];
        }

        $filteredTotal = array_sum(array_column($rows, 'amount'));

        return [
            'rekening_total' => $rekeningTotal,
            'rekening_count' => $rekeningCount,
            'rekening_by_channel' => $rekeningByChannel,
            'tunai_total' => $tunaiTotal,
            'tunai_count' => $tunaiCount,
            'tunai_by_channel' => $tunaiByChannel,
            'grand_total' => $rekeningTotal + $tunaiTotal,
            'total_count' => $rekeningCount + $tunaiCount,
            'filtered_total' => $filteredTotal,
            'rows' => $rows,
        ];
    }

    public function exportCsv(): StreamedResponse
    {
        $report = $this->reportData;
        $rows = $report['rows'];
        $filename = 'laporan-keuangan-' . now()->format('Y-m-d_His') . '.csv';

        return response()->streamDownload(function () use ($rows, $report) {
            $out = fopen('php://output', 'w');
            fwrite($out, "\xEF\xBB\xBF");

            fputcsv($out, [
                'No',
                'Tanggal',
                'No. Order',
                'Channel',
                'Pelanggan',
                'Metode Pembayaran',
                'Jenis Kas',
                'Nominal (Rp)',
            ]);

            foreach ($rows as $idx => $row) {
                fputcsv($out, [
                    $idx + 1,
                    $row['date_time'],
                    $row['order_number'],
                    $row['channel_label'],
                    $row['customer_name'],
                    $row['payment_method_label'],
                    $row['cash_type_label'],
                    (int) round($row['amount']),
                ]);
            }

            fputcsv($out, ['', '', '', '', '', '', 'TOTAL FILTER', (int) round($report['filtered_total'])]);
            fputcsv($out, ['', '', '', '', '', '', 'TOTAL KAS REKENING', (int) round($report['rekening_total'])]);
            fputcsv($out, ['', '', '', '', '', '', 'TOTAL KAS TUNAI', (int) round($report['tunai_total'])]);
            fputcsv($out, ['', '', '', '', '', '', 'TOTAL SELURUH KAS', (int) round($report['grand_total'])]);

            fclose($out);
        }, $filename, [
            'Content-Type' => 'text/csv; charset=UTF-8',
        ]);
    }
}
