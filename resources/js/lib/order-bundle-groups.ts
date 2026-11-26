import type { BundleCartSubItem } from '@/types/sanubari';

export interface OrderLikeItem {
    id?: number;
    product_id?: number;
    variant_id?: number;
    product_name: string;
    variant_label: string;
    grind_option?: string | null;
    custom_notes?: string | null;
    price: number;
    normal_price?: number;
    quantity: number;
    subtotal: number;
    image?: string | null;
    is_preorder?: boolean;
}

export type GroupedOrderEntry<T extends OrderLikeItem> =
    | {
          type: 'bundle';
          key: string;
          bundleName: string;
          image?: string | null;
          bundleItems: BundleCartSubItem[];
          totalSubtotal: number;
      }
    | {
          type: 'single';
          key: string;
          item: T;
      };

const BUNDLE_NOTE_RE = /^((?:Custom|Paket Bundling:?)\s+.+?)\s+\(([^()]+)\)\s*$/i;

export function groupOrderItems<T extends OrderLikeItem>(
    items: T[],
): GroupedOrderEntry<T>[] {
    const entries: GroupedOrderEntry<T>[] = [];
    const bundleMap = new Map<
        string,
        Extract<GroupedOrderEntry<T>, { type: 'bundle' }>
    >();

    items.forEach((item, idx) => {
        const notes = (
            item.custom_notes ||
            (item as { customNotes?: string }).customNotes ||
            ''
        ).trim();
        const match = notes.match(BUNDLE_NOTE_RE);

        if (match) {
            const bundleName = match[1]
                .replace(/^Paket Bundling:\s*/i, '')
                .trim();
            const slotTitle = match[2].trim();
            const subItem: BundleCartSubItem = {
                slot_id: idx + 1,
                slot_title: slotTitle,
                slot_type: item.price === 0 ? 'free' : 'selectable',
                is_optional: false,
                product_id: item.product_id ?? idx + 1,
                product_name: item.product_name,
                variant_id: item.variant_id ?? idx + 1,
                variant_label: item.variant_label,
                quantity: item.quantity,
                normal_price: item.normal_price ?? item.price,
                bundle_price: item.price,
                is_preorder: item.is_preorder,
            };

            const existing = bundleMap.get(bundleName);
            if (existing) {
                existing.bundleItems.push(subItem);
                existing.totalSubtotal += item.subtotal;
                if (!existing.image && item.image) {
                    existing.image = item.image;
                }
            } else {
                const group: Extract<GroupedOrderEntry<T>, { type: 'bundle' }> =
                    {
                        type: 'bundle',
                        key: `bundle-${bundleName}-${idx}`,
                        bundleName,
                        image: item.image,
                        bundleItems: [subItem],
                        totalSubtotal: item.subtotal,
                    };
                bundleMap.set(bundleName, group);
                entries.push(group);
            }
        } else {
            entries.push({
                type: 'single',
                key: `single-${item.id ?? idx}`,
                item,
            });
        }
    });

    return entries;
}
