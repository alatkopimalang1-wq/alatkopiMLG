<?php

namespace App\Http\Controllers;

use App\Models\EquipmentBundle;
use App\Models\Order;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\Setting;
use Inertia\Inertia;
use Inertia\Response;

class EquipmentBundleController extends Controller
{
    public function index(): Response
    {
        $bundles = EquipmentBundle::active()
            ->with(['slots.category', 'slots.items.variant'])
            ->orderBy('sort_order')
            ->orderByDesc('id')
            ->get()
            ->map(fn (EquipmentBundle $b) => $b->toProductCardArray());

        return Inertia::render('bundling/index', [
            'bundles' => $bundles,
        ]);
    }

    public function show(string $slug): Response
    {
        $bundle = EquipmentBundle::active()
            ->where('slug', $slug)
            ->with([
                'slots.category',
                'slots.items.product.primaryImage',
                'slots.items.product.images',
                'slots.items.variant',
            ])
            ->firstOrFail();

        $whatsapp = Setting::get('whatsapp', '6282132095241');
        $reservedStock = Order::getUserPendingReservedStock(auth()->id());

        $serialized = [
            'id' => $bundle->id,
            'name' => $bundle->name,
            'slug' => $bundle->slug,
            'description' => $bundle->description,
            'banner_image' => $bundle->banner_image,
            'slots' => $bundle->slots->map(function ($slot) use ($reservedStock) {
                $discountPct = max(0.0, min(100.0, (float) ($slot->discount_percent ?? 0)));

                $catIds = $slot->resolvedCategoryIds();
                if ($slot->slot_type === 'selectable' && ! empty($catIds)) {
                    $categoryProducts = Product::active()
                        ->whereHas('categories', fn ($q) => $q->whereIn('categories.id', $catIds))
                        ->with(['primaryImage', 'images', 'variants'])
                        ->orderBy('name')
                        ->get();

                    $items = collect();
                    foreach ($categoryProducts as $prod) {
                        foreach ($prod->variants as $variant) {
                            $basePrice = (float) $variant->price;
                            $normalPrice = (float) ($variant->original_price ?: $basePrice);
                            $bundlePrice = (float) round($basePrice * (1 - ($discountPct / 100)));

                            $items->push($this->serializeSlotItem(
                                id: $variant->id,
                                slotId: $slot->id,
                                slotItemId: null,
                                prod: $prod,
                                variant: $variant,
                                normalPrice: $normalPrice,
                                bundlePrice: $bundlePrice,
                                reservedStock: $reservedStock,
                            ));
                        }
                    }

                    return [
                        'id' => $slot->id,
                        'title' => $slot->title,
                        'slot_type' => $slot->slot_type,
                        'discount_percent' => $discountPct,
                        'is_optional' => (bool) $slot->is_optional,
                        'quantity' => max(1, (int) $slot->quantity),
                        'items' => $items->values(),
                    ];
                }

                return [
                    'id' => $slot->id,
                    'title' => $slot->title,
                    'slot_type' => $slot->slot_type,
                    'discount_percent' => $discountPct,
                    'is_optional' => (bool) $slot->is_optional,
                    'quantity' => max(1, (int) $slot->quantity),
                    'items' => $slot->items->map(function ($item) use ($slot, $reservedStock) {
                        $prod = $item->product;
                        $variant = $item->variant;
                        if (! $prod || ! $variant) {
                            return null;
                        }

                        $normalPrice = (float) ($variant->original_price ?: $variant->price);
                        $bundlePrice = $slot->slot_type === 'free'
                            ? 0.0
                            : ($item->bundle_price !== null ? (float) $item->bundle_price : (float) $variant->price);

                        return $this->serializeSlotItem(
                            id: $item->id,
                            slotId: $slot->id,
                            slotItemId: $item->id,
                            prod: $prod,
                            variant: $variant,
                            normalPrice: $normalPrice,
                            bundlePrice: $bundlePrice,
                            reservedStock: $reservedStock,
                        );
                    })->filter()->values(),
                ];
            })->values(),
        ];

        $relatedBundles = EquipmentBundle::active()
            ->where('id', '!=', $bundle->id)
            ->with(['slots.category', 'slots.items.variant'])
            ->orderBy('sort_order')
            ->orderByDesc('id')
            ->take(4)
            ->get()
            ->map(fn (EquipmentBundle $b) => $b->toProductCardArray());

        return Inertia::render('bundling/show', [
            'bundle' => $serialized,
            'relatedBundles' => $relatedBundles,
            'whatsapp' => $whatsapp,
        ]);
    }

    /**
     * Serialize a single bundle slot option with real effective stock.
     */
    private function serializeSlotItem(
        int $id,
        int $slotId,
        ?int $slotItemId,
        Product $prod,
        ProductVariant $variant,
        float $normalPrice,
        float $bundlePrice,
        array $reservedStock,
    ): array {
        $rawImg = $variant->image
            ?: $prod->primaryImage?->path
            ?: $prod->images->first()?->path;

        $isPreorder = (bool) ($prod->is_preorder ?? false)
            || $prod->stock_status === 'pre_order'
            || $variant->stock_status === 'pre_order';

        $rawStock = (int) ($variant->stock ?? 0);
        $effectiveStock = $isPreorder
            ? null
            : max(0, $rawStock - (int) ($reservedStock[$variant->id] ?? 0));

        $isOutOfStock = $isPreorder
            ? ($prod->stock_status === 'out_of_stock')
            : ($prod->stock_status === 'out_of_stock'
                || $variant->stock_status === 'out_of_stock'
                || $effectiveStock <= 0);

        return [
            'id' => $id,
            'bundle_slot_id' => $slotId,
            'bundle_slot_item_id' => $slotItemId,
            'product_id' => $prod->id,
            'product_name' => $prod->name,
            'product_slug' => $prod->slug,
            'variant_id' => $variant->id,
            'variant_label' => $variant->label,
            'image' => $rawImg,
            'normal_price' => $normalPrice,
            'bundle_price' => $bundlePrice,
            'is_preorder' => $isPreorder,
            'preorder_dp_percent' => $isPreorder ? (int) ($prod->preorder_dp_percent ?? 100) : 100,
            'stock' => $effectiveStock ?? $rawStock,
            'is_out_of_stock' => $isOutOfStock,
            'product' => $prod,
            'variant' => $variant,
        ];
    }
}
