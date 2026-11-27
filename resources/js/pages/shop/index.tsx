import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import {
    Filter,
    Search,
    SlidersHorizontal,
    X,
    Loader2,
    ChevronLeft,
    ChevronRight,
} from 'lucide-react';
import { PublicLayout } from '@/layouts/public-layout';
import type { Category, Product } from '@/types/sanubari';
import { ProductCard } from '@/components/product-card';
import { CoffeeBeanIcon } from '@/components/coffee-bean-icon';
import { SectionHeading } from '@/components/ui/section-heading';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

interface ShopIndexProps {
    products: {
        data: Product[];
        current_page: number;
        last_page: number;
        total: number;
        links: Array<{ url: string | null; label: string; active: boolean }>;
    };
    categories: Category[];
    brands?: string[];
    filters: {
        q?: string;
        category?: string;
        series?: string;
        brand?: string;
        sort?: string;
    };
}

export default function ShopIndex({
    products,
    categories = [],
    brands = [],
    filters,
}: ShopIndexProps) {
    const [searchTerm, setSearchTerm] = useState(filters.q || '');
    const [selectedCategory, setSelectedCategory] = useState(
        filters.category || '',
    );
    const [selectedSeries, setSelectedSeries] = useState(filters.series || '');
    const [selectedBrand, setSelectedBrand] = useState(filters.brand || '');

    const [allProducts, setAllProducts] = useState<Product[]>(products.data);
    const [currentPage, setCurrentPage] = useState(products.current_page);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const loadMoreSentinelRef = useRef<HTMLDivElement>(null);
    const searchDebounceRef = useRef<NodeJS.Timeout | null>(null);
    const filterSentinelRef = useRef<HTMLDivElement>(null);
    const filterBarRef = useRef<HTMLDivElement>(null);
    const [isFilterPinned, setIsFilterPinned] = useState(false);
    const [filterBarHeight, setFilterBarHeight] = useState(0);

    useEffect(() => {
        const sentinel = filterSentinelRef.current;
        if (!sentinel) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (!entry.isIntersecting && entry.boundingClientRect.top < 73) {
                    if (filterBarRef.current) {
                        setFilterBarHeight(filterBarRef.current.offsetHeight);
                    }
                    setIsFilterPinned(true);
                } else {
                    setIsFilterPinned(false);
                }
            },
            { rootMargin: '-73px 0px 0px 0px', threshold: 0 },
        );

        observer.observe(sentinel);
        return () => observer.disconnect();
    }, []);

    // Horizontal scroll navigation for category filter pills
    const pillsContainerRef = useRef<HTMLDivElement>(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(false);

    const checkPillsScroll = useCallback(() => {
        const el = pillsContainerRef.current;
        if (el) {
            setCanScrollLeft(el.scrollLeft > 6);
            setCanScrollRight(
                el.scrollLeft + el.clientWidth < el.scrollWidth - 6,
            );
        }
    }, []);

    useEffect(() => {
        checkPillsScroll();
        const el = pillsContainerRef.current;
        if (!el) return;
        const resizeObserver = new ResizeObserver(() => checkPillsScroll());
        resizeObserver.observe(el);
        window.addEventListener('resize', checkPillsScroll);
        return () => {
            resizeObserver.disconnect();
            window.removeEventListener('resize', checkPillsScroll);
        };
    }, [checkPillsScroll, categories]);

    const scrollPills = (direction: 'left' | 'right') => {
        if (pillsContainerRef.current) {
            const scrollAmount = direction === 'left' ? -240 : 240;
            pillsContainerRef.current.scrollBy({
                left: scrollAmount,
                behavior: 'smooth',
            });
        }
    };

    // Sync state when props filters change from server/navigation
    useEffect(() => {
        setSearchTerm(filters.q || '');
        setSelectedCategory(filters.category || '');
        setSelectedSeries(filters.series || '');
        setSelectedBrand(filters.brand || '');
    }, [filters.q, filters.category, filters.series, filters.brand]);

    // Sync when filters change or products update from server
    useEffect(() => {
        if (products.current_page === 1) {
            setAllProducts(products.data);
            setCurrentPage(1);
        } else {
            setAllProducts((prev) => {
                const existing = new Set(prev.map((p) => p.id));
                const newItems = products.data.filter(
                    (p) => !existing.has(p.id),
                );
                return [...prev, ...newItems];
            });
            setCurrentPage(products.current_page);
        }
    }, [products]);

    const hasMore = currentPage < products.last_page;

    const loadMoreProducts = useCallback(() => {
        if (isLoadingMore || !hasMore) return;
        setIsLoadingMore(true);
        const nextPage = currentPage + 1;

        router.get(
            '/shop',
            {
                q: searchTerm,
                category: selectedCategory,
                series: selectedSeries,
                brand: selectedBrand,
                page: nextPage,
            },
            {
                preserveState: true,
                preserveScroll: true,
                only: ['products'],
                onFinish: () => setIsLoadingMore(false),
            },
        );
    }, [
        isLoadingMore,
        hasMore,
        currentPage,
        searchTerm,
        selectedCategory,
        selectedSeries,
        selectedBrand,
    ]);

    // IntersectionObserver for automatic lazy loading when scrolling
    useEffect(() => {
        if (!hasMore || isLoadingMore) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    loadMoreProducts();
                }
            },
            { rootMargin: '300px' },
        );

        const currentRef = loadMoreSentinelRef.current;
        if (currentRef) {
            observer.observe(currentRef);
        }

        return () => {
            if (currentRef) observer.unobserve(currentRef);
        };
    }, [hasMore, isLoadingMore, loadMoreProducts]);

    const handleSearchChange = (val: string) => {
        setSearchTerm(val);
        if (searchDebounceRef.current) {
            clearTimeout(searchDebounceRef.current);
        }
        searchDebounceRef.current = setTimeout(() => {
            applyFilters({ q: val });
        }, 350);
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchDebounceRef.current) {
            clearTimeout(searchDebounceRef.current);
        }
        applyFilters({ q: searchTerm });
    };

    const applyFilters = (newFilters: Partial<typeof filters>) => {
        router.get(
            '/shop',
            {
                q: newFilters.q !== undefined ? newFilters.q : searchTerm,
                category:
                    newFilters.category !== undefined
                        ? newFilters.category
                        : selectedCategory,
                series:
                    newFilters.series !== undefined
                        ? newFilters.series
                        : selectedSeries,
                brand:
                    newFilters.brand !== undefined
                        ? newFilters.brand
                        : selectedBrand,
            },
            {
                preserveState: true,
                preserveScroll: true,
                onSuccess: () => {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                },
            },
        );
    };

    return (
        <PublicLayout title="Katalog Alat Kopi">
            {/* Header Banner */}
            <div className="border-b border-brand-900 bg-brand-950 px-4 py-12 text-white sm:px-6 lg:px-8">
                <div className="mx-auto max-w-7xl space-y-3">
                    <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
                        Katalog{' '}
                        <span className="font-serif-italic font-normal text-accent-copper italic">
                            Alat Kopi
                        </span>
                    </h1>
                    <p className="max-w-2xl text-xs text-brand-300 sm:text-sm">
                        Eksplorasi seluruh koleksi alat seduh manual, grinder,
                        mesin espresso, kettle, timbangan digital, hingga
                        aksesori barista pilihan.
                    </p>
                </div>
            </div>

            <div className="mx-auto max-w-7xl space-y-4 px-2 py-4 sm:space-y-6 sm:px-6 sm:py-8 lg:px-8">
                {/* Filter Bar Sentinel & Fixed-on-Scroll Wrapper (zero-jitter on mobile) */}
                <div ref={filterSentinelRef} className="h-px w-full" aria-hidden="true" />
                {isFilterPinned && filterBarHeight > 0 && (
                    <div style={{ height: filterBarHeight }} aria-hidden="true" />
                )}
                <div
                    ref={filterBarRef}
                    className={
                        isFilterPinned
                            ? 'fixed inset-x-0 top-[73px] z-30 mx-auto max-w-7xl px-2 sm:px-6 lg:px-8 transform-gpu'
                            : ''
                    }
                >
                <div className={`space-y-3 rounded-xl border border-sand-200/80 bg-white p-3 sm:space-y-4 sm:rounded-2xl sm:p-4 ${isFilterPinned ? 'shadow-md' : 'shadow-xs'}`}>
                    {/* Top Row: Brand Filter */}
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex flex-shrink-0 items-center gap-2">
                            <span className="text-xs font-medium text-brand-500">
                                Filter Brand:
                            </span>
                            <Select
                                value={selectedBrand || 'all'}
                                onValueChange={(val: string) => {
                                    const nextBrand = val === 'all' ? '' : val;
                                    setSelectedBrand(nextBrand);
                                    applyFilters({ brand: nextBrand });
                                }}
                            >
                                <SelectTrigger className="h-auto min-w-[180px] cursor-pointer rounded-full border border-sand-200 bg-cream-50 px-3.5 py-2 text-xs font-semibold text-brand-900 shadow-xs focus:border-brand-700 focus:outline-hidden">
                                    <SelectValue placeholder="Semua Brand" />
                                </SelectTrigger>
                                <SelectContent className="z-50 rounded-xl border border-sand-200 bg-white shadow-lg">
                                    <SelectItem
                                        value="all"
                                        className="cursor-pointer py-1.5 text-xs font-medium"
                                    >
                                        Semua Brand
                                    </SelectItem>
                                    {brands.map((brandName) => (
                                        <SelectItem
                                            key={brandName}
                                            value={brandName}
                                            className="cursor-pointer py-1.5 text-xs font-medium"
                                        >
                                            {brandName}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Filter Pills from Admin Dashboard Categories with Navigation Arrows */}
                    <div className="relative">
                        {/* Left Scroll Arrow (Desktop only, hidden on mobile) */}
                        {canScrollLeft && (
                            <div className="pointer-events-none absolute top-0 bottom-0 left-0 z-10 hidden items-center bg-gradient-to-r from-white via-white/95 to-transparent pr-3 pl-0.5 sm:flex">
                                <button
                                    type="button"
                                    onClick={() => scrollPills('left')}
                                    aria-label="Geser kategori ke kiri"
                                    className="hover:bg-sand-50 pointer-events-auto flex h-7 w-7 cursor-pointer items-center justify-center rounded-full border border-sand-200/90 bg-white text-brand-800 shadow-md transition-all active:scale-95 sm:h-8 sm:w-8"
                                >
                                    <ChevronLeft className="h-4 w-4 sm:h-4.5 sm:w-4.5" />
                                </button>
                            </div>
                        )}

                        <div
                            ref={pillsContainerRef}
                            onScroll={checkPillsScroll}
                            className="no-scrollbar flex [scrollbar-width:none] items-center gap-2 overflow-x-auto scroll-smooth pt-1 [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
                            style={{
                                scrollbarWidth: 'none',
                                msOverflowStyle: 'none',
                            }}
                        >
                            {/* All Products */}
                            <button
                                type="button"
                                onClick={() => {
                                    setSelectedCategory('');
                                    setSelectedSeries('');
                                    applyFilters({ category: '', series: '' });
                                }}
                                className={`flex-shrink-0 cursor-pointer rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all ${
                                    !selectedCategory && !selectedSeries
                                        ? 'bg-brand-700 text-white shadow-xs'
                                        : 'border border-sand-200/80 bg-cream-100/80 text-brand-700 hover:bg-cream-100'
                                }`}
                            >
                                Semua Alat Kopi
                            </button>

                            {/* Paket Bundling Custom */}
                            <button
                                type="button"
                                onClick={() => {
                                    setSelectedCategory('paket-bundling');
                                    setSelectedSeries('');
                                    applyFilters({
                                        category: 'paket-bundling',
                                        series: '',
                                    });
                                }}
                                className={`flex-shrink-0 cursor-pointer rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all ${
                                    selectedCategory === 'paket-bundling' ||
                                    selectedSeries === 'paket-bundling'
                                        ? 'bg-accent-copper text-white shadow-xs'
                                        : 'border border-amber-300/80 bg-amber-50/90 text-amber-900 hover:bg-amber-100'
                                }`}
                            >
                                Paket Bundling
                            </button>

                            {/* Dynamic Categories from Admin Dashboard */}
                            {categories.map((cat) => {
                                const catName =
                                    typeof cat.name === 'string'
                                        ? cat.name
                                        : cat.name?.id ||
                                          cat.name?.en ||
                                          Object.values(cat.name || {})[0] ||
                                          cat.slug;
                                const isActive =
                                    selectedCategory === cat.slug ||
                                    (!selectedCategory &&
                                        selectedSeries === cat.slug);

                                return (
                                    <button
                                        key={cat.id}
                                        type="button"
                                        onClick={() => {
                                            setSelectedCategory(cat.slug);
                                            setSelectedSeries('');
                                            applyFilters({
                                                category: cat.slug,
                                                series: '',
                                            });
                                        }}
                                        className={`flex-shrink-0 cursor-pointer rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all ${
                                            isActive
                                                ? 'bg-brand-700 text-white shadow-xs'
                                                : 'border border-sand-200/80 bg-cream-100/80 text-brand-700 hover:bg-cream-100'
                                        }`}
                                    >
                                        {catName}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Right Scroll Arrow (Desktop only, hidden on mobile) */}
                        {canScrollRight && (
                            <div className="pointer-events-none absolute top-0 right-0 bottom-0 z-10 hidden items-center bg-gradient-to-l from-white via-white/95 to-transparent pr-0.5 pl-3 sm:flex">
                                <button
                                    type="button"
                                    onClick={() => scrollPills('right')}
                                    aria-label="Geser kategori ke kanan"
                                    className="hover:bg-sand-50 pointer-events-auto flex h-7 w-7 cursor-pointer items-center justify-center rounded-full border border-sand-200/90 bg-white text-brand-800 shadow-md transition-all active:scale-95 sm:h-8 sm:w-8"
                                >
                                    <ChevronRight className="h-4 w-4 sm:h-4.5 sm:w-4.5" />
                                </button>
                            </div>
                        )}
                    </div>
                </div>
                </div>

                {/* Result Status */}
                <div className="flex items-center justify-between px-1 text-xs text-brand-500">
                    <span>
                        Menampilkan{' '}
                        <strong className="text-brand-900">
                            {products.data.length}
                        </strong>{' '}
                        dari{' '}
                        <strong className="text-brand-900">
                            {products.total}
                        </strong>{' '}
                        produk
                    </span>
                    {(filters.q ||
                        filters.series ||
                        filters.category ||
                        filters.brand) && (
                        <button
                            type="button"
                            onClick={() => {
                                setSearchTerm('');
                                setSelectedSeries('');
                                setSelectedCategory('');
                                setSelectedBrand('');
                                router.get('/shop');
                            }}
                            className="font-semibold text-accent-copper hover:underline"
                        >
                            Reset Filter
                        </button>
                    )}
                </div>

                {/* Products Grid */}
                {allProducts.length === 0 ? (
                    <div className="space-y-3 rounded-2xl border border-sand-200 bg-white p-12 text-center">
                        <p className="text-base font-bold text-brand-900">
                            Tidak ada produk yang cocok dengan pencarian Anda
                        </p>
                        <p className="mx-auto max-w-sm text-xs text-brand-500">
                            Coba ubah kata kunci pencarian atau reset filter
                            untuk melihat seluruh koleksi alat kopi kami.
                        </p>
                        <button
                            type="button"
                            onClick={() => {
                                setSearchTerm('');
                                setSelectedSeries('');
                                setSelectedCategory('');
                                setSelectedBrand('');
                                router.get('/shop');
                            }}
                            className="cursor-pointer rounded-full bg-brand-700 px-5 py-2.5 text-xs font-semibold text-white"
                        >
                            Tampilkan Semua Produk
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-6 lg:grid-cols-4">
                            {allProducts.map((product) => (
                                <ProductCard
                                    key={product.id}
                                    product={product}
                                />
                            ))}

                            {/* Lazy load skeleton placeholder cards */}
                            {isLoadingMore && (
                                <>
                                    {[1, 2, 3, 4].map((i) => (
                                        <div
                                            key={`lazy-skeleton-${i}`}
                                            className="animate-pulse space-y-3 rounded-2xl border border-sand-200/60 bg-white p-4 sm:p-5"
                                        >
                                            <div className="flex aspect-square w-full items-center justify-center rounded-xl bg-sand-200/50 p-4">
                                                <img
                                                    src="/images/lazy-load-kettle.png"
                                                    alt="Memuat alat kopi..."
                                                    className="h-24 w-24 animate-pulse object-contain opacity-85 sm:h-32 sm:w-32"
                                                />
                                            </div>
                                            <div className="h-4 w-2/3 rounded bg-sand-200/60" />
                                            <div className="h-5 w-full rounded bg-sand-200/70" />
                                            <div className="h-4 w-1/2 rounded bg-sand-200/40" />
                                        </div>
                                    ))}
                                </>
                            )}
                        </div>

                        {/* Lazy load intersection sentinel */}
                        <div ref={loadMoreSentinelRef} className="h-4" />

                        {/* Lazy load button & status */}
                        {hasMore ? (
                            <div className="flex flex-col items-center justify-center gap-2.5 pt-6">
                                <button
                                    type="button"
                                    onClick={loadMoreProducts}
                                    disabled={isLoadingMore}
                                    className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-brand-900 px-6 py-3 text-xs font-bold text-white shadow-md transition-all hover:bg-brand-800 active:scale-95 disabled:opacity-60 sm:text-sm"
                                >
                                    {isLoadingMore ? (
                                        <>
                                            <Loader2 className="h-4 w-4 animate-spin text-accent-copper" />
                                            <span>Memuat Alat Kopi...</span>
                                        </>
                                    ) : (
                                        <span>Muat Lebih Banyak Alat Kopi</span>
                                    )}
                                </button>
                                <span className="text-[11px] font-medium text-brand-600">
                                    Menampilkan {allProducts.length} dari{' '}
                                    {products.total} alat kopi
                                </span>
                            </div>
                        ) : (
                            <div className="pt-8 text-center text-xs font-medium text-brand-500">
                                Seluruh alat kopi ({allProducts.length}) telah
                                ditampilkan
                            </div>
                        )}
                    </>
                )}
            </div>
        </PublicLayout>
    );
}
