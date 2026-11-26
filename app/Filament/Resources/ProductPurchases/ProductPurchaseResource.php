<?php

namespace App\Filament\Resources\ProductPurchases;

use App\Filament\Resources\ProductPurchases\Pages\CreateProductPurchase;
use App\Filament\Resources\ProductPurchases\Pages\ListProductPurchases;
use App\Filament\Resources\ProductPurchases\Pages\ViewProductPurchase;
use App\Filament\Resources\ProductPurchases\Schemas\ProductPurchaseForm;
use App\Filament\Resources\ProductPurchases\Tables\ProductPurchasesTable;
use App\Models\ProductPurchase;
use BackedEnum;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Model;

class ProductPurchaseResource extends Resource
{
    protected static ?string $model = ProductPurchase::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::ShoppingCart;

    protected static string|\UnitEnum|null $navigationGroup = 'Katalog & Toko';

    protected static ?string $navigationLabel = 'Pembelian Produk';

    protected static ?string $modelLabel = 'Pembelian Produk';

    protected static ?string $pluralModelLabel = 'Pembelian Produk';

    protected static ?string $slug = 'product-purchases';

    protected static ?int $navigationSort = 2;

    public static function form(Schema $schema): Schema
    {
        return ProductPurchaseForm::configure($schema);
    }

    public static function table(Table $table): Table
    {
        return ProductPurchasesTable::configure($table);
    }

    public static function canEdit(Model $record): bool
    {
        return false;
    }

    public static function getRelations(): array
    {
        return [];
    }

    public static function getPages(): array
    {
        return [
            'index' => ListProductPurchases::route('/'),
            'create' => CreateProductPurchase::route('/create'),
            'view' => ViewProductPurchase::route('/{record}'),
        ];
    }
}
