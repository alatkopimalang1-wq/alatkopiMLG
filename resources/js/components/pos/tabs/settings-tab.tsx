import { isElectronDesktop } from '@/lib/thermal-printer';
import React from 'react';
import {
    AlertCircle,
    Banknote,
    Building2,
    Check,
    Columns,
    CreditCard,
    Eye,
    LayoutGrid,
    Monitor,
    Moon,
    Printer,
    QrCode,
    RefreshCw,
    Save,
    Search,
    Shield,
    Smartphone,
    Sun,
    Trash2,
    UserPlus,
    Users,
} from 'lucide-react';
import { useAppearance } from '@/hooks/use-appearance';
import { ThermalReceiptPreview } from '@/components/pos/thermal-receipt-preview';
import {
    PrinterSettings,
    PaymentSettings,
    PosLayoutSettings,
    PosStaffMember,
    PosCashier,
} from '@/types/pos';

interface SettingsTabProps {
    isActive: boolean;
    cashier: PosCashier;
    settingsSubTab: 'printer' | 'payment' | 'layout' | 'staff';
    setSettingsSubTab: (tab: 'printer' | 'payment' | 'layout' | 'staff') => void;
    printerForm: PrinterSettings;
    setPrinterForm: React.Dispatch<React.SetStateAction<PrinterSettings>>;
    paymentForm: PaymentSettings;
    setPaymentForm: React.Dispatch<React.SetStateAction<PaymentSettings>>;
    gridDensity: PosLayoutSettings['grid_density'];
    updateGridDensity: (density: PosLayoutSettings['grid_density']) => void;
    gridColumns: number | 'auto';
    updateGridColumns: (cols: number | 'auto') => void;
    isMobilePos: boolean;
    connectedUsbPrinter: any;
    connectedBtPrinter: any;
    openBluetoothScannerModal: () => void;
    handleDisconnectBtPrinter: () => void;
    availableWindowsPrinters: string[];
    isLoadingWindowsPrinters: boolean;
    refreshWindowsPrinters: () => void;
    handleSavePrinterSettings: (e: React.FormEvent) => void;
    handleSavePaymentSettings: (e: React.FormEvent) => void;
    handleSaveLayoutSettings: (e: React.FormEvent) => void;
    isSavingSettings: boolean;
    handleRunTestPrint: () => void;
    handleResetPrinterDefaults: () => void;
    getSampleTestReceipt: () => any;
    handlePreviewReceipt: (receipt: any) => void;
    isBtPrinting: boolean;
    isOwner: boolean;
    staff: PosStaffMember[];
    staffSearchQuery: string;
    setStaffSearchQuery: (query: string) => void;
    staffName: string;
    setStaffName: (val: string) => void;
    staffEmail: string;
    setStaffEmail: (val: string) => void;
    staffPhone: string;
    setStaffPhone: (val: string) => void;
    staffRole: string;
    setStaffRole: (val: string) => void;
    staffPassword: string;
    setStaffPassword: (val: string) => void;
    staffPasswordConfirm: string;
    setStaffPasswordConfirm: (val: string) => void;
    isAddingStaff: boolean;
    handleCreateStaff: (e: React.FormEvent) => void;
    handleDeleteStaff: (member: PosStaffMember) => void;
    deletingStaffId: number | null;
    staffFormError: string | null;
    showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const SettingsTab: React.FC<SettingsTabProps> = ({
    isActive,
    cashier,
    settingsSubTab,
    setSettingsSubTab,
    printerForm,
    setPrinterForm,
    paymentForm,
    setPaymentForm,
    gridDensity,
    updateGridDensity,
    gridColumns,
    updateGridColumns,
    isMobilePos,
    connectedUsbPrinter,
    connectedBtPrinter,
    openBluetoothScannerModal,
    handleDisconnectBtPrinter,
    availableWindowsPrinters,
    isLoadingWindowsPrinters,
    refreshWindowsPrinters,
    handleSavePrinterSettings,
    handleSavePaymentSettings,
    handleSaveLayoutSettings,
    isSavingSettings,
    handleRunTestPrint,
    handleResetPrinterDefaults,
    getSampleTestReceipt,
    handlePreviewReceipt,
    isBtPrinting,
    isOwner,
    staff,
    staffSearchQuery,
    setStaffSearchQuery,
    staffName,
    setStaffName,
    staffEmail,
    setStaffEmail,
    staffPhone,
    setStaffPhone,
    staffRole,
    setStaffRole,
    staffPassword,
    setStaffPassword,
    staffPasswordConfirm,
    setStaffPasswordConfirm,
    isAddingStaff,
    handleCreateStaff,
    handleDeleteStaff,
    deletingStaffId,
    staffFormError,
    showToast,
}) => {
    const { appearance, updateAppearance } = useAppearance();

    if (!isActive) return null;

    return (
<div className="mx-auto w-full max-w-6xl min-w-0 flex-1 space-y-5 overflow-y-auto bg-[#f4f6f6] p-3.5 sm:space-y-6 sm:p-6 dark:bg-stone-950">
                    {/* Sub Tab Switcher Navigation Bar */}
                    <div className="border-b border-stone-200 pb-3 dark:border-stone-800">
                        <div className="flex flex-wrap items-center gap-1.5 rounded-2xl border border-stone-200 bg-white p-1.5 text-xs font-semibold shadow-2xs dark:border-stone-800 dark:bg-stone-900">
                            <button
                                type="button"
                                onClick={() => setSettingsSubTab('printer')}
                                className={`flex shrink-0 cursor-pointer items-center gap-1.5 rounded-xl px-3.5 py-2 whitespace-nowrap transition ${
                                    settingsSubTab === 'printer'
                                        ? 'bg-brand-700 font-bold text-white shadow-xs'
                                        : 'text-stone-600 hover:bg-stone-50 hover:text-brand-950 dark:text-stone-400 dark:hover:bg-stone-800/60 dark:hover:text-stone-100'
                                }`}
                            >
                                <Printer className="h-4 w-4 shrink-0" />
                                <span>Printer & Struk</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setSettingsSubTab('payment')}
                                className={`flex shrink-0 cursor-pointer items-center gap-1.5 rounded-xl px-3.5 py-2 whitespace-nowrap transition ${
                                    settingsSubTab === 'payment'
                                        ? 'bg-brand-700 font-bold text-white shadow-xs'
                                        : 'text-stone-600 hover:bg-stone-50 hover:text-brand-950 dark:text-stone-400 dark:hover:bg-stone-800/60 dark:hover:text-stone-100'
                                }`}
                            >
                                <CreditCard className="h-4 w-4 shrink-0" />
                                <span>Metode Pembayaran</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setSettingsSubTab('appearance')}
                                className={`flex shrink-0 cursor-pointer items-center gap-1.5 rounded-xl px-3.5 py-2 whitespace-nowrap transition ${
                                    settingsSubTab === 'appearance'
                                        ? 'bg-brand-700 font-bold text-white shadow-xs'
                                        : 'text-stone-600 hover:bg-stone-50 hover:text-brand-950 dark:text-stone-400 dark:hover:bg-stone-800/60 dark:hover:text-stone-100'
                                }`}
                            >
                                <Sun className="h-4 w-4 shrink-0" />
                                <span>Tema & Tampilan</span>
                            </button>
                            {isOwner && (
                                <button
                                    type="button"
                                    onClick={() => setSettingsSubTab('staff')}
                                    className={`flex shrink-0 cursor-pointer items-center gap-1.5 rounded-xl px-3.5 py-2 whitespace-nowrap transition ${
                                        settingsSubTab === 'staff'
                                            ? 'bg-amber-600 font-bold text-white shadow-xs'
                                            : 'text-stone-600 hover:bg-stone-50 hover:text-brand-950 dark:text-stone-400 dark:hover:bg-stone-800/60 dark:hover:text-stone-100'
                                    }`}
                                >
                                    <Users className="h-4 w-4 shrink-0" />
                                    <span>Kelola Staf</span>
                                    <span className="py-0.2 rounded-full bg-amber-400 px-1.5 text-[9px] font-black text-stone-950 uppercase">
                                        Owner
                                    </span>
                                </button>
                            )}
                        </div>
                    </div>

                    {/* SUBTAB A: PRINTER & STRUK (SEDERHANA & PREVIEW DI APLIKASI) */}
                    {settingsSubTab === 'printer' && (
                        <div className="space-y-6">
                            {/* Header Section */}
                            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h3 className="text-sm font-bold text-stone-900 dark:text-white">
                                            Pengaturan Printer & Struk Kasir
                                        </h3>
                                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300">
                                            Khusus Perangkat Ini
                                        </span>
                                    </div>
                                    <p className="text-[11px] text-stone-500 dark:text-stone-400">
                                        Pengaturan disimpan khusus pada perangkat ini dan tidak akan mengubah pengaturan printer staf lain.
                                    </p>
                                </div>
                                <div className="flex flex-wrap items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() => handlePreviewReceipt()}
                                        className="flex cursor-pointer items-center gap-1.5 rounded-xl border border-emerald-300 bg-emerald-50 px-3.5 py-2 text-xs font-bold text-emerald-800 shadow-2xs transition hover:bg-emerald-100 active:scale-95 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 dark:hover:bg-emerald-900/60"
                                        title="Lihat Pratinjau Struk langsung di aplikasi (Bukan Chrome)"
                                    >
                                        <Eye className="h-4 w-4" />
                                        <span>Preview Struk di Aplikasi</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleSavePrinterSettings}
                                        disabled={isSavingSettings}
                                        className="flex cursor-pointer items-center gap-1.5 rounded-xl bg-brand-700 px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-brand-800 active:scale-95 disabled:opacity-50"
                                    >
                                        <Save className="h-4 w-4" />
                                        <span>
                                            {isSavingSettings
                                                ? 'Menyimpan...'
                                                : 'Simpan'}
                                        </span>
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
                                {/* KOLOM KIRI: FORM PENGATURAN SEDERHANA (7 COLS) */}
                                <div className="space-y-4 lg:col-span-7">
                                    {/* CARD 0A: PENGATURAN KONEKSI & PEMILIHAN PRINTER USB / WINDOWS POS (HANYA MUNCUL DI DESKTOP / PC WINDOWS) */}
                                    {!isMobilePos && (
                                        <div className="hidden md:block space-y-4 rounded-2xl border border-sky-200/90 bg-gradient-to-br from-sky-50/70 via-white to-white p-5 shadow-xs dark:border-sky-900/60 dark:from-sky-950/30 dark:via-stone-900 dark:to-stone-900">
                                            <div className="flex flex-wrap items-center justify-between gap-2">
                                                <div className="flex items-center gap-2.5">
                                                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-600 text-white shadow-xs">
                                                        <Printer className="h-4 w-4" />
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <h4 className="text-xs font-black uppercase tracking-wider text-stone-800 dark:text-stone-100">
                                                                Printer USB & Windows POS
                                                            </h4>
                                                            {isElectronDesktop() && (
                                                                <span className="rounded-md bg-sky-100 px-1.5 py-0.5 text-[9px] font-extrabold text-sky-800 dark:bg-sky-950/80 dark:text-sky-300">
                                                                    Desktop App
                                                                </span>
                                                            )}
                                                        </div>
                                                        <p className="text-[11px] text-stone-500 dark:text-stone-400">
                                                            Pilih printer thermal USB yang terhubung di PC/Laptop Windows untuk cetak struk kasir
                                                        </p>
                                                    </div>
                                                </div>

                                                {connectedUsbPrinter ? (
                                                    <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-300 bg-sky-100 px-2.5 py-1 text-[10px] font-extrabold text-sky-800 dark:border-sky-700 dark:bg-sky-950/80 dark:text-sky-300">
                                                        <span className="h-2 w-2 rounded-full bg-sky-500 animate-pulse" />
                                                        WebUSB: {connectedUsbPrinter.name}
                                                    </span>
                                                ) : printerForm.printer_name ? (
                                                    <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-200 bg-sky-50 px-2.5 py-1 text-[10px] font-bold text-sky-800 dark:border-sky-800 dark:bg-sky-950/50 dark:text-sky-300">
                                                        <Check className="h-3 w-3 text-sky-600" />
                                                        {printerForm.printer_name}
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1.5 rounded-full border border-stone-200 bg-stone-100 px-2.5 py-1 text-[10px] font-bold text-stone-600 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-400">
                                                        Belum Dipilih
                                                    </span>
                                                )}
                                            </div>

                                            {/* SELEKSI PRINTER WINDOWS (JIKA DI DETEKSI DESKTOP / ELECTRON) */}
                                            {availableWindowsPrinters.length > 0 && (
                                                <div className="rounded-xl border border-sky-200 bg-white p-3.5 space-y-2 dark:border-sky-800/60 dark:bg-stone-950/60">
                                                    <div className="flex items-center justify-between">
                                                        <label className="text-xs font-bold text-stone-800 dark:text-stone-200">
                                                            Daftar Printer Terdeteksi di Windows ({availableWindowsPrinters.length} Printer)
                                                        </label>
                                                        <button
                                                            type="button"
                                                            onClick={refreshWindowsPrinters}
                                                            disabled={isLoadingWindowsPrinters}
                                                            className="flex cursor-pointer items-center gap-1 text-[11px] font-bold text-sky-600 hover:text-sky-700 disabled:opacity-50 dark:text-sky-400"
                                                            title="Segarkan daftar printer USB / Windows"
                                                        >
                                                            <RefreshCw className={`h-3 w-3 ${isLoadingWindowsPrinters ? 'animate-spin' : ''}`} />
                                                            <span>{isLoadingWindowsPrinters ? 'Memindai...' : 'Pindai Ulang'}</span>
                                                        </button>
                                                    </div>

                                                    <div className="relative">
                                                        <select
                                                            value={printerForm.printer_name || ''}
                                                            onChange={(e) => {
                                                                const val = e.target.value;
                                                                const is80 = /80|tm-t|t82|t88|xp-n/i.test(val);
                                                                setPrinterForm((prev) => ({
                                                                    ...prev,
                                                                    printer_name: val,
                                                                    usb_printer_name: val,
                                                                    printer_driver: val,
                                                                    paper_width: is80 ? '80mm' : prev.paper_width,
                                                                    receipt_columns: is80 ? 44 : prev.receipt_columns,
                                                                }));
                                                                showToast(`✓ Printer kasir diset ke: ${val}`);
                                                            }}
                                                            className="w-full rounded-xl border border-sky-300 bg-sky-50/50 px-3.5 py-2.5 text-xs font-bold text-stone-900 focus:border-sky-500 focus:bg-white focus:outline-none dark:border-sky-700 dark:bg-stone-900 dark:text-white"
                                                        >
                                                            <option value="">-- Pilih Printer yang Ingin Dipakai --</option>
                                                            {availableWindowsPrinters.map((p) => {
                                                                const isPos = /pos|thermal|receipt|58|80|xprinter|epson|panda|vsc|iware|bluetooth/i.test(p.name);
                                                                return (
                                                                    <option key={p.name} value={p.name}>
                                                                        {p.name} {p.isDefault ? '★ (Default Windows)' : ''} {isPos ? '🖨️ [Thermal POS]' : ''}
                                                                    </option>
                                                                );
                                                            })}
                                                        </select>
                                                    </div>
                                                    <p className="text-[10px] text-stone-500 dark:text-stone-400">
                                                        Pilih printer kasir Anda dari daftar di atas. Printer yang dipilih akan langsung dipakai setiap kali kasir mencetak struk tanpa perlu memilih ulang.
                                                    </p>
                                                </div>
                                            )}

                                            {/* PRESET CEPAT & NAMA PRINTER DRIVER WINDOWS */}
                                            <div className="space-y-2.5">
                                                <label className="block text-[11px] font-bold text-stone-700 dark:text-stone-300">
                                                    Nama Driver / Identitas Printer Windows yang Dipakai:
                                                </label>
                                                <div className="flex gap-2">
                                                    <input
                                                        type="text"
                                                        value={printerForm.printer_name || ''}
                                                        onChange={(e) =>
                                                            setPrinterForm((prev) => ({
                                                                ...prev,
                                                                printer_name: e.target.value,
                                                                usb_printer_name: e.target.value,
                                                                printer_driver: e.target.value,
                                                            }))
                                                        }
                                                        placeholder="Contoh: POS80 Printer, POS58 Printer, EPSON TM-T82"
                                                        className="w-full rounded-xl border border-stone-200 bg-stone-50 px-3.5 py-2 text-xs font-bold text-stone-900 outline-none focus:border-sky-500 focus:bg-white dark:border-stone-700 dark:bg-stone-800 dark:text-white dark:focus:bg-stone-800"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRunTestPrint('web')}
                                                        className="flex shrink-0 cursor-pointer items-center gap-1 rounded-xl border border-sky-300 bg-sky-50 px-3 py-2 text-xs font-bold text-sky-800 shadow-2xs transition hover:bg-sky-100 active:scale-95 dark:border-sky-800 dark:bg-sky-950/60 dark:text-sky-300"
                                                        title="Kirim tes cetak ke printer Windows"
                                                    >
                                                        <Printer className="h-3.5 w-3.5" />
                                                        <span>Tes Cetak USB</span>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* CARD 0: PENCARIAN & KONEKSI PRINTER BLUETOOTH */}
                                    <div className="space-y-3.5 rounded-2xl border border-emerald-200/90 bg-gradient-to-br from-emerald-50/70 via-white to-white p-5 shadow-xs dark:border-emerald-900/60 dark:from-emerald-950/30 dark:via-stone-900 dark:to-stone-900">
                                        <div className="flex flex-wrap items-center justify-between gap-2">
                                            <div className="flex items-center gap-2.5">
                                                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-xs">
                                                    <Smartphone className="h-4 w-4" />
                                                </div>
                                                <div>
                                                    <h4 className="text-xs font-black uppercase tracking-wider text-stone-800 dark:text-stone-100">
                                                        Printer Bluetooth POS
                                                    </h4>
                                                    <p className="text-[11px] text-stone-500 dark:text-stone-400">
                                                        Pindai & hubungkan printer thermal Bluetooth langsung dari aplikasi
                                                    </p>
                                                </div>
                                            </div>
                                            {connectedBtPrinter ? (
                                                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300 bg-emerald-100 px-2.5 py-1 text-[10px] font-extrabold text-emerald-800 dark:border-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300">
                                                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                                                    Terhubung
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 rounded-full border border-stone-200 bg-stone-100 px-2.5 py-1 text-[10px] font-bold text-stone-600 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-400">
                                                    Belum Terhubung
                                                </span>
                                            )}
                                        </div>

                                        {connectedBtPrinter ? (
                                            <div className="flex flex-col justify-between gap-3 rounded-xl border border-emerald-200 bg-white p-3.5 sm:flex-row sm:items-center dark:border-emerald-800/60 dark:bg-stone-950/60">
                                                <div className="min-w-0">
                                                    <div className="flex items-center gap-1.5">
                                                        <Printer className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                                                        <span className="truncate text-sm font-black text-stone-900 dark:text-white">
                                                            {connectedBtPrinter.name}
                                                        </span>
                                                    </div>
                                                    <div className="mt-0.5 font-mono text-[11px] text-stone-500 dark:text-stone-400">
                                                        ID / MAC: {connectedBtPrinter.address}
                                                    </div>
                                                </div>
                                                <div className="flex flex-wrap items-center gap-1.5">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRunTestPrint('bluetooth')}
                                                        disabled={isBtPrinting}
                                                        className="flex cursor-pointer items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white shadow-2xs transition hover:bg-emerald-700 active:scale-95 disabled:opacity-50"
                                                    >
                                                        <Printer className="h-3.5 w-3.5" />
                                                        <span>{isBtPrinting ? 'Mencetak...' : 'Tes Cetak'}</span>
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => openBluetoothScannerModal(getSampleTestReceipt())}
                                                        className="flex cursor-pointer items-center gap-1 rounded-lg border border-stone-200 bg-stone-50 px-2.5 py-1.5 text-xs font-bold text-stone-700 transition hover:bg-stone-100 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-200"
                                                    >
                                                        <span>Ganti</span>
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={handleDisconnectBtPrinter}
                                                        className="flex cursor-pointer items-center gap-1 rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-1.5 text-xs font-bold text-rose-700 transition hover:bg-rose-100 dark:border-rose-800/60 dark:bg-rose-950/40 dark:text-rose-300"
                                                    >
                                                        <span>Putuskan</span>
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col justify-between gap-3 rounded-xl border border-dashed border-stone-300 bg-stone-50/70 p-3.5 sm:flex-row sm:items-center dark:border-stone-700 dark:bg-stone-950/40">
                                                <div className="text-xs text-stone-600 dark:text-stone-400">
                                                    Belum ada printer Bluetooth yang dipilih. Klik tombol di samping untuk memindai printer di sekitar.
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => openBluetoothScannerModal(getSampleTestReceipt())}
                                                    className="flex shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-black text-white shadow-sm transition hover:bg-emerald-700 active:scale-95"
                                                >
                                                    <Search className="h-3.5 w-3.5" />
                                                    <span>Cari Printer Bluetooth</span>
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    {/* CARD 1: FORMAT UKURAN KERTAS */}
                                    <div className="space-y-3 rounded-2xl border border-stone-200 bg-white p-5 shadow-xs dark:border-stone-800 dark:bg-stone-900">
                                        <div className="flex items-center justify-between">
                                            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300">
                                                Ukuran Kertas Thermal
                                            </h4>
                                            <span className="text-[10px] font-medium text-stone-500 dark:text-stone-400">
                                                Pilih sesuai jenis roll printer Anda
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setPrinterForm((prev) => {
                                                        const targetCols = prev.receipt_columns_58mm || 32;
                                                        return {
                                                            ...prev,
                                                            paper_width: '58mm',
                                                            receipt_columns: targetCols,
                                                            max_item_name_length: targetCols >= 38 ? 26 : Math.min(targetCols - 10, 22),
                                                            margin_horizontal: '2mm',
                                                        };
                                                    })
                                                }
                                                className={`flex cursor-pointer flex-col rounded-xl border p-3.5 text-left transition ${
                                                    printerForm.paper_width === '58mm'
                                                        ? 'border-brand-700 bg-brand-700 text-white shadow-xs'
                                                        : 'border-stone-200 bg-stone-50 text-stone-700 hover:bg-stone-100 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-200 dark:hover:bg-stone-700'
                                                }`}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <span className="text-base font-black">58 mm</span>
                                                    <span
                                                        className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${
                                                            printerForm.paper_width === '58mm'
                                                                ? 'bg-white/20 text-white'
                                                                : 'bg-stone-200 text-stone-700 dark:bg-stone-700 dark:text-stone-300'
                                                        }`}
                                                    >
                                                        Mini / Portabel
                                                    </span>
                                                </div>
                                                <p
                                                    className={`mt-1.5 text-[11px] ${
                                                        printerForm.paper_width === '58mm'
                                                            ? 'text-white/80'
                                                            : 'text-stone-500 dark:text-stone-400'
                                                    }`}
                                                >
                                                    Printer Bluetooth & Saku ({printerForm.receipt_columns_58mm || 32} Kolom)
                                                </p>
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setPrinterForm((prev) => {
                                                        const targetCols = prev.receipt_columns_80mm || 44;
                                                        return {
                                                            ...prev,
                                                            paper_width: '80mm',
                                                            receipt_columns: targetCols,
                                                            max_item_name_length: targetCols >= 44 ? 32 : 26,
                                                            margin_horizontal: '2mm',
                                                        };
                                                    })
                                                }
                                                className={`flex cursor-pointer flex-col rounded-xl border p-3.5 text-left transition ${
                                                    printerForm.paper_width === '80mm'
                                                        ? 'border-brand-700 bg-brand-700 text-white shadow-xs'
                                                        : 'border-stone-200 bg-stone-50 text-stone-700 hover:bg-stone-100 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-200 dark:hover:bg-stone-700'
                                                }`}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <span className="text-base font-black">80 mm</span>
                                                    <span
                                                        className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${
                                                            printerForm.paper_width === '80mm'
                                                                ? 'bg-white/20 text-white'
                                                                : 'bg-stone-200 text-stone-700 dark:bg-stone-700 dark:text-stone-300'
                                                        }`}
                                                    >
                                                        Standar Kasir
                                                    </span>
                                                </div>
                                                <p
                                                    className={`mt-1.5 text-[11px] ${
                                                        printerForm.paper_width === '80mm'
                                                            ? 'text-white/80'
                                                            : 'text-stone-500 dark:text-stone-400'
                                                    }`}
                                                >
                                                    Printer Kasir Desktop & USB ({printerForm.receipt_columns_80mm || 44} Kolom)
                                                </p>
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setPrinterForm((prev) => {
                                                        const customWidth = prev.custom_paper_width_mm || 76;
                                                        const customCols = prev.custom_receipt_columns || 40;
                                                        return {
                                                            ...prev,
                                                            paper_width: 'custom',
                                                            custom_paper_width_mm: customWidth,
                                                            custom_printable_width_mm: prev.custom_printable_width_mm || Math.max(24, customWidth - 6),
                                                            custom_receipt_columns: customCols,
                                                            receipt_columns: customCols,
                                                            max_item_name_length: Math.max(16, customCols - 14),
                                                            margin_horizontal: '2mm',
                                                        };
                                                    })
                                                }
                                                className={`flex cursor-pointer flex-col rounded-xl border p-3.5 text-left transition ${
                                                    printerForm.paper_width === 'custom'
                                                        ? 'border-brand-700 bg-brand-700 text-white shadow-xs'
                                                        : 'border-stone-200 bg-stone-50 text-stone-700 hover:bg-stone-100 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-200 dark:hover:bg-stone-700'
                                                }`}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <span className="text-base font-black">
                                                        {printerForm.custom_paper_width_mm || 76} mm
                                                    </span>
                                                    <span
                                                        className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${
                                                            printerForm.paper_width === 'custom'
                                                                ? 'bg-white/20 text-white'
                                                                : 'bg-stone-200 text-stone-700 dark:bg-stone-700 dark:text-stone-300'
                                                        }`}
                                                    >
                                                        Kustom Bebas
                                                    </span>
                                                </div>
                                                <p
                                                    className={`mt-1.5 text-[11px] ${
                                                        printerForm.paper_width === 'custom'
                                                            ? 'text-white/80'
                                                            : 'text-stone-500 dark:text-stone-400'
                                                    }`}
                                                >
                                                    USB / Dot Matrix / Kertas Lain ({printerForm.custom_receipt_columns || 40} Kolom)
                                                </p>
                                            </button>
                                        </div>

                                        {/* PANEL KUSTOM UKURAN KERTAS (TAMPIL JIKA CUSTOM DIPILIH) */}
                                        {printerForm.paper_width === 'custom' && (
                                            <div className="mt-4 space-y-4 rounded-xl border border-brand-300 bg-brand-50/50 p-4 dark:border-brand-800/80 dark:bg-brand-950/20">
                                                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-brand-200/60 pb-3 dark:border-brand-800/60">
                                                    <div className="flex items-center gap-2">
                                                        <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-brand-700 text-xs font-bold text-white shadow-2xs">
                                                            ⚙️
                                                        </span>
                                                        <h5 className="text-xs font-bold text-brand-950 dark:text-brand-200">
                                                            Konfigurasi Dimensi Kertas Kustom untuk Printer USB
                                                        </h5>
                                                    </div>
                                                    <span className="rounded-full bg-brand-200/70 px-2.5 py-0.5 text-[10px] font-bold text-brand-900 dark:bg-brand-900/60 dark:text-brand-300">
                                                        Ukuran Aktif: {printerForm.custom_paper_width_mm || 76} mm ({printerForm.custom_receipt_columns || 40} Kolom)
                                                    </span>
                                                </div>

                                                {/* Pilihan Cepat / Preset Ukuran Populer */}
                                                <div>
                                                    <label className="text-[11px] font-bold text-stone-700 dark:text-stone-300">
                                                        Pilihan Cepat Ukuran Thermal (Presets):
                                                    </label>
                                                    <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
                                                        {[
                                                            { width: 50, printable: 44, cols: 28, label: '50 mm', desc: 'EDC / SPBU Mini' },
                                                            { width: 57, printable: 48, cols: 30, label: '57 mm', desc: 'Mini POS USB' },
                                                            { width: 70, printable: 64, cols: 36, label: '70 mm', desc: 'Thermal Medium' },
                                                            { width: 76, printable: 70, cols: 40, label: '76 mm (3")', desc: 'Epson TM-U220 / Kasir' },
                                                            { width: 82, printable: 76, cols: 44, label: '82 mm', desc: 'Thermal Lebar' },
                                                            { width: 85, printable: 80, cols: 46, label: '85 mm', desc: 'POS Roll Lebar' },
                                                            { width: 100, printable: 92, cols: 52, label: '100 mm', desc: 'Resi / Barcode' },
                                                            { width: 112, printable: 104, cols: 58, label: '112 mm', desc: 'Thermal A6 / Resi' },
                                                        ].map((preset) => {
                                                            const isSelected = (printerForm.custom_paper_width_mm || 76) === preset.width;
                                                            return (
                                                                <button
                                                                    key={preset.width}
                                                                    type="button"
                                                                    onClick={() => {
                                                                        setPrinterForm((prev) => ({
                                                                            ...prev,
                                                                            custom_paper_width_mm: preset.width,
                                                                            custom_printable_width_mm: preset.printable,
                                                                            custom_receipt_columns: preset.cols,
                                                                            receipt_columns: preset.cols,
                                                                            max_item_name_length: Math.max(16, preset.cols - 14),
                                                                        }));
                                                                    }}
                                                                    className={`cursor-pointer rounded-lg border p-2 text-left transition ${
                                                                        isSelected
                                                                            ? 'border-brand-700 bg-brand-700 text-white shadow-2xs font-bold'
                                                                            : 'border-stone-200 bg-white text-stone-700 hover:border-brand-300 hover:bg-stone-50 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-300 dark:hover:bg-stone-700'
                                                                    }`}
                                                                >
                                                                    <div className="flex items-center justify-between">
                                                                        <span className="text-xs font-bold">{preset.label}</span>
                                                                        <span className={`text-[9.5px] ${isSelected ? 'text-white/80' : 'text-stone-400'}`}>
                                                                            {preset.cols} col
                                                                        </span>
                                                                    </div>
                                                                    <div className={`mt-0.5 text-[9.5px] ${isSelected ? 'text-white/85' : 'text-stone-500 dark:text-stone-400'}`}>
                                                                        {preset.desc}
                                                                    </div>
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
                                                </div>

                                                {/* Form Input Manual Dimensi Kustom */}
                                                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 pt-1">
                                                    <div>
                                                        <label className="text-[11px] font-bold text-stone-700 dark:text-stone-300">
                                                            Lebar Roll Kertas Fisik (mm):
                                                        </label>
                                                        <div className="mt-1 flex items-center rounded-lg border border-stone-200 bg-white px-2.5 py-1.5 focus-within:border-brand-600 dark:border-stone-700 dark:bg-stone-800">
                                                            <input
                                                                type="number"
                                                                min="30"
                                                                max="120"
                                                                value={printerForm.custom_paper_width_mm || 76}
                                                                onChange={(e) => {
                                                                    const val = Math.max(30, Math.min(120, Number(e.target.value) || 76));
                                                                    setPrinterForm((prev) => ({
                                                                        ...prev,
                                                                        custom_paper_width_mm: val,
                                                                        custom_printable_width_mm: Math.min(prev.custom_printable_width_mm || (val - 6), val),
                                                                    }));
                                                                }}
                                                                className="w-full bg-transparent text-xs font-bold text-stone-900 focus:outline-none dark:text-white"
                                                            />
                                                            <span className="text-[10px] font-bold text-stone-400">mm</span>
                                                        </div>
                                                        <p className="mt-1 text-[10px] text-stone-500 dark:text-stone-400">
                                                            Rentang: 30 mm – 120 mm
                                                        </p>
                                                    </div>

                                                    <div>
                                                        <label className="text-[11px] font-bold text-stone-700 dark:text-stone-300">
                                                            Lebar Area Cetak Efektif (mm):
                                                        </label>
                                                        <div className="mt-1 flex items-center rounded-lg border border-stone-200 bg-white px-2.5 py-1.5 focus-within:border-brand-600 dark:border-stone-700 dark:bg-stone-800">
                                                            <input
                                                                type="number"
                                                                min="24"
                                                                max={printerForm.custom_paper_width_mm || 116}
                                                                value={printerForm.custom_printable_width_mm || Math.max(24, (printerForm.custom_paper_width_mm || 76) - 6)}
                                                                onChange={(e) => {
                                                                    const maxAllowed = printerForm.custom_paper_width_mm || 116;
                                                                    const val = Math.max(24, Math.min(maxAllowed, Number(e.target.value) || (maxAllowed - 6)));
                                                                    setPrinterForm((prev) => ({
                                                                        ...prev,
                                                                        custom_printable_width_mm: val,
                                                                    }));
                                                                }}
                                                                className="w-full bg-transparent text-xs font-bold text-stone-900 focus:outline-none dark:text-white"
                                                            />
                                                            <span className="text-[10px] font-bold text-stone-400">mm</span>
                                                        </div>
                                                        <p className="mt-1 text-[10px] text-stone-500 dark:text-stone-400">
                                                            Area cetak tanpa margin samping
                                                        </p>
                                                    </div>

                                                    <div>
                                                        <label className="text-[11px] font-bold text-stone-700 dark:text-stone-300">
                                                            Jumlah Kolom per Baris (Chars):
                                                        </label>
                                                        <div className="mt-1 flex items-center rounded-lg border border-stone-200 bg-white px-2.5 py-1.5 focus-within:border-brand-600 dark:border-stone-700 dark:bg-stone-800">
                                                            <input
                                                                type="number"
                                                                min="20"
                                                                max="64"
                                                                value={printerForm.custom_receipt_columns || 40}
                                                                onChange={(e) => {
                                                                    const val = Math.max(20, Math.min(64, Number(e.target.value) || 40));
                                                                    setPrinterForm((prev) => ({
                                                                        ...prev,
                                                                        custom_receipt_columns: val,
                                                                        receipt_columns: val,
                                                                        max_item_name_length: Math.max(16, val - 14),
                                                                    }));
                                                                }}
                                                                className="w-full bg-transparent text-xs font-bold text-stone-900 focus:outline-none dark:text-white"
                                                            />
                                                            <span className="text-[10px] font-bold text-stone-400">kolom</span>
                                                        </div>
                                                        <p className="mt-1 text-[10px] text-stone-500 dark:text-stone-400">
                                                            Karakter per baris font standar
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* CARD 1.5: PENGATURAN JUMLAH KOLOM STRUK (58mm & 80mm) */}
                                    <div className="space-y-4 rounded-2xl border border-stone-200 bg-white p-5 shadow-xs dark:border-stone-800 dark:bg-stone-900">
                                        <div className="flex flex-wrap items-center justify-between gap-2">
                                            <div className="flex items-center gap-2">
                                                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                                                    <Columns className="h-4 w-4" />
                                                </div>
                                                <div>
                                                    <h4 className="text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300">
                                                        Pengaturan Kolom Struk (Receipt Columns)
                                                    </h4>
                                                    <p className="text-[11px] text-stone-500 dark:text-stone-400">
                                                        Atur jumlah karakter per baris untuk kertas 58 mm dan 80 mm agar hasil cetak pas dan rapi
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-800 border border-emerald-200 dark:bg-emerald-950/60 dark:border-emerald-800 dark:text-emerald-300">
                                                <span>Aktif Saat Ini:</span>
                                                <span className="font-black underline">{printerForm.receipt_columns || (printerForm.paper_width === '80mm' ? printerForm.receipt_columns_80mm || 44 : printerForm.receipt_columns_58mm || 32)} Kolom</span>
                                                <span>({printerForm.paper_width})</span>
                                            </div>
                                        </div>

                                        {/* Section 1: Kolom untuk Kertas 58 mm */}
                                        <div className={`rounded-xl border p-3.5 transition ${
                                            printerForm.paper_width === '58mm'
                                                ? 'border-brand-300 bg-brand-50/40 dark:border-brand-800 dark:bg-brand-950/20'
                                                : 'border-stone-200 bg-stone-50/60 dark:border-stone-800 dark:bg-stone-800/40'
                                        }`}>
                                            <div className="flex flex-wrap items-center justify-between gap-1.5">
                                                <div className="flex items-center gap-2">
                                                    <span className="rounded-md bg-stone-200 px-2 py-0.5 text-[10px] font-black text-stone-800 dark:bg-stone-700 dark:text-stone-200">
                                                        58 MM
                                                    </span>
                                                    <span className="text-xs font-bold text-stone-800 dark:text-stone-200">
                                                        Kertas 58 mm (Printer Mini & Bluetooth Portable)
                                                    </span>
                                                </div>
                                                <span className="text-[11px] font-bold text-brand-700 dark:text-brand-400">
                                                    Tersimpan: {printerForm.receipt_columns_58mm || 32} Karakter
                                                </span>
                                            </div>

                                            <p className="mt-1 text-[11px] text-stone-500 dark:text-stone-400">
                                                Standar printer 58mm adalah 32 karakter (Font A). Jika teks terpotong di tepi kanan kertas fisik, pilih 30 atau 28 kolom.
                                            </p>

                                            {/* Preset Buttons for 58mm */}
                                            <div className="mt-2.5 grid grid-cols-2 gap-1.5 sm:grid-cols-5">
                                                {[
                                                    { cols: 28, label: '28 Kolom', sub: 'Margin Lebar' },
                                                    { cols: 30, label: '30 Kolom', sub: 'Rapat Rapi' },
                                                    { cols: 32, label: '32 Kolom', sub: 'Standar Font A' },
                                                    { cols: 36, label: '36 Kolom', sub: 'Padat' },
                                                    { cols: 40, label: '40 Kolom', sub: 'Font B Mini' },
                                                ].map((p) => {
                                                    const isSelected = (printerForm.receipt_columns_58mm || 32) === p.cols;
                                                    return (
                                                        <button
                                                            key={p.cols}
                                                            type="button"
                                                            onClick={() =>
                                                                setPrinterForm((prev) => ({
                                                                    ...prev,
                                                                    receipt_columns_58mm: p.cols,
                                                                    receipt_columns: prev.paper_width === '58mm' ? p.cols : prev.receipt_columns,
                                                                    max_item_name_length: p.cols >= 38 ? 26 : Math.min(p.cols - 10, 22),
                                                                }))
                                                            }
                                                            className={`cursor-pointer rounded-lg border p-2 text-center transition ${
                                                                isSelected
                                                                    ? 'border-brand-700 bg-brand-700 text-white shadow-2xs font-bold'
                                                                    : 'border-stone-200 bg-white text-stone-700 hover:bg-stone-100 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-300 dark:hover:bg-stone-700'
                                                            }`}
                                                        >
                                                            <div className="text-xs font-bold">{p.label}</div>
                                                            <div className={`text-[9.5px] mt-0.5 ${isSelected ? 'text-white/80' : 'text-stone-400'}`}>
                                                                {p.sub}
                                                            </div>
                                                        </button>
                                                    );
                                                })}
                                            </div>

                                            {/* Custom Input for 58mm */}
                                            <div className="mt-2.5 flex items-center gap-2 pt-2 border-t border-stone-200/60 dark:border-stone-700/60">
                                                <label className="text-[11px] font-semibold text-stone-600 dark:text-stone-400 whitespace-nowrap">
                                                    Kustom Kolom 58mm:
                                                </label>
                                                <input
                                                    type="number"
                                                    min="24"
                                                    max="44"
                                                    value={printerForm.receipt_columns_58mm || 32}
                                                    onChange={(e) => {
                                                        const val = Math.max(20, Math.min(48, Number(e.target.value) || 32));
                                                        setPrinterForm((prev) => ({
                                                            ...prev,
                                                            receipt_columns_58mm: val,
                                                            receipt_columns: prev.paper_width === '58mm' ? val : prev.receipt_columns,
                                                            max_item_name_length: val >= 38 ? 26 : Math.min(val - 10, 22),
                                                        }));
                                                    }}
                                                    className="w-20 rounded-lg border border-stone-200 bg-white px-2 py-1 text-center text-xs font-bold text-stone-900 focus:border-brand-600 focus:outline-none dark:border-stone-700 dark:bg-stone-800 dark:text-white"
                                                />
                                                <span className="text-[11px] text-stone-500 dark:text-stone-400">
                                                    karakter per baris (rentang 24 - 44)
                                                </span>
                                            </div>
                                        </div>

                                        {/* Section 2: Kolom untuk Kertas 80 mm */}
                                        <div className={`rounded-xl border p-3.5 transition ${
                                            printerForm.paper_width === '80mm'
                                                ? 'border-brand-300 bg-brand-50/40 dark:border-brand-800 dark:bg-brand-950/20'
                                                : 'border-stone-200 bg-stone-50/60 dark:border-stone-800 dark:bg-stone-800/40'
                                        }`}>
                                            <div className="flex flex-wrap items-center justify-between gap-1.5">
                                                <div className="flex items-center gap-2">
                                                    <span className="rounded-md bg-stone-200 px-2 py-0.5 text-[10px] font-black text-stone-800 dark:bg-stone-700 dark:text-stone-200">
                                                        80 MM
                                                    </span>
                                                    <span className="text-xs font-bold text-stone-800 dark:text-stone-200">
                                                        Kertas 80 mm (Printer Desktop & Kasir POS80)
                                                    </span>
                                                </div>
                                                <span className="text-[11px] font-bold text-brand-700 dark:text-brand-400">
                                                    Tersimpan: {printerForm.receipt_columns_80mm || 44} Karakter
                                                </span>
                                            </div>

                                            <p className="mt-1 text-[11px] text-stone-500 dark:text-stone-400">
                                                Standar printer desktop 80mm adalah 42-44 kolom (Font A) atau 48-56 kolom untuk format padat.
                                            </p>

                                            {/* Preset Buttons for 80mm */}
                                            <div className="mt-2.5 grid grid-cols-2 gap-1.5 sm:grid-cols-5">
                                                {[
                                                    { cols: 40, label: '40 Kolom', sub: 'Renggang / Besar' },
                                                    { cols: 42, label: '42 Kolom', sub: 'Epson / Star TM' },
                                                    { cols: 44, label: '44 Kolom', sub: 'Standar POS80' },
                                                    { cols: 48, label: '48 Kolom', sub: 'Maksimal Rapi' },
                                                    { cols: 56, label: '56 Kolom', sub: 'Font B Padat' },
                                                ].map((p) => {
                                                    const isSelected = (printerForm.receipt_columns_80mm || 44) === p.cols;
                                                    return (
                                                        <button
                                                            key={p.cols}
                                                            type="button"
                                                            onClick={() =>
                                                                setPrinterForm((prev) => ({
                                                                    ...prev,
                                                                    receipt_columns_80mm: p.cols,
                                                                    receipt_columns: prev.paper_width === '80mm' ? p.cols : prev.receipt_columns,
                                                                    max_item_name_length: p.cols >= 44 ? 32 : 26,
                                                                }))
                                                            }
                                                            className={`cursor-pointer rounded-lg border p-2 text-center transition ${
                                                                isSelected
                                                                    ? 'border-brand-700 bg-brand-700 text-white shadow-2xs font-bold'
                                                                    : 'border-stone-200 bg-white text-stone-700 hover:bg-stone-100 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-300 dark:hover:bg-stone-700'
                                                            }`}
                                                        >
                                                            <div className="text-xs font-bold">{p.label}</div>
                                                            <div className={`text-[9.5px] mt-0.5 ${isSelected ? 'text-white/80' : 'text-stone-400'}`}>
                                                                {p.sub}
                                                            </div>
                                                        </button>
                                                    );
                                                })}
                                            </div>

                                            {/* Custom Input for 80mm */}
                                            <div className="mt-2.5 flex items-center gap-2 pt-2 border-t border-stone-200/60 dark:border-stone-700/60">
                                                <label className="text-[11px] font-semibold text-stone-600 dark:text-stone-400 whitespace-nowrap">
                                                    Kustom Kolom 80mm:
                                                </label>
                                                <input
                                                    type="number"
                                                    min="36"
                                                    max="64"
                                                    value={printerForm.receipt_columns_80mm || 44}
                                                    onChange={(e) => {
                                                        const val = Math.max(30, Math.min(72, Number(e.target.value) || 44));
                                                        setPrinterForm((prev) => ({
                                                            ...prev,
                                                            receipt_columns_80mm: val,
                                                            receipt_columns: prev.paper_width === '80mm' ? val : prev.receipt_columns,
                                                            max_item_name_length: val >= 44 ? 32 : 26,
                                                        }));
                                                    }}
                                                    className="w-20 rounded-lg border border-stone-200 bg-white px-2 py-1 text-center text-xs font-bold text-stone-900 focus:border-brand-600 focus:outline-none dark:border-stone-700 dark:bg-stone-800 dark:text-white"
                                                />
                                                <span className="text-[11px] text-stone-500 dark:text-stone-400">
                                                    karakter per baris (rentang 36 - 64)
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* CARD: TIPOGRAFI & GAYA FONT STRUK */}
                                    <div className="space-y-4 rounded-2xl border border-stone-200 bg-white p-5 shadow-xs dark:border-stone-800 dark:bg-stone-900">
                                        <div className="flex items-center justify-between">
                                            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300">
                                                Tipografi & Gaya Font Struk
                                            </h4>
                                            <span className="rounded-full bg-brand-50 px-2.5 py-0.5 text-[10px] font-bold text-brand-700 dark:bg-brand-950/40 dark:text-brand-300">
                                                {printerForm.font_family === 'sans-serif' ? '✨ Modern Clean Aktif' : 'Monospace Klasik'}
                                            </span>
                                        </div>

                                        {/* Pilihan Font Family */}
                                        <div className="space-y-2">
                                            <label className="text-[11px] font-semibold text-stone-600 dark:text-stone-400">
                                                Pilihan Jenis Font:
                                            </label>
                                            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                                                {[
                                                    { id: 'sans-serif', label: 'Modern Sans-Serif', sub: 'Elegan, Bersih & Tajam (Rekomendasi)' },
                                                    { id: 'consolas', label: 'Consolas Monospace', sub: 'Retro Mesin Kasir Minimarket' },
                                                    { id: 'courier', label: 'Courier New', sub: 'Mesin Tik Klasik' },
                                                ].map((f) => {
                                                    const isSelected = (printerForm.font_family || 'sans-serif') === f.id;
                                                    return (
                                                        <button
                                                            key={f.id}
                                                            type="button"
                                                            onClick={() =>
                                                                setPrinterForm((prev) => ({
                                                                    ...prev,
                                                                    font_family: f.id as any,
                                                                }))
                                                            }
                                                            className={`cursor-pointer rounded-xl border p-3 text-left transition ${
                                                                isSelected
                                                                    ? 'border-brand-700 bg-brand-700 text-white shadow-2xs font-bold'
                                                                    : 'border-stone-200 bg-stone-50 text-stone-700 hover:bg-stone-100 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-300 dark:hover:bg-stone-700'
                                                            }`}
                                                        >
                                                            <div className="text-xs font-bold">{f.label}</div>
                                                            <div className={`mt-0.5 text-[10px] ${isSelected ? 'text-white/80' : 'text-stone-400'}`}>
                                                                {f.sub}
                                                            </div>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        {/* Pilihan Format Desain & Ketebalan */}
                                        <div className="grid grid-cols-1 gap-3 pt-1 sm:grid-cols-2">
                                            <div className="space-y-1.5">
                                                <label className="text-[11px] font-semibold text-stone-600 dark:text-stone-400">
                                                    Format Tampilan Cetak:
                                                </label>
                                                <div className="grid grid-cols-2 gap-1.5">
                                                    {[
                                                        { id: 'formatted', label: 'Grafis Modern', sub: 'Tabel & Angka Rapi' },
                                                        { id: 'plain', label: 'Tanpa Formatting', sub: 'Teks Polos Kasar' },
                                                    ].map((fmt) => {
                                                        const isSelected = (printerForm.formatting || 'formatted') === fmt.id;
                                                        return (
                                                            <button
                                                                key={fmt.id}
                                                                type="button"
                                                                onClick={() =>
                                                                    setPrinterForm((prev) => ({
                                                                        ...prev,
                                                                        formatting: fmt.id as any,
                                                                    }))
                                                                }
                                                                className={`cursor-pointer rounded-lg border p-2 text-center transition ${
                                                                    isSelected
                                                                        ? 'border-brand-700 bg-brand-700 text-white shadow-2xs font-bold'
                                                                        : 'border-stone-200 bg-stone-50 text-stone-700 hover:bg-stone-100 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-300 dark:hover:bg-stone-700'
                                                                }`}
                                                            >
                                                                <div className="text-xs font-bold">{fmt.label}</div>
                                                                <div className={`mt-0.5 text-[9.5px] ${isSelected ? 'text-white/80' : 'text-stone-400'}`}>
                                                                    {fmt.sub}
                                                                </div>
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </div>

                                            <div className="space-y-1.5">
                                                <label className="text-[11px] font-semibold text-stone-600 dark:text-stone-400">
                                                    Ketebalan Tulisan (Thermal):
                                                </label>
                                                <div className="grid grid-cols-2 gap-1.5">
                                                    {[
                                                        { id: 'bold', label: 'Tebal (Bold)', sub: 'Pekat & Anti-Pudar' },
                                                        { id: 'normal', label: 'Normal', sub: 'Garis Lebih Halus' },
                                                    ].map((w) => {
                                                        const isSelected = (printerForm.font_weight || 'bold') === w.id;
                                                        return (
                                                            <button
                                                                key={w.id}
                                                                type="button"
                                                                onClick={() =>
                                                                    setPrinterForm((prev) => ({
                                                                        ...prev,
                                                                        font_weight: w.id as any,
                                                                    }))
                                                                }
                                                                className={`cursor-pointer rounded-lg border p-2 text-center transition ${
                                                                    isSelected
                                                                        ? 'border-brand-700 bg-brand-700 text-white shadow-2xs font-bold'
                                                                        : 'border-stone-200 bg-stone-50 text-stone-700 hover:bg-stone-100 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-300 dark:hover:bg-stone-700'
                                                                }`}
                                                            >
                                                                <div className="text-xs font-bold">{w.label}</div>
                                                                <div className={`mt-0.5 text-[9.5px] ${isSelected ? 'text-white/80' : 'text-stone-400'}`}>
                                                                    {w.sub}
                                                                </div>
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* CARD 2: OPSI CETAK STRUK */}
                                    <div className="space-y-3 rounded-2xl border border-stone-200 bg-white p-5 shadow-xs dark:border-stone-800 dark:bg-stone-900">
                                        <h4 className="text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300">
                                            Opsi Cetak & Hardware Kasir
                                        </h4>

                                        <div className="space-y-3 text-xs divide-y divide-stone-100 dark:divide-stone-800">
                                            <div className="flex items-center justify-between pt-1">
                                                <div>
                                                    <div className="font-semibold text-stone-800 dark:text-stone-200">
                                                        Cetak Otomatis Struk
                                                    </div>
                                                    <div className="text-[11px] text-stone-500 dark:text-stone-400">
                                                        Buka cetak otomatis langsung setiap selesai pembayaran
                                                    </div>
                                                </div>
                                                <input
                                                    type="checkbox"
                                                    checked={printerForm.auto_print}
                                                    onChange={(e) =>
                                                        setPrinterForm((prev) => ({
                                                            ...prev,
                                                            auto_print: e.target.checked,
                                                        }))
                                                    }
                                                    className="h-4 w-4 cursor-pointer rounded text-brand-700 accent-brand-700"
                                                />
                                            </div>

                                            <div className="flex items-center justify-between pt-3">
                                                <div>
                                                    <div className="font-semibold text-stone-800 dark:text-stone-200">
                                                        Buka Laci Uang (Cash Drawer)
                                                    </div>
                                                    <div className="text-[11px] text-stone-500 dark:text-stone-400">
                                                        Kirim sinyal pulse pembuka laci otomatis saat pembayaran tunai
                                                    </div>
                                                </div>
                                                <input
                                                    type="checkbox"
                                                    checked={Boolean(printerForm.open_cash_drawer)}
                                                    onChange={(e) =>
                                                        setPrinterForm((prev) => ({
                                                            ...prev,
                                                            open_cash_drawer: e.target.checked,
                                                        }))
                                                    }
                                                    className="h-4 w-4 cursor-pointer rounded text-brand-700 accent-brand-700"
                                                />
                                            </div>

                                            <div className="flex items-center justify-between pt-3">
                                                <div>
                                                    <div className="font-semibold text-stone-800 dark:text-stone-200">
                                                        Tampilkan Logo Brand Toko
                                                    </div>
                                                    <div className="text-[11px] text-stone-500 dark:text-stone-400">
                                                        Cetak logo Sanubari di bagian paling atas struk
                                                    </div>
                                                </div>
                                                <input
                                                    type="checkbox"
                                                    checked={printerForm.show_logo !== false}
                                                    onChange={(e) =>
                                                        setPrinterForm((prev) => ({
                                                            ...prev,
                                                            show_logo: e.target.checked,
                                                        }))
                                                    }
                                                    className="h-4 w-4 cursor-pointer rounded text-brand-700 accent-brand-700"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* CARD 3: IDENTITAS & TEKS STRUK */}
                                    <div className="space-y-3.5 rounded-2xl border border-stone-200 bg-white p-5 text-xs shadow-xs dark:border-stone-800 dark:bg-stone-900">
                                        <h4 className="text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300">
                                            Informasi Toko pada Struk
                                        </h4>

                                        <div>
                                            <label className="text-[11px] font-medium text-stone-500 dark:text-stone-400">
                                                Nama Toko:
                                            </label>
                                            <input
                                                type="text"
                                                value={printerForm.store_name}
                                                onChange={(e) =>
                                                    setPrinterForm((prev) => ({
                                                        ...prev,
                                                        store_name: e.target.value,
                                                    }))
                                                }
                                                className="mt-1 w-full rounded-xl border border-stone-200 bg-stone-50 p-2.5 font-bold text-stone-900 outline-none focus:border-brand-600 focus:bg-white dark:border-stone-700 dark:bg-stone-800 dark:text-white dark:focus:bg-stone-700"
                                            />
                                        </div>

                                        <div>
                                            <label className="text-[11px] font-medium text-stone-500 dark:text-stone-400">
                                                Tagline / Slogan:
                                            </label>
                                            <input
                                                type="text"
                                                value={printerForm.tagline || ''}
                                                onChange={(e) =>
                                                    setPrinterForm((prev) => ({
                                                        ...prev,
                                                        tagline: e.target.value,
                                                    }))
                                                }
                                                placeholder="Contoh: Close to Your Every Brew"
                                                className="mt-1 w-full rounded-xl border border-stone-200 bg-stone-50 p-2.5 text-stone-900 outline-none focus:border-brand-600 focus:bg-white dark:border-stone-700 dark:bg-stone-800 dark:text-white dark:focus:bg-stone-700"
                                            />
                                        </div>

                                        <div>
                                            <label className="text-[11px] font-medium text-stone-500 dark:text-stone-400">
                                                Alamat Toko:
                                            </label>
                                            <input
                                                type="text"
                                                value={printerForm.address || ''}
                                                onChange={(e) =>
                                                    setPrinterForm((prev) => ({
                                                        ...prev,
                                                        address: e.target.value,
                                                    }))
                                                }
                                                className="mt-1 w-full rounded-xl border border-stone-200 bg-stone-50 p-2.5 text-stone-900 outline-none focus:border-brand-600 focus:bg-white dark:border-stone-700 dark:bg-stone-800 dark:text-white dark:focus:bg-stone-700"
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-2">
                                            <div>
                                                <label className="text-[11px] font-medium text-stone-500 dark:text-stone-400">
                                                    No. Telp / WhatsApp:
                                                </label>
                                                <input
                                                    type="text"
                                                    value={printerForm.phone || ''}
                                                    onChange={(e) =>
                                                        setPrinterForm((prev) => ({
                                                            ...prev,
                                                            phone: e.target.value,
                                                        }))
                                                    }
                                                    className="mt-1 w-full rounded-xl border border-stone-200 bg-stone-50 p-2.5 text-stone-900 outline-none focus:border-brand-600 focus:bg-white dark:border-stone-700 dark:bg-stone-800 dark:text-white dark:focus:bg-stone-700"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-[11px] font-medium text-stone-500 dark:text-stone-400">
                                                    Instagram:
                                                </label>
                                                <input
                                                    type="text"
                                                    value={printerForm.instagram || ''}
                                                    onChange={(e) =>
                                                        setPrinterForm((prev) => ({
                                                            ...prev,
                                                            instagram: e.target.value,
                                                        }))
                                                    }
                                                    className="mt-1 w-full rounded-xl border border-stone-200 bg-stone-50 p-2.5 text-stone-900 outline-none focus:border-brand-600 focus:bg-white dark:border-stone-700 dark:bg-stone-800 dark:text-white dark:focus:bg-stone-700"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="text-[11px] font-medium text-stone-500 dark:text-stone-400">
                                                Pesan Footer Struk:
                                            </label>
                                            <textarea
                                                rows={2}
                                                value={printerForm.receipt_footer || ''}
                                                onChange={(e) =>
                                                    setPrinterForm((prev) => ({
                                                        ...prev,
                                                        receipt_footer: e.target.value,
                                                    }))
                                                }
                                                placeholder="Contoh: Terima kasih atas pesanannya!"
                                                className="mt-1 w-full resize-none rounded-xl border border-stone-200 bg-stone-50 p-2.5 text-stone-900 outline-none focus:border-brand-600 focus:bg-white dark:border-stone-700 dark:bg-stone-800 dark:text-white dark:focus:bg-stone-700"
                                            />
                                        </div>
                                    </div>

                                    {/* CARD 4: UJI COBA & RESET */}
                                    <div className="space-y-3 rounded-2xl border border-stone-200 bg-white p-5 text-xs shadow-xs dark:border-stone-800 dark:bg-stone-900">
                                        <div className="flex items-center justify-between">
                                            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300">
                                                Uji Coba & Bantuan
                                            </h4>
                                            <button
                                                type="button"
                                                onClick={handleResetPrinterDefaults}
                                                className="cursor-pointer text-[11px] text-stone-400 hover:text-stone-600 dark:hover:text-stone-300"
                                            >
                                                Reset ke Standar
                                            </button>
                                        </div>

                                        <div className={`grid grid-cols-1 ${isMobilePos ? 'sm:grid-cols-2' : 'sm:grid-cols-3'} gap-2`}>
                                            <button
                                                type="button"
                                                onClick={() => handlePreviewReceipt()}
                                                className="flex cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-emerald-300 bg-emerald-50 p-2.5 text-xs font-bold text-emerald-800 shadow-2xs hover:bg-emerald-100 transition dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 dark:hover:bg-emerald-900/60"
                                            >
                                                <Eye className="h-4 w-4" />
                                                <span>Preview di POS</span>
                                            </button>

                                            {!isMobilePos && (
                                                <button
                                                    type="button"
                                                    onClick={() => handleRunTestPrint('web')}
                                                    className="hidden md:flex cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-stone-200 bg-white p-2.5 text-xs font-bold text-stone-700 shadow-2xs hover:bg-stone-50 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-200 dark:hover:bg-stone-700"
                                                >
                                                    <Printer className="h-4 w-4 text-brand-700 dark:text-emerald-400" />
                                                    <span>Tes Fisik USB</span>
                                                </button>
                                            )}

                                            <button
                                                type="button"
                                                onClick={() => handleRunTestPrint('bluetooth')}
                                                className="flex cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-stone-200 bg-white p-2.5 text-xs font-bold text-stone-700 shadow-2xs hover:bg-stone-50 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-200 dark:hover:bg-stone-700"
                                            >
                                                <Smartphone className="h-4 w-4 text-brand-700 dark:text-emerald-400" />
                                                <span>Tes Bluetooth</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* KOLOM KANAN: LIVE PREVIEW STRUK DI APLIKASI (5 COLS) */}
                                <div className="space-y-3 lg:col-span-5 lg:sticky lg:top-24">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300">
                                                Pratinjau Struk
                                            </h4>
                                            <span className="rounded-full bg-brand-100 px-2 py-0.5 text-[10px] font-bold text-brand-800 dark:bg-brand-950/60 dark:text-amber-300">
                                                Live {printerForm.paper_width}
                                            </span>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => handlePreviewReceipt()}
                                            className="flex cursor-pointer items-center gap-1 text-[11px] font-bold text-brand-700 hover:underline dark:text-amber-400"
                                        >
                                            <Eye className="h-3.5 w-3.5" />
                                            <span>Layar Penuh</span>
                                        </button>
                                    </div>

                                    <div className="flex flex-col items-center rounded-2xl border border-stone-200 bg-stone-100/80 p-4 shadow-inner dark:border-stone-800 dark:bg-stone-950/60">
                                        <ThermalReceiptPreview
                                            receipt={getSampleTestReceipt()}
                                            paperWidth={printerForm.paper_width}
                                            customPaperWidthMm={printerForm.custom_paper_width_mm}
                                            receiptColumns={printerForm.receipt_columns || (printerForm.paper_width === '80mm' ? printerForm.receipt_columns_80mm || 44 : printerForm.paper_width === 'custom' ? printerForm.custom_receipt_columns || 40 : printerForm.receipt_columns_58mm || 32)}
                                            showLogo={printerForm.show_logo !== false}
                                            fontFamily={printerForm.font_family}
                                            fontSize={printerForm.font_size}
                                            fontWeight={printerForm.font_weight}
                                        />

                                        <div className="mt-4 flex w-full max-w-[280px] gap-2">
                                            <button
                                                type="button"
                                                onClick={() => handlePreviewReceipt()}
                                                className="flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-emerald-300 bg-emerald-600 px-3 py-2 text-xs font-bold text-white shadow-2xs transition hover:bg-emerald-700 active:scale-95"
                                            >
                                                <Eye className="h-3.5 w-3.5" />
                                                <span>Buka Preview</span>
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleRunTestPrint('web')}
                                                className="flex cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-stone-300 bg-white px-3 py-2 text-xs font-bold text-stone-800 shadow-2xs transition hover:bg-stone-50 active:scale-95 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-100 dark:hover:bg-stone-700"
                                                title="Cetak langsung ke printer fisik"
                                            >
                                                <Printer className="h-3.5 w-3.5" />
                                                <span>Cetak</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* SUBTAB B: METODE PEMBAYARAN */}
                    {settingsSubTab === 'payment' && (
                        <div className="space-y-6">
                            <div className="flex justify-end">
                                <button
                                    type="button"
                                    onClick={handleSavePaymentSettings}
                                    className="flex cursor-pointer items-center gap-1.5 rounded-xl bg-brand-700 px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-brand-800 active:scale-95"
                                >
                                    <Save className="h-4 w-4" />
                                    <span>Simpan Pengaturan Pembayaran</span>
                                </button>
                            </div>

                            <div className="space-y-4 rounded-2xl border border-stone-200 bg-white p-5 shadow-xs dark:border-stone-800 dark:bg-stone-900">
                                <h3 className="text-sm font-bold text-brand-950 dark:text-white">
                                    Metode Pembayaran yang Aktif di Kasir
                                </h3>

                                <div className="space-y-3">
                                    <label className="flex cursor-pointer items-center justify-between rounded-xl border border-stone-200 bg-stone-50 p-3.5 transition hover:bg-stone-100/70 dark:border-stone-700 dark:bg-stone-800 dark:hover:bg-stone-700">
                                        <div className="flex items-center gap-3">
                                            <Banknote className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                                            <div>
                                                <div className="text-xs font-bold text-stone-900 dark:text-white">
                                                    Uang Tunai (Cash)
                                                </div>
                                                <div className="text-[11px] text-stone-500 dark:text-stone-300">
                                                    Pembayaran tunai dengan
                                                    kalkulator uang kembalian
                                                </div>
                                            </div>
                                        </div>
                                        <input
                                            type="checkbox"
                                            checked={paymentForm.enable_cash}
                                            onChange={(e) =>
                                                setPaymentForm((prev) => ({
                                                    ...prev,
                                                    enable_cash:
                                                        e.target.checked,
                                                }))
                                            }
                                            className="h-5 w-5 cursor-pointer rounded text-brand-700 accent-brand-700"
                                        />
                                    </label>

                                    <label className="flex cursor-pointer items-center justify-between rounded-xl border border-stone-200 bg-stone-50 p-3.5 transition hover:bg-stone-100/70 dark:border-stone-700 dark:bg-stone-800 dark:hover:bg-stone-700">
                                        <div className="flex items-center gap-3">
                                            <QrCode className="h-5 w-5 text-brand-700 dark:text-amber-400" />
                                            <div>
                                                <div className="text-xs font-bold text-stone-900 dark:text-white">
                                                    QRIS (GoPay, OVO, Dana, BCA,
                                                    dll)
                                                </div>
                                                <div className="text-[11px] text-stone-500 dark:text-stone-300">
                                                    Scan QRIS kasir resmi toko
                                                </div>
                                            </div>
                                        </div>
                                        <input
                                            type="checkbox"
                                            checked={paymentForm.enable_qris}
                                            onChange={(e) =>
                                                setPaymentForm((prev) => ({
                                                    ...prev,
                                                    enable_qris:
                                                        e.target.checked,
                                                }))
                                            }
                                            className="h-5 w-5 cursor-pointer rounded text-brand-700 accent-brand-700"
                                        />
                                    </label>

                                    <label className="flex cursor-pointer items-center justify-between rounded-xl border border-stone-200 bg-stone-50 p-3.5 transition hover:bg-stone-100/70 dark:border-stone-700 dark:bg-stone-800 dark:hover:bg-stone-700">
                                        <div className="flex items-center gap-3">
                                            <CreditCard className="h-5 w-5 text-brand-700 dark:text-emerald-400" />
                                            <div>
                                                <div className="text-xs font-bold text-stone-900 dark:text-white">
                                                    Kartu Debit / EDC
                                                </div>
                                                <div className="text-[11px] text-stone-500 dark:text-stone-300">
                                                    Pembayaran via mesin gesek
                                                    EDC fisik di toko
                                                </div>
                                            </div>
                                        </div>
                                        <input
                                            type="checkbox"
                                            checked={paymentForm.enable_debit}
                                            onChange={(e) =>
                                                setPaymentForm((prev) => ({
                                                    ...prev,
                                                    enable_debit:
                                                        e.target.checked,
                                                }))
                                            }
                                            className="h-5 w-5 cursor-pointer rounded text-brand-700 accent-brand-700"
                                        />
                                    </label>

                                    <label className="flex cursor-pointer items-center justify-between rounded-xl border border-stone-200 bg-stone-50 p-3.5 transition hover:bg-stone-100/70 dark:border-stone-700 dark:bg-stone-800 dark:hover:bg-stone-700">
                                        <div className="flex items-center gap-3">
                                            <Building2 className="h-5 w-5 text-brand-700 dark:text-sky-400" />
                                            <div>
                                                <div className="text-xs font-bold text-stone-900 dark:text-white">
                                                    Transfer Bank Langsung
                                                </div>
                                                <div className="text-[11px] text-stone-500 dark:text-stone-300">
                                                    Transfer manual ke rekening
                                                    bank roastery
                                                </div>
                                            </div>
                                        </div>
                                        <input
                                            type="checkbox"
                                            checked={
                                                paymentForm.enable_bank_transfer
                                            }
                                            onChange={(e) =>
                                                setPaymentForm((prev) => ({
                                                    ...prev,
                                                    enable_bank_transfer:
                                                        e.target.checked,
                                                }))
                                            }
                                            className="h-5 w-5 cursor-pointer rounded text-brand-700 accent-brand-700"
                                        />
                                    </label>
                                </div>

                                <div className="space-y-3 border-t border-stone-100 pt-3 text-xs dark:border-stone-800">
                                    <div>
                                        <label className="text-[11px] font-medium text-stone-500 dark:text-stone-300">
                                            Petunjuk QRIS di Kasir:
                                        </label>
                                        <input
                                            type="text"
                                            value={
                                                paymentForm.qris_instructions ||
                                                ''
                                            }
                                            onChange={(e) =>
                                                setPaymentForm((prev) => ({
                                                    ...prev,
                                                    qris_instructions:
                                                        e.target.value,
                                                }))
                                            }
                                            className="mt-1 w-full rounded-xl border border-stone-200 bg-stone-50 p-2.5 text-stone-900 outline-none focus:border-brand-600 focus:bg-white dark:border-stone-700 dark:bg-stone-800 dark:text-white dark:focus:bg-stone-700"
                                        />
                                    </div>

                                    <div>
                                        <label className="text-[11px] font-medium text-stone-500 dark:text-stone-300">
                                            Informasi Rekening Bank:
                                        </label>
                                        <input
                                            type="text"
                                            value={paymentForm.bank_info || ''}
                                            onChange={(e) =>
                                                setPaymentForm((prev) => ({
                                                    ...prev,
                                                    bank_info: e.target.value,
                                                }))
                                            }
                                            className="mt-1 w-full rounded-xl border border-stone-200 bg-stone-50 p-2.5 text-stone-900 outline-none focus:border-brand-600 focus:bg-white dark:border-stone-700 dark:bg-stone-800 dark:text-white dark:focus:bg-stone-700"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* SUBTAB C: TEMA & MODE GELAP */}
                    {settingsSubTab === 'appearance' && (
                        <div className="space-y-6">
                            <div className="space-y-5 rounded-2xl border border-stone-200 bg-white p-5 shadow-xs sm:p-6 dark:border-stone-800 dark:bg-stone-900">
                                <div>
                                    <h3 className="flex items-center gap-2 text-base font-bold text-brand-950 dark:text-stone-100">
                                        <Sun className="h-5 w-5 text-amber-500" />
                                        <span>
                                            Preferensi Mode & Tampilan POS
                                        </span>
                                    </h3>
                                    <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">
                                        Pilih tampilan antarmuka kasir yang
                                        paling nyaman untuk mata Anda saat
                                        operasional toko siang maupun malam
                                        hari.
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 gap-4 pt-1 md:grid-cols-3">
                                    {/* Mode Terang */}
                                    <div
                                        onClick={() =>
                                            updateAppearance('light')
                                        }
                                        className={`flex cursor-pointer flex-col justify-between rounded-2xl border-2 p-5 transition-all ${
                                            appearance === 'light'
                                                ? 'border-brand-600 bg-brand-50/40 shadow-sm dark:bg-stone-800'
                                                : 'border-stone-200 bg-white hover:border-stone-300 dark:border-stone-800 dark:bg-stone-900 dark:hover:border-stone-700'
                                        }`}
                                    >
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between">
                                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 font-bold text-amber-700 dark:bg-amber-950/60 dark:text-amber-400">
                                                    <Sun className="h-5 w-5" />
                                                </div>
                                                {appearance === 'light' && (
                                                    <span className="rounded-full bg-brand-700 px-2 py-0.5 text-[11px] font-bold text-white">
                                                        Aktif
                                                    </span>
                                                )}
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-bold text-stone-900 dark:text-stone-100">
                                                    Mode Terang (Light)
                                                </h4>
                                                <p className="mt-1.5 text-xs leading-relaxed text-stone-500 dark:text-stone-400">
                                                    Warna latar putih dan
                                                    bersih. Sangat optimal untuk
                                                    kasir pada siang hari atau
                                                    ruangan toko yang terang.
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            className={`mt-5 w-full cursor-pointer rounded-xl py-2.5 text-xs font-bold transition ${
                                                appearance === 'light'
                                                    ? 'bg-brand-700 text-white shadow-xs'
                                                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-300 dark:hover:bg-stone-700'
                                            }`}
                                        >
                                            {appearance === 'light'
                                                ? '✓ Mode Terang Aktif'
                                                : 'Pilih Mode Terang'}
                                        </button>
                                    </div>

                                    {/* Mode Gelap */}
                                    <div
                                        onClick={() => updateAppearance('dark')}
                                        className={`flex cursor-pointer flex-col justify-between rounded-2xl border-2 p-5 transition-all ${
                                            appearance === 'dark'
                                                ? 'border-brand-600 bg-brand-50/40 shadow-sm dark:bg-stone-800'
                                                : 'border-stone-200 bg-white hover:border-stone-300 dark:border-stone-800 dark:bg-stone-900 dark:hover:border-stone-700'
                                        }`}
                                    >
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between">
                                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 font-bold text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-400">
                                                    <Moon className="h-5 w-5" />
                                                </div>
                                                {appearance === 'dark' && (
                                                    <span className="rounded-full bg-brand-700 px-2 py-0.5 text-[11px] font-bold text-white">
                                                        Aktif
                                                    </span>
                                                )}
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-bold text-stone-900 dark:text-stone-100">
                                                    Mode Gelap (Dark)
                                                </h4>
                                                <p className="mt-1.5 text-xs leading-relaxed text-stone-500 dark:text-stone-400">
                                                    Warna latar gelap dan
                                                    kontras teratur. Meredakan
                                                    ketegangan mata saat
                                                    operasional malam hari atau
                                                    pencahayaan temaram.
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            className={`mt-5 w-full cursor-pointer rounded-xl py-2.5 text-xs font-bold transition ${
                                                appearance === 'dark'
                                                    ? 'bg-brand-700 text-white shadow-xs'
                                                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-300 dark:hover:bg-stone-700'
                                            }`}
                                        >
                                            {appearance === 'dark'
                                                ? '✓ Mode Gelap Aktif'
                                                : 'Pilih Mode Gelap'}
                                        </button>
                                    </div>

                                    {/* Ikuti Sistem */}
                                    <div
                                        onClick={() =>
                                            updateAppearance('system')
                                        }
                                        className={`flex cursor-pointer flex-col justify-between rounded-2xl border-2 p-5 transition-all ${
                                            appearance === 'system'
                                                ? 'border-brand-600 bg-brand-50/40 shadow-sm dark:bg-stone-800'
                                                : 'border-stone-200 bg-white hover:border-stone-300 dark:border-stone-800 dark:bg-stone-900 dark:hover:border-stone-700'
                                        }`}
                                    >
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between">
                                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-stone-100 font-bold text-stone-700 dark:bg-stone-800 dark:text-stone-300">
                                                    <Monitor className="h-5 w-5" />
                                                </div>
                                                {appearance === 'system' && (
                                                    <span className="rounded-full bg-brand-700 px-2 py-0.5 text-[11px] font-bold text-white">
                                                        Aktif
                                                    </span>
                                                )}
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-bold text-stone-900 dark:text-stone-100">
                                                    Ikuti Sistem
                                                </h4>
                                                <p className="mt-1.5 text-xs leading-relaxed text-stone-500 dark:text-stone-400">
                                                    Secara otomatis menyesuaikan
                                                    preferensi tema terang atau
                                                    gelap sesuai pengaturan
                                                    bawaan sistem operasi
                                                    komputer / tablet Anda.
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            className={`mt-5 w-full cursor-pointer rounded-xl py-2.5 text-xs font-bold transition ${
                                                appearance === 'system'
                                                    ? 'bg-brand-700 text-white shadow-xs'
                                                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-300 dark:hover:bg-stone-700'
                                            }`}
                                        >
                                            {appearance === 'system'
                                                ? '✓ Ikuti Sistem Aktif'
                                                : 'Pilih Ikuti Sistem'}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* CARD 2: KEPADATAN KATALOG & JUMLAH KOLOM (GRID DENSITY) */}
                            <div className="space-y-5 rounded-2xl border border-stone-200 bg-white p-5 shadow-xs sm:p-6 dark:border-stone-800 dark:bg-stone-900">
                                <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                                    <div>
                                        <h3 className="flex items-center gap-2 text-base font-bold text-brand-950 dark:text-stone-100">
                                            <LayoutGrid className="h-5 w-5 text-brand-700 dark:text-amber-400" />
                                            <span>Kepadatan Katalog & Jumlah Kolom (Grid Density)</span>
                                        </h3>
                                        <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">
                                            Sesuaikan ukuran kartu produk, jarak antar item, dan jumlah kolom di layar kasir untuk kenyamanan dan efisiensi kerja.
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleSaveLayoutSettings}
                                        disabled={isSavingSettings}
                                        className="flex cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-brand-700 px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-brand-800 active:scale-95 disabled:opacity-50"
                                    >
                                        <Save className="h-4 w-4" />
                                        <span>
                                            {isSavingSettings ? 'Menyimpan...' : 'Simpan Tampilan'}
                                        </span>
                                    </button>
                                </div>

                                {/* Pilihan Kepadatan (Density) */}
                                <div>
                                    <div className="mb-2 text-xs font-bold text-stone-700 dark:text-stone-300">
                                        Pilih Kepadatan Tampilan:
                                    </div>
                                    <div className="grid grid-cols-1 gap-3.5 md:grid-cols-3">
                                        {/* Density 1: Compact / Rapat */}
                                        <div
                                            onClick={() => updateGridDensity('compact')}
                                            className={`flex cursor-pointer flex-col justify-between rounded-2xl border-2 p-4 transition-all ${
                                                gridDensity === 'compact'
                                                    ? 'border-brand-600 bg-brand-50/40 shadow-sm dark:bg-stone-800'
                                                    : 'border-stone-200 bg-white hover:border-stone-300 dark:border-stone-800 dark:bg-stone-900 dark:hover:border-stone-700'
                                            }`}
                                        >
                                            <div className="space-y-2.5">
                                                <div className="flex items-center justify-between">
                                                    <span className="rounded-lg bg-sky-100 px-2 py-0.5 text-[10px] font-bold text-sky-800 dark:bg-sky-950 dark:text-sky-300">
                                                        Efisien & Padat
                                                    </span>
                                                    {gridDensity === 'compact' && (
                                                        <span className="rounded-full bg-brand-700 px-2 py-0.5 text-[10px] font-bold text-white">
                                                            Aktif
                                                        </span>
                                                    )}
                                                </div>
                                                <div>
                                                    <h4 className="text-sm font-bold text-stone-900 dark:text-stone-100">
                                                        Rapat / Ringkas (Compact)
                                                    </h4>
                                                    <p className="mt-1 text-xs leading-relaxed text-stone-500 dark:text-stone-400">
                                                        Ukuran kartu lebih ramping, padding rapat, muat lebih banyak produk dalam satu layar kasir tanpa banyak scroll.
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="mt-4 pt-3 border-t border-stone-100 dark:border-stone-800 text-[11px] font-semibold text-brand-700 dark:text-amber-400">
                                                {gridDensity === 'compact' ? '✓ Sedang Digunakan' : 'Klik untuk Pilih'}
                                            </div>
                                        </div>

                                        {/* Density 2: Normal / Standar */}
                                        <div
                                            onClick={() => updateGridDensity('normal')}
                                            className={`flex cursor-pointer flex-col justify-between rounded-2xl border-2 p-4 transition-all ${
                                                gridDensity === 'normal'
                                                    ? 'border-brand-600 bg-brand-50/40 shadow-sm dark:bg-stone-800'
                                                    : 'border-stone-200 bg-white hover:border-stone-300 dark:border-stone-800 dark:bg-stone-900 dark:hover:border-stone-700'
                                            }`}
                                        >
                                            <div className="space-y-2.5">
                                                <div className="flex items-center justify-between">
                                                    <span className="rounded-lg bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                                                        Standar Default
                                                    </span>
                                                    {gridDensity === 'normal' && (
                                                        <span className="rounded-full bg-brand-700 px-2 py-0.5 text-[10px] font-bold text-white">
                                                            Aktif
                                                        </span>
                                                    )}
                                                </div>
                                                <div>
                                                    <h4 className="text-sm font-bold text-stone-900 dark:text-stone-100">
                                                        Standar (Normal)
                                                    </h4>
                                                    <p className="mt-1 text-xs leading-relaxed text-stone-500 dark:text-stone-400">
                                                        Tampilan seimbang dengan proporsi gambar, teks nama kopi, dan tombol tambah yang nyaman untuk semua perangkat.
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="mt-4 pt-3 border-t border-stone-100 dark:border-stone-800 text-[11px] font-semibold text-brand-700 dark:text-amber-400">
                                                {gridDensity === 'normal' ? '✓ Sedang Digunakan' : 'Klik untuk Pilih'}
                                            </div>
                                        </div>

                                        {/* Density 3: Comfortable / Lega */}
                                        <div
                                            onClick={() => updateGridDensity('comfortable')}
                                            className={`flex cursor-pointer flex-col justify-between rounded-2xl border-2 p-4 transition-all ${
                                                gridDensity === 'comfortable'
                                                    ? 'border-brand-600 bg-brand-50/40 shadow-sm dark:bg-stone-800'
                                                    : 'border-stone-200 bg-white hover:border-stone-300 dark:border-stone-800 dark:bg-stone-900 dark:hover:border-stone-700'
                                            }`}
                                        >
                                            <div className="space-y-2.5">
                                                <div className="flex items-center justify-between">
                                                    <span className="rounded-lg bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                                                        Layar Sentuh / Tablet
                                                    </span>
                                                    {gridDensity === 'comfortable' && (
                                                        <span className="rounded-full bg-brand-700 px-2 py-0.5 text-[10px] font-bold text-white">
                                                            Aktif
                                                        </span>
                                                    )}
                                                </div>
                                                <div>
                                                    <h4 className="text-sm font-bold text-stone-900 dark:text-stone-100">
                                                        Lega / Nyaman (Comfortable)
                                                    </h4>
                                                    <p className="mt-1 text-xs leading-relaxed text-stone-500 dark:text-stone-400">
                                                        Kartu produk lebih besar, tulisan lebih besar, dan tombol lebih lapang. Sangat cocok untuk jari di tablet POS.
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="mt-4 pt-3 border-t border-stone-100 dark:border-stone-800 text-[11px] font-semibold text-brand-700 dark:text-amber-400">
                                                {gridDensity === 'comfortable' ? '✓ Sedang Digunakan' : 'Klik untuk Pilih'}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Pilihan Jumlah Kolom */}
                                <div className="space-y-2 border-t border-stone-100 pt-4 dark:border-stone-800">
                                    <div className="flex flex-col justify-between gap-1 sm:flex-row sm:items-center">
                                        <div className="text-xs font-bold text-stone-700 dark:text-stone-300">
                                            Jumlah Kolom Katalog Produk:
                                        </div>
                                        <div className="text-[11px] text-stone-500 dark:text-stone-400">
                                            {gridColumns === 'auto'
                                                ? 'Menyesuaikan lebar layar kasir secara otomatis'
                                                : `Terkunci pada ${gridColumns} kolom`}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
                                        {(['auto', 2, 3, 4, 5, 6] as const).map((col) => (
                                            <button
                                                key={col}
                                                type="button"
                                                onClick={() => updateGridColumns(col as any)}
                                                className={`cursor-pointer rounded-xl border p-2.5 text-center transition ${
                                                    gridColumns === col
                                                        ? 'border-brand-700 bg-brand-700 font-bold text-white shadow-2xs'
                                                        : 'border-stone-200 bg-stone-50 font-semibold text-stone-700 hover:bg-stone-100 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-200 dark:hover:bg-stone-700'
                                                }`}
                                            >
                                                <div className="text-xs">
                                                    {col === 'auto' ? 'Otomatis' : `${col} Kolom`}
                                                </div>
                                                <div className={`mt-0.5 text-[10px] ${gridColumns === col ? 'text-white/80' : 'text-stone-400'}`}>
                                                    {col === 'auto' ? 'Auto Grid' : `${col} Grid`}
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Mini Live Sample Preview */}
                                <div className="rounded-2xl border border-stone-200 bg-stone-50/80 p-4 dark:border-stone-800 dark:bg-stone-950/40">
                                    <div className="mb-3 flex items-center justify-between text-xs">
                                        <span className="font-bold text-stone-700 dark:text-stone-300">
                                            Simulasi Kartu Produk ({gridDensity.toUpperCase()} • {gridColumns === 'auto' ? 'AUTO' : `${gridColumns} KOLOM`}):
                                        </span>
                                        <span className="text-[10px] text-stone-500 dark:text-stone-400">
                                            Contoh tampilan langsung di katalog
                                        </span>
                                    </div>

                                    <div className="max-w-md">
                                        <div className={`relative flex rounded-xl border border-stone-200 bg-white text-left shadow-2xs dark:border-stone-800 dark:bg-stone-900 ${
                                            gridDensity === 'compact'
                                                ? 'p-2'
                                                : gridDensity === 'comfortable'
                                                ? 'p-3.5'
                                                : 'p-2.5'
                                        }`}>
                                            <div className={`aspect-square shrink-0 overflow-hidden rounded-lg border border-stone-100 bg-stone-100 dark:border-stone-800 dark:bg-stone-800 ${
                                                gridDensity === 'compact'
                                                    ? 'h-12 w-12'
                                                    : gridDensity === 'comfortable'
                                                    ? 'h-16 w-16'
                                                    : 'h-14 w-14'
                                            }`}>
                                                <img
                                                    src="/brand/logo-circle.png"
                                                    alt="Sample"
                                                    className="h-full w-full object-contain p-1"
                                                />
                                            </div>
                                            <div className="ml-3 flex flex-1 flex-col justify-between">
                                                <div>
                                                    <span className="rounded border border-brand-800 bg-brand-950 px-1.5 py-0.5 text-[8px] font-bold text-amber-300 uppercase">
                                                        HOUSEBLEND
                                                    </span>
                                                    <h5 className={`font-bold text-stone-900 dark:text-white ${
                                                        gridDensity === 'compact'
                                                            ? 'text-[11px]'
                                                            : gridDensity === 'comfortable'
                                                            ? 'text-sm'
                                                            : 'text-xs'
                                                    }`}>
                                                        Funky Berry Natural Anaerobic
                                                    </h5>
                                                </div>
                                                <div className="flex items-center justify-between pt-1">
                                                    <span className={`font-black text-brand-700 dark:text-emerald-400 ${
                                                        gridDensity === 'compact'
                                                            ? 'text-xs'
                                                            : gridDensity === 'comfortable'
                                                            ? 'text-sm'
                                                            : 'text-xs'
                                                    }`}>
                                                        Rp 75.000
                                                    </span>
                                                    <span className="rounded bg-brand-50 px-2 py-0.5 text-[10px] font-bold text-brand-700 dark:bg-stone-800 dark:text-emerald-400">
                                                        + Tambah
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* SUBTAB D: MANAJEMEN STAF (KHUSUS OWNER & ADMIN) */}
                    {settingsSubTab === 'staff' && isOwner && (
                        <div className="space-y-5 sm:space-y-6">
                            {/* Banner Penjelasan Role Owner */}
                            <div className="flex min-w-0 items-start gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-3.5 sm:p-4 dark:bg-amber-500/15">
                                <Shield className="mt-0.5 h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
                                <div className="min-w-0 flex-1 space-y-1">
                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                        <h3 className="text-sm font-bold text-amber-950 dark:text-amber-200">
                                            Akses Khusus Akun Owner: Manajemen
                                            Tim & Kasir
                                        </h3>
                                        <span className="shrink-0 rounded-full bg-amber-400 px-2 py-0.5 text-[10px] font-black text-stone-950 uppercase">
                                            Owner Only
                                        </span>
                                    </div>
                                    <p className="text-xs leading-relaxed text-amber-900/80 dark:text-amber-300/80">
                                        Tambahkan akun baru untuk staf kasir
                                        atau admin outlet langsung dari aplikasi
                                        POS. Staf yang didaftarkan dapat
                                        langsung masuk melalui portal login POS
                                        kasir (
                                        <code className="font-mono font-semibold">
                                            /pos/login
                                        </code>
                                        ).
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-5 sm:gap-6 lg:grid-cols-12">
                                {/* KOLOM KIRI: FORM TAMBAH STAF BARU */}
                                <div className="min-w-0 space-y-4 rounded-2xl border border-stone-200 bg-white p-4 shadow-xs sm:space-y-5 sm:p-6 lg:col-span-5 dark:border-stone-800 dark:bg-stone-900">
                                    <div className="flex items-center gap-2 border-b border-stone-100 pb-3 dark:border-stone-800">
                                        <div className="rounded-xl bg-amber-500/10 p-2 text-amber-600 dark:text-amber-400">
                                            <UserPlus className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-bold text-stone-900 dark:text-white">
                                                Tambah Staf Baru
                                            </h4>
                                            <p className="text-[11px] text-stone-500 dark:text-stone-400">
                                                Buat akun untuk kasir atau admin
                                                outlet
                                            </p>
                                        </div>
                                    </div>

                                    {staffFormError && (
                                        <div className="flex animate-in items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800 fade-in dark:border-rose-800/60 dark:bg-rose-950/40 dark:text-rose-300">
                                            <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 dark:text-rose-400" />
                                            <span>{staffFormError}</span>
                                        </div>
                                    )}

                                    <form
                                        onSubmit={handleCreateStaff}
                                        className="space-y-4 text-xs"
                                    >
                                        {/* Nama Lengkap */}
                                        <div className="space-y-1">
                                            <label className="font-semibold text-stone-700 dark:text-stone-300">
                                                Nama Lengkap Staf{' '}
                                                <span className="text-rose-500">
                                                    *
                                                </span>
                                            </label>
                                            <input
                                                type="text"
                                                required
                                                value={staffName}
                                                onChange={(e) =>
                                                    setStaffName(e.target.value)
                                                }
                                                placeholder="Contoh: Barista Kasir 1"
                                                className="w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2.5 text-stone-900 focus:border-brand-600 focus:bg-white focus:ring-1 focus:ring-brand-600 focus:outline-none dark:border-stone-700 dark:bg-stone-800 dark:text-white dark:focus:bg-stone-800"
                                            />
                                        </div>

                                        {/* Email Login */}
                                        <div className="space-y-1">
                                            <label className="font-semibold text-stone-700 dark:text-stone-300">
                                                Email Login POS{' '}
                                                <span className="text-rose-500">
                                                    *
                                                </span>
                                            </label>
                                            <input
                                                type="email"
                                                required
                                                value={staffEmail}
                                                onChange={(e) =>
                                                    setStaffEmail(
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder="Contoh: kasir1@sanubari.co.id"
                                                className="w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2.5 text-stone-900 focus:border-brand-600 focus:bg-white focus:ring-1 focus:ring-brand-600 focus:outline-none dark:border-stone-700 dark:bg-stone-800 dark:text-white dark:focus:bg-stone-800"
                                            />
                                            <span className="block text-[10px] text-stone-400">
                                                Digunakan staf untuk login ke
                                                aplikasi POS
                                            </span>
                                        </div>

                                        {/* Peran / Role */}
                                        <div className="space-y-1">
                                            <label className="font-semibold text-stone-700 dark:text-stone-300">
                                                Peran / Hak Akses POS{' '}
                                                <span className="text-rose-500">
                                                    *
                                                </span>
                                            </label>
                                            <div className="grid grid-cols-3 gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setStaffRole('kasir')
                                                    }
                                                    className={`cursor-pointer rounded-xl border px-2.5 py-2 text-center font-bold transition ${
                                                        staffRole === 'kasir'
                                                            ? 'border-emerald-600 bg-emerald-600 text-white shadow-xs'
                                                            : 'border-stone-200 bg-stone-50 text-stone-700 hover:bg-stone-100 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-300'
                                                    }`}
                                                >
                                                    Kasir
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setStaffRole('admin')
                                                    }
                                                    className={`cursor-pointer rounded-xl border px-2.5 py-2 text-center font-bold transition ${
                                                        staffRole === 'admin'
                                                            ? 'border-blue-600 bg-blue-600 text-white shadow-xs'
                                                            : 'border-stone-200 bg-stone-50 text-stone-700 hover:bg-stone-100 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-300'
                                                    }`}
                                                >
                                                    Admin
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setStaffRole('owner')
                                                    }
                                                    className={`cursor-pointer rounded-xl border px-2.5 py-2 text-center font-bold transition ${
                                                        staffRole === 'owner'
                                                            ? 'border-amber-600 bg-amber-600 text-white shadow-xs'
                                                            : 'border-stone-200 bg-stone-50 text-stone-700 hover:bg-stone-100 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-300'
                                                    }`}
                                                >
                                                    Owner
                                                </button>
                                            </div>
                                            <span className="block text-[10px] text-stone-400">
                                                {staffRole === 'kasir' &&
                                                    'Kasir: Transaksi penjualan, cetak struk, antrian pesanan & kas harian.'}
                                                {staffRole === 'admin' &&
                                                    'Admin: Akses operasional kasir, inventori & pengaturan POS.'}
                                                {staffRole === 'owner' &&
                                                    'Owner: Hak akses pemilik penuh termasuk menambah staf & finansial.'}
                                            </span>
                                        </div>

                                        {/* Password & Konfirmasi Password */}
                                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                            <div className="space-y-1">
                                                <label className="font-semibold text-stone-700 dark:text-stone-300">
                                                    Password{' '}
                                                    <span className="text-rose-500">
                                                        *
                                                    </span>
                                                </label>
                                                <input
                                                    type="password"
                                                    required
                                                    minLength={6}
                                                    value={staffPassword}
                                                    onChange={(e) =>
                                                        setStaffPassword(
                                                            e.target.value,
                                                        )
                                                    }
                                                    placeholder="Min. 6 karakter"
                                                    className="w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2.5 text-stone-900 focus:border-brand-600 focus:bg-white focus:ring-1 focus:ring-brand-600 focus:outline-none dark:border-stone-700 dark:bg-stone-800 dark:text-white dark:focus:bg-stone-800"
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="font-semibold text-stone-700 dark:text-stone-300">
                                                    Konfirmasi Password{' '}
                                                    <span className="text-rose-500">
                                                        *
                                                    </span>
                                                </label>
                                                <input
                                                    type="password"
                                                    required
                                                    minLength={6}
                                                    value={staffPasswordConfirm}
                                                    onChange={(e) =>
                                                        setStaffPasswordConfirm(
                                                            e.target.value,
                                                        )
                                                    }
                                                    placeholder="Ulangi password"
                                                    className="w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2.5 text-stone-900 focus:border-brand-600 focus:bg-white focus:ring-1 focus:ring-brand-600 focus:outline-none dark:border-stone-700 dark:bg-stone-800 dark:text-white dark:focus:bg-stone-800"
                                                />
                                            </div>
                                        </div>

                                        {/* No Telp (Opsional) */}
                                        <div className="space-y-1">
                                            <label className="font-semibold text-stone-700 dark:text-stone-300">
                                                Nomor WhatsApp / HP (Opsional)
                                            </label>
                                            <input
                                                type="text"
                                                value={staffPhone}
                                                onChange={(e) =>
                                                    setStaffPhone(
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder="Contoh: 081234567890"
                                                className="w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2.5 text-stone-900 focus:border-brand-600 focus:bg-white focus:ring-1 focus:ring-brand-600 focus:outline-none dark:border-stone-700 dark:bg-stone-800 dark:text-white dark:focus:bg-stone-800"
                                            />
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={isAddingStaff}
                                            className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-amber-600 px-4 py-2.5 font-bold text-white shadow-sm transition hover:bg-amber-700 active:scale-95 disabled:opacity-50"
                                        >
                                            <UserPlus
                                                className={`h-4 w-4 ${isAddingStaff ? 'animate-bounce' : ''}`}
                                            />
                                            <span>
                                                {isAddingStaff
                                                    ? 'Menyimpan Staf...'
                                                    : 'Tambahkan Staf ke POS'}
                                            </span>
                                        </button>
                                    </form>
                                </div>

                                {/* KOLOM KANAN: DAFTAR STAF TERDAFTAR */}
                                <div className="min-w-0 space-y-4 rounded-2xl border border-stone-200 bg-white p-4 shadow-xs sm:p-6 lg:col-span-7 dark:border-stone-800 dark:bg-stone-900">
                                    <div className="flex flex-col justify-between gap-2 border-b border-stone-100 pb-3 sm:flex-row sm:items-center dark:border-stone-800">
                                        <div>
                                            <h4 className="flex items-center gap-2 text-sm font-bold text-stone-900 dark:text-white">
                                                <span>
                                                    Daftar Tim & Staf POS
                                                </span>
                                                <span className="py-0.2 rounded-full bg-stone-100 px-2 text-[10px] font-black text-stone-700 dark:bg-stone-800 dark:text-stone-300">
                                                    {staff.length} Staf
                                                </span>
                                            </h4>
                                            <p className="text-[11px] text-stone-500 dark:text-stone-400">
                                                Seluruh akun internal yang
                                                memiliki hak akses login ke POS
                                            </p>
                                        </div>

                                        {/* Search Filter */}
                                        <div className="relative w-full sm:w-48">
                                            <Search className="absolute top-1/2 left-2.5 h-3.5 w-3.5 -translate-y-1/2 text-stone-400" />
                                            <input
                                                type="text"
                                                value={staffSearchQuery}
                                                onChange={(e) =>
                                                    setStaffSearchQuery(
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder="Cari staf..."
                                                className="w-full rounded-xl border border-stone-200 bg-stone-50 py-1.5 pr-3 pl-8 text-xs text-stone-900 placeholder-stone-400 focus:border-brand-600 focus:outline-none dark:border-stone-700 dark:bg-stone-800 dark:text-white"
                                            />
                                        </div>
                                    </div>

                                    {/* List Staf */}
                                    <div className="max-h-[460px] space-y-1 divide-y divide-stone-100 overflow-y-auto pr-1 dark:divide-stone-800">
                                        {staff
                                            .filter((s) => {
                                                if (!staffSearchQuery.trim())
                                                    return true;
                                                const q =
                                                    staffSearchQuery.toLowerCase();
                                                return (
                                                    (s.name ? s.name.toLowerCase().includes(q) : false) ||
                                                    (s.email ? s.email.toLowerCase().includes(q) : false) ||
                                                    (s.role ? s.role.toLowerCase().includes(q) : false)
                                                );
                                            })
                                            .map((member) => (
                                                <div
                                                    key={member.id}
                                                    className="flex items-center justify-between gap-3 rounded-xl px-2 py-3 transition hover:bg-stone-50 dark:hover:bg-stone-800/40"
                                                >
                                                    <div className="flex min-w-0 items-center gap-3">
                                                        <div
                                                            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-xs font-bold uppercase ${
                                                                member.role ===
                                                                'owner'
                                                                    ? 'border border-amber-300 bg-amber-100 text-amber-700 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-300'
                                                                    : member.role ===
                                                                        'admin'
                                                                      ? 'border border-blue-300 bg-blue-100 text-blue-700 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-300'
                                                                      : 'border border-emerald-300 bg-emerald-100 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                                            }`}
                                                        >
                                                            {member.name.slice(
                                                                0,
                                                                2,
                                                            )}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <div className="flex items-center gap-2">
                                                                <span className="truncate text-xs font-bold text-stone-900 dark:text-white">
                                                                    {
                                                                        member.name
                                                                    }
                                                                </span>
                                                                {member.id ===
                                                                    cashier.id && (
                                                                    <span className="py-0.2 rounded bg-stone-200 px-1.5 text-[9px] font-bold text-stone-700 dark:bg-stone-700 dark:text-stone-300">
                                                                        Anda
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <p className="truncate text-[11px] text-stone-500 dark:text-stone-400">
                                                                {member.email}
                                                            </p>
                                                            {member.phone && (
                                                                <p className="text-[10px] text-stone-400">
                                                                    WA:{' '}
                                                                    {
                                                                        member.phone
                                                                    }
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div className="flex shrink-0 items-center gap-2">
                                                        <span
                                                            className={`rounded-md border px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase ${
                                                                member.role ===
                                                                'owner'
                                                                    ? 'border-amber-300 bg-amber-100 text-amber-800 dark:border-amber-700 dark:bg-amber-950/70 dark:text-amber-300'
                                                                    : member.role ===
                                                                        'admin'
                                                                      ? 'border-blue-300 bg-blue-100 text-blue-800 dark:border-blue-700 dark:bg-blue-950/70 dark:text-blue-300'
                                                                      : 'border-emerald-300 bg-emerald-100 text-emerald-800 dark:border-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300'
                                                            }`}
                                                        >
                                                            {member.role}
                                                        </span>

                                                        {member.id !==
                                                            cashier.id &&
                                                            member.id !== 1 && (
                                                                <button
                                                                    type="button"
                                                                    disabled={
                                                                        deletingStaffId ===
                                                                        member.id
                                                                    }
                                                                    onClick={() =>
                                                                        handleDeleteStaff(
                                                                            member,
                                                                        )
                                                                    }
                                                                    className="cursor-pointer rounded-lg p-1.5 text-rose-500 transition hover:bg-rose-50 hover:text-rose-700 dark:hover:bg-rose-950/40"
                                                                    title={`Hapus akses staf ${member.name}`}
                                                                >
                                                                    <Trash2 className="h-3.5 w-3.5" />
                                                                </button>
                                                            )}
                                                    </div>
                                                </div>
                                            ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
    );
};
