import React from 'react';
import {
    Calendar,
    RefreshCw,
    Wallet,
    ArrowUpRight,
    ArrowDownLeft,
    Trash2,
} from 'lucide-react';
import { CashDrawerState, PosCashFlowItem } from '@/types/pos';

interface CashFlowTabProps {
    isActive: boolean;
    cashFlowPeriod: 'daily' | 'this_month' | 'custom_month';
    setCashFlowPeriod: (period: 'daily' | 'this_month' | 'custom_month') => void;
    cashFlowDate: string;
    setCashFlowDate: (date: string) => void;
    cashFlowMonth: string;
    setCashFlowMonth: (month: string) => void;
    getLocalDateString: () => string;
    cashDrawer: CashDrawerState;
    isLoadingCashFlow: boolean;
    flowType: 'in' | 'out';
    setFlowType: (type: 'in' | 'out') => void;
    flowCategory: string;
    setFlowCategory: (cat: string) => void;
    flowAmount: number | '';
    setFlowAmount: (amount: number | '') => void;
    flowTransactionDate: string;
    setFlowTransactionDate: (date: string) => void;
    flowDescription: string;
    setFlowDescription: (desc: string) => void;
    isSavingCashFlow: boolean;
    handleAddCashFlow: (e: React.FormEvent) => void;
    cashFlowsList: PosCashFlowItem[];
    handleDeleteCashFlow: (id: number) => void;
    formatRp: (val: number) => string;
    isOwner?: boolean;
}

export const CashFlowTab: React.FC<CashFlowTabProps> = ({
    isActive,
    cashFlowPeriod,
    setCashFlowPeriod,
    cashFlowDate,
    setCashFlowDate,
    cashFlowMonth,
    setCashFlowMonth,
    getLocalDateString,
    cashDrawer,
    isLoadingCashFlow,
    flowType,
    setFlowType,
    flowCategory,
    setFlowCategory,
    flowAmount,
    setFlowAmount,
    flowTransactionDate,
    setFlowTransactionDate,
    flowDescription,
    setFlowDescription,
    isSavingCashFlow,
    handleAddCashFlow,
    cashFlowsList,
    handleDeleteCashFlow,
    formatRp,
    isOwner = false,
}) => {
    if (!isActive) return null;

    return (
<div className="mx-auto w-full max-w-5xl flex-1 space-y-6 overflow-y-auto bg-[#f4f6f6] p-4 sm:p-6 dark:bg-stone-950">
                    {/* Header */}
                    <div className="flex flex-col justify-between gap-4 border-b border-stone-200 pb-4 sm:flex-row sm:items-center dark:border-stone-800">
                        <div>
                            <h2 className="flex items-center gap-2 text-lg font-bold text-brand-950 dark:text-white">
                                <Wallet className="h-5 w-5 text-brand-700 dark:text-emerald-400" />
                                <span>
                                    Arus Kas Laci Kasir (Kas Masuk - Keluar)
                                </span>
                            </h2>
                            <p className="mt-0.5 text-xs text-stone-500 dark:text-stone-300">
                                Pencatatan modal awal kasir, kas masuk, dan
                                pengeluaran operasional toko
                            </p>
                        </div>

                        {/* Filter Controls (Harian, Bulan Ini, Custom Bulan) */}
                        <div className="flex max-w-full flex-wrap items-center gap-2">
                            <div className="flex max-w-full scrollbar-none items-center overflow-x-auto rounded-xl border border-stone-200 bg-white p-1 text-xs font-semibold shadow-2xs dark:border-stone-800 dark:bg-stone-900">
                                <button
                                    type="button"
                                    onClick={() => setCashFlowPeriod('daily')}
                                    className={`shrink-0 cursor-pointer rounded-lg px-3 py-1.5 font-bold whitespace-nowrap transition ${
                                        cashFlowPeriod === 'daily'
                                            ? 'bg-brand-700 text-white shadow-xs'
                                            : 'text-stone-600 hover:text-brand-950 dark:text-stone-300 dark:hover:text-white'
                                    }`}
                                >
                                    Harian / Tanggal
                                </button>
                                <button
                                    type="button"
                                    onClick={() =>
                                        setCashFlowPeriod('this_month')
                                    }
                                    className={`shrink-0 cursor-pointer rounded-lg px-3 py-1.5 font-bold whitespace-nowrap transition ${
                                        cashFlowPeriod === 'this_month'
                                            ? 'bg-brand-700 text-white shadow-xs'
                                            : 'text-stone-600 hover:text-brand-950 dark:text-stone-300 dark:hover:text-white'
                                    }`}
                                >
                                    Bulan Ini
                                </button>
                                <button
                                    type="button"
                                    onClick={() =>
                                        setCashFlowPeriod('custom_month')
                                    }
                                    className={`shrink-0 cursor-pointer rounded-lg px-3 py-1.5 font-bold whitespace-nowrap transition ${
                                        cashFlowPeriod === 'custom_month'
                                            ? 'bg-brand-700 text-white shadow-xs'
                                            : 'text-stone-600 hover:text-brand-950 dark:text-stone-300 dark:hover:text-white'
                                    }`}
                                >
                                    Custom Bulan
                                </button>
                            </div>

                            {/* Date Picker if daily */}
                            {cashFlowPeriod === 'daily' && (
                                <div className="flex items-center gap-1.5 text-xs">
                                    <input
                                        type="date"
                                        value={cashFlowDate}
                                        onChange={(e) => {
                                            setCashFlowDate(e.target.value);
                                            setFlowTransactionDate(
                                                e.target.value,
                                            );
                                        }}
                                        className="rounded-xl border border-stone-200 bg-white px-3 py-1.5 font-medium text-stone-900 shadow-2xs outline-none focus:border-brand-600 dark:border-stone-700 dark:bg-stone-800 dark:text-white"
                                    />
                                    {cashFlowDate !== getLocalDateString() && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const today =
                                                    getLocalDateString();
                                                setCashFlowDate(today);
                                                setFlowTransactionDate(today);
                                            }}
                                            className="cursor-pointer rounded-xl border border-stone-200 bg-stone-100 px-2 py-1.5 text-[11px] font-bold text-stone-600 hover:bg-stone-200 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-300"
                                            title="Tampilkan catatan kas hari ini"
                                        >
                                            Hari Ini
                                        </button>
                                    )}
                                </div>
                            )}

                            {/* Month Picker if custom_month */}
                            {cashFlowPeriod === 'custom_month' && (
                                <div className="flex items-center gap-1.5 text-xs">
                                    <input
                                        type="month"
                                        value={cashFlowMonth}
                                        onChange={(e) =>
                                            setCashFlowMonth(e.target.value)
                                        }
                                        className="rounded-xl border border-stone-200 bg-white px-3 py-1.5 font-medium text-stone-900 shadow-2xs outline-none focus:border-brand-600 dark:border-stone-700 dark:bg-stone-800 dark:text-white"
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Period Banner Info */}
                    {cashDrawer.period_title && (
                        <div className="flex items-center justify-between px-1 text-xs text-stone-600 dark:text-stone-400">
                            <span className="flex items-center gap-1.5 font-semibold text-stone-800 dark:text-stone-200">
                                <Calendar className="h-3.5 w-3.5 text-brand-700 dark:text-emerald-400" />
                                <span>
                                    Periode Arus Kas:{' '}
                                    <strong>{cashDrawer.period_title}</strong>
                                </span>
                            </span>
                            {isLoadingCashFlow && (
                                <span className="flex items-center gap-1 text-[11px] font-semibold text-brand-700 dark:text-emerald-400">
                                    <RefreshCw className="h-3 w-3 animate-spin" />
                                    <span>Memperbarui...</span>
                                </span>
                            )}
                        </div>
                    )}

                    {/* Cash Drawer Summary Cards */}
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                        <div className="rounded-2xl border border-stone-200 bg-white p-3.5 shadow-xs dark:border-stone-800 dark:bg-stone-900">
                            <span className="text-[11px] font-medium text-stone-500 dark:text-stone-300">
                                Penjualan Tunai
                            </span>
                            <div className="mt-1 text-lg font-bold text-stone-900 sm:text-xl dark:text-white">
                                Rp {formatRp(cashDrawer.cash_sales)}
                            </div>
                        </div>

                        <div className="rounded-2xl border border-emerald-100 bg-white p-3.5 shadow-xs dark:border-emerald-900/60 dark:bg-stone-900">
                            <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
                                <ArrowDownLeft className="h-3.5 w-3.5" />
                                <span>Kas Masuk Lain (+)</span>
                            </span>
                            <div className="mt-1 text-lg font-bold text-emerald-600 sm:text-xl dark:text-emerald-400">
                                Rp {formatRp(cashDrawer.total_in)}
                            </div>
                        </div>

                        <div className="rounded-2xl border border-rose-100 bg-white p-3.5 shadow-xs dark:border-rose-900/60 dark:bg-stone-900">
                            <span className="flex items-center gap-1 text-[11px] font-semibold text-rose-700 dark:text-rose-400">
                                <ArrowUpRight className="h-3.5 w-3.5" />
                                <span>Kas Keluar Toko (-)</span>
                            </span>
                            <div className="mt-1 text-lg font-bold text-rose-600 sm:text-xl dark:text-rose-400">
                                Rp {formatRp(cashDrawer.total_out)}
                            </div>
                        </div>

                        <div className="rounded-2xl border border-brand-200 bg-brand-50 p-3.5 shadow-xs dark:border-stone-700 dark:bg-stone-900">
                            <span className="text-[11px] font-bold text-brand-800 dark:text-amber-300">
                                TOTAL SALDO LACI
                            </span>
                            <div className="mt-1 text-lg font-black text-brand-950 sm:text-xl dark:text-white">
                                Rp {formatRp(cashDrawer.net_cash)}
                            </div>
                        </div>
                    </div>

                    {/* Two Column: Form Input & List */}
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                        {/* Form Input Kas Baru */}
                        <div className="space-y-4 rounded-2xl border border-stone-200 bg-white p-5 shadow-xs dark:border-stone-800 dark:bg-stone-900">
                            <h3 className="text-sm font-bold text-brand-950 dark:text-white">
                                Catat Arus Kas Baru
                            </h3>
                            <form
                                onSubmit={handleAddCashFlow}
                                className="space-y-3.5 text-xs"
                            >
                                <div>
                                    <label className="text-[11px] font-medium text-stone-500 dark:text-stone-300">
                                        Jenis Arus Kas:
                                    </label>
                                    <div className="mt-1 grid grid-cols-2 gap-2">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setFlowType('in');
                                                if (
                                                    flowCategory !==
                                                        'modal_awal' &&
                                                    flowCategory !==
                                                        'pendapatan_lain'
                                                ) {
                                                    setFlowCategory(
                                                        'modal_awal',
                                                    );
                                                }
                                            }}
                                            className={`flex cursor-pointer items-center justify-center gap-1.5 rounded-xl border p-2.5 font-bold transition ${
                                                flowType === 'in'
                                                    ? 'border-emerald-600 bg-emerald-600 text-white shadow-xs'
                                                    : 'border-stone-200 bg-stone-50 text-stone-600 hover:bg-stone-100 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-300 dark:hover:bg-stone-700'
                                            }`}
                                        >
                                            <ArrowDownLeft className="h-3.5 w-3.5" />
                                            <span>Kas Masuk</span>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setFlowType('out');
                                                if (
                                                    flowCategory ===
                                                        'modal_awal' ||
                                                    flowCategory ===
                                                        'pendapatan_lain'
                                                ) {
                                                    setFlowCategory(
                                                        'operasional',
                                                    );
                                                }
                                            }}
                                            className={`flex cursor-pointer items-center justify-center gap-1.5 rounded-xl border p-2.5 font-bold transition ${
                                                flowType === 'out'
                                                    ? 'border-rose-600 bg-rose-600 text-white shadow-xs'
                                                    : 'border-stone-200 bg-stone-50 text-stone-600 hover:bg-stone-100 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-300 dark:hover:bg-stone-700'
                                            }`}
                                        >
                                            <ArrowUpRight className="h-3.5 w-3.5" />
                                            <span>Kas Keluar</span>
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-[11px] font-medium text-stone-500 dark:text-stone-300">
                                        Kategori:
                                    </label>
                                    <select
                                        value={flowCategory}
                                        onChange={(e) =>
                                            setFlowCategory(e.target.value)
                                        }
                                        className="mt-1 w-full rounded-xl border border-stone-200 bg-stone-50 p-2.5 text-stone-900 outline-none focus:border-brand-600 focus:bg-white dark:border-stone-700 dark:bg-stone-800 dark:text-white dark:focus:bg-stone-700"
                                    >
                                        {flowType === 'in' ? (
                                            <>
                                                <option value="modal_awal">
                                                    Modal Awal Kasir
                                                </option>
                                                <option value="pendapatan_lain">
                                                    Pemasukan Lain-lain
                                                </option>
                                            </>
                                        ) : (
                                            <>
                                                <option value="operasional">
                                                    Operasional Toko (Es Batu,
                                                    Gas, dll)
                                                </option>
                                                <option value="bahan_baku">
                                                    Bahan Baku & Kemasan
                                                </option>
                                                <option value="kebersihan">
                                                    Kebersihan & Perlengkapan
                                                </option>
                                                <option value="transport">
                                                    Transport / Kurir
                                                </option>
                                                <option value="gaji">
                                                    Upah & Gaji Kasir/Barista
                                                </option>
                                                <option value="lainnya">
                                                    Pengeluaran Lainnya
                                                </option>
                                            </>
                                        )}
                                    </select>
                                </div>

                                <div>
                                    <div className="flex items-center justify-between">
                                        <label className="text-[11px] font-medium text-stone-500 dark:text-stone-300">
                                            Nominal (Rp):
                                        </label>
                                        {flowAmount !== '' && (
                                            <span className="text-[11px] font-bold text-brand-700 dark:text-emerald-400">
                                                Rp{' '}
                                                {formatRp(
                                                    Number(flowAmount) || 0,
                                                )}
                                            </span>
                                        )}
                                    </div>
                                    <input
                                        type="number"
                                        value={
                                            flowAmount === '' ? '' : flowAmount
                                        }
                                        onChange={(e) =>
                                            setFlowAmount(
                                                e.target.value === ''
                                                    ? ''
                                                    : parseFloat(
                                                          e.target.value,
                                                      ),
                                            )
                                        }
                                        placeholder="Contoh: 50000"
                                        className="mt-1 w-full rounded-xl border border-stone-200 bg-stone-50 p-2.5 text-sm font-bold text-stone-900 outline-none focus:border-brand-600 focus:bg-white dark:border-stone-700 dark:bg-stone-800 dark:text-white dark:focus:bg-stone-700"
                                        required
                                    />
                                    {/* Quick Preset Nominal Buttons */}
                                    <div className="mt-2 flex flex-wrap gap-1.5">
                                        {[
                                            10000, 20000, 50000, 100000, 125000,
                                            200000, 500000,
                                        ].map((preset) => (
                                            <button
                                                key={preset}
                                                type="button"
                                                onClick={() =>
                                                    setFlowAmount(preset)
                                                }
                                                className={`cursor-pointer rounded-lg border px-2 py-1 text-[10px] font-semibold transition ${
                                                    flowAmount === preset
                                                        ? 'border-brand-700 bg-brand-700 text-white'
                                                        : 'border-stone-200 bg-stone-50 text-stone-600 hover:border-brand-400 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-300'
                                                }`}
                                            >
                                                {formatRp(preset)}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="text-[11px] font-medium text-stone-500 dark:text-stone-300">
                                        Tanggal Transaksi:
                                    </label>
                                    <input
                                        type="date"
                                        value={flowTransactionDate}
                                        onChange={(e) =>
                                            setFlowTransactionDate(
                                                e.target.value,
                                            )
                                        }
                                        className="mt-1 w-full rounded-xl border border-stone-200 bg-stone-50 p-2 text-xs font-medium text-stone-900 outline-none focus:border-brand-600 focus:bg-white dark:border-stone-700 dark:bg-stone-800 dark:text-white dark:focus:bg-stone-700"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="text-[11px] font-medium text-stone-500 dark:text-stone-300">
                                        Keterangan / Keperluan:
                                    </label>
                                    <textarea
                                        rows={2}
                                        value={flowDescription}
                                        onChange={(e) =>
                                            setFlowDescription(e.target.value)
                                        }
                                        placeholder="Contoh: Beli es batu kristal 2 kantong"
                                        className="mt-1 w-full resize-none rounded-xl border border-stone-200 bg-stone-50 p-2.5 text-stone-900 outline-none focus:border-brand-600 focus:bg-white dark:border-stone-700 dark:bg-stone-800 dark:text-white dark:focus:bg-stone-700"
                                        required
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={isSavingCashFlow}
                                    className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-brand-700 py-2.5 font-bold text-white shadow-sm transition hover:bg-brand-800 active:scale-95 disabled:opacity-50"
                                >
                                    {isSavingCashFlow ? (
                                        <>
                                            <RefreshCw className="h-4 w-4 animate-spin" />
                                            <span>
                                                Menyimpan Catatan Kas...
                                            </span>
                                        </>
                                    ) : (
                                        <span>+ Simpan Catatan Kas</span>
                                    )}
                                </button>
                            </form>
                        </div>

                        {/* List Arus Kas */}
                        <div className="space-y-3 rounded-2xl border border-stone-200 bg-white p-5 shadow-xs lg:col-span-2 dark:border-stone-800 dark:bg-stone-900">
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm font-bold text-brand-950 dark:text-white">
                                    Riwayat Arus Kas ({cashFlowsList.length}{' '}
                                    Catatan)
                                </h3>
                                {cashDrawer.period_title && (
                                    <span className="text-[11px] font-semibold text-stone-500 dark:text-stone-400">
                                        {cashDrawer.period_title}
                                    </span>
                                )}
                            </div>

                            {isLoadingCashFlow ? (
                                <p className="py-6 text-center text-xs text-stone-400">
                                    Memuat catatan...
                                </p>
                            ) : cashFlowsList.length === 0 ? (
                                <div className="py-8 text-center text-xs text-stone-500 dark:text-stone-400">
                                    <Wallet className="mx-auto mb-2 h-8 w-8 text-stone-400 dark:text-stone-500" />
                                    <span>
                                        Belum ada catatan kas masuk/keluar untuk
                                        periode ini
                                    </span>
                                </div>
                            ) : (
                                <div className="max-h-96 space-y-2 overflow-y-auto">
                                    {cashFlowsList.map((f) => (
                                        <div
                                            key={f.id}
                                            className="flex items-center justify-between rounded-xl border border-stone-200/80 bg-stone-50 p-3 text-xs dark:border-stone-700 dark:bg-stone-800"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${
                                                        f.type === 'in'
                                                            ? 'bg-emerald-100 text-emerald-700'
                                                            : 'bg-rose-100 text-rose-700'
                                                    }`}
                                                >
                                                    {f.type === 'in' ? (
                                                        <ArrowDownLeft className="h-4 w-4" />
                                                    ) : (
                                                        <ArrowUpRight className="h-4 w-4" />
                                                    )}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-stone-900 dark:text-white">
                                                        {f.description}
                                                    </div>
                                                    <div className="text-[10px] text-stone-500 dark:text-stone-300">
                                                        {f.category_label} · Jam{' '}
                                                        {f.recorded_at} · Oleh{' '}
                                                        {f.user_name}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3">
                                                <span
                                                    className={`text-sm font-black ${
                                                        f.type === 'in'
                                                            ? 'text-emerald-700 dark:text-emerald-400'
                                                            : 'text-rose-700 dark:text-rose-400'
                                                    }`}
                                                >
                                                    {f.type === 'in'
                                                        ? '+'
                                                        : '-'}
                                                    Rp {formatRp(f.amount)}
                                                </span>
                                                {isOwner && (
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            handleDeleteCashFlow(
                                                                f.id,
                                                            )
                                                        }
                                                        className="cursor-pointer rounded-lg p-1.5 text-stone-400 transition hover:text-rose-600 dark:text-stone-400 dark:hover:text-rose-400"
                                                        title="Hapus catatan (Khusus Owner)"
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
    );
};
