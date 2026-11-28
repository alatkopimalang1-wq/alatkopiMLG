/**
 * Thermal Printer & ESC/POS Utility for Sanubari POS
 * Supports:
 * - 58mm and 80mm roll widths
 * - Browser Thermal Print (USB & System Printers)
 * - Web Bluetooth ESC/POS Direct Print (Tablets & Mobile)
 * - WhatsApp e-Receipt Generator
 */

import { isDefaultStandardVariant } from '@/lib/variant-utils';

export interface ReceiptItem {
    product_name: string;
    variant_label: string;
    price: number;
    quantity: number;
    discount_amount?: number;
    subtotal: number;
    bundle_id?: number;
    bundle_name?: string;
    bundle_unit_qty?: number;
    custom_notes?: string | null;
}

export interface ReceiptData {
    store_name: string;
    tagline?: string;
    address?: string;
    phone?: string;
    instagram?: string;
    order_number: string;
    date: string;
    cashier_name: string;
    customer_name?: string;
    customer_phone?: string;
    customer_address?: string;
    shipping_cost?: number;
    shipping_courier?: string;
    items: ReceiptItem[];
    subtotal: number;
    discount_amount: number;
    total_amount: number;
    payment_method_label: string;
    cash_tendered?: number;
    cash_change?: number;
    footer_note?: string;
    is_refund?: boolean;
    refund_reason?: string;
    refund_amount?: number;
    refunded_at?: string;
    refunded_by_name?: string;
}

export interface SalesReportData {
    store_name: string;
    period_title: string;
    printed_at: string;
    cashier_name: string;
    total_revenue: number;
    total_transactions: number;
    average_order_value: number;
    payment_breakdown: Array<{
        method: string;
        label: string;
        count: number;
        total: number;
    }>;
    cash_drawer?: {
        cash_sales: number;
        cash_in: number;
        cash_out: number;
        net_cash: number;
    };
    top_products?: Array<{
        name: string;
        variant: string;
        quantity: number;
        total: number;
    }>;
}

export interface ProfitLossReportData {
    store_name: string;
    period_title: string;
    printed_at: string;
    cashier_name: string;
    gross_sales: number;
    total_discounts: number;
    net_sales: number;
    total_cogs: number;
    gross_profit: number;
    gross_margin_pct: number;
    total_expenses: number;
    other_income: number;
    net_profit: number;
    net_margin_pct: number;
    total_transactions: number;
    items_sold: number;
    expense_breakdown?: Array<{
        category: string;
        label: string;
        count: number;
        total: number;
    }>;
    top_margin_products?: Array<{
        product_name: string;
        variant_label: string;
        quantity: number;
        gross_profit: number;
    }>;
}

export interface PreBillData {
    store_name: string;
    tagline?: string;
    address?: string;
    phone?: string;
    instagram?: string;
    cashier_name: string;
    customer_name?: string;
    customer_phone?: string;
    customer_address?: string;
    shipping_cost?: number;
    shipping_courier?: string;
    date: string;
    items: Array<{
        product_name: string;
        variant_label: string;
        price: number;
        quantity: number;
        discount_amount?: number;
        subtotal: number;
        bundle_id?: number;
        bundle_name?: string;
        bundle_unit_qty?: number;
        custom_notes?: string | null;
    }>;
    subtotal: number;
    discount_amount: number;
    total_amount: number;
    notes?: string;
    bank_info?: string;
    qris_instructions?: string;
}

export type PaperWidth = '58mm' | '80mm' | 'custom' | string;

export interface ReceiptFormatOptions {
    paper_width?: PaperWidth;
    custom_paper_width_mm?: number;
    custom_printable_width_mm?: number;
    custom_receipt_columns?: number;
    printer_name?: string;
    printer_driver?: string;
    receipt_columns?: number; // 28, 30, 32, 36, 40, 42, 44, 48, 56
    receipt_columns_58mm?: number;
    receipt_columns_80mm?: number;
    max_item_name_length?: number; // 18, 20, 24, 28, 32, 44
    margin_horizontal?: string; // '0mm', '1mm', '2mm', '3mm', '4mm', '5mm'
    margin_feed_lines?: number; // 1, 2, 3, 4, 5
    copies?: number; // 1, 2, 3
    show_logo?: boolean;
    formatting?: string; // 'formatted' | 'plain'
    open_cash_drawer?: boolean;
    line_display?: string;
    is_cashier_printer?: boolean;
    font_family?: 'monospace' | 'courier' | 'sans-serif' | 'consolas' | 'roboto-mono' | string;
    font_size?: 'compact' | 'normal' | 'large' | string;
    font_weight?: 'normal' | 'bold' | string;
    usb_printer_name?: string;
    usb_device_name?: string;
    usb_vendor_id?: number;
    usb_product_id?: number;
    usb_serial_number?: string;
    connection_type?: 'usb' | 'bluetooth' | 'system' | 'usb_direct';
}

/**
 * Escape HTML special characters
 */
function escapeHtml(str: string | null | undefined): string {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

export function cleanVariantLabelForReceipt(str: string | null | undefined): string {
    if (!str) return '';
    const cleaned = str.replace(/\s*\(1\s*kg\s*custom[^)]*\)/gi, '').trim();
    return isDefaultStandardVariant(cleaned) ? '' : cleaned;
}

/**
 * Generate formatted HTML receipt matching the visual graphic preview
 */
export interface GroupedReceiptBundleItem {
    product_name: string;
    variant_label: string;
    unit_qty: number;
    normal_line_price: number;
    discounted_line_price: number;
}

export type GroupedReceiptEntry =
    | { type: 'single'; item: ReceiptItem }
    | {
          type: 'bundle';
          bundleName: string;
          bundleQty: number;
          totalNormal: number;
          totalDiscounted: number;
          items: GroupedReceiptBundleItem[];
      };

export function extractBundleNameFromItem(item: ReceiptItem): string | null {
    if (item.bundle_name && item.bundle_name.trim()) {
        return item.bundle_name.trim();
    }
    if (item.custom_notes) {
        const match = item.custom_notes.match(/^Bundling:\s*(.+?)(?:\s*\(Diskon:.*\))?$/i);
        if (match && match[1]) {
            return match[1].trim();
        }
    }
    return null;
}

export function groupReceiptItemsForDisplay(items: ReceiptItem[]): GroupedReceiptEntry[] {
    const entries: GroupedReceiptEntry[] = [];
    const bundleIndexMap = new Map<string, number>();

    for (const item of items) {
        const bundleName = extractBundleNameFromItem(item);
        if (!bundleName) {
            entries.push({ type: 'single', item });
            continue;
        }

        const key = item.bundle_id ? `id:${item.bundle_id}` : `name:${bundleName}`;
        const unitQty = item.bundle_unit_qty && item.bundle_unit_qty > 0 ? item.bundle_unit_qty : 1;
        const pkgQty = Math.max(1, Math.round(item.quantity / unitQty));
        const normalTotal = item.price * item.quantity;
        const discountedTotal = item.subtotal ?? Math.max(0, normalTotal - (item.discount_amount || 0));
        const unitNormal = item.price * unitQty;
        const unitDiscounted = Math.round(discountedTotal / pkgQty);

        const existingIdx = bundleIndexMap.get(key);
        if (existingIdx !== undefined) {
            const entry = entries[existingIdx];
            if (entry.type === 'bundle') {
                entry.totalNormal += normalTotal;
                entry.totalDiscounted += discountedTotal;
                entry.items.push({
                    product_name: item.product_name,
                    variant_label: item.variant_label,
                    unit_qty: unitQty,
                    normal_line_price: unitNormal,
                    discounted_line_price: unitDiscounted,
                });
            }
        } else {
            bundleIndexMap.set(key, entries.length);
            entries.push({
                type: 'bundle',
                bundleName,
                bundleQty: pkgQty,
                totalNormal: normalTotal,
                totalDiscounted: discountedTotal,
                items: [
                    {
                        product_name: item.product_name,
                        variant_label: item.variant_label,
                        unit_qty: unitQty,
                        normal_line_price: unitNormal,
                        discounted_line_price: unitDiscounted,
                    },
                ],
            });
        }
    }

    return entries;
}

export interface DpSummaryInfo {
    totalFull: number;
    dpPaid: number;
    dpRemaining: number;
    dpPercentLabel: string;
}

export function extractDpSummaryFromItems(items: ReceiptItem[]): DpSummaryInfo | null {
    let totalFull = 0;
    let dpPaid = 0;
    let dpRemaining = 0;
    let found = false;
    let lastPercentLabel = '';
    let dpCount = 0;

    for (const item of items) {
        if (!item.custom_notes) continue;
        const m = item.custom_notes.match(
            /Total:\s*Rp\s*([\d.]+)\s*\|\s*DP\s*\(([^)]+)\):\s*Rp\s*([\d.]+)\s*\|\s*Sisa:\s*Rp\s*([\d.]+)/i,
        );
        if (m) {
            found = true;
            dpCount++;
            const parseNum = (s: string) => Number(s.replace(/\./g, '')) || 0;
            totalFull += parseNum(m[1]);
            lastPercentLabel = m[2];
            dpPaid += parseNum(m[3]);
            dpRemaining += parseNum(m[4]);
        }
    }

    if (!found) return null;
    const pct = totalFull > 0 ? (dpPaid / totalFull) * 100 : 0;
    const computedLabel =
        dpCount === 1 && lastPercentLabel
            ? lastPercentLabel
            : `${Number.isInteger(pct) ? pct : pct.toFixed(1).replace(/\.0$/, '')}%`;

    return {
        totalFull,
        dpPaid,
        dpRemaining,
        dpPercentLabel: computedLabel,
    };
}

export function generateHtmlReceiptBody(
    receipt: ReceiptData,
    opts: ReceiptFormatOptions = {},
): string {
    const is80 = (opts.paper_width || '80mm') === '80mm' || opts.custom_paper_width_mm && opts.custom_paper_width_mm >= 75;
    const baseFontSize = is80 ? '11px' : '9.5px';
    const titleFontSize = is80 ? '14px' : '12px';
    const totalFontSize = is80 ? '14px' : '12px';

    const fontFamily = opts.font_family || 'sans-serif';
    let fontFamilyCss = "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Plus Jakarta Sans', Helvetica, Arial, sans-serif";
    if (fontFamily === 'consolas' || fontFamily === 'monospace') {
        fontFamilyCss = "'Consolas', 'Courier New', monospace";
    } else if (fontFamily === 'courier') {
        fontFamilyCss = "'Courier New', Courier, monospace";
    } else if (fontFamily === 'roboto-mono') {
        fontFamilyCss = "'Roboto Mono', monospace";
    }

    const itemsHtml = groupReceiptItemsForDisplay(receipt.items)
        .map((entry) => {
            if (entry.type === 'bundle') {
                const subRows = entry.items
                    .map((bi, bIdx) => {
                        const cleanVar = cleanVariantLabelForReceipt(bi.variant_label);
                        const showVar = Boolean(cleanVar);
                        return `
                            <tr>
                                <td colspan="2" style="padding-left: 6px; padding-top: 2px; font-size: 9.5px; color: #555; font-weight: 700;">
                                    ITEM ${bIdx + 1}
                                </td>
                            </tr>
                            <tr>
                                <td style="padding-left: 6px; font-size: ${baseFontSize}; color: #111;">
                                    ${escapeHtml(bi.product_name)}${showVar ? ` (${escapeHtml(cleanVar)})` : ''}
                                </td>
                                <td style="text-align: right; white-space: nowrap; font-weight: 700; font-size: ${baseFontSize}; color: #000;">
                                    ${bi.unit_qty}x Rp ${formatRp(bi.discounted_line_price)}
                                </td>
                            </tr>
                        `;
                    })
                    .join('');
                return `
                    <tr>
                        <td colspan="2" style="font-weight: 800; padding-top: 5px; font-size: ${baseFontSize}; color: #000;">
                            ${escapeHtml(entry.bundleName)}
                        </td>
                    </tr>
                    ${subRows}
                    <tr>
                        <td style="font-weight: 700; padding-top: 3px; padding-bottom: 5px; font-size: ${baseFontSize}; color: #000; border-bottom: 1px dashed #ccc;">
                            Total Harga Paket (${entry.bundleQty}x)
                        </td>
                        <td style="text-align: right; font-weight: 800; padding-top: 3px; padding-bottom: 5px; white-space: nowrap; font-size: ${baseFontSize}; color: #000; border-bottom: 1px dashed #ccc;">
                            Rp ${formatRp(entry.totalDiscounted)}
                        </td>
                    </tr>
                `;
            }
            const item = entry.item;
            const cleanVar = cleanVariantLabelForReceipt(item.variant_label);
            const variantText = cleanVar ? ` (${escapeHtml(cleanVar)})` : '';
            return `
            <tr>
                <td colspan="2" style="font-weight: 700; padding-top: 4px; font-size: ${baseFontSize}; color: #000; line-height: 1.3;">
                    ${escapeHtml(item.product_name)}${variantText}
                </td>
            </tr>
            <tr>
                <td style="text-align: left; padding-left: 4px; padding-bottom: 4px; font-size: ${baseFontSize}; color: #222;">
                    ${item.quantity} x Rp ${formatRp(item.price)}
                </td>
                <td style="text-align: right; font-weight: 700; padding-bottom: 4px; white-space: nowrap; font-size: ${baseFontSize}; color: #000; font-variant-numeric: tabular-nums;">
                    Rp ${formatRp(item.subtotal)}
                </td>
            </tr>
            ${
                item.custom_notes && !/^Bundling:/i.test(item.custom_notes)
                    ? `
            <tr>
                <td colspan="2" style="padding-left: 6px; padding-bottom: 4px; font-size: 9.5px; color: #333; line-height: 1.3;">
                    ${escapeHtml(item.custom_notes)}
                </td>
            </tr>
            `
                    : ''
            }
        `;
        })
        .join('');

    return `
    <div class="sanubari-receipt-body" style="width: 100%; box-sizing: border-box; color: #000000; font-family: ${fontFamilyCss}; font-variant-numeric: tabular-nums; -webkit-font-smoothing: antialiased;">
        <!-- Header -->
        <div style="text-align: center; margin-bottom: 8px;">
            ${
                opts.show_logo !== false
                    ? `<div style="font-weight: 900; font-size: ${titleFontSize}; letter-spacing: 1px; text-transform: uppercase;">ALAT KOPI MALANG</div>`
                    : ''
            }
            <div style="font-size: ${titleFontSize}; font-weight: 900; text-transform: uppercase; letter-spacing: 0.5px;">
                ${escapeHtml(receipt.store_name || 'Alat Kopi Malang')}
            </div>
            ${receipt.tagline ? `<div style="font-size: 10px; font-style: italic; color: #333; margin-top: 1px;">${escapeHtml(receipt.tagline)}</div>` : ''}
            ${receipt.address ? `<div style="font-size: 9.5px; line-height: 1.3; color: #333; margin-top: 2px;">${escapeHtml(receipt.address)}</div>` : ''}
            ${receipt.phone ? `<div style="font-size: 9.5px; color: #333;">WA: ${escapeHtml(receipt.phone)}</div>` : ''}
        </div>

        <div style="border-bottom: 1.5px dashed #000000; margin: 6px 0;"></div>

        <!-- Refund Notice -->
        ${
            receipt.is_refund
                ? `
            <div style="text-align: center; font-weight: 900; font-size: ${baseFontSize}; margin: 4px 0;">
                *** BUKTI REFUND / RETUR ***<br>
                <span style="font-size: 9.5px;">Alasan: ${escapeHtml(receipt.refund_reason || 'Pengembalian Kasir')}</span>
            </div>
            <div style="border-bottom: 1px dashed #000000; margin: 4px 0;"></div>
        `
                : ''
        }

        <!-- Order Meta -->
        <table style="width: 100%; font-size: 10px; border-collapse: collapse; margin-bottom: 4px; color: #000; font-variant-numeric: tabular-nums;">
            <tr>
                <td style="text-align: left; font-weight: 800;">No: #${escapeHtml(receipt.order_number)}</td>
                <td style="text-align: right; white-space: nowrap; font-weight: 500;">${escapeHtml(receipt.date)}</td>
            </tr>
            <tr>
                <td style="text-align: left;">Kasir: ${escapeHtml(receipt.cashier_name)}</td>
                <td style="text-align: right; white-space: nowrap;">
                    ${receipt.customer_name && receipt.customer_name !== 'Pelanggan Kasir' ? escapeHtml(receipt.customer_name) : ''}
                </td>
            </tr>
            ${
                receipt.customer_address && receipt.customer_address !== 'Toko Fisik / POS Kasir'
                    ? `
            <tr>
                <td colspan="2" style="text-align: left; font-size: 9px; padding-top: 2px;">
                    Alamat: ${escapeHtml(receipt.customer_address)}
                </td>
            </tr>
            `
                    : ''
            }
        </table>

        <div style="border-bottom: 1px dashed #000000; margin: 6px 0;"></div>

        <!-- Items -->
        <table style="width: 100%; border-collapse: collapse; color: #000;">
            ${itemsHtml}
        </table>

        <div style="border-bottom: 1px dashed #000000; margin: 6px 0;"></div>

        <!-- Totals -->
        <table style="width: 100%; font-size: ${baseFontSize}; border-collapse: collapse; color: #000; font-variant-numeric: tabular-nums;">
            ${(() => {
                const dpSum = extractDpSummaryFromItems(receipt.items);
                if (!dpSum) return '';
                return `
            <tr>
                <td style="text-align: left; padding: 2px 0;">Total Pesanan (Full)</td>
                <td style="text-align: right; white-space: nowrap; font-weight: 700;">Rp ${formatRp(dpSum.totalFull)}</td>
            </tr>
            <tr>
                <td style="text-align: left; padding: 2px 0; font-weight: 700;">DP Dibayar (${escapeHtml(dpSum.dpPercentLabel)})</td>
                <td style="text-align: right; white-space: nowrap; font-weight: 700;">Rp ${formatRp(dpSum.dpPaid)}</td>
            </tr>
            <tr style="border-bottom: 1px dashed #999;">
                <td style="text-align: left; padding: 2px 0 4px; font-weight: 700;">Sisa Pelunasan</td>
                <td style="text-align: right; white-space: nowrap; font-weight: 700; padding-bottom: 4px;">Rp ${formatRp(dpSum.dpRemaining)}</td>
            </tr>
            `;
            })()}
            <tr>
                <td style="text-align: left; padding: 2px 0;">Subtotal</td>
                <td style="text-align: right; white-space: nowrap; font-weight: 700;">Rp ${formatRp(receipt.subtotal)}</td>
            </tr>
            ${
                receipt.discount_amount > 0
                    ? `
            <tr>
                <td style="text-align: left; padding: 2px 0; font-weight: 700;">Diskon</td>
                <td style="text-align: right; font-weight: 700; white-space: nowrap;">-Rp ${formatRp(receipt.discount_amount)}</td>
            </tr>
            `
                    : ''
            }
            ${
                receipt.shipping_cost && receipt.shipping_cost > 0
                    ? `
            <tr>
                <td style="text-align: left; padding: 2px 0;">Ongkir (${escapeHtml(receipt.shipping_courier || 'Kurir')})</td>
                <td style="text-align: right; white-space: nowrap;">Rp ${formatRp(receipt.shipping_cost)}</td>
            </tr>
            `
                    : ''
            }
            <tr style="border-top: 1.5px dashed #000000;">
                <td style="text-align: left; font-weight: 900; font-size: ${totalFontSize}; padding: 5px 0;">TOTAL</td>
                <td style="text-align: right; font-weight: 900; font-size: ${totalFontSize}; padding: 5px 0; white-space: nowrap;">
                    Rp ${formatRp(receipt.total_amount)}
                </td>
            </tr>
            <tr>
                <td style="text-align: left; padding: 2px 0;">Metode Bayar</td>
                <td style="text-align: right; font-weight: 700; text-transform: uppercase;">
                    ${escapeHtml(receipt.payment_method_label)}
                </td>
            </tr>
            ${
                receipt.cash_tendered && receipt.cash_tendered > 0
                    ? `
            <tr>
                <td style="text-align: left; padding: 2px 0;">Tunai Diterima</td>
                <td style="text-align: right; white-space: nowrap;">Rp ${formatRp(receipt.cash_tendered)}</td>
            </tr>
            <tr>
                <td style="text-align: left; padding: 2px 0; font-weight: 700;">Kembalian</td>
                <td style="text-align: right; font-weight: 700; white-space: nowrap;">Rp ${formatRp(receipt.cash_change || 0)}</td>
            </tr>
            `
                    : ''
            }
        </table>

        <div style="border-bottom: 1.5px dashed #000000; margin: 6px 0;"></div>

        <!-- Footer -->
        <div style="text-align: center; font-size: 9.5px; margin-top: 8px; line-height: 1.4; color: #000;">
            ${
                receipt.footer_note
                    ? receipt.footer_note
                          .split('\n')
                          .map((line) => `<div>${escapeHtml(line)}</div>`)
                          .join('')
                    : '<div>Terima kasih atas pesanannya</div>'
            }
            ${receipt.instagram ? `<div style="margin-top: 3px; font-weight: 800; letter-spacing: 0.2px;">IG: ${escapeHtml(receipt.instagram)}</div>` : ''}
        </div>
    </div>
    `;
}

/**
 * Format number into Indonesian Rupiah without currency symbol
 */
export function formatRp(num: number | null | undefined): string {
    const val = typeof num === 'number' && !isNaN(num) ? num : 0;
    return new Intl.NumberFormat('id-ID').format(val);
}

/**
 * Pads a string to a specific length with spaces
 */
function padBoth(text: string, width: number): string {
    if (text.length >= width) return text.substring(0, width);
    const leftPad = Math.floor((width - text.length) / 2);
    const rightPad = width - text.length - leftPad;
    return ' '.repeat(leftPad) + text + ' '.repeat(rightPad);
}

function padLine(left: string, right: string, width: number): string {
    const spaceCount = Math.max(1, width - left.length - right.length);
    return left + ' '.repeat(spaceCount) + right;
}

/**
 * Build plain text representation of the receipt with customizable columns and margins
 */
export function generatePlainTextReceipt(
    receipt: ReceiptData,
    widthOrOptions: PaperWidth | ReceiptFormatOptions = '58mm',
): string {
    const opts: ReceiptFormatOptions =
        typeof widthOrOptions === 'string'
            ? { paper_width: widthOrOptions }
            : widthOrOptions || {};

    const paperWidth = opts.paper_width || '58mm';
    const isCustom = paperWidth === 'custom';
    const cols =
        Number(opts.receipt_columns) ||
        (isCustom
            ? Number(opts.custom_receipt_columns) || 40
            : paperWidth === '80mm'
              ? Number(opts.receipt_columns_80mm) || 44
              : Number(opts.receipt_columns_58mm) || 32);
    const maxItemLen =
        Number(opts.max_item_name_length) ||
        (cols >= 44 ? Math.min(cols - 12, 34) : cols >= 38 ? 26 : Math.min(cols - 10, 22));
    const showLogo = opts.show_logo ?? true;
    const feedLines = Number(opts.margin_feed_lines) ?? 2;
    const divider = '-'.repeat(cols);
    const doubleDivider = '='.repeat(cols);

    const lines: string[] = [];

    // Optional ASCII / text logo banner
    if (showLogo) {
        lines.push(padBoth('*** ALAT KOPI MALANG ***', cols));
    }

    // Header
    lines.push(padBoth(receipt.store_name.toUpperCase(), cols));
    if (receipt.tagline) lines.push(padBoth(receipt.tagline, cols));
    if (receipt.address) lines.push(padBoth(receipt.address, cols));
    if (receipt.phone) lines.push(padBoth(`WA: ${receipt.phone}`, cols));
    lines.push(doubleDivider);

    if (receipt.is_refund) {
        lines.push(padBoth('*** BUKTI REFUND / RETUR ***', cols));
        lines.push(padBoth('DANA TELAH DIKEMBALIKAN', cols));
        if (receipt.refund_reason) {
            lines.push(padLine(`Alasan: ${receipt.refund_reason}`, '', cols));
        }
        lines.push(doubleDivider);
    }

    // Order Info
    lines.push(padLine(`No: #${receipt.order_number}`, '', cols));
    lines.push(
        padLine(`Tgl: ${receipt.date}`, `Kasir: ${receipt.cashier_name}`, cols),
    );
    if (receipt.customer_name && receipt.customer_name !== 'Pelanggan Kasir') {
        lines.push(padLine(`Pelanggan: ${receipt.customer_name}`, '', cols));
    }
    if (receipt.customer_phone && receipt.customer_phone !== '-') {
        lines.push(padLine(`Telp/WA: ${receipt.customer_phone}`, '', cols));
    }
    if (
        receipt.customer_address &&
        receipt.customer_address !== 'Toko Fisik / POS Kasir'
    ) {
        lines.push(`Alamat: ${receipt.customer_address}`);
    }
    lines.push(divider);

    // Items
    for (const entry of groupReceiptItemsForDisplay(receipt.items)) {
        if (entry.type === 'bundle') {
            lines.push(entry.bundleName.substring(0, cols));
            entry.items.forEach((bi, bIdx) => {
                const cleanVar = cleanVariantLabelForReceipt(bi.variant_label);
                const showVar = cleanVar && cleanVar !== 'Standard' && cleanVar !== 'Standar';
                lines.push(`  ITEM ${bIdx + 1}: ${bi.product_name}${showVar ? ` (${cleanVar})` : ''}`.substring(0, cols));
                lines.push(padLine(`    ${bi.unit_qty}x`, formatRp(bi.discounted_line_price), cols));
            });
            lines.push(padLine(`Total Paket (${entry.bundleQty}x)`, formatRp(entry.totalDiscounted), cols));
            continue;
        }
        const item = entry.item;
        // Line 1: Product name + variant formatted to maxItemLen
        const cleanVar = cleanVariantLabelForReceipt(item.variant_label);
        const fullTitle = cleanVar ? `${item.product_name} (${cleanVar})` : item.product_name;
        const maxLen = Math.min(maxItemLen, cols);

        if (fullTitle.length <= maxLen) {
            lines.push(fullTitle);
        } else {
            let rem = fullTitle;
            while (rem.length > 0) {
                if (rem.length <= maxLen) {
                    lines.push(rem);
                    break;
                }
                let split = rem.lastIndexOf(' ', maxLen);
                if (split <= 0) split = maxLen;
                lines.push(rem.substring(0, split));
                rem = rem.substring(split).trim();
            }
        }

        // Line 2: Qty x Price ... Subtotal
        const qtyPrice = `  ${item.quantity}x ${formatRp(item.price)}`;
        const lineTotal = formatRp(item.subtotal);
        lines.push(padLine(qtyPrice, lineTotal, cols));

        if (item.custom_notes && !/^Bundling:/i.test(item.custom_notes)) {
            let remNote = item.custom_notes.trim();
            const noteMax = Math.max(12, cols - 2);
            while (remNote.length > 0) {
                if (remNote.length <= noteMax) {
                    lines.push(`  ${remNote}`);
                    break;
                }
                let split = remNote.lastIndexOf(' ', noteMax);
                if (split <= 0) split = noteMax;
                lines.push(`  ${remNote.substring(0, split)}`);
                remNote = remNote.substring(split).trim();
            }
        }
    }

    lines.push(divider);

    // Totals
    const dpSumPlain = extractDpSummaryFromItems(receipt.items);
    if (dpSumPlain) {
        lines.push(padLine('Total Pesanan', `Rp ${formatRp(dpSumPlain.totalFull)}`, cols));
        lines.push(padLine(`DP (${dpSumPlain.dpPercentLabel})`, `Rp ${formatRp(dpSumPlain.dpPaid)}`, cols));
        lines.push(padLine('Sisa Pelunasan', `Rp ${formatRp(dpSumPlain.dpRemaining)}`, cols));
        lines.push(divider);
    }
    lines.push(padLine('Subtotal', `Rp ${formatRp(receipt.subtotal)}`, cols));
    if (receipt.discount_amount > 0) {
        lines.push(
            padLine('Diskon', `-Rp ${formatRp(receipt.discount_amount)}`, cols),
        );
    }
    if (receipt.shipping_cost && receipt.shipping_cost > 0) {
        const courierTag = receipt.shipping_courier
            ? ` (${receipt.shipping_courier})`
            : '';
        lines.push(
            padLine(
                `Ongkir${courierTag}`,
                `Rp ${formatRp(receipt.shipping_cost)}`,
                cols,
            ),
        );
    }
    lines.push(padLine('TOTAL', `Rp ${formatRp(receipt.total_amount)}`, cols));
    lines.push(divider);

    if (receipt.is_refund) {
        lines.push(padLine('TOTAL REFUND', `Rp ${formatRp(receipt.refund_amount || receipt.total_amount)}`, cols));
        lines.push(padLine('Status Kasir', 'SUDAH DI-REFUND', cols));
        lines.push(divider);
    }

    // Payment Info
    lines.push(padLine('Metode Bayar', receipt.payment_method_label, cols));
    if (receipt.cash_tendered && receipt.cash_tendered > 0) {
        lines.push(
            padLine(
                'Bayar Tunai',
                `Rp ${formatRp(receipt.cash_tendered)}`,
                cols,
            ),
        );
        lines.push(
            padLine(
                'Kembalian',
                `Rp ${formatRp(receipt.cash_change || 0)}`,
                cols,
            ),
        );
    }

    lines.push(doubleDivider);

    // Footer
    if (receipt.footer_note) {
        receipt.footer_note
            .split('\n')
            .forEach((n) => lines.push(padBoth(n, cols)));
    }
    if (receipt.instagram) {
        lines.push(padBoth(`IG: ${receipt.instagram}`, cols));
    }

    // Feed margin lines at bottom before cut
    for (let i = 0; i < feedLines; i++) {
        lines.push('');
    }

    return lines.join('\n');
}

/**
 * Build ESC/POS binary buffer from arbitrary plain text string
 */
export function buildPlainTextEscPosBuffer(
    rawText: string,
    openCashDrawer = false,
    paperWidth: PaperWidth = '58mm',
): Uint8Array {
    const encoder = new TextEncoder();
    const encodedText = encoder.encode(rawText + '\n\n\n');
    const initCmd = new Uint8Array([0x1b, 0x40]);
    const drawerCmd = openCashDrawer
        ? new Uint8Array([0x1b, 0x70, 0x00, 0x19, 0xfa])
        : new Uint8Array([]);
    // Only send cut command for 80mm printers. 58mm portable printers have manual tear edge.
    // Use GS V 0 (0x1D 0x56 0x00) instead of 0x42 (ASCII 'B') to prevent ghost 'B' on printers without cutter.
    const cutCmd = paperWidth === '80mm'
        ? new Uint8Array([0x1d, 0x56, 0x00])
        : new Uint8Array([]);
    const buffer = new Uint8Array(
        initCmd.length + drawerCmd.length + encodedText.length + cutCmd.length,
    );
    let offset = 0;
    buffer.set(initCmd, offset);
    offset += initCmd.length;
    if (drawerCmd.length > 0) {
        buffer.set(drawerCmd, offset);
        offset += drawerCmd.length;
    }
    buffer.set(encodedText, offset);
    offset += encodedText.length;
    if (cutCmd.length > 0) {
        buffer.set(cutCmd, offset);
        offset += cutCmd.length;
    }
    return buffer;
}

/**
 * Print thermal HTML silently:
 * 1. On Windows POS Desktop App (Electron): prints 100% silently directly to the default PC printer via electronAPI.printReceipt({ silent: true }) without opening the Windows print dialog.
 * 2. On Android POS APK: prints directly to the connected Bluetooth thermal printer via ESC/POS.
 * 3. On standard web browsers: prints via a hidden 0x0 iframe without opening a preview popup window.
 */
export function printHtmlSilentlyViaHiddenIframe(
    html: string,
    rawTextForBluetooth?: string,
    copies = 1,
    openCashDrawer = false,
    paperWidth: PaperWidth = '58mm',
    opts?: ReceiptFormatOptions,
): void {
    if (typeof window === 'undefined' || typeof document === 'undefined') return;

    // 1. Windows POS Desktop App (Electron) -> Direct Silent Print to Default PC Printer (Zero Print Dialog!)
    const electronAPI = (window as any).electronAPI;
    if (electronAPI && typeof electronAPI.printReceipt === 'function') {
        (async () => {
            const rootId = 'sanubari-pos-direct-print-root';
            const styleId = 'sanubari-pos-direct-print-style';

            const oldRoot = document.getElementById(rootId);
            if (oldRoot && oldRoot.parentNode) oldRoot.parentNode.removeChild(oldRoot);
            const oldStyle = document.getElementById(styleId);
            if (oldStyle && oldStyle.parentNode) oldStyle.parentNode.removeChild(oldStyle);

            const isCustom = paperWidth === 'custom' || opts?.paper_width === 'custom';
            const customWidthMm = Math.max(30, Math.min(120, Number(opts?.custom_paper_width_mm) || 58));
            const customPrintableMm = Math.max(
                20,
                Math.min(customWidthMm, Number(opts?.custom_printable_width_mm) || (customWidthMm - 4)),
            );

            const printWidth = isCustom
                ? `${customPrintableMm}mm`
                : paperWidth === '80mm'
                  ? (opts?.custom_printable_width_mm ? `${opts.custom_printable_width_mm}mm` : '72mm')
                  : '48mm';
            const paperSize = isCustom
                ? `${customWidthMm}mm auto`
                : paperWidth === '80mm'
                  ? '80mm auto'
                  : '58mm auto';
            const fontSize =
                paperWidth === '80mm' || (isCustom && customWidthMm >= 75) ? '12px' : '10.5px';

            const targetFont = opts?.font_family || 'sans-serif';
            let printFontCss = "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Plus Jakarta Sans', sans-serif";
            if (targetFont === 'courier') {
                printFontCss = "'Courier New', Courier, monospace";
            } else if (targetFont === 'consolas' || targetFont === 'monospace') {
                printFontCss = "'Consolas', 'Courier New', monospace";
            } else if (targetFont === 'roboto-mono') {
                printFontCss = "'Roboto Mono', monospace";
            }

            const styleEl = document.createElement('style');
            styleEl.id = styleId;
            styleEl.textContent = `
                @media screen {
                    #${rootId} {
                        display: none !important;
                    }
                }
                @media print {
                    @page {
                        size: ${paperSize};
                        margin: 0 !important;
                    }
                    html, body {
                        margin: 0 !important;
                        padding: 0 !important;
                        background: #ffffff !important;
                        color: #000000 !important;
                        width: 100% !important;
                        height: auto !important;
                        min-height: 0 !important;
                        overflow: visible !important;
                    }
                    body > *:not(#${rootId}) {
                        display: none !important;
                    }
                    #${rootId} {
                        display: block !important;
                        position: static !important;
                        width: ${printWidth} !important;
                        margin: 0 !important;
                        padding: 1mm !important;
                        box-sizing: border-box !important;
                        font-family: ${printFontCss} !important;
                        font-variant-numeric: tabular-nums !important;
                        font-size: ${fontSize} !important;
                        line-height: 1.25 !important;
                        color: #000000 !important;
                        background: #ffffff !important;
                        visibility: visible !important;
                        -webkit-font-smoothing: antialiased !important;
                        -moz-osx-font-smoothing: grayscale !important;
                        text-rendering: geometricPrecision !important;
                    }
                        -moz-osx-font-smoothing: grayscale !important;
                        text-rendering: geometricPrecision !important;
                    }
                    #${rootId} pre {
                        margin: 0 !important;
                        white-space: pre !important;
                        overflow: hidden !important;
                        word-break: normal !important;
                        font-family: inherit !important;
                        font-size: inherit !important;
                        color: #000000 !important;
                    }
                    #${rootId} table {
                        border-collapse: collapse !important;
                        color: #000000 !important;
                    }
                }
            `;
            document.head.appendChild(styleEl);

            const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
            const innerBodyHtml = bodyMatch
                ? bodyMatch[1]
                : `<pre>${(rawTextForBluetooth || '').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>`;

            const rootEl = document.createElement('div');
            rootEl.id = rootId;
            rootEl.innerHTML = innerBodyHtml;
            document.body.appendChild(rootEl);

            try {
                let targetPrinterName = opts?.printer_name || opts?.usb_printer_name || '';
                if (typeof electronAPI.getPrinters === 'function') {
                    try {
                        const printers: any[] = await electronAPI.getPrinters();
                        if (Array.isArray(printers) && printers.length > 0) {
                            if (targetPrinterName) {
                                const match = printers.find(
                                    (p) =>
                                        (p.name && p.name.toLowerCase() === targetPrinterName.toLowerCase()) ||
                                        (p.displayName && p.displayName.toLowerCase() === targetPrinterName.toLowerCase()),
                                );
                                if (match) {
                                    targetPrinterName = match.name;
                                }
                            }
                            if (!targetPrinterName) {
                                const defaultPrinter = printers.find((p) => p.isDefault);
                                const posThermalPrinter = printers.find((p) =>
                                    /pos80|pos58|pos-|thermal|receipt|tm-t|tm-u|xprinter|eppos|vsc|blueprint|panda|iware|codesoft|rpp|mtp/i.test(
                                        `${p.name || ''} ${p.displayName || ''}`,
                                    ),
                                );
                                const isVirtual = (name: string) =>
                                    /microsoft print to pdf|xps document writer|onenote|fax/i.test(
                                        name || '',
                                    );
                                const firstPhysical = printers.find((p) => !isVirtual(p.name));

                                if (defaultPrinter && !isVirtual(defaultPrinter.name)) {
                                    targetPrinterName = defaultPrinter.name;
                                } else if (posThermalPrinter) {
                                    targetPrinterName = posThermalPrinter.name;
                                } else if (firstPhysical) {
                                    targetPrinterName = firstPhysical.name;
                                } else if (defaultPrinter) {
                                    targetPrinterName = defaultPrinter.name;
                                }
                            }
                        }
                    } catch {
                        // Use OS default printer ('')
                    }
                }

                // Wait one animation frame for DOM layout of #sanubari-pos-direct-print-root
                await new Promise((r) => requestAnimationFrame(() => setTimeout(r, 30)));

                const widthMicrons = isCustom
                    ? customWidthMm * 1000
                    : paperWidth === '80mm'
                      ? 80000
                      : 58000;
                let res = await electronAPI.printReceipt({
                    silent: true,
                    printerName: targetPrinterName,
                    pageSize: { width: widthMicrons, height: 200000 },
                });

                if (!res || !res.success) {
                    res = await electronAPI.printReceipt({
                        silent: true,
                        printerName: targetPrinterName,
                        pageSize: 'A4',
                    });
                }

                if ((!res || !res.success) && targetPrinterName !== '') {
                    await electronAPI.printReceipt({
                        silent: true,
                        printerName: '',
                        pageSize: 'A4',
                    });
                }
            } finally {
                if (rootEl.parentNode) rootEl.parentNode.removeChild(rootEl);
                if (styleEl.parentNode) styleEl.parentNode.removeChild(styleEl);
            }
        })();
        return;
    }

    // 2. If running in Android POS APK and a Bluetooth printer is connected, print directly via ESC/POS Bluetooth
    if (isAndroidNativeBluetoothAvailable() && rawTextForBluetooth) {
        const saved = getSavedBluetoothPrinter();
        if (saved && saved.address) {
            try {
                const buffer = buildPlainTextEscPosBuffer(rawTextForBluetooth, openCashDrawer, paperWidth);
                const base64 = uint8ArrayToBase64(buffer);
                (window as any).SanubariAndroidBluetooth.printEscPosBase64(
                    base64,
                    saved.address,
                    Math.max(1, copies),
                );
                return;
            } catch {
                // Fall through to hidden iframe print
            }
        }
    }

    // 3. Hidden 0x0 iframe print (for standard browsers)
    const frameId = 'sanubari-pos-silent-print-frame';
    const existing = document.getElementById(frameId);
    if (existing && existing.parentNode) {
        existing.parentNode.removeChild(existing);
    }

    const iframe = document.createElement('iframe');
    iframe.id = frameId;
    iframe.setAttribute('aria-hidden', 'true');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    iframe.style.opacity = '0';
    iframe.style.pointerEvents = 'none';
    iframe.style.zIndex = '-1';
    document.body.appendChild(iframe);

    const frameWindow = iframe.contentWindow;
    const frameDoc = iframe.contentDocument || frameWindow?.document;
    if (!frameDoc || !frameWindow) return;

    let printed = false;
    const triggerPrint = () => {
        if (printed) return;
        printed = true;
        try {
            frameWindow.focus();
            frameWindow.print();
        } catch {
            // Ignore
        }
        window.setTimeout(() => {
            if (iframe.parentNode) {
                iframe.parentNode.removeChild(iframe);
            }
        }, 30000);
    };

    iframe.onload = triggerPrint;
    frameDoc.open();
    frameDoc.write(html);
    frameDoc.close();
    window.setTimeout(triggerPrint, 80);
}

/**
 * Print receipt via hidden iframe formatted for 58mm or 80mm thermal printers without opening a preview popup window
 */
export function printThermalWeb(
    receipt: ReceiptData,
    widthOrOptions: PaperWidth | ReceiptFormatOptions = '58mm',
): void {
    const opts: ReceiptFormatOptions =
        typeof widthOrOptions === 'string'
            ? { paper_width: widthOrOptions }
            : widthOrOptions || {};

    const paperWidth = opts.paper_width || '58mm';
    const isCustom = paperWidth === 'custom';
    const customWidthMm = Math.max(30, Math.min(120, Number(opts.custom_paper_width_mm) || 58));
    const customPrintableMm = Math.max(
        20,
        Math.min(customWidthMm, Number(opts.custom_printable_width_mm) || (customWidthMm - 4)),
    );

    const marginH = opts.margin_horizontal || '2mm';
    const copies = Math.max(1, Number(opts.copies) || 1);
    const rawText = generatePlainTextReceipt(receipt, opts);

    const printWidth = isCustom
        ? `${customPrintableMm}mm`
        : paperWidth === '80mm'
          ? (opts.custom_printable_width_mm ? `${opts.custom_printable_width_mm}mm` : '72mm')
          : '48mm';
    const paperSize = isCustom
        ? `${customWidthMm}mm auto`
        : paperWidth === '80mm'
          ? '80mm auto'
          : '58mm auto';

    const fontFamily = opts.font_family || 'sans-serif';
    let fontFamilyCss = "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Plus Jakarta Sans', Helvetica, Arial, sans-serif";
    if (fontFamily === 'courier') {
        fontFamilyCss = "'Courier New', Courier, monospace";
    } else if (fontFamily === 'consolas' || fontFamily === 'monospace') {
        fontFamilyCss = "'Consolas', 'Lucida Console', 'Courier New', monospace";
    } else if (fontFamily === 'roboto-mono') {
        fontFamilyCss = "'Roboto Mono', monospace, 'Courier New'";
    }

    const fontSize = opts.font_size || 'normal';
    let fontSizeCss =
        paperWidth === '80mm' || (isCustom && customWidthMm >= 75)
            ? '12px'
            : '10.5px';
    if (fontSize === 'compact') {
        fontSizeCss =
            paperWidth === '80mm' || (isCustom && customWidthMm >= 75)
                ? '10.5px'
                : '9.5px';
    } else if (fontSize === 'large') {
        fontSizeCss =
            paperWidth === '80mm' || (isCustom && customWidthMm >= 75)
                ? '14px'
                : '12px';
    }

    const fontWeight = opts.font_weight || 'normal';
    const fontWeightCss = fontWeight === 'bold' ? 'bold' : 'normal';

    const isFormatted = opts.formatting !== 'plain';
    const bodyContent = isFormatted
        ? generateHtmlReceiptBody(receipt, opts)
        : `<pre>${rawText.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>`;

    // Build multi-copy sections if copies > 1
    const copyLabels = [
        'SALINAN PELANGGAN',
        'SALINAN KASIR / TOKO',
        'SALINAN BAR / DAPUR',
    ];
    let copiesHtml = '';
    for (let c = 0; c < copies; c++) {
        const copyBadge =
            copies > 1
                ? `<div style="text-align:center;font-weight:bold;font-size:10px;padding:3px 0;margin-bottom:4px;border-bottom:1px dashed #000;">[ ${copyLabels[c] || `SALINAN #${c + 1}`} ]</div>`
                : '';
        const cutSeparator =
            c < copies - 1
                ? `<div style="text-align:center;font-size:10px;margin:12px 0;border-top:1px dashed #000;padding-top:4px;color:#000;">- - - - - POTONG DI SINI - - - - -</div>`
                : '';
        copiesHtml += `<div class="receipt-copy">${copyBadge}${bodyContent}</div>${cutSeparator}`;
    }

    const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Struk #${receipt.order_number}</title>
    <style>
        @page {
            size: ${paperSize};
            margin: 0;
        }
        body {
            margin: 0 auto;
            padding: 2mm ${marginH};
            width: ${printWidth};
            box-sizing: border-box;
            font-family: ${fontFamilyCss};
            font-size: ${fontSizeCss};
            font-weight: ${fontWeightCss};
            line-height: 1.25;
            color: #000000;
            background: #ffffff;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
            font-variant-numeric: tabular-nums;
            text-rendering: geometricPrecision;
        }
        pre {
            margin: 0;
            white-space: pre !important;
            overflow: hidden !important;
            word-break: normal !important;
            font-family: inherit;
            font-size: inherit;
            font-weight: inherit;
            color: #000000;
        }
        table {
            border-collapse: collapse;
            color: #000000;
        }
        @media print {
            body {
                width: 100%;
                padding: 0 ${marginH};
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
            }
        }
    </style>
</head>
<body>
    ${copiesHtml}
</body>
</html>
    `;

    printHtmlSilentlyViaHiddenIframe(
        html,
        rawText,
        copies,
        Boolean(opts.open_cash_drawer),
        paperWidth,
        opts,
    );
}

/**
 * Build ESC/POS binary buffer for Bluetooth thermal printers
 */
export function buildEscPosBuffer(
    receipt: ReceiptData,
    widthOrOptions: PaperWidth | ReceiptFormatOptions = '58mm',
): Uint8Array {
    const opts: ReceiptFormatOptions =
        typeof widthOrOptions === 'string'
            ? { paper_width: widthOrOptions }
            : widthOrOptions || {};

    const text = generatePlainTextReceipt(receipt, opts);
    const encoder = new TextEncoder();
    const encodedText = encoder.encode(text + '\n\n\n');

    // ESC/POS Commands
    const initCmd = new Uint8Array([0x1b, 0x40]); // ESC @ (Initialize)

    // Font selection (ESC M n: 0 = Font A, 1 = Font B)
    const fontCmd =
        opts.font_size === 'compact'
            ? new Uint8Array([0x1b, 0x4d, 0x01])
            : new Uint8Array([0x1b, 0x4d, 0x00]);

    // Bold selection (ESC E n: 1 = bold, 0 = normal)
    const boldCmd =
        opts.font_weight === 'bold'
            ? new Uint8Array([0x1b, 0x45, 0x01])
            : new Uint8Array([0x1b, 0x45, 0x00]);

    // Optional cash drawer pulse (pin 2 & 5)
    const drawerCmd = opts.open_cash_drawer
        ? new Uint8Array([0x1b, 0x70, 0x00, 0x19, 0xfa])
        : new Uint8Array([]);

    // Cut paper command:
    // Only send for 80mm printers. Portable 58mm Bluetooth printers do NOT have auto-cutter mechanism.
    // Use GS V 0 (0x1D 0x56 0x00) instead of 0x42 ('B') to prevent ghost 'B' character on printers without Function B cut.
    const is80mm = (opts.paper_width || '58mm') === '80mm';
    const isCustom = opts.paper_width === 'custom';
    const customWidthMm = Number(opts.custom_paper_width_mm) || 58;
    const shouldCut = is80mm || (isCustom && customWidthMm >= 75);
    const cutCmd = shouldCut
        ? new Uint8Array([0x1d, 0x56, 0x00]) // GS V 0 (Universal Cut)
        : new Uint8Array([]);

    const totalLen =
        initCmd.length +
        fontCmd.length +
        boldCmd.length +
        drawerCmd.length +
        encodedText.length +
        cutCmd.length;
    const buffer = new Uint8Array(totalLen);

    let offset = 0;
    buffer.set(initCmd, offset);
    offset += initCmd.length;
    buffer.set(fontCmd, offset);
    offset += fontCmd.length;
    buffer.set(boldCmd, offset);
    offset += boldCmd.length;
    if (drawerCmd.length > 0) {
        buffer.set(drawerCmd, offset);
        offset += drawerCmd.length;
    }
    buffer.set(encodedText, offset);
    offset += encodedText.length;
    if (cutCmd.length > 0) {
        buffer.set(cutCmd, offset);
        offset += cutCmd.length;
    }

    return buffer;
}

export interface UsbPrinterDevice {
    name: string;
    vendorId: number;
    productId: number;
    productName?: string;
    manufacturerName?: string;
    serialNumber?: string;
    connected?: boolean;
}

export interface WindowsPrinterItem {
    name: string;
    displayName?: string;
    isDefault?: boolean;
    description?: string;
    status?: number;
}

const USB_SAVED_PRINTER_STORAGE_KEY = 'sanubari_pos_usb_printer_v1';
let activeUsbDevice: any = null;
let activeUsbEndpoint: number | null = null;
let activeUsbInterface: number | null = null;

/**
 * Check if running inside Sanubari POS Electron Desktop app on Windows
 */
export function isElectronDesktop(): boolean {
    return typeof window !== 'undefined' && Boolean((window as any).electronAPI?.isDesktop);
}

/**
 * Get list of installed Windows printers via Electron IPC
 */
export async function getAvailableWindowsPrinters(): Promise<WindowsPrinterItem[]> {
    if (typeof window === 'undefined') return [];
    const electronAPI = (window as any).electronAPI;
    if (electronAPI && typeof electronAPI.getPrinters === 'function') {
        try {
            const list = await electronAPI.getPrinters();
            if (Array.isArray(list)) {
                return list.map((p) => ({
                    name: p.name || '',
                    displayName: p.displayName || p.name || '',
                    isDefault: Boolean(p.isDefault),
                    description: p.description || '',
                    status: p.status,
                }));
            }
        } catch (e) {
            console.warn('Failed to get printers from electronAPI:', e);
        }
    }
    return [];
}

/**
 * Check if browser supports WebUSB API (Google Chrome, Microsoft Edge, Opera on Windows/Desktop)
 */
export function isWebUsbAvailable(): boolean {
    return (
        typeof navigator !== 'undefined' &&
        'usb' in navigator &&
        typeof (navigator as any).usb?.requestDevice === 'function'
    );
}

/**
 * Get saved USB printer device from localStorage
 */
export function getSavedUsbPrinter(): UsbPrinterDevice | null {
    if (typeof window === 'undefined') return null;
    try {
        const raw = localStorage.getItem(USB_SAVED_PRINTER_STORAGE_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
}

/**
 * Save or remove USB printer device in localStorage
 */
export function saveUsbPrinter(device: UsbPrinterDevice | null): void {
    if (typeof window === 'undefined') return;
    try {
        if (device) {
            localStorage.setItem(USB_SAVED_PRINTER_STORAGE_KEY, JSON.stringify(device));
        } else {
            localStorage.removeItem(USB_SAVED_PRINTER_STORAGE_KEY);
        }
    } catch {
        // Ignore
    }
}

/**
 * Disconnect current WebUSB printer
 */
export function disconnectUsbPrinter(): void {
    if (activeUsbDevice) {
        try {
            if (activeUsbInterface !== null) {
                activeUsbDevice.releaseInterface(activeUsbInterface);
            }
            activeUsbDevice.close();
        } catch {
            // Ignore
        }
    }
    activeUsbDevice = null;
    activeUsbInterface = null;
    activeUsbEndpoint = null;
    saveUsbPrinter(null);
}

/**
 * Reconnect to previously paired WebUSB printer without dialog
 */
export async function reconnectSavedUsbPrinter(): Promise<boolean> {
    if (!isWebUsbAvailable()) return false;
    try {
        const saved = getSavedUsbPrinter();
        if (!saved) return false;

        const devices = await (navigator as any).usb.getDevices();
        const matched = devices.find(
            (d: any) => d.vendorId === saved.vendorId && d.productId === saved.productId,
        );
        if (!matched) return false;

        await matched.open();
        if (matched.configuration === null) {
            await matched.selectConfiguration(1);
        }

        let foundInterfaceNumber: number | null = null;
        let foundEndpointNumber: number | null = null;

        if (matched.configuration && Array.isArray(matched.configuration.interfaces)) {
            for (const iface of matched.configuration.interfaces) {
                for (const alt of iface.alternates || []) {
                    for (const ep of alt.endpoints || []) {
                        if (
                            ep.direction === 'out' &&
                            (ep.type === 'bulk' || ep.type === 'interrupt')
                        ) {
                            foundInterfaceNumber = iface.interfaceNumber;
                            foundEndpointNumber = ep.endpointNumber;
                            break;
                        }
                    }
                    if (foundEndpointNumber !== null) break;
                }
                if (foundEndpointNumber !== null) break;
            }
        }

        if (foundInterfaceNumber !== null) {
            try {
                await matched.claimInterface(foundInterfaceNumber);
            } catch {
                // Ignore
            }
        }

        activeUsbDevice = matched;
        activeUsbInterface = foundInterfaceNumber;
        activeUsbEndpoint = foundEndpointNumber;
        return true;
    } catch {
        return false;
    }
}

/**
 * Request user to pick a USB thermal printer device via WebUSB
 */
export async function scanAndConnectUsbPrinter(): Promise<UsbPrinterDevice | null> {
    if (!isWebUsbAvailable()) {
        throw new Error(
            'Browser ini tidak mendukung WebUSB. Silakan gunakan Google Chrome atau Microsoft Edge di Windows.',
        );
    }

    const device = await (navigator as any).usb.requestDevice({ filters: [] });
    if (!device) return null;

    await device.open();
    if (device.configuration === null) {
        await device.selectConfiguration(1);
    }

    let foundInterfaceNumber: number | null = null;
    let foundEndpointNumber: number | null = null;

    if (device.configuration && Array.isArray(device.configuration.interfaces)) {
        for (const iface of device.configuration.interfaces) {
            for (const alt of iface.alternates || []) {
                for (const ep of alt.endpoints || []) {
                    if (
                        ep.direction === 'out' &&
                        (ep.type === 'bulk' || ep.type === 'interrupt')
                    ) {
                        foundInterfaceNumber = iface.interfaceNumber;
                        foundEndpointNumber = ep.endpointNumber;
                        break;
                    }
                }
                if (foundEndpointNumber !== null) break;
            }
            if (foundEndpointNumber !== null) break;
        }
    }

    if (foundInterfaceNumber !== null) {
        try {
            await device.claimInterface(foundInterfaceNumber);
        } catch {
            // Ignore
        }
    }

    activeUsbDevice = device;
    activeUsbInterface = foundInterfaceNumber;
    activeUsbEndpoint = foundEndpointNumber;

    const hexVendor = '0x' + device.vendorId.toString(16).padStart(4, '0').toUpperCase();
    const hexProduct = '0x' + device.productId.toString(16).padStart(4, '0').toUpperCase();
    const deviceName =
        device.productName ||
        `Thermal USB Printer (${hexVendor}:${hexProduct})`;

    const info: UsbPrinterDevice = {
        name: deviceName,
        vendorId: device.vendorId,
        productId: device.productId,
        productName: device.productName || 'Thermal POS Printer',
        manufacturerName: device.manufacturerName,
        serialNumber: device.serialNumber,
        connected: true,
    };

    saveUsbPrinter(info);
    return info;
}

/**
 * Print ESC/POS binary directly to connected WebUSB thermal printer
 */
export async function printThermalUsbDirect(
    receipt: ReceiptData,
    widthOrOptions: PaperWidth | ReceiptFormatOptions = '58mm',
): Promise<boolean> {
    const opts: ReceiptFormatOptions =
        typeof widthOrOptions === 'string'
            ? { paper_width: widthOrOptions }
            : widthOrOptions || {};

    const buffer = buildEscPosBuffer(receipt, opts);

    if (!activeUsbDevice || !activeUsbDevice.opened) {
        const reconnected = await reconnectSavedUsbPrinter();
        if (!reconnected) {
            const connected = await scanAndConnectUsbPrinter();
            if (!connected) return false;
        }
    }

    if (!activeUsbDevice) {
        throw new Error('Printer USB tidak terhubung.');
    }

    const endpoint = activeUsbEndpoint ?? 1;
    await activeUsbDevice.transferOut(endpoint, buffer);
    return true;
}

export interface BluetoothPrinterDevice {
    name: string;
    address: string;
    bonded?: boolean;
    isPrinter?: boolean;
    connected?: boolean;
    source?: 'android-native' | 'web-bluetooth';
}

export interface AndroidBluetoothStatus {
    available: boolean;
    supported: boolean;
    enabled: boolean;
    hasPermission: boolean;
    discovering: boolean;
    savedAddress?: string;
    savedName?: string;
    connectedAddress?: string;
}

const BT_SAVED_PRINTER_STORAGE_KEY = 'sanubari_pos_bt_printer_v1';

// Active Web Bluetooth GATT session references (for Chrome browser mode)
let activeWebBtDevice: any = null;
let activeWebBtCharacteristic: any = null;

/**
 * Convert Uint8Array ESC/POS buffer to Base64 string
 */
export function uint8ArrayToBase64(bytes: Uint8Array): string {
    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return typeof window !== 'undefined' ? window.btoa(binary) : '';
}

/**
 * Check if running inside Sanubari POS Android APK with Native Bluetooth Bridge
 */
export function isAndroidNativeBluetoothAvailable(): boolean {
    if (typeof window === 'undefined') return false;
    const bridge = (window as any).SanubariAndroidBluetooth;
    try {
        return Boolean(bridge && typeof bridge.isNativeAvailable === 'function' && bridge.isNativeAvailable());
    } catch {
        return Boolean(bridge);
    }
}

/**
 * Check if browser supports Web Bluetooth API (Chrome Android / Desktop)
 */
export function isWebBluetoothAvailable(): boolean {
    if (typeof navigator === 'undefined') return false;
    return Boolean((navigator as any).bluetooth);
}

/**
 * Get saved Bluetooth printer info from localStorage or Native Android Bridge
 */
export function getSavedBluetoothPrinter(): BluetoothPrinterDevice | null {
    if (typeof window === 'undefined') return null;

    if (isAndroidNativeBluetoothAvailable()) {
        try {
            const raw = (window as any).SanubariAndroidBluetooth.getStatus();
            const status: AndroidBluetoothStatus = JSON.parse(raw);
            if (status && status.savedAddress) {
                return {
                    name: status.savedName || `Printer (${status.savedAddress})`,
                    address: status.savedAddress,
                    bonded: true,
                    isPrinter: true,
                    connected: true,
                    source: 'android-native',
                };
            }
        } catch {
            // Fall through to localStorage
        }
    }

    if (activeWebBtDevice && activeWebBtCharacteristic) {
        return {
            name: activeWebBtDevice.name || 'Printer Bluetooth (Web)',
            address: activeWebBtDevice.id || 'WEB-BT',
            bonded: true,
            isPrinter: true,
            connected: Boolean(activeWebBtDevice.gatt?.connected),
            source: 'web-bluetooth',
        };
    }

    try {
        const stored = window.localStorage.getItem(BT_SAVED_PRINTER_STORAGE_KEY);
        if (stored) {
            return JSON.parse(stored) as BluetoothPrinterDevice;
        }
    } catch {
        // Ignore storage errors
    }

    return null;
}

/**
 * Save or clear Bluetooth printer info in localStorage
 */
export function saveBluetoothPrinter(device: BluetoothPrinterDevice | null): void {
    if (typeof window === 'undefined') return;
    try {
        if (!device) {
            window.localStorage.removeItem(BT_SAVED_PRINTER_STORAGE_KEY);
        } else {
            window.localStorage.setItem(BT_SAVED_PRINTER_STORAGE_KEY, JSON.stringify(device));
        }
    } catch {
        // Ignore storage errors
    }
}

/**
 * Get Native Android Bluetooth status
 */
export function getAndroidBluetoothStatus(): AndroidBluetoothStatus | null {
    if (!isAndroidNativeBluetoothAvailable()) return null;
    try {
        const raw = (window as any).SanubariAndroidBluetooth.getStatus();
        return JSON.parse(raw) as AndroidBluetoothStatus;
    } catch {
        return null;
    }
}

/**
 * Get paired and discovered Bluetooth devices from Native Android Bridge
 */
export function getAndroidBluetoothDevices(): BluetoothPrinterDevice[] {
    if (!isAndroidNativeBluetoothAvailable()) return [];
    try {
        const raw = (window as any).SanubariAndroidBluetooth.getDevices();
        const list = JSON.parse(raw) as BluetoothPrinterDevice[];
        if (!Array.isArray(list)) return [];
        // Sort printers and connected devices first
        return list.sort((a, b) => {
            if (a.connected && !b.connected) return -1;
            if (!a.connected && b.connected) return 1;
            if (a.isPrinter && !b.isPrinter) return -1;
            if (!a.isPrinter && b.isPrinter) return 1;
            if (a.bonded && !b.bonded) return -1;
            if (!a.bonded && b.bonded) return 1;
            return (a.name || '').localeCompare(b.name || '');
        });
    } catch {
        return [];
    }
}

/**
 * Start scanning nearby Bluetooth devices in Native Android APK
 */
export function startAndroidBluetoothScan(): boolean {
    if (!isAndroidNativeBluetoothAvailable()) return false;
    try {
        (window as any).SanubariAndroidBluetooth.startScan();
        return true;
    } catch {
        return false;
    }
}

/**
 * Stop scanning nearby Bluetooth devices in Native Android APK
 */
export function stopAndroidBluetoothScan(): void {
    if (!isAndroidNativeBluetoothAvailable()) return;
    try {
        (window as any).SanubariAndroidBluetooth.stopScan();
    } catch {
        // Ignore
    }
}

/**
 * Open Android System Bluetooth Settings from APK
 */
export function openAndroidBluetoothSettings(): void {
    if (isAndroidNativeBluetoothAvailable()) {
        try {
            (window as any).SanubariAndroidBluetooth.openBluetoothSettings();
            return;
        } catch {
            // Fall through
        }
    }
    if (typeof window !== 'undefined') {
        try {
            window.location.href = 'intent:#Intent;action=android.settings.BLUETOOTH_SETTINGS;end';
        } catch {
            // Ignore
        }
    }
}

/**
 * Connect to a specific Bluetooth printer MAC address via Native Android Bridge
 */
export function connectAndroidBluetoothPrinter(
    address: string,
): Promise<{ success: boolean; name?: string; address?: string; message: string }> {
    return new Promise((resolve) => {
        if (!isAndroidNativeBluetoothAvailable()) {
            resolve({
                success: false,
                message: 'Jembatan Bluetooth Native Android tidak tersedia.',
            });
            return;
        }

        let settled = false;
        const timeoutId = window.setTimeout(() => {
            if (settled) return;
            settled = true;
            window.removeEventListener('sanubari-bt-connect-result', handleResult as EventListener);
            resolve({
                success: false,
                address,
                message: 'Waktu koneksi habis (timeout). Pastikan printer Bluetooth menyala dan berada di dekat perangkat.',
            });
        }, 16000);

        const handleResult = (e: CustomEvent) => {
            if (settled) return;
            const detail = e.detail || {};
            if (detail.disconnected) return;
            settled = true;
            window.clearTimeout(timeoutId);
            window.removeEventListener('sanubari-bt-connect-result', handleResult as EventListener);

            if (detail.success) {
                const connectedDev: BluetoothPrinterDevice = {
                    name: detail.name || `Printer (${address})`,
                    address: detail.address || address,
                    bonded: true,
                    isPrinter: true,
                    connected: true,
                    source: 'android-native',
                };
                saveBluetoothPrinter(connectedDev);
            }

            resolve({
                success: Boolean(detail.success),
                name: detail.name,
                address: detail.address || address,
                message: detail.message || (detail.success ? 'Terhubung ke printer!' : 'Gagal menghubungkan printer.'),
            });
        };

        window.addEventListener('sanubari-bt-connect-result', handleResult as EventListener);

        try {
            (window as any).SanubariAndroidBluetooth.connectDevice(address);
        } catch (err: any) {
            if (!settled) {
                settled = true;
                window.clearTimeout(timeoutId);
                window.removeEventListener('sanubari-bt-connect-result', handleResult as EventListener);
                resolve({
                    success: false,
                    address,
                    message: err?.message || 'Gagal memanggil koneksi Bluetooth Android.',
                });
            }
        }
    });
}

/**
 * Disconnect current Bluetooth printer (Native Android & Web Bluetooth)
 */
export function disconnectBluetoothPrinter(): void {
    saveBluetoothPrinter(null);
    if (isAndroidNativeBluetoothAvailable()) {
        try {
            (window as any).SanubariAndroidBluetooth.disconnectDevice();
        } catch {
            // Ignore
        }
    }
    if (activeWebBtDevice) {
        try {
            if (activeWebBtDevice.gatt?.connected) {
                activeWebBtDevice.gatt.disconnect();
            }
        } catch {
            // Ignore
        }
        activeWebBtDevice = null;
        activeWebBtCharacteristic = null;
    }
}

/**
 * Scan and connect to a Bluetooth printer using Web Bluetooth API (Chrome browser)
 */
export async function scanAndConnectWebBluetoothPrinter(): Promise<BluetoothPrinterDevice | null> {
    const nav = navigator as any;
    if (!nav.bluetooth) {
        throw new Error('Web Bluetooth tidak tersedia di browser ini.');
    }

    try {
        const device = await nav.bluetooth.requestDevice({
            acceptAllDevices: true,
            optionalServices: [
                '000018f0-0000-1000-8000-00805f9b34fb',
                '49535343-fe7d-4ae5-8fa9-9fafd205e455',
                '0000e0ff-0000-1000-8000-00805f9b34fb',
                '0000ff00-0000-1000-8000-00805f9b34fb',
                'e7810a71-73ae-499d-8c15-faa9aef0c3f1',
            ],
        });

        if (!device.gatt) {
            throw new Error('Perangkat printer tidak mendukung koneksi GATT.');
        }

        const server = await device.gatt.connect();
        const services = await server.getPrimaryServices();
        let writeChar: any = null;

        for (const service of services) {
            const characteristics = await service.getCharacteristics();
            for (const char of characteristics) {
                if (char.properties.write || char.properties.writeWithoutResponse) {
                    writeChar = char;
                    break;
                }
            }
            if (writeChar) break;
        }

        if (!writeChar) {
            throw new Error('Tidak ditemukan karakteristik cetak pada perangkat Bluetooth ini.');
        }

        activeWebBtDevice = device;
        activeWebBtCharacteristic = writeChar;

        const printerInfo: BluetoothPrinterDevice = {
            name: device.name || 'Printer Bluetooth',
            address: device.id || 'WEB-BT',
            bonded: true,
            isPrinter: true,
            connected: true,
            source: 'web-bluetooth',
        };
        saveBluetoothPrinter(printerInfo);
        return printerInfo;
    } catch (err: any) {
        if (err?.name === 'NotFoundError') {
            return null;
        }
        throw err;
    }
}

/**
 * Generate RawBT ESC/POS URL (`rawbt:base64,...`) for fallback Android Bluetooth printing
 */
export function generateRawBtPrintUrl(
    receipt: ReceiptData,
    widthOrOptions: PaperWidth | ReceiptFormatOptions = '58mm',
): string {
    const opts: ReceiptFormatOptions =
        typeof widthOrOptions === 'string'
            ? { paper_width: widthOrOptions }
            : widthOrOptions || {};
    const buffer = buildEscPosBuffer(receipt, opts);
    const base64 = uint8ArrayToBase64(buffer);
    return `rawbt:base64,${base64}`;
}

/**
 * Print ESC/POS receipt via Native Android APK Bluetooth Bridge
 */
export function printThermalBluetoothNative(
    receipt: ReceiptData,
    widthOrOptions: PaperWidth | ReceiptFormatOptions = '58mm',
    targetAddress?: string,
): Promise<{ success: boolean; needSelectPrinter?: boolean; message: string; name?: string; address?: string }> {
    return new Promise((resolve) => {
        if (!isAndroidNativeBluetoothAvailable()) {
            resolve({
                success: false,
                message: 'Fitur Bluetooth Native Android belum aktif.',
            });
            return;
        }

        const opts: ReceiptFormatOptions =
            typeof widthOrOptions === 'string'
                ? { paper_width: widthOrOptions }
                : widthOrOptions || {};
        const copies = Math.max(1, Number(opts.copies) || 1);
        const buffer = buildEscPosBuffer(receipt, opts);
        const base64 = uint8ArrayToBase64(buffer);
        const saved = getSavedBluetoothPrinter();
        const addressToUse = targetAddress || saved?.address || '';

        let settled = false;
        const timeoutId = window.setTimeout(() => {
            if (settled) return;
            settled = true;
            window.removeEventListener('sanubari-bt-print-result', handlePrintResult as EventListener);
            resolve({
                success: false,
                message: 'Waktu cetak habis (timeout). Pastikan printer Bluetooth menyala dan kertas tersedia.',
            });
        }, 20000);

        const handlePrintResult = (e: CustomEvent) => {
            if (settled) return;
            settled = true;
            window.clearTimeout(timeoutId);
            window.removeEventListener('sanubari-bt-print-result', handlePrintResult as EventListener);
            const detail = e.detail || {};
            resolve({
                success: Boolean(detail.success),
                needSelectPrinter: Boolean(detail.needSelectPrinter),
                name: detail.name,
                address: detail.address,
                message: detail.message || (detail.success ? 'Struk berhasil dicetak!' : 'Gagal mencetak struk.'),
            });
        };

        window.addEventListener('sanubari-bt-print-result', handlePrintResult as EventListener);

        try {
            (window as any).SanubariAndroidBluetooth.printEscPosBase64(base64, addressToUse, copies);
        } catch (err: any) {
            if (!settled) {
                settled = true;
                window.clearTimeout(timeoutId);
                window.removeEventListener('sanubari-bt-print-result', handlePrintResult as EventListener);
                resolve({
                    success: false,
                    message: err?.message || 'Gagal mengirim data cetak ke printer Bluetooth.',
                });
            }
        }
    });
}

/**
 * Direct print to Bluetooth Thermal Printer (Supports Native Android APK Bridge & Web Bluetooth API)
 */
export async function printThermalBluetooth(
    receipt: ReceiptData,
    widthOrOptions: PaperWidth | ReceiptFormatOptions = '58mm',
    targetAddress?: string,
): Promise<boolean> {
    // 1. Native Android POS APK Bridge (SPP / RFCOMM Classic & Dual-Mode Printers)
    if (isAndroidNativeBluetoothAvailable()) {
        const result = await printThermalBluetoothNative(receipt, widthOrOptions, targetAddress);
        if (!result.success) {
            const err: any = new Error(result.message);
            err.needSelectPrinter = result.needSelectPrinter;
            throw err;
        }
        return true;
    }

    // 2. Web Bluetooth API (Chrome Android / Desktop)
    const nav = navigator as any;
    if (!nav.bluetooth) {
        const err: any = new Error(
            'Web Bluetooth tidak didukung di WebView ini. Gunakan fitur Pencarian Printer Bluetooth di aplikasi.',
        );
        err.code = 'BT_UNSUPPORTED_WEBVIEW';
        throw err;
    }

    const opts: ReceiptFormatOptions =
        typeof widthOrOptions === 'string'
            ? { paper_width: widthOrOptions }
            : widthOrOptions || {};
    const copies = Math.max(1, Number(opts.copies) || 1);

    try {
        let writeChar = activeWebBtCharacteristic;
        if (!writeChar || !activeWebBtDevice?.gatt?.connected) {
            const connected = await scanAndConnectWebBluetoothPrinter();
            if (!connected) {
                return false;
            }
            writeChar = activeWebBtCharacteristic;
        }

        if (!writeChar) {
            throw new Error(
                'Tidak ditemukan karakteristik cetak pada printer Bluetooth ini.',
            );
        }

        const buffer = buildEscPosBuffer(receipt, opts);

        for (let c = 0; c < copies; c++) {
            const chunkSize = 100;
            for (let i = 0; i < buffer.length; i += chunkSize) {
                const chunk = buffer.slice(i, i + chunkSize);
                if (writeChar.properties.write) {
                    await writeChar.writeValueWithResponse(chunk);
                } else {
                    await writeChar.writeValueWithoutResponse(chunk);
                }
                await new Promise((r) => setTimeout(r, 20));
            }
            if (c < copies - 1) {
                await new Promise((r) => setTimeout(r, 600));
            }
        }

        return true;
    } catch (err: any) {
        activeWebBtCharacteristic = null;
        if (err.name === 'NotFoundError') {
            return false;
        }
        throw err;
    }
}

/**
 * Generate formatted WhatsApp link with e-receipt text
 */
export function generateWhatsAppReceiptUrl(
    receipt: ReceiptData,
    customerPhone?: string,
): string {
    const phone = (customerPhone || receipt.customer_phone || '').replace(
        /[^0-9]/g,
        '',
    );
    let normalizedPhone = phone;
    if (normalizedPhone.startsWith('0')) {
        normalizedPhone = '62' + normalizedPhone.substring(1);
    }

    const itemsText = groupReceiptItemsForDisplay(receipt.items)
        .map((entry, idx) => {
            if (entry.type === 'bundle') {
                const subLines = entry.items
                    .map((bi, bIdx) => {
                        const cleanVar = cleanVariantLabelForReceipt(bi.variant_label);
                        const variant =
                            cleanVar &&
                            cleanVar !== 'Default' &&
                            cleanVar !== 'Standar' &&
                            cleanVar !== 'Standard'
                                ? ` (${cleanVar})`
                                : '';
                        return `   ITEM ${bIdx + 1}: ${bi.product_name}${variant} (${bi.unit_qty}x = Rp ${formatRp(bi.discounted_line_price)})`;
                    })
                    .join('\n');
                return `${idx + 1}. *${entry.bundleName}* (${entry.bundleQty}x)\n${subLines}\n   Total Paket: Rp ${formatRp(entry.totalDiscounted)}`;
            }
            const i = entry.item;
            const cleanVar = cleanVariantLabelForReceipt(i.variant_label);
            const variant = cleanVar ? ` (${cleanVar})` : '';
            return `${idx + 1}. *${i.product_name}*${variant}\n   ${i.quantity}x @ Rp ${formatRp(i.price)} = Rp ${formatRp(i.subtotal)}${i.custom_notes && !/^Bundling:/i.test(i.custom_notes) ? `\n   _${i.custom_notes}_` : ''}`;
        })
        .join('\n\n');

    let text = `*${receipt.store_name.toUpperCase()}*\n`;
    text += `_${receipt.tagline || 'Specialty Coffee Roastery'}_\n`;
    text += `========================================\n`;
    text += `*STRUK PEMBELIAN*\n`;
    text += `========================================\n`;
    text += `No. Struk : #${receipt.order_number}\n`;
    text += `Tanggal   : ${receipt.date}\n`;
    text += `Kasir     : ${receipt.cashier_name}\n`;
    if (receipt.customer_name && receipt.customer_name !== 'Pelanggan Kasir') {
        text += `Pelanggan : ${receipt.customer_name}\n`;
    }
    if (receipt.customer_phone && receipt.customer_phone !== '-') {
        text += `Telepon   : ${receipt.customer_phone}\n`;
    }
    if (
        receipt.customer_address &&
        receipt.customer_address !== 'Toko Fisik / POS Kasir'
    ) {
        text += `Alamat    : ${receipt.customer_address}\n`;
    }
    if (receipt.shipping_courier && (receipt.shipping_cost || 0) > 0) {
        text += `Ekspedisi : ${receipt.shipping_courier}\n`;
    }
    text += `----------------------------------------\n`;
    text += `*RINCIAN PESANAN:*\n\n`;
    text += `${itemsText}\n`;
    text += `----------------------------------------\n`;
    text += `Subtotal  : Rp ${formatRp(receipt.subtotal)}\n`;
    if (receipt.discount_amount > 0) {
        text += `Diskon    : -Rp ${formatRp(receipt.discount_amount)}\n`;
    }
    if (receipt.shipping_cost && receipt.shipping_cost > 0) {
        text += `Ongkir    : Rp ${formatRp(receipt.shipping_cost)}\n`;
    }
    const dpSumWa = extractDpSummaryFromItems(receipt.items);
    if (dpSumWa) {
        text += `Total Full: Rp ${formatRp(dpSumWa.totalFull)}\n`;
        text += `DP (${dpSumWa.dpPercentLabel}) : Rp ${formatRp(dpSumWa.dpPaid)}\n`;
        text += `Sisa Bayar: Rp ${formatRp(dpSumWa.dpRemaining)}\n`;
    }
    text += `*TOTAL    : Rp ${formatRp(receipt.total_amount)}*\n`;
    text += `Metode    : ${receipt.payment_method_label}\n`;
    if (receipt.cash_tendered && receipt.cash_tendered > 0) {
        text += `Tunai     : Rp ${formatRp(receipt.cash_tendered)}\n`;
        text += `Kembalian : Rp ${formatRp(receipt.cash_change || 0)}\n`;
    }
    text += `----------------------------------------\n`;
    text += `${receipt.footer_note || 'Terima kasih telah berbelanja di Alat Kopi Malang!'}\n`;
    if (receipt.instagram) {
        text += `\nInstagram: https://instagram.com/${receipt.instagram.replace('@', '')}\n`;
    }

    const encoded = encodeURIComponent(text);
    return normalizedPhone
        ? `https://wa.me/${normalizedPhone}?text=${encoded}`
        : `https://wa.me/?text=${encoded}`;
}

/**
 * Build plain text representation of the Sales Report
 */
export function generatePlainTextSalesReport(
    report: SalesReportData,
    width: PaperWidth = '58mm',
): string {
    const cols = width === '80mm' ? 42 : 32;
    const divider = '-'.repeat(cols);
    const doubleDivider = '='.repeat(cols);

    const lines: string[] = [];

    // Header
    lines.push(padBoth(report.store_name.toUpperCase(), cols));
    lines.push(padBoth('RINGKASAN PENJUALAN POS', cols));
    lines.push(doubleDivider);

    // Period Info
    lines.push(padLine('Periode:', report.period_title, cols));
    lines.push(padLine('Dicetak:', report.printed_at, cols));
    lines.push(padLine('Kasir:', report.cashier_name, cols));
    lines.push(divider);

    // Overview
    lines.push(
        padLine('Total Transaksi', `${report.total_transactions} Trx`, cols),
    );
    lines.push(
        padLine('Total Omset', `Rp ${formatRp(report.total_revenue)}`, cols),
    );
    lines.push(
        padLine(
            'Rata-rata/Trx',
            `Rp ${formatRp(report.average_order_value)}`,
            cols,
        ),
    );
    lines.push(divider);

    // Payment Breakdown
    lines.push(padBoth('METODE PEMBAYARAN', cols));
    for (const p of report.payment_breakdown) {
        lines.push(
            padLine(`${p.label} (${p.count})`, `Rp ${formatRp(p.total)}`, cols),
        );
    }
    lines.push(divider);

    // Cash Drawer
    if (report.cash_drawer) {
        lines.push(padBoth('ARUS KAS TUNAI LACI', cols));
        lines.push(
            padLine(
                'Penjualan Tunai',
                `+Rp ${formatRp(report.cash_drawer.cash_sales)}`,
                cols,
            ),
        );
        lines.push(
            padLine(
                'Kas Masuk Lain',
                `+Rp ${formatRp(report.cash_drawer.cash_in)}`,
                cols,
            ),
        );
        lines.push(
            padLine(
                'Kas Keluar Toko',
                `-Rp ${formatRp(report.cash_drawer.cash_out)}`,
                cols,
            ),
        );
        lines.push(
            padLine(
                'TOTAL KAS DI LACI',
                `Rp ${formatRp(report.cash_drawer.net_cash)}`,
                cols,
            ),
        );
        lines.push(divider);
    }

    // Top Products
    if (report.top_products && report.top_products.length > 0) {
        lines.push(padBoth('PRODUK TERLARIS', cols));
        for (const tp of report.top_products.slice(0, 5)) {
            lines.push(
                tp.name.length > cols ? tp.name.substring(0, cols) : tp.name,
            );
            lines.push(
                padLine(
                    `  ${tp.quantity}x (${tp.variant})`,
                    `Rp ${formatRp(tp.total)}`,
                    cols,
                ),
            );
        }
        lines.push(divider);
    }

    lines.push(doubleDivider);
    lines.push(padBoth('LAPORAN RESMI POS SANUBARI', cols));

    return lines.join('\n');
}

/**
 * Print sales report thermal receipt without opening a preview popup window
 */
export function printSalesReportThermalWeb(
    report: SalesReportData,
    paperWidth: PaperWidth = '58mm',
): void {
    const rawText = generatePlainTextSalesReport(report, paperWidth);
    const printWidth = paperWidth === '80mm' ? '76mm' : '48mm';
    const paperSize = paperWidth === '80mm' ? '80mm auto' : '58mm auto';

    const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Laporan Penjualan - ${report.period_title}</title>
    <style>
        @page {
            size: ${paperSize};
            margin: 0;
        }
        body {
            margin: 0;
            padding: 2mm;
            width: ${printWidth};
            font-family: 'Courier New', Courier, monospace, -apple-system;
            font-size: ${paperWidth === '80mm' ? '12px' : '10.5px'};
            line-height: 1.25;
            color: #000;
            background: #fff;
        }
        pre {
            margin: 0;
            white-space: pre-wrap;
            word-break: break-word;
            font-family: inherit;
            font-size: inherit;
        }
        @media print {
            body {
                width: 100%;
                padding: 0;
            }
        }
    </style>
</head>
<body>
    <pre>${rawText.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>
</body>
</html>
    `;

    printHtmlSilentlyViaHiddenIframe(html, rawText, 1, false, paperWidth);
}

/**
 * Generate formatted plain text for Profit & Loss thermal receipt
 */
export function generatePlainTextProfitLossReport(
    report: ProfitLossReportData,
    width: PaperWidth = '58mm',
    options?: ReceiptFormatOptions,
): string {
    const cols = options?.receipt_columns || (width === '80mm' ? 42 : 32);
    const divider = '-'.repeat(cols);
    const doubleDivider = '='.repeat(cols);

    const lines: string[] = [];

    // Header
    lines.push(padBoth(report.store_name.toUpperCase(), cols));
    lines.push(padBoth('LAPORAN LABA RUGI (P&L)', cols));
    lines.push(doubleDivider);

    // Period Info
    lines.push(padLine('Periode:', report.period_title, cols));
    lines.push(padLine('Dicetak:', report.printed_at, cols));
    lines.push(padLine('Kasir:', report.cashier_name, cols));
    lines.push(divider);

    // 1. Pendapatan Penjualan
    lines.push(padBoth('1. PENDAPATAN PENJUALAN', cols));
    lines.push(
        padLine('Total Transaksi', `${report.total_transactions} Trx`, cols),
    );
    lines.push(padLine('Barang Terjual', `${report.items_sold} Item`, cols));
    lines.push(
        padLine('Penjualan Kotor', `Rp ${formatRp(report.gross_sales)}`, cols),
    );
    if (report.total_discounts > 0) {
        lines.push(
            padLine(
                'Diskon Penjualan',
                `-Rp ${formatRp(report.total_discounts)}`,
                cols,
            ),
        );
    }
    lines.push(
        padLine('PENJUALAN BERSIH', `Rp ${formatRp(report.net_sales)}`, cols),
    );
    lines.push(divider);

    // 2. Harga Pokok Penjualan (HPP)
    lines.push(padBoth('2. HARGA POKOK PENJUALAN', cols));
    lines.push(
        padLine('Total HPP (COGS)', `-Rp ${formatRp(report.total_cogs)}`, cols),
    );
    lines.push(divider);

    // 3. Laba Kotor
    lines.push(padBoth('3. LABA KOTOR (GROSS)', cols));
    lines.push(
        padLine('Laba Kotor', `Rp ${formatRp(report.gross_profit)}`, cols),
    );
    lines.push(padLine('Gross Margin', `${report.gross_margin_pct}%`, cols));
    lines.push(divider);

    // 4. Beban Kas Toko / Operasional
    if (
        report.total_expenses > 0 ||
        (report.expense_breakdown && report.expense_breakdown.length > 0)
    ) {
        lines.push(padBoth('4. BEBAN KAS OPERASIONAL', cols));
        if (report.expense_breakdown) {
            for (const exp of report.expense_breakdown) {
                lines.push(
                    padLine(
                        `- ${exp.label}`,
                        `-Rp ${formatRp(exp.total)}`,
                        cols,
                    ),
                );
            }
        }
        lines.push(
            padLine(
                'TOTAL BEBAN KAS',
                `-Rp ${formatRp(report.total_expenses)}`,
                cols,
            ),
        );
        lines.push(divider);
    }

    // 5. Pendapatan Lain-lain
    if (report.other_income > 0) {
        lines.push(
            padLine(
                'Pendapatan Lain',
                `+Rp ${formatRp(report.other_income)}`,
                cols,
            ),
        );
        lines.push(divider);
    }

    // 6. Laba Bersih
    lines.push(doubleDivider);
    lines.push(
        padLine('LABA BERSIH (NET)', `Rp ${formatRp(report.net_profit)}`, cols),
    );
    lines.push(padLine('Net Profit Margin', `${report.net_margin_pct}%`, cols));
    lines.push(doubleDivider);
    lines.push(padBoth('ALAT KOPI MALANG POS', cols));

    const feedLinesCount = options?.margin_feed_lines || 2;
    for (let f = 0; f < feedLinesCount; f++) {
        lines.push('');
    }

    return lines.join('\n');
}

/**
 * Print Profit & Loss Report thermal receipt without opening a preview popup window
 */
export function printProfitLossThermalWeb(
    report: ProfitLossReportData,
    paperWidth: PaperWidth = '58mm',
    options?: ReceiptFormatOptions,
): void {
    const rawText = generatePlainTextProfitLossReport(
        report,
        paperWidth,
        options,
    );

    const printWidth = paperWidth === '80mm' ? '76mm' : '48mm';
    const paperSize = paperWidth === '80mm' ? '80mm auto' : '58mm auto';
    const marginHorizontal = options?.margin_horizontal || '1mm';

    const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Laporan Laba Rugi - ${report.period_title}</title>
    <style>
        @page {
            size: ${paperSize};
            margin-left: ${marginHorizontal};
            margin-right: ${marginHorizontal};
            margin-top: 0;
            margin-bottom: 0;
        }
        body {
            margin: 0;
            padding: 2mm ${marginHorizontal};
            width: ${printWidth};
            font-family: 'Courier New', Courier, monospace, -apple-system;
            font-size: ${paperWidth === '80mm' ? '12px' : '10.5px'};
            line-height: 1.25;
            color: #000;
            background: #fff;
        }
        pre {
            margin: 0;
            white-space: pre-wrap;
            word-break: break-word;
            font-family: inherit;
            font-size: inherit;
        }
        @media print {
            body {
                width: 100%;
                padding: 0;
            }
        }
    </style>
</head>
<body>
    <pre>${rawText.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>
</body>
</html>
    `;

    printHtmlSilentlyViaHiddenIframe(html, rawText, 1, false, paperWidth);
}

/**
 * Generate formatted WhatsApp pre-bill text before payment
 */
export function generatePreBillWhatsAppText(preBill: PreBillData): string {
    const itemsText = preBill.items
        .map((i, idx) => {
            const cleanVar = cleanVariantLabelForReceipt(i.variant_label);
            const variant = cleanVar ? ` (${cleanVar})` : '';
            return `${idx + 1}. *${i.product_name}*${variant}\n   ${i.quantity}x @ Rp ${formatRp(i.price)} = Rp ${formatRp(i.subtotal)}${i.custom_notes && !/^Bundling:/i.test(i.custom_notes) ? `\n   _${i.custom_notes}_` : ''}`;
        })
        .join('\n\n');

    let text = `*${preBill.store_name.toUpperCase()}*\n`;
    if (preBill.tagline) {
        text += `_${preBill.tagline}_\n`;
    }
    text += `========================================\n`;
    text += `*ESTIMASI PESANAN (PRE-BILL)*\n`;
    text += `========================================\n`;
    text += `Status    : Menunggu Pembayaran\n`;
    text += `Waktu     : ${preBill.date}\n`;
    text += `Kasir     : ${preBill.cashier_name}\n`;
    if (preBill.customer_name && preBill.customer_name.trim()) {
        text += `Pelanggan : ${preBill.customer_name.trim()}\n`;
    }
    if (preBill.customer_phone && preBill.customer_phone.trim()) {
        text += `Telepon   : ${preBill.customer_phone.trim()}\n`;
    }
    if (preBill.customer_address && preBill.customer_address.trim()) {
        text += `Alamat    : ${preBill.customer_address.trim()}\n`;
    }
    if (preBill.shipping_courier && (preBill.shipping_cost || 0) > 0) {
        text += `Ekspedisi : ${preBill.shipping_courier.trim()}\n`;
    }
    if (preBill.notes && preBill.notes.trim()) {
        text += `Catatan   : ${preBill.notes.trim()}\n`;
    }
    text += `----------------------------------------\n`;
    text += `*RINCIAN PESANAN:*\n\n`;
    text += `${itemsText}\n`;
    text += `----------------------------------------\n`;
    text += `Subtotal  : Rp ${formatRp(preBill.subtotal)}\n`;
    if (preBill.discount_amount > 0) {
        text += `Diskon    : -Rp ${formatRp(preBill.discount_amount)}\n`;
    }
    if (preBill.shipping_cost && preBill.shipping_cost > 0) {
        text += `Ongkir    : Rp ${formatRp(preBill.shipping_cost)}\n`;
    }
    text += `*TOTAL TAGIHAN : Rp ${formatRp(preBill.total_amount)}*\n`;
    text += `----------------------------------------\n`;

    if (preBill.bank_info || preBill.qris_instructions) {
        text += `*Informasi Pembayaran:*\n`;
        if (preBill.bank_info) {
            text += `- Rekening: ${preBill.bank_info}\n`;
        }
        if (preBill.qris_instructions) {
            text += `- QRIS: ${preBill.qris_instructions}\n`;
        }
        text += `----------------------------------------\n`;
    }

    text += `Silakan konfirmasi pesanan ini atau lakukan pembayaran di kasir / transfer bank.\nTerima kasih!\n`;
    if (preBill.instagram) {
        text += `\nInstagram: https://instagram.com/${preBill.instagram.replace('@', '')}\n`;
    }

    return text;
}

/**
 * Generate WhatsApp URL for sharing pre-bill before payment
 */
export function generatePreBillWhatsAppUrl(
    preBill: PreBillData,
    customerPhone?: string,
): string {
    const rawPhone = (customerPhone || preBill.customer_phone || '').replace(
        /[^0-9]/g,
        '',
    );
    let normalizedPhone = rawPhone;
    if (normalizedPhone.startsWith('0')) {
        normalizedPhone = '62' + normalizedPhone.substring(1);
    }
    const text = generatePreBillWhatsAppText(preBill);
    const encoded = encodeURIComponent(text);
    return normalizedPhone
        ? `https://wa.me/${normalizedPhone}?text=${encoded}`
        : `https://wa.me/?text=${encoded}`;
}

/**
 * Build plain text representation of the Pre-Bill
 */
export function generatePlainTextPreBill(
    preBill: PreBillData,
    width: PaperWidth = '58mm',
): string {
    const cols = width === '80mm' ? 42 : 32;
    const divider = '-'.repeat(cols);
    const doubleDivider = '='.repeat(cols);

    const lines: string[] = [];

    // Header
    lines.push(padBoth(preBill.store_name.toUpperCase(), cols));
    if (preBill.tagline) lines.push(padBoth(preBill.tagline, cols));
    if (preBill.address) lines.push(padBoth(preBill.address, cols));
    if (preBill.phone) lines.push(padBoth(`Telp/WA: ${preBill.phone}`, cols));
    lines.push(doubleDivider);

    lines.push(padBoth('ESTIMASI PESANAN (PRE-BILL)', cols));
    lines.push(padBoth('** BELUM DIBAYAR **', cols));
    lines.push(divider);

    lines.push(padLine('Waktu:', preBill.date, cols));
    lines.push(padLine('Kasir:', preBill.cashier_name, cols));
    if (preBill.customer_name) {
        lines.push(padLine('Pelanggan:', preBill.customer_name, cols));
    }
    if (preBill.customer_phone) {
        lines.push(padLine('Telp/WA:', preBill.customer_phone, cols));
    }
    if (preBill.customer_address) {
        lines.push(`Alamat: ${preBill.customer_address}`);
    }
    lines.push(divider);

    // Items
    for (const item of preBill.items) {
        const title =
            item.product_name.length > cols
                ? item.product_name.substring(0, cols)
                : item.product_name;
        lines.push(title);
        const cleanVar = cleanVariantLabelForReceipt(item.variant_label);
        const detail = cleanVar
            ? `  ${item.quantity}x @${formatRp(item.price)} (${cleanVar})`
            : `  ${item.quantity}x @${formatRp(item.price)}`;
        const itemSubtotal = `Rp ${formatRp(item.subtotal)}`;
        lines.push(padLine(detail, itemSubtotal, cols));
    }
    lines.push(divider);

    // Totals
    lines.push(padLine('Subtotal', `Rp ${formatRp(preBill.subtotal)}`, cols));
    if (preBill.discount_amount > 0) {
        lines.push(
            padLine('Diskon', `-Rp ${formatRp(preBill.discount_amount)}`, cols),
        );
    }
    if (preBill.shipping_cost && preBill.shipping_cost > 0) {
        const courierTag = preBill.shipping_courier
            ? ` (${preBill.shipping_courier})`
            : '';
        lines.push(
            padLine(
                `Ongkir${courierTag}`,
                `Rp ${formatRp(preBill.shipping_cost)}`,
                cols,
            ),
        );
    }
    lines.push(doubleDivider);
    lines.push(
        padLine('TOTAL TAGIHAN', `Rp ${formatRp(preBill.total_amount)}`, cols),
    );
    lines.push(divider);

    if (preBill.bank_info) {
        lines.push(padBoth('PEMBAYARAN TRANSFER:', cols));
        lines.push(padBoth(preBill.bank_info, cols));
        lines.push(divider);
    }

    lines.push(padBoth('Silakan lakukan pembayaran di kasir', cols));
    lines.push(padBoth('Terima kasih!', cols));

    return lines.join('\n');
}

/**
 * Print Pre-Bill receipt without opening a preview popup window
 */
export function printPreBillThermalWeb(
    preBill: PreBillData,
    paperWidth: PaperWidth = '58mm',
): void {
    const rawText = generatePlainTextPreBill(preBill, paperWidth);
    const printWidth = paperWidth === '80mm' ? '76mm' : '48mm';
    const paperSize = paperWidth === '80mm' ? '80mm auto' : '58mm auto';

    const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Pre-Bill / Estimasi Pesanan</title>
    <style>
        @page {
            size: ${paperSize};
            margin: 0;
        }
        body {
            margin: 0;
            padding: 2mm;
            width: ${printWidth};
            font-family: 'Courier New', Courier, monospace, -apple-system;
            font-size: ${paperWidth === '80mm' ? '12px' : '10.5px'};
            line-height: 1.25;
            color: #000;
            background: #fff;
        }
        pre {
            margin: 0;
            white-space: pre-wrap;
            word-break: break-word;
            font-family: inherit;
            font-size: inherit;
        }
        @media print {
            body {
                width: 100%;
                padding: 0;
            }
        }
    </style>
</head>
<body>
    <pre>${rawText.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>
</body>
</html>
    `;

    printHtmlSilentlyViaHiddenIframe(html, rawText, 1, false, paperWidth);
}

/**
 * Build a pure vector A4 PDF-1.4 binary (Uint8Array) for a POS Digital Invoice / Pre-Bill
 */
export function buildA4InvoicePdfBytes(preBill: PreBillData): Uint8Array {
    const PAGE_W = 595.28;
    const PAGE_H = 841.89;
    const marginX = 42.0;
    const contentWidth = PAGE_W - marginX * 2;
    const rightX = PAGE_W - marginX;

    const escapePdf = (str: string): string => {
        const clean = (str || '')
            .replace(/[•★]/g, '*')
            .replace(/[—–]/g, '-')
            .replace(/[“”]/g, '"')
            .replace(/[‘’]/g, "'")
            .replace(/[^\x20-\x7E]/g, '');
        return clean.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
    };

    const truncateStr = (str: string, max: number): string => {
        const s = (str || '').trim();
        return s.length <= max ? s : s.slice(0, max - 3) + '...';
    };

    const wrapText = (str: string, maxChars: number): string[] => {
        const clean = (str || '').replace(/\s+/g, ' ').trim();
        if (!clean) return [];
        const words = clean.split(' ');
        const lines: string[] = [];
        let cur = '';
        for (const w of words) {
            if (!cur) {
                cur = w;
            } else if ((cur + ' ' + w).length <= maxChars) {
                cur += ' ' + w;
            } else {
                lines.push(cur);
                cur = w;
            }
        }
        if (cur) lines.push(cur);
        return lines;
    };

    const estimateWidth = (str: string, font: 'F1' | 'F2' | 'F3' | 'F4', size: number): number => {
        const s = (str || '').replace(/[^\x20-\x7E]/g, '');
        if (font === 'F4') return s.length * size * 0.6;
        const factor = font === 'F2' ? 0.55 : 0.51;
        let w = 0;
        for (let i = 0; i < s.length; i++) {
            const ch = s[i];
            if ("ilI1.,:;!| '()".includes(ch)) {
                w += size * 0.28;
            } else if ('MW@%mw'.includes(ch)) {
                w += size * 0.78;
            } else if (ch >= 'A' && ch <= 'Z') {
                w += size * (factor + 0.09);
            } else {
                w += size * factor;
            }
        }
        return w;
    };

    const textOp = (
        x: number,
        topY: number,
        txt: string,
        font: 'F1' | 'F2' | 'F3' | 'F4',
        size: number,
        rgb: [number, number, number],
    ): string => {
        const pdfY = PAGE_H - topY;
        return `BT /${font} ${size.toFixed(2)} Tf ${rgb[0].toFixed(3)} ${rgb[1].toFixed(3)} ${rgb[2].toFixed(3)} rg ${x.toFixed(2)} ${pdfY.toFixed(2)} Td (${escapePdf(txt)}) Tj ET`;
    };

    const textRightOp = (
        rX: number,
        topY: number,
        txt: string,
        font: 'F1' | 'F2' | 'F3' | 'F4',
        size: number,
        rgb: [number, number, number],
    ): string => {
        const w = estimateWidth(txt, font, size);
        return textOp(Math.max(12, rX - w), topY, txt, font, size, rgb);
    };

    const textCenterOp = (
        boxX: number,
        boxW: number,
        topY: number,
        txt: string,
        font: 'F1' | 'F2' | 'F3' | 'F4',
        size: number,
        rgb: [number, number, number],
    ): string => {
        const w = estimateWidth(txt, font, size);
        return textOp(boxX + Math.max(0, (boxW - w) / 2), topY, txt, font, size, rgb);
    };

    const rectOp = (
        x: number,
        topY: number,
        w: number,
        h: number,
        fillRgb: [number, number, number] | null,
        strokeRgb: [number, number, number] | null,
        lineW = 1.0,
    ): string => {
        const pdfY = PAGE_H - (topY + h);
        const cmds: string[] = ['q'];
        if (fillRgb) {
            cmds.push(`${fillRgb[0].toFixed(3)} ${fillRgb[1].toFixed(3)} ${fillRgb[2].toFixed(3)} rg`);
        }
        if (strokeRgb) {
            cmds.push(
                `${strokeRgb[0].toFixed(3)} ${strokeRgb[1].toFixed(3)} ${strokeRgb[2].toFixed(3)} RG ${lineW.toFixed(2)} w`,
            );
        }
        const op = fillRgb && strokeRgb ? 'B' : fillRgb ? 'f' : 'S';
        cmds.push(`${x.toFixed(2)} ${pdfY.toFixed(2)} ${w.toFixed(2)} ${h.toFixed(2)} re ${op} Q`);
        return cmds.join(' ');
    };

    const lineOp = (
        x1: number,
        topY1: number,
        x2: number,
        topY2: number,
        rgb: [number, number, number],
        lineW = 1.0,
    ): string => {
        const y1 = PAGE_H - topY1;
        const y2 = PAGE_H - topY2;
        return `q ${rgb[0].toFixed(3)} ${rgb[1].toFixed(3)} ${rgb[2].toFixed(3)} RG ${lineW.toFixed(2)} w ${x1.toFixed(2)} ${y1.toFixed(2)} m ${x2.toFixed(2)} ${y2.toFixed(2)} l S Q`;
    };

    const storeName = (preBill.store_name || 'ALAT KOPI MALANG').toUpperCase();
    const tagline = preBill.tagline || 'Close to Your Every Brew';
    const address =
        preBill.address || 'Ruko Tlogomas Square Kav. 34, Jl. Raya Tlogomas, Lowokwaru, Kota Malang';
    const phone = preBill.phone || '+6282132095241';
    const date = preBill.date || '';
    const cashierName = preBill.cashier_name || 'Kasir Sanubari';
    const customerName = (preBill.customer_name || '').trim() || 'Pelanggan Sanubari';
    const isPaid = Boolean(preBill.notes && preBill.notes.toLowerCase().includes('no. struk:'));

    const ops: string[] = [];
    ops.push(rectOp(0, 0, PAGE_W, PAGE_H, [1, 1, 1], null));

    const topY = 42.0;
    ops.push(textOp(marginX, topY + 16, storeName, 'F2', 17, [0.067, 0.094, 0.153]));
    ops.push(textOp(marginX, topY + 31, tagline, 'F3', 9.5, [0.294, 0.333, 0.388]));

    let addrY = topY + 46;
    for (const aLine of wrapText(address, 58)) {
        ops.push(textOp(marginX, addrY, aLine, 'F1', 8.5, [0.42, 0.447, 0.502]));
        addrY += 12;
    }
    ops.push(textOp(marginX, addrY, `Telp/WA: ${phone}`, 'F1', 8.5, [0.42, 0.447, 0.502]));

    const badgeW = 166.0;
    const badgeX = rightX - badgeW;
    ops.push(
        rectOp(badgeX, topY + 2, badgeW, 18.0, [0.925, 0.992, 0.961], [0.655, 0.953, 0.816], 0.8),
    );
    ops.push(
        textCenterOp(
            badgeX,
            badgeW,
            topY + 14,
            'FAKTUR PENJUALAN DIGITAL (A4)',
            'F2',
            8.0,
            [0.024, 0.373, 0.275],
        ),
    );

    ops.push(textRightOp(rightX, topY + 34, `Waktu: ${date} WIB`, 'F2', 9.5, [0.067, 0.094, 0.153]));
    ops.push(textRightOp(rightX, topY + 48, `Kasir: ${cashierName}`, 'F1', 9.0, [0.294, 0.333, 0.388]));

    const pillText = isPaid ? 'LUNAS (PAID)' : 'ESTIMASI (PRE-BILL)';
    const pillW = isPaid ? 86.0 : 112.0;
    const pillX = rightX - pillW;
    if (isPaid) {
        ops.push(
            rectOp(pillX, topY + 55, pillW, 16.0, [0.82, 0.98, 0.898], [0.431, 0.906, 0.718], 0.8),
        );
        ops.push(
            textCenterOp(pillX, pillW, topY + 66, pillText, 'F2', 8.0, [0.024, 0.373, 0.275]),
        );
    } else {
        ops.push(
            rectOp(pillX, topY + 55, pillW, 16.0, [0.996, 0.953, 0.78], [0.992, 0.902, 0.541], 0.8),
        );
        ops.push(
            textCenterOp(pillX, pillW, topY + 66, pillText, 'F2', 8.0, [0.471, 0.208, 0.059]),
        );
    }

    const headerBottomY = Math.max(addrY + 14, topY + 82);
    ops.push(lineOp(marginX, headerBottomY, rightX, headerBottomY, [0.067, 0.094, 0.153], 1.8));

    const custTopY = headerBottomY + 18;
    ops.push(textOp(marginX, custTopY, 'DITUJUKAN KEPADA:', 'F2', 8.0, [0.612, 0.639, 0.686]));
    ops.push(textOp(marginX, custTopY + 15, customerName, 'F2', 12.5, [0.067, 0.094, 0.153]));

    let custExtraY = custTopY + 29;
    if (preBill.customer_phone && preBill.customer_phone !== '-') {
        ops.push(
            textOp(
                marginX,
                custExtraY,
                `No. WhatsApp: ${preBill.customer_phone}`,
                'F1',
                9.0,
                [0.294, 0.333, 0.388],
            ),
        );
        custExtraY += 13;
    }
    if (preBill.customer_address && preBill.customer_address !== 'Toko Fisik / POS Kasir') {
        for (const cl of wrapText(`Alamat Kirim: ${preBill.customer_address}`, 56)) {
            ops.push(textOp(marginX, custExtraY, cl, 'F1', 8.5, [0.216, 0.255, 0.318]));
            custExtraY += 12;
        }
    }
    if (preBill.shipping_courier && (preBill.shipping_cost || 0) > 0) {
        ops.push(
            textOp(
                marginX,
                custExtraY,
                `Ekspedisi: ${preBill.shipping_courier}`,
                'F1',
                8.5,
                [0.294, 0.333, 0.388],
            ),
        );
        custExtraY += 12;
    }
    if (preBill.notes) {
        for (const nl of wrapText(`Catatan: ${preBill.notes}`, 60)) {
            ops.push(textOp(marginX, custExtraY, nl, 'F3', 8.5, [0.42, 0.447, 0.502]));
            custExtraY += 12;
        }
    }

    ops.push(textRightOp(rightX, custTopY, 'STATUS DOKUMEN:', 'F2', 8.0, [0.612, 0.639, 0.686]));
    ops.push(
        textRightOp(
            rightX,
            custTopY + 14,
            isPaid ? 'PEMBAYARAN LUNAS' : 'MENUNGGU PEMBAYARAN',
            'F2',
            9.5,
            isPaid ? [0.024, 0.373, 0.275] : [0.573, 0.251, 0.055],
        ),
    );
    ops.push(
        textRightOp(
            rightX,
            custTopY + 27,
            'POS Cashier Digital Invoice',
            'F1',
            8.5,
            [0.42, 0.447, 0.502],
        ),
    );

    const tableTopY = Math.max(custExtraY + 12, custTopY + 46);
    const colDescX = marginX + 34;
    const colPriceRight = rightX - 155;
    const colQtyCenter = rightX - 110;
    const colSubRight = rightX - 4;

    ops.push(textCenterOp(marginX, 28, tableTopY, 'NO', 'F2', 8.0, [0.294, 0.333, 0.388]));
    ops.push(
        textOp(colDescX, tableTopY, 'DESKRIPSI PRODUK & VARIAN', 'F2', 8.0, [0.294, 0.333, 0.388]),
    );
    ops.push(textRightOp(colPriceRight, tableTopY, 'HARGA', 'F2', 8.0, [0.294, 0.333, 0.388]));
    ops.push(
        textCenterOp(colQtyCenter - 20, 40, tableTopY, 'QTY', 'F2', 8.0, [0.294, 0.333, 0.388]),
    );
    ops.push(
        textRightOp(colSubRight, tableTopY, 'JUMLAH (IDR)', 'F2', 8.0, [0.294, 0.333, 0.388]),
    );

    let rowY = tableTopY + 8;
    ops.push(lineOp(marginX, rowY, rightX, rowY, [0.82, 0.835, 0.859], 1.3));

    const groupedA4Entries = groupReceiptItemsForDisplay(preBill.items);
    for (let idx = 0; idx < groupedA4Entries.length; idx++) {
        if (rowY > PAGE_H - 190) break;
        const entry = groupedA4Entries[idx];
        if (entry.type === 'bundle') {
            ops.push(
                textCenterOp(marginX, 28, rowY + 16, String(idx + 1), 'F4', 9.0, [0.42, 0.447, 0.502]),
            );
            ops.push(
                textOp(
                    colDescX,
                    rowY + 14,
                    truncateStr(entry.bundleName, 44),
                    'F2',
                    10.0,
                    [0.067, 0.094, 0.153],
                ),
            );
            let subY = rowY + 27;
            entry.items.forEach((bi, bIdx) => {
                const cleanVar = cleanVariantLabelForReceipt(bi.variant_label);
                const showVar = cleanVar && cleanVar !== 'Standard' && cleanVar !== 'Standar';
                const label = `ITEM ${bIdx + 1}: ${bi.product_name}${showVar ? ` (${cleanVar})` : ''} (${bi.unit_qty}x @ Rp ${formatRp(bi.discounted_line_price)})`;
                ops.push(
                    textOp(colDescX, subY, truncateStr(label, 58), 'F1', 8.0, [0.35, 0.38, 0.44]),
                );
                subY += 11;
            });
            ops.push(
                textRightOp(
                    colPriceRight,
                    rowY + 18,
                    `Rp ${formatRp(Math.round(entry.totalDiscounted / entry.bundleQty))}`,
                    'F1',
                    9.5,
                    [0.216, 0.255, 0.318],
                ),
            );
            ops.push(
                textCenterOp(
                    colQtyCenter - 20,
                    40,
                    rowY + 18,
                    `${entry.bundleQty}x`,
                    'F2',
                    9.5,
                    [0.067, 0.094, 0.153],
                ),
            );
            ops.push(
                textRightOp(
                    colSubRight,
                    rowY + 18,
                    `Rp ${formatRp(entry.totalDiscounted)}`,
                    'F2',
                    9.5,
                    [0.067, 0.094, 0.153],
                ),
            );
            rowY = Math.max(rowY + 34, subY + 6);
            ops.push(lineOp(marginX, rowY, rightX, rowY, [0.898, 0.906, 0.922], 0.7));
            continue;
        }
        const item = entry.item;
        ops.push(
            textCenterOp(marginX, 28, rowY + 16, String(idx + 1), 'F4', 9.0, [0.42, 0.447, 0.502]),
        );
        ops.push(
            textOp(
                colDescX,
                rowY + 14,
                truncateStr(item.product_name, 44),
                'F2',
                10.0,
                [0.067, 0.094, 0.153],
            ),
        );
        const cleanVar = cleanVariantLabelForReceipt(item.variant_label);
        let itemNoteY = rowY + 26;
        if (cleanVar) {
            ops.push(
                textOp(
                    colDescX,
                    rowY + 26,
                    `Varian: ${truncateStr(cleanVar, 48)}`,
                    'F1',
                    8.5,
                    [0.42, 0.447, 0.502],
                ),
            );
            itemNoteY = rowY + 37;
        }
        if (item.custom_notes && !/^Bundling:/i.test(item.custom_notes)) {
            const noteLines = wrapText(item.custom_notes, 54);
            for (const nl of noteLines) {
                ops.push(
                    textOp(colDescX, itemNoteY, nl, 'F1', 7.8, [0.012, 0.412, 0.631]),
                );
                itemNoteY += 10;
            }
        }
        ops.push(
            textRightOp(
                colPriceRight,
                rowY + 19,
                `Rp ${formatRp(item.price)}`,
                'F1',
                9.5,
                [0.216, 0.255, 0.318],
            ),
        );
        ops.push(
            textCenterOp(
                colQtyCenter - 20,
                40,
                rowY + 19,
                String(item.quantity),
                'F2',
                9.5,
                [0.067, 0.094, 0.153],
            ),
        );
        ops.push(
            textRightOp(
                colSubRight,
                rowY + 19,
                `Rp ${formatRp(item.subtotal)}`,
                'F2',
                9.5,
                [0.067, 0.094, 0.153],
            ),
        );
        rowY = Math.max(rowY + 34, itemNoteY + 4);
        ops.push(lineOp(marginX, rowY, rightX, rowY, [0.898, 0.906, 0.922], 0.7));
    }

    const bottomTopY = rowY + 18;
    const leftColW = contentWidth * 0.55;
    const rightColW = contentWidth * 0.4;
    const rightColX = rightX - rightColW;
    let leftCursorY = bottomTopY;

    if (preBill.bank_info || preBill.qris_instructions) {
        const bankLines: string[] = [];
        if (preBill.bank_info) {
            bankLines.push(...wrapText(`Rekening Bank: ${preBill.bank_info}`, 44));
        }
        if (preBill.qris_instructions) {
            bankLines.push(...wrapText(`QRIS: ${preBill.qris_instructions}`, 44));
        }
        const boxH = 26 + bankLines.length * 13;
        ops.push(
            rectOp(
                marginX,
                leftCursorY,
                leftColW,
                boxH,
                [0.976, 0.98, 0.984],
                [0.898, 0.906, 0.922],
                0.8,
            ),
        );
        ops.push(
            textOp(
                marginX + 10,
                leftCursorY + 15,
                'PETUNJUK PEMBAYARAN TRANSFER / QRIS:',
                'F2',
                8.5,
                [0.024, 0.373, 0.275],
            ),
        );
        let bY = leftCursorY + 29;
        for (const bl of bankLines) {
            ops.push(textOp(marginX + 10, bY, bl, 'F1', 8.5, [0.067, 0.094, 0.153]));
            bY += 13;
        }
        leftCursorY += boxH + 14;
    }

    const stampW = 148.0;
    const stampH = 44.0;
    ops.push(
        rectOp(marginX, leftCursorY, stampW, stampH, [1, 1, 1], [0.122, 0.161, 0.216], 1.4),
    );
    ops.push(
        textCenterOp(
            marginX,
            stampW,
            leftCursorY + 12,
            'ALAT KOPI MALANG',
            'F2',
            7.0,
            [0.42, 0.447, 0.502],
        ),
    );
    ops.push(
        textCenterOp(
            marginX,
            stampW,
            leftCursorY + 26,
            isPaid ? '* RESMI (LUNAS) *' : '* RESMI (PRE-BILL) *',
            'F2',
            9.5,
            [0.024, 0.373, 0.275],
        ),
    );
    ops.push(
        textCenterOp(
            marginX,
            stampW,
            leftCursorY + 38,
            `MALANG - ${date}`,
            'F4',
            6.8,
            [0.612, 0.639, 0.686],
        ),
    );

    const dpSumPdf = extractDpSummaryFromItems(preBill.items);
    let totalsRows = 1;
    if (dpSumPdf) totalsRows += 3;
    if (preBill.discount_amount > 0) totalsRows++;
    if ((preBill.shipping_cost || 0) > 0) totalsRows++;
    const totalsBoxH = 46 + totalsRows * 16;

    ops.push(
        rectOp(
            rightColX,
            bottomTopY,
            rightColW,
            totalsBoxH,
            [0.976, 0.98, 0.984],
            [0.898, 0.906, 0.922],
            0.8,
        ),
    );

    let tY = bottomTopY + 18;
    if (dpSumPdf) {
        ops.push(textOp(rightColX + 12, tY, 'Total Pesanan (Full):', 'F1', 9.0, [0.294, 0.333, 0.388]));
        ops.push(
            textRightOp(
                rightX - 12,
                tY,
                `Rp ${formatRp(dpSumPdf.totalFull)}`,
                'F2',
                9.0,
                [0.067, 0.094, 0.153],
            ),
        );
        tY += 16;

        ops.push(
            textOp(
                rightColX + 12,
                tY,
                `DP Dibayar (${dpSumPdf.dpPercentLabel}):`,
                'F2',
                9.0,
                [0.012, 0.412, 0.631],
            ),
        );
        ops.push(
            textRightOp(
                rightX - 12,
                tY,
                `Rp ${formatRp(dpSumPdf.dpPaid)}`,
                'F2',
                9.0,
                [0.012, 0.412, 0.631],
            ),
        );
        tY += 16;

        ops.push(textOp(rightColX + 12, tY, 'Sisa Pelunasan:', 'F2', 9.0, [0.706, 0.325, 0.035]));
        ops.push(
            textRightOp(
                rightX - 12,
                tY,
                `Rp ${formatRp(dpSumPdf.dpRemaining)}`,
                'F2',
                9.0,
                [0.706, 0.325, 0.035],
            ),
        );
        tY += 16;
    }
    ops.push(textOp(rightColX + 12, tY, 'Subtotal:', 'F1', 9.5, [0.294, 0.333, 0.388]));
    ops.push(
        textRightOp(
            rightX - 12,
            tY,
            `Rp ${formatRp(preBill.subtotal)}`,
            'F2',
            9.5,
            [0.067, 0.094, 0.153],
        ),
    );
    tY += 16;

    if (preBill.discount_amount > 0) {
        ops.push(textOp(rightColX + 12, tY, 'Potongan Diskon:', 'F1', 9.5, [0.016, 0.471, 0.341]));
        ops.push(
            textRightOp(
                rightX - 12,
                tY,
                `-Rp ${formatRp(preBill.discount_amount)}`,
                'F2',
                9.5,
                [0.016, 0.471, 0.341],
            ),
        );
        tY += 16;
    }

    if ((preBill.shipping_cost || 0) > 0) {
        const shipLabel = `Ongkos Kirim${preBill.shipping_courier ? ` (${preBill.shipping_courier})` : ''}:`;
        ops.push(
            textOp(
                rightColX + 12,
                tY,
                truncateStr(shipLabel, 24),
                'F1',
                9.5,
                [0.118, 0.251, 0.686],
            ),
        );
        ops.push(
            textRightOp(
                rightX - 12,
                tY,
                `Rp ${formatRp(preBill.shipping_cost || 0)}`,
                'F2',
                9.5,
                [0.118, 0.251, 0.686],
            ),
        );
        tY += 16;
    }

    ops.push(lineOp(rightColX + 12, tY - 4, rightX - 12, tY - 4, [0.82, 0.835, 0.859], 1.2));
    ops.push(textOp(rightColX + 12, tY + 14, 'TOTAL:', 'F2', 10.5, [0.067, 0.094, 0.153]));
    ops.push(
        textRightOp(
            rightX - 12,
            tY + 15,
            `Rp ${formatRp(preBill.total_amount)}`,
            'F2',
            14.5,
            [0.067, 0.094, 0.153],
        ),
    );

    const footerY = Math.max(leftCursorY + stampH + 34, bottomTopY + totalsBoxH + 34);
    ops.push(lineOp(marginX, footerY, rightX, footerY, [0.898, 0.906, 0.922], 0.8));
    ops.push(
        textCenterOp(
            marginX,
            contentWidth,
            footerY + 16,
            'Terima kasih telah memesan di Alat Kopi Malang! Dokumen ini adalah faktur digital resmi format A4 yang diterbitkan oleh sistem POS Sanubari.',
            'F1',
            8.0,
            [0.612, 0.639, 0.686],
        ),
    );

    const stream = ops.join('\n');
    const objects: string[] = [
        '<< /Type /Catalog /Pages 2 0 R >>',
        '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
        `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PAGE_W.toFixed(2)} ${PAGE_H.toFixed(2)}] /Resources << /Font << /F1 4 0 R /F2 5 0 R /F3 6 0 R /F4 7 0 R >> >> /Contents 8 0 R >>`,
        '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>',
        '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>',
        '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Oblique /Encoding /WinAnsiEncoding >>',
        '<< /Type /Font /Subtype /Type1 /BaseFont /Courier /Encoding /WinAnsiEncoding >>',
        `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`,
    ];

    let pdfStr = '%PDF-1.4\n';
    const offsets: number[] = [];

    for (let i = 0; i < objects.length; i++) {
        offsets.push(pdfStr.length);
        pdfStr += `${i + 1} 0 obj\n${objects[i]}\nendobj\n`;
    }

    const xrefOffset = pdfStr.length;
    const totalCount = objects.length + 1;
    pdfStr += `xref\n0 ${totalCount}\n0000000000 65535 f \n`;
    for (const off of offsets) {
        pdfStr += `${String(off).padStart(10, '0')} 00000 n \n`;
    }
    pdfStr += `trailer\n<< /Size ${totalCount} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

    const bytes = new Uint8Array(pdfStr.length);
    for (let i = 0; i < pdfStr.length; i++) {
        bytes[i] = pdfStr.charCodeAt(i) & 0xff;
    }
    return bytes;
}

/**
 * Directly download Digital A4 Invoice as a real .pdf file without opening an HTML print preview
 */
export function printA4InvoiceWeb(preBill: PreBillData): void {
    if (typeof window === 'undefined') return;

    const custClean = (preBill.customer_name || 'Pelanggan')
        .replace(/[^a-zA-Z0-9_-]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '') || 'Pelanggan';
    const fileName = `Invoice-Sanubari-Roastery-${custClean}.pdf`;

    const isAndroidApp =
        isAndroidNativeBluetoothAvailable() ||
        /SanubariPOS-Android|wv|Android/i.test(navigator.userAgent || '');

    // 1. On Android POS APK / Android WebView when online:
    // Use the /pos/download-apk?invoice_pdf=1&payload=... endpoint which is intercepted by
    // MainActivity.shouldOverrideUrlLoading and handed directly to Android's native system downloader
    // without navigating the POS WebView away from the cashier screen.
    if (isAndroidApp && navigator.onLine) {
        try {
            const jsonStr = JSON.stringify(preBill);
            const utf8Bytes = new TextEncoder().encode(jsonStr);
            const base64 = uint8ArrayToBase64(utf8Bytes)
                .replace(/\+/g, '-')
                .replace(/\//g, '_')
                .replace(/=+$/, '');
            const downloadUrl = `/pos/download-apk?invoice_pdf=1&payload=${encodeURIComponent(base64)}`;

            if (/SanubariPOS-Android/i.test(navigator.userAgent || '') || isAndroidNativeBluetoothAvailable()) {
                window.location.href = downloadUrl;
                return;
            }

            const link = document.createElement('a');
            link.href = downloadUrl;
            link.download = fileName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            return;
        } catch {
            // Fall through to local Blob PDF download
        }
    }

    // 2. Direct client-side binary PDF Blob download (Desktop, iOS, Offline mode)
    const pdfBytes = buildA4InvoicePdfBytes(preBill);
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const blobUrl = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = fileName;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    window.setTimeout(() => {
        URL.revokeObjectURL(blobUrl);
    }, 10000);
}
