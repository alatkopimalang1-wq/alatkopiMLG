import React, { useEffect, useState } from 'react';
import { Head } from '@inertiajs/react';
import { formatVariantLabel } from '@/lib/variant-utils';
import {
    CheckCircle2,
    Coffee,
    Maximize2,
    Minimize2,
    QrCode,
    ShoppingBag,
    Sparkles,
} from 'lucide-react';

export const POS_DISPLAY_CHANNEL = 'sanubari_pos_display';
export const POS_DISPLAY_STORAGE_KEY = 'sanubari_pos_display_state';

export interface DisplayCartItem {
    id: string;
    product_name: string;
    variant_label: string;
    price: number;
    quantity: number;
    image?: string;
    discount_amount?: number;
    notes?: string;
}

export interface PosDisplayState {
    mode: 'idle' | 'cart' | 'qris' | 'checkout' | 'success';
    cart: DisplayCartItem[];
    subtotal: number;
    discountAmount: number;
    shippingCost: number;
    totalAmount: number;
    paymentMethod: 'cash' | 'qris' | 'debit' | 'bank_transfer';
    cashTendered: number;
    cashChange: number;
    customerName?: string;
    completedReceipt?: {
        order_number: string;
        total_amount: number;
        payment_method_label?: string;
        cash_change?: number;
    } | null;
    updatedAt: number;
}

interface PromoSlide {
    title: string;
    subtitle: string;
    badge: string;
    image_url: string | null;
}

interface DisplayProps {
    store: {
        name: string;
        tagline: string;
        address: string;
        phone: string;
        instagram: string;
    };
    qris: {
        enabled: boolean;
        merchant_name: string;
        nmid: string;
        image_url: string | null;
        instructions: string;
    };
    promo_slides: PromoSlide[];
}

const defaultDisplayState: PosDisplayState = {
    mode: 'idle',
    cart: [],
    subtotal: 0,
    discountAmount: 0,
    shippingCost: 0,
    totalAmount: 0,
    paymentMethod: 'cash',
    cashTendered: 0,
    cashChange: 0,
    completedReceipt: null,
    updatedAt: 0,
};

function formatRp(num: number): string {
    return 'Rp ' + Math.round(num).toLocaleString('id-ID');
}

export default function PosCustomerDisplay({
    store,
    qris,
    promo_slides,
}: DisplayProps) {
    const [state, setState] = useState<PosDisplayState>(() => {
        try {
            const raw = localStorage.getItem(POS_DISPLAY_STORAGE_KEY);
            if (raw) {
                return { ...defaultDisplayState, ...JSON.parse(raw) };
            }
        } catch {
            // ignore storage errors
        }
        return defaultDisplayState;
    });

    const [slideIndex, setSlideIndex] = useState(0);
    const [now, setNow] = useState(() => new Date());
    const [isFullscreen, setIsFullscreen] = useState(false);

    const slides: PromoSlide[] =
        promo_slides.length > 0
            ? promo_slides
            : [
                  {
                      title: store.name,
                      subtitle: store.tagline,
                      badge: 'Selamat Datang',
                      image_url: null,
                  },
              ];

    // Listen to BroadcastChannel + localStorage events from POS tab
    useEffect(() => {
        let channel: BroadcastChannel | null = null;
        if (typeof BroadcastChannel !== 'undefined') {
            channel = new BroadcastChannel(POS_DISPLAY_CHANNEL);
            channel.onmessage = (event) => {
                if (event.data && typeof event.data === 'object') {
                    setState({ ...defaultDisplayState, ...event.data });
                }
            };
        }

        const onStorage = (e: StorageEvent) => {
            if (e.key === POS_DISPLAY_STORAGE_KEY && e.newValue) {
                try {
                    setState({
                        ...defaultDisplayState,
                        ...JSON.parse(e.newValue),
                    });
                } catch {
                    // ignore
                }
            }
        };

        window.addEventListener('storage', onStorage);
        return () => {
            if (channel) channel.close();
            window.removeEventListener('storage', onStorage);
        };
    }, []);

    // Auto-rotate promo slides every 6 seconds
    useEffect(() => {
        if (slides.length <= 1) return;
        const timer = setInterval(() => {
            setSlideIndex((prev) => (prev + 1) % slides.length);
        }, 6000);
        return () => clearInterval(timer);
    }, [slides.length]);

    // Live clock
    useEffect(() => {
        const timer = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    // Track fullscreen changes
    useEffect(() => {
        const onFs = () => setIsFullscreen(Boolean(document.fullscreenElement));
        document.addEventListener('fullscreenchange', onFs);
        return () => document.removeEventListener('fullscreenchange', onFs);
    }, []);

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen?.().catch(() => {});
        } else {
            document.exitFullscreen?.().catch(() => {});
        }
    };

    const currentSlide = slides[slideIndex % slides.length];
    const hasCart = state.cart.length > 0;
    const activeMode =
        state.mode === 'success'
            ? 'success'
            : hasCart
              ? state.mode
              : 'idle';

    return (
        <div className="flex h-screen w-screen flex-col overflow-hidden bg-brand-950 font-sans text-white select-none">
            <Head title={`Layar Pelanggan — ${store.name}`} />

            {/* Top Store Bar */}
            <header className="flex shrink-0 items-center justify-between border-b border-white/10 bg-brand-900/90 px-6 py-3.5">
                <div className="flex items-center gap-3.5">
                    <img
                        src="/brand/logo-circle.png?v=20261126"
                        alt={store.name}
                        className="h-10 w-10 rounded-full ring-2 ring-accent-copper/50"
                    />
                    <div>
                        <h1 className="text-lg font-extrabold tracking-tight text-white">
                            {store.name}
                        </h1>
                        <p className="text-xs text-brand-300">
                            {store.address}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="text-right">
                        <div className="font-mono text-lg font-bold text-white tabular-nums">
                            {now.toLocaleTimeString('id-ID', {
                                hour: '2-digit',
                                minute: '2-digit',
                            })}
                        </div>
                        <div className="text-[11px] text-brand-300">
                            {now.toLocaleDateString('id-ID', {
                                weekday: 'long',
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                            })}
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={toggleFullscreen}
                        title={isFullscreen ? 'Keluar Layar Penuh' : 'Layar Penuh'}
                        className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-white/15 bg-white/10 text-white transition hover:bg-white/20"
                    >
                        {isFullscreen ? (
                            <Minimize2 className="h-4 w-4" />
                        ) : (
                            <Maximize2 className="h-4 w-4" />
                        )}
                    </button>
                </div>
            </header>

            {/* Main Display Area */}
            <main className="relative flex flex-1 overflow-hidden">
                {activeMode === 'success' && state.completedReceipt ? (
                    <div className="flex flex-1 flex-col items-center justify-center bg-gradient-to-br from-emerald-950 via-brand-950 to-brand-900 p-8 text-center">
                        <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 ring-4 ring-emerald-500/30">
                            <CheckCircle2 className="h-14 w-14" />
                        </div>
                        <p className="mb-2 text-sm font-bold tracking-widest text-emerald-400 uppercase">
                            Pembayaran Berhasil
                        </p>
                        <h2 className="mb-3 text-4xl font-black text-white">
                            Terima Kasih Atas Kunjungan Anda!
                        </h2>
                        <p className="mb-8 text-lg text-brand-200">
                            No. Pesanan:{' '}
                            <span className="font-mono font-bold text-white">
                                {state.completedReceipt.order_number}
                            </span>
                        </p>

                        <div className="w-full max-w-md space-y-3 rounded-2xl border border-white/15 bg-white/10 p-6 backdrop-blur-md">
                            <div className="flex items-center justify-between text-base text-brand-200">
                                <span>Total Pembayaran</span>
                                <span className="text-2xl font-black text-white">
                                    {formatRp(state.completedReceipt.total_amount)}
                                </span>
                            </div>
                            {state.completedReceipt.payment_method_label && (
                                <div className="flex items-center justify-between text-sm text-brand-300">
                                    <span>Metode</span>
                                    <span className="font-semibold text-white">
                                        {state.completedReceipt.payment_method_label}
                                    </span>
                                </div>
                            )}
                            {(state.completedReceipt.cash_change ?? 0) > 0 && (
                                <div className="flex items-center justify-between border-t border-white/15 pt-3 text-base text-emerald-300">
                                    <span>Kembalian</span>
                                    <span className="text-xl font-extrabold">
                                        {formatRp(state.completedReceipt.cash_change ?? 0)}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                ) : activeMode === 'idle' ? (
                    /* Fullscreen Promo Slideshow when Idle */
                    <div className="relative flex flex-1 items-center justify-center overflow-hidden">
                        {currentSlide.image_url ? (
                            <img
                                key={currentSlide.image_url}
                                src={currentSlide.image_url}
                                alt={currentSlide.title}
                                className="absolute inset-0 h-full w-full object-cover opacity-55 transition-opacity duration-700"
                            />
                        ) : (
                            <div className="absolute inset-0 bg-gradient-to-br from-brand-900 via-brand-950 to-stone-950" />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-brand-950 via-brand-950/50 to-transparent" />

                        <div className="relative z-10 mx-auto max-w-4xl px-8 text-center">
                            {currentSlide.badge && (
                                <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-accent-copper/50 bg-accent-copper/20 px-4 py-1.5 text-xs font-bold tracking-wider text-amber-200 uppercase">
                                    <Sparkles className="h-3.5 w-3.5" />
                                    {currentSlide.badge}
                                </span>
                            )}
                            <h2 className="mb-4 text-4xl leading-tight font-black text-white drop-shadow-lg sm:text-5xl">
                                {currentSlide.title || store.name}
                            </h2>
                            {currentSlide.subtitle && (
                                <p className="mx-auto max-w-2xl text-lg text-brand-100/90 drop-shadow">
                                    {currentSlide.subtitle}
                                </p>
                            )}
                        </div>

                        {slides.length > 1 && (
                            <div className="absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 gap-2">
                                {slides.map((_, idx) => (
                                    <span
                                        key={idx}
                                        className={`h-2 rounded-full transition-all ${
                                            idx === slideIndex % slides.length
                                                ? 'w-8 bg-accent-copper'
                                                : 'w-2 bg-white/30'
                                        }`}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                ) : (
                    /* Split View: Left = Promo or QRIS, Right = Live Itemized Cart & Total */
                    <div className="grid flex-1 grid-cols-12 overflow-hidden">
                        {/* Left Panel: QRIS Payment OR Promo Slide */}
                        <div className={`relative flex flex-col items-center justify-center overflow-hidden border-r border-white/10 bg-brand-900/60 p-4 lg:p-6 ${activeMode === 'qris' ? 'col-span-6' : 'col-span-5'}`}>
                            {activeMode === 'qris' ? (
                                <div className="flex max-h-full w-full max-w-xl flex-col items-center justify-center rounded-3xl bg-white p-5 text-center text-stone-900 shadow-2xl lg:p-6">
                                    <div className="mb-1.5 flex items-center gap-2 text-base font-black tracking-wide text-brand-900 uppercase lg:text-lg">
                                        <QrCode className="h-6 w-6 text-accent-copper" />
                                        <span>Pembayaran QRIS</span>
                                    </div>
                                    <p className="mb-3 text-xs font-semibold text-stone-500 lg:text-sm">
                                        {qris.merchant_name} • NMID: {qris.nmid}
                                    </p>

                                    {qris.image_url ? (
                                        <div className="mb-4 flex items-center justify-center overflow-hidden rounded-2xl border-2 border-stone-200 bg-white p-3">
                                            <img
                                                src={qris.image_url}
                                                alt="QRIS"
                                                className="h-72 w-72 max-h-[50vh] max-w-full object-contain lg:h-96 lg:w-96"
                                            />
                                        </div>
                                    ) : (
                                        <div className="mb-4 flex h-72 w-72 max-h-[50vh] max-w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-stone-300 bg-stone-50 p-6 text-stone-500 lg:h-96 lg:w-96">
                                            <QrCode className="mb-3 h-32 w-32 text-brand-800" />
                                            <span className="text-sm font-bold text-stone-700">
                                                Scan QRIS di Meja Kasir
                                            </span>
                                        </div>
                                    )}

                                    <div className="w-full rounded-2xl bg-brand-950 px-5 py-3.5 text-white">
                                        <div className="text-xs text-brand-300 uppercase">
                                            Total Tagihan
                                        </div>
                                        <div className="text-3xl font-black text-amber-300 lg:text-4xl">
                                            {formatRp(state.totalAmount)}
                                        </div>
                                    </div>
                                    <p className="mt-2.5 text-xs leading-relaxed text-stone-500">
                                        {qris.instructions}
                                    </p>
                                </div>
                            ) : (
                                /* Promo Slide Card while Cart is active */
                                <div className="relative flex h-full w-full flex-col justify-end overflow-hidden rounded-2xl border border-white/10 bg-brand-950">
                                    {currentSlide.image_url ? (
                                        <img
                                            src={currentSlide.image_url}
                                            alt={currentSlide.title}
                                            className="absolute inset-0 h-full w-full object-cover opacity-70"
                                        />
                                    ) : (
                                        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-brand-800 to-brand-950">
                                            <Coffee className="h-24 w-24 text-white/15" />
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-brand-950 via-brand-950/40 to-transparent" />
                                    <div className="relative z-10 p-6">
                                        {currentSlide.badge && (
                                            <span className="mb-2 inline-block rounded-full bg-accent-copper px-3 py-1 text-[10px] font-bold tracking-wider text-white uppercase">
                                                {currentSlide.badge}
                                            </span>
                                        )}
                                        <h3 className="text-2xl font-black text-white">
                                            {currentSlide.title || store.name}
                                        </h3>
                                        {currentSlide.subtitle && (
                                            <p className="mt-1 line-clamp-2 text-sm text-brand-100/90">
                                                {currentSlide.subtitle}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Right Panel: Live Order Items & Totals */}
                        <div className={`flex flex-col overflow-hidden bg-cream-50 text-brand-950 ${activeMode === 'qris' ? 'col-span-6' : 'col-span-7'}`}>
                            <div className="flex shrink-0 items-center justify-between border-b border-sand-200 bg-white px-6 py-4">
                                <div className="flex items-center gap-2.5">
                                    <ShoppingBag className="h-5 w-5 text-brand-700" />
                                    <h2 className="text-lg font-extrabold text-brand-950">
                                        Pesanan Anda
                                    </h2>
                                    {state.customerName && (
                                        <span className="rounded-full bg-brand-100 px-3 py-0.5 text-xs font-bold text-brand-800">
                                            {state.customerName}
                                        </span>
                                    )}
                                </div>
                                <span className="rounded-full bg-sand-100 px-3 py-1 text-xs font-bold text-brand-700">
                                    {state.cart.reduce(
                                        (s, i) => s + i.quantity,
                                        0,
                                    )}{' '}
                                    Item
                                </span>
                            </div>

                            {/* Itemized Cart List */}
                            <div className="flex-1 space-y-2.5 overflow-y-auto p-6">
                                {state.cart.map((item) => {
                                    const lineGross =
                                        item.price * item.quantity;
                                    const lineNet = Math.max(
                                        0,
                                        lineGross - (item.discount_amount || 0),
                                    );
                                    return (
                                        <div
                                            key={item.id}
                                            className="flex items-center justify-between gap-4 rounded-xl border border-sand-200/80 bg-white px-4 py-3 shadow-xs"
                                        >
                                            <div className="min-w-0 flex-1">
                                                <div className="truncate text-base font-bold text-brand-950">
                                                    {item.product_name}
                                                </div>
                                                <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-brand-500">
                                                    {formatVariantLabel(item.variant_label) && (
                                                        <>
                                                            <span>
                                                                {formatVariantLabel(item.variant_label)}
                                                            </span>
                                                            <span>•</span>
                                                        </>
                                                    )}
                                                    <span>
                                                        {item.quantity} ×{' '}
                                                        {formatRp(item.price)}
                                                    </span>
                                                    {(item.discount_amount ||
                                                        0) > 0 && (
                                                        <span className="rounded bg-rose-50 px-1.5 py-0.5 font-semibold text-rose-600">
                                                            Diskon -
                                                            {formatRp(
                                                                item.discount_amount ||
                                                                    0,
                                                            )}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="text-right text-base font-extrabold text-brand-950 tabular-nums">
                                                {formatRp(lineNet)}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Totals Summary Footer */}
                            <div className="shrink-0 space-y-2 border-t border-sand-200 bg-white px-6 py-5">
                                <div className="flex justify-between text-sm text-brand-600">
                                    <span>Subtotal</span>
                                    <span className="font-semibold tabular-nums">
                                        {formatRp(state.subtotal)}
                                    </span>
                                </div>
                                {state.discountAmount > 0 && (
                                    <div className="flex justify-between text-sm text-rose-600">
                                        <span>Total Diskon</span>
                                        <span className="font-semibold tabular-nums">
                                            -{formatRp(state.discountAmount)}
                                        </span>
                                    </div>
                                )}
                                {state.shippingCost > 0 && (
                                    <div className="flex justify-between text-sm text-brand-600">
                                        <span>Ongkos Kirim</span>
                                        <span className="font-semibold tabular-nums">
                                            {formatRp(state.shippingCost)}
                                        </span>
                                    </div>
                                )}
                                <div className="flex items-center justify-between border-t border-sand-200 pt-3">
                                    <span className="text-lg font-extrabold text-brand-950">
                                        Total Bayar
                                    </span>
                                    <span className="text-3xl font-black text-brand-800 tabular-nums">
                                        {formatRp(state.totalAmount)}
                                    </span>
                                </div>
                                {activeMode === 'checkout' &&
                                    state.paymentMethod === 'cash' &&
                                    state.cashTendered > 0 && (
                                        <div className="flex items-center justify-between rounded-xl bg-emerald-50 px-4 py-2 text-sm font-bold text-emerald-800">
                                            <span>
                                                Tunai:{' '}
                                                {formatRp(state.cashTendered)}
                                            </span>
                                            <span>
                                                Kembalian:{' '}
                                                {formatRp(state.cashChange)}
                                            </span>
                                        </div>
                                    )}
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
