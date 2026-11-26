import React, { useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';
import {
    ArrowLeft,
    CheckCircle2,
    Clock,
    Download,
    Printer,
    SlidersHorizontal,
    Store,
    Truck,
} from 'lucide-react';
import { formatRupiah } from '@/lib/trans';
import { BundleCartItemDetails } from '@/components/bundle-cart-item-details';
import { groupOrderItems } from '@/lib/order-bundle-groups';

interface InvoiceItem {
    id: number;
    product_name: string;
    variant_label: string;
    grind_option?: string | null;
    custom_notes?: string | null;
    price: number;
    normal_price?: number;
    quantity: number;
    subtotal: number;
    is_preorder?: boolean;
}

interface InvoiceOrder {
    id: number;
    order_number: string;
    customer_name: string;
    customer_phone: string;
    customer_email?: string | null;
    customer_address: string;
    customer_notes?: string | null;
    payment_method: string;
    payment_method_label: string;
    payment_channel?: string | null;
    payment_status: 'pending' | 'verifying' | 'paid' | 'cancelled';
    payment_status_label: string;
    status: string;
    status_label: string;
    subtotal: number;
    shipping_cost: number;
    unique_code: number;
    total_amount: number;
    shipping_courier?: string | null;
    shipping_service?: string | null;
    shipping_etd?: string | null;
    tracking_number?: string | null;
    total_weight_grams?: number;
    created_at: string;
    paid_at?: string | null;
    items: InvoiceItem[];
}

interface InvoiceProps {
    order: InvoiceOrder;
    settings: {
        site_name: string;
        address: string;
        phone: string;
        email: string;
        pickup_store_name?: string;
        pickup_store_address?: string;
        pickup_store_hours?: string;
    };
}

export default function OrderInvoicePage({ order, settings }: InvoiceProps) {
    const isPaid = order.payment_status === 'paid';

    const handlePrint = () => {
        if (typeof window !== 'undefined') {
            window.print();
        }
    };

    // Auto-trigger print to save as PDF if ?download=1 is in URL
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const params = new URLSearchParams(window.location.search);
            if (params.get('download') === '1') {
                const timer = setTimeout(() => {
                    window.print();
                }, 400);
                return () => clearTimeout(timer);
            }
        }
    }, []);

    const isPickup =
        order.shipping_courier === 'Ambil di Toko' ||
        order.shipping_service === 'Self Pick Up' ||
        order.customer_address.toLowerCase().includes('ambil di toko');

    const pageTitle = isPaid
        ? `Invoice-LUNAS-${order.order_number}-Sanubari-Roastery`
        : `Invoice-${order.order_number}-Sanubari-Roastery`;

    return (
        <div className="bg-sand-100/60 min-h-screen px-4 py-6 font-sans text-brand-950 selection:bg-brand-700 selection:text-white sm:px-6 sm:py-10 print:m-0 print:bg-white print:p-0">
            <Head title={pageTitle}>
                <style>{`
                    @media print {
                        @page {
                            size: A4 portrait;
                            margin: 10mm;
                        }
                        body {
                            background-color: #ffffff !important;
                            -webkit-print-color-adjust: exact !important;
                            print-color-adjust: exact !important;
                        }
                    }
                `}</style>
            </Head>

            {/* Action Bar (Screen Only, Hidden in Print) */}
            <div className="mx-auto mb-6 flex max-w-4xl flex-wrap items-center justify-between gap-3 print:hidden">
                <Link
                    href={`/pesanan/${order.order_number}`}
                    className="inline-flex items-center gap-2 text-xs font-bold text-brand-700 transition-colors hover:text-brand-950"
                >
                    <ArrowLeft className="h-4 w-4" />
                    <span>Kembali ke Halaman Pesanan</span>
                </Link>

                <div className="flex items-center gap-2.5">
                    <button
                        type="button"
                        onClick={handlePrint}
                        className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-emerald-700 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition-all hover:bg-emerald-800"
                    >
                        <Download className="h-4 w-4" />
                        <span>
                            Download Invoice PDF {isPaid ? '(Lunas)' : ''}
                        </span>
                    </button>

                    <button
                        type="button"
                        onClick={handlePrint}
                        className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-brand-900 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition-all hover:bg-brand-950"
                    >
                        <Printer className="h-4 w-4" />
                        <span>Cetak Faktur</span>
                    </button>
                </div>
            </div>

            {/* Invoice Sheet Container */}
            <div className="mx-auto max-w-4xl rounded-2xl border border-sand-200/90 bg-white p-6 shadow-sm sm:rounded-3xl sm:p-10 print:border-none print:p-0 print:shadow-none">
                {/* Header: Brand & Invoice Meta */}
                <div className="flex flex-col justify-between gap-6 border-b border-sand-200 pb-6 sm:flex-row sm:items-start">
                    <div className="flex items-start gap-3.5">
                        <img
                            src="/brand/logo-circle.png?v=20261126"
                            alt="Alat Kopi Malang Logo"
                            className="mt-0.5 h-12 w-12 shrink-0 rounded-full border border-sand-200 object-cover"
                        />
                        <div className="space-y-0.5">
                            <h1 className="text-xl font-extrabold tracking-tight text-brand-950">
                                {settings.site_name ||
                                    'Alat Kopi Malang'}
                            </h1>
                            <p className="text-xs font-medium text-brand-600">
                                All Your Brewing Essentials in One Place
                            </p>
                            <p className="max-w-sm pt-1 text-[11px] leading-relaxed text-brand-500">
                                {settings.address}
                                <br />
                                WhatsApp: {settings.phone}
                            </p>
                        </div>
                    </div>

                    <div className="space-y-1 sm:text-right">
                        <span className="block text-[10px] font-black tracking-widest text-accent-copper uppercase">
                            FAKTUR PEMBELIAN / INVOICE
                        </span>
                        <div className="font-mono text-base font-extrabold text-brand-950 sm:text-lg">
                            #{order.order_number}
                        </div>
                        <div className="text-xs font-medium text-brand-600">
                            Tanggal Order: {order.created_at} WIB
                        </div>
                        <div className="flex items-center gap-2 pt-1.5 sm:justify-end">
                            <span
                                className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-black tracking-wider uppercase ${
                                    isPaid
                                        ? 'border-2 border-emerald-400 bg-emerald-100 text-emerald-800'
                                        : 'border-2 border-amber-300 bg-amber-100 text-amber-800'
                                }`}
                            >
                                {isPaid ? (
                                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                                ) : (
                                    <Clock className="h-3.5 w-3.5 text-amber-600" />
                                )}
                                <span>
                                    {isPaid
                                        ? 'LUNAS / PAID'
                                        : order.payment_status_label}
                                </span>
                            </span>
                        </div>
                    </div>
                </div>

                {/* BANNER STATUS LUNAS DENGAN STEMPEL RESMI */}
                {isPaid && (
                    <div className="my-5 flex flex-col justify-between gap-4 overflow-hidden rounded-2xl border-2 border-emerald-300 bg-emerald-50/90 p-4 sm:flex-row sm:items-center">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-xs">
                                <CheckCircle2 className="h-6 w-6 stroke-[2.5]" />
                            </div>
                            <div>
                                <span className="block text-[10px] font-black tracking-wider text-emerald-800 uppercase">
                                    BUKTI TRANSAKSI SAH · SUDAH DIKONFIRMASI
                                </span>
                                <h3 className="text-sm font-extrabold text-emerald-950">
                                    Pembayaran Telah Diterima & Lunas
                                </h3>
                                <p className="mt-0.5 text-[11px] text-emerald-800">
                                    Dikonfirmasi pada{' '}
                                    {order.paid_at || order.created_at} WIB via{' '}
                                    {order.payment_method_label}.
                                </p>
                            </div>
                        </div>

                        {/* Stempel Fisik LUNAS Model Roastery */}
                        <div className="shrink-0 rotate-[-3deg] self-start rounded-xl border-2 border-emerald-700 bg-white/70 px-4 py-1.5 text-center text-xs font-black tracking-widest text-emerald-700 uppercase shadow-xs select-none sm:self-auto sm:border-3 sm:text-sm">
                            <div className="text-[9px] font-bold tracking-normal">
                                ALAT KOPI MALANG
                            </div>
                            <div className="my-0.5 text-base leading-none font-black text-emerald-700">
                                ★ LUNAS ★
                            </div>
                            <div className="font-mono text-[8px] tracking-tighter">
                                PAID · {order.paid_at || order.created_at}
                            </div>
                        </div>
                    </div>
                )}

                {/* Customer & Fulfillment Info */}
                <div className="grid grid-cols-1 gap-6 border-b border-sand-200 py-6 text-xs sm:grid-cols-2">
                    {/* Buyer Details */}
                    <div className="space-y-1.5">
                        <span className="block text-[10px] font-bold tracking-wider text-brand-400 uppercase">
                            Informasi Pelanggan
                        </span>
                        <h4 className="text-sm font-bold text-brand-950">
                            {order.customer_name}
                        </h4>
                        <p className="text-brand-700">
                            Nomor WhatsApp: {order.customer_phone}
                        </p>
                        <div className="pt-1 text-brand-600">
                            <span className="block font-semibold text-brand-800">
                                Metode Pembayaran:
                            </span>
                            <span>{order.payment_method_label}</span>
                            {order.paid_at && (
                                <span className="mt-0.5 block text-[11px] font-bold text-emerald-700">
                                    Status: Lunas ({order.paid_at} WIB)
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Shipping / Pickup Destination */}
                    <div className="space-y-1.5">
                        <span className="block text-[10px] font-bold tracking-wider text-brand-400 uppercase">
                            {isPickup
                                ? 'Metode Pengambilan'
                                : 'Alamat Pengiriman'}
                        </span>
                        {isPickup ? (
                            <div className="bg-sand-50 space-y-1 rounded-xl border border-sand-200 p-3">
                                <div className="flex items-center gap-1.5 font-bold text-brand-950">
                                    <Store className="h-3.5 w-3.5 text-accent-copper" />
                                    <span>Ambil di Toko (Self Pick Up)</span>
                                </div>
                                <p className="leading-snug text-brand-700">
                                    {settings.pickup_store_name ||
                                        'Alat Kopi Malang (Tlogomas, Malang)'}
                                    <br />
                                    {settings.pickup_store_address ||
                                        order.customer_address}
                                </p>
                                <p className="text-[10px] font-medium text-brand-500">
                                    {settings.pickup_store_hours ||
                                        'Buka setiap hari: 09.00 - 23.00 WIB'}
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-1">
                                <p className="leading-relaxed font-medium text-brand-800">
                                    {order.customer_address}
                                </p>
                                <div className="flex items-center gap-1.5 pt-1 font-semibold text-brand-700">
                                    <Truck className="h-3.5 w-3.5 text-accent-copper" />
                                    <span>
                                        Ekspedisi: {order.shipping_courier} (
                                        {order.shipping_service})
                                        {order.total_weight_grams
                                            ? ` · ${order.total_weight_grams}g`
                                            : ''}
                                    </span>
                                </div>
                                {order.tracking_number && (
                                    <p className="font-mono text-[11px] text-brand-600">
                                        No. Resi Pengiriman:{' '}
                                        <span className="font-bold text-brand-950">
                                            {order.tracking_number}
                                        </span>
                                    </p>
                                )}
                            </div>
                        )}
                        {order.customer_notes && (
                            <p className="pt-1 text-[11px] text-brand-500 italic">
                                Catatan: "{order.customer_notes}"
                            </p>
                        )}
                    </div>
                </div>

                {/* Items Table */}
                <div className="space-y-4 py-6">
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse text-left text-xs">
                            <thead>
                                <tr className="border-b-2 border-brand-950 text-[11px] font-bold tracking-wider text-brand-950 uppercase">
                                    <th className="w-8 py-2.5 pr-2">No</th>
                                    <th className="px-3 py-2.5">
                                        Keterangan Produk
                                    </th>
                                    <th className="w-16 px-3 py-2.5 text-center">
                                        Qty
                                    </th>
                                    <th className="w-28 px-3 py-2.5 text-right">
                                        Harga Satuan
                                    </th>
                                    <th className="w-28 py-2.5 pl-3 text-right">
                                        Subtotal
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-sand-200">
                                {groupOrderItems(order.items).map((entry, idx) => {
                                    if (entry.type === 'bundle') {
                                        return (
                                            <tr
                                                key={entry.key}
                                                className="align-top"
                                            >
                                                <td className="py-3.5 pr-2 font-medium text-brand-400">
                                                    {idx + 1}
                                                </td>
                                                <td className="space-y-1 px-3 py-3.5">
                                                    <div className="text-sm font-bold text-brand-950">
                                                        {entry.bundleName}
                                                    </div>
                                                    <BundleCartItemDetails
                                                        bundleItems={entry.bundleItems}
                                                        packageQty={1}
                                                    />
                                                </td>
                                                <td className="px-3 py-3.5 text-center font-bold text-brand-950">
                                                    1
                                                </td>
                                                <td className="px-3 py-3.5 text-right font-medium text-brand-700">
                                                    {formatRupiah(entry.totalSubtotal)}
                                                </td>
                                                <td className="py-3.5 pl-3 text-right font-extrabold text-brand-950">
                                                    {formatRupiah(entry.totalSubtotal)}
                                                </td>
                                            </tr>
                                        );
                                    }

                                    const item = entry.item;
                                    return (
                                        <tr
                                            key={entry.key}
                                            className="align-top"
                                        >
                                            <td className="py-3.5 pr-2 font-medium text-brand-400">
                                                {idx + 1}
                                            </td>
                                            <td className="space-y-1 px-3 py-3.5">
                                                <div className="flex flex-wrap items-center gap-2 text-sm font-bold text-brand-950">
                                                    <span>{item.product_name}</span>
                                                    {item.is_preorder && (
                                                        <span className="inline-flex items-center rounded-md border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-bold tracking-wide text-amber-800 uppercase">
                                                            Pre-Order
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="text-[11px] font-medium text-accent-copper">
                                                    Varian: {item.variant_label}
                                                </div>

                                                {/* Prominent BYOB Blend Ratio Display */}
                                                {item.custom_notes && (
                                                    <div className="mt-1.5 rounded-lg border border-amber-200 bg-amber-50/90 p-2.5 text-xs leading-snug text-brand-950">
                                                        <div className="flex items-center gap-1 text-[10px] font-bold tracking-wider text-accent-copper uppercase">
                                                            <SlidersHorizontal className="h-3 w-3" />
                                                            <span>
                                                                Komposisi Biji Kopi
                                                                & Rasio Blend
                                                                (C.Y.B.R):
                                                            </span>
                                                        </div>
                                                        <div className="mt-0.5 font-semibold text-brand-900">
                                                            {item.custom_notes}
                                                        </div>
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-3 py-3.5 text-center font-bold text-brand-950">
                                                {item.quantity}
                                            </td>
                                            <td className="px-3 py-3.5 text-right font-medium text-brand-700">
                                                {formatRupiah(item.price)}
                                            </td>
                                            <td className="py-3.5 pl-3 text-right font-extrabold text-brand-950">
                                                {formatRupiah(item.subtotal)}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Calculation Summary */}
                <div className="flex flex-col justify-end border-t-2 border-sand-200 pt-4 sm:flex-row">
                    <div className="w-full space-y-2 text-xs sm:w-80">
                        <div className="flex justify-between text-brand-600">
                            <span>Subtotal Produk</span>
                            <span className="font-semibold text-brand-950">
                                {formatRupiah(order.subtotal)}
                            </span>
                        </div>
                        {order.payment_details?.is_preorder &&
                            Number(
                                order.payment_details?.remaining_balance ?? 0,
                            ) > 0 && (() => {
                                const regularSub = Number(
                                    order.payment_details.regular_subtotal ?? 0,
                                );
                                const dpPayable = Number(
                                    order.payment_details.dp_payable_subtotal ??
                                        0,
                                );
                                const remaining = Number(
                                    order.payment_details.remaining_balance ??
                                        0,
                                );
                                const preorderFull = Number(
                                    order.payment_details
                                        .preorder_full_subtotal ??
                                        dpPayable + remaining,
                                );
                                const dpPct =
                                    order.payment_details?.dp_percent ??
                                    (preorderFull > 0
                                        ? Math.round(
                                              (dpPayable / preorderFull) * 100,
                                          )
                                        : null);
                                return (
                                    <>
                                        {regularSub > 0 && (
                                            <div className="flex justify-between text-brand-600">
                                                <span>Produk Reguler</span>
                                                <span className="font-semibold text-brand-950">
                                                    {formatRupiah(regularSub)}
                                                </span>
                                            </div>
                                        )}
                                        <div className="flex justify-between text-amber-700">
                                            <span className="font-semibold">
                                                Pembayaran DP Pre-Order
                                                {dpPct ? ` (${dpPct}%)` : ''}
                                            </span>
                                            <span className="font-bold">
                                                {formatRupiah(dpPayable)}
                                            </span>
                                        </div>
                                        <div className="flex justify-between text-brand-500">
                                            <span>
                                                Sisa Pelunasan
                                                {dpPct
                                                    ? ` (${100 - dpPct}%)`
                                                    : ''}
                                            </span>
                                            <span>
                                                {formatRupiah(remaining)}
                                            </span>
                                        </div>
                                    </>
                                );
                            })()}
                        <div className="flex justify-between text-brand-600">
                            <span>
                                {isPickup
                                    ? 'Metode Pengambilan'
                                    : `Ongkos Kirim (${order.shipping_courier || 'Kurir'})`}
                            </span>
                            <span
                                className={
                                    order.shipping_cost === 0
                                        ? 'font-bold text-emerald-700'
                                        : 'font-semibold text-brand-950'
                                }
                            >
                                {order.shipping_cost === 0
                                    ? isPickup
                                        ? 'GRATIS (Ambil Toko)'
                                        : 'GRATIS'
                                    : formatRupiah(order.shipping_cost)}
                            </span>
                        </div>
                        {order.unique_code > 0 && (
                            <div className="flex justify-between text-brand-600">
                                <span>Kode Unik Verifikasi</span>
                                <span className="font-semibold text-brand-950">
                                    +{order.unique_code}
                                </span>
                            </div>
                        )}
                        <div className="flex justify-between border-t border-sand-200 pt-2.5 text-sm font-extrabold text-brand-950 sm:text-base">
                            <span>Total Pembayaran</span>
                            <span className="text-base text-brand-800 sm:text-lg">
                                {formatRupiah(order.total_amount)}
                            </span>
                        </div>
                        {isPaid && (
                            <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-2 text-center text-xs font-extrabold tracking-wider text-emerald-800">
                                ★ STATUS: LUNAS DIBAYAR ★
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
