import React from 'react';
import { X } from 'lucide-react';
import { Product, ProductVariant } from '@/types/pos';

interface CybrBeanOption {
    name: string;
    origin?: string;
    process?: string;
    price_per_10g: number;
    cost_price_per_10g?: number;
}

interface CybrModalProps {
    isOpen: boolean;
    product: Product | null;
    onClose: () => void;
    cybrRatioA: number;
    setCybrRatioA: (val: number) => void;
    cybrSelectedVariant: ProductVariant | null;
    setCybrSelectedVariant: (val: ProductVariant) => void;
    availableCybrVariants: ProductVariant[];
    cybrBeanA: CybrBeanOption | null;
    setCybrBeanA: (val: CybrBeanOption) => void;
    cybrBeanB: CybrBeanOption | null;
    setCybrBeanB: (val: CybrBeanOption) => void;
    availableCybrBeans: CybrBeanOption[];
    isSameCybrBean: boolean;
    cybrCustomName: string;
    setCybrCustomName: (val: string) => void;
    cybrCalculatedCostPrice: number;
    cybrCalculatedPrice: number;
    cybrMarginPct: number | string;
    handleAddCybrToCart: () => void;
    formatRp: (val: number) => string;
}

export const CybrModal: React.FC<CybrModalProps> = ({
    isOpen,
    product,
    onClose,
    cybrRatioA,
    setCybrRatioA,
    cybrSelectedVariant,
    setCybrSelectedVariant,
    availableCybrVariants,
    cybrBeanA,
    setCybrBeanA,
    cybrBeanB,
    setCybrBeanB,
    availableCybrBeans,
    isSameCybrBean,
    cybrCustomName,
    setCybrCustomName,
    cybrCalculatedCostPrice,
    cybrCalculatedPrice,
    cybrMarginPct,
    handleAddCybrToCart,
    formatRp,
}) => {
    if (!isOpen || !product) return null;

    return (
        <div className="pos-modal-overlay fixed inset-0 z-50 flex animate-in items-center justify-center bg-black/70 p-3 sm:p-4 fade-in">
            <div className="pos-gpu-layer w-full max-w-lg touch-pan-y space-y-4 rounded-3xl border border-stone-200 bg-white p-5 text-stone-900 shadow-2xl dark:border-stone-800 dark:bg-stone-900 dark:text-stone-100 max-h-[92vh] overflow-y-auto overscroll-y-contain">
                {/* Header */}
                <div className="flex items-start justify-between border-b border-stone-100 pb-3 dark:border-stone-800">
                    <div className="flex items-center gap-3">
                        <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 flex items-center justify-center text-white text-xl shadow-md">
                            🎨
                        </div>
                        <div>
                            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold uppercase tracking-wider">
                                C.Y.B.R Studio Racik
                            </div>
                            <h3 className="text-base font-black text-brand-950 dark:text-white">
                                Custom Your Blend Ratio
                            </h3>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="cursor-pointer rounded-xl p-1.5 text-stone-400 hover:bg-stone-100 hover:text-stone-700 dark:hover:bg-stone-800 dark:hover:text-stone-200"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Komponen Biji Kopi A & B */}
                <div className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {/* Biji A */}
                        <div className="rounded-2xl border border-stone-200 p-3 bg-stone-50/70 dark:border-stone-800 dark:bg-stone-800/50 space-y-1.5">
                            <label className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center justify-between">
                                <span>Komponen A ({cybrRatioA}%)</span>
                                <span className="font-mono text-stone-500 font-semibold">
                                    {Math.round((cybrRatioA / 100) * (cybrSelectedVariant?.weight_grams || 200))}g
                                </span>
                            </label>
                            <select
                                value={cybrBeanA?.name || ''}
                                onChange={(e) => {
                                    const found = availableCybrBeans.find((b) => b.name === e.target.value);
                                    if (found) setCybrBeanA(found);
                                }}
                                className="w-full rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 px-3 py-2 text-xs font-semibold text-stone-900 dark:text-white"
                            >
                                {availableCybrBeans.map((b) => (
                                    <option key={b.name} value={b.name}>
                                        {b.name} (Rp {formatRp(b.price_per_10g)}/10g)
                                    </option>
                                ))}
                            </select>
                            {cybrBeanA && (
                                <div className="text-[10px] text-stone-500 flex items-center justify-between">
                                    <span>
                                        {cybrBeanA.origin || 'Kawi'} • {cybrBeanA.process || 'Natural'}
                                    </span>
                                    {cybrBeanA.cost_price_per_10g ? (
                                        <span className="text-amber-600 dark:text-amber-400 font-mono font-medium">
                                            HPP: Rp {formatRp(cybrBeanA.cost_price_per_10g)}/10g
                                        </span>
                                    ) : null}
                                </div>
                            )}
                        </div>

                        {/* Biji B */}
                        <div className="rounded-2xl border border-stone-200 p-3 bg-stone-50/70 dark:border-stone-800 dark:bg-stone-800/50 space-y-1.5">
                            <label className="text-[11px] font-bold uppercase tracking-wider text-teal-700 dark:text-teal-400 flex items-center justify-between">
                                <span>Komponen B ({100 - cybrRatioA}%)</span>
                                <span className="font-mono text-stone-500 font-semibold">
                                    {Math.round(((100 - cybrRatioA) / 100) * (cybrSelectedVariant?.weight_grams || 200))}g
                                </span>
                            </label>
                            <select
                                value={cybrBeanB?.name || ''}
                                onChange={(e) => {
                                    const found = availableCybrBeans.find((b) => b.name === e.target.value);
                                    if (found) setCybrBeanB(found);
                                }}
                                className="w-full rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 px-3 py-2 text-xs font-semibold text-stone-900 dark:text-white"
                            >
                                {availableCybrBeans.map((b) => (
                                    <option key={b.name} value={b.name}>
                                        {b.name} (Rp {formatRp(b.price_per_10g)}/10g)
                                    </option>
                                ))}
                            </select>
                            {cybrBeanB && (
                                <div className="text-[10px] text-stone-500 flex items-center justify-between">
                                    <span>
                                        {cybrBeanB.origin || 'Malang'} • {cybrBeanB.process || 'Washed'}
                                    </span>
                                    {cybrBeanB.cost_price_per_10g ? (
                                        <span className="text-amber-600 dark:text-amber-400 font-mono font-medium">
                                            HPP: Rp {formatRp(cybrBeanB.cost_price_per_10g)}/10g
                                        </span>
                                    ) : null}
                                </div>
                            )}
                        </div>
                    </div>

                    {isSameCybrBean && (
                        <div className="p-2.5 rounded-xl bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 text-xs font-semibold flex items-center gap-2">
                            <span>⚠️ Komponen A dan B harus berbeda varietas biji kopi.</span>
                        </div>
                    )}

                    {/* Slider Rasio */}
                    <div className="p-4 rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-stone-700 dark:text-stone-300">
                                Proporsi Rasio Racikan
                            </span>
                            <div className="flex items-center gap-2 text-xs font-black font-mono">
                                <span className="text-emerald-700 dark:text-emerald-400">{cybrRatioA}%</span>
                                <span className="text-stone-400">:</span>
                                <span className="text-teal-700 dark:text-teal-400">{100 - cybrRatioA}%</span>
                            </div>
                        </div>

                        <input
                            type="range"
                            min="10"
                            max="90"
                            step="10"
                            value={cybrRatioA}
                            onChange={(e) => setCybrRatioA(Number(e.target.value))}
                            className="w-full accent-emerald-700 cursor-pointer"
                        />

                        {/* Quick Preset Buttons */}
                        <div className="flex items-center justify-center gap-1.5 pt-1">
                            {[
                                { label: '80 : 20', val: 80 },
                                { label: '70 : 30', val: 70 },
                                { label: '60 : 40', val: 60 },
                                { label: '50 : 50', val: 50 },
                                { label: '30 : 70', val: 30 },
                            ].map((p) => (
                                <button
                                    key={p.val}
                                    type="button"
                                    onClick={() => setCybrRatioA(p.val)}
                                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold font-mono transition cursor-pointer ${
                                        cybrRatioA === p.val
                                            ? 'bg-emerald-700 text-white shadow-xs'
                                            : 'bg-stone-100 text-stone-700 hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-300'
                                    }`}
                                >
                                    {p.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Pilihan Ukuran Kemasan Saja (Tanpa Opsi Gilingan) */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-stone-700 dark:text-stone-300">
                            Pilih Ukuran Kemasan:
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                            {availableCybrVariants.map((v) => {
                                const isSelected = cybrSelectedVariant?.id === v.id;
                                return (
                                    <button
                                        key={v.id}
                                        type="button"
                                        onClick={() => setCybrSelectedVariant(v)}
                                        className={`p-3 rounded-2xl border text-center transition cursor-pointer ${
                                            isSelected
                                                ? 'border-emerald-600 bg-emerald-50/80 text-emerald-950 font-bold dark:border-emerald-500 dark:bg-emerald-950/40 dark:text-emerald-200 shadow-xs'
                                                : 'border-stone-200 bg-white text-stone-700 hover:border-stone-300 dark:border-stone-800 dark:bg-stone-900 dark:text-stone-300'
                                        }`}
                                    >
                                        <div className="text-sm font-black">{v.label}</div>
                                        <div className="text-[10px] text-stone-500 mt-0.5 font-medium">
                                            {v.weight_grams} gram
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Nama Racikan (Opsional) */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-stone-700 dark:text-stone-300">
                            Nama Kustom Blend (Opsional):
                        </label>
                        <input
                            type="text"
                            placeholder="Contoh: Morning Sanubari / Blend Mas Budi"
                            value={cybrCustomName}
                            onChange={(e) => setCybrCustomName(e.target.value)}
                            className="w-full rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 px-3.5 py-2 text-xs font-semibold text-stone-900 dark:text-white placeholder:text-stone-400"
                        />
                    </div>

                    {/* Ringkasan & Kalkulasi Real-time */}
                    <div className="p-4 rounded-2xl bg-gradient-to-br from-stone-900 to-brand-950 text-white space-y-2 border border-stone-800 shadow-md">
                        <div className="flex items-center justify-between text-xs text-stone-300 border-b border-stone-800 pb-2">
                            <span>Resep Blend:</span>
                            <span className="font-mono font-bold text-emerald-400">
                                {cybrRatioA}% {cybrBeanA?.name || 'A'} + {100 - cybrRatioA}% {cybrBeanB?.name || 'B'}
                            </span>
                        </div>
                        <div className="flex items-center justify-between text-xs text-stone-300">
                            <span>Total Gramatur:</span>
                            <span className="font-mono font-semibold">{cybrSelectedVariant?.weight_grams || 200}g</span>
                        </div>
                        {cybrCalculatedCostPrice > 0 && (
                            <div className="flex items-center justify-between text-xs text-amber-300">
                                <span>Estimasi HPP Modal:</span>
                                <span className="font-mono font-semibold">Rp {formatRp(cybrCalculatedCostPrice)}</span>
                            </div>
                        )}
                        <div className="flex items-baseline justify-between pt-1 border-t border-stone-800">
                            <span className="text-xs font-bold text-stone-200">Total Harga Jual:</span>
                            <div className="text-right">
                                <span className="text-xl font-black text-emerald-400">
                                    Rp {formatRp(cybrCalculatedPrice)}
                                </span>
                                {cybrCalculatedCostPrice > 0 && (
                                    <div className="text-[10px] text-emerald-300 font-mono">
                                        Laba: Rp {formatRp(cybrCalculatedPrice - cybrCalculatedCostPrice)} ({cybrMarginPct}%)
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 pt-2 border-t border-stone-100 dark:border-stone-800">
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 rounded-xl border border-stone-300 dark:border-stone-700 px-4 py-2.5 text-xs font-bold text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition cursor-pointer"
                    >
                        Batal
                    </button>
                    <button
                        type="button"
                        disabled={isSameCybrBean || !cybrBeanA || !cybrBeanB || !cybrSelectedVariant}
                        onClick={handleAddCybrToCart}
                        className={`flex-2 rounded-xl px-4 py-2.5 text-xs font-bold text-white shadow-md transition cursor-pointer flex items-center justify-center gap-2 ${
                            isSameCybrBean || !cybrBeanA || !cybrBeanB || !cybrSelectedVariant
                                ? 'bg-stone-400 cursor-not-allowed opacity-60'
                                : 'bg-emerald-700 hover:bg-emerald-800 active:scale-[0.98]'
                        }`}
                    >
                        <span>☕ Tambah Racikan ke Keranjang</span>
                    </button>
                </div>
            </div>
        </div>
    );
};
