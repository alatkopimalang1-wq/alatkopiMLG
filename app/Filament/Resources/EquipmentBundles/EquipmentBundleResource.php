<?php

namespace App\Filament\Resources\EquipmentBundles;

use App\Filament\Resources\EquipmentBundles\Pages\CreateEquipmentBundle;
use App\Filament\Resources\EquipmentBundles\Pages\EditEquipmentBundle;
use App\Filament\Resources\EquipmentBundles\Pages\ListEquipmentBundles;
use App\Filament\Resources\EquipmentBundles\Schemas\EquipmentBundleForm;
use App\Filament\Resources\EquipmentBundles\Tables\EquipmentBundlesTable;
use App\Models\EquipmentBundle;
use BackedEnum;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Table;

class EquipmentBundleResource extends Resource
{
    protected static ?string $model = EquipmentBundle::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::SquaresPlus;

    protected static string|\UnitEnum|null $navigationGroup = 'Katalog & Toko';

    protected static ?string $navigationLabel = 'Paket Bundling Alat Kopi';

    protected static ?string $modelLabel = 'Paket Bundling';

    protected static ?string $pluralModelLabel = 'Paket Bundling Alat Kopi';

    protected static ?string $slug = 'equipment-bundles';

    protected static ?int $navigationSort = 5;

    public static function form(Schema $schema): Schema
    {
        return EquipmentBundleForm::configure($schema);
    }

    public static function table(Table $table): Table
    {
        return EquipmentBundlesTable::configure($table);
    }

    public static function getRelations(): array
    {
        return [];
    }

    public static function getPages(): array
    {
        return [
            'index' => ListEquipmentBundles::route('/'),
            'create' => CreateEquipmentBundle::route('/create'),
            'edit' => EditEquipmentBundle::route('/{record}/edit'),
        ];
    }
}
