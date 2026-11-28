<x-filament-panels::page>
    @php
        $doc = $this->document;
        $isOut = $doc?->type === 'out';
        $isDraft = $doc?->isDraft() ?? false;
        $isPosted = $doc?->isPosted() ?? false;
        $isCancelled = $doc?->isCancelled() ?? false;
        $searchResults = $this->searchResults;
        $fmt = fn ($val) => 'Rp ' . number_format((float) $val, 0, ',', '.');
        $backUrl = \App\Filament\Pages\InventoriStok::getUrl(['tab' => $isOut ? 'keluar' : 'masuk']);
    @endphp

    @if($doc)
        <div class="space-y-4">
            {{-- Top Document Header Bar --}}
            <div class="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden shadow-xs">
                <div class="flex items-stretch">
                    {{-- Status Badge Box --}}
                    <div class="flex items-center justify-center px-6 py-4 text-sm font-bold
                        @if($isDraft) bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300
                        @elseif($isPosted) bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300
                        @else bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 @endif">
                        @if($isDraft)
                            Draft
                        @elseif($isPosted)
                            Posted
                        @else
                            Dibatalkan
                        @endif
                    </div>

                    <div class="px-5 py-3 flex flex-col justify-center">
                        <span class="text-xs text-gray-500 dark:text-gray-400">
                            No. {{ $isOut ? 'Stok Keluar' : 'Stok Masuk' }}
                        </span>
                        <span class="text-lg font-bold text-gray-900 dark:text-white tracking-tight">
                            {{ $doc->document_number }}
                        </span>
                    </div>
                </div>

                {{-- Right Action Buttons --}}
                <div class="flex flex-wrap items-center gap-2 px-5 py-3">
                    <a href="{{ $backUrl }}"
                       class="inline-flex items-center rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 px-3 py-2 text-xs font-semibold text-gray-700 dark:text-gray-200 transition">
                        &larr; Kembali
                    </a>

                    @if($isDraft)
                        <button type="button"
                                wire:click="saveAsDraft"
                                class="inline-flex items-center gap-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 px-3.5 py-2 text-xs font-semibold text-white transition cursor-pointer">
                            Draf
                        </button>
                    @endif

                    @if(! $isCancelled)
                        <button type="button"
                                wire:click="cancelDocument"
                                wire:confirm="{{ $isPosted ? 'Batalkan dokumen yang sudah diposting? Perubahan stok akan dikembalikan otomatis.' : 'Batalkan dokumen draf ini?' }}"
                                class="inline-flex items-center gap-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 px-3.5 py-2 text-xs font-semibold text-white transition cursor-pointer">
                            &times; Batalkan
                        </button>
                    @endif

                    @if($isDraft)
                        <button type="button"
                                wire:click="postNow"
                                wire:confirm="Posting dokumen ini sekarang? Stok produk akan langsung diperbarui."
                                class="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 px-4 py-2 text-xs font-semibold text-white shadow-xs transition cursor-pointer">
                            &#10003; {{ $isOut ? 'Posting Sekarang' : 'Post Sekarang' }}
                        </button>
                    @endif
                </div>
            </div>

            {{-- Info Cards Grid --}}
            <div class="grid grid-cols-1 sm:grid-cols-2 {{ $isOut ? 'lg:grid-cols-4' : 'lg:grid-cols-3' }} gap-4">
                {{-- Card 1: Tanggal --}}
                <div class="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 shadow-xs flex flex-col justify-between">
                    <div class="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-2.5">
                        <span class="text-sm font-bold text-gray-800 dark:text-gray-100">Tanggal</span>
                        @if($isDraft)
                            <button type="button"
                                    wire:click="mountAction('editMeta', { field: 'document_date' })"
                                    class="rounded-md bg-sky-600 hover:bg-sky-700 px-2.5 py-1 text-xs font-semibold text-white cursor-pointer transition">
                                Ubah
                            </button>
                        @endif
                    </div>
                    <div class="pt-3 text-xs text-gray-600 dark:text-gray-300 space-y-1">
                        <div class="flex justify-between">
                            <span class="text-gray-400">Tanggal buat</span>
                            <span class="font-medium text-gray-800 dark:text-gray-200">{{ $doc->document_date?->format('d-M-Y') }}</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-gray-400">Dibuat oleh</span>
                            <span class="font-medium text-gray-800 dark:text-gray-200">{{ $doc->user?->email ?? $doc->user?->name ?? '-' }}</span>
                        </div>
                    </div>
                </div>

                @if($isOut)
                    {{-- Card 2 (Out): Transfer ke --}}
                    <div class="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 shadow-xs flex flex-col justify-between">
                        <div class="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-2.5">
                            <span class="text-sm font-bold text-gray-800 dark:text-gray-100">Transfer ke</span>
                            @if($isDraft)
                                <button type="button"
                                        wire:click="mountAction('editMeta', { field: 'transfer_to' })"
                                        class="rounded-md bg-sky-600 hover:bg-sky-700 px-2.5 py-1 text-xs font-semibold text-white cursor-pointer transition">
                                    Ubah
                                </button>
                            @endif
                        </div>
                        <div class="pt-3 text-sm text-gray-700 dark:text-gray-300">
                            {{ $doc->transfer_to ?: '-' }}
                        </div>
                    </div>
                @else
                    {{-- Card 2 (In): Supplier --}}
                    <div class="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 shadow-xs flex flex-col justify-between">
                        <div class="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-2.5">
                            <span class="text-sm font-bold text-gray-800 dark:text-gray-100">Supplier</span>
                            @if($isDraft)
                                <button type="button"
                                        wire:click="mountAction('editMeta', { field: 'supplier_name' })"
                                        class="rounded-md bg-sky-600 hover:bg-sky-700 px-2.5 py-1 text-xs font-semibold text-white cursor-pointer transition">
                                    Ubah
                                </button>
                            @endif
                        </div>
                        <div class="pt-3 text-sm text-gray-700 dark:text-gray-300">
                            {{ $doc->supplier_name ?: '-' }}
                        </div>
                    </div>
                @endif

                {{-- Card 3: Catatan --}}
                <div class="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 shadow-xs flex flex-col justify-between">
                    <div class="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-2.5">
                        <span class="text-sm font-bold text-gray-800 dark:text-gray-100">Catatan</span>
                        @if($isDraft)
                            <button type="button"
                                    wire:click="mountAction('editMeta', { field: 'notes' })"
                                    class="rounded-md bg-sky-600 hover:bg-sky-700 px-2.5 py-1 text-xs font-semibold text-white cursor-pointer transition">
                                Ubah
                            </button>
                        @endif
                    </div>
                    <div class="pt-3 text-sm text-gray-700 dark:text-gray-300">
                        {{ $doc->notes ?: '-' }}
                    </div>
                </div>

                @if($isOut)
                    {{-- Card 4 (Out): Alasan --}}
                    <div class="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 shadow-xs flex flex-col justify-between">
                        <div class="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-2.5">
                            <span class="text-sm font-bold text-gray-800 dark:text-gray-100">Alasan</span>
                            @if($isDraft)
                                <button type="button"
                                        wire:click="mountAction('editMeta', { field: 'reason' })"
                                        class="rounded-md bg-sky-600 hover:bg-sky-700 px-2.5 py-1 text-xs font-semibold text-white cursor-pointer transition">
                                    Ubah
                                </button>
                            @endif
                        </div>
                        <div class="pt-3 text-sm text-gray-700 dark:text-gray-300">
                            {{ $doc->reason ?: '-' }}
                        </div>
                    </div>
                @endif
            </div>

            {{-- Add Product Section (for Draft) --}}
            @if($isDraft && ! $isOut)
                {{-- Stok Masuk: Tambah Produk Card (Produk + Harga Beli + Qty + Add) --}}
                <div class="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 shadow-xs space-y-3">
                    <div class="text-sm font-bold text-gray-800 dark:text-gray-100 border-b border-gray-100 dark:border-gray-800 pb-2">
                        Tambah Produk
                    </div>
                    <div class="grid grid-cols-1 lg:grid-cols-12 gap-3 items-end">
                        {{-- Product Search --}}
                        <div class="lg:col-span-6 relative">
                            <label class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Produk</label>
                            @if($selectedVariantId)
                                <div class="flex items-center justify-between gap-2 rounded-lg border border-primary-500 bg-primary-50/40 dark:bg-primary-950/30 px-3 py-2 text-sm text-gray-900 dark:text-white">
                                    <span class="truncate font-medium">{{ $selectedProductLabel }}</span>
                                    <button type="button" wire:click="clearSelectedProduct" class="text-xs text-rose-600 hover:underline shrink-0 cursor-pointer">
                                        Ganti
                                    </button>
                                </div>
                            @else
                                <input type="text"
                                       wire:model.live.debounce.250ms="productSearch"
                                       placeholder="Cari Produk / SKU..."
                                       class="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 px-3 py-2 text-sm text-gray-900 dark:text-white focus:border-primary-500 focus:ring-primary-500" />
                            @endif

                            @if(! $selectedVariantId && $searchResults->isNotEmpty())
                                <div class="absolute z-30 left-0 right-0 mt-1 max-h-72 overflow-y-auto rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-lg divide-y divide-gray-100 dark:divide-gray-800">
                                    @foreach($searchResults as $res)
                                        @php
                                            $rawImg = $res->image ?: ($res->product?->primaryImage?->path ?? $res->product?->images?->first()?->path);
                                            $imgUrl = $rawImg ? (str_starts_with($rawImg, 'http') ? $rawImg : asset('storage/' . ltrim(preg_replace('#^/?(?:(?:storage|public)/)+#', '', trim($rawImg)), '/'))) : asset('brand/logo-circle.png');
                                            $vLabel = ($res->label && strcasecmp($res->label, 'Standard') !== 0) ? $res->label : null;
                                        @endphp
                                        <button type="button"
                                                wire:click="selectProductForIn({{ $res->id }})"
                                                class="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-800 transition cursor-pointer">
                                            <img src="{{ $imgUrl }}" alt="" class="w-9 h-9 rounded-md object-cover border border-gray-200 shrink-0" />
                                            <div class="min-w-0 flex-1">
                                                <div class="text-sm font-semibold text-gray-900 dark:text-white truncate">{{ $res->product?->name }}</div>
                                                <div class="text-xs text-gray-500">
                                                    @if($vLabel) Varian: {{ $vLabel }} &bull; @endif
                                                    @if($res->sku) SKU: {{ $res->sku }} &bull; @endif
                                                    Stok: {{ (int) ($res->stock ?? 0) }} pcs
                                                </div>
                                            </div>
                                        </button>
                                    @endforeach
                                </div>
                            @endif
                        </div>

                        {{-- Harga Beli --}}
                        <div class="lg:col-span-3">
                            <label class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Harga Beli</label>
                            <input type="number"
                                   wire:model="unitCost"
                                   min="0"
                                   step="100"
                                   class="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 px-3 py-2 text-sm text-gray-900 dark:text-white focus:border-primary-500 focus:ring-primary-500" />
                        </div>

                        {{-- Qty + Add --}}
                        <div class="lg:col-span-3 flex items-end gap-2">
                            <div class="flex-1">
                                <label class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Qty</label>
                                <div class="flex items-center rounded-lg border border-gray-300 dark:border-gray-700 overflow-hidden">
                                    <button type="button"
                                            wire:click="$set('addQty', {{ max(1, $addQty - 1) }})"
                                            class="px-3 py-2 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 text-sm font-bold text-gray-700 dark:text-gray-200 cursor-pointer">-</button>
                                    <input type="number"
                                           wire:model="addQty"
                                           min="1"
                                           class="w-full border-0 text-center text-sm font-semibold bg-white dark:bg-gray-950 text-gray-900 dark:text-white focus:ring-0 py-2" />
                                    <button type="button"
                                            wire:click="$set('addQty', {{ $addQty + 1 }})"
                                            class="px-3 py-2 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 text-sm font-bold text-gray-700 dark:text-gray-200 cursor-pointer">+</button>
                                </div>
                            </div>
                            <button type="button"
                                    wire:click="addItemFromInForm"
                                    class="rounded-lg bg-sky-600 hover:bg-sky-700 px-4 py-2 text-sm font-bold text-white cursor-pointer transition shrink-0">
                                +
                            </button>
                        </div>
                    </div>
                </div>
            @endif

            {{-- Items Table Card --}}
            <div class="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-xs overflow-visible">
                @if($isOut)
                    {{-- Blue Header Bar for Stok Keluar --}}
                    <div class="flex flex-wrap items-center justify-between gap-3 bg-sky-600 px-5 py-3 rounded-t-xl text-white">
                        <div class="text-sm font-bold">
                            Produk Stok Keluar ({{ $doc->items->count() }})
                        </div>
                        @if($isDraft)
                            <div class="flex flex-wrap items-center gap-2">
                                <div class="flex items-center rounded-lg bg-white text-gray-900 overflow-hidden">
                                    <input type="number"
                                           wire:model="addQty"
                                           min="1"
                                           class="w-16 border-0 px-2.5 py-1.5 text-sm font-semibold focus:ring-0" />
                                    <span class="px-2.5 py-1.5 text-xs font-medium text-gray-500 bg-gray-100 border-l border-gray-200">Qty</span>
                                </div>
                                <div class="relative w-64 sm:w-80">
                                    <input type="text"
                                           wire:model.live.debounce.250ms="productSearch"
                                           placeholder="Cari Produk / SKU..."
                                           class="w-full rounded-lg border-0 bg-white px-3 py-1.5 text-sm text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-white/60" />

                                    @if($searchResults->isNotEmpty())
                                        <div class="absolute z-30 left-0 right-0 mt-1 max-h-72 overflow-y-auto rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 shadow-xl divide-y divide-gray-100 dark:divide-gray-800">
                                            @foreach($searchResults as $res)
                                                @php
                                                    $rawImg = $res->image ?: ($res->product?->primaryImage?->path ?? $res->product?->images?->first()?->path);
                                                    $imgUrl = $rawImg ? (str_starts_with($rawImg, 'http') ? $rawImg : asset('storage/' . ltrim(preg_replace('#^/?(?:(?:storage|public)/)+#', '', trim($rawImg)), '/'))) : asset('brand/logo-circle.png');
                                                    $vLabel = ($res->label && strcasecmp($res->label, 'Standard') !== 0) ? $res->label : null;
                                                @endphp
                                                <button type="button"
                                                        wire:click="addItemFromQuickOut({{ $res->id }})"
                                                        class="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-sky-50 dark:hover:bg-gray-800 transition cursor-pointer">
                                                    <img src="{{ $imgUrl }}" alt="" class="w-9 h-9 rounded-md object-cover border border-gray-200 shrink-0" />
                                                    <div class="min-w-0 flex-1">
                                                        <div class="text-sm font-semibold text-gray-900 dark:text-white truncate">{{ $res->product?->name }}</div>
                                                        <div class="text-xs text-gray-500">
                                                            @if($vLabel) Varian: {{ $vLabel }} &bull; @endif
                                                            @if($res->sku) SKU: {{ $res->sku }} &bull; @endif
                                                            Stok: {{ (int) ($res->stock ?? 0) }} pcs
                                                        </div>
                                                    </div>
                                                </button>
                                            @endforeach
                                        </div>
                                    @endif
                                </div>
                            </div>
                        @endif
                    </div>
                @else
                    <div class="px-5 py-3 border-b border-gray-200 dark:border-gray-800 text-sm font-bold text-gray-800 dark:text-gray-100">
                        Produk Stok Masuk ({{ $doc->items->count() }})
                    </div>
                @endif

                @if($doc->items->isEmpty())
                    <div class="py-16 text-center text-sm text-gray-500 dark:text-gray-400">
                        <div class="text-base font-semibold text-gray-700 dark:text-gray-300">Belum ada produk</div>
                        <div class="mt-1 text-xs text-gray-400">Gunakan kolom pencarian di atas untuk menambahkan produk ke dalam draf.</div>
                    </div>
                @else
                    <div class="overflow-x-auto">
                        <table class="w-full text-left text-sm">
                            <thead class="bg-gray-50 dark:bg-gray-950/60 border-b border-gray-200 dark:border-gray-800 text-xs uppercase text-gray-500 dark:text-gray-400">
                                <tr>
                                    <th class="py-3 px-4 font-semibold">Foto</th>
                                    <th class="py-3 px-4 font-semibold">Produk</th>
                                    <th class="py-3 px-4 font-semibold text-center">Stok {{ $isPosted ? '(Sebelum → Sesudah)' : 'Saat Ini' }}</th>
                                    @if(! $isOut)
                                        <th class="py-3 px-4 font-semibold text-right">Harga Beli</th>
                                    @endif
                                    <th class="py-3 px-4 font-semibold text-center">Qty {{ $isOut ? 'Keluar' : 'Masuk' }}</th>
                                    @if(! $isOut)
                                        <th class="py-3 px-4 font-semibold text-right">Subtotal</th>
                                    @endif
                                    @if($isDraft)
                                        <th class="py-3 px-4 font-semibold text-right">Hapus</th>
                                    @endif
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-gray-200 dark:divide-gray-800">
                                @foreach($doc->items as $item)
                                    @php
                                        $v = $item->variant;
                                        $p = $item->product;
                                        $vLabel = ($v && $v->label && strcasecmp($v->label, 'Standard') !== 0) ? $v->label : null;
                                        $imgUrl = $item->image_url ?? asset('brand/logo-circle.png');
                                    @endphp
                                    <tr class="hover:bg-gray-50 dark:hover:bg-gray-800/40">
                                        <td class="py-3 px-4 w-16">
                                            <img src="{{ $imgUrl }}" alt="" class="w-11 h-11 rounded-md object-cover border border-gray-200 dark:border-gray-700" />
                                        </td>
                                        <td class="py-3 px-4">
                                            <div class="font-semibold text-gray-900 dark:text-white">{{ $p?->name ?? '-' }}</div>
                                            <div class="text-xs text-gray-500">
                                                @if($vLabel) Varian: {{ $vLabel }} @endif
                                                @if($vLabel && $v?->sku) &bull; @endif
                                                @if($v?->sku) SKU: {{ $v->sku }} @endif
                                            </div>
                                        </td>
                                        <td class="py-3 px-4 text-center text-xs font-semibold text-gray-600 dark:text-gray-300">
                                            @if($isPosted && $item->qty_before !== null)
                                                {{ $item->qty_before }} &rarr; {{ $item->qty_after }} pcs
                                            @else
                                                {{ (int) ($v?->stock ?? 0) }} pcs
                                            @endif
                                        </td>
                                        @if(! $isOut)
                                            <td class="py-3 px-4 text-right font-medium text-gray-800 dark:text-gray-200">
                                                {{ $fmt($item->unit_cost) }}
                                            </td>
                                        @endif
                                        <td class="py-3 px-4 text-center">
                                            @if($isDraft)
                                                <div class="inline-flex items-center rounded-lg border border-gray-300 dark:border-gray-700 overflow-hidden">
                                                    <button type="button"
                                                            wire:click="updateItemQty({{ $item->id }}, {{ max(0, $item->qty - 1) }})"
                                                            class="px-2.5 py-1 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 text-xs font-bold cursor-pointer">-</button>
                                                    <span class="px-3 py-1 text-xs font-bold text-gray-900 dark:text-white">{{ $item->qty }}</span>
                                                    <button type="button"
                                                            wire:click="updateItemQty({{ $item->id }}, {{ $item->qty + 1 }})"
                                                            class="px-2.5 py-1 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 text-xs font-bold cursor-pointer">+</button>
                                                </div>
                                            @else
                                                <span class="font-bold {{ $isOut ? 'text-rose-600' : 'text-emerald-600' }}">
                                                    {{ $isOut ? '-' : '+' }}{{ $item->qty }} pcs
                                                </span>
                                            @endif
                                        </td>
                                        @if(! $isOut)
                                            <td class="py-3 px-4 text-right font-bold text-gray-900 dark:text-white">
                                                {{ $fmt($item->qty * $item->unit_cost) }}
                                            </td>
                                        @endif
                                        @if($isDraft)
                                            <td class="py-3 px-4 text-right">
                                                <button type="button"
                                                        wire:click="removeItem({{ $item->id }})"
                                                        class="text-xs font-semibold text-rose-600 hover:underline cursor-pointer">
                                                    Hapus
                                                </button>
                                            </td>
                                        @endif
                                    </tr>
                                @endforeach
                            </tbody>
                        </table>
                    </div>
                @endif
            </div>
        </div>
    @endif

    <x-filament-actions::modals />
</x-filament-panels::page>
