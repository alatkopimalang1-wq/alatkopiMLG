<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Consignor extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'code',
        'phone',
        'email',
        'address',
        'bank_name',
        'bank_account_number',
        'bank_account_holder',
        'default_commission_type',
        'default_commission_rate',
        'notes',
        'is_active',
    ];

    protected $casts = [
        'default_commission_rate' => 'float',
        'is_active' => 'boolean',
    ];

    public function products(): HasMany
    {
        return $this->hasMany(Product::class);
    }

    public function settlements(): HasMany
    {
        return $this->hasMany(ConsignmentSettlement::class);
    }

    public function orderItems(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    public function getBankFormattedAttribute(): string
    {
        if (empty($this->bank_name) && empty($this->bank_account_number)) {
            return '—';
        }

        $parts = array_filter([
            strtoupper((string) $this->bank_name),
            $this->bank_account_number,
            $this->bank_account_holder ? "a.n. {$this->bank_account_holder}" : null,
        ]);

        return implode(' - ', $parts);
    }
}
