import { Head, Link } from '@inertiajs/react';
import { Film, ShoppingBag, Eye, ArrowUpRight } from 'lucide-react';
import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import { dashboard } from '@/routes';

export default function Dashboard() {
    return (
        <>
            <Head title="Dashboard - Sanubari Admin" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="grid auto-rows-min gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {/* Video Reels Card */}
                    <div className="relative flex flex-col justify-between overflow-hidden rounded-2xl border border-sidebar-border bg-white p-5 shadow-xs dark:bg-neutral-900">
                        <div className="flex items-center justify-between">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-copper/15 text-accent-copper">
                                <Film className="h-5 w-5" />
                            </div>
                            <Link
                                href="/dashboard/reels"
                                className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-100 text-neutral-700 transition-colors hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
                            >
                                <ArrowUpRight className="h-4 w-4" />
                            </Link>
                        </div>
                        <div className="mt-4 space-y-1">
                            <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
                                Video Reels
                            </h3>
                            <p className="text-xs text-neutral-500 dark:text-neutral-400">
                                Kelola judul, deskripsi, video, dan thumbnail
                                reels yang tampil di Beranda.
                            </p>
                        </div>
                        <div className="mt-2 border-t border-neutral-100 pt-4 dark:border-neutral-800">
                            <Link
                                href="/dashboard/reels"
                                className="flex items-center gap-1 text-xs font-bold text-accent-copper hover:underline"
                            >
                                <span>Buka Pengaturan Reels</span>
                                <ArrowUpRight className="h-3.5 w-3.5" />
                            </Link>
                        </div>
                    </div>

                    {/* Halaman Publik Card */}
                    <div className="relative flex flex-col justify-between overflow-hidden rounded-2xl border border-sidebar-border bg-white p-5 shadow-xs dark:bg-neutral-900">
                        <div className="flex items-center justify-between">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-600">
                                <Eye className="h-5 w-5" />
                            </div>
                            <a
                                href="/"
                                target="_blank"
                                rel="noreferrer"
                                className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-100 text-neutral-700 transition-colors hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
                            >
                                <ArrowUpRight className="h-4 w-4" />
                            </a>
                        </div>
                        <div className="mt-4 space-y-1">
                            <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
                                Website Publik
                            </h3>
                            <p className="text-xs text-neutral-500 dark:text-neutral-400">
                                Kunjungi tampilan website publik Sanubari
                                Roastery Malang secara langsung.
                            </p>
                        </div>
                        <div className="mt-2 border-t border-neutral-100 pt-4 dark:border-neutral-800">
                            <a
                                href="/"
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center gap-1 text-xs font-bold text-emerald-600 hover:underline"
                            >
                                <span>Lihat Beranda Publik</span>
                                <ArrowUpRight className="h-3.5 w-3.5" />
                            </a>
                        </div>
                    </div>

                    {/* Katalog Produk Card */}
                    <div className="relative flex flex-col justify-between overflow-hidden rounded-2xl border border-sidebar-border bg-white p-5 shadow-xs dark:bg-neutral-900">
                        <div className="flex items-center justify-between">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-800/15 text-brand-800 dark:text-brand-300">
                                <ShoppingBag className="h-5 w-5" />
                            </div>
                            <a
                                href="/shop"
                                target="_blank"
                                rel="noreferrer"
                                className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-100 text-neutral-700 transition-colors hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
                            >
                                <ArrowUpRight className="h-4 w-4" />
                            </a>
                        </div>
                        <div className="mt-4 space-y-1">
                            <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
                                Katalog Biji Kopi
                            </h3>
                            <p className="text-xs text-neutral-500 dark:text-neutral-400">
                                Seluruh lini biji kopi lereng Kawi, filter
                                beans, dan espresso houseblend.
                            </p>
                        </div>
                        <div className="mt-2 border-t border-neutral-100 pt-4 dark:border-neutral-800">
                            <a
                                href="/shop"
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center gap-1 text-xs font-bold text-brand-800 hover:underline dark:text-brand-300"
                            >
                                <span>Buka Katalog Kopi</span>
                                <ArrowUpRight className="h-3.5 w-3.5" />
                            </a>
                        </div>
                    </div>
                </div>

                <div className="relative flex min-h-[50vh] flex-1 flex-col justify-between overflow-hidden rounded-2xl border border-sidebar-border/70 bg-white p-6 dark:bg-neutral-900">
                    <div className="space-y-2">
                        <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
                            Selamat Datang di Panel Admin Sanubari
                        </h2>
                        <p className="max-w-xl text-xs leading-relaxed text-neutral-500 sm:text-sm">
                            Gunakan menu di sidebar kiri atau kartu pintasan di
                            atas untuk mengelola konten website seperti Video
                            Reels (menambah, mengubah judul & deskripsi, serta
                            menghapus video).
                        </p>
                    </div>
                    <PlaceholderPattern className="pointer-events-none absolute inset-0 size-full stroke-neutral-900/10 dark:stroke-neutral-100/10" />
                </div>
            </div>
        </>
    );
}

Dashboard.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
    ],
};
