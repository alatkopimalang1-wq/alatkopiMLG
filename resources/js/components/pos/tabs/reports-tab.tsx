import React from 'react';
import {
    AlertCircle,
    Banknote,
    BarChart3,
    CreditCard,
    DollarSign,
    PieChart,
    Printer,
    Receipt,
    Shield,
    TrendingUp,
    Users,
    Wallet,
} from 'lucide-react';
import { PosActiveTab, PosStaffMember, PosCashier } from '@/types/pos';

interface ReportsTabProps {
    isActive: boolean;
    cashier: PosCashier;
    canAccessProfitLoss: boolean;
    isStaffRestricted: boolean;
    navigateToTab: (tab: PosActiveTab) => void;
    reportPeriod: 'daily' | 'monthly' | 'custom';
    setReportPeriod: (period: 'daily' | 'monthly' | 'custom') => void;
    reportDate: string;
    setReportDate: (val: string) => void;
    reportMonth: string;
    setReportMonth: (val: string) => void;
    reportStartDate: string;
    setReportStartDate: (val: string) => void;
    reportEndDate: string;
    setReportEndDate: (val: string) => void;
    reportStaffId: string;
    setReportStaffId: (val: string) => void;
    staff: PosStaffMember[];
    isLoadingReport: boolean;
    reportData: any;
    fetchSalesReport: () => void;
    handlePrintSalesReport: () => void;
    formatRp: (val: number) => string;
}

export const ReportsTab: React.FC<ReportsTabProps> = ({
    isActive,
    cashier,
    canAccessProfitLoss,
    isStaffRestricted,
    navigateToTab,
    reportPeriod,
    setReportPeriod,
    reportDate,
    setReportDate,
    reportMonth,
    setReportMonth,
    reportStartDate,
    setReportStartDate,
    reportEndDate,
    setReportEndDate,
    reportStaffId,
    setReportStaffId,
    staff,
    isLoadingReport,
    reportData,
    fetchSalesReport,
    handlePrintSalesReport,
    formatRp,
}) => {
    if (!isActive) return null;

    return (
<div className="mx-auto w-full max-w-5xl flex-1 space-y-6 overflow-y-auto bg-[#f4f6f6] p-4 sm:p-6 dark:bg-stone-950">
                    {/* Header & Filter Controls */}
                    <div className="flex flex-col justify-between gap-4 border-b border-stone-200 pb-4 sm:flex-row sm:items-center dark:border-stone-800">
                        <div>
                            <div className="flex flex-wrap items-center gap-2">
                                <h2 className="flex items-center gap-2 text-lg font-bold text-brand-950 dark:text-white">
                                    <BarChart3 className="h-5 w-5 text-brand-700 dark:text-emerald-400" />
                                    <span>Laporan Penjualan POS</span>
                                </h2>
                                {canAccessProfitLoss && (
                                    <button
                                        type="button"
                                        onClick={() =>
                                            navigateToTab('profit_loss')
                                        }
                                        className="ml-1 inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 transition hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 dark:hover:bg-emerald-900/60"
                                    >
                                        <PieChart className="h-3.5 w-3.5" />
                                        <span>Laporan Laba Rugi</span>
                                    </button>
                                )}
                            </div>
                            <p className="mt-0.5 text-xs text-stone-500 dark:text-stone-300">
                                Rekap omset, jumlah transaksi, dan arus kas
                                kasir
                            </p>
                        </div>

                        {/* Filter Buttons & Thermal Print Report */}
                        <div className="flex max-w-full flex-wrap items-center gap-2">
                            <div className="flex max-w-full scrollbar-none items-center overflow-x-auto rounded-xl border border-stone-200 bg-white p-1 text-xs font-semibold shadow-2xs dark:border-stone-800 dark:bg-stone-900">
                                <button
                                    type="button"
                                    onClick={() => setReportPeriod('daily')}
                                    className={`shrink-0 cursor-pointer rounded-lg px-3 py-1.5 font-bold whitespace-nowrap transition ${
                                        reportPeriod === 'daily'
                                            ? 'bg-brand-700 text-white shadow-xs'
                                            : 'text-stone-600 hover:text-brand-950 dark:text-stone-300 dark:hover:text-white'
                                    }`}
                                >
                                    Harian
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setReportPeriod('monthly')}
                                    className={`shrink-0 cursor-pointer rounded-lg px-3 py-1.5 font-bold whitespace-nowrap transition ${
                                        reportPeriod === 'monthly'
                                            ? 'bg-brand-700 text-white shadow-xs'
                                            : 'text-stone-600 hover:text-brand-950 dark:text-stone-300 dark:hover:text-white'
                                    }`}
                                >
                                    Bulanan
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setReportPeriod('custom')}
                                    className={`shrink-0 cursor-pointer rounded-lg px-3 py-1.5 font-bold whitespace-nowrap transition ${
                                        reportPeriod === 'custom'
                                            ? 'bg-brand-700 text-white shadow-xs'
                                            : 'text-stone-600 hover:text-brand-950 dark:text-stone-300 dark:hover:text-white'
                                    }`}
                                >
                                    Kustom
                                </button>
                            </div>

                            {reportData && (
                                <button
                                    type="button"
                                    onClick={handlePrintSalesReport}
                                    className="flex cursor-pointer items-center gap-1.5 rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs font-bold text-stone-700 shadow-2xs hover:border-brand-300 hover:bg-stone-50 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-200 dark:hover:bg-stone-700"
                                    title="Cetak struk ringkasan ke printer thermal (X-Report / Z-Report)"
                                >
                                    <Printer className="h-4 w-4 text-brand-700 dark:text-emerald-400" />
                                    <span>Cetak Struk Laporan</span>
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Date Pickers */}
                    <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-stone-200 bg-white p-3.5 text-xs shadow-xs dark:border-stone-800 dark:bg-stone-900">
                        {reportPeriod === 'daily' && (
                            <div className="flex items-center gap-2">
                                <span className="font-medium text-stone-500 dark:text-stone-300">
                                    Pilih Tanggal:
                                </span>
                                <input
                                    type="date"
                                    value={reportDate}
                                    onChange={(e) =>
                                        setReportDate(e.target.value)
                                    }
                                    className="rounded-xl border border-stone-200 bg-stone-50 px-3 py-1.5 font-medium text-stone-900 outline-none focus:border-brand-600 focus:bg-white dark:border-stone-700 dark:bg-stone-800 dark:text-white dark:focus:bg-stone-700"
                                />
                            </div>
                        )}

                        {reportPeriod === 'monthly' && (
                            <div className="flex items-center gap-2">
                                <span className="font-medium text-stone-500 dark:text-stone-300">
                                    Pilih Bulan:
                                </span>
                                <input
                                    type="month"
                                    value={reportMonth}
                                    onChange={(e) =>
                                        setReportMonth(e.target.value)
                                    }
                                    className="rounded-xl border border-stone-200 bg-stone-50 px-3 py-1.5 font-medium text-stone-900 outline-none focus:border-brand-600 focus:bg-white dark:border-stone-700 dark:bg-stone-800 dark:text-white dark:focus:bg-stone-700"
                                />
                            </div>
                        )}

                        {reportPeriod === 'custom' && (
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="font-medium text-stone-500 dark:text-stone-300">
                                    Dari:
                                </span>
                                <input
                                    type="date"
                                    value={reportStartDate}
                                    onChange={(e) =>
                                        setReportStartDate(e.target.value)
                                    }
                                    className="rounded-xl border border-stone-200 bg-stone-50 px-3 py-1.5 font-medium text-stone-900 outline-none focus:border-brand-600 focus:bg-white dark:border-stone-700 dark:bg-stone-800 dark:text-white dark:focus:bg-stone-700"
                                />
                                <span className="font-medium text-stone-500 dark:text-stone-300">
                                    Sampai:
                                </span>
                                <input
                                    type="date"
                                    value={reportEndDate}
                                    onChange={(e) =>
                                        setReportEndDate(e.target.value)
                                    }
                                    className="rounded-xl border border-stone-200 bg-stone-50 px-3 py-1.5 font-medium text-stone-900 outline-none focus:border-brand-600 focus:bg-white dark:border-stone-700 dark:bg-stone-800 dark:text-white dark:focus:bg-stone-700"
                                />
                            </div>
                        )}

                        {/* Filter Staf Kasir (Hanya Owner/Admin yang bisa memilih, Staf Kasir terkunci ke dirinya sendiri) */}
                        {isStaffRestricted ? (
                            <div className="flex items-center gap-1.5 rounded-xl border border-emerald-300 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-200">
                                <Shield className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                                <span>
                                    Laporan Kasir: <span className="underline">{cashier.name}</span>
                                </span>
                                <span className="text-[10px] font-normal text-emerald-700/80 dark:text-emerald-300/80">
                                    (Penjualan shift Anda sendiri)
                                </span>
                            </div>
                        ) : (
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="font-medium text-stone-500 dark:text-stone-300">
                                    Staf Kasir:
                                </span>
                                <select
                                    value={reportStaffId}
                                    onChange={(e) => setReportStaffId(e.target.value)}
                                    className="rounded-xl border border-stone-200 bg-stone-50 px-3 py-1.5 font-bold text-stone-900 outline-none focus:border-brand-600 focus:bg-white dark:border-stone-700 dark:bg-stone-800 dark:text-white"
                                >
                                    <option value="all">Semua Staf Kasir (Total Keseluruhan)</option>
                                    {(reportData?.staff_options || staff || []).map((s: any) => (
                                        <option key={s.id} value={String(s.id)}>
                                            {s.name} ({s.role || 'kasir'})
                                        </option>
                                    ))}
                                </select>
                                {reportStaffId !== 'all' && (
                                    <button
                                        type="button"
                                        onClick={() => setReportStaffId('all')}
                                        className="text-[11px] font-bold text-brand-700 hover:underline dark:text-emerald-400"
                                    >
                                        ✕ Reset ke Semua Staf
                                    </button>
                                )}
                            </div>
                        )}

                        <span className="ml-auto text-stone-500 dark:text-stone-300">
                            Periode:{' '}
                            <strong className="font-bold text-brand-950 dark:text-emerald-400">
                                {reportData?.period_title || '...'}
                            </strong>
                        </span>
                    </div>

                    {isLoadingReport ? (
                        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-stone-200 bg-white p-12 text-center text-stone-500 shadow-xs dark:border-stone-800 dark:bg-stone-900 dark:text-stone-300">
                            <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-700 border-t-transparent" />
                            <span className="text-sm font-medium">
                                Memuat data laporan penjualan...
                            </span>
                        </div>
                    ) : reportData ? (
                        <div className="space-y-6">
                            {/* KPI Metrics Cards */}
                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
                                <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-xs dark:border-stone-800 dark:bg-stone-900">
                                    <div className="flex items-center justify-between text-xs text-stone-500 dark:text-stone-300">
                                        <span>Total Omset Penjualan</span>
                                        <DollarSign className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                                    </div>
                                    <div className="mt-2 text-2xl font-black text-brand-950 dark:text-emerald-400">
                                        Rp{' '}
                                        {formatRp(
                                            reportData?.total_revenue ?? 0,
                                        )}
                                    </div>
                                    <div className="mt-1 text-[11px] text-stone-500 dark:text-stone-400">
                                        Dari{' '}
                                        {reportData?.total_transactions ?? 0}{' '}
                                        transaksi selesai
                                    </div>
                                </div>

                                <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-xs dark:border-stone-800 dark:bg-stone-900">
                                    <div className="flex items-center justify-between text-xs text-stone-500 dark:text-stone-300">
                                        <span>Jumlah Transaksi</span>
                                        <Receipt className="h-4 w-4 text-brand-700 dark:text-amber-400" />
                                    </div>
                                    <div className="mt-2 text-2xl font-black text-brand-950 dark:text-white">
                                        {reportData?.total_transactions ?? 0}{' '}
                                        Trx
                                    </div>
                                    <div className="mt-1 text-[11px] text-stone-500 dark:text-stone-400">
                                        Rata-rata: Rp{' '}
                                        {formatRp(
                                            reportData?.average_order_value ??
                                                0,
                                        )}{' '}
                                        / trx
                                    </div>
                                </div>

                                <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-xs dark:border-stone-800 dark:bg-stone-900">
                                    <div className="flex items-center justify-between text-xs text-stone-500 dark:text-stone-300">
                                        <span>Total Penjualan Tunai</span>
                                        <Banknote className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                                    </div>
                                    <div className="mt-2 text-2xl font-black text-brand-950 dark:text-emerald-400">
                                        Rp{' '}
                                        {formatRp(
                                            reportData?.cash_drawer
                                                ?.cash_sales ?? 0,
                                        )}
                                    </div>
                                    <div className="mt-1 text-[11px] text-stone-500 dark:text-stone-400">
                                        Uang fisik masuk kasir
                                    </div>
                                </div>

                                <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-xs dark:border-stone-800 dark:bg-stone-900">
                                    <div className="flex items-center justify-between text-xs text-stone-500 dark:text-stone-300">
                                        <span>Estimasi Kas di Laci</span>
                                        <Wallet className="h-4 w-4 text-brand-700 dark:text-emerald-400" />
                                    </div>
                                    <div className="mt-2 text-2xl font-black text-emerald-700 dark:text-emerald-400">
                                        Rp{' '}
                                        {formatRp(
                                            reportData?.cash_drawer?.net_cash ??
                                                0,
                                        )}
                                    </div>
                                    <div className="mt-1 text-[11px] text-stone-500 dark:text-stone-400">
                                        Penjualan tunai + Kas masuk - Kas keluar
                                    </div>
                                </div>
                            </div>

                            {/* SECTION: REKAP PENJUALAN PER STAF / KASIR (HANYA MUNCUL JIKA OWNER/ADMIN & MEMILIH SEMUA STAF) */}
                            {!isStaffRestricted && (reportData?.staff_breakdown || []).length > 0 && reportStaffId === 'all' && (
                                <div className="space-y-3 rounded-2xl border border-stone-200 bg-white p-4 shadow-xs sm:p-5 dark:border-stone-800 dark:bg-stone-900">
                                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-100 pb-3 dark:border-stone-800">
                                        <div className="flex items-center gap-2">
                                            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-100 text-brand-800 dark:bg-stone-800 dark:text-amber-300">
                                                <Users className="h-4 w-4" />
                                            </div>
                                            <div>
                                                <h3 className="text-sm font-bold text-brand-950 dark:text-white">
                                                    Rekap Penjualan per Staf Kasir
                                                </h3>
                                                <p className="text-[11px] text-stone-500 dark:text-stone-400">
                                                    Rincian kontribusi omset, transaksi, dan arus kas per masing-masing staf kasir
                                                </p>
                                            </div>
                                        </div>
                                        <span className="rounded-full bg-stone-100 px-2.5 py-1 text-[10px] font-bold text-stone-700 dark:bg-stone-800 dark:text-stone-300">
                                            {reportData.staff_breakdown.length} Staf Aktif Berjualan
                                        </span>
                                    </div>

                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left text-xs">
                                            <thead>
                                                <tr className="border-b border-stone-200 text-stone-500 dark:border-stone-800 dark:text-stone-400">
                                                    <th className="py-2.5 font-bold">Nama Staf</th>
                                                    <th className="py-2.5 font-bold">Role</th>
                                                    <th className="py-2.5 text-center font-bold">Total Trx</th>
                                                    <th className="py-2.5 text-right font-bold">Uang Tunai (Cash)</th>
                                                    <th className="py-2.5 text-right font-bold">Non-Tunai (QRIS/EDC)</th>
                                                    <th className="py-2.5 text-right font-bold">Total Omset</th>
                                                    <th className="py-2.5 text-center font-bold">Kontribusi</th>
                                                    <th className="py-2.5 text-right font-bold">Aksi</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-stone-100 dark:divide-stone-800/60">
                                                {reportData.staff_breakdown.map((st: any) => (
                                                    <tr key={st.staff_id} className="hover:bg-stone-50/70 dark:hover:bg-stone-800/40">
                                                        <td className="py-3 font-bold text-stone-900 dark:text-white">
                                                            {st.name}
                                                        </td>
                                                        <td className="py-3">
                                                            <span className={`rounded-full px-2 py-0.5 text-[9.5px] font-bold capitalize ${
                                                                st.role === 'owner'
                                                                    ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                                                                    : st.role === 'admin'
                                                                      ? 'bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300'
                                                                      : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                                                            }`}>
                                                                {st.role || 'kasir'}
                                                            </span>
                                                        </td>
                                                        <td className="py-3 text-center font-bold text-stone-700 dark:text-stone-300">
                                                            {st.total_transactions} Trx
                                                        </td>
                                                        <td className="py-3 text-right text-stone-700 dark:text-stone-300">
                                                            Rp {formatRp(st.cash_sales)}
                                                        </td>
                                                        <td className="py-3 text-right text-stone-700 dark:text-stone-300">
                                                            Rp {formatRp(st.non_cash_sales)}
                                                        </td>
                                                        <td className="py-3 text-right font-black text-brand-950 dark:text-emerald-400">
                                                            Rp {formatRp(st.total_revenue)}
                                                        </td>
                                                        <td className="py-3 text-center">
                                                            <span className="rounded-md bg-stone-100 px-1.5 py-0.5 text-[10px] font-bold text-stone-800 dark:bg-stone-800 dark:text-stone-200">
                                                                {st.percentage}%
                                                            </span>
                                                        </td>
                                                        <td className="py-3 text-right">
                                                            <button
                                                                type="button"
                                                                onClick={() => setReportStaffId(st.staff_id)}
                                                                className="cursor-pointer rounded-lg bg-stone-100 px-2.5 py-1 text-[11px] font-bold text-brand-700 transition hover:bg-brand-700 hover:text-white dark:bg-stone-800 dark:text-emerald-300 dark:hover:bg-emerald-600 dark:hover:text-white"
                                                            >
                                                                Filter Staf Ini →
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {/* Two Column Section */}
                            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                                <div className="space-y-3 rounded-2xl border border-stone-200 bg-white p-4 shadow-xs sm:p-5 dark:border-stone-800 dark:bg-stone-900">
                                    <h3 className="flex items-center gap-2 text-sm font-bold text-brand-950 dark:text-white">
                                        <CreditCard className="h-4 w-4 text-brand-700 dark:text-emerald-400" />
                                        <span>
                                            Rincian per Metode Pembayaran
                                        </span>
                                    </h3>
                                    <div className="space-y-2 pt-1">
                                        {(
                                            reportData?.payment_breakdown || []
                                        ).map((pm: any) => (
                                            <div
                                                key={pm.method}
                                                className="flex items-center justify-between rounded-xl border border-stone-200/80 bg-stone-50 p-3 text-xs dark:border-stone-700 dark:bg-stone-800"
                                            >
                                                <div>
                                                    <span className="font-bold text-stone-900 dark:text-white">
                                                        {pm.label}
                                                    </span>
                                                    <span className="ml-2 text-[11px] text-stone-500 dark:text-stone-300">
                                                        ({pm.count} transaksi)
                                                    </span>
                                                </div>
                                                <span className="font-black text-brand-900 dark:text-emerald-400">
                                                    Rp {formatRp(pm.total)}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-3 rounded-2xl border border-stone-200 bg-white p-4 shadow-xs sm:p-5 dark:border-stone-800 dark:bg-stone-900">
                                    <h3 className="flex items-center gap-2 text-sm font-bold text-brand-950 dark:text-white">
                                        <TrendingUp className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                                        <span>Produk & Varian Terlaris</span>
                                    </h3>
                                    <div className="max-h-72 touch-pan-y space-y-2 overflow-y-auto overscroll-y-contain pt-1">
                                        {(reportData?.top_products || [])
                                            .length === 0 ? (
                                            <p className="py-4 text-center text-xs text-stone-400 dark:text-stone-400">
                                                Belum ada data penjualan pada
                                                periode ini
                                            </p>
                                        ) : (
                                            (
                                                reportData?.top_products || []
                                            ).map((tp: any, idx: number) => (
                                                <div
                                                    key={idx}
                                                    className="flex items-center justify-between rounded-xl border border-stone-200/80 bg-stone-50 p-2.5 text-xs dark:border-stone-700 dark:bg-stone-800"
                                                >
                                                    <div className="flex min-w-0 items-center gap-2.5">
                                                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-100 text-[10px] font-bold text-brand-800 dark:bg-stone-700 dark:text-amber-300">
                                                            {idx + 1}
                                                        </span>
                                                        <div className="truncate">
                                                            <div className="truncate font-bold text-stone-900 dark:text-white">
                                                                {tp.name}
                                                            </div>
                                                            <div className="text-[10px] text-stone-500 dark:text-stone-300">
                                                                {tp.variant}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="shrink-0 text-right">
                                                        <div className="font-bold text-brand-950 dark:text-white">
                                                            {tp.quantity} pcs
                                                        </div>
                                                        <div className="text-[10px] font-bold text-brand-700 dark:text-emerald-400">
                                                            Rp{' '}
                                                            {formatRp(tp.total)}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="rounded-2xl border border-stone-200 bg-white p-12 text-center text-stone-500 shadow-xs dark:border-stone-800 dark:bg-stone-900 dark:text-stone-300">
                            <AlertCircle className="mx-auto mb-2 h-8 w-8 text-stone-400 dark:text-stone-400" />
                            <p className="font-bold text-stone-700 dark:text-stone-200">
                                Tidak ada data laporan yang dapat dimuat
                            </p>
                            <p className="mt-1 text-xs text-stone-500 dark:text-stone-300">
                                Silakan coba ganti filter tanggal atau muat
                                ulang.
                            </p>
                            <button
                                type="button"
                                onClick={() => fetchSalesReport()}
                                className="mt-4 cursor-pointer rounded-xl bg-brand-700 px-4 py-2 text-xs font-bold text-white transition hover:bg-brand-800"
                            >
                                Muat Ulang Laporan
                            </button>
                        </div>
                    )}
                </div>
    );
};
