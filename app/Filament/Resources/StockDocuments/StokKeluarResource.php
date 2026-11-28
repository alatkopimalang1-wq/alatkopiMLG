<?php

namespace App\Filament\Resources\StockDocuments;

use App\Filament\Resources\StockDocuments\Pages\CreateStokKeluar;
use App\Filament\Resources\StockDocuments\Pages\EditStokKeluar;
use App\Filament\Resources\StockDocuments\Pages\ListStokKeluars;
use App\Filament\Resources\StockDocuments\Pages\ViewStokKeluar;
use App\Models\StockDocument;
use BackedEnum;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;

class StokKeluarResource extends Resource
{
    protected static ?string $model = StockDocument::class;

    protected static bool $shouldRegisterNavigation = false;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::ArrowUpTray;

    protected static string|\UnitEnum|null $navigationGroup = 'Katalog & Toko';

    protected static ?string $navigationLabel = 'Stok Keluar';

    protected static ?string $modelLabel = 'Stok Keluar';

    protected static ?string $pluralModelLabel = 'Stok Keluar';

    protected static ?string $slug = 'stok-keluar';

    protected static ?int $navigationSort = 6;

    public static function form(Schema $schema): Schema
    {
        return StockDocumentShared::configureForm($schema, StockDocument::TYPE_OUT);
    }

    public static function table(Table $table): Table
    {
        return StockDocumentShared::configureTable($table, StockDocument::TYPE_OUT);
    }

    public static function getEloquentQuery(): Builder
    {
        return parent::getEloquentQuery()->where('type', StockDocument::TYPE_OUT);
    }

    public static function getPages(): array
    {
        return [
            'index' => ListStokKeluars::route('/'),
            'create' => CreateStokKeluar::route('/create'),
            'view' => ViewStokKeluar::route('/{record}'),
            'edit' => EditStokKeluar::route('/{record}/edit'),
        ];
    }
}
