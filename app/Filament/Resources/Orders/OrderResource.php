<?php

namespace App\Filament\Resources\Orders;

use App\Filament\Resources\Orders\Pages\EditOrder;
use App\Filament\Resources\Orders\Pages\ListOrders;
use App\Filament\Resources\Orders\Schemas\OrderForm;
use App\Filament\Resources\Orders\Tables\OrdersTable;
use App\Models\Order;
use BackedEnum;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;

class OrderResource extends Resource
{
    protected static ?string $model = Order::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::ShoppingBag;

    protected static string|\UnitEnum|null $navigationGroup = 'Pesanan';

    protected static ?string $navigationLabel = 'Pesanan Website';

    protected static ?int $navigationSort = 1;

    /**
     * Only display website orders in the admin dashboard (exclude POS orders).
     */
    public static function getEloquentQuery(): Builder
    {
        return parent::getEloquentQuery()
            ->webOnly()
            ->with(['items']);
    }

    public static function form(Schema $schema): Schema
    {
        return OrderForm::configure($schema);
    }

    public static function table(Table $table): Table
    {
        return OrdersTable::configure($table);
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
            'index' => ListOrders::route('/'),
            'edit' => EditOrder::route('/{record}/edit'),
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
            $pendingCount = \Illuminate\Support\Facades\Cache::remember('badge_orders_pending_count', 30, function () {
                return static::getEloquentQuery()
                    ->whereIn('payment_status', ['pending', 'verifying'])
                    ->count();
            });

            return $pendingCount > 0 ? (string) $pendingCount : null;
        } catch (\Throwable $e) {
            return null;
        }
    }
}
