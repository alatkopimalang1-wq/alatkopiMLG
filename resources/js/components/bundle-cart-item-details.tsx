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

    let requiredIdx = 0;

    return (
        <div className="mt-1.5 space-y-1.5 text-[11px] leading-snug text-brand-900 sm:text-xs">
            <div className="space-y-1">
                {bundleItems.map((sub, i) => {
                    let prefix = '';
                    if (sub.slot_type === 'free') {
                        prefix = '[Item Gratis]';
                    } else if (sub.is_optional) {
                        prefix = '[Item Opsional]';
                    } else {
                        requiredIdx += 1;
                        prefix = `[Item ${requiredIdx}]`;
                    }

                    const showVariant =
                        sub.variant_label && sub.variant_label !== 'Standard';

                    return (
                        <div key={`${sub.slot_id}-${sub.variant_id}-${i}`}>
                            <span className="font-bold text-brand-950">
                                {prefix}
                            </span>{' '}
                            <span>
                                {sub.quantity}x {sub.product_name}
                                {showVariant
                                    ? ` - Variasi: ${sub.variant_label}`
                                    : ''}
                            </span>{' '}
                            <span className="whitespace-nowrap">
                                (
                                {sub.normal_price > sub.bundle_price && (
                                    <>
                                        <span className="text-rose-500 line-through">
                                            {formatRupiah(
                                                sub.normal_price * sub.quantity,
                                            )}
                                        </span>{' '}
                                    </>
                                )}
                                <span className="font-bold text-brand-950">
                                    {sub.bundle_price === 0
                                        ? 'Rp 0'
                                        : formatRupiah(
                                              sub.bundle_price * sub.quantity,
                                          )}
                                </span>
                                )
                            </span>
                        </div>
                    );
                })}
            </div>

            <div className="space-y-0.5 border-t border-sand-200/80 pt-1.5 text-[11px] sm:text-xs">
                {totalNormal > totalDiscounted && (
                    <div className="flex items-center justify-between gap-2">
                        <span className="text-brand-700">
                            Total Harga Normal:
                        </span>
                        <span className="font-medium text-rose-500 line-through">
                            {formatRupiah(totalNormal)}
                        </span>
                    </div>
                )}
                <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-brand-950">
                        Total Harga Diskon:
                    </span>
                    <span className="font-extrabold text-emerald-700">
                        {formatRupiah(totalDiscounted)}
                    </span>
                </div>
            </div>
        </div>
    );
};
