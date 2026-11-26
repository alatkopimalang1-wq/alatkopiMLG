import React from 'react';
import { Plus } from 'lucide-react';
import { Product } from '@/types/pos';

interface ProductCardProps {
    product: Product;
    gridDensity: 'compact' | 'normal' | 'comfortable';
    onClick: (product: Product) => void;
    formatRp: (val: number) => string;
}

const ProductCardComponent: React.FC<ProductCardProps> = ({
    product,
    gridDensity,
    onClick,
    formatRp,
}) => {
    const prodVariants = Array.isArray(product.variants) ? product.variants : [];
    const hasMultipleVariants = prodVariants.length > 1;
    const singleVariant = prodVariants.length === 1 ? prodVariants[0] : null;

    return (
        <div
            onClick={() => onClick(product)}
            className={`pos-product-card-perf group relative flex touch-pan-y cursor-pointer flex-col rounded-xl border border-stone-200/90 bg-white text-left shadow-2xs transition-colors duration-150 hover:border-brand-600/70 hover:shadow-md dark:border-stone-800 dark:bg-stone-900 dark:hover:border-brand-500 ${
                gridDensity === 'compact'
                    ? 'p-1.5 sm:p-2'
                    : gridDensity === 'comfortable'
                    ? 'p-3 sm:p-3.5'
                    : 'p-2 sm:p-2.5'
            } ${
                product.is_out_of_stock
                    ? 'cursor-not-allowed opacity-50 grayscale'
                    : 'active:scale-[0.98]'
            }`}
        >
            <div
                className={`relative aspect-square w-full overflow-hidden rounded-lg border border-stone-100 bg-stone-50 dark:border-stone-800 dark:bg-stone-800 ${
                    gridDensity === 'compact'
                        ? 'mb-1 sm:mb-1.5'
                        : gridDensity === 'comfortable'
                        ? 'mb-2 sm:mb-2.5 sm:rounded-xl'
                        : 'mb-1.5 sm:mb-2 sm:rounded-xl'
                }`}
            >
                <img
                    src={product.image || '/brand/logo-circle.png'}
                    alt={product.name}
                    draggable={false}
                    decoding="async"
                    onError={(e) => {
                        const target = e.currentTarget;
                        if (!target.src.endsWith('/brand/logo-circle.png')) {
                            target.src = '/brand/logo-circle.png';
                        }
                    }}
                    className="h-full w-full object-cover"
                    loading="lazy"
                />
                {product.is_out_of_stock ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/65 backdrop-blur-[1px]">
                        <span className="rounded border border-white/30 bg-black/90 px-2 py-0.5 text-[10px] font-black tracking-widest text-white uppercase shadow-md">
                            HABIS
                        </span>
                    </div>
                ) : product.is_preorder ? (
                    <div className="py-0.2 absolute right-1 bottom-1 rounded-md border border-amber-300 bg-amber-50/95 px-1.5 text-[9px] font-bold text-amber-800 shadow-2xs sm:right-1.5 sm:bottom-1.5 dark:border-amber-700 dark:bg-amber-950/95 dark:text-amber-300">
                        Pre-Order
                    </div>
                ) : product.slug === 'byob' || product.series === 'cybr' || product.series === 'custom-blend' ? (
                    <div className="py-0.2 absolute right-1 bottom-1 rounded-md border border-emerald-300 bg-emerald-50/95 px-1.5 text-[9px] font-bold text-emerald-800 shadow-2xs sm:right-1.5 sm:bottom-1.5 dark:border-emerald-700 dark:bg-emerald-950/95 dark:text-emerald-300">
                        Custom Blend
                    </div>
                ) : hasMultipleVariants ? (
                    <div className="py-0.2 absolute right-1 bottom-1 rounded-md border border-stone-200 bg-white/95 px-1.5 text-[9px] font-semibold text-stone-700 shadow-2xs sm:right-1.5 sm:bottom-1.5 dark:border-stone-700 dark:bg-stone-800/95 dark:text-stone-300">
                        {product.stock !== undefined ? `Stok: ${product.stock} (${product.variants.length} Var)` : `${product.variants.length} Varian`}
                    </div>
                ) : singleVariant ? (
                    <div className="py-0.2 absolute right-1 bottom-1 rounded-md border border-stone-200 bg-white/95 px-1.5 text-[9px] font-semibold text-stone-700 shadow-2xs sm:right-1.5 sm:bottom-1.5 dark:border-stone-700 dark:bg-stone-800/95 dark:text-stone-300">
                        Stok: {singleVariant.stock ?? product.stock ?? 0}
                    </div>
                ) : null}
            </div>

            <div className="flex flex-1 flex-col justify-between">
                <div>
                    <h3
                        className={`line-clamp-2 font-bold text-stone-900 transition-colors group-hover:text-brand-700 dark:text-white dark:group-hover:text-emerald-400 ${
                            gridDensity === 'compact'
                                ? 'min-h-[22px] text-[10px] leading-tight sm:min-h-[24px] sm:text-[11px]'
                                : gridDensity === 'comfortable'
                                ? 'min-h-[30px] text-xs leading-snug sm:min-h-[36px] sm:text-sm'
                                : 'min-h-[26px] text-[11px] leading-tight sm:min-h-[28px] sm:text-xs'
                        }`}
                    >
                        {product.name}
                    </h3>
                </div>

                <div className="mt-1.5 flex items-center justify-between border-t border-stone-100 pt-1.5 dark:border-stone-800">
                    <div>
                        <div
                            className={`leading-tight font-black text-brand-700 dark:text-emerald-400 ${
                                gridDensity === 'compact'
                                    ? 'text-[10px] sm:text-[11px]'
                                    : gridDensity === 'comfortable'
                                    ? 'text-xs sm:text-sm'
                                    : 'text-[11px] sm:text-xs'
                            }`}
                        >
                            Rp{' '}
                            {hasMultipleVariants
                                ? `${formatRp(
                                      product.min_price ||
                                          (product.variants?.length
                                              ? Math.min(...product.variants.map((v: any) => v.price))
                                              : 0),
                                  )}`
                                : formatRp(
                                      singleVariant?.price ||
                                          product.min_price ||
                                          (product.variants?.[0]?.price ?? 0),
                                  )}
                        </div>
                        {hasMultipleVariants && (
                            <span className="block text-[9px] font-medium text-stone-500 dark:text-stone-400">
                                s/d Rp{' '}
                                {formatRp(
                                    product.max_price ||
                                        (product.variants?.length
                                            ? Math.max(...product.variants.map((v: any) => v.price))
                                            : product.min_price) ||
                                        0,
                                )}
                            </span>
                        )}
                        {!hasMultipleVariants && singleVariant && (
                            <span className="block text-[9px] font-medium text-stone-500 dark:text-stone-400">
                                {singleVariant.label}
                            </span>
                        )}
                    </div>

                    <button
                        type="button"
                        disabled={product.is_out_of_stock}
                        className={`flex shrink-0 items-center justify-center rounded-lg border border-brand-200 bg-brand-50 text-brand-700 shadow-2xs transition-colors group-hover:border-transparent group-hover:bg-brand-700 group-hover:text-white dark:border-stone-700 dark:bg-stone-800 dark:text-stone-200 ${
                            gridDensity === 'compact'
                                ? 'h-5 w-5 sm:h-6 sm:w-6'
                                : gridDensity === 'comfortable'
                                ? 'h-7 w-7 sm:h-8 sm:w-8'
                                : 'h-6 w-6 sm:h-7 sm:w-7'
                        }`}
                        aria-label="Tambah ke keranjang"
                    >
                        <Plus className={gridDensity === 'compact' ? 'h-3 w-3' : 'h-3.5 w-3.5'} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export const ProductCard = React.memo(ProductCardComponent, (prev, next) => {
    return (
        prev.product.id === next.product.id &&
        prev.product.is_out_of_stock === next.product.is_out_of_stock &&
        prev.product.min_price === next.product.min_price &&
        prev.product.max_price === next.product.max_price &&
        prev.product.name === next.product.name &&
        prev.product.image === next.product.image &&
        prev.gridDensity === next.gridDensity
    );
});
