<?php

namespace App\Filament\Pages;

use App\Models\MarketplaceAccount;
use App\Services\ShopeeService;
use BackedEnum;
use Filament\Actions\Action;
use Filament\Forms\Components\Placeholder;
use Filament\Forms\Components\Select;
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

class ManageShopeeSettings extends Page
{
    protected static string|BackedEnum|null $navigationIcon = Heroicon::ShoppingBag;

    protected static string|\UnitEnum|null $navigationGroup = 'Pengaturan';

    protected static ?string $navigationLabel = 'Integrasi Shopee';

    protected static ?string $title = 'Integrasi Shopee Open Platform';

    protected static ?string $slug = 'manage-shopee-settings';

    protected static ?int $navigationSort = 16;

    /**
     * @var array<string, mixed> | null
     */
    public ?array $data = [];

    public function mount(): void
    {
        $account = ShopeeService::getOrCreateAccount();

        $partnerId = ($account->app_key === '1255048') ? '' : ($account->app_key ?? '');

        $this->form->fill([
            'partner_id' => $partnerId,
            'partner_key' => $account->app_secret ?? '',
            'environment' => $account->seller_base_region === 'TEST' ? 'testing' : 'production',
            'shop_id' => $account->shop_id ?? '',
            'shop_name' => $account->shop_name ?? '',
            'is_active' => (bool) $account->is_active,
            'auto_sync_stock' => (bool) $account->auto_sync_stock,
            'auto_sync_orders' => (bool) $account->auto_sync_orders,
            'redirect_url_domain' => 'https://sanubariroastery.co.id',
            'callback_url' => url('/api/marketplace/shopee/callback'),
            'webhook_url' => url('/api/marketplace/shopee/webhook'),
        ]);
    }

    protected function getHeaderActions(): array
    {
        $account = MarketplaceAccount::where('platform', 'shopee')->first();
        $service = new ShopeeService($account);

        return [
            Action::make('openAuthUrl')
                ->label('Hubungkan Toko Shopee')
                ->icon(Heroicon::ArrowTopRightOnSquare)
                ->color('warning')
                ->action(function () {
                    $this->save();

                    $account = MarketplaceAccount::where('platform', 'shopee')->first();
                    if (! $account || empty($account->app_key) || empty($account->app_secret) || $account->app_key === '1255048') {
                        Notification::make()
                            ->title('Kredensial Belum Lengkap')
                            ->body('Pastikan Anda sudah mengisi Partner ID dengan 2055519 dan Live Partner Key dari Shopee Console.')
                            ->danger()
                            ->send();

                        return null;
                    }

                    $service = new ShopeeService($account);
                    $authUrl = $service->getAuthorizationUrl();

                    if (empty($authUrl) || $authUrl === '#') {
                        Notification::make()
                            ->title('Gagal Membuat URL Otorisasi')
                            ->body('Kredensial Shopee tidak valid.')
                            ->danger()
                            ->send();

                        return null;
                    }

                    return redirect()->away($authUrl);
                })
                ->tooltip('Simpan dan buka halaman otorisasi resmi Seller Centre Shopee untuk memberi izin akses toko.'),

            Action::make('syncProducts')
                ->label('Tarik Produk Shopee')
                ->icon(Heroicon::ArrowDownTray)
                ->color('primary')
                ->action(function () use ($service) {
                    try {
                        $result = $service->syncProducts();
                        Notification::make()
                            ->title('Sinkronisasi Produk Berhasil!')
                            ->body("Berhasil menarik {$result['synced_count']} produk dari Shopee.")
                            ->success()
                            ->send();
                    } catch (\Throwable $e) {
                        Notification::make()
                            ->title('Gagal Menarik Produk Shopee')
                            ->body($e->getMessage())
                            ->danger()
                            ->send();
                    }
                }),

            Action::make('refreshShopInfo')
                ->label('Cek Status Toko')
                ->icon(Heroicon::ArrowPath)
                ->color('gray')
                ->action(function () use ($service) {
                    try {
                        $service->syncShopInfo();
                        $this->mount();
                        Notification::make()
                            ->title('Koneksi Shopee Aktif')
                            ->body("Toko terhubung: {$this->data['shop_name']} (Shop ID: {$this->data['shop_id']})")
                            ->success()
                            ->send();
                    } catch (\Throwable $e) {
                        Notification::make()
                            ->title('Koneksi Belum Terhubung')
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
        $account = MarketplaceAccount::where('platform', 'shopee')->first();
        $isConnected = $account?->isConnected() ?? false;

        return $schema
            ->components([
                Section::make('Status Koneksi Shopee')
                    ->icon(Heroicon::Signal)
                    ->schema([
                        Placeholder::make('connection_status')
                            ->label('Status Otorisasi')
                            ->content(fn () => $isConnected
                                ? "✅ Toko Shopee Terhubung: {$account->shop_name} (Shop ID: {$account->shop_id})"
                                : '⚠️ Belum Terhubung. Silakan isi Partner ID dan Partner Key di bawah, lalu klik "Hubungkan Toko Shopee" di pojok kanan atas.'),
                    ]),

                Section::make('Kredensial Shopee Open Platform')
                    ->description('Kredensial API didapatkan dari Shopee Open Platform Console (open.shopee.com) -> App Management.')
                    ->icon(Heroicon::Key)
                    ->schema([
                        Grid::make(2)->schema([
                            Select::make('environment')
                                ->label('Mode Lingkungan (Environment)')
                                ->options([
                                    'testing' => 'Testing / Sandbox (Test Partner ID)',
                                    'production' => 'Live / Production (Live Partner ID)',
                                ])
                                ->default('production')
                                ->required()
                                ->helperText('Pilih Live / Production jika ingin menghubungkan toko asli Sanubari.'),

                            TextInput::make('partner_id')
                                ->label('Partner ID')
                                ->placeholder('Contoh: 2055519')
                                ->required()
                                ->helperText('Didapatkan dari Shopee Console -> APP Key (Gunakan Live Partner_id).'),
                        ]),

                        TextInput::make('partner_key')
                            ->label('Partner Key (Secret Key)')
                            ->password()
                            ->revealable()
                            ->placeholder('Masukkan Partner Key dari Shopee Console')
                            ->required()
                            ->helperText('Klik ikon mata pada Shopee Console untuk melihat dan menyalin kunci ini.'),

                        Grid::make(2)->schema([
                            TextInput::make('shop_id')
                                ->label('Shop ID Terhubung')
                                ->readOnly()
                                ->placeholder('Terisi otomatis setelah toko dihubungkan'),

                            TextInput::make('shop_name')
                                ->label('Nama Toko Terhubung')
                                ->readOnly()
                                ->placeholder('Terisi otomatis setelah toko dihubungkan'),
                        ]),
                    ]),

                Section::make('URL Konfigurasi Shopee Console')
                    ->description('Salin nilai di bawah ini dan masukkan ke Shopee Open Platform Console.')
                    ->icon(Heroicon::Link)
                    ->schema([
                        TextInput::make('redirect_url_domain')
                            ->label('Test / Live Redirect URL Domain (Shopee Console)')
                            ->default('https://sanubariroastery.co.id')
                            ->readOnly()
                            ->copyable()
                            ->helperText('Masukkan domain ini pada kolom "Test / Live Redirect URL Domain" di Shopee Console.'),

                        Grid::make(2)->schema([
                            TextInput::make('callback_url')
                                ->label('Redirect / Callback URL Lengkap')
                                ->default(fn () => url('/api/marketplace/shopee/callback'))
                                ->readOnly()
                                ->copyable(),

                            TextInput::make('webhook_url')
                                ->label('Webhook URL')
                                ->default(fn () => url('/api/marketplace/shopee/webhook'))
                                ->readOnly()
                                ->copyable(),
                        ]),
                    ]),

                Section::make('Otomasi Sinkronisasi')
                    ->description('Atur sinkronisasi stok otomatis antara website Sanubari dan Shopee.')
                    ->icon(Heroicon::Bolt)
                    ->schema([
                        Grid::make(2)->schema([
                            Toggle::make('auto_sync_stock')
                                ->label('Otomatis Nolkan Stok di Shopee jika Habis di Website')
                                ->helperText('Saat produk di website berstatus Habis (Out of Stock), stok di Shopee otomatis diubah ke 0.')
                                ->default(true),

                            Toggle::make('auto_sync_orders')
                                ->label('Otomatis Tarik Pesanan Shopee')
                                ->helperText('Menarik pesanan Shopee secara berkala untuk pencatatan di website.')
                                ->default(true),
                        ]),
                        Toggle::make('is_active')
                            ->label('Aktifkan Integrasi Shopee')
                            ->default(true),
                    ]),
            ]);
    }

    public function save(): void
    {
        $data = $this->form->getState();

        $account = ShopeeService::getOrCreateAccount();
        $account->update([
            'app_key' => $data['partner_id'],
            'app_secret' => $data['partner_key'],
            'seller_base_region' => $data['environment'] === 'testing' ? 'TEST' : 'ID',
            'auto_sync_stock' => (bool) ($data['auto_sync_stock'] ?? true),
            'auto_sync_orders' => (bool) ($data['auto_sync_orders'] ?? true),
            'is_active' => (bool) ($data['is_active'] ?? true),
        ]);

        Notification::make()
            ->title('Pengaturan Shopee Berhasil Disimpan!')
            ->body('Kredensial Shopee telah diperbarui. Sekarang Anda dapat mengklik tombol "Hubungkan Toko Shopee" di atas.')
            ->success()
            ->send();
    }

    protected function getFormActions(): array
    {
        return [
            Action::make('save')
                ->label('Simpan Pengaturan')
                ->submit('save')
                ->color('primary'),
        ];
    }
}
