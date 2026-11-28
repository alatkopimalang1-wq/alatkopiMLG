<?php

namespace App\Filament\Resources\PosOrders\Tables;

use App\Models\Order;
use Filament\Actions\Action;
use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteAction;
use Filament\Actions\DeleteBulkAction;
use Filament\Forms\Components\DatePicker;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\Filter;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;

class PosOrdersTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('order_number')
                    ->label('No. Struk POS')
                    ->searchable()
                    ->sortable()
                    ->weight('bold')
                    ->copyable()
                    ->color('primary'),

                TextColumn::make('created_at')
                    ->label('Waktu Transaksi')
                    ->dateTime('d M Y, H:i')
                    ->visibleFrom('md')
                    ->sortable(),

                TextColumn::make('cashier_name')
                    ->label('Kasir')
                    ->getStateUsing(fn (Order $record) => $record->payment_details['cashier_name'] ?? $record->user?->name ?? 'Kasir Sanubari')
                    ->badge()
                    ->color('gray')
                    ->searchable(query: function (Builder $query, string $search): Builder {
                        return $query->where(function ($q) use ($search) {
                            $q->where('payment_details->cashier_name', 'like', "%{$search}%")
                                ->orWhereHas('user', fn ($u) => $u->where('name', 'like', "%{$search}%"));
                        });
                    })
                    ->visibleFrom('md'),

                TextColumn::make('customer_name')
                    ->label('Pelanggan')
                    ->searchable()
                    ->placeholder('Pelanggan Kasir')
                    ->formatStateUsing(fn ($state) => $state && $state !== 'Pelanggan Kasir' ? $state : 'Pelanggan Toko'),

                TextColumn::make('items_summary')
                    ->label('Menu / Produk')
                    ->getStateUsing(function (Order $record): string {
                        $items = $record->items;
                        if ($items->isEmpty()) {
                            return '-';
                        }

                        $parts = $items->map(function ($it) {
                            $cleanVar = trim((string) preg_replace('/\s*\(1\s*kg\s*custom[^)]*\)/i', '', (string) $it->variant_label));
                            $v = \App\Support\VariantHelper::formatLabel($cleanVar);
                            $variant = $v ? " ({$v})" : '';
                            return "{$it->quantity}x {$it->product_name}{$variant}";
                        });

                        return $parts->implode(', ');
                    })
                    ->limit(35)
                    ->tooltip(function (Order $record): string {
                        return $record->items->map(function ($it) {
                            $cleanVar = trim((string) preg_replace('/\s*\(1\s*kg\s*custom[^)]*\)/i', '', (string) $it->variant_label));
                            $v = \App\Support\VariantHelper::formatLabel($cleanVar);
                            $variant = $v ? " ({$v})" : '';
                            $price = number_format((float) $it->subtotal, 0, ',', '.');
                            return "{$it->quantity}x {$it->product_name}{$variant} - Rp {$price}";
                        })->implode("\n");
                    })
                    ->visibleFrom('md'),

                TextColumn::make('payment_method')
                    ->label('Metode Bayar')
                    ->badge()
                    ->formatStateUsing(fn (string $state, Order $record): string => match (strtolower($state)) {
                        'cash', 'tunai' => 'Tunai (Cash)',
                        'qris' => 'QRIS Kasir',
                        'debit' => 'Kartu Debit / EDC',
                        'bank_transfer' => 'Transfer Bank',
                        default => ucfirst($state),
                    })
                    ->color(fn (string $state): string => match (strtolower($state)) {
                        'cash', 'tunai' => 'success',
                        'qris' => 'primary',
                        'debit' => 'info',
                        'bank_transfer' => 'warning',
                        default => 'gray',
                    }),

                TextColumn::make('total_amount')
                    ->label('Total Transaksi')
                    ->money('IDR', locale: 'id')
                    ->sortable()
                    ->weight('black'),

                TextColumn::make('payment_status')
                    ->label('Status Bayar')
                    ->badge()
                    ->formatStateUsing(fn (string $state): string => match ($state) {
                        'paid' => 'Lunas',
                        'refunded' => 'Refund',
                        'cancelled' => 'Batal',
                        default => ucfirst($state),
                    })
                    ->color(fn (string $state): string => match ($state) {
                        'paid' => 'success',
                        'refunded' => 'danger',
                        'cancelled' => 'gray',
                        default => 'warning',
                    })
                    ->visibleFrom('md'),
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

                SelectFilter::make('payment_method')
                    ->label('Metode Pembayaran')
                    ->options([
                        'cash' => 'Tunai (Cash)',
                        'qris' => 'QRIS Toko',
                        'debit' => 'Kartu Debit / EDC',
                        'bank_transfer' => 'Transfer Bank',
                    ]),

                SelectFilter::make('payment_status')
                    ->label('Status Transaksi')
                    ->options([
                        'paid' => 'Lunas (Sukses)',
                        'refunded' => 'Dana Dikembalikan (Refund)',
                        'cancelled' => 'Dibatalkan',
                    ]),
            ])
            ->actions([
                Action::make('viewReceipt')
                    ->label('Lihat Struk')
                    ->icon(Heroicon::ReceiptPercent)
                    ->color('primary')
                    ->modalHeading(fn (Order $record) => "Rincian Transaksi POS #{$record->order_number}")
                    ->modalWidth('lg')
                    ->modalContent(fn (Order $record) => view('filament.pos-orders.receipt-modal', ['order' => $record]))
                    ->modalSubmitAction(false),

                Action::make('printInvoice')
                    ->label('Cetak Invoice')
                    ->icon(Heroicon::Printer)
                    ->color('gray')
                    ->url(fn (Order $record) => route('orders.show', $record->order_number))
                    ->openUrlInNewTab(),

                DeleteAction::make()
                    ->label('Hapus')
                    ->modalHeading('Hapus Transaksi POS')
                    ->modalDescription('Apakah Anda yakin ingin menghapus data transaksi POS ini? Stok barang akan otomatis dikembalikan ke inventori toko.')
                    ->visible(fn () => auth()->user()?->isOwner() ?? false),
            ])
            ->bulkActions([
                BulkActionGroup::make([
                    DeleteBulkAction::make()
                        ->label('Hapus Transaksi Terpilih')
                        ->modalHeading('Hapus Transaksi POS Terpilih')
                        ->modalDescription('Apakah Anda yakin ingin menghapus transaksi POS yang dipilih? Stok barang akan otomatis dikembalikan ke inventori toko.')
                        ->visible(fn () => auth()->user()?->isOwner() ?? false),
                ]),
            ]);
    }
}
