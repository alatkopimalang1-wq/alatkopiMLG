import React, { useState } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { PublicLayout } from '@/layouts/public-layout';
import { BundleCartItemDetails } from '@/components/bundle-cart-item-details';
import { groupOrderItems } from '@/lib/order-bundle-groups';
import { formatVariantLabel } from '@/lib/variant-utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import PasswordInput from '@/components/password-input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import {
    Package,
    MapPin,
    User as UserIcon,
    Shield,
    KeyRound,
    LogOut,
    ExternalLink,
    Printer,
    ShoppingBag,
    CheckCircle2,
    Clock,
    Truck,
    Store,
    AlertCircle,
    ArrowRight,
    MessageCircle,
    Phone,
    Mail,
    Lock,
    Info,
    XCircle,
    X,
} from 'lucide-react';

interface OrderItem {
    id?: number;
    product_name: string;
    variant_label: string;
    grind_option?: string;
    custom_notes?: string;
    quantity: number;
    price: number;
    normal_price?: number;
    subtotal: number;
    is_preorder?: boolean;
    image?: string | null;
}

interface OrderSummary {
    id: number;
    order_number: string;
    created_at: string;
    total_amount: number;
    subtotal: number;
    shipping_cost: number;
    payment_status: string;
    status: string;
    can_cancel?: boolean;
    payment_method: string;
    shipping_courier?: string;
    shipping_service?: string;
    tracking_number?: string;
    customer_name: string;
    customer_address?: string;
    items_count: number;
    items: OrderItem[];
}

interface UserProfile {
    id: number;
    name: string;
    email: string;
    phone?: string;
    address?: string;
    province?: string;
    city?: string;
    district?: string;
    postal_code?: string;
    is_wa_account: boolean;
    has_password?: boolean;
    has_google?: boolean;
}

interface Props {
    user: UserProfile;
    orders: OrderSummary[];
    status?: string;
    defaultTab?: 'orders' | 'address' | 'profile' | 'security';
}

export default function CustomerAccount({
    user,
    orders,
    status,
    defaultTab,
}: Props) {
    const [activeTab, setActiveTab] = useState<
        'orders' | 'address' | 'profile' | 'security'
    >(defaultTab || 'orders');
    const [logoutConfirm, setLogoutConfirm] = useState(false);
    const [cancelTargetOrder, setCancelTargetOrder] =
        useState<OrderSummary | null>(null);
    const [cancelReason, setCancelReason] = useState('');
    const [isCancelling, setIsCancelling] = useState(false);

    const handleCancelOrder = (e: React.FormEvent) => {
        e.preventDefault();
        if (!cancelTargetOrder || isCancelling) return;
        setIsCancelling(true);
        router.post(
            `/pesanan/${cancelTargetOrder.order_number}/batalkan`,
            { reason: cancelReason },
            {
                preserveScroll: true,
                onFinish: () => {
                    setIsCancelling(false);
                    setCancelTargetOrder(null);
                    setCancelReason('');
                },
            },
        );
    };

    // Profile form
    const profileForm = useForm({
        name: user.name || '',
        phone: user.phone || '',
        email: user.email || '',
    });

    const handleProfileSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        profileForm.post('/akun/profile', {
            preserveScroll: true,
        });
    };

    // Address form
    const addressForm = useForm({
        address: user.address || '',
        province: user.province || '',
        city: user.city || '',
        district: user.district || '',
        postal_code: user.postal_code || '',
    });

    const handleAddressSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        addressForm.post('/akun/address', {
            preserveScroll: true,
        });
    };

    // Password form
    const passwordForm = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const handlePasswordSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        passwordForm.post('/akun/password', {
            preserveScroll: true,
            onSuccess: () => passwordForm.reset(),
        });
    };

    const handleLogout = () => {
        router.post('/logout');
    };

    const formatRupiah = (val: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(val);
    };

    const getPaymentBadge = (status: string) => {
        switch (status) {
            case 'paid':
                return {
                    label: 'Lunas',
                    color: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800',
                };
            case 'verifying':
                return {
                    label: 'Cek Verifikasi Bukti',
                    color: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800',
                };
            case 'cancelled':
                return {
                    label: 'Dibatalkan',
                    color: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-800',
                };
            default:
                return {
                    label: 'Menunggu Pembayaran',
                    color: 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/40 dark:text-orange-300 dark:border-orange-800',
                };
        }
    };

    const getOrderStatusBadge = (status: string, courier?: string) => {
        const isPickup = courier && courier.toLowerCase().includes('ambil');
        switch (status) {
            case 'completed':
                return {
                    label: isPickup
                        ? 'Sudah Diambil di Toko'
                        : 'Pesanan Selesai',
                    color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
                };
            case 'ready_for_pickup':
                return {
                    label: 'Siap Diambil di Roastery',
                    color: 'bg-blue-50 text-blue-700 border-blue-200',
                };
            case 'shipped':
                return {
                    label: isPickup ? 'Siap Diambil' : 'Dalam Pengiriman Kurir',
                    color: 'bg-sky-50 text-sky-700 border-sky-200',
                };
            case 'processing':
                return {
                    label: 'Sedang Disiapkan / Roasting',
                    color: 'bg-amber-50 text-amber-700 border-amber-200',
                };
            case 'cancelled':
                return {
                    label: 'Pesanan Dibatalkan',
                    color: 'bg-red-50 text-red-700 border-red-200',
                };
            default:
                return {
                    label: 'Menunggu Konfirmasi',
                    color: 'bg-stone-50 text-stone-700 border-stone-200',
                };
        }
    };

    return (
        <PublicLayout title="Akun Saya">
            <Head title="Akun Saya — Alat Kopi Malang" />

            <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
                {/* Header Sambutan Pelanggan */}
                <div className="relative mb-8 overflow-hidden rounded-3xl bg-gradient-to-br from-brand-950 via-brand-900 to-brand-800 p-6 text-white shadow-xl sm:p-8">
                    <div className="pointer-events-none absolute top-0 right-0 bottom-0 w-1/3 bg-radial from-accent-copper/20 to-transparent" />

                    <div className="relative z-10 flex flex-col justify-between gap-6 md:flex-row md:items-center">
                        <div className="flex items-center gap-4 sm:gap-5">
                            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-brand-700/80 bg-brand-800/80 text-2xl font-black text-accent-copper shadow-inner sm:h-20 sm:w-20">
                                {user.name
                                    ? user.name.charAt(0).toUpperCase()
                                    : 'S'}
                            </div>
                            <div>
                                <div className="flex flex-wrap items-center gap-2.5">
                                    <h1 className="font-serif text-xl font-bold tracking-tight text-white sm:text-2xl">
                                        Halo,{' '}
                                        {user.name || 'Pelanggan Sanubari'}!
                                    </h1>
                                    <span className="rounded-full border border-accent-copper/40 bg-accent-copper/20 px-2.5 py-0.5 text-[11px] font-bold text-accent-copper-light">
                                        Pelanggan Setia
                                    </span>
                                </div>
                                <div className="mt-1.5 flex flex-wrap items-center gap-4 text-xs text-brand-300">
                                    {user.phone && (
                                        <span className="flex items-center gap-1.5">
                                            <Phone className="h-3.5 w-3.5 text-accent-copper" />
                                            +{user.phone}
                                        </span>
                                    )}
                                    {user.email && !user.is_wa_account && (
                                        <span className="flex items-center gap-1.5">
                                            <Mail className="h-3.5 w-3.5 text-accent-copper" />
                                            {user.email}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
                            <button
                                type="button"
                                onClick={() => setActiveTab('security')}
                                className={`inline-flex cursor-pointer items-center gap-2 rounded-xl border px-3.5 py-2.5 text-xs font-bold transition-all active:scale-95 ${
                                    activeTab === 'security'
                                        ? 'border-accent-copper bg-accent-copper text-white shadow-sm'
                                        : 'border-brand-700/60 bg-brand-800 text-brand-200 hover:bg-brand-700 hover:text-white'
                                }`}
                                title="Ubah Kata Sandi"
                            >
                                <KeyRound className="h-4 w-4 text-accent-copper-light" />
                                <span>Ubah Kata Sandi</span>
                            </button>
                            <Link
                                href="/shop"
                                className="inline-flex items-center gap-2 rounded-xl bg-accent-copper px-4 py-2.5 text-xs font-bold text-white shadow-sm transition-all hover:bg-accent-copper/90 active:scale-95"
                            >
                                <ShoppingBag className="h-4 w-4" />
                                Belanja Alat Kopi Lagi
                            </Link>
                            <button
                                type="button"
                                onClick={() => setLogoutConfirm(true)}
                                className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-brand-700/60 bg-brand-800 px-3.5 py-2.5 text-xs font-semibold text-brand-200 transition-all hover:bg-brand-700 hover:text-white active:scale-95"
                                title="Keluar Akun"
                            >
                                <LogOut className="h-4 w-4" />
                                <span className="hidden sm:inline">Keluar</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Notifikasi Status / Pesan Sukses */}
                {status && (
                    <div className="mb-6 flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-800">
                        <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
                        <span>{status}</span>
                    </div>
                )}

                {/* Navigasi Tab Menu Akun */}
                <div className="mb-8 flex scrollbar-none items-center gap-2 overflow-x-auto border-b border-sand-300 pb-1">
                    <button
                        type="button"
                        onClick={() => setActiveTab('orders')}
                        className={`flex cursor-pointer items-center gap-2 rounded-t-xl border-b-2 px-4 py-3 text-sm font-bold whitespace-nowrap transition-all ${
                            activeTab === 'orders'
                                ? 'border-accent-copper bg-white text-brand-950 shadow-xs'
                                : 'border-transparent text-brand-600/70 hover:text-brand-950'
                        }`}
                    >
                        <Package className="h-4 w-4 text-accent-copper" />
                        Riwayat Pesanan
                        <span className="ml-1 rounded-full bg-sand-200 px-2 py-0.5 text-[11px] font-extrabold text-brand-900">
                            {orders.length}
                        </span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveTab('address')}
                        className={`flex cursor-pointer items-center gap-2 rounded-t-xl border-b-2 px-4 py-3 text-sm font-bold whitespace-nowrap transition-all ${
                            activeTab === 'address'
                                ? 'border-accent-copper bg-white text-brand-950 shadow-xs'
                                : 'border-transparent text-brand-600/70 hover:text-brand-950'
                        }`}
                    >
                        <MapPin className="h-4 w-4 text-accent-copper" />
                        Alamat Pengiriman
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveTab('profile')}
                        className={`flex cursor-pointer items-center gap-2 rounded-t-xl border-b-2 px-4 py-3 text-sm font-bold whitespace-nowrap transition-all ${
                            activeTab === 'profile'
                                ? 'border-accent-copper bg-white text-brand-950 shadow-xs'
                                : 'border-transparent text-brand-600/70 hover:text-brand-950'
                        }`}
                    >
                        <UserIcon className="h-4 w-4 text-accent-copper" />
                        Profil & Kontak
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveTab('security')}
                        className={`flex cursor-pointer items-center gap-2 rounded-t-xl border-b-2 px-4 py-3 text-sm font-bold whitespace-nowrap transition-all ${
                            activeTab === 'security'
                                ? 'border-accent-copper bg-white text-brand-950 shadow-xs'
                                : 'border-transparent text-brand-600/70 hover:text-brand-950'
                        }`}
                    >
                        <KeyRound className="h-4 w-4 text-accent-copper" />
                        Ubah Kata Sandi
                    </button>
                </div>

                {/* Konten Tab: 1. Riwayat Pesanan */}
                {activeTab === 'orders' && (
                    <div className="space-y-6">
                        {orders.length === 0 ? (
                            <div className="mx-auto max-w-xl rounded-3xl border border-sand-300 bg-white px-4 py-16 text-center shadow-sm">
                                <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full border border-sand-200 bg-cream-100 text-brand-500">
                                    <ShoppingBag className="h-10 w-10 stroke-[1.5]" />
                                </div>
                                <h3 className="mb-2 font-serif text-lg font-bold text-brand-950">
                                    Belum Ada Riwayat Pesanan
                                </h3>
                                <p className="mx-auto mb-6 max-w-sm text-sm leading-relaxed text-brand-600/80">
                                    Anda belum memiliki transaksi pesanan di
                                    Alat Kopi Malang. Temukan alat kopi
                                    pilihan kami sekarang.
                                </p>
                                <Link
                                    href="/shop"
                                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-950 px-6 py-3 text-sm font-bold text-white shadow-md transition-all hover:bg-brand-900 active:scale-95"
                                >
                                    <span>Mulai Belanja Alat Kopi</span>
                                    <ArrowRight className="h-4 w-4" />
                                </Link>
                            </div>
                        ) : (
                            orders.map((order) => {
                                const payBadge = getPaymentBadge(
                                    order.payment_status,
                                );
                                const statusBadge = getOrderStatusBadge(
                                    order.status,
                                    order.shipping_courier,
                                );
                                const isPickup =
                                    order.shipping_courier &&
                                    order.shipping_courier
                                        .toLowerCase()
                                        .includes('ambil');

                                return (
                                    <div
                                        key={order.id}
                                        className="overflow-hidden rounded-2xl border border-sand-300 bg-white shadow-sm transition-shadow hover:shadow-md"
                                    >
                                        {/* Header Pesanan */}
                                        <div className="bg-sand-50/60 flex flex-wrap items-center justify-between gap-3 border-b border-sand-200 p-4 sm:p-5">
                                            <div className="flex flex-wrap items-center gap-3">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs font-medium text-brand-500">
                                                        No. Pesanan:
                                                    </span>
                                                    <span className="font-mono text-sm font-bold text-brand-950">
                                                        #{order.order_number}
                                                    </span>
                                                </div>
                                                <span className="hidden text-xs text-brand-300 sm:inline">
                                                    •
                                                </span>
                                                <div className="flex items-center gap-1.5 text-xs text-brand-600">
                                                    <Clock className="h-3.5 w-3.5 text-brand-400" />
                                                    <span>
                                                        {order.created_at}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="flex flex-wrap items-center gap-2">
                                                <span
                                                    className={`rounded-full border px-2.5 py-1 text-xs font-bold ${payBadge.color}`}
                                                >
                                                    {payBadge.label}
                                                </span>
                                                <span
                                                    className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${statusBadge.color}`}
                                                >
                                                    {statusBadge.label}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Body Pesanan: Daftar Item */}
                                        <div className="divide-sand-100 divide-y p-4 sm:p-5">
                                            {groupOrderItems(order.items).map((entry) => {
                                                if (entry.type === 'bundle') {
                                                    return (
                                                        <div
                                                            key={entry.key}
                                                            className="space-y-2 py-3 first:pt-0 last:pb-0"
                                                        >
                                                            <div className="flex items-center gap-3">
                                                                {entry.image && (
                                                                    <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-xl border border-sand-200 bg-cream-50">
                                                                        <img
                                                                            src={
                                                                                entry.image.startsWith('http://') ||
                                                                                entry.image.startsWith('https://')
                                                                                    ? entry.image
                                                                                    : `/storage/${entry.image.replace(/^\/?(public\/|storage\/)?/, '')}`
                                                                            }
                                                                            alt={entry.bundleName}
                                                                            className="h-full w-full object-cover"
                                                                        />
                                                                    </div>
                                                                )}
                                                                <h4 className="text-sm font-bold text-brand-950">
                                                                    {entry.bundleName}
                                                                </h4>
                                                            </div>
                                                            <BundleCartItemDetails
                                                                bundleItems={entry.bundleItems}
                                                                packageQty={1}
                                                            />
                                                        </div>
                                                    );
                                                }

                                                const item = entry.item;
                                                const rawImg = item.image;
                                                const imgUrl = rawImg
                                                    ? rawImg.startsWith('http://') ||
                                                      rawImg.startsWith('https://')
                                                        ? rawImg
                                                        : `/storage/${rawImg.replace(/^\/?(public\/|storage\/)?/, '')}`
                                                    : '/brand/logo-circle.png';
                                                return (
                                                    <div
                                                        key={entry.key}
                                                        className="flex items-start justify-between gap-4 py-3 first:pt-0 last:pb-0"
                                                    >
                                                        <div className="flex min-w-0 flex-1 items-start gap-3">
                                                            <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-xl border border-sand-200 bg-cream-50">
                                                                <img
                                                                    src={imgUrl}
                                                                    alt={item.product_name}
                                                                    className="h-full w-full object-cover"
                                                                />
                                                            </div>
                                                            <div className="min-w-0 flex-1 space-y-1">
                                                                <div className="flex flex-wrap items-center gap-2">
                                                                    <h4 className="text-sm leading-snug font-bold text-brand-950">
                                                                        {item.product_name}
                                                                    </h4>
                                                                    {item.is_preorder && (
                                                                        <span className="inline-flex items-center rounded-md border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-bold tracking-wide text-amber-800 uppercase">
                                                                            Pre-Order
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                {(formatVariantLabel(item.variant_label) || item.grind_option) && (
                                                                    <p className="text-xs font-medium text-accent-copper">
                                                                        {formatVariantLabel(item.variant_label)
                                                                            ? `Varian: ${formatVariantLabel(item.variant_label)}${item.grind_option ? ` · ${item.grind_option}` : ''}`
                                                                            : item.grind_option}
                                                                    </p>
                                                                )}
                                                                {item.custom_notes && (
                                                                    <p className="mt-1 rounded-lg border border-amber-200/50 bg-amber-50/70 p-2 text-xs font-medium text-accent-copper">
                                                                        {item.custom_notes}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <div className="shrink-0 text-right">
                                                            <span className="text-xs font-medium text-brand-500">
                                                                {item.quantity}x @{' '}
                                                                {formatRupiah(item.price)}
                                                            </span>
                                                            <div className="text-sm font-extrabold text-brand-950">
                                                                {formatRupiah(item.subtotal)}
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        {/* Footer Pesanan: Pengiriman & Aksi */}
                                        <div className="bg-sand-50/30 flex flex-col justify-between gap-4 border-t border-sand-200 p-4 sm:flex-row sm:items-center sm:p-5">
                                            <div className="space-y-0.5 text-xs text-brand-600">
                                                <div className="flex items-center gap-1.5 font-medium">
                                                    {isPickup ? (
                                                        <>
                                                            <Store className="h-3.5 w-3.5 text-accent-copper" />
                                                            <span>
                                                                Pengambilan:
                                                                Ambil di Toko
                                                                (Bebas Ongkir)
                                                            </span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Truck className="h-3.5 w-3.5 text-accent-copper" />
                                                            <span>
                                                                Kurir:{' '}
                                                                {order.shipping_courier ||
                                                                    'Ekspedisi'}{' '}
                                                                {order.shipping_service
                                                                    ? `(${order.shipping_service})`
                                                                    : ''}
                                                            </span>
                                                        </>
                                                    )}
                                                </div>
                                                {order.tracking_number && (
                                                    <p className="font-mono text-xs font-bold text-brand-800">
                                                        No. Resi:{' '}
                                                        {order.tracking_number}
                                                    </p>
                                                )}
                                            </div>

                                            <div className="flex w-full items-center justify-between gap-3 sm:w-auto sm:justify-end">
                                                <div className="text-right sm:mr-3">
                                                    <span className="block text-[11px] leading-tight text-brand-500">
                                                        Total Tagihan
                                                    </span>
                                                    <span className="font-serif text-base font-black text-brand-950">
                                                        {formatRupiah(
                                                            order.total_amount,
                                                        )}
                                                    </span>
                                                </div>

                                                <div className="flex flex-wrap items-center gap-2">
                                                    {order.can_cancel && (
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                setCancelTargetOrder(
                                                                    order,
                                                                )
                                                            }
                                                            className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-bold text-rose-700 shadow-xs transition-all hover:bg-rose-100 active:scale-95"
                                                            title="Batalkan Pesanan"
                                                        >
                                                            <XCircle className="h-3.5 w-3.5" />
                                                            <span>Batalkan</span>
                                                        </button>
                                                    )}

                                                    <Link
                                                        href={`/pesanan/${order.order_number}`}
                                                        className="inline-flex items-center gap-1.5 rounded-xl bg-brand-900 px-3.5 py-2 text-xs font-bold text-white shadow-xs transition-all hover:bg-brand-800 active:scale-95"
                                                    >
                                                        <span>
                                                            Detail & Status
                                                        </span>
                                                        <ExternalLink className="h-3.5 w-3.5" />
                                                    </Link>

                                                    <Link
                                                        href={`/pesanan/${order.order_number}/invoice`}
                                                        target="_blank"
                                                        className="hover:bg-sand-100 inline-flex items-center gap-1.5 rounded-xl border border-sand-300 bg-white px-3 py-2 text-xs font-semibold text-brand-800 shadow-xs transition-all active:scale-95"
                                                        title="Cetak / Download Invoice PDF"
                                                    >
                                                        <Printer className="h-3.5 w-3.5" />
                                                        <span className="hidden sm:inline">
                                                            Invoice
                                                        </span>
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                )}

                {/* Konten Tab: 2. Alamat Pengiriman */}
                {activeTab === 'address' && (
                    <div className="max-w-2xl rounded-3xl border border-sand-300 bg-white p-6 shadow-sm sm:p-8">
                        <div className="mb-6 flex items-center gap-3 border-b border-sand-200 pb-4">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-accent-copper">
                                <MapPin className="h-5 w-5" />
                            </div>
                            <div>
                                <h3 className="text-base font-bold text-brand-950">
                                    Alamat Pengiriman Utama
                                </h3>
                                <p className="text-xs text-brand-600">
                                    Alamat ini akan otomatis terisi saat Anda
                                    melakukan checkout pesanan berikutnya.
                                </p>
                            </div>
                        </div>

                        <form
                            onSubmit={handleAddressSubmit}
                            className="space-y-5"
                        >
                            <div>
                                <Label
                                    htmlFor="address"
                                    className="mb-1.5 block text-xs font-bold text-brand-900"
                                >
                                    Alamat Lengkap (Jalan, No. Rumah, RT/RW,
                                    Patokan) *
                                </Label>
                                <textarea
                                    id="address"
                                    rows={3}
                                    value={addressForm.data.address}
                                    onChange={(e) =>
                                        addressForm.setData(
                                            'address',
                                            e.target.value,
                                        )
                                    }
                                    placeholder="Contoh: Jl. Ijen No. 12, RT 02/RW 04, Belakang Taman Slamet"
                                    className="w-full rounded-xl border border-sand-300 p-3.5 text-sm text-brand-950 transition-all outline-none placeholder:text-brand-300 focus:border-accent-copper focus:ring-1 focus:ring-accent-copper"
                                    required
                                />
                                {addressForm.errors.address && (
                                    <p className="mt-1 text-xs text-red-600">
                                        {addressForm.errors.address}
                                    </p>
                                )}
                            </div>

                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div>
                                    <Label
                                        htmlFor="province"
                                        className="mb-1.5 block text-xs font-bold text-brand-900"
                                    >
                                        Provinsi
                                    </Label>
                                    <Input
                                        id="province"
                                        value={addressForm.data.province}
                                        onChange={(e) =>
                                            addressForm.setData(
                                                'province',
                                                e.target.value,
                                            )
                                        }
                                        placeholder="Contoh: Jawa Timur"
                                        className="rounded-xl border-sand-300"
                                    />
                                </div>
                                <div>
                                    <Label
                                        htmlFor="city"
                                        className="mb-1.5 block text-xs font-bold text-brand-900"
                                    >
                                        Kota / Kabupaten
                                    </Label>
                                    <Input
                                        id="city"
                                        value={addressForm.data.city}
                                        onChange={(e) =>
                                            addressForm.setData(
                                                'city',
                                                e.target.value,
                                            )
                                        }
                                        placeholder="Contoh: Kota Malang"
                                        className="rounded-xl border-sand-300"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div>
                                    <Label
                                        htmlFor="district"
                                        className="mb-1.5 block text-xs font-bold text-brand-900"
                                    >
                                        Kecamatan
                                    </Label>
                                    <Input
                                        id="district"
                                        value={addressForm.data.district}
                                        onChange={(e) =>
                                            addressForm.setData(
                                                'district',
                                                e.target.value,
                                            )
                                        }
                                        placeholder="Contoh: Lowokwaru"
                                        className="rounded-xl border-sand-300"
                                    />
                                </div>
                                <div>
                                    <Label
                                        htmlFor="postal_code"
                                        className="mb-1.5 block text-xs font-bold text-brand-900"
                                    >
                                        Kode Pos
                                    </Label>
                                    <Input
                                        id="postal_code"
                                        value={addressForm.data.postal_code}
                                        onChange={(e) =>
                                            addressForm.setData(
                                                'postal_code',
                                                e.target.value,
                                            )
                                        }
                                        placeholder="Contoh: 65116"
                                        className="rounded-xl border-sand-300"
                                    />
                                </div>
                            </div>

                            <div className="pt-3">
                                <Button
                                    type="submit"
                                    disabled={addressForm.processing}
                                    className="w-full rounded-xl bg-brand-950 px-6 py-2.5 text-sm font-bold text-white shadow-md hover:bg-brand-900 sm:w-auto"
                                >
                                    {addressForm.processing ? (
                                        <Spinner className="mr-2 h-4 w-4" />
                                    ) : null}
                                    Simpan Alamat Pengiriman
                                </Button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Konten Tab: 3. Profil & Kontak */}
                {activeTab === 'profile' && (
                    <div className="max-w-2xl rounded-3xl border border-sand-300 bg-white p-6 shadow-sm sm:p-8">
                        <div className="mb-6 flex items-center gap-3 border-b border-sand-200 pb-4">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-accent-copper">
                                <UserIcon className="h-5 w-5" />
                            </div>
                            <div>
                                <h3 className="text-base font-bold text-brand-950">
                                    Informasi Profil Akun
                                </h3>
                                <p className="text-xs text-brand-600">
                                    Perbarui nama lengkap dan kontak untuk
                                    kemudahan komunikasi pesanan.
                                </p>
                            </div>
                        </div>

                        <form
                            onSubmit={handleProfileSubmit}
                            className="space-y-5"
                        >
                            <div>
                                <Label
                                    htmlFor="name"
                                    className="mb-1.5 block text-xs font-bold text-brand-900"
                                >
                                    Nama Lengkap *
                                </Label>
                                <Input
                                    id="name"
                                    value={profileForm.data.name}
                                    onChange={(e) =>
                                        profileForm.setData(
                                            'name',
                                            e.target.value,
                                        )
                                    }
                                    placeholder="Masukkan nama lengkap Anda"
                                    className="rounded-xl border-sand-300"
                                    required
                                />
                                {profileForm.errors.name && (
                                    <p className="mt-1 text-xs text-red-600">
                                        {profileForm.errors.name}
                                    </p>
                                )}
                            </div>

                            <div>
                                <Label
                                    htmlFor="phone"
                                    className="mb-1.5 block text-xs font-bold text-brand-900"
                                >
                                    Nomor WhatsApp / HP
                                </Label>
                                <div className="relative">
                                    <Input
                                        id="phone"
                                        value={profileForm.data.phone}
                                        onChange={(e) =>
                                            profileForm.setData(
                                                'phone',
                                                e.target.value,
                                            )
                                        }
                                        placeholder="Contoh: 081234567890"
                                        className="rounded-xl border-sand-300 pl-9"
                                    />
                                    <Phone className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-brand-400" />
                                </div>
                                <p className="mt-1 text-[11px] text-brand-500">
                                    Nomor ini digunakan oleh roastery & kurir
                                    untuk mengonfirmasi status kiriman kopi.
                                </p>
                            </div>

                            <div>
                                <Label
                                    htmlFor="email"
                                    className="mb-1.5 block text-xs font-bold text-brand-900"
                                >
                                    Alamat Email *
                                </Label>
                                <div className="relative">
                                    <Input
                                        id="email"
                                        type="email"
                                        value={profileForm.data.email}
                                        onChange={(e) =>
                                            profileForm.setData(
                                                'email',
                                                e.target.value,
                                            )
                                        }
                                        placeholder="nama@email.com"
                                        className="rounded-xl border-sand-300 pl-9"
                                        required
                                    />
                                    <Mail className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-brand-400" />
                                </div>
                                {profileForm.errors.email && (
                                    <p className="mt-1 text-xs text-red-600">
                                        {profileForm.errors.email}
                                    </p>
                                )}
                            </div>

                            <div className="pt-3">
                                <Button
                                    type="submit"
                                    disabled={profileForm.processing}
                                    className="w-full cursor-pointer rounded-xl bg-brand-950 px-6 py-2.5 text-sm font-bold text-white shadow-md hover:bg-brand-900 sm:w-auto"
                                >
                                    {profileForm.processing ? (
                                        <Spinner className="mr-2 h-4 w-4" />
                                    ) : null}
                                    Simpan Perubahan Profil
                                </Button>
                            </div>
                        </form>

                        {/* Pintasan Ubah Kata Sandi di Halaman Profil */}
                        <div className="bg-sand-50/80 mt-8 flex flex-col items-start justify-between gap-4 rounded-2xl border border-t border-sand-200 p-5 pt-6 sm:flex-row sm:items-center">
                            <div className="flex items-center gap-3.5">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent-copper/10 text-accent-copper">
                                    <KeyRound className="h-5 w-5" />
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-brand-950">
                                        Keamanan & Kata Sandi Akun
                                    </h4>
                                    <p className="mt-0.5 text-xs text-brand-600">
                                        Perbarui kata sandi akun Anda secara
                                        berkala agar akun belanja tetap
                                        terlindungi.
                                    </p>
                                </div>
                            </div>
                            <Button
                                type="button"
                                onClick={() => setActiveTab('security')}
                                className="w-full shrink-0 cursor-pointer rounded-xl bg-brand-950 text-xs font-bold text-white shadow-xs hover:bg-brand-900 sm:w-auto"
                            >
                                Ubah Kata Sandi
                            </Button>
                        </div>
                    </div>
                )}

                {/* Konten Tab: 4. Ubah Kata Sandi (Security) */}
                {activeTab === 'security' && (
                    <div className="max-w-2xl rounded-3xl border border-sand-300 bg-white p-6 shadow-sm sm:p-8">
                        <div className="mb-6 flex items-center gap-3 border-b border-sand-200 pb-4">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent-copper/10 text-accent-copper">
                                <KeyRound className="h-5 w-5" />
                            </div>
                            <div>
                                <h3 className="text-base font-bold text-brand-950">
                                    Ubah Kata Sandi Akun
                                </h3>
                                <p className="text-xs text-brand-600">
                                    Pastikan kata sandi Anda kuat dan tidak
                                    mudah ditebak untuk menjaga keamanan akun
                                    Alat Kopi Malang Anda.
                                </p>
                            </div>
                        </div>

                        {user.is_wa_account ? (
                            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-amber-900">
                                <div className="flex items-start gap-3">
                                    <Info className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
                                    <div>
                                        <h4 className="text-sm font-bold text-amber-950">
                                            Akun Terdaftar melalui WhatsApp
                                        </h4>
                                        <p className="mt-1 text-xs leading-relaxed text-amber-800">
                                            Akun Anda saat ini terhubung
                                            langsung dengan nomor WhatsApp (
                                            {user.phone || 'Nomor WhatsApp'}).
                                            Jika Anda ingin login menggunakan
                                            email & kata sandi, silakan perbarui
                                            email valid Anda di tab Profil &
                                            Kontak terlebih dahulu.
                                        </p>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setActiveTab('profile')
                                            }
                                            className="mt-3 inline-flex cursor-pointer items-center gap-1.5 text-xs font-bold text-amber-900 underline underline-offset-4 hover:text-amber-950"
                                        >
                                            Buka Pengaturan Profil
                                            <ArrowRight className="h-3.5 w-3.5" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <>
                                {user.has_google && (
                                    <div className="mb-6 flex items-start gap-3 rounded-2xl border border-blue-200 bg-blue-50 p-4 text-blue-900">
                                        <Info className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />
                                        <div className="text-xs leading-relaxed">
                                            <p className="mb-0.5 font-bold text-blue-950">
                                                Akun Terhubung dengan Google
                                            </p>
                                            <p className="text-blue-800">
                                                Akun Anda terhubung dengan akun
                                                Google ({user.email}). Anda
                                                dapat membuat kata sandi baru di
                                                bawah ini agar dapat login
                                                langsung menggunakan email dan
                                                kata sandi tanpa Google.
                                            </p>
                                        </div>
                                    </div>
                                )}

                                <form
                                    onSubmit={handlePasswordSubmit}
                                    className="space-y-5"
                                >
                                    {user.has_password !== false && (
                                        <div>
                                            <Label
                                                htmlFor="current_password"
                                                className="mb-1.5 block text-xs font-bold text-brand-900"
                                            >
                                                Kata Sandi Saat Ini *
                                            </Label>
                                            <PasswordInput
                                                id="current_password"
                                                value={
                                                    passwordForm.data
                                                        .current_password
                                                }
                                                onChange={(e) =>
                                                    passwordForm.setData(
                                                        'current_password',
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder="Masukkan kata sandi saat ini"
                                                className="rounded-xl border-sand-300"
                                                required
                                            />
                                            {passwordForm.errors
                                                .current_password && (
                                                <p className="mt-1 text-xs text-red-600">
                                                    {
                                                        passwordForm.errors
                                                            .current_password
                                                    }
                                                </p>
                                            )}
                                        </div>
                                    )}

                                    <div>
                                        <Label
                                            htmlFor="new_password"
                                            className="mb-1.5 block text-xs font-bold text-brand-900"
                                        >
                                            Kata Sandi Baru *
                                        </Label>
                                        <PasswordInput
                                            id="new_password"
                                            value={passwordForm.data.password}
                                            onChange={(e) =>
                                                passwordForm.setData(
                                                    'password',
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="Minimal 8 karakter"
                                            className="rounded-xl border-sand-300"
                                            required
                                        />
                                        {passwordForm.errors.password && (
                                            <p className="mt-1 text-xs text-red-600">
                                                {passwordForm.errors.password}
                                            </p>
                                        )}
                                        <p className="mt-1 text-[11px] text-brand-500">
                                            Gunakan minimal 8 karakter dengan
                                            kombinasi huruf, angka, atau simbol.
                                        </p>
                                    </div>

                                    <div>
                                        <Label
                                            htmlFor="password_confirmation"
                                            className="mb-1.5 block text-xs font-bold text-brand-900"
                                        >
                                            Konfirmasi Kata Sandi Baru *
                                        </Label>
                                        <PasswordInput
                                            id="password_confirmation"
                                            value={
                                                passwordForm.data
                                                    .password_confirmation
                                            }
                                            onChange={(e) =>
                                                passwordForm.setData(
                                                    'password_confirmation',
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="Ketik ulang kata sandi baru Anda"
                                            className="rounded-xl border-sand-300"
                                            required
                                        />
                                        {passwordForm.errors
                                            .password_confirmation && (
                                            <p className="mt-1 text-xs text-red-600">
                                                {
                                                    passwordForm.errors
                                                        .password_confirmation
                                                }
                                            </p>
                                        )}
                                    </div>

                                    <div className="pt-3">
                                        <Button
                                            type="submit"
                                            disabled={passwordForm.processing}
                                            className="w-full cursor-pointer rounded-xl bg-brand-950 px-6 py-2.5 text-sm font-bold text-white shadow-md hover:bg-brand-900 sm:w-auto"
                                        >
                                            {passwordForm.processing ? (
                                                <Spinner className="mr-2 h-4 w-4" />
                                            ) : null}
                                            Simpan Perubahan Kata Sandi
                                        </Button>
                                    </div>
                                </form>
                            </>
                        )}
                    </div>
                )}
            </div>

            {/* Modal Konfirmasi Logout */}
            {logoutConfirm && (
                <div className="fixed inset-0 z-50 flex animate-in items-center justify-center bg-black/60 p-4 backdrop-blur-xs fade-in">
                    <div className="w-full max-w-sm rounded-3xl border border-sand-200 bg-white p-6 shadow-2xl sm:p-7">
                        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-600">
                            <LogOut className="h-6 w-6" />
                        </div>
                        <h4 className="mb-1.5 text-center text-base font-bold text-brand-950">
                            Konfirmasi Keluar Akun
                        </h4>
                        <p className="mb-6 text-center text-xs leading-relaxed text-brand-600">
                            Apakah Anda yakin ingin keluar dari akun Sanubari
                            Roastery Anda?
                        </p>
                        <div className="grid grid-cols-2 gap-3">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setLogoutConfirm(false)}
                                className="rounded-xl border-neutral-800 bg-neutral-900 py-2.5 text-xs font-semibold text-white hover:bg-neutral-800 hover:text-white"
                            >
                                Batal
                            </Button>
                            <Button
                                type="button"
                                onClick={handleLogout}
                                className="rounded-xl bg-red-600 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-red-700"
                            >
                                Ya, Keluar
                            </Button>
                        </div>
                    </div>
                </div>
            )}
            {/* Modal Konfirmasi Batalkan Pesanan */}
            {cancelTargetOrder && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-md overflow-hidden rounded-3xl border border-sand-200 bg-white shadow-2xl">
                        <div className="flex items-center justify-between border-b border-sand-200 bg-rose-50/60 px-6 py-4">
                            <div className="flex items-center gap-2.5">
                                <XCircle className="h-5 w-5 text-rose-600" />
                                <h3 className="text-sm font-extrabold text-brand-950">
                                    Batalkan Pesanan #{cancelTargetOrder.order_number}?
                                </h3>
                            </div>
                            <button
                                type="button"
                                onClick={() => setCancelTargetOrder(null)}
                                className="cursor-pointer rounded-full p-1 text-brand-500 hover:bg-sand-100"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        <form onSubmit={handleCancelOrder} className="space-y-4 p-6">
                            <p className="text-xs leading-relaxed text-brand-700">
                                Apakah Anda yakin ingin membatalkan pesanan{' '}
                                <strong>#{cancelTargetOrder.order_number}</strong>? Pesanan yang dibatalkan tidak dapat dikembalikan.
                            </p>

                            <div className="space-y-1.5">
                                <label className="block text-xs font-semibold text-brand-900">
                                    Alasan Pembatalan (Opsional)
                                </label>
                                <textarea
                                    rows={3}
                                    value={cancelReason}
                                    onChange={(e) => setCancelReason(e.target.value)}
                                    placeholder="Contoh: Salah pilih varian / ubah pesanan..."
                                    className="w-full rounded-xl border border-sand-300 px-3 py-2 text-xs text-brand-950 focus:border-brand-700 focus:outline-none"
                                />
                            </div>

                            <div className="flex items-center justify-end gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setCancelTargetOrder(null)}
                                    className="cursor-pointer rounded-xl border border-sand-300 bg-white px-4 py-2.5 text-xs font-bold text-brand-800 hover:bg-sand-50"
                                >
                                    Kembali
                                </button>
                                <button
                                    type="submit"
                                    disabled={isCancelling}
                                    className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-rose-600 px-4 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-rose-700 disabled:opacity-50"
                                >
                                    <XCircle className="h-4 w-4" />
                                    <span>
                                        {isCancelling ? 'Membatalkan...' : 'Ya, Batalkan'}
                                    </span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </PublicLayout>
    );
}
