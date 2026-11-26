<x-filament-panels::page>
    <style>
        @media print {
            body * {
                visibility: hidden !important;
            }
            #barcode-print-area,
            #barcode-print-area * {
                visibility: visible !important;
            }
            #barcode-print-area {
                position: absolute !important;
                left: 0 !important;
                top: 0 !important;
                width: 100% !important;
                background: #fff !important;
                padding: 4mm !important;
            }
            .no-print {
                display: none !important;
            }
        }
    </style>

    <div class="space-y-6">
        {{-- Pengaturan & Input Cetak Barcode Produk --}}
        <div class="no-print rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-xs overflow-hidden">
            <div class="px-5 py-4 border-b border-gray-100 dark:border-gray-800">
                <h2 class="text-base font-bold text-gray-900 dark:text-white">Cetak Barcode Produk</h2>
            </div>

            <div class="p-5 space-y-4">
                {{-- Cari & Pilih Produk --}}
                <div>
                    <label class="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Produk</label>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                        <input
                            type="text"
                            wire:model.live.debounce.300ms="search"
                            placeholder="Cari nama produk / varian / SKU..."
                            class="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                        />
                        <select
                            wire:model="selectedVariantId"
                            class="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                        >
                            <option value="">-- Pilih Produk / Varian --</option>
                            @foreach($this->variantOptions as $v)
                                <option value="{{ $v->id }}">
                                    {{ $v->product?->name }}
                                    @if(strcasecmp((string) $v->label, 'Standard') !== 0)
                                        — {{ $v->label }}
                                    @endif
                                    ({{ $v->sku ?: 'AKM-'.$v->product_id.'-'.$v->id }})
                                </option>
                            @endforeach
                        </select>
                    </div>
                </div>

                {{-- Qty --}}
                <div class="max-w-xs">
                    <label class="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Qty</label>
                    <input
                        type="number"
                        min="1"
                        max="200"
                        wire:model="qty"
                        class="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm font-semibold text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                    />
                </div>

                {{-- Pengaturan Tampilan Label --}}
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-2 border-t border-gray-100 dark:border-gray-800">
                    <div>
                        <label class="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Jenis Barcode</label>
                        <select
                            wire:model.live="barcodeType"
                            class="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-1.5 text-xs font-medium text-gray-800 dark:text-gray-200"
                        >
                            <option value="code128">Barcode Batang (Code 128)</option>
                            <option value="qrcode">QR Code (2D / 3D Matrix)</option>
                        </select>
                    </div>

                    <div>
                        <label class="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Ukuran Label</label>
                        <select
                            wire:model.live="labelSize"
                            class="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-1.5 text-xs font-medium text-gray-800 dark:text-gray-200"
                        >
                            <option value="50x30">50 x 30 mm (Thermal)</option>
                            <option value="40x20">40 x 20 mm (Kecil)</option>
                            <option value="a4_grid">A4 Grid (3 Kolom)</option>
                        </select>
                    </div>

                    <label class="flex items-center gap-2 text-xs font-medium text-gray-700 dark:text-gray-300 pt-4 cursor-pointer">
                        <input type="checkbox" wire:model.live="showName" class="rounded border-gray-300 text-primary-600 focus:ring-primary-500">
                        Tampilkan Nama Produk
                    </label>

                    <label class="flex items-center gap-2 text-xs font-medium text-gray-700 dark:text-gray-300 pt-4 cursor-pointer">
                        <input type="checkbox" wire:model.live="showPrice" class="rounded border-gray-300 text-primary-600 focus:ring-primary-500">
                        Tampilkan Harga Jual
                    </label>

                    <label class="flex items-center gap-2 text-xs font-medium text-gray-700 dark:text-gray-300 pt-4 cursor-pointer">
                        <input type="checkbox" wire:model.live="showCode" class="rounded border-gray-300 text-primary-600 focus:ring-primary-500">
                        Tampilkan Kode SKU
                    </label>
                </div>

                <div class="pt-1">
                    <button
                        type="button"
                        wire:click="applyItem"
                        class="inline-flex items-center justify-center rounded-lg bg-sky-600 hover:bg-sky-700 px-5 py-2 text-sm font-semibold text-white shadow-xs transition cursor-pointer"
                    >
                        Terapkan
                    </button>
                </div>
            </div>
        </div>

        {{-- Daftar & Preview Barcode --}}
        @if(! empty($queue))
            <div class="no-print rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-xs overflow-hidden">
                <div class="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 border-b border-gray-100 dark:border-gray-800">
                    <div>
                        <h3 class="text-sm font-bold text-gray-900 dark:text-white">
                            Daftar Cetak ({{ collect($queue)->sum('qty') }} label)
                        </h3>
                    </div>
                    <div class="flex items-center gap-2">
                        <button
                            type="button"
                            wire:click="clearQueue"
                            class="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 dark:border-gray-700 px-3 py-1.5 text-xs font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                        >
                            Kosongkan
                        </button>
                        <button
                            type="button"
                            onclick="window.print()"
                            class="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 px-4 py-1.5 text-xs font-semibold text-white shadow-xs cursor-pointer"
                        >
                            <x-heroicon-o-printer class="w-4 h-4" />
                            Cetak Barcode
                        </button>
                    </div>
                </div>

                <div class="divide-y divide-gray-100 dark:divide-gray-800">
                    @foreach($queue as $idx => $item)
                        <div class="flex items-center justify-between gap-3 px-5 py-2.5 text-xs">
                            <div>
                                <div class="font-semibold text-gray-900 dark:text-white">{{ $item['product_name'] }}</div>
                                <div class="text-gray-500 font-mono">{{ $item['code'] }} &bull; Rp {{ number_format((float) $item['price'], 0, ',', '.') }}</div>
                            </div>
                            <div class="flex items-center gap-3">
                                <span class="px-2.5 py-1 rounded bg-gray-100 dark:bg-gray-800 font-bold text-gray-800 dark:text-gray-200">
                                    {{ $item['qty'] }}x
                                </span>
                                <button
                                    type="button"
                                    wire:click="removeQueueItem({{ $idx }})"
                                    class="text-rose-600 hover:text-rose-700 font-semibold cursor-pointer"
                                >
                                    Hapus
                                </button>
                            </div>
                        </div>
                    @endforeach
                </div>
            </div>

            {{-- Printable Barcode Area --}}
            <div id="barcode-print-area" class="rounded-xl border border-gray-200 dark:border-gray-800 bg-white p-5">
                @php
                    $gridCols = match($labelSize) {
                        '40x20' => 'grid-cols-2 sm:grid-cols-4 md:grid-cols-5',
                        'a4_grid' => 'grid-cols-1 sm:grid-cols-3',
                        default => 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4',
                    };
                    $cardStyle = match($labelSize) {
                        '40x20' => 'width: 100%; max-width: 40mm; min-height: 20mm; box-sizing: border-box; overflow: hidden; margin: 0 auto;',
                        'a4_grid' => 'width: 100%; box-sizing: border-box; overflow: hidden;',
                        default => 'width: 100%; max-width: 50mm; min-height: 30mm; box-sizing: border-box; overflow: hidden; margin: 0 auto;',
                    };
                    $nameFontSize = match($labelSize) {
                        '40x20' => '9px',
                        'a4_grid' => '11px',
                        default => '10.5px',
                    };
                @endphp
                <div class="grid {{ $gridCols }} gap-3">
                    @foreach($queue as $item)
                        @php $svg = $this->renderBarcodeSvg($item['code']); @endphp
                        @for($i = 0; $i < (int) $item['qty']; $i++)
                            <div class="border border-dashed border-gray-300 rounded-md p-2 text-center bg-white text-black flex flex-col justify-between"
                                 style="{{ $cardStyle }}">
                                @if($showName)
                                    <div style="font-size: {{ $nameFontSize }}; line-height: 1.25; font-weight: 700; color: #000; word-break: break-word; overflow-wrap: anywhere; white-space: normal; width: 100%; margin-bottom: 4px;">
                                        {{ $item['product_name'] }}
                                    </div>
                                @endif

                                <div style="{{ $barcodeType === 'qrcode' ? 'padding: 4px 0;' : 'padding: 0 4px;' }}">
                                    {!! $svg !!}
                                </div>

                                @if($showCode)
                                    <div class="text-[10px] font-mono tracking-wider text-gray-800 mt-0.5">
                                        {{ $item['code'] }}
                                    </div>
                                @endif

                                @if($showPrice)
                                    <div class="text-xs font-extrabold text-black mt-0.5">
                                        Rp {{ number_format((float) $item['price'], 0, ',', '.') }}
                                    </div>
                                @endif
                            </div>
                        @endfor
                    @endforeach
                </div>
            </div>
        @endif
    </div>
</x-filament-panels::page>
