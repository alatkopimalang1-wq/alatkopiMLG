<?php

namespace App\Filament\Pages;

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

class ManagePosCustomerDisplaySlides extends Page
{
    protected static string|BackedEnum|null $navigationIcon = Heroicon::Photo;

    protected static string|\UnitEnum|null $navigationGroup = 'Pengaturan';

    protected static ?string $navigationLabel = 'Promo Slide Customer Display';

    protected static ?string $title = 'Pengaturan Promo Slide Customer Display (POS)';

    protected static ?int $navigationSort = 6;

    /**
     * @var array<string, mixed>|null
     */
    public ?array $data = [];

    public function mount(): void
    {
        $slides = Setting::get('pos_customer_display_slides', null);
        if (! is_array($slides)) {
            $slides = [];
        }

        $this->form->fill([
            'slides' => array_values($slides),
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
                Section::make('Slide Promo Layar Pelanggan (Dual Monitor POS)')
                    ->description('Atur gambar dan teks promo yang tampil di layar kedua (Customer Facing Display) saat kasir idle maupun saat transaksi berlangsung.')
                    ->icon(Heroicon::Photo)
                    ->schema([
                        Repeater::make('slides')
                            ->label('Daftar Slide Promo')
                            ->reorderable()
                            ->collapsible()
                            ->collapsed()
                            ->cloneable()
                            ->itemLabel(fn (array $state): ?string => ! empty($state['title'])
                                ? $state['title'].((isset($state['is_active']) && ! $state['is_active']) ? ' (Nonaktif)' : '')
                                : (! empty($state['badge']) ? $state['badge'] : 'Slide Promo')
                            )
                            ->schema([
                                Grid::make(3)->schema([
                                    TextInput::make('badge')
                                        ->label('Label Badge')
                                        ->placeholder('Promo Spesial')
                                        ->default('Promo Spesial'),
                                    TextInput::make('title')
                                        ->label('Judul Promo')
                                        ->placeholder('Misal: Diskon Mesin Espresso 10%')
                                        ->columnSpan(2),
                                ]),
                                TextInput::make('subtitle')
                                    ->label('Subjudul / Keterangan Promo')
                                    ->placeholder('Misal: Berlaku khusus pembelian di toko hingga akhir bulan.')
                                    ->columnSpanFull(),
                                Grid::make(2)->schema([
                                    FileUpload::make('image')
                                        ->label('Upload Gambar Slide Promo')
                                        ->disk('public')
                                        ->directory('pos/promo-slides')
                                        ->image()
                                        ->imageEditor()
                                        ->maxSize(5120),
                                    TextInput::make('image_url')
                                        ->label('Atau URL Gambar (Opsional)')
                                        ->placeholder('https://...')
                                        ->url(),
                                ]),
                                Toggle::make('is_active')
                                    ->label('Aktif (Tampilkan di Layar Pelanggan)')
                                    ->default(true),
                            ])
                            ->addActionLabel('Tambah Slide Promo Baru')
                            ->defaultItems(0),
                    ]),
            ]);
    }

    protected function getFormActions(): array
    {
        return [
            Action::make('save')
                ->label('Simpan Slide Promo')
                ->submit('save')
                ->keyBindings(['mod+s']),
        ];
    }

    public function save(): void
    {
        $data = $this->form->getState();
        $list = $data['slides'] ?? [];

        $cleaned = [];
        foreach ($list as $item) {
            $img = $item['image'] ?? null;
            if (is_array($img)) {
                $img = reset($img) ?: null;
            }

            $cleaned[] = [
                'badge' => trim((string) ($item['badge'] ?? 'Promo Spesial')),
                'title' => trim((string) ($item['title'] ?? '')),
                'subtitle' => trim((string) ($item['subtitle'] ?? '')),
                'image' => $img ?: null,
                'image_url' => trim((string) ($item['image_url'] ?? '')),
                'is_active' => (bool) ($item['is_active'] ?? true),
            ];
        }

        Setting::set('pos_customer_display_slides', $cleaned);

        $this->form->fill(['slides' => $cleaned]);

        Notification::make()
            ->title('Slide Promo Customer Display Disimpan')
            ->body(count($cleaned).' slide promo berhasil disimpan. Refresh /pos/display untuk melihat pembaruan.')
            ->success()
            ->send();
    }
}
