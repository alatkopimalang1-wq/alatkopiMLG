import React from 'react';
import { Head } from '@inertiajs/react';
import { Package } from 'lucide-react';
import { PublicLayout } from '@/layouts/public-layout';
import { ProductCard } from '@/components/product-card';
import type { Product } from '@/types/sanubari';

export default function BundlingIndex({
    bundles,
}: {
    bundles: Product[];
}) {
    return (
        <PublicLayout title="Paket Bundling Alat Kopi">
            <Head title="Paket Bundling Alat Kopi" />

            <div className="mx-auto max-w-7xl px-2.5 py-6 sm:px-6 lg:px-8 lg:py-10">
                <div className="mb-8 text-center">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800 uppercase">
                        <Package className="h-3.5 w-3.5" />
                        Custom Bundling · Diskon Khusus
                    </span>
                    <h1 className="mt-3 text-2xl font-black text-brand-950 sm:text-4xl">
                        Paket Bundling Alat Kopi
                    </h1>
                    <p className="mx-auto mt-2 max-w-2xl text-sm text-brand-700 sm:text-base">
                        Pilih sendiri kombinasi mesin espresso, grinder, dan perlengkapan kedai kopi sesuai kebutuhan Anda dengan harga diskon khusus paket.
                    </p>
                </div>

                {bundles.length === 0 ? (
                    <div className="rounded-2xl border border-sand-200 bg-white p-12 text-center text-sm text-brand-700">
                        Belum ada paket bundling yang tersedia saat ini.
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-6 lg:grid-cols-4">
                        {bundles.map((bundle) => (
                            <ProductCard key={bundle.id} product={bundle} />
                        ))}
                    </div>
                )}
            </div>
        </PublicLayout>
    );
}
