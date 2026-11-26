<?php

namespace App\Filament\Pages;

use App\Models\ProductVariant;
use App\Support\BarcodeCode128;
use BackedEnum;
use Filament\Notifications\Notification;
use Filament\Pages\Page;
use Filament\Support\Icons\Heroicon;

class CetakBarcodeProduk extends Page
{
    protected static string|BackedEnum|null $navigationIcon = Heroicon::QrCode;

    protected static string|\UnitEnum|null $navigationGroup = 'Katalog & Toko';

    protected static ?string $navigationLabel = 'Cetak Barcode Produk';

    protected static ?string $title = 'Cetak Barcode Produk';

    protected static ?string $slug = 'cetak-barcode-produk';

    protected static ?int $navigationSort = 3;

    protected string $view = 'filament.pages.cetak-barcode-produk';

    public string $search = '';

    public ?int $selectedVariantId = null;

    public int $qty = 1;

    public string $labelSize = '50x30';

    public string $barcodeType = 'code128';

    public bool $showName = true;

    public bool $showPrice = true;

    public bool $showCode = true;

    /**
     * @var array<int, array<string, mixed>>
     */
    public array $queue = [];

    public function getVariantOptionsProperty()
    {
        return ProductVariant::query()
            ->with('product')
            ->whereHas('product', fn ($q) => $q->where('series', 'alat-kopi'))
            ->when(trim($this->search) !== '', function ($q) {
                $term = '%'.trim($this->search).'%';
                $q->where(function ($sub) use ($term) {
                    $sub->where('sku', 'like', $term)
                        ->orWhere('label', 'like', $term)
                        ->orWhereHas('product', fn ($pq) => $pq->where('name', 'like', $term));
                });
            })
            ->orderByDesc('id')
            ->limit(60)
            ->get();
    }

    public function selectVariant(int $variantId, string $label): void
    {
        $this->selectedVariantId = $variantId;
        $this->search = $label;
    }

    public function clearSelectedVariant(): void
    {
        $this->selectedVariantId = null;
        $this->search = '';
    }

    public function applyItem(): void
    {
        if (! $this->selectedVariantId) {
            Notification::make()
                ->title('Pilih Produk Terlebih Dahulu')
                ->warning()
                ->send();

            return;
        }

        $variant = ProductVariant::with('product')->find($this->selectedVariantId);
        if (! $variant || ! $variant->product) {
            Notification::make()
                ->title('Produk Tidak Ditemukan')
                ->danger()
                ->send();

            return;
        }

        $qty = max(1, min(200, (int) $this->qty));
        $code = ! empty($variant->sku)
            ? (string) $variant->sku
            : 'AKM-'.$variant->product_id.'-'.$variant->id;

        $variantLabel = strcasecmp((string) $variant->label, 'Standard') === 0
            ? ''
            : ' — '.$variant->label;

        $existingIndex = collect($this->queue)->search(fn ($row) => (int) $row['variant_id'] === (int) $variant->id);
        if ($existingIndex !== false) {
            $this->queue[$existingIndex]['qty'] = min(200, (int) $this->queue[$existingIndex]['qty'] + $qty);
        } else {
            $this->queue[] = [
                'variant_id' => $variant->id,
                'product_name' => $variant->product->name.$variantLabel,
                'code' => $code,
                'price' => (float) ($variant->price ?? 0),
                'qty' => $qty,
            ];
        }

        $this->qty = 1;

        Notification::make()
            ->title('Ditambahkan ke Daftar Cetak')
            ->body("{$variant->product->name}{$variantLabel} ({$qty}x)")
            ->success()
            ->send();
    }

    public function removeQueueItem(int $index): void
    {
        if (isset($this->queue[$index])) {
            unset($this->queue[$index]);
            $this->queue = array_values($this->queue);
        }
    }

    public function clearQueue(): void
    {
        $this->queue = [];
    }

    public function renderBarcodeSvg(string $code): string
    {
        return $this->barcodeType === 'qrcode'
            ? BarcodeCode128::qrSvg($code)
            : BarcodeCode128::svg($code);
    }
}
