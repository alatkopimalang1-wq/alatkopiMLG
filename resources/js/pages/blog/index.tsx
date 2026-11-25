import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { ArrowRight, Clock, Calendar, User } from 'lucide-react';
import { PublicLayout } from '@/layouts/public-layout';
import DynamicCategoryIcon from '@/components/dynamic-category-icon';
import FlipBookSlider, {
    type FlipBookPageItem,
} from '@/components/flipbook-slider';
import type { Post } from '@/types/sanubari';

interface BlogIndexProps {
    posts: {
        data: Post[];
        current_page: number;
        last_page: number;
    };
    page?: {
        hero_badge?: string;
        hero_title?: string;
        hero_description?: string;
        hero_icon?: string;
        hero_bg_image?: string;
        grid_columns?: number | string;
        image_aspect?: string;
        show_icons?: boolean;
        show_read_time?: boolean;
        show_date?: boolean;
        show_author?: boolean;
        cta_text?: string;
        flipbook_enabled?: boolean;
        flipbook_title?: string;
        flipbook_subtitle?: string;
        flipbook_theme?: string;
        flipbook_autoplay?: boolean;
        flipbook_pages?: FlipBookPageItem[];
    };
}

const resolveImageUrl = (img?: string | null) => {
    if (!img)
        return 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=800&q=80';
    if (img.startsWith('http://') || img.startsWith('https://')) return img;
    const clean = img.replace(/^\/?(public\/|storage\/)?/, '');
    return `/storage/${clean}`;
};

const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    try {
        const clean = dateString
            .replace(/Z$/, '')
            .replace(/([+-]\d{2}:\d{2})$/, '');
        const date = new Date(clean);
        return date.toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        });
    } catch {
        return dateString;
    }
};

const getAspectClass = (aspect?: string) => {
    switch (aspect) {
        case 'aspect-16/9':
            return 'aspect-16/9';
        case 'aspect-4/3':
            return 'aspect-4/3';
        case 'aspect-square':
            return 'aspect-square';
        case 'aspect-16/10':
        default:
            return 'aspect-16/10';
    }
};

export default function BlogIndex({ posts, page }: BlogIndexProps) {
    const heroBadge = page?.hero_badge || 'Jejak Rasa Journal';
    const heroTitle =
        page?.hero_title || 'Catatan Roaster & Cerita Dari Lereng Kawi';
    const heroDesc =
        page?.hero_description ||
        'Kumpulan artikel edukasi proses pascapanen, teknik seduh, profil terroir, dan kabar terbaru dari roastery kami.';
    const heroIcon = page?.hero_icon || 'newspaper';
    const heroBgImage = page?.hero_bg_image;

    const gridCols = Number(page?.grid_columns) || 3;
    const globalAspect = page?.image_aspect || 'aspect-16/10';
    const showIcons = page?.show_icons !== false;
    const showReadTime = page?.show_read_time !== false;
    const showDate = page?.show_date !== false;
    const showAuthor = page?.show_author !== false;
    const ctaText = page?.cta_text || 'Baca Artikel';

    const gridColsClass =
        {
            2: 'grid-cols-1 md:grid-cols-2',
            3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
            4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
        }[gridCols] || 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';

    return (
        <PublicLayout title="Jejak Rasa Journal — Cerita & Edukasi Kopi">
            <div
                className="relative space-y-3 overflow-hidden border-b border-brand-900 bg-brand-950 px-4 py-16 text-center text-white sm:px-6 lg:px-8"
                style={
                    heroBgImage
                        ? {
                              backgroundImage: `url(${resolveImageUrl(heroBgImage)})`,
                              backgroundSize: 'cover',
                              backgroundPosition: 'center',
                          }
                        : undefined
                }
            >
                {heroBgImage && (
                    <div className="absolute inset-0 bg-brand-950/80 backdrop-blur-xs" />
                )}

                <div className="relative z-10 mx-auto max-w-3xl space-y-3">
                    <div className="inline-flex items-center gap-1.5 rounded-full border border-accent-copper/40 bg-accent-copper/20 px-3 py-1 text-xs font-bold tracking-widest text-accent-copper uppercase">
                        <DynamicCategoryIcon
                            icon={heroIcon}
                            className="h-3.5 w-3.5"
                        />
                        <span>{heroBadge}</span>
                    </div>
                    <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
                        {heroTitle}
                    </h1>
                    <p className="mx-auto max-w-xl text-xs text-brand-300 sm:text-sm">
                        {heroDesc}
                    </p>
                </div>
            </div>

            <div className="mx-auto max-w-7xl space-y-12 px-4 py-16 sm:px-6 lg:px-8">
                {Boolean(page?.flipbook_enabled) &&
                    Array.isArray(page?.flipbook_pages) &&
                    page.flipbook_pages.length > 0 && (
                        <div className="mx-auto max-w-5xl">
                            <FlipBookSlider
                                pages={page.flipbook_pages}
                                title={page.flipbook_title}
                                subtitle={page.flipbook_subtitle}
                                theme={page.flipbook_theme || 'midnight'}
                                autoplay={Boolean(page.flipbook_autoplay)}
                            />
                        </div>
                    )}

                <div className={`grid ${gridColsClass} gap-8`}>
                    {posts.data.map((post) => {
                        const title =
                            typeof post.title === 'string'
                                ? post.title
                                : (post.title as any)?.id || '';
                        const excerpt =
                            typeof post.excerpt === 'string'
                                ? post.excerpt
                                : (post.excerpt as any)?.id || '';
                        const meta = (post.meta as Record<string, any>) || {};
                        const articleIcon = meta.icon || 'newspaper';
                        const isFeatured = Boolean(meta.is_featured);
                        const badgeLabel = meta.badge_label;
                        const cardAspect = getAspectClass(
                            meta.image_aspect_ratio || globalAspect,
                        );

                        return (
                            <Link
                                key={post.id}
                                href={`/blog/${post.slug}`}
                                className={`group overflow-hidden rounded-3xl border bg-white ${
                                    isFeatured
                                        ? 'border-accent-copper/50 ring-2 ring-accent-copper/20'
                                        : 'border-sand-200'
                                } flex flex-col justify-between shadow-xs transition-all hover:shadow-xl`}
                            >
                                <div>
                                    <div
                                        className={`${cardAspect} relative overflow-hidden bg-cream-50`}
                                    >
                                        <img
                                            src={resolveImageUrl(
                                                post.cover_image,
                                            )}
                                            alt={title}
                                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                        />

                                        {isFeatured && (
                                            <div className="absolute top-3 left-3 flex items-center gap-1 rounded-full border border-amber-400/30 bg-brand-950/90 px-2.5 py-1 text-[10px] font-bold text-amber-400 shadow-sm backdrop-blur-xs">
                                                <span>★</span>
                                                <span>Sorotan</span>
                                            </div>
                                        )}

                                        {badgeLabel &&
                                            badgeLabel.toLowerCase() !==
                                                'catatan roaster' && (
                                                <div className="absolute top-3 right-3 rounded-full bg-accent-copper px-2.5 py-1 text-[10px] font-bold text-white shadow-sm">
                                                    {badgeLabel}
                                                </div>
                                            )}
                                    </div>

                                    <div className="space-y-3 p-6">
                                        <div className="flex flex-wrap items-center gap-2 text-xs text-brand-500">
                                            <span className="inline-flex items-center gap-1 font-bold tracking-wider text-accent-copper uppercase">
                                                {showIcons && (
                                                    <DynamicCategoryIcon
                                                        icon={articleIcon}
                                                        className="h-3.5 w-3.5"
                                                    />
                                                )}
                                                <span>{post.category}</span>
                                            </span>

                                            {showReadTime &&
                                                post.read_time_minutes > 0 && (
                                                    <>
                                                        <span>•</span>
                                                        <span className="flex items-center gap-1">
                                                            <Clock className="h-3.5 w-3.5" />
                                                            <span>
                                                                {
                                                                    post.read_time_minutes
                                                                }{' '}
                                                                mnt
                                                            </span>
                                                        </span>
                                                    </>
                                                )}

                                            {showDate && post.published_at && (
                                                <>
                                                    <span>•</span>
                                                    <span className="flex items-center gap-1">
                                                        <Calendar className="h-3.5 w-3.5" />
                                                        <span>
                                                            {formatDate(
                                                                post.published_at,
                                                            )}
                                                        </span>
                                                    </span>
                                                </>
                                            )}
                                        </div>

                                        <h2 className="line-clamp-2 text-lg leading-snug font-bold text-brand-950 transition-colors group-hover:text-brand-700 sm:text-xl">
                                            {title}
                                        </h2>

                                        {excerpt && (
                                            <p className="line-clamp-3 text-sm leading-relaxed text-brand-600">
                                                {excerpt}
                                            </p>
                                        )}

                                        {showAuthor && post.author_name && (
                                            <div className="flex items-center gap-1.5 pt-2 text-[11px] text-brand-400">
                                                <User className="h-3 w-3" />
                                                <span>
                                                    Oleh {post.author_name}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="border-sand-100 flex items-center justify-between border-t bg-cream-50 px-6 py-4 text-xs font-bold text-brand-700 group-hover:text-accent-copper">
                                    <span>{ctaText}</span>
                                    <ArrowRight className="h-4 w-4" />
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </PublicLayout>
    );
}
