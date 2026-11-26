<?php

namespace App\Filament\Pages;

use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\StockAdjustment;
use BackedEnum;
use Filament\Actions\Action;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Notifications\Notification;
use Filament\Pages\Page;
use Filament\Support\Icons\Heroicon;
use Illuminate\Support\Facades\DB;

class InventoriStok extends Page
{
    protected static string|BackedEnum|null $navigationIcon = Heroicon::ClipboardDocumentList;

    protected static string|\UnitEnum|null $navigationGroup = 'Katalog & Toko';

    protected static ?string $navigationLabel = 'Inventori';

    protected static ?string $title = 'Inventori & Penyesuaian Stok';

    protected static ?string $slug = 'inventori';

    protected static ?int $navigationSort = 4;

    protected string $view = 'filament.pages.inventori-stok';

    public string $activeTab = 'stok'; // stok, riwayat

    public string $search = '';

    public string $stockFilter = 'all'; // all, in_stock, low_stock, out_of_stock, preorder

    public function getMaxContentWidth(): ?string
    {
        return 'full';
    }

    public function getStatsProperty(): array
    {
        $nonPreorderVariants = ProductVariant::query()
            ->whereHas('product', fn ($q) => $q->where('series', 'alat-kopi')->where(fn ($pq) => $pq->where('is_preorder', false)->orWhereNull('is_preorder')))
            ->get(['id', 'stock']);

        $totalVariants = ProductVariant::query()
            ->whereHas('product', fn ($q) => $q->where('series', 'alat-kopi'))
            ->count();

        $totalStock = (int) $nonPreorderVariants->sum(fn ($v) => max(0, (int) ($v->stock ?? 0)));
        $lowStock = $nonPreorderVariants->filter(fn ($v) => (int) ($v->stock ?? 0) > 0 && (int) ($v->stock ?? 0) <= 5)->count();
        $outOfStock = $nonPreorderVariants->filter(fn ($v) => (int) ($v->stock ?? 0) <= 0)->count();

        return [
            'total_variants' => $totalVariants,
            'total_stock' => $totalStock,
            'low_stock' => $lowStock,
            'out_of_stock' => $outOfStock,
        ];
    }

    public function getVariantsProperty()
    {
        $query = ProductVariant::query()
            ->with(['product.primaryImage', 'product.images'])
            ->whereHas('product', fn ($q) => $q->where('series', 'alat-kopi'));

        if (trim($this->search) !== '') {
            $term = '%'.trim($this->search).'%';
            $query->where(function ($sub) use ($term) {
                $sub->where('sku', 'like', $term)
                    ->orWhere('label', 'like', $term)
                    ->orWhereHas('product', fn ($pq) => $pq->where('name', 'like', $term)->orWhere('origin', 'like', $term));
            });
        }

        if ($this->stockFilter === 'preorder') {
            $query->whereHas('product', fn ($q) => $q->where('is_preorder', true));
        } elseif ($this->stockFilter === 'in_stock') {
            $query->whereHas('product', fn ($q) => $q->where(fn ($pq) => $pq->where('is_preorder', false)->orWhereNull('is_preorder')))
                ->where('stock', '>', 5);
        } elseif ($this->stockFilter === 'low_stock') {
            $query->whereHas('product', fn ($q) => $q->where(fn ($pq) => $pq->where('is_preorder', false)->orWhereNull('is_preorder')))
                ->where('stock', '>', 0)
                ->where('stock', '<=', 5);
        } elseif ($this->stockFilter === 'out_of_stock') {
            $query->whereHas('product', fn ($q) => $q->where(fn ($pq) => $pq->where('is_preorder', false)->orWhereNull('is_preorder')))
                ->where(fn ($q) => $q->where('stock', '<=', 0)->orWhereNull('stock'));
        }

        return $query->orderByDesc('id')->get();
    }

    public function getAdjustmentsProperty()
    {
        return StockAdjustment::query()
            ->with(['product', 'variant', 'user'])
            ->orderByDesc('id')
            ->limit(100)
            ->get();
    }

    public function adjustStockAction(): Action
    {
        return Action::make('adjustStock')
            ->modalHeading(function (array $arguments): string {
                return match ($arguments['mode'] ?? 'in') {
                    'out' => 'Pengurangan Stok Manual',
                    'opname' => 'Stok Opname (Set Stok Fisik)',
                    default => 'Penambahan Stok Manual',
                };
            })
            ->modalSubmitActionLabel('Simpan Perubahan Stok')
            ->fillForm(function (array $arguments): array {
                $variant = ProductVariant::find($arguments['variantId'] ?? 0);
                $mode = $arguments['mode'] ?? 'in';

                return [
                    'qty' => $mode === 'opname' ? (int) ($variant?->stock ?? 0) : 1,
                    'reason' => match ($mode) {
                        'out' => 'Barang Rusak / Selisih',
                        'opname' => 'Stok Opname',
                        default => 'Penyesuaian Stok Masuk',
                    },
                ];
            })
            ->schema(function (array $arguments): array {
                $variant = ProductVariant::with('product')->find($arguments['variantId'] ?? 0);
                $mode = $arguments['mode'] ?? 'in';
                $current = (int) ($variant?->stock ?? 0);
                $vLabel = $variant && strcasecmp((string) $variant->label, 'Standard') !== 0
                    ? " ({$variant->label})"
                    : '';

                $qtyLabel = match ($mode) {
                    'out' => "Jumlah Pengurangan (Stok saat ini: {$current} pcs)",
                    'opname' => "Jumlah Stok Fisik Baru (Stok sistem: {$current} pcs)",
                    default => "Jumlah Penambahan (Stok saat ini: {$current} pcs)",
                };

                return [
                    TextInput::make('product_info')
                        ->label('Produk')
                        ->default(($variant?->product?->name ?? 'Produk').$vLabel)
                        ->disabled()
                        ->dehydrated(false),

                    TextInput::make('qty')
                        ->label($qtyLabel)
                        ->numeric()
                        ->minValue($mode === 'opname' ? 0 : 1)
                        ->maxValue($mode === 'out' ? max(0, $current) : 99999)
                        ->required(),

                    Select::make('reason')
                        ->label('Alasan Penyesuaian')
                        ->options([
                            'Stok Opname' => 'Stok Opname',
                            'Penyesuaian Stok Masuk' => 'Penyesuaian Stok Masuk',
                            'Barang Rusak / Selisih' => 'Barang Rusak / Selisih',
                            'Barang Hilang' => 'Barang Hilang',
                            'Retur / Pengembalian Internal' => 'Retur / Pengembalian Internal',
                            'Lainnya' => 'Lainnya',
                        ])
                        ->required(),

                    Textarea::make('notes')
                        ->label('Catatan (Opsional)')
                        ->rows(2)
                        ->placeholder('Keterangan tambahan...'),
                ];
            })
            ->action(function (array $data, array $arguments) {
                $variantId = (int) ($arguments['variantId'] ?? 0);
                $mode = (string) ($arguments['mode'] ?? 'in');
                $inputQty = (int) ($data['qty'] ?? 0);

                DB::transaction(function () use ($variantId, $mode, $inputQty, $data) {
                    $variant = ProductVariant::with('product')->lockForUpdate()->find($variantId);
                    if (! $variant || ! $variant->product) {
                        return;
                    }

                    if ($variant->product->is_preorder) {
                        Notification::make()
                            ->title('Produk Pre-Order')
                            ->body('Produk Pre-Order menggunakan status Tersedia/Kosong, bukan qty stok.')
                            ->warning()
                            ->send();

                        return;
                    }

                    $before = max(0, (int) ($variant->stock ?? 0));

                    if ($mode === 'in') {
                        $change = max(1, $inputQty);
                        $after = $before + $change;
                    } elseif ($mode === 'out') {
                        $deduct = max(1, min($before, $inputQty));
                        $change = -$deduct;
                        $after = max(0, $before - $deduct);
                    } else {
                        $after = max(0, $inputQty);
                        $change = $after - $before;
                    }

                    $variant->stock = $after;
                    $variant->stock_status = $after > 0 ? 'in_stock' : 'out_of_stock';
                    $variant->save();

                    $product = Product::lockForUpdate()->find($variant->product_id);
                    if ($product) {
                        $product->syncStockFromVariants();
                    }

                    StockAdjustment::create([
                        'adjustment_number' => StockAdjustment::generateNumber(),
                        'product_id' => $variant->product_id,
                        'product_variant_id' => $variant->id,
                        'type' => $mode,
                        'qty_before' => $before,
                        'qty_change' => $change,
                        'qty_after' => $after,
                        'reason' => $data['reason'] ?? 'Penyesuaian Stok',
                        'notes' => $data['notes'] ?? null,
                        'user_id' => auth()->id(),
                    ]);

                    Notification::make()
                        ->title('Stok Berhasil Diperbarui')
                        ->body("{$variant->product->name}: {$before} pcs → {$after} pcs.")
                        ->success()
                        ->send();
                });
            });
    }
}
