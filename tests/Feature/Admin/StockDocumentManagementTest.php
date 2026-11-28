<?php

namespace Tests\Feature\Admin;

use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\StockAdjustment;
use App\Models\StockDocument;
use App\Models\StockDocumentItem;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class StockDocumentManagementTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;
    protected Product $product;
    protected ProductVariant $variant;

    protected function setUp(): void
    {
        parent::setUp();

        $this->admin = User::firstOrCreate(
            ['email' => 'admin@sanubari.co.id'],
            [
                'name' => 'Admin Stock',
                'password' => bcrypt('password'),
                'role' => 'admin',
            ]
        );

        $this->product = Product::create([
            'name' => 'Kopi Arabika Konsinyasi',
            'slug' => 'kopi-arabika-konsinyasi',
            'series' => 'alat-kopi',
            'stock' => 10,
            'stock_status' => 'in_stock',
        ]);

        $this->variant = ProductVariant::create([
            'product_id' => $this->product->id,
            'label' => '250g Biji',
            'sku' => 'AKM-ARB-250',
            'price' => 75000,
            'cost_price' => 50000,
            'stock' => 10,
            'stock_status' => 'in_stock',
        ]);
    }

    public function test_draft_stock_in_does_not_change_stock_until_posted(): void
    {
        $doc = StockDocument::create([
            'document_number' => StockDocument::generateNumber(StockDocument::TYPE_IN),
            'type' => StockDocument::TYPE_IN,
            'status' => StockDocument::STATUS_DRAFT,
            'transaction_date' => now()->toDateString(),
            'partner_name' => 'Penitip Kopi Dampit',
            'user_id' => $this->admin->id,
            'total_qty' => 5,
            'total_cost' => 250000,
        ]);

        StockDocumentItem::create([
            'stock_document_id' => $doc->id,
            'product_id' => $this->product->id,
            'product_variant_id' => $this->variant->id,
            'quantity' => 5,
            'unit_cost' => 50000,
            'subtotal_cost' => 250000,
        ]);

        $this->variant->refresh();
        $this->assertSame(10, (int) $this->variant->stock);

        // Posting doc
        $doc->postStock();

        $this->variant->refresh();
        $this->assertSame(15, (int) $this->variant->stock);

        $adjustment = StockAdjustment::where('product_variant_id', $this->variant->id)->latest('id')->first();
        $this->assertNotNull($adjustment);
        $this->assertSame('in', $adjustment->type);
        $this->assertSame(10, (int) $adjustment->qty_before);
        $this->assertSame(5, (int) $adjustment->qty_change);
        $this->assertSame(15, (int) $adjustment->qty_after);
    }

    public function test_stock_out_reduces_stock_properly(): void
    {
        $doc = StockDocument::create([
            'document_number' => StockDocument::generateNumber(StockDocument::TYPE_OUT),
            'type' => StockDocument::TYPE_OUT,
            'status' => StockDocument::STATUS_DRAFT,
            'transaction_date' => now()->toDateString(),
            'partner_name' => 'Retur ke Penitip',
            'user_id' => $this->admin->id,
            'total_qty' => 3,
            'total_cost' => 150000,
        ]);

        StockDocumentItem::create([
            'stock_document_id' => $doc->id,
            'product_id' => $this->product->id,
            'product_variant_id' => $this->variant->id,
            'quantity' => 3,
            'unit_cost' => 50000,
            'subtotal_cost' => 150000,
        ]);

        $doc->postStock();

        $this->variant->refresh();
        $this->assertSame(7, (int) $this->variant->stock);

        $adjustment = StockAdjustment::where('product_variant_id', $this->variant->id)->latest('id')->first();
        $this->assertNotNull($adjustment);
        $this->assertSame('out', $adjustment->type);
        $this->assertSame(10, (int) $adjustment->qty_before);
        $this->assertSame(-3, (int) $adjustment->qty_change);
        $this->assertSame(7, (int) $adjustment->qty_after);
    }

    public function test_print_page_renders_successfully(): void
    {
        $doc = StockDocument::create([
            'document_number' => StockDocument::generateNumber(StockDocument::TYPE_IN),
            'type' => StockDocument::TYPE_IN,
            'status' => StockDocument::STATUS_POSTED,
            'transaction_date' => now()->toDateString(),
            'partner_name' => 'Penitip Kopi Dampit',
            'user_id' => $this->admin->id,
            'total_qty' => 5,
            'total_cost' => 250000,
        ]);

        StockDocumentItem::create([
            'stock_document_id' => $doc->id,
            'product_id' => $this->product->id,
            'product_variant_id' => $this->variant->id,
            'quantity' => 5,
            'unit_cost' => 50000,
            'subtotal_cost' => 250000,
        ]);

        $response = $this->actingAs($this->admin)->get(route('admin.stock-documents.print', $doc));

        $response->assertOk();
        $response->assertSee('BUKTI PENERIMAAN BARANG / KONSINYASI MASUK');
        $response->assertSee('Penitip Kopi Dampit');
        $response->assertSee('AKM-ARB-250');
    }
}
