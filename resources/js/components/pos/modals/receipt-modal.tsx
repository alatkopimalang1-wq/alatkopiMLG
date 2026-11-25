import { PrinterSettings } from '@/types/pos';
import React from 'react';
import { RotateCcw, Eye, Check, Printer, Smartphone, Share2, Download, Plus, X } from 'lucide-react';
import {
    ReceiptData,
    BluetoothPrinterDevice,
    printThermalWeb,
    generateWhatsAppReceiptUrl,
    printA4InvoiceWeb,
} from '@/lib/thermal-printer';
import { ThermalReceiptPreview } from '@/components/pos/thermal-receipt-preview';

interface ReceiptModalProps {
    isOpen: boolean;
    receipt: ReceiptData | null;
    onClose: () => void;
    printerForm: PrinterSettings;
    isMobilePos: boolean;
    handleBluetoothPrint: (receipt: ReceiptData) => void;
    isBtPrinting: boolean;
    connectedBtPrinter: BluetoothPrinterDevice | null;
    openBluetoothScannerModal: (receipt: ReceiptData) => void;
    showToast: (msg: string) => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
    isOpen,
    receipt,
    onClose,
    printerForm,
    isMobilePos,
    handleBluetoothPrint,
    isBtPrinting,
    connectedBtPrinter,
    openBluetoothScannerModal,
    showToast,
}) => {
    if (!isOpen || !receipt) return null;

    return (
        <div className="pos-modal-overlay fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 p-3 sm:p-4">
            <div className="pos-gpu-layer my-auto w-full max-w-md space-y-4 rounded-2xl border border-stone-200 bg-white p-5 text-stone-900 shadow-2xl dark:border-stone-800 dark:bg-stone-900 dark:text-stone-100">
                <div className="space-y-1 text-center">
                    {receipt.is_refund ? (
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-rose-200 bg-rose-100 text-rose-700 dark:border-rose-800 dark:bg-rose-950/50 dark:text-rose-400">
                            <RotateCcw className="h-6 w-6 stroke-[3]" />
                        </div>
                    ) : receipt.order_number.startsWith('TEST-') ? (
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-sky-200 bg-sky-100 text-sky-700 dark:border-sky-800 dark:bg-sky-950/50 dark:text-sky-400">
                            <Eye className="h-6 w-6 stroke-[2.5]" />
                        </div>
                    ) : (
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-emerald-200 bg-emerald-100 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-400">
                            <Check className="h-6 w-6 stroke-[3]" />
                        </div>
                    )}
                    <h3 className="text-base font-bold text-brand-950 dark:text-white">
                        {receipt.is_refund
                            ? 'Struk Bukti Refund'
                            : receipt.order_number.startsWith('TEST-')
                              ? 'Pratinjau Struk Kasir'
                              : 'Transaksi Berhasil!'}
                    </h3>
                    <p className="text-xs text-stone-500 dark:text-stone-300">
                        {receipt.order_number.startsWith('TEST-') ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                                Preview di Aplikasi POS (Bukan Chrome)
                            </span>
                        ) : (
                            <>
                                No. Struk:{' '}
                                <span className="font-mono font-bold text-brand-800 dark:text-amber-300">
                                    #{receipt.order_number}
                                </span>
                            </>
                        )}
                    </p>
                </div>

                {/* In-App Realistic Thermal Receipt Preview */}
                <div className="max-h-[50vh] overflow-y-auto rounded-xl bg-stone-100/90 p-3 flex justify-center shadow-inner dark:bg-stone-950/60">
                    <ThermalReceiptPreview
                        receipt={receipt}
                        paperWidth={printerForm.paper_width}
                        customPaperWidthMm={printerForm.custom_paper_width_mm}
                        receiptColumns={
                            printerForm.receipt_columns ||
                            (printerForm.paper_width === '80mm'
                                ? printerForm.receipt_columns_80mm || 44
                                : printerForm.paper_width === 'custom'
                                  ? printerForm.custom_receipt_columns || 40
                                  : printerForm.receipt_columns_58mm || 32)
                        }
                        showLogo={printerForm.show_logo !== false}
                        fontFamily={printerForm.font_family}
                        fontSize={printerForm.font_size}
                        fontWeight={printerForm.font_weight}
                    />
                </div>

                <div className="space-y-2">
                    <div className={`grid ${isMobilePos ? 'grid-cols-1' : 'grid-cols-2'} gap-2`}>
                        {!isMobilePos && (
                            <button
                                type="button"
                                onClick={() => printThermalWeb(receipt, printerForm)}
                                className="hidden md:flex cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-xs font-bold text-stone-800 shadow-2xs transition hover:bg-stone-50 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-100 dark:hover:bg-stone-700"
                            >
                                <Printer className="h-4 w-4 text-brand-700 dark:text-amber-400" />
                                <span>Cetak USB ({printerForm.paper_width})</span>
                            </button>
                        )}

                        <button
                            type="button"
                            onClick={() => handleBluetoothPrint(receipt)}
                            disabled={isBtPrinting}
                            className="flex cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-emerald-300 bg-emerald-50 px-3 py-2.5 text-xs font-bold text-emerald-900 shadow-2xs transition hover:bg-emerald-100 disabled:opacity-50 dark:border-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-200 dark:hover:bg-emerald-900/60"
                        >
                            <Smartphone className="h-4 w-4 text-emerald-700 dark:text-emerald-400" />
                            <span className="truncate">
                                {isBtPrinting
                                    ? 'Mencetak...'
                                    : connectedBtPrinter
                                      ? `Cetak BT (${connectedBtPrinter.name})`
                                      : 'Cetak Bluetooth'}
                            </span>
                        </button>
                    </div>

                    {connectedBtPrinter && (
                        <div className="flex items-center justify-between rounded-lg border border-emerald-200/80 bg-emerald-50/60 px-2.5 py-1.5 text-[11px] dark:border-emerald-800/50 dark:bg-emerald-950/30">
                            <span className="truncate font-semibold text-emerald-800 dark:text-emerald-300">
                                ✓ Printer: {connectedBtPrinter.name}
                            </span>
                            <button
                                type="button"
                                onClick={() => openBluetoothScannerModal(receipt)}
                                className="ml-2 shrink-0 cursor-pointer font-bold text-emerald-700 underline hover:text-emerald-900 dark:text-emerald-400"
                            >
                                Ganti Printer
                            </button>
                        </div>
                    )}

                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                        <a
                            href={generateWhatsAppReceiptUrl(receipt, receipt.customer_phone)}
                            target="_blank"
                            rel="noreferrer"
                            className="flex cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-center text-xs font-bold text-emerald-800 shadow-2xs transition hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 dark:hover:bg-emerald-900/50"
                        >
                            <Share2 className="h-4 w-4" />
                            <span>Kirim Struk via WA</span>
                        </a>

                        <button
                            type="button"
                            onClick={() => {
                                printA4InvoiceWeb({
                                    store_name: receipt.store_name,
                                    tagline: receipt.tagline,
                                    address: receipt.address,
                                    phone: receipt.phone,
                                    instagram: receipt.instagram,
                                    cashier_name: receipt.cashier_name,
                                    customer_name: receipt.customer_name,
                                    customer_phone: receipt.customer_phone,
                                    customer_address: receipt.customer_address,
                                    shipping_cost: receipt.shipping_cost,
                                    shipping_courier: receipt.shipping_courier,
                                    notes: `No. Struk: #${receipt.order_number} | Metode: ${receipt.payment_method_label}`,
                                    items: receipt.items.map((i) => ({
                                        product_name: i.product_name,
                                        variant_label: i.variant_label,
                                        quantity: i.quantity,
                                        price: i.price,
                                        subtotal: i.subtotal,
                                    })),
                                    subtotal: receipt.subtotal,
                                    discount_amount: receipt.discount_amount,
                                    total_amount: receipt.total_amount,
                                    date: receipt.date,
                                });
                                showToast('Mengunduh file PDF Invoice A4...');
                            }}
                            className="flex cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-[#273a41] px-3 py-2.5 text-xs font-bold text-white shadow-2xs transition hover:bg-[#1e2e34] dark:bg-stone-800 dark:hover:bg-stone-700"
                        >
                            <Download className="h-4 w-4" />
                            <span>Download PDF Invoice</span>
                        </button>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={onClose}
                    className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-brand-700 px-4 py-3 text-sm font-bold text-white shadow-md transition hover:bg-brand-800 active:scale-95 dark:bg-emerald-600 dark:hover:bg-emerald-500"
                >
                    {receipt.order_number.startsWith('TEST-') ? (
                        <>
                            <X className="h-4 w-4" />
                            <span>TUTUP PRATINJAU</span>
                        </>
                    ) : (
                        <>
                            <Plus className="h-4 w-4" />
                            <span>TRANSAKSI BARU</span>
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};
