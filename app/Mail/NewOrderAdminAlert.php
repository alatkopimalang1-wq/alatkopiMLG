<?php

namespace App\Mail;

use App\Models\Order;
use App\Models\Setting;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Address;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class NewOrderAdminAlert extends Mailable
{
    use Queueable, SerializesModels;

    public Order $order;
    public string $siteName;
    public string $adminUrl;

    public function __construct(Order $order)
    {
        $this->order = $order->relationLoaded('items') ? $order : $order->load('items');
        $this->siteName = Setting::get('site_name', 'Alat Kopi Malang');
        $this->adminUrl = url('/admin/orders');
    }

    public function envelope(): Envelope
    {
        $totalFormatted = number_format($this->order->total_amount, 0, ',', '.');
        $fromAddress = config('mail.from.address', 'hello@sanubariroastery.id');
        $fromName = config('mail.from.name', 'Alat Kopi Malang');

        return new Envelope(
            from: new Address($fromAddress, $fromName),
            subject: "☕ [Pesanan Baru] #{$this->order->order_number} - Rp {$totalFormatted} ({$this->order->customer_name})",
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.new-order-admin',
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
