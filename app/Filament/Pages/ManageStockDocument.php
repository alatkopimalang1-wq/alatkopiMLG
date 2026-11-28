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
use Filament\Schemas\Components\Grid;
use Filament\Schemas\Schema;
use Illuminate\Support\Facades\Request;

class ManageStockDocument extends Page
{
    protected static bool $shouldRegisterNavigation = false;

    protected static ?string $slug = 'stok-dokumen';

    protected static ?string $title = 'Kelola Dokumen Stok';

    protected string $view = 'filament.pages.manage-stock-document';

    public int $recordId = 0;

    /**
     * @var array<string, mixed> | null
     */
    public ?array $addFormData = [];

    public function mount(): void
    {
        $this->recordId = (int) Request::query('record', 0);
        $doc = $this->getFreshDocument();

        if (! $doc) {
            $this->redirect(InventoriStok::getUrl(['tab' => 'masuk']));
            return;
        }

        static::$title = ($doc->type === 'out' ? 'Stok Keluar ' : 'Stok Masuk ') . $doc->document_number;

        $this->addForm->fill([
            'variant_id' => null,
            'unit_cost' => 0,
            'qty' => 1,
        ]);
    }

    public function getMaxContentWidth(): ?string
    {
        return 'full';
    }

    public function getFreshDocument(): ?StockDocument
    {
        if ($this->recordId <= 0) {
            return null;
        }

        return StockDocument::with(['user', 'items.product.primaryImage', 'items.product.images', 'items.variant'])
            ->find($this->recordId);
    }

    public function getDocumentProperty(): ?StockDocument
    {
        return $this->getFreshDocument();
    }

    public function addForm(Schema $schema): Schema
    {
        $isOut = $this->getFreshDocument()?->type === 'out';

        $fields = [
            Select::make('variant_id')
                ->label('Produk')
                ->placeholder('Ketik nama produk atau SKU...')
                ->options(fn (): array => static::searchVariantsForSelect(''))
                ->searchable()
                ->allowHtml()
                ->getSearchResultsUsing(fn (string $search): array => static::searchVariantsForSelect($search))
                ->getOptionLabelUsing(fn ($value): ?string => static::formatVariantOptionHtml((int) $value))
                ->columnSpan($isOut ? 9 : 6),
        ];

        if (! $isOut) {
            $fields[] = TextInput::make('unit_cost')
                ->label('Harga Beli (Rp)')
                ->helperText('Kosongkan / 0 untuk pakai harga beli terakhir.')
                ->numeric()
                ->minValue(0)
                ->default(0)
                ->columnSpan(3);
        }

        $fields[] = TextInput::make('qty')
            ->label('Qty')
            ->numeric()
            ->minValue(1)
            ->default(1)
            ->required()
            ->columnSpan(3);

        return $schema
            ->statePath('addFormData')
            ->components([
                Grid::make(12)->schema($fields),
            ]);
    }

    /**
     * Search top 25 variants for the Select dropdown (avoids loading 800+ options on every request).
     *
     * @return array<int, string>
     */
    protected static function searchVariantsForSelect(string $search): array
    {
        $term = '%' . trim($search) . '%';

        return ProductVariant::query()
            ->with(['product.primaryImage', 'product.images'])
            ->whereHas('product', fn ($q) => $q->where('series', 'alat-kopi'))
            ->where(function ($q) use ($term) {
                $q->where('sku', 'like', $term)
                    ->orWhere('label', 'like', $term)
                    ->orWhereHas('product', fn ($pq) => $pq->where('name', 'like', $term));
            })
            ->orderBy('product_id')
            ->orderBy('id')
            ->limit(25)
            ->get()
            ->mapWithKeys(fn (ProductVariant $v): array => [$v->id => static::renderVariantHtml($v)])
            ->all();
    }

    protected static function formatVariantOptionHtml(int $variantId): ?string
    {
        if ($variantId <= 0) {
            return null;
        }

        $variant = ProductVariant::with(['product.primaryImage', 'product.images'])->find($variantId);

        return $variant ? static::renderVariantHtml($variant) : null;
    }

    protected static function renderVariantHtml(ProductVariant $v): string
    {
        $p = $v->product;
        $raw = $v->image ?: ($p?->primaryImage?->path ?? $p?->images?->first()?->path);
        $imgUrl = $raw
            ? (str_starts_with($raw, 'http') ? $raw : asset('storage/' . ltrim(preg_replace('#^/?(?:(?:storage|public)/)+#', '', trim($raw)), '/')))
            : asset('brand/logo-circle.png');

        $vLabel = ($v->label && strcasecmp($v->label, 'Standard') !== 0) ? $v->label : null;
        $sub = [];
        if ($vLabel) {
            $sub[] = "Varian: {$vLabel}";
        }
        if ($v->sku) {
            $sub[] = "SKU: {$v->sku}";
        }
        $sub[] = 'Stok: ' . (int) ($v->stock ?? 0) . ' pcs';

        $safeName = e($p?->name ?? '-');
        $safeSub = e(implode(' • ', $sub));
        $safeImg = e($imgUrl);

        return "<div style=\"display:flex;align-items:center;gap:10px;\">"
            . "<img src=\"{$safeImg}\" alt=\"\" style=\"width:30px;height:30px;border-radius:6px;object-fit:cover;flex-shrink:0;border:1px solid rgba(0,0,0,0.08);\" />"
            . "<div style=\"min-width:0;line-height:1.25;\">"
            . "<div style=\"font-weight:600;\">{$safeName}</div>"
            . "<div style=\"font-size:11px;opacity:0.7;\">{$safeSub}</div>"
            . "</div></div>";
    }

    public function addItemToDocument(): void
    {
        $doc = $this->getFreshDocument();
        if (! $doc || ! $doc->isDraft()) {
            return;
        }

        $data = $this->addForm->getState();
        $variantId = (int) ($data['variant_id'] ?? 0);
        if ($variantId <= 0) {
            Notification::make()
                ->title('Pilih Produk Terlebih Dahulu')
                ->warning()
                ->send();
            return;
        }

        $variant = ProductVariant::with('product')->find($variantId);
        if (! $variant || ! $variant->product) {
            return;
        }

        $qty = max(1, (int) ($data['qty'] ?? 1));
        $inputCost = (float) ($data['unit_cost'] ?? 0);
        $cost = $doc->type === 'in'
            ? ($inputCost > 0 ? $inputCost : max(0, (float) ($variant->cost_price ?? 0)))
            : 0;

        $existing = StockDocumentItem::where('stock_document_id', $doc->id)
            ->where('product_variant_id', $variant->id)
            ->first();

        if ($existing) {
            $existing->qty += $qty;
            if ($doc->type === 'in' && $cost > 0) {
                $existing->unit_cost = $cost;
            }
            $existing->save();
        } else {
            StockDocumentItem::create([
                'stock_document_id' => $doc->id,
                'product_id' => $variant->product_id,
                'product_variant_id' => $variant->id,
                'qty' => $qty,
                'unit_cost' => $cost,
            ]);
        }

        // Clear any Livewire computed property cache so the new item renders immediately
        unset($this->document);

        $this->addForm->fill([
            'variant_id' => null,
            'unit_cost' => 0,
            'qty' => 1,
        ]);

        Notification::make()
            ->title('Produk ditambahkan ke draf')
            ->success()
            ->send();
    }

    public function updateItemQty(int $itemId, int $newQty): void
    {
        $doc = $this->getFreshDocument();
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

        unset($this->document);
    }

    public function removeItem(int $itemId): void
    {
        $doc = $this->getFreshDocument();
        if (! $doc || ! $doc->isDraft()) {
            return;
        }

        StockDocumentItem::where('stock_document_id', $doc->id)->where('id', $itemId)->delete();
        unset($this->document);
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
        $doc = $this->getFreshDocument();
        if (! $doc) {
            return;
        }

        try {
            $doc->postDocument(auth()->id());
            unset($this->document);
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
        $doc = $this->getFreshDocument();
        if (! $doc) {
            return;
        }

        try {
            $wasPosted = $doc->isPosted();
            $doc->cancelDocument(auth()->id());
            unset($this->document);
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
                $doc = $this->getFreshDocument();
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
                $doc = $this->getFreshDocument();
                if (! $doc || ! $doc->isDraft()) {
                    return;
                }

                $field = $arguments['field'] ?? '';
                if (in_array($field, ['document_date', 'supplier_name', 'transfer_to', 'reason', 'notes'], true)) {
                    $doc->update([$field => $data['value'] ?? null]);
                    unset($this->document);
                    Notification::make()
                        ->title('Informasi Diperbarui')
                        ->success()
                        ->send();
                }
            });
    }
}
