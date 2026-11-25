import React, { useEffect, useMemo, useState } from 'react';
import { Head } from '@inertiajs/react';
import {
    ArrowUpDown,
    Check,
    Minus,
    Plus,
    RotateCcw,
    ShoppingBag,
    SlidersHorizontal,
} from 'lucide-react';
import { PublicLayout } from '@/layouts/public-layout';
import type { Product, ProductVariant } from '@/types/sanubari';
import { formatRupiah } from '@/lib/trans';
import { useCart } from '@/context/cart-context';
import { SlidingNumber } from '@animate-ui/react/primitives/texts/sliding-number';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

interface ByobBeanSetting {
    product_id?: number | null;
    name: string;
    origin?: string;
    process?: string;
    price_per_10g: number;
    cost_price_per_10g?: number | null;
    tasting_notes?: string;
    is_active?: boolean;
}

interface ByobVariantSetting {
    label: string;
    weight_grams: number;
    discount_type?: 'percentage' | 'fixed';
    discount_value?: number;
    discount_percentage?: number;
    is_default?: boolean;
}

interface ByobGrindSetting {
    name: string;
}

export interface ByobSettings {
    hero_title?: string;
    hero_description?: string;
    hero_image?: string | null;
    packshot_image?: string | null;
    studio_title?: string;
    studio_subtitle?: string;
    default_ratio?: number;
    possible_notes_title?: string;
    byob_beans?: ByobBeanSetting[];
    byob_variants?: ByobVariantSetting[];
    byob_grind_options?: ByobGrindSetting[];
}

interface ByobProps {
    beans: Product[];
    byobProduct: Product;
    byobSettings?: ByobSettings | null;
}

const resolveImageUrl = (path?: string | null) => {
    if (!path) return null;
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    const clean = path.replace(/^\/?(storage\/)?/, '');
    return `/storage/${clean}`;
};

export default function ByobPage({
    beans = [],
    byobProduct,
    byobSettings,
}: ByobProps) {
    const { addItem } = useCart();

    // Packaging variants strictly ordered by byobSettings.byob_variants configured in Admin Dashboard
    const variants: ProductVariant[] = useMemo(() => {
        const adminVariants = byobSettings?.byob_variants;
        const dbVariants = byobProduct?.variants || [];

        if (
            adminVariants &&
            Array.isArray(adminVariants) &&
            adminVariants.length > 0
        ) {
            const list: ProductVariant[] = [];
            adminVariants.forEach((adminVar, index) => {
                const weight = Number(adminVar.weight_grams);
                const matchingDbVar = dbVariants.find(
                    (v) => Number(v.weight_grams) === weight,
                );

                list.push({
                    id: matchingDbVar?.id ?? (byobProduct?.id || 9999) + index,
                    product_id: byobProduct?.id || 9999,
                    label:
                        adminVar.label || matchingDbVar?.label || `${weight}g`,
                    weight_grams: weight,
                    price: matchingDbVar?.price || 0,
                    stock_status: matchingDbVar?.stock_status || 'in_stock',
                });
            });

            // Include any variants from DB that were not in the admin setting array
            dbVariants.forEach((dbVar) => {
                if (
                    !list.some(
                        (item) =>
                            Number(item.weight_grams) ===
                            Number(dbVar.weight_grams),
                    )
                ) {
                    list.push(dbVar);
                }
            });

            if (list.length > 0) {
                return list;
            }
        }

        if (dbVariants.length > 0) {
            return dbVariants;
        }

        return [
            {
                id: byobProduct?.id || 9999,
                product_id: byobProduct?.id || 9999,
                label: '200g',
                weight_grams: 200,
                price: 65000,
                stock_status: 'in_stock',
            },
            {
                id: (byobProduct?.id || 9999) + 1,
                product_id: byobProduct?.id || 9999,
                label: '500g',
                weight_grams: 500,
                price: 150000,
                stock_status: 'in_stock',
            },
            {
                id: (byobProduct?.id || 9999) + 2,
                product_id: byobProduct?.id || 9999,
                label: '1 kg',
                weight_grams: 1000,
                price: 275000,
                stock_status: 'in_stock',
            },
        ];
    }, [byobProduct, byobSettings]);

    // Initial bean choices
    const defaultBeanA = useMemo(() => {
        return (
            beans.find(
                (b) => b.slug?.includes('kawi') && b.slug?.includes('honey'),
            ) ||
            beans[0] ||
            null
        );
    }, [beans]);

    const defaultBeanB = useMemo(() => {
        return (
            beans.find(
                (b) =>
                    (b.slug?.includes('dampit') ||
                        b.slug?.includes('robusta')) &&
                    b.id !== defaultBeanA?.id,
            ) ||
            beans.find((b) => b.id !== defaultBeanA?.id) ||
            (beans.length > 1 ? beans[1] : null) ||
            null
        );
    }, [beans, defaultBeanA]);

    const [beanAId, setBeanAId] = useState<number>(defaultBeanA?.id ?? 0);
    const [beanBId, setBeanBId] = useState<number>(defaultBeanB?.id ?? 0);

    // Auto-correct if both beans ever match
    useEffect(() => {
        if (beanAId && beanBId && beanAId === beanBId) {
            const alternative = beans.find((b) => b.id !== beanAId);
            if (alternative) {
                setBeanBId(alternative.id);
            }
        }
    }, [beanAId, beanBId, beans]);

    // Swap beans positions between A and B
    const handleSwapBeans = () => {
        const currentA = beanAId;
        const currentB = beanBId;
        setBeanAId(currentB);
        setBeanBId(currentA);
    };

    // Single unified blend ratio: percentage of Bean A (10% to 90%, step 10%)
    // Bean B percentage is automatically (100 - blendRatio)%
    const [blendRatio, setBlendRatio] = useState<number>(
        byobSettings?.default_ratio ?? 70,
    );

    const initialVariant = useMemo(() => {
        const defaultVarSetting = byobSettings?.byob_variants?.find(
            (v) => v.is_default,
        );
        if (defaultVarSetting) {
            const found = variants.find(
                (v) =>
                    Number(v.weight_grams) ===
                    Number(defaultVarSetting.weight_grams),
            );
            if (found) return found;
        }
        return variants[0];
    }, [variants, byobSettings]);

    const [selectedVariant, setSelectedVariant] =
        useState<ProductVariant>(initialVariant);

    // Keep selectedVariant valid if variants array changes/reorders
    useEffect(() => {
        if (
            !selectedVariant ||
            !variants.some(
                (v) =>
                    Number(v.weight_grams) ===
                    Number(selectedVariant.weight_grams),
            )
        ) {
            setSelectedVariant(initialVariant);
        }
    }, [initialVariant, variants, selectedVariant]);
    const [grindOption, setGrindOption] = useState<string>(
        'Whole Bean (Biji Utuh)',
    );
    const [customBlendName, setCustomBlendName] = useState<string>('');
    const [quantity, setQuantity] = useState<number>(1);
    const [addedSuccess, setAddedSuccess] = useState<boolean>(false);

    // Selected Bean Objects
    const beanA = useMemo(
        () => beans.find((b) => b.id === beanAId) || beans[0],
        [beans, beanAId],
    );
    const beanB = useMemo(
        () =>
            beans.find((b) => b.id === beanBId) ||
            beans.find((b) => b.id !== beanA?.id) ||
            beans[1] ||
            beans[0],
        [beans, beanBId, beanA],
    );

    const ratioA = blendRatio;
    const ratioB = 100 - blendRatio;

    // Price per 10g for Component A & B
    const pricePer10gA = useMemo(() => {
        if (beanA?.price_per_10g && beanA.price_per_10g > 0)
            return beanA.price_per_10g;
        if (beanA?.variants && beanA.variants.length > 0) {
            const v =
                beanA.variants.find(
                    (v) => v.weight_grams >= 100 && v.weight_grams <= 250,
                ) || beanA.variants[0];
            if (v && v.weight_grams > 0 && v.price > 0)
                return Math.round((v.price / v.weight_grams) * 10);
        }
        return beanA?.min_price
            ? Math.round((beanA.min_price / 200) * 10)
            : 3500;
    }, [beanA]);

    const pricePer10gB = useMemo(() => {
        if (beanB?.price_per_10g && beanB.price_per_10g > 0)
            return beanB.price_per_10g;
        if (beanB?.variants && beanB.variants.length > 0) {
            const v =
                beanB.variants.find(
                    (v) => v.weight_grams >= 100 && v.weight_grams <= 250,
                ) || beanB.variants[0];
            if (v && v.weight_grams > 0 && v.price > 0)
                return Math.round((v.price / v.weight_grams) * 10);
        }
        return beanB?.min_price
            ? Math.round((beanB.min_price / 200) * 10)
            : 2000;
    }, [beanB]);

    // Total grams from selected packaging size (e.g. 200g, 500g, 1000g)
    const packageWeightGrams = selectedVariant?.weight_grams || 200;

    // Weight in grams per component according to ratio
    const weightGramsA = Math.round((packageWeightGrams * ratioA) / 100);
    const weightGramsB = packageWeightGrams - weightGramsA;

    // Cost accumulation per component based on rate per 10 grams
    const costComponentA = Math.round((weightGramsA / 10) * pricePer10gA);
    const costComponentB = Math.round((weightGramsB / 10) * pricePer10gB);

    // Blended rate per 10g for reference
    const blendedRatePer10g = Math.round(
        (ratioA * pricePer10gA + ratioB * pricePer10gB) / 100,
    );

    // Normal base price before packaging discount
    const basePricePerBag = costComponentA + costComponentB;

    // Check discount percentage or fixed nominal for selected variant
    const variantSetting = useMemo(() => {
        return byobSettings?.byob_variants?.find(
            (v) => v.weight_grams === packageWeightGrams,
        );
    }, [byobSettings, packageWeightGrams]);

    const { discountAmountPerBag, discountBadge, discountLabel, hasDiscount } =
        useMemo(() => {
            const type = variantSetting?.discount_type ?? 'percentage';
            const val =
                typeof variantSetting?.discount_value === 'number'
                    ? variantSetting.discount_value
                    : typeof variantSetting?.discount_percentage === 'number'
                      ? variantSetting.discount_percentage
                      : packageWeightGrams === 500
                        ? 5
                        : packageWeightGrams === 1000
                          ? 10
                          : 0;

            if (val <= 0) {
                return {
                    discountAmountPerBag: 0,
                    discountBadge: null,
                    discountLabel: '',
                    hasDiscount: false,
                };
            }

            if (type === 'fixed') {
                const amount = Math.min(val, basePricePerBag);
                return {
                    discountAmountPerBag: amount,
                    discountBadge: `Hemat ${formatRupiah(amount)}`,
                    discountLabel: `Potongan ${formatRupiah(amount)}`,
                    hasDiscount: true,
                };
            }

            const amount = Math.round((basePricePerBag * val) / 100);
            return {
                discountAmountPerBag: amount,
                discountBadge: `Diskon ${val}%`,
                discountLabel: `Diskon ${val}%`,
                hasDiscount: true,
            };
        }, [variantSetting, packageWeightGrams, basePricePerBag]);

    // Final price per bag after discount
    const pricePerBag = Math.max(0, basePricePerBag - discountAmountPerBag);

    // Total order price
    const totalPrice = pricePerBag * quantity;
    const baseTotalPrice = basePricePerBag * quantity;

    // Combined Tasting Notes
    const combinedNotes = useMemo(() => {
        const set = new Set<string>();
        const extract = (notesStr?: string | null) => {
            if (!notesStr) return;
            notesStr
                .split(/[,•/]/)
                .map((n) => n.trim())
                .filter(Boolean)
                .forEach((n) => set.add(n));
        };

        if (beanA) extract(beanA.tasting_notes);
        if (beanB) extract(beanB.tasting_notes);

        return Array.from(set).slice(0, 7);
    }, [beanA, beanB]);

    // Grind Options
    const grindOptions = useMemo(() => {
        if (
            byobSettings?.byob_grind_options &&
            byobSettings.byob_grind_options.length > 0
        ) {
            return byobSettings.byob_grind_options.map((g) => g.name);
        }
        return [
            'Whole Bean (Biji Utuh)',
            'Giling Kasar (Cold Brew, French Press)',
            'Giling Medium (V60, Kalita, Filter)',
            'Giling Halus (Mokapot, Aeropress)',
            'Espresso / Tubruk Halus',
        ];
    }, [byobSettings]);

    // Formula string
    const recipeString = useMemo(() => {
        const nameA = beanA?.name || 'Component A';
        const nameB = beanB?.name || 'Component B';
        return `${ratioA}% ${nameA} + ${ratioB}% ${nameB}`;
    }, [beanA, beanB, ratioA, ratioB]);

    const effectiveBlendTitle = customBlendName.trim()
        ? customBlendName.trim()
        : `Custom Blend (${recipeString})`;

    // Check if both selected beans are identical
    const isSameBean = Boolean(beanA && beanB && beanA.id === beanB.id);

    // Add to Cart handler with dynamic accumulated pricing & packaging discount
    const handleAddToCart = () => {
        if (isSameBean) {
            return;
        }
        const dynamicVariant: ProductVariant = {
            ...selectedVariant,
            price: pricePerBag,
        };
        const fullNotes = customBlendName.trim()
            ? `Blend: "${customBlendName.trim()}" | Rasio: ${recipeString}`
            : `Rasio Blend: ${recipeString}`;
        addItem(byobProduct, dynamicVariant, quantity, grindOption, fullNotes);
        setAddedSuccess(true);
        setTimeout(() => setAddedSuccess(false), 2500);
    };

    const renderPackageSizeSelector = (wrapperClassName = '') => (
        <div className={`space-y-1.5 sm:space-y-2.5 ${wrapperClassName}`}>
            <span className="block text-xs font-semibold text-brand-800 sm:text-sm">
                Pilih Ukuran Kemasan:
            </span>
            <div
                className={`grid gap-2 sm:gap-2.5 ${
                    variants.length === 1
                        ? 'grid-cols-1'
                        : variants.length === 2
                          ? 'grid-cols-2'
                          : variants.length === 4
                            ? 'grid-cols-2 sm:grid-cols-4'
                            : 'grid-cols-3'
                }`}
            >
                {variants.map((v) => {
                    const isSelected =
                        selectedVariant?.weight_grams === v.weight_grams ||
                        selectedVariant?.id === v.id;
                    const variantSetting = byobSettings?.byob_variants?.find(
                        (s) =>
                            Number(s.weight_grams) === Number(v.weight_grams),
                    );
                    const discountVal = Number(
                        variantSetting?.discount_value ||
                            variantSetting?.discount_percentage ||
                            0,
                    );
                    const discountType =
                        variantSetting?.discount_type || 'percentage';

                    return (
                        <button
                            key={`${v.id}-${v.weight_grams}`}
                            type="button"
                            onClick={() => setSelectedVariant(v)}
                            className={`cursor-pointer rounded-lg px-2 py-2 text-center transition-colors sm:rounded-xl sm:px-2 sm:py-3 ${
                                isSelected
                                    ? 'bg-brand-900 font-bold text-white shadow-xs'
                                    : 'hover:bg-sand-100 border border-sand-200/60 bg-white text-brand-900'
                            }`}
                        >
                            <span className="block text-xs font-extrabold sm:text-base">
                                {v.label}
                            </span>
                            {discountVal > 0 && (
                                <span
                                    className={`mt-0.5 hidden text-[10px] font-medium sm:block ${
                                        isSelected
                                            ? 'text-accent-copper-light'
                                            : 'text-emerald-700'
                                    }`}
                                >
                                    {discountType === 'fixed'
                                        ? `Hemat Rp ${(discountVal / 1000).toFixed(0)}k`
                                        : `Hemat ${discountVal}%`}
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );

    return (
        <PublicLayout
            title={`${byobSettings?.hero_title || 'C.Y.B.R: Custom Your Blend Ratio'} | Alat Kopi Malang`}
        >
            <Head>
                <meta
                    name="description"
                    content={
                        byobSettings?.hero_description ||
                        'Layanan C.Y.B.R (Custom Your Blend Ratio) Kopi Alat Kopi Malang. Padukan single origin lereng Gunung Kawi dan Nusantara dengan satu slider rasio persentase presisi.'
                    }
                />
            </Head>

            {/* Hero Section */}
            <div className="byob-enter relative overflow-hidden bg-brand-950 text-white">
                <div className="absolute inset-0 z-0">
                    <img
                        src={
                            resolveImageUrl(byobSettings?.hero_image) ||
                            'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=2000&q=85'
                        }
                        alt="Gunung Kawi Coffee Plantation"
                        className="h-full w-full object-cover opacity-25"
                    />
                </div>

                <div className="relative z-10 mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
                    <h1 className="byob-enter text-3xl leading-tight font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
                        {byobSettings?.hero_title ||
                            'C.Y.B.R: Custom Your Blend Ratio'}
                    </h1>
                </div>
            </div>

            <div className="mx-auto max-w-7xl px-3 py-8 sm:px-6 sm:py-12 lg:px-8">
                <div className="grid grid-cols-1 items-start gap-6 sm:gap-8 lg:grid-cols-12">
                    {/* Left Column: Interactive Blending Studio */}
                    <div className="space-y-6 sm:space-y-8 lg:col-span-8">
                        {/* Section 1: Coffee Blend Studio */}
                        <div className="byob-enter space-y-5 rounded-xl bg-cream-50 p-3.5 sm:space-y-8 sm:rounded-2xl sm:p-6 lg:p-8">
                            {/* Studio Header */}
                            <div className="flex items-center justify-between border-b border-sand-200 pb-2">
                                <div>
                                    <h2 className="text-lg font-bold text-brand-950 sm:text-xl">
                                        {byobSettings?.studio_title ||
                                            'Custom Blend Studio'}
                                    </h2>
                                    <p className="text-xs text-brand-700 sm:text-sm">
                                        {byobSettings?.studio_subtitle ||
                                            'Pilih 2 biji kopi dan tentukan proporsi rasio dengan 1 slider persentase.'}
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() =>
                                        setBlendRatio(
                                            byobSettings?.default_ratio ?? 70,
                                        )
                                    }
                                    className="flex shrink-0 items-center gap-1 text-[11px] font-semibold text-brand-700 transition-colors hover:text-brand-950 sm:text-sm"
                                    title="Reset rasio ke standar"
                                >
                                    <RotateCcw className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                                    <span>Reset Rasio</span>
                                </button>
                            </div>

                            {/* Beans Selection: Inline Row on Mobile & Desktop */}
                            <div className="space-y-2 rounded-xl border border-sand-200/90 bg-white p-2.5 shadow-xs sm:space-y-3 sm:rounded-2xl sm:p-5">
                                {/* Component A Row */}
                                <div className="flex items-center gap-2 sm:gap-3.5">
                                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#fca5a5] text-xs font-bold text-[#991b1b] shadow-2xs sm:h-8 sm:w-8 sm:text-sm">
                                        A
                                    </span>
                                    <div className="min-w-0 flex-1">
                                        <Select
                                            value={String(beanAId)}
                                            onValueChange={(val: string) => {
                                                const selectedId = Number(val);
                                                if (selectedId !== beanBId) {
                                                    setBeanAId(selectedId);
                                                }
                                            }}
                                        >
                                            <SelectTrigger
                                                id="bean-a-select"
                                                className="flex h-9 w-full cursor-pointer items-center justify-between rounded-full border border-stone-200 bg-white px-3 text-xs font-medium text-stone-900 shadow-2xs transition-colors hover:border-stone-300 focus:outline-hidden sm:h-11 sm:rounded-xl sm:px-3.5 sm:text-sm"
                                            >
                                                <SelectValue placeholder="Pilih Biji Kopi A">
                                                    <span className="block truncate">
                                                        {beanA?.name}
                                                    </span>
                                                </SelectValue>
                                            </SelectTrigger>
                                            <SelectContent className="z-50 max-h-72 w-(--radix-select-trigger-width) min-w-[260px] rounded-xl border border-stone-200 bg-white shadow-xl sm:min-w-[320px]">
                                                {beans.map((b) => {
                                                    const isSelectedInB =
                                                        b.id === beanBId;
                                                    return (
                                                        <SelectItem
                                                            key={`a-${b.id}`}
                                                            value={String(b.id)}
                                                            textValue={b.name}
                                                            disabled={
                                                                isSelectedInB
                                                            }
                                                            className={`rounded-lg px-2.5 py-2 pr-3 text-xs sm:px-3 sm:py-2.5 sm:text-sm [&_[data-slot=select-item-indicator]]:hidden ${
                                                                isSelectedInB
                                                                    ? 'cursor-not-allowed bg-stone-50 opacity-40 select-none'
                                                                    : 'cursor-pointer hover:bg-stone-50 data-[highlighted]:bg-[#fee2e2] data-[highlighted]:text-[#991b1b] data-[state=checked]:bg-[#fee2e2] data-[state=checked]:font-semibold data-[state=checked]:text-[#991b1b]'
                                                            }`}
                                                        >
                                                            <div className="flex w-full items-center justify-between gap-2 sm:gap-4">
                                                                <span
                                                                    className={`truncate ${isSelectedInB ? 'text-stone-400' : ''}`}
                                                                >
                                                                    {b.name}
                                                                </span>
                                                                <span className="shrink-0 text-right text-[11px] sm:text-xs">
                                                                    {isSelectedInB ? (
                                                                        <span className="rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
                                                                            Dipilih
                                                                            di B
                                                                        </span>
                                                                    ) : (
                                                                        <span className="font-normal text-stone-400">
                                                                            {b.origin ||
                                                                                b.process ||
                                                                                'Kawi'}
                                                                        </span>
                                                                    )}
                                                                </span>
                                                            </div>
                                                        </SelectItem>
                                                    );
                                                })}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <span className="min-w-8 shrink-0 text-right text-xs font-extrabold text-stone-900 tabular-nums sm:min-w-12 sm:text-base">
                                        {blendRatio}
                                        <span className="ml-0.5 font-semibold text-stone-400">
                                            %
                                        </span>
                                    </span>
                                </div>

                                {/* Component B Row */}
                                <div className="flex items-center gap-2 sm:gap-3.5">
                                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#fde047] text-xs font-bold text-[#854d0e] shadow-2xs sm:h-8 sm:w-8 sm:text-sm">
                                        B
                                    </span>
                                    <div className="min-w-0 flex-1">
                                        <Select
                                            value={String(beanBId)}
                                            onValueChange={(val: string) => {
                                                const selectedId = Number(val);
                                                if (selectedId !== beanAId) {
                                                    setBeanBId(selectedId);
                                                }
                                            }}
                                        >
                                            <SelectTrigger
                                                id="bean-b-select"
                                                className="flex h-9 w-full cursor-pointer items-center justify-between rounded-full border border-stone-200 bg-white px-3 text-xs font-medium text-stone-900 shadow-2xs transition-colors hover:border-stone-300 focus:outline-hidden sm:h-11 sm:rounded-xl sm:px-3.5 sm:text-sm"
                                            >
                                                <SelectValue placeholder="Pilih Biji Kopi B">
                                                    <span className="block truncate">
                                                        {beanB?.name}
                                                    </span>
                                                </SelectValue>
                                            </SelectTrigger>
                                            <SelectContent className="z-50 max-h-72 w-(--radix-select-trigger-width) min-w-[260px] rounded-xl border border-stone-200 bg-white shadow-xl sm:min-w-[320px]">
                                                {beans.map((b) => {
                                                    const isSelectedInA =
                                                        b.id === beanAId;
                                                    return (
                                                        <SelectItem
                                                            key={`b-${b.id}`}
                                                            value={String(b.id)}
                                                            textValue={b.name}
                                                            disabled={
                                                                isSelectedInA
                                                            }
                                                            className={`rounded-lg px-2.5 py-2 pr-3 text-xs sm:px-3 sm:py-2.5 sm:text-sm [&_[data-slot=select-item-indicator]]:hidden ${
                                                                isSelectedInA
                                                                    ? 'cursor-not-allowed bg-stone-50 opacity-40 select-none'
                                                                    : 'cursor-pointer hover:bg-stone-50 data-[highlighted]:bg-[#fef9c3] data-[highlighted]:text-[#854d0e] data-[state=checked]:bg-[#fef9c3] data-[state=checked]:font-semibold data-[state=checked]:text-[#854d0e]'
                                                            }`}
                                                        >
                                                            <div className="flex w-full items-center justify-between gap-2 sm:gap-4">
                                                                <span
                                                                    className={`truncate ${isSelectedInA ? 'text-stone-400' : ''}`}
                                                                >
                                                                    {b.name}
                                                                </span>
                                                                <span className="shrink-0 text-right text-[11px] sm:text-xs">
                                                                    {isSelectedInA ? (
                                                                        <span className="rounded-full border border-red-200 bg-red-50 px-2 py-0.5 text-[10px] font-semibold text-red-700">
                                                                            Dipilih
                                                                            di A
                                                                        </span>
                                                                    ) : (
                                                                        <span className="font-normal text-stone-400">
                                                                            {b.origin ||
                                                                                b.process ||
                                                                                'Nusantara'}
                                                                        </span>
                                                                    )}
                                                                </span>
                                                            </div>
                                                        </SelectItem>
                                                    );
                                                })}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <span className="min-w-8 shrink-0 text-right text-xs font-extrabold text-stone-900 tabular-nums sm:min-w-12 sm:text-base">
                                        {100 - blendRatio}
                                        <span className="ml-0.5 font-semibold text-stone-400">
                                            %
                                        </span>
                                    </span>
                                </div>
                            </div>

                            {/* Single Unified Percentage Slider with Dual-Color Proportions */}
                            <div className="byob-enter space-y-4 pt-2">
                                <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                                    <div>
                                        <h3 className="flex items-center gap-2 text-lg font-bold text-brand-950">
                                            <SlidersHorizontal className="h-5 w-5 text-accent-copper" />
                                            <span>Blend Ratio</span>
                                        </h3>
                                        <p className="text-sm text-brand-700">
                                            Geser slider di bawah untuk mengatur
                                            persentase rasio secara real-time.
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-950 px-3 py-1 text-xs font-bold text-white shadow-xs">
                                            <span className="h-2 w-2 rounded-full bg-sand-300" />
                                            <span>A: </span>
                                            <SlidingNumber
                                                number={blendRatio}
                                            />
                                            <span>%</span>
                                        </span>
                                        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#9a3412] px-3 py-1 text-xs font-bold text-white shadow-xs">
                                            <span className="h-2 w-2 rounded-full bg-white" />
                                            <span>B: </span>
                                            <SlidingNumber
                                                number={100 - blendRatio}
                                            />
                                            <span>%</span>
                                        </span>
                                    </div>
                                </div>

                                {/* Dual-Colored Track Percentage Slider */}
                                <div className="relative py-3 select-none">
                                    {/* Visual Dual-Colored Track Bar */}
                                    <div className="relative flex h-9 w-full overflow-hidden rounded-full bg-sand-200 shadow-inner">
                                        {/* Component A Segment */}
                                        <div
                                            style={{ width: `${blendRatio}%` }}
                                            className="flex h-full items-center justify-start overflow-hidden bg-brand-950 pl-4 text-xs font-extrabold tracking-wide whitespace-nowrap text-white transition-all duration-75 sm:text-sm"
                                            title={`Component A: ${blendRatio}%`}
                                        >
                                            {blendRatio >= 22
                                                ? `${blendRatio}% ${beanA?.name?.split(' ')[0] || 'Component A'}`
                                                : `${blendRatio}%`}
                                        </div>

                                        {/* Component B Segment */}
                                        <div
                                            style={{
                                                width: `${100 - blendRatio}%`,
                                            }}
                                            className="flex h-full items-center justify-end overflow-hidden bg-[#9a3412] pr-4 text-xs font-extrabold tracking-wide whitespace-nowrap text-white transition-all duration-75 sm:text-sm"
                                            title={`Component B: ${100 - blendRatio}%`}
                                        >
                                            {100 - blendRatio >= 22
                                                ? `${beanB?.name?.split(' ')[0] || 'Component B'} ${100 - blendRatio}%`
                                                : `${100 - blendRatio}%`}
                                        </div>
                                    </div>

                                    {/* Draggable Divider Knob Indicator */}
                                    <div
                                        style={{ left: `${blendRatio}%` }}
                                        className="pointer-events-none absolute top-1/2 z-10 flex h-8 w-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-brand-950 bg-white shadow-lg transition-all duration-75"
                                    >
                                        <div className="flex gap-0.5">
                                            <div className="h-3 w-0.5 rounded-full bg-brand-800" />
                                            <div className="h-3 w-0.5 rounded-full bg-brand-800" />
                                        </div>
                                    </div>

                                    {/* Range Input Layered Over */}
                                    <input
                                        type="range"
                                        min="10"
                                        max="90"
                                        step="10"
                                        value={blendRatio}
                                        onChange={(e) =>
                                            setBlendRatio(
                                                Number(e.target.value),
                                            )
                                        }
                                        className="absolute inset-0 z-20 h-full w-full cursor-ew-resize opacity-0"
                                        aria-label="Blend Ratio Percentage"
                                    />
                                </div>

                                {/* Mobile-only: Package Size Variant above Formula Blend */}
                                {renderPackageSizeSelector('block lg:hidden')}

                                {/* Live Formula Banner */}
                                <div className="bg-sand-100/90 space-y-3 rounded-xl border border-sand-200/80 p-4 sm:p-5">
                                    <div className="flex flex-col justify-between gap-1.5 border-b border-sand-200/80 pb-2.5 sm:flex-row sm:items-center">
                                        <span className="text-sm font-medium text-brand-800">
                                            Formula Blend:
                                        </span>
                                        <strong className="text-base font-extrabold text-brand-950">
                                            {recipeString}
                                        </strong>
                                    </div>

                                    {/* Total Price Display */}
                                    <div className="flex flex-col justify-between gap-2 pt-1 sm:flex-row sm:items-center">
                                        <div className="flex flex-wrap items-baseline gap-2">
                                            <span className="text-sm font-semibold text-brand-800">
                                                Total Harga (
                                                {selectedVariant?.label ||
                                                    'Kemasan'}
                                                ):
                                            </span>
                                            {hasDiscount && (
                                                <del className="text-sm font-medium text-stone-400">
                                                    {formatRupiah(
                                                        basePricePerBag,
                                                    )}
                                                </del>
                                            )}
                                            <strong className="text-xl font-black text-brand-950">
                                                {formatRupiah(pricePerBag)}
                                            </strong>
                                            {hasDiscount && (
                                                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-extrabold tracking-wide text-emerald-800 uppercase">
                                                    {discountBadge}
                                                </span>
                                            )}
                                        </div>
                                        {quantity > 1 && (
                                            <div className="flex items-baseline gap-2 text-right">
                                                <span className="text-xs text-brand-600">
                                                    Total ({quantity} kemasan):
                                                </span>
                                                <strong className="text-xl font-black text-accent-copper">
                                                    {formatRupiah(totalPrice)}
                                                </strong>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Section 2: Possible Notes */}
                        <div className="byob-enter space-y-3 rounded-2xl bg-cream-50 p-5 sm:p-6">
                            <span className="block text-sm font-bold text-brand-800">
                                {byobSettings?.possible_notes_title ||
                                    'Possible Notes:'}
                            </span>
                            <div className="flex flex-wrap gap-2">
                                {combinedNotes.length > 0 ? (
                                    combinedNotes.map((note) => (
                                        <span
                                            key={note}
                                            className="rounded-full bg-sand-200/90 px-3 py-1 text-xs font-medium text-brand-950 sm:text-sm"
                                        >
                                            {note}
                                        </span>
                                    ))
                                ) : (
                                    <span className="text-xs text-brand-600 italic sm:text-sm">
                                        Profil rasa seimbang dan manis alami.
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Packaging, Grind Size, Summary & Add to Cart */}
                    <div className="space-y-6 lg:sticky lg:top-24 lg:col-span-4">
                        <div className="byob-enter space-y-6 rounded-2xl bg-cream-50 p-6 sm:p-8">
                            {/* Pack Shot Real Image */}
                            <div className="bg-sand-100 aspect-16/10 overflow-hidden rounded-xl">
                                <img
                                    src={
                                        resolveImageUrl(
                                            byobSettings?.packshot_image,
                                        ) ||
                                        'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&w=600&q=80'
                                    }
                                    alt="Sanubari Coffee Packaging"
                                    className="h-full w-full object-cover"
                                />
                            </div>

                            {/* Custom Blend Name (Optional) */}
                            <div className="space-y-2">
                                <label
                                    htmlFor="blend-name-input"
                                    className="block text-sm font-semibold text-brand-800"
                                >
                                    Name Your Blend (Opsional):
                                </label>
                                <input
                                    id="blend-name-input"
                                    type="text"
                                    value={customBlendName}
                                    onChange={(e) =>
                                        setCustomBlendName(e.target.value)
                                    }
                                    placeholder="Contoh: Morning Espresso House Blend"
                                    className="w-full rounded-xl bg-white px-4 py-3 text-base text-brand-950 focus:outline-hidden"
                                />
                            </div>

                            {/* Package Size Variant (Desktop) */}
                            {renderPackageSizeSelector('hidden lg:block')}

                            {/* Grind Option */}
                            <div className="space-y-2 sm:space-y-2.5">
                                <span className="block text-sm font-semibold text-brand-800 sm:text-base">
                                    Grind Size (Pilihan Gilingan):
                                </span>
                                <div className="space-y-2">
                                    {grindOptions.map((opt) => (
                                        <label
                                            key={opt}
                                            className={`flex cursor-pointer items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-[13.5px] transition-colors sm:text-sm ${
                                                grindOption === opt
                                                    ? 'bg-brand-900 font-semibold text-white shadow-xs'
                                                    : 'hover:bg-sand-100 border border-sand-200/60 bg-white text-brand-900'
                                            }`}
                                        >
                                            <input
                                                type="radio"
                                                name="grind"
                                                checked={grindOption === opt}
                                                onChange={() =>
                                                    setGrindOption(opt)
                                                }
                                                className="h-4 w-4 shrink-0 cursor-pointer accent-accent-copper"
                                            />
                                            <span className="leading-snug">
                                                {opt}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Quantity Selector */}
                            <div className="flex items-center justify-between pt-2">
                                <span className="text-sm font-semibold text-brand-800">
                                    Jumlah Kemasan:
                                </span>
                                <div
                                    data-ui="stepper"
                                    className="flex items-center overflow-hidden rounded-xl bg-white"
                                >
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setQuantity((q) =>
                                                Math.max(1, q - 1),
                                            )
                                        }
                                        className="hover:bg-sand-100 p-2.5 text-brand-700"
                                        aria-label="Kurangi jumlah"
                                    >
                                        <Minus className="h-4 w-4" />
                                    </button>
                                    <span className="px-5 text-base font-bold text-brand-950">
                                        {quantity}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setQuantity((q) =>
                                                Math.min(20, q + 1),
                                            )
                                        }
                                        className="hover:bg-sand-100 p-2.5 text-brand-700"
                                        aria-label="Tambah jumlah"
                                    >
                                        <Plus className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>

                            {/* Price Summary */}
                            <div className="bg-sand-100/80 space-y-2.5 rounded-xl p-5">
                                <div className="flex items-center justify-between text-sm text-brand-700">
                                    <span>
                                        Harga per kemasan (
                                        {selectedVariant?.label || 'Kemasan'}):
                                    </span>
                                    <div className="flex items-baseline gap-2">
                                        {hasDiscount && (
                                            <del className="text-xs text-stone-400">
                                                {formatRupiah(basePricePerBag)}
                                            </del>
                                        )}
                                        <span className="font-bold text-brand-950">
                                            {formatRupiah(pricePerBag)}
                                        </span>
                                    </div>
                                </div>
                                {hasDiscount && (
                                    <div className="flex items-center justify-between rounded-lg border border-emerald-100 bg-emerald-50 px-2.5 py-1.5 text-xs font-semibold text-emerald-800">
                                        <span>Potongan Diskon Kemasan:</span>
                                        <span>
                                            -{' '}
                                            {formatRupiah(
                                                discountAmountPerBag * quantity,
                                            )}{' '}
                                            ({discountLabel})
                                        </span>
                                    </div>
                                )}
                                <div className="flex items-center justify-between border-t border-sand-200/60 pt-2 text-base font-extrabold text-brand-950">
                                    <span>Total Pembelian ({quantity}x):</span>
                                    <span className="text-lg font-black text-accent-copper">
                                        {formatRupiah(totalPrice)}
                                    </span>
                                </div>
                            </div>

                            {/* Same bean warning if ever occurs */}
                            {isSameBean && (
                                <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-medium text-red-700">
                                    <span>
                                        ⚠️ Biji kopi A dan B tidak boleh sama.
                                        Silakan pilih 2 biji kopi yang berbeda
                                        untuk racikan Anda.
                                    </span>
                                </div>
                            )}

                            {/* Add To Cart Button - Exact wording requested by user */}
                            <button
                                type="button"
                                onClick={handleAddToCart}
                                disabled={isSameBean}
                                className={`flex w-full items-center justify-center gap-2 rounded-xl px-5 py-4 text-base font-bold text-white shadow-sm transition-all duration-150 active:scale-[0.98] ${
                                    isSameBean
                                        ? 'cursor-not-allowed bg-stone-300 text-stone-500 shadow-none'
                                        : addedSuccess
                                          ? 'bg-emerald-700'
                                          : 'bg-brand-700 hover:bg-brand-800'
                                }`}
                            >
                                {isSameBean ? (
                                    <span>Pilih 2 Biji Kopi yang Berbeda</span>
                                ) : addedSuccess ? (
                                    <>
                                        <Check className="h-5 w-5 text-emerald-200" />
                                        <span>
                                            Berhasil Ditambahkan ke Keranjang
                                        </span>
                                    </>
                                ) : (
                                    <>
                                        <ShoppingBag className="h-5 w-5" />
                                        <span>Tambahkan ke keranjang</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </PublicLayout>
    );
}
