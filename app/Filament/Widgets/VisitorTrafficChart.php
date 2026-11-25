<?php

namespace App\Filament\Widgets;

use App\Models\WebsiteVisit;
use Carbon\Carbon;
use Filament\Widgets\ChartWidget;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class VisitorTrafficChart extends ChartWidget
{
    protected ?string $heading = 'Grafik Tren Kunjungan Website (Real-Time)';

    protected ?string $pollingInterval = '60s';

    protected static ?int $sort = 2;

    public ?string $filter = 'today';

    protected function getFilters(): ?array
    {
        return [
            'today' => 'Hari Ini (Per Jam)',
            'week' => '7 Hari Terakhir',
            'month' => '30 Hari Terakhir',
        ];
    }

    protected function getData(): array
    {
        $filter = $this->filter ?? 'today';

        return Cache::remember("admin_widget_traffic_chart_{$filter}", 30, function () use ($filter) {
            if ($filter === 'week' || $filter === 'month') {
                $days = $filter === 'week' ? 6 : 29;
                $startDate = Carbon::today()->subDays($days)->startOfDay();

                $rows = WebsiteVisit::query()
                    ->where('created_at', '>=', $startDate)
                    ->selectRaw('DATE(created_at) as bucket, COUNT(*) as views, COUNT(DISTINCT visitor_id) as visitors')
                    ->groupBy('bucket')
                    ->get()
                    ->keyBy('bucket');

                $labels = [];
                $views = [];
                $visitors = [];
                for ($i = $days; $i >= 0; $i--) {
                    $date = Carbon::today()->subDays($i);
                    $key = $date->toDateString();
                    if ($filter === 'week') {
                        $labels[] = $date->translatedFormat('D, d M');
                    } else {
                        $labels[] = ($i % 3 === 0 || $i === 0) ? $date->format('d M') : '';
                    }
                    $views[] = (int) ($rows[$key]->views ?? 0);
                    $visitors[] = (int) ($rows[$key]->visitors ?? 0);
                }
            } else {
                $startOfDay = Carbon::today()->startOfDay();
                $hourExpr = DB::getDriverName() === 'sqlite'
                    ? "CAST(strftime('%H', created_at) AS INTEGER)"
                    : 'HOUR(created_at)';

                $rows = WebsiteVisit::query()
                    ->where('created_at', '>=', $startOfDay)
                    ->selectRaw("{$hourExpr} as bucket, COUNT(*) as views, COUNT(DISTINCT visitor_id) as visitors")
                    ->groupBy('bucket')
                    ->get()
                    ->keyBy('bucket');

                $labels = [];
                $views = [];
                $visitors = [];
                $currentHour = (int) Carbon::now()->format('H');
                for ($h = 0; $h <= $currentHour; $h++) {
                    $labels[] = sprintf('%02d:00', $h);
                    $views[] = (int) ($rows[$h]->views ?? 0);
                    $visitors[] = (int) ($rows[$h]->visitors ?? 0);
                }
            }

            return [
                'datasets' => [
                    [
                        'label' => 'Total Tayangan Halaman (Page Views)',
                        'data' => $views,
                        'borderColor' => '#f59e0b',
                        'backgroundColor' => 'rgba(245, 158, 11, 0.15)',
                        'fill' => true,
                        'tension' => 0.3,
                    ],
                    [
                        'label' => 'Pengunjung Unik (Unique Visitors)',
                        'data' => $visitors,
                        'borderColor' => '#10b981',
                        'backgroundColor' => 'rgba(16, 185, 129, 0.15)',
                        'fill' => true,
                        'tension' => 0.3,
                    ],
                ],
                'labels' => $labels,
            ];
        });
    }

    protected function getType(): string
    {
        return 'line';
    }
}
