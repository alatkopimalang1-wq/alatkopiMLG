import React, { useState } from 'react';
import {
    Camera,
    CheckCircle2,
    Coffee,
    MessageCircle,
    Settings,
    Sparkles,
    Truck,
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
        case 'aspect-3/2':
            return 'aspect-3/2';
        case 'aspect-4/3':
        default:
            return 'aspect-4/3';
    }
};

interface WholesaleBenefit {
    title: string;
    description: string;
    image?: string | null;
}

interface WholesalePageProps {
    page?: {
        hero_badge?: string;
        hero_title?: string;
        hero_description?: string;
        hero_image?: string;
        benefits?: WholesaleBenefit[];
        whatsapp_number?: string;
        form_image?: string;
        form_badge?: string;
        form_title?: string;
        form_subtitle?: string;
        gallery_title?: string;
        gallery_subtitle?: string;
        grid_desktop?: number | string;
        grid_tablet?: number | string;
        grid_mobile?: number | string;
        image_aspect?: string;
        gallery_images?: Array<{ image: string; caption?: string }>;
    };
}

export default function WholesalePage({ page }: WholesalePageProps) {
    const heroBadge = page?.hero_badge || 'Kemitraan B2B & Pasokan Kedai';
    const heroTitle =
        page?.hero_title || 'Pasokan Biji Kopi Grosir & Setup Kedai';
    const heroDesc =
        page?.hero_description ||
        'Konsistensi rasa dari batch ke batch, profil sangrai kustom untuk signature drink, dan bundling mesin espresso komersial bersama Alat Kopi Malang.';
    const heroImage = page?.hero_image
        ? resolveImageUrl(page.hero_image)
        : null;

    const benefits: WholesaleBenefit[] =
        page?.benefits && page.benefits.length > 0
            ? page.benefits
            : [
                  {
                      title: 'Harga Grosir Bertingkat',
                      description:
                          'Potongan harga berjenjang mulai dari order 5 kg, 10 kg, hingga kontrak pasokan bulanan rutin dengan jaminan ketersediaan stok panen.',
                      image: null,
                  },
                  {
                      title: 'Custom Roast Profile',
                      description:
                          'Kembangkan profil sangrai eksklusif (signature houseblend) khusus untuk karakter menu coffee shop Anda bersama head roaster kami.',
                      image: null,
                  },
                  {
                      title: 'Paket Mesin & Barista Training',
                      description:
                          'Bundling mesin espresso komersial, grinder, dan kalibrasi seduh berkala bersama tim teknisi Alat Kopi Malang.',
                      image: null,
                  },
              ];

    const waNumber = page?.whatsapp_number || '6282132095241';
    const formImage = page?.form_image
        ? resolveImageUrl(page.form_image)
        : null;
    const formBadge = page?.form_badge || 'Partner Terpercaya 50+ Kedai Kopi';
    const formTitle =
        page?.form_title || 'Formulir Kemitraan Langsung WhatsApp';
    const formSubtitle =
        page?.form_subtitle ||
        'Isi detail singkat usaha Anda untuk langsung berkonsultasi dengan tim kemitraan kami.';

    const galleryTitle =
        page?.gallery_title || 'Dokumentasi Kemitraan & Pasokan Kedai';
    const gallerySubtitle =
        page?.gallery_subtitle ||
        'Setup mesin espresso komersial, kalibrasi rasa, dan pasokan rutin biji kopi di berbagai coffee shop mitra kami.';
    const gridDesktop = page?.grid_desktop ?? '3';
    const gridTablet = page?.grid_tablet ?? '2';
    const gridMobile = page?.grid_mobile ?? '1';
    const imageAspect = page?.image_aspect || 'aspect-4/3';
    const galleryImages =
        page?.gallery_images && page.gallery_images.length > 0
            ? page.gallery_images
            : [];

    const [cafeName, setCafeName] = useState('');
    const [city, setCity] = useState('');
    const [contactName, setContactName] = useState('');
    const [phone, setPhone] = useState('');
    const [volume, setVolume] = useState('10 - 30 kg/bulan');

    const handleWhatsAppSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const msg = `Halo Tim Alat Kopi Malang!\nSaya tertarik bermitra wholesale/B2B:\n\nNama Kedai/Usaha: ${cafeName}\nKota: ${city}\nNama PIC: ${contactName}\nWhatsApp: ${phone}\nEstimasi Kebutuhan: ${volume}\n\nMohon informasi pricelist grosir dan katalog varietas kopi. Terima kasih!`;
        window.open(
            `https://wa.me/${waNumber}?text=${encodeURIComponent(msg)}`,
            '_blank',
        );
    };

    return (
        <PublicLayout title="Wholesale & Kemitraan Kedai Kopi (B2B) | Alat Kopi Malang">
            {/* Header Hero Banner */}
            <div className="relative overflow-hidden bg-brand-950 px-4 py-14 text-center text-white sm:px-6 sm:py-24 lg:px-8">
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

            <div className="mx-auto max-w-7xl space-y-16 px-4 py-10 sm:space-y-20 sm:px-6 sm:py-16 lg:px-8">
                {/* Benefits Grid */}
                <div className="space-y-6">
                    <div className="mx-auto max-w-2xl space-y-2 text-center">
                        <h2 className="text-xl font-extrabold text-brand-950 sm:text-3xl">
                            Keuntungan Bermitra dengan Sanubari
                        </h2>
                        <p className="text-xs text-brand-600 sm:text-sm">
                            Dukungan menyeluruh dari biji kopi berkualitas prima
                            hingga setup operasional bar mesin.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                        {benefits.map((b, idx) => {
                            const bImg = b.image
                                ? resolveImageUrl(b.image)
                                : null;

                            return (
                                <div
                                    key={idx}
                                    className="flex flex-col overflow-hidden rounded-2xl border border-sand-200 bg-white shadow-2xs transition-shadow hover:shadow-md"
                                >
                                    {bImg ? (
                                        <div className="bg-sand-100 h-44 w-full overflow-hidden">
                                            <img
                                                src={bImg}
                                                alt={b.title}
                                                className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                                                loading="lazy"
                                            />
                                        </div>
                                    ) : null}

                                    <div className="flex flex-1 flex-col space-y-3 p-6 sm:p-7">
                                        {!bImg && (
                                            <div className="bg-sand-100 flex h-12 w-12 items-center justify-center rounded-xl text-brand-800 shadow-2xs">
                                                {idx === 0 ? (
                                                    <Truck className="h-6 w-6" />
                                                ) : idx === 1 ? (
                                                    <Settings className="h-6 w-6" />
                                                ) : (
                                                    <Coffee className="h-6 w-6" />
                                                )}
                                            </div>
                                        )}
                                        <h3 className="text-base font-bold text-brand-950 sm:text-lg">
                                            {b.title}
                                        </h3>
                                        <p className="flex-1 text-xs leading-relaxed text-brand-700 sm:text-sm">
                                            {b.description}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Form & Consultation Showcase Section */}
                <div className="bg-sand-100/70 rounded-3xl border border-sand-200 p-6 sm:p-10 lg:p-12">
                    <div
                        className={`grid grid-cols-1 ${formImage ? 'gap-8 lg:grid-cols-12 lg:gap-12' : 'mx-auto max-w-2xl'} items-center`}
                    >
                        {formImage && (
                            <div className="space-y-6 lg:col-span-5">
                                <div className="relative aspect-4/3 overflow-hidden rounded-2xl bg-sand-200 shadow-md sm:aspect-16/10 lg:aspect-4/3">
                                    <img
                                        src={formImage}
                                        alt={formTitle}
                                        className="h-full w-full object-cover"
                                        loading="lazy"
                                    />
                                    {formBadge && (
                                        <div className="absolute top-4 left-4 flex items-center gap-1.5 rounded-lg bg-black/75 px-3 py-1.5 text-xs font-bold tracking-wider text-white uppercase backdrop-blur-xs">
                                            <Sparkles className="h-3.5 w-3.5 text-accent-copper" />
                                            <span>{formBadge}</span>
                                        </div>
                                    )}
                                </div>
                                <div className="space-y-3">
                                    <h4 className="text-lg font-extrabold text-brand-950">
                                        Kenapa Memilih Pasokan Sanubari?
                                    </h4>
                                    <ul className="space-y-2 text-xs text-brand-700 sm:text-sm">
                                        <li className="flex items-center gap-2">
                                            <CheckCircle2 className="h-4 w-4 shrink-0 text-[#128C7E]" />
                                            <span>
                                                Biji kopi lereng Gunung Kawi
                                                segar terjamin panen baru
                                            </span>
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <CheckCircle2 className="h-4 w-4 shrink-0 text-[#128C7E]" />
                                            <span>
                                                Pricelist transparan potongan
                                                berjenjang tanpa biaya
                                                tersembunyi
                                            </span>
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <CheckCircle2 className="h-4 w-4 shrink-0 text-[#128C7E]" />
                                            <span>
                                                Dukungan teknisi mesin espresso
                                                & kalibrasi barista berkala
                                            </span>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        )}

                        <div
                            className={`${formImage ? 'lg:col-span-7' : 'w-full'} space-y-6 rounded-2xl border border-sand-200 bg-white p-6 shadow-sm sm:rounded-3xl sm:p-8 lg:p-10`}
                        >
                            <div className="space-y-1.5">
                                <h3 className="flex items-center gap-2 text-xl font-extrabold text-brand-950 sm:text-2xl">
                                    <MessageCircle className="h-6 w-6 text-[#128C7E]" />
                                    <span>{formTitle}</span>
                                </h3>
                                <p className="text-xs text-brand-600 sm:text-sm">
                                    {formSubtitle}
                                </p>
                            </div>

                            <form
                                onSubmit={handleWhatsAppSubmit}
                                className="space-y-4"
                            >
                                <div className="space-y-1.5">
                                    <label className="block text-xs font-semibold text-brand-900 sm:text-sm">
                                        Nama Coffee Shop / Usaha *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={cafeName}
                                        onChange={(e) =>
                                            setCafeName(e.target.value)
                                        }
                                        placeholder="Contoh: Kopi Senja Malang"
                                        className="bg-sand-50 w-full rounded-xl border border-sand-200 px-4 py-3 text-sm text-brand-950 transition-colors focus:border-brand-500 focus:outline-hidden"
                                    />
                                </div>

                                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                    <div className="space-y-1.5">
                                        <label className="block text-xs font-semibold text-brand-900 sm:text-sm">
                                            Nama PIC / Kontak *
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={contactName}
                                            onChange={(e) =>
                                                setContactName(e.target.value)
                                            }
                                            placeholder="Contoh: Budi Santoso"
                                            className="bg-sand-50 w-full rounded-xl border border-sand-200 px-4 py-3 text-sm text-brand-950 transition-colors focus:border-brand-500 focus:outline-hidden"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="block text-xs font-semibold text-brand-900 sm:text-sm">
                                            Kota Lokasi Kedai *
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={city}
                                            onChange={(e) =>
                                                setCity(e.target.value)
                                            }
                                            placeholder="Contoh: Malang"
                                            className="bg-sand-50 w-full rounded-xl border border-sand-200 px-4 py-3 text-sm text-brand-950 transition-colors focus:border-brand-500 focus:outline-hidden"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                    <div className="space-y-1.5">
                                        <label className="block text-xs font-semibold text-brand-900 sm:text-sm">
                                            Nomor WhatsApp Aktif *
                                        </label>
                                        <input
                                            type="tel"
                                            required
                                            value={phone}
                                            onChange={(e) =>
                                                setPhone(e.target.value)
                                            }
                                            placeholder="Contoh: 08123456789"
                                            className="bg-sand-50 w-full rounded-xl border border-sand-200 px-4 py-3 text-sm text-brand-950 transition-colors focus:border-brand-500 focus:outline-hidden"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="block text-xs font-semibold text-brand-900 sm:text-sm">
                                            Estimasi Kebutuhan Bulanan
                                        </label>
                                        <select
                                            value={volume}
                                            onChange={(e) =>
                                                setVolume(e.target.value)
                                            }
                                            className="bg-sand-50 w-full rounded-xl border border-sand-200 px-4 py-3 text-sm text-brand-950 transition-colors focus:border-brand-500 focus:outline-hidden"
                                        >
                                            <option value="5 - 10 kg/bulan">
                                                5 – 10 kg/bulan
                                            </option>
                                            <option value="10 - 30 kg/bulan">
                                                10 – 30 kg/bulan
                                            </option>
                                            <option value="30 - 100 kg/bulan">
                                                30 – 100 kg/bulan
                                            </option>
                                            <option value="> 100 kg/bulan">
                                                &gt; 100 kg/bulan
                                            </option>
                                        </select>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#128C7E] py-3.5 text-xs font-bold tracking-wider text-white uppercase shadow-sm transition-all hover:bg-[#075E54] hover:shadow-md active:scale-[0.99]"
                                >
                                    <MessageCircle className="h-5 w-5 fill-white" />
                                    <span>Kirim Formulir ke WhatsApp</span>
                                </button>
                            </form>
                        </div>
                    </div>
                </div>

                {/* Documentation & Partner Showcase Gallery */}
                {galleryImages.length > 0 && (
                    <div className="space-y-8 border-t border-brand-100 pt-4">
                        <div className="mx-auto max-w-2xl space-y-2 text-center">
                            <span className="block flex items-center justify-center gap-1.5 text-xs font-bold tracking-widest text-accent-copper uppercase">
                                <Camera className="h-4 w-4" />
                                <span>Galeri Kemitraan</span>
                            </span>
                            <h2 className="text-xl font-extrabold text-brand-950 sm:text-3xl">
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
                            {galleryImages.map((item, index) => {
                                const resolvedImg = resolveImageUrl(item.image);

                                return (
                                    <div
                                        key={index}
                                        className="group relative flex flex-col overflow-hidden rounded-2xl border border-sand-200 bg-white shadow-2xs transition-all duration-300 hover:shadow-md"
                                    >
                                        <div
                                            className={`w-full ${getAspectClass(imageAspect)} bg-sand-100 relative overflow-hidden`}
                                        >
                                            <img
                                                src={resolvedImg}
                                                alt={
                                                    item.caption ||
                                                    `Dokumentasi Wholesale ${index + 1}`
                                                }
                                                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                                loading="lazy"
                                            />
                                        </div>

                                        {item.caption && (
                                            <div className="border-sand-100 border-t bg-white p-3.5 sm:p-4">
                                                <p className="line-clamp-2 text-xs leading-snug font-medium text-brand-700">
                                                    {item.caption}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </PublicLayout>
    );
}
