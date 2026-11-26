<?php

namespace App\Filament\Pages;

use App\Models\Setting;
use BackedEnum;
use Filament\Actions\Action;
use Filament\Forms\Components\Repeater;
use Filament\Forms\Components\Textarea;
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
use Illuminate\Support\Facades\Cache;

class ManagePreorderTerms extends Page
{
    protected static string|BackedEnum|null $navigationIcon = Heroicon::DocumentText;

    protected static string|\UnitEnum|null $navigationGroup = 'Pengaturan';

    protected static ?string $navigationLabel = 'Syarat & Ketentuan Pre-Order';

    protected static ?string $title = 'Pengaturan Halaman Syarat & Ketentuan Pre-Order';

    protected static ?int $navigationSort = 13;

    /**
     * @var array<string, mixed>|null
     */
    public ?array $data = [];

    /**
     * @return array<string, mixed>
     */
    public static function defaultSettings(): array
    {
        return [
            'is_active' => true,
            'badge' => 'Informasi & Kebijakan Pre-Order',
            'title' => 'Syarat & Ketentuan Pre-Order',
            'subtitle' => 'Ketentuan pemesanan, pembayaran Down Payment (DP), estimasi kedatangan, serta pelunasan produk Pre-Order di Alat Kopi Malang.',
            'sections' => [
                [
                    'title' => '1. Ketentuan Umum Pre-Order',
                    'content' => 'Produk dengan label Pre-Order adalah produk yang dipesan terlebih dahulu karena stok sedang dalam proses pengiriman dari distributor/pabrikan atau diproduksi sesuai permintaan. Dengan melakukan checkout pada produk Pre-Order, pelanggan dianggap telah membaca dan menyetujui seluruh syarat & ketentuan yang berlaku.',
                ],
                [
                    'title' => '2. Pembayaran Down Payment (DP)',
                    'content' => "Pelanggan dapat memilih skema Down Payment (DP) mulai dari batas minimum yang ditetapkan pada masing-masing produk (30%, 50%, 70%) hingga 100% (Lunas).\n• Apabila dalam satu keranjang terdapat produk reguler (non Pre-Order) dan produk Pre-Order, produk reguler tetap dibayarkan penuh (100%) sedangkan potongan DP hanya berlaku untuk produk Pre-Order.\n• Pesanan Pre-Order dianggap sah dan masuk antrean apabila pembayaran DP (beserta ongkos kirim jika ada) telah terverifikasi.",
                ],
                [
                    'title' => '3. Estimasi Waktu Kedatangan & Pengiriman',
                    'content' => 'Estimasi waktu kedatangan barang Pre-Order dapat berbeda untuk setiap merek dan tipe alat kopi. Tim Alat Kopi Malang akan menginformasikan estimasi kedatangan serta pembaruan status pengiriman secara berkala melalui WhatsApp resmi.',
                ],
                [
                    'title' => '4. Pelunasan & Pengiriman Barang',
                    'content' => "Setelah barang Pre-Order tiba di gudang Alat Kopi Malang, admin akan menghubungi pelanggan untuk melakukan pelunasan sisa tagihan (jika memilih DP < 100%).\n• Pelunasan dilakukan maksimal 7 hari kalender setelah pemberitahuan barang ready.\n• Pengiriman barang dilakukan setelah sisa pelunasan terkonfirmasi.",
                ],
                [
                    'title' => '5. Pembatalan & Pengembalian Dana',
                    'content' => 'Pembatalan sepihak oleh pelanggan setelah pembayaran DP terverifikasi akan mengakibatkan uang DP hangus, kecuali apabila terjadi keterlambatan melebihi batas waktu yang disepakati atau kendala ketersediaan dari pihak prinsipal/distributor resmi.',
                ],
                [
                    'title' => '6. Garansi & Layanan Bantuan',
                    'content' => 'Seluruh produk Pre-Order tetap mendapatkan garansi sesuai ketentuan masing-masing produk. Jika ada pertanyaan mengenai status Pre-Order atau jadwal kedatangan, silakan hubungi WhatsApp resmi Alat Kopi Malang di +62 821-3209-5241.',
                ],
            ],
            'footer_note' => 'Butuh informasi lebih lanjut terkait ketersediaan atau estimasi Pre-Order? Hubungi tim kami melalui WhatsApp resmi di +62 821-3209-5241.',
        ];
    }

    public function mount(): void
    {
        $saved = Setting::get('page_preorder_terms', []);
        $defaults = static::defaultSettings();

        $this->form->fill(array_merge($defaults, is_array($saved) ? $saved : []));
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
        return $schema
            ->components([
                Section::make('Header Halaman')
                    ->description('Atur status aktif, judul, dan teks pengantar halaman Syarat & Ketentuan Pre-Order (/syarat-ketentuan-preorder).')
                    ->schema([
                        Toggle::make('is_active')
                            ->label('Aktifkan Halaman Syarat & Ketentuan Pre-Order')
                            ->default(true)
                            ->inline(false),
                        Grid::make(2)->schema([
                            TextInput::make('badge')
                                ->label('Label Badge Atas')
                                ->default('Informasi & Kebijakan Pre-Order')
                                ->required(),
                            TextInput::make('title')
                                ->label('Judul Halaman')
                                ->default('Syarat & Ketentuan Pre-Order')
                                ->required(),
                        ]),
                        Textarea::make('subtitle')
                            ->label('Subjudul / Deskripsi Singkat')
                            ->rows(2)
                            ->required(),
                    ]),

                Section::make('Poin Syarat & Ketentuan Pre-Order')
                    ->description('Tambahkan, ubah, urutkan, atau hapus poin-poin syarat & ketentuan Pre-Order yang ditampilkan kepada pelanggan.')
                    ->schema([
                        Repeater::make('sections')
                            ->label('Daftar Poin Ketentuan')
                            ->itemLabel(fn (array $state): ?string => ! empty($state['title']) ? $state['title'] : 'Poin Ketentuan')
                            ->schema([
                                TextInput::make('title')
                                    ->label('Judul Poin')
                                    ->placeholder('Contoh: 1. Ketentuan Umum Pre-Order')
                                    ->required(),
                                Textarea::make('content')
                                    ->label('Isi Ketentuan')
                                    ->rows(4)
                                    ->required(),
                            ])
                            ->collapsible()
                            ->reorderable()
                            ->addActionLabel('+ Tambah Poin Ketentuan')
                            ->columnSpanFull(),
                        Textarea::make('footer_note')
                            ->label('Catatan Penutup (Opsional)')
                            ->rows(2),
                    ]),
            ]);
    }

    public function save(): void
    {
        $data = $this->form->getState();

        Setting::set('page_preorder_terms', $data);
        Cache::forget('sanubari_settings');

        Notification::make()
            ->title('Syarat & Ketentuan Pre-Order Disimpan!')
            ->body('Perubahan konten halaman Syarat & Ketentuan Pre-Order telah diperbarui.')
            ->success()
            ->send();
    }

    protected function getFormActions(): array
    {
        return [
            Action::make('save')
                ->label('Simpan Pengaturan')
                ->submit('save'),
        ];
    }
}
