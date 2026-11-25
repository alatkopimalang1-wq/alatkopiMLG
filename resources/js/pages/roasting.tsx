import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import { ArrowRight, Check, MessageCircle } from 'lucide-react';
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

interface RoastingPageProps {
    page?: {
        hero_badge?: string;
        hero_title?: string;
        hero_description?: string;
        hero_image?: string;
        packages?: Array<{
            name: string;
            capacity?: string;
            price?: string;
            badge?: string;
            is_popular?: boolean;
            description?: string;
            features?: string | string[];
        }>;
        gallery_title?: string;
        gallery_subtitle?: string;
        grid_desktop?: number | string;
        grid_tablet?: number | string;
        grid_mobile?: number | string;
        image_aspect?: string;
        gallery_images?: Array<{ image: string; caption?: string }>;
        whatsapp_number?: string;
        form_title?: string;
        form_subtitle?: string;
    };
}

export default function RoastingPage({ page }: RoastingPageProps) {
    const heroBadge = page?.hero_badge || 'Layanan Roasting Kopi Profesional';
    const heroTitle =
        page?.hero_title || 'Jasa Roasting Biji Kopi Presisi & Profil Kustom';
    const heroDesc =
        page?.hero_description ||
        'Percayakan biji kopi mentah (green bean) pilihan Anda kepada roaster berpengalaman kami. Didukung mesin roasting modern bersistem airflow digital, pemantauan kurva artisan, dan quality control sensorik cupping.';
    const heroImage = page?.hero_image
        ? resolveImageUrl(page.hero_image)
        : 'https://images.unsplash.com/photo-1442512595331-e89e73853f31?auto=format&fit=crop&w=1200&q=80';

    const packages =
        page?.packages && page.packages.length > 0
            ? page.packages
            : [
                  {
                      name: 'Sample & R&D Profile',
                      capacity: '1 – 3 kg',
                      price: 'Rp 45.000 / kg',
                      badge: 'Riset Resep',
                      is_popular: false,
                      description:
                          'Ideal untuk riset profil rasa baru atau pengujian sampel green bean sebelum komitmen skala besar.',
                      features: [
                          'Perekaman kurva Artisan',
                          'Uji cupping & sensorik notes',
                          'Opsi profil Filter & Espresso',
                          'Kemasan sample standing pouch',
                      ],
                  },
                  {
                      name: 'Batch Komersial (Kedai Kopi)',
                      capacity: '5 – 30 kg',
                      price: 'Rp 28.000 / kg',
                      badge: 'Paling Populer',
                      is_popular: true,
                      description:
                          'Pilihan utama kedai kopi dan brand independen yang membutuhkan pasokan houseblend atau single origin rutin mingguan.',
                      features: [
                          'Profil sangrai eksklusif tersimpan',
                          'Jaminan konsistensi antar-batch',
                          'Proses destoner pembersih kerikil',
                          'Pengemasan standing pouch dengan valve',
                          'Diskon volume untuk kontrak bulanan',
                      ],
                  },
                  {
                      name: 'Batch Skala Besar & Maklon',
                      capacity: '> 50 kg',
                      price: 'Rp 22.000 / kg',
                      badge: 'Harga Grosir',
                      is_popular: false,
                      description:
                          'Layanan maklon sangrai volume besar untuk roastery partner, distributor, dan pengadaan oleh-oleh / korporat.',
                      features: [
                          'Kapasitas sangrai terjadwal prioritas',
                          'Layanan labeling & sablon kemasan',
                          'Laporan quality control lengkap',
                          'Pengiriman via kargo darat/udara murah',
                      ],
                  },
              ];

    const galleryTitle =
        page?.gallery_title || 'Galeri Fasilitas & Proses Sangrai';
    const gallerySubtitle =
        page?.gallery_subtitle ||
        'Dokumentasi studio sangrai, mesin roasting, dan quality control cupping di Alat Kopi Malang.';
    const gridDesktop = page?.grid_desktop ?? '3';
    const gridTablet = page?.grid_tablet ?? '2';
    const gridMobile = page?.grid_mobile ?? '1';
    const imageAspect = page?.image_aspect || 'aspect-4/3';
    const galleryImages =
        page?.gallery_images && page.gallery_images.length > 0
            ? page.gallery_images
            : [
                  {
                      image: 'https://images.unsplash.com/photo-1442512595331-e89e73853f31?auto=format&fit=crop&w=800&q=80',
                      caption:
                          'Proses Sangrai Biji Kopi Menggunakan Mesin Roasting Presisi',
                  },
                  {
                      image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80',
                      caption:
                          'Pendinginan Cepat (Cooling Bin) Biji Kopi Sangrai Segar',
                  },
                  {
                      image: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=800&q=80',
                      caption: 'Cupping Session Sensorik Bersama Head Roaster',
                  },
                  {
                      image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=800&q=80',
                      caption: 'Pemeriksaan Visual Warna Sangrai Agtron Scale',
                  },
                  {
                      image: 'https://images.unsplash.com/photo-1511920170033-f8396924c348?auto=format&fit=crop&w=800&q=80',
                      caption:
                          'Pengemasan Biji Kopi Fresh Roast dengan Valve Food Grade',
                  },
                  {
                      image: 'https://images.unsplash.com/photo-1521017432531-fbd92d768814?auto=format&fit=crop&w=800&q=80',
                      caption:
                          'Green Bean Pilihan Terkurasi Siap Masuk Drum Sangrai',
                  },
              ];

    const waNumber = page?.whatsapp_number || '6282132095241';
    const formTitle = page?.form_title || 'Formulir Konsultasi Jasa Roasting';
    const formSubtitle =
        page?.form_subtitle ||
        'Isi detail biji kopi dan kebutuhan sangrai Anda untuk langsung terhubung dengan head roaster kami.';

    // Interactive Form States
    const [clientName, setClientName] = useState('');
    const [brandName, setBrandName] = useState('');
    const [contactPhone, setContactPhone] = useState('');
    const [coffeeOrigin, setCoffeeOrigin] = useState('');
    const [estimatedVolume, setEstimatedVolume] = useState(
        '5 – 10 kg (Batch Mingguan)',
    );
    const [roastLevel, setRoastLevel] = useState('Medium Roast (Omniroast)');
    const [notes, setNotes] = useState('');

    const handleWhatsAppSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const msg =
            `Halo Tim Roaster Sanubari!\nSaya tertarik dengan Layanan Jasa Roasting Kopi:\n\n` +
            `• Nama PIC: ${clientName}\n` +
            `• Nama Brand/Kedai: ${brandName || '-'}\n` +
            `• No. WhatsApp: ${contactPhone}\n` +
            `• Origin / Jenis Biji Kopi: ${coffeeOrigin || 'Belum ditentukan'}\n` +
            `• Estimasi Volume: ${estimatedVolume}\n` +
            `• Target Profil Sangrai: ${roastLevel}\n` +
            (notes ? `• Catatan / Permintaan: ${notes}\n\n` : `\n`) +
            `Mohon informasi ketersediaan jadwal roasting dan estimasi biayanya. Terima kasih!`;
        window.open(
            `https://wa.me/${waNumber}?text=${encodeURIComponent(msg)}`,
            '_blank',
        );
    };

    return (
        <PublicLayout title="Jasa Roasting Kopi Presisi & Maklon | Alat Kopi Malang">
            {/* Header Hero Section */}
            <div className="border-b border-brand-900/60 bg-brand-950 px-4 py-12 text-white sm:px-6 sm:py-20 lg:px-8">
                <div className="mx-auto max-w-4xl space-y-3 text-center sm:space-y-4">
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

            <div className="mx-auto max-w-7xl space-y-14 px-4 py-10 sm:space-y-20 sm:px-6 sm:py-16 lg:px-8">
                {/* Section: Pilihan Paket & Biaya Sangrai */}
                <div
                    id="paket-harga"
                    className="scroll-mt-20 space-y-6 sm:space-y-8"
                >
                    <div className="mx-auto max-w-2xl space-y-2 text-center">
                        <span className="text-xs font-bold tracking-wider text-accent-copper uppercase">
                            Estimasi Kapasitas & Biaya
                        </span>
                        <h2 className="text-xl font-extrabold tracking-tight text-brand-950 sm:text-3xl">
                            Pilihan Paket Layanan Roasting
                        </h2>
                        <p className="text-xs leading-relaxed text-brand-600 sm:text-sm">
                            Pilih kuota batch yang paling sesuai dengan ritme
                            konsumsi kedai atau rencana peluncuran produk Anda.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 items-stretch gap-6 md:grid-cols-3">
                        {packages.map((pkg, idx) => {
                            const featureList = Array.isArray(pkg.features)
                                ? pkg.features
                                : typeof pkg.features === 'string'
                                  ? pkg.features.split('\n').filter(Boolean)
                                  : [];

                            return (
                                <div
                                    key={idx}
                                    className={`relative flex flex-col justify-between rounded-2xl p-6 transition-all duration-300 sm:rounded-3xl sm:p-8 ${
                                        pkg.is_popular
                                            ? 'bg-brand-950 text-white shadow-xl ring-2 ring-accent-copper lg:-translate-y-2'
                                            : 'border border-brand-100 bg-white text-brand-950 shadow-sm hover:shadow-md'
                                    }`}
                                >
                                    {pkg.badge && (
                                        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                                            <span
                                                className={`rounded-full px-3 py-1 text-xs font-bold tracking-wide uppercase shadow-2xs ${
                                                    pkg.is_popular
                                                        ? 'bg-accent-copper text-brand-950'
                                                        : 'bg-sand-200 text-brand-900'
                                                }`}
                                            >
                                                {pkg.badge}
                                            </span>
                                        </div>
                                    )}

                                    <div className="space-y-4">
                                        <div className="space-y-1">
                                            <h3 className="text-lg font-extrabold sm:text-xl">
                                                {pkg.name}
                                            </h3>
                                            {pkg.capacity && (
                                                <p
                                                    className={`text-xs font-medium sm:text-sm ${pkg.is_popular ? 'text-brand-300' : 'text-brand-500'}`}
                                                >
                                                    Kapasitas: {pkg.capacity}
                                                </p>
                                            )}
                                        </div>

                                        <div className="border-t border-brand-800/40 pt-2">
                                            <span className="text-2xl font-black tracking-tight sm:text-3xl">
                                                {pkg.price || 'Hubungi Kami'}
                                            </span>
                                        </div>

                                        {pkg.description && (
                                            <p
                                                className={`text-xs leading-relaxed sm:text-sm ${pkg.is_popular ? 'text-brand-200/90' : 'text-brand-600'}`}
                                            >
                                                {pkg.description}
                                            </p>
                                        )}

                                        {featureList.length > 0 && (
                                            <ul className="space-y-2.5 pt-2">
                                                {featureList.map((f, fIdx) => (
                                                    <li
                                                        key={fIdx}
                                                        className="flex items-start gap-2 text-xs sm:text-sm"
                                                    >
                                                        <Check
                                                            className={`mt-0.5 h-4 w-4 shrink-0 ${pkg.is_popular ? 'text-accent-copper' : 'text-emerald-600'}`}
                                                        />
                                                        <span
                                                            className={
                                                                pkg.is_popular
                                                                    ? 'text-brand-100'
                                                                    : 'text-brand-800'
                                                            }
                                                        >
                                                            {f}
                                                        </span>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>

                                    <div className="pt-6">
                                        <a
                                            href="#konsultasi"
                                            className={`inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-center text-xs font-bold transition-colors sm:text-sm ${
                                                pkg.is_popular
                                                    ? 'bg-accent-copper text-brand-950 shadow-sm hover:bg-accent-copper/90'
                                                    : 'bg-brand-950 text-white hover:bg-brand-800'
                                            }`}
                                        >
                                            <span>Pilih Paket Ini</span>
                                            <ArrowRight className="h-3.5 w-3.5" />
                                        </a>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Section: Galeri Foto Suasana Roastery */}
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
                                    className="group relative overflow-hidden rounded-xl border border-brand-100/60 bg-sand-200/50 shadow-2xs sm:rounded-2xl"
                                >
                                    <div
                                        className={`${getAspectClass(imageAspect)} w-full overflow-hidden`}
                                    >
                                        <img
                                            src={resolveImageUrl(item.image)}
                                            alt={
                                                item.caption ||
                                                `Galeri Roasting ${idx + 1}`
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

                {/* Section: Form & Konsultasi WhatsApp Langsung */}
                <div
                    id="konsultasi"
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
                                    value={clientName}
                                    onChange={(e) =>
                                        setClientName(e.target.value)
                                    }
                                    placeholder="Contoh: Dimas Aditya"
                                    className="h-8.5 w-full rounded-lg border border-brand-200 bg-white px-2.5 text-xs text-brand-950 outline-none focus:border-brand-800 sm:h-10 sm:rounded-xl sm:px-3 sm:text-sm"
                                />
                            </div>
                            <div className="space-y-0.5 sm:space-y-1">
                                <label className="block text-[11px] font-semibold text-brand-900 sm:text-xs">
                                    Nama Brand / Kedai Kopi
                                </label>
                                <input
                                    type="text"
                                    value={brandName}
                                    onChange={(e) =>
                                        setBrandName(e.target.value)
                                    }
                                    placeholder="Contoh: Titik Koma Kopi"
                                    className="h-8.5 w-full rounded-lg border border-brand-200 bg-white px-2.5 text-xs text-brand-950 outline-none focus:border-brand-800 sm:h-10 sm:rounded-xl sm:px-3 sm:text-sm"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-4">
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
                                    Estimasi Kebutuhan Batch *
                                </label>
                                <select
                                    value={estimatedVolume}
                                    onChange={(e) =>
                                        setEstimatedVolume(e.target.value)
                                    }
                                    className="h-8.5 w-full rounded-lg border border-brand-200 bg-white px-2.5 text-xs text-brand-950 outline-none focus:border-brand-800 sm:h-10 sm:rounded-xl sm:px-3 sm:text-sm"
                                >
                                    <option value="Sample 1 – 3 kg (Uji Profil)">
                                        Sample 1 – 3 kg (Uji Profil)
                                    </option>
                                    <option value="5 – 10 kg (Batch Mingguan)">
                                        5 – 10 kg (Batch Mingguan)
                                    </option>
                                    <option value="10 – 30 kg / batch">
                                        10 – 30 kg / batch
                                    </option>
                                    <option value="> 50 kg (Maklon Besar)">
                                        &gt; 50 kg (Maklon Besar)
                                    </option>
                                </select>
                            </div>
                        </div>

                        <div className="space-y-0.5 sm:space-y-1">
                            <label className="block text-[11px] font-semibold text-brand-900 sm:text-xs">
                                Asal / Origin Biji Kopi Hijau (Green Bean)
                            </label>
                            <input
                                type="text"
                                value={coffeeOrigin}
                                onChange={(e) =>
                                    setCoffeeOrigin(e.target.value)
                                }
                                placeholder="Contoh: Biji Sendiri / Pasokan Sanubari"
                                className="h-8.5 w-full rounded-lg border border-brand-200 bg-white px-2.5 text-xs text-brand-950 outline-none focus:border-brand-800 sm:h-10 sm:rounded-xl sm:px-3 sm:text-sm"
                            />
                        </div>

                        <div className="space-y-0.5 sm:space-y-1">
                            <label className="block text-[11px] font-semibold text-brand-900 sm:text-xs">
                                Preferensi Profil Sangrai
                            </label>
                            <select
                                value={roastLevel}
                                onChange={(e) => setRoastLevel(e.target.value)}
                                className="h-8.5 w-full rounded-lg border border-brand-200 bg-white px-2.5 text-xs text-brand-950 outline-none focus:border-brand-800 sm:h-10 sm:rounded-xl sm:px-3 sm:text-sm"
                            >
                                <option value="Light to Medium (Filter)">
                                    Light to Medium (Filter)
                                </option>
                                <option value="Medium Roast (Omniroast)">
                                    Medium Roast (Omniroast)
                                </option>
                                <option value="Medium to Dark (Espresso)">
                                    Medium to Dark (Espresso)
                                </option>
                                <option value="Konsultasi Bersama Roaster">
                                    Konsultasi Bersama Roaster
                                </option>
                            </select>
                        </div>

                        <div className="space-y-0.5 sm:space-y-1">
                            <label className="block text-[11px] font-semibold text-brand-900 sm:text-xs">
                                Catatan / Pertanyaan Tambahan (Opsional)
                            </label>
                            <textarea
                                rows={2}
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Catatan tasting notes, jadwal kirim, dll."
                                className="w-full resize-none rounded-lg border border-brand-200 bg-white p-2.5 text-xs text-brand-950 outline-none focus:border-brand-800 sm:rounded-xl sm:text-sm"
                            />
                        </div>

                        <button
                            type="submit"
                            className="flex w-full cursor-pointer items-center justify-center gap-2.5 rounded-xl bg-[#128C7E] px-5 py-3.5 text-sm font-extrabold text-white shadow-md transition-all hover:bg-[#0e7467] hover:shadow-lg active:scale-[0.99] sm:rounded-2xl sm:py-4 sm:text-base"
                        >
                            <MessageCircle className="h-5 w-5 shrink-0 sm:h-6 sm:w-6" />
                            <span>Kirim ke WhatsApp</span>
                        </button>
                    </form>
                </div>
            </div>
        </PublicLayout>
    );
}
