<?php

namespace App\Filament\Resources\EquipmentProducts\Tables;

use App\Filament\Resources\EquipmentProducts\EquipmentProductResource;
use App\Models\Product;
use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Tables\Columns\ImageColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\HtmlString;

class EquipmentProductsTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->defaultSort('id', 'desc')
            ->searchPlaceholder('Cari Produk / SKU...')
            ->columns([
                ImageColumn::make('primaryImage.path')
                    ->label('Foto')
                    ->disk('public')
                    ->circular()
                    ->imageSize(40)
                    ->checkFileExistence(false)
                    ->state(function (Product $record): ?string {
                        $raw = $record->primaryImage?->path
                            ?? $record->images->first(fn ($img) => ! empty($img->path))?->path
                            ?? $record->variants->first(fn ($v) => ! empty($v->image))?->image;

                        if (empty($raw)) {
                            return null;
                        }

                        if (str_starts_with($raw, 'http://') || str_starts_with($raw, 'https://')) {
                            return $raw;
                        }

                        return ltrim(preg_replace('#^/?(?:(?:storage|public)/)+#', '', trim($raw)), '/');
                    })
                    ->defaultImageUrl(fn () => asset('brand/logo-circle.png'))
                    ->url(fn (Product $record): string => EquipmentProductResource::getUrl('edit', ['record' => $record])),

                TextColumn::make('name')
                    ->label('Nama Produk')
                    ->url(fn (Product $record): string => EquipmentProductResource::getUrl('edit', ['record' => $record]))
                    ->searchable(query: function (Builder $query, string $search): Builder {
                        return $query->where(function (Builder $q) use ($search) {
                            $q->where('name', 'like', "%{$search}%")
                                ->orWhere('origin', 'like', "%{$search}%")
                                ->orWhere('process', 'like', "%{$search}%")
                                ->orWhereHas('variants', fn (Builder $vq) => $vq->where('sku', 'like', "%{$search}%"));
                        });
                    })
                    ->sortable()
                    ->weight('semibold')
                    ->color('info')
                    ->wrap()
                    ->description(function (Product $record): string {
                        $catName = $record->categories->first()?->name;
                        if (is_array($catName)) {
                            $catName = $catName[app()->getLocale()] ?? $catName['id'] ?? $catName['en'] ?? reset($catName) ?? '';
                        }
                        $label = $catName ?: ($record->process ?: ($record->origin ?: 'ALAT KOPI'));

                        return strtoupper((string) $label);
                    }),

                TextColumn::make('variants_label')
                    ->label('Variant')
                    ->html()
                    ->state(function (Product $record): HtmlString {
                        $variants = $record->variants;
                        if ($variants->isEmpty()) {
                            return new HtmlString('');
                        }
                        if ($variants->count() === 1 && strcasecmp((string) $variants->first()->label, 'Standard') === 0) {
                            return new HtmlString('<div class="h-6 leading-6 text-xs text-gray-400">—</div>');
                        }

                        $lines = $variants->map(function ($v) {
                            $label = e((string) $v->label);

                            return "<div class=\"h-6 leading-6 text-xs text-gray-700 dark:text-gray-200 whitespace-nowrap\">{$label}</div>";
                        })->implode('');

                        return new HtmlString("<div class=\"space-y-1\">{$lines}</div>");
                    }),

                TextColumn::make('variants_sku')
                    ->label('SKU')
                    ->html()
                    ->state(function (Product $record): HtmlString {
                        $variants = $record->variants;
                        if ($variants->isEmpty()) {
                            return new HtmlString('<div class="h-6 leading-6 text-xs text-gray-400">—</div>');
                        }

                        $lines = $variants->map(function ($v) {
                            $sku = ! empty($v->sku) ? e((string) $v->sku) : '—';

                            return "<div class=\"h-6 leading-6 font-mono text-xs text-gray-600 dark:text-gray-300 whitespace-nowrap\">{$sku}</div>";
                        })->implode('');

                        return new HtmlString("<div class=\"space-y-1\">{$lines}</div>");
                    }),

                TextColumn::make('stock')
                    ->label('Qty Stok')
                    ->html()
                    ->sortable()
                    ->state(function (Product $record): HtmlString {
                        $variants = $record->variants;

                        if ($record->is_preorder) {
                            if ($variants->isEmpty()) {
                                $isOut = $record->is_out_of_stock;
                                $badge = $isOut
                                    ? '<span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-rose-600 text-white">Kosong (PO)</span>'
                                    : '<span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-emerald-600 text-white">Tersedia (PO)</span>';

                                return new HtmlString("<div class=\"h-6 flex items-center\">{$badge}</div>");
                            }

                            $lines = $variants->map(function ($v) use ($record) {
                                $isOut = $record->stock_status === 'out_of_stock' || $v->stock_status === 'out_of_stock';

                                return $isOut
                                    ? '<div class="h-6 flex items-center"><span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-rose-600 text-white">Kosong (PO)</span></div>'
                                    : '<div class="h-6 flex items-center"><span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-emerald-600 text-white">Tersedia (PO)</span></div>';
                            })->implode('');

                            return new HtmlString("<div class=\"space-y-1\">{$lines}</div>");
                        }

                        if ($variants->isEmpty()) {
                            $qty = (int) ($record->stock ?? 0);
                            if ($qty <= 1) {
                                return new HtmlString("<div class=\"h-6 flex items-center\"><span class=\"inline-flex items-center justify-center min-w-[22px] px-1.5 py-0.5 rounded text-xs font-bold bg-amber-500 text-white\">{$qty}</span></div>");
                            }

                            return new HtmlString("<div class=\"h-6 leading-6 text-xs font-semibold text-gray-800 dark:text-gray-200\">{$qty}</div>");
                        }

                        $lines = $variants->map(function ($v) {
                            $qty = (int) ($v->stock ?? 0);
                            if ($qty <= 1) {
                                return "<div class=\"h-6 flex items-center\"><span class=\"inline-flex items-center justify-center min-w-[22px] px-1.5 py-0.5 rounded text-xs font-bold bg-amber-500 text-white\">{$qty}</span></div>";
                            }

                            return "<div class=\"h-6 leading-6 text-xs font-semibold text-gray-800 dark:text-gray-200\">{$qty}</div>";
                        })->implode('');

                        return new HtmlString("<div class=\"space-y-1\">{$lines}</div>");
                    }),

                TextColumn::make('variants_cost_price')
                    ->label('Harga Beli')
                    ->html()
                    ->state(function (Product $record): HtmlString {
                        $variants = $record->variants;
                        if ($variants->isEmpty()) {
                            return new HtmlString('<div class="h-6 leading-6 text-xs text-gray-400">0,00</div>');
                        }

                        $lines = $variants->map(function ($v) {
                            $cost = number_format((float) ($v->cost_price ?? 0), 2, ',', '.');

                            return "<div class=\"h-6 leading-6 text-xs text-gray-700 dark:text-gray-200 whitespace-nowrap\"><span class=\"border-b border-dashed border-gray-400/60 pb-0.5\">{$cost}</span></div>";
                        })->implode('');

                        return new HtmlString("<div class=\"space-y-1\">{$lines}</div>");
                    }),

                TextColumn::make('min_price')
                    ->label('Harga Jual di Toko')
                    ->html()
                    ->sortable()
                    ->state(function (Product $record): HtmlString {
                        $variants = $record->variants;
                        if ($variants->isEmpty()) {
                            $price = number_format((float) ($record->min_price ?? 0), 2, ',', '.');

                            return new HtmlString("<div class=\"h-6 leading-6 text-xs font-semibold text-gray-800 dark:text-gray-200 whitespace-nowrap\"><span class=\"border-b border-dashed border-gray-400/60 pb-0.5\">{$price}</span></div>");
                        }

                        $lines = $variants->map(function ($v) {
                            $price = number_format((float) ($v->price ?? 0), 2, ',', '.');

                            return "<div class=\"h-6 leading-6 text-xs font-semibold text-gray-800 dark:text-gray-200 whitespace-nowrap\"><span class=\"border-b border-dashed border-gray-400/60 pb-0.5\">{$price}</span></div>";
                        })->implode('');

                        return new HtmlString("<div class=\"space-y-1\">{$lines}</div>");
                    }),
            ])
            ->filters([
                SelectFilter::make('categories')
                    ->label('Kategori')
                    ->relationship('categories', 'name')
                    ->preload()
                    ->searchable(),

                SelectFilter::make('origin')
                    ->label('Brand')
                    ->options(fn (): array => Product::query()
                        ->where('series', 'alat-kopi')
                        ->whereNotNull('origin')
                        ->where('origin', '!=', '')
                        ->distinct()
                        ->orderBy('origin')
                        ->pluck('origin', 'origin')
                        ->all())
                    ->searchable(),

                SelectFilter::make('process')
                    ->label('Tipe Alat')
                    ->options(fn (): array => Product::query()
                        ->where('series', 'alat-kopi')
                        ->whereNotNull('process')
                        ->where('process', '!=', '')
                        ->distinct()
                        ->orderBy('process')
                        ->pluck('process', 'process')
                        ->all())
                    ->searchable(),

                SelectFilter::make('status')
                    ->label('Status')
                    ->options([
                        'active' => 'Aktif',
                        'archived' => 'Arsip',
                    ]),
            ])
            ->filtersLayout(\Filament\Tables\Enums\FiltersLayout::AboveContent)
            ->recordUrl(null)
            ->recordActions([
                EditAction::make()->label('Ubah'),
            ])
            ->toolbarActions([
                BulkActionGroup::make([
                    DeleteBulkAction::make(),
                ]),
            ]);
    }
}
