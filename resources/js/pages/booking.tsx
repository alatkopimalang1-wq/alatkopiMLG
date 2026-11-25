import React, { useState } from 'react';
import { Head, usePage } from '@inertiajs/react';
import {
    ArrowRight,
    Building2,
    Calendar,
    Clock,
    MapPin,
    MessageCircle,
    Mic,
    Phone,
    Sparkles,
    Wifi,
    Zap,
} from 'lucide-react';
import { PublicLayout } from '@/layouts/public-layout';
import { DynamicCategoryIcon } from '@/components/dynamic-category-icon';

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
        case '5':
            return 'lg:grid-cols-5';
        case '6':
            return 'lg:grid-cols-6';
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
        case '4':
            return 'md:grid-cols-4';
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

interface BookingBenefit {
    title: string;
    badge?: string;
    description: string;
    icon?: string;
    is_highlight?: boolean;
}

interface FacilityItem {
    title: string;
    description: string;
    icon?: string;
}

interface GalleryImageItem {
    image: string;
    caption?: string;
}

interface BookingPageProps {
    page?: {
        hero_badge?: string;
        hero_title?: string;
        hero_description?: string;
        hero_image?: string;
        benefits?: BookingBenefit[];
        facilities?: FacilityItem[];
        event_types?: string[];
        gallery_title?: string;
        gallery_subtitle?: string;
        grid_desktop?: number | string;
        grid_tablet?: number | string;
        grid_mobile?: number | string;
        image_aspect?: string;
        gallery_images?: GalleryImageItem[];
        whatsapp_number?: string;
        address?: string;
        hours?: string;
        maps_url?: string;
        form_title?: string;
        form_subtitle?: string;
        minimum_spent_info?: string;
    };
}

export default function BookingPage({ page }: BookingPageProps) {
    const { locale } = usePage().props as { locale?: string };
    const isEn = locale === 'en';

    // Form state
    const [picName, setPicName] = useState('');
    const [organizationName, setOrganizationName] = useState('');
    const [contactPhone, setContactPhone] = useState('');
    const [eventDate, setEventDate] = useState('');
    const [eventTime, setEventTime] = useState('');
    const [attendeeCount, setAttendeeCount] = useState('35 – 50 orang');
    const [eventType, setEventType] = useState('Gathering Komunitas & Reuni');
    const [needProjector, setNeedProjector] = useState(true);
    const [needSoundSystem, setNeedSoundSystem] = useState(true);
    const [notes, setNotes] = useState('');

    const heroBadge =
        page?.hero_badge ||
        (isEn
            ? 'Venue & Space Booking'
            : 'Reservasi & Sewa Tempat di Sanubari');
    const heroTitle =
        page?.hero_title ||
        (isEn
            ? 'Space Booking for Events & Communities at Alat Kopi Malang'
            : 'Booking Tempat Nyaman untuk Acara & Komunitas di Alat Kopi Malang');
    const heroDesc =
        page?.hero_description ||
        (isEn
            ? 'A cozy, aesthetic, and welcoming space in Malang for workshops, meetings, gatherings, or private events. No venue rental fee — simply enjoy our coffee and menu with a friendly minimum spend.'
            : 'Ruang berkumpul yang hangat, estetis, dan santai untuk workshop, meeting, gathering komunitas, atau acara spesial Anda di Malang. Tanpa biaya sewa ruangan terpisah — cukup dengan minimum spent ngopi & menu lezat di Alat Kopi Malang.');

    const heroImage = page?.hero_image
        ? resolveImageUrl(page.hero_image)
        : 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=1200&q=80';

    const whatsappNumber = page?.whatsapp_number || '6282132095241';
    const cleanWhatsapp = whatsappNumber.replace(/[^0-9]/g, '');

    const address =
        page?.address ||
        'Ruko Tlogomas Square Kav. 34, Jl. Raya Tlogomas, Lowokwaru, Kota Malang, Jawa Timur 65144';
    const hours = page?.hours || 'Setiap Hari: 09.00 – 23.00 WIB';
    const mapsUrl =
        page?.maps_url || 'https://maps.app.goo.gl/PMuxaEtsbEvC4APy7';

    const formTitle =
        page?.form_title || 'Konsultasi Jadwal & Reservasi Tempat';
    const formSubtitle =
        page?.form_subtitle ||
        'Isi detail rencana acara Anda di bawah ini untuk langsung terhubung ke WhatsApp reservasi Alat Kopi Malang.';

    // The 4 Core Benefits Requested by the User
    const defaultBenefits: BookingBenefit[] = [
        {
            title: isEn
                ? 'Accommodates Over 50 People'
                : 'Muat Hingga Lebih dari 50 Orang',
            badge: isEn ? 'Spacious Capacity' : 'Kapasitas Luas',
            description: isEn
                ? 'Flexible and comfortable seating layouts (theater, classroom, round discussion, or open gathering) accommodating 50+ participants.'
                : 'Kapasitas luas dan leluasa menampung lebih dari 50 orang dengan pilihan tata letak kursi yang fleksibel (theater, kelas, diskusi melingkar, atau santai).',
            icon: 'users',
            is_highlight: false,
        },
        {
            title: isEn ? 'Free Projector & Screen' : 'Free Proyektor',
            badge: isEn ? 'Complimentary' : 'Fasilitas Gratis',
            description: isEn
                ? 'High-definition projector and projection screen ready for presentations, workshops, slide shows, or movie screenings without rental fees.'
                : 'Fasilitas proyektor jernih dan layar screen siap pakai untuk presentasi kerja, materi workshop, tayangan video, maupun nobar tanpa biaya sewa tambahan.',
            icon: 'projector',
            is_highlight: false,
        },
        {
            title: isEn ? 'Free Sound System' : 'Free Sound System',
            badge: isEn ? 'Complimentary' : 'Fasilitas Gratis',
            description: isEn
                ? 'Crisp audio setup complete with wireless microphones, bluetooth connectivity, and background music to keep your event lively.'
                : 'Sound system audio jernih dilengkapi microphone wireless gratis dan koneksi bluetooth untuk mendukung kelancaran pemandu acara maupun musik pengiring.',
            icon: 'sound',
            is_highlight: false,
        },
        {
            title: isEn
                ? 'Simple Minimum Spend Only'
                : 'Cukup dengan Minimum Spent Ngopi di Sanubari',
            badge: isEn ? 'Zero Venue Fee' : 'Bebas Sewa Ruang',
            description: isEn
                ? 'Zero room rental charge. Your entire event budget goes directly toward handcrafted specialty coffees, fresh beverages, and delicious foods.'
                : 'Tanpa biaya sewa tempat terpisah (Rp 0 room fee)! Seluruh anggaran acara Anda dialokasikan langsung untuk menikmati pesanan kopi artisan, minuman segar, dan makanan di Sanubari.',
            icon: 'coffee',
            is_highlight: true,
        },
    ];

    const benefits =
        page?.benefits && page.benefits.length > 0
            ? page.benefits
            : defaultBenefits;

    const defaultFacilities: FacilityItem[] = [
        {
            title: isEn ? 'Air-Conditioned Comfort' : 'Ruangan Ber-AC & Sejuk',
            description: isEn
                ? 'Cool and pleasant room temperature ensuring comfort throughout your session.'
                : 'Ruangan sejuk dan nyaman untuk memastikan seluruh tamu betah selama acara.',
            icon: 'zap',
        },
        {
            title: isEn ? 'High-Speed Wi-Fi' : 'Koneksi Wi-Fi Cepat',
            description: isEn
                ? 'Reliable internet for online conferencing, live streams, and presentations.'
                : 'Internet stabil untuk presentasi daring, meeting Zoom, hingga live streaming.',
            icon: 'wifi',
        },
        {
            title: isEn ? 'Abundant Power Outlets' : 'Banyak Colokan Listrik',
            description: isEn
                ? 'Power sockets conveniently placed across seating areas for laptops and phones.'
                : 'Stopkontak melimpah di setiap sudut tempat duduk untuk laptop dan gawai peserta.',
            icon: 'plug',
        },
        {
            title: isEn ? 'Ample Parking Area' : 'Parkir Luas & Aman',
            description: isEn
                ? 'Conveniently located at Ruko Tlogomas Square with secure car and motorcycle parking.'
                : 'Akses strategis di Ruko Tlogomas Square dengan area parkir mobil dan motor yang aman.',
            icon: 'building-2',
        },
    ];

    const facilities =
        page?.facilities && page.facilities.length > 0
            ? page.facilities
            : defaultFacilities;

    const galleryTitle =
        page?.gallery_title ||
        (isEn
            ? 'Space & Event Documentation'
            : 'Dokumentasi Suasana Ruangan & Acara');
    const gallerySubtitle =
        page?.gallery_subtitle ||
        (isEn
            ? 'Cozy moments of workshops, meetings, and community gatherings at Alat Kopi Malang.'
            : 'Momen kehangatan workshop, meeting, dan gathering komunitas di Alat Kopi Malang.');
    const gridDesktop = page?.grid_desktop ?? '3';
    const gridTablet = page?.grid_tablet ?? '2';
    const gridMobile = page?.grid_mobile ?? '1';
    const imageAspect = page?.image_aspect || 'aspect-4/3';
    const galleryImages =
        page?.gallery_images && page.gallery_images.length > 0
            ? page.gallery_images
            : [
                  {
                      image: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=800&q=80',
                      caption: 'Suasana Ruangan Luas & Meja Diskusi Komunitas',
                  },
                  {
                      image: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80',
                      caption:
                          'Presentasi & Workshop dengan Proyektor Layar Lebar',
                  },
                  {
                      image: 'https://images.unsplash.com/photo-1527529482837-4698179dc6ce?auto=format&fit=crop&w=800&q=80',
                      caption:
                          'Sound System & Mic Wireless Jernih untuk Gathering',
                  },
                  {
                      image: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=800&q=80',
                      caption:
                          'Kopi Artisan & Fresh Brew Disajikan Langsung dari Slow Bar',
                  },
                  {
                      image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=800&q=80',
                      caption:
                          'Kenyamanan Berkumpul dengan Ruangan Ber-AC & Stopkontak Melimpah',
                  },
                  {
                      image: 'https://images.unsplash.com/photo-1521017432531-fbd92d768814?auto=format&fit=crop&w=800&q=80',
                      caption:
                          'Kapasitas Nyaman untuk Lebih dari 50 Tamu Undangan',
                  },
              ];

    const eventTypes =
        page?.event_types && page.event_types.length > 0
            ? page.event_types
            : [
                  'Workshop & Kelas Pelatihan',
                  'Meeting Kerja & Seminar Kantor',
                  'Gathering Komunitas & Reuni',
                  'Ulang Tahun & Acara Keluarga',
                  'Bedah Buku, Talkshow, & Mini Showcase',
                  'Nonton Bareng & Diskusi Kreatif',
                  'Acara Lainnya',
              ];

    const handleWhatsAppSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const msg =
            `Halo Tim Alat Kopi Malang!\n` +
            `Saya tertarik untuk booking tempat acara:\n\n` +
            `• Nama PIC: ${picName || '-'}\n` +
            (organizationName
                ? `• Komunitas / Brand: ${organizationName}\n`
                : '') +
            `• No. WhatsApp: ${contactPhone}\n` +
            `• Tanggal Rencana: ${eventDate || 'Menyesuaikan jadwal kosong'}\n` +
            (eventTime ? `• Waktu / Jam: ${eventTime}\n` : '') +
            `• Estimasi Peserta: ${attendeeCount}\n` +
            `• Jenis Acara: ${eventType}\n` +
            `• Kebutuhan Proyektor: ${needProjector ? 'Ya (Free)' : 'Tidak'}\n` +
            `• Kebutuhan Sound System: ${needSoundSystem ? 'Ya (Free)' : 'Tidak'}\n` +
            (notes ? `• Catatan / Permintaan: ${notes}\n\n` : `\n`) +
            `Mohon info ketersediaan tanggal dan rekomendasi menu minimum spent di Sanubari. Terima kasih!`;

        window.open(
            `https://wa.me/${cleanWhatsapp}?text=${encodeURIComponent(msg)}`,
            '_blank',
        );
    };

    return (
        <PublicLayout
            title={
                isEn
                    ? 'Venue & Space Booking — Alat Kopi Malang'
                    : 'Booking Tempat Acara & Komunitas | Alat Kopi Malang'
            }
        >
            <Head>
                <title>
                    {isEn
                        ? 'Venue & Space Booking — Alat Kopi Malang'
                        : 'Booking Tempat Acara & Komunitas — Alat Kopi Malang'}
                </title>
                <meta
                    name="description"
                    content={
                        isEn
                            ? 'Book event space at Alat Kopi Malang. Capacity 50+ people, free projector, free sound system, with minimum spend only.'
                            : 'Booking tempat acara di Alat Kopi Malang. Muat hingga lebih dari 50 orang, Free Proyektor, Free Sound System, cukup dengan minimum spent ngopi di Sanubari.'
                    }
                />
            </Head>

            {/* Header Hero Section (Full Width, Matching Barista Training & Roasting Pages) */}
            <div className="relative overflow-hidden border-b border-brand-900/60 bg-brand-950 px-4 py-12 text-center text-white sm:px-6 sm:py-20 lg:px-8">
                {heroImage && (
                    <div className="pointer-events-none absolute inset-0 opacity-15">
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
                {/* Section 1: The 4 Core Benefits */}
                <div
                    id="manfaat"
                    className="scroll-mt-20 space-y-6 sm:space-y-8"
                >
                    <div className="mx-auto max-w-2xl space-y-2 text-center">
                        <span className="text-xs font-bold tracking-wider text-accent-copper uppercase">
                            Fasilitas & Keuntungan
                        </span>
                        <h2 className="text-xl font-extrabold tracking-tight text-brand-950 sm:text-3xl">
                            Semua Kebutuhan Acara Anda Siap Tersedia
                        </h2>
                        <p className="text-xs leading-relaxed text-brand-600 sm:text-sm">
                            Nikmati kemudahan mengadakan acara tanpa biaya sewa
                            ruang terpisah dan tanpa repot menyewa alat
                            audio-visual.
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

                {/* Section 2: Fasilitas Pendukung Lainnya (Posisikan di Tengah) */}
                <div className="mx-auto max-w-5xl space-y-6">
                    <div className="mx-auto max-w-xl space-y-1 text-center">
                        <h3 className="text-lg font-extrabold text-brand-950 sm:text-2xl">
                            Fasilitas Pendukung Lengkap
                        </h3>
                        <p className="text-xs text-brand-600">
                            Didukung sarana modern agar acara Anda berjalan
                            lancar dari awal hingga akhir.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 justify-center gap-4 sm:gap-6 lg:grid-cols-4">
                        {facilities.map((fac, idx) => (
                            <div
                                key={idx}
                                className="flex flex-col items-center justify-center space-y-2.5 rounded-2xl border border-brand-200/70 bg-white p-5 text-center shadow-2xs transition-colors hover:border-brand-300 sm:p-6"
                            >
                                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-brand-100 text-brand-800">
                                    <DynamicCategoryIcon
                                        name={
                                            fac.icon ||
                                            (idx === 0
                                                ? 'zap'
                                                : idx === 1
                                                  ? 'wifi'
                                                  : idx === 2
                                                    ? 'plug'
                                                    : 'building-2')
                                        }
                                        className="h-5 w-5 text-accent-copper"
                                    />
                                </div>
                                <h4 className="text-xs font-bold text-brand-950 sm:text-sm">
                                    {fac.title}
                                </h4>
                                <p className="text-[11px] leading-relaxed text-brand-600 sm:text-xs">
                                    {fac.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Section 4: Galeri Suasana Ruangan & Acara */}
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
                            className={`grid ${getMobileGridClass(gridMobile)} ${getTabletGridClass(
                                gridTablet,
                            )} ${getDesktopGridClass(gridDesktop)} gap-4 sm:gap-6`}
                        >
                            {galleryImages.map((item, idx) => (
                                <div
                                    key={idx}
                                    className="group relative overflow-hidden rounded-xl border border-brand-100/60 bg-sand-200/50 shadow-2xs sm:rounded-2xl"
                                >
                                    <div
                                        className={`${getAspectClass(imageAspect)} w-full overflow-hidden`}
                                    >
                                        <img
                                            src={resolveImageUrl(item.image)}
                                            alt={
                                                item.caption ||
                                                `Galeri Alat Kopi Malang ${idx + 1}`
                                            }
                                            className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                                            loading="lazy"
                                        />
                                    </div>
                                    {item.caption && (
                                        <div className="border-t border-brand-100/40 bg-white/95 p-3 sm:p-4">
                                            <p className="line-clamp-2 text-xs leading-snug font-medium text-brand-800 sm:text-sm">
                                                {item.caption}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Section 5: Form Reservasi WhatsApp Interaktif (Identical Style to Other Pages) */}
                <div
                    id="reservasi"
                    className="mx-auto max-w-2xl scroll-mt-20 space-y-3.5 rounded-xl border border-brand-100/60 bg-sand-200/30 p-3.5 sm:space-y-6 sm:rounded-3xl sm:p-8"
                >
                    <div className="space-y-1 text-center">
                        <h3 className="flex items-center justify-center gap-1.5 text-base font-extrabold text-brand-950 sm:gap-2 sm:text-2xl">
                            <MessageCircle className="h-4 w-4 text-[#128C7E] sm:h-6 sm:w-6" />
                            <span>{formTitle}</span>
                        </h3>
                        <p className="text-[11px] text-brand-600 sm:text-xs">
                            {formSubtitle}
                        </p>
                    </div>

                    <form
                        onSubmit={handleWhatsAppSubmit}
                        className="space-y-2.5 sm:space-y-4"
                    >
                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-4">
                            <div className="space-y-0.5 sm:space-y-1">
                                <label className="block text-[11px] font-semibold text-brand-900 sm:text-xs">
                                    Nama Lengkap / PIC *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={picName}
                                    onChange={(e) => setPicName(e.target.value)}
                                    placeholder="Contoh: Dimas Aditya"
                                    className="h-8.5 w-full rounded-lg border border-brand-200 bg-white px-2.5 text-xs text-brand-950 outline-none focus:border-brand-800 sm:h-10 sm:rounded-xl sm:px-3 sm:text-sm"
                                />
                            </div>

                            <div className="space-y-0.5 sm:space-y-1">
                                <label className="block text-[11px] font-semibold text-brand-900 sm:text-xs">
                                    Nama Komunitas / Brand / Kantor
                                </label>
                                <input
                                    type="text"
                                    value={organizationName}
                                    onChange={(e) =>
                                        setOrganizationName(e.target.value)
                                    }
                                    placeholder="Contoh: Komunitas Barista Malang"
                                    className="h-8.5 w-full rounded-lg border border-brand-200 bg-white px-2.5 text-xs text-brand-950 outline-none focus:border-brand-800 sm:h-10 sm:rounded-xl sm:px-3 sm:text-sm"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 sm:gap-4">
                            <div className="space-y-0.5 sm:space-y-1">
                                <label className="block text-[11px] font-semibold text-brand-900 sm:text-xs">
                                    Nomor WhatsApp Aktif *
                                </label>
                                <input
                                    type="tel"
                                    required
                                    value={contactPhone}
                                    onChange={(e) =>
                                        setContactPhone(e.target.value)
                                    }
                                    placeholder="Contoh: 08123456789"
                                    className="h-8.5 w-full rounded-lg border border-brand-200 bg-white px-2.5 text-xs text-brand-950 outline-none focus:border-brand-800 sm:h-10 sm:rounded-xl sm:px-3 sm:text-sm"
                                />
                            </div>

                            <div className="space-y-0.5 sm:space-y-1">
                                <label className="block text-[11px] font-semibold text-brand-900 sm:text-xs">
                                    Rencana Tanggal Acara
                                </label>
                                <input
                                    type="date"
                                    value={eventDate}
                                    onChange={(e) =>
                                        setEventDate(e.target.value)
                                    }
                                    className="h-8.5 w-full rounded-lg border border-brand-200 bg-white px-2.5 text-xs text-brand-950 outline-none focus:border-brand-800 sm:h-10 sm:rounded-xl sm:px-3 sm:text-sm"
                                />
                            </div>

                            <div className="space-y-0.5 sm:space-y-1">
                                <label className="block text-[11px] font-semibold text-brand-900 sm:text-xs">
                                    Waktu / Jam
                                </label>
                                <input
                                    type="text"
                                    value={eventTime}
                                    onChange={(e) =>
                                        setEventTime(e.target.value)
                                    }
                                    placeholder="Contoh: 14.00 - 18.00 WIB"
                                    className="h-8.5 w-full rounded-lg border border-brand-200 bg-white px-2.5 text-xs text-brand-950 outline-none focus:border-brand-800 sm:h-10 sm:rounded-xl sm:px-3 sm:text-sm"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-4">
                            <div className="space-y-0.5 sm:space-y-1">
                                <label className="block text-[11px] font-semibold text-brand-900 sm:text-xs">
                                    Estimasi Peserta (Kapasitas 50+ Orang)
                                </label>
                                <select
                                    value={attendeeCount}
                                    onChange={(e) =>
                                        setAttendeeCount(e.target.value)
                                    }
                                    className="h-8.5 w-full rounded-lg border border-brand-200 bg-white px-2.5 text-xs text-brand-950 outline-none focus:border-brand-800 sm:h-10 sm:rounded-xl sm:px-3 sm:text-sm"
                                >
                                    <option value="10 – 20 orang">
                                        10 – 20 orang (Intimate Gathering)
                                    </option>
                                    <option value="20 – 35 orang">
                                        20 – 35 orang (Workshop / Meeting)
                                    </option>
                                    <option value="35 – 50 orang">
                                        35 – 50 orang (Gathering / Seminar)
                                    </option>
                                    <option value="> 50 orang (Kapasitas Maksimal)">
                                        &gt; 50 orang (Kapasitas Maksimal)
                                    </option>
                                </select>
                            </div>

                            <div className="space-y-0.5 sm:space-y-1">
                                <label className="block text-[11px] font-semibold text-brand-900 sm:text-xs">
                                    Jenis / Format Acara
                                </label>
                                <select
                                    value={eventType}
                                    onChange={(e) =>
                                        setEventType(e.target.value)
                                    }
                                    className="h-8.5 w-full rounded-lg border border-brand-200 bg-white px-2.5 text-xs text-brand-950 outline-none focus:border-brand-800 sm:h-10 sm:rounded-xl sm:px-3 sm:text-sm"
                                >
                                    {eventTypes.map((type, idx) => (
                                        <option key={idx} value={type}>
                                            {type}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Pilihan Fasilitas Gratis */}
                        <div className="space-y-1.5 rounded-xl border border-brand-200/80 bg-white p-3 sm:p-3.5">
                            <span className="block text-[11px] font-semibold text-brand-900 sm:text-xs">
                                Fasilitas Gratis yang Ingin Digunakan:
                            </span>
                            <div className="flex flex-wrap items-center gap-4 text-xs text-brand-800">
                                <label className="inline-flex cursor-pointer items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={needProjector}
                                        onChange={(e) =>
                                            setNeedProjector(e.target.checked)
                                        }
                                        className="h-4 w-4 rounded border-brand-300 text-accent-copper focus:ring-accent-copper"
                                    />
                                    <span>Free Proyektor & Layar</span>
                                </label>
                                <label className="inline-flex cursor-pointer items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={needSoundSystem}
                                        onChange={(e) =>
                                            setNeedSoundSystem(e.target.checked)
                                        }
                                        className="h-4 w-4 rounded border-brand-300 text-accent-copper focus:ring-accent-copper"
                                    />
                                    <span>
                                        Free Sound System & Mic Wireless
                                    </span>
                                </label>
                            </div>
                        </div>

                        <div className="space-y-0.5 sm:space-y-1">
                            <label className="block text-[11px] font-semibold text-brand-900 sm:text-xs">
                                Catatan Khusus / Permintaan Tata Ruang
                            </label>
                            <textarea
                                rows={3}
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Contoh: Butuh susunan kursi model theater untuk 45 peserta, acara butuh proyektor mulai jam 15.00 WIB."
                                className="w-full rounded-lg border border-brand-200 bg-white p-2.5 text-xs text-brand-950 outline-none focus:border-brand-800 sm:rounded-xl sm:p-3 sm:text-sm"
                            />
                        </div>

                        <button
                            type="submit"
                            className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#128C7E] px-4 py-2.5 text-xs font-bold text-white shadow-xs transition-colors hover:bg-[#075E54] sm:py-3 sm:text-sm"
                        >
                            <MessageCircle className="h-4 w-4" />
                            <span>Kirim Reservasi ke WhatsApp Sanubari</span>
                            <ArrowRight className="h-4 w-4" />
                        </button>

                        <p className="text-center text-[10px] text-brand-500 sm:text-[11px]">
                            Pesan WhatsApp terformat otomatis akan langsung
                            terhubung ke admin Alat Kopi Malang.
                        </p>
                    </form>
                </div>

                {/* Section 6: Lokasi & Showroom Card (Identical Style) */}
                <div className="rounded-2xl border border-brand-900/60 bg-brand-950 p-6 text-white shadow-lg sm:rounded-3xl sm:p-10">
                    <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
                        <div className="space-y-3 text-center md:text-left">
                            <div className="inline-flex items-center gap-1.5 rounded-full bg-brand-900 px-3 py-1 text-xs font-semibold text-accent-copper">
                                <MapPin className="h-3.5 w-3.5" />
                                <span>Lokasi Kami di Malang</span>
                            </div>
                            <h3 className="text-xl font-black text-white sm:text-2xl">
                                Alat Kopi Malang
                            </h3>
                            <p className="max-w-lg text-xs leading-relaxed text-brand-300 sm:text-sm">
                                {address}
                            </p>
                            <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-brand-300 md:justify-start">
                                <span className="inline-flex items-center gap-1.5">
                                    <Clock className="h-4 w-4 text-accent-copper" />
                                    <span>{hours}</span>
                                </span>
                                <span className="inline-flex items-center gap-1.5">
                                    <Phone className="h-4 w-4 text-emerald-400" />
                                    <span>+{cleanWhatsapp}</span>
                                </span>
                            </div>
                        </div>

                        <div className="flex w-full flex-col items-center gap-3 sm:flex-row md:w-auto">
                            <a
                                href={mapsUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-xs font-bold text-brand-950 shadow-md transition-colors hover:bg-brand-50 sm:w-auto sm:text-sm"
                            >
                                <MapPin className="h-4 w-4 text-accent-copper" />
                                <span>Buka Google Maps</span>
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </PublicLayout>
    );
}
