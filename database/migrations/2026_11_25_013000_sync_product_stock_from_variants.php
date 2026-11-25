<?php

use App\Models\Product;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    public function up(): void
    {
        Product::with('variants')->get()->each(function (Product $product) {
            if ($product->variants()->exists()) {
                $totalStock = (int) $product->variants()->sum('stock');
                $product->updateQuietly([
                    'stock' => $totalStock,
                    'stock_status' => $totalStock > 0 ? 'in_stock' : 'out_of_stock',
                ]);
            }
        });
    }

    public function down(): void
    {
    }
};
