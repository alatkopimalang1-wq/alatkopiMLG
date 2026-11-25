<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Cache;

class FacebookCatalogFeedController extends Controller
{
    /**
     * Generate official XML product feed for Meta Commerce Manager / Facebook & Instagram Shop.
     */
    public function xml(): Response
    {
        $xml = Cache::remember('facebook_catalog_feed_xml', 3600, function () {
            return $this->buildXmlFeed();
        });

        return response($xml, 200, [
            'Content-Type' => 'application/xml; charset=utf-8',
            'Cache-Control' => 'public, max-age=3600',
        ]);
    }

    /**
     * Generate CSV product feed as an alternative format.
     */
    public function csv(): Response
    {
        $csv = Cache::remember('facebook_catalog_feed_csv', 3600, function () {
            return $this->buildCsvFeed();
        });

        return response($csv, 200, [
            'Content-Type' => 'text/csv; charset=utf-8',
            'Content-Disposition' => 'inline; filename="facebook-catalog.csv"',
            'Cache-Control' => 'public, max-age=3600',
        ]);
    }

    protected function resolveImageUrl(?string $path, string $appUrl): string
    {
        if (empty($path)) {
            return $appUrl . '/brand/logo-circle.png';
        }

        if (str_starts_with($path, 'http://') || str_starts_with($path, 'https://')) {
            return $path;
        }

        if (str_starts_with($path, '/storage/') || str_starts_with($path, 'storage/')) {
            return $appUrl . '/' . ltrim($path, '/');
        }

        return $appUrl . '/storage/' . ltrim($path, '/');
    }

    protected function getProductPrimaryImage(Product $product, string $appUrl): string
    {
        $primary = $product->images->firstWhere('is_primary', true) ?: $product->images->first();
        if ($primary && !empty($primary->path)) {
            return $this->resolveImageUrl($primary->path, $appUrl);
        }

        if (!empty($product->all_images) && is_array($product->all_images)) {
            $first = $product->all_images[0] ?? null;
            if (is_array($first) && !empty($first['path'])) {
                return $this->resolveImageUrl($first['path'], $appUrl);
            }
            if (is_string($first)) {
                return $this->resolveImageUrl($first, $appUrl);
            }
        }

        return $appUrl . '/brand/logo-circle.png';
    }

    protected function buildXmlFeed(): string
    {
        $products = Product::query()
            ->where('status', '!=', 'archived')
            ->with(['variants', 'images'])
            ->orderBy('id', 'desc')
            ->get();

        $appUrl = rtrim(config('app.url', 'https://sanubariroastery.co.id'), '/');
        $appName = config('app.name', 'Sanubari Coffee Roastery');

        $xml = '<?xml version="1.0" encoding="UTF-8"?>' . "\n";
        $xml .= '<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">' . "\n";
        $xml .= "  <channel>\n";
        $xml .= '    <title>' . htmlspecialchars($appName, ENT_XML1, 'UTF-8') . "</title>\n";
        $xml .= '    <link>' . htmlspecialchars($appUrl, ENT_XML1, 'UTF-8') . "</link>\n";
        $xml .= "    <description>Katalog Produk Resmi " . htmlspecialchars($appName, ENT_XML1, 'UTF-8') . "</description>\n";

        foreach ($products as $product) {
            $productName = $product->getTranslation('name', 'id') ?: $product->name;
            $productDescription = strip_tags($product->getTranslation('description', 'id') ?: ($product->short_description ?: $productName));
            $productLink = $appUrl . '/shop/' . $product->slug;
            $primaryImage = $this->getProductPrimaryImage($product, $appUrl);

            if ($product->variants->isNotEmpty()) {
                foreach ($product->variants as $variant) {
                    $variantId = $variant->sku && trim($variant->sku) !== '' ? trim($variant->sku) : (string) $variant->id;
                    $variantTitle = $productName . ($variant->label ? ' - ' . $variant->label : '');
                    $price = number_format((float) ($variant->price ?: 0), 2, '.', '') . ' IDR';
                    
                    $isOutOfStock = ($variant->stock_status === 'out_of_stock' || $product->stock_status === 'out_of_stock');
                    $availability = $isOutOfStock ? 'out_of_stock' : 'in_stock';
                    
                    $variantImage = !empty($variant->image_url) 
                        ? $this->resolveImageUrl($variant->image_url, $appUrl) 
                        : $primaryImage;

                    $xml .= "    <item>\n";
                    $xml .= '      <g:id>' . htmlspecialchars($variantId, ENT_XML1, 'UTF-8') . "</g:id>\n";
                    $xml .= '      <g:item_group_id>' . htmlspecialchars((string) $product->id, ENT_XML1, 'UTF-8') . "</g:item_group_id>\n";
                    $xml .= '      <g:title><![CDATA[' . $variantTitle . "]]></g:title>\n";
                    $xml .= '      <g:description><![CDATA[' . mb_substr($productDescription, 0, 4900) . "]]></g:description>\n";
                    $xml .= '      <g:link>' . htmlspecialchars($productLink, ENT_XML1, 'UTF-8') . "</g:link>\n";
                    $xml .= '      <g:image_link>' . htmlspecialchars($variantImage, ENT_XML1, 'UTF-8') . "</g:image_link>\n";
                    $xml .= "      <g:brand>Sanubari Coffee Roastery</g:brand>\n";
                    $xml .= "      <g:condition>new</g:condition>\n";
                    $xml .= '      <g:availability>' . $availability . "</g:availability>\n";
                    $xml .= '      <g:price>' . $price . "</g:price>\n";
                    $xml .= "      <g:google_product_category>Food, Beverages &amp; Tobacco &gt; Beverages &gt; Coffee</g:google_product_category>\n";
                    $xml .= "      <g:fb_product_category>food &gt; beverages &gt; coffee</g:fb_product_category>\n";
                    $xml .= "    </item>\n";
                }
            } else {
                $productId = $product->sku && trim($product->sku) !== '' ? trim($product->sku) : (string) $product->id;
                $price = number_format((float) ($product->min_price ?: 0), 2, '.', '') . ' IDR';
                $availability = ($product->stock_status === 'out_of_stock') ? 'out_of_stock' : 'in_stock';

                $xml .= "    <item>\n";
                $xml .= '      <g:id>' . htmlspecialchars($productId, ENT_XML1, 'UTF-8') . "</g:id>\n";
                $xml .= '      <g:title><![CDATA[' . $productName . "]]></g:title>\n";
                $xml .= '      <g:description><![CDATA[' . mb_substr($productDescription, 0, 4900) . "]]></g:description>\n";
                $xml .= '      <g:link>' . htmlspecialchars($productLink, ENT_XML1, 'UTF-8') . "</g:link>\n";
                $xml .= '      <g:image_link>' . htmlspecialchars($primaryImage, ENT_XML1, 'UTF-8') . "</g:image_link>\n";
                $xml .= "      <g:brand>Sanubari Coffee Roastery</g:brand>\n";
                $xml .= "      <g:condition>new</g:condition>\n";
                $xml .= '      <g:availability>' . $availability . "</g:availability>\n";
                $xml .= '      <g:price>' . $price . "</g:price>\n";
                $xml .= "      <g:google_product_category>Food, Beverages &amp; Tobacco &gt; Beverages &gt; Coffee</g:google_product_category>\n";
                $xml .= "      <g:fb_product_category>food &gt; beverages &gt; coffee</g:fb_product_category>\n";
                $xml .= "    </item>\n";
            }
        }

        $xml .= "  </channel>\n";
        $xml .= "</rss>\n";

        return $xml;
    }

    protected function buildCsvFeed(): string
    {
        $products = Product::query()
            ->where('status', '!=', 'archived')
            ->with(['variants', 'images'])
            ->orderBy('id', 'desc')
            ->get();

        $appUrl = rtrim(config('app.url', 'https://sanubariroastery.co.id'), '/');

        $output = fopen('php://temp', 'r+');
        fputcsv($output, [
            'id',
            'title',
            'description',
            'availability',
            'condition',
            'price',
            'link',
            'image_link',
            'brand',
            'item_group_id',
            'google_product_category',
            'fb_product_category',
        ]);

        foreach ($products as $product) {
            $productName = $product->getTranslation('name', 'id') ?: $product->name;
            $productDescription = strip_tags($product->getTranslation('description', 'id') ?: ($product->short_description ?: $productName));
            $productLink = $appUrl . '/shop/' . $product->slug;
            $primaryImage = $this->getProductPrimaryImage($product, $appUrl);

            if ($product->variants->isNotEmpty()) {
                foreach ($product->variants as $variant) {
                    $variantId = $variant->sku && trim($variant->sku) !== '' ? trim($variant->sku) : (string) $variant->id;
                    $variantTitle = $productName . ($variant->label ? ' - ' . $variant->label : '');
                    $price = number_format((float) ($variant->price ?: 0), 2, '.', '') . ' IDR';
                    $availability = ($variant->stock_status === 'out_of_stock' || $product->stock_status === 'out_of_stock') ? 'out_of_stock' : 'in_stock';
                    
                    $variantImage = !empty($variant->image_url) 
                        ? $this->resolveImageUrl($variant->image_url, $appUrl) 
                        : $primaryImage;

                    fputcsv($output, [
                        $variantId,
                        $variantTitle,
                        mb_substr($productDescription, 0, 4900),
                        $availability,
                        'new',
                        $price,
                        $productLink,
                        $variantImage,
                        'Sanubari Coffee Roastery',
                        (string) $product->id,
                        'Food, Beverages & Tobacco > Beverages > Coffee',
                        'food > beverages > coffee',
                    ]);
                }
            } else {
                $productId = $product->sku && trim($product->sku) !== '' ? trim($product->sku) : (string) $product->id;
                $price = number_format((float) ($product->min_price ?: 0), 2, '.', '') . ' IDR';
                $availability = ($product->stock_status === 'out_of_stock') ? 'out_of_stock' : 'in_stock';

                fputcsv($output, [
                    $productId,
                    $productName,
                    mb_substr($productDescription, 0, 4900),
                    $availability,
                    'new',
                    $price,
                    $productLink,
                    $primaryImage,
                    'Sanubari Coffee Roastery',
                    (string) $product->id,
                    'Food, Beverages & Tobacco > Beverages > Coffee',
                    'food > beverages > coffee',
                ]);
            }
        }

        rewind($output);
        $csv = stream_get_contents($output);
        fclose($output);

        return $csv ?: '';
    }
}
