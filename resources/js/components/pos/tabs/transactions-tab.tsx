import React from 'react';
import {
    Calendar,
    RefreshCw,
    Search,
    Clock,
    RotateCcw,
    Truck,
    Printer,
} from 'lucide-react';
import { PosRecentOrder, PrinterSettings } from '@/types/pos';
import { ReceiptData } from '@/lib/thermal-printer';

interface TransactionsTabProps {
    isActive: boolean;
    isStaffRestricted: boolean;
    cashierName: string;
    historyFilter: 'today' | 'yesterday' | 'custom';
    setHistoryFilter: (val: 'today' | 'yesterday' | 'custom') => void;
    historyStatusFilter: 'all' | 'paid' | 'refunded';
    setHistoryStatusFilter: (val: 'all' | 'paid' | 'refunded') => void;
    historyStartDate: string;
    setHistoryStartDate: (val: string) => void;
    historyEndDate: string;
    setHistoryEndDate: (val: string) => void;
    historySearch: string;
    setHistorySearch: (val: string) => void;
    recentOrders: PosRecentOrder[];
    filteredOrders: PosRecentOrder[];
    historyTotalAmount: number;
    isLoadingHistory: boolean;
    fetchHistoryOrders: (
        filter: 'today' | 'yesterday' | 'custom',
        start?: string,
        end?: string,
        search?: string,
    ) => void;
    printerForm: PrinterSettings;
    setCompletedReceipt: (val: ReceiptData | null) => void;
    setIsReceiptModalOpen: (val: boolean) => void;
    handleOpenRefundModal: (order: PosRecentOrder) => void;
    formatRp: (val: number) => string;
}

export const TransactionsTab: React.FC<TransactionsTabProps> = ({
    isActive,
    isStaffRestricted,
    cashierName,
    historyFilter,
    setHistoryFilter,
    historyStatusFilter,
    setHistoryStatusFilter,
    historyStartDate,
    setHistoryStartDate,
    historyEndDate,
    setHistoryEndDate,
    historySearch,
    setHistorySearch,
    recentOrders,
    filteredOrders,
    historyTotalAmount,
    isLoadingHistory,
    fetchHistoryOrders,
    printerForm,
    setCompletedReceipt,
    setIsReceiptModalOpen,
    handleOpenRefundModal,
    formatRp,
}) => {
    if (!isActive) return null;

    return (
        <div className="mx-auto w-full max-w-5xl flex-1 space-y-4 overflow-y-auto bg-[#f4f6f6] p-4 sm:p-6 dark:bg-stone-950">
            {/* Header with Title and Filter Tabs */}
            <div className="flex flex-col justify-between gap-3 border-b border-stone-200 pb-3 sm:flex-row sm:items-center dark:border-stone-800">
                <div>
                    <div className="flex flex-wrap items-center gap-2">
                        <h2 className="flex items-center gap-2 text-lg font-bold text-brand-950 dark:text-white">
                            <Calendar className="h-5 w-5 text-brand-700 dark:text-emerald-400" />
                            <span>Riwayat Transaksi POS</span>
                        </h2>
                        {isStaffRestricted && (
                            <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10.5px] font-bold text-emerald-800 border border-emerald-300 dark:bg-emerald-950/60 dark:border-emerald-800 dark:text-emerald-300">
                                Shift Anda: {cashierName}
                            </span>
                        )}
                    </div>
                    <p className="mt-0.5 text-xs text-stone-500 dark:text-stone-300">
                        {isStaffRestricted
                            ? 'Daftar transaksi yang Anda proses pada sesi kasir ini'
                            : 'Daftar transaksi dan cetak ulang struk kasir'}
                    </p>
                </div>

                {/* Filter Tabs: Hari Ini, Kemarin, Custom Tanggal & Status Filter */}
                <div className="flex max-w-full flex-wrap items-center gap-2">
                    <div className="flex max-w-full scrollbar-none items-center overflow-x-auto rounded-xl border border-stone-200 bg-white p-1 text-xs font-semibold shadow-2xs dark:border-stone-800 dark:bg-stone-900">
                        <button
                            type="button"
                            onClick={() => {
                                setHistoryFilter('today');
                                fetchHistoryOrders(
                                    'today',
                                    historyStartDate,
                                    historyEndDate,
                                    historySearch,
                                );
                            }}
                            className={`shrink-0 cursor-pointer rounded-lg px-3 py-1.5 font-bold whitespace-nowrap transition ${
                                historyFilter === 'today'
                                    ? 'bg-brand-700 text-white shadow-xs'
                                    : 'text-stone-600 hover:text-brand-950 dark:text-stone-300 dark:hover:text-white'
                            }`}
                        >
                            Hari Ini
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                setHistoryFilter('yesterday');
                                fetchHistoryOrders(
                                    'yesterday',
                                    historyStartDate,
                                    historyEndDate,
                                    historySearch,
                                );
                            }}
                            className={`shrink-0 cursor-pointer rounded-lg px-3 py-1.5 font-bold whitespace-nowrap transition ${
                                historyFilter === 'yesterday'
                                    ? 'bg-brand-700 text-white shadow-xs'
                                    : 'text-stone-600 hover:text-brand-950 dark:text-stone-300 dark:hover:text-white'
                            }`}
                        >
                            Kemarin
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                setHistoryFilter('custom');
                                fetchHistoryOrders(
                                    'custom',
                                    historyStartDate,
                                    historyEndDate,
                                    historySearch,
                                );
                            }}
                            className={`shrink-0 cursor-pointer rounded-lg px-3 py-1.5 font-bold whitespace-nowrap transition ${
                                historyFilter === 'custom'
                                    ? 'bg-brand-700 text-white shadow-xs'
                                    : 'text-stone-600 hover:text-brand-950 dark:text-stone-300 dark:hover:text-white'
                            }`}
                        >
                            Custom Tanggal
                        </button>
                    </div>

                    {/* Status Filter */}
                    <div className="flex items-center overflow-x-auto rounded-xl border border-stone-200 bg-white p-1 text-xs font-semibold shadow-2xs dark:border-stone-800 dark:bg-stone-900">
                        <button
                            type="button"
                            onClick={() => setHistoryStatusFilter('all')}
                            className={`shrink-0 cursor-pointer rounded-lg px-3 py-1.5 font-bold whitespace-nowrap transition ${
                                historyStatusFilter === 'all'
                                    ? 'bg-stone-800 text-white shadow-xs dark:bg-stone-700'
                                    : 'text-stone-600 hover:text-brand-950 dark:text-stone-300 dark:hover:text-white'
                            }`}
                        >
                            Semua ({recentOrders.length})
                        </button>
                        <button
                            type="button"
                            onClick={() => setHistoryStatusFilter('paid')}
                            className={`shrink-0 cursor-pointer rounded-lg px-3 py-1.5 font-bold whitespace-nowrap transition ${
                                historyStatusFilter === 'paid'
                                    ? 'bg-emerald-600 text-white shadow-xs'
                                    : 'text-stone-600 hover:text-emerald-600 dark:text-stone-300 dark:hover:text-emerald-400'
                            }`}
                        >
                            Lunas (
                            {
                                recentOrders.filter(
                                    (o: PosRecentOrder) =>
                                        o.payment_status !== 'refunded',
                                ).length
                            }
                            )
                        </button>
                        <button
                            type="button"
                            onClick={() => setHistoryStatusFilter('refunded')}
                            className={`shrink-0 cursor-pointer rounded-lg px-3 py-1.5 font-bold whitespace-nowrap transition ${
                                historyStatusFilter === 'refunded'
                                    ? 'bg-rose-600 text-white shadow-xs'
                                    : 'text-stone-600 hover:text-rose-600 dark:text-stone-300 dark:hover:text-rose-400'
                            }`}
                        >
                            Di-refund (
                            {
                                recentOrders.filter(
                                    (o: PosRecentOrder) =>
                                        o.payment_status === 'refunded',
                                ).length
                            }
                            )
                        </button>
                    </div>

                    <button
                        type="button"
                        onClick={() =>
                            fetchHistoryOrders(
                                historyFilter,
                                historyStartDate,
                                historyEndDate,
                                historySearch,
                            )
                        }
                        disabled={isLoadingHistory}
                        className="cursor-pointer rounded-xl border border-stone-200 bg-white p-2 text-stone-600 shadow-2xs transition hover:bg-stone-50 hover:text-brand-950 dark:border-stone-800 dark:bg-stone-900 dark:text-stone-300 dark:hover:bg-stone-800 dark:hover:text-white"
                        title="Muat ulang riwayat transaksi"
                    >
                        <RefreshCw
                            className={`h-4 w-4 ${isLoadingHistory ? 'animate-spin text-brand-700 dark:text-emerald-400' : ''}`}
                        />
                    </button>
                </div>
            </div>

            {/* Filter Detail, Search & Summary Row */}
            <div className="flex flex-col justify-between gap-3 rounded-2xl border border-stone-200 bg-white p-3.5 text-xs shadow-xs sm:flex-row sm:items-center dark:border-stone-800 dark:bg-stone-900">
                {historyFilter === 'custom' ? (
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="font-medium text-stone-500 dark:text-stone-300">
                            Dari:
                        </span>
                        <input
                            type="date"
                            value={historyStartDate}
                            onChange={(e) => setHistoryStartDate(e.target.value)}
                            className="rounded-xl border border-stone-200 bg-stone-50 px-2.5 py-1.5 font-medium text-stone-900 outline-none focus:border-brand-600 focus:bg-white dark:border-stone-700 dark:bg-stone-800 dark:text-white dark:focus:bg-stone-700"
                        />
                        <span className="font-medium text-stone-500 dark:text-stone-300">
                            Sampai:
                        </span>
                        <input
                            type="date"
                            value={historyEndDate}
                            onChange={(e) => setHistoryEndDate(e.target.value)}
                            className="rounded-xl border border-stone-200 bg-stone-50 px-2.5 py-1.5 font-medium text-stone-900 outline-none focus:border-brand-600 focus:bg-white dark:border-stone-700 dark:bg-stone-800 dark:text-white dark:focus:bg-stone-700"
                        />
                        <button
                            type="button"
                            onClick={() =>
                                fetchHistoryOrders(
                                    'custom',
                                    historyStartDate,
                                    historyEndDate,
                                    historySearch,
                                )
                            }
                            className="cursor-pointer rounded-xl bg-brand-700 px-3.5 py-1.5 text-xs font-bold text-white shadow-xs transition hover:bg-brand-800"
                        >
                            Terapkan
                        </button>
                    </div>
                ) : (
                    <div className="flex items-center gap-2 font-medium text-stone-600 dark:text-stone-300">
                        <span className="inline-block h-2 w-2 rounded-full bg-emerald-500"></span>
                        <span>
                            Menampilkan transaksi:{' '}
                            <strong className="text-stone-900 dark:text-white">
                                {historyFilter === 'today' ? 'Hari Ini' : 'Kemarin'}
                            </strong>
                        </span>
                    </div>
                )}

                {/* Search and Summary */}
                <div className="flex items-center gap-2">
                    <div className="relative flex-1 sm:w-56">
                        <Search className="absolute top-1/2 left-2.5 h-3.5 w-3.5 -translate-y-1/2 text-stone-400 dark:text-stone-400" />
                        <input
                            type="text"
                            value={historySearch}
                            onChange={(e) => setHistorySearch(e.target.value)}
                            placeholder="Cari nomor / pelanggan..."
                            className="w-full rounded-xl border border-stone-200 bg-stone-50 py-1.5 pr-3 pl-8 text-xs text-stone-900 placeholder-stone-400 outline-none focus:border-brand-600 focus:bg-white dark:border-stone-700 dark:bg-stone-800 dark:text-white dark:placeholder-stone-400 dark:focus:bg-stone-700"
                        />
                    </div>
                    <div className="shrink-0 rounded-xl border border-stone-200 bg-stone-50 px-3 py-1.5 text-right font-bold text-stone-700 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-200">
                        <span className="font-normal text-stone-500 dark:text-stone-400">
                            {filteredOrders.length} Trx ·{' '}
                        </span>
                        <span className="font-black text-brand-900 dark:text-emerald-400">
                            Rp {formatRp(historyTotalAmount)}
                        </span>
                    </div>
                </div>
            </div>

            {/* Transaction List */}
            <div className="space-y-2">
                {isLoadingHistory ? (
                    <div className="rounded-2xl border border-stone-200 bg-white p-8 py-12 text-center text-stone-500 shadow-xs dark:border-stone-800 dark:bg-stone-900 dark:text-stone-300">
                        <RefreshCw className="mx-auto mb-2 h-8 w-8 animate-spin text-brand-700 dark:text-emerald-400" />
                        <p className="text-sm font-semibold text-stone-700 dark:text-stone-200">
                            Memuat riwayat transaksi...
                        </p>
                    </div>
                ) : filteredOrders.length === 0 ? (
                    <div className="rounded-2xl border border-stone-200 bg-white p-8 py-12 text-center text-stone-500 shadow-xs dark:border-stone-800 dark:bg-stone-900 dark:text-stone-400">
                        <Clock className="mx-auto mb-2 h-10 w-10 text-stone-400 dark:text-stone-500" />
                        <p className="text-sm font-semibold text-stone-700 dark:text-stone-200">
                            {historyFilter === 'today'
                                ? 'Belum ada transaksi hari ini'
                                : historyFilter === 'yesterday'
                                  ? 'Tidak ada transaksi pada hari kemarin'
                                  : 'Tidak ada transaksi pada rentang tanggal yang dipilih'}
                        </p>
                        {historyFilter === 'today' && (
                            <button
                                type="button"
                                onClick={() => {
                                    setHistoryFilter('yesterday');
                                    fetchHistoryOrders(
                                        'yesterday',
                                        historyStartDate,
                                        historyEndDate,
                                        historySearch,
                                    );
                                }}
                                className="mt-3 cursor-pointer rounded-xl bg-stone-100 px-3.5 py-1.5 text-xs font-bold text-stone-800 transition hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-200 dark:hover:bg-stone-700"
                            >
                                Lihat Transaksi Kemarin →
                            </button>
                        )}
                    </div>
                ) : (
                    filteredOrders.map((ord) => {
                        const isRefunded = ord.payment_status === 'refunded';
                        return (
                            <div
                                key={ord.id}
                                className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border p-4 text-xs shadow-xs transition ${
                                    isRefunded
                                        ? 'border-rose-200 bg-rose-50/40 dark:border-rose-900/50 dark:bg-rose-950/20'
                                        : 'border-stone-200 bg-white hover:border-brand-300 dark:border-stone-800 dark:bg-stone-900 dark:hover:border-stone-700'
                                }`}
                            >
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-bold text-brand-950 dark:text-white">
                                            #{ord.order_number}
                                        </span>
                                        <span className="rounded-full border border-brand-100 bg-brand-50 px-2 py-0.5 text-[10px] font-bold text-brand-800 dark:border-stone-700 dark:bg-stone-800 dark:text-amber-300">
                                            {ord.payment_method_label}
                                        </span>
                                        {isRefunded ? (
                                            <span className="inline-flex items-center gap-1 rounded-full border border-rose-300 bg-rose-100 px-2.5 py-0.5 text-[10px] font-extrabold text-rose-700 dark:border-rose-800 dark:bg-rose-950/80 dark:text-rose-300">
                                                <RotateCcw className="h-3 w-3" />
                                                DI-REFUND
                                            </span>
                                        ) : (
                                            <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                                                LUNAS
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex flex-wrap items-center gap-1.5 text-xs font-medium text-stone-500 dark:text-stone-300">
                                        <span>
                                            {ord.created_at} · {ord.items_count} item · {ord.customer_name}
                                        </span>
                                        {ord.shipping_cost && ord.shipping_cost > 0 ? (
                                            <span className="py-0.2 inline-flex items-center gap-1 rounded-md border border-blue-200 bg-blue-50 px-1.5 text-[10px] font-bold text-blue-700 dark:border-blue-800 dark:bg-blue-950/60 dark:text-blue-300">
                                                <Truck className="h-3 w-3" />
                                                Ongkir: Rp {formatRp(ord.shipping_cost)}
                                            </span>
                                        ) : null}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div
                                            className={`text-sm font-black ${
                                                isRefunded
                                                    ? 'line-through text-stone-400 dark:text-stone-500'
                                                    : 'text-brand-700 dark:text-emerald-400'
                                            }`}
                                        >
                                            Rp {formatRp(ord.total_amount)}
                                        </div>
                                        {isRefunded && (
                                            <span className="text-xs font-bold text-rose-600 dark:text-rose-400">
                                                (Refund: Rp {formatRp(ord.refund_amount || ord.total_amount)})
                                            </span>
                                        )}
                                    </div>
                                    {isRefunded && ord.refund_reason && (
                                        <div className="text-[11px] text-stone-500 dark:text-stone-400 italic">
                                            Alasan: &ldquo;{ord.refund_reason}&rdquo;
                                            {ord.refunded_by_name ? ` · Oleh: ${ord.refunded_by_name}` : ''}
                                        </div>
                                    )}
                                </div>

                                <div className="flex items-center gap-2 shrink-0">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const rep: ReceiptData = {
                                                store_name: printerForm.store_name,
                                                tagline: printerForm.tagline,
                                                address: printerForm.address,
                                                phone: printerForm.phone,
                                                instagram: printerForm.instagram,
                                                order_number: ord.order_number,
                                                date: ord.created_at,
                                                cashier_name: cashierName,
                                                customer_name: ord.customer_name,
                                                customer_phone: ord.customer_phone,
                                                customer_address: ord.customer_address,
                                                shipping_cost: ord.shipping_cost,
                                                shipping_courier: ord.shipping_courier,
                                                items: ord.items,
                                                subtotal: ord.subtotal,
                                                discount_amount:
                                                    ord.payment_details?.discount_amount || 0,
                                                total_amount: ord.total_amount,
                                                payment_method_label: ord.payment_method_label,
                                                cash_tendered: ord.payment_details?.cash_tendered,
                                                cash_change: ord.payment_details?.cash_change,
                                                footer_note: printerForm.receipt_footer,
                                                is_refund: isRefunded,
                                                refund_reason: ord.refund_reason,
                                                refund_amount: ord.refund_amount || ord.total_amount,
                                                refunded_at: ord.refunded_at,
                                                refunded_by_name: ord.refunded_by_name,
                                            };
                                            setCompletedReceipt(rep);
                                            setIsReceiptModalOpen(true);
                                        }}
                                        className="flex cursor-pointer items-center gap-1.5 rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs font-bold text-stone-700 shadow-2xs hover:border-brand-300 hover:bg-stone-50 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-200 dark:hover:bg-stone-700"
                                    >
                                        <Printer className="h-4 w-4 text-brand-700 dark:text-emerald-400" />
                                        <span>{isRefunded ? 'Struk Refund' : 'Cetak Struk'}</span>
                                    </button>

                                    {!isRefunded && (
                                        <button
                                            type="button"
                                            onClick={() => handleOpenRefundModal(ord)}
                                            className="flex cursor-pointer items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50/70 px-3 py-2 text-xs font-bold text-rose-700 shadow-2xs hover:bg-rose-100 hover:border-rose-300 transition dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300 dark:hover:bg-rose-900/60"
                                            title="Refund atau batalkan transaksi ini"
                                        >
                                            <RotateCcw className="h-3.5 w-3.5" />
                                            <span>Refund</span>
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};
