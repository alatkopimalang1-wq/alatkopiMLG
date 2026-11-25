import React, { useState } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import { Heart, ShoppingBag, Sparkles } from 'lucide-react';
import { PublicLayout } from '@/layouts/public-layout';
import type { NewReleaseItem, SanubariSharedProps } from '@/types/sanubari';

interface NewReleaseIndexProps {
    featuredItems?: NewReleaseItem[];
    products: NewReleaseItem[];
    title?: string;
    subtitle?: string;
    badge?: string;
    isActive?: boolean;
}

export default function NewReleaseIndex({
    products = [],
    title = 'New Release',
    subtitle = 'Koleksi biji kopi dan racikan terbaru dari Alat Kopi Malang',
    badge = 'NEW RELEASE',
}: NewReleaseIndexProps) {
    const { settings } = usePage<SanubariSharedProps>().props;
    const effectiveTitle =
        title || settings?.home_new_release_title || 'New Release';
    const effectiveSubtitle =
        subtitle ||
        settings?.home_new_release_subtitle ||
        'Koleksi biji kopi dan racikan terbaru dari Alat Kopi Malang';
    const effectiveBadge =
        badge || settings?.home_new_release_badge || 'NEW RELEASE';

    const [wishlist, setWishlist] = useState<Record<string | number, boolean>>(
        {},
    );

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
        <PublicLayout
            title={`${effectiveTitle} — Koleksi Terbaru Alat Kopi Malang`}
        >
            <Head>
                <meta
                    name="description"
                    content={`${effectiveTitle}: ${effectiveSubtitle}. Pilihan biji kopi single origin, house blend, dan racikan kopi terbaru langsung dari sangrai Alat Kopi Malang.`}
                />
            </Head>

            <main className="mx-auto w-full max-w-7xl space-y-6 px-2.5 py-4 sm:space-y-8 sm:px-6 sm:py-8 lg:px-8">
                {/* Hero Banner Header */}
                <section
                    className="to-brand-850 relative w-full overflow-hidden rounded-2xl border border-brand-700/40 bg-gradient-to-br from-brand-950 via-brand-900 p-6 text-white shadow-xl shadow-brand-950/20 sm:rounded-3xl sm:p-8 lg:p-10"
                    aria-label="New Release Banner"
                >
                    {/* Ambient Glows */}
                    <div className="pointer-events-none absolute -top-24 -left-24 h-80 w-80 rounded-full bg-accent-copper/20 blur-3xl" />
                    <div className="pointer-events-none absolute -right-24 -bottom-24 h-80 w-80 rounded-full bg-brand-500/20 blur-3xl" />

                    <div className="relative z-10 max-w-3xl space-y-3 sm:space-y-4">
                        <div className="inline-flex items-center gap-1.5 rounded-full border border-accent-copper/40 bg-accent-copper/20 px-3 py-1 text-xs font-black tracking-wider text-accent-copper-light uppercase backdrop-blur-md">
                            <Sparkles className="h-3.5 w-3.5 fill-accent-copper-light text-accent-copper-light" />
                            <span>{effectiveBadge}</span>
                        </div>

                        <h1 className="text-3xl leading-tight font-black tracking-tight text-white sm:text-4xl lg:text-5xl">
                            {effectiveTitle}
                        </h1>

                        <p className="text-sm leading-relaxed font-medium text-brand-200 sm:text-base">
                            {effectiveSubtitle}
                        </p>
                    </div>
                </section>

                {/* Products Grid */}
                {products.length === 0 ? (
                    <div className="bg-sand-50 space-y-3 rounded-2xl border border-brand-200/60 p-6 py-16 text-center">
                        <h3 className="text-base font-bold text-brand-900">
                            Belum ada produk New Release
                        </h3>
                        <p className="text-xs text-brand-600">
                            Silakan kunjungi katalog toko untuk melihat seluruh
                            koleksi kami.
                        </p>
                        <Link
                            href="/shop"
                            className="mt-2 inline-block rounded-lg bg-brand-800 px-4 py-2 text-xs font-bold text-white hover:bg-brand-900"
                        >
                            Ke Toko Kopi
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
                        {products.map((item) => {
                            const linkHref = item.slug
                                ? `/shop/${item.slug}`
                                : `/shop?search=${encodeURIComponent(item.name)}`;
                            return (
                                <Link
                                    key={item.id}
                                    href={linkHref}
                                    className="group flex flex-col overflow-hidden rounded-xl border border-brand-200/80 bg-white shadow-sm transition-all duration-300 hover:border-accent-copper/40 hover:shadow-xl sm:rounded-2xl"
                                >
                                    {/* Image Container with 1:1 Aspect Ratio */}
                                    <div className="relative flex aspect-square w-full items-center justify-center overflow-hidden bg-sand-200/40">
                                        <img
                                            src={item.image}
                                            alt={item.name}
                                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                            loading="lazy"
                                        />
                                        <span className="pointer-events-none absolute top-2 left-2 rounded-md bg-[#b43425] px-2 py-0.5 text-[10px] font-bold tracking-wider text-white uppercase shadow-xs">
                                            {item.badge || 'NEW RELEASE'}
                                        </span>

                                        {/* Wishlist Button */}
                                        <button
                                            type="button"
                                            aria-label="Simpan ke favorit"
                                            onClick={(e) =>
                                                toggleWishlist(item.id, e)
                                            }
                                            className="absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-brand-600 shadow-xs backdrop-blur-md transition-colors hover:text-red-600 sm:h-8 sm:w-8"
                                        >
                                            <Heart
                                                className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${
                                                    wishlist[item.id]
                                                        ? 'fill-red-600 text-red-600'
                                                        : ''
                                                }`}
                                            />
                                        </button>
                                    </div>

                                    {/* Card Details */}
                                    <div className="flex flex-1 flex-col p-3 sm:p-4">
                                        {item.category && (
                                            <span className="mb-1 line-clamp-1 text-[10px] font-bold tracking-wider text-accent-copper uppercase sm:text-[11px]">
                                                {item.category}
                                            </span>
                                        )}

                                        <h3 className="mb-1.5 line-clamp-2 min-h-[34px] text-xs leading-snug font-bold text-brand-950 transition-colors group-hover:text-accent-copper sm:min-h-[40px] sm:text-sm">
                                            {item.name}
                                        </h3>

                                        {item.description && (
                                            <p className="mb-2 line-clamp-2 text-[11px] text-brand-500">
                                                {item.description}
                                            </p>
                                        )}

                                        <div className="mt-auto space-y-0.5 pt-2">
                                            {item.original_price &&
                                                item.original_price >
                                                    item.price && (
                                                    <div className="text-[10px] leading-none font-medium text-brand-400 line-through sm:text-[11px]">
                                                        Rp{' '}
                                                        {formatPrice(
                                                            item.original_price,
                                                        )}
                                                    </div>
                                                )}
                                            <div className="text-sm leading-tight font-extrabold text-[#b43425] sm:text-base sm:text-accent-copper">
                                                Rp {formatPrice(item.price)}
                                            </div>
                                        </div>

                                        {/* Button */}
                                        <div className="mt-auto pt-3">
                                            <div className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-brand-700 px-3 py-2 text-xs font-bold text-white shadow-xs transition-colors group-hover:bg-brand-800">
                                                <ShoppingBag className="h-3.5 w-3.5 stroke-[2.2]" />
                                                <span>+ Keranjang</span>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                )}
            </main>
        </PublicLayout>
    );
}
