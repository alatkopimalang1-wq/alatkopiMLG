<?php

namespace App\Filament\Resources\ProductPurchases\Pages;

use App\Filament\Resources\ProductPurchases\ProductPurchaseResource;
use App\Models\Product;
use App\Models\ProductPurchase;
use App\Models\ProductPurchaseItem;
use App\Models\ProductVariant;
use App\Models\User;
use Filament\Actions\Action;
use Filament\Forms\Components\DatePicker;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Notifications\Notification;
use Filament\Resources\Pages\ViewRecord;
use Filament\Schemas\Components\Grid;
use Illuminate\Support\Facades\DB;

class ViewProductPurchase extends ViewRecord
{
    protected static string $resource = ProductPurchaseResource::class;

    protected string $view = 'filament.resources.product-purchases.pages.view-product-purchase';

    public string $selectedStatus = '';

    public string $purchaseDateInput = '';

    public function mount(int|string $record): void
    {
        parent::mount($record);

        /** @var ProductPurchase $po */
        $po = $this->getRecord();
        $po->load(['items.product', 'items.variant', 'user']);
        $this->selectedStatus = (string) $po->status;
        $this->purchaseDateInput = $po->purchase_date?->format('Y-m-d') ?? now()->format('Y-m-d');
    }

    public function getHeading(): string
    {
        return '';
    }

    public function getBreadcrumbs(): array
    {
        return [];
    }

    public function getMaxContentWidth(): ?string
    {
        return 'full';
    }

    public function togglePaid(): void
    {
        /** @var ProductPurchase $po */
        $po = $this->getRecord();
        $po->is_paid = ! $po->is_paid;
        $po->paid_at = $po->is_paid ? ($po->paid_at ?? now()->toDateString()) : null;
        $po->save();
        $po->refresh();

        Notification::make()
            ->title($po->is_paid ? 'Ditandai Sudah Bayar' : 'Ditandai Belum Bayar')
            ->success()
            ->send();
    }

    public function updatedSelectedStatus(string $value): void
    {
        if (! array_key_exists($value, ProductPurchase::STATUS_LABELS)) {
            return;
        }

        /** @var ProductPurchase $po */
        $po = $this->getRecord();

        if ($value === ProductPurchase::STATUS_DITERIMA && $po->status !== ProductPurchase::STATUS_DITERIMA) {
            $this->selectedStatus = (string) $po->status;

            Notification::make()
                ->title('Gunakan Menu Terima Barang')
                ->body('Status Diterima hanya dapat dilakukan melalui tombol "Terima Barang" dengan mengisi Tanggal Diterima dan Nama Penerima.')
                ->danger()
                ->send();

            return;
        }

        $restrictedWhenUnpaid = [
            ProductPurchase::STATUS_DIKIRIM,
            ProductPurchase::STATUS_DITERIMA,
            ProductPurchase::STATUS_SELESAI,
            ProductPurchase::STATUS_RETUR,
        ];

        if (! $po->is_paid && in_array($value, $restrictedWhenUnpaid, true)) {
            $this->selectedStatus = (string) $po->status;

            Notification::make()
                ->title('Pembayaran Belum Lunas')
                ->body('Status PO belum dapat diubah ke '.(ProductPurchase::STATUS_LABELS[$value] ?? $value).' sebelum status pembayaran ditandai Sudah Bayar.')
                ->danger()
                ->send();

            return;
        }

        $hadStock = $po->hasStockApplied();

        $po->status = $value;
        $po->save();
        $po->syncStockWithStatus();
        $po->load(['items.product', 'items.variant', 'user']);

        $hasStockNow = $po->hasStockApplied();

        $body = 'Status PO diubah menjadi '.ProductPurchase::STATUS_LABELS[$value].'.';
        if (! $hadStock && $hasStockNow) {
            $body .= " Stok produk ditambahkan (+{$po->total_qty} pcs).";
        } elseif ($hadStock && ! $hasStockNow) {
            $body .= " Stok produk dikembalikan (-{$po->total_qty} pcs).";
        }

        Notification::make()
            ->title('Status PO Diperbarui')
            ->body($body)
            ->success()
            ->send();
    }

    public function updatedPurchaseDateInput(string $value): void
    {
        if (empty($value)) {
            return;
        }

        /** @var ProductPurchase $po */
        $po = $this->getRecord();
        $po->purchase_date = $value;
        $po->save();
        $po->refresh();

        Notification::make()
            ->title('Tanggal PO Diperbarui')
            ->success()
            ->send();
    }

    public function editSupplierAction(): Action
    {
        /** @var ProductPurchase $po */
        $po = $this->getRecord();

        return Action::make('editSupplier')
            ->label('Ubah')
            ->modalHeading('Ubah Informasi Supplier')
            ->modalSubmitActionLabel('Simpan')
            ->fillForm([
                'supplier_name' => $po->supplier_name,
                'supplier_phone' => $po->supplier_phone,
                'supplier_address' => $po->supplier_address,
            ])
            ->schema([
                TextInput::make('supplier_name')->label('Nama Supplier'),
                TextInput::make('supplier_phone')->label('Kontak'),
                Textarea::make('supplier_address')->label('Alamat')->rows(2),
            ])
            ->action(function (array $data) use ($po) {
                $po->update($data);
                $po->refresh();

                Notification::make()
                    ->title('Informasi Supplier Diperbarui')
                    ->success()
                    ->send();
            });
    }

    public function editReceivingAction(): Action
    {
        /** @var ProductPurchase $po */
        $po = $this->getRecord();

        return Action::make('editReceiving')
            ->label('Ubah')
            ->modalHeading('Info Penerimaan Produk')
            ->modalSubmitActionLabel('Simpan')
            ->fillForm([
                'received_date' => $po->received_date?->format('Y-m-d') ?? now()->format('Y-m-d'),
                'receipt_number' => $po->receipt_number,
                'receiver_name' => $po->receiver_name ?? auth()->user()?->name,
                'post_stock' => true,
            ])
            ->schema([
                DatePicker::make('received_date')
                    ->label('Tanggal Diterima')
                    ->default(now())
                    ->required(),
                TextInput::make('receipt_number')
                    ->label('No. Terima (Opsional)')
                    ->placeholder('contoh: EL123987'),
                TextInput::make('receiver_name')
                    ->label('Penerima')
                    ->placeholder('Contoh, Budi')
                    ->datalist(fn (): array => User::query()->orderBy('name')->pluck('name')->all())
                    ->required(),
                Toggle::make('post_stock')
                    ->label('Lanjut tambah stok masuk (Post Stok)')
                    ->helperText('Jika diaktifkan, stok produk otomatis bertambah dan status PO berubah menjadi Diterima.')
                    ->default(true)
                    ->disabled(fn (): bool => $po->hasStockApplied()),
            ])
            ->action(function (array $data) use ($po) {
                $hadStock = $po->hasStockApplied();
                $postStock = (bool) ($data['post_stock'] ?? false);

                $po->update([
                    'received_date' => $data['received_date'],
                    'receipt_number' => $data['receipt_number'],
                    'receiver_name' => $data['receiver_name'],
                ]);

                if ($postStock) {
                    if (! $po->is_paid) {
                        Notification::make()
                            ->title('Pembayaran Belum Lunas')
                            ->body('PO belum dibayar. Tandai Sudah Bayar terlebih dahulu sebelum menerima barang dan menambah stok.')
                            ->danger()
                            ->send();

                        return;
                    }
                    if (! $po->isStockInStatus()) {
                        $po->status = ProductPurchase::STATUS_DITERIMA;
                        $po->save();
                    }
                    $po->syncStockWithStatus();
                    $this->selectedStatus = (string) $po->status;
                }

                $po->load(['items.product', 'items.variant', 'user']);

                $body = 'Info penerimaan berhasil disimpan.';
                if ($postStock && ! $hadStock && $po->hasStockApplied()) {
                    $body = "Stok produk otomatis bertambah (+{$po->total_qty} pcs) dan status PO berubah menjadi Diterima.";
                }

                Notification::make()
                    ->title('Penerimaan Produk Disimpan')
                    ->body($body)
                    ->success()
                    ->send();
            });
    }

    public function editNotesAction(): Action
    {
        /** @var ProductPurchase $po */
        $po = $this->getRecord();

        return Action::make('editNotes')
            ->label('Ubah')
            ->modalHeading('Ubah Catatan PO')
            ->modalSubmitActionLabel('Simpan')
            ->fillForm([
                'notes' => $po->notes,
            ])
            ->schema([
                Textarea::make('notes')->label('Catatan')->rows(3),
            ])
            ->action(function (array $data) use ($po) {
                $po->update(['notes' => $data['notes'] ?? null]);
                $po->refresh();

                Notification::make()
                    ->title('Catatan Diperbarui')
                    ->success()
                    ->send();
            });
    }

    public function editDueDateAction(): Action
    {
        /** @var ProductPurchase $po */
        $po = $this->getRecord();

        return Action::make('editDueDate')
            ->label('Ubah')
            ->modalHeading('Ubah Jatuh Tempo')
            ->modalSubmitActionLabel('Simpan')
            ->fillForm([
                'due_date' => $po->due_date?->format('Y-m-d'),
            ])
            ->schema([
                DatePicker::make('due_date')->label('Tanggal Jatuh Tempo'),
            ])
            ->action(function (array $data) use ($po) {
                $po->update(['due_date' => $data['due_date'] ?? null]);
                $po->refresh();

                Notification::make()
                    ->title('Jatuh Tempo Diperbarui')
                    ->success()
                    ->send();
            });
    }

    public function editDiscountAction(): Action
    {
        /** @var ProductPurchase $po */
        $po = $this->getRecord();

        return Action::make('editDiscount')
            ->label('Diskon')
            ->modalHeading('Ubah Diskon PO')
            ->modalSubmitActionLabel('Simpan')
            ->fillForm([
                'discount_amount' => (float) $po->discount_amount,
            ])
            ->schema([
                TextInput::make('discount_amount')
                    ->label('Diskon Keseluruhan (IDR)')
                    ->numeric()
                    ->prefix('Rp')
                    ->minValue(0)
                    ->required(),
            ])
            ->action(function (array $data) use ($po) {
                if ($po->is_paid) {
                    Notification::make()->title('PO Sudah Dibayar')->body('Item dan diskon tidak dapat diubah setelah status Sudah Bayar.')->warning()->send();

                    return;
                }
                $po->discount_amount = max(0, (float) ($data['discount_amount'] ?? 0));
                $po->save();
                $po->recalculateTotals();
                $po->load(['items.product', 'items.variant', 'user']);

                Notification::make()
                    ->title('Diskon PO Diperbarui')
                    ->success()
                    ->send();
            });
    }

    public function addItemAction(): Action
    {
        /** @var ProductPurchase $po */
        $po = $this->getRecord();

        return Action::make('addItem')
            ->label('Tambah Produk')
            ->modalHeading('Tambah Produk ke PO')
            ->modalSubmitActionLabel('Tambahkan')
            ->schema([
                Select::make('product_id')
                    ->label('Produk Alat Kopi')
                    ->options(fn (): array => Product::query()
                        ->where('series', 'alat-kopi')
                        ->where(fn ($q) => $q->where('is_preorder', false)->orWhereNull('is_preorder'))
                        ->orderBy('name')
                        ->pluck('name', 'id')
                        ->all())
                    ->searchable()
                    ->preload()
                    ->live()
                    ->afterStateUpdated(function ($state, callable $set) {
                        if (! $state) {
                            $set('product_variant_id', null);
                            $set('unit_cost', 0);

                            return;
                        }
                        $variants = ProductVariant::where('product_id', $state)->get();
                        if ($variants->count() === 1) {
                            $first = $variants->first();
                            $set('product_variant_id', $first->id);
                            $set('unit_cost', (float) ($first->cost_price ?? 0));
                        } else {
                            $set('product_variant_id', null);
                            $set('unit_cost', 0);
                        }
                    })
                    ->required(),

                Select::make('product_variant_id')
                    ->label('Varian / Stok Saat Ini')
                    ->options(function (callable $get): array {
                        $productId = $get('product_id');
                        if (! $productId) {
                            return [];
                        }

                        return ProductVariant::where('product_id', $productId)
                            ->get()
                            ->mapWithKeys(fn (ProductVariant $v) => [
                                $v->id => "{$v->label} (Stok: ".((int) ($v->stock ?? 0)).' pcs)',
                            ])
                            ->all();
                    })
                    ->live()
                    ->afterStateUpdated(function ($state, callable $set) {
                        if (! $state) {
                            return;
                        }
                        $variant = ProductVariant::find($state);
                        if ($variant && $variant->cost_price !== null) {
                            $set('unit_cost', (float) $variant->cost_price);
                        }
                    })
                    ->required(),

                Grid::make(3)->schema([
                    TextInput::make('quantity')
                        ->label('Qty')
                        ->numeric()
                        ->minValue(1)
                        ->default(1)
                        ->required(),
                    TextInput::make('unit_cost')
                        ->label('Harga (IDR)')
                        ->numeric()
                        ->prefix('Rp')
                        ->minValue(0)
                        ->default(0)
                        ->required(),
                    TextInput::make('discount_amount')
                        ->label('Diskon (IDR)')
                        ->numeric()
                        ->prefix('Rp')
                        ->minValue(0)
                        ->default(0),
                ]),
            ])
            ->action(function (array $data) use ($po) {
                if ($po->is_paid) {
                    Notification::make()->title('PO Sudah Dibayar')->body('Produk tidak dapat ditambahkan setelah status Sudah Bayar.')->warning()->send();

                    return;
                }
                DB::transaction(function () use ($data, $po) {
                    $qty = max(1, (int) ($data['quantity'] ?? 1));
                    $cost = max(0, (float) ($data['unit_cost'] ?? 0));
                    $disc = max(0, (float) ($data['discount_amount'] ?? 0));

                    $po->items()->create([
                        'product_id' => (int) $data['product_id'],
                        'product_variant_id' => (int) $data['product_variant_id'],
                        'quantity' => $qty,
                        'unit_cost' => $cost,
                        'discount_amount' => $disc,
                        'subtotal' => max(0, ($qty * $cost) - $disc),
                    ]);

                    if ($po->hasStockApplied()) {
                        $po->adjustVariantStock(
                            (int) $data['product_id'],
                            (int) $data['product_variant_id'],
                            $qty,
                            $cost
                        );
                    }

                    $po->recalculateTotals();
                });

                $po->load(['items.product', 'items.variant', 'user']);

                Notification::make()
                    ->title('Produk Ditambahkan ke PO')
                    ->success()
                    ->send();
            });
    }

    public function editItemAction(): Action
    {
        /** @var ProductPurchase $po */
        $po = $this->getRecord();

        return Action::make('editItem')
            ->label('Ubah')
            ->modalHeading('Ubah Item Pesanan')
            ->modalSubmitActionLabel('Simpan')
            ->fillForm(function (array $arguments): array {
                $item = ProductPurchaseItem::find($arguments['itemId'] ?? 0);

                return [
                    'quantity' => (int) ($item?->quantity ?? 1),
                    'unit_cost' => (float) ($item?->unit_cost ?? 0),
                    'discount_amount' => (float) ($item?->discount_amount ?? 0),
                ];
            })
            ->schema([
                Grid::make(3)->schema([
                    TextInput::make('quantity')
                        ->label('Qty')
                        ->numeric()
                        ->minValue(1)
                        ->required(),
                    TextInput::make('unit_cost')
                        ->label('Harga (IDR)')
                        ->numeric()
                        ->prefix('Rp')
                        ->minValue(0)
                        ->required(),
                    TextInput::make('discount_amount')
                        ->label('Diskon (IDR)')
                        ->numeric()
                        ->prefix('Rp')
                        ->minValue(0)
                        ->default(0),
                ]),
            ])
            ->action(function (array $data, array $arguments) use ($po) {
                if ($po->is_paid) {
                    Notification::make()->title('PO Sudah Dibayar')->body('Produk yang sudah dimasukkan tidak dapat diedit setelah status Sudah Bayar.')->warning()->send();

                    return;
                }
                $item = ProductPurchaseItem::where('product_purchase_id', $po->id)
                    ->find($arguments['itemId'] ?? 0);

                if (! $item) {
                    return;
                }

                DB::transaction(function () use ($data, $item, $po) {
                    $oldQty = (int) $item->quantity;
                    $newQty = max(1, (int) ($data['quantity'] ?? 1));
                    $cost = max(0, (float) ($data['unit_cost'] ?? 0));
                    $disc = max(0, (float) ($data['discount_amount'] ?? 0));

                    $item->quantity = $newQty;
                    $item->unit_cost = $cost;
                    $item->discount_amount = $disc;
                    $item->subtotal = max(0, ($newQty * $cost) - $disc);
                    $item->save();

                    if ($po->hasStockApplied()) {
                        $delta = $newQty - $oldQty;
                        if ($delta !== 0 || $cost > 0) {
                            $po->adjustVariantStock(
                                (int) $item->product_id,
                                (int) $item->product_variant_id,
                                $delta,
                                $cost
                            );
                        }
                    }

                    $po->recalculateTotals();
                });

                $po->load(['items.product', 'items.variant', 'user']);

                Notification::make()
                    ->title('Item PO Diperbarui')
                    ->success()
                    ->send();
            });
    }

    public function deleteItemAction(): Action
    {
        /** @var ProductPurchase $po */
        $po = $this->getRecord();

        return Action::make('deleteItem')
            ->label('Hapus')
            ->requiresConfirmation()
            ->modalHeading('Hapus Item dari PO?')
            ->modalDescription('Item ini akan dihapus dari daftar produk pesanan.')
            ->action(function (array $arguments) use ($po) {
                if ($po->is_paid) {
                    Notification::make()->title('PO Sudah Dibayar')->body('Produk tidak dapat dihapus setelah status Sudah Bayar.')->warning()->send();

                    return;
                }
                if ($po->items()->count() <= 1) {
                    Notification::make()
                        ->title('Tidak Dapat Menghapus')
                        ->body('Minimal harus ada 1 item pada Purchase Order.')
                        ->warning()
                        ->send();

                    return;
                }

                $item = ProductPurchaseItem::where('product_purchase_id', $po->id)
                    ->find($arguments['itemId'] ?? 0);

                if (! $item) {
                    return;
                }

                DB::transaction(function () use ($item, $po) {
                    if ($po->hasStockApplied()) {
                        $po->adjustVariantStock(
                            (int) $item->product_id,
                            (int) $item->product_variant_id,
                            -(int) $item->quantity,
                            0
                        );
                    }
                    $item->delete();
                    $po->recalculateTotals();
                });

                $po->load(['items.product', 'items.variant', 'user']);

                Notification::make()
                    ->title('Item Dihapus')
                    ->success()
                    ->send();
            });
    }
}
