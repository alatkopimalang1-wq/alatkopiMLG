import React, { useState } from 'react';
import { Head, usePage } from '@inertiajs/react';
import {
    ArrowRight,
    Building2,
    Calendar,
    Clock,
    Heart,
    MapPin,
    MessageCircle,
    Phone,
    Users,
    Wrench,
    Zap,
} from 'lucide-react';
import { PublicLayout } from '@/layouts/public-layout';

const resolveImageUrl = (img?: string | null, fallback = '') => {
    if (!img) return fallback;
    if (
        img.startsWith('http://') ||
        img.startsWith('https://') ||
        img.startsWith('blob:')
    )
        return img;
    const clean = img.startsWith('/') ? img : `/${img}`;
    if (clean.startsWith('/storage/')) return clean;
    return `/storage${clean}`;
};

const getDesktopGridClass = (cols: string | number) => {
    switch (String(cols)) {
        case '1':
            return 'lg:grid-cols-1';
        case '2':
            return 'lg:grid-cols-2';
        case '4':
            return 'lg:grid-cols-4';
        case '3':
        default:
            return 'lg:grid-cols-3';
    }
};

const getTabletGridClass = (cols: string | number) => {
    switch (String(cols)) {
        case '1':
            return 'md:grid-cols-1';
        case '3':
            return 'md:grid-cols-3';
        case '2':
        default:
            return 'md:grid-cols-2';
    }
};

const getMobileGridClass = (cols: string | number) => {
    switch (String(cols)) {
        case '2':
            return 'grid-cols-2';
        case '1':
        default:
            return 'grid-cols-1';
    }
};

const getAspectClass = (aspect?: string) => {
    switch (aspect) {
        case 'aspect-16/9':
            return 'aspect-16/9';
        case 'aspect-square':
            return 'aspect-square';
        case 'aspect-auto':
            return 'aspect-auto';
        case 'aspect-4/3':
        default:
            return 'aspect-4/3';
    }
};

interface CateringBenefit {
    title: string;
    badge?: string;
    description: string;
    is_highlight?: boolean;
}

interface CateringOccasion {
    name: string;
    tagline?: string;
    description?: string;
}

interface MenuCategoryItem {
    title: string;
    items: string[];
}

interface GalleryImageItem {
    image: string;
    caption?: string;
}

interface CoffeeCateringPageProps {
    page?: {
        hero_badge?: string;
        hero_title?: string;
        hero_description?: string;
        hero_image?: string;
        minimum_order_cups?: number | string;
        benefits?: CateringBenefit[];
        occasions?: CateringOccasion[];
        menu_categories?: MenuCategoryItem[];
        gallery_title?: string;
        gallery_subtitle?: string;
        grid_desktop?: number | string;
        grid_tablet?: number | string;
        grid_mobile?: number | string;
        image_aspect?: string;
        gallery_images?: GalleryImageItem[];
        whatsapp_number?: string;
        form_title?: string;
        form_subtitle?: string;
        terms_note?: string;
        address?: string;
        hours?: string;
        maps_url?: string;
    };
}

export default function CoffeeCateringPage({ page }: CoffeeCateringPageProps) {
    const { locale } = usePage().props as { locale?: string };
    const isEn = locale === 'en';

    // Form state for instant WhatsApp inquiry
    const [picName, setPicName] = useState('');
    const [organizationName, setOrganizationName] = useState('');
    const [contactPhone, setContactPhone] = useState('');
    const [eventDate, setEventDate] = useState('');
    const [eventTime, setEventTime] = useState('');
    const [cupCount, setCupCount] = useState('200 – 300 cup');
    const [eventType, setEventType] = useState('Wedding & Resepsi Pernikahan');
    const [eventLocation, setEventLocation] = useState('');
    const [notes, setNotes] = useState('');

    const heroBadge =
        page?.hero_badge ||
        (isEn
            ? 'On-Site Specialty Coffee Catering'
            : 'Layanan Coffee Catering On-Site');
    const heroTitle =
        page?.hero_title ||
        (isEn
            ? 'Sanubari Coffee Catering for Your Special Moments'
            : 'Sanubari Coffee Catering untuk Segala Momen Spesial Anda');
    const heroDesc =
        page?.hero_description ||
        (isEn
            ? 'Bring an authentic specialty coffee bar experience directly to your venue in Malang & East Java. Tailored for Weddings, Corporate Gatherings, Seminars, and Family Celebrations with minimum order of 200 cups and professional on-site barista service.'
            : 'Hadirkan pengalaman live specialty coffee bar autentik langsung di lokasi acara Anda di Malang & sekitarnya. Cocok untuk Wedding, Acara Kantor, Acara Seminar, maupun Acara Keluarga dengan minimum order 200 cup dan racikan barista profesional Sanubari.');

    const heroImage = page?.hero_image
        ? resolveImageUrl(page.hero_image)
        : 'https://images.unsplash.com/photo-1511920170033-f8396924c348?auto=format&fit=crop&w=1200&q=80';

    const whatsappNumber = page?.whatsapp_number || '6282132095241';
    const cleanWhatsapp = whatsappNumber.replace(/[^0-9]/g, '');

    const address =
        page?.address ||
        'Ruko Tlogomas Square Kav. 34, Jl. Raya Tlogomas, Lowokwaru, Kota Malang, Jawa Timur 65144';
    const hours = page?.hours || 'Setiap Hari: 09.00 – 23.00 WIB';
    const mapsUrl =
        page?.maps_url || 'https://maps.app.goo.gl/PMuxaEtsbEvC4APy7';

    const formTitle =
        page?.form_title || 'Konsultasi Jadwal & Pemesanan Coffee Catering';
    const formSubtitle =
        page?.form_subtitle ||
        'Isi formulir singkat di bawah ini untuk mendapatkan penawaran harga & paket coffee catering Sanubari via WhatsApp.';
    const termsNote =
        page?.terms_note ||
        '*Minimum pemesanan 200 cup. Pemesanan disarankan minimal H-7 acara untuk persiapan jadwal tim barista dan ketersediaan mesin.';

    // 4 Core Highlights
    const defaultBenefits: CateringBenefit[] = [
        {
            title: isEn ? 'Minimum Order 200 Cups' : 'Minimum Order 200 Cup',
            badge: isEn ? 'Flexible Scale' : 'Kapasitas Fleksibel',
            description: isEn
                ? 'Starting from 200 cups of freshly brewed coffee, ideal for intimate family gatherings to grand wedding banquets.'
                : 'Mulai dari 200 cup fresh coffee, sangat ideal untuk intimate party keluarga, acara kantor, hingga resepsi pernikahan akbar.',
            is_highlight: false,
        },
        {
            title: isEn
                ? 'On-Site Live Coffee Bar'
                : 'Pelayanan Langsung di Tempat Acara',
            badge: isEn ? 'Live Brewing' : 'Live Espresso Bar',
            description: isEn
                ? 'Our professional baristas arrive at your venue with complete commercial equipment, brewing drinks live in front of your guests.'
                : 'Tim barista profesional Sanubari hadir langsung di lokasi acara dengan setup mobile coffee bar lengkap, menyajikan kopi segar di hadapan tamu.',
            is_highlight: false,
        },
        {
            title: isEn
                ? 'Commercial Espresso Setup'
                : 'Peralatan Espresso Komersial',
            badge: isEn ? 'Professional Rig' : 'Peralatan Lengkap',
            description: isEn
                ? 'Full professional espresso machines, high-precision grinders, ice stations, and aesthetic bar decor ready to elevate your event ambience.'
                : 'Mesin espresso standar specialty coffee, grinder presisi, cooling ice station, dan booth bar estetis yang siap mempercantik dekorasi acara Anda.',
            is_highlight: false,
        },
        {
            title: isEn
                ? 'Specialty Fresh Roasted Beans'
                : 'Biji Kopi Fresh Roast Khas Sanubari',
            badge: isEn ? 'Specialty Grade 1' : 'Racikan Khas Roastery',
            description: isEn
                ? 'Exclusive houseblends and single origins roasted in Malang. Rich, sweet, balanced, and gentle on the stomach for all your guests.'
                : 'Pilihan espresso blend dan single origin artisan khas Alat Kopi Malang. Cita rasa kaya, manis seimbang, dan ramah di lambung para tamu undangan.',
            is_highlight: true,
        },
    ];

    const benefits =
        page?.benefits && page.benefits.length > 0
            ? page.benefits
            : defaultBenefits;

    // The 4 Core Occasions Requested by the User
    const defaultOccasions: CateringOccasion[] = [
        {
            name: isEn ? 'Wedding & Reception' : 'Wedding & Resepsi Pernikahan',
        },
        {
            name: isEn
                ? 'Corporate Event & Gathering'
                : 'Acara Kantor & Corporate Gathering',
        },
        {
            name: isEn ? 'Seminar & Workshop' : 'Acara Seminar & Konferensi',
        },
        {
            name: isEn
                ? 'Family Gathering & Private Party'
                : 'Acara Keluarga & Private Party',
        },
    ];

    const occasions =
        page?.occasions && page.occasions.length > 0
            ? page.occasions
            : defaultOccasions;

    // Gallery configuration
    const galleryTitle =
        page?.gallery_title ||
        (isEn
            ? 'On-Site Live Coffee Bar Documentation'
            : 'Dokumentasi Live Coffee Bar & Catering Acara');
    const gallerySubtitle =
        page?.gallery_subtitle ||
        (isEn
            ? 'Joyful moments of guests enjoying Sanubari craft coffee across weddings, offices, and seminars.'
            : 'Momen kebahagiaan para tamu menikmati racikan segar Sanubari di berbagai pesta pernikahan, kantor, dan seminar.');
    const gridDesktop = page?.grid_desktop ?? '3';
    const gridTablet = page?.grid_tablet ?? '2';
    const gridMobile = page?.grid_mobile ?? '1';
    const imageAspect = page?.image_aspect || 'aspect-4/3';
    const galleryImages =
        page?.gallery_images && page.gallery_images.length > 0
            ? page.gallery_images
            : [
                  {
                      image: 'https://images.unsplash.com/photo-1511920170033-f8396924c348?auto=format&fit=crop&w=800&q=80',
                      caption:
                          'Live Espresso Bar & Barista Standby di Lokasi Pernikahan',
                  },
                  {
                      image: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80',
                      caption:
                          'Coffee Break Cepat & Tertib untuk Seminar Ratusan Peserta',
                  },
                  {
                      image: 'https://images.unsplash.com/photo-1521017432531-fbd92d768814?auto=format&fit=crop&w=800&q=80',
                      caption:
                          'Booth Estetis Menghangatkan Suasana Corporate Gathering Kantor',
                  },
                  {
                      image: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=800&q=80',
                      caption:
                          'Fresh Pour Over & Manual Brew Disajikan Langsung untuk Pecinta Kopi',
                  },
                  {
                      image: 'https://images.unsplash.com/photo-1527529482837-4698179dc6ce?auto=format&fit=crop&w=800&q=80',
                      caption:
                          'Pilihan Es Kopi Susu Gula Aren & Minuman Non-Coffee Favorit Keluarga',
                  },
                  {
                      image: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=800&q=80',
                      caption:
                          'Peralatan Higienis, Rapi, dan Menunjang Estetika Dekorasi Acara',
                  },
              ];

    const handleWhatsAppSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const message = [
            'Halo Alat Kopi Malang! 👋',
            'Saya ingin konsultasi & reservasi layanan *Coffee Catering On-Site*:',
            '',
            `👤 *Nama PIC / Penyelenggara*: ${picName || '-'}`,
            `🏢 *Perusahaan / Keluarga*: ${organizationName || '-'}`,
            `📱 *Nomor HP/WA*: ${contactPhone || '-'}`,
            `🎉 *Jenis Acara*: ${eventType}`,
            `☕ *Perkiraan Jumlah Pesanan*: ${cupCount}`,
            `📅 *Rencana Tanggal*: ${eventDate || '-'}`,
            `⏰ *Jam Mulai Acara*: ${eventTime || '-'}`,
            `📍 *Lokasi Acara (Kota/Venue)*: ${eventLocation || '-'}`,
            notes ? `📝 *Catatan / Request Khusus*: ${notes}` : '',
            '',
            'Mohon informasi paket harga, ketersediaan jadwal tim barista, serta pilihan menu yang tersedia. Terima kasih!',
        ]
            .filter(Boolean)
            .join('\n');

        const waUrl = `https://wa.me/${cleanWhatsapp}?text=${encodeURIComponent(message)}`;
        window.open(waUrl, '_blank');
    };

    return (
        <PublicLayout>
            <Head>
                <title>
                    {isEn
                        ? 'Coffee Catering for Weddings, Corporate & Seminars — Alat Kopi Malang'
                        : 'Coffee Catering On-Site Wedding, Kantor & Seminar — Alat Kopi Malang'}
                </title>
                <meta
                    name="description"
                    content={
                        isEn
                            ? 'Book live coffee catering by Alat Kopi Malang. Minimum order 200 cups with on-site professional barista service for weddings, corporate events, seminars, and family parties.'
                            : 'Layanan live espresso bar & coffee catering on-site oleh Alat Kopi Malang. Minimum order 200 cup dengan pelayanan langsung di tempat acara untuk wedding, acara kantor, seminar, dan acara keluarga.'
                    }
                />
            </Head>

            {/* Header Hero Section (Full Width, Matching Booking & Barista Pages) */}
            <div className="relative overflow-hidden border-b border-brand-900/60 bg-brand-950 px-4 py-12 text-center text-white sm:px-6 sm:py-20 lg:px-8">
                {heroImage && (
                    <div className="pointer-events-none absolute inset-0 opacity-20">
                        <img
                            src={heroImage}
                            alt=""
                            className="h-full w-full object-cover"
                        />
                    </div>
                )}
                <div className="relative mx-auto max-w-4xl space-y-3 sm:space-y-4">
                    <span className="inline-block text-xs font-semibold tracking-wider text-accent-copper uppercase sm:text-sm">
                        {heroBadge}
                    </span>
                    <h1 className="mx-auto max-w-3xl text-2xl leading-tight font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
                        {heroTitle}
                    </h1>
                    <p className="mx-auto max-w-2xl text-sm leading-relaxed text-brand-200/90 sm:text-base">
                        {heroDesc}
                    </p>
                </div>
            </div>

            {/* Content Container (Consistent max-w-7xl Layout) */}
            <div className="mx-auto max-w-7xl space-y-14 px-4 py-10 sm:space-y-20 sm:px-6 sm:py-16 lg:px-8">
                {/* Section 1: 4 Keunggulan Utama Catering */}
                <div
                    id="keunggulan"
                    className="scroll-mt-20 space-y-6 sm:space-y-8"
                >
                    <div className="mx-auto max-w-2xl space-y-2 text-center">
                        <span className="text-xs font-bold tracking-wider text-accent-copper uppercase">
                            Keunggulan Layanan
                        </span>
                        <h2 className="text-xl font-extrabold tracking-tight text-brand-950 sm:text-3xl">
                            Solusi Kopi Spesialis untuk Acara Spesial Anda
                        </h2>
                        <p className="text-xs leading-relaxed text-brand-600 sm:text-sm">
                            Kami hadirkan standar slow bar Sanubari langsung ke
                            venue Anda lengkap dengan mesin komersial, bahan
                            baku segar, dan tim barista terampil.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 items-stretch justify-center gap-6 md:grid-cols-2 lg:grid-cols-4">
                        {benefits.map((b, idx) => {
                            const isHighlight = b.is_highlight || idx === 3;

                            return (
                                <div
                                    key={idx}
                                    className={`relative flex flex-col justify-between rounded-2xl p-6 text-center transition-all duration-300 sm:rounded-3xl sm:p-7 ${
                                        isHighlight
                                            ? 'bg-brand-950 text-white shadow-xl ring-2 ring-accent-copper lg:-translate-y-2'
                                            : 'border border-brand-100 bg-white text-brand-950 shadow-xs hover:shadow-md'
                                    }`}
                                >
                                    {b.badge && (
                                        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                                            <span
                                                className={`rounded-full px-3 py-1 text-[11px] font-bold tracking-wide whitespace-nowrap uppercase shadow-2xs ${
                                                    isHighlight
                                                        ? 'bg-accent-copper text-brand-950'
                                                        : 'bg-sand-200 text-brand-900'
                                                }`}
                                            >
                                                {b.badge}
                                            </span>
                                        </div>
                                    )}

                                    <div className="space-y-2">
                                        <h3 className="text-base leading-snug font-extrabold sm:text-lg">
                                            {b.title}
                                        </h3>
                                        <p
                                            className={`text-xs leading-relaxed ${
                                                isHighlight
                                                    ? 'text-brand-200/90'
                                                    : 'text-brand-600'
                                            }`}
                                        >
                                            {b.description}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Section 2: Pilihan Acara yang Dilayani (Wedding, Kantor, Seminar, Keluarga) */}
                <div id="acara" className="scroll-mt-20 space-y-6 sm:space-y-8">
                    <div className="mx-auto max-w-2xl space-y-2 text-center">
                        <span className="text-xs font-bold tracking-wider text-accent-copper uppercase">
                            Fungsi & Ragam Acara
                        </span>
                        <h2 className="text-xl font-extrabold tracking-tight text-brand-950 sm:text-3xl">
                            Siap Mendukung Beragam Momen Berharga
                        </h2>
                        <p className="text-xs leading-relaxed text-brand-600 sm:text-sm">
                            Mulai dari pernikahan sakral hingga seminar berskala
                            besar, setup mobile bar kami dirancang fleksibel
                            menyesuaikan tema dan kebutuhan ruang acara Anda.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-4">
                        {occasions.map((occ, idx) => (
                            <div
                                key={idx}
                                className="flex min-h-[72px] items-center justify-center rounded-xl border border-brand-200/80 bg-white p-3.5 text-center shadow-2xs transition-all hover:border-brand-300 hover:shadow-md sm:min-h-[90px] sm:rounded-2xl sm:p-6"
                            >
                                <h3 className="text-xs leading-snug font-extrabold text-brand-950 sm:text-base lg:text-lg">
                                    {occ.name}
                                </h3>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Section 4: Galeri Dokumentasi Foto On-site Catering */}
                {galleryImages.length > 0 && (
                    <div className="space-y-6 sm:space-y-8">
                        <div className="mx-auto max-w-2xl space-y-2 text-center">
                            <h2 className="text-xl font-extrabold tracking-tight text-brand-950 sm:text-3xl">
                                {galleryTitle}
                            </h2>
                            {gallerySubtitle && (
                                <p className="text-xs leading-relaxed text-brand-600 sm:text-sm">
                                    {gallerySubtitle}
                                </p>
                            )}
                        </div>

                        <div
                            className={`grid ${getMobileGridClass(gridMobile)} ${getTabletGridClass(gridTablet)} ${getDesktopGridClass(gridDesktop)} gap-4 sm:gap-6`}
                        >
                            {galleryImages.map((item, idx) => (
                                <div
                                    key={idx}
                                    className="group relative overflow-hidden rounded-2xl border border-brand-200/70 bg-brand-900 shadow-2xs transition-all duration-300 hover:shadow-md"
                                >
                                    <div
                                        className={`${getAspectClass(imageAspect)} w-full overflow-hidden`}
                                    >
                                        <img
                                            src={resolveImageUrl(item.image)}
                                            alt={
                                                item.caption ||
                                                `Galeri Sanubari Coffee Catering ${idx + 1}`
                                            }
                                            className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                                            loading="lazy"
                                        />
                                    </div>
                                    {item.caption && (
                                        <div className="border-t border-brand-100 bg-white p-3.5 sm:p-4">
                                            <p className="line-clamp-2 text-xs font-semibold text-brand-900 sm:text-sm">
                                                {item.caption}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Section 5: Fast Inquiry Form to WhatsApp */}
                <div
                    id="reservasi"
                    className="mx-auto max-w-4xl scroll-mt-20 space-y-8 rounded-3xl border border-brand-200 bg-white p-6 shadow-md sm:p-10"
                >
                    <div className="mx-auto max-w-xl space-y-2 text-center">
                        <span className="text-xs font-bold tracking-wider text-accent-copper uppercase">
                            Hubungi Kami
                        </span>
                        <h2 className="text-xl font-extrabold tracking-tight text-brand-950 sm:text-3xl">
                            {formTitle}
                        </h2>
                        <p className="text-xs leading-relaxed text-brand-600 sm:text-sm">
                            {formSubtitle}
                        </p>
                    </div>

                    <form onSubmit={handleWhatsAppSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2">
                            {/* Nama PIC */}
                            <div className="space-y-1.5">
                                <label className="block text-xs font-bold tracking-wider text-brand-900 uppercase">
                                    Nama Anda / PIC Penyelenggara{' '}
                                    <span className="text-accent-copper">
                                        *
                                    </span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={picName}
                                    onChange={(e) => setPicName(e.target.value)}
                                    placeholder="Contoh: Bpk. Aditya Pratama"
                                    className="w-full rounded-xl border border-brand-200 px-4 py-2.5 text-xs transition-all outline-none focus:border-accent-copper focus:ring-1 focus:ring-accent-copper sm:text-sm"
                                />
                            </div>

                            {/* Nama Perusahaan / Keluarga */}
                            <div className="space-y-1.5">
                                <label className="block text-xs font-bold tracking-wider text-brand-900 uppercase">
                                    Nama Pasangan / Instansi / Keluarga
                                </label>
                                <input
                                    type="text"
                                    value={organizationName}
                                    onChange={(e) =>
                                        setOrganizationName(e.target.value)
                                    }
                                    placeholder="Contoh: Aditya & Rania Wedding / PT Maju Sejahtera"
                                    className="w-full rounded-xl border border-brand-200 px-4 py-2.5 text-xs transition-all outline-none focus:border-accent-copper focus:ring-1 focus:ring-accent-copper sm:text-sm"
                                />
                            </div>

                            {/* Nomor WhatsApp */}
                            <div className="space-y-1.5">
                                <label className="block text-xs font-bold tracking-wider text-brand-900 uppercase">
                                    Nomor Telepon / WhatsApp{' '}
                                    <span className="text-accent-copper">
                                        *
                                    </span>
                                </label>
                                <input
                                    type="tel"
                                    required
                                    value={contactPhone}
                                    onChange={(e) =>
                                        setContactPhone(e.target.value)
                                    }
                                    placeholder="Contoh: 081234567890"
                                    className="w-full rounded-xl border border-brand-200 px-4 py-2.5 text-xs transition-all outline-none focus:border-accent-copper focus:ring-1 focus:ring-accent-copper sm:text-sm"
                                />
                            </div>

                            {/* Jenis Acara */}
                            <div className="space-y-1.5">
                                <label className="block text-xs font-bold tracking-wider text-brand-900 uppercase">
                                    Jenis Acara{' '}
                                    <span className="text-accent-copper">
                                        *
                                    </span>
                                </label>
                                <select
                                    value={eventType}
                                    onChange={(e) =>
                                        setEventType(e.target.value)
                                    }
                                    className="w-full rounded-xl border border-brand-200 bg-white px-4 py-2.5 text-xs transition-all outline-none focus:border-accent-copper focus:ring-1 focus:ring-accent-copper sm:text-sm"
                                >
                                    <option value="Wedding & Resepsi Pernikahan">
                                        Wedding & Resepsi Pernikahan
                                    </option>
                                    <option value="Acara Kantor & Corporate Gathering">
                                        Acara Kantor & Corporate Gathering
                                    </option>
                                    <option value="Acara Seminar & Workshop">
                                        Acara Seminar & Workshop
                                    </option>
                                    <option value="Acara Keluarga & Private Party">
                                        Acara Keluarga & Private Party
                                    </option>
                                    <option value="Pameran, Festival & Acara Lainnya">
                                        Pameran, Festival & Acara Lainnya
                                    </option>
                                </select>
                            </div>

                            {/* Jumlah Cup (Min 200) */}
                            <div className="space-y-1.5">
                                <label className="block text-xs font-bold tracking-wider text-brand-900 uppercase">
                                    Perkiraan Jumlah Cup (Min. 200 Cup){' '}
                                    <span className="text-accent-copper">
                                        *
                                    </span>
                                </label>
                                <select
                                    value={cupCount}
                                    onChange={(e) =>
                                        setCupCount(e.target.value)
                                    }
                                    className="w-full rounded-xl border border-brand-200 bg-white px-4 py-2.5 text-xs font-semibold text-brand-900 transition-all outline-none focus:border-accent-copper focus:ring-1 focus:ring-accent-copper sm:text-sm"
                                >
                                    <option value="200 cup (Paket Minimum)">
                                        200 cup (Paket Minimum)
                                    </option>
                                    <option value="300 – 400 cup">
                                        300 – 400 cup
                                    </option>
                                    <option value="500 – 700 cup">
                                        500 – 700 cup
                                    </option>
                                    <option value="1.000+ cup (Acara Besar)">
                                        1.000+ cup (Acara Besar)
                                    </option>
                                    <option value="Kustom / Jumlah Lainnya">
                                        Kustom / Jumlah Lainnya
                                    </option>
                                </select>
                            </div>

                            {/* Tanggal Acara */}
                            <div className="space-y-1.5">
                                <label className="block text-xs font-bold tracking-wider text-brand-900 uppercase">
                                    Rencana Tanggal Acara{' '}
                                    <span className="text-accent-copper">
                                        *
                                    </span>
                                </label>
                                <input
                                    type="date"
                                    required
                                    value={eventDate}
                                    onChange={(e) =>
                                        setEventDate(e.target.value)
                                    }
                                    className="w-full rounded-xl border border-brand-200 bg-white px-4 py-2.5 text-xs transition-all outline-none focus:border-accent-copper focus:ring-1 focus:ring-accent-copper sm:text-sm"
                                />
                            </div>

                            {/* Waktu / Jam Acara */}
                            <div className="space-y-1.5">
                                <label className="block text-xs font-bold tracking-wider text-brand-900 uppercase">
                                    Waktu / Jam Acara
                                </label>
                                <input
                                    type="text"
                                    value={eventTime}
                                    onChange={(e) =>
                                        setEventTime(e.target.value)
                                    }
                                    placeholder="Contoh: 10.00 – 14.00 WIB"
                                    className="w-full rounded-xl border border-brand-200 px-4 py-2.5 text-xs transition-all outline-none focus:border-accent-copper focus:ring-1 focus:ring-accent-copper sm:text-sm"
                                />
                            </div>

                            {/* Lokasi Acara / Venue */}
                            <div className="space-y-1.5">
                                <label className="block text-xs font-bold tracking-wider text-brand-900 uppercase">
                                    Lokasi Acara / Gedung / Kota{' '}
                                    <span className="text-accent-copper">
                                        *
                                    </span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={eventLocation}
                                    onChange={(e) =>
                                        setEventLocation(e.target.value)
                                    }
                                    placeholder="Contoh: Hotel Santika Malang / Rumah Kediaman"
                                    className="w-full rounded-xl border border-brand-200 px-4 py-2.5 text-xs transition-all outline-none focus:border-accent-copper focus:ring-1 focus:ring-accent-copper sm:text-sm"
                                />
                            </div>
                        </div>

                        {/* Catatan / Permintaan Khusus */}
                        <div className="space-y-1.5">
                            <label className="block text-xs font-bold tracking-wider text-brand-900 uppercase">
                                Catatan Tambahan / Preferensi Menu & Request
                                Khusus (Opsional)
                            </label>
                            <textarea
                                rows={3}
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Contoh: Ingin custom cup berlogo pernikahan, mayoritas tamu menyukai es kopi susu gula aren dan cokelat non-kopi."
                                className="w-full rounded-xl border border-brand-200 px-4 py-2.5 text-xs transition-all outline-none focus:border-accent-copper focus:ring-1 focus:ring-accent-copper sm:text-sm"
                            />
                        </div>

                        <div className="bg-sand-50 rounded-xl border border-sand-200 p-4 text-xs leading-relaxed text-brand-700">
                            {termsNote}
                        </div>

                        {/* Submit Button */}
                        <div className="flex flex-col items-center justify-between gap-4 pt-2 sm:flex-row">
                            <div className="flex items-center gap-2 text-xs text-brand-600">
                                <Clock className="h-4 w-4 text-accent-copper" />
                                <span>
                                    Konfirmasi Cepat & Konsultasi Langsung
                                    dengan Tim Sanubari
                                </span>
                            </div>
                            <button
                                type="submit"
                                className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-brand-900 px-6 py-3.5 text-sm font-bold text-white shadow-md transition-all hover:bg-brand-800 hover:shadow-lg sm:w-auto sm:px-8"
                            >
                                <MessageCircle className="h-4 w-4 shrink-0" />
                                <span>
                                    Kirim Form ke WhatsApp
                                    <span className="hidden sm:inline">
                                        {' '}
                                        Reservasi
                                    </span>
                                </span>
                                <ArrowRight className="hidden h-4 w-4 shrink-0 sm:block" />
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </PublicLayout>
    );
}
