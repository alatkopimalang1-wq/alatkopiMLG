<?php

namespace App\Filament\Pages;

use App\Services\ProfitLossService;
use BackedEnum;
use Carbon\Carbon;
use Filament\Pages\Page;
use Filament\Support\Icons\Heroicon;

class LaporanLabaRugiPos extends Page
{
    protected static string|BackedEnum|null $navigationIcon = Heroicon::PresentationChartLine;

    protected static string|\UnitEnum|null $navigationGroup = 'Laporan';

    protected static ?string $navigationLabel = 'Laba Rugi Pos';

    protected static ?string $title = 'Laporan Laba Rugi Penjualan POS (Kasir Toko)';

    protected static ?string $slug = 'laporan-laba-rugi-pos';

    protected static ?int $navigationSort = 3;

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

    protected string $view = 'filament.pages.laporan-laba-rugi-pos';

    /**
     * Active period filter: 'today', 'yesterday', 'this_month', 'last_month', 'custom_month', 'custom_range'.
     */
    public string $period = 'this_month';

    public string $selectedMonth = '';

    public string $startDate = '';

    public string $endDate = '';

    /**
     * Sales channel locked to 'pos' only.
     */
    public string $channel = 'pos';

    /**
     * Active view tab: 'ringkasan', 'pesanan', 'produk', 'pengeluaran'.
     */
    public string $activeViewTab = 'ringkasan';

    /**
     * Expense category filter: 'all' or category key.
     */
    public string $expenseCategory = 'all';

    public string $searchTransaction = '';

    public string $searchProduct = '';

    public string $searchExpense = '';

    public function mount(): void
    {
        $now = Carbon::now();
        $this->selectedMonth = $now->format('Y-m');
        $this->startDate = $now->copy()->startOfMonth()->format('Y-m-d');
        $this->endDate = $now->copy()->endOfMonth()->format('Y-m-d');
    }

    public function setPeriod(string $newPeriod): void
    {
        $this->period = $newPeriod;
        $now = Carbon::now();

        if ($newPeriod === 'today') {
            $this->startDate = $now->format('Y-m-d');
            $this->endDate = $now->format('Y-m-d');
        } elseif ($newPeriod === 'yesterday') {
            $yesterday = Carbon::yesterday();
            $this->startDate = $yesterday->format('Y-m-d');
            $this->endDate = $yesterday->format('Y-m-d');
        } elseif ($newPeriod === 'this_month') {
            $this->selectedMonth = $now->format('Y-m');
            $this->startDate = $now->copy()->startOfMonth()->format('Y-m-d');
            $this->endDate = $now->copy()->endOfMonth()->format('Y-m-d');
        } elseif ($newPeriod === 'last_month') {
            $lastMonth = $now->copy()->subMonth();
            $this->selectedMonth = $lastMonth->format('Y-m');
            $this->startDate = $lastMonth->copy()->startOfMonth()->format('Y-m-d');
            $this->endDate = $lastMonth->copy()->endOfMonth()->format('Y-m-d');
        } elseif ($newPeriod === 'custom_month') {
            if (! empty($this->selectedMonth)) {
                $m = Carbon::parse($this->selectedMonth.'-01');
                $this->startDate = $m->copy()->startOfMonth()->format('Y-m-d');
                $this->endDate = $m->copy()->endOfMonth()->format('Y-m-d');
            }
        }
    }

    public function updatedSelectedMonth(): void
    {
        if ($this->period === 'custom_month' && ! empty($this->selectedMonth)) {
            $m = Carbon::parse($this->selectedMonth.'-01');
            $this->startDate = $m->copy()->startOfMonth()->format('Y-m-d');
            $this->endDate = $m->copy()->endOfMonth()->format('Y-m-d');
        }
    }

    public function setActiveTab(string $tab): void
    {
        $this->activeViewTab = $tab;
    }

    public function setExpenseCategory(string $cat): void
    {
        $this->expenseCategory = $cat;
    }

    /**
     * Get computed Profit & Loss Report data for POS (Point of Sale / Kasir).
     *
     * @return array<string, mixed>
     */
    public function getReportDataProperty(): array
    {
        if ($this->period === 'today') {
            $start = Carbon::today()->startOfDay();
            $end = Carbon::today()->endOfDay();
        } elseif ($this->period === 'yesterday') {
            $start = Carbon::yesterday()->startOfDay();
            $end = Carbon::yesterday()->endOfDay();
        } elseif ($this->period === 'this_month') {
            $start = Carbon::now()->startOfMonth();
            $end = Carbon::now()->endOfMonth();
        } elseif ($this->period === 'last_month') {
            $start = Carbon::now()->subMonth()->startOfMonth();
            $end = Carbon::now()->subMonth()->endOfMonth();
        } elseif ($this->period === 'custom_month') {
            $m = Carbon::parse(($this->selectedMonth ?: Carbon::now()->format('Y-m')).'-01');
            $start = $m->copy()->startOfMonth();
            $end = $m->copy()->endOfMonth();
        } else {
            // custom_range
            $start = Carbon::parse($this->startDate ?: Carbon::now()->startOfMonth()->format('Y-m-d'))->startOfDay();
            $end = Carbon::parse($this->endDate ?: Carbon::now()->endOfMonth()->format('Y-m-d'))->endOfDay();
        }

        return ProfitLossService::getReport($start, $end, 'pos');
    }
}
