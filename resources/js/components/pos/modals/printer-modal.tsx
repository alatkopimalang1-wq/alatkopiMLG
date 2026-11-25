import React from 'react';
import { Printer, X, SlidersHorizontal, Save } from 'lucide-react';
import { PrinterSettings, PaperWidth } from '@/types/pos';

interface PrinterModalProps {
    isOpen: boolean;
    onClose: () => void;
    printerForm: PrinterSettings;
    setPrinterForm: React.Dispatch<React.SetStateAction<PrinterSettings>>;
    handleResetPrinterDefaults: () => void;
    handleRunTestPrint: (mode: 'web' | 'raw_bt' | 'usb_direct') => void;
    handleSavePrinterSettings: () => Promise<void>;
    isSavingSettings: boolean;
}

export const PrinterModal: React.FC<PrinterModalProps> = ({
    isOpen,
    onClose,
    printerForm,
    setPrinterForm,
    handleResetPrinterDefaults,
    handleRunTestPrint,
    handleSavePrinterSettings,
    isSavingSettings,
}) => {
    if (!isOpen) return null;

    return (
        <div className="pos-modal-overlay fixed inset-0 z-50 flex animate-in items-center justify-center bg-black/60 p-3 duration-150 fade-in sm:p-4">
            <div className="pos-gpu-layer relative flex w-full max-w-2xl animate-in flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-2xl duration-150 zoom-in-95 dark:border-stone-800 dark:bg-stone-900">
                {/* Blue Modal Header */}
                <div className="flex shrink-0 items-center justify-between bg-[#0284c7] px-5 py-3.5 text-white shadow-sm">
                    <div className="flex items-center gap-2.5">
                        <Printer className="h-5 w-5 text-white" />
                        <h3 className="text-sm font-bold tracking-wide text-white">
                            Mengatur Printer
                        </h3>
                        <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-semibold text-white">
                            Khusus Perangkat Ini
                        </span>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="cursor-pointer rounded-lg p-1 text-white transition hover:bg-white/20"
                        title="Tutup"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Modal Body: 2 Columns */}
                <div className="max-h-[calc(85vh-120px)] space-y-4 overflow-y-auto p-5 text-xs sm:p-6">
                    <div className="grid grid-cols-1 gap-x-6 gap-y-4 md:grid-cols-2">
                        {/* KOLOM KIRI */}
                        <div className="space-y-3.5">
                            <div>
                                <label className="text-[11px] font-semibold text-stone-600 dark:text-stone-300">
                                    Nama
                                </label>
                                <input
                                    type="text"
                                    value={printerForm.printer_name || ''}
                                    onChange={(e) =>
                                        setPrinterForm((prev) => ({
                                            ...prev,
                                            printer_name: e.target.value,
                                        }))
                                    }
                                    placeholder="Contoh: Printer #639304662601302044"
                                    className="mt-1 w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 font-medium text-stone-900 focus:border-sky-500 focus:bg-white focus:outline-none dark:border-stone-700 dark:bg-stone-800 dark:text-white dark:focus:bg-stone-800"
                                />
                            </div>

                            <div>
                                <label className="text-[11px] font-semibold text-stone-600 dark:text-stone-300">
                                    Printer
                                </label>
                                <select
                                    value={printerForm.printer_driver || 'POS80 Printer | WINDOWS'}
                                    onChange={(e) =>
                                        setPrinterForm((prev) => ({
                                            ...prev,
                                            printer_driver: e.target.value,
                                        }))
                                    }
                                    className="mt-1 w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 font-medium text-stone-900 focus:border-sky-500 focus:bg-white focus:outline-none dark:border-stone-700 dark:bg-stone-800 dark:text-white dark:focus:bg-stone-800"
                                >
                                    <option value="POS80 Printer | WINDOWS">
                                        POS80 Printer | WINDOWS
                                    </option>
                                    <option value="POS58 Printer | WINDOWS">
                                        POS58 Printer | WINDOWS
                                    </option>
                                    <option value="Bluetooth Thermal ESC/POS">
                                        Bluetooth Thermal ESC/POS
                                    </option>
                                    <option value="Default System / USB Printer">
                                        Default System / USB Printer
                                    </option>
                                </select>
                            </div>

                            <div>
                                <label className="text-[11px] font-semibold text-stone-600 dark:text-stone-300">
                                    Ukuran Kertas Thermal
                                </label>
                                <select
                                    value={printerForm.paper_width}
                                    onChange={(e) =>
                                        setPrinterForm((prev) => ({
                                            ...prev,
                                            paper_width: e.target.value as PaperWidth,
                                            receipt_columns: e.target.value === '80mm' ? 44 : 32,
                                        }))
                                    }
                                    className="mt-1 w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 font-medium text-stone-900 focus:border-sky-500 focus:bg-white focus:outline-none dark:border-stone-700 dark:bg-stone-800 dark:text-white dark:focus:bg-stone-800"
                                >
                                    <option value="58mm">
                                        58 mm (Printer Portabel / Kasir Kecil)
                                    </option>
                                    <option value="80mm">
                                        80 mm (Printer Desktop / Kasir Standar)
                                    </option>
                                </select>
                            </div>

                            <div>
                                <label className="text-[11px] font-semibold text-stone-600 dark:text-stone-300">
                                    Cash Drawer
                                </label>
                                <select
                                    value={printerForm.open_cash_drawer ? '1' : '0'}
                                    onChange={(e) =>
                                        setPrinterForm((prev) => ({
                                            ...prev,
                                            open_cash_drawer: e.target.value === '1',
                                        }))
                                    }
                                    className="mt-1 w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 font-medium text-stone-900 focus:border-sky-500 focus:bg-white focus:outline-none dark:border-stone-700 dark:bg-stone-800 dark:text-white dark:focus:bg-stone-800"
                                >
                                    <option value="0">Tidak</option>
                                    <option value="1">Buka Laci Kasir Saat Cetak</option>
                                </select>
                            </div>

                            <div>
                                <label className="text-[11px] font-semibold text-stone-600 dark:text-stone-300">
                                    Line Display
                                </label>
                                <select
                                    value={printerForm.line_display || 'none'}
                                    onChange={(e) =>
                                        setPrinterForm((prev) => ({
                                            ...prev,
                                            line_display: e.target.value,
                                        }))
                                    }
                                    className="mt-1 w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 font-medium text-stone-900 focus:border-sky-500 focus:bg-white focus:outline-none dark:border-stone-700 dark:bg-stone-800 dark:text-white dark:focus:bg-stone-800"
                                >
                                    <option value="none">Tidak</option>
                                    <option value="vfd_2x20">
                                        ESC/POS Customer Display (2x20)
                                    </option>
                                </select>
                            </div>

                            <div>
                                <label className="text-[11px] font-semibold text-stone-600 dark:text-stone-300">
                                    Formatting
                                </label>
                                <select
                                    value={printerForm.formatting || 'formatted'}
                                    onChange={(e) =>
                                        setPrinterForm((prev) => ({
                                            ...prev,
                                            formatting: e.target.value,
                                        }))
                                    }
                                    className="mt-1 w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 font-medium text-stone-900 focus:border-sky-500 focus:bg-white focus:outline-none dark:border-stone-700 dark:bg-stone-800 dark:text-white dark:focus:bg-stone-800"
                                >
                                    <option value="formatted">Dengan Formatting</option>
                                    <option value="plain">Teks Polos</option>
                                </select>
                            </div>
                        </div>

                        {/* KOLOM KANAN */}
                        <div className="space-y-3.5">
                            <div>
                                <label className="text-[11px] font-semibold text-stone-600 dark:text-stone-300">
                                    Receipt - Jumlah Kolom
                                </label>
                                <select
                                    value={
                                        printerForm.receipt_columns ||
                                        (printerForm.paper_width === '80mm' ? 44 : 32)
                                    }
                                    onChange={(e) =>
                                        setPrinterForm((prev) => ({
                                            ...prev,
                                            receipt_columns: Number(e.target.value),
                                        }))
                                    }
                                    className="mt-1 w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 font-medium text-stone-900 focus:border-sky-500 focus:bg-white focus:outline-none dark:border-stone-700 dark:bg-stone-800 dark:text-white dark:focus:bg-stone-800"
                                >
                                    <option value="32">32</option>
                                    <option value="40">40</option>
                                    <option value="42">42</option>
                                    <option value="44">44</option>
                                    <option value="46">46 (Olsera)</option>
                                    <option value="48">48</option>
                                </select>
                            </div>

                            <div>
                                <label className="text-[11px] font-semibold text-stone-600 dark:text-stone-300">
                                    Panjang Maksimal Nama Item
                                </label>
                                <select
                                    value={printerForm.max_item_name_length || 40}
                                    onChange={(e) =>
                                        setPrinterForm((prev) => ({
                                            ...prev,
                                            max_item_name_length: Number(e.target.value),
                                        }))
                                    }
                                    className="mt-1 w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 font-medium text-stone-900 focus:border-sky-500 focus:bg-white focus:outline-none dark:border-stone-700 dark:bg-stone-800 dark:text-white dark:focus:bg-stone-800"
                                >
                                    <option value="18">18</option>
                                    <option value="24">24</option>
                                    <option value="28">28</option>
                                    <option value="32">32</option>
                                    <option value="40">40 (Olsera)</option>
                                    <option value="44">44</option>
                                </select>
                            </div>

                            <div>
                                <label className="text-[11px] font-semibold text-stone-600 dark:text-stone-300">
                                    Receipt - Cetak Salinan
                                </label>
                                <select
                                    value={printerForm.copies || 1}
                                    onChange={(e) =>
                                        setPrinterForm((prev) => ({
                                            ...prev,
                                            copies: Number(e.target.value),
                                        }))
                                    }
                                    className="mt-1 w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 font-medium text-stone-900 focus:border-sky-500 focus:bg-white focus:outline-none dark:border-stone-700 dark:bg-stone-800 dark:text-white dark:focus:bg-stone-800"
                                >
                                    <option value="1">1</option>
                                    <option value="2">2</option>
                                    <option value="3">3</option>
                                </select>
                            </div>

                            <div>
                                <label className="text-[11px] font-semibold text-stone-600 dark:text-stone-300">
                                    Cetak Logo
                                </label>
                                <select
                                    value={printerForm.show_logo !== false ? '1' : '0'}
                                    onChange={(e) =>
                                        setPrinterForm((prev) => ({
                                            ...prev,
                                            show_logo: e.target.value === '1',
                                        }))
                                    }
                                    className="mt-1 w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 font-medium text-stone-900 focus:border-sky-500 focus:bg-white focus:outline-none dark:border-stone-700 dark:bg-stone-800 dark:text-white dark:focus:bg-stone-800"
                                >
                                    <option value="1">Ya</option>
                                    <option value="0">Tidak</option>
                                </select>
                            </div>

                            <div>
                                <label className="text-[11px] font-semibold text-stone-600 dark:text-stone-300">
                                    Auto Print
                                </label>
                                <select
                                    value={printerForm.auto_print ? '1' : '0'}
                                    onChange={(e) =>
                                        setPrinterForm((prev) => ({
                                            ...prev,
                                            auto_print: e.target.value === '1',
                                        }))
                                    }
                                    className="mt-1 w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 font-medium text-stone-900 focus:border-sky-500 focus:bg-white focus:outline-none dark:border-stone-700 dark:bg-stone-800 dark:text-white dark:focus:bg-stone-800"
                                >
                                    <option value="0">Manual</option>
                                    <option value="1">Otomatis</option>
                                </select>
                            </div>

                            <div>
                                <label className="text-[11px] font-semibold text-stone-600 dark:text-stone-300">
                                    Printer Kasir
                                </label>
                                <select
                                    value={printerForm.is_cashier_printer !== false ? '1' : '0'}
                                    onChange={(e) =>
                                        setPrinterForm((prev) => ({
                                            ...prev,
                                            is_cashier_printer: e.target.value === '1',
                                        }))
                                    }
                                    className="mt-1 w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 font-medium text-stone-900 focus:border-sky-500 focus:bg-white focus:outline-none dark:border-stone-700 dark:bg-stone-800 dark:text-white dark:focus:bg-stone-800"
                                >
                                    <option value="1">Ya</option>
                                    <option value="0">Bukan</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* PENGATURAN MARGIN STRUK */}
                    <div className="border-t border-stone-200 pt-3 dark:border-stone-800">
                        <h4 className="mb-2.5 flex items-center gap-1.5 text-xs font-bold text-stone-900 dark:text-white">
                            <SlidersHorizontal className="h-3.5 w-3.5 text-sky-600" />
                            <span>Margin Kertas & Jarak Potong Struk</span>
                        </h4>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div>
                                <label className="text-[11px] font-semibold text-stone-600 dark:text-stone-300">
                                    Margin Kiri & Kanan (Padding Kertas)
                                </label>
                                <select
                                    value={printerForm.margin_horizontal || '2mm'}
                                    onChange={(e) =>
                                        setPrinterForm((prev) => ({
                                            ...prev,
                                            margin_horizontal: e.target.value,
                                        }))
                                    }
                                    className="mt-1 w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 font-medium text-stone-900 focus:border-sky-500 focus:bg-white focus:outline-none dark:border-stone-700 dark:bg-stone-800 dark:text-white dark:focus:bg-stone-800"
                                >
                                    <option value="0mm">0 mm (Rapat Tepi Kertas)</option>
                                    <option value="1mm">1 mm</option>
                                    <option value="2mm">2 mm (Standar Thermal)</option>
                                    <option value="3mm">3 mm</option>
                                    <option value="4mm">4 mm</option>
                                    <option value="5mm">5 mm (Margin Longgar)</option>
                                </select>
                            </div>

                            <div>
                                <label className="text-[11px] font-semibold text-stone-600 dark:text-stone-300">
                                    Margin Bawah / Jarak Potong (Feed Lines)
                                </label>
                                <select
                                    value={printerForm.margin_feed_lines || 2}
                                    onChange={(e) =>
                                        setPrinterForm((prev) => ({
                                            ...prev,
                                            margin_feed_lines: Number(e.target.value),
                                        }))
                                    }
                                    className="mt-1 w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 font-medium text-stone-900 focus:border-sky-500 focus:bg-white focus:outline-none dark:border-stone-700 dark:bg-stone-800 dark:text-white dark:focus:bg-stone-800"
                                >
                                    <option value="1">1 Baris</option>
                                    <option value="2">2 Baris (Standar)</option>
                                    <option value="3">3 Baris</option>
                                    <option value="4">4 Baris (Aman Pisau Potong Otomatis)</option>
                                    <option value="5">5 Baris</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Modal Footer */}
                <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 rounded-b-2xl border-t border-stone-200 bg-stone-50 p-4 dark:border-stone-800 dark:bg-stone-800/80">
                    <button
                        type="button"
                        onClick={handleResetPrinterDefaults}
                        className="flex cursor-pointer items-center gap-1.5 rounded-xl bg-rose-600 px-4 py-2.5 text-xs font-bold text-white shadow-xs transition hover:bg-rose-700 active:scale-95"
                    >
                        <X className="h-4 w-4" />
                        <span>Hapus</span>
                    </button>

                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => handleRunTestPrint('web')}
                            className="flex cursor-pointer items-center gap-1.5 rounded-xl bg-[#22c55e] px-4 py-2.5 text-xs font-bold text-white shadow-xs transition hover:bg-emerald-600 active:scale-95"
                        >
                            <Printer className="h-4 w-4" />
                            <span>Test Cetak</span>
                        </button>
                        <button
                            type="button"
                            onClick={async () => {
                                await handleSavePrinterSettings();
                                onClose();
                            }}
                            disabled={isSavingSettings}
                            className="flex cursor-pointer items-center gap-1.5 rounded-xl bg-[#0284c7] px-5 py-2.5 text-xs font-bold text-white shadow-xs transition hover:bg-sky-700 active:scale-95 disabled:opacity-50"
                        >
                            <Save className="h-4 w-4" />
                            <span>{isSavingSettings ? 'Menyimpan...' : 'Simpan'}</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
