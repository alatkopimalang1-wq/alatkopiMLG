<?php

namespace App\Providers;

use Carbon\CarbonImmutable;
use Filament\Tables\Table;
use Illuminate\Support\Facades\Date;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\ServiceProvider;
use Illuminate\Validation\Rules\Password;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $this->configureDefaults();

        if (str_starts_with((string) config('app.url'), 'https://') || app()->isProduction()) {
            URL::forceScheme('https');
        }

        // Tampilkan tabel Filament secara bertumpuk (stacked cards) di mobile agar pas 1 layar tanpa geser samping
        Table::configureUsing(function (Table $table): void {
            $table->stackedOnMobile();
        });

        // Otomatis ubah stok TikTok Shop menjadi 0 saat status produk di website diset Habis
        \App\Models\Product::saved(function (\App\Models\Product $product) {
            if ($product->wasChanged('stock_status') && $product->stock_status === 'out_of_stock') {
                \App\Services\TikTokShopService::syncOutOfStockForProduct($product);
            }
        });

        // Otomatis ubah stok varian TikTok Shop menjadi 0 saat status varian di website diset Habis
        \App\Models\ProductVariant::saved(function (\App\Models\ProductVariant $variant) {
            if ($variant->wasChanged('stock_status') && $variant->stock_status === 'out_of_stock') {
                \App\Services\TikTokShopService::syncOutOfStockForVariant($variant);
            }
        });
    }

    /**
     * Configure default behaviors for production-ready applications.
     */
    protected function configureDefaults(): void
    {
        Date::use(CarbonImmutable::class);

        DB::prohibitDestructiveCommands(
            app()->isProduction(),
        );

        Password::defaults(fn (): ?Password => app()->isProduction()
            ? Password::min(12)
                ->mixedCase()
                ->letters()
                ->numbers()
                ->symbols()
                ->uncompromised()
            : null,
        );
    }
}
