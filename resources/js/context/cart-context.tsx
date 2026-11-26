import React, { createContext, useContext, useEffect, useState } from 'react';
import type {
    BundleCartSubItem,
    CartItem,
    Product,
    ProductVariant,
} from '@/types/sanubari';
import { getProductContentId, trackAddToCart } from '@/lib/meta-pixel';

interface CartContextType {
    items: CartItem[];
    addItem: (
        product: Product,
        variant: ProductVariant,
        quantity?: number,
        grindOption?: string,
        customNotes?: string,
        preorderDpPercent?: number,
        bundleSlotItemId?: number,
        bundleSlotId?: number,
        bundleItems?: BundleCartSubItem[],
    ) => void;
    removeItem: (
        variantId: number,
        grindOption: string,
        customNotes?: string,
    ) => void;
    replaceCartItem: (
        oldVariantId: number,
        oldGrindOption: string,
        oldCustomNotes: string | undefined,
        newItem: CartItem,
    ) => void;
    updateQuantity: (
        variantId: number,
        grindOption: string,
        quantity: number,
        customNotes?: string,
    ) => void;
    updateItemDpPercent: (
        variantId: number,
        grindOption: string,
        dpPercent: number,
        customNotes?: string,
    ) => void;
    clearCart: () => void;
    itemCount: number;
    subtotal: number;
    isCartOpen: boolean;
    setIsCartOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const STORAGE_KEY = 'sanubari_cart_v1';

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const [items, setItems] = useState<CartItem[]>(() => {
        if (typeof window === 'undefined') return [];
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            return raw ? JSON.parse(raw) : [];
        } catch {
            return [];
        }
    });

    const [isCartOpen, setIsCartOpen] = useState(false);

    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
        } catch (e) {
            console.error('Failed to save cart to localStorage', e);
        }
    }, [items]);

    const addItem = (
        product: Product,
        variant: ProductVariant,
        quantity: number = 1,
        grindOption: string = 'Biji Utuh (Whole Bean)',
        customNotes?: string,
        preorderDpPercent?: number,
        bundleSlotItemId?: number,
        bundleSlotId?: number,
        bundleItems?: BundleCartSubItem[],
    ) => {
        const isEquipment =
            product.series === 'alat-kopi' ||
            Boolean(
                product.categories?.some(
                    (c) => c.slug === 'alat-kopi' || c.type === 'equipment',
                ),
            );
        const resolvedGrindOption = isEquipment ? '' : grindOption;
        const isPreorder = Boolean(
            product.is_preorder || product.stock_status === 'pre_order',
        );
        const variantStock =
            !isPreorder &&
            variant.stock !== undefined &&
            variant.stock !== null
                ? Math.max(0, Number(variant.stock))
                : null;

        if (
            !isPreorder &&
            (variant.stock_status === 'out_of_stock' ||
                (variantStock !== null && variantStock <= 0))
        ) {
            return;
        }

        const minDp = product.preorder_dp_percent ?? 100;
        const resolvedDpPercent = isPreorder
            ? Math.max(minDp, preorderDpPercent ?? minDp)
            : 100;

        setItems((prev) => {
            const existingIndex = prev.findIndex(
                (i) =>
                    i.variant.id === variant.id &&
                    i.grindOption === resolvedGrindOption &&
                    (i.customNotes || '') === (customNotes || ''),
            );
            if (existingIndex > -1) {
                const next = [...prev];
                const newQty = next[existingIndex].quantity + quantity;
                next[existingIndex].quantity =
                    variantStock !== null
                        ? Math.min(variantStock, newQty)
                        : newQty;
                if (isPreorder) {
                    next[existingIndex].preorderDpPercent = resolvedDpPercent;
                }
                return next;
            }
            const initialQty =
                variantStock !== null
                    ? Math.min(variantStock, Math.max(1, quantity))
                    : Math.max(1, quantity);
            return [
                ...prev,
                {
                    product,
                    variant,
                    quantity: initialQty,
                    grindOption: resolvedGrindOption,
                    customNotes,
                    preorderDpPercent: isPreorder
                        ? resolvedDpPercent
                        : undefined,
                    bundleSlotId,
                    bundleSlotItemId,
                    ...(bundleItems ? { bundleItems } : {}),
                },
            ];
        });
        setIsCartOpen(true);

        // Track Meta Pixel AddToCart
        try {
            const contentId = getProductContentId(product, variant);
            trackAddToCart({
                content_ids: [contentId],
                content_type: 'product',
                value: Number((variant.price || 0) * (quantity || 1)),
                currency: 'IDR',
                content_name: product.name,
                quantity: quantity || 1,
            });
        } catch (e) {
            console.error('Meta Pixel AddToCart error', e);
        }
    };

    const removeItem = (
        variantId: number,
        grindOption: string,
        customNotes?: string,
    ) => {
        setItems((prev) =>
            prev.filter(
                (i) =>
                    !(
                        i.variant.id === variantId &&
                        i.grindOption === grindOption &&
                        (i.customNotes || '') === (customNotes || '')
                    ),
            ),
        );
    };

    const replaceCartItem = (
        oldVariantId: number,
        oldGrindOption: string,
        oldCustomNotes: string | undefined,
        newItem: CartItem,
    ) => {
        setItems((prev) => {
            const idx = prev.findIndex(
                (i) =>
                    i.variant.id === oldVariantId &&
                    i.grindOption === oldGrindOption &&
                    (i.customNotes || '') === (oldCustomNotes || ''),
            );
            if (idx === -1) {
                return [...prev, newItem];
            }
            const next = [...prev];
            next[idx] = newItem;
            return next;
        });
        setIsCartOpen(true);
    };

    const updateQuantity = (
        variantId: number,
        grindOption: string,
        quantity: number,
        customNotes?: string,
    ) => {
        if (quantity <= 0) {
            removeItem(variantId, grindOption, customNotes);
            return;
        }
        setItems((prev) =>
            prev.map((i) => {
                if (
                    i.variant.id === variantId &&
                    i.grindOption === grindOption &&
                    (i.customNotes || '') === (customNotes || '')
                ) {
                    const isPre = Boolean(
                        i.product.is_preorder ||
                            i.product.stock_status === 'pre_order',
                    );
                    const maxStock =
                        !isPre &&
                        i.variant.stock !== undefined &&
                        i.variant.stock !== null
                            ? Math.max(0, Number(i.variant.stock))
                            : null;
                    const cappedQty =
                        maxStock !== null && maxStock > 0
                            ? Math.min(maxStock, quantity)
                            : quantity;
                    return { ...i, quantity: cappedQty };
                }
                return i;
            }),
        );
    };

    const updateItemDpPercent = (
        variantId: number,
        grindOption: string,
        dpPercent: number,
        customNotes?: string,
    ) => {
        setItems((prev) =>
            prev.map((i) => {
                if (
                    i.variant.id === variantId &&
                    i.grindOption === grindOption &&
                    (i.customNotes || '') === (customNotes || '')
                ) {
                    const minDp = i.product.preorder_dp_percent ?? 100;
                    return {
                        ...i,
                        preorderDpPercent: Math.max(minDp, dpPercent),
                    };
                }
                return i;
            }),
        );
    };

    const clearCart = () => setItems([]);

    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = items.reduce(
        (sum, item) => sum + item.variant.price * item.quantity,
        0,
    );

    return (
        <CartContext.Provider
            value={{
                items,
                addItem,
                removeItem,
                replaceCartItem,
                updateQuantity,
                updateItemDpPercent,
                clearCart,
                itemCount,
                subtotal,
                isCartOpen,
                setIsCartOpen,
            }}
        >
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};
