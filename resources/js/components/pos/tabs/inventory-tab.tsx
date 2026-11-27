import React from 'react';
import { Package, RefreshCw, AlertTriangle, CheckCircle2, Boxes, Store } from 'lucide-react';
import { Product } from '@/types/pos';

interface InventoryTabProps {
    isActive: boolean;
    inventorySearch: string;
    setInventorySearch: (val: string) => void;
    inventoryFilter: 'all' | 'in_stock' | 'low_stock' | 'out_of_stock';
    setInventoryFilter: (val: 'all' | 'in_stock' | 'low_stock' | 'out_of_stock') => void;
    filteredInventory: Product[];
    allProducts?: Product[];
    formatRp: (val: number) => string;
    onSyncStock?: () => void;
    isSyncingStock?: boolean;
    lastStockSync?: string;
}

export const InventoryTab: React.FC<InventoryTabProps> = ({
    isActive,
    inventorySearch,
    setInventorySearch,
    inventoryFilter,
    setInventoryFilter,
    filteredInventory,
    allProducts = [],
    formatRp,
    onSyncStock,
    isSyncingStock = false,
    lastStockSync,
}) => {
    if (!isActive) return null;

    const sourceProducts = allProducts.length > 0 ? allProducts : filteredInventory;

    // Calculate real inventory metrics
    const totalProducts = sourceProducts.length;
    const totalPhysicalUnits = sourceProducts.reduce((sum, p) => sum + (Number(p.stock) || 0), 0);
    const safeStockCount = sourceProducts.filter((p) => (Number(p.stock) || 0) > 10 && !p.is_out_of_stock).length;
    const lowStockCount = sourceProducts.filter((p) => (Number(p.stock) || 0) > 0 && (Number(p.stock) || 0) <= 10 && !p.is_out_of_stock).length;
    const outOfStockCount = sourceProducts.filter((p) => (Number(p.stock) || 0) <= 0 || p.is_out_of_stock).length;

    const formattedSyncTime = lastStockSync
        ? new Date(lastStockSync).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
        : 'Real-time';

    return (
        <div className="mx-auto w-full max-w-6xl flex-1 space-y-4 overflow-y-auto bg-[#f4f6f6] p-4 sm:p-6 dark:bg-stone-950">
            {/* Header & Sync Controls */}
            <div className="flex flex-col justify-between gap-3 border-b border-stone-200 pb-4 sm:flex-row sm:items-center dark:border-stone-800">
                <div>
                    <h2 className="flex items-center gap-2 text-lg font-bold text-brand-950 dark:text-white">
                        <Package className="h-5 w-5 text-brand-700 dark:text-emerald-400" />
                        <span>Inventori & Real Stok POS</span>
                    </h2>
                    <p className="mt-0.5 text-xs text-stone-500 dark:text-stone-300 flex items-center gap-1.5">
                        <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span>Tersinkronisasi otomatis dengan Website & Marketplace Alat Kopi Malang</span>
                        <span className="text-stone-300 dark:text-stone-700">•</span>
                        <span>Update: {formattedSyncTime}</span>
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    {onSyncStock && (
                        <button
                            type="button"
                            onClick={onSyncStock}
                            disabled={isSyncingStock}
                            className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-stone-200 bg-white px-3.5 py-2 text-xs font-bold text-stone-800 shadow-2xs transition hover:border-brand-500 hover:bg-stone-50 disabled:opacity-60 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-100 dark:hover:bg-stone-700"
                            title="Tarik data stok fisik terbaru dari server website"
                        >
                            <RefreshCw className={`h-3.5 w-3.5 text-brand-600 dark:text-emerald-400 ${isSyncingStock ? 'animate-spin' : ''}`} />
                            <span>{isSyncingStock ? 'Sinkronisasi...' : 'Sinkronkan Stok Sekarang'}</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Inventory KPI Summary Cards */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="rounded-2xl border border-stone-200/90 bg-white p-3.5 shadow-2xs dark:border-stone-800 dark:bg-stone-900">
                    <div className="flex items-center justify-between text-stone-500 dark:text-stone-400">
                        <span className="text-[11px] font-semibold uppercase tracking-wider">Total Produk</span>
                        <Store className="h-4 w-4 text-brand-600 dark:text-emerald-400" />
                    </div>
                    <div className="mt-2 text-xl font-black text-stone-900 dark:text-white">
                        {totalProducts}
                        <span className="ml-1 text-xs font-semibold text-stone-500">item</span>
                    </div>
                    <p className="mt-0.5 text-[10px] text-stone-400">Katalog aktif di kasir POS</p>
                </div>

                <div className="rounded-2xl border border-emerald-200/80 bg-emerald-50/50 p-3.5 shadow-2xs dark:border-emerald-900/60 dark:bg-emerald-950/30">
                    <div className="flex items-center justify-between text-emerald-800 dark:text-emerald-400">
                        <span className="text-[11px] font-semibold uppercase tracking-wider">Total Stok Fisik (Real)</span>
                        <Boxes className="h-4 w-4" />
                    </div>
                    <div className="mt-2 text-xl font-black text-emerald-900 dark:text-emerald-300">
                        {totalPhysicalUnits.toLocaleString('id-ID')}
                        <span className="ml-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400">pcs</span>
                    </div>
                    <p className="mt-0.5 text-[10px] text-emerald-700/80 dark:text-emerald-400/80">Total unit siap dijual</p>
                </div>

                <div className="rounded-2xl border border-stone-200/90 bg-white p-3.5 shadow-2xs dark:border-stone-800 dark:bg-stone-900">
                    <div className="flex items-center justify-between text-stone-500 dark:text-stone-400">
                        <span className="text-[11px] font-semibold uppercase tracking-wider">Stok Aman</span>
                        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    </div>
                    <div className="mt-2 text-xl font-black text-emerald-600 dark:text-emerald-400">
                        {safeStockCount}
                        <span className="ml-1 text-xs font-semibold text-stone-500">produk</span>
                    </div>
                    <p className="mt-0.5 text-[10px] text-stone-400">Stok di atas 10 pcs</p>
                </div>

                <div className="rounded-2xl border border-stone-200/90 bg-white p-3.5 shadow-2xs dark:border-stone-800 dark:bg-stone-900">
                    <div className="flex items-center justify-between text-stone-500 dark:text-stone-400">
                        <span className="text-[11px] font-semibold uppercase tracking-wider">Perlu Restock</span>
                        <AlertTriangle className="h-4 w-4 text-amber-500" />
                    </div>
                    <div className="mt-2 text-xl font-black text-rose-600 dark:text-rose-400">
                        {outOfStockCount + lowStockCount}
                        <span className="ml-1 text-xs font-semibold text-stone-500">
                            ({lowStockCount} tipis / {outOfStockCount} habis)
                        </span>
                    </div>
                    <p className="mt-0.5 text-[10px] text-stone-400">Stok 10 pcs ke bawah atau kosong</p>
                </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between rounded-xl bg-white p-2.5 shadow-2xs border border-stone-200/80 dark:border-stone-800 dark:bg-stone-900">
                <div className="flex flex-1 items-center gap-2">
                    <input
                        type="text"
                        value={inventorySearch}
                        onChange={(e) => setInventorySearch(e.target.value)}
                        placeholder="Cari nama kopi / SKU / varian..."
                        className="w-full rounded-lg border border-stone-200 bg-stone-50/80 px-3 py-1.5 text-xs text-stone-900 outline-none focus:border-brand-600 focus:bg-white dark:border-stone-700 dark:bg-stone-800 dark:text-white"
                    />
                </div>

                <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-stone-500 dark:text-stone-400 shrink-0">Filter:</span>
                    <select
                        value={inventoryFilter}
                        onChange={(e) => setInventoryFilter(e.target.value as any)}
                        className="rounded-lg border border-stone-200 bg-stone-50/80 px-3 py-1.5 text-xs font-bold text-stone-800 outline-none focus:border-brand-600 dark:border-stone-700 dark:bg-stone-800 dark:text-white cursor-pointer"
                    >
                        <option value="all">Semua Stok ({sourceProducts.length})</option>
                        <option value="in_stock">Stok Aman (&gt; 10 pcs)</option>
                        <option value="low_stock">Stok Menipis (1 - 10 pcs)</option>
                        <option value="out_of_stock">Stok Habis (0 pcs)</option>
                    </select>
                </div>
            </div>

            {/* Product Cards Grid */}
            <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
                {filteredInventory.map((p) => {
                    const variantRows =
                        Array.isArray(p.variants) && p.variants.length > 0
                            ? p.variants
                            : [
                                  {
                                      id: 0,
                                      label: 'Standar',
                                      price: Number(p.min_price) || 0,
                                      original_price: null,
                                      cost_price: 0,
                                      weight_grams: 0,
                                      sku: null,
                                      stock: Number(p.stock ?? 0),
                                      stock_status: p.stock_status,
                                  },
                              ];

                    const totalRealStock = Number(p.stock ?? 0);
                    const isTotalOutOfStock = totalRealStock <= 0 || p.is_out_of_stock;
                    const isTotalLowStock = totalRealStock > 0 && totalRealStock <= 10;

                    return (
                        <div
                            key={p.id}
                            className="flex flex-col justify-between rounded-2xl border border-stone-200/90 bg-white p-3.5 text-xs shadow-2xs hover:border-brand-500/50 transition-all dark:border-stone-800 dark:bg-stone-900"
                        >
                            {/* Product Header */}
                            <div>
                                <div className="flex gap-3">
                                    <img
                                        src={p.image || '/brand/logo-circle.png'}
                                        alt={p.name}
                                        onError={(e) => {
                                            const target = e.currentTarget;
                                            if (!target.src.endsWith('/brand/logo-circle.png')) {
                                                target.src = '/brand/logo-circle.png';
                                            }
                                        }}
                                        className="h-14 w-14 shrink-0 rounded-xl border border-stone-100 bg-stone-50 object-cover dark:border-stone-700 dark:bg-stone-800"
                                    />
                                    <div className="flex min-w-0 flex-1 flex-col justify-between">
                                        <div>
                                            <div
                                                className="truncate font-bold text-stone-900 dark:text-white text-sm"
                                                title={p.name}
                                            >
                                                {p.name}
                                            </div>
                                            <div className="mt-0.5 text-[11px] font-bold text-brand-700 dark:text-emerald-400">
                                                Rp{' '}
                                                {formatRp(
                                                    p.min_price ||
                                                        (p.variants?.length
                                                            ? Math.min(...p.variants.map((v: any) => v.price))
                                                            : 0),
                                                )}{' '}
                                                {(p.variants?.length || 0) > 1 &&
                                                    `s/d Rp ${formatRp(
                                                        p.max_price ||
                                                            (p.variants?.length
                                                                ? Math.max(...p.variants.map((v: any) => v.price))
                                                                : p.min_price) ||
                                                            0,
                                                    )}`}
                                            </div>
                                        </div>

                                        <div className="mt-1 flex items-center justify-between gap-1">
                                            <span className="text-[10px] font-medium text-stone-500 dark:text-stone-400">
                                                {p.variants?.length || 1} Varian
                                            </span>

                                            {/* Real Total Stock Badge */}
                                            <span
                                                className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold tracking-wide ${
                                                    isTotalOutOfStock
                                                        ? 'border border-rose-300 bg-rose-50 text-rose-700 dark:border-rose-900 dark:bg-rose-950/80 dark:text-rose-300'
                                                        : isTotalLowStock
                                                        ? 'border border-amber-300 bg-amber-50 text-amber-800 dark:border-amber-900 dark:bg-amber-950/80 dark:text-amber-300'
                                                        : 'border border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300'
                                                }`}
                                            >
                                                {isTotalOutOfStock ? 'Habis (0 pcs)' : `Real Stok: ${totalRealStock} pcs`}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Per-Variant Real Stock, HPP, Harga Jual Breakdown Table */}
                                <div className="mt-3 overflow-hidden rounded-xl border border-stone-100 bg-stone-50/70 dark:border-stone-800 dark:bg-stone-950/60">
                                    <div className="grid grid-cols-12 border-b border-stone-200/70 bg-stone-100/90 px-2 py-1.5 text-[10px] font-bold tracking-wider text-stone-600 uppercase dark:border-stone-800 dark:bg-stone-900 dark:text-stone-300">
                                        <div className="col-span-3">Varian</div>
                                        <div className="col-span-3 text-center">Stok Real</div>
                                        <div className="col-span-2 text-right">HPP</div>
                                        <div className="col-span-2 text-right">Harga</div>
                                        <div className="col-span-2 text-right">Laba</div>
                                    </div>
                                    <div className="divide-y divide-stone-100 dark:divide-stone-800/80">
                                        {variantRows.map((v, vIdx) => {
                                            const hpp = Number(v.cost_price) || 0;
                                            const sellPrice = Number(v.price) || 0;
                                            const profit = sellPrice - hpp;
                                            const marginPct = sellPrice > 0 ? ((sellPrice - hpp) / sellPrice) * 100 : 0;
                                            const vStock = Number(v.stock ?? 0);
                                            const isVarOut = vStock <= 0 || v.stock_status === 'out_of_stock';
                                            const isVarLow = vStock > 0 && vStock <= 10;

                                            return (
                                                <div
                                                    key={v.id || vIdx}
                                                    className="grid grid-cols-12 items-center px-2 py-1.5 text-[11px]"
                                                >
                                                    <div className="col-span-3 flex items-center gap-1 pr-1 font-semibold text-stone-800 dark:text-stone-200">
                                                        <span
                                                            className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                                                                isVarOut
                                                                    ? 'bg-rose-500'
                                                                    : isVarLow
                                                                    ? 'bg-amber-500'
                                                                    : 'bg-emerald-500'
                                                            }`}
                                                            title={isVarOut ? 'Stok Habis' : `Stok: ${vStock} pcs`}
                                                        />
                                                        <span className="truncate" title={v.label}>
                                                            {v.label}
                                                        </span>
                                                    </div>

                                                    {/* Real Stock Column */}
                                                    <div className="col-span-3 text-center">
                                                        <span
                                                            className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-extrabold ${
                                                                isVarOut
                                                                    ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/80 dark:text-rose-300'
                                                                    : isVarLow
                                                                    ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300'
                                                                    : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300'
                                                            }`}
                                                        >
                                                            {vStock} pcs
                                                        </span>
                                                    </div>

                                                    <div className="col-span-2 text-right font-medium text-stone-500 dark:text-stone-400 text-[10px]">
                                                        {hpp > 0 ? `${Math.round(hpp / 1000)}k` : '—'}
                                                    </div>

                                                    <div className="col-span-2 text-right font-bold text-stone-900 dark:text-stone-100 text-[10px]">
                                                        {sellPrice > 0 ? `${Math.round(sellPrice / 1000)}k` : '0'}
                                                    </div>

                                                    <div className="col-span-2 text-right">
                                                        {hpp > 0 ? (
                                                            profit >= 0 ? (
                                                                <span className="font-extrabold text-[10px] text-emerald-700 dark:text-emerald-300">
                                                                    +{marginPct.toFixed(0)}%
                                                                </span>
                                                            ) : (
                                                                <span className="font-extrabold text-[10px] text-rose-700 dark:text-rose-300">
                                                                    {marginPct.toFixed(0)}%
                                                                </span>
                                                            )
                                                        ) : (
                                                            <span className="text-[10px] text-stone-400">—</span>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
