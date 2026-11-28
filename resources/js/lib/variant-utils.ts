/**
 * Return true when a variant label is the default/placeholder "Standard" (i.e. product has no real variants).
 */
export function isDefaultStandardVariant(label?: string | null): boolean {
    if (!label) return true;
    const norm = label.trim().toLowerCase();
    return norm === '' || norm === 'standard' || norm === 'standar' || norm === 'default';
}

/**
 * Return the variant label for display, or empty string if it is the default "Standard" placeholder.
 */
export function formatVariantLabel(label?: string | null): string {
    return isDefaultStandardVariant(label) ? '' : String(label).trim();
}
