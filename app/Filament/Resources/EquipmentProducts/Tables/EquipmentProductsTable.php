<?php

namespace App\Filament\Resources\EquipmentProducts\Tables;

use App\Filament\Resources\EquipmentProducts\EquipmentProductResource;
use App\Models\Product;
use Filament\Actions\Action;
use Filament\Actions\ActionGroup;
use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteAction;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Notifications\Notification;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Columns\ImageColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\HtmlString;
use Illuminate\Support\Str;

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
                        $specificCat = $record->categories
                            ->first(fn ($c) => $c->parent_id !== null && ! in_array($c->slug, ['alat-kopi', 'semua-alat-kopi'], true))
                            ?? $record->categories->first(fn ($c) => ! in_array($c->slug, ['alat-kopi', 'semua-alat-kopi'], true));

                        $catName = $specificCat?->name;
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
                            return new HtmlString('<div class="h-7 leading-7 text-sm text-gray-400">—</div>');
                        }

                        $lines = $variants->map(function ($v) {
                            $label = e((string) $v->label);

                            return "<div class=\"h-7 leading-7 text-sm text-gray-700 dark:text-gray-200 whitespace-nowrap\">{$label}</div>";
                        })->implode('');

                        return new HtmlString("<div class=\"space-y-1\">{$lines}</div>");
                    }),

                TextColumn::make('variants_sku')
                    ->label('SKU')
                    ->html()
                    ->state(function (Product $record): HtmlString {
                        $variants = $record->variants;
                        if ($variants->isEmpty()) {
                            return new HtmlString('<div class="h-7 leading-7 text-sm text-gray-400">—</div>');
                        }

                        $lines = $variants->map(function ($v) {
                            $sku = ! empty($v->sku) ? e((string) $v->sku) : '—';

                            return "<div class=\"h-7 leading-7 font-mono text-sm text-gray-600 dark:text-gray-300 whitespace-nowrap\">{$sku}</div>";
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

                                return new HtmlString("<div class=\"h-7 flex items-center\">{$badge}</div>");
                            }

                            $lines = $variants->map(function ($v) use ($record) {
                                $isOut = $record->stock_status === 'out_of_stock' || $v->stock_status === 'out_of_stock';

                                return $isOut
                                    ? '<div class="h-7 flex items-center"><span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-rose-600 text-white">Kosong (PO)</span></div>'
                                    : '<div class="h-7 flex items-center"><span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-emerald-600 text-white">Tersedia (PO)</span></div>';
                            })->implode('');

                            return new HtmlString("<div class=\"space-y-1\">{$lines}</div>");
                        }

                        if ($variants->isEmpty()) {
                            $qty = (int) ($record->stock ?? 0);
                            if ($qty <= 1) {
                                return new HtmlString("<div class=\"h-7 flex items-center\"><span class=\"inline-flex items-center justify-center min-w-[24px] px-2 py-0.5 rounded text-sm font-bold bg-amber-500 text-white\">{$qty}</span></div>");
                            }

                            return new HtmlString("<div class=\"h-7 leading-7 text-sm font-semibold text-gray-800 dark:text-gray-200\">{$qty}</div>");
                        }

                        $lines = $variants->map(function ($v) {
                            $qty = (int) ($v->stock ?? 0);
                            if ($qty <= 1) {
                                return "<div class=\"h-7 flex items-center\"><span class=\"inline-flex items-center justify-center min-w-[24px] px-2 py-0.5 rounded text-sm font-bold bg-amber-500 text-white\">{$qty}</span></div>";
                            }

                            return "<div class=\"h-7 leading-7 text-sm font-semibold text-gray-800 dark:text-gray-200\">{$qty}</div>";
                        })->implode('');

                        return new HtmlString("<div class=\"space-y-1\">{$lines}</div>");
                    }),

                TextColumn::make('variants_cost_price')
                    ->label('Harga Beli')
                    ->html()
                    ->state(function (Product $record): HtmlString {
                        $variants = $record->variants;
                        if ($variants->isEmpty()) {
                            return new HtmlString('<div class="h-7 leading-7 text-sm text-gray-400">0,00</div>');
                        }

                        $lines = $variants->map(function ($v) {
                            $cost = number_format((float) ($v->cost_price ?? 0), 2, ',', '.');

                            return "<div class=\"h-7 leading-7 text-sm text-gray-700 dark:text-gray-200 whitespace-nowrap\"><span class=\"border-b border-dashed border-gray-400/60 pb-0.5\">{$cost}</span></div>";
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

                            return new HtmlString("<div class=\"h-7 leading-7 text-sm font-semibold text-gray-800 dark:text-gray-200 whitespace-nowrap\"><span class=\"border-b border-dashed border-gray-400/60 pb-0.5\">{$price}</span></div>");
                        }

                        $lines = $variants->map(function ($v) {
                            $price = number_format((float) ($v->price ?? 0), 2, ',', '.');

                            return "<div class=\"h-7 leading-7 text-sm font-semibold text-gray-800 dark:text-gray-200 whitespace-nowrap\"><span class=\"border-b border-dashed border-gray-400/60 pb-0.5\">{$price}</span></div>";
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
                        'preorder' => 'Pre-Order',
                    ])
                    ->query(function (Builder $query, array $data): Builder {
                        $value = $data['value'] ?? null;
                        if ($value === 'preorder') {
                            return $query->where('is_preorder', true);
                        }
                        if (in_array($value, ['active', 'archived'], true)) {
                            return $query->where('status', $value);
                        }

                        return $query;
                    }),
            ])
            ->filtersLayout(\Filament\Tables\Enums\FiltersLayout::AboveContent)
            ->recordUrl(null)
            ->recordActions([
                ActionGroup::make([
                    Action::make('salin')
                        ->label('Salin')
                        ->icon(Heroicon::DocumentDuplicate)
                        ->requiresConfirmation()
                        ->modalHeading('Salin Produk?')
                        ->modalDescription('Produk beserta varian, kategori, dan foto akan disalin sebagai produk baru.')
                        ->action(function (Product $record) {
                            $copy = DB::transaction(function () use ($record) {
                                $record->load(['variants', 'categories', 'images']);

                                $baseName = $record->name.' (Salinan)';
                                $baseSlug = Str::slug($baseName);
                                $slug = $baseSlug;
                                $i = 1;
                                while (Product::where('slug', $slug)->exists()) {
                                    $slug = "{$baseSlug}-{$i}";
                                    $i++;
                                }

                                $copy = $record->replicate(['slug']);
                                $copy->name = $baseName;
                                $copy->slug = $slug;
                                $copy->stock = 0;
                                $copy->stock_status = $copy->is_preorder ? 'pre_order' : 'out_of_stock';
                                $copy->save();

                                $copy->categories()->sync($record->categories->pluck('id')->all());

                                foreach ($record->variants as $v) {
                                    $vCopy = $v->replicate();
                                    $vCopy->product_id = $copy->id;
                                    $vCopy->stock = 0;
                                    $vCopy->stock_status = $copy->is_preorder ? $v->stock_status : 'out_of_stock';
                                    if (! empty($v->sku)) {
                                        $vCopy->sku = $v->sku.'-COPY';
                                    }
                                    $vCopy->save();
                                }

                                foreach ($record->images as $img) {
                                    $imgCopy = $img->replicate();
                                    $imgCopy->product_id = $copy->id;
                                    $imgCopy->save();
                                }

                                return $copy;
                            });

                            Notification::make()
                                ->title('Produk Berhasil Disalin')
                                ->success()
                                ->send();

                            return redirect(EquipmentProductResource::getUrl('edit', ['record' => $copy]));
                        }),

                    Action::make('cek_web')
                        ->label('Cek produk di web')
                        ->icon(Heroicon::ArrowTopRightOnSquare)
                        ->url(fn (Product $record): string => route('shop.show', $record->slug), shouldOpenInNewTab: true),

                    EditAction::make()
                        ->label('Edit'),

                    DeleteAction::make()
                        ->label('Hapus'),
                ])
                    ->label('Kelola')
                    ->icon(Heroicon::ChevronDown)
                    ->button()
                    ->size('sm')
                    ->color('gray'),
            ])
            ->toolbarActions([
                BulkActionGroup::make([
                    DeleteBulkAction::make(),
                ]),
            ]);
    }
}
