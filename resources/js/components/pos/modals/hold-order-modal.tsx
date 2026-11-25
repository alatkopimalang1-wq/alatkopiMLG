import React from 'react';
import { X, Clock } from 'lucide-react';

interface HoldOrderModalProps {
    isOpen: boolean;
    onClose: () => void;
    totalAmount: number;
    totalItemsCount: number;
    customerName: string;
    setCustomerName: (val: string) => void;
    customerPhone: string;
    setCustomerPhone: (val: string) => void;
    notes: string;
    setNotes: (val: string) => void;
    onSubmit: (e: React.FormEvent) => void;
    isSubmitting: boolean;
    formatRp: (val: number) => string;
}

export const HoldOrderModal: React.FC<HoldOrderModalProps> = ({
    isOpen,
    onClose,
    totalAmount,
    totalItemsCount,
    customerName,
    setCustomerName,
    customerPhone,
    setCustomerPhone,
    notes,
    setNotes,
    onSubmit,
    isSubmitting,
    formatRp,
}) => {
    if (!isOpen) return null;

    return (
        <div className="pos-modal-overlay fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 p-3 sm:p-4">
            <div className="pos-gpu-layer my-auto w-full max-w-md animate-in space-y-4 rounded-2xl border border-stone-200 bg-white p-5 text-stone-900 shadow-2xl duration-150 zoom-in-95 dark:border-stone-800 dark:bg-stone-900 dark:text-stone-100">
                <div className="flex items-center justify-between border-b border-stone-100 pb-3 dark:border-stone-800">
                    <div className="flex items-center gap-2">
                        <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                        <h3 className="text-base font-bold text-brand-950 dark:text-white">
                            Simpan Pesanan ke Antrian
                        </h3>
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

                <div className="rounded-xl border border-amber-200 bg-amber-50 p-3.5 text-xs text-amber-950 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200">
                    <div className="flex justify-between font-bold">
                        <span>Total Tagihan Pesanan:</span>
                        <span className="text-amber-950 dark:text-amber-300">
                            Rp {formatRp(totalAmount)}
                        </span>
                    </div>
                    <div className="mt-0.5 text-[11px] text-amber-800 dark:text-amber-300/80">
                        {totalItemsCount} item akan disimpan sementara dan kasir siap melayani pesanan berikutnya.
                    </div>
                </div>

                <form onSubmit={onSubmit} className="space-y-3 text-xs">
                    <div>
                        <label className="flex items-center gap-1 text-[11px] font-bold text-stone-800 dark:text-stone-200">
                            <span>Nama Pelanggan / Nomor Antrian</span>
                            <span className="text-rose-600">*</span>
                        </label>
                        <input
                            type="text"
                            required
                            autoFocus
                            value={customerName}
                            onChange={(e) => setCustomerName(e.target.value)}
                            placeholder="Contoh: Kak Rendy / Meja 3 / Baju Biru"
                            className="mt-1 w-full rounded-xl border border-stone-300 bg-stone-50 px-3 py-2.5 font-semibold text-stone-900 focus:border-brand-600 focus:bg-white focus:ring-1 focus:ring-brand-600 focus:outline-none dark:border-stone-700 dark:bg-stone-800 dark:text-white dark:focus:border-emerald-500 dark:focus:bg-stone-900"
                        />
                    </div>

                    <div>
                        <label className="text-[11px] font-medium text-stone-600 dark:text-stone-300">
                            No. WhatsApp (Opsional):
                        </label>
                        <input
                            type="tel"
                            value={customerPhone}
                            onChange={(e) => setCustomerPhone(e.target.value)}
                            placeholder="0812xxxx"
                            className="mt-1 w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 text-stone-900 focus:border-brand-600 focus:bg-white focus:outline-none dark:border-stone-700 dark:bg-stone-800 dark:text-white dark:focus:border-emerald-500 dark:focus:bg-stone-900"
                        />
                    </div>

                    <div>
                        <label className="text-[11px] font-medium text-stone-600 dark:text-stone-300">
                            Catatan / Keterangan (Opsional):
                        </label>
                        <input
                            type="text"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Contoh: Mengambil dompet di mobil / menunggu teman"
                            className="mt-1 w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 text-stone-900 focus:border-brand-600 focus:bg-white focus:outline-none dark:border-stone-700 dark:bg-stone-800 dark:text-white dark:focus:border-emerald-500 dark:focus:bg-stone-900"
                        />
                    </div>

                    <div className="flex items-center gap-2 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 cursor-pointer rounded-xl bg-stone-100 px-3 py-2.5 font-bold text-stone-700 transition hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-200 dark:hover:bg-stone-700"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting || !customerName.trim()}
                            className="flex flex-2 cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-amber-600 px-3 py-2.5 font-bold text-white shadow-sm transition hover:bg-amber-700 active:scale-95 disabled:opacity-50 dark:bg-amber-600 dark:hover:bg-amber-500"
                        >
                            <Clock className="h-4 w-4" />
                            <span>
                                {isSubmitting ? 'Menyimpan...' : 'Simpan ke Antrian'}
                            </span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
