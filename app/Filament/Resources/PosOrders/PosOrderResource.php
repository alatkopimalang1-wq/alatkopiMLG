<?php

namespace App\Filament\Resources\PosOrders;

use App\Filament\Resources\PosOrders\Pages\ListPosOrders;
use App\Filament\Resources\PosOrders\Tables\PosOrdersTable;
use App\Models\Order;
use BackedEnum;
use Filament\Resources\Resource;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;

class PosOrderResource extends Resource
{
    protected static ?string $model = Order::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::ReceiptPercent;

    protected static string|\UnitEnum|null $navigationGroup = 'Pesanan';

    protected static ?string $navigationLabel = 'Riwayat Transaksi Pos';

    protected static ?string $modelLabel = 'Transaksi POS';

    protected static ?string $pluralModelLabel = 'Riwayat Transaksi POS';

    protected static ?string $slug = 'riwayat-transaksi-pos';

    protected static ?int $navigationSort = 3;

    public static function getEloquentQuery(): Builder
    {
        return parent::getEloquentQuery()
            ->posOnly()
            ->with(['items', 'user']);
    }

    public static function table(Table $table): Table
    {
        return PosOrdersTable::configure($table);
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
            'index' => ListPosOrders::route('/'),
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
            $todayCount = \Illuminate\Support\Facades\Cache::remember('badge_pos_today_count', 30, function () {
                return static::getEloquentQuery()
                    ->whereDate('created_at', today())
                    ->count();
            });

            return $todayCount > 0 ? (string) $todayCount : null;
        } catch (\Throwable $e) {
            return null;
        }
    }

    public static function getNavigationBadgeColor(): ?string
    {
        return 'warning';
    }
}
