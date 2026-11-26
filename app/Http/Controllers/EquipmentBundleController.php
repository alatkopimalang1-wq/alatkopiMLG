<?php

namespace App\Http\Controllers;

use App\Models\EquipmentBundle;
use App\Models\Product;
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

        $serialized = [
            'id' => $bundle->id,
            'name' => $bundle->name,
            'slug' => $bundle->slug,
            'description' => $bundle->description,
            'banner_image' => $bundle->banner_image,
            'slots' => $bundle->slots->map(function ($slot) {
                $discountPct = max(0.0, min(100.0, (float) ($slot->discount_percent ?? 0)));

                if ($slot->slot_type === 'selectable' && $slot->category_id) {
                    $categoryProducts = Product::active()
                        ->whereHas('categories', fn ($q) => $q->where('categories.id', $slot->category_id))
                        ->with(['primaryImage', 'images', 'variants'])
                        ->orderBy('name')
                        ->get();

                    $items = collect();
                    foreach ($categoryProducts as $prod) {
                        foreach ($prod->variants as $variant) {
                            $rawImg = $variant->image
                                ?: $prod->primaryImage?->path
                                ?: $prod->images->first()?->path;

                            $basePrice = (float) $variant->price;
                            $normalPrice = (float) ($variant->original_price ?: $basePrice);
                            $bundlePrice = (float) round($basePrice * (1 - ($discountPct / 100)));

                            $isPreorder = (bool) ($prod->is_preorder ?? false);
                            $isOutOfStock = $isPreorder
                                ? ($prod->stock_status === 'out_of_stock' || $variant->stock_status === 'out_of_stock')
                                : ((int) ($variant->stock ?? 0) <= 0 || $variant->stock_status === 'out_of_stock');

                            $items->push([
                                'id' => $variant->id,
                                'bundle_slot_id' => $slot->id,
                                'bundle_slot_item_id' => null,
                                'product_id' => $prod->id,
                                'product_name' => $prod->name,
                                'product_slug' => $prod->slug,
                                'variant_id' => $variant->id,
                                'variant_label' => $variant->label,
                                'image' => $rawImg,
                                'normal_price' => $normalPrice,
                                'bundle_price' => $bundlePrice,
                                'is_preorder' => $isPreorder,
                                'stock' => (int) ($variant->stock ?? 0),
                                'is_out_of_stock' => $isOutOfStock,
                                'product' => $prod,
                                'variant' => $variant,
                            ]);
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
                    'items' => $slot->items->map(function ($item) use ($slot) {
                        $prod = $item->product;
                        $variant = $item->variant;
                        if (! $prod || ! $variant) {
                            return null;
                        }

                        $rawImg = $variant->image
                            ?: $prod->primaryImage?->path
                            ?: $prod->images->first()?->path;

                        $normalPrice = (float) ($variant->original_price ?: $variant->price);
                        $bundlePrice = $slot->slot_type === 'free'
                            ? 0.0
                            : ($item->bundle_price !== null ? (float) $item->bundle_price : (float) $variant->price);

                        $isPreorder = (bool) ($prod->is_preorder ?? false);
                        $isOutOfStock = $isPreorder
                            ? ($prod->stock_status === 'out_of_stock' || $variant->stock_status === 'out_of_stock')
                            : ((int) ($variant->stock ?? 0) <= 0 || $variant->stock_status === 'out_of_stock');

                        return [
                            'id' => $item->id,
                            'bundle_slot_id' => $slot->id,
                            'bundle_slot_item_id' => $item->id,
                            'product_id' => $prod->id,
                            'product_name' => $prod->name,
                            'product_slug' => $prod->slug,
                            'variant_id' => $variant->id,
                            'variant_label' => $variant->label,
                            'image' => $rawImg,
                            'normal_price' => $normalPrice,
                            'bundle_price' => $bundlePrice,
                            'is_preorder' => $isPreorder,
                            'stock' => (int) ($variant->stock ?? 0),
                            'is_out_of_stock' => $isOutOfStock,
                            'product' => $prod,
                            'variant' => $variant,
                        ];
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
}
