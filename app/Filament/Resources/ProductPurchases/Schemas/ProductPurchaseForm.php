<?php

namespace App\Filament\Resources\ProductPurchases\Schemas;

use App\Models\Product;
use App\Models\ProductPurchase;
use App\Models\ProductVariant;
use Filament\Forms\Components\DatePicker;
use Filament\Forms\Components\Hidden;
use Filament\Forms\Components\Repeater;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Schemas\Components\Grid;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;

class ProductPurchaseForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->columns(1)
            ->components([
                Section::make('Informasi Pembelian Produk')
                    ->description('Catat pembelian stok masuk untuk produk Alat Kopi. Stok varian & produk akan otomatis bertambah saat pembelian disimpan.')
                    ->columnSpanFull()
                    ->schema([
                        Grid::make(3)->schema([
                            TextInput::make('purchase_number')
                                ->label('Nomor Pembelian')
                                ->default(fn (): string => ProductPurchase::generatePurchaseNumber())
                                ->readOnly()
                                ->required(),
                            DatePicker::make('purchase_date')
                                ->label('Tanggal Pembelian')
                                ->default(now())
                                ->required(),
                            TextInput::make('supplier_name')
                                ->label('Nama Supplier / Distributor (Opsional)')
                                ->placeholder('e.g. PT Sukses Jaya / Distributor Hario'),
                        ]),
                        Textarea::make('notes')
                            ->label('Catatan Pembelian (Opsional)')
                            ->rows(2)
                            ->placeholder('Catatan nomor faktur supplier atau keterangan tambahan...'),
                    ]),

                Section::make('Daftar Produk Alat Kopi yang Dibeli')
                    ->columnSpanFull()
                    ->schema([
                        Repeater::make('items')
                            ->relationship('items')
                            ->label('Item Pembelian')
                            ->minItems(1)
                            ->defaultItems(1)
                            ->reorderable(false)
                            ->itemLabel(function (array $state): ?string {
                                $productName = ! empty($state['product_id'])
                                    ? (Product::find($state['product_id'])?->name ?? 'Produk')
                                    : 'Pilih Produk Alat Kopi';
                                $qty = (int) ($state['quantity'] ?? 0);

                                return "{$productName} — Qty: {$qty} pcs";
                            })
                            ->schema([
                                Grid::make(4)->schema([
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
                                        ->afterStateUpdated(function ($state, callable $set) {
                                            if (! $state) {
                                                $set('product_variant_id', null);
                                                $set('unit_cost', 0);

                                                return;
                                            }
                                            $variants = ProductVariant::where('product_id', $state)->get();
                                            if ($variants->count() === 1) {
                                                $first = $variants->first();
                                                $set('product_variant_id', $first->id);
                                                $set('unit_cost', (float) ($first->cost_price ?? 0));
                                            } else {
                                                $set('product_variant_id', null);
                                                $set('unit_cost', 0);
                                            }
                                        })
                                        ->required()
                                        ->columnSpan(2),

                                    Select::make('product_variant_id')
                                        ->label('Varian / Stok Saat Ini')
                                        ->options(function (callable $get): array {
                                            $productId = $get('product_id');
                                            if (! $productId) {
                                                return [];
                                            }

                                            return ProductVariant::where('product_id', $productId)
                                                ->get()
                                                ->mapWithKeys(fn (ProductVariant $v) => [
                                                    $v->id => "{$v->label} (Stok: ".((int) ($v->stock ?? 0)).' pcs)',
                                                ])
                                                ->all();
                                        })
                                        ->live()
                                        ->afterStateUpdated(function ($state, callable $set) {
                                            if (! $state) {
                                                return;
                                            }
                                            $variant = ProductVariant::find($state);
                                            if ($variant && $variant->cost_price !== null) {
                                                $set('unit_cost', (float) $variant->cost_price);
                                            }
                                        })
                                        ->required()
                                        ->columnSpan(2),
                                ]),

                                Grid::make(3)->schema([
                                    TextInput::make('quantity')
                                        ->label('Jumlah Tambah Qty (Pcs)')
                                        ->numeric()
                                        ->minValue(1)
                                        ->default(1)
                                        ->live(onBlur: true)
                                        ->afterStateUpdated(function ($state, callable $get, callable $set) {
                                            $qty = max(0, (int) $state);
                                            $cost = max(0, (float) ($get('unit_cost') ?? 0));
                                            $set('subtotal', $qty * $cost);
                                        })
                                        ->required(),

                                    TextInput::make('unit_cost')
                                        ->label('Harga Beli / HPP Satuan (Rp)')
                                        ->numeric()
                                        ->prefix('Rp')
                                        ->default(0)
                                        ->live(onBlur: true)
                                        ->afterStateUpdated(function ($state, callable $get, callable $set) {
                                            $qty = max(0, (int) ($get('quantity') ?? 0));
                                            $cost = max(0, (float) $state);
                                            $set('subtotal', $qty * $cost);
                                        }),

                                    TextInput::make('subtotal')
                                        ->label('Subtotal Pembelian (Rp)')
                                        ->numeric()
                                        ->prefix('Rp')
                                        ->readOnly()
                                        ->default(0),
                                ]),
                            ])
                            ->addActionLabel('+ Tambah Produk Dibeli')
                            ->columnSpanFull(),

                        Hidden::make('total_qty')->default(0),
                        Hidden::make('total_amount')->default(0),
                    ]),
            ]);
    }
}
