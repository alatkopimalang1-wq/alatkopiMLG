<?php

namespace App\Filament\Resources\Orders\Tables;

use App\Models\Order;
use App\Services\ShippingService;
use Filament\Actions\Action;
use Filament\Actions\ActionGroup;
use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Forms\Components\DatePicker;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Notifications\Notification;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Columns\ImageColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Table;

class OrdersTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('order_number')
                    ->label('No. Pesanan')
                    ->searchable()
                    ->sortable()
                    ->weight('bold')
                    ->copyable()
                    ->description(fn (Order $record) => $record->created_at?->format('d M Y, H:i')),

                TextColumn::make('customer_name')
                    ->label('Pelanggan')
                    ->searchable()
                    ->sortable()
                    ->weight('medium')
                    ->description(fn (Order $record) => $record->customer_phone),

                TextColumn::make('customer_phone')
                    ->label('WhatsApp')
                    ->searchable()
                    ->toggleable(isToggledHiddenByDefault: true),

                TextColumn::make('shipping_courier')
                    ->label('Pengiriman & Resi')
                    ->badge()
                    ->color(fn ($state) => str_contains(strtolower((string) $state), 'ambil') ? 'warning' : 'secondary')
                    ->formatStateUsing(fn ($state, $record) => $state ? "{$state}".($record->shipping_service ? " ({$record->shipping_service})" : '') : '-')
                    ->description(fn (Order $record) => $record->tracking_number ? "Resi: {$record->tracking_number}" : null)
                    ->copyable(fn (Order $record) => (bool) $record->tracking_number)
                    ->copyableState(fn (Order $record) => $record->tracking_number)
                    ->visibleFrom('md'),

                TextColumn::make('tracking_number')
                    ->label('No. Resi (AWB)')
                    ->badge()
                    ->color('info')
                    ->placeholder('-')
                    ->copyable()
                    ->searchable()
                    ->toggleable(isToggledHiddenByDefault: true),

                TextColumn::make('total_amount')
                    ->label('Total Tagihan')
                    ->money('IDR', locale: 'id')
                    ->sortable()
                    ->weight('bold')
                    ->description(fn (Order $record) => match ($record->payment_method) {
                        'qris' => 'QRIS Toko',
                        'bank_transfer' => 'Transfer '.strtoupper((string) ($record->payment_channel ?? 'Bank')),
                        'whatsapp' => 'WhatsApp',
                        default => ucfirst((string) $record->payment_method),
                    }),

                TextColumn::make('payment_method')
                    ->label('Metode Bayar')
                    ->badge()
                    ->formatStateUsing(fn (string $state, $record): string => match ($state) {
                        'qris' => 'QRIS Toko',
                        'bank_transfer' => 'Transfer '.strtoupper((string) ($record->payment_channel ?? 'Bank')),
                        'whatsapp' => 'WhatsApp',
                        default => ucfirst($state),
                    })
                    ->color(fn (string $state): string => match ($state) {
                        'qris' => 'primary',
                        'bank_transfer' => 'info',
                        default => 'gray',
                    })
                    ->toggleable(isToggledHiddenByDefault: true),

                TextColumn::make('payment_status')
                    ->label('Status Bayar')
                    ->badge()
                    ->color(fn (string $state): string => match ($state) {
                        'paid' => 'success',
                        'verifying' => 'warning',
                        'cancelled' => 'danger',
                        default => 'gray',
                    })
                    ->formatStateUsing(fn (string $state): string => match ($state) {
                        'pending' => 'Belum Bayar',
                        'verifying' => 'Cek Mutasi',
                        'paid' => 'Lunas',
                        'cancelled' => 'Batal',
                        default => ucfirst($state),
                    })
                    ->visibleFrom('md'),

                TextColumn::make('status')
                    ->label('Status Order')
                    ->badge()
                    ->color(fn (string $state): string => match ($state) {
                        'processing' => 'warning',
                        'ready_for_pickup' => 'primary',
                        'shipped' => 'info',
                        'completed' => 'success',
                        'cancelled' => 'danger',
                        default => 'gray',
                    })
                    ->formatStateUsing(fn (string $state, $record): string => match ($state) {
                        'pending' => 'Pending',
                        'processing' => 'Diproses',
                        'ready_for_pickup' => 'Siap Diambil di Toko',
                        'shipped' => ($record->shipping_courier === 'Ambil di Toko' ? 'Siap Diambil' : 'Dikirim'),
                        'completed' => 'Selesai',
                        'cancelled' => 'Batal',
                        default => ucfirst($state),
                    }),

                ImageColumn::make('payment_proof')
                    ->label('Bukti Transfer')
                    ->disk('public')
                    ->circular()
                    ->toggleable(isToggledHiddenByDefault: true),

                TextColumn::make('created_at')
                    ->label('Waktu Pemesanan')
                    ->dateTime('d M Y, H:i')
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            ->defaultSort('created_at', 'desc')
            ->filters([
                SelectFilter::make('payment_status')
                    ->label('Status Pembayaran')
                    ->options([
                        'pending' => 'Belum Bayar',
                        'verifying' => 'Menunggu Verifikasi',
                        'paid' => 'Lunas',
                        'cancelled' => 'Batal',
                    ]),
                SelectFilter::make('payment_method')
                    ->label('Metode Bayar')
                    ->options([
                        'qris' => 'QRIS Toko',
                        'bank_transfer' => 'Transfer Bank',
                        'whatsapp' => 'WhatsApp Order',
                    ]),
                SelectFilter::make('status')
                    ->label('Status Pesanan')
                    ->options([
                        'pending' => 'Pending',
                        'processing' => 'Diproses',
                        'shipped' => 'Dikirim',
                        'completed' => 'Selesai',
                        'cancelled' => 'Batal',
                    ]),
            ])
            ->actions([
                ActionGroup::make([
                    EditAction::make()
                        ->label('Detail & Edit Pesanan'),

                    // 1. Buat Resi (AWB)
                    Action::make('createShipment')
                        ->label(fn (Order $record) => $record->tracking_number ? 'Ubah AWB' : 'Buat Resi (AWB)')
                        ->icon(Heroicon::PaperAirplane)
                        ->color('success')
                        ->tooltip('Terbitkan nomor resi otomatis (Air Waybill) untuk pesanan ini')
                        ->visible(fn (Order $record) => ! str_contains(strtolower((string) $record->shipping_courier), 'ambil'))
                        ->requiresConfirmation()
                        ->modalHeading('Terbitkan Air Waybill (AWB)')
                        ->modalDescription(fn (Order $record) => "Terbitkan resi resmi untuk pesanan {$record->order_number} ({$record->shipping_courier} - {$record->shipping_service})?")
                        ->action(function (Order $record) {
                            $res = ShippingService::createShipmentOrder($record);
                            if (! empty($res['success'])) {
                                Notification::make()
                                    ->title('Resi Berhasil Diterbitkan!')
                                    ->body($res['message'])
                                    ->success()
                                    ->duration(6000)
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

                    // 2. Request Pick Up Kurir
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

                    // 3. Cetak Label Pengiriman Thermal AWB (100x150 mm)
                    Action::make('printLabel')
                        ->label('Cetak Label AWB Thermal')
                        ->icon(Heroicon::Printer)
                        ->color('warning')
                        ->tooltip('Buka label pengiriman siap cetak ukuran printer termal 100x150 mm')
                        ->url(fn (Order $record) => route('orders.shipping-label', ['orderNumber' => $record->order_number]))
                        ->openUrlInNewTab(),

                    // 4. Lacak Resi Live
                    Action::make('trackWaybill')
                        ->label('Lacak Resi Live')
                        ->icon(Heroicon::MagnifyingGlass)
                        ->color('info')
                        ->tooltip('Cek status & timeline perjalanan paket secara real-time')
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
                ])
                ->label('Kelola')
                ->icon(Heroicon::EllipsisVertical)
                ->color('primary')
                ->button(),
            ])
            ->bulkActions([
                BulkActionGroup::make([
                    DeleteBulkAction::make()
                        ->visible(fn () => auth()->user()?->isOwner() ?? false),
                ]),
            ]);
    }
}
