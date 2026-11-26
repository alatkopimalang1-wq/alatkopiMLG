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
        'category_ids',
        'discount_percent',
        'is_optional',
        'quantity',
        'sort_order',
    ];

    protected $casts = [
        'category_id' => 'integer',
        'category_ids' => 'array',
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

    /**
     * Resolve all category IDs configured for this slot (supporting both
     * multi-category `category_ids` and legacy single `category_id`).
     *
     * @return int[]
     */
    public function resolvedCategoryIds(): array
    {
        $ids = $this->category_ids;
        if (empty($ids) && $this->category_id) {
            $ids = [$this->category_id];
        }

        return array_values(array_unique(array_filter(array_map('intval', (array) $ids))));
    }
}
