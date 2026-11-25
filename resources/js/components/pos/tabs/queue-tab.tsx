import React from 'react';
import { Clock, ShoppingCart, User, Truck, MapPin, Trash2, ChevronRight } from 'lucide-react';
import { PosHeldOrderItem } from '@/types/pos';

interface QueueTabProps {
    isActive: boolean;
    heldOrdersList: PosHeldOrderItem[];
    cashierName: string;
    onBackToCashier: () => void;
    handleDeleteQueueOrder: (id: string | number) => void;
    handleRestoreQueueOrder: (order: PosHeldOrderItem) => void;
    formatRp: (val: number) => string;
}

export const QueueTab: React.FC<QueueTabProps> = ({
    isActive,
    heldOrdersList,
    cashierName,
    onBackToCashier,
    handleDeleteQueueOrder,
    handleRestoreQueueOrder,
    formatRp,
}) => {
    if (!isActive) return null;

    return (
        <div className="mx-auto w-full max-w-5xl flex-1 space-y-5 overflow-y-auto bg-[#f4f6f6] p-4 sm:p-6 dark:bg-stone-950">
            <div className="flex flex-col justify-between gap-3 border-b border-stone-200 pb-3 sm:flex-row sm:items-center dark:border-stone-800">
                <div>
                    <div className="flex items-center gap-2">
                        <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                        <h2 className="text-lg font-bold text-brand-950 dark:text-white">
                            Antrian Pesanan Kasir (Hold Orders)
                        </h2>
                        <span className="rounded-full border border-amber-200 bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-800 dark:border-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                            {heldOrdersList.length} Pesanan
                        </span>
                    </div>
                    <p className="mt-0.5 text-xs text-stone-500 dark:text-stone-300">
                        Daftar pesanan antrian yang ditahan khusus oleh akun kasir Anda ({cashierName})
                    </p>
                </div>

                <button
                    type="button"
                    onClick={onBackToCashier}
                    className="flex cursor-pointer items-center gap-1.5 self-start rounded-xl bg-brand-700 px-3.5 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-brand-800 active:scale-95 sm:self-auto"
                >
                    <ShoppingCart className="h-4 w-4" />
                    <span>Kembali ke Kasir</span>
                </button>
            </div>

            {heldOrdersList.length === 0 ? (
                <div className="space-y-3 rounded-2xl border border-stone-200 bg-white p-12 text-center shadow-xs dark:border-stone-800 dark:bg-stone-900">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-amber-200 bg-amber-50 text-amber-600 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-400">
                        <Clock className="h-8 w-8 stroke-[1.5]" />
                    </div>
                    <div>
                        <h3 className="text-base font-bold text-stone-900 dark:text-white">
                            Tidak Ada Pesanan di Antrian
                        </h3>
                        <p className="mx-auto mt-1 max-w-md text-xs text-stone-500 dark:text-stone-300">
                            Saat Anda sedang melayani pelanggan yang ingin melihat produk lain, gunakan tombol{' '}
                            <strong>"Simpan Antrian"</strong> di kasir agar pesanan tersimpan khusus di akun Anda.
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={onBackToCashier}
                        className="mt-2 cursor-pointer rounded-xl bg-brand-700 px-4 py-2 text-xs font-bold text-white transition hover:bg-brand-800"
                    >
                        Buka Aplikasi Kasir
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {heldOrdersList.map((held) => (
                        <div
                            key={held.id}
                            className="flex flex-col justify-between space-y-4 rounded-2xl border border-stone-200 bg-white p-4 shadow-xs transition hover:border-brand-300 sm:p-5 dark:border-stone-800 dark:bg-stone-900 dark:hover:border-stone-700"
                        >
                            <div className="space-y-3">
                                {/* Header Card */}
                                <div className="flex items-start justify-between gap-2 border-b border-stone-100 pb-2.5 dark:border-stone-800">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="rounded-md bg-brand-900 px-2 py-0.5 font-mono text-[11px] font-bold text-white">
                                                {held.queue_number || `Q-${held.id}`}
                                            </span>
                                            <span className="text-xs text-stone-400 dark:text-stone-300">
                                                Disimpan jam {held.held_at}
                                            </span>
                                        </div>
                                        <h3 className="mt-1 flex items-center gap-1.5 text-base font-black text-brand-950 dark:text-white">
                                            <User className="h-4 w-4 text-brand-700 dark:text-emerald-400" />
                                            <span>{held.customer_name}</span>
                                        </h3>
                                        {held.customer_phone && (
                                            <p className="text-[11px] text-stone-500 dark:text-stone-300">
                                                WA: {held.customer_phone}
                                            </p>
                                        )}
                                        {held.shipping_cost && held.shipping_cost > 0 ? (
                                            <div className="mt-0.5 flex items-center gap-1.5 text-xs font-bold text-blue-700 dark:text-blue-400">
                                                <Truck className="h-3.5 w-3.5" />
                                                <span>
                                                    Ongkir: Rp {formatRp(held.shipping_cost)}
                                                </span>
                                                {held.shipping_courier && (
                                                    <span className="text-[10px] font-normal text-stone-500">
                                                        ({held.shipping_courier})
                                                    </span>
                                                )}
                                            </div>
                                        ) : null}
                                        {held.customer_address && (
                                            <p className="mt-0.5 flex items-start gap-1 text-[11px] text-stone-600 dark:text-stone-300">
                                                <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-stone-400" />
                                                <span className="max-w-xs truncate">
                                                    {held.customer_address}
                                                </span>
                                            </p>
                                        )}
                                    </div>

                                    <div className="text-right">
                                        <div className="text-base font-black text-brand-950 dark:text-emerald-400">
                                            Rp {formatRp(held.total_amount)}
                                        </div>
                                        <div className="text-[11px] font-medium text-stone-500 dark:text-stone-300">
                                            {held.items_count} item
                                        </div>
                                    </div>
                                </div>

                                {/* Notes if any */}
                                {held.notes && (
                                    <div className="rounded-lg border border-amber-200/60 bg-amber-50/80 p-2 text-xs text-amber-900 dark:border-amber-800/60 dark:bg-amber-950/50 dark:text-amber-200">
                                        <span className="font-semibold">Catatan:</span> {held.notes}
                                    </div>
                                )}

                                {/* Items preview */}
                                <div className="max-h-40 space-y-1.5 overflow-y-auto pr-1">
                                    {(held.items || []).map((it, idx) => (
                                        <div
                                            key={idx}
                                            className="flex items-center justify-between rounded-lg bg-stone-50 px-2 py-1 text-xs dark:bg-stone-800"
                                        >
                                            <div className="truncate pr-2">
                                                <span className="font-semibold text-stone-900 dark:text-white">
                                                    {it.quantity}x {it.product_name}
                                                </span>
                                                <span className="ml-1 text-[11px] text-stone-500 dark:text-stone-300">
                                                    ({it.variant_label})
                                                </span>
                                            </div>
                                            <span className="shrink-0 font-bold text-stone-800 dark:text-stone-200">
                                                Rp {formatRp(it.price * it.quantity)}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Action buttons */}
                            <div className="flex items-center gap-2 border-t border-stone-100 pt-2 dark:border-stone-800">
                                <button
                                    type="button"
                                    onClick={() => handleDeleteQueueOrder(held.id)}
                                    className="cursor-pointer rounded-xl border border-stone-200 p-2.5 text-stone-500 transition hover:border-rose-300 hover:bg-rose-50 hover:text-rose-600 dark:border-stone-700 dark:text-stone-300 dark:hover:bg-rose-950/50 dark:hover:text-rose-400"
                                    title="Batalkan dan hapus antrian ini"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleRestoreQueueOrder(held)}
                                    className="flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-brand-700 px-3 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-brand-800 active:scale-95"
                                >
                                    <ShoppingCart className="h-4 w-4" />
                                    <span>Muat ke Kasir & Bayar</span>
                                    <ChevronRight className="h-3.5 w-3.5" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
