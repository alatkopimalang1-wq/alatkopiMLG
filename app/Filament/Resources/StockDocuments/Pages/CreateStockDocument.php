<?php

namespace App\Filament\Resources\StockDocuments\Pages;

use App\Filament\Pages\InventoriStok;
use App\Filament\Resources\StockDocuments\StockDocumentResource;
use App\Models\StockDocument;
use Filament\Actions\Action;
use Filament\Notifications\Notification;
use Filament\Resources\Pages\CreateRecord;

class CreateStockDocument extends CreateRecord
{
    protected static string $resource = StockDocumentResource::class;

    public function getTitle(): string
    {
        return request()->query('type') === 'out' ? 'Buat Stok Keluar' : 'Buat Stok Masuk';
    }

    protected function mutateFormDataBeforeCreate(array $data): array
    {
        $type = ($data['type'] ?? request()->query('type')) === 'out' ? 'out' : 'in';
        $data['type'] = $type;
        $data['status'] = 'draft';
        $data['document_number'] = StockDocument::generateNumber($type);
        $data['user_id'] = auth()->id();

        return $data;
    }

    protected function getHeaderActions(): array
    {
        $type = request()->query('type') === 'out' ? 'keluar' : 'masuk';

        return [
            Action::make('back')
                ->label('Kembali')
                ->color('gray')
                ->url(InventoriStok::getUrl(['tab' => $type])),
        ];
    }

    protected function getFormActions(): array
    {
        return [
            $this->getCreateFormAction()
                ->label('Simpan sebagai Draf')
                ->color('warning'),

            Action::make('createAndPost')
                ->label('Posting Sekarang')
                ->color('success')
                ->requiresConfirmation()
                ->modalHeading('Posting Dokumen Sekarang?')
                ->modalDescription('Stok produk akan langsung diperbarui sesuai daftar produk pada dokumen ini.')
                ->action(function () {
                    $this->create();
                    if ($this->record instanceof StockDocument) {
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
                                ->title('Tersimpan sebagai Draf, Gagal Posting')
                                ->body($e->getMessage())
                                ->danger()
                                ->send();
                        }
                    }
                }),

            $this->getCancelFormAction()
                ->url(InventoriStok::getUrl(['tab' => request()->query('type') === 'out' ? 'keluar' : 'masuk'])),
        ];
    }

    protected function getRedirectUrl(): string
    {
        return StockDocumentResource::getUrl('view', ['record' => $this->record->id]);
    }
}
