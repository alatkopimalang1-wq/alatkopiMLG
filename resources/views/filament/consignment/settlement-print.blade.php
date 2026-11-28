<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Nota Rekap Konsinyasi - {{ $settlement->settlement_number }}</title>
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            color: #1f2937;
            background: #f9fafb;
            padding: 24px;
            font-size: 13px;
            line-height: 1.5;
        }
        .container {
            max-width: 840px;
            margin: 0 auto;
            background: #ffffff;
            padding: 36px 40px;
            border-radius: 8px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            border-bottom: 2px solid #e5e7eb;
            padding-bottom: 20px;
            margin-bottom: 24px;
        }
        .brand-title {
            font-size: 20px;
            font-weight: 800;
            color: #111827;
            letter-spacing: -0.5px;
        }
        .brand-sub {
            font-size: 11px;
            color: #6b7280;
            margin-top: 3px;
        }
        .doc-title {
            text-align: right;
        }
        .doc-title h1 {
            font-size: 16px;
            font-weight: 800;
            color: #1e3a8a;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .doc-title .doc-num {
            font-size: 13px;
            font-weight: 700;
            color: #374151;
            margin-top: 2px;
        }
        .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 24px;
            margin-bottom: 24px;
            background: #f9fafb;
            padding: 16px;
            border-radius: 6px;
            border: 1px solid #f3f4f6;
        }
        .info-block h4 {
            font-size: 11px;
            text-transform: uppercase;
            color: #6b7280;
            font-weight: 700;
            margin-bottom: 6px;
        }
        .info-block p {
            font-size: 13px;
            color: #1f2937;
            margin-bottom: 3px;
        }
        .info-block .bold {
            font-weight: 700;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 24px;
        }
        th {
            background: #f3f4f6;
            color: #4b5563;
            font-size: 11px;
            text-transform: uppercase;
            font-weight: 700;
            padding: 8px 10px;
            border-bottom: 1px solid #d1d5db;
        }
        td {
            padding: 8px 10px;
            border-bottom: 1px solid #e5e7eb;
            font-size: 12px;
        }
        .text-right { text-align: right; }
        .text-center { text-align: center; }
        .total-box {
            display: flex;
            justify-content: flex-end;
            margin-bottom: 28px;
        }
        .total-table {
            width: 320px;
            border-collapse: collapse;
        }
        .total-table td {
            padding: 6px 8px;
            border: none;
        }
        .total-table .highlight {
            font-size: 14px;
            font-weight: 800;
            background: #fef2f2;
            color: #b91c1c;
            border-top: 2px solid #ef4444;
            border-bottom: 2px solid #ef4444;
        }
        .stock-section {
            margin-top: 24px;
            padding-top: 20px;
            border-top: 1px dashed #d1d5db;
            margin-bottom: 28px;
        }
        .stock-section h3 {
            font-size: 12px;
            font-weight: 700;
            text-transform: uppercase;
            color: #4b5563;
            margin-bottom: 10px;
        }
        .signature-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 40px;
            text-align: center;
            margin-top: 40px;
            padding-top: 10px;
        }
        .sig-space {
            height: 70px;
        }
        .sig-name {
            font-weight: 700;
            text-decoration: underline;
        }
        .actions-bar {
            max-width: 840px;
            margin: 0 auto 16px auto;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .btn {
            display: inline-flex;
            align-items: center;
            padding: 8px 16px;
            background: #2563eb;
            color: #ffffff;
            font-weight: 600;
            border-radius: 6px;
            text-decoration: none;
            font-size: 13px;
            border: none;
            cursor: pointer;
        }
        .btn-secondary {
            background: #e5e7eb;
            color: #374151;
        }
        @media print {
            body { background: #ffffff; padding: 0; }
            .container { box-shadow: none; padding: 0; max-width: 100%; }
            .actions-bar { display: none; }
        }
    </style>
</head>
<body>
    <div class="actions-bar">
        <a href="javascript:window.history.back()" class="btn btn-secondary">&larr; Kembali ke Dashboard</a>
        <button onclick="window.print()" class="btn">🖨️ Cetak / Simpan PDF</button>
    </div>

    <div class="container">
        {{-- Header --}}
        <div class="header">
            <div>
                <div class="brand-title">ALAT KOPI MALANG</div>
                <div class="brand-sub">Sanubari Roastery & Coffee Equipment</div>
                <div class="brand-sub">Jl. Candi Mendut No. 3, Lowokwaru, Kota Malang</div>
                <div class="brand-sub">WhatsApp: 0821-3209-5241 | Instagram: @alat_kopi_malang</div>
            </div>
            <div class="doc-title">
                <h1>Nota Rekap Konsinyasi</h1>
                <div class="doc-num">{{ $settlement->settlement_number }}</div>
                <div class="brand-sub" style="margin-top: 4px;">Tanggal Cetak: {{ now()->translatedFormat('d F Y') }}</div>
            </div>
        </div>

        {{-- Info Grid --}}
        <div class="info-grid">
            <div class="info-block">
                <h4>Data Mitra Penitip (Konsinyor)</h4>
                <p class="bold">{{ $settlement->consignor->name }}</p>
                @if($settlement->consignor->phone)<p>No. WhatsApp: {{ $settlement->consignor->phone }}</p>@endif
                @if($settlement->consignor->address)<p>Alamat: {{ $settlement->consignor->address }}</p>@endif
                <p style="margin-top: 6px;"><span class="bold">Rekening Tujuan:</span><br>{{ $settlement->consignor->bank_formatted }}</p>
            </div>
            <div class="info-block">
                <h4>Detail Rekapitulasi</h4>
                <p><span class="bold">Periode Penjualan:</span> {{ $settlement->period_start->translatedFormat('d F Y') }} s/d {{ $settlement->period_end->translatedFormat('d F Y') }}</p>
                <p><span class="bold">Total Item Terjual:</span> {{ $settlement->total_items_sold }} unit</p>
                <p><span class="bold">Status Pembayaran:</span>
                    @if($settlement->status === 'paid')
                        <strong style="color: #059669;">LUNAS (Sudah Ditransfer {{ $settlement->paid_at?->format('d/m/Y') }})</strong>
                    @else
                        <strong style="color: #d97706;">MENUNGGU PEMBAYARAN</strong>
                    @endif
                </p>
                @if($settlement->payment_reference)<p><span class="bold">No. Ref:</span> {{ $settlement->payment_reference }}</p>@endif
            </div>
        </div>

        {{-- Table Rincian Terjual --}}
        <table>
            <thead>
                <tr>
                    <th style="width: 35px;" class="text-center">No</th>
                    <th>Nama Produk & Varian</th>
                    <th class="text-center" style="width: 50px;">Qty</th>
                    <th class="text-right" style="width: 100px;">Harga Jual</th>
                    <th class="text-right" style="width: 110px;">Subtotal Omzet</th>
                    <th class="text-right" style="width: 110px; color: #b91c1c;">Hak Mitra</th>
                    <th class="text-right" style="width: 100px; color: #047857;">Komisi Toko</th>
                </tr>
            </thead>
            <tbody>
                @forelse($settlement->items as $idx => $item)
                    <tr>
                        <td class="text-center">{{ $idx + 1 }}</td>
                        <td>
                            <strong>{{ $item->product_name }}</strong>
                            @if($item->variant_label && strcasecmp($item->variant_label, 'Standard') !== 0)
                                <span style="color: #6b7280; font-size: 11px;">({{ $item->variant_label }})</span>
                            @endif
                        </td>
                        <td class="text-center"><strong>{{ $item->quantity }}</strong></td>
                        <td class="text-right">Rp {{ number_format($item->unit_price, 0, ',', '.') }}</td>
                        <td class="text-right">Rp {{ number_format($item->subtotal, 0, ',', '.') }}</td>
                        <td class="text-right" style="font-weight: 700; color: #b91c1c;">Rp {{ number_format($item->vendor_payout, 0, ',', '.') }}</td>
                        <td class="text-right" style="font-weight: 600; color: #047857;">Rp {{ number_format($item->store_commission, 0, ',', '.') }}</td>
                    </tr>
                @empty
                    <tr>
                        <td colspan="7" class="text-center" style="color: #9ca3af; padding: 20px;">Tidak ada item tercatat.</td>
                    </tr>
                @endforelse
            </tbody>
        </table>

        {{-- Ringkasan Total --}}
        <div class="total-box">
            <table class="total-table">
                <tr>
                    <td>Total Omzet Kotor:</td>
                    <td class="text-right"><strong>Rp {{ number_format($settlement->total_gross_sales, 0, ',', '.') }}</strong></td>
                </tr>
                <tr>
                    <td style="color: #047857;">Komisi / Laba Bersih Toko:</td>
                    <td class="text-right" style="color: #047857;"><strong>Rp {{ number_format($settlement->total_store_commission, 0, ',', '.') }}</strong></td>
                </tr>
                <tr class="highlight">
                    <td>TOTAL HAK BAYAR MITRA:</td>
                    <td class="text-right">Rp {{ number_format($settlement->total_vendor_payout, 0, ',', '.') }}</td>
                </tr>
            </table>
        </div>

        {{-- Sisa Stok Mitra di Toko --}}
        @php
            $vendorProducts = \App\Models\Product::where('is_consignment', true)
                ->where('consignor_id', $settlement->consignor_id)
                ->with('variants')
                ->get();
        @endphp
        @if($vendorProducts->isNotEmpty())
            <div class="stock-section">
                <h3>Sisa Stok Fisik Barang Titipan di Toko (Saat Ini)</h3>
                <table style="margin-bottom: 0;">
                    <thead>
                        <tr>
                            <th>Nama Barang Titipan</th>
                            <th class="text-center" style="width: 100px;">Sisa Stok</th>
                            <th class="text-right" style="width: 140px;">Harga Jual di Toko</th>
                        </tr>
                    </thead>
                    <tbody>
                        @foreach($vendorProducts as $vp)
                            @php
                                $stock = $vp->variants->isNotEmpty() ? $vp->variants->sum('stock') : (int) ($vp->stock ?? 0);
                            @endphp
                            <tr>
                                <td>{{ $vp->name }}</td>
                                <td class="text-center"><strong>{{ $stock }} unit</strong></td>
                                <td class="text-right">Rp {{ number_format($vp->min_price, 0, ',', '.') }}</td>
                            </tr>
                        @endforeach
                    </tbody>
                </table>
            </div>
        @endif

        {{-- Signatures --}}
        <div class="signature-grid">
            <div>
                <p>Pihak Toko,</p>
                <p><strong>Alat Kopi Malang</strong></p>
                <div class="sig-space"></div>
                <p class="sig-name">( {{ $settlement->user?->name ?? 'Pengelola Toko' }} )</p>
            </div>
            <div>
                <p>Pihak Mitra Penitip,</p>
                <p><strong>{{ $settlement->consignor->name }}</strong></p>
                <div class="sig-space"></div>
                <p class="sig-name">( {{ $settlement->consignor->bank_account_holder ?: $settlement->consignor->name }} )</p>
            </div>
        </div>
    </div>
</body>
</html>
