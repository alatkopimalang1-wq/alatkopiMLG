import React from 'react';
import {
    Receipt,
    X,
    Banknote,
    QrCode,
    CreditCard,
    Building2,
    Truck,
    CheckCircle2,
} from 'lucide-react';
import { PaymentSettings } from '@/types/pos';

interface CheckoutModalProps {
    isOpen: boolean;
    onClose: () => void;
    totalAmount: number;
    discountAmount: number;
    numericShippingCost: number;
    paymentForm: PaymentSettings;
    paymentMethod: string;
    setPaymentMethod: (val: 'cash' | 'qris' | 'debit' | 'bank_transfer') => void;
    cashTendered: number | '';
    setCashTendered: (val: number | '') => void;
    quickCashOptions: number[];
    cashChange: number;
    customerName: string;
    setCustomerName: (val: string) => void;
    customerPhone: string;
    setCustomerPhone: (val: string) => void;
    isDeliveryOrder: boolean;
    setIsDeliveryOrder: (val: boolean) => void;
    shippingCost: number | '';
    setShippingCost: (val: number | '') => void;
    shippingCourier: string;
    setShippingCourier: (val: string) => void;
    customerAddress: string;
    setCustomerAddress: (val: string) => void;
    isSubmitting: boolean;
    handleProcessCheckout: () => void;
    formatRp: (val: number) => string;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
    isOpen,
    onClose,
    totalAmount,
    discountAmount,
    numericShippingCost,
    paymentForm,
    paymentMethod,
    setPaymentMethod,
    cashTendered,
    setCashTendered,
    quickCashOptions,
    cashChange,
    customerName,
    setCustomerName,
    customerPhone,
    setCustomerPhone,
    isDeliveryOrder,
    setIsDeliveryOrder,
    shippingCost,
    setShippingCost,
    shippingCourier,
    setShippingCourier,
    customerAddress,
    setCustomerAddress,
    isSubmitting,
    handleProcessCheckout,
    formatRp,
}) => {
    if (!isOpen) return null;

    const allMethods = [
        {
            id: 'cash' as const,
            label: 'Tunai (Cash)',
            icon: Banknote,
            enabled: paymentForm?.enable_cash ?? true,
        },
        {
            id: 'qris' as const,
            label: 'QRIS',
            icon: QrCode,
            enabled: paymentForm?.enable_qris ?? true,
        },
        {
            id: 'debit' as const,
            label: 'Debit / EDC',
            icon: CreditCard,
            enabled: paymentForm?.enable_debit ?? true,
        },
        {
            id: 'bank_transfer' as const,
            label: 'Transfer',
            icon: Building2,
            enabled: paymentForm?.enable_bank_transfer ?? true,
        },
    ];
    const available = allMethods.filter((m) => m.enabled);
    const toDisplay = available.length > 0 ? available : allMethods;

    return (
        <div className="pos-modal-overlay fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 p-3 sm:p-4">
            <div className="pos-gpu-layer my-auto w-full max-w-lg space-y-4 rounded-2xl border border-stone-200 bg-white p-5 text-stone-900 shadow-2xl dark:border-stone-800 dark:bg-stone-900 dark:text-stone-100">
                <div className="flex items-center justify-between border-b border-stone-100 pb-3 dark:border-stone-800">
                    <div className="flex items-center gap-2">
                        <Receipt className="h-5 w-5 text-brand-700 dark:text-amber-400" />
                        <h3 className="text-base font-bold text-brand-950 dark:text-white">
                            Pembayaran Kasir
                        </h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="cursor-pointer rounded-lg p-1 text-stone-400 hover:bg-stone-100 hover:text-stone-700 dark:hover:bg-stone-800 dark:hover:text-stone-200"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="rounded-xl border border-brand-200 bg-brand-50 p-4 text-center dark:border-stone-700 dark:bg-stone-800/90">
                    <span className="text-xs font-semibold text-brand-800 dark:text-amber-300">
                        Total Tagihan
                    </span>
                    <div className="mt-0.5 text-3xl font-black text-brand-950 dark:text-emerald-400">
                        Rp {formatRp(totalAmount)}
                    </div>
                    <div className="mt-1 flex flex-wrap items-center justify-center gap-3 text-xs">
                        {discountAmount > 0 && (
                            <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                                Diskon: -Rp {formatRp(discountAmount)}
                            </span>
                        )}
                        {numericShippingCost > 0 && (
                            <span className="font-semibold text-blue-700 dark:text-blue-400">
                                Ongkir: +Rp {formatRp(numericShippingCost)}
                            </span>
                        )}
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-semibold text-stone-700 dark:text-stone-200">
                        Metode Pembayaran:
                    </label>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                        {toDisplay.map((m) => {
                            const Icon = m.icon;
                            const isSelected = paymentMethod === m.id;
                            return (
                                <button
                                    key={m.id}
                                    type="button"
                                    onClick={() => setPaymentMethod(m.id)}
                                    className={`flex cursor-pointer flex-col items-center gap-1.5 rounded-xl border p-2.5 text-xs font-semibold transition ${
                                        isSelected
                                            ? 'border-brand-700 bg-brand-700 text-white shadow-xs dark:border-emerald-600 dark:bg-emerald-600'
                                            : 'border-stone-200 bg-stone-50 text-stone-700 hover:bg-stone-100 hover:text-brand-950 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-200 dark:hover:bg-stone-700 dark:hover:text-white'
                                    }`}
                                >
                                    <Icon className="h-4 w-4" />
                                    <span>{m.label}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {paymentMethod === 'cash' && (
                    <div className="space-y-3 rounded-xl border border-stone-200 bg-stone-50 p-3.5 dark:border-stone-700 dark:bg-stone-800/70">
                        <div>
                            <label className="text-xs font-semibold text-stone-700 dark:text-stone-200">
                                Uang Tunai Diterima:
                            </label>
                            <div className="relative mt-1">
                                <span className="absolute top-1/2 left-3 -translate-y-1/2 text-sm font-bold text-stone-400 dark:text-stone-400">
                                    Rp
                                </span>
                                <input
                                    type="number"
                                    value={cashTendered === '' ? '' : cashTendered}
                                    onChange={(e) => {
                                        const val =
                                            e.target.value === ''
                                                ? ''
                                                : parseFloat(e.target.value);
                                        setCashTendered(val);
                                    }}
                                    className="w-full rounded-xl border border-stone-300 bg-white py-2.5 pr-4 pl-10 text-lg font-bold text-stone-900 focus:border-brand-600 focus:ring-1 focus:ring-brand-600 focus:outline-none dark:border-stone-700 dark:bg-stone-900 dark:text-white dark:focus:border-emerald-500"
                                    placeholder="0"
                                    autoFocus
                                />
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-1.5">
                            {(quickCashOptions || []).map((opt) => (
                                <button
                                    key={opt}
                                    type="button"
                                    onClick={() => setCashTendered(opt)}
                                    className="cursor-pointer rounded-lg border border-stone-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-stone-700 shadow-2xs transition hover:border-brand-300 hover:bg-brand-50 hover:text-brand-950 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-200 dark:hover:bg-stone-700 dark:hover:text-white"
                                >
                                    {opt === totalAmount ? 'Uang Pas' : `Rp ${formatRp(opt)}`}
                                </button>
                            ))}
                        </div>

                        <div className="flex items-center justify-between border-t border-stone-200 pt-2 text-sm dark:border-stone-700">
                            <span className="font-semibold text-stone-600 dark:text-stone-300">
                                Kembalian:
                            </span>
                            <span
                                className={`text-base font-black ${
                                    (cashChange || 0) > 0
                                        ? 'text-emerald-700 dark:text-emerald-400'
                                        : 'text-stone-800 dark:text-stone-300'
                                }`}
                            >
                                Rp {formatRp(cashChange || 0)}
                            </span>
                        </div>
                    </div>
                )}

                {paymentMethod === 'qris' && (
                    <div className="space-y-2 rounded-xl border border-stone-200 bg-stone-50 p-4 text-center dark:border-stone-700 dark:bg-stone-800/70">
                        <QrCode className="mx-auto h-12 w-12 text-brand-700 dark:text-emerald-400" />
                        <p className="text-xs font-semibold text-stone-900 dark:text-stone-100">
                            {paymentForm?.qris_instructions ||
                                'Tampilkan QRIS Kasir Sanubari kepada Pelanggan'}
                        </p>
                        <p className="text-[11px] text-stone-500 dark:text-stone-300">
                            Total bayar:{' '}
                            <b className="text-brand-950 dark:text-emerald-400">
                                Rp {formatRp(totalAmount)}
                            </b>
                            .
                        </p>
                    </div>
                )}

                {paymentMethod === 'debit' && (
                    <div className="space-y-2 rounded-xl border border-stone-200 bg-stone-50 p-4 text-center dark:border-stone-700 dark:bg-stone-800/70">
                        <CreditCard className="mx-auto h-10 w-10 text-brand-700 dark:text-emerald-400" />
                        <p className="text-xs font-semibold text-stone-900 dark:text-stone-100">
                            Gesek / Tap Kartu pada Mesin EDC Kasir
                        </p>
                        <p className="text-[11px] text-stone-500 dark:text-stone-300">
                            Total bayar:{' '}
                            <b className="text-brand-950 dark:text-emerald-400">
                                Rp {formatRp(totalAmount)}
                            </b>
                            . Pastikan transaksi mesin EDC berhasil.
                        </p>
                    </div>
                )}

                {paymentMethod === 'bank_transfer' && (
                    <div className="space-y-2 rounded-xl border border-stone-200 bg-stone-50 p-4 text-center dark:border-stone-700 dark:bg-stone-800/70">
                        <Building2 className="mx-auto h-10 w-10 text-brand-700 dark:text-emerald-400" />
                        <p className="text-xs font-semibold text-stone-900 dark:text-stone-100">
                            Rekening Transfer:{' '}
                            {paymentForm?.bank_info ||
                                'BCA 123-456-7890 a/n Alat Kopi Malang'}
                        </p>
                        <p className="text-[11px] text-stone-500 dark:text-stone-300">
                            Nominal pas:{' '}
                            <b className="text-brand-950 dark:text-emerald-400">
                                Rp {formatRp(totalAmount)}
                            </b>
                            .
                        </p>
                    </div>
                )}

                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                    <div>
                        <label className="text-[11px] font-medium text-stone-600 dark:text-stone-300">
                            Nama Pelanggan (Opsional):
                        </label>
                        <input
                            type="text"
                            value={customerName}
                            onChange={(e) => setCustomerName(e.target.value)}
                            placeholder="Contoh: Kak Dika"
                            className="mt-1 w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 text-xs text-stone-900 focus:border-brand-600 focus:bg-white focus:outline-none dark:border-stone-700 dark:bg-stone-800 dark:text-white dark:focus:border-emerald-500 dark:focus:bg-stone-900"
                        />
                    </div>
                    <div>
                        <label className="text-[11px] font-medium text-stone-600 dark:text-stone-300">
                            No. WhatsApp (Struk e-Receipt):
                        </label>
                        <input
                            type="tel"
                            value={customerPhone}
                            onChange={(e) => setCustomerPhone(e.target.value)}
                            placeholder="0812xxxx"
                            className="mt-1 w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 text-xs text-stone-900 focus:border-brand-600 focus:bg-white focus:outline-none dark:border-stone-700 dark:bg-stone-800 dark:text-white dark:focus:border-emerald-500 dark:focus:bg-stone-900"
                        />
                    </div>
                </div>

                {/* Pengiriman / Ongkir Option in Checkout Modal */}
                <div className="space-y-2 rounded-xl border border-stone-200 bg-stone-50 p-3 dark:border-stone-700 dark:bg-stone-800/60">
                    <div className="flex items-center justify-between">
                        <label className="flex cursor-pointer items-center gap-2 text-xs font-bold text-stone-800 select-none dark:text-stone-200">
                            <input
                                type="checkbox"
                                checked={isDeliveryOrder}
                                onChange={(e) => setIsDeliveryOrder(e.target.checked)}
                                className="h-4 w-4 cursor-pointer rounded text-brand-700 focus:ring-brand-500 dark:text-emerald-500"
                            />
                            <Truck className="h-4 w-4 text-brand-700 dark:text-amber-400" />
                            <span>Pesanan Butuh Pengiriman (Ongkir)</span>
                        </label>
                        {isDeliveryOrder && (
                            <span className="rounded border border-blue-200 bg-blue-50 px-1.5 py-0.5 text-[10px] font-bold text-blue-700 dark:border-blue-800 dark:bg-blue-950/60 dark:text-blue-300">
                                Rp {formatRp(numericShippingCost)}
                            </span>
                        )}
                    </div>

                    {isDeliveryOrder && (
                        <div className="animate-in space-y-2 border-t border-stone-200 pt-2 fade-in dark:border-stone-700">
                            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                                <div>
                                    <label className="text-[11px] font-medium text-stone-600 dark:text-stone-300">
                                        Nominal Ongkir (Rp):
                                    </label>
                                    <div className="relative mt-1">
                                        <span className="absolute top-1/2 left-2.5 -translate-y-1/2 text-xs font-bold text-stone-400">
                                            Rp
                                        </span>
                                        <input
                                            type="number"
                                            min="0"
                                            value={shippingCost === '' ? '' : shippingCost}
                                            onChange={(e) => {
                                                const val =
                                                    e.target.value === ''
                                                        ? ''
                                                        : Math.max(
                                                              0,
                                                              parseFloat(e.target.value) || 0,
                                                          );
                                                setShippingCost(val);
                                            }}
                                            placeholder="0"
                                            className="w-full rounded-xl border border-stone-200 bg-white py-2 pr-3 pl-8 text-xs font-bold text-stone-900 focus:border-brand-600 focus:outline-none dark:border-stone-700 dark:bg-stone-900 dark:text-white dark:focus:border-emerald-500"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-[11px] font-medium text-stone-600 dark:text-stone-300">
                                        Kurir / Ekspedisi (Opsional):
                                    </label>
                                    <input
                                        type="text"
                                        value={shippingCourier}
                                        onChange={(e) => setShippingCourier(e.target.value)}
                                        placeholder="J&T / JNE / SiCepat / Lalamove / Grab..."
                                        className="mt-1 w-full rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs text-stone-900 focus:border-brand-600 focus:outline-none dark:border-stone-700 dark:bg-stone-900 dark:text-white dark:focus:border-emerald-500"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="text-[11px] font-medium text-stone-600 dark:text-stone-300">
                                    Alamat Pengiriman Lengkap:
                                </label>
                                <textarea
                                    rows={2}
                                    value={customerAddress}
                                    onChange={(e) => setCustomerAddress(e.target.value)}
                                    placeholder="Contoh: Jl. Sukarno Hatta No. 45, Lowokwaru, Kota Malang..."
                                    className="mt-1 w-full resize-none rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs text-stone-900 focus:border-brand-600 focus:outline-none dark:border-stone-700 dark:bg-stone-900 dark:text-white dark:focus:border-emerald-500"
                                />
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-2 pt-2">
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 cursor-pointer rounded-xl bg-stone-100 px-4 py-3 text-xs font-bold text-stone-700 transition hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-200 dark:hover:bg-stone-700"
                    >
                        Batal
                    </button>
                    <button
                        type="button"
                        disabled={isSubmitting}
                        onClick={handleProcessCheckout}
                        className="flex flex-2 cursor-pointer items-center justify-center gap-2 rounded-xl bg-brand-700 px-4 py-3 text-sm font-black text-white shadow-md transition hover:bg-brand-800 active:scale-95 disabled:opacity-50 dark:bg-emerald-600 dark:hover:bg-emerald-500"
                    >
                        {isSubmitting ? (
                            <span>Memproses...</span>
                        ) : (
                            <>
                                <CheckCircle2 className="h-4 w-4" />
                                <span>SELESAIKAN TRANSAKSI</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};
