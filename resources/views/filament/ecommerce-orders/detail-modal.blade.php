@php
    $details = $order->payment_details ?? [];
    $ttsOrderId = $details['tts_order_id'] ?? null;
    $platform = $details['platform'] ?? 'TikTok Shop / Tokopedia';
    $courier = $order->shipping_courier ?: ($details['shipping_provider'] ?? 'TikTok Shipping');
    $awb = $order->tracking_number ?: ($details['tracking_number'] ?? '-');
@endphp

<div class="mx-auto max-w-xl rounded-2xl border border-stone-200 bg-white p-6 shadow-sm text-stone-900 font-sans text-xs dark:border-stone-800 dark:bg-stone-900 dark:text-stone-100">
    <!-- Header Platform -->
    <div class="flex items-center justify-between pb-4 border-b border-stone-200 dark:border-stone-800">
        <div class="flex items-center space-x-3">
            <div class="h-10 w-10 rounded-xl bg-black text-white flex items-center justify-center font-black text-base shadow-sm">
                TT
            </div>
            <div>
                <h3 class="font-bold text-sm text-stone-900 dark:text-white">
                    {{ $platform }}
                </h3>
                <p class="text-[11px] text-stone-500 dark:text-stone-400">
                    ID Transaksi Marketplace: <span class="font-mono font-medium">{{ $ttsOrderId ?: $order->order_number }}</span>
                </p>
            </div>
        </div>
        <div class="text-right">
            <span class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold
                @if ($order->status === 'completed') bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300
                @elseif ($order->status === 'shipped') bg-sky-50 text-sky-700 dark:bg-sky-950 dark:text-sky-300
                @elseif ($order->status === 'processing') bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300
                @elseif ($order->status === 'cancelled') bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300
                @else bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-300
                @endif">
                {{ $order->status_label }}
            </span>
            <div class="mt-1 text-[10px] text-stone-400">
                {{ $order->created_at?->format('d M Y, H:i') }} WIB
            </div>
        </div>
    </div>

    <!-- Informasi Penerima & Pengiriman -->
    <div class="py-4 border-b border-stone-200 dark:border-stone-800 grid grid-cols-2 gap-4">
        <div>
            <h4 class="font-semibold text-stone-500 uppercase tracking-wider text-[10px] mb-1">
                Penerima Paket
            </h4>
            <p class="font-bold text-stone-900 dark:text-white text-sm">
                {{ $order->customer_name }}
            </p>
            <p class="text-stone-600 dark:text-stone-400 mt-0.5">
                📞 {{ $order->customer_phone ?: '-' }}
            </p>
            <p class="text-stone-500 dark:text-stone-400 mt-1 leading-relaxed">
                📍 {{ $order->customer_address ?: 'Alamat tidak tersedia' }}
            </p>
        </div>
        <div>
            <h4 class="font-semibold text-stone-500 uppercase tracking-wider text-[10px] mb-1">
                Logistik & Ekspedisi
            </h4>
            <div class="rounded-xl border border-stone-200 bg-stone-50 p-2.5 dark:border-stone-800 dark:bg-stone-950">
                <div class="text-[11px] font-semibold text-stone-800 dark:text-stone-200">
                    Kurir: <span class="font-bold text-stone-950 dark:text-white">{{ $courier }}</span>
                </div>
                <div class="mt-1 text-[11px] text-stone-600 dark:text-stone-400">
                    No. Resi (AWB):
                    <span class="font-mono font-bold text-primary-600 select-all">{{ $awb }}</span>
                </div>
            </div>
            @if ($order->customer_notes)
                <div class="mt-2 text-[11px] text-amber-700 bg-amber-50 rounded-lg p-2 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800">
                    Catatan Pembeli: "{{ $order->customer_notes }}"
                </div>
            @endif
        </div>
    </div>

    <!-- Rincian Produk -->
    <div class="py-4 border-b border-stone-200 dark:border-stone-800">
        <h4 class="font-semibold text-stone-500 uppercase tracking-wider text-[10px] mb-2">
            Produk Dipesan
        </h4>
        <div class="space-y-2">
            @forelse ($order->items as $item)
                <div class="flex items-center justify-between py-1.5 border-b border-stone-100 last:border-none dark:border-stone-800/60">
                    <div class="flex-1 pr-3">
                        <div class="font-medium text-stone-900 dark:text-stone-100">
                            {{ $item->product_name }}
                        </div>
                        @if ($item->variant_label)
                            <div class="text-[10px] text-stone-500 dark:text-stone-400">
                                Varian: {{ $item->variant_label }}
                            </div>
                        @endif
                        <div class="text-[10px] text-stone-400">
                            {{ $item->quantity }} x Rp {{ number_format($item->price, 0, ',', '.') }}
                        </div>
                    </div>
                    <div class="font-semibold font-mono text-stone-900 dark:text-white">
                        Rp {{ number_format($item->subtotal, 0, ',', '.') }}
                    </div>
                </div>
            @empty
                <div class="text-stone-400 italic py-2">
                    Tidak ada rincian produk tersimpan.
                </div>
            @endforelse
        </div>
    </div>

    <!-- Ringkasan Finansial -->
    <div class="pt-4 space-y-1.5 text-stone-600 dark:text-stone-400">
        <div class="flex justify-between">
            <span>Subtotal Produk</span>
            <span class="font-mono text-stone-900 dark:text-white">Rp {{ number_format($order->subtotal, 0, ',', '.') }}</span>
        </div>
        <div class="flex justify-between">
            <span>Ongkos Kirim</span>
            <span class="font-mono text-stone-900 dark:text-white">Rp {{ number_format($order->shipping_cost, 0, ',', '.') }}</span>
        </div>
        <div class="flex justify-between pt-2 border-t border-stone-200 font-bold text-sm text-stone-950 dark:border-stone-800 dark:text-white">
            <span>Total Tagihan</span>
            <span class="font-mono text-primary-600 dark:text-primary-400">Rp {{ number_format($order->total_amount, 0, ',', '.') }}</span>
        </div>
        <div class="flex justify-between pt-1 text-[11px]">
            <span>Status Pembayaran</span>
            <span class="font-semibold {{ $order->payment_status === 'paid' ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400' }}">
                {{ $order->payment_status === 'paid' ? 'LUNAS (TikTok Escrow)' : ucfirst($order->payment_status) }}
            </span>
        </div>
    </div>
</div>
