<?php

namespace App\Filament\Pages;

use App\Models\MarketplaceAccount;
use App\Services\TikTokShopService;
use BackedEnum;
use Filament\Actions\Action;
use Filament\Forms\Components\Placeholder;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Notifications\Notification;
use Filament\Pages\Page;
use Filament\Schemas\Components\Actions;
use Filament\Schemas\Components\EmbeddedSchema;
use Filament\Schemas\Components\Form;
use Filament\Schemas\Components\Grid;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;

class ManageTikTokShopSettings extends Page
{
    protected static string|BackedEnum|null $navigationIcon = Heroicon::GlobeAlt;

    protected static string|\UnitEnum|null $navigationGroup = 'Pengaturan';

    protected static ?string $navigationLabel = 'Integrasi TikTok Shop';

    protected static ?string $title = 'Integrasi TikTok Shop & Tokopedia';

    protected static ?int $navigationSort = 15;

    /**
     * @var array<string, mixed> | null
     */
    public ?array $data = [];

    public function mount(): void
    {
        $account = TikTokShopService::getOrCreateAccount();

        $this->form->fill([
            'app_key' => $account->app_key ?? '6m01in2nrp7u2',
            'app_secret' => $account->app_secret ?? '',
            'service_id' => $account->service_id ?? '7710278786013234951',
            'is_active' => (bool) $account->is_active,
            'auto_sync_stock' => (bool) $account->auto_sync_stock,
            'auto_sync_orders' => (bool) $account->auto_sync_orders,
            'callback_url' => url('/api/marketplace/tiktok/callback'),
            'webhook_url' => url('/api/marketplace/tiktok/webhook'),
        ]);
    }

    protected function getHeaderActions(): array
    {
        $account = MarketplaceAccount::where('platform', 'tiktok')->first();
        $service = new TikTokShopService($account);
        $authUrl = $service->getAuthorizationUrl();

        return [
            Action::make('openAuthUrl')
                ->label('Buka Otorisasi TikTok')
                ->icon(Heroicon::ArrowTopRightOnSquare)
                ->color('primary')
                ->url($authUrl, shouldOpenInNewTab: true),

            Action::make('openPenerimaan')
                ->label('Penerimaan Pesanan TikTok')
                ->icon(Heroicon::InboxArrowDown)
                ->color('warning')
                ->url(PenerimaanPesananTikTok::getUrl())
                ->tooltip('Buka menu penerimaan pesanan untuk melihat dan menyimpan pesanan TikTok secara manual.'),

            Action::make('syncStock')
                ->label('Sinkronkan Stok ke TikTok')
                ->icon(Heroicon::ArrowPath)
                ->color('info')
                ->action(function () use ($service) {
                    try {
                        $result = $service->syncAllProductStock();
                        Notification::make()
                            ->title('Sinkronisasi Stok Selesai!')
                            ->body("{$result['updated']} varian berhasil diupdate, {$result['failed']} gagal.")
                            ->success()
                            ->send();
                    } catch (\Throwable $e) {
                        Notification::make()
                            ->title('Sinkronisasi Stok Gagal')
                            ->body($e->getMessage())
                            ->danger()
                            ->send();
                    }
                }),

            Action::make('syncProducts')
                ->label('Tarik Katalog Produk')
                ->icon(Heroicon::Square3Stack3d)
                ->color('gray')
                ->action(function () use ($service) {
                    try {
                        $result = $service->syncProductsFromTikTok();
                        Notification::make()
                            ->title('Katalog Produk Diperbarui!')
                            ->body("Berhasil menemukan {$result['total_products']} produk dan menghubungkan {$result['total_mapped']} SKU.")
                            ->success()
                            ->send();
                    } catch (\Throwable $e) {
                        Notification::make()
                            ->title('Gagal Menarik Produk')
                            ->body($e->getMessage())
                            ->danger()
                            ->send();
                    }
                }),
        ];
    }

    public function defaultForm(Schema $schema): Schema
    {
        return $schema->statePath('data');
    }

    public function content(Schema $schema): Schema
    {
        return $schema
            ->components([
                Form::make([EmbeddedSchema::make('form')])
                    ->id('form')
                    ->livewireSubmitHandler('save')
                    ->footer([
                        Actions::make($this->getFormActions())
                            ->key('form-actions'),
                    ]),
            ]);
    }

    public function form(Schema $schema): Schema
    {
        $account = MarketplaceAccount::where('platform', 'tiktok')->first();
        $isConnected = $account && $account->access_token && ! $account->isTokenExpired();

        return $schema
            ->components([
                Section::make('Status Koneksi & Akun Toko')
                    ->description('Ringkasan status akun TikTok Shop & Tokopedia yang terhubung.')
                    ->icon(Heroicon::CheckBadge)
                    ->schema([
                        Grid::make(3)->schema([
                            Placeholder::make('status_koneksi')
                                ->label('Status Otorisasi')
                                ->content(fn () => $isConnected
                                    ? '🟢 Terhubung & Aktif'
                                    : ($account?->access_token ? '🟡 Token Kedaluwarsa (Perlu Refresh)' : '🔴 Belum Terhubung')),

                            Placeholder::make('nama_toko')
                                ->label('Nama Toko')
                                ->content(fn () => $account?->shop_name ?: ($account?->name ?: 'Alat Kopi Malang Omnichannel')),

                            Placeholder::make('shop_id')
                                ->label('Shop ID / Region')
                                ->content(fn () => ($account?->shop_id ?: '-') . ' (' . ($account?->seller_base_region ?: 'ID') . ')'),

                            Placeholder::make('last_order_sync')
                                ->label('Terakhir Tarik Pesanan')
                                ->content(fn () => $account?->last_order_sync_at ? $account->last_order_sync_at->diffForHumans() : 'Belum pernah'),

                            Placeholder::make('last_stock_sync')
                                ->label('Terakhir Sinkron Stok')
                                ->content(fn () => $account?->last_stock_sync_at ? $account->last_stock_sync_at->diffForHumans() : 'Belum pernah'),

                            Placeholder::make('token_expiry')
                                ->label('Kedaluwarsa Token')
                                ->content(fn () => $account?->access_token_expires_at ? $account->access_token_expires_at->format('d M Y H:i') : '-'),
                        ]),
                    ]),

                Section::make('Kredensial Aplikasi (Kolom Aman & Terenkripsi)')
                    ->description('Masukkan data aplikasi dari TikTok Shop Partner Center. Rahasia aplikasi (App Secret) disimpan secara terenkripsi di server.')
                    ->icon(Heroicon::Key)
                    ->schema([
                        Grid::make(2)->schema([
                            TextInput::make('app_key')
                                ->label('Kunci Aplikasi (App Key)')
                                ->required()
                                ->default('6m01in2nrp7u2')
                                ->helperText('Kunci klien dari TikTok Shop Partner Center.'),

                            TextInput::make('app_secret')
                                ->label('Rahasia Aplikasi (App Secret)')
                                ->password()
                                ->revealable()
                                ->required()
                                ->helperText('Input aman. Tersimpan dengan enkripsi di database.'),

                            TextInput::make('service_id')
                                ->label('ID Layanan (Service ID)')
                                ->required()
                                ->default('7710278786013234951')
                                ->helperText('Service ID aplikasi Anda di TikTok Shop Partner.'),

                            Toggle::make('is_active')
                                ->label('Aktifkan Integrasi')
                                ->helperText('Aktifkan integrasi omnichannel untuk TikTok Shop.')
                                ->default(true),
                        ]),

                        Grid::make(2)->schema([
                            Toggle::make('auto_sync_orders')
                                ->label('Sinkronisasi Pesanan Masuk Otomatis')
                                ->helperText('Jika nonaktif, pesanan tidak akan masuk ke dashboard website sebelum Anda klik "Simpan Pesanan" di menu Penerimaan Pesanan TikTok.')
                                ->default(false),

                            Toggle::make('auto_sync_stock')
                                ->label('Sinkronisasi Stok Otomatis')
                                ->helperText('Otomatis kurangi dan update stok produk di marketplace.')
                                ->default(true),
                        ]),
                    ]),

                Section::make('Alur Otorisasi & URL Partner Center')
                    ->description('Salin URL berikut dan masukkan ke bagian Pengaturan Otorisasi & Webhook di TikTok Shop Partner Center.')
                    ->icon(Heroicon::Link)
                    ->schema([
                        Grid::make(2)->schema([
                            TextInput::make('callback_url')
                                ->label('URL Pengalihan (Redirect URL / Callback)')
                                ->readOnly()
                                ->copyable()
                                ->helperText('Tempel URL ini pada kolom Redirect URL di aplikasi Partner TikTok Shop.'),

                            TextInput::make('webhook_url')
                                ->label('URL Webhook Notifikasi')
                                ->readOnly()
                                ->copyable()
                                ->helperText('Tempel URL ini pada pengaturan Webhook pesanan.'),
                        ]),
                    ]),
            ]);
    }

    public function save(): void
    {
        $data = $this->form->getState();

        $account = TikTokShopService::getOrCreateAccount();

        $account->update([
            'app_key' => $data['app_key'] ?? $account->app_key,
            'app_secret' => $data['app_secret'] ?? $account->app_secret,
            'service_id' => $data['service_id'] ?? $account->service_id,
            'is_active' => (bool) ($data['is_active'] ?? true),
            'auto_sync_orders' => (bool) ($data['auto_sync_orders'] ?? true),
            'auto_sync_stock' => (bool) ($data['auto_sync_stock'] ?? true),
        ]);

        Notification::make()
            ->title('Pengaturan TikTok Shop Disimpan!')
            ->body('Kredensial dan alur sinkronisasi berhasil diperbarui secara aman.')
            ->success()
            ->send();
    }

    protected function getFormActions(): array
    {
        return [
            Action::make('save')
                ->label('Simpan Kredensial & Pengaturan')
                ->submit('save'),
        ];
    }
}
