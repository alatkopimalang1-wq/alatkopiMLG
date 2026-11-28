<?php

namespace App\Support;

class VariantHelper
{
    /**
     * Check if a variant label is a default/placeholder (Standard, Standar, Default, empty).
     */
    public static function isStandard(?string $label): bool
    {
        if ($label === null) {
            return true;
        }

        $trimmed = strtolower(trim($label));

        return in_array($trimmed, ['', 'standard', 'standar', 'default'], true);
    }

    /**
     * Format variant label for display. Returns empty string if it is standard/placeholder.
     */
    public static function formatLabel(?string $label): string
    {
        return self::isStandard($label) ? '' : trim((string) $label);
    }
}
