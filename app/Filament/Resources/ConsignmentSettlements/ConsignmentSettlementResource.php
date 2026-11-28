<?php

namespace App\Filament\Resources\ConsignmentSettlements;

use App\Filament\Resources\ConsignmentSettlements\Pages\CreateConsignmentSettlement;
use App\Filament\Resources\ConsignmentSettlements\Pages\ListConsignmentSettlements;
use App\Filament\Resources\ConsignmentSettlements\Pages\ViewConsignmentSettlement;
use App\Models\ConsignmentSettlement;
use BackedEnum;
use Filament\Forms\Components\DatePicker;
use Filament\Forms\Components\FileUpload;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Resources\Resource;
use Filament\Schemas\Components\Grid;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Columns\BadgeColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Table;

class ConsignmentSettlementResource extends Resource
{
    protected static ?string $model = ConsignmentSettlement::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::Banknotes;

    protected static string|\UnitEnum|null $navigationGroup = 'Konsinyasi';

    protected static ?string $navigationLabel = 'Rekap & Settlement';

    protected static ?string $modelLabel = 'Settlement Konsinyasi';

    protected static ?string $pluralModelLabel = 'Rekap & Settlement Konsinyasi';

    protected static ?int $navigationSort = 2;

    public static function form(Schema $schema): Schema
    {
        return $schema
            ->columns(1)
            ->components([
                Section::make('Informasi Rekapitulasi')
                    ->description('Pilih mitra konsinyasi dan periode penjualan untuk menghitung hak bayar vendor otomatis.')
                    ->schema([
                        Grid::make(3)->schema([
                            Select::make('consignor_id')
                                ->label('Mitra Konsinyasi')
                                ->relationship('consignor', 'name')
                                ->searchable()
                                ->preload()
                                ->required()
                                ->disabledOn('edit'),
                            DatePicker::make('period_start')
                                ->label('Periode Mulai')
                                ->default(now()->startOfMonth()->toDateString())
                                ->required(),
                            DatePicker::make('period_end')
                                ->label('Periode Akhir')
                                ->default(now()->toDateString())
                                ->required(),
                        ]),
                        Textarea::make('notes')
                            ->label('Catatan Tambahan')
                            ->placeholder('Contoh: Rekap penjualan titip jual bulan berjalan...')
                            ->rows(2),
                    ]),

                Section::make('Status & Pembayaran')
                    ->schema([
                        Grid::make(3)->schema([
                            Select::make('status')
                                ->label('Status Settlement')
                                ->options([
                                    'draft' => 'Draft (Belum Dibayar)',
                                    'confirmed' => 'Menunggu Pembayaran',
                                    'paid' => 'Lunas (Sudah Ditransfer)',
                                    'cancelled' => 'Dibatalkan',
                                ])
                                ->default('draft')
                                ->required()
                                ->native(false),
                            Select::make('payment_method')
                                ->label('Metode Pembayaran')
                                ->options([
                                    'bank_transfer' => 'Transfer Bank',
                                    'cash' => 'Tunai (Kas Toko)',
                                    'other' => 'Lainnya',
                                ])
                                ->default('bank_transfer')
                                ->native(false),
                            TextInput::make('payment_reference')
                                ->label('No. Referensi / No. Transaksi')
                                ->placeholder('Contoh: TRF-BCA-2026112801'),
                        ]),
                        FileUpload::make('payment_proof')
                            ->label('Bukti Transfer Pembayaran')
                            ->disk('public')
                            ->directory('consignment/payment-proofs')
                            ->image()
                            ->maxSize(5120),
                    ]),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->defaultSort('id', 'desc')
            ->columns([
                TextColumn::make('settlement_number')
                    ->label('No. Settlement')
                    ->searchable()
                    ->sortable()
                    ->weight('bold')
                    ->color('primary')
                    ->url(fn (ConsignmentSettlement $record): string => static::getUrl('view', ['record' => $record])),

                TextColumn::make('consignor.name')
                    ->label('Mitra Penitip')
                    ->searchable()
                    ->sortable(),

                TextColumn::make('period')
                    ->label('Periode')
                    ->state(fn (ConsignmentSettlement $record): string => $record->period_start->format('d/m/Y').' - '.$record->period_end->format('d/m/Y')),

                TextColumn::make('total_items_sold')
                    ->label('Terjual')
                    ->suffix(' pcs')
                    ->sortable(),

                TextColumn::make('total_gross_sales')
                    ->label('Total Omzet')
                    ->money('IDR', locale: 'id')
                    ->sortable(),

                TextColumn::make('total_vendor_payout')
                    ->label('Hak Bayar Vendor')
                    ->money('IDR', locale: 'id')
                    ->weight('bold')
                    ->color('danger')
                    ->sortable(),

                TextColumn::make('total_store_commission')
                    ->label('Komisi Toko')
                    ->money('IDR', locale: 'id')
                    ->weight('semibold')
                    ->color('success')
                    ->sortable(),

                TextColumn::make('status')
                    ->label('Status')
                    ->badge()
                    ->color(fn (string $state): string => match ($state) {
                        'paid' => 'success',
                        'confirmed' => 'warning',
                        'cancelled' => 'danger',
                        default => 'gray',
                    })
                    ->formatStateUsing(fn (string $state): string => match ($state) {
                        'paid' => 'Lunas',
                        'confirmed' => 'Menunggu Pembayaran',
                        'cancelled' => 'Batal',
                        default => 'Draft',
                    }),
            ])
            ->filters([
                SelectFilter::make('consignor_id')
                    ->label('Mitra')
                    ->relationship('consignor', 'name'),

                SelectFilter::make('status')
                    ->label('Status')
                    ->options([
                        'draft' => 'Draft',
                        'confirmed' => 'Menunggu Pembayaran',
                        'paid' => 'Lunas',
                        'cancelled' => 'Batal',
                    ]),
            ])
            ->actions([
                \Filament\Actions\Action::make('view')
                    ->label('Rincian')
                    ->icon('heroicon-o-eye')
                    ->url(fn (ConsignmentSettlement $record): string => static::getUrl('view', ['record' => $record])),
                \Filament\Actions\Action::make('print')
                    ->label('Cetak')
                    ->icon('heroicon-o-printer')
                    ->color('gray')
                    ->url(fn (ConsignmentSettlement $record): string => route('admin.consignment-settlements.print', $record))
                    ->openUrlInNewTab(),
            ]);
    }

    public static function getPages(): array
    {
        return [
            'index' => ListConsignmentSettlements::route('/'),
            'create' => CreateConsignmentSettlement::route('/create'),
            'view' => ViewConsignmentSettlement::route('/{record}'),
        ];
    }
}
