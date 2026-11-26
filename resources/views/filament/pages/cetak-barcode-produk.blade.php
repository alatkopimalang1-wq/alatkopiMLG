<x-filament-panels::page>
    <style>
        @if($labelSize === '40x20')
            @page { size: 40mm 20mm; margin: 0; }
        @elseif($labelSize === '50x30')
            @page { size: 50mm 30mm; margin: 0; }
        @else
            @page { size: A4; margin: 8mm; }
        @endif

        @media print {
            html, body {
                margin: 0 !important;
                padding: 0 !important;
                background: #fff !important;
                height: auto !important;
                min-height: 0 !important;
            }
            body.is-printing-barcode > *:not(#print-only-root) {
                display: none !important;
            }
            #print-only-root {
                display: block !important;
                width: 100% !important;
                margin: 0 !important;
                padding: 0 !important;
                background: #fff !important;
            }
            #print-only-root #barcode-print-area {
                width: 100% !important;
                background: #fff !important;
                border: none !important;
                padding: 0 !important;
                margin: 0 !important;
                box-shadow: none !important;
            }
            .barcode-grid {
                @if($labelSize === 'a4_grid')
                    display: grid !important;
                    grid-template-columns: repeat(3, 1fr) !important;
                    gap: 4mm !important;
                @else
                    display: block !important;
                @endif
            }
            .barcode-label-card {
                border: none !important;
                border-radius: 0 !important;
                box-shadow: none !important;
                margin: 0 !important;
                box-sizing: border-box !important;
                overflow: hidden !important;
                display: flex !important;
                flex-direction: column !important;
                justify-content: center !important;
                align-items: center !important;
                text-align: center !important;
                @if($labelSize === '40x20')
                    width: 40mm !important;
                    height: 19.5mm !important;
                    min-height: 0 !important;
                    padding: 1mm 1.5mm !important;
                @elseif($labelSize === '50x30')
                    width: 50mm !important;
                    height: 29.5mm !important;
                    min-height: 0 !important;
                    padding: 1.5mm 2mm !important;
                @else
                    width: 100% !important;
                    min-height: 35mm !important;
                    padding: 3mm !important;
                    border: 1px dashed #d1d5db !important;
                    break-inside: avoid !important;
                    page-break-inside: avoid !important;
                @endif
            }
            @if($labelSize !== 'a4_grid')
            .barcode-label-card:not(:last-child) {
                page-break-after: always !important;
                break-after: page !important;
            }
            @endif
            .barcode-label-name {
                font-weight: 700 !important;
                color: #000 !important;
                white-space: normal !important;
                word-break: normal !important;
                overflow-wrap: break-word !important;
                width: 100% !important;
                overflow: hidden !important;
                @if($labelSize === '40x20')
                    font-size: 6.5pt !important;
                    line-height: 1.1 !important;
                    max-height: 14.5pt !important;
                    margin-bottom: 1pt !important;
                @elseif($labelSize === '50x30')
                    font-size: 7.5pt !important;
                    line-height: 1.15 !important;
                    max-height: 17.5pt !important;
                    margin-bottom: 1.5pt !important;
                @else
                    font-size: 9pt !important;
                    line-height: 1.2 !important;
                    margin-bottom: 3pt !important;
                @endif
            }
            .barcode-label-svg svg {
                @if($barcodeType === 'qrcode')
                    @if($labelSize === '40x20')
                        width: 26px !important;
                        height: 26px !important;
                    @elseif($labelSize === '50x30')
                        width: 38px !important;
                        height: 38px !important;
                    @else
                        width: 64px !important;
                        height: 64px !important;
                    @endif
                @else
                    width: 100% !important;
                    @if($labelSize === '40x20')
                        height: 18px !important;
                    @elseif($labelSize === '50x30')
                        height: 26px !important;
                    @else
                        height: 38px !important;
                    @endif
                @endif
            }
            .barcode-label-code {
                color: #000 !important;
                @if($labelSize === '40x20')
                    font-size: 5.5pt !important;
                    line-height: 1.05 !important;
                    margin-top: 1pt !important;
                @elseif($labelSize === '50x30')
                    font-size: 6.5pt !important;
                    line-height: 1.1 !important;
                    margin-top: 1pt !important;
                @else
                    font-size: 8pt !important;
                    line-height: 1.2 !important;
                    margin-top: 2pt !important;
                @endif
            }
            .barcode-label-price {
                color: #000 !important;
                font-weight: 800 !important;
                @if($labelSize === '40x20')
                    font-size: 9pt !important;
                    line-height: 1.1 !important;
                    margin-top: 1.5pt !important;
                @elseif($labelSize === '50x30')
                    font-size: 11.5pt !important;
                    line-height: 1.15 !important;
                    margin-top: 2pt !important;
                @else
                    font-size: 13pt !important;
                    line-height: 1.2 !important;
                    margin-top: 3pt !important;
                @endif
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
                {{-- Cari & Pilih Produk (1 input combobox) --}}
                <div class="relative" x-data="{ open: false }" @click.outside="open = false">
                    <label class="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Produk</label>
                    <div class="relative">
                        <input
                            type="text"
                            wire:model.live.debounce.250ms="search"
                            @focus="open = true"
                            @input="open = true"
                            placeholder="Cari nama produk / varian / SKU..."
                            class="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 pr-9 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                        />
                        @if($search !== '' || $selectedVariantId)
                            <button
                                type="button"
                                wire:click="clearSelectedVariant"
                                @click="open = true"
                                class="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer"
                                title="Bersihkan"
                            >
                                <x-heroicon-m-x-mark class="w-4 h-4" />
                            </button>
                        @endif
                    </div>

                    <div
                        x-show="open"
                        x-cloak
                        class="absolute z-40 mt-1 w-full max-h-64 overflow-y-auto rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg divide-y divide-gray-100 dark:divide-gray-700/60"
                    >
                        @forelse($this->variantOptions as $v)
                            @php
                                $vLabel = strcasecmp((string) $v->label, 'Standard') === 0 ? '' : ' — '.$v->label;
                                $vCode = $v->sku ?: 'AKM-'.$v->product_id.'-'.$v->id;
                                $fullLabel = ($v->product?->name ?? 'Produk').$vLabel.' ('.$vCode.')';
                            @endphp
                            <button
                                type="button"
                                wire:click="selectVariant({{ $v->id }}, @js($fullLabel))"
                                @click="open = false"
                                class="w-full text-left px-3 py-2 text-sm hover:bg-sky-50 dark:hover:bg-gray-700/70 flex items-center justify-between gap-2 cursor-pointer {{ (int) $selectedVariantId === (int) $v->id ? 'bg-sky-50 dark:bg-gray-700 font-semibold' : '' }}"
                            >
                                <span class="text-gray-900 dark:text-white truncate">
                                    {{ $v->product?->name }}{{ $vLabel }}
                                </span>
                                <span class="text-xs font-mono text-gray-500 dark:text-gray-400 shrink-0">
                                    {{ $vCode }}
                                </span>
                            </button>
                        @empty
                            <div class="px-3 py-2.5 text-xs text-gray-500 dark:text-gray-400">
                                Produk tidak ditemukan.
                            </div>
                        @endforelse
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

                <div class="pt-2">
                    <x-filament::button
                        type="button"
                        wire:click="applyItem"
                        color="info"
                        icon="heroicon-m-plus"
                    >
                        Terapkan
                    </x-filament::button>
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
                        <x-filament::button
                            type="button"
                            wire:click="clearQueue"
                            color="gray"
                            size="sm"
                            outlined
                        >
                            Kosongkan
                        </x-filament::button>
                        <x-filament::button
                            type="button"
                            onclick="window.printBarcodeLabels()"
                            color="success"
                            size="sm"
                            icon="heroicon-o-printer"
                        >
                            Cetak Barcode
                        </x-filament::button>
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
                <div class="barcode-grid grid {{ $gridCols }} gap-3">
                    @foreach($queue as $item)
                        @php $svg = $this->renderBarcodeSvg($item['code']); @endphp
                        @for($i = 0; $i < (int) $item['qty']; $i++)
                            <div class="barcode-label-card border border-dashed border-gray-300 rounded-md p-2 text-center bg-white text-black flex flex-col justify-between"
                                 style="{{ $cardStyle }}">
                                @if($showName)
                                    <div class="barcode-label-name" style="font-size: {{ $nameFontSize }}; line-height: 1.25; font-weight: 700; color: #000; word-break: normal; overflow-wrap: break-word; white-space: normal; width: 100%; margin-bottom: 4px;">
                                        {{ $item['product_name'] }}
                                    </div>
                                @endif

                                <div class="barcode-label-svg" style="{{ $barcodeType === 'qrcode' ? 'padding: 2px 0;' : 'padding: 0 4px; width: 100%;' }}">
                                    {!! $svg !!}
                                </div>

                                @if($showCode)
                                    <div class="barcode-label-code text-[10px] font-mono tracking-wider text-gray-800 mt-0.5">
                                        {{ $item['code'] }}
                                    </div>
                                @endif

                                @if($showPrice)
                                    <div class="barcode-label-price text-base font-extrabold text-black mt-1" style="font-size: 15px; font-weight: 800;">
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

    <script>
        window.printBarcodeLabels = function () {
            const area = document.getElementById('barcode-print-area');
            if (!area) return;

            const existing = document.getElementById('print-only-root');
            if (existing) existing.remove();

            const root = document.createElement('div');
            root.id = 'print-only-root';
            root.style.display = 'none';
            root.appendChild(area.cloneNode(true));
            document.body.appendChild(root);
            document.body.classList.add('is-printing-barcode');

            const cleanup = () => {
                document.body.classList.remove('is-printing-barcode');
                const el = document.getElementById('print-only-root');
                if (el) el.remove();
                window.removeEventListener('afterprint', cleanup);
            };
            window.addEventListener('afterprint', cleanup);

            window.print();
            setTimeout(cleanup, 1000);
        };
    </script>
</x-filament-panels::page>
