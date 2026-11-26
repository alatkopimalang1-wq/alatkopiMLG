<?php

namespace App\Filament\Resources\EquipmentBundles\Schemas;

use App\Models\Category;
use App\Models\EquipmentBundle;
use App\Models\Product;
use App\Models\ProductVariant;
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

class EquipmentBundleForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->columns(1)
            ->components([
                Section::make('Informasi Paket Bundling')
                    ->description('Atur nama, banner, dan status paket custom bundling alat kopi.')
                    ->columnSpanFull()
                    ->schema([
                        Grid::make(2)->schema([
                            TextInput::make('name')
                                ->label('Nama Paket Bundling')
                                ->placeholder('e.g. Custom Paket Usaha Kedai Kopi Standar')
                                ->live(onBlur: true)
                                ->afterStateUpdated(function ($state, callable $set, $record) {
                                    if (! $record && filled($state)) {
                                        $set('slug', EquipmentBundle::generateUniqueSlug((string) $state));
                                    }
                                })
                                ->required(),

                            TextInput::make('slug')
                                ->label('Slug URL')
                                ->placeholder('custom-paket-usaha-kedai-kopi-standar')
                                ->unique(ignoreRecord: true)
                                ->required(),
                        ]),

                        Grid::make(3)->schema([
                            Toggle::make('is_active')
                                ->label('Aktifkan Paket di Website')
                                ->default(true)
                                ->inline(false),

                            TextInput::make('sort_order')
                                ->label('Urutan Tampil')
                                ->numeric()
                                ->default(0),
                        ]),

                        Textarea::make('description')
                            ->label('Deskripsi Paket (Opsional)')
                            ->rows(2)
                            ->placeholder('Keterangan singkat paket usaha / bundling...'),

                        FileUpload::make('banner_image')
                            ->label('Banner Paket Bundling')
                            ->disk('public')
                            ->directory('bundles')
                            ->image()
                            ->imageEditor()
                            ->maxSize(5120),
                    ]),

                Section::make('Konfigurasi Slot Produk Bundling')
                    ->description('Tambahkan slot pilihan produk (contoh: Mesin Espresso, Grinder, Aksesoris) atau slot bonus GRATIS.')
                    ->columnSpanFull()
                    ->schema([
                        Repeater::make('slots')
                            ->relationship('slots')
                            ->label('Daftar Slot')
                            ->orderColumn('sort_order')
                            ->minItems(1)
                            ->defaultItems(1)
                            ->collapsible()
                            ->itemLabel(fn (array $state): ?string => ($state['title'] ?? 'Slot Baru')
                                .' — '.(($state['slot_type'] ?? 'selectable') === 'free' ? 'GRATIS (Bonus)' : 'Pilihan Pelanggan')
                                .(! empty($state['is_optional']) ? ' [OPTIONAL]' : ''))
                            ->schema([
                                Grid::make(3)->schema([
                                    TextInput::make('title')
                                        ->label('Nama Slot')
                                        ->placeholder('e.g. Pilih Mesin Espresso / Bonus Tamper')
                                        ->required()
                                        ->columnSpan(2),

                                    Select::make('slot_type')
                                        ->label('Tipe Slot')
                                        ->options([
                                            'selectable' => 'Pilihan Pelanggan (+)',
                                            'free' => 'Produk Gratis / Bonus Tetap',
                                        ])
                                        ->default('selectable')
                                        ->live()
                                        ->required(),

                                    Hidden::make('quantity')->default(1),
                                ]),

                                Grid::make(2)->schema([
                                    Select::make('category_ids')
                                        ->label('Pilih Kategori Produk')
                                        ->multiple()
                                        ->options(fn (): array => Category::query()
                                            ->orderBy('sort_order')
                                            ->get()
                                            ->mapWithKeys(function (Category $c) {
                                                $name = $c->name;
                                                if (is_array($name)) {
                                                    $name = $name[app()->getLocale()] ?? $name['id'] ?? $name['en'] ?? reset($name) ?? '';
                                                }

                                                return [$c->id => (string) $name];
                                            })
                                            ->all())
                                        ->searchable()
                                        ->preload()
                                        ->afterStateHydrated(function (Select $component, $state, $record): void {
                                            if (empty($state) && $record?->category_id) {
                                                $component->state([$record->category_id]);
                                            }
                                        })
                                        ->visible(fn (callable $get): bool => ($get('slot_type') ?? 'selectable') === 'selectable')
                                        ->required(fn (callable $get): bool => ($get('slot_type') ?? 'selectable') === 'selectable')
                                        ->helperText('Bisa pilih lebih dari 1 kategori. Semua produk dalam kategori terpilih otomatis menjadi pilihan slot dengan mengikuti harga masing-masing produk.'),

                                    TextInput::make('discount_percent')
                                        ->label('Diskon Bundling Kategori (%)')
                                        ->numeric()
                                        ->minValue(0)
                                        ->maxValue(100)
                                        ->default(0)
                                        ->suffix('%')
                                        ->visible(fn (callable $get): bool => ($get('slot_type') ?? 'selectable') === 'selectable')
                                        ->helperText('Potongan persen otomatis dari harga normal produk di kategori ini.'),
                                ]),

                                Toggle::make('is_optional')
                                    ->label('Opsional (Tampilkan pita OPTIONAL, pelanggan boleh tidak memilih)')
                                    ->visible(fn (callable $get): bool => ($get('slot_type') ?? 'selectable') === 'selectable')
                                    ->default(false),

                                Repeater::make('items')
                                    ->relationship('items')
                                    ->label('Produk Gratis / Bonus Tetap')
                                    ->orderColumn('sort_order')
                                    ->visible(fn (callable $get): bool => ($get('slot_type') ?? 'selectable') === 'free')
                                    ->minItems(fn (callable $get): int => ($get('slot_type') ?? 'selectable') === 'free' ? 1 : 0)
                                    ->maxItems(1)
                                    ->defaultItems(1)
                                    ->helperText('Pilih produk bonus yang otomatis berstatus GRATIS (Rp 0) pada paket ini.')
                                    ->schema([
                                        Grid::make(3)->schema([
                                            Select::make('product_id')
                                                ->label('Produk Alat Kopi')
                                                ->options(fn (): array => Product::query()
                                                    ->where('series', 'alat-kopi')
                                                    ->orderBy('name')
                                                    ->pluck('name', 'id')
                                                    ->all())
                                                ->searchable()
                                                ->preload()
                                                ->live()
                                                ->afterStateUpdated(function ($state, callable $set, callable $get) {
                                                    if (! $state) {
                                                        $set('product_variant_id', null);

                                                        return;
                                                    }
                                                    $variants = ProductVariant::where('product_id', $state)->get();
                                                    if ($variants->count() === 1) {
                                                        $first = $variants->first();
                                                        $set('product_variant_id', $first->id);
                                                        $isFree = ($get('../../slot_type') ?? 'selectable') === 'free';
                                                        $set('bundle_price', $isFree ? 0 : (float) $first->price);
                                                    } else {
                                                        $set('product_variant_id', null);
                                                    }
                                                })
                                                ->required(),

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
                                                            $v->id => "{$v->label} (Rp ".number_format((float) $v->price, 0, ',', '.').')',
                                                        ])
                                                        ->all();
                                                })
                                                ->live()
                                                ->afterStateUpdated(function ($state, callable $set, callable $get) {
                                                    if (! $state) {
                                                        return;
                                                    }
                                                    $variant = ProductVariant::find($state);
                                                    if ($variant) {
                                                        $isFree = ($get('../../slot_type') ?? 'selectable') === 'free';
                                                        $set('bundle_price', $isFree ? 0 : (float) $variant->price);
                                                    }
                                                })
                                                ->required(),

                                            TextInput::make('bundle_price')
                                                ->label('Harga Bundling (Rp)')
                                                ->numeric()
                                                ->prefix('Rp')
                                                ->minValue(0)
                                                ->default(fn (callable $get): int => ($get('../../slot_type') ?? 'selectable') === 'free' ? 0 : 0)
                                                ->helperText('Isi 0 jika gratis, atau isi harga promo bundling.'),
                                        ]),
                                    ])
                                    ->addActionLabel('+ Tambah Pilihan Produk')
                                    ->columnSpanFull(),
                            ])
                            ->addActionLabel('+ Tambah Slot Bundling')
                            ->columnSpanFull(),
                    ]),
            ]);
    }
}
