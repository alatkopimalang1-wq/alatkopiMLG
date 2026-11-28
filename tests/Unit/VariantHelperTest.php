<?php

namespace Tests\Unit;

use App\Support\VariantHelper;
use PHPUnit\Framework\TestCase;

class VariantHelperTest extends TestCase
{
    public function test_it_identifies_standard_variants_correctly(): void
    {
        $this->assertTrue(VariantHelper::isStandard(null));
        $this->assertTrue(VariantHelper::isStandard(''));
        $this->assertTrue(VariantHelper::isStandard('   '));
        $this->assertTrue(VariantHelper::isStandard('Standard'));
        $this->assertTrue(VariantHelper::isStandard('standard'));
        $this->assertTrue(VariantHelper::isStandard('STANDAR'));
        $this->assertTrue(VariantHelper::isStandard('Standar'));
        $this->assertTrue(VariantHelper::isStandard('default'));
        $this->assertTrue(VariantHelper::isStandard('Default'));

        $this->assertFalse(VariantHelper::isStandard('200 gr'));
        $this->assertFalse(VariantHelper::isStandard('Full White'));
        $this->assertFalse(VariantHelper::isStandard('Biru'));
        $this->assertFalse(VariantHelper::isStandard('1000 cc'));
    }

    public function test_it_formats_labels_properly(): void
    {
        $this->assertSame('', VariantHelper::formatLabel('Standard'));
        $this->assertSame('', VariantHelper::formatLabel('Standar'));
        $this->assertSame('', VariantHelper::formatLabel(null));
        $this->assertSame('', VariantHelper::formatLabel(''));

        $this->assertSame('Full White', VariantHelper::formatLabel('Full White'));
        $this->assertSame('200 gr', VariantHelper::formatLabel('  200 gr  '));
    }
}
