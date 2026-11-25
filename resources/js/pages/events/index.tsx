import React from 'react';
import {
    Calendar,
    Clock,
    MapPin,
    MessageCircle,
    Ticket,
    Users,
} from 'lucide-react';
import { PublicLayout } from '@/layouts/public-layout';
import type { Event } from '@/types/sanubari';
import { formatRupiah } from '@/lib/trans';

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

const parseEventDate = (dateStr: string | null | undefined): Date => {
    if (!dateStr) return new Date();
    const clean = dateStr.replace(/Z$/, '').replace(/([+-]\d{2}:\d{2})$/, '');
    return new Date(clean);
};

const formatEventSchedule = (event: Event): string => {
    if (event.formatted_schedule) {
        return event.formatted_schedule;
    }
    const startDate = parseEventDate(event.starts_at);
    const baseDate = startDate.toLocaleDateString('id-ID', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
    if (event.ends_at) {
        const endDate = parseEventDate(event.ends_at);
        const endHour = endDate.toLocaleTimeString('id-ID', {
            hour: '2-digit',
            minute: '2-digit',
        });
        return `${baseDate} - ${endHour} WIB`;
    }
    return `${baseDate} WIB`;
};

interface EventsIndexProps {
    upcoming: Event[];
    past: Event[];
    page?: {
        hero_badge?: string;
        hero_title?: string;
        hero_description?: string;
        hero_image?: string;
        upcoming_title?: string;
        empty_message?: string;
        show_past?: boolean;
        past_title?: string;
        whatsapp_number?: string;
        cta_button_text?: string;
        cta_note?: string;
        gallery_title?: string;
        gallery_subtitle?: string;
        grid_desktop?: number | string;
        grid_tablet?: number | string;
        grid_mobile?: number | string;
        image_aspect?: string;
        gallery_images?: Array<{ image: string; caption?: string }>;
    };
}

export default function EventsIndex({
    upcoming = [],
    past = [],
    page,
}: EventsIndexProps) {
    const heroBadge = page?.hero_badge || 'Komunitas & Edukasi';
    const heroTitle = page?.hero_title || 'Workshop & Sesi Cupping Terbuka';
    const heroDesc =
        page?.hero_description ||
        'Bergabung bersama komunitas pecinta kopi di Malang dalam sesi cupping kalibrasi rasa, kelas manual brew, dan bincang santai bersama roaster Sanubari.';
    const heroImage = page?.hero_image
        ? resolveImageUrl(page.hero_image)
        : null;

    const upcomingTitle = page?.upcoming_title || 'Acara Mendatang';
    const emptyMessage =
        page?.empty_message ||
        'Belum ada jadwal acara baru saat ini. Ikuti Instagram kami di @sanubari.roastery.mlg untuk kabar workshop terdekat!';
    const showPast = page?.show_past ?? true;
    const pastTitle = page?.past_title || 'Arsip & Riwayat Acara Sebelumnya';
    const waNumber = page?.whatsapp_number || '6285121930454';
    const ctaButtonText = page?.cta_button_text || 'Daftar via WhatsApp';
    const ctaNote = page?.cta_note || 'Slot terbatas • Konfirmasi instan';

    const galleryTitle =
        page?.gallery_title || 'Dokumentasi Acara & Workshop Sanubari';
    const gallerySubtitle =
        page?.gallery_subtitle ||
        'Momen kebersamaan komunitas, sesi sensory cupping, dan workshop seduh di Malang.';
    const gridDesktop = page?.grid_desktop ?? '3';
    const gridTablet = page?.grid_tablet ?? '2';
    const gridMobile = page?.grid_mobile ?? '1';
    const imageAspect = page?.image_aspect || 'aspect-4/3';
    const galleryImages =
        page?.gallery_images && page.gallery_images.length > 0
            ? page.gallery_images
            : [];

    return (
        <PublicLayout title="Acara & Workshop Cupping Kopi | Alat Kopi Malang">
            {/* Header Hero Section */}
            <div className="relative space-y-3 overflow-hidden border-b border-brand-900 bg-brand-950 px-4 py-14 text-center text-white sm:px-6 sm:py-20 lg:px-8">
                {heroImage && (
                    <div className="pointer-events-none absolute inset-0 opacity-15">
                        <img
                            src={heroImage}
                            alt=""
                            className="h-full w-full object-cover"
                        />
                    </div>
                )}
                <div className="relative mx-auto max-w-3xl space-y-3">
                    <span className="block text-xs font-bold tracking-widest text-accent-copper uppercase">
                        {heroBadge}
                    </span>
                    <h1 className="text-2xl font-extrabold tracking-tight sm:text-4xl">
                        {heroTitle}
                    </h1>
                    <p className="mx-auto max-w-xl text-xs leading-relaxed text-brand-300 sm:text-sm">
                        {heroDesc}
                    </p>
                </div>
            </div>

            <div className="mx-auto max-w-5xl space-y-12 px-4 py-10 sm:space-y-16 sm:px-6 sm:py-16 lg:px-8">
                {/* Upcoming Events */}
                <div className="space-y-6">
                    <h2 className="flex items-center gap-2 text-xl font-extrabold text-brand-950 sm:text-2xl">
                        <Calendar className="h-5 w-5 text-accent-copper" />
                        <span>{upcomingTitle}</span>
                    </h2>

                    {upcoming.length === 0 ? (
                        <div className="rounded-2xl border border-sand-200 bg-white p-8 text-center text-xs text-brand-600 shadow-2xs sm:p-12 sm:text-sm">
                            {emptyMessage}
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {upcoming.map((ev) => {
                                const title =
                                    typeof ev.title === 'string'
                                        ? ev.title
                                        : (ev.title as any)?.id || '';
                                const desc =
                                    typeof ev.description === 'string'
                                        ? ev.description
                                        : (ev.description as any)?.id || '';
                                const coverImg = ev.cover_image
                                    ? resolveImageUrl(ev.cover_image)
                                    : null;
                                const isWalkIn =
                                    ev.meta?.entry_type === 'walk_in' ||
                                    [
                                        'Live Music',
                                        'Live DJ',
                                        'Stand Sanubari',
                                    ].includes(ev.category || '');
                                const isFull =
                                    !isWalkIn && ev.status === 'full';
                                const walkInBadge =
                                    ev.meta?.walk_in_badge ||
                                    'Bebas Masuk • Langsung Datang';
                                const actionButtonText =
                                    ev.meta?.action_button_text ||
                                    (isWalkIn
                                        ? 'Buka Petunjuk Arah'
                                        : ctaButtonText);
                                const mapsUrl =
                                    ev.meta?.maps_url ||
                                    (ev.address
                                        ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${ev.location || 'Alat Kopi Malang'} ${ev.address}`)}`
                                        : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(ev.location || 'Alat Kopi Malang')}`);

                                const dateFormatted = formatEventSchedule(ev);
                                const defaultMsg = isWalkIn
                                    ? `Halo Alat Kopi Malang! Saya ingin bertanya info mengenai acara: *${title}* (${dateFormatted}). Terima kasih!`
                                    : `Halo Alat Kopi Malang! Saya ingin mendaftar untuk acara: *${title}* (${dateFormatted}). Mohon info ketersediaan slot. Terima kasih!`;
                                const waMsg =
                                    ev.whatsapp_register_text &&
                                    ev.whatsapp_register_text.trim().length > 0
                                        ? ev.whatsapp_register_text
                                        : defaultMsg;

                                return (
                                    <div
                                        key={ev.id}
                                        className="grid grid-cols-1 items-stretch overflow-hidden rounded-2xl border border-sand-200 bg-white shadow-sm transition-shadow hover:shadow-md sm:rounded-3xl md:grid-cols-12"
                                    >
                                        {coverImg && (
                                            <div className="bg-sand-100 relative min-h-[200px] md:col-span-4 md:min-h-full">
                                                <img
                                                    src={coverImg}
                                                    alt={title}
                                                    className="h-full w-full object-cover"
                                                    loading="lazy"
                                                />
                                                {isWalkIn ? (
                                                    <span className="absolute top-3 left-3 rounded-md bg-emerald-700 px-2.5 py-1 text-[10px] font-bold tracking-wider text-white uppercase shadow-xs">
                                                        {walkInBadge}
                                                    </span>
                                                ) : isFull ? (
                                                    <span className="absolute top-3 left-3 rounded-md bg-red-600 px-2.5 py-1 text-[10px] font-bold tracking-wider text-white uppercase shadow-xs">
                                                        Kuota Penuh
                                                    </span>
                                                ) : null}
                                            </div>
                                        )}

                                        <div
                                            className={`${coverImg ? 'md:col-span-5' : 'md:col-span-8'} flex flex-col justify-center space-y-3 p-6 sm:p-8`}
                                        >
                                            <div className="flex flex-wrap items-center gap-2">
                                                <div className="flex items-center gap-2 text-xs font-bold tracking-wider text-accent-copper uppercase">
                                                    <Calendar className="h-4 w-4" />
                                                    <span>{dateFormatted}</span>
                                                </div>
                                                {isWalkIn && (
                                                    <span className="rounded-full border border-emerald-200 bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold tracking-wider text-emerald-800 uppercase">
                                                        {walkInBadge}
                                                    </span>
                                                )}
                                                {ev.category && (
                                                    <span className="bg-sand-100 rounded border border-sand-200 px-2 py-0.5 text-[10px] font-bold tracking-wider text-brand-800 uppercase">
                                                        {ev.category}
                                                    </span>
                                                )}
                                                {isFull && !coverImg && (
                                                    <span className="rounded border border-red-200 bg-red-100 px-2 py-0.5 text-[10px] font-bold tracking-wider text-red-700 uppercase">
                                                        Kuota Penuh
                                                    </span>
                                                )}
                                            </div>

                                            <h3 className="text-lg font-extrabold text-brand-950 sm:text-xl">
                                                {title}
                                            </h3>

                                            {desc && (
                                                <p className="line-clamp-3 text-xs leading-relaxed text-brand-600 sm:text-sm">
                                                    {desc}
                                                </p>
                                            )}

                                            <div className="flex flex-wrap items-center gap-4 pt-2 text-xs text-brand-700">
                                                {ev.location && (
                                                    <div className="flex items-center gap-1.5">
                                                        <MapPin className="h-4 w-4 shrink-0 text-accent-copper" />
                                                        <span>
                                                            {ev.location}
                                                        </span>
                                                    </div>
                                                )}
                                                <div className="flex items-center gap-1.5">
                                                    <Users className="h-4 w-4 shrink-0 text-accent-copper" />
                                                    <span>
                                                        {ev.capacity
                                                            ? `Kapasitas: ${ev.capacity} Peserta`
                                                            : isWalkIn
                                                              ? 'Akses Terbuka untuk Umum'
                                                              : 'Kapasitas Fleksibel'}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    <Ticket className="h-4 w-4 shrink-0 text-accent-copper" />
                                                    <span className="font-bold text-brand-900">
                                                        {ev.fee > 0
                                                            ? formatRupiah(
                                                                  ev.fee,
                                                              )
                                                            : isWalkIn
                                                              ? 'Gratis / Free Entry'
                                                              : 'Gratis / Open Session'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div
                                            className={`${coverImg ? 'md:col-span-3' : 'md:col-span-4'} bg-sand-50/50 flex flex-col items-stretch justify-center border-t border-sand-200 p-6 sm:p-8 md:items-end md:border-t-0 md:border-l`}
                                        >
                                            {isWalkIn ? (
                                                <>
                                                    <a
                                                        href={mapsUrl}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-900 px-5 py-3.5 text-center text-xs font-bold tracking-wider text-white uppercase shadow-sm transition-all hover:bg-brand-950 hover:shadow-md active:scale-[0.99]"
                                                    >
                                                        <MapPin className="h-4 w-4 text-accent-copper" />
                                                        <span>
                                                            {actionButtonText}
                                                        </span>
                                                    </a>
                                                    <a
                                                        href={`https://wa.me/${waNumber}?text=${encodeURIComponent(waMsg)}`}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-xl border border-sand-200 bg-white px-4 py-2.5 text-center text-[11px] font-bold tracking-wider text-brand-700 uppercase transition-all hover:border-sand-300 hover:text-brand-950"
                                                    >
                                                        <MessageCircle className="h-3.5 w-3.5 text-[#128C7E]" />
                                                        <span>
                                                            Tanya Info via WA
                                                        </span>
                                                    </a>
                                                    <span className="mt-2 block text-center text-[11px] text-brand-400">
                                                        Tanpa Pendaftaran •
                                                        Langsung Hadir
                                                    </span>
                                                </>
                                            ) : (
                                                <>
                                                    <a
                                                        href={`https://wa.me/${waNumber}?text=${encodeURIComponent(waMsg)}`}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className={`w-full px-5 py-3.5 text-center ${
                                                            isFull
                                                                ? 'bg-brand-800 text-white hover:bg-brand-900'
                                                                : 'bg-[#128C7E] text-white hover:bg-[#0e7467]'
                                                        } flex items-center justify-center gap-2 rounded-xl text-xs font-bold tracking-wider uppercase shadow-sm transition-all hover:shadow-md active:scale-[0.99]`}
                                                    >
                                                        <MessageCircle className="h-4 w-4" />
                                                        <span>
                                                            {isFull
                                                                ? 'Waiting List via WA'
                                                                : ctaButtonText}
                                                        </span>
                                                    </a>
                                                    {ctaNote && (
                                                        <span className="mt-2 block text-center text-[11px] text-brand-400">
                                                            {isFull
                                                                ? 'Slot utama penuh, daftar antrean'
                                                                : ctaNote}
                                                        </span>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Past Events Section (if any & enabled) */}
                {showPast && past.length > 0 && (
                    <div className="space-y-6 border-t border-brand-100 pt-6">
                        <h2 className="flex items-center gap-2 text-lg font-extrabold text-brand-900 sm:text-xl">
                            <Clock className="h-4 w-4 text-brand-500" />
                            <span>{pastTitle}</span>
                        </h2>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            {past.map((ev) => {
                                const title =
                                    typeof ev.title === 'string'
                                        ? ev.title
                                        : (ev.title as any)?.id || '';
                                const desc =
                                    typeof ev.description === 'string'
                                        ? ev.description
                                        : (ev.description as any)?.id || '';
                                const coverImg = ev.cover_image
                                    ? resolveImageUrl(ev.cover_image)
                                    : null;
                                const dateFormatted =
                                    ev.formatted_date ||
                                    parseEventDate(
                                        ev.starts_at,
                                    ).toLocaleDateString('id-ID', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                    });

                                return (
                                    <div
                                        key={ev.id}
                                        className="flex flex-col overflow-hidden rounded-2xl border border-brand-100 bg-white opacity-90 shadow-2xs transition-all hover:opacity-100 hover:shadow-xs sm:flex-row"
                                    >
                                        {coverImg && (
                                            <div className="bg-sand-100 h-32 shrink-0 sm:h-auto sm:w-36">
                                                <img
                                                    src={coverImg}
                                                    alt={title}
                                                    className="h-full w-full object-cover"
                                                    loading="lazy"
                                                />
                                            </div>
                                        )}
                                        <div className="flex-1 space-y-2 p-5">
                                            <div className="flex items-center justify-between text-xs">
                                                <span className="font-semibold text-brand-500">
                                                    {dateFormatted}
                                                </span>
                                                <span className="rounded-full bg-sand-200 px-2 py-0.5 text-[10px] font-bold text-brand-700 uppercase">
                                                    Selesai
                                                </span>
                                            </div>
                                            <h3 className="text-sm leading-snug font-bold text-brand-950">
                                                {title}
                                            </h3>
                                            {desc && (
                                                <p className="line-clamp-2 text-xs leading-relaxed text-brand-600">
                                                    {desc}
                                                </p>
                                            )}
                                            {ev.location && (
                                                <div className="flex items-center gap-1 pt-1 text-[11px] text-brand-500">
                                                    <MapPin className="h-3 w-3 text-accent-copper" />
                                                    <span>{ev.location}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Gallery Section */}
                {galleryImages.length > 0 && (
                    <div className="space-y-6 border-t border-brand-100 pt-6 sm:space-y-8">
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
                                                `Dokumentasi Acara ${idx + 1}`
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
            </div>
        </PublicLayout>
    );
}
