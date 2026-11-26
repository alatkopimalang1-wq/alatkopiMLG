<x-filament-panels::page>
    @php
        $report = $this->reportData;
        $rows = $report['rows'];
        $transfers = $report['transfers'] ?? [];
        $fmt = fn (float|int $val): string => 'Rp ' . number_format((float) $val, 0, ',', '.');
        $fmtSigned = fn (float|int $val): string => ($val >= 0 ? '+' : '-') . 'Rp ' . number_format(abs((float) $val), 0, ',', '.');
    @endphp

    <div class="space-y-6">
        {{-- Period Filter Pills --}}
        <div class="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-xs dark:border-gray-800 dark:bg-gray-900">
            <div class="flex flex-wrap items-center gap-2">
                @foreach ([
                    'all' => 'Semua Waktu',
                    'today' => 'Hari Ini',
                    'yesterday' => 'Kemarin',
                    'this_month' => 'Bulan Ini',
                    'last_month' => 'Bulan Lalu',
                    'custom_range' => 'Rentang Tanggal',
                ] as $key => $label)
                    <button
                        type="button"
                        wire:click="setPeriod('{{ $key }}')"
                        class="cursor-pointer rounded-lg px-3 py-1.5 text-xs font-semibold transition {{ $this->period === $key ? 'bg-primary-600 text-white shadow-xs' : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700' }}"
                    >
                        {{ $label }}
                    </button>
                @endforeach
            </div>

            @if ($this->period === 'custom_range')
                <div class="flex flex-wrap items-center gap-2">
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
                </div>
            @endif
        </div>

        {{-- Main Cash Summary Cards --}}
        <div class="grid grid-cols-1 gap-4 lg:grid-cols-3">
            {{-- Total Keseluruhan Kas --}}
            <div class="rounded-2xl border border-gray-200 bg-white p-5 shadow-xs dark:border-gray-800 dark:bg-gray-900">
                <div class="flex items-center justify-between">
                    <span class="text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                        Total Seluruh Kas
                    </span>
                    <span class="rounded-full bg-gray-100 px-2.5 py-0.5 text-[11px] font-bold text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                        {{ number_format($report['total_count'], 0, ',', '.') }} transaksi
                    </span>
                </div>
                <div class="mt-2 text-2xl font-black text-gray-900 dark:text-white">
                    {{ $fmt($report['grand_total']) }}
                </div>
                <div class="mt-3 grid grid-cols-2 gap-2 border-t border-gray-100 pt-3 text-xs dark:border-gray-800">
                    <div>
                        <span class="block text-[11px] text-gray-400">Porsi Rekening</span>
                        <span class="font-bold text-blue-600 dark:text-blue-400">
                            {{ $report['grand_total'] > 0 ? round(($report['rekening_total'] / $report['grand_total']) * 100, 1) : 0 }}%
                        </span>
                    </div>
                    <div class="text-right">
                        <span class="block text-[11px] text-gray-400">Porsi Tunai</span>
                        <span class="font-bold text-emerald-600 dark:text-emerald-400">
                            {{ $report['grand_total'] > 0 ? round(($report['tunai_total'] / $report['grand_total']) * 100, 1) : 0 }}%
                        </span>
                    </div>
                </div>
            </div>

            {{-- Kas Rekening --}}
            <div class="rounded-2xl border border-blue-200 bg-blue-50/50 p-5 shadow-xs dark:border-blue-900/50 dark:bg-blue-950/20">
                <div class="flex items-center justify-between">
                    <span class="text-xs font-semibold tracking-wider text-blue-800 uppercase dark:text-blue-300">
                        Kas Rekening (Non-Tunai)
                    </span>
                    <span class="rounded-full bg-blue-100 px-2.5 py-0.5 text-[11px] font-bold text-blue-800 dark:bg-blue-900/60 dark:text-blue-200">
                        {{ number_format($report['rekening_count'], 0, ',', '.') }} transaksi
                    </span>
                </div>
                <div class="mt-2 text-2xl font-black text-blue-900 dark:text-blue-200">
                    {{ $fmt($report['rekening_total']) }}
                </div>
                @if ($report['rekening_transfer_net'] != 0)
                    <div class="mt-1 text-[11px] font-medium text-blue-700 dark:text-blue-300">
                        Penjualan: {{ $fmt($report['rekening_sales']) }} · Mutasi Transfer: {{ $fmtSigned($report['rekening_transfer_net']) }}
                    </div>
                @endif
                <div class="mt-3 grid grid-cols-3 gap-2 border-t border-blue-200/70 pt-3 text-[11px] dark:border-blue-900/50">
                    <div>
                        <span class="block text-blue-700/70 dark:text-blue-400/70">Marketplace</span>
                        <span class="font-bold text-blue-900 dark:text-blue-200">{{ $fmt($report['rekening_by_channel']['marketplace']) }}</span>
                    </div>
                    <div>
                        <span class="block text-blue-700/70 dark:text-blue-400/70">Website</span>
                        <span class="font-bold text-blue-900 dark:text-blue-200">{{ $fmt($report['rekening_by_channel']['web']) }}</span>
                    </div>
                    <div>
                        <span class="block text-blue-700/70 dark:text-blue-400/70">POS (Non-Cash)</span>
                        <span class="font-bold text-blue-900 dark:text-blue-200">{{ $fmt($report['rekening_by_channel']['pos']) }}</span>
                    </div>
                </div>
            </div>

            {{-- Kas Tunai --}}
            <div class="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-5 shadow-xs dark:border-emerald-900/50 dark:bg-emerald-950/20">
                <div class="flex items-center justify-between">
                    <span class="text-xs font-semibold tracking-wider text-emerald-800 uppercase dark:text-emerald-300">
                        Kas Tunai (Cash)
                    </span>
                    <span class="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-bold text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200">
                        {{ number_format($report['tunai_count'], 0, ',', '.') }} transaksi
                    </span>
                </div>
                <div class="mt-2 text-2xl font-black text-emerald-900 dark:text-emerald-200">
                    {{ $fmt($report['tunai_total']) }}
                </div>
                @if ($report['tunai_transfer_net'] != 0)
                    <div class="mt-1 text-[11px] font-medium text-emerald-700 dark:text-emerald-300">
                        Penjualan: {{ $fmt($report['tunai_sales']) }} · Mutasi Transfer: {{ $fmtSigned($report['tunai_transfer_net']) }}
                    </div>
                @endif
                <div class="mt-3 grid grid-cols-3 gap-2 border-t border-emerald-200/70 pt-3 text-[11px] dark:border-emerald-900/50">
                    <div>
                        <span class="block text-emerald-700/70 dark:text-emerald-400/70">POS (Cash)</span>
                        <span class="font-bold text-emerald-900 dark:text-emerald-200">{{ $fmt($report['tunai_by_channel']['pos']) }}</span>
                    </div>
                    <div>
                        <span class="block text-emerald-700/70 dark:text-emerald-400/70">Website</span>
                        <span class="font-bold text-emerald-900 dark:text-emerald-200">{{ $fmt($report['tunai_by_channel']['web']) }}</span>
                    </div>
                    <div>
                        <span class="block text-emerald-700/70 dark:text-emerald-400/70">Marketplace</span>
                        <span class="font-bold text-emerald-900 dark:text-emerald-200">{{ $fmt($report['tunai_by_channel']['marketplace']) }}</span>
                    </div>
                </div>
            </div>
        </div>

        {{-- Filters & Export --}}
        <div class="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-xs sm:flex-row sm:items-center sm:justify-between dark:border-gray-800 dark:bg-gray-900">
            <div class="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
                <div class="w-full sm:max-w-xs">
                    <input
                        type="text"
                        wire:model.live.debounce.300ms="search"
                        placeholder="Cari No. Order, pelanggan, metode..."
                        class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-2xs focus:border-primary-500 focus:ring-1 focus:ring-primary-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                    />
                </div>
                <div class="w-full sm:w-44">
                    <select
                        wire:model.live="cashTypeFilter"
                        class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-2xs focus:border-primary-500 focus:ring-1 focus:ring-primary-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                    >
                        <option value="all">Semua Jenis Kas</option>
                        <option value="rekening">Kas Rekening</option>
                        <option value="tunai">Kas Tunai</option>
                    </select>
                </div>
                <div class="w-full sm:w-48">
                    <select
                        wire:model.live="channelFilter"
                        class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-2xs focus:border-primary-500 focus:ring-1 focus:ring-primary-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                    >
                        <option value="all">Semua Channel</option>
                        <option value="pos">POS Kasir</option>
                        <option value="web">Website</option>
                        <option value="marketplace">Marketplace</option>
                    </select>
                </div>
            </div>

            <button
                type="button"
                wire:click="exportCsv"
                class="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-xs transition hover:bg-emerald-700"
            >
                <x-filament::icon icon="heroicon-o-arrow-down-tray" class="h-4 w-4" />
                <span>Export CSV</span>
            </button>
        </div>

        {{-- Transactions Table --}}
        <div class="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xs dark:border-gray-800 dark:bg-gray-900">
            <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-200 text-sm dark:divide-gray-800">
                    <thead class="bg-gray-50 dark:bg-gray-800/60">
                        <tr>
                            <th class="px-4 py-3 text-left text-xs font-semibold tracking-wider text-gray-600 uppercase dark:text-gray-300">No</th>
                            <th class="px-4 py-3 text-left text-xs font-semibold tracking-wider text-gray-600 uppercase dark:text-gray-300">Tanggal</th>
                            <th class="px-4 py-3 text-left text-xs font-semibold tracking-wider text-gray-600 uppercase dark:text-gray-300">No. Order</th>
                            <th class="px-4 py-3 text-left text-xs font-semibold tracking-wider text-gray-600 uppercase dark:text-gray-300">Channel</th>
                            <th class="px-4 py-3 text-left text-xs font-semibold tracking-wider text-gray-600 uppercase dark:text-gray-300">Pelanggan</th>
                            <th class="px-4 py-3 text-left text-xs font-semibold tracking-wider text-gray-600 uppercase dark:text-gray-300">Metode Bayar</th>
                            <th class="px-4 py-3 text-center text-xs font-semibold tracking-wider text-gray-600 uppercase dark:text-gray-300">Jenis Kas</th>
                            <th class="px-4 py-3 text-right text-xs font-semibold tracking-wider text-gray-600 uppercase dark:text-gray-300">Nominal</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-100 dark:divide-gray-800">
                        @forelse ($rows as $idx => $row)
                            <tr class="hover:bg-gray-50/70 dark:hover:bg-gray-800/40">
                                <td class="px-4 py-3 text-xs text-gray-500 dark:text-gray-400">{{ $idx + 1 }}</td>
                                <td class="px-4 py-3 whitespace-nowrap text-xs text-gray-600 dark:text-gray-300">{{ $row['date_time'] }}</td>
                                <td class="px-4 py-3 font-mono text-xs font-bold text-gray-900 dark:text-white">{{ $row['order_number'] }}</td>
                                <td class="px-4 py-3 text-xs font-medium text-gray-700 dark:text-gray-300">{{ $row['channel_label'] }}</td>
                                <td class="px-4 py-3 text-xs text-gray-800 dark:text-gray-200">{{ $row['customer_name'] }}</td>
                                <td class="px-4 py-3 text-xs text-gray-600 dark:text-gray-300">{{ $row['payment_method_label'] }}</td>
                                <td class="px-4 py-3 text-center">
                                    @if ($row['cash_type'] === 'tunai')
                                        <span class="inline-flex rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-bold text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                                            Tunai
                                        </span>
                                    @else
                                        <span class="inline-flex rounded-full bg-blue-100 px-2.5 py-0.5 text-[11px] font-bold text-blue-800 dark:bg-blue-950/60 dark:text-blue-300">
                                            Rekening
                                        </span>
                                    @endif
                                </td>
                                <td class="px-4 py-3 text-right font-bold tabular-nums text-gray-900 dark:text-white">
                                    {{ $fmt($row['amount']) }}
                                </td>
                            </tr>
                        @empty
                            <tr>
                                <td colspan="8" class="px-4 py-10 text-center text-sm text-gray-500 dark:text-gray-400">
                                    Belum ada transaksi lunas yang sesuai dengan filter.
                                </td>
                            </tr>
                        @endforelse
                    </tbody>
                    @if (count($rows) > 0)
                        <tfoot class="border-t-2 border-gray-200 bg-gray-50 font-bold dark:border-gray-700 dark:bg-gray-800/80">
                            <tr>
                                <td colspan="7" class="px-4 py-3.5 text-right text-xs tracking-wider text-gray-700 uppercase dark:text-gray-200">
                                    Total ({{ number_format(count($rows), 0, ',', '.') }} Transaksi)
                                </td>
                                <td class="px-4 py-3.5 text-right tabular-nums text-gray-900 dark:text-white">
                                    {{ $fmt($report['filtered_total']) }}
                                </td>
                            </tr>
                        </tfoot>
                    @endif
                </table>
            </div>
        </div>

        {{-- Riwayat Transfer Kas --}}
        <div class="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xs dark:border-gray-800 dark:bg-gray-900">
            <div class="flex items-center justify-between border-b border-gray-100 px-4 py-3 dark:border-gray-800">
                <div>
                    <h3 class="text-sm font-bold text-gray-900 dark:text-white">Riwayat Transfer Kas (Tunai ↔ Rekening)</h3>
                    <p class="text-xs text-gray-500 dark:text-gray-400">Mutasi perpindahan dana antar kas tunai dan rekening</p>
                </div>
                <span class="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-semibold text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                    {{ count($transfers) }} transfer
                </span>
            </div>
            <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-200 text-sm dark:divide-gray-800">
                    <thead class="bg-gray-50 dark:bg-gray-800/60">
                        <tr>
                            <th class="px-4 py-3 text-left text-xs font-semibold tracking-wider text-gray-600 uppercase dark:text-gray-300">Tanggal</th>
                            <th class="px-4 py-3 text-left text-xs font-semibold tracking-wider text-gray-600 uppercase dark:text-gray-300">Arah Transfer</th>
                            <th class="px-4 py-3 text-left text-xs font-semibold tracking-wider text-gray-600 uppercase dark:text-gray-300">Catatan</th>
                            <th class="px-4 py-3 text-left text-xs font-semibold tracking-wider text-gray-600 uppercase dark:text-gray-300">Dicatat Oleh</th>
                            <th class="px-4 py-3 text-right text-xs font-semibold tracking-wider text-gray-600 uppercase dark:text-gray-300">Nominal</th>
                            <th class="px-4 py-3 text-center text-xs font-semibold tracking-wider text-gray-600 uppercase dark:text-gray-300">Aksi</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-100 dark:divide-gray-800">
                        @forelse ($transfers as $tr)
                            <tr class="hover:bg-gray-50/70 dark:hover:bg-gray-800/40">
                                <td class="px-4 py-3 whitespace-nowrap text-xs text-gray-600 dark:text-gray-300">{{ $tr['transferred_at'] }}</td>
                                <td class="px-4 py-3 text-xs font-bold">
                                    @if ($tr['from_account'] === 'tunai')
                                        <span class="inline-flex rounded-full bg-blue-100 px-2.5 py-0.5 text-[11px] font-bold text-blue-800 dark:bg-blue-950/60 dark:text-blue-300">
                                            {{ $tr['direction_label'] }}
                                        </span>
                                    @else
                                        <span class="inline-flex rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-bold text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                                            {{ $tr['direction_label'] }}
                                        </span>
                                    @endif
                                </td>
                                <td class="px-4 py-3 text-xs text-gray-700 dark:text-gray-300">{{ $tr['notes'] }}</td>
                                <td class="px-4 py-3 text-xs text-gray-500 dark:text-gray-400">{{ $tr['user_name'] }}</td>
                                <td class="px-4 py-3 text-right font-bold tabular-nums text-gray-900 dark:text-white">
                                    {{ $fmt($tr['amount']) }}
                                </td>
                                <td class="px-4 py-3 text-center">
                                    <button
                                        type="button"
                                        wire:click="deleteTransfer({{ $tr['id'] }})"
                                        wire:confirm="Yakin ingin menghapus catatan transfer kas ini?"
                                        class="cursor-pointer rounded px-2 py-1 text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/40"
                                    >
                                        Hapus
                                    </button>
                                </td>
                            </tr>
                        @empty
                            <tr>
                                <td colspan="6" class="px-4 py-6 text-center text-xs text-gray-400">
                                    Belum ada riwayat transfer kas pada periode ini. Klik tombol "Transfer Kas" di kanan atas untuk mencatat perpindahan kas.
                                </td>
                            </tr>
                        @endforelse
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</x-filament-panels::page>
