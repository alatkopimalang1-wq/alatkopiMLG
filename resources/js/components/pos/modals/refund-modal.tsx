import React from 'react';
import { RotateCcw, X, AlertCircle, RefreshCw } from 'lucide-react';
import { PosRecentOrder } from '@/types/pos';

interface RefundModalProps {
    isOpen: boolean;
    order: PosRecentOrder | null;
    onClose: () => void;
    refundAmount: number;
    setRefundAmount: (val: number) => void;
    refundReason: string;
    setRefundReason: (val: string) => void;
    isProcessingRefund: boolean;
    handleConfirmRefund: () => void;
    formatRp: (val: number) => string;
}

export const RefundModal: React.FC<RefundModalProps> = ({
    isOpen,
    order,
    onClose,
    refundAmount,
    setRefundAmount,
    refundReason,
    setRefundReason,
    isProcessingRefund,
    handleConfirmRefund,
    formatRp,
}) => {
    if (!isOpen || !order) return null;

    return (
        <div className="pos-modal-overlay fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 p-3 sm:p-4">
            <div className="pos-gpu-layer my-auto w-full max-w-md animate-in space-y-4 rounded-2xl border border-stone-200 bg-white p-5 text-stone-900 shadow-2xl duration-150 zoom-in-95 sm:p-6 dark:border-stone-800 dark:bg-stone-900 dark:text-stone-100">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-stone-100 pb-3.5 dark:border-stone-800">
                    <div className="flex items-center gap-2.5">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-rose-300 bg-rose-50 text-rose-600 dark:border-rose-700 dark:bg-rose-950/60 dark:text-rose-400">
                            <RotateCcw className="h-5 w-5 stroke-[2.2]" />
                        </div>
                        <div>
                            <h3 className="text-base font-bold text-brand-950 dark:text-white">
                                Refund Transaksi #{order.order_number}
                            </h3>
                            <p className="text-[11px] text-stone-500 dark:text-stone-400">
                                Pengembalian dana dan pembatalan pesanan kasir
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isProcessingRefund}
                        className="cursor-pointer rounded-lg p-1 text-stone-400 hover:bg-stone-100 hover:text-stone-600 dark:hover:bg-stone-800 dark:hover:text-stone-200"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Order Summary Box */}
                <div className="rounded-xl border border-stone-200 bg-stone-50 p-3 text-xs space-y-1.5 dark:border-stone-800 dark:bg-stone-800/60">
                    <div className="flex justify-between py-1 border-b border-stone-200/80 dark:border-stone-700">
                        <span className="text-stone-500 dark:text-stone-400">Pelanggan:</span>
                        <span className="font-semibold text-stone-900 dark:text-white">
                            {order.customer_name}
                        </span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-stone-200/80 dark:border-stone-700">
                        <span className="text-stone-500 dark:text-stone-400">Waktu Transaksi:</span>
                        <span className="text-stone-700 dark:text-stone-300">
                            {order.created_at}
                        </span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-stone-200/80 dark:border-stone-700">
                        <span className="text-stone-500 dark:text-stone-400">Metode Pembayaran:</span>
                        <span className="font-semibold text-stone-900 dark:text-white">
                            {order.payment_method_label}
                        </span>
                    </div>
                    <div className="flex justify-between pt-1 font-bold text-sm">
                        <span className="text-stone-700 dark:text-stone-300">Total Transaksi:</span>
                        <span className="text-brand-900 dark:text-emerald-400">
                            Rp {formatRp(order.total_amount)}
                        </span>
                    </div>
                </div>

                {/* Notice */}
                <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-2.5 text-xs text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-300">
                    <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
                    <span>
                        Saldo penjualan dan kas harian akan disesuaikan. Struk bukti refund akan otomatis disiapkan untuk dicetak.
                    </span>
                </div>

                {/* Form Inputs */}
                <div className="space-y-3">
                    <div>
                        <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                            Nominal Pengembalian Dana (Rp)
                        </label>
                        <input
                            type="number"
                            min={1}
                            max={order.total_amount}
                            value={refundAmount}
                            onChange={(e) => setRefundAmount(Number(e.target.value) || 0)}
                            className="w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 text-sm font-bold text-stone-900 outline-none focus:border-rose-500 focus:bg-white dark:border-stone-700 dark:bg-stone-800 dark:text-white"
                        />
                        <div className="mt-1 flex items-center justify-between text-[11px] text-stone-500">
                            <span>Maksimal: Rp {formatRp(order.total_amount)}</span>
                            <button
                                type="button"
                                onClick={() => setRefundAmount(order.total_amount)}
                                className="cursor-pointer font-bold text-rose-600 hover:underline dark:text-rose-400"
                            >
                                Set Penuh (100%)
                            </button>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                            Alasan Refund / Retur
                        </label>
                        <div className="mb-2 flex flex-wrap gap-1.5">
                            {[
                                'Salah Masuk Pesanan / Kasir',
                                'Pesanan Dibatalkan Pelanggan',
                                'Produk Habis / Rusak',
                                'Salah Metode Pembayaran',
                            ].map((preset) => (
                                <button
                                    key={preset}
                                    type="button"
                                    onClick={() => setRefundReason(preset)}
                                    className={`cursor-pointer rounded-lg px-2 py-1 text-[10px] font-semibold transition ${
                                        refundReason === preset
                                            ? 'bg-rose-600 text-white shadow-2xs'
                                            : 'bg-stone-100 text-stone-700 hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-300'
                                    }`}
                                >
                                    {preset}
                                </button>
                            ))}
                        </div>
                        <input
                            type="text"
                            value={refundReason}
                            onChange={(e) => setRefundReason(e.target.value)}
                            placeholder="Tulis alasan refund..."
                            className="w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 text-xs text-stone-900 outline-none focus:border-rose-500 focus:bg-white dark:border-stone-700 dark:bg-stone-800 dark:text-white"
                        />
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-2">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isProcessingRefund}
                        className="flex-1 cursor-pointer rounded-xl border border-stone-200 bg-stone-100 py-2.5 text-xs font-bold text-stone-700 transition hover:bg-stone-200 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-300 dark:hover:bg-stone-700"
                    >
                        Batal
                    </button>
                    <button
                        type="button"
                        onClick={handleConfirmRefund}
                        disabled={isProcessingRefund || Number(refundAmount) <= 0}
                        className="flex-1 flex cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-rose-600 py-2.5 text-xs font-bold text-white shadow-md transition hover:bg-rose-700 disabled:opacity-60"
                    >
                        {isProcessingRefund ? (
                            <>
                                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                                <span>Memproses...</span>
                            </>
                        ) : (
                            <>
                                <RotateCcw className="h-3.5 w-3.5" />
                                <span>Konfirmasi Refund</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};
