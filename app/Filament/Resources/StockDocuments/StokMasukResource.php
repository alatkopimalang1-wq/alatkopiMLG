<?php

namespace App\Filament\Resources\StockDocuments;

use App\Filament\Resources\StockDocuments\Pages\CreateStokMasuk;
use App\Filament\Resources\StockDocuments\Pages\EditStokMasuk;
use App\Filament\Resources\StockDocuments\Pages\ListStokMasuks;
use App\Filament\Resources\StockDocuments\Pages\ViewStokMasuk;
use App\Models\StockDocument;
use BackedEnum;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;

class StokMasukResource extends Resource
{
    protected static ?string $model = StockDocument::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::ArrowDownTray;

    protected static string|\UnitEnum|null $navigationGroup = 'Katalog & Toko';

    protected static ?string $navigationLabel = 'Stok Masuk';

    protected static ?string $modelLabel = 'Stok Masuk';

    protected static ?string $pluralModelLabel = 'Stok Masuk';

    protected static ?string $slug = 'stok-masuk';

    protected static ?int $navigationSort = 5;

    public static function form(Schema $schema): Schema
    {
        return StockDocumentShared::configureForm($schema, StockDocument::TYPE_IN);
    }

    public static function table(Table $table): Table
    {
        return StockDocumentShared::configureTable($table, StockDocument::TYPE_IN);
    }

    public static function getEloquentQuery(): Builder
    {
        return parent::getEloquentQuery()->where('type', StockDocument::TYPE_IN);
    }

    public static function getPages(): array
    {
        return [
            'index' => ListStokMasuks::route('/'),
            'create' => CreateStokMasuk::route('/create'),
            'view' => ViewStokMasuk::route('/{record}'),
            'edit' => EditStokMasuk::route('/{record}/edit'),
        ];
    }
}
