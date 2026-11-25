import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { ShieldCheck } from 'lucide-react';
import { PublicLayout } from '@/layouts/public-layout';

interface LegalPageProps {
    type: 'privacy' | 'terms' | 'refund';
    title: string;
}

export default function LegalPage({ type = 'privacy', title }: LegalPageProps) {
    return (
        <PublicLayout title={title}>
            <div className="space-y-2 border-b border-brand-900 bg-brand-950 px-4 py-12 text-center text-white sm:px-6 lg:px-8">
                <span className="text-xs font-bold tracking-widest text-accent-copper uppercase">
                    Informasi Legal & Kebijakan
                </span>
                <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
                    {title}
                </h1>
            </div>

            <div className="mx-auto max-w-4xl space-y-8 px-4 py-12 sm:px-6 lg:px-8">
                {/* Navigation Pills */}
                <div className="flex items-center justify-center gap-2 border-b border-sand-200 pb-4">
                    <Link
                        href="/legal/privacy"
                        className={`rounded-full px-4 py-2 text-xs font-bold transition-all ${
                            type === 'privacy'
                                ? 'bg-brand-700 text-white'
                                : 'border border-sand-200 bg-white text-brand-700 hover:bg-cream-100'
                        }`}
                    >
                        Kebijakan Privasi
                    </Link>
                    <Link
                        href="/legal/terms"
                        className={`rounded-full px-4 py-2 text-xs font-bold transition-all ${
                            type === 'terms'
                                ? 'bg-brand-700 text-white'
                                : 'border border-sand-200 bg-white text-brand-700 hover:bg-cream-100'
                        }`}
                    >
                        Syarat & Ketentuan
                    </Link>
                    <Link
                        href="/legal/refund"
                        className={`rounded-full px-4 py-2 text-xs font-bold transition-all ${
                            type === 'refund'
                                ? 'bg-brand-700 text-white'
                                : 'border border-sand-200 bg-white text-brand-700 hover:bg-cream-100'
                        }`}
                    >
                        Garansi Kesegaran
                    </Link>
                </div>

                {/* Policy Body */}
                <div className="space-y-6 rounded-3xl border border-sand-200 bg-white p-8 text-xs leading-relaxed text-brand-800 shadow-xs sm:p-12 sm:text-sm">
                    {type === 'privacy' && (
                        <>
                            <h2 className="text-base font-bold text-brand-950">
                                1. Pengumpulan Informasi Pribadi
                            </h2>
                            <p>
                                Alat Kopi Malang hanya mengumpulkan data yang
                                diberikan secara sukarela saat Anda melakukan
                                konfirmasi pemesanan produk melalui website,
                                seperti Nama Lengkap, Nomor WhatsApp, dan Alamat
                                Pengiriman untuk keperluan pemenuhan kurir dan
                                komunikasi transaksi.
                            </p>

                            <h2 className="text-base font-bold text-brand-950">
                                2. Keamanan & Kerahasiaan Data
                            </h2>
                            <p>
                                Kami tidak menjual, meminjamkan, atau
                                mendistribusikan data kontak dan alamat
                                pelanggan kepada pihak ketiga manapun selain
                                ekspedisi logistik resmi yang mengantarkan paket
                                pesanan Anda.
                            </p>

                            <h2 className="text-base font-bold text-brand-950">
                                3. Komunikasi Transaksi
                            </h2>
                            <p>
                                Komunikasi resmi transaksi dilakukan hanya
                                melalui nomor WhatsApp resmi Alat Kopi Malang
                                di <strong>+62 851-2193-0454</strong>. Pastikan
                                tidak melakukan transfer ke rekening selain
                                rekening resmi yang diinstruksikan oleh admin
                                kami.
                            </p>
                        </>
                    )}

                    {type === 'terms' && (
                        <>
                            <h2 className="text-base font-bold text-brand-950">
                                1. Pemesanan & Pembayaran
                            </h2>
                            <p>
                                Seluruh pemesanan produk di website
                                sanubari.test diarahkan untuk diverifikasi
                                melalui WhatsApp resmi. Harga yang tertera
                                adalah harga retail dan grosir resmi belum
                                termasuk ongkos kirim.
                            </p>

                            <h2 className="text-base font-bold text-brand-950">
                                2. Permintaan Gilingan (Grind Request)
                            </h2>
                            <p>
                                Kami menyediakan fasilitas giling gratis untuk
                                seluruh varian biji kopi (Whole Bean, Cold Brew,
                                V60, Espresso, Tubruk). Pastikan Anda memilih
                                ukuran gilingan yang sesuai sebelum mengirimkan
                                pesanan.
                            </p>

                            <h2 className="text-base font-bold text-brand-950">
                                3. Jadwal Pengiriman
                            </h2>
                            <p>
                                Pesanan yang dikonfirmasi sebelum pukul 15.00
                                WIB akan dikirim pada hari yang sama. Pengiriman
                                beroperasi setiap hari Senin hingga Minggu
                                melalui ekspedisi reguler, cargo (wholesale),
                                dan kurir instan di wilayah Malang Raya.
                            </p>
                        </>
                    )}

                    {type === 'refund' && (
                        <>
                            <h2 className="text-base font-bold text-brand-950">
                                1. Jaminan Kesegaran (Fresh Roast Guarantee)
                            </h2>
                            <p>
                                Kami menjamin seluruh biji kopi yang dikirimkan
                                disangrai maksimal 14 hari sebelum tanggal
                                pengiriman. Setiap kemasan dilengkapi tanggal
                                sangrai (Roast Date) dan katup satu arah
                                (one-way degassing valve) berstandar
                                internasional.
                            </p>

                            <h2 className="text-base font-bold text-brand-950">
                                2. Penggantian Produk Cacat / Rusak
                            </h2>
                            <p>
                                Apabila kemasan produk robek selama pengiriman
                                atau profil gilingan yang diterima tidak sesuai
                                dengan pesanan, silakan kirimkan video unboxing
                                ke WhatsApp admin dalam waktu 2x24 jam sejak
                                paket diterima. Kami akan mengirimkan paket
                                pengganti baru tanpa biaya tambahan.
                            </p>
                        </>
                    )}
                </div>
            </div>
        </PublicLayout>
    );
}
