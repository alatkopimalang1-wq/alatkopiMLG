<x-filament-panels::page>
    @php
        /** @var \App\Models\ConsignmentSettlement $settlement */
        $settlement = $this->getRecord();
        $consignor = $settlement->consignor;
        $items = $settlement->items;
        $vendorStock = $this->getVendorStockSummary();
    @endphp

    {{-- 1. Status Banner & Quick Stats --}}
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div class="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
            <div class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Mitra Konsinyasi</div>
            <div class="text-lg font-bold text-gray-900 dark:text-gray-100 mt-1">{{ $consignor?->name ?? '—' }}</div>
            <div class="text-xs text-gray-500 mt-0.5">
                @if($consignor?->phone)
                    <a href="https://wa.me/{{ preg_replace('/[^0-9]/', '', $consignor->phone) }}" target="_blank" class="text-emerald-600 hover:underline">
                        📱 {{ $consignor->phone }}
                    </a>
                @endif
            </div>
        </div>

        <div class="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
            <div class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Periode Penjualan</div>
            <div class="text-lg font-bold text-gray-900 dark:text-gray-100 mt-1">
                {{ $settlement->period_start->format('d M Y') }} - {{ $settlement->period_end->format('d M Y') }}
            </div>
            <div class="text-xs text-gray-500 mt-0.5">Total Terjual: <span class="font-bold text-gray-800 dark:text-gray-200">{{ $settlement->total_items_sold }} unit</span></div>
        </div>

        <div class="p-4 bg-white dark:bg-gray-800 rounded-xl border border-rose-200 dark:border-rose-900/40 bg-rose-50/20 shadow-sm">
            <div class="text-xs font-semibold text-rose-600 dark:text-rose-400 uppercase tracking-wider">Hak Bayar Vendor</div>
            <div class="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1">
                Rp {{ number_format($settlement->total_vendor_payout, 0, ',', '.') }}
            </div>
            <div class="text-xs text-gray-500 mt-0.5">Wajib ditransfer ke mitra</div>
        </div>

        <div class="p-4 bg-white dark:bg-gray-800 rounded-xl border border-emerald-200 dark:border-emerald-900/40 bg-emerald-50/20 shadow-sm">
            <div class="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Komisi Toko (Laba Bersih)</div>
            <div class="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                Rp {{ number_format($settlement->total_store_commission, 0, ',', '.') }}
            </div>
            <div class="text-xs text-gray-500 mt-0.5">Dari total omzet Rp {{ number_format($settlement->total_gross_sales, 0, ',', '.') }}</div>
        </div>
    </div>

    {{-- 2. Detail Pembayaran & Status --}}
    <div class="p-5 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 dark:border-gray-700/60 pb-4">
            <div>
                <span class="text-xs font-medium text-gray-500">Status Pembayaran:</span>
                @if($settlement->status === 'paid')
                    <span class="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300">
                        ✓ Lunas / Sudah Ditransfer ({{ $settlement->paid_at?->format('d/m/Y H:i') ?? '—' }})
                    </span>
                @elseif($settlement->status === 'confirmed')
                    <span class="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300">
                        ⏳ Menunggu Pembayaran
                    </span>
                @elseif($settlement->status === 'cancelled')
                    <span class="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800 dark:bg-rose-900/50 dark:text-rose-300">
                        ✕ Dibatalkan
                    </span>
                @else
                    <span class="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                        📝 Draft
                    </span>
                @endif
            </div>

            <div class="text-sm text-gray-600 dark:text-gray-300">
                <span class="font-medium">Rekening Tujuan Transfer:</span>
                <span class="font-bold text-gray-900 dark:text-gray-100 ml-1">{{ $consignor?->bank_formatted ?? 'Belum diisi' }}</span>
            </div>
        </div>

        @if($settlement->payment_reference || $settlement->payment_proof || $settlement->notes)
            <div class="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                @if($settlement->payment_reference)
                    <div>
                        <span class="text-xs text-gray-500">No. Referensi Transfer:</span>
                        <div class="font-mono font-medium text-gray-800 dark:text-gray-200">{{ $settlement->payment_reference }}</div>
                    </div>
                @endif
                @if($settlement->notes)
                    <div class="md:col-span-2">
                        <span class="text-xs text-gray-500">Catatan Settlement:</span>
                        <div class="text-gray-700 dark:text-gray-300">{{ $settlement->notes }}</div>
                    </div>
                @endif
                @if($settlement->payment_proof)
                    <div class="md:col-span-3 mt-2">
                        <span class="text-xs text-gray-500 block mb-1">Bukti Transfer:</span>
                        <a href="{{ Storage::url($settlement->payment_proof) }}" target="_blank" class="inline-block">
                            <img src="{{ Storage::url($settlement->payment_proof) }}" alt="Bukti Transfer" class="h-24 rounded-lg border border-gray-200 shadow-sm hover:opacity-90">
                        </a>
                    </div>
                @endif
            </div>
        @endif
    </div>

    {{-- 3. Rincian Barang Konsinyasi yang Terjual --}}
    <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        <div class="px-5 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
            <h3 class="text-base font-bold text-gray-900 dark:text-gray-100">
                Rincian Barang Terjual ({{ $items->count() }} Transaksi)
            </h3>
            <span class="text-xs text-gray-500">Periode: {{ $settlement->period_start->format('d/m/Y') }} - {{ $settlement->period_end->format('d/m/Y') }}</span>
        </div>

        <div class="overflow-x-auto">
            <table class="w-full text-left text-sm text-gray-700 dark:text-gray-200">
                <thead class="bg-gray-50 dark:bg-gray-900/50 text-xs uppercase font-semibold text-gray-500 border-b border-gray-200 dark:border-gray-700">
                    <tr>
                        <th class="px-5 py-3">Produk & Varian</th>
                        <th class="px-4 py-3 text-center">Qty</th>
                        <th class="px-4 py-3 text-right">Harga Jual</th>
                        <th class="px-4 py-3 text-right">Subtotal Omzet</th>
                        <th class="px-4 py-3 text-right text-rose-600 dark:text-rose-400">Hak Vendor</th>
                        <th class="px-4 py-3 text-right text-emerald-600 dark:text-emerald-400">Komisi Toko</th>
                        <th class="px-4 py-3 text-right">Waktu Transaksi</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-100 dark:divide-gray-700/60">
                    @forelse($items as $item)
                        <tr class="hover:bg-gray-50/50 dark:hover:bg-gray-700/30">
                            <td class="px-5 py-3 font-medium">
                                <div>{{ $item->product_name }}</div>
                                @if($item->variant_label && strcasecmp($item->variant_label, 'Standard') !== 0)
                                    <div class="text-xs text-gray-500">Varian: {{ $item->variant_label }}</div>
                                @endif
                            </td>
                            <td class="px-4 py-3 text-center font-bold">{{ $item->quantity }}</td>
                            <td class="px-4 py-3 text-right">Rp {{ number_format($item->unit_price, 0, ',', '.') }}</td>
                            <td class="px-4 py-3 text-right font-semibold">Rp {{ number_format($item->subtotal, 0, ',', '.') }}</td>
                            <td class="px-4 py-3 text-right font-bold text-rose-600 dark:text-rose-400">
                                Rp {{ number_format($item->vendor_payout, 0, ',', '.') }}
                            </td>
                            <td class="px-4 py-3 text-right font-bold text-emerald-600 dark:text-emerald-400">
                                Rp {{ number_format($item->store_commission, 0, ',', '.') }}
                            </td>
                            <td class="px-4 py-3 text-right text-xs text-gray-500">
                                {{ $item->sold_at?->format('d/m/Y H:i') ?? '—' }}
                            </td>
                        </tr>
                    @empty
                        <tr>
                            <td colspan="7" class="px-5 py-8 text-center text-gray-400">Tidak ada item dalam settlement ini.</td>
                        </tr>
                    @endforelse
                </tbody>
                <tfoot class="bg-gray-50 dark:bg-gray-900/60 font-bold border-t border-gray-200 dark:border-gray-700">
                    <tr>
                        <td class="px-5 py-3 uppercase">Total Keseluruhan</td>
                        <td class="px-4 py-3 text-center">{{ $settlement->total_items_sold }}</td>
                        <td class="px-4 py-3"></td>
                        <td class="px-4 py-3 text-right font-black">Rp {{ number_format($settlement->total_gross_sales, 0, ',', '.') }}</td>
                        <td class="px-4 py-3 text-right font-black text-rose-600 dark:text-rose-400">Rp {{ number_format($settlement->total_vendor_payout, 0, ',', '.') }}</td>
                        <td class="px-4 py-3 text-right font-black text-emerald-600 dark:text-emerald-400">Rp {{ number_format($settlement->total_store_commission, 0, ',', '.') }}</td>
                        <td class="px-4 py-3"></td>
                    </tr>
                </tfoot>
            </table>
        </div>
    </div>

    {{-- 4. Status Sisa Stok Barang Mitra di Toko Saat Ini --}}
    <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-5">
        <h3 class="text-base font-bold text-gray-900 dark:text-gray-100 mb-3">
            Sisa Stok Fisik Produk Mitra di Toko Saat Ini
        </h3>
        <p class="text-xs text-gray-500 mb-4">Informasi stok real-time ini juga disertakan pada nota cetak agar mitra mengetahui sisa barang titipan yang ada di toko.</p>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
            @forelse($vendorStock as $prod)
                <div class="p-3.5 bg-gray-50 dark:bg-gray-900/40 rounded-lg border border-gray-200 dark:border-gray-700/60">
                    <div class="font-semibold text-gray-800 dark:text-gray-200 text-sm">{{ $prod['name'] }}</div>
                    <div class="flex items-center justify-between mt-2 pt-2 border-t border-gray-200/60 dark:border-gray-700/40">
                        <span class="text-xs text-gray-500">Sisa Stok:</span>
                        <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold {{ $prod['total_stock'] > 0 ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300' : 'bg-rose-100 text-rose-800' }}">
                            {{ $prod['total_stock'] }} unit
                        </span>
                    </div>
                </div>
            @empty
                <div class="col-span-3 text-xs text-gray-400 py-3 text-center">Belum ada produk konsinyasi terdaftar untuk mitra ini.</div>
            @endforelse
        </div>
    </div>
</x-filament-panels::page>
