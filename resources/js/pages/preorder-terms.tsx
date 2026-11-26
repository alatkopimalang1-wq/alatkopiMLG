import React from 'react';
import { Link } from '@inertiajs/react';
import { ArrowRight, Clock, MessageCircle, ShieldCheck } from 'lucide-react';
import { PublicLayout } from '@/layouts/public-layout';

interface PreorderSection {
    title: string;
    content: string;
}

interface PreorderTermsPageProps {
    page: {
        badge?: string;
        title?: string;
        subtitle?: string;
        sections?: PreorderSection[];
        footer_note?: string;
    };
}

export default function PreorderTermsPage({ page }: PreorderTermsPageProps) {
    const title = page?.title || 'Syarat & Ketentuan Pre-Order';
    const badge = page?.badge || 'Informasi & Kebijakan Pre-Order';
    const subtitle =
        page?.subtitle ||
        'Ketentuan pemesanan, pembayaran Down Payment (DP), estimasi kedatangan, serta pelunasan produk Pre-Order di Alat Kopi Malang.';
    const sections = Array.isArray(page?.sections) ? page.sections : [];

    return (
        <PublicLayout title={title}>
            <div className="space-y-3 border-b border-brand-900 bg-brand-950 px-4 py-12 text-center text-white sm:px-6 lg:px-8">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-accent-copper/15 px-3 py-1 text-xs font-bold tracking-widest text-accent-copper uppercase">
                    <Clock className="h-3.5 w-3.5" />
                    {badge}
                </span>
                <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
                    {title}
                </h1>
                {subtitle && (
                    <p className="mx-auto max-w-2xl text-xs leading-relaxed text-brand-300 sm:text-sm">
                        {subtitle}
                    </p>
                )}
            </div>

            <div className="mx-auto max-w-4xl space-y-6 px-4 py-10 sm:px-6 sm:py-12 lg:px-8">
                <div className="space-y-6 rounded-3xl border border-sand-200 bg-white p-6 text-xs leading-relaxed text-brand-800 shadow-xs sm:p-10 sm:text-sm">
                    {sections.map((section, idx) => (
                        <div
                            key={`${section.title}-${idx}`}
                            className="space-y-2 border-b border-sand-100 pb-5 last:border-b-0 last:pb-0"
                        >
                            <h2 className="text-sm font-bold text-brand-950 sm:text-base">
                                {section.title}
                            </h2>
                            <p className="whitespace-pre-line text-brand-700">
                                {section.content}
                            </p>
                        </div>
                    ))}

                    {page?.footer_note && (
                        <div className="rounded-2xl border border-amber-200 bg-amber-50/90 p-4 text-xs text-amber-950">
                            <div className="flex items-start gap-2.5">
                                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" />
                                <p className="leading-relaxed">
                                    {page.footer_note}
                                </p>
                            </div>
                        </div>
                    )}

                    <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                        <Link
                            href="/shop"
                            className="inline-flex items-center gap-2 rounded-xl bg-brand-900 px-5 py-2.5 text-xs font-bold text-white transition-colors hover:bg-brand-800"
                        >
                            <span>Lihat Katalog Alat Kopi</span>
                            <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                        <a
                            href="https://wa.me/6282132095241?text=Halo%20Alat%20Kopi%20Malang%2C%20saya%20ingin%20bertanya%20mengenai%20produk%20Pre-Order."
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 rounded-xl bg-[#25D366] px-5 py-2.5 text-xs font-bold text-white transition-colors hover:bg-[#20ba59]"
                        >
                            <MessageCircle className="h-3.5 w-3.5 fill-white" />
                            <span>Tanya via WhatsApp</span>
                        </a>
                    </div>
                </div>
            </div>
        </PublicLayout>
    );
}
