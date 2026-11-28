<?php

namespace Tests\Feature\Admin;

use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Livewire\Livewire;
use Tests\TestCase;

class OwnerStockAdjustmentPolicyTest extends TestCase
{
    use RefreshDatabase;

    protected User $owner;
    protected User $adminStaff;
    protected Product $product;
    protected ProductVariant $variant;

    protected function setUp(): void
    {
        parent::setUp();

        $this->owner = User::create([
            'name' => 'Owner Sanubari',
            'email' => 'owner-test@sanubari.co.id',
            'password' => bcrypt('password'),
            'role' => 'owner',
            'pos_role' => 'owner',
        ]);

        $this->adminStaff = User::create([
            'name' => 'Admin Staff',
            'email' => 'staff-test@sanubari.co.id',
            'password' => bcrypt('password'),
            'role' => 'admin',
            'pos_role' => 'admin',
        ]);

        $this->product = Product::create([
            'name' => 'Grinder Espresso Pro',
            'slug' => 'grinder-espresso-pro',
            'series' => 'alat-kopi',
            'stock' => 5,
            'stock_status' => 'in_stock',
        ]);

        $this->variant = ProductVariant::create([
            'product_id' => $this->product->id,
            'label' => 'Standard',
            'sku' => 'AKM-GEP-01',
            'price' => 2500000,
            'stock' => 5,
            'stock_status' => 'in_stock',
        ]);
    }

    public function test_non_owner_cannot_adjust_stock_via_endpoint(): void
    {
        $response = $this->actingAs($this->adminStaff)->postJson(route('admin.products.variants.quick-stock', $this->variant), [
            'stock' => 10,
        ]);

        $response->assertStatus(403);
        $this->variant->refresh();
        $this->assertSame(5, (int) $this->variant->stock);
    }

    public function test_owner_can_adjust_stock_via_endpoint(): void
    {
        $response = $this->actingAs($this->owner)->postJson(route('admin.products.variants.quick-stock', $this->variant), [
            'stock' => 10,
        ]);

        $response->assertOk();
        $this->variant->refresh();
        $this->assertSame(10, (int) $this->variant->stock);
    }
}
