import React, { useState, useRef, useMemo } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import {
    Search,
    ChevronLeft,
    ChevronRight,
    Home,
    LayoutGrid,
    ShoppingBag,
    User,
} from 'lucide-react';
import { useCart } from '@/context/cart-context';
import { SearchModal } from '@/components/search-modal';
import { CATEGORIES_DATA, CategoryGroup } from '@/data/categories';
import { SubcategoryIcon } from '@/components/category-illustrations';

interface NavSubcategory {
    id: string;
    name: string;
    url: string;
    icon?: string;
    image?: string | null;
    is_active?: boolean;
}

interface NavCategory {
    id: string;
    name: string;
    slug?: string;
    url: string;
    is_active?: boolean;
    subcategories?: NavSubcategory[];
}

interface AllCategoriesPageProps {
    navCategories?: NavCategory[];
}

export default function AllCategoriesPage({
    navCategories,
}: AllCategoriesPageProps) {
    const pageProps = usePage().props as any;
    const { itemCount, setIsCartOpen } = useCart();
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [activeChip, setActiveChip] = useState<string>('Semua');
    const chipScrollRef = useRef<HTMLDivElement>(null);

    const rawCategories: NavCategory[] =
        navCategories ||
        pageProps.navbarCategories ||
        pageProps.desktopMegaMenuCategories ||
        [];

    // Parse and normalize category list from admin settings (with fallback to default CATEGORIES_DATA)
    const activeCategories: CategoryGroup[] = useMemo(() => {
        if (!rawCategories || !rawCategories.length) {
            return CATEGORIES_DATA;
        }

        const filtered = rawCategories
            .filter((cat) => cat.is_active !== false)
            .map((cat) => {
                const catId =
                    cat.id ||
                    cat.slug ||
                    cat.name.toLowerCase().replace(/\s+/g, '-');
                const validSubs = (cat.subcategories || [])
                    .filter((sub) => sub.is_active !== false)
                    .map((sub) => ({
                        id:
                            sub.id ||
                            sub.name.toLowerCase().replace(/\s+/g, '-'),
                        name: sub.name,
                        slug: sub.id,
                        url: sub.url || `/shop?category=${sub.id}`,
                        icon: sub.icon || 'coffee-beans',
                        image: sub.image || null,
                    }));

                return {
                    id: catId,
                    chip: cat.name,
                    name: cat.name,
                    slug: cat.slug || catId,
                    viewAllUrl:
                        cat.url || `/shop?category=${cat.slug || catId}`,
                    subcategories: validSubs,
                };
            })
            .filter((cat) => cat.subcategories.length > 0);

        return filtered.length > 0 ? filtered : CATEGORIES_DATA;
    }, [rawCategories]);

    const chips = useMemo(() => {
        return ['Semua', ...activeCategories.map((c) => c.chip)];
    }, [activeCategories]);

    const handleChipClick = (chip: string) => {
        setActiveChip(chip);

        if (chip === 'Semua') {
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }

        // Find category group associated with the chip
        const targetCategory = activeCategories.find(
            (c) => c.chip.toLowerCase() === chip.toLowerCase(),
        );
        if (targetCategory) {
            const el = document.getElementById(
                `cat-section-${targetCategory.id}`,
            );
            if (el) {
                const headerOffset = 110;
                const elementPosition = el.getBoundingClientRect().top;
                const offsetPosition =
                    elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth',
                });
            }
        }
    };

    return (
        <div className="flex min-h-screen justify-center bg-sand-200/50 font-sans text-brand-950 antialiased selection:bg-brand-900 selection:text-white">
            <Head title="Semua Kategori - Alat Kopi Malang" />

            {/* Global Search Modal */}
            <SearchModal
                isOpen={isSearchOpen}
                onClose={() => setIsSearchOpen(false)}
            />

            {/* Mobile-first Container (max-w-md centered on desktop) */}
            <div className="relative flex min-h-screen w-full max-w-md flex-col bg-white shadow-2xl sm:border-x sm:border-sand-200">
                {/* Fixed / Sticky Top Header */}
                <header className="sticky top-0 z-40 border-b border-sand-200/90 bg-white/95 backdrop-blur-md">
                    {/* Top Bar */}
                    <div className="relative flex h-14 items-center justify-between px-4">
                        <Link
                            href="/"
                            className="-ml-2 flex h-10 w-10 items-center justify-center rounded-full text-brand-700 transition-colors hover:text-brand-950 active:bg-sand-200/60"
                            aria-label="Kembali ke Beranda"
                        >
                            <ChevronLeft className="h-5 w-5" />
                        </Link>

                        <h1 className="text-base font-bold tracking-tight text-brand-950">
                            Semua Kategori
                        </h1>

                        <button
                            type="button"
                            onClick={() => setIsSearchOpen(true)}
                            className="-mr-2 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full text-brand-700 transition-colors hover:text-brand-950 active:bg-sand-200/60"
                            aria-label="Cari Produk atau Kategori"
                        >
                            <Search className="h-5 w-5" />
                        </button>
                    </div>

                    {/* Horizontal Scrollable Filter Tabs (Chips) */}
                    <div
                        ref={chipScrollRef}
                        className="no-scrollbar flex items-center gap-2 overflow-x-auto scroll-smooth px-4 pb-3"
                        style={{
                            scrollbarWidth: 'none',
                            msOverflowStyle: 'none',
                        }}
                    >
                        {chips.map((chip) => {
                            const isActive = activeChip === chip;
                            return (
                                <button
                                    key={chip}
                                    type="button"
                                    onClick={() => handleChipClick(chip)}
                                    className={`shrink-0 cursor-pointer rounded-full px-4 py-1.5 text-xs transition-all duration-200 ${
                                        isActive
                                            ? 'bg-brand-900 font-bold text-white shadow-xs ring-1 ring-brand-900'
                                            : 'border border-sand-200 bg-cream-100/90 font-semibold text-brand-700 hover:border-brand-300 hover:bg-sand-200/60 active:scale-95'
                                    }`}
                                >
                                    {chip}
                                </button>
                            );
                        })}
                    </div>
                </header>

                {/* Main Content Area */}
                <main className="flex-1 space-y-7 px-4 py-5 pb-28">
                    {activeCategories.map((group: CategoryGroup) => (
                        <section
                            key={group.id}
                            id={`cat-section-${group.id}`}
                            className="scroll-mt-32 space-y-3"
                        >
                            {/* Section Header Row */}
                            <div className="flex items-center justify-between">
                                <h2 className="text-[15px] font-extrabold tracking-tight text-brand-950">
                                    {group.name}
                                </h2>
                                <Link
                                    href={group.viewAllUrl}
                                    className="group flex items-center gap-0.5 text-xs font-bold text-accent-copper transition-colors hover:text-accent-copper-hover"
                                >
                                    <span>Lihat Semua</span>
                                    <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                                </Link>
                            </div>

                            {/* 2-Column Grid */}
                            <div className="grid grid-cols-2 gap-3">
                                {group.subcategories.map((sub: any) => {
                                    const isExternal =
                                        sub.url?.startsWith('http://') ||
                                        sub.url?.startsWith('https://');
                                    const content = (
                                        <>
                                            {/* Thumbnail asset icon or uploaded image */}
                                            <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-sand-200/60 bg-white p-1.5 shadow-[inset_0_1px_2px_rgba(18,30,33,0.02)]">
                                                {sub.image ? (
                                                    <img
                                                        src={
                                                            sub.image.startsWith(
                                                                'http://',
                                                            ) ||
                                                            sub.image.startsWith(
                                                                'https://',
                                                            )
                                                                ? sub.image
                                                                : `/storage/${sub.image.replace(/^\/?(public\/|storage\/)?/, '')}`
                                                        }
                                                        alt={sub.name}
                                                        className="h-full w-full rounded-md object-cover transition-transform duration-200 group-hover:scale-105"
                                                    />
                                                ) : (
                                                    <SubcategoryIcon
                                                        name={
                                                            sub.icon ||
                                                            'coffee-beans'
                                                        }
                                                        className="h-10 w-10 object-contain transition-transform duration-200 group-hover:scale-105"
                                                    />
                                                )}
                                            </div>

                                            {/* Subcategory title */}
                                            <span className="line-clamp-2 text-xs leading-snug font-semibold text-brand-950">
                                                {sub.name}
                                            </span>
                                        </>
                                    );

                                    const linkClass =
                                        'group bg-cream-100/70 hover:bg-sand-200/70 border border-sand-200/80 rounded-2xl p-2.5 flex items-center gap-2.5 active:scale-[0.98] transition-all duration-150 text-left shadow-[0_1px_2px_rgba(18,30,33,0.02)]';

                                    return isExternal ? (
                                        <a
                                            key={sub.id}
                                            href={sub.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className={linkClass}
                                        >
                                            {content}
                                        </a>
                                    ) : (
                                        <Link
                                            key={sub.id}
                                            href={sub.url}
                                            className={linkClass}
                                        >
                                            {content}
                                        </Link>
                                    );
                                })}
                            </div>
                        </section>
                    ))}
                </main>

                {/* Fixed Bottom Navigation Bar */}
                <nav
                    className="fixed inset-x-0 bottom-0 z-50 mx-auto max-w-md border-t border-sand-200/90 bg-white/95 px-3 py-2.5 pb-[max(0.6rem,env(safe-area-inset-bottom))] font-sans shadow-[0_-4px_20px_rgba(18,30,33,0.06)] backdrop-blur-md"
                    aria-label="Navigasi Utama"
                >
                    <div className="grid grid-cols-4 items-center">
                        {/* 1. Home */}
                        <Link
                            href="/"
                            className="flex flex-col items-center justify-center py-1 font-medium text-brand-600/70 transition-all duration-150 hover:text-brand-950 active:scale-95"
                        >
                            <Home className="mb-1.5 h-6 w-6 stroke-[1.8]" />
                            <span className="text-[11.5px] leading-none font-semibold tracking-tight">
                                Home
                            </span>
                        </Link>

                        {/* 2. Kategori (ACTIVE) */}
                        <Link
                            href="/kategori"
                            className="flex flex-col items-center justify-center py-1 font-bold text-accent-copper transition-all duration-150 active:scale-95"
                        >
                            <div className="relative">
                                <LayoutGrid className="mb-1.5 h-6 w-6 stroke-[2.2]" />
                            </div>
                            <span className="text-[11.5px] leading-none font-semibold tracking-tight">
                                Kategori
                            </span>
                        </Link>

                        {/* 3. Keranjang */}
                        <button
                            type="button"
                            onClick={() => setIsCartOpen(true)}
                            className="relative flex cursor-pointer flex-col items-center justify-center py-1 font-medium text-brand-600/70 transition-all duration-150 hover:text-brand-950 active:scale-95"
                        >
                            <div className="relative">
                                <ShoppingBag className="mb-1.5 h-6 w-6 stroke-[1.8]" />
                                {itemCount > 0 && (
                                    <span className="absolute -top-1.5 -right-2.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full border-2 border-white bg-accent-copper px-1 text-[10px] font-black text-white shadow-xs">
                                        {itemCount > 99 ? '99+' : itemCount}
                                    </span>
                                )}
                            </div>
                            <span className="text-[11.5px] leading-none font-semibold tracking-tight">
                                Keranjang
                            </span>
                        </button>

                        {/* 4. Akun */}
                        <Link
                            href="/login"
                            className="flex flex-col items-center justify-center py-1 font-medium text-brand-600/70 transition-all duration-150 hover:text-brand-950 active:scale-95"
                        >
                            <User className="mb-1.5 h-6 w-6 stroke-[1.8]" />
                            <span className="text-[11.5px] leading-none font-semibold tracking-tight">
                                Akun
                            </span>
                        </Link>
                    </div>
                </nav>
            </div>
        </div>
    );
}
