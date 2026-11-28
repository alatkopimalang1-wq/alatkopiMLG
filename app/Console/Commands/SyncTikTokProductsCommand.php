<?php

namespace App\Console\Commands;

use App\Services\TikTokShopService;
use Illuminate\Console\Command;

class SyncTikTokProductsCommand extends Command
{
    protected $signature = 'tiktok:sync-products {--pagesize=100} {--force-details}';
    protected $description = 'Fetch and synchronize TikTok Shop products and SKU variants with packaging details';

    public function handle(TikTokShopService $service): int
    {
        $this->info('Starting TikTok Shop products synchronization...');

        try {
            $pageSize = (int) $this->option('pagesize');
            $forceDetails = (bool) $this->option('force-details');
            $result = $service->syncProductsFromTikTok($pageSize, $forceDetails);

            $this->info("Successfully synced {$result['total_products']} products and {$result['total_mapped']} SKU variants from TikTok Shop!");
            return 0;
        } catch (\Throwable $e) {
            $this->error("Failed to sync products: {$e->getMessage()}");
            return 1;
        }
    }
}
