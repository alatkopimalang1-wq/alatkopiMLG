import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import {
    ArrowLeft,
    Check,
    CheckCircle2,
    Clock,
    Coffee,
    Droplet,
    Flame,
    Lightbulb,
    Scale,
    Thermometer,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { PublicLayout } from '@/layouts/public-layout';
import type { BrewGuide } from '@/types/sanubari';

interface BrewGuideShowProps {
    guide: BrewGuide;
    otherGuides: BrewGuide[];
}

export default function BrewGuideShow({
    guide,
    otherGuides = [],
}: BrewGuideShowProps) {
    const title =
        typeof guide.title === 'string'
            ? guide.title
            : (guide.title as any)?.id || '';
    const desc =
        typeof guide.description === 'string'
            ? guide.description
            : (guide.description as any)?.id || '';
    const [completedSteps, setCompletedSteps] = useState<number[]>([]);

    const toggleStep = (idx: number) => {
        setCompletedSteps((prev) =>
            prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx],
        );
    };

    return (
        <PublicLayout title={title}>
            {/* Header */}
            <div className="border-b border-brand-900 bg-brand-950 px-4 py-12 text-white sm:px-6 lg:px-8">
                <div className="mx-auto max-w-4xl space-y-4">
                    <Link
                        href="/panduan-seduh"
                        className="inline-flex items-center gap-1.5 text-xs text-brand-300 hover:text-white"
                    >
                        <ArrowLeft className="h-3.5 w-3.5" />
                        <span>Semua Panduan Seduh</span>
                    </Link>

                    <div className="flex items-center gap-2">
                        <span className="rounded-full bg-accent-copper px-2.5 py-0.5 text-xs font-bold tracking-wider text-white uppercase">
                            Metode {guide.method}
                        </span>
                        <span className="text-xs text-brand-300">
                            Tingkat: {guide.difficulty}
                        </span>
                    </div>

                    <h1 className="text-3xl leading-tight font-extrabold tracking-tight sm:text-4xl">
                        {title}
                    </h1>

                    {desc && (
                        <p className="text-xs leading-relaxed text-brand-200 sm:text-sm">
                            {desc}
                        </p>
                    )}
                </div>
            </div>

            <div className="mx-auto max-w-4xl space-y-12 px-4 py-12 sm:px-6 lg:px-8">
                {/* Parameters Matrix */}
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                    <div className="rounded-2xl border border-sand-200 bg-white p-4 text-center">
                        <Scale className="mx-auto mb-1 h-5 w-5 text-accent-copper" />
                        <span className="block text-[10px] tracking-wider text-brand-400 uppercase">
                            Rasio Kopi : Air
                        </span>
                        <span className="text-sm font-extrabold text-brand-950">
                            {guide.ratio}
                        </span>
                    </div>

                    <div className="rounded-2xl border border-sand-200 bg-white p-4 text-center">
                        <Coffee className="mx-auto mb-1 h-5 w-5 text-accent-copper" />
                        <span className="block text-[10px] tracking-wider text-brand-400 uppercase">
                            Ukuran Gilingan
                        </span>
                        <span className="text-sm font-extrabold text-brand-950">
                            {guide.grind_size}
                        </span>
                    </div>

                    <div className="rounded-2xl border border-sand-200 bg-white p-4 text-center">
                        <Thermometer className="mx-auto mb-1 h-5 w-5 text-accent-copper" />
                        <span className="block text-[10px] tracking-wider text-brand-400 uppercase">
                            Suhu Air
                        </span>
                        <span className="text-sm font-extrabold text-brand-950">
                            {guide.water_temp}
                        </span>
                    </div>

                    <div className="rounded-2xl border border-sand-200 bg-white p-4 text-center">
                        <Clock className="mx-auto mb-1 h-5 w-5 text-accent-copper" />
                        <span className="block text-[10px] tracking-wider text-brand-400 uppercase">
                            Target Waktu
                        </span>
                        <span className="text-sm font-extrabold text-brand-950">
                            {guide.brew_time}
                        </span>
                    </div>
                </div>

                {/* Step by Step Timeline */}
                <div className="space-y-8 rounded-3xl border border-sand-200 bg-white p-6 shadow-xs sm:p-10">
                    <h2 className="border-b border-sand-200 pb-4 text-xl font-bold text-brand-950">
                        Langkah-Langkah Seduhan Presisi
                    </h2>

                    <div className="space-y-3">
                        {guide.steps.map((st, idx) => {
                            const isDone = completedSteps.includes(idx);
                            return (
                                <motion.div
                                    key={idx}
                                    layout
                                    onClick={() => toggleStep(idx)}
                                    className={`flex cursor-pointer items-start gap-4 rounded-2xl p-3.5 transition-colors duration-150 select-none sm:gap-6 sm:p-4 ${
                                        isDone
                                            ? 'bg-sand-100/60 border border-sand-200'
                                            : 'hover:bg-sand-50/80 border border-transparent'
                                    }`}
                                >
                                    <motion.div
                                        whileTap={{ scale: 0.92 }}
                                        className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-xs font-extrabold shadow-xs transition-colors duration-150 sm:h-10 sm:w-10 sm:text-sm ${
                                            isDone
                                                ? 'bg-accent-copper text-white'
                                                : 'bg-brand-700 text-white'
                                        }`}
                                    >
                                        {isDone ? (
                                            <Check className="h-4 w-4 stroke-[2.5] sm:h-5 sm:w-5" />
                                        ) : (
                                            st.step || idx + 1
                                        )}
                                    </motion.div>
                                    <div className="flex-1 space-y-1">
                                        <div className="flex items-center gap-2">
                                            {st.time && (
                                                <span className="inline-block rounded bg-cream-100 px-2 py-0.5 text-[10px] font-bold tracking-wider text-accent-copper uppercase">
                                                    Waktu: {st.time}
                                                </span>
                                            )}
                                            {isDone && (
                                                <span className="text-[11px] font-semibold text-accent-copper">
                                                    Selesai
                                                </span>
                                            )}
                                        </div>
                                        <p
                                            className={`text-xs leading-relaxed font-medium transition-colors duration-150 sm:text-sm ${
                                                isDone
                                                    ? 'text-brand-500 line-through'
                                                    : 'text-brand-800'
                                            }`}
                                        >
                                            {st.text}
                                        </p>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>

                {/* Tips Box */}
                <div className="space-y-2 rounded-2xl border border-sand-200 bg-sand-200/60 p-6">
                    <div className="flex items-center gap-2 text-xs font-bold tracking-wider text-accent-copper uppercase">
                        <Lightbulb className="h-4 w-4" />
                        <span>Tips Roaster Sanubari</span>
                    </div>
                    <p className="text-xs leading-relaxed text-brand-700">
                        Gunakan air mineral dengan total dissolved solids (TDS)
                        antara 80 - 150 ppm untuk ekstraksi rasa manis maksimal.
                        Jangan lupa bilas kertas filter dengan air panas sebelum
                        memasukkan bubuk kopi.
                    </p>
                </div>

                {/* Recommended Beans CTA */}
                <div className="space-y-4 rounded-3xl bg-brand-900 p-8 text-center text-white">
                    <h3 className="text-xl font-bold">
                        Siap Menyeduh Sekarang?
                    </h3>
                    <p className="mx-auto max-w-md text-xs text-brand-300">
                        Pilih biji kopi filter single origin Gunung Kawi atau
                        seri co-fermentasi kami yang cocok untuk metode{' '}
                        {guide.method}.
                    </p>
                    <Link
                        href="/shop"
                        className="inline-block rounded-full bg-accent-copper px-6 py-3 text-xs font-bold tracking-wider text-white uppercase shadow-md transition-all hover:bg-accent-copper-hover"
                    >
                        Pilih Biji Kopi di Katalog
                    </Link>
                </div>
            </div>
        </PublicLayout>
    );
}
