import { PrinterSettings } from '@/types/pos';
import React from 'react';
import { Smartphone, X, Printer, RefreshCw, Settings, Search, Download } from 'lucide-react';
import {
    ReceiptData,
    BluetoothPrinterDevice,
    isAndroidNativeBluetoothAvailable,
    isWebBluetoothAvailable,
    openAndroidBluetoothSettings,
    generateRawBtPrintUrl,
} from '@/lib/thermal-printer';

interface BluetoothScannerModalProps {
    isOpen: boolean;
    onClose: () => void;
    btStatusMessage: string | null;
    pendingBtReceipt: ReceiptData | null;
    completedReceipt: ReceiptData | null;
    connectedBtPrinter: BluetoothPrinterDevice | null;
    isBtPrinting: boolean;
    executeDirectBtPrint: (receipt: ReceiptData, address: string) => Promise<boolean>;
    getSampleTestReceipt: () => ReceiptData;
    setPendingBtReceipt: (val: ReceiptData | null) => void;
    setBtStatusMessage: (val: string | null) => void;
    handleDisconnectBtPrinter: () => void;
    btDevices: BluetoothPrinterDevice[];
    isBtScanning: boolean;
    handleStartBtScan: () => void;
    connectingBtAddress: string | null;
    handleConnectAndroidBtDevice: (dev: BluetoothPrinterDevice) => void;
    printerForm: PrinterSettings;
}

export const BluetoothScannerModal: React.FC<BluetoothScannerModalProps> = ({
    isOpen,
    onClose,
    btStatusMessage,
    pendingBtReceipt,
    completedReceipt,
    connectedBtPrinter,
    isBtPrinting,
    executeDirectBtPrint,
    getSampleTestReceipt,
    setPendingBtReceipt,
    setBtStatusMessage,
    handleDisconnectBtPrinter,
    btDevices,
    isBtScanning,
    handleStartBtScan,
    connectingBtAddress,
    handleConnectAndroidBtDevice,
    printerForm,
}) => {
    if (!isOpen) return null;

    return (
        <div className="pos-modal-overlay fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/70 p-3 sm:p-4">
            <div className="pos-gpu-layer my-auto w-full max-w-lg touch-pan-y animate-in space-y-4 overflow-y-auto overscroll-y-contain rounded-3xl border border-stone-200 bg-white p-5 text-stone-900 shadow-2xl duration-150 zoom-in-95 max-h-[92vh] sm:p-6 dark:border-stone-800 dark:bg-stone-900 dark:text-stone-100">
                {/* Modal Header */}
                <div className="flex items-start justify-between border-b border-stone-100 pb-3.5 dark:border-stone-800">
                    <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white shadow-md">
                            <Smartphone className="h-5 w-5" />
                        </div>
                        <div>
                            <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-extrabold tracking-wider text-emerald-800 uppercase dark:bg-emerald-950/60 dark:text-emerald-300">
                                {isAndroidNativeBluetoothAvailable()
                                    ? 'Native Bluetooth POS Android'
                                    : isWebBluetoothAvailable()
                                      ? 'Web Bluetooth POS'
                                      : 'Manajer Printer Bluetooth'}
                            </div>
                            <h3 className="mt-0.5 text-base font-black text-brand-950 dark:text-white">
                                Pencarian Printer Bluetooth
                            </h3>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="cursor-pointer rounded-xl p-1.5 text-stone-400 hover:bg-stone-100 hover:text-stone-700 dark:hover:bg-stone-800 dark:hover:text-stone-200"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Status / Feedback Banner */}
                {btStatusMessage && (
                    <div
                        className={`flex items-center gap-2 rounded-xl border p-3 text-xs font-semibold ${
                            btStatusMessage.startsWith('✓')
                                ? 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300'
                                : 'border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-800/60 dark:bg-amber-950/40 dark:text-amber-300'
                        }`}
                    >
                        <span>{btStatusMessage}</span>
                    </div>
                )}

                {/* Pending Print Job Notice */}
                {pendingBtReceipt && (
                    <div className="flex items-center justify-between rounded-xl border border-sky-200 bg-sky-50/80 px-3.5 py-2.5 text-xs dark:border-sky-800/60 dark:bg-sky-950/40">
                        <div className="flex items-center gap-2 font-semibold text-sky-900 dark:text-sky-200">
                            <Printer className="h-4 w-4 shrink-0 text-sky-600 dark:text-sky-400" />
                            <span>
                                Siap mencetak Struk <strong>#{pendingBtReceipt.order_number}</strong> setelah printer terhubung
                            </span>
                        </div>
                    </div>
                )}

                {/* Connected Printer Active Box */}
                {connectedBtPrinter && (
                    <div className="space-y-2.5 rounded-2xl border border-emerald-300 bg-emerald-50/70 p-3.5 dark:border-emerald-800/70 dark:bg-emerald-950/30">
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black tracking-wider text-emerald-800 uppercase dark:text-emerald-300">
                                Printer Aktif Terhubung
                            </span>
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-600 px-2 py-0.5 text-[10px] font-bold text-white">
                                ✓ Siap Cetak
                            </span>
                        </div>
                        <div className="flex flex-col justify-between gap-2.5 sm:flex-row sm:items-center">
                            <div className="min-w-0">
                                <div className="truncate text-sm font-black text-stone-900 dark:text-white">
                                    {connectedBtPrinter.name}
                                </div>
                                <div className="font-mono text-[11px] text-stone-500 dark:text-stone-400">
                                    MAC / ID: {connectedBtPrinter.address}
                                </div>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <button
                                    type="button"
                                    disabled={isBtPrinting}
                                    onClick={async () => {
                                        const receiptToUse =
                                            pendingBtReceipt ||
                                            completedReceipt ||
                                            getSampleTestReceipt();
                                        try {
                                            const ok = await executeDirectBtPrint(
                                                receiptToUse,
                                                connectedBtPrinter.address,
                                            );
                                            if (ok && pendingBtReceipt) {
                                                setPendingBtReceipt(null);
                                                onClose();
                                            }
                                        } catch (e: any) {
                                            setBtStatusMessage(
                                                e?.message || 'Gagal mencetak struk.',
                                            );
                                        }
                                    }}
                                    className="flex cursor-pointer items-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-2 text-xs font-black text-white shadow-xs transition hover:bg-emerald-700 active:scale-95 disabled:opacity-50"
                                >
                                    <Printer className="h-3.5 w-3.5" />
                                    <span>
                                        {isBtPrinting
                                            ? 'Mencetak...'
                                            : pendingBtReceipt
                                              ? 'Cetak Sekarang'
                                              : 'Tes Cetak'}
                                    </span>
                                </button>
                                <button
                                    type="button"
                                    onClick={handleDisconnectBtPrinter}
                                    className="cursor-pointer rounded-xl border border-rose-200 bg-white px-2.5 py-2 text-xs font-bold text-rose-600 transition hover:bg-rose-50 dark:border-rose-800 dark:bg-stone-900 dark:text-rose-400"
                                >
                                    Putuskan
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* CASE 1: NATIVE ANDROID POS APK SCANNER */}
                {isAndroidNativeBluetoothAvailable() ? (
                    <div className="space-y-3">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-stone-700 dark:text-stone-200">
                                    Daftar Perangkat Bluetooth ({btDevices.length})
                                </span>
                                {isBtScanning && (
                                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                                        <RefreshCw className="h-2.5 w-2.5 animate-spin" />
                                        Memindai...
                                    </span>
                                )}
                            </div>

                            <div className="flex items-center gap-1.5">
                                <button
                                    type="button"
                                    onClick={handleStartBtScan}
                                    className="flex cursor-pointer items-center gap-1.5 rounded-xl bg-brand-700 px-3 py-1.5 text-xs font-bold text-white shadow-2xs transition hover:bg-brand-800 active:scale-95"
                                >
                                    <RefreshCw className={`h-3.5 w-3.5 ${isBtScanning ? 'animate-spin' : ''}`} />
                                    <span>
                                        {isBtScanning ? 'Memindai...' : 'Pindai Ulang'}
                                    </span>
                                </button>
                                <button
                                    type="button"
                                    onClick={openAndroidBluetoothSettings}
                                    className="flex cursor-pointer items-center gap-1 rounded-xl border border-stone-200 bg-stone-50 px-2.5 py-1.5 text-xs font-semibold text-stone-700 transition hover:bg-stone-100 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-300"
                                    title="Buka Pengaturan Bluetooth Sistem Android"
                                >
                                    <Settings className="h-3.5 w-3.5" />
                                    <span>Setelan BT HP</span>
                                </button>
                            </div>
                        </div>

                        <div className="max-h-72 touch-pan-y space-y-2 overflow-y-auto overscroll-y-contain rounded-2xl border border-stone-200 bg-stone-50/70 p-2.5 dark:border-stone-800 dark:bg-stone-950/50">
                            {btDevices.length === 0 ? (
                                <div className="py-8 text-center text-xs text-stone-500 dark:text-stone-400">
                                    <Smartphone className="mx-auto mb-2 h-8 w-8 text-stone-400" />
                                    <p className="font-bold text-stone-700 dark:text-stone-300">
                                        {isBtScanning
                                            ? 'Sedang mencari printer Bluetooth di sekitar...'
                                            : 'Belum ada perangkat Bluetooth yang terdeteksi'}
                                    </p>
                                    <p className="mt-1 text-[11px]">
                                        Pastikan printer thermal Bluetooth menyala, lampu indikator berkedip, dan Bluetooth HP aktif.
                                    </p>
                                </div>
                            ) : (
                                btDevices.map((dev) => {
                                    const isCurrentConnected =
                                        connectedBtPrinter?.address?.toLowerCase() === dev.address.toLowerCase();
                                    const isConnectingThis =
                                        connectingBtAddress?.toLowerCase() === dev.address.toLowerCase();

                                    return (
                                        <div
                                            key={dev.address}
                                            className={`flex items-center justify-between gap-3 rounded-xl border p-3 transition ${
                                                isCurrentConnected
                                                    ? 'border-emerald-400 bg-emerald-50/90 dark:border-emerald-700 dark:bg-emerald-950/40'
                                                    : dev.isPrinter
                                                      ? 'border-stone-200 bg-white hover:border-emerald-300 dark:border-stone-800 dark:bg-stone-900'
                                                      : 'border-stone-200/70 bg-white/80 dark:border-stone-800/70 dark:bg-stone-900/70'
                                            }`}
                                        >
                                            <div className="flex min-w-0 items-center gap-3">
                                                <div
                                                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                                                        isCurrentConnected || dev.isPrinter
                                                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                                                            : 'bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-400'
                                                    }`}
                                                >
                                                    <Printer className="h-5 w-5" />
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="flex flex-wrap items-center gap-1.5">
                                                        <span className="truncate text-sm font-bold text-stone-900 dark:text-white">
                                                            {dev.name}
                                                        </span>
                                                        {dev.isPrinter && (
                                                            <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[9px] font-extrabold text-emerald-800 uppercase dark:bg-emerald-950 dark:text-emerald-300">
                                                                Printer
                                                            </span>
                                                        )}
                                                        {dev.bonded && (
                                                            <span className="rounded bg-stone-200 px-1.5 py-0.5 text-[9px] font-bold text-stone-700 dark:bg-stone-800 dark:text-stone-300">
                                                                Paired
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="font-mono text-[11px] text-stone-500 dark:text-stone-400">
                                                        {dev.address}
                                                    </div>
                                                </div>
                                            </div>

                                            <button
                                                type="button"
                                                disabled={isConnectingThis}
                                                onClick={() => handleConnectAndroidBtDevice(dev)}
                                                className={`shrink-0 cursor-pointer rounded-xl px-3.5 py-2 text-xs font-extrabold transition active:scale-95 disabled:opacity-50 ${
                                                    isCurrentConnected
                                                        ? 'border border-emerald-600 bg-emerald-600 text-white hover:bg-emerald-700'
                                                        : 'bg-brand-700 text-white hover:bg-brand-800 dark:bg-emerald-600 dark:hover:bg-emerald-500'
                                                }`}
                                            >
                                                {isConnectingThis
                                                    ? 'Menghubungkan...'
                                                    : isCurrentConnected
                                                      ? pendingBtReceipt
                                                          ? 'Cetak'
                                                          : '✓ Terhubung'
                                                      : 'Hubungkan'}
                                            </button>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                ) : isWebBluetoothAvailable() ? (
                    /* CASE 2: CHROME WEB BLUETOOTH SCANNER */
                    <div className="space-y-3 rounded-2xl border border-stone-200 bg-stone-50 p-4 text-center dark:border-stone-800 dark:bg-stone-950/60">
                        <Smartphone className="mx-auto h-10 w-10 text-emerald-600 dark:text-emerald-400" />
                        <div className="space-y-1">
                            <h4 className="text-sm font-bold text-stone-900 dark:text-white">
                                Pindai Printer Bluetooth di Sekitar
                            </h4>
                            <p className="text-xs text-stone-600 dark:text-stone-400">
                                Klik tombol di bawah untuk membuka daftar perangkat printer thermal Bluetooth yang aktif di dekat Anda.
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={handleStartBtScan}
                            disabled={isBtScanning}
                            className="mx-auto flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-xs font-black text-white shadow-md transition hover:bg-emerald-700 active:scale-95 disabled:opacity-50"
                        >
                            <Search className="h-4 w-4" />
                            <span>
                                {isBtScanning
                                    ? 'Memindai Perangkat...'
                                    : 'Mulai Cari Printer Bluetooth'}
                            </span>
                        </button>
                    </div>
                ) : (
                    /* CASE 3: OLDER WEBVIEW / FALLBACK WITH 1-TAP APK v2.0 UPDATE + RAWBT BRIDGE */
                    <div className="space-y-3">
                        <div className="space-y-2.5 rounded-2xl border border-emerald-300 bg-emerald-50/80 p-4 dark:border-emerald-800 dark:bg-emerald-950/40">
                            <div className="flex items-start gap-3">
                                <Download className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700 dark:text-emerald-400" />
                                <div className="space-y-1">
                                    <h4 className="text-xs font-black uppercase tracking-wide text-emerald-900 dark:text-emerald-200">
                                        Pembaruan APK POS Android v2.0 (Native Bluetooth)
                                    </h4>
                                    <p className="text-xs leading-relaxed text-emerald-800 dark:text-emerald-300">
                                        Aplikasi APK yang sedang terpasang di HP Anda masih versi lama (v1.0). Unduh & pasang pembaruan <strong>Sanubari POS APK v2.0</strong> di bawah ini untuk mengaktifkan <strong>Pemindai Printer Bluetooth Langsung di Aplikasi</strong>.
                                    </p>
                                </div>
                            </div>
                            <a
                                href="/pos/download-apk"
                                target="_blank"
                                rel="noreferrer"
                                className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-black text-white shadow-sm transition hover:bg-emerald-700 active:scale-95"
                            >
                                <Download className="h-4 w-4" />
                                <span>Unduh & Perbarui APK POS v2.0 (Bluetooth Native)</span>
                            </a>
                        </div>

                        <div className="space-y-2.5 rounded-2xl border border-stone-200 bg-stone-50 p-4 dark:border-stone-800 dark:bg-stone-950/50">
                            <h4 className="text-xs font-bold text-stone-800 dark:text-stone-200">
                                Cetak Instan Tanpa Update (Alternatif):
                            </h4>
                            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                                <a
                                    href={generateRawBtPrintUrl(
                                        pendingBtReceipt || completedReceipt || getSampleTestReceipt(),
                                        printerForm,
                                    )}
                                    className="flex cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-brand-300 bg-white px-3 py-2.5 text-xs font-bold text-brand-800 shadow-2xs transition hover:bg-brand-50 dark:border-stone-700 dark:bg-stone-800 dark:text-emerald-300"
                                >
                                    <Smartphone className="h-4 w-4" />
                                    <span>Kirim ke Bridge Bluetooth (RawBT)</span>
                                </a>
                                <button
                                    type="button"
                                    onClick={openAndroidBluetoothSettings}
                                    className="flex cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-xs font-bold text-stone-700 shadow-2xs transition hover:bg-stone-100 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-200"
                                >
                                    <Settings className="h-4 w-4" />
                                    <span>Buka Setelan Bluetooth HP</span>
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                <div className="flex items-center justify-between border-t border-stone-100 pt-3 text-[11px] text-stone-500 dark:border-stone-800 dark:text-stone-400">
                    <span>Mendukung semua printer thermal 58mm & 80mm (ESC/POS)</span>
                    <button
                        type="button"
                        onClick={onClose}
                        className="cursor-pointer rounded-xl bg-stone-100 px-3.5 py-1.5 text-xs font-bold text-stone-700 hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-200"
                    >
                        Tutup
                    </button>
                </div>
            </div>
        </div>
    );
};
