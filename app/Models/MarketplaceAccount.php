<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MarketplaceAccount extends Model
{
    use HasFactory;

    protected $fillable = [
        'platform',
        'name',
        'app_key',
        'app_secret',
        'service_id',
        'access_token',
        'refresh_token',
        'access_token_expires_at',
        'refresh_token_expires_at',
        'seller_id',
        'shop_cipher',
        'shop_id',
        'shop_name',
        'seller_base_region',
        'is_active',
        'auto_sync_stock',
        'auto_sync_orders',
        'last_stock_sync_at',
        'last_order_sync_at',
        'sync_logs',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'auto_sync_stock' => 'boolean',
        'auto_sync_orders' => 'boolean',
        'access_token_expires_at' => 'datetime',
        'refresh_token_expires_at' => 'datetime',
        'last_stock_sync_at' => 'datetime',
        'last_order_sync_at' => 'datetime',
        'sync_logs' => 'array',
        'app_secret' => 'encrypted',
        'access_token' => 'encrypted',
        'refresh_token' => 'encrypted',
    ];

    public function isConnected(): bool
    {
        return ! empty($this->access_token) && (! empty($this->shop_cipher) || ! empty($this->shop_id));
    }

    public function isTokenExpired(): bool
    {
        if (! $this->access_token_expires_at) {
            return true;
        }

        // Buffer 5 minutes before actual expiration
        return now()->addMinutes(5)->isAfter($this->access_token_expires_at);
    }
}
