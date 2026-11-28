<x-filament-panels::page>
    @php
        $stats = $this->stats;
        $selectedOrder = $this->selectedOrder;
    @endphp
    <div class="space-y-4 sm:space-y-5 max-w-full overflow-x-hidden" x-data="{ copied: false }">
        {{-- Header Status Bar --}}
        <x-filament::section>
            <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div class="flex items-start sm:items-center gap-3 min-w-0">
                    <div class="p-2.5 bg-gradient-to-br from-amber-500 to-orange-600 text-white rounded-xl flex items-center justify-center shrink-0 shadow-xs">
                        <svg class="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M19 6h-2c0-2.76-2.24-5-5-5S7 3.24 7 6H5c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-7-3c1.66 0 3 1.34 3 3H9c0-1.66 1.34-3 3-3zm7 17H5V8h14v12z"/>
                        </svg>
                    </div>
                    <div class="min-w-0 flex-1">
                        <h2 class="text-sm sm:text-base font-bold text-gray-950 dark:text-white leading-snug">Penerimaan Order MP (Shopee & TikTok Shop)</h2>
                        <div class="text-xs text-gray-500 dark:text-gray-400 flex flex-wrap items-center gap-x-2 gap-y-1 mt-1">
                            <span class="inline-flex items-center gap-1.5">
                                <span class="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
                                <span>Mulai: <strong class="text-gray-700 dark:text-gray-300">25 Nov 2026</strong></span>
                            </span>
                            <span class="hidden sm:inline text-gray-300 dark:text-gray-600">•</span>
                            <span>Sync: <strong class="text-gray-700 dark:text-gray-300">{{ $lastSyncTime ?? now()->format('H:i') }}</strong></span>
                            <span class="hidden sm:inline text-gray-300 dark:text-gray-600">•</span>
                            <span class="inline-flex items-center gap-2">
                                <span class="text-orange-600 dark:text-orange-400 font-semibold">Shopee: {{ $stats['count_shopee'] ?? 0 }}</span>
                                <span class="text-gray-300 dark:text-gray-600">•</span>
                                <span class="text-gray-800 dark:text-gray-300 font-semibold">TikTok: {{ $stats['count_tiktok'] ?? 0 }}</span>
                            </span>
                        </div>
                    </div>
                </div>

                <div class="grid grid-cols-1 sm:flex sm:items-center gap-2 w-full lg:w-auto">
                    <x-filament::button
                        wire:click="refreshOrders"
                        wire:loading.attr="disabled"
                        color="gray"
                        icon="heroicon-m-arrow-path"
                        size="sm"
                        class="w-full sm:w-auto justify-center"
                    >
                        Tarik Pesanan Terbaru
                    </x-filament::button>

                    <x-filament::button
                        tag="a"
                        href="{{ \App\Filament\Resources\EcommerceOrders\EcommerceOrderResource::getUrl() }}"
                        color="primary"
                        icon="heroicon-m-shopping-bag"
                        size="sm"
                        outlined
                        class="w-full sm:w-auto justify-center"
                    >
                        Ke Pesanan Ecommerce
                    </x-filament::button>
                </div>
            </div>
        </x-filament::section>

        {{-- Error Banner --}}
        @if ($errorMessage)
            <div class="p-4 bg-danger-50 dark:bg-danger-950/40 border border-danger-200 dark:border-danger-800 rounded-xl text-danger-700 dark:text-danger-400 text-sm flex items-start gap-3">
                <svg class="w-5 h-5 shrink-0 mt-0.5 text-danger-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div>
                    <h4 class="font-bold">Informasi Koneksi Marketplace</h4>
                    <p class="text-xs mt-0.5">{{ $errorMessage }}</p>
                </div>
            </div>
        @endif

        {{-- Platform Filter (Marketplace Selector) --}}
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 p-3 bg-white dark:bg-gray-900 rounded-xl border border-gray-200/80 dark:border-white/10 shadow-xs">
            <div class="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-2.5 w-full sm:w-auto">
                <span class="text-[11px] sm:text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider pl-0.5">Marketplace:</span>
                <div class="grid grid-cols-3 sm:inline-flex p-1 bg-gray-100 dark:bg-white/5 rounded-lg border border-gray-200/60 dark:border-white/10 gap-1 w-full sm:w-auto">
                    {{-- Semua MP --}}
                    <button
                        wire:click="setPlatformFilter('all')"
                        type="button"
                        class="inline-flex items-center justify-center gap-1.5 sm:gap-2 px-2 sm:px-3.5 py-2 sm:py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer whitespace-nowrap {{ $platformFilter === 'all' ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-xs ring-1 ring-gray-950/5 dark:ring-white/10' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-white/5' }}"
                    >
                        <x-filament::icon icon="heroicon-m-squares-2x2" class="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 {{ $platformFilter === 'all' ? 'text-primary-600 dark:text-primary-400' : 'text-gray-400' }}" />
                        <span class="sm:hidden">Semua</span>
                        <span class="hidden sm:inline">Semua MP</span>
                        <span class="px-1.5 py-0.5 rounded-full text-[10px] font-bold {{ $platformFilter === 'all' ? 'bg-primary-50 dark:bg-primary-950/50 text-primary-700 dark:text-primary-300' : 'bg-gray-200/80 dark:bg-white/10 text-gray-600 dark:text-gray-400' }}">
                            {{ $stats['count_all_platform'] ?? 0 }}
                        </span>
                    </button>

                    {{-- Shopee --}}
                    <button
                        wire:click="setPlatformFilter('shopee')"
                        type="button"
                        class="inline-flex items-center justify-center gap-1.5 sm:gap-2 px-2 sm:px-3.5 py-2 sm:py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer whitespace-nowrap {{ $platformFilter === 'shopee' ? 'bg-white dark:bg-gray-800 shadow-xs ring-1 ring-orange-500/30' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-white/5' }}"
                    >
                        <svg class="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" viewBox="0 0 24 24" style="fill: #ee4d2d;">
                            <path d="M19.78 6.78a2.53 2.53 0 0 0-2.43-1.84h-2.12V4.5A4.5 4.5 0 0 0 10.73 0a4.5 4.5 0 0 0-4.5 4.5v.44H4.11a2.53 2.53 0 0 0-2.43 1.84L.03 18.25A2.71 2.71 0 0 0 2.67 21.6h16.14a2.71 2.71 0 0 0 2.64-3.35l-1.67-11.47zM8.23 4.5a2.5 2.5 0 0 1 5 0v.44h-5V4.5zm2.5 13.5c-2.32 0-4.05-1.55-4.14-3.72h1.93c.09 1.15.99 1.87 2.21 1.87 1.25 0 2.14-.73 2.14-1.82 0-1.15-.9-1.61-2.45-2.02l-.65-.17c-2.15-.57-3.23-1.62-3.23-3.32 0-2.06 1.7-3.55 3.99-3.55 2.18 0 3.75 1.44 3.86 3.48h-1.93c-.11-.97-.89-1.65-1.93-1.65-1.12 0-1.99.7-1.99 1.68 0 .97.68 1.44 2.18 1.83l.63.16c2.45.64 3.52 1.68 3.52 3.49 0 2.21-1.74 3.74-4.16 3.74z"/>
                        </svg>
                        <span class="{{ $platformFilter === 'shopee' ? 'text-orange-600 dark:text-orange-400 font-bold' : '' }}" style="{{ $platformFilter === 'shopee' ? 'color: #ee4d2d;' : '' }}">Shopee</span>
                        <span class="px-1.5 py-0.5 rounded-full text-[10px] font-bold" style="{{ $platformFilter === 'shopee' ? 'background-color: #ffedd5; color: #c2410c;' : 'background-color: rgba(156, 163, 175, 0.2);' }}">
                            {{ $stats['count_shopee'] ?? 0 }}
                        </span>
                    </button>

                    {{-- TikTok Shop --}}
                    <button
                        wire:click="setPlatformFilter('tiktok')"
                        type="button"
                        class="inline-flex items-center justify-center gap-1.5 sm:gap-2 px-2 sm:px-3.5 py-2 sm:py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer whitespace-nowrap {{ $platformFilter === 'tiktok' ? 'bg-white dark:bg-gray-800 text-gray-950 dark:text-white shadow-xs ring-1 ring-gray-950/5 dark:ring-white/10' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-white/5' }}"
                    >
                        <svg class="w-3.5 h-3.5 fill-current shrink-0 {{ $platformFilter === 'tiktok' ? 'text-gray-950 dark:text-white' : 'text-gray-500' }}" viewBox="0 0 24 24">
                            <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 3 15.68 6.34 6.34 0 0 0 9.35 22a6.34 6.34 0 0 0 6.34-6.32V8.67a8.28 8.28 0 0 0 3.9 1.13V6.69z"/>
                        </svg>
                        <span class="sm:hidden {{ $platformFilter === 'tiktok' ? 'font-bold' : '' }}">TikTok</span>
                        <span class="hidden sm:inline {{ $platformFilter === 'tiktok' ? 'font-bold' : '' }}">TikTok Shop</span>
                        <span class="px-1.5 py-0.5 rounded-full text-[10px] font-bold {{ $platformFilter === 'tiktok' ? 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white' : 'bg-gray-200/80 dark:bg-white/10 text-gray-600 dark:text-gray-400' }}">
                            {{ $stats['count_tiktok'] ?? 0 }}
                        </span>
                    </button>
                </div>
            </div>

            {{-- Info Tag --}}
            <div class="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1.5 pl-0.5 sm:pr-1">
                <x-filament::icon icon="heroicon-m-funnel" class="w-3.5 h-3.5 text-gray-400 shrink-0" />
                <span>Filter aktif: <strong class="text-gray-800 dark:text-gray-200">{{ $platformFilter === 'all' ? 'Semua Marketplace' : ($platformFilter === 'shopee' ? 'Shopee' : 'TikTok Shop') }}</strong></span>
            </div>
        </div>

        {{-- Tabs Navigation --}}
        @php
            $tabs = [
                'all' => ['label' => 'Semua', 'count' => $stats['all']],
                'unsaved' => ['label' => 'Belum Disimpan', 'count' => $stats['unsaved']],
                'awaiting_shipment' => ['label' => 'Siap dikirim', 'count' => $stats['awaiting_shipment']],
                'in_transit' => ['label' => 'Dikirim', 'count' => $stats['in_transit']],
                'completed' => ['label' => 'Selesai', 'count' => $stats['completed']],
                'unpaid' => ['label' => 'Belum Bayar', 'count' => $stats['unpaid']],
                'cancelled' => ['label' => 'Dibatalkan', 'count' => $stats['cancelled']],
            ];
        @endphp

        {{-- Mobile Wrapped Tabs (No Horizontal Scroll) --}}
        <div class="flex flex-wrap gap-1.5 p-2 bg-white dark:bg-gray-900 rounded-xl border border-gray-200/80 dark:border-white/10 shadow-xs sm:hidden">
            @foreach ($tabs as $key => $tab)
                <button
                    type="button"
                    wire:click="setTab('{{ $key }}')"
                    class="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer {{ $activeTab === $key ? 'bg-primary-50 dark:bg-primary-950/60 text-primary-700 dark:text-primary-300 ring-1 ring-primary-500/30' : 'bg-gray-100/80 dark:bg-white/5 text-gray-600 dark:text-gray-400' }}"
                >
                    <span>{{ $tab['label'] }}</span>
                    @if ($tab['count'] > 0)
                        <span class="px-1.5 py-0.5 rounded-full text-[10px] font-bold {{ $key === 'unsaved' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300' : ($activeTab === $key ? 'bg-primary-100 text-primary-800 dark:bg-primary-900/60 dark:text-primary-200' : 'bg-gray-200/80 text-gray-700 dark:bg-white/10 dark:text-gray-300') }}">
                            {{ $tab['count'] }}
                        </span>
                    @endif
                </button>
            @endforeach
        </div>

        {{-- Desktop Filament Tabs --}}
        <div class="hidden sm:block">
            <x-filament::tabs>
                @foreach ($tabs as $key => $tab)
                    <x-filament::tabs.item
                        :active="$activeTab === $key"
                        wire:click="setTab('{{ $key }}')"
                        :badge="$tab['count'] > 0 ? (string) $tab['count'] : null"
                        :badge-color="$key === 'unsaved' ? 'warning' : ($activeTab === $key ? 'primary' : 'gray')"
                    >
                        {{ $tab['label'] }}
                    </x-filament::tabs.item>
                @endforeach
            </x-filament::tabs>
        </div>

        {{-- Search & Bulk Action Bar --}}
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div class="w-full sm:w-80">
                <x-filament::input.wrapper prefix-icon="heroicon-m-magnifying-glass">
                    <x-filament::input
                        wire:model.live.debounce.300ms="search"
                        type="text"
                        placeholder="Cari ID, Pembeli, Resi, Produk..."
                    />
                </x-filament::input.wrapper>
            </div>

            @if ($stats['unsaved'] > 0)
                <x-filament::button
                    wire:click="saveAllUnsaved"
                    wire:loading.attr="disabled"
                    color="warning"
                    icon="heroicon-m-arrow-down-tray"
                    size="sm"
                >
                    Simpan Semua yang Belum Ada ({{ $stats['unsaved'] }})
                </x-filament::button>
            @endif
        </div>

        {{-- Orders Section (Mobile Cards + Desktop Table) --}}
        <x-filament::section>
            {{-- Mobile Card List (< md) — Zero Horizontal Scroll --}}
            <div class="md:hidden -mx-6 -my-6 divide-y divide-gray-200 dark:divide-white/10">
                @forelse ($this->filteredOrders as $order)
                    @php
                        $ttsBadgeColor = match ($order['status_color']) {
                            'warning' => 'warning',
                            'info' => 'info',
                            'success' => 'success',
                            'danger' => 'danger',
                            default => 'gray',
                        };
                        $items = $order['items'] ?? [];
                        $displayItems = array_slice($items, 0, 2);
                        $remaining = count($items) - 2;
                    @endphp
                    <div class="p-4 space-y-2.5">
                        {{-- Row 1: Order ID + Platform & MP Status --}}
                        <div class="flex items-start justify-between gap-2">
                            <div class="min-w-0">
                                <button
                                    wire:click="openDrawer('{{ $order['id'] }}')"
                                    type="button"
                                    class="font-mono text-xs font-bold text-primary-600 dark:text-primary-400 hover:underline cursor-pointer inline-flex items-center gap-1 break-all text-left"
                                >
                                    <span>#{{ $order['id'] }}</span>
                                    <x-filament::icon icon="heroicon-m-arrow-top-right-on-square" class="w-3.5 h-3.5 opacity-60 shrink-0" />
                                </button>
                                <div class="flex flex-wrap items-center gap-1.5 mt-0.5 text-[11px] text-gray-500 dark:text-gray-400">
                                    <span>{{ $order['created_at_formatted'] }}</span>
                                    <span>•</span>
                                    @if (($order['platform'] ?? 'tiktok') === 'shopee')
                                        <span class="inline-flex items-center gap-1 text-orange-600 dark:text-orange-400 font-semibold">Shopee</span>
                                    @else
                                        <span class="inline-flex items-center gap-1 text-gray-700 dark:text-gray-300 font-semibold">TikTok Shop</span>
                                    @endif
                                </div>
                            </div>

                            <div class="shrink-0">
                                <x-filament::badge :color="$ttsBadgeColor" size="sm">
                                    {{ $order['status_label'] }}
                                </x-filament::badge>
                            </div>
                        </div>

                        {{-- Row 2: Buyer & Total --}}
                        <div class="flex items-center justify-between gap-2 text-xs">
                            <div class="min-w-0">
                                <span class="font-semibold text-gray-950 dark:text-white">
                                    {{ $order['buyer_name'] ?: (($order['platform'] ?? '') === 'shopee' ? 'Pelanggan Shopee' : 'Pelanggan TikTok') }}
                                </span>
                                @if (!empty($order['buyer_phone']))
                                    <span class="text-[11px] text-gray-500 dark:text-gray-400 font-mono ml-1">{{ $order['buyer_phone'] }}</span>
                                @endif
                            </div>
                            <div class="font-bold text-gray-950 dark:text-white shrink-0">
                                Rp {{ number_format($order['total_amount'] ?? 0, 0, ',', '.') }}
                            </div>
                        </div>

                        {{-- Row 3: Ordered Products --}}
                        <div class="bg-gray-50 dark:bg-white/5 rounded-lg p-2.5 space-y-1">
                            @forelse ($displayItems as $it)
                                <div class="text-xs text-gray-800 dark:text-gray-200 leading-snug break-words">
                                    <span class="font-bold text-primary-600 dark:text-primary-400">{{ $it['quantity'] ?? 1 }}x</span>
                                    {{ $it['product_name'] ?? 'Produk' }}
                                    @if (!empty($it['sku_name']))
                                        <span class="text-[11px] text-gray-500 dark:text-gray-400">({{ $it['sku_name'] }})</span>
                                    @endif
                                </div>
                            @empty
                                <span class="text-gray-400 italic text-[11px]">-</span>
                            @endforelse
                            @if ($remaining > 0)
                                <button
                                    wire:click="openDrawer('{{ $order['id'] }}')"
                                    type="button"
                                    class="text-[11px] text-primary-600 dark:text-primary-400 hover:underline font-semibold cursor-pointer"
                                >
                                    +{{ $remaining }} produk lainnya...
                                </button>
                            @endif
                        </div>

                        {{-- Row 4: Courier + Tracking --}}
                        <div class="flex flex-wrap items-center gap-1.5 text-[11px]">
                            <span class="inline-block px-2 py-0.5 rounded bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-gray-300 font-medium">
                                {{ $order['shipping_courier'] ?? 'TikTok Shipping' }}
                            </span>
                            @if (!empty($order['tracking_number']))
                                <span class="font-mono text-gray-500 dark:text-gray-400 break-all">{{ $order['tracking_number'] }}</span>
                            @endif
                        </div>

                        {{-- Row 5: Website Sync Status & Action Buttons --}}
                        <div class="flex items-center justify-between gap-2 pt-1">
                            <div class="min-w-0">
                                @if (!empty($order['is_saved']))
                                    <div class="flex flex-wrap items-center gap-1.5">
                                        <x-filament::badge color="success" size="sm" icon="heroicon-m-check">
                                            Tersimpan
                                        </x-filament::badge>
                                        <a
                                            href="{{ \App\Filament\Resources\EcommerceOrders\EcommerceOrderResource::getUrl() }}?tableSearch={{ $order['local_order_number'] }}"
                                            target="_blank"
                                            class="text-[11px] font-mono text-primary-600 dark:text-primary-400 hover:underline inline-flex items-center gap-0.5"
                                        >
                                            <span>#{{ $order['local_order_number'] }}</span>
                                            <x-filament::icon icon="heroicon-m-arrow-top-right-on-square" class="w-3 h-3 opacity-60" />
                                        </a>
                                    </div>
                                @else
                                    <x-filament::badge color="warning" size="sm" icon="heroicon-m-clock">
                                        Belum Disimpan
                                    </x-filament::badge>
                                @endif
                            </div>

                            <div class="flex items-center gap-1.5 shrink-0">
                                @if (empty($order['is_saved']))
                                    @if (! empty($order['has_connected_products']))
                                        <x-filament::button
                                            size="xs"
                                            color="warning"
                                            icon="heroicon-m-arrow-down-tray"
                                            wire:click="saveOrder('{{ $order['id'] }}')"
                                            wire:loading.attr="disabled"
                                            wire:target="saveOrder('{{ $order['id'] }}')"
                                        >
                                            Simpan
                                        </x-filament::button>
                                    @else
                                        <button
                                            type="button"
                                            disabled
                                            class="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 cursor-not-allowed border border-gray-200 dark:border-gray-700"
                                            title="Belum dapat disimpan: produk belum terhubung ke katalog website"
                                        >
                                            <x-filament::icon icon="heroicon-m-lock-closed" class="w-3.5 h-3.5" />
                                            <span>Belum Terhubung</span>
                                        </button>
                                    @endif
                                @endif

                                <x-filament::button
                                    size="xs"
                                    color="gray"
                                    icon="heroicon-m-eye"
                                    wire:click="openDrawer('{{ $order['id'] }}')"
                                >
                                    Detail
                                </x-filament::button>
                            </div>
                        </div>
                    </div>
                @empty
                    <div class="py-12 px-4 text-center text-gray-400 dark:text-gray-500">
                        <div class="flex flex-col items-center justify-center">
                            <svg class="w-12 h-12 text-gray-300 dark:text-gray-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                            </svg>
                            <p class="font-medium text-sm">Tidak ada pesanan yang sesuai filter.</p>
                            <p class="text-xs text-gray-400 mt-1">Coba ubah tab filter atau klik "Tarik Pesanan Terbaru".</p>
                        </div>
                    </div>
                @endforelse
            </div>

            {{-- Desktop Table (>= md) --}}
            <div class="hidden md:block overflow-x-auto -mx-6 -my-6">
                <table class="w-full text-left text-xs divide-y divide-gray-200 dark:divide-white/10">
                    <thead class="bg-gray-50/75 dark:bg-white/5 text-gray-500 dark:text-gray-400 font-semibold uppercase text-[11px] tracking-wider">
                        <tr>
                            <th scope="col" class="py-3 px-4">No. Pesanan & Waktu</th>
                            <th scope="col" class="py-3 px-4">Pembeli</th>
                            <th scope="col" class="py-3 px-4">Produk Dipesan</th>
                            <th scope="col" class="py-3 px-4">Total & Kurir</th>
                            <th scope="col" class="py-3 px-4">Status MP</th>
                            <th scope="col" class="py-3 px-4">Status Website</th>
                            <th scope="col" class="py-3 px-4 text-center">Aksi</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-200 dark:divide-white/5">
                        @forelse ($this->filteredOrders as $order)
                            <tr class="hover:bg-gray-50/60 dark:hover:bg-white/5 transition-colors">
                                {{-- No. Pesanan & Waktu --}}
                                <td class="py-3.5 px-4 whitespace-nowrap align-top">
                                    <div class="space-y-1">
                                        <button
                                            wire:click="openDrawer('{{ $order['id'] }}')"
                                            type="button"
                                            class="font-mono font-bold text-primary-600 dark:text-primary-400 hover:underline cursor-pointer flex items-center gap-1.5"
                                            title="Klik untuk melihat detail lengkap"
                                        >
                                            <span>#{{ $order['id'] }}</span>
                                            <x-filament::icon icon="heroicon-m-arrow-top-right-on-square" class="w-3.5 h-3.5 opacity-60" />
                                        </button>
                                        <div class="text-[11px] text-gray-500 dark:text-gray-400">
                                            {{ $order['created_at_formatted'] }}
                                        </div>
                                        @if (($order['platform'] ?? 'tiktok') === 'shopee')
                                            <div class="inline-flex items-center gap-1 text-[10px] text-orange-600 dark:text-orange-400 font-semibold">
                                                <svg class="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                                                    <path d="M19.78 6.78a2.53 2.53 0 0 0-2.43-1.84h-2.12V4.5A4.5 4.5 0 0 0 10.73 0a4.5 4.5 0 0 0-4.5 4.5v.44H4.11a2.53 2.53 0 0 0-2.43 1.84L.03 18.25A2.71 2.71 0 0 0 2.67 21.6h16.14a2.71 2.71 0 0 0 2.64-3.35l-1.67-11.47zM8.23 4.5a2.5 2.5 0 0 1 5 0v.44h-5V4.5zm2.5 13.5c-2.32 0-4.05-1.55-4.14-3.72h1.93c.09 1.15.99 1.87 2.21 1.87 1.25 0 2.14-.73 2.14-1.82 0-1.15-.9-1.61-2.45-2.02l-.65-.17c-2.15-.57-3.23-1.62-3.23-3.32 0-2.06 1.7-3.55 3.99-3.55 2.18 0 3.75 1.44 3.86 3.48h-1.93c-.11-.97-.89-1.65-1.93-1.65-1.12 0-1.99.7-1.99 1.68 0 .97.68 1.44 2.18 1.83l.63.16c2.45.64 3.52 1.68 3.52 3.49 0 2.21-1.74 3.74-4.16 3.74z"/>
                                                </svg>
                                                <span>Shopee</span>
                                            </div>
                                        @else
                                            <div class="inline-flex items-center gap-1 text-[10px] text-gray-700 dark:text-gray-300 font-semibold">
                                                <svg class="w-3 h-3 fill-current" viewBox="0 0 24 24">
                                                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 3 15.68 6.34 6.34 0 0 0 9.35 22a6.34 6.34 0 0 0 6.34-6.32V8.67a8.28 8.28 0 0 0 3.9 1.13V6.69z"/>
                                                </svg>
                                                <span>TikTok Shop</span>
                                            </div>
                                        @endif
                                    </div>
                                </td>

                                {{-- Pembeli --}}
                                <td class="py-3.5 px-4 whitespace-nowrap align-top">
                                    <div class="space-y-1">
                                        <div class="font-semibold text-gray-950 dark:text-white">
                                            {{ $order['buyer_name'] ?: (($order['platform'] ?? '') === 'shopee' ? 'Pelanggan Shopee' : 'Pelanggan TikTok') }}
                                        </div>
                                        <div class="text-[11px] text-gray-500 dark:text-gray-400 font-mono">
                                            {{ $order['buyer_phone'] ?: '-' }}
                                        </div>
                                    </div>
                                </td>

                                {{-- Produk Dipesan --}}
                                <td class="py-3.5 px-4 align-top">
                                    <div class="space-y-1 max-w-xs">
                                        @php
                                            $items = $order['items'] ?? [];
                                            $displayItems = array_slice($items, 0, 2);
                                            $remaining = count($items) - 2;
                                        @endphp
                                        @forelse ($displayItems as $it)
                                            <div class="text-xs text-gray-800 dark:text-gray-200 truncate flex items-center gap-1.5" title="{{ $it['product_name'] ?? '' }}">
                                                <span class="font-bold text-primary-600 dark:text-primary-400 shrink-0">{{ $it['quantity'] ?? 1 }}x</span>
                                                <span class="truncate">{{ $it['product_name'] ?? 'Produk' }}</span>
                                                @if (!empty($it['sku_name']))
                                                    <span class="text-[11px] text-gray-500 dark:text-gray-400 shrink-0">({{ $it['sku_name'] }})</span>
                                                @endif
                                                @if (empty($it['is_connected']))
                                                    <span class="inline-flex items-center px-1.5 py-0.5 text-[9px] font-medium rounded bg-rose-50 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400 border border-rose-200 dark:border-rose-800 shrink-0" title="Belum terhubung ke produk website">
                                                        Belum Terhubung
                                                    </span>
                                                @endif
                                            </div>
                                        @empty
                                            <span class="text-gray-400 italic text-[11px]">-</span>
                                        @endforelse
                                        @if ($remaining > 0)
                                            <button
                                                wire:click="openDrawer('{{ $order['id'] }}')"
                                                type="button"
                                                class="text-[10px] text-primary-600 dark:text-primary-400 hover:underline font-semibold cursor-pointer"
                                            >
                                                +{{ $remaining }} produk lainnya...
                                            </button>
                                        @endif
                                    </div>
                                </td>

                                {{-- Total & Kurir --}}
                                <td class="py-3.5 px-4 whitespace-nowrap align-top">
                                    <div class="space-y-1">
                                        <div class="font-bold text-gray-950 dark:text-white text-xs">
                                            Rp {{ number_format($order['total_amount'] ?? 0, 0, ',', '.') }}
                                        </div>
                                        <div class="flex items-center gap-1.5 flex-wrap">
                                            <span class="inline-block px-1.5 py-0.5 rounded text-[10px] bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-gray-300 font-medium">
                                                {{ $order['shipping_courier'] ?? 'TikTok Shipping' }}
                                            </span>
                                            @if (!empty($order['tracking_number']))
                                                <span class="text-[10px] font-mono text-gray-500 dark:text-gray-400">
                                                    {{ $order['tracking_number'] }}
                                                </span>
                                            @endif
                                        </div>
                                    </div>
                                </td>

                                {{-- Status TikTok --}}
                                <td class="py-3.5 px-4 whitespace-nowrap align-top">
                                    @php
                                        $ttsBadgeColor = match ($order['status_color']) {
                                            'warning' => 'warning',
                                            'info' => 'info',
                                            'success' => 'success',
                                            'danger' => 'danger',
                                            default => 'gray',
                                        };
                                    @endphp
                                    <x-filament::badge :color="$ttsBadgeColor" size="sm">
                                        {{ $order['status_label'] }}
                                    </x-filament::badge>
                                </td>

                                {{-- Status Website --}}
                                <td class="py-3.5 px-4 whitespace-nowrap align-top">
                                    @if (!empty($order['is_saved']))
                                        <div class="space-y-1">
                                            <x-filament::badge color="success" size="sm" icon="heroicon-m-check">
                                                Tersimpan
                                            </x-filament::badge>
                                            <div>
                                                <a
                                                    href="{{ \App\Filament\Resources\EcommerceOrders\EcommerceOrderResource::getUrl() }}?tableSearch={{ $order['local_order_number'] }}"
                                                    target="_blank"
                                                    class="text-[11px] font-mono text-primary-600 dark:text-primary-400 hover:underline inline-flex items-center gap-0.5"
                                                    title="Buka di Pesanan Ecommerce"
                                                >
                                                    <span>#{{ $order['local_order_number'] }}</span>
                                                    <x-filament::icon icon="heroicon-m-arrow-top-right-on-square" class="w-3 h-3 opacity-60" />
                                                </a>
                                            </div>
                                        </div>
                                    @else
                                        <x-filament::badge color="warning" size="sm" icon="heroicon-m-clock">
                                            Belum Disimpan
                                        </x-filament::badge>
                                    @endif
                                </td>

                                {{-- Aksi --}}
                                <td class="py-3.5 px-4 whitespace-nowrap align-top text-center">
                                    <div class="flex items-center justify-center gap-1.5">
                                        @if (empty($order['is_saved']))
                                            @if (! empty($order['has_connected_products']))
                                                <x-filament::button
                                                    size="xs"
                                                    color="warning"
                                                    icon="heroicon-m-arrow-down-tray"
                                                    wire:click="saveOrder('{{ $order['id'] }}')"
                                                    wire:loading.attr="disabled"
                                                    wire:target="saveOrder('{{ $order['id'] }}')"
                                                    title="Simpan pesanan ini ke pesanan website"
                                                >
                                                    Simpan
                                                </x-filament::button>
                                            @else
                                                <button
                                                    type="button"
                                                    disabled
                                                    class="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 cursor-not-allowed border border-gray-200 dark:border-gray-700"
                                                    title="Belum dapat disimpan: produk belum terhubung ke katalog website"
                                                >
                                                    <x-filament::icon icon="heroicon-m-lock-closed" class="w-3.5 h-3.5" />
                                                    <span>Belum Terhubung</span>
                                                </button>
                                            @endif
                                        @endif

                                        <x-filament::button
                                            size="xs"
                                            color="gray"
                                            icon="heroicon-m-eye"
                                            wire:click="openDrawer('{{ $order['id'] }}')"
                                            title="Lihat rincian lengkap pesanan"
                                        >
                                            Detail
                                        </x-filament::button>
                                    </div>
                                </td>
                            </tr>
                        @empty
                            <tr>
                                <td colspan="7" class="py-12 text-center text-gray-400 dark:text-gray-500">
                                    <div class="flex flex-col items-center justify-center">
                                        <svg class="w-12 h-12 text-gray-300 dark:text-gray-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                                        </svg>
                                        <p class="font-medium text-sm">Tidak ada pesanan yang sesuai filter.</p>
                                        <p class="text-xs text-gray-400 mt-1">Coba ubah tab filter atau klik "Tarik Pesanan Terbaru".</p>
                                    </div>
                                </td>
                            </tr>
                        @endforelse
                    </tbody>
                </table>
            </div>
        </x-filament::section>

        {{-- Slide-Over Drawer: Detail Pesanan --}}
        @if ($isDrawerOpen && $selectedOrder)
            <div class="fixed inset-0 z-50 overflow-hidden" aria-labelledby="slide-over-title" role="dialog" aria-modal="true">
                {{-- Backdrop --}}
                <div
                    wire:click="closeDrawer"
                    class="fixed inset-0 bg-gray-900/60 transition-opacity duration-300 ease-in-out cursor-pointer"
                ></div>

                <div class="fixed inset-y-0 right-0 max-w-full flex pl-0 sm:pl-10">
                    <div class="w-screen max-w-lg bg-white dark:bg-gray-900 shadow-2xl flex flex-col h-full transform transition-all duration-300 ease-in-out">
                        {{-- Drawer Header --}}
                        <div class="p-5 border-b border-gray-200 dark:border-gray-800 bg-gray-50/70 dark:bg-gray-800/60 flex items-start justify-between">
                            <div>
                                <div class="flex items-center gap-2">
                                    <h3 class="text-base font-bold text-gray-900 dark:text-white" id="slide-over-title">
                                        Detail Pesanan
                                    </h3>
                                    @php
                                        $dStatusColor = match ($selectedOrder['status_color']) {
                                            'warning' => 'warning',
                                            'info' => 'info',
                                            'success' => 'success',
                                            'danger' => 'danger',
                                            default => 'gray',
                                        };
                                    @endphp
                                    <x-filament::badge :color="$dStatusColor" size="sm">
                                        {{ $selectedOrder['status_label'] }}
                                    </x-filament::badge>
                                </div>
                                <div class="flex items-center gap-2 mt-1">
                                    <span class="text-xs font-mono font-semibold text-primary-600 dark:text-primary-400">
                                        #{{ $selectedOrder['id'] }}
                                    </span>
                                    @if (($selectedOrder['platform'] ?? '') === 'shopee')
                                        <x-filament::badge color="warning" size="xs">Shopee</x-filament::badge>
                                    @else
                                        <x-filament::badge color="gray" size="xs">TikTok Shop</x-filament::badge>
                                    @endif
                                    <button
                                        type="button"
                                        x-on:click="navigator.clipboard.writeText('{{ $selectedOrder['id'] }}'); copied = true; setTimeout(() => copied = false, 2000)"
                                        class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors cursor-pointer"
                                        title="Salin ID Pesanan"
                                    >
                                        <svg x-show="!copied" class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                        </svg>
                                        <span x-show="copied" class="text-[10px] text-emerald-500 font-bold" style="display: none;">Disalin!</span>
                                    </button>
                                </div>
                            </div>

                            <button
                                wire:click="closeDrawer"
                                type="button"
                                class="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
                            >
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {{-- Drawer Body (Scrollable) --}}
                        <div class="flex-1 overflow-y-auto p-5 space-y-5">
                            {{-- Section: Status Website Info --}}
                            @if ($selectedOrder['is_saved'])
                                <div class="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl flex items-center justify-between">
                                    <div class="flex items-center gap-2">
                                        <svg class="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                                        </svg>
                                        <div>
                                            <p class="text-xs font-bold text-emerald-800 dark:text-emerald-300">Tersimpan di Pesanan Website</p>
                                            <p class="text-[11px] text-emerald-700 dark:text-emerald-400 font-mono">#{{ $selectedOrder['local_order_number'] }}</p>
                                        </div>
                                    </div>
                                    <x-filament::button
                                        tag="a"
                                        href="{{ \App\Filament\Resources\EcommerceOrders\EcommerceOrderResource::getUrl() }}?tableSearch={{ $selectedOrder['local_order_number'] }}"
                                        target="_blank"
                                        size="xs"
                                        color="success"
                                    >
                                        Buka
                                    </x-filament::button>
                                </div>
                            @else
                                <div class="p-3.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl flex items-center gap-3">
                                    <svg class="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                        <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                                    </svg>
                                    <div>
                                        <p class="text-xs font-bold text-amber-800 dark:text-amber-300">Belum Disimpan ke Website</p>
                                        <p class="text-[11px] text-amber-700 dark:text-amber-400">Klik tombol "Simpan" di bawah untuk mencatat ke data pesanan website.</p>
                                    </div>
                                </div>
                            @endif

                            {{-- Section: Daftar Produk --}}
                            <div class="space-y-3">
                                <h4 class="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                    </svg>
                                    Daftar Produk ({{ count($selectedOrder['items']) }})
                                </h4>

                                <div class="divide-y divide-gray-100 dark:divide-gray-800 bg-gray-50/70 dark:bg-gray-800/40 rounded-xl p-3 border border-gray-100 dark:border-gray-800">
                                    @foreach ($selectedOrder['items'] as $item)
                                        <div class="py-3 first:pt-0 last:pb-0 flex items-start gap-3">
                                            @if (!empty($item['sku_image']))
                                                <img
                                                    src="{{ $item['sku_image'] }}"
                                                    alt="{{ $item['product_name'] }}"
                                                    class="w-12 h-12 object-cover rounded-lg border border-gray-200 dark:border-gray-700 shrink-0"
                                                />
                                            @else
                                                <div class="w-12 h-12 rounded-lg bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-400 shrink-0 text-xs font-bold">
                                                    ☕
                                                </div>
                                            @endif

                                            <div class="flex-1 min-w-0">
                                                <div class="flex items-start justify-between gap-2">
                                                    <h5 class="text-xs font-bold text-gray-900 dark:text-white truncate">
                                                        {{ $item['product_name'] }}
                                                    </h5>
                                                    @if (! empty($item['is_connected']))
                                                        <span class="inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-medium rounded bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 shrink-0">
                                                            <x-filament::icon icon="heroicon-m-check-circle" class="w-3 h-3" />
                                                            Terhubung
                                                        </span>
                                                    @else
                                                        <span class="inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-medium rounded bg-rose-50 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400 border border-rose-200 dark:border-rose-800 shrink-0">
                                                            <x-filament::icon icon="heroicon-m-exclamation-circle" class="w-3 h-3" />
                                                            Belum Terhubung
                                                        </span>
                                                    @endif
                                                </div>
                                                <p class="text-[11px] text-amber-600 dark:text-amber-400 font-semibold mt-0.5">
                                                    Varian: {{ $item['sku_name'] }}
                                                </p>
                                                @if (!empty($item['seller_sku']))
                                                    <p class="text-[10px] text-gray-400 mt-0.5">
                                                        SKU: <span class="font-mono text-gray-600 dark:text-gray-300">{{ $item['seller_sku'] }}</span>
                                                    </p>
                                                @endif
                                                <div class="flex items-center justify-between mt-1 pt-1 border-t border-gray-200/50 dark:border-gray-700/50 text-xs">
                                                    <span class="text-gray-500">{{ $item['quantity'] }} × Rp {{ number_format($item['price'], 0, ',', '.') }}</span>
                                                    <span class="font-bold text-gray-900 dark:text-white">Rp {{ number_format($item['subtotal'], 0, ',', '.') }}</span>
                                                </div>
                                            </div>
                                        </div>
                                    @endforeach
                                </div>
                            </div>

                            {{-- Section: Informasi Pesanan & Pengiriman --}}
                            <div class="space-y-3">
                                <h4 class="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    Informasi Pesanan & Pengiriman
                                </h4>

                                <div class="bg-gray-50/70 dark:bg-gray-800/40 rounded-xl p-3.5 space-y-2 text-xs border border-gray-100 dark:border-gray-800">
                                    <div class="flex justify-between">
                                        <span class="text-gray-400">Waktu Pemesanan</span>
                                        <span class="font-semibold text-gray-800 dark:text-gray-200">{{ $selectedOrder['created_at_formatted'] }}</span>
                                    </div>
                                    <div class="flex justify-between">
                                        <span class="text-gray-400">Penerima</span>
                                        <span class="font-semibold text-gray-800 dark:text-gray-200">{{ $selectedOrder['buyer_name'] }}</span>
                                    </div>
                                    <div class="flex justify-between">
                                        <span class="text-gray-400">No. Telepon</span>
                                        <span class="font-mono text-gray-800 dark:text-gray-200">{{ $selectedOrder['buyer_phone'] }}</span>
                                    </div>
                                    <div class="pt-1 border-t border-gray-200/60 dark:border-gray-700/60">
                                        <span class="text-gray-400 block mb-1">Alamat Pengiriman</span>
                                        <p class="text-gray-700 dark:text-gray-300 leading-relaxed">{{ $selectedOrder['buyer_address'] }}</p>
                                    </div>
                                    <div class="flex justify-between pt-1 border-t border-gray-200/60 dark:border-gray-700/60">
                                        <span class="text-gray-400">Jasa Pengiriman</span>
                                        <span class="font-semibold text-gray-800 dark:text-gray-200">{{ $selectedOrder['shipping_courier'] }}</span>
                                    </div>
                                    <div class="flex justify-between items-center">
                                        <span class="text-gray-400">Nomor Resi (AWB)</span>
                                        <span class="font-mono font-bold text-primary-600 dark:text-primary-400">
                                            {{ $selectedOrder['tracking_number'] ?: 'Belum ada resi' }}
                                        </span>
                                    </div>
                                    @if (!empty($selectedOrder['buyer_message']))
                                        <div class="pt-1 border-t border-gray-200/60 dark:border-gray-700/60">
                                            <span class="text-gray-400 block mb-0.5">Catatan Pembeli</span>
                                            <p class="italic text-gray-600 dark:text-gray-300">"{{ $selectedOrder['buyer_message'] }}"</p>
                                        </div>
                                    @endif
                                </div>
                            </div>

                            {{-- Section: Rincian Pembayaran --}}
                            <div class="space-y-3">
                                <h4 class="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    Rincian Pembayaran
                                </h4>

                                <div class="bg-gray-50/70 dark:bg-gray-800/40 rounded-xl p-3.5 space-y-2 text-xs border border-gray-100 dark:border-gray-800">
                                    <div class="flex justify-between">
                                        <span class="text-gray-400">Subtotal Produk</span>
                                        <span class="text-gray-800 dark:text-gray-200">Rp {{ number_format($selectedOrder['subtotal'], 0, ',', '.') }}</span>
                                    </div>
                                    <div class="flex justify-between">
                                        <span class="text-gray-400">Ongkos Kirim</span>
                                        <span class="text-gray-800 dark:text-gray-200">Rp {{ number_format($selectedOrder['shipping_fee'], 0, ',', '.') }}</span>
                                    </div>
                                    @if ($selectedOrder['seller_discount'] > 0)
                                        <div class="flex justify-between text-emerald-600 dark:text-emerald-400">
                                            <span>Diskon Penjual</span>
                                            <span>- Rp {{ number_format($selectedOrder['seller_discount'], 0, ',', '.') }}</span>
                                        </div>
                                    @endif
                                    <div class="flex justify-between pt-1 border-t border-gray-200 dark:border-gray-700 text-sm font-bold">
                                        <span class="text-gray-900 dark:text-white">Total Transaksi</span>
                                        <span class="text-primary-600 dark:text-primary-400">Rp {{ number_format($selectedOrder['total_amount'], 0, ',', '.') }}</span>
                                    </div>
                                    <div class="flex justify-between text-[11px] text-gray-400 pt-0.5">
                                        <span>Metode Bayar</span>
                                        <span class="font-medium text-gray-700 dark:text-gray-300">{{ $selectedOrder['payment_method'] }}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {{-- Drawer Sticky Footer --}}
                        <div class="p-4 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 space-y-2">
                            @if (! $selectedOrder['is_saved'])
                                @if (! empty($selectedOrder['has_connected_products']))
                                    <x-filament::button
                                        wire:click="saveOrder('{{ $selectedOrder['id'] }}')"
                                        wire:loading.attr="disabled"
                                        color="warning"
                                        icon="heroicon-m-arrow-down-tray"
                                        size="md"
                                        class="w-full justify-center"
                                    >
                                        Simpan ke Pesanan Website
                                    </x-filament::button>
                                    <p class="text-[10px] text-center text-gray-400">
                                        Fungsi Simpan hanya mencatat pesanan ke data website. Tidak akan merubah status penerimaan dan pengiriman di marketplace.
                                    </p>
                                @else
                                    <div class="rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 p-3 space-y-2">
                                        <div class="flex items-start gap-2">
                                            <x-filament::icon icon="heroicon-m-exclamation-triangle" class="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                                            <div class="text-xs text-amber-800 dark:text-amber-200">
                                                <p class="font-bold">Aksi Simpan Terkunci</p>
                                                <p class="mt-0.5 text-[11px] text-amber-700 dark:text-amber-300">
                                                    Belum ada produk di pesanan ini yang terhubung ke katalog website. Silakan hubungkan produk terlebih dahulu di menu <strong>Pemetaan Produk Marketplace</strong> agar stok dan transaksi tercatat dengan benar.
                                                </p>
                                            </div>
                                        </div>
                                        <a
                                            href="{{ \App\Filament\Resources\MarketplaceProductMappings\MarketplaceProductMappingResource::getUrl() }}"
                                            target="_blank"
                                            class="inline-flex items-center justify-center gap-1 w-full px-3 py-1.5 text-xs font-semibold rounded-md bg-amber-600 hover:bg-amber-700 text-white transition shadow-sm"
                                        >
                                            <x-filament::icon icon="heroicon-m-arrows-right-left" class="w-3.5 h-3.5" />
                                            <span>Buka Pemetaan Produk Marketplace</span>
                                        </a>
                                    </div>

                                    <button
                                        type="button"
                                        disabled
                                        class="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 cursor-not-allowed border border-gray-200 dark:border-gray-700"
                                    >
                                        <x-filament::icon icon="heroicon-m-lock-closed" class="w-4 h-4" />
                                        <span>Simpan Terkunci (Produk Belum Terhubung)</span>
                                    </button>
                                @endif
                            @else
                                <div class="flex items-center gap-2">
                                    <x-filament::button
                                        tag="a"
                                        href="{{ \App\Filament\Resources\EcommerceOrders\EcommerceOrderResource::getUrl() }}?tableSearch={{ $selectedOrder['local_order_number'] }}"
                                        target="_blank"
                                        color="primary"
                                        size="sm"
                                        class="flex-1 justify-center"
                                    >
                                        Lihat di Pesanan Website
                                    </x-filament::button>
                                    <x-filament::button
                                        wire:click="closeDrawer"
                                        color="gray"
                                        size="sm"
                                    >
                                        Tutup
                                    </x-filament::button>
                                </div>
                            @endif
                        </div>
                    </div>
                </div>
            </div>
        @endif
    </div>
</x-filament-panels::page>
