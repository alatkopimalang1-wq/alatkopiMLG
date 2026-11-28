<?php

namespace App\Filament\Resources\EcommerceOrders\Tables;

use App\Models\Order;
use Filament\Actions\Action;
use Filament\Actions\ActionGroup;
use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteAction;
use Filament\Actions\DeleteBulkAction;
use Filament\Forms\Components\DatePicker;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Notifications\Notification;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\Filter;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;

class EcommerceOrdersTable
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
                    ->color('primary')
                    ->description(fn (Order $record) => ($record->payment_details['platform'] ?? 'TikTok Shop').' • '.$record->created_at?->format('d M Y, H:i')),

                TextColumn::make('customer_name')
                    ->label('Pembeli')
                    ->searchable()
                    ->sortable()
                    ->weight('semibold')
                    ->description(fn (Order $record) => $record->customer_phone ?: null),

                TextColumn::make('items_summary')
                    ->label('Produk Dipesan')
                    ->getStateUsing(function (Order $record): string {
                        $items = $record->items;
                        if ($items->isEmpty()) {
                            return 'Kopi Sanubari';
                        }

                        return $items->map(function ($it) {
                            $v = \App\Support\VariantHelper::formatLabel($it->variant_label);
                            return "{$it->quantity}x {$it->product_name}".($v ? " ({$v})" : '');
                        })->implode(', ');
                    })
                    ->limit(28)
                    ->tooltip(function (Order $record): string {
                        return $record->items->map(function ($it) {
                            $price = number_format((float) $it->subtotal, 0, ',', '.');
                            $v = \App\Support\VariantHelper::formatLabel($it->variant_label);
                            return "{$it->quantity}x {$it->product_name}".($v ? " ({$v})" : '')." - Rp {$price}";
                        })->implode("\n");
                    })
                    ->visibleFrom('md'),

                TextColumn::make('shipping_courier')
                    ->label('Kurir & Resi')
                    ->badge()
                    ->color('gray')
                    ->placeholder('TikTok Shipping')
                    ->description(fn (Order $record) => $record->tracking_number ? "Resi: {$record->tracking_number}" : null)
                    ->copyable(fn (Order $record) => (bool) $record->tracking_number)
                    ->copyableState(fn (Order $record) => $record->tracking_number)
                    ->visibleFrom('md'),

                TextColumn::make('total_amount')
                    ->label('Total')
                    ->money('IDR', locale: 'id')
                    ->sortable()
                    ->weight('bold'),

                TextColumn::make('status')
                    ->label('Status Order')
                    ->badge()
                    ->color(fn (string $state): string => match ($state) {
                        'processing' => 'warning',
                        'shipped' => 'info',
                        'completed' => 'success',
                        'cancelled' => 'danger',
                        default => 'gray',
                    })
                    ->formatStateUsing(fn (string $state): string => match ($state) {
                        'pending' => 'Menunggu Konfirmasi',
                        'processing' => 'Diproses',
                        'shipped' => 'Dikirim',
                        'completed' => 'Selesai',
                        'cancelled' => 'Dibatalkan',
                        default => ucfirst($state),
                    }),

                TextColumn::make('created_at')
                    ->label('Waktu Pesanan')
                    ->dateTime('d M Y, H:i')
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),

                TextColumn::make('platform')
                    ->label('Marketplace')
                    ->badge()
                    ->getStateUsing(fn (Order $record) => $record->payment_details['platform'] ?? 'TikTok Shop / Tokopedia')
                    ->color('info')
                    ->toggleable(isToggledHiddenByDefault: true),

                TextColumn::make('customer_phone')
                    ->label('No. Telepon')
                    ->searchable()
                    ->placeholder('-')
                    ->toggleable(isToggledHiddenByDefault: true),

                TextColumn::make('tracking_number')
                    ->label('No. Resi (AWB)')
                    ->badge()
                    ->color('secondary')
                    ->placeholder('-')
                    ->copyable()
                    ->searchable()
                    ->toggleable(isToggledHiddenByDefault: true),

                TextColumn::make('payment_status')
                    ->label('Status Bayar')
                    ->badge()
                    ->formatStateUsing(fn (string $state): string => match ($state) {
                        'paid' => 'Lunas (Escrow)',
                        'unpaid', 'pending' => 'Menunggu Pembayaran',
                        'cancelled' => 'Batal',
                        default => ucfirst($state),
                    })
                    ->color(fn (string $state): string => match ($state) {
                        'paid' => 'success',
                        'cancelled' => 'danger',
                        default => 'warning',
                    })
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            ->defaultSort('created_at', 'desc')
            ->filters([
                Filter::make('created_at')
                    ->form([
                        DatePicker::make('from_date')->label('Dari Tanggal'),
                        DatePicker::make('until_date')->label('Sampai Tanggal'),
                    ])
                    ->query(function (Builder $query, array $data): Builder {
                        return $query
                            ->when(
                                $data['from_date'] ?? null,
                                fn (Builder $query, $date): Builder => $query->whereDate('created_at', '>=', $date),
                            )
                            ->when(
                                $data['until_date'] ?? null,
                                fn (Builder $query, $date): Builder => $query->whereDate('created_at', '<=', $date),
                            );
                    }),

                SelectFilter::make('status')
                    ->label('Status Pesanan')
                    ->options([
                        'pending' => 'Menunggu Konfirmasi',
                        'processing' => 'Sedang Diproses',
                        'shipped' => 'Sedang Dikirim',
                        'completed' => 'Selesai',
                        'cancelled' => 'Dibatalkan',
                    ]),

                SelectFilter::make('payment_status')
                    ->label('Status Pembayaran')
                    ->options([
                        'paid' => 'Lunas (Escrow)',
                        'unpaid' => 'Belum Bayar',
                        'cancelled' => 'Batal',
                    ]),
            ])
            ->actions([
                ActionGroup::make([
                    Action::make('viewDetail')
                        ->label('Lihat Detail')
                        ->icon(Heroicon::Eye)
                        ->color('primary')
                        ->modalHeading(fn (Order $record) => "Rincian Pesanan Ecommerce #{$record->order_number}")
                        ->modalWidth('xl')
                        ->modalContent(fn (Order $record) => view('filament.ecommerce-orders.detail-modal', ['order' => $record]))
                        ->modalSubmitAction(false),

                    Action::make('updateTracking')
                        ->label('Input Resi')
                        ->icon(Heroicon::Truck)
                        ->color('info')
                        ->form([
                            TextInput::make('shipping_courier')
                                ->label('Nama Kurir / Ekspedisi')
                                ->default(fn (Order $record) => $record->shipping_courier ?: 'J&T Express')
                                ->required(),
                            TextInput::make('tracking_number')
                                ->label('Nomor Resi Pengiriman (AWB)')
                                ->default(fn (Order $record) => $record->tracking_number)
                                ->required(),
                            Select::make('status')
                                ->label('Update Status Pesanan')
                                ->options([
                                    'processing' => 'Sedang Diproses & Dikemas',
                                    'shipped' => 'Dalam Pengiriman Kurir',
                                    'completed' => 'Pesanan Selesai',
                                ])
                                ->default('shipped')
                                ->required(),
                        ])
                        ->action(function (Order $record, array $data): void {
                            $record->update([
                                'shipping_courier' => $data['shipping_courier'],
                                'tracking_number' => $data['tracking_number'],
                                'status' => $data['status'],
                            ]);

                            Notification::make()
                                ->title('Resi & Status Pengiriman Diperbarui')
                                ->body("Pesanan #{$record->order_number} telah diupdate dengan nomor resi {$data['tracking_number']}.")
                                ->success()
                                ->send();
                        }),

                    Action::make('printInvoice')
                        ->label('Cetak Invoice')
                        ->icon(Heroicon::Printer)
                        ->color('gray')
                        ->url(fn (Order $record) => route('orders.show', $record->order_number))
                        ->openUrlInNewTab(),

                    DeleteAction::make()
                        ->label('Hapus')
                        ->modalHeading('Hapus Pesanan Ecommerce')
                        ->modalDescription('Apakah Anda yakin ingin menghapus data pesanan ini?')
                        ->visible(fn () => auth()->user()?->isOwner() ?? false),
                ])
                ->label('Kelola')
                ->icon('heroicon-m-ellipsis-vertical')
                ->color('primary')
                ->button(),
            ])
            ->bulkActions([
                BulkActionGroup::make([
                    DeleteBulkAction::make()
                        ->label('Hapus Pesanan Terpilih')
                        ->visible(fn () => auth()->user()?->isOwner() ?? false),
                ]),
            ]);
    }
}
