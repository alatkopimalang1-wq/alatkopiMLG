<?php

namespace Tests\Feature\Admin;

use App\Filament\Pages\InventoriStok;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\ProductPurchase;
use App\Models\ProductPurchaseItem;
use App\Models\ProductVariant;
use App\Models\StockAdjustment;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Livewire\Livewire;
use Tests\TestCase;

class ComprehensiveStockMovementTest extends TestCase
{
    use RefreshDatabase;

    protected User $owner;
    protected Product $product;
    protected ProductVariant $variant;

    protected function setUp(): void
    {
        parent::setUp();

        $this->owner = User::create([
            'name' => 'Owner Sanubari',
            'email' => 'owner-mov@sanubari.co.id',
            'password' => bcrypt('password'),
            'role' => 'owner',
            'pos_role' => 'owner',
        ]);

        $this->product = Product::create([
            'name' => 'V60 Dripper Ceramic',
            'slug' => 'v60-dripper-ceramic',
            'series' => 'alat-kopi',
            'stock' => 50,
            'stock_status' => 'in_stock',
        ]);

        $this->variant = ProductVariant::create([
            'product_id' => $this->product->id,
            'label' => 'White 02',
            'sku' => 'AKM-V60-W02',
            'price' => 150000,
            'stock' => 50,
            'stock_status' => 'in_stock',
        ]);
    }

    public function test_movements_captures_all_sales_and_returns(): void
    {
        // 1. Purchase (PO)
        $po = ProductPurchase::create([
            'purchase_number' => 'PO-TEST-001',
            'status' => ProductPurchase::STATUS_SELESAI,
            'purchase_date' => now(),
            'stock_applied_at' => now(),
            'user_id' => $this->owner->id,
            'total_amount' => 500000,
        ]);
        ProductPurchaseItem::create([
            'product_purchase_id' => $po->id,
            'product_id' => $this->product->id,
            'product_variant_id' => $this->variant->id,
            'quantity' => 10,
            'unit_cost' => 50000,
            'subtotal' => 500000,
        ]);

        // 2. Web Order
        $webOrder = Order::create([
            'order_number' => 'ORD-WEB-001',
            'customer_name' => 'Budi Web',
            'customer_phone' => '0812345678',
            'customer_address' => 'Malang',
            'payment_status' => 'paid',
            'status' => 'processing',
            'payment_details' => ['stock_deducted_at' => now()->toIso8601String()],
            'paid_at' => now(),
        ]);
        OrderItem::create([
            'order_id' => $webOrder->id,
            'product_id' => $this->product->id,
            'product_variant_id' => $this->variant->id,
            'product_name' => $this->product->name,
            'variant_label' => $this->variant->label,
            'quantity' => 2,
            'price' => 150000,
            'subtotal' => 300000,
        ]);

        // 3. POS Order
        $posOrder = Order::create([
            'order_number' => 'POS-261129-001',
            'customer_name' => 'Pelanggan POS',
            'customer_phone' => '-',
            'customer_address' => '-',
            'payment_status' => 'paid',
            'status' => 'completed',
            'payment_details' => ['source' => 'pos', 'cashier_name' => 'Kasir 1'],
            'paid_at' => now(),
        ]);
        OrderItem::create([
            'order_id' => $posOrder->id,
            'product_id' => $this->product->id,
            'product_variant_id' => $this->variant->id,
            'product_name' => $this->product->name,
            'variant_label' => $this->variant->label,
            'quantity' => 3,
            'price' => 150000,
            'subtotal' => 450000,
        ]);

        // 4. Marketplace Order (TikTok Shop)
        $ttsOrder = Order::create([
            'order_number' => 'TTS-577889900',
            'customer_name' => 'Pembeli TikTok',
            'customer_phone' => '08999999',
            'customer_address' => 'Surabaya',
            'payment_status' => 'paid',
            'status' => 'processing',
            'payment_details' => ['source' => 'tiktok', 'platform' => 'TikTok Shop'],
            'created_at' => now(),
        ]);
        OrderItem::create([
            'order_id' => $ttsOrder->id,
            'product_id' => $this->product->id,
            'product_variant_id' => $this->variant->id,
            'product_name' => $this->product->name,
            'variant_label' => $this->variant->label,
            'quantity' => 1,
            'price' => 150000,
            'subtotal' => 150000,
        ]);

        // 5. Marketplace Returned Package (RTS / Cancelled)
        $ttsReturn = Order::create([
            'order_number' => 'TTS-577889999',
            'customer_name' => 'Pembeli Retur TikTok',
            'customer_phone' => '08999999',
            'customer_address' => 'Bandung',
            'payment_status' => 'refunded',
            'status' => 'cancelled',
            'payment_details' => ['source' => 'tiktok', 'platform' => 'TikTok Shop'],
            'created_at' => now(),
        ]);
        OrderItem::create([
            'order_id' => $ttsReturn->id,
            'product_id' => $this->product->id,
            'product_variant_id' => $this->variant->id,
            'product_name' => $this->product->name,
            'variant_label' => $this->variant->label,
            'quantity' => 1,
            'price' => 150000,
            'subtotal' => 150000,
        ]);

        // 6. Manual Stock In
        StockAdjustment::create([
            'adjustment_number' => 'ADJ-IN-001',
            'product_id' => $this->product->id,
            'product_variant_id' => $this->variant->id,
            'type' => 'in',
            'qty_before' => 50,
            'qty_change' => 5,
            'qty_after' => 55,
            'reason' => 'Penyesuaian Stok Masuk',
            'user_id' => $this->owner->id,
        ]);

        // 7. Manual Stock Out
        StockAdjustment::create([
            'adjustment_number' => 'ADJ-OUT-001',
            'product_id' => $this->product->id,
            'product_variant_id' => $this->variant->id,
            'type' => 'out',
            'qty_before' => 55,
            'qty_change' => -2,
            'qty_after' => 53,
            'reason' => 'Barang Rusak',
            'user_id' => $this->owner->id,
        ]);

        $component = new InventoriStok();
        $component->movementSource = 'all';
        $component->startDate = now()->subDays(1)->toDateString();
        $component->endDate = now()->addDays(1)->toDateString();

        $movements = $component->getMovementsProperty();

        $sources = $movements->pluck('source')->all();

        $this->assertContains('purchase', $sources);
        $this->assertContains('web_order', $sources);
        $this->assertContains('pos_order', $sources);
        $this->assertContains('marketplace_order', $sources);
        $this->assertContains('marketplace_return', $sources);
        $this->assertContains('manual_in', $sources);
        $this->assertContains('manual_out', $sources);

        // Verify quantities:
        $ttsMov = $movements->firstWhere('source', 'marketplace_order');
        $this->assertSame(-1, $ttsMov['qty_change']);

        $retMov = $movements->firstWhere('source', 'marketplace_return');
        $this->assertSame(1, $retMov['qty_change']);

        $poMov = $movements->firstWhere('source', 'purchase');
        $this->assertSame(10, $poMov['qty_change']);
    }
}
