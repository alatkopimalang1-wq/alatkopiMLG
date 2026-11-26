<x-filament-panels::page>
    @php
        $rows = $this->rows;
        $summary = $this->summary;
        $categories = $this->categories;
        $fmt = fn (float|int $val): string => 'Rp ' . number_format((float) $val, 0, ',', '.');
    @endphp

    <div class="space-y-6">
        {{-- Summary KPI Cards --}}
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <div class="rounded-xl border border-gray-200 bg-white p-4 shadow-xs dark:border-gray-800 dark:bg-gray-900">
                <div class="text-xs font-medium text-gray-500 dark:text-gray-400">Total Varian (Non-PO)</div>
                <div class="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
                    {{ number_format($summary['total_variants'], 0, ',', '.') }}
                </div>
                <div class="mt-1 text-[11px] text-gray-400">Produk Pre-Order tidak disertakan</div>
            </div>

            <div class="rounded-xl border border-gray-200 bg-white p-4 shadow-xs dark:border-gray-800 dark:bg-gray-900">
                <div class="text-xs font-medium text-gray-500 dark:text-gray-400">Total Qty Stok</div>
                <div class="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
                    {{ number_format($summary['total_stock'], 0, ',', '.') }} <span class="text-sm font-medium text-gray-500">pcs</span>
                </div>
                <div class="mt-1 text-[11px] text-gray-400">Akumulasi stok fisik seluruh varian</div>
            </div>

            <div class="rounded-xl border border-amber-200 bg-amber-50/50 p-4 shadow-xs dark:border-amber-900/50 dark:bg-amber-950/20">
                <div class="text-xs font-semibold text-amber-800 dark:text-amber-300">Total Barang (Harga Beli)</div>
                <div class="mt-1 text-xl font-extrabold text-amber-900 dark:text-amber-200">
                    {{ $fmt($summary['total_buy_value']) }}
                </div>
                <div class="mt-1 text-[11px] text-amber-700/80 dark:text-amber-400/80">Akumulasi (Stok × Harga Beli)</div>
            </div>

            <div class="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4 shadow-xs dark:border-emerald-900/50 dark:bg-emerald-950/20">
                <div class="text-xs font-semibold text-emerald-800 dark:text-emerald-300">Total Barang (Harga Jual)</div>
                <div class="mt-1 text-xl font-extrabold text-emerald-900 dark:text-emerald-200">
                    {{ $fmt($summary['total_sell_value']) }}
                </div>
                <div class="mt-1 text-[11px] text-emerald-700/80 dark:text-emerald-400/80">Akumulasi (Stok × Harga Jual)</div>
            </div>

            <div class="rounded-xl border border-blue-200 bg-blue-50/50 p-4 shadow-xs dark:border-blue-900/50 dark:bg-blue-950/20">
                <div class="text-xs font-semibold text-blue-800 dark:text-blue-300">Potensi Margin Kotor</div>
                <div class="mt-1 text-xl font-extrabold text-blue-900 dark:text-blue-200">
                    {{ $fmt($summary['potential_profit']) }}
                </div>
                <div class="mt-1 text-[11px] text-blue-700/80 dark:text-blue-400/80">Harga Jual − Harga Beli</div>
            </div>
        </div>

        {{-- Filter & Export Toolbar --}}
        <div class="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-xs sm:flex-row sm:items-center sm:justify-between dark:border-gray-800 dark:bg-gray-900">
            <div class="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
                <div class="w-full sm:max-w-xs">
                    <input
                        type="text"
                        wire:model.live.debounce.300ms="search"
                        placeholder="Cari nama produk, brand, variasi, atau SKU..."
                        class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-2xs focus:border-primary-500 focus:ring-1 focus:ring-primary-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                    />
                </div>
                <div class="w-full sm:w-52">
                    <select
                        wire:model.live="categoryFilter"
                        class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-2xs focus:border-primary-500 focus:ring-1 focus:ring-primary-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                    >
                        <option value="all">Semua Kategori</option>
                        @foreach ($categories as $cat)
                            <option value="{{ $cat['id'] }}">{{ $cat['name'] }}</option>
                        @endforeach
                    </select>
                </div>
                <div class="w-full sm:w-52">
                    <select
                        wire:model.live="stockFilter"
                        class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-2xs focus:border-primary-500 focus:ring-1 focus:ring-primary-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                    >
                        <option value="all">Semua Status Stok</option>
                        <option value="in_stock">Stok Tersedia (&gt; 0)</option>
                        <option value="low_stock">Stok Menipis (1 - 5)</option>
                        <option value="out_of_stock">Stok Habis (0)</option>
                    </select>
                </div>
            </div>

            <div class="flex items-center gap-2">
                <button
                    type="button"
                    wire:click="exportCsv"
                    class="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-xs transition hover:bg-emerald-700"
                >
                    <x-filament::icon icon="heroicon-o-arrow-down-tray" class="h-4 w-4" />
                    <span>Export CSV</span>
                </button>
            </div>
        </div>

        {{-- Table --}}
        <div class="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xs dark:border-gray-800 dark:bg-gray-900">
            <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-200 text-sm dark:divide-gray-800">
                    <thead class="bg-gray-50 dark:bg-gray-800/60">
                        <tr>
                            <th class="px-4 py-3 text-left text-xs font-semibold tracking-wider text-gray-600 uppercase dark:text-gray-300">No</th>
                            <th class="px-4 py-3 text-left text-xs font-semibold tracking-wider text-gray-600 uppercase dark:text-gray-300">Produk</th>
                            <th class="px-4 py-3 text-left text-xs font-semibold tracking-wider text-gray-600 uppercase dark:text-gray-300">Variasi</th>
                            <th class="px-4 py-3 text-right text-xs font-semibold tracking-wider text-gray-600 uppercase dark:text-gray-300">Stok</th>
                            <th class="px-4 py-3 text-right text-xs font-semibold tracking-wider text-gray-600 uppercase dark:text-gray-300">Harga Beli</th>
                            <th class="px-4 py-3 text-right text-xs font-semibold tracking-wider text-gray-600 uppercase dark:text-gray-300">Harga Jual</th>
                            <th class="px-4 py-3 text-right text-xs font-semibold tracking-wider text-amber-700 uppercase dark:text-amber-300">Total Harga Beli</th>
                            <th class="px-4 py-3 text-right text-xs font-semibold tracking-wider text-emerald-700 uppercase dark:text-emerald-300">Total Harga Jual</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-100 dark:divide-gray-800">
                        @forelse ($rows as $idx => $row)
                            <tr class="hover:bg-gray-50/70 dark:hover:bg-gray-800/40">
                                <td class="px-4 py-3 text-xs text-gray-500 dark:text-gray-400">
                                    {{ $idx + 1 }}
                                </td>
                                <td class="px-4 py-3">
                                    <div class="font-semibold text-gray-900 dark:text-white">{{ $row['product_name'] }}</div>
                                    @if ($row['brand'] !== '-')
                                        <div class="text-xs text-gray-500 dark:text-gray-400">{{ $row['brand'] }}</div>
                                    @endif
                                </td>
                                <td class="px-4 py-3">
                                    <span class="inline-flex items-center rounded-md bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-800 dark:bg-gray-800 dark:text-gray-200">
                                        {{ $row['variant_label'] }}
                                    </span>
                                    @if ($row['sku'] !== '-')
                                        <div class="mt-0.5 font-mono text-[11px] text-gray-400">SKU: {{ $row['sku'] }}</div>
                                    @endif
                                </td>
                                <td class="px-4 py-3 text-right font-bold tabular-nums">
                                    @if ($row['stock'] <= 0)
                                        <span class="inline-flex rounded-md bg-rose-100 px-2 py-0.5 text-xs font-bold text-rose-700 dark:bg-rose-950/60 dark:text-rose-300">
                                            0
                                        </span>
                                    @elseif ($row['stock'] <= 5)
                                        <span class="inline-flex rounded-md bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                                            {{ number_format($row['stock'], 0, ',', '.') }}
                                        </span>
                                    @else
                                        <span class="text-gray-900 dark:text-white">
                                            {{ number_format($row['stock'], 0, ',', '.') }}
                                        </span>
                                    @endif
                                </td>
                                <td class="px-4 py-3 text-right tabular-nums text-gray-700 dark:text-gray-300">
                                    {{ $fmt($row['buy_price']) }}
                                </td>
                                <td class="px-4 py-3 text-right tabular-nums font-medium text-gray-900 dark:text-white">
                                    {{ $fmt($row['sell_price']) }}
                                </td>
                                <td class="px-4 py-3 text-right tabular-nums font-semibold text-amber-800 dark:text-amber-300">
                                    {{ $fmt($row['total_buy_value']) }}
                                </td>
                                <td class="px-4 py-3 text-right tabular-nums font-bold text-emerald-700 dark:text-emerald-300">
                                    {{ $fmt($row['total_sell_value']) }}
                                </td>
                            </tr>
                        @empty
                            <tr>
                                <td colspan="8" class="px-4 py-10 text-center text-sm text-gray-500 dark:text-gray-400">
                                    Tidak ada data produk non-Pre-Order yang sesuai dengan filter.
                                </td>
                            </tr>
                        @endforelse
                    </tbody>
                    @if ($rows->isNotEmpty())
                        <tfoot class="border-t-2 border-gray-200 bg-gray-50 font-bold dark:border-gray-700 dark:bg-gray-800/80">
                            <tr>
                                <td colspan="3" class="px-4 py-3.5 text-right text-xs tracking-wider text-gray-700 uppercase dark:text-gray-200">
                                    Total Keseluruhan ({{ number_format($summary['total_variants'], 0, ',', '.') }} Varian)
                                </td>
                                <td class="px-4 py-3.5 text-right tabular-nums text-gray-900 dark:text-white">
                                    {{ number_format($summary['total_stock'], 0, ',', '.') }}
                                </td>
                                <td class="px-4 py-3.5 text-right text-gray-400">—</td>
                                <td class="px-4 py-3.5 text-right text-gray-400">—</td>
                                <td class="px-4 py-3.5 text-right tabular-nums text-amber-800 dark:text-amber-300">
                                    {{ $fmt($summary['total_buy_value']) }}
                                </td>
                                <td class="px-4 py-3.5 text-right tabular-nums text-emerald-700 dark:text-emerald-300">
                                    {{ $fmt($summary['total_sell_value']) }}
                                </td>
                            </tr>
                        </tfoot>
                    @endif
                </table>
            </div>
        </div>
    </div>
</x-filament-panels::page>
