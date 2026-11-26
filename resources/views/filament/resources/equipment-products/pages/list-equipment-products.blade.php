<x-filament-panels::page>
    <style>
        @media (max-width: 767px) {
            .equipment-table-wrap .fi-ta-table,
            .equipment-table-wrap .fi-ta-filters-above-content-ctn,
            .equipment-table-wrap .fi-ta-filters,
            .equipment-table-wrap .fi-pagination-records-per-page-select {
                display: none !important;
            }
        }
    </style>

    <div class="equipment-table-wrap space-y-3">
        {{ $this->table }}

        {{-- Mobile Card View (hidden on md+) --}}
        <div class="md:hidden space-y-3">
            @forelse($this->getTableRecords() as $record)
                @php
                    /** @var \App\Models\Product $record */
                    $rawImg = $record->primaryImage?->path
                        ?? $record->images->first(fn ($img) => ! empty($img->path))?->path
                        ?? $record->variants->first(fn ($v) => ! empty($v->image))?->image;
                    $imgUrl = $rawImg
                        ? (str_starts_with($rawImg, 'http') ? $rawImg : asset('storage/' . ltrim(preg_replace('#^/?(?:(?:storage|public)/)+#', '', trim($rawImg)), '/')))
                        : asset('brand/logo-circle.png');

                    $variants = $record->variants;
                    $hasMultipleVariants = $variants->count() > 1
                        || ($variants->count() === 1 && strcasecmp((string) $variants->first()->label, 'Standard') !== 0);
                    $singleVariant = $variants->first();
                    $editUrl = \App\Filament\Resources\EquipmentProducts\EquipmentProductResource::getUrl('edit', ['record' => $record]);
                    $webUrl = route('shop.show', $record->slug);
                    $fmt = fn ($val) => 'IDR ' . number_format((float) $val, 0, ',', '.');
                @endphp

                <div class="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-3 shadow-xs space-y-2.5"
                     x-data="{ open: false, menuOpen: false }">
                    {{-- Top Row: Image, Name, Status Pill, 3-Dots Menu --}}
                    <div class="flex items-center justify-between gap-2">
                        <a href="{{ $editUrl }}" class="flex items-center gap-2.5 min-w-0 flex-1">
                            <img src="{{ $imgUrl }}"
                                 alt="{{ $record->name }}"
                                 class="w-11 h-11 rounded-lg object-cover border border-gray-200 dark:border-gray-700 shrink-0">
                            <span class="text-sm font-semibold text-gray-900 dark:text-white truncate">
                                {{ $record->name }}
                            </span>
                        </a>

                        <div class="flex items-center gap-1.5 shrink-0">
                            @if($hasMultipleVariants)
                                <span class="inline-flex items-center px-2.5 py-1 rounded-md border border-gray-300 dark:border-gray-700 text-xs font-medium text-gray-600 dark:text-gray-300 whitespace-nowrap">
                                    Mengikuti varian
                                </span>
                            @elseif($record->is_preorder)
                                @if($record->is_out_of_stock)
                                    <span class="inline-flex items-center px-2.5 py-1 rounded-md bg-rose-600 text-white text-xs font-semibold whitespace-nowrap">
                                        Kosong (PO)
                                    </span>
                                @else
                                    <span class="inline-flex items-center px-2.5 py-1 rounded-md bg-emerald-600 text-white text-xs font-semibold whitespace-nowrap">
                                        Tersedia (PO)
                                    </span>
                                @endif
                            @else
                                @php $sQty = (int) ($singleVariant?->stock ?? $record->stock ?? 0); @endphp
                                <span class="inline-flex items-center px-2.5 py-1 rounded-md border {{ $sQty <= 1 ? 'border-amber-400 bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300' : 'border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200' }} text-xs font-medium whitespace-nowrap">
                                    {{ $sQty }} Stok
                                </span>
                            @endif

                            {{-- 3-dots Kelola Menu --}}
                            <div class="relative">
                                <button type="button"
                                        @click="menuOpen = !menuOpen"
                                        @click.outside="menuOpen = false"
                                        class="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800">
                                    <x-heroicon-m-ellipsis-vertical class="w-5 h-5" />
                                </button>
                                <div x-show="menuOpen"
                                     x-cloak
                                     x-transition
                                     class="absolute right-0 mt-1 w-44 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg z-30 py-1 text-xs font-medium">
                                    <button type="button"
                                            wire:click="duplicateProduct({{ $record->id }})"
                                            wire:confirm="Salin produk ini beserta varian dan fotonya?"
                                            @click="menuOpen = false"
                                            class="w-full text-left px-3 py-2 flex items-center gap-2 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700">
                                        <x-heroicon-o-document-duplicate class="w-4 h-4" />
                                        Salin
                                    </button>
                                    <a href="{{ $webUrl }}"
                                       target="_blank"
                                       @click="menuOpen = false"
                                       class="w-full px-3 py-2 flex items-center gap-2 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700">
                                        <x-heroicon-o-arrow-top-right-on-square class="w-4 h-4" />
                                        Cek produk di web
                                    </a>
                                    <a href="{{ $editUrl }}"
                                       class="w-full px-3 py-2 flex items-center gap-2 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700">
                                        <x-heroicon-o-pencil-square class="w-4 h-4" />
                                        Edit
                                    </a>
                                    <button type="button"
                                            wire:click="deleteProduct({{ $record->id }})"
                                            wire:confirm="Yakin ingin menghapus produk '{{ addslashes($record->name) }}'?"
                                            @click="menuOpen = false"
                                            class="w-full text-left px-3 py-2 flex items-center gap-2 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40">
                                        <x-heroicon-o-trash class="w-4 h-4" />
                                        Hapus
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    @if($hasMultipleVariants)
                        {{-- Collapsible Variants Bar --}}
                        <button type="button"
                                @click="open = !open"
                                class="w-full flex items-center justify-between rounded-lg bg-gray-100 dark:bg-gray-800 px-3 py-2 text-left transition">
                            <div class="flex items-center gap-3">
                                <div class="flex items-center -space-x-2">
                                    <img src="{{ $imgUrl }}" alt="" class="w-7 h-7 rounded-full object-cover border border-white dark:border-gray-900">
                                    @if($variants->count() > 1)
                                        <span class="w-7 h-7 rounded-full bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 flex items-center justify-center text-[11px] font-bold text-gray-700 dark:text-gray-200 shadow-2xs">
                                            +{{ $variants->count() - 1 }}
                                        </span>
                                    @endif
                                </div>
                                <span class="text-sm font-medium text-gray-800 dark:text-gray-200">
                                    {{ $variants->count() }} varian
                                </span>
                            </div>
                            <x-heroicon-m-chevron-down class="w-5 h-5 text-gray-600 dark:text-gray-300 transition-transform duration-200" x-bind:class="open ? 'rotate-180' : ''" />
                        </button>

                        {{-- Expanded Variants List --}}
                        <div x-show="open"
                             x-cloak
                             x-collapse
                             class="rounded-lg border border-gray-100 dark:border-gray-800 divide-y divide-gray-100 dark:divide-gray-800 bg-gray-50/40 dark:bg-gray-800/30">
                            @foreach($variants as $v)
                                @php
                                    $vQty = (int) ($v->stock ?? 0);
                                    $vIsPoOut = $record->is_preorder && ($record->stock_status === 'out_of_stock' || $v->stock_status === 'out_of_stock');
                                @endphp
                                <div class="flex items-center justify-between gap-2 px-3 py-2.5">
                                    <div class="min-w-0 flex-1">
                                        <div class="text-sm font-semibold text-gray-900 dark:text-white truncate">
                                            {{ $v->label }}
                                        </div>
                                        <div class="text-xs text-gray-400 dark:text-gray-500 mt-0.5 truncate">
                                            {{ $v->sku ? "SKU: {$v->sku}" : 'SKU: —' }}
                                        </div>
                                    </div>

                                    <div class="shrink-0">
                                        @if($record->is_preorder)
                                            @if($vIsPoOut)
                                                <span class="inline-flex items-center px-2 py-0.5 rounded bg-rose-600 text-white text-xs font-semibold">Kosong (PO)</span>
                                            @else
                                                <span class="inline-flex items-center px-2 py-0.5 rounded bg-emerald-600 text-white text-xs font-semibold">Tersedia (PO)</span>
                                            @endif
                                        @else
                                            <span class="inline-flex items-center px-2.5 py-0.5 rounded-md border {{ $vQty <= 1 ? 'border-amber-400 bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300' : 'border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200' }} text-xs font-medium">
                                                {{ $vQty }} Stok
                                            </span>
                                        @endif
                                    </div>

                                    <div class="text-right shrink-0">
                                        <div class="text-sm font-semibold text-gray-900 dark:text-white">
                                            {{ $fmt($v->price ?? 0) }}
                                        </div>
                                        <div class="text-xs text-gray-400 dark:text-gray-500">
                                            Beli: {{ $fmt($v->cost_price ?? 0) }}
                                        </div>
                                    </div>
                                </div>
                            @endforeach
                        </div>
                    @else
                        {{-- Single Product Bottom Summary --}}
                        <div class="flex items-center justify-between text-xs pt-1 border-t border-gray-100 dark:border-gray-800">
                            <span class="text-gray-400 dark:text-gray-500 font-mono">
                                {{ $singleVariant?->sku ?: 'SKU: —' }}
                            </span>
                            <div class="text-right">
                                <span class="text-sm font-semibold text-gray-900 dark:text-white">
                                    {{ $fmt($singleVariant?->price ?? $record->min_price ?? 0) }}
                                </span>
                                <span class="text-gray-400 dark:text-gray-500 ml-1.5">
                                    (Beli: {{ $fmt($singleVariant?->cost_price ?? 0) }})
                                </span>
                            </div>
                        </div>
                    @endif
                </div>
            @empty
                <div class="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 text-center text-sm text-gray-500">
                    Tidak ada produk ditemukan.
                </div>
            @endforelse
        </div>
    </div>
</x-filament-panels::page>
