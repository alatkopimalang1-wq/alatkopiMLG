<?php

namespace App\Filament\Pages\HalamanAwal;

use App\Filament\Pages\ManageEquipmentBrands;
use App\Models\Setting;
use BackedEnum;
use Filament\Actions\Action;
use Filament\Forms\Components\Placeholder;
use Filament\Forms\Components\Select;
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
use Illuminate\Support\HtmlString;

class ManageBrandPilihan extends Page
{
    protected static string|BackedEnum|null $navigationIcon = Heroicon::BookmarkSquare;

    protected static string|\UnitEnum|null $navigationGroup = 'Halaman Awal';

    protected static ?string $navigationLabel = 'Brand Pilihan';

    protected static ?string $title = 'Pengaturan Brand Pilihan (Beranda)';

    protected static ?int $navigationSort = 6;

    /**
     * @var array<string, mixed> | null
     */
    public ?array $data = [];

    public function mount(): void
    {
        $settings = Setting::all()->pluck('value', 'key')->toArray();

        $this->form->fill([
            'home_brand_pilihan_is_active' => (bool) ($settings['home_brand_pilihan_is_active'] ?? true),
            'home_brand_pilihan_title' => $settings['home_brand_pilihan_title'] ?? 'Brand Pilihan',
            'home_brand_pilihan_subtitle' => $settings['home_brand_pilihan_subtitle'] ?? 'Kumpulan merek alat kopi terkurasi yang tersedia di Alat Kopi Malang',
            'home_brand_pilihan_cta_label' => $settings['home_brand_pilihan_cta_label'] ?? 'Lihat Produk',
            'home_brand_pilihan_badge' => $settings['home_brand_pilihan_badge'] ?? 'BRAND PILIHAN',
            'home_brand_pilihan_slugs' => is_array($settings['home_brand_pilihan_slugs'] ?? null) ? $settings['home_brand_pilihan_slugs'] : [],
        ]);
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
                Section::make('Pengaturan Tampilan Brand Pilihan')
                    ->description('Atur visibilitas, judul, subjudul, dan label tombol slider 3D Brand Pilihan di bawah section Laris Manis.')
                    ->schema([
                        Toggle::make('home_brand_pilihan_is_active')
                            ->label('Tampilkan Section Brand Pilihan di Beranda')
                            ->default(true)
                            ->inline(false),

                        Grid::make(3)->schema([
                            TextInput::make('home_brand_pilihan_title')
                                ->label('Judul Bagian')
                                ->default('Brand Pilihan')
                                ->required(),

                            TextInput::make('home_brand_pilihan_cta_label')
                                ->label('Teks Tombol Kartu')
                                ->default('Lihat Produk')
                                ->required(),

                            TextInput::make('home_brand_pilihan_badge')
                                ->label('Label Subteks Kartu')
                                ->default('BRAND PILIHAN')
                                ->required(),
                        ]),

                        Textarea::make('home_brand_pilihan_subtitle')
                            ->label('Subjudul / Deskripsi')
                            ->default('Kumpulan merek alat kopi terkurasi yang tersedia di Alat Kopi Malang')
                            ->rows(2)
                            ->required(),
                    ]),

                Section::make('Kurasi Brand yang Ditampilkan')
                    ->description('Pilih brand spesifik dari daftar merek terdaftar, atau biarkan kosong untuk menampilkan semua brand aktif secara otomatis.')
                    ->schema([
                        Select::make('home_brand_pilihan_slugs')
                            ->label('Pilih Brand Tertentu (Opsional)')
                            ->helperText('Kosongkan untuk menampilkan seluruh brand aktif dari menu Merek / Brand Alat Kopi. Urutan pilihan menentukan urutan slide.')
                            ->multiple()
                            ->searchable()
                            ->preload()
                            ->options(fn () => collect(ManageEquipmentBrands::getActiveBrands())->pluck('name', 'slug')->all()),

                        Placeholder::make('manage_brands_link')
                            ->label('Kelola Daftar & Gambar Brand')
                            ->content(fn (): HtmlString => new HtmlString(
                                '<div class="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-200">'.
                                'Untuk menambah brand baru, mengubah nama, atau mengganti foto slide masing-masing brand, buka halaman '.
                                '<a href="'.e(ManageEquipmentBrands::getUrl()).'" class="font-semibold text-amber-400 underline hover:text-amber-300">Katalog & Toko &rarr; Merek / Brand Alat Kopi</a>.'.
                                '</div>'
                            )),
                    ]),
            ]);
    }

    public function save(): void
    {
        $data = $this->form->getState();

        foreach ($data as $key => $value) {
            Setting::set($key, $value);
        }

        Cache::forget('sanubari_settings');

        Notification::make()
            ->title('Pengaturan Brand Pilihan Disimpan!')
            ->body('Perubahan tampilan Brand Pilihan di halaman beranda telah disimpan.')
            ->success()
            ->send();
    }

    protected function getFormActions(): array
    {
        return [
            Action::make('save')
                ->label('Simpan Brand Pilihan')
                ->submit('save'),
        ];
    }
}
