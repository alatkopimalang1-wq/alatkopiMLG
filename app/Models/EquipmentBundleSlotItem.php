<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EquipmentBundleSlotItem extends Model
{
    protected $fillable = [
        'equipment_bundle_slot_id',
        'product_id',
        'product_variant_id',
        'bundle_price',
        'sort_order',
    ];

    protected $casts = [
        'bundle_price' => 'float',
        'sort_order' => 'integer',
    ];

    public function slot(): BelongsTo
    {
        return $this->belongsTo(EquipmentBundleSlot::class, 'equipment_bundle_slot_id');
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function variant(): BelongsTo
    {
        return $this->belongsTo(ProductVariant::class, 'product_variant_id');
    }
}
