<?php

namespace App\Console\Commands;

use App\Models\MarketplaceProductMapping;
use Illuminate\Console\Command;

class ResetMarketplaceMappingsCommand extends Command
{
    protected $signature = 'marketplace:reset-mappings {--platform= : Filter by platform (shopee/tiktok)}';
    protected $description = 'Reset all connected marketplace product mappings back to unconnected';

    public function handle(): int
    {
        $platform = $this->option('platform');
        $query = MarketplaceProductMapping::whereNotNull('product_id');

        if ($platform) {
            $query->where('platform', $platform);
        }

        $count = $query->count();

        if ($count === 0) {
            $this->info("Tidak ada produk marketplace terhubung yang perlu di-reset.");
            return 0;
        }

        $this->info("Ditemukan {$count} produk marketplace terhubung.");

        $updated = $query->update([
            'product_id' => null,
            'product_variant_id' => null,
            'sync_status' => 'pending',
            'sync_message' => 'Hubungan produk telah direset ke Belum Terhubung.',
        ]);

        $this->info("Berhasil mereset {$updated} produk marketplace menjadi Belum Terhubung.");

        return 0;
    }
}
