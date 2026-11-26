<?php

namespace App\Http\Controllers;

use App\Models\FixedBundle;
use App\Models\Order;
use App\Models\Setting;
use Inertia\Inertia;
use Inertia\Response;

class FixedBundleController extends Controller
{
    public function show(string $slug): Response
    {
        $bundle = FixedBundle::active()
            ->where('slug', $slug)
            ->with([
                'items.product.primaryImage',
                'items.product.images',
                'items.variant',
            ])
            ->firstOrFail();

        $whatsapp = Setting::get('whatsapp', '6282132095241');
        $reservedStock = Order::getUserPendingReservedStock(auth()->id());
        $discountPct = max(0.0, min(100.0, (float) ($bundle->discount_percent ?? 0)));

        $items = $bundle->items->map(function ($item) use ($discountPct, $reservedStock) {
            $prod = $item->product;
            $variant = $item->variant;
            if (! $prod || ! $variant) {
                return null;
            }

            $rawImg = $variant->image
                ?: $prod->primaryImage?->path
                ?: $prod->images->first()?->path;

            $basePrice = (float) $variant->price;
            $normalPrice = (float) ($variant->original_price ?: $basePrice);
            $bundlePrice = (float) round($basePrice * (1 - ($discountPct / 100)));
            $qty = max(1, (int) ($item->quantity ?? 1));

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
                    || $effectiveStock < $qty);

            return [
                'id' => $item->id,
                'product_id' => $prod->id,
                'product_name' => $prod->name,
                'product_slug' => $prod->slug,
                'variant_id' => $variant->id,
                'variant_label' => $variant->label,
                'image' => $rawImg,
                'quantity' => $qty,
                'normal_price' => $normalPrice,
                'bundle_price' => $bundlePrice,
                'weight_grams' => (int) ($variant->weight_grams ?? 0),
                'is_preorder' => $isPreorder,
                'stock' => $effectiveStock ?? $rawStock,
                'is_out_of_stock' => $isOutOfStock,
                'product' => $prod,
                'variant' => $variant,
            ];
        })->filter()->values();

        $relatedBundles = FixedBundle::active()
            ->where('id', '!=', $bundle->id)
            ->with(['items.product.primaryImage', 'items.variant'])
            ->orderBy('sort_order')
            ->orderByDesc('id')
            ->take(4)
            ->get()
            ->map(fn (FixedBundle $b) => $b->toProductCardArray());

        return Inertia::render('bundling/fixed-show', [
            'bundle' => [
                'id' => $bundle->id,
                'name' => $bundle->name,
                'slug' => $bundle->slug,
                'description' => $bundle->description,
                'banner_image' => $bundle->banner_image,
                'discount_percent' => $discountPct,
                'items' => $items,
            ],
            'relatedBundles' => $relatedBundles,
            'whatsapp' => $whatsapp,
        ]);
    }
}
