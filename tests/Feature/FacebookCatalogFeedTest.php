<?php

use App\Models\Product;
use App\Models\ProductVariant;

test('facebook catalog xml feed returns valid xml and 200 status', function () {
    $product = Product::query()->first();
    if (!$product) {
        $product = Product::create([
            'name' => 'Kopi Arabika Test',
            'slug' => 'kopi-arabika-test',
            'status' => 'active',
            'stock_status' => 'in_stock',
        ]);
        ProductVariant::create([
            'product_id' => $product->id,
            'label' => '250g',
            'price' => 95000,
            'sku' => 'TEST-250G',
            'stock_status' => 'in_stock',
        ]);
    }

    $response = $this->get('/feeds/facebook-catalog.xml');

    $response->assertStatus(200);
    $response->assertHeader('Content-Type', 'application/xml; charset=utf-8');
    
    $content = $response->getContent();
    expect($content)
        ->toContain('<?xml')
        ->toContain('<rss version="2.0"')
        ->toContain('xmlns:g="http://base.google.com/ns/1.0"')
        ->toContain('<g:id>')
        ->toContain('IDR</g:price>')
        ->toContain('Sanubari Coffee Roastery');
});

test('facebook catalog csv feed returns valid csv and 200 status', function () {
    $response = $this->get('/feeds/facebook-catalog.csv');

    $response->assertStatus(200);
    $response->assertHeader('Content-Type', 'text/csv; charset=utf-8');
    expect($response->getContent())
        ->toContain('id,title,description,availability,condition,price,link,image_link,brand');
});
