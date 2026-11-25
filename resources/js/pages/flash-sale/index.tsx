import React, { useEffect, useState } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import { Clock, Heart, ShoppingBag, Zap } from 'lucide-react';
import { PublicLayout } from '@/layouts/public-layout';
import type { FlashSaleProduct, SanubariSharedProps } from '@/types/sanubari';

interface FlashSaleIndexProps {
    heroItems?: FlashSaleProduct[];
    products: FlashSaleProduct[];
    endTime?: string | null;
    startTime?: string | null;
    title?: string;
    subtitle?: string;
    isActive?: boolean;
}

export default function FlashSaleIndex({
    products = [],
    endTime,
    title,
    subtitle,
    isActive = true,
}: FlashSaleIndexProps) {
    const { settings } = usePage<SanubariSharedProps>().props;
    const effectiveEndTime = endTime || settings?.home_flash_sale_end_time;
    const effectiveTitle =
        title || settings?.home_flash_sale_title || 'FLASH SALE';

    const calculateRemainingSeconds = () => {
        if (!effectiveEndTime) return 0;
        try {
            const formatted = effectiveEndTime.includes('T')
                ? effectiveEndTime
                : effectiveEndTime.replace(' ', 'T');
            const target = new Date(formatted).getTime();
            const now = new Date().getTime();
            if (isNaN(target)) return 0;
            return Math.max(0, Math.floor((target - now) / 1000));
        } catch {
            return 0;
        }
    };

    // Live countdown timer state connected to Admin Dashboard setting
    const [secondsLeft, setSecondsLeft] = useState<number>(
        calculateRemainingSeconds,
    );
    const [wishlist, setWishlist] = useState<Record<string | number, boolean>>(
        {},
    );

    useEffect(() => {
        setSecondsLeft(calculateRemainingSeconds());
        const interval = setInterval(() => {
            setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
        }, 1000);
        return () => clearInterval(interval);
    }, [effectiveEndTime]);

    const days = Math.floor(secondsLeft / 86400);
    const hours = String(Math.floor((secondsLeft % 86400) / 3600)).padStart(
        2,
        '0',
    );
    const minutes = String(Math.floor((secondsLeft % 3600) / 60)).padStart(
        2,
        '0',
    );
    const seconds = String(secondsLeft % 60).padStart(2, '0');
    const isExpired = secondsLeft <= 0;

    const formatPrice = (val?: number | null) => {
        if (!val) return '0';
        return new Intl.NumberFormat('id-ID').format(val);
    };

    const toggleWishlist = (id: string | number, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setWishlist((prev) => ({
            ...prev,
            [id]: !prev[id],
        }));
    };

    return (
        <PublicLayout title="Flash Sale Kopi Hari Ini — Alat Kopi Malang">
            <Head>
                <meta
                    name="description"
                    content="Flash Sale Kopi Hari Ini pilihan Alat Kopi Malang. Diskon spesial terbatas untuk biji kopi pilihan dan peralatan seduh manual."
                />
            </Head>

            <main className="mx-auto w-full max-w-7xl px-2 py-4 sm:px-6 sm:py-8 lg:px-8">
                {/* Top Simple Hero Banner matching uploaded design */}
                <section
                    className="relative w-full overflow-hidden rounded-2xl border border-brand-700/40 bg-gradient-to-r from-brand-950 via-brand-900 to-brand-800 p-6 text-white shadow-xl shadow-brand-950/20 sm:rounded-3xl sm:p-8 lg:p-10"
                    aria-label="Flash Sale Kopi Hari Ini Banner"
                >
                    {/* Subtle warm ambient glows */}
                    <div className="pointer-events-none absolute -top-24 -left-24 h-80 w-80 rounded-full bg-accent-copper/15 blur-3xl" />
                    <div className="pointer-events-none absolute -right-24 -bottom-24 h-80 w-80 rounded-full bg-brand-500/15 blur-3xl" />

                    <div className="relative z-10 flex flex-col items-center justify-between gap-6 sm:gap-8 md:flex-row">
                        {/* Left: Heading */}
                        <div className="text-center md:text-left">
                            <h1 className="text-3xl leading-tight font-black tracking-tight uppercase sm:text-4xl lg:text-[42px]">
                                FLASH{' '}
                                <span className="bg-gradient-to-r from-[#fcd34d] via-[#f59e0b] to-[#d97706] bg-clip-text text-transparent">
                                    SALE
                                </span>{' '}
                                KOPI HARI INI
                            </h1>
                        </div>

                        {/* Right: Timer Section */}
                        <div className="flex flex-col items-center gap-2 text-center md:items-end md:text-right">
                            <div className="flex items-center gap-1.5 text-xs font-extrabold tracking-wider text-white/95 uppercase sm:text-sm">
                                <Clock className="h-4 w-4 text-accent-copper-light" />
                                <span>
                                    {isExpired
                                        ? 'PROMO TELAH BERAKHIR'
                                        : 'PROMO BERAKHIR DALAM:'}
                                </span>
                            </div>

                            {/* Timer Blocks */}
                            <div className="flex items-center gap-1.5 sm:gap-2">
                                {days > 0 && (
                                    <>
                                        <div className="flex min-w-[50px] flex-col items-center justify-center rounded-xl border border-red-400/30 bg-[#dd4b39] px-2.5 py-1.5 text-white shadow-sm sm:min-w-[56px] sm:px-3">
                                            <span className="text-xl leading-none font-black sm:text-2xl">
                                                {String(days).padStart(2, '0')}
                                            </span>
                                            <span className="mt-0.5 text-[9px] font-extrabold tracking-wider text-white/90">
                                                HARI
                                            </span>
                                        </div>
                                        <span className="pb-3 text-lg font-black text-white sm:text-xl">
                                            :
                                        </span>
                                    </>
                                )}
                                <div className="flex min-w-[50px] flex-col items-center justify-center rounded-xl border border-red-400/30 bg-[#dd4b39] px-2.5 py-1.5 text-white shadow-sm sm:min-w-[56px] sm:px-3">
                                    <span className="text-xl leading-none font-black sm:text-2xl">
                                        {hours}
                                    </span>
                                    <span className="mt-0.5 text-[9px] font-extrabold tracking-wider text-white/90">
                                        JAM
                                    </span>
                                </div>
                                <span className="pb-3 text-lg font-black text-white sm:text-xl">
                                    :
                                </span>
                                <div className="flex min-w-[50px] flex-col items-center justify-center rounded-xl border border-red-400/30 bg-[#dd4b39] px-2.5 py-1.5 text-white shadow-sm sm:min-w-[56px] sm:px-3">
                                    <span className="text-xl leading-none font-black sm:text-2xl">
                                        {minutes}
                                    </span>
                                    <span className="mt-0.5 text-[9px] font-extrabold tracking-wider text-white/90">
                                        MENIT
                                    </span>
                                </div>
                                <span className="pb-3 text-lg font-black text-white sm:text-xl">
                                    :
                                </span>
                                <div className="flex min-w-[50px] flex-col items-center justify-center rounded-xl border border-red-400/30 bg-[#dd4b39] px-2.5 py-1.5 text-white shadow-sm sm:min-w-[56px] sm:px-3">
                                    <span className="text-xl leading-none font-black sm:text-2xl">
                                        {seconds}
                                    </span>
                                    <span className="mt-0.5 text-[9px] font-extrabold tracking-wider text-white/90">
                                        DETIK
                                    </span>
                                </div>
                            </div>

                            <p className="flex items-center gap-1 text-[11px] font-semibold text-amber-300 sm:text-xs">
                                <Zap className="h-3 w-3 fill-amber-300 text-amber-300" />
                                <span>
                                    {isExpired
                                        ? 'Promo flash sale periode ini telah selesai.'
                                        : 'Harga kembali normal saat timer mencapai 00:00:00!'}
                                </span>
                            </p>
                        </div>
                    </div>
                </section>

                {/* Products Grid - 2 columns on mobile, 4 columns on desktop */}
                <div className="mt-4 grid grid-cols-2 gap-2.5 sm:mt-8 sm:gap-6 lg:grid-cols-4">
                    {products.map((item) => {
                        const linkHref = item.slug
                            ? `/shop/${item.slug}`
                            : `/shop?search=${encodeURIComponent(item.name)}`;
                        const isLiked = !!wishlist[item.id];

                        return (
                            <div key={item.id} className="h-full">
                                {/* Mobile Card: matches shop page mobile 1:1 */}
                                <div className="flex h-full flex-col justify-between overflow-hidden rounded-xl border border-sand-200/80 bg-white shadow-xs transition-all duration-200 hover:shadow-md md:hidden">
                                    {/* Top Full-Width Image Container (Edge-to-Edge) */}
                                    <Link
                                        href={linkHref}
                                        className="group relative block aspect-square w-full overflow-hidden bg-sand-200/30"
                                    >
                                        <img
                                            src={item.image}
                                            alt={item.name}
                                            loading="lazy"
                                            decoding="async"
                                            className="h-full w-full object-cover transition-all duration-500 group-hover:scale-105"
                                        />

                                        {/* Top-Left Flash Sale Badge */}
                                        <span className="absolute top-2 left-2 rounded-md bg-[#e03131] px-2 py-0.5 text-[10px] font-bold text-white shadow-xs">
                                            {item.badge || 'Flash Sale'}
                                        </span>

                                        {/* Top-Right Heart Wishlist Pill */}
                                        <button
                                            type="button"
                                            onClick={(e) =>
                                                toggleWishlist(item.id, e)
                                            }
                                            aria-label={`Tambah ${item.name} ke favorit`}
                                            className={`absolute top-2 right-2 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full bg-white/85 shadow-xs backdrop-blur-xs transition-colors ${
                                                isLiked
                                                    ? 'text-[#e03131]'
                                                    : 'text-brand-400'
                                            }`}
                                        >
                                            <Heart
                                                className={`h-3.5 w-3.5 ${isLiked ? 'fill-[#e03131] text-[#e03131]' : 'text-brand-400'}`}
                                            />
                                        </button>
                                    </Link>

                                    {/* Content Body */}
                                    <div className="flex flex-1 flex-col justify-between p-2.5 sm:p-3">
                                        <Link href={linkHref} className="block">
                                            {/* Series / Category */}
                                            <span className="mb-1 block truncate text-[11px] font-semibold tracking-wider text-accent-copper uppercase">
                                                {item.category || 'Specialty'}
                                            </span>

                                            {/* Product Name (2 Lines Max) */}
                                            <h3 className="line-clamp-2 min-h-[2.4rem] text-sm leading-snug font-bold text-brand-950 transition-colors group-hover:text-brand-700">
                                                {item.name}
                                            </h3>

                                            {/* Price Area: Strikethrough + Selling Price */}
                                            <div className="mt-1.5 space-y-0.5">
                                                {item.original_price &&
                                                    item.original_price >
                                                        item.price && (
                                                        <span className="block text-[11px] leading-none text-brand-400 line-through">
                                                            Rp{' '}
                                                            {formatPrice(
                                                                item.original_price,
                                                            )}
                                                        </span>
                                                    )}
                                                <div className="text-[15px] font-black text-brand-950">
                                                    Rp {formatPrice(item.price)}
                                                </div>
                                            </div>
                                        </Link>

                                        {/* Bottom Action: Full-Width + Keranjang Button */}
                                        <div className="mt-auto pt-2.5">
                                            <Link
                                                href={linkHref}
                                                className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-brand-700 px-3 py-2 text-[12.5px] font-bold text-white shadow-xs transition-colors hover:bg-brand-800 active:bg-brand-900"
                                            >
                                                <ShoppingBag className="h-4 w-4 stroke-[2.2]" />
                                                <span>+ Keranjang</span>
                                            </Link>
                                        </div>
                                    </div>
                                </div>

                                {/* Desktop Card: Editorial clean layout */}
                                <div className="group hidden h-full flex-col justify-between rounded-2xl border border-sand-200/80 bg-white p-5 shadow-xs transition-colors duration-200 hover:bg-sand-200/30 md:flex">
                                    <Link href={linkHref} className="block">
                                        <div className="relative mb-4 aspect-square w-full overflow-hidden rounded-xl bg-sand-200/40">
                                            <img
                                                src={item.image}
                                                alt={item.name}
                                                loading="lazy"
                                                className="h-full w-full object-cover transition-all duration-500 group-hover:scale-103"
                                            />
                                            <span className="absolute top-3 left-3 rounded-full bg-[#e03131] px-3 py-1 text-[13px] font-bold text-white shadow-xs">
                                                {item.badge || 'Flash Sale'}
                                            </span>
                                            <button
                                                type="button"
                                                onClick={(e) =>
                                                    toggleWishlist(item.id, e)
                                                }
                                                aria-label={`Tambah ${item.name} ke favorit`}
                                                className={`absolute top-3 right-3 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-white/90 shadow-xs transition-colors hover:bg-white ${
                                                    isLiked
                                                        ? 'text-[#e03131]'
                                                        : 'text-brand-400 hover:text-[#e03131]'
                                                }`}
                                            >
                                                <Heart
                                                    className={`h-4 w-4 ${isLiked ? 'fill-[#e03131]' : ''}`}
                                                />
                                            </button>
                                        </div>

                                        <div className="mb-4 space-y-1">
                                            <span className="text-xs font-semibold tracking-wider text-accent-copper uppercase">
                                                {item.category || 'Specialty'}
                                            </span>
                                            <h3 className="line-clamp-2 text-base leading-snug font-bold text-brand-950 transition-colors group-hover:text-brand-700">
                                                {item.name}
                                            </h3>
                                        </div>
                                    </Link>

                                    <div className="mt-auto flex items-end justify-between border-t border-sand-200/80 pt-3">
                                        <div>
                                            {item.original_price &&
                                                item.original_price >
                                                    item.price && (
                                                    <span className="block text-xs text-brand-400 line-through">
                                                        Rp{' '}
                                                        {formatPrice(
                                                            item.original_price,
                                                        )}
                                                    </span>
                                                )}
                                            <span className="text-base font-bold text-brand-950">
                                                Rp {formatPrice(item.price)}
                                            </span>
                                        </div>

                                        <Link
                                            href={linkHref}
                                            className="flex items-center gap-1.5 rounded-full bg-brand-900 px-4 py-2 text-[13px] font-semibold text-white transition-colors hover:bg-brand-950 active:scale-95"
                                        >
                                            <ShoppingBag className="h-4 w-4" />
                                            <span>Pilih</span>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </main>
        </PublicLayout>
    );
}
