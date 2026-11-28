<?php

namespace App\Console\Commands;

use App\Services\MarketplaceStockSyncService;
use Illuminate\Console\Command;

class SyncMarketplaceStockCommand extends Command
{
    protected $signature = 'marketplace:sync-stock {platform?}';
    protected $description = 'Synchronize inventory levels bi-directionally between Website, POS, Shopee, and TikTok Shop';

    public function handle(): int
    {
        if (! MarketplaceStockSyncService::isAutoSyncEnabled()) {
            $this->info("Sinkronisasi otomatis marketplace sedang nonaktif.");
            return 0;
        }

        $platform = $this->argument('platform');
        $this->info("Starting bi-directional marketplace stock synchronization" . ($platform ? " for {$platform}" : "") . "...");

        try {
            $res = MarketplaceStockSyncService::syncMarketplaceStockToWebsite($platform);
            $this->info("Synchronization finished. Updated: " . ($res['updated'] ?? 0));
            return 0;
        } catch (\Throwable $e) {
            $this->error("Failed to sync marketplace stock: {$e->getMessage()}");
            return 1;
        }
    }
}
