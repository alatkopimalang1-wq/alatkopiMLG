<x-filament-panels::page>
    @php
        $report = $this->reportData;
        $dailyRows = $report['daily_rows'];
        $fmt = fn (float|int $val): string => 'Rp ' . number_format((float) $val, 0, ',', '.');
        $pct = fn (float $part, float $total): float => $total > 0 ? round(($part / $total) * 100, 1) : 0.0;
    @endphp

    <div class="space-y-6">
        {{-- Filter Periode --}}
        <div class="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-xs dark:border-gray-800 dark:bg-gray-900">
            <div class="flex flex-wrap items-center gap-2">
                @foreach ([
                    'daily' => 'Harian',
                    'custom_range' => 'Custom Tanggal',
                    'this_month' => 'Bulan Ini',
                    'custom_month' => 'Custom Bulan',
                ] as $key => $label)
                    <button
                        type="button"
                        wire:click="setPeriod('{{ $key }}')"
                        class="cursor-pointer rounded-lg px-3.5 py-2 text-xs font-semibold transition {{ $this->period === $key ? 'bg-primary-600 text-white shadow-xs' : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700' }}"
                    >
                        {{ $label }}
                    </button>
                @endforeach
            </div>

            <div class="flex flex-wrap items-center gap-2">
                @if ($this->period === 'daily')
                    <input
                        type="date"
                        wire:model.live="selectedDate"
                        class="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                    />
                @elseif ($this->period === 'custom_month')
                    <input
                        type="month"
                        wire:model.live="selectedMonth"
                        class="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                    />
                @elseif ($this->period === 'custom_range')
                    <input
                        type="date"
                        wire:model.live="startDate"
                        class="rounded-lg border border-gray-300 bg-white px-2.5 py-1.5 text-xs text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                    />
                    <span class="text-xs text-gray-400">s/d</span>
                    <input
                        type="date"
                        wire:model.live="endDate"
                        class="rounded-lg border border-gray-300 bg-white px-2.5 py-1.5 text-xs text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                    />
                @endif

                <button
                    type="button"
                    wire:click="exportCsv"
                    class="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-emerald-600 px-3.5 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-emerald-700"
                >
                    <x-filament::icon icon="heroicon-o-arrow-down-tray" class="h-4 w-4" />
                    <span>Export CSV</span>
                </button>
            </div>
        </div>

        {{-- Total Omset Keseluruhan --}}
        <div class="rounded-2xl border border-emerald-200 bg-gradient-to-r from-emerald-50 to-white p-6 shadow-xs dark:border-emerald-900/50 dark:from-emerald-950/30 dark:to-gray-900">
            <div class="flex flex-wrap items-center justify-between gap-2">
                <div>
                    <div class="text-xs font-semibold tracking-wider text-emerald-700 uppercase dark:text-emerald-400">
                        Total Omset Keseluruhan ({{ $report['period_label'] }})
                    </div>
                    <div class="mt-2 text-3xl font-black text-gray-900 sm:text-4xl dark:text-white">
                        {{ $fmt($report['grand_total']) }}
                    </div>
                </div>
                <span class="rounded-full bg-emerald-100 px-3.5 py-1 text-xs font-bold text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200">
                    {{ number_format($report['total_count'], 0, ',', '.') }} transaksi lunas
                </span>
            </div>
        </div>

        {{-- Omset per Channel --}}
        <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div class="rounded-2xl border border-blue-200 bg-blue-50/40 p-5 shadow-xs dark:border-blue-900/50 dark:bg-blue-950/20">
                <div class="flex items-center justify-between">
                    <span class="text-xs font-semibold tracking-wider text-blue-800 uppercase dark:text-blue-300">Omset Website</span>
                    <span class="rounded-full bg-blue-100 px-2.5 py-0.5 text-[11px] font-bold text-blue-800 dark:bg-blue-900/60 dark:text-blue-200">
                        {{ $pct($report['website_total'], $report['grand_total']) }}%
                    </span>
                </div>
                <div class="mt-2 text-2xl font-black text-blue-900 dark:text-blue-200">
                    {{ $fmt($report['website_total']) }}
                </div>
                <div class="mt-1 text-xs text-blue-700/80 dark:text-blue-400/80">
                    {{ number_format($report['website_count'], 0, ',', '.') }} transaksi
                </div>
            </div>

            <div class="rounded-2xl border border-amber-200 bg-amber-50/40 p-5 shadow-xs dark:border-amber-900/50 dark:bg-amber-950/20">
                <div class="flex items-center justify-between">
                    <span class="text-xs font-semibold tracking-wider text-amber-800 uppercase dark:text-amber-300">Omset Marketplace</span>
                    <span class="rounded-full bg-amber-100 px-2.5 py-0.5 text-[11px] font-bold text-amber-800 dark:bg-amber-900/60 dark:text-amber-200">
                        {{ $pct($report['marketplace_total'], $report['grand_total']) }}%
                    </span>
                </div>
                <div class="mt-2 text-2xl font-black text-amber-900 dark:text-amber-200">
                    {{ $fmt($report['marketplace_total']) }}
                </div>
                <div class="mt-1 text-xs text-amber-700/80 dark:text-amber-400/80">
                    {{ number_format($report['marketplace_count'], 0, ',', '.') }} transaksi
                </div>
            </div>

            <div class="rounded-2xl border border-emerald-200 bg-emerald-50/40 p-5 shadow-xs dark:border-emerald-900/50 dark:bg-emerald-950/20">
                <div class="flex items-center justify-between">
                    <span class="text-xs font-semibold tracking-wider text-emerald-800 uppercase dark:text-emerald-300">Omset POS</span>
                    <span class="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-bold text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200">
                        {{ $pct($report['pos_total'], $report['grand_total']) }}%
                    </span>
                </div>
                <div class="mt-2 text-2xl font-black text-emerald-900 dark:text-emerald-200">
                    {{ $fmt($report['pos_total']) }}
                </div>
                <div class="mt-1 text-xs text-emerald-700/80 dark:text-emerald-400/80">
                    {{ number_format($report['pos_count'], 0, ',', '.') }} transaksi
                </div>
            </div>
        </div>

        {{-- Tabel Omset Harian --}}
        <div class="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xs dark:border-gray-800 dark:bg-gray-900">
            <div class="border-b border-gray-100 px-4 py-3 dark:border-gray-800">
                <h3 class="text-sm font-bold text-gray-900 dark:text-white">Rincian Omset Harian</h3>
            </div>
            <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-200 text-sm dark:divide-gray-800">
                    <thead class="bg-gray-50 dark:bg-gray-800/60">
                        <tr>
                            <th class="px-4 py-3 text-left text-xs font-semibold tracking-wider text-gray-600 uppercase dark:text-gray-300">Tanggal</th>
                            <th class="px-4 py-3 text-right text-xs font-semibold tracking-wider text-blue-700 uppercase dark:text-blue-300">Website</th>
                            <th class="px-4 py-3 text-right text-xs font-semibold tracking-wider text-amber-700 uppercase dark:text-amber-300">Marketplace</th>
                            <th class="px-4 py-3 text-right text-xs font-semibold tracking-wider text-emerald-700 uppercase dark:text-emerald-300">POS</th>
                            <th class="px-4 py-3 text-center text-xs font-semibold tracking-wider text-gray-600 uppercase dark:text-gray-300">Transaksi</th>
                            <th class="px-4 py-3 text-right text-xs font-semibold tracking-wider text-gray-900 uppercase dark:text-white">Total Omset</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-100 dark:divide-gray-800">
                        @forelse ($dailyRows as $row)
                            <tr class="hover:bg-gray-50/70 dark:hover:bg-gray-800/40">
                                <td class="px-4 py-3 whitespace-nowrap text-xs font-semibold text-gray-900 dark:text-white">{{ $row['date_label'] }}</td>
                                <td class="px-4 py-3 text-right tabular-nums text-xs text-gray-700 dark:text-gray-300">{{ $fmt($row['website']) }}</td>
                                <td class="px-4 py-3 text-right tabular-nums text-xs text-gray-700 dark:text-gray-300">{{ $fmt($row['marketplace']) }}</td>
                                <td class="px-4 py-3 text-right tabular-nums text-xs text-gray-700 dark:text-gray-300">{{ $fmt($row['pos']) }}</td>
                                <td class="px-4 py-3 text-center text-xs font-medium text-gray-600 dark:text-gray-400">{{ $row['transactions'] }}</td>
                                <td class="px-4 py-3 text-right font-bold tabular-nums text-gray-900 dark:text-white">{{ $fmt($row['total']) }}</td>
                            </tr>
                        @empty
                            <tr>
                                <td colspan="6" class="px-4 py-10 text-center text-sm text-gray-500 dark:text-gray-400">
                                    Belum ada omset penjualan pada periode ini.
                                </td>
                            </tr>
                        @endforelse
                    </tbody>
                    @if (count($dailyRows) > 0)
                        <tfoot class="border-t-2 border-gray-200 bg-gray-50 font-bold dark:border-gray-700 dark:bg-gray-800/80">
                            <tr>
                                <td class="px-4 py-3.5 text-xs tracking-wider text-gray-700 uppercase dark:text-gray-200">Total</td>
                                <td class="px-4 py-3.5 text-right tabular-nums text-blue-800 dark:text-blue-300">{{ $fmt($report['website_total']) }}</td>
                                <td class="px-4 py-3.5 text-right tabular-nums text-amber-800 dark:text-amber-300">{{ $fmt($report['marketplace_total']) }}</td>
                                <td class="px-4 py-3.5 text-right tabular-nums text-emerald-800 dark:text-emerald-300">{{ $fmt($report['pos_total']) }}</td>
                                <td class="px-4 py-3.5 text-center text-gray-900 dark:text-white">{{ number_format($report['total_count'], 0, ',', '.') }}</td>
                                <td class="px-4 py-3.5 text-right tabular-nums text-gray-900 dark:text-white">{{ $fmt($report['grand_total']) }}</td>
                            </tr>
                        </tfoot>
                    @endif
                </table>
            </div>
        </div>
    </div>
</x-filament-panels::page>
