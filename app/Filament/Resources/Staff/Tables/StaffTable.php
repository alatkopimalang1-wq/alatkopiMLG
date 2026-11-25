<?php

namespace App\Filament\Resources\Staff\Tables;

use App\Models\User;
use Filament\Actions\DeleteAction;
use Filament\Actions\EditAction;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Table;

class StaffTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('name')
                    ->label('Nama Staf')
                    ->searchable()
                    ->sortable()
                    ->weight('bold')
                    ->icon(Heroicon::User),

                TextColumn::make('email')
                    ->label('Email')
                    ->searchable()
                    ->copyable()
                    ->icon(Heroicon::Envelope)
                    ->visibleFrom('md'),

                TextColumn::make('role')
                    ->label('Role Dashboard')
                    ->badge()
                    ->state(fn (User $record): string => match ($record->role) {
                        'owner' => 'Owner',
                        'admin' => 'Admin',
                        'editor' => 'Editor',
                        'none', 'kasir' => 'Tidak Ada Akses',
                        default => $record->role ? ucfirst((string) $record->role) : 'Tidak Ada Akses',
                    })
                    ->color(fn (User $record): string => match ($record->role) {
                        'owner' => 'success',
                        'admin' => 'warning',
                        'editor' => 'info',
                        default => 'gray',
                    }),

                TextColumn::make('pos_role')
                    ->label('Role POS (Kasir)')
                    ->badge()
                    ->state(fn (User $record): string => match ($record->pos_role ?: ($record->role === 'kasir' ? 'kasir' : null)) {
                        'owner' => 'Owner POS',
                        'admin' => 'Admin POS',
                        'kasir' => 'Kasir POS',
                        'none' => 'Tidak Ada Akses',
                        default => 'Tidak Ada Akses',
                    })
                    ->color(fn (User $record): string => match ($record->pos_role ?: ($record->role === 'kasir' ? 'kasir' : null)) {
                        'owner' => 'success',
                        'admin' => 'warning',
                        'kasir' => 'primary',
                        default => 'gray',
                    }),

                TextColumn::make('phone')
                    ->label('No. Telepon')
                    ->placeholder('-')
                    ->toggleable(),

                TextColumn::make('created_at')
                    ->label('Terdaftar')
                    ->dateTime('d M Y, H:i')
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            ->filters([
                SelectFilter::make('role')
                    ->label('Filter Role Dashboard')
                    ->options([
                        'owner' => 'Owner',
                        'admin' => 'Admin',
                        'editor' => 'Editor',
                        'none' => 'Tidak Ada Akses',
                    ]),
                SelectFilter::make('pos_role')
                    ->label('Filter Role POS')
                    ->options([
                        'owner' => 'Owner POS',
                        'admin' => 'Admin POS',
                        'kasir' => 'Kasir POS',
                        'none' => 'Tidak Ada Akses',
                    ]),
            ])
            ->recordActions([
                EditAction::make(),
                DeleteAction::make()
                    ->hidden(fn (User $record): bool => $record->id === auth()->id()),
            ]);
    }
}
