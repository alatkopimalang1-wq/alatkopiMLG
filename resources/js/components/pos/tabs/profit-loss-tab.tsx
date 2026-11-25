import React from 'react';
import {
    AlertCircle,
    ArrowUpRight,
    BarChart3,
    Calculator,
    Calendar,
    ChevronDown,
    FileSpreadsheet,
    FileText,
    Package,
    PieChart,
    Printer,
    RefreshCw,
    TrendingDown,
    TrendingUp,
    Wallet,
} from 'lucide-react';
import { PosActiveTab } from '@/types/pos';

interface ProfitLossTabProps {
    isActive: boolean;
    canAccessProfitLoss: boolean;
    navigateToTab: (tab: PosActiveTab) => void;
    plPeriod: 'today' | 'yesterday' | 'this_month' | 'last_month' | 'custom_month';
    setPlPeriod: (period: 'today' | 'yesterday' | 'this_month' | 'last_month' | 'custom_month') => void;
    plDate: string;
    setPlDate: (date: string) => void;
    plMonth: string;
    setPlMonth: (month: string) => void;
    getLocalDateString: () => string;
    isLoadingProfitLoss: boolean;
    profitLossData: any;
    fetchProfitLossReport: (period?: string, date?: string, month?: string) => void | Promise<void>;
    handlePrintProfitLossReport: () => void;
    isExportingPlExcel: boolean;
    handleExportProfitLossExcel: () => void;
    selectedPlExpenseCategory: string;
    setSelectedPlExpenseCategory: (cat: string) => void;
    expandedPlOrderId: number | null;
    setExpandedPlOrderId: React.Dispatch<React.SetStateAction<number | null>>;
    formatRp: (val: number) => string;
}

export const ProfitLossTab: React.FC<ProfitLossTabProps> = ({
    isActive,
    canAccessProfitLoss,
    navigateToTab,
    plPeriod,
    setPlPeriod,
    plDate,
    setPlDate,
    plMonth,
    setPlMonth,
    getLocalDateString,
    isLoadingProfitLoss,
    profitLossData,
    fetchProfitLossReport,
    handlePrintProfitLossReport,
    isExportingPlExcel,
    handleExportProfitLossExcel,
    selectedPlExpenseCategory,
    setSelectedPlExpenseCategory,
    expandedPlOrderId,
    setExpandedPlOrderId,
    formatRp,
}) => {
    if (!isActive || !canAccessProfitLoss) return null;

    return (
<div className="mx-auto w-full max-w-5xl flex-1 space-y-6 overflow-y-auto bg-[#f4f6f6] p-4 sm:p-6 dark:bg-stone-950">
                    {/* Header & Filter Controls */}
                    <div className="flex flex-col justify-between gap-4 border-b border-stone-200 pb-4 sm:flex-row sm:items-center dark:border-stone-800">
                        <div>
                            <div className="flex flex-wrap items-center gap-2">
                                <h2 className="flex items-center gap-2 text-lg font-bold text-brand-950 dark:text-white">
                                    <PieChart className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                                    <span>Laporan Laba Rugi (P&L)</span>
                                </h2>
                                <button
                                    type="button"
                                    onClick={() => navigateToTab('reports')}
                                    className="ml-1 inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-stone-200 bg-stone-100 px-2.5 py-1 text-xs font-bold text-stone-700 transition hover:bg-stone-200 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-300 dark:hover:bg-stone-700"
                                >
                                    <BarChart3 className="h-3.5 w-3.5" />
                                    <span>Laporan Penjualan</span>
                                </button>
                            </div>
                            <p className="mt-0.5 text-xs text-stone-500 dark:text-stone-300">
                                Rekap Penjualan, HPP (Harga Pokok Penjualan),
                                Beban Operasional Kasir, dan Laba Bersih
                            </p>
                        </div>

                        {/* Filter Buttons & Actions */}
                        <div className="flex max-w-full flex-wrap items-center gap-2">
                            <div className="flex max-w-full scrollbar-none items-center overflow-x-auto rounded-xl border border-stone-200 bg-white p-1 text-xs font-semibold shadow-2xs dark:border-stone-800 dark:bg-stone-900">
                                <button
                                    type="button"
                                    onClick={() => setPlPeriod('today')}
                                    className={`shrink-0 cursor-pointer rounded-lg px-3 py-1.5 font-bold whitespace-nowrap transition ${
                                        plPeriod === 'today'
                                            ? 'bg-emerald-700 text-white shadow-xs'
                                            : 'text-stone-600 hover:text-brand-950 dark:text-stone-300 dark:hover:text-white'
                                    }`}
                                >
                                    Hari Ini / Tanggal
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setPlPeriod('yesterday')}
                                    className={`shrink-0 cursor-pointer rounded-lg px-3 py-1.5 font-bold whitespace-nowrap transition ${
                                        plPeriod === 'yesterday'
                                            ? 'bg-emerald-700 text-white shadow-xs'
                                            : 'text-stone-600 hover:text-brand-950 dark:text-stone-300 dark:hover:text-white'
                                    }`}
                                >
                                    Kemarin
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setPlPeriod('this_month')}
                                    className={`shrink-0 cursor-pointer rounded-lg px-3 py-1.5 font-bold whitespace-nowrap transition ${
                                        plPeriod === 'this_month'
                                            ? 'bg-emerald-700 text-white shadow-xs'
                                            : 'text-stone-600 hover:text-brand-950 dark:text-stone-300 dark:hover:text-white'
                                    }`}
                                >
                                    Bulan Ini
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setPlPeriod('last_month')}
                                    className={`shrink-0 cursor-pointer rounded-lg px-3 py-1.5 font-bold whitespace-nowrap transition ${
                                        plPeriod === 'last_month'
                                            ? 'bg-emerald-700 text-white shadow-xs'
                                            : 'text-stone-600 hover:text-brand-950 dark:text-stone-300 dark:hover:text-white'
                                    }`}
                                >
                                    Bulan Lalu
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setPlPeriod('custom_month')}
                                    className={`shrink-0 cursor-pointer rounded-lg px-3 py-1.5 font-bold whitespace-nowrap transition ${
                                        plPeriod === 'custom_month'
                                            ? 'bg-emerald-700 text-white shadow-xs'
                                            : 'text-stone-600 hover:text-brand-950 dark:text-stone-300 dark:hover:text-white'
                                    }`}
                                >
                                    Custom Bulan
                                </button>
                            </div>

                            {profitLossData && (
                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={handleExportProfitLossExcel}
                                        disabled={isExportingPlExcel}
                                        className="flex cursor-pointer items-center gap-1.5 rounded-xl bg-emerald-700 px-3.5 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-emerald-800 disabled:opacity-50"
                                        title="Download Laporan Laba Rugi lengkap format Excel (.xlsx)"
                                    >
                                        <FileSpreadsheet className="h-4 w-4 text-emerald-100" />
                                        <span>
                                            {isExportingPlExcel
                                                ? 'Mengunduh...'
                                                : 'Export Excel'}
                                        </span>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={handlePrintProfitLossReport}
                                        className="flex cursor-pointer items-center gap-1.5 rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs font-bold text-stone-700 shadow-2xs hover:border-emerald-500 hover:bg-stone-50 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-200 dark:hover:bg-stone-700"
                                        title="Cetak struk ringkasan Laba Rugi ke printer thermal"
                                    >
                                        <Printer className="h-4 w-4 text-emerald-700 dark:text-emerald-400" />
                                        <span>Cetak Struk P&L</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Date Pickers for Today / Custom Date and Custom Month */}
                    {(plPeriod === 'today' || plPeriod === 'custom_month') && (
                        <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-stone-200 bg-white p-3.5 text-xs shadow-xs dark:border-stone-800 dark:bg-stone-900">
                            {plPeriod === 'today' && (
                                <div className="flex items-center gap-2">
                                    <span className="font-medium text-stone-500 dark:text-stone-300">
                                        Pilih Tanggal:
                                    </span>
                                    <input
                                        type="date"
                                        value={plDate}
                                        onChange={(e) =>
                                            setPlDate(e.target.value)
                                        }
                                        className="rounded-xl border border-stone-200 bg-stone-50 px-3 py-1.5 font-medium text-stone-900 outline-none focus:border-emerald-600 focus:bg-white dark:border-stone-700 dark:bg-stone-800 dark:text-white dark:focus:bg-stone-700"
                                    />
                                    {plDate !== getLocalDateString() && (
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setPlDate(getLocalDateString())
                                            }
                                            className="cursor-pointer rounded-lg bg-stone-100 px-2 py-1 text-[11px] font-bold text-stone-600 hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-300"
                                        >
                                            Reset Hari Ini
                                        </button>
                                    )}
                                </div>
                            )}

                            {plPeriod === 'custom_month' && (
                                <div className="flex items-center gap-2">
                                    <span className="font-medium text-stone-500 dark:text-stone-300">
                                        Pilih Bulan & Tahun:
                                    </span>
                                    <input
                                        type="month"
                                        value={plMonth}
                                        onChange={(e) =>
                                            setPlMonth(e.target.value)
                                        }
                                        className="rounded-xl border border-stone-200 bg-stone-50 px-3 py-1.5 font-medium text-stone-900 outline-none focus:border-emerald-600 focus:bg-white dark:border-stone-700 dark:bg-stone-800 dark:text-white dark:focus:bg-stone-700"
                                    />
                                </div>
                            )}
                        </div>
                    )}

                    {isLoadingProfitLoss ? (
                        <div className="py-20 text-center">
                            <RefreshCw className="mx-auto mb-3 h-8 w-8 animate-spin text-emerald-600" />
                            <p className="text-sm font-semibold text-stone-600 dark:text-stone-400">
                                Menghitung Laba Rugi & HPP...
                            </p>
                        </div>
                    ) : profitLossData ? (
                        <div className="space-y-6">
                            {/* Periode Banner */}
                            <div className="flex flex-col justify-between gap-2 rounded-2xl border border-emerald-200 bg-emerald-50/80 p-4 sm:flex-row sm:items-center dark:border-emerald-800/60 dark:bg-emerald-950/30">
                                <div>
                                    <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                                        Laporan Periode
                                    </p>
                                    <h3 className="text-base font-bold text-emerald-950 dark:text-emerald-100">
                                        {profitLossData.period_title}
                                    </h3>
                                </div>
                                <div className="flex items-center gap-4 text-xs text-stone-500 dark:text-stone-400">
                                    <span>
                                        Transaksi Selesai:{' '}
                                        <strong>
                                            {
                                                profitLossData.summary
                                                    .total_transactions
                                            }
                                        </strong>
                                    </span>
                                    <span>
                                        Total Item Terjual:{' '}
                                        <strong>
                                            {profitLossData.summary.items_sold}
                                        </strong>
                                    </span>
                                </div>
                            </div>

                            {/* Informative Warning if Items without HPP */}
                            {profitLossData.summary.items_without_hpp_count >
                                0 && (
                                <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-3.5 text-xs text-amber-900 dark:border-amber-800/50 dark:bg-amber-950/40 dark:text-amber-200">
                                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                                    <div>
                                        <p className="font-bold">
                                            Perhatian: Ada{' '}
                                            {
                                                profitLossData.summary
                                                    .items_without_hpp_count
                                            }{' '}
                                            item terjual tanpa HPP terisi
                                        </p>
                                        <p className="mt-0.5 text-amber-800 dark:text-amber-300">
                                            Varian produk tersebut belum
                                            memiliki Harga Dasar/HPP di
                                            Dashboard Admin sehingga dihitung
                                            dengan HPP Rp 0. Anda dapat mengisi
                                            HPP varian melalui dashboard
                                            Filament agar kalkulasi laba semakin
                                            presisi.
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* 4 KPI Cards */}
                            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                                {/* 1. Penjualan Bersih */}
                                <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-2xs dark:border-stone-800 dark:bg-stone-900">
                                    <div className="mb-1 flex items-center justify-between text-xs text-stone-500 dark:text-stone-400">
                                        <span>Penjualan Bersih</span>
                                        <TrendingUp className="h-4 w-4 text-blue-500" />
                                    </div>
                                    <p className="text-lg font-bold text-stone-900 sm:text-xl dark:text-white">
                                        {formatRp(
                                            profitLossData.summary.net_sales,
                                        )}
                                    </p>
                                    <p className="mt-1 text-[11px] text-stone-500 dark:text-stone-400">
                                        Kotor{' '}
                                        {formatRp(
                                            profitLossData.summary.gross_sales,
                                        )}{' '}
                                        - Diskon{' '}
                                        {formatRp(
                                            profitLossData.summary
                                                .total_discounts,
                                        )}
                                    </p>
                                </div>

                                {/* 2. Total HPP (COGS) */}
                                <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-2xs dark:border-stone-800 dark:bg-stone-900">
                                    <div className="mb-1 flex items-center justify-between text-xs text-stone-500 dark:text-stone-400">
                                        <span>Total HPP (COGS)</span>
                                        <Package className="h-4 w-4 text-amber-500" />
                                    </div>
                                    <p className="text-lg font-bold text-stone-900 sm:text-xl dark:text-white">
                                        {formatRp(
                                            profitLossData.summary.total_cogs,
                                        )}
                                    </p>
                                    <p className="mt-1 text-[11px] text-stone-500 dark:text-stone-400">
                                        {
                                            profitLossData.summary
                                                .items_with_hpp_count
                                        }{' '}
                                        item terdata HPP
                                    </p>
                                </div>

                                {/* 3. Laba Kotor */}
                                <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-2xs dark:border-stone-800 dark:bg-stone-900">
                                    <div className="mb-1 flex items-center justify-between text-xs text-stone-500 dark:text-stone-400">
                                        <span>Laba Kotor</span>
                                        <Calculator className="h-4 w-4 text-emerald-500" />
                                    </div>
                                    <p className="text-lg font-bold text-emerald-600 sm:text-xl dark:text-emerald-400">
                                        {formatRp(
                                            profitLossData.summary.gross_profit,
                                        )}
                                    </p>
                                    <p className="mt-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
                                        Margin:{' '}
                                        {
                                            profitLossData.summary
                                                .gross_margin_pct
                                        }
                                        %
                                    </p>
                                </div>

                                {/* 4. Laba Bersih */}
                                <div
                                    className={`rounded-2xl border p-4 shadow-2xs ${
                                        profitLossData.summary.net_profit >= 0
                                            ? 'border-emerald-200 bg-emerald-50/50 dark:border-emerald-800/70 dark:bg-emerald-950/20'
                                            : 'border-rose-200 bg-rose-50/50 dark:border-rose-800/70 dark:bg-rose-950/20'
                                    }`}
                                >
                                    <div className="mb-1 flex items-center justify-between text-xs">
                                        <span className="font-semibold text-stone-700 dark:text-stone-300">
                                            Laba Bersih (Net)
                                        </span>
                                        {profitLossData.summary.net_profit >=
                                        0 ? (
                                            <TrendingUp className="h-4 w-4 text-emerald-600" />
                                        ) : (
                                            <TrendingDown className="h-4 w-4 text-rose-600" />
                                        )}
                                    </div>
                                    <p
                                        className={`text-lg font-bold sm:text-xl ${
                                            profitLossData.summary.net_profit >=
                                            0
                                                ? 'text-emerald-700 dark:text-emerald-400'
                                                : 'text-rose-600 dark:text-rose-400'
                                        }`}
                                    >
                                        {formatRp(
                                            profitLossData.summary.net_profit,
                                        )}
                                    </p>
                                    <p className="mt-1 text-[11px] font-semibold text-stone-600 dark:text-stone-400">
                                        Net Margin:{' '}
                                        {profitLossData.summary.net_margin_pct}%
                                    </p>
                                </div>
                            </div>

                            {/* Waterfall Income Statement */}
                            <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-xs dark:border-stone-800 dark:bg-stone-900">
                                <h4 className="mb-4 flex items-center gap-2 text-sm font-bold text-stone-900 dark:text-white">
                                    <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
                                    <span>
                                        Laporan Laba Rugi Berjenjang (Income
                                        Statement)
                                    </span>
                                </h4>

                                <div className="divide-y divide-stone-100 text-xs sm:text-sm dark:divide-stone-800/80">
                                    {/* 1. Penjualan Kotor */}
                                    <div className="flex items-center justify-between py-2.5">
                                        <span className="text-stone-600 dark:text-stone-300">
                                            Total Penjualan Kotor (Gross Sales)
                                        </span>
                                        <span className="font-semibold text-stone-900 dark:text-white">
                                            {formatRp(
                                                profitLossData.summary
                                                    .gross_sales,
                                            )}
                                        </span>
                                    </div>

                                    {/* 2. Diskon */}
                                    <div className="flex items-center justify-between py-2.5 text-stone-500 dark:text-stone-400">
                                        <span className="pl-4">
                                            Dikurangi: Potongan & Diskon
                                            Penjualan
                                        </span>
                                        <span className="font-medium text-rose-600 dark:text-rose-400">
                                            -{' '}
                                            {formatRp(
                                                profitLossData.summary
                                                    .total_discounts,
                                            )}
                                        </span>
                                    </div>

                                    {/* 3. Penjualan Bersih */}
                                    <div className="my-1 flex items-center justify-between rounded-xl bg-stone-50 px-3 py-3 font-bold dark:bg-stone-800/40">
                                        <span className="text-stone-900 dark:text-white">
                                            Penjualan Bersih (Net Revenue)
                                        </span>
                                        <span className="text-stone-900 dark:text-white">
                                            {formatRp(
                                                profitLossData.summary
                                                    .net_sales,
                                            )}
                                        </span>
                                    </div>

                                    {/* 4. HPP */}
                                    <div className="flex items-center justify-between py-2.5 text-stone-600 dark:text-stone-300">
                                        <span className="pl-4">
                                            Dikurangi: Biaya Pokok Penjualan
                                            (HPP / COGS)
                                        </span>
                                        <span className="font-medium text-rose-600 dark:text-rose-400">
                                            -{' '}
                                            {formatRp(
                                                profitLossData.summary
                                                    .total_cogs,
                                            )}
                                        </span>
                                    </div>

                                    {/* 5. Laba Kotor */}
                                    <div className="my-1 flex items-center justify-between rounded-xl bg-emerald-50 px-3 py-3 font-bold text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200">
                                        <span>LABA KOTOR (GROSS PROFIT)</span>
                                        <div className="text-right">
                                            <div>
                                                {formatRp(
                                                    profitLossData.summary
                                                        .gross_profit,
                                                )}
                                            </div>
                                            <div className="text-[11px] font-medium text-emerald-700 dark:text-emerald-400">
                                                Margin{' '}
                                                {
                                                    profitLossData.summary
                                                        .gross_margin_pct
                                                }
                                                %
                                            </div>
                                        </div>
                                    </div>

                                    {/* 6. Beban Operasional Kas Keluar */}
                                    <div className="flex items-center justify-between py-2.5 text-stone-600 dark:text-stone-300">
                                        <span className="pl-4">
                                            Dikurangi: Beban Kas Keluar Kasir
                                            (Operasional/Bahan/Gaji)
                                        </span>
                                        <span className="font-medium text-rose-600 dark:text-rose-400">
                                            -{' '}
                                            {formatRp(
                                                profitLossData.summary
                                                    .total_expenses,
                                            )}
                                        </span>
                                    </div>

                                    {/* 7. Pendapatan Kas Masuk Lain */}
                                    {profitLossData.summary.other_income >
                                        0 && (
                                        <div className="flex items-center justify-between py-2.5 text-stone-600 dark:text-stone-300">
                                            <span className="pl-4">
                                                Ditambah: Pendapatan Kas Masuk
                                                Lainnya
                                            </span>
                                            <span className="font-medium text-emerald-600 dark:text-emerald-400">
                                                +{' '}
                                                {formatRp(
                                                    profitLossData.summary
                                                        .other_income,
                                                )}
                                            </span>
                                        </div>
                                    )}

                                    {/* 8. Laba Bersih */}
                                    <div
                                        className={`my-1 flex items-center justify-between rounded-xl px-3 py-3.5 font-bold ${
                                            profitLossData.summary.net_profit >=
                                            0
                                                ? 'bg-emerald-100 text-sm text-emerald-950 sm:text-base dark:bg-emerald-900/40 dark:text-emerald-100'
                                                : 'bg-rose-100 text-sm text-rose-950 sm:text-base dark:bg-rose-900/40 dark:text-rose-100'
                                        }`}
                                    >
                                        <span>LABA BERSIH (NET PROFIT)</span>
                                        <div className="text-right">
                                            <div>
                                                {formatRp(
                                                    profitLossData.summary
                                                        .net_profit,
                                                )}
                                            </div>
                                            <div className="text-[11px] font-semibold opacity-85">
                                                Net Margin{' '}
                                                {
                                                    profitLossData.summary
                                                        .net_margin_pct
                                                }
                                                %
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Top Margin Products & Operating Expenses Grid */}
                            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                                {/* Left Column: Transaksi Per Pesanan (Harian) ATAU Rekap Harian (Bulanan) */}
                                <div className="flex flex-col rounded-2xl border border-stone-200 bg-white p-5 shadow-xs dark:border-stone-800 dark:bg-stone-900">
                                    {profitLossData.is_monthly ? (
                                        /* Mode Bulanan: Rekap Transaksi Harian (HPP + Laba) */
                                        <>
                                            <div className="mb-4 flex items-center justify-between">
                                                <h4 className="flex items-center gap-2 text-sm font-bold text-stone-900 dark:text-white">
                                                    <Calendar className="h-4 w-4 text-emerald-600" />
                                                    <span>
                                                        Rekap Transaksi Harian
                                                        (HPP & Laba)
                                                    </span>
                                                </h4>
                                                <span className="text-[11px] text-stone-400">
                                                    {profitLossData
                                                        .daily_summary
                                                        ?.length || 0}{' '}
                                                    Hari Transaksi
                                                </span>
                                            </div>

                                            {profitLossData.daily_summary &&
                                            profitLossData.daily_summary
                                                .length > 0 ? (
                                                <div className="-mx-5 max-h-96 overflow-x-auto overflow-y-auto px-5">
                                                    <table className="w-full text-left text-xs">
                                                        <thead className="sticky top-0 z-10 bg-white shadow-2xs dark:bg-stone-900">
                                                            <tr className="border-b border-stone-200 pb-2 text-stone-400 dark:border-stone-800">
                                                                <th className="pb-2 font-semibold">
                                                                    Tanggal
                                                                </th>
                                                                <th className="pb-2 text-center font-semibold">
                                                                    Trx
                                                                </th>
                                                                <th className="pb-2 text-right font-semibold">
                                                                    Penjualan
                                                                </th>
                                                                <th className="pb-2 text-right font-semibold">
                                                                    HPP
                                                                </th>
                                                                <th className="pb-2 text-right font-semibold">
                                                                    Laba Kotor
                                                                </th>
                                                                <th className="pb-2 text-right font-semibold">
                                                                    Beban Kas
                                                                </th>
                                                                <th className="pb-2 text-right font-semibold">
                                                                    Laba Bersih
                                                                </th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="divide-y divide-stone-100 dark:divide-stone-800/60">
                                                            {profitLossData.daily_summary.map(
                                                                (day: any) => (
                                                                    <tr
                                                                        key={
                                                                            day.date
                                                                        }
                                                                        onClick={() => {
                                                                            setPlPeriod(
                                                                                'today',
                                                                            );
                                                                            setPlDate(
                                                                                day.date,
                                                                            );
                                                                        }}
                                                                        className="cursor-pointer transition hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20"
                                                                        title="Klik untuk melihat transaksi satu per satu pada tanggal ini"
                                                                    >
                                                                        <td className="py-2.5 pr-2">
                                                                            <p className="flex items-center gap-1 font-bold text-stone-900 dark:text-stone-100">
                                                                                <span>
                                                                                    {
                                                                                        day.short_date
                                                                                    }
                                                                                </span>
                                                                                <span className="text-[10px] font-normal text-stone-500">
                                                                                    (
                                                                                    {
                                                                                        day.day_name
                                                                                    }
                                                                                    )
                                                                                </span>
                                                                            </p>
                                                                            <p className="text-[10px] font-semibold text-brand-700 dark:text-emerald-400">
                                                                                Lihat
                                                                                detail
                                                                                &rarr;
                                                                            </p>
                                                                        </td>
                                                                        <td className="py-2.5 text-center font-bold text-stone-700 dark:text-stone-300">
                                                                            <div>
                                                                                {
                                                                                    day.total_transactions
                                                                                }{' '}
                                                                                trx
                                                                            </div>
                                                                            <div className="text-[10px] font-normal text-stone-400">
                                                                                {
                                                                                    day.items_sold
                                                                                }{' '}
                                                                                item
                                                                            </div>
                                                                        </td>
                                                                        <td className="py-2.5 text-right font-medium text-stone-800 dark:text-stone-200">
                                                                            {formatRp(
                                                                                day.net_sales,
                                                                            )}
                                                                        </td>
                                                                        <td className="py-2.5 text-right text-stone-500 dark:text-stone-400">
                                                                            {formatRp(
                                                                                day.total_cogs,
                                                                            )}
                                                                        </td>
                                                                        <td className="py-2.5 text-right font-bold text-emerald-600 dark:text-emerald-400">
                                                                            <div>
                                                                                {formatRp(
                                                                                    day.gross_profit,
                                                                                )}
                                                                            </div>
                                                                            <div className="text-[10px] font-medium opacity-80">
                                                                                {
                                                                                    day.margin_pct
                                                                                }
                                                                                %
                                                                            </div>
                                                                        </td>
                                                                        <td className="py-2.5 text-right font-medium text-rose-600 dark:text-rose-400">
                                                                            {day.total_expenses >
                                                                            0
                                                                                ? `- ${formatRp(day.total_expenses)}`
                                                                                : 'Rp 0'}
                                                                        </td>
                                                                        <td className="py-2.5 text-right font-bold">
                                                                            <div
                                                                                className={
                                                                                    day.net_profit >=
                                                                                    0
                                                                                        ? 'text-emerald-600 dark:text-emerald-400'
                                                                                        : 'text-rose-600 dark:text-rose-400'
                                                                                }
                                                                            >
                                                                                {formatRp(
                                                                                    day.net_profit,
                                                                                )}
                                                                            </div>
                                                                            <div className="text-[10px] font-medium text-stone-500 opacity-80">
                                                                                {day.net_margin_pct ??
                                                                                    0}
                                                                                %
                                                                            </div>
                                                                        </td>
                                                                    </tr>
                                                                ),
                                                            )}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            ) : (
                                                <div className="my-auto py-8 text-center text-xs text-stone-400">
                                                    Belum ada transaksi pada
                                                    bulan ini.
                                                </div>
                                            )}
                                        </>
                                    ) : (
                                        /* Mode Harian: Data Transaksi Satu Persatu (HPP + Laba) */
                                        <>
                                            <div className="mb-4 flex items-center justify-between">
                                                <h4 className="flex items-center gap-2 text-sm font-bold text-stone-900 dark:text-white">
                                                    <FileText className="h-4 w-4 text-emerald-600" />
                                                    <span>
                                                        Data Transaksi Pesanan
                                                        (HPP & Laba)
                                                    </span>
                                                </h4>
                                                <span className="text-[11px] text-stone-400">
                                                    {profitLossData.transactions
                                                        ?.length || 0}{' '}
                                                    Transaksi
                                                </span>
                                            </div>

                                            {profitLossData.transactions &&
                                            profitLossData.transactions.length >
                                                0 ? (
                                                <div className="-mx-5 max-h-96 space-y-2 overflow-x-auto overflow-y-auto px-5">
                                                    {profitLossData.transactions.map(
                                                        (trx: any) => {
                                                            const isExpanded =
                                                                expandedPlOrderId ===
                                                                trx.id;
                                                            return (
                                                                <div
                                                                    key={trx.id}
                                                                    className={`rounded-xl border transition ${
                                                                        isExpanded
                                                                            ? 'border-emerald-300 bg-stone-50 dark:border-emerald-700 dark:bg-stone-800/80'
                                                                            : 'border-stone-200/70 bg-stone-50/50 hover:bg-stone-50 dark:border-stone-800 dark:bg-stone-800/30 dark:hover:bg-stone-800/60'
                                                                    }`}
                                                                >
                                                                    <div
                                                                        onClick={() =>
                                                                            setExpandedPlOrderId(
                                                                                isExpanded
                                                                                    ? null
                                                                                    : trx.id,
                                                                            )
                                                                        }
                                                                        className="flex cursor-pointer items-center justify-between p-3 text-xs select-none"
                                                                    >
                                                                        <div className="min-w-0 pr-2">
                                                                            <div className="flex flex-wrap items-center gap-1.5">
                                                                                <span className="font-bold text-stone-900 dark:text-stone-100">
                                                                                    {
                                                                                        trx.order_number
                                                                                    }
                                                                                </span>
                                                                                <span className="text-[11px] font-medium text-stone-500">
                                                                                    ·{' '}
                                                                                    {
                                                                                        trx.created_time
                                                                                    }
                                                                                </span>
                                                                                <span className="py-0.2 rounded bg-stone-200 px-1.5 text-[10px] font-bold text-stone-700 dark:bg-stone-700 dark:text-stone-300">
                                                                                    {
                                                                                        trx.payment_method_label
                                                                                    }
                                                                                </span>
                                                                            </div>
                                                                            <p className="mt-0.5 truncate text-[11px] text-stone-500">
                                                                                {
                                                                                    trx.customer_name
                                                                                }{' '}
                                                                                ·{' '}
                                                                                {
                                                                                    trx.items_count
                                                                                }{' '}
                                                                                item
                                                                            </p>
                                                                        </div>

                                                                        <div className="flex shrink-0 items-center gap-3 text-right">
                                                                            <div>
                                                                                <p className="font-semibold text-stone-900 dark:text-stone-100">
                                                                                    {formatRp(
                                                                                        trx.net_sales,
                                                                                    )}
                                                                                </p>
                                                                                <p className="text-[10px] text-stone-400">
                                                                                    HPP:{' '}
                                                                                    {formatRp(
                                                                                        trx.total_cogs,
                                                                                    )}
                                                                                </p>
                                                                            </div>
                                                                            <div className="min-w-[70px] text-right">
                                                                                <p className="font-bold text-emerald-600 dark:text-emerald-400">
                                                                                    +
                                                                                    {formatRp(
                                                                                        trx.gross_profit,
                                                                                    )}
                                                                                </p>
                                                                                <p className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400">
                                                                                    {
                                                                                        trx.margin_pct
                                                                                    }
                                                                                    %
                                                                                </p>
                                                                            </div>
                                                                            <ChevronDown
                                                                                className={`h-3.5 w-3.5 text-stone-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                                                                            />
                                                                        </div>
                                                                    </div>

                                                                    {/* Expanded Item Breakdown */}
                                                                    {isExpanded &&
                                                                        Array.isArray(trx.items) && (
                                                                            <div className="space-y-1.5 border-t border-stone-200 px-3 pt-1 pb-3 text-[11px] dark:border-stone-700/60">
                                                                                <p className="mb-1 text-[9px] font-bold tracking-wider text-stone-500 uppercase">
                                                                                    Rincian
                                                                                    Item
                                                                                    &
                                                                                    HPP:
                                                                                </p>
                                                                                {trx.items.map(
                                                                                    (
                                                                                        it: any,
                                                                                        iIdx: number,
                                                                                    ) => (
                                                                                        <div
                                                                                            key={
                                                                                                iIdx
                                                                                            }
                                                                                            className="flex items-center justify-between border-b border-stone-100 py-1 last:border-none dark:border-stone-800"
                                                                                        >
                                                                                            <div className="min-w-0 pr-2">
                                                                                                <span className="font-semibold text-stone-800 dark:text-stone-200">
                                                                                                    {
                                                                                                        it.product_name
                                                                                                    }
                                                                                                </span>
                                                                                                <span className="ml-1 text-stone-500">
                                                                                                    (
                                                                                                    {
                                                                                                        it.variant_label
                                                                                                    }
                                                                                                    )
                                                                                                    x
                                                                                                    {
                                                                                                        it.quantity
                                                                                                    }
                                                                                                </span>
                                                                                                {!it.has_hpp && (
                                                                                                    <span className="py-0.2 ml-1 rounded bg-amber-50 px-1 text-[9px] font-bold text-amber-600 dark:bg-amber-950">
                                                                                                        HPP
                                                                                                        0
                                                                                                    </span>
                                                                                                )}
                                                                                            </div>
                                                                                            <div className="shrink-0 text-right">
                                                                                                <span className="text-stone-600 dark:text-stone-400">
                                                                                                    {formatRp(
                                                                                                        it.subtotal,
                                                                                                    )}
                                                                                                </span>
                                                                                                <span className="ml-1.5 text-[10px] text-stone-400">
                                                                                                    (HPP:{' '}
                                                                                                    {formatRp(
                                                                                                        it.total_cost,
                                                                                                    )}
                                                                                                    )
                                                                                                </span>
                                                                                                <span className="ml-1.5 font-bold text-emerald-600">
                                                                                                    +
                                                                                                    {formatRp(
                                                                                                        it.gross_profit,
                                                                                                    )}
                                                                                                </span>
                                                                                            </div>
                                                                                        </div>
                                                                                    ),
                                                                                )}
                                                                            </div>
                                                                        )}
                                                                </div>
                                                            );
                                                        },
                                                    )}
                                                </div>
                                            ) : (
                                                <div className="my-auto py-8 text-center text-xs text-stone-400">
                                                    Belum ada transaksi pada
                                                    tanggal ini.
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>

                                {/* Beban Operasional Kasir (Cash Flow Out) */}
                                <div className="flex flex-col rounded-2xl border border-stone-200 bg-white p-5 shadow-xs dark:border-stone-800 dark:bg-stone-900">
                                    {(() => {
                                        const rawExpenses =
                                            profitLossData.expenses ||
                                            (profitLossData.expense_breakdown
                                                ? profitLossData.expense_breakdown.flatMap(
                                                      (cat: any) =>
                                                          cat.records || [],
                                                  )
                                                : []);
                                        const filteredExpenses =
                                            selectedPlExpenseCategory === 'all'
                                                ? rawExpenses
                                                : rawExpenses.filter(
                                                      (e: any) =>
                                                          e.category ===
                                                          selectedPlExpenseCategory,
                                                  );
                                        const filteredTotal =
                                            filteredExpenses.reduce(
                                                (sum: number, e: any) =>
                                                    sum +
                                                    (Number(e.amount) || 0),
                                                0,
                                            );

                                        return (
                                            <>
                                                <div className="mb-4 flex items-center justify-between">
                                                    <h4 className="flex items-center gap-2 text-sm font-bold text-stone-900 dark:text-white">
                                                        <Wallet className="h-4 w-4 text-rose-600" />
                                                        <span>
                                                            Rincian Beban Kas
                                                            Keluar
                                                        </span>
                                                    </h4>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-[11px] text-stone-400">
                                                            {rawExpenses.length}{' '}
                                                            Pengeluaran
                                                        </span>
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                navigateToTab(
                                                                    'cash_flow',
                                                                )
                                                            }
                                                            className="ml-1 cursor-pointer text-[11px] font-bold text-brand-700 hover:underline dark:text-emerald-400"
                                                        >
                                                            Kelola Kasir &rarr;
                                                        </button>
                                                    </div>
                                                </div>

                                                {rawExpenses.length > 0 ? (
                                                    <div className="flex flex-1 flex-col">
                                                        {/* Category Filter Chips (if more than 1 category) */}
                                                        {profitLossData.expense_breakdown &&
                                                            profitLossData
                                                                .expense_breakdown
                                                                .length > 1 && (
                                                                <div className="mb-3 flex scrollbar-none items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                                                                    <button
                                                                        type="button"
                                                                        onClick={() =>
                                                                            setSelectedPlExpenseCategory(
                                                                                'all',
                                                                            )
                                                                        }
                                                                        className={`shrink-0 cursor-pointer rounded-lg px-2.5 py-1 font-semibold transition ${
                                                                            selectedPlExpenseCategory ===
                                                                            'all'
                                                                                ? 'border border-rose-300 bg-rose-100 text-rose-700 dark:border-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                                                                                : 'border border-transparent bg-stone-100 text-stone-600 hover:bg-stone-200/70 dark:bg-stone-800 dark:text-stone-400'
                                                                        }`}
                                                                    >
                                                                        Semua (
                                                                        {
                                                                            rawExpenses.length
                                                                        }
                                                                        )
                                                                    </button>
                                                                    {profitLossData.expense_breakdown.map(
                                                                        (
                                                                            cat: any,
                                                                        ) => (
                                                                            <button
                                                                                key={
                                                                                    cat.category
                                                                                }
                                                                                type="button"
                                                                                onClick={() =>
                                                                                    setSelectedPlExpenseCategory(
                                                                                        cat.category ===
                                                                                            selectedPlExpenseCategory
                                                                                            ? 'all'
                                                                                            : cat.category,
                                                                                    )
                                                                                }
                                                                                className={`shrink-0 cursor-pointer rounded-lg px-2.5 py-1 font-semibold transition ${
                                                                                    selectedPlExpenseCategory ===
                                                                                    cat.category
                                                                                        ? 'border border-rose-300 bg-rose-100 text-rose-700 dark:border-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                                                                                        : 'border border-transparent bg-stone-100 text-stone-600 hover:bg-stone-200/70 dark:bg-stone-800 dark:text-stone-400'
                                                                                }`}
                                                                            >
                                                                                {
                                                                                    cat.label
                                                                                }{' '}
                                                                                (
                                                                                {
                                                                                    cat.count
                                                                                }
                                                                                )
                                                                                ·{' '}
                                                                                {formatRp(
                                                                                    cat.total,
                                                                                )}
                                                                            </button>
                                                                        ),
                                                                    )}
                                                                </div>
                                                            )}

                                                        {/* Itemized Expenses List */}
                                                        <div className="-mx-5 max-h-96 flex-1 space-y-2 overflow-x-auto overflow-y-auto px-5">
                                                            {filteredExpenses.map(
                                                                (exp: any) => (
                                                                    <div
                                                                        key={
                                                                            exp.id
                                                                        }
                                                                        className="flex items-start justify-between gap-3 rounded-xl border border-stone-200/70 bg-stone-50/70 p-3 text-xs transition hover:bg-stone-50 dark:border-stone-800 dark:bg-stone-800/40 dark:hover:bg-stone-800/60"
                                                                    >
                                                                        <div className="flex min-w-0 items-start gap-2.5">
                                                                            <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400">
                                                                                <ArrowUpRight className="h-4 w-4" />
                                                                            </div>
                                                                            <div className="min-w-0">
                                                                                <p className="text-xs font-bold break-words text-stone-900 dark:text-stone-100">
                                                                                    {exp.description ||
                                                                                        'Pengeluaran Kas'}
                                                                                </p>
                                                                                <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[11px] text-stone-500">
                                                                                    <span className="py-0.2 rounded bg-stone-200 px-1.5 text-[10px] font-semibold text-stone-700 dark:bg-stone-700 dark:text-stone-300">
                                                                                        {exp.category_label ||
                                                                                            (exp.category
                                                                                                ? exp.category.replace(
                                                                                                      '_',
                                                                                                      ' ',
                                                                                                  )
                                                                                                : 'Pengeluaran')}
                                                                                    </span>
                                                                                    <span>
                                                                                        ·
                                                                                    </span>
                                                                                    <span>
                                                                                        {profitLossData.is_monthly
                                                                                            ? exp.date_time ||
                                                                                              exp.date
                                                                                            : `${exp.time || ''} (${exp.date || ''})`}
                                                                                    </span>
                                                                                    {exp.user_name && (
                                                                                        <>
                                                                                            <span>
                                                                                                ·
                                                                                            </span>
                                                                                            <span>
                                                                                                {
                                                                                                    exp.user_name
                                                                                                }
                                                                                            </span>
                                                                                        </>
                                                                                    )}
                                                                                </div>
                                                                            </div>
                                                                        </div>

                                                                        <div className="shrink-0 text-right">
                                                                            <p className="text-sm font-bold text-rose-600 dark:text-rose-400">
                                                                                -{' '}
                                                                                {formatRp(
                                                                                    exp.amount,
                                                                                )}
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                ),
                                                            )}
                                                        </div>

                                                        {/* Summary Total */}
                                                        <div className="mt-3 flex items-center justify-between border-t border-stone-100 pt-3 text-xs font-bold dark:border-stone-800">
                                                            <span className="text-stone-600 dark:text-stone-300">
                                                                Total Beban
                                                                Kasir{' '}
                                                                {selectedPlExpenseCategory !==
                                                                'all'
                                                                    ? `(${filteredExpenses.length} item)`
                                                                    : ''}
                                                            </span>
                                                            <span className="text-sm text-rose-600 dark:text-rose-400">
                                                                -{' '}
                                                                {formatRp(
                                                                    selectedPlExpenseCategory ===
                                                                        'all'
                                                                        ? profitLossData
                                                                              .summary
                                                                              .total_expenses
                                                                        : filteredTotal,
                                                                )}
                                                            </span>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="my-auto py-8 text-center text-xs text-stone-400">
                                                        Tidak ada catatan kas
                                                        keluar pada periode ini.
                                                    </div>
                                                )}
                                            </>
                                        );
                                    })()}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="rounded-2xl border border-stone-200 bg-white p-8 text-center dark:border-stone-800 dark:bg-stone-900">
                            <AlertCircle className="mx-auto mb-2 h-8 w-8 text-stone-400 dark:text-stone-400" />
                            <p className="font-bold text-stone-700 dark:text-stone-200">
                                Tidak ada data laba rugi yang dapat dimuat
                            </p>
                            <p className="mt-1 text-xs text-stone-500 dark:text-stone-300">
                                Silakan coba ganti filter tanggal atau muat
                                ulang.
                            </p>
                            <button
                                type="button"
                                onClick={() =>
                                    fetchProfitLossReport(
                                        plPeriod,
                                        plDate,
                                        plMonth,
                                    )
                                }
                                className="mt-4 cursor-pointer rounded-xl bg-emerald-700 px-4 py-2 text-xs font-bold text-white transition hover:bg-emerald-800"
                            >
                                Muat Ulang Laba Rugi
                            </button>
                        </div>
                    )}
                </div>
    );
};
