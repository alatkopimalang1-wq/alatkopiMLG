import React, { useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import {
    Layers,
    Plus,
    Search,
    Edit2,
    Trash2,
    X,
    ExternalLink,
    SlidersHorizontal,
    RotateCcw,
    Sparkles,
    Eye,
    EyeOff,
    Upload,
    ArrowUpDown,
    Check,
} from 'lucide-react';
import { toast } from 'sonner';

export interface HelixGalleryItem {
    id: string | number;
    title?: string;
    subtitle?: string | null;
    image?: string | null;
    sort_order?: number;
    is_active?: boolean;
}

export interface HelixSettings {
    auto_rotate: boolean;
    auto_rotate_speed: number;
    visible_columns: number;
    tiers_count: number;
    show_header: boolean;
    badge: string;
    title: string;
    subtitle: string;
}

interface HelixGalleryPageProps {
    settings: HelixSettings;
    items: HelixGalleryItem[];
}

export default function DashboardHelixGallery({
    settings: initialSettings,
    items: initialItems = [],
}: HelixGalleryPageProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<HelixGalleryItem | null>(
        null,
    );
    const [deletingItem, setDeletingItem] = useState<HelixGalleryItem | null>(
        null,
    );
    const [previewImage, setPreviewImage] = useState<string | null>(null);

    // Settings Form
    const settingsForm = useForm({
        auto_rotate: initialSettings.auto_rotate,
        auto_rotate_speed: initialSettings.auto_rotate_speed,
        visible_columns: initialSettings.visible_columns,
        tiers_count: initialSettings.tiers_count,
        show_header: initialSettings.show_header,
        badge: initialSettings.badge,
        title: initialSettings.title,
        subtitle: initialSettings.subtitle,
    });

    // Create Item Form (Strictly image upload, sort order, and active status)
    const createForm = useForm<{
        image: string;
        image_file: File | null;
        sort_order: number;
        is_active: boolean;
    }>({
        image: '',
        image_file: null,
        sort_order: (initialItems.length || 0) + 1,
        is_active: true,
    });

    // Edit Item Form
    const editForm = useForm<{
        image: string;
        image_file: File | null;
        sort_order: number;
        is_active: boolean;
    }>({
        image: '',
        image_file: null,
        sort_order: 0,
        is_active: true,
    });

    const openEditModal = (item: HelixGalleryItem) => {
        setEditingItem(item);
        editForm.setData({
            image: item.image || '',
            image_file: null,
            sort_order: item.sort_order ?? 0,
            is_active: item.is_active ?? true,
        });
    };

    const handleSaveSettings = (e: React.FormEvent) => {
        e.preventDefault();
        settingsForm.post('/dashboard/helix-gallery/settings', {
            preserveScroll: true,
            onSuccess: () => {
                toast.success(
                    'Pengaturan rotasi dan grid helix 3D berhasil disimpan!',
                );
            },
            onError: (err) => {
                toast.error(
                    'Gagal menyimpan pengaturan: ' + Object.values(err)[0],
                );
            },
        });
    };

    const handleCreateItem = (e: React.FormEvent) => {
        e.preventDefault();
        createForm.post('/dashboard/helix-gallery/items', {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Gambar baru berhasil ditambahkan ke galeri 3D!');
                setIsCreateOpen(false);
                createForm.reset();
            },
            onError: (err) => {
                toast.error('Gagal menambah gambar: ' + Object.values(err)[0]);
            },
        });
    };

    const handleUpdateItem = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingItem) return;

        editForm.post(`/dashboard/helix-gallery/items/${editingItem.id}`, {
            forceFormData: true,
            preserveScroll: true,
            headers: {
                'X-HTTP-Method-Override': 'PUT',
            },
            onSuccess: () => {
                toast.success('Gambar galeri berhasil diperbarui!');
                setEditingItem(null);
            },
            onError: (err) => {
                toast.error(
                    'Gagal memperbarui gambar: ' + Object.values(err)[0],
                );
            },
        });
    };

    const handleDeleteItem = () => {
        if (!deletingItem) return;

        router.delete(`/dashboard/helix-gallery/items/${deletingItem.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Gambar galeri berhasil dihapus.');
                setDeletingItem(null);
            },
            onError: () => {
                toast.error('Gagal menghapus gambar galeri.');
            },
        });
    };

    const handleResetDefaults = () => {
        if (
            !confirm(
                'Apakah Anda yakin ingin mereset daftar gambar galeri ke konfigurasi default?',
            )
        ) {
            return;
        }

        router.post(
            '/dashboard/helix-gallery/reset',
            {},
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Daftar gambar galeri berhasil direset.');
                },
            },
        );
    };

    const filteredItems = initialItems.filter((item, index) => {
        if (!searchTerm) return true;
        const query = searchTerm.toLowerCase();
        const label = `gambar ${index + 1}`.toLowerCase();
        const imgName = (item.image || '').toLowerCase();
        return label.includes(query) || imgName.includes(query);
    });

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Dashboard', href: '/dashboard' },
                { title: 'Galeri 3D Helix', href: '/dashboard/helix-gallery' },
            ]}
        >
            <Head title="Pengaturan Galeri 3D Helix - Sanubari Admin" />

            <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 p-4 sm:p-6">
                {/* Header Section */}
                <div className="flex flex-col justify-between gap-4 border-b border-neutral-200 pb-5 sm:flex-row sm:items-center dark:border-neutral-800">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-copper/15 text-accent-copper">
                                <Layers className="h-4 w-4" />
                            </div>
                            <h1 className="text-xl font-bold tracking-tight text-neutral-900 sm:text-2xl dark:text-neutral-100">
                                Pengaturan Galeri 3D Helix
                            </h1>
                        </div>
                        <p className="max-w-2xl text-xs text-neutral-500 sm:text-sm">
                            Kelola formasi grid gambar menyamping, kecepatan
                            rotasi otomatis 360°, serta unggah foto gambar pada
                            pita spiral 3D di halaman beranda.
                        </p>
                    </div>

                    <div className="flex items-center gap-2.5">
                        <a
                            href="/#helix-showcase"
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 rounded-xl bg-neutral-100 px-3 py-2 text-xs font-semibold text-neutral-800 transition-colors hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700"
                        >
                            <ExternalLink className="h-3.5 w-3.5 text-accent-copper" />
                            <span>Lihat di Halaman Utama</span>
                        </a>

                        <button
                            type="button"
                            onClick={() => setIsCreateOpen(true)}
                            className="inline-flex items-center gap-1.5 rounded-xl bg-accent-copper px-4 py-2 text-xs font-bold text-white shadow-sm transition-all hover:bg-accent-copper/90 active:scale-95"
                        >
                            <Plus className="h-4 w-4" />
                            <span>Upload Gambar Baru</span>
                        </button>
                    </div>
                </div>

                {/* Form Pengaturan 3D Helix (Rotasi & Grid) */}
                <form
                    onSubmit={handleSaveSettings}
                    className="space-y-5 rounded-2xl border border-neutral-200 bg-white p-5 shadow-xs sm:p-6 dark:border-neutral-800 dark:bg-neutral-900"
                >
                    <div className="flex flex-col justify-between gap-3 border-b border-neutral-100 pb-4 sm:flex-row sm:items-center dark:border-neutral-800">
                        <div className="flex items-center gap-2.5">
                            <div className="rounded-xl bg-accent-copper/10 p-2 text-accent-copper">
                                <SlidersHorizontal className="h-4 w-4" />
                            </div>
                            <div>
                                <h2 className="text-sm font-bold text-neutral-900 sm:text-base dark:text-neutral-100">
                                    Aturan Grid & Rotasi 3D Helix
                                </h2>
                                <p className="text-xs text-neutral-500">
                                    Kontrol visual bentuk pita spiral, rotasi
                                    otomatis, dan kepadatan gambar.
                                </p>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={settingsForm.processing}
                            className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-neutral-900 px-4 py-2 text-xs font-bold text-white shadow-sm transition-all hover:bg-neutral-800 active:scale-95 disabled:opacity-50 dark:bg-neutral-100 dark:text-neutral-950 dark:hover:bg-neutral-200"
                        >
                            <Check className="h-3.5 w-3.5" />
                            <span>
                                {settingsForm.processing
                                    ? 'Menyimpan...'
                                    : 'Simpan Aturan Grid'}
                            </span>
                        </button>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        {/* Auto-Rotate Toggle */}
                        <div className="space-y-1.5 rounded-xl border border-neutral-100 bg-neutral-50 p-3.5 dark:border-neutral-800 dark:bg-neutral-800/40">
                            <label className="flex cursor-pointer items-center justify-between text-xs font-bold text-neutral-800 dark:text-neutral-200">
                                <span>Rotasi Otomatis 360°</span>
                                <input
                                    type="checkbox"
                                    checked={settingsForm.data.auto_rotate}
                                    onChange={(e) =>
                                        settingsForm.setData(
                                            'auto_rotate',
                                            e.target.checked,
                                        )
                                    }
                                    className="h-4 w-4 rounded accent-accent-copper"
                                />
                            </label>
                            <p className="text-[11px] text-neutral-500">
                                Helix berputar lambat saat tidak disentuh
                                pengguna.
                            </p>
                        </div>

                        {/* Rotation Speed */}
                        <div className="space-y-1.5 rounded-xl border border-neutral-100 bg-neutral-50 p-3.5 dark:border-neutral-800 dark:bg-neutral-800/40">
                            <label className="block text-xs font-bold text-neutral-800 dark:text-neutral-200">
                                Kecepatan Rotasi
                            </label>
                            <select
                                value={String(
                                    settingsForm.data.auto_rotate_speed,
                                )}
                                onChange={(e) =>
                                    settingsForm.setData(
                                        'auto_rotate_speed',
                                        parseFloat(e.target.value),
                                    )
                                }
                                className="w-full rounded-lg border border-neutral-300 bg-white px-2.5 py-1.5 text-xs text-neutral-900 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
                            >
                                <option value="0.08">
                                    Sangat Lambat (0.08)
                                </option>
                                <option value="0.15">
                                    Lambat Rileks (0.15)
                                </option>
                                <option value="0.20">
                                    Standar Rekomendasi (0.20)
                                </option>
                                <option value="0.30">
                                    Sedang Dinamis (0.30)
                                </option>
                                <option value="0.45">Cepat (0.45)</option>
                            </select>
                            <p className="text-[11px] text-neutral-500">
                                Kecepatan putaran saat mode auto-rotate aktif.
                            </p>
                        </div>

                        {/* Visible Columns Grid */}
                        <div className="space-y-1.5 rounded-xl border border-neutral-100 bg-neutral-50 p-3.5 dark:border-neutral-800 dark:bg-neutral-800/40">
                            <label className="block text-xs font-bold text-neutral-800 dark:text-neutral-200">
                                Gambar Menyamping (Kolom)
                            </label>
                            <select
                                value={String(
                                    settingsForm.data.visible_columns,
                                )}
                                onChange={(e) =>
                                    settingsForm.setData(
                                        'visible_columns',
                                        parseInt(e.target.value, 10),
                                    )
                                }
                                className="w-full rounded-lg border border-neutral-300 bg-white px-2.5 py-1.5 text-xs text-neutral-900 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
                            >
                                <option value="3">
                                    3 Gambar Menyamping (Besar)
                                </option>
                                <option value="4">
                                    4 Gambar Menyamping (Sedang)
                                </option>
                                <option value="5">
                                    5 Gambar Menyamping (Standar Ramping)
                                </option>
                                <option value="6">
                                    6 Gambar Menyamping (Padat)
                                </option>
                            </select>
                            <p className="text-[11px] text-neutral-500">
                                Formasi jumlah foto di sisi depan 3D.
                            </p>
                        </div>

                        {/* Tiers Count */}
                        <div className="space-y-1.5 rounded-xl border border-neutral-100 bg-neutral-50 p-3.5 dark:border-neutral-800 dark:bg-neutral-800/40">
                            <label className="block text-xs font-bold text-neutral-800 dark:text-neutral-200">
                                Formasi Baris Bertingkat
                            </label>
                            <select
                                value={String(settingsForm.data.tiers_count)}
                                onChange={(e) =>
                                    settingsForm.setData(
                                        'tiers_count',
                                        parseInt(e.target.value, 10),
                                    )
                                }
                                className="w-full rounded-lg border border-neutral-300 bg-white px-2.5 py-1.5 text-xs text-neutral-900 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
                            >
                                <option value="1">1 Baris Tunggal</option>
                                <option value="2">
                                    2 Baris Bertingkat (Rekomendasi)
                                </option>
                                <option value="3">3 Baris Bertingkat</option>
                            </select>
                            <p className="text-[11px] text-neutral-500">
                                Jumlah susunan baris spiral ke bawah.
                            </p>
                        </div>
                    </div>

                    {/* Header Display Toggle */}
                    <div className="bg-sand-50 flex flex-col justify-between gap-3 rounded-xl border border-sand-200/70 p-3.5 pt-2 text-xs sm:flex-row sm:items-center dark:border-neutral-800 dark:bg-neutral-800/30">
                        <div className="flex items-center gap-2">
                            <input
                                id="toggle_show_header"
                                type="checkbox"
                                checked={settingsForm.data.show_header}
                                onChange={(e) =>
                                    settingsForm.setData(
                                        'show_header',
                                        e.target.checked,
                                    )
                                }
                                className="h-4 w-4 rounded accent-accent-copper"
                            />
                            <label
                                htmlFor="toggle_show_header"
                                className="cursor-pointer font-semibold text-neutral-800 dark:text-neutral-200"
                            >
                                Tampilkan Teks Header (Judul & Badge) di Atas
                                Galeri
                            </label>
                        </div>
                        <span className="text-[11px] text-neutral-500">
                            {settingsForm.data.show_header
                                ? 'Status: Header ditampilkan'
                                : 'Status: Header disembunyikan (tampilan gambar melayang bersih)'}
                        </span>
                    </div>
                </form>

                {/* Table of Images */}
                <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-xs dark:border-neutral-800 dark:bg-neutral-900">
                    {/* Action Bar */}
                    <div className="flex flex-col justify-between gap-3 border-b border-neutral-200 p-4 sm:flex-row sm:items-center sm:p-5 dark:border-neutral-800">
                        <div className="flex items-center gap-3">
                            <h2 className="text-sm font-bold text-neutral-900 sm:text-base dark:text-neutral-100">
                                Daftar Gambar Galeri ({filteredItems.length}{' '}
                                Gambar)
                            </h2>
                            <button
                                type="button"
                                onClick={handleResetDefaults}
                                className="flex items-center gap-1 text-xs font-medium text-neutral-500 underline hover:text-accent-copper"
                                title="Reset kembali ke susunan gambar default"
                            >
                                <RotateCcw className="h-3 w-3" />
                                <span>Reset Default</span>
                            </button>
                        </div>

                        <div className="relative w-full sm:w-72">
                            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                            <input
                                type="text"
                                placeholder="Cari nomor gambar atau URL..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full rounded-xl border border-neutral-200 bg-neutral-50 py-2 pr-4 pl-9 text-xs text-neutral-900 placeholder:text-neutral-400 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
                            />
                        </div>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="border-b border-neutral-200 bg-neutral-50 font-semibold text-neutral-600 dark:border-neutral-800 dark:bg-neutral-800/60 dark:text-neutral-400">
                                <tr>
                                    <th className="w-14 px-4 py-3 text-center">
                                        No
                                    </th>
                                    <th className="w-28 px-4 py-3">
                                        Preview Gambar
                                    </th>
                                    <th className="px-4 py-3">Tipe Gambar</th>
                                    <th className="w-24 px-4 py-3 text-center">
                                        Urutan
                                    </th>
                                    <th className="w-24 px-4 py-3 text-center">
                                        Status
                                    </th>
                                    <th className="w-28 px-4 py-3 text-center">
                                        Aksi
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                                {filteredItems.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={6}
                                            className="py-10 text-center text-neutral-400"
                                        >
                                            Tidak ada gambar yang cocok dengan
                                            pencarian.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredItems.map((item, index) => (
                                        <tr
                                            key={item.id}
                                            className="transition-colors hover:bg-neutral-50/60 dark:hover:bg-neutral-800/30"
                                        >
                                            <td className="px-4 py-3 text-center font-mono text-neutral-400">
                                                {index + 1}
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="relative flex h-12 w-16 items-center justify-center overflow-hidden rounded-lg border border-neutral-200 bg-neutral-100 shadow-xs dark:border-neutral-700 dark:bg-neutral-800">
                                                    {item.image ? (
                                                        <img
                                                            src={item.image}
                                                            alt="Foto Galeri"
                                                            className="h-full w-full cursor-pointer object-cover transition-transform hover:scale-105"
                                                            onClick={() =>
                                                                setPreviewImage(
                                                                    item.image ||
                                                                        null,
                                                                )
                                                            }
                                                        />
                                                    ) : (
                                                        <span className="p-1 text-center text-[9px] leading-tight font-bold tracking-wider text-accent-copper uppercase">
                                                            Procedural Art
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                {item.image ? (
                                                    <div className="space-y-0.5">
                                                        <span className="inline-flex items-center gap-1 rounded-full border border-accent-copper/20 bg-accent-copper/15 px-2 py-0.5 text-[10px] font-bold text-accent-copper">
                                                            Foto Terunggah
                                                        </span>
                                                        <div className="max-w-xs truncate font-mono text-[11px] text-neutral-500">
                                                            {item.image}
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <span className="text-[11px] text-neutral-500">
                                                        Procedural Landscape
                                                        (Default Three.js)
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-center font-mono text-neutral-700 dark:text-neutral-300">
                                                {item.sort_order ?? index + 1}
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <span
                                                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold ${
                                                        item.is_active !== false
                                                            ? 'border border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400'
                                                            : 'border border-neutral-200 bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400'
                                                    }`}
                                                >
                                                    {item.is_active !== false
                                                        ? 'Aktif'
                                                        : 'Nonaktif'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <div className="flex items-center justify-center gap-1.5">
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            openEditModal(item)
                                                        }
                                                        className="rounded-lg bg-neutral-100 p-1.5 text-neutral-700 transition-colors hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
                                                        title="Edit Gambar"
                                                    >
                                                        <Edit2 className="h-3.5 w-3.5" />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            setDeletingItem(
                                                                item,
                                                            )
                                                        }
                                                        className="rounded-lg bg-red-50 p-1.5 text-red-600 transition-colors hover:bg-red-100 dark:bg-red-950/30 dark:text-red-400 dark:hover:bg-red-950/60"
                                                        title="Hapus Gambar"
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Modal Upload Gambar Baru */}
            {isCreateOpen && (
                <div className="fixed inset-0 z-50 flex animate-in items-center justify-center bg-black/60 p-4 backdrop-blur-xs duration-150 fade-in">
                    <div className="relative flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-2xl dark:border-neutral-800 dark:bg-neutral-900">
                        <div className="flex items-center justify-between border-b border-neutral-100 px-6 py-4 dark:border-neutral-800">
                            <div>
                                <h3 className="text-sm font-bold text-neutral-900 sm:text-base dark:text-neutral-100">
                                    Upload Gambar ke Galeri 3D Helix
                                </h3>
                                <p className="text-[11px] text-neutral-500">
                                    Unggah foto rasio 4:3 untuk ditampilkan di
                                    lintasan spiral 3D.
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsCreateOpen(false)}
                                className="rounded-full p-1.5 text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        <form
                            onSubmit={handleCreateItem}
                            className="space-y-4 overflow-y-auto p-6 text-xs"
                        >
                            <div>
                                <label className="mb-1 block font-bold">
                                    Unggah Foto / Gambar (Rasio 4:3)
                                </label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) =>
                                        createForm.setData(
                                            'image_file',
                                            e.target.files?.[0] || null,
                                        )
                                    }
                                    className="w-full rounded-xl border border-neutral-300 bg-neutral-50 px-3 py-2 file:mr-3 file:rounded-lg file:border-0 file:bg-accent-copper file:px-2.5 file:py-1 file:text-xs file:font-semibold file:text-white dark:border-neutral-700 dark:bg-neutral-800"
                                />
                                <span className="mt-1 block text-[10px] text-neutral-400">
                                    Format JPG, PNG, atau WebP. Maksimal 5MB.
                                </span>
                            </div>

                            <div>
                                <label className="mb-1 block font-bold">
                                    Atau Masukkan URL Gambar (Opsional)
                                </label>
                                <input
                                    type="text"
                                    placeholder="https://... atau kosongkan jika mengunggah file di atas"
                                    value={createForm.data.image}
                                    onChange={(e) =>
                                        createForm.setData(
                                            'image',
                                            e.target.value,
                                        )
                                    }
                                    className="w-full rounded-xl border border-neutral-300 bg-neutral-50 px-3 py-2 dark:border-neutral-700 dark:bg-neutral-800"
                                />
                            </div>

                            <div className="grid grid-cols-1 gap-3 pt-1 sm:grid-cols-2">
                                <div>
                                    <label className="mb-1 block font-bold">
                                        Urutan Tampil
                                    </label>
                                    <input
                                        type="number"
                                        value={createForm.data.sort_order}
                                        onChange={(e) =>
                                            createForm.setData(
                                                'sort_order',
                                                parseInt(e.target.value, 10) ||
                                                    0,
                                            )
                                        }
                                        className="w-full rounded-xl border border-neutral-300 bg-neutral-50 px-3 py-2 dark:border-neutral-700 dark:bg-neutral-800"
                                    />
                                </div>
                                <div className="flex items-center pt-5">
                                    <label className="flex cursor-pointer items-center gap-2 font-semibold">
                                        <input
                                            type="checkbox"
                                            checked={createForm.data.is_active}
                                            onChange={(e) =>
                                                createForm.setData(
                                                    'is_active',
                                                    e.target.checked,
                                                )
                                            }
                                            className="h-4 w-4 rounded accent-accent-copper"
                                        />
                                        <span>Tampilkan di Galeri</span>
                                    </label>
                                </div>
                            </div>

                            <div className="flex items-center justify-end gap-2 border-t border-neutral-100 pt-4 dark:border-neutral-800">
                                <button
                                    type="button"
                                    onClick={() => setIsCreateOpen(false)}
                                    className="rounded-xl bg-neutral-100 px-4 py-2 font-semibold text-neutral-700 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={createForm.processing}
                                    className="rounded-xl bg-accent-copper px-5 py-2 font-bold text-white shadow-sm hover:bg-accent-copper/90 disabled:opacity-50"
                                >
                                    {createForm.processing
                                        ? 'Menyimpan...'
                                        : 'Upload & Simpan'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Edit Gambar */}
            {editingItem && (
                <div className="fixed inset-0 z-50 flex animate-in items-center justify-center bg-black/60 p-4 backdrop-blur-xs duration-150 fade-in">
                    <div className="relative flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-2xl dark:border-neutral-800 dark:bg-neutral-900">
                        <div className="flex items-center justify-between border-b border-neutral-100 px-6 py-4 dark:border-neutral-800">
                            <div>
                                <h3 className="text-sm font-bold text-neutral-900 sm:text-base dark:text-neutral-100">
                                    Edit Gambar Galeri 3D
                                </h3>
                                <p className="text-[11px] text-neutral-500">
                                    Ganti foto atau perbarui urutan tampil pada
                                    formasi helix.
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setEditingItem(null)}
                                className="rounded-full p-1.5 text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        <form
                            onSubmit={handleUpdateItem}
                            className="space-y-4 overflow-y-auto p-6 text-xs"
                        >
                            {editingItem.image && (
                                <div>
                                    <label className="mb-1 block font-bold">
                                        Foto Saat Ini
                                    </label>
                                    <div className="h-20 w-28 overflow-hidden rounded-xl border border-neutral-200 bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-800">
                                        <img
                                            src={editingItem.image}
                                            alt="Foto saat ini"
                                            className="h-full w-full object-cover"
                                        />
                                    </div>
                                </div>
                            )}

                            <div>
                                <label className="mb-1 block font-bold">
                                    Ganti Foto / Gambar (Rasio 4:3)
                                </label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) =>
                                        editForm.setData(
                                            'image_file',
                                            e.target.files?.[0] || null,
                                        )
                                    }
                                    className="w-full rounded-xl border border-neutral-300 bg-neutral-50 px-3 py-2 file:mr-3 file:rounded-lg file:border-0 file:bg-accent-copper file:px-2.5 file:py-1 file:text-xs file:font-semibold file:text-white dark:border-neutral-700 dark:bg-neutral-800"
                                />
                            </div>

                            <div>
                                <label className="mb-1 block font-bold">
                                    Atau URL Gambar Eksternal
                                </label>
                                <input
                                    type="text"
                                    value={editForm.data.image}
                                    onChange={(e) =>
                                        editForm.setData(
                                            'image',
                                            e.target.value,
                                        )
                                    }
                                    className="w-full rounded-xl border border-neutral-300 bg-neutral-50 px-3 py-2 dark:border-neutral-700 dark:bg-neutral-800"
                                />
                            </div>

                            <div className="grid grid-cols-1 gap-3 pt-1 sm:grid-cols-2">
                                <div>
                                    <label className="mb-1 block font-bold">
                                        Urutan Tampil
                                    </label>
                                    <input
                                        type="number"
                                        value={editForm.data.sort_order}
                                        onChange={(e) =>
                                            editForm.setData(
                                                'sort_order',
                                                parseInt(e.target.value, 10) ||
                                                    0,
                                            )
                                        }
                                        className="w-full rounded-xl border border-neutral-300 bg-neutral-50 px-3 py-2 dark:border-neutral-700 dark:bg-neutral-800"
                                    />
                                </div>
                                <div className="flex items-center pt-5">
                                    <label className="flex cursor-pointer items-center gap-2 font-semibold">
                                        <input
                                            type="checkbox"
                                            checked={editForm.data.is_active}
                                            onChange={(e) =>
                                                editForm.setData(
                                                    'is_active',
                                                    e.target.checked,
                                                )
                                            }
                                            className="h-4 w-4 rounded accent-accent-copper"
                                        />
                                        <span>Tampilkan di Galeri</span>
                                    </label>
                                </div>
                            </div>

                            <div className="flex items-center justify-end gap-2 border-t border-neutral-100 pt-4 dark:border-neutral-800">
                                <button
                                    type="button"
                                    onClick={() => setEditingItem(null)}
                                    className="rounded-xl bg-neutral-100 px-4 py-2 font-semibold text-neutral-700 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={editForm.processing}
                                    className="rounded-xl bg-accent-copper px-5 py-2 font-bold text-white shadow-sm hover:bg-accent-copper/90 disabled:opacity-50"
                                >
                                    {editForm.processing
                                        ? 'Menyimpan...'
                                        : 'Perbarui Gambar'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Hapus Gambar */}
            {deletingItem && (
                <div className="fixed inset-0 z-50 flex animate-in items-center justify-center bg-black/60 p-4 backdrop-blur-xs duration-150 fade-in">
                    <div className="relative w-full max-w-md space-y-4 rounded-3xl border border-neutral-200 bg-white p-6 shadow-2xl dark:border-neutral-800 dark:bg-neutral-900">
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-red-100 text-red-600 dark:bg-red-950/50 dark:text-red-400">
                            <Trash2 className="h-6 w-6" />
                        </div>
                        <div className="space-y-1.5 text-center">
                            <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
                                Hapus Gambar dari Galeri?
                            </h3>
                            <p className="text-xs leading-relaxed text-neutral-500">
                                Apakah Anda yakin ingin menghapus gambar ini
                                dari galeri 3D helix?
                            </p>
                        </div>
                        <div className="flex items-center gap-3 pt-2">
                            <button
                                type="button"
                                onClick={() => setDeletingItem(null)}
                                className="flex-1 rounded-xl bg-neutral-100 py-2.5 text-xs font-semibold text-neutral-700 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300"
                            >
                                Batal
                            </button>
                            <button
                                type="button"
                                onClick={handleDeleteItem}
                                className="flex-1 rounded-xl bg-red-600 py-2.5 text-xs font-bold text-white shadow-sm transition-all hover:bg-red-700"
                            >
                                Ya, Hapus
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Preview Gambar */}
            {previewImage && (
                <div
                    className="fixed inset-0 z-50 flex cursor-pointer items-center justify-center bg-black/80 p-4 backdrop-blur-md"
                    onClick={() => setPreviewImage(null)}
                >
                    <div className="relative max-h-[85vh] max-w-3xl overflow-hidden rounded-2xl border border-white/20 shadow-2xl">
                        <img
                            src={previewImage}
                            alt="Preview"
                            className="h-full w-full object-contain"
                        />
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
