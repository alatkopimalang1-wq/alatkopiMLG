<?php

namespace App\Filament\Resources\Staff\Schemas;

use App\Models\User;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Schemas\Components\Grid;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;

class StaffForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                Section::make('Informasi Akun Staf')
                    ->description('Masukkan data staf baru dan kredensial login.')
                    ->schema([
                        Grid::make(2)->schema([
                            TextInput::make('name')
                                ->label('Nama Lengkap')
                                ->placeholder('Contoh: Budi Santoso')
                                ->required()
                                ->maxLength(255),

                            TextInput::make('email')
                                ->label('Alamat Email (Login)')
                                ->placeholder('budi@sanubari.co.id')
                                ->email()
                                ->required()
                                ->unique(User::class, 'email', ignoreRecord: true)
                                ->maxLength(255),
                        ]),

                        Grid::make(2)->schema([
                            TextInput::make('phone')
                                ->label('Nomor Telepon / WhatsApp')
                                ->placeholder('081234567890')
                                ->tel()
                                ->maxLength(30),

                            TextInput::make('password')
                                ->label('Password')
                                ->password()
                                ->revealable()
                                ->dehydrated(fn (?string $state): bool => filled($state))
                                ->required(fn (string $operation): bool => $operation === 'create')
                                ->helperText(fn (string $operation): ?string => $operation === 'edit'
                                    ? 'Kosongkan jika tidak ingin mengubah password akun staf ini.'
                                    : 'Minimal 8 karakter.'),
                        ]),
                    ]),

                Section::make('Pembagian Peran & Hak Akses (Dashboard & POS)')
                    ->description('Atur peran staf secara terpisah untuk Dashboard Admin dan Aplikasi Kasir Toko (POS).')
                    ->schema([
                        Grid::make(2)->schema([
                            Select::make('role')
                                ->label('Peran di Dashboard Admin')
                                ->options([
                                    'editor' => 'Editor (Akses Operasional tanpa Menu Laporan)',
                                    'admin' => 'Admin (Akses Penuh termasuk Laporan Laba Rugi)',
                                    'owner' => 'Owner (Pemilik Toko — Akses Penuh Semua Fitur)',
                                    'none' => 'Tidak Ada Akses (Hanya Bertugas di POS)',
                                ])
                                ->default('editor')
                                ->required()
                                ->live()
                                ->afterStateUpdated(function (?string $state, callable $set) {
                                    if ($state === 'owner') {
                                        $set('pos_role', 'owner');
                                    }
                                })
                                ->helperText('Peran Editor dapat mengelola katalog, pesanan, dan konten, tetapi seluruh menu laporan disembunyikan.'),

                            Select::make('pos_role')
                                ->label('Peran di Aplikasi Kasir (POS)')
                                ->options([
                                    'kasir' => 'Kasir POS (Transaksi Kasir Toko & Buka Kas)',
                                    'admin' => 'Admin POS (Operasional Kasir, Laporan POS & Pengaturan)',
                                    'owner' => 'Owner POS (Akses Penuh POS & Semua Fitur Toko)',
                                    'none' => 'Tidak Ada Akses (Hanya Bertugas di Dashboard)',
                                ])
                                ->default('kasir')
                                ->required()
                                ->live()
                                ->afterStateUpdated(function (?string $state, callable $set) {
                                    if ($state === 'owner') {
                                        $set('role', 'owner');
                                    }
                                })
                                ->helperText('Menentukan tingkat hak akses saat membuka aplikasi kasir POS toko fisik.'),
                        ]),
                    ]),
            ]);
    }
}
