<?php

namespace App\Filament\Pages;

use App\Models\ProductVariant;
use App\Models\StockDocument;
use App\Models\StockDocumentItem;
use Filament\Actions\Action;
use Filament\Forms\Components\DatePicker;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Notifications\Notification;
use Filament\Pages\Page;
use Illuminate\Support\Facades\Request;

class ManageStockDocument extends Page
{
    protected static bool $shouldRegisterNavigation = false;

    protected static ?string $slug = 'stok-dokumen';

    protected static ?string $title = 'Kelola Dokumen Stok';

    protected string $view = 'filament.pages.manage-stock-document';

    public int $recordId = 0;

    public string $productSearch = '';

    public ?int $selectedVariantId = null;

    public string $selectedProductLabel = '';

    public float $unitCost = 0;

    public int $addQty = 1;

    public function mount(): void
    {
        $this->recordId = (int) Request::query('record', 0);
        $doc = $this->document;

        if (! $doc) {
            $this->redirect(StokMasukPage::getUrl());
            return;
        }

        static::$title = ($doc->type === 'out' ? 'Stok Keluar ' : 'Stok Masuk ') . $doc->document_number;
    }

    public function getMaxContentWidth(): ?string
    {
        return 'full';
    }

    public function getDocumentProperty(): ?StockDocument
    {
        if ($this->recordId <= 0) {
            return null;
        }

        return StockDocument::with(['user', 'items.product.primaryImage', 'items.product.images', 'items.variant'])
            ->find($this->recordId);
    }

    public function getSearchResultsProperty()
    {
        $term = trim($this->productSearch);
        if (mb_strlen($term) < 1) {
            return collect();
        }

        $like = '%' . $term . '%';

        return ProductVariant::query()
            ->with(['product.primaryImage', 'product.images'])
            ->whereHas('product', fn ($q) => $q->where('series', 'alat-kopi'))
            ->where(function ($q) use ($like) {
                $q->where('sku', 'like', $like)
                    ->orWhere('label', 'like', $like)
                    ->orWhereHas('product', fn ($pq) => $pq->where('name', 'like', $like));
            })
            ->orderBy('id')
            ->limit(15)
            ->get();
    }

    public function selectProductForIn(int $variantId): void
    {
        $variant = ProductVariant::with('product')->find($variantId);
        if (! $variant || ! $variant->product) {
            return;
        }

        $vLabel = ($variant->label && strcasecmp($variant->label, 'Standard') !== 0) ? " ({$variant->label})" : '';
        $this->selectedVariantId = $variant->id;
        $this->selectedProductLabel = $variant->product->name . $vLabel . ($variant->sku ? " — {$variant->sku}" : '');
        $this->unitCost = (float) ($variant->cost_price ?? 0);
        $this->productSearch = '';
        if ($this->addQty < 1) {
            $this->addQty = 1;
        }
    }

    public function clearSelectedProduct(): void
    {
        $this->selectedVariantId = null;
        $this->selectedProductLabel = '';
        $this->unitCost = 0;
    }

    public function addItemFromQuickOut(int $variantId): void
    {
        $doc = $this->document;
        if (! $doc || ! $doc->isDraft()) {
            return;
        }

        $variant = ProductVariant::with('product')->find($variantId);
        if (! $variant || ! $variant->product) {
            return;
        }

        $qty = max(1, (int) $this->addQty);
        $this->upsertDocumentItem($doc, $variant, $qty, 0);

        $this->productSearch = '';
        $this->addQty = 1;

        Notification::make()
            ->title('Produk ditambahkan ke draf')
            ->success()
            ->send();
    }

    public function addItemFromInForm(): void
    {
        $doc = $this->document;
        if (! $doc || ! $doc->isDraft()) {
            return;
        }

        if (! $this->selectedVariantId) {
            Notification::make()
                ->title('Pilih Produk Terlebih Dahulu')
                ->warning()
                ->send();
            return;
        }

        $variant = ProductVariant::with('product')->find($this->selectedVariantId);
        if (! $variant || ! $variant->product) {
            return;
        }

        $qty = max(1, (int) $this->addQty);
        $cost = max(0, (float) $this->unitCost);

        $this->upsertDocumentItem($doc, $variant, $qty, $cost);

        $this->clearSelectedProduct();
        $this->addQty = 1;

        Notification::make()
            ->title('Produk ditambahkan ke draf')
            ->success()
            ->send();
    }

    protected function upsertDocumentItem(StockDocument $doc, ProductVariant $variant, int $qty, float $unitCost): void
    {
        $existing = StockDocumentItem::where('stock_document_id', $doc->id)
            ->where('product_variant_id', $variant->id)
            ->first();

        if ($existing) {
            $existing->qty += $qty;
            if ($doc->type === 'in' && $unitCost > 0) {
                $existing->unit_cost = $unitCost;
            }
            $existing->save();
        } else {
            StockDocumentItem::create([
                'stock_document_id' => $doc->id,
                'product_id' => $variant->product_id,
                'product_variant_id' => $variant->id,
                'qty' => $qty,
                'unit_cost' => $unitCost,
            ]);
        }
    }

    public function updateItemQty(int $itemId, int $newQty): void
    {
        $doc = $this->document;
        if (! $doc || ! $doc->isDraft()) {
            return;
        }

        $item = StockDocumentItem::where('stock_document_id', $doc->id)->find($itemId);
        if (! $item) {
            return;
        }

        if ($newQty <= 0) {
            $item->delete();
        } else {
            $item->update(['qty' => $newQty]);
        }
    }

    public function removeItem(int $itemId): void
    {
        $doc = $this->document;
        if (! $doc || ! $doc->isDraft()) {
            return;
        }

        StockDocumentItem::where('stock_document_id', $doc->id)->where('id', $itemId)->delete();
    }

    public function saveAsDraft(): void
    {
        Notification::make()
            ->title('Draf Disimpan')
            ->body('Dokumen tersimpan sebagai Draf dan belum mengubah stok produk.')
            ->info()
            ->send();
    }

    public function postNow(): void
    {
        $doc = $this->document;
        if (! $doc) {
            return;
        }

        try {
            $doc->postDocument(auth()->id());
            Notification::make()
                ->title('Dokumen Berhasil Diposting!')
                ->body("Stok produk telah diperbarui sesuai dokumen {$doc->document_number}.")
                ->success()
                ->send();
        } catch (\Throwable $e) {
            Notification::make()
                ->title('Gagal Memposting Dokumen')
                ->body($e->getMessage())
                ->danger()
                ->send();
        }
    }

    public function cancelDocument(): void
    {
        $doc = $this->document;
        if (! $doc) {
            return;
        }

        try {
            $wasPosted = $doc->isPosted();
            $doc->cancelDocument(auth()->id());
            Notification::make()
                ->title('Dokumen Dibatalkan')
                ->body($wasPosted ? 'Dokumen dibatalkan dan perubahan stok telah dikembalikan.' : 'Dokumen draf telah dibatalkan.')
                ->warning()
                ->send();
        } catch (\Throwable $e) {
            Notification::make()
                ->title('Gagal Membatalkan Dokumen')
                ->body($e->getMessage())
                ->danger()
                ->send();
        }
    }

    public function editMetaAction(): Action
    {
        return Action::make('editMeta')
            ->modalHeading(function (array $arguments): string {
                return match ($arguments['field'] ?? '') {
                    'document_date' => 'Ubah Tanggal Dokumen',
                    'supplier_name' => 'Ubah Supplier',
                    'transfer_to' => 'Ubah Tujuan Transfer',
                    'reason' => 'Ubah Alasan Stok Keluar',
                    'notes' => 'Ubah Catatan',
                    default => 'Ubah Informasi',
                };
            })
            ->fillForm(function (array $arguments): array {
                $doc = $this->document;
                $field = $arguments['field'] ?? '';

                return [
                    'value' => match ($field) {
                        'document_date' => $doc?->document_date?->toDateString() ?? now()->toDateString(),
                        'supplier_name' => $doc?->supplier_name ?? '',
                        'transfer_to' => $doc?->transfer_to ?? '',
                        'reason' => $doc?->reason ?? '',
                        'notes' => $doc?->notes ?? '',
                        default => '',
                    },
                ];
            })
            ->schema(function (array $arguments): array {
                $field = $arguments['field'] ?? '';

                return match ($field) {
                    'document_date' => [
                        DatePicker::make('value')
                            ->label('Tanggal')
                            ->required(),
                    ],
                    'supplier_name' => [
                        TextInput::make('value')
                            ->label('Nama Supplier')
                            ->placeholder('Contoh: PT Kopi Nusantara / Supplier Lokal'),
                    ],
                    'transfer_to' => [
                        TextInput::make('value')
                            ->label('Transfer ke')
                            ->placeholder('Contoh: Cabang / Gudang / Penerima'),
                    ],
                    'reason' => [
                        Select::make('value')
                            ->label('Alasan Stok Keluar')
                            ->options([
                                'Barang Rusak / Cacat' => 'Barang Rusak / Cacat',
                                'Barang Hilang / Selisih' => 'Barang Hilang / Selisih',
                                'Pemakaian Internal / Sample' => 'Pemakaian Internal / Sample',
                                'Transfer Cabang / Gudang' => 'Transfer Cabang / Gudang',
                                'Retur ke Supplier' => 'Retur ke Supplier',
                                'Lainnya' => 'Lainnya',
                            ])
                            ->searchable(),
                    ],
                    'notes' => [
                        Textarea::make('value')
                            ->label('Catatan')
                            ->rows(3),
                    ],
                    default => [],
                };
            })
            ->action(function (array $data, array $arguments): void {
                $doc = $this->document;
                if (! $doc || ! $doc->isDraft()) {
                    return;
                }

                $field = $arguments['field'] ?? '';
                if (in_array($field, ['document_date', 'supplier_name', 'transfer_to', 'reason', 'notes'], true)) {
                    $doc->update([$field => $data['value'] ?? null]);
                    Notification::make()
                        ->title('Informasi Diperbarui')
                        ->success()
                        ->send();
                }
            });
    }
}
