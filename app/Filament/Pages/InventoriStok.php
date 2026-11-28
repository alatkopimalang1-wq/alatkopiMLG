<?php

namespace App\Filament\Pages;

use App\Models\OrderItem;
use App\Models\Product;
use App\Models\ProductPurchaseItem;
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

    public string $activeTab = 'stok'; // stok, pergerakan, riwayat

    public string $search = '';

    public string $stockFilter = 'all'; // all, in_stock, low_stock, out_of_stock, preorder

    public string $movementSource = 'all'; // all, purchase, sales, web_order, pos_order, marketplace_order, manual_in, manual_out, refund, marketplace_return, opname

    public string $movementSearch = '';

    public string $monthFilter = '';

    public string $startDate = '';

    public string $endDate = '';

    protected function getHeaderActions(): array
    {
        return [
            Action::make('stokMasuk')
                ->label('+ Stok Masuk (Banyak Produk / Konsinyasi)')
                ->icon(Heroicon::ArrowDownTray)
                ->color('success')
                ->url(\App\Filament\Resources\StockDocuments\StokMasukResource::getUrl('create')),

            Action::make('stokKeluar')
                ->label('- Stok Keluar (Banyak Produk)')
                ->icon(Heroicon::ArrowUpTray)
                ->color('danger')
                ->url(\App\Filament\Resources\StockDocuments\StokKeluarResource::getUrl('create')),
        ];
    }

    public function mount(): void
    {
        $this->monthFilter = now()->format('Y-m');
        $this->startDate = now()->startOfMonth()->toDateString();
        $this->endDate = now()->endOfMonth()->toDateString();
    }

    public function updatedMonthFilter(string $value): void
    {
        if (preg_match('/^\d{4}-\d{2}$/', $value)) {
            $carbon = \Carbon\Carbon::createFromFormat('Y-m', $value);
            $this->startDate = $carbon->copy()->startOfMonth()->toDateString();
            $this->endDate = $carbon->copy()->endOfMonth()->toDateString();
        }
    }

    public function resetMovementDates(): void
    {
        $this->monthFilter = '';
        $this->startDate = '';
        $this->endDate = '';
    }

    public function canAdjustStock(): bool
    {
        return (bool) auth()->user()?->isOwner();
    }

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

    public function getMovementsProperty()
    {
        $movements = collect();
        $startDt = $this->startDate !== '' ? \Carbon\Carbon::parse($this->startDate)->startOfDay() : null;
        $endDt = $this->endDate !== '' ? \Carbon\Carbon::parse($this->endDate)->endOfDay() : null;

        if (in_array($this->movementSource, ['all', 'purchase'], true)) {
            $purchaseItems = ProductPurchaseItem::query()
                ->with(['purchase.user', 'product', 'variant'])
                ->whereHas('purchase', function ($q) use ($startDt, $endDt) {
                    $q->whereNotNull('stock_applied_at');
                    if ($startDt) {
                        $q->where('stock_applied_at', '>=', $startDt);
                    }
                    if ($endDt) {
                        $q->where('stock_applied_at', '<=', $endDt);
                    }
                })
                ->whereHas('product', fn ($q) => $q->where('series', 'alat-kopi'))
                ->orderByDesc('id')
                ->limit(300)
                ->get();

            foreach ($purchaseItems as $pi) {
                $po = $pi->purchase;
                $dt = $po?->stock_applied_at ?? $pi->created_at;
                $movements->push([
                    'timestamp' => $dt?->timestamp ?? 0,
                    'date' => $dt?->format('d M Y, H:i') ?? '—',
                    'ref' => $po?->purchase_number ?? 'PO',
                    'source' => 'purchase',
                    'source_label' => 'Pembelian (PO)',
                    'product_name' => $pi->product?->name ?? 'Produk',
                    'variant_label' => $pi->variant?->label ?? 'Default',
                    'sku' => $pi->variant?->sku ?? '—',
                    'qty_change' => abs((int) $pi->quantity),
                    'actor' => $po?->user?->name ?? 'Admin',
                    'notes' => $po?->supplier_name ? "Supplier: {$po->supplier_name}" : ($po?->notes ?: 'Stok masuk PO'),
                ]);
            }
        }

        if (in_array($this->movementSource, ['all', 'sales', 'web_order', 'pos_order', 'marketplace_order', 'refund', 'refund_web_pos', 'marketplace_return'], true)) {
            $orderItems = OrderItem::query()
                ->with(['order', 'product', 'variant'])
                ->whereHas('product', fn ($q) => $q->where('series', 'alat-kopi')->where(fn ($pq) => $pq->where('is_preorder', false)->orWhereNull('is_preorder')))
                ->whereHas('order', function ($q) use ($startDt, $endDt) {
                    if ($startDt) {
                        $q->where(fn ($dq) => $dq->where('paid_at', '>=', $startDt)->orWhere('created_at', '>=', $startDt));
                    }
                    if ($endDt) {
                        $q->where(fn ($dq) => $dq->where('paid_at', '<=', $endDt)->orWhere('created_at', '<=', $endDt));
                    }
                })
                ->orderByDesc('id')
                ->limit(500)
                ->get();

            foreach ($orderItems as $oi) {
                $order = $oi->order;
                if (! $order) {
                    continue;
                }

                $details = is_array($order->payment_details) ? $order->payment_details : [];
                $orderNumber = (string) $order->order_number;

                // Cek Marketplace vs POS vs Website
                $isMarketplace = (bool) ($order->is_ecommerce
                    || str_starts_with($orderNumber, 'TTS-')
                    || str_starts_with($orderNumber, 'ECOM-')
                    || str_starts_with($orderNumber, 'SP-')
                    || str_starts_with($orderNumber, 'SHOP-')
                    || in_array(($details['source'] ?? null), ['tiktok', 'shopee', 'tokopedia', 'ecommerce'], true));

                $mpName = 'Marketplace';
                if (str_starts_with($orderNumber, 'TTS-') || ($details['source'] ?? '') === 'tiktok') {
                    $mpName = 'TikTok Shop';
                } elseif (str_starts_with($orderNumber, 'SP-') || str_starts_with($orderNumber, 'ECOM-') || ($details['source'] ?? '') === 'shopee') {
                    $mpName = 'Shopee';
                }

                $isPos = ! $isMarketplace && ($order->is_pos || str_starts_with($orderNumber, 'POS-') || ($details['source'] ?? null) === 'pos');
                $isWeb = ! $isMarketplace && ! $isPos;

                // Cek status Refund / Pembatalan / Retur paket
                $isCancelledOrRefunded = in_array($order->payment_status, ['refunded', 'cancelled'], true)
                    || in_array($order->status, ['refunded', 'cancelled'], true);

                if ($isMarketplace && $isCancelledOrRefunded) {
                    // Paket Marketplace yang dikembalikan (RTS / Cancelled / Refund)
                    $src = 'marketplace_return';
                    $srcLabel = "Paket MP Kembali ({$mpName})";
                    $qtyChange = abs((int) $oi->quantity); // Masuk kembali ke stok
                    $actor = "Kurir / {$mpName}";
                    $notes = "Paket Dikembalikan / Retur {$mpName} (" . ($order->status_label ?: 'Batal') . ")";
                    $allowedSources = ['all', 'refund', 'marketplace_return'];
                } elseif (! $isMarketplace && $isCancelledOrRefunded) {
                    // Refund / Pembatalan Web atau POS
                    $src = 'refund_web_pos';
                    $srcLabel = 'Refund / Retur';
                    $qtyChange = abs((int) $oi->quantity); // Masuk kembali ke stok
                    $actor = $isPos ? ($details['cashier_name'] ?? 'Kasir') : ($order->customer_name ?? 'Pelanggan');
                    $notes = "Refund / Retur Pesanan (" . ($order->status_label ?: 'Batal') . ")";
                    $allowedSources = ['all', 'refund', 'refund_web_pos'];
                } elseif ($isMarketplace) {
                    // Penjualan Marketplace Aktif
                    $src = 'marketplace_order';
                    $srcLabel = "Penjualan {$mpName}";
                    $qtyChange = -abs((int) $oi->quantity);
                    $actor = $order->customer_name ?: "Pelanggan {$mpName}";
                    $notes = "Pesanan {$mpName} (" . ($order->status_label ?: 'Diproses') . ")";
                    $allowedSources = ['all', 'sales', 'marketplace_order'];
                } elseif ($isPos) {
                    // Penjualan Kasir POS
                    $src = 'pos_order';
                    $srcLabel = 'Penjualan POS';
                    $qtyChange = -abs((int) $oi->quantity);
                    $actor = $details['cashier_name'] ?? 'Kasir';
                    $notes = 'Transaksi Kasir POS';
                    $allowedSources = ['all', 'sales', 'pos_order'];
                } else {
                    // Penjualan Website
                    if (! in_array($order->payment_status, ['paid', 'completed'], true) && ! in_array($order->status, ['processing', 'shipped', 'completed'], true)) {
                        continue;
                    }
                    $src = 'web_order';
                    $srcLabel = 'Penjualan Web';
                    $qtyChange = -abs((int) $oi->quantity);
                    $actor = $order->customer_name ?: 'Pelanggan Website';
                    $notes = 'Order Website Lunas';
                    $allowedSources = ['all', 'sales', 'web_order'];
                }

                if (! in_array($this->movementSource, $allowedSources, true)) {
                    continue;
                }

                $dt = $order->paid_at ?? $order->created_at;
                $movements->push([
                    'timestamp' => $dt?->timestamp ?? 0,
                    'date' => $dt?->format('d M Y, H:i') ?? '—',
                    'ref' => $order->order_number,
                    'source' => $src,
                    'source_label' => $srcLabel,
                    'product_name' => $oi->product_name ?: ($oi->product?->name ?? 'Produk'),
                    'variant_label' => $oi->variant_label ?: ($oi->variant?->label ?? 'Default'),
                    'sku' => $oi->variant?->sku ?? '—',
                    'qty_change' => $qtyChange,
                    'actor' => $actor,
                    'notes' => $notes,
                ]);
            }
        }

        if (in_array($this->movementSource, ['all', 'opname', 'manual_in', 'manual_out'], true)) {
            $adjQuery = StockAdjustment::query()
                ->with(['product', 'variant', 'user'])
                ->orderByDesc('id');

            if ($this->movementSource === 'opname') {
                $adjQuery->where('type', 'opname');
            } elseif ($this->movementSource === 'manual_in') {
                $adjQuery->where('type', 'in');
            } elseif ($this->movementSource === 'manual_out') {
                $adjQuery->where('type', 'out');
            }

            if ($startDt) {
                $adjQuery->where('created_at', '>=', $startDt);
            }
            if ($endDt) {
                $adjQuery->where('created_at', '<=', $endDt);
            }

            $adjs = $adjQuery->limit(300)->get();

            foreach ($adjs as $adj) {
                $src = match ($adj->type) {
                    'in' => 'manual_in',
                    'out' => 'manual_out',
                    default => 'opname',
                };
                $srcLabel = match ($adj->type) {
                    'in' => 'Penambahan Manual',
                    'out' => 'Pengurangan Manual',
                    default => 'Stok Opname',
                };
                $movements->push([
                    'timestamp' => $adj->created_at?->timestamp ?? 0,
                    'date' => $adj->created_at?->format('d M Y, H:i') ?? '—',
                    'ref' => $adj->adjustment_number,
                    'source' => $src,
                    'source_label' => $srcLabel,
                    'product_name' => $adj->product?->name ?? 'Produk',
                    'variant_label' => $adj->variant?->label ?? 'Default',
                    'sku' => $adj->variant?->sku ?? '—',
                    'qty_change' => (int) $adj->qty_change,
                    'actor' => $adj->user?->name ?? 'Admin',
                    'notes' => trim(($adj->reason ?? '').($adj->notes ? " — {$adj->notes}" : '')),
                ]);
            }
        }

        $q = strtolower(trim($this->movementSearch));
        if ($q !== '') {
            $movements = $movements->filter(function (array $m) use ($q) {
                return str_contains(strtolower($m['product_name']), $q)
                    || str_contains(strtolower($m['variant_label']), $q)
                    || str_contains(strtolower($m['sku']), $q)
                    || str_contains(strtolower($m['ref']), $q);
            });
        }

        return $movements->sortByDesc('timestamp')->take(300)->values();
    }

    public function adjustStockAction(): Action
    {
        return Action::make('adjustStock')
            ->authorize(fn (): bool => auth()->user()?->isOwner() ?? false)
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
                if (! auth()->user()?->isOwner()) {
                    Notification::make()
                        ->title('Akses Ditolak')
                        ->body('Hanya akun Owner yang berwenang melakukan penyesuaian stok manual.')
                        ->danger()
                        ->send();

                    return;
                }

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
