import { PaperWidth } from '@/lib/thermal-printer';
export type { PaperWidth };

export interface ProductVariant {
    id: number;
    label: string;
    price: number;
    original_price: number | null;
    cost_price?: number | null;
    weight_grams: number;
    sku: string | null;
    stock?: number;
    stock_status: string;
}

export interface Product {
    id: number;
    name: string;
    slug: string;
    series: string | null;
    series_label?: string | null;
    series_badge_color?: string | null;
    category_ids: number[];
    image: string;
    min_price: number;
    max_price: number;
    stock?: number;
    stock_status: string;
    is_preorder?: boolean;
    is_out_of_stock: boolean;
    variants: ProductVariant[];
}

export interface Category {
    id: number;
    name: string;
    slug: string;
    icon: string | null;
}

export interface CartItem {
    id: string;
    product_id: number;
    product_name: string;
    variant_id: number;
    variant_label: string;
    price: number;
    quantity: number;
    image: string;
    cost_price?: number;
    notes?: string;
    is_manual?: boolean;
    discount_type?: 'fixed' | 'percent';
    discount_value?: number;
    discount_amount?: number;
}

export interface PosRecentOrder {
    id: number;
    order_number: string;
    customer_name: string;
    customer_phone?: string;
    customer_address?: string;
    shipping_cost?: number;
    shipping_courier?: string;
    shipping_service?: string;
    total_amount: number;
    subtotal: number;
    payment_method: string;
    payment_method_label: string;
    payment_status?: string;
    payment_status_label?: string;
    status?: string;
    status_label?: string;
    refunded_at?: string;
    refund_reason?: string;
    refunded_by_name?: string;
    refund_amount?: number;
    created_at: string;
    items_count: number;
    items: Array<{
        product_name: string;
        variant_label: string;
        price: number;
        quantity: number;
        subtotal: number;
    }>;
    payment_details?: any;
}

export interface PrinterSettings {
    paper_width: PaperWidth;
    store_name: string;
    tagline?: string;
    address?: string;
    phone?: string;
    instagram?: string;
    receipt_footer?: string;
    auto_print: boolean;
    printer_name?: string;
    printer_driver?: string;
    receipt_columns?: number;
    receipt_columns_58mm?: number;
    receipt_columns_80mm?: number;
    custom_paper_width_mm?: number;
    custom_printable_width_mm?: number;
    custom_receipt_columns?: number;
    max_item_name_length?: number;
    margin_horizontal?: string;
    margin_feed_lines?: number;
    copies?: number;
    show_logo?: boolean;
    formatting?: string;
    open_cash_drawer?: boolean;
    line_display?: string;
    is_cashier_printer?: boolean;
    font_family?: 'monospace' | 'courier' | 'sans-serif' | 'consolas' | 'roboto-mono';
    font_size?: 'compact' | 'normal' | 'large';
    font_weight?: 'normal' | 'bold';
    usb_printer_name?: string;
    usb_device_name?: string;
    usb_vendor_id?: number;
    usb_product_id?: number;
    usb_serial_number?: string;
    connection_type?: 'usb' | 'bluetooth' | 'system' | 'usb_direct';
}

export interface PosLayoutSettings {
    grid_density?: 'compact' | 'normal' | 'comfortable';
    grid_columns?: 'auto' | 2 | 3 | 4 | 5 | 6;
}

export interface PaymentSettings {
    enable_cash: boolean;
    enable_qris: boolean;
    enable_debit: boolean;
    enable_bank_transfer: boolean;
    qris_instructions?: string;
    bank_info?: string;
}

export interface PosCashFlowItem {
    id: number;
    type: 'in' | 'out';
    category: string;
    category_label: string;
    amount: number;
    description: string;
    user_name: string;
    recorded_at: string;
    date: string;
}

export interface CashDrawerState {
    cash_sales: number;
    total_in: number;
    total_out: number;
    net_cash: number;
    period_title?: string;
}

export interface PosHeldOrderItem {
    id: number;
    queue_number?: string;
    customer_name: string;
    customer_phone?: string;
    customer_address?: string;
    shipping_cost?: number;
    shipping_courier?: string;
    notes?: string;
    items: Array<{
        product_id: number;
        product_name: string;
        variant_id: number;
        variant_label: string;
        price: number;
        quantity: number;
        image?: string;
        discount_type?: 'percent' | 'fixed';
        discount_value?: number;
        discount_amount?: number;
    }>;
    items_count: number;
    subtotal: number;
    discount_amount: number;
    total_amount: number;
    held_at: string;
    cashier_name?: string;
}

export interface PosStaffMember {
    id: number;
    name: string;
    email: string;
    role: string;
    phone?: string | null;
    created_at?: string;
}

export interface PosCashier {
    id: number;
    name: string;
    role: string;
    email?: string;
}

export type PosActiveTab =
    | 'cashier'
    | 'transactions'
    | 'queue'
    | 'inventory'
    | 'cash_flow'
    | 'reports'
    | 'profit_loss'
    | 'settings';
