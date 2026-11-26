import React from 'react';
import { formatRupiah } from '@/lib/trans';
import type { BundleCartSubItem } from '@/types/sanubari';

interface BundleCartItemDetailsProps {
    bundleItems: BundleCartSubItem[];
    packageQty: number;
}

export const BundleCartItemDetails: React.FC<BundleCartItemDetailsProps> = ({
    bundleItems,
    packageQty,
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

    return (
        <div className="mt-2">
            <div className="space-y-1.5 text-[11px] sm:text-xs">
                {bundleItems.map((sub, i) => {
                    const showVariant =
                        sub.variant_label && sub.variant_label !== 'Standard';
                    const qtyTotal = sub.quantity * packageQty;

                    return (
                        <div
                            key={`${sub.slot_id}-${sub.variant_id}-${i}`}
                            className="flex items-center justify-between gap-2 py-0.5"
                        >
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
                                        : formatRupiah(
                                              sub.bundle_price * qtyTotal,
                                          )}
                                </span>
                            </div>
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
            </div>
        </div>
    );
};
