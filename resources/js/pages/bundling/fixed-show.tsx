import React, { useMemo, useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import {
    ArrowLeft,
    CheckCircle2,
    MessageCircle,
    Minus,
    Package,
    Plus,
    ShoppingBag,
    Sparkles,
} from 'lucide-react';
import { PublicLayout } from '@/layouts/public-layout';
import { useCart } from '@/context/cart-context';
import { formatRupiah } from '@/lib/trans';
import { ProductCard } from '@/components/product-card';
import { ImageZoom } from '@animate-ui/react/primitives/effects/image-zoom';
import { SlidingNumber } from '@animate-ui/react/primitives/texts/sliding-number';
import type {
    BundleCartSubItem,
    Product,
    ProductVariant,
} from '@/types/sanubari';

interface FixedBundleItemData {
    id: number;
    product_id: number;
    product_name: string;
    product_slug: string;
    variant_id: number;
    variant_label: string;
    image?: string | null;
    quantity: number;
    normal_price: number;
    bundle_price: number;
    weight_grams: number;
    is_preorder: boolean;
    stock: number;
    is_out_of_stock: boolean;
    product: Product;
    variant: ProductVariant;
}

interface FixedBundleData {
    id: number;
    name: string;
    slug: string;
    description?: string | null;
    banner_image?: string | null;
    discount_percent: number;
    items: FixedBundleItemData[];
}

export default function FixedBundleShow({
    bundle,
    relatedBundles = [],
    whatsapp = '6282132095241',
}: {
    bundle: FixedBundleData;
    relatedBundles?: Product[];
    whatsapp?: string;
}) {
    const { addItem } = useCart();
    const [bundleQty, setBundleQty] = useState(1);
    const [selectedImageIdx, setSelectedImageIdx] = useState(0);
    const [addedSuccess, setAddedSuccess] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    const resolveImg = (path?: string | null) => {
        if (!path) return '/brand/logo-circle.png';
        if (path.startsWith('http://') || path.startsWith('https://'))
            return path;
        return `/storage/${path.replace(/^\/?(public\/|storage\/)?/, '')}`;
    };

    const galleryImages = useMemo(() => {
        const imgs: { url: string; label: string }[] = [];
        if (bundle.banner_image) {
            imgs.push({
                url: resolveImg(bundle.banner_image),
                label: bundle.name,
            });
        }
        bundle.items.forEach((item) => {
            if (item.image) {
                const url = resolveImg(item.image);
                if (!imgs.some((i) => i.url === url)) {
                    imgs.push({ url, label: item.product_name });
                }
            }
        });
        if (imgs.length === 0) {
            imgs.push({
                url: '/brand/logo-circle.png',
                label: bundle.name,
            });
        }
        return imgs;
    }, [bundle.banner_image, bundle.name, bundle.items]);

    const activeImage = galleryImages[selectedImageIdx] || galleryImages[0];

    const { unitNormal, unitDiscounted, isOutOfStock, maxPackages } =
        useMemo(() => {
            let norm = 0;
            let disc = 0;
            let outOfStock = bundle.items.length === 0;
            let maxPkg: number | null = null;

            bundle.items.forEach((item) => {
                norm += item.normal_price * item.quantity;
                disc += item.bundle_price * item.quantity;

                if (item.is_out_of_stock) {
                    outOfStock = true;
                } else if (!item.is_preorder) {
                    const possible = Math.floor(item.stock / item.quantity);
                    if (possible <= 0) {
                        outOfStock = true;
                    } else if (maxPkg === null || possible < maxPkg) {
                        maxPkg = possible;
                    }
                }
            });

            return {
                unitNormal: norm,
                unitDiscounted: disc,
                isOutOfStock: outOfStock,
                maxPackages: maxPkg,
            };
        }, [bundle.items]);

    const normalTotal = unitNormal * bundleQty;
    const bundleTotal = unitDiscounted * bundleQty;
    const savingsAmount = Math.max(0, normalTotal - bundleTotal);

    const handleAddToCart = () => {
        if (isOutOfStock) {
            setErrorMsg(
                'Maaf, salah satu produk di paket bundling ini sedang habis.',
            );
            return;
        }
        if (maxPackages !== null && bundleQty > maxPackages) {
            setErrorMsg(`Stok paket tersedia maksimal ${maxPackages} paket.`);
            return;
        }

        const bundleSubItems: BundleCartSubItem[] = bundle.items.map(
            (item, idx) => ({
                slot_id: idx + 1,
                slot_title: `Item ${idx + 1}`,
                slot_type: 'selectable',
                is_optional: false,
                product_id: item.product_id,
                product_name: item.product_name,
                variant_id: item.variant_id,
                variant_label: item.variant_label,
                quantity: item.quantity,
                normal_price: item.normal_price,
                bundle_price: item.bundle_price,
                weight_grams: item.weight_grams,
                is_preorder: item.is_preorder,
            }),
        );

        const totalWeight = bundleSubItems.reduce(
            (sum, s) => sum + (s.weight_grams || 0) * s.quantity,
            0,
        );
        const firstImage = bundle.banner_image || bundle.items[0]?.image;

        const bundleProduct: Product = {
            id: 2000000 + bundle.id,
            name: bundle.name,
            slug: bundle.slug,
            series: 'paket-bundling',
            freshness_days: 0,
            min_price: unitDiscounted,
            max_price: unitDiscounted,
            is_featured: true,
            is_new: false,
            status: 'active',
            is_bundle: true,
            bundle_url: `/produk-bundling/${bundle.slug}`,
            images: firstImage
                ? [
                      {
                          id: 0,
                          product_id: 2000000 + bundle.id,
                          path: firstImage,
                          sort_order: 0,
                          is_primary: true,
                      },
                  ]
                : [],
        };

        const bundleVariant: ProductVariant = {
            id: 2000000 + bundle.id,
            product_id: 2000000 + bundle.id,
            label: `${bundleSubItems.length} Produk`,
            weight_grams: totalWeight,
            price: unitDiscounted,
            original_price: unitNormal > unitDiscounted ? unitNormal : null,
            stock_status: 'in_stock',
        };

        addItem(
            bundleProduct,
            bundleVariant,
            bundleQty,
            '',
            `fixed-bundle:${bundle.id}`,
            undefined,
            undefined,
            undefined,
            bundleSubItems,
        );

        setErrorMsg('');
        setAddedSuccess(true);
        setTimeout(() => setAddedSuccess(false), 1400);
    };

    const waUrl = useMemo(() => {
        const lines = bundle.items
            .map(
                (item) =>
                    `- ${item.product_name} (${item.variant_label}) x${item.quantity * bundleQty} = ${formatRupiah(item.bundle_price * item.quantity * bundleQty)}`,
            )
            .join('\n');

        const msg = `Halo Alat Kopi Malang!\nSaya tertarik memesan produk bundling:\n*${bundle.name}* (${bundleQty}x paket)\n\nIsi paket:\n${lines}\n\nTotal Paket: *${formatRupiah(bundleTotal)}*`;
        return `https://wa.me/${whatsapp}?text=${encodeURIComponent(msg)}`;
    }, [bundle, bundleQty, bundleTotal, whatsapp]);

    return (
        <PublicLayout title={bundle.name}>
            <Head title={bundle.name} />

            <div className="mx-auto max-w-7xl space-y-6 px-2.5 py-4 sm:space-y-8 sm:px-6 sm:py-6 lg:px-8">
                <div className="hidden sm:block">
                    <Link
                        href="/shop"
                        className="inline-flex items-center gap-1.5 text-xs text-brand-500 transition-colors hover:text-brand-900"
                    >
                        <ArrowLeft className="h-3.5 w-3.5" />
                        <span>Kembali ke Katalog</span>
                    </Link>
                </div>

                <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-12">
                    {/* Left Column: Image Gallery */}
                    <div className="space-y-4 lg:col-span-6">
                        <div className="relative aspect-square w-full overflow-hidden rounded-2xl border border-sand-200 bg-white shadow-sm">
                            <ImageZoom
                                zoomScale={1.5}
                                zoomOnHover
                                className="h-full w-full"
                            >
                                <img
                                    src={activeImage.url}
                                    alt={activeImage.label}
                                    className={`h-full w-full object-cover ${
                                        isOutOfStock
                                            ? 'brightness-50 contrast-125 grayscale filter'
                                            : ''
                                    }`}
                                />
                            </ImageZoom>

                            {isOutOfStock ? (
                                <span className="pointer-events-none absolute top-4 left-4 rounded-lg border border-white/20 bg-black px-3 py-1 text-xs font-black tracking-wider text-white uppercase shadow-sm">
                                    SOLD OUT
                                </span>
                            ) : bundle.discount_percent > 0 ? (
                                <span className="pointer-events-none absolute top-4 left-4 rounded-lg bg-accent-copper px-3 py-1 text-xs font-bold tracking-wider text-white uppercase shadow-sm">
                                    Bundling · Hemat {bundle.discount_percent}%
                                </span>
                            ) : (
                                <span className="pointer-events-none absolute top-4 left-4 rounded-lg bg-accent-copper px-3 py-1 text-xs font-bold tracking-wider text-white uppercase shadow-sm">
                                    Produk Bundling
                                </span>
                            )}
                        </div>

                        {galleryImages.length > 1 && (
                            <div className="no-scrollbar flex items-center gap-3 overflow-x-auto pb-1">
                                {galleryImages.map((img, idx) => (
                                    <button
                                        key={img.url}
                                        type="button"
                                        onClick={() => setSelectedImageIdx(idx)}
                                        className={`relative h-18 w-18 flex-shrink-0 cursor-pointer overflow-hidden rounded-xl border-2 transition-all ${
                                            selectedImageIdx === idx
                                                ? 'scale-102 border-brand-700 shadow-md ring-2 ring-brand-700/30'
                                                : 'border-sand-200/80 opacity-70 hover:border-brand-400 hover:opacity-100'
                                        }`}
                                    >
                                        <img
                                            src={img.url}
                                            alt={img.label}
                                            className="h-full w-full object-cover"
                                        />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Right Column: Info & Fixed Items */}
                    <div className="space-y-6 lg:col-span-6">
                        <div>
                            <div className="mb-2.5 flex flex-wrap items-center gap-2">
                                <span className="inline-flex items-center gap-1.5 rounded-md bg-amber-100 px-2.5 py-1 text-[11px] font-extrabold tracking-wider text-amber-900 uppercase">
                                    <Package className="h-3.5 w-3.5" />
                                    Produk Bundling · Paket Tetap
                                </span>
                                {savingsAmount > 0 && (
                                    <span className="inline-flex items-center gap-1 rounded-md bg-emerald-100 px-2.5 py-1 text-[11px] font-extrabold text-emerald-800">
                                        <Sparkles className="h-3 w-3" />
                                        Hemat {formatRupiah(savingsAmount)}
                                    </span>
                                )}
                            </div>

                            <h1 className="text-2xl leading-tight font-extrabold tracking-tight text-brand-950 sm:text-3xl">
                                {bundle.name}
                            </h1>
                        </div>

                        <div className="space-y-1">
                            {normalTotal > bundleTotal && (
                                <span className="block text-sm font-medium text-gray-400 line-through md:text-base">
                                    {formatRupiah(normalTotal)}
                                </span>
                            )}
                            <div className="text-3xl font-black tracking-tight text-brand-950 md:text-4xl">
                                {formatRupiah(bundleTotal)}
                            </div>
                        </div>

                        {/* Fixed Bundle Items List */}
                        <div className="space-y-2.5">
                            <label className="block text-sm font-bold tracking-wider text-brand-800 uppercase">
                                Isi Produk dalam Paket:
                            </label>
                            <div className="divide-y divide-sand-100 overflow-hidden rounded-xl border border-sand-200 bg-white">
                                {bundle.items.map((item) => (
                                    <div
                                        key={item.id}
                                        className="flex items-center justify-between gap-3 px-3.5 py-2.5"
                                    >
                                        <div className="flex min-w-0 flex-1 items-center gap-3">
                                            <img
                                                src={resolveImg(item.image)}
                                                alt={item.product_name}
                                                className="h-12 w-12 flex-shrink-0 rounded-lg border border-sand-200 object-cover"
                                            />
                                            <div className="min-w-0">
                                                <div className="flex flex-wrap items-center gap-1.5">
                                                    <span className="text-xs font-bold text-brand-950 sm:text-sm">
                                                        {item.product_name}
                                                    </span>
                                                    {item.is_preorder && (
                                                        <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[9px] font-bold text-amber-800 uppercase">
                                                            Pre-Order
                                                        </span>
                                                    )}
                                                    {item.is_out_of_stock && (
                                                        <span className="rounded bg-rose-100 px-1.5 py-0.5 text-[9px] font-bold text-rose-700 uppercase">
                                                            Stok Habis
                                                        </span>
                                                    )}
                                                </div>
                                                {item.variant_label &&
                                                    item.variant_label !==
                                                        'Standard' && (
                                                        <div className="text-[11px] text-brand-600">
                                                            Varian:{' '}
                                                            {item.variant_label}
                                                        </div>
                                                    )}
                                            </div>
                                        </div>

                                        <div className="flex-shrink-0 text-right">
                                            <div className="text-xs font-bold text-brand-800">
                                                {item.quantity * bundleQty}x
                                            </div>
                                            {item.normal_price >
                                                item.bundle_price && (
                                                <span className="block text-[10px] text-rose-500 line-through">
                                                    {formatRupiah(
                                                        item.normal_price *
                                                            item.quantity *
                                                            bundleQty,
                                                    )}
                                                </span>
                                            )}
                                            <div className="text-xs font-extrabold text-brand-950">
                                                {formatRupiah(
                                                    item.bundle_price *
                                                        item.quantity *
                                                        bundleQty,
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {errorMsg && (
                            <div className="rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-xs font-semibold text-rose-700">
                                {errorMsg}
                            </div>
                        )}

                        <div className="space-y-3 pt-1">
                            <div className="flex items-center gap-2.5 sm:gap-3">
                                <div
                                    className={`flex h-12 items-center rounded-xl border border-sand-200 bg-white p-1 sm:h-auto ${
                                        isOutOfStock
                                            ? 'pointer-events-none opacity-50'
                                            : ''
                                    }`}
                                >
                                    <button
                                        type="button"
                                        disabled={isOutOfStock}
                                        onClick={() =>
                                            setBundleQty(
                                                Math.max(1, bundleQty - 1),
                                            )
                                        }
                                        className="flex h-full w-9 items-center justify-center rounded-lg text-brand-800 transition-colors hover:bg-sand-100 sm:h-8 sm:w-8"
                                    >
                                        <Minus className="h-3.5 w-3.5" />
                                    </button>
                                    <span className="flex w-9 items-center justify-center text-center text-sm font-bold text-brand-950 sm:w-10">
                                        <SlidingNumber number={bundleQty} />
                                    </span>
                                    <button
                                        type="button"
                                        disabled={
                                            isOutOfStock ||
                                            (maxPackages !== null &&
                                                bundleQty >= maxPackages)
                                        }
                                        onClick={() =>
                                            setBundleQty(
                                                maxPackages !== null
                                                    ? Math.min(
                                                          maxPackages,
                                                          bundleQty + 1,
                                                      )
                                                    : bundleQty + 1,
                                            )
                                        }
                                        className="flex h-full w-9 items-center justify-center rounded-lg text-brand-800 transition-colors hover:bg-sand-100 disabled:opacity-40 sm:h-8 sm:w-8"
                                    >
                                        <Plus className="h-3.5 w-3.5" />
                                    </button>
                                </div>

                                {isOutOfStock ? (
                                    <button
                                        type="button"
                                        disabled
                                        className="flex h-12 flex-1 cursor-not-allowed items-center justify-center gap-1.5 rounded-xl bg-neutral-800 px-4 py-3 text-xs font-bold tracking-wider text-neutral-400 uppercase opacity-90 sm:h-auto sm:px-6 sm:py-3"
                                    >
                                        <ShoppingBag className="h-4 w-4 opacity-50" />
                                        <span>Stok Habis (Sold Out)</span>
                                    </button>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={handleAddToCart}
                                        className={`flex h-12 flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-xl px-4 py-3 text-xs font-bold tracking-wider uppercase shadow-sm transition-all duration-150 active:scale-[0.98] sm:h-auto sm:gap-2 sm:px-6 sm:py-3 ${
                                            addedSuccess
                                                ? 'bg-emerald-700 text-white'
                                                : 'bg-brand-700 text-white hover:bg-brand-800 active:bg-brand-900'
                                        }`}
                                    >
                                        {addedSuccess ? (
                                            <>
                                                <CheckCircle2 className="h-4 w-4 text-emerald-200" />
                                                <span>
                                                    Berhasil Ditambahkan!
                                                </span>
                                            </>
                                        ) : (
                                            <>
                                                <ShoppingBag className="hidden h-4 w-4 sm:inline-block" />
                                                <span>
                                                    Tambah ke Keranjang •{' '}
                                                    {formatRupiah(bundleTotal)}
                                                </span>
                                            </>
                                        )}
                                    </button>
                                )}
                            </div>

                            <a
                                href={waUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#349b6c] px-4 py-3 text-xs font-bold tracking-wider text-white uppercase shadow-xs transition hover:bg-[#2a8058]"
                            >
                                <MessageCircle className="h-4 w-4" />
                                <span>Beli Lewat WhatsApp</span>
                            </a>
                        </div>
                    </div>
                </div>

                {bundle.description && (
                    <div className="space-y-2 border-t border-sand-200 pt-8">
                        <h2 className="text-base font-extrabold text-brand-950 sm:text-lg">
                            Deskripsi Produk Bundling
                        </h2>
                        <p className="text-sm leading-relaxed text-brand-700 whitespace-pre-line">
                            {bundle.description}
                        </p>
                    </div>
                )}

                {relatedBundles.length > 0 && (
                    <div className="space-y-4 border-t border-sand-200 pt-8">
                        <h2 className="text-lg font-extrabold text-brand-950 sm:text-xl">
                            Produk Bundling Lainnya
                        </h2>
                        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-6 lg:grid-cols-4">
                            {relatedBundles.map((rb) => (
                                <ProductCard key={rb.id} product={rb} />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </PublicLayout>
    );
}
