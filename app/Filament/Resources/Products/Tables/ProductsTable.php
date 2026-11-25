<?php

namespace App\Filament\Resources\Products\Tables;

use App\Filament\Resources\Products\ProductResource;
use App\Models\Product;
use App\Models\ProductVariant;
use Filament\Actions\Action;
use Filament\Actions\ActionGroup;
use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Forms\Components\TextInput;
use Filament\Notifications\Notification;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Columns\IconColumn;
use Filament\Tables\Columns\ImageColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Str;

class ProductsTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->modifyQueryUsing(fn (Builder $query) => $query->where('slug', '!=', 'byob'))
            ->columns([
                ImageColumn::make('primaryImage.path')
                    ->label('Foto')
                    ->disk('public')
                    ->circular()
                    ->checkFileExistence(false)
                    ->state(function (Product $record): ?string {
                        $raw = $record->primaryImage?->path
                            ?? $record->images->first(fn ($img) => ! empty($img->path))?->path
                            ?? $record->images()->orderBy('sort_order')->orderBy('id')->first()?->path
                            ?? $record->variants->first(fn ($v) => ! empty($v->image))?->image
                            ?? $record->variants()->whereNotNull('image')->first()?->image;

                        if (empty($raw)) {
                            return null;
                        }

                        if (str_starts_with($raw, 'http://') || str_starts_with($raw, 'https://')) {
                            return $raw;
                        }

                        return ltrim(preg_replace('#^/?(?:(?:storage|public)/)+#', '', trim($raw)), '/');
                    })
                    ->defaultImageUrl(fn () => asset('brand/coffee-beans.png')),

                TextColumn::make('name')
                    ->label('Nama Kopi')
                    ->searchable()
                    ->sortable()
                    ->weight('bold'),

                TextColumn::make('series')
                    ->label('Seri')
                    ->badge()
                    ->color(fn (?string $state): string => Product::getSeriesBadgeColor($state))
                    ->formatStateUsing(fn (?string $state): string => Product::getSeriesLabel($state))
                    ->visibleFrom('md')
                    ->sortable(),

                TextColumn::make('min_price')
                    ->label('Harga Mulai')
                    ->money('IDR', locale: 'id')
                    ->sortable()
                    ->weight('semibold'),

                TextColumn::make('stock')
                    ->label('Stok (Qty)')
                    ->badge()
                    ->color(fn ($state): string => (int) $state > 0 ? 'success' : 'danger')
                    ->formatStateUsing(fn ($state): string => (int) $state > 0 ? number_format((int) $state, 0, ',', '.').' pcs' : 'Habis (0 pcs)')
                    ->description(fn (Product $record) => $record->variants->count() > 1 ? $record->variants->count().' varian' : null)
                    ->sortable(),

                TextColumn::make('process')
                    ->label('Proses')
                    ->searchable()
                    ->toggleable(isToggledHiddenByDefault: true),

                TextColumn::make('tasting_notes')
                    ->label('Profil Rasa')
                    ->limit(30)
                    ->searchable()
                    ->toggleable(isToggledHiddenByDefault: true),

                IconColumn::make('is_featured')
                    ->label('Best Seller')
                    ->boolean()
                    ->toggleable(isToggledHiddenByDefault: true),

                IconColumn::make('is_new')
                    ->label('Baru')
                    ->boolean()
                    ->toggleable(isToggledHiddenByDefault: true),

                TextColumn::make('status')
                    ->badge()
                    ->color(fn (string $state): string => match ($state) {
                        'active' => 'success',
                        'archived' => 'gray',
                        default => 'warning',
                    })
                    ->toggleable(isToggledHiddenByDefault: true),

                TextColumn::make('channel')
                    ->label('Saluran')
                    ->badge()
                    ->color(fn (?string $state): string => match ($state) {
                        'web' => 'info',
                        'pos' => 'warning',
                        default => 'success',
                    })
                    ->formatStateUsing(fn (?string $state): string => match ($state) {
                        'web' => 'Website Saja',
                        'pos' => 'POS Saja',
                        default => 'Website & POS',
                    })
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),

                TextColumn::make('created_at')
                    ->label('Dibuat')
                    ->dateTime('d M Y, H:i')
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            ->defaultSort('created_at', 'desc')
            ->filters([
                SelectFilter::make('stock')
                    ->label('Ketersediaan Stok')
                    ->options([
                        'in_stock' => 'Stok Tersedia (> 0)',
                        'out_of_stock' => 'Stok Habis (0 pcs)',
                    ])
                    ->query(function (Builder $query, array $data) {
                        if (($data['value'] ?? null) === 'in_stock') {
                            $query->where('stock', '>', 0);
                        } elseif (($data['value'] ?? null) === 'out_of_stock') {
                            $query->where(function ($q) {
                                $q->where('stock', '<=', 0)->orWhereNull('stock');
                            });
                        }
                    }),
                SelectFilter::make('series')
                    ->label('Lini / Seri')
                    ->options(fn () => Product::getSeriesOptions()),
                SelectFilter::make('status')
                    ->options([
                        'active' => 'Aktif',
                        'archived' => 'Arsip',
                    ]),
                SelectFilter::make('channel')
                    ->label('Saluran Penjualan')
                    ->options([
                        'all' => 'Website & POS',
                        'web' => 'Website Saja',
                        'pos' => 'POS Saja',
                    ]),
            ])
            ->recordActions([
                ActionGroup::make([
                    EditAction::make(),
                    Action::make('editVariantStock')
                        ->label('Ubah Stok per Varian')
                        ->icon('heroicon-o-cube')
                        ->color('warning')
                        ->modalHeading(fn (Product $record): string => "Kelola Stok Varian: {$record->name}")
                        ->modalDescription('Ubah stok fisik untuk setiap varian kopi. Total stok produk akan dihitung ulang secara otomatis dan disinkronkan ke marketplace.')
                        ->modalSubmitActionLabel('Simpan Perubahan Stok')
                        ->form(function (Product $record): array {
                            return $record->variants->map(function (ProductVariant $variant): TextInput {
                                return TextInput::make("variants.{$variant->id}")
                                    ->label("Varian {$variant->label}")
                                    ->numeric()
                                    ->minValue(0)
                                    ->default($variant->stock)
                                    ->suffix('pcs')
                                    ->required();
                            })->toArray();
                        })
                        ->action(function (Product $record, array $data): void {
                            $variantsInput = $data['variants'] ?? [];
                            foreach ($variantsInput as $variantId => $stock) {
                                $variant = $record->variants->firstWhere('id', (int) $variantId);
                                if ($variant) {
                                    $variant->stock = (int) $stock;
                                    $variant->stock_status = (int) $stock > 0 ? 'in_stock' : 'out_of_stock';
                                    $variant->save();
                                }
                            }
                            $record->syncStockFromVariants();
                            Notification::make()
                                ->title('Stok Varian Berhasil Diperbarui')
                                ->body("Stok seluruh varian '{$record->name}' berhasil disimpan.")
                                ->success()
                                ->send();
                        }),
                    Action::make('toggleStock')
                        ->label(fn (Product $record): string => (int) ($record->stock ?? 0) <= 0 ? 'Set Stok (300 pcs)' : 'Set Habis (0 pcs)')
                        ->icon(fn (Product $record): string => (int) ($record->stock ?? 0) <= 0 ? 'heroicon-o-check-circle' : 'heroicon-o-no-symbol')
                        ->color(fn (Product $record): string => (int) ($record->stock ?? 0) <= 0 ? 'success' : 'danger')
                        ->requiresConfirmation()
                        ->modalHeading(fn (Product $record): string => (int) ($record->stock ?? 0) <= 0 ? 'Set Stok Menjadi 300 pcs?' : 'Tandai Produk Sebagai Stok Habis (0 pcs)?')
                        ->modalDescription(fn (Product $record): string => (int) ($record->stock ?? 0) <= 0 ? 'Stok produk dan seluruh varian akan diatur menjadi 300 pcs dan produk dapat dibeli kembali.' : 'Stok produk dan seluruh varian akan diubah menjadi 0 (Habis).')
                        ->action(function (Product $record): void {
                            $isOutOfStock = (int) ($record->stock ?? 0) <= 0;
                            $newStock = $isOutOfStock ? 300 : 0;
                            $record->stock = $newStock;
                            $record->stock_status = $newStock > 0 ? 'in_stock' : 'out_of_stock';
                            $record->save();

                            $record->variants()->update([
                                'stock' => $newStock,
                                'stock_status' => $newStock > 0 ? 'in_stock' : 'out_of_stock',
                            ]);

                            if ($newStock === 0) {
                                $syncedCount = \App\Services\TikTokShopService::syncOutOfStockForProduct($record);
                                if ($syncedCount > 0) {
                                    Notification::make()
                                        ->title('Stok TikTok Otomatis Dinolkan')
                                        ->body("Stok produk di website diubah menjadi 0. {$syncedCount} varian terhubung di TikTok Shop otomatis diubah stoknya menjadi 0.")
                                        ->warning()
                                        ->send();
                                }
                            }
                        }),
                    Action::make('duplicate')
                        ->label('Salin Produk')
                        ->icon('heroicon-o-document-duplicate')
                        ->color('info')
                        ->tooltip('Salin produk ini menjadi produk baru')
                        ->modalHeading(fn (Product $record): string => "Salin Produk: {$record->name}")
                        ->modalDescription('Produk akan disalin menjadi produk baru lengkap beserta kategori, varian ukuran berat, harga, profil rasa, dan seluruh foto galeri.')
                        ->modalSubmitActionLabel('Buat Salinan')
                        ->form([
                            TextInput::make('name')
                                ->label('Nama Produk Baru')
                                ->required()
                                ->default(fn (Product $record): string => $record->name.' (Salinan)'),
                            TextInput::make('slug')
                                ->label('Slug URL Produk')
                                ->required()
                                ->default(function (Product $record): string {
                                    $baseSlug = Str::slug($record->slug.'-salinan');
                                    $slug = $baseSlug;
                                    $counter = 1;
                                    while (Product::where('slug', $slug)->exists()) {
                                        $slug = "{$baseSlug}-{$counter}";
                                        $counter++;
                                    }

                                    return $slug;
                                })
                                ->helperText('Slug otomatis dibuat unik untuk link URL katalog produk.'),
                        ])
                        ->action(function (Product $record, array $data): void {
                            $newProduct = $record->duplicate($data['name'], $data['slug'] ?? null);

                            Notification::make()
                                ->title('Produk Berhasil Disalin!')
                                ->body("Produk baru '{$newProduct->name}' berhasil dibuat dan berada di urutan paling atas.")
                                ->success()
                                ->actions([
                                    Action::make('edit')
                                        ->label('Buka Produk Baru')
                                        ->url(ProductResource::getUrl('edit', ['record' => $newProduct])),
                                ])
                                ->send();
                        }),
                ])
                ->label('Kelola')
                ->icon('heroicon-m-ellipsis-vertical')
                ->color('primary')
                ->button(),
            ])
            ->toolbarActions([
                BulkActionGroup::make([
                    DeleteBulkAction::make(),
                ]),
            ]);
    }
}
