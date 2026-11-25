<?php

namespace App\Filament\Pages;

use App\Models\Setting;
use App\Services\BiteshipService;
use App\Services\ShippingService;
use BackedEnum;
use Filament\Actions\Action;
use Filament\Forms\Components\CheckboxList;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Forms\Components\ViewField;
use Filament\Notifications\Notification;
use Filament\Pages\Page;
use Filament\Schemas\Components\Actions;
use Filament\Schemas\Components\EmbeddedSchema;
use Filament\Schemas\Components\Form;
use Filament\Schemas\Components\Grid;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Illuminate\Support\Facades\Cache;

class ManageShippingSettings extends Page
{
    protected static string|BackedEnum|null $navigationIcon = Heroicon::Truck;

    protected static string|\UnitEnum|null $navigationGroup = 'Pengaturan';

    protected static ?string $navigationLabel = 'Pengaturan Pengiriman';

    protected static ?string $title = 'Pengaturan Pengiriman & Kurir Ekspedisi';

    protected static ?int $navigationSort = 12;

    /**
     * @var array<string, mixed> | null
     */
    public ?array $data = [];

    public function mount(): void
    {
        $config = ShippingService::getConfig();

        $this->form->fill([
            'shipping_delivery_enabled' => Setting::get('shipping_delivery_enabled', true),
            'pickup_in_store_enabled' => Setting::get('pickup_in_store_enabled', true),
            'pickup_store_name' => Setting::get('pickup_store_name', 'Alat Kopi Malang (Tlogomas, Malang)'),
            'pickup_store_address' => Setting::get('pickup_store_address', 'Ruko Tlogomas Square Kav. 34, Jl. Raya Tlogomas, Lowokwaru, Kota Malang, Jawa Timur 65144'),
            'pickup_store_hours' => Setting::get('pickup_store_hours', 'Buka setiap hari: 09.00 - 23.00 WIB'),
            'pickup_notes' => Setting::get('pickup_notes', 'Pesanan dapat diambil langsung di kasir Alat Kopi Malang dengan menunjukkan Nomor Pesanan setelah status pesanan Siap.'),
            'maps_url' => Setting::get('maps_url', 'https://maps.app.goo.gl/PMuxaEtsbEvC4APy7'),

            'shipping_origin_province_id' => $config['origin_province_id'],
            'shipping_origin_city_id' => $config['origin_city_id'],
            'shipping_origin_city' => $config['origin_city_name'],
            'shipping_origin_province' => $config['origin_province_name'],
            'shipping_origin_postal_code' => $config['origin_postal_code'],
            'shipping_origin_latitude' => $config['origin_latitude'],
            'shipping_origin_longitude' => $config['origin_longitude'],
            'gosend_min_cost' => $config['gosend_min_cost'],
            'gosend_rate_per_km' => $config['gosend_rate_per_km'],
            'gosend_max_distance_km' => $config['gosend_max_distance_km'],

            'shipping_couriers' => $config['couriers'],

            'free_shipping_enabled' => $config['free_shipping_enabled'],
            'free_shipping_min' => $config['free_shipping_min'],
            'free_shipping_zone' => $config['free_shipping_zone'],
            'free_shipping_max_subsidy' => $config['free_shipping_max_subsidy'],
            'shipping_handling_fee' => $config['handling_fee'],
            'shipping_default_weight_grams' => $config['default_weight_grams'],

            'shipping_sender_name' => Setting::get('shipping_sender_name', 'ALAT KOPI MALANG TLOGOMAS'),
            'shipping_sender_phone' => Setting::get('shipping_sender_phone', '0821-3209-5241'),
            'shipping_sender_address' => Setting::get('shipping_sender_address', 'Ruko Tlogomas Square Kav. 34, Jl. Raya Tlogomas, Lowokwaru, Kota Malang 65144'),

            'biteship_enabled' => Setting::get('biteship_enabled', false),
            'biteship_environment' => Setting::get('biteship_environment', 'production'),
            'biteship_api_key' => Setting::get('biteship_api_key', ''),
            'biteship_webhook_url' => url('/api/webhooks/biteship'),
            'biteship_webhook_secret' => Setting::get('biteship_webhook_secret', ''),
            'biteship_origin_postal_code' => Setting::get('biteship_origin_postal_code', '65144'),
            'biteship_origin_area_id' => Setting::get('biteship_origin_area_id', ''),
            'biteship_couriers' => Setting::get('biteship_couriers', ['jne', 'jnt', 'sicepat', 'anteraja', 'pos', 'jntcargo', 'grab', 'gosend']),
        ]);
    }

    protected function getHeaderActions(): array
    {
        return [
            Action::make('testBiteship')
                ->label('Uji Koneksi Biteship')
                ->icon(Heroicon::Bolt)
                ->color('primary')
                ->action(function () {
                    $key = $this->data['biteship_api_key'] ?? Setting::get('biteship_api_key');
                    $res = BiteshipService::testConnection($key);

                    if (! empty($res['success'])) {
                        Notification::make()
                            ->title('Koneksi Biteship Berhasil!')
                            ->body($res['message'])
                            ->success()
                            ->send();
                    } else {
                        Notification::make()
                            ->title('Koneksi Biteship Gagal')
                            ->body($res['message'])
                            ->danger()
                            ->send();
                    }
                }),
            Action::make('clearShippingCache')
                ->label('Segarkan Cache Tarif')
                ->icon(Heroicon::ArrowPath)
                ->color('gray')
                ->action(function () {
                    Cache::flush();

                    Notification::make()
                        ->title('Cache Tarif & Wilayah Dibersihkan')
                        ->body('Data tarif ongkos kirim dan wilayah telah disegarkan.')
                        ->success()
                        ->send();
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
        $provinceOptions = collect(ShippingService::getBuiltInProvinces())
            ->pluck('name', 'id')
            ->toArray();

        $cityOptions = collect(ShippingService::getBuiltInCities())
            ->mapWithKeys(fn ($c) => [$c['id'] => "{$c['type']} {$c['name']} ({$c['postal_code']})"])
            ->toArray();

        return $schema
            ->components([
                Section::make('Metode Pengiriman Website (Delivery & Pick Up Toko)')
                    ->description('Atur ketersediaan opsi pengiriman kurir (Delivery) dan opsi ambil di toko (Pick Up) untuk pelanggan di website.')
                    ->icon(Heroicon::ShoppingBag)
                    ->schema([
                        Grid::make(2)->schema([
                            Toggle::make('shipping_delivery_enabled')
                                ->label('Aktifkan Pengiriman Kurir / Delivery')
                                ->helperText('Izinkan pelanggan memesan dengan pengiriman kurir ekspedisi dan kurir instan GoSend.')
                                ->default(true),
                            Toggle::make('pickup_in_store_enabled')
                                ->label('Aktifkan Ambil di Toko (Self Pick Up)')
                                ->helperText('Izinkan pelanggan mengambil pesanan sendiri di gerai Alat Kopi Malang tanpa ongkos kirim.')
                                ->default(true),
                        ]),
                        Grid::make(2)->schema([
                            TextInput::make('pickup_store_name')
                                ->label('Nama Gerai / Toko Pick Up')
                                ->default('Alat Kopi Malang (Tlogomas, Malang)')
                                ->required(),
                            TextInput::make('maps_url')
                                ->label('Tautan Google Maps Toko')
                                ->default('https://maps.app.goo.gl/PMuxaEtsbEvC4APy7'),
                        ]),
                        TextInput::make('pickup_store_address')
                            ->label('Alamat Lengkap Toko untuk Pick Up')
                            ->default('Ruko Tlogomas Square Kav. 34, Jl. Raya Tlogomas, Lowokwaru, Kota Malang, Jawa Timur 65144')
                            ->required(),
                        Grid::make(2)->schema([
                            TextInput::make('pickup_store_hours')
                                ->label('Jam Operasional Pengambilan')
                                ->default('Buka setiap hari: 09.00 - 23.00 WIB')
                                ->required(),
                            TextInput::make('pickup_notes')
                                ->label('Petunjuk Pengambilan Pelanggan')
                                ->default('Pesanan dapat diambil langsung di kasir Alat Kopi Malang dengan menunjukkan Nomor Pesanan setelah status pesanan Siap.'),
                        ]),
                    ]),

                Section::make('Lokasi Pengiriman Asal (Origin Roastery)')
                    ->description('Tentukan kota asal pengiriman paket biji kopi Alat Kopi Malang.')
                    ->icon(Heroicon::MapPin)
                    ->schema([
                        Grid::make(2)->schema([
                            Select::make('shipping_origin_province_id')
                                ->label('Provinsi Asal (Origin)')
                                ->options($provinceOptions)
                                ->default(18)
                                ->searchable()
                                ->required(),
                            Select::make('shipping_origin_city_id')
                                ->label('Kota / Kabupaten Asal (Origin)')
                                ->options($cityOptions)
                                ->default(391)
                                ->searchable()
                                ->required(),
                        ]),
                        Grid::make(3)->schema([
                            TextInput::make('shipping_origin_city')
                                ->label('Label Kota Asal (Tampilan Checkout)')
                                ->default('Kota Malang')
                                ->required(),
                            TextInput::make('shipping_origin_province')
                                ->label('Label Provinsi Asal')
                                ->default('Jawa Timur')
                                ->required(),
                            TextInput::make('shipping_origin_postal_code')
                                ->label('Kode Pos Asal')
                                ->default('65144')
                                ->required(),
                        ]),
                        ViewField::make('origin_map_picker')
                            ->view('filament.forms.components.map-picker')
                            ->columnSpanFull(),
                        Grid::make(5)->schema([
                            TextInput::make('shipping_origin_latitude')
                                ->label('Latitude Titik Roastery (Pinpoint GoSend)')
                                ->numeric()
                                ->default(-7.9327)
                                ->helperText('Default Tlogomas, Malang: -7.9327'),
                            TextInput::make('shipping_origin_longitude')
                                ->label('Longitude Titik Roastery (Pinpoint GoSend)')
                                ->numeric()
                                ->default(112.6037)
                                ->helperText('Default Tlogomas, Malang: 112.6037'),
                            TextInput::make('gosend_min_cost')
                                ->label('Tarif Minimum GoSend Instant (0-4 km)')
                                ->numeric()
                                ->prefix('Rp')
                                ->default(12000),
                            TextInput::make('gosend_rate_per_km')
                                ->label('Tarif GoSend per KM (>4 km)')
                                ->numeric()
                                ->prefix('Rp')
                                ->default(2500),
                            TextInput::make('gosend_max_distance_km')
                                ->label('Radius Maks. GoSend Instant')
                                ->numeric()
                                ->suffix('km')
                                ->default(25),
                        ]),
                    ]),

                Section::make('Integrasi Kurir Biteship (API Gateway Multi-Ekspedisi)')
                    ->description('Hubungkan toko ke API Biteship untuk perhitungan ongkos kirim real-time, pencarian area otomatis, dan pelacakan kurir terpadu.')
                    ->icon(Heroicon::Bolt)
                    ->schema([
                        Toggle::make('biteship_enabled')
                            ->label('Aktifkan Integrasi Biteship API')
                            ->helperText('Jika diaktifkan, tarif ongkir checkout akan dihitung otomatis secara live via server Biteship.')
                            ->default(false),
                        Grid::make(2)->schema([
                            Select::make('biteship_environment')
                                ->label('Mode Lingkungan (Environment)')
                                ->options([
                                    'production' => 'Production / Live (Aktif Nyata)',
                                    'testing' => 'Testing / Sandbox (Mode Percobaan)',
                                ])
                                ->default('production')
                                ->required(),
                            TextInput::make('biteship_api_key')
                                ->label('Biteship API Key')
                                ->password()
                                ->revealable()
                                ->placeholder('biteship_live.xxx atau biteship_test.xxx')
                                ->helperText('Dapatkan kunci API dari dashboard biteship.com -> Developer.')
                                ->required(),
                        ]),
                        Grid::make(2)->schema([
                            TextInput::make('biteship_webhook_url')
                                ->label('Webhook URL (Masukkan di Dashboard Biteship)')
                                ->default(fn () => url('/api/webhooks/biteship'))
                                ->readOnly()
                                ->copyable()
                                ->helperText('Masukkan URL ini di Dashboard Biteship -> Integrations -> Webhook untuk update otomatis status pesanan & resi.')
                                ->dehydrated(false),
                            TextInput::make('biteship_webhook_secret')
                                ->label('Webhook Secret / Signature Key (Opsional)')
                                ->password()
                                ->revealable()
                                ->placeholder('Contoh: secret_biteship_xxxx')
                                ->helperText('Jika Anda mengonfigurasi Signature Header di dashboard Biteship, masukkan di sini untuk verifikasi keamanan request.'),
                        ]),
                        Grid::make(2)->schema([
                            TextInput::make('biteship_origin_postal_code')
                                ->label('Kode Pos Asal Gudang Biteship')
                                ->default('65144')
                                ->helperText('Default: 65144 (Tlogomas, Malang).'),
                        ]),
                        CheckboxList::make('biteship_couriers')
                            ->label('Kurir Biteship yang Diizinkan')
                            ->options(BiteshipService::SUPPORTED_COURIERS)
                            ->columns(3)
                            ->gridDirection('row')
                            ->bulkToggleable()
                            ->default(['jne', 'jnt', 'sicepat', 'anteraja', 'pos', 'jntcargo', 'grab', 'gosend']),
                    ]),

                Section::make('Ekspedisi / Kurir yang Diaktifkan')
                    ->description('Pilih ekspedisi pengiriman yang ingin ditampilkan kepada pelanggan pada halaman Checkout.')
                    ->icon(Heroicon::Truck)
                    ->schema([
                        CheckboxList::make('shipping_couriers')
                            ->label('Daftar Ekspedisi Aktif')
                            ->options(ShippingService::getAvailableCouriers())
                            ->columns(3)
                            ->gridDirection('row')
                            ->bulkToggleable()
                            ->required(),
                    ]),

                Section::make('Kebijakan Promo Gratis Ongkir & Biaya Packing')
                    ->description('Atur syarat minimal belanja untuk promo gratis ongkir, batas subsidi, dan biaya tambahan pengemasan.')
                    ->icon(Heroicon::Gift)
                    ->schema([
                        Toggle::make('free_shipping_enabled')
                            ->label('Aktifkan Promo Gratis / Subsidi Ongkir pada Layanan Reguler')
                            ->default(true),
                        Grid::make(3)->schema([
                            Select::make('free_shipping_zone')
                                ->label('Wilayah Promo Gratis Ongkir')
                                ->options([
                                    'java_only' => 'Khusus Pulau Jawa (Jatim, Jateng, DIY, Jabar, DKI, Banten)',
                                    'malang_only' => 'Khusus Malang Raya (Kota Malang, Kab. Malang, Kota Batu)',
                                    'all_indonesia' => 'Seluruh Wilayah Indonesia',
                                    'disabled' => 'Nonaktifkan Gratis Ongkir',
                                ])
                                ->default('java_only')
                                ->required(),
                            TextInput::make('free_shipping_min')
                                ->label('Minimal Belanja Gratis Ongkir (Rp)')
                                ->numeric()
                                ->prefix('Rp')
                                ->default(250000)
                                ->required(),
                            TextInput::make('free_shipping_max_subsidy')
                                ->label('Batas Maksimal Subsidi Ongkir (Rp)')
                                ->numeric()
                                ->prefix('Rp')
                                ->default(0)
                                ->helperText('Isi 0 untuk Gratis Ongkir penuh (Rp 0), atau isi nominal maksimal potongan (misal: 25000).'),
                        ]),
                        Grid::make(2)->schema([
                            TextInput::make('shipping_handling_fee')
                                ->label('Biaya Tambahan Packing / Handling Fee (Rp)')
                                ->numeric()
                                ->prefix('Rp')
                                ->default(0)
                                ->helperText('Ditambahkan otomatis ke tarif dasar kurir (isi 0 jika tidak ada biaya tambahan).'),
                            TextInput::make('shipping_default_weight_grams')
                                ->label('Berat Default Produk (Gram)')
                                ->numeric()
                                ->suffix('gram')
                                ->default(200)
                                ->required(),
                        ]),
                    ]),

                Section::make('Informasi Pengirim Paket (Label Resi & Pengiriman)')
                    ->description('Data identitas toko yang dicantumkan pada label resi dan pengiriman pesanan.')
                    ->icon(Heroicon::PaperAirplane)
                    ->schema([
                        Grid::make(3)->schema([
                            TextInput::make('shipping_sender_name')
                                ->label('Nama Toko Pengirim')
                                ->default('ALAT KOPI MALANG')
                                ->required(),
                            TextInput::make('shipping_sender_phone')
                                ->label('No. WhatsApp / HP Pengirim')
                                ->default('0821-3209-5241')
                                ->required(),
                            TextInput::make('shipping_sender_address')
                                ->label('Alamat Lengkap Pengirim')
                                ->default('Ruko Tlogomas Square Kav. 34, Jl. Raya Tlogomas, Lowokwaru, Kota Malang 65144')
                                ->required(),
                        ]),
                    ]),
            ]);
    }

    public function save(): void
    {
        $data = $this->form->getState();

        foreach ($data as $key => $value) {
            if ($key === 'biteship_webhook_url') {
                continue;
            }
            Setting::set($key, $value);
        }

        if (isset($data['shipping_couriers'])) {
            Setting::set('rajaongkir_couriers', $data['shipping_couriers']);
        }

        Cache::flush();

        Notification::make()
            ->title('Pengaturan Pengiriman Toko Disimpan!')
            ->body('Konfigurasi kurir aktif, tarif, dan aturan ongkos kirim berhasil diperbarui.')
            ->success()
            ->send();
    }

    protected function getFormActions(): array
    {
        return [
            Action::make('save')
                ->label('Simpan Pengaturan Pengiriman')
                ->submit('save'),
        ];
    }
}
