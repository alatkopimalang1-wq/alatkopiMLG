<?php

namespace App\Filament\Resources\Categories\Schemas;

use Filament\Forms\Components\Hidden;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Schemas\Components\Grid;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;
use Illuminate\Support\Str;

class CategoryForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                Section::make('Informasi Kategori')
                    ->schema([
                        Grid::make(2)->schema([
                            TextInput::make('name.id')
                                ->label('Nama (Indonesia)')
                                ->live(onBlur: true)
                                ->afterStateUpdated(function (string $operation, ?string $state, callable $set): void {
                                    if ($operation === 'create') {
                                        $set('slug', Str::slug((string) $state));
                                    }
                                })
                                ->required(),
                            TextInput::make('name.en')
                                ->label('Nama (English)'),
                        ]),
                        Grid::make(2)->schema([
                            TextInput::make('slug')
                                ->required()
                                ->unique(ignoreRecord: true),
                            TextInput::make('sort_order')
                                ->label('Urutan')
                                ->numeric()
                                ->default(0),
                        ]),
                        Hidden::make('type')
                            ->default('merch'),
                        Select::make('parent_id')
                            ->label('Induk Kategori (Opsional)')
                            ->relationship('parent', 'slug')
                            ->getOptionLabelFromRecordUsing(fn ($record) => is_array($record->name) ? ($record->name['id'] ?? $record->slug) : $record->slug),
                    ]),
            ]);
    }
}
