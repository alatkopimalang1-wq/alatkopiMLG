import React, { useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import {
    Film,
    Plus,
    Search,
    Edit2,
    Trash2,
    Play,
    X,
    ExternalLink,
    CheckCircle2,
    AlertCircle,
    Eye,
    SlidersHorizontal,
} from 'lucide-react';
import { toast } from 'sonner';

interface VideoReel {
    id: number | string;
    headline: string;
    caption: string;
    badge?: string | null;
    thumbnail: string;
    video_url: string;
    videoUrl?: string;
    product_count: number;
    productCount?: number;
    sort_order: number;
    is_active: boolean;
    created_at?: string;
    updated_at?: string;
}

interface ReelsPageProps {
    reels: VideoReel[];
}

export default function DashboardReels({ reels = [] }: ReelsPageProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editingReel, setEditingReel] = useState<VideoReel | null>(null);
    const [deletingReel, setDeletingReel] = useState<VideoReel | null>(null);
    const [previewVideoUrl, setPreviewVideoUrl] = useState<string | null>(null);

    // Create Form
    const createForm = useForm({
        headline: '',
        caption: '',
        badge: '',
        thumbnail: '',
        video_url: '',
        sort_order: 0,
        is_active: true,
    });

    // Edit Form
    const editForm = useForm({
        headline: '',
        caption: '',
        badge: '',
        thumbnail: '',
        video_url: '',
        sort_order: 0,
        is_active: true,
    });

    const openEditModal = (reel: VideoReel) => {
        setEditingReel(reel);
        editForm.setData({
            headline: reel.headline,
            caption: reel.caption,
            badge: reel.badge || '',
            thumbnail: reel.thumbnail,
            video_url: reel.video_url || reel.videoUrl || '',
            sort_order: reel.sort_order || 0,
            is_active: reel.is_active ?? true,
        });
    };

    const handleCreateSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        createForm.post('/dashboard/reels', {
            preserveScroll: true,
            onSuccess: () => {
                setIsCreateOpen(false);
                createForm.reset();
                toast.success('Video Reel baru berhasil ditambahkan!');
            },
            onError: (errors) => {
                const firstError = Object.values(errors)[0];
                toast.error(firstError || 'Gagal menambahkan video reel.');
            },
        });
    };

    const handleEditSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingReel) return;

        editForm.put(`/dashboard/reels/${editingReel.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                setEditingReel(null);
                toast.success('Video Reel berhasil diperbarui!');
            },
            onError: (errors) => {
                const firstError = Object.values(errors)[0];
                toast.error(firstError || 'Gagal memperbarui video reel.');
            },
        });
    };

    const handleDelete = () => {
        if (!deletingReel) return;

        router.delete(`/dashboard/reels/${deletingReel.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                setDeletingReel(null);
                toast.success('Video Reel berhasil dihapus.');
            },
            onError: () => {
                toast.error('Gagal menghapus video reel.');
            },
        });
    };

    const filteredReels = reels.filter((r) => {
        const q = searchTerm.toLowerCase();
        return (
            r.headline.toLowerCase().includes(q) ||
            r.caption.toLowerCase().includes(q) ||
            (r.badge && r.badge.toLowerCase().includes(q))
        );
    });

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Dashboard', href: dashboard() },
                { title: 'Pengaturan Video Reels', href: '/dashboard/reels' },
            ]}
        >
            <Head title="Pengaturan Video Reels - Dashboard Admin" />

            <div className="mx-auto w-full max-w-7xl space-y-6 p-4 sm:p-6 lg:p-8">
                {/* Header Section */}
                <div className="flex flex-col justify-between gap-4 border-b border-sidebar-border pb-4 sm:flex-row sm:items-center">
                    <div>
                        <div className="flex items-center gap-2.5">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-copper/15 text-accent-copper">
                                <Film className="h-5 w-5" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold tracking-tight text-neutral-900 sm:text-2xl dark:text-neutral-100">
                                    Pengaturan Video Reels
                                </h1>
                                <p className="text-xs text-neutral-500 sm:text-sm dark:text-neutral-400">
                                    Kelola video reels, judul, deskripsi, dan
                                    thumbnail yang tayang di halaman publik
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2.5">
                        <a
                            href="/video"
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 rounded-xl border border-neutral-300 px-3.5 py-2 text-xs font-semibold text-neutral-700 transition-colors hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
                        >
                            <span>Lihat Halaman Publik</span>
                            <ExternalLink className="h-3.5 w-3.5" />
                        </a>

                        <button
                            type="button"
                            onClick={() => setIsCreateOpen(true)}
                            className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-neutral-900 px-4 py-2 text-xs font-bold text-white shadow-sm transition-all hover:bg-neutral-800 active:scale-95 sm:text-sm dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-white"
                        >
                            <Plus className="h-4 w-4" />
                            <span>Tambah Video Reel</span>
                        </button>
                    </div>
                </div>

                {/* Filter & Summary Bar */}
                <div className="flex flex-col items-stretch justify-between gap-3 sm:flex-row sm:items-center">
                    <div className="relative max-w-md flex-1">
                        <Search className="absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Cari berdasarkan judul atau deskripsi..."
                            className="w-full rounded-xl border border-neutral-200 bg-white py-2 pr-4 pl-9 text-xs text-neutral-900 focus:ring-2 focus:ring-accent-copper/40 focus:outline-hidden sm:text-sm dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100"
                        />
                    </div>

                    <div className="flex items-center gap-3 text-xs text-neutral-600 dark:text-neutral-400">
                        <span className="rounded-lg bg-neutral-100 px-3 py-1.5 font-semibold dark:bg-neutral-800">
                            Total:{' '}
                            <strong className="text-neutral-900 dark:text-neutral-100">
                                {reels.length}
                            </strong>{' '}
                            Video
                        </span>
                        <span className="rounded-lg bg-emerald-50 px-3 py-1.5 font-semibold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
                            Aktif: {reels.filter((r) => r.is_active).length}
                        </span>
                    </div>
                </div>

                {/* Reels Grid */}
                {filteredReels.length === 0 ? (
                    <div className="space-y-3 rounded-2xl border border-neutral-200 bg-white p-12 text-center dark:border-neutral-800 dark:bg-neutral-900">
                        <Film className="mx-auto h-12 w-12 text-neutral-400 opacity-50" />
                        <p className="text-sm font-bold text-neutral-800 dark:text-neutral-200">
                            Tidak ada video reel yang ditemukan
                        </p>
                        <p className="mx-auto max-w-sm text-xs text-neutral-500">
                            {searchTerm
                                ? 'Coba ganti kata kunci pencarian Anda.'
                                : 'Mulai tambahkan video reel baru untuk ditampilkan di Beranda dan Halaman Video.'}
                        </p>
                        <button
                            type="button"
                            onClick={() => setIsCreateOpen(true)}
                            className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-accent-copper px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-accent-copper-hover"
                        >
                            <Plus className="h-3.5 w-3.5" />
                            <span>Tambah Sekarang</span>
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4">
                        {filteredReels.map((reel) => {
                            const videoUrl =
                                reel.video_url || reel.videoUrl || '';
                            return (
                                <div
                                    key={reel.id}
                                    className="flex flex-col overflow-hidden rounded-2xl border border-neutral-200/80 bg-white shadow-xs transition-shadow hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900"
                                >
                                    {/* Video / Thumbnail Aspect 9:16 Preview */}
                                    <div className="group relative aspect-[9/13] overflow-hidden bg-neutral-950">
                                        <img
                                            src={reel.thumbnail}
                                            alt={reel.headline}
                                            className="h-full w-full object-cover opacity-85 transition-transform duration-500 group-hover:scale-105"
                                        />

                                        {/* Play Overlay Button */}
                                        {videoUrl && (
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setPreviewVideoUrl(videoUrl)
                                                }
                                                className="absolute inset-0 m-auto flex h-12 w-12 cursor-pointer items-center justify-center rounded-full bg-black/60 text-white shadow-lg transition-all group-hover:scale-110 hover:bg-accent-copper"
                                                title="Putar Video Preview"
                                            >
                                                <Play className="ml-0.5 h-5 w-5 fill-white" />
                                            </button>
                                        )}

                                        {/* Badge Tag */}
                                        {reel.badge && (
                                            <span className="absolute top-2.5 left-2.5 rounded-md bg-accent-copper px-2.5 py-1 text-[10px] font-extrabold tracking-wider text-white uppercase shadow-xs">
                                                {reel.badge}
                                            </span>
                                        )}

                                        {/* Status Pill */}
                                        <span
                                            className={`absolute top-2.5 right-2.5 rounded-md px-2 py-0.5 text-[10px] font-bold ${
                                                reel.is_active
                                                    ? 'bg-emerald-500/90 text-white'
                                                    : 'bg-neutral-600/90 text-neutral-200'
                                            }`}
                                        >
                                            {reel.is_active ? 'Aktif' : 'Draft'}
                                        </span>

                                        <div className="absolute right-2 bottom-2 left-2 flex items-center justify-between rounded-md bg-black/40 px-2 py-1 text-[11px] text-white/90 backdrop-blur-xs">
                                            <span>
                                                Urutan: #{reel.sort_order || 0}
                                            </span>
                                            <span>
                                                {reel.product_count ||
                                                    reel.productCount ||
                                                    0}{' '}
                                                Produk
                                            </span>
                                        </div>
                                    </div>

                                    {/* Card Content */}
                                    <div className="flex flex-1 flex-col justify-between space-y-3 p-4">
                                        <div className="space-y-1.5">
                                            <h3 className="line-clamp-2 text-sm leading-snug font-bold text-neutral-900 dark:text-neutral-100">
                                                {reel.headline}
                                            </h3>
                                            <p className="line-clamp-3 text-xs leading-relaxed text-neutral-500 dark:text-neutral-400">
                                                {reel.caption}
                                            </p>
                                        </div>

                                        {/* Action Buttons: Edit & Delete */}
                                        <div className="flex items-center justify-between gap-2 border-t border-neutral-100 pt-3 dark:border-neutral-800">
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    openEditModal(reel)
                                                }
                                                className="inline-flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-neutral-100 px-3 py-2 text-xs font-bold text-neutral-800 transition-colors hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700"
                                            >
                                                <Edit2 className="h-3.5 w-3.5" />
                                                <span>Edit</span>
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setDeletingReel(reel)
                                                }
                                                className="inline-flex cursor-pointer items-center justify-center rounded-xl bg-red-50 p-2 text-red-600 transition-colors hover:bg-red-100 dark:bg-red-950/40 dark:text-red-400 dark:hover:bg-red-900/60"
                                                title="Hapus Video Reel"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* ======================================================== */}
            {/* Modal: Tambah Video Reel Baru                            */}
            {/* ======================================================== */}
            {isCreateOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 p-4 backdrop-blur-xs">
                    <div className="my-8 w-full max-w-lg animate-in space-y-5 rounded-3xl border border-neutral-200 bg-white p-6 shadow-2xl duration-150 zoom-in-95 fade-in dark:border-neutral-800 dark:bg-neutral-900">
                        <div className="flex items-center justify-between border-b border-neutral-100 pb-3 dark:border-neutral-800">
                            <div className="flex items-center gap-2">
                                <Plus className="h-5 w-5 text-accent-copper" />
                                <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
                                    Tambah Video Reel Baru
                                </h2>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsCreateOpen(false)}
                                className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        <form
                            onSubmit={handleCreateSubmit}
                            className="space-y-4"
                        >
                            {/* Judul / Headline */}
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-neutral-800 dark:text-neutral-200">
                                    Judul Video Reel *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={createForm.data.headline}
                                    onChange={(e) =>
                                        createForm.setData(
                                            'headline',
                                            e.target.value,
                                        )
                                    }
                                    placeholder="Contoh: Kalo Mesin Espresso Diperkecil, Maka Jadi Segini.."
                                    className="w-full rounded-xl border border-neutral-300 bg-neutral-50 px-3.5 py-2.5 text-xs text-neutral-900 focus:ring-2 focus:ring-accent-copper/40 focus:outline-hidden sm:text-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
                                />
                                {createForm.errors.headline && (
                                    <p className="text-[11px] text-red-500">
                                        {createForm.errors.headline}
                                    </p>
                                )}
                            </div>

                            {/* Deskripsi / Caption */}
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-neutral-800 dark:text-neutral-200">
                                    Deskripsi / Caption *
                                </label>
                                <textarea
                                    required
                                    rows={3}
                                    value={createForm.data.caption}
                                    onChange={(e) =>
                                        createForm.setData(
                                            'caption',
                                            e.target.value,
                                        )
                                    }
                                    placeholder="Tuliskan ulasan ringkas mengenai konten video ini..."
                                    className="w-full resize-none rounded-xl border border-neutral-300 bg-neutral-50 px-3.5 py-2.5 text-xs text-neutral-900 focus:ring-2 focus:ring-accent-copper/40 focus:outline-hidden sm:text-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
                                />
                                {createForm.errors.caption && (
                                    <p className="text-[11px] text-red-500">
                                        {createForm.errors.caption}
                                    </p>
                                )}
                            </div>

                            {/* Badge Label (Opsional) */}
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-neutral-800 dark:text-neutral-200">
                                    Badge Highlight (Opsional)
                                </label>
                                <input
                                    type="text"
                                    value={createForm.data.badge}
                                    onChange={(e) =>
                                        createForm.setData(
                                            'badge',
                                            e.target.value,
                                        )
                                    }
                                    placeholder="Contoh: BARISTA APPROVED! ☕🔥 atau TIPS SEDUH"
                                    className="w-full rounded-xl border border-neutral-300 bg-neutral-50 px-3.5 py-2.5 text-xs text-neutral-900 focus:ring-2 focus:ring-accent-copper/40 focus:outline-hidden sm:text-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
                                />
                            </div>

                            {/* Thumbnail URL */}
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-neutral-800 dark:text-neutral-200">
                                    URL Gambar Thumbnail (Portrait 9:16
                                    disarankan)
                                </label>
                                <input
                                    type="text"
                                    value={createForm.data.thumbnail}
                                    onChange={(e) =>
                                        createForm.setData(
                                            'thumbnail',
                                            e.target.value,
                                        )
                                    }
                                    placeholder="https://images.unsplash.com/... atau /storage/..."
                                    className="w-full rounded-xl border border-neutral-300 bg-neutral-50 px-3.5 py-2.5 text-xs text-neutral-900 focus:ring-2 focus:ring-accent-copper/40 focus:outline-hidden sm:text-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
                                />
                            </div>

                            {/* Video URL */}
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-neutral-800 dark:text-neutral-200">
                                    URL Video MP4
                                </label>
                                <input
                                    type="text"
                                    value={createForm.data.video_url}
                                    onChange={(e) =>
                                        createForm.setData(
                                            'video_url',
                                            e.target.value,
                                        )
                                    }
                                    placeholder="https://.../video.mp4"
                                    className="w-full rounded-xl border border-neutral-300 bg-neutral-50 px-3.5 py-2.5 text-xs text-neutral-900 focus:ring-2 focus:ring-accent-copper/40 focus:outline-hidden sm:text-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
                                />
                            </div>

                            {/* Urutan & Status */}
                            <div className="grid grid-cols-2 gap-3 pt-1">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-neutral-800 dark:text-neutral-200">
                                        Urutan Tampilan
                                    </label>
                                    <input
                                        type="number"
                                        value={createForm.data.sort_order}
                                        onChange={(e) =>
                                            createForm.setData(
                                                'sort_order',
                                                parseInt(e.target.value) || 0,
                                            )
                                        }
                                        className="w-full rounded-xl border border-neutral-300 bg-neutral-50 px-3.5 py-2 text-xs text-neutral-900 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
                                    />
                                </div>

                                <div className="flex items-center gap-2 pt-5">
                                    <input
                                        type="checkbox"
                                        id="create-active"
                                        checked={createForm.data.is_active}
                                        onChange={(e) =>
                                            createForm.setData(
                                                'is_active',
                                                e.target.checked,
                                            )
                                        }
                                        className="h-4 w-4 rounded text-accent-copper focus:ring-accent-copper"
                                    />
                                    <label
                                        htmlFor="create-active"
                                        className="cursor-pointer text-xs font-semibold text-neutral-800 dark:text-neutral-200"
                                    >
                                        Aktifkan Sekarang
                                    </label>
                                </div>
                            </div>

                            <div className="flex items-center justify-end gap-2.5 border-t border-neutral-100 pt-4 dark:border-neutral-800">
                                <button
                                    type="button"
                                    onClick={() => setIsCreateOpen(false)}
                                    className="cursor-pointer rounded-xl border border-neutral-300 px-4 py-2.5 text-xs font-bold text-neutral-700 transition-colors hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={createForm.processing}
                                    className="cursor-pointer rounded-xl bg-accent-copper px-5 py-2.5 text-xs font-bold text-white shadow-sm transition-all hover:bg-accent-copper-hover active:scale-95 disabled:opacity-50"
                                >
                                    {createForm.processing
                                        ? 'Menyimpan...'
                                        : 'Simpan Video Reel'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ======================================================== */}
            {/* Modal: Edit Judul & Deskripsi Video Reel                 */}
            {/* ======================================================== */}
            {editingReel && (
                <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 p-4 backdrop-blur-xs">
                    <div className="my-8 w-full max-w-lg animate-in space-y-5 rounded-3xl border border-neutral-200 bg-white p-6 shadow-2xl duration-150 zoom-in-95 fade-in dark:border-neutral-800 dark:bg-neutral-900">
                        <div className="flex items-center justify-between border-b border-neutral-100 pb-3 dark:border-neutral-800">
                            <div className="flex items-center gap-2">
                                <Edit2 className="h-5 w-5 text-accent-copper" />
                                <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
                                    Edit Video Reel
                                </h2>
                            </div>
                            <button
                                type="button"
                                onClick={() => setEditingReel(null)}
                                className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        <form onSubmit={handleEditSubmit} className="space-y-4">
                            {/* Judul / Headline */}
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-neutral-800 dark:text-neutral-200">
                                    Judul Video Reel *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={editForm.data.headline}
                                    onChange={(e) =>
                                        editForm.setData(
                                            'headline',
                                            e.target.value,
                                        )
                                    }
                                    className="w-full rounded-xl border border-neutral-300 bg-neutral-50 px-3.5 py-2.5 text-xs text-neutral-900 focus:ring-2 focus:ring-accent-copper/40 focus:outline-hidden sm:text-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
                                />
                                {editForm.errors.headline && (
                                    <p className="text-[11px] text-red-500">
                                        {editForm.errors.headline}
                                    </p>
                                )}
                            </div>

                            {/* Deskripsi / Caption */}
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-neutral-800 dark:text-neutral-200">
                                    Deskripsi / Caption *
                                </label>
                                <textarea
                                    required
                                    rows={3}
                                    value={editForm.data.caption}
                                    onChange={(e) =>
                                        editForm.setData(
                                            'caption',
                                            e.target.value,
                                        )
                                    }
                                    className="w-full resize-none rounded-xl border border-neutral-300 bg-neutral-50 px-3.5 py-2.5 text-xs text-neutral-900 focus:ring-2 focus:ring-accent-copper/40 focus:outline-hidden sm:text-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
                                />
                                {editForm.errors.caption && (
                                    <p className="text-[11px] text-red-500">
                                        {editForm.errors.caption}
                                    </p>
                                )}
                            </div>

                            {/* Badge Label (Opsional) */}
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-neutral-800 dark:text-neutral-200">
                                    Badge Highlight (Opsional)
                                </label>
                                <input
                                    type="text"
                                    value={editForm.data.badge}
                                    onChange={(e) =>
                                        editForm.setData(
                                            'badge',
                                            e.target.value,
                                        )
                                    }
                                    className="w-full rounded-xl border border-neutral-300 bg-neutral-50 px-3.5 py-2.5 text-xs text-neutral-900 focus:ring-2 focus:ring-accent-copper/40 focus:outline-hidden sm:text-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
                                />
                            </div>

                            {/* Thumbnail URL */}
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-neutral-800 dark:text-neutral-200">
                                    URL Gambar Thumbnail
                                </label>
                                <input
                                    type="text"
                                    value={editForm.data.thumbnail}
                                    onChange={(e) =>
                                        editForm.setData(
                                            'thumbnail',
                                            e.target.value,
                                        )
                                    }
                                    className="w-full rounded-xl border border-neutral-300 bg-neutral-50 px-3.5 py-2.5 text-xs text-neutral-900 focus:ring-2 focus:ring-accent-copper/40 focus:outline-hidden sm:text-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
                                />
                            </div>

                            {/* Video URL */}
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-neutral-800 dark:text-neutral-200">
                                    URL Video MP4
                                </label>
                                <input
                                    type="text"
                                    value={editForm.data.video_url}
                                    onChange={(e) =>
                                        editForm.setData(
                                            'video_url',
                                            e.target.value,
                                        )
                                    }
                                    className="w-full rounded-xl border border-neutral-300 bg-neutral-50 px-3.5 py-2.5 text-xs text-neutral-900 focus:ring-2 focus:ring-accent-copper/40 focus:outline-hidden sm:text-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
                                />
                            </div>

                            {/* Urutan & Status */}
                            <div className="grid grid-cols-2 gap-3 pt-1">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-neutral-800 dark:text-neutral-200">
                                        Urutan Tampilan
                                    </label>
                                    <input
                                        type="number"
                                        value={editForm.data.sort_order}
                                        onChange={(e) =>
                                            editForm.setData(
                                                'sort_order',
                                                parseInt(e.target.value) || 0,
                                            )
                                        }
                                        className="w-full rounded-xl border border-neutral-300 bg-neutral-50 px-3.5 py-2 text-xs text-neutral-900 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
                                    />
                                </div>

                                <div className="flex items-center gap-2 pt-5">
                                    <input
                                        type="checkbox"
                                        id="edit-active"
                                        checked={editForm.data.is_active}
                                        onChange={(e) =>
                                            editForm.setData(
                                                'is_active',
                                                e.target.checked,
                                            )
                                        }
                                        className="h-4 w-4 rounded text-accent-copper focus:ring-accent-copper"
                                    />
                                    <label
                                        htmlFor="edit-active"
                                        className="cursor-pointer text-xs font-semibold text-neutral-800 dark:text-neutral-200"
                                    >
                                        Aktifkan Video
                                    </label>
                                </div>
                            </div>

                            <div className="flex items-center justify-end gap-2.5 border-t border-neutral-100 pt-4 dark:border-neutral-800">
                                <button
                                    type="button"
                                    onClick={() => setEditingReel(null)}
                                    className="cursor-pointer rounded-xl border border-neutral-300 px-4 py-2.5 text-xs font-bold text-neutral-700 transition-colors hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={editForm.processing}
                                    className="cursor-pointer rounded-xl bg-accent-copper px-5 py-2.5 text-xs font-bold text-white shadow-sm transition-all hover:bg-accent-copper-hover active:scale-95 disabled:opacity-50"
                                >
                                    {editForm.processing
                                        ? 'Menyimpan...'
                                        : 'Perbarui Video Reel'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ======================================================== */}
            {/* Modal: Konfirmasi Hapus Video Reel                       */}
            {/* ======================================================== */}
            {deletingReel && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
                    <div className="w-full max-w-sm animate-in space-y-4 rounded-3xl border border-neutral-200 bg-white p-6 shadow-2xl duration-150 zoom-in-95 fade-in dark:border-neutral-800 dark:bg-neutral-900">
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-red-100 text-red-600 dark:bg-red-950/60 dark:text-red-400">
                            <Trash2 className="h-6 w-6" />
                        </div>

                        <div className="space-y-1.5 text-center">
                            <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
                                Hapus Video Reel?
                            </h3>
                            <p className="text-xs leading-relaxed text-neutral-500 dark:text-neutral-400">
                                Apakah Anda yakin ingin menghapus reel{' '}
                                <strong className="font-semibold text-neutral-800 dark:text-neutral-200">
                                    "{deletingReel.headline}"
                                </strong>
                                ? Tindakan ini tidak dapat dibatalkan.
                            </p>
                        </div>

                        <div className="flex items-center gap-2.5 pt-2">
                            <button
                                type="button"
                                onClick={() => setDeletingReel(null)}
                                className="flex-1 cursor-pointer rounded-xl border border-neutral-300 py-2.5 text-xs font-bold text-neutral-700 transition-colors hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
                            >
                                Batal
                            </button>
                            <button
                                type="button"
                                onClick={handleDelete}
                                className="flex-1 cursor-pointer rounded-xl bg-red-600 py-2.5 text-xs font-bold text-white shadow-sm transition-all hover:bg-red-700 active:scale-95"
                            >
                                Ya, Hapus Reel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ======================================================== */}
            {/* Modal: Quick Video Player Preview                        */}
            {/* ======================================================== */}
            {previewVideoUrl && (
                <div
                    onClick={() => setPreviewVideoUrl(null)}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        className="relative aspect-[9/16] w-full max-w-sm overflow-hidden rounded-3xl border border-neutral-800 bg-black shadow-2xl"
                    >
                        <button
                            type="button"
                            onClick={() => setPreviewVideoUrl(null)}
                            className="absolute top-4 right-4 z-20 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-black/60 text-white shadow-md hover:bg-black/90"
                        >
                            <X className="h-4 w-4" />
                        </button>
                        <video
                            src={previewVideoUrl}
                            autoPlay
                            controls
                            className="h-full w-full object-cover"
                        />
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
