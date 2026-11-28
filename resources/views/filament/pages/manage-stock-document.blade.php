<x-filament-panels::page>
    @php
        $doc = $this->getFreshDocument();
        $isOut = $doc?->type === 'out';
        $isDraft = $doc?->isDraft() ?? false;
        $isPosted = $doc?->isPosted() ?? false;
        $isCancelled = $doc?->isCancelled() ?? false;
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

            {{-- Add Product Card (Normal Filament Searchable Select) --}}
            @if($isDraft)
                <form wire:submit="addItemToDocument"
                      class="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 shadow-xs space-y-3">
                    <div class="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-2">
                        <span class="text-sm font-bold text-gray-800 dark:text-gray-100">
                            Tambah Produk {{ $isOut ? 'Stok Keluar' : 'Stok Masuk' }}
                        </span>
                    </div>

                    <div class="flex flex-col md:flex-row md:items-end gap-3">
                        <div class="flex-1 min-w-0">
                            {{ $this->addForm }}
                        </div>
                        <button type="submit"
                                class="inline-flex items-center justify-center gap-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 px-5 py-2.5 text-sm font-semibold text-white shadow-xs transition cursor-pointer shrink-0">
                            + Tambah Produk
                        </button>
                    </div>
                </form>
            @endif

            {{-- Items Table Card --}}
            <div class="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-xs overflow-hidden">
                <div class="px-5 py-3 border-b border-gray-200 dark:border-gray-800 text-sm font-bold {{ $isOut ? 'bg-sky-600 text-white' : 'text-gray-800 dark:text-gray-100' }}">
                    Produk {{ $isOut ? 'Stok Keluar' : 'Stok Masuk' }} ({{ $doc->items->count() }})
                </div>

                @if($doc->items->isEmpty())
                    <div class="py-16 text-center text-sm text-gray-500 dark:text-gray-400">
                        <div class="text-base font-semibold text-gray-700 dark:text-gray-300">Belum ada produk</div>
                        <div class="mt-1 text-xs text-gray-400">Pilih produk pada form di atas lalu klik "+ Tambah Produk".</div>
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
                                        <td class="py-3 px-4 text-center"
                                            x-data="{
                                                qty: {{ (int) $item->qty }},
                                                cost: {{ (float) $item->unit_cost }},
                                                timer: null,
                                                syncQty(val) {
                                                    const parsed = Math.max(0, parseInt(val || 0, 10));
                                                    this.qty = parsed;
                                                    clearTimeout(this.timer);
                                                    this.timer = setTimeout(() => {
                                                        $wire.updateItemQty({{ $item->id }}, parsed);
                                                    }, 350);
                                                }
                                            }">
                                            @if($isDraft)
                                                <div class="inline-flex items-center rounded-lg border border-gray-300 dark:border-gray-700 overflow-hidden">
                                                    <button type="button"
                                                            @click="syncQty(Math.max(0, qty - 1))"
                                                            class="px-2.5 py-1 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 text-xs font-bold cursor-pointer">-</button>
                                                    <input type="number"
                                                           min="1"
                                                           x-model.number="qty"
                                                           @change="syncQty(qty)"
                                                           class="w-14 border-0 text-center text-xs font-bold text-gray-900 dark:text-white bg-white dark:bg-gray-950 focus:ring-0 py-1" />
                                                    <button type="button"
                                                            @click="syncQty(qty + 1)"
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
