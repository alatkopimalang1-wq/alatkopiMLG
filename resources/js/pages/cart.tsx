import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import { getEffectiveVariantStock } from '@/lib/stock';
import {
    ArrowLeft,
    Building2,
    Check,
    CheckCircle2,
    ChevronDown,
    ChevronRight,
    CreditCard,
    ExternalLink,
    Lock,
    MapPin,
    MessageCircle,
    Minus,
    Package,
    Pencil,
    Plus,
    QrCode,
    RefreshCw,
    ShieldCheck,
    ShoppingBag,
    SlidersHorizontal,
    Sparkles,
    Store,
    Trash2,
    Truck,
} from 'lucide-react';
import { PublicLayout } from '@/layouts/public-layout';
import { useCart } from '@/context/cart-context';
import { BundleCartItemDetails } from '@/components/bundle-cart-item-details';
import { formatRupiah } from '@/lib/trans';
import { ShippingMapPicker } from '@/components/shipping-map-picker';
import { getProductContentId, trackInitiateCheckout } from '@/lib/meta-pixel';

export interface BankAccountItem {
    bank_code: string;
    bank_name: string;
    account_number: string;
    account_holder: string;
    branch_info?: string | null;
    bank_logo?: string | null;
    is_active?: boolean;
}

export interface PickupSettingsProps {
    enabled: boolean;
    store_name: string;
    store_address: string;
    store_hours: string;
    notes: string;
    maps_url: string;
}

interface PaymentSettingsProps {
    qris: {
        enabled: boolean;
        merchant_name: string;
        nmid: string;
        image_url: string;
    };
    banks: BankAccountItem[];
    bank_enabled: boolean;
    free_shipping_min: number;
    shipping_flat_rate: number;
    whatsapp: string;
    instructions: string;
}

interface ProvinceItem {
    id: number;
    name: string;
}

interface CityItem {
    id: number;
    province_id: number;
    type: string;
    name: string;
    postal_code: string;
    latitude?: number;
    longitude?: number;
}

interface SubdistrictItem {
    id: number;
    city_id: number;
    name: string;
    latitude?: number;
    longitude?: number;
}

interface CourierRate {
    courier: string;
    courier_code: string;
    service: string;
    description: string;
    cost: number;
    original_cost: number;
    etd: string;
    is_free: boolean;
    badge?: string | null;
}

interface CartPageProps {
    paymentSettings?: PaymentSettingsProps;
    pickupSettings?: PickupSettingsProps;
    deliverySettings?: {
        enabled: boolean;
        gosend_enabled: boolean;
    };
    provinces?: ProvinceItem[];
    initialCities?: CityItem[];
    initialSubdistricts?: SubdistrictItem[];
    origin?: {
        province_id?: number;
        city_id?: number;
        subdistrict_id?: number;
        city: string;
        province: string;
        postal_code: string;
        latitude?: number;
        longitude?: number;
    };
}

export default function CartPage({
    paymentSettings,
    pickupSettings = {
        enabled: true,
        store_name: 'Alat Kopi Malang (Tlogomas, Malang)',
        store_address:
            'Ruko Tlogomas Square Kav. 34, Jl. Raya Tlogomas, Lowokwaru, Kota Malang, Jawa Timur 65144',
        store_hours: 'Buka setiap hari: 09.00 - 23.00 WIB',
        notes: 'Pesanan dapat diambil langsung di kasir Alat Kopi Malang dengan menunjukkan Nomor Pesanan setelah status pesanan Siap.',
        maps_url: 'https://maps.app.goo.gl/PMuxaEtsbEvC4APy7',
    },
    deliverySettings = {
        enabled: true,
        gosend_enabled: true,
    },
    provinces = [],
    initialCities = [],
    initialSubdistricts = [],
    origin = {
        province_id: 18,
        city_id: 391,
        subdistrict_id: 3896,
        city: 'Kota Malang',
        province: 'Jawa Timur',
        postal_code: '65144',
        latitude: -7.9327,
        longitude: 112.6037,
    },
}: CartPageProps) {
    const { reservedStockByVariant = {} } = usePage<{
        reservedStockByVariant?: Record<string, number>;
    }>().props;
    const {
        items,
        itemCount,
        subtotal,
        updateQuantity,
        updateItemDpPercent,
        removeItem,
        clearCart,
    } = useCart();

    // Track Meta Pixel InitiateCheckout on checkout page load
    const hasFiredInitiateCheckout = useRef(false);
    useEffect(() => {
        if (items.length > 0 && !hasFiredInitiateCheckout.current) {
            hasFiredInitiateCheckout.current = true;
            try {
                const contentIds = items
                    .map((i) => getProductContentId(i.product, i.variant))
                    .filter(Boolean);
                trackInitiateCheckout({
                    content_ids: contentIds,
                    content_type: 'product',
                    value: Number(subtotal),
                    currency: 'IDR',
                    num_items: itemCount,
                });
            } catch (e) {
                console.error('Meta Pixel InitiateCheckout error', e);
            }
        }
    }, [items.length, subtotal, itemCount]);

    // Fulfillment method: delivery or store pickup
    const [fulfillmentType, setFulfillmentType] = useState<
        'delivery' | 'pickup'
    >(() => {
        return deliverySettings?.enabled !== false ? 'delivery' : 'pickup';
    });
    const isPickup = fulfillmentType === 'pickup';

    // Customer form state
    const [customerName, setCustomerName] = useState('');
    const [customerPhone, setCustomerPhone] = useState('');
    const [customerEmail, setCustomerEmail] = useState('');
    const [customerAddress, setCustomerAddress] = useState('');
    const [customerNotes, setCustomerNotes] = useState('');

    // Delivery pinpoint coordinates for GoSend / Instant delivery
    const [destLat, setDestLat] = useState<number | null>(null);
    const [destLng, setDestLng] = useState<number | null>(null);
    const [roadDistanceKm, setRoadDistanceKm] = useState<number | null>(null);

    // Location state (Default: Jawa Timur [18] -> Kota Malang [391] -> Lowokwaru [3896])
    const [selectedProvinceId, setSelectedProvinceId] = useState<number>(
        origin?.province_id ?? 18,
    );
    const [citiesList, setCitiesList] = useState<CityItem[]>(initialCities);
    const [selectedCityId, setSelectedCityId] = useState<number>(
        origin?.city_id ?? 391,
    );
    const [subdistrictsList, setSubdistrictsList] =
        useState<SubdistrictItem[]>(initialSubdistricts);
    const [selectedSubdistrictId, setSelectedSubdistrictId] = useState<
        number | null
    >(origin?.subdistrict_id ?? initialSubdistricts[0]?.id ?? 3896);
    const [postalCode, setPostalCode] = useState(
        origin?.postal_code || '65144',
    );
    const [district, setDistrict] = useState(() => {
        const defaultSub = initialSubdistricts.find(
            (s) => s.id === (origin?.subdistrict_id ?? 3896),
        );
        return defaultSub?.name ?? initialSubdistricts[0]?.name ?? 'LOWOKWARU';
    });

    // Couriers state
    const [courierRates, setCourierRates] = useState<CourierRate[]>([]);
    const [selectedCourierIndex, setSelectedCourierIndex] = useState<number>(0);
    const [isLoadingRates, setIsLoadingRates] = useState(false);

    // Payment method state
    const banksList = useMemo(() => {
        return Array.isArray(paymentSettings?.banks)
            ? paymentSettings.banks
            : [];
    }, [paymentSettings?.banks]);

    const [paymentMethod, setPaymentMethod] = useState<
        'qris' | 'bank_transfer' | 'whatsapp'
    >('qris');
    const [selectedBank, setSelectedBank] = useState<string>(() => {
        return banksList[0]?.bank_code || 'bca';
    });

    useEffect(() => {
        if (
            banksList.length > 0 &&
            !banksList.some(
                (b) => b.bank_code.toLowerCase() === selectedBank.toLowerCase(),
            )
        ) {
            setSelectedBank(banksList[0].bank_code);
        }
    }, [banksList]);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    // Calculate total weight in grams
    const totalWeightGrams = useMemo(() => {
        return items.reduce((acc, curr) => {
            const variantWeight = curr.variant?.weight_grams || 200;
            return acc + variantWeight * curr.quantity;
        }, 0);
    }, [items]);

    // Format weight text: e.g. "400g (Dihitung 1 kg)"
    const chargeableWeightKg = Math.max(1, Math.ceil(totalWeightGrams / 1000));

    // When province changes, fetch cities for that province
    useEffect(() => {
        if (!selectedProvinceId) return;

        let isMounted = true;
        const fetchCities = async () => {
            try {
                const res = await fetch(
                    `/api/shipping/cities?province_id=${selectedProvinceId}`,
                );
                const data = await res.json();
                if (isMounted && data.success && data.data.length > 0) {
                    setCitiesList(data.data);
                    setSelectedCityId((prevCityId) => {
                        const existingCity = data.data.find(
                            (c: CityItem) => c.id === prevCityId,
                        );
                        const chosenCity = existingCity || data.data[0];
                        if (chosenCity?.postal_code) {
                            setPostalCode(chosenCity.postal_code);
                        }
                        if (!existingCity) {
                            setSelectedSubdistrictId(null);
                            setDistrict('');
                        }
                        return chosenCity.id;
                    });
                }
            } catch (err) {
                console.error('Error fetching cities', err);
            }
        };

        fetchCities();
        return () => {
            isMounted = false;
        };
    }, [selectedProvinceId]);

    // When city changes, update postal code & fetch subdistricts
    const handleCityChange = (cityId: number) => {
        setSelectedCityId(cityId);
        setSelectedSubdistrictId(null);
        setDistrict('');
        const found = citiesList.find((c) => c.id === cityId);
        if (found && found.postal_code) {
            setPostalCode(found.postal_code);
        }
    };

    useEffect(() => {
        if (!selectedCityId) return;

        let isMounted = true;
        const fetchSubdistricts = async () => {
            try {
                const res = await fetch(
                    `/api/shipping/subdistricts?city_id=${selectedCityId}`,
                );
                const data = await res.json();
                if (isMounted && data.success && Array.isArray(data.data)) {
                    setSubdistrictsList(data.data);
                    if (data.data.length > 0) {
                        setSelectedSubdistrictId((prevSubId) => {
                            const existingSub = data.data.find(
                                (s: SubdistrictItem) => s.id === prevSubId,
                            );
                            const chosenSub = existingSub || data.data[0];
                            setDistrict(chosenSub.name);
                            return chosenSub.id;
                        });
                    } else {
                        setSelectedSubdistrictId(null);
                        setDistrict('');
                    }
                }
            } catch (err) {
                console.error('Error fetching subdistricts', err);
            }
        };

        fetchSubdistricts();
        return () => {
            isMounted = false;
        };
    }, [selectedCityId]);

    // Calculate courier rates automatically
    useEffect(() => {
        if (items.length === 0 || !selectedCityId) {
            setCourierRates([]);
            return;
        }

        let isMounted = true;
        setIsLoadingRates(true);

        const fetchRates = async () => {
            try {
                const res = await fetch('/api/shipping/calculate', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Accept: 'application/json',
                        'X-CSRF-TOKEN':
                            (
                                document.querySelector(
                                    'meta[name="csrf-token"]',
                                ) as HTMLMetaElement
                            )?.content || '',
                    },
                    body: JSON.stringify({
                        destination_city_id: selectedCityId,
                        destination_subdistrict_id: selectedSubdistrictId,
                        destination_postal_code: postalCode,
                        destination_latitude: destLat,
                        destination_longitude: destLng,
                        province_id: selectedProvinceId,
                        weight_grams: totalWeightGrams,
                        subtotal: subtotal,
                    }),
                });

                const data = await res.json();
                if (isMounted && data.success && data.rates) {
                    setCourierRates(data.rates);
                    setSelectedCourierIndex(0);
                }
            } catch (err) {
                console.error('Error calculating rates', err);
            } finally {
                if (isMounted) {
                    setIsLoadingRates(false);
                }
            }
        };

        const timer = setTimeout(fetchRates, 250);
        return () => {
            isMounted = false;
            clearTimeout(timer);
        };
    }, [
        selectedCityId,
        selectedSubdistrictId,
        selectedProvinceId,
        totalWeightGrams,
        subtotal,
        items.length,
        destLat,
        destLng,
        postalCode,
    ]);

    // Active selected courier
    const activeCourier = courierRates[selectedCourierIndex] || null;
    const shippingCost =
        items.length === 0 || isPickup
            ? 0
            : activeCourier
              ? activeCourier.cost
              : 15000;

    // Free shipping threshold
    const freeShippingMin = paymentSettings?.free_shipping_min ?? 250000;
    const isFreeShipping = subtotal >= freeShippingMin;
    const shortageForFreeShipping = Math.max(0, freeShippingMin - subtotal);

    // Pre-order DP calculation (potongan DP hanya untuk produk Pre-Order)
    const { regularSubtotal, preorderFullSubtotal, preorderDpSubtotal } =
        items.reduce(
            (acc, item) => {
                const lineTotal =
                    (Number(item.variant.price) || 0) * item.quantity;
                const isPreorder = Boolean(
                    item.product.is_preorder ||
                        item.product.stock_status === 'pre_order',
                );
                if (isPreorder) {
                    const minDp = item.product.preorder_dp_percent ?? 100;
                    const dpPercent = Math.max(
                        minDp,
                        item.preorderDpPercent ?? minDp,
                    );
                    acc.preorderFullSubtotal += lineTotal;
                    acc.preorderDpSubtotal += Math.round(
                        (lineTotal * dpPercent) / 100,
                    );
                } else {
                    acc.regularSubtotal += lineTotal;
                }
                return acc;
            },
            {
                regularSubtotal: 0,
                preorderFullSubtotal: 0,
                preorderDpSubtotal: 0,
            },
        );
    const payableSubtotal = regularSubtotal + preorderDpSubtotal;
    const hasPreorderDp = items.some((item) => {
        const isPreorder = Boolean(
            item.product.is_preorder ||
                item.product.stock_status === 'pre_order',
        );
        if (!isPreorder) return false;
        const minDp = item.product.preorder_dp_percent ?? 100;
        const chosenDp = Math.max(minDp, item.preorderDpPercent ?? minDp);
        return chosenDp < 100;
    });
    const remainingBalance = Math.max(
        0,
        preorderFullSubtotal - preorderDpSubtotal,
    );

    // Grand total
    const grandTotal = payableSubtotal + shippingCost;

    // Names of selected province and city
    const currentProvince = provinces.find((p) => p.id === selectedProvinceId);
    const currentCity = citiesList.find((c) => c.id === selectedCityId);

    const handleSubmitOrder = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMessage('');

        if (items.length === 0) {
            setErrorMessage('Keranjang Anda masih kosong.');
            return;
        }

        const outOfStockItem = items.find((item) => {
            const isPre = Boolean(
                item.product.is_preorder ||
                    item.product.stock_status === 'pre_order',
            );
            if (isPre) {
                return (
                    item.variant.stock_status === 'out_of_stock' ||
                    item.product.stock_status === 'out_of_stock'
                );
            }
            const vStock = getEffectiveVariantStock(
                item.product,
                item.variant,
                reservedStockByVariant,
            );
            return (
                item.variant.stock_status === 'out_of_stock' ||
                item.product.stock_status === 'out_of_stock' ||
                (vStock !== null && (vStock <= 0 || item.quantity > vStock))
            );
        });
        if (outOfStockItem) {
            const vStock =
                getEffectiveVariantStock(
                    outOfStockItem.product,
                    outOfStockItem.variant,
                    reservedStockByVariant,
                ) ?? 0;
            setErrorMessage(
                vStock <= 0
                    ? `Produk '${outOfStockItem.product.name}' (${outOfStockItem.variant.label}) stoknya sudah habis.`
                    : `Stok '${outOfStockItem.product.name}' (${outOfStockItem.variant.label}) hanya tersisa ${vStock} pcs.`,
            );
            return;
        }

        if (isPickup) {
            if (!customerName.trim() || !customerPhone.trim()) {
                setErrorMessage(
                    'Mohon lengkapi Nama Pengambil dan Nomor WhatsApp aktif.',
                );
                return;
            }
        } else {
            if (
                !customerName.trim() ||
                !customerPhone.trim() ||
                !customerAddress.trim()
            ) {
                setErrorMessage(
                    'Mohon lengkapi Nama Lengkap, Nomor WhatsApp, dan Alamat Pengiriman.',
                );
                return;
            }
        }

        setIsSubmitting(true);

        try {
            const pickupAddrText = `Ambil di Toko: ${pickupSettings.store_name} (${pickupSettings.store_address})`;

            const payload = {
                items: items.flatMap((i) => {
                    if (i.bundleItems && i.bundleItems.length > 0) {
                        return i.bundleItems.map((sub) => ({
                            variant_id: sub.variant_id,
                            quantity: sub.quantity * i.quantity,
                            grind_option: '',
                            custom_notes: `${i.product.name} (${sub.slot_title})`,
                            price: sub.bundle_price,
                            ...(sub.slot_id !== undefined
                                ? { bundle_slot_id: sub.slot_id }
                                : {}),
                            ...(sub.slot_item_id !== null &&
                            sub.slot_item_id !== undefined
                                ? { bundle_slot_item_id: sub.slot_item_id }
                                : {}),
                        }));
                    }

                    const isPreorder = Boolean(
                        i.product.is_preorder ||
                            i.product.stock_status === 'pre_order',
                    );
                    const minDp = i.product.preorder_dp_percent ?? 100;
                    const dpPercent = isPreorder
                        ? Math.max(minDp, i.preorderDpPercent ?? minDp)
                        : undefined;
                    return [
                        {
                            variant_id: i.variant.id,
                            quantity: i.quantity,
                            grind_option: i.grindOption,
                            custom_notes: i.customNotes,
                            price: i.variant.price,
                            ...(dpPercent !== undefined
                                ? { preorder_dp_percent: dpPercent }
                                : {}),
                            ...(i.bundleSlotId !== undefined
                                ? { bundle_slot_id: i.bundleSlotId }
                                : {}),
                            ...(i.bundleSlotItemId !== undefined
                                ? { bundle_slot_item_id: i.bundleSlotItemId }
                                : {}),
                        },
                    ];
                }),
                fulfillment_type: fulfillmentType,
                customer: {
                    name: customerName,
                    phone: customerPhone,
                    email: customerEmail,
                    address: isPickup ? pickupAddrText : customerAddress,
                    notes: customerNotes,
                    province_id: isPickup
                        ? (origin?.province_id ?? 18)
                        : selectedProvinceId,
                    province: isPickup
                        ? 'Jawa Timur'
                        : currentProvince?.name || 'Jawa Timur',
                    city_id: isPickup
                        ? (origin?.city_id ?? 391)
                        : selectedCityId,
                    city: isPickup
                        ? 'Kota Malang'
                        : currentCity
                          ? `${currentCity.type ? currentCity.type + ' ' : ''}${currentCity.name}`.trim()
                          : 'Kota Malang',
                    district: isPickup ? 'Lowokwaru' : district,
                    postal_code: isPickup ? '65144' : postalCode,
                    latitude: isPickup ? null : destLat,
                    longitude: isPickup ? null : destLng,
                },
                shipping: {
                    courier: isPickup
                        ? 'Ambil di Toko'
                        : activeCourier?.courier || 'J&T Express',
                    courier_code: isPickup
                        ? 'pickup'
                        : activeCourier?.courier_code || 'jnt',
                    service: isPickup
                        ? 'Self Pick Up'
                        : activeCourier?.service || 'EZ',
                    cost: isPickup ? 0 : shippingCost,
                    etd: isPickup
                        ? 'Siap Diambil di Roastery'
                        : activeCourier?.etd || '1-2 hari',
                },
                payment_method: paymentMethod,
                payment_channel:
                    paymentMethod === 'bank_transfer'
                        ? selectedBank
                        : paymentMethod === 'qris'
                          ? 'qris'
                          : 'whatsapp',
            };

            const res = await fetch('/checkout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'X-CSRF-TOKEN':
                        (
                            document.querySelector(
                                'meta[name="csrf-token"]',
                            ) as HTMLMetaElement
                        )?.content || '',
                },
                body: JSON.stringify(payload),
            });

            const data = await res.json();

            if (data.success) {
                // Clear the cart on successful checkout
                clearCart();

                // Save recent order to localStorage for live notification center tracking
                try {
                    const existing = JSON.parse(
                        localStorage.getItem('sanubari_recent_orders') || '[]',
                    );
                    const newOrder = {
                        order_number: data.order_number,
                        status: 'pending',
                        status_label: 'Menunggu Pembayaran',
                        payment_method_label:
                            paymentMethod === 'qris'
                                ? 'QRIS Toko'
                                : paymentMethod === 'bank_transfer'
                                  ? 'Transfer Bank'
                                  : 'WhatsApp',
                        payment_status: 'pending',
                        created_at: 'Baru saja',
                        shipping_courier: isPickup
                            ? 'Ambil di Toko'
                            : activeCourier?.courier || 'J&T Express',
                    };
                    const updated = [
                        newOrder,
                        ...existing.filter(
                            (o: any) => o.order_number !== data.order_number,
                        ),
                    ].slice(0, 5);
                    localStorage.setItem(
                        'sanubari_recent_orders',
                        JSON.stringify(updated),
                    );
                } catch (e) {
                    console.error(e);
                }

                if (paymentMethod === 'whatsapp' && data.wa_url) {
                    window.location.href = data.wa_url;
                } else if (data.redirect_url) {
                    window.location.href = data.redirect_url;
                }
            } else {
                setErrorMessage(
                    data.message ||
                        'Gagal memproses pesanan. Silakan periksa kembali data Anda.',
                );
            }
        } catch (err) {
            console.error('Checkout error', err);
            setErrorMessage(
                'Terjadi kesalahan jaringan saat memproses pesanan. Silakan coba kembali.',
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <PublicLayout title="Checkout & Pembayaran">
            <div className="mx-auto max-w-7xl space-y-8 px-4 py-8 pb-32 sm:px-6 md:pb-16 lg:px-8">
                {/* Header */}
                <div className="space-y-2">
                    <Link
                        href="/shop"
                        className="inline-flex items-center gap-1.5 text-xs text-brand-500 transition-colors hover:text-brand-900"
                    >
                        <ArrowLeft className="h-3.5 w-3.5" />
                        <span>Kembali Belanja Kopi</span>
                    </Link>
                    <h1 className="text-2xl font-extrabold text-brand-950 sm:text-3xl">
                        Checkout &amp; Pembayaran
                    </h1>
                </div>

                {items.length === 0 ? (
                    <div className="mx-auto max-w-lg space-y-4 rounded-2xl border border-sand-200 bg-white p-12 text-center shadow-xs">
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-cream-100 text-brand-400">
                            <ShoppingBag className="h-8 w-8" />
                        </div>
                        <h2 className="text-lg font-bold text-brand-950">
                            Keranjang Belanja Anda Kosong
                        </h2>
                        <p className="text-xs leading-relaxed text-brand-500">
                            Pilih biji kopi favorit Anda dari lini Gunung Kawi,
                            Filter Beans, atau blend Espresso kami untuk
                            melanjutkan checkout.
                        </p>
                        <Link
                            href="/shop"
                            className="inline-block rounded-full bg-brand-700 px-6 py-3 text-xs font-bold text-white shadow-sm transition-all hover:bg-brand-800"
                        >
                            Jelajahi Katalog Kopi
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
                        {/* Left: Items List & Cart Breakdown (5 cols) */}
                        <div className="space-y-6 lg:col-span-5">
                            {/* Cart Items Card */}
                            <div className="space-y-4 rounded-2xl border border-sand-200/80 bg-white p-6 shadow-xs">
                                <div className="flex items-center justify-between border-b border-sand-200 pb-3">
                                    <div className="space-y-0.5">
                                        <h2 className="flex items-center gap-2 text-sm font-bold tracking-wider text-brand-950 uppercase">
                                            <ShoppingBag className="h-4 w-4 text-brand-700" />
                                            <span>
                                                Pesanan ({itemCount} item)
                                            </span>
                                        </h2>
                                        <p className="text-[11px] text-brand-500">
                                            Total Berat:{' '}
                                            <strong>
                                                {totalWeightGrams} gram
                                            </strong>{' '}
                                            (Dihitung {chargeableWeightKg} kg)
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={clearCart}
                                        className="cursor-pointer text-xs font-medium text-red-500 hover:text-red-700"
                                    >
                                        Kosongkan
                                    </button>
                                </div>

                                <div className="divide-y divide-sand-200/60">
                                    {items.map((item, idx) => {
                                        const rawImg =
                                            item.variant?.image_url ||
                                            item.variant?.image ||
                                            item.product.images?.[0]?.path;
                                        const img = rawImg
                                            ? rawImg.startsWith('http://') ||
                                              rawImg.startsWith('https://')
                                                ? rawImg
                                                : `/storage/${rawImg.replace(/^\/?(public\/|storage\/)?/, '')}`
                                            : '/brand/logo-circle.png';

                                        if (
                                            item.bundleItems &&
                                            item.bundleItems.length > 0
                                        ) {
                                            return (
                                                <div
                                                    key={`${item.variant.id}-${item.grindOption}-${idx}`}
                                                    className="space-y-2 py-3"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl border border-sand-200 bg-cream-50">
                                                            <img
                                                                src={img}
                                                                alt={item.product.name}
                                                                className="h-full w-full object-cover"
                                                            />
                                                        </div>
                                                        <div className="flex min-w-0 flex-1 items-start justify-between gap-2">
                                                            <h3 className="line-clamp-2 text-xs font-bold text-brand-950 sm:text-sm">
                                                                {item.product.name}
                                                            </h3>
                                                            <div className="flex flex-shrink-0 items-center gap-1">
                                                                <Link
                                                                    href={`/paket-bundling/${item.product.slug}?edit=${encodeURIComponent(item.customNotes || '')}`}
                                                                    className="inline-flex items-center gap-1 rounded-md border border-brand-200 bg-sand-50 px-2 py-0.5 text-[11px] font-bold text-brand-800 transition-colors hover:bg-sand-200/70"
                                                                    title="Edit paket bundling"
                                                                >
                                                                    <Pencil className="h-3 w-3" />
                                                                    <span>Edit</span>
                                                                </Link>
                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        removeItem(
                                                                            item.variant.id,
                                                                            item.grindOption,
                                                                            item.customNotes,
                                                                        )
                                                                    }
                                                                    className="cursor-pointer p-1 text-gray-400 hover:text-red-500"
                                                                    aria-label="Hapus item"
                                                                >
                                                                    <Trash2 className="h-3.5 w-3.5" />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <BundleCartItemDetails
                                                        bundleItems={item.bundleItems}
                                                        packageQty={item.quantity}
                                                    />

                                                    <div className="flex items-center justify-between pt-1">
                                                        <div className="-ml-2 flex scale-90 items-center overflow-hidden rounded-lg border border-sand-200 bg-white">
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    updateQuantity(
                                                                        item.variant.id,
                                                                        item.grindOption,
                                                                        item.quantity - 1,
                                                                        item.customNotes,
                                                                    )
                                                                }
                                                                className="hover:bg-sand-100 cursor-pointer p-1 text-brand-700"
                                                            >
                                                                <Minus className="h-3 w-3" />
                                                            </button>
                                                            <span className="px-2 text-xs font-bold text-brand-950">
                                                                {item.quantity}
                                                            </span>
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    updateQuantity(
                                                                        item.variant.id,
                                                                        item.grindOption,
                                                                        item.quantity + 1,
                                                                        item.customNotes,
                                                                    )
                                                                }
                                                                className="hover:bg-sand-100 cursor-pointer p-1 text-brand-700"
                                                            >
                                                                <Plus className="h-3 w-3" />
                                                            </button>
                                                        </div>
                                                        <div className="text-right">
                                                            {item.variant.original_price &&
                                                                item.variant.original_price >
                                                                    item.variant.price && (
                                                                    <span className="block text-[10px] font-semibold text-rose-500 line-through">
                                                                        {formatRupiah(
                                                                            item.variant.original_price *
                                                                                item.quantity,
                                                                        )}
                                                                    </span>
                                                                )}
                                                            <span className="text-xs font-extrabold text-brand-950 sm:text-sm">
                                                                {formatRupiah(
                                                                    item.variant.price *
                                                                        item.quantity,
                                                                )}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        }

                                        return (
                                            <div
                                                key={`${item.variant.id}-${item.grindOption}-${idx}`}
                                                className="flex gap-3 py-3"
                                            >
                                                <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl border border-sand-200 bg-cream-50">
                                                    <img
                                                        src={img}
                                                        alt={item.product.name}
                                                        className="h-full w-full object-cover"
                                                    />
                                                </div>

                                                <div className="flex min-w-0 flex-1 flex-col justify-between">
                                                    <div className="flex items-start justify-between gap-2">
                                                        <div>
                                                            <h3 className="truncate text-xs font-bold text-brand-950 sm:text-sm">
                                                                {
                                                                    item.product
                                                                        .name
                                                                }
                                                            </h3>
                                                            {item.bundleItems &&
                                                            item.bundleItems
                                                                .length > 0 ? (
                                                                <BundleCartItemDetails
                                                                    bundleItems={
                                                                        item.bundleItems
                                                                    }
                                                                    packageQty={
                                                                        item.quantity
                                                                    }
                                                                />
                                                            ) : (
                                                                <>
                                                                    <p className="text-[11px] font-medium text-accent-copper">
                                                                        {
                                                                            item
                                                                                .variant
                                                                                .label
                                                                        }
                                                                        {item.grindOption &&
                                                                        item
                                                                            .product
                                                                            .series !==
                                                                            'alat-kopi'
                                                                            ? ` · ${item.grindOption}`
                                                                            : ''}
                                                                    </p>
                                                                    {item.customNotes && (
                                                                        <div className="mt-1.5 rounded-lg border border-amber-200/70 bg-amber-50/80 p-2 text-[11px] leading-snug text-brand-900">
                                                                            <div className="flex items-center gap-1 text-[10px] font-bold tracking-wider text-accent-copper uppercase">
                                                                                <SlidersHorizontal className="h-3 w-3" />
                                                                                <span>
                                                                                    Rasio
                                                                                    Racikan
                                                                                    Blend
                                                                                    (C.Y.B.R):
                                                                                </span>
                                                                            </div>
                                                                            <p className="mt-0.5 font-semibold text-brand-950">
                                                                                {
                                                                                    item.customNotes
                                                                                }
                                                                            </p>
                                                                        </div>
                                                                    )}
                                                                </>
                                                            )}
                                                            {(item.product
                                                                .is_preorder ||
                                                                item.product
                                                                    .stock_status ===
                                                                    'pre_order') && (
                                                                <div className="mt-1.5 rounded-lg border border-amber-200 bg-amber-50/80 p-2 text-[11px] text-amber-950">
                                                                    <div className="mb-1 flex items-center justify-between gap-2">
                                                                        <span className="font-bold text-amber-800">
                                                                            Pre-Order
                                                                            ·
                                                                            Pilih
                                                                            DP:
                                                                        </span>
                                                                        <span className="text-[10px] text-amber-700">
                                                                            Min.{' '}
                                                                            {item
                                                                                .product
                                                                                .preorder_dp_percent ??
                                                                                100}
                                                                            %
                                                                        </span>
                                                                    </div>
                                                                    <div className="flex flex-wrap gap-1">
                                                                        {[
                                                                            30,
                                                                            50,
                                                                            70,
                                                                            100,
                                                                        ]
                                                                            .filter(
                                                                                (
                                                                                    pct,
                                                                                ) =>
                                                                                    pct >=
                                                                                    (item
                                                                                        .product
                                                                                        .preorder_dp_percent ??
                                                                                        100),
                                                                            )
                                                                            .map(
                                                                                (
                                                                                    pct,
                                                                                ) => {
                                                                                    const minDp =
                                                                                        item
                                                                                            .product
                                                                                            .preorder_dp_percent ??
                                                                                        100;
                                                                                    const currentDp =
                                                                                        Math.max(
                                                                                            minDp,
                                                                                            item.preorderDpPercent ??
                                                                                                minDp,
                                                                                        );
                                                                                    const isSelected =
                                                                                        currentDp ===
                                                                                        pct;
                                                                                    return (
                                                                                        <button
                                                                                            key={
                                                                                                pct
                                                                                            }
                                                                                            type="button"
                                                                                            onClick={() =>
                                                                                                updateItemDpPercent(
                                                                                                    item
                                                                                                        .variant
                                                                                                        .id,
                                                                                                    item.grindOption,
                                                                                                    pct,
                                                                                                    item.customNotes,
                                                                                                )
                                                                                            }
                                                                                            className={`cursor-pointer rounded-md border px-2 py-0.5 text-[10px] font-bold transition-colors ${
                                                                                                isSelected
                                                                                                    ? 'border-amber-700 bg-amber-600 text-white'
                                                                                                    : 'border-amber-300 bg-white text-amber-900 hover:border-amber-500'
                                                                                            }`}
                                                                                        >
                                                                                            {pct ===
                                                                                            100
                                                                                                ? '100% (Lunas)'
                                                                                                : `DP ${pct}%`}
                                                                                        </button>
                                                                                    );
                                                                                },
                                                                            )}
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="flex flex-shrink-0 items-center gap-1">
                                                            {item.bundleItems &&
                                                                item.bundleItems
                                                                    .length >
                                                                    0 && (
                                                                    <Link
                                                                        href={`/paket-bundling/${item.product.slug}?edit=${encodeURIComponent(item.customNotes || '')}`}
                                                                        className="inline-flex items-center gap-1 rounded-md border border-brand-200 bg-sand-50 px-2 py-0.5 text-[11px] font-bold text-brand-800 transition-colors hover:bg-sand-200/70"
                                                                        title="Edit paket bundling"
                                                                    >
                                                                        <Pencil className="h-3 w-3" />
                                                                        <span>
                                                                            Edit
                                                                        </span>
                                                                    </Link>
                                                                )}
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    removeItem(
                                                                        item
                                                                            .variant
                                                                            .id,
                                                                        item.grindOption,
                                                                        item.customNotes,
                                                                    )
                                                                }
                                                                className="cursor-pointer p-1 text-gray-400 hover:text-red-500"
                                                                aria-label="Hapus item"
                                                            >
                                                                <Trash2 className="h-3.5 w-3.5" />
                                                            </button>
                                                        </div>
                                                    </div>

                                                    <div className="mt-1 flex items-center justify-between">
                                                        <div className="-ml-2 flex scale-90 items-center overflow-hidden rounded-lg border border-sand-200 bg-white">
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    updateQuantity(
                                                                        item
                                                                            .variant
                                                                            .id,
                                                                        item.grindOption,
                                                                        item.quantity -
                                                                            1,
                                                                        item.customNotes,
                                                                    )
                                                                }
                                                                className="hover:bg-sand-100 cursor-pointer p-1 text-brand-700"
                                                            >
                                                                <Minus className="h-3 w-3" />
                                                            </button>
                                                            <span className="px-2 text-xs font-bold text-brand-950">
                                                                {item.quantity}
                                                            </span>
                                                            <button
                                                                type="button"
                                                                disabled={(() => {
                                                                    const effStock =
                                                                        getEffectiveVariantStock(
                                                                            item.product,
                                                                            item.variant,
                                                                            reservedStockByVariant,
                                                                        );
                                                                    return (
                                                                        effStock !==
                                                                            null &&
                                                                        item.quantity >=
                                                                            effStock
                                                                    );
                                                                })()}
                                                                onClick={() =>
                                                                    updateQuantity(
                                                                        item
                                                                            .variant
                                                                            .id,
                                                                        item.grindOption,
                                                                        item.quantity +
                                                                            1,
                                                                        item.customNotes,
                                                                    )
                                                                }
                                                                className="hover:bg-sand-100 cursor-pointer p-1 text-brand-700 disabled:cursor-not-allowed disabled:opacity-40"
                                                            >
                                                                <Plus className="h-3 w-3" />
                                                            </button>
                                                        </div>

                                                        <div className="text-right">
                                                            {(() => {
                                                                const isPre = Boolean(
                                                                    item.product
                                                                        .is_preorder ||
                                                                        item
                                                                            .product
                                                                            .stock_status ===
                                                                            'pre_order',
                                                                );
                                                                const minDp =
                                                                    item.product
                                                                        .preorder_dp_percent ??
                                                                    100;
                                                                const dpPct =
                                                                    isPre
                                                                        ? Math.max(
                                                                              minDp,
                                                                              item.preorderDpPercent ??
                                                                                  minDp,
                                                                          )
                                                                        : 100;
                                                                const lineFull =
                                                                    item.variant
                                                                        .price *
                                                                    item.quantity;
                                                                const linePayable =
                                                                    Math.round(
                                                                        (lineFull *
                                                                            dpPct) /
                                                                            100,
                                                                    );
                                                                return (
                                                                    <>
                                                                        {item.bundleItems &&
                                                                            item.bundleItems
                                                                                .length >
                                                                                0 &&
                                                                            item.variant
                                                                                .original_price &&
                                                                            item.variant
                                                                                .original_price >
                                                                                item.variant
                                                                                    .price && (
                                                                                <span className="block text-[10px] font-semibold text-rose-500 line-through">
                                                                                    {formatRupiah(
                                                                                        item.variant
                                                                                            .original_price *
                                                                                            item.quantity,
                                                                                    )}
                                                                                </span>
                                                                            )}
                                                                        {isPre &&
                                                                            dpPct <
                                                                                100 && (
                                                                                <span className="block text-[10px] font-semibold text-gray-400 line-through">
                                                                                    {formatRupiah(
                                                                                        lineFull,
                                                                                    )}
                                                                                </span>
                                                                            )}
                                                                        <span className="text-xs font-extrabold text-brand-950 sm:text-sm">
                                                                            {formatRupiah(
                                                                                linePayable,
                                                                            )}
                                                                        </span>
                                                                    </>
                                                                );
                                                            })()}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* Right: Address & Automatic Courier Selector (7 cols) */}
                        <div className="space-y-6 lg:col-span-7">
                            <form
                                onSubmit={handleSubmitOrder}
                                className="space-y-6 rounded-2xl border border-sand-200/80 bg-white p-4 shadow-xs sm:p-6"
                            >
                                {errorMessage && (
                                    <div className="rounded-xl border border-red-200 bg-red-50 p-3.5 text-xs font-medium text-red-700">
                                        {errorMessage}
                                    </div>
                                )}

                                {/* FULFILLMENT METHOD SELECTOR */}
                                <div className="space-y-3 border-b border-sand-200 pb-3">
                                    <label className="flex items-center gap-2 text-sm font-bold tracking-wider text-brand-950 uppercase sm:text-xs">
                                        <span>
                                            Metode Pengambilan / Pengiriman
                                            Pesanan
                                        </span>
                                    </label>
                                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                        {/* Option A: Kurir Ekspedisi & Instan */}
                                        <button
                                            type="button"
                                            disabled={
                                                deliverySettings?.enabled ===
                                                false
                                            }
                                            onClick={() =>
                                                setFulfillmentType('delivery')
                                            }
                                            className={`flex cursor-pointer items-start gap-3.5 rounded-2xl border-2 p-4 text-left transition-all sm:rounded-xl sm:p-3.5 ${
                                                deliverySettings?.enabled ===
                                                false
                                                    ? 'bg-sand-50 cursor-not-allowed border-sand-200 opacity-40'
                                                    : fulfillmentType ===
                                                        'delivery'
                                                      ? 'border-brand-700 bg-brand-50/40 shadow-xs'
                                                      : 'border-sand-200 bg-white hover:border-sand-300'
                                            }`}
                                        >
                                            <div
                                                className={`flex-shrink-0 rounded-xl p-2.5 sm:rounded-lg sm:p-2 ${fulfillmentType === 'delivery' ? 'bg-brand-700 text-white' : 'bg-sand-100 text-brand-700'}`}
                                            >
                                                <Truck className="h-5 w-5 sm:h-4 sm:w-4" />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm font-bold text-brand-950 sm:text-xs">
                                                        Kirim via Kurir &amp;
                                                        Instan
                                                    </span>
                                                    {fulfillmentType ===
                                                        'delivery' && (
                                                        <Check className="h-4 w-4 stroke-[3] text-brand-700 sm:h-3.5 sm:w-3.5" />
                                                    )}
                                                </div>
                                                <p className="mt-1 text-xs leading-snug text-brand-600 sm:text-[11px]">
                                                    GoSend Instan (Malang),
                                                    J&amp;T, JNE, SiCepat
                                                    langsung ke alamat Anda.
                                                </p>
                                            </div>
                                        </button>

                                        {/* Option B: Ambil di Toko */}
                                        <button
                                            type="button"
                                            disabled={
                                                pickupSettings?.enabled ===
                                                false
                                            }
                                            onClick={() =>
                                                setFulfillmentType('pickup')
                                            }
                                            className={`flex cursor-pointer items-start gap-3.5 rounded-2xl border-2 p-4 text-left transition-all sm:rounded-xl sm:p-3.5 ${
                                                pickupSettings?.enabled ===
                                                false
                                                    ? 'bg-sand-50 cursor-not-allowed border-sand-200 opacity-40'
                                                    : fulfillmentType ===
                                                        'pickup'
                                                      ? 'border-brand-700 bg-brand-50/40 shadow-xs'
                                                      : 'border-sand-200 bg-white hover:border-sand-300'
                                            }`}
                                        >
                                            <div
                                                className={`flex-shrink-0 rounded-xl p-2.5 sm:rounded-lg sm:p-2 ${fulfillmentType === 'pickup' ? 'bg-brand-700 text-white' : 'bg-sand-100 text-brand-700'}`}
                                            >
                                                <Store className="h-5 w-5 sm:h-4 sm:w-4" />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-sm font-bold text-brand-950 sm:text-xs">
                                                            Ambil di Toko
                                                        </span>
                                                        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800 sm:text-[9px]">
                                                            GRATIS
                                                        </span>
                                                    </div>
                                                    {fulfillmentType ===
                                                        'pickup' && (
                                                        <Check className="h-4 w-4 stroke-[3] text-brand-700 sm:h-3.5 sm:w-3.5" />
                                                    )}
                                                </div>
                                                <p className="mt-1 text-xs leading-snug text-brand-600 sm:text-[11px]">
                                                    Ambil sendiri di bar
                                                    Roastery Sanubari tanpa
                                                    ongkir.
                                                </p>
                                            </div>
                                        </button>
                                    </div>
                                </div>

                                {/* STEP 1: DESTINATION OR PICKUP INFO */}
                                {isPickup ? (
                                    /* In-Store Pickup Details */
                                    <div className="space-y-4">
                                        <h2 className="flex items-center gap-2 text-sm font-bold tracking-wider text-brand-950 uppercase">
                                            <Store className="h-4 w-4 text-brand-700" />
                                            <span>
                                                1. Lokasi Pengambilan Gerai
                                                &amp; Data Pengambil
                                            </span>
                                        </h2>

                                        {/* Store Pickup Address Card */}
                                        <div className="bg-sand-100/70 space-y-2 rounded-xl border border-sand-200/80 p-4 text-xs">
                                            <div className="flex items-start justify-between gap-3">
                                                <div>
                                                    <span className="block text-[10px] font-bold tracking-wider text-accent-copper uppercase">
                                                        Gerai Alat Kopi Malang
                                                    </span>
                                                    <h3 className="mt-0.5 text-sm font-extrabold text-brand-950">
                                                        {
                                                            pickupSettings.store_name
                                                        }
                                                    </h3>
                                                    <p className="mt-1 leading-relaxed text-brand-700">
                                                        {
                                                            pickupSettings.store_address
                                                        }
                                                    </p>
                                                    <p className="mt-1 text-[11px] font-medium text-brand-600">
                                                        🕒{' '}
                                                        {
                                                            pickupSettings.store_hours
                                                        }
                                                    </p>
                                                </div>

                                                {pickupSettings.maps_url && (
                                                    <a
                                                        href={
                                                            pickupSettings.maps_url
                                                        }
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="hover:bg-sand-50 inline-flex flex-shrink-0 items-center gap-1 rounded-lg border border-sand-200 bg-white px-2.5 py-1.5 text-[11px] font-bold text-brand-800 shadow-2xs transition-colors hover:text-brand-950"
                                                    >
                                                        <MapPin className="h-3 w-3 text-accent-copper" />
                                                        <span>Maps</span>
                                                        <ExternalLink className="h-3 w-3" />
                                                    </a>
                                                )}
                                            </div>

                                            <div className="border-t border-sand-200/60 pt-2 text-[11px] text-brand-600">
                                                💡 <strong>Petunjuk:</strong>{' '}
                                                {pickupSettings.notes}
                                            </div>
                                        </div>

                                        {/* Collector Name and WhatsApp */}
                                        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
                                            <div className="space-y-1">
                                                <label className="block text-xs font-semibold text-brand-900">
                                                    Nama Lengkap Pengambil *
                                                </label>
                                                <input
                                                    type="text"
                                                    required
                                                    value={customerName}
                                                    onChange={(e) =>
                                                        setCustomerName(
                                                            e.target.value,
                                                        )
                                                    }
                                                    placeholder="Contoh: Dimas Aditya"
                                                    className="w-full rounded-xl border border-sand-200 bg-cream-50 px-3.5 py-2.5 text-xs text-brand-950 transition-colors focus:border-brand-700 focus:bg-white focus:outline-hidden sm:text-sm"
                                                />
                                            </div>

                                            <div className="space-y-1">
                                                <label className="block text-xs font-semibold text-brand-900">
                                                    Nomor WhatsApp / HP Aktif *
                                                </label>
                                                <input
                                                    type="tel"
                                                    required
                                                    value={customerPhone}
                                                    onChange={(e) =>
                                                        setCustomerPhone(
                                                            e.target.value,
                                                        )
                                                    }
                                                    placeholder="081234567890"
                                                    className="w-full rounded-xl border border-sand-200 bg-cream-50 px-3.5 py-2.5 text-xs text-brand-950 transition-colors focus:border-brand-700 focus:bg-white focus:outline-hidden sm:text-sm"
                                                />
                                            </div>
                                        </div>

                                        {/* Pickup Notes */}
                                        <div className="space-y-1">
                                            <label className="block text-xs font-semibold text-brand-900">
                                                Perkiraan Waktu / Catatan
                                                Pengambilan (Opsional)
                                            </label>
                                            <input
                                                type="text"
                                                value={customerNotes}
                                                onChange={(e) =>
                                                    setCustomerNotes(
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder="Contoh: Rencana diambil hari ini jam 16:30 / Diambil driver ojek online"
                                                className="w-full rounded-xl border border-sand-200 bg-cream-50 px-3.5 py-2.5 text-xs text-brand-950 focus:border-brand-700 focus:bg-white focus:outline-hidden sm:text-sm"
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    /* Delivery Form (Full Address) */
                                    <div className="space-y-4">
                                        <h2 className="flex items-center gap-2 border-b border-sand-200 pb-2 text-sm font-bold tracking-wider text-brand-950 uppercase">
                                            <MapPin className="h-4 w-4 text-brand-700" />
                                            <span>
                                                1. Tujuan Pengiriman &amp;
                                                Penerima
                                            </span>
                                        </h2>

                                        {/* Customer Contact Inputs */}
                                        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
                                            <div className="space-y-1">
                                                <label className="block text-xs font-semibold text-brand-900">
                                                    Nama Lengkap Penerima *
                                                </label>
                                                <input
                                                    type="text"
                                                    required
                                                    value={customerName}
                                                    onChange={(e) =>
                                                        setCustomerName(
                                                            e.target.value,
                                                        )
                                                    }
                                                    placeholder="Budi Santoso"
                                                    className="w-full rounded-xl border border-sand-200 bg-cream-50 px-3.5 py-2.5 text-xs text-brand-950 transition-colors focus:border-brand-700 focus:bg-white focus:outline-hidden sm:text-sm"
                                                />
                                            </div>

                                            <div className="space-y-1">
                                                <label className="block text-xs font-semibold text-brand-900">
                                                    Nomor WhatsApp / HP Aktif *
                                                </label>
                                                <input
                                                    type="tel"
                                                    required
                                                    value={customerPhone}
                                                    onChange={(e) =>
                                                        setCustomerPhone(
                                                            e.target.value,
                                                        )
                                                    }
                                                    placeholder="081234567890"
                                                    className="w-full rounded-xl border border-sand-200 bg-cream-50 px-3.5 py-2.5 text-xs text-brand-950 transition-colors focus:border-brand-700 focus:bg-white focus:outline-hidden sm:text-sm"
                                                />
                                            </div>
                                        </div>

                                        {/* Province and City Dropdown */}
                                        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
                                            <div className="space-y-1">
                                                <label className="block text-xs font-semibold text-brand-900">
                                                    Provinsi Tujuan *
                                                </label>
                                                <div className="relative">
                                                    <select
                                                        value={
                                                            selectedProvinceId
                                                        }
                                                        onChange={(e) => {
                                                            setSelectedProvinceId(
                                                                Number(
                                                                    e.target
                                                                        .value,
                                                                ),
                                                            );
                                                            setSelectedSubdistrictId(null);
                                                            setDistrict('');
                                                        }}
                                                        className="w-full cursor-pointer appearance-none rounded-xl border border-sand-200 bg-cream-50 px-3.5 py-2.5 pr-8 text-xs text-brand-950 focus:border-brand-700 focus:bg-white focus:outline-hidden sm:text-sm"
                                                    >
                                                        {provinces.map(
                                                            (prov) => (
                                                                <option
                                                                    key={
                                                                        prov.id
                                                                    }
                                                                    value={
                                                                        prov.id
                                                                    }
                                                                >
                                                                    {prov.name}
                                                                </option>
                                                            ),
                                                        )}
                                                    </select>
                                                    <ChevronDown className="pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-brand-400" />
                                                </div>
                                            </div>

                                            <div className="space-y-1">
                                                <label className="block text-xs font-semibold text-brand-900">
                                                    Kota / Kabupaten Tujuan *
                                                </label>
                                                <div className="relative">
                                                    <select
                                                        value={selectedCityId}
                                                        onChange={(e) =>
                                                            handleCityChange(
                                                                Number(
                                                                    e.target
                                                                        .value,
                                                                ),
                                                            )
                                                        }
                                                        className="w-full cursor-pointer appearance-none rounded-xl border border-sand-200 bg-cream-50 px-3.5 py-2.5 pr-8 text-xs text-brand-950 focus:border-brand-700 focus:bg-white focus:outline-hidden sm:text-sm"
                                                    >
                                                        {citiesList.map(
                                                            (city) => (
                                                                <option
                                                                    key={
                                                                        city.id
                                                                    }
                                                                    value={
                                                                        city.id
                                                                    }
                                                                >
                                                                    {city.type
                                                                        ? `${city.type} ${city.name}`
                                                                        : city.name}
                                                                </option>
                                                            ),
                                                        )}
                                                    </select>
                                                    <ChevronDown className="pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-brand-400" />
                                                </div>
                                            </div>
                                        </div>

                                        {/* District and Postal Code */}
                                        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-3">
                                            <div className="space-y-1 sm:col-span-2">
                                                <label className="block text-xs font-semibold text-brand-900">
                                                    Kecamatan{' '}
                                                    {subdistrictsList.length > 0
                                                        ? '*'
                                                        : '(Opsional)'}
                                                </label>
                                                {subdistrictsList.length > 0 ? (
                                                    <div className="relative">
                                                        <select
                                                            value={
                                                                selectedSubdistrictId ??
                                                                ''
                                                            }
                                                            onChange={(e) => {
                                                                const subId =
                                                                    Number(
                                                                        e.target
                                                                            .value,
                                                                    );
                                                                setSelectedSubdistrictId(
                                                                    subId,
                                                                );
                                                                const subObj =
                                                                    subdistrictsList.find(
                                                                        (s) =>
                                                                            s.id ===
                                                                            subId,
                                                                    );
                                                                if (subObj) {
                                                                    setDistrict(
                                                                        subObj.name,
                                                                    );
                                                                }
                                                            }}
                                                            className="w-full cursor-pointer appearance-none rounded-xl border border-sand-200 bg-cream-50 px-3.5 py-2.5 pr-8 text-xs text-brand-950 focus:border-brand-700 focus:bg-white focus:outline-hidden sm:text-sm"
                                                        >
                                                            {subdistrictsList.map(
                                                                (sub) => (
                                                                    <option
                                                                        key={
                                                                            sub.id
                                                                        }
                                                                        value={
                                                                            sub.id
                                                                        }
                                                                    >
                                                                        Kec.{' '}
                                                                        {
                                                                            sub.name
                                                                        }
                                                                    </option>
                                                                ),
                                                            )}
                                                        </select>
                                                        <ChevronDown className="pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-brand-400" />
                                                    </div>
                                                ) : (
                                                    <input
                                                        type="text"
                                                        value={district}
                                                        onChange={(e) =>
                                                            setDistrict(
                                                                e.target.value,
                                                            )
                                                        }
                                                        placeholder="Contoh: Lowokwaru / Klojen"
                                                        className="w-full rounded-xl border border-sand-200 bg-cream-50 px-3.5 py-2.5 text-xs text-brand-950 focus:border-brand-700 focus:bg-white focus:outline-hidden sm:text-sm"
                                                    />
                                                )}
                                            </div>

                                            <div className="space-y-1">
                                                <label className="block text-xs font-semibold text-brand-900">
                                                    Kode Pos
                                                </label>
                                                <input
                                                    type="text"
                                                    value={postalCode}
                                                    onChange={(e) =>
                                                        setPostalCode(
                                                            e.target.value,
                                                        )
                                                    }
                                                    placeholder="65144"
                                                    className="w-full rounded-xl border border-sand-200 bg-cream-50 px-3.5 py-2.5 text-xs text-brand-950 focus:border-brand-700 focus:bg-white focus:outline-hidden sm:text-sm"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-1">
                                            <label className="block text-xs font-semibold text-brand-900">
                                                Alamat Lengkap (Jalan, Nomor
                                                Rumah, RT/RW, Patokan) *
                                            </label>
                                            <textarea
                                                required
                                                rows={2}
                                                value={customerAddress}
                                                onChange={(e) =>
                                                    setCustomerAddress(
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder="Contoh: Jl. Ijen No. 12, RT 02 / RW 05, Kel. Oro-oro Dowo"
                                                className="w-full rounded-xl border border-sand-200 bg-cream-50 px-3.5 py-2.5 text-xs text-brand-950 focus:border-brand-700 focus:bg-white focus:outline-hidden sm:text-sm"
                                            />
                                        </div>

                                        {/* Titik Lokasi Peta Pinpoint (OpenStreetMap / Leaflet) untuk GoSend Instan */}
                                        <ShippingMapPicker
                                            originLat={
                                                origin?.latitude ?? -7.9327
                                            }
                                            originLng={
                                                origin?.longitude ?? 112.6037
                                            }
                                            originName="Alat Kopi Malang, Tlogomas"
                                            latitude={destLat}
                                            longitude={destLng}
                                            cityName={
                                                currentCity?.name ||
                                                'Kota Malang'
                                            }
                                            districtName={
                                                district ||
                                                subdistrictsList.find(
                                                    (s) =>
                                                        s.id ===
                                                        selectedSubdistrictId,
                                                )?.name ||
                                                ''
                                            }
                                            provinceName={
                                                currentProvince?.name ||
                                                'Jawa Timur'
                                            }
                                            targetLat={
                                                subdistrictsList.find(
                                                    (s) =>
                                                        s.id ===
                                                        selectedSubdistrictId,
                                                )?.latitude ??
                                                currentCity?.latitude ??
                                                null
                                            }
                                            targetLng={
                                                subdistrictsList.find(
                                                    (s) =>
                                                        s.id ===
                                                        selectedSubdistrictId,
                                                )?.longitude ??
                                                currentCity?.longitude ??
                                                null
                                            }
                                            onAddressSelect={(resolved) => {
                                                if (!address) {
                                                    setAddress(resolved);
                                                }
                                            }}
                                            onChange={(lat, lng, dist) => {
                                                setDestLat(lat);
                                                setDestLng(lng);
                                                setRoadDistanceKm(dist);
                                            }}
                                        />
                                    </div>
                                )}

                                {/* STEP 2: COURIER SELECTION (Khusus Pengiriman Ekspedisi) */}
                                {!isPickup && (
                                    <div className="space-y-3 border-t border-sand-200 pt-4">
                                        <div className="flex flex-wrap items-center justify-between gap-2">
                                            <div className="flex items-center gap-2">
                                                <label className="flex items-center gap-2 text-sm font-bold tracking-wider text-brand-950 uppercase sm:text-xs">
                                                    <Truck className="h-5 w-5 text-brand-700 sm:h-4 sm:w-4" />
                                                    <span>
                                                        2. Pilih Layanan Kurir
                                                        Ekspedisi
                                                    </span>
                                                </label>
                                                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200/90 bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800">
                                                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-600"></span>
                                                    <span>Biteship Live Gateway · Asal: {origin.city}</span>
                                                </span>
                                            </div>
                                            {isLoadingRates && (
                                                <span className="flex animate-pulse items-center gap-1.5 text-xs text-brand-500 sm:text-[11px]">
                                                    <RefreshCw className="h-3.5 w-3.5 animate-spin text-brand-700" />
                                                    <span>
                                                        Menghitung tarif kurir...
                                                    </span>
                                                </span>
                                            )}
                                        </div>

                                        {/* Courier Cards Grid */}
                                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-2.5">
                                            {courierRates.map((rate, idx) => {
                                                const isSelected =
                                                    selectedCourierIndex ===
                                                    idx;
                                                return (
                                                    <div
                                                        key={`${rate.courier_code}-${rate.service}-${idx}`}
                                                        onClick={() =>
                                                            setSelectedCourierIndex(
                                                                idx,
                                                            )
                                                        }
                                                        className={`relative flex cursor-pointer flex-col justify-between gap-2.5 rounded-2xl border-2 p-4 transition-all sm:gap-2 sm:rounded-xl sm:p-3.5 ${
                                                            isSelected
                                                                ? 'border-brand-700 bg-brand-50/40 shadow-xs'
                                                                : 'border-sand-200 bg-white hover:border-sand-300'
                                                        }`}
                                                    >
                                                        <div className="flex items-start justify-between gap-2">
                                                            <div>
                                                                <div className="flex flex-wrap items-center gap-1.5 sm:gap-1">
                                                                    <span className="text-sm font-bold text-brand-950 sm:text-xs">
                                                                        {
                                                                            rate.courier
                                                                        }
                                                                    </span>
                                                                    <span className="rounded bg-sand-200/80 px-2 py-0.5 text-[11px] font-bold text-brand-800 sm:text-[10px]">
                                                                        {
                                                                            rate.service
                                                                        }
                                                                    </span>
                                                                    <span className="rounded bg-emerald-100/90 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                                                                        Biteship Live
                                                                    </span>
                                                                </div>
                                                                <p className="mt-1 text-xs text-brand-500 sm:mt-0.5 sm:text-[11px]">
                                                                    Estimasi:{' '}
                                                                    <strong className="text-brand-800">
                                                                        {
                                                                            rate.etd
                                                                        }
                                                                    </strong>
                                                                </p>
                                                            </div>

                                                            <div
                                                                className={`mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border-2 sm:h-4 sm:w-4 ${
                                                                    isSelected
                                                                        ? 'border-brand-700 bg-brand-700 text-white'
                                                                        : 'border-sand-300 bg-white'
                                                                }`}
                                                            >
                                                                {isSelected && (
                                                                    <Check className="h-3 w-3 stroke-[3] sm:h-2.5 sm:w-2.5" />
                                                                )}
                                                            </div>
                                                        </div>

                                                        <div className="border-sand-100 flex items-center justify-between border-t pt-2 sm:pt-1">
                                                            {rate.badge && (
                                                                <span
                                                                    className={`rounded-full px-2 py-0.5 text-xs font-bold sm:text-[10px] ${
                                                                        rate.is_free
                                                                            ? 'bg-emerald-100 text-emerald-800'
                                                                            : rate.badge.includes('Kargo')
                                                                              ? 'border border-blue-200/80 bg-blue-50 text-blue-800'
                                                                              : 'border border-amber-200/60 bg-amber-100 text-amber-900'
                                                                    }`}
                                                                >
                                                                    {rate.badge}
                                                                </span>
                                                            )}
                                                            <div className="ml-auto text-right">
                                                                {rate.is_free ? (
                                                                    <div className="flex items-center gap-2 sm:gap-1.5">
                                                                        <span className="text-xs text-gray-400 line-through sm:text-[10px]">
                                                                            {formatRupiah(
                                                                                rate.original_cost,
                                                                            )}
                                                                        </span>
                                                                        <span className="text-sm font-black text-emerald-700 sm:text-xs">
                                                                            GRATIS
                                                                        </span>
                                                                    </div>
                                                                ) : (
                                                                    <span className="text-sm font-black text-brand-950 sm:text-xs">
                                                                        {formatRupiah(
                                                                            rate.cost,
                                                                        )}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                {/* PAYMENT METHOD SELECTION */}
                                <div className="space-y-3 border-t border-sand-200 pt-4">
                                    <label className="block text-sm font-bold tracking-wider text-brand-950 uppercase sm:text-xs">
                                        {isPickup
                                            ? '2. Pilih Metode Pembayaran'
                                            : '3. Pilih Metode Pembayaran'}
                                    </label>

                                    {/* Option 1: QRIS Toko Resmi */}
                                    <div
                                        onClick={() => setPaymentMethod('qris')}
                                        className={`relative cursor-pointer rounded-2xl border-2 p-4 transition-all sm:rounded-xl sm:p-3.5 ${
                                            paymentMethod === 'qris'
                                                ? 'border-brand-700 bg-brand-50/40 shadow-xs'
                                                : 'border-sand-200 bg-white hover:border-sand-300'
                                        }`}
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex items-start gap-3.5 sm:gap-3">
                                                <div
                                                    className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl sm:h-8 sm:w-8 sm:rounded-lg ${
                                                        paymentMethod === 'qris'
                                                            ? 'bg-brand-700 text-white'
                                                            : 'bg-sand-100 text-brand-700'
                                                    }`}
                                                >
                                                    <QrCode className="h-5 w-5 sm:h-4 sm:w-4" />
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-sm font-bold text-brand-950 sm:text-sm">
                                                            QRIS Toko Resmi
                                                            (Instan)
                                                        </span>
                                                        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800 sm:text-[9px]">
                                                            Rekomendasi
                                                        </span>
                                                    </div>
                                                    <p className="mt-1 text-xs leading-snug text-brand-600 sm:mt-0.5 sm:text-[11px]">
                                                        Bebas admin via GoPay,
                                                        OVO, DANA, ShopeePay,
                                                        BCA Mobile, Livin',
                                                        BRImo.
                                                    </p>
                                                </div>
                                            </div>
                                            <div
                                                className={`mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border-2 sm:h-4 sm:w-4 ${
                                                    paymentMethod === 'qris'
                                                        ? 'border-brand-700 bg-brand-700 text-white'
                                                        : 'border-sand-300 bg-white'
                                                }`}
                                            >
                                                {paymentMethod === 'qris' && (
                                                    <Check className="h-3 w-3 stroke-[3] sm:h-2.5 sm:w-2.5" />
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Option 2: Transfer Bank */}
                                    <div
                                        onClick={() =>
                                            setPaymentMethod('bank_transfer')
                                        }
                                        className={`relative cursor-pointer rounded-2xl border-2 p-4 transition-all sm:rounded-xl sm:p-3.5 ${
                                            paymentMethod === 'bank_transfer'
                                                ? 'border-brand-700 bg-brand-50/40 shadow-xs'
                                                : 'border-sand-200 bg-white hover:border-sand-300'
                                        }`}
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex items-start gap-3.5 sm:gap-3">
                                                <div
                                                    className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl sm:h-8 sm:w-8 sm:rounded-lg ${
                                                        paymentMethod ===
                                                        'bank_transfer'
                                                            ? 'bg-brand-700 text-white'
                                                            : 'bg-sand-100 text-brand-700'
                                                    }`}
                                                >
                                                    <Building2 className="h-5 w-5 sm:h-4 sm:w-4" />
                                                </div>
                                                <div className="flex-1">
                                                    <span className="text-sm font-bold text-brand-950 sm:text-sm">
                                                        Transfer Bank Langsung
                                                    </span>
                                                    <p className="mt-1 text-xs leading-snug text-brand-600 sm:mt-0.5 sm:text-[11px]">
                                                        Transfer manual ke
                                                        rekening resmi toko
                                                        dengan kode unik
                                                        verifikasi.
                                                    </p>

                                                    {paymentMethod ===
                                                        'bank_transfer' &&
                                                        banksList.length >
                                                            0 && (
                                                            <div className="mt-3 flex flex-wrap gap-2 border-t border-brand-200/60 pt-2.5">
                                                                {banksList.map(
                                                                    (b) => {
                                                                        const isBankActive =
                                                                            selectedBank.toLowerCase() ===
                                                                            b.bank_code.toLowerCase();
                                                                        return (
                                                                            <button
                                                                                key={
                                                                                    b.bank_code
                                                                                }
                                                                                type="button"
                                                                                onClick={(
                                                                                    e,
                                                                                ) => {
                                                                                    e.stopPropagation();
                                                                                    setSelectedBank(
                                                                                        b.bank_code,
                                                                                    );
                                                                                }}
                                                                                className={`cursor-pointer rounded-xl border px-3.5 py-2 text-center text-xs font-bold transition-all sm:rounded-lg sm:px-3 sm:py-1.5 ${
                                                                                    isBankActive
                                                                                        ? 'border-brand-700 bg-brand-700 text-white shadow-xs'
                                                                                        : 'hover:bg-sand-50 border-sand-200 bg-white text-brand-800'
                                                                                }`}
                                                                            >
                                                                                {
                                                                                    b.bank_name
                                                                                }
                                                                            </button>
                                                                        );
                                                                    },
                                                                )}
                                                            </div>
                                                        )}
                                                </div>
                                            </div>
                                            <div
                                                className={`mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border-2 sm:h-4 sm:w-4 ${
                                                    paymentMethod ===
                                                    'bank_transfer'
                                                        ? 'border-brand-700 bg-brand-700 text-white'
                                                        : 'border-sand-300 bg-white'
                                                }`}
                                            >
                                                {paymentMethod ===
                                                    'bank_transfer' && (
                                                    <Check className="h-3 w-3 stroke-[3] sm:h-2.5 sm:w-2.5" />
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Option 3: WhatsApp Checkout */}
                                    <div
                                        onClick={() =>
                                            setPaymentMethod('whatsapp')
                                        }
                                        className={`relative cursor-pointer rounded-2xl border-2 p-4 transition-all sm:rounded-xl sm:p-3.5 ${
                                            paymentMethod === 'whatsapp'
                                                ? 'border-[#25D366] bg-emerald-50/40 shadow-xs'
                                                : 'border-sand-200 bg-white hover:border-sand-300'
                                        }`}
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex items-start gap-3.5 sm:gap-3">
                                                <div
                                                    className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl sm:h-8 sm:w-8 sm:rounded-lg ${
                                                        paymentMethod ===
                                                        'whatsapp'
                                                            ? 'bg-[#25D366] text-white'
                                                            : 'bg-sand-100 text-[#25D366]'
                                                    }`}
                                                >
                                                    <MessageCircle className="h-5 w-5 sm:h-4 sm:w-4" />
                                                </div>
                                                <div>
                                                    <span className="text-sm font-bold text-brand-950 sm:text-sm">
                                                        Pesan via WhatsApp (Chat
                                                        Roaster)
                                                    </span>
                                                    <p className="mt-1 text-xs leading-snug text-brand-600 sm:mt-0.5 sm:text-[11px]">
                                                        Untuk Anda yang ingin
                                                        konsultasi seduhan,
                                                        custom racikan, atau
                                                        kargo volume besar.
                                                    </p>
                                                </div>
                                            </div>
                                            <div
                                                className={`mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border-2 sm:h-4 sm:w-4 ${
                                                    paymentMethod === 'whatsapp'
                                                        ? 'border-[#25D366] bg-[#25D366] text-white'
                                                        : 'border-sand-300 bg-white'
                                                }`}
                                            >
                                                {paymentMethod ===
                                                    'whatsapp' && (
                                                    <Check className="h-3 w-3 stroke-[3] sm:h-2.5 sm:w-2.5" />
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Order Calculation Summary */}
                                <div className="space-y-2 border-t border-sand-200 pt-4">
                                    <div className="flex items-center justify-between text-xs text-brand-600">
                                        <span>
                                            Subtotal ({itemCount} item,{' '}
                                            {totalWeightGrams}g)
                                        </span>
                                        <span className="font-semibold text-brand-950">
                                            {formatRupiah(subtotal)}
                                        </span>
                                    </div>
                                    {hasPreorderDp && (
                                        <>
                                            {regularSubtotal > 0 && (
                                                <div className="flex items-center justify-between text-xs text-brand-600">
                                                    <span>Produk Reguler</span>
                                                    <span className="font-semibold text-brand-950">
                                                        {formatRupiah(
                                                            regularSubtotal,
                                                        )}
                                                    </span>
                                                </div>
                                            )}
                                            <div className="flex items-center justify-between text-xs text-amber-700">
                                                <span className="font-semibold">
                                                    Pembayaran DP Pre-Order
                                                </span>
                                                <span className="font-bold">
                                                    {formatRupiah(
                                                        preorderDpSubtotal,
                                                    )}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between text-[11px] text-brand-500">
                                                <span>Sisa Pelunasan</span>
                                                <span>
                                                    {formatRupiah(
                                                        remainingBalance,
                                                    )}
                                                </span>
                                            </div>
                                            <div className="text-[11px]">
                                                <Link
                                                    href="/syarat-ketentuan-preorder"
                                                    className="font-semibold text-amber-800 underline hover:text-amber-950"
                                                >
                                                    Syarat &amp; Ketentuan
                                                    Pre-Order
                                                </Link>
                                            </div>
                                        </>
                                    )}
                                    <div className="flex items-center justify-between text-xs text-brand-600">
                                        <span>
                                            {isPickup
                                                ? 'Biaya Pengambilan Toko'
                                                : `Ongkir (${activeCourier?.courier || 'Ekspedisi'} - ${activeCourier?.service || 'REG'})`}
                                        </span>
                                        <span
                                            className={
                                                shippingCost === 0
                                                    ? 'font-bold text-emerald-700'
                                                    : 'font-semibold text-brand-950'
                                            }
                                        >
                                            {shippingCost === 0
                                                ? isPickup
                                                    ? 'GRATIS (Ambil di Toko)'
                                                    : 'GRATIS (Promo)'
                                                : formatRupiah(shippingCost)}
                                        </span>
                                    </div>
                                    {paymentMethod === 'bank_transfer' && (
                                        <div className="flex items-center justify-between text-[11px] text-brand-500 italic">
                                            <span>Kode Unik Transfer</span>
                                            <span>
                                                Otomatis di halaman bayar
                                            </span>
                                        </div>
                                    )}
                                    <div className="border-sand-100 flex items-center justify-between border-t pt-2 text-base font-extrabold text-brand-950">
                                        <span>Total Tagihan</span>
                                        <span className="text-lg text-brand-700">
                                            {formatRupiah(grandTotal)}
                                        </span>
                                    </div>
                                </div>

                                {/* Action Submit Button */}
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className={`flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl py-4 text-xs font-bold tracking-wider text-white uppercase shadow-md transition-all active:scale-[0.99] disabled:opacity-50 ${
                                        paymentMethod === 'whatsapp'
                                            ? 'bg-[#25D366] hover:bg-[#20ba59]'
                                            : 'bg-brand-700 hover:bg-brand-800'
                                    }`}
                                >
                                    {paymentMethod === 'qris' && (
                                        <QrCode className="h-4 w-4" />
                                    )}
                                    {paymentMethod === 'bank_transfer' && (
                                        <Building2 className="h-4 w-4" />
                                    )}
                                    {paymentMethod === 'whatsapp' && (
                                        <MessageCircle className="h-4 w-4 fill-white" />
                                    )}
                                    <span>
                                        {isSubmitting
                                            ? 'Memproses Pesanan...'
                                            : paymentMethod === 'qris'
                                              ? `Bayar dengan QRIS Toko (${formatRupiah(grandTotal)})`
                                              : paymentMethod ===
                                                  'bank_transfer'
                                                ? `Buat Pesanan & Bayar Transfer Bank`
                                                : isPickup
                                                  ? `Konfirmasi Ambil di Toko via WhatsApp`
                                                  : `Kirim Pesanan ke WhatsApp`}
                                    </span>
                                </button>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </PublicLayout>
    );
}
