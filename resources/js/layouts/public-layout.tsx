import React, { useEffect, useRef, useState } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { AnimatePresence, motion } from 'motion/react';
import { SlidingNumber } from '@animate-ui/react/primitives/texts/sliding-number';
import {
    Bell,
    BookOpen,
    ChevronDown,
    ChevronRight,
    Compass,
    Grid,
    Home,
    LayoutGrid,
    MapPin,
    Menu,
    MessageCircle,
    Phone,
    Search,
    ShoppingBag,
    User,
    X,
} from 'lucide-react';
import type { SanubariSharedProps } from '@/types/sanubari';
import { CartProvider, useCart } from '@/context/cart-context';

const CartDrawer = React.lazy(() =>
    import('@/components/cart-drawer').then((m) => ({ default: m.CartDrawer })),
);
const SearchModal = React.lazy(() =>
    import('@/components/search-modal').then((m) => ({
        default: m.SearchModal,
    })),
);
const NotificationModal = React.lazy(() =>
    import('@/components/notification-modal').then((m) => ({
        default: m.NotificationModal,
    })),
);
const DesktopMegaMenu = React.lazy(() =>
    import('@/components/desktop-mega-menu').then((m) => ({
        default: m.DesktopMegaMenu,
    })),
);

interface PublicLayoutProps {
    title?: string;
    children: React.ReactNode;
}

function InstagramIcon({ className = 'w-5 h-5' }: { className?: string }) {
    return (
        <svg
            className={className}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
            <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
        </svg>
    );
}

function FacebookIcon({ className = 'w-5 h-5' }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
    );
}

function XSocialIcon({ className = 'w-5 h-5' }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
    );
}

function TikTokIcon({ className = 'w-5 h-5' }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor">
            <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.298-.002.595.042.88.13V9.4a6.33 6.33 0 0 0-1-.08A6.34 6.34 0 0 0 3 15.66a6.34 6.34 0 0 0 10.86 4.43c.12-.12.23-.25.33-.38V12a8.27 8.27 0 0 0 5.4 2.05v-3.45a4.83 4.83 0 0 1-3.77-3.91z" />
        </svg>
    );
}

function YouTubeIcon({ className = 'w-5 h-5' }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor">
            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
        </svg>
    );
}

const resolveImageUrl = (img?: string | null) => {
    if (!img) return null;
    if (img.startsWith('http://') || img.startsWith('https://')) return img;
    const clean = img.replace(/^\/?(public\/|storage\/)?/, '');
    return `/storage/${clean}`;
};

export const PublicLayout: React.FC<PublicLayoutProps> = ({
    title,
    children,
}) => {
    const { props, url } = usePage<SanubariSharedProps>();
    const { settings, locale = 'id', navCategories = [], auth } = props;
    const { itemCount, setIsCartOpen, isCartOpen } = useCart();

    const accountHref = auth?.user ? '/akun' : '/login';
    const isAccountActive =
        url.startsWith('/akun') ||
        url.startsWith('/account') ||
        url.startsWith('/dashboard') ||
        url.startsWith('/login') ||
        url.startsWith('/register') ||
        url.startsWith('/settings');

    const isHomeActive = url === '/' || url === '/en';
    const isCategoryActive =
        url.startsWith('/kategori') ||
        url.startsWith('/categories') ||
        url.startsWith('/shop');
    const isJournalActive =
        url.startsWith('/blog') ||
        url.startsWith('/en/blog') ||
        url.startsWith('/panduan-seduh') ||
        url.startsWith('/en/brew-guide');
    const isCartActive =
        isCartOpen || url.startsWith('/keranjang') || url.startsWith('/cart');

    const [isScrolled, setIsScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);
    const [announcementVisible, setAnnouncementVisible] = useState(true);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [isNotificationOpen, setIsNotificationOpen] = useState(false);
    const [unreadNotificationCount, setUnreadNotificationCount] =
        useState<number>(3);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 640);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    useEffect(() => {
        try {
            const readIds: string[] = JSON.parse(
                localStorage.getItem('sanubari_read_notifications_v1') || '[]',
            );
            const totalNotifs = 5;
            const remaining = Math.max(0, totalNotifs - readIds.length);
            setUnreadNotificationCount(remaining);
        } catch {
            setUnreadNotificationCount(3);
        }
    }, [isNotificationOpen]);

    const [headerSearch, setHeaderSearch] = useState(() => {
        if (typeof window !== 'undefined') {
            const params = new URLSearchParams(window.location.search);
            return params.get('q') || '';
        }
        return '';
    });
    const headerSearchDebounceRef = useRef<NodeJS.Timeout | null>(null);

    // Sync headerSearch with url query changes
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const params = new URLSearchParams(window.location.search);
            const q = params.get('q') || '';
            setHeaderSearch(q);
        }
    }, [url]);

    const handleHeaderSearchChange = (val: string) => {
        setHeaderSearch(val);

        if (headerSearchDebounceRef.current) {
            clearTimeout(headerSearchDebounceRef.current);
        }

        const trimmed = val.trim();
        // Redirect or filter product list when typing
        headerSearchDebounceRef.current = setTimeout(() => {
            if (trimmed) {
                router.get(
                    '/shop',
                    { q: trimmed },
                    {
                        preserveState: true,
                        preserveScroll: true,
                        replace: true,
                    },
                );
            } else if (url.startsWith('/shop')) {
                router.get(
                    '/shop',
                    {},
                    {
                        preserveState: true,
                        preserveScroll: true,
                        replace: true,
                    },
                );
            }
        }, 350);
    };

    const handleHeaderSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (headerSearchDebounceRef.current) {
            clearTimeout(headerSearchDebounceRef.current);
        }
        const trimmed = headerSearch.trim();
        if (trimmed) {
            router.get(
                '/shop',
                { q: trimmed },
                {
                    preserveState: true,
                    preserveScroll: true,
                },
            );
        } else {
            router.get(
                '/shop',
                {},
                {
                    preserveState: true,
                    preserveScroll: true,
                },
            );
        }
    };

    useEffect(() => {
        setIsMegaMenuOpen(false);
        setMobileMenuOpen(false);
    }, [url]);

    const waNumber = settings?.whatsapp || '6282132095241';
    const waUrl = `https://wa.me/${waNumber}?text=${encodeURIComponent('Halo Alat Kopi Malang! Saya ingin bertanya tentang produk kopi.')}`;

    const instagramUrl =
        settings?.instagram || 'https://instagram.com/alat_kopi_malang';
    const facebookUrl =
        settings?.facebook || 'https://facebook.com/sanubariroastery';
    const xUrl =
        settings?.x_url ||
        settings?.twitter ||
        'https://x.com/sanubariroastery';
    const tiktokUrl =
        settings?.tiktok || 'https://tiktok.com/@sanubariroastery';

    // Global keyboard shortcut (Cmd+K for search, ESC for dismiss)
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                if (isMegaMenuOpen) {
                    e.preventDefault();
                    setIsMegaMenuOpen(false);
                    return;
                }
                if (isSearchOpen) {
                    e.preventDefault();
                    setIsSearchOpen(false);
                    return;
                }
            }
            if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
                e.preventDefault();
                setIsSearchOpen((prev) => !prev);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isMegaMenuOpen, isSearchOpen]);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 15);
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Body scroll locking when mobile menu drawer is open
    useEffect(() => {
        if (mobileMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [mobileMenuOpen]);

    const isEn = locale === 'en' || url.startsWith('/en');

    return (
        <div className="flex min-h-svh w-full max-w-full flex-col [overflow-x:clip] bg-cream-50 font-sans text-brand-950 antialiased selection:bg-brand-700 selection:text-white">
            <Head
                title={
                    title
                        ? `${title} — Alat Kopi Malang`
                        : 'Alat Kopi Malang — All Your Brewing Essentials in One Place'
                }
            >
                <link
                    head-key="favicon-32"
                    rel="icon"
                    type="image/png"
                    sizes="32x32"
                    href="/favicon-32x32.png?v=20261126"
                />
                <link
                    head-key="favicon-16"
                    rel="icon"
                    type="image/png"
                    sizes="16x16"
                    href="/favicon-16x16.png?v=20261126"
                />
                <link
                    head-key="favicon-48"
                    rel="icon"
                    type="image/png"
                    sizes="48x48"
                    href="/favicon-48x48.png?v=20261126"
                />
                <link
                    head-key="favicon-96"
                    rel="icon"
                    type="image/png"
                    sizes="96x96"
                    href="/favicon-96x96.png?v=20261126"
                />
                <link
                    head-key="favicon-192"
                    rel="icon"
                    type="image/png"
                    sizes="192x192"
                    href="/favicon-192x192.png?v=20261126"
                />
                <link
                    head-key="favicon-512"
                    rel="icon"
                    type="image/png"
                    sizes="512x512"
                    href="/favicon-512x512.png?v=20261126"
                />
                <link
                    head-key="favicon-svg"
                    rel="icon"
                    type="image/svg+xml"
                    href="/favicon.svg?v=20261126"
                />
                <link
                    head-key="favicon-ico"
                    rel="icon"
                    type="image/x-icon"
                    sizes="any"
                    href="/favicon.ico?v=20261126"
                />
                <link
                    head-key="shortcut-icon"
                    rel="shortcut icon"
                    href="/favicon.ico?v=20261126"
                    type="image/x-icon"
                />
                <link
                    head-key="apple-touch-icon"
                    rel="apple-touch-icon"
                    sizes="180x180"
                    href="/apple-touch-icon.png?v=20261126"
                />
                <link
                    head-key="apple-touch-icon-precomposed"
                    rel="apple-touch-icon-precomposed"
                    sizes="180x180"
                    href="/apple-touch-icon-precomposed.png?v=20261126"
                />
                <link
                    head-key="manifest"
                    rel="manifest"
                    href="/site.webmanifest?v=20261126"
                />
                <meta
                    head-key="og-image"
                    property="og:image"
                    content="/brand/logo-circle.png?v=20261126"
                />
            </Head>

            {/* Artatix Top Utility Bar (Desktop) */}
            <div className="relative z-50 hidden w-full border-b border-brand-900/60 bg-brand-950 px-4 py-2.5 text-white sm:px-6 md:block lg:px-8">
                <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
                    {/* Left: Roastery Hours */}
                    <div className="flex min-w-0 flex-1 items-center gap-2 text-xs text-brand-300">
                        <span className="h-2 w-2 flex-shrink-0 rounded-full bg-accent-copper" />
                        <span className="truncate">
                            {isEn
                                ? 'Roastery & Showroom: Daily 09.00 – 23.00 WIB'
                                : 'Roastery & Showroom: Buka Setiap Hari 09.00 – 23.00 WIB'}
                        </span>
                    </div>

                    {/* Center: Utility Navigation Links (Artatix Pattern) */}
                    <div className="flex items-center gap-6 text-xs font-semibold text-brand-200">
                        <Link
                            href="/tentang"
                            className="transition-colors hover:text-white"
                        >
                            {isEn ? 'Our Story' : 'Cerita Kami'}
                        </Link>
                        <Link
                            href="/wholesale"
                            className="transition-colors hover:text-white"
                        >
                            {isEn ? 'Wholesale B2B' : 'Kemitraan Kedai'}
                        </Link>
                        <Link
                            href="/kunjungi"
                            className="transition-colors hover:text-white"
                        >
                            {isEn ? 'Showroom Malang' : 'Showroom Malang'}
                        </Link>
                        <Link
                            href={isEn ? '/en/booking' : '/booking-tempat'}
                            className="transition-colors hover:text-white"
                        >
                            {isEn ? 'Space Booking' : 'Booking Tempat'}
                        </Link>
                        <Link
                            href={
                                isEn
                                    ? '/en/coffee-catering'
                                    : '/coffee-catering'
                            }
                            className="transition-colors hover:text-white"
                        >
                            {isEn ? 'Coffee Catering' : 'Coffee Catering'}
                        </Link>
                        <Link
                            href="/panduan-seduh"
                            className="transition-colors hover:text-white"
                        >
                            {isEn ? 'Brew Guides & FAQ' : 'Panduan & FAQ'}
                        </Link>
                    </div>

                    {/* Right: Location Link */}
                    <div className="flex flex-1 items-center justify-end">
                        <a
                            href={
                                settings?.maps_url ||
                                'https://maps.app.goo.gl/PMuxaEtsbEvC4APy7'
                            }
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs font-medium text-brand-300 transition-colors hover:text-white"
                        >
                            <MapPin className="h-3.5 w-3.5 text-accent-copper" />
                            <span>Malang, Jawa Timur</span>
                        </a>
                    </div>
                </div>
            </div>

            {/* Announcement Ticker Bar */}
            {announcementVisible &&
                settings?.announcement_enabled &&
                (settings?.announcement_text_id ||
                    settings?.announcement_text_en) && (
                    <div className="relative z-50 flex items-center justify-between bg-accent-copper px-4 py-2 text-center text-xs font-semibold text-white shadow-xs">
                        <div className="flex-1 text-center">
                            {settings?.announcement_link ? (
                                <Link
                                    href={settings.announcement_link}
                                    className="inline-flex items-center justify-center gap-1.5 hover:underline"
                                >
                                    <span>
                                        {isEn
                                            ? settings.announcement_text_en ||
                                              settings.announcement_text_id
                                            : settings.announcement_text_id}
                                    </span>
                                </Link>
                            ) : (
                                <span>
                                    {isEn
                                        ? settings.announcement_text_en ||
                                          settings.announcement_text_id
                                        : settings.announcement_text_id}
                                </span>
                            )}
                        </div>
                        <button
                            type="button"
                            onClick={() => setAnnouncementVisible(false)}
                            aria-label="Tutup Pengumuman"
                            className="cursor-pointer rounded-full p-1 text-white/80 transition-colors hover:text-white"
                        >
                            <X className="h-3.5 w-3.5" />
                        </button>
                    </div>
                )}

            {/* Navigation Header - Otten Coffee Style Desktop Mega Menu Navbar (Sanubari Theme Green) */}
            <header className="sticky top-0 z-50 border-b border-brand-800/80 bg-brand-900 font-sans text-white shadow-md transition-shadow [view-transition-name:app-header]">
                <div className="relative z-50 mx-auto flex h-[72px] max-w-7xl items-center justify-between gap-3 px-3.5 sm:gap-4 sm:px-6 lg:px-8">
                    {/* Sisi Kiri: Brand Logo & Tombol Menu Kategori */}
                    <div className="flex flex-shrink-0 items-center gap-2 sm:gap-3">
                        {/* Brand Logo & Name */}
                        <Link
                            href="/"
                            className="group flex items-center gap-2 sm:gap-2.5"
                        >
                            <img
                                src="/brand/logo-circle.png?v=20261126"
                                alt="Alat Kopi Malang Logo"
                                className="h-9 w-9 rounded-full shadow-xs transition-transform group-hover:scale-105 sm:h-10 sm:w-10"
                            />
                            <div className="flex flex-col">
                                <span className="text-sm font-extrabold tracking-tight whitespace-nowrap text-white transition-colors group-hover:text-accent-copper sm:text-base">
                                    Alat Kopi
                                </span>
                                <span className="-mt-0.5 text-[9px] font-semibold tracking-normal whitespace-nowrap text-brand-300 sm:text-[10px]">
                                    Malang
                                </span>
                            </div>
                        </Link>

                        {/* Tombol Menu "Kategori" (Desktop & Tablet) */}
                        <button
                            type="button"
                            onClick={() => setIsMegaMenuOpen((prev) => !prev)}
                            className={`hidden cursor-pointer items-center gap-2 rounded-xl border px-3.5 py-2 text-sm font-bold transition-all md:flex ${
                                isMegaMenuOpen
                                    ? 'border-accent-copper/40 bg-accent-copper text-white shadow-xs'
                                    : 'border-brand-700/60 bg-brand-800/90 text-white hover:border-brand-600 hover:bg-brand-800'
                            }`}
                            aria-expanded={isMegaMenuOpen}
                            aria-label="Kategori Produk"
                        >
                            <LayoutGrid className="h-4 w-4 stroke-[2.2] text-accent-copper" />
                            <span>{isEn ? 'Categories' : 'Kategori'}</span>
                            <ChevronDown
                                className={`h-3.5 w-3.5 text-brand-300 transition-transform duration-200 ${
                                    isMegaMenuOpen
                                        ? 'rotate-180 text-white'
                                        : ''
                                }`}
                            />
                        </button>
                    </div>

                    {/* Bagian Tengah: Search Bar Memanjang (Mobile & Desktop) */}
                    <div className="relative mx-2 max-w-xl flex-1 sm:mx-4">
                        <form
                            onSubmit={handleHeaderSearchSubmit}
                            className="relative flex w-full items-center"
                        >
                            <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-brand-300 sm:left-3.5" />
                            <input
                                type="search"
                                value={headerSearch}
                                onChange={(e) =>
                                    handleHeaderSearchChange(e.target.value)
                                }
                                placeholder={
                                    isMobile
                                        ? ''
                                        : 'Cari alat kopi...'
                                }
                                className="h-10 w-full rounded-xl border border-brand-700/70 bg-brand-800/90 pr-8 pl-9 text-[16px] text-white placeholder-transparent shadow-inner transition-colors outline-none hover:bg-brand-800 focus:border-accent-copper focus:bg-brand-800 sm:h-10.5 sm:pl-10 sm:text-sm sm:placeholder-brand-300/80"
                                aria-label="Cari alat kopi"
                            />
                            {headerSearch && (
                                <button
                                    type="button"
                                    onClick={() => handleHeaderSearchChange('')}
                                    className="absolute top-1/2 right-2.5 -translate-y-1/2 cursor-pointer p-1 text-brand-300 transition-colors hover:text-white"
                                    aria-label="Hapus kata kunci"
                                >
                                    <X className="h-3.5 w-3.5" />
                                </button>
                            )}
                        </form>
                    </div>

                    {/* Sisi Kanan: Lonceng Notifikasi, Keranjang & Akun (Desktop) */}
                    <div className="flex flex-shrink-0 items-center gap-1.5 sm:gap-2.5">
                        {/* Icon Notifikasi (Lonceng) dengan badge pesan / promo / pesanan */}
                        <button
                            type="button"
                            onClick={() => setIsNotificationOpen(true)}
                            className="relative cursor-pointer rounded-xl p-2 text-brand-200 transition-colors hover:bg-brand-800 hover:text-white"
                            aria-label="Notifikasi & Informasi Pesanan"
                            title="Pusat Notifikasi & Promo"
                        >
                            <Bell className="h-5 w-5" />
                            {unreadNotificationCount > 0 && (
                                <span className="absolute top-1 right-1 flex h-4 min-w-4 animate-pulse items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-extrabold text-white shadow-xs">
                                    {unreadNotificationCount}
                                </span>
                            )}
                        </button>

                        {/* Icon Keranjang Belanja dengan badge counter - Desktop only (Mobile ada di Bottom Nav) */}
                        <button
                            type="button"
                            onClick={() => setIsCartOpen(true)}
                            className="relative hidden cursor-pointer rounded-xl p-2 text-brand-200 transition-colors hover:bg-brand-800 hover:text-white lg:flex"
                            aria-label="Keranjang Belanja"
                            title="Keranjang Belanja"
                        >
                            <ShoppingBag className="h-5 w-5" />
                            {itemCount > 0 ? (
                                <span className="absolute top-1 right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-extrabold text-white shadow-xs">
                                    {itemCount > 99 ? '99+' : itemCount}
                                </span>
                            ) : (
                                <span className="absolute top-1 right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-extrabold text-white shadow-xs">
                                    2
                                </span>
                            )}
                        </button>

                        {/* Masuk / Akun CTA Button */}
                        <Link
                            href={accountHref}
                            className="hidden h-9 items-center justify-center gap-1.5 rounded-xl border border-brand-700/60 bg-brand-800 px-3.5 text-xs font-bold text-white shadow-xs transition-all hover:bg-brand-700 active:scale-95 md:inline-flex"
                        >
                            <User className="h-3.5 w-3.5 text-brand-300" />
                            <span>
                                {auth?.user
                                    ? auth.user.name?.split(' ')[0] ||
                                      (isEn ? 'Account' : 'Akun')
                                    : isEn
                                      ? 'Sign In'
                                      : 'Masuk'}
                            </span>
                        </Link>
                    </div>
                </div>

                {/* Mobile Drawer Navigation (Organized by 3 Root Categories) */}
                <AnimatePresence>
                    {mobileMenuOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{
                                duration: 0.2,
                                ease: [0.16, 1, 0.3, 1],
                            }}
                            className="fixed inset-x-0 top-[72px] bottom-0 z-50 overflow-y-auto border-t border-brand-800 bg-white p-6 text-brand-950 lg:hidden"
                        >
                            <div className="space-y-6 pb-20">
                                <div className="flex items-center justify-between border-b border-sand-200 pb-3">
                                    <span className="text-sm font-bold text-accent-copper">
                                        Menu Navigasi Sanubari
                                    </span>
                                </div>

                                {/* Section 1: Katalog Kopi */}
                                <div className="space-y-2">
                                    <span className="block text-xs font-extrabold tracking-wider text-brand-600 uppercase">
                                        1.{' '}
                                        {isEn
                                            ? 'Coffee Catalog'
                                            : 'Katalog Kopi'}
                                    </span>
                                    <div className="space-y-1 pl-2">
                                        <Link
                                            href="/shop"
                                            onClick={() =>
                                                setMobileMenuOpen(false)
                                            }
                                            className="block py-1.5 text-base font-bold text-brand-950"
                                        >
                                            {isEn
                                                ? 'All Coffees'
                                                : 'Semua Katalog Kopi'}
                                        </Link>
                                        <Link
                                            href="/shop?series=kawi"
                                            onClick={() =>
                                                setMobileMenuOpen(false)
                                            }
                                            className="block py-1 text-sm font-medium text-brand-800"
                                        >
                                            Koleksi Gunung Kawi
                                        </Link>
                                        <Link
                                            href="/shop?category=filter-beans"
                                            onClick={() =>
                                                setMobileMenuOpen(false)
                                            }
                                            className="block py-1 text-sm font-medium text-brand-800"
                                        >
                                            Filter Beans (Classic &
                                            Experimental)
                                        </Link>
                                        <Link
                                            href="/shop?category=espresso-beans"
                                            onClick={() =>
                                                setMobileMenuOpen(false)
                                            }
                                            className="block py-1 text-sm font-medium text-brand-800"
                                        >
                                            Espresso Beans & Houseblend
                                        </Link>
                                    </div>
                                </div>

                                {/* Section 2: Kemitraan & Bisnis */}
                                <div className="space-y-2">
                                    <span className="block text-xs font-extrabold tracking-wider text-brand-600 uppercase">
                                        2.{' '}
                                        {isEn
                                            ? 'Partnership & B2B'
                                            : 'Kemitraan & Bisnis'}
                                    </span>
                                    <div className="space-y-1 pl-2">
                                        <Link
                                            href="/wholesale"
                                            onClick={() =>
                                                setMobileMenuOpen(false)
                                            }
                                            className="block py-1.5 text-base font-bold text-brand-950"
                                        >
                                            Wholesale Biji Kopi Grosir
                                        </Link>
                                        <Link
                                            href="/wholesale"
                                            onClick={() =>
                                                setMobileMenuOpen(false)
                                            }
                                            className="block py-1 text-sm font-medium text-brand-800"
                                        >
                                            Minta Sample Tester Kedai (Gratis)
                                        </Link>
                                        <Link
                                            href="/kunjungi"
                                            onClick={() =>
                                                setMobileMenuOpen(false)
                                            }
                                            className="block py-1 text-sm font-medium text-brand-800"
                                        >
                                            Showroom Mesin Alat Kopi Malang
                                        </Link>
                                        <Link
                                            href="/booking-tempat"
                                            onClick={() =>
                                                setMobileMenuOpen(false)
                                            }
                                            className="block py-1 text-sm font-bold text-accent-copper"
                                        >
                                            Booking Tempat Acara (50+ Orang)
                                        </Link>
                                        <Link
                                            href="/coffee-catering"
                                            onClick={() =>
                                                setMobileMenuOpen(false)
                                            }
                                            className="block py-1 text-sm font-bold text-accent-copper"
                                        >
                                            Coffee Catering (Min. 200 Cup)
                                        </Link>
                                    </div>
                                </div>

                                {/* Section 3: Cerita & Panduan */}
                                <div className="space-y-2">
                                    <span className="block text-xs font-extrabold tracking-wider text-brand-600 uppercase">
                                        3.{' '}
                                        {isEn
                                            ? 'Story & Brew Guides'
                                            : 'Cerita & Panduan'}
                                    </span>
                                    <div className="space-y-1 pl-2">
                                        <Link
                                            href="/panduan-seduh"
                                            onClick={() =>
                                                setMobileMenuOpen(false)
                                            }
                                            className="block py-1.5 text-base font-bold text-brand-950"
                                        >
                                            Panduan Resep Seduh (V60, Espresso,
                                            Cold Brew)
                                        </Link>
                                        <Link
                                            href="/tentang"
                                            onClick={() =>
                                                setMobileMenuOpen(false)
                                            }
                                            className="block py-1 text-sm font-medium text-brand-800"
                                        >
                                            Tentang Alat Kopi Malang
                                        </Link>
                                        <Link
                                            href="/blog"
                                            onClick={() =>
                                                setMobileMenuOpen(false)
                                            }
                                            className="block py-1 text-sm font-medium text-brand-800"
                                        >
                                            Jejak Rasa Journal
                                        </Link>
                                        <Link
                                            href="/kunjungi"
                                            onClick={() =>
                                                setMobileMenuOpen(false)
                                            }
                                            className="block py-1 text-sm font-medium text-brand-800"
                                        >
                                            Kunjungi Roastery Malang
                                        </Link>
                                    </div>
                                </div>

                                <div className="border-t border-sand-200 pt-2">
                                    <Link
                                        href={accountHref}
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-900 py-2.5 text-sm font-bold text-white transition-colors hover:bg-brand-800"
                                    >
                                        <User className="h-4 w-4" />
                                        <span>
                                            {auth?.user
                                                ? isEn
                                                    ? 'My Account (Profile)'
                                                    : 'Akun Saya (Profil)'
                                                : isEn
                                                  ? 'Sign In / Register'
                                                  : 'Masuk / Daftar Akun'}
                                        </span>
                                    </Link>
                                </div>

                                <div className="pt-2">
                                    <a
                                        href={waUrl}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#128C7E] py-3 text-sm font-bold text-white transition-colors hover:bg-[#075E54]"
                                    >
                                        <MessageCircle className="h-4 w-4 fill-white" />
                                        <span>Konsultasi via WhatsApp</span>
                                    </a>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Desktop & Tablet Mega Menu Dropdown */}
                {isMegaMenuOpen && (
                    <React.Suspense fallback={null}>
                        <DesktopMegaMenu
                            isOpen={isMegaMenuOpen}
                            onClose={() => setIsMegaMenuOpen(false)}
                            categories={props.desktopMegaMenuCategories}
                        />
                    </React.Suspense>
                )}
            </header>

            {/* Main Content Body */}
            <main className="w-full max-w-full flex-1 overflow-x-hidden pb-24 md:pb-0">
                {children}
            </main>

            {/* Cart Drawer - Lazy Loaded on Demand */}
            {isCartOpen && (
                <React.Suspense fallback={null}>
                    <CartDrawer />
                </React.Suspense>
            )}

            {/* Instant Search Modal - Lazy Loaded on Demand */}
            {isSearchOpen && (
                <React.Suspense fallback={null}>
                    <SearchModal
                        isOpen={isSearchOpen}
                        onClose={() => setIsSearchOpen(false)}
                    />
                </React.Suspense>
            )}

            {/* Notification Center Modal - Lazy Loaded on Demand */}
            {isNotificationOpen && (
                <React.Suspense fallback={null}>
                    <NotificationModal
                        isOpen={isNotificationOpen}
                        onClose={() => setIsNotificationOpen(false)}
                        announcementText={settings?.announcement_text_id}
                        announcementLink={settings?.announcement_link}
                    />
                </React.Suspense>
            )}

            {/* Floating WhatsApp Action Button (Desktop & Tablet only, Mobile uses Bottom Nav) */}
            <a
                href={waUrl}
                target="_blank"
                rel="noreferrer"
                className="group fixed right-8 bottom-8 z-30 hidden items-center gap-2 rounded-full bg-[#0f766e] px-5 py-3 text-white shadow-lg transition-colors hover:bg-[#115e59] active:scale-95 md:flex"
                aria-label="Chat WhatsApp Sanubari"
            >
                <MessageCircle className="h-5 w-5 fill-white" />
                <span className="hidden text-sm font-semibold md:inline">
                    Tanya Roaster
                </span>
            </a>

            {/* Fixed Mobile Bottom Navigation Bar (Screens < 768px) */}
            {!isCartOpen && (
                <nav
                    aria-label="Navigasi Bawah"
                    className="fixed inset-x-0 bottom-0 z-40 border-t border-sand-200/90 bg-white/95 px-3 py-2.5 pb-[max(0.6rem,env(safe-area-inset-bottom))] font-sans shadow-[0_-4px_20px_rgba(18,30,33,0.06)] backdrop-blur-md md:hidden"
                >
                    <div className="mx-auto grid max-w-md grid-cols-4 items-center">
                        {/* 1. Home */}
                        <Link
                            href={isEn ? '/en' : '/'}
                            className={`flex flex-col items-center justify-center py-1 transition-all duration-150 active:scale-95 ${
                                isHomeActive
                                    ? 'font-bold text-accent-copper'
                                    : 'font-medium text-brand-600/70 hover:text-brand-950'
                            }`}
                        >
                            <Home
                                className={`mb-1.5 h-6 w-6 ${isHomeActive ? 'stroke-[2.2]' : 'stroke-[1.8]'}`}
                            />
                            <span className="text-[11.5px] leading-none font-semibold tracking-tight">
                                {isEn ? 'Home' : 'Home'}
                            </span>
                        </Link>

                        {/* 2. Kategori */}
                        <Link
                            href={isEn ? '/en/categories' : '/kategori'}
                            className={`flex flex-col items-center justify-center py-1 transition-all duration-150 active:scale-95 ${
                                isCategoryActive
                                    ? 'font-bold text-accent-copper'
                                    : 'font-medium text-brand-600/70 hover:text-brand-950'
                            }`}
                        >
                            <div className="relative">
                                <LayoutGrid
                                    className={`mb-1.5 h-6 w-6 ${isCategoryActive ? 'stroke-[2.2]' : 'stroke-[1.8]'}`}
                                />
                            </div>
                            <span className="text-[11.5px] leading-none font-semibold tracking-tight">
                                {isEn ? 'Categories' : 'Kategori'}
                            </span>
                        </Link>

                        {/* 3. Keranjang */}
                        <button
                            type="button"
                            onClick={() => setIsCartOpen(true)}
                            className={`relative flex cursor-pointer flex-col items-center justify-center py-1 transition-all duration-150 active:scale-95 ${
                                isCartActive
                                    ? 'font-bold text-accent-copper'
                                    : 'font-medium text-brand-600/70 hover:text-brand-950'
                            }`}
                            aria-label={isEn ? 'View Cart' : 'Lihat Keranjang'}
                        >
                            <div className="relative">
                                <ShoppingBag
                                    className={`mb-1.5 h-6 w-6 ${isCartActive ? 'stroke-[2.2]' : 'stroke-[1.8]'}`}
                                />
                                {itemCount > 0 && (
                                    <span className="absolute -top-1.5 -right-2.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full border-2 border-white bg-accent-copper px-1 text-[10px] font-black text-white shadow-xs">
                                        {itemCount > 99 ? '99+' : itemCount}
                                    </span>
                                )}
                            </div>
                            <span className="text-[11.5px] leading-none font-semibold tracking-tight">
                                {isEn ? 'Cart' : 'Keranjang'}
                            </span>
                        </button>

                        {/* 4. Akun */}
                        <Link
                            href={accountHref}
                            className={`flex flex-col items-center justify-center py-1 transition-all duration-150 active:scale-95 ${
                                isAccountActive
                                    ? 'font-bold text-accent-copper'
                                    : 'font-medium text-brand-600/70 hover:text-brand-950'
                            }`}
                        >
                            <User
                                className={`mb-1.5 h-6 w-6 ${isAccountActive ? 'stroke-[2.2]' : 'stroke-[1.8]'}`}
                            />
                            <span className="text-[11.5px] leading-none font-semibold tracking-tight">
                                {auth?.user
                                    ? auth.user.name?.split(' ')[0] ||
                                      (isEn ? 'Account' : 'Akun')
                                    : isEn
                                      ? 'Account'
                                      : 'Akun'}
                            </span>
                        </Link>
                    </div>
                </nav>
            )}

            {/* Desktop NiR Coffee 4-Column Footer (Configurable via Admin Dashboard) */}
            {(() => {
                const footerSettings = (props.footerSettings ||
                    (settings as any)?.footer_settings ||
                    {}) as Record<string, any>;

                const defaultCol2Links = [
                    {
                        label: isEn ? 'About Us' : 'Tentang Kami',
                        url: isEn ? '/en/about' : '/tentang',
                        is_external: false,
                        is_active: true,
                    },
                    {
                        label: isEn
                            ? 'Wholesale Partnership'
                            : 'Kemitraan Kedai',
                        url: isEn ? '/en/wholesale' : '/wholesale',
                        is_external: false,
                        is_active: true,
                    },
                    {
                        label: isEn ? 'Sanubari Articles' : 'Artikel Sanubari',
                        url: isEn ? '/en/blog' : '/blog',
                        is_external: false,
                        is_active: true,
                    },
                    {
                        label: isEn
                            ? 'Track Order & Payment'
                            : 'Lacak Pesanan & Pembayaran',
                        url: isEn ? '/en/track-order' : '/lacak-pesanan',
                        is_external: false,
                        is_active: true,
                    },
                ];

                const defaultCol3Links = [
                    {
                        label: 'Resep & Panduan Seduh',
                        url: isEn ? '/en/brew-guide' : '/panduan-seduh',
                        is_external: false,
                        is_active: true,
                    },
                    {
                        label: 'Flash Sale Kopi Pilihan',
                        url: isEn ? '/en/flash-sale' : '/flash-sale',
                        is_external: false,
                        is_active: true,
                    },
                    {
                        label: 'Public Cupping & Workshop',
                        url: isEn ? '/en/events' : '/acara',
                        is_external: false,
                        is_active: true,
                    },
                    {
                        label: isEn
                            ? 'Space & Venue Booking'
                            : 'Booking Tempat Acara (50+ Orang)',
                        url: isEn ? '/en/booking' : '/booking-tempat',
                        is_external: false,
                        is_active: true,
                    },
                    {
                        label: isEn
                            ? 'Coffee Catering (Min. 200 Cups)'
                            : 'Coffee Catering (Min. 200 Cup)',
                        url: isEn ? '/en/coffee-catering' : '/coffee-catering',
                        is_external: false,
                        is_active: true,
                    },
                    {
                        label: 'Kunjungi Slow Bar & Roastery',
                        url: isEn ? '/en/visit' : '/kunjungi',
                        is_external: false,
                        is_active: true,
                    },
                ];

                const defaultLegalLinks = [
                    {
                        label: 'Kebijakan Privasi',
                        url: '/legal/privacy',
                        is_active: true,
                    },
                    {
                        label: 'Syarat & Ketentuan',
                        url: '/legal/terms',
                        is_active: true,
                    },
                    {
                        label: 'Kebijakan Retur',
                        url: '/legal/refund',
                        is_active: true,
                    },
                ];

                const brandTitle =
                    footerSettings.brand_title || 'Alat Kopi Malang';
                const brandTagline =
                    footerSettings.brand_tagline ||
                    'All Your Brewing Essentials in One Place';
                const brandDescription =
                    footerSettings.brand_description ||
                    'Roastery kopi artisan yang berfokus pada eksplorasi biji kopi Gunung Kawi, proses klasik, eksperimental, dan co-fermentasi presisi di Malang, Jawa Timur.';
                const brandLogoSrc = footerSettings.brand_logo
                    ? resolveImageUrl(footerSettings.brand_logo) ||
                      '/brand/logo-circle.png?v=20261126'
                    : '/brand/logo-circle.png?v=20261126';
                const showroomLabel =
                    footerSettings.showroom_label || 'Roastery & Showroom:';
                const showroomName =
                    footerSettings.showroom_name ||
                    'Sanubari x Alat Kopi Malang';
                const showroomAddress =
                    footerSettings.showroom_address ||
                    settings?.address ||
                    'Jl. Terusan Kawi No. 12, Klojen, Malang';

                const col2Title =
                    footerSettings.column_2_title || 'Alat Kopi Malang';
                const col2Links =
                    Array.isArray(footerSettings.column_2_links) &&
                    footerSettings.column_2_links.length > 0
                        ? footerSettings.column_2_links.filter(
                              (l: any) => l.is_active !== false,
                          )
                        : defaultCol2Links;

                const col3Title =
                    footerSettings.column_3_title || 'Eksplorasi & Seduh';
                const col3Links =
                    Array.isArray(footerSettings.column_3_links) &&
                    footerSettings.column_3_links.length > 0
                        ? footerSettings.column_3_links.filter(
                              (l: any) => l.is_active !== false,
                          )
                        : defaultCol3Links;

                const col4Title =
                    footerSettings.column_4_title || 'Jam Operasional & Kontak';
                const col4Hours =
                    footerSettings.hours ||
                    settings?.hours ||
                    'Buka setiap hari: 09.00 – 23.00 WIB';
                const col4Phone =
                    footerSettings.phone || settings?.phone || '+6282132095241';
                const col4Wa =
                    footerSettings.whatsapp ||
                    settings?.whatsapp ||
                    '6282132095241';
                const col4City =
                    footerSettings.city || 'Kota Malang, Jawa Timur';
                const col4WaCta =
                    footerSettings.whatsapp_cta_text || 'Pesan via WhatsApp';
                const col4WaMessage =
                    footerSettings.whatsapp_message ||
                    'Halo Alat Kopi Malang! Saya ingin bertanya tentang produk kopi.';
                const col4WaUrl = `https://wa.me/${col4Wa}?text=${encodeURIComponent(col4WaMessage)}`;

                const socialTitle =
                    footerSettings.social_title ||
                    'Dapatkan Update Seputar Kopi';
                const footerInstagram =
                    footerSettings.instagram ||
                    settings?.instagram ||
                    'https://instagram.com/alat_kopi_malang';
                const footerFacebook =
                    footerSettings.facebook ||
                    settings?.facebook ||
                    'https://facebook.com/sanubariroastery';
                const footerX =
                    footerSettings.x_url ||
                    settings?.x_url ||
                    settings?.twitter ||
                    'https://x.com/sanubariroastery';
                const footerTiktok =
                    footerSettings.tiktok ||
                    settings?.tiktok ||
                    'https://tiktok.com/@sanubariroastery';
                const footerYoutube = footerSettings.youtube || '';

                const rawCopyright =
                    footerSettings.copyright_text ||
                    '© {year} Alat Kopi Malang. Hak Cipta Dilindungi.';
                const copyrightText = rawCopyright.replace(
                    '{year}',
                    String(new Date().getFullYear()),
                );
                const legalLinks =
                    Array.isArray(footerSettings.legal_links) &&
                    footerSettings.legal_links.length > 0
                        ? footerSettings.legal_links.filter(
                              (l: any) => l.is_active !== false,
                          )
                        : defaultLegalLinks;

                const renderLink = (linkItem: any, idx: number) => {
                    const isExternal = Boolean(
                        linkItem.is_external ||
                        linkItem.url?.startsWith('http://') ||
                        linkItem.url?.startsWith('https://'),
                    );
                    if (isExternal) {
                        return (
                            <li key={idx}>
                                <a
                                    href={linkItem.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="transition-colors hover:text-white"
                                >
                                    {linkItem.label}
                                </a>
                            </li>
                        );
                    }
                    return (
                        <li key={idx}>
                            <Link
                                href={linkItem.url}
                                className="transition-colors hover:text-white"
                            >
                                {linkItem.label}
                            </Link>
                        </li>
                    );
                };

                return (
                    <footer className="mt-auto bg-brand-950 pt-10 pb-24 text-white sm:pt-20 md:pb-16">
                        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                            <div className="grid grid-cols-1 gap-12 pb-16 md:grid-cols-2 lg:grid-cols-4">
                                {/* Col 1: Brand Info */}
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <img
                                            src={brandLogoSrc}
                                            alt={brandTitle}
                                            className="h-12 w-12 rounded-full object-cover"
                                        />
                                        <div>
                                            <h3 className="text-base font-extrabold tracking-wide text-white uppercase">
                                                {brandTitle}
                                            </h3>
                                            {brandTagline && (
                                                <p className="text-sm font-medium text-sand-200">
                                                    {brandTagline}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    <p className="text-sm leading-relaxed whitespace-pre-line text-brand-200">
                                        {brandDescription}
                                    </p>
                                    {(showroomName || showroomAddress) && (
                                        <div className="pt-2">
                                            {showroomLabel && (
                                                <span className="mb-1 block text-sm font-semibold text-white">
                                                    {showroomLabel}
                                                </span>
                                            )}
                                            <p className="text-sm leading-relaxed text-brand-200">
                                                {showroomName && (
                                                    <>
                                                        {showroomName}
                                                        <br />
                                                    </>
                                                )}
                                                {showroomAddress}
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* Col 2: Alat Kopi Malang Links */}
                                <div className="space-y-3">
                                    <h4 className="text-sm font-bold text-white">
                                        {col2Title}
                                    </h4>
                                    <ul className="space-y-2.5 text-sm text-brand-200">
                                        {col2Links.map(
                                            (link: any, idx: number) =>
                                                renderLink(link, idx),
                                        )}
                                    </ul>
                                </div>

                                {/* Col 3: Edukasi & Layanan Links */}
                                <div className="space-y-3">
                                    <h4 className="text-sm font-bold text-white">
                                        {col3Title}
                                    </h4>
                                    <ul className="space-y-2.5 text-sm text-brand-200">
                                        {col3Links.map(
                                            (link: any, idx: number) =>
                                                renderLink(link, idx),
                                        )}
                                    </ul>
                                </div>

                                {/* Col 4: Jam Buka & Hubungi Kami */}
                                <div className="space-y-3">
                                    <h4 className="text-sm font-bold text-white">
                                        {col4Title}
                                    </h4>
                                    {col4Hours && (
                                        <p className="text-sm text-brand-200">
                                            {col4Hours}
                                        </p>
                                    )}
                                    <div className="space-y-2 pt-2">
                                        {col4Phone && (
                                            <a
                                                href={`tel:${col4Phone}`}
                                                className="inline-flex items-center gap-2 text-sm text-brand-200 transition-colors hover:text-white"
                                            >
                                                <Phone className="h-4 w-4 text-accent-copper" />
                                                <span>{col4Phone}</span>
                                            </a>
                                        )}
                                        {col4City && (
                                            <div className="flex items-center gap-2 text-sm text-brand-200">
                                                <MapPin className="h-4 w-4 text-accent-copper" />
                                                <span>{col4City}</span>
                                            </div>
                                        )}
                                    </div>
                                    {col4Wa && (
                                        <div className="pt-3">
                                            <a
                                                href={col4WaUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-brand-700 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-600"
                                            >
                                                <MessageCircle className="h-4 w-4" />
                                                <span>{col4WaCta}</span>
                                            </a>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Social Media Section: Dapatkan Update Seputar Kopi */}
                            <div className="flex flex-col items-center justify-between gap-4 border-t border-brand-800/80 pt-8 pb-8 sm:flex-row">
                                <div className="text-center sm:text-left">
                                    <h4 className="text-sm font-bold tracking-wide text-white sm:text-base">
                                        {socialTitle}
                                    </h4>
                                </div>
                                <div className="flex items-center gap-3">
                                    {/* Instagram */}
                                    {footerInstagram && (
                                        <a
                                            href={footerInstagram}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            aria-label="Instagram Alat Kopi Malang"
                                            title="Instagram Alat Kopi Malang"
                                            className="flex h-10 w-10 items-center justify-center rounded-full border border-brand-800 bg-brand-900/90 text-sand-200 shadow-xs transition-all duration-300 hover:scale-110 hover:border-transparent hover:bg-gradient-to-tr hover:from-[#f09433] hover:via-[#dc2743] hover:to-[#bc1888] hover:text-white"
                                        >
                                            <InstagramIcon className="h-5 w-5" />
                                        </a>
                                    )}

                                    {/* Facebook */}
                                    {footerFacebook && (
                                        <a
                                            href={footerFacebook}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            aria-label="Facebook Alat Kopi Malang"
                                            title="Facebook Alat Kopi Malang"
                                            className="flex h-10 w-10 items-center justify-center rounded-full border border-brand-800 bg-brand-900/90 text-sand-200 shadow-xs transition-all duration-300 hover:scale-110 hover:border-transparent hover:bg-[#1877F2] hover:text-white"
                                        >
                                            <FacebookIcon className="h-5 w-5" />
                                        </a>
                                    )}

                                    {/* X (Twitter) */}
                                    {footerX && (
                                        <a
                                            href={footerX}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            aria-label="X Alat Kopi Malang"
                                            title="X (Twitter) Alat Kopi Malang"
                                            className="flex h-10 w-10 items-center justify-center rounded-full border border-brand-800 bg-brand-900/90 text-sand-200 shadow-xs transition-all duration-300 hover:scale-110 hover:border-white/30 hover:bg-black hover:text-white"
                                        >
                                            <XSocialIcon className="h-4 w-4" />
                                        </a>
                                    )}

                                    {/* TikTok */}
                                    {footerTiktok && (
                                        <a
                                            href={footerTiktok}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            aria-label="TikTok Alat Kopi Malang"
                                            title="TikTok Alat Kopi Malang"
                                            className="flex h-10 w-10 items-center justify-center rounded-full border border-brand-800 bg-brand-900/90 text-sand-200 shadow-xs transition-all duration-300 hover:scale-110 hover:border-white/30 hover:bg-black hover:text-white"
                                        >
                                            <TikTokIcon className="h-4.5 w-4.5" />
                                        </a>
                                    )}

                                    {/* YouTube */}
                                    {footerYoutube && (
                                        <a
                                            href={footerYoutube}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            aria-label="YouTube Alat Kopi Malang"
                                            title="YouTube Alat Kopi Malang"
                                            className="flex h-10 w-10 items-center justify-center rounded-full border border-brand-800 bg-brand-900/90 text-sand-200 shadow-xs transition-all duration-300 hover:scale-110 hover:border-transparent hover:bg-[#FF0000] hover:text-white"
                                        >
                                            <YouTubeIcon className="h-5 w-5" />
                                        </a>
                                    )}
                                </div>
                            </div>

                            {/* Bottom Copyright & Legal */}
                            <div className="flex flex-col items-center justify-between gap-4 pt-6 text-sm text-brand-300 sm:flex-row">
                                <p>{copyrightText}</p>
                                <div className="flex items-center gap-6 text-sm">
                                    {legalLinks.map(
                                        (link: any, idx: number) => {
                                            const isExternal = Boolean(
                                                link.is_external ||
                                                link.url?.startsWith(
                                                    'http://',
                                                ) ||
                                                link.url?.startsWith(
                                                    'https://',
                                                ),
                                            );
                                            if (isExternal) {
                                                return (
                                                    <a
                                                        key={idx}
                                                        href={link.url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="transition-colors hover:text-white"
                                                    >
                                                        {link.label}
                                                    </a>
                                                );
                                            }
                                            return (
                                                <Link
                                                    key={idx}
                                                    href={link.url}
                                                    className="transition-colors hover:text-white"
                                                >
                                                    {link.label}
                                                </Link>
                                            );
                                        },
                                    )}
                                </div>
                            </div>
                        </div>
                    </footer>
                );
            })()}
        </div>
    );
};
