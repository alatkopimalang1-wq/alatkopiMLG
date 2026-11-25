import React, { useState } from 'react';
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

const getPackageContainerClass = (count: number) => {
    if (count <= 1)
        return 'max-w-md mx-auto grid grid-cols-1 gap-6 items-stretch justify-center';
    if (count === 2)
        return 'max-w-3xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch justify-center';
    if (count === 3)
        return 'max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch justify-center';
    return 'max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch justify-center';
};

interface BaristaTrainingPageProps {
    page?: {
        hero_badge?: string;
        hero_title?: string;
        hero_description?: string;
        hero_image?: string;
        packages?: Array<{
            name: string;
            duration?: string;
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

export default function BaristaTrainingPage({
    page,
}: BaristaTrainingPageProps) {
    const heroBadge =
        page?.hero_badge || 'Kelas Barista Profesional & Sertifikasi';
    const heroTitle =
        page?.hero_title ||
        'Training Barista Bersertifikat & Edukasi Seduh Spesialis';
    const heroDesc =
        page?.hero_description ||
        'Tingkatkan keahlian seduh kopi Anda dari dasar hingga siap kerja atau buka kedai. Dibimbing langsung oleh trainer dan roaster berpengalaman dengan mesin komersial standar industri di Sanubari Malang.';
    const heroImage = page?.hero_image
        ? resolveImageUrl(page.hero_image)
        : 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=1200&q=80';

    const packages =
        page?.packages && page.packages.length > 0
            ? page.packages
            : [
                  {
                      name: 'Kelas Basic',
                      duration: '2 Hari (4-5 Jam / hari)',
                      price: 'Rp 1.500.000 / 2 Orang',
                      badge: 'PEMULA',
                      is_popular: false,
                      description:
                          'Kelas dasar komprehensif bagi pemula atau calon barista untuk menguasai kalibrasi espresso dan teknik susu yang sempurna.',
                      features: [
                          'Teori dasar biji kopi',
                          'Mengenal dasar manual brew dan espresso based',
                          'Teknik pouring, ratio, ekstraksi kopi manual brew',
                          'Latte art pola dasar',
                          'SOP kebersihan mesin & daily maintenance',
                          'Sertifikat Resmi Alat Kopi Malang',
                          'Bisa diisi untuk 2 Orang',
                          'Jam bisa menyesuaikan',
                      ],
                  },
                  {
                      name: 'Kelas Advance',
                      duration: '3 Hari (4-5 jam / hari)',
                      price: 'Rp 1.900.000 / 2 orang',
                      badge: 'ADVANCE',
                      is_popular: true,
                      description:
                          'Kelas dasar komprehensif bagi pemula atau calon barista untuk menguasai kalibrasi espresso dan membuat menu milk based, mocktail dan menu kekinian.',
                      features: [
                          'Teori dasar biji kopi',
                          'Mengenal dasar manual brew dan espresso based',
                          'Teknik pouring, ratio, ekstraksi kopi manual brew',
                          'Latte art pola dasar',
                          'SOP kebersihan mesin kopi dan maintenance',
                          'Meracik minuman dingin seperti mocktail, milk based, es kopi susu',
                          'Sertifikat resmi Alat Kopi Malang',
                          'Bisa diisi untuk 2 orang',
                          'Jadwal bisa menyesuaikan',
                      ],
                  },
              ];

    const galleryTitle =
        page?.gallery_title || 'Dokumentasi & Suasana Kelas Barista';
    const gallerySubtitle =
        page?.gallery_subtitle ||
        'Momen praktik peserta mengasah teknik espresso, latte art, dan manual brew di Alat Kopi Malang.';
    const gridDesktop = page?.grid_desktop ?? '3';
    const gridTablet = page?.grid_tablet ?? '2';
    const gridMobile = page?.grid_mobile ?? '1';
    const imageAspect = page?.image_aspect || 'aspect-4/3';
    const galleryImages =
        page?.gallery_images && page.gallery_images.length > 0
            ? page.gallery_images
            : [
                  {
                      image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80',
                      caption:
                          'Praktik Kalibrasi Grinder dan Ekstraksi Espresso Mesin Komersial',
                  },
                  {
                      image: 'https://images.unsplash.com/photo-1534040385115-33dcb3acba5b?auto=format&fit=crop&w=800&q=80',
                      caption:
                          'Latihan Teknik Milk Steaming dan Pouring Latte Art Presisi',
                  },
                  {
                      image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=800&q=80',
                      caption:
                          'Teknik Manual Brew Pour Over V60 Memperhatikan Flow Rate',
                  },
                  {
                      image: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=800&q=80',
                      caption:
                          'Sesi Cupping Sensory Mengidentifikasi Tasting Notes Kopi',
                  },
                  {
                      image: 'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?auto=format&fit=crop&w=800&q=80',
                      caption:
                          'Simulasi Alur Kerja Barista Saat Menghadapi Rush Hour Kedai',
                  },
                  {
                      image: 'https://images.unsplash.com/photo-1442512595331-e89e73853f31?auto=format&fit=crop&w=800&q=80',
                      caption:
                          'Suasana Belajar Nyaman di Alat Kopi Malang Showroom Malang',
                  },
              ];

    const waNumber = page?.whatsapp_number || '6285121930454';
    const formTitle =
        page?.form_title || 'Formulir Pendaftaran & Konsultasi Kelas Barista';
    const formSubtitle =
        page?.form_subtitle ||
        'Daftarkan diri Anda atau konsultasikan jadwal kelas privat langsung dengan tim trainer kami via WhatsApp.';

    // Interactive Form States
    const [fullName, setFullName] = useState('');
    const [contactPhone, setContactPhone] = useState('');
    const [selectedPackage, setSelectedPackage] = useState('Kelas Basic');
    const [participantCount, setParticipantCount] = useState('1 Orang');
    const [experienceLevel, setExperienceLevel] = useState(
        'Pemula Total (Belum Pernah)',
    );
    const [preferredSchedule, setPreferredSchedule] = useState(
        'Akhir Pekan (Sabtu / Minggu)',
    );
    const [notes, setNotes] = useState('');

    const handleWhatsAppSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const msg =
            `Halo Tim Barista Academy Sanubari!\nSaya ingin mendaftar / konsultasi Kelas Barista:\n\n` +
            `• Nama Peserta / PIC: ${fullName}\n` +
            `• No. WhatsApp: ${contactPhone}\n` +
            `• Pilihan Program: ${selectedPackage}\n` +
            `• Jumlah Peserta: ${participantCount}\n` +
            `• Tingkat Pengalaman: ${experienceLevel}\n` +
            `• Preferensi Jadwal: ${preferredSchedule}\n` +
            (notes ? `• Catatan / Pertanyaan Khusus: ${notes}\n\n` : `\n`) +
            `Mohon informasi ketersediaan jadwal terdekat dan konfirmasi pendaftarannya. Terima kasih!`;
        window.open(
            `https://wa.me/${waNumber}?text=${encodeURIComponent(msg)}`,
            '_blank',
        );
    };

    return (
        <PublicLayout title="Training Barista Profesional & Sertifikasi | Alat Kopi Malang">
            {/* Header Hero Section */}
            <div className="relative overflow-hidden border-b border-brand-900/60 bg-brand-950 px-4 py-12 text-white sm:px-6 sm:py-20 lg:px-8">
                {heroImage && (
                    <div className="pointer-events-none absolute inset-0 opacity-15">
                        <img
                            src={heroImage}
                            alt=""
                            className="h-full w-full object-cover"
                        />
                    </div>
                )}
                <div className="relative mx-auto max-w-4xl space-y-3 text-center sm:space-y-4">
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
                {/* Section: Pilihan Program & Paket Pelatihan */}
                <div
                    id="paket-kelas"
                    className="scroll-mt-20 space-y-6 sm:space-y-8"
                >
                    <div className="mx-auto max-w-2xl space-y-2 text-center">
                        <span className="text-xs font-bold tracking-wider text-accent-copper uppercase">
                            Investasi Keterampilan & Karir
                        </span>
                        <h2 className="text-xl font-extrabold tracking-tight text-brand-950 sm:text-3xl">
                            Pilihan Program Training Barista
                        </h2>
                        <p className="text-xs leading-relaxed text-brand-600 sm:text-sm">
                            Pilih program yang sesuai dengan tujuan Anda:
                            memulai hobi seduh di rumah, melamar kerja barista,
                            atau membuka kedai kopi mandiri.
                        </p>
                    </div>

                    <div className={getPackageContainerClass(packages.length)}>
                        {packages.map((pkg, idx) => {
                            const featureList = Array.isArray(pkg.features)
                                ? pkg.features
                                : typeof pkg.features === 'string'
                                  ? pkg.features.split('\n').filter(Boolean)
                                  : [];

                            return (
                                <div
                                    key={idx}
                                    className={`relative flex flex-col justify-between rounded-2xl p-6 transition-all duration-300 sm:rounded-3xl sm:p-7 ${
                                        pkg.is_popular
                                            ? 'bg-brand-950 text-white shadow-xl ring-2 ring-accent-copper lg:-translate-y-2'
                                            : 'border border-brand-100 bg-white text-brand-950 shadow-sm hover:shadow-md'
                                    }`}
                                >
                                    {pkg.badge && (
                                        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                                            <span
                                                className={`rounded-full px-3 py-1 text-[11px] font-bold tracking-wide whitespace-nowrap uppercase shadow-2xs ${
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
                                            <h3 className="text-base leading-snug font-extrabold sm:text-lg">
                                                {pkg.name}
                                            </h3>
                                            {pkg.duration && (
                                                <p
                                                    className={`text-xs font-semibold ${pkg.is_popular ? 'text-brand-300' : 'text-brand-500'}`}
                                                >
                                                    ⏱ Durasi: {pkg.duration}
                                                </p>
                                            )}
                                        </div>

                                        <div className="border-t border-brand-800/40 pt-2">
                                            <span className="text-xl font-black tracking-tight sm:text-2xl">
                                                {pkg.price || 'Hubungi Kami'}
                                            </span>
                                        </div>

                                        {pkg.description && (
                                            <p
                                                className={`text-xs leading-relaxed ${pkg.is_popular ? 'text-brand-200/90' : 'text-brand-600'}`}
                                            >
                                                {pkg.description}
                                            </p>
                                        )}

                                        {featureList.length > 0 && (
                                            <ul className="space-y-2 pt-2">
                                                {featureList.map((f, fIdx) => (
                                                    <li
                                                        key={fIdx}
                                                        className="flex items-start gap-2 text-xs"
                                                    >
                                                        <Check
                                                            className={`mt-0.5 h-3.5 w-3.5 shrink-0 ${pkg.is_popular ? 'text-accent-copper' : 'text-emerald-600'}`}
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
                                            href="#daftar"
                                            onClick={() =>
                                                setSelectedPackage(
                                                    pkg.name
                                                        .toLowerCase()
                                                        .includes('advance')
                                                        ? 'Kelas Advance'
                                                        : 'Kelas Basic',
                                                )
                                            }
                                            className={`inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-center text-xs font-bold transition-colors ${
                                                pkg.is_popular
                                                    ? 'bg-accent-copper text-brand-950 shadow-sm hover:bg-accent-copper/90'
                                                    : 'bg-brand-950 text-white hover:bg-brand-800'
                                            }`}
                                        >
                                            <span>Daftar Kelas Ini</span>
                                            <ArrowRight className="h-3.5 w-3.5" />
                                        </a>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Section: Galeri Foto Suasana Belajar & Praktik */}
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
                                                `Galeri Training Barista ${idx + 1}`
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

                {/* Section: Form Pendaftaran WhatsApp Interaktif */}
                <div
                    id="daftar"
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
                                    Nama Lengkap Peserta / PIC *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={fullName}
                                    onChange={(e) =>
                                        setFullName(e.target.value)
                                    }
                                    placeholder="Contoh: Rian Pratama"
                                    className="h-8.5 w-full rounded-lg border border-brand-200 bg-white px-2.5 text-xs text-brand-950 outline-none focus:border-brand-800 sm:h-10 sm:rounded-xl sm:px-3 sm:text-sm"
                                />
                            </div>
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
                        </div>

                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-4">
                            <div className="space-y-0.5 sm:space-y-1">
                                <label className="block text-[11px] font-semibold text-brand-900 sm:text-xs">
                                    Pilihan Program Kelas *
                                </label>
                                <select
                                    value={selectedPackage}
                                    onChange={(e) =>
                                        setSelectedPackage(e.target.value)
                                    }
                                    className="h-8.5 w-full rounded-lg border border-brand-200 bg-white px-2.5 text-xs text-brand-950 outline-none focus:border-brand-800 sm:h-10 sm:rounded-xl sm:px-3 sm:text-sm"
                                >
                                    <option value="Kelas Basic">
                                        Kelas Basic
                                    </option>
                                    <option value="Kelas Advance">
                                        Kelas Advance
                                    </option>
                                </select>
                            </div>
                            <div className="space-y-0.5 sm:space-y-1">
                                <label className="block text-[11px] font-semibold text-brand-900 sm:text-xs">
                                    Jumlah Peserta
                                </label>
                                <select
                                    value={participantCount}
                                    onChange={(e) =>
                                        setParticipantCount(e.target.value)
                                    }
                                    className="h-8.5 w-full rounded-lg border border-brand-200 bg-white px-2.5 text-xs text-brand-950 outline-none focus:border-brand-800 sm:h-10 sm:rounded-xl sm:px-3 sm:text-sm"
                                >
                                    <option value="1 Orang">1 Orang</option>
                                    <option value="2 Orang">2 Orang</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-4">
                            <div className="space-y-0.5 sm:space-y-1">
                                <label className="block text-[11px] font-semibold text-brand-900 sm:text-xs">
                                    Tingkat Pengalaman Saat Ini
                                </label>
                                <select
                                    value={experienceLevel}
                                    onChange={(e) =>
                                        setExperienceLevel(e.target.value)
                                    }
                                    className="h-8.5 w-full rounded-lg border border-brand-200 bg-white px-2.5 text-xs text-brand-950 outline-none focus:border-brand-800 sm:h-10 sm:rounded-xl sm:px-3 sm:text-sm"
                                >
                                    <option value="Pemula Total (Belum Pernah)">
                                        Pemula Total (Belum Pernah)
                                    </option>
                                    <option value="Hobi Seduh Manual di Rumah">
                                        Hobi Seduh Manual di Rumah
                                    </option>
                                    <option value="Pernah Bekerja Sebagai Barista">
                                        Pernah Bekerja Sebagai Barista
                                    </option>
                                    <option value="Calon Pemilik / Owner Kedai Kopi">
                                        Calon Pemilik / Owner Kedai Kopi
                                    </option>
                                </select>
                            </div>
                            <div className="space-y-0.5 sm:space-y-1">
                                <label className="block text-[11px] font-semibold text-brand-900 sm:text-xs">
                                    Preferensi Jadwal Kelas
                                </label>
                                <select
                                    value={preferredSchedule}
                                    onChange={(e) =>
                                        setPreferredSchedule(e.target.value)
                                    }
                                    className="h-8.5 w-full rounded-lg border border-brand-200 bg-white px-2.5 text-xs text-brand-950 outline-none focus:border-brand-800 sm:h-10 sm:rounded-xl sm:px-3 sm:text-sm"
                                >
                                    <option value="Akhir Pekan (Sabtu / Minggu)">
                                        Akhir Pekan (Sabtu / Minggu)
                                    </option>
                                    <option value="Hari Kerja (Senin – Jumat)">
                                        Hari Kerja (Senin – Jumat)
                                    </option>
                                    <option value="Jadwal Fleksibel (Private Class)">
                                        Jadwal Fleksibel (Private Class)
                                    </option>
                                </select>
                            </div>
                        </div>

                        <div className="space-y-0.5 sm:space-y-1">
                            <label className="block text-[11px] font-semibold text-brand-900 sm:text-xs">
                                Catatan / Pertanyaan Tambahan (Opsional)
                            </label>
                            <textarea
                                rows={2}
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Tuliskan jika ada tanggal target, rencana buka kedai, atau permintaan materi khusus."
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
