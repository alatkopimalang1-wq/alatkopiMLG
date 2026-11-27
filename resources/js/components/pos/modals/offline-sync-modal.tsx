import React from 'react';
import { Cloud, X, RefreshCw, Database, Download, Upload, Wifi, CheckCircle2 } from 'lucide-react';
import { Product, Category } from '@/types/pos';

interface OfflineSyncModalProps {
    isOpen: boolean;
    onClose: () => void;
    isOnline: boolean;
    manualOffline: boolean;
    toggleManualOffline: (val: boolean) => void;
    isEffectiveOffline: boolean;
    syncStatusMessage: string | null;
    isSyncing: boolean;
    products: Product[];
    categories: Category[];
    lastCatalogSync: string | null;
    isDownloadingCatalog: boolean;
    pullLatestCatalogData: (asFile: boolean) => void;
    offlineOrders: Array<{
        offline_id: string;
        customer_name?: string;
        payment_method: string;
        created_at: string;
        total_amount: number;
    }>;
    syncOfflineOrdersToServer: (notify: boolean) => void;
    exportOfflineOrdersToFile: () => void;
    handleImportOrdersFile: (e: React.ChangeEvent<HTMLInputElement>) => void;
    formatRp: (val: number) => string;
}

export const OfflineSyncModal: React.FC<OfflineSyncModalProps> = ({
    isOpen,
    onClose,
    isOnline,
    manualOffline,
    toggleManualOffline,
    isEffectiveOffline,
    syncStatusMessage,
    isSyncing,
    products,
    categories,
    lastCatalogSync,
    isDownloadingCatalog,
    pullLatestCatalogData,
    offlineOrders,
    syncOfflineOrdersToServer,
    exportOfflineOrdersToFile,
    handleImportOrdersFile,
    formatRp,
}) => {
    if (!isOpen) return null;

    return (
        <div className="pos-modal-overlay fixed inset-0 z-50 flex animate-in items-center justify-center bg-black/60 p-3 duration-150 fade-in sm:p-4">
            <div className="pos-gpu-layer flex max-h-[90vh] w-full max-w-2xl animate-in flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-2xl duration-150 zoom-in-95 dark:border-stone-800 dark:bg-stone-900">
                {/* Modal Header */}
                <div className="flex shrink-0 items-center justify-between border-b border-stone-200 bg-stone-50/60 p-4 sm:p-5 dark:border-stone-800 dark:bg-stone-900/60">
                    <div className="flex items-center gap-3">
                        <div className="rounded-xl bg-brand-900/10 p-2.5 text-brand-900 dark:bg-emerald-500/10 dark:text-emerald-400">
                            <Cloud className="h-5 w-5" />
                        </div>
                        <div>
                            <h3 className="flex items-center gap-2 text-base font-bold text-stone-900 dark:text-white">
                                <span>Mode Offline & Sinkronisasi Data</span>
                            </h3>
                            <p className="text-xs text-stone-500 dark:text-stone-400">
                                Operasional kasir tanpa internet, tarik data database & unggah transaksi
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="cursor-pointer rounded-xl p-2 text-stone-400 transition hover:bg-stone-100 hover:text-stone-600 dark:hover:bg-stone-800 dark:hover:text-stone-200"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Modal Body (Scrollable) */}
                <div className="flex-1 space-y-4 overflow-y-auto p-4 sm:p-5">
                    {/* Status Koneksi & Saklar Manual Offline */}
                    <div className="flex flex-col justify-between gap-3 rounded-xl border border-stone-200 bg-stone-50/80 p-4 sm:flex-row sm:items-center dark:border-stone-800 dark:bg-stone-800/40">
                        <div>
                            <div className="flex items-center gap-2">
                                <span
                                    className={`h-3 w-3 rounded-full ${
                                        !isOnline
                                            ? 'animate-ping bg-rose-500'
                                            : manualOffline
                                              ? 'bg-amber-500'
                                              : 'bg-emerald-500'
                                    }`}
                                />
                                <span className="text-sm font-bold text-stone-900 dark:text-white">
                                    {!isOnline
                                        ? 'Internet Terputus (Offline)'
                                        : manualOffline
                                          ? 'Mode Offline Manual Aktif'
                                          : 'Terhubung ke Database (Online)'}
                                </span>
                            </div>
                            <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">
                                {isEffectiveOffline
                                    ? 'Transaksi akan disimpan di memori kasir lokal dan otomatis disinkronkan saat online.'
                                    : 'Semua transaksi dan data otomatis terupdate langsung ke database server.'}
                            </p>
                        </div>
                        <div className="flex shrink-0 items-center gap-2">
                            <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs font-semibold text-stone-700 shadow-2xs dark:border-stone-700 dark:bg-stone-800 dark:text-stone-300">
                                <input
                                    type="checkbox"
                                    checked={manualOffline}
                                    onChange={(e) => toggleManualOffline(e.target.checked)}
                                    className="h-4 w-4 cursor-pointer rounded text-brand-900 focus:ring-brand-800"
                                />
                                <span>Paksa Mode Offline</span>
                            </label>
                        </div>
                    </div>

                    {/* Status Message / Notification */}
                    {syncStatusMessage && (
                        <div className="flex items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 p-3 text-xs text-blue-800 dark:border-blue-800/60 dark:bg-blue-950/40 dark:text-blue-300">
                            <RefreshCw className={`h-4 w-4 shrink-0 ${isSyncing ? 'animate-spin' : ''}`} />
                            <span>{syncStatusMessage}</span>
                        </div>
                    )}

                    {/* 2 Main Action Cards: Download (Tarik Data) & Upload (Import Penjualan) */}
                    <div className="grid grid-cols-1 gap-3.5 md:grid-cols-2">
                        {/* CARD 1: TARIK DATA (DOWNLOAD DATABASE) */}
                        <div className="flex flex-col justify-between space-y-3 rounded-xl border border-stone-200 bg-white p-4 shadow-2xs dark:border-stone-800 dark:bg-stone-900">
                            <div>
                                <div className="flex items-center gap-2 text-sm font-bold text-stone-900 dark:text-white">
                                    <Database className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                                    <span>Tarik Data Katalog (Download)</span>
                                </div>
                                <p className="mt-1.5 text-xs leading-relaxed text-stone-500 dark:text-stone-400">
                                    Unduh katalog produk, harga varian, dan kategori terbaru dari database
                                    pusat ke memori kasir agar dapat dipakai jualan saat offline.
                                </p>
                                <div className="mt-2 text-[11px] text-stone-400 dark:text-stone-500">
                                    Tersimpan:{' '}
                                    <strong className="text-stone-700 dark:text-stone-300">
                                        {products.length} produk
                                    </strong>{' '}
                                    ({categories.length} kategori)
                                    {lastCatalogSync && (
                                        <span className="mt-0.5 block truncate">
                                            Terakhir: {new Date(lastCatalogSync).toLocaleString('id-ID')}
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="flex flex-col gap-2 border-t border-stone-100 pt-2 dark:border-stone-800">
                                <button
                                    type="button"
                                    disabled={isDownloadingCatalog || isSyncing}
                                    onClick={() => pullLatestCatalogData(false)}
                                    className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-brand-900 px-3 py-2.5 text-xs font-bold text-white shadow-xs transition hover:bg-brand-950 active:scale-95 disabled:opacity-50 dark:bg-emerald-600 dark:hover:bg-emerald-500"
                                >
                                    <RefreshCw className={`h-3.5 w-3.5 ${isDownloadingCatalog ? 'animate-spin' : ''}`} />
                                    <span>
                                        {isDownloadingCatalog ? 'Menarik Data...' : 'Tarik Data dari Database'}
                                    </span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => pullLatestCatalogData(true)}
                                    className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-stone-100 px-3 py-2 text-xs font-semibold text-stone-700 transition hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-200 dark:hover:bg-stone-700"
                                >
                                    <Download className="h-3.5 w-3.5" />
                                    <span>Unduh File Backup Katalog (JSON)</span>
                                </button>
                            </div>
                        </div>

                        {/* CARD 2: UPLOAD DATA PENJUALAN (IMPORT KE DATABASE) */}
                        <div className="flex flex-col justify-between space-y-3 rounded-xl border border-stone-200 bg-white p-4 shadow-2xs dark:border-stone-800 dark:bg-stone-900">
                            <div>
                                <div className="flex items-center gap-2 text-sm font-bold text-stone-900 dark:text-white">
                                    <Upload className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                                    <span>Upload Data Penjualan (Import)</span>
                                </div>
                                <p className="mt-1.5 text-xs leading-relaxed text-stone-500 dark:text-stone-400">
                                    Kirim transaksi kasir offline ke database pusat agar laporan
                                    penjualan dan keuangan sinkron, atau impor file data penjualan offline.
                                </p>
                                <div className="mt-2 text-[11px] text-stone-400 dark:text-stone-500">
                                    Transaksi offline tersimpan:{' '}
                                    <strong className="font-bold text-amber-600 dark:text-amber-400">
                                        {offlineOrders.length} transaksi
                                    </strong>
                                </div>
                            </div>

                            <div className="flex flex-col gap-2 border-t border-stone-100 pt-2 dark:border-stone-800">
                                <button
                                    type="button"
                                    disabled={offlineOrders.length === 0 || isSyncing || !isOnline}
                                    onClick={() => syncOfflineOrdersToServer(true)}
                                    className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-amber-600 px-3 py-2.5 text-xs font-bold text-white shadow-xs transition hover:bg-amber-700 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    <Upload className={`h-3.5 w-3.5 ${isSyncing ? 'animate-bounce' : ''}`} />
                                    <span>
                                        {isSyncing
                                            ? 'Mengunggah Transaksi...'
                                            : `Upload & Sinkronkan (${offlineOrders.length})`}
                                    </span>
                                </button>

                                <div className="grid grid-cols-2 gap-1.5">
                                    <button
                                        type="button"
                                        disabled={offlineOrders.length === 0}
                                        onClick={exportOfflineOrdersToFile}
                                        className="flex cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-stone-100 px-2.5 py-2 text-[11px] font-semibold text-stone-700 transition hover:bg-stone-200 disabled:opacity-40 dark:bg-stone-800 dark:text-stone-200 dark:hover:bg-stone-700"
                                        title="Ekspor transaksi offline kasir ke berkas JSON"
                                    >
                                        <Download className="h-3.5 w-3.5" />
                                        <span>Export JSON</span>
                                    </button>

                                    <label
                                        htmlFor="pos-import-file-input"
                                        className="flex cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-stone-100 px-2.5 py-2 text-center text-[11px] font-semibold text-stone-700 transition hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-200 dark:hover:bg-stone-700"
                                        title="Pilih file JSON transaksi kasir untuk diimpor ke database"
                                    >
                                        <Upload className="h-3.5 w-3.5" />
                                        <span>Import JSON</span>
                                        <input
                                            id="pos-import-file-input"
                                            type="file"
                                            accept=".json,application/json,text/plain"
                                            onChange={handleImportOrdersFile}
                                            className="hidden"
                                        />
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Section: Daftar Transaksi Offline Yang Menunggu Sinkronisasi */}
                    <div className="pt-2">
                        <div className="mb-2 flex items-center justify-between">
                            <h4 className="text-xs font-bold tracking-wider text-stone-600 uppercase dark:text-stone-400">
                                Daftar Transaksi Offline Tersimpan ({offlineOrders.length})
                            </h4>
                            {offlineOrders.length > 0 && isOnline && (
                                <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                                    <Wifi className="h-3 w-3" />
                                    <span>Otomatis terupdate saat online</span>
                                </span>
                            )}
                        </div>

                        {offlineOrders.length === 0 ? (
                            <div className="rounded-xl border border-stone-200 bg-stone-50/50 p-4 py-6 text-center text-xs text-stone-400 dark:border-stone-800 dark:bg-stone-800/20 dark:text-stone-500">
                                <CheckCircle2 className="mx-auto mb-2 h-8 w-8 text-emerald-500 opacity-80" />
                                <p className="font-semibold text-stone-700 dark:text-stone-300">
                                    Tidak ada transaksi offline yang tertunda
                                </p>
                                <p className="mt-0.5 text-[11px] text-stone-500 dark:text-stone-400">
                                    Semua penjualan telah tersinkronkan ke database server pusat.
                                </p>
                            </div>
                        ) : (
                            <div className="max-h-52 overflow-hidden overflow-y-auto rounded-xl border border-stone-200 dark:border-stone-800">
                                <table className="w-full text-left text-xs">
                                    <thead className="border-b border-stone-200 bg-stone-100 font-bold text-stone-600 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-400">
                                        <tr>
                                            <th className="p-2.5">No. Struk</th>
                                            <th className="p-2.5">Pelanggan</th>
                                            <th className="p-2.5">Metode</th>
                                            <th className="p-2.5">Waktu</th>
                                            <th className="p-2.5 text-right">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-stone-200 text-stone-800 dark:divide-stone-800 dark:text-stone-200">
                                        {offlineOrders.map((ord) => (
                                            <tr
                                                key={ord.offline_id}
                                                className="hover:bg-stone-50 dark:hover:bg-stone-800/50"
                                            >
                                                <td className="p-2.5 font-mono font-semibold text-brand-900 dark:text-emerald-400">
                                                    {ord.offline_id}
                                                </td>
                                                <td className="p-2.5">
                                                    {ord.customer_name || 'Pelanggan Kasir'}
                                                </td>
                                                <td className="p-2.5 capitalize">
                                                    {ord.payment_method}
                                                </td>
                                                <td className="p-2.5 text-[11px] text-stone-400 dark:text-stone-500">
                                                    {new Date(ord.created_at).toLocaleTimeString('id-ID', {
                                                        hour: '2-digit',
                                                        minute: '2-digit',
                                                    })}
                                                </td>
                                                <td className="p-2.5 text-right font-bold">
                                                    Rp {formatRp(ord.total_amount)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>

                {/* Modal Footer */}
                <div className="flex items-center justify-between border-t border-stone-200 bg-stone-50 p-4 dark:border-stone-800 dark:bg-stone-900">
                    <span className="text-[11px] text-stone-500 dark:text-stone-400">
                        Alat Kopi Malang POS Offline Engine • LocalStorage & Auto-Sync
                    </span>
                    <button
                        type="button"
                        onClick={onClose}
                        className="cursor-pointer rounded-xl bg-stone-200 px-4 py-2 text-xs font-bold text-stone-800 transition hover:bg-stone-300 dark:bg-stone-800 dark:text-stone-200 dark:hover:bg-stone-700"
                    >
                        Tutup
                    </button>
                </div>
            </div>
        </div>
    );
};
