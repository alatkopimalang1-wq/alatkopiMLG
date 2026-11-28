<x-filament-panels::page>
    <style>
        /* Scoped styling for Marketplace Sync page matching reference design */
        .mp-sync-wrap .fi-ta-ctn {
            border-radius: 0.75rem !important;
            overflow: visible !important;
            border: 1px solid #e5e7eb !important;
            background: #ffffff !important;
        }
        html.dark .mp-sync-wrap .fi-ta-ctn {
            border-color: rgba(255, 255, 255, 0.1) !important;
            background: #18181b !important;
        }

        /* Spreadsheet-style grid borders on table */
        .mp-sync-wrap .fi-ta-table {
            border-collapse: collapse !important;
        }
        .mp-sync-wrap .fi-ta-table thead th {
            background-color: #ffffff !important;
            border-bottom: 1px solid #e5e7eb !important;
            border-right: 1px solid #e5e7eb !important;
            padding: 0.65rem 0.75rem !important;
            font-size: 0.8125rem !important;
            font-weight: 600 !important;
            color: #111827 !important;
        }
        .mp-sync-wrap .fi-ta-table thead th:last-child {
            border-right: none !important;
            text-align: center !important;
        }
        .mp-sync-wrap .fi-ta-table tbody td {
            border-bottom: 1px solid #e5e7eb !important;
            border-right: 1px solid #e5e7eb !important;
            padding: 0.55rem 0.75rem !important;
            vertical-align: middle !important;
        }
        .mp-sync-wrap .fi-ta-table tbody td:last-child {
            border-right: none !important;
        }
        html.dark .mp-sync-wrap .fi-ta-table thead th {
            background-color: #18181b !important;
            border-color: rgba(255, 255, 255, 0.1) !important;
            color: #f4f4f5 !important;
        }
        html.dark .mp-sync-wrap .fi-ta-table tbody td {
            border-color: rgba(255, 255, 255, 0.08) !important;
        }

        /* Pill styling for Filament tabs */
        .mp-sync-wrap .fi-tabs {
            background: transparent !important;
            box-shadow: none !important;
            ring: none !important;
            border: none !important;
            padding: 0 !important;
            gap: 0.5rem !important;
        }
        .mp-sync-wrap .fi-tabs-item {
            border-radius: 9999px !important;
            border: 1px solid #e5e7eb !important;
            background-color: #f9fafb !important;
            padding: 0.375rem 0.875rem !important;
            font-size: 0.8125rem !important;
            font-weight: 600 !important;
        }
        .mp-sync-wrap .fi-tabs-item.fi-active {
            background-color: #e0f2fe !important;
            border-color: #bae6fd !important;
            color: #0369a1 !important;
        }
        html.dark .mp-sync-wrap .fi-tabs-item {
            background-color: #27272a !important;
            border-color: rgba(255, 255, 255, 0.1) !important;
        }
        html.dark .mp-sync-wrap .fi-tabs-item.fi-active {
            background-color: rgba(14, 165, 233, 0.2) !important;
            border-color: rgba(56, 189, 248, 0.4) !important;
            color: #38bdf8 !important;
        }
    </style>

    @php
        $summary = $this->getStoreSummary();
    @endphp

    <div class="mp-sync-wrap space-y-3">
        {{-- Top Dual-Store Header Card --}}
        <div class="rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-zinc-900 shadow-xs">
            <div class="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-200 dark:divide-white/10">
                {{-- Left: Marketplace Store --}}
                <div class="flex items-center justify-between gap-3 px-4 py-3">
                    <div class="flex items-center gap-3 min-w-0">
                        <div class="flex items-center justify-center w-9 h-9 rounded-lg bg-zinc-900 text-white shrink-0 shadow-xs">
                            <x-heroicon-o-shopping-bag class="w-5 h-5" />
                        </div>
                        <div class="min-w-0">
                            <div class="text-sm font-bold text-gray-900 dark:text-white tracking-tight truncate uppercase">
                                {{ $summary['store_name'] }}
                            </div>
                            <div class="text-xs text-gray-500 dark:text-gray-400">
                                {{ number_format($summary['mp_count']) }} Produk MP &bull; {{ $summary['mp_status_text'] }}
                            </div>
                        </div>
                    </div>

                    <button
                        type="button"
                        wire:click="mountAction('syncFromTikTok')"
                        wire:loading.attr="disabled"
                        class="inline-flex items-center gap-1.5 text-xs font-semibold text-sky-600 hover:text-sky-700 dark:text-sky-400 cursor-pointer shrink-0 px-2.5 py-1.5 rounded-lg hover:bg-sky-50 dark:hover:bg-sky-950/40 transition"
                    >
                        <span wire:loading.remove wire:target="mountAction('syncFromTikTok')">Perbarui</span>
                        <span wire:loading wire:target="mountAction('syncFromTikTok')">Menarik...</span>
                        <x-heroicon-o-arrow-path class="w-4 h-4" />
                    </button>
                </div>

                {{-- Right: Website Store --}}
                <div class="flex items-center justify-between gap-3 px-4 py-3">
                    <div class="flex items-center gap-3 min-w-0">
                        <img
                            src="{{ asset('brand/logo-circle.png') }}"
                            alt="Alat Kopi Malang"
                            class="w-9 h-9 rounded-full object-cover border border-gray-200 dark:border-white/10 shrink-0"
                        >
                        <div class="min-w-0">
                            <div class="text-sm font-bold text-gray-900 dark:text-white tracking-tight truncate uppercase">
                                {{ $summary['store_name'] }}
                            </div>
                            <div class="text-xs text-gray-500 dark:text-gray-400">
                                {{ number_format($summary['web_count']) }} Produk Website
                            </div>
                        </div>
                    </div>

                    <div class="flex items-center gap-2 shrink-0">
                        <span class="text-xs px-2 py-1 rounded-full font-medium {{ $summary['auto_sync'] ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300' : 'bg-gray-100 text-gray-600 dark:bg-zinc-800 dark:text-gray-400' }}">
                            {{ $summary['auto_sync'] ? 'Auto-Sync Aktif' : 'Auto-Sync Off' }}
                        </span>
                    </div>
                </div>
            </div>
        </div>

        {{-- Subtle Last Sync Info Line --}}
        <div class="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 px-1">
            <x-heroicon-o-clock class="w-3.5 h-3.5 shrink-0" />
            <span>Terakhir sinkronisasi: {{ $summary['last_synced_at'] }}</span>
        </div>

        {{-- Tabs + Table --}}
        {{ $this->content }}
    </div>
</x-filament-panels::page>
