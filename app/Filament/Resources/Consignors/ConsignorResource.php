<?php

namespace App\Filament\Resources\Consignors;

use App\Filament\Resources\Consignors\Pages\CreateConsignor;
use App\Filament\Resources\Consignors\Pages\EditConsignor;
use App\Filament\Resources\Consignors\Pages\ListConsignors;
use App\Models\Consignor;
use BackedEnum;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Resources\Resource;
use Filament\Schemas\Components\Grid;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Columns\IconColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;

class ConsignorResource extends Resource
{
    protected static ?string $model = Consignor::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::BuildingStorefront;

    protected static string|\UnitEnum|null $navigationGroup = 'Konsinyasi';

    protected static ?string $navigationLabel = 'Mitra Konsinyasi';

    protected static ?string $modelLabel = 'Mitra Konsinyasi';

    protected static ?string $pluralModelLabel = 'Mitra Konsinyasi';

    protected static ?int $navigationSort = 1;

    public static function form(Schema $schema): Schema
    {
        return $schema
            ->columns(1)
            ->components([
                Section::make('Informasi Mitra Penitip (Konsinyor)')
                    ->description('Data profil mitra atau vendor yang menitipkan barang di toko Anda.')
                    ->schema([
                        Grid::make(2)->schema([
                            TextInput::make('name')
                                ->label('Nama Mitra / Brand')
                                ->placeholder('Contoh: Kopi Gunung Tilu / Artisan Pottery')
                                ->required(),
                            TextInput::make('code')
                                ->label('Kode Mitra')
                                ->placeholder('Contoh: KNS-001')
                                ->unique(ignoreRecord: true),
                        ]),
                        Grid::make(2)->schema([
                            TextInput::make('phone')
                                ->label('No. WhatsApp / HP')
                                ->placeholder('Contoh: 081234567890')
                                ->tel(),
                            TextInput::make('email')
                                ->label('Email')
                                ->placeholder('mitra@example.com')
                                ->email(),
                        ]),
                        Textarea::make('address')
                            ->label('Alamat / Lokasi Mitra')
                            ->placeholder('Alamat workshop / gudang mitra...')
                            ->rows(2),
                    ]),

                Section::make('Rekening Bank Pembayaran Hak Vendor')
                    ->description('Digunakan untuk transfer hasil penjualan konsinyasi pada saat settlement berkala.')
                    ->schema([
                        Grid::make(3)->schema([
                            TextInput::make('bank_name')
                                ->label('Nama Bank')
                                ->placeholder('Contoh: BCA / Mandiri / BRI'),
                            TextInput::make('bank_account_number')
                                ->label('Nomor Rekening')
                                ->placeholder('Contoh: 1234567890'),
                            TextInput::make('bank_account_holder')
                                ->label('Atas Nama Rekening')
                                ->placeholder('Contoh: PT Artisan Nusantara / Budi'),
                        ]),
                    ]),

                Section::make('Skema Komisi Toko Bawaan')
                    ->description('Skema pembagian keuntungan standar yang otomatis digunakan jika produk baru ditambahkan untuk mitra ini.')
                    ->schema([
                        Grid::make(2)->schema([
                            Select::make('default_commission_type')
                                ->label('Metode Komisi Bawaan')
                                ->options([
                                    'percentage' => 'Persentase Komisi Toko (%)',
                                    'fixed_cost' => 'Harga Setor Bersih Vendor (Net Price)',
                                ])
                                ->default('percentage')
                                ->native(false)
                                ->required(),
                            TextInput::make('default_commission_rate')
                                ->label('Komisi Toko Bawaan (%)')
                                ->numeric()
                                ->default(20.00)
                                ->suffix('%')
                                ->helperText('Standar komisi yang dipotong oleh toko dari harga jual.'),
                        ]),
                        Toggle::make('is_active')
                            ->label('Status Aktif')
                            ->default(true)
                            ->helperText('Hanya mitra aktif yang dapat dipilih pada formulir produk.'),
                        Textarea::make('notes')
                            ->label('Catatan Kesepakatan / Perjanjian')
                            ->placeholder('Contoh: Kontrak titip jual 6 bulan, cut-off rekap tanggal 25 tiap bulan...')
                            ->rows(2),
                    ]),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->defaultSort('name')
            ->columns([
                TextColumn::make('name')
                    ->label('Nama Mitra')
                    ->searchable()
                    ->sortable()
                    ->weight('bold')
                    ->description(fn (Consignor $record): ?string => $record->code ? "Kode: {$record->code}" : null),

                TextColumn::make('phone')
                    ->label('WhatsApp / Kontak')
                    ->searchable()
                    ->url(fn (Consignor $record): ?string => $record->phone ? 'https://wa.me/'.preg_replace('/[^0-9]/', '', $record->phone) : null)
                    ->openUrlInNewTab()
                    ->color('success')
                    ->placeholder('—'),

                TextColumn::make('bank_formatted')
                    ->label('Rekening Transfer')
                    ->wrap()
                    ->placeholder('—'),

                TextColumn::make('products_count')
                    ->label('Jml Produk')
                    ->counts('products')
                    ->badge()
                    ->color('info')
                    ->sortable(),

                TextColumn::make('default_commission_rate')
                    ->label('Komisi Toko')
                    ->suffix('%')
                    ->sortable(),

                IconColumn::make('is_active')
                    ->label('Aktif')
                    ->boolean()
                    ->sortable(),
            ])
            ->actions([
                \Filament\Actions\EditAction::make(),
                \Filament\Actions\DeleteAction::make(),
            ]);
    }

    public static function getPages(): array
    {
        return [
            'index' => ListConsignors::route('/'),
            'create' => CreateConsignor::route('/create'),
            'edit' => EditConsignor::route('/{record}/edit'),
        ];
    }
}
