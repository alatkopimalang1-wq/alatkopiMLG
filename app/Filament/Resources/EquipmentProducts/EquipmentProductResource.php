<?php

namespace App\Filament\Resources\EquipmentProducts;

use App\Filament\Resources\EquipmentProducts\Pages\CreateEquipmentProduct;
use App\Filament\Resources\EquipmentProducts\Pages\EditEquipmentProduct;
use App\Filament\Resources\EquipmentProducts\Pages\ListEquipmentProducts;
use App\Filament\Resources\EquipmentProducts\Schemas\EquipmentProductForm;
use App\Filament\Resources\EquipmentProducts\Tables\EquipmentProductsTable;
use App\Models\Product;
use BackedEnum;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;

class EquipmentProductResource extends Resource
{
    protected static ?string $model = Product::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::WrenchScrewdriver;

    protected static string|\UnitEnum|null $navigationGroup = 'Katalog & Toko';

    protected static ?string $navigationLabel = 'Produk Alat Kopi';

    protected static ?string $modelLabel = 'Produk Alat Kopi';

    protected static ?string $pluralModelLabel = 'Produk Alat Kopi';

    protected static ?string $slug = 'equipment-products';

    protected static ?int $navigationSort = 1;

    public static function getEloquentQuery(): Builder
    {
        return parent::getEloquentQuery()
            ->where('series', 'alat-kopi')
            ->with(['primaryImage', 'images', 'variants', 'categories']);
    }

    public static function form(Schema $schema): Schema
    {
        return EquipmentProductForm::configure($schema);
    }

    public static function table(Table $table): Table
    {
        return EquipmentProductsTable::configure($table);
    }

    public static function getRelations(): array
    {
        return [];
    }

    public static function getPages(): array
    {
        return [
            'index' => ListEquipmentProducts::route('/'),
            'create' => CreateEquipmentProduct::route('/create'),
            'edit' => EditEquipmentProduct::route('/{record}/edit'),
        ];
    }
}
