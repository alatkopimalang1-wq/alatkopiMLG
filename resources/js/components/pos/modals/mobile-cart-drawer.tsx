import React from 'react';
import {
    ShoppingCart,
    Share2,
    Clock,
    X,
    Calculator,
    Pencil,
    Minus,
    Plus,
    Truck,
    ChevronRight,
} from 'lucide-react';
import { CartItem } from '@/types/pos';

interface MobileCartDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    totalItemsCount: number;
    cart: CartItem[];
    openSharePreBillModal: () => void;
    openHoldModal: () => void;
    openManualOrderModal: (item: CartItem) => void;
    openItemDiscountModal: (item: CartItem) => void;
    updateQuantity: (id: string, delta: number) => void;
    discountAmount: number;
    isDeliveryOrder: boolean;
    setIsDeliveryOrder: (val: boolean) => void;
    numericShippingCost: number;
    shippingCost: number | '';
    setShippingCost: (val: number | '') => void;
    customerAddress: string;
    setCustomerAddress: (val: string) => void;
    shippingCourier: string;
    setShippingCourier: (val: string) => void;
    grossSubtotal: number;
    cartDiscountValue: number;
    cartDiscountType: 'none' | 'percent' | 'nominal';
    openCartDiscountModal: () => void;
    totalItemDiscounts: number;
    cartDiscountAmount: number;
    totalAmount: number;
    openCheckout: () => void;
    formatRp: (val: number) => string;
}

export const MobileCartDrawer: React.FC<MobileCartDrawerProps> = ({
    isOpen,
    onClose,
    totalItemsCount,
    cart,
    openSharePreBillModal,
    openHoldModal,
    openManualOrderModal,
    openItemDiscountModal,
    updateQuantity,
    discountAmount,
    isDeliveryOrder,
    setIsDeliveryOrder,
    numericShippingCost,
    shippingCost,
    setShippingCost,
    customerAddress,
    setCustomerAddress,
    shippingCourier,
    setShippingCourier,
    grossSubtotal,
    cartDiscountValue,
    cartDiscountType,
    openCartDiscountModal,
    totalItemDiscounts,
    cartDiscountAmount,
    totalAmount,
    openCheckout,
    formatRp,
}) => {
    if (!isOpen) return null;

    return (
        <div className="pos-modal-overlay fixed inset-0 z-50 flex animate-in flex-col justify-end duration-200 fade-in md:hidden">
            <div className="fixed inset-0 cursor-pointer bg-black/70" onClick={onClose} />
            <div className="pos-gpu-layer relative z-10 flex max-h-[85vh] animate-in flex-col rounded-t-3xl border-t border-stone-200 bg-white text-stone-900 shadow-2xl duration-200 slide-in-from-bottom dark:border-stone-800 dark:bg-stone-900 dark:text-stone-100">
                <div className="flex items-center justify-between border-b border-stone-200 p-4 dark:border-stone-800">
                    <div className="flex items-center gap-2">
                        <ShoppingCart className="h-5 w-5 shrink-0 text-stone-800 dark:text-stone-200" />
                        <span className="text-xs font-bold text-stone-600 dark:text-stone-400">
                            ({totalItemsCount} item)
                        </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        {cart.length > 0 && (
                            <>
                                <button
                                    type="button"
                                    onClick={() => {
                                        onClose();
                                        openSharePreBillModal();
                                    }}
                                    className="flex cursor-pointer items-center gap-1 rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-800 transition hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 dark:hover:bg-emerald-900"
                                    title="Share Struk ke WA"
                                >
                                    <Share2 className="h-3.5 w-3.5 text-emerald-700 dark:text-emerald-400" />
                                    <span>Share WA</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        onClose();
                                        openHoldModal();
                                    }}
                                    className="flex cursor-pointer items-center gap-1 rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-800 transition hover:bg-amber-100 dark:border-amber-800 dark:bg-amber-950/60 dark:text-amber-300 dark:hover:bg-amber-900"
                                    title="Simpan ke antrian"
                                >
                                    <Clock className="h-3.5 w-3.5 text-amber-700 dark:text-amber-400" />
                                    <span>Antrian</span>
                                </button>
                            </>
                        )}
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-lg p-1 text-stone-400 hover:bg-stone-100 hover:text-stone-700 dark:text-stone-500 dark:hover:bg-stone-800 dark:hover:text-stone-200"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>
                </div>

                <div className="max-h-[45vh] flex-1 touch-pan-y space-y-2.5 overflow-y-auto overscroll-y-contain bg-stone-50/40 p-4 dark:bg-stone-950/40">
                    {cart.length === 0 ? (
                        <div className="py-12 text-center text-stone-500 dark:text-stone-400">
                            <ShoppingCart className="mx-auto mb-2 h-10 w-10 text-stone-400 dark:text-stone-500" />
                            <p className="text-sm font-semibold text-stone-700 dark:text-stone-300">
                                Keranjang Masih Kosong
                            </p>
                        </div>
                    ) : (
                        cart.map((item) => (
                            <div
                                key={item.id}
                                className="dark:bg-stone-850 flex items-center gap-3 rounded-2xl border border-stone-200/90 bg-white p-3 shadow-2xs sm:p-3.5 dark:border-stone-800 dark:bg-stone-900"
                            >
                                {item.is_manual ? (
                                    <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-xl border border-amber-300 bg-amber-500/10 text-amber-700 sm:h-16 sm:w-16 dark:border-amber-700/60 dark:bg-amber-400/10 dark:text-amber-400">
                                        <Calculator className="h-5 w-5 stroke-[2]" />
                                        <span className="mt-0.5 text-[9px] font-black tracking-wider uppercase">
                                            Manual
                                        </span>
                                    </div>
                                ) : (
                                    <img
                                        src={item.image || '/brand/logo-circle.png'}
                                        alt={item.product_name}
                                        onError={(e) => {
                                            const target = e.currentTarget;
                                            if (!target.src.endsWith('/brand/logo-circle.png')) {
                                                target.src = '/brand/logo-circle.png';
                                            }
                                        }}
                                        className="h-14 w-14 shrink-0 rounded-xl border border-stone-200 bg-stone-100 object-cover sm:h-16 sm:w-16 dark:border-stone-700 dark:bg-stone-800"
                                    />
                                )}
                                <div className="min-w-0 flex-1">
                                    <div className="flex flex-wrap items-center gap-1.5">
                                        <h4 className="truncate text-sm leading-snug font-bold text-stone-900 dark:text-white">
                                            {item.product_name}
                                        </h4>
                                        {item.is_manual && (
                                            <span className="py-0.2 rounded border border-amber-300 bg-amber-100 px-1.5 text-[10px] font-extrabold text-amber-800 dark:border-amber-700 dark:bg-amber-950/60 dark:text-amber-300">
                                                Manual
                                            </span>
                                        )}
                                    </div>
                                    <div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-stone-600 dark:text-stone-300">
                                        <span className="rounded-md border border-brand-200 bg-brand-50 px-1.5 py-0.5 text-[11px] font-bold text-brand-800 dark:border-stone-700 dark:bg-stone-800 dark:text-amber-300">
                                            {item.variant_label}
                                        </span>
                                        <span className="font-medium text-stone-500 dark:text-stone-400">
                                            @ Rp {formatRp(item.price)}
                                        </span>
                                        {item.is_manual && (
                                            <>
                                                <span className="text-[11px] font-semibold text-rose-600 dark:text-rose-400">
                                                    (HPP: Rp {formatRp(item.cost_price || 0)})
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        onClose();
                                                        openManualOrderModal(item);
                                                    }}
                                                    className="ml-1 flex cursor-pointer items-center gap-0.5 text-[11px] font-bold text-brand-700 hover:underline dark:text-amber-400"
                                                >
                                                    <Pencil className="h-2.5 w-2.5" />
                                                    <span>Edit</span>
                                                </button>
                                            </>
                                        )}
                                    </div>

                                    {item.is_manual && (
                                        <div className="mt-1 flex items-center gap-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
                                            <span>
                                                Laba Kotor: +Rp{' '}
                                                {formatRp((item.price - (item.cost_price || 0)) * item.quantity)}
                                            </span>
                                            {item.price > 0 && (
                                                <span className="text-[10px] text-stone-400 dark:text-stone-500">
                                                    (
                                                    {(
                                                        ((item.price - (item.cost_price || 0)) / item.price) *
                                                        100
                                                    ).toFixed(0)}
                                                    %)
                                                </span>
                                            )}
                                        </div>
                                    )}

                                    {/* Item Pricing & Discount Badge */}
                                    <div className="mt-2 flex flex-wrap items-center gap-1.5">
                                        {item.discount_amount && item.discount_amount > 0 ? (
                                            <>
                                                <span className="text-sm font-black text-brand-900 dark:text-emerald-400">
                                                    Rp {formatRp(item.price * item.quantity - item.discount_amount)}
                                                </span>
                                                <s className="text-xs font-normal text-stone-400 dark:text-stone-400">
                                                    Rp {formatRp(item.price * item.quantity)}
                                                </s>
                                                <button
                                                    type="button"
                                                    onClick={() => openItemDiscountModal(item)}
                                                    className="cursor-pointer rounded border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-xs font-bold text-emerald-800 transition hover:bg-emerald-100 active:scale-95 dark:border-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-200 dark:hover:bg-emerald-900"
                                                >
                                                    {item.discount_type === 'percent'
                                                        ? `-${item.discount_value}%`
                                                        : `-Rp ${formatRp(item.discount_amount)}`}{' '}
                                                    ✎
                                                </button>
                                            </>
                                        ) : (
                                            <>
                                                <span className="text-sm font-black text-brand-900 dark:text-emerald-400">
                                                    Rp {formatRp(item.price * item.quantity)}
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={() => openItemDiscountModal(item)}
                                                    className="rounded border border-dashed border-stone-300 px-2 py-0.5 text-xs font-semibold text-stone-600 hover:text-brand-800 dark:border-stone-600 dark:bg-stone-800/80 dark:text-stone-300 dark:hover:text-white"
                                                >
                                                    + Diskon
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>

                                <div className="flex shrink-0 items-center gap-1 rounded-xl border border-stone-200 bg-stone-100 p-1 dark:border-stone-700 dark:bg-stone-900">
                                    <button
                                        type="button"
                                        onClick={() => updateQuantity(item.id, -1)}
                                        className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg text-stone-700 transition hover:bg-stone-200 hover:text-stone-950 active:scale-95 sm:h-8 sm:w-8 dark:text-stone-200 dark:hover:bg-stone-800 dark:hover:text-white"
                                    >
                                        <Minus className="h-4 w-4" />
                                    </button>
                                    <span className="w-7 text-center text-sm font-black text-stone-900 dark:text-white">
                                        {item.quantity}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => updateQuantity(item.id, 1)}
                                        className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg text-stone-700 transition hover:bg-stone-200 hover:text-stone-950 active:scale-95 sm:h-8 sm:w-8 dark:text-stone-200 dark:hover:bg-stone-800 dark:hover:text-white"
                                    >
                                        <Plus className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Sticky Drawer Footer Summary */}
                <div className="max-h-[75vh] shrink-0 touch-pan-y space-y-3 overflow-y-auto overscroll-y-contain border-t border-stone-200 bg-white p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] shadow-[0_-4px_16px_rgba(0,0,0,0.12)] dark:border-stone-800 dark:bg-stone-900">
                    {/* Item count indicator & Hemat */}
                    <div className="flex items-center justify-between border-b border-stone-100 pb-2 text-xs text-stone-600 dark:border-stone-800 dark:text-stone-300">
                        <div className="flex items-center gap-1.5 font-bold text-brand-800 dark:text-stone-200">
                            <ShoppingCart className="h-4 w-4 text-brand-700 dark:text-emerald-400" />
                            <span>{totalItemsCount} item di struk</span>
                        </div>
                        {discountAmount > 0 && (
                            <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
                                Hemat Rp {formatRp(discountAmount)}
                            </span>
                        )}
                    </div>

                    {/* Pengiriman / Ongkos Kirim POS Section (Mobile) */}
                    <div className="space-y-2 rounded-xl border border-stone-200 bg-stone-50 p-2.5 dark:border-stone-700/80 dark:bg-stone-800/60">
                        <div className="flex items-center justify-between">
                            <label className="flex cursor-pointer items-center gap-2 text-xs font-bold text-stone-800 select-none dark:text-stone-200">
                                <input
                                    type="checkbox"
                                    checked={isDeliveryOrder}
                                    onChange={(e) => setIsDeliveryOrder(e.target.checked)}
                                    className="h-4 w-4 cursor-pointer rounded text-brand-700 focus:ring-brand-500 dark:text-emerald-500"
                                />
                                <Truck className="h-4 w-4 text-brand-700 dark:text-amber-400" />
                                <span>Kirim Pesanan (Ongkir)</span>
                            </label>
                            {isDeliveryOrder && numericShippingCost > 0 && (
                                <span className="rounded border border-blue-200 bg-blue-50 px-1.5 py-0.5 text-[10px] font-bold text-blue-700 dark:border-blue-800 dark:bg-blue-950/60 dark:text-blue-300">
                                    Rp {formatRp(numericShippingCost)}
                                </span>
                            )}
                        </div>

                        {isDeliveryOrder && (
                            <div className="animate-in space-y-2 border-t border-stone-200 pt-1.5 fade-in dark:border-stone-700">
                                <div>
                                    <label className="text-[11px] font-semibold text-stone-600 dark:text-stone-300">
                                        Nominal Ongkir (Rp):
                                    </label>
                                    <div className="relative mt-0.5">
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
                                                        : Math.max(0, parseFloat(e.target.value) || 0);
                                                setShippingCost(val);
                                            }}
                                            placeholder="0"
                                            className="w-full rounded-lg border border-stone-300 bg-white py-1.5 pr-2.5 pl-8 text-xs font-bold text-stone-900 focus:border-brand-600 focus:outline-none dark:border-stone-700 dark:bg-stone-900 dark:text-white dark:focus:border-emerald-500"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="text-[11px] font-semibold text-stone-600 dark:text-stone-300">
                                        Alamat Pengiriman:
                                    </label>
                                    <textarea
                                        rows={2}
                                        value={customerAddress}
                                        onChange={(e) => setCustomerAddress(e.target.value)}
                                        placeholder="Alamat lengkap tujuan kirim..."
                                        className="mt-0.5 w-full resize-none rounded-lg border border-stone-300 bg-white px-2.5 py-1.5 text-xs text-stone-900 focus:border-brand-600 focus:outline-none dark:border-stone-700 dark:bg-stone-900 dark:text-white dark:focus:border-emerald-500"
                                    />
                                </div>

                                <div>
                                    <label className="text-[11px] font-semibold text-stone-600 dark:text-stone-300">
                                        Kurir / Ekspedisi (Opsional):
                                    </label>
                                    <input
                                        type="text"
                                        value={shippingCourier}
                                        onChange={(e) => setShippingCourier(e.target.value)}
                                        placeholder="J&T / JNE / SiCepat / Lalamove / Grab..."
                                        className="mt-0.5 w-full rounded-lg border border-stone-300 bg-white px-2.5 py-1.5 text-xs text-stone-900 focus:border-brand-600 focus:outline-none dark:border-stone-700 dark:bg-stone-900 dark:text-white dark:focus:border-emerald-500"
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="space-y-1.5 text-xs">
                        <div className="flex justify-between text-stone-600 dark:text-stone-300">
                            <span className="font-medium text-stone-700 dark:text-stone-300">
                                Subtotal
                            </span>
                            <span className="font-bold text-stone-800 dark:text-white">
                                Rp {formatRp(grossSubtotal)}
                            </span>
                        </div>
                        <div className="flex items-center justify-between text-stone-600 dark:text-stone-300">
                            <div className="flex items-center gap-1.5">
                                <span className="font-medium text-stone-700 dark:text-stone-300">
                                    Diskon
                                </span>
                                {cartDiscountValue > 0 && cartDiscountType === 'percent' && (
                                    <span className="py-0.2 rounded border border-emerald-200 bg-emerald-50 px-1.5 text-[10px] font-bold text-emerald-800 dark:border-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300">
                                        {cartDiscountValue}%
                                    </span>
                                )}
                                <button
                                    type="button"
                                    onClick={openCartDiscountModal}
                                    className="cursor-pointer text-xs font-bold text-sky-600 hover:underline dark:text-sky-300"
                                >
                                    [Ubah]
                                </button>
                            </div>
                            <div className="text-right">
                                <span className="font-bold text-stone-900 dark:text-stone-200">
                                    -Rp {formatRp(discountAmount)}
                                </span>
                                {totalItemDiscounts > 0 && cartDiscountAmount > 0 && (
                                    <div className="text-[10px] text-stone-400 dark:text-stone-400">
                                        Item: -Rp {formatRp(totalItemDiscounts)} | Trx: -Rp{' '}
                                        {formatRp(cartDiscountAmount)}
                                    </div>
                                )}
                            </div>
                        </div>

                        {isDeliveryOrder && numericShippingCost > 0 && (
                            <div className="flex items-center justify-between text-stone-600 dark:text-stone-300">
                                <div className="flex items-center gap-1.5">
                                    <span className="font-medium text-stone-700 dark:text-stone-300">
                                        Ongkos Kirim
                                    </span>
                                    {shippingCourier && (
                                        <span className="py-0.2 rounded border border-blue-200 bg-blue-50 px-1.5 text-[10px] font-bold text-blue-800 dark:border-blue-800 dark:bg-blue-950/60 dark:text-blue-300">
                                            {shippingCourier}
                                        </span>
                                    )}
                                </div>
                                <span className="font-bold text-stone-900 dark:text-stone-200">
                                    Rp {formatRp(numericShippingCost)}
                                </span>
                            </div>
                        )}

                        <div className="flex items-baseline justify-between border-t border-stone-200 pt-2 dark:border-stone-800">
                            <span className="text-sm font-bold tracking-wide text-stone-900 uppercase dark:text-stone-200">
                                TOTAL
                            </span>
                            <span className="text-2xl font-black text-stone-950 dark:text-emerald-400">
                                Rp {formatRp(totalAmount)}
                            </span>
                        </div>
                    </div>

                    <button
                        type="button"
                        disabled={cart.length === 0}
                        onClick={() => {
                            onClose();
                            openCheckout();
                        }}
                        className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-[#273a41] px-4 py-3.5 text-sm font-black tracking-wider text-white shadow-md transition-all hover:bg-[#1e2e34] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-40 dark:bg-brand-700 dark:hover:bg-brand-600"
                    >
                        <span>BAYAR</span>
                        <ChevronRight className="h-5 w-5 stroke-[2.8]" />
                    </button>
                </div>
            </div>
        </div>
    );
};
