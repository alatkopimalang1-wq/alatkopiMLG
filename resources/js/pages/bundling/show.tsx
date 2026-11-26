import React, { useMemo, useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import {
    ArrowLeft,
    CheckCircle2,
    MessageCircle,
    Minus,
    Package,
    Plus,
    ShoppingBag,
    Sparkles,
    X,
} from 'lucide-react';
import { PublicLayout } from '@/layouts/public-layout';
import { useCart } from '@/context/cart-context';
import { formatRupiah } from '@/lib/trans';
import { ProductCard } from '@/components/product-card';
import { ImageZoom } from '@animate-ui/react/primitives/effects/image-zoom';
import { SlidingNumber } from '@animate-ui/react/primitives/texts/sliding-number';
import type { Product, ProductVariant } from '@/types/sanubari';

interface BundleSlotItemData {
    id: number;
    bundle_slot_id?: number;
    bundle_slot_item_id?: number | null;
    product_id: number;
    product_name: string;
    product_slug: string;
    variant_id: number;
    variant_label: string;
    image?: string | null;
    normal_price: number;
    bundle_price: number;
    is_preorder: boolean;
    stock: number;
    is_out_of_stock: boolean;
    product: Product;
    variant: ProductVariant;
}

interface BundleSlotData {
    id: number;
    title: string;
    slot_type: 'selectable' | 'free';
    discount_percent?: number;
    is_optional: boolean;
    quantity: number;
    items: BundleSlotItemData[];
}

interface BundleData {
    id: number;
    name: string;
    slug: string;
    description?: string | null;
    banner_image?: string | null;
    slots: BundleSlotData[];
}

export default function BundlingShow({
    bundle,
    relatedBundles = [],
    whatsapp = '6282132095241',
}: {
    bundle: BundleData;
    relatedBundles?: Product[];
    whatsapp?: string;
}) {
    const { addItem } = useCart();
    const [bundleQty, setBundleQty] = useState(1);
    const [selectedImageIdx, setSelectedImageIdx] = useState(0);
    const [selectedBySlot, setSelectedBySlot] = useState<
        Record<number, BundleSlotItemData | null>
    >(() => {
        const init: Record<number, BundleSlotItemData | null> = {};
        bundle.slots.forEach((slot) => {
            if (slot.slot_type === 'free' && slot.items.length > 0) {
                init[slot.id] = slot.items[0];
            } else {
                init[slot.id] = null;
            }
        });
        return init;
    });
    const [slotQtyBySlot, setSlotQtyBySlot] = useState<Record<number, number>>(
        () => {
            const init: Record<number, number> = {};
            bundle.slots.forEach((slot) => {
                init[slot.id] = Math.max(1, slot.quantity || 1);
            });
            return init;
        },
    );
    const [activeModalSlot, setActiveModalSlot] =
        useState<BundleSlotData | null>(null);
    const [errorMsg, setErrorMsg] = useState('');
    const [addedSuccess, setAddedSuccess] = useState(false);

    const resolveImg = (path?: string | null) => {
        if (!path) return '/brand/logo-circle.png';
        if (path.startsWith('http://') || path.startsWith('https://'))
            return path;
        return `/storage/${path.replace(/^\/?(public\/|storage\/)?/, '')}`;
    };

    // Build gallery images from bundle banner + selected items
    const galleryImages = useMemo(() => {
        const imgs: { url: string; label: string }[] = [];
        if (bundle.banner_image) {
            imgs.push({
                url: resolveImg(bundle.banner_image),
                label: bundle.name,
            });
        }
        bundle.slots.forEach((slot) => {
            const chosen = selectedBySlot[slot.id];
            if (chosen?.image) {
                const url = resolveImg(chosen.image);
                if (!imgs.some((i) => i.url === url)) {
                    imgs.push({
                        url,
                        label: chosen.product_name,
                    });
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
    }, [bundle.banner_image, bundle.name, bundle.slots, selectedBySlot]);

    const activeImage =
        galleryImages[selectedImageIdx] || galleryImages[0];

    const { normalTotal, bundleTotal, missingRequiredSlots, hasSelection, startingPrice } =
        useMemo(() => {
            let normal = 0;
            let bundled = 0;
            let minStart = 0;
            let chosenCount = 0;
            const missing: BundleSlotData[] = [];

            bundle.slots.forEach((slot) => {
                const chosen = selectedBySlot[slot.id];
                const sQty = slotQtyBySlot[slot.id] ?? 1;
                if (chosen) {
                    chosenCount += 1;
                    normal += chosen.normal_price * sQty;
                    bundled += chosen.bundle_price * sQty;
                } else if (slot.slot_type === 'selectable' && !slot.is_optional) {
                    missing.push(slot);
                }

                if (slot.slot_type === 'selectable' && !slot.is_optional && slot.items.length > 0) {
                    const cheapest = Math.min(
                        ...slot.items.map((i) => i.bundle_price),
                    );
                    if (Number.isFinite(cheapest)) {
                        minStart += cheapest;
                    }
                }
            });

            return {
                normalTotal: normal * bundleQty,
                bundleTotal: bundled * bundleQty,
                missingRequiredSlots: missing,
                hasSelection: chosenCount > 0,
                startingPrice: minStart,
            };
        }, [bundle.slots, selectedBySlot, slotQtyBySlot, bundleQty]);

    const savingsAmount = Math.max(0, normalTotal - bundleTotal);
    const savingsPercent =
        normalTotal > bundleTotal && normalTotal > 0
            ? Math.round(((normalTotal - bundleTotal) / normalTotal) * 100)
            : null;

    const handleSelectOption = (
        slot: BundleSlotData,
        option: BundleSlotItemData,
    ) => {
        if (option.is_out_of_stock) return;
        setSelectedBySlot((prev) => ({ ...prev, [slot.id]: option }));
        setActiveModalSlot(null);
        setErrorMsg('');
    };

    const handleClearSlot = (slotId: number, e: React.MouseEvent) => {
        e.stopPropagation();
        setSelectedBySlot((prev) => ({ ...prev, [slotId]: null }));
    };

    const handleBuyNow = () => {
        if (missingRequiredSlots.length > 0) {
            setErrorMsg(
                `Mohon pilih produk untuk: ${missingRequiredSlots.map((s) => s.title).join(', ')}`,
            );
            return;
        }

        const chosenEntries = bundle.slots
            .map((slot) => ({ slot, item: selectedBySlot[slot.id] }))
            .filter((entry) => entry.item !== null) as {
            slot: BundleSlotData;
            item: BundleSlotItemData;
        }[];

        if (chosenEntries.length === 0) {
            setErrorMsg('Minimal pilih 1 produk terlebih dahulu.');
            return;
        }

        chosenEntries.forEach(({ slot, item }) => {
            const sQty = slotQtyBySlot[slot.id] ?? 1;
            const variantWithBundlePrice: ProductVariant = {
                ...item.variant,
                price: item.bundle_price,
                original_price:
                    item.normal_price > item.bundle_price
                        ? item.normal_price
                        : item.variant.original_price,
            };
            addItem(
                item.product,
                variantWithBundlePrice,
                sQty * bundleQty,
                '',
                `Paket Bundling: ${bundle.name} (${slot.title})`,
                undefined,
                item.bundle_slot_item_id ?? undefined,
                item.bundle_slot_id ?? slot.id,
            );
        });

        setAddedSuccess(true);
        setTimeout(() => {
            setAddedSuccess(false);
            router.visit('/keranjang');
        }, 500);
    };

    const waUrl = useMemo(() => {
        const lines = bundle.slots
            .map((slot) => {
                const chosen = selectedBySlot[slot.id];
                if (!chosen) return null;
                const sQty = slotQtyBySlot[slot.id] ?? 1;
                return `- ${slot.title}: ${chosen.product_name} (${chosen.variant_label}) x${sQty * bundleQty} = ${chosen.bundle_price === 0 ? 'GRATIS' : formatRupiah(chosen.bundle_price * sQty * bundleQty)}`;
            })
            .filter(Boolean)
            .join('\n');

        const msg = `Halo Alat Kopi Malang!\nSaya tertarik memesan paket bundling:\n*${bundle.name}* (${bundleQty}x paket)\n\nRincian pilihan:\n${lines || '(Belum dipilih)'}\n\nTotal Paket: *${formatRupiah(bundleTotal)}*`;
        return `https://wa.me/${whatsapp}?text=${encodeURIComponent(msg)}`;
    }, [bundle, selectedBySlot, slotQtyBySlot, bundleQty, bundleTotal, whatsapp]);

    return (
        <PublicLayout title={bundle.name}>
            <Head title={bundle.name} />

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

                {/* Main Product-Style 2-Column Layout */}
                <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-12">
                    {/* Left Column: Square Product Image Gallery */}
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
                                    className="h-full w-full object-cover"
                                />
                            </ImageZoom>

                            {savingsPercent ? (
                                <span className="pointer-events-none absolute top-4 left-4 rounded-lg bg-accent-copper px-3 py-1 text-xs font-bold tracking-wider text-white uppercase shadow-sm">
                                    Bundling · Hemat {savingsPercent}%
                                </span>
                            ) : (
                                <span className="pointer-events-none absolute top-4 left-4 rounded-lg bg-accent-copper px-3 py-1 text-xs font-bold tracking-wider text-white uppercase shadow-sm">
                                    Paket Bundling
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

                    {/* Right Column: Product Info, Customizer & Purchase Actions */}
                    <div className="space-y-6 lg:col-span-6">
                        <div>
                            <div className="mb-2.5 flex flex-wrap items-center gap-2">
                                <span className="inline-flex items-center gap-1.5 rounded-md bg-amber-100 px-2.5 py-1 text-[11px] font-extrabold tracking-wider text-amber-900 uppercase">
                                    <Package className="h-3.5 w-3.5" />
                                    Paket Custom · Diskon Khusus
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

                        {/* Price Display (Just like regular product) */}
                        <div className="space-y-1">
                            {normalTotal > bundleTotal && (
                                <span className="block text-sm font-medium text-gray-400 line-through md:text-base">
                                    {formatRupiah(normalTotal)}
                                </span>
                            )}
                            <div className="flex flex-wrap items-baseline gap-2.5">
                                {hasSelection ? (
                                    <span className="text-3xl font-black tracking-tight text-brand-950 md:text-4xl">
                                        {formatRupiah(bundleTotal)}
                                    </span>
                                ) : (
                                    <div className="flex flex-wrap items-baseline gap-2">
                                        <span className="text-sm font-semibold text-brand-600">
                                            Mulai dari
                                        </span>
                                        <span className="text-3xl font-black tracking-tight text-brand-950 md:text-4xl">
                                            {formatRupiah(startingPrice)}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Custom Product Slot Picker (replaces Variant Selection) */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <label className="block text-sm font-bold tracking-wider text-brand-800 uppercase">
                                    Kustomisasi Isi Paket:
                                </label>
                                <span className="text-xs font-medium text-accent-copper">
                                    Pilih produk &amp; atur jumlah sesuai kebutuhan
                                </span>
                            </div>

                            <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
                                {bundle.slots.map((slot) => {
                                    const chosen = selectedBySlot[slot.id];
                                    const isFree = slot.slot_type === 'free';
                                    const slotDiscount =
                                        slot.discount_percent ?? 0;

                                    return (
                                        <div
                                            key={slot.id}
                                            onClick={() => {
                                                if (!isFree) {
                                                    setActiveModalSlot(slot);
                                                }
                                            }}
                                            className={`relative flex min-h-[125px] flex-col items-center justify-between overflow-hidden rounded-xl border bg-white p-1.5 text-center transition sm:min-h-[145px] sm:p-2 ${
                                                isFree
                                                    ? 'border-sand-200'
                                                    : chosen
                                                      ? 'cursor-pointer border-brand-600 shadow-2xs ring-1 ring-brand-600/20 hover:shadow-md'
                                                      : 'cursor-pointer border-sand-300 hover:border-brand-700 hover:shadow-md'
                                            }`}
                                        >
                                            {/* OPTIONAL Corner Ribbon */}
                                            {slot.is_optional && !isFree && (
                                                <span className="absolute top-1.5 -left-7 z-10 -rotate-45 bg-rose-600 px-7 py-0.5 text-[7px] font-black tracking-wider text-white uppercase shadow-xs sm:text-[8px]">
                                                    OPTIONAL
                                                </span>
                                            )}

                                            {/* Discount / Free Pill */}
                                            {isFree ? (
                                                <span className="absolute top-1 left-1 z-10 rounded-full bg-emerald-100 px-1.5 py-0.5 text-[8px] font-extrabold text-emerald-800 uppercase">
                                                    GRATIS
                                                </span>
                                            ) : slotDiscount > 0 ? (
                                                <span
                                                    className={`absolute top-1 z-10 rounded-full bg-amber-100 px-1.5 py-0.5 text-[8px] font-extrabold text-amber-900 ${
                                                        slot.is_optional
                                                            ? 'right-6'
                                                            : 'left-1'
                                                    }`}
                                                >
                                                    -{slotDiscount}%
                                                </span>
                                            ) : null}

                                            {/* Clear button on selected selectable slot */}
                                            {!isFree && chosen && (
                                                <button
                                                    type="button"
                                                    onClick={(e) =>
                                                        handleClearSlot(
                                                            slot.id,
                                                            e,
                                                        )
                                                    }
                                                    className="absolute top-1 right-1 z-10 rounded-full bg-gray-100 p-0.5 text-gray-500 hover:bg-rose-100 hover:text-rose-600"
                                                    title="Hapus pilihan"
                                                >
                                                    <X className="h-3 w-3" />
                                                </button>
                                            )}

                                            {chosen ? (
                                                <>
                                                    <div className="mt-4 flex h-12 w-full items-center justify-center overflow-hidden rounded-lg bg-sand-50 sm:h-14">
                                                        <img
                                                            src={resolveImg(
                                                                chosen.image,
                                                            )}
                                                            alt={
                                                                chosen.product_name
                                                            }
                                                            className="h-full w-full object-contain p-0.5"
                                                        />
                                                    </div>

                                                    <div className="mt-1 w-full">
                                                        <div className="line-clamp-2 text-[10px] leading-tight font-bold text-brand-950 sm:text-[11px]">
                                                            {
                                                                chosen.product_name
                                                            }
                                                        </div>
                                                        <div className="mt-0.5">
                                                            {chosen.normal_price >
                                                                chosen.bundle_price && (
                                                                <span className="block text-[9px] text-gray-400 line-through">
                                                                    {formatRupiah(
                                                                        chosen.normal_price,
                                                                    )}
                                                                </span>
                                                            )}
                                                            <span
                                                                className={`text-[10px] font-extrabold sm:text-[11px] ${
                                                                    isFree
                                                                        ? 'text-emerald-700'
                                                                        : 'text-brand-950'
                                                                }`}
                                                            >
                                                                {isFree
                                                                    ? 'Rp0'
                                                                    : formatRupiah(
                                                                          chosen.bundle_price,
                                                                      )}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    {/* Qty Stepper inside box */}
                                                    <div
                                                        className="mt-1 inline-flex items-center rounded-md border border-sand-200 bg-sand-50/70"
                                                        onClick={(e) =>
                                                            e.stopPropagation()
                                                        }
                                                    >
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                setSlotQtyBySlot(
                                                                    (prev) => ({
                                                                        ...prev,
                                                                        [slot.id]:
                                                                            Math.max(
                                                                                1,
                                                                                (prev[
                                                                                    slot
                                                                                        .id
                                                                                ] ??
                                                                                    1) -
                                                                                    1,
                                                                            ),
                                                                    }),
                                                                )
                                                            }
                                                            className="px-1 py-0.5 text-brand-800 hover:bg-sand-200/60"
                                                        >
                                                            <Minus className="h-2.5 w-2.5" />
                                                        </button>
                                                        <span className="w-5 text-center text-[10px] font-bold text-brand-950">
                                                            {slotQtyBySlot[
                                                                slot.id
                                                            ] ?? 1}
                                                        </span>
                                                        <button
                                                            type="button"
                                                            disabled={
                                                                !chosen.is_preorder &&
                                                                chosen.stock >
                                                                    0 &&
                                                                (slotQtyBySlot[
                                                                    slot.id
                                                                ] ?? 1) >=
                                                                    chosen.stock
                                                            }
                                                            onClick={() =>
                                                                setSlotQtyBySlot(
                                                                    (prev) => ({
                                                                        ...prev,
                                                                        [slot.id]:
                                                                            (prev[
                                                                                slot
                                                                                    .id
                                                                            ] ??
                                                                                1) +
                                                                            1,
                                                                    }),
                                                                )
                                                            }
                                                            className="px-1 py-0.5 text-brand-800 hover:bg-sand-200/60 disabled:opacity-40"
                                                        >
                                                            <Plus className="h-2.5 w-2.5" />
                                                        </button>
                                                    </div>
                                                </>
                                            ) : (
                                                <div className="flex w-full flex-1 flex-col items-center justify-between">
                                                    <div className="flex aspect-square w-full items-center justify-center rounded-lg bg-neutral-100">
                                                        <Plus className="h-5 w-5 stroke-[1.8] text-brand-900" />
                                                    </div>
                                                    <span className="mt-1.5 line-clamp-2 text-[10px] font-bold text-brand-950 sm:text-[11px]">
                                                        {slot.title}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {errorMsg && (
                            <div className="rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-xs font-semibold text-rose-700">
                                {errorMsg}
                            </div>
                        )}

                        {/* Quantity Stepper & Add to Cart (Matching regular product) */}
                        <div className="space-y-3 pt-1">
                            <div className="flex items-center gap-2.5 sm:gap-3">
                                <div className="flex h-12 items-center rounded-xl border border-sand-200 bg-white p-1 sm:h-auto">
                                    <button
                                        type="button"
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
                                        onClick={() =>
                                            setBundleQty(bundleQty + 1)
                                        }
                                        className="flex h-full w-9 items-center justify-center rounded-lg text-brand-800 transition-colors hover:bg-sand-100 sm:h-8 sm:w-8"
                                    >
                                        <Plus className="h-3.5 w-3.5" />
                                    </button>
                                </div>

                                <button
                                    type="button"
                                    onClick={handleBuyNow}
                                    className={`flex h-12 flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-xl px-4 py-3 text-xs font-bold tracking-wider uppercase shadow-sm transition-all duration-150 active:scale-[0.98] sm:h-auto sm:gap-2 sm:px-6 sm:py-3 ${
                                        addedSuccess
                                            ? 'bg-emerald-700 text-white'
                                            : 'bg-brand-700 text-white hover:bg-brand-800 active:bg-brand-900'
                                    }`}
                                >
                                    {addedSuccess ? (
                                        <>
                                            <CheckCircle2 className="h-4 w-4 text-emerald-200" />
                                            <span>Berhasil Ditambahkan!</span>
                                        </>
                                    ) : (
                                        <>
                                            <ShoppingBag className="hidden h-4 w-4 sm:inline-block" />
                                            <span>
                                                Tambah ke Keranjang
                                                {bundleTotal > 0
                                                    ? ` • ${formatRupiah(bundleTotal)}`
                                                    : ''}
                                            </span>
                                        </>
                                    )}
                                </button>
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

                {/* Description & Breakdown Summary (Below 2-column grid, like regular product) */}
                <div className="grid grid-cols-1 gap-6 border-t border-sand-200 pt-8 lg:grid-cols-12">
                    {bundle.description && (
                        <div className="space-y-2 lg:col-span-5">
                            <h2 className="text-base font-extrabold text-brand-950 sm:text-lg">
                                Tentang Paket Ini
                            </h2>
                            <p className="text-sm leading-relaxed text-brand-700 whitespace-pre-line">
                                {bundle.description}
                            </p>
                        </div>
                    )}

                    <div
                        className={
                            bundle.description
                                ? 'lg:col-span-7'
                                : 'lg:col-span-12'
                        }
                    >
                        <h2 className="mb-3 text-base font-extrabold text-brand-950 sm:text-lg">
                            Ringkasan Item Paket ({bundleQty}x Paket)
                        </h2>
                        <div className="overflow-hidden rounded-2xl border border-sand-200 bg-white shadow-2xs">
                            <div className="divide-y divide-sand-100 text-xs sm:text-sm">
                                {bundle.slots.map((slot) => {
                                    const chosen = selectedBySlot[slot.id];
                                    const qtyTotal =
                                        (slotQtyBySlot[slot.id] ?? 1) *
                                        bundleQty;

                                    return (
                                        <div
                                            key={slot.id}
                                            className="flex items-center justify-between gap-3 px-4 py-3"
                                        >
                                            <div className="min-w-0 flex-1">
                                                <span className="text-[11px] font-semibold text-brand-500 uppercase">
                                                    {slot.title}
                                                </span>
                                                <div className="font-semibold text-brand-950">
                                                    {chosen
                                                        ? `${chosen.product_name}${chosen.variant_label && chosen.variant_label !== 'Standard' ? ` (${chosen.variant_label})` : ''}`
                                                        : 'Belum dipilih'}
                                                </div>
                                            </div>
                                            <div className="w-16 text-center font-bold text-brand-800">
                                                {chosen ? `${qtyTotal}x` : '—'}
                                            </div>
                                            <div className="w-32 text-right">
                                                {chosen ? (
                                                    <div>
                                                        {chosen.normal_price >
                                                            chosen.bundle_price && (
                                                            <span className="block text-[10px] text-rose-500 line-through">
                                                                {formatRupiah(
                                                                    chosen.normal_price *
                                                                        qtyTotal,
                                                                )}
                                                            </span>
                                                        )}
                                                        <span className="font-bold text-brand-950">
                                                            {chosen.bundle_price ===
                                                            0
                                                                ? 'GRATIS'
                                                                : formatRupiah(
                                                                      chosen.bundle_price *
                                                                          qtyTotal,
                                                                  )}
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-400">
                                                        —
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}

                                <div className="flex items-center justify-between bg-sand-50 px-4 py-3.5 font-bold">
                                    <span className="text-brand-950">
                                        Total Harga Paket ({bundleQty}x)
                                    </span>
                                    <div className="text-right">
                                        {normalTotal > bundleTotal && (
                                            <span className="mr-2 text-xs font-medium text-gray-400 line-through">
                                                {formatRupiah(normalTotal)}
                                            </span>
                                        )}
                                        <span className="text-base font-black text-brand-950">
                                            {formatRupiah(bundleTotal)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Related Bundles (Matching regular product related section) */}
                {relatedBundles.length > 0 && (
                    <div className="space-y-4 border-t border-sand-200 pt-8">
                        <h2 className="text-lg font-extrabold text-brand-950 sm:text-xl">
                            Paket Bundling Lainnya
                        </h2>
                        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-6 lg:grid-cols-4">
                            {relatedBundles.map((rb) => (
                                <ProductCard key={rb.id} product={rb} />
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Product Picker Modal */}
            {activeModalSlot && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs"
                    onClick={() => setActiveModalSlot(null)}
                >
                    <div
                        className="flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-3.5">
                            <div>
                                <h3 className="text-base font-bold text-gray-900">
                                    Pilih Produk — {activeModalSlot.title}
                                </h3>
                                {(activeModalSlot.discount_percent ?? 0) > 0 && (
                                    <p className="text-xs font-semibold text-emerald-700">
                                        Diskon khusus bundling{' '}
                                        {activeModalSlot.discount_percent}%
                                    </p>
                                )}
                            </div>
                            <button
                                type="button"
                                onClick={() => setActiveModalSlot(null)}
                                className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="grid grid-cols-3 gap-2.5 overflow-y-auto p-3.5 sm:gap-3 sm:p-4">
                            {activeModalSlot.items.map((opt) => {
                                const isSelected =
                                    selectedBySlot[activeModalSlot.id]?.id ===
                                    opt.id;
                                return (
                                    <div
                                        key={opt.id}
                                        onClick={() =>
                                            handleSelectOption(
                                                activeModalSlot,
                                                opt,
                                            )
                                        }
                                        className={`relative flex flex-col justify-between rounded-xl border p-2 text-center transition ${
                                            opt.is_out_of_stock
                                                ? 'cursor-not-allowed border-gray-200 bg-gray-50 opacity-75'
                                                : isSelected
                                                  ? 'cursor-pointer border-brand-700 bg-sand-50 ring-2 ring-brand-700'
                                                  : 'cursor-pointer border-gray-200 bg-white hover:border-brand-700 hover:shadow-md'
                                        }`}
                                    >
                                        <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-gray-50">
                                            <img
                                                src={resolveImg(opt.image)}
                                                alt={opt.product_name}
                                                className={`h-full w-full object-cover ${
                                                    opt.is_out_of_stock
                                                        ? 'grayscale opacity-50'
                                                        : ''
                                                }`}
                                            />
                                            {opt.is_out_of_stock && (
                                                <div className="absolute inset-0 flex items-center justify-center bg-black/25">
                                                    <span className="-rotate-12 border-2 border-rose-600 bg-white/95 px-2 py-0.5 text-[10px] font-black tracking-widest text-rose-600 uppercase shadow-sm">
                                                        STOK HABIS
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="mt-2">
                                            <div className="line-clamp-2 text-[11px] font-bold leading-snug text-gray-900 sm:text-xs">
                                                {opt.product_name}
                                                {opt.variant_label &&
                                                opt.variant_label !== 'Standard'
                                                    ? ` (${opt.variant_label})`
                                                    : ''}
                                            </div>
                                            <div className="mt-1 text-[11px] sm:text-xs">
                                                {opt.normal_price >
                                                    opt.bundle_price && (
                                                    <span className="block text-[10px] text-rose-500 line-through">
                                                        {formatRupiah(
                                                            opt.normal_price,
                                                        )}
                                                    </span>
                                                )}
                                                <span className="font-extrabold text-gray-900">
                                                    {formatRupiah(
                                                        opt.bundle_price,
                                                    )}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}
        </PublicLayout>
    );
}
