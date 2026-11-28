<?php

namespace App\Filament\Resources\EquipmentProducts\Schemas;

use App\Filament\Pages\ManageEquipmentBrands;
use App\Models\Category;
use App\Models\Product;
use Filament\Forms\Components\DateTimePicker;
use Filament\Forms\Components\FileUpload;
use Filament\Forms\Components\Hidden;
use Filament\Forms\Components\Repeater;
use Filament\Forms\Components\Select;
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
                        Grid::make(2)->schema([
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
                        ]),
                        Grid::make(2)->schema([
                            Select::make('origin')
                                ->label('Merek / Brand')
                                ->options(fn (?Product $record): array => ManageEquipmentBrands::getBrandOptions($record?->origin))
                                ->searchable()
                                ->placeholder('Pilih merek alat kopi')
                                ->helperText('Kelola daftar merek di menu Katalog & Toko > Merek / Brand Alat Kopi.'),
                            Select::make('categories')
                                ->label('Kategori')
                                ->relationship('categories', 'slug')
                                ->getOptionLabelFromRecordUsing(fn (Category $record): string => is_array($record->name)
                                    ? (string) ($record->name['id'] ?? $record->name['en'] ?? (reset($record->name) ?: $record->slug ?: 'Kategori'))
                                    : (string) ($record->name ?: $record->slug ?: 'Kategori'))
                                ->multiple()
                                ->preload()
                                ->default(function () {
                                    $cat = Category::where('slug', 'alat-kopi')->first();

                                    return $cat ? [$cat->id] : [];
                                }),
                        ]),
                        Grid::make(2)->schema([
                            DateTimePicker::make('released_at')
                                ->label('Tanggal Rilis')
                                ->default(now()),
                            Select::make('warranty')
                                ->label('Garansi')
                                ->options([
                                    'Tidak ada' => 'Tidak ada',
                                    '1 minggu' => '1 minggu',
                                    '6 Bulan' => '6 Bulan',
                                    '1 Tahun' => '1 Tahun',
                                ])
                                ->default('Tidak ada')
                                ->native(false),
                        ]),
                        Grid::make(4)->schema([
                            Toggle::make('is_featured')
                                ->label('Produk Unggulan'),
                            Toggle::make('is_new')
                                ->label('Tandai Baru'),
                            Toggle::make('is_preorder')
                                ->label('Pre-Order')
                                ->live(),
                            Toggle::make('is_consignment')
                                ->label('Titip Jual (Konsinyasi)')
                                ->live(),
                        ]),
                        Section::make('Pengaturan Bagi Hasil Konsinyasi')
                            ->description('Atur mitra penitip barang dan skema bagi hasil/komisi penjualan.')
                            ->visible(fn (callable $get): bool => (bool) $get('is_consignment'))
                            ->schema([
                                Grid::make(3)->schema([
                                    Select::make('consignor_id')
                                        ->label('Mitra Penitip (Konsinyor)')
                                        ->relationship('consignor', 'name')
                                        ->searchable()
                                        ->preload()
                                        ->required(fn (callable $get): bool => (bool) $get('is_consignment'))
                                        ->live()
                                        ->afterStateUpdated(function (?int $state, callable $set) {
                                            if ($state) {
                                                $consignor = \App\Models\Consignor::find($state);
                                                if ($consignor) {
                                                    $set('consignment_commission_type', $consignor->default_commission_type ?: 'percentage');
                                                    $set('consignment_commission_rate', $consignor->default_commission_rate ?: 20.00);
                                                }
                                            }
                                        })
                                        ->createOptionForm([
                                            TextInput::make('name')->label('Nama Mitra / Brand')->required(),
                                            TextInput::make('phone')->label('No. WhatsApp / HP'),
                                            TextInput::make('bank_name')->label('Nama Bank (e.g. BCA)'),
                                            TextInput::make('bank_account_number')->label('Nomor Rekening'),
                                            TextInput::make('bank_account_holder')->label('Atas Nama Rekening'),
                                            TextInput::make('default_commission_rate')->label('Komisi Toko Bawaan (%)')->numeric()->default(20),
                                        ]),

                                    Select::make('consignment_commission_type')
                                        ->label('Metode Perhitungan')
                                        ->options([
                                            'percentage' => 'Persentase Komisi Toko (%)',
                                            'fixed_cost' => 'Harga Setor Bersih Vendor (Net Price)',
                                        ])
                                        ->default('percentage')
                                        ->native(false)
                                        ->live(),

                                    TextInput::make('consignment_commission_rate')
                                        ->label('Komisi Toko (%)')
                                        ->numeric()
                                        ->default(20.00)
                                        ->suffix('%')
                                        ->visible(fn (callable $get): bool => ($get('consignment_commission_type') ?? 'percentage') === 'percentage')
                                        ->helperText('Contoh: 20% komisi toko, 80% hak vendor.'),

                                    TextInput::make('consignment_payout_price')
                                        ->label('Hak Bersih Vendor (Rp)')
                                        ->numeric()
                                        ->prefix('Rp')
                                        ->visible(fn (callable $get): bool => $get('consignment_commission_type') === 'fixed_cost')
                                        ->helperText('Nominal yang wajib dibayarkan ke vendor per unit.'),
                                ]),
                            ]),
                        Select::make('preorder_dp_percent')
                            ->label('Minimum Down Payment (DP) Pre-Order')
                            ->options([
                                30 => 'Minimal DP 30%',
                                50 => 'Minimal DP 50%',
                                70 => 'Minimal DP 70%',
                                100 => '100% (Wajib Lunas)',
                            ])
                            ->default(30)
                            ->native(false)
                            ->disabled()
                            ->dehydrated(false)
                            ->visible(fn (callable $get): bool => (bool) $get('is_preorder'))
                            ->helperText('Otomatis diterapkan berdasarkan harga produk: < Rp 30 jt (30%), Rp 30,1 - 50 jt (50%), > Rp 50 jt (70%).'),
                    ]),

                Section::make('Harga, Stok & Varian Produk')
                    ->columnSpanFull()
                    ->schema([
                        Toggle::make('has_variants')
                            ->label('Produk ini memiliki varian (Warna / Ukuran / Model)')
                            ->helperText('Aktifkan jika alat kopi memiliki lebih dari satu varian warna/ukuran. Biarkan nonaktif untuk produk tunggal.')
                            ->live()
                            ->dehydrated(false)
                            ->default(false),

                        // Single Product (tanpa varian) — tanpa Nama Varian & Foto Varian
                        Grid::make(1)
                            ->visible(fn (callable $get): bool => ! $get('has_variants'))
                            ->schema([
                                Grid::make(2)->schema([
                                    TextInput::make('single_weight_grams')
                                        ->label('Berat Pengiriman (Gram)')
                                        ->numeric()
                                        ->default(500)
                                        ->dehydrated(false)
                                        ->required(fn (callable $get): bool => ! $get('has_variants')),
                                ]),
                                Grid::make(3)->schema([
                                    TextInput::make('single_cost_price')
                                        ->label('Harga Modal / HPP (Rp)')
                                        ->numeric()
                                        ->dehydrated(false)
                                        ->prefix('Rp'),
                                    TextInput::make('min_price')
                                        ->label('Harga Jual (Rp)')
                                        ->numeric()
                                        ->prefix('Rp')
                                        ->required(fn (callable $get): bool => ! $get('has_variants')),
                                    TextInput::make('single_original_price')
                                        ->label('Harga Coret / Promo (Rp)')
                                        ->numeric()
                                        ->dehydrated(false)
                                        ->prefix('Rp'),
                                ]),
                                Grid::make(2)->schema([
                                    TextInput::make('stock')
                                        ->label('Stok (Pcs)')
                                        ->numeric()
                                        ->default(20)
                                        ->visible(fn (callable $get): bool => ! (bool) $get('is_preorder'))
                                        ->disabled(fn ($livewire): bool => $livewire instanceof \App\Filament\Resources\EquipmentProducts\Pages\EditEquipmentProduct)
                                        ->dehydrated(fn ($livewire, callable $get): bool => ! (bool) $get('is_preorder') && ! ($livewire instanceof \App\Filament\Resources\EquipmentProducts\Pages\EditEquipmentProduct))
                                        ->helperText(fn ($livewire): ?string => $livewire instanceof \App\Filament\Resources\EquipmentProducts\Pages\EditEquipmentProduct ? 'Penambahan qty/stok hanya dapat dilakukan melalui menu Pembelian Produk.' : null)
                                        ->required(fn ($livewire, callable $get): bool => ! (bool) $get('is_preorder') && ! ($livewire instanceof \App\Filament\Resources\EquipmentProducts\Pages\EditEquipmentProduct) && ! $get('has_variants')),
                                    Select::make('stock_status')
                                        ->label('Status Stok Pre-Order')
                                        ->options([
                                            'pre_order' => 'Tersedia (Pre-Order)',
                                            'out_of_stock' => 'Kosong (Habis)',
                                        ])
                                        ->default('pre_order')
                                        ->native(false)
                                        ->visible(fn (callable $get): bool => (bool) $get('is_preorder') && ! (bool) $get('has_variants'))
                                        ->dehydrated(fn (callable $get): bool => (bool) $get('is_preorder') && ! (bool) $get('has_variants'))
                                        ->required(fn (callable $get): bool => (bool) $get('is_preorder') && ! (bool) $get('has_variants')),
                                    TextInput::make('single_sku')
                                        ->label('SKU (Opsional)')
                                        ->placeholder('e.g. AKM-TM-C3-BLK')
                                        ->dehydrated(false),
                                ]),
                            ]),
                    ]),

                Section::make('Tautan Marketplace (Opsional)')
                    ->columnSpanFull()
                    ->schema([
                        Toggle::make('show_marketplace_links')
                            ->label('Aktifkan Tautan Marketplace di Halaman Produk')
                            ->default(true)
                            ->live()
                            ->inline(false)
                            ->helperText('Jika dimatikan, tombol Tokopedia & Shopee tidak akan tampil di halaman detail produk.'),

                        Grid::make(2)
                            ->visible(fn (callable $get): bool => (bool) ($get('show_marketplace_links') ?? true))
                            ->schema([
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
                    ->visible(fn (callable $get): bool => (bool) $get('has_variants'))
                    ->description('Tambahkan varian alat kopi seperti warna, kapasitas, atau tipe beserta harga jual, HPP, dan stoknya.')
                    ->schema([
                        Repeater::make('variants')
                            ->relationship('variants')
                            ->live()
                            ->afterStateUpdated(function (callable $get, callable $set) {
                                $variants = $get('variants') ?? [];
                                if (! empty($variants) && is_array($variants)) {
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
                                            ->default(fn ($livewire): int => $livewire instanceof \App\Filament\Resources\EquipmentProducts\Pages\EditEquipmentProduct ? 0 : 20)
                                            ->visible(fn (callable $get): bool => ! (bool) $get('../../is_preorder'))
                                            ->disabled(fn ($livewire): bool => $livewire instanceof \App\Filament\Resources\EquipmentProducts\Pages\EditEquipmentProduct)
                                            ->dehydrated(fn ($livewire, callable $get): bool => ! (bool) $get('../../is_preorder') && ! ($livewire instanceof \App\Filament\Resources\EquipmentProducts\Pages\EditEquipmentProduct))
                                            ->helperText(fn ($livewire): ?string => $livewire instanceof \App\Filament\Resources\EquipmentProducts\Pages\EditEquipmentProduct ? 'Penambahan qty/stok hanya dapat dilakukan melalui menu Pembelian Produk.' : null)
                                            ->required(fn ($livewire, callable $get): bool => ! (bool) $get('../../is_preorder') && ! ($livewire instanceof \App\Filament\Resources\EquipmentProducts\Pages\EditEquipmentProduct)),
                                        Select::make('stock_status')
                                            ->label('Status Stok Pre-Order')
                                            ->options([
                                                'pre_order' => 'Tersedia (Pre-Order)',
                                                'out_of_stock' => 'Kosong (Habis)',
                                            ])
                                            ->default('pre_order')
                                            ->native(false)
                                            ->visible(fn (callable $get): bool => (bool) $get('../../is_preorder'))
                                            ->dehydrated(fn (callable $get): bool => (bool) $get('../../is_preorder'))
                                            ->required(fn (callable $get): bool => (bool) $get('../../is_preorder')),
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
                            ->defaultItems(0)
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
                        Textarea::make('description.id')
                            ->label('Deskripsi Lengkap')
                            ->rows(8)
                            ->columnSpanFull(),
                    ]),
            ]);
    }
}
