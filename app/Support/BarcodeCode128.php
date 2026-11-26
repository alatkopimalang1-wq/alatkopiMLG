<?php

namespace App\Support;

class BarcodeCode128
{
    /**
     * Code 128 bar/space width patterns (indices 0..106).
     *
     * @var array<int, string>
     */
    private const PATTERNS = [
        '212222', '222122', '222221', '121223', '121322', '131222', '122213', '122312', '132212', '221213',
        '221312', '231212', '112232', '122132', '122231', '113222', '123122', '123221', '223211', '221132',
        '221231', '213212', '223112', '312131', '311222', '321122', '321221', '312212', '322112', '322211',
        '212123', '212321', '232121', '111323', '131123', '131321', '112313', '132113', '132311', '211313',
        '231113', '231311', '112133', '112331', '132131', '113123', '113321', '133121', '313121', '211331',
        '231131', '213113', '213311', '213131', '311123', '311321', '331121', '312113', '312311', '332111',
        '314111', '221411', '431111', '111224', '111422', '121124', '121421', '141122', '141221', '112214',
        '112412', '122114', '122411', '142112', '142211', '241211', '221114', '413111', '241112', '134111',
        '111242', '121142', '121241', '114212', '124112', '124211', '411212', '421112', '421211', '212141',
        '214121', '412121', '111143', '111341', '131141', '114113', '114311', '411113', '411311', '113141',
        '114131', '311141', '411131', '211412', '211214', '211232', '2331112',
    ];

    /**
     * Render a crisp Code128B SVG barcode for the given text.
     */
    public static function svg(string $text, int $height = 44): string
    {
        $clean = preg_replace('/[^\x20-\x7E]/', '', $text) ?: '000000';
        $codes = [104]; // Start Code B
        $checksum = 104;

        $len = strlen($clean);
        for ($i = 0; $i < $len; $i++) {
            $val = ord($clean[$i]) - 32;
            if ($val < 0 || $val > 95) {
                $val = 0;
            }
            $codes[] = $val;
            $checksum += $val * ($i + 1);
        }

        $codes[] = $checksum % 103;
        $codes[] = 106; // Stop

        $x = 0;
        $rects = '';
        foreach ($codes as $code) {
            $pattern = self::PATTERNS[$code] ?? self::PATTERNS[0];
            $pLen = strlen($pattern);
            for ($j = 0; $j < $pLen; $j++) {
                $w = (int) $pattern[$j];
                if ($j % 2 === 0) {
                    $rects .= "<rect x=\"{$x}\" y=\"0\" width=\"{$w}\" height=\"{$height}\" fill=\"#000\"/>";
                }
                $x += $w;
            }
        }

        return "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 {$x} {$height}\" preserveAspectRatio=\"none\" class=\"w-full h-10\">{$rects}</svg>";
    }

    /**
     * Render a crisp 2D QR Code SVG for the given text.
     */
    public static function qrSvg(string $text): string
    {
        $options = new \chillerlan\QRCode\QROptions([
            'outputType' => \chillerlan\QRCode\Output\QROutputInterface::MARKUP_SVG,
            'outputBase64' => false,
            'eccLevel' => \chillerlan\QRCode\Common\EccLevel::M,
            'addQuietzone' => true,
            'quietzoneSize' => 1,
            'svgUseCssProperties' => false,
            'drawLightModules' => false,
        ]);

        $svg = (new \chillerlan\QRCode\QRCode($options))->render($text ?: '000000');

        return preg_replace('/^<\?xml[^>]*\?>\s*/i', '', trim((string) $svg)) ?? '';
    }
}
