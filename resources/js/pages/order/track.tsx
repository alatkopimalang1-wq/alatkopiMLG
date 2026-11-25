import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import {
    ArrowLeft,
    Clock,
    HelpCircle,
    Package,
    Search,
    ShieldCheck,
    Truck,
} from 'lucide-react';
import { PublicLayout } from '@/layouts/public-layout';

interface TrackPageProps {
    error?: string;
}

export default function OrderTrackPage({ error }: TrackPageProps) {
    const [activeTab, setActiveTab] = useState<'order' | 'waybill'>('order');
    const [orderNumber, setOrderNumber] = useState('');

    // Waybill Tracking State
    const [waybill, setWaybill] = useState('');
    const [courier, setCourier] = useState('jnt');
    const [phone, setPhone] = useState('');
    const [trackingLoading, setTrackingLoading] = useState(false);
    const [trackingResult, setTrackingResult] = useState<any>(null);

    const handleOrderSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (orderNumber.trim()) {
            window.location.href = `/pesanan/${orderNumber.trim().toUpperCase()}`;
        }
    };

    const handleWaybillSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!waybill.trim()) return;

        setTrackingLoading(true);
        setTrackingResult(null);

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
                    waybill: waybill.trim(),
                    courier: courier,
                    last_phone: phone.trim() || null,
                }),
            });
            const data = await res.json();
            setTrackingResult(data);
        } catch (err) {
            console.error('Tracking error:', err);
            setTrackingResult({
                success: false,
                message:
                    'Gagal memuat informasi pelacakan resi. Silakan coba sesaat lagi.',
            });
        } finally {
            setTrackingLoading(false);
        }
    };

    return (
        <PublicLayout title="Lacak Pesanan & Cek Resi Ekspedisi — Alat Kopi Malang">
            <div className="mx-auto max-w-2xl space-y-8 px-4 py-12 pb-32 sm:px-6 md:pb-20 lg:px-8">
                {/* Header */}
                <div className="space-y-2 text-center">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-sand-200 bg-cream-100 text-brand-700 shadow-xs">
                        <Truck className="h-8 w-8 text-accent-copper" />
                    </div>
                    <h1 className="text-2xl font-black text-brand-950 sm:text-3xl">
                        Lacak Pesanan & Cek Resi
                    </h1>
                    <p className="mx-auto max-w-md text-xs text-brand-600 sm:text-sm">
                        Pantau status pesanan kopi Anda atau lacak nomor resi
                        ekspedisi secara langsung.
                    </p>
                </div>

                {/* Tabs */}
                <div className="mx-auto flex max-w-md rounded-2xl bg-sand-200/60 p-1.5">
                    <button
                        type="button"
                        onClick={() => setActiveTab('order')}
                        className={`flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold transition-all ${
                            activeTab === 'order'
                                ? 'bg-white text-brand-950 shadow-xs'
                                : 'text-brand-600 hover:text-brand-950'
                        }`}
                    >
                        <Package className="h-4 w-4" />
                        <span>No. Pesanan (SNB)</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('waybill')}
                        className={`flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold transition-all ${
                            activeTab === 'waybill'
                                ? 'bg-white text-brand-950 shadow-xs'
                                : 'text-brand-600 hover:text-brand-950'
                        }`}
                    >
                        <Truck className="h-4 w-4" />
                        <span>Cek Resi Kurir (Live)</span>
                    </button>
                </div>

                <div className="space-y-5 rounded-3xl border border-sand-200/80 bg-white p-6 shadow-xs sm:p-8">
                    {error && (
                        <div className="rounded-xl border border-red-200 bg-red-50 p-3.5 text-xs font-medium text-red-700">
                            {error}
                        </div>
                    )}

                    {activeTab === 'order' ? (
                        /* TAB 1: TRACK BY ORDER NUMBER */
                        <form
                            onSubmit={handleOrderSubmit}
                            className="space-y-4"
                        >
                            <div className="space-y-1.5">
                                <label className="block text-xs font-bold tracking-wider text-brand-900 uppercase">
                                    Nomor Pesanan (Invoice)
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        required
                                        value={orderNumber}
                                        onChange={(e) =>
                                            setOrderNumber(e.target.value)
                                        }
                                        placeholder="Contoh: SNB-261030-9A8B"
                                        className="w-full rounded-xl border border-sand-200 bg-cream-50 px-4 py-3 font-mono text-sm font-bold tracking-wider text-brand-950 uppercase transition-colors focus:border-brand-700 focus:bg-white focus:outline-hidden"
                                    />
                                    <Search className="pointer-events-none absolute top-1/2 right-4 h-4 w-4 -translate-y-1/2 text-brand-400" />
                                </div>
                                <p className="text-[11px] text-brand-500">
                                    * Nomor pesanan tertera pada invoice saat
                                    checkout dan pesan WhatsApp konfirmasi.
                                </p>
                            </div>

                            <button
                                type="submit"
                                className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-brand-700 py-3.5 text-xs font-bold tracking-wider text-white uppercase shadow-sm transition-all hover:bg-brand-800 active:scale-[0.99]"
                            >
                                <Search className="h-4 w-4" />
                                <span>Cek Status & Pembayaran</span>
                            </button>
                        </form>
                    ) : (
                        /* TAB 2: TRACK BY AWB / RESI */
                        <form
                            onSubmit={handleWaybillSubmit}
                            className="space-y-4"
                        >
                            <div className="space-y-1.5">
                                <label className="block text-xs font-bold tracking-wider text-brand-900 uppercase">
                                    Nomor Resi Pengiriman (Air Waybill)
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        required
                                        value={waybill}
                                        onChange={(e) =>
                                            setWaybill(e.target.value)
                                        }
                                        placeholder="Contoh: JP1234567890 / JNE-123456"
                                        className="w-full rounded-xl border border-sand-200 bg-cream-50 px-4 py-3 font-mono text-sm font-bold tracking-wider text-brand-950 uppercase transition-colors focus:border-brand-700 focus:bg-white focus:outline-hidden"
                                    />
                                    <Truck className="pointer-events-none absolute top-1/2 right-4 h-4 w-4 -translate-y-1/2 text-brand-400" />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                <div className="space-y-1">
                                    <label className="block text-xs font-bold tracking-wider text-brand-900 uppercase">
                                        Pilih Ekspedisi
                                    </label>
                                    <select
                                        value={courier}
                                        onChange={(e) =>
                                            setCourier(e.target.value)
                                        }
                                        className="w-full rounded-xl border border-sand-200 bg-cream-50 px-3.5 py-2.5 text-xs font-bold text-brand-950 focus:border-brand-700 focus:bg-white focus:outline-hidden"
                                    >
                                        <option value="jnt">J&T Express</option>
                                        <option value="jne">JNE Express</option>
                                        <option value="sicepat">
                                            SiCepat Ekspres
                                        </option>
                                        <option value="anteraja">
                                            Anteraja
                                        </option>
                                        <option value="pos">
                                            POS Indonesia
                                        </option>
                                        <option value="tiki">TIKI</option>
                                        <option value="gosend">
                                            GoSend Instant
                                        </option>
                                        <option value="ninja">
                                            Ninja Xpress
                                        </option>
                                        <option value="wahana">Wahana</option>
                                        <option value="lion">
                                            Lion Parcel
                                        </option>
                                        <option value="ide">ID Express</option>
                                        <option value="spx">
                                            SPX / Shopee Express
                                        </option>
                                    </select>
                                </div>

                                <div className="space-y-1">
                                    <label className="block text-xs font-bold tracking-wider text-brand-900 uppercase">
                                        No. HP Penerima (Opsional)
                                    </label>
                                    <input
                                        type="tel"
                                        value={phone}
                                        onChange={(e) =>
                                            setPhone(e.target.value)
                                        }
                                        placeholder="5 digit terakhir no. HP (opsional)"
                                        className="w-full rounded-xl border border-sand-200 bg-cream-50 px-3.5 py-2.5 text-xs text-brand-950 focus:border-brand-700 focus:bg-white focus:outline-hidden"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={trackingLoading}
                                className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-brand-700 py-3.5 text-xs font-bold tracking-wider text-white uppercase shadow-sm transition-all hover:bg-brand-800 active:scale-[0.99] disabled:opacity-60"
                            >
                                {trackingLoading ? (
                                    <>
                                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                        <span>
                                            Menghubungi Server Ekspedisi...
                                        </span>
                                    </>
                                ) : (
                                    <>
                                        <Search className="h-4 w-4" />
                                        <span>Lacak Resi Sekarang</span>
                                    </>
                                )}
                            </button>
                        </form>
                    )}

                    {/* LIVE TRACKING RESULT (ON THE SPOT) */}
                    {activeTab === 'waybill' && trackingResult && (
                        <div className="animate-in space-y-4 border-t border-sand-200 pt-4 duration-200 fade-in">
                            {trackingResult.success ? (
                                <div className="space-y-4">
                                    {/* Summary Card */}
                                    <div className="space-y-2 rounded-2xl border border-sand-200 bg-cream-50 p-4">
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="text-brand-600">
                                                Ekspedisi:
                                            </span>
                                            <span className="font-bold text-brand-950">
                                                {trackingResult.courier_name}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="text-brand-600">
                                                Nomor Resi:
                                            </span>
                                            <span className="font-mono font-bold text-accent-copper">
                                                {trackingResult.waybill}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="text-brand-600">
                                                Status Terkini:
                                            </span>
                                            <span
                                                className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${trackingResult.delivered ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}
                                            >
                                                {trackingResult.status}
                                            </span>
                                        </div>
                                        {trackingResult.status_label && (
                                            <p className="border-t border-sand-200 pt-1 text-[11px] text-brand-700">
                                                {trackingResult.status_label}
                                            </p>
                                        )}
                                    </div>

                                    {/* Timeline Manifest */}
                                    <div className="space-y-3">
                                        <h4 className="text-xs font-bold tracking-wider text-brand-900 uppercase">
                                            Riwayat Perjalanan Paket
                                        </h4>
                                        {trackingResult.history &&
                                        trackingResult.history.length > 0 ? (
                                            <div className="relative ml-2 space-y-4 border-l-2 border-brand-200 pl-4">
                                                {trackingResult.history.map(
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
                                    {trackingResult.message ||
                                        'Nomor resi tidak ditemukan atau belum aktif di sistem kurir.'}
                                </div>
                            )}
                        </div>
                    )}

                    <div className="flex items-center justify-between border-t border-sand-200 pt-4 text-xs text-brand-600">
                        <Link
                            href="/shop"
                            className="flex items-center gap-1 font-semibold text-brand-700 hover:underline"
                        >
                            <ArrowLeft className="h-3.5 w-3.5" />
                            <span>Kembali ke Katalog Kopi</span>
                        </Link>
                        <Link
                            href="/keranjang"
                            className="font-semibold text-brand-700 hover:underline"
                        >
                            Lihat Keranjang
                        </Link>
                    </div>
                </div>

                <div className="bg-sand-100/60 space-y-2 rounded-2xl border border-sand-200/80 p-5 text-xs text-brand-700">
                    <div className="flex items-center gap-2 font-bold text-brand-950">
                        <HelpCircle className="h-4 w-4 text-accent-copper" />
                        <span>Butuh bantuan terkait pesanan atau resi?</span>
                    </div>
                    <p className="leading-relaxed">
                        Jika Anda lupa nomor pesanan atau resi belum ter-update,
                        silakan hubungi Customer Service kami via WhatsApp resmi
                        di <strong>+62 821-3209-5241</strong>.
                    </p>
                </div>
            </div>
        </PublicLayout>
    );
}
