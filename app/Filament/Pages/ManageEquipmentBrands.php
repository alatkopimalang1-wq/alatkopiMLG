<?php

namespace App\Filament\Pages;

use App\Models\Product;
use App\Models\Setting;
use BackedEnum;
use Filament\Actions\Action;
use Filament\Forms\Components\FileUpload;
use Filament\Forms\Components\Repeater;
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
use Illuminate\Support\Str;

class ManageEquipmentBrands extends Page
{
    protected static string|BackedEnum|null $navigationIcon = Heroicon::BookmarkSquare;

    protected static string|\UnitEnum|null $navigationGroup = 'Katalog & Toko';

    protected static ?string $navigationLabel = 'Merek / Brand Alat Kopi';

    protected static ?string $title = 'Pengaturan Merek / Brand Alat Kopi';

    protected static ?int $navigationSort = 2;

    /**
     * @var array<string, mixed>|null
     */
    public ?array $data = [];

    /**
     * @return array<int, array{name: string, slug: string, description?: string, image?: string|null, image_url?: string|null, is_active?: bool}>
     */
    public static function defaultBrandsList(): array
    {
        return [
            ['name' => 'Hario', 'slug' => 'hario', 'description' => 'Peralatan pour over dan kaca tahan panas asal Jepang.', 'image_url' => 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80', 'is_active' => true],
            ['name' => 'Timemore', 'slug' => 'timemore', 'description' => 'Grinder manual, timbangan digital, dan ketel seduh presisi.', 'image_url' => 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=800&q=80', 'is_active' => true],
            ['name' => 'Fellow', 'slug' => 'fellow', 'description' => 'Ketel elektrik Stagg EKG, grinder, dan aksesori kopi modern.', 'image_url' => 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=800&q=80', 'is_active' => true],
            ['name' => 'AeroPress', 'slug' => 'aeropress', 'description' => 'Alat seduh portabel berbasis tekanan udara.', 'image_url' => 'https://images.unsplash.com/photo-1511920170033-f8396924c348?auto=format&fit=crop&w=800&q=80', 'is_active' => true],
            ['name' => 'Kalita', 'slug' => 'kalita', 'description' => 'Dripper flat-bottom Wave dan perlengkapan filter.', 'image_url' => 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=800&q=80', 'is_active' => true],
            ['name' => 'Bialetti', 'slug' => 'bialetti', 'description' => 'Moka pot klasik asal Italia.', 'image_url' => 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=800&q=80', 'is_active' => true],
            ['name' => 'One Two Cups', 'slug' => 'one-two-cups', 'description' => 'Peralatan seduh ekonomis untuk home brewer.', 'image_url' => 'https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?auto=format&fit=crop&w=800&q=80', 'is_active' => true],
            ['name' => 'Alat Kopi Malang', 'slug' => 'alat-kopi-malang', 'description' => 'Produk kurasi & perlengkapan resmi Alat Kopi Malang.', 'image_url' => 'https://images.unsplash.com/photo-1442512595331-e89e73853f31?auto=format&fit=crop&w=800&q=80', 'is_active' => true],
        ];
    }

    /**
     * @return array<int, array{name: string, slug: string, description: string, image: string}>
     */
    public static function getActiveBrands(): array
    {
        $list = Setting::get('equipment_brands', null);
        if (! is_array($list) || empty($list)) {
            $list = static::defaultBrandsList();
        }

        $defaultsBySlug = collect(static::defaultBrandsList())->keyBy('slug');
        $fallbackImg = 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=800&q=80';

        $brands = [];
        foreach ($list as $item) {
            if (($item['is_active'] ?? true) !== true) {
                continue;
            }
            $name = trim((string) ($item['name'] ?? ''));
            $slug = trim((string) ($item['slug'] ?? Str::slug($name)));
            if ($name === '') {
                continue;
            }

            $img = $item['image'] ?? null;
            if (is_array($img)) {
                $img = reset($img) ?: null;
            }
            if (empty($img)) {
                $img = $item['image_url'] ?? ($defaultsBySlug[$slug]['image_url'] ?? $fallbackImg);
            }

            $brands[] = [
                'name' => $name,
                'slug' => $slug,
                'description' => trim((string) ($item['description'] ?? '')),
                'image' => (string) $img,
            ];
        }

        return $brands;
    }

    /**
     * @return array<string, string>
     */
    public static function getBrandOptions(?string $includeCurrent = null): array
    {
        $list = Setting::get('equipment_brands', null);
        if (! is_array($list) || empty($list)) {
            $list = static::defaultBrandsList();
        }

        $options = [];
        foreach ($list as $item) {
            if (($item['is_active'] ?? true) !== true) {
                continue;
            }
            $name = trim((string) ($item['name'] ?? ''));
            if ($name !== '') {
                $options[$name] = $name;
            }
        }

        if (! empty($includeCurrent) && ! isset($options[$includeCurrent])) {
            $options[$includeCurrent] = $includeCurrent;
        }

        return $options;
    }

    public function mount(): void
    {
        $brands = Setting::get('equipment_brands', null);

        if (! is_array($brands) || empty($brands)) {
            $brands = static::defaultBrandsList();
        }

        $this->form->fill([
            'brands_list' => $brands,
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
                Section::make('Kelola Merek / Brand Alat Kopi')
                    ->description('Tambahkan atau atur daftar merek alat kopi (misalnya: Hario, Timemore, Fellow). Merek yang aktif otomatis muncul sebagai pilihan pada form Produk Alat Kopi.')
                    ->icon(Heroicon::BookmarkSquare)
                    ->schema([
                        Repeater::make('brands_list')
                            ->label('Daftar Merek / Brand')
                            ->reorderable()
                            ->collapsible()
                            ->cloneable()
                            ->itemLabel(fn (array $state): ?string => ! empty($state['name'])
                                ? $state['name'].((isset($state['is_active']) && ! $state['is_active']) ? ' (Nonaktif)' : '')
                                : null
                            )
                            ->schema([
                                Grid::make(2)->schema([
                                    TextInput::make('name')
                                        ->label('Nama Merek / Brand')
                                        ->placeholder('e.g. Hario, Timemore, Fellow')
                                        ->required()
                                        ->live(onBlur: true)
                                        ->afterStateUpdated(function (?string $state, callable $set, callable $get) {
                                            if (empty($get('slug')) && ! empty($state)) {
                                                $set('slug', Str::slug($state));
                                            }
                                        }),
                                    TextInput::make('slug')
                                        ->label('Slug')
                                        ->required()
                                        ->alphaDash(),
                                ]),
                                Grid::make(2)->schema([
                                    TextInput::make('description')
                                        ->label('Catatan / Deskripsi Singkat (Opsional)'),
                                    TextInput::make('image_url')
                                        ->label('URL Gambar Brand (Opsional)')
                                        ->placeholder('https://...')
                                        ->url(),
                                ]),
                                Grid::make(2)->schema([
                                    FileUpload::make('image')
                                        ->label('Upload Foto / Logo Brand (Opsional)')
                                        ->disk('public')
                                        ->directory('brands')
                                        ->image()
                                        ->imageEditor()
                                        ->maxSize(3072),
                                    Toggle::make('is_active')
                                        ->label('Aktif (Tampil di pilihan produk & slider)')
                                        ->default(true),
                                ]),
                            ])
                            ->addActionLabel('Tambah Merek / Brand Baru')
                            ->defaultItems(0),
                    ]),
            ]);
    }

    protected function getFormActions(): array
    {
        return [
            Action::make('save')
                ->label('Simpan Daftar Merek')
                ->submit('save')
                ->keyBindings(['mod+s']),
        ];
    }

    public function save(): void
    {
        $data = $this->form->getState();
        $list = $data['brands_list'] ?? [];

        $cleaned = [];
        $seenSlugs = [];

        foreach ($list as $item) {
            $name = trim((string) ($item['name'] ?? ''));
            $slug = Str::slug((string) ($item['slug'] ?? $name));

            if ($name === '' || $slug === '') {
                continue;
            }

            if (in_array($slug, $seenSlugs, true)) {
                $slug .= '-'.(count($seenSlugs) + 1);
            }
            $seenSlugs[] = $slug;

            $img = $item['image'] ?? null;
            if (is_array($img)) {
                $img = reset($img) ?: null;
            }

            $cleaned[] = [
                'name' => $name,
                'slug' => $slug,
                'description' => trim((string) ($item['description'] ?? '')),
                'image' => $img ?: null,
                'image_url' => trim((string) ($item['image_url'] ?? '')),
                'is_active' => (bool) ($item['is_active'] ?? true),
            ];
        }

        Setting::set('equipment_brands', $cleaned);

        Cache::forget('shared_settings');
        Cache::forget('shop_categories_all');
        Cache::forget('home_categories');

        $this->form->fill(['brands_list' => $cleaned]);

        Notification::make()
            ->title('Daftar Merek Berhasil Disimpan')
            ->body(count($cleaned).' merek alat kopi kini tersedia di pilihan form Produk Alat Kopi.')
            ->success()
            ->send();
    }
}
