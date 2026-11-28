<?php

namespace App\Filament\Resources\StockDocuments;

use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\StockDocument;
use App\Models\StockDocumentItem;
use Filament\Actions\Action;
use Filament\Forms\Components\DatePicker;
use Filament\Forms\Components\Hidden;
use Filament\Forms\Components\Repeater;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Notifications\Notification;
use Filament\Schemas\Components\Grid;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Table;

class StockDocumentShared
{
    /**
     * Build standard Filament form schema for Stock In or Stock Out.
     */
    public static function configureForm(Schema $schema, string $type): Schema
    {
        $isStockIn = $type === StockDocument::TYPE_IN;

        return $schema
            ->columns(1)
            ->components([
                Hidden::make('type')->default($type),

                Section::make($isStockIn ? 'Informasi Stok Masuk / Konsinyasi' : 'Informasi Stok Keluar / Surat Jalan')
                    ->description($isStockIn
                        ? 'Catat penerimaan banyak produk sekaligus dari supplier, penitip konsinyasi, atau restock internal.'
                        : 'Catat pengeluaran banyak produk sekaligus untuk pengiriman, konsinyasi keluar, sampel, atau afkir.')
                    ->columnSpanFull()
                    ->schema([
                        Grid::make(4)->schema([
                            TextInput::make('document_number')
                                ->label('Nomor Dokumen')
                                ->default(fn (): string => StockDocument::generateNumber($type))
                                ->readOnly()
                                ->required(),

                            DatePicker::make('transaction_date')
                                ->label('Tanggal Transaksi')
                                ->default(now())
                                ->required(),

                            TextInput::make('partner_name')
                                ->label($isStockIn ? 'Supplier / Penitip Konsinyasi' : 'Penerima / Tujuan / Keperluan')
                                ->placeholder($isStockIn ? 'e.g. Penitip Biji Kopi / PT Sukses' : 'e.g. Toko Cabang / Rusak / Konsinyasi')
                                ->required(),

                            TextInput::make('partner_phone')
                                ->label('Nomor Kontak (Opsional)')
                                ->placeholder('08xxxxxxxxxx'),
                        ]),

                        Grid::make(3)->schema([
                            TextInput::make('reference_number')
                                ->label('Nomor Surat Jalan / Referensi (Opsional)')
                                ->placeholder('No. SJ dari supplier atau pengirim...'),

                            Select::make('status')
                                ->label('Status Dokumen')
                                ->options([
                                    StockDocument::STATUS_POSTED => 'Selesai / Posting (Langsung Ubah Stok Sistem)',
                                    StockDocument::STATUS_DRAFT => 'Draf (Simpan Dokumen, Jangan Ubah Stok Dahulu)',
                                ])
                                ->default(StockDocument::STATUS_POSTED)
                                ->required()
                                ->helperText('Pilih Selesai agar stok fisik langsung bertambah/berkurang di website.'),

                            Textarea::make('notes')
                                ->label('Catatan Dokumen (Opsional)')
                                ->rows(2)
                                ->placeholder('Keterangan tambahan transaksi...'),
                        ]),
                    ]),

                Section::make('Daftar Produk Transaksi')
                    ->description('Tambahkan beberapa produk sekaligus yang masuk atau keluar.')
                    ->columnSpanFull()
                    ->schema([
                        Repeater::make('items')
                            ->relationship('items')
                            ->label('Daftar Produk')
                            ->minItems(1)
                            ->defaultItems(1)
                            ->reorderable(false)
                            ->itemLabel(function (array $state): ?string {
                                $product = ! empty($state['product_id'])
                                    ? Product::select('id', 'name')->find($state['product_id'])
                                    : null;
                                $variant = ! empty($state['product_variant_id'])
                                    ? ProductVariant::select('id', 'label', 'sku')->find($state['product_variant_id'])
                                    : null;

                                $name = $product ? $product->name : 'Pilih Produk';
                                $vLabel = $variant && strcasecmp((string) $variant->label, 'Standard') !== 0 ? " ({$variant->label})" : '';
                                $qty = (int) ($state['quantity'] ?? 0);

                                return "{$name}{$vLabel} — {$qty} pcs";
                            })
                            ->schema([
                                Grid::make(12)->schema([
                                    Select::make('product_id')
                                        ->label('Produk Website')
                                        ->searchable()
                                        ->getSearchResultsUsing(function (string $search): array {
                                            return Product::query()
                                                ->where('series', 'alat-kopi')
                                                ->where(function ($q) use ($search) {
                                                    $q->where('name', 'like', "%{$search}%")
                                                        ->orWhereHas('variants', fn ($vq) => $vq->where('sku', 'like', "%{$search}%")->orWhere('label', 'like', "%{$search}%"));
                                                })
                                                ->limit(30)
                                                ->pluck('name', 'id')
                                                ->toArray();
                                        })
                                        ->getOptionLabelUsing(fn ($value): ?string => Product::find($value)?->name)
                                        ->required()
                                        ->live()
                                        ->afterStateUpdated(function ($state, callable $set) {
                                            if (! $state) {
                                                $set('product_variant_id', null);
                                                $set('unit_cost', 0);
                                                return;
                                            }
                                            $variants = ProductVariant::where('product_id', $state)->get();
                                            if ($variants->count() === 1) {
                                                $v = $variants->first();
                                                $set('product_variant_id', $v->id);
                                                $set('unit_cost', (float) ($v->cost_price ?? 0));
                                            } else {
                                                $set('product_variant_id', null);
                                            }
                                        })
                                        ->columnSpan(5),

                                    Select::make('product_variant_id')
                                        ->label('Varian Kemasan')
                                        ->options(function (callable $get): array {
                                            $productId = $get('product_id');
                                            if (! $productId) {
                                                return [];
                                            }
                                            return ProductVariant::where('product_id', $productId)
                                                ->get()
                                                ->mapWithKeys(fn ($v) => [$v->id => ($v->label ?: 'Standard') . ($v->sku ? " [{$v->sku}]" : '') . " (Stok: {$v->stock})"])
                                                ->toArray();
                                        })
                                        ->live()
                                        ->afterStateUpdated(function ($state, callable $set) {
                                            if ($state) {
                                                $v = ProductVariant::find($state);
                                                if ($v && (float) $v->cost_price > 0) {
                                                    $set('unit_cost', (float) $v->cost_price);
                                                }
                                            }
                                        })
                                        ->columnSpan(3),

                                    TextInput::make('quantity')
                                        ->label('Jumlah Qty')
                                        ->numeric()
                                        ->default(1)
                                        ->minValue(1)
                                        ->required()
                                        ->columnSpan(2),

                                    TextInput::make('unit_cost')
                                        ->label('Harga Beli/Modal (Rp)')
                                        ->numeric()
                                        ->prefix('Rp')
                                        ->default(0)
                                        ->columnSpan(2),

                                    TextInput::make('notes')
                                        ->label('Catatan Item / Nomor Seri / Kondisi Fisik')
                                        ->placeholder('Opsional...')
                                        ->columnSpan(12),
                                ]),
                            ]),
                    ]),
            ]);
    }

    /**
     * Build standard Filament table for Stock In or Stock Out.
     */
    public static function configureTable(Table $table, string $type): Table
    {
        $isStockIn = $type === StockDocument::TYPE_IN;

        return $table
            ->query(StockDocument::query()->where('type', $type))
            ->defaultSort('transaction_date', 'desc')
            ->columns([
                TextColumn::make('document_number')
                    ->label('No. Dokumen')
                    ->searchable()
                    ->sortable()
                    ->copyable()
                    ->weight('bold'),

                TextColumn::make('transaction_date')
                    ->label('Tanggal')
                    ->date('d M Y')
                    ->sortable(),

                TextColumn::make('partner_name')
                    ->label($isStockIn ? 'Supplier / Penitip' : 'Penerima / Tujuan')
                    ->searchable()
                    ->sortable(),

                TextColumn::make('total_qty')
                    ->label('Total Qty')
                    ->formatStateUsing(fn ($state) => number_format((int) $state) . ' pcs')
                    ->alignCenter()
                    ->sortable(),

                TextColumn::make('total_cost')
                    ->label('Total Biaya')
                    ->formatStateUsing(fn ($state) => (float) $state > 0 ? 'Rp ' . number_format((float) $state, 0, ',', '.') : '-')
                    ->sortable(),

                TextColumn::make('status')
                    ->label('Status')
                    ->badge()
                    ->formatStateUsing(fn (string $state): string => match ($state) {
                        StockDocument::STATUS_POSTED => 'Selesai',
                        StockDocument::STATUS_DRAFT => 'Draf',
                        default => ucfirst($state),
                    })
                    ->color(fn (string $state): string => match ($state) {
                        StockDocument::STATUS_POSTED => 'success',
                        StockDocument::STATUS_DRAFT => 'warning',
                        default => 'gray',
                    })
                    ->alignCenter(),

                TextColumn::make('user.name')
                    ->label('Petugas')
                    ->placeholder('Admin')
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            ->filters([
                SelectFilter::make('status')
                    ->label('Filter Status')
                    ->options([
                        StockDocument::STATUS_POSTED => 'Selesai / Terposting',
                        StockDocument::STATUS_DRAFT => 'Draf',
                    ]),
            ])
            ->actions([
                Action::make('print')
                    ->label('Cetak Bukti')
                    ->icon(Heroicon::Printer)
                    ->color('info')
                    ->url(fn (StockDocument $record): string => route('admin.stock-documents.print', $record))
                    ->openUrlInNewTab(),

                Action::make('postNow')
                    ->label('Posting Stok')
                    ->icon(Heroicon::CheckCircle)
                    ->color('success')
                    ->visible(fn (StockDocument $record): bool => $record->status === StockDocument::STATUS_DRAFT)
                    ->requiresConfirmation()
                    ->modalHeading('Posting Dokumen Sekarang?')
                    ->modalDescription('Stok produk akan langsung ditambahkan/dikurangkan pada sistem.')
                    ->action(function (StockDocument $record): void {
                        $record->postStock();
                        Notification::make()
                            ->title('Dokumen Berhasil Diposting!')
                            ->body('Stok produk telah diperbarui.')
                            ->success()
                            ->send();
                    }),
            ]);
    }
}
