import React, { useMemo, useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import {
    CheckCircle2,
    MessageCircle,
    Minus,
    Plus,
    ShoppingBag,
    X,
} from 'lucide-react';
import { PublicLayout } from '@/layouts/public-layout';
import { useCart } from '@/context/cart-context';
import { formatRupiah } from '@/lib/trans';
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
    whatsapp = '6282132095241',
}: {
    bundle: BundleData;
    whatsapp?: string;
}) {
    const { addItem } = useCart();
    const [bundleQty, setBundleQty] = useState(1);
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

    const { normalTotal, bundleTotal, missingRequiredSlots } = useMemo(() => {
        let normal = 0;
        let bundled = 0;
        const missing: BundleSlotData[] = [];

        bundle.slots.forEach((slot) => {
            const chosen = selectedBySlot[slot.id];
            if (chosen) {
                normal += chosen.normal_price * slot.quantity;
                bundled += chosen.bundle_price * slot.quantity;
            } else if (slot.slot_type === 'selectable' && !slot.is_optional) {
                missing.push(slot);
            }
        });

        return {
            normalTotal: normal * bundleQty,
            bundleTotal: bundled * bundleQty,
            missingRequiredSlots: missing,
        };
    }, [bundle.slots, selectedBySlot, bundleQty]);

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
                `Mohon pilih produk untuk slot wajib: ${missingRequiredSlots.map((s) => s.title).join(', ')}`,
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
                slot.quantity * bundleQty,
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
                return `- ${slot.title}: ${chosen.product_name} (${chosen.variant_label}) x${slot.quantity * bundleQty} = ${chosen.bundle_price === 0 ? 'GRATIS' : formatRupiah(chosen.bundle_price * slot.quantity * bundleQty)}`;
            })
            .filter(Boolean)
            .join('\n');

        const msg = `Halo Alat Kopi Malang!\nSaya tertarik memesan paket bundling:\n*${bundle.name}* (${bundleQty}x paket)\n\nRincian pilihan:\n${lines || '(Belum dipilih)'}\n\nTotal Paket: *${formatRupiah(bundleTotal)}*`;
        return `https://wa.me/${whatsapp}?text=${encodeURIComponent(msg)}`;
    }, [bundle, selectedBySlot, bundleQty, bundleTotal, whatsapp]);

    return (
        <PublicLayout title={bundle.name}>
            <Head title={bundle.name} />

            <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:py-10">
                {/* Banner */}
                {bundle.banner_image && (
                    <div className="mb-5 overflow-hidden rounded-2xl border border-sand-200 bg-white shadow-xs">
                        <img
                            src={resolveImg(bundle.banner_image)}
                            alt={bundle.name}
                            className="w-full max-h-[420px] object-cover"
                        />
                    </div>
                )}

                {/* Breadcrumb */}
                <nav className="mb-3 flex flex-wrap items-center gap-1.5 text-xs font-medium text-brand-700">
                    <Link href="/" className="hover:underline">
                        Beranda
                    </Link>
                    <span>/</span>
                    <Link href="/paket-bundling" className="hover:underline">
                        Paket Bundling
                    </Link>
                    <span>/</span>
                    <span className="font-bold text-brand-950">
                        {bundle.name}
                    </span>
                </nav>

                {/* Title & Description */}
                <h1 className="text-2xl font-black text-brand-950 sm:text-3xl">
                    {bundle.name}
                </h1>
                {bundle.description && (
                    <p className="mt-2 text-sm text-brand-700">
                        {bundle.description}
                    </p>
                )}

                {/* Qty & Action Buttons (like video) */}
                <div className="mt-5 space-y-2.5">
                    <div className="flex items-center gap-3">
                        <span className="text-xs font-bold tracking-wider text-brand-700 uppercase">
                            Jumlah Paket:
                        </span>
                        <div className="inline-flex items-center rounded-lg border border-sand-300 bg-white">
                            <button
                                type="button"
                                onClick={() =>
                                    setBundleQty(Math.max(1, bundleQty - 1))
                                }
                                className="px-2.5 py-1.5 text-brand-800 hover:bg-sand-100"
                            >
                                <Minus className="h-3.5 w-3.5" />
                            </button>
                            <span className="w-10 text-center text-sm font-bold text-brand-950">
                                {bundleQty}
                            </span>
                            <button
                                type="button"
                                onClick={() => setBundleQty(bundleQty + 1)}
                                className="px-2.5 py-1.5 text-brand-800 hover:bg-sand-100"
                            >
                                <Plus className="h-3.5 w-3.5" />
                            </button>
                        </div>
                    </div>

                    {errorMsg && (
                        <div className="rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-xs font-semibold text-rose-700">
                            {errorMsg}
                        </div>
                    )}

                    <button
                        type="button"
                        onClick={handleBuyNow}
                        className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#2c7a8c] px-4 py-3 text-sm font-bold text-white shadow-xs transition hover:bg-[#236372] active:scale-[0.99]"
                    >
                        {addedSuccess ? (
                            <>
                                <CheckCircle2 className="h-4 w-4" />
                                <span>Ditambahkan ke Keranjang!</span>
                            </>
                        ) : (
                            <>
                                <ShoppingBag className="h-4 w-4" />
                                <span>Beli Sekarang</span>
                            </>
                        )}
                    </button>

                    <a
                        href={waUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#349b6c] px-4 py-3 text-sm font-bold text-white shadow-xs transition hover:bg-[#2a8058]"
                    >
                        <MessageCircle className="h-4 w-4" />
                        <span>Beli Lewat WhatsApp</span>
                    </a>
                </div>

                {/* 3-Column Bundling Slots Grid */}
                <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
                    {bundle.slots.map((slot) => {
                        const chosen = selectedBySlot[slot.id];
                        const isFree = slot.slot_type === 'free';

                        return (
                            <div
                                key={slot.id}
                                onClick={() => {
                                    if (!isFree) {
                                        setActiveModalSlot(slot);
                                    }
                                }}
                                className={`relative flex min-h-[175px] flex-col items-center justify-between overflow-hidden rounded-xl border bg-white p-3 text-center shadow-2xs transition ${
                                    isFree
                                        ? 'border-sand-200'
                                        : 'cursor-pointer border-sand-300 hover:border-brand-700 hover:shadow-md'
                                }`}
                            >
                                {/* OPTIONAL Corner Ribbon */}
                                {slot.is_optional && !isFree && (
                                    <span className="absolute top-2.5 -left-6 z-10 -rotate-45 bg-rose-600 px-7 py-0.5 text-[9px] font-black tracking-wider text-white uppercase shadow-xs">
                                        OPTIONAL
                                    </span>
                                )}

                                {/* Clear button on selected selectable slot */}
                                {!isFree && chosen && (
                                    <button
                                        type="button"
                                        onClick={(e) =>
                                            handleClearSlot(slot.id, e)
                                        }
                                        className="absolute top-1.5 right-1.5 z-10 rounded-full bg-gray-100 p-1 text-gray-500 hover:bg-rose-100 hover:text-rose-600"
                                        title="Hapus pilihan"
                                    >
                                        <X className="h-3.5 w-3.5" />
                                    </button>
                                )}

                                {chosen ? (
                                    <>
                                        <div className="flex h-24 w-full items-center justify-center overflow-hidden rounded-lg bg-sand-50">
                                            <img
                                                src={resolveImg(chosen.image)}
                                                alt={chosen.product_name}
                                                className="h-full w-full object-contain p-1"
                                            />
                                        </div>
                                        <div className="mt-2 w-full">
                                            <div className="line-clamp-2 text-[11px] font-bold leading-snug text-brand-950">
                                                {chosen.product_name}
                                            </div>
                                            {isFree ? (
                                                <div className="mt-1">
                                                    <span className="block text-[10px] font-extrabold text-emerald-700 uppercase">
                                                        GRATIS
                                                    </span>
                                                    <span className="text-[11px] text-gray-400 line-through">
                                                        {formatRupiah(
                                                            chosen.normal_price,
                                                        )}
                                                    </span>{' '}
                                                    <span className="text-xs font-extrabold text-rose-600">
                                                        Rp0
                                                    </span>
                                                </div>
                                            ) : (
                                                <div className="mt-1">
                                                    {chosen.normal_price >
                                                        chosen.bundle_price && (
                                                        <span className="block text-[10px] text-gray-400 line-through">
                                                            {formatRupiah(
                                                                chosen.normal_price,
                                                            )}
                                                        </span>
                                                    )}
                                                    <span className="text-xs font-extrabold text-brand-950">
                                                        {formatRupiah(
                                                            chosen.bundle_price,
                                                        )}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </>
                                ) : (
                                    <div className="flex flex-1 flex-col items-center justify-center py-4">
                                        <Plus className="h-7 w-7 text-brand-900 stroke-[2.2]" />
                                        <span className="mt-2 text-xs font-bold text-brand-900">
                                            Please select a product!
                                        </span>
                                        <span className="mt-0.5 text-[10px] font-medium text-brand-600">
                                            {slot.title}
                                        </span>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Breakdown Summary List (like video bottom table) */}
                <div className="mt-6 overflow-hidden rounded-xl border border-sand-200 bg-white shadow-2xs">
                    <div className="divide-y divide-sand-100 text-xs sm:text-sm">
                        {bundle.slots.map((slot) => {
                            const chosen = selectedBySlot[slot.id];
                            const isFree = slot.slot_type === 'free';

                            return (
                                <div
                                    key={slot.id}
                                    onClick={() => {
                                        if (!isFree) setActiveModalSlot(slot);
                                    }}
                                    className={`flex items-center justify-between gap-3 px-4 py-2.5 ${
                                        !isFree
                                            ? 'cursor-pointer hover:bg-sand-50'
                                            : ''
                                    }`}
                                >
                                    <div className="min-w-0 flex-1">
                                        {chosen ? (
                                            <span className="font-semibold text-sky-700">
                                                {chosen.product_name}
                                                {chosen.variant_label &&
                                                chosen.variant_label !==
                                                    'Standard'
                                                    ? ` (${chosen.variant_label})`
                                                    : ''}
                                            </span>
                                        ) : (
                                            <span className="font-medium text-gray-600">
                                                Please select your product! (
                                                {slot.title})
                                                {slot.is_optional && (
                                                    <span className="ml-1.5 rounded bg-rose-600 px-1.5 py-0.5 text-[9px] font-bold text-white uppercase">
                                                        OPTIONAL
                                                    </span>
                                                )}
                                            </span>
                                        )}
                                    </div>

                                    <div className="w-12 text-center font-semibold text-gray-700">
                                        {chosen
                                            ? slot.quantity * bundleQty
                                            : '---'}
                                    </div>

                                    <div className="w-32 text-right">
                                        {chosen ? (
                                            <div>
                                                {chosen.normal_price >
                                                    chosen.bundle_price && (
                                                    <span className="block text-[10px] text-rose-500 line-through">
                                                        {formatRupiah(
                                                            chosen.normal_price *
                                                                slot.quantity *
                                                                bundleQty,
                                                        )}
                                                    </span>
                                                )}
                                                <span className="font-bold text-brand-950">
                                                    {formatRupiah(
                                                        chosen.bundle_price *
                                                            slot.quantity *
                                                            bundleQty,
                                                    )}
                                                </span>
                                            </div>
                                        ) : (
                                            <span className="text-gray-400">
                                                ---
                                            </span>
                                        )}
                                    </div>
                                </div>
                            );
                        })}

                        <div className="flex items-center justify-between bg-sand-50 px-4 py-3 font-bold">
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

            {/* Product Picker Modal ("Please Select Your Product") */}
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
                                    Please Select Your Product
                                </h3>
                                <p className="text-xs text-gray-500">
                                    {activeModalSlot.title}
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setActiveModalSlot(null)}
                                className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="grid grid-cols-2 gap-3 overflow-y-auto p-4 sm:gap-4">
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
                                        className={`relative flex flex-col justify-between rounded-xl border p-3 text-center transition ${
                                            opt.is_out_of_stock
                                                ? 'cursor-not-allowed border-gray-200 bg-gray-50 opacity-75'
                                                : isSelected
                                                  ? 'cursor-pointer border-sky-600 bg-sky-50/40 ring-2 ring-sky-600'
                                                  : 'cursor-pointer border-gray-200 bg-white hover:border-brand-700 hover:shadow-md'
                                        }`}
                                    >
                                        <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-gray-50">
                                            <img
                                                src={resolveImg(opt.image)}
                                                alt={opt.product_name}
                                                className={`h-full w-full object-contain p-2 ${
                                                    opt.is_out_of_stock
                                                        ? 'grayscale opacity-50'
                                                        : ''
                                                }`}
                                            />
                                            {opt.is_out_of_stock && (
                                                <div className="absolute inset-0 flex items-center justify-center bg-black/25">
                                                    <span className="-rotate-12 border-2 border-rose-600 bg-white/95 px-2.5 py-1 text-xs font-black tracking-widest text-rose-600 uppercase shadow-sm">
                                                        OUT OF STOCK
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="mt-2.5">
                                            <div className="line-clamp-2 text-xs font-bold text-gray-900">
                                                {opt.product_name}
                                                {opt.variant_label &&
                                                opt.variant_label !== 'Standard'
                                                    ? ` (${opt.variant_label})`
                                                    : ''}
                                            </div>
                                            <div className="mt-1 text-xs">
                                                {opt.normal_price >
                                                    opt.bundle_price && (
                                                    <span className="mr-1 text-rose-500 line-through">
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
