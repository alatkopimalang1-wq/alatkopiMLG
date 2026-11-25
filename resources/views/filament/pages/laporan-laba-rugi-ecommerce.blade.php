<x-filament-panels::page>
    @php
        $report = $this->reportData;
        $summary = $report['summary'];
        $dailySummary = $report['daily_summary'];
        $monthlySummary = $report['monthly_summary'];
        $transactions = $report['transactions'];
        $productBreakdowns = $report['product_breakdowns'];
        $catalogMappings = $report['catalog_mappings'];

        // Filter transactions by search query
        $filteredTransactions = $transactions;
        if (!empty($this->searchTransaction)) {
            $q = strtolower(trim($this->searchTransaction));
            $filteredTransactions = array_filter($transactions, function ($trx) use ($q) {
                return str_contains(strtolower($trx['order_number']), $q)
                    || str_contains(strtolower($trx['customer_name']), $q)
                    || str_contains(strtolower($trx['customer_phone'] ?? ''), $q)
                    || str_contains(strtolower($trx['tracking_number'] ?? ''), $q);
            });
        }

        // Filter products by search query
        $filteredProducts = $productBreakdowns;
        if (!empty($this->searchProduct)) {
            $qp = strtolower(trim($this->searchProduct));
            $filteredProducts = array_filter($productBreakdowns, function ($p) use ($qp) {
                return str_contains(strtolower($p['web_product_name']), $qp)
                    || str_contains(strtolower($p['web_variant_name']), $qp)
                    || str_contains(strtolower($p['marketplace_name']), $qp);
            });
        }

        // Filter catalog mappings by search query
        $filteredCatalog = $catalogMappings;
        if (!empty($this->searchCatalog)) {
            $qc = strtolower(trim($this->searchCatalog));
            $filteredCatalog = array_filter($catalogMappings, function ($c) use ($qc) {
                return str_contains(strtolower($c['marketplace_product_name']), $qc)
                    || str_contains(strtolower($c['marketplace_sku_name']), $qc)
                    || str_contains(strtolower($c['seller_sku'] ?? ''), $qc)
                    || str_contains(strtolower($c['web_product_name']), $qc)
                    || str_contains(strtolower($c['web_variant_name']), $qc);
            });
        }
    @endphp

    <div class="space-y-6">
        {{-- ========================================================================= --}}
        {{-- 1. HEADER INFO & BADGES                                                   --}}
        {{-- ========================================================================= --}}
        <div class="p-6 rounded-2xl bg-gradient-to-r from-amber-900 via-stone-900 to-zinc-900 text-white shadow-lg border border-amber-700/40">
            <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div class="space-y-1.5">
                    <div class="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-semibold uppercase tracking-wider border border-amber-500/30">
                        <span class="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
                        Penjualan Ecommerce Berbasis Produk Website (Potongan Admin 15%)
                    </div>
                    <h2 class="text-2xl font-black tracking-tight text-white">
                        Laporan Laba Rugi Penjualan Ecommerce
                    </h2>
                    <p class="text-xs md:text-sm text-amber-100/80 max-w-3xl leading-relaxed">
                        Kalkulasi real-time omset dan HPP diambil dari <strong>standar produk website yang sudah disinkronisasikan</strong>, dengan <strong>potongan otomatis 15% sebagai biaya admin marketplace</strong> pada laba kotor.
                    </p>
                </div>
                <div class="flex flex-wrap items-center gap-2">
                    <span class="px-3 py-1.5 rounded-xl bg-black/40 text-amber-200 text-xs font-mono border border-amber-500/30">
                        {{ \Carbon\Carbon::parse($report['start_date'])->translatedFormat('d M Y') }} — {{ \Carbon\Carbon::parse($report['end_date'])->translatedFormat('d M Y') }}
                    </span>
                    @if ($summary['is_profitable'])
                        <span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/30 text-emerald-200 text-xs font-bold border border-emerald-400/50">
                            <svg class="w-4 h-4 text-emerald-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>
                            Profit Positif
                        </span>
                    @else
                        <span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/30 text-rose-200 text-xs font-bold border border-rose-400/50">
                            Defisit
                        </span>
                    @endif
                </div>
            </div>
        </div>

        {{-- ========================================================================= --}}
        {{-- 2. FILTER PERIODE WAKTU                                                   --}}
        {{-- ========================================================================= --}}
        <div class="p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-xs space-y-4">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <span class="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Pilih Periode Penjualan:
                </span>
                <div class="inline-flex flex-wrap items-center gap-1.5 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl text-xs font-medium">
                    <button
                        type="button"
                        wire:click="setPeriod('today')"
                        class="px-3 py-1.5 rounded-lg transition cursor-pointer {{ $period === 'today' ? 'bg-amber-600 text-white font-bold shadow-xs' : 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white' }}"
                    >
                        Hari Ini
                    </button>
                    <button
                        type="button"
                        wire:click="setPeriod('yesterday')"
                        class="px-3 py-1.5 rounded-lg transition cursor-pointer {{ $period === 'yesterday' ? 'bg-amber-600 text-white font-bold shadow-xs' : 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white' }}"
                    >
                        Kemarin
                    </button>
                    <button
                        type="button"
                        wire:click="setPeriod('this_month')"
                        class="px-3 py-1.5 rounded-lg transition cursor-pointer {{ $period === 'this_month' ? 'bg-amber-600 text-white font-bold shadow-xs' : 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white' }}"
                    >
                        Bulan Ini
                    </button>
                    <button
                        type="button"
                        wire:click="setPeriod('last_month')"
                        class="px-3 py-1.5 rounded-lg transition cursor-pointer {{ $period === 'last_month' ? 'bg-amber-600 text-white font-bold shadow-xs' : 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white' }}"
                    >
                        Bulan Lalu
                    </button>
                    <button
                        type="button"
                        wire:click="setPeriod('custom_month')"
                        class="px-3 py-1.5 rounded-lg transition cursor-pointer {{ $period === 'custom_month' ? 'bg-amber-600 text-white font-bold shadow-xs' : 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white' }}"
                    >
                        Pilih Bulan
                    </button>
                    <button
                        type="button"
                        wire:click="setPeriod('custom_range')"
                        class="px-3 py-1.5 rounded-lg transition cursor-pointer {{ $period === 'custom_range' ? 'bg-amber-600 text-white font-bold shadow-xs' : 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white' }}"
                    >
                        Rentang Tanggal
                    </button>
                </div>
            </div>

            {{-- Custom Month Input --}}
            @if ($period === 'custom_month')
                <div class="pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center gap-3 text-xs">
                    <label class="font-semibold text-gray-700 dark:text-gray-300">Pilih Bulan & Tahun:</label>
                    <input
                        type="month"
                        wire:model.live="selectedMonth"
                        class="px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-xs font-medium"
                    />
                    <span class="text-gray-500">
                        Menampilkan bulan {{ \Carbon\Carbon::parse(($selectedMonth ?: now()->format('Y-m')) . '-01')->translatedFormat('F Y') }}
                    </span>
                </div>
            @endif

            {{-- Custom Date Range Input --}}
            @if ($period === 'custom_range')
                <div class="pt-3 border-t border-gray-100 dark:border-gray-800 flex flex-wrap items-center gap-3 text-xs">
                    <div class="flex items-center gap-2">
                        <label class="font-semibold text-gray-700 dark:text-gray-300">Mulai:</label>
                        <input
                            type="date"
                            wire:model.live="startDate"
                            class="px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-xs font-medium"
                        />
                    </div>
                    <div class="flex items-center gap-2">
                        <label class="font-semibold text-gray-700 dark:text-gray-300">Sampai:</label>
                        <input
                            type="date"
                            wire:model.live="endDate"
                            class="px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-xs font-medium"
                        />
                    </div>
                </div>
            @endif
        </div>

        {{-- ========================================================================= --}}
        {{-- 3. STATISTIK UTAMA (5 KPI CARDS)                                          --}}
        {{-- ========================================================================= --}}
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {{-- Card 1: Omset Nilai Website --}}
            <div class="p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-xs space-y-2">
                <div class="flex items-center justify-between text-gray-500 dark:text-gray-400 text-xs font-semibold uppercase">
                    <span>Omset Produk Web</span>
                    <span class="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    </span>
                </div>
                <div class="text-xl font-black text-gray-900 dark:text-white">
                    Rp {{ number_format($summary['web_gross_revenue'], 0, ',', '.') }}
                </div>
                <p class="text-[11px] text-gray-400">
                    Katalog web dari {{ $summary['total_units_sold'] }} unit terjual.
                </p>
            </div>

            {{-- Card 2: Total HPP Website (Modal) --}}
            <div class="p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-xs space-y-2">
                <div class="flex items-center justify-between text-gray-500 dark:text-gray-400 text-xs font-semibold uppercase">
                    <span>Total HPP Website</span>
                    <span class="p-2 rounded-xl bg-stone-500/10 text-stone-600 dark:text-stone-400">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg>
                    </span>
                </div>
                <div class="text-xl font-black text-rose-600 dark:text-rose-400">
                    Rp {{ number_format($summary['web_total_cost'], 0, ',', '.') }}
                </div>
                <p class="text-[11px] text-gray-400">
                    Total modal/HPP produk website yang keluar.
                </p>
            </div>

            {{-- Card 3: Biaya Admin Ecommerce (15%) --}}
            <div class="p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-xs space-y-2">
                <div class="flex items-center justify-between text-gray-500 dark:text-gray-400 text-xs font-semibold uppercase">
                    <span>Admin Ecommerce (15%)</span>
                    <span class="p-2 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                    </span>
                </div>
                <div class="text-xl font-black text-purple-600 dark:text-purple-400">
                    - Rp {{ number_format($summary['total_admin_fee'], 0, ',', '.') }}
                </div>
                <p class="text-[11px] text-gray-400">
                    Potongan otomatis 15% biaya marketplace.
                </p>
            </div>

            {{-- Card 4: Laba Bersih Setelah Biaya Admin --}}
            <div class="p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-xs space-y-2">
                <div class="flex items-center justify-between text-gray-500 dark:text-gray-400 text-xs font-semibold uppercase">
                    <span>Laba Bersih Akhir</span>
                    <span class="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>
                    </span>
                </div>
                <div class="text-xl font-black {{ $summary['web_net_profit'] >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400' }}">
                    Rp {{ number_format($summary['web_net_profit'], 0, ',', '.') }}
                </div>
                <div class="flex items-center gap-1.5 text-xs">
                    <span class="font-bold {{ $summary['web_net_margin_pct'] >= 0 ? 'text-emerald-500' : 'text-rose-500' }}">
                        Margin Bersih: {{ $summary['web_net_margin_pct'] }}%
                    </span>
                </div>
            </div>

            {{-- Card 5: Volume & Master Mapping --}}
            <div class="p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-xs space-y-2">
                <div class="flex items-center justify-between text-gray-500 dark:text-gray-400 text-xs font-semibold uppercase">
                    <span>Volume & Mapping</span>
                    <span class="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 7v10c0 2 1 3 3 3h10c2 0 3-1 3-3V7c0-2-1-3-3-3H7c-2 0-3 1-3 3zm0 5h16"></path></svg>
                    </span>
                </div>
                <div class="text-xl font-black text-gray-900 dark:text-white">
                    {{ $summary['total_transactions'] }} <span class="text-xs font-semibold text-gray-400">Pesanan</span>
                </div>
                <p class="text-[11px] text-gray-400">
                    <strong>{{ $summary['total_synchronized_products'] }}</strong> produk website aktif terhubung.
                </p>
            </div>
        </div>

        {{-- ========================================================================= --}}
        {{-- 4. VIEW TABS                                                              --}}
        {{-- ========================================================================= --}}
        <div class="flex items-center gap-2 border-b border-gray-200 dark:border-gray-800 pb-2 overflow-x-auto scrollbar-none">
            <button
                type="button"
                wire:click="setActiveTab('ringkasan')"
                class="px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer {{ $activeViewTab === 'ringkasan' ? 'bg-amber-600 text-white shadow-xs' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800' }}"
            >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
                <span>Ringkasan & Tren Harian</span>
            </button>

            <button
                type="button"
                wire:click="setActiveTab('produk')"
                class="px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer {{ $activeViewTab === 'produk' ? 'bg-amber-600 text-white shadow-xs' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800' }}"
            >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>
                <span>Performa Produk Terjual ({{ count($productBreakdowns) }})</span>
            </button>

            <button
                type="button"
                wire:click="setActiveTab('pesanan')"
                class="px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer {{ $activeViewTab === 'pesanan' ? 'bg-amber-600 text-white shadow-xs' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800' }}"
            >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path></svg>
                <span>Rincian Pesanan Ecommerce ({{ count($transactions) }})</span>
            </button>

            <button
                type="button"
                wire:click="setActiveTab('katalog')"
                class="px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer {{ $activeViewTab === 'katalog' ? 'bg-amber-600 text-white shadow-xs' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800' }}"
            >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
                <span>Katalog Produk Tersinkronisasi ({{ count($catalogMappings) }})</span>
            </button>
        </div>

        {{-- ========================================================================= --}}
        {{-- 5. TAB CONTENT: RINGKASAN & TREN HARIAN                                   --}}
        {{-- ========================================================================= --}}
        @if ($activeViewTab === 'ringkasan')
            <div class="space-y-6">
                {{-- Penjelasan Kebijakan Laba Rugi & Biaya Admin --}}
                <div class="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-3">
                    <svg class="w-5 h-5 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    <div class="space-y-1">
                        <span class="font-bold">Rumus Perhitungan Laba Rugi Penjualan Ecommerce:</span>
                        <p class="leading-relaxed text-amber-800/90 dark:text-amber-300/80">
                            • <strong>Omset Produk Website</strong> = Harga Jual Katalog Website × Kuantiti Terjual.<br>
                            • <strong>Laba Kotor</strong> = Omset Produk Website − Total HPP (Modal) Produk Website.<br>
                            • <strong>Potongan Admin Ecommerce</strong> = 15% × Omset Penjualan Produk Website.<br>
                            • <strong>Laba Bersih Akhir</strong> = Laba Kotor − Potongan Biaya Admin 15%.
                        </p>
                    </div>
                </div>

                {{-- Tabel Tren Harian --}}
                <div class="rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-xs overflow-hidden">
                    <div class="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                        <h3 class="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <span>Rekap Penjualan Harian</span>
                            <span class="text-xs font-normal text-gray-400">({{ count($dailySummary) }} hari aktif)</span>
                        </h3>
                    </div>
                    <div class="overflow-x-auto">
                        <table class="w-full text-left text-xs divide-y divide-gray-100 dark:divide-gray-800">
                            <thead class="bg-gray-50 dark:bg-gray-800/60 text-gray-500 uppercase font-semibold text-[11px]">
                                <tr>
                                    <th class="py-3 px-4">Tanggal</th>
                                    <th class="py-3 px-4 text-center">Pesanan</th>
                                    <th class="py-3 px-4 text-center">Unit</th>
                                    <th class="py-3 px-4 text-right">Omset Nilai Web</th>
                                    <th class="py-3 px-4 text-right">HPP Web (Modal)</th>
                                    <th class="py-3 px-4 text-right">Laba Kotor</th>
                                    <th class="py-3 px-4 text-right">Admin (15%)</th>
                                    <th class="py-3 px-4 text-right">Laba Bersih Akhir</th>
                                    <th class="py-3 px-4 text-center">Margin</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-gray-100 dark:divide-gray-800">
                                @forelse ($dailySummary as $day)
                                    <tr class="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition">
                                        <td class="py-3 px-4 font-medium text-gray-900 dark:text-white whitespace-nowrap">
                                            {{ $day['date_label'] }}
                                            <span class="text-[11px] text-gray-400 block font-normal">{{ $day['day_name'] }}</span>
                                        </td>
                                        <td class="py-3 px-4 text-center whitespace-nowrap font-semibold">
                                            {{ $day['orders_count'] }}
                                        </td>
                                        <td class="py-3 px-4 text-center whitespace-nowrap">
                                            <span class="px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800 font-semibold">
                                                {{ $day['units_sold'] }} unit
                                            </span>
                                        </td>
                                        <td class="py-3 px-4 text-right whitespace-nowrap font-bold text-gray-900 dark:text-white">
                                            Rp {{ number_format($day['web_revenue'], 0, ',', '.') }}
                                        </td>
                                        <td class="py-3 px-4 text-right whitespace-nowrap font-medium text-rose-600 dark:text-rose-400">
                                            Rp {{ number_format($day['web_cost'], 0, ',', '.') }}
                                        </td>
                                        <td class="py-3 px-4 text-right whitespace-nowrap font-semibold text-gray-800 dark:text-gray-200">
                                            Rp {{ number_format($day['gross_profit'], 0, ',', '.') }}
                                        </td>
                                        <td class="py-3 px-4 text-right whitespace-nowrap font-medium text-purple-600 dark:text-purple-400">
                                            - Rp {{ number_format($day['admin_fee'], 0, ',', '.') }}
                                        </td>
                                        <td class="py-3 px-4 text-right whitespace-nowrap font-bold {{ $day['net_profit'] >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400' }}">
                                            Rp {{ number_format($day['net_profit'], 0, ',', '.') }}
                                        </td>
                                        <td class="py-3 px-4 text-center whitespace-nowrap">
                                            <span class="px-2 py-0.5 rounded-md text-[11px] font-bold {{ $day['margin_pct'] >= 0 ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400' : 'bg-rose-100 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400' }}">
                                                {{ $day['margin_pct'] }}%
                                            </span>
                                        </td>
                                    </tr>
                                @empty
                                    <tr>
                                        <td colspan="9" class="py-8 text-center text-gray-400 text-xs">
                                            Belum ada data pesanan ecommerce pada periode ini.
                                        </td>
                                    </tr>
                                @endforelse
                            </tbody>
                        </table>
                    </div>
                </div>

                {{-- Tabel Rekap Bulanan --}}
                @if (count($monthlySummary) > 1)
                    <div class="rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-xs overflow-hidden">
                        <div class="p-4 border-b border-gray-100 dark:border-gray-800">
                            <h3 class="text-sm font-bold text-gray-900 dark:text-white">Rekap Penjualan Bulanan</h3>
                        </div>
                        <div class="overflow-x-auto">
                            <table class="w-full text-left text-xs divide-y divide-gray-100 dark:divide-gray-800">
                                <thead class="bg-gray-50 dark:bg-gray-800/60 text-gray-500 uppercase font-semibold text-[11px]">
                                    <tr>
                                        <th class="py-3 px-4">Bulan</th>
                                        <th class="py-3 px-4 text-center">Pesanan</th>
                                        <th class="py-3 px-4 text-center">Unit</th>
                                        <th class="py-3 px-4 text-right">Omset Nilai Web</th>
                                        <th class="py-3 px-4 text-right">Total HPP Web</th>
                                        <th class="py-3 px-4 text-right">Laba Kotor</th>
                                        <th class="py-3 px-4 text-right">Admin (15%)</th>
                                        <th class="py-3 px-4 text-right">Laba Bersih Akhir</th>
                                        <th class="py-3 px-4 text-center">Margin</th>
                                    </tr>
                                </thead>
                                <tbody class="divide-y divide-gray-100 dark:divide-gray-800">
                                    @foreach ($monthlySummary as $m)
                                        <tr class="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition">
                                            <td class="py-3 px-4 font-bold text-gray-900 dark:text-white">
                                                {{ $m['month_label'] }}
                                            </td>
                                            <td class="py-3 px-4 text-center font-semibold">
                                                {{ $m['orders_count'] }}
                                            </td>
                                            <td class="py-3 px-4 text-center">
                                                {{ $m['units_sold'] }} unit
                                            </td>
                                            <td class="py-3 px-4 text-right font-bold text-gray-900 dark:text-white">
                                                Rp {{ number_format($m['web_revenue'], 0, ',', '.') }}
                                            </td>
                                            <td class="py-3 px-4 text-right text-rose-600 dark:text-rose-400 font-medium">
                                                Rp {{ number_format($m['web_cost'], 0, ',', '.') }}
                                            </td>
                                            <td class="py-3 px-4 text-right font-semibold text-gray-800 dark:text-gray-200">
                                                Rp {{ number_format($m['gross_profit'], 0, ',', '.') }}
                                            </td>
                                            <td class="py-3 px-4 text-right font-medium text-purple-600 dark:text-purple-400">
                                                - Rp {{ number_format($m['admin_fee'], 0, ',', '.') }}
                                            </td>
                                            <td class="py-3 px-4 text-right font-bold {{ $m['net_profit'] >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400' }}">
                                                Rp {{ number_format($m['net_profit'], 0, ',', '.') }}
                                            </td>
                                            <td class="py-3 px-4 text-center">
                                                <span class="px-2 py-0.5 rounded-md font-bold {{ $m['margin_pct'] >= 0 ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400' : 'bg-rose-100 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400' }}">
                                                    {{ $m['margin_pct'] }}%
                                                </span>
                                            </td>
                                        </tr>
                                    @endforeach
                                </tbody>
                            </table>
                        </div>
                    </div>
                @endif
            </div>
        @endif

        {{-- ========================================================================= --}}
        {{-- 6. TAB CONTENT: PERFORMA PRODUK TERJUAL                                   --}}
        {{-- ========================================================================= --}}
        @if ($activeViewTab === 'produk')
            <div class="space-y-4">
                <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div class="w-full sm:w-80">
                        <x-filament::input.wrapper prefix-icon="heroicon-m-magnifying-glass">
                            <x-filament::input
                                wire:model.live.debounce.300ms="searchProduct"
                                type="text"
                                placeholder="Cari nama produk website atau varian..."
                            />
                        </x-filament::input.wrapper>
                    </div>
                    <span class="text-xs text-gray-400">
                        Menampilkan {{ count($filteredProducts) }} produk terjual
                    </span>
                </div>

                <div class="rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-xs overflow-hidden">
                    <div class="overflow-x-auto">
                        <table class="w-full text-left text-xs divide-y divide-gray-100 dark:divide-gray-800">
                            <thead class="bg-gray-50 dark:bg-gray-800/60 text-gray-500 uppercase font-semibold text-[11px]">
                                <tr>
                                    <th class="py-3 px-4">Produk Website & Varian</th>
                                    <th class="py-3 px-4">Nama di Marketplace</th>
                                    <th class="py-3 px-4 text-right">Harga Web</th>
                                    <th class="py-3 px-4 text-right">HPP Web</th>
                                    <th class="py-3 px-4 text-right">Admin (15%)</th>
                                    <th class="py-3 px-4 text-right">Laba Bersih/Unit</th>
                                    <th class="py-3 px-4 text-center">Terjual</th>
                                    <th class="py-3 px-4 text-right">Total Omset</th>
                                    <th class="py-3 px-4 text-right">Total HPP</th>
                                    <th class="py-3 px-4 text-right">Total Admin 15%</th>
                                    <th class="py-3 px-4 text-right">Laba Bersih Akhir</th>
                                    <th class="py-3 px-4 text-center">Margin</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-gray-100 dark:divide-gray-800">
                                @forelse ($filteredProducts as $p)
                                    <tr class="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition">
                                        <td class="py-3 px-4 font-bold text-gray-900 dark:text-white whitespace-nowrap">
                                            {{ $p['web_product_name'] }}
                                            <span class="block text-[11px] font-semibold text-amber-600 dark:text-amber-400">
                                                {{ $p['web_variant_name'] }}
                                            </span>
                                        </td>
                                        <td class="py-3 px-4 text-gray-600 dark:text-gray-300 max-w-xs truncate" title="{{ $p['marketplace_name'] }}">
                                            {{ $p['marketplace_name'] }}
                                        </td>
                                        <td class="py-3 px-4 text-right whitespace-nowrap font-semibold">
                                            Rp {{ number_format($p['web_unit_price'], 0, ',', '.') }}
                                        </td>
                                        <td class="py-3 px-4 text-right whitespace-nowrap font-medium text-rose-600 dark:text-rose-400">
                                            Rp {{ number_format($p['web_unit_cost'], 0, ',', '.') }}
                                        </td>
                                        <td class="py-3 px-4 text-right whitespace-nowrap font-medium text-purple-600 dark:text-purple-400">
                                            - Rp {{ number_format($p['unit_admin_fee'], 0, ',', '.') }}
                                        </td>
                                        <td class="py-3 px-4 text-right whitespace-nowrap font-bold text-emerald-600 dark:text-emerald-400">
                                            Rp {{ number_format($p['unit_net_profit'], 0, ',', '.') }}
                                        </td>
                                        <td class="py-3 px-4 text-center whitespace-nowrap">
                                            <span class="px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800 font-bold">
                                                {{ $p['units_sold'] }}x
                                            </span>
                                        </td>
                                        <td class="py-3 px-4 text-right whitespace-nowrap font-bold text-gray-900 dark:text-white">
                                            Rp {{ number_format($p['total_web_revenue'], 0, ',', '.') }}
                                        </td>
                                        <td class="py-3 px-4 text-right whitespace-nowrap font-medium text-rose-600 dark:text-rose-400">
                                            Rp {{ number_format($p['total_web_cost'], 0, ',', '.') }}
                                        </td>
                                        <td class="py-3 px-4 text-right whitespace-nowrap font-medium text-purple-600 dark:text-purple-400">
                                            - Rp {{ number_format($p['total_admin_fee'], 0, ',', '.') }}
                                        </td>
                                        <td class="py-3 px-4 text-right whitespace-nowrap font-bold {{ $p['total_net_profit'] >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400' }}">
                                            Rp {{ number_format($p['total_net_profit'], 0, ',', '.') }}
                                        </td>
                                        <td class="py-3 px-4 text-center whitespace-nowrap">
                                            <span class="px-2 py-0.5 rounded-md font-bold text-[11px] {{ $p['margin_pct'] >= 0 ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400' : 'bg-rose-100 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400' }}">
                                                {{ $p['margin_pct'] }}%
                                            </span>
                                        </td>
                                    </tr>
                                @empty
                                    <tr>
                                        <td colspan="12" class="py-8 text-center text-gray-400 text-xs">
                                            Tidak ada produk yang terjual sesuai kriteria.
                                        </td>
                                    </tr>
                                @endforelse
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        @endif

        {{-- ========================================================================= --}}
        {{-- 7. TAB CONTENT: RINCIAN PESANAN ECOMMERCE                                 --}}
        {{-- ========================================================================= --}}
        @if ($activeViewTab === 'pesanan')
            <div class="space-y-4">
                <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div class="w-full sm:w-80">
                        <x-filament::input.wrapper prefix-icon="heroicon-m-magnifying-glass">
                            <x-filament::input
                                wire:model.live.debounce.300ms="searchTransaction"
                                type="text"
                                placeholder="Cari No. Pesanan, Pembeli, Resi..."
                            />
                        </x-filament::input.wrapper>
                    </div>
                    <span class="text-xs text-gray-400">
                        Menampilkan {{ count($filteredTransactions) }} pesanan ecommerce
                    </span>
                </div>

                <div class="rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-xs overflow-hidden">
                    <div class="overflow-x-auto">
                        <table class="w-full text-left text-xs divide-y divide-gray-100 dark:divide-gray-800">
                            <thead class="bg-gray-50 dark:bg-gray-800/60 text-gray-500 uppercase font-semibold text-[11px]">
                                <tr>
                                    <th class="py-3 px-4">No. Pesanan & Waktu</th>
                                    <th class="py-3 px-4">Pembeli</th>
                                    <th class="py-3 px-4">Produk Website Dipesan</th>
                                    <th class="py-3 px-4 text-right">Omset Nilai Web</th>
                                    <th class="py-3 px-4 text-right">HPP Web</th>
                                    <th class="py-3 px-4 text-right">Laba Kotor</th>
                                    <th class="py-3 px-4 text-right">Admin (15%)</th>
                                    <th class="py-3 px-4 text-right">Laba Bersih</th>
                                    <th class="py-3 px-4 text-center">Status</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-gray-100 dark:divide-gray-800">
                                @forelse ($filteredTransactions as $trx)
                                    <tr class="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition">
                                        <td class="py-3 px-4 whitespace-nowrap align-top">
                                            <span class="font-mono font-bold text-amber-600 dark:text-amber-400 block">
                                                {{ $trx['order_number'] }}
                                            </span>
                                            <span class="text-[11px] text-gray-400 block mt-0.5">
                                                {{ $trx['created_at_formatted'] }}
                                            </span>
                                            <span class="text-[10px] text-gray-500 block">
                                                {{ $trx['platform'] }}
                                            </span>
                                        </td>
                                        <td class="py-3 px-4 whitespace-nowrap align-top">
                                            <span class="font-semibold text-gray-900 dark:text-white block">
                                                {{ $trx['customer_name'] }}
                                            </span>
                                            <span class="font-mono text-[11px] text-gray-400 block">
                                                {{ $trx['customer_phone'] }}
                                            </span>
                                            @if ($trx['shipping_courier'] !== '-')
                                                <span class="text-[10px] text-gray-500 block mt-0.5">
                                                    {{ $trx['shipping_courier'] }} • {{ $trx['tracking_number'] }}
                                                </span>
                                            @endif
                                        </td>
                                        <td class="py-3 px-4 align-top">
                                            <div class="space-y-1.5 max-w-sm">
                                                @foreach ($trx['items'] as $it)
                                                    <div class="text-xs">
                                                        <span class="font-bold text-amber-600 dark:text-amber-400">{{ $it['quantity'] }}x</span>
                                                        <span class="font-medium text-gray-900 dark:text-white">{{ $it['web_product_name'] }}</span>
                                                        <span class="text-[11px] text-gray-500">({{ $it['web_variant_name'] }})</span>
                                                        <div class="text-[10px] text-gray-400 flex items-center gap-1.5 mt-0.5 flex-wrap">
                                                            <span>Web: Rp {{ number_format($it['web_unit_price'], 0, ',', '.') }}</span>
                                                            <span>• HPP: Rp {{ number_format($it['web_unit_cost'], 0, ',', '.') }}</span>
                                                            <span class="text-purple-500">• Admin: Rp {{ number_format($it['admin_fee'], 0, ',', '.') }}</span>
                                                            <span class="text-emerald-500 font-semibold">• Bersih: Rp {{ number_format($it['net_profit'], 0, ',', '.') }}</span>
                                                        </div>
                                                    </div>
                                                @endforeach
                                            </div>
                                        </td>
                                        <td class="py-3 px-4 text-right whitespace-nowrap align-top font-bold text-gray-900 dark:text-white">
                                            Rp {{ number_format($trx['total_web_revenue'], 0, ',', '.') }}
                                        </td>
                                        <td class="py-3 px-4 text-right whitespace-nowrap align-top font-medium text-rose-600 dark:text-rose-400">
                                            Rp {{ number_format($trx['total_web_cost'], 0, ',', '.') }}
                                        </td>
                                        <td class="py-3 px-4 text-right whitespace-nowrap align-top font-semibold text-gray-800 dark:text-gray-200">
                                            Rp {{ number_format($trx['gross_profit'], 0, ',', '.') }}
                                        </td>
                                        <td class="py-3 px-4 text-right whitespace-nowrap align-top font-medium text-purple-600 dark:text-purple-400">
                                            - Rp {{ number_format($trx['admin_fee'], 0, ',', '.') }}
                                        </td>
                                        <td class="py-3 px-4 text-right whitespace-nowrap align-top font-bold {{ $trx['net_profit'] >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400' }}">
                                            Rp {{ number_format($trx['net_profit'], 0, ',', '.') }}
                                            <span class="block text-[10px] font-normal text-gray-400">
                                                Margin {{ $trx['net_margin_pct'] }}%
                                            </span>
                                        </td>
                                        <td class="py-3 px-4 text-center whitespace-nowrap align-top">
                                            <x-filament::badge :color="$trx['status_color']" size="sm">
                                                {{ $trx['status_label'] }}
                                            </x-filament::badge>
                                        </td>
                                    </tr>
                                @empty
                                    <tr>
                                        <td colspan="9" class="py-8 text-center text-gray-400 text-xs">
                                            Belum ada pesanan ecommerce yang sesuai filter pencarian.
                                        </td>
                                    </tr>
                                @endforelse
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        @endif

        {{-- ========================================================================= --}}
        {{-- 8. TAB CONTENT: KATALOG PRODUK TERSINKRONISASI (MASTER MAPPING)           --}}
        {{-- ========================================================================= --}}
        @if ($activeViewTab === 'katalog')
            <div class="space-y-4">
                <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div class="w-full sm:w-80">
                        <x-filament::input.wrapper prefix-icon="heroicon-m-magnifying-glass">
                            <x-filament::input
                                wire:model.live.debounce.300ms="searchCatalog"
                                type="text"
                                placeholder="Cari produk website, marketplace, SKU..."
                            />
                        </x-filament::input.wrapper>
                    </div>
                    <span class="text-xs text-gray-400">
                        Total <strong>{{ count($filteredCatalog) }}</strong> produk aktif tersinkronisasi
                    </span>
                </div>

                <div class="rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-xs overflow-hidden">
                    <div class="overflow-x-auto">
                        <table class="w-full text-left text-xs divide-y divide-gray-100 dark:divide-gray-800">
                            <thead class="bg-gray-50 dark:bg-gray-800/60 text-gray-500 uppercase font-semibold text-[11px]">
                                <tr>
                                    <th class="py-3 px-4">Marketplace</th>
                                    <th class="py-3 px-4">Nama Produk di Marketplace</th>
                                    <th class="py-3 px-4">SKU / Varian Marketplace</th>
                                    <th class="py-3 px-4">Produk Website Terhubung</th>
                                    <th class="py-3 px-4 text-right">Harga Web</th>
                                    <th class="py-3 px-4 text-right">HPP Web</th>
                                    <th class="py-3 px-4 text-right">Laba Kotor</th>
                                    <th class="py-3 px-4 text-right">Admin (15%)</th>
                                    <th class="py-3 px-4 text-right">Est. Laba Bersih</th>
                                    <th class="py-3 px-4 text-center">Est. Margin</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-gray-100 dark:divide-gray-800">
                                @forelse (array_slice($filteredCatalog, 0, 100) as $cat)
                                    <tr class="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition">
                                        <td class="py-3 px-4 whitespace-nowrap">
                                            <span class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-black text-white dark:bg-white/10 text-[10px] font-bold">
                                                {{ $cat['marketplace'] }}
                                            </span>
                                        </td>
                                        <td class="py-3 px-4 max-w-xs font-medium text-gray-900 dark:text-white truncate" title="{{ $cat['marketplace_product_name'] }}">
                                            {{ $cat['marketplace_product_name'] }}
                                        </td>
                                        <td class="py-3 px-4 whitespace-nowrap">
                                            <span class="font-semibold text-gray-800 dark:text-gray-200">
                                                {{ $cat['marketplace_sku_name'] }}
                                            </span>
                                            @if (!empty($cat['seller_sku']))
                                                <span class="block font-mono text-[10px] text-gray-400 mt-0.5">
                                                    {{ $cat['seller_sku'] }}
                                                </span>
                                            @endif
                                        </td>
                                        <td class="py-3 px-4 whitespace-nowrap">
                                            <span class="font-bold text-amber-600 dark:text-amber-400 block">
                                                {{ $cat['web_product_name'] }}
                                            </span>
                                            <span class="text-[11px] text-gray-500 dark:text-gray-400 block">
                                                Varian: {{ $cat['web_variant_name'] }}
                                            </span>
                                        </td>
                                        <td class="py-3 px-4 text-right whitespace-nowrap font-bold text-gray-900 dark:text-white">
                                            Rp {{ number_format($cat['web_price'], 0, ',', '.') }}
                                        </td>
                                        <td class="py-3 px-4 text-right whitespace-nowrap font-medium text-rose-600 dark:text-rose-400">
                                            Rp {{ number_format($cat['web_cost_price'], 0, ',', '.') }}
                                        </td>
                                        <td class="py-3 px-4 text-right whitespace-nowrap font-semibold text-gray-800 dark:text-gray-200">
                                            Rp {{ number_format($cat['unit_gross_profit'], 0, ',', '.') }}
                                        </td>
                                        <td class="py-3 px-4 text-right whitespace-nowrap font-medium text-purple-600 dark:text-purple-400">
                                            - Rp {{ number_format($cat['unit_admin_fee'], 0, ',', '.') }}
                                        </td>
                                        <td class="py-3 px-4 text-right whitespace-nowrap font-bold text-emerald-600 dark:text-emerald-400">
                                            Rp {{ number_format($cat['estimated_unit_profit'], 0, ',', '.') }}
                                        </td>
                                        <td class="py-3 px-4 text-center whitespace-nowrap">
                                            <span class="px-2 py-0.5 rounded-md font-bold text-[11px] {{ $cat['estimated_margin_pct'] >= 0 ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400' : 'bg-rose-100 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400' }}">
                                                {{ $cat['estimated_margin_pct'] }}%
                                            </span>
                                        </td>
                                    </tr>
                                @empty
                                    <tr>
                                        <td colspan="10" class="py-8 text-center text-gray-400 text-xs">
                                            Tidak ada produk sinkronisasi yang sesuai kriteria pencarian.
                                        </td>
                                    </tr>
                                @endforelse
                            </tbody>
                        </table>
                    </div>
                    @if (count($filteredCatalog) > 100)
                        <div class="p-3 bg-gray-50 dark:bg-gray-800/40 border-t border-gray-100 dark:border-gray-800 text-center text-xs text-gray-400">
                            Menampilkan 100 data pertama dari total {{ count($filteredCatalog) }} produk. Gunakan kotak pencarian untuk mencari produk spesifik.
                        </div>
                    @endif
                </div>
            </div>
        @endif
    </div>
</x-filament-panels::page>
