import React from 'react';
import { X, Share2, Smartphone, Copy, Download, Printer } from 'lucide-react';
import { PreBillData } from '@/lib/thermal-printer';

interface SharePreBillModalProps {
    isOpen: boolean;
    onClose: () => void;
    customerPhone: string;
    setCustomerPhone: (val: string) => void;
    customerName: string;
    setCustomerName: (val: string) => void;
    includeBank: boolean;
    setIncludeBank: (val: boolean) => void;
    notes: string;
    setNotes: (val: string) => void;
    totalAmount: number;
    formatRp: (val: number) => string;
    currentPreBillData: PreBillData;
    generatePreBillWhatsAppText: (data: PreBillData) => string;
    onShareWhatsApp: () => void;
    onCopy: () => void;
    isCopied: boolean;
    onDownloadPdf: () => void;
    onPrint: () => void;
}

export const SharePreBillModal: React.FC<SharePreBillModalProps> = ({
    isOpen,
    onClose,
    customerPhone,
    setCustomerPhone,
    customerName,
    setCustomerName,
    includeBank,
    setIncludeBank,
    notes,
    setNotes,
    totalAmount,
    formatRp,
    currentPreBillData,
    generatePreBillWhatsAppText,
    onShareWhatsApp,
    onCopy,
    isCopied,
    onDownloadPdf,
    onPrint,
}) => {
    if (!isOpen) return null;

    return (
        <div className="pos-modal-overlay fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 p-3 sm:p-4">
            <div className="pos-gpu-layer my-auto w-full max-w-lg animate-in space-y-4 rounded-2xl border border-stone-200 bg-white p-5 text-stone-900 shadow-2xl duration-150 zoom-in-95 dark:border-stone-800 dark:bg-stone-900 dark:text-stone-100">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-stone-100 pb-3 dark:border-stone-800">
                    <div className="flex items-center gap-2.5">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400">
                            <Share2 className="h-5 w-5 stroke-[2.3]" />
                        </div>
                        <div>
                            <h3 className="text-base font-bold text-brand-950 dark:text-white">
                                Bagikan Struk Pesanan ke WhatsApp
                            </h3>
                            <p className="text-[11px] text-stone-500 dark:text-stone-300">
                                Kirim rincian struk estimasi pesanan langsung ke WhatsApp pelanggan
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="cursor-pointer rounded-lg p-1.5 text-stone-400 hover:bg-stone-100 hover:text-stone-700 dark:hover:bg-stone-800 dark:hover:text-stone-200"
                        aria-label="Tutup"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Feature Highlights Banner */}
                <div className="flex items-start gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50/80 p-3 text-xs text-emerald-950 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200">
                    <Share2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700 dark:text-emerald-400" />
                    <div className="text-[11px] leading-relaxed">
                        Struk belanja akan dikirim dalam format teks rapi ke WhatsApp pelanggan, lengkap dengan rincian pesanan dan total tagihan.
                    </div>
                </div>

                {/* Customer Info Form */}
                <div className="grid grid-cols-1 gap-3 text-xs sm:grid-cols-2">
                    <div>
                        <label className="flex items-center gap-1 text-[11px] font-bold text-stone-700 dark:text-stone-200">
                            <span>Nomor WhatsApp Pelanggan</span>
                        </label>
                        <input
                            type="tel"
                            autoFocus
                            value={customerPhone}
                            onChange={(e) => setCustomerPhone(e.target.value)}
                            placeholder="Contoh: 08123456789"
                            className="mt-1 w-full rounded-xl border border-stone-300 bg-stone-50 px-3 py-2 text-xs font-medium text-stone-900 focus:border-brand-600 focus:bg-white focus:ring-1 focus:ring-brand-600 focus:outline-none dark:border-stone-700 dark:bg-stone-800 dark:text-white dark:focus:border-emerald-500 dark:focus:bg-stone-900"
                        />
                        <span className="mt-0.5 block text-[10px] text-stone-500 dark:text-stone-400">
                            Format: 08xxx atau 628xxx
                        </span>
                    </div>

                    <div>
                        <label className="text-[11px] font-bold text-stone-700 dark:text-stone-200">
                            Nama Pelanggan (Opsional):
                        </label>
                        <input
                            type="text"
                            value={customerName}
                            onChange={(e) => setCustomerName(e.target.value)}
                            placeholder="Contoh: Kak Dinda / Meja 4"
                            className="mt-1 w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 text-xs font-medium text-stone-900 focus:border-brand-600 focus:bg-white focus:outline-none dark:border-stone-700 dark:bg-stone-800 dark:text-white dark:focus:border-emerald-500 dark:focus:bg-stone-900"
                        />
                    </div>
                </div>

                {/* Checkbox for Bank / QRIS Payment Details */}
                <div className="space-y-2 text-xs">
                    <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-stone-200 bg-stone-50 p-2.5 transition hover:bg-stone-100/70 dark:border-stone-700 dark:bg-stone-800 dark:hover:bg-stone-700">
                        <input
                            type="checkbox"
                            checked={includeBank}
                            onChange={(e) => setIncludeBank(e.target.checked)}
                            className="h-4 w-4 cursor-pointer rounded text-brand-700 accent-brand-700 dark:text-emerald-500 dark:accent-emerald-500"
                        />
                        <span className="text-[11px] font-medium text-stone-700 dark:text-stone-200">
                            Sertakan info rekening bank & QRIS (untuk pembayaran non-tunai)
                        </span>
                    </label>

                    <div>
                        <label className="text-[11px] font-medium text-stone-600 dark:text-stone-300">
                            Catatan Khusus (Opsional):
                        </label>
                        <input
                            type="text"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Contoh: Pesanan Takeaway / Meja Outdoor"
                            className="mt-1 w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-1.5 text-xs text-stone-900 focus:border-brand-600 focus:bg-white focus:outline-none dark:border-stone-700 dark:bg-stone-800 dark:text-white dark:focus:border-emerald-500 dark:focus:bg-stone-900"
                        />
                    </div>
                </div>

                {/* Message Preview Box */}
                <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[11px]">
                        <span className="flex items-center gap-1.5 font-bold text-stone-700 dark:text-stone-200">
                            <Smartphone className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                            <span>Pratinjau Struk Teks WhatsApp:</span>
                        </span>
                        <span className="text-stone-600 dark:text-stone-300">
                            Total:{' '}
                            <b className="text-stone-900 dark:text-white">
                                Rp {formatRp(totalAmount)}
                            </b>
                        </span>
                    </div>

                    <div className="rounded-xl border border-stone-200 bg-[#efeae2] p-3 shadow-inner dark:border-stone-700 dark:bg-stone-800">
                        <div className="max-h-48 overflow-y-auto rounded-lg rounded-tr-none border border-emerald-100/50 bg-white p-3 font-mono text-[11px] leading-relaxed whitespace-pre-wrap text-stone-800 shadow-xs dark:border-stone-700 dark:bg-stone-900 dark:text-stone-200">
                            {generatePreBillWhatsAppText(currentPreBillData)}
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-2 pt-2">
                    <div className="flex flex-wrap items-center gap-2">
                        <button
                            type="button"
                            onClick={onShareWhatsApp}
                            className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-emerald-700 active:scale-[0.99] dark:bg-emerald-600 dark:hover:bg-emerald-500"
                        >
                            <Share2 className="h-4 w-4" />
                            <span>Kirim Struk ke WA</span>
                        </button>

                        <button
                            type="button"
                            onClick={onCopy}
                            className="flex cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-stone-200 bg-stone-100 px-3 py-2.5 text-xs font-bold text-stone-800 transition hover:bg-stone-200 active:scale-95 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-200 dark:hover:bg-stone-700"
                            title="Salin teks struk ke clipboard"
                        >
                            <Copy className="h-4 w-4 text-stone-600 dark:text-stone-300" />
                            <span>{isCopied ? 'Tersalin!' : 'Salin Struk'}</span>
                        </button>

                        <button
                            type="button"
                            onClick={onDownloadPdf}
                            className="flex cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-[#273a41] px-3.5 py-2.5 text-xs font-bold text-white shadow-2xs transition hover:bg-[#1e2e34] active:scale-95 dark:bg-stone-800 dark:hover:bg-stone-700"
                            title="Download atau Cetak Invoice A4 format PDF"
                        >
                            <Download className="h-4 w-4" />
                            <span>Download PDF Invoice</span>
                        </button>

                        <button
                            type="button"
                            onClick={onPrint}
                            className="flex cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-stone-200 bg-stone-100 px-3 py-2.5 text-xs font-bold text-stone-800 transition hover:bg-stone-200 active:scale-95 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-200 dark:hover:bg-stone-700"
                            title="Cetak Bill Kasir Thermal (58mm/80mm)"
                        >
                            <Printer className="h-4 w-4 text-stone-700 dark:text-stone-300" />
                            <span>Cetak Kasir</span>
                        </button>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="w-full cursor-pointer rounded-xl py-2 text-xs font-semibold text-stone-500 transition hover:bg-stone-100 dark:text-stone-400 dark:hover:bg-stone-800"
                    >
                        Tutup
                    </button>
                </div>
            </div>
        </div>
    );
};
