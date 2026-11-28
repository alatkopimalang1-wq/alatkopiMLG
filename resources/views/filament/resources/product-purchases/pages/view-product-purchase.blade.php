<x-filament-panels::page>
    @php
        /** @var \App\Models\ProductPurchase $po */
        $po = $this->getRecord();
        $listUrl = \App\Filament\Resources\ProductPurchases\ProductPurchaseResource::getUrl('index');
        $printUrl = route('admin.product-purchases.print', $po);
        $fmt = fn ($val) => 'IDR ' . number_format((float) $val, 0, ',', '.');
        $isCompleted = $po->status === \App\Models\ProductPurchase::STATUS_SELESAI;
    @endphp

    <div class="space-y-4">
        {{-- Top Status Tabs (Olsera style) --}}
        <div class="flex flex-wrap items-center justify-between gap-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-2.5 shadow-xs">
            <div class="flex flex-wrap items-center gap-4 text-xs sm:text-sm font-medium">
                <a href="{{ $listUrl }}?activeTab=butuh_diproses"
                   class="px-2 py-1 rounded-md transition {{ in_array($po->status, ['dipesan', 'dikirim']) ? 'text-primary-600 dark:text-primary-400 font-bold bg-primary-50 dark:bg-primary-950/50' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white' }}">
                    Butuh Diproses
                </a>
                <a href="{{ $listUrl }}?activeTab=telah_diproses"
                   class="px-2 py-1 rounded-md transition {{ $po->status === 'diterima' ? 'text-primary-600 dark:text-primary-400 font-bold bg-primary-50 dark:bg-primary-950/50' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white' }}">
                    Telah Diproses
                </a>
                <a href="{{ $listUrl }}?activeTab=selesai"
                   class="px-2 py-1 rounded-md transition {{ $po->status === 'selesai' ? 'text-primary-600 dark:text-primary-400 font-bold bg-primary-50 dark:bg-primary-950/50' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white' }}">
                    Selesai
                </a>
                <a href="{{ $listUrl }}?activeTab=retur"
                   class="px-2 py-1 rounded-md transition {{ $po->status === 'retur' ? 'text-primary-600 dark:text-primary-400 font-bold bg-primary-50 dark:bg-primary-950/50' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white' }}">
                    Retur
                </a>
                <a href="{{ $listUrl }}?activeTab=dibatalkan"
                   class="px-2 py-1 rounded-md transition {{ $po->status === 'dibatalkan' ? 'text-primary-600 dark:text-primary-400 font-bold bg-primary-50 dark:bg-primary-950/50' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white' }}">
                    Dibatalkan
                </a>
            </div>

            <div class="text-xs text-gray-500 dark:text-gray-400">
                @if($po->hasStockApplied())
                    <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-medium">
                        <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
                        Stok Masuk Tercatat ({{ $po->stock_applied_at?->format('d M Y H:i') }})
                    </span>
                @else
                    <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 font-medium">
                        <span class="w-2 h-2 rounded-full bg-amber-500"></span>
                        Stok Belum Masuk (Ubah status ke Diterima / Selesai untuk menambah stok)
                    </span>
                @endif
            </div>
        </div>

        {{-- Payment Banner + PO Header Card --}}
        <div class="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-xs">
            {{-- Green / Amber Payment Status Bar --}}
            <div class="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 text-white {{ $po->is_paid ? 'bg-emerald-600' : 'bg-amber-500' }}">
                <div class="flex items-center gap-2 text-sm font-semibold">
                    @if($po->is_paid)
                        <x-heroicon-o-check-circle class="w-5 h-5" />
                        <span>Sudah bayar</span>
                    @else
                        <x-heroicon-o-clock class="w-5 h-5" />
                        <span>Belum bayar</span>
                    @endif
                </div>

                <div class="flex items-center gap-3 text-xs sm:text-sm">
                    @if($po->is_paid && $po->paid_at)
                        <span class="font-medium">{{ $po->paid_at->format('d-M-Y') }}</span>
                    @endif
                    <button
                        type="button"
                        wire:click="togglePaid"
                        wire:loading.attr="disabled"
                        @disabled($isCompleted)
                        title="{{ $isCompleted ? 'Terkunci (PO Selesai)' : 'Klik untuk ubah status pembayaran' }}"
                        class="relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out {{ $isCompleted ? 'cursor-not-allowed opacity-60' : 'cursor-pointer' }} {{ $po->is_paid ? 'bg-sky-500' : 'bg-gray-700/50' }}"
                    >
                        <span class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition duration-200 ease-in-out {{ $po->is_paid ? 'translate-x-5' : 'translate-x-0' }}"></span>
                    </button>
                </div>
            </div>

            {{-- PO Number, Owner, Status Dropdown, Print, Date --}}
            <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 px-4 py-3.5">
                <div class="flex items-center gap-3">
                    <a href="{{ $listUrl }}"
                       class="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                       title="Kembali ke daftar pembelian">
                        <x-heroicon-m-chevron-left class="w-5 h-5" />
                    </a>
                    <div class="flex items-center justify-center w-10 h-10 rounded-lg bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 shrink-0">
                        <x-heroicon-o-shopping-bag class="w-5 h-5" />
                    </div>
                    <div>
                        <div class="text-base sm:text-lg font-bold text-gray-900 dark:text-white tracking-tight">
                            {{ $po->purchase_number }}
                        </div>
                        <div class="text-xs text-gray-500 dark:text-gray-400">
                            Pembelian Oleh {{ $po->user?->name ?? 'Admin' }}
                        </div>
                    </div>
                </div>

                <div class="flex flex-wrap items-center gap-2.5">
                    {{-- Status Select --}}
                    <div class="flex items-center gap-1.5">
                        <label for="po-status-select" class="text-xs text-gray-500 dark:text-gray-400 sr-only">Status</label>
                        <select
                            id="po-status-select"
                            wire:model.live="selectedStatus"
                            @disabled($isCompleted)
                            class="rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm font-medium text-gray-800 dark:text-gray-200 px-3 py-1.5 focus:ring-2 focus:ring-primary-500 disabled:cursor-not-allowed disabled:opacity-70"
                        >
                            @foreach(\App\Models\ProductPurchase::STATUS_LABELS as $statusKey => $statusLabel)
                                @php
                                    $isDiterimaLocked = $statusKey === \App\Models\ProductPurchase::STATUS_DITERIMA
                                        && $po->status !== \App\Models\ProductPurchase::STATUS_DITERIMA;
                                    $isAlreadyReceived = $po->hasStockApplied() || in_array($po->status, [
                                        \App\Models\ProductPurchase::STATUS_DITERIMA,
                                        \App\Models\ProductPurchase::STATUS_SELESAI,
                                        \App\Models\ProductPurchase::STATUS_RETUR,
                                    ], true);
                                    $isRevertingAfterReceive = $isAlreadyReceived && in_array($statusKey, [
                                        \App\Models\ProductPurchase::STATUS_DIPESAN,
                                        \App\Models\ProductPurchase::STATUS_DIKIRIM,
                                    ], true);
                                    $isUnpaidBlocked = ! $po->is_paid && in_array($statusKey, [
                                        \App\Models\ProductPurchase::STATUS_DIKIRIM,
                                        \App\Models\ProductPurchase::STATUS_DITERIMA,
                                        \App\Models\ProductPurchase::STATUS_SELESAI,
                                        \App\Models\ProductPurchase::STATUS_RETUR,
                                    ], true);
                                    $isDisabledOption = $isDiterimaLocked || $isRevertingAfterReceive || $isUnpaidBlocked;
                                @endphp
                                <option value="{{ $statusKey }}" @disabled($isDisabledOption)>
                                    {{ $statusLabel }}{{ $isDiterimaLocked ? ' (Via Terima Barang)' : ($isRevertingAfterReceive ? ' (Sudah Diterima)' : ($isUnpaidBlocked ? ' (Perlu Bayar)' : '')) }}
                                </option>
                            @endforeach
                        </select>
                    </div>

                    {{-- Cetak Button --}}
                    <a href="{{ $printUrl }}"
                       target="_blank"
                       class="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                        <x-heroicon-o-printer class="w-4 h-4" />
                        <span>Cetak</span>
                    </a>

                    {{-- Date Input --}}
                    <input
                        type="date"
                        wire:model.live="purchaseDateInput"
                        @disabled($isCompleted)
                        class="rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-800 dark:text-gray-200 px-3 py-1.5 focus:ring-2 focus:ring-primary-500 disabled:cursor-not-allowed disabled:opacity-70"
                    />
                </div>
            </div>
        </div>

        {{-- 2-Column Info Cards (Supplier & Info Penerimaan) --}}
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {{-- Card 1: Supplier --}}
            <div class="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 shadow-xs flex flex-col justify-between">
                <div>
                    <div class="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3 mb-3">
                        <h3 class="text-sm font-bold text-gray-900 dark:text-white">Supplier</h3>
                        @if(! $isCompleted)
                            <button type="button"
                                    wire:click="mountAction('editSupplier')"
                                    class="inline-flex items-center gap-1 rounded-md bg-sky-600 hover:bg-sky-700 px-2.5 py-1 text-xs font-semibold text-white transition">
                                <x-heroicon-m-pencil-square class="w-3.5 h-3.5" />
                                Ubah
                            </button>
                        @else
                            <span class="inline-flex items-center gap-1 rounded-md bg-gray-100 dark:bg-gray-800 px-2.5 py-1 text-xs font-medium text-gray-500 dark:text-gray-400">
                                <x-heroicon-m-lock-closed class="w-3.5 h-3.5" />
                                Terkunci
                            </span>
                        @endif
                    </div>
                    <dl class="space-y-2.5 text-xs">
                        <div>
                            <dt class="text-gray-400 dark:text-gray-500">Nama Supplier</dt>
                            <dd class="font-semibold text-gray-800 dark:text-gray-200 mt-0.5">{{ $po->supplier_name ?: '—' }}</dd>
                        </div>
                        <div>
                            <dt class="text-gray-400 dark:text-gray-500">Kontak</dt>
                            <dd class="text-gray-700 dark:text-gray-300 mt-0.5">{{ $po->supplier_phone ?: '—' }}</dd>
                        </div>
                        <div>
                            <dt class="text-gray-400 dark:text-gray-500">Alamat</dt>
                            <dd class="text-gray-700 dark:text-gray-300 mt-0.5">{{ $po->supplier_address ?: '—' }}</dd>
                        </div>
                    </dl>
                </div>
            </div>

            {{-- Card 2: Info Penerimaan --}}
            <div class="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 shadow-xs">
                <div class="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3 mb-3">
                    <h3 class="text-sm font-bold text-gray-900 dark:text-white">Info Penerimaan</h3>
                    @if(! $isCompleted)
                        <button type="button"
                                wire:click="mountAction('editReceiving')"
                                @disabled(! $po->is_paid && ! $po->hasStockApplied())
                                title="{{ ! $po->is_paid && ! $po->hasStockApplied() ? 'Lunasi pembayaran terlebih dahulu sebelum menerima barang' : '' }}"
                                class="inline-flex items-center gap-1 rounded-md {{ $po->hasStockApplied() ? 'bg-sky-600 hover:bg-sky-700' : 'bg-emerald-600 hover:bg-emerald-700' }} px-2.5 py-1 text-xs font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-50">
                            <x-heroicon-m-pencil-square class="w-3.5 h-3.5" />
                            {{ $po->hasStockApplied() ? 'Ubah' : 'Terima Barang' }}
                        </button>
                    @else
                        <span class="inline-flex items-center gap-1 rounded-md bg-gray-100 dark:bg-gray-800 px-2.5 py-1 text-xs font-medium text-gray-500 dark:text-gray-400">
                            <x-heroicon-m-lock-closed class="w-3.5 h-3.5" />
                            Terkunci
                        </span>
                    @endif
                </div>
                <dl class="space-y-3 text-xs">
                    <div>
                        <dt class="text-gray-400 dark:text-gray-500">Tanggal Diterima</dt>
                        <dd class="font-medium text-gray-800 dark:text-gray-200 mt-0.5">
                            {{ $po->received_date ? $po->received_date->format('d M Y') : '—' }}
                        </dd>
                    </div>
                    <div>
                        <dt class="text-gray-400 dark:text-gray-500">No. Terima</dt>
                        <dd class="font-medium text-gray-800 dark:text-gray-200 mt-0.5">{{ $po->receipt_number ?: '—' }}</dd>
                    </div>
                    <div>
                        <dt class="text-gray-400 dark:text-gray-500">Penerima</dt>
                        <dd class="font-medium text-gray-800 dark:text-gray-200 mt-0.5">{{ $po->receiver_name ?: '—' }}</dd>
                    </div>
                </dl>
            </div>
        </div>

        {{-- Produk Pesanan Table --}}
        <div class="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-xs overflow-hidden">
            <div class="flex items-center justify-between px-4 py-3.5 border-b border-gray-100 dark:border-gray-800">
                <h3 class="text-sm sm:text-base font-bold text-gray-900 dark:text-white">Produk Pesanan</h3>
                @if(! $po->is_paid && ! $isCompleted)
                    <button type="button"
                            wire:click="mountAction('addItem')"
                            class="inline-flex items-center gap-1.5 rounded-lg bg-primary-600 hover:bg-primary-700 px-3 py-1.5 text-xs font-semibold text-white transition">
                        <x-heroicon-m-plus class="w-4 h-4" />
                        Tambah Produk
                    </button>
                @else
                    <span class="inline-flex items-center gap-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 px-3 py-1.5 text-xs font-medium text-gray-500 dark:text-gray-400">
                        <x-heroicon-m-lock-closed class="w-3.5 h-3.5" />
                        {{ $isCompleted ? 'Terkunci (PO Selesai)' : 'Terkunci (Sudah Bayar)' }}
                    </span>
                @endif
            </div>

            <div class="overflow-x-auto">
                <table class="w-full text-left border-collapse text-xs sm:text-sm">
                    <thead>
                        <tr class="border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 text-gray-600 dark:text-gray-300 font-semibold">
                            <th class="py-3 px-4 w-12">No</th>
                            <th class="py-3 px-4">Deskripsi</th>
                            <th class="py-3 px-4 text-center w-20">Qty</th>
                            <th class="py-3 px-4 text-right w-36">Harga (IDR)</th>
                            <th class="py-3 px-4 text-right w-32">Diskon</th>
                            <th class="py-3 px-4 text-right w-40">Total Harga (IDR)</th>
                            <th class="py-3 px-4 text-center w-32">Aksi</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-100 dark:divide-gray-800">
                        @foreach($po->items as $idx => $item)
                            <tr class="hover:bg-gray-50/70 dark:hover:bg-gray-800/30">
                                <td class="py-3 px-4 text-gray-500">{{ $idx + 1 }}</td>
                                <td class="py-3 px-4">
                                    <div class="flex items-center gap-3">
                                        @php
                                            $imgUrl = $item->image_url;
                                        @endphp
                                        @if($imgUrl)
                                            <img src="{{ $imgUrl }}" alt="{{ $item->product?->name }}" class="w-10 h-10 rounded-lg object-cover border border-gray-200 dark:border-gray-700 shrink-0">
                                        @else
                                            <div class="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-400 shrink-0">
                                                <x-heroicon-o-cube class="w-5 h-5" />
                                            </div>
                                        @endif
                                        <div>
                                            <div class="font-semibold text-gray-900 dark:text-white">
                                                {{ $item->product?->name ?? 'Produk #' . $item->product_id }}
                                            </div>
                                            <div class="text-xs text-gray-500 dark:text-gray-400">
                                                @php
                                                    $vLabel = \App\Support\VariantHelper::formatLabel($item->variant?->label);
                                                @endphp
                                                @if($vLabel !== '')
                                                    Varian: {{ $vLabel }}
                                                @endif
                                                @if($item->variant?->sku)
                                                    ({{ $item->variant->sku }})
                                                @endif
                                                @if($item->variant)
                                                    • Stok saat ini: <strong>{{ (int) $item->variant->stock }} pcs</strong>
                                                @endif
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td class="py-3 px-4 text-center font-semibold text-gray-900 dark:text-white">
                                    {{ (int) $item->quantity }}
                                </td>
                                <td class="py-3 px-4 text-right text-gray-800 dark:text-gray-200">
                                    {{ $fmt($item->unit_cost) }}
                                </td>
                                <td class="py-3 px-4 text-right text-gray-600 dark:text-gray-400">
                                    {{ (float) $item->discount_amount > 0 ? $fmt($item->discount_amount) : '0' }}
                                </td>
                                <td class="py-3 px-4 text-right font-semibold text-gray-900 dark:text-white">
                                    {{ $fmt($item->subtotal) }}
                                </td>
                                <td class="py-3 px-4 text-center">
                                    @if(! $po->is_paid && ! $isCompleted)
                                        <div class="inline-flex items-center gap-2">
                                            <button type="button"
                                                    wire:click="mountAction('editItem', { itemId: {{ $item->id }} })"
                                                    class="inline-flex items-center gap-1 text-xs font-semibold text-sky-600 hover:text-sky-700 dark:text-sky-400">
                                                <x-heroicon-m-pencil class="w-3.5 h-3.5" />
                                                Ubah
                                            </button>
                                            @if($po->items->count() > 1)
                                                <button type="button"
                                                        wire:click="mountAction('deleteItem', { itemId: {{ $item->id }} })"
                                                        class="inline-flex items-center gap-1 text-xs font-semibold text-rose-600 hover:text-rose-700 dark:text-rose-400">
                                                    <x-heroicon-m-trash class="w-3.5 h-3.5" />
                                                </button>
                                            @endif
                                        </div>
                                    @else
                                        <span class="inline-flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500" title="Tidak dapat diubah karena PO sudah dibayar">
                                            <x-heroicon-m-lock-closed class="w-3.5 h-3.5" />
                                        </span>
                                    @endif
                                </td>
                            </tr>
                        @endforeach
                    </tbody>
                    <tfoot class="border-t border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30 text-xs sm:text-sm">
                        <tr>
                            <td colspan="2" class="py-2.5 px-4 text-right font-medium text-gray-600 dark:text-gray-400">Total Pesanan</td>
                            <td class="py-2.5 px-4 text-center font-bold text-gray-900 dark:text-white">{{ (int) $po->total_qty }}</td>
                            <td colspan="4"></td>
                        </tr>
                        <tr>
                            <td colspan="5" class="py-2 px-4 text-right font-medium text-gray-600 dark:text-gray-400">Subtotal</td>
                            <td class="py-2 px-4 text-right font-bold text-gray-900 dark:text-white">{{ $fmt($po->subtotal) }}</td>
                            <td></td>
                        </tr>
                        <tr>
                            <td colspan="5" class="py-2 px-4 text-right font-medium text-gray-600 dark:text-gray-400">Diskon</td>
                            <td class="py-2 px-4 text-right font-semibold text-gray-900 dark:text-white">{{ $fmt($po->discount_amount) }}</td>
                            <td class="py-2 px-4 text-center">
                                @if(! $po->is_paid && ! $isCompleted)
                                    <button type="button"
                                            wire:click="mountAction('editDiscount')"
                                            class="inline-flex items-center gap-1 text-xs font-semibold text-sky-600 hover:text-sky-700 dark:text-sky-400">
                                        <x-heroicon-m-cog-6-tooth class="w-3.5 h-3.5" />
                                        Diskon
                                    </button>
                                @endif
                            </td>
                        </tr>
                        <tr>
                            <td colspan="5" class="py-2 px-4 text-right font-medium text-gray-600 dark:text-gray-400">Metode Pembayaran</td>
                            <td class="py-2 px-4 text-right">
                                <select
                                    wire:model.live="selectedPaymentMethod"
                                    @disabled($isCompleted)
                                    class="rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-2.5 py-1 text-xs font-semibold text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-primary-500 disabled:cursor-not-allowed disabled:opacity-70"
                                >
                                    @foreach(\App\Models\ProductPurchase::PAYMENT_LABELS as $pmKey => $pmLabel)
                                        <option value="{{ $pmKey }}">{{ $pmLabel }}</option>
                                    @endforeach
                                </select>
                            </td>
                            <td></td>
                        </tr>
                        <tr class="border-t border-gray-200 dark:border-gray-700 bg-gray-100/70 dark:bg-gray-800/60">
                            <td colspan="5" class="py-3 px-4 text-right font-bold text-gray-900 dark:text-white">Total Tagihan</td>
                            <td class="py-3 px-4 text-right font-extrabold text-base text-primary-600 dark:text-primary-400">{{ $fmt($po->total_amount) }}</td>
                            <td></td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        </div>
    </div>
</x-filament-panels::page>
