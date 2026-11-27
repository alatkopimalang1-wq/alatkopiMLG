import React from 'react';
import { Pencil, RotateCcw, X } from 'lucide-react';
import { CartItem } from '@/types/pos';

interface TempPriceModalProps {
    item: CartItem | null;
    onClose: () => void;
    tempPriceValue: string;
    setTempPriceValue: (val: string) => void;
    onSave: () => void;
    onReset: () => void;
    formatRp: (val: number) => string;
}

export const TempPriceModal: React.FC<TempPriceModalProps> = ({
    item,
    onClose,
    tempPriceValue,
    setTempPriceValue,
    onSave,
    onReset,
    formatRp,
}) => {
    if (!item) return null;

    const originalPrice = item.original_price ?? item.price;
    const parsedPrice = Math.max(0, Number(tempPriceValue) || 0);
    const isModified = parsedPrice !== originalPrice;

    return (
        <div className="pos-modal-overlay fixed inset-0 z-50 flex animate-in items-center justify-center bg-black/60 p-4 fade-in">
            <div className="pos-gpu-layer w-full max-w-md overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-2xl dark:border-stone-800 dark:bg-stone-900">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-stone-800 bg-[#273a41] p-4 text-white dark:bg-stone-950">
                    <div className="flex items-center gap-2 overflow-hidden">
                        <div className="rounded-lg bg-white/10 p-1.5 text-amber-300">
                            <Pencil className="h-4 w-4" />
                        </div>
                        <div className="overflow-hidden">
                            <h3 className="truncate text-sm leading-tight font-bold text-white">
                                Ubah Harga Sementara: {item.product_name}
                            </h3>
                            <p className="text-[11px] text-stone-300">
                                {item.variant_label} • Qty: {item.quantity}
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="shrink-0 cursor-pointer rounded-lg p-1.5 text-stone-400 transition hover:bg-white/10 hover:text-white"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Body */}
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        onSave();
                    }}
                    className="space-y-4 p-5"
                >
                    <div className="flex items-center justify-between rounded-xl border border-stone-200 bg-stone-50 px-3.5 py-2.5 text-xs dark:border-stone-700 dark:bg-stone-800/70">
                        <span className="font-semibold text-stone-600 dark:text-stone-300">
                            Harga Asli Produk:
                        </span>
                        <span className="font-bold text-stone-900 dark:text-white">
                            Rp {formatRp(originalPrice)}
                        </span>
                    </div>

                    <div>
                        <label className="mb-1.5 block text-xs font-bold text-stone-700 dark:text-stone-200">
                            Harga Satuan Sementara (Rp):
                        </label>
                        <div className="relative">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-sm font-bold text-stone-400">
                                Rp
                            </div>
                            <input
                                type="number"
                                autoFocus
                                min="0"
                                step="100"
                                value={tempPriceValue}
                                onChange={(e) => setTempPriceValue(e.target.value)}
                                placeholder="0"
                                className="w-full rounded-xl border border-stone-300 bg-white py-2.5 pr-4 pl-10 text-base font-bold text-stone-900 focus:border-brand-600 focus:ring-1 focus:ring-brand-600 focus:outline-none dark:border-stone-700 dark:bg-stone-800 dark:text-white dark:focus:border-emerald-500"
                            />
                        </div>
                        <p className="mt-1.5 text-[11px] text-stone-500 dark:text-stone-400">
                            Perubahan harga ini hanya berlaku sementara untuk transaksi kasir saat ini dan tidak disimpan ke pengaturan harga produk.
                        </p>
                    </div>

                    <div className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50/70 px-3.5 py-2.5 text-xs dark:border-emerald-900/60 dark:bg-emerald-950/30">
                        <span className="font-semibold text-emerald-900 dark:text-emerald-200">
                            Subtotal ({item.quantity}x):
                        </span>
                        <span className="text-sm font-black text-emerald-700 dark:text-emerald-400">
                            Rp {formatRp(parsedPrice * item.quantity)}
                        </span>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                        {item.original_price !== undefined && item.original_price !== item.price && (
                            <button
                                type="button"
                                onClick={onReset}
                                className="flex cursor-pointer items-center gap-1 rounded-xl border border-amber-300 bg-amber-50 px-3 py-2.5 text-xs font-bold text-amber-800 transition hover:bg-amber-100 dark:border-amber-700 dark:bg-amber-950/40 dark:text-amber-300"
                                title="Kembalikan ke harga asli produk"
                            >
                                <RotateCcw className="h-3.5 w-3.5" />
                                <span>Reset</span>
                            </button>
                        )}
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 cursor-pointer rounded-xl border border-stone-300 px-3 py-2.5 text-xs font-bold text-stone-700 transition hover:bg-stone-100 dark:border-stone-700 dark:text-stone-300 dark:hover:bg-stone-800"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            className={`flex-2 cursor-pointer rounded-xl px-4 py-2.5 text-xs font-bold text-white shadow-sm transition active:scale-95 ${
                                isModified
                                    ? 'bg-brand-700 hover:bg-brand-800 dark:bg-emerald-600 dark:hover:bg-emerald-500'
                                    : 'bg-stone-700 hover:bg-stone-800 dark:bg-stone-600'
                            }`}
                        >
                            Simpan Harga Sementara
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
