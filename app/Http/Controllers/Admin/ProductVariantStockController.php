<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ProductVariant;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProductVariantStockController extends Controller
{
    public function update(Request $request, ProductVariant $variant): JsonResponse
    {
        $user = auth()->user();
        if (! $user || ! ($user->id === 1 || in_array($user->role, ['owner', 'admin', 'editor'], true) || in_array($user->pos_role, ['owner', 'admin'], true))) {
            abort(403, 'Akses ditolak.');
        }

        $validated = $request->validate([
            'stock' => ['required', 'integer', 'min:0'],
        ]);

        $newStock = (int) $validated['stock'];
        $variant->stock = $newStock;
        $variant->stock_status = $newStock > 0 ? 'in_stock' : 'out_of_stock';
        $variant->save();

        $product = $variant->product()->with('variants')->first();

        return response()->json([
            'success' => true,
            'variant_id' => $variant->id,
            'variant_label' => $variant->label,
            'variant_stock' => (int) $variant->stock,
            'product_id' => $product?->id,
            'product_total_stock' => (int) ($product?->stock ?? 0),
            'product_stock_status' => $product?->stock_status ?? 'out_of_stock',
            'message' => "Stok varian {$variant->label} berhasil diubah menjadi {$newStock} pcs.",
        ]);
    }
}
