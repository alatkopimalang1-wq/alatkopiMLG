<x-filament-panels::page>
    @php
        $stats = $this->stats;
        $variants = $this->variants;
        $movements = $this->activeTab === 'pergerakan' ? $this->movements : collect();
        $adjustments = $this->activeTab === 'riwayat' ? $this->adjustments : collect();
        $fmt = fn ($val) => 'Rp ' . number_format((float) $val, 0, ',', '.');
    @endphp

    <div class="space-y-4">
        {{-- Summary Cards --}}
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div class="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 shadow-xs">
                <div class="text-xs font-medium text-gray-500 dark:text-gray-400">Total Varian Produk</div>
                <div class="mt-1 text-2xl font-bold text-gray-900 dark:text-white">{{ number_format($stats['total_variants']) }}</div>
            </div>
            <div class="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 shadow-xs">
                <div class="text-xs font-medium text-gray-500 dark:text-gray-400">Total Stok Tersedia</div>
                <div class="mt-1 text-2xl font-bold text-emerald-600 dark:text-emerald-400">{{ number_format($stats['total_stock']) }} <span class="text-xs font-medium">pcs</span></div>
            </div>
            <div class="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 shadow-xs">
                <div class="text-xs font-medium text-gray-500 dark:text-gray-400">Stok Menipis (1–5 pcs)</div>
                <div class="mt-1 text-2xl font-bold text-amber-600 dark:text-amber-400">{{ number_format($stats['low_stock']) }}</div>
            </div>
            <div class="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 shadow-xs">
                <div class="text-xs font-medium text-gray-500 dark:text-gray-400">Stok Habis (0 pcs)</div>
                <div class="mt-1 text-2xl font-bold text-rose-600 dark:text-rose-400">{{ number_format($stats['out_of_stock']) }}</div>
            </div>
        </div>

        {{-- Tabs: Cek Data Stok, Riwayat Pergerakan Stok, Riwayat Penyesuaian --}}
        <div class="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-4 py-2.5 shadow-xs">
            <div class="flex flex-wrap items-center gap-2">
                <button type="button"
                        wire:click="$set('activeTab', 'stok')"
                        class="px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition cursor-pointer {{ $activeTab === 'stok' ? 'bg-primary-600 text-white' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800' }}">
                    Cek & Kelola Stok
                </button>
                <button type="button"
                        wire:click="$set('activeTab', 'pergerakan')"
                        class="px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition cursor-pointer {{ $activeTab === 'pergerakan' ? 'bg-primary-600 text-white' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800' }}">
                    Riwayat Pergerakan Stok
                </button>
                <button type="button"
                        wire:click="$set('activeTab', 'riwayat')"
                        class="px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition cursor-pointer {{ $activeTab === 'riwayat' ? 'bg-primary-600 text-white' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800' }}">
                    Riwayat Penyesuaian Manual
                </button>
            </div>
        </div>

        @if($activeTab === 'stok')
            {{-- Search & Stock Filters --}}
            <div class="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 shadow-xs space-y-3">
                <div class="flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <input
                        type="text"
                        wire:model.live.debounce.300ms="search"
                        placeholder="Cari nama produk, varian, brand, atau SKU..."
                        class="w-full md:max-w-md rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                    />

                    <div class="flex flex-wrap items-center gap-1.5 text-xs">
                        @foreach([
                            'all' => 'Semua',
                            'in_stock' => 'Stok Aman (>5)',
                            'low_stock' => 'Menipis (1-5)',
                            'out_of_stock' => 'Habis (0)',
                            'preorder' => 'Pre-Order',
                        ] as $fKey => $fLabel)
                            <button type="button"
                                    wire:click="$set('stockFilter', '{{ $fKey }}')"
                                    class="px-2.5 py-1.5 rounded-lg font-medium transition cursor-pointer {{ $stockFilter === $fKey ? 'bg-sky-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700' }}">
                                {{ $fLabel }}
                            </button>
                        @endforeach
                    </div>
                </div>

                {{-- Stock Table --}}
                <div class="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-800">
                    <table class="w-full text-left border-collapse text-xs sm:text-sm">
                        <thead>
                            <tr class="border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/60 text-gray-600 dark:text-gray-300 font-semibold">
                                <th class="py-3 px-4">Produk & Varian</th>
                                <th class="py-3 px-4">SKU</th>
                                <th class="py-3 px-4 text-right">Harga Beli</th>
                                <th class="py-3 px-4 text-right">Harga Jual</th>
                                <th class="py-3 px-4 text-center">Stok Saat Ini</th>
                                <th class="py-3 px-4 text-center">Penyesuaian Stok</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-100 dark:divide-gray-800">
                            @forelse($variants as $v)
                                @php
                                    $prod = $v->product;
                                    $isPre = (bool) ($prod?->is_preorder ?? false);
                                    $qty = (int) ($v->stock ?? 0);
                                    $isPoOut = $isPre && ($prod?->stock_status === 'out_of_stock' || $v->stock_status === 'out_of_stock');
                                    $rawImg = $v->image ?: ($prod?->primaryImage?->path ?? $prod?->images->first()?->path);
                                    $imgUrl = $rawImg
                                        ? (str_starts_with($rawImg, 'http') ? $rawImg : asset('storage/' . ltrim(preg_replace('#^/?(?:(?:storage|public)/)+#', '', trim($rawImg)), '/')))
                                        : asset('brand/logo-circle.png');
                                @endphp
                                <tr class="hover:bg-gray-50/70 dark:hover:bg-gray-800/30">
                                    <td class="py-3 px-4">
                                        <div class="flex items-center gap-3">
                                            <img src="{{ $imgUrl }}" alt="" class="w-10 h-10 rounded-lg object-cover border border-gray-200 dark:border-gray-700 shrink-0">
                                            <div>
                                                <div class="font-semibold text-gray-900 dark:text-white">
                                                    {{ $prod?->name ?? 'Produk #' . $v->product_id }}
                                                </div>
                                                @if (!\App\Support\VariantHelper::isStandard($v->label))
                                                    <div class="text-xs text-gray-500 dark:text-gray-400">
                                                        Varian: {{ $v->label }}
                                                    </div>
                                                @endif
                                            </div>
                                        </div>
                                    </td>
                                    <td class="py-3 px-4 font-mono text-xs text-gray-600 dark:text-gray-300">
                                        {{ $v->sku ?: '—' }}
                                    </td>
                                    <td class="py-3 px-4 text-right text-gray-600 dark:text-gray-300">
                                        {{ $fmt($v->cost_price ?? 0) }}
                                    </td>
                                    <td class="py-3 px-4 text-right font-semibold text-gray-900 dark:text-white">
                                        {{ $fmt($v->price ?? 0) }}
                                    </td>
                                    <td class="py-3 px-4 text-center">
                                        @if($isPre)
                                            @if($isPoOut)
                                                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300">
                                                    Kosong (PO)
                                                </span>
                                            @else
                                                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                                                    Tersedia (PO)
                                                </span>
                                            @endif
                                        @elseif($qty <= 0)
                                            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300">
                                                Habis (0)
                                            </span>
                                        @elseif($qty <= 5)
                                            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                                                {{ $qty }} pcs
                                            </span>
                                        @else
                                            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                                                {{ $qty }} pcs
                                            </span>
                                        @endif
                                    </td>
                                    <td class="py-3 px-4 text-center">
                                        @if($isPre)
                                            <span class="text-xs text-gray-400">Ubah via Edit Produk</span>
                                        @elseif(! $this->canAdjustStock())
                                            <span class="inline-flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-zinc-800/80 px-2 py-1 rounded border border-gray-200 dark:border-zinc-700">
                                                <x-heroicon-o-lock-closed class="w-3.5 h-3.5 text-gray-400" />
                                                Khusus Owner
                                            </span>
                                        @else
                                            <div class="inline-flex flex-wrap items-center justify-center gap-1.5">
                                                <button type="button"
                                                        wire:click="mountAction('adjustStock', { variantId: {{ $v->id }}, mode: 'in' })"
                                                        class="inline-flex items-center gap-1 rounded-md bg-emerald-600 hover:bg-emerald-700 px-2.5 py-1 text-xs font-semibold text-white cursor-pointer transition">
                                                    + Tambah
                                                </button>
                                                <button type="button"
                                                        @if($qty <= 0) disabled @endif
                                                        wire:click="mountAction('adjustStock', { variantId: {{ $v->id }}, mode: 'out' })"
                                                        class="inline-flex items-center gap-1 rounded-md bg-rose-600 hover:bg-rose-700 disabled:opacity-40 disabled:cursor-not-allowed px-2.5 py-1 text-xs font-semibold text-white cursor-pointer transition">
                                                    - Kurangi
                                                </button>
                                                <button type="button"
                                                        wire:click="mountAction('adjustStock', { variantId: {{ $v->id }}, mode: 'opname' })"
                                                        class="inline-flex items-center gap-1 rounded-md bg-sky-600 hover:bg-sky-700 px-2.5 py-1 text-xs font-semibold text-white cursor-pointer transition">
                                                    Opname
                                                </button>
                                            </div>
                                        @endif
                                    </td>
                                </tr>
                            @empty
                                <tr>
                                    <td colspan="6" class="py-8 text-center text-sm text-gray-500">
                                        Tidak ada data stok produk ditemukan.
                                    </td>
                                </tr>
                            @endforelse
                        </tbody>
                    </table>
                </div>
            </div>
        @elseif($activeTab === 'pergerakan')
            @php
                $totalIn = $movements->filter(fn ($m) => $m['qty_change'] > 0)->sum('qty_change');
                $totalOut = abs($movements->filter(fn ($m) => $m['qty_change'] < 0)->sum('qty_change'));
                $netMove = $totalIn - $totalOut;
            @endphp
            {{-- Riwayat Pergerakan Stok (Pembelian, Penjualan, Opname, Penambahan & Pengurangan Manual) --}}
            <div class="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 shadow-xs space-y-4">
                {{-- Filter Tanggal, Bulan & Pencarian --}}
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 items-end">
                    <div class="lg:col-span-2">
                        <label class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Cari Produk / SKU / Referensi</label>
                        <input
                            type="text"
                            wire:model.live.debounce.300ms="movementSearch"
                            placeholder="Cari nama produk, varian, SKU, PO/AKM/POS/ADJ..."
                            class="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                        />
                    </div>
                    <div>
                        <label class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Pilih Bulan</label>
                        <input
                            type="month"
                            wire:model.live="monthFilter"
                            class="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                        />
                    </div>
                    <div>
                        <label class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Dari Tanggal</label>
                        <input
                            type="date"
                            wire:model.live="startDate"
                            class="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                        />
                    </div>
                    <div class="flex items-end gap-2">
                        <div class="flex-1">
                            <label class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Sampai Tanggal</label>
                            <input
                                type="date"
                                wire:model.live="endDate"
                                class="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                            />
                        </div>
                        <button type="button"
                                wire:click="resetMovementDates"
                                class="px-2.5 py-2 rounded-lg border border-gray-300 dark:border-gray-700 text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
                                title="Tampilkan semua tanggal">
                            Reset
                        </button>
                    </div>
                </div>

                {{-- Filter Sumber & Ringkasan Masuk/Keluar --}}
                <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pt-2 border-t border-gray-100 dark:border-gray-800">
                    <div class="flex flex-wrap items-center gap-1.5 text-xs">
                        @foreach([
                            'all' => 'Semua',
                            'purchase' => 'Pembelian (PO)',
                            'sales' => 'Semua Penjualan',
                            'web_order' => 'Penjualan Web',
                            'pos_order' => 'Penjualan POS',
                            'opname' => 'Opname',
                            'manual_in' => 'Penambahan Manual',
                            'manual_out' => 'Pengurangan Manual',
                        ] as $mKey => $mLabel)
                            <button type="button"
                                    wire:click="$set('movementSource', '{{ $mKey }}')"
                                    class="px-2.5 py-1.5 rounded-lg font-medium transition cursor-pointer {{ $movementSource === $mKey ? 'bg-sky-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700' }}">
                                {{ $mLabel }}
                            </button>
                        @endforeach
                    </div>

                    <div class="flex flex-wrap items-center gap-3 text-xs font-semibold">
                        <span class="px-2.5 py-1 rounded-md bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300">
                            Masuk: +{{ number_format($totalIn) }} pcs
                        </span>
                        <span class="px-2.5 py-1 rounded-md bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300">
                            Keluar: -{{ number_format($totalOut) }} pcs
                        </span>
                        <span class="px-2.5 py-1 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200">
                            Selisih: {{ $netMove >= 0 ? '+' . number_format($netMove) : number_format($netMove) }} pcs
                        </span>
                    </div>
                </div>

                <div class="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-800">
                    <table class="w-full text-left border-collapse text-xs sm:text-sm">
                        <thead>
                            <tr class="border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/60 text-gray-600 dark:text-gray-300 font-semibold">
                                <th class="py-3 px-4">Waktu</th>
                                <th class="py-3 px-4">No. Referensi</th>
                                <th class="py-3 px-4">Sumber</th>
                                <th class="py-3 px-4">Produk & Varian</th>
                                <th class="py-3 px-4">SKU</th>
                                <th class="py-3 px-4 text-center">Pergerakan</th>
                                <th class="py-3 px-4">Keterangan</th>
                                <th class="py-3 px-4">Oleh</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-100 dark:divide-gray-800">
                            @forelse($movements as $mov)
                                <tr class="hover:bg-gray-50/70 dark:hover:bg-gray-800/30">
                                    <td class="py-3 px-4 text-gray-600 dark:text-gray-300 whitespace-nowrap">{{ $mov['date'] }}</td>
                                    <td class="py-3 px-4 font-mono font-semibold text-gray-900 dark:text-white whitespace-nowrap">{{ $mov['ref'] }}</td>
                                    <td class="py-3 px-4 whitespace-nowrap">
                                        @if($mov['source'] === 'purchase')
                                            <span class="px-2 py-0.5 rounded bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 text-xs font-semibold">{{ $mov['source_label'] }}</span>
                                        @elseif($mov['source'] === 'web_order')
                                            <span class="px-2 py-0.5 rounded bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 text-xs font-semibold">{{ $mov['source_label'] }}</span>
                                        @elseif($mov['source'] === 'pos_order')
                                            <span class="px-2 py-0.5 rounded bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 text-xs font-semibold">{{ $mov['source_label'] }}</span>
                                        @elseif($mov['source'] === 'manual_in')
                                            <span class="px-2 py-0.5 rounded bg-teal-100 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300 text-xs font-semibold">{{ $mov['source_label'] }}</span>
                                        @elseif($mov['source'] === 'manual_out')
                                            <span class="px-2 py-0.5 rounded bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 text-xs font-semibold">{{ $mov['source_label'] }}</span>
                                        @else
                                            <span class="px-2 py-0.5 rounded bg-sky-100 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300 text-xs font-semibold">{{ $mov['source_label'] }}</span>
                                        @endif
                                    </td>
                                    <td class="py-3 px-4">
                                        <div class="font-semibold text-gray-900 dark:text-white">{{ $mov['product_name'] }}</div>
                                        @if (!\App\Support\VariantHelper::isStandard($mov['variant_label']))
                                            <div class="text-xs text-gray-500">{{ $mov['variant_label'] }}</div>
                                        @endif
                                    </td>
                                    <td class="py-3 px-4 font-mono text-xs text-gray-600 dark:text-gray-300">{{ $mov['sku'] }}</td>
                                    <td class="py-3 px-4 text-center font-bold {{ $mov['qty_change'] >= 0 ? 'text-emerald-600' : 'text-rose-600' }}">
                                        {{ $mov['qty_change'] >= 0 ? '+' . $mov['qty_change'] : $mov['qty_change'] }} pcs
                                    </td>
                                    <td class="py-3 px-4 text-xs text-gray-600 dark:text-gray-300">{{ $mov['notes'] }}</td>
                                    <td class="py-3 px-4 text-gray-700 dark:text-gray-300">{{ $mov['actor'] }}</td>
                                </tr>
                            @empty
                                <tr>
                                    <td colspan="8" class="py-8 text-center text-sm text-gray-500">
                                        Belum ada riwayat pergerakan stok.
                                    </td>
                                </tr>
                            @endforelse
                        </tbody>
                    </table>
                </div>
            </div>
        @else
            {{-- Riwayat Penyesuaian Stok --}}
            <div class="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-xs overflow-hidden">
                <div class="overflow-x-auto">
                    <table class="w-full text-left border-collapse text-xs sm:text-sm">
                        <thead>
                            <tr class="border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/60 text-gray-600 dark:text-gray-300 font-semibold">
                                <th class="py-3 px-4">No. Penyesuaian</th>
                                <th class="py-3 px-4">Waktu</th>
                                <th class="py-3 px-4">Produk & Varian</th>
                                <th class="py-3 px-4 text-center">Jenis</th>
                                <th class="py-3 px-4 text-center">Stok Awal</th>
                                <th class="py-3 px-4 text-center">Perubahan</th>
                                <th class="py-3 px-4 text-center">Stok Akhir</th>
                                <th class="py-3 px-4">Alasan / Catatan</th>
                                <th class="py-3 px-4">Admin</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-100 dark:divide-gray-800">
                            @forelse($adjustments as $adj)
                                <tr class="hover:bg-gray-50/70 dark:hover:bg-gray-800/30">
                                    <td class="py-3 px-4 font-mono font-semibold text-gray-900 dark:text-white">
                                        {{ $adj->adjustment_number }}
                                    </td>
                                    <td class="py-3 px-4 text-gray-600 dark:text-gray-300 whitespace-nowrap">
                                        {{ $adj->created_at?->format('d M Y, H:i') }}
                                    </td>
                                    <td class="py-3 px-4">
                                        <div class="font-semibold text-gray-900 dark:text-white">{{ $adj->product?->name ?? '—' }}</div>
                                        <div class="text-xs text-gray-500">{{ $adj->variant?->label ?? 'Default' }}</div>
                                    </td>
                                    <td class="py-3 px-4 text-center">
                                        @if($adj->type === 'in')
                                            <span class="px-2 py-0.5 rounded bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 text-xs font-semibold">Tambah</span>
                                        @elseif($adj->type === 'out')
                                            <span class="px-2 py-0.5 rounded bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 text-xs font-semibold">Kurang</span>
                                        @else
                                            <span class="px-2 py-0.5 rounded bg-sky-100 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300 text-xs font-semibold">Opname</span>
                                        @endif
                                    </td>
                                    <td class="py-3 px-4 text-center text-gray-600 dark:text-gray-300">{{ $adj->qty_before }}</td>
                                    <td class="py-3 px-4 text-center font-bold {{ $adj->qty_change >= 0 ? 'text-emerald-600' : 'text-rose-600' }}">
                                        {{ $adj->qty_change >= 0 ? '+' . $adj->qty_change : $adj->qty_change }}
                                    </td>
                                    <td class="py-3 px-4 text-center font-bold text-gray-900 dark:text-white">{{ $adj->qty_after }}</td>
                                    <td class="py-3 px-4">
                                        <div class="font-medium text-gray-800 dark:text-gray-200">{{ $adj->reason }}</div>
                                        @if($adj->notes)
                                            <div class="text-xs text-gray-500">{{ $adj->notes }}</div>
                                        @endif
                                    </td>
                                    <td class="py-3 px-4 text-gray-600 dark:text-gray-300">
                                        {{ $adj->user?->name ?? 'Admin' }}
                                    </td>
                                </tr>
                            @empty
                                <tr>
                                    <td colspan="9" class="py-8 text-center text-sm text-gray-500">
                                        Belum ada riwayat penyesuaian stok.
                                    </td>
                                </tr>
                            @endforelse
                        </tbody>
                    </table>
                </div>
            </div>
        @endif
    </div>
</x-filament-panels::page>
