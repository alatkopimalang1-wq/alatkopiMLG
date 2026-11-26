import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { Package, ArrowRight } from 'lucide-react';
import { PublicLayout } from '@/layouts/public-layout';

interface BundleCard {
    id: number;
    name: string;
    slug: string;
    description?: string | null;
    banner_image?: string | null;
    slots_count: number;
}

export default function BundlingIndex({ bundles }: { bundles: BundleCard[] }) {
    const resolveImg = (path?: string | null) => {
        if (!path) return '/brand/logo-circle.png';
        if (path.startsWith('http://') || path.startsWith('https://')) return path;
        return `/storage/${path.replace(/^\/?(public\/|storage\/)?/, '')}`;
    };

    return (
        <PublicLayout title="Paket Bundling Alat Kopi">
            <Head title="Paket Bundling Alat Kopi" />

            <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:py-12">
                <div className="mb-8 text-center">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800 uppercase">
                        <Package className="h-3.5 w-3.5" />
                        Custom Bundling
                    </span>
                    <h1 className="mt-3 text-2xl font-black text-brand-950 sm:text-4xl">
                        Paket Bundling Alat Kopi
                    </h1>
                    <p className="mx-auto mt-2 max-w-2xl text-sm text-brand-700 sm:text-base">
                        Pilih sendiri kombinasi mesin espresso, grinder, dan perlengkapan kedai kopi sesuai kebutuhan dan budget Anda.
                    </p>
                </div>

                {bundles.length === 0 ? (
                    <div className="rounded-2xl border border-sand-200 bg-white p-12 text-center text-sm text-brand-700">
                        Belum ada paket bundling yang tersedia saat ini.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {bundles.map((bundle) => (
                            <Link
                                key={bundle.id}
                                href={`/paket-bundling/${bundle.slug}`}
                                className="group flex flex-col overflow-hidden rounded-2xl border border-sand-200 bg-white shadow-xs transition hover:-translate-y-0.5 hover:shadow-md"
                            >
                                <div className="aspect-[16/10] w-full overflow-hidden bg-sand-100">
                                    <img
                                        src={resolveImg(bundle.banner_image)}
                                        alt={bundle.name}
                                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                    />
                                </div>
                                <div className="flex flex-1 flex-col justify-between p-5">
                                    <div>
                                        <span className="text-xs font-bold tracking-wider text-accent-copper uppercase">
                                            {bundle.slots_count} Item Slot
                                        </span>
                                        <h2 className="mt-1 text-lg font-bold text-brand-950 group-hover:text-brand-700">
                                            {bundle.name}
                                        </h2>
                                        {bundle.description && (
                                            <p className="mt-1.5 line-clamp-2 text-xs text-brand-700 sm:text-sm">
                                                {bundle.description}
                                            </p>
                                        )}
                                    </div>
                                    <div className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-brand-700">
                                        <span>Atur Paket Sekarang</span>
                                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </PublicLayout>
    );
}
