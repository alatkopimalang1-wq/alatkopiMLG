import React from 'react';
import { Head, Link } from '@inertiajs/react';
import {
    ArrowRight,
    Clock,
    Coffee,
    Compass,
    ExternalLink,
    MapPin,
    MessageCircle,
    Phone,
    Store,
} from 'lucide-react';
import { PublicLayout } from '@/layouts/public-layout';
import { SectionHeading } from '@/components/ui/section-heading';

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

interface VisitPageProps {
    page?: {
        hero_badge?: string;
        hero_title?: string;
        hero_description?: string;
        welcome_title?: string;
        address?: string;
        hours?: string;
        phone?: string;
        maps_url?: string;
        facilities?: Array<{ title: string; description: string }>;
        main_image?: string;
        gallery_title?: string;
        gallery_subtitle?: string;
        grid_desktop?: number | string;
        grid_tablet?: number | string;
        grid_mobile?: number | string;
        image_aspect?: string;
        gallery_images?: Array<{ image: string; caption?: string }>;
    };
}

export default function VisitPage({ page }: VisitPageProps) {
    const heroBadge = page?.hero_badge || 'Roastery & Showroom Malang';
    const heroTitle =
        page?.hero_title || 'Alat Kopi Malang';
    const heroDesc =
        page?.hero_description ||
        'Cicipi beans fresh roast langsung di slow bar kami, coba mesin espresso komersial, dan konsultasikan kebutuhan seduh Anda bersama roaster dan barista kami.';

    const welcomeTitle = page?.welcome_title || 'Selamat Datang di Malang';
    const address =
        page?.address ||
        'Jl. Terusan Kawi No. 12, Klojen, Kota Malang, Jawa Timur 65116 (Gedung Sanubari x Alat Kopi Malang)';
    const hours =
        page?.hours ||
        'Buka Setiap Hari: 09.00–23.00 WIB (Layanan Seduh di Tempat & Pembelian Beans)';
    const phone = page?.phone || '+62 851-2193-0454';
    const mapsUrl =
        page?.maps_url || 'https://maps.app.goo.gl/PMuxaEtsbEvC4APy7';

    const mainImage = page?.main_image
        ? resolveImageUrl(page.main_image)
        : 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=1200&q=80';

    const galleryTitle =
        page?.gallery_title || 'Galeri Suasana Roastery & Showroom';
    const gallerySubtitle =
        page?.gallery_subtitle ||
        'Dokumentasi ruang seduh, mesin espresso komersial, dan kehangatan slow bar kami di Malang.';
    const gridDesktop = page?.grid_desktop ?? '3';
    const gridTablet = page?.grid_tablet ?? '2';
    const gridMobile = page?.grid_mobile ?? '1';
    const imageAspect = page?.image_aspect || 'aspect-4/3';
    const galleryImages = page?.gallery_images || [];

    const facilities =
        page?.facilities && page.facilities.length > 0
            ? page.facilities
            : [
                  {
                      title: 'Slow Bar & Cupping',
                      description:
                          'Cicipi kalibrasi seduhan manual filter V60, Aeropress, atau espresso dari biji kopi sangrai minggu ini.',
                  },
                  {
                      title: 'Equipment Showroom',
                      description:
                          'Coba langsung berbagai grinder, mesin espresso komersial, kettle leher angsa, dripper, dan timbangan digital.',
                  },
              ];

    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const waLink = cleanPhone
        ? `https://wa.me/${cleanPhone}`
        : 'https://wa.me/6285121930454';

    return (
        <PublicLayout title="Kunjungi Roastery & Showroom Malang">
            <div className="bg-brand-950 px-4 py-12 text-white sm:px-6 sm:py-20 lg:px-8">
                <div className="mx-auto max-w-4xl space-y-3 text-center sm:space-y-4">
                    <span className="inline-block text-sm font-semibold tracking-wider text-accent-copper uppercase">
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

            <div className="mx-auto max-w-7xl space-y-10 px-4 py-10 sm:space-y-16 sm:px-6 sm:py-16 lg:px-8">
                <div className="grid grid-cols-1 items-start gap-6 sm:gap-8 lg:grid-cols-12">
                    {/* Left: Info & Hours (5 cols) */}
                    <div className="space-y-4 rounded-2xl bg-sand-200/40 p-5 sm:space-y-6 sm:rounded-3xl sm:p-8 lg:col-span-5">
                        <h2 className="text-2xl font-extrabold tracking-tight text-brand-950 sm:text-3xl">
                            {welcomeTitle}
                        </h2>

                        <div className="space-y-3.5 text-sm text-brand-800 sm:space-y-4 sm:text-base">
                            <div className="flex items-start gap-2.5 sm:gap-3">
                                <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-accent-copper sm:h-5 sm:w-5" />
                                <div>
                                    <strong className="block text-sm font-bold text-brand-950 sm:text-base">
                                        Alamat Roastery & Store:
                                    </strong>
                                    <p className="mt-0.5 text-sm leading-relaxed text-brand-700 sm:mt-1 sm:text-base">
                                        {address}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-2.5 sm:gap-3">
                                <Clock className="mt-0.5 h-4 w-4 flex-shrink-0 text-accent-copper sm:h-5 sm:w-5" />
                                <div>
                                    <strong className="block text-sm font-bold text-brand-950 sm:text-base">
                                        Jam Operasional:
                                    </strong>
                                    <p className="mt-0.5 text-sm leading-relaxed text-brand-700 sm:mt-1 sm:text-base">
                                        {hours}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-2.5 sm:gap-3">
                                <Phone className="mt-0.5 h-4 w-4 flex-shrink-0 text-accent-copper sm:h-5 sm:w-5" />
                                <div>
                                    <strong className="block text-sm font-bold text-brand-950 sm:text-base">
                                        Kontak WhatsApp:
                                    </strong>
                                    <a
                                        href={waLink}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="text-sm font-bold text-accent-copper hover:underline sm:text-base"
                                    >
                                        {phone}
                                    </a>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3 pt-2 sm:pt-4">
                            <a
                                href={mapsUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-brand-700 py-3 text-sm font-semibold text-white shadow-2xs transition-colors hover:bg-brand-800 sm:gap-2 sm:py-3.5 sm:text-base"
                            >
                                <ExternalLink className="h-4 w-4" />
                                <span>Buka Rute di Google Maps</span>
                            </a>
                        </div>
                    </div>

                    {/* Right: Experience Cards & Atmosphere (7 cols) */}
                    <div className="space-y-4 sm:space-y-6 lg:col-span-7">
                        <div className="aspect-16/9 overflow-hidden rounded-2xl bg-brand-900 shadow-md sm:rounded-3xl">
                            <img
                                src={mainImage}
                                alt="Suasana Slow Bar Alat Kopi Malang"
                                className="h-full w-full object-cover"
                            />
                        </div>

                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
                            {facilities.map((fac, idx) => (
                                <div
                                    key={idx}
                                    className="rounded-xl bg-sand-200/40 p-4 sm:rounded-2xl sm:p-6"
                                >
                                    {idx % 2 === 0 ? (
                                        <Coffee className="mb-1.5 hidden h-5 w-5 text-accent-copper sm:mb-2 sm:block sm:h-6 sm:w-6" />
                                    ) : (
                                        <Store className="mb-1.5 hidden h-5 w-5 text-accent-copper sm:mb-2 sm:block sm:h-6 sm:w-6" />
                                    )}
                                    <h4 className="mb-0.5 text-base font-bold text-brand-950 sm:mb-1 sm:text-lg">
                                        {fac.title}
                                    </h4>
                                    <p className="text-sm leading-relaxed text-brand-700 sm:text-base">
                                        {fac.description}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* 2. Photo Gallery Section with Responsive Custom Grid */}
                {galleryImages.length > 0 && (
                    <div className="space-y-6 border-t border-sand-200 pt-6 sm:space-y-8 sm:pt-8">
                        <div className="mx-auto max-w-2xl text-center">
                            <h2 className="text-2xl leading-tight font-extrabold tracking-tight text-brand-950 sm:text-3xl lg:text-4xl">
                                {galleryTitle}
                            </h2>
                            {gallerySubtitle && (
                                <p className="mt-2 text-sm leading-relaxed text-brand-600 sm:text-base">
                                    {gallerySubtitle}
                                </p>
                            )}
                        </div>

                        <div
                            className={`grid ${getMobileGridClass(gridMobile)} ${getTabletGridClass(gridTablet)} ${getDesktopGridClass(gridDesktop)} gap-3 sm:gap-6`}
                        >
                            {galleryImages.map((item, idx) => (
                                <div
                                    key={idx}
                                    className="group relative flex flex-col overflow-hidden rounded-xl border border-sand-200 bg-sand-200/40 shadow-2xs transition-all duration-300 hover:shadow-md sm:rounded-2xl"
                                >
                                    <div
                                        className={`w-full overflow-hidden bg-brand-900 ${getAspectClass(imageAspect)}`}
                                    >
                                        <img
                                            src={resolveImageUrl(item.image)}
                                            alt={
                                                item.caption ||
                                                `Foto Suasana Roastery Sanubari ${idx + 1}`
                                            }
                                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                            loading="lazy"
                                        />
                                    </div>
                                    {item.caption && (
                                        <div className="flex flex-1 items-center border-t border-sand-200 bg-white/95 p-2.5 backdrop-blur-xs sm:p-3.5">
                                            <p className="line-clamp-2 text-sm font-medium text-brand-900">
                                                {item.caption}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </PublicLayout>
    );
}
