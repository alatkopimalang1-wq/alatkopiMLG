import React from 'react';
import { PlusCircle, X, Minus, Plus, ShoppingCart, CreditCard } from 'lucide-react';

interface ManualOrderModalProps {
    isOpen: boolean;
    onClose: () => void;
    editingManualCartItemId: string | null;
    manualProductName: string;
    setManualProductName: (val: string) => void;
    manualVariantLabel: string;
    setManualVariantLabel: (val: string) => void;
    manualCostPrice: string;
    setManualCostPrice: (val: string) => void;
    manualPrice: string;
    setManualPrice: (val: string) => void;
    manualQuantity: number;
    setManualQuantity: React.Dispatch<React.SetStateAction<number>>;
    handleSaveManualItem: (e: React.FormEvent, payDirectly: boolean) => void;
    formatRp: (val: number) => string;
}

export const ManualOrderModal: React.FC<ManualOrderModalProps> = ({
    isOpen,
    onClose,
    editingManualCartItemId,
    manualProductName,
    setManualProductName,
    manualVariantLabel,
    setManualVariantLabel,
    manualCostPrice,
    setManualCostPrice,
    manualPrice,
    setManualPrice,
    manualQuantity,
    setManualQuantity,
    handleSaveManualItem,
    formatRp,
}) => {
    if (!isOpen) return null;

    const selling = Number(manualPrice) || 0;
    const cost = Number(manualCostPrice) || 0;
    const qty = Math.max(1, Number(manualQuantity) || 1);
    const subtotalCalc = selling * qty;
    const totalCostCalc = cost * qty;
    const grossProfitCalc = subtotalCalc - totalCostCalc;
    const marginPercent = subtotalCalc > 0 ? (grossProfitCalc / subtotalCalc) * 100 : 0;

    return (
        <div className="pos-modal-overlay fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 p-3 sm:p-4">
            <div className="pos-gpu-layer my-auto w-full max-w-lg animate-in space-y-4 rounded-2xl border border-stone-200 bg-white p-5 text-stone-900 shadow-2xl duration-150 zoom-in-95 sm:p-6 dark:border-stone-800 dark:bg-stone-900 dark:text-stone-100">
                {/* Modal Header */}
                <div className="flex items-center justify-between border-b border-stone-100 pb-3.5 dark:border-stone-800">
                    <div className="flex items-center gap-2.5">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-amber-300 bg-amber-500/10 text-amber-600 dark:border-amber-700 dark:bg-amber-400/10 dark:text-amber-400">
                            <PlusCircle className="h-5 w-5 stroke-[2.2]" />
                        </div>
                        <div>
                            <h3 className="text-base font-bold text-brand-950 dark:text-white">
                                {editingManualCartItemId
                                    ? 'Edit Orderan Manual'
                                    : 'Buat Orderan Manual'}
                            </h3>
                            <p className="text-[11px] text-stone-500 dark:text-stone-400">
                                Masukkan HPP & Harga Jual untuk perhitungan laba rugi real di kasir
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="cursor-pointer rounded-lg p-1 text-stone-400 hover:bg-stone-100 hover:text-stone-700 dark:hover:bg-stone-800 dark:hover:text-stone-200"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <form
                    onSubmit={(e) => handleSaveManualItem(e, false)}
                    className="space-y-4 text-xs"
                >
                    {/* 1. Nama Produk */}
                    <div>
                        <label className="mb-1 flex items-center gap-1 text-[11px] font-bold text-stone-800 dark:text-stone-200">
                            <span>Nama Produk / Jasa / Item</span>
                            <span className="text-rose-600">*</span>
                        </label>
                        <input
                            type="text"
                            required
                            value={manualProductName}
                            onChange={(e) => setManualProductName(e.target.value)}
                            placeholder="Contoh: Paket Katering Kopi 50 Cup / Snack Vendor / Custom Beans"
                            className="w-full rounded-xl border border-stone-300 bg-stone-50 px-3 py-2.5 text-xs font-medium text-stone-900 focus:bg-white focus:ring-1 focus:ring-brand-600 focus:outline-none dark:border-stone-700 dark:bg-stone-800 dark:text-white dark:focus:bg-stone-800"
                            autoFocus
                        />
                    </div>

                    {/* 2. Variant / Label opsional */}
                    <div>
                        <label className="mb-1 flex items-center gap-1 text-[11px] font-bold text-stone-800 dark:text-stone-200">
                            <span>Varian / Keterangan Ukuran (Opsional)</span>
                        </label>
                        <input
                            type="text"
                            value={manualVariantLabel}
                            onChange={(e) => setManualVariantLabel(e.target.value)}
                            placeholder="Contoh: Cup 12oz, Botol 1L, Box, Porsi, dll."
                            className="w-full rounded-xl border border-stone-300 bg-stone-50 px-3 py-2 text-xs font-medium text-stone-900 focus:ring-1 focus:ring-brand-600 focus:outline-none dark:border-stone-700 dark:bg-stone-800 dark:text-white"
                        />
                    </div>

                    {/* 3. Grid: HPP Modal & Harga Jual */}
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        {/* HPP Produk */}
                        <div className="space-y-1.5 rounded-xl border border-rose-200 bg-rose-50/60 p-3 dark:border-rose-900/60 dark:bg-rose-950/20">
                            <label className="flex items-center justify-between text-[11px] font-bold text-rose-900 dark:text-rose-300">
                                <span>HPP Produk (Modal Satuan)</span>
                                <span className="text-[10px] font-normal text-rose-600 dark:text-rose-400">
                                    Biaya Modal
                                </span>
                            </label>
                            <div className="relative">
                                <span className="absolute top-1/2 left-3 -translate-y-1/2 text-xs font-bold text-rose-600 dark:text-rose-400">
                                    Rp
                                </span>
                                <input
                                    type="number"
                                    min="0"
                                    step="100"
                                    value={manualCostPrice}
                                    onChange={(e) => setManualCostPrice(e.target.value)}
                                    placeholder="0"
                                    className="w-full rounded-lg border border-rose-300 bg-white py-2 pr-3 pl-9 text-sm font-bold text-rose-950 focus:ring-1 focus:ring-rose-500 focus:outline-none dark:border-rose-800 dark:bg-stone-900 dark:text-rose-100"
                                />
                            </div>
                            <p className="text-[10px] text-rose-700 dark:text-rose-300/80">
                                Digunakan untuk menghitung HPP & Laba Rugi real pada laporan kasir.
                            </p>
                        </div>

                        {/* Harga Jual Produk */}
                        <div className="space-y-1.5 rounded-xl border border-emerald-200 bg-emerald-50/60 p-3 dark:border-emerald-900/60 dark:bg-emerald-950/20">
                            <label className="flex items-center justify-between text-[11px] font-bold text-emerald-900 dark:text-emerald-300">
                                <span>Harga Jual Produk (Satuan)</span>
                                <span className="text-rose-600">*</span>
                            </label>
                            <div className="relative">
                                <span className="absolute top-1/2 left-3 -translate-y-1/2 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                                    Rp
                                </span>
                                <input
                                    type="number"
                                    min="0"
                                    step="500"
                                    required
                                    value={manualPrice}
                                    onChange={(e) => setManualPrice(e.target.value)}
                                    placeholder="0"
                                    className="w-full rounded-lg border border-emerald-300 bg-white py-2 pr-3 pl-9 text-sm font-bold text-emerald-950 focus:ring-1 focus:ring-emerald-500 focus:outline-none dark:border-emerald-800 dark:bg-stone-900 dark:text-emerald-100"
                                />
                            </div>
                            <p className="text-[10px] text-emerald-700 dark:text-emerald-300/80">
                                Harga yang ditagihkan ke pelanggan saat checkout.
                            </p>
                        </div>
                    </div>

                    {/* 4. Jumlah (Qty) & Real-time Profit Preview */}
                    <div className="space-y-3 rounded-xl border border-stone-200 bg-stone-100 p-3.5 dark:border-stone-700 dark:bg-stone-800/80">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-stone-800 dark:text-stone-200">
                                Jumlah Pembelian (Qty)
                            </span>
                            <div className="flex items-center gap-2 rounded-xl border border-stone-300 bg-white px-2 py-1 dark:border-stone-700 dark:bg-stone-900">
                                <button
                                    type="button"
                                    onClick={() => setManualQuantity((q) => Math.max(1, q - 1))}
                                    className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg font-bold text-stone-700 hover:bg-stone-100 active:scale-95 dark:text-stone-200 dark:hover:bg-stone-800"
                                >
                                    <Minus className="h-3.5 w-3.5" />
                                </button>
                                <input
                                    type="number"
                                    min="1"
                                    max="999"
                                    value={manualQuantity}
                                    onChange={(e) =>
                                        setManualQuantity(
                                            Math.max(1, parseInt(e.target.value) || 1)
                                        )
                                    }
                                    className="w-12 border-0 bg-transparent text-center text-xs font-bold text-stone-900 focus:outline-none dark:text-white"
                                />
                                <button
                                    type="button"
                                    onClick={() => setManualQuantity((q) => q + 1)}
                                    className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg font-bold text-stone-700 hover:bg-stone-100 active:scale-95 dark:text-stone-200 dark:hover:bg-stone-800"
                                >
                                    <Plus className="h-3.5 w-3.5" />
                                </button>
                            </div>
                        </div>

                        {/* Real-time Calculation Summary */}
                        <div className="space-y-1.5 border-t border-stone-200 pt-2 text-[11px] dark:border-stone-700/80">
                            <div className="flex justify-between text-stone-600 dark:text-stone-300">
                                <span>Subtotal Penjualan ({qty} item):</span>
                                <span className="font-bold text-stone-900 dark:text-white">
                                    Rp {formatRp(subtotalCalc)}
                                </span>
                            </div>
                            <div className="flex justify-between text-rose-600 dark:text-rose-400">
                                <span>Total Modal HPP ({qty} item):</span>
                                <span className="font-semibold">- Rp {formatRp(totalCostCalc)}</span>
                            </div>
                            <div className="flex items-center justify-between border-t border-dashed border-stone-200 pt-1.5 font-bold dark:border-stone-700">
                                <span className="text-stone-800 dark:text-stone-200">
                                    Estimasi Laba Kotor Real:
                                </span>
                                <span
                                    className={`text-xs ${grossProfitCalc >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}
                                >
                                    {grossProfitCalc >= 0 ? '+ ' : ''}Rp {formatRp(grossProfitCalc)}
                                    {subtotalCalc > 0 && ` (${marginPercent.toFixed(1)}%)`}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 cursor-pointer rounded-xl border border-stone-300 px-3 py-2.5 text-center font-bold text-stone-700 transition hover:bg-stone-100 dark:border-stone-700 dark:text-stone-300 dark:hover:bg-stone-800"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            className="flex flex-2 cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-brand-700 px-4 py-2.5 font-bold text-white shadow-sm transition hover:bg-brand-800 active:scale-95 dark:bg-emerald-600 dark:hover:bg-emerald-500"
                        >
                            <ShoppingCart className="h-4 w-4" />
                            <span>
                                {editingManualCartItemId
                                    ? 'Simpan Perubahan'
                                    : 'Tambah ke Keranjang'}
                            </span>
                        </button>
                        {!editingManualCartItemId && (
                            <button
                                type="button"
                                onClick={(e) => handleSaveManualItem(e, true)}
                                className="flex cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-amber-500 px-4 py-2.5 font-black text-stone-950 shadow-sm transition hover:bg-amber-600 active:scale-95"
                                title="Masukkan ke keranjang dan langsung buka pembayaran"
                            >
                                <CreditCard className="h-4 w-4" />
                                <span>Bayar Langsung</span>
                            </button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
};
