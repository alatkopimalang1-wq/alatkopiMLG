<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('equipment_bundle_slots', function (Blueprint $table) {
            $table->json('category_ids')->nullable()->after('category_id');
        });

        // Backfill existing single category_id into category_ids JSON array
        DB::table('equipment_bundle_slots')
            ->whereNotNull('category_id')
            ->whereNull('category_ids')
            ->get(['id', 'category_id'])
            ->each(function ($row) {
                DB::table('equipment_bundle_slots')
                    ->where('id', $row->id)
                    ->update(['category_ids' => json_encode([(int) $row->category_id])]);
            });
    }

    public function down(): void
    {
        Schema::table('equipment_bundle_slots', function (Blueprint $table) {
            $table->dropColumn('category_ids');
        });
    }
};
