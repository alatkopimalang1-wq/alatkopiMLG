<?php

namespace App\Filament\Resources\StockDocuments\Pages;

use App\Filament\Resources\StockDocuments\StokMasukResource;
use App\Models\StockDocument;
use Filament\Actions\Action;
use Filament\Actions\EditAction;
use Filament\Notifications\Notification;
use Filament\Resources\Pages\ViewRecord;
use Filament\Support\Icons\Heroicon;

class ViewStokMasuk extends ViewRecord
{
    protected static string $resource = StokMasukResource::class;

    protected function getHeaderActions(): array
    {
        /** @var StockDocument $record */
        $record = $this->getRecord();

        return [
            Action::make('print')
                ->label('Cetak Bukti (A4)')
                ->icon(Heroicon::Printer)
                ->color('info')
                ->url(route('admin.stock-documents.print', $record))
                ->openUrlInNewTab(),

            Action::make('postNow')
                ->label('Posting Stok Sekarang')
                ->icon(Heroicon::CheckCircle)
                ->color('success')
                ->visible(fn (): bool => $record->status === StockDocument::STATUS_DRAFT)
                ->requiresConfirmation()
                ->modalHeading('Posting Dokumen Stok Masuk?')
                ->modalDescription('Stok produk akan langsung ditambahkan ke inventori sistem.')
                ->action(function () use ($record): void {
                    $record->postStock();
                    Notification::make()
                        ->title('Stok Masuk Berhasil Diposting!')
                        ->body('Stok produk telah bertambah.')
                        ->success()
                        ->send();

                    $this->refreshFormData(['status', 'posted_at']);
                }),

            EditAction::make()
                ->label('Ubah Dokumen')
                ->visible(fn (): bool => $record->status === StockDocument::STATUS_DRAFT),
        ];
    }
}
