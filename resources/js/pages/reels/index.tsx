import React from 'react';
import { Head, usePage } from '@inertiajs/react';
import { ExternalLink } from 'lucide-react';
import { PublicLayout } from '@/layouts/public-layout';
import {
    DEFAULT_REELS,
    InstagramIcon,
    resolveReelThumbnail,
    type VideoReel,
} from '@/components/video-reels-slider';
import type { SanubariSharedProps } from '@/types/sanubari';

// Extended collection of high quality reels for Sanubari & Alat Kopi Malang
const ALL_REELS: VideoReel[] = [
    ...DEFAULT_REELS,
    {
        id: 'reel-7',
        badge: 'DRILLER VS FLAT BOTTOM',
        headline:
            'Dripper V60 vs Flat Bottom: Mana yang Lebih Cocok Buat Kopi Manis?',
        caption:
            'Uji komparasi seduhan pour-over: flow rate konikal vs flow flat bed untuk ekstraksi rasa manis maksimal buah kopi...',
        productCount: 2,
        thumbnail:
            'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80',
        videoUrl: 'https://www.instagram.com/sanubari.roastery.mlg/',
        products: [
            {
                id: 12,
                name: 'Hario V60 Ceramic Cyan Dripper 02',
                price: 'Rp 159.000',
                image: '/storage/flashsale/v60_cyan.jpg',
                url: '/shop/hario-v60-ceramic-cyan',
            },
            {
                id: 13,
                name: 'Otten Vietnam Drip XL Stainless',
                price: 'Rp 189.000',
                image: '/storage/flashsale/otten_vietnam_drip.jpg',
                url: '/shop/otten-vietnam-drip-xl',
            },
        ],
    },
    {
        id: 'reel-8',
        badge: 'BARISTA TIPS',
        headline:
            'Cara Kalibrasi Grinder Espresso Rumahan Anti Pahit & Clumping',
        caption:
            'Biar hasil seduhan espresso di rumah nggak asem encer atau pahit gosong, ikuti 3 kunci kalibrasi burr grinder ini...',
        productCount: 2,
        thumbnail:
            'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=800&q=80',
        videoUrl: 'https://www.instagram.com/sanubari.roastery.mlg/',
        products: [
            {
                id: 14,
                name: 'Fellow Rocky Lowball Tumblers (Matte)',
                price: 'Rp 395.000',
                image: '/storage/flashsale/fellow_rocky_tumbler.jpg',
                url: '/shop/fellow-rocky-lowball-tumblers',
            },
            {
                id: 15,
                name: 'Hario V60 Station Olive Wood VSS-1-OV',
                price: 'Rp 1.850.000',
                image: '/storage/flashsale/v60_wood_station.jpg',
                url: '/shop/hario-v60-station-olive-wood',
            },
        ],
    },
];

interface ReelsIndexProps {
    reels?: VideoReel[];
}

export default function ReelsIndex({ reels = [] }: ReelsIndexProps) {
    const { settings } = usePage<SanubariSharedProps>().props;
    const activeReels = reels.length > 0 ? reels : ALL_REELS;

    const pageTitle =
        settings?.reels_page_title ||
        settings?.home_reels_title ||
        'Sanubari Reels Videos';
    const pageDescription =
        settings?.reels_page_description ||
        settings?.home_reels_subtitle ||
        'Klik salah satu video untuk langsung menonton tayangan resmi di aplikasi Instagram. Temukan tips barista, review mesin espresso, hingga tutorial seduh kopi manual.';
    const igUrl =
        settings?.home_reels_instagram_url ||
        settings?.instagram ||
        'https://www.instagram.com/sanubari.roastery.mlg/';

    const igHandle = (() => {
        try {
            const clean = igUrl
                .replace(/^https?:\/\/(www\.)?instagram\.com\/?/, '')
                .replace(/\/.*$/, '')
                .replace(/^@/, '');
            if (clean && !['reel', 'p', 'stories', 'explore'].includes(clean)) {
                return `@${clean}`;
            }
        } catch {
            // fallback
        }
        return '@sanubari.roastery.mlg';
    })();

    return (
        <PublicLayout title={`${pageTitle} — Alat Kopi Malang`}>
            <Head>
                <meta name="description" content={pageDescription} />
            </Head>

            <main className="mx-auto w-full max-w-7xl space-y-6 px-4 py-6 sm:space-y-8 sm:px-6 sm:py-8 lg:px-8">
                {/* Hero Header Banner */}
                <section className="to-brand-850 relative overflow-hidden rounded-2xl border border-brand-700/40 bg-gradient-to-br from-brand-950 via-brand-900 p-6 text-white shadow-xl sm:rounded-3xl sm:p-8">
                    {/* Decorative Ambient Glows */}
                    <div className="pointer-events-none absolute -top-24 -left-24 h-80 w-80 rounded-full bg-accent-copper/15 blur-3xl" />
                    <div className="pointer-events-none absolute -right-24 -bottom-24 h-80 w-80 rounded-full bg-brand-500/15 blur-3xl" />

                    <div className="relative z-10 flex flex-col justify-between gap-4 md:flex-row md:items-center">
                        <div className="space-y-2">
                            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs text-sand-200 backdrop-blur-md">
                                <InstagramIcon className="h-3.5 w-3.5 text-accent-copper-light" />
                                <span>Official Instagram Reels {igHandle}</span>
                            </div>
                            <h1 className="text-2xl leading-tight font-black tracking-tight text-white sm:text-3xl lg:text-4xl">
                                {pageTitle}
                            </h1>
                            <p className="max-w-2xl text-xs leading-relaxed whitespace-pre-line text-sand-200 sm:text-sm">
                                {pageDescription}
                            </p>
                        </div>
                        <a
                            href={igUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex cursor-pointer items-center gap-2 self-start rounded-xl bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] px-4 py-2.5 text-xs font-bold text-white shadow-lg transition-all hover:opacity-95 sm:text-sm md:self-auto"
                        >
                            <InstagramIcon className="h-4 w-4 text-white" />
                            <span>Follow {igHandle}</span>
                            <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                    </div>
                </section>

                {/* Video Reels Grid: 2 columns on mobile, 4 columns on desktop */}
                <section aria-label="Daftar Video Reels">
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 lg:gap-6">
                        {activeReels.map((reel) => {
                            const targetUrl =
                                reel.videoUrl ||
                                reel.video_url ||
                                'https://www.instagram.com/sanubari.roastery.mlg/';

                            return (
                                <a
                                    key={reel.id}
                                    href={targetUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label={`Buka di Instagram: ${reel.headline}`}
                                    className="group relative block aspect-[9/16] cursor-pointer overflow-hidden rounded-2xl border border-brand-800/40 bg-brand-950 shadow-md transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl focus:ring-2 focus:ring-accent-copper focus:outline-none sm:rounded-3xl"
                                >
                                    {/* Thumbnail Image */}
                                    <img
                                        src={resolveReelThumbnail(
                                            reel.thumbnail,
                                        )}
                                        alt={reel.headline}
                                        className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                                        loading="lazy"
                                    />

                                    {/* Subtle Gradient Overlays */}
                                    <div className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-black/40 to-transparent" />
                                    <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/60 to-transparent" />

                                    {/* Top Left: Instagram Icon */}
                                    <div className="absolute top-2.5 left-2.5 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] text-white shadow-md transition-transform group-hover:scale-110 sm:top-3.5 sm:left-3.5 sm:h-8 sm:w-8">
                                        <InstagramIcon className="h-3.5 w-3.5 text-white sm:h-4 sm:w-4" />
                                    </div>

                                    {/* Top Right: Badge or Reels Pill */}
                                    <div className="absolute top-2.5 right-2.5 z-10 flex items-center gap-1.5 sm:top-3.5 sm:right-3.5">
                                        {reel.badge ? (
                                            <span className="line-clamp-1 inline-block max-w-[110px] rounded-full border border-accent-copper/50 bg-black/60 px-2 py-0.5 text-[9px] font-black tracking-wider text-accent-copper-light uppercase shadow-xs backdrop-blur-md sm:text-[10px]">
                                                {reel.badge}
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 rounded-full border border-white/20 bg-black/60 px-2 py-0.5 text-[9px] font-medium text-white shadow-xs backdrop-blur-md sm:text-[10px]">
                                                <span>Reels</span>
                                                <ExternalLink className="h-2.5 w-2.5 text-sand-300" />
                                            </span>
                                        )}
                                    </div>

                                    {/* Bottom Content Area */}
                                    <div className="absolute inset-x-0 bottom-0 z-10 p-3 sm:p-4">
                                        <div className="inline-flex items-center gap-1 text-[10px] font-bold text-accent-copper-light drop-shadow-md transition-colors group-hover:text-white sm:text-[11px]">
                                            <span>Tonton di Instagram</span>
                                            <ExternalLink className="h-2.5 w-2.5" />
                                        </div>
                                    </div>
                                </a>
                            );
                        })}
                    </div>
                </section>
            </main>
        </PublicLayout>
    );
}
