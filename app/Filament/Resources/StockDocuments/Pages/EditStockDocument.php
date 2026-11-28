<?php

namespace App\Filament\Resources\StockDocuments\Pages;

use App\Filament\Pages\InventoriStok;
use App\Filament\Resources\StockDocuments\StockDocumentResource;
use App\Models\StockDocument;
use Filament\Actions\Action;
use Filament\Notifications\Notification;
use Filament\Resources\Pages\EditRecord;

class EditStockDocument extends EditRecord
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

            Action::make('postNow')
                ->label('Posting Sekarang')
                ->color('success')
                ->requiresConfirmation()
                ->modalHeading('Posting Dokumen Sekarang?')
                ->modalDescription('Stok produk akan langsung diperbarui dan dokumen menjadi Posted.')
                ->visible(fn () => $this->record instanceof StockDocument && $this->record->isDraft())
                ->action(function () {
                    $this->save(shouldRedirect: false);
                    try {
                        $this->record->postDocument(auth()->id());
                        Notification::make()
                            ->title('Dokumen Berhasil Diposting!')
                            ->body("Stok produk telah diperbarui ({$this->record->document_number}).")
                            ->success()
                            ->send();
                        $this->redirect(StockDocumentResource::getUrl('view', ['record' => $this->record->id]));
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
                ->visible(fn () => $this->record instanceof StockDocument && ! $this->record->isCancelled())
                ->action(function () {
                    $this->record->cancelDocument(auth()->id());
                    Notification::make()
                        ->title('Dokumen Dibatalkan')
                        ->warning()
                        ->send();
                    $this->redirect(StockDocumentResource::getUrl('view', ['record' => $this->record->id]));
                }),
        ];
    }

    protected function getRedirectUrl(): string
    {
        return StockDocumentResource::getUrl('view', ['record' => $this->record->id]);
    }
}
