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

class MarketplaceProductMappingsTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->columns([
                // 1. FOTO PRODUK MARKETPLACE
                ImageColumn::make('marketplace_image_url')
                    ->label('')
                    ->square()
                    ->imageSize(44)
                    ->extraImgAttributes([
                        'class' => 'rounded-md object-cover aspect-square',
                    ])
                    ->grow(false)
                    ->defaultImageUrl(asset('brand/logo-circle.png')),

                // 2. PLATFORM MARKETPLACE
                TextColumn::make('platform')
                    ->label('Marketplace')
                    ->badge()
                    ->formatStateUsing(fn (?string $state) => match ($state) {
                        'shopee' => 'Shopee',
                        'tiktok' => 'TikTok Shop',
                        default => ucfirst((string) $state),
                    })
                    ->color(fn (?string $state) => match ($state) {
                        'shopee' => 'warning',
                        'tiktok' => 'info',
                        default => 'gray',
                    })
                    ->sortable()
                    ->grow(false),

                // 3. PRODUK MARKETPLACE (Nama + Varian + SKU)
                TextColumn::make('marketplace_product_name')
                    ->label('Produk Marketplace')
                    ->searchable()
                    ->sortable()
                    ->weight('bold')
                    ->description(function (MarketplaceProductMapping $record) {
                        $parts = [];
                        if ($record->marketplace_sku_name && ! (is_numeric($record->marketplace_sku_name) && strlen((string) $record->marketplace_sku_name) > 10)) {
                            $parts[] = "Varian: {$record->marketplace_sku_name}";
                        }
                        if ($record->seller_sku) {
                            $parts[] = "SKU: {$record->seller_sku}";
                        }
                        return ! empty($parts) ? implode(' • ', $parts) : null;
                    })
                    ->wrap(),

                // 4. STOK MARKETPLACE
                TextColumn::make('marketplace_stock')
                    ->label('Stok MP')
                    ->badge()
                    ->color('info')
                    ->sortable()
                    ->alignCenter()
                    ->grow(false),

                // 5. PRODUK WEBSITE SANUBARI (Nama + Varian + SKU)
                TextColumn::make('product.name')
                    ->label('Produk Website Sanubari')
                    ->searchable()
                    ->sortable()
                    ->weight('bold')
                    ->color('warning')
                    ->description(function (MarketplaceProductMapping $record) {
                        if (! $record->is_connected) {
                            return 'Belum dipasangkan';
                        }
                        $parts = [];
                        if ($record->variant?->label) {
                            $parts[] = "Varian: {$record->variant->label}";
                        }
                        if ($record->variant?->sku) {
                            $parts[] = "SKU: {$record->variant->sku}";
                        }
                        return ! empty($parts) ? implode(' • ', $parts) : 'Produk Utama';
                    })
                    ->placeholder('Belum Dipasangkan')
                    ->wrap()
                    ->visibleFrom('md'),

                // 6. STOK WEBSITE REAL
                TextColumn::make('website_stock')
                    ->label('Stok Web')
                    ->badge()
                    ->getStateUsing(fn (MarketplaceProductMapping $record) => $record->website_stock_label)
                    ->color(function (MarketplaceProductMapping $record) {
                        if (! $record->is_connected) {
                            return 'gray';
                        }
                        $webStock = (int) $record->website_stock;
                        if ($webStock <= 0) {
                            return 'danger';
                        }
                        if ((int) $record->marketplace_stock !== $webStock) {
                            return 'warning';
                        }
                        return 'success';
                    })
                    ->tooltip(function (MarketplaceProductMapping $record) {
                        if (! $record->is_connected) {
                            return 'Belum terhubung ke website';
                        }
                        if ((int) $record->marketplace_stock !== (int) $record->website_stock) {
                            return "Stok MP: {$record->marketplace_stock} | Stok Web: {$record->website_stock}. Klik Atur untuk menyamakan.";
                        }
                        return "Stok sama ({$record->website_stock} pcs)";
                    })
                    ->alignCenter()
                    ->grow(false)
                    ->visibleFrom('md'),

                // 7. STATUS
                TextColumn::make('status')
                    ->label('Status')
                    ->badge()
                    ->getStateUsing(fn (MarketplaceProductMapping $record) => $record->is_connected ? 'Terhubung' : 'Belum')
                    ->color(fn (MarketplaceProductMapping $record) => $record->is_connected ? 'success' : 'gray')
                    ->alignCenter()
                    ->grow(false),
            ])
            ->defaultSort('updated_at', 'desc')
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
                // Tombol langsung jika belum terhubung
                Action::make('pairQuick')
                    ->label('Hubungkan')
                    ->icon(Heroicon::Link)
                    ->color('warning')
                    ->size('xs')
                    ->button()
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

                // Group aksi untuk produk yang sudah terhubung
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
                ->label('Atur')
                ->icon(Heroicon::EllipsisVertical)
                ->button()
                ->size('xs')
                ->color('gray')
                ->visible(fn (MarketplaceProductMapping $record) => $record->is_connected),
            ]);
    }
}
