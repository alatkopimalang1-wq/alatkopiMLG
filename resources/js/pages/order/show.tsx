import React, { useEffect, useState } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { BundleCartItemDetails } from '@/components/bundle-cart-item-details';
import { groupOrderItems } from '@/lib/order-bundle-groups';
import { formatVariantLabel } from '@/lib/variant-utils';
import {
    AlertCircle,
    ArrowLeft,
    Building2,
    Check,
    CheckCircle2,
    Clock,
    Copy,
    Download,
    ExternalLink,
    FileText,
    HelpCircle,
    MapPin,
    MessageCircle,
    Printer,
    QrCode,
    RefreshCw,
    Search,
    ShieldCheck,
    SlidersHorizontal,
    Store,
    Truck,
    Upload,
    X,
    XCircle,
} from 'lucide-react';
import { PublicLayout } from '@/layouts/public-layout';
import { formatRupiah } from '@/lib/trans';
import { OrderData } from '@/types/sanubari';
import { trackPurchase } from '@/lib/meta-pixel';

interface OrderShowProps {
    order: OrderData;
    paymentConfig: {
        qris_image_url: string;
        qris_merchant: string;
        qris_nmid: string;
        whatsapp_url: string;
        banks: any;
    };
    pickupConfig?: {
        store_name: string;
        store_address: string;
        store_hours: string;
        notes: string;
        maps_url: string;
    };
}

export default function OrderShowPage({
    order,
    paymentConfig,
    pickupConfig = {
        store_name: 'Alat Kopi Malang (Tlogomas, Malang)',
        store_address:
            'Ruko Tlogomas Square Kav. 34, Jl. Raya Tlogomas, Lowokwaru, Kota Malang, Jawa Timur 65144',
        store_hours: 'Buka setiap hari: 09.00 - 23.00 WIB',
        notes: 'Pesanan dapat diambil langsung di kasir Alat Kopi Malang dengan menunjukkan Nomor Pesanan setelah status pesanan Siap.',
        maps_url: 'https://maps.app.goo.gl/PMuxaEtsbEvC4APy7',
    },
}: OrderShowProps) {
    const { flash } = usePage().props as any;

    // Track Meta Pixel Purchase event with deduplication protection against page refreshes
    useEffect(() => {
        if (!order || !order.order_number) return;

        // Valid triggers: Order was just placed in this flow, or payment is already confirmed/paid, or flash message present
        const isEligible = Boolean(
            order.is_newly_placed ||
            order.payment_status === 'paid' ||
            flash?.success,
        );

        if (isEligible) {
            try {
                const contentIds =
                    order.items && order.items.length > 0
                        ? order.items
                              .map((i) => String(i.sku || i.product_id || i.id))
                              .filter(Boolean)
                        : [];

                const totalValue = Number(order.total_amount || 0);

                trackPurchase(
                    {
                        content_ids: contentIds,
                        content_type: 'product',
                        value: totalValue,
                        currency: 'IDR',
                        num_items:
                            order.items?.reduce(
                                (acc, i) => acc + (i.quantity || 1),
                                0,
                            ) || 1,
                    },
                    order.order_number,
                );
            } catch (e) {
                console.error('Meta Pixel Purchase error', e);
            }
        }
    }, [order.order_number, order.is_newly_placed, order.payment_status]);

    const [copiedField, setCopiedField] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const [isTrackingModalOpen, setIsTrackingModalOpen] = useState(false);
    const [trackingLoading, setTrackingLoading] = useState(false);
    const [trackingData, setTrackingData] = useState<any>(null);

    const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
    const [cancelReason, setCancelReason] = useState('');
    const [isCancelling, setIsCancelling] = useState(false);

    const isCancelled =
        order.status === 'cancelled' || order.payment_status === 'cancelled';

    const handleCancelOrder = (e: React.FormEvent) => {
        e.preventDefault();
        if (isCancelling) return;
        setIsCancelling(true);
        router.post(
            `/pesanan/${order.order_number}/batalkan`,
            { reason: cancelReason },
            {
                preserveScroll: true,
                onFinish: () => {
                    setIsCancelling(false);
                    setIsCancelModalOpen(false);
                },
            },
        );
    };

    const handleFetchTracking = async () => {
        if (!order.tracking_number) return;
        setIsTrackingModalOpen(true);
        if (trackingData) return;

        setTrackingLoading(true);
        try {
            const res = await fetch('/api/shipping/track', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'X-CSRF-TOKEN':
                        (
                            document.querySelector(
                                'meta[name="csrf-token"]',
                            ) as HTMLMetaElement
                        )?.content || '',
                },
                body: JSON.stringify({
                    waybill: order.tracking_number,
                    courier: order.shipping_courier,
                    last_phone: order.customer_phone,
                }),
            });
            const data = await res.json();
            setTrackingData(data);
        } catch (err) {
            console.error('Failed to track waybill:', err);
        } finally {
            setTrackingLoading(false);
        }
    };

    const handleCopy = (text: string, fieldName: string) => {
        navigator.clipboard.writeText(text);
        setCopiedField(fieldName);
        setTimeout(() => setCopiedField(null), 2500);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const rawBank =
        order.payment_details?.bank_info ||
        (Array.isArray(paymentConfig.banks)
            ? paymentConfig.banks.find(
                  (b: any) =>
                      b.bank_code?.toLowerCase() ===
                      order.payment_channel?.toLowerCase(),
              ) || paymentConfig.banks[0]
            : paymentConfig.banks?.[order.payment_channel || 'bca'] ||
              paymentConfig.banks?.bca) ||
        {};

    const bankDetails = {
        name: rawBank.bank_name || rawBank.bank || rawBank.name || 'Bank BCA',
        number: rawBank.account_number || rawBank.number || '011-829-9102',
        holder:
            rawBank.account_holder ||
            rawBank.holder ||
            'ALAT KOPI MALANG',
    };

    const isPickup =
        order.shipping_courier === 'Ambil di Toko' ||
        order.shipping_courier?.toLowerCase().includes('ambil') ||
        order.shipping_courier?.toLowerCase().includes('pickup');

    return (
        <PublicLayout title={`Instruksi Pembayaran #${order.order_number}`}>
            <div className="mx-auto max-w-4xl space-y-6 px-4 py-8 pb-32 sm:px-6 md:pb-16 lg:px-8">
                {/* Back Link */}
                <div className="flex items-center justify-between">
                    <Link
                        href="/shop"
                        className="inline-flex items-center gap-1.5 text-xs font-medium text-brand-600 transition-colors hover:text-brand-950"
                    >
                        <ArrowLeft className="h-3.5 w-3.5" />
                        <span>Katalog Kopi</span>
                    </Link>
                    <Link
                        href="/lacak-pesanan"
                        className="text-xs text-brand-600 hover:underline"
                    >
                        Cari Pesanan Lain
                    </Link>
                </div>

                {/* Flash Message Banner */}
                {flash?.success && (
                    <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-medium text-emerald-800 shadow-xs sm:text-sm">
                        <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-emerald-600" />
                        <span>{flash.success}</span>
                    </div>
                )}
                {flash?.error && (
                    <div className="flex items-center gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs font-medium text-rose-800 shadow-xs sm:text-sm">
                        <AlertCircle className="h-5 w-5 flex-shrink-0 text-rose-600" />
                        <span>{flash.error}</span>
                    </div>
                )}

                {/* ORDER STATUS HERO CARD */}
                <div className="space-y-4 rounded-3xl border border-sand-200/80 bg-white p-6 shadow-xs sm:p-8">
                    <div className="flex flex-col justify-between gap-4 border-b border-sand-200 pb-4 sm:flex-row sm:items-center">
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-medium text-brand-500">
                                    Nomor Pesanan
                                </span>
                                <button
                                    type="button"
                                    onClick={() =>
                                        handleCopy(
                                            order.order_number,
                                            'order_number',
                                        )
                                    }
                                    className="bg-sand-100 inline-flex cursor-pointer items-center gap-1 rounded px-2 py-0.5 text-[11px] text-brand-600 hover:text-brand-900"
                                >
                                    <span>#{order.order_number}</span>
                                    {copiedField === 'order_number' ? (
                                        <Check className="h-3 w-3 text-emerald-600" />
                                    ) : (
                                        <Copy className="h-3 w-3" />
                                    )}
                                </button>
                            </div>
                            <h1 className="mt-1 text-xl font-black text-brand-950 sm:text-2xl">
                                {isCancelled
                                    ? 'Pesanan Dibatalkan'
                                    : order.payment_status === 'paid'
                                      ? 'Pembayaran Berhasil Diterima'
                                      : order.payment_status === 'verifying'
                                        ? 'Menunggu Verifikasi Pembayaran'
                                        : 'Selesaikan Pembayaran Anda'}
                            </h1>
                            <p className="mt-0.5 text-xs text-brand-500">
                                Dibuat pada: {order.created_at} WIB
                            </p>
                        </div>

                        {/* Status Badges */}
                        <div className="flex flex-wrap items-center gap-2">
                            <span
                                className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold ${
                                    isCancelled
                                        ? 'bg-rose-100 text-rose-800'
                                        : order.payment_status === 'paid'
                                          ? 'bg-emerald-100 text-emerald-800'
                                          : order.payment_status === 'verifying'
                                            ? 'bg-blue-100 text-blue-800'
                                            : 'bg-amber-100 text-amber-900'
                                }`}
                            >
                                {isCancelled ? (
                                    <XCircle className="h-3.5 w-3.5 text-rose-600" />
                                ) : order.payment_status === 'paid' ? (
                                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                                ) : (
                                    <Clock className="h-3.5 w-3.5 text-amber-600" />
                                )}
                                <span>{order.payment_status_label}</span>
                            </span>

                            <span
                                className={`rounded-full px-3 py-1.5 text-xs font-medium ${
                                    isCancelled
                                        ? 'bg-rose-50 text-rose-700'
                                        : 'bg-sand-100 text-brand-800'
                                }`}
                            >
                                {order.status_label}
                            </span>

                            {order.can_cancel && (
                                <button
                                    type="button"
                                    onClick={() => setIsCancelModalOpen(true)}
                                    className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-700 transition-colors hover:bg-rose-100"
                                >
                                    <XCircle className="h-3.5 w-3.5" />
                                    <span>Batalkan Pesanan</span>
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Total Amount Highlight */}
                    <div className="flex flex-col justify-between gap-3 rounded-2xl border border-sand-200 bg-cream-50 p-4 sm:flex-row sm:items-center sm:p-5">
                        <div>
                            <span className="text-xs font-medium text-brand-600">
                                Total yang Harus Dibayar
                            </span>
                            <div className="mt-0.5 text-2xl font-black text-brand-950 sm:text-3xl">
                                {formatRupiah(order.total_amount)}
                            </div>
                            {order.unique_code > 0 && (
                                <p className="mt-1 text-[11px] text-amber-800">
                                    * Termasuk 3 digit kode unik{' '}
                                    <strong>(+{order.unique_code})</strong>{' '}
                                    untuk identifikasi mutasi otomatis.
                                </p>
                            )}
                        </div>

                        <button
                            type="button"
                            onClick={() =>
                                handleCopy(
                                    order.total_amount.toString(),
                                    'total',
                                )
                            }
                            className="hover:bg-sand-50 inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-sand-300 bg-white px-4 py-2.5 text-xs font-bold text-brand-900 shadow-xs transition-all active:scale-95"
                        >
                            {copiedField === 'total' ? (
                                <>
                                    <Check className="h-4 w-4 text-emerald-600" />
                                    <span>Nominal Tersalin!</span>
                                </>
                            ) : (
                                <>
                                    <Copy className="h-4 w-4 text-brand-600" />
                                    <span>Salin Total Nominal</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* INVOICE LUNAS DOWNLOAD BANNER (JIKA SUDAH LUNAS / DIKONFIRMASI) */}
                {order.payment_status === 'paid' && (
                    <div className="to-sand-50 space-y-4 rounded-3xl border-2 border-emerald-300 bg-gradient-to-br from-emerald-50 via-white p-6 shadow-sm sm:p-8">
                        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
                            <div className="flex items-start gap-4">
                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-xs">
                                    <CheckCircle2 className="h-6 w-6 stroke-[2.5]" />
                                </div>
                                <div className="space-y-1">
                                    <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-0.5 text-[10px] font-black tracking-wider text-emerald-800 uppercase">
                                        <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-600" />
                                        Pesanan Dikonfirmasi · Lunas
                                    </div>
                                    <h2 className="text-lg font-extrabold text-brand-950 sm:text-xl">
                                        Invoice Pembayaran Resmi Siap Diunduh
                                    </h2>
                                    <p className="max-w-xl text-xs leading-relaxed text-brand-600">
                                        Pembayaran pesanan Anda sebesar{' '}
                                        <strong>
                                            {formatRupiah(order.total_amount)}
                                        </strong>{' '}
                                        telah lunas diverifikasi{' '}
                                        {order.paid_at
                                            ? `pada ${order.paid_at} WIB`
                                            : ''}
                                        . Anda dapat langsung mengunduh invoice
                                        resmi bertanda <strong>LUNAS</strong>{' '}
                                        dalam format PDF.
                                    </p>
                                </div>
                            </div>

                            <div className="flex shrink-0 flex-col items-stretch gap-2.5 sm:flex-row sm:items-center">
                                <a
                                    href={`/pesanan/${order.order_number}/invoice?download=1`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-emerald-700 px-5 py-3 text-xs font-bold tracking-wider text-white uppercase shadow-sm transition-all hover:bg-emerald-800"
                                >
                                    <Download className="h-4 w-4" />
                                    <span>Download Invoice PDF (Lunas)</span>
                                </a>

                                <a
                                    href={`/pesanan/${order.order_number}/invoice`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="hover:bg-sand-50 inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-sand-300 bg-white px-4 py-3 text-xs font-bold tracking-wider text-brand-900 uppercase transition-all"
                                >
                                    <Printer className="h-4 w-4 text-accent-copper" />
                                    <span>Cetak Faktur</span>
                                </a>
                            </div>
                        </div>
                    </div>
                )}

                {/* CANCELLED BANNER OR PAYMENT METHOD DETAILS */}
                {isCancelled ? (
                    <div className="space-y-4 rounded-3xl border border-rose-200 bg-rose-50/70 p-6 shadow-xs sm:p-8">
                        <div className="flex items-start gap-4">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-rose-600 text-white shadow-xs">
                                <XCircle className="h-6 w-6" />
                            </div>
                            <div className="space-y-1.5">
                                <h2 className="text-base font-extrabold text-rose-950 sm:text-lg">
                                    Pesanan Ini Telah Dibatalkan
                                </h2>
                                <p className="text-xs leading-relaxed text-rose-800">
                                    Pesanan #{order.order_number} telah dibatalkan dan tidak perlu dilakukan pembayaran.
                                    {order.payment_details?.cancel_reason && (
                                        <>
                                            {' '}
                                            Alasan pembatalan:{' '}
                                            <strong>
                                                {order.payment_details.cancel_reason}
                                            </strong>
                                            .
                                        </>
                                    )}
                                </p>
                                <div className="pt-2">
                                    <Link
                                        href="/shop"
                                        className="inline-flex items-center gap-2 rounded-xl bg-brand-900 px-4 py-2.5 text-xs font-bold text-white transition-colors hover:bg-brand-800"
                                    >
                                        <span>Belanja Lagi di Katalog</span>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* PAYMENT METHOD DETAILS */}
                        {order.payment_method === 'qris' ? (
                    /* ================= QRIS INSTRUCTIONS ================= */
                    <div className="space-y-6 rounded-3xl border border-sand-200/80 bg-white p-6 shadow-xs sm:p-8">
                        <div className="flex items-center gap-3 border-b border-sand-200 pb-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-700 text-white">
                                <QrCode className="h-5 w-5" />
                            </div>
                            <div>
                                <h2 className="text-base font-bold text-brand-950">
                                    Instruksi Pembayaran QRIS Toko Resmi
                                </h2>
                                <p className="text-xs text-brand-500">
                                    Merchant:{' '}
                                    <strong>
                                        {paymentConfig.qris_merchant}
                                    </strong>{' '}
                                    · NMID: {paymentConfig.qris_nmid}
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 items-center gap-8 md:grid-cols-12">
                            {/* QRIS Code Box */}
                            <div className="flex flex-col items-center justify-center space-y-4 md:col-span-6">
                                <div className="w-full max-w-[280px] rounded-2xl border-2 border-sand-200 bg-white p-3 shadow-sm sm:max-w-[320px]">
                                    <img
                                        src={paymentConfig.qris_image_url}
                                        alt="QRIS Alat Kopi Malang"
                                        className="h-auto w-full rounded-xl object-contain"
                                    />
                                </div>
                                <a
                                    href={paymentConfig.qris_image_url}
                                    download="QRIS-Sanubari-Roastery.svg"
                                    className="bg-sand-100 inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold text-brand-900 transition-colors hover:bg-sand-200"
                                >
                                    <Download className="h-3.5 w-3.5" />
                                    <span>Unduh Gambar QRIS</span>
                                </a>
                            </div>

                            {/* Step by Step Guide */}
                            <div className="space-y-4 text-xs text-brand-800 md:col-span-6">
                                <h3 className="text-sm font-bold tracking-wider text-brand-950 uppercase">
                                    Cara Pembayaran Melalui QRIS:
                                </h3>
                                <ol className="list-inside list-decimal space-y-3 leading-relaxed text-brand-700">
                                    <li>
                                        Buka aplikasi <strong>m-Banking</strong>{' '}
                                        (BCA, Mandiri, BRI, BNI) atau{' '}
                                        <strong>e-Wallet</strong> (GoPay, OVO,
                                        DANA, ShopeePay, LinkAja).
                                    </li>
                                    <li>
                                        Pilih menu{' '}
                                        <strong>Scan / Bayar via QRIS</strong>.
                                    </li>
                                    <li>
                                        Arahkan kamera smartphone ke kode QRIS
                                        di samping atau pilih gambar dari galeri
                                        Anda.
                                    </li>
                                    <li>
                                        Pastikan nama merchant penerima tertera:{' '}
                                        <strong className="text-brand-950">
                                            {paymentConfig.qris_merchant}
                                        </strong>
                                        .
                                    </li>
                                    <li>
                                        Masukkan nominal tepat{' '}
                                        <strong>
                                            {formatRupiah(order.total_amount)}
                                        </strong>{' '}
                                        lalu konfirmasi PIN transaksi Anda.
                                    </li>
                                    <li>
                                        Simpan tangkapan layar / bukti struk
                                        pembayaran untuk diunggah di bawah ini.
                                    </li>
                                </ol>
                            </div>
                        </div>
                    </div>
                ) : order.payment_method === 'bank_transfer' ? (
                    /* ================= BANK TRANSFER INSTRUCTIONS ================= */
                    <div className="space-y-6 rounded-3xl border border-sand-200/80 bg-white p-6 shadow-xs sm:p-8">
                        <div className="flex items-center gap-3 border-b border-sand-200 pb-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-700 text-white">
                                <Building2 className="h-5 w-5" />
                            </div>
                            <div>
                                <h2 className="text-base font-bold text-brand-950">
                                    Instruksi Transfer Bank ({bankDetails.name})
                                </h2>
                                <p className="text-xs text-brand-500">
                                    Transfer manual ke rekening resmi toko
                                    Alat Kopi Malang.
                                </p>
                            </div>
                        </div>

                        {/* Account Box */}
                        <div className="space-y-4 rounded-2xl border border-sand-200 bg-cream-50 p-6">
                            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                                <div>
                                    <span className="text-xs font-semibold text-brand-600">
                                        {bankDetails.name}
                                    </span>
                                    <div className="font-mono text-2xl font-black tracking-wider text-brand-950 sm:text-3xl">
                                        {bankDetails.number}
                                    </div>
                                    <div className="mt-1 text-xs font-medium text-brand-700">
                                        Atas Nama:{' '}
                                        <strong>{bankDetails.holder}</strong>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    onClick={() =>
                                        handleCopy(
                                            bankDetails.number.replace(
                                                /\D/g,
                                                '',
                                            ),
                                            'bank_acc',
                                        )
                                    }
                                    className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-brand-700 px-5 py-3 text-xs font-bold text-white shadow-xs transition-all hover:bg-brand-800 active:scale-95"
                                >
                                    {copiedField === 'bank_acc' ? (
                                        <>
                                            <Check className="h-4 w-4 text-emerald-300" />
                                            <span>
                                                Nomor Rekening Tersalin!
                                            </span>
                                        </>
                                    ) : (
                                        <>
                                            <Copy className="h-4 w-4" />
                                            <span>Salin Nomor Rekening</span>
                                        </>
                                    )}
                                </button>
                            </div>

                            <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs leading-relaxed text-amber-900">
                                <strong>Penting:</strong> Pastikan Anda
                                mentransfer tepat sejumlah{' '}
                                <strong>
                                    {formatRupiah(order.total_amount)}
                                </strong>{' '}
                                (termasuk kode unik) agar pembayaran dapat
                                diverifikasi secara instan.
                            </div>
                        </div>

                        {/* Transfer Steps */}
                        <div className="space-y-3 text-xs text-brand-700">
                            <h3 className="text-sm font-bold tracking-wider text-brand-950 uppercase">
                                Petunjuk Transfer via Mobile Banking:
                            </h3>
                            <ol className="list-inside list-decimal space-y-2 leading-relaxed">
                                <li>
                                    Buka aplikasi m-Banking Anda, pilih menu{' '}
                                    <strong>
                                        Transfer Antar Bank / Sesama Bank
                                    </strong>
                                    .
                                </li>
                                <li>
                                    Pilih tujuan{' '}
                                    <strong>{bankDetails.name}</strong> dan
                                    masukkan nomor rekening di atas.
                                </li>
                                <li>
                                    Ketikkan nominal transfer tepat{' '}
                                    <strong>
                                        {formatRupiah(order.total_amount)}
                                    </strong>
                                    .
                                </li>
                                <li>
                                    Pada berita transfer (jika tersedia),
                                    cantumkan nomor pesanan:{' '}
                                    <strong>{order.order_number}</strong>.
                                </li>
                                <li>
                                    Simpan struk / bukti transfer berhasil untuk
                                    diunggah di formulir konfirmasi di bawah.
                                </li>
                            </ol>
                        </div>
                    </div>
                ) : (
                    /* ================= WHATSAPP ORDER INSTRUCTIONS ================= */
                    <div className="space-y-4 rounded-3xl border border-sand-200/80 bg-white p-6 shadow-xs sm:p-8">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#25D366] text-white">
                                <MessageCircle className="h-5 w-5 fill-white" />
                            </div>
                            <div>
                                <h2 className="text-base font-bold text-brand-950">
                                    Pesanan WhatsApp Resmi
                                </h2>
                                <p className="text-xs text-brand-500">
                                    Pesanan Anda siap diteruskan ke WhatsApp
                                    Alat Kopi Malang.
                                </p>
                            </div>
                        </div>
                        <p className="text-xs leading-relaxed text-brand-700">
                            Admin kami akan langsung memverifikasi ketersediaan
                            stok biji kopi segar dan opsi pengiriman Anda.
                        </p>
                    </div>
                )}

                {/* UPLOAD PAYMENT PROOF SECTION */}
                <div className="space-y-5 rounded-3xl border border-sand-200/80 bg-white p-6 shadow-xs sm:p-8">
                    <div className="flex items-center justify-between border-b border-sand-200 pb-3">
                        <div>
                            <h2 className="flex items-center gap-2 text-base font-bold text-brand-950">
                                <Upload className="h-4 w-4 text-brand-700" />
                                <span>Konfirmasi & Bukti Pembayaran</span>
                            </h2>
                            <p className="text-xs text-brand-500">
                                Upload struk transfer atau tangkapan layar
                                pembayaran untuk mempercepat pengiriman kopi
                                Anda.
                            </p>
                        </div>

                        {order.payment_proof && (
                            <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">
                                Bukti Terunggah
                            </span>
                        )}
                    </div>

                    {order.payment_proof && (
                        <div className="flex items-center gap-4 rounded-2xl border border-sand-200 bg-cream-50 p-4">
                            <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl border border-sand-300 bg-sand-200">
                                <img
                                    src={order.payment_proof}
                                    alt="Bukti Transfer"
                                    className="h-full w-full object-cover"
                                />
                            </div>
                            <div className="flex-1 text-xs text-brand-800">
                                <p className="font-bold text-brand-950">
                                    Bukti Pembayaran Tersimpan
                                </p>
                                <p className="mt-0.5 text-brand-600">
                                    Status saat ini:{' '}
                                    <strong>
                                        {order.payment_status_label}
                                    </strong>
                                    . Roaster kami sedang memverifikasi struk
                                    Anda.
                                </p>
                            </div>
                            <a
                                href={order.payment_proof}
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center gap-1 text-xs font-semibold text-brand-700 hover:underline"
                            >
                                <span>Buka</span>
                                <ExternalLink className="h-3.5 w-3.5" />
                            </a>
                        </div>
                    )}

                    {/* Upload Form */}
                    <form
                        action={`/pesanan/${order.order_number}/upload-bukti`}
                        method="POST"
                        encType="multipart/form-data"
                        className="space-y-4"
                    >
                        <input
                            type="hidden"
                            name="_token"
                            value={
                                (
                                    document.querySelector(
                                        'meta[name="csrf-token"]',
                                    ) as HTMLMetaElement
                                )?.content || ''
                            }
                        />

                        <div className="space-y-2">
                            <label className="block text-xs font-semibold text-brand-900">
                                Pilih File Bukti Transfer (JPG, PNG, atau WEBP,
                                Maks. 5MB)
                            </label>
                            <input
                                type="file"
                                name="payment_proof"
                                accept="image/jpeg,image/png,image/jpg,image/webp"
                                required
                                onChange={handleFileChange}
                                className="w-full cursor-pointer text-xs text-brand-800 file:mr-4 file:rounded-xl file:border-0 file:bg-brand-700 file:px-4 file:py-2.5 file:text-xs file:font-bold file:text-white hover:file:bg-brand-800"
                            />
                        </div>

                        {previewUrl && (
                            <div className="bg-sand-50 max-w-xs rounded-xl border border-sand-200 p-3">
                                <p className="mb-2 text-[11px] font-semibold text-brand-600">
                                    Pratinjau File:
                                </p>
                                <img
                                    src={previewUrl}
                                    alt="Preview"
                                    className="max-h-48 w-full rounded-lg object-contain"
                                />
                            </div>
                        )}

                        <div className="flex flex-col gap-3 pt-2 sm:flex-row">
                            <button
                                type="submit"
                                disabled={!selectedFile || isUploading}
                                className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-brand-700 px-6 py-3.5 text-xs font-bold tracking-wider text-white uppercase shadow-sm transition-all hover:bg-brand-800 disabled:opacity-50"
                            >
                                <Upload className="h-4 w-4" />
                                <span>
                                    {order.payment_proof
                                        ? 'Ganti Bukti Transfer'
                                        : 'Kirim Bukti Pembayaran'}
                                </span>
                            </button>

                            {/* WhatsApp Fast Confirmation Button */}
                            <a
                                href={paymentConfig.whatsapp_url}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#25D366] px-6 py-3.5 text-xs font-bold tracking-wider text-white uppercase shadow-sm transition-all hover:bg-[#20ba59]"
                            >
                                <MessageCircle className="h-4 w-4 fill-white" />
                                <span>Konfirmasi Cepat via WhatsApp</span>
                            </a>

                            {order.can_cancel && (
                                <button
                                    type="button"
                                    onClick={() => setIsCancelModalOpen(true)}
                                    className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-5 py-3.5 text-xs font-bold tracking-wider text-rose-700 uppercase transition-all hover:bg-rose-100"
                                >
                                    <XCircle className="h-4 w-4" />
                                    <span>Batalkan Pesanan</span>
                                </button>
                            )}
                        </div>
                    </form>
                </div>
                </>
                )}

                {/* ORDER DETAILS & SHIPPING SUMMARY */}
                <div className="space-y-6 rounded-3xl border border-sand-200/80 bg-white p-6 shadow-xs sm:p-8">
                    <div className="flex items-center justify-between border-b border-sand-200 pb-3">
                        <h2 className="text-base font-bold text-brand-950">
                            Rincian Barang yang Dipesan
                        </h2>
                        <div className="flex items-center gap-2">
                            <a
                                href={`/pesanan/${order.order_number}/invoice?download=1`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-emerald-700 px-3 py-1.5 text-xs font-bold text-white shadow-xs transition-colors hover:bg-emerald-800"
                            >
                                <Download className="h-3.5 w-3.5" />
                                <span>
                                    Download PDF{' '}
                                    {order.payment_status === 'paid'
                                        ? '(Lunas)'
                                        : ''}
                                </span>
                            </a>
                            <a
                                href={`/pesanan/${order.order_number}/invoice`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-sand-50 hover:bg-sand-100 inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-sand-200 px-3 py-1.5 text-xs font-bold text-brand-800 transition-colors"
                            >
                                <FileText className="h-3.5 w-3.5 text-accent-copper" />
                                <span>Lihat Invoice</span>
                            </a>
                        </div>
                    </div>

                    <div className="divide-y divide-sand-200/60">
                        {groupOrderItems(order.items).map((entry) => {
                            if (entry.type === 'bundle') {
                                return (
                                    <div key={entry.key} className="space-y-2 py-3.5">
                                        <div className="flex items-center gap-3">
                                            {entry.image && (
                                                <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-xl border border-sand-200 bg-cream-50">
                                                    <img
                                                        src={
                                                            entry.image.startsWith('http://') ||
                                                            entry.image.startsWith('https://')
                                                                ? entry.image
                                                                : `/storage/${entry.image.replace(/^\/?(public\/|storage\/)?/, '')}`
                                                        }
                                                        alt={entry.bundleName}
                                                        className="h-full w-full object-cover"
                                                    />
                                                </div>
                                            )}
                                            <h3 className="text-sm font-bold text-brand-950">
                                                {entry.bundleName}
                                            </h3>
                                        </div>
                                        <BundleCartItemDetails
                                            bundleItems={entry.bundleItems}
                                            packageQty={1}
                                        />
                                    </div>
                                );
                            }

                            const item = entry.item;
                            const rawImg = item.image;
                            const imgUrl = rawImg
                                ? rawImg.startsWith('http://') ||
                                  rawImg.startsWith('https://')
                                    ? rawImg
                                    : `/storage/${rawImg.replace(/^\/?(public\/|storage\/)?/, '')}`
                                : '/brand/logo-circle.png';
                            return (
                                <div
                                    key={entry.key}
                                    className="flex items-start justify-between gap-4 py-3.5"
                                >
                                    <div className="flex min-w-0 flex-1 items-start gap-3">
                                        <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-xl border border-sand-200 bg-cream-50">
                                            <img
                                                src={imgUrl}
                                                alt={item.product_name}
                                                className="h-full w-full object-cover"
                                            />
                                        </div>
                                        <div className="min-w-0 flex-1 space-y-1">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <h3 className="text-sm font-bold text-brand-950">
                                                    {item.product_name}
                                                </h3>
                                                {item.is_preorder && (
                                                    <span className="inline-flex items-center rounded-md border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-bold tracking-wide text-amber-800 uppercase">
                                                        Pre-Order
                                                    </span>
                                                )}
                                            </div>
                                            {formatVariantLabel(item.variant_label) && (
                                                <p className="text-xs font-medium text-accent-copper">
                                                    Varian: {formatVariantLabel(item.variant_label)}
                                                </p>
                                            )}
                                            {(item.custom_notes ||
                                                (item as any).customNotes) && (
                                                <div className="mt-1.5 rounded-xl border border-amber-200/70 bg-amber-50/80 p-2.5 text-xs leading-snug text-brand-900">
                                                    <div className="flex items-center gap-1.5 text-[11px] font-bold tracking-wider text-accent-copper uppercase">
                                                        <SlidersHorizontal className="h-3.5 w-3.5" />
                                                        <span>
                                                            Rasio & Komposisi Kopi
                                                            (C.Y.B.R):
                                                        </span>
                                                    </div>
                                                    <p className="mt-1 font-semibold text-brand-950">
                                                        {item.custom_notes ||
                                                            (item as any).customNotes}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex-shrink-0 text-right">
                                        <span className="text-xs font-medium text-brand-500">
                                            {item.quantity}x @{' '}
                                            {formatRupiah(item.price)}
                                        </span>
                                        <div className="text-sm font-extrabold text-brand-950">
                                            {formatRupiah(item.subtotal)}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Breakdown */}
                    <div className="space-y-2 border-t border-sand-200 pt-4 text-xs">
                        <div className="flex items-center justify-between text-brand-600">
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
                                            <div className="flex items-center justify-between text-brand-600">
                                                <span>Produk Reguler</span>
                                                <span className="font-semibold text-brand-950">
                                                    {formatRupiah(regularSub)}
                                                </span>
                                            </div>
                                        )}
                                        <div className="flex items-center justify-between text-amber-700">
                                            <span className="font-semibold">
                                                Pembayaran DP Pre-Order
                                                {dpPct ? ` (${dpPct}%)` : ''}
                                            </span>
                                            <span className="font-bold">
                                                {formatRupiah(dpPayable)}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between text-brand-500">
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
                        <div className="flex items-center justify-between text-brand-600">
                            <span>
                                {isPickup
                                    ? 'Metode Pengambilan'
                                    : `Biaya Pengiriman ${order.shipping_courier ? `(${order.shipping_courier} ${order.shipping_service || ''})` : ''}`}
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
                                        ? 'GRATIS (Ambil di Toko)'
                                        : 'GRATIS'
                                    : formatRupiah(order.shipping_cost)}
                            </span>
                        </div>
                        {order.shipping_etd && (
                            <div className="flex items-center justify-between text-[11px] text-brand-500">
                                <span>
                                    {isPickup
                                        ? 'Waktu Pengambilan'
                                        : 'Estimasi Waktu Pengiriman'}
                                </span>
                                <span>
                                    {isPickup
                                        ? 'Bisa diambil saat status pesanan Siap'
                                        : order.shipping_etd}
                                </span>
                            </div>
                        )}
                        {order.unique_code > 0 && (
                            <div className="flex items-center justify-between text-brand-600">
                                <span>Kode Unik Verifikasi</span>
                                <span className="font-semibold text-brand-950">
                                    +{order.unique_code}
                                </span>
                            </div>
                        )}
                        <div className="flex items-center justify-between border-t border-sand-200 pt-2 text-base font-extrabold text-brand-950">
                            <span>Total Pembayaran</span>
                            <span className="text-lg text-brand-700">
                                {formatRupiah(order.total_amount)}
                            </span>
                        </div>
                    </div>

                    {/* Customer & Address / Pickup Details */}
                    <div className="grid grid-cols-1 gap-4 border-t border-sand-200 pt-4 text-xs sm:grid-cols-2">
                        {isPickup ? (
                            <div className="bg-sand-100/70 space-y-2 rounded-xl border border-sand-200 p-3.5">
                                <div className="flex items-center gap-1.5 text-[11px] font-bold tracking-wider text-brand-950 uppercase">
                                    <Store className="h-4 w-4 text-brand-700" />
                                    <span>
                                        Lokasi Pengambilan Toko (Self Pick Up)
                                    </span>
                                </div>
                                <div>
                                    <h4 className="text-xs font-extrabold text-brand-950">
                                        {pickupConfig?.store_name ||
                                            'Alat Kopi Malang (Tlogomas, Malang)'}
                                    </h4>
                                    <p className="mt-0.5 leading-relaxed text-brand-700">
                                        {pickupConfig?.store_address ||
                                            order.customer_address}
                                    </p>
                                    <p className="mt-1 text-[11px] font-medium text-brand-600">
                                        🕒{' '}
                                        {pickupConfig?.store_hours ||
                                            'Buka setiap hari: 09.00 - 23.00 WIB'}
                                    </p>
                                </div>
                                <div className="space-y-1 rounded-lg border border-sand-200 bg-white p-2.5 text-[11px] text-brand-700">
                                    <span className="block font-bold text-brand-900">
                                        💡 Petunjuk Pengambilan:
                                    </span>
                                    <span>
                                        {pickupConfig?.notes ||
                                            'Tunjukkan Nomor Pesanan kepada barista/kasir saat mengambil pesanan setelah status Siap.'}
                                    </span>
                                </div>
                                {pickupConfig?.maps_url && (
                                    <a
                                        href={pickupConfig.maps_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1.5 pt-0.5 text-xs font-bold text-accent-copper hover:underline"
                                    >
                                        <MapPin className="h-3.5 w-3.5" />
                                        <span>Buka di Google Maps</span>
                                        <ExternalLink className="h-3 w-3" />
                                    </a>
                                )}
                                {order.customer_notes && (
                                    <p className="border-t border-sand-200/60 pt-1 text-[11px] text-brand-600 italic">
                                        Catatan Anda: "{order.customer_notes}"
                                    </p>
                                )}
                            </div>
                        ) : (
                            <div className="space-y-1">
                                <span className="text-[11px] font-bold tracking-wider text-brand-950 uppercase">
                                    Alamat Pengiriman
                                </span>
                                <p className="leading-relaxed text-brand-700">
                                    {order.customer_address}
                                    {order.shipping_city &&
                                        `, ${order.shipping_city}`}
                                    {order.shipping_province &&
                                        `, ${order.shipping_province}`}
                                </p>
                                {order.shipping_courier && (
                                    <p className="mt-1 flex items-center gap-1.5 font-semibold text-brand-800">
                                        <Truck className="h-3.5 w-3.5 text-accent-copper" />
                                        <span>
                                            Kurir: {order.shipping_courier} (
                                            {order.shipping_service}) ·{' '}
                                            {order.total_weight_grams}g
                                        </span>
                                    </p>
                                )}
                                {order.tracking_number ? (
                                    <div className="bg-sand-100/90 mt-3 space-y-2.5 rounded-2xl border border-sand-300 p-3.5">
                                        <div className="flex items-center justify-between gap-2">
                                            <div>
                                                <span className="block text-[10px] font-bold tracking-wider text-brand-500 uppercase">
                                                    No. Resi Pengiriman (AWB)
                                                </span>
                                                <span className="font-mono text-sm font-black tracking-wide text-brand-950">
                                                    {order.tracking_number}
                                                </span>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    handleCopy(
                                                        order.tracking_number!,
                                                        'tracking_number',
                                                    )
                                                }
                                                className="hover:bg-sand-50 inline-flex cursor-pointer items-center gap-1 rounded-lg border border-sand-300 bg-white px-2.5 py-1.5 text-[11px] font-bold text-brand-900 shadow-2xs transition-colors"
                                            >
                                                {copiedField ===
                                                'tracking_number' ? (
                                                    <Check className="h-3.5 w-3.5 text-emerald-600" />
                                                ) : (
                                                    <Copy className="h-3.5 w-3.5" />
                                                )}
                                                <span>
                                                    {copiedField ===
                                                    'tracking_number'
                                                        ? 'Tersalin'
                                                        : 'Salin'}
                                                </span>
                                            </button>
                                        </div>

                                        <div className="flex flex-wrap items-center gap-2 border-t border-sand-200 pt-1">
                                            <button
                                                type="button"
                                                onClick={handleFetchTracking}
                                                className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-brand-800 px-3 py-1.5 text-xs font-bold text-white shadow-xs transition-all hover:bg-brand-900"
                                            >
                                                <Search className="h-3.5 w-3.5" />
                                                <span>
                                                    Lacak Paket Live
                                                </span>
                                            </button>

                                            <a
                                                href={`/pesanan/${order.order_number}/shipping-label`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="hover:bg-sand-50 inline-flex items-center gap-1.5 rounded-xl border border-sand-300 bg-white px-3 py-1.5 text-xs font-bold text-brand-800 transition-all"
                                            >
                                                <Printer className="h-3.5 w-3.5 text-accent-copper" />
                                                <span>Label AWB (100x150)</span>
                                            </a>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="mt-2.5 flex items-center gap-2">
                                        <a
                                            href={`/pesanan/${order.order_number}/shipping-label`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="bg-sand-100 inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold text-brand-800 transition-colors hover:bg-sand-200"
                                        >
                                            <Printer className="h-3.5 w-3.5 text-accent-copper" />
                                            <span>Lihat Label Pengiriman</span>
                                        </a>
                                    </div>
                                )}
                                {order.customer_notes && (
                                    <p className="mt-1 text-brand-500 italic">
                                        Catatan: {order.customer_notes}
                                    </p>
                                )}
                            </div>
                        )}

                        <div className="space-y-1">
                            <span className="text-[11px] font-bold tracking-wider text-brand-950 uppercase">
                                {isPickup
                                    ? 'Data Pengambil Pesanan'
                                    : 'Penerima / Kontak'}
                            </span>
                            <p className="font-bold text-brand-900">
                                {order.customer_name}
                            </p>
                            <p className="text-brand-700">
                                WhatsApp: {order.customer_phone}
                            </p>
                            {order.customer_email && (
                                <p className="text-brand-700">
                                    Email: {order.customer_email}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* LIVE TRACKING MODAL */}
            {isTrackingModalOpen && (
                <div className="fixed inset-0 z-50 flex animate-in items-center justify-center bg-black/60 p-4 backdrop-blur-xs duration-200 fade-in">
                    <div className="relative flex max-h-[85vh] w-full max-w-lg flex-col overflow-hidden rounded-3xl border border-sand-200 bg-white shadow-2xl">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between bg-brand-950 px-6 py-4 text-white">
                            <div className="flex items-center gap-2.5">
                                <Truck className="h-5 w-5 text-accent-copper" />
                                <div>
                                    <h3 className="text-sm font-extrabold tracking-wide">
                                        Status Pengiriman Real-Time
                                    </h3>
                                    <p className="text-[11px] text-brand-300">
                                        Informasi Status Pengiriman Ekspedisi
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsTrackingModalOpen(false)}
                                className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="space-y-4 overflow-y-auto p-6">
                            {trackingLoading ? (
                                <div className="space-y-3 py-12 text-center">
                                    <div className="mx-auto h-10 w-10 animate-spin rounded-full border-3 border-brand-700 border-t-transparent" />
                                    <p className="text-xs font-medium text-brand-600">
                                        Memuat status pengiriman dari kurir ekspedisi...
                                    </p>
                                </div>
                            ) : trackingData?.success ? (
                                <div className="space-y-4">
                                    {/* Summary Card */}
                                    <div className="space-y-2 rounded-2xl border border-sand-200 bg-cream-50 p-4">
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="text-brand-600">
                                                Ekspedisi:
                                            </span>
                                            <span className="font-bold text-brand-950">
                                                {trackingData.courier_name}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="text-brand-600">
                                                Nomor Resi:
                                            </span>
                                            <span className="font-mono font-bold text-accent-copper">
                                                {trackingData.waybill}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="text-brand-600">
                                                Status Terkini:
                                            </span>
                                            <span
                                                className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${trackingData.delivered ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}
                                            >
                                                {trackingData.status}
                                            </span>
                                        </div>
                                        {trackingData.status_label && (
                                            <p className="border-t border-sand-200 pt-1 text-[11px] text-brand-700">
                                                {trackingData.status_label}
                                            </p>
                                        )}
                                    </div>

                                    {/* Timeline Manifest */}
                                    <div className="space-y-3">
                                        <h4 className="text-xs font-bold tracking-wider text-brand-900 uppercase">
                                            Riwayat Perjalanan Paket
                                        </h4>
                                        {trackingData.history &&
                                        trackingData.history.length > 0 ? (
                                            <div className="relative ml-2 space-y-4 border-l-2 border-brand-200 pl-4">
                                                {trackingData.history.map(
                                                    (
                                                        event: any,
                                                        idx: number,
                                                    ) => (
                                                        <div
                                                            key={idx}
                                                            className="relative"
                                                        >
                                                            <span
                                                                className={`absolute top-1.5 -left-[23px] h-3 w-3 rounded-full border-2 border-white ${idx === 0 ? 'bg-brand-700 ring-2 ring-brand-300' : 'bg-sand-400'}`}
                                                            />
                                                            <span className="block text-[10px] font-bold text-brand-400">
                                                                {event.date}
                                                            </span>
                                                            <p className="text-xs leading-snug font-semibold text-brand-900">
                                                                {event.desc}
                                                            </p>
                                                            {event.location && (
                                                                <span className="mt-0.5 block text-[10px] font-medium text-accent-copper">
                                                                    📍{' '}
                                                                    {
                                                                        event.location
                                                                    }
                                                                </span>
                                                            )}
                                                        </div>
                                                    ),
                                                )}
                                            </div>
                                        ) : (
                                            <p className="text-xs text-brand-500 italic">
                                                Belum ada pemindaian manifest
                                                dari kurir.
                                            </p>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-800">
                                    {trackingData?.message ||
                                        'Data pelacakan belum tersedia dari server ekspedisi.'}
                                </div>
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div className="bg-sand-50 flex justify-end border-t border-sand-200 px-6 py-3">
                            <button
                                type="button"
                                onClick={() => setIsTrackingModalOpen(false)}
                                className="cursor-pointer rounded-xl bg-brand-900 px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-brand-950"
                            >
                                Tutup
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* CANCEL ORDER CONFIRMATION MODAL */}
            {isCancelModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-md overflow-hidden rounded-3xl border border-sand-200 bg-white shadow-2xl">
                        <div className="flex items-center justify-between border-b border-sand-200 bg-rose-50/60 px-6 py-4">
                            <div className="flex items-center gap-2.5">
                                <XCircle className="h-5 w-5 text-rose-600" />
                                <h3 className="text-sm font-extrabold text-brand-950">
                                    Batalkan Pesanan #{order.order_number}?
                                </h3>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsCancelModalOpen(false)}
                                className="cursor-pointer rounded-full p-1 text-brand-500 hover:bg-sand-100"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        <form onSubmit={handleCancelOrder} className="space-y-4 p-6">
                            <p className="text-xs leading-relaxed text-brand-700">
                                Pesanan yang sudah dibatalkan tidak dapat diaktifkan kembali. Apakah Anda yakin ingin membatalkan pesanan ini?
                            </p>

                            <div className="space-y-1.5">
                                <label className="block text-xs font-semibold text-brand-900">
                                    Alasan Pembatalan (Opsional)
                                </label>
                                <textarea
                                    rows={3}
                                    value={cancelReason}
                                    onChange={(e) => setCancelReason(e.target.value)}
                                    placeholder="Contoh: Ingin ubah varian kopi / alamat pengiriman..."
                                    className="w-full rounded-xl border border-sand-300 px-3 py-2 text-xs text-brand-950 focus:border-brand-700 focus:outline-none"
                                />
                            </div>

                            <div className="flex items-center justify-end gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setIsCancelModalOpen(false)}
                                    className="cursor-pointer rounded-xl border border-sand-300 bg-white px-4 py-2.5 text-xs font-bold text-brand-800 hover:bg-sand-50"
                                >
                                    Kembali
                                </button>
                                <button
                                    type="submit"
                                    disabled={isCancelling}
                                    className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-rose-600 px-4 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-rose-700 disabled:opacity-50"
                                >
                                    <XCircle className="h-4 w-4" />
                                    <span>
                                        {isCancelling ? 'Membatalkan...' : 'Ya, Batalkan Pesanan'}
                                    </span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </PublicLayout>
    );
}
