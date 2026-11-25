import React from 'react';
import { Tag, X, Percent } from 'lucide-react';
import { CartItem } from '@/types/pos';

interface ItemDiscountModalProps {
    item: CartItem | null;
    onClose: () => void;
    itemDiscountType: 'fixed' | 'percent';
    setItemDiscountType: (type: 'fixed' | 'percent') => void;
    itemDiscountValue: string;
    setItemDiscountValue: (val: string) => void;
    removeItemDiscount: (itemId: string) => void;
    saveItemDiscount: () => void;
    formatRp: (val: number) => string;
}

export const ItemDiscountModal: React.FC<ItemDiscountModalProps> = ({
    item,
    onClose,
    itemDiscountType,
    setItemDiscountType,
    itemDiscountValue,
    setItemDiscountValue,
    removeItemDiscount,
    saveItemDiscount,
    formatRp,
}) => {
    if (!item) return null;

    const parsedVal = parseFloat(itemDiscountValue) || 0;
    const lineGross = item.price * item.quantity;
    let previewAmount = 0;
    if (parsedVal > 0) {
        if (itemDiscountType === 'percent') {
            const pct = Math.min(100, Math.max(0, parsedVal));
            previewAmount = Math.round((lineGross * pct) / 100);
        } else {
            previewAmount = Math.min(lineGross, Math.max(0, parsedVal));
        }
    }
    const finalLine = Math.max(0, lineGross - previewAmount);

    return (
        <div className="pos-modal-overlay fixed inset-0 z-50 flex animate-in items-center justify-center bg-black/60 p-4 fade-in">
            <div className="pos-gpu-layer w-full max-w-md overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-2xl dark:border-stone-800 dark:bg-stone-900">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-stone-800 bg-[#273a41] p-4 text-white dark:bg-stone-950">
                    <div className="flex items-center gap-2">
                        <div className="rounded-lg bg-white/10 p-1.5 text-emerald-300 dark:text-emerald-400">
                            <Tag className="h-5 w-5" />
                        </div>
                        <div className="overflow-hidden">
                            <h3 className="truncate text-sm leading-tight font-bold text-white">
                                Diskon Produk: {item.product_name}
                            </h3>
                            <p className="text-[11px] text-stone-300">
                                {item.variant_label} • {item.quantity} x Rp {formatRp(item.price)}
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
                <div className="space-y-4 p-5">
                    {/* Type Switcher */}
                    <div>
                        <label className="mb-1.5 block text-xs font-bold text-stone-700 dark:text-stone-200">
                            Tipe Diskon Produk:
                        </label>
                        <div className="grid grid-cols-2 gap-2 rounded-xl border border-stone-200 bg-stone-100 p-1 dark:border-stone-700 dark:bg-stone-800">
                            <button
                                type="button"
                                onClick={() => setItemDiscountType('percent')}
                                className={`flex cursor-pointer items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold transition ${
                                    itemDiscountType === 'percent'
                                        ? 'border border-stone-200/80 bg-white text-stone-900 shadow-xs dark:border-stone-600 dark:bg-stone-700 dark:text-white'
                                        : 'text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-200'
                                }`}
                            >
                                <Percent className="h-3.5 w-3.5" />
                                <span>Persentase (%)</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setItemDiscountType('fixed')}
                                className={`flex cursor-pointer items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold transition ${
                                    itemDiscountType === 'fixed'
                                        ? 'border border-stone-200/80 bg-white text-stone-900 shadow-xs dark:border-stone-600 dark:bg-stone-700 dark:text-white'
                                        : 'text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-200'
                                }`}
                            >
                                <span>Nominal (Rp)</span>
                            </button>
                        </div>
                    </div>

                    {/* Value Input */}
                    <div>
                        <label className="mb-1.5 block text-xs font-bold text-stone-700 dark:text-stone-200">
                            {itemDiscountType === 'percent'
                                ? 'Persentase Diskon (%):'
                                : 'Nominal Potongan Total Produk (Rp):'}
                        </label>
                        <div className="relative">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-sm font-bold text-stone-400 dark:text-stone-400">
                                {itemDiscountType === 'percent' ? '%' : 'Rp'}
                            </div>
                            <input
                                type="number"
                                autoFocus
                                min="0"
                                max={
                                    itemDiscountType === 'percent'
                                        ? '100'
                                        : String(item.price * item.quantity)
                                }
                                value={itemDiscountValue}
                                onChange={(e) => setItemDiscountValue(e.target.value)}
                                placeholder={
                                    itemDiscountType === 'percent'
                                        ? 'Contoh: 10'
                                        : 'Contoh: 5000'
                                }
                                className="w-full rounded-xl border border-stone-300 bg-white py-2.5 pr-4 pl-10 text-base font-bold text-stone-900 focus:border-brand-600 focus:bg-white focus:ring-1 focus:ring-brand-600 focus:outline-none dark:border-stone-700 dark:bg-stone-800 dark:text-white dark:focus:border-emerald-500 dark:focus:bg-stone-800"
                            />
                        </div>
                    </div>

                    {/* Quick Preset Chips */}
                    <div>
                        <span className="mb-1.5 block text-[11px] font-semibold text-stone-500 dark:text-stone-400">
                            Pilihan Cepat:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                            {itemDiscountType === 'percent'
                                ? [5, 10, 15, 20, 25, 50].map((pct) => (
                                      <button
                                          key={pct}
                                          type="button"
                                          onClick={() => setItemDiscountValue(String(pct))}
                                          className={`cursor-pointer rounded-lg border px-3 py-1.5 text-xs font-bold transition ${
                                              itemDiscountValue === String(pct)
                                                  ? 'border-[#273a41] bg-[#273a41] text-white shadow-xs dark:border-emerald-600 dark:bg-emerald-600'
                                                  : 'border-stone-200 bg-stone-50 text-stone-700 hover:border-stone-300 hover:bg-stone-100 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-200 dark:hover:bg-stone-700'
                                          }`}
                                      >
                                          {pct}%
                                      </button>
                                  ))
                                : [1000, 2000, 5000, 10000, 20000].map((nom) => (
                                      <button
                                          key={nom}
                                          type="button"
                                          onClick={() => setItemDiscountValue(String(nom))}
                                          className={`cursor-pointer rounded-lg border px-2.5 py-1.5 text-xs font-bold transition ${
                                              itemDiscountValue === String(nom)
                                                  ? 'border-[#273a41] bg-[#273a41] text-white shadow-xs dark:border-emerald-600 dark:bg-emerald-600'
                                                  : 'border-stone-200 bg-stone-50 text-stone-700 hover:border-stone-300 hover:bg-stone-100 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-200 dark:hover:bg-stone-700'
                                          }`}
                                      >
                                          Rp {formatRp(nom)}
                                      </button>
                                  ))}
                        </div>
                    </div>

                    {/* Live Calculation Preview Card */}
                    <div className="space-y-1.5 rounded-xl border border-stone-200/80 bg-stone-50 p-3 text-xs dark:border-stone-700 dark:bg-stone-800/80">
                        <div className="flex justify-between text-stone-600 dark:text-stone-300">
                            <span>Harga Normal ({item.quantity}x):</span>
                            <span className="font-semibold text-stone-800 dark:text-stone-100">
                                Rp {formatRp(lineGross)}
                            </span>
                        </div>
                        <div className="flex justify-between font-semibold text-emerald-700 dark:text-emerald-400">
                            <span>Diskon produk:</span>
                            <span>-Rp {formatRp(previewAmount)}</span>
                        </div>
                        <div className="flex justify-between border-t border-stone-200 pt-1.5 font-bold text-stone-900 dark:border-stone-700 dark:text-white">
                            <span>Subtotal produk:</span>
                            <span className="text-sm font-bold text-emerald-800 dark:text-emerald-400">
                                Rp {formatRp(finalLine)}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between gap-2 border-t border-stone-200 bg-stone-50 p-4 dark:border-stone-800 dark:bg-stone-900">
                    {item.discount_amount && item.discount_amount > 0 ? (
                        <button
                            type="button"
                            onClick={() => {
                                removeItemDiscount(item.id);
                                onClose();
                            }}
                            className="cursor-pointer rounded-xl px-3 py-2 text-xs font-bold text-rose-600 transition hover:bg-rose-50 dark:hover:bg-rose-950/40"
                        >
                            Hapus Diskon
                        </button>
                    ) : (
                        <div />
                    )}
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="cursor-pointer rounded-xl px-4 py-2 text-xs font-semibold text-stone-600 transition hover:bg-stone-200 dark:text-stone-300 dark:hover:bg-stone-800"
                        >
                            Batal
                        </button>
                        <button
                            type="button"
                            onClick={saveItemDiscount}
                            className="cursor-pointer rounded-xl bg-brand-900 px-5 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-brand-950 active:scale-95 dark:bg-emerald-600 dark:hover:bg-emerald-500"
                        >
                            Simpan Diskon
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
