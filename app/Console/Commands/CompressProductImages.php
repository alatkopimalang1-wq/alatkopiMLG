<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Symfony\Component\Finder\Finder;

class CompressProductImages extends Command
{
    protected $signature = 'images:compress-products {--max-dim=1200 : Maximum width/height in pixels} {--quality=80 : JPEG quality 1-100}';

    protected $description = 'Resize and compress product images in storage/app/public/products and regenerate WebP copies';

    public function handle(): int
    {
        ini_set('memory_limit', '512M');

        $directory = storage_path('app/public/products');
        if (! is_dir($directory)) {
            $this->error("Directory not found: {$directory}");

            return Command::FAILURE;
        }

        $maxDim = max(200, (int) $this->option('max-dim'));
        $quality = max(30, min(95, (int) $this->option('quality')));

        $finder = new Finder;
        $finder->files()
            ->in($directory)
            ->name('/\.(jpe?g|png)$/i');

        $compressedCount = 0;
        $skippedCount = 0;
        $bytesBefore = 0;
        $bytesAfter = 0;

        foreach ($finder as $file) {
            $path = $file->getRealPath();
            $origSize = filesize($path);
            if ($origSize === false || $origSize === 0) {
                continue;
            }

            $info = @getimagesize($path);
            if (! $info) {
                $skippedCount++;

                continue;
            }

            [$width, $height] = $info;
            $mime = $info['mime'];

            // Skip already small images that are within dimension bounds
            if ($width <= $maxDim && $height <= $maxDim && $origSize <= 120 * 1024) {
                $skippedCount++;

                continue;
            }

            $src = match ($mime) {
                'image/jpeg' => @imagecreatefromjpeg($path),
                'image/png' => @imagecreatefrompng($path),
                default => null,
            };

            if (! $src) {
                $skippedCount++;

                continue;
            }

            $scale = min(1.0, $maxDim / max($width, $height));
            $newW = max(1, (int) round($width * $scale));
            $newH = max(1, (int) round($height * $scale));

            $dst = imagecreatetruecolor($newW, $newH);
            if ($mime === 'image/png') {
                imagealphablending($dst, false);
                imagesavealpha($dst, true);
                $transparent = imagecolorallocatealpha($dst, 0, 0, 0, 127);
                imagefilledrectangle($dst, 0, 0, $newW, $newH, $transparent);
            }

            imagecopyresampled($dst, $src, 0, 0, 0, 0, $newW, $newH, $width, $height);
            imagedestroy($src);

            $tmpPath = $path.'.tmp_compress';
            $ok = false;
            if ($mime === 'image/jpeg') {
                imageinterlace($dst, true);
                $ok = @imagejpeg($dst, $tmpPath, $quality);
            } elseif ($mime === 'image/png') {
                $ok = @imagepng($dst, $tmpPath, 9);
            }
            imagedestroy($dst);

            if ($ok && file_exists($tmpPath)) {
                $newSize = filesize($tmpPath);
                if ($newSize !== false && $newSize > 0 && $newSize < $origSize) {
                    rename($tmpPath, $path);
                    $bytesBefore += $origSize;
                    $bytesAfter += $newSize;
                    $compressedCount++;
                } else {
                    @unlink($tmpPath);
                    $skippedCount++;
                }
            } else {
                @unlink($tmpPath);
                $skippedCount++;
            }
        }

        $saved = max(0, $bytesBefore - $bytesAfter);
        $this->info("Compressed {$compressedCount} product images (skipped {$skippedCount}).");
        $this->info('Saved: '.round($saved / 1024 / 1024, 2).' MB ('.round($bytesBefore / 1024 / 1024, 2).' MB -> '.round($bytesAfter / 1024 / 1024, 2).' MB)');

        $this->call('images:generate-webp');

        return Command::SUCCESS;
    }
}
