<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Purchase Order {{ $po->purchase_number }}</title>
    <style>
        body { font-family: Arial, Helvetica, sans-serif; color: #1f2937; margin: 24px; font-size: 13px; line-height: 1.5; }
        .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #111827; padding-bottom: 14px; margin-bottom: 18px; }
        .title { font-size: 20px; font-weight: 700; margin: 0; }
        .subtitle { color: #6b7280; font-size: 12px; margin-top: 2px; }
        .badge { display: inline-block; padding: 3px 10px; border-radius: 999px; font-size: 11px; font-weight: 700; }
        .badge-paid { background: #d1fae5; color: #065f46; }
        .badge-unpaid { background: #fef3c7; color: #92400e; }
        .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; margin-bottom: 20px; }
        .card { border: 1px solid #e5e7eb; border-radius: 6px; padding: 12px; }
        .card h4 { margin: 0 0 8px; font-size: 13px; border-bottom: 1px solid #f3f4f6; padding-bottom: 4px; }
        .row { margin-bottom: 4px; font-size: 12px; }
        .label { color: #6b7280; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
        th, td { border: 1px solid #e5e7eb; padding: 8px 10px; text-align: left; }
        th { background: #f9fafb; font-weight: 700; font-size: 12px; }
        .text-right { text-align: right; }
        .text-center { text-align: center; }
        .totals td { font-weight: 600; }
        .grand-total td { font-size: 14px; font-weight: 800; background: #f3f4f6; }
        @media print { .no-print { display: none; } body { margin: 10px; } }
    </style>
</head>
<body>
    <div class="no-print" style="margin-bottom: 14px; text-align: right;">
        <button onclick="window.print()" style="padding: 8px 16px; background: #0284c7; color: #fff; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;">
            Cetak Purchase Order
        </button>
    </div>

    <div class="header">
        <div>
            <h1 class="title">PURCHASE ORDER (PO)</h1>
            <div class="subtitle">{{ $po->purchase_number }} &bull; Pembelian Oleh {{ $po->user?->name ?? 'Admin' }}</div>
        </div>
        <div style="text-align: right;">
            <div><strong>Tanggal PO:</strong> {{ $po->purchase_date?->format('d M Y') }}</div>
            <div><strong>Status:</strong> {{ $po->status_label }}</div>
            <div style="margin-top: 4px;">
                <span class="badge {{ $po->is_paid ? 'badge-paid' : 'badge-unpaid' }}">
                    {{ $po->is_paid ? 'Sudah Bayar' : 'Belum Bayar' }}
                </span>
            </div>
        </div>
    </div>

    <div class="grid">
        <div class="card">
            <h4>Supplier</h4>
            <div class="row"><span class="label">Nama:</span> <strong>{{ $po->supplier_name ?: '-' }}</strong></div>
            <div class="row"><span class="label">Telpon:</span> {{ $po->supplier_phone ?: '-' }}</div>
            <div class="row"><span class="label">Kontak PIC:</span> {{ $po->supplier_contact ?: '-' }}</div>
            <div class="row"><span class="label">Email:</span> {{ $po->supplier_email ?: '-' }}</div>
            <div class="row"><span class="label">Alamat:</span> {{ $po->supplier_address ?: '-' }}</div>
        </div>
        <div class="card">
            <h4>Info Penerimaan</h4>
            <div class="row"><span class="label">Tanggal Diterima:</span> {{ $po->received_date?->format('d M Y') ?: '-' }}</div>
            <div class="row"><span class="label">No. Terima:</span> {{ $po->receipt_number ?: '-' }}</div>
            <div class="row"><span class="label">Penerima:</span> {{ $po->receiver_name ?: '-' }}</div>
        </div>
        <div class="card">
            <h4>Catatan & Jatuh Tempo</h4>
            <div class="row"><span class="label">Jatuh Tempo:</span> {{ $po->due_date?->format('d M Y') ?: 'Tidak ada' }}</div>
            <div class="row" style="margin-top: 6px;"><span class="label">Catatan:</span><br>{{ $po->notes ?: 'Tidak ada' }}</div>
        </div>
    </div>

    <table>
        <thead>
            <tr>
                <th class="text-center" style="width: 40px;">No</th>
                <th>Deskripsi Produk</th>
                <th class="text-center" style="width: 60px;">Qty</th>
                <th class="text-right" style="width: 130px;">Harga (IDR)</th>
                <th class="text-right" style="width: 110px;">Diskon</th>
                <th class="text-right" style="width: 140px;">Total Harga (IDR)</th>
            </tr>
        </thead>
        <tbody>
            @foreach($po->items as $idx => $item)
                <tr>
                    <td class="text-center">{{ $idx + 1 }}</td>
                    <td>
                        <strong>{{ $item->product?->name ?? 'Produk #' . $item->product_id }}</strong><br>
                        <small style="color: #6b7280;">Varian: {{ $item->variant?->label ?? 'Default' }} @if($item->variant?->sku) ({{ $item->variant->sku }}) @endif</small>
                    </td>
                    <td class="text-center">{{ (int) $item->quantity }}</td>
                    <td class="text-right">IDR {{ number_format((float) $item->unit_cost, 0, ',', '.') }}</td>
                    <td class="text-right">IDR {{ number_format((float) $item->discount_amount, 0, ',', '.') }}</td>
                    <td class="text-right">IDR {{ number_format((float) $item->subtotal, 0, ',', '.') }}</td>
                </tr>
            @endforeach
        </tbody>
        <tfoot>
            <tr class="totals">
                <td colspan="2" class="text-right">Total Pesanan</td>
                <td class="text-center">{{ (int) $po->total_qty }}</td>
                <td colspan="3"></td>
            </tr>
            <tr class="totals">
                <td colspan="5" class="text-right">Subtotal</td>
                <td class="text-right">IDR {{ number_format((float) $po->subtotal, 0, ',', '.') }}</td>
            </tr>
            <tr class="totals">
                <td colspan="5" class="text-right">Diskon</td>
                <td class="text-right">IDR {{ number_format((float) $po->discount_amount, 0, ',', '.') }}</td>
            </tr>
            <tr class="grand-total">
                <td colspan="5" class="text-right">Total Tagihan</td>
                <td class="text-right">IDR {{ number_format((float) $po->total_amount, 0, ',', '.') }}</td>
            </tr>
        </tfoot>
    </table>
</body>
</html>
