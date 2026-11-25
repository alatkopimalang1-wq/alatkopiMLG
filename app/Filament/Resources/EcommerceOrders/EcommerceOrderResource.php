<?php

namespace App\Filament\Resources\EcommerceOrders;

use App\Filament\Resources\EcommerceOrders\Pages\ListEcommerceOrders;
use App\Filament\Resources\EcommerceOrders\Tables\EcommerceOrdersTable;
use App\Models\Order;
use BackedEnum;
use Filament\Resources\Resource;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;

class EcommerceOrderResource extends Resource
{
    protected static ?string $model = Order::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::BuildingStorefront;

    protected static string|\UnitEnum|null $navigationGroup = 'Pesanan';

    protected static ?string $navigationLabel = 'Pesanan Ecommerce';

    protected static ?string $modelLabel = 'Pesanan Ecommerce';

    protected static ?string $pluralModelLabel = 'Pesanan Ecommerce';

    protected static ?string $slug = 'pesanan-ecommerce';

    protected static ?int $navigationSort = 2;

    public static function getEloquentQuery(): Builder
    {
        return parent::getEloquentQuery()
            ->ecommerceOnly()
            ->with(['items', 'user']);
    }

    public static function table(Table $table): Table
    {
        return EcommerceOrdersTable::configure($table);
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
            'index' => ListEcommerceOrders::route('/'),
        ];
    }

    public static function canDelete(\Illuminate\Database\Eloquent\Model $record): bool
    {
        return auth()->user()?->isOwner() ?? false;
    }

    public static function canDeleteAny(): bool
    {
        return auth()->user()?->isOwner() ?? false;
    }

    public static function getNavigationBadge(): ?string
    {
        try {
            $activeCount = \Illuminate\Support\Facades\Cache::remember('badge_ecommerce_active_count', 30, function () {
                return static::getEloquentQuery()
                    ->whereIn('status', ['pending', 'processing'])
                    ->count();
            });

            return $activeCount > 0 ? (string) $activeCount : null;
        } catch (\Throwable $e) {
            return null;
        }
    }

    public static function getNavigationBadgeColor(): ?string
    {
        return 'primary';
    }
}
