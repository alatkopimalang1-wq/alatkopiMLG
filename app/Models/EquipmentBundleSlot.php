<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class EquipmentBundleSlot extends Model
{
    protected $fillable = [
        'equipment_bundle_id',
        'title',
        'slot_type',
        'category_id',
        'discount_percent',
        'is_optional',
        'quantity',
        'sort_order',
    ];

    protected $casts = [
        'category_id' => 'integer',
        'discount_percent' => 'float',
        'is_optional' => 'boolean',
        'quantity' => 'integer',
        'sort_order' => 'integer',
    ];

    public function bundle(): BelongsTo
    {
        return $this->belongsTo(EquipmentBundle::class, 'equipment_bundle_id');
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(EquipmentBundleSlotItem::class)->orderBy('sort_order')->orderBy('id');
    }
}
