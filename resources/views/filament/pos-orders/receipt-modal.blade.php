@php
    $details = $order->payment_details ?? [];
    $isRefund = $order->payment_status === 'refunded' || $order->status === 'refunded';
    $cashTendered = $details['cash_tendered'] ?? null;
    $cashChange = $details['cash_change'] ?? null;
    $discountAmount = $details['discount_amount'] ?? 0;
    $cashierName = $details['cashier_name'] ?? $order->user?->name ?? 'Kasir Sanubari';
@endphp

<div class="mx-auto max-w-md rounded-2xl border border-stone-200 bg-white p-5 shadow-inner text-stone-900 font-sans text-xs dark:border-stone-800 dark:bg-stone-900 dark:text-stone-100">
    <!-- Header Toko -->
    <div class="text-center space-y-1 pb-3 border-b border-dashed border-stone-300 dark:border-stone-700">
        <div class="flex justify-center pb-1">
            <img src="{{ asset('brand/logo-circle.png') }}" alt="Sanubari" class="h-10 w-10 object-contain" />
        </div>
        <h3 class="font-black text-sm uppercase tracking-wider text-stone-950 dark:text-white">
            ALAT KOPI MALANG
        </h3>
        <p class="text-[11px] text-stone-500 italic dark:text-stone-400">
            Close to Your Every Brew
        </p>
        <p class="text-[10px] text-stone-500 leading-tight dark:text-stone-400">
            Ruko Tlogomas Square Kav 34, Jl. Raya Tlogomas, Lowokwaru, Malang<br>
            WA: 0851-2193-0454
        </p>
    </div>

    <!-- Refund Banner jika di-refund -->
    @if ($isRefund)
        <div class="my-3 rounded-xl border border-dashed border-rose-300 bg-rose-50 p-2.5 text-center text-rose-900 dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-200">
            <div class="text-xs font-black uppercase tracking-wider">
                *** BUKTI REFUND / RETUR POS ***
            </div>
            <div class="mt-1 text-[11px]">
                Alasan: <span class="font-semibold">{{ $details['refund_reason'] ?? 'Pengembalian Dana Kasir' }}</span>
            </div>
            @if (!empty($details['refunded_by_name']))
                <div class="text-[10px] text-rose-700 dark:text-rose-400">
                    Oleh Kasir: {{ $details['refunded_by_name'] }}
                </div>
            @endif
        </div>
    @endif

    <!-- Meta Transaksi -->
    <div class="py-2.5 space-y-1 border-b border-dashed border-stone-300 text-[11px] dark:border-stone-700">
        <div class="flex justify-between">
            <span class="text-stone-500 dark:text-stone-400">No. Transaksi:</span>
            <span class="font-mono font-bold text-stone-900 dark:text-white">#{{ $order->order_number }}</span>
        </div>
        <div class="flex justify-between">
            <span class="text-stone-500 dark:text-stone-400">Waktu:</span>
            <span class="font-medium text-stone-800 dark:text-stone-200">{{ $order->created_at->format('d M Y, H:i:s') }}</span>
        </div>
        <div class="flex justify-between">
            <span class="text-stone-500 dark:text-stone-400">Kasir:</span>
            <span class="font-semibold text-stone-800 dark:text-stone-200">{{ $cashierName }}</span>
        </div>
        <div class="flex justify-between">
            <span class="text-stone-500 dark:text-stone-400">Pelanggan:</span>
            <span class="font-semibold text-stone-800 dark:text-stone-200">{{ $order->customer_name ?: 'Pelanggan Kasir' }}</span>
        </div>
        @if ($order->customer_phone && $order->customer_phone !== '-')
            <div class="flex justify-between">
                <span class="text-stone-500 dark:text-stone-400">No. HP:</span>
                <span class="text-stone-800 dark:text-stone-200">{{ $order->customer_phone }}</span>
            </div>
        @endif
    </div>

    <!-- Daftar Item Produk -->
    <div class="py-3 border-b border-dashed border-stone-300 dark:border-stone-700">
        <div class="mb-2 text-[10px] font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500">
            Daftar Produk yang Dibeli
        </div>
        <div class="space-y-2.5">
            @foreach ($order->items as $item)
                <div>
                    <div class="font-bold text-stone-900 text-xs dark:text-stone-100">
                        {{ $item->product_name }}
                        @if ($item->variant_label)
                            <span class="text-stone-500 font-normal">({{ $item->variant_label }})</span>
                        @endif
                    </div>
                    <div class="flex justify-between text-[11px] text-stone-600 dark:text-stone-400 mt-0.5">
                        <span>{{ $item->quantity }} x Rp {{ number_format((float) $item->price, 0, ',', '.') }}</span>
                        <span class="font-bold text-stone-900 dark:text-white">
                            Rp {{ number_format((float) $item->subtotal, 0, ',', '.') }}
                        </span>
                    </div>
                </div>
            @endforeach
        </div>
    </div>

    <!-- Ringkasan Nominal & Pembayaran -->
    <div class="py-3 space-y-1.5 border-b border-dashed border-stone-300 text-xs dark:border-stone-700">
        <div class="flex justify-between text-stone-600 dark:text-stone-400">
            <span>Subtotal</span>
            <span>Rp {{ number_format((float) $order->subtotal, 0, ',', '.') }}</span>
        </div>

        @if ($discountAmount > 0)
            <div class="flex justify-between font-semibold text-emerald-700 dark:text-emerald-400">
                <span>Diskon Promo</span>
                <span>-Rp {{ number_format((float) $discountAmount, 0, ',', '.') }}</span>
            </div>
        @endif

        @if ((float) $order->shipping_cost > 0)
            <div class="flex justify-between text-sky-700 dark:text-sky-400">
                <span>Ongkos Kirim</span>
                <span>Rp {{ number_format((float) $order->shipping_cost, 0, ',', '.') }}</span>
            </div>
        @endif

        <div class="flex justify-between pt-1 border-t border-stone-200 text-sm font-black text-stone-950 dark:border-stone-700 dark:text-white">
            <span>TOTAL TRANSAKSI</span>
            <span>Rp {{ number_format((float) $order->total_amount, 0, ',', '.') }}</span>
        </div>

        <div class="flex justify-between pt-1 text-[11px] text-stone-600 dark:text-stone-400">
            <span>Metode Bayar</span>
            <span class="font-bold uppercase text-stone-800 dark:text-stone-200">{{ $order->payment_method_label }}</span>
        </div>

        @if ($cashTendered && $cashTendered > 0)
            <div class="flex justify-between text-[11px] text-stone-600 dark:text-stone-400">
                <span>Tunai Diterima</span>
                <span>Rp {{ number_format((float) $cashTendered, 0, ',', '.') }}</span>
            </div>
            <div class="flex justify-between text-[11px] font-bold text-stone-800 dark:text-stone-200">
                <span>Kembalian</span>
                <span>Rp {{ number_format((float) ($cashChange ?? 0), 0, ',', '.') }}</span>
            </div>
        @endif
    </div>

    <!-- Footer Struk -->
    <div class="pt-4 text-center text-[10.5px] text-stone-500 space-y-1 dark:text-stone-400">
        <div>Terima kasih atas kunjungannya!</div>
        <div class="font-bold text-stone-700 dark:text-stone-300">IG: @sanubariroastery</div>
    </div>
</div>
