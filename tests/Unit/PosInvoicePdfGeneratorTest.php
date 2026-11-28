<?php

namespace Tests\Unit;

use App\Services\PosInvoicePdfGenerator;
use PHPUnit\Framework\TestCase;

class PosInvoicePdfGeneratorTest extends TestCase
{
    public function test_it_generates_pdf_without_truncating_long_product_name(): void
    {
        $order = [
            'order_number' => 'POS-20261128-0001',
            'created_at' => '2026-11-28 16:00:00',
            'customer_name' => 'John Doe',
            'customer_phone' => '08123456789',
            'cashier_name' => 'Kasir Sanubari',
            'payment_method' => 'qris',
            'total_amount' => 2200000,
            'items' => [
                [
                    'product_name' => 'Brewista Electric Kettle 1000 cc Wood Panel - SILVER',
                    'variant_label' => 'Standard',
                    'price' => 2200000,
                    'quantity' => 1,
                    'subtotal' => 2200000,
                ],
            ],
        ];

        $pdfBytes = PosInvoicePdfGenerator::generate($order);

        $this->assertNotEmpty($pdfBytes);
        $this->assertStringStartsWith('%PDF', $pdfBytes);
        // The text in the PDF stream should contain both parts of the wrapped name, not truncated with "..."
        $this->assertStringNotContainsString('Wood Pan...', $pdfBytes);
        $this->assertStringContainsString('Brewista', $pdfBytes);
        $this->assertStringContainsString('SILVER', $pdfBytes);
    }
}
