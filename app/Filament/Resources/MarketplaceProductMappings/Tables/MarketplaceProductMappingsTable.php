<?php

namespace App\Filament\Resources\MarketplaceProductMappings\Tables;

use App\Models\MarketplaceProductMapping;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Services\TikTokShopService;
use Filament\Actions\Action;
use Filament\Actions\ActionGroup;
use Filament\Actions\DeleteAction;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Notifications\Notification;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Columns\ImageColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Table;
use Illuminate\Support\HtmlString;

class MarketplaceProductMappingsTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->searchPlaceholder('Cari')
            ->columns([
                // 1. PRODUK MARKETPLACE (Foto 1:1 + Nama + Varian)
                TextColumn::make('marketplace_product_name')
                    ->label('Produk Marketplace')
                    ->searchable()
                    ->sortable()
                    ->formatStateUsing(function (MarketplaceProductMapping $record): HtmlString {
                        $img = e($record->marketplace_image_url ?: asset('brand/logo-circle.png'));
                        $name = e($record->marketplace_product_name);
                        $variant = '';
                        if ($record->marketplace_sku_name && ! (is_numeric($record->marketplace_sku_name) && strlen((string) $record->marketplace_sku_name) > 10)) {
                            $variant = '<div class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Varian: ' . e($record->marketplace_sku_name) . '</div>';
                        }
                        $platform = $record->platform === 'shopee'
                            ? '<span class="inline-block text-[10px] font-semibold px-1.5 py-0.5 rounded bg-orange-50 text-orange-700 dark:bg-orange-950/60 dark:text-orange-300 mr-1">Shopee</span>'
                            : '<span class="inline-block text-[10px] font-semibold px-1.5 py-0.5 rounded bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300 mr-1">TikTok</span>';

                        return new HtmlString(
                            '<div class="flex items-center gap-2.5 min-w-[220px] max-w-[340px]">'
                            . '<img src="' . $img . '" alt="" class="w-10 h-10 rounded-md object-cover aspect-square shrink-0 border border-gray-200 dark:border-white/10 bg-gray-50">'
                            . '<div class="min-w-0 flex-1">'
                            . '<div class="text-xs font-medium text-gray-900 dark:text-white leading-snug line-clamp-2">' . $platform . $name . '</div>'
                            . $variant
                            . '</div>'
                            . '</div>'
                        );
                    })
                    ->html(),

                // 2. SKU MARKETPLACE
                TextColumn::make('seller_sku')
                    ->label('SKU')
                    ->searchable()
                    ->sortable()
                    ->placeholder('')
                    ->extraAttributes(['class' => 'text-xs text-gray-700 dark:text-gray-300 font-mono'])
                    ->grow(false),

                // 3. STOK MARKETPLACE
                TextColumn::make('marketplace_stock')
                    ->label('Stok')
                    ->sortable()
                    ->alignCenter()
                    ->extraAttributes(['class' => 'text-xs font-medium text-gray-900 dark:text-white'])
                    ->grow(false),

                // 4. PRODUK WEBSITE (Foto 1:1 + Nama + Varian atau Belum dihubungkan)
                TextColumn::make('product.name')
                    ->label('Produk Website')
                    ->searchable()
                    ->sortable()
                    ->default('Belum dihubungkan')
                    ->formatStateUsing(function (MarketplaceProductMapping $record): HtmlString {
                        if (! $record->is_connected || ! $record->product) {
                            return new HtmlString('<span class="text-xs text-gray-400 dark:text-gray-500">Belum dihubungkan</span>');
                        }

                        $img = e($record->website_image_url ?: asset('brand/logo-circle.png'));
                        $name = e($record->product->name);
                        $variant = '';
                        if ($record->variant?->label) {
                            $variant = '<div class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Varian: ' . e($record->variant->label) . '</div>';
                        }

                        return new HtmlString(
                            '<div class="flex items-center gap-2.5 min-w-[200px] max-w-[320px]">'
                            . '<img src="' . $img . '" alt="" class="w-10 h-10 rounded-md object-cover aspect-square shrink-0 border border-gray-200 dark:border-white/10 bg-gray-50">'
                            . '<div class="min-w-0 flex-1">'
                            . '<div class="text-xs font-medium text-gray-900 dark:text-white leading-snug line-clamp-2">' . $name . '</div>'
                            . $variant
                            . '</div>'
                            . '</div>'
                        );
                    })
                    ->html()
                    ->visibleFrom('md'),

                // 5. SKU WEBSITE
                TextColumn::make('variant.sku')
                    ->label('SKU')
                    ->searchable()
                    ->placeholder('')
                    ->extraAttributes(['class' => 'text-xs text-gray-700 dark:text-gray-300 font-mono'])
                    ->grow(false)
                    ->visibleFrom('md'),

                // 6. STOK WEBSITE
                TextColumn::make('website_stock')
                    ->label('Stok')
                    ->getStateUsing(fn (MarketplaceProductMapping $record) => $record->is_connected ? (string) ((int) $record->website_stock) : '-')
                    ->extraAttributes(fn (MarketplaceProductMapping $record): array => [
                        'class' => $record->is_connected && $record->is_stock_conflict
                            ? 'text-xs font-bold text-amber-600 dark:text-amber-400'
                            : 'text-xs font-medium text-gray-700 dark:text-gray-300',
                    ])
                    ->tooltip(function (MarketplaceProductMapping $record) {
                        if (! $record->is_connected) {
                            return 'Belum terhubung ke website';
                        }
                        if ((int) $record->marketplace_stock !== (int) $record->website_stock) {
                            return "Stok MP: {$record->marketplace_stock} | Stok Web: {$record->website_stock}";
                        }
                        return "Stok sama ({$record->website_stock} pcs)";
                    })
                    ->alignCenter()
                    ->grow(false)
                    ->visibleFrom('md'),
            ])
            ->defaultSort('updated_at', 'desc')
            ->actionsColumnLabel(function (): HtmlString {
                $conflictCount = MarketplaceProductMapping::where('marketplace_status', 'ACTIVATE')
                    ->whereNotNull('product_id')
                    ->with(['variant', 'product'])
                    ->get()
                    ->filter(fn ($m) => $m->is_stock_conflict)
                    ->count();

                return new HtmlString(
                    '<button type="button" wire:click="mountAction(\'syncWebToMpAll\')" class="inline-flex items-center justify-center rounded-full bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold px-3.5 py-1.5 shadow-xs transition cursor-pointer whitespace-nowrap">Samakan Stock (' . $conflictCount . ')</button>'
                );
            })
            ->filters([
                SelectFilter::make('platform')
                    ->label('Marketplace')
                    ->options([
                        'shopee' => 'Shopee',
                        'tiktok' => 'TikTok Shop',
                    ]),

                SelectFilter::make('sync_status')
                    ->label('Status Sinkronisasi')
                    ->options([
                        'synced' => 'Tersinkron',
                        'pending' => 'Belum Terhubung',
                        'error' => 'Gagal / Error',
                    ]),
            ])
            ->actions([
                // Tombol langsung jika belum terhubung (pill merah muda seperti referensi)
                Action::make('pairQuick')
                    ->label('Hubungkan')
                    ->icon(Heroicon::Link)
                    ->color('danger')
                    ->size('xs')
                    ->button()
                    ->extraAttributes([
                        'class' => '!rounded-full !bg-rose-500 hover:!bg-rose-600 !text-white !px-4 !py-1.5 !font-semibold !shadow-xs',
                    ])
                    ->visible(fn (MarketplaceProductMapping $record) => ! $record->is_connected)
                    ->modalHeading("Pasangkan Produk TikTok ke Website")
                    ->modalDescription(function (MarketplaceProductMapping $record) {
                        $variantInfo = $record->marketplace_sku_name ? " (Varian Kemasan: {$record->marketplace_sku_name})" : '';
                        return "Produk TikTok: {$record->marketplace_product_name}{$variantInfo}\nStok di TikTok saat ini: {$record->marketplace_stock}";
                    })
                    ->form([
                        Select::make('product_id')
                            ->label('Pilih Produk di Website Sanubari')
                            ->options(Product::orderBy('name')->pluck('name', 'id'))
                            ->searchable()
                            ->reactive()
                            ->required()
                            ->afterStateUpdated(fn ($set) => $set('product_variant_id', null)),

                        Select::make('product_variant_id')
                            ->label('Pilih Varian Kemasan Website')
                            ->options(function ($get) {
                                $productId = $get('product_id');
                                if (! $productId) {
                                    return [];
                                }
                                return ProductVariant::where('product_id', $productId)
                                    ->pluck('label', 'id')
                                    ->toArray();
                            })
                            ->searchable()
                            ->placeholder('Pilih Varian (200g Biji, 1kg Bubuk, dll.)'),

                        TextInput::make('seller_sku')
                            ->label('SKU Penjual (Opsional)')
                            ->helperText('Kode unik SKU penjual untuk otomatisasi pesanan masuk.'),
                    ])
                    ->action(function (MarketplaceProductMapping $record, array $data): void {
                        $record->update([
                            'product_id' => $data['product_id'],
                            'product_variant_id' => $data['product_variant_id'] ?: null,
                            'seller_sku' => $data['seller_sku'],
                            'sync_status' => 'synced',
                            'sync_message' => 'Produk berhasil dipasangkan.',
                        ]);

                        Notification::make()
                            ->title('Produk Berhasil Terhubung!')
                            ->body("Produk TikTok telah dipasangkan ke produk website.")
                            ->success()
                            ->send();
                    }),

                // Status & grup aksi untuk produk yang sudah terhubung
                ActionGroup::make([
                    Action::make('editMapping')
                        ->label('Ubah Hubungan')
                        ->icon(Heroicon::ArrowsRightLeft)
                        ->color('primary')
                        ->modalHeading("Ubah Pasangan Produk TikTok ke Website")
                        ->modalDescription(function (MarketplaceProductMapping $record) {
                            $variantInfo = $record->marketplace_sku_name ? " (Varian: {$record->marketplace_sku_name})" : '';
                            return "Produk TikTok: {$record->marketplace_product_name}{$variantInfo}";
                        })
                        ->form([
                            Select::make('product_id')
                                ->label('Pilih Produk di Website Sanubari')
                                ->options(Product::orderBy('name')->pluck('name', 'id'))
                                ->searchable()
                                ->reactive()
                                ->required()
                                ->afterStateUpdated(fn ($set) => $set('product_variant_id', null)),

                            Select::make('product_variant_id')
                                ->label('Pilih Varian Kemasan Website')
                                ->options(function ($get) {
                                    $productId = $get('product_id');
                                    if (! $productId) {
                                        return [];
                                    }
                                    return ProductVariant::where('product_id', $productId)
                                        ->pluck('label', 'id')
                                        ->toArray();
                                })
                                ->searchable()
                                ->placeholder('Pilih Varian (200g Biji, 1kg Bubuk, dll.)'),

                            TextInput::make('seller_sku')
                                ->label('SKU Penjual (Opsional)')
                                ->helperText('Kode unik SKU penjual untuk otomatisasi pesanan masuk.'),
                        ])
                        ->fillForm(fn (MarketplaceProductMapping $record) => [
                            'product_id' => $record->product_id,
                            'product_variant_id' => $record->product_variant_id,
                            'seller_sku' => $record->seller_sku,
                        ])
                        ->action(function (MarketplaceProductMapping $record, array $data): void {
                            $record->update([
                                'product_id' => $data['product_id'],
                                'product_variant_id' => $data['product_variant_id'] ?: null,
                                'seller_sku' => $data['seller_sku'],
                                'sync_status' => 'synced',
                                'sync_message' => 'Produk berhasil dipasangkan.',
                            ]);

                            Notification::make()
                                ->title('Produk Berhasil Diperbarui!')
                                ->body("Pasangan produk TikTok telah diperbarui.")
                                ->success()
                                ->send();
                        }),

                    Action::make('pushStockSingle')
                        ->label(fn (MarketplaceProductMapping $record) => "Kirim Stok Web ({$record->website_stock}) ke {$record->platform_label}")
                        ->icon(Heroicon::ArrowUpTray)
                        ->color('success')
                        ->requiresConfirmation()
                        ->modalHeading(fn (MarketplaceProductMapping $record) => "Kirim Stok Web ke {$record->platform_label}?")
                        ->modalDescription(fn (MarketplaceProductMapping $record) => "Stok di {$record->platform_label} akan diubah menjadi {$record->website_stock} pcs mengikuti stok real website.")
                        ->action(function (MarketplaceProductMapping $record): void {
                            try {
                                $stock = (int) $record->website_stock;
                                if ($record->platform === 'shopee') {
                                    $service = new \App\Services\ShopeeService();
                                    $service->updateSingleSkuInventory(
                                        $record->marketplace_product_id,
                                        $record->marketplace_sku_id,
                                        $stock
                                    );
                                } else {
                                    $service = new TikTokShopService();
                                    $service->updateSingleSkuInventory(
                                        $record->marketplace_product_id,
                                        $record->marketplace_sku_id,
                                        $stock
                                    );
                                }

                                $record->update([
                                    'marketplace_stock' => $stock,
                                    'last_synced_stock' => $stock,
                                    'last_synced_at' => now(),
                                    'sync_status' => 'synced',
                                    'sync_message' => "Stok di {$record->platform_label} berhasil disamakan menjadi {$stock}.",
                                ]);

                                Notification::make()
                                    ->title("Stok {$record->platform_label} Disamakan!")
                                    ->body("Stok sebanyak {$stock} pcs telah berhasil dikirim ke {$record->platform_label}.")
                                    ->success()
                                    ->send();
                            } catch (\Throwable $e) {
                                Notification::make()
                                    ->title('Gagal Kirim Stok')
                                    ->body($e->getMessage())
                                    ->danger()
                                    ->send();
                            }
                        }),

                    Action::make('unpair')
                        ->label('Putus Hubungan')
                        ->icon(Heroicon::XMark)
                        ->color('danger')
                        ->requiresConfirmation()
                        ->modalHeading('Putuskan Hubungan Produk?')
                        ->modalDescription('Produk TikTok ini akan dilepas dari produk website dan statusnya menjadi Belum Terhubung.')
                        ->action(function (MarketplaceProductMapping $record): void {
                            $record->update([
                                'product_id' => null,
                                'product_variant_id' => null,
                                'sync_status' => 'pending',
                                'sync_message' => 'Hubungan produk telah diputus.',
                            ]);

                            Notification::make()
                                ->title('Hubungan Produk Diputus')
                                ->body('Produk kini berstatus Belum Terhubung.')
                                ->info()
                                ->send();
                        }),

                    DeleteAction::make()
                        ->label('Hapus Baris'),
                ])
                ->label(fn (MarketplaceProductMapping $record) => $record->is_stock_conflict ? 'Samakan Stok' : 'Terhubung')
                ->icon(null)
                ->link()
                ->size('xs')
                ->color(fn (MarketplaceProductMapping $record) => $record->is_stock_conflict ? 'warning' : 'success')
                ->extraAttributes(fn (MarketplaceProductMapping $record): array => [
                    'class' => $record->is_stock_conflict ? '!font-semibold !text-amber-600' : '!font-semibold !text-emerald-600',
                ])
                ->visible(fn (MarketplaceProductMapping $record) => $record->is_connected),
            ]);
    }
}
