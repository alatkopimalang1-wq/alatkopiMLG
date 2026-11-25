import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import {
    ArrowLeft,
    CheckCircle2,
    ChevronLeft,
    ChevronRight,
    Clock,
    Coffee,
    Droplet,
    Flame,
    Heart,
    Info,
    MapPin,
    Minus,
    Mountain,
    Package,
    Plus,
    Share2,
    ShoppingBag,
    Star,
    Truck,
} from 'lucide-react';
import { PublicLayout } from '@/layouts/public-layout';
import type { Product, ProductVariant } from '@/types/sanubari';
import { formatRupiah } from '@/lib/trans';
import { useCart } from '@/context/cart-context';
import { ProductCard } from '@/components/product-card';
import { getProductContentId, trackViewContent } from '@/lib/meta-pixel';
import { ImageZoom } from '@animate-ui/react/primitives/effects/image-zoom';
import { SlidingNumber } from '@animate-ui/react/primitives/texts/sliding-number';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

interface ProductShowProps {
    product: Product;
    relatedProducts: Product[];
    marketplaceDefaults?: {
        tokopedia?: string;
        shopee?: string;
    };
}

function TokopediaIcon({ className = 'w-5 h-5' }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none">
            <path
                d="M5 8.5C5 7.67 5.67 7 6.5 7h11c.83 0 1.5.67 1.5 1.5V18c0 1.66-1.34 3-3 3H8c-1.66 0-3-1.34-3-3V8.5z"
                fill="#03AC0E"
            />
            <path
                d="M9 7V5.5C9 3.84 10.34 2.5 12 2.5s3 1.34 3 2.5V7"
                stroke="#03AC0E"
                strokeWidth="2"
                strokeLinecap="round"
            />
            <circle cx="9.5" cy="13" r="2.2" fill="white" />
            <circle cx="9.5" cy="13" r="1.1" fill="#03AC0E" />
            <circle cx="14.5" cy="13" r="2.2" fill="white" />
            <circle cx="14.5" cy="13" r="1.1" fill="#03AC0E" />
            <path
                d="M10.8 16.2c.7.4 1.7.4 2.4 0"
                stroke="white"
                strokeWidth="1.2"
                strokeLinecap="round"
            />
        </svg>
    );
}

function ShopeeIcon({ className = 'w-5 h-5' }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none">
            <path
                d="M5 8.5C5 7.67 5.67 7 6.5 7h11c.83 0 1.5.67 1.5 1.5V18c0 1.66-1.34 3-3 3H8c-1.66 0-3-1.34-3-3V8.5z"
                fill="#EE4D2D"
            />
            <path
                d="M9 7V5.5C9 3.84 10.34 2.5 12 2.5s3 1.34 3 2.5V7"
                stroke="#EE4D2D"
                strokeWidth="2"
                strokeLinecap="round"
            />
            <path
                d="M13.6 11.2c-.2-.4-.6-.7-1.3-.8-.8-.1-1.4.2-1.4.7 0 .4.4.6 1 .8l.5.2c1.1.3 1.6.8 1.6 1.7 0 1.1-.9 1.9-2.3 1.9-1.3 0-2.1-.7-2.3-1.6l1.2-.3c.1.5.5.8 1.1.8.6 0 1-.3 1-.7 0-.3-.3-.6-.9-.7l-.5-.2c-1-.3-1.5-.8-1.5-1.6 0-1.1.9-1.8 2.1-1.8 1.1 0 1.8.5 2.1 1.3l-1.1.4z"
                fill="white"
            />
        </svg>
    );
}

const resolveImageUrl = (path: string | undefined | null) => {
    if (!path) return '/brand/logo-circle.png';
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    const clean = path.replace(/^\/?(public\/|storage\/)?/, '');
    return `/storage/${clean}`;
};

export default function ProductShow({
    product,
    relatedProducts = [],
    marketplaceDefaults,
}: ProductShowProps) {
    const { addItem } = useCart();

    const variants =
        product.variants && product.variants.length > 0
            ? product.variants
            : [
                  {
                      id: product.id,
                      product_id: product.id,
                      label: '200 gr',
                      weight_grams: 200,
                      price: product.min_price || 45000,
                      stock_status: 'in_stock' as const,
                  },
              ];

    const [selectedVariant, setSelectedVariant] = useState<ProductVariant>(
        variants[0],
    );
    const [selectedImage, setSelectedImage] = useState(0);
    const [quantity, setQuantity] = useState(1);
    const [grindOption, setGrindOption] = useState('Biji Utuh (Whole Bean)');

    // Track Meta Pixel ViewContent
    useEffect(() => {
        try {
            const contentId = getProductContentId(product, selectedVariant);
            trackViewContent({
                content_ids: [contentId],
                content_type: 'product',
                value: Number(selectedVariant?.price || product.min_price || 0),
                currency: 'IDR',
                content_name: product.name,
                content_category: product.series || 'Coffee',
            });
        } catch (e) {
            console.error('Meta Pixel ViewContent error', e);
        }
    }, [product.id, selectedVariant.id]);

    // Combined unified gallery: Product images + all Variant packaging images
    const combinedImages = useMemo(() => {
        const list: {
            url: string;
            alt: string;
            isVariant: boolean;
            variantId?: number;
            variantLabel?: string;
        }[] = [];
        const seen = new Set<string>();

        // 1. Add product gallery images
        if (product.images && product.images.length > 0) {
            for (const img of product.images) {
                const resolved = resolveImageUrl(img.path);
                if (!seen.has(resolved)) {
                    seen.add(resolved);
                    list.push({
                        url: resolved,
                        alt: img.alt || product.name,
                        isVariant: false,
                    });
                }
            }
        }

        // 2. Combine all variant packaging photos
        if (variants && variants.length > 0) {
            for (const v of variants) {
                const vUrl =
                    v.image_url || (v.image ? resolveImageUrl(v.image) : null);
                if (vUrl && !seen.has(vUrl)) {
                    seen.add(vUrl);
                    list.push({
                        url: vUrl,
                        alt: `Kemasan ${v.label} - ${product.name}`,
                        isVariant: true,
                        variantId: v.id,
                        variantLabel: v.label,
                    });
                }
            }
        }

        if (list.length === 0) {
            list.push({
                url: '/brand/logo-circle.png',
                alt: product.name,
                isVariant: false,
            });
        }

        return list;
    }, [product.images, product.name, variants]);

    const activeImageItem = combinedImages[selectedImage] || combinedImages[0];

    const mobileScrollRef = useRef<HTMLDivElement>(null);

    const scrollToMobileImage = (idx: number) => {
        setSelectedImage(idx);
        if (mobileScrollRef.current) {
            const container = mobileScrollRef.current;
            container.scrollTo({
                left: idx * container.clientWidth,
                behavior: 'smooth',
            });
        }
    };

    const handleMobileScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const target = e.currentTarget;
        if (target.clientWidth > 0) {
            const index = Math.round(target.scrollLeft / target.clientWidth);
            if (
                index !== selectedImage &&
                index >= 0 &&
                index < combinedImages.length
            ) {
                setSelectedImage(index);
                const img = combinedImages[index];
                if (img?.isVariant && img.variantId) {
                    const match = variants.find((v) => v.id === img.variantId);
                    if (match) setSelectedVariant(match);
                }
            }
        }
    };

    const nextMobileImage = () => {
        const nextIdx = (selectedImage + 1) % combinedImages.length;
        scrollToMobileImage(nextIdx);
    };

    const prevMobileImage = () => {
        const prevIdx =
            (selectedImage - 1 + combinedImages.length) % combinedImages.length;
        scrollToMobileImage(prevIdx);
    };

    const grindOptions = [
        'Biji Utuh (Whole Bean)',
        'Giling Kasar (Cold Brew, French Press)',
        'Giling Sedang (V60, Kalita, Aeropress)',
        'Giling Halus (Espresso, Moka Pot)',
        'Giling Sangat Halus (Tubruk Tradisional)',
    ];

    const isDiscounted =
        !!selectedVariant.original_price &&
        selectedVariant.original_price > selectedVariant.price;
    const discountPercent = isDiscounted
        ? Math.round(
              ((selectedVariant.original_price! - selectedVariant.price) /
                  selectedVariant.original_price!) *
                  100,
          )
        : null;

    const [isAdded, setIsAdded] = useState(false);

    const isProductOutOfStock = Boolean(
        product.is_out_of_stock ||
        product.stock_status === 'out_of_stock' ||
        (variants.length > 0 &&
            variants.every((v) => v.stock_status === 'out_of_stock')),
    );
    const isCurrentVariantOutOfStock =
        isProductOutOfStock || selectedVariant.stock_status === 'out_of_stock';

    const handleAddToCart = () => {
        if (isCurrentVariantOutOfStock) return;
        addItem(product, selectedVariant, quantity, grindOption);
        setIsAdded(true);
        setTimeout(() => setIsAdded(false), 1400);
    };

    const waDirectUrl = isCurrentVariantOutOfStock
        ? `https://wa.me/6285121930454?text=${encodeURIComponent(
              `Halo Alat Kopi Malang! Saya ingin menanyakan ketersediaan restock produk:\n*${product.name}*\nUkuran: ${selectedVariant.label}\n\nMohon info estimasi ready stock kembali. Terima kasih!`,
          )}`
        : `https://wa.me/6285121930454?text=${encodeURIComponent(
              `Halo Alat Kopi Malang! Saya ingin memesan langsung:\n*${product.name}*\nUkuran: ${selectedVariant.label}\nGilingan: ${grindOption}\nJumlah: ${quantity}x (${formatRupiah(selectedVariant.price * quantity)})\n\nMohon info ketersediaan stok & ongkir ke alamat saya. Terima kasih!`,
          )}`;

    const tokopediaUrl =
        product.tokopedia_url ||
        marketplaceDefaults?.tokopedia ||
        'https://www.tokopedia.com/sanubariroastery';
    const shopeeUrl =
        product.shopee_url ||
        marketplaceDefaults?.shopee ||
        'https://shopee.co.id/sanubariroastery';

    return (
        <PublicLayout title={product.name}>
            <div className="mx-auto max-w-7xl space-y-6 px-2.5 py-4 sm:space-y-8 sm:px-6 sm:py-6 lg:px-8">
                {/* Back Link */}
                <div className="hidden sm:block">
                    <Link
                        href="/shop"
                        className="inline-flex items-center gap-1.5 text-xs text-brand-500 transition-colors hover:text-brand-900"
                    >
                        <ArrowLeft className="h-3.5 w-3.5" />
                        <span>Kembali ke Katalog</span>
                    </Link>
                </div>

                {/* Main Product Layout */}
                <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-12">
                    {/* Left Column: Image Gallery (5 cols) */}
                    <div className="space-y-4 lg:col-span-6">
                        {/* Mobile Image Slider (< sm) */}
                        <div className="relative aspect-square w-full overflow-hidden rounded-2xl border border-sand-200 bg-white shadow-sm sm:hidden">
                            <div
                                ref={mobileScrollRef}
                                onScroll={handleMobileScroll}
                                className="no-scrollbar flex h-full w-full snap-x snap-mandatory overflow-x-auto scroll-smooth"
                            >
                                {combinedImages.map((imgItem, idx) => (
                                    <div
                                        key={idx}
                                        className="relative h-full w-full flex-shrink-0 snap-center"
                                    >
                                        <img
                                            src={imgItem.url}
                                            alt={imgItem.alt || product.name}
                                            className={`h-full w-full object-cover ${isProductOutOfStock ? 'brightness-50 contrast-125 grayscale filter' : ''}`}
                                        />
                                        {isProductOutOfStock && (
                                            <div className="pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/60 p-3 backdrop-blur-[1px]">
                                                <span className="rounded-lg border border-white/40 bg-black/90 px-4 py-1.5 text-sm font-black tracking-widest text-white uppercase shadow-xl">
                                                    SOLD OUT
                                                </span>
                                                <span className="mt-1 text-xs font-medium text-white/80">
                                                    Stok Habis
                                                </span>
                                            </div>
                                        )}
                                        {imgItem.isVariant && (
                                            <span className="pointer-events-none absolute bottom-4 left-4 flex items-center gap-1.5 rounded-lg bg-brand-950/80 px-3 py-1 text-[11px] font-semibold text-white shadow-sm backdrop-blur-md">
                                                <Package className="h-3.5 w-3.5 text-accent-copper" />
                                                Kemasan{' '}
                                                {imgItem.variantLabel ||
                                                    selectedVariant.label}
                                            </span>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {/* Flash Sale / Discount / SOLD OUT Badge */}
                            {isProductOutOfStock ? (
                                <span className="pointer-events-none absolute top-4 left-4 z-20 rounded-lg border border-white/20 bg-black px-3 py-1 text-xs font-black tracking-wider text-white uppercase shadow-sm">
                                    SOLD OUT
                                </span>
                            ) : product.is_flash_sale ? (
                                <span className="pointer-events-none absolute top-4 left-4 rounded-lg bg-[#e03131] px-3 py-1 text-xs font-bold tracking-wider text-white uppercase shadow-sm">
                                    Flash Sale
                                </span>
                            ) : discountPercent ? (
                                <span className="pointer-events-none absolute top-4 left-4 rounded-lg bg-accent-copper px-3 py-1 text-xs font-bold tracking-wider text-white uppercase shadow-sm">
                                    Hemat {discountPercent}%
                                </span>
                            ) : null}

                            {/* Floating Prev/Next Buttons for Mobile */}
                            {combinedImages.length > 1 && (
                                <>
                                    <button
                                        type="button"
                                        onClick={prevMobileImage}
                                        aria-label="Gambar sebelumnya"
                                        className="absolute top-1/2 left-2.5 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-brand-950 shadow-md backdrop-blur-xs transition active:scale-90"
                                    >
                                        <ChevronLeft className="h-4 w-4 text-brand-900" />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={nextMobileImage}
                                        aria-label="Gambar berikutnya"
                                        className="absolute top-1/2 right-2.5 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-brand-950 shadow-md backdrop-blur-xs transition active:scale-90"
                                    >
                                        <ChevronRight className="h-4 w-4 text-brand-900" />
                                    </button>

                                    {/* Slide Counter Pill */}
                                    <div className="pointer-events-none absolute right-3 bottom-3 z-10 rounded-full bg-brand-950/75 px-2.5 py-1 text-[11px] font-semibold text-white tabular-nums shadow-xs backdrop-blur-md">
                                        {selectedImage + 1} /{' '}
                                        {combinedImages.length}
                                    </div>

                                    {/* Dot Indicators */}
                                    <div className="pointer-events-none absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 items-center gap-1.5">
                                        {combinedImages.map((_, idx) => (
                                            <span
                                                key={idx}
                                                className={`h-1.5 rounded-full transition-all duration-300 ${
                                                    selectedImage === idx
                                                        ? 'w-5 bg-accent-copper'
                                                        : 'w-1.5 bg-white/70 shadow-xs'
                                                }`}
                                            />
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Desktop Image View (>= sm) */}
                        <div className="hidden space-y-4 sm:block">
                            {/* Main Image with Animate UI ImageZoom */}
                            <div className="relative aspect-square w-full overflow-hidden rounded-2xl border border-sand-200 bg-white shadow-sm">
                                <ImageZoom
                                    zoomScale={1.6}
                                    zoomOnHover
                                    className="h-full w-full"
                                >
                                    <img
                                        src={activeImageItem.url}
                                        alt={
                                            activeImageItem.alt || product.name
                                        }
                                        className={`h-full w-full object-cover ${isProductOutOfStock ? 'brightness-50 contrast-125 grayscale filter' : ''}`}
                                    />
                                </ImageZoom>
                                {isProductOutOfStock && (
                                    <div className="pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/60 p-4 backdrop-blur-[1px]">
                                        <span className="rounded-lg border border-white/40 bg-black/90 px-5 py-2 text-base font-black tracking-widest text-white uppercase shadow-xl">
                                            SOLD OUT
                                        </span>
                                        <span className="mt-1.5 text-xs font-medium text-white/80 sm:text-sm">
                                            Stok Habis
                                        </span>
                                    </div>
                                )}
                                {isProductOutOfStock ? (
                                    <span className="pointer-events-none absolute top-4 left-4 z-20 rounded-lg border border-white/20 bg-black px-3 py-1 text-xs font-black tracking-wider text-white uppercase shadow-sm">
                                        SOLD OUT
                                    </span>
                                ) : product.is_flash_sale ? (
                                    <span className="pointer-events-none absolute top-4 left-4 rounded-lg bg-[#e03131] px-3 py-1 text-xs font-bold tracking-wider text-white uppercase shadow-sm">
                                        Flash Sale
                                    </span>
                                ) : discountPercent ? (
                                    <span className="pointer-events-none absolute top-4 left-4 rounded-lg bg-accent-copper px-3 py-1 text-xs font-bold tracking-wider text-white uppercase shadow-sm">
                                        Hemat {discountPercent}%
                                    </span>
                                ) : null}
                                {activeImageItem.isVariant && (
                                    <span className="pointer-events-none absolute bottom-4 left-4 flex items-center gap-1.5 rounded-lg bg-brand-950/80 px-3 py-1 text-[11px] font-semibold text-white shadow-sm backdrop-blur-md">
                                        <Package className="h-3.5 w-3.5 text-accent-copper" />
                                        Kemasan{' '}
                                        {activeImageItem.variantLabel ||
                                            selectedVariant.label}
                                    </span>
                                )}
                            </div>

                            {/* Thumbnails (Desktop Only) */}
                            {combinedImages.length > 1 && (
                                <div className="no-scrollbar flex items-center gap-3 overflow-x-auto pb-1">
                                    {combinedImages.map((imgItem, idx) => (
                                        <button
                                            key={idx}
                                            type="button"
                                            onClick={() => {
                                                setSelectedImage(idx);
                                                if (
                                                    imgItem.isVariant &&
                                                    imgItem.variantId
                                                ) {
                                                    const match = variants.find(
                                                        (v) =>
                                                            v.id ===
                                                            imgItem.variantId,
                                                    );
                                                    if (match)
                                                        setSelectedVariant(
                                                            match,
                                                        );
                                                }
                                            }}
                                            className={`relative h-18 w-18 flex-shrink-0 cursor-pointer overflow-hidden rounded-xl border-2 transition-all ${
                                                selectedImage === idx
                                                    ? 'scale-102 border-brand-700 shadow-md ring-2 ring-brand-700/30'
                                                    : 'border-sand-200/80 opacity-70 hover:border-brand-400 hover:opacity-100'
                                            }`}
                                        >
                                            <img
                                                src={imgItem.url}
                                                alt={imgItem.alt}
                                                className="h-full w-full object-cover"
                                            />
                                            {imgItem.isVariant && (
                                                <span className="absolute inset-x-0 bottom-0 truncate bg-brand-950/80 px-1 py-0.5 text-center text-[9px] font-medium text-white">
                                                    {imgItem.variantLabel}
                                                </span>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column: Product Info & Purchase Options (7 cols) */}
                    <div className="space-y-6 lg:col-span-6">
                        <div>
                            {isProductOutOfStock && (
                                <div className="mb-2.5">
                                    <span className="inline-flex items-center gap-1.5 rounded-md border border-white/20 bg-black px-3 py-1 text-xs font-black tracking-widest text-white uppercase shadow-xs">
                                        <span className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
                                        <span>STOK HABIS (SOLD OUT)</span>
                                    </span>
                                </div>
                            )}
                            <h1 className="text-2xl leading-tight font-extrabold tracking-tight text-brand-950 sm:text-3xl">
                                {product.name}
                            </h1>

                            {/* Tasting Notes */}
                            {product.tasting_notes && (
                                <div className="mt-2 flex flex-wrap gap-1.5 sm:mt-3">
                                    {product.tasting_notes
                                        .split(',')
                                        .map((note, i) => (
                                            <span
                                                key={i}
                                                className="rounded-full border border-sand-200/50 bg-sand-200/60 px-2.5 py-0.5 text-[11px] font-medium text-brand-900 sm:px-3 sm:py-1 sm:text-xs"
                                            >
                                                {note.trim()}
                                            </span>
                                        ))}
                                </div>
                            )}
                        </div>

                        {/* Price Display */}
                        <div className="space-y-1">
                            {isDiscounted && (
                                <span className="block text-sm font-medium text-gray-400 line-through sm:text-sm md:text-base">
                                    {formatRupiah(
                                        selectedVariant.original_price!,
                                    )}
                                </span>
                            )}
                            <div className="flex items-baseline gap-2">
                                <span
                                    className={`text-3xl font-black tracking-tight sm:text-3xl md:text-4xl ${
                                        isCurrentVariantOutOfStock
                                            ? 'text-neutral-500'
                                            : 'text-brand-950'
                                    }`}
                                >
                                    {formatRupiah(selectedVariant.price)}
                                </span>
                                <span className="text-sm font-medium text-brand-600 sm:text-sm md:text-base">
                                    / {selectedVariant.label}
                                </span>
                            </div>
                        </div>

                        {/* Variant Selection */}
                        <div className="space-y-2">
                            <label className="block text-sm font-bold tracking-wider text-brand-800 uppercase sm:text-sm md:text-base">
                                Pilih Ukuran Kemasan:
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {variants.map((v) => {
                                    const active = selectedVariant.id === v.id;
                                    const vOutOfStock =
                                        isProductOutOfStock ||
                                        v.stock_status === 'out_of_stock';
                                    const vImage =
                                        v.image_url ||
                                        (v.image
                                            ? resolveImageUrl(v.image)
                                            : null);
                                    return (
                                        <button
                                            key={v.id}
                                            type="button"
                                            onClick={() => {
                                                setSelectedVariant(v);
                                                const targetIdx =
                                                    combinedImages.findIndex(
                                                        (img) =>
                                                            img.isVariant &&
                                                            img.variantId ===
                                                                v.id,
                                                    );
                                                if (targetIdx !== -1) {
                                                    scrollToMobileImage(
                                                        targetIdx,
                                                    );
                                                }
                                            }}
                                            className={`inline-flex cursor-pointer items-center gap-2 rounded-xl px-3.5 py-2.5 text-sm font-bold transition-all sm:text-sm md:text-base ${
                                                active
                                                    ? 'bg-brand-700 text-white shadow-sm ring-2 ring-brand-700'
                                                    : 'border border-sand-200 bg-white text-brand-800 hover:bg-cream-100'
                                            } ${vOutOfStock ? 'line-through decoration-neutral-500 opacity-60' : ''}`}
                                        >
                                            {vImage && (
                                                <img
                                                    src={vImage}
                                                    alt={v.label}
                                                    className="h-5 w-5 flex-shrink-0 rounded-md border border-sand-300 object-cover"
                                                />
                                            )}
                                            <span>
                                                {v.label}{' '}
                                                {vOutOfStock ? '(Habis)' : ''}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Grind Size Selection */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <label className="block text-sm font-bold tracking-wider text-brand-800 uppercase sm:text-sm md:text-base">
                                    Pilihan Gilingan:
                                </label>
                                <span className="text-xs font-medium text-accent-copper sm:text-xs md:text-sm">
                                    Gratis giling sesuai metode seduh
                                </span>
                            </div>
                            <Select
                                value={grindOption}
                                onValueChange={setGrindOption}
                            >
                                <SelectTrigger className="flex h-auto w-full cursor-pointer items-center justify-between rounded-xl border border-sand-200 bg-white px-3.5 py-2.5 text-sm font-semibold text-brand-950 shadow-xs focus:border-brand-700 focus:outline-hidden sm:text-sm md:text-base">
                                    <SelectValue placeholder="Pilih tingkat gilingan" />
                                </SelectTrigger>
                                <SelectContent className="z-50 rounded-xl border border-sand-200 bg-white p-1.5 shadow-xl">
                                    {grindOptions.map((opt) => (
                                        <SelectItem
                                            key={opt}
                                            value={opt}
                                            className="cursor-pointer rounded-lg bg-transparent px-3 py-2.5 text-sm font-medium text-brand-900 transition-colors hover:bg-transparent hover:text-accent-copper focus:bg-transparent focus:text-accent-copper data-[highlighted]:bg-transparent data-[highlighted]:text-accent-copper data-[state=checked]:font-bold data-[state=checked]:text-brand-950 sm:text-sm md:text-base"
                                        >
                                            {opt}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Quantity Stepper & Add to Cart */}
                        <div className="space-y-3 pt-2">
                            <div className="flex items-center gap-2.5 sm:gap-3">
                                {/* Stepper */}
                                <div
                                    className={`flex h-12 items-center rounded-xl border border-sand-200 bg-white p-1 sm:h-auto ${
                                        isCurrentVariantOutOfStock
                                            ? 'pointer-events-none opacity-50'
                                            : ''
                                    }`}
                                >
                                    <button
                                        type="button"
                                        disabled={isCurrentVariantOutOfStock}
                                        onClick={() =>
                                            setQuantity(
                                                Math.max(1, quantity - 1),
                                            )
                                        }
                                        className="hover:bg-sand-100 flex h-full w-9 items-center justify-center rounded-lg text-brand-800 transition-colors disabled:cursor-not-allowed sm:h-8 sm:w-8"
                                    >
                                        <Minus className="h-3.5 w-3.5" />
                                    </button>
                                    <span className="flex w-9 items-center justify-center text-center text-sm font-bold text-brand-950 sm:w-10">
                                        <SlidingNumber number={quantity} />
                                    </span>
                                    <button
                                        type="button"
                                        disabled={isCurrentVariantOutOfStock}
                                        onClick={() =>
                                            setQuantity(quantity + 1)
                                        }
                                        className="hover:bg-sand-100 flex h-full w-9 items-center justify-center rounded-lg text-brand-800 transition-colors disabled:cursor-not-allowed sm:h-8 sm:w-8"
                                    >
                                        <Plus className="h-3.5 w-3.5" />
                                    </button>
                                </div>

                                {/* Add to Cart with Animate UI Status Button pattern */}
                                {isCurrentVariantOutOfStock ? (
                                    <button
                                        type="button"
                                        disabled
                                        className="flex h-12 flex-1 cursor-not-allowed items-center justify-center gap-1.5 rounded-xl bg-neutral-800 px-4 py-3 text-xs font-bold tracking-wider text-neutral-400 uppercase opacity-90 shadow-none sm:h-auto sm:gap-2 sm:px-6 sm:py-3"
                                    >
                                        <ShoppingBag className="h-4 w-4 opacity-50" />
                                        <span>Stok Habis (Sold Out)</span>
                                    </button>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={handleAddToCart}
                                        className={`flex h-12 flex-1 items-center justify-center gap-1.5 rounded-xl px-4 py-3 text-xs font-bold tracking-wider uppercase shadow-sm transition-all duration-150 active:scale-[0.98] sm:h-auto sm:gap-2 sm:px-6 sm:py-3 ${
                                            isAdded
                                                ? 'bg-emerald-700 text-white'
                                                : 'bg-brand-700 text-white hover:bg-brand-800 active:bg-brand-900'
                                        }`}
                                    >
                                        {isAdded ? (
                                            <>
                                                <CheckCircle2 className="h-4 w-4 text-emerald-200" />
                                                <span>
                                                    Berhasil Ditambahkan!
                                                </span>
                                            </>
                                        ) : (
                                            <>
                                                <ShoppingBag className="hidden h-4 w-4 sm:inline-block" />
                                                <span className="text-xs font-extrabold tracking-wide whitespace-nowrap sm:hidden">
                                                    Tambah ke Keranjang
                                                </span>
                                                <span className="hidden sm:inline">
                                                    Tambah ke Keranjang •{' '}
                                                    {formatRupiah(
                                                        selectedVariant.price *
                                                            quantity,
                                                    )}
                                                </span>
                                            </>
                                        )}
                                    </button>
                                )}
                            </div>

                            {/* Direct WhatsApp Instant Buy / Restock Inquiry */}
                            <a
                                href={waDirectUrl}
                                target="_blank"
                                rel="noreferrer"
                                className={`flex h-12 w-full items-center justify-center gap-2 rounded-xl border px-4 py-3 text-xs font-bold tracking-wider uppercase transition-all sm:h-auto sm:px-6 sm:py-3 ${
                                    isCurrentVariantOutOfStock
                                        ? 'bg-sand-100 border-sand-300 text-brand-800 hover:bg-sand-200'
                                        : 'border-brand-700 bg-white text-brand-700 hover:bg-cream-100'
                                }`}
                            >
                                <span>
                                    {isCurrentVariantOutOfStock
                                        ? 'Tanyakan Restock via WhatsApp'
                                        : 'Pesan Langsung via WhatsApp'}
                                </span>
                            </a>
                        </div>

                        {/* Marketplace Availability Box */}
                        <div className="rounded-2xl border border-sand-200/90 bg-[#f8f9fa] p-3.5 sm:p-5">
                            <div className="mb-3 flex items-center justify-between sm:mb-3.5">
                                <div className="flex items-center gap-1.5 sm:gap-2">
                                    <svg
                                        className="h-4.5 w-4.5 flex-shrink-0 text-brand-900 sm:h-5 sm:w-5"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    >
                                        <rect
                                            x="3"
                                            y="4"
                                            width="18"
                                            height="16"
                                            rx="3"
                                        />
                                        <path d="M3 9h18" />
                                        <path d="M9 13a3 3 0 0 0 6 0" />
                                    </svg>
                                    <h4 className="text-xs font-bold text-brand-950 sm:text-sm md:text-base">
                                        Produk Ini Tersedia di:
                                    </h4>
                                </div>
                                <span className="flex-shrink-0 rounded-full border border-indigo-100 bg-indigo-50 px-2 py-0.5 text-[9.5px] font-black tracking-wider text-indigo-600 uppercase sm:px-2.5 sm:text-xs">
                                    TOKO RESMI
                                </span>
                            </div>

                            <div className="grid grid-cols-2 gap-2.5">
                                <a
                                    href={tokopediaUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex min-w-0 items-center justify-start gap-2.5 rounded-2xl border border-sand-200/90 bg-white px-3.5 py-2.5 text-xs font-bold text-brand-950 shadow-2xs transition-all duration-150 hover:border-brand-400 hover:bg-cream-50 hover:shadow-sm sm:text-sm md:text-base"
                                >
                                    <TokopediaIcon className="h-6 w-6 flex-shrink-0" />
                                    <span className="truncate whitespace-nowrap">
                                        Tokopedia
                                    </span>
                                </a>

                                <a
                                    href={shopeeUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex min-w-0 items-center justify-start gap-2.5 rounded-2xl border border-sand-200/90 bg-white px-3.5 py-2.5 text-xs font-bold text-brand-950 shadow-2xs transition-all duration-150 hover:border-brand-400 hover:bg-cream-50 hover:shadow-sm sm:text-sm md:text-base"
                                >
                                    <ShopeeIcon className="h-6 w-6 flex-shrink-0" />
                                    <span className="truncate whitespace-nowrap">
                                        Shopee
                                    </span>
                                </a>
                            </div>
                        </div>

                        {/* Technical Spec Tiles (NiR Style At-a-glance Specs) */}
                        <div className="space-y-3.5 border-t border-sand-200 pt-6">
                            <h3 className="text-sm font-bold tracking-wider text-accent-copper uppercase sm:text-sm md:text-base">
                                Spesifikasi Kopi (Terroir & Profil)
                            </h3>
                            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3.5">
                                <div className="rounded-xl border border-sand-200/90 bg-white p-3.5 shadow-2xs sm:p-4 md:rounded-2xl">
                                    <span className="block text-xs font-semibold tracking-wider text-brand-400 uppercase sm:text-xs md:text-sm">
                                        Origin
                                    </span>
                                    <span className="mt-1 block text-sm leading-snug font-bold text-brand-950 sm:text-base md:text-base">
                                        {product.origin ||
                                            'G. Kawi, Malang, Jawa Timur'}
                                    </span>
                                </div>
                                <div className="rounded-xl border border-sand-200/90 bg-white p-3.5 shadow-2xs sm:p-4 md:rounded-2xl">
                                    <span className="block text-xs font-semibold tracking-wider text-brand-400 uppercase sm:text-xs md:text-sm">
                                        Varietas
                                    </span>
                                    <span className="mt-1 block text-sm leading-snug font-bold text-brand-950 sm:text-base md:text-base">
                                        {product.varietal || 'Mix Varietals'}
                                    </span>
                                </div>
                                <div className="rounded-xl border border-sand-200/90 bg-white p-3.5 shadow-2xs sm:p-4 md:rounded-2xl">
                                    <span className="block text-xs font-semibold tracking-wider text-brand-400 uppercase sm:text-xs md:text-sm">
                                        Proses
                                    </span>
                                    <span className="mt-1 block text-sm leading-snug font-bold text-brand-950 sm:text-base md:text-base">
                                        {product.process || 'Natural'}
                                    </span>
                                </div>
                                <div className="rounded-xl border border-sand-200/90 bg-white p-3.5 shadow-2xs sm:p-4 md:rounded-2xl">
                                    <span className="block text-xs font-semibold tracking-wider text-brand-400 uppercase sm:text-xs md:text-sm">
                                        Ketinggian
                                    </span>
                                    <span className="mt-1 block text-sm leading-snug font-bold text-brand-950 sm:text-base md:text-base">
                                        {product.altitude || '1.400 MASL'}
                                    </span>
                                </div>
                                <div className="rounded-xl border border-sand-200/90 bg-white p-3.5 shadow-2xs sm:p-4 md:rounded-2xl">
                                    <span className="block text-xs font-semibold tracking-wider text-brand-400 uppercase sm:text-xs md:text-sm">
                                        Roast Level
                                    </span>
                                    <span className="mt-1 block text-sm leading-snug font-bold text-brand-950 sm:text-base md:text-base">
                                        {product.roast_level ||
                                            'Light to Medium'}
                                    </span>
                                </div>
                                <div className="rounded-xl border border-sand-200/90 bg-white p-3.5 shadow-2xs sm:p-4 md:rounded-2xl">
                                    <span className="block text-xs font-semibold tracking-wider text-brand-400 uppercase sm:text-xs md:text-sm">
                                        Sertifikasi
                                    </span>
                                    <span className="mt-1 block text-sm leading-snug font-bold text-brand-950 sm:text-base md:text-base">
                                        PIRT & Halal
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Description Text */}
                        {product.description && (
                            <div className="space-y-2.5 border-t border-sand-200 pt-5">
                                <h3 className="text-sm font-bold tracking-wider text-accent-copper uppercase sm:text-sm md:text-base">
                                    Catatan Roaster & Deskripsi
                                </h3>
                                <p className="text-sm leading-relaxed font-normal whitespace-pre-line text-brand-800 sm:text-base sm:leading-7 md:text-base md:leading-relaxed">
                                    {typeof product.description === 'string'
                                        ? product.description
                                        : (product.description as any)?.id ||
                                          ''}
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Related Products Section */}
                {relatedProducts.length > 0 && (
                    <div className="space-y-6 border-t border-sand-200 pt-16">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-extrabold text-brand-950">
                                    Biji Kopi Terkait Lainnya
                                </h2>
                                <p className="text-xs text-brand-500">
                                    Eksplorasi rasa lain dari seri{' '}
                                    {product.series_label ||
                                        product.series?.replace('-', ' ')}
                                </p>
                            </div>
                            <Link
                                href="/shop"
                                className="text-xs font-bold text-accent-copper hover:underline"
                            >
                                Lihat Semua
                            </Link>
                        </div>

                        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-6">
                            {relatedProducts.map((p) => (
                                <ProductCard key={p.id} product={p} />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </PublicLayout>
    );
}
