<?php

namespace App\Filament\Resources\ConsignmentSettlements\Pages;

use App\Filament\Resources\ConsignmentSettlements\ConsignmentSettlementResource;
use App\Models\ConsignmentSettlement;
use App\Models\OrderItem;
use App\Models\Product;
use Filament\Actions\Action;
use Filament\Actions\DeleteAction;
use Filament\Forms\Components\FileUpload;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Notifications\Notification;
use Filament\Resources\Pages\ViewRecord;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class ViewConsignmentSettlement extends ViewRecord
{
    protected static string $resource = ConsignmentSettlementResource::class;

    protected string $view = 'filament.resources.consignment-settlements.pages.view-consignment-settlement';

    public function mount(int|string $record): void
    {
        parent::mount($record);

        /** @var ConsignmentSettlement $settlement */
        $settlement = $this->getRecord();
        $settlement->load([
            'consignor.products.variants',
            'items.order',
            'items.product',
            'items.variant',
            'user',
        ]);
    }

    public function getHeading(): string
    {
        /** @var ConsignmentSettlement $settlement */
        $settlement = $this->getRecord();

        return "Settlement Konsinyasi: {$settlement->settlement_number}";
    }

    protected function getHeaderActions(): array
    {
        /** @var ConsignmentSettlement $settlement */
        $settlement = $this->getRecord();

        return [
            Action::make('print')
                ->label('Cetak Nota Rekap')
                ->icon('heroicon-o-printer')
                ->color('gray')
                ->url(fn (): string => route('admin.consignment-settlements.print', $settlement))
                ->openUrlInNewTab(),

            Action::make('markAsPaid')
                ->label('Tandai Lunas (Sudah Ditransfer)')
                ->icon('heroicon-o-check-circle')
                ->color('success')
                ->visible(fn (): bool => in_array($settlement->status, ['draft', 'confirmed'], true))
                ->form([
                    Select::make('payment_method')
                        ->label('Metode Transfer / Pembayaran')
                        ->options([
                            'bank_transfer' => 'Transfer Bank',
                            'cash' => 'Tunai (Kas Toko)',
                            'other' => 'Lainnya',
                        ])
                        ->default($settlement->payment_method ?: 'bank_transfer')
                        ->required(),
                    TextInput::make('payment_reference')
                        ->label('No. Referensi Transfer')
                        ->placeholder('Contoh: TRF-BCA-2026112801'),
                    FileUpload::make('payment_proof')
                        ->label('Bukti Transfer')
                        ->disk('public')
                        ->directory('consignment/payment-proofs')
                        ->image()
                        ->maxSize(5120),
                    Textarea::make('notes')
                        ->label('Catatan')
                        ->default($settlement->notes)
                        ->rows(2),
                ])
                ->action(function (array $data) use ($settlement) {
                    $settlement->update([
                        'status' => 'paid',
                        'paid_at' => now(),
                        'payment_method' => $data['payment_method'],
                        'payment_reference' => $data['payment_reference'] ?? null,
                        'payment_proof' => $data['payment_proof'] ?? $settlement->payment_proof,
                        'notes' => $data['notes'] ?? $settlement->notes,
                    ]);

                    Notification::make()
                        ->title('Settlement Ditandai Lunas')
                        ->body("Hak vendor sebesar Rp " . number_format($settlement->total_vendor_payout, 0, ',', '.') . " telah ditandai lunas.")
                        ->success()
                        ->send();
                }),

            Action::make('cancelSettlement')
                ->label('Batalkan Settlement')
                ->icon('heroicon-o-x-circle')
                ->color('danger')
                ->requiresConfirmation()
                ->modalHeading('Batalkan Settlement?')
                ->modalDescription('Item-item penjualan yang ada di dalam settlement ini akan dikembalikan ke status belum di-settle sehingga dapat direkap ulang di kemudian hari.')
                ->visible(fn (): bool => $settlement->status !== 'cancelled')
                ->action(function () use ($settlement) {
                    DB::transaction(function () use ($settlement) {
                        OrderItem::where('consignment_settlement_id', $settlement->id)
                            ->update([
                                'consignment_settled_at' => null,
                                'consignment_settlement_id' => null,
                            ]);

                        $settlement->update(['status' => 'cancelled']);
                    });

                    Notification::make()
                        ->title('Settlement Dibatalkan')
                        ->body('Status settlement telah diubah menjadi batal dan item penjualan telah dilepas.')
                        ->danger()
                        ->send();
                }),

            DeleteAction::make()
                ->label('Hapus')
                ->visible(fn (): bool => in_array($settlement->status, ['draft', 'cancelled'], true))
                ->before(function () use ($settlement) {
                    OrderItem::where('consignment_settlement_id', $settlement->id)
                        ->update([
                            'consignment_settled_at' => null,
                            'consignment_settlement_id' => null,
                        ]);
                }),
        ];
    }

    /**
     * Get live stock of all products deposited by this vendor.
     *
     * @return Collection<int, array<string, mixed>>
     */
    public function getVendorStockSummary(): Collection
    {
        /** @var ConsignmentSettlement $settlement */
        $settlement = $this->getRecord();
        $consignor = $settlement->consignor;

        if (! $consignor) {
            return collect();
        }

        return Product::query()
            ->where('is_consignment', true)
            ->where('consignor_id', $consignor->id)
            ->with(['variants'])
            ->get()
            ->map(function (Product $p) {
                $variants = $p->variants;
                $totalStock = $variants->isNotEmpty() ? $variants->sum('stock') : (int) ($p->stock ?? 0);

                return [
                    'id' => $p->id,
                    'name' => $p->name,
                    'variants_count' => $variants->count(),
                    'total_stock' => $totalStock,
                    'variants' => $variants->map(fn ($v) => [
                        'label' => $v->label,
                        'price' => (float) $v->price,
                        'stock' => (int) ($v->stock ?? 0),
                    ]),
                ];
            });
    }
}
