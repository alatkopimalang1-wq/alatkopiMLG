<?php

use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\StockAdjustment;
use App\Models\StockDocument;
use App\Models\StockDocumentItem;
use App\Models\User;

beforeEach(function () {
    $this->user = User::factory()->create(['role' => 'admin']);
    $this->actingAs($this->user);

    $this->product = Product::create([
        'name' => 'Kettle Test Stok',
        'slug' => 'kettle-test-stok-' . uniqid(),
        'series' => 'alat-kopi',
        'status' => 'active',
        'stock' => 10,
        'price' => 250000,
        'is_preorder' => false,
    ]);

    $this->variant = ProductVariant::create([
        'product_id' => $this->product->id,
        'label' => 'Hitam',
        'sku' => 'KTL-BLK-01',
        'price' => 250000,
        'cost_price' => 150000,
        'stock' => 10,
        'stock_status' => 'in_stock',
    ]);
});

test('draft stok masuk does not change stock until posted, and applies weighted average cost on post', function () {
    $doc = StockDocument::create([
        'document_number' => StockDocument::generateNumber('in'),
        'type' => 'in',
        'status' => 'draft',
        'document_date' => now()->toDateString(),
        'supplier_name' => 'PT Kopi Jaya',
        'user_id' => $this->user->id,
    ]);

    expect($doc->document_number)->toStartWith('IN');

    StockDocumentItem::create([
        'stock_document_id' => $doc->id,
        'product_id' => $this->product->id,
        'product_variant_id' => $this->variant->id,
        'qty' => 10,
        'unit_cost' => 200000,
    ]);

    // Still draft: stock must remain 10
    expect($this->variant->fresh()->stock)->toBe(10);

    // Post document
    $doc->postDocument($this->user->id);

    expect($doc->fresh()->status)->toBe('posted');
    expect($this->variant->fresh()->stock)->toBe(20);
    // Weighted avg: (10 * 150000 + 10 * 200000) / 20 = 175000
    expect((float) $this->variant->fresh()->cost_price)->toBe(175000.0);
    expect($this->product->fresh()->stock)->toBe(20);
    expect(StockAdjustment::where('adjustment_number', $doc->document_number)->exists())->toBeTrue();
});

test('draft stok keluar deducts stock only when posted and reverses on cancel', function () {
    $doc = StockDocument::create([
        'document_number' => StockDocument::generateNumber('out'),
        'type' => 'out',
        'status' => 'draft',
        'document_date' => now()->toDateString(),
        'reason' => 'Barang Rusak / Cacat',
        'user_id' => $this->user->id,
    ]);

    expect($doc->document_number)->toStartWith('OG');

    StockDocumentItem::create([
        'stock_document_id' => $doc->id,
        'product_id' => $this->product->id,
        'product_variant_id' => $this->variant->id,
        'qty' => 4,
        'unit_cost' => 0,
    ]);

    // Draft: stock remains 10
    expect($this->variant->fresh()->stock)->toBe(10);

    // Post: stock becomes 6
    $doc->postDocument($this->user->id);
    expect($doc->fresh()->status)->toBe('posted');
    expect($this->variant->fresh()->stock)->toBe(6);

    // Cancel posted doc: stock reverses back to 10
    $doc->cancelDocument($this->user->id);
    expect($doc->fresh()->status)->toBe('cancelled');
    expect($this->variant->fresh()->stock)->toBe(10);
});

test('inventori page renders without errors on all tabs', function () {
    foreach (['masuk', 'keluar', 'stok', 'pergerakan'] as $tab) {
        \Livewire\Livewire::test(\App\Filament\Pages\InventoriStok::class)
            ->set('activeTab', $tab)
            ->assertStatus(200);
    }
});

test('manage stock document page renders with normal searchable product select and shows added item immediately', function () {
    $doc = StockDocument::create([
        'document_number' => StockDocument::generateNumber('in'),
        'type' => 'in',
        'status' => 'draft',
        'document_date' => now()->toDateString(),
        'user_id' => $this->user->id,
    ]);

    \Livewire\Livewire::withQueryParams(['record' => $doc->id])
        ->test(\App\Filament\Pages\ManageStockDocument::class)
        ->assertStatus(200)
        ->assertSee($doc->document_number)
        ->set('addFormData.variant_id', $this->variant->id)
        ->set('addFormData.unit_cost', 180000)
        ->set('addFormData.qty', 3)
        ->call('addItemToDocument')
        ->assertSee('Kettle Test Stok')
        ->assertSee('Produk Stok Masuk (1)');
});
