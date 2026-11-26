import React, { useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { ShoppingBag, Plus } from 'lucide-react';
import type { Product } from '@/types/sanubari';
import { formatRupiah } from '@/lib/trans';
import { getEffectiveProductStock, getEffectiveVariantStock } from '@/lib/stock';
import { CoffeeBeanIcon } from '@/components/coffee-bean-icon';

interface ProductCardProps {
    product: Product;
    variant?: 'mobile' | 'desktop' | 'auto';
    className?: string;
}

export const ProductCard: React.FC<ProductCardProps> = ({
    product,
    variant = 'auto',
    className = '',
}) => {
    const primaryVariant = product.variants?.[0] || {
        id: product.id,
        product_id: product.id,
        label: '200 gr',
        weight_grams: 200,
        price: product.min_price || 15000,
        stock_status: 'in_stock' as const,
    };

    const rawImg =
        product.images?.[0]?.path ||
        primaryVariant?.image_url ||
        primaryVariant?.image;
    const imageUrl = rawImg
        ? rawImg.startsWith('http://') || rawImg.startsWith('https://')
            ? rawImg
            : `/storage/${rawImg.replace(/^\/?(public\/|storage\/)?/, '')}`
        : '/brand/logo-circle.png';
    const isDiscounted =
        !!primaryVariant.original_price &&
        primaryVariant.original_price > primaryVariant.price;
    const discountPercent = isDiscounted
        ? Math.round(
              ((primaryVariant.original_price! - primaryVariant.price) /
                  primaryVariant.original_price!) *
                  100,
          )
        : null;

    const { reservedStockByVariant = {} } = usePage<{
        reservedStockByVariant?: Record<string, number>;
    }>().props;

    const isBundle = Boolean(product.is_bundle);
    const productHref =
        isBundle && product.bundle_url
            ? product.bundle_url
            : `/shop/${product.slug}`;

    const isPreorder = Boolean(
        !isBundle && (product.is_preorder || product.stock_status === 'pre_order'),
    );

    const realStock = getEffectiveProductStock(
        product,
        reservedStockByVariant,
    );

    const isPreorderOut =
        isPreorder &&
        Boolean(
            product.is_out_of_stock ||
                product.stock_status === 'out_of_stock' ||
                (product.variants &&
                    product.variants.length > 0 &&
                    product.variants.every(
                        (v) => v.stock_status === 'out_of_stock',
                    )),
        );

    const isOutOfStock =
        isPreorderOut ||
        (!isPreorder &&
            Boolean(
                product.is_out_of_stock ||
                    (realStock !== null && realStock <= 0) ||
                    product.stock_status === 'out_of_stock' ||
                    (product.variants &&
                        product.variants.length > 0 &&
                        product.variants.every((v) => {
                            const vEff = getEffectiveVariantStock(
                                product,
                                v,
                                reservedStockByVariant,
                            );
                            return vEff !== null
                                ? vEff <= 0
                                : v.stock_status === 'out_of_stock';
                        })),
            ));

    // Full-Width Mobile Shape matching Otten Coffee reference (Image 2)
    const renderMobileShape = () => (
        <div
            className={`flex h-full flex-col justify-between overflow-hidden rounded-xl border transition-all duration-200 ${
                isOutOfStock
                    ? 'border-neutral-300 bg-neutral-900/5 shadow-xs'
                    : 'border-sand-200/80 bg-white shadow-xs hover:shadow-md'
            }`}
        >
            {/* Top Full-Width Image Container (Edge-to-Edge) */}
            <Link
                href={productHref}
                className="group relative block aspect-square w-full overflow-hidden bg-sand-200/30"
            >
                <img
                    src={imageUrl}
                    alt={product.name}
                    loading="lazy"
                    className={`h-full w-full object-cover transition-transform duration-300 ${
                        isOutOfStock
                            ? 'brightness-50 contrast-125 grayscale filter'
                            : 'group-hover:scale-105'
                    }`}
                />

                {/* Dark Overlay with Centered SOLD OUT Label */}
                {isOutOfStock && (
                    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/60 p-2 backdrop-blur-[1px]">
                        <span className="rounded-md border border-white/30 bg-black/90 px-3 py-1 text-xs font-black tracking-widest text-white uppercase shadow-md">
                            SOLD OUT
                        </span>
                        <span className="mt-1 text-[10px] font-medium text-white/80">
                            Stok Habis
                        </span>
                    </div>
                )}

                {/* Top-Left Badge (SOLD OUT / Pre-Order / Discount / Flash Sale / Best Seller) */}
                {isOutOfStock ? (
                    <span className="absolute top-2 left-2 z-20 rounded-md border border-white/20 bg-black px-2 py-0.5 text-[10px] font-black tracking-wider text-white shadow-xs">
                        SOLD OUT
                    </span>
                ) : isPreorder ? (
                    <span className="absolute top-2 left-2 z-20 rounded-md bg-amber-600 px-2 py-0.5 text-[10px] font-bold text-white shadow-xs">
                        Pre-Order
                        {(product.preorder_dp_percent ?? 100) < 100
                            ? ` · DP Mulai ${product.preorder_dp_percent}%`
                            : ''}
                    </span>
                ) : isBundle ? (
                    <span className="absolute top-2 left-2 rounded-md bg-accent-copper px-2 py-0.5 text-[10px] font-bold text-white shadow-xs">
                        {discountPercent
                            ? `Bundling · Hemat ${discountPercent}%`
                            : 'Paket Bundling'}
                    </span>
                ) : product.is_flash_sale ? (
                    <span className="absolute top-2 left-2 rounded-md bg-[#e03131] px-2 py-0.5 text-[10px] font-bold text-white shadow-xs">
                        Flash Sale
                    </span>
                ) : discountPercent ? (
                    <span className="absolute top-2 left-2 rounded-md bg-[#d97706] px-2 py-0.5 text-[10px] font-bold text-white shadow-xs">
                        Hemat {discountPercent}%
                    </span>
                ) : product.is_new ? (
                    <span className="absolute top-2 left-2 rounded-md bg-brand-700 px-2 py-0.5 text-[10px] font-semibold text-white">
                        Baru
                    </span>
                ) : product.is_featured ? (
                    <span className="absolute top-2 left-2 rounded-md bg-brand-900 px-2 py-0.5 text-[10px] font-semibold text-white">
                        Best Seller
                    </span>
                ) : null}
            </Link>

            {/* Content Body with Compact Padding */}
            <div className="flex flex-1 flex-col justify-between p-2.5 sm:p-3">
                <Link href={productHref} className="block">
                    {/* Series / Category */}
                    <span
                        className={`mb-1 block truncate text-[11px] font-semibold tracking-wider uppercase ${
                            isOutOfStock
                                ? 'text-neutral-500'
                                : 'text-accent-copper'
                        }`}
                    >
                        {product.origin ||
                            product.series_label ||
                            'Alat Kopi Malang'}
                    </span>

                    {/* Product Name (2 Lines Max) */}
                    <h3
                        className={`line-clamp-2 min-h-[2.4rem] text-sm leading-snug font-bold transition-colors sm:text-base ${
                            isOutOfStock
                                ? 'text-neutral-600 line-through decoration-neutral-400'
                                : 'text-brand-950 group-hover:text-brand-700'
                        }`}
                    >
                        {product.name}
                    </h3>

                    {/* Price Area: Strikethrough + Selling Price */}
                    <div className="mt-1.5 space-y-0.5">
                        {isDiscounted && primaryVariant.original_price && (
                            <span className="block text-[11px] leading-none text-brand-400 line-through sm:text-xs">
                                {formatRupiah(primaryVariant.original_price)}
                            </span>
                        )}
                        <div
                            className={`text-[15px] font-black sm:text-base ${
                                isOutOfStock
                                    ? 'text-neutral-500'
                                    : 'text-brand-950'
                            }`}
                        >
                            {formatRupiah(primaryVariant.price)}
                        </div>
                        {!isBundle && !isPreorder && realStock !== null && realStock > 0 && (
                            <div
                                className={`text-[11px] font-semibold ${
                                    realStock <= 5
                                        ? 'text-amber-600'
                                        : 'text-emerald-700'
                                }`}
                            >
                                Stok: {realStock}
                            </div>
                        )}
                    </div>
                </Link>

                {/* Bottom Action: Full-Width + Keranjang Button (or Disabled Sold Out) */}
                <div className="mt-auto pt-2.5">
                    {isOutOfStock ? (
                        <button
                            type="button"
                            disabled
                            className="flex w-full cursor-not-allowed items-center justify-center gap-1.5 rounded-lg bg-neutral-800 px-3 py-2 text-[12.5px] font-bold text-neutral-400 opacity-90 shadow-none sm:text-xs"
                        >
                            <span className="text-[11px] tracking-wide text-white/70 uppercase">
                                Stok Habis
                            </span>
                        </button>
                    ) : (
                        <Link
                            href={productHref}
                            className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-brand-700 px-3 py-2 text-[12.5px] font-bold text-white shadow-xs transition-colors hover:bg-brand-800 active:bg-brand-900 sm:text-xs"
                        >
                            <ShoppingBag className="h-4 w-4 stroke-[2.2]" />
                            <span>{isBundle ? 'Atur Paket' : '+ Keranjang'}</span>
                        </Link>
                    )}
                </div>
            </div>
        </div>
    );

    // Desktop Editorial Shape (No slop, no rest shadows, clean typography)
    const renderDesktopShape = () => (
        <div
            className={`flex h-full flex-col justify-between rounded-2xl p-5 transition-colors duration-200 ${
                isOutOfStock
                    ? 'bg-neutral-900/5'
                    : 'bg-white hover:bg-sand-200/30'
            }`}
        >
            <Link href={productHref} className="block">
                <div className="relative mb-4 aspect-square w-full overflow-hidden rounded-xl bg-sand-200/40">
                    <img
                        src={imageUrl}
                        alt={product.name}
                        loading="lazy"
                        className={`h-full w-full object-cover transition-transform duration-300 ${
                            isOutOfStock
                                ? 'brightness-50 contrast-125 grayscale filter'
                                : 'group-hover:scale-103'
                        }`}
                    />

                    {/* Dark Overlay with Centered SOLD OUT Label */}
                    {isOutOfStock && (
                        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/60 p-3 backdrop-blur-[1px]">
                            <span className="rounded-lg border border-white/30 bg-black/90 px-4 py-1.5 text-sm font-black tracking-widest text-white uppercase shadow-xl">
                                SOLD OUT
                            </span>
                            <span className="mt-1 text-xs font-medium text-white/80">
                                Stok Habis
                            </span>
                        </div>
                    )}

                    {isOutOfStock ? (
                        <span className="absolute top-3 left-3 z-20 rounded-full border border-white/20 bg-black px-3 py-1 text-[12px] font-black tracking-wider text-white shadow-xs">
                            SOLD OUT
                        </span>
                    ) : isPreorder ? (
                        <span className="absolute top-3 left-3 z-20 rounded-full bg-amber-600 px-3 py-1 text-[12px] font-bold text-white shadow-xs">
                            Pre-Order
                            {(product.preorder_dp_percent ?? 100) < 100
                                ? ` · DP Mulai ${product.preorder_dp_percent}%`
                                : ''}
                        </span>
                    ) : isBundle ? (
                        <span className="absolute top-3 left-3 rounded-full bg-accent-copper px-3 py-1 text-[12px] font-bold text-white shadow-xs">
                            {discountPercent
                                ? `Bundling · Hemat ${discountPercent}%`
                                : 'Paket Bundling'}
                        </span>
                    ) : product.is_flash_sale ? (
                        <span className="absolute top-3 left-3 rounded-full bg-[#e03131] px-3 py-1 text-[13px] font-bold text-white shadow-xs">
                            Flash Sale
                        </span>
                    ) : product.is_featured ? (
                        <span className="absolute top-3 left-3 rounded-full bg-brand-900 px-3 py-1 text-[13px] font-semibold text-white">
                            Best Seller
                        </span>
                    ) : null}
                </div>

                <div
                    className={`mb-1.5 text-[12px] font-semibold tracking-wider uppercase ${
                        isOutOfStock ? 'text-neutral-500' : 'text-accent-copper'
                    }`}
                >
                    <span className="capitalize">
                        {product.origin ||
                            product.series_label ||
                            'Alat Kopi Malang'}
                    </span>
                </div>

                <h3
                    className={`mb-2 line-clamp-2 text-base leading-snug font-bold transition-colors ${
                        isOutOfStock
                            ? 'text-neutral-600 line-through decoration-neutral-400'
                            : 'text-brand-950 group-hover:text-brand-700'
                    }`}
                >
                    {product.name}
                </h3>

                {product.tasting_notes && (
                    <p
                        className={`mb-4 line-clamp-1 text-[13px] leading-relaxed ${
                            isOutOfStock ? 'text-neutral-400' : 'text-brand-700'
                        }`}
                    >
                        {product.tasting_notes}
                    </p>
                )}
            </Link>

            <div className="mt-auto flex items-center justify-between pt-3">
                <div>
                    <span
                        className={`block text-[13px] ${isOutOfStock ? 'text-neutral-400' : 'text-brand-700'}`}
                    >
                        Mulai
                    </span>
                    <span
                        className={`text-base font-bold ${isOutOfStock ? 'text-neutral-500' : 'text-brand-950'}`}
                    >
                        {formatRupiah(primaryVariant.price)}
                    </span>
                    {!isBundle && !isPreorder && realStock !== null && realStock > 0 && (
                        <span
                            className={`mt-0.5 block text-xs font-semibold ${
                                realStock <= 5
                                    ? 'text-amber-600'
                                    : 'text-emerald-700'
                            }`}
                        >
                            Stok: {realStock}
                        </span>
                    )}
                </div>

                {isOutOfStock ? (
                    <button
                        type="button"
                        disabled
                        className="flex cursor-not-allowed items-center gap-1.5 rounded-full bg-neutral-800 px-4 py-2 text-[13px] font-semibold text-neutral-400 opacity-90 shadow-none"
                    >
                        <span className="text-white/70">Habis</span>
                    </button>
                ) : (
                    <Link
                        href={productHref}
                        className="flex items-center gap-1.5 rounded-full bg-brand-900 px-4 py-2 text-[13px] font-semibold text-white transition-colors hover:bg-brand-950 active:scale-95"
                    >
                        <ShoppingBag className="h-4 w-4" />
                        <span>{isBundle ? 'Atur Paket' : 'Pilih'}</span>
                    </Link>
                )}
            </div>
        </div>
    );

    if (variant === 'mobile') {
        return (
            <div className={`group h-full ${className}`}>
                {renderMobileShape()}
            </div>
        );
    }
    if (variant === 'desktop') {
        return (
            <div className={`group h-full ${className}`}>
                {renderDesktopShape()}
            </div>
        );
    }

    return (
        <div className={`group h-full ${className}`}>
            <div className="h-full md:hidden">{renderMobileShape()}</div>
            <div className="hidden h-full md:block">{renderDesktopShape()}</div>
        </div>
    );
};
