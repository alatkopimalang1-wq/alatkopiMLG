<?php

namespace App\Filament\Resources\EquipmentProducts\Schemas;

use App\Models\Category;
use App\Models\Product;
use Filament\Forms\Components\DateTimePicker;
use Filament\Forms\Components\FileUpload;
use Filament\Forms\Components\Hidden;
use Filament\Forms\Components\Repeater;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TagsInput;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Schemas\Components\Grid;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;
use Illuminate\Support\Str;

class EquipmentProductForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->columns(1)
            ->components([
                Hidden::make('series')
                    ->default('alat-kopi'),
                Hidden::make('freshness_days')
                    ->default(365),

                Section::make('Informasi Alat Kopi')
                    ->columnSpanFull()
                    ->schema([
                        Grid::make(2)->schema([
                            TextInput::make('name')
                                ->label('Nama Produk Alat Kopi')
                                ->placeholder('e.g. Timemore Chestnut C3 Manual Grinder')
                                ->live(onBlur: true)
                                ->afterStateUpdated(function (?string $state, callable $set, callable $get) {
                                    if (empty($get('slug')) && ! empty($state)) {
                                        $baseSlug = Str::slug($state);
                                        $slug = $baseSlug;
                                        $counter = 1;
                                        while (Product::where('slug', $slug)->exists()) {
                                            $slug = "{$baseSlug}-{$counter}";
                                            $counter++;
                                        }
                                        $set('slug', $slug);
                                    }
                                })
                                ->required(),
                            TextInput::make('slug')
                                ->label('Slug URL')
                                ->placeholder('timemore-chestnut-c3-manual-grinder')
                                ->required(),
                        ]),
                        Grid::make(3)->schema([
                            Select::make('status')
                                ->label('Status')
                                ->options([
                                    'active' => 'Aktif (Ditampilkan)',
                                    'archived' => 'Arsip (Disembunyikan)',
                                ])
                                ->required()
                                ->default('active'),
                            Select::make('channel')
                                ->label('Saluran Penjualan')
                                ->options([
                                    'all' => 'Website & POS Kasir',
                                    'web' => 'Website Saja',
                                    'pos' => 'POS Saja',
                                ])
                                ->required()
                                ->default('all'),
                            TextInput::make('stock')
                                ->label('Stok Total (Pcs)')
                                ->numeric()
                                ->default(20)
                                ->required()
                                ->live()
                                ->readOnly(fn (callable $get) => ! empty($get('variants')))
                                ->helperText('Otomatis dihitung dari total stok varian di bawah.'),
                        ]),
                        Grid::make(2)->schema([
                            Select::make('categories')
                                ->label('Kategori')
                                ->relationship('categories', 'slug')
                                ->multiple()
                                ->preload()
                                ->default(function () {
                                    $cat = Category::where('slug', 'alat-kopi')->first();

                                    return $cat ? [$cat->id] : [];
                                }),
                            DateTimePicker::make('released_at')
                                ->label('Tanggal Rilis')
                                ->default(now()),
                        ]),
                        Grid::make(2)->schema([
                            Toggle::make('is_featured')
                                ->label('Produk Unggulan (Best Seller)'),
                            Toggle::make('is_new')
                                ->label('Tandai Sebagai Baru (New Arrival)'),
                        ]),
                    ]),

                Section::make('Spesifikasi Alat Kopi')
                    ->columnSpanFull()
                    ->schema([
                        Grid::make(2)->schema([
                            TextInput::make('origin')
                                ->label('Merek / Brand')
                                ->placeholder('e.g. Hario, Timemore, Fellow, One Two Cups'),
                            TextInput::make('process')
                                ->label('Tipe / Jenis Alat')
                                ->placeholder('e.g. Manual Grinder, Pour Over Dripper, Digital Scale'),
                        ]),
                        Grid::make(2)->schema([
                            TextInput::make('varietal')
                                ->label('Material / Bahan')
                                ->placeholder('e.g. Stainless Steel 304, Keramik Porselen, Aluminium CNC'),
                            TextInput::make('altitude')
                                ->label('Kapasitas / Dimensi')
                                ->placeholder('e.g. 600ml / Size 02 (1-4 Cup) / Maks 2000g'),
                        ]),
                        TagsInput::make('brew_methods')
                            ->label('Cocok Untuk Metode Seduh')
                            ->placeholder('Ketik metode lalu tekan enter (e.g. V60, Espresso, Pour Over)'),
                    ]),

                Section::make('Harga & Tautan Marketplace')
                    ->columnSpanFull()
                    ->schema([
                        Grid::make(2)->schema([
                            TextInput::make('min_price')
                                ->label('Harga Minimum (Rp)')
                                ->helperText('Otomatis disinkronkan dari harga varian termurah saat disimpan.')
                                ->required()
                                ->numeric()
                                ->default(0)
                                ->prefix('Rp'),
                            TextInput::make('max_price')
                                ->label('Harga Maksimum (Rp)')
                                ->helperText('Otomatis disinkronkan dari harga varian termahal saat disimpan.')
                                ->required()
                                ->numeric()
                                ->default(0)
                                ->prefix('Rp'),
                        ]),
                        Grid::make(2)->schema([
                            TextInput::make('tokopedia_url')
                                ->label('Link Tokopedia (Opsional)')
                                ->url(),
                            TextInput::make('shopee_url')
                                ->label('Link Shopee (Opsional)')
                                ->url(),
                        ]),
                    ]),

                Section::make('Varian Produk (Warna / Ukuran / Tipe)')
                    ->columnSpanFull()
                    ->description('Tambahkan varian alat kopi seperti warna, kapasitas, atau tipe beserta harga jual, HPP, dan stoknya.')
                    ->schema([
                        Repeater::make('variants')
                            ->relationship('variants')
                            ->live()
                            ->afterStateUpdated(function (callable $get, callable $set) {
                                $variants = $get('variants') ?? [];
                                if (is_array($variants)) {
                                    $total = 0;
                                    foreach ($variants as $v) {
                                        $total += (int) ($v['stock'] ?? 0);
                                    }
                                    $set('stock', $total);
                                }
                            })
                            ->itemLabel(fn (array $state): ?string => ($state['label'] ?? 'Varian')
                                .(! empty($state['price']) ? ' — Jual: Rp '.number_format((float) $state['price'], 0, ',', '.') : '')
                                .(' | Stok: '.((int) ($state['stock'] ?? 0)).' pcs'))
                            ->collapsible()
                            ->reorderable(false)
                            ->schema([
                                Grid::make(2)->schema([
                                    TextInput::make('label')
                                        ->label('Nama Varian (Warna / Ukuran / Model)')
                                        ->placeholder('e.g. Matte Black, Size 02 (Putih), 600ml')
                                        ->required(),
                                    TextInput::make('weight_grams')
                                        ->label('Berat Pengiriman (Gram)')
                                        ->numeric()
                                        ->default(500)
                                        ->required(),
                                ]),
                                Grid::make(3)->schema([
                                    TextInput::make('cost_price')
                                        ->label('Harga Modal / HPP (Rp)')
                                        ->numeric()
                                        ->prefix('Rp'),
                                    TextInput::make('price')
                                        ->label('Harga Jual (Rp)')
                                        ->numeric()
                                        ->prefix('Rp')
                                        ->required(),
                                    TextInput::make('original_price')
                                        ->label('Harga Coret / Promo (Rp)')
                                        ->numeric()
                                        ->prefix('Rp'),
                                ]),
                                Grid::make(2)->schema([
                                    Grid::make(1)->schema([
                                        TextInput::make('stock')
                                            ->label('Stok Varian (Pcs)')
                                            ->numeric()
                                            ->default(20)
                                            ->required()
                                            ->live(onBlur: true)
                                            ->afterStateUpdated(function ($state, callable $get, callable $set) {
                                                $variants = $get('../../variants');
                                                if (is_array($variants)) {
                                                    $total = 0;
                                                    foreach ($variants as $v) {
                                                        $total += (int) ($v['stock'] ?? 0);
                                                    }
                                                    $set('../../stock', $total);
                                                }
                                            }),
                                        TextInput::make('sku')
                                            ->label('SKU (Opsional)')
                                            ->placeholder('e.g. AKM-TM-C3-BLK'),
                                    ])->columnSpan(1),
                                    FileUpload::make('image')
                                        ->label('Foto Varian (Opsional)')
                                        ->disk('public')
                                        ->directory('products/variants')
                                        ->image()
                                        ->imageEditor()
                                        ->imageResizeMode('contain')
                                        ->imageResizeTargetWidth('1200')
                                        ->imageResizeTargetHeight('1200')
                                        ->imageResizeUpscale(false)
                                        ->maxSize(5120)
                                        ->columnSpan(1),
                                ]),
                            ])
                            ->defaultItems(1)
                            ->columnSpanFull(),
                    ]),

                Section::make('Galeri Foto Alat Kopi')
                    ->columnSpanFull()
                    ->schema([
                        Repeater::make('images')
                            ->relationship('images')
                            ->schema([
                                Grid::make(2)->schema([
                                    FileUpload::make('path')
                                        ->label('Foto Produk')
                                        ->disk('public')
                                        ->directory('products/gallery')
                                        ->image()
                                        ->imageEditor()
                                        ->imageResizeMode('contain')
                                        ->imageResizeTargetWidth('1200')
                                        ->imageResizeTargetHeight('1200')
                                        ->imageResizeUpscale(false)
                                        ->maxSize(5120)
                                        ->required()
                                        ->columnSpan(1),
                                    Grid::make(1)->schema([
                                        TextInput::make('alt')
                                            ->label('Alt Text')
                                            ->placeholder('Deskripsi foto alat kopi'),
                                        Toggle::make('is_primary')
                                            ->label('Foto Utama (Primary)'),
                                    ])->columnSpan(1),
                                ]),
                            ])
                            ->defaultItems(0)
                            ->orderColumn('sort_order')
                            ->columnSpanFull(),
                    ]),

                Section::make('Deskripsi Produk')
                    ->columnSpanFull()
                    ->schema([
                        TextInput::make('short_description')
                            ->label('Ringkasan Singkat')
                            ->columnSpanFull(),
                        Grid::make(2)->schema([
                            Textarea::make('tagline.id')
                                ->label('Tagline (Indonesia)')
                                ->rows(2),
                            Textarea::make('tagline.en')
                                ->label('Tagline (English)')
                                ->rows(2),
                        ]),
                        Grid::make(2)->schema([
                            Textarea::make('description.id')
                                ->label('Deskripsi Lengkap (Indonesia)')
                                ->rows(4),
                            Textarea::make('description.en')
                                ->label('Deskripsi Lengkap (English)')
                                ->rows(4),
                        ]),
                    ]),
            ]);
    }
}
