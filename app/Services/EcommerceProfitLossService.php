<?php

namespace App\Services;

use App\Models\MarketplaceProductMapping;
use App\Models\Order;
use App\Models\Product;
use App\Models\ProductVariant;
use Carbon\Carbon;
use Illuminate\Support\Collection;

class EcommerceProfitLossService
{
    /**
     * Persentase potongan otomatis biaya admin ecommerce dari penjualan.
     */
    public const ECOMMERCE_ADMIN_FEE_PCT = 15.0;

    /**
     * Hitung laporan laba rugi penjualan ecommerce berdasarkan standar produk website yang disinkronisasikan,
     * dikurangi potongan otomatis biaya admin ecommerce 15% pada laba kotor.
     *
     * @return array<string, mixed>
     */
    public static function getReport(Carbon $start, Carbon $end): array
    {
        // 1. Ambil pesanan ecommerce dalam rentang tanggal
        $ordersQuery = Order::query()
            ->ecommerceOnly()
            ->whereBetween('created_at', [$start, $end])
            ->where(function ($q) {
                $q->where('payment_status', 'paid')
                    ->orWhereIn('status', ['processing', 'ready_for_pickup', 'shipped', 'completed']);
            });

        /** @var Collection<int, Order> $orders */
        $orders = $ordersQuery->with([
            'items.variant',
            'items.product',
        ])->latest('created_at')->get();

        // 2. Preload active mappings untuk fallback lookup jika relasi variant belum terisi di order item
        $activeMappings = MarketplaceProductMapping::where('marketplace_status', 'ACTIVATE')
            ->with(['product', 'variant'])
            ->get();

        $totalTransactions = $orders->count();
        $totalUnitsSold = 0;
        $webGrossRevenue = 0.0;
        $webTotalCost = 0.0;
        $ecomActualRevenue = 0.0;
        $itemsWithHpp = 0;
        $itemsWithoutHpp = 0;

        $dailySummaryMap = [];
        $monthlySummaryMap = [];
        $transactionsList = [];
        $productBreakdowns = [];

        foreach ($orders as $order) {
            $orderWebRevenue = 0.0;
            $orderWebCost = 0.0;
            $orderItems = [];

            foreach ($order->items as $item) {
                $qty = max(1, (int) $item->quantity);

                // Cari data produk website (Product & ProductVariant)
                $variant = $item->variant;
                $product = $item->product;

                if (! $variant && ! $product) {
                    // Cari melalui mapping marketplace
                    $prodName = $item->product_name;
                    $varLabel = $item->variant_label;
                    $mapping = $activeMappings->first(function ($m) use ($prodName, $varLabel) {
                        return ($m->marketplace_product_name === $prodName && $m->marketplace_sku_name === $varLabel)
                            || ($m->marketplace_product_name === $prodName);
                    });

                    if ($mapping && ($mapping->variant || $mapping->product)) {
                        $variant = $mapping->variant;
                        $product = $mapping->product;
                    }
                }

                // HANYA produk yang tersinkronisasi ke katalog website yang masuk ke hitungan laba rugi
                if (! $variant && ! $product) {
                    continue; // Lewati item yang tidak tersinkronisasi ke website
                }

                // MURNI AMBIL HARGA JUAL DAN HPP DARI PRODUK WEBSITE (BUKAN HARGA MARKETPLACE)
                $webUnitPrice = (float) ($variant?->price ?? $product?->price ?? 0);
                $webUnitCost = (float) ($variant?->cost_price ?? $item->cost_price ?? 0);

                if ($webUnitPrice <= 0) {
                    continue; // Jika harga produk di website tidak ada/nol, lewati
                }

                $totalUnitsSold += $qty;

                $itemWebSubtotal = $webUnitPrice * $qty;
                $itemWebCost = $webUnitCost * $qty;
                $itemGrossProfit = $itemWebSubtotal - $itemWebCost;
                $itemAdminFee = $itemWebSubtotal * (self::ECOMMERCE_ADMIN_FEE_PCT / 100);
                $itemNetProfit = $itemGrossProfit - $itemAdminFee;

                $orderWebRevenue += $itemWebSubtotal;
                $orderWebCost += $itemWebCost;

                if ($webUnitCost > 0) {
                    $itemsWithHpp += $qty;
                } else {
                    $itemsWithoutHpp += $qty;
                }

                $orderItems[] = [
                    'product_name' => $item->product_name,
                    'variant_label' => $item->variant_label ?: 'Standar',
                    'web_product_name' => $product?->name ?: $item->product_name,
                    'web_variant_name' => $variant ? ($variant->weight_grams ? "{$variant->weight_grams}g" : $variant->name) : ($item->variant_label ?: 'Standar'),
                    'quantity' => $qty,
                    'ecom_sale_price' => (float) $item->price,
                    'web_unit_price' => $webUnitPrice,
                    'web_unit_cost' => $webUnitCost,
                    'web_subtotal' => $itemWebSubtotal,
                    'web_total_cost' => $itemWebCost,
                    'gross_profit' => $itemGrossProfit,
                    'admin_fee' => $itemAdminFee,
                    'net_profit' => $itemNetProfit,
                    'has_hpp' => $webUnitCost > 0,
                ];

                // Agregasi Produk Website
                $productKey = ($product?->name ?: $item->product_name).' - '.($variant ? ($variant->weight_grams ? "{$variant->weight_grams}g" : $variant->name) : ($item->variant_label ?: 'Standar'));
                if (! isset($productBreakdowns[$productKey])) {
                    $productBreakdowns[$productKey] = [
                        'web_product_name' => $product?->name ?: $item->product_name,
                        'web_variant_name' => $variant ? ($variant->weight_grams ? "{$variant->weight_grams}g" : $variant->name) : ($item->variant_label ?: 'Standar'),
                        'marketplace_name' => $item->product_name,
                        'web_unit_price' => $webUnitPrice,
                        'web_unit_cost' => $webUnitCost,
                        'unit_gross_profit' => $webUnitPrice - $webUnitCost,
                        'unit_admin_fee' => $webUnitPrice * (self::ECOMMERCE_ADMIN_FEE_PCT / 100),
                        'unit_net_profit' => ($webUnitPrice - $webUnitCost) - ($webUnitPrice * (self::ECOMMERCE_ADMIN_FEE_PCT / 100)),
                        'units_sold' => 0,
                        'total_web_revenue' => 0.0,
                        'total_web_cost' => 0.0,
                        'total_gross_profit' => 0.0,
                        'total_admin_fee' => 0.0,
                        'total_net_profit' => 0.0,
                        'has_hpp' => $webUnitCost > 0,
                    ];
                }

                $productBreakdowns[$productKey]['units_sold'] += $qty;
                $productBreakdowns[$productKey]['total_web_revenue'] += $itemWebSubtotal;
                $productBreakdowns[$productKey]['total_web_cost'] += $itemWebCost;
                $productBreakdowns[$productKey]['total_gross_profit'] += $itemGrossProfit;
                $productBreakdowns[$productKey]['total_admin_fee'] += $itemAdminFee;
                $productBreakdowns[$productKey]['total_net_profit'] += $itemNetProfit;
            }

            $webGrossRevenue += $orderWebRevenue;
            $webTotalCost += $orderWebCost;
            $ecomActualRevenue += (float) $order->total_amount;

            $orderGrossProfit = $orderWebRevenue - $orderWebCost;
            $orderAdminFee = $orderWebRevenue * (self::ECOMMERCE_ADMIN_FEE_PCT / 100);
            $orderNetProfit = $orderGrossProfit - $orderAdminFee;
            $orderNetMargin = $orderWebRevenue > 0 ? round(($orderNetProfit / $orderWebRevenue) * 100, 1) : 0.0;

            // Daily Map
            $dateKey = $order->created_at->format('Y-m-d');
            if (! isset($dailySummaryMap[$dateKey])) {
                $carbonDate = Carbon::parse($dateKey);
                $dailySummaryMap[$dateKey] = [
                    'date' => $dateKey,
                    'date_label' => $carbonDate->translatedFormat('d F Y'),
                    'short_date' => $carbonDate->format('d/m'),
                    'day_name' => $carbonDate->translatedFormat('l'),
                    'orders_count' => 0,
                    'units_sold' => 0,
                    'web_revenue' => 0.0,
                    'web_cost' => 0.0,
                    'gross_profit' => 0.0,
                    'admin_fee' => 0.0,
                    'net_profit' => 0.0,
                    'ecom_actual_revenue' => 0.0,
                ];
            }
            $dailySummaryMap[$dateKey]['orders_count']++;
            $dailySummaryMap[$dateKey]['units_sold'] += array_sum(array_column($orderItems, 'quantity'));
            $dailySummaryMap[$dateKey]['web_revenue'] += $orderWebRevenue;
            $dailySummaryMap[$dateKey]['web_cost'] += $orderWebCost;
            $dailySummaryMap[$dateKey]['gross_profit'] += $orderGrossProfit;
            $dailySummaryMap[$dateKey]['admin_fee'] += $orderAdminFee;
            $dailySummaryMap[$dateKey]['net_profit'] += $orderNetProfit;
            $dailySummaryMap[$dateKey]['ecom_actual_revenue'] += (float) $order->total_amount;

            // Monthly Map
            $monthKey = $order->created_at->format('Y-m');
            if (! isset($monthlySummaryMap[$monthKey])) {
                $carbonMonth = Carbon::parse($monthKey.'-01');
                $monthlySummaryMap[$monthKey] = [
                    'month_key' => $monthKey,
                    'month_label' => $carbonMonth->translatedFormat('F Y'),
                    'orders_count' => 0,
                    'units_sold' => 0,
                    'web_revenue' => 0.0,
                    'web_cost' => 0.0,
                    'gross_profit' => 0.0,
                    'admin_fee' => 0.0,
                    'net_profit' => 0.0,
                ];
            }
            $monthlySummaryMap[$monthKey]['orders_count']++;
            $monthlySummaryMap[$monthKey]['units_sold'] += array_sum(array_column($orderItems, 'quantity'));
            $monthlySummaryMap[$monthKey]['web_revenue'] += $orderWebRevenue;
            $monthlySummaryMap[$monthKey]['web_cost'] += $orderWebCost;
            $monthlySummaryMap[$monthKey]['gross_profit'] += $orderGrossProfit;
            $monthlySummaryMap[$monthKey]['admin_fee'] += $orderAdminFee;
            $monthlySummaryMap[$monthKey]['net_profit'] += $orderNetProfit;

            // Transaction Detail
            $transactionsList[] = [
                'order_id' => $order->id,
                'order_number' => $order->order_number,
                'created_at' => $order->created_at->format('Y-m-d H:i'),
                'created_at_formatted' => $order->created_at->translatedFormat('d M Y, H:i'),
                'customer_name' => $order->customer_name ?: 'Pelanggan Ecommerce',
                'customer_phone' => $order->customer_phone ?: '-',
                'platform' => $order->payment_channel ?: 'TikTok Shop / Tokopedia',
                'shipping_courier' => $order->shipping_courier ?: '-',
                'tracking_number' => $order->tracking_number ?: '-',
                'status' => $order->status,
                'status_label' => $order->status_label,
                'status_color' => match ($order->status) {
                    'completed' => 'success',
                    'processing', 'shipped' => 'warning',
                    'cancelled' => 'danger',
                    default => 'gray',
                },
                'total_web_revenue' => $orderWebRevenue,
                'total_web_cost' => $orderWebCost,
                'gross_profit' => $orderGrossProfit,
                'admin_fee' => $orderAdminFee,
                'net_profit' => $orderNetProfit,
                'net_margin_pct' => $orderNetMargin,
                'ecom_actual_amount' => (float) $order->total_amount,
                'items' => $orderItems,
            ];
        }

        // Sort Daily Map descending
        krsort($dailySummaryMap);
        foreach ($dailySummaryMap as &$d) {
            $d['margin_pct'] = $d['web_revenue'] > 0 ? round(($d['net_profit'] / $d['web_revenue']) * 100, 1) : 0.0;
        }
        unset($d);

        // Sort Monthly Map descending
        krsort($monthlySummaryMap);
        foreach ($monthlySummaryMap as &$m) {
            $m['margin_pct'] = $m['web_revenue'] > 0 ? round(($m['net_profit'] / $m['web_revenue']) * 100, 1) : 0.0;
        }
        unset($m);

        // Sort Product Breakdowns by total net profit descending
        uasort($productBreakdowns, fn ($a, $b) => $b['total_net_profit'] <=> $a['total_net_profit']);
        foreach ($productBreakdowns as &$p) {
            $p['margin_pct'] = $p['total_web_revenue'] > 0 ? round(($p['total_net_profit'] / $p['total_web_revenue']) * 100, 1) : 0.0;
        }
        unset($p);

        // 3. Ambil Master Katalog Produk Website yang Disinkronisasikan (424 items)
        $catalogMappings = $activeMappings->map(function ($m) {
            $variant = $m->variant;
            $product = $m->product;

            $webPrice = (float) ($variant?->price ?? $product?->price ?? 0);
            $webCost = (float) ($variant?->cost_price ?? 0);
            $unitGrossProfit = $webPrice - $webCost;
            $unitAdminFee = $webPrice * (self::ECOMMERCE_ADMIN_FEE_PCT / 100);
            $unitNetProfit = $unitGrossProfit - $unitAdminFee;
            $marginPct = $webPrice > 0 ? round(($unitNetProfit / $webPrice) * 100, 1) : 0.0;

            return [
                'mapping_id' => $m->id,
                'marketplace' => ucfirst($m->platform ?: 'TikTok Shop'),
                'marketplace_product_name' => $m->marketplace_product_name,
                'marketplace_sku_name' => $m->marketplace_sku_name,
                'seller_sku' => $m->seller_sku,
                'web_product_name' => $product?->name ?? 'Belum terhubung',
                'web_variant_name' => $variant ? ($variant->weight_grams ? "{$variant->weight_grams}g" : $variant->name) : 'Standar',
                'web_price' => $webPrice,
                'web_cost_price' => $webCost,
                'unit_gross_profit' => $unitGrossProfit,
                'unit_admin_fee' => $unitAdminFee,
                'estimated_unit_profit' => $unitNetProfit,
                'estimated_margin_pct' => $marginPct,
                'has_hpp' => $webCost > 0,
            ];
        })->toArray();

        $webGrossProfit = $webGrossRevenue - $webTotalCost;
        $totalAdminFee = $webGrossRevenue * (self::ECOMMERCE_ADMIN_FEE_PCT / 100);
        $webNetProfit = $webGrossProfit - $totalAdminFee;
        $webNetMarginPct = $webGrossRevenue > 0 ? round(($webNetProfit / $webGrossRevenue) * 100, 1) : 0.0;

        return [
            'summary' => [
                'total_transactions' => $totalTransactions,
                'total_units_sold' => $totalUnitsSold,
                'web_gross_revenue' => $webGrossRevenue,
                'web_total_cost' => $webTotalCost,
                'web_gross_profit' => $webGrossProfit,
                'admin_fee_pct' => self::ECOMMERCE_ADMIN_FEE_PCT,
                'total_admin_fee' => $totalAdminFee,
                'web_net_profit' => $webNetProfit,
                'web_net_margin_pct' => $webNetMarginPct,
                'ecom_actual_revenue' => $ecomActualRevenue,
                'items_with_hpp' => $itemsWithHpp,
                'items_without_hpp' => $itemsWithoutHpp,
                'is_profitable' => $webNetProfit >= 0,
                'total_synchronized_products' => count($catalogMappings),
            ],
            'daily_summary' => array_values($dailySummaryMap),
            'monthly_summary' => array_values($monthlySummaryMap),
            'product_breakdowns' => array_values($productBreakdowns),
            'transactions' => $transactionsList,
            'catalog_mappings' => $catalogMappings,
            'start_date' => $start->format('Y-m-d'),
            'end_date' => $end->format('Y-m-d'),
        ];
    }
}
