import React from 'react';
import { X, Calculator, ShoppingCart, CreditCard, Minus, Plus, Lock } from 'lucide-react';
import { Product } from '@/types/pos';

interface CalculatorModalProps {
    isOpen: boolean;
    onClose: () => void;
    calcTargetMode: '1000g' | '500g';
    switchCalcMode: (mode: '1000g' | '500g') => void;
    products: Product[];
    kgSelectedProductId: number | 'custom';
    onSelectProduct: (id: number | 'custom') => void;
    kgCustomProductName: string;
    setKgCustomProductName: (val: string) => void;
    kgPrice200g: string | number;
    setKgPrice200g: (val: string) => void;
    kgCostPrice200g: string | number;
    kgMultiplier: number;
    kgDiscountType: 'none' | 'percent' | 'nominal';
    setKgDiscountType: (val: 'none' | 'percent' | 'nominal') => void;
    kgDiscountValue: string | number;
    setKgDiscountValue: (val: string | number) => void;
    isKgCustomPriceOverridden: boolean;
    setIsKgCustomPriceOverridden: (val: boolean) => void;
    kgCustomFinalPrice: string | number;
    setKgCustomFinalPrice: (val: string | number) => void;
    kgQuantity: number;
    setKgQuantity: React.Dispatch<React.SetStateAction<number>>;
    onAddToCart: (payDirectly: boolean) => void;
    formatRp: (val: number) => string;
}

export const CalculatorModal: React.FC<CalculatorModalProps> = ({
    isOpen,
    onClose,
    calcTargetMode,
    switchCalcMode,
    products,
    kgSelectedProductId,
    onSelectProduct,
    kgCustomProductName,
    setKgCustomProductName,
    kgPrice200g,
    setKgPrice200g,
    kgCostPrice200g,
    kgMultiplier,
    kgDiscountType,
    setKgDiscountType,
    kgDiscountValue,
    setKgDiscountValue,
    isKgCustomPriceOverridden,
    setIsKgCustomPriceOverridden,
    kgCustomFinalPrice,
    setKgCustomFinalPrice,
    kgQuantity,
    setKgQuantity,
    onAddToCart,
    formatRp,
}) => {
    if (!isOpen) return null;

    const is500g = calcTargetMode === '500g';
    const baseWeight = is500g ? 100 : 200;
    const targetGrams = is500g ? 500 : 1000;
    const rawPriceBase = Number(kgPrice200g) || 0;
    const rawCostBase = Number(kgCostPrice200g) || 0;
    const packagingDiscount = is500g ? 24000 : 27000;
    const basePriceTotal = rawPriceBase * kgMultiplier;
    const rawHppScaled = rawCostBase * kgMultiplier;
    const baseCostTotal = rawHppScaled > 0 ? Math.max(0, rawHppScaled - packagingDiscount) : 0;

    let discountAmount = 0;
    if (kgDiscountType === 'percent') {
        discountAmount = Math.round((basePriceTotal * (Number(kgDiscountValue) || 0)) / 100);
    } else if (kgDiscountType === 'nominal') {
        discountAmount = Math.min(basePriceTotal, Number(kgDiscountValue) || 0);
    }

    const calculatedFinalPrice = Math.max(0, basePriceTotal - discountAmount);
    const effectivePricePerUnit =
        isKgCustomPriceOverridden && Number(kgCustomFinalPrice) > 0
            ? Number(kgCustomFinalPrice)
            : calculatedFinalPrice;

    const effectiveDiscount = Math.max(0, basePriceTotal - effectivePricePerUnit);
    const profitPerUnit = effectivePricePerUnit - baseCostTotal;
    const profitMargin =
        effectivePricePerUnit > 0 && baseCostTotal > 0
            ? Math.round((profitPerUnit / effectivePricePerUnit) * 100)
            : 0;

    const subtotal = effectivePricePerUnit * Math.max(1, kgQuantity);

    const selectedProd =
        kgSelectedProductId !== 'custom' ? products.find((p) => p.id === kgSelectedProductId) : null;
    const baseRegex = is500g ? /100\s*(g|gr|gram)?/i : /200\s*(g|gr|gram)?/i;
    const detectedBaseVariant = selectedProd?.variants?.find(
        (v) => v.weight_grams === baseWeight || baseRegex.test(v.label),
    );

    return (
        <div className="pos-modal-overlay fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 p-3 sm:p-4">
            <div className="pos-gpu-layer my-auto max-h-[92vh] w-full max-w-xl animate-in overflow-y-auto rounded-2xl border border-stone-200 bg-white p-5 text-stone-900 shadow-2xl duration-150 zoom-in-95 sm:p-6 dark:border-stone-800 dark:bg-stone-900 dark:text-stone-100">
                {/* Modal Header */}
                <div className="flex items-center justify-between border-b border-stone-100 pb-3.5 dark:border-stone-800">
                    <div className="flex items-center gap-3">
                        <div
                            className={`flex h-10 w-10 items-center justify-center rounded-xl border ${
                                is500g
                                    ? 'border-teal-300 bg-teal-500/10 text-teal-600 dark:border-teal-700 dark:bg-teal-400/10 dark:text-teal-400'
                                    : 'border-emerald-300 bg-emerald-500/10 text-emerald-600 dark:border-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-400'
                            }`}
                        >
                            <Calculator className="h-5 w-5 stroke-[2.2]" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h3 className="text-base font-bold text-brand-950 dark:text-white">
                                    {is500g ? 'Kalkulator Harga 500 gr' : 'Kalkulator Harga 1 Kg (1000 gr)'}
                                </h3>
                                <span
                                    className={`rounded-full border px-2 py-0.5 text-[10px] font-black uppercase ${
                                        is500g
                                            ? 'border-teal-300 bg-teal-100 text-teal-800 dark:border-teal-700 dark:bg-teal-950/60 dark:text-teal-300'
                                            : 'border-emerald-300 bg-emerald-100 text-emerald-800 dark:border-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                                    }`}
                                >
                                    Formula {baseWeight}g × 5
                                </span>
                            </div>
                            <p className="text-[11px] text-stone-500 dark:text-stone-400">
                                {is500g
                                    ? 'Harga & HPP 500 gr dihitung otomatis dari varian 100 gr dikali 5'
                                    : 'Harga & HPP 1.000 gr dihitung otomatis dari varian 200 gr dikali 5'}
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="cursor-pointer rounded-lg p-1 text-stone-400 hover:bg-stone-100 hover:text-stone-700 dark:hover:bg-stone-800 dark:hover:text-stone-200"
                        title="Tutup"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="space-y-4 pt-2 text-xs">
                    {/* Mode Switcher Tabs: 1 Kg vs 500 gr */}
                    <div className="flex gap-2 rounded-xl bg-stone-100 p-1 dark:bg-stone-800">
                        <button
                            type="button"
                            onClick={() => switchCalcMode('1000g')}
                            className={`flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-bold transition ${
                                !is500g
                                    ? 'bg-emerald-600 text-white shadow-xs'
                                    : 'text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-white'
                            }`}
                        >
                            <Calculator className="h-3.5 w-3.5" />
                            <span>Mode 1 Kg</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => switchCalcMode('500g')}
                            className={`flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-bold transition ${
                                is500g
                                    ? 'bg-teal-600 text-white shadow-xs'
                                    : 'text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-white'
                            }`}
                        >
                            <Calculator className="h-3.5 w-3.5" />
                            <span>Mode 500 gr</span>
                        </button>
                    </div>

                    {/* 1. Sumber Kopi */}
                    <div className="space-y-2">
                        <label className="flex items-center justify-between text-[11px] font-bold text-stone-800 dark:text-stone-200">
                            <span>Pilih Kopi / Produk Rujukan:</span>
                            <span className="text-[10px] font-normal text-stone-500">
                                {kgSelectedProductId === 'custom' ? 'Mode Kopi Custom' : 'Mode Terhubung Katalog'}
                            </span>
                        </label>
                        <select
                            value={kgSelectedProductId}
                            onChange={(e) => {
                                const val = e.target.value === 'custom' ? 'custom' : Number(e.target.value);
                                onSelectProduct(val);
                            }}
                            className="w-full rounded-xl border border-stone-300 bg-stone-50 px-3 py-2.5 text-xs font-semibold text-stone-900 focus:bg-white focus:ring-1 focus:ring-brand-600 focus:outline-none dark:border-stone-700 dark:bg-stone-800 dark:text-white"
                        >
                            <option value="custom">-- Input Bebas / Kopi Custom Baru --</option>
                            {products.map((p) => {
                                const hasBase = p.variants?.some(
                                    (v) =>
                                        v.weight_grams === baseWeight ||
                                        (is500g ? /100\s*(g|gr|gram)?/i : /200\s*(g|gr|gram)?/i).test(v.label),
                                );
                                return (
                                    <option key={p.id} value={p.id}>
                                        {p.name} {hasBase ? ` (✓ Ada Varian ${baseWeight}gr)` : ''}
                                    </option>
                                );
                            })}
                        </select>

                        {kgSelectedProductId === 'custom' && (
                            <div className="pt-1">
                                <input
                                    type="text"
                                    value={kgCustomProductName}
                                    onChange={(e) => setKgCustomProductName(e.target.value)}
                                    placeholder={`Nama Kopi / Biji Custom (Contoh: Arabika Gayo Natural ${
                                        is500g ? '500 gr' : '1 Kg'
                                    })`}
                                    className="w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-xs font-medium text-stone-900 focus:ring-1 focus:ring-brand-600 focus:outline-none dark:border-stone-700 dark:bg-stone-800 dark:text-white"
                                />
                            </div>
                        )}

                        {selectedProd && (
                            <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                                {detectedBaseVariant ? (
                                    <span
                                        className={`font-semibold ${
                                            is500g
                                                ? 'text-teal-700 dark:text-teal-400'
                                                : 'text-emerald-700 dark:text-emerald-400'
                                        }`}
                                    >
                                        ✓ Varian {baseWeight} gr terdeteksi — Harga:{' '}
                                        <strong>Rp {formatRp(detectedBaseVariant.price)}</strong>
                                        {rawCostBase > 0 ? (
                                            <span className="ml-1 text-rose-700 dark:text-rose-300">
                                                | HPP Otomatis: <strong>Rp {formatRp(rawCostBase)}</strong>
                                            </span>
                                        ) : (
                                            <span className="ml-1 text-stone-500">
                                                | (HPP database kosong, bisa diisi manual di bawah)
                                            </span>
                                        )}
                                    </span>
                                ) : (
                                    <span className="text-amber-700 dark:text-amber-400">
                                        ℹ Produk ini belum memiliki varian {baseWeight} gr di database, masukkan harga &
                                        HPP {baseWeight} gr secara manual di bawah.
                                    </span>
                                )}
                            </div>
                        )}
                    </div>

                    {/* 2. Grid Parameter: Harga Dasar x Pengali 5 */}
                    <div
                        className={`rounded-2xl border p-3.5 ${
                            is500g
                                ? 'border-teal-200 bg-teal-50/50 dark:border-teal-900/60 dark:bg-teal-950/20'
                                : 'border-emerald-200 bg-emerald-50/50 dark:border-emerald-900/60 dark:bg-emerald-950/20'
                        }`}
                    >
                        <div
                            className={`mb-2 text-[11px] font-black uppercase tracking-wider ${
                                is500g ? 'text-teal-900 dark:text-teal-300' : 'text-emerald-900 dark:text-emerald-300'
                            }`}
                        >
                            1. Parameter Harga Dasar {baseWeight} gr & Pengali {is500g ? '500 gr' : '1 Kg'}
                        </div>
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                            {/* Harga Varian Dasar */}
                            <div className="space-y-1">
                                <label className="text-[10.5px] font-bold text-stone-800 dark:text-stone-200">
                                    Harga Varian {baseWeight} gr <span className="text-rose-600">*</span>
                                </label>
                                <div className="relative">
                                    <span className="absolute top-1/2 left-2.5 -translate-y-1/2 text-xs font-bold text-stone-500">
                                        Rp
                                    </span>
                                    <input
                                        type="number"
                                        min="0"
                                        step="500"
                                        value={kgPrice200g}
                                        onChange={(e) => {
                                            setKgPrice200g(e.target.value);
                                            setIsKgCustomPriceOverridden(false);
                                        }}
                                        placeholder="Contoh: 35000"
                                        className="w-full rounded-xl border border-stone-300 bg-white py-2 pr-2.5 pl-8 text-xs font-black text-stone-900 focus:ring-1 focus:ring-brand-500 focus:outline-none dark:border-stone-700 dark:bg-stone-900 dark:text-white"
                                    />
                                </div>
                                <p className="text-[10px] text-stone-500">Harga eceran kemasan {baseWeight} gr</p>
                            </div>

                            {/* Modal / HPP Varian Dasar */}
                            <div className="space-y-1">
                                <div className="flex items-center justify-between">
                                    <label className="flex items-center gap-1 text-[10.5px] font-bold text-rose-900 dark:text-rose-300">
                                        <Lock className="h-3 w-3 text-rose-500" />
                                        <span>HPP Varian {baseWeight} gr</span>
                                    </label>
                                </div>
                                <div className="relative">
                                    <span className="absolute top-1/2 left-2.5 -translate-y-1/2 text-xs font-bold text-rose-600 dark:text-rose-400">
                                        Rp
                                    </span>
                                    <input
                                        type="text"
                                        readOnly
                                        tabIndex={-1}
                                        value={formatRp(Number(kgCostPrice200g) || 0)}
                                        placeholder="0"
                                        className="w-full cursor-not-allowed select-none rounded-xl border border-rose-200 bg-rose-50/70 py-2 pr-8 pl-8 text-xs font-black text-rose-950 focus:outline-none dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-200"
                                        title={`HPP varian ${baseWeight} gr terkunci dan wajib mengikuti HPP master produk di dashboard`}
                                    />
                                    <span className="absolute top-1/2 right-2.5 -translate-y-1/2 text-stone-400">
                                        <Lock className="h-3.5 w-3.5 text-rose-400/80" />
                                    </span>
                                </div>
                            </div>

                            {/* Pengali */}
                            <div className="space-y-1">
                                <label className="text-[10.5px] font-bold text-stone-800 dark:text-stone-200">
                                    Pengali Gramatur
                                </label>
                                <div
                                    className={`flex items-center gap-1 rounded-xl border px-3 py-2 text-xs font-black ${
                                        is500g
                                            ? 'border-teal-300 bg-teal-100/70 text-teal-900 dark:border-teal-800 dark:bg-teal-900/40 dark:text-teal-200'
                                            : 'border-emerald-300 bg-emerald-100/70 text-emerald-900 dark:border-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200'
                                    }`}
                                >
                                    <span className="text-sm">× {kgMultiplier}</span>
                                    <span
                                        className={`text-[10px] font-medium ${
                                            is500g ? 'text-teal-700 dark:text-teal-300' : 'text-emerald-700 dark:text-emerald-300'
                                        }`}
                                    >
                                        ({baseWeight}g × 5 = {targetGrams}g)
                                    </span>
                                </div>
                                <p
                                    className={`text-[10px] ${
                                        is500g ? 'text-teal-700 dark:text-teal-400' : 'text-emerald-700 dark:text-emerald-400'
                                    }`}
                                >
                                    Otomatis varian {is500g ? '500 gr' : '1.000 gr (1 Kg)'}
                                </p>
                            </div>
                        </div>

                        {/* Hasil Rumus Otomatis Banner */}
                        <div
                            className={`mt-3 rounded-xl border bg-white p-3 shadow-2xs dark:bg-stone-900 ${
                                is500g ? 'border-teal-300 dark:border-teal-800' : 'border-emerald-300 dark:border-emerald-800'
                            }`}
                        >
                            <div
                                className={`mb-2 text-[10.5px] font-black uppercase tracking-wider ${
                                    is500g ? 'text-teal-800 dark:text-teal-300' : 'text-emerald-800 dark:text-emerald-300'
                                }`}
                            >
                                Formula Perhitungan Otomatis {is500g ? '500 gr (100 gr × 5)' : '1 Kg (200 gr × 5)'}:
                            </div>
                            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                                <div
                                    className={`rounded-xl border p-3 ${
                                        is500g
                                            ? 'border-teal-200 bg-teal-50/70 dark:border-teal-800/60 dark:bg-teal-950/30'
                                            : 'border-emerald-200 bg-emerald-50/70 dark:border-emerald-800/60 dark:bg-emerald-950/30'
                                    }`}
                                >
                                    <div
                                        className={`text-[10.5px] font-bold ${
                                            is500g ? 'text-teal-900 dark:text-teal-300' : 'text-emerald-900 dark:text-emerald-300'
                                        }`}
                                    >
                                        1. HARGA JUAL {is500g ? '500 GR' : '1 KG'} ({kgMultiplier}× Harga {baseWeight}gr)
                                    </div>
                                    <div className="mt-1 font-mono text-xs font-semibold text-stone-700 dark:text-stone-300">
                                        {kgMultiplier} × Rp {formatRp(rawPriceBase)} =
                                    </div>
                                    <div
                                        className={`text-base font-black ${
                                            is500g ? 'text-teal-700 dark:text-teal-400' : 'text-emerald-700 dark:text-emerald-400'
                                        }`}
                                    >
                                        Rp {formatRp(basePriceTotal)}
                                    </div>
                                    <div className="mt-0.5 text-[10px] text-stone-500 dark:text-stone-400">
                                        Harga jual standar per {is500g ? '500 gr' : '1.000 gr'}
                                    </div>
                                </div>

                                <div className="rounded-xl border border-rose-200 bg-rose-50/70 p-3 dark:border-rose-900/60 dark:bg-rose-950/30">
                                    <div className="flex items-center justify-between">
                                        <div className="text-[10.5px] font-bold text-rose-900 dark:text-rose-300">
                                            2. TOTAL HPP {is500g ? '500 GR' : '1 KG'}
                                        </div>
                                        <span className="rounded bg-rose-200/80 px-1.5 py-0.5 text-[9.5px] font-extrabold text-rose-800 dark:bg-rose-900 dark:text-rose-200">
                                            Hemat Kemasan -Rp {formatRp(packagingDiscount)}
                                        </span>
                                    </div>
                                    <div className="mt-1 font-mono text-[11px] font-semibold text-stone-700 dark:text-stone-300">
                                        ({kgMultiplier} × Rp {formatRp(rawCostBase)}) - Rp {formatRp(packagingDiscount)} =
                                    </div>
                                    <div className="text-base font-black text-rose-700 dark:text-rose-400">
                                        Rp {formatRp(baseCostTotal)}
                                    </div>
                                    <div className="mt-0.5 text-[10px] text-stone-500 dark:text-stone-400">
                                        {rawCostBase > 0
                                            ? `Modal kotor Rp ${formatRp(rawHppScaled)} dipotong hemat kemasan Rp ${formatRp(
                                                  packagingDiscount,
                                              )}`
                                            : `Potongan kemasan packaging Rp ${formatRp(packagingDiscount)}`}
                                    </div>
                                </div>
                            </div>

                            {rawPriceBase > 0 && (
                                <div className="mt-2.5 flex items-center justify-between border-t border-stone-100 pt-2 text-[11px] dark:border-stone-800">
                                    <span className="font-semibold text-stone-700 dark:text-stone-300">
                                        Estimasi Laba Kotor per {is500g ? '500 gr' : '1 Kg'}:
                                    </span>
                                    <span
                                        className={`font-bold ${
                                            is500g ? 'text-teal-700 dark:text-teal-400' : 'text-emerald-700 dark:text-emerald-400'
                                        }`}
                                    >
                                        +Rp {formatRp(basePriceTotal - baseCostTotal)}
                                        {basePriceTotal > 0 && baseCostTotal > 0 && (
                                            <span className="ml-1 text-[10px] font-semibold text-stone-500 dark:text-stone-400">
                                                (Margin {Math.round(((basePriceTotal - baseCostTotal) / basePriceTotal) * 100)}%)
                                            </span>
                                        )}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* 3. Penyesuaian Harga / Diskon Grosir */}
                    <div className="space-y-2 rounded-2xl border border-stone-200 bg-stone-50 p-3.5 dark:border-stone-800 dark:bg-stone-850">
                        <div className="flex items-center justify-between text-[11px] font-bold text-stone-800 dark:text-stone-200">
                            <span>2. Penyesuaian Harga / Diskon Grosir {is500g ? '500 gr' : '1 Kg'}:</span>
                            <span className="text-[10px] font-normal text-stone-500">Opsional</span>
                        </div>

                        {/* Preset Diskon */}
                        <div className="flex flex-wrap gap-1.5">
                            <button
                                type="button"
                                onClick={() => {
                                    if (kgDiscountType === 'percent' && Number(kgDiscountValue) === 10) {
                                        setKgDiscountType('none');
                                        setKgDiscountValue('');
                                    } else {
                                        setKgDiscountType('percent');
                                        setKgDiscountValue(10);
                                    }
                                    setIsKgCustomPriceOverridden(false);
                                }}
                                className={`rounded-lg px-2.5 py-1 text-xs font-bold transition ${
                                    kgDiscountType === 'percent' && Number(kgDiscountValue) === 10 && !isKgCustomPriceOverridden
                                        ? `${is500g ? 'bg-teal-700' : 'bg-emerald-700'} text-white shadow-2xs`
                                        : 'border border-stone-300 bg-white text-stone-700 hover:bg-stone-100 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-300'
                                }`}
                            >
                                Diskon 10%
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    if (kgDiscountType === 'percent' && Number(kgDiscountValue) === 15) {
                                        setKgDiscountType('none');
                                        setKgDiscountValue('');
                                    } else {
                                        setKgDiscountType('percent');
                                        setKgDiscountValue(15);
                                    }
                                    setIsKgCustomPriceOverridden(false);
                                }}
                                className={`rounded-lg px-2.5 py-1 text-xs font-bold transition ${
                                    kgDiscountType === 'percent' && Number(kgDiscountValue) === 15 && !isKgCustomPriceOverridden
                                        ? `${is500g ? 'bg-teal-700' : 'bg-emerald-700'} text-white shadow-2xs`
                                        : 'border border-stone-300 bg-white text-stone-700 hover:bg-stone-100 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-300'
                                }`}
                            >
                                Diskon 15%
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    if (kgDiscountType === 'nominal') {
                                        setKgDiscountType('none');
                                        setKgDiscountValue('');
                                    } else {
                                        setKgDiscountType('nominal');
                                    }
                                    setIsKgCustomPriceOverridden(false);
                                }}
                                className={`rounded-lg px-2.5 py-1 text-xs font-bold transition ${
                                    kgDiscountType === 'nominal' && !isKgCustomPriceOverridden
                                        ? `${is500g ? 'bg-teal-700' : 'bg-emerald-700'} text-white shadow-2xs`
                                        : 'border border-stone-300 bg-white text-stone-700 hover:bg-stone-100 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-300'
                                }`}
                            >
                                Potongan Rp
                            </button>
                        </div>

                        {kgDiscountType === 'nominal' && (
                            <div className="flex items-center gap-2 pt-1">
                                <span className="text-[11px] font-semibold text-stone-700 dark:text-stone-300">
                                    Nominal Potongan:
                                </span>
                                <div className="relative w-44">
                                    <span className="absolute top-1/2 left-2.5 -translate-y-1/2 text-xs font-bold text-stone-500">
                                        Rp
                                    </span>
                                    <input
                                        type="number"
                                        min="0"
                                        step="1000"
                                        value={kgDiscountValue}
                                        onChange={(e) => setKgDiscountValue(e.target.value)}
                                        placeholder="Contoh: 15000"
                                        className="w-full rounded-lg border border-stone-300 bg-white py-1.5 pr-2.5 pl-8 text-xs font-bold text-stone-900 focus:outline-none dark:border-stone-700 dark:bg-stone-900 dark:text-white"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Toggle Override Harga Final Langsung */}
                        <div className="border-t border-stone-200/80 pt-2 dark:border-stone-700/80">
                            <label className="flex cursor-pointer items-center gap-2 text-[11px] font-medium text-stone-700 dark:text-stone-300">
                                <input
                                    type="checkbox"
                                    checked={isKgCustomPriceOverridden}
                                    onChange={(e) => {
                                        setIsKgCustomPriceOverridden(e.target.checked);
                                        if (e.target.checked && !kgCustomFinalPrice) {
                                            setKgCustomFinalPrice(calculatedFinalPrice);
                                        }
                                    }}
                                    className={`h-3.5 w-3.5 rounded border-stone-300 ${
                                        is500g ? 'text-teal-600 focus:ring-teal-500' : 'text-emerald-600 focus:ring-emerald-500'
                                    }`}
                                />
                                <span>Atur / Bulatkan Harga Jual Final {is500g ? '500 gr' : '1 Kg'} Secara Manual</span>
                            </label>

                            {isKgCustomPriceOverridden && (
                                <div className="mt-2 flex items-center gap-2">
                                    <span className="text-xs font-bold text-stone-800 dark:text-stone-200">
                                        Harga Jual Final {is500g ? '500 gr' : '1 Kg'}:
                                    </span>
                                    <div className="relative w-48">
                                        <span
                                            className={`absolute top-1/2 left-2.5 -translate-y-1/2 text-xs font-bold ${
                                                is500g ? 'text-teal-600' : 'text-emerald-600'
                                            }`}
                                        >
                                            Rp
                                        </span>
                                        <input
                                            type="number"
                                            min="0"
                                            step="1000"
                                            value={kgCustomFinalPrice}
                                            onChange={(e) => setKgCustomFinalPrice(e.target.value)}
                                            className={`w-full rounded-lg border bg-white py-1.5 pr-2.5 pl-8 text-xs font-black focus:ring-1 focus:outline-none dark:bg-stone-900 ${
                                                is500g
                                                    ? 'border-teal-400 text-teal-900 focus:ring-teal-500 dark:border-teal-600 dark:text-teal-100'
                                                    : 'border-emerald-400 text-emerald-900 focus:ring-emerald-500 dark:border-emerald-600 dark:text-emerald-100'
                                            }`}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* 3. Jumlah Pembelian (Qty) */}
                    <div className="space-y-1">
                        <label className="text-[11px] font-bold text-stone-800 dark:text-stone-200">
                            Jumlah Pembelian ({is500g ? 'Berapa Pcs 500g' : 'Berapa Kg'}):
                        </label>
                        <div className="flex items-center gap-3 rounded-xl border border-stone-300 bg-white px-3 py-1.5 dark:border-stone-700 dark:bg-stone-900">
                            <button
                                type="button"
                                onClick={() => setKgQuantity((q) => Math.max(1, q - 1))}
                                className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg bg-stone-100 font-bold text-stone-700 hover:bg-stone-200 active:scale-95 dark:bg-stone-800 dark:text-stone-200 dark:hover:bg-stone-700"
                            >
                                <Minus className="h-4 w-4" />
                            </button>
                            <div className="flex-1 text-center font-black text-stone-900 dark:text-white">
                                {kgQuantity} {is500g ? 'pcs' : 'Kg'} ({kgQuantity * targetGrams} gr)
                            </div>
                            <button
                                type="button"
                                onClick={() => setKgQuantity((q) => q + 1)}
                                className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg bg-stone-100 font-bold text-stone-700 hover:bg-stone-200 active:scale-95 dark:bg-stone-800 dark:text-stone-200 dark:hover:bg-stone-700"
                            >
                                <Plus className="h-4 w-4" />
                            </button>
                        </div>
                    </div>

                    {/* 5. Ringkasan Finansial Real-time */}
                    <div
                        className={`rounded-2xl border-2 p-4 shadow-xs ${
                            is500g
                                ? 'border-teal-500 bg-teal-50/90 text-teal-950 dark:border-teal-600 dark:bg-teal-950/40 dark:text-teal-100'
                                : 'border-emerald-500 bg-emerald-50/90 text-emerald-950 dark:border-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-100'
                        }`}
                    >
                        <div
                            className={`flex items-center justify-between border-b pb-2 ${
                                is500g ? 'border-teal-200/80 dark:border-teal-800/80' : 'border-emerald-200/80 dark:border-emerald-800/80'
                            }`}
                        >
                            <span
                                className={`text-xs font-semibold ${
                                    is500g ? 'text-teal-800 dark:text-teal-300' : 'text-emerald-800 dark:text-emerald-300'
                                }`}
                            >
                                Harga Jual per {is500g ? '500 gr' : '1 Kg'} ({kgMultiplier}× {baseWeight}g)
                            </span>
                            <span
                                className={`font-mono text-sm font-black ${
                                    is500g ? 'text-teal-900 dark:text-teal-200' : 'text-emerald-900 dark:text-emerald-200'
                                }`}
                            >
                                Rp {formatRp(effectivePricePerUnit)}
                            </span>
                        </div>

                        {effectiveDiscount > 0 && (
                            <div
                                className={`flex items-center justify-between pt-1.5 text-[11px] ${
                                    is500g ? 'text-teal-700 dark:text-teal-300' : 'text-emerald-700 dark:text-emerald-300'
                                }`}
                            >
                                <span>Total Potongan Diskon</span>
                                <span className="font-bold text-rose-600 dark:text-rose-400">
                                    - Rp {formatRp(effectiveDiscount)}
                                </span>
                            </div>
                        )}

                        {baseCostTotal > 0 && (
                            <div className="flex items-center justify-between pt-1.5 text-[11px] text-stone-600 dark:text-stone-400">
                                <span>Estimasi Laba Kotor per {is500g ? '500 gr' : '1 Kg'}</span>
                                <span
                                    className={`font-bold ${
                                        is500g ? 'text-teal-700 dark:text-teal-300' : 'text-emerald-700 dark:text-emerald-300'
                                    }`}
                                >
                                    +Rp {formatRp(profitPerUnit)} {profitMargin > 0 ? `(${profitMargin}%)` : ''}
                                </span>
                            </div>
                        )}

                        <div className="flex items-center justify-between pt-2.5 text-base font-black text-brand-950 dark:text-white">
                            <span>TOTAL ({kgQuantity} {is500g ? 'pcs / ' + kgQuantity * 500 + ' gr' : 'Kg'}):</span>
                            <span
                                className={`font-mono text-lg ${
                                    is500g ? 'text-teal-700 dark:text-teal-400' : 'text-emerald-700 dark:text-emerald-400'
                                }`}
                            >
                                Rp {formatRp(subtotal)}
                            </span>
                        </div>
                    </div>

                    {/* Modal Actions */}
                    <div className="flex items-center gap-2 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 cursor-pointer whitespace-nowrap rounded-xl border border-stone-300 px-3 py-2.5 text-center font-bold text-stone-700 transition hover:bg-stone-100 dark:border-stone-700 dark:text-stone-300 dark:hover:bg-stone-800"
                        >
                            Batal
                        </button>
                        <button
                            type="button"
                            onClick={() => onAddToCart(false)}
                            className={`flex flex-2 cursor-pointer items-center justify-center gap-1 whitespace-nowrap rounded-xl px-3 py-2.5 font-bold text-white shadow-sm transition active:scale-95 sm:gap-1.5 sm:px-4 ${
                                is500g
                                    ? 'bg-teal-700 hover:bg-teal-800 dark:bg-teal-600 dark:hover:bg-teal-500'
                                    : 'bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-500'
                            }`}
                            title="Masukkan ke keranjang"
                        >
                            <ShoppingCart className="h-4 w-4 shrink-0" />
                            <span className="hidden sm:inline">+ Keranjang</span>
                            <span className="sm:hidden text-sm font-black leading-none">+</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => onAddToCart(true)}
                            className="flex cursor-pointer items-center justify-center gap-1.5 whitespace-nowrap rounded-xl bg-amber-500 px-3 py-2.5 font-black text-stone-950 shadow-sm transition hover:bg-amber-600 active:scale-95 sm:px-4"
                            title="Masukkan ke keranjang dan langsung proses pembayaran"
                        >
                            <CreditCard className="h-4 w-4 shrink-0" />
                            <span>Bayar Langsung</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
