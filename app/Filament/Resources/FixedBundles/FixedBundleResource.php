<?php

namespace App\Filament\Resources\FixedBundles;

use App\Filament\Resources\FixedBundles\Pages\CreateFixedBundle;
use App\Filament\Resources\FixedBundles\Pages\EditFixedBundle;
use App\Filament\Resources\FixedBundles\Pages\ListFixedBundles;
use App\Filament\Resources\FixedBundles\Schemas\FixedBundleForm;
use App\Filament\Resources\FixedBundles\Tables\FixedBundlesTable;
use App\Models\FixedBundle;
use BackedEnum;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Table;

class FixedBundleResource extends Resource
{
    protected static ?string $model = FixedBundle::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedArchiveBox;

    protected static string|\UnitEnum|null $navigationGroup = 'Katalog & Toko';

    protected static ?string $navigationLabel = 'Produk Bundling';

    protected static ?string $modelLabel = 'Produk Bundling';

    protected static ?string $pluralModelLabel = 'Produk Bundling';

    protected static ?string $slug = 'fixed-bundles';

    protected static ?int $navigationSort = 2;

    public static function form(Schema $schema): Schema
    {
        return FixedBundleForm::configure($schema);
    }

    public static function table(Table $table): Table
    {
        return FixedBundlesTable::configure($table);
    }

    public static function getRelations(): array
    {
        return [];
    }

    public static function getPages(): array
    {
        return [
            'index' => ListFixedBundles::route('/'),
            'create' => CreateFixedBundle::route('/create'),
            'edit' => EditFixedBundle::route('/{record}/edit'),
        ];
    }
}
