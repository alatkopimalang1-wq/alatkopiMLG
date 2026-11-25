import React from 'react';
import { X, Calculator } from 'lucide-react';
import { Product, ProductVariant } from '@/types/pos';

interface VariantPickerModalProps {
    product: Product | null;
    onClose: () => void;
    onSelectVariant: (product: Product, variant: ProductVariant) => void;
    onOpenCalculator: (product: Product, mode: '500g' | '1000g') => void;
    formatRp: (val: number) => string;
}

export const VariantPickerModal: React.FC<VariantPickerModalProps> = ({
    product,
    onClose,
    onSelectVariant,
    onOpenCalculator,
    formatRp,
}) => {
    if (!product) return null;

    return (
        <div className="pos-modal-overlay fixed inset-0 z-50 flex animate-in items-center justify-center bg-black/60 p-4 fade-in">
            <div className="pos-gpu-layer w-full max-w-md space-y-4 rounded-2xl border border-stone-200 bg-white p-5 text-stone-900 shadow-2xl dark:border-stone-800 dark:bg-stone-900 dark:text-stone-100">
                <div className="flex items-start justify-between border-b border-stone-100 pb-3 dark:border-stone-800">
                    <div className="flex items-center gap-3">
                        <img
                            src={product.image || '/brand/logo-circle.png'}
                            alt={product.name}
                            onError={(e) => {
                                const target = e.currentTarget;
                                if (!target.src.endsWith('/brand/logo-circle.png')) {
                                    target.src = '/brand/logo-circle.png';
                                }
                            }}
                            className="h-12 w-12 rounded-xl border border-stone-100 bg-stone-50 object-cover dark:border-stone-700 dark:bg-stone-800"
                        />
                        <div>
                            <h3 className="text-sm font-bold text-brand-950 dark:text-white">
                                {product.name}
                            </h3>
                            <p className="text-xs text-stone-500 dark:text-stone-300">
                                Pilih Gramatur / Ukuran Kemasan:
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

                <div className="max-h-72 touch-pan-y space-y-2 overflow-y-auto overscroll-y-contain pt-1">
                    {(product.variants || []).map((v) => (
                        <button
                            key={v.id}
                            type="button"
                            onClick={() => {
                                onSelectVariant(product, v);
                                onClose();
                            }}
                            className="group flex w-full cursor-pointer items-center justify-between rounded-xl border border-stone-200 bg-stone-50 p-3 text-left transition hover:border-brand-600 hover:bg-brand-50/70 dark:border-stone-700 dark:bg-stone-800/80 dark:hover:border-stone-600 dark:hover:bg-stone-800"
                        >
                            <div className="flex items-center gap-2">
                                <div className="h-2.5 w-2.5 rounded-full bg-brand-700 dark:bg-amber-400" />
                                <span className="text-sm font-semibold text-stone-800 group-hover:text-brand-950 dark:text-stone-100 dark:group-hover:text-white">
                                    {v.label}
                                </span>
                                {v.sku && (
                                    <span className="font-mono text-[10px] text-stone-400 dark:text-stone-400">
                                        ({v.sku})
                                    </span>
                                )}
                                <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                    (v.stock ?? 0) <= 0
                                        ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                                        : (v.stock ?? 0) <= 10
                                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                                        : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                }`}>
                                    Stok: {v.stock ?? 0}
                                </span>
                            </div>
                            <div className="text-sm font-bold text-brand-700 group-hover:text-brand-800 dark:text-emerald-400 dark:group-hover:text-emerald-300">
                                Rp {formatRp(v.price)}
                            </div>
                        </button>
                    ))}
                </div>

                <div className="pt-2 text-center text-xs text-stone-400 dark:text-stone-400">
                    Pilihan ukuran akan langsung masuk ke keranjang kasir
                </div>

                {/* Quick Action: Hitung Otomatis 500 gr & 1 Kg */}
                <div className="rounded-xl border border-dashed border-emerald-300 bg-emerald-50/70 p-3 dark:border-emerald-800 dark:bg-emerald-950/30">
                    <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-2.5">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300">
                                <Calculator className="h-4 w-4" />
                            </div>
                            <div>
                                <div className="text-xs font-bold text-emerald-950 dark:text-white">
                                    Kalkulator Ukuran 500 gr & 1 Kg
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-1.5 self-end sm:self-auto">
                            <button
                                type="button"
                                onClick={() => {
                                    onClose();
                                    onOpenCalculator(product, '500g');
                                }}
                                className="cursor-pointer rounded-lg border border-teal-300 bg-teal-50 px-2.5 py-1.5 text-xs font-bold text-teal-800 shadow-2xs transition hover:bg-teal-100 active:scale-95 dark:border-teal-700 dark:bg-teal-950/60 dark:text-teal-300"
                            >
                                Hitung 500 gr →
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    onClose();
                                    onOpenCalculator(product, '1000g');
                                }}
                                className="cursor-pointer rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white shadow-xs transition hover:bg-emerald-700 active:scale-95 dark:bg-emerald-500 dark:hover:bg-emerald-600"
                            >
                                Hitung 1 Kg →
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
