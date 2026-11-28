<?php

namespace App\Filament\Resources\StockDocuments\Schemas;

use App\Models\ProductVariant;
use App\Models\StockDocument;
use Filament\Forms\Components\DatePicker;
use Filament\Forms\Components\Hidden;
use Filament\Forms\Components\Repeater;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Schemas\Components\Grid;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;

class StockDocumentForm
{
    public static function configure(Schema $schema): Schema
    {
        $defaultType = request()->query('type') === 'out' ? 'out' : 'in';

        return $schema
            ->components([
                Section::make('Informasi Dokumen')
                    ->schema([
                        Grid::make(3)->schema([
                            Hidden::make('type')
                                ->default($defaultType),

                            TextInput::make('document_number')
                                ->label('No. Dokumen')
                                ->default(fn () => StockDocument::generateNumber($defaultType))
                                ->disabled()
                                ->dehydrated(),

                            DatePicker::make('document_date')
                                ->label('Tanggal')
                                ->default(now()->toDateString())
                                ->required(),

                            TextInput::make('supplier_name')
                                ->label('Supplier')
                                ->placeholder('Nama supplier (opsional)')
                                ->visible(fn ($get) => ($get('type') ?? $defaultType) === 'in'),

                            TextInput::make('transfer_to')
                                ->label('Transfer ke')
                                ->placeholder('Tujuan transfer (opsional)')
                                ->visible(fn ($get) => ($get('type') ?? $defaultType) === 'out'),
                        ]),

                        Grid::make(2)->schema([
                            Select::make('reason')
                                ->label('Alasan Stok Keluar')
                                ->options([
                                    'Barang Rusak / Cacat' => 'Barang Rusak / Cacat',
                                    'Barang Hilang / Selisih' => 'Barang Hilang / Selisih',
                                    'Pemakaian Internal / Sample' => 'Pemakaian Internal / Sample',
                                    'Transfer Cabang / Gudang' => 'Transfer Cabang / Gudang',
                                    'Retur ke Supplier' => 'Retur ke Supplier',
                                    'Lainnya' => 'Lainnya',
                                ])
                                ->searchable()
                                ->visible(fn ($get) => ($get('type') ?? $defaultType) === 'out'),

                            Textarea::make('notes')
                                ->label('Catatan')
                                ->rows(2)
                                ->columnSpan(fn ($get) => ($get('type') ?? $defaultType) === 'in' ? 2 : 1),
                        ]),
                    ]),

                Section::make('Daftar Produk')
                    ->schema([
                        Repeater::make('items')
                            ->relationship('items')
                            ->label('')
                            ->addActionLabel('+ Tambah Produk')
                            ->defaultItems(1)
                            ->schema([
                                Grid::make(12)->schema([
                                    Select::make('product_variant_id')
                                        ->label('Produk & Varian')
                                        ->placeholder('Cari nama produk atau SKU...')
                                        ->searchable()
                                        ->required()
                                        ->getSearchResultsUsing(function (string $search): array {
                                            $term = '%' . trim($search) . '%';

                                            return ProductVariant::query()
                                                ->with('product:id,name')
                                                ->whereHas('product', fn ($q) => $q->where('series', 'alat-kopi'))
                                                ->where(function ($q) use ($term) {
                                                    $q->where('sku', 'like', $term)
                                                        ->orWhere('label', 'like', $term)
                                                        ->orWhereHas('product', fn ($pq) => $pq->where('name', 'like', $term));
                                                })
                                                ->orderBy('product_id')
                                                ->limit(30)
                                                ->get()
                                                ->mapWithKeys(fn (ProductVariant $v): array => [$v->id => static::formatVariantLabel($v)])
                                                ->all();
                                        })
                                        ->getOptionLabelUsing(function ($value): ?string {
                                            if (! $value) {
                                                return null;
                                            }
                                            $v = ProductVariant::with('product:id,name')->find((int) $value);

                                            return $v ? static::formatVariantLabel($v) : null;
                                        })
                                        ->afterStateUpdated(function ($state, callable $set, $get) use ($defaultType) {
                                            if (! $state) {
                                                return;
                                            }
                                            $v = ProductVariant::find((int) $state);
                                            if ($v) {
                                                $set('product_id', $v->product_id);
                                                if (($get('../../type') ?? $defaultType) === 'in' && (float) ($get('unit_cost') ?? 0) <= 0) {
                                                    $set('unit_cost', (float) ($v->cost_price ?? 0));
                                                }
                                            }
                                        })
                                        ->columnSpan(fn ($get) => ($get('../../type') ?? $defaultType) === 'in' ? 6 : 9),

                                    Hidden::make('product_id'),

                                    TextInput::make('unit_cost')
                                        ->label('Harga Beli (Rp)')
                                        ->numeric()
                                        ->minValue(0)
                                        ->default(0)
                                        ->visible(fn ($get) => ($get('../../type') ?? $defaultType) === 'in')
                                        ->columnSpan(3),

                                    TextInput::make('qty')
                                        ->label('Qty')
                                        ->numeric()
                                        ->minValue(1)
                                        ->default(1)
                                        ->required()
                                        ->columnSpan(3),
                                ]),
                            ])
                            ->mutateRelationshipDataBeforeCreateUsing(function (array $data): array {
                                if (empty($data['product_id']) && ! empty($data['product_variant_id'])) {
                                    $v = ProductVariant::find((int) $data['product_variant_id']);
                                    $data['product_id'] = $v?->product_id;
                                }
                                $data['unit_cost'] = (float) ($data['unit_cost'] ?? 0);

                                return $data;
                            })
                            ->mutateRelationshipDataBeforeSaveUsing(function (array $data): array {
                                if (empty($data['product_id']) && ! empty($data['product_variant_id'])) {
                                    $v = ProductVariant::find((int) $data['product_variant_id']);
                                    $data['product_id'] = $v?->product_id;
                                }
                                $data['unit_cost'] = (float) ($data['unit_cost'] ?? 0);

                                return $data;
                            }),
                    ]),
            ]);
    }

    protected static function formatVariantLabel(ProductVariant $v): string
    {
        $name = $v->product?->name ?? '-';
        $vLabel = ($v->label && strcasecmp($v->label, 'Standard') !== 0) ? " ({$v->label})" : '';
        $sku = $v->sku ? " • SKU: {$v->sku}" : '';
        $stock = ' • Stok: ' . (int) ($v->stock ?? 0) . ' pcs';

        return "{$name}{$vLabel}{$sku}{$stock}";
    }
}
