<?php

namespace App\Filament\Resources\StockDocuments;

use App\Filament\Pages\InventoriStok;
use App\Filament\Resources\StockDocuments\Pages\CreateStockDocument;
use App\Filament\Resources\StockDocuments\Pages\EditStockDocument;
use App\Filament\Resources\StockDocuments\Pages\ViewStockDocument;
use App\Filament\Resources\StockDocuments\Schemas\StockDocumentForm;
use App\Models\StockDocument;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Illuminate\Database\Eloquent\Model;

class StockDocumentResource extends Resource
{
    protected static ?string $model = StockDocument::class;

    protected static bool $shouldRegisterNavigation = false;

    protected static ?string $modelLabel = 'Dokumen Stok';

    protected static ?string $pluralModelLabel = 'Dokumen Stok';

    protected static ?string $slug = 'stock-documents';

    public static function form(Schema $schema): Schema
    {
        return StockDocumentForm::configure($schema);
    }

    public static function canEdit(Model $record): bool
    {
        return $record instanceof StockDocument && $record->isDraft();
    }

    public static function getIndexUrl(array $parameters = [], bool $isAbsolute = true, ?string $panel = null, ?Model $tenant = null, bool $shouldGuessMissingParameters = false): string
    {
        return InventoriStok::getUrl($parameters, $isAbsolute, $panel, $tenant);
    }

    public static function getPages(): array
    {
        return [
            'create' => CreateStockDocument::route('/create'),
            'view' => ViewStockDocument::route('/{record}'),
            'edit' => EditStockDocument::route('/{record}/edit'),
        ];
    }
}
