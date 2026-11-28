<?php

namespace App\Filament\Pages;

use App\Models\StockDocument;
use BackedEnum;
use Filament\Pages\Page;
use Filament\Support\Icons\Heroicon;

class StokMasukPage extends Page
{
    protected static bool $shouldRegisterNavigation = false;

    protected static ?string $title = 'Daftar Stok Masuk';

    protected static ?string $slug = 'stok-masuk';

    protected static ?int $navigationSort = 5;

    protected string $view = 'filament.pages.stok-dokumen-list';

    public string $docType = 'in';

    public string $statusFilter = 'all';

    public string $search = '';

    public function getMaxContentWidth(): ?string
    {
        return 'full';
    }

    public function getDocumentsProperty()
    {
        $query = StockDocument::query()
            ->with(['user', 'items'])
            ->where('type', 'in');

        if (in_array($this->statusFilter, ['draft', 'posted', 'cancelled'], true)) {
            $query->where('status', $this->statusFilter);
        }

        if (trim($this->search) !== '') {
            $term = '%' . trim($this->search) . '%';
            $query->where(function ($q) use ($term) {
                $q->where('document_number', 'like', $term)
                    ->orWhere('supplier_name', 'like', $term)
                    ->orWhere('notes', 'like', $term);
            });
        }

        return $query->orderByDesc('id')->limit(100)->get();
    }

    public function createDraftDocument(): void
    {
        $doc = StockDocument::create([
            'document_number' => StockDocument::generateNumber('in'),
            'type' => 'in',
            'status' => 'draft',
            'document_date' => now()->toDateString(),
            'user_id' => auth()->id(),
        ]);

        $this->redirect(ManageStockDocument::getUrl(['record' => $doc->id]));
    }
}
