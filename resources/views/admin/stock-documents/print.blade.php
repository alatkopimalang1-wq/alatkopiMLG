<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ $doc->type === 'in' ? 'Bukti Penerimaan / Konsinyasi Masuk' : 'Bukti Pengeluaran / Surat Jalan' }} - {{ $doc->document_number }}</title>
    <style>
        body {
            font-family: Arial, Helvetica, sans-serif;
            color: #1f2937;
            margin: 28px;
            font-size: 13px;
            line-height: 1.5;
        }
        .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            border-bottom: 2px solid #111827;
            padding-bottom: 14px;
            margin-bottom: 18px;
        }
        .title {
            font-size: 18px;
            font-weight: 800;
            margin: 0;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            color: #0f172a;
        }
        .subtitle {
            color: #475569;
            font-size: 12px;
            margin-top: 4px;
        }
        .badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 999px;
            font-size: 11px;
            font-weight: 700;
            text-transform: uppercase;
        }
        .badge-posted { background: #dcfce7; color: #15803d; border: 1px solid #bbf7d0; }
        .badge-draft { background: #fef3c7; color: #b45309; border: 1px solid #fde68a; }
        .grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 16px;
            margin-bottom: 20px;
        }
        .card {
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 12px 16px;
            background: #fafafa;
        }
        .card h4 {
            margin: 0 0 8px;
            font-size: 12px;
            text-transform: uppercase;
            color: #64748b;
            border-bottom: 1px solid #e2e8f0;
            padding-bottom: 4px;
        }
        .row { margin-bottom: 5px; font-size: 12.5px; }
        .label { color: #64748b; display: inline-block; width: 140px; }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 24px;
        }
        th, td {
            border: 1px solid #cbd5e1;
            padding: 8px 12px;
            text-align: left;
        }
        th {
            background: #f1f5f9;
            font-weight: 700;
            font-size: 12px;
            text-transform: uppercase;
            color: #334155;
        }
        .text-right { text-align: right; }
        .text-center { text-align: center; }
        .totals-row td {
            font-weight: 700;
            background: #f8fafc;
            border-top: 2px solid #94a3b8;
        }
        .signatures {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 20px;
            margin-top: 36px;
            text-align: center;
            page-break-inside: avoid;
        }
        .sign-box {
            padding-top: 8px;
        }
        .sign-space {
            height: 75px;
        }
        .sign-name {
            border-top: 1px dashed #64748b;
            padding-top: 6px;
            font-weight: 600;
            font-size: 12.5px;
        }
        .sign-role {
            font-size: 11px;
            color: #64748b;
        }
        @media print {
            .no-print { display: none; }
            body { margin: 15px; font-size: 12px; }
            .card { background: transparent !important; }
        }
    </style>
</head>
<body>
    <div class="no-print" style="margin-bottom: 16px; display: flex; justify-content: flex-end; gap: 10px;">
        <button onclick="window.print()" style="padding: 9px 18px; background: #0284c7; color: #fff; border: none; border-radius: 6px; cursor: pointer; font-weight: 600; font-size: 13px;">
            🖨️ Cetak Dokumen (A4)
        </button>
    </div>

    <div class="header">
        <div>
            <div style="font-size: 12px; font-weight: 700; color: #475569; letter-spacing: 0.5px;">ALAT KOPI MALANG / SANUBARI ROASTERY</div>
            <h1 class="title">
                {{ $doc->type === 'in' ? 'BUKTI PENERIMAAN BARANG / KONSINYASI MASUK' : 'BUKTI PENGELUARAN BARANG / SURAT JALAN' }}
            </h1>
            <div class="subtitle">
                No. Dokumen: <strong>{{ $doc->document_number }}</strong>
                @if($doc->reference_number)
                    &bull; No. Referensi: <strong>{{ $doc->reference_number }}</strong>
                @endif
            </div>
        </div>
        <div style="text-align: right;">
            <div><strong>Tanggal Transaksi:</strong> {{ $doc->transaction_date?->format('d M Y') }}</div>
            <div style="margin-top: 4px;"><strong>Dibuat Oleh:</strong> {{ $doc->user?->name ?? 'Admin Toko' }}</div>
            <div style="margin-top: 6px;">
                <span class="badge {{ $doc->status === 'posted' ? 'badge-posted' : 'badge-draft' }}">
                    {{ $doc->status === 'posted' ? 'Selesai / Terposting' : 'Draf (Belum Posting)' }}
                </span>
            </div>
        </div>
    </div>

    <div class="grid">
        <div class="card">
            <h4>{{ $doc->type === 'in' ? 'Informasi Pengirim / Penitip Konsinyasi' : 'Informasi Penerima / Tujuan' }}</h4>
            <div class="row">
                <span class="label">{{ $doc->type === 'in' ? 'Nama Supplier/Penitip:' : 'Penerima / Tujuan:' }}</span>
                <strong>{{ $doc->partner_name ?: '-' }}</strong>
            </div>
            <div class="row">
                <span class="label">No. Telepon / Kontak:</span>
                {{ $doc->partner_phone ?: '-' }}
            </div>
            <div class="row">
                <span class="label">No. Ref Surat Jalan:</span>
                {{ $doc->reference_number ?: '-' }}
            </div>
        </div>

        <div class="card">
            <h4>Keterangan & Status Stok</h4>
            <div class="row">
                <span class="label">Jenis Transaksi:</span>
                <strong>{{ $doc->type === 'in' ? 'Stok Masuk (Penambahan)' : 'Stok Keluar (Pengurangan)' }}</strong>
            </div>
            <div class="row">
                <span class="label">Status Pembaruan Stok:</span>
                {{ $doc->status === 'posted' ? 'Stok sistem sudah diperbarui' : 'Draf (Stok belum berubah)' }}
            </div>
            <div class="row">
                <span class="label">Catatan Tambahan:</span>
                <span>{{ $doc->notes ?: 'Tidak ada catatan.' }}</span>
            </div>
        </div>
    </div>

    <table>
        <thead>
            <tr>
                <th class="text-center" style="width: 40px;">No</th>
                <th>Deskripsi Produk & Kemasan</th>
                <th style="width: 140px;">SKU</th>
                <th class="text-center" style="width: 80px;">Jumlah</th>
                <th class="text-right" style="width: 130px;">Harga Satuan</th>
                <th class="text-right" style="width: 140px;">Subtotal</th>
            </tr>
        </thead>
        <tbody>
            @forelse($doc->items as $idx => $item)
                @php
                    $vLabel = $item->variant && strcasecmp((string) $item->variant->label, 'Standard') !== 0 ? $item->variant->label : '';
                    $sku = $item->variant?->sku ?: '-';
                @endphp
                <tr>
                    <td class="text-center">{{ $idx + 1 }}</td>
                    <td>
                        <strong>{{ $item->product?->name ?? 'Produk #' . $item->product_id }}</strong>
                        @if($vLabel !== '')
                            <div style="font-size: 11.5px; color: #475569;">Varian: {{ $vLabel }}</div>
                        @endif
                        @if($item->notes)
                            <div style="font-size: 11px; color: #64748b; font-style: italic;">Catatan: {{ $item->notes }}</div>
                        @endif
                    </td>
                    <td><code>{{ $sku }}</code></td>
                    <td class="text-center"><strong>{{ number_format((int) $item->quantity) }}</strong> pcs</td>
                    <td class="text-right">
                        {{ $item->unit_cost > 0 ? 'Rp ' . number_format((float) $item->unit_cost, 0, ',', '.') : '-' }}
                    </td>
                    <td class="text-right">
                        {{ $item->subtotal_cost > 0 ? 'Rp ' . number_format((float) $item->subtotal_cost, 0, ',', '.') : '-' }}
                    </td>
                </tr>
            @empty
                <tr>
                    <td colspan="6" class="text-center" style="padding: 20px; color: #64748b;">
                        Belum ada daftar produk pada dokumen ini.
                    </td>
                </tr>
            @endforelse
        </tbody>
        <tfoot>
            <tr class="totals-row">
                <td colspan="3" class="text-right">Total Keseluruhan:</td>
                <td class="text-center"><strong>{{ number_format((int) $doc->total_qty) }} pcs</strong></td>
                <td></td>
                <td class="text-right">
                    <strong>{{ $doc->total_cost > 0 ? 'Rp ' . number_format((float) $doc->total_cost, 0, ',', '.') : '-' }}</strong>
                </td>
            </tr>
        </tfoot>
    </table>

    <div class="signatures">
        <div class="sign-box">
            <div class="sign-role">{{ $doc->type === 'in' ? 'Yang Menyerahkan (Penitip / Supplier)' : 'Petugas Pengirim' }}</div>
            <div class="sign-space"></div>
            <div class="sign-name">{{ $doc->partner_name ?: '( ................................... )' }}</div>
        </div>

        <div class="sign-box">
            <div class="sign-role">Pemeriksa Barang / Gudang</div>
            <div class="sign-space"></div>
            <div class="sign-name">( ................................... )</div>
        </div>

        <div class="sign-box">
            <div class="sign-role">{{ $doc->type === 'in' ? 'Yang Menerima (Admin Toko)' : 'Penerima Barang' }}</div>
            <div class="sign-space"></div>
            <div class="sign-name">{{ $doc->type === 'in' ? ($doc->user?->name ?? 'Admin Toko') : '( ................................... )' }}</div>
        </div>
    </div>
</body>
</html>
