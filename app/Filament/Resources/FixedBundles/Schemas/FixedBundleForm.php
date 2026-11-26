<?php

namespace App\Filament\Resources\FixedBundles\Schemas;

use App\Models\FixedBundle;
use App\Models\Product;
use App\Models\ProductVariant;
use Filament\Forms\Components\FileUpload;
use Filament\Forms\Components\Repeater;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Schemas\Components\Grid;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;

class FixedBundleForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema->components([
            Section::make('Informasi Produk Bundling Tetap')
                ->description('Produk dalam bundling ini langsung dipilih oleh admin dan diskon diterapkan ke seluruh paket.')
                ->schema([
                    Grid::make(2)->schema([
                        TextInput::make('name')
                            ->label('Nama Produk Bundling')
                            ->required()
                            ->maxLength(255)
                            ->live(onBlur: true)
                            ->afterStateUpdated(function (?string $state, callable $set, callable $get): void {
                                if (blank($get('slug')) && filled($state)) {
                                    $set('slug', FixedBundle::generateUniqueSlug($state));
                                }
                            }),

                        TextInput::make('slug')
                            ->label('Slug URL')
                            ->required()
                            ->maxLength(255)
                            ->unique(FixedBundle::class, 'slug', ignoreRecord: true),
                    ]),

                    Grid::make(3)->schema([
                        TextInput::make('discount_percent')
                            ->label('Diskon Keseluruhan (%)')
                            ->numeric()
                            ->minValue(0)
                            ->maxValue(100)
                            ->default(0)
                            ->suffix('%')
                            ->required()
                            ->helperText('Potongan persen langsung diterapkan ke seluruh produk di paket ini.'),

                        TextInput::make('sort_order')
                            ->label('Urutan Tampil')
                            ->numeric()
                            ->default(0),

                        Toggle::make('is_active')
                            ->label('Aktif di Website')
                            ->default(true)
                            ->inline(false),
                    ]),

                    Textarea::make('description')
                        ->label('Deskripsi Paket')
                        ->rows(3)
                        ->columnSpanFull(),

                    FileUpload::make('banner_image')
                        ->label('Foto Produk Bundling')
                        ->image()
                        ->imageEditor()
                        ->disk('public')
                        ->directory('bundles/fixed')
                        ->visibility('public')
                        ->columnSpanFull(),
                ]),

            Section::make('Daftar Produk dalam Bundling')
                ->description('Pilih produk dan varian yang termasuk dalam paket bundling tetap ini.')
                ->schema([
                    Repeater::make('items')
                        ->relationship('items')
                        ->label('Produk Paket')
                        ->orderColumn('sort_order')
                        ->minItems(1)
                        ->defaultItems(1)
                        ->addActionLabel('Tambah Produk ke Bundling')
                        ->itemLabel(fn (array $state): ?string => ! empty($state['product_id'])
                            ? (Product::find($state['product_id'])?->name ?? 'Produk')
                            : 'Produk Baru')
                        ->schema([
                            Grid::make(3)->schema([
                                Select::make('product_id')
                                    ->label('Produk')
                                    ->options(fn (): array => Product::query()
                                        ->active()
                                        ->orderBy('name')
                                        ->pluck('name', 'id')
                                        ->all())
                                    ->searchable()
                                    ->preload()
                                    ->required()
                                    ->live()
                                    ->afterStateUpdated(function ($state, callable $set): void {
                                        if ($state) {
                                            $firstVar = ProductVariant::where('product_id', $state)->first();
                                            $set('product_variant_id', $firstVar?->id);
                                        } else {
                                            $set('product_variant_id', null);
                                        }
                                    }),

                                Select::make('product_variant_id')
                                    ->label('Varian Produk')
                                    ->options(function (callable $get): array {
                                        $pid = $get('product_id');
                                        if (! $pid) {
                                            return [];
                                        }

                                        return ProductVariant::where('product_id', $pid)
                                            ->get()
                                            ->mapWithKeys(fn (ProductVariant $v) => [
                                                $v->id => "{$v->label} (Rp ".number_format((float) $v->price, 0, ',', '.').' · Stok: '.($v->stock ?? 0).')',
                                            ])
                                            ->all();
                                    })
                                    ->required()
                                    ->live(),

                                TextInput::make('quantity')
                                    ->label('Qty')
                                    ->numeric()
                                    ->minValue(1)
                                    ->default(1)
                                    ->required(),
                            ]),
                        ])
                        ->columnSpanFull(),
                ]),
        ]);
    }
}
