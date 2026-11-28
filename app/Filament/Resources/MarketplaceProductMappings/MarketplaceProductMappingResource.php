<?php

namespace App\Filament\Resources\MarketplaceProductMappings;

use App\Filament\Resources\MarketplaceProductMappings\Pages\ListMarketplaceProductMappings;
use App\Filament\Resources\MarketplaceProductMappings\Tables\MarketplaceProductMappingsTable;
use App\Models\MarketplaceProductMapping;
use BackedEnum;
use Filament\Resources\Resource;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;

class MarketplaceProductMappingResource extends Resource
{
    protected static ?string $model = MarketplaceProductMapping::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::ArrowsRightLeft;

    protected static string|\UnitEnum|null $navigationGroup = 'Katalog & Toko';

    protected static ?string $navigationLabel = 'Sinkronisasi Produk MP';

    protected static ?string $modelLabel = 'Sinkronisasi Produk MP';

    protected static ?string $pluralModelLabel = 'Sinkronisasi Produk MP';

    protected static ?string $slug = 'pemetaan-produk-marketplace';

    protected static ?int $navigationSort = 6;

    public static function getEloquentQuery(): Builder
    {
        return parent::getEloquentQuery()
            ->with(['product.primaryImage', 'product.images', 'variant'])
            ->where('marketplace_status', 'ACTIVATE');
    }

    public static function table(Table $table): Table
    {
        return MarketplaceProductMappingsTable::configure($table);
    }

    public static function getRelations(): array
    {
        return [
            //
        ];
    }

    public static function getPages(): array
    {
        return [
            'index' => ListMarketplaceProductMappings::route('/'),
        ];
    }
}
