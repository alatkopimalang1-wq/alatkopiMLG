<?php

namespace App\Filament\Resources\EquipmentProducts\Pages;

use App\Filament\Resources\EquipmentProducts\EquipmentProductResource;
use App\Models\Product;
use App\Services\EquipmentProductImportService;
use Filament\Actions\Action;
use Filament\Actions\ActionGroup;
use Filament\Actions\CreateAction;
use Filament\Forms\Components\FileUpload;
use Filament\Forms\Components\Toggle;
use Filament\Notifications\Notification;
use Filament\Resources\Pages\ListRecords;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ListEquipmentProducts extends ListRecords
{
    protected static string $resource = EquipmentProductResource::class;

    protected string $view = 'filament.resources.equipment-products.pages.list-equipment-products';

    protected function getHeaderActions(): array
    {
        return [
            ActionGroup::make([
                Action::make('downloadTemplate')
                    ->label('Template Umum (Tunggal & Varian)')
                    ->icon('heroicon-o-document-text')
                    ->action(function (EquipmentProductImportService $importer) {
                        $csv = $importer->generateTemplateCsv();

                        return response()->streamDownload(function () use ($csv) {
                            echo $csv;
                        }, 'template-import-produk-alat-kopi.csv', [
                            'Content-Type' => 'text/csv; charset=UTF-8',
                        ]);
                    }),
                Action::make('downloadVariantTemplate')
                    ->label('Template Khusus Produk Bervarian')
                    ->icon('heroicon-o-squares-2x2')
                    ->action(function (EquipmentProductImportService $importer) {
                        $csv = $importer->generateVariantTemplateCsv();

                        return response()->streamDownload(function () use ($csv) {
                            echo $csv;
                        }, 'template-produk-bervarian-alat-kopi.csv', [
                            'Content-Type' => 'text/csv; charset=UTF-8',
                        ]);
                    }),
            ])
                ->label('Download Template')
                ->icon('heroicon-o-arrow-down-tray')
                ->color('gray')
                ->button(),
            Action::make('importProducts')
                ->label('Import Produk Masal')
                ->icon('heroicon-o-arrow-up-tray')
                ->color('success')
                ->modalHeading('Import Produk Masal (CSV / Excel)')
                ->modalDescription('Unduh template terlebih dahulu, isi data produk & varian Anda di Excel atau Google Sheets, lalu unggah file (.csv atau .xlsx) di sini.')
                ->modalSubmitActionLabel('Mulai Import')
                ->form([
                    FileUpload::make('file')
                        ->label('File Produk (.csv atau .xlsx)')
                        ->disk('local')
                        ->directory('temp-imports')
                        ->acceptedFileTypes([
                            'text/csv',
                            'text/plain',
                            'application/csv',
                            'application/vnd.ms-excel',
                            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                        ])
                        ->required(),
                    Toggle::make('update_existing')
                        ->label('Perbarui produk jika nama / slug sudah ada')
                        ->default(true),
                ])
                ->action(function (array $data, EquipmentProductImportService $importer) {
                    $relativePath = $data['file'] ?? null;
                    if (! $relativePath || ! Storage::disk('local')->exists($relativePath)) {
                        Notification::make()
                            ->title('File tidak ditemukan')
                            ->danger()
                            ->send();

                        return;
                    }

                    $fullPath = Storage::disk('local')->path($relativePath);
                    $result = $importer->importFromFile($fullPath, (bool) ($data['update_existing'] ?? true));
                    Storage::disk('local')->delete($relativePath);

                    Notification::make()
                        ->title('Import Produk Masal Selesai')
                        ->body("{$result['created']} produk baru, {$result['updated']} diperbarui, {$result['variants']} varian diproses"
                            .($result['skipped'] > 0 ? ", {$result['skipped']} baris kosong dilewati." : '.'))
                        ->success()
                        ->send();
                }),
            CreateAction::make()
                ->label('Tambah Alat Kopi'),
        ];
    }

    public function duplicateProduct(int $productId)
    {
        $record = Product::with(['variants', 'categories', 'images'])->findOrFail($productId);

        $copy = DB::transaction(function () use ($record) {
            $baseName = $record->name.' (Salinan)';
            $baseSlug = Str::slug($baseName);
            $slug = $baseSlug;
            $i = 1;
            while (Product::where('slug', $slug)->exists()) {
                $slug = "{$baseSlug}-{$i}";
                $i++;
            }

            $copy = $record->replicate(['slug']);
            $copy->name = $baseName;
            $copy->slug = $slug;
            $copy->stock = 0;
            $copy->stock_status = $copy->is_preorder ? 'pre_order' : 'out_of_stock';
            $copy->save();

            $copy->categories()->sync($record->categories->pluck('id')->all());

            foreach ($record->variants as $v) {
                $vCopy = $v->replicate();
                $vCopy->product_id = $copy->id;
                $vCopy->stock = 0;
                $vCopy->stock_status = $copy->is_preorder ? $v->stock_status : 'out_of_stock';
                if (! empty($v->sku)) {
                    $vCopy->sku = $v->sku.'-COPY';
                }
                $vCopy->save();
            }

            foreach ($record->images as $img) {
                $imgCopy = $img->replicate();
                $imgCopy->product_id = $copy->id;
                $imgCopy->save();
            }

            return $copy;
        });

        Notification::make()
            ->title('Produk Berhasil Disalin')
            ->success()
            ->send();

        return redirect(EquipmentProductResource::getUrl('edit', ['record' => $copy]));
    }

    public function deleteProduct(int $productId): void
    {
        $record = Product::find($productId);
        if (! $record) {
            return;
        }

        $record->delete();

        Notification::make()
            ->title('Produk Dihapus')
            ->success()
            ->send();
    }
}
