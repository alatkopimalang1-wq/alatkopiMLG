<x-filament-panels::page>
    @php
        $documents = $this->documents;
        $isOut = $this->docType === 'out';
    @endphp

    <div class="space-y-4">
        {{-- Top Action & Filter Bar --}}
        <div class="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 shadow-xs">
            <div class="flex flex-wrap items-center gap-2">
                <input type="text"
                       wire:model.live.debounce.300ms="search"
                       placeholder="Cari No. Dokumen / {{ $isOut ? 'Transfer / Alasan' : 'Supplier' }} / Catatan..."
                       class="w-64 sm:w-80 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 px-3 py-2 text-sm text-gray-900 dark:text-white focus:border-primary-500 focus:ring-primary-500" />

                <select wire:model.live="statusFilter"
                        class="rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 px-3 py-2 text-sm text-gray-900 dark:text-white focus:border-primary-500 focus:ring-primary-500">
                    <option value="all">Semua Status</option>
                    <option value="draft">Draft</option>
                    <option value="posted">Posted</option>
                    <option value="cancelled">Dibatalkan</option>
                </select>
            </div>

            <button type="button"
                    wire:click="createDraftDocument"
                    class="inline-flex items-center gap-2 rounded-lg bg-primary-600 hover:bg-primary-700 px-4 py-2 text-sm font-semibold text-white shadow-xs transition cursor-pointer">
                <span>+ Buat {{ $isOut ? 'Stok Keluar' : 'Stok Masuk' }}</span>
            </button>
        </div>

        {{-- Documents Table --}}
        <div class="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-xs overflow-hidden">
            <div class="overflow-x-auto">
                <table class="w-full text-left text-sm">
                    <thead class="bg-gray-50 dark:bg-gray-950/60 border-b border-gray-200 dark:border-gray-800 text-xs uppercase text-gray-500 dark:text-gray-400">
                        <tr>
                            <th class="py-3 px-4 font-semibold">No. {{ $isOut ? 'Stok Keluar' : 'Stok Masuk' }}</th>
                            <th class="py-3 px-4 font-semibold">Tanggal</th>
                            @if($isOut)
                                <th class="py-3 px-4 font-semibold">Transfer ke</th>
                                <th class="py-3 px-4 font-semibold">Alasan</th>
                            @else
                                <th class="py-3 px-4 font-semibold">Supplier</th>
                            @endif
                            <th class="py-3 px-4 font-semibold text-center">Jumlah Item</th>
                            <th class="py-3 px-4 font-semibold text-center">Total Qty</th>
                            <th class="py-3 px-4 font-semibold text-center">Status</th>
                            <th class="py-3 px-4 font-semibold text-right">Aksi</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-200 dark:divide-gray-800">
                        @forelse($documents as $doc)
                            <tr class="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition">
                                <td class="py-3 px-4 font-bold text-gray-900 dark:text-white">
                                    <a href="{{ \App\Filament\Pages\ManageStockDocument::getUrl(['record' => $doc->id]) }}"
                                       class="text-primary-600 hover:underline">
                                        {{ $doc->document_number }}
                                    </a>
                                </td>
                                <td class="py-3 px-4 text-gray-700 dark:text-gray-300">
                                    <div>{{ $doc->document_date?->format('d-M-Y') ?? '-' }}</div>
                                    <div class="text-xs text-gray-400">{{ $doc->user?->email ?? $doc->user?->name ?? '' }}</div>
                                </td>
                                @if($isOut)
                                    <td class="py-3 px-4 text-gray-700 dark:text-gray-300">{{ $doc->transfer_to ?: '-' }}</td>
                                    <td class="py-3 px-4 text-gray-700 dark:text-gray-300">{{ $doc->reason ?: '-' }}</td>
                                @else
                                    <td class="py-3 px-4 text-gray-700 dark:text-gray-300">{{ $doc->supplier_name ?: '-' }}</td>
                                @endif
                                <td class="py-3 px-4 text-center font-semibold text-gray-900 dark:text-white">
                                    {{ $doc->items->count() }}
                                </td>
                                <td class="py-3 px-4 text-center font-bold {{ $isOut ? 'text-rose-600' : 'text-emerald-600' }}">
                                    {{ $isOut ? '-' : '+' }}{{ number_format($doc->items->sum('qty')) }} pcs
                                </td>
                                <td class="py-3 px-4 text-center">
                                    @if($doc->status === 'draft')
                                        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                                            Draft
                                        </span>
                                    @elseif($doc->status === 'posted')
                                        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                                            Posted
                                        </span>
                                    @else
                                        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300">
                                            Dibatalkan
                                        </span>
                                    @endif
                                </td>
                                <td class="py-3 px-4 text-right">
                                    <a href="{{ \App\Filament\Pages\ManageStockDocument::getUrl(['record' => $doc->id]) }}"
                                       class="inline-flex items-center rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 px-3 py-1.5 text-xs font-semibold text-gray-700 dark:text-gray-200 transition">
                                        {{ $doc->isDraft() ? 'Kelola Draf' : 'Lihat Detail' }}
                                    </a>
                                </td>
                            </tr>
                        @empty
                            <tr>
                                <td colspan="{{ $isOut ? 8 : 7 }}" class="py-10 text-center text-sm text-gray-500">
                                    Belum ada dokumen {{ $isOut ? 'stok keluar' : 'stok masuk' }}. Klik tombol <strong>+ Buat {{ $isOut ? 'Stok Keluar' : 'Stok Masuk' }}</strong> untuk memulai.
                                </td>
                            </tr>
                        @endforelse
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</x-filament-panels::page>
