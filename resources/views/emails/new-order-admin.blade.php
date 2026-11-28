<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Pesanan Baru Masuk #{{ $order->order_number }}</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            background-color: #f7f5f2;
            color: #2b2520;
            margin: 0;
            padding: 0;
            -webkit-font-smoothing: antialiased;
        }
        .container {
            max-width: 600px;
            margin: 20px auto;
            background: #ffffff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 14px rgba(0,0,0,0.06);
            border: 1px solid #eae5de;
        }
        .header {
            background-color: #1a1612;
            padding: 28px 24px;
            text-align: center;
        }
        .header h1 {
            color: #ffffff;
            font-size: 22px;
            font-weight: 700;
            margin: 0 0 6px 0;
            letter-spacing: 0.5px;
        }
        .header p {
            color: #c7a46d;
            font-size: 13px;
            margin: 0;
            text-transform: uppercase;
            letter-spacing: 1px;
            font-weight: 600;
        }
        .badge-alert {
            display: inline-block;
            background-color: #fef3c7;
            color: #92400e;
            font-size: 13px;
            font-weight: 700;
            padding: 6px 14px;
            border-radius: 20px;
            margin-top: 14px;
            border: 1px solid #fde68a;
        }
        .content {
            padding: 24px;
        }
        .section-title {
            font-size: 14px;
            text-transform: uppercase;
            letter-spacing: 0.8px;
            color: #8b5cf6;
            color: #8c7355;
            font-weight: 700;
            border-bottom: 2px solid #f2ece4;
            padding-bottom: 6px;
            margin-top: 24px;
            margin-bottom: 14px;
        }
        .info-grid {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 12px;
        }
        .info-grid td {
            padding: 6px 0;
            font-size: 14px;
            vertical-align: top;
        }
        .info-label {
            width: 36%;
            color: #6b7280;
            font-weight: 500;
        }
        .info-value {
            width: 64%;
            color: #111827;
            font-weight: 600;
        }
        .table-items {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
            margin-bottom: 16px;
        }
        .table-items th {
            background-color: #faf7f2;
            padding: 10px 12px;
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            color: #6b7280;
            text-align: left;
            border-top: 1px solid #f0eae1;
            border-bottom: 1px solid #f0eae1;
        }
        .table-items td {
            padding: 12px;
            font-size: 13px;
            border-bottom: 1px solid #f5f0ea;
            vertical-align: middle;
        }
        .item-title {
            font-weight: 600;
            color: #1f2937;
            margin-bottom: 2px;
        }
        .item-variant {
            font-size: 12px;
            color: #6b7280;
        }
        .item-notes {
            font-size: 12px;
            color: #b45309;
            font-style: italic;
            margin-top: 3px;
        }
        .pricing-summary {
            background-color: #faf7f2;
            border-radius: 8px;
            padding: 14px 18px;
            margin-top: 16px;
            border: 1px solid #ece4d8;
        }
        .pricing-row {
            display: flex;
            justify-content: space-between;
            font-size: 13px;
            margin-bottom: 6px;
            color: #4b5563;
        }
        .pricing-total {
            display: flex;
            justify-content: space-between;
            font-size: 16px;
            font-weight: 700;
            color: #1f2937;
            border-top: 1px dashed #d1c7bc;
            padding-top: 8px;
            margin-top: 8px;
        }
        .cta-box {
            text-align: center;
            padding: 24px 0 10px 0;
        }
        .cta-btn {
            display: inline-block;
            background-color: #c7a46d;
            background: linear-gradient(135deg, #d97706 0%, #b45309 100%);
            color: #ffffff !important;
            text-decoration: none;
            font-weight: 700;
            font-size: 15px;
            padding: 12px 28px;
            border-radius: 8px;
            box-shadow: 0 4px 10px rgba(180, 83, 9, 0.25);
        }
        .footer {
            background-color: #faf7f2;
            padding: 18px 24px;
            text-align: center;
            font-size: 12px;
            color: #9ca3af;
            border-top: 1px solid #eae5de;
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- Header -->
        <div class="header">
            <p>{{ $siteName }}</p>
            <h1>Notifikasi Pesanan Baru Masuk</h1>
            <div class="badge-alert">
                Order #{{ $order->order_number }}
            </div>
        </div>

        <!-- Body -->
        <div class="content">
            <p style="font-size: 14px; margin-top: 0; color: #4b5563; line-height: 1.5;">
                Halo Tim Alat Kopi Malang, ada pesanan baru yang baru saja masuk melalui website. Segera periksa dan siapkan pesanan pelanggan.
            </p>

            <!-- Informasi Pemesan -->
            <div class="section-title">Informasi Pelanggan</div>
            <table class="info-grid">
                <tr>
                    <td class="info-label">Nama Pemesan</td>
                    <td class="info-value">{{ $order->customer_name }}</td>
                </tr>
                <tr>
                    <td class="info-label">No. WhatsApp</td>
                    <td class="info-value">
                        <a href="https://wa.me/{{ preg_replace('/[^0-9]/', '', $order->customer_phone) }}" style="color: #059669; text-decoration: none; font-weight: 700;">
                            {{ $order->customer_phone }} ↗
                        </a>
                    </td>
                </tr>
                @if(!empty($order->customer_email))
                <tr>
                    <td class="info-label">Email</td>
                    <td class="info-value">{{ $order->customer_email }}</td>
                </tr>
                @endif
                <tr>
                    <td class="info-label">Waktu Pesan</td>
                    <td class="info-value">{{ $order->created_at ? $order->created_at->setTimezone('Asia/Jakarta')->format('d M Y, H:i') : now()->format('d M Y, H:i') }} WIB</td>
                </tr>
            </table>

            <!-- Pengiriman / Pengambilan -->
            <div class="section-title">Metode Pengiriman & Alamat</div>
            @php
                $isPickup = $order->shipping_service === 'PICKUP' || str_contains(strtoupper((string) $order->shipping_courier), 'AMBIL');
            @endphp
            <table class="info-grid">
                <tr>
                    <td class="info-label">Metode</td>
                    <td class="info-value">
                        @if($isPickup)
                            <span style="color: #0d9488; font-weight: 700;">🏪 Ambil di Toko (Self Pick Up)</span>
                        @else
                            <span style="color: #2563eb; font-weight: 700;">🚚 Kirim Kurir ({{ strtoupper($order->shipping_courier) }} - {{ $order->shipping_service }})</span>
                        @endif
                    </td>
                </tr>
                @if(!$isPickup)
                <tr>
                    <td class="info-label">Alamat Lengkap</td>
                    <td class="info-value" style="font-weight: 500; line-height: 1.4;">
                        {{ $order->customer_address }}<br>
                        <small style="color: #6b7280;">{{ implode(', ', array_filter([$order->shipping_district, $order->shipping_city, $order->shipping_province, $order->shipping_postal_code])) }}</small>
                    </td>
                </tr>
                <tr>
                    <td class="info-label">Total Berat</td>
                    <td class="info-value">{{ number_format($order->total_weight_grams, 0, ',', '.') }} gram</td>
                </tr>
                @endif
                @if(!empty($order->customer_notes))
                <tr>
                    <td class="info-label">Catatan Pesanan</td>
                    <td class="info-value" style="color: #b45309; font-style: italic;">"{{ $order->customer_notes }}"</td>
                </tr>
                @endif
            </table>

            <!-- Detail Produk -->
            <div class="section-title">Daftar Produk Dipesan</div>
            <table class="table-items">
                <thead>
                    <tr>
                        <th>Item</th>
                        <th style="text-align: center; width: 50px;">Qty</th>
                        <th style="text-align: right; width: 100px;">Subtotal</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach($order->items as $item)
                        <tr>
                            <td>
                                <div class="item-title">{{ $item->product_name }}</div>
                                @php
                                    $vLabel = \App\Support\VariantHelper::formatLabel($item->variant_label);
                                    $variants = array_filter([$vLabel, $item->grind_option]);
                                @endphp
                                @if(!empty($variants))
                                    <div class="item-variant">{{ implode(' · ', $variants) }}</div>
                                @endif
                                @if(!empty($item->custom_notes))
                                    <div class="item-notes">↳ Catatan: {{ $item->custom_notes }}</div>
                                @endif
                            </td>
                            <td style="text-align: center; font-weight: 600;">
                                {{ $item->quantity }}x
                            </td>
                            <td style="text-align: right; font-weight: 600; color: #111827;">
                                Rp {{ number_format($item->subtotal, 0, ',', '.') }}
                            </td>
                        </tr>
                    @endforeach
                </tbody>
            </table>

            <!-- Rincian Biaya -->
            <div class="pricing-summary">
                <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                        <td style="font-size: 13px; color: #4b5563; padding: 3px 0;">Subtotal Produk:</td>
                        <td style="font-size: 13px; color: #111827; text-align: right; font-weight: 600; padding: 3px 0;">Rp {{ number_format($order->subtotal, 0, ',', '.') }}</td>
                    </tr>
                    @if($order->shipping_cost > 0)
                    <tr>
                        <td style="font-size: 13px; color: #4b5563; padding: 3px 0;">Ongkos Kirim:</td>
                        <td style="font-size: 13px; color: #111827; text-align: right; font-weight: 600; padding: 3px 0;">Rp {{ number_format($order->shipping_cost, 0, ',', '.') }}</td>
                    </tr>
                    @endif
                    @if($order->unique_code > 0)
                    <tr>
                        <td style="font-size: 13px; color: #4b5563; padding: 3px 0;">Kode Unik Pembayaran:</td>
                        <td style="font-size: 13px; color: #059669; text-align: right; font-weight: 600; padding: 3px 0;">+Rp {{ number_format($order->unique_code, 0, ',', '.') }}</td>
                    </tr>
                    @endif
                    <tr>
                        <td style="font-size: 15px; color: #111827; font-weight: 700; padding: 8px 0 0 0; border-top: 1px dashed #d1c7bc;">TOTAL PEMBAYARAN:</td>
                        <td style="font-size: 17px; color: #b45309; text-align: right; font-weight: 800; padding: 8px 0 0 0; border-top: 1px dashed #d1c7bc;">
                            Rp {{ number_format($order->total_amount, 0, ',', '.') }}
                        </td>
                    </tr>
                </table>
            </div>

            <!-- Detail Pembayaran -->
            <table class="info-grid" style="margin-top: 16px;">
                <tr>
                    <td class="info-label">Metode Bayar</td>
                    <td class="info-value">{{ strtoupper($order->payment_method) }} {{ $order->payment_channel ? '('.$order->payment_channel.')' : '' }}</td>
                </tr>
                <tr>
                    <td class="info-label">Status Bayar</td>
                    <td class="info-value">
                        @if($order->payment_status === 'paid')
                            <span style="color: #059669; font-weight: 700;">Sudah Dibayar (PAID)</span>
                        @else
                            <span style="color: #d97706; font-weight: 700;">Menunggu Pembayaran (PENDING)</span>
                        @endif
                    </td>
                </tr>
            </table>

            <!-- Tombol CTA -->
            <div class="cta-box">
                <a href="{{ $adminUrl }}" class="cta-btn" target="_blank">
                    Buka Pesanan di Dashboard Admin ↗
                </a>
            </div>
        </div>

        <!-- Footer -->
        <div class="footer">
            Email ini dikirim secara otomatis oleh sistem toko online {{ $siteName }}.<br>
            Jl. Raya Tlogomas, Lowokwaru, Kota Malang, Jawa Timur.
        </div>
    </div>
</body>
</html>
