import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Head, Link } from '@inertiajs/react';
import {
    Search,
    ShoppingCart,
    Truck,
    MapPin,
    Plus,
    Minus,
    Trash2,
    Printer,
    Smartphone,
    CreditCard,
    QrCode,
    Banknote,
    Building2,
    RotateCcw,
    RefreshCw,
    X,
    Check,
    ChevronRight,
    ArrowLeft,
    Clock,
    Percent,
    SlidersHorizontal,
    Tag,
    Share2,
    Receipt,
    CheckCircle2,
    Coffee,
    Store,
    User,
    Calendar,
    TrendingUp,
    TrendingDown,
    DollarSign,
    Save,
    Settings,
    FileText,
    Wallet,
    ArrowUpRight,
    ArrowDownLeft,
    AlertCircle,
    BarChart3,
    ChevronDown,
    Eye,
    Menu,
    Package,
    LogOut,
    Sparkles,
    Copy,
    ExternalLink,
    Download,
    Sun,
    Moon,
    Monitor,
    Wifi,
    WifiOff,
    Upload,
    Database,
    Cloud,
    CloudOff,
    FileSpreadsheet,
    HardDrive,
    Users,
    UserPlus,
    Shield,
    MoreVertical,
    PieChart,
    Calculator,
    PlusCircle,
    Pencil,
    LayoutGrid,
    Columns,
    Lock,
} from 'lucide-react';
import { useAppearance } from '@/hooks/use-appearance';
import { useIsMobile } from '@/hooks/use-mobile';
import {
    ReceiptData,
    PaperWidth,
    SalesReportData,
    ProfitLossReportData,
    PreBillData,
    BluetoothPrinterDevice,
    UsbPrinterDevice,
    WindowsPrinterItem,
    formatRp,
    printThermalWeb,
    printThermalBluetooth,
    printThermalUsbDirect,
    printSalesReportThermalWeb,
    printProfitLossThermalWeb,
    generateWhatsAppReceiptUrl,
    generatePreBillWhatsAppText,
    generatePreBillWhatsAppUrl,
    printPreBillThermalWeb,
    printA4InvoiceWeb,
    isAndroidNativeBluetoothAvailable,
    isWebBluetoothAvailable,
    isElectronDesktop,
    isWebUsbAvailable,
    getSavedBluetoothPrinter,
    getSavedUsbPrinter,
    scanAndConnectUsbPrinter,
    reconnectSavedUsbPrinter,
    disconnectUsbPrinter,
    getAvailableWindowsPrinters,
    getAndroidBluetoothDevices,
    startAndroidBluetoothScan,
    stopAndroidBluetoothScan,
    connectAndroidBluetoothPrinter,
    disconnectBluetoothPrinter,
    openAndroidBluetoothSettings,
    scanAndConnectWebBluetoothPrinter,
    generateRawBtPrintUrl,
} from '@/lib/thermal-printer';
import { ThermalReceiptPreview } from '@/components/pos/thermal-receipt-preview';
import { ProductCard } from '@/components/pos/product-card';
import { VariantPickerModal } from '@/components/pos/modals/variant-picker-modal';
import { HoldOrderModal } from '@/components/pos/modals/hold-order-modal';
import { SharePreBillModal } from '@/components/pos/modals/share-pre-bill-modal';
import { CalculatorModal } from '@/components/pos/modals/calculator-modal';
import { CartDiscountModal } from '@/components/pos/modals/cart-discount-modal';
import { ItemDiscountModal } from '@/components/pos/modals/item-discount-modal';
import { OfflineSyncModal } from '@/components/pos/modals/offline-sync-modal';
import { PrinterModal } from '@/components/pos/modals/printer-modal';
import { ManualOrderModal } from '@/components/pos/modals/manual-order-modal';
import { BluetoothScannerModal } from '@/components/pos/modals/bluetooth-scanner-modal';
import { RefundModal } from '@/components/pos/modals/refund-modal';
import { ReceiptModal } from '@/components/pos/modals/receipt-modal';
import { CheckoutModal } from '@/components/pos/modals/checkout-modal';
import { CybrModal } from '@/components/pos/modals/cybr-modal';
import { MobileCartDrawer } from '@/components/pos/modals/mobile-cart-drawer';
import { QueueTab } from '@/components/pos/tabs/queue-tab';
import { TransactionsTab } from '@/components/pos/tabs/transactions-tab';
import { InventoryTab } from '@/components/pos/tabs/inventory-tab';
import { CashFlowTab } from '@/components/pos/tabs/cash-flow-tab';
import { ReportsTab } from '@/components/pos/tabs/reports-tab';
import { ProfitLossTab } from '@/components/pos/tabs/profit-loss-tab';
import { SettingsTab } from '@/components/pos/tabs/settings-tab';

interface ProductVariant {
    id: number;
    label: string;
    price: number;
    original_price: number | null;
    cost_price?: number | null;
    weight_grams: number;
    sku: string | null;
    stock_status: string;
}

interface Product {
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

interface Category {
    id: number;
    name: string;
    slug: string;
    icon: string | null;
}

interface PosRecentOrder {
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

interface PrinterSettings {
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

interface PosLayoutSettings {
    grid_density?: 'compact' | 'normal' | 'comfortable';
    grid_columns?: 'auto' | 2 | 3 | 4 | 5 | 6;
}

interface PaymentSettings {
    enable_cash: boolean;
    enable_qris: boolean;
    enable_debit: boolean;
    enable_bank_transfer: boolean;
    qris_instructions?: string;
    bank_info?: string;
}

interface PosCashFlowItem {
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

const defaultPrinterSettings: PrinterSettings = {
    paper_width: '80mm',
    store_name: 'Alat Kopi Malang',
    tagline: 'Menyentuh Hati, Merangkai Cerita',
    address: 'Jl. Candi Mendut No. 3, Lowokwaru, Kota Malang',
    phone: '0821-3209-5241',
    instagram: '@sanubariroastery',
    receipt_footer:
        'Terima kasih atas kunjungan Anda!\nFreshly Roasted with Heart.',
    auto_print: false,
    printer_name: 'POS80 Printer',
    printer_driver: 'POS80 Printer | WINDOWS',
    receipt_columns: 46,
    receipt_columns_58mm: 32,
    receipt_columns_80mm: 46,
    custom_paper_width_mm: 80,
    custom_printable_width_mm: 72,
    custom_receipt_columns: 46,
    max_item_name_length: 40,
    margin_horizontal: '0mm',
    margin_feed_lines: 2,
    copies: 1,
    show_logo: true,
    formatting: 'formatted',
    open_cash_drawer: true,
    line_display: 'none',
    is_cashier_printer: true,
    font_family: 'sans-serif',
    font_size: 'normal',
    font_weight: 'bold',
    connection_type: 'usb',
    usb_printer_name: 'POS80 Printer',
};

const defaultLayoutSettings: PosLayoutSettings = {
    grid_density: 'normal',
    grid_columns: 'auto',
};

const defaultPaymentSettings: PaymentSettings = {
    enable_cash: true,
    enable_qris: true,
    enable_debit: true,
    enable_bank_transfer: true,
    qris_instructions: 'Tunjukkan kode QRIS Kasir Sanubari di meja kasir.',
    bank_info: 'BCA 123-456-7890 a/n Alat Kopi Malang',
};

interface CashDrawerState {
    cash_sales: number;
    total_in: number;
    total_out: number;
    net_cash: number;
    period_title?: string;
}

const defaultCashDrawer: CashDrawerState = {
    cash_sales: 0,
    total_in: 0,
    total_out: 0,
    net_cash: 0,
};

interface PosHeldOrderItem {
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

interface PosProps {
    products?: Product[];
    categories?: Category[];
    recentOrders?: PosRecentOrder[];
    heldOrders?: PosHeldOrderItem[];
    queueOrders?: PosHeldOrderItem[];
    cashier?: {
        id: number;
        name: string;
        email: string;
        role?: string;
        is_owner?: boolean;
        is_admin?: boolean;
        is_staff_restricted?: boolean;
        can_view_profit_loss?: boolean;
    };
    staffList?: PosStaffMember[];
    settings?: {
        printer?: PrinterSettings;
        payments?: PaymentSettings;
        layout?: PosLayoutSettings;
    };
    todayCashDrawer?: {
        cash_sales: number;
        total_in: number;
        total_out: number;
        net_cash: number;
    };
    printerSettings?: PrinterSettings;
    paymentSettings?: PaymentSettings;
    layoutSettings?: PosLayoutSettings;
    byobSettings?: ByobSettings;
    cashDrawerToday?: {
        cash_sales: number;
        total_in: number;
        total_out: number;
        net_cash: number;
    };
}

export interface ByobBean {
    product_id?: number | null;
    name: string;
    origin?: string;
    process?: string;
    price_per_10g: number;
    cost_price_per_10g?: number | null;
    tasting_notes?: string;
    is_active?: boolean;
}

export interface ByobVariant {
    id?: number;
    label: string;
    weight_grams: number;
    price?: number;
    discount_type?: 'percentage' | 'fixed';
    discount_value?: number;
    is_default?: boolean;
}

export interface ByobSettings {
    hero_title?: string;
    studio_title?: string;
    default_ratio?: number;
    byob_beans?: ByobBean[];
    byob_variants?: ByobVariant[];
}

interface CartItem {
    id: string; // unique item id: productId-variantId or manual-timestamp
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

type PosActiveTab =
    | 'cashier'
    | 'transactions'
    | 'queue'
    | 'inventory'
    | 'cash_flow'
    | 'reports'
    | 'profit_loss'
    | 'settings';

/**
 * Return date string in YYYY-MM-DD according to local client timezone (e.g. Asia/Jakarta).
 * Avoids the UTC offset bug where toISOString() yields yesterday's date during early morning hours (00:00 - 06:59 WIB).
 */
function getLocalDateString(date: Date = new Date()): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

/**
 * Return month string in YYYY-MM according to local client timezone.
 */
function getLocalMonthString(date: Date = new Date()): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
}

// Storage keys to persist cart state across page reload
const POS_CART_STORAGE_KEY = 'sanubari_pos_cart';
const POS_DISCOUNT_TYPE_STORAGE_KEY = 'sanubari_pos_cart_discount_type';
const POS_DISCOUNT_VALUE_STORAGE_KEY = 'sanubari_pos_cart_discount_value';
const POS_CUSTOMER_NAME_STORAGE_KEY = 'sanubari_pos_customer_name';
const POS_CUSTOMER_PHONE_STORAGE_KEY = 'sanubari_pos_customer_phone';
const POS_IS_DELIVERY_STORAGE_KEY = 'sanubari_pos_is_delivery';
const POS_SHIPPING_COST_STORAGE_KEY = 'sanubari_pos_shipping_cost';
const POS_SHIPPING_COURIER_STORAGE_KEY = 'sanubari_pos_shipping_courier';
const POS_CUSTOMER_ADDRESS_STORAGE_KEY = 'sanubari_pos_customer_address';
const POS_OFFLINE_ORDERS_STORAGE_KEY = 'sanubari_pos_offline_orders';
const POS_MANUAL_OFFLINE_STORAGE_KEY = 'sanubari_pos_manual_offline';
const POS_CACHED_CATALOG_STORAGE_KEY = 'sanubari_pos_cached_catalog_v7';
const POS_DEVICE_PRINTER_STORAGE_KEY = 'sanubari_pos_device_printer_v1';

export const normalizePosProduct = (p: any): Product => {
    const variants = Array.isArray(p.variants)
        ? p.variants.map((v: any) => {
              const vStock = Number(v.stock ?? 0);
              return {
                  ...v,
                  price: Number(v.price) || 0,
                  cost_price:
                      v.cost_price !== null && v.cost_price !== undefined
                          ? Number(v.cost_price) || 0
                          : 0,
                  stock: vStock,
                  stock_status: vStock > 0 ? 'in_stock' : 'out_of_stock',
              };
          })
        : [];
    const minPrice =
        Number(p.min_price) > 0
            ? Number(p.min_price)
            : variants.length > 0
              ? Math.min(...variants.map((v: any) => Number(v.price) || 0))
              : Number(p.price) || 0;

    const maxPrice =
        Number(p.max_price) > 0
            ? Number(p.max_price)
            : variants.length > 0
              ? Math.max(...variants.map((v: any) => Number(v.price) || 0))
              : minPrice;

    const totalStock =
        variants.length > 0
            ? variants.reduce((acc: number, v: any) => acc + (Number(v.stock) || 0), 0)
            : Number(p.stock ?? 0);

    const isCybr =
        p.slug === 'byob' ||
        p.series === 'cybr' ||
        p.series === 'custom-blend' ||
        (typeof p.name === 'string' && p.name.toLowerCase().includes('c.y.b.r'));

    let img = isCybr ? '/brand/cybr-custom-blend.jpg' : p.image;
    if (!img || img === '/images/products/packaging-standing-pouch.png') {
        img = '/brand/logo-circle.png';
    }

    return {
        ...p,
        min_price: minPrice,
        max_price: maxPrice,
        stock: totalStock,
        stock_status: totalStock > 0 ? 'in_stock' : 'out_of_stock',
        is_out_of_stock: totalStock <= 0,
        image: img,
        category_ids: Array.isArray(p.category_ids)
            ? p.category_ids
            : p.category_id
              ? [p.category_id]
              : [],
        variants,
    };
};

/**
 * Pre-cache product images into Service Worker / Browser Cache API
 * so that they load instantaneously without downloading again on app restart.
 */
export const precacheProductImages = async (productList: Product[]) => {
    if (typeof window === 'undefined' || !('caches' in window)) return;
    try {
        const cache = await caches.open('sanubari-pos-static-v6');
        for (const p of productList) {
            if (
                p.image &&
                !p.image.endsWith('/brand/logo-circle.png') &&
                (p.image.startsWith('/storage/') || p.image.startsWith('/'))
            ) {
                const match = await cache.match(p.image);
                if (!match) {
                    fetch(p.image)
                        .then((res) => {
                            if (res && res.status === 200) {
                                cache.put(p.image, res);
                            }
                        })
                        .catch(() => {});
                }
            }
        }
    } catch {
        // Silently continue if cache API is restricted
    }
};

export interface OfflineOrderItem {
    product_id: number;
    variant_id: number;
    product_name: string;
    variant_label: string;
    quantity: number;
    price: number;
    discount_type?: 'fixed' | 'percent';
    discount_value?: number;
    discount_amount?: number;
}

export interface OfflineOrder {
    offline_id: string;
    created_at: string;
    customer_name: string;
    customer_phone: string | null;
    customer_address?: string | null;
    shipping_cost?: number;
    shipping_courier?: string | null;
    items: OfflineOrderItem[];
    payment_method: 'cash' | 'qris' | 'debit' | 'bank_transfer';
    cash_tendered: number | null;
    cash_change?: number;
    discount_amount: number;
    cart_discount_type?: 'fixed' | 'percent';
    cart_discount_value?: number;
    subtotal: number;
    total_amount: number;
    notes?: string;
}

function PosContent({
    products: initialProducts = [],
    categories: initialCategories = [],
    recentOrders: initialRecentOrders = [],
    heldOrders: initialHeldOrders = [],
    queueOrders: initialQueueOrders = [],
    cashier = { id: 0, name: 'Kasir Sanubari', email: '', role: 'kasir' },
    staffList: initialStaffList = [],
    settings: initialSettings,
    todayCashDrawer,
    printerSettings: initialPrinterSettings,
    paymentSettings: initialPaymentSettings,
    layoutSettings: initialLayoutSettings,
    cashDrawerToday: initialCashDrawerToday,
    byobSettings: initialByobSettings,
}: PosProps) {
    const resolvedPrinter: PrinterSettings = (() => {
        const baseSettings: PrinterSettings = {
            ...defaultPrinterSettings,
            ...(initialPrinterSettings || initialSettings?.printer),
        };
        try {
            if (typeof window !== 'undefined' && window.localStorage) {
                const saved = window.localStorage.getItem(POS_DEVICE_PRINTER_STORAGE_KEY);
                if (saved) {
                    const parsed = JSON.parse(saved);
                    if (parsed && typeof parsed === 'object') {
                        return {
                            ...baseSettings,
                            ...parsed,
                        };
                    }
                }
            }
        } catch (e) {
            console.error('Gagal membaca pengaturan printer perangkat:', e);
        }
        return baseSettings;
    })();
    const resolvedPayment =
        initialPaymentSettings ||
        initialSettings?.payments ||
        defaultPaymentSettings;
    const resolvedDrawer: CashDrawerState = (initialCashDrawerToday ||
        todayCashDrawer ||
        defaultCashDrawer) as CashDrawerState;

    // --- DETEKSI PERANGKAT MOBILE POS (APK / SMARTPHONE / TABLET) ---
    const isMobileViewport = useIsMobile();
    const [isMobileDevice, setIsMobileDevice] = useState(false);

    useEffect(() => {
        const checkIsMobile = () => {
            const isTouchOrMobileUa =
                typeof navigator !== 'undefined' &&
                /Android|iPhone|iPad|iPod|Mobile|webOS|BlackBerry|IEMobile|Opera Mini|wv|SanubariPOS-Android/i.test(
                    navigator.userAgent || '',
                );
            const isMobileScreen = window.innerWidth < 1024;
            setIsMobileDevice(
                !isElectronDesktop() &&
                    (isTouchOrMobileUa ||
                        isMobileScreen ||
                        isAndroidNativeBluetoothAvailable()),
            );
        };
        checkIsMobile();
        window.addEventListener('resize', checkIsMobile);
        return () => window.removeEventListener('resize', checkIsMobile);
    }, []);

    const isMobilePos = isMobileViewport || isMobileDevice;

    // --- MODAL MENGATUR PRINTER & MARGIN STRUK ---
    const [isPrinterModalOpen, setIsPrinterModalOpen] = useState(false);

    // --- OWNER & PERMISSION CHECKS (HANYA MUNCUL PADA AKUN OWNER / ADMIN) ---
    const isOwner = Boolean(cashier.is_owner || cashier.role === 'owner');
    const isAdmin = Boolean(
        cashier.is_admin || cashier.role === 'admin' || cashier.id === 1,
    );
    const isStaffRestricted = Boolean(
        cashier.is_staff_restricted ?? (!isOwner && !isAdmin && cashier.role === 'kasir'),
    );
    const canAccessProfitLoss = Boolean(
        cashier.can_view_profit_loss ?? (isOwner || isAdmin),
    );

    // --- STAFF MANAGEMENT STATE (OWNER & ADMIN ONLY) ---
    const [staff, setStaff] = useState<PosStaffMember[]>(
        initialStaffList || [],
    );
    const [staffName, setStaffName] = useState('');
    const [staffEmail, setStaffEmail] = useState('');
    const [staffPassword, setStaffPassword] = useState('');
    const [staffPasswordConfirm, setStaffPasswordConfirm] = useState('');
    const [staffRole, setStaffRole] = useState<'kasir' | 'admin' | 'owner'>(
        'kasir',
    );
    const [staffPhone, setStaffPhone] = useState('');
    const [isAddingStaff, setIsAddingStaff] = useState(false);
    const [staffFormError, setStaffFormError] = useState<string | null>(null);
    const [staffSearchQuery, setStaffSearchQuery] = useState('');
    const [deletingStaffId, setDeletingStaffId] = useState<number | null>(null);

    // --- CATALOG (AUTO-CACHED FOR INSTANT OFFLINE & ONLINE LOAD) ---
    const [products, setProducts] = useState<Product[]>(() => {
        if (typeof window !== 'undefined') {
            try {
                // Clear any legacy broken cache keys
                localStorage.removeItem('sanubari_pos_cached_catalog_v1');
                localStorage.removeItem('sanubari_pos_cached_catalog_v2');
                localStorage.removeItem('sanubari_pos_cached_catalog_v3');
                localStorage.removeItem('sanubari_pos_cached_catalog_v4');
                localStorage.removeItem('sanubari_pos_cached_catalog_v5');
                localStorage.removeItem('sanubari_pos_cached_catalog_v6');

                // 1. FASTEST PATH: Read from persistent local cache for instant 0ms load
                const cached = localStorage.getItem(
                    POS_CACHED_CATALOG_STORAGE_KEY,
                );
                if (cached) {
                    const parsed = JSON.parse(cached);
                    if (
                        Array.isArray(parsed?.products) &&
                        parsed.products.length > 0
                    ) {
                        return parsed.products.map(normalizePosProduct);
                    }
                }

                // 2. Fallback: Server props on fresh installs
                if (Array.isArray(initialProducts) && initialProducts.length > 0) {
                    return initialProducts.map(normalizePosProduct);
                }
            } catch (e) {
                console.error('Failed reading cached catalog:', e);
            }
        }
        return Array.isArray(initialProducts) ? initialProducts.map(normalizePosProduct) : [];
    });

    const [categories, setCategories] = useState<Category[]>(() => {
        if (typeof window !== 'undefined') {
            try {
                const cached = localStorage.getItem(
                    POS_CACHED_CATALOG_STORAGE_KEY,
                );
                if (cached) {
                    const parsed = JSON.parse(cached);
                    if (
                        Array.isArray(parsed?.categories) &&
                        parsed.categories.length > 0
                    ) {
                        return parsed.categories;
                    }
                }

                if (Array.isArray(initialCategories) && initialCategories.length > 0) {
                    return initialCategories;
                }
            } catch (e) {
                console.error('Failed reading cached categories:', e);
            }
        }
        return initialCategories || [];
    });

    // Background sync from server props: only update if data actually changed
    useEffect(() => {
        if (Array.isArray(initialProducts) && initialProducts.length > 0) {
            const normalized = initialProducts.map(normalizePosProduct);
            setProducts((prev) => {
                const prevStock = prev.reduce((s, p) => s + (Number(p.stock) || 0), 0);
                const normStock = normalized.reduce((s, p) => s + (Number(p.stock) || 0), 0);
                if (
                    prev.length === normalized.length &&
                    prev[0]?.id === normalized[0]?.id &&
                    prevStock === normStock &&
                    prev[0]?.min_price === normalized[0]?.min_price &&
                    prev[prev.length - 1]?.id === normalized[normalized.length - 1]?.id
                ) {
                    return prev;
                }
                return normalized;
            });
            precacheProductImages(normalized);
        }
    }, [initialProducts]);

    useEffect(() => {
        if (Array.isArray(initialCategories) && initialCategories.length > 0) {
            setCategories((prev) => {
                if (
                    prev.length === initialCategories.length &&
                    prev[0]?.id === initialCategories[0]?.id
                ) {
                    return prev;
                }
                return initialCategories;
            });
        }
    }, [initialCategories]);

    // Pre-cache images on initial mount from cached products
    useEffect(() => {
        if (products.length > 0) {
            precacheProductImages(products);
        }
    }, []);

    // Auto-cache catalog when updated or loaded
    useEffect(() => {
        if (typeof window === 'undefined') return;
        if (products.length > 0 || categories.length > 0) {
            try {
                localStorage.setItem(
                    POS_CACHED_CATALOG_STORAGE_KEY,
                    JSON.stringify({
                        products,
                        categories,
                        updated_at: new Date().toISOString(),
                    }),
                );
            } catch (e) {
                console.error('Failed to cache catalog:', e);
            }
        }
    }, [products, categories]);

    // Silent background revalidation from /pos/catalog (Stale-While-Revalidate)
    useEffect(() => {
        if (typeof window === 'undefined') return;
        let isMounted = true;
        const revalidateCatalog = async () => {
            try {
                const res = await fetch('/pos/catalog', {
                    headers: { Accept: 'application/json' },
                });
                if (res.ok) {
                    const data = await res.json();
                    if (
                        isMounted &&
                        Array.isArray(data.products) &&
                        data.products.length > 0
                    ) {
                        const normalized = data.products.map(normalizePosProduct);
                        setProducts((prev) => {
                            const prevStock = prev.reduce((s, p) => s + (Number(p.stock) || 0), 0);
                            const normStock = normalized.reduce((s, p) => s + (Number(p.stock) || 0), 0);
                            if (
                                prev.length === normalized.length &&
                                prev[0]?.id === normalized[0]?.id &&
                                prevStock === normStock &&
                                prev[0]?.min_price === normalized[0]?.min_price &&
                                prev[prev.length - 1]?.id ===
                                    normalized[normalized.length - 1]?.id
                            ) {
                                return prev;
                            }
                            return normalized;
                        });
                        if (
                            Array.isArray(data.categories) &&
                            data.categories.length > 0
                        ) {
                            setCategories(data.categories);
                        }
                        precacheProductImages(normalized);
                    }
                }
            } catch {
                // Offline or background network issue, keep cached data
            }
        };

        const timer = setTimeout(revalidateCatalog, 2000);
        const interval = setInterval(revalidateCatalog, 30000);
        return () => {
            isMounted = false;
            clearTimeout(timer);
            clearInterval(interval);
        };
    }, []);

    // --- MODE OFFLINE & AUTO-SYNC STATE ---
    const [isOnline, setIsOnline] = useState<boolean>(() => {
        if (typeof navigator !== 'undefined') {
            return navigator.onLine;
        }
        return true;
    });
    const [manualOffline, setManualOffline] = useState<boolean>(() => {
        if (typeof window === 'undefined') return false;
        try {
            return (
                localStorage.getItem(POS_MANUAL_OFFLINE_STORAGE_KEY) === 'true'
            );
        } catch {
            return false;
        }
    });
    const [offlineOrders, setOfflineOrders] = useState<OfflineOrder[]>(() => {
        if (typeof window === 'undefined') return [];
        try {
            const saved = localStorage.getItem(POS_OFFLINE_ORDERS_STORAGE_KEY);
            if (saved) {
                const parsed = JSON.parse(saved);
                if (Array.isArray(parsed)) return parsed;
            }
        } catch (e) {
            console.error('Gagal membaca transaksi offline:', e);
        }
        return [];
    });
    const [isOfflineModalOpen, setIsOfflineModalOpen] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);
    const [syncStatusMessage, setSyncStatusMessage] = useState<string>('');
    const [isDownloadingCatalog, setIsDownloadingCatalog] = useState(false);
    const [lastCatalogSync, setLastCatalogSync] = useState<string>(() => {
        if (typeof window === 'undefined') return '';
        try {
            const cached = localStorage.getItem(POS_CACHED_CATALOG_STORAGE_KEY);
            if (cached) {
                const parsed = JSON.parse(cached);
                return parsed.updated_at || '';
            }
        } catch {}
        return '';
    });

    const isEffectiveOffline = !isOnline || manualOffline;

    // Listen to network changes
    useEffect(() => {
        const handleOnline = () => {
            setIsOnline(true);
            showToast('Koneksi internet terhubung kembali (Online)');
        };
        const handleOffline = () => {
            setIsOnline(false);
            showToast('Koneksi terputus. Mode Offline aktif.');
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    // Save offline orders to localStorage
    useEffect(() => {
        if (typeof window === 'undefined') return;
        try {
            if (offlineOrders.length > 0) {
                localStorage.setItem(
                    POS_OFFLINE_ORDERS_STORAGE_KEY,
                    JSON.stringify(offlineOrders),
                );
            } else {
                localStorage.removeItem(POS_OFFLINE_ORDERS_STORAGE_KEY);
            }
        } catch (e) {
            console.error('Gagal menyimpan offlineOrders ke storage:', e);
        }
    }, [offlineOrders]);

    // Save manualOffline setting to localStorage
    const toggleManualOffline = (val: boolean) => {
        setManualOffline(val);
        try {
            localStorage.setItem(
                POS_MANUAL_OFFLINE_STORAGE_KEY,
                val ? 'true' : 'false',
            );
        } catch {}
        if (val) {
            showToast('Mode Offline diaktifkan secara manual.');
        } else {
            showToast('Kembali ke Mode Online.');
        }
    };

    // --- THEME & APPEARANCE (MODE GELAP / TERANG) ---
    const { appearance, resolvedAppearance, updateAppearance } =
        useAppearance();
    const isDark = resolvedAppearance === 'dark';

    // --- TOP TABS & NAVIGATION ---
    const [activeTab, setActiveTab] = useState<PosActiveTab>(() => {
        if (typeof window !== 'undefined') {
            const params = new URLSearchParams(window.location.search);
            const tabParam = params.get('tab') as PosActiveTab;
            const validTabs: PosActiveTab[] = [
                'cashier',
                'queue',
                'transactions',
                'inventory',
                'cash_flow',
                'reports',
                'profit_loss',
                'settings',
            ];
            if (tabParam && validTabs.includes(tabParam)) {
                if (tabParam === 'profit_loss' && !canAccessProfitLoss) {
                    return 'cashier';
                }
                return tabParam;
            }
        }
        return 'cashier';
    });

    // Sinkronisasi activeTab ke URL browser query parameter & dukung tombol Back/Forward browser
    useEffect(() => {
        if (typeof window === 'undefined') return;
        const url = new URL(window.location.href);
        const currentParam = url.searchParams.get('tab');
        const targetParam = activeTab === 'cashier' ? null : activeTab;

        if (currentParam !== targetParam) {
            if (targetParam === null) {
                url.searchParams.delete('tab');
            } else {
                url.searchParams.set('tab', targetParam);
            }
            window.history.pushState({ tab: activeTab }, '', url.toString());
        }
    }, [activeTab]);

    useEffect(() => {
        if (typeof window === 'undefined') return;
        const handlePopState = () => {
            const params = new URLSearchParams(window.location.search);
            const tabParam = (params.get('tab') as PosActiveTab) || 'cashier';
            const validTabs: PosActiveTab[] = [
                'cashier',
                'queue',
                'transactions',
                'inventory',
                'cash_flow',
                'reports',
                'profit_loss',
                'settings',
            ];
            if (validTabs.includes(tabParam)) {
                if (tabParam === 'profit_loss' && !canAccessProfitLoss) {
                    setActiveTab('cashier');
                } else {
                    setActiveTab(tabParam);
                }
            }
        };

        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, [canAccessProfitLoss]);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
    const [isReloadingApp, setIsReloadingApp] = useState(false);
    const moreMenuRef = useRef<HTMLDivElement>(null);

    // Close 3-dots more menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent | TouchEvent) => {
            if (
                moreMenuRef.current &&
                !moreMenuRef.current.contains(event.target as Node)
            ) {
                setIsMoreMenuOpen(false);
            }
        };

        if (isMoreMenuOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            document.addEventListener('touchstart', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('touchstart', handleClickOutside);
        };
    }, [isMoreMenuOpen]);

    // --- POS BILLING & CART STATE (PERSISTED IN LOCALSTORAGE) ---
    const [cart, setCart] = useState<CartItem[]>(() => {
        if (typeof window === 'undefined') return [];
        try {
            const saved = localStorage.getItem(POS_CART_STORAGE_KEY);
            if (saved) {
                const parsed = JSON.parse(saved);
                if (Array.isArray(parsed)) return parsed;
            }
        } catch (e) {
            console.error(
                'Gagal membaca keranjang kasir dari localStorage:',
                e,
            );
        }
        return [];
    });
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategoryId, setSelectedCategoryId] = useState<
        number | 'all'
    >('all');
    const [variantPickerProduct, setVariantPickerProduct] =
        useState<Product | null>(null);

    // --- C.Y.B.R / STUDIO RACIK MODAL STATE (Custom Blend Kasir) ---
    const [isCybrModalOpen, setIsCybrModalOpen] = useState(false);
    const [cybrProduct, setCybrProduct] = useState<Product | null>(null);
    const [cybrBeanA, setCybrBeanA] = useState<ByobBean | null>(null);
    const [cybrBeanB, setCybrBeanB] = useState<ByobBean | null>(null);
    const [cybrRatioA, setCybrRatioA] = useState<number>(70);
    const [cybrSelectedVariant, setCybrSelectedVariant] = useState<ProductVariant | null>(null);
    const [cybrCustomName, setCybrCustomName] = useState<string>('');

    // Active beans available for C.Y.B.R blending in POS
    const availableCybrBeans: ByobBean[] = useMemo(() => {
        if (
            initialByobSettings?.byob_beans &&
            Array.isArray(initialByobSettings.byob_beans) &&
            initialByobSettings.byob_beans.length > 0
        ) {
            return initialByobSettings.byob_beans.filter((b) => b.is_active !== false);
        }

        // Fallback to active catalog coffee products if byobSettings is not yet loaded
        return (products || [])
            .filter((p) => p.slug !== 'byob')
            .map((p) => ({
                product_id: p.id,
                name: p.name,
                origin: p.origin || 'Kawi, Malang',
                process: p.process || 'Artisan Roast',
                price_per_10g: p.price_per_10g || 3500,
                cost_price_per_10g: p.cost_price_per_10g || null,
                is_active: true,
            }));
    }, [initialByobSettings, products]);

    // Available packaging variants for C.Y.B.R in POS
    const availableCybrVariants = useMemo(() => {
        if (cybrProduct?.variants && cybrProduct.variants.length > 0) {
            return cybrProduct.variants;
        }
        return [
            { id: 181, label: '200g', weight_grams: 200, price: 65000 },
            { id: 182, label: '500g', weight_grams: 500, price: 150000 },
            { id: 183, label: '1 kg', weight_grams: 1000, price: 275000 },
        ];
    }, [cybrProduct]);

    // Real-time calculation of dynamic price, HPP modal, and margin % for C.Y.B.R custom blend
    const { cybrCalculatedPrice, cybrCalculatedCostPrice, cybrMarginPct } = useMemo(() => {
        if (!cybrBeanA || !cybrBeanB || !cybrSelectedVariant) {
            return { cybrCalculatedPrice: 0, cybrCalculatedCostPrice: 0, cybrMarginPct: '0' };
        }

        const totalGrams = cybrSelectedVariant.weight_grams || 200;
        const gramA = (cybrRatioA / 100) * totalGrams;
        const gramB = ((100 - cybrRatioA) / 100) * totalGrams;

        const rateA = Number(cybrBeanA.price_per_10g || 3500) / 10;
        const rateB = Number(cybrBeanB.price_per_10g || 3500) / 10;
        const basePrice = (gramA * rateA) + (gramB * rateB);

        // Package discount from initialByobSettings if configured
        const variantSetting = initialByobSettings?.byob_variants?.find(
            (v) => Number(v.weight_grams) === Number(totalGrams)
        );
        let discount = 0;
        if (variantSetting?.discount_value && Number(variantSetting.discount_value) > 0) {
            if (variantSetting.discount_type === 'percentage') {
                discount = (basePrice * Number(variantSetting.discount_value)) / 100;
            } else {
                discount = Number(variantSetting.discount_value);
            }
        }
        const finalPrice = Math.max(0, Math.round(basePrice - discount));

        const costRateA = Number(cybrBeanA.cost_price_per_10g || 0) / 10;
        const costRateB = Number(cybrBeanB.cost_price_per_10g || 0) / 10;
        const finalCost = Math.round((gramA * costRateA) + (gramB * costRateB));

        const profit = finalPrice - finalCost;
        const margin = finalPrice > 0 ? ((profit / finalPrice) * 100).toFixed(1) : '0';

        return {
            cybrCalculatedPrice: finalPrice,
            cybrCalculatedCostPrice: finalCost,
            cybrMarginPct: margin,
        };
    }, [cybrBeanA, cybrBeanB, cybrRatioA, cybrSelectedVariant, initialByobSettings]);

    const isSameCybrBean = Boolean(
        cybrBeanA && cybrBeanB && cybrBeanA.name.toLowerCase() === cybrBeanB.name.toLowerCase()
    );

    const openCybrStudioModal = (product: Product) => {
        setCybrProduct(product);
        const vars = Array.isArray(product.variants) && product.variants.length > 0
            ? product.variants
            : [
                { id: 181, label: '200g', weight_grams: 200, price: 65000 },
                { id: 182, label: '500g', weight_grams: 500, price: 150000 },
                { id: 183, label: '1 kg', weight_grams: 1000, price: 275000 },
            ];
        setCybrSelectedVariant(vars[0]);
        setCybrCustomName('');
        setCybrRatioA(initialByobSettings?.default_ratio || 70);

        if (availableCybrBeans.length >= 2) {
            setCybrBeanA(availableCybrBeans[0]);
            setCybrBeanB(availableCybrBeans[1]);
        } else if (availableCybrBeans.length === 1) {
            setCybrBeanA(availableCybrBeans[0]);
            setCybrBeanB(availableCybrBeans[0]);
        }
        setIsCybrModalOpen(true);
    };

    const handleAddCybrToCart = () => {
        if (!cybrProduct || !cybrBeanA || !cybrBeanB || !cybrSelectedVariant) return;
        if (isSameCybrBean) {
            showToast('Komponen A dan B harus berbeda varietas biji kopi');
            return;
        }

        const ratioB = 100 - cybrRatioA;
        const recipeString = `${cybrRatioA}% ${cybrBeanA.name} + ${ratioB}% ${cybrBeanB.name}`;
        const itemLabel = `${cybrSelectedVariant.label} (${recipeString})`;
        const itemName = cybrCustomName.trim()
            ? `C.Y.B.R: "${cybrCustomName.trim()}"`
            : `C.Y.B.R Custom Blend`;
        const cartItemId = `cybr-${Date.now()}`;

        setCart((prev) => [
            ...prev,
            {
                id: cartItemId,
                product_id: cybrProduct.id,
                product_name: itemName,
                variant_id: cybrSelectedVariant.id,
                variant_label: itemLabel,
                price: cybrCalculatedPrice,
                cost_price: cybrCalculatedCostPrice > 0 ? cybrCalculatedCostPrice : undefined,
                quantity: 1,
                image: cybrProduct.image || '/brand/logo-circle.png',
                notes: `Rasio: ${recipeString}`,
            },
        ]);

        showToast(`${itemName} (${cybrSelectedVariant.label}) ditambahkan ke keranjang`);
        setIsCybrModalOpen(false);
    };

    // --- CHECKOUT & PAYMENT MODAL STATE ---
    const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState<
        'cash' | 'qris' | 'debit' | 'bank_transfer'
    >(() => {
        if (resolvedPayment.enable_cash) return 'cash';
        if (resolvedPayment.enable_qris) return 'qris';
        if (resolvedPayment.enable_debit) return 'debit';
        return 'cash';
    });
    const [cashTendered, setCashTendered] = useState<number | ''>('');
    const [customerName, setCustomerName] = useState<string>(() => {
        if (typeof window === 'undefined') return '';
        try {
            return localStorage.getItem(POS_CUSTOMER_NAME_STORAGE_KEY) || '';
        } catch {
            return '';
        }
    });
    const [customerPhone, setCustomerPhone] = useState<string>(() => {
        if (typeof window === 'undefined') return '';
        try {
            return localStorage.getItem(POS_CUSTOMER_PHONE_STORAGE_KEY) || '';
        } catch {
            return '';
        }
    });
    const [isDeliveryOrder, setIsDeliveryOrder] = useState<boolean>(() => {
        if (typeof window === 'undefined') return false;
        try {
            return localStorage.getItem(POS_IS_DELIVERY_STORAGE_KEY) === 'true';
        } catch {
            return false;
        }
    });
    const [shippingCost, setShippingCost] = useState<number | ''>(() => {
        if (typeof window === 'undefined') return '';
        try {
            const val = localStorage.getItem(POS_SHIPPING_COST_STORAGE_KEY);
            return val ? parseFloat(val) || '' : '';
        } catch {
            return '';
        }
    });
    const [shippingCourier, setShippingCourier] = useState<string>(() => {
        if (typeof window === 'undefined') return '';
        try {
            return localStorage.getItem(POS_SHIPPING_COURIER_STORAGE_KEY) || '';
        } catch {
            return '';
        }
    });
    const [customerAddress, setCustomerAddress] = useState<string>(() => {
        if (typeof window === 'undefined') return '';
        try {
            return localStorage.getItem(POS_CUSTOMER_ADDRESS_STORAGE_KEY) || '';
        } catch {
            return '';
        }
    });

    // --- DISCOUNT MANAGEMENT (NOMINAL / PERSENTASE & DISKON PER-ITEM) ---
    const [cartDiscountType, setCartDiscountType] = useState<
        'fixed' | 'percent'
    >(() => {
        if (typeof window === 'undefined') return 'fixed';
        try {
            const saved = localStorage.getItem(POS_DISCOUNT_TYPE_STORAGE_KEY);
            return saved === 'percent' || saved === 'fixed' ? saved : 'fixed';
        } catch {
            return 'fixed';
        }
    });
    const [cartDiscountValue, setCartDiscountValue] = useState<number>(() => {
        if (typeof window === 'undefined') return 0;
        try {
            const saved = localStorage.getItem(POS_DISCOUNT_VALUE_STORAGE_KEY);
            return saved ? parseFloat(saved) || 0 : 0;
        } catch {
            return 0;
        }
    });
    const [isCartDiscountModalOpen, setIsCartDiscountModalOpen] =
        useState(false);
    const [tempDiscountType, setTempDiscountType] = useState<
        'fixed' | 'percent'
    >('fixed');
    const [tempDiscountValue, setTempDiscountValue] = useState<string>('');

    // Item-level Discount Modal State
    const [editingDiscountItem, setEditingDiscountItem] =
        useState<CartItem | null>(null);
    const [itemDiscountType, setItemDiscountType] = useState<
        'fixed' | 'percent'
    >('percent');
    const [itemDiscountValue, setItemDiscountValue] = useState<string>('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // --- RECEIPT & PRINTING MODAL STATE ---
    const [completedReceipt, setCompletedReceipt] =
        useState<ReceiptData | null>(null);
    const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
    const [recentOrders, setRecentOrders] = useState<PosRecentOrder[]>(
        initialRecentOrders || [],
    );

    // --- TRANSACTIONS HISTORY FILTER STATE ---
    const [historyFilter, setHistoryFilter] = useState<
        'today' | 'yesterday' | 'custom'
    >('today');
    const [historyStartDate, setHistoryStartDate] = useState<string>(() => {
        const d = new Date();
        d.setDate(d.getDate() - 7);
        return getLocalDateString(d);
    });
    const [historyEndDate, setHistoryEndDate] = useState<string>(() =>
        getLocalDateString(),
    );
    const [historySearch, setHistorySearch] = useState('');
    const [historyStatusFilter, setHistoryStatusFilter] = useState<'all' | 'paid' | 'refunded'>('all');
    const [isLoadingHistory, setIsLoadingHistory] = useState(false);

    // --- REFUND MODAL STATE ---
    const [selectedOrderForRefund, setSelectedOrderForRefund] = useState<PosRecentOrder | null>(null);
    const [isRefundModalOpen, setIsRefundModalOpen] = useState(false);
    const [refundReason, setRefundReason] = useState('');
    const [refundAmount, setRefundAmount] = useState<number | ''>('');
    const [isProcessingRefund, setIsProcessingRefund] = useState(false);

    // --- SETTINGS STATE (Printer, Payments, Appearance & Staff) ---
    const [settingsSubTab, setSettingsSubTab] = useState<
        'printer' | 'payment' | 'appearance' | 'staff'
    >('printer');
    const [printerForm, setPrinterForm] =
        useState<PrinterSettings>(resolvedPrinter);
    const [paymentForm, setPaymentForm] =
        useState<PaymentSettings>(resolvedPayment);
    const [isSavingSettings, setIsSavingSettings] = useState(false);
    const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

    // --- GRID DENSITY & COLUMNS STATE ---
    const [gridDensity, setGridDensity] = useState<'compact' | 'normal' | 'comfortable'>(() => {
        try {
            const saved = localStorage.getItem('sanubari_pos_grid_density');
            if (saved === 'compact' || saved === 'normal' || saved === 'comfortable') return saved;
        } catch {}
        return (initialSettings?.layout?.grid_density) || (initialLayoutSettings?.grid_density) || 'normal';
    });

    const [gridColumns, setGridColumns] = useState<'auto' | 2 | 3 | 4 | 5 | 6>(() => {
        try {
            const saved = localStorage.getItem('sanubari_pos_grid_columns');
            if (saved && (saved === 'auto' || ['2', '3', '4', '5', '6'].includes(saved))) {
                return saved === 'auto' ? 'auto' : (Number(saved) as 2 | 3 | 4 | 5 | 6);
            }
        } catch {}
        return (initialSettings?.layout?.grid_columns) || (initialLayoutSettings?.grid_columns) || 'auto';
    });

    const [isLayoutPopoverOpen, setIsLayoutPopoverOpen] = useState(false);

    const updateGridDensity = (density: 'compact' | 'normal' | 'comfortable') => {
        setGridDensity(density);
        try {
            localStorage.setItem('sanubari_pos_grid_density', density);
        } catch {}
    };

    const updateGridColumns = (cols: 'auto' | 2 | 3 | 4 | 5 | 6) => {
        setGridColumns(cols);
        try {
            localStorage.setItem('sanubari_pos_grid_columns', String(cols));
        } catch {}
    };

    const handleSaveLayoutSettings = async () => {
        setIsSavingSettings(true);
        try {
            const csrfToken =
                (
                    document.querySelector(
                        'meta[name="csrf-token"]',
                    ) as HTMLMetaElement
                )?.content || '';
            const res = await fetch('/pos/settings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                },
                body: JSON.stringify({
                    type: 'layout',
                    settings: {
                        grid_density: gridDensity,
                        grid_columns: gridColumns,
                    },
                }),
            });
            const data = await res.json();
            if (!res.ok)
                throw new Error(
                    data.message || 'Gagal menyimpan preferensi tampilan',
                );
            showToast('✓ Pengaturan kepadatan & kolom katalog berhasil disimpan!');
        } catch (err: any) {
            alert('Gagal: ' + (err.message || 'Terjadi kesalahan sistem'));
        } finally {
            setIsSavingSettings(false);
        }
    };

    const getCatalogGridClasses = (
        density: 'compact' | 'normal' | 'comfortable',
        columns: 'auto' | 2 | 3 | 4 | 5 | 6,
    ) => {
        const gap =
            density === 'compact'
                ? 'gap-1.5 sm:gap-2'
                : density === 'comfortable'
                ? 'gap-3 sm:gap-4'
                : 'gap-2 sm:gap-2.5';

        if (columns === 2) return `grid touch-pan-y grid-cols-2 ${gap}`;
        if (columns === 3) return `grid touch-pan-y grid-cols-2 sm:grid-cols-3 ${gap}`;
        if (columns === 4) return `grid touch-pan-y grid-cols-2 sm:grid-cols-3 md:grid-cols-4 ${gap}`;
        if (columns === 5) return `grid touch-pan-y grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 ${gap}`;
        if (columns === 6) return `grid touch-pan-y grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 ${gap}`;

        // Auto responsive mode:
        if (density === 'compact') {
            return `grid touch-pan-y grid-cols-2 xs:grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 ${gap}`;
        }
        if (density === 'comfortable') {
            return `grid touch-pan-y grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 ${gap}`;
        }
        return `grid touch-pan-y grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 ${gap}`;
    };

    // --- CASH FLOW STATE (Kas Masuk-Keluar) ---
    const [cashFlowPeriod, setCashFlowPeriod] = useState<
        'daily' | 'this_month' | 'custom_month'
    >('daily');
    const [cashFlowDate, setCashFlowDate] = useState<string>(() =>
        getLocalDateString(),
    );
    const [cashFlowMonth, setCashFlowMonth] = useState<string>(() =>
        getLocalMonthString(),
    );
    const [flowTransactionDate, setFlowTransactionDate] = useState<string>(() =>
        getLocalDateString(),
    );
    const [cashFlowsList, setCashFlowsList] = useState<PosCashFlowItem[]>([]);
    const [cashDrawer, setCashDrawer] = useState(resolvedDrawer);
    const [isLoadingCashFlow, setIsLoadingCashFlow] = useState(false);
    const [isSavingCashFlow, setIsSavingCashFlow] = useState(false);
    const [flowType, setFlowType] = useState<'in' | 'out'>('out');
    const [flowCategory, setFlowCategory] = useState<string>('operasional');
    const [flowAmount, setFlowAmount] = useState<number | ''>('');
    const [flowDescription, setFlowDescription] = useState<string>('');

    // --- REPORTS STATE ---
    const [reportStaffId, setReportStaffId] = useState<string>(
        isStaffRestricted ? String(cashier.id) : 'all',
    );
    const [reportPeriod, setReportPeriod] = useState<
        'daily' | 'monthly' | 'custom'
    >('daily');
    const [reportDate, setReportDate] = useState<string>(() =>
        getLocalDateString(),
    );
    const [reportMonth, setReportMonth] = useState<string>(() =>
        getLocalMonthString(),
    );
    const [reportStartDate, setReportStartDate] = useState<string>(() =>
        getLocalDateString(),
    );
    const [reportEndDate, setReportEndDate] = useState<string>(() =>
        getLocalDateString(),
    );
    const [reportData, setReportData] = useState<any>(null);
    const [isLoadingReport, setIsLoadingReport] = useState(false);

    // --- PROFIT & LOSS REPORT STATE (LABA RUGI) ---
    const [plPeriod, setPlPeriod] = useState<
        'today' | 'yesterday' | 'this_month' | 'last_month' | 'custom_month'
    >('today');
    const [plDate, setPlDate] = useState<string>(() => getLocalDateString());
    const [plMonth, setPlMonth] = useState<string>(() => getLocalMonthString());
    const [profitLossData, setProfitLossData] = useState<any>(null);
    const [isLoadingProfitLoss, setIsLoadingProfitLoss] = useState(false);
    const [expandedPlOrderId, setExpandedPlOrderId] = useState<number | null>(
        null,
    );
    const [selectedPlExpenseCategory, setSelectedPlExpenseCategory] =
        useState<string>('all');
    const [isExportingPlExcel, setIsExportingPlExcel] = useState(false);

    // --- INVENTORY VIEW STATE ---
    const [inventorySearch, setInventorySearch] = useState('');
    const [inventoryFilter, setInventoryFilter] = useState<
        'all' | 'in_stock' | 'low_stock' | 'out_of_stock'
    >('all');

    // --- MOBILE DRAWER CART STATE ---
    const [isMobileCartOpen, setIsMobileCartOpen] = useState(false);

    // --- QUEUE / HOLD ORDERS STATE ---
    const [heldOrdersList, setHeldOrdersList] = useState<PosHeldOrderItem[]>(
        initialHeldOrders || initialQueueOrders || [],
    );
    const [isHoldModalOpen, setIsHoldModalOpen] = useState(false);
    const [holdCustomerName, setHoldCustomerName] = useState('');
    const [holdCustomerPhone, setHoldCustomerPhone] = useState('');
    const [holdNotes, setHoldNotes] = useState('');
    const [isHoldingSubmit, setIsHoldingSubmit] = useState(false);

    // --- SHARE PRE-BILL RECEIPT (SEBELUM BAYAR) STATE ---
    const [isSharePreBillModalOpen, setIsSharePreBillModalOpen] =
        useState(false);
    const [sharePreBillCustomerName, setSharePreBillCustomerName] =
        useState('');
    const [sharePreBillCustomerPhone, setSharePreBillCustomerPhone] =
        useState('');
    const [sharePreBillIncludeBank, setSharePreBillIncludeBank] =
        useState(true);
    const [sharePreBillNotes, setSharePreBillNotes] = useState('');
    const [isPreBillCopied, setIsPreBillCopied] = useState(false);

    // --- MANUAL / CUSTOM ORDER STATE ---
    const [isManualOrderModalOpen, setIsManualOrderModalOpen] = useState(false);
    const [manualProductName, setManualProductName] = useState('');
    const [manualCostPrice, setManualCostPrice] = useState<string | number>('');
    const [manualPrice, setManualPrice] = useState<string | number>('');
    const [manualQuantity, setManualQuantity] = useState(1);
    const [manualVariantLabel, setManualVariantLabel] = useState('Manual');
    const [manualNotes, setManualNotes] = useState('');
    const [editingManualCartItemId, setEditingManualCartItemId] = useState<
        string | null
    >(null);

    // --- KALKULATOR CUSTOM HARGA 1 KG (200g x 5) & 500 GR (100g x 5) STATE ---
    const [isKgCalculatorOpen, setIsKgCalculatorOpen] = useState(false);
    const [calcTargetMode, setCalcTargetMode] = useState<'1000g' | '500g'>('1000g');
    const [kgSelectedProductId, setKgSelectedProductId] = useState<number | 'custom'>('custom');
    const [kgCustomProductName, setKgCustomProductName] = useState('');
    const [kgPrice200g, setKgPrice200g] = useState<string | number>('');
    const [kgCostPrice200g, setKgCostPrice200g] = useState<string | number>('');
    const [kgMultiplier, setKgMultiplier] = useState<number>(5); // 200g x 5 = 1000g (1 Kg)
    const [kgDiscountType, setKgDiscountType] = useState<'none' | 'percent' | 'nominal'>('none');
    const [kgDiscountValue, setKgDiscountValue] = useState<string | number>('');
    const [isKgCustomPriceOverridden, setIsKgCustomPriceOverridden] = useState(false);
    const [kgCustomFinalPrice, setKgCustomFinalPrice] = useState<string | number>('');
    const [kgQuantity, setKgQuantity] = useState<number>(1);
    const [kgNotes, setKgNotes] = useState<string>('');

    // Search Input Auto-focus ref
    const searchInputRef = useRef<HTMLInputElement>(null);

    // Categories allowed on POS (Semua Kopi, Filter Beans, Arabica Espresso, Houseblend, Fine Robusta)
    const posCategories = useMemo(() => {
        const allowedSlugs = [
            'filter-beans',
            'arabica',
            'houseblend',
            'robusta',
        ];
        const allowedNames = [
            'filter beans',
            'arabica espresso',
            'houseblend',
            'fine robusta',
        ];
        const filtered = categories.filter(
            (c) =>
                allowedSlugs.includes((c.slug || '').toLowerCase()) ||
                allowedNames.some((n) =>
                    (c.name || '').toLowerCase().includes(n),
                ),
        );
        return filtered.length > 0 ? filtered : categories;
    }, [categories]);

    // Filtered Products for Cashier View
    const filteredProducts = useMemo(() => {
        let list = Array.isArray(products) ? products : [];
        if (selectedCategoryId !== 'all') {
            list = list.filter((p) =>
                Array.isArray(p.category_ids)
                    ? p.category_ids.includes(selectedCategoryId)
                    : ((p as any)?.category_id === selectedCategoryId),
            );
        }
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            list = list.filter(
                (p) =>
                    (p.name && p.name.toLowerCase().includes(q)) ||
                    (p.series && p.series.toLowerCase().includes(q)) ||
                    (Array.isArray(p.variants) &&
                        p.variants.some(
                            (v) =>
                                (v.label && v.label.toLowerCase().includes(q)) ||
                                (v.sku && v.sku.toLowerCase().includes(q)),
                        )),
            );
        }
        return list;
    }, [products, selectedCategoryId, searchQuery]);

    // Filtered Inventory
    const filteredInventory = useMemo(() => {
        let list = Array.isArray(products) ? products : [];
        if (inventoryFilter === 'in_stock') {
            list = list.filter((p) => (Number(p.stock) || 0) > 10 && !p.is_out_of_stock);
        } else if (inventoryFilter === 'low_stock') {
            list = list.filter((p) => (Number(p.stock) || 0) > 0 && (Number(p.stock) || 0) <= 10 && !p.is_out_of_stock);
        } else if (inventoryFilter === 'out_of_stock') {
            list = list.filter((p) => (Number(p.stock) || 0) <= 0 || p.is_out_of_stock);
        }
        if (inventorySearch.trim()) {
            const q = inventorySearch.toLowerCase();
            list = list.filter(
                (p) =>
                    (p.name && p.name.toLowerCase().includes(q)) ||
                    (Array.isArray(p.variants) &&
                        p.variants.some(
                            (v) =>
                                (v.label && v.label.toLowerCase().includes(q)) ||
                                (v.sku && v.sku.toLowerCase().includes(q)),
                        )),
            );
        }
        return list;
    }, [products, inventoryFilter, inventorySearch]);

    // Calculations (Diskon Per-Item & Diskon Transaksi)
    const grossSubtotal = useMemo(() => {
        return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    }, [cart]);

    const totalItemDiscounts = useMemo(() => {
        return cart.reduce((sum, item) => sum + (item.discount_amount || 0), 0);
    }, [cart]);

    const netAfterItemDiscounts = useMemo(() => {
        return Math.max(0, grossSubtotal - totalItemDiscounts);
    }, [grossSubtotal, totalItemDiscounts]);

    const cartDiscountAmount = useMemo(() => {
        if (cartDiscountValue <= 0) return 0;
        if (cartDiscountType === 'percent') {
            const pct = Math.min(100, Math.max(0, cartDiscountValue));
            return Math.round((netAfterItemDiscounts * pct) / 100);
        }
        return Math.min(netAfterItemDiscounts, Math.max(0, cartDiscountValue));
    }, [netAfterItemDiscounts, cartDiscountType, cartDiscountValue]);

    const discountAmount = useMemo(() => {
        return totalItemDiscounts + cartDiscountAmount;
    }, [totalItemDiscounts, cartDiscountAmount]);

    const subtotal = grossSubtotal;

    const numericShippingCost = useMemo(() => {
        if (!isDeliveryOrder) return 0;
        const val =
            typeof shippingCost === 'number'
                ? shippingCost
                : parseFloat(String(shippingCost)) || 0;
        return Math.max(0, val);
    }, [isDeliveryOrder, shippingCost]);

    const totalAmount = useMemo(() => {
        return (
            Math.max(0, grossSubtotal - discountAmount) + numericShippingCost
        );
    }, [grossSubtotal, discountAmount, numericShippingCost]);

    const totalItemsCount = useMemo(() => {
        return cart.reduce((sum, item) => sum + item.quantity, 0);
    }, [cart]);

    const cashChange = useMemo(() => {
        if (paymentMethod !== 'cash') return 0;
        const tendered = typeof cashTendered === 'number' ? cashTendered : 0;
        return Math.max(0, tendered - totalAmount);
    }, [paymentMethod, cashTendered, totalAmount]);

    // Quick cash suggestion buttons
    const quickCashOptions = useMemo(() => {
        if (totalAmount <= 0) return [];
        const base = totalAmount;
        const opts = new Set<number>();
        opts.add(base); // Uang pas

        // Round up to nearest 10k, 20k, 50k, 100k
        const roundTo = (num: number, to: number) => Math.ceil(num / to) * to;
        if (base < 50000) opts.add(50000);
        if (base < 100000) opts.add(100000);
        if (base < 200000) opts.add(200000);
        opts.add(roundTo(base, 10000));
        opts.add(roundTo(base, 50000));

        return Array.from(opts)
            .filter((v) => v >= base)
            .sort((a, b) => a - b)
            .slice(0, 4);
    }, [totalAmount]);

    // --- PERSIST ACTIVE CART & TRANSACTION INFO TO LOCALSTORAGE (PREVENT RELOAD RESET) ---
    useEffect(() => {
        if (typeof window === 'undefined') return;
        try {
            if (cart.length > 0) {
                localStorage.setItem(
                    POS_CART_STORAGE_KEY,
                    JSON.stringify(cart),
                );
            } else {
                localStorage.removeItem(POS_CART_STORAGE_KEY);
            }
        } catch (e) {
            console.error('Gagal menyimpan keranjang ke localStorage:', e);
        }
    }, [cart]);

    useEffect(() => {
        if (typeof window === 'undefined') return;
        try {
            if (cartDiscountValue > 0) {
                localStorage.setItem(
                    POS_DISCOUNT_TYPE_STORAGE_KEY,
                    cartDiscountType,
                );
                localStorage.setItem(
                    POS_DISCOUNT_VALUE_STORAGE_KEY,
                    String(cartDiscountValue),
                );
            } else {
                localStorage.removeItem(POS_DISCOUNT_TYPE_STORAGE_KEY);
                localStorage.removeItem(POS_DISCOUNT_VALUE_STORAGE_KEY);
            }
        } catch (e) {
            console.error('Gagal menyimpan diskon ke localStorage:', e);
        }
    }, [cartDiscountType, cartDiscountValue]);

    useEffect(() => {
        if (typeof window === 'undefined') return;
        try {
            if (customerName) {
                localStorage.setItem(
                    POS_CUSTOMER_NAME_STORAGE_KEY,
                    customerName,
                );
            } else {
                localStorage.removeItem(POS_CUSTOMER_NAME_STORAGE_KEY);
            }
        } catch (e) {
            console.error('Gagal menyimpan customerName ke localStorage:', e);
        }
    }, [customerName]);

    useEffect(() => {
        if (typeof window === 'undefined') return;
        try {
            if (customerPhone) {
                localStorage.setItem(
                    POS_CUSTOMER_PHONE_STORAGE_KEY,
                    customerPhone,
                );
            } else {
                localStorage.removeItem(POS_CUSTOMER_PHONE_STORAGE_KEY);
            }
        } catch (e) {
            console.error('Gagal menyimpan customerPhone ke localStorage:', e);
        }
    }, [customerPhone]);

    useEffect(() => {
        if (typeof window === 'undefined') return;
        try {
            if (isDeliveryOrder) {
                localStorage.setItem(POS_IS_DELIVERY_STORAGE_KEY, 'true');
            } else {
                localStorage.removeItem(POS_IS_DELIVERY_STORAGE_KEY);
            }
            if (shippingCost !== '') {
                localStorage.setItem(
                    POS_SHIPPING_COST_STORAGE_KEY,
                    String(shippingCost),
                );
            } else {
                localStorage.removeItem(POS_SHIPPING_COST_STORAGE_KEY);
            }
            if (shippingCourier) {
                localStorage.setItem(
                    POS_SHIPPING_COURIER_STORAGE_KEY,
                    shippingCourier,
                );
            } else {
                localStorage.removeItem(POS_SHIPPING_COURIER_STORAGE_KEY);
            }
            if (customerAddress) {
                localStorage.setItem(
                    POS_CUSTOMER_ADDRESS_STORAGE_KEY,
                    customerAddress,
                );
            } else {
                localStorage.removeItem(POS_CUSTOMER_ADDRESS_STORAGE_KEY);
            }
        } catch (e) {
            console.error('Gagal menyimpan shipping ke localStorage:', e);
        }
    }, [isDeliveryOrder, shippingCost, shippingCourier, customerAddress]);

    const clearCartStorage = () => {
        if (typeof window === 'undefined') return;
        try {
            localStorage.removeItem(POS_CART_STORAGE_KEY);
            localStorage.removeItem(POS_DISCOUNT_TYPE_STORAGE_KEY);
            localStorage.removeItem(POS_DISCOUNT_VALUE_STORAGE_KEY);
            localStorage.removeItem(POS_CUSTOMER_NAME_STORAGE_KEY);
            localStorage.removeItem(POS_CUSTOMER_PHONE_STORAGE_KEY);
            localStorage.removeItem(POS_IS_DELIVERY_STORAGE_KEY);
            localStorage.removeItem(POS_SHIPPING_COST_STORAGE_KEY);
            localStorage.removeItem(POS_SHIPPING_COURIER_STORAGE_KEY);
            localStorage.removeItem(POS_CUSTOMER_ADDRESS_STORAGE_KEY);
        } catch (e) {
            console.error('Gagal membersihkan keranjang localStorage:', e);
        }
    };

    // Keyboard Shortcuts (F2: Search, F4: Bayar, ESC: Cancel/Close)
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'F2') {
                e.preventDefault();
                setActiveTab('cashier');
                searchInputRef.current?.focus();
            } else if (e.key === 'F3') {
                e.preventDefault();
                setActiveTab('cashier');
                openManualOrderModal();
            } else if (e.key === 'F4') {
                if (cart.length > 0 && !isCheckoutModalOpen) {
                    e.preventDefault();
                    openCheckout();
                }
            } else if (e.key === 'F6') {
                if (
                    cart.length > 0 &&
                    !isSharePreBillModalOpen &&
                    !isCheckoutModalOpen
                ) {
                    e.preventDefault();
                    openSharePreBillModal();
                }
            } else if (e.key === 'F7') {
                if (
                    cart.length > 0 &&
                    !isHoldModalOpen &&
                    !isCheckoutModalOpen
                ) {
                    e.preventDefault();
                    openHoldModal();
                }
            } else if (e.key === 'F8') {
                e.preventDefault();
                setActiveTab('cashier');
                openKgCalculatorModal();
            } else if (e.key === 'Escape') {
                if (isSidebarOpen) {
                    setIsSidebarOpen(false);
                } else if (isSharePreBillModalOpen) {
                    setIsSharePreBillModalOpen(false);
                } else if (isHoldModalOpen) {
                    setIsHoldModalOpen(false);
                } else if (isCheckoutModalOpen) {
                    setIsCheckoutModalOpen(false);
                } else if (isKgCalculatorOpen) {
                    setIsKgCalculatorOpen(false);
                } else if (variantPickerProduct) {
                    setVariantPickerProduct(null);
                } else if (isRefundModalOpen) {
                    setIsRefundModalOpen(false);
                } else if (isReceiptModalOpen) {
                    setIsReceiptModalOpen(false);
                } else if (isOfflineModalOpen) {
                    setIsOfflineModalOpen(false);
                } else if (isManualOrderModalOpen) {
                    setIsManualOrderModalOpen(false);
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [
        cart,
        isCheckoutModalOpen,
        isSharePreBillModalOpen,
        isHoldModalOpen,
        isManualOrderModalOpen,
        isKgCalculatorOpen,
        variantPickerProduct,
        isReceiptModalOpen,
        isRefundModalOpen,
        isSidebarOpen,
        isOfflineModalOpen,
    ]);

    // Fetch Cash Flows when period, date, or month changes
    const fetchCashFlows = async (
        period = cashFlowPeriod,
        dateStr = cashFlowDate,
        monthStr = cashFlowMonth,
    ) => {
        setIsLoadingCashFlow(true);
        try {
            const params = new URLSearchParams();
            params.set('period', period);
            if (period === 'daily') {
                params.set('date', dateStr);
            } else if (period === 'custom_month') {
                params.set('month', monthStr);
            }
            const res = await fetch(`/pos/cash-flows?${params.toString()}`);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            const list = data.cash_flows || data.flows || [];
            setCashFlowsList(list);
            const drawer = data.cash_drawer || data.summary;
            if (drawer) {
                setCashDrawer(drawer);
            }
        } catch (err) {
            console.error('Failed to fetch cash flows:', err);
        } finally {
            setIsLoadingCashFlow(false);
        }
    };

    useEffect(() => {
        if (activeTab === 'cash_flow') {
            fetchCashFlows(cashFlowPeriod, cashFlowDate, cashFlowMonth);
        }
    }, [activeTab, cashFlowPeriod, cashFlowDate, cashFlowMonth]);

    // Prevent Android APK SwipeRefreshLayout & browser pull-to-refresh from hijacking
    // vertical scroll gestures and accidentally reloading the POS app.
    // Keeping window.scrollY >= 2 ensures webView.canScrollVertically(-1) is always true.
    useEffect(() => {
        const html = document.documentElement;
        const body = document.body;
        const prevHtmlOverscroll = html.style.overscrollBehaviorY;
        const prevBodyOverscroll = body.style.overscrollBehaviorY;
        const prevBodyMinHeight = body.style.minHeight;

        html.style.overscrollBehaviorY = 'none';
        body.style.overscrollBehaviorY = 'none';
        body.style.minHeight = 'calc(100dvh + 8px)';

        const ensureScrollOffset = () => {
            if (window.scrollY < 2) {
                window.scrollTo(0, 2);
            }
        };

        ensureScrollOffset();
        const rafId = requestAnimationFrame(ensureScrollOffset);
        const timerId = window.setTimeout(ensureScrollOffset, 120);

        window.addEventListener('touchstart', ensureScrollOffset, { passive: true });
        window.addEventListener('touchend', ensureScrollOffset, { passive: true });

        return () => {
            cancelAnimationFrame(rafId);
            window.clearTimeout(timerId);
            window.removeEventListener('touchstart', ensureScrollOffset);
            window.removeEventListener('touchend', ensureScrollOffset);
            html.style.overscrollBehaviorY = prevHtmlOverscroll;
            body.style.overscrollBehaviorY = prevBodyOverscroll;
            body.style.minHeight = prevBodyMinHeight;
        };
    }, []);

    // Reset product catalog scroll to top (offset 2px) when switching category, search, or tab
    useEffect(() => {
        window.scrollTo(0, 2);
    }, [activeTab, selectedCategoryId, searchQuery]);

    // Fetch Sales Reports when period, date, or staff filter changes
    const fetchSalesReport = async (staffId = reportStaffId) => {
        setIsLoadingReport(true);
        try {
            const params = new URLSearchParams();
            params.set('period', reportPeriod);
            if (reportPeriod === 'daily') params.set('date', reportDate);
            if (reportPeriod === 'monthly') params.set('month', reportMonth);
            if (reportPeriod === 'custom') {
                params.set('start_date', reportStartDate);
                params.set('end_date', reportEndDate);
            }
            if (!isStaffRestricted && staffId && staffId !== 'all') {
                params.set('staff_id', staffId);
            }
            const res = await fetch(`/pos/reports?${params.toString()}`);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            const rep = data.report || data;
            setReportData(rep);
        } catch (err) {
            console.error('Failed to load reports:', err);
            showToast('Gagal memuat data laporan');
        } finally {
            setIsLoadingReport(false);
        }
    };

    useEffect(() => {
        if (activeTab === 'reports') {
            fetchSalesReport(reportStaffId);
        }
    }, [
        activeTab,
        reportPeriod,
        reportDate,
        reportMonth,
        reportStartDate,
        reportEndDate,
        reportStaffId,
    ]);

    // Fetch Profit & Loss Report
    const fetchProfitLossReport = async (
        period = plPeriod,
        date = plDate,
        month = plMonth,
    ) => {
        setIsLoadingProfitLoss(true);
        try {
            const params = new URLSearchParams();
            params.set('period', period);
            if (period === 'today') params.set('date', date);
            if (period === 'custom_month') params.set('month', month);

            const res = await fetch(`/pos/profit-loss?${params.toString()}`);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            const pl = data.profit_loss || data;
            setProfitLossData(pl);
        } catch (err) {
            console.error('Failed to load profit loss report:', err);
            showToast('Gagal memuat laporan laba rugi');
        } finally {
            setIsLoadingProfitLoss(false);
        }
    };

    useEffect(() => {
        if (activeTab === 'profit_loss') {
            if (!canAccessProfitLoss) {
                setActiveTab('cashier');
                return;
            }
            fetchProfitLossReport(plPeriod, plDate, plMonth);
        }
    }, [activeTab, plPeriod, plDate, plMonth, canAccessProfitLoss]);

    const handleExportProfitLossExcel = () => {
        setIsExportingPlExcel(true);
        try {
            const params = new URLSearchParams();
            params.set('period', plPeriod);
            if (plPeriod === 'today') params.set('date', plDate);
            if (plPeriod === 'custom_month') params.set('month', plMonth);

            const exportUrl = `/pos/profit-loss/export-excel?${params.toString()}`;

            const link = document.createElement('a');
            link.href = exportUrl;
            link.setAttribute('download', '');
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            showToast('Laporan Laba Rugi Excel sedang diunduh...');
        } catch (err) {
            console.error('Failed to export profit loss excel:', err);
            showToast('Gagal mengekspor laporan Excel');
        } finally {
            setTimeout(() => setIsExportingPlExcel(false), 1200);
        }
    };

    const handlePrintProfitLossReport = () => {
        if (!profitLossData) {
            showToast('Data laba rugi belum siap dicetak.');
            return;
        }
        const reportData: ProfitLossReportData = {
            store_name: 'Alat Kopi Malang',
            period_title: profitLossData.period_title,
            printed_at: new Date().toLocaleString('id-ID', {
                dateStyle: 'medium',
                timeStyle: 'short',
            }),
            cashier_name: cashier.name,
            gross_sales: profitLossData.summary.gross_sales,
            total_discounts: profitLossData.summary.total_discounts,
            net_sales: profitLossData.summary.net_sales,
            total_cogs: profitLossData.summary.total_cogs,
            gross_profit: profitLossData.summary.gross_profit,
            gross_margin_pct: profitLossData.summary.gross_margin_pct,
            total_expenses: profitLossData.summary.total_expenses,
            other_income: profitLossData.summary.other_income,
            net_profit: profitLossData.summary.net_profit,
            net_margin_pct: profitLossData.summary.net_margin_pct,
            total_transactions: profitLossData.summary.total_transactions,
            items_sold: profitLossData.summary.items_sold,
            expense_breakdown: profitLossData.expense_breakdown?.map(
                (e: any) => ({
                    category: e.category,
                    label: e.label,
                    count: e.count,
                    total: e.total,
                }),
            ),
            top_margin_products: profitLossData.top_margin_products
                ?.slice(0, 10)
                .map((p: any) => ({
                    product_name: p.product_name,
                    variant_label: p.variant_label,
                    quantity: p.quantity,
                    gross_profit: p.gross_profit,
                })),
        };
        printProfitLossThermalWeb(
            reportData,
            printerForm.paper_width,
            printerForm,
        );
    };

    // Fetch Transaction History with Filters (Hari Ini, Kemarin, Custom Tanggal)
    const fetchHistoryOrders = async (
        filterType = historyFilter,
        startDate = historyStartDate,
        endDate = historyEndDate,
        searchQuery = historySearch,
    ) => {
        setIsLoadingHistory(true);
        try {
            const params = new URLSearchParams();
            params.set('filter', filterType);
            if (filterType === 'custom') {
                if (startDate) params.set('start_date', startDate);
                if (endDate) params.set('end_date', endDate);
            }
            if (searchQuery.trim()) {
                params.set('search', searchQuery.trim());
            }
            const res = await fetch(`/pos/orders?${params.toString()}`);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            if (data.orders) {
                setRecentOrders(data.orders);
            }
        } catch (err) {
            console.error('Failed to load transaction history:', err);
            showToast('Gagal memuat riwayat transaksi');
        } finally {
            setIsLoadingHistory(false);
        }
    };

    useEffect(() => {
        if (activeTab === 'transactions') {
            fetchHistoryOrders(
                historyFilter,
                historyStartDate,
                historyEndDate,
                historySearch,
            );
        }
    }, [activeTab, historyFilter]);

    // Client-side search and summary calculation with Status Filter (All, Paid, Refunded)
    const filteredOrders = useMemo(() => {
        let list = Array.isArray(recentOrders) ? recentOrders : [];
        if (historyStatusFilter === 'paid') {
            list = list.filter((ord) => ord?.payment_status !== 'refunded');
        } else if (historyStatusFilter === 'refunded') {
            list = list.filter((ord) => ord?.payment_status === 'refunded');
        }

        if (!historySearch.trim()) return list;
        const q = historySearch.toLowerCase();
        return list.filter(
            (ord) =>
                (ord?.order_number && ord.order_number.toLowerCase().includes(q)) ||
                (ord?.customer_name && ord.customer_name.toLowerCase().includes(q)) ||
                (ord?.customer_phone && ord.customer_phone.includes(q)) ||
                (ord?.refund_reason && ord.refund_reason.toLowerCase().includes(q)),
        );
    }, [recentOrders, historyStatusFilter, historySearch]);

    const historyTotalAmount = useMemo(() => {
        return filteredOrders
            .filter((ord) => ord?.payment_status !== 'refunded')
            .reduce((sum, ord) => sum + (ord?.total_amount || 0), 0);
    }, [filteredOrders]);

    const historyTotalRefunds = useMemo(() => {
        const list = Array.isArray(recentOrders) ? recentOrders : [];
        return list
            .filter((ord) => ord?.payment_status === 'refunded')
            .reduce((sum, ord) => sum + (ord?.refund_amount || ord?.total_amount || 0), 0);
    }, [recentOrders]);

    // --- REFUND HANDLER FUNCTIONS ---
    const handleOpenRefundModal = (order: PosRecentOrder) => {
        if (order.payment_status === 'refunded') {
            showToast('Transaksi ini sudah di-refund sebelumnya.');
            return;
        }
        setSelectedOrderForRefund(order);
        setRefundAmount(order.total_amount);
        setRefundReason('');
        setIsRefundModalOpen(true);
    };

    const handleConfirmRefund = async () => {
        if (!selectedOrderForRefund) return;
        const reason = refundReason.trim();
        if (!reason) {
            alert('Mohon pilih atau masukkan alasan refund / retur transaksi.');
            return;
        }

        const amt = typeof refundAmount === 'number' && refundAmount > 0
            ? refundAmount
            : selectedOrderForRefund.total_amount;

        setIsProcessingRefund(true);
        try {
            // Check if online or offline
            if (!isOnline || manualOffline) {
                // Offline Refund handling
                const updatedOrders = recentOrders.map((ord) => {
                    if (ord.id === selectedOrderForRefund.id || ord.order_number === selectedOrderForRefund.order_number) {
                        return {
                            ...ord,
                            payment_status: 'refunded',
                            payment_status_label: 'Dana Dikembalikan (Refund)',
                            status: 'refunded',
                            status_label: 'Transaksi Di-refund',
                            refund_reason: reason,
                            refund_amount: amt,
                            refunded_at: new Date().toLocaleString('id-ID'),
                            refunded_by_name: cashier.name,
                            payment_details: {
                                ...(ord.payment_details || {}),
                                refunded_at: new Date().toLocaleString('id-ID'),
                                refunded_by_name: cashier.name,
                                refund_reason: reason,
                                refund_amount: amt,
                            },
                        };
                    }
                    return ord;
                });
                setRecentOrders(updatedOrders);
                showToast(`[MODE OFFLINE] Transaksi #${selectedOrderForRefund.order_number} berhasil di-refund.`);
                setIsRefundModalOpen(false);

                // Prepare Receipt for Printing
                const refundReceipt: ReceiptData = {
                    store_name: printerForm.store_name,
                    tagline: printerForm.tagline,
                    address: printerForm.address,
                    phone: printerForm.phone,
                    instagram: printerForm.instagram,
                    order_number: selectedOrderForRefund.order_number,
                    date: new Date().toLocaleString('id-ID'),
                    cashier_name: cashier.name,
                    customer_name: selectedOrderForRefund.customer_name,
                    customer_phone: selectedOrderForRefund.customer_phone,
                    customer_address: selectedOrderForRefund.customer_address,
                    shipping_cost: selectedOrderForRefund.shipping_cost,
                    shipping_courier: selectedOrderForRefund.shipping_courier,
                    items: selectedOrderForRefund.items,
                    subtotal: selectedOrderForRefund.subtotal,
                    discount_amount: selectedOrderForRefund.payment_details?.discount_amount || 0,
                    total_amount: selectedOrderForRefund.total_amount,
                    payment_method_label: selectedOrderForRefund.payment_method_label,
                    footer_note: printerForm.receipt_footer,
                    is_refund: true,
                    refund_reason: reason,
                    refund_amount: amt,
                    refunded_at: new Date().toLocaleString('id-ID'),
                    refunded_by_name: cashier.name,
                };
                setCompletedReceipt(refundReceipt);
                setIsReceiptModalOpen(true);
                return;
            }

            const csrfToken = (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '';
            const res = await fetch(`/pos/orders/${selectedOrderForRefund.id}/refund`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                },
                body: JSON.stringify({
                    reason: reason,
                    refund_amount: amt,
                }),
            });

            const data = await res.json();
            if (!res.ok || !data.success) {
                throw new Error(data.message || 'Gagal memproses refund transaksi.');
            }

            // Update recent orders state
            setRecentOrders((prev) =>
                prev.map((ord) =>
                    ord.id === selectedOrderForRefund.id
                        ? {
                              ...ord,
                              ...data.order,
                          }
                        : ord,
                ),
            );

            if (data.cash_drawer) {
                setCashDrawer((prev) => ({
                    ...prev,
                    ...data.cash_drawer,
                }));
            }

            showToast(data.message || 'Refund transaksi berhasil diproses.');
            setIsRefundModalOpen(false);

            // Automatically open Receipt Modal configured for Refund
            const refundReceipt: ReceiptData = {
                store_name: printerForm.store_name,
                tagline: printerForm.tagline,
                address: printerForm.address,
                phone: printerForm.phone,
                instagram: printerForm.instagram,
                order_number: data.order?.order_number || selectedOrderForRefund.order_number,
                date: data.order?.refunded_at || new Date().toLocaleString('id-ID'),
                cashier_name: cashier.name,
                customer_name: selectedOrderForRefund.customer_name,
                customer_phone: selectedOrderForRefund.customer_phone,
                customer_address: selectedOrderForRefund.customer_address,
                shipping_cost: selectedOrderForRefund.shipping_cost,
                shipping_courier: selectedOrderForRefund.shipping_courier,
                items: selectedOrderForRefund.items,
                subtotal: selectedOrderForRefund.subtotal,
                discount_amount: selectedOrderForRefund.payment_details?.discount_amount || 0,
                total_amount: selectedOrderForRefund.total_amount,
                payment_method_label: selectedOrderForRefund.payment_method_label,
                footer_note: printerForm.receipt_footer,
                is_refund: true,
                refund_reason: reason,
                refund_amount: amt,
                refunded_at: data.order?.refunded_at || new Date().toLocaleString('id-ID'),
                refunded_by_name: cashier.name,
            };
            setCompletedReceipt(refundReceipt);
            setIsReceiptModalOpen(true);
        } catch (err: any) {
            alert('Gagal memproses refund: ' + (err.message || 'Terjadi kesalahan sistem'));
        } finally {
            setIsProcessingRefund(false);
        }
    };

    // Add to Cart Logic
    const addToCart = (product: Product, variant: ProductVariant) => {
        const isPre = Boolean(product.is_preorder || product.stock_status === 'pre_order');
        const vStock = (variant as any).stock !== undefined ? Number((variant as any).stock) : null;

        if (
            !isPre &&
            (product.is_out_of_stock ||
                variant.stock_status === 'out_of_stock' ||
                (vStock !== null && vStock <= 0))
        ) {
            showToast('Produk atau varian ini sedang habis');
            return;
        }

        const cartItemId = `${product.id}-${variant.id}`;
        const existingItem = cart.find((item) => item.id === cartItemId);
        if (!isPre && vStock !== null && existingItem && existingItem.quantity >= vStock) {
            showToast(`Stok maksimal ${product.name} (${variant.label}) hanya ${vStock} pcs`);
            return;
        }

        setCart((prev) => {
            const existing = prev.find((item) => item.id === cartItemId);
            if (existing) {
                return prev.map((item) => {
                    if (item.id === cartItemId) {
                        const newQty = item.quantity + 1;
                        const newDisc = recalculateItemDiscount(item, newQty);
                        return {
                            ...item,
                            quantity: newQty,
                            discount_amount: newDisc > 0 ? newDisc : undefined,
                        };
                    }
                    return item;
                });
            }
            return [
                ...prev,
                {
                    id: cartItemId,
                    product_id: product.id,
                    product_name: product.name,
                    variant_id: variant.id,
                    variant_label: variant.label,
                    price: variant.price,
                    quantity: 1,
                    image: product.image,
                },
            ];
        });

        showToast(`${product.name} (${variant.label}) ditambahkan`);
    };

    // Recalculate discount amount when item quantity changes
    const recalculateItemDiscount = (
        item: CartItem,
        newQty: number,
    ): number => {
        if (!item.discount_type || !item.discount_value) return 0;
        const lineGross = item.price * newQty;
        if (item.discount_type === 'percent') {
            const pct = Math.min(100, Math.max(0, item.discount_value));
            return Math.round((lineGross * pct) / 100);
        }
        return Math.min(lineGross, item.discount_value);
    };

    // Click on Product card
    const handleProductClick = (product: Product) => {
        if (product.is_out_of_stock) return;

        if (product.is_fixed_bundle && Array.isArray(product.fixed_bundle_items)) {
            const discountPct = Number(product.discount_percent ?? 0);
            for (const bItem of product.fixed_bundle_items) {
                if (!bItem.is_preorder) {
                    const existingQtyForVariant = cart
                        .filter((c) => c.product_id === bItem.product_id && c.variant_id === bItem.variant_id)
                        .reduce((sum, c) => sum + c.quantity, 0);
                    if (existingQtyForVariant + bItem.quantity > bItem.stock) {
                        showToast(
                            `Stok ${bItem.product_name} (${bItem.variant_label}) tidak mencukupi (tersisa ${bItem.stock} pcs)`,
                        );
                        return;
                    }
                }
            }

            setCart((prev) => {
                const next = [...prev];
                for (const bItem of product.fixed_bundle_items || []) {
                    const cartItemId = `bundle-${product.id}-${bItem.product_id}-${bItem.variant_id}`;
                    const existingIdx = next.findIndex((c) => c.id === cartItemId);
                    if (existingIdx >= 0) {
                        const existing = next[existingIdx];
                        const newQty = existing.quantity + bItem.quantity;
                        const newDisc = recalculateItemDiscount(existing, newQty);
                        next[existingIdx] = {
                            ...existing,
                            quantity: newQty,
                            discount_amount: newDisc > 0 ? newDisc : undefined,
                        };
                    } else {
                        const baseItem: CartItem = {
                            id: cartItemId,
                            product_id: bItem.product_id,
                            product_name: bItem.product_name,
                            variant_id: bItem.variant_id,
                            variant_label: bItem.variant_label,
                            price: bItem.price,
                            quantity: bItem.quantity,
                            image: bItem.image || product.image,
                            cost_price: bItem.cost_price,
                            notes: `Bundling: ${product.name}`,
                            ...(discountPct > 0
                                ? {
                                      discount_type: 'percent' as const,
                                      discount_value: discountPct,
                                  }
                                : {}),
                        };
                        const disc = recalculateItemDiscount(baseItem, bItem.quantity);
                        if (disc > 0) {
                            baseItem.discount_amount = disc;
                        }
                        next.push(baseItem);
                    }
                }
                return next;
            });

            showToast(`Paket ${product.name} ditambahkan`);
            return;
        }

        // Check if C.Y.B.R / BYOB custom blend product
        if (
            product.slug === 'byob' ||
            product.series === 'cybr' ||
            product.series === 'custom-blend' ||
            product.name.toLowerCase().includes('c.y.b.r')
        ) {
            openCybrStudioModal(product);
            return;
        }

        const vars = Array.isArray(product.variants) ? product.variants : [];
        if (vars.length === 1) {
            addToCart(product, vars[0]);
        } else if (vars.length > 1) {
            // Open variant selection modal
            setVariantPickerProduct(product);
        }
    };

    const updateQuantity = (cartItemId: string, delta: number) => {
        setCart((prev) => {
            return prev
                .map((item) => {
                    if (item.id === cartItemId) {
                        let newQty = item.quantity + delta;
                        if (newQty <= 0) return null;
                        if (delta > 0 && item.product_id && item.variant_id) {
                            const prod = products.find((p) => p.id === item.product_id);
                            const isPre = Boolean(prod?.is_preorder || prod?.stock_status === 'pre_order');
                            const vari = prod?.variants?.find((v) => v.id === item.variant_id) as any;
                            if (!isPre && vari && vari.stock !== undefined && newQty > Number(vari.stock)) {
                                showToast(`Stok maksimal ${item.product_name} (${item.variant_label}) hanya ${vari.stock} pcs`);
                                newQty = Math.max(1, Number(vari.stock));
                            }
                        }
                        const newDisc = recalculateItemDiscount(item, newQty);
                        return {
                            ...item,
                            quantity: newQty,
                            discount_amount: newDisc > 0 ? newDisc : undefined,
                        };
                    }
                    return item;
                })
                .filter(Boolean) as CartItem[];
        });
    };

    const clearCart = () => {
        if (cart.length === 0) return;
        if (confirm('Yakin ingin mengosongkan keranjang kasir?')) {
            setCart([]);
            setCartDiscountValue(0);
            setCustomerName('');
            setCustomerPhone('');
            setIsDeliveryOrder(false);
            setShippingCost('');
            setShippingCourier('');
            setCustomerAddress('');
            clearCartStorage();
        }
    };

    // --- DISCOUNT MODAL HANDLERS ---
    const openCartDiscountModal = () => {
        setTempDiscountType(cartDiscountType);
        setTempDiscountValue(
            cartDiscountValue > 0 ? String(cartDiscountValue) : '',
        );
        setIsCartDiscountModalOpen(true);
    };

    const applyCartDiscount = () => {
        const val = parseFloat(tempDiscountValue) || 0;
        setCartDiscountType(tempDiscountType);
        setCartDiscountValue(Math.max(0, val));
        setIsCartDiscountModalOpen(false);
        showToast(
            val > 0
                ? 'Diskon transaksi berhasil diterapkan'
                : 'Diskon transaksi dihapus',
        );
    };

    const clearCartDiscount = () => {
        setCartDiscountValue(0);
        setTempDiscountValue('');
        setIsCartDiscountModalOpen(false);
        showToast('Diskon transaksi dihapus');
    };

    const openItemDiscountModal = (item: CartItem) => {
        setEditingDiscountItem(item);
        setItemDiscountType(item.discount_type || 'percent');
        setItemDiscountValue(
            item.discount_value ? String(item.discount_value) : '',
        );
    };

    const saveItemDiscount = () => {
        if (!editingDiscountItem) return;
        const val = parseFloat(itemDiscountValue) || 0;
        const lineGross =
            editingDiscountItem.price * editingDiscountItem.quantity;

        let calculatedAmount = 0;
        if (val > 0) {
            if (itemDiscountType === 'percent') {
                const pct = Math.min(100, Math.max(0, val));
                calculatedAmount = Math.round((lineGross * pct) / 100);
            } else {
                calculatedAmount = Math.min(lineGross, Math.max(0, val));
            }
        }

        setCart((prev) =>
            prev.map((it) => {
                if (it.id === editingDiscountItem.id) {
                    if (val <= 0 || calculatedAmount <= 0) {
                        const copy = { ...it };
                        delete copy.discount_type;
                        delete copy.discount_value;
                        delete copy.discount_amount;
                        return copy;
                    }
                    return {
                        ...it,
                        discount_type: itemDiscountType,
                        discount_value: val,
                        discount_amount: calculatedAmount,
                    };
                }
                return it;
            }),
        );

        setEditingDiscountItem(null);
        showToast(
            val > 0
                ? `Diskon produk "${editingDiscountItem.product_name}" disimpan (-Rp ${formatRp(calculatedAmount)})`
                : `Diskon produk "${editingDiscountItem.product_name}" dihapus`,
        );
    };

    const removeItemDiscount = (itemId: string) => {
        setCart((prev) =>
            prev.map((it) => {
                if (it.id === itemId) {
                    const copy = { ...it };
                    delete copy.discount_type;
                    delete copy.discount_value;
                    delete copy.discount_amount;
                    return copy;
                }
                return it;
            }),
        );
        showToast('Diskon produk dihapus');
    };

    const showToast = (msg: string) => {
        setFeedbackMessage(msg);
        setTimeout(() => setFeedbackMessage(null), 3000);
    };

    // Open Checkout Modal
    const openCheckout = () => {
        if (cart.length === 0) return;
        setCashTendered(totalAmount);
        if (paymentMethod === 'cash' && !paymentForm?.enable_cash) {
            if (paymentForm?.enable_qris) setPaymentMethod('qris');
            else if (paymentForm?.enable_debit) setPaymentMethod('debit');
            else if (paymentForm?.enable_bank_transfer)
                setPaymentMethod('bank_transfer');
        }
        setIsCheckoutModalOpen(true);
    };

    // Save transaction in local storage (Offline Mode)
    const saveOfflineTransaction = (payload: any) => {
        const offlineId = `POS-OFF-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;
        const nowIso = new Date().toISOString();
        const paymentLabel =
            paymentMethod === 'cash'
                ? 'Tunai (Offline)'
                : paymentMethod === 'qris'
                  ? 'QRIS (Offline)'
                  : paymentMethod === 'debit'
                    ? 'Debit EDC (Offline)'
                    : 'Transfer Bank (Offline)';

        const newOfflineOrder: OfflineOrder = {
            offline_id: offlineId,
            created_at: nowIso,
            customer_name: customerName.trim() || 'Pelanggan Kasir',
            customer_phone: customerPhone.trim() || null,
            customer_address: isDeliveryOrder ? customerAddress.trim() : null,
            shipping_cost: numericShippingCost,
            shipping_courier:
                isDeliveryOrder && shippingCourier.trim()
                    ? shippingCourier.trim()
                    : null,
            items: cart.map((i) => ({
                product_id: i.product_id,
                variant_id: i.variant_id,
                product_name: i.product_name,
                variant_label: i.variant_label,
                notes: i.notes || null,
                cost_price: i.cost_price ?? null,
                quantity: i.quantity,
                price: i.price,
                discount_type: i.discount_type,
                discount_value: i.discount_value,
                discount_amount: i.discount_amount || 0,
            })),
            payment_method: paymentMethod,
            cash_tendered:
                paymentMethod === 'cash' ? Number(cashTendered) : null,
            cash_change: paymentMethod === 'cash' ? cashChange : undefined,
            discount_amount: discountAmount,
            cart_discount_type: cartDiscountType,
            cart_discount_value: cartDiscountValue,
            subtotal: subtotal,
            total_amount: totalAmount,
            notes: 'Transaksi Offline POS',
        };

        const updated = [newOfflineOrder, ...offlineOrders];
        setOfflineOrders(updated);
        try {
            localStorage.setItem(
                POS_OFFLINE_ORDERS_STORAGE_KEY,
                JSON.stringify(updated),
            );
        } catch (e) {
            console.error('Gagal simpan offline order:', e);
        }

        const receipt: ReceiptData = {
            store_name: printerForm.store_name,
            tagline: printerForm.tagline,
            address: printerForm.address,
            phone: printerForm.phone,
            instagram: printerForm.instagram,
            order_number: offlineId,
            date: new Date().toLocaleString('id-ID'),
            cashier_name: cashier.name,
            customer_name: newOfflineOrder.customer_name,
            customer_phone: newOfflineOrder.customer_phone || '-',
            customer_address: newOfflineOrder.customer_address || undefined,
            shipping_cost: numericShippingCost,
            shipping_courier: newOfflineOrder.shipping_courier || undefined,
            items: cart.map((i) => ({
                product_name: i.product_name,
                variant_label: i.variant_label,
                price: i.price,
                quantity: i.quantity,
                subtotal: i.price * i.quantity - (i.discount_amount || 0),
                discount_amount: i.discount_amount,
            })),
            subtotal: subtotal,
            discount_amount: discountAmount,
            total_amount: totalAmount,
            payment_method_label: paymentLabel,
            cash_tendered:
                paymentMethod === 'cash' ? Number(cashTendered) : undefined,
            cash_change: paymentMethod === 'cash' ? cashChange : undefined,
            footer_note:
                (printerForm.receipt_footer || '') +
                '\n* [MODE OFFLINE - TERSIMPAN DI KASIR] *',
        };

        setCompletedReceipt(receipt);
        setIsCheckoutModalOpen(false);
        setIsReceiptModalOpen(true);

        setRecentOrders((prev) => [
            {
                id: Date.now(),
                order_number: offlineId,
                customer_name: newOfflineOrder.customer_name,
                customer_phone: newOfflineOrder.customer_phone || undefined,
                customer_address: newOfflineOrder.customer_address || undefined,
                shipping_cost: numericShippingCost,
                shipping_courier: newOfflineOrder.shipping_courier || undefined,
                total_amount: totalAmount,
                subtotal: subtotal,
                payment_method: paymentMethod,
                payment_method_label: paymentLabel,
                created_at: 'Offline (Pending Sync)',
                items_count: totalItemsCount,
                items: receipt.items,
            },
            ...prev,
        ]);

        if (paymentMethod === 'cash') {
            setCashDrawer((prev) => ({
                ...prev,
                cash_sales: prev.cash_sales + totalAmount,
                net_cash: prev.net_cash + totalAmount,
            }));
        }

        setCart([]);
        setCartDiscountValue(0);
        setCustomerName('');
        setCustomerPhone('');
        setIsDeliveryOrder(false);
        setShippingCost('');
        setShippingCourier('');
        setCustomerAddress('');
        clearCartStorage();

        if (printerForm.auto_print) {
            if (connectedBtPrinter || getSavedBluetoothPrinter()) {
                handleBluetoothPrint(receipt);
            } else {
                printThermalWeb(receipt, printerForm);
            }
        }

        showToast('Transaksi disimpan di memori kasir (Mode Offline).');
    };

    // Process POS Checkout
    const handleProcessCheckout = async () => {
        if (cart.length === 0 || isSubmitting) return;

        if (paymentMethod === 'cash') {
            const tendered =
                typeof cashTendered === 'number' ? cashTendered : 0;
            if (tendered < totalAmount) {
                alert('Uang tunai yang diterima kurang dari total tagihan!');
                return;
            }
        }

        setIsSubmitting(true);
        try {
            const payload = {
                items: cart.map((i) => ({
                    product_id: i.product_id,
                    variant_id: i.variant_id,
                    product_name: i.product_name,
                    variant_label: i.variant_label,
                    cost_price: i.cost_price ?? null,
                    notes: i.notes || null,
                    is_manual: !!i.is_manual,
                    quantity: i.quantity,
                    price: i.price,
                    discount_type: i.discount_type,
                    discount_value: i.discount_value,
                    discount_amount: i.discount_amount || 0,
                })),
                payment_method: paymentMethod,
                cash_tendered: paymentMethod === 'cash' ? cashTendered : null,
                discount_amount: cartDiscountAmount,
                cart_discount_type: cartDiscountType,
                cart_discount_value: cartDiscountValue,
                customer_name: customerName.trim() || 'Pelanggan Kasir',
                customer_phone: customerPhone.trim() || null,
                customer_address: isDeliveryOrder
                    ? customerAddress.trim()
                    : null,
                shipping_cost: numericShippingCost,
                shipping_courier:
                    isDeliveryOrder && shippingCourier.trim()
                        ? shippingCourier.trim()
                        : null,
            };

            if (isEffectiveOffline) {
                saveOfflineTransaction(payload);
                return;
            }

            try {
                const csrfToken =
                    (
                        document.querySelector(
                            'meta[name="csrf-token"]',
                        ) as HTMLMetaElement
                    )?.content || '';
                const res = await fetch('/pos/checkout', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Accept: 'application/json',
                        'X-CSRF-TOKEN': csrfToken,
                    },
                    body: JSON.stringify(payload),
                });

                const data = await res.json();
                if (!res.ok || !data.success) {
                    throw new Error(
                        data.message || 'Gagal memproses transaksi kasir',
                    );
                }

                // Success! Build receipt
                const receipt: ReceiptData = {
                    store_name: printerForm.store_name,
                    tagline: printerForm.tagline,
                    address: printerForm.address,
                    phone: printerForm.phone,
                    instagram: printerForm.instagram,
                    order_number: data.order.order_number,
                    date: data.order.created_at,
                    cashier_name: cashier.name,
                    customer_name: data.order.customer_name,
                    customer_phone: data.order.customer_phone,
                    customer_address:
                        data.order.customer_address ||
                        (isDeliveryOrder ? customerAddress : undefined),
                    shipping_cost:
                        data.order.shipping_cost ?? numericShippingCost,
                    shipping_courier:
                        data.order.shipping_courier ||
                        (isDeliveryOrder ? shippingCourier : undefined),
                    items: cart.map((i) => ({
                        product_name: i.product_name,
                        variant_label: i.variant_label,
                        price: i.price,
                        quantity: i.quantity,
                        subtotal:
                            i.price * i.quantity - (i.discount_amount || 0),
                        discount_amount: i.discount_amount,
                    })),
                    subtotal: subtotal,
                    discount_amount: discountAmount,
                    total_amount: totalAmount,
                    payment_method_label: data.order.payment_method_label,
                    cash_tendered:
                        paymentMethod === 'cash'
                            ? Number(cashTendered)
                            : undefined,
                    cash_change:
                        paymentMethod === 'cash' ? cashChange : undefined,
                    footer_note: printerForm.receipt_footer,
                };

                setCompletedReceipt(receipt);
                setIsCheckoutModalOpen(false);
                setIsReceiptModalOpen(true);

                // Add to recent orders in UI
                setRecentOrders((prev) => [
                    {
                        id: data.order.id,
                        order_number: data.order.order_number,
                        customer_name: data.order.customer_name,
                        customer_phone: data.order.customer_phone,
                        customer_address: data.order.customer_address,
                        shipping_cost: data.order.shipping_cost,
                        shipping_courier: data.order.shipping_courier,
                        total_amount: totalAmount,
                        subtotal: subtotal,
                        payment_method: paymentMethod,
                        payment_method_label: data.order.payment_method_label,
                        created_at: 'Baru Saja',
                        items_count: totalItemsCount,
                        items: receipt.items,
                    },
                    ...prev,
                ]);

                // Update cash drawer state if cash
                if (paymentMethod === 'cash') {
                    setCashDrawer((prev) => ({
                        ...prev,
                        cash_sales: prev.cash_sales + totalAmount,
                        net_cash: prev.net_cash + totalAmount,
                    }));
                }

                // Clear Cart & Discounts
                setCart([]);
                setCartDiscountValue(0);
                setCustomerName('');
                setCustomerPhone('');
                setIsDeliveryOrder(false);
                setShippingCost('');
                setShippingCourier('');
                setCustomerAddress('');
                clearCartStorage();

                // Deduct local product stock immediately in POS state
                setProducts((prev) => {
                    const updated = prev.map((prod) => {
                        const itemsForProd = cart.filter((c) => c.product_id === prod.id);
                        if (itemsForProd.length === 0) return prod;

                        const updatedVars = (prod.variants || []).map((v) => {
                            const cItem = itemsForProd.find((c) => c.variant_id === v.id);
                            if (!cItem) return v;
                            const newVStock = Math.max(0, (v.stock ?? 0) - cItem.quantity);
                            return {
                                ...v,
                                stock: newVStock,
                                stock_status: newVStock > 0 ? 'in_stock' : 'out_of_stock',
                            };
                        });

                        const newPStock = updatedVars.length > 0
                            ? updatedVars.reduce((acc, v) => acc + (v.stock ?? 0), 0)
                            : Math.max(0, (prod.stock ?? 0) - itemsForProd.reduce((acc, c) => acc + c.quantity, 0));

                        return {
                            ...prod,
                            stock: newPStock,
                            stock_status: newPStock > 0 ? 'in_stock' : 'out_of_stock',
                            is_out_of_stock: newPStock <= 0,
                            variants: updatedVars,
                        };
                    });

                    try {
                        localStorage.setItem(
                            POS_CACHED_CATALOG_STORAGE_KEY,
                            JSON.stringify({
                                products: updated,
                                categories,
                                updated_at: new Date().toISOString(),
                            }),
                        );
                    } catch (e) {}

                    return updated;
                });

                // Auto-print if enabled
                if (printerForm.auto_print) {
                    if (connectedBtPrinter || getSavedBluetoothPrinter()) {
                        handleBluetoothPrint(receipt);
                    } else {
                        printThermalWeb(receipt, printerForm);
                    }
                }
            } catch (netErr: any) {
                // If offline / network error, fallback automatically to offline mode
                if (
                    !navigator.onLine ||
                    !isOnline ||
                    netErr.message?.includes('fetch') ||
                    netErr.message?.includes('Failed to fetch') ||
                    netErr.message?.includes('NetworkError')
                ) {
                    console.warn(
                        'Network issue during checkout, falling back to offline storage:',
                        netErr,
                    );
                    saveOfflineTransaction(payload);
                    return;
                }
                throw netErr;
            }
        } catch (err: any) {
            alert('Terjadi kesalahan: ' + err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Synchronize offline orders batch to server (Auto-Sync & Manual Upload)
    const syncOfflineOrdersToServer = async (manualTrigger = false) => {
        if (offlineOrders.length === 0) {
            if (manualTrigger)
                showToast('Semua transaksi offline sudah tersinkronkan.');
            return;
        }
        if (!navigator.onLine && !manualTrigger) return;

        setIsSyncing(true);
        setSyncStatusMessage(
            `Mengunggah ${offlineOrders.length} transaksi offline ke server...`,
        );
        try {
            const csrfToken =
                (
                    document.querySelector(
                        'meta[name="csrf-token"]',
                    ) as HTMLMetaElement
                )?.content || '';
            const res = await fetch('/pos/sync-offline-orders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                },
                body: JSON.stringify({
                    orders: offlineOrders,
                }),
            });

            const data = await res.json();
            if (!res.ok || !data.success) {
                throw new Error(
                    data.message || 'Gagal menyinkronkan transaksi offline',
                );
            }

            const count = offlineOrders.length;
            setOfflineOrders([]);
            localStorage.removeItem(POS_OFFLINE_ORDERS_STORAGE_KEY);
            setSyncStatusMessage(
                `Berhasil menyinkronkan ${count} transaksi ke database server.`,
            );
            showToast(
                `Berhasil! ${count} transaksi offline telah disinkronkan ke database server.`,
            );
        } catch (err: any) {
            console.error('Sync offline orders error:', err);
            setSyncStatusMessage('Gagal sinkronisasi: ' + err.message);
            if (manualTrigger) {
                alert('Gagal menyinkronkan data ke server: ' + err.message);
            }
        } finally {
            setIsSyncing(false);
        }
    };

    // Auto-sync when online and there are offline orders
    useEffect(() => {
        if (
            isOnline &&
            !manualOffline &&
            offlineOrders.length > 0 &&
            !isSyncing
        ) {
            const timer = setTimeout(() => {
                syncOfflineOrdersToServer();
            }, 1200);
            return () => clearTimeout(timer);
        }
    }, [isOnline, manualOffline, offlineOrders.length, isSyncing]);

    // Periodic auto-sync check every 25 seconds when online
    useEffect(() => {
        if (typeof window === 'undefined') return;
        const interval = setInterval(() => {
            if (
                navigator.onLine &&
                !manualOffline &&
                offlineOrders.length > 0 &&
                !isSyncing
            ) {
                syncOfflineOrdersToServer();
            }
        }, 25000);
        return () => clearInterval(interval);
    }, [manualOffline, offlineOrders.length, isSyncing]);

    // Pull catalog data from server (Tombol Download Data)
    const pullLatestCatalogData = async (downloadFile = false) => {
        setIsDownloadingCatalog(true);
        try {
            if (downloadFile) {
                window.location.href = '/pos/catalog?download=1';
                showToast('Mengunduh berkas backup katalog JSON...');
                return;
            }

            const res = await fetch('/pos/catalog');
            const data = await res.json();
            if (!res.ok || !data.success) {
                throw new Error(data.message || 'Gagal menarik katalog');
            }

            const normalizedProducts = Array.isArray(data.products)
                ? data.products.map(normalizePosProduct)
                : [];
            if (normalizedProducts.length > 0) {
                setProducts(normalizedProducts);
            }
            if (Array.isArray(data.categories) && data.categories.length > 0) {
                setCategories(data.categories);
            }

            const nowIso = new Date().toISOString();
            setLastCatalogSync(nowIso);
            localStorage.setItem(
                POS_CACHED_CATALOG_STORAGE_KEY,
                JSON.stringify({
                    products: normalizedProducts,
                    categories: data.categories,
                    updated_at: nowIso,
                }),
            );

            precacheProductImages(normalizedProducts);

            showToast(
                `Berhasil menarik ${data.products?.length || 0} produk dari database dan menyimpan gambar ke cache offline.`,
            );
        } catch (err: any) {
            console.error('Gagal menarik katalog:', err);
            alert('Gagal menarik data dari server: ' + err.message);
        } finally {
            setIsDownloadingCatalog(false);
        }
    };

    // Auto-refresh catalog when navigating to inventory tab
    useEffect(() => {
        if (activeTab === 'inventory') {
            pullLatestCatalogData(false);
        }
    }, [activeTab]);

    // Export offline orders to JSON file
    const exportOfflineOrdersToFile = () => {
        if (offlineOrders.length === 0) {
            alert('Belum ada transaksi offline yang tersimpan.');
            return;
        }
        const filename = `sanubari_pos_penjualan_offline_${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
        const jsonStr = JSON.stringify(
            {
                exported_at: new Date().toISOString(),
                source: 'sanubari_pos_offline',
                cashier: cashier.name,
                orders_count: offlineOrders.length,
                orders: offlineOrders,
            },
            null,
            2,
        );
        const blob = new Blob([jsonStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        showToast(
            `File backup penjualan (${offlineOrders.length} transaksi) berhasil diunduh.`,
        );
    };

    // Upload & import JSON file to server (Tombol Import Penjualan)
    const handleImportOrdersFile = async (
        e: React.ChangeEvent<HTMLInputElement>,
    ) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        setIsSyncing(true);
        setSyncStatusMessage(
            'Sedang mengimpor berkas penjualan ke database...',
        );
        try {
            const csrfToken =
                (
                    document.querySelector(
                        'meta[name="csrf-token"]',
                    ) as HTMLMetaElement
                )?.content || '';
            const res = await fetch('/pos/import-orders', {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                },
                body: formData,
            });

            const data = await res.json();
            if (!res.ok || !data.success) {
                throw new Error(
                    data.message || 'Gagal mengimpor file penjualan.',
                );
            }

            showToast(
                data.message || 'Data penjualan berhasil diimpor ke database!',
            );
            setSyncStatusMessage(data.message);
        } catch (err: any) {
            console.error('Import error:', err);
            alert('Gagal mengimpor file penjualan: ' + err.message);
        } finally {
            setIsSyncing(false);
            e.target.value = '';
        }
    };

    // Sinkronisasi data & Reload aplikasi POS
    const handleSyncAndReload = async () => {
        setIsReloadingApp(true);
        showToast('Menyinkronkan data & memuat ulang aplikasi...');
        try {
            if (navigator.onLine && offlineOrders.length > 0) {
                await syncOfflineOrdersToServer(false);
            }
        } catch (err) {
            console.error('Sinkronisasi sebelum reload gagal:', err);
        }
        setTimeout(() => {
            window.location.reload();
        }, 350);
    };

    // =========================================================================
    // USB & WINDOWS POS PRINTER MANAGER (WINDOWS DESKTOP & WEBUSB)
    // =========================================================================
    const [connectedUsbPrinter, setConnectedUsbPrinter] = useState<UsbPrinterDevice | null>(() => getSavedUsbPrinter());
    const [availableWindowsPrinters, setAvailableWindowsPrinters] = useState<WindowsPrinterItem[]>([]);
    const [isLoadingWindowsPrinters, setIsLoadingWindowsPrinters] = useState(false);
    const [isUsbConnecting, setIsUsbConnecting] = useState(false);
    const [isUsbTesting, setIsUsbTesting] = useState(false);

    const refreshWindowsPrinters = async () => {
        setIsLoadingWindowsPrinters(true);
        try {
            const list = await getAvailableWindowsPrinters();
            setAvailableWindowsPrinters(list);
            if (list.length > 0) {
                setPrinterForm((prev) => {
                    if (prev.printer_name && list.some((p) => p.name.toLowerCase() === prev.printer_name?.toLowerCase())) {
                        return prev;
                    }
                    const def = list.find((p) => p.isDefault) || list[0];
                    return {
                        ...prev,
                        printer_name: def?.name || prev.printer_name,
                        usb_printer_name: def?.name || prev.usb_printer_name,
                    };
                });
            }
        } catch (err) {
            console.warn('Gagal memuat printer Windows:', err);
        } finally {
            setIsLoadingWindowsPrinters(false);
        }
    };

    useEffect(() => {
        if (isElectronDesktop()) {
            refreshWindowsPrinters();
        }
        reconnectSavedUsbPrinter().then((ok) => {
            if (ok) {
                setConnectedUsbPrinter(getSavedUsbPrinter());
            }
        });
    }, []);

    const handleConnectUsbPrinter = async () => {
        setIsUsbConnecting(true);
        try {
            const device = await scanAndConnectUsbPrinter();
            if (device) {
                setConnectedUsbPrinter(device);
                setPrinterForm((prev) => ({
                    ...prev,
                    connection_type: 'usb_direct',
                    usb_device_name: device.name,
                    usb_vendor_id: device.vendorId,
                    usb_product_id: device.productId,
                    usb_serial_number: device.serialNumber,
                    printer_name: device.name,
                }));
                showToast(`✓ Printer USB terhubung: ${device.name}`);
            }
        } catch (err: any) {
            showToast(`Gagal menyambungkan USB: ${err.message || 'Dibatalkan'}`);
        } finally {
            setIsUsbConnecting(false);
        }
    };

    const handleDisconnectUsbPrinter = () => {
        disconnectUsbPrinter();
        setConnectedUsbPrinter(null);
        setPrinterForm((prev) => ({
            ...prev,
            connection_type: 'system',
            usb_device_name: '',
        }));
        showToast('Koneksi printer USB diputuskan.');
    };

    // =========================================================================
    // BLUETOOTH PRINTER SCANNER & CONNECTION MANAGER (ANDROID APK & WEB BT)
    // =========================================================================
    const [isBtScannerModalOpen, setIsBtScannerModalOpen] = useState(false);
    const [btDevices, setBtDevices] = useState<BluetoothPrinterDevice[]>([]);
    const [connectedBtPrinter, setConnectedBtPrinter] =
        useState<BluetoothPrinterDevice | null>(() => getSavedBluetoothPrinter());
    const [isBtScanning, setIsBtScanning] = useState(false);
    const [connectingBtAddress, setConnectingBtAddress] = useState<string | null>(null);
    const [isBtPrinting, setIsBtPrinting] = useState(false);
    const [pendingBtReceipt, setPendingBtReceipt] = useState<ReceiptData | null>(null);
    const [btStatusMessage, setBtStatusMessage] = useState<string | null>(null);

    const refreshNativeBtDevices = () => {
        if (!isAndroidNativeBluetoothAvailable()) return;
        const list = getAndroidBluetoothDevices();
        setBtDevices(list);
        const saved = getSavedBluetoothPrinter();
        if (saved) {
            setConnectedBtPrinter(saved);
        }
    };

    useEffect(() => {
        const saved = getSavedBluetoothPrinter();
        if (saved) {
            setConnectedBtPrinter(saved);
        }

        const onDeviceFound = (e: Event) => {
            const detail = (e as CustomEvent).detail as BluetoothPrinterDevice;
            if (!detail || !detail.address) return;
            setBtDevices((prev) => {
                const existsIdx = prev.findIndex(
                    (d) => d.address.toLowerCase() === detail.address.toLowerCase(),
                );
                let next: BluetoothPrinterDevice[];
                if (existsIdx >= 0) {
                    next = [...prev];
                    next[existsIdx] = { ...next[existsIdx], ...detail };
                } else {
                    next = [...prev, detail];
                }
                return next.sort((a, b) => {
                    if (a.connected && !b.connected) return -1;
                    if (!a.connected && b.connected) return 1;
                    if (a.isPrinter && !b.isPrinter) return -1;
                    if (!a.isPrinter && b.isPrinter) return 1;
                    if (a.bonded && !b.bonded) return -1;
                    if (!a.bonded && b.bonded) return 1;
                    return (a.name || '').localeCompare(b.name || '');
                });
            });
        };

        const onDiscoveryState = (e: Event) => {
            const detail = (e as CustomEvent).detail;
            setIsBtScanning(Boolean(detail?.discovering));
        };

        const onBondChanged = () => {
            refreshNativeBtDevices();
        };

        const onPermissionChanged = (e: Event) => {
            const detail = (e as CustomEvent).detail;
            if (detail?.granted) {
                refreshNativeBtDevices();
                startAndroidBluetoothScan();
            }
        };

        window.addEventListener('sanubari-bt-device-found', onDeviceFound);
        window.addEventListener('sanubari-bt-discovery-state', onDiscoveryState);
        window.addEventListener('sanubari-bt-bond-changed', onBondChanged);
        window.addEventListener('sanubari-bt-permission-changed', onPermissionChanged);

        return () => {
            window.removeEventListener('sanubari-bt-device-found', onDeviceFound);
            window.removeEventListener('sanubari-bt-discovery-state', onDiscoveryState);
            window.removeEventListener('sanubari-bt-bond-changed', onBondChanged);
            window.removeEventListener('sanubari-bt-permission-changed', onPermissionChanged);
        };
    }, []);

    const openBluetoothScannerModal = (receiptToPrint?: ReceiptData | null) => {
        setPendingBtReceipt(receiptToPrint || null);
        setBtStatusMessage(null);
        setIsBtScannerModalOpen(true);

        if (isAndroidNativeBluetoothAvailable()) {
            refreshNativeBtDevices();
            setIsBtScanning(true);
            startAndroidBluetoothScan();
        }
    };

    const closeBluetoothScannerModal = () => {
        if (isAndroidNativeBluetoothAvailable()) {
            stopAndroidBluetoothScan();
        }
        setIsBtScanning(false);
        setIsBtScannerModalOpen(false);
    };

    const handleStartBtScan = async () => {
        setBtStatusMessage(null);
        if (isAndroidNativeBluetoothAvailable()) {
            refreshNativeBtDevices();
            setIsBtScanning(true);
            startAndroidBluetoothScan();
            return;
        }

        if (isWebBluetoothAvailable()) {
            try {
                setIsBtScanning(true);
                setBtStatusMessage('Membuka pemindai Bluetooth browser...');
                const dev = await scanAndConnectWebBluetoothPrinter();
                setIsBtScanning(false);
                if (dev) {
                    setConnectedBtPrinter(dev);
                    setBtDevices((prev) => {
                        const filtered = prev.filter((d) => d.address !== dev.address);
                        return [dev, ...filtered];
                    });
                    setBtStatusMessage(`✓ Terhubung ke ${dev.name}`);
                    showToast(`✓ Printer Bluetooth terhubung: ${dev.name}`);
                    if (pendingBtReceipt) {
                        const receipt = pendingBtReceipt;
                        setPendingBtReceipt(null);
                        await executeDirectBtPrint(receipt, dev.address);
                        setIsBtScannerModalOpen(false);
                    }
                } else {
                    setBtStatusMessage('Pemindaian dibatalkan.');
                }
            } catch (err: any) {
                setIsBtScanning(false);
                setBtStatusMessage('Gagal menghubungkan Bluetooth: ' + (err?.message || 'Error'));
            }
        }
    };

    const executeDirectBtPrint = async (receipt: ReceiptData, targetAddr?: string) => {
        setIsBtPrinting(true);
        try {
            showToast('Mencetak struk ke printer Bluetooth...');
            const success = await printThermalBluetooth(receipt, printerForm, targetAddr);
            if (success) {
                showToast('✓ Struk berhasil dicetak ke printer Bluetooth!');
                return true;
            }
            return false;
        } finally {
            setIsBtPrinting(false);
        }
    };

    const handleConnectAndroidBtDevice = async (device: BluetoothPrinterDevice) => {
        setConnectingBtAddress(device.address);
        setBtStatusMessage(`Menghubungkan ke ${device.name}...`);
        try {
            const res = await connectAndroidBluetoothPrinter(device.address);
            setConnectingBtAddress(null);
            if (res.success) {
                const connectedDev: BluetoothPrinterDevice = {
                    ...device,
                    name: res.name || device.name,
                    address: res.address || device.address,
                    bonded: true,
                    connected: true,
                    source: 'android-native',
                };
                setConnectedBtPrinter(connectedDev);
                setBtDevices((prev) =>
                    prev.map((d) => ({
                        ...d,
                        connected: d.address.toLowerCase() === connectedDev.address.toLowerCase(),
                        bonded:
                            d.address.toLowerCase() === connectedDev.address.toLowerCase()
                                ? true
                                : d.bonded,
                    })),
                );
                setBtStatusMessage(`✓ Terhubung ke ${connectedDev.name}`);
                showToast(`✓ Terhubung ke printer ${connectedDev.name}`);

                if (pendingBtReceipt) {
                    const receipt = pendingBtReceipt;
                    setPendingBtReceipt(null);
                    try {
                        await executeDirectBtPrint(receipt, connectedDev.address);
                        closeBluetoothScannerModal();
                    } catch (printErr: any) {
                        setBtStatusMessage('Terhubung, namun gagal mencetak: ' + printErr.message);
                    }
                }
            } else {
                setBtStatusMessage(res.message);
            }
        } catch (err: any) {
            setConnectingBtAddress(null);
            setBtStatusMessage(err?.message || 'Gagal menghubungkan ke perangkat Bluetooth.');
        }
    };

    const handleDisconnectBtPrinter = () => {
        disconnectBluetoothPrinter();
        setConnectedBtPrinter(null);
        setBtDevices((prev) => prev.map((d) => ({ ...d, connected: false })));
        setBtStatusMessage('Koneksi printer Bluetooth telah diputuskan.');
        showToast('Koneksi printer Bluetooth diputuskan.');
    };

    // Bluetooth ESC/POS print handler
    const handleBluetoothPrint = async (receipt: ReceiptData) => {
        // 1. Native Android POS APK Mode
        if (isAndroidNativeBluetoothAvailable()) {
            const saved = connectedBtPrinter || getSavedBluetoothPrinter();
            if (!saved || !saved.address) {
                openBluetoothScannerModal(receipt);
                return;
            }

            try {
                await executeDirectBtPrint(receipt, saved.address);
            } catch (err: any) {
                setBtStatusMessage(err?.message || 'Koneksi printer terputus. Silakan pilih/hubungkan ulang printer.');
                openBluetoothScannerModal(receipt);
            }
            return;
        }

        // 2. Web Bluetooth Mode (Chrome Android / Desktop)
        if (isWebBluetoothAvailable()) {
            if (connectedBtPrinter && connectedBtPrinter.source === 'web-bluetooth') {
                try {
                    const ok = await executeDirectBtPrint(receipt);
                    if (ok) return;
                } catch {
                    // Fall back to opening modal
                }
            }
            openBluetoothScannerModal(receipt);
            return;
        }

        // 3. Fallback Mode (WebView without native bridge yet): open in-app Bluetooth manager modal
        openBluetoothScannerModal(receipt);
    };

    // Buat data sampel struk untuk pratinjau live di aplikasi POS
    const getSampleTestReceipt = (): ReceiptData => {
        return {
            store_name: printerForm.store_name || 'Alat Kopi Malang',
            tagline: printerForm.tagline || 'Close to Your Every Brew',
            address:
                printerForm.address ||
                'Ruko Tlogomas Square Kav 34, Jl. Raya Tlogomas, Lowokwaru, Malang',
            phone: printerForm.phone || '+6282132095241',
            instagram: printerForm.instagram || '@sanubariroastery',
            order_number:
                'TEST-' + (printerForm.paper_width === '80mm' ? '80' : '58'),
            date:
                new Date().toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                }) +
                ' ' +
                new Date().toLocaleTimeString('id-ID', {
                    hour: '2-digit',
                    minute: '2-digit',
                }),
            cashier_name: cashier.name,
            customer_name: 'Pelanggan Kasir',
            items: [
                {
                    product_name: 'Flores Bajawa Washed Medium Dark',
                    variant_label: '200g - Biji Kopi',
                    price: 75000,
                    quantity: 1,
                    subtotal: 75000,
                },
                {
                    product_name: 'Drip Bag Coffee Blend Series',
                    variant_label: 'Box isi 5',
                    price: 45000,
                    quantity: 2,
                    subtotal: 90000,
                },
            ],
            subtotal: 165000,
            discount_amount: 15000,
            total_amount: 150000,
            payment_method_label: 'QRIS Kasir',
            cash_tendered: 0,
            cash_change: 0,
            footer_note:
                printerForm.receipt_footer ||
                'Terima kasih atas kunjungannya!\nFreshly Roasted with Heart.',
        };
    };

    // Buka Pratinjau Struk langsung di aplikasi POS (Bukan dari Chrome)
    const handlePreviewReceipt = (receiptToPreview?: ReceiptData) => {
        setCompletedReceipt(receiptToPreview || getSampleTestReceipt());
        setIsReceiptModalOpen(true);
    };

    // Jalankan Test Print thermal printer ke hardware fisik
    const handleRunTestPrint = async (method: 'web' | 'bluetooth' | 'usb_direct' = 'web') => {
        const testReceipt = getSampleTestReceipt();

        if (method === 'usb_direct') {
            setIsUsbTesting(true);
            try {
                const ok = await printThermalUsbDirect(testReceipt, printerForm);
                if (ok) {
                    showToast('✓ Tes cetak berhasil dikirim langsung ke printer USB!');
                }
            } catch (err: any) {
                showToast(`Gagal tes cetak USB: ${err.message || 'Error'}`);
            } finally {
                setIsUsbTesting(false);
            }
        } else if (method === 'web') {
            printThermalWeb(testReceipt, printerForm);
            showToast(`Mengirim tes cetak ke printer Windows: ${printerForm.printer_name || 'Default'}`);
        } else {
            handleBluetoothPrint(testReceipt);
        }
    };

    // Reset pengaturan printer ke default perangkat ini
    const handleResetPrinterDefaults = () => {
        if (
            confirm(
                'Kembalikan konfigurasi printer dan margin struk pada perangkat ini ke pengaturan standar (default)?',
            )
        ) {
            try {
                if (typeof window !== 'undefined' && window.localStorage) {
                    window.localStorage.removeItem(POS_DEVICE_PRINTER_STORAGE_KEY);
                }
            } catch (e) {}

            const baseSettings: PrinterSettings = {
                ...defaultPrinterSettings,
                ...(initialPrinterSettings || initialSettings?.printer),
            };
            setPrinterForm(baseSettings);
            showToast('Pengaturan printer pada perangkat ini dikembalikan ke default.');
        }
    };

    // Save Printer Settings (Disimpan khusus pada device/browser staf ini agar tidak saling menimpa antar kasir)
    const handleSavePrinterSettings = async () => {
        setIsSavingSettings(true);
        try {
            // 1. Simpan langsung ke localStorage device staf ini
            if (typeof window !== 'undefined' && window.localStorage) {
                window.localStorage.setItem(
                    POS_DEVICE_PRINTER_STORAGE_KEY,
                    JSON.stringify(printerForm),
                );
            }
            showToast('Pengaturan printer berhasil disimpan khusus untuk perangkat ini.');
        } catch (err: any) {
            alert('Error menyimpan pengaturan printer: ' + err.message);
        } finally {
            setIsSavingSettings(false);
        }
    };

    // Save Payment Settings
    const handleSavePaymentSettings = async () => {
        setIsSavingSettings(true);
        try {
            const csrfToken =
                (
                    document.querySelector(
                        'meta[name="csrf-token"]',
                    ) as HTMLMetaElement
                )?.content || '';
            const res = await fetch('/pos/settings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                },
                body: JSON.stringify({
                    type: 'payment',
                    settings: paymentForm,
                }),
            });
            const data = await res.json();
            if (!res.ok)
                throw new Error(
                    data.message || 'Gagal menyimpan pengaturan pembayaran',
                );
            showToast('Pengaturan pembayaran berhasil disimpan');
        } catch (err: any) {
            alert('Error: ' + err.message);
        } finally {
            setIsSavingSettings(false);
        }
    };

    // Add new staff member (Owner / Admin only)
    const handleCreateStaff = async (e: React.FormEvent) => {
        e.preventDefault();
        setStaffFormError(null);

        if (!staffName.trim()) {
            setStaffFormError('Nama lengkap staf wajib diisi.');
            return;
        }
        if (!staffEmail.trim()) {
            setStaffFormError('Email login staf wajib diisi.');
            return;
        }
        if (!staffPassword || staffPassword.length < 6) {
            setStaffFormError('Password minimal 6 karakter.');
            return;
        }
        if (staffPassword !== staffPasswordConfirm) {
            setStaffFormError('Konfirmasi password tidak cocok.');
            return;
        }

        setIsAddingStaff(true);
        try {
            const csrfToken =
                (
                    document.querySelector(
                        'meta[name="csrf-token"]',
                    ) as HTMLMetaElement
                )?.content || '';
            const res = await fetch('/pos/staff', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                },
                body: JSON.stringify({
                    name: staffName.trim(),
                    email: staffEmail.trim(),
                    password: staffPassword,
                    role: staffRole,
                    phone: staffPhone.trim() || null,
                }),
            });

            const data = await res.json();
            if (!res.ok || !data.success) {
                throw new Error(data.message || 'Gagal menambahkan staf');
            }

            // Successfully added
            setStaff((prev) => [data.staff, ...prev]);
            setStaffName('');
            setStaffEmail('');
            setStaffPassword('');
            setStaffPasswordConfirm('');
            setStaffPhone('');
            setStaffRole('kasir');
            showToast(
                `Staf baru "${data.staff.name}" (${data.staff.role}) berhasil ditambahkan!`,
            );
        } catch (err: any) {
            setStaffFormError(
                err.message || 'Terjadi kesalahan saat menambahkan staf',
            );
        } finally {
            setIsAddingStaff(false);
        }
    };

    // Remove staff member (Owner / Admin only)
    const handleDeleteStaff = async (member: PosStaffMember) => {
        if (member.id === cashier.id) {
            alert('Anda tidak dapat menghapus akun Anda sendiri.');
            return;
        }
        if (member.id === 1) {
            alert('Akun Super Admin utama tidak dapat dihapus.');
            return;
        }
        if (
            !confirm(
                `Hapus akses staf "${member.name}" (${member.email})? Akun ini tidak akan dapat login ke POS lagi.`,
            )
        ) {
            return;
        }

        setDeletingStaffId(member.id);
        try {
            const csrfToken =
                (
                    document.querySelector(
                        'meta[name="csrf-token"]',
                    ) as HTMLMetaElement
                )?.content || '';
            const res = await fetch(`/pos/staff/${member.id}`, {
                method: 'DELETE',
                headers: {
                    Accept: 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                },
            });

            const data = await res.json();
            if (!res.ok || !data.success) {
                throw new Error(data.message || 'Gagal menghapus staf');
            }

            setStaff((prev) => prev.filter((s) => s.id !== member.id));
            showToast(`Akses staf "${member.name}" berhasil dihapus.`);
        } catch (err: any) {
            alert('Gagal menghapus staf: ' + err.message);
        } finally {
            setDeletingStaffId(null);
        }
    };

    // Submit Cash Flow Record
    const handleAddCashFlow = async (e: React.FormEvent) => {
        e.preventDefault();
        const amt = Number(flowAmount) || 0;
        if (amt <= 0 || !flowDescription.trim()) {
            alert('Mohon isi nominal dan keterangan dengan benar');
            return;
        }

        setIsSavingCashFlow(true);
        try {
            const csrfToken =
                (
                    document.querySelector(
                        'meta[name="csrf-token"]',
                    ) as HTMLMetaElement
                )?.content || '';
            const res = await fetch('/pos/cash-flows', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                },
                body: JSON.stringify({
                    type: flowType,
                    category: flowCategory,
                    amount: amt,
                    description: flowDescription.trim(),
                    date: flowTransactionDate,
                }),
            });
            const data = await res.json();
            if (!res.ok || !data.success)
                throw new Error(data.message || 'Gagal mencatat arus kas');

            showToast('Catatan arus kas berhasil disimpan!');
            setFlowAmount('');
            setFlowDescription('');

            if (data.cash_drawer || data.summary) {
                setCashDrawer(data.cash_drawer || data.summary);
            }

            fetchCashFlows(cashFlowPeriod, cashFlowDate, cashFlowMonth);
        } catch (err: any) {
            alert('Gagal: ' + err.message);
        } finally {
            setIsSavingCashFlow(false);
        }
    };

    // Delete Cash Flow Record
    const handleDeleteCashFlow = async (id: number) => {
        if (!confirm('Hapus catatan arus kas ini?')) return;
        try {
            const csrfToken =
                (
                    document.querySelector(
                        'meta[name="csrf-token"]',
                    ) as HTMLMetaElement
                )?.content || '';
            const res = await fetch(`/pos/cash-flows/${id}`, {
                method: 'DELETE',
                headers: {
                    Accept: 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                },
            });
            const data = await res.json();
            if (!res.ok || !data.success)
                throw new Error(data.message || 'Gagal menghapus catatan');
            showToast('Catatan berhasil dihapus');
            if (data.cash_drawer || data.summary) {
                setCashDrawer(data.cash_drawer || data.summary);
            }
            fetchCashFlows(cashFlowPeriod, cashFlowDate);
        } catch (err: any) {
            alert('Gagal menghapus: ' + err.message);
        }
    };

    // Print Sales Report to Thermal Printer
    const handlePrintSalesReport = () => {
        if (!reportData) return;
        const rep: SalesReportData = {
            store_name: printerForm.store_name,
            period_title: reportData.period_title || 'Laporan Penjualan',
            printed_at: new Date().toLocaleString('id-ID'),
            cashier_name: reportData.active_staff_name || cashier.name,
            total_revenue: reportData.total_revenue || 0,
            total_transactions: reportData.total_transactions || 0,
            average_order_value: reportData.average_order_value || 0,
            payment_breakdown: reportData.payment_breakdown || [],
            cash_drawer: reportData.cash_drawer || {
                cash_sales: 0,
                cash_in: 0,
                cash_out: 0,
                net_cash: 0,
            },
            top_products: reportData.top_products || [],
        };
        printSalesReportThermalWeb(rep, printerForm.paper_width);
    };

    // --- MANUAL / CUSTOM ORDER HANDLERS ---
    const openManualOrderModal = (itemToEdit?: CartItem) => {
        if (itemToEdit) {
            setEditingManualCartItemId(itemToEdit.id);
            setManualProductName(itemToEdit.product_name);
            setManualCostPrice(itemToEdit.cost_price ?? '');
            setManualPrice(itemToEdit.price);
            setManualQuantity(itemToEdit.quantity);
            setManualVariantLabel(itemToEdit.variant_label || 'Manual');
            setManualNotes('');
        } else {
            setEditingManualCartItemId(null);
            setManualProductName('');
            setManualCostPrice('');
            setManualPrice('');
            setManualQuantity(1);
            setManualVariantLabel('Manual');
            setManualNotes('');
        }
        setIsManualOrderModalOpen(true);
    };

    const handleSaveManualItem = (e?: React.FormEvent, payDirectly = false) => {
        if (e) e.preventDefault();
        const trimmedName = manualProductName.trim();
        if (!trimmedName) {
            alert('Mohon masukkan nama produk');
            return;
        }

        const sellingPrice = Number(manualPrice) || 0;
        const hpp = Number(manualCostPrice) || 0;
        const qty = Math.max(1, Number(manualQuantity) || 1);

        if (sellingPrice < 0) {
            alert('Harga jual produk tidak boleh negatif');
            return;
        }

        if (editingManualCartItemId) {
            // Update existing cart item
            setCart((prev) =>
                prev.map((it) => {
                    if (it.id === editingManualCartItemId) {
                        return {
                            ...it,
                            product_name: trimmedName,
                            variant_label:
                                manualVariantLabel.trim() || 'Manual',
                            price: sellingPrice,
                            cost_price: hpp,
                            quantity: qty,
                        };
                    }
                    return it;
                }),
            );
            showToast(`Item manual "${trimmedName}" berhasil diperbarui!`);
        } else {
            // Add new cart item
            const newCartItem: CartItem = {
                id: `manual-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
                product_id: 0,
                variant_id: 0,
                product_name: trimmedName,
                variant_label: manualVariantLabel.trim() || 'Manual',
                price: sellingPrice,
                cost_price: hpp,
                quantity: qty,
                image: '/images/products/manual-order.svg',
                is_manual: true,
            };

            setCart((prev) => [...prev, newCartItem]);
            showToast(
                `Item manual "${trimmedName}" berhasil dimasukkan ke keranjang!`,
            );
        }

        setIsManualOrderModalOpen(false);

        if (payDirectly) {
            setTimeout(() => {
                openCheckout();
            }, 100);
        }
    };

    // --- KALKULATOR CUSTOM HARGA 1 KG (5X 200 GR) & 500 GR (5X 100 GR) HANDLERS ---
    const getVariantBaseData = (product: Product, targetMode: '1000g' | '500g') => {
        const baseWeight = targetMode === '1000g' ? 200 : 100;
        const baseRegex = targetMode === '1000g' ? /200\s*(g|gr|gram)?/i : /100\s*(g|gr|gram)?/i;

        const vBase = product.variants?.find(
            (v) => v.weight_grams === baseWeight || baseRegex.test(v.label)
        );

        let priceBase: number | string = '';
        let costBase: number | string = '';

        if (vBase) {
            priceBase = vBase.price || '';
            if (vBase.cost_price && Number(vBase.cost_price) > 0) {
                costBase = Number(vBase.cost_price);
            }
        }

        // Fallback for price if exact base variant not found
        if (!priceBase && product.variants && product.variants.length > 0) {
            const otherWithWeight = product.variants.find((v) => v.weight_grams > 0 && v.price > 0);
            if (otherWithWeight) {
                priceBase = Math.round((otherWithWeight.price / otherWithWeight.weight_grams) * baseWeight);
            } else {
                priceBase = product.variants[0].price;
            }
        }

        // If costBase still not found, check other variants with weight_grams
        if (!costBase && product.variants && product.variants.length > 0) {
            for (const v of product.variants) {
                if (v.cost_price && Number(v.cost_price) > 0 && v.weight_grams > 0) {
                    costBase = Math.round((Number(v.cost_price) / v.weight_grams) * baseWeight);
                    break;
                }
            }
        }

        // Check cost_price_per_10g on product
        if (!costBase && (product as any).cost_price_per_10g && Number((product as any).cost_price_per_10g) > 0) {
            costBase = Math.round(Number((product as any).cost_price_per_10g) * (baseWeight / 10));
        }

        return { vBase, priceBase, costBase, baseWeight };
    };

    const openKgCalculatorModal = (product?: Product, initialMode: '1000g' | '500g' = '1000g') => {
        setCalcTargetMode(initialMode);
        if (product) {
            setKgSelectedProductId(product.id);
            setKgCustomProductName(product.name);
            const { priceBase, costBase } = getVariantBaseData(product, initialMode);
            setKgPrice200g(priceBase);
            setKgCostPrice200g(costBase);
        } else {
            setKgSelectedProductId('custom');
            setKgCustomProductName('');
            setKgPrice200g('');
            setKgCostPrice200g('');
        }
        setKgMultiplier(5);
        setKgDiscountType('none');
        setKgDiscountValue('');
        setIsKgCustomPriceOverridden(false);
        setKgCustomFinalPrice('');
        setKgQuantity(1);
        setKgNotes('');
        setIsKgCalculatorOpen(true);
    };

    const switchCalcMode = (newMode: '1000g' | '500g') => {
        setCalcTargetMode(newMode);
        setIsKgCustomPriceOverridden(false);
        setKgCustomFinalPrice('');
        if (kgSelectedProductId !== 'custom') {
            const p = products.find((prod) => prod.id === kgSelectedProductId);
            if (p) {
                const { priceBase, costBase } = getVariantBaseData(p, newMode);
                setKgPrice200g(priceBase);
                setKgCostPrice200g(costBase);
            }
        }
    };

    const handleSelectProductInKgCalc = (productId: number | 'custom') => {
        setKgSelectedProductId(productId);
        setIsKgCustomPriceOverridden(false);
        setKgCustomFinalPrice('');
        if (productId === 'custom') {
            setKgCustomProductName('');
            setKgPrice200g('');
            setKgCostPrice200g('');
        } else {
            const p = products.find((prod) => prod.id === productId);
            if (p) {
                setKgCustomProductName(p.name);
                const { priceBase, costBase } = getVariantBaseData(p, calcTargetMode);
                setKgPrice200g(priceBase);
                setKgCostPrice200g(costBase);
            }
        }
    };

    const handleAddKgToCart = (payDirectly = false) => {
        const is500g = calcTargetMode === '500g';
        const baseWeight = is500g ? 100 : 200;
        const rawPriceBase = Number(kgPrice200g) || 0;
        if (rawPriceBase <= 0 && (!isKgCustomPriceOverridden || Number(kgCustomFinalPrice) <= 0)) {
            showToast(`⚠️ Masukkan harga varian ${baseWeight} gr terlebih dahulu!`);
            return;
        }

        let prodName = kgCustomProductName.trim();
        let prodImage = '/brand/logo-circle.png';
        let prodId = 0;
        let varId = 0;

        if (kgSelectedProductId !== 'custom') {
            const p = products.find((prod) => prod.id === kgSelectedProductId);
            if (p) {
                prodName = p.name;
                prodImage = p.image || prodImage;
                prodId = p.id;
                const baseRegex = is500g ? /100\s*(g|gr|gram)?/i : /200\s*(g|gr|gram)?/i;
                const vBase = p.variants?.find(
                    (v) => v.weight_grams === baseWeight || baseRegex.test(v.label)
                );
                if (vBase) varId = vBase.id;
            }
        }

        if (!prodName) {
            prodName = is500g ? 'Kopi 500 gr' : 'Kopi 1000 gr';
        }

        const calculatedBase = rawPriceBase * kgMultiplier;
        let finalPrice = calculatedBase;
        let discountAmt = 0;

        if (isKgCustomPriceOverridden && Number(kgCustomFinalPrice) > 0) {
            finalPrice = Number(kgCustomFinalPrice);
            discountAmt = Math.max(0, calculatedBase - finalPrice);
        } else if (kgDiscountType === 'percent') {
            discountAmt = Math.round((calculatedBase * (Number(kgDiscountValue) || 0)) / 100);
            finalPrice = Math.max(0, calculatedBase - discountAmt);
        } else if (kgDiscountType === 'nominal') {
            discountAmt = Math.min(calculatedBase, Number(kgDiscountValue) || 0);
            finalPrice = Math.max(0, calculatedBase - discountAmt);
        }

        const packagingDiscount = is500g ? 24000 : 27000;
        let rawCostBase = Number(kgCostPrice200g) || 0;
        if (kgSelectedProductId !== 'custom') {
            const p = products.find((prod) => prod.id === kgSelectedProductId);
            if (p) {
                const { costBase } = getVariantBaseData(p, calcTargetMode);
                rawCostBase = Number(costBase) || 0;
            }
        }
        const rawHppScaled = rawCostBase * kgMultiplier;
        const totalCost = rawCostBase > 0 ? Math.max(0, rawHppScaled - packagingDiscount) : undefined;

        const variantLabel = is500g ? '500 gr' : '1000 gr';

        const newCartItem: CartItem = {
            id: `kg-custom-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            product_id: prodId,
            variant_id: varId,
            product_name: prodName,
            variant_label: variantLabel,
            price: finalPrice,
            cost_price: totalCost,
            quantity: Math.max(1, kgQuantity),
            image: prodImage,
            is_manual: false,
            notes: kgNotes ? kgNotes.trim() : undefined,
        };

        setCart((prev) => [...prev, newCartItem]);
        showToast(`✓ "${prodName} (${variantLabel})" berhasil ditambahkan ke keranjang!`);
        setIsKgCalculatorOpen(false);

        if (payDirectly) {
            setTimeout(() => {
                openCheckout();
            }, 120);
        }
    };

    // --- HOLD / QUEUE ORDER HANDLERS ---
    const openHoldModal = () => {
        if (cart.length === 0) {
            showToast('Keranjang masih kosong, pilih produk terlebih dahulu');
            return;
        }
        setHoldCustomerName(customerName.trim());
        setHoldCustomerPhone(customerPhone.trim());
        setHoldNotes('');
        setIsHoldModalOpen(true);
    };

    const handleConfirmHoldOrder = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!holdCustomerName.trim()) {
            alert('Mohon isi nama pelanggan antrian');
            return;
        }
        setIsHoldingSubmit(true);
        try {
            const csrfToken =
                (
                    document.querySelector(
                        'meta[name="csrf-token"]',
                    ) as HTMLMetaElement
                )?.content || '';
            const payload = {
                customer_name: holdCustomerName.trim(),
                customer_phone: holdCustomerPhone.trim() || null,
                notes: holdNotes.trim() || null,
                items: cart.map((i) => ({
                    product_id: i.product_id,
                    product_name: i.product_name,
                    variant_id: i.variant_id,
                    variant_label: i.variant_label,
                    price: i.price,
                    quantity: i.quantity,
                    discount_type: i.discount_type,
                    discount_value: i.discount_value,
                    discount_amount: i.discount_amount || 0,
                    image: i.image,
                })),
                discount_amount: cartDiscountAmount,
                customer_address: isDeliveryOrder
                    ? customerAddress.trim()
                    : null,
                shipping_cost: numericShippingCost,
                shipping_courier:
                    isDeliveryOrder && shippingCourier.trim()
                        ? shippingCourier.trim()
                        : null,
            };
            const res = await fetch('/pos/queue', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                },
                body: JSON.stringify(payload),
            });
            const data = await res.json();
            if (!res.ok || !data.success) {
                throw new Error(
                    data.message || 'Gagal menyimpan pesanan ke antrian',
                );
            }
            if (data.held_order) {
                setHeldOrdersList((prev) => [data.held_order, ...prev]);
            }
            // Clear active cart & customer info
            setCart([]);
            setCartDiscountValue(0);
            setCustomerName('');
            setCustomerPhone('');
            setIsDeliveryOrder(false);
            setShippingCost('');
            setShippingCourier('');
            setCustomerAddress('');
            clearCartStorage();
            setIsHoldModalOpen(false);
            showToast(
                `Pesanan antrian "${holdCustomerName.trim()}" berhasil disimpan!`,
            );
        } catch (err: any) {
            alert('Gagal: ' + err.message);
        } finally {
            setIsHoldingSubmit(false);
        }
    };

    const handleRestoreQueueOrder = (held: PosHeldOrderItem) => {
        if (cart.length > 0) {
            if (
                !confirm(
                    'Keranjang aktif saat ini ada isinya. Ganti isi keranjang kasir dengan pesanan antrian ini?',
                )
            ) {
                return;
            }
        }
        const restoredCart: CartItem[] = (held.items || []).map((it) => ({
            id: `${it.product_id}-${it.variant_id}`,
            product_id: it.product_id,
            product_name: it.product_name,
            variant_id: it.variant_id,
            variant_label: it.variant_label,
            price: it.price,
            quantity: it.quantity,
            discount_type: it.discount_type,
            discount_value: it.discount_value,
            discount_amount: it.discount_amount,
            image: it.image || '/brand/logo-circle.png',
        }));
        setCart(restoredCart);
        setCartDiscountValue(held.discount_amount || 0);
        setCustomerName(held.customer_name);
        setCustomerPhone(held.customer_phone || '');
        if (
            held.shipping_cost ||
            held.customer_address ||
            held.shipping_courier
        ) {
            setIsDeliveryOrder(true);
            setShippingCost(held.shipping_cost || '');
            setShippingCourier(held.shipping_courier || '');
            setCustomerAddress(held.customer_address || '');
        } else {
            setIsDeliveryOrder(false);
            setShippingCost('');
            setShippingCourier('');
            setCustomerAddress('');
        }

        handleDeleteQueueOrder(held.id, false);

        setActiveTab('cashier');
        showToast(
            `Pesanan antrian "${held.customer_name}" telah dimuat ke kasir!`,
        );
    };

    const handleDeleteQueueOrder = async (id: number, confirmPrompt = true) => {
        if (confirmPrompt && !confirm('Hapus pesanan dari antrian ini?'))
            return;
        try {
            const csrfToken =
                (
                    document.querySelector(
                        'meta[name="csrf-token"]',
                    ) as HTMLMetaElement
                )?.content || '';
            await fetch(`/pos/queue/${id}`, {
                method: 'DELETE',
                headers: {
                    Accept: 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                },
            });
            setHeldOrdersList((prev) => prev.filter((h) => h.id !== id));
            if (confirmPrompt) {
                showToast('Pesanan di antrian berhasil dihapus');
            }
        } catch (err) {
            console.error('Failed to delete queue order:', err);
        }
    };

    // --- SHARE PRE-BILL HANDLERS ---
    const openSharePreBillModal = () => {
        if (cart.length === 0) {
            showToast('Keranjang masih kosong, pilih produk terlebih dahulu');
            return;
        }
        setSharePreBillCustomerName(customerName || '');
        setSharePreBillCustomerPhone(customerPhone || '');
        setSharePreBillNotes('');
        setIsPreBillCopied(false);
        setIsSharePreBillModalOpen(true);
    };

    const currentPreBillData: PreBillData = useMemo(() => {
        return {
            store_name: printerForm.store_name || 'Alat Kopi Malang',
            tagline: printerForm.tagline,
            address: printerForm.address,
            phone: printerForm.phone,
            instagram: printerForm.instagram,
            cashier_name: cashier.name,
            customer_name:
                sharePreBillCustomerName.trim() ||
                customerName.trim() ||
                undefined,
            customer_phone:
                sharePreBillCustomerPhone.trim() ||
                customerPhone.trim() ||
                undefined,
            customer_address: isDeliveryOrder
                ? customerAddress.trim() || undefined
                : undefined,
            shipping_cost: numericShippingCost,
            shipping_courier:
                isDeliveryOrder && shippingCourier.trim()
                    ? shippingCourier.trim()
                    : undefined,
            date: new Date().toLocaleString('id-ID', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
            }),
            items: cart.map((item) => ({
                product_name: item.product_name,
                variant_label: item.variant_label,
                price: item.price,
                quantity: item.quantity,
                subtotal:
                    item.price * item.quantity - (item.discount_amount || 0),
                discount_amount: item.discount_amount,
            })),
            subtotal: subtotal,
            discount_amount: discountAmount,
            total_amount: totalAmount,
            notes: sharePreBillNotes.trim() || undefined,
            bank_info: sharePreBillIncludeBank
                ? paymentForm.bank_info
                : undefined,
            qris_instructions: sharePreBillIncludeBank
                ? paymentForm.qris_instructions
                : undefined,
        };
    }, [
        cart,
        subtotal,
        discountAmount,
        totalAmount,
        printerForm,
        cashier,
        sharePreBillCustomerName,
        customerName,
        sharePreBillCustomerPhone,
        customerPhone,
        sharePreBillNotes,
        sharePreBillIncludeBank,
        paymentForm,
        isDeliveryOrder,
        customerAddress,
        numericShippingCost,
        shippingCourier,
    ]);

    const handleShareWhatsAppPreBill = () => {
        const waUrl = generatePreBillWhatsAppUrl(
            currentPreBillData,
            sharePreBillCustomerPhone,
        );
        window.open(waUrl, '_blank', 'noopener,noreferrer');
        showToast('Membuka WhatsApp untuk mengirim struk...');
    };

    const handleDownloadA4InvoicePdf = () => {
        printA4InvoiceWeb(currentPreBillData);
        showToast('Mengunduh file PDF Invoice A4...');
    };

    const handleCopyPreBill = () => {
        const text = generatePreBillWhatsAppText(currentPreBillData);
        navigator.clipboard.writeText(text);
        setIsPreBillCopied(true);
        showToast('Teks pesan WhatsApp berhasil disalin ke clipboard!');
        setTimeout(() => setIsPreBillCopied(false), 2500);
    };

    const handlePrintPreBill = () => {
        if (
            isAndroidNativeBluetoothAvailable() &&
            !(connectedBtPrinter || getSavedBluetoothPrinter())
        ) {
            openBluetoothScannerModal();
            return;
        }
        printPreBillThermalWeb(currentPreBillData, printerForm.paper_width);
        if (isAndroidNativeBluetoothAvailable() && (connectedBtPrinter || getSavedBluetoothPrinter())) {
            showToast('✓ Mencetak struk estimasi ke printer Bluetooth...');
        }
    };

    // Helper to switch tab from sidebar
    const navigateToTab = (tab: PosActiveTab) => {
        if (tab === 'profit_loss' && !canAccessProfitLoss) {
            setActiveTab('cashier');
            setIsSidebarOpen(false);
            return;
        }
        setActiveTab(tab);
        setIsSidebarOpen(false);
    };

    return (
        <div
            className={`${isDark ? 'dark' : ''} flex w-full max-w-full flex-col overflow-x-clip bg-[#f4f6f6] font-sans text-stone-900 antialiased transition-colors select-none dark:bg-stone-950 dark:text-stone-100 ${
                activeTab === 'cashier'
                    ? 'min-h-[calc(100dvh+8px)] md:fixed md:inset-0 md:h-[100dvh] md:max-h-[100dvh] md:overflow-hidden'
                    : 'min-h-[calc(100dvh+8px)]'
            }`}
        >
            <Head title="Aplikasi POS Kasir — Alat Kopi Malang" />

            {/* ========================================================================= */}
            {/* SLIDE-OUT SIDEBAR DRAWER (BERSIH HIJAU + PUTIH PERSIS REFERENSI USER)       */}
            {/* ========================================================================= */}
            {isSidebarOpen && (
                <div className="pos-modal-overlay fixed inset-0 z-50 flex animate-in duration-200 fade-in">
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 cursor-pointer bg-black/60 transition-opacity"
                        onClick={() => setIsSidebarOpen(false)}
                    />

                    {/* Left Slide Panel */}
                    <div className="pos-gpu-layer relative z-10 flex h-full w-72 animate-in flex-col border-r border-stone-200 bg-white text-stone-800 shadow-2xl duration-200 slide-in-from-left sm:w-80 dark:border-stone-800 dark:bg-stone-900 dark:text-stone-200">
                        {/* Top Back Arrow Button */}
                        <div className="flex justify-end px-3 pt-3 pb-0">
                            <button
                                type="button"
                                onClick={() => setIsSidebarOpen(false)}
                                className="cursor-pointer rounded-xl p-1.5 text-stone-700 transition hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-stone-800"
                                title="Tutup Menu"
                                aria-label="Tutup Menu"
                            >
                                <ArrowLeft className="h-6 w-6 stroke-[2.2]" />
                            </button>
                        </div>

                        {/* Centered Avatar & Cashier Name (Compact & Pulled Up) */}
                        <div className="-mt-2 flex flex-col items-center border-b border-stone-100 px-4 pb-3.5 dark:border-stone-800">
                            <div className="mb-2 flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border border-stone-200 bg-stone-100 p-1.5 shadow-2xs dark:border-stone-700 dark:bg-stone-800">
                                <img
                                    src="/brand/logo-circle.png"
                                    alt="Alat Kopi Malang"
                                    className="h-full w-full rounded-full object-contain"
                                />
                            </div>
                            <h2 className="text-center text-sm font-extrabold tracking-wide text-[#0284c7] uppercase dark:text-[#38bdf8]">
                                {cashier.name}
                            </h2>
                        </div>

                        {/* Vertical Menu Items List (Persis Urutan Screenshot Referensi) */}
                        <div className="flex-1 overflow-y-auto py-2">
                            {/* 1. Aplikasi Kasir */}
                            <button
                                type="button"
                                onClick={() => navigateToTab('cashier')}
                                className={`flex w-full cursor-pointer items-center gap-4 px-5 py-3.5 text-left text-sm font-semibold transition ${
                                    activeTab === 'cashier'
                                        ? 'bg-[#f0f2f5] font-bold text-stone-900 dark:bg-stone-800 dark:text-stone-100'
                                        : 'text-stone-800 hover:bg-stone-50 dark:text-stone-200 dark:hover:bg-stone-800/60'
                                }`}
                            >
                                <Store className="h-5 w-5 shrink-0 stroke-[2.2] text-stone-800 dark:text-stone-300" />
                                <span>Aplikasi Kasir</span>
                            </button>

                            {/* Order Manual (HPP + Harga Jual) */}
                            <button
                                type="button"
                                onClick={() => {
                                    setIsSidebarOpen(false);
                                    setActiveTab('cashier');
                                    openManualOrderModal();
                                }}
                                className="flex w-full cursor-pointer items-center gap-4 px-5 py-3.5 text-left text-sm font-semibold text-stone-800 transition hover:bg-stone-50 dark:text-stone-200 dark:hover:bg-stone-800/60"
                            >
                                <PlusCircle className="h-5 w-5 shrink-0 stroke-[2.2] text-amber-600 dark:text-amber-400" />
                                <span>Order Manual</span>
                                <span className="ml-auto rounded-full border border-amber-300 bg-amber-100 px-2 py-0.5 text-[10px] font-extrabold text-amber-800 uppercase dark:border-amber-700 dark:bg-amber-950/60 dark:text-amber-300">
                                    HPP + Jual
                                </span>
                            </button>

                            {/* Kalkulator Harga 500 gr (100g x 5) */}
                            <button
                                type="button"
                                onClick={() => {
                                    setIsSidebarOpen(false);
                                    setActiveTab('cashier');
                                    openKgCalculatorModal(undefined, '500g');
                                }}
                                className="flex w-full cursor-pointer items-center gap-4 px-5 py-3.5 text-left text-sm font-semibold text-stone-800 transition hover:bg-stone-50 dark:text-stone-200 dark:hover:bg-stone-800/60"
                            >
                                <Calculator className="h-5 w-5 shrink-0 stroke-[2.2] text-teal-600 dark:text-teal-400" />
                                <span>Kalkulator 500 gr</span>
                                <span className="ml-auto rounded-full border border-teal-300 bg-teal-100 px-2 py-0.5 text-[10px] font-extrabold text-teal-800 uppercase dark:border-teal-700 dark:bg-teal-950/60 dark:text-teal-300">
                                    100g × 5
                                </span>
                            </button>

                            {/* Kalkulator Custom Harga 1 Kg (200g x 5) */}
                            <button
                                type="button"
                                onClick={() => {
                                    setIsSidebarOpen(false);
                                    setActiveTab('cashier');
                                    openKgCalculatorModal(undefined, '1000g');
                                }}
                                className="flex w-full cursor-pointer items-center gap-4 px-5 py-3.5 text-left text-sm font-semibold text-stone-800 transition hover:bg-stone-50 dark:text-stone-200 dark:hover:bg-stone-800/60"
                            >
                                <Calculator className="h-5 w-5 shrink-0 stroke-[2.2] text-emerald-600 dark:text-emerald-400" />
                                <span>Kalkulator 1 Kg</span>
                                <span className="ml-auto rounded-full border border-emerald-300 bg-emerald-100 px-2 py-0.5 text-[10px] font-extrabold text-emerald-800 uppercase dark:border-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                                    200g × 5
                                </span>
                            </button>

                            {/* Antrian Pesanan (Hold Orders) */}
                            <button
                                type="button"
                                onClick={() => navigateToTab('queue')}
                                className={`flex w-full cursor-pointer items-center gap-4 px-5 py-3.5 text-left text-sm font-semibold transition ${
                                    activeTab === 'queue'
                                        ? 'bg-[#f0f2f5] font-bold text-stone-900 dark:bg-stone-800 dark:text-stone-100'
                                        : 'text-stone-800 hover:bg-stone-50 dark:text-stone-200 dark:hover:bg-stone-800/60'
                                }`}
                            >
                                <Clock className="h-5 w-5 shrink-0 stroke-[2.2] text-stone-800 dark:text-stone-300" />
                                <span>Antrian Pesanan</span>
                                {heldOrdersList.length > 0 && (
                                    <span className="ml-auto rounded-full bg-amber-500 px-2 py-0.5 text-xs font-bold text-white">
                                        {heldOrdersList.length}
                                    </span>
                                )}
                            </button>

                            {/* 2. Transaksi */}
                            <button
                                type="button"
                                onClick={() => navigateToTab('transactions')}
                                className={`flex w-full cursor-pointer items-center gap-4 px-5 py-3.5 text-left text-sm font-semibold transition ${
                                    activeTab === 'transactions'
                                        ? 'bg-[#f0f2f5] font-bold text-stone-900 dark:bg-stone-800 dark:text-stone-100'
                                        : 'text-stone-800 hover:bg-stone-50 dark:text-stone-200 dark:hover:bg-stone-800/60'
                                }`}
                            >
                                <Calendar className="h-5 w-5 shrink-0 stroke-[2.2] text-stone-800 dark:text-stone-300" />
                                <span>Transaksi</span>
                                {recentOrders.length > 0 && (
                                    <span className="ml-auto rounded-full bg-stone-200 px-2 py-0.5 text-xs font-bold text-stone-800 dark:bg-stone-700 dark:text-stone-200">
                                        {recentOrders.length}
                                    </span>
                                )}
                            </button>

                            {/* 3. Inventori */}
                            <button
                                type="button"
                                onClick={() => navigateToTab('inventory')}
                                className={`flex w-full cursor-pointer items-center gap-4 px-5 py-3.5 text-left text-sm font-semibold transition ${
                                    activeTab === 'inventory'
                                        ? 'bg-[#f0f2f5] font-bold text-stone-900 dark:bg-stone-800 dark:text-stone-100'
                                        : 'text-stone-800 hover:bg-stone-50 dark:text-stone-200 dark:hover:bg-stone-800/60'
                                }`}
                            >
                                <Package className="h-5 w-5 shrink-0 stroke-[2.2] text-stone-800 dark:text-stone-300" />
                                <span>Inventori</span>
                                <span className="ml-auto text-xs font-medium text-stone-400">
                                    {products.length} item
                                </span>
                            </button>

                            {/* 4. Kas Masuk-Keluar */}
                            <button
                                type="button"
                                onClick={() => navigateToTab('cash_flow')}
                                className={`flex w-full cursor-pointer items-center gap-4 px-5 py-3.5 text-left text-sm font-semibold transition ${
                                    activeTab === 'cash_flow'
                                        ? 'bg-[#f0f2f5] font-bold text-stone-900 dark:bg-stone-800 dark:text-stone-100'
                                        : 'text-stone-800 hover:bg-stone-50 dark:text-stone-200 dark:hover:bg-stone-800/60'
                                }`}
                            >
                                <Banknote className="h-5 w-5 shrink-0 stroke-[2.2] text-stone-800 dark:text-stone-300" />
                                <span>Kas Masuk-Keluar</span>
                            </button>

                            {/* 5. Laporan */}
                            <button
                                type="button"
                                onClick={() => navigateToTab('reports')}
                                className={`flex w-full cursor-pointer items-center gap-4 px-5 py-3.5 text-left text-sm font-semibold transition ${
                                    activeTab === 'reports'
                                        ? 'bg-[#f0f2f5] font-bold text-stone-900 dark:bg-stone-800 dark:text-stone-100'
                                        : 'text-stone-800 hover:bg-stone-50 dark:text-stone-200 dark:hover:bg-stone-800/60'
                                }`}
                            >
                                <TrendingUp className="h-5 w-5 shrink-0 stroke-[2.2] text-stone-800 dark:text-stone-300" />
                                <span>Laporan Penjualan</span>
                            </button>

                            {/* Laporan Laba Rugi (Hanya Akun Owner & Admin) */}
                            {canAccessProfitLoss && (
                                <button
                                    type="button"
                                    onClick={() => navigateToTab('profit_loss')}
                                    className={`flex w-full cursor-pointer items-center gap-4 px-5 py-3.5 text-left text-sm font-semibold transition ${
                                        activeTab === 'profit_loss'
                                            ? 'bg-[#f0f2f5] font-bold text-stone-900 dark:bg-stone-800 dark:text-stone-100'
                                            : 'text-stone-800 hover:bg-stone-50 dark:text-stone-200 dark:hover:bg-stone-800/60'
                                    }`}
                                >
                                    <PieChart className="h-5 w-5 shrink-0 stroke-[2.2] text-emerald-600 dark:text-emerald-400" />
                                    <span>Laporan Laba Rugi</span>
                                </button>
                            )}

                            {/* 6. Pengaturan */}
                            <button
                                type="button"
                                onClick={() => navigateToTab('settings')}
                                className={`flex w-full cursor-pointer items-center gap-4 px-5 py-3.5 text-left text-sm font-semibold transition ${
                                    activeTab === 'settings'
                                        ? 'bg-[#f0f2f5] font-bold text-stone-900 dark:bg-stone-800 dark:text-stone-100'
                                        : 'text-stone-800 hover:bg-stone-50 dark:text-stone-200 dark:hover:bg-stone-800/60'
                                }`}
                            >
                                <Settings className="h-5 w-5 shrink-0 stroke-[2.2] text-stone-800 dark:text-stone-300" />
                                <span>Pengaturan</span>
                            </button>

                            {/* 7. Mode Offline & Sinkronisasi Data */}
                            <button
                                type="button"
                                onClick={() => {
                                    setIsSidebarOpen(false);
                                    setIsOfflineModalOpen(true);
                                }}
                                className="flex w-full cursor-pointer items-center gap-4 px-5 py-3.5 text-left text-sm font-semibold text-stone-800 transition hover:bg-stone-50 dark:text-stone-200 dark:hover:bg-stone-800/60"
                            >
                                <Cloud className="h-5 w-5 shrink-0 stroke-[2.2] text-stone-800 dark:text-stone-300" />
                                <span>Mode Offline & Sinkronisasi</span>
                                {offlineOrders.length > 0 ? (
                                    <span className="ml-auto rounded-full bg-amber-500 px-2 py-0.5 text-xs font-bold text-white">
                                        {offlineOrders.length}
                                    </span>
                                ) : (
                                    <span
                                        className={`ml-auto text-[11px] font-bold ${
                                            isEffectiveOffline
                                                ? 'text-amber-600 dark:text-amber-400'
                                                : 'text-emerald-600 dark:text-emerald-400'
                                        }`}
                                    >
                                        {isEffectiveOffline
                                            ? 'Offline'
                                            : 'Online'}
                                    </span>
                                )}
                            </button>

                            {/* 8. Khusus Owner: Kelola Staf POS */}
                            {isOwner && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setActiveTab('settings');
                                        setSettingsSubTab('staff');
                                        setIsSidebarOpen(false);
                                    }}
                                    className="flex w-full cursor-pointer items-center gap-4 px-5 py-3.5 text-left text-sm font-semibold text-stone-800 transition hover:bg-stone-50 dark:text-stone-200 dark:hover:bg-stone-800/60"
                                >
                                    <Users className="h-5 w-5 shrink-0 stroke-[2.2] text-amber-600 dark:text-amber-400" />
                                    <span>Kelola Staf POS</span>
                                    <span className="ml-auto rounded border border-amber-500/30 bg-amber-500/20 px-2 py-0.5 text-[10px] font-black text-amber-700 uppercase dark:text-amber-300">
                                        Owner
                                    </span>
                                </button>
                            )}
                        </div>

                        {/* Theme / Appearance Switcher: Terang / Gelap / Sistem */}
                        <div className="space-y-2 border-t border-stone-200 px-4 py-3 dark:border-stone-800">
                            <div className="flex items-center justify-between text-xs font-bold tracking-wider text-stone-500 uppercase dark:text-stone-400">
                                <span>Pilihan Mode</span>
                                <span className="text-[11px] font-bold text-brand-700 capitalize dark:text-emerald-400">
                                    {appearance === 'dark'
                                        ? 'Mode Gelap'
                                        : appearance === 'light'
                                          ? 'Mode Terang'
                                          : 'Sistem'}
                                </span>
                            </div>
                            <div className="grid grid-cols-3 gap-1 rounded-xl bg-stone-100 p-1 text-xs font-semibold dark:bg-stone-800">
                                <button
                                    type="button"
                                    onClick={() => updateAppearance('light')}
                                    className={`flex cursor-pointer items-center justify-center gap-1.5 rounded-lg py-1.5 transition ${
                                        appearance === 'light'
                                            ? 'bg-white font-bold text-stone-900 shadow-xs dark:bg-stone-700 dark:text-stone-100'
                                            : 'text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100'
                                    }`}
                                >
                                    <Sun className="h-3.5 w-3.5 text-amber-500" />
                                    <span>Terang</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => updateAppearance('dark')}
                                    className={`flex cursor-pointer items-center justify-center gap-1.5 rounded-lg py-1.5 transition ${
                                        appearance === 'dark'
                                            ? 'bg-white font-bold text-stone-900 shadow-xs dark:bg-stone-700 dark:text-stone-100'
                                            : 'text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100'
                                    }`}
                                >
                                    <Moon className="h-3.5 w-3.5 text-indigo-400" />
                                    <span>Gelap</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => updateAppearance('system')}
                                    className={`flex cursor-pointer items-center justify-center gap-1.5 rounded-lg py-1.5 transition ${
                                        appearance === 'system'
                                            ? 'bg-white font-bold text-stone-900 shadow-xs dark:bg-stone-700 dark:text-stone-100'
                                            : 'text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100'
                                    }`}
                                >
                                    <Monitor className="h-3.5 w-3.5 text-stone-500 dark:text-stone-400" />
                                    <span>Sistem</span>
                                </button>
                            </div>
                        </div>

                        {/* Bottom Actions: Logout */}
                        <div className="space-y-1 border-t border-stone-200 px-2 py-1.5 dark:border-stone-800">
                            <Link
                                href="/pos/logout"
                                method="post"
                                as="button"
                                className="flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2 text-left text-xs font-semibold text-rose-600 transition hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/40"
                            >
                                <LogOut className="h-4 w-4 shrink-0 text-rose-600 dark:text-rose-400" />
                                <span>Keluar / Ganti Akun</span>
                            </Link>
                        </div>
                    </div>
                </div>
            )}

            {/* --- TOP APP HEADER WITH HAMBURGER MENU BUTTON (DEEP BRAND GREEN) --- */}
            <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between border-b border-brand-900/60 bg-brand-950 px-3 text-white shadow-xs sm:px-4 md:static">
                <div className="flex items-center gap-3">
                    {/* Hamburger Button to Open Sidebar */}
                    <button
                        type="button"
                        onClick={() => setIsSidebarOpen(true)}
                        className="-ml-1 flex cursor-pointer items-center justify-center rounded-xl border border-brand-800 bg-brand-900 p-2 text-white shadow-xs transition hover:bg-brand-800 active:scale-95"
                        title="Buka Menu Samping POS"
                        aria-label="Buka Menu Samping POS"
                    >
                        <Menu className="h-5 w-5 stroke-[2.3]" />
                    </button>

                    <div className="flex items-center gap-2.5">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-white/20 bg-white/10 shadow-2xs">
                            <img
                                src="/brand/logo-circle.png"
                                alt="Alat Kopi Malang"
                                className="h-full w-full object-contain p-0.5"
                            />
                        </div>
                        <div className="hidden sm:block">
                            <h1 className="text-sm font-bold tracking-wide text-white">
                                SANUBARI POS
                            </h1>
                            <p className="flex max-w-[140px] items-center gap-1.5 truncate text-[11px] text-brand-300 sm:max-w-xs">
                                <span>
                                    Kasir:{' '}
                                    <span className="font-medium text-white">
                                        {cashier.name}
                                    </span>
                                </span>
                                {cashier.role && (
                                    <span className="rounded border border-brand-700/60 bg-brand-800 px-1.5 py-0.5 text-[9px] font-bold tracking-wider text-amber-300 uppercase">
                                        {cashier.role}
                                    </span>
                                )}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Right Quick Controls */}
                <div className="flex items-center gap-2">
                    {/* Status Mode Offline / Online & Quick Sync */}
                    <button
                        type="button"
                        onClick={() => setIsOfflineModalOpen(true)}
                        className={`flex cursor-pointer items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-xs font-bold shadow-xs transition active:scale-95 sm:px-3 ${
                            manualOffline
                                ? 'border border-amber-500/50 bg-amber-500/20 text-amber-300 hover:bg-amber-500/30'
                                : !isOnline
                                  ? 'animate-pulse border border-rose-500/50 bg-rose-500/20 text-rose-300 hover:bg-rose-500/30'
                                  : offlineOrders.length > 0
                                    ? 'border border-amber-500/50 bg-amber-500/20 text-amber-300 hover:bg-amber-500/30'
                                    : 'border border-emerald-500/40 bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30'
                        }`}
                        title="Status Mode Offline / Online — Klik untuk Buka Sinkronisasi Data"
                    >
                        {isSyncing ? (
                            <>
                                <RefreshCw className="h-3.5 w-3.5 animate-spin text-emerald-400" />
                                <span className="hidden md:inline">
                                    Sync...
                                </span>
                            </>
                        ) : manualOffline ? (
                            <>
                                <WifiOff className="h-3.5 w-3.5 text-amber-400" />
                                <span className="hidden md:inline">
                                    Mode Offline
                                </span>
                                {offlineOrders.length > 0 && (
                                    <span className="py-0.2 rounded-full bg-amber-400 px-1.5 text-[10px] font-black text-stone-950">
                                        {offlineOrders.length}
                                    </span>
                                )}
                            </>
                        ) : !isOnline ? (
                            <>
                                <CloudOff className="h-3.5 w-3.5 text-rose-400" />
                                <span className="hidden md:inline">
                                    Offline
                                </span>
                                {offlineOrders.length > 0 && (
                                    <span className="py-0.2 rounded-full bg-rose-400 px-1.5 text-[10px] font-black text-white">
                                        {offlineOrders.length}
                                    </span>
                                )}
                            </>
                        ) : offlineOrders.length > 0 ? (
                            <>
                                <Cloud className="h-3.5 w-3.5 text-amber-400" />
                                <span className="hidden md:inline">
                                    Sync Pending
                                </span>
                                <span className="py-0.2 rounded-full bg-amber-400 px-1.5 text-[10px] font-black text-stone-950">
                                    {offlineOrders.length}
                                </span>
                            </>
                        ) : (
                            <>
                                <Wifi className="h-3.5 w-3.5 text-emerald-400" />
                                <span className="hidden md:inline">Online</span>
                            </>
                        )}
                    </button>

                    {/* Quick Queue Button (Hanya tampil saat berada di menu kasir / produk) */}
                    {activeTab === 'cashier' && (
                        <button
                            type="button"
                            onClick={() => setActiveTab('queue')}
                            className={`flex cursor-pointer items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold shadow-xs transition active:scale-95 ${
                                heldOrdersList.length > 0
                                    ? 'border border-amber-500/50 bg-amber-500/20 text-amber-300 hover:bg-amber-500/30'
                                    : 'border border-brand-800 bg-brand-900 text-brand-300 hover:bg-brand-800'
                            }`}
                            title="Daftar Antrian Pesanan Kasir"
                        >
                            <Clock className="h-3.5 w-3.5" />
                            <span>Antrian</span>
                            {heldOrdersList.length > 0 && (
                                <span className="py-0.2 rounded-full bg-amber-400 px-1.5 text-[10px] font-black text-stone-950">
                                    {heldOrdersList.length}
                                </span>
                            )}
                        </button>
                    )}

                    {activeTab !== 'cashier' && (
                        <button
                            type="button"
                            onClick={() => setActiveTab('cashier')}
                            className="hidden cursor-pointer items-center gap-1.5 rounded-xl bg-brand-700 px-3 py-1.5 text-xs font-bold text-white shadow-sm transition hover:bg-brand-600 active:scale-95 sm:flex"
                        >
                            <ShoppingCart className="h-3.5 w-3.5" />
                            <span>Ke Kasir</span>
                        </button>
                    )}

                    {/* Menu Lainnya (Titik Tiga) untuk Sinkronisasi / Reload Aplikasi */}
                    <div className="relative" ref={moreMenuRef}>
                        <button
                            type="button"
                            onClick={() => setIsMoreMenuOpen((prev) => !prev)}
                            className="flex cursor-pointer items-center justify-center rounded-xl border border-brand-800 bg-brand-900 p-2 text-white shadow-xs transition hover:bg-brand-800 active:scale-95"
                            title="Menu Opsi POS / Sinkronisasi"
                            aria-label="Menu Opsi POS / Sinkronisasi"
                        >
                            <MoreVertical className="h-4 w-4 stroke-[2.2] sm:h-5 sm:w-5" />
                        </button>

                        {isMoreMenuOpen && (
                            <div className="absolute top-full right-0 z-50 mt-2 w-48 animate-in rounded-xl border border-stone-200 bg-white py-1.5 shadow-xl duration-100 zoom-in-95 fade-in sm:w-52 dark:border-stone-800 dark:bg-stone-900">
                                <button
                                    type="button"
                                    onClick={handleSyncAndReload}
                                    disabled={isReloadingApp}
                                    className="flex w-full cursor-pointer items-center gap-3 px-4 py-2.5 text-left text-xs font-semibold text-stone-700 transition hover:bg-stone-100 disabled:opacity-50 sm:text-sm dark:text-stone-200 dark:hover:bg-stone-800"
                                >
                                    <RefreshCw
                                        className={`h-4 w-4 text-stone-600 dark:text-stone-300 ${isReloadingApp ? 'animate-spin' : ''}`}
                                    />
                                    <span>
                                        {isReloadingApp
                                            ? 'Menyinkronkan...'
                                            : 'Sinkronisasi'}
                                    </span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            {/* ========================================================================= */}
            {/* VIEW 1: APLIKASI KASIR (KATALOG & KERANJANG PENJUALAN RETAIL)               */}
            {/* ========================================================================= */}
            {activeTab === 'cashier' && (
                <div className="relative flex flex-1 md:min-h-0 md:overflow-hidden">
                    {/* === LEFT COLUMN: CATALOG & SEARCH === */}
                    <main className="flex min-w-0 flex-1 flex-col bg-[#f4f6f6] md:min-h-0 md:overflow-hidden dark:bg-stone-950">
                        {/* Search & Category Filter Header */}
                        <div className="sticky top-16 z-20 shrink-0 space-y-3 border-b border-stone-200/80 bg-white p-3 shadow-2xs sm:p-4 md:static dark:border-stone-800 dark:bg-stone-900">
                            {/* Search Input */}
                            <div className="relative">
                                <Search className="absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-stone-400 dark:text-stone-500" />
                                <input
                                    ref={searchInputRef}
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) =>
                                        setSearchQuery(e.target.value)
                                    }
                                    placeholder="Cari kopi, SKU, atau kategori... (Tekan F2)"
                                    className="w-full rounded-xl border border-stone-200 bg-stone-50 py-2.5 pr-10 pl-10 text-sm text-stone-900 placeholder-stone-400 transition focus:border-brand-600 focus:bg-white focus:ring-1 focus:ring-brand-600 focus:outline-none dark:border-stone-700 dark:bg-stone-800 dark:text-stone-100 dark:placeholder-stone-500 dark:focus:bg-stone-800"
                                />
                                {searchQuery && (
                                    <button
                                        onClick={() => setSearchQuery('')}
                                        className="absolute top-1/2 right-3 -translate-y-1/2 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                )}
                            </div>

                            {/* Category Selector Pills & Quick Layout Controls */}
                            <div className="flex items-center justify-between gap-2">
                                <div className="flex min-w-0 flex-1 scrollbar-none touch-pan-x items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                                    <button
                                        type="button"
                                        onClick={() => setSelectedCategoryId('all')}
                                        className={`cursor-pointer rounded-lg px-3 py-1.5 font-medium whitespace-nowrap transition ${
                                            selectedCategoryId === 'all'
                                                ? 'bg-brand-700 font-bold text-white shadow-xs'
                                                : 'border border-stone-200 bg-white text-stone-600 hover:bg-stone-50 hover:text-stone-900 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-300 dark:hover:bg-stone-700 dark:hover:text-white'
                                        }`}
                                    >
                                        Semua Kopi ({products.length})
                                    </button>
                                    {posCategories.map((cat) => {
                                        const count = products.filter((p) =>
                                            Array.isArray(p.category_ids)
                                                ? p.category_ids.includes(cat.id)
                                                : ((p as any)?.category_id === cat.id),
                                        ).length;
                                        if (count === 0) return null;
                                        return (
                                            <button
                                                key={cat.id}
                                                type="button"
                                                onClick={() =>
                                                    setSelectedCategoryId(cat.id)
                                                }
                                                className={`cursor-pointer rounded-lg px-3 py-1.5 font-medium whitespace-nowrap transition ${
                                                    selectedCategoryId === cat.id
                                                        ? 'bg-brand-700 font-bold text-white shadow-xs'
                                                        : 'border border-stone-200 bg-white text-stone-600 hover:bg-stone-50 hover:text-stone-900 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-300 dark:hover:bg-stone-700 dark:hover:text-white'
                                                }`}
                                            >
                                                {cat.name} ({count})
                                            </button>
                                        );
                                    })}
                                </div>

                                {/* Quick Layout Density & Column Toggle */}
                                <div className="relative shrink-0 pb-1">
                                    <button
                                        type="button"
                                        onClick={() => setIsLayoutPopoverOpen(!isLayoutPopoverOpen)}
                                        className={`flex cursor-pointer items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-semibold shadow-2xs transition ${
                                            isLayoutPopoverOpen
                                                ? 'border-brand-600 bg-brand-50 text-brand-900 dark:border-brand-500 dark:bg-stone-800 dark:text-brand-300'
                                                : 'border-stone-200 bg-white text-stone-700 hover:bg-stone-50 hover:text-stone-900 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-300 dark:hover:bg-stone-700'
                                        }`}
                                        title="Atur Kepadatan Tampilan & Jumlah Kolom (Grid Density)"
                                    >
                                        <LayoutGrid className="h-3.5 w-3.5 text-stone-500 dark:text-stone-400" />
                                        <span className="hidden sm:inline">
                                            {gridDensity === 'compact'
                                                ? 'Rapat'
                                                : gridDensity === 'comfortable'
                                                ? 'Lega'
                                                : 'Standar'}
                                            {gridColumns !== 'auto' ? ` (${gridColumns} Kolom)` : ''}
                                        </span>
                                        <ChevronDown className="h-3 w-3 opacity-60" />
                                    </button>

                                    {/* Quick Layout Dropdown Popover */}
                                    {isLayoutPopoverOpen && (
                                        <div className="absolute right-0 top-full z-40 mt-1.5 w-64 rounded-2xl border border-stone-200 bg-white p-3.5 text-xs shadow-xl animate-in fade-in zoom-in-95 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100">
                                            <div className="flex items-center justify-between border-b border-stone-100 pb-2 dark:border-stone-800">
                                                <span className="flex items-center gap-1.5 font-bold text-stone-900 dark:text-white">
                                                    <LayoutGrid className="h-3.5 w-3.5 text-brand-600 dark:text-amber-400" />
                                                    Tampilan & Kolom POS
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={() => setIsLayoutPopoverOpen(false)}
                                                    className="cursor-pointer rounded p-0.5 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
                                                >
                                                    <X className="h-3.5 w-3.5" />
                                                </button>
                                            </div>

                                            {/* Density Selection */}
                                            <div className="mt-2.5">
                                                <div className="mb-1.5 text-[10px] font-bold tracking-wider text-stone-400 uppercase">
                                                    Kepadatan Kartu (Density)
                                                </div>
                                                <div className="grid grid-cols-3 gap-1 rounded-xl bg-stone-100 p-1 dark:bg-stone-800">
                                                    <button
                                                        type="button"
                                                        onClick={() => updateGridDensity('compact')}
                                                        className={`cursor-pointer rounded-lg py-1.5 text-center text-[11px] font-bold transition ${
                                                            gridDensity === 'compact'
                                                                ? 'bg-brand-700 text-white shadow-2xs'
                                                                : 'text-stone-600 hover:text-stone-900 dark:text-stone-300 dark:hover:text-white'
                                                        }`}
                                                    >
                                                        Rapat
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => updateGridDensity('normal')}
                                                        className={`cursor-pointer rounded-lg py-1.5 text-center text-[11px] font-bold transition ${
                                                            gridDensity === 'normal'
                                                                ? 'bg-brand-700 text-white shadow-2xs'
                                                                : 'text-stone-600 hover:text-stone-900 dark:text-stone-300 dark:hover:text-white'
                                                        }`}
                                                    >
                                                        Standar
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => updateGridDensity('comfortable')}
                                                        className={`cursor-pointer rounded-lg py-1.5 text-center text-[11px] font-bold transition ${
                                                            gridDensity === 'comfortable'
                                                                ? 'bg-brand-700 text-white shadow-2xs'
                                                                : 'text-stone-600 hover:text-stone-900 dark:text-stone-300 dark:hover:text-white'
                                                        }`}
                                                    >
                                                        Lega
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Columns Selection */}
                                            <div className="mt-3">
                                                <div className="mb-1.5 text-[10px] font-bold tracking-wider text-stone-400 uppercase">
                                                    Jumlah Kolom Produk
                                                </div>
                                                <div className="grid grid-cols-6 gap-1 rounded-xl bg-stone-100 p-1 text-center dark:bg-stone-800">
                                                    {(['auto', 2, 3, 4, 5, 6] as const).map((c) => (
                                                        <button
                                                            key={c}
                                                            type="button"
                                                            onClick={() => updateGridColumns(c as any)}
                                                            className={`cursor-pointer rounded-lg py-1.5 text-[11px] font-bold transition ${
                                                                gridColumns === c
                                                                    ? 'bg-brand-700 text-white shadow-2xs'
                                                                    : 'text-stone-600 hover:text-stone-900 dark:text-stone-300 dark:hover:text-white'
                                                            }`}
                                                        >
                                                            {c === 'auto' ? 'Auto' : c}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Product Cards Grid */}
                        <div className="flex-1 touch-pan-y p-3 pb-28 sm:p-4 md:min-h-0 md:overflow-y-auto md:overscroll-y-contain md:pb-6">
                            {filteredProducts.length === 0 ? (
                                <div className="flex h-full flex-col items-center justify-center p-8 text-center text-stone-500 dark:text-stone-400">
                                    <Coffee className="mb-3 h-12 w-12 stroke-[1.2] text-stone-400 dark:text-stone-500" />
                                    <p className="text-sm font-semibold text-stone-700 dark:text-stone-200">
                                        Tidak ada produk yang cocok
                                    </p>
                                    <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">
                                        Coba kata kunci lain atau pilih kategori
                                        Semua
                                    </p>
                                </div>
                            ) : (
                                <div className={getCatalogGridClasses(gridDensity, gridColumns)}>
                                    {filteredProducts.map((product) => (
                                        <ProductCard
                                            key={product.id}
                                            product={product}
                                            gridDensity={gridDensity}
                                            onClick={handleProductClick}
                                            formatRp={formatRp}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    </main>

                    {/* === RIGHT COLUMN: CASHIER BILLING CART (Desktop & Tablet) === */}
                    <aside className="hidden w-96 shrink-0 flex-col border-l border-stone-200 bg-white shadow-xs md:flex lg:w-[420px] xl:w-[460px] dark:border-stone-800 dark:bg-stone-900">
                        {/* Cart Header */}
                        <div className="flex items-center justify-between border-b border-stone-200 bg-stone-50/70 p-3.5 sm:p-4 dark:border-stone-800 dark:bg-stone-900/90">
                            <div className="flex items-center gap-2">
                                <ShoppingCart className="h-5 w-5 shrink-0 text-stone-800 dark:text-stone-200" />
                                <span className="text-sm font-bold text-stone-900 dark:text-white">
                                    ({totalItemsCount} item)
                                </span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                {cart.length > 0 && (
                                    <>
                                        <button
                                            type="button"
                                            onClick={openSharePreBillModal}
                                            className="flex cursor-pointer items-center gap-1 rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-800 shadow-2xs transition hover:bg-emerald-100 active:scale-95 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 dark:hover:bg-emerald-900"
                                            title="Bagikan struk pesanan ini ke WhatsApp sebelum bayar (F6)"
                                        >
                                            <Share2 className="h-3.5 w-3.5 text-emerald-700 dark:text-emerald-400" />
                                            <span>Share WA</span>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={openHoldModal}
                                            className="flex cursor-pointer items-center gap-1 rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-800 shadow-2xs transition hover:bg-amber-100 active:scale-95 dark:border-amber-800 dark:bg-amber-950/60 dark:text-amber-300 dark:hover:bg-amber-900"
                                            title="Simpan pesanan ini ke antrian (F7)"
                                        >
                                            <Clock className="h-3.5 w-3.5 text-amber-700 dark:text-amber-400" />
                                            <span>Simpan Antrian</span>
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Cart Items List */}
                        <div className="flex-1 touch-pan-y space-y-2.5 overflow-y-auto overscroll-y-contain bg-stone-50/30 p-3 sm:p-3.5 dark:bg-stone-950/40">
                            {cart.length === 0 ? (
                                <div className="flex h-full flex-col items-center justify-center p-6 text-center text-stone-500 dark:text-stone-400">
                                    <ShoppingCart className="mb-2.5 h-12 w-12 stroke-[1.2] text-stone-400 dark:text-stone-500" />
                                    <p className="text-sm font-bold text-stone-700 dark:text-stone-200">
                                        Keranjang Masih Kosong
                                    </p>
                                    <p className="mt-1 max-w-[220px] text-xs text-stone-500 dark:text-stone-400">
                                        Pilih produk di katalog atau klik tombol{' '}
                                        <strong>+ Manual</strong> untuk order
                                        custom
                                    </p>
                                </div>
                            ) : (
                                cart.map((item) => (
                                    <div
                                        key={item.id}
                                        className="dark:bg-stone-850 flex items-center gap-3 rounded-2xl border border-stone-200/90 bg-white p-3 shadow-2xs transition hover:border-brand-300 sm:p-3.5 dark:border-stone-800 dark:bg-stone-900 dark:hover:border-stone-700"
                                    >
                                        {item.is_manual && !item.id.startsWith('kg-custom-') ? (
                                            <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-xl border border-amber-300 bg-amber-500/10 text-amber-700 sm:h-16 sm:w-16 dark:border-amber-700/60 dark:bg-amber-400/10 dark:text-amber-400">
                                                <Calculator className="h-5 w-5 stroke-[2]" />
                                                <span className="mt-0.5 text-[9px] font-black tracking-wider uppercase">
                                                    Manual
                                                </span>
                                            </div>
                                        ) : (
                                            <img
                                                src={
                                                    item.image ||
                                                    '/brand/logo-circle.png'
                                                }
                                                alt={item.product_name}
                                                onError={(e) => {
                                                    const target =
                                                        e.currentTarget;
                                                    if (
                                                        !target.src.endsWith(
                                                            '/brand/logo-circle.png',
                                                        )
                                                    ) {
                                                        target.src =
                                                            '/brand/logo-circle.png';
                                                    }
                                                }}
                                                className="h-14 w-14 shrink-0 rounded-xl border border-stone-200 bg-stone-100 object-cover sm:h-16 sm:w-16 dark:border-stone-700 dark:bg-stone-800"
                                            />
                                        )}
                                        <div className="min-w-0 flex-1">
                                            <div className="flex flex-wrap items-center gap-1.5">
                                                <h4 className="truncate text-sm leading-snug font-bold text-stone-900 dark:text-white">
                                                    {item.product_name}
                                                </h4>
                                                {item.is_manual && !item.id.startsWith('kg-custom-') && (
                                                    <span className="py-0.2 rounded border border-amber-300 bg-amber-100 px-1.5 text-[10px] font-extrabold text-amber-800 dark:border-amber-700 dark:bg-amber-950/60 dark:text-amber-300">
                                                        Manual
                                                    </span>
                                                )}
                                                {item.id.startsWith('cybr-') && (
                                                    <span className="py-0.2 rounded border border-emerald-300 bg-emerald-100 px-1.5 text-[10px] font-extrabold text-emerald-800 dark:border-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                                                        C.Y.B.R Blend
                                                    </span>
                                                )}
                                            </div>
                                            <div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-stone-600 dark:text-stone-300">
                                                <span className="rounded-md border border-brand-200 bg-brand-50 px-1.5 py-0.5 text-[11px] font-bold text-brand-800 dark:border-stone-700 dark:bg-stone-800 dark:text-amber-300">
                                                    {item.variant_label}
                                                </span>
                                                <span className="font-medium text-stone-500 dark:text-stone-400">
                                                    @ Rp {formatRp(item.price)}
                                                </span>
                                                {item.is_manual && !item.id.startsWith('kg-custom-') && (
                                                    <>
                                                        <span className="text-[11px] font-semibold text-rose-600 dark:text-rose-400">
                                                            (HPP: Rp{' '}
                                                            {formatRp(
                                                                item.cost_price ||
                                                                    0,
                                                            )}
                                                            )
                                                        </span>
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                openManualOrderModal(
                                                                    item,
                                                                )
                                                            }
                                                            className="ml-1 flex cursor-pointer items-center gap-0.5 text-[11px] font-bold text-brand-700 hover:underline dark:text-amber-400"
                                                        >
                                                            <Pencil className="h-2.5 w-2.5" />
                                                            <span>Edit</span>
                                                        </button>
                                                    </>
                                                )}
                                            </div>

                                            {item.notes && !item.notes.startsWith('Rumus Otomatis') && (
                                                <div className="mt-1 text-[11px] font-medium text-emerald-800 dark:text-emerald-300">
                                                    {item.notes}
                                                </div>
                                            )}

                                            {item.cost_price !== undefined && item.cost_price > 0 && !item.is_manual && !item.id.startsWith('kg-custom-') && (
                                                <div className="mt-0.5 text-[10px] font-mono text-amber-600 dark:text-amber-400">
                                                    HPP: Rp {formatRp(item.cost_price)} | Laba: +Rp {formatRp(item.price - item.cost_price)}
                                                </div>
                                            )}

                                            {item.is_manual && !item.id.startsWith('kg-custom-') && (
                                                <div className="mt-1 flex items-center gap-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
                                                    <span>
                                                        Laba Kotor: +Rp{' '}
                                                        {formatRp(
                                                            (item.price -
                                                                (item.cost_price ||
                                                                    0)) *
                                                                item.quantity,
                                                        )}
                                                    </span>
                                                    {item.price > 0 && (
                                                        <span className="text-[10px] text-stone-400 dark:text-stone-500">
                                                            (
                                                            {(
                                                                ((item.price -
                                                                    (item.cost_price ||
                                                                        0)) /
                                                                    item.price) *
                                                                100
                                                            ).toFixed(0)}
                                                            %)
                                                        </span>
                                                    )}
                                                </div>
                                            )}

                                            {/* Item Pricing & Discount Badge */}
                                            <div className="mt-2 flex flex-wrap items-center gap-1.5">
                                                {item.discount_amount &&
                                                item.discount_amount > 0 ? (
                                                    <>
                                                        <span className="text-sm font-black text-brand-900 dark:text-emerald-400">
                                                            Rp{' '}
                                                            {formatRp(
                                                                item.price *
                                                                    item.quantity -
                                                                    item.discount_amount,
                                                            )}
                                                        </span>
                                                        <s className="text-xs font-normal text-stone-400 dark:text-stone-400">
                                                            Rp{' '}
                                                            {formatRp(
                                                                item.price *
                                                                    item.quantity,
                                                            )}
                                                        </s>
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                openItemDiscountModal(
                                                                    item,
                                                                )
                                                            }
                                                            className="flex cursor-pointer items-center gap-1 rounded border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-xs font-bold text-emerald-800 transition hover:bg-emerald-100 active:scale-95 dark:border-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-200 dark:hover:bg-emerald-900"
                                                            title="Ubah diskon item"
                                                        >
                                                            <span>
                                                                Diskon{' '}
                                                                {item.discount_type ===
                                                                'percent'
                                                                    ? `${item.discount_value}%`
                                                                    : ''}{' '}
                                                                (-Rp{' '}
                                                                {formatRp(
                                                                    item.discount_amount,
                                                                )}
                                                                )
                                                            </span>
                                                            <span className="text-[10px] text-emerald-600 dark:text-emerald-300">
                                                                ✎
                                                            </span>
                                                        </button>
                                                    </>
                                                ) : (
                                                    <>
                                                        <span className="text-sm font-black text-brand-900 dark:text-emerald-400">
                                                            Rp{' '}
                                                            {formatRp(
                                                                item.price *
                                                                    item.quantity,
                                                            )}
                                                        </span>
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                openItemDiscountModal(
                                                                    item,
                                                                )
                                                            }
                                                            className="flex cursor-pointer items-center gap-1 rounded border border-dashed border-stone-300 px-2 py-0.5 text-xs font-semibold text-stone-600 transition hover:bg-stone-100 hover:text-brand-800 dark:border-stone-600 dark:bg-stone-800/80 dark:text-stone-300 dark:hover:bg-stone-800 dark:hover:text-white"
                                                            title="Tambah diskon khusus untuk produk ini"
                                                        >
                                                            <Percent className="h-3 w-3 text-brand-600 dark:text-amber-400" />
                                                            <span>
                                                                + Diskon
                                                            </span>
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </div>

                                        {/* Qty Stepper */}
                                        <div className="flex shrink-0 items-center gap-1 rounded-xl border border-stone-200 bg-stone-100 p-1 dark:border-stone-700 dark:bg-stone-900">
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    updateQuantity(item.id, -1)
                                                }
                                                className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg text-stone-700 transition hover:bg-stone-200 hover:text-stone-950 active:scale-95 sm:h-8 sm:w-8 dark:text-stone-200 dark:hover:bg-stone-800 dark:hover:text-white"
                                                aria-label="Kurang satu"
                                            >
                                                <Minus className="h-4 w-4" />
                                            </button>
                                            <span className="w-7 text-center text-sm font-black text-stone-900 dark:text-white">
                                                {item.quantity}
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    updateQuantity(item.id, 1)
                                                }
                                                className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg text-stone-700 transition hover:bg-stone-200 hover:text-stone-950 active:scale-95 sm:h-8 sm:w-8 dark:text-stone-200 dark:hover:bg-stone-800 dark:hover:text-white"
                                                aria-label="Tambah satu"
                                            >
                                                <Plus className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Cart Footer Summary (Sticky Bottom on PC & Tablet - Persis Screenshot Referensi) */}
                        <div className="sticky bottom-0 z-10 shrink-0 space-y-3 border-t border-stone-200 bg-white p-3.5 shadow-[0_-4px_16px_rgba(0,0,0,0.05)] dark:border-stone-800 dark:bg-stone-900">
                            {/* Pengiriman / Ongkos Kirim POS Section */}
                            <div className="space-y-2 rounded-xl border border-stone-200 bg-stone-50 p-2.5 dark:border-stone-700/80 dark:bg-stone-800/60">
                                <div className="flex items-center justify-between">
                                    <label className="flex cursor-pointer items-center gap-2 text-xs font-bold text-stone-800 select-none dark:text-stone-200">
                                        <input
                                            type="checkbox"
                                            checked={isDeliveryOrder}
                                            onChange={(e) =>
                                                setIsDeliveryOrder(
                                                    e.target.checked,
                                                )
                                            }
                                            className="h-4 w-4 cursor-pointer rounded text-brand-700 focus:ring-brand-500 dark:text-emerald-500"
                                        />
                                        <Truck className="h-4 w-4 text-brand-700 dark:text-amber-400" />
                                        <span>Kirim Pesanan (Ongkir)</span>
                                    </label>
                                    {isDeliveryOrder &&
                                        numericShippingCost > 0 && (
                                            <span className="rounded border border-blue-200 bg-blue-50 px-1.5 py-0.5 text-[10px] font-bold text-blue-700 dark:border-blue-800 dark:bg-blue-950/60 dark:text-blue-300">
                                                Rp{' '}
                                                {formatRp(numericShippingCost)}
                                            </span>
                                        )}
                                </div>

                                {isDeliveryOrder && (
                                    <div className="animate-in space-y-2 border-t border-stone-200 pt-1.5 fade-in dark:border-stone-700">
                                        <div>
                                            <label className="text-[11px] font-semibold text-stone-600 dark:text-stone-300">
                                                Nominal Ongkir (Rp):
                                            </label>
                                            <div className="relative mt-0.5">
                                                <span className="absolute top-1/2 left-2.5 -translate-y-1/2 text-xs font-bold text-stone-400">
                                                    Rp
                                                </span>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    value={
                                                        shippingCost === ''
                                                            ? ''
                                                            : shippingCost
                                                    }
                                                    onChange={(e) => {
                                                        const val =
                                                            e.target.value ===
                                                            ''
                                                                ? ''
                                                                : Math.max(
                                                                      0,
                                                                      parseFloat(
                                                                          e
                                                                              .target
                                                                              .value,
                                                                      ) || 0,
                                                                  );
                                                        setShippingCost(val);
                                                    }}
                                                    placeholder="0"
                                                    className="w-full rounded-lg border border-stone-300 bg-white py-1.5 pr-2.5 pl-8 text-xs font-bold text-stone-900 focus:border-brand-600 focus:outline-none dark:border-stone-700 dark:bg-stone-900 dark:text-white dark:focus:border-emerald-500"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="text-[11px] font-semibold text-stone-600 dark:text-stone-300">
                                                Alamat Pengiriman:
                                            </label>
                                            <textarea
                                                rows={2}
                                                value={customerAddress}
                                                onChange={(e) =>
                                                    setCustomerAddress(
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder="Alamat lengkap tujuan kirim..."
                                                className="mt-0.5 w-full resize-none rounded-lg border border-stone-300 bg-white px-2.5 py-1.5 text-xs text-stone-900 focus:border-brand-600 focus:outline-none dark:border-stone-700 dark:bg-stone-900 dark:text-white dark:focus:border-emerald-500"
                                            />
                                        </div>

                                        <div>
                                            <label className="text-[11px] font-semibold text-stone-600 dark:text-stone-300">
                                                Kurir / Ekspedisi (Opsional):
                                            </label>
                                            <input
                                                type="text"
                                                value={shippingCourier}
                                                onChange={(e) =>
                                                    setShippingCourier(
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder="J&T / JNE / SiCepat / Lalamove / Grab..."
                                                className="mt-0.5 w-full rounded-lg border border-stone-300 bg-white px-2.5 py-1.5 text-xs text-stone-900 focus:border-brand-600 focus:outline-none dark:border-stone-700 dark:bg-stone-900 dark:text-white dark:focus:border-emerald-500"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-1.5 text-xs sm:text-sm">
                                <div className="flex justify-between text-stone-600 dark:text-stone-300">
                                    <span className="font-medium text-stone-700 dark:text-stone-300">
                                        Subtotal
                                    </span>
                                    <span className="font-bold text-stone-900 dark:text-white">
                                        Rp {formatRp(grossSubtotal)}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between text-stone-600 dark:text-stone-300">
                                    <div className="flex items-center gap-1.5">
                                        <span className="font-medium text-stone-700 dark:text-stone-300">
                                            Diskon
                                        </span>
                                        {cartDiscountValue > 0 &&
                                            cartDiscountType === 'percent' && (
                                                <span className="py-0.2 rounded border border-emerald-200 bg-emerald-50 px-1.5 text-[10px] font-bold text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                                                    {cartDiscountValue}%
                                                </span>
                                            )}
                                        <button
                                            type="button"
                                            onClick={openCartDiscountModal}
                                            className="cursor-pointer text-xs font-bold text-sky-600 hover:underline dark:text-sky-300"
                                            title="Atur Diskon Transaksi (Nominal / Persentase)"
                                        >
                                            [Ubah]
                                        </button>
                                    </div>
                                    <div className="text-right">
                                        <span className="font-bold text-stone-900 dark:text-stone-200">
                                            -Rp {formatRp(discountAmount)}
                                        </span>
                                        {totalItemDiscounts > 0 &&
                                            cartDiscountAmount > 0 && (
                                                <div className="text-[10px] text-stone-400 dark:text-stone-400">
                                                    Item: -Rp{' '}
                                                    {formatRp(
                                                        totalItemDiscounts,
                                                    )}{' '}
                                                    | Trx: -Rp{' '}
                                                    {formatRp(
                                                        cartDiscountAmount,
                                                    )}
                                                </div>
                                            )}
                                    </div>
                                </div>

                                {isDeliveryOrder && numericShippingCost > 0 && (
                                    <div className="flex items-center justify-between text-stone-600 dark:text-stone-300">
                                        <div className="flex items-center gap-1.5">
                                            <span className="font-medium text-stone-700 dark:text-stone-300">
                                                Ongkos Kirim
                                            </span>
                                            {shippingCourier && (
                                                <span className="py-0.2 rounded border border-blue-200 bg-blue-50 px-1.5 text-[10px] font-bold text-blue-800 dark:border-blue-800 dark:bg-blue-950/60 dark:text-blue-300">
                                                    {shippingCourier}
                                                </span>
                                            )}
                                        </div>
                                        <span className="font-bold text-stone-900 dark:text-stone-200">
                                            Rp {formatRp(numericShippingCost)}
                                        </span>
                                    </div>
                                )}

                                <div className="flex items-baseline justify-between border-t border-stone-200 pt-2 dark:border-stone-800">
                                    <span className="text-sm font-bold tracking-wide text-stone-900 uppercase dark:text-stone-200">
                                        TOTAL
                                    </span>
                                    <span className="text-2xl font-black text-stone-950 dark:text-emerald-400">
                                        Rp {formatRp(totalAmount)}
                                    </span>
                                </div>
                            </div>

                            <button
                                type="button"
                                disabled={cart.length === 0}
                                onClick={openCheckout}
                                className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-[#273a41] px-4 py-3.5 text-sm font-black tracking-wider text-white shadow-md transition-all hover:bg-[#1e2e34] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                <span>BAYAR (F4)</span>
                                <ChevronRight className="h-5 w-5 stroke-[2.8]" />
                            </button>
                        </div>
                    </aside>
                </div>
            )}

            {/* ========================================================================= */}
            {/* VIEW: ANTRIAN PESANAN (HOLD / QUEUE ORDERS)                               */}
            {/* ========================================================================= */}
            <QueueTab
                isActive={activeTab === 'queue'}
                heldOrdersList={heldOrdersList}
                cashierName={cashier.name}
                onBackToCashier={() => setActiveTab('cashier')}
                handleDeleteQueueOrder={handleDeleteQueueOrder}
                handleRestoreQueueOrder={handleRestoreQueueOrder}
                formatRp={formatRp}
            />

            {/* ========================================================================= */}
            {/* VIEW 2: TRANSAKSI (RIWAYAT TRANSAKSI POS DENGAN FILTER TANGGAL)            */}
            {/* ========================================================================= */}
            <TransactionsTab
                isActive={activeTab === 'transactions'}
                isStaffRestricted={isStaffRestricted}
                cashierName={cashier.name}
                historyFilter={historyFilter}
                setHistoryFilter={setHistoryFilter}
                historyStatusFilter={historyStatusFilter}
                setHistoryStatusFilter={setHistoryStatusFilter}
                historyStartDate={historyStartDate}
                setHistoryStartDate={setHistoryStartDate}
                historyEndDate={historyEndDate}
                setHistoryEndDate={setHistoryEndDate}
                historySearch={historySearch}
                setHistorySearch={setHistorySearch}
                recentOrders={recentOrders}
                filteredOrders={filteredOrders}
                historyTotalAmount={historyTotalAmount}
                isLoadingHistory={isLoadingHistory}
                fetchHistoryOrders={fetchHistoryOrders}
                printerForm={printerForm}
                setCompletedReceipt={setCompletedReceipt}
                setIsReceiptModalOpen={setIsReceiptModalOpen}
                handleOpenRefundModal={handleOpenRefundModal}
                formatRp={formatRp}
            />

            {/* ========================================================================= */}
            {/* VIEW 3: INVENTORI (KATALOG & STOK PRODUK RETAIL)                           */}
            {/* ========================================================================= */}
            <InventoryTab
                isActive={activeTab === 'inventory'}
                inventorySearch={inventorySearch}
                setInventorySearch={setInventorySearch}
                inventoryFilter={inventoryFilter}
                setInventoryFilter={setInventoryFilter}
                filteredInventory={filteredInventory}
                allProducts={products}
                formatRp={formatRp}
                onSyncStock={() => pullLatestCatalogData(false)}
                isSyncingStock={isDownloadingCatalog}
                lastStockSync={lastCatalogSync}
            />

            {/* ========================================================================= */}
            {/* VIEW 4: KAS MASUK-KELUAR (ARUS KAS LACI)                                  */}
            {/* ========================================================================= */}
            <CashFlowTab
                isActive={activeTab === 'cash_flow'}
                cashFlowPeriod={cashFlowPeriod}
                setCashFlowPeriod={setCashFlowPeriod}
                cashFlowDate={cashFlowDate}
                setCashFlowDate={setCashFlowDate}
                cashFlowMonth={cashFlowMonth}
                setCashFlowMonth={setCashFlowMonth}
                getLocalDateString={getLocalDateString}
                cashDrawer={cashDrawer}
                isLoadingCashFlow={isLoadingCashFlow}
                flowType={flowType}
                setFlowType={setFlowType}
                flowCategory={flowCategory}
                setFlowCategory={setFlowCategory}
                flowAmount={flowAmount}
                setFlowAmount={setFlowAmount}
                flowTransactionDate={flowTransactionDate}
                setFlowTransactionDate={setFlowTransactionDate}
                flowDescription={flowDescription}
                setFlowDescription={setFlowDescription}
                isSavingCashFlow={isSavingCashFlow}
                handleAddCashFlow={handleAddCashFlow}
                cashFlowsList={cashFlowsList}
                handleDeleteCashFlow={handleDeleteCashFlow}
                formatRp={formatRp}
                isOwner={isOwner}
            />

            {/* ========================================================================= */}
            {/* VIEW 5: LAPORAN PENJUALAN                                                 */}
            {/* ========================================================================= */}
            <ReportsTab
                isActive={activeTab === 'reports'}
                cashier={cashier}
                canAccessProfitLoss={canAccessProfitLoss}
                isStaffRestricted={isStaffRestricted}
                navigateToTab={navigateToTab}
                reportPeriod={reportPeriod}
                setReportPeriod={setReportPeriod}
                reportDate={reportDate}
                setReportDate={setReportDate}
                reportMonth={reportMonth}
                setReportMonth={setReportMonth}
                reportStartDate={reportStartDate}
                setReportStartDate={setReportStartDate}
                reportEndDate={reportEndDate}
                setReportEndDate={setReportEndDate}
                reportStaffId={reportStaffId}
                setReportStaffId={setReportStaffId}
                staff={staff}
                isLoadingReport={isLoadingReport}
                reportData={reportData}
                fetchSalesReport={fetchSalesReport}
                handlePrintSalesReport={handlePrintSalesReport}
                formatRp={formatRp}
            />

            {/* ========================================================================= */}
            {/* VIEW 5B: LAPORAN LABA RUGI (HANYA OWNER & ADMIN)                         */}
            {/* ========================================================================= */}
            <ProfitLossTab
                isActive={activeTab === 'profit_loss'}
                canAccessProfitLoss={canAccessProfitLoss}
                navigateToTab={navigateToTab}
                plPeriod={plPeriod}
                setPlPeriod={setPlPeriod}
                plDate={plDate}
                setPlDate={setPlDate}
                plMonth={plMonth}
                setPlMonth={setPlMonth}
                getLocalDateString={getLocalDateString}
                isLoadingProfitLoss={isLoadingProfitLoss}
                profitLossData={profitLossData}
                fetchProfitLossReport={fetchProfitLossReport}
                handlePrintProfitLossReport={handlePrintProfitLossReport}
                isExportingPlExcel={isExportingPlExcel}
                handleExportProfitLossExcel={handleExportProfitLossExcel}
                selectedPlExpenseCategory={selectedPlExpenseCategory}
                setSelectedPlExpenseCategory={setSelectedPlExpenseCategory}
                expandedPlOrderId={expandedPlOrderId}
                setExpandedPlOrderId={setExpandedPlOrderId}
                formatRp={formatRp}
            />

            {/* ========================================================================= */}
            {/* VIEW 6: PENGATURAN (PRINTER & STRUK, PEMBAYARAN, TEMA, STAF)             */}
            {/* ========================================================================= */}
            <SettingsTab
                isActive={activeTab === 'settings'}
                cashier={cashier}
                settingsSubTab={settingsSubTab}
                setSettingsSubTab={setSettingsSubTab}
                printerForm={printerForm}
                setPrinterForm={setPrinterForm}
                paymentForm={paymentForm}
                setPaymentForm={setPaymentForm}
                gridDensity={gridDensity}
                updateGridDensity={updateGridDensity}
                gridColumns={gridColumns}
                updateGridColumns={updateGridColumns}
                isMobilePos={isMobilePos}
                connectedUsbPrinter={connectedUsbPrinter}
                connectedBtPrinter={connectedBtPrinter}
                openBluetoothScannerModal={openBluetoothScannerModal}
                handleDisconnectBtPrinter={handleDisconnectBtPrinter}
                availableWindowsPrinters={availableWindowsPrinters}
                isLoadingWindowsPrinters={isLoadingWindowsPrinters}
                refreshWindowsPrinters={refreshWindowsPrinters}
                handleSavePrinterSettings={handleSavePrinterSettings}
                handleSavePaymentSettings={handleSavePaymentSettings}
                handleSaveLayoutSettings={handleSaveLayoutSettings}
                isSavingSettings={isSavingSettings}
                handleRunTestPrint={handleRunTestPrint}
                handleResetPrinterDefaults={handleResetPrinterDefaults}
                getSampleTestReceipt={getSampleTestReceipt}
                handlePreviewReceipt={handlePreviewReceipt}
                isBtPrinting={isBtPrinting}
                isOwner={isOwner}
                staff={staff}
                staffSearchQuery={staffSearchQuery}
                setStaffSearchQuery={setStaffSearchQuery}
                staffName={staffName}
                setStaffName={setStaffName}
                staffEmail={staffEmail}
                setStaffEmail={setStaffEmail}
                staffPhone={staffPhone}
                setStaffPhone={setStaffPhone}
                staffRole={staffRole}
                setStaffRole={setStaffRole}
                staffPassword={staffPassword}
                setStaffPassword={setStaffPassword}
                staffPasswordConfirm={staffPasswordConfirm}
                setStaffPasswordConfirm={setStaffPasswordConfirm}
                isAddingStaff={isAddingStaff}
                handleCreateStaff={handleCreateStaff}
                handleDeleteStaff={handleDeleteStaff}
                deletingStaffId={deletingStaffId}
                staffFormError={staffFormError}
                showToast={showToast}
            />

            {/* === MOBILE STICKY BOTTOM CHECKOUT BUTTON (Halaman Produk: Hanya Tampil Tombol Lihat Keranjang Ringkas) === */}
            {activeTab === 'cashier' && cart.length > 0 && (
                <div className="fixed right-0 bottom-0 left-0 z-30 animate-in border-t border-stone-200 bg-white p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] shadow-[0_-8px_24px_rgba(0,0,0,0.12)] duration-200 slide-in-from-bottom md:hidden dark:border-stone-800 dark:bg-stone-900">
                    <button
                        type="button"
                        onClick={() => setIsMobileCartOpen(true)}
                        className="flex w-full cursor-pointer items-center justify-between rounded-2xl bg-[#273a41] px-4 py-3 text-sm font-black tracking-wider text-white shadow-md transition-all hover:bg-[#1e2e34] active:scale-[0.99] dark:bg-brand-700 dark:hover:bg-brand-600"
                    >
                        <div className="flex items-center gap-2">
                            <span className="rounded-lg bg-white/20 px-2 py-0.5 text-xs font-bold text-white">
                                {totalItemsCount} item
                            </span>
                            <span className="text-xs font-extrabold sm:text-sm">
                                LIHAT KERANJANG
                            </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-sm font-black sm:text-base">
                            <span>Rp {formatRp(totalAmount)}</span>
                            <ChevronRight className="h-4 w-4 stroke-[2.8]" />
                        </div>
                    </button>
                </div>
            )}

            {/* === MOBILE CART SLIDE-UP DRAWER === */}
            <MobileCartDrawer
                isOpen={isMobileCartOpen}
                onClose={() => setIsMobileCartOpen(false)}
                totalItemsCount={totalItemsCount}
                cart={cart}
                openSharePreBillModal={openSharePreBillModal}
                openHoldModal={openHoldModal}
                openManualOrderModal={openManualOrderModal}
                openItemDiscountModal={openItemDiscountModal}
                updateQuantity={updateQuantity}
                discountAmount={discountAmount}
                isDeliveryOrder={isDeliveryOrder}
                setIsDeliveryOrder={setIsDeliveryOrder}
                numericShippingCost={numericShippingCost}
                shippingCost={shippingCost}
                setShippingCost={setShippingCost}
                customerAddress={customerAddress}
                setCustomerAddress={setCustomerAddress}
                shippingCourier={shippingCourier}
                setShippingCourier={setShippingCourier}
                grossSubtotal={grossSubtotal}
                cartDiscountValue={cartDiscountValue}
                cartDiscountType={cartDiscountType}
                openCartDiscountModal={openCartDiscountModal}
                totalItemDiscounts={totalItemDiscounts}
                cartDiscountAmount={cartDiscountAmount}
                totalAmount={totalAmount}
                openCheckout={openCheckout}
                formatRp={formatRp}
            />

            {/* === MODAL 1: VARIANT PICKER MODAL (Coffee Beans & Retail) === */}
            <VariantPickerModal
                product={variantPickerProduct}
                onClose={() => setVariantPickerProduct(null)}
                onSelectVariant={addToCart}
                onOpenCalculator={openKgCalculatorModal}
                formatRp={formatRp}
            />

            {/* === MODAL 1B: C.Y.B.R STUDIO RACIK MODAL (KASIR POS) === */}
            <CybrModal
                isOpen={isCybrModalOpen}
                product={cybrProduct}
                onClose={() => setIsCybrModalOpen(false)}
                cybrRatioA={cybrRatioA}
                setCybrRatioA={setCybrRatioA}
                cybrSelectedVariant={cybrSelectedVariant}
                setCybrSelectedVariant={setCybrSelectedVariant}
                availableCybrVariants={availableCybrVariants}
                cybrBeanA={cybrBeanA}
                setCybrBeanA={setCybrBeanA}
                cybrBeanB={cybrBeanB}
                setCybrBeanB={setCybrBeanB}
                availableCybrBeans={availableCybrBeans}
                isSameCybrBean={isSameCybrBean}
                cybrCustomName={cybrCustomName}
                setCybrCustomName={setCybrCustomName}
                cybrCalculatedCostPrice={cybrCalculatedCostPrice}
                cybrCalculatedPrice={cybrCalculatedPrice}
                cybrMarginPct={cybrMarginPct}
                handleAddCybrToCart={handleAddCybrToCart}
                formatRp={formatRp}
            />

            {/* === MODAL 2: CHECKOUT & PAYMENT MODAL === */}
            <CheckoutModal
                isOpen={isCheckoutModalOpen}
                onClose={() => setIsCheckoutModalOpen(false)}
                totalAmount={totalAmount}
                discountAmount={discountAmount}
                numericShippingCost={numericShippingCost}
                paymentForm={paymentForm}
                paymentMethod={paymentMethod}
                setPaymentMethod={setPaymentMethod}
                cashTendered={cashTendered}
                setCashTendered={setCashTendered}
                quickCashOptions={quickCashOptions}
                cashChange={cashChange}
                customerName={customerName}
                setCustomerName={setCustomerName}
                customerPhone={customerPhone}
                setCustomerPhone={setCustomerPhone}
                isDeliveryOrder={isDeliveryOrder}
                setIsDeliveryOrder={setIsDeliveryOrder}
                shippingCost={shippingCost}
                setShippingCost={setShippingCost}
                shippingCourier={shippingCourier}
                setShippingCourier={setShippingCourier}
                customerAddress={customerAddress}
                setCustomerAddress={setCustomerAddress}
                isSubmitting={isSubmitting}
                handleProcessCheckout={handleProcessCheckout}
                formatRp={formatRp}
            />

            {/* === MODAL: REFUND TRANSAKSI === */}
            <RefundModal
                isOpen={isRefundModalOpen}
                order={selectedOrderForRefund}
                onClose={() => {
                    setIsRefundModalOpen(false);
                    setSelectedOrderForRefund(null);
                }}
                refundAmount={refundAmount}
                setRefundAmount={setRefundAmount}
                refundReason={refundReason}
                setRefundReason={setRefundReason}
                isProcessingRefund={isProcessingRefund}
                handleConfirmRefund={handleConfirmRefund}
                formatRp={formatRp}
            />

            {/* === MODAL 3: RECEIPT & SUCCESS / PREVIEW MODAL === */}
            <ReceiptModal
                isOpen={isReceiptModalOpen}
                receipt={completedReceipt}
                onClose={() => {
                    setIsReceiptModalOpen(false);
                    setCompletedReceipt(null);
                }}
                printerForm={printerForm}
                isMobilePos={isMobilePos}
                handleBluetoothPrint={handleBluetoothPrint}
                isBtPrinting={isBtPrinting}
                connectedBtPrinter={connectedBtPrinter}
                openBluetoothScannerModal={openBluetoothScannerModal}
                showToast={showToast}
            />

            {/* === MODAL: PENCARIAN & KONEKSI PRINTER BLUETOOTH (ANDROID APK & WEB BT) === */}
            <BluetoothScannerModal
                isOpen={isBtScannerModalOpen}
                onClose={closeBluetoothScannerModal}
                btStatusMessage={btStatusMessage}
                pendingBtReceipt={pendingBtReceipt}
                completedReceipt={completedReceipt}
                connectedBtPrinter={connectedBtPrinter}
                isBtPrinting={isBtPrinting}
                executeDirectBtPrint={executeDirectBtPrint}
                getSampleTestReceipt={getSampleTestReceipt}
                setPendingBtReceipt={setPendingBtReceipt}
                setBtStatusMessage={setBtStatusMessage}
                handleDisconnectBtPrinter={handleDisconnectBtPrinter}
                btDevices={btDevices}
                isBtScanning={isBtScanning}
                handleStartBtScan={handleStartBtScan}
                connectingBtAddress={connectingBtAddress}
                handleConnectAndroidBtDevice={handleConnectAndroidBtDevice}
                printerForm={printerForm}
            />

            {/* === MODAL: ORDERAN MANUAL (NAMA, HPP, HARGA JUAL) === */}
            <ManualOrderModal
                isOpen={isManualOrderModalOpen}
                onClose={() => setIsManualOrderModalOpen(false)}
                editingManualCartItemId={editingManualCartItemId}
                manualProductName={manualProductName}
                setManualProductName={setManualProductName}
                manualVariantLabel={manualVariantLabel}
                setManualVariantLabel={setManualVariantLabel}
                manualCostPrice={manualCostPrice}
                setManualCostPrice={setManualCostPrice}
                manualPrice={manualPrice}
                setManualPrice={setManualPrice}
                manualQuantity={manualQuantity}
                setManualQuantity={setManualQuantity}
                handleSaveManualItem={handleSaveManualItem}
                formatRp={formatRp}
            />

            {/* === MODAL: KALKULATOR CUSTOM HARGA 1 KG (200 GR x 5) & 500 GR (100 GR x 5) === */}
            <CalculatorModal
                isOpen={isKgCalculatorOpen}
                onClose={() => setIsKgCalculatorOpen(false)}
                calcTargetMode={calcTargetMode}
                switchCalcMode={switchCalcMode}
                products={products}
                kgSelectedProductId={kgSelectedProductId}
                onSelectProduct={handleSelectProductInKgCalc}
                kgCustomProductName={kgCustomProductName}
                setKgCustomProductName={setKgCustomProductName}
                kgPrice200g={kgPrice200g}
                setKgPrice200g={setKgPrice200g}
                kgCostPrice200g={kgCostPrice200g}
                kgMultiplier={kgMultiplier}
                kgDiscountType={kgDiscountType}
                setKgDiscountType={setKgDiscountType}
                kgDiscountValue={kgDiscountValue}
                setKgDiscountValue={setKgDiscountValue}
                isKgCustomPriceOverridden={isKgCustomPriceOverridden}
                setIsKgCustomPriceOverridden={setIsKgCustomPriceOverridden}
                kgCustomFinalPrice={kgCustomFinalPrice}
                setKgCustomFinalPrice={setKgCustomFinalPrice}
                kgQuantity={kgQuantity}
                setKgQuantity={setKgQuantity}
                onAddToCart={handleAddKgToCart}
                formatRp={formatRp}
            />

            {/* === MODAL: SIMPAN PESANAN KE ANTRIAN (HOLD ORDER) === */}
            <HoldOrderModal
                isOpen={isHoldModalOpen}
                onClose={() => setIsHoldModalOpen(false)}
                totalAmount={totalAmount}
                totalItemsCount={totalItemsCount}
                customerName={holdCustomerName}
                setCustomerName={setHoldCustomerName}
                customerPhone={holdCustomerPhone}
                setCustomerPhone={setHoldCustomerPhone}
                notes={holdNotes}
                setNotes={setHoldNotes}
                onSubmit={handleConfirmHoldOrder}
                isSubmitting={isHoldingSubmit}
                formatRp={formatRp}
            />

            {/* === MODAL: BAGIKAN STRUK PESANAN KE WHATSAPP (INVOICE DIGITAL A4 PDF) === */}
            <SharePreBillModal
                isOpen={isSharePreBillModalOpen}
                onClose={() => setIsSharePreBillModalOpen(false)}
                customerPhone={sharePreBillCustomerPhone}
                setCustomerPhone={setSharePreBillCustomerPhone}
                customerName={sharePreBillCustomerName}
                setCustomerName={setSharePreBillCustomerName}
                includeBank={sharePreBillIncludeBank}
                setIncludeBank={setSharePreBillIncludeBank}
                notes={sharePreBillNotes}
                setNotes={setSharePreBillNotes}
                totalAmount={totalAmount}
                formatRp={formatRp}
                currentPreBillData={currentPreBillData}
                generatePreBillWhatsAppText={generatePreBillWhatsAppText}
                onShareWhatsApp={handleShareWhatsAppPreBill}
                onCopy={handleCopyPreBill}
                isCopied={isPreBillCopied}
                onDownloadPdf={handleDownloadA4InvoicePdf}
                onPrint={handlePrintPreBill}
            />

            {/* --- MODAL PENGATURAN DISKON TRANSAKSI (NOMINAL / PERSENTASE) --- */}
            <CartDiscountModal
                isOpen={isCartDiscountModalOpen}
                onClose={() => setIsCartDiscountModalOpen(false)}
                tempDiscountType={tempDiscountType}
                setTempDiscountType={setTempDiscountType}
                tempDiscountValue={tempDiscountValue}
                setTempDiscountValue={setTempDiscountValue}
                netAfterItemDiscounts={netAfterItemDiscounts}
                cartDiscountValue={cartDiscountValue}
                clearCartDiscount={clearCartDiscount}
                applyCartDiscount={applyCartDiscount}
                formatRp={formatRp}
            />

            {/* --- MODAL PENGATURAN DISKON PER-ITEM (NOMINAL / PERSENTASE) --- */}
            <ItemDiscountModal
                item={editingDiscountItem}
                onClose={() => setEditingDiscountItem(null)}
                itemDiscountType={itemDiscountType}
                setItemDiscountType={setItemDiscountType}
                itemDiscountValue={itemDiscountValue}
                setItemDiscountValue={setItemDiscountValue}
                removeItemDiscount={removeItemDiscount}
                saveItemDiscount={saveItemDiscount}
                formatRp={formatRp}
            />

            {/* ========================================================================= */}
            {/* MODAL: MODE OFFLINE & SINKRONISASI DATA                                     */}
            {/* ========================================================================= */}
            <OfflineSyncModal
                isOpen={isOfflineModalOpen}
                onClose={() => setIsOfflineModalOpen(false)}
                isOnline={isOnline}
                manualOffline={manualOffline}
                toggleManualOffline={toggleManualOffline}
                isEffectiveOffline={isEffectiveOffline}
                syncStatusMessage={syncStatusMessage}
                isSyncing={isSyncing}
                products={products}
                categories={categories}
                lastCatalogSync={lastCatalogSync}
                isDownloadingCatalog={isDownloadingCatalog}
                pullLatestCatalogData={pullLatestCatalogData}
                offlineOrders={offlineOrders}
                syncOfflineOrdersToServer={syncOfflineOrdersToServer}
                exportOfflineOrdersToFile={exportOfflineOrdersToFile}
                handleImportOrdersFile={handleImportOrdersFile}
                formatRp={formatRp}
            />

            {/* ========================================================================= */}
            {/* MODAL DIALOG MENGATUR PRINTER & MARGIN STRUK                                */}
            {/* ========================================================================= */}
            <PrinterModal
                isOpen={isPrinterModalOpen}
                onClose={() => setIsPrinterModalOpen(false)}
                printerForm={printerForm}
                setPrinterForm={setPrinterForm}
                handleResetPrinterDefaults={handleResetPrinterDefaults}
                handleRunTestPrint={handleRunTestPrint}
                handleSavePrinterSettings={handleSavePrinterSettings}
                isSavingSettings={isSavingSettings}
            />

            {/* --- FLOATING TOAST NOTIFICATION --- */}
            {feedbackMessage && (
                <div className="fixed bottom-16 left-1/2 z-50 flex -translate-x-1/2 animate-in items-center gap-2 rounded-full border border-brand-800 bg-brand-950 px-4 py-2 text-xs font-semibold text-white shadow-xl fade-in slide-in-from-bottom-2 md:bottom-6">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
                    <span>{feedbackMessage}</span>
                </div>
            )}
        </div>
    );
}

interface ErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
}

class PosErrorBoundary extends React.Component<
    { children: React.ReactNode },
    ErrorBoundaryState
> {
    constructor(props: { children: React.ReactNode }) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error('POS Crash Intercepted by ErrorBoundary:', error, errorInfo);
    }

    handleReset = () => {
        try {
            localStorage.removeItem('sanubari_pos_cached_catalog_v1');
            localStorage.removeItem('pos_cart_items');
            localStorage.removeItem('pos_cart_discount');
            localStorage.removeItem('pos_offline_orders_v1');
            localStorage.removeItem('sanubari_pos_manual_offline_v1');
            if ('caches' in window) {
                caches.keys().then((names) => {
                    names.forEach((name) => caches.delete(name));
                });
            }
            if ('serviceWorker' in navigator) {
                navigator.serviceWorker.getRegistrations().then((registrations) => {
                    for (const registration of registrations) {
                        registration.unregister();
                    }
                });
            }
        } catch {}
        window.location.reload();
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="flex min-h-screen flex-col items-center justify-center bg-stone-950 p-6 text-center text-white">
                    <div className="w-full max-w-md space-y-4 rounded-2xl border border-stone-800 bg-stone-900 p-6 shadow-2xl">
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rose-500/20 text-rose-400">
                            <RotateCcw className="h-6 w-6" />
                        </div>
                        <h2 className="text-lg font-bold text-stone-100">
                            Terjadi Kesalahan Tampilan POS
                        </h2>
                        <p className="text-xs text-stone-400">
                            Sistem mendeteksi kendala pada data cache terminal kasir. Silakan klik tombol di bawah untuk membersihkan cache dan memuat ulang.
                        </p>
                        {this.state.error && (
                            <pre className="overflow-x-auto rounded-lg bg-stone-950 p-2.5 text-left font-mono text-[10px] text-rose-400/80">
                                {this.state.error.message}
                            </pre>
                        )}
                        <div className="flex gap-2 pt-2">
                            <button
                                type="button"
                                onClick={() => window.location.reload()}
                                className="flex-1 cursor-pointer rounded-xl bg-brand-700 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-brand-600"
                            >
                                Muat Ulang
                            </button>
                            <button
                                type="button"
                                onClick={this.handleReset}
                                className="flex-1 cursor-pointer rounded-xl border border-stone-700 bg-stone-800 px-4 py-2.5 text-xs font-bold text-stone-200 transition hover:bg-stone-700"
                            >
                                Bersihkan Cache POS
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default function PosPage(props: PosProps) {
    return (
        <PosErrorBoundary>
            <PosContent {...props} />
        </PosErrorBoundary>
    );
}
