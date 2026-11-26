<?php

namespace App\Filament\Pages;

use App\Models\CashTransfer;
use App\Models\Order;
use BackedEnum;
use Carbon\Carbon;
use Filament\Actions\Action;
use Filament\Forms\Components\DateTimePicker;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Notifications\Notification;
use Filament\Pages\Page;
use Filament\Support\Icons\Heroicon;
use Illuminate\Support\Collection;
use Symfony\Component\HttpFoundation\StreamedResponse;

class LaporanKeuangan extends Page
{
    protected static string|BackedEnum|null $navigationIcon = Heroicon::Banknotes;

    protected static string|\UnitEnum|null $navigationGroup = 'Laporan';

    protected static ?string $navigationLabel = 'Laporan Keuangan';

    protected static ?string $title = 'Laporan Keuangan (Kas Rekening & Tunai)';

    protected static ?string $slug = 'laporan-keuangan';

    protected static ?int $navigationSort = 5;

    public string $period = 'all'; // all, today, yesterday, this_month, last_month, custom_range

    public string $startDate = '';

    public string $endDate = '';

    public string $cashTypeFilter = 'all'; // all, rekening, tunai

    public string $channelFilter = 'all'; // all, pos, web, marketplace

    public string $search = '';

    protected string $view = 'filament.pages.laporan-keuangan';

    public static function canAccess(): bool
    {
        /** @var \App\Models\User|null $user */
        $user = auth()->user();

        return (bool) ($user?->canViewReports());
    }

    public static function shouldRegisterNavigation(): bool
    {
        return static::canAccess();
    }

    public function getMaxContentWidth(): ?string
    {
        return 'full';
    }

    public function mount(): void
    {
        $this->startDate = now()->startOfMonth()->toDateString();
        $this->endDate = now()->toDateString();
    }

    public function setPeriod(string $period): void
    {
        $this->period = $period;
    }

    protected function getHeaderActions(): array
    {
        return [
            Action::make('transferKas')
                ->label('Transfer Kas')
                ->icon(Heroicon::ArrowsRightLeft)
                ->color('primary')
                ->modalHeading('Transfer Kas (Tunai ↔ Rekening)')
                ->modalDescription('Catat perpindahan dana antara Kas Tunai dan Kas Rekening tanpa mengubah total seluruh kas.')
                ->modalSubmitActionLabel('Simpan Transfer')
                ->form([
                    Select::make('direction')
                        ->label('Arah Transfer')
                        ->options([
                            'tunai_to_rekening' => 'Kas Tunai → Kas Rekening (Setor Tunai)',
                            'rekening_to_tunai' => 'Kas Rekening → Kas Tunai (Tarik Tunai)',
                        ])
                        ->default('tunai_to_rekening')
                        ->required(),
                    TextInput::make('amount')
                        ->label('Nominal Transfer (Rp)')
                        ->numeric()
                        ->minValue(1)
                        ->prefix('Rp')
                        ->required(),
                    DateTimePicker::make('transferred_at')
                        ->label('Tanggal & Waktu Transfer')
                        ->default(now())
                        ->required(),
                    Textarea::make('notes')
                        ->label('Catatan (Opsional)')
                        ->placeholder('Contoh: Setor uang tunai kasir ke BCA')
                        ->rows(2)
                        ->maxLength(255),
                ])
                ->action(function (array $data): void {
                    $direction = (string) ($data['direction'] ?? 'tunai_to_rekening');
                    $from = $direction === 'rekening_to_tunai' ? 'rekening' : 'tunai';
                    $to = $from === 'tunai' ? 'rekening' : 'tunai';

                    CashTransfer::create([
                        'from_account' => $from,
                        'to_account' => $to,
                        'amount' => max(0, (float) ($data['amount'] ?? 0)),
                        'notes' => ! empty($data['notes']) ? trim((string) $data['notes']) : null,
                        'transferred_at' => $data['transferred_at'] ?? now(),
                        'user_id' => auth()->id(),
                    ]);

                    Notification::make()
                        ->title('Transfer kas berhasil dicatat')
                        ->success()
                        ->send();
                }),
        ];
    }

    public function deleteTransfer(int $id): void
    {
        $transfer = CashTransfer::find($id);
        if ($transfer) {
            $transfer->delete();

            Notification::make()
                ->title('Riwayat transfer kas dihapus')
                ->success()
                ->send();
        }
    }

    /**
     * Resolve period date range, or null for all-time.
     *
     * @return array{0: Carbon, 1: Carbon}|null
     */
    protected function resolveDateRange(): ?array
    {
        return match ($this->period) {
            'today' => [now()->startOfDay(), now()->endOfDay()],
            'yesterday' => [now()->subDay()->startOfDay(), now()->subDay()->endOfDay()],
            'this_month' => [now()->startOfMonth(), now()->endOfDay()],
            'last_month' => [now()->subMonthNoOverflow()->startOfMonth(), now()->subMonthNoOverflow()->endOfMonth()],
            'custom_range' => [
                $this->startDate ? Carbon::parse($this->startDate)->startOfDay() : now()->startOfMonth(),
                $this->endDate ? Carbon::parse($this->endDate)->endOfDay() : now()->endOfDay(),
            ],
            default => null,
        };
    }

    public function getReportDataProperty(): array
    {
        $query = Order::query()->where('payment_status', 'paid');

        $range = $this->resolveDateRange();
        if ($range !== null) {
            $query->whereBetween('created_at', $range);
        }

        /** @var Collection<int, Order> $orders */
        $orders = $query->latest('created_at')->get();

        $rekeningSales = 0.0;
        $rekeningCount = 0;
        $rekeningByChannel = [
            'pos' => 0.0,
            'web' => 0.0,
            'marketplace' => 0.0,
        ];

        $tunaiSales = 0.0;
        $tunaiCount = 0;
        $tunaiByChannel = [
            'pos' => 0.0,
            'web' => 0.0,
            'marketplace' => 0.0,
        ];

        $rows = [];
        $search = trim(mb_strtolower($this->search));

        foreach ($orders as $order) {
            $method = strtolower(trim((string) ($order->payment_method ?? '')));
            $isCash = in_array($method, ['cash', 'tunai'], true);
            $cashType = $isCash ? 'tunai' : 'rekening';
            $amount = max(0.0, (float) ($order->total_amount ?? 0));

            if ($order->is_pos) {
                $channelKey = 'pos';
                $channelLabel = 'POS Kasir';
            } elseif ($order->is_ecommerce) {
                $channelKey = 'marketplace';
                $src = strtolower((string) ($order->payment_details['source'] ?? ''));
                $channelLabel = match (true) {
                    $src === 'shopee' => 'Marketplace (Shopee)',
                    $src === 'tokopedia' => 'Marketplace (Tokopedia)',
                    $src === 'tiktok' || str_starts_with((string) $order->order_number, 'TTS-') => 'Marketplace (TikTok)',
                    default => 'Marketplace',
                };
            } else {
                $channelKey = 'web';
                $channelLabel = 'Website';
            }

            if ($isCash) {
                $tunaiSales += $amount;
                $tunaiCount++;
                $tunaiByChannel[$channelKey] += $amount;
            } else {
                $rekeningSales += $amount;
                $rekeningCount++;
                $rekeningByChannel[$channelKey] += $amount;
            }

            if ($this->cashTypeFilter !== 'all' && $this->cashTypeFilter !== $cashType) {
                continue;
            }
            if ($this->channelFilter !== 'all' && $this->channelFilter !== $channelKey) {
                continue;
            }
            if ($search !== '') {
                $haystack = mb_strtolower(implode(' ', array_filter([
                    $order->order_number,
                    $order->customer_name,
                    $channelLabel,
                    $order->payment_method_label,
                ])));
                if (! str_contains($haystack, $search)) {
                    continue;
                }
            }

            $rows[] = [
                'id' => $order->id,
                'order_number' => $order->order_number,
                'date_time' => $order->created_at?->format('d/m/Y H:i') ?? '-',
                'channel_key' => $channelKey,
                'channel_label' => $channelLabel,
                'customer_name' => $order->customer_name ?: 'Pelanggan',
                'payment_method_label' => $order->payment_method_label,
                'cash_type' => $cashType,
                'cash_type_label' => $isCash ? 'Tunai' : 'Rekening',
                'amount' => $amount,
            ];
        }

        // Cash Transfers between Tunai & Rekening
        $transferQuery = CashTransfer::query()->with('user:id,name');
        if ($range !== null) {
            $transferQuery->whereBetween('transferred_at', $range);
        }
        $transfers = $transferQuery->latest('transferred_at')->get();

        $rekeningTransferNet = 0.0;
        $tunaiTransferNet = 0.0;
        $transferRows = [];

        foreach ($transfers as $t) {
            $amt = (float) $t->amount;
            if ($t->from_account === 'tunai' && $t->to_account === 'rekening') {
                $tunaiTransferNet -= $amt;
                $rekeningTransferNet += $amt;
                $dirLabel = 'Tunai → Rekening';
            } else {
                $rekeningTransferNet -= $amt;
                $tunaiTransferNet += $amt;
                $dirLabel = 'Rekening → Tunai';
            }

            $transferRows[] = [
                'id' => $t->id,
                'transferred_at' => $t->transferred_at?->format('d/m/Y H:i') ?? '-',
                'from_account' => $t->from_account,
                'to_account' => $t->to_account,
                'direction_label' => $dirLabel,
                'amount' => $amt,
                'notes' => $t->notes ?: '-',
                'user_name' => $t->user?->name ?? 'Admin',
            ];
        }

        $rekeningTotal = $rekeningSales + $rekeningTransferNet;
        $tunaiTotal = $tunaiSales + $tunaiTransferNet;
        $filteredTotal = array_sum(array_column($rows, 'amount'));

        return [
            'rekening_sales' => $rekeningSales,
            'rekening_transfer_net' => $rekeningTransferNet,
            'rekening_total' => $rekeningTotal,
            'rekening_count' => $rekeningCount,
            'rekening_by_channel' => $rekeningByChannel,
            'tunai_sales' => $tunaiSales,
            'tunai_transfer_net' => $tunaiTransferNet,
            'tunai_total' => $tunaiTotal,
            'tunai_count' => $tunaiCount,
            'tunai_by_channel' => $tunaiByChannel,
            'grand_total' => $rekeningTotal + $tunaiTotal,
            'total_count' => $rekeningCount + $tunaiCount,
            'filtered_total' => $filteredTotal,
            'rows' => $rows,
            'transfers' => $transferRows,
        ];
    }

    public function exportCsv(): StreamedResponse
    {
        $report = $this->reportData;
        $rows = $report['rows'];
        $filename = 'laporan-keuangan-' . now()->format('Y-m-d_His') . '.csv';

        return response()->streamDownload(function () use ($rows, $report) {
            $out = fopen('php://output', 'w');
            fwrite($out, "\xEF\xBB\xBF");

            fputcsv($out, [
                'No',
                'Tanggal',
                'No. Order',
                'Channel',
                'Pelanggan',
                'Metode Pembayaran',
                'Jenis Kas',
                'Nominal (Rp)',
            ]);

            foreach ($rows as $idx => $row) {
                fputcsv($out, [
                    $idx + 1,
                    $row['date_time'],
                    $row['order_number'],
                    $row['channel_label'],
                    $row['customer_name'],
                    $row['payment_method_label'],
                    $row['cash_type_label'],
                    (int) round($row['amount']),
                ]);
            }

            fputcsv($out, ['', '', '', '', '', '', 'TOTAL FILTER', (int) round($report['filtered_total'])]);
            fputcsv($out, ['', '', '', '', '', '', 'TOTAL KAS REKENING', (int) round($report['rekening_total'])]);
            fputcsv($out, ['', '', '', '', '', '', 'TOTAL KAS TUNAI', (int) round($report['tunai_total'])]);
            fputcsv($out, ['', '', '', '', '', '', 'TOTAL SELURUH KAS', (int) round($report['grand_total'])]);

            fclose($out);
        }, $filename, [
            'Content-Type' => 'text/csv; charset=UTF-8',
        ]);
    }
}
