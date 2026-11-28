<?php

namespace App\Filament\Resources\StockDocuments\Pages;

use App\Filament\Pages\InventoriStok;
use App\Filament\Resources\StockDocuments\StockDocumentResource;
use App\Models\StockDocument;
use Filament\Actions\Action;
use Filament\Infolists\Components\RepeatableEntry;
use Filament\Infolists\Components\TextEntry;
use Filament\Notifications\Notification;
use Filament\Resources\Pages\ViewRecord;
use Filament\Schemas\Components\Grid;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;

class ViewStockDocument extends ViewRecord
{
    protected static string $resource = StockDocumentResource::class;

    public function getTitle(): string
    {
        $prefix = $this->record->type === 'out' ? 'Stok Keluar ' : 'Stok Masuk ';

        return $prefix . $this->record->document_number;
    }

    protected function getHeaderActions(): array
    {
        $tab = $this->record->type === 'out' ? 'keluar' : 'masuk';

        return [
            Action::make('back')
                ->label('Kembali')
                ->color('gray')
                ->url(InventoriStok::getUrl(['tab' => $tab])),

            Action::make('editDraft')
                ->label('Ubah Draf')
                ->color('warning')
                ->visible(fn () => $this->record instanceof StockDocument && $this->record->isDraft())
                ->url(fn () => StockDocumentResource::getUrl('edit', ['record' => $this->record->id])),

            Action::make('postNow')
                ->label('Posting Sekarang')
                ->color('success')
                ->requiresConfirmation()
                ->modalHeading('Posting Dokumen Sekarang?')
                ->modalDescription('Stok produk akan langsung diperbarui sesuai daftar produk pada dokumen ini.')
                ->visible(fn () => $this->record instanceof StockDocument && $this->record->isDraft())
                ->action(function () {
                    try {
                        $this->record->postDocument(auth()->id());
                        Notification::make()
                            ->title('Dokumen Berhasil Diposting!')
                            ->body("Stok produk telah diperbarui ({$this->record->document_number}).")
                            ->success()
                            ->send();
                        $this->refreshFormData(['status', 'posted_at']);
                    } catch (\Throwable $e) {
                        Notification::make()
                            ->title('Gagal Memposting Dokumen')
                            ->body($e->getMessage())
                            ->danger()
                            ->send();
                    }
                }),

            Action::make('cancelDoc')
                ->label('Batalkan')
                ->color('danger')
                ->requiresConfirmation()
                ->modalDescription(fn () => $this->record->isPosted()
                    ? 'Dokumen sudah diposting. Membatalkan dokumen ini akan mengembalikan stok produk secara otomatis.'
                    : 'Batalkan dokumen draf ini?')
                ->visible(fn () => $this->record instanceof StockDocument && ! $this->record->isCancelled())
                ->action(function () {
                    $wasPosted = $this->record->isPosted();
                    $this->record->cancelDocument(auth()->id());
                    Notification::make()
                        ->title('Dokumen Dibatalkan')
                        ->body($wasPosted ? 'Perubahan stok telah dikembalikan otomatis.' : 'Dokumen draf dibatalkan.')
                        ->warning()
                        ->send();
                    $this->refreshFormData(['status', 'cancelled_at']);
                }),
        ];
    }

    public function infolist(Schema $schema): Schema
    {
        $isOut = $this->record->type === 'out';

        return $schema->components([
            Section::make('Informasi Dokumen')
                ->schema([
                    Grid::make(4)->schema([
                        TextEntry::make('document_number')
                            ->label('No. Dokumen')
                            ->weight('bold'),

                        TextEntry::make('status')
                            ->label('Status')
                            ->badge()
                            ->formatStateUsing(fn (string $state) => match ($state) {
                                'posted' => 'Posted',
                                'cancelled' => 'Dibatalkan',
                                default => 'Draft',
                            })
                            ->color(fn (string $state) => match ($state) {
                                'posted' => 'success',
                                'cancelled' => 'danger',
                                default => 'warning',
                            }),

                        TextEntry::make('document_date')
                            ->label('Tanggal')
                            ->date('d M Y'),

                        TextEntry::make('user.name')
                            ->label($isOut ? 'Dibuat Oleh' : 'Diterima Oleh')
                            ->default('-'),

                        TextEntry::make('supplier_name')
                            ->label('Supplier')
                            ->default('-')
                            ->visible(! $isOut),

                        TextEntry::make('transfer_to')
                            ->label('Transfer ke')
                            ->default('-')
                            ->visible($isOut),

                        TextEntry::make('reason')
                            ->label('Alasan')
                            ->default('-')
                            ->visible($isOut),

                        TextEntry::make('notes')
                            ->label('Catatan')
                            ->default('-')
                            ->columnSpan(2),
                    ]),
                ]),

            Section::make('Daftar Produk')
                ->schema([
                    RepeatableEntry::make('items')
                        ->label('')
                        ->schema([
                            Grid::make(5)->schema([
                                TextEntry::make('product.name')
                                    ->label('Produk')
                                    ->weight('bold'),

                                TextEntry::make('variant.label')
                                    ->label('Varian')
                                    ->default('-'),

                                TextEntry::make('variant.sku')
                                    ->label('SKU')
                                    ->default('-'),

                                TextEntry::make('unit_cost')
                                    ->label('Harga Beli')
                                    ->money('IDR')
                                    ->visible(! $isOut),

                                TextEntry::make('qty')
                                    ->label('Qty')
                                    ->suffix(' pcs')
                                    ->weight('bold'),
                            ]),
                        ]),
                ]),
        ]);
    }
}
