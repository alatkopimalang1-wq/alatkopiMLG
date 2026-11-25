<?php

namespace App\Filament\Resources\Orders\Pages;

use App\Filament\Concerns\RedirectsToPreviousUrl;
use App\Filament\Resources\Orders\OrderResource;
use App\Models\Order;
use App\Services\ShippingService;
use Filament\Actions\Action;
use Filament\Actions\DeleteAction;
use Filament\Forms\Components\DatePicker;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Notifications\Notification;
use Filament\Resources\Pages\EditRecord;
use Filament\Support\Icons\Heroicon;

class EditOrder extends EditRecord
{
    use RedirectsToPreviousUrl;

    protected static string $resource = OrderResource::class;

    protected function getHeaderActions(): array
    {
        return [
            // 1. Cetak Label AWB Thermal
            Action::make('printLabel')
                ->label('Cetak Label AWB')
                ->icon(Heroicon::Printer)
                ->color('warning')
                ->url(fn (Order $record) => route('orders.shipping-label', ['orderNumber' => $record->order_number]))
                ->openUrlInNewTab(),

            // 2. Lacak Resi Live
            Action::make('trackWaybill')
                ->label('Lacak Resi Live')
                ->icon(Heroicon::MagnifyingGlass)
                ->color('info')
                ->visible(fn (Order $record) => ! empty($record->tracking_number))
                ->modalHeading(fn (Order $record) => "Status Lacak Resi: {$record->tracking_number}")
                ->modalContent(fn (Order $record) => view('filament.orders.track-modal', [
                    'order' => $record,
                    'tracking' => ShippingService::trackWaybill(
                        $record->tracking_number,
                        $record->shipping_courier,
                        $record->customer_phone
                    ),
                ]))
                ->modalSubmitAction(false)
                ->modalCancelActionLabel('Tutup'),

            // 3. Request Pick Up Kurir
            Action::make('requestPickup')
                ->label('Request Pick Up Kurir')
                ->icon(Heroicon::Truck)
                ->color('warning')
                ->tooltip('Panggil kurir ekspedisi untuk menjemput paket di roastery via Biteship')
                ->visible(fn (Order $record) => ! str_contains(strtolower((string) $record->shipping_courier), 'ambil'))
                ->modalHeading(fn (Order $record) => "Request Pick Up Kurir (Biteship Live)")
                ->modalDescription(fn (Order $record) => "Panggil driver {$record->shipping_courier} untuk menjemput paket pesanan {$record->order_number} langsung ke Alat Kopi Malang via sistem Biteship.")
                ->form([
                    Select::make('pickup_type')
                        ->label('Waktu Penjemputan')
                        ->options([
                            'now' => '⚡ Jemput Sekarang (Instant / Segera)',
                            'scheduled' => '📅 Jadwalkan Tanggal & Jam Tertentu',
                        ])
                        ->default('now')
                        ->live()
                        ->required(),
                    DatePicker::make('pickup_date')
                        ->label('Tanggal Penjemputan')
                        ->default(now()->format('Y-m-d'))
                        ->visible(fn ($get) => $get('pickup_type') === 'scheduled')
                        ->required(fn ($get) => $get('pickup_type') === 'scheduled'),
                    Select::make('pickup_time')
                        ->label('Jam Penjemputan')
                        ->options([
                            '09:00' => 'Pagi (09:00 - 12:00 WIB)',
                            '13:00' => 'Siang (13:00 - 16:00 WIB)',
                            '16:00' => 'Sore (16:00 - 19:00 WIB)',
                        ])
                        ->default('13:00')
                        ->visible(fn ($get) => $get('pickup_type') === 'scheduled')
                        ->required(fn ($get) => $get('pickup_type') === 'scheduled'),
                    TextInput::make('notes')
                        ->label('Catatan untuk Driver / Titik Jemput')
                        ->default('Paket kopi Alat Kopi Malang. Ambil di kasir bar Ruko Tlogomas Kav 34.')
                        ->required(),
                ])
                ->action(function (Order $record, array $data) {
                    $res = ShippingService::requestCourierPickup($record, $data);
                    if (! empty($res['success'])) {
                        Notification::make()
                            ->title('Pick Up Kurir Terhubung ke Biteship!')
                            ->body($res['message'])
                            ->success()
                            ->duration(8000)
                            ->send();
                    } else {
                        Notification::make()
                            ->title('Gagal Request Pick Up ke Biteship')
                            ->body($res['message'] ?? 'Terjadi kendala saat menghubungi kurir via Biteship.')
                            ->danger()
                            ->duration(10000)
                            ->send();
                    }
                }),

            // 4. Terbitkan AWB
            Action::make('createShipment')
                ->label(fn (Order $record) => $record->tracking_number ? 'Perbarui AWB' : 'Buat Resi (AWB)')
                ->icon(Heroicon::PaperAirplane)
                ->color('success')
                ->visible(fn (Order $record) => ! str_contains(strtolower((string) $record->shipping_courier), 'ambil'))
                ->requiresConfirmation()
                ->modalHeading('Terbitkan Air Waybill (AWB)')
                ->action(function (Order $record) {
                    $res = ShippingService::createShipmentOrder($record);
                    if (! empty($res['success'])) {
                        Notification::make()
                            ->title('Resi Berhasil Diterbitkan!')
                            ->body($res['message'])
                            ->success()
                            ->send();
                    } else {
                        Notification::make()
                            ->title('Gagal Menerbitkan Resi')
                            ->body($res['message'] ?? 'Gagal membuat pesanan pengiriman di Biteship.')
                            ->danger()
                            ->duration(8000)
                            ->send();
                    }
                }),

            DeleteAction::make()
                ->visible(fn () => auth()->user()?->isOwner() ?? false),
        ];
    }
}
