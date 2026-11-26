import type { Product, ProductVariant } from '@/types/sanubari';

export function getEffectiveVariantStock(
    product: Pick<Product, 'is_preorder' | 'stock_status'>,
    variant: Pick<ProductVariant, 'id' | 'stock'>,
    reservedByVariant: Record<string | number, number> = {},
): number | null {
    const isPreorder = Boolean(
        product.is_preorder || product.stock_status === 'pre_order',
    );
    if (isPreorder) return null;
    if (variant.stock === undefined || variant.stock === null) return null;
    const reserved = Number(reservedByVariant[variant.id] ?? 0);
    return Math.max(0, Number(variant.stock) - reserved);
}

export function getEffectiveProductStock(
    product: Pick<Product, 'is_preorder' | 'stock_status' | 'stock' | 'variants'>,
    reservedByVariant: Record<string | number, number> = {},
): number | null {
    const isPreorder = Boolean(
        product.is_preorder || product.stock_status === 'pre_order',
    );
    if (isPreorder) return null;
    if (
        product.variants &&
        product.variants.length > 0 &&
        product.variants.some((v) => v.stock !== undefined && v.stock !== null)
    ) {
        return product.variants.reduce((sum, v) => {
            const s = getEffectiveVariantStock(product, v, reservedByVariant);
            return sum + (s ?? 0);
        }, 0);
    }
    if (product.stock !== undefined && product.stock !== null) {
        return Math.max(0, Number(product.stock));
    }
    return null;
}
