import React from 'react';
import { formatRupiah } from '@/lib/trans';
import type { BundleCartSubItem } from '@/types/sanubari';

interface BundleCartItemDetailsProps {
    bundleItems: BundleCartSubItem[];
    packageQty: number;
    onChangeSubItemDpPercent?: (subIndex: number, dpPercent: number) => void;
}

export const BundleCartItemDetails: React.FC<BundleCartItemDetailsProps> = ({
    bundleItems,
    packageQty,
    onChangeSubItemDpPercent,
}) => {
    const unitNormalTotal = bundleItems.reduce(
        (sum, sub) => sum + sub.normal_price * sub.quantity,
        0,
    );
    const unitBundleTotal = bundleItems.reduce(
        (sum, sub) => sum + sub.bundle_price * sub.quantity,
        0,
    );

    const totalNormal = unitNormalTotal * packageQty;
    const totalDiscounted = unitBundleTotal * packageQty;

    const { totalPayableNow, hasPartialDp } = bundleItems.reduce(
        (acc, sub) => {
            const lineTotal = sub.bundle_price * sub.quantity * packageQty;
            if (sub.is_preorder) {
                const minDp = sub.preorder_dp_percent ?? 100;
                const chosenDp = Math.max(
                    minDp,
                    sub.selected_dp_percent ?? minDp,
                );
                acc.totalPayableNow += Math.round(
                    (lineTotal * chosenDp) / 100,
                );
                if (chosenDp < 100) {
                    acc.hasPartialDp = true;
                }
            } else {
                acc.totalPayableNow += lineTotal;
            }
            return acc;
        },
        { totalPayableNow: 0, hasPartialDp: false },
    );

    return (
        <div className="mt-2">
            <div className="space-y-1.5 text-[11px] sm:text-xs">
                {bundleItems.map((sub, i) => {
                    const showVariant =
                        sub.variant_label && sub.variant_label !== 'Standard';
                    const qtyTotal = sub.quantity * packageQty;
                    const lineDiscountedTotal = sub.bundle_price * qtyTotal;
                    const minDp = sub.preorder_dp_percent ?? 100;
                    const chosenDp = sub.is_preorder
                        ? Math.max(minDp, sub.selected_dp_percent ?? minDp)
                        : 100;
                    const dpPayable = Math.round(
                        (lineDiscountedTotal * chosenDp) / 100,
                    );

                    return (
                        <div
                            key={`${sub.slot_id}-${sub.variant_id}-${i}`}
                            className="py-0.5"
                        >
                            <div className="flex items-center justify-between gap-2">
                                <div className="min-w-0 flex-1">
                                    <span className="block text-[9px] font-semibold tracking-wide text-brand-500 uppercase sm:text-[10px]">
                                        {sub.slot_title}
                                    </span>
                                    <div className="font-semibold leading-snug text-brand-950">
                                        {sub.product_name}
                                        {showVariant ? ` (${sub.variant_label})` : ''}
                                        {sub.is_preorder && (
                                            <span className="ml-1.5 inline-flex items-center rounded border border-amber-200 bg-amber-50 px-1.5 py-0.2 text-[9px] font-bold tracking-wide text-amber-800 uppercase">
                                                Pre-Order
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="flex-shrink-0 text-center font-bold text-brand-800">
                                    {qtyTotal}x
                                </div>
                                <div className="flex-shrink-0 text-right">
                                    {sub.normal_price > sub.bundle_price && (
                                        <span className="block text-[9px] text-rose-500 line-through sm:text-[10px]">
                                            {formatRupiah(
                                                sub.normal_price * qtyTotal,
                                            )}
                                        </span>
                                    )}
                                    <span className="font-bold text-brand-950">
                                        {sub.bundle_price === 0
                                            ? 'GRATIS'
                                            : formatRupiah(lineDiscountedTotal)}
                                    </span>
                                </div>
                            </div>

                            {sub.is_preorder && onChangeSubItemDpPercent && (
                                <div className="mt-1.5 rounded-lg border border-amber-200 bg-amber-50/80 p-2 text-[11px] text-amber-950">
                                    <div className="mb-1 flex items-center justify-between gap-2">
                                        <span className="font-bold text-amber-800">
                                            Pre-Order · Pilih DP:
                                        </span>
                                        <span className="text-[10px] text-amber-700">
                                            Min. {minDp}%
                                        </span>
                                    </div>
                                    <div className="flex flex-wrap gap-1">
                                        {[30, 50, 70, 100]
                                            .filter((pct) => pct >= minDp)
                                            .map((pct) => {
                                                const isSelected =
                                                    chosenDp === pct;
                                                return (
                                                    <button
                                                        key={pct}
                                                        type="button"
                                                        onClick={() =>
                                                            onChangeSubItemDpPercent(
                                                                i,
                                                                pct,
                                                            )
                                                        }
                                                        className={`cursor-pointer rounded-md px-2 py-0.5 text-[10px] font-bold transition ${
                                                            isSelected
                                                                ? 'bg-amber-700 text-white shadow-xs'
                                                                : 'border border-amber-300 bg-white text-amber-900 hover:bg-amber-100'
                                                        }`}
                                                    >
                                                        {pct === 100
                                                            ? '100% Lunas'
                                                            : `DP ${pct}%`}
                                                    </button>
                                                );
                                            })}
                                    </div>
                                    {chosenDp < 100 && (
                                        <div className="mt-1.5 flex items-center justify-between border-t border-amber-200/80 pt-1 text-[10px] font-semibold text-amber-900">
                                            <span>
                                                Bayar DP ({chosenDp}%) Sekarang:
                                            </span>
                                            <span className="font-extrabold">
                                                {formatRupiah(dpPayable)}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}

                <div className="flex items-center justify-between gap-2 pt-1.5 font-bold">
                    <span className="text-brand-950">
                        Total Harga Paket ({packageQty}x)
                    </span>
                    <div className="text-right">
                        {totalNormal > totalDiscounted && (
                            <span className="mr-1.5 text-[10px] font-medium text-gray-400 line-through">
                                {formatRupiah(totalNormal)}
                            </span>
                        )}
                        <span className="font-extrabold text-brand-950">
                            {formatRupiah(totalDiscounted)}
                        </span>
                    </div>
                </div>

                {hasPartialDp && (
                    <div className="rounded-lg border border-amber-200/80 bg-amber-50/70 px-2.5 py-1.5 text-[10px] text-amber-950 sm:text-[11px]">
                        <div className="flex items-center justify-between gap-2 font-bold">
                            <span>Dibayar Sekarang (Ready 100% + DP PO)</span>
                            <span>{formatRupiah(totalPayableNow)}</span>
                        </div>
                        <div className="mt-0.5 flex items-center justify-between gap-2 text-amber-800">
                            <span>Sisa Pelunasan Pre-Order</span>
                            <span className="font-semibold">
                                {formatRupiah(
                                    Math.max(0, totalDiscounted - totalPayableNow),
                                )}
                            </span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
