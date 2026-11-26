<x-filament-panels::page>
    @php
        $report = $this->reportData;
        $summary = $report['summary'];
        $dailySummary = $report['daily_summary'];
        $monthlySummary = $report['monthly_summary'];
        $transactions = $report['transactions'];
        $topProducts = $report['top_products'];
        $expenses = $report['expenses'];
        $expenseBreakdown = $report['expense_breakdown'];

        // Filtered transactions for search
        $filteredTransactions = $transactions;
        if (!empty($this->searchTransaction)) {
            $q = strtolower(trim($this->searchTransaction));
            $filteredTransactions = array_filter($transactions, function ($trx) use ($q) {
                return str_contains(strtolower($trx['order_number']), $q)
                    || str_contains(strtolower($trx['customer_name']), $q)
                    || str_contains(strtolower($trx['customer_phone'] ?? ''), $q)
                    || str_contains(strtolower($trx['payment_method_label'] ?? ''), $q);
            });
        }

        // Filtered products for search
        $filteredProducts = $topProducts;
        if (!empty($this->searchProduct)) {
            $qp = strtolower(trim($this->searchProduct));
            $filteredProducts = array_filter($topProducts, function ($p) use ($qp) {
                return str_contains(strtolower($p['product_name']), $qp)
                    || str_contains(strtolower($p['variant_label'] ?? ''), $qp);
            });
        }

        // Filtered expenses for category and search
        $filteredExpenses = $expenses;
        if ($this->expenseCategory !== 'all') {
            $filteredExpenses = array_filter($filteredExpenses, fn ($e) => $e['category'] === $this->expenseCategory);
        }
        if (!empty($this->searchExpense)) {
            $qe = strtolower(trim($this->searchExpense));
            $filteredExpenses = array_filter($filteredExpenses, function ($exp) use ($qe) {
                return str_contains(strtolower($exp['description']), $qe)
                    || str_contains(strtolower($exp['category_label']), $qe)
                    || str_contains(strtolower($exp['user_name']), $qe);
            });
        }
        $filteredExpenseTotal = array_sum(array_column($filteredExpenses, 'amount'));
    @endphp

    <div class="space-y-6">
        {{-- ========================================================================= --}}
        {{-- 1. HEADER INFO & BADGES                                                   --}}
        {{-- ========================================================================= --}}
        <div class="p-6 rounded-2xl bg-gradient-to-r from-blue-950 via-slate-900 to-zinc-900 text-white shadow-lg border border-blue-700/40">
            <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div class="space-y-1.5">
                    <div class="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold uppercase tracking-wider border border-blue-500/30">
                        <span class="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
                        Khusus Penjualan POS Kasir Toko Fisik (Point of Sale)
                    </div>
                    <h2 class="text-2xl font-black tracking-tight text-white">
                        Laporan Laba Rugi Penjualan POS
                    </h2>
                    <p class="text-xs md:text-sm text-blue-100/80 max-w-3xl leading-relaxed">
                        Kalkulasi real-time omset kasir, HPP produk/biji kopi, biaya operasional kas toko, dan laba bersih murni transaksi POS Alat Kopi Malang.
                    </p>
                </div>
                <div class="flex flex-wrap items-center gap-2">
                    <span class="px-3 py-1.5 rounded-xl bg-black/40 text-blue-200 text-xs font-mono border border-blue-500/30">
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
                        class="px-3 py-1.5 rounded-lg transition cursor-pointer {{ $period === 'today' ? 'bg-blue-600 text-white font-bold shadow-xs' : 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white' }}"
                    >
                        Hari Ini
                    </button>
                    <button
                        type="button"
                        wire:click="setPeriod('yesterday')"
                        class="px-3 py-1.5 rounded-lg transition cursor-pointer {{ $period === 'yesterday' ? 'bg-blue-600 text-white font-bold shadow-xs' : 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white' }}"
                    >
                        Kemarin
                    </button>
                    <button
                        type="button"
                        wire:click="setPeriod('this_month')"
                        class="px-3 py-1.5 rounded-lg transition cursor-pointer {{ $period === 'this_month' ? 'bg-blue-600 text-white font-bold shadow-xs' : 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white' }}"
                    >
                        Bulan Ini
                    </button>
                    <button
                        type="button"
                        wire:click="setPeriod('last_month')"
                        class="px-3 py-1.5 rounded-lg transition cursor-pointer {{ $period === 'last_month' ? 'bg-blue-600 text-white font-bold shadow-xs' : 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white' }}"
                    >
                        Bulan Lalu
                    </button>
                    <button
                        type="button"
                        wire:click="setPeriod('custom_month')"
                        class="px-3 py-1.5 rounded-lg transition cursor-pointer {{ $period === 'custom_month' ? 'bg-blue-600 text-white font-bold shadow-xs' : 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white' }}"
                    >
                        Pilih Bulan
                    </button>
                    <button
                        type="button"
                        wire:click="setPeriod('custom_range')"
                        class="px-3 py-1.5 rounded-lg transition cursor-pointer {{ $period === 'custom_range' ? 'bg-blue-600 text-white font-bold shadow-xs' : 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white' }}"
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
            {{-- Card 1: Omset Penjualan Bersih (Net Sales) --}}
            <div class="p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-xs space-y-2">
                <div class="flex items-center justify-between text-gray-500 dark:text-gray-400 text-xs font-semibold uppercase">
                    <span>Omset Bersih POS</span>
                    <span class="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    </span>
                </div>
                <div class="text-xl font-black text-gray-900 dark:text-white">
                    Rp {{ number_format($summary['net_sales'], 0, ',', '.') }}
                </div>
                <p class="text-[11px] text-gray-400">
                    Dari {{ $summary['total_transactions'] }} transaksi kasir ({{ $summary['items_sold'] }} item).
                </p>
            </div>

            {{-- Card 2: Total HPP Produk (COGS) --}}
            <div class="p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-xs space-y-2">
                <div class="flex items-center justify-between text-gray-500 dark:text-gray-400 text-xs font-semibold uppercase">
                    <span>Total HPP Produk</span>
                    <span class="p-2 rounded-xl bg-stone-500/10 text-stone-600 dark:text-stone-400">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg>
                    </span>
                </div>
                <div class="text-xl font-black text-rose-600 dark:text-rose-400">
                    Rp {{ number_format($summary['total_cogs'], 0, ',', '.') }}
                </div>
                <p class="text-[11px] text-gray-400">
                    Modal HPP produk yang terjual di kasir.
                </p>
            </div>

            {{-- Card 3: Laba Kotor (Gross Profit) --}}
            <div class="p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-xs space-y-2">
                <div class="flex items-center justify-between text-gray-500 dark:text-gray-400 text-xs font-semibold uppercase">
                    <span>Laba Kotor POS</span>
                    <span class="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>
                    </span>
                </div>
                <div class="text-xl font-black text-gray-900 dark:text-white">
                    Rp {{ number_format($summary['gross_profit'], 0, ',', '.') }}
                </div>
                <p class="text-[11px] text-gray-400">
                    Margin Kotor: <strong class="text-amber-500">{{ $summary['gross_margin_pct'] }}%</strong>
                </p>
            </div>

            {{-- Card 4: Pengeluaran Kasir / Operasional --}}
            <div class="p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-xs space-y-2">
                <div class="flex items-center justify-between text-gray-500 dark:text-gray-400 text-xs font-semibold uppercase">
                    <span>Biaya Operasional Toko</span>
                    <span class="p-2 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                    </span>
                </div>
                <div class="text-xl font-black text-purple-600 dark:text-purple-400">
                    - Rp {{ number_format($summary['total_expenses'], 0, ',', '.') }}
                </div>
                <p class="text-[11px] text-gray-400">
                    Total kas kecil keluar yang dicatat kasir/barista.
                </p>
            </div>

            {{-- Card 5: Laba Bersih Akhir --}}
            <div class="p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-xs space-y-2">
                <div class="flex items-center justify-between text-gray-500 dark:text-gray-400 text-xs font-semibold uppercase">
                    <span>Laba Bersih Akhir</span>
                    <span class="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    </span>
                </div>
                <div class="text-xl font-black {{ $summary['net_profit'] >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400' }}">
                    Rp {{ number_format($summary['net_profit'], 0, ',', '.') }}
                </div>
                <p class="text-[11px] text-gray-400">
                    Margin Bersih: <strong class="{{ $summary['net_margin_pct'] >= 0 ? 'text-emerald-500' : 'text-rose-500' }}">{{ $summary['net_margin_pct'] }}%</strong>
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
                class="px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer {{ $activeViewTab === 'ringkasan' ? 'bg-blue-600 text-white shadow-xs' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800' }}"
            >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
                <span>Ringkasan & Tren Harian</span>
            </button>

            <button
                type="button"
                wire:click="setActiveTab('pesanan')"
                class="px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer {{ $activeViewTab === 'pesanan' ? 'bg-blue-600 text-white shadow-xs' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800' }}"
            >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path></svg>
                <span>Transaksi Kasir POS ({{ count($transactions) }})</span>
            </button>

            <button
                type="button"
                wire:click="setActiveTab('produk')"
                class="px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer {{ $activeViewTab === 'produk' ? 'bg-blue-600 text-white shadow-xs' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800' }}"
            >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>
                <span>Performa Produk Terjual ({{ count($topProducts) }})</span>
            </button>

            <button
                type="button"
                wire:click="setActiveTab('pengeluaran')"
                class="px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer {{ $activeViewTab === 'pengeluaran' ? 'bg-blue-600 text-white shadow-xs' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800' }}"
            >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                <span>Biaya Kas Toko ({{ count($expenses) }})</span>
            </button>
        </div>

        {{-- ========================================================================= --}}
        {{-- 5. TAB CONTENT: RINGKASAN & TREN HARIAN                                   --}}
        {{-- ========================================================================= --}}
        @if ($activeViewTab === 'ringkasan')
            <div class="space-y-6">
                {{-- Breakdown Pengeluaran Kas Toko --}}
                @if (count($expenseBreakdown) > 0)
                    <div class="rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-xs p-5 space-y-4">
                        <h3 class="text-sm font-bold text-gray-900 dark:text-white flex items-center justify-between">
                            <span>Rincian Biaya Kas Toko Fisik per Kategori</span>
                            <span class="text-xs font-semibold text-purple-600 dark:text-purple-400">Total: Rp {{ number_format($summary['total_expenses'], 0, ',', '.') }}</span>
                        </h3>
                        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            @foreach ($expenseBreakdown as $b)
                                <div class="p-3.5 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 space-y-1">
                                    <div class="flex items-center justify-between text-xs">
                                        <span class="font-semibold text-gray-700 dark:text-gray-300">{{ $b['label'] }}</span>
                                        <span class="font-bold text-purple-600 dark:text-purple-400">Rp {{ number_format($b['total'] ?? $b['amount'] ?? 0, 0, ',', '.') }}</span>
                                    </div>
                                    <div class="flex items-center justify-between text-[11px] text-gray-400">
                                        <span>{{ $b['count'] ?? 0 }} transaksi</span>
                                        <span>{{ $b['pct_of_total'] ?? $b['percentage'] ?? 0 }}% dari biaya</span>
                                    </div>
                                </div>
                            @endforeach
                        </div>
                    </div>
                @endif

                {{-- Tabel Tren Harian POS --}}
                <div class="rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-xs overflow-hidden">
                    <div class="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                        <h3 class="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <span>Rekap Penjualan POS Harian</span>
                            <span class="text-xs font-normal text-gray-400">({{ count($dailySummary) }} hari aktif)</span>
                        </h3>
                    </div>
                    <div class="overflow-x-auto">
                        <table class="w-full text-left text-xs divide-y divide-gray-100 dark:divide-gray-800">
                            <thead class="bg-gray-50 dark:bg-gray-800/60 text-gray-500 uppercase font-semibold text-[11px]">
                                <tr>
                                    <th class="py-3 px-4">Tanggal</th>
                                    <th class="py-3 px-4 text-center">Struk</th>
                                    <th class="py-3 px-4 text-center">Item</th>
                                    <th class="py-3 px-4 text-right">Omset Bersih</th>
                                    <th class="py-3 px-4 text-right">Total HPP</th>
                                    <th class="py-3 px-4 text-right">Laba Kotor</th>
                                    <th class="py-3 px-4 text-right">Biaya Kasir</th>
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
                                            {{ $day['total_transactions'] }}
                                        </td>
                                        <td class="py-3 px-4 text-center whitespace-nowrap">
                                            <span class="px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800 font-semibold">
                                                {{ $day['items_sold'] }} item
                                            </span>
                                        </td>
                                        <td class="py-3 px-4 text-right whitespace-nowrap font-bold text-gray-900 dark:text-white">
                                            Rp {{ number_format($day['net_sales'], 0, ',', '.') }}
                                        </td>
                                        <td class="py-3 px-4 text-right whitespace-nowrap font-medium text-rose-600 dark:text-rose-400">
                                            Rp {{ number_format($day['total_cogs'], 0, ',', '.') }}
                                        </td>
                                        <td class="py-3 px-4 text-right whitespace-nowrap font-semibold text-gray-800 dark:text-gray-200">
                                            Rp {{ number_format($day['gross_profit'], 0, ',', '.') }}
                                        </td>
                                        <td class="py-3 px-4 text-right whitespace-nowrap font-medium text-purple-600 dark:text-purple-400">
                                            - Rp {{ number_format($day['expenses_total'], 0, ',', '.') }}
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
                                            Belum ada transaksi kasir POS pada periode ini.
                                        </td>
                                    </tr>
                                @endforelse
                            </tbody>
                        </table>
                    </div>
                </div>

                {{-- Tabel Rekap Bulanan POS --}}
                @if (count($monthlySummary) > 1)
                    <div class="rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-xs overflow-hidden">
                        <div class="p-4 border-b border-gray-100 dark:border-gray-800">
                            <h3 class="text-sm font-bold text-gray-900 dark:text-white">Rekap Penjualan POS Bulanan</h3>
                        </div>
                        <div class="overflow-x-auto">
                            <table class="w-full text-left text-xs divide-y divide-gray-100 dark:divide-gray-800">
                                <thead class="bg-gray-50 dark:bg-gray-800/60 text-gray-500 uppercase font-semibold text-[11px]">
                                    <tr>
                                        <th class="py-3 px-4">Bulan</th>
                                        <th class="py-3 px-4 text-center">Struk</th>
                                        <th class="py-3 px-4 text-center">Item</th>
                                        <th class="py-3 px-4 text-right">Omset Bersih</th>
                                        <th class="py-3 px-4 text-right">Total HPP</th>
                                        <th class="py-3 px-4 text-right">Laba Kotor</th>
                                        <th class="py-3 px-4 text-right">Biaya Kasir</th>
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
                                                {{ $m['total_transactions'] }}
                                            </td>
                                            <td class="py-3 px-4 text-center">
                                                {{ $m['items_sold'] }} item
                                            </td>
                                            <td class="py-3 px-4 text-right font-bold text-gray-900 dark:text-white">
                                                Rp {{ number_format($m['net_sales'], 0, ',', '.') }}
                                            </td>
                                            <td class="py-3 px-4 text-right text-rose-600 dark:text-rose-400 font-medium">
                                                Rp {{ number_format($m['total_cogs'], 0, ',', '.') }}
                                            </td>
                                            <td class="py-3 px-4 text-right font-semibold text-gray-800 dark:text-gray-200">
                                                Rp {{ number_format($m['gross_profit'], 0, ',', '.') }}
                                            </td>
                                            <td class="py-3 px-4 text-right font-medium text-purple-600 dark:text-purple-400">
                                                - Rp {{ number_format($m['expenses_total'], 0, ',', '.') }}
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
        {{-- 6. TAB CONTENT: TRANSAKSI KASIR POS                                       --}}
        {{-- ========================================================================= --}}
        @if ($activeViewTab === 'pesanan')
            <div class="space-y-4">
                <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div class="w-full sm:w-80">
                        <x-filament::input.wrapper prefix-icon="heroicon-m-magnifying-glass">
                            <x-filament::input
                                wire:model.live.debounce.300ms="searchTransaction"
                                type="text"
                                placeholder="Cari No. Struk, Pelanggan, Metode Bayar..."
                            />
                        </x-filament::input.wrapper>
                    </div>
                    <span class="text-xs text-gray-400">
                        Menampilkan {{ count($filteredTransactions) }} transaksi kasir POS
                    </span>
                </div>

                <div class="rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-xs overflow-hidden">
                    <div class="overflow-x-auto">
                        <table class="w-full text-left text-xs divide-y divide-gray-100 dark:divide-gray-800">
                            <thead class="bg-gray-50 dark:bg-gray-800/60 text-gray-500 uppercase font-semibold text-[11px]">
                                <tr>
                                    <th class="py-3 px-4">No. Struk & Waktu</th>
                                    <th class="py-3 px-4">Pelanggan</th>
                                    <th class="py-3 px-4">Item Dipesan</th>
                                    <th class="py-3 px-4">Metode Bayar</th>
                                    <th class="py-3 px-4 text-right">Penjualan Bersih</th>
                                    <th class="py-3 px-4 text-right">Total HPP</th>
                                    <th class="py-3 px-4 text-right">Laba Kotor</th>
                                    <th class="py-3 px-4 text-center">Status</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-gray-100 dark:divide-gray-800">
                                @forelse ($filteredTransactions as $trx)
                                    <tr class="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition">
                                        <td class="py-3 px-4 whitespace-nowrap align-top">
                                            <span class="font-mono font-bold text-blue-600 dark:text-blue-400 block">
                                                {{ $trx['order_number'] }}
                                            </span>
                                            <span class="text-[11px] text-gray-400 block mt-0.5">
                                                {{ $trx['created_at_formatted'] }}
                                            </span>
                                        </td>
                                        <td class="py-3 px-4 whitespace-nowrap align-top">
                                            <span class="font-semibold text-gray-900 dark:text-white block">
                                                {{ $trx['customer_name'] }}
                                            </span>
                                            @if (!empty($trx['customer_phone']))
                                                <span class="font-mono text-[11px] text-gray-400 block">
                                                    {{ $trx['customer_phone'] }}
                                                </span>
                                            @endif
                                        </td>
                                        <td class="py-3 px-4 align-top">
                                            <div class="space-y-1 max-w-sm">
                                                @foreach ($trx['items'] as $it)
                                                    <div class="text-xs">
                                                        <span class="font-bold text-blue-600 dark:text-blue-400">{{ $it['quantity'] }}x</span>
                                                        <span class="font-medium text-gray-900 dark:text-white">{{ $it['product_name'] }}</span>
                                                        @if (!empty($it['variant_label']) && $it['variant_label'] !== 'Standar')
                                                            <span class="text-[11px] text-gray-500">({{ $it['variant_label'] }})</span>
                                                        @endif
                                                        <span class="text-[10px] text-gray-400 ml-1">@ Rp {{ number_format($it['price'], 0, ',', '.') }}</span>
                                                    </div>
                                                @endforeach
                                            </div>
                                        </td>
                                        <td class="py-3 px-4 whitespace-nowrap align-top">
                                            <span class="px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800 font-semibold text-gray-800 dark:text-gray-200 text-[11px]">
                                                {{ $trx['payment_method_label'] ?: ucfirst($trx['payment_method']) }}
                                            </span>
                                        </td>
                                        <td class="py-3 px-4 text-right whitespace-nowrap align-top font-bold text-gray-900 dark:text-white">
                                            Rp {{ number_format($trx['net_sales'], 0, ',', '.') }}
                                        </td>
                                        <td class="py-3 px-4 text-right whitespace-nowrap align-top font-medium text-rose-600 dark:text-rose-400">
                                            Rp {{ number_format($trx['total_cogs'], 0, ',', '.') }}
                                        </td>
                                        <td class="py-3 px-4 text-right whitespace-nowrap align-top font-bold {{ $trx['gross_profit'] >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400' }}">
                                            Rp {{ number_format($trx['gross_profit'], 0, ',', '.') }}
                                            <span class="block text-[10px] font-normal text-gray-400">
                                                Margin {{ $trx['margin_pct'] }}%
                                            </span>
                                        </td>
                                        <td class="py-3 px-4 text-center whitespace-nowrap align-top">
                                            <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400">
                                                {{ $trx['status_label'] }}
                                            </span>
                                        </td>
                                    </tr>
                                @empty
                                    <tr>
                                        <td colspan="8" class="py-8 text-center text-gray-400 text-xs">
                                            Belum ada transaksi kasir POS yang sesuai filter pencarian.
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
        {{-- 7. TAB CONTENT: PERFORMA PRODUK TERJUAL                                   --}}
        {{-- ========================================================================= --}}
        @if ($activeViewTab === 'produk')
            <div class="space-y-4">
                <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div class="w-full sm:w-80">
                        <x-filament::input.wrapper prefix-icon="heroicon-m-magnifying-glass">
                            <x-filament::input
                                wire:model.live.debounce.300ms="searchProduct"
                                type="text"
                                placeholder="Cari nama produk kasir atau varian..."
                            />
                        </x-filament::input.wrapper>
                    </div>
                    <span class="text-xs text-gray-400">
                        Menampilkan {{ count($filteredProducts) }} produk kasir POS
                    </span>
                </div>

                <div class="rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-xs overflow-hidden">
                    <div class="overflow-x-auto">
                        <table class="w-full text-left text-xs divide-y divide-gray-100 dark:divide-gray-800">
                            <thead class="bg-gray-50 dark:bg-gray-800/60 text-gray-500 uppercase font-semibold text-[11px]">
                                <tr>
                                    <th class="py-3 px-4">Nama Produk Kasir</th>
                                    <th class="py-3 px-4">Varian</th>
                                    <th class="py-3 px-4 text-center">Terjual</th>
                                    <th class="py-3 px-4 text-right">Total Penjualan</th>
                                    <th class="py-3 px-4 text-right">Total HPP (Modal)</th>
                                    <th class="py-3 px-4 text-right">Laba Kotor</th>
                                    <th class="py-3 px-4 text-center">Margin</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-gray-100 dark:divide-gray-800">
                                @forelse ($filteredProducts as $p)
                                    <tr class="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition">
                                        <td class="py-3 px-4 font-bold text-gray-900 dark:text-white whitespace-nowrap">
                                            {{ $p['product_name'] }}
                                        </td>
                                        <td class="py-3 px-4 whitespace-nowrap font-medium text-gray-600 dark:text-gray-300">
                                            {{ $p['variant_label'] ?: 'Standar' }}
                                        </td>
                                        <td class="py-3 px-4 text-center whitespace-nowrap">
                                            <span class="px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800 font-bold">
                                                {{ $p['quantity'] }}x
                                            </span>
                                        </td>
                                        <td class="py-3 px-4 text-right whitespace-nowrap font-bold text-gray-900 dark:text-white">
                                            Rp {{ number_format($p['revenue'], 0, ',', '.') }}
                                        </td>
                                        <td class="py-3 px-4 text-right whitespace-nowrap font-medium text-rose-600 dark:text-rose-400">
                                            Rp {{ number_format($p['cost'], 0, ',', '.') }}
                                        </td>
                                        <td class="py-3 px-4 text-right whitespace-nowrap font-bold {{ $p['profit'] >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400' }}">
                                            Rp {{ number_format($p['profit'], 0, ',', '.') }}
                                        </td>
                                        <td class="py-3 px-4 text-center whitespace-nowrap">
                                            @php
                                                $pMargin = $p['revenue'] > 0 ? round(($p['profit'] / $p['revenue']) * 100, 1) : 0;
                                            @endphp
                                            <span class="px-2 py-0.5 rounded-md font-bold text-[11px] {{ $pMargin >= 0 ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400' : 'bg-rose-100 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400' }}">
                                                {{ $pMargin }}%
                                            </span>
                                        </td>
                                    </tr>
                                @empty
                                    <tr>
                                        <td colspan="7" class="py-8 text-center text-gray-400 text-xs">
                                            Belum ada data produk kasir terjual pada periode ini.
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
        {{-- 8. TAB CONTENT: BIAYA KAS TOKO (POS CASH FLOW)                            --}}
        {{-- ========================================================================= --}}
        @if ($activeViewTab === 'pengeluaran')
            <div class="space-y-4">
                <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div class="flex flex-wrap items-center gap-2">
                        <div class="w-full sm:w-64">
                            <x-filament::input.wrapper prefix-icon="heroicon-m-magnifying-glass">
                                <x-filament::input
                                    wire:model.live.debounce.300ms="searchExpense"
                                    type="text"
                                    placeholder="Cari keterangan, kasir..."
                                />
                            </x-filament::input.wrapper>
                        </div>
                        <select
                            wire:model.live="expenseCategory"
                            class="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-xs font-medium"
                        >
                            <option value="all">Semua Kategori</option>
                            @foreach (\App\Services\ProfitLossService::EXPENSE_CATEGORIES as $key => $label)
                                <option value="{{ $key }}">{{ $label }}</option>
                            @endforeach
                        </select>
                    </div>
                    <span class="text-xs font-bold text-purple-600 dark:text-purple-400">
                        Total Biaya: Rp {{ number_format($filteredExpenseTotal, 0, ',', '.') }}
                    </span>
                </div>

                <div class="rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-xs overflow-hidden">
                    <div class="overflow-x-auto">
                        <table class="w-full text-left text-xs divide-y divide-gray-100 dark:divide-gray-800">
                            <thead class="bg-gray-50 dark:bg-gray-800/60 text-gray-500 uppercase font-semibold text-[11px]">
                                <tr>
                                    <th class="py-3 px-4">Waktu & Tanggal</th>
                                    <th class="py-3 px-4">Kategori Biaya</th>
                                    <th class="py-3 px-4">Keterangan Pengeluaran</th>
                                    <th class="py-3 px-4">Pencatat / Kasir</th>
                                    <th class="py-3 px-4 text-right">Nominal (Rp)</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-gray-100 dark:divide-gray-800">
                                @forelse ($filteredExpenses as $exp)
                                    <tr class="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition">
                                        <td class="py-3 px-4 whitespace-nowrap text-gray-700 dark:text-gray-300 font-medium">
                                            {{ $exp['recorded_at_formatted'] }}
                                        </td>
                                        <td class="py-3 px-4 whitespace-nowrap">
                                            <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800 dark:bg-purple-950/40 dark:text-purple-300">
                                                {{ $exp['category_label'] }}
                                            </span>
                                        </td>
                                        <td class="py-3 px-4 text-gray-900 dark:text-white font-medium max-w-md">
                                            {{ $exp['description'] }}
                                        </td>
                                        <td class="py-3 px-4 whitespace-nowrap text-gray-500 dark:text-gray-400">
                                            {{ $exp['user_name'] }}
                                        </td>
                                        <td class="py-3 px-4 text-right whitespace-nowrap font-bold text-purple-600 dark:text-purple-400">
                                            - Rp {{ number_format($exp['amount'], 0, ',', '.') }}
                                        </td>
                                    </tr>
                                @empty
                                    <tr>
                                        <td colspan="5" class="py-8 text-center text-gray-400 text-xs">
                                            Belum ada pencatatan biaya kas keluar POS pada periode ini.
                                        </td>
                                    </tr>
                                @endforelse
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        @endif
    </div>
</x-filament-panels::page>
