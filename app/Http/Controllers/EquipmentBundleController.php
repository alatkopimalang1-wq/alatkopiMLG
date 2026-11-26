<?php

namespace App\Http\Controllers;

use App\Models\EquipmentBundle;
use App\Models\Setting;
use Inertia\Inertia;
use Inertia\Response;

class EquipmentBundleController extends Controller
{
    public function index(): Response
    {
        $bundles = EquipmentBundle::active()
            ->withCount('slots')
            ->orderBy('sort_order')
            ->orderByDesc('id')
            ->get()
            ->map(fn (EquipmentBundle $b) => [
                'id' => $b->id,
                'name' => $b->name,
                'slug' => $b->slug,
                'description' => $b->description,
                'banner_image' => $b->banner_image,
                'slots_count' => $b->slots_count,
            ]);

        return Inertia::render('bundling/index', [
            'bundles' => $bundles,
        ]);
    }

    public function show(string $slug): Response
    {
        $bundle = EquipmentBundle::active()
            ->where('slug', $slug)
            ->with([
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
                return [
                    'id' => $slot->id,
                    'title' => $slot->title,
                    'slot_type' => $slot->slot_type,
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

        return Inertia::render('bundling/show', [
            'bundle' => $serialized,
            'whatsapp' => $whatsapp,
        ]);
    }
}
