import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Clock, Calendar, Tag } from 'lucide-react';
import { PublicLayout } from '@/layouts/public-layout';
import DynamicCategoryIcon from '@/components/dynamic-category-icon';
import FlipBookSlider, {
    type FlipBookPageItem,
} from '@/components/flipbook-slider';
import type { Post } from '@/types/sanubari';
import {
    ScrollProgress,
    ScrollProgressProvider,
} from '@animate-ui/react/primitives/scroll-progress';

interface BlogShowProps {
    post: Post;
    contentHtml?: string | null;
    relatedPosts: Post[];
}

const resolveImageUrl = (img?: string | null) => {
    if (!img) return null;
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
            month: 'long',
            year: 'numeric',
        });
    } catch {
        return dateString;
    }
};

const getContentAspectClass = (aspect?: string) => {
    switch (aspect) {
        case 'aspect-16/9':
            return 'aspect-16/9';
        case 'aspect-4/3':
            return 'aspect-4/3';
        case 'aspect-square':
            return 'aspect-square';
        case 'auto':
        default:
            return 'aspect-auto min-h-[220px]';
    }
};

export default function BlogShow({
    post,
    contentHtml,
    relatedPosts = [],
}: BlogShowProps) {
    const title =
        typeof post.title === 'string'
            ? post.title
            : (post.title as any)?.id || '';
    const body =
        typeof post.body === 'string'
            ? post.body
            : (post.body as any)?.id || '';
    const meta = (post.meta as Record<string, any>) || {};

    const articleIcon = meta.icon || 'newspaper';
    const isFeatured = Boolean(meta.is_featured);
    const badgeLabel = meta.badge_label;
    const coverCaption = meta.cover_caption;

    // Gallery settings
    const galleryImages: string[] = Array.isArray(meta.gallery_images)
        ? meta.gallery_images
        : [];
    const galleryColsRaw = meta.gallery_columns;
    const isGalleryFlipbook = galleryColsRaw === 'flipbook_3d';
    const galleryCols = Number(galleryColsRaw) || 3;
    const galleryTitle = meta.gallery_title || 'Galeri Gambar Artikel';
    const galleryPosition = meta.gallery_position || 'after_content';

    // Dedicated 3D Page-Flip Book Slider settings
    const flipbookEnabled = Boolean(meta.flipbook_enabled);
    const flipbookPages: FlipBookPageItem[] = Array.isArray(meta.flipbook_pages)
        ? meta.flipbook_pages
        : [];
    const flipbookTitle = meta.flipbook_title || '';
    const flipbookSubtitle = meta.flipbook_subtitle || '';
    const flipbookPosition = meta.flipbook_position || 'after_cover';
    const flipbookTheme = meta.flipbook_theme || 'midnight';
    const flipbookAutoplay = Boolean(meta.flipbook_autoplay);

    // In-content image & grid settings (Desktop & Mobile)
    const contentImages: string[] = Array.isArray(meta.content_images)
        ? meta.content_images
        : [];
    const contentImageLayout = meta.content_image_layout || 'grid';
    const contentGridCols = Number(meta.content_grid_cols_desktop) || 2;
    const contentAspect = meta.content_image_aspect || 'aspect-16/9';
    const contentMobileMode = meta.content_mobile_mode || 'stacked_full';
    const contentMobileOrder = meta.content_mobile_order || 'image_first';
    const contentPosition = meta.content_image_position || 'before_text';
    const contentCaption = meta.content_image_caption;
    const contentBlocks: any[] = Array.isArray(meta.content_blocks)
        ? meta.content_blocks
        : [];

    const tags: string[] = Array.isArray(meta.tags) ? meta.tags : [];

    const galleryColsClass =
        {
            2: 'grid-cols-1 sm:grid-cols-2',
            3: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3',
            4: 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4',
        }[galleryCols] || 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3';

    const renderDedicatedFlipbook = () => {
        if (!flipbookEnabled || !flipbookPages || flipbookPages.length === 0)
            return null;

        return (
            <FlipBookSlider
                pages={flipbookPages}
                title={flipbookTitle}
                subtitle={flipbookSubtitle}
                theme={flipbookTheme}
                autoplay={flipbookAutoplay}
            />
        );
    };

    const renderGallery = () => {
        if (!galleryImages || galleryImages.length === 0) return null;

        if (isGalleryFlipbook) {
            const pagesFromGallery: FlipBookPageItem[] = galleryImages.map(
                (img, idx) => ({
                    image: img,
                    page_number: String(idx + 1).padStart(2, '0'),
                    title: galleryTitle || title,
                    caption:
                        coverCaption ||
                        `Dokumentasi visual #${idx + 1} — ${title}`,
                    text_style: idx % 2 === 0 ? 'quote_italic' : 'regular',
                }),
            );

            return (
                <FlipBookSlider
                    pages={pagesFromGallery}
                    title={galleryTitle}
                    theme={flipbookTheme}
                />
            );
        }

        return (
            <div className="space-y-4 py-6">
                {galleryTitle && (
                    <h3 className="border-b border-sand-200 pb-2 text-lg font-bold text-brand-950">
                        {galleryTitle}
                    </h3>
                )}
                <div className={`grid ${galleryColsClass} gap-4`}>
                    {galleryImages.map((img, idx) => (
                        <div
                            key={idx}
                            className="group aspect-4/3 overflow-hidden rounded-2xl border border-sand-200 bg-cream-50 shadow-xs transition-shadow hover:shadow-md"
                        >
                            <img
                                src={resolveImageUrl(img) || img}
                                alt={`${title} - foto ${idx + 1}`}
                                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    const renderInContentImages = () => {
        if (!contentImages || contentImages.length === 0) return null;

        if (contentImageLayout === 'flipbook_3d') {
            const pagesFromContent: FlipBookPageItem[] = contentImages.map(
                (img, idx) => ({
                    image: img,
                    page_number: String(idx + 1).padStart(2, '0'),
                    title: title,
                    caption:
                        contentCaption ||
                        `Lembar visual #${idx + 1} — ${title}`,
                    text_style: idx % 2 === 0 ? 'quote_italic' : 'regular',
                }),
            );

            return (
                <FlipBookSlider
                    pages={pagesFromContent}
                    subtitle={contentCaption}
                    theme={flipbookTheme}
                />
            );
        }

        const desktopColsClass =
            {
                1: 'md:grid-cols-1',
                2: 'md:grid-cols-2',
                3: 'md:grid-cols-3',
                4: 'md:grid-cols-4',
            }[contentGridCols] || 'md:grid-cols-2';

        const isSwipe = contentMobileMode === 'carousel_swipe';
        const isHiddenMobile = contentMobileMode === 'hidden_mobile';
        const isGrid2Mobile = contentMobileMode === 'grid_2';

        let containerClass = '';
        let itemClass = '';

        if (isHiddenMobile) {
            containerClass = `hidden md:grid ${desktopColsClass} gap-4 my-6`;
            itemClass = 'w-full';
        } else if (isSwipe) {
            containerClass = `flex overflow-x-auto snap-x snap-mandatory gap-3 no-scrollbar pb-3 md:grid ${desktopColsClass} md:gap-4 my-6`;
            itemClass = 'shrink-0 w-[82vw] sm:w-[60vw] snap-center md:w-full';
        } else if (isGrid2Mobile) {
            containerClass = `grid grid-cols-2 ${desktopColsClass} gap-3 md:gap-4 my-6`;
            itemClass = 'w-full';
        } else {
            // stacked_full
            containerClass = `grid grid-cols-1 ${desktopColsClass} gap-4 my-6`;
            itemClass = 'w-full';
        }

        const aspectClass = getContentAspectClass(contentAspect);

        return (
            <div className="space-y-2">
                <div className={containerClass}>
                    {contentImages.map((img, idx) => (
                        <div
                            key={idx}
                            className={`${itemClass} ${aspectClass} group overflow-hidden rounded-2xl border border-sand-200 bg-sand-200 shadow-xs transition-shadow hover:shadow-md`}
                        >
                            <img
                                src={resolveImageUrl(img) || img}
                                alt={`${title} - ilustrasi ${idx + 1}`}
                                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                        </div>
                    ))}
                </div>
                {contentCaption && (
                    <p className="pb-2 text-center text-xs text-brand-500 italic">
                        {contentCaption}
                    </p>
                )}
            </div>
        );
    };

    const renderTextContent = () => {
        if (contentHtml) {
            return (
                <div
                    className="layup-content-wrapper leading-relaxed text-brand-900"
                    dangerouslySetInnerHTML={{ __html: contentHtml }}
                />
            );
        }

        if (/<[a-z][\s\S]*>/i.test(body)) {
            return (
                <div
                    className="article-content max-w-none space-y-6 text-sm leading-relaxed text-brand-800 sm:text-base"
                    dangerouslySetInnerHTML={{ __html: body }}
                />
            );
        }

        return (
            <div className="article-content max-w-none space-y-6 text-sm leading-relaxed text-brand-800 sm:text-base">
                {(typeof body === 'string' ? body : '')
                    .split('\n\n')
                    .map((paragraph: string, i: number) => (
                        <p key={i} className="leading-relaxed">
                            {paragraph}
                        </p>
                    ))}
            </div>
        );
    };

    const renderContentBlocks = () => {
        if (!contentBlocks || contentBlocks.length === 0) return null;

        return (
            <div className="my-8 space-y-8">
                {contentBlocks.map((block: any, idx: number) => {
                    const blockType = block?.type;
                    const data = block?.data || {};

                    if (blockType === 'table') {
                        const headers: string[] = Array.isArray(data.headers)
                            ? data.headers
                            : [];
                        const rows: any[] = Array.isArray(data.rows)
                            ? data.rows
                            : [];
                        const blockTitle = data.title || '';
                        const subtitle = data.subtitle || '';
                        const layoutDesktop = data.layout_desktop || 'striped';
                        const layoutTablet = data.layout_tablet || 'responsive';
                        const layoutMobile = data.layout_mobile || 'cards';

                        const tableBorderClass =
                            layoutDesktop === 'bordered'
                                ? 'border border-sand-300 [&_th]:border [&_th]:border-sand-300 [&_td]:border [&_td]:border-sand-200'
                                : layoutDesktop === 'clean'
                                  ? 'border-0 [&_th]:border-b-2 [&_th]:border-sand-200 [&_td]:border-b [&_td]:border-sand-100'
                                  : 'border border-sand-200 [&_tr:nth-child(even)]:bg-[#fcfaf7]';

                        return (
                            <div key={idx} className="my-8 space-y-3">
                                {blockTitle && (
                                    <div>
                                        <h3 className="text-base font-bold text-brand-950 sm:text-lg">
                                            {blockTitle}
                                        </h3>
                                        {subtitle && (
                                            <p className="mt-0.5 text-xs text-brand-500">
                                                {subtitle}
                                            </p>
                                        )}
                                    </div>
                                )}

                                {/* Mobile Cards Mode (layoutMobile === 'cards') */}
                                {layoutMobile === 'cards' && (
                                    <div className="block space-y-3 md:hidden">
                                        {rows.map(
                                            (rowItem: any, rIdx: number) => {
                                                const cells: string[] =
                                                    Array.isArray(
                                                        rowItem?.cells,
                                                    )
                                                        ? rowItem.cells
                                                        : typeof rowItem?.cells ===
                                                            'string'
                                                          ? [rowItem.cells]
                                                          : [];
                                                return (
                                                    <div
                                                        key={rIdx}
                                                        className="space-y-2 rounded-xl border border-sand-200 bg-white p-4 shadow-2xs transition-colors hover:border-sand-300"
                                                    >
                                                        <div className="border-sand-100 mb-1.5 flex items-center justify-between border-b pb-1.5">
                                                            <span className="text-[10px] font-bold tracking-wider text-accent-copper uppercase">
                                                                Data #{rIdx + 1}
                                                            </span>
                                                        </div>
                                                        {headers.map(
                                                            (
                                                                h: string,
                                                                hIdx: number,
                                                            ) => (
                                                                <div
                                                                    key={hIdx}
                                                                    className="border-sand-50 flex items-baseline justify-between gap-3 border-b pb-1.5 text-xs last:border-b-0 last:pb-0"
                                                                >
                                                                    <span className="shrink-0 font-semibold text-brand-600">
                                                                        {h}
                                                                    </span>
                                                                    <span className="text-right font-medium text-brand-950">
                                                                        {cells[
                                                                            hIdx
                                                                        ] ??
                                                                            '-'}
                                                                    </span>
                                                                </div>
                                                            ),
                                                        )}
                                                    </div>
                                                );
                                            },
                                        )}
                                    </div>
                                )}

                                {/* Regular Table Mode (Desktop/Tablet, and Mobile if not cards) */}
                                <div
                                    className={`${
                                        layoutMobile === 'cards'
                                            ? 'hidden md:block'
                                            : 'block'
                                    } ${
                                        layoutMobile === 'scroll' ||
                                        layoutTablet === 'scroll'
                                            ? '-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0'
                                            : 'overflow-hidden'
                                    } rounded-xl border border-sand-200 bg-white shadow-2xs`}
                                >
                                    <table
                                        className={`w-full text-left text-brand-800 ${layoutMobile === 'compact' ? 'text-xs' : 'text-xs sm:text-sm'} ${tableBorderClass}`}
                                    >
                                        {headers.length > 0 && (
                                            <thead className="border-b border-sand-200 bg-[#f8f9fa] text-[11px] font-bold tracking-wider text-brand-950 uppercase">
                                                <tr>
                                                    {headers.map(
                                                        (
                                                            h: string,
                                                            hIdx: number,
                                                        ) => (
                                                            <th
                                                                key={hIdx}
                                                                className={`${layoutMobile === 'compact' ? 'px-3 py-2' : 'px-4 py-3 sm:px-5 sm:py-3.5'}`}
                                                            >
                                                                {h}
                                                            </th>
                                                        ),
                                                    )}
                                                </tr>
                                            </thead>
                                        )}
                                        <tbody className="divide-y divide-sand-200">
                                            {rows.map(
                                                (
                                                    rowItem: any,
                                                    rIdx: number,
                                                ) => {
                                                    const cells: string[] =
                                                        Array.isArray(
                                                            rowItem?.cells,
                                                        )
                                                            ? rowItem.cells
                                                            : typeof rowItem?.cells ===
                                                                'string'
                                                              ? [rowItem.cells]
                                                              : [];
                                                    return (
                                                        <tr
                                                            key={rIdx}
                                                            className="hover:bg-sand-100/50 transition-colors"
                                                        >
                                                            {headers.map(
                                                                (
                                                                    _: string,
                                                                    hIdx: number,
                                                                ) => (
                                                                    <td
                                                                        key={
                                                                            hIdx
                                                                        }
                                                                        className={`${layoutMobile === 'compact' ? 'px-3 py-2' : 'px-4 py-3 sm:px-5 sm:py-3.5'}`}
                                                                    >
                                                                        {cells[
                                                                            hIdx
                                                                        ] ??
                                                                            '-'}
                                                                    </td>
                                                                ),
                                                            )}
                                                        </tr>
                                                    );
                                                },
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        );
                    }

                    if (blockType === 'icon_callout') {
                        const iconName = data.icon || 'coffee';
                        const blockTitle = data.title || '';
                        const text = data.text || '';
                        const color = data.color || 'copper';
                        const layoutDesktop = data.layout_desktop || 'banner';
                        const layoutMobile = data.layout_mobile || 'stacked';

                        const colorClasses: Record<
                            string,
                            {
                                container: string;
                                iconBox: string;
                                title: string;
                                text: string;
                            }
                        > = {
                            copper: {
                                container:
                                    'bg-[#fbf7f4] border-accent-copper/40',
                                iconBox: 'bg-accent-copper text-white',
                                title: 'text-brand-950',
                                text: 'text-brand-800',
                            },
                            amber: {
                                container: 'bg-amber-50/70 border-amber-300',
                                iconBox: 'bg-amber-500 text-white',
                                title: 'text-amber-950',
                                text: 'text-amber-900',
                            },
                            emerald: {
                                container:
                                    'bg-emerald-50/70 border-emerald-300',
                                iconBox: 'bg-emerald-600 text-white',
                                title: 'text-emerald-950',
                                text: 'text-emerald-900',
                            },
                            blue: {
                                container: 'bg-sky-50/70 border-sky-300',
                                iconBox: 'bg-sky-600 text-white',
                                title: 'text-sky-950',
                                text: 'text-sky-900',
                            },
                            slate: {
                                container: 'bg-sand-100/70 border-sand-300',
                                iconBox: 'bg-brand-900 text-white',
                                title: 'text-brand-950',
                                text: 'text-brand-800',
                            },
                        };

                        const activeColors =
                            colorClasses[color] || colorClasses.copper;

                        const desktopWidthMap: Record<string, string> = {
                            banner: 'w-full',
                            centered: 'w-full md:max-w-2xl md:mx-auto',
                            compact_side: 'w-full md:max-w-lg md:mx-auto',
                        };
                        const desktopWidthClass =
                            (layoutDesktop && desktopWidthMap[layoutDesktop]) ||
                            'w-full';

                        const mobileLayoutClass =
                            layoutMobile === 'inline'
                                ? 'flex flex-row items-start gap-3.5'
                                : 'flex flex-col sm:flex-row items-start gap-3.5';

                        return (
                            <div
                                key={idx}
                                className={`my-6 rounded-2xl border p-5 shadow-2xs sm:p-6 ${activeColors.container} ${desktopWidthClass}`}
                            >
                                <div className={mobileLayoutClass}>
                                    <div
                                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl shadow-xs ${activeColors.iconBox}`}
                                    >
                                        <DynamicCategoryIcon
                                            icon={iconName}
                                            className="h-5 w-5"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        {blockTitle && (
                                            <h4
                                                className={`text-base font-bold tracking-tight ${activeColors.title}`}
                                            >
                                                {blockTitle}
                                            </h4>
                                        )}
                                        <p
                                            className={`text-xs leading-relaxed whitespace-pre-line sm:text-sm ${activeColors.text}`}
                                        >
                                            {text}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        );
                    }

                    if (blockType === 'image_grid') {
                        const images: string[] = Array.isArray(data.images)
                            ? data.images
                            : [];
                        const caption = data.caption || '';
                        const layoutDesktop = Number(data.layout_desktop) || 2;
                        const layoutTablet = Number(data.layout_tablet) || 2;
                        const layoutMobile = data.layout_mobile || 'stacked';
                        const aspect = data.aspect_ratio || 'aspect-16/9';
                        const aspectClass = getContentAspectClass(aspect);

                        const desktopColsClass =
                            {
                                1: 'md:grid-cols-1',
                                2: 'md:grid-cols-2',
                                3: 'md:grid-cols-3',
                                4: 'md:grid-cols-4',
                            }[layoutDesktop] || 'md:grid-cols-2';

                        const tabletColsClass =
                            {
                                1: 'sm:grid-cols-1',
                                2: 'sm:grid-cols-2',
                                3: 'sm:grid-cols-3',
                            }[layoutTablet] || 'sm:grid-cols-2';

                        let containerClass = '';
                        let itemClass = '';

                        if (layoutMobile === 'swipe') {
                            containerClass = `flex overflow-x-auto snap-x snap-mandatory gap-3 no-scrollbar pb-3 sm:grid ${tabletColsClass} ${desktopColsClass} sm:gap-4 my-6`;
                            itemClass =
                                'shrink-0 w-[82vw] sm:w-full snap-center';
                        } else if (layoutMobile === 'grid_2') {
                            containerClass = `grid grid-cols-2 ${tabletColsClass} ${desktopColsClass} gap-3 sm:gap-4 my-6`;
                            itemClass = 'w-full';
                        } else {
                            containerClass = `grid grid-cols-1 ${tabletColsClass} ${desktopColsClass} gap-4 my-6`;
                            itemClass = 'w-full';
                        }

                        return (
                            <div key={idx} className="my-6 space-y-2">
                                <div className={containerClass}>
                                    {images.map((img: string, iIdx: number) => (
                                        <div
                                            key={iIdx}
                                            className={`${itemClass} ${aspectClass} group overflow-hidden rounded-2xl border border-sand-200 bg-sand-200 shadow-xs transition-shadow hover:shadow-md`}
                                        >
                                            <img
                                                src={
                                                    resolveImageUrl(img) || img
                                                }
                                                alt={`${title} - foto sisipan ${iIdx + 1}`}
                                                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                            />
                                        </div>
                                    ))}
                                </div>
                                {caption && (
                                    <p className="pb-1 text-center text-xs text-brand-500 italic">
                                        {caption}
                                    </p>
                                )}
                            </div>
                        );
                    }

                    if (blockType === 'text') {
                        const content = data.content || '';
                        const layoutDesktop = data.layout_desktop || 'standard';

                        if (layoutDesktop === 'lead') {
                            return (
                                <div
                                    key={idx}
                                    className="my-6 rounded-r-xl border-l-4 border-accent-copper bg-accent-copper/5 py-3 pl-5 text-base leading-relaxed font-medium text-brand-900 italic sm:text-lg"
                                    dangerouslySetInnerHTML={{
                                        __html: content,
                                    }}
                                />
                            );
                        }

                        return (
                            <div
                                key={idx}
                                className="article-content my-6 max-w-none space-y-4 text-sm leading-relaxed text-brand-800 sm:text-base"
                                dangerouslySetInnerHTML={{ __html: content }}
                            />
                        );
                    }

                    if (blockType === 'flipbook_3d') {
                        const pages: FlipBookPageItem[] = Array.isArray(
                            data.pages,
                        )
                            ? data.pages
                            : [];
                        return (
                            <FlipBookSlider
                                key={idx}
                                pages={pages}
                                title={data.title}
                                subtitle={data.subtitle}
                                theme={data.theme || 'midnight'}
                            />
                        );
                    }

                    return null;
                })}
            </div>
        );
    };

    const renderArticleBodyWithImages = () => {
        const hasContentImages = contentImages && contentImages.length > 0;

        if (!hasContentImages) {
            return (
                <div className="border-t border-sand-200 pt-4">
                    {renderTextContent()}
                    {renderContentBlocks()}
                </div>
            );
        }

        // Split 50:50 side-by-side layout on desktop
        if (contentImageLayout === 'split_right') {
            return (
                <div className="space-y-6 border-t border-sand-200 pt-4">
                    <div
                        className={`flex flex-col items-start gap-8 md:flex-row ${
                            contentMobileOrder === 'text_first'
                                ? 'flex-col-reverse'
                                : ''
                        }`}
                    >
                        <div className="w-full md:w-1/2">
                            {renderTextContent()}
                        </div>
                        <div className="w-full md:w-1/2">
                            {renderInContentImages()}
                        </div>
                    </div>
                    {renderContentBlocks()}
                </div>
            );
        }

        if (contentImageLayout === 'split_left') {
            return (
                <div className="space-y-6 border-t border-sand-200 pt-4">
                    <div
                        className={`flex flex-col items-start gap-8 md:flex-row-reverse ${
                            contentMobileOrder === 'text_first'
                                ? 'flex-col-reverse'
                                : ''
                        }`}
                    >
                        <div className="w-full md:w-1/2">
                            {renderTextContent()}
                        </div>
                        <div className="w-full md:w-1/2">
                            {renderInContentImages()}
                        </div>
                    </div>
                    {renderContentBlocks()}
                </div>
            );
        }

        // Top banner or before_text
        if (
            contentImageLayout === 'banner_top' ||
            contentPosition === 'before_text'
        ) {
            return (
                <div className="space-y-6 border-t border-sand-200 pt-4">
                    {renderInContentImages()}
                    {renderTextContent()}
                    {renderContentBlocks()}
                </div>
            );
        }

        // Default: after_text or banner_bottom
        return (
            <div className="space-y-6 border-t border-sand-200 pt-4">
                {renderTextContent()}
                {renderInContentImages()}
                {renderContentBlocks()}
            </div>
        );
    };

    return (
        <PublicLayout title={title}>
            <ScrollProgressProvider global>
                {/* Real-time reading scroll progress indicator */}
                <ScrollProgress
                    mode="scaleX"
                    className="fixed top-0 right-0 left-0 z-50 h-1 origin-left bg-accent-copper"
                />
                <div className="mx-auto max-w-4xl space-y-8 px-4 py-10 sm:px-6 lg:px-8">
                    {/* Back Link */}
                    <Link
                        href="/blog"
                        className="inline-flex items-center gap-1.5 text-xs text-brand-500 transition-colors hover:text-brand-900"
                    >
                        <ArrowLeft className="h-3.5 w-3.5" />
                        <span>Kembali ke Journal & Blog</span>
                    </Link>

                    {/* Article Header */}
                    <div className="space-y-4">
                        <div className="flex flex-wrap items-center gap-2.5 text-xs text-brand-500">
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-accent-copper px-3 py-1 text-[11px] font-bold tracking-wider text-white uppercase shadow-xs">
                                <DynamicCategoryIcon
                                    icon={articleIcon}
                                    className="h-3.5 w-3.5"
                                />
                                <span>{post.category}</span>
                            </span>

                            {isFeatured && (
                                <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-[10px] font-bold text-amber-700">
                                    ★ Sorotan
                                </span>
                            )}

                            {badgeLabel &&
                                badgeLabel.toLowerCase() !==
                                    'catatan roaster' && (
                                    <span className="rounded-full bg-sand-200 px-2.5 py-1 text-[10px] font-bold text-brand-800">
                                        {badgeLabel}
                                    </span>
                                )}

                            {post.author_name && (
                                <>
                                    <span>•</span>
                                    <span>Oleh {post.author_name}</span>
                                </>
                            )}

                            {post.published_at && (
                                <>
                                    <span>•</span>
                                    <span className="inline-flex items-center gap-1">
                                        <Calendar className="h-3 w-3" />
                                        <span>
                                            {formatDate(post.published_at)}
                                        </span>
                                    </span>
                                </>
                            )}

                            {post.read_time_minutes > 0 && (
                                <>
                                    <span>•</span>
                                    <span className="inline-flex items-center gap-1">
                                        <Clock className="h-3 w-3" />
                                        <span>
                                            {post.read_time_minutes} menit baca
                                        </span>
                                    </span>
                                </>
                            )}
                        </div>

                        <h1 className="text-3xl leading-tight font-extrabold tracking-tight text-brand-950 sm:text-5xl">
                            {title}
                        </h1>
                    </div>

                    {/* Cover Image */}
                    {post.cover_image && (
                        <div className="space-y-2">
                            <div className="aspect-16/9 overflow-hidden rounded-3xl bg-brand-900 shadow-md">
                                <img
                                    src={
                                        resolveImageUrl(post.cover_image) ||
                                        post.cover_image
                                    }
                                    alt={title}
                                    className="h-full w-full object-cover"
                                />
                            </div>
                            {coverCaption && (
                                <p className="pt-1 text-center text-xs text-brand-500 italic">
                                    {coverCaption}
                                </p>
                            )}
                        </div>
                    )}

                    {/* Dedicated 3D Flipbook if position is after_cover */}
                    {flipbookPosition === 'after_cover' &&
                        renderDedicatedFlipbook()}

                    {/* Gallery if position is after_cover */}
                    {galleryPosition === 'after_cover' && renderGallery()}

                    {/* Dedicated 3D Flipbook if position is before_content */}
                    {flipbookPosition === 'before_content' &&
                        renderDedicatedFlipbook()}

                    {/* Article Content with In-Content Images & Responsive Grid */}
                    {renderArticleBodyWithImages()}

                    {/* Dedicated 3D Flipbook if position is after_content */}
                    {flipbookPosition === 'after_content' &&
                        renderDedicatedFlipbook()}

                    {/* Gallery if position is after_content */}
                    {galleryPosition === 'after_content' && renderGallery()}

                    {/* Topic Tags */}
                    {tags.length > 0 && (
                        <div className="flex flex-wrap items-center gap-2 border-t border-sand-200 pt-6">
                            <span className="mr-1 flex items-center gap-1 text-xs font-semibold text-brand-500">
                                <Tag className="h-3.5 w-3.5" />
                                <span>Topik:</span>
                            </span>
                            {tags.map((tag, idx) => (
                                <span
                                    key={idx}
                                    className="rounded-full bg-sand-200 px-3 py-1 text-xs font-medium text-brand-800 transition-colors hover:bg-sand-300"
                                >
                                    #{tag}
                                </span>
                            ))}
                        </div>
                    )}

                    {/* Related Posts */}
                    {relatedPosts.length > 0 && (
                        <div className="space-y-6 border-t border-sand-200 pt-16">
                            <h2 className="text-2xl font-bold text-brand-950">
                                Artikel Lainnya
                            </h2>
                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                                {relatedPosts.map((p) => {
                                    const relTitle =
                                        typeof p.title === 'string'
                                            ? p.title
                                            : (p.title as any)?.id || '';
                                    return (
                                        <Link
                                            key={p.id}
                                            href={`/blog/${p.slug}`}
                                            className="group space-y-2.5 overflow-hidden rounded-2xl border border-sand-200 bg-white p-5 transition-all hover:shadow-md sm:p-6"
                                        >
                                            <span className="block text-xs font-bold tracking-wider text-accent-copper uppercase sm:text-sm">
                                                {p.category}
                                            </span>
                                            <h3 className="line-clamp-2 text-base leading-snug font-bold text-brand-950 group-hover:text-brand-700 sm:text-lg">
                                                {relTitle}
                                            </h3>
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </ScrollProgressProvider>
        </PublicLayout>
    );
}
