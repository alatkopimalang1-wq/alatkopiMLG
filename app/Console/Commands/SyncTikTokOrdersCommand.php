<?php

namespace App\Console\Commands;

use App\Services\TikTokShopService;
use Illuminate\Console\Command;

class SyncTikTokOrdersCommand extends Command
{
    protected $signature = 'tiktok:sync-orders {--days=30}';
    protected $description = 'Fetch and synchronize TikTok Shop orders from the last 30 days for active products';

    public function handle(TikTokShopService $service): int
    {
        $days = (int) $this->option('days');
        $this->info("Starting TikTok Shop orders synchronization for the last {$days} days...");

        try {
            $result = $service->syncOrders();

            $this->info("Successfully synced {$result['synced_count']} orders (from {$result['total_found']} found) from TikTok Shop!");
            return 0;
        } catch (\Throwable $e) {
            $this->error("Failed to sync orders: {$e->getMessage()}");
            return 1;
        }
    }
}
